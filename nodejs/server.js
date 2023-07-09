//没有必要使用es6 module和import，很多组件不支持import
require('dotenv').config()
const HOSTNAME = process.env.HOST
const PORT = process.env.PORT
const PATH = require('path')
const express = require('express')
const APP = express()

//无需切断mysql连接
// https://stackoverflow.com/questions/20692989/node-mysql-where-does-connection-end-go
// connection.end() is then supposed to be called only when you stop sending queries to MySQL, 
// i.e. when your application is stopping. 
// You shouldn't create/end connections all the time: 
// just use the same connection for all your queries (or use a connection pool to be more efficient).
const MYSQL = require('mysql')
const CONNECTION = MYSQL.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
})
CONNECTION.connect(err => {
    if (err) return console.log(err.stack)
    console.log(`database connection success, id = ${CONNECTION.threadId}`)
})

//文件操作模块（异步）
const fs = require('node:fs/promises')
// const { connect } = require('http2')

//中间件
APP.use(express.static('public'))
// app.use(express.urlencoded({extended:false}))
APP.use(express.json())


//路由
APP.get('/favicon.ico', (req, res) => { })
APP.get('/', (req, res) => {
    // res.send('Hello World!!')
    res.sendFile(PATH.join(__dirname, '/public/index.html'))
})
APP.get('/arithmetic', (req, res) => res.sendFile(PATH.join(__dirname, '/public/arithmetic/arithmetic.html')))
APP.get('/table', (req, res) => res.sendFile(PATH.join(__dirname, '/public/tbl/tbl.html')))
APP.get('/about', (req, res) => {
    res.send('This is about page.')
})
APP.get('/file', async (req, res) => {
    const file = await fs.readFile('./public/senjimon.txt', 'utf8')
    res.send(file)
})
APP.get("*", (req, res) => {
    console.log(req.query)
    res.send(JSON.stringify(req.query))
})

APP.post('/result', (req, res) => {
    // console.log(req.body)
    const str = `${JSON.stringify(req.body)} -- responsed by ${HOSTNAME}:${PORT}`
    res.send(str)
})
//DATABASE QUERY
APP.post('/db', async (request, response) => {
    let arr = request.body
    const isA = Array.isArray(arr)
    if (!isA) arr = [arr]
    try {
        // connection.beginTransaction()
        await beginTransaction(CONNECTION)
        //返回结果
        let returns = []
        for await (const e of arr) {
            // console.log(e)
            const crud = e.crud
            const tbl = e.tbl
            const pkvs = e.pkvs ?? {}//主键键值对
            const data = e.data ?? {}
            let sql, where, keys, vals
            switch (crud) {
                //⚪增CREATE
                case 'c':
                    // delete data[data._primes]//剔除主键值
                    delete data._primes //剔除主键名
                    keys = Object.keys(data)
                    vals = Object.values(data).map(e => `'${e}'`)//需要用单引号包围文本
                    sql = `INSERT INTO ${tbl} ( ${keys} ) VALUES ( ${vals} )`
                    break
                //🟢查READ
                case 'r':
                    keys = Object.keys(data).filter(k => data[k])
                    where = `${keys.length > 0 ? ' WHERE ' : ''}${keys.map(k => k + " LIKE '%" + data[k] + "%' AND ").join().replace(/ AND $/, '')}`
                    sql = `SELECT * FROM ${tbl}${where}`
                    break
                //🔴删DELETE
                case 'd':
                    sql = `DELETE FROM ${tbl}`
                    Object.keys(data).map(k => where = (where ?? ' WHERE') + ` ${k}='${data[k]}' AND`)
                    sql += where.replace(/ AND$/g, '')
                    break
                //🟠改UPDATE
                case 'u':
                    sql = `UPDATE ${tbl} SET`
                    Object.keys(data).map(k => sql += ` ${k}='${data[k]}', `)
                    sql = sql.replace(/, $/g, '')
                    Object.keys(pkvs).map(k => where = (where ?? ' WHERE') + ` ${k}='${pkvs[k]}' AND`)
                    sql += where.replace(/ AND$/g, '')
                    break
            }
            console.log(sql)
            const re = await query(CONNECTION, sql)
            // console.log(re)
            switch (crud) {
                // response:{
                //     fieldCount:0,
                //     affectedRows:1,
                //     insertId:123,
                //     serverStatus:2,
                //     warningCount:0,
                //     message:"",
                //     poroto141:true,
                //     changedRows:0,
                // }
                case 'c':
                    isA ? returns.push({ [tbl]: re.insertId }) : returns = { tbl: re.insertId }
                    break
                case 'r':
                    returns = re
                    break
                case 'u':
                    returns.push(re.changedRows)
                    break
                case 'd':
                    returns.push(1)
                    //express deprecated res.send(status): Use res.sendStatus(status) instead server.js:134:18 node:internal/errors:477
                    // returns = Array.isArray(returns) ? 0 : (returns + 1)
                    break
            }
        }
        //确认修改
        await commit(CONNECTION)
        //返回结果
        response.send(returns)
    } catch (err) {
        //回滚
        await rollback(CONNECTION, err)
    }

    //异步化
    function beginTransaction(connection) {
        return new Promise((resolve, reject) => {
            connection.beginTransaction(err => err ? reject(err) : resolve())
        })
    }
    // params用于指定sql语句中的值
    // https://github.com/mysqljs/mysql#performing-queries
    function query(connection, sql, params) {
        return new Promise((resolve, reject) => {
            connection.query(sql, params, (err, results, fields) => {
                if (err) response.send(err)//err对象传回前台
                err ? reject(err) : resolve(results, fields)
            })
        })
    }
    function commit(connection) {
        return new Promise((resolve, reject) => {
            connection.commit(err => err ? reject(err) : resolve(err))
        })
    }
    function rollback(connection, err) {
        return new Promise((resolve, reject) => {
            connection.rollback(() => reject(err))
        })
    }
})
//FILE SYSTEM
APP.post('/file', async (req, res) => {
    const file = await fs.readFile('./public/senjimon.txt', 'utf8')
    res.send(file)
})


//服务器开始监听请求
APP.listen(PORT, () => {
    console.log(`Nodejs Express Server running at http://${HOSTNAME}:${PORT}/`)
})
