import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Path to the service account key (this will be set up in the workflow)
SERVICE_ACCOUNT_FILE = '/tmp/service_account_key.json'  # Path from the GitHub Actions step
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

# Your Google Sheet ID and range (adjust the range to your actual sheet)
SPREADSHEET_ID = 'your-google-sheet-id'  # Replace with your Google Sheet ID
RANGE_NAME = 'Sheet1!A1:E10'  # Adjust the range if needed

# Authenticate using the service account
def authenticate_google_sheets():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    service = build('sheets', 'v4', credentials=credentials)
    return service

# Fetch data from Google Sheets
def fetch_data_from_sheets():
    service = authenticate_google_sheets()
    sheet = service.spreadsheets()
    result = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=RANGE_NAME).execute()
    return result.get('values', [])

# Save the data to a JSON file (you can adjust to save as CSV)
def save_data_to_file(data):
    with open('sheets_data.json', 'w') as json_file:
        json.dump(data, json_file, indent=2)

# Main function to fetch and save data
if __name__ == '__main__':
    data = fetch_data_from_sheets()
    save_data_to_file(data)
    print("Data fetched and saved to sheets_data.json.")
