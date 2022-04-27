/**
 * Handling non-player entities inside of the level
 */
class LevelEntity {
	constructor(controller) {
		this.controller = controller;
		this.game = controller.game;
		this.entityMap = new Map();
		this.entityDeathCount = new Map();
		this.sprite = null;
		this.id = 0;
	}

	loadData(levelData) {
		if (levelData.entities !== undefined) {
			for (let i = 0; i < levelData.entities.length; i++) {
				let data = levelData.entities[i];
				let entity = this.createEntity(data[0], this.id++, data[1], data[2], data[3], data[4]);
				entity.updateHidingTree();
				entity.updateHidingBlock();
			}
		}
	}

	tick() {
		let updateEntity = function (value) {
			value.tick();
		};
		this.entityMap.forEach(updateEntity);
	}

	pushEntity(entity) {
		if (!this.entityMap.has(entity.identifier)) {
			this.entityMap.set(entity.identifier, entity);
		} else if (this.controller.DEBUG) {
			this.game.debug.text("Duplicate entity name : " + entity.identifier + "\n");
		}
	}

	isFriendlyEntity(type) {
		const friendlyEntityList = ["sheep", "ironGolem", "cow", "chicken","cod",
			"dolphin","salmon","seaTurtle","seaTurtle",
			"squid","tropicalFish"];
		for (let i = 0; i < friendlyEntityList.length; i++) {
			if (type === friendlyEntityList[i]) {
				return true;
			}
		}
		return false;
	}

	createEntity(type, identifier, x, y, facing, pattern) {
		var entity = null;
		if (!this.entityMap.has(identifier)) {
			switch (type) {
			case "sheep":
				entity = new Sheep(this.controller, type, identifier, x, y, facing);
				break;
			case "zombie":
				entity = new Zombie(this.controller, type, identifier, x, y, facing);
				break;
			case "ironGolem":
				entity = new IronGolem(this.controller, type, identifier, x, y, facing);
				break;
			case "creeper":
				entity = new Creeper(this.controller, type, identifier, x, y, facing);
				break;
			case "cow":
				entity = new Cow(this.controller, type, identifier, x, y, facing);
				break;
			case "chicken":
				entity = new Chicken(this.controller, type, identifier, x, y, facing);
				break;
			case "cod":
				entity = new Cod(this.controller, type, identifier, x, y, facing);
				break;
			case "dolphin":
				entity = new Dolphin(this.controller, type, identifier, x, y, facing);
				break;
			case "ghast":
				entity = new Ghast(this.controller, type, identifier, x, y, facing, pattern);
				break;
			case "boat":
				entity = new Boat(this.controller, type, identifier, x, y, facing);
				break;
			case "salmon":
				entity = new Salmon(this.controller, type, identifier, x, y, facing);
				break;
			case "seaTurtle":
				entity = new SeaTurtle(this.controller, type, identifier, x, y, facing);
				break;
			case "squid":
				entity = new Squid(this.controller, type, identifier, x, y, facing);
				break;
			case "tropicalFish":
				entity = new TropicalFish(this.controller, type, identifier, x, y, facing);
				break;
			default:
				entity = new BaseEntity(this.controller, type, identifier, x, y, facing);

			}
			if (this.controller.DEBUG) {
				api.log("Create Entity type : " + type + " " + x + "," + y);
			}
			this.entityMap.set(identifier, entity);
		} else if (this.controller.DEBUG) {
			this.game.debug.text("Duplicate entity name : " + identifier + "\n");
		}
		return entity;
	}

	isSpawnableInBetween(minX, minY, maxX, maxY) {
		for (let i = minX; i <= maxX; i++) {
			for (let j = minY; j <= maxY; j++) {
				if (this.controller.levelModel.isPositionEmpty(new Position(i, j))[0]) {
					return true;
				}
			}
		}
		return false;
	}

	spawnEntity(type, spawnPos) {
		let levelModel = this.controller.levelModel;
		let width = levelModel.planeWidth;
		let height = levelModel.planeHeight;
		let maxWidth = Math.floor(width  * 0.85);
		let maxHeight = Math.floor(height * 0.85);
		let minWidth = Math.floor(width  * 0.15);
		let minHeight = Math.floor(height * 0.15);
		let position = null;
		let isEmpty = [false];
		if (spawnPos === "random" || !(isBaseObject(spawnPos) && !isNaN(spawnPos.x) && !isNaN(spawnPos.y))) {
			if (this.isSpawnableInBetween(minWidth, minHeight, maxWidth, maxHeight)) {
				position = new Position(
					getRandomInt(minWidth, maxWidth),
					getRandomInt(minHeight, maxHeight)
				);
				while (!levelModel.isPositionEmpty(position)[0]) {
					position = new Position(
						getRandomInt(minWidth, maxWidth),
						getRandomInt(minHeight, maxHeight)
					);
				}
				return this.createEntity(type, this.id++, position.x, position.y, getRandomInt(0, 3));
			} else {
				if (!this.isSpawnableInBetween(1, 1, width - 2, height - 2)) {
					return null;
				}
				let position = new Position(
					getRandomInt(1, width - 2),
					getRandomInt(1, height - 2)
				);
				while (!levelModel.isPositionEmpty(position)[0]) {
					position = new Position(
						getRandomInt(1, width - 2),
						getRandomInt(1, height - 2)
					);
				}
				return this.createEntity(type, this.id++, position.x, position.y, getRandomInt(0, 3));
			}
		} else if (isBaseObject(spawnPos)) {
			/*
			 * Notes:
			 *  + Here we use the "obsolete" isNaN instead of Number.isNaN on purpose because
			 *    Number.isNaN only returns true for the Number(NaN)
			 *  + We don't freeze spawnPos since we use it as an output value too.
			 * 
			 */
			if (isNaN(spawnPos.rot)) {
				spawnPos.rot = getRandomInt(0, 3);
			}
			position = new Position(spawnPos.x, spawnPos.y);
			isEmpty = levelModel.isPositionEmpty(position);
			if (isEmpty[0]) {
				return this.createEntity(type, this.id++, position.x, position.y, spawnPos.rot);
			}
		}
		return null;
	}

	spawnEntityAt(type, spawnPos) {
		return this.createEntity(type, this.id++, spawnPos.x, spawnPos.y, spawnPos.rot);
	}

	destroyEntity(identifier) {
		if (this.entityMap.has(identifier)) {
			var entity = this.entityMap.get(identifier);
			if (this.entityDeathCount.has(entity.type)) {
				this.entityDeathCount.set(entity.type, this.entityDeathCount.get(entity.type) + 1);
			} else {
				this.entityDeathCount.set(entity.type, 1);
			}
			entity.reset();
			entity.getAnimationManager().stop(null, true);
			entity.sprite.destroy();
			this.entityMap.delete(identifier);
		} else if (this.controller.DEBUG) {
			this.game.debug.text("It's impossible to delete since entity name : " + identifier + " is not existing\n");
		}
	}

	getEntityAt(position) {
		for (let value of this.entityMap) {
			let entity = value[1];
			if (Position.equals(position, entity.position)) {
				return entity;
			}
		}
		return null;
	}

	getEntitiesOfType(type) {
		if (type === "all") {
			let entities = [];
			for (let value of this.entityMap) {
				let entity = value[1];
				if (entity.type !== "Player") {
					entities.push(entity);
				}
			}
			return entities;
		} else {
			let entities = [];
			for (let value of this.entityMap) {
				let entity = value[1];
				if (entity.type === type) {
					entities.push(entity);
				}
			}
			return entities;
		}
	}

	reset() {
		this.entityMap.clear();
		this.entityDeathCount = new Map();
	}
}
