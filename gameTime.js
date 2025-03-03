import { GAME_STATE } from "./gameStateClass.js";
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

    addEntity(entity, initialTime = null) {
        devTrace(4,`add entity to turn queue at ${initialTime}`, entity, this);
        let assignedTime = initialTime;
        if (assignedTime === null) {
            const lastTime = this.queue.length > 0 ? this.queue[this.queue.length - 1].time : 0;
            assignedTime = lastTime + 1;
        }    
        devTrace(7,`Adding ${entity.type} to turn queue at time ${assignedTime}`);
        devTrace(7,"before", ...this.queue);
        this.queue.push({ entity, time: assignedTime });
        devTrace(7,"after", ...this.queue);
        this.ordering();
    }
    addEntityAtBeginningOfTurnQueue(entity) {
        devTrace(4,`add entity to turn queue at beginning`, entity, this);
        const initialTime = this.queue[0] ? this.queue[0].time -1 : 0;
        devTrace(7,`Adding ${entity.type} to turn queue beginning, at time ${initialTime}`);
        devTrace(7,"before", ...this.queue);
        this.queue.push({ entity, time: initialTime });
        devTrace(7,"after", ...this.queue);
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
        devTrace(4,`remove entity from turn queue`, entity, this);
        this.queue = this.queue.filter(entry => entry.entity !== entity);
    }

    ordering() {
        devTrace(9,`order turn queue by time`, this);
        this.queue.sort((a, b) => a.time - b.time); // Maintain order
    }

    nextTurn() {
        devTrace(4,`do next turn on turn queue`, this);
        if (this.queue.length === 0) return null;
        if (GAME_STATE.status != "ACTIVE") return null;

        let next = this.queue.shift();
        this.timePasses(next.time - this.previousActionTime);
        this.previousActionTime = next.time;
        
        if (next.entity == "TIME_MARKER") return next.entity; // TIME_MARKER is a special indicator, set by runTimeFor

        devTrace(5,`-- entity ${next.entity.type} acting at ${next.time}`, next);
        next.entity.setActionStartingTime(next.time);

        // Let the entity act
        let actionTime;
        if (next.entity.movement.isRunning) {
            actionTime = next.entity.movement.continueRunning();
        } else if (next.entity.movement.isSleeping) {
            actionTime = next.entity.movement.continueSleeping();
        } else {
            actionTime = next.entity.takeTurn(); // Default action
        }
        
        // Reschedule non-avatar entity based on action cost (avatar actions are handled separately, in GAME_STATE.handlePlayerActionTime)
        // also, running entities (including avatar) are always rescheduled
        if (next.entity.type != "AVATAR" || next.entity.movement.isRunning || next.entity.movement.isSleeping) {
            next.time += actionTime;
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
        this.queue.push({ entity: "TIME_MARKER", time: targetTime });
        this.ordering();
        let activeEntity = this.nextTurn();
        while (activeEntity != "TIME_MARKER") {
            activeEntity = this.nextTurn();
            if (!activeEntity) break; // No more entities to process
        }
        this.elapsedTime = targetTime;
        this.previousActionTime = targetTime;
    }

    normalizeQueueTimes() {
        devTrace(10,`normalizeQueueTimes`, this);
        if (this.queue.length === 0) return;

        const minTime = this.queue[0].time;
        
        // If the minimum time is getting too large, normalize all entries
        if (minTime > TIME_WRAP_LIMIT) {
            console.log("Normalizing TurnQueue times to prevent overflow.");
            this.queue.forEach(entry => {
                if (entry.entity && entry.entity.health) {
                    entry.entity.health.lastNaturalHealTime -= minTime; // a bit of a hack; this is too deep into entity knowledge, but works for now...
                }
                entry.time -= minTime;
            });
        }
    }
}

export { TurnQueue };
