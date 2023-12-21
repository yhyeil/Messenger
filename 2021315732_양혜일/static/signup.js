
$(document).ready(function(){
    $("#rgst").click(function(){
        var userId = $("#userId").val();
        var password = $("#pwd").val();
        $("#errorMessage").empty();
        $.ajax({
            url: 'signup', 
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({
                userId: userId,
                password: password
            }),

            success: function(response){
                
                window.location.href="/login";
            },
            error: function(response){
                $("#errorMessage").text('회원가입에 실패하였습니다. 다른 아이디를 사용해보세요').show();
            }
        });
    });
});