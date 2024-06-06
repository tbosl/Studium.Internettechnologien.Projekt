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
          if (data.type == 'join') {
            onClientJoins();
          }
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

      /**
       * Send a welcome message to the user once he joins the chat.
       */
      function onClientJoins() {
        var inhalt = content.stages.welcomeWorkflow[0].introduction;
        var msg = '{"type": "msg", "name": "' + "MegaBot" + '", "msg":"' + inhalt + '","sender":"MegaBot" }';
        console.log('Send: ' + msg)
        connection.sendUTF(msg);
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
      this.setStateToWelcomeWorkflow(sender);
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
    if (this.getStage(sender).regexCheck) {
      matchesCount = this.checkRegex(msg, sender);
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
    if ('dataKey' in this.getStage(sender)) { // save the data in the sessionData if the stage is requesting data to be saved (determinde if the datakey exists).
      this.getUserInformation(sender)[this.getStage(sender).dataKey] = proccessedMessage;
    }
    this.determineNextStage(msg, sender);
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
    this.setStateToWelcomeWorkflow(sender);
    let randomMessageIndex = Math.floor(Math.random() * content.cancelWorkflow.cancelResponses.length);
    this.sendBotMessage(content.cancelWorkflow.cancelResponses[randomMessageIndex], sender);
    return cancel;
  }

  setStateToWelcomeWorkflow(sender) {
    this.sessionData[sender] = {};

    this.setParentStage(sender, content.stages.welcomeWorkflow);
    this.setStageIndex(sender, 0);
    this.setStage(sender, this.getParentStage(sender)[this.getStageIndex(sender)]);
    this.setUserInformation(sender, {});
    this.setEditing(sender, false);
  }

  checkRegex(msg, sender) {
    var re = new RegExp(this.getStage(sender).validInputRegex);
    var result = re.test(msg);
    return result ? 1 : 0;
  }

  countMatchesWithValidInputs(msg, sender) {
    let matches = []
    let validInputs = this.determineValidInput(sender);
    for (let str of validInputs) {
      if (this.getStage(sender).name != "enterVehicleModel") {
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
    let stage = this.getStage(sender);
    var randomIndex = Math.floor(Math.random() * stage.invalidInputResponses.length);
    this.sendBotMessage(stage.invalidInputResponses[randomIndex], sender);
  }

  sendBotMessage(content, sender) {
    content = this.exchangePlaceholdersForAcutalValues(content, sender);
    var msg = '{"type": "msg", "name":"' + this.name + '", "msg":"' + content + '","sender":"' + sender + '"}'
    console.log('Send: ' + msg)
    this.client.con.sendUTF(msg)
  }

  determineValidInput(sender) {
    let stage = this.getStage(sender);
    var baseList = stage.validInputs;
    switch (stage.name) {
      case "welcome":
      case "endDriverRegistration":
      case "endVehicleRegistration":
        return this.unionSubLists(baseList);
      case "enterVehicleModel":
        let selectedBrandDataKey = this.getParentStage(sender)[this.getStageIndex(sender) - 1].dataKey;
        return stage.validInputs[this.getUserInformation(sender)[selectedBrandDataKey]];
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
    let stage = this.getStage(sender);
    let stageIndex = this.getStageIndex(sender);
    let parentStage = this.getParentStage(sender);
    if (this.isEditing(sender)) {
      if (this.getStage(sender).goToNextStageAfterEdit) {
        this.setStageIndex(sender, stageIndex + 1);
        this.setStage(sender, parentStage[stageIndex + 1]);
      } else {
        this.setEditing(sender, false);
        this.moveToRegistrationWorkflowOverview(sender);
      }
      this.sendBotMessage(this.getStage(sender).introduction, sender);
      return;
    }

    if (stage.name == "welcome") { // determine if the user want to register a driver or a vehicle
      if (this.findNameOfListWithMatch(msg, stage.validInputs) == "registerDriver") {
        this.setParentStage(sender, content.stages.driverRegistrationWorkflow);
      } else {
        this.setParentStage(sender, content.stages.vehicleRegistrationWorkflow);
      }
      parentStage = this.getParentStage(sender);
      this.setStageIndex(sender, 0);
      this.setStage(sender, parentStage[stageIndex]);
      this.sendBotMessage(this.getStage(sender).introduction, sender);
    } else {
      if (stage.name == "endDriverRegistration" || stage.name == "endVehicleRegistration") {
        let desiredValueToEdit = this.determineValueToEdit(msg, sender);
        if (desiredValueToEdit != "") {
          let stageIndexToEdit = this.determineStageIndexToEdit(sender, desiredValueToEdit);
          this.setStageIndex(sender, stageIndexToEdit);
          this.setStage(sender, parentStage[stageIndexToEdit]);
          this.sendBotMessage(this.getStage(sender).editIntroduction, sender);
          this.setEditing(sender, true);
          return;
        }
      }
      this.setStageIndex(sender, stageIndex + 1);
      stageIndex = this.getStageIndex(sender); // update local stageIndex due to the change before.
      this.setStage(sender, parentStage[stageIndex]);
      this.sendBotMessage(this.getStage(sender).introduction, sender);
      // check if there are more stages in the current parent stage. If the next case is the last,
      // it will be handeled right away, since no input is required, it just ends the current conversation.
      if (this.getStageIndex(sender) > parentStage.length - 2) {
        this.setStateToWelcomeWorkflow(sender);
      }
    }
  }

  determineValueToEdit(msg, sender) {
    let validInputs = this.determineValidInput(sender);
    for (let str of validInputs) {
      if (this.getStage(sender).validInputs.editInput.includes(str) && (msg.toLowerCase().includes(str.toLowerCase()) || str.toLowerCase().includes(msg))) {
        return content.editInputToInternalNameMapping[str]
      }
    }
    return "";
  }

  determineStageIndexToEdit(sender, desiredValueToEdit) {
    let parentStage = this.getParentStage(sender);
    let stageIndexToEdit = 0;
    for (let i = 0; i < parentStage.length; i++) {
      if (parentStage[i].dataKey == desiredValueToEdit) {
        stageIndexToEdit = i;
        break;
      }
    }
    return stageIndexToEdit;
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
        nameOfListWithMatch = name;
        break;
      }
    }
    return nameOfListWithMatch;
  }

  exchangePlaceholdersForAcutalValues(content, sender) {
    let dataset = this.getUserInformation(sender);
    for (let key in dataset) {
      let optionalLinebreak = this.getStage(sender).name == "endDriverRegistration" || this.getStage(sender).name == "endVehicleRegistration" ? "{{/n}}" : "";
      if (content.includes("{{" + key + "}}")) {
        content = content.replace("{{" + key + "}}", optionalLinebreak + "<b>" + dataset[key] + "</b>" + optionalLinebreak + optionalLinebreak);
      }
    }
    if (content.includes("{{brandModels}}")) {
      let manufacturer = dataset.vehicleBrand;
      content = content.replace("{{brandModels}}", " - " + this.getStage(sender).validInputs[manufacturer].join("{{/n}} - "));
    }
    return content;
  }

  moveToRegistrationWorkflowOverview(sender) {
    this.setStageIndex(sender, this.getParentStage(sender).length - 2);
    this.setStage(sender, this.getParentStage(sender)[this.getStageIndex(sender)]);
  }

  getStage(sender) {
    return this.sessionData[sender]["stage"];
  }

  setStage(sender, stage) {
    this.sessionData[sender]["stage"] = stage;
  }

  getStageIndex(sender) {
    return this.sessionData[sender]["stageIndex"];
  }

  setStageIndex(sender, index) {
    this.sessionData[sender]["stageIndex"] = index;
  }

  getParentStage(sender) {
    return this.sessionData[sender]["parentStage"];
  }

  setParentStage(sender, parentStage) {
    this.sessionData[sender]["parentStage"] = parentStage;
  }

  getUserInformation(sender) {
    return this.sessionData[sender]["userInformation"];
  }

  setUserInformation(sender, userInformation) {
    this.sessionData[sender]["userInformation"] = userInformation;
  }

  isEditing(sender) {
    return this.sessionData[sender]["editing"];
  }
  setEditing(sender, editing) {
    this.sessionData[sender]["editing"] = editing;
  }
}
module.exports = bot
