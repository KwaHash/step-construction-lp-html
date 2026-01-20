# 建築・不動産転職ナビ (Construction & Real Estate Job Navigation)

A multi-step questionnaire web application for collecting job seeker information in the construction and real estate industry.

## 📋 Project Overview

This is a Japanese-language questionnaire form that collects information from job seekers through a 7-step process. The collected data is automatically saved to Google Sheets using Google Apps Script.

## 🗂️ Project Structure

```
Real/
├── index.html              # Main questionnaire page
├── thanks/
│   └── index.html         # Thank you page (shown after submission)
├── assets/
│   ├── css/
│   │   ├── style.scss     # SCSS source file
│   │   └── style.css      # Compiled CSS
│   ├── js/
│   │   └── script.js      # Main JavaScript logic
│   └── img/
│       ├── logo.png       # Site logo
│       └── top.jpg        # Hero image
├── google-apps-script.js  # Google Apps Script code
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- A web server (or use a local development server)
- A Google account
- Access to Google Sheets and Google Apps Script

### Basic Setup

1. Clone or download this repository
2. Ensure all files are in the correct directory structure
3. Open `index.html` in a web browser or serve it through a web server

### Google Apps Script Setup

The questionnaire data is saved to Google Sheets using Google Apps Script. Follow these steps to set it up:

#### Step 1: Create/Open Google Spreadsheet

1. Open your Google Spreadsheet: [https://docs.google.com/spreadsheets/d/SPREADSHEET_ID](https://docs.google.com/spreadsheets/d/SPREADSHEET_ID)
   - Or create a new spreadsheet and note the Spreadsheet ID from the URL

#### Step 2: Set Up Google Apps Script

1. In your Google Spreadsheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Copy the entire contents of `google-apps-script.js` and paste it into the Apps Script editor
4. Save the project (Ctrl+S or Cmd+S)

#### Step 3: Authorize the Script

⚠️ **IMPORTANT: Authorization Required** ⚠️

Before deploying, you MUST authorize the script. The `authorizeScript()` function will request permissions for:
- **Google Sheets access** (to write form data)
- **Email sending** (to send notification emails)

1. In the Apps Script editor, select the function `authorizeScript` from the dropdown
2. Click the **Run** button (▶️)
3. You will see "Authorization required" - click **Review permissions**
4. Select your Google account
5. Click **Advanced** > **Go to [Project Name] (unsafe)**
6. Click **Allow** to grant **ALL** permissions (including email sending)
7. This only needs to be done once

**Note:** Make sure you grant ALL permissions, including the email sending permission (`https://www.googleapis.com/auth/script.send_mail`). If you only granted spreadsheet permissions initially, run `authorizeScript()` again to request email permissions.

#### Step 4: Deploy as Web App

1. After authorization, click **Deploy > New deployment**
2. Click the gear icon ⚙️ and select **Web app**
3. Configure the deployment:
   - **Description**: "Questionnaire Data Handler"
   - **Execute as**: **"Me"** (IMPORTANT: Must be "Me", not "User accessing the web app")
   - **Who has access**: 
     - **"Anyone with Google account"** (RECOMMENDED - avoids blocking)
     - OR **"Anyone"** (may be blocked by Google security - see troubleshooting below)
4. Click **Deploy**
5. Copy the **Web App URL** that appears

#### Step 5: Update the Web App URL in Your Code

1. Open `assets/js/script.js`
2. Find line: `const GOOGLE_SCRIPT_URL = '...';`
3. Replace the URL with your deployed Web App URL from Step 4

## 🔧 Configuration

### Spreadsheet ID

Replace with your Spreadsheet ID (from the URL). If you're using a different Google Spreadsheet, update the `SPREADSHEET_ID` constant in `google-apps-script.js`:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

### Google Apps Script Web App URL

Update the URL in `assets/js/script.js`:

```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_DEPLOYED_WEB_APP_URL_HERE';
```

## 📝 Google Apps Script Code Documentation

### Overview

The Google Apps Script (`google-apps-script.js`) handles writing questionnaire data to Google Sheets and sending email notifications.

### Quick Setup Reference

1. Open your Google Spreadsheet
2. Go to Extensions > Apps Script
3. Paste this code
4. Update SPREADSHEET_ID below if needed
5. Run `authorizeScript()` function to authorize
6. Deploy as Web App (Execute as: "Me")
7. Copy Web App URL and update script.js

### Functions

#### `authorizeScript()`

This function will trigger the authorization dialog for both Google Sheets access and Email sending permissions. Run this function once to grant all necessary permissions to the script. It requests:
- Google Sheets access (to read/write spreadsheet data)
- Email sending permissions (to send notification emails via MailApp)

#### `doOptions()`

Handles CORS preflight requests. Google Apps Script Web Apps automatically handle CORS headers when deployed with proper access settings (Anyone/Anyone with Google account).

#### `doPost(e)`

Main handler for POST requests from the questionnaire form.

**Data Processing:**
- Checks for form-encoded data in `e.parameter` first (most reliable for form data)
- If contents is form-encoded (starts with "data="), extracts and decodes the form data manually
  - Format: "data=URL_ENCODED_JSON"
  - Decodes URL-encoded string
- Otherwise handles JSON data

**Sheet Management:**
- Checks if header row needs to be created or updated
- If sheet is empty, creates headers
- Checks if header row exists and has the correct last column
- If last column is not "リファラー" or doesn't have enough columns, updates headers
- Formats header row with bold text, blue background (#5dade2), and white font color

**After Writing Data:**
- Sends email notification with the submitted data
- CORS headers are automatically handled by Google Apps Script Web Apps

#### `sendEmailNotification(row)`

Sends email notification with submitted questionnaire data.

**Parameters:**
- `row` (Array): Array containing the submitted form data

**Data Mapping:**
- Maps the data based on headers order
- Extracts: name, email, phone, company, Q1-Q6 answers, referrer, and timestamp
- Uses "(未入力)" for missing values

**Email Content:**
- Subject: "【建築・不動産転職ナビ】新規回答：[Name]"
- Body includes all form data formatted in Japanese

#### `testDoPost()`

Test function (optional - for testing in Apps Script editor). Creates mock data and tests the `doPost` function.

## 🐛 Troubleshooting

### "This app is blocked" Error

This error occurs because Google blocks unverified apps. Here's how to fix it:

**Step-by-Step Fix:**

1. After deploying, copy the Web App URL
2. Open the URL in **YOUR browser** (you must do this first!)
3. You will see "This app is blocked" - click **Advanced**
4. Click **Go to [Your Project Name] (unsafe)**
5. Click **Allow** to authorize the app
6. After you authorize it once, it will work for everyone

**Important Notes:**
- You MUST authorize it yourself first before others can use it
- Use **"Execute as: Me"** (not "User accessing the web app")
- **"Who has access: Anyone"** works after you authorize it
- If you want to avoid this, use **"Anyone with Google account"** instead

### Data Not Saving to Google Sheets

1. Check that the Web App URL in `script.js` is correct
2. Verify the Spreadsheet ID in `google-apps-script.js` is correct
3. Ensure the script is deployed and authorized
4. Check the browser console for any error messages
5. Verify the spreadsheet has write permissions

### CORS Errors

Google Apps Script Web Apps automatically handle CORS headers when deployed with proper access settings. If you encounter CORS errors:

1. Ensure the deployment is set to **"Anyone"** or **"Anyone with Google account"**
2. Make sure you've authorized the app yourself first
3. Check that the Web App URL is correct

### Email Permission Error

If you see the error: `Exception: Specified permissions are not sufficient to call MailApp.sendEmail. Required permissions: https://www.googleapis.com/auth/script.send_mail`

**This means the script doesn't have permission to send emails.**

**Solution: Manually Add Email Scope (REQUIRED)**

Google Apps Script requires you to manually add the email scope before it can request authorization. Follow these steps:

**Step 1: Add the Email Scope**

1. In the Apps Script editor, click the **Project Settings** icon (⚙️) in the **left sidebar**
2. Scroll down to the **"OAuth scopes"** section
3. You should see existing scopes listed (like `https://www.googleapis.com/auth/spreadsheets`)
4. Click the **"+ Add scope"** button (or the **"Add an OAuth scope"** link)
5. In the text field that appears, manually type or paste:
   ```
   https://www.googleapis.com/auth/script.send_mail
   ```
6. Click **OK** or press Enter
7. The scope should now appear in the list
8. **Save the project** (Ctrl+S or Cmd+S)

**Step 2: Authorize the Scope**

1. Go back to the code editor
2. Select the function `authorizeEmail` from the dropdown at the top
3. Click the **Run** button (▶️)
4. You should now see "Authorization required" - click **Review permissions**
5. Select your Google account
6. Click **Advanced** > **Go to [Project Name] (unsafe)**
7. Click **Allow** to grant email sending permissions
8. The function should complete and send a test email

**Alternative: Add Scope via Manifest File**

If the UI method doesn't work, you can edit the manifest file directly:

1. In the Apps Script editor, click **View > Show manifest file** (or look for `appsscript.json` in the file list)
2. Find the `oauthScopes` array (or create it if it doesn't exist)
3. Add the email scope:
   ```json
   {
     "oauthScopes": [
       "https://www.googleapis.com/auth/spreadsheets",
       "https://www.googleapis.com/auth/script.send_mail"
     ]
   }
   ```
4. Save the file
5. Run `authorizeEmail()` function again
6. Grant permissions when prompted

**Important:** The scope MUST be added to the project settings BEFORE running the authorization function. Otherwise, the authorization dialog will not appear.

## 🎨 Styling

The project uses SCSS for styling. The main stylesheet is located at:
- Source: `assets/css/style.scss`
- Compiled: `assets/css/style.css`

If you modify the SCSS file, you'll need to compile it to CSS. You can use tools like:
- [Sass](https://sass-lang.com/) (command line)
- VS Code extensions (Live Sass Compiler, etc.)

## 📱 Features

- **Multi-step questionnaire** with progress tracking
- **Responsive design** for mobile and desktop
- **Form validation** for required fields
- **Automatic data submission** to Google Sheets

## 🔒 Privacy & Security

- The form includes privacy notes: "しつこい営業はありません" (No persistent sales)
- Data is stored securely in Google Sheets
- The site uses `noindex,nofollow` meta tags to prevent search engine indexing

## 📝 License

This project is proprietary and confidential.

---

**Last Updated**: 2026
