# MDGA - 외부 API 연동 명세서 (External API Docs) v2.1

본 문서는 MDGA 시스템이 의존하는 외부 서드파티 서비스(Google Drive, Gemini, 기상청 등)의 호출 방식과 배포 환경에서의 제약사항을 정의합니다.

## 1. Google Drive API (Storage / Data Lake)
사용자가 업로드하는 영농일지 작물 사진 및 대용량 비정형 데이터를 저장합니다.

*   **Role:** MDGA 시스템의 기본 오브젝트 스토리지 (이미지 저장소).
*   **Endpoint:** `https://www.googleapis.com/drive/v3/files`
*   **Authentication:** OAuth 2.0 서비스 계정 (Service Account) 또는 Oauth Client ID.
*   **Security Scope:** `https://www.googleapis.com/auth/drive.file` (최소 권한 원칙)
    *   이 스코프를 사용하면 앱은 앱 자체가 생성한 파일과 폴더만 접근할 수 있어, 사용자의 전체 드라이브 데이터 유출 위험을 원천 차단합니다.
*   **Workflow:**
    1.  클라이언트(Cloudflare)에서 백엔드(Render)로 Multipart 이미지 업로드.
    2.  백엔드가 Google Drive API를 통해 특정 폴더에 이미지 저장.
    3.  반환받은 `File ID`와 `webViewLink`를 Supabase의 `data_entries` 테이블에 저장.

## 2. Google Gemini API (Multimodal AI)
영농 일지 텍스트와 작물 사진을 정형 데이터로 변환합니다.

*   **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent`
*   **SDK:** Python `google-genai` 패키지 사용
*   **Authentication:** `GEMINI_API_KEY` (Render.com 환경변수에 등록)
*   **Usage/Constraints:**
    *   응답은 반드시 `response_mime_type="application/json"` 파라미터를 사용하여 JSON 형식으로 강제해야 함.
    *   이미지 파싱 시, Google Drive에 저장된 이미지를 다운로드하여 Base64로 인코딩한 뒤 Gemini에 전달하거나, 가능할 경우 URI를 통해 직접 참조.

## 3. 기상청 단기/중기 예보 API (공공데이터포털)
지역별 일별 기온, 습도, 강수량 데이터를 수집합니다.

*   **Provider:** 공공데이터포털 (data.go.kr)
*   **Endpoint (단기예보 예시):** `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst`
*   **Authentication:** `DATA_GO_KR_API_KEY` (Render.com 환경변수)
*   **Parameters:**
    *   `nx`, `ny`: 격자 좌표
    *   `dataType`: "JSON" 명시
*   **Scheduler Logic:**
    *   Render 백엔드 환경에서 APScheduler 등을 활용하여 매일 2회 스케줄러 수행.
    *   Supabase의 `weather_data` 테이블 갱신.
