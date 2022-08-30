//estimate Pi using Monte Carlo method
function calcPi(time) {
    let hit = 0
    for (let i = 0; i < time; i++) {
        if (Math.random() ** 2 + Math.random() ** 2 <= 1) hit++
    }
    return hit / time * 4
}
console.time()
console.log(calcPi(10 ** 8))
console.timeEnd()
