# MDGA - 핵심 비즈니스 로직 및 규칙 (Business Rules) v2.0

본 문서는 데이터 파이프라인, 공간 롤업 연산, AI 파싱 원칙, 그리고 시뮬레이션 엔진에 적용되는 핵심 수식과 제약사항을 구체적으로 정의합니다. 개발 과정에서 반드시 지켜야 할 "진실 공급원"입니다.

## 1. 공간 계층 롤업 알고리즘 (Hierarchy Roll-up)

모든 지역별 요약 데이터는 하위 개체(Farm)에서 상위 개체(Region)로 상향식(Bottom-Up) 집계 연산을 통해 도출됩니다.

### 1.1 계층 구조 정의
*   `Level 1 (Leaf)`: Farm (개별 농장)
*   `Level 2 (Node)`: Region - City/Town (시/군/구/읍/면/동)
*   `Level 3 (Root)`: Region - Province (도/광역시)

### 1.2 집계(Aggregation) 수식 및 단위
1.  **온도/습도 (Temperature, Humidity):**
    *   **공식:** 하위 `Farm`들의 산술 평균(Arithmetic Mean).
    *   `Region.avg_temp = SUM(Farm.temperature) / COUNT(Farm)`
    *   **단위:** 섭씨(℃), 퍼센트(%) 소수점 첫째 자리 반올림.
2.  **생산량/수확량 (Yield):**
    *   **공식:** 하위 `Farm`들의 총합(Sum).
    *   `Region.total_yield = SUM(Farm.yield)`
    *   **단위:** 킬로그램(kg) 기준 정수 처리.
3.  **병해충 발생률 (Pest/Disease Rate):**
    *   **공식:** 병해충 발생(`pest_disease == True`) 농장 수 / 전체 농장 수 * 100
    *   `Region.pest_rate = (COUNT(Farm WHERE pest_disease=True) / COUNT(Farm)) * 100`

### 1.3 성능(Performance) 고려사항
*   롤업 연산은 데이터 적재 시 마다 동기적(Synchronous)으로 수행하지 않습니다.
*   **비동기 스케줄링:** 매시 정각 Background Worker (또는 DB Materialized View)가 계산하여 결과값을 캐싱(Redis 등)해 둡니다. 이는 지도 화면 렌더링 시 응답 속도(<500ms)를 보장하기 위함입니다.

---

## 2. Gemini 멀티모달 프롬프트 규칙 (AI Parsing Rules)

사용자의 비정형 입력(자연어 텍스트 + 사진)을 정형 데이터로 변환하기 위한 프롬프트 엔지니어링 가이드라인입니다.

### 2.1 Intent Classification (의도 분류)
입력 텍스트를 분석하여 사용자의 목적을 파악합니다.
*   `DATA_ENTRY`: "오늘 딸기 10상자 땄고, 온도 28도 였음" -> 데이터 적재 의도.
*   `QUERY`: "저번주 우리 농장 평균 온도가 어떻게 돼?" -> 데이터 조회 의도.
*   `DELETE`: "방금 올린 일지 잘못올림 지워줘" -> 데이터 삭제 의도 (안전망 처리 필요).

### 2.2 Entity Extraction (정보 추출 규격)
`DATA_ENTRY`로 판별된 경우, 모델은 아래의 **JSON Schema**를 엄격히 준수하여 응답해야 합니다. `google-genai` SDK의 `response_schema` 파라미터를 강제합니다.

```json
{
  "type": "object",
  "properties": {
    "crop_type": { "type": "string", "description": "언급된 작물 이름 (예: 딸기, 토마토)" },
    "temperature": { "type": "number", "description": "텍스트에서 언급된 온도 수치" },
    "growth_stage": { "type": "string", "enum": ["파종", "육묘", "개화", "결실", "수확", "알수없음"] },
    "pest_disease_detected": { "type": "boolean", "description": "텍스트 또는 이미지에서 병해충, 시듦 현상이 보이면 true" }
  },
  "required": ["pest_disease_detected"]
}
```

---

## 3. 작황 시뮬레이션 및 THI 산출 규칙 (Simulator Engine)

데이터 마켓에 판매할 합성 데이터(Synthetic Data)를 생성하는 시뮬레이터의 핵심 산출 공식입니다.

### 3.1 THI (온습도지수, Temperature-Humidity Index) 공식
작물이나 가축이 받는 열 스트레스를 정량화합니다.
*   **공식:** `THI = (0.81 * T) + (0.01 * H * ((0.99 * T) - 14.3)) + 46.3`
    *   `T`: 섭씨 온도 (℃)
    *   `H`: 상대 습도 (%)
*   **경보 등급 분류 (Category):**
    *   `THI < 72`: 쾌적 (NORMAL)
    *   `72 <= THI < 79`: 주의 (MILD_STRESS) - 환기 권장
    *   `79 <= THI < 89`: 경고 (HIGH_STRESS) - 작물 생장 지연 발생 구간
    *   `THI >= 89`: 위험 (EXTREME_DANGER) - 작물 고사 위험

### 3.2 시나리오별 수확량 변동성 (Yield Change) 예측 모델
미래 기상 예보 시나리오를 바탕으로 작황 감소율을 계산하는 단순화된 시뮬레이션 모델입니다.
*   **공식:** `Simulated Yield = Baseline Yield * (1 - Climate Stress Factor)`
*   **Baseline Yield (기준 수확량):** 최근 3년 해당 월의 평균 수확량 (DB 통계치).
*   **Climate Stress Factor (기후 스트레스 계수):**
    *   `시나리오(EXTREME_HEAT)` 적용 시: `(예상 평균 최고기온 - 작물별 임계 온도) * 0.05`
    *   *제약:* 스트레스 계수는 0(영향없음) 이상 1(전체 고사) 이하의 값을 가집니다. 임계 온도 미만일 경우 계수는 0으로 처리합니다.
    *   *예시:* 딸기 임계 온도 28도. 폭염 시나리오로 예상 평균 온도가 31도가 될 경우 -> `(31 - 28) * 0.05 = 0.15` (15% 수확량 감소 예상).

---

## 4. 데이터 상품화 및 보안 원칙 (Data Privacy & Market)

1.  **개인정보 비식별화 (Anonymization):**
    *   마켓에서 판매, 조회되는 모든 합성 데이터 및 집계 데이터는 `Farm`의 고유 메타데이터(소유자 이름, 정확한 지번 주소 등)를 **절대 포함해서는 안 됩니다.**
    *   오직 `Region` 수준(최소 읍/면/동 단위)으로 롤업(Roll-up)되거나 노이즈가 추가된 시뮬레이션 결과만 제공되어야 합니다.
2.  **API 접근 제어 (API Key Scopes):**
    *   마켓에서 발급받은 API Key는 `market_products` 엔드포인트 중 구매한 패키지의 `synthetic_data_id` 범위 내에서만 읽기 권한(`GET`)을 가집니다. 쓰기나 원본(`data_entries`) 접근은 전면 차단됩니다.
