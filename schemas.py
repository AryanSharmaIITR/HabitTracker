from datetime import date
from pydantic import BaseModel

class HabitTrackerCreate(BaseModel):
    date: date
    gym: bool = False
    wakeUp: bool = False
    gate: bool = False
    aimlRevision: bool = False
    upSkill: bool = False
    codeForces: bool = False

class excuseCreate(BaseModel):
    date: date
    reasonOfWakeUp: str
    reasonOfGym: str
    reasonOfGate: str
    reasonOfAimlRevision: str
    reasonOfUpSkill: str
    reasonOfCodeForces: str