import { MessageArchive, DEFAULT_MAX_ARCHIVED_MESSAGES } from './messageArchiveClass';

describe('MessageArchive', () => {
    let msg1, msg2, msg3, msg4, msg5;
    beforeEach(() => {
        // Reset the message archive before each test
        msg1 = MessageArchive.makeMessageObject('Message 1');
        msg2 = MessageArchive.makeMessageObject('Message 2');
        msg3 = MessageArchive.makeMessageObject('Message 3');
        msg4 = MessageArchive.makeMessageObject('Message 4');
        msg5 = MessageArchive.makeMessageObject('Message 5');
    });


    test('should create an instance with default max messages', () => {
        const archive = new MessageArchive();
        expect(archive.maxMessages).toBe(DEFAULT_MAX_ARCHIVED_MESSAGES);
        expect(archive.messages).toEqual([]);
    });

    test('should create an instance with specified max messages', () => {
        const archive = new MessageArchive(11);
        expect(archive.maxMessages).toBe(11);
        expect(archive.messages).toEqual([]);
    });

    test('should create a message object with text and default ageStatus', () => {
        const messageText = 'Test message';
        const messageObject = MessageArchive.makeMessageObject(messageText);

        expect(messageObject).toEqual({
            text: messageText,
            ageStatus: 'newest'
        });
    });

    test('should age a message correctly', () => {
        const message = { text: 'Test message', ageStatus: 'newest' };
        const archive = new MessageArchive();

        const result0 = archive.ageMessage(message);
        expect(result0).toBe(true);
        expect(message.ageStatus).toBe('new');

        const result1 = archive.ageMessage(message);
        expect(result1).toBe(true);
        expect(message.ageStatus).toBe('current');

        const result2 = archive.ageMessage(message);
        expect(result2).toBe(true);
        expect(message.ageStatus).toBe('aged');

        const result3 = archive.ageMessage(message);
        expect(result3).toBe(false);
        expect(message.ageStatus).toBe('aged'); // No further change
    });

    describe('MessageArchive - message adding', () => {
        test('should add messages and maintain the limit', () => {
            const archive = new MessageArchive(3);
            archive.addMessage(msg1.text);
            archive.addMessage(msg2.text);
            archive.addMessage(msg3.text);
            expect(archive.getMessages()).toEqual([msg1, msg2, msg3]);
    
            archive.addMessage(msg4.text);
            expect(archive.getMessages()).toEqual([msg2, msg3, msg4]);
        });

        test('should handle adding messages when limit is 1', () => {
            const archive = new MessageArchive(1);
            archive.addMessage(msg1.text);
            expect(archive.getMessages()).toEqual([msg1]);

            archive.addMessage(msg2.text);
            expect(archive.getMessages()).toEqual([msg2]);
        });

        test('should return an empty array when no messages are added', () => {
            const archive = new MessageArchive(5);
            expect(archive.getMessages()).toEqual([]);
        });
    });

    describe('MessageArchive - recent messages', () => {

        test('should return the most recent messages based on the count', () => {
            const archive = new MessageArchive(5);
            archive.addMessage(msg1.text);
            archive.addMessage(msg2.text);
            archive.addMessage(msg3.text);
            archive.addMessage(msg4.text);
            archive.addMessage(msg5.text);

            expect(archive.getRecentMessages(2)).toEqual([msg4, msg5]);
            expect(archive.getRecentMessages(4)).toEqual([msg2, msg3, msg4, msg5]);
        });

        test('should return all messages if count exceeds the number of messages', () => {
            const archive = new MessageArchive(5);
            archive.addMessage(msg1.text);
            archive.addMessage(msg2.text);

            expect(archive.getRecentMessages(2)).toEqual([msg1, msg2]);
        });

        test('should return an empty array if no messages are present', () => {
            const archive = new MessageArchive(5);
            expect(archive.getRecentMessages(3)).toEqual([]);
        });

        test('should return an empty array if count given is <= 0', () => {
            const archive = new MessageArchive(5);
            archive.addMessage(msg1.text);
            archive.addMessage(msg2.text);
            archive.addMessage(msg3.text);

            expect(archive.getRecentMessages(0)).toEqual([]);

            expect(archive.getRecentMessages(-1)).toEqual([]);
        });

        test('should return the most recent message by default when no count is provided', () => {
            const archive = new MessageArchive(5);
            archive.addMessage(msg1.text);
            archive.addMessage(msg2.text);
            archive.addMessage(msg3.text);

            expect(archive.getRecentMessages()).toEqual([msg3]);
        });
    });
});
