const config = require('config')
const { Pool, Query } = require('pg')

// config constants
const relations = config.get('relations')

let pools = {}

for (relation of relations){
    const [database, schema, view] = relation.split('::')
    if(!pools[database]){
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
        let sql = `SELECT count(*) FROM ${schema}.${view} `
        //let sql = `SELECT * FROM ${schema}.${view} limit 1`
        let res = await client.query(sql)
        console.log(`${database}-${schema}-${view}`)
        console.log(res.rows) //rows contains sql response
        await client.end()
        release()
    })    
}