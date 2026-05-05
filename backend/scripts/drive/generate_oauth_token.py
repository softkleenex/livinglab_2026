import os
import json
from google_auth_oauthlib.flow import Flow
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse
import webbrowser

SCOPES = ['https://www.googleapis.com/auth/drive.file']
REDIRECT_URI = 'http://localhost:19000'

auth_code = None

class OAuthCallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global auth_code
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        auth_code = params.get('code', [None])[0]
        
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(b'<h1>&#127881; &#48143;&#47532;! &#51064;&#51613;&#51060; &#50756;&#47308;&#46104;&#50632;&#49845;&#45768;&#45796;. &#51060; &#52285;&#51012; &#45803;&#50500;&#46020; &#46121;&#45768;&#45796;.</h1>')
    
    def log_message(self, format, *args):
        pass  # Suppress server logs

def main():
    print("==================================================")
    print("구글 드라이브 권한(OAuth) 연동 헬퍼 스크립트")
    print("==================================================\n")

    if not os.path.exists('client_secret.json'):
        print("❌ 'client_secret.json' 파일이 현재 경로(backend/)에 존재하지 않습니다!")
        return

    with open('client_secret.json', 'r') as f:
        client_config = json.load(f)
    config_block = client_config.get('installed') or client_config.get('web')
    client_id = config_block['client_id']
    client_secret_val = config_block['client_secret']

    flow = Flow.from_client_secrets_file(
        'client_secret.json',
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        prompt='consent'
    )

    print("👉 다음 URL을 브라우저에서 직접 열어주세요:\n")
    print(auth_url)
    print("\n브라우저에서 로그인 후 허용(Allow)을 누르면 localhost:19000으로 리디렉션됩니다.")
    print("로컬 서버가 코드를 자동 캡처합니다... 잠시 대기 중...\n")
    
    # Open browser automatically
    webbrowser.open(auth_url)
    
    # Run local server to catch the callback
    server = HTTPServer(('localhost', 19000), OAuthCallbackHandler)
    server.handle_request()
    
    if not auth_code:
        print("❌ 인증 코드를 받지 못했습니다. 다시 시도해주세요.")
        return
    
    # Exchange auth code for tokens
    flow.fetch_token(code=auth_code)
    creds = flow.credentials
    
    # Save token
    with open('token.json', 'w') as token:
        token.write(creds.to_json())
    
    print("\n✅ OAuth 인증 완료! 아래 환경변수를 .env 및 Render 환경변수에 추가하세요.")
    print("=" * 80)
    print(f'GOOGLE_OAUTH_CLIENT_ID="{client_id}"')
    print(f'GOOGLE_OAUTH_CLIENT_SECRET="{client_secret_val}"')
    print(f'GOOGLE_OAUTH_REFRESH_TOKEN="{creds.refresh_token}"')
    print("=" * 80)
    print("\n위 3줄을 .env 파일과 Render 환경변수에 넣어주세요!")

if __name__ == '__main__':
    main()
