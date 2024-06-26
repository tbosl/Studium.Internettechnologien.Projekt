/**
 * File: chat.js
 * 
 * Description:
 * This JavaScript file is responsible for managing the chat functionality in a web
 * application. It establishes a WebSocket connection to a server for real-time
 * messaging and dynamically loads content into the chat interface based on JSON data
 * fetched from the server. The file defines the setup for the WebSocket connection,
 * including the handling of incoming and outgoing messages, and the dynamic loading
 * of message and page content from external JSON files (`message-content.json` and
 * `page-contents.json`).
 * 
 * The script initializes a WebSocket connection to the server at a specified address
 * and sets up event listeners for handling messages sent and received through this
 * connection. It also fetches JSON data from the server to populate the chat interface
 * with predefined messages and page content, enhancing the user experience by providing
 * a rich, dynamic chat environment.
 * 
 * Usage:
 * This file is intended to be included in the HTML of the chat functionality. 
 * It relies on the WebSocket API for communication and the Fetch API
 * for loading external content.
 * 
 * Date: 25.06.2024
 * Author: Extended by Tobias Bosl
 */

var socket = new WebSocket('ws://127.0.0.1:8181/', 'chat');
const botName = "MegaBot";
var user = '';
var invalidMessageSendAsLastMessage = false;

// Fetch the message content json from the server.
let messageJsonContent;
fetch('/message-content.json')
    .then(response => response.json())
    .then(data => {
        messageJsonContent = data;
    })
    .catch((error) => {
        console.error('Error:', error);
    });

// Fetch the page content json from the server.
let pageJsonContent;
fetch('/page-contents.json')
    .then(response => response.json())
    .then(data => {
        pageJsonContent = data;
    })
    .catch((error) => {
        console.error('Error:', error);
    });

/**
 * Load the content of the page based on the provided json data.
 * (Stored at project root: message-content.json)
 * 
 * @param {*} data The json data containing the content of the project. 
 */
function loadPageContent(data) {
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
    user = "driver" + Math.floor(Math.random() * Math.floor(10000));
    socket.send('{"type": "join", "name":"' + user + '"}');
}

/**
 * Register the click event on the send button to send the message.
 * If the message contains an invalid character or is empty, it will show a hint to the user.
 */
$('#sendBtn').on('click', function (e) {
    e.preventDefault();
    if (!validateMessage()) {
        if (!invalidMessageSendAsLastMessage) {
            showInvalidMessageHintInChat();
        }
        return;
    }
    invalidMessageSendAsLastMessage = false;
    sendMessage();
});

/**
 * Register the enter key on the input field to send the message.
 * If the message contains an invalid character or is empty, it will show a hint to the user.
 */
$('#msg').on('keypress', function (e) {
    if (e.which === 13) {
        e.preventDefault();
        if (!validateMessage()) {
            if (!invalidMessageSendAsLastMessage) {
                showInvalidMessageHintInChat();
            }
            return;
        }
        invalidMessageSendAsLastMessage = false;
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
 * Checks if the message is not empty and if it does not contain the character '"' to prevent json parsing conflicts.
 * @returns true if the message is valid, false otherwise.
 */
function validateMessage() {
    if ($('#msg').val().length == 0) {
        return false;
    }
    if ($('#msg').val().includes('\"')) {
        $('#msg').css('border-style', 'solid');
        $('#msg').css('border-color', 'red');
        $('#msg').css('border-width', '2px');
        return false;
    }
    $('#msg').css('border', 'none');
    return true;

}

/**
 * Scrolls to the bottom of the messages container.
 */
function scrollToBottom() {
    var element = $("#msgs");
    element.scrollTop(element[0].scrollHeight);
}

/**
 * Scrolls the message container by 100 pixels.
 */
function scrollHundredPixels() {
    var element = $("#msgs");
    element.scrollTop(element.scrollTop() + 400);
}

/**
 * Sets up the action to be taken when the socket receives a message.
 * If the message is of type 'msg' it will create append the message to the chat container.
 * On each received message it will scroll to the bottom of the chat container if it is not prevented
 * based on the content of the message (e. g. for summary of registrations).
 * 
 * @param {*} recevivedMsg The json object received as string from the socket.
 */
socket.onmessage = function (recevivedMsg) {
    var data = JSON.parse(recevivedMsg.data);
    if (data.type == 'msg') {
        var isMegaBot = data.name == botName;
        if (data.name == user || (isMegaBot && data.sender == user)) {
            var messageToChatContainer = prepareMessageContainer(data.msg, data.name);
            $('#msgs').append(messageToChatContainer);
            if ($('#msgs').children().length == 1) {
                return;
            }
            if (scrollingToBottomRequired(messageToChatContainer)) {
                scrollToBottom();
            } else {
                scrollHundredPixels();
            }
        }
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
 * Adds a hint to the chat container that the message contains invalid characters.
 * 
 * @returns The string representation of the HTML code for the div with the message and the name of the sender.
 */
function showInvalidMessageHintInChat() {
    if (pageJsonContent !== undefined) {
        var msg = pageJsonContent.chat.invalidMessageHint;
        var content = prepareMessageContainer(msg, botName);
        $('#msgs').append(content);
        scrollToBottom();
    } else {
        console.error('Error: pageJsonContent is undefined');
    }
    invalidMessageSendAsLastMessage = true;

}

/**
 * Determine whether the chat is required to be scrolled to the bottom.
 * It compares the first sentence of the message with the first sentence of all
 * overview stages introductions. If a match is found that there is no scrolling required.
 * 
 * @param {str} messageToChatContainer The container of the message to be appended to the chat.
 * 
 * @returns false if the message is an overview message of a process (e. g. registration process),
 *          or if it is the welcome message, else true.
 */
function scrollingToBottomRequired(messageToChatContainer) {
    if ($('#msgs').height() < messageToChatContainer.height()) {
        return false;
    }
    return true;
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