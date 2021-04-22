levels = Object.assign({
	default: {
		instructions: "Nighttime is boring with no zombies (sheep at this time). Get the Zombies spawning at night, and get them to chase you.",
		useAgent: true,
    
		playerStartPosition: [3, 4],
		agentStartPosition: [3, 6],

		// up: 0, right: 1, down: 2, left: 3
		playerStartDirection: 1,
		agentStartDirection: 1,

		playerName: "SteveEvents",
		isAgentLevel: true,
		earlyLoadAssetPacks: ["heroAllAssetsMinusPlayer"],
		earlyLoadNiceToHaveAssetPacks: ["playerSteveEvents", "playerAgent"],

		assetPacks: {
			beforeLoad: ["heroAllAssetsMinusPlayer", "playerSteveEvents", "playerAgent"],
			afterLoad: [],
		},

		levelVerificationTimeout : -1,
		timeoutResult : function(verificationAPI) {
			return false;
		},

		groundPlane: [
			"grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
			"grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
			"grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
			"grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
			"grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
			"grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
			"grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
			"grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
			"grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
			"grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass", "grass",
		],

		groundDecorationPlane: [
			"", "", "", "", "", "", "", "", "", "",
			"", "reeds", "tallGrass", "", "", "", "", "", "", "",
			"", "", "", "", "", "", "", "", "", "",
			"", "", "", "", "", "", "", "", "", "",
			"", "", "", "", "", "", "", "", "", "",
			"", "", "", "", "", "", "", "", "", "",
			"", "", "", "", "", "", "", "", "", "",
			"", "", "", "", "", "", "", "", "", "",
			"", "", "", "", "", "", "", "", "", "",
			"", "", "", "", "", "", "", "", "", "",
		],

		actionPlane: new Array(100).fill(""),

		fluffPlane: new Array(100).fill(""),

		failureCheckFunction: function (verificationAPI) {
			return false;
		},

		verificationFunction: function (verificationAPI) {
			return false;
		}
	},
	test01: {
		isAgentLevel: false,
		useAgent: false,
		groundPlane: new Array(100).fill("grass"),
		groundDecorationPlane: new Array(100).fill(""),
		actionPlane: new Array(100).fill(""),
		playerStartPosition: [0, 0],
		playerStartDirection: 2,
		verificationFunction: function (verificationAPI) {
			return verificationAPI.isPlayerAt([0, 1]);
		}
	},
}, AdventurerLevels, AgentLevels, AquaticLevels, DesignerLevels, FunctionalityLevel);
