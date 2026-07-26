from database import Base
from sqlalchemy import Column, Boolean, DateTime, String

class habitTracker(Base):
    __tablename__ = "habitTracker"

    date = Column(DateTime, primary_key=True, index=True)
    gym  = Column(Boolean, nullable=False)
    wakeUp = Column(Boolean, nullable=False)
    gate = Column(Boolean, nullable=False)
    aimlRevision = Column(Boolean, nullable=False)
    upSkill = Column(Boolean, nullable=False)
    codeForces = Column(Boolean, nullable=False)

class excuse(Base):
    __tablename__ = "excuse"
    date = Column(DateTime, primary_key=True, index=True)
    reasonOfWakeUp = Column(String(50), nullable=False)
    reasonOfGym = Column(String(50), nullable=False)
    reasonOfGate = Column(String(50), nullable=False)
    reasonOfAimlRevision = Column(String(50), nullable=False)
    reasonOfUpSkill = Column(String(50), nullable=False)
    reasonOfCodeForces = Column(String(50), nullable=False)


