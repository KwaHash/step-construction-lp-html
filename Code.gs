const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const NOTIFICATION_EMAIL = 'test@gmail.com,example@gmail.com';
const SHEET_NAME = 'シート1';

const COLUMN_HEADERS = [
  'お名前',
  'メールアドレス',
  '電話番号',
  '所属企業',
  'Q1: 状況',
  'Q2: 重視点',
  'Q3: 経験',
  'Q4: 資格',
  'Q5: 経験年数',
  'Q6: 年収',
  'リファラー',
  '送信日時'
];

function parseFormData(e) {
  let rowData;
  
  if (e.parameter && e.parameter.data) {
    rowData = JSON.parse(e.parameter.data);
  } else if (e.postData && e.postData.contents) {
    const contents = e.postData.contents;
    
    if (contents.indexOf('data=') === 0 || contents.indexOf('data=') > -1) {
      const dataStart = contents.indexOf('data=') + 5;
      const encodedData = contents.substring(dataStart);
      const decodedData = decodeURIComponent(encodedData);
      rowData = JSON.parse(decodedData);
    } else {
      try {
        const data = JSON.parse(contents);
        rowData = data.data;
      } catch (jsonError) {
        throw new Error('Invalid JSON format: ' + jsonError.toString());
      }
    }
  } else {
    throw new Error('No data received');
  }
  
  return rowData;
}

function extractFormFields(row) {
  return {
    name: row[0] || '(未入力)',
    email: row[1] || '(未入力)',
    phone: row[2] || '(未入力)',
    company: row[3] || '(未入力)',
    q1: row[4] || '(未入力)',
    q2: row[5] || '(未入力)',
    q3: row[6] || '(未入力)',
    q4: row[7] || '(未入力)',
    q5: row[8] || '(未入力)',
    q6: row[9] || '(未入力)',
    referrer: row[10] || '(未入力)',
    timestamp: row[11] || new Date().toLocaleString('ja-JP')
  };
}

function getTargetSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet not found: ' + SHEET_NAME);
  }
  return sheet;
}

function needsHeaderUpdate(sheet) {
  const lastRow = sheet.getLastRow();
  
  if (lastRow === 0) {
    return true;
  }
  
  const lastColumn = sheet.getLastColumn();
  if (lastColumn > 0) {
    const lastHeaderCell = sheet.getRange(1, lastColumn).getValue();
    if (lastHeaderCell !== 'リファラー' || lastColumn < COLUMN_HEADERS.length) {
      return true;
    }
  } else {
    return true;
  }
  
  return false;
}

function setupHeaders(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, COLUMN_HEADERS.length);
  headerRange.setValues([COLUMN_HEADERS]);
  
  headerRange
    .setFontWeight('bold')
    .setBackground('#5dade2')
    .setFontColor('#ffffff');
}

function saveToSpreadsheet(rowData) {
  try {
    const sheet = getTargetSheet();
    
    if (needsHeaderUpdate(sheet)) {
      setupHeaders(sheet);
    }
    
    sheet.appendRow(rowData);
    return true;
  } catch (error) {
    console.error('Failed to save to spreadsheet:', error.toString());
    throw error;
  }
}

function generateEmailSubject(name) {
  return '【建築・不動産転職ナビ】新規回答：' + name;
}

function generateEmailBody(fields) {
  return `
新しいアンケートフォームが送信されました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【基本情報】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お名前: ${fields.name}
メールアドレス: ${fields.email}
電話番号: ${fields.phone}
所属企業: ${fields.company}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【アンケート回答】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q1: 状況
${fields.q1}

Q2: 重視点
${fields.q2}

Q3: 経験
${fields.q3}

Q4: 資格
${fields.q4}

Q5: 経験年数
${fields.q5}

Q6: 年収
${fields.q6}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【その他】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
リファラー: ${fields.referrer}
送信日時: ${fields.timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
このメールは自動送信されています。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}

function sendEmailNotification(row) {
  try {
    const fields = extractFormFields(row);
    const subject = generateEmailSubject(fields.name);
    const body = generateEmailBody(fields);
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      name: '建築・不動産転職ナビ',
      subject: subject,
      body: body
    });
    
    return true;
  } catch (error) {
    console.error('メール送信に失敗しました:', error.toString());
    return false;
  }
}

function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const rowData = parseFormData(e);
    saveToSpreadsheet(rowData);
    sendEmailNotification(rowData);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Data saved successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testDoPost() {
  const testData = {
    data: [
      'テスト太郎',
      'test@example.com',
      '090-1234-5678',
      'テスト会社',
      '今すぐ転職したい',
      '年収・待遇を上げたい',
      '施工管理',
      '1級建築士',
      '10年以上',
      '～1000万',
      'https://example.com/lp?utm_source=test&utm_medium=test&utm_campaign=test',
      new Date().toLocaleString('ja-JP'),
    ]
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  return result.getContent();
}