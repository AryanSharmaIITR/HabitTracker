from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base

load_dotenv(Path(__file__).parent / ".env")
URL = os.getenv("DATABASE_URL")

def _ensure_database_exists():
    db_name = URL.rsplit("/", 1)[-1].split("?")[0]
    server_url = URL.rsplit("/", 1)[0]
    tmp_engine = create_engine(server_url)
    with tmp_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}`"))
        conn.commit()
    tmp_engine.dispose()

try:
    _ensure_database_exists()
except OperationalError:
    pass

engine = create_engine(URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
