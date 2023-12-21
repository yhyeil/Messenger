"use strict";

var ws;

$(document).ready(function () {
  // 쿠키에서 현재 사용자 ID를 검색하는 함수
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }

  function getQueryParam(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  var chatWindow = $('#sender');
  chatWindow.scrollTop(chatWindow[0].scrollHeight);

  var userId = getCookie('currUser');
  var receiverId =  getQueryParam("friendId");

  $.ajax({
    url: '/get_messages/' + userId + '/' + receiverId,
    type: 'GET',
    success: function(messages) {
      messages.forEach(function (message){
        addMessageToChat(message, userId);
      })
      var senderElement = $("#messages");
      senderElement.scrollTop(senderElement[0].scrollHeight);
    },
    error: function() {
        console.log("메시지를 가져오는데 실패했습니다.");
    }
  });

  ws = new WebSocket("ws://localhost:8000/ws");
  ws.onmessage = function(event){
    //websocket연결을 통해 서버로부터 실시간으로 메세지가 전송될때 호출
    var data = JSON.parse(event.data);
    if(userId == data.receiver && userId !==data.sender){
      addMessageToChat(data, userId);
    }
  }

  //enter 버튼에 대하여 작동시키기
  $("button[name='sender_button']").click(sender_send);

  //enter키를 눌러도 보내지기
  $("#sender_text").keypress(function (e) {
    if (e.which == 13) {
      sender_send();
      e.preventDefault();
    }
  });

  //단 enter+shift가 눌리면 줄바꿈
  $("#sender_text").keydown(function (e) {
    if(e.which == 13 && e.shiftKey) {
      let text = $(this).val();
      $(this).val(text + "\n");
      e.preventDefault();
    }
  });

  function sender_send() {

    //첫번째 대화창에서 메세지를 보낸경우
    let text = $("#sender_text").val();
    let time = new Date();
  
    if (text.length === 0) {
      return;
    }
    if (!text.trim().length) {
      return;
    }
  
    if (text.endsWith("\n")) {
      text += "\n";
    }
  
    //서버로 보낸다
    var userId = getCookie('currUser');
    var receiverId =  getQueryParam("friendId");
    let data = {"userId": userId, "text": text, "time": time.toISOString(), "sender": userId, "receiver":receiverId};
    
    ws.send(JSON.stringify(data));
    
    $.ajax({
      url:'add_message',
      type: "post",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        userId: userId,
        text: text,
        time: time.toISOString(),
        sender: userId,
        receiver: receiverId,
        type: 'text'
      }),
  
      success: function(messages){
        //kakao page에 표시한다
        text = text.replace(/ /g, "&nbsp;"); //여러 스페이스바를 모두 표시
        text = text.replace(/\n/g, "<br>"); //줄바꿈표시
        time = getTime(time);
        
  
        let newMessage =
          "<div class ='sender_message' >" +
          "<div class='s_time'>" +
          time +
          "</div>" +
          "<div class='sender'>" +
          text +
          "</div>" +
          "</div>";
  
        $("#messages").append(newMessage);
        var senderElement = $("#sender");
        senderElement.scrollTop(senderElement[0].scrollHeight);
        $("#sender_text").val("");
      }
    });
    
  }

  function sendFile(file) {
    var reader = new FileReader();
  
    var userId = getCookie('currUser');
    var receiverId = getQueryParam("friendId");
    let time = new Date();
  
    reader.onload = function(e) {
        var base64String = e.target.result.split(',')[1]; // Base64 인코딩된 문자열 추출
        var messageType = file.type.startsWith('image/') ? 'image' : 
                          file.type.startsWith('video/') ? 'video' : 'unknown';
        if (file.type.startsWith('image/')) {
            var img = new Image();
            img.src = e.target.result;
            img.onload = function() {
              var base64String = e.target.result.split(',')[1];
              // Update data with resized image
              var data = {
                  userId: userId, 
                  text: base64String, 
                  time: time.toISOString(),
                  sender: userId,
                  receiver: receiverId,
                  type: messageType
              };
              ws.send(JSON.stringify(data));
              
              $.ajax({
                url: '/add_message',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(data),
                success: function(response) {

                    var content = $('<img>').attr('src', 'data:image/jpeg;base64,' + base64String).css('width','200px');
                    
                    var time = getTime(new Date());
                    let newMessage = $("<div class='sender_message'>" +
                        "<div class='s_time'>" + time + "</div>" +
                        "</div>");
                    newMessage.append(content);
                    $("#messages").append(newMessage);

                    setupImageClickEvent(content, 'data:image/jpeg;base64,' + base64String); 
            
                    var senderElement = $("#sender");
                    senderElement.scrollTop(senderElement[0].scrollHeight);
                },
                error: function(xhr, status, error) {
                    console.error('메시지 전송 실패:', error);
                }
              });
            };
        } 
        else if (file.type.startsWith('video/')) {
          var fileData = e.target.result.split(',')[1];

          var data = {
            userId: userId, 
            text: fileData, 
            time: time.toISOString(),
            sender: userId,
            receiver: receiverId,
            type: messageType
          };
          ws.send(JSON.stringify(data));
          $.ajax({
              url: '/add_message', 
              type: 'POST',
              contentType: 'application/json',
              dataType: 'json',
              data: JSON.stringify(data),
              success: function(response) {
                  
                  var content = $('<video controls>').attr('src', URL.createObjectURL(file)).css('width','200px');
                  let newMessage = $("<div class='sender_message'>" +
                           "<div class='s_time'>" + getTime(time) + "</div>" +
                           "</div>");
                  newMessage.append(content);
                  $("#messages").append(newMessage);
                  var senderElement = $("#sender");
                  senderElement.scrollTop(senderElement[0].scrollHeight);
              },
              error: function(error) {
                  console.error('비디오 메시지 전송 실패:', error);
              }
          });
        }
        else {
            // For non-image files, proceed as usual
            var data = {
                userId: userId, 
                text: base64String, 
                time: time.toISOString(),
                sender: userId,
                receiver: receiverId
            };
            $.ajax({
                url: '/add_message',
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(data),
                success: function(response) {
                    console.log('메시지 전송 성공:', response);
                },
                error: function(xhr, status, error) {
                    console.error('메시지 전송 실패:', error);
                }
            });
        }
    };
  
    reader.readAsDataURL(file); // 파일을 Base64로 읽어들입니다.
  }
  $(document).on('click', '.message_image', function() {
    var imgSrc = $(this).attr('src');
    $("#img01").attr('src', imgSrc);
    $("#imageModal").css('display', 'block');
  });

  $("#attachment").click(function(e){
    $("#fileInput").click(); // 파일 입력 트리거
    
  });

  $("#fileInput").change(function(e){
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    sendFile(file);
  });

  function addMessageToChat(message, userId){
    let text = message.text.replace(/ /g, "&nbsp").replace(/\n/g, "<br>");
    let time = getTime(new Date(message.time));
    let msgSndr = message.sender;
    let msgRcvr= message.receiver;
    userId = getCookie('currUser');

    let receiverId = getQueryParam("friendId");
  
    let newMessage;
    let imgSrc;
    if(msgSndr == userId && msgRcvr==receiverId){ //로그인한 사람이 보낸 메세지인 경우-> 노란색
      if (message.type === 'image') {
        let imgSrc = "data:image/jpeg;base64," + message.text;
        newMessage = $("<div class='sender_message'><div class='s_time'>" + time + "</div><img src='" + imgSrc + "' class='message_image' style='width:200px;'></div>");
        setupImageClickEvent(newMessage.find('.message_image'), imgSrc);
      } else if (message.type === 'video') {
          let videoSrc = "data:video/mp4;base64," + message.text;
          newMessage = $("<div class='sender_message'><div class='s_time'>" + time + "</div><video src='" + videoSrc + "' controls style='width:200px;'></video></div>");
      } else { // Text message
          let text = message.text.replace(/ /g, "&nbsp").replace(/\n/g, "<br>");
          newMessage = $("<div class ='sender_message'>" +
                        "<div class='s_time'>" + time + "</div>" +
                        "<div class='sender'>" + text + "</div>" +
                        "</div>");
      }

    }else if(userId == msgRcvr && receiverId==msgSndr) { //로그인한 사람이 msgRcvr이면 ->하얀색
      if (message.type === 'image') {
        let imgSrc = "data:image/jpeg;base64," + message.text;
        newMessage = $("<div class='receiver_id'>" + msgSndr + "</div>" +
                       "<div class ='receiver_message'>" +
                       "<img src='" + imgSrc + "' class='message_image' style='width:200px;'>" +
                       "<div class='r_time'>" + time + "</div>" +
                       "</div>");
        setupImageClickEvent(newMessage.find('.message_image'), imgSrc);
      } else if (message.type === 'video') {
          let videoSrc = "data:video/mp4;base64," + message.text;
          newMessage = $("<div class='receiver_id'>" + msgSndr + "</div>" +
                        "<div class ='receiver_message'>" +
                        "<video src='" + videoSrc + "' controls style='width:200px;'></video>" +
                        "<div class='r_time'>" + time + "</div>" +
                        "</div>");
      } else { // Text message
          let text = message.text.replace(/ /g, "&nbsp").replace(/\n/g, "<br>");
          newMessage = $("<div class='receiver_id'>" + msgSndr + "</div>" +
                        "<div class ='receiver_message'>" +
                        "<div class='receiver'>" + text + "</div>" +
                        "<div class='r_time'>" + time + "</div>" +
                        "</div>");
      }
    }
    var messages = $('#messages');
    messages.append(newMessage);
    var senderElement = $("#sender");
    senderElement.scrollTop(senderElement[0].scrollHeight);
  }

  $("#exitBtn").click(function(){
    if (document.referrer.includes('/addChat')) {
      window.location.href = '/mList';
    } 
    else if(document.referrer.includes('/mList')){
      window.location.href = '/mList';
    }
    else {
      window.history.back();
    }
  });
  
  $('.close').click(function() {
    $("#imageModal").css('display', 'none');
  });

  function setupImageClickEvent(imageElement, imgSrc) {
    imageElement.click(function() {
        $("#img01").attr('src', imgSrc);
        $("#imageModal").css('display', 'block');
    });
  }
  
});

function getTime(date) {
  //현재 시간을 알맞는 포멧으로 변경
  let hours = date.getHours();
  let min = date.getMinutes();

  let ampm = hours >= 12 ? "오후" : "오전";

  hours = hours % 12;
  if (hours === 0) hours = 12;
  if (min < 10) min = "0" + min;

  let time = ampm + " " + hours + ":" + min;
  return time;
}

function isBase64(str) {
  if (str === '' || str.trim() === '') { return false; }
  try {
      return btoa(atob(str)) == str;
  } catch (err) {
      return false;
  }
}


