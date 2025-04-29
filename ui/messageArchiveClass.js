const DEFAULT_MAX_MESSAGES = 1000;



class MessageArchive {
    constructor(maxMessages = DEFAULT_MAX_MESSAGES) {
        this.maxMessages = maxMessages;
        this.messages = [];
    }

    /**
     * Adds a new message to the message archive.
     * 
     * The method appends the provided message to the `messages` array. If the total number
     * of messages exceeds the `maxMessages` limit, it removes the oldest messages from the
     * beginning of the array to ensure the archive does not exceed the maximum allowed size.
     * 
     * @param {string} message - The message to be added to the archive.
     */
    addMessage(message) {

        this.messages.push(message);
        if (this.messages.length > this.maxMessages) {
            // NOTE: using splice to mutate the array directly rather than slice to create a copy
            this.messages.splice(0, this.messages.length - this.maxMessages);
            // slice-based alternative, for quick later ref if needed:
            // this.messages = this.messages.slice(-this.maxMessages);
        }
    }

    getMessages() {
        return this.messages;
    }

    getRecentMessages(count = 1) {
        return this.messages.slice(-count);
    }
}

export { MessageArchive };