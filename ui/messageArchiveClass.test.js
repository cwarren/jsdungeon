import { MessageArchive } from './messageArchiveClass';

describe('MessageArchive', () => {
    test('should add messages and maintain the limit', () => {
        const archive = new MessageArchive(3);
        archive.addMessage('Message 1');
        archive.addMessage('Message 2');
        archive.addMessage('Message 3');
        expect(archive.getMessages()).toEqual(['Message 1', 'Message 2', 'Message 3']);

        archive.addMessage('Message 4');
        expect(archive.getMessages()).toEqual(['Message 2', 'Message 3', 'Message 4']);
    });

    test('should handle adding messages when limit is 1', () => {
        const archive = new MessageArchive(1);
        archive.addMessage('Message 1');
        expect(archive.getMessages()).toEqual(['Message 1']);

        archive.addMessage('Message 2');
        expect(archive.getMessages()).toEqual(['Message 2']);
    });

    test('should return an empty array when no messages are added', () => {
        const archive = new MessageArchive(5);
        expect(archive.getMessages()).toEqual([]);
    });
});
test('should return the most recent messages based on the count', () => {
    const archive = new MessageArchive(5);
    archive.addMessage('Message 1');
    archive.addMessage('Message 2');
    archive.addMessage('Message 3');
    archive.addMessage('Message 4');
    archive.addMessage('Message 5');

    expect(archive.getRecentMessages(2)).toEqual(['Message 4', 'Message 5']);
    expect(archive.getRecentMessages(3)).toEqual(['Message 3', 'Message 4', 'Message 5']);
});

test('should return all messages if count exceeds the number of messages', () => {
    const archive = new MessageArchive(5);
    archive.addMessage('Message 1');
    archive.addMessage('Message 2');

    expect(archive.getRecentMessages(5)).toEqual(['Message 1', 'Message 2']);
});

test('should return an empty array if no messages are present', () => {
    const archive = new MessageArchive(5);
    expect(archive.getRecentMessages(3)).toEqual([]);
});

test('should return the most recent message by default when no count is provided', () => {
    const archive = new MessageArchive(5);
    archive.addMessage('Message 1');
    archive.addMessage('Message 2');
    archive.addMessage('Message 3');

    expect(archive.getRecentMessages()).toEqual(['Message 3']);
});