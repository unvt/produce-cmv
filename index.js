// libraries
const config = require('config')
const { spawn } = require('child_process')
const fs = require('fs')
const Queue = require('better-queue')
const pretty = require('prettysize')
const TimeFormat = require('hh-mm-ss')
const { Pool, Query } = require('pg')
const Spinner = require('cli-spinner').Spinner
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const modify = require('./modify.js')

// config constants
const relations = config.get('relations')
const pmtilesDir = config.get('pmtilesDir')
const logDir = config.get('logDir')
const spinnerString = config.get('spinnerString')
const fetchSize = config.get('fetchSize')
const tippecanoePath = config.get('tippecanoePath')


// global configurations
Spinner.setDefaultSpinnerString(spinnerString)
winston.configure({
  level: 'silly',
  format: winston.format.simple(),
  transports: [ 
    new DailyRotateFile({
      filename: `${logDir}/produce-clearmap-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
  ]
})

// global variable
let idle = true
let modules = {}
let pools = {}
let productionSpinner = new Spinner()
let moduleKeysInProgress = []

const isIdle = () => {
  return idle
}

const iso = () => {
  return (new Date()).toISOString()
}

const noPressureWrite = (downstream, f) => {
  return new Promise((res) => {
    if (downstream.write(`\x1e${JSON.stringify(f)}\n`)) {
      res()
    } else {
      downstream.once('drain', () => { 
        res()
      })
    }
  })
}

const fetch = (client, database, schema, table, downstream) => {
  return new Promise((resolve, reject) => {
    let count = 0
    let features = []
    client.query(new Query(`FETCH ${fetchSize} FROM cur`))
    .on('row', row => {
      let f = {
        type: 'Feature',
        properties: row,
        geometry: JSON.parse(row.st_asgeojson)
      }
      delete f.properties.st_asgeojson
      f.properties._database = database
      f.properties._schema = schema
      f.properties._table = table
      count++
      f = modify(f)
      if (f) features.push(f)
    })
    .on('error', err => {
      console.error(err.stack)
      reject()
    })
    .on('end', async () => {
      for (f of features) {
        try {
          await noPressureWrite(downstream, f)
        } catch (e) {
          reject(e)
        }
      }
      resolve(count)
    })
  })
}

const dumpAndModify = async (relation, downstream, moduleKey) => {
  return new Promise((resolve, reject) => {
    const [database, schema, table] = relation.split('::')
    if (!pools[database]) {
      pools[database] = new Pool({
        host: config.get(`connection.${database}.host`),
        user: config.get(`connection.${database}.dbUser`),
        port: config.get(`connection.${database}.port`),
        password: config.get(`connection.${database}.dbPassword`),
        database: database
      })
    }
    pools[database].connect(async (err, client, release) => {
      if (err) throw err
      let sql = `SELECT column_name FROM information_schema.columns WHERE table_name='${table}' AND table_schema='${schema}' ORDER BY ordinal_position`
      let cols = await client.query(sql)
      cols = cols.rows.map(r => r.column_name).filter(r => r !== 'geom')
      //cols = cols.filter(v => !propertyBlacklist.includes(v))
      //test--------------------------
      if (table == 'unmap_wbya10_a'){
        cols.push(`ST_Area(${schema}.${table}.geom) AS areacalc`)
        cols.push(`ST_Length(${schema}.${table}.geom) AS lengthcalc`)
      }
      if (table == 'unmap_dral10_l'){
        cols.push(`ST_Length(${schema}.${table}.geom) AS lengthcalc`)
      }     
      //until here--------------------
      cols.push(`ST_AsGeoJSON(${schema}.${table}.geom)`)
      await client.query(`BEGIN`)
      sql = `
      DECLARE cur CURSOR FOR 
      SELECT ${cols.toString()} FROM ${schema}.${table}` 
      cols = await client.query(sql)
      try {
        while (await fetch(client, database, schema, table, downstream) !== 0) {}
      } catch (e) {
        reject(e)
      }
      await client.query(`COMMIT`)
      console.log(`${iso()}: finished ${relation} of Area ${moduleKey}`)
      winston.info(`${iso()}: finished ${relation} of ${moduleKey}`)
      release()
      resolve()
    })
  })
}

const sleep = (wait) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve() }, wait)
  })
}

const queue = new Queue(async (t, cb) => {
  const startTime = new Date()
  const moduleKey = t.moduleKey //0-0-0
  const tmpPath = `${pmtilesDir}/part-${moduleKey}.pmtiles`
  const dstPath = `${pmtilesDir}/${moduleKey}.pmtiles`

  moduleKeysInProgress.push(moduleKey)
  productionSpinner.setSpinnerTitle(moduleKeysInProgress.join(', '))

  const tippecanoe = spawn(tippecanoePath, [
    '--quiet',
    '--no-feature-limit',
    '--no-tile-size-limit',
    '--force',
    '--simplification=2',
    '--drop-rate=1',
    '--minimum-zoom=0',
    '--maximum-zoom=5',
    '--base-zoom=5',
    '--hilbert',
    `--output=${tmpPath}`
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  tippecanoe.on('exit', () => {
    fs.renameSync(tmpPath, dstPath)
    moduleKeysInProgress = moduleKeysInProgress.filter((v) => !(v === moduleKey))
    productionSpinner.stop()
    process.stdout.write('\n')
    const logString = `${iso()}: process ${moduleKey} (${pretty(fs.statSync(dstPath).size)}) took ${TimeFormat.fromMs(new Date() - startTime)} .`
    winston.info(logString)
    console.log(logString)
    if (moduleKeysInProgress.length !== 0) {
      productionSpinner.setSpinnerTitle('0-0-0')
      productionSpinner.start()
    }
    return cb()
  })

  productionSpinner.start()
  for (relation of relations) {
    while (!isIdle()) {
      winston.info(`${iso()}: short break due to heavy disk writes.`)
      await sleep(5000)
    }
    try {
      await dumpAndModify(relation, tippecanoe.stdin, moduleKey)
    } catch (e) {
      winston.error(e)
      cb(true)
    }
  }
  tippecanoe.stdin.end()
}, { 
  concurrent: 1, 
  maxRetries: 3,
  retryDelay: 1000 
})

// push queue
const queueTasks = () => {
  for (let moduleKey of ['0-0-0']) {  // For global, only one push!
    queue.push({
        moduleKey: moduleKey
    })
  }
}

// shutdown system
const shutdown = () => {
  winston.info(`${iso()}: production system shutdown.`)
  console.log('** production system for clearmap shutdown! **')
}

// main
const main = async () => {
  winston.info(`${iso()}: clearmap production started.`)
  queueTasks()
  queue.on('drain', () => {
    shutdown()
  })
}

main()