var socket = new WebSocket('ws://127.0.0.1:8181/', 'chat');
const botName = "MegaBot";
var user = '';

/**
 * Load the content of the page based on the provided json data.
 * (Stored at project root: message-content.json)
 * 
 * @param {*} data The json data containing the content of the page. 
 */
function loadContent(data) {
    let content = data.chat;
    loadSharedContent(content);
    $('#info-text').html(content.infoText);
    $('#inputArea image').attr('src', content.sendButtonSrc);
}

/**
 * Generate a new random name for the user.
 * Open a new socket for the user and send a join message to the server.
 */
socket.onopen = function () {
    user = "driver" + Math.floor(Math.random() * Math.floor(700));
    socket.send('{"type": "join", "name":"' + user + '"}');
}

/**
 * Register the click event on the send button to send the message.
 */
$('#sendBtn').on('click', function (e) {
    e.preventDefault();
    sendMessage();
});

/**
 * Register the enter key on the input field to send the message.
 */
$('#msg').on('keypress', function (e) {
    if (e.which === 13) {
        e.preventDefault();
        sendMessage();
    }
});

/**
 * Sends the message to the server and resets the input field.
 */
function sendMessage() {
    msg = $('#msg').val();
    socket.send('{"type": "msg", "msg": "' + msg + '","sender":"' + user + '"}');
    $('#msg').val('');
}

/**
 * Scrolls to the bottom of the messages container.
 */
function scrollToBottom() {
    var element = $("#msgs");
    element.scrollTop(element[0].scrollHeight);;
}

/**
 * Sets up the action to be taken when the socket receives a message.
 * If the message is of type 'msg' it will create append the message to the chat container.
 * On each received message it will scroll to the bottom of the chat container.
 * 
 * @param {*} recevivedMsg The json object received as string from the socket.
 */
socket.onmessage = function (recevivedMsg) {
    var data = JSON.parse(recevivedMsg.data);
    if (data.type == 'msg') {
        var isMegaBot = data.name == botName;
        if (data.name == user || (isMegaBot && data.sender == user) || (isMegaBot && data.sender == botName)) {
            var messageToChat = prepareMessageContainer(data.msg, data.name);
        }
        $('#msgs').append(messageToChat);
        scrollToBottom();
    }
};

/**
 * Creates the string representation of the message container.
 * It dertermines the css class to use based on the given name.
 * 
 * @param {str} msg  The message to be displayed in the container.
 * @param {str} name The name of the sender (either the bot or the user of the session).
 * 
 * @returns A string representation the HTML code for the div with the message and the name of the sender.
 */
function prepareMessageContainer(msg, name) {
    var pClassName = name == botName ? "bot-userName" : "user-userName";
    var pUserName = '<p class="' + pClassName + '">' + name + ':</p>';
    var messageClassName = name == botName ? "bot-message" : "user-message";
    var content = $('<div class="' + messageClassName + '">' + pUserName + insertLineBreaksForPlaceHolders(msg) +
        '</div>');
    return content;
}

/**
 * Replaces all placeholders of the format {{/n}} with line breaks.
 * This approach was necessary since \n was not working when provided in json and then sent to the server.
 * 
 * @param {string} msg The message to replace the placeholders in.
 * 
 * @returns The provided msg with all placeholders replaced.
 */
function insertLineBreaksForPlaceHolders(msg) {
    let result = msg.replace(/{{\/n}}/g, "<br>");
    return result;
}