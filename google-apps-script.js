const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const NOTIFICATION_EMAIL = 'test@gmail.com';
const SHEET_NAME = 'シート1';

function authorizeScript() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const testSheet = sheet.getActiveSheet();
    return 'Spreadsheet authorization successful!';
  } catch (error) {
    throw error;
  }
}

function authorizeEmail() {
  try {
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: 'Email Authorization Test - 建築・不動産転職ナビ',
      body: 'このメールはメール送信権限のテストです。このメールが届いていれば、メール送信権限が正常に設定されています。\n\nThis is a test email to verify email sending permissions. You can delete this email.'
    });
    return '✅ Email authorization successful! A test email has been sent to ' + NOTIFICATION_EMAIL;
  } catch (error) {
    const errorMsg = error.toString();
    if (errorMsg.indexOf('permissions') > -1 || errorMsg.indexOf('Required permissions') > -1) {
      throw new Error(
        '❌ Email permission not granted.\n\n' +
        'PLEASE FOLLOW THESE STEPS:\n' +
        '1. Click the Project Settings icon (⚙️) in the left sidebar\n' +
        '2. Scroll to "OAuth scopes" section\n' +
        '3. Click "+ Add scope" button\n' +
        '4. Manually enter: https://www.googleapis.com/auth/script.send_mail\n' +
        '5. Click OK and save\n' +
        '6. Run this function again\n\n' +
        'Original error: ' + errorMsg
      );
    }
    throw error;
  }
}


function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

function sendEmailNotification(row) {
  try {
    const name = row[0] || '(未入力)';
    const email = row[1] || '(未入力)';
    const phone = row[2] || '(未入力)';
    const company = row[3] || '(未入力)';
    const q1 = row[4] || '(未入力)';
    const q2 = row[5] || '(未入力)';
    const q3 = row[6] || '(未入力)';
    const q4 = row[7] || '(未入力)';
    const q5 = row[8] || '(未入力)';
    const q6 = row[9] || '(未入力)';
    const referrer = row[10] || '(未入力)';
    const timestamp = row[11] || new Date().toLocaleString('ja-JP');
    
    const subject = '【建築・不動産転職ナビ】新規回答：' + name;
    
    const body = `
新しいアンケートフォームが送信されました。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【基本情報】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お名前: ${name}
メールアドレス: ${email}
電話番号: ${phone}
所属企業: ${company}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【アンケート回答】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q1: 状況
${q1}

Q2: 重視点
${q2}

Q3: 経験
${q3}

Q4: 資格
${q4}

Q5: 経験年数
${q5}

Q6: 年収
${q6}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【その他】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
リファラー: ${referrer}
送信日時: ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
このメールは自動送信されています。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject,
      body
    });
    
    return true;
  } catch (error) {
    console.error('メール送信に失敗しました:', error.toString());
    return false;
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Sheet not found: ' + SHEET_NAME);
    
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
    
    const headers = [
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
    
    const lastRow = sheet.getLastRow();
    let needsHeaderUpdate = false;
    
    if (lastRow === 0) {
      needsHeaderUpdate = true;
    } else {
      const lastColumn = sheet.getLastColumn();
      if (lastColumn > 0) {
        const lastHeaderCell = sheet.getRange(1, lastColumn).getValue();
        if (lastHeaderCell !== 'リファラー' || lastColumn < headers.length) {
          needsHeaderUpdate = true;
        }
      } else {
        needsHeaderUpdate = true;
      }
    }
    
    if (needsHeaderUpdate) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#5dade2')
        .setFontColor('#ffffff');
    }
    
    sheet.appendRow(rowData);
    
    sendEmailNotification(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
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