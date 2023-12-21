from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "user"

    # index = Column(Integer, primary_key = True)
    userId = Column(String, primary_key=True)
    password = Column(String)
    profilePic = Column(String)
    des = Column(String)
    friends = relationship("Friends", foreign_keys="[Friends.user_id]", back_populates="user")

class Friends(Base):
    __tablename__="friends"
    index = Column(Integer, primary_key=True)
    user_id = Column(String, ForeignKey('user.userId'))
    friend_id = Column(String, ForeignKey('user.userId'))
    user = relationship("User", foreign_keys=[user_id], back_populates="friends")
    friend = relationship("User", foreign_keys=[friend_id])


class Messages(Base):
    __tablename__ = "messages"

    index = Column(Integer, primary_key = True)
    userId = Column(String)
    text = Column(String)
    time = Column(String)
    sender = Column(String)
    receiver = Column(String)
    type = Column(String)