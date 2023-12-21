from fastapi import FastAPI, WebSocket, Request, Depends
from fastapi.responses import HTMLResponse , JSONResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.logger import logger
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from typing import List

from schemas import *
from crud import *
from models import Base, User, Friends
from database import SessionLocal, engine

Base.metadata.create_all(bind= engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app.mount("/static", StaticFiles(directory ="static", html = True), name ="static")

templates = Jinja2Templates(directory="templates")

#웹소켓 연결을 관리하는 클래스
class ConnectionManager:
    def __init__(self):
        #활성 websocket연결을 저장하는 리스트
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"{data}")
    except Exception as e:
        pass
    finally:
        await manager.disconnect(websocket)

@app.get("/")
async def client(request: Request):
    return templates.TemplateResponse("start.html", {"request": request})

@app.get("/login")
async def client(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
async def login(user_request: UserRequest, db:Session= Depends(get_db)):
    user = authenticate_user(db, user_request.userId, user_request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Incorrect username or password",
                            headers={"WWW-Authenticate": "Bearer"})
    return user_request.userId

@app.post("/signup")
async def add_user(request: UserCreate, db: Session = Depends(get_db)):
    result = db_add_user(db, request)
    if not result:
        raise HTTPException(status_code=400, detail="User already exists")
    return result

@app.get("/signup")
async def client(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

@app.get("/fList")
async def client(request: Request):
    return templates.TemplateResponse("fList.html", {"request": request})

@app.get("/addFriend")
async def client(request: Request):
    return templates.TemplateResponse("addFriend.html", {"request": request})

@app.post("/searchUser")
async def get_user(request: UserRequest, db: Session = Depends(get_db)):
    friend = db_get_user(db, request.userId)
    if friend:
        return friend
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
@app.post("/addFriend")
async def add_friend(request: FriendCreate, db: Session = Depends(get_db)):
    return db_add_friend(db, request.user_id, request.friend_id)

@app.post("/getFriends")
async def get_friends(request: FriendRequest, db: Session=Depends(get_db)):
    return db_get_friends(db, request.user_id)

@app.get("/chat")
async def chat(request: Request):
    return templates.TemplateResponse("chat.html", {"request": request})

@app.get("/get_messages/{senderId}/{receiverId}")
def get_data(senderId: str, receiverId: str, db:Session = Depends(get_db)):
    return get_messages(db, senderId, receiverId)

@app.post("/add_message")
def add_message(request: MessageCreate, db:Session = Depends(get_db)):
    return add_messages(db, request)

@app.get("/mList")
async def client(request: Request):
    return templates.TemplateResponse("mList.html", {"request": request})

@app.get("/getMessageList")
def getMessageList(userId: str, db:Session=Depends(get_db)):
    mlist = db_get_messageList(db, userId)
    print(mlist)
    return mlist
@app.get("/description")
async def client(request: Request):
    return templates.TemplateResponse("description.html", {"request": request})

@app.get("/get_user_pic_dscrpt/{user_id}")
async def get_user_pic_dscrpt(user_id: str, db: Session = Depends(get_db)):
    user_data = db_get_profile_pic(db, user_id)
    if user_data:
        return {
            "profilePic": user_data["profilePic"] if user_data["profilePic"] else None,
            "description": user_data["description"] if user_data["description"] else ""
        }
    else:
        return {"profilePic": None, "des": ""}

@app.get("/myDescription")
async def client(request: Request):
    return templates.TemplateResponse("myDescprition.html", {"request": request})

@app.post("/update_description")
async def update_description(description_data: dict, db: Session = Depends(get_db)):
    user_id = description_data.get("userId")
    description = description_data.get("description")
    success = update_user_description(db, user_id, description)
    if success:
        return {"message": "Description updated successfully"}
    else:
        raise HTTPException(status_code=400, detail="Error updating description")

@app.post("/upload_profile_pic")
async def upload_profile_pic(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    userId = data.get('userId')
    profilePic = data.get('profilePic')

    user = db.query(User).filter(User.userId == userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.profilePic = profilePic
    db.commit()
    return {"message": "Profile picture updated successfully"}

@app.get("/addChat")
async def client(request: Request):
    return templates.TemplateResponse("addChat.html", {"request": request})

@app.get("/editProfile")
async def client(request: Request):
    return templates.TemplateResponse("editProfile.html", {"request": request})


def run():
    import uvicorn
    uvicorn.run(app)

if __name__ == "__main__":
    run()