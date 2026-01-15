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

Before deploying, you MUST authorize the script:

1. In the Apps Script editor, select the function `authorizeScript` from the dropdown
2. Click the **Run** button (▶️)
3. You will see "Authorization required" - click **Review permissions**
4. Select your Google account
5. Click **Advanced** > **Go to [Project Name] (unsafe)**
6. Click **Allow** to grant permissions
7. This only needs to be done once

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

If you're using a different Google Spreadsheet, update the `SPREADSHEET_ID` constant in `google-apps-script.js`:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

### Google Apps Script Web App URL

Update the URL in `assets/js/script.js`:

```javascript
const GOOGLE_SCRIPT_URL = 'YOUR_DEPLOYED_WEB_APP_URL_HERE';
```

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
