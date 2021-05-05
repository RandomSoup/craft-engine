var previous = false;

var levelSelect;
var speedSlider;
var speedDisplay;
var phaserGame;
var codeMirrorEditor;
var game;
var playButton;
var consolePre;
var consoleErrors;
var blockType;
var codeMirror;
var api;
var gameController;

var defaultScript = `/*
 * Welcome to the craft-engine editor!
 * 
 * Some tips to get started:
 *  + All the methods you need to solve the puzzles are in the ${"`api`"} object.
 *  + You can use ${"`api.log`"}, ${"`api.error`"} and ${"`api.warning`"} to log info, errors, and warnings
 *    in the console below.
 *  + More tips coming soon with proper documentation :)
 * 
 */

api.log("Hi!");
api.spawnEntity(null, "cow", "middle"); // Spawns a Cow in the "middle" region

`;

const defaults = {
	assetPacks: {
		beforeLoad: ["allAssetsMinusPlayer", "playerAlex", "playerAgent"],
		afterLoad: [],
	},
	gridDimensions: [10, 10],
	fluffPlane: new Array(100).fill(""),
	playerName: "Alex",
	playerStartPosition: [],
	script: defaultScript
};

var levelParam = getParameterByName("level");
var testLevelToLoad = Object.assign({}, defaults, levels[levelParam] || levels["default"]);

function getParameterByName(name) {
	var tmp = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp(`[\\?&]${tmp}=([^&#]*)`);
	var results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function errCallback(err) {
	consoleErrors.innerText += `[ERR] ${err}` + "\n";
	consolePre.scrollTop = consolePre.scrollHeight - consolePre.clientHeight;
	return;
}

function initGame() {
	// Initialize test instance of game, exposed to window for debugging.
	gameController = new GameController({
		Phaser: window.Phaser,
		containerId: "phaser-game",
		assetRoot: "assets/",
		audioPlayer: new Sounds(),
		debug: true,
		earlyLoadAssetPacks: testLevelToLoad.earlyLoadAssetPacks,
		earlyLoadNiceToHaveAssetPacks: testLevelToLoad.earlyLoadNiceToHaveAssetPacks,
		afterAssetsLoaded: function () {},
	});

	api = Object.assign(gameController.codeOrgAPI, {
		log: function (msg) {
			consoleErrors.innerText += "[LOG] " + msg + "\n";
		},
		error: function (msg) {
			consoleErrors.innerText += "[ERR] " + msg + "\n";
		},
		warning: function (msg) {
			consoleErrors.innerText += "[WARN] " + msg + "\n";
		}
	});

	gameController.loadLevel(testLevelToLoad);

	Object.keys(levels).forEach(key => {
		var option = document.createElement("option");
		option.text = key;
		option.selected = key === levelParam;
		levelSelect.appendChild(option);
	});
	return;
}

function setCallbacks() {
	playButton.addEventListener("click", function () {
		if (previous) {
			api.resetAttempt();
		}
		previous = true;
		consoleErrors.innerText = "";
		playButton.blur();
		phaserGame.focus();
		gameController.levelData.script = codeMirror.getValue();
		gameController.game.canvas.id = "game-canvas";
		gameController.player.selectedItem = blockType.options[blockType.selectedIndex].text;
		api.startAttempt(null, errCallback, api);
	});

	blockType.addEventListener("change", function () {
		gameController.player.selectedItem = blockType.options[blockType.selectedIndex].text;
	});

	document.getElementById("stop-button").addEventListener("click", function () {
		api.resetAttempt();
		previous = false;
	});
	return;
}

document.addEventListener("DOMContentLoaded", function () {
	var codeMirrorWidth;

	levelSelect = document.getElementById("level-load");
	speedSlider = document.getElementById("speed-slider");
	speedDisplay = document.getElementById("speed-display");
	phaserGame = document.getElementById("phaser-game");
	codeMirrorEditor = document.getElementById("codemirror-editor");
	game = document.getElementById("game");
	playButton = document.getElementById("play-button");
	consolePre = document.getElementById("console-pre");
	consoleErrors = document.getElementById("console-errors");
	blockType = document.getElementById("block-type");

	codeMirror = CodeMirror.fromTextArea(codeMirrorEditor, {
		lineNumbers: true,
		mode: "javascript"
	});
	codeMirrorWidth = document.body.clientWidth - Number.parseInt(getComputedStyle(document.body).fontSize) * 2 - game.offsetWidth;
	codeMirror.setSize(codeMirrorWidth, game.offsetHeight + 200);
	consoleErrors.style.width = codeMirrorWidth;
	consolePre.style.width = codeMirrorWidth;
	consoleErrors.style.height = 200;
	consolePre.style.height = 200;

	codeMirror.getDoc().setValue(testLevelToLoad.script);

	setCallbacks();
	initGame();
});

document.addEventListener("input", function (event) {
	if (event.target.id == "level-load") {
		location.search = `level=${levelSelect.options[levelSelect.selectedIndex].value}`;
	} else if (event.target.id == "speed-slider") {
		speedDisplay.innerHTML = `Speed: ${speedSlider.value}x`;
		gameController.game.time.slowMotion = 1.5 / Number.parseFloat(speedSlider.value, 10);
	}
}, false);
