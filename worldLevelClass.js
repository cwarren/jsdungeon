import { GridCell } from "./gridCellClass.js";
import { Structure } from "./structureClass.js";
import { constrainValue } from "./util.js";
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

const MAX_ENTITY_PLACEMENT_ATTEMPTS = 20;

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
        let gridGenFunction = WorldLevel.levelTypeToGenFunction[this.levelType];
        if (! gridGenFunction) {
            gridGenFunction = WorldLevel.levelTypeToGenFunction["DEFAULT"];
        }
        this.grid = gridGenFunction(this.levelWidth,this.levelHeight);
        setWorldLevelForGridCells(this, this.grid);
        determineCellViewability(this.grid);

        this.populate();
    }
    isGenerated() {
        return this.grid != null;
    }
    populate() {
        console.log("world level population");
    }

    placeEntityRandomly(entity, avoidCellSet) {
      let possiblePlacementCell = getRandomCellOfTerrainInGrid("FLOOR", this.grid);
      let placementAttempts = 1;
      if (avoidCellSet) {  
        while (avoidCellSet.has(possiblePlacementCell) && (placementAttempts < MAX_ENTITY_PLACEMENT_ATTEMPTS)) {
          possiblePlacementCell = getRandomCellOfTerrainInGrid("FLOOR", this.grid);
          placementAttempts++;
        }
      }
      if (placementAttempts >= MAX_ENTITY_PLACEMENT_ATTEMPTS) {
        console.log("could not place entity in world level - placement attempts exceed max placement attempts");
      } else {
        entity.placeAtCell(possiblePlacementCell);
        this.addEntity(entity,Math.floor(Math.random()*99)+1);
      }
    }

    addEntity(ent) {
        this.levelEntities.push(ent);
        this.turnQueue.addEntity(ent);
        // console.log("adding entity to level", this);
    }

    removeEntity(ent) {
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
        const stairsDownCell = getRandomEmptyCellOfTerrainInGrid("FLOOR",this.grid);
        const stairsDown = new Structure(stairsDownCell.x,stairsDownCell.y,this.levelNumber,'STAIRS_DOWN','>');
        this.stairsDown = stairsDown;
        stairsDownCell.structure = stairsDown;
        this.levelStructures.push(stairsDown);
    }

    addStairsUpTo(stairsDown) {
        const stairsUpCell = getRandomEmptyCellOfTerrainInGrid("FLOOR",this.grid);
        const stairsUp = new Structure(stairsUpCell.x,stairsUpCell.y,this.levelNumber,'STAIRS_UP','<');
        this.stairsUp = stairsUp;
        stairsUpCell.structure = stairsUp;
        stairsDown.connectsTo = stairsUp;
        stairsUp.connectsTo = stairsDown;
        this.levelStructures.push(stairsUp);
    }

    handleAvatarEnteringLevel() {
        // * * * * calc standard turns since avatar left the level
        // * * * * if less than threshold, resume time as normal, otherwise
        // * * * * * remove the avatar from the turn queue for the new level
        // * * * * * advance time for the level being entered for the time since avatar left, up to some limit (~100 std turns)
        // * * * * * add the avatar to the front of the queue for the level being entered
        this.gameState.setTurnQueue(this.turnQueue);
    }
}

export { WorldLevel };
