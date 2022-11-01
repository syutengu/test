//スプレッドシートを開いたときに自動実行する「onOpen」関数
// function onOpen() {
//   SpreadsheetApp //Or DocumentApp or SlidesApp or FormApp.
//     .getUi()
//     .createMenu('Custom Menu')
//     .addItem('Show sidebar', 'showSidebar')
//     .addToUi()
// }
// function showSidebar() {
//   //let html = HtmlService.createHtmlOutputFromFile('sidebar')
//   let html = HtmlService.createTemplateFromFile("sidebar").evaluate().setTitle('sideMenu')
//   SpreadsheetApp//Or DocumentApp or SlidesApp or FormApp.
//     .getUi().showSidebar(html)
// }

function alert() {
    // sendMail()
    SpreadsheetApp.getUi().alert('メールが自動送信されました')
}

//メール送信
function sendMail() {
    //メール内容
    //宛先メールアドレス
    let recipient = "sample@gmail.com"
    //件名
    let subject = "テストです"
    //本文
    let body = `本メールはGASを用いての自動送信テストです`

    let options = {
        // cc: "cc@gmail.com", // ccアドレス
        // bcc:"bcc@gmail.com", // bccアドレス
        // noReply:true // 返信不要
    }

    //送信
    GmailApp.sendEmail(recipient, subject, body, options)
}


// Browser.msgBox('text')
// SpreadsheetApp.getUi().alert('text')


function clickHandler() {
    // const d = getData()
    const d = getData('buy', 'tblBuy')
    d.shift()//delete title line
    const beginCell = atorc('N2')
    writeData('dev', d, ...beginCell)
}

//写入数据
function writeData(sheetName, data, beginRow = 1, beginClm = 1) {
    if (!Array.isArray(data)) return
    const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName)
    if (sheet === undefined) return
    //行番号, 列番号, 行数, 列数
    const range = sheet.getRange(beginRow, beginClm, data.length, data[0]?.length)
    return range?.setValues(data)
}

//通过表单及范围名称获取数据
function getData(sheetName, rangeName) {
    if (sheetName === undefined || rangeName === undefined) return
    const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName)
    const range = sheet?.getRange(rangeName) ?? SpreadsheetApp.getActiveRange()
    const vals = range?.getValues()
    return vals
}
function clearData(sheetName, beginRow, beginClm, rowLen, clmLen) {
    const range = SpreadsheetApp.getActive().getSheetByName(sheetName)?.getRange(beginRow, beginClm, rowLen, clmLen) ?? SpreadsheetApp.getActiveRange()
    return range.clear()
}
//convert A1 notation to R1C1 notation
function atorc(A1) {
    const range = SpreadsheetApp.getActiveSheet().getRange(A1)
    return [range.getRow(), range.getColumn()]
}
