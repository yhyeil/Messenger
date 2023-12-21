$(document).ready(function () {

    $("#exitBtn").click(function(){
        window.history.back();
    });

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
    function enableDescriptionEditing(description) {
       
        $('#editDescriptionInput').val(description).show();
        $('#saveDescriptionBtn').show();
        var userId = getCookie('currUser');

       
    }
    function displayProfilePic(userId) {
        
        $.ajax({
            url: '/get_user_pic_dscrpt/' + userId, 
            type: 'GET',
            success: function(user) {
                var profilePicSrc = user.profilePic ? 'data:image/jpeg;base64,' +user.profilePic : '../static/basicProfile.jpeg';
                $('#profilePic').attr('src', profilePicSrc);
                $('#description').text(user.description ? user.description : "");
                $('#fId').text(userId);
            },
            error: function(error) {
                console.error('Error fetching user data:', error);
            }
        });
    }
    
    var friendId = getQueryParam("fId");
    if(friendId)
        displayProfilePic(friendId);

    $('#profilePic').click(function() {
        var src = $(this).attr('src');
        $('#enlargedImg').attr('src', src);
        $('#imageModal').css('display', 'block');
    });
    $('.close').click(function() {
        $('#imageModal').css('display', 'none');
    });
});