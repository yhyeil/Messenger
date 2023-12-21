$(document).ready(function(){
    $("#userId").empty();

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
    
    var userId = getCookie('currUser');
    if (userId) {
        $("#userId").text(userId); // 사용자 ID 표시
    }

    $("#addFriend").click(function(){
        window.location.href = "/addFriend"; // addFriend.html 페이지로 이동
    });
    
    $("#profilePic").click(function(){
        window.location.href="/myDescription";
    });

    displayProfilePic(userId);

    if(userId){
        $.ajax({
            url: '/getFriends',
            type:'POST',
            contentType: 'application/json',
            data: JSON.stringify({ user_id: userId, friend_id:"" }),
            success: function(friends) {
                friends.forEach(function(friend) {
                    var friendItem = $('<li></li>').addClass('fItem');
                    
                    var profilePicSrc = friend.profilePic ? 'data:image/jpeg;base64,' + friend.profilePic : '../static/basicProfile.jpeg';
                    var profileImg = $('<img>').attr('src', profilePicSrc).addClass('profile-pic');
                    friendItem.append(profileImg);
                    
                    profileImg.click(function(){
                        window.location.href = "/description?fId=" + friend.friendId;
                    });
            
                    var friendName = $('<span></span>').text(friend.friendId).addClass('friend-name');
                    friendItem.append(friendName);
                    
                    friendName.click(function() {
                        // 채팅 페이지로 이동, URL에 친구의 userId 포함
                        window.location.href = '/chat?friendId=' + friend.friendId;
                    });
            
                    $(".friendList").append(friendItem);
                });
            },
            error: function() {
                console.log("친구 목록을 가져오는데 실패했습니다.");
            }
        });
    }

    $("#logout").click(function(){
        window.location.href = "/login";
    });
    $("#message").click(function(){
        window.location.href = "/mList"; 
    });


    function displayProfilePic(userId) {
        $.ajax({
            url: '/get_user_pic_dscrpt/' + userId, 
            type: 'GET',
            success: function(data) {
                var profilePicSrc = data.profilePic ? 'data:image/jpeg;base64,' + data.profilePic : 'static/basicProfile.jpeg';
                var description = data.description ? data.description : '';
                
                $('#profilePic').attr('src', profilePicSrc); // Set the profile picture
                $('#mydes').text(description); // Set the description
            },
            error: function(error) {
                console.error('Error fetching user data:', error);
            }
        });
    }
    
    displayProfilePic(userId);
});
