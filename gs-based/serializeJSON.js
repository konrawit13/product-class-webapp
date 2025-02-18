function serializeJSON() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const opt_sheet = ss.getSheetByName('th_decsion_tree');
  const q_sheet = ss.getSheetByName('questions');
  const qvals = q_sheet.getDataRange().getValues();
  const optvals = opt_sheet.getDataRange().getValues();

  const opt_headers = optvals[0];
  const qheaders = qvals[0];

  /**
   * 
   */
  function getOptById(id) {
    let id_index = opt_headers.indexOf('id');
    let filteredVals = optvals.filter( r => r[id_index] == id);
    let fv_obj = filteredVals.map( (v,i) => {
      let row_obj = {};
      v.map( (td,index) => {
        row_obj[opt_headers[index]] = td;
      })
      
      return row_obj;
    });
    // console.log(fv_obj);
    return fv_obj;
  }
  /**
   * 
   */
  function toDrive(obj) {
      const folderID = "1HeMsssIKwPQ7Wby3wyNOym4-o3S5GOUk";
      const drive = DriveApp.getFolderById(folderID);
      const dict = {
        "question": obj,
        "rev": 4,
        "current_state": "operational",
        "data_fetch_datetime": new Date()
      };

      let now = new Date();
      const fname = "prodClass_" + String(now.getFullYear()) 
        + "-" + String(now.getMonth()+1) + "-" + String(now.getDate()) 
        + "_rev" + parseInt(dict.rev) +".json";
      
      const file = drive.createFile(
        fname,
        JSON.stringify(dict),
        MimeType.PLAIN_TEXT
      );

      console.log("JSON file has been created at point: ",file.getDownloadUrl());
    }


  
  qvals.shift();
  const qojb_temp = {};
  qheaders.map(v => {
    qojb_temp[v] ='';
  });
  // console.log(qojb);

  const qojb = qvals.map( r => {
    let row = {
      'date_added': r[0],
      'id': r[1],
      'question': r[2],
      'type': r[3],
      'path': r[4]
    };
    row['option'] = getOptById(r[1]);
    return row;
  });

  console.log(qojb);
  toDrive(qojb);

}
function genUUID() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const opt_sheet = ss.getSheetByName('th_decsion_tree');

  const vals = opt_sheet.getDataRange().getValues();
  vals.shift();
  const uuidArr = vals.map( r => {
    let uuid = Utilities.getUuid();
    return [uuid];
  });
  console.log(uuidArr);
  const setRange = opt_sheet.getRange(
    2,
    14,
    uuidArr.length,
    1
  );
  setRange.setValues(uuidArr);

  SpreadsheetApp.flush();
}