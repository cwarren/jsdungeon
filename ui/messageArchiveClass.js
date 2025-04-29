const DEFAULT_MAX_ARCHIVED_MESSAGES = 1000;



class MessageArchive {
    constructor(maxMessages = DEFAULT_MAX_ARCHIVED_MESSAGES) {
        this.maxMessages = maxMessages;
        this.messages = []; // NOTE: messages aren't just strings, but objects with text and ageStatus properties
    }

    static makeMessageObject(messageText) {
        return {
            text: messageText,
            ageStatus: 'newest'
        };
    }

    /**
     * IMPLEMENTATION: The method appends the provided message to the `messages` array. If 
     * the total number of messages exceeds the `maxMessages` limit, it removes the oldest
     * messages from the beginning of the array to ensure the archive does not exceed the 
     * maximum allowed size.
     * 
     * NOTE: adding a messages does NOT automatically age other messages - that has to be
     * handled explicitly by the caller as needed
     */
    addMessage(messageText) {
        const message = MessageArchive.makeMessageObject(messageText);
        this.messages.push(message);
        if (this.messages.length > this.maxMessages) {
            // NOTE: using splice to mutate the array directly rather than slice to create a copy
            this.messages.splice(0, this.messages.length - this.maxMessages);
            // slice-based alternative, for quick later ref if needed:
            // this.messages = this.messages.slice(-this.maxMessages);
        }
    }

    ageMessage(message) {
        if (message.ageStatus === 'newest') {
            message.ageStatus = 'current';
        } else if (message.ageStatus === 'current') {
            message.ageStatus = 'aged';
        } else if (message.ageStatus === 'aged') {
            return false; // already aged, so no change made
        }
        return true; // successfully aged the message
    }

    ageMessages() {
        for (let i = 0; i < this.messages.length; i++) {
            if (!this.ageMessage(this.messages[i])) {
                break; // short circuit if a message is already 'aged'; 
                // since this is a queue, we can stop aging once we hit the first one that
                // is already 'aged'
            }
        }
    }

    getMessages() {
        return this.messages;
    }

    getRecentMessages(count = 1) {
        return this.messages.slice(-count);
    }
}

export { MessageArchive, DEFAULT_MAX_ARCHIVED_MESSAGES };