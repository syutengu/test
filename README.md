# arithmetic.js
[算数問答](https://github.com/syutengu/test/blob/master/arithmetic.js)


---

# memo
## Miscellaneous
祝日（csvあり）
https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html

全国地方公共団体コード（pdf,csvあり）
https://www.soumu.go.jp/denshijiti/code.html

郵便番号から住所を調べるAPI
https://api.excelapi.org/post/address?zipcode=5630023


## Fonts
Source Han Code JP
https://github.com/adobe-fonts/source-han-code-jp

源ノ角ゴシック（げんのかくごしっく）
https://github.com/adobe-fonts/source-han-sans/blob/master/README-JP.md

'Source Han Code JP Light' ,Consolas, 'Courier New', monospace

## markdown記法

normal **bold** normal

~~取り消し線~~

- リスト1
    - ネスト リスト1_1
        - ネスト リスト1_1_1
        - ネスト リスト1_1_2
    - ネスト リスト1_2
- リスト2
- リスト3

~~~javascript
//nの階乗
function factorialize(n) {
    return n < 0 ? n : n === 0 ? 1 : n * factorialize(n - 1)
}
// console.log(factorialize(16))
~~~

---

|header1|header2|header3|
|:--|--:|:--:|
|align left|align right|align center|
|a|b|c|
