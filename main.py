from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from datetime import date, datetime, time
from typing import Annotated
import models
import schemas
from database import engine, SessionLocal
from sqlalchemy.orm import Session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

# app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="react-assets")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


@app.get("/")
def main():
    return FileResponse("frontend/dist/index.html")


@app.get("/habitTracker/{habit_date}")
def get_habit_tracker(habit_date: date, db: db_dependency):
    record = (
        db.query(models.habitTracker)
        .filter(
            models.habitTracker.date == datetime.combine(habit_date, time.min)
        )
        .first()
    )
    return record


@app.get("/habitStats/{habit_date}")
def get_habit_stats(habit_date: date, db: db_dependency):
    record = (
        db.query(models.habitTracker)
        .filter(
            models.habitTracker.date == datetime.combine(habit_date, time.min)
        )
        .first()
    )
    habit_fields = ["gym", "wakeUp", "gate", "aimlRevision", "upSkill", "codeForces"]
    true_count = 0
    false_count = 0
    per_habit = {}
    for field in habit_fields:
        val = getattr(record, field, False) if record else False
        per_habit[field] = val
        if val:
            true_count += 1
        else:
            false_count += 1
    return {
        "date": str(habit_date),
        "trueCount": true_count,
        "falseCount": false_count,
        "total": len(habit_fields),
        "perHabit": per_habit,
    }


@app.get("/habitTrackerAll")
def get_all_habits(db: db_dependency):
    records = db.query(models.habitTracker).all()
    return [
        {
            "date": r.date.strftime("%Y-%m-%d"),
            "gym": r.gym,
            "wakeUp": r.wakeUp,
            "gate": r.gate,
            "aimlRevision": r.aimlRevision,
            "upSkill": r.upSkill,
            "codeForces": r.codeForces,
        }
        for r in records
    ]


@app.get("/excuseAll")
def get_all_excuses(db: db_dependency):
    records = db.query(models.excuse).all()
    return [
        {
            "date": r.date.strftime("%Y-%m-%d"),
            "reasonOfWakeUp": r.reasonOfWakeUp,
            "reasonOfGym": r.reasonOfGym,
            "reasonOfGate": r.reasonOfGate,
            "reasonOfAimlRevision": r.reasonOfAimlRevision,
            "reasonOfUpSkill": r.reasonOfUpSkill,
            "reasonOfCodeForces": r.reasonOfCodeForces,
        }
        for r in records
    ]


@app.post("/habitTracker", status_code=status.HTTP_201_CREATED)
def create_habit_tracker(habit: schemas.HabitTrackerCreate, db: db_dependency):
    new_habit = models.habitTracker(**habit.model_dump())
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit


@app.post("/excuse", status_code=status.HTTP_201_CREATED)
def create_excuse(excuse: schemas.excuseCreate, db: db_dependency):
    excuse_date = datetime.combine(excuse.date, time.min)
    new_excuse = (
        db.query(models.excuse)
        .filter(models.excuse.date == excuse_date)
        .first()
    )
    if new_excuse:
        for key, value in excuse.model_dump().items():
            if key != "date" and value:
                setattr(new_excuse, key, value)
    else:
        new_excuse = models.excuse(**excuse.model_dump())
        db.add(new_excuse)
    db.commit()
    db.refresh(new_excuse)
    return new_excuse


@app.delete("/habitTrackerDeleteAll", status_code=status.HTTP_200_OK)
def delete_all_habits(db: db_dependency):
    deleted_count = db.query(models.habitTracker).delete()
    db.commit()
    return {"message": f"Deleted {deleted_count} habit records."}

@app.delete("/excuseDeleteAll", status_code=status.HTTP_200_OK)
def delete_all_excuses(db: db_dependency):
    deleted_count = db.query(models.excuse).delete()
    db.commit()
    return {"message": f"Deleted {deleted_count} excuse records."}


@app.put("/habitTrackerUpdate/{habit_id}", status_code=status.HTTP_200_OK)
def update_habit_tracker(
    habit_id: date, habit: schemas.HabitTrackerCreate, db: db_dependency
):
    existing_habit = (
        db.query(models.habitTracker)
        .filter(
            models.habitTracker.date == datetime.combine(habit_id, time.min)
        )
        .first()
    )
    if not existing_habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found"
        )

    for key, value in habit.model_dump(exclude_unset=True).items():
        setattr(existing_habit, key, value)

    db.commit()
    db.refresh(existing_habit)
    return existing_habit


if __name__ == "__main__":
    main()
