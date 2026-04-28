# MDGA (Universal Data Engine) - Documentation Index

Welcome to the documentation directory for the **MDGA (Universal Data Engine)** project. This repository contains the architectural blueprints, evaluation metrics, troubleshooting guides, and historical design documents (archived) for the platform.

## 📌 Main Documents

These documents represent the current, active state of the project and its production environment.

*   **[00_FINAL_ARCHITECTURE_AND_EVALUATION.md](./00_FINAL_ARCHITECTURE_AND_EVALUATION.md)**
    *   The comprehensive guide to the final, refactored 3NF architecture.
    *   Contains the core technical stack details, database schema (Stateless Hierarchy Engine), AI integration workflows, and performance/security evaluation results (Lighthouse scores).
*   **[01_DEPLOYMENT_TROUBLESHOOTING.md](./01_DEPLOYMENT_TROUBLESHOOTING.md)**
    *   A log of issues encountered during the production deployment phase on Render and Cloudflare Pages.
    *   Includes bugfixes for Google Drive OAuth token expiration, ZIP file ingestion parsing errors, and Gemini API model/billing errors.

## 🗄️ Archives (Historical Documents)

The `archive/` directory contains older, superseded documents that track the evolutionary journey of the MDGA project from its initial MVP proposal to the final enterprise-grade pivot. These are kept for historical context and rationale.

*   `0_ARCHITECTURE.md` - Initial system architecture draft.
*   `1_PROPOSAL.md` - Early project proposal.
*   `2_STRATEGY.md` - Business and go-to-market strategy.
*   `3_TECHNICAL.md` - Early technical specifications.
*   `5_DATA_LIFECYCLE.md` - Initial data flow logic.
*   `8_REVISED_APP_FLOW.md` - Revisions to the application flow based on testing.
*   `9_FINAL_ARCHITECTURE.md` - The architecture prior to the final 3NF refactoring.
*   `10_SMART_FARM_PIVOT.md` - Strategic document detailing the pivot towards industry-specific verticals (e.g., Smart Farming).
*   `11_EVALUATION_PLAN.md` - The plan for testing the MVP.
*   `12_ARCHITECTURE_REFACTORING_PLAN.md` - The blueprint for moving from a monolithic structure to the current normalized hierarchy.
*   `13_FINAL_PITCH_SCRIPT.md` - Presentation script for the final project review.
*   `14_FINAL_TECH_SPECS.md` - Technical specifications pre-dating the final evaluation.
*   `16_SYSTEM_ENCAPSULATION_PLAN.md` - Strategy for modularizing and encapsulating the core logic.

## 📁 Other Directories

*   **`screenshots/`**: Visual evidence of evaluations, Lighthouse scores, and interface testing.
*   **`test_data/`**: Sample assets and data files used for unit/integration testing of the ingestion pipeline.
