$(document).ready(function () {

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

    var currentUserId = getCookie('currUser');

    $.ajax({
        url: '/getMessageList',
        type: 'GET',
        data: { userId: currentUserId, password:"" },
        success: function(messages) {
            // 서버로부터 받은 메시지를 사용하여 UI를 업데이트합니다.
            messages.forEach(function(message) {
                var messageElement = createMessageElement(message);
                $('.content').append(messageElement);

            });
        },
        error: function(error) {
            console.error("메시지를 가져오는 데 실패했습니다");
        }
    });


    function createMessageElement(message) {
        var opponentId = (message.sender === currentUserId) ? message.receiver : message.sender;

        var messageDiv = $('<div></div>').addClass('message');
        var opponentDiv = $('<div></div>').addClass('opponent');

        // Create an image element with a default picture
        var profilePic = $('<img>').attr('src', '../static/basicProfile.jpeg').css('width', '50px').css('border-radius','20px');

        // Fetch the opponent's profile picture and update the src attribute
        $.ajax({
            url: '/get_user_pic_dscrpt/' + opponentId,
            type: 'GET',
            success: function(data) {
                if (data.profilePic) {
                    var profilePicSrc = 'data:image/jpeg;base64,' + data.profilePic;
                    profilePic.attr('src', profilePicSrc);
                    
                }
            },
            error: function(error) {
                console.error('Error fetching profile picture:', error);
            }
        });

        var opponentName = $('<span></span>').addClass('opponent').text(opponentId);
        opponentDiv.append(profilePic).addClass("profilePic");
        opponentDiv.append(opponentName);

        var lastMessageDiv = $('<div></div>').addClass('lastMessage');
        if (message.type === 'image') {
            lastMessageDiv.text('사진을 보냈습니다');
        } else if (message.type === 'video') {
            lastMessageDiv.text('동영상을 보냈습니다');
        } else {
            lastMessageDiv.text(message.text);
        }

        messageDiv.append(opponentDiv);
        messageDiv.append(lastMessageDiv);

        messageDiv.click(function() {
            window.location.href = '/chat?friendId=' + opponentId;
        });

        return messageDiv;
    }

    function isBase64(str) {
        if (str === '' || str.trim() === '') { return false; }
        try {
            return btoa(atob(str)) == str;
        } catch (err) {
            return false;
        }
    }
    
    $("#addFriend").click(function(){
        window.location.href="/addChat"; 
    });
    $("#person").click(function(){
        window.location.href = "/fList"; // addFriend.html 페이지로 이동
    });
    $("#logout").click(function(){
        window.location.href = "/login";
    });
});