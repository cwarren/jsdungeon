const TIME_WRAP_LIMIT = 10000;

// Priority queue for timing entities, supporting an action cost / action point system
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
        console.log(`adding ${entity.type} to turn queue`);
        this.queue.push({ entity, time: initialTime });
        this.ordering();
    }
    setEntities(entityList) {
        this.clear();
        entityList.forEach(entity => {
            this.addEntity(entity, Math.floor(Math.random() * entityList.length * 2)); // shuffle them a bit
        });
    }
    setEntitiesSansAvatar(entityList) {
        this.clear();
        entityList.forEach(entity => {
            if (entity.type != "AVATAR") {
                this.addEntity(entity, Math.floor(Math.random() * entityList.length * 2)); // shuffle them a bit
            }
        });
    }

    removeEntity(entity) {
        this.queue = this.queue.filter(entry => entry.entity !== entity);
    }

    ordering() {
        this.queue.sort((a, b) => a.time - b.time); // Maintain order
    }

    // Pop the next entity to act
    nextTurn() {
        if (this.queue.length === 0) return null;

        let next = this.queue.shift();
        console.log('next turn', next.entity);

        // Let the entity act
        let actionCost;
        if (next.entity.isRunning) {
            actionCost = next.entity.continueRunning();
        } else {
            actionCost = next.entity.takeTurn(); // Default action
        }
        this.timePasses(actionCost);
        
        // Reschedule non-avatar entity based on action cost (avatar actions are handled separately)
        if (next.entity.type != "AVATAR" || next.entity.isRunning) {
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

export { TurnQueue };
