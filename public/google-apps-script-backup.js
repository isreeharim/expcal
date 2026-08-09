/**
 * ============================================================================
 * ExpCal — Google Sheets Automated Supabase Data Backup Script
 * ============================================================================
 * 
 * HOW TO INSTALL IN 2 MINUTES:
 * 1. Open Google Sheets (https://sheets.new) and name it "ExpCal Database Backup".
 * 2. In the top menu, click Extensions → Apps Script.
 * 3. Delete any default code in Code.gs, paste this ENTIRE script, and click Save (💾).
 * 4. In the top right, click Deploy → New deployment.
 * 5. Click the gear icon (⚙️) next to "Select type" and choose "Web app".
 * 6. Set Description: "ExpCal Backup Webhook"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"  <-- CRITICAL for webhook to receive data
 * 9. Click Deploy, Authorize access, and copy the Web App URL!
 * 10. Paste the Web App URL in your ExpCal Admin → Backup & Sync page.
 * ============================================================================
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "ExpCal Google Sheets Backup Webhook is online and ready to receive data!",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No payload received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. POPULATE OVERVIEW SHEET
    populateOverviewSheet(ss, payload);

    // 2. POPULATE PROJECTS SHEET
    populateProjectsSheet(ss, payload.projects || []);

    // 3. POPULATE ENTRIES SHEET
    populateEntriesSheet(ss, payload.entries || []);

    // 4. POPULATE USERS SHEET
    populateUsersSheet(ss, payload.profiles || []);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "ExpCal Supabase data backup successfully written to Google Sheets!",
      timestamp: new Date().toISOString(),
      summary: payload.summary || {}
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString(),
      stack: error.stack
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function populateOverviewSheet(ss, payload) {
  var sheet = getOrCreateSheet(ss, "📊 Overview");
  sheet.clear();
  sheet.setTabColor("#6366f1");

  var summary = payload.summary || {};
  var timestamp = payload.timestamp || new Date().toISOString();
  var triggeredBy = payload.triggered_by || "Admin";

  var data = [
    ["📈 ExpCal — Supabase Database Live Backup", "", "", ""],
    ["Last Synced At:", timestamp, "Triggered By:", triggeredBy],
    ["", "", "", ""],
    ["Key Performance Indicator", "Value", "Notes", ""],
    ["Total Projects", summary.total_projects || 0, "Active and archived projects", ""],
    ["Total Entries", summary.total_entries || 0, "Time, income and expense records", ""],
    ["Total Users", summary.total_users || 0, "Registered team members", ""],
    ["Total Hours Logged", (summary.total_hours || 0) + " hrs", "Cumulative project hours", ""],
    ["Total Gross Income", summary.total_income || 0, "All recorded project revenues", ""],
    ["Total Expenses", summary.total_expenses || 0, "All itemized project expenses", ""],
    ["Net Cash Flow / Profit", summary.net_cash || 0, "Income minus expenses", ""]
  ];

  sheet.getRange(1, 1, data.length, 4).setValues(data);

  // Styling Title
  var titleRange = sheet.getRange(1, 1, 1, 4);
  titleRange.merge();
  titleRange.setBackground("#4f46e5");
  titleRange.setFontColor("#ffffff");
  titleRange.setFontSize(14);
  titleRange.setFontWeight("bold");
  titleRange.setHorizontalAlignment("center");

  // Meta Info
  sheet.getRange(2, 1, 1, 4).setBackground("#f3f4f6").setFontWeight("bold").setFontSize(9);

  // KPI Header
  sheet.getRange(4, 1, 1, 3).setBackground("#1e1b4b").setFontColor("#ffffff").setFontWeight("bold");

  // Number formatting
  sheet.getRange(8, 2, 3, 1).setNumberFormat("₹#,##0.00");

  sheet.autoResizeColumns(1, 4);
}

function populateProjectsSheet(ss, projects) {
  var sheet = getOrCreateSheet(ss, "📁 Projects");
  sheet.clear();
  sheet.setTabColor("#4f46e5");

  var headers = [
    "Project ID", "Project Title", "Owner", "Description", "Color", 
    "Total Entries", "Hours Tracked", "Total Income (₹)", "Total Expenses (₹)", 
    "Net Cash Flow (₹)", "Created Date"
  ];

  var rows = [headers];

  for (var i = 0; i < projects.length; i++) {
    var p = projects[i];
    rows.push([
      p.id || "",
      p.title || "",
      p.owner_name || "",
      p.description || "",
      p.color || "",
      p.entry_count || 0,
      p.total_hours || 0,
      p.total_income || 0,
      p.total_expenses || 0,
      p.net_cash || 0,
      p.created_at ? p.created_at.substring(0, 10) : ""
    ]);
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);

  // Format Header
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#312e81");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  sheet.setFrozenRows(1);

  if (rows.length > 1) {
    // Format Currencies
    sheet.getRange(2, 8, rows.length - 1, 3).setNumberFormat("₹#,##0.00");
  }

  sheet.autoResizeColumns(1, headers.length);
}

function populateEntriesSheet(ss, entries) {
  var sheet = getOrCreateSheet(ss, "📝 Entries");
  sheet.clear();
  sheet.setTabColor("#0d9488");

  var headers = [
    "Entry ID", "Date", "Project", "Logged By", "Start Time", "End Time", 
    "Hours", "Income (₹)", "Total Expense (₹)", "Itemized Expenses", 
    "Notes", "Receipt Photo URL", "Created At"
  ];

  var rows = [headers];

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    rows.push([
      e.id || "",
      e.date || "",
      e.project_title || "",
      e.user_name || "",
      e.start_time || "",
      e.end_time || "",
      e.hours || 0,
      e.income || 0,
      e.total_expense || 0,
      e.expenses_breakdown || "",
      e.notes || "",
      e.photo_url || "",
      e.created_at ? e.created_at.substring(0, 19).replace("T", " ") : ""
    ]);
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);

  // Format Header
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0f766e");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  sheet.setFrozenRows(1);

  if (rows.length > 1) {
    // Format Currencies
    sheet.getRange(2, 8, rows.length - 1, 2).setNumberFormat("₹#,##0.00");
  }

  sheet.autoResizeColumns(1, headers.length);
}

function populateUsersSheet(ss, profiles) {
  var sheet = getOrCreateSheet(ss, "👥 Users");
  sheet.clear();
  sheet.setTabColor("#475569");

  var headers = ["User ID", "Full Name", "Role", "Joined Date"];
  var rows = [headers];

  for (var i = 0; i < profiles.length; i++) {
    var p = profiles[i];
    rows.push([
      p.id || "",
      p.full_name || "",
      p.role || "user",
      p.created_at ? p.created_at.substring(0, 10) : ""
    ]);
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);

  // Format Header
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#334155");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  sheet.setFrozenRows(1);

  sheet.autoResizeColumns(1, headers.length);
}
