function doGet(e) {
  const tmp = HtmlService.createTemplateFromFile('home');
  const faviconURL = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Emoji_u263a.svg/85px-Emoji_u263a.svg.png";
  return tmp.evaluate().setFaviconUrl(faviconURL);
}

function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function fetchDriveJSON(file_id) {
  let id = '1DGqx6MBbFHC9cJxrhZHhKEnLIkhKgz8R';
  let drive = DriveApp.getFileById(id);
  let blob = drive.getAs('text/plain').getDataAsString();
  return blob;
}

function retrieveResponse(ans_obj) {
  /**
   * A function to invoke gmail body
   */
  function invokeMailBody(resObject,resid) {
    let top = 'เรียนคุณ...'+ '\n'+ 'ตามที่ท่านได้ขอบันทึกผลการวินิจฉัยจัดประเภทผลิตภัณฑ์เบื้องต้น' + '\n'+ 'ขอแจ้งผลการวินิจัย รายละเอียดดังนี้:'+'\n'+
    'Response ID: ' + resid + '\n'+
    'วันที่ทำการบันทึก: ' + String(now) + ', API version: 4.0'+ ', Last Update On: ' + resObject.outcome.lastUpdate + '\n'+
    'ผลการวินิจฉัยเบื้องต้น: ' + resObject.outcome.product_class + '\n' + '\n'
    let pathArr = resObject.path;
    let pathBodyArr = [];
    for (const e of pathArr) {
      pathBodyArr.push('\n', 'คำถาม: ', e.q, '\n', 'คำตอบ: ', e.ans, '\n');
    }
    let pathbodyConcat = pathBodyArr.join("\n");
    let outro = '\n' + 'This email is an automatic email, please do not reply';
    return top.concat(pathbodyConcat).concat(outro);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const res_sheet = ss.getSheetByName('response');

  let res_sheetLR = res_sheet.getLastRow()+1;
  
  const resObj = JSON.parse(ans_obj);
  console.log(resObj);
  let now = new Date();

  const resId = Utilities.getUuid();
  let resHead = [
    [now, resId, resObj.email, 'outcome', '', resObj.outcome.product_class, '', resObj.outcome.uuid, resObj.outcome.version, resObj.outcome.lastUpdate]
  ];

  for (const e of resObj.path) {
    let row = [
      now, resId,resObj.email, 'question', e.cqid, e.q, e.ans,'', resObj.outcome.version, resObj.outcome.lastUpdate
    ];
    resHead.push(row);
  }

  let setRange = res_sheet.getRange(
    res_sheetLR,
    1,
    resHead.length,
    resHead[0].length
  );

  setRange.setValues(resHead);
  SpreadsheetApp.flush();

  let body = invokeMailBody(resObj,resId);

  const gmail = GmailApp.sendEmail(
    resObj.email,
    'ผลการวินิจฉัยจัดประเภทผลิตภัณฑ์เบื้องต้น(id: '+resId+'): ' + String(now),
    body
  );

  return resId;

}

function test_auth() {

}