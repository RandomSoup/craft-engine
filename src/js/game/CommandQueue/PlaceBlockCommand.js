class PlaceBlockCommand extends BaseCommand {
	constructor(gameController, highlightCallback, blockType, targetEntity) {
		super(gameController, highlightCallback, targetEntity);

		this.BlockType = blockType;
	}

	tick() {
		// do stuff??
	}

	begin() {
		super.begin();
		this.GameController.placeBlock(this, this.BlockType);
	}
}
