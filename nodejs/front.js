/**使用fetch API 传输json格式数据
 * @param {String} url url
 * @param {Object} data data
 * @param {Boolean} isJSON is JSON format
 * @returns {JSON | String} 如果可以解析为JSON格式则解析后返回，否则直接返回
 */
export async function post(url, data, isJSON = true) {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    const body = isJSON ? JSON.stringify(data) : data
    const res = await fetch(url, {
        method: 'POST',
        headers,//nodejs 需要
        body,
    })
    try {
        return await res.json()
    } catch (err) {
        return res
    }
}

/**创建前台indexedDB链接
 * @param {String} DBNAME 数据库名
 * @param {Object} TBLS 新创建表的数据
 * @example
 * - {tblName1:{data1,options1},...}
 * - {Object} data 表数据
 * - {Object} options 参数设定
 * - {String} options.keyPath 主键名称，可缺省
 * - {Boolean:false} options.autoIncrement 是否自增，缺省为false
 * @returns {Promise} 数据库链接实体
 */
export async function IDB(DBNAME, TBLS) {
    return new Promise(resolve => {
        let connection = indexedDB.open(DBNAME)
        //数据库不存在或版本更新时，创建数据（仅新建数据库或版本更新时才会触发）
        connection.onupgradeneeded = evt => {
            const db = evt.target
            //循环创建各表并填入数据
            Object.keys(TBLS).map(tblName => {
                const data = TBLS[tblName].data
                const options = TBLS[tblName].options
                // console.log(tblName, data, options)
                // https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/createObjectStore
                db.result.createObjectStore(tblName, options)
                const transaction = db.transaction //新建表已开启transaction且具有读写权限
                // let transaction = db.transaction(dbName, 'readwrite') //不可同时重复开启transaction
                const store = transaction.objectStore(tblName)//等同于table
                //表初始化 写入初始数据
                if (Array.isArray(data)) {
                    data.map(e => {
                        store.add(e)
                        // let res = store.add(e)
                        //如果成功应该会返回新建记录的id
                        // res.onsuccess = evt => console.log(req.result)
                        // res.onerror = evt => console.log(req.error)
                    })
                }
                else {
                    store.add(data)
                }
            })
        }
        connection.onerror = evt => console.error(evt.target.error)
        //建立连接请求成功，读取ITMES
        connection.onsuccess = evt => {
            const connected = evt.target.result
            const result = {
                R, C, U, D
            }
            resolve(result)

            //获取全表数据 READ
            function R(tblName, data) {
                return new Promise(resolve => {
                    let transaction = connected.transaction(tblName, 'readonly')
                    let store = transaction.objectStore(tblName)
                    // get(id) return object
                    // return array
                    // getAll(IDBKeyRange.bound(3,5)) //3<=id<=5
                    // getAll(IDBKeyRange.upperBound(5,true)) //id<5
                    // getAll(IDBKeyRange.lowerBound(3,false)) //id>=3
                    let res = store.getAll(data?.id)
                    res.onsuccess = evt => {
                        resolve(evt.target.result)
                    }
                })
            }
            //创建数据 CREATE
            function C(tblName, data) {
                return new Promise(resolve => {
                    let transaction = connected.transaction(tblName, 'readwrite')
                    let store = transaction.objectStore(tblName)
                    store.add(data).onsuccess = evt => {//不可覆盖已存在记录
                        resolve(evt.target.result)//返回新建记录id
                    }
                })
            }
            //更新 UPDATE
            function U(tblName, data) {
                return new Promise(resolve => {
                    let transaction = connected.transaction(tblName, 'readwrite')
                    let store = transaction.objectStore(tblName)
                    store.put(data).onsuccess = evt => {//可覆盖已存在记录
                        resolve(evt.target.result)
                    }
                })
            }
            //删除 DELETE
            function D(tblName, id) {
                return new Promise(resolve => {
                    let transaction = connected.transaction(tblName, 'readwrite')
                    let store = transaction.objectStore(tblName)
                    store.delete(id).onsuccess = evt => {
                        resolve(evt.target.result)
                    }
                })
            }
        }
    })
}
