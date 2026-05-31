# MDGA - 보안 및 컴플라이언스 (Security & Compliance)

본 문서는 라이브 환경에서 운영되는 MDGA 시스템의 데이터 보호, 인증/인가, 권한 통제 모델을 설명합니다.

## 1. 데이터 저장 및 통신 보안 (Data in Transit & at Rest)

*   **통신 보안 (In Transit):**
    *   프론트엔드(Cloudflare)와 백엔드(Render) 간의 모든 API 통신은 HTTPS(TLS 1.2 이상)로 강제 암호화됩니다.
    *   백엔드와 Supabase 간의 DB 커넥션 또한 SSL/TLS 프로토콜을 사용(`sslmode=require`)하여 패킷 스니핑을 방지합니다.
*   **저장 보안 (At Rest):**
    *   Supabase(AWS 기반) 및 Google Drive에 적재된 물리적 데이터는 클라우드 제공자의 암호화 표준(AES-256 등)에 따라 안전하게 보관됩니다.
    *   비밀번호는 평문으로 저장되지 않으며, `passlib` 패키지(Bcrypt 알고리즘)를 사용하여 해싱(Salting 포함)된 상태로 저장됩니다.

## 2. 사용자 인증 및 인가 (Authentication & Authorization)

*   **인증 방식:** Stateless 방식의 JWT (JSON Web Token)를 사용합니다.
*   **토큰 저장:** 클라이언트(웹)는 보안 강화를 위해 HttpOnly, Secure 속성이 적용된 쿠키(Cookie)에 Access Token을 저장하는 것을 권장하며, 상황에 따라 메모리(상태 관리 도구)에 일시적으로 보관합니다. LocalStorage 사용은 XSS 공격에 취약하므로 지양합니다.
*   **RBAC (Role-Based Access Control):**
    *   `FARMER`: 본인이 소유한 농장(`farms`)과 데이터(`data_entries`)에만 CRUD 권한을 가집니다.
    *   `B2B_CLIENT`: 구매한 `market_products` 및 연관된 `synthetic_data`에 한해 읽기(GET) 권한만 가집니다. 원본 농장 정보에는 접근할 수 없습니다.
    *   `ADMIN`: 전체 대시보드 조회 및 회원, 마켓 상품 활성화 등 전역 권한을 가집니다.

## 3. Google Drive 최소 권한 원칙 (Least Privilege)

MDGA 시스템은 사용자 편의성을 위해 Google Drive를 Data Lake로 사용하지만, 보안 사고를 방지하기 위해 엄격한 스코프를 적용합니다.

*   **적용 Scope:** `https://www.googleapis.com/auth/drive.file`
*   **의미:** 애플리케이션은 사용자의 전체 구글 드라이브(문서, 메일 첨부파일 등)를 탐색할 수 **없습니다.**
*   **작동 방식:** 앱 인증을 통해 업로드된 특정 영농 일지 이미지 파일에 대해서만 조회 및 삭제(수정) 권한을 가집니다. 이는 만약 MDGA 서버가 해킹당하더라도 사용자의 개인적인 드라이브 데이터가 통째로 유출되는 것을 막는 핵심 방어선입니다.

## 4. Supabase 데이터베이스 접근 제어 (RLS)

(향후 고도화 단계에서 적용 고려)
*   **Row Level Security (RLS):** 백엔드 API 레이어의 권한 검증에 더하여, Supabase DB 자체적으로 RLS 정책을 설정합니다.
*   예시 정책: `CREATE POLICY "User can view own farms" ON farms FOR SELECT USING (auth.uid() = user_id);`
*   이를 통해 백엔드 코드의 버그로 인해 발생할 수 있는 인가 우회(IDOR 등)를 데이터베이스 레벨에서 원천 차단합니다.
