/**
 * File: session-management.js
 * 
 * Description:
 * This file defines the SessionManager class responsible for managing user sessions
 * within the application. It handles the creation, tracking, and updating of session
 * data for each user, ensuring that user interactions are stateful and personalized.
 * The SessionManager class utilizes a dictionary to store session data, with each
 * user's identifier (sender) serving as the key. This class plays a crucial role in
 * maintaining the context of user interactions, especially in applications involving
 * complex conversational flows or requiring user-specific data retention across
 * multiple interactions - e.g., during the registration processes.
 * 
 * The class provides methods for initializing new user sessions, checking the
 * existence of sessions, and managing the progression of users through different
 * stages of interaction, in collaboration with the StageManager class. This ensures
 * that users are always presented with the appropriate responses and actions based
 * on their current context and past interactions.
 * 
 * Usage:
 * The SessionManager class is intended to be instantiated once and used throughout
 * the application to manage all user sessions. It requires an instance of the
 * StageManager class to handle the transition of users through various stages of
 * interaction.
 * 
 * Date: 25.06.2024
 * Author: Tobias Bosl
 */


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
     * 
     * @param {str} sender The sender of the message.
     * @param {StageManager} stageManager The session manager to be used.
     */
    initizalizeSessionIfUserIsNew(sender, stageManager) {
        if (!(sender in this.sessionData)) {
            this.sessionData[sender] = {};
            stageManager.setStateToWelcomeWorkflow(sender);
        };
    }

    /**
     * Provides the stage of the user.
     * 
     * @param {str} sender The user of the session. 
     * 
     * @returns The stage.
     */
    getStage(sender) {
        return this.sessionData[sender]["stage"];
    }

    /**
     * Updates the stage of the user.
     * 
     * @param {str} sender The user of the session.
     * @param {*} stage The stage to be set.
     */
    setStage(sender, stage) {
        this.sessionData[sender]["stage"] = stage;
    }

    /**
     * Provides the stage index of the user.
     * 
     * @param {str} sender The user of the session. 
     * 
     * @returns The stage index.
     */
    getStageIndex(sender) {
        return this.sessionData[sender]["stageIndex"];
    }

    /**
     * Updates the stage index of the user.
     * 
     * @param {str} sender The user of the session.
     * @param {number} index The index to be set.
     */
    setStageIndex(sender, index) {
        this.sessionData[sender]["stageIndex"] = index;
    }

    /**
     * Provides the parent stage of the user.
     * 
     * @param {str} sender The user of the session. 
     * 
     * @returns The parent stage.
     */
    getParentStage(sender) {
        return this.sessionData[sender]["parentStage"];
    }

    /**
     * Updates the parent stage of the user.
     * 
     * @param {str} sender The user of the session.
     * @param {*} parentStage The parent stage to be set.
     */
    setParentStage(sender, parentStage) {
        this.sessionData[sender]["parentStage"] = parentStage;
    }

    /**
     * Provides the user information of the user.
     * 
     * @param {str} sender The user of the session. 
     * 
     * @returns The user information.
     */
    getUserInformation(sender) {
        return this.sessionData[sender]["userInformation"];
    }

    /**
     * Updates the user information of the user.
     * 
     * @param {str} sender The user of the session.
     * @param {*} userInformation The user information to be set.
     */
    setUserInformation(sender, userInformation) {
        this.sessionData[sender]["userInformation"] = userInformation;
    }

    /**
     * Determines if the user is editing.
     *
     * @param {str} sender The user of the session. 
     * 
     * @returns The edidting status.
     */
    isEditing(sender) {
        return this.sessionData[sender]["editing"];
    }

    /**
     * Updates the editing status of the user.
     * 
     * @param {str} sender The user of the session.
     * @param {boolean} editing The editing status to be set.
     */
    setEditing(sender, editing) {
        this.sessionData[sender]["editing"] = editing;
    }
}

module.exports = SessionManager;