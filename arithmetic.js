/**配列は魔方陣かどうかを判断
 * @param {Array} arr 配列で入力
 * @returns {Boolean} 真偽を返す
 */
function isMagicSquare(arr) {
    //n次
    const n = Math.sqrt(arr.length)
    if (!Number.isInteger(n)) return false
    //定和
    const sum = n * (n ** 2 + 1) / 2
    if (!Number.isInteger(sum)) return false
    //対角線の和を０に初期化
    let diagonal1Sum = 0 //対角線＼
    let diagonal2Sum = 0//対角線／
    for (let i = 0; i < n; i++) {
        //行と列の和を０に初期化
        let rowSum = 0
        let clmSum = 0
        for (let j = 0; j < n; j++) {
            // console.log(i * n + j, i + j * n, i === j ? i * n + j : null, i === j ? (i + 1) * n - j - 1 : null)
            //各行の和を求める
            rowSum += arr[i * n + j]
            //各列の和を求める
            clmSum += arr[i + j * n]
            //対角線の和求める
            if (i === j) diagonal1Sum += arr[i * n + j]
            if (i === j) diagonal2Sum += arr[(i + 1) * n - j - 1]
        }
        // console.log(rowSum, clmSum)
        if (rowSum !== sum || clmSum !== sum) return false
    }
    if (diagonal1Sum !== sum || diagonal2Sum !== sum) return false
    return true
}
// const t3 = [8, 1, 6, 3, 5, 7, 4, 9, 2] //3*3
// const t4 = [1, 2, 15, 16, 13, 14, 3, 4, 12, 7, 10, 5, 8, 11, 6, 9] //4*4
// const t5 = [11, 24, 7, 20, 3, 4, 12, 25, 8, 16, 17, 5, 13, 21, 9, 10, 18, 1, 14, 22, 23, 6, 19, 2, 15] //5*5
// console.log(t3, isMagicSquare(t3))
// console.log(t4, isMagicSquare(t4))
// console.log(t5, isMagicSquare(t5))


/**startからendまでの数から素数を見つける
 * @param {Number} end 終わりの数
 * @param {Number} start 始まりの数
 * @return {Array} 見つけた素数の配列
 */
function getPrimeNumber(end, start = 0) {
    //返す結果の配列
    let res = []
    //整数化
    var start = parseInt(start)
    var end = parseInt(end)
    //始まりが整数でなければ、始まりを０にする
    if (!Number.isInteger(start)) start = 0
    //終わりが整数でなければ、空の配列を返す
    if (!Number.isInteger(start) || !Number.isInteger(end)) return res
    //endよりもstartのほうが大きければスワップ (swap two variables)
    if (start > end) end = [start, start = end][0]
    //範囲内でループして見つけた素数を配列に入れる
    for (let i = start; i < end; i++) {
        if (isPrimeNumber(i)) res.push(i)
    }
    //結果を返す
    return res
}
// console.log(getPrimeNumber(10, 100))


//素数であるかどうかを判断
function isPrimeNumber(num) {
    // 排除非整数与1
    if (!Number.isInteger(num) || num < 2) return false
    // if (num > 3 && num % 2 === 0) return false //4以上の偶数はすべて合成数
    // if (num > 9 && [0, 2, 4, 5, 6, 8].includes(num % 10)) return false　//２桁以上で一の位が0,2,4,5,6,8である整数はすべて合成数
    // if (num > 9 && num.toString().split('').reduce((a, b) => +a + +b) % 3 === 0) return false //２桁以上3の倍数はすべて合成数

    //除数从2起逐一递增求余
    // for (let i = 2; i < num; i++) {
    //     if (num % i === 0) return false
    // }
    //优化：如果无法找到小于某数平方根的因数，则该数必为质数
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false
    }

    return true
}

//モンテカルロ法で円周率の近似値を求める
//estimate Pi using Monte Carlo method
function calcPi(time) {
    let hit = 0
    for (let i = 0; i < time; i++) {
        if (Math.random() ** 2 + Math.random() ** 2 <= 1) hit++
    }
    return hit / time * 4
}
// console.time()
// console.log(calcPi(10 ** 8))
// console.timeEnd()

//nの階乗
function factorialize(n) {
    return n < 0 ? n : n === 0 ? 1 : n * factorialize(n - 1)
}
// console.log(factorialize(16))
