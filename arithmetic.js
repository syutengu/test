//求多个正整数的最大公约数
function gcd() {
    //求两数的最大公约数 greatest common divisor //gcd(999,777) -> return 111
    //Euclidean Algorithm ユークリッドの互除法
    function gcd2(a, b) {
        if (b === 0) return a
        return gcd2(b, a % b)
    }
    //对输入的参数逐一执行gcd2
    return Object.values(arguments).filter(e=>!isNaN(e)).reduce((pre,cur,idx)=>gcd2(pre,cur))
}

//求多个正整数的最小公倍数
function lcm(){
    //求两数的最小公倍数 least common multiple
    //最大公约数与最小公倍数的关系 lcm(a,b) = a*b/gcd(a,b)
    function lcm2(a, b) {
        return a * b / gcd(a, b)
    }
    return Object.values(arguments).filter(e=>!isNaN(e)).reduce((pre,cur,idx)=>lcm2(pre,cur))
}

/**手形印紙税の分割
 * @param {Number} excluded 消費税抜きの課税対象金額
 * @returns {Array} [[1st課税対象金額,1st印紙税額],[2nd課税対象金額,2nd印紙税額]...]
 * 印紙税額の一覧表[約束手形または為替手形]
 * https://www.nta.go.jp/taxes/shiraberu/taxanswer/inshi/7140.htm
*/
function splitStampTax(excluded) {
    const COSTPERSHEET = 250 //印紙作成一枚あたりのコスト
    let profit //分割による節税額
    let cost //分割による作業コスト増
    let arr = []//返り配列
    let qty = +excluded//消費税抜き課税対象金額(の計算時残り値)

    if (isNaN(qty) || qty < 0) return
    //10万円未満	非課税
    if (qty < 100000) return [[qty, 0]]
    //10億円を超えるもの	20万円
    if (qty > 1000000000) return [[qty, 200000]]
    //昇順ランキング(10万円以上、10億円以下)
    const RANK = [//[ランク上限値,該当印紙税額]
        [1000000, 200],//10万円以上100万円以下	200円
        [2000000, 400],//100万円を超え200万円以下	400円
        [3000000, 600],// 200万円を超え300万円以下	600円
        [5000000, 1000],// 300万円を超え500万円以下	1千円
        [10000000, 2000],// 500万円を超え1千万円以下	2千円
        [20000000, 4000],// 1千万円を超え2千万円以下	4千円
        [30000000, 6000],// 2千万円を超え3千万円以下	6千円
        [50000000, 10000],// 3千万円を超え5千万円以下	1万円
        [100000000, 20000],// 5千万円を超え1億円以下	2万円
        [200000000, 40000],// 1億円を超え2億円以下	4万円
        [300000000, 60000],// 2億円を超え3億円以下	6万円
        [500000000, 100000],// 3億円を超え5億円以下	10万円
        [1000000000, 150000],// 5億円を超え10億円以下	15万円
    ]
    //降順ランキング
    const DESCRANK = [...RANK].reverse()

    //入力値が上限値以上のランクを降順で見つけて返す
    var searchDescRank = (q) => DESCRANK.find(e => q >= e[0])

    //計算
    //SPLITTING 1 分割せず一枚
    let one = RANK.find(e => +excluded <= e[0])//課税対象金額がランク上限値以下である最初のランクを昇順で見つける
    console.log(`■■■　SPLITTING 1 : 枚数 = 1 AND 印紙税額合計 = ${one[1].toLocaleString()}`)
    console.table([one.map(e=>e.toLocaleString())])

    //SPLITTING N ランク降順通りに可能な限り分割
    while (searchDescRank(qty)) {//見つからないまで繰り返す
        const res = searchDescRank(qty)//入力値（課税対象金額の残り値）が上限値以上のランクを降順で見つけて返す
        arr.push(res)//配列に追加
        qty -= res[0]//課税対象金額の残り値を更新
    }
    //残り値が100万円未満の場合、適用ランクが見つからずループ終了。残り値は10万円未満かどうかを判別して返り配列の末尾に追加
    if (qty > 0) arr.push([qty, qty < 100000 ? 0 : 200])
    //評価
    console.log(`■■■　SPLITTING N : 枚数 = ${arr.length} AND 印紙税額合計 = ${arr.map(e => e[1]).reduce((a, b) => a + b).toLocaleString()}`)
    //分割によって節約できた税額が分割によるコストを下回る場合、あえて分割しない
    profit = one[1] - arr.map(e => e[1]).reduce((a, b) => a + b)
    cost = COSTPERSHEET * (arr.length - 1)
    console.log(`評価：節税額 = ${profit.toLocaleString()} AND 作業コスト = ${cost.toLocaleString()}, ${profit - cost > 0 ? '' : 'NOT'} WORTH SPLITTING N !`)
    console.table(arr.map(e=>e.map(f=>f.toLocaleString())))
    //結果更新
    if (profit <= cost) arr = [[+excluded, one[1]]]//利益がなければ分割しない

    //SPLITTING 2 二(等)分割
    const B = Math.floor(+excluded / 2)//後半
    const A = +excluded % 2 > 0 ? Math.ceil(+excluded / 2) : B //前半
    const BTAX = RANK.find(e => e[0] >= B)[1]//後半税額
    const ATAX = RANK.find(e => e[0] >= A)[1]//前半税額
    console.log(`■■■　SPLITTING 2 : 枚数 = ${2} AND 印紙税額合計 = ${(ATAX + BTAX).toLocaleString()}`)
    //評価
    profit = arr.map(e => e[1]).reduce((a, b) => a + b) - (BTAX + ATAX)
    cost = COSTPERSHEET * (2 - arr.length)
    console.log(`評価：節税額 = ${profit.toLocaleString()} AND 作業コスト = ${cost.toLocaleString()}, ${profit - cost > 0 ? '' : 'NOT'} WORTH SPLITTING 2 !`)
    //結果更新
    //二(等)分割が現状よりもさらに利益が出る場合だけ、二(等)分割する
    if (profit - cost > 0) arr = [[A, ATAX], [B, BTAX]]
    //利益がこれ以上でないが現状より印紙の枚数を減らせるのであれば、二(等)分割する
    else if (profit === cost && arr.length > 2) arr = [[A, ATAX], [B, BTAX]]
    console.table([[A, ATAX], [B, BTAX]].map(e=>e.map(f=>f.toLocaleString())))

    console.log('■■■　結果　■■■')
    return arr.map(e=>e.map(f=>f.toLocaleString()))
}
console.table(splitStampTax(987654321))

/**四捨五入(４以下切り下げ、５以上切り上げ)
 * (num,digits)=>Math.round(num*10**digits)/10**digits　と同じ
 * @param {Number} num 
 * @param {Number} digits 
 */
function round(num, digits = 0) {
    //validate
    if (typeof num !== 'number' || typeof digits !== 'number') return NaN
    var digits = parseInt(digits)
    const sign = num > 0 ? 1 : -1//負数対応
    //handling
    let res = parseInt(num * 10 ** digits + .5 * sign) / 10 ** digits
    return res
}
// console.log(round(1.3))//return 1
// console.log(round(-1.3))//return -1
// console.log(round(1.7))//return 2
// console.log(round(-1.7))//return -2

/**切り上げ
 * (num,digits)=>Math.ceil(num*10**digits)/10**digits　と同じ
 * @param {Number} num 
 * @param {Number} digits 
 */
function roundup(num, digits = 0) {
    //validate
    if (typeof num !== 'number' || typeof digits !== 'number') return NaN
    var digits = parseInt(digits)
    //まず四捨五入
    const rounded = round(num, digits)
    // console.log(num, num > rounded ? '>' : '<', rounded)
    let res
    //四捨五入の結果が切り下げとなれば、+/-1*10**-digitsで補正
    if (num >= 0) res = num > rounded ? rounded + 1 * 10 ** -digits : rounded//正数
    else res = num < rounded ? rounded - 1 * 10 ** -digits : rounded//負数
    //0.1 + 0.2 -> 0.30000000000000004 javascriptの小数計算の誤差を補正するためにNumber.toFixed()メソッドを使用
    // 小数計算の誤差　https://blog.apar.jp/program/8900/
    // IEEE Standard for Floating-Point Arithmetic　二进制浮点数算术标准　 https://ja.wikipedia.org/wiki/IEEE_754
    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    /* The number of digits to appear after the decimal point; 
    this may be a value between 0 and 20, inclusive, 
    and implementations may optionally support a larger range of values. 
    If this argument is omitted, it is treated as 0. */
    //返り値を指定精度まで（指定精度以降は捨てる）文字列化してさらに数値化して返す
    res = +res.toFixed(digits < 0 ? 0 : digits > 20 ? 20 : digits)
    return res
}
// console.log(roundup(1.3))//return 2
// console.log(roundup(-1.3))//return -2
// console.log(roundup(1.7))//return 2
// console.log(roundup(-1.7))//return -2

/**切り捨て（EXCEL関数ROUNDDOWN風に、正負とも同じ数字を出すために）
 * (num,digits)=>Math.trunc(num*10**digits)/10**digits　切り捨てと同じ
 * (num,digits)=>Math.floor(num*10**digits)/10**digits　切り下げと違う
 * @param {Number} num 
 * @param {Number} digits 
 */
function rounddown(num, digits = 0) {
    if (typeof num !== 'number' || typeof digits !== 'number') return NaN
    var digits = parseInt(digits)
    const rounded = round(num, digits)
    // console.log(num, num > rounded ? '>' : '<', rounded)
    let res
    //四捨五入の結果が切り上げとなれば、+/-1*10**-digitsで補正
    if (num >= 0) res = num < rounded ? rounded - 1 * 10 ** -digits : rounded//正数
    else res = num > rounded ? rounded + 1 * 10 ** -digits : rounded//負数
    res = +res.toFixed(digits < 0 ? 0 : digits > 20 ? 20 : digits)
    return res
}
console.log(rounddown(1.3))//return 1
console.log(rounddown(-1.3))//return -1
console.log(rounddown(1.7))//return 1
console.log(rounddown(-1.7))//return -1

//最大安全整数定数
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
/* Double precision floating point format only has 52 bits to represent the mantissa, 
so it can only safely represent integers between -(2**53 – 1) and 2**53 – 1. 
"Safe" in this context refers to the ability to represent integers exactly and to compare them correctly. 
For example, Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2 will evaluate to true, which is mathematically incorrect. */
console.log(Number.MAX_SAFE_INTEGER)// expected output: 9007199254740991
console.log(Number.MAX_SAFE_INTEGER + 1)// expected output: 9007199254740992
console.log(Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2)// expected output: true
// 100.999999999999999 === 101 //true


/**モンテカルロ法で円周率の近似値を求める
 * estimate Pi using Monte Carlo method
 * @param {Number} time 
 * @returns {Number}
 */
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

/**beginからendまでの数から素数を見つける
 * @param {Number} end 終わりの数
 * @param {Number} begin 始まりの数
 * @return {Array} 見つけた素数の配列
 */
function getPrimeNumber(end, begin = 0) {
    //返す結果の配列
    let res = []
    //整数化
    var begin = parseInt(begin)
    var end = parseInt(end)
    //始まりが整数でなければ、始まりを０にする
    if (!Number.isInteger(begin)) begin = 0
    //終わりが整数でなければ、空の配列を返す
    if (!Number.isInteger(end)) return res
    //endよりもbeginのほうが大きければスワップ (swap two variables)
    if (begin > end) end = [begin, begin = end][0]
    //範囲内でループして見つけた素数を配列に入れる
    for (let i = begin; i < end; i++) {
        if (isPrimeNumber(i)) res.push(i)
    }
    //結果を返す
    return res
}
// console.log(getPrimeNumber(10, 100))


//範囲指定して乱数を生成(minとmaxを含む)
function genRandomInt(min, max) {
    var min = Math.floor(min)
    var max = Math.floor(max + 1)
    return Math.floor(Math.random() * (max - min) + min)
}


/* 魔方陣 Magic Square
狭義:n行n列のマスに 1からn**2までの連続自然数を逐一いれて、すべての行、列、そして２つの対角線上の数の和が等しくなるもの
※全体の回転（rorate）または裏返し(reflect)は同一解と見做す
定和 === n*(n**2+1)/2
e.g.[8, 1, 6, 3, 5, 7, 4, 9, 2]は狭義的３次魔方陣の唯一の解である

広義:必ずしも連続的でない自然数からなる魔方陣
e.g.[244,649,82,163,325,487,568,1,406]
*/

/**配列は魔方陣かどうかを判断
 * @param {Array} arr 配列で入力
 * @param {Boolean} strict 狭義かどうかを指定
 * @returns {Boolean} 真偽を返す
 */
function isMagicSquare(arr, strict = false) {
    //n次
    const n = Math.sqrt(arr.length)
    if (!Number.isInteger(n)) return false
    //配列は連続自然数かどうかを判断
    if (strict && !isConsecutiveNaturalNumbers(arr)) return false
    //定和
    const sum = strict ? n * (n ** 2 + 1) / 2 : arr.filter((e, i) => i < n).reduce((a, b) => a + b)
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
// const t3Broad = [244, 649, 82, 163, 325, 487, 568, 1, 406]//3*3広義
// const t3 = [8, 1, 6, 3, 5, 7, 4, 9, 2] //3*3
// const t4 = [1, 2, 15, 16, 13, 14, 3, 4, 12, 7, 10, 5, 8, 11, 6, 9] //4*4
// const t5 = [11, 24, 7, 20, 3, 4, 12, 25, 8, 16, 17, 5, 13, 21, 9, 10, 18, 1, 14, 22, 23, 6, 19, 2, 15] //5*5
// console.log(t3Broad, isMagicSquare(t3Broad, true))
// console.log(t3, isMagicSquare(t3, true))
// console.log(t4, isMagicSquare(t4, true))
// console.log(t5, isMagicSquare(t5, true))

// 配列は連続自然数かどうかを判断
function isConsecutiveNaturalNumbers(arr) {
    if (!Array.isArray(arr) || !arr.length) return false
    let found
    //is nautral number
    found = arr.find(e => e < 1 || !Number.isInteger(e))
    if (found !== undefined) return false
    //is consecutive
    let sorted = [...arr].sort((a, b) => a - b)
    found = sorted.find((e, i) => i === sorted.length - 1 ? false : sorted[i + 1] - e !== 1)
    return found === undefined
}

/* （pending）長さn*nの乱数配列を生成し、魔方陣であるかどうかを判断
課題：
１．複数の乱数を範囲指定して生成する　→　当たる確率の高い範囲を考えないと効率悪い
２．乱数配列が魔方陣に当たる確率はそもそも非常に低い（モンテカルロ法的なやり方は有効な手段？）
 */
/**（未完成）乱数から広義的n次魔方陣を生成
 * @param {Integer} n n次。とりあえず３次をやってみる。
 * @returns {Array} 広義的n次魔方陣
 */
function generateMagicSquare(n = 3) {
    let res = []

    return res
}


/**（未完成）ｎ次魔方陣(狭義)のすべての解を配列で返す
 * @param {Integer} n 自然数
 */
function getMagicSquare(n) {
    let res = []
    //5次魔方陣の解は275305224個もあって、それ以上はスーパーコンピューターの世界だから割愛
    if (n > 4 || n < 1 || !Number.isInteger(n)) return res
    //1次
    if (n === 1) return [[n]]
    //2次（存在しない）
    if (n === 2) return res
    //3次と4次
    let sum = n * (n ** 2 + 1) / 2

    // for (let i = 0; i < n; i++) {
    //     console.log(i = ${i})
    //     for (let j = 0; j < n; j++) {
    //         console.log(    j = ${j})
    //     }
    // }
    let tmp = []
    for (let a = 1; a < n ** 2; a++) {//c1
        // console.log(a)
        if (tmp.includes(a)) continue //如已在临时数列中则跳过继续
        tmp.push(a)
        for (let b = 1; b < n ** 2; b++) {//c2
            if (tmp.includes(b)) continue //如已在临时数列中则跳过继续
            tmp.push(b)
            for (let c = 1; c < n ** 2; c++) {//c3
                if (tmp.includes(c)) continue //如已在临时数列中则跳过继续
                let eor = sum - tmp[tmp.length - 2] - tmp[length - 1] - c //计算各行最后一列 end of row  = 定和 - 各行第一列 - 各行第二列 - c
                if (tmp.includes(eor) || eor > n ** 2) continue //如果eor已在临时数列，或者eor大于n**2，则跳过继续
                tmp.push(eor)
                //...
            }
        }
    }

    // isMagicSquare(arr)

    // arr.map(e => {
    //     const rest = arr.filter(f => f !== e)
    //     if (rest.length === 1) return
    //     else isMagicSquare()
    // })
}
// getMagicSquare(4)
