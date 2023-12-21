$(document).ready(function(){
    $("#errorMessage").empty();

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

    $("#fId").keypress(function(e){
        if (e.which == 13) {  
            $("#errorMessage").empty();
            $(".friendList").empty();

            var friendId = $("#fId").val();  
            $.ajax({
                url: '/searchUser',  
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ userId: friendId, password: "" }), // password 필드는 제거해도 됩니다.
                success: function(response) {
                    response.forEach(function(user) {
                        var searchedId = user.userId;
                        if (searchedId !== userId) {
                            var newFriendItem = $("<li></li>").addClass("friendItem");
                            var friendIdSpan = $("<span></span>").text(searchedId).addClass("friend_id");
                            var addButton = $("<button></button>").text("추가").addClass("addBtn");
            
                            newFriendItem.append(friendIdSpan).append(addButton);
            
                            addButton.click(function() {
                                $.ajax({
                                    url: '/addFriend',
                                    type: 'POST',
                                    contentType: 'application/json',
                                    data: JSON.stringify({ user_id: userId, friend_id: searchedId }),
                                    success: function(response) {
                                        window.location.href = "/fList";
                                    },
                                    error: function() {
                                        
                                    }
                                });
                            });
            
                            $(".friendList").append(newFriendItem);
                        }
                    });
                },
                error: function() {
                    $("#errorMessage").text('해당 아이디를 가진 유저를 찾지 못하였습니다.').show();
                }
            });
            
            
        }
    });

    $("#home").click(function(){
        window.location.href = "/fList"; // addFriend.html 페이지로 이동
    });
});
