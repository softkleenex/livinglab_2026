# MDGA - 인프라 확장 및 마이그레이션 가능성 (Future Expansion)

본 문서는 현재 구축된 라이브 환경(Render, Supabase, Cloudflare, Drive)을 기반으로, 향후 서비스 규모가 커지거나 요구사항이 복잡해질 때 고려해야 할 인프라 확장(Scale-up/out) 및 마이그레이션 로드맵을 정의합니다.

## 1. 데이터 저장소 고도화 (Storage Migration)

### 1.1 Google Drive -> AWS S3 / Cloudflare R2
*   **현재:** 초기 비용 0원 및 관리자 시각적 편의를 위해 Google Drive API 사용.
*   **한계:** 대규모 트래픽 발생 시 API Rate Limit 발생 가능성, 파일 구조적 관리(Object Storage로서의 기능) 부족, CDN 캐싱 한계.
*   **확장 로드맵:** 데이터 100GB 초과 또는 트래픽 증가 시 **AWS S3** 또는 **Cloudflare R2**(Egress 비용 무료)로 마이그레이션.
*   **마이그레이션 방안:** DB의 `data_entries.image_url` 필드를 Drive ID 기반 구조에서 S3 객체 키 기반으로 전환. 백엔드의 스토리지 추상화 레이어(`StorageService`)만 교체하도록 설계.

### 1.2 Supabase PostgreSQL -> PostGIS 도입
*   **현재:** `polygon_data`를 JSONB 형태로 저장하고, 공간 롤업 연산 로직을 백엔드 서버(Python) 메모리 상에서 수행.
*   **한계:** 농장 수가 10만 개 이상 늘어나고 복잡한 반경 검색(예: "특정 좌표 반경 10km 이내의 농가 데이터 집계")이 필요해질 경우 Python 연산 부하 극심.
*   **확장 로드맵:** PostgreSQL의 공간 데이터 확장 모듈인 **PostGIS** 활성화.
*   **마이그레이션 방안:** `ST_Contains`, `ST_Intersects` 등의 SQL 함수를 사용하여 공간 집계 연산을 데이터베이스 레이어로 푸시다운(Push-down).

## 2. 백엔드 아키텍처 및 성능 확장 (Backend Scalability)

### 2.1 Redis 캐싱 계층 (Caching Layer) 도입
*   **현재:** 롤업 연산 결과나 Twin Map에 렌더링될 데이터가 API 호출 시 동적으로 계산되거나 RDBMS를 찔러 반환됨.
*   **확장 로드맵:** Redis (Upstash, AWS ElastiCache 등) 도입.
*   **마이그레이션 방안:** 매시 정각 롤업된 Region 레벨의 데이터를 Redis에 캐싱해두고, 지도 렌더링 요청(`GET /map/regions/rollup`)은 Redis에서 Sub-millisecond 단위로 응답.

### 2.2 비동기 메시지 큐 (Task Queue) 적용
*   **현재:** AI 파싱 작업, 롤업, 시뮬레이터 로직이 HTTP Request 주기 내에서 동작하거나 간단한 BackgroundTasks로 처리됨.
*   **한계:** 대규모 사진 일괄 업로드 시 타임아웃 발생 위험.
*   **확장 로드맵:** **Celery + RabbitMQ / Redis** 기반 워커(Worker) 분리.
*   **마이그레이션 방안:** "데이터 업로드 -> 수신 완료(202) -> Task Queue 전달 -> 워커 노드에서 Gemini 파싱 및 DB 적재 -> 프론트엔드 폴링 또는 WebSocket(SSE)으로 상태 알림" 패턴으로 진화.

## 3. AI 모델 서빙 독립 (AI Serving)

### 3.1 Gemini 의존성 탈피 -> 자체 LLM 호스팅
*   **현재:** 외부 API(Google Gemini 2.5 Pro Vision) 의존.
*   **한계:** 벤더 락인(Vendor Lock-in), 토큰 과금 비용 지속 증가, 민감한 내부 영농 데이터 외부 전송 이슈.
*   **확장 로드맵:** 오픈소스 Vision-LLM (예: LLaVA, Qwen-VL)을 파인튜닝하여 자체 구축.
*   **인프라 요구사항:** RunPod, AWS SageMaker, 또는 Azure ML 기반의 GPU 인스턴스(A100, H100 등) 클러스터 구축.
*   **마이그레이션 방안:** `AI_Parser_Service` 내의 API Endpoint만 Google에서 내부 GPU 서버 주소로 변경.
