// The required imports.
const StageManager = require('./stage-management');

/**
 * This class is responsible for managing and seperating the session data of the users.
 */
class SessionManager {
    /**
     * Creates a new session manager.
     * The session data is stored in a dictionary with the sender as the key.
    */
    constructor() {
        this.sessionData = {};
    }

    /**
     * Determines if the current user already has a session.
     * If not he creates a new session dataset and initializes it to the welcome stage.
     * @param {str} sender The sender of the message.
     * @param {StageManager} stageManager The session manager to be used.
     */
    initizalizeSessionIfUserIsNew(sender, stageManager) {
        if (!(sender in this.sessionData)) {
            this.sessionData[sender] = {};
            stageManager.setStateToWelcomeWorkflow(sender);
        };
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

module.exports = SessionManager;