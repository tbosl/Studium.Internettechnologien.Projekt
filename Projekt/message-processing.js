var content = require('./message-content.json');
/**
 * This class is responsible for processing messages from the user.
 */
class MessageProcessor {
    /**
     * Creates a new message processor.
     * 
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
     * 
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
            // Check if the message matches the regex of the current stage.
            matchesCount = this.checkRegex(msg, sender);
            if (matchesCount == 1) {
                proccessedMessage = msg;
            }
        } else {
            // Check if the message matches the valid inputs of the current stage.
            let matches = this.countMatchesWithValidInputs(msg.toLowerCase(), sender);
            matchesCount = matches.length;
            if (matchesCount == 1 || (matchesCount > 1 && !this.sessionManager.getStage(sender).uniqueMatchRequired)) {
                proccessedMessage = matches[0];
            }else{
                proccessedMessage = "";
            }
        }
        // if the user is entering a birthdate and the date is in the future, send a warning message.
        if (this.sessionManager.getStage(sender).name.toLowerCase().includes('birthdate') && this.dateInFuture(msg)) {
            this.bot.sendBotMessage(this.sessionManager.getStage(sender).dateInFutureWarning, sender);
            return;
        }

        // if the user entered an invalid input or an input that can not be uniquely 
        // determined but a unique match is required, send a random invalid input message.
        if (proccessedMessage == "" || matchesCount == 0 || (matchesCount > 1 && this.sessionManager.getStage(sender).uniqueMatchRequired)) {
            this.bot.sendRandomInvalidInputMessage(sender);
            return;
        }

        // save the data in the sessionData if the stage is requesting data to be saved (determinde if the datakey exists).
        if ('dataKey' in this.sessionManager.getStage(sender)) {
            this.sessionManager.getUserInformation(sender)[this.sessionManager.getStage(sender).dataKey] = proccessedMessage;
        }
        this.stageManager.determineNextStage(msg, sender);
    }

    /**
     * Checks if the user send a cancelation message. 
     * If so, the bot sends a random cancelation response and sets the state to the welcome workflow.
     * 
     * @param {str} msg The content of the message. 
     * @param {str} sender The user of the session.
     * 
     * @returns True if the message is a cancelation message, false otherwise.
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
            return false;
        }
        this.stageManager.setStateToWelcomeWorkflow(sender);
        let randomMessageIndex = Math.floor(Math.random() * content.cancelWorkflow.cancelResponses.length);
        this.bot.sendBotMessage(content.cancelWorkflow.cancelResponses[randomMessageIndex], sender);
        return cancel;
    }

    /**
     * Checks if the message matches the regex of the current stage.
     * 
     * @param {str} msg Text message from the user. 
     * @param {str} sender The user of the session.
     * 
     * @returns 1 if the message matches the regex, 0 otherwise.The numbers are required as the list version returns 
     * the amount of matches and not true or false, so here we return 1 or 0 so symbolize one match or none.
     */
    checkRegex(msg, sender) {
        var re = new RegExp(this.sessionManager.getStage(sender).validInputRegex);
        var result = re.test(msg);
        return result ? 1 : 0;
    }

    /**
     * Counts the amount of matches found in the valid inputs list of the current stage.
     * @param {str} msg Text message from the user. 
     * @param {str} sender The user of the session. 
     * @returns The amoount of matches found in the valid inputs list.
     */
    countMatchesWithValidInputs(msg, sender) {
        let matches = []
        let validInputs = this.determineValidInput(sender);
        for (let str of validInputs) {
            if (msg.includes(str.toLowerCase()) || str.toLowerCase().includes(msg)) {
                matches.push(str);
            }
        }
        return matches;
    }

    /**
     * Provides a list of all valid inputs at the current stage.
     * 
     * @param {str} sender The user of the session. 
     * 
     * @returns The list of valid inputs. 
     */
    determineValidInput(sender) {
        let stage = this.sessionManager.getStage(sender);
        var baseList = stage.validInputs;
        switch (stage.name) {
            case "welcome":
            case "driverRegistrationOverview":
            case "vehicleRegistrationOverview":
                return this.unionSubLists(baseList);
            case "enterVehicleModel":
                let selectedBrandDataKey = this.sessionManager.getParentStage(sender)[this.sessionManager.getStageIndex(sender) - 1].dataKey;
                return stage.validInputs[this.sessionManager.getUserInformation(sender)[selectedBrandDataKey]];
            default:
                return baseList;
        }
    }

    /**
     * Used when the valid inputs are divided into sublists.
     * It unites the sublists into a single list.
     * @param {*} baseList The list of lists to be united. 
     * 
     * @returns The united list.
     */
    unionSubLists(baseList) {
        var result = []
        for (let k in baseList) {
            result = result.concat(baseList[k])
        }
        return result;
    }

    /**
     * Determines if the date in the message is in the future.
     * 
     * @param {str} msg The message containing only the date provided by the user. 
     * 
     * @returns True if the date is in the future, false otherwise.  
     */
    dateInFuture(msg) {
        let date = new Date(msg);
        let currentDate = new Date();
        return date > currentDate;
    }

}
module.exports = MessageProcessor;