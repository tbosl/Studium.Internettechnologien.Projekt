const answers = new Array(40);
var i = 0;
var socket = new WebSocket('ws://127.0.0.1:8181/', 'chat');
var name = 'u1'
socket.onopen = function () {

    name = "driver" + Math.floor(Math.random() * Math.floor(700));

    socket.send('{"type": "join", "name":"' + name + '"}');
}


function sendMessage() {
    msg = $('#msg').val();
    socket.send('{"type": "msg", "msg": "' + msg + '","sender":"' + name + '"}');
    $('#msg').val('');
}

$('#sendBtn').on('click', function (e) {
    e.preventDefault();
    sendMessage();
});


$('#msg').on('keypress', function (e) {
    if (e.which === 13) {
        e.preventDefault();
        sendMessage();
    }
});

function scrollToBottom(elementId) {
    var element = $("#" + elementId);
    element.scrollTop(element[0].scrollHeight);;
}

socket.onmessage = function (msg) {
    var data = JSON.parse(msg.data);
    switch (data.type) {
        case 'msg':
            if (data.name == name || (data.name == "MegaBot" && data.sender == name) || (data.name == "MegaBot" && data.sender == "MegaBot")) {
                var pClassName = data.name == "MegaBot" ? "bot-userName" : "user-userName";
                var pUserName = '<p class="' + pClassName + '">' + data.name + ':</p>';
                var className = data.name == "MegaBot" ? "bot-message" : "user-message";
                var msg = $('<div class="' + className + '">' + pUserName + replacePlaceholderLineBreaksWithLineBreaksAndTabs(data.msg) +
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
    scrollToBottom('msgs');
};

function replacePlaceholderLineBreaksWithLineBreaksAndTabs(msg) {
    let result = msg.replace(/{{\/n}}/g, "<br>");
    // result = replaceTabs(result);
    result = result.replace(/{{\/t}}/g, "&nbsp;");
    return result;
}
function replaceTabs(result) {
    let lines = result.split("<br>");
    for (let line of lines) {
        let targetLineLengthAtStartOfValue = 25;
        let startOfTab = line.indexOf("{{/t}}");
        if (startOfTab == -1) { // no tab in the line
            continue;
        }
        let requiredTabs = targetLineLengthAtStartOfValue - startOfTab;
        let spacer = "";
        for (let tab = 1; tab <= requiredTabs; tab++) {
            spacer += "&nbsp;";
        }
        let newline = line.replace("{{/t}}", spacer);
        result = result.replace(line, newline);
    }
    return result;
}