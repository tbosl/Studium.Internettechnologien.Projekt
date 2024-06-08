// The required imports.
const bot = require("./bot");
const SessionManager = require("./session-management");
const content = require("./message-content.json");

/**
 * Handles the stages of the chat.
 */
class StageManager {
    /**
     * Creates a new instance of the StageManager with a reference to the session manager.
     * @param {bot} bot The bot instance.
     * @param {SessionManager} sessionManager The session manager to be used.
     */
    constructor(bot, sessionManager) {
        this.bot = bot;
        this.sessionManager = sessionManager;
    }

    setStateToWelcomeWorkflow(sender) {
        this.sessionManager.setParentStage(sender, content.stages.welcomeWorkflow);
        this.sessionManager.setStageIndex(sender, 0);
        this.sessionManager.setStage(sender, this.sessionManager.getParentStage(sender)[this.sessionManager.getStageIndex(sender)]);
        this.sessionManager.setUserInformation(sender, {});
        this.sessionManager.setEditing(sender, false);
    }

    determineNextStage(msg, sender) {
        let stage = this.sessionManager.getStage(sender);
        let stageIndex = this.sessionManager.getStageIndex(sender);
        let parentStage = this.sessionManager.getParentStage(sender);
        if (this.sessionManager.isEditing(sender)) {
            if (this.sessionManager.getStage(sender).goToNextStageAfterEdit) {
                this.sessionManager.setStageIndex(sender, stageIndex + 1);
                this.sessionManager.setStage(sender, parentStage[stageIndex + 1]);
            } else {
                this.sessionManager.setEditing(sender, false);
                this.moveToRegistrationWorkflowOverview(sender);
            }
            this.sendBotMessage(this.sessionManager.getStage(sender).introduction, sender);
            return;
        }

        if (stage.name == "welcome") { // determine if the user want to register a driver or a vehicle
            if (this.findNameOfListWithMatch(msg, stage.validInputs) == "registerDriver") {
                this.sessionManager.setParentStage(sender, content.stages.driverRegistrationWorkflow);
            } else {
                this.sessionManager.setParentStage(sender, content.stages.vehicleRegistrationWorkflow);
            }
            parentStage = this.sessionManager.getParentStage(sender);
            this.sessionManager.setStageIndex(sender, 0);
            this.sessionManager.setStage(sender, parentStage[stageIndex]);
            this.bot.sendBotMessage(this.sessionManager.getStage(sender).introduction, sender);
        } else {
            if (stage.name == "endDriverRegistration" || stage.name == "endVehicleRegistration") {
                let desiredValueToEdit = this.determineValueToEdit(msg, sender);
                if (desiredValueToEdit != "") {
                    let stageIndexToEdit = this.determineStageIndexToEdit(sender, desiredValueToEdit);
                    this.sessionManager.setStageIndex(sender, stageIndexToEdit);
                    this.sessionManager.setStage(sender, parentStage[stageIndexToEdit]);
                    this.sendBotMessage(this.sessionManager.getStage(sender).editIntroduction, sender);
                    this.sessionManager.setEditing(sender, true);
                    return;
                }
            }
            this.sessionManager.setStageIndex(sender, stageIndex + 1);
            stageIndex = this.sessionManager.getStageIndex(sender); // update local stageIndex due to the change before.
            this.sessionManager.setStage(sender, parentStage[stageIndex]);
            this.bot.sendBotMessage(this.sessionManager.getStage(sender).introduction, sender);
            // check if there are more stages in the current parent stage. If the next case is the last,
            // it will be handeled right away, since no input is required, it just ends the current conversation.
            if (this.sessionManager.getStageIndex(sender) > parentStage.length - 2) {
                this.setStateToWelcomeWorkflow(sender);
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
                nameOfListWithMatch = name;
                break;
            }
        }
        return nameOfListWithMatch;
    }

    moveToRegistrationWorkflowOverview(sender) {
        this.sessionManager.setStageIndex(sender, this.sessionManager.getParentStage(sender).length - 2);
        this.sessionManager.setStage(sender, this.sessionManager.getParentStage(sender)[this.sessionManager.getStageIndex(sender)]);
    }

    determineValueToEdit(msg, sender) {
        let validInputs = this.bot.messageProcessor.determineValidInput(sender);
        for (let str of validInputs) {
            if (this.sessionManager.getStage(sender).validInputs.editInput.includes(str) && (msg.toLowerCase().includes(str.toLowerCase()) || str.toLowerCase().includes(msg))) {
                return content.editInputToInternalNameMapping[str]
            }
        }
        return "";
    }

    determineStageIndexToEdit(sender, desiredValueToEdit) {
        let parentStage = this.sessionManager.getParentStage(sender);
        let stageIndexToEdit = 0;
        for (let i = 0; i < parentStage.length; i++) {
            if (parentStage[i].dataKey == desiredValueToEdit) {
                stageIndexToEdit = i;
                break;
            }
        }
        return stageIndexToEdit;
    }


}
module.exports = StageManager;