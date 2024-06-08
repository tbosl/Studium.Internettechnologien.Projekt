'use strict'
var WebSocketClient = require('websocket').client;
var SessionManager = require('./session-management.js');
var StageManager = require('./stage-management.js');
var MessageProcessor = require('./message-processing.js');
var content = require('./message-content.json');

/**
 * Bot is a simple websocket chat client.
 */
class bot {

  /**
   * The constructor builds the client. It creates a websocket and connects to the server.
   * Note that the server IP is hardcoded.
   */
  constructor() {
    this.name = 'MegaBot';
    // The session manager is used to manage the sessions of different users.
    this.sessionManager = new SessionManager();
    this.stageManager = new StageManager(this, this.sessionManager);
    this.messageProcessor = new MessageProcessor(this, this.sessionManager, this.stageManager);
    this.sender = "";

    // The websocket connection.
    this.client = new WebSocketClient();

    // If the websocket is connected, this is set to true.
    this.connected = false;

    // If the connection fails, this is called.
    this.client.on('connectFailed', function (error) {
      console.log('Connect Error: ' + error.toString());
    });

    // If the client connects to the server, this is called.
    this.client.on('connect', function (connection) {
      this.con = connection;
      console.log('WebSocket Client Connected');
      connection.on('error', function (error) {
        console.log('Connection Error: ' + error.toString());
      });

      // It is possible that the client disconnects (typically when the server is not there anymore).
      connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
      });

      // This is the core of the bot. Whenever a message is received, it is processed here.
      connection.on('message', function (message) {
        if (message.type === 'utf8') {
          var data = JSON.parse(message.utf8Data)
          console.log('Received: ' + data.msg + ' ' + data.name)
          if (data.type == 'join') {
            onClientJoins();
          }
        }
      });
      joinGesp();

      /** 
       * Send a join message to the server so it recognizes us.
       * The message is formatted as JSON.
      */
      function joinGesp() {
        if (connection.connected) {
          connection.sendUTF('{"type": "join", "name":"MegaBot"}');
        }
      }

      /**
       * Send a welcome message to the user once he joins the chat.
       * The message is formatted as JSON.
       */
      function onClientJoins() {
        var inhalt = content.stages.welcomeWorkflow[0].introduction;
        var msg = '{"type": "msg", "name": "' + "MegaBot" + '", "msg":"' + inhalt + '","sender":"MegaBot" }';
        console.log('Send: ' + msg)
        connection.sendUTF(msg);
      }
    });
  }

  /**
   * Conncects the client websocket to the server. The server is hardcoded to localhost.
   */
  connect() {
    this.client.connect('ws://localhost:8181/', 'chat')
    this.connected = true
  }

  /** 
   * This function is called automatically in the server when something arrives has not been sent by the bot.
   * It handles the incoming message and sends a response.
   * If the user is new, a new session is created.
   * @param msg The message to which the bot should respond.
  */
  post(msg) {
    var get = JSON.parse(msg);
    let sender = get.name;
    var messageContent = get.msg;
    this.sessionManager.initizalizeSessionIfUserIsNew(sender, this.stageManager);
    //this.processMessage(nachricht, sender);
    this.messageProcessor.process(messageContent, sender);
  }

  /**
   * Sends a message to the server with the content and the sender.
   * @param {str} content The content of the message.
   * @param {str} sender The user of the session.
   */
  sendBotMessage(content, sender) {
    content = this.exchangePlaceholdersForAcutalValues(content, sender);
    var msg = '{"type": "msg", "name":"' + this.name + '", "msg":"' + content + '","sender":"' + sender + '"}'
    console.log('Send: ' + msg)
    this.client.con.sendUTF(msg)
  }

  /**
   * Sends a random message of the list of invalid input responses of the current stage.
   * @param {str} sender The user of the session. 
   */
  sendRandomInvalidInputMessage(sender) {
    let stage = this.sessionManager.getStage(sender);
    var randomIndex = Math.floor(Math.random() * stage.invalidInputResponses.length);
    this.sendBotMessage(stage.invalidInputResponses[randomIndex], sender);
  }

  /**
   * Replaces all custom made placeholders of the content with the actual values of the user.
   * @param {str} content The content of the message.
   * @param {str} sender The user of the session. 
   * @returns 
   */
  exchangePlaceholdersForAcutalValues(content, sender) {
    let dataset = this.sessionManager.getUserInformation(sender);
    for (let key in dataset) {
      let optionalLinebreak = this.sessionManager.getStage(sender).name == "driverRegistrationOverview" || this.sessionManager.getStage(sender).name == "vehicleRegistrationOverview" ? "{{/n}}" : "";
      if (content.includes("{{" + key + "}}")) {
        content = content.replace("{{" + key + "}}", optionalLinebreak + "<b>" + dataset[key] + "</b>" + optionalLinebreak + optionalLinebreak);
      }
    }
    if (content.includes("{{brandModels}}")) {
      let manufacturer = dataset.vehicleBrand;
      content = content.replace("{{brandModels}}", " - " + this.sessionManager.getStage(sender).validInputs[manufacturer].join("{{/n}} - "));
    }
    return content;
  }
}
module.exports = bot
