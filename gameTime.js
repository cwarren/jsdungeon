import { gameState } from "./gameplay.js";

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
        
        // Reschedule entity based on action cost
        next.time += actionCost;
        this.queue.push(next);
        this.queue.sort((a, b) => a.time - b.time); // Maintain order

        return next.entity;
    }

    timePasses(someTime) {
        this.elapsedTime += someTime;
    }
}

// Global game turn queue
const turnQueue = new TurnQueue();

// Function to start or advance the game turn loop
function advanceGameTime() {
    while (true) {
        console.log("time passes...", turnQueue);
        let activeEntity = turnQueue.nextTurn();
        if (!activeEntity) break; // No more entities to process

        if (activeEntity === gameState.avatar) {
            break; // Stop when it's the player's turn
        }

        // Handle AI or environmental actions
    }
}

function handlePlayerAction(actionCost) {
    const player = gameState.avatar;

    // Reinsert player into turn queue with adjusted time
    turnQueue.addEntity(player, turnQueue.queue[0].time + actionCost);
    turnQueue.timePasses(actionCost);

    // Resume the turn loop after the player acts
    advanceGameTurn();
}

// Function to initialize turn-based time system
function initializeTurnSystem() {
    turnQueue.clear();

    gameState.world[gameState.avatar.z].levelEntities.forEach(entity => {
        turnQueue.addEntity(entity, 0);
    });

    turnQueue.addEntity(gameState.avatar, -1); // Add player to the queue, at the front
}

function initializeTurnSystem_mobsOnly() {
    turnQueue.clear();
    
    gameState.world[gameState.avatar.z].levelEntities.forEach(entity => {
        turnQueue.addEntity(entity, 0);
    });
}

export { turnQueue, advanceGameTime, initializeTurnSystem, initializeTurnSystem_mobsOnly, handlePlayerAction };
