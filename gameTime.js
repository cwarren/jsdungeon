import { gameState } from "./gameStateClass.js";
import { devTrace } from "./util.js";

const TIME_WRAP_LIMIT = 10000;

// Priority queue for timing entities, supporting an action cost / action point system
class TurnQueue {
    constructor() {
        this.queue = [];
        this.elapsedTime = 0;
        this.previousActionTime = 0;
    }

    clear() {
        devTrace(5,'clearing turn queue', this);
        this.queue = [];
    }

    // Add an entity to the queue with a starting time
    // addEntity(entity, initialTime = 0) {
    //     console.log(`adding ${entity.type} to turn queue`);
    //     this.queue.push({ entity, time: initialTime });
    //     this.ordering();
    // }
    addEntity(entity, initialTime = null) {
        devTrace(4,`add entity to turn queue at ${initialTime}`, entity, this);
        let assignedTime = initialTime;
        if (assignedTime === null) {
            const lastTime = this.queue.length > 0 ? this.queue[this.queue.length - 1].time : 0;
            assignedTime = lastTime + 1;
        }
        // const lastTime = this.queue.length > 0 ? this.queue[this.queue.length - 1].time : 0;
        // const assignedTime = initialTime !== null ? initialTime : lastTime + 1;
    
        console.log(`Adding ${entity.type} to turn queue at time ${assignedTime}`);
        this.queue.push({ entity, time: assignedTime });
        this.ordering();
    }
    addEntityAtBeginningOfTurnQueue(entity) {
        devTrace(4,`add entity to turn queue at beginning`, entity, this);
        const initialTime = this.queue[0] ? this.queue[0].time -1 : 0;
        this.queue.push({ entity, time: initialTime });
        this.ordering();
    }
    setEntities(entityList) {
        devTrace(5,`set turn queue entities`, entityList, this);
        this.clear();
        entityList.forEach(entity => {
            this.addEntity(entity, Math.floor(Math.random() * entityList.length * 2)); // shuffle them a bit
        });
    }
    setEntitiesSansAvatar(entityList) {
        devTrace(5,`set turn queue entities, sans avatar`, entityList, this);
        this.clear();
        entityList.forEach(entity => {
            if (entity.type != "AVATAR") {
                this.addEntity(entity, Math.floor(Math.random() * entityList.length * 2)); // shuffle them a bit
            }
        });
    }

    removeEntity(entity) {
        devTrace(4,`remove entity from turn`, entity, this);
        this.queue = this.queue.filter(entry => entry.entity !== entity);
    }

    ordering() {
        devTrace(9,`order turn queue by time`, this);
        this.queue.sort((a, b) => a.time - b.time); // Maintain order
    }

    // Pop the next entity to act
    nextTurn() {
        devTrace(4,`do next turn on turn queue`, this);
        if (this.queue.length === 0) return null;
        if (gameState.status != "ACTIVE") return null;

        let next = this.queue.shift();
        devTrace(5,'--- turn of entity', next);
        this.timePasses(next.time - this.previousActionTime);
        this.previousActionTime = next.time;
        console.log('next turn', next.entity);

        // Let the entity act
        let actionCost;
        if (next.entity.isRunning) {
            actionCost = next.entity.continueRunning();
        } else {
            actionCost = next.entity.takeTurn(); // Default action
        }
        
        // Reschedule non-avatar entity based on action cost (avatar actions are handled separately, in gameState.handlePlayerActionTime)
        // also, running entities (including avatar) are always rescheduled
        if (next.entity.type != "AVATAR" || next.entity.isRunning) {
            next.time += actionCost;
            this.queue.push(next);
            this.ordering();
            this.normalizeQueueTimes();
        }

        return next.entity;
    }

    timePasses(someTime) {
        devTrace(5,`some time passes - ${someTime} ticks`);
        this.elapsedTime += someTime;
    }

    runTimeFor(ticks) {
        devTrace(5,`running time ${ticks} on turn queue`, this);
        const targetTime = this.elapsedTime + ticks;
        while (this.elapsedTime < targetTime) {
            let activeEntity = this.nextTurn();
            if (!activeEntity) break; // No more entities to process
        }
    }

    normalizeQueueTimes() {
        devTrace(10,`normalizeQueueTimes`, this);
        if (this.queue.length === 0) return;

        const minTime = this.queue[0].time;
        
        // If the minimum time is getting too large, normalize all entries
        if (minTime > TIME_WRAP_LIMIT) {
            console.log("Normalizing TurnQueue times to prevent overflow.");
            this.queue.forEach(entry => entry.time -= minTime);
        }
    }
}

export { TurnQueue };
