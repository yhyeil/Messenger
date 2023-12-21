from sqlalchemy.orm import Session
from sqlalchemy import or_, func, and_
from sqlalchemy.sql import case, expression

from fastapi import FastAPI, WebSocket, Request, Depends
from models import *
from schemas import MessageRequest

#친구 추가에 사용
def db_get_user(db: Session, user_id: str):
    users = db.query(User).filter(User.userId.like("%" + user_id + "%")).all()
    if users:
        return [{"userId": user.userId} for user in users]
    return None

#회원가입시 사용
def db_add_user(db: Session, item: Request):
    temp_user = db.query(User).filter(User.userId == item.userId).first()
    if temp_user:
        return False
    db_item = User(userId= item.userId, password=item.password)
    db.add(db_item)
    db.commit()
    db.refresh(db_item) 
    return True

#로그인에 사용
def authenticate_user(db: Session, user_id: str, password: str):
    user = db.query(User).filter(User.userId == user_id).first()
    if not user:
        return False
    if not user.password==password :
        return False
    return True

#친구추가에 사용
def db_add_friend(db: Session, user_id: str, friend_id: str):
    friend = db.query(Friends).filter(
        (Friends.user_id == user_id) & (Friends.friend_id == friend_id)
    ).first()

    if friend is not None:
        return None
    new_friend = Friends(user_id=user_id, friend_id=friend_id)
    db.add(new_friend)
    db.commit()
    db.refresh(new_friend)
    return new_friend

#친구목록에 사용
def db_get_friends(db: Session, user_id: str):
    # Query to join Friends and User tables
    friends_data = db.query(
        Friends.friend_id,
        User.profilePic
    ).join(
        User, Friends.friend_id == User.userId
    ).filter(
        Friends.user_id == user_id
    ).all()

    # Extracting friend IDs and profile pictures into a list of dictionaries
    friends_info = [{'friendId': data.friend_id, 'profilePic': data.profilePic} for data in friends_data]

    return friends_info


#채팅방 로드에 사용
def get_messages(db: Session, sender:str, receiver:str):
    messages = db.query(Messages).filter(
        or_(
            (Messages.sender == sender) & (Messages.receiver == receiver),
            (Messages.sender == receiver) & (Messages.receiver == sender)
        )
    ).all()
    return messages

#채팅시 사용
def add_messages(db: Session, item: MessageRequest):
    db_item = Messages(userId=item.userId, text=item.text, time=item.time, sender= item.sender, receiver=item.receiver, type=item.type)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db.query(Messages).all()

#채팅 목록에 사용
from sqlalchemy import func, or_, and_

def db_get_messageList(db: Session, userId: str):
    # Subquery to get the latest message for each pair
    subquery = db.query(
        func.min(Messages.sender, Messages.receiver).label('user_a'),
        func.max(Messages.sender, Messages.receiver).label('user_b'),
        func.max(Messages.time).label('max_time')
    ).filter(
        or_(Messages.sender == userId, Messages.receiver == userId)
    ).group_by(
        func.min(Messages.sender, Messages.receiver),
        func.max(Messages.sender, Messages.receiver)
    ).subquery()

    # Query to get the messages
    latest_messages = db.query(Messages).join(
        subquery,
        and_(
            or_(
                and_(Messages.sender == subquery.c.user_a, Messages.receiver == subquery.c.user_b),
                and_(Messages.sender == subquery.c.user_b, Messages.receiver == subquery.c.user_a)
            ),
            Messages.time == subquery.c.max_time
        )
    ).all()
    
    return latest_messages





#프로필 사진에 사용
def db_get_profile_pic(db: Session, userId: str):
    user = db.query(User).filter(User.userId == userId).first()
    if user:
        return {
            "profilePic": user.profilePic if user.profilePic else None,
            "description": user.des if user.des else None
        }
    else:
        return None

#상세설명 업데이트에 사용
def update_user_description(db:Session, usrId:str, descpriton:str):
    user = db.query(User).filter(User.userId == usrId).first()

    if not user:
        return False

    user.des = descpriton

    db.commit()
    db.refresh(user)
    return True
