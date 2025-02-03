import { Structure } from "./structureClass.js";
import { Stairs } from "./stairsClass.js";
import { constrainValue, devTrace } from "./util.js";
import {
    setWorldLevelForGridCells,
    generateGrid_empty,
    generateGrid_random,
    generateGrid_caves,
    generateGrid_caves_shattered,
    generateGrid_caves_large,
    generateGrid_caves_huge,
    generateGrid_burrow,
    generateGrid_nest,
    generateGrid_roomsAndCorridors_random,
    generateGrid_roomsAndCorridors_subdivide,
    generateGrid_town,
    generateGrid_puddles
} from "./gridGeneration.js";
import {
    getRandomEmptyCellOfTerrainInGrid,
    getRandomCellOfTerrainInGrid,
    determineCellViewability
} from "./gridUtils.js";
import { TurnQueue } from "./gameTime.js";
import { Entity, DEFAULT_ACTION_COST } from "./entityClass.js";
// import { addMessage } from "./uiUtil.js"; 
import { uiPaneMessages } from "./ui.js";

const MAX_ENTITY_PLACEMENT_ATTEMPTS = 20;
const MAX_TIME_AWAY_TO_CARE_ABOUT = DEFAULT_ACTION_COST * 100;

class WorldLevel {
    constructor(gameState, levelNumber, levelWidth, levelHeight, levelType = "EMPTY") {
        this.gameState = gameState;
        this.levelNumber = levelNumber;
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;
        this.grid = null;
        this.levelType = levelType;
        this.levelEntities = [];
        this.levelStructures = [];
        this.stairsDown = null;
        this.stairsUp = null;
        this.turnQueue = new TurnQueue();
        this.timeOfAvatarDeparture = 0;
        // console.log("new world level", this);
    }

    static levelTypeToGenFunction = {
        "EMPTY": generateGrid_empty,
        "TOWN": generateGrid_town,
        "BURROW": generateGrid_burrow,
        "CAVES": generateGrid_caves,
        "CAVES_HUGE": generateGrid_caves_huge,
        "CAVES_LARGE": generateGrid_caves_large,
        "CAVES_SHATTERED": generateGrid_caves_shattered,
        "NEST": generateGrid_nest,
        "PUDDLES": generateGrid_puddles,
        "RANDOM": generateGrid_random,
        "ROOMS_RANDOM": generateGrid_roomsAndCorridors_random,
        "ROOMS_SUBDIVIDE": generateGrid_roomsAndCorridors_subdivide,

        "DEFAULT": generateGrid_empty
    };

    generate() {
        devTrace(1, "generating world level");
        this.generateGrid();
        this.populate();
        // NOTE: this stair-adding logic assumes that the world is generated in order and that each level
        //  has exactly one connection up and down (except for the first and last, which have only down
        //  and up respectively)
        if (this.gameState.world.length > 1) {
            if (this.levelNumber < this.gameState.world.length - 1) {
                this.addStairsDown();
            }
            if (this.levelNumber > 0) {
                const stairsDown = this.gameState.world[this.levelNumber - 1].stairsDown;
                this.addStairsUpTo(stairsDown);
            }
        }
    }

    generateGrid() {
        devTrace(1, "generating world level");
        let gridGenFunction = WorldLevel.levelTypeToGenFunction[this.levelType];
        if (!gridGenFunction) {
            gridGenFunction = WorldLevel.levelTypeToGenFunction["DEFAULT"];
        }
        this.grid = gridGenFunction(this.levelWidth, this.levelHeight);
        setWorldLevelForGridCells(this, this.grid);
        determineCellViewability(this.grid);
    }
    isGridGenerated() {
        return this.grid != null;
    }
    populate() {
        devTrace(2, "populating level");
        //console.log("world level population (TO BE IMPLEMENTED (1 insidious rat for now))");
        for (let i = 0; i < 1; i++) {
            const ent = new Entity("RAT_INSIDIOUS");
            this.placeEntityRandomly(ent);
        }
    }

    placeEntityRandomly(entity, avoidCellSet) {
        devTrace(3, `placing entity ${entity.type} randomly in world level`, this, entity, avoidCellSet);
        let possiblePlacementCell = getRandomEmptyCellOfTerrainInGrid("FLOOR", this.grid);
        let placementAttempts = 1;
        if (avoidCellSet) {
            while (avoidCellSet.has(possiblePlacementCell) && (placementAttempts < MAX_ENTITY_PLACEMENT_ATTEMPTS)) {
                possiblePlacementCell = getRandomEmptyCellOfTerrainInGrid("FLOOR", this.grid);
                placementAttempts++;
            }
        }
        if (placementAttempts >= MAX_ENTITY_PLACEMENT_ATTEMPTS) {
            console.log("could not place entity in world level - placement attempts exceed max placement attempts");
        } else {
            this.addEntity(entity, possiblePlacementCell);
        }
    }

    addEntity(ent, atCell = null) {
        devTrace(3, `adding entity ${ent.type} to level`, this);
        this.levelEntities.push(ent);
        if (atCell) {
            ent.placeAtCell(atCell);
        } else {
            ent.placeAtCell(ent.getCell());
        }
        this.turnQueue.addEntity(ent);
    }

    addEntityAtBeginningOfTurnQueue(ent, atCell = null) {
        devTrace(3, `adding entity ${ent.type} to level, at beginning of turn queue`, this);
        this.levelEntities.push(ent);
        if (atCell) {
            ent.placeAtCell(atCell);
        } else {
            ent.placeAtCell(ent.getCell());
        }
        this.turnQueue.addEntityAtBeginningOfTurnQueue(ent);
    }

    removeEntity(ent) {
        devTrace(3, `removing entity ${ent.type} from level`, this);
        const index = this.levelEntities.indexOf(ent);

        if (index !== -1) {
            this.levelEntities.splice(index, 1);
        }

        // If the entity was occupying a cell, clear the reference
        const cell = ent.getCell();
        if (cell && cell.entity === ent) {
            cell.entity = undefined;
        }

        this.turnQueue.removeEntity(ent);
    }

    addStairsDown() {
        devTrace(4, "adding stairs down for level", this);
        const stairsDownCell = getRandomEmptyCellOfTerrainInGrid("FLOOR", this.grid);
        const stairsDown = new Stairs(this, stairsDownCell.x, stairsDownCell.y, this.levelNumber, 'STAIRS_DOWN', '>');
        this.stairsDown = stairsDown;
        stairsDownCell.structure = stairsDown;
        this.levelStructures.push(stairsDown);
    }

    addStairsUpTo(stairsDown) {
        devTrace(4, "adding stairs up for level", this);
        const stairsUpCell = getRandomEmptyCellOfTerrainInGrid("FLOOR", this.grid);
        const stairsUp = new Stairs(this, stairsUpCell.x, stairsUpCell.y, this.levelNumber, 'STAIRS_UP', '<');
        this.stairsUp = stairsUp;
        stairsUpCell.structure = stairsUp;
        stairsDown.connectsTo = stairsUp;
        stairsUp.connectsTo = stairsDown;
        this.levelStructures.push(stairsUp);
    }

    trackAvatarDepartureTime() {
        devTrace(5, `avatar left level at ${this.turnQueue.elapsedTime}`, this);
        this.timeOfAvatarDeparture = this.turnQueue.elapsedTime;
    }

    handleAvatarEnteringLevel(entryCell) {
        devTrace(2, "handle avatat entering level at a cell", this, entryCell);
        let timeOnPreviousLevel = constrainValue(this.gameState.avatar.timeOnLevel, 0, MAX_TIME_AWAY_TO_CARE_ABOUT);
        this.gameState.avatar.resetTimeOnLevel();
        this.gameState.setTurnQueue(this.turnQueue);
        if (timeOnPreviousLevel >= DEFAULT_ACTION_COST) {
            this.turnQueue.runTimeFor(timeOnPreviousLevel);
        }

        // no adding the avatar to the turn queue on level entry - it's added appropriately by handlePlayerActionTime in game state
        this.levelEntities.push(this.gameState.avatar);
        this.gameState.avatar.placeAtCell(entryCell);

        //  make sure the avatar's actionStartingTime is set correctly, otherwise the avatar could get a bunch of free moves until catching up to the first other mob
        if (this.turnQueue.queue[0]) {
            this.gameState.avatar.actionStartingTime = this.turnQueue.queue[0].time;
        } else {
            this.gameState.avatar.actionStartingTime = this.turnQueue.elapsedTime;
        }

        // TODO: add message about entering level
        addMessage(`You enter level ${this.levelNumber + 1}`);
    }
}

export { WorldLevel };
