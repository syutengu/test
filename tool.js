export function escapeHTML(str) {
    str = str.replace(/&/g, '&amp;')
    str = str.replace(/</g, '&lt;')
    str = str.replace(/>/g, '&gt;')
    str = str.replace(/"/g, '&quot;')
    str = str.replace(/'/g, '&#39;')
    return str
}

/**解析csv文本，返回数组
 * @param {String} text 待解析的文本
 * @returns {Array} 解析后的数组
 */
export function parseCSV(text) {
    let res = text.trim()
    //替换excel中的单元格内换行
    res = res.replace(/"(.*)\n(.*)"/g, '$1 $2')
    //windows \r\n
    //linux \n
    //mac \r
    //分割行
    res = res.split(/\r\n|\n/g)
    //分割后行数为0，则返回空数组
    if (res.length === 0) return []
    //逐行转义、转换分隔符"\t"为逗号、分割逗号
    res = res.map(l => escapeHTML(l).replace(/\t/g, ',').split(','))
    return res
}

/**分类汇总
 * @param {Array} options.data 不带有标题行的原始数据二维数组
 * @param {Array} options.clms 标题数组
 * @param {String} options.row 分类字段名称
 * @param {String} options.value 汇总字段名称
 * @param {Boolean} options.sort 排序
 * @param {Boolean} options.returnString 返回以/t和/r/n分割的字符串
 * @returns {Array | String}
 */
export function summarize(options) {
    if (!Array.isArray(options.data) || !Array.isArray(options.clms)) return []
    const data = options.data
    const clms = options.clms
    const rowIdx = clms.indexOf(options.row)
    const valIdx = clms.indexOf(options.value)
    let res = [...new Set(data.map(e => e[rowIdx]))]
    //sort
    if (options.sort !== undefined) res = res.sort((a, b) => typeof a === 'number' && typeof b === 'number' ? a - b : a.localeCompare(b))
    if (!options.sort) res = res.reverse()
    //summarize
    res = res.map(e => {
        const sum = data.filter(f => f[rowIdx] === e).map(e => +e[valIdx]).reduce((a, b) => a + b, 0)
        return sum === 0 ? null : [e, sum]
    }).filter(e => e)
    // console.log(res)
    if (options.returnString) res = res.map(e => e.join('\t')).join('\r\n')
    return res
}
