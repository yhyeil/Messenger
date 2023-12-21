from pydantic import BaseModel
from typing import Optional

class UserRequest(BaseModel):
    userId: str
    password: str
class UserCreate(UserRequest):
    pass

class FriendRequest(BaseModel):
    user_id: str
    friend_id : str
class FriendCreate(FriendRequest):
    pass

class MessageRequestBase(BaseModel):
    userId: str
    text: str
    time: str
    sender: str
    receiver: str
    type: str

class MessageCreate(MessageRequestBase):
    pass

class MessageRequest(MessageRequestBase):
    index: Optional[int]
    class Config:
        orm_mode = True