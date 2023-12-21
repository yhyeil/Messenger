$(document).ready(function () {
    $('#exitBtn').click(function(){
         window.location.href="/myDescription";
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
     let userId = getCookie('currUser');
     $('#myId').text(userId);

     $.ajax({
        url: '/get_user_pic_dscrpt/' + userId, 
        type: 'GET',
        success: function(user) {
            var profilePicSrc = user.profilePic ? 'data:image/jpeg;base64,' +user.profilePic : '../static/basicProfile.jpeg';
            $('#profilePic').attr('src', profilePicSrc);
            $('#description').text(user.description ? user.description : "");
        },
        error: function(error) {
            console.error('Error fetching user data:', error);
        }
     });


     $('#changeDesBtn').click(function() {
         var newDescription = $('#changeDes').val();
         $.ajax({
             url: '/update_description/', 
             type: 'POST',
             contentType: 'application/json',
             data: JSON.stringify({
                 userId: userId, 
                 description: newDescription
             }),
             success: function(response) {
                 window.location.href = '/myDescription';
             },
             error: function(error) {
                 console.error('Error updating description:', error);
             }
         });
     });

     $("#changePic").click(function(){
         $("#fileInput").click();
     });
     
     $("#fileInput").change(function(e){
         var file = e.target.files[0];
         if (!file) {
             return;
         }
         uploadProfilePic(file); 
     });

     function uploadProfilePic(file) {
         var reader = new FileReader();

         reader.onload = function(e) {
             var base64String = e.target.result.split(',')[1]; // Extract Base64 encoded string

             $.ajax({
                 url: '/upload_profile_pic',
                 type: 'POST',
                 contentType: 'application/json',
                 data: JSON.stringify({
                     userId: userId, 
                     profilePic: base64String
                 }),
                 success: function(response) {
                     
                     var profilePicSrc = e.target.result; 
                     $('#profilePic').attr('src', profilePicSrc);
                     
                 },
                 error: function(error) {
                     console.error('Error uploading profile picture:', error);
                 }
             });
         };

         reader.readAsDataURL(file);
     }

    $('#profilePic').click(function() {
        var src = $(this).attr('src');
        $('#enlargedImg').attr('src', src);
        $('#imageModal').css('display', 'block');
    });
    $('.close').click(function() {
        $('#imageModal').css('display', 'none');
    });
 });