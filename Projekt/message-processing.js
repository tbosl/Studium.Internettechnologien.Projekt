var content = require('./message-content.json');
/**
 * This class is responsible for processing messages from the user.
 */
class MessageProcessor {
    /**
     * Creates a new message processor.
     * @param {bot} bot The bot instance.
     * @param {SessionManager} sessionManager The session manager to be used.
     * @param {StageManager} stageManager The stage manager to be used.
     */
    constructor(bot, sessionManager, stageManager) {
        this.bot = bot;
        this.sessionManager = sessionManager;
        this.stageManager = stageManager;
    }

    /**
     * Proccesses the message from the user.
     * @param {str} msg The message content from the user.
     * @param {str} sender The sender of the message.
     */
    process(msg, sender) {
        console.log("Processing message: " + msg);
        let canceled = this.checkForCancel(msg, sender);
        if (canceled) {
            return;
        }
        let matchesCount = 0;
        let proccessedMessage = "";
        if (this.sessionManager.getStage(sender).regexCheck) {
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
            this.bot.sendRandomInvalidInputMessage(sender);
            return;
        }
        if ('dataKey' in this.sessionManager.getStage(sender)) { // save the data in the sessionData if the stage is requesting data to be saved (determinde if the datakey exists).
            this.sessionManager.getUserInformation(sender)[this.sessionManager.getStage(sender).dataKey] = proccessedMessage;
        }
        this.stageManager.determineNextStage(msg, sender);
    }

    /**
     * Checks if the user send a cancelation message. 
     * If so, the bot sends a random cancelation response and sets the state to the welcome workflow.
     * @param {str} msg The content of the message. 
     * @param {str} sender The user of the session.
     * @returns 
     */
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
        this.stageManager.setStateToWelcomeWorkflow(sender);
        let randomMessageIndex = Math.floor(Math.random() * content.cancelWorkflow.cancelResponses.length);
        this.bot.sendBotMessage(content.cancelWorkflow.cancelResponses[randomMessageIndex], sender);
        return cancel;
    }

    checkRegex(msg, sender) {
        var re = new RegExp(this.sessionManager.getStage(sender).validInputRegex);
        var result = re.test(msg);
        return result ? 1 : 0;
    }

    countMatchesWithValidInputs(msg, sender) {
        let matches = []
        let validInputs = this.determineValidInput(sender);
        for (let str of validInputs) {
            if (this.sessionManager.getStage(sender).name != "enterVehicleModel") {
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

    determineValidInput(sender) {
        let stage = this.sessionManager.getStage(sender);
        var baseList = stage.validInputs;
        switch (stage.name) {
            case "welcome":
            case "endDriverRegistration":
            case "endVehicleRegistration":
                return this.unionSubLists(baseList);
            case "enterVehicleModel":
                let selectedBrandDataKey = this.sessionManager.getParentStage(sender)[this.sessionManager.getStageIndex(sender) - 1].dataKey;
                return stage.validInputs[this.sessionManager.getUserInformation(sender)[selectedBrandDataKey]];
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

}
module.exports = MessageProcessor;