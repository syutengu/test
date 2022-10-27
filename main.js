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

function clickHandler() {
  const d = getData('dev', '仕入納品')
  SpreadsheetApp.getUi().alert(d)
}

//メール送信
function sendMail() {
  //メール内容
  //宛先メールアドレス
  let recipient = "@gmail.com"
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

function writeData(data) {
  if (!Array.isArray(data)) return console.log('type of data is not array')
  const rawQty = data.length
  const clmQty = data[0]?.length
  const sheet = SpreadsheetApp.getActive().getSheetByName('dst')
  sheet.getRange(1, 1, rawQty, clmQty).setValues(data)
  Browser.msgBox('jobs done')
}

function getData(sheetName = 'dev', rangeName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(sheetName)
  const re = sheet.getRange(rangeName).getValues()
  return re
}
