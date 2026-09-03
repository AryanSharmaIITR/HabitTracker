import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base

load_dotenv(Path(__file__).parent.parent / ".env")
URL = os.getenv("DATABASE_URL", "")

engine = None
SessionLocal = None
Base = declarative_base()


def _init_db():
    global engine, SessionLocal
    if engine is not None:
        return
    engine = create_engine(URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    try:
        db_name = URL.rsplit("/", 1)[-1].split("?")[0]
        server_url = URL.rsplit("/", 1)[0]
        tmp_engine = create_engine(server_url)
        with tmp_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}`"))
            conn.commit()
        tmp_engine.dispose()
    except OperationalError:
        pass
