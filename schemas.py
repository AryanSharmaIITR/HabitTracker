from datetime import date
from pydantic import BaseModel

class ScheduleItem(BaseModel):
    day_of_week: str
    start_time: str
    end_time: str

class CustomHabitCreate(BaseModel):
    key: str
    label: str
    color: str
    sort_order: int = 0
    schedule: list[ScheduleItem] = []

class CustomHabitUpdate(BaseModel):
    label: str | None = None
    color: str | None = None
    sort_order: int | None = None
    schedule: list[ScheduleItem] | None = None

class CustomHabitDataUpdate(BaseModel):
    completed: bool
    slot_index: int = 0

class CustomHabitReasonCreate(BaseModel):
    date: date
    habit_key: str
    slot_index: int = 0
    reason: str = ""
