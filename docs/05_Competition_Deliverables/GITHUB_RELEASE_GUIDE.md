# GitHub 릴리즈(Releases) 대용량 산출물 아카이빙 가이드 🌐📁

> **[안내]**  
> GitHub는 개별 파일당 100MB의 용량 제한을 엄격하게 적용하며, 50MB가 넘는 대용량 바이너리(PDF, PPTX, MP4 등)를 Git 커밋 히스토리에 포함시킬 경우 로컬 저장소의 클론/체크아웃 속도가 급격히 느려지는 **Git Bloat(저장소 비대화)** 현상이 발생합니다.  
> 이를 방지하고 깔끔한 아카이빙을 달성하기 위해, 본 저장소에서는 **GitHub Releases** 기능을 활용하여 대용량 파일을 외부에 안전하게 보관 및 다운로드할 수 있도록 구조화하였습니다.

---

## 🏆 왜 GitHub Releases를 사용해야 할까요?
1. **커밋 히스토리 경량화**: 로컬의 `.git` 용량을 최소화하여 다른 협업자나 평가관이 `git clone`을 1초 만에 실행할 수 있습니다.
2. **넉넉한 용량 지원**: 파일당 **최대 2GB**의 자산을 무료로 업로드할 수 있어, 고화질 최종 시연 동영상(138MB)도 아무런 제약 없이 업로드할 수 있습니다.
3. **간편한 다운로드**: 릴리즈에 업로드된 에셋은 고유한 영구 다운로드 URL(Static Download URL)을 제공하므로, 리드미(README)나 상세 문서 포털에서 다이렉트 다운로드 링크로 직관적인 연결이 가능합니다.

---

## 🚀 릴리즈 생성 및 업로드 5단계 가이드

본 가이드를 따라 로컬의 대용량 산출물들을 GitHub 릴리즈 에셋으로 업로드하면, **리드미에 미리 세팅(Pre-configured)해 둔 다운로드 링크가 자동으로 즉시 활성화**됩니다!

### 1단계: GitHub 저장소로 이동
* 웹 브라우저를 열고 프로젝트의 GitHub 저장소 페이지로 이동합니다:
  👉 `https://github.com/softkleenex/livinglab_2026`

### 2단계: Releases 페이지 진입
* 메인 화면 우측 하단의 **Releases** 섹션을 찾아 **"Create a new release"** (또는 기존 목록이 없다면 "Releases" 제목 클릭 후 "Draft a new release") 버튼을 누릅니다.

### 3단계: 태그 및 타이틀 정보 입력
* **Tag version**: `v1.0.0-archive` (반드시 이 형식으로 입력해야 리드미 링크가 올바르게 작동합니다)
* **Target branch**: `main`
* **Release title**: `🏆 MDGA 2026 리빙랩 대회 최종 아카이브 산출물`
* **Description**: 아래 텍스트를 복사하여 상세 설명란에 붙여넣으세요.
  ```markdown
  본 릴리즈는 대구 지역전략산업 문제해결 지식재산 리빙랩 2026 대회의 최종 아카이브용 대용량 산출물 저장소입니다.
  
  - 참가신청서 및 제안서 (PDF)
  - 중간/최종 발표 자료 (PPTX, PDF)
  - 중간/최종 시연 동영상 (MP4)
  - 공식 종합 활동보고서 및 회의록 (PDF)
  ```

### 4단계: 파일 드래그 앤 드롭 업로드 (가장 중요)
* 아래의 파일 목록을 릴리즈 하단의 **"Attach binaries by dropping them here or selecting them"** 영역에 드래그 앤 드롭하여 업로드합니다.
* **중요**: 다운로드 링크가 즉시 연동되도록 하기 위해, 파일명을 다음과 같이 설정하여 올려주시는 것을 권장합니다 (특수문자 및 공백 처리 최적화 완료).

| 로컬 원본 경로 | 릴리즈 업로드 권장 파일명 | 용량 | 비고 |
| :--- | :--- | :--- | :--- |
| `docs/05_Competition_Deliverables/00_Proposal/[MDGA_리빙랩_제안] 참가신청서_및_제안서_이상재.pdf` | `MDGA_Proposal_Application.pdf` | 1.4 MB | 제안서 |
| `docs/05_Competition_Deliverables/01_Intermediate/[MDGA_리빙랩_중간] 발표자료.pptx` | `MDGA_Intermediate_Slides.pptx` | 8.0 MB | 중간 발표 |
| `docs/05_Competition_Deliverables/01_Intermediate/[MDGA_리빙랩_중간] 시연영상.mp4` | `MDGA_Intermediate_Demo.mp4` | 30.4 MB | 중간 영상 |
| `docs/05_Competition_Deliverables/01_Intermediate/[MDGA_리빙랩_중간] 활동보고서_및_회의록.pdf` | `MDGA_Intermediate_Report.pdf` | 90.3 MB | 중간 보고서 |
| `docs/05_Competition_Deliverables/02_Final/[MDGA_리빙랩_최종] 발표자료.pptx` | `MDGA_Final_Slides.pptx` | 9.0 MB | 최종 발표 PPTX |
| `docs/05_Competition_Deliverables/02_Final/[MDGA_리빙랩_최종] 발표자료.pdf` | `MDGA_Final_Slides.pdf` | 2.9 MB | 최종 발표 PDF |
| `docs/05_Competition_Deliverables/02_Final/[MDGA_리빙랩_최종] 시연영상.mp4` | `MDGA_Final_Demo.mp4` | 138.8 MB | 최종 시연 영상 |
| `docs/05_Competition_Deliverables/02_Final/[MDGA_리빙랩_최종] 활동보고서_및_회의록.pdf` | `MDGA_Final_Report.pdf` | 52.2 MB | 최종 보고서 |

> [!TIP]
> 윈도우/맥 OS 간의 한글 자소분리 현상(NFC/NFD 인코딩 차이)이나 공백 문자로 인한 URL 깨짐 현상을 근본적으로 피하기 위해, 릴리즈 에셋 파일명은 위 표에 적힌 **영문 표준 파일명**으로 변경하여 업로드하시는 것을 강력 추천합니다.  
> 리드미(README.md)에 연동해 둔 `🌐 온라인 다운로드` 링크는 이 영문 파일명을 기준으로 완벽하게 세팅되어 있습니다!

### 5단계: 릴리즈 발행 (Publish Release)
* 모든 파일 업로드가 완료되면 하단의 **"Publish release"** 버튼을 클릭하여 공식 발행합니다.

---

## 🔗 연동 확인 및 다운로드 동작 원리
릴리즈가 정상적으로 발행되면, 다음과 같은 표준 GitHub Release Asset URL 포맷으로 전 세계 어디서든 고속 다운로드가 가능해집니다:
`https://github.com/softkleenex/livinglab_2026/releases/download/v1.0.0-archive/MDGA_Final_Demo.mp4`

프로젝트 루트 `README.md` 및 `docs/README.md`에는 로컬 파일 경로와 위 다운로드 주소가 조화롭게 설계되어 있으므로, 릴리즈 업로드 직후 즉시 모든 링크가 활성화됩니다.
