const answers = new Array(40);
var i = 0;
var socket = new WebSocket('ws://127.0.0.1:8181/', 'chat');
var name = 'u1'
socket.onopen = function () {

    name = "name" + Math.floor(Math.random() * Math.floor(700));

    socket.send('{"type": "join", "name":"' + name + '"}');
}

$('#sendBtn').on('click', function (e) {
    e.preventDefault();
    msg = $('#msg').val();
    socket.send('{"type": "msg", "msg": "' + msg + '","sender":"' + name + '"}');
    $('#msg').val('');
});


$('#msg').on('keypress', function (e) {
    if (e.which === 13) {
        e.preventDefault();
        msg = $('#msg').val();
        socket.send('{"type": "msg", "msg": "' + msg + '","sender":"' + name + '"}');
        $('#msg').val('');
    }
});
socket.onmessage = function (msg) {
    var data = JSON.parse(msg.data);
    switch (data.type) {
        case 'msg':
            if (data.name == name || (data.name == "MegaBot" && data.sender == name) || (data.name == "MegaBot" && data.sender == "MegaBot")) {
                var pClassName = data.name == "MegaBot" ? "bot-userName" : "user-userName";
                var pUserName = '<p class="' + pClassName + '">' + data.name + ':</p>';
                var className = data.name == "MegaBot" ? "bot-message" : "user-message";
                var msg = $('<div class="' + className + '">' + pUserName + data.msg +
                    '</div>');
            }
            $('#msgs').append(msg);
            answers[i] = data.msg;
            //document.write(answers[i]);
            i++;
            break;
        case 'join':
            $('#users').empty();
            for (var i = 0; i < data.names.length; i++) {
                var user = $('<div>' + data.names[i] + '</div>');
                $('#users').append(user);
            }
            break;
    }
};
