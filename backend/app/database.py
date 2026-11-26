import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import URL, create_engine

# Load the .env file from the backend folder
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

required_settings = ["DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT", "DB_NAME"]
missing_settings = [name for name in required_settings if not os.getenv(name)]

if missing_settings:
    raise RuntimeError(
        f"Missing settings in .env: {', '.join(missing_settings)}"
    )

database_url = URL.create(
    drivername="postgresql+psycopg",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT")),
    database=os.getenv("DB_NAME"),
)

engine = create_engine(database_url, pool_pre_ping=True)