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
