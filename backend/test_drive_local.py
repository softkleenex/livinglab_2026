from app.services.google_drive import get_drive_service
import sys

def main():
    service = get_drive_service()
    if not service:
        print("Failed to initialize drive service")
        sys.exit(1)
        
    try:
        results = service.files().list(pageSize=10, fields="nextPageToken, files(id, name)").execute()
        items = results.get('files', [])
        
        if not items:
            print('No files found.')
        else:
            print('Files:')
            for item in items:
                print(f"{item['name']} ({item['id']})")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == '__main__':
    main()
