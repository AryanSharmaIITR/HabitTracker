from database import Base
from sqlalchemy import Column, Boolean, DateTime, String, Integer, UniqueConstraint

class CustomHabit(Base):
    __tablename__ = "custom_habits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(50), unique=True, nullable=False, index=True)
    label = Column(String(50), nullable=False)
    color = Column(String(9), nullable=False)
    sort_order = Column(Integer, default=0)

class CustomHabitData(Base):
    __tablename__ = "custom_habit_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(DateTime, nullable=False, index=True)
    habit_key = Column(String(50), nullable=False, index=True)
    slot_index = Column(Integer, nullable=False, default=0)
    completed = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        UniqueConstraint("date", "habit_key", "slot_index", name="uq_date_habit_slot"),
    )

class CustomHabitSchedule(Base):
    __tablename__ = "custom_habit_schedule"

    id = Column(Integer, primary_key=True, autoincrement=True)
    habit_key = Column(String(50), nullable=False, index=True)
    day_of_week = Column(String(10), nullable=False)
    start_time = Column(String(5), nullable=False)
    end_time = Column(String(5), nullable=False)
    slot_order = Column(Integer, nullable=False, default=0)

class CustomHabitReason(Base):
    __tablename__ = "custom_habit_reason"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(DateTime, nullable=False, index=True)
    habit_key = Column(String(50), nullable=False, index=True)
    slot_index = Column(Integer, nullable=False, default=0)
    reason = Column(String(500), nullable=False, default="")

    __table_args__ = (
        UniqueConstraint("date", "habit_key", "slot_index", name="uq_reason_date_habit_slot"),
    )
