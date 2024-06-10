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
     * 
     * @param {bot} bot The bot instance.
     * @param {SessionManager} sessionManager The session manager to be used.
     */
    constructor(bot, sessionManager) {
        this.bot = bot;
        this.sessionManager = sessionManager;
    }

    /**
     * Sets the state of the user to the welcome workflow.
     * @param {str} sender The user of the session. 
     */
    setStateToWelcomeWorkflow(sender) {
        this.sessionManager.setParentStage(sender, content.stages.welcomeWorkflow);
        this.sessionManager.setStageIndex(sender, 0);
        this.sessionManager.setStage(sender, this.sessionManager.getParentStage(sender)[this.sessionManager.getStageIndex(sender)]);
        this.sessionManager.setUserInformation(sender, {});
        this.sessionManager.setEditing(sender, false);
    }

    /**
     * Determines the next stage based on the user input.
     * 
     * @param {str} msg The message. 
     * @param {str} sender The user of the session.
     */
    determineNextStage(msg, sender) {
        let stage = this.sessionManager.getStage(sender);
        if (this.sessionManager.isEditing(sender)) {
            this.switchToNextStageAfterEditing(sender);
            return;
        }
        if (stage.name == "welcome") { // determine if the user want to register a driver or a vehicle
            this.switchToDesiredRegistrationWorkflow(msg, sender);
        } else {
            if (stage.name == "driverRegistrationOverview" || stage.name == "vehicleRegistrationOverview") {
                let desiredValueToEdit = this.determineValueToEdit(msg, sender);
                // if the user entered the name of an input that can be edited, switch to the editing stage.
                // otherwise continue with the next stage.
                if (desiredValueToEdit != "") {
                    this.switchToDesiredEditingStage(sender, desiredValueToEdit);
                    return;
                }
            }
            this.switchToNextStage(sender);
        }
    }

    /**
     * Switches to the next stage after editing a value.
     * If the current stage has a goToNextStageAfterEdit property set to true, the next stage will be set.
     * Otherwise, the user will be moved to the registration workflow overview.
     * 
     * @param {str} sender The user of the session. 
     */
    switchToNextStageAfterEditing(sender) {
        if (this.sessionManager.getStage(sender).goToNextStageAfterEdit) {
            let stageIndex = this.sessionManager.getStageIndex(sender);
            this.sessionManager.setStageIndex(sender, stageIndex + 1);
            this.sessionManager.setStage(sender, this.sessionManager.getParentStage(sender)[stageIndex + 1]);
        } else {
            this.sessionManager.setEditing(sender, false);
            this.moveToRegistrationWorkflowOverview(sender);
        }
        this.bot.sendBotMessage(this.sessionManager.getStage(sender).introduction, sender);
    }

    /**
     * Switches to the desired registration workflow based on the user input.
     * If the input match was found in the registerDriver list, the driver registration workflow will be set.
     * Otherwise, the vehicle registration workflow will be set.
     * 
     * @param {str} msg The message.
     * @param {str} sender The user of the session.
     */
    switchToDesiredRegistrationWorkflow(msg, sender) {
        if (this.findNameOfListWithMatch(msg, this.sessionManager.getStage(sender).validInputs) == "registerDriver") {
            this.sessionManager.setParentStage(sender, content.stages.driverRegistrationWorkflow);
        } else {
            this.sessionManager.setParentStage(sender, content.stages.vehicleRegistrationWorkflow);
        }
        let parentStage = this.sessionManager.getParentStage(sender);
        this.sessionManager.setStageIndex(sender, 0);
        this.sessionManager.setStage(sender, parentStage[this.sessionManager.getStageIndex(sender)]);
        this.bot.sendBotMessage(this.sessionManager.getStage(sender).introduction, sender);
    }

    /**
     * Switches to the stage where the desired value can be edited.
     * 
     * @param {str} sender The user of the session.
     * @param {str} desiredValueToEdit The value which is supposed to get edited.
     */
    switchToDesiredEditingStage(sender, desiredValueToEdit) {
        let stageIndexToEdit = this.determineStageIndexToEdit(sender, desiredValueToEdit);
        this.sessionManager.setStageIndex(sender, stageIndexToEdit);
        this.sessionManager.setStage(sender, this.sessionManager.getParentStage(sender)[stageIndexToEdit]);
        this.bot.sendBotMessage(this.sessionManager.getStage(sender).editIntroduction, sender);
        this.sessionManager.setEditing(sender, true);
    }

    /**
     * Switches to the next stage of the current parent stage.
     * If the next stage is the last one, the user will be moved to the welcome workflow as there is no 
     * input required and the introduction has already been sent.
     * 
     * @param {*} sender The user of the session.
     */
    switchToNextStage(sender) {
        this.sessionManager.setStageIndex(sender, this.sessionManager.getStageIndex(sender) + 1);
        // update local stageIndex due to the change before.
        let stageIndex = this.sessionManager.getStageIndex(sender);
        let parentStage = this.sessionManager.getParentStage(sender);
        this.sessionManager.setStage(sender, parentStage[stageIndex]);
        this.bot.sendBotMessage(this.sessionManager.getStage(sender).introduction, sender);
        // check if there are more stages in the current parent stage. If the next case is the last,
        // it will be handeled right away, since no input is required, it just ends the current conversation.
        if (this.sessionManager.getStageIndex(sender) > parentStage.length - 2) {
            this.setStateToWelcomeWorkflow(sender);
        }
    }

    /**
     * Determines the name of a sublist in which the message is included.
     * 
     * @param {str} msg The message. 
     * @param {*} validInputs The list containing sublists strings that represent the valid inputs.
     * 
     * @returns The name of the sublist in which the message is included. If the message is not included in any list, an empty string is returned. 
     */
    findNameOfListWithMatch(msg, validInputs) {
        if (this.checkListForMatch(msg, validInputs.registerDriver)) {
            return "registerDriver";
        } else if (this.checkListForMatch(msg, validInputs.registerVehicle)) {
            return "registerVehicle";
        } else {
            return "";
        }
    }

    /**
     * Determines if a part of the message is included in a list of strings or vice versa.
     * 
     * @param {str} msg  The message.
     * @param {*} list The list of strings.
     
    * @returns True if a part of the message is included in the list of strings or vice versa. Otherwise false. 
     */
    checkListForMatch(msg, list) {
        for (let str of list) {
            if (msg.toLowerCase().includes(str.toLowerCase()) || str.toLowerCase().includes(msg.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Sets the stage of the user to the registration workflow overview.
     * 
     * @param {str} sender The user of the session. 
     */
    moveToRegistrationWorkflowOverview(sender) {
        this.sessionManager.setStageIndex(sender, this.sessionManager.getParentStage(sender).length - 2);
        this.sessionManager.setStage(sender, this.sessionManager.getParentStage(sender)[this.sessionManager.getStageIndex(sender)]);
    }

    /**
     * Determines the value to edit based on the user input.
     * 
     * @param {str} msg The message.
     * @param {str} sender The user of the session.
     * 
     * @returns The name of the value which is supposed to get edited. If the value is not found, an empty string is returned.
     */
    determineValueToEdit(msg, sender) {
        let validInputs = this.bot.messageProcessor.determineValidInput(sender);
        for (let str of validInputs) {
            if (this.sessionManager.getStage(sender).validInputs.editInput.includes(str) && (msg.toLowerCase().includes(str.toLowerCase()) || str.toLowerCase().includes(msg))) {
                return content.editInputToInternalNameMapping[str]
            }
        }
        return "";
    }

    /**
     * Determines the index of the stage where the desired value to edit is located.
     * 
     * @param {str} sender The user of the session. 
     * @param {str} desiredValueToEdit  The value which is supposed to get edited.
     * 
     * @returns The index of the stage to change to. 
     */
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