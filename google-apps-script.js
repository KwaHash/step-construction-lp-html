/**
 * Google Apps Script to write questionnaire data to Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * See README.md for detailed setup and deployment instructions.
 * 
 * Quick reference:
 * 1. Open your Google Spreadsheet
 * 2. Go to Extensions > Apps Script
 * 3. Paste this code
 * 4. Update SPREADSHEET_ID below if needed
 * 5. Run authorizeScript() function to authorize
 * 6. Deploy as Web App (Execute as: "Me")
 * 7. Copy Web App URL and update script.js
 */

// Replace with your Spreadsheet ID (from the URL)
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';

function authorizeScript() {
  try {
    // This will trigger the authorization dialog
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const testSheet = sheet.getActiveSheet();
    return 'Authorization successful!';
  } catch (error) {
    throw error;
  }
}

// Handle CORS preflight requests
// Note: Google Apps Script Web Apps automatically handle CORS headers
// when deployed with proper access settings (Anyone/Anyone with Google account)
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    let rowData;
    // Check for form-encoded data in e.parameter first (most reliable for form data)
    if (e.parameter && e.parameter.data) {
      rowData = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      const contents = e.postData.contents;
      
      // Check if contents is form-encoded (starts with "data=")
      if (contents.indexOf('data=') === 0 || contents.indexOf('data=') > -1) {
        // Extract and decode the form data manually
        // Format: "data=URL_ENCODED_JSON"
        const dataStart = contents.indexOf('data=') + 5; // 5 is length of "data="
        const encodedData = contents.substring(dataStart);
        // Decode URL-encoded string
        const decodedData = decodeURIComponent(encodedData);
        rowData = JSON.parse(decodedData);
      } else {
        // Handle JSON data
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
      '送信日時',
      'Q1: 状況',
      'Q2: 重視点',
      'Q3: 経験',
      'Q4: 資格',
      'Q5: 経験年数',
      'Q6: 年収',
      'お名前',
      'メールアドレス',
      '電話番号',
      '所属企業',
      'リファラー'
    ];
    
    // Check if header row needs to be created or updated
    const lastRow = sheet.getLastRow();
    let needsHeaderUpdate = false;
    
    if (lastRow === 0) {
      // Sheet is empty, create headers
      needsHeaderUpdate = true;
    } else {
      // Check if header row exists and has the correct last column
      const lastColumn = sheet.getLastColumn();
      if (lastColumn > 0) {
        const lastHeaderCell = sheet.getRange(1, lastColumn).getValue();
        // If last column is not "リファラー" or we don't have enough columns, update headers
        if (lastHeaderCell !== 'リファラー' || lastColumn < headers.length) {
          needsHeaderUpdate = true;
        }
      } else {
        needsHeaderUpdate = true;
      }
    }
    
    if (needsHeaderUpdate) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      // Format header row
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#5dade2')
        .setFontColor('#ffffff');
    }
    
    sheet.appendRow(rowData);
    
    // CORS headers are automatically handled by Google Apps Script Web Apps
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// Test function (optional - for testing in Apps Script editor)
function testDoPost() {
  const testData = {
    data: [
      new Date().toLocaleString('ja-JP'),
      '今すぐ転職したい',
      '年収・待遇を上げたい',
      '施工管理',
      '1級建築士',
      '10年以上',
      '～1000万',
      'テスト太郎',
      'test@example.com',
      '090-1234-5678',
      'テスト会社',
      'https://example.com/lp?utm_source=test&utm_medium=test&utm_campaign=test'
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