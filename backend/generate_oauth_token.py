import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/drive.file']

def main():
    """Shows basic usage of the Drive v3 API.
    Prints the names and ids of the first 10 files the user has access to.
    """
    creds = None
    
    print("==================================================")
    print("구글 드라이브 권한(OAuth) 연동 헬퍼 스크립트")
    print("==================================================\n")
    print("GCP에서 다운받은 OAuth 클라이언트 ID JSON 파일의 이름을 'client_secret.json'으로 변경한 후,")
    print("backend 폴더 안에 위치시켜주세요.\n")
    
    if not os.path.exists('client_secret.json'):
        print("❌ 'client_secret.json' 파일이 현재 경로(backend/)에 존재하지 않습니다!")
        print("GCP 콘솔에서 'OAuth 2.0 클라이언트 ID' 생성을 한 후 다운로드 받아주세요.")
        return

    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("토큰이 만료되어 자동 갱신합니다...")
            creds.refresh(Request())
        else:
            print("웹 브라우저를 띄워 구글 로그인을 진행합니다...")
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
            
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    print("\n✅ OAuth 인증이 완료되었습니다! 아래 환경변수를 복사하여 `.env` 파일에 추가해주세요.")
    print("--------------------------------------------------------------------------------")
    
    cred_json = json.loads(creds.to_json())
    
    # Read the client secret file to extract client ID and Secret
    with open('client_secret.json', 'r') as f:
        client_config = json.load(f)
        try:
            client_id = client_config['installed']['client_id']
            client_secret = client_config['installed']['client_secret']
        except KeyError:
            try:
                client_id = client_config['web']['client_id']
                client_secret = client_config['web']['client_secret']
            except KeyError:
                print("⚠️ client_secret.json 파일 형식을 파싱할 수 없습니다. 직접 앱의 Client ID/Secret을 입력하세요.")
                client_id = "YOUR_CLIENT_ID"
                client_secret = "YOUR_CLIENT_SECRET"

    print(f"GOOGLE_OAUTH_CLIENT_ID=\"{client_id}\"")
    print(f"GOOGLE_OAUTH_CLIENT_SECRET=\"{client_secret}\"")
    print(f"GOOGLE_OAUTH_REFRESH_TOKEN=\"{cred_json.get('refresh_token')}\"")
    print("\n주의: 구글 드라이브 내 폴더 주소를 GOOGLE_DRIVE_FOLDER_ID에 지정해야 합니다.")
    print("이제 터미널을 종료하셔도 좋습니다.")

if __name__ == '__main__':
    main()
