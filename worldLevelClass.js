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

const MAX_ENTITY_PLACEMENT_ATTEMPTS = 20;

class WorldLevel {
    constructor(levelNumber, levelWidth, levelHeight, levelType = "EMPTY") {
        this.levelNumber = levelNumber;
        this.levelWidth = levelWidth;
        this.levelHeight = levelHeight;
        if (levelType == "EMPTY") {
            this.grid = generateGrid_empty(levelWidth,levelHeight);
        } else if (levelType == "TOWN") {
            this.grid = generateGrid_town(levelWidth,levelHeight);
        } else if (levelType == "BURROW") {
            this.grid = generateGrid_burrow(levelWidth,levelHeight);
        } else if (levelType == "CAVES") {
            this.grid = generateGrid_caves(levelWidth,levelHeight);
        } else if (levelType == "CAVES_HUGE") {
            this.grid = generateGrid_caves_huge(levelWidth,levelHeight);
        } else if (levelType == "CAVES_LARGE") {
            this.grid = generateGrid_caves_large(levelWidth,levelHeight);
        } else if (levelType == "CAVES_SHATTERED") {
            this.grid = generateGrid_caves_shattered(levelWidth,levelHeight);
        } else if (levelType == "NEST") {
            this.grid = generateGrid_nest(levelWidth,levelHeight);
        } else if (levelType == "PUDDLES") {
            this.grid = generateGrid_puddles(levelWidth,levelHeight);
        } else if (levelType == "RANDOM") {
            this.grid = generateGrid_random(levelWidth,levelHeight);
        } else if (levelType == "ROOMS_RANDOM") {
            this.grid = generateGrid_roomsAndCorridors_random(levelWidth,levelHeight);
        } else if (levelType == "ROOMS_SUBDIVIDE") {
            this.grid = generateGrid_roomsAndCorridors_subdivide(levelWidth,levelHeight);
        } else {
            this.grid = generateGrid_empty(levelWidth,levelHeight);
        }
        setWorldLevelForGridCells(this, this.grid);
        determineCellViewability(this.grid);
        this.levelType = levelType;
        this.levelEntities = [];
        this.levelStructures = [];
        console.log("new world level", this);
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
        this.addEntity(entity);
      }
    }

    addEntity(ent) {
        this.levelEntities.push(ent);
        console.log("adding entity to level", this);
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
    }

    addStairsDown() {
        const stairsDownCell = getRandomEmptyCellOfTerrainInGrid("FLOOR",this.grid);
        const stairsDown = new Structure(stairsDownCell.x,stairsDownCell.y,this.levelNumber,'STAIRS_DOWN','>');
        stairsDownCell.structure = stairsDown;
        this.levelStructures.push(stairsDown);
    }

    addStairsUpTo(stairsDown) {
        const stairsUpCell = getRandomEmptyCellOfTerrainInGrid("FLOOR",this.grid);
        const stairsUp = new Structure(stairsUpCell.x,stairsUpCell.y,this.levelNumber,'STAIRS_UP','<');
        stairsUpCell.structure = stairsUp;
        stairsDown.connectsTo = stairsUp;
        stairsUp.connectsTo = stairsDown;
        this.levelStructures.push(stairsUp);
    }
}

export { WorldLevel };
