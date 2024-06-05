'use strict'



var WebSocketClient = require('websocket').client
var content = require('./message-content.json');

/**
 * bot ist ein einfacher Websocket Chat Client
 */

class bot {

  /**
   * Konstruktor baut den client auf. Er erstellt einen Websocket und verbindet sich zum Server
   * Bitte beachten Sie, dass die Server IP hardcodiert ist. Sie müssen sie umsetzten
   */
  constructor() {
    this.name = 'MegaBot';
    this.parentStage = content.stages.welcomeWorkflow;
    this.stageIndex = 0;
    this.stage = this.parentStage[this.stageIndex];
    this.sessionData = {};
    this.dict = []
    this.dict['suche'] = 'Wenn sie etwas suchen sind Sie hier falsch es geht um Drogen'
    this.dict['rauche'] = 'Rauchen ist eine schreckliche Sache.'
    this.dict['trinke'] = 'Trinken kann man auch Wasser.'
    this.dict['schlafen'] = 'Schlafen wirkt wie eine Droge ist aber gesund.'
    this.dict['saufe'] = 'Wasser saufen ist gesund.'
    this.sender = "";

    /** Die Websocketverbindung
      */
    this.client = new WebSocketClient()
    /**
     * Wenn der Websocket verbunden ist, dann setzten wir ihn auf true
     */
    this.connected = false

    /**
     * Wenn die Verbindung nicht zustande kommt, dann läuft der Aufruf hier hinein
     */
    this.client.on('connectFailed', function (error) {
      console.log('Connect Error: ' + error.toString())
    })

    /** 
     * Wenn der Client sich mit dem Server verbindet sind wir hier 
    */
    this.client.on('connect', function (connection) {
      this.con = connection
      console.log('WebSocket Client Connected')
      connection.on('error', function (error) {
        console.log('Connection Error: ' + error.toString())
      })

      /** 
       * Es kann immer sein, dass sich der Client disconnected 
       * (typischer Weise, wenn der Server nicht mehr da ist)
      */
      connection.on('close', function () {
        console.log('echo-protocol Connection Closed')
      })

      /** 
       *    Hier ist der Kern, wenn immmer eine Nachricht empfangen wird, kommt hier die 
       *    Nachricht an. 
      */
      connection.on('message', function (message) {
        if (message.type === 'utf8') {
          var data = JSON.parse(message.utf8Data)
          console.log('Received: ' + data.msg + ' ' + data.name)
        }
      })

      /** 
       * Hier senden wir unsere Kennung damit der Server uns erkennt.
       * Wir formatieren die Kennung als JSON
      */
      function joinGesp() {
        if (connection.connected) {
          connection.sendUTF('{"type": "join", "name":"MegaBot"}')
          var inhalt = "Lass uns über Blödsinn sprechen? Was machst du falsch?"
          var msg = '{"type": "msg", "name": "' + "MegaBot" + '", "msg":"' + inhalt + '","sender":"MegaBot" }'
          console.log('Send: ' + msg)
          connection.sendUTF(msg)
        }
      }
      joinGesp()
    })
  }

  /**
   * Methode um sich mit dem Server zu verbinden. Achtung wir nutzen localhost
   * 
   */
  connect() {
    this.client.connect('ws://localhost:8181/', 'chat')
    this.connected = true
  }

  /** 
   * Hier muss ihre Verarbeitungslogik integriert werden.
   * Diese Funktion wird automatisch im Server aufgerufen, wenn etwas ankommt, das wir 
   * nicht geschrieben haben
   * @param nachricht auf die der bot reagieren soll
  */
  post(msg) {
    var get = JSON.parse(msg);
    let sender = get.name;
    var nachricht = get.msg;
    this.checkUserSessionRegistration(sender);
    this.processMessage(nachricht, sender);
    var name = 'MegaBot'
    var inhalt = 'Ich versteh gar nichts'
    this.sender = get.name;

    for (var i in this.dict) {
      console.log(i)
      console.log(this.dict[i])
    }

    for (var j in this.dict) {
      if (nachricht.includes(j)) {
        inhalt = this.dict[j]
      }
    }
    /*
     * Verarbeitung
    */

    var msg = '{"type": "msg", "name":"' + name + '", "msg":"' + inhalt + '","sender":"' + this.sender + '"}'
    console.log('Send: ' + msg)
    this.client.con.sendUTF(msg)
  }

  checkUserSessionRegistration(sender) {
    if (!(sender in this.sessionData)) {
      this.sessionData[sender] = {};
    };
  }

  processMessage(msg, sender) {
    console.log("Processing message: " + msg);
    let canceled = this.checkForCancel(msg, sender);
    if (canceled) {
      return;
    }
    let matchesCount = 0;
    let proccessedMessage = "";
    if (this.stage.regexCheck) {
      matchesCount = this.checkRegex(msg);
      if (matchesCount == 1) {
        proccessedMessage = msg;
      }
    } else {
      let matches = this.countMatchesWithValidInputs(msg.toLowerCase(), sender);
      matchesCount = matches.length;
      if (matchesCount == 1) {
        proccessedMessage = matches[0];
      }
    }
    if (matchesCount != 1) {
      this.sendRandomInvalidInputMessage(sender);
      return;
    }
    if ('dataKey' in this.stage) { // save the data in the sessionData if the stage is requesting data to be saved (determinde if the datakey exists).
      this.sessionData[sender][this.stage.dataKey] = proccessedMessage;
    }
    this.determineNextStage(msg, sender);
    this.sendBotMessage(this.exchangePlaceholdersForAcutalValues(this.stage.introduction, sender), sender);
  }

  checkForCancel(msg, sender) {
    let cancel = false;
    for (let str of content.cancelWorkflow.cancelInput) {
      if (msg.toLowerCase() == str.toLowerCase()) {
        cancel = true;
        break;
      }
    }
    if (!cancel) {
      return;
    }
    this.resetToWelcomeWorkflow(sender);
    let randomMessageIndex = Math.floor(Math.random() * content.cancelWorkflow.cancelResponses.length);
    this.sendBotMessage(content.cancelWorkflow.cancelResponses[randomMessageIndex], sender);
    return cancel;
  }

  resetToWelcomeWorkflow(sender) {
    this.parentStage = content.stages.welcomeWorkflow;
    this.stageIndex = 0;
    this.stage = this.parentStage[this.stageIndex];
    this.sessionData[sender] = {};
  }

  checkRegex(msg) {
    var re = new RegExp(this.stage.validInputRegex);
    var result = re.test(msg);
    return result ? 1 : 0;
  }

  countMatchesWithValidInputs(msg, sender) {
    let matches = []
    let validInputs = this.determineValidInput(sender);
    for (let str of validInputs) {
      if (this.stage.name != "enterVehicleModel") {
        if (msg.includes(str.toLowerCase()) || str.toLowerCase().includes(msg)) {
          matches.push(str);
        }
      } else {
        // TODO else probalby not needed
        if (msg.includes(str.toLowerCase()) || str.toLowerCase().includes(msg)) {
          matches.push(str);
        }

      }
    }
    return matches;
  }

  sendRandomInvalidInputMessage(sender) {
    var randomIndex = Math.floor(Math.random() * this.stage.invalidInputResponses.length);
    this.sendBotMessage(this.stage.invalidInputResponses[randomIndex], sender);
  }

  sendBotMessage(content, sender) {
    var msg = '{"type": "msg", "name":"' + this.name + '", "msg":"' + content + '","sender":"' + sender + '"}'
    console.log('Send: ' + msg)
    this.client.con.sendUTF(msg)
  }

  determineValidInput(sender) {
    var baseList = this.stage.validInputs;
    switch (this.stage.name) {
      case "welcome":
      case "endDriverRegistration":
      case "endVehicleRegistration":
        return this.unionSubLists(baseList);
      case "enterVehicleModel":
        let selectedBrandDataKey = this.parentStage[this.stageIndex - 1].dataKey;
        return this.stage.validInputs[this.sessionData[sender][selectedBrandDataKey]];
      default:
        return baseList;
    }
  }

  unionSubLists(baseList) {
    var result = []
    for (let k in baseList) {
      result = result.concat(baseList[k])
    }
    return result;
  }

  determineNextStage(msg, sender) {
    if (this.stage.name == "welcome") { // determine if the user want to register a driver or a vehicle
      if (this.findNameOfListWithMatch(msg, this.stage.validInputs) == "registerDriver") {
        this.parentStage = content.stages.driverRegistrationWorkflow;
      } else {
        this.parentStage = content.stages.vehicleRegistrationWorkflow;
      }
      this.stageIndex = 0;
      this.stage = this.parentStage[this.stageIndex];
    } else {
      if (this.stageIndex < this.parentStage.length - 1) { // check if there are more stages in the current parent stage
        this.stageIndex++;
        this.stage = this.parentStage[this.stageIndex];
      } else { // end of the current parent stage is reached.
        this.resetToWelcomeWorkflow(sender);
      }
    }
  }

  findNameOfListWithMatch(msg, validInputs) {
    let nameOfListWithMatch = this.checkListForMatch(msg, validInputs.registerDriver, "registerDriver");
    if (nameOfListWithMatch == "") {
      nameOfListWithMatch = this.checkListForMatch(msg, validInputs.registerVehicle, "registerVehicle");
    }
    return nameOfListWithMatch;
  }

  checkListForMatch(msg, list, name) {
    let nameOfListWithMatch = "";
    for (let str of list) {
      if (msg.toLowerCase().includes(str.toLowerCase()) || str.toLowerCase().includes(msg.toLowerCase())) {
        this.stage = content.stages.driverRegistration;
        nameOfListWithMatch = name;
        break;
      }
    }
    return nameOfListWithMatch;
  }

  exchangePlaceholdersForAcutalValues(content, sender) {
    let dataset = this.sessionData[sender];
    for (let key in dataset) {
      if (content.includes("{{" + key + "}}")) {
        content = content.replace("{{" + key + "}}", dataset[key]);
      }
    }
    if (content.includes("{{brandModels}}")) {
      let manufacturer = dataset.vehicleBrand;
      content = content.replace("{{brandModels}}", " - " + this.stage.validInputs[manufacturer].join("{{/n}} - "));
    }
    return content;
  }
}
module.exports = bot
