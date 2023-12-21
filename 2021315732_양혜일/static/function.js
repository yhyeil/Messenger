var currUser;

$(document).ready(function(){
    $("#errorMessage").empty();

    $("#loginBtn").click(function(e){
        e.preventDefault();
        var userId = $("#login_id").val();
        var password = $("#login_pw").val();

        $.ajax({
            url: '/login', // 로그인 처리를 위한 서버의 URL
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                userId: userId,
                password: password
            }),
            success: function(response){
                currUser = userId;
                document.cookie = "currUser=" + userId + "; path=/";
                window.location.href="/fList";
            },
            error: function(response){
                $("#errorMessage").text('로그인에 실패하였습니다. 아이디와 비밀번호를 확인해주세요').show();
            }
        });
    });
});