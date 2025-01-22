import { gameState } from "./gameplay.js";

const TIME_WRAP_LIMIT = 10000;

// Priority queue for timing entities
class TurnQueue {
    constructor() {
        this.queue = [];
        this.elapsedTime = 0;
    }

    clear() {
        this.queue = [];
    }

    // Add an entity to the queue with a starting time
    addEntity(entity, initialTime = 0) {
        this.queue.push({ entity, time: initialTime });
        this.ordering();
    }

    ordering() {
        this.queue.sort((a, b) => a.time - b.time); // Maintain order
    }

    // Pop the next entity to act
    nextTurn() {
        if (this.queue.length === 0) return null;

        // Get the entity with the lowest time cost (earliest turn)
        let next = this.queue.shift();

        // Let the entity act
        let actionCost = next.entity.takeTurn(); // Entity must implement takeTurn()
        this.timePasses(actionCost);
        
        // Reschedule non-avatar entity based on action cost (avatar actions are handled separately)
        if (next.entity.type != "AVATAR") {
            next.time += actionCost;
            this.queue.push(next);
            this.ordering();
            this.normalizeQueueTimes();
        }

        return next.entity;
    }

    timePasses(someTime) {
        this.elapsedTime += someTime;
    }

    normalizeQueueTimes() {
        if (this.queue.length === 0) return;

        const minTime = this.queue[0].time;
        
        // If the minimum time is getting too large, normalize all entries
        if (minTime > TIME_WRAP_LIMIT) {
            console.log("Normalizing TurnQueue times to prevent overflow.");
            this.queue.forEach(entry => entry.time -= minTime);
        }
    }
}

// Global game turn queue
const turnQueue = new TurnQueue();

// Function to start or advance the game turn loop
function advanceGameTime() {
    while (true) {
        // console.log("time passes...", turnQueue);
        let activeEntity = turnQueue.nextTurn();
        if (!activeEntity) break; // No more entities to process

        if (activeEntity === gameState.avatar) {
            break; // Stop when it's the player's turn
        }

        // Handle other AI or environmental actions (if they're not already a part of the turn queue system... which they probably should be...)
    }
}

function handlePlayerActionTime(actionCost) {
    if (actionCost <= 0) { return; }

    const player = gameState.avatar;

    // Reinsert player into turn queue with adjusted time
    turnQueue.addEntity(player, turnQueue.queue[0].time + actionCost);
    turnQueue.timePasses(actionCost);
    turnQueue.normalizeQueueTimes();

    // Resume the turn loop after the player acts
    advanceGameTime();
}

// Function to initialize turn-based time system
function initializeTurnSystem() {
    initializeTurnSystem_mobsOnly();
    turnQueue.addEntity(gameState.avatar, -1); // Add player to the queue, at the front
}

function initializeTurnSystem_mobsOnly() {
    turnQueue.clear();
    const levelEntities = gameState.world[gameState.avatar.z].levelEntities;
    levelEntities.forEach(entity => {
        turnQueue.addEntity(entity, Math.floor(Math.random() * levelEntities.length)); // shuffle them a bit
    });
}

export { turnQueue, advanceGameTime, initializeTurnSystem, initializeTurnSystem_mobsOnly, handlePlayerActionTime };
