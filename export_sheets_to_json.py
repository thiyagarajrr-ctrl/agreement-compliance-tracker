import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json

scope = ['https://www.googleapis.com/auth/spreadsheets.readonly']
creds = ServiceAccountCredentials.from_json_keyfile_name('agreement-compliance-tracker-42a2524fdd04.json', scope)
client = gspread.authorize(creds)

sheet = client.open('YOUR_SHEET_NAME').sheet1
rows = sheet.get_all_records()
with open('agreement-data.json', 'w') as f:
    json.dump(rows, f)
