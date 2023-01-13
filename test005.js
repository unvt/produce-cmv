const config = require('config')
const { Pool, Query } = require('pg')
const modify = require('./modify.js')
const fs = require('fs')

// config constants
const relations = config.get('relations')
const fetchSize = config.get('fetchSize')
const outTextDir = config.get('outputDir')

let pools = {}

const noPressureWrite = (stream, f) => {
    return new Promise((res) => {
        if (stream.write(`\x1e${JSON.stringify(f)}\n`)){
            res()
        } else {
            stream.once('drain', () => {
                res()
            })
        }
    })
}

const fetch = (client, database, view, stream) =>{
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
            f.properties._view = view
            f.properties._table = view
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
                    //console.log(f)
                    await noPressureWrite(stream, f)
                } catch (e) {
                    throw e
                }                
            } 
            stream.end()
            resolve(count)
        })
    })
}



for (relation of relations){
    var startTime = new Date()
    const [database, schema, view] = relation.split('::')
    const stream = fs.createWriteStream(`${outTextDir}/${database}-${schema}-${view}.txt`)
    if(!pools[database]){
        pools[database] = new Pool({
            host: config.get(`connection.${database}.host`),
            user: config.get(`connection.${database}.dbUser`),
            port: config.get(`connection.${database}.port`),
            password: config.get(`connection.${database}.dbPassword`),
            database: database
        })
    }
    pools[database].connect(async (err, client,release) => {
        if (err) throw err
        //Getting the list of columns, then adjust it
        let sql = `SELECT column_name FROM information_schema.columns WHERE table_schema = '${schema}' AND table_name = '${view}' ORDER BY ordinal_position`
        let cols = await client.query(sql)
        cols = cols.rows.map(r => r.column_name).filter(r => r !== 'geom') //choose "rows", then its colum_names are listed, and geom is removed.
        //we will add filter if needed
        cols.push(`ST_AsGeoJSON(${schema}.${view}.geom)`)
        //console.log(`columns used: ${cols}`)
        // Then, we will get feature record.
        await client.query('BEGIN')
        sql = `
        DECLARE cur CURSOR FOR 
        SELECT ${cols.toString()} FROM ${schema}.${view}`
        cols = await client.query(sql)
        //console.log(cols.rows)
        try {
            while (await fetch(client, database, view, stream) !== 0) {}
        } catch (e) { throw e }
        await client.query(`COMMIT`)
        //await client.end()  
        const endTime = new Date()
        var diff = endTime.getTime() - startTime.getTime();
        var workTime = diff / 1000
        console.log(`workingTime for ${schema}.${view} in ${database} is ${workTime} (sec). End`)
        release()
    })    
}