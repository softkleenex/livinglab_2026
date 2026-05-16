# MDGA - 내부 REST API 명세서 (REST API Docs) v2.0

본 문서는 프론트엔드와 백엔드 간 통신을 위한 RESTful API 규격을 정의합니다.
Base URL: `http://api.domain.com/api/v1`

## 공통 응답 포맷 (Common Response Format)
모든 API는 다음의 규격에 맞추어 응답을 반환합니다 (에러 시 포함).
```json
// Success Response (HTTP 2xx)
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response (HTTP 4xx, 5xx)
{
  "success": false,
  "error_code": "ERR_VALIDATION", // 또는 "ERR_AUTH", "ERR_NOT_FOUND" 등
  "message": "입력값이 올바르지 않습니다.",
  "details": ["password: 최소 8자리 이상이어야 합니다."]
}
```

---

## 1. Auth (인증/인가)

### POST `/auth/login`
사용자 로그인 및 JWT(JSON Web Token) 발급.
*   **Request Body:** `{"email": "user@test.com", "password": "password123"}`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "access_token": "eyJhbGci...",
        "token_type": "bearer",
        "user": {"id": "uuid...", "role": "FARMER", "email": "user@test.com"}
      }
    }
    ```

---

## 2. Data Pipeline (영농 데이터 파이프라인)

### POST `/ingest/`
농민이 텍스트와 사진으로 영농 일지를 업로드하여 AI 자동 파싱 및 DB 적재 진행. (Auth 토큰 불필요, Guest 모드 지원)
*   **Request Headers:** `Content-Type: multipart/form-data`
*   **Request Body (FormData):**
    *   `location`: "대한민국/서울특별시" (String, 필수)
    *   `raw_text`: "오늘 온도는 30도, 토마토 수확을 시작함" (String, 선택)
    *   `image`: File (jpg, png, 선택)
    *   `is_guest`: "true" 또는 "false" (String)
    *   `industry`: "공공" 등 (String)
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "entry_id": "uuid...",
        "parsed_entities": {
          "temperature": 30.0,
          "growth_stage": "수확",
          "pest_disease": false
        }
      }
    }
    ```

### GET `/data/farm/{farm_id}`
특정 농가의 시계열 데이터 목록을 조회합니다. 페이징 처리 지원.
*   **Query Params:** `skip=0`, `limit=20`, `start_date=2026-05-01`, `end_date=2026-05-31`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "total_count": 50,
        "items": [
          {"id": "...", "record_date": "2026-05-01", "temperature": 28.5, "growth_stage": "개화"}
        ]
      }
    }
    ```

---

## 3. Hierarchy & Twin Map (공간 계층 데이터)

### GET `/map/regions/rollup`
Twin Map(지도)에 렌더링하기 위해 하위 농가의 데이터가 상위 지역 단위로 합산/평균된 GeoJSON 데이터를 반환합니다.
*   **Query Params:** `level=PROVINCE` (또는 `CITY`), `target_date=2026-05`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {
              "region_id": "uuid...",
              "name": "경상남도",
              "aggregated_avg_temp": 29.2,
              "aggregated_yield": 15000,
              "farm_count": 120
            },
            "geometry": { "type": "Polygon", "coordinates": [[[128.1, 35.1], ...]] }
          }
        ]
      }
    }
    ```

---

## 4. Simulator (시뮬레이터 엔진)

### POST `/simulate/generate`
특정 지역(또는 농가)에 대한 기후 시나리오 기반 합성 데이터를 생성합니다. (B2B 계정 이상 필요)
*   **Request Body:** 
    ```json
    {
      "target_region_id": "uuid...",
      "scenario": "EXTREME_HEAT",
      "target_period_start": "2026-07-01",
      "target_period_end": "2026-07-31"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "synthetic_data_id": "uuid...",
        "summary": {
          "avg_thi_index": 82.5,
          "expected_yield_change_percent": -12.4
        }
      },
      "message": "시뮬레이션 완료 및 합성 데이터 생성 성공"
    }
    ```

---

## 5. Market (마켓플레이스)

### GET `/market/products`
판매 중인 데이터 상품 목록을 조회합니다.

### POST `/market/purchase/{product_id}`
특정 합성 데이터 패키지를 구매하고 접근용 API Key를 반환합니다.
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "transaction_id": "txn_...",
        "api_key": "mdga_sk_..." // 클라이언트가 이후 데이터를 조회할 때 사용할 Key
      }
    }
    ```
