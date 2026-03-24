from gmail_service import authenticate, get_emails, get_email_details, extract_data

service = authenticate()

messages = get_emails(service)

final_emails = []

for msg in messages:
    full_msg = get_email_details(service, msg['id'])
    data = extract_data(full_msg)
    final_emails.append(data)


for mail in final_emails:
    print(f"From: {mail['from']}")
    print(f"Subject: {mail['subject']}")
    print(f"Body: {mail['body'][:500]}")
    print("-" * 50)


