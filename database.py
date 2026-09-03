import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base

load_dotenv(Path(__file__).parent / ".env")

URL = os.getenv("DB_POSTGRES_URL") or os.getenv("DATABASE_URL", "")

engine = None
SessionLocal = None
Base = declarative_base()


def _init_db():
    global engine, SessionLocal
    if engine is not None:
        return
    engine = create_engine(URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
