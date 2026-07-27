from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from datetime import date, datetime, time
from typing import Annotated
import models
import schemas
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Integer

def _seed_today(db: Session):
    today = date.today()
    today_dt = datetime.combine(today, time.min)
    day_name = today.strftime("%A")
    schedules = (
        db.query(models.CustomHabitSchedule)
        .filter(models.CustomHabitSchedule.day_of_week == day_name)
        .all()
    )
    existing = (
        db.query(models.CustomHabitData)
        .filter(models.CustomHabitData.date == today_dt)
        .all()
    )
    existing_keys = {(r.habit_key, r.slot_index) for r in existing}
    added = 0
    for s in schedules:
        if (s.habit_key, s.slot_order) not in existing_keys:
            db.add(models.CustomHabitData(
                date=today_dt,
                habit_key=s.habit_key,
                slot_index=s.slot_order,
                completed=False,
            ))
            added += 1
    if added:
        db.commit()
        print(f"Seeded {added} empty habit slot(s) for {today}.")
    else:
        print(f"All habit slots already recorded for {today}.")

@asynccontextmanager
async def lifespan(app):
    models.Base.metadata.create_all(bind=engine)
    print("Database tables initialized.")
    db = SessionLocal()
    try:
        _seed_today(db)
    finally:
        db.close()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="react-assets")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


@app.get("/", response_class=HTMLResponse)
def main():
    return FileResponse("frontend/dist/index.html", headers={"Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0"})


def _save_schedule(db, habit_key, schedule):
    db.query(models.CustomHabitSchedule).filter(
        models.CustomHabitSchedule.habit_key == habit_key
    ).delete()
    for i, item in enumerate(schedule):
        db.add(models.CustomHabitSchedule(
            habit_key=habit_key,
            day_of_week=item.day_of_week,
            start_time=item.start_time,
            end_time=item.end_time,
            slot_order=i,
        ))

def _get_schedule(db, habit_key):
    rows = (
        db.query(models.CustomHabitSchedule)
        .filter(models.CustomHabitSchedule.habit_key == habit_key)
        .order_by(models.CustomHabitSchedule.day_of_week, models.CustomHabitSchedule.slot_order)
        .all()
    )
    return [{"day_of_week": r.day_of_week, "start_time": r.start_time, "end_time": r.end_time} for r in rows]


@app.get("/customHabits")
def get_custom_habits(db: db_dependency):
    habits = db.query(models.CustomHabit).order_by(models.CustomHabit.sort_order).all()
    return [
        {"id": h.id, "key": h.key, "label": h.label, "color": h.color, "sort_order": h.sort_order, "schedule": _get_schedule(db, h.key)}
        for h in habits
    ]


@app.post("/customHabits", status_code=status.HTTP_201_CREATED)
def create_custom_habit(habit: schemas.CustomHabitCreate, db: db_dependency):
    existing = db.query(models.CustomHabit).filter(models.CustomHabit.key == habit.key).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Habit key already exists")
    new_habit = models.CustomHabit(key=habit.key, label=habit.label, color=habit.color, sort_order=habit.sort_order)
    db.add(new_habit)
    db.flush()
    if habit.schedule:
        _save_schedule(db, habit.key, habit.schedule)
    db.commit()
    db.refresh(new_habit)
    return {"id": new_habit.id, "key": new_habit.key, "label": new_habit.label, "color": new_habit.color, "sort_order": new_habit.sort_order, "schedule": _get_schedule(db, new_habit.key)}


@app.put("/customHabits/{habit_id}", status_code=status.HTTP_200_OK)
def update_custom_habit(habit_id: int, habit: schemas.CustomHabitUpdate, db: db_dependency):
    existing = db.query(models.CustomHabit).filter(models.CustomHabit.id == habit_id).first()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Custom habit not found")
    for key, value in habit.model_dump(exclude_unset=True).items():
        if key != "schedule":
            setattr(existing, key, value)
    if habit.schedule is not None:
        _save_schedule(db, existing.key, habit.schedule)
    db.commit()
    db.refresh(existing)
    return {"id": existing.id, "key": existing.key, "label": existing.label, "color": existing.color, "sort_order": existing.sort_order, "schedule": _get_schedule(db, existing.key)}


@app.delete("/customHabits/{habit_id}", status_code=status.HTTP_200_OK)
def delete_custom_habit(habit_id: int, db: db_dependency):
    existing = db.query(models.CustomHabit).filter(models.CustomHabit.id == habit_id).first()
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Custom habit not found")
    db.query(models.CustomHabitData).filter(models.CustomHabitData.habit_key == existing.key).delete()
    db.query(models.CustomHabitSchedule).filter(models.CustomHabitSchedule.habit_key == existing.key).delete()
    db.delete(existing)
    db.commit()
    return {"message": f"Deleted custom habit '{existing.label}' and its data."}


@app.get("/customHabitData/{habit_date}")
def get_custom_habit_data(habit_date: date, db: db_dependency):
    records = (
        db.query(models.CustomHabitData)
        .filter(models.CustomHabitData.date == datetime.combine(habit_date, time.min))
        .all()
    )
    result = {}
    for r in records:
        if r.habit_key not in result:
            result[r.habit_key] = {}
        result[r.habit_key][r.slot_index] = r.completed
    return result


@app.put("/customHabitData/{habit_date}/{habit_key}", status_code=status.HTTP_200_OK)
def update_custom_habit_data(habit_date: date, habit_key: str, body: schemas.CustomHabitDataUpdate, db: db_dependency):
    target_date = datetime.combine(habit_date, time.min)
    existing = (
        db.query(models.CustomHabitData)
        .filter(
            models.CustomHabitData.date == target_date,
            models.CustomHabitData.habit_key == habit_key,
            models.CustomHabitData.slot_index == body.slot_index,
        )
        .first()
    )
    if existing:
        existing.completed = body.completed
    else:
        existing = models.CustomHabitData(date=target_date, habit_key=habit_key, slot_index=body.slot_index, completed=body.completed)
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return {"date": habit_date.isoformat(), "habit_key": existing.habit_key, "slot_index": existing.slot_index, "completed": existing.completed}


@app.get("/customHabitAll")
def get_all_custom_habit_data(db: db_dependency):
    records = db.query(models.CustomHabitData).all()
    result = {}
    for r in records:
        date_str = r.date.strftime("%Y-%m-%d")
        if date_str not in result:
            result[date_str] = {}
        if r.habit_key not in result[date_str]:
            result[date_str][r.habit_key] = {}
        result[date_str][r.habit_key][r.slot_index] = r.completed
    return result


@app.get("/habitStats")
def get_habit_stats(db: db_dependency):
    rows = (
        db.query(
            models.CustomHabitData.habit_key,
            func.sum(cast(models.CustomHabitData.completed, Integer)).label("completed_sum"),
            func.count().label("entry_count"),
        )
        .group_by(models.CustomHabitData.habit_key)
        .all()
    )
    stats = {
        r.habit_key: {"done": int(r.completed_sum or 0), "total": r.entry_count}
        for r in rows
    }
    for habit_key, s in stats.items():
        print(f"[habitStats] {habit_key}: {s['done']}/{s['total']}")
    return stats


@app.post("/customHabitReason", status_code=status.HTTP_201_CREATED)
def upsert_custom_habit_reason(body: schemas.CustomHabitReasonCreate, db: db_dependency):
    target_date = datetime.combine(body.date, time.min)
    existing = (
        db.query(models.CustomHabitReason)
        .filter(
            models.CustomHabitReason.date == target_date,
            models.CustomHabitReason.habit_key == body.habit_key,
            models.CustomHabitReason.slot_index == body.slot_index,
        )
        .first()
    )
    if existing:
        existing.reason = body.reason
    else:
        existing = models.CustomHabitReason(
            date=target_date,
            habit_key=body.habit_key,
            slot_index=body.slot_index,
            reason=body.reason,
        )
        db.add(existing)
    db.commit()
    db.refresh(existing)
    return {"date": body.date.isoformat(), "habit_key": existing.habit_key, "slot_index": existing.slot_index, "reason": existing.reason}


@app.get("/customHabitReason/{habit_date}")
def get_custom_habit_reasons(habit_date: date, db: db_dependency):
    records = (
        db.query(models.CustomHabitReason)
        .filter(models.CustomHabitReason.date == datetime.combine(habit_date, time.min))
        .all()
    )
    return [
        {"date": r.date.strftime("%Y-%m-%d"), "habit_key": r.habit_key, "slot_index": r.slot_index, "reason": r.reason}
        for r in records
    ]


@app.get("/customHabitReasonAll")
def get_all_custom_habit_reasons(db: db_dependency):
    records = (
        db.query(models.CustomHabitReason)
        .order_by(models.CustomHabitReason.date.desc())
        .all()
    )
    return [
        {"date": r.date.strftime("%Y-%m-%d"), "habit_key": r.habit_key, "slot_index": r.slot_index, "reason": r.reason}
        for r in records
    ]


if __name__ == "__main__":
    main()
