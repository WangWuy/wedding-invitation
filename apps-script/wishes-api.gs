/**
 * Google Apps Script API cho tính năng "Gửi lời chúc".
 *
 * CÁCH DÙNG:
 * 1. Tạo một Google Sheet mới (hoặc dùng sheet có sẵn).
 * 2. Trong sheet, vào menu Extensions → Apps Script.
 * 3. Xoá code mẫu, dán toàn bộ nội dung file này vào.
 * 4. Bấm Deploy → New deployment → chọn loại "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy URL vừa deploy (dạng https://script.google.com/macros/s/xxx/exec)
 *    và dán vào assets/content.config.js ở khoá wishesApiUrl.
 * 6. Mỗi lần sửa code này, nhớ chọn "New deployment" lại (hoặc quản lý
 *    deployment cũ → Edit → New version) để áp dụng thay đổi.
 */

const SHEET_NAME = "Wishes";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Timestamp", "Name", "Message"]);
  }
  return sheet;
}

function doGet(e) {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const rows = values.slice(1); // bỏ header

  const wishes = rows
    .filter(function (row) { return row[1] || row[2]; })
    .map(function (row) {
      return {
        t: new Date(row[0]).getTime(),
        name: String(row[1] || ""),
        msg: String(row[2] || "")
      };
    });

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, wishes: wishes }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = String(data.name || "").trim().slice(0, 100);
    const msg = String(data.msg || "").trim().slice(0, 1000);

    if (!name || !msg) {
      return jsonError_("Thiếu tên hoặc lời chúc.");
    }

    const sheet = getSheet_();
    sheet.appendRow([new Date(), name, msg]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return jsonError_(String(err));
  }
}

function jsonError_(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON);
}
