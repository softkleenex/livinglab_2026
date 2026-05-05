from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "MDGA Enterprise B2B SaaS"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENV: str = "production"

    # Database
    DATABASE_URL: str = "sqlite:///./test.db"
    
    # Google OAuth
    GOOGLE_OAUTH_CLIENT_ID: str = ""
    GOOGLE_OAUTH_CLIENT_SECRET: str = ""
    GOOGLE_OAUTH_REFRESH_TOKEN: str = ""
    
    # Google Drive
    GOOGLE_DRIVE_FOLDER_ID: str = ""
    GOOGLE_SERVICE_ACCOUNT_JSON: str = ""

    # Google Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-pro"

    # Security
    ALLOWED_ORIGINS: str = "http://localhost:4173,http://localhost:5173,https://mdga-2026.pages.dev"
    B2B_API_KEYS: str = "mdga-b2b-snowflake-key,mdga-b2b-aihub-key"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        
    @property
    def b2b_api_keys_list(self) -> List[str]:
        return [key.strip() for key in self.B2B_API_KEYS.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
