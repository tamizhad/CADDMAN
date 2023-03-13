$(document).ready(function () {

    $('#login-btn').on('click', function () {

        // var type = "danger";   //info, success, warning, danger
        // var title = "Error";
        // var message = "msg<br/>Content";
        // showMessage(type, title, message);

        var params = {
            "username": $("#username").val(),
            "password": $("#password").val()
        }

        $.ajax({
            type: "POST",
            url: "/authenticate",
            data: params,
            success: function (data) {
                $("#resultarea").text(data);
            },
            error: function (data) {
                $("#resultarea").text(data);
            },
        });


    })

    function dismissMessage() {
        const notification = document.querySelector('.notification');
        notification.classList.remove('received');
    }

    function showMessage(type, title, messageContent) {
        const notification = document.querySelector('.notification');
        const message = document.querySelector('.notification__message');
        $('.notification__message h1').html(title);
        $('.notification__message p').html(messageContent);

        message.className = `notification__message message--` + type;
        notification.classList.add('received');
        const button = document.querySelector('.notification__message button');
        button.addEventListener('click', dismissMessage, {
            once: true
        });
    }

})