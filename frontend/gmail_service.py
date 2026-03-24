import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']


def authenticate():
    creds = None

    # Check token
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    # Login if needed
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)

        # Save token
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    service = build('gmail', 'v1', credentials=creds)
    return service
def get_emails(service):
    results = service.users().messages().list(
        userId='me',
        maxResults=5
    ).execute()

    return results.get('messages', [])
def get_email_details(service, msg_id):
    return service.users().messages().get(
        userId='me',
        id=msg_id
    ).execute()
def extract_data(msg):
    headers = msg['payload']['headers']

    subject = sender = None

    for h in headers:
        if h['name'] == 'Subject':
            subject = h['value']
        if h['name'] == 'From':
            sender = h['value']

    raw_body = get_body(msg['payload'])

    clean_text = clean_body(raw_body)

    return {
        "from": sender,
        "subject": subject,
        "body": clean_text
    }



    return {
        "from": sender,
        "subject": subject,
        "body": body
    }

import base64

def get_body(payload):
    if 'parts' in payload:
        for part in payload['parts']:
            if part['mimeType'] == 'text/plain':
                data = part['body'].get('data')
                if data:
                    return base64.urlsafe_b64decode(data).decode()
    else:
        data = payload['body'].get('data')
        if data:
            return base64.urlsafe_b64decode(data).decode()

    return ""
import re

def clean_body(text):
    if not text:
        return ""


    text = re.sub(r'<.*?>', ' ', text)


    text = re.sub(r'http\S+|www\S+', ' ', text)


    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)


    text = text.lower()


    text = re.sub(r'\s+', ' ', text).strip()

    return text
