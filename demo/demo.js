var previous = false;

var levelselect = document.getElementById('level-load');
var speedslider = document.getElementById('speed-slider');
var speeddisplay = document.getElementById('speed-display');
var phasergame = document.getElementById('phaser-game');
var codemirroreditor = document.getElementById('codemirror-editor');
var game = document.getElementById('game');
var body = document.body;
var playbutton = document.getElementById('play-button');
var consolepre = document.getElementById('console-pre');
var consoleerrors = document.getElementById('console-errors');
var blocktype = document.getElementById('block-type');

var defaults = {
  assetPacks: {
    beforeLoad: ['allAssetsMinusPlayer', 'playerAlex', 'playerAgent'],
    afterLoad: [],
  },
  gridDimensions: [10, 10],
  fluffPlane: new Array(100).fill(''),
  playerName: 'Alex',
  playerStartPosition: [],
};

var codemirror = CodeMirror.fromTextArea(codemirroreditor, {
  lineNumbers: true,
  mode: 'javascript'
});

var rightwidth = body.clientWidth - Number.parseInt(getComputedStyle(body).fontSize) * 2 - game.offsetWidth;

codemirror.setSize(rightwidth, game.offsetHeight + 200);
consoleerrors.style.width = rightwidth;
consolepre.style.width = rightwidth;
consoleerrors.style.height = 200;
consolepre.style.height = 200;

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

var levelParam = getParameterByName('level');
var testLevelToLoad = levels[levelParam] || levels['default'];
testLevelToLoad = Object.assign({}, defaults, testLevelToLoad);

// Initialize test instance of game, exposed to window for debugging.
var gameController = new GameController({
  Phaser: window.Phaser,
  containerId: 'phaser-game',
  assetRoot: 'assets/',
  audioPlayer: new Sounds(),
  debug: true,
  earlyLoadAssetPacks: testLevelToLoad.earlyLoadAssetPacks,
  earlyLoadNiceToHaveAssetPacks: testLevelToLoad.earlyLoadNiceToHaveAssetPacks,
  afterAssetsLoaded: function () {},
});

var api = Object.assign(gameController.codeOrgAPI, {
  log: function (msg) {
    consoleerrors.innerText += '[LOG] ' + msg + '\n';
  },
  error: function (msg) {
    consoleerrors.innerText += '[ERR] ' + msg + '\n';
  },
  warning: function (msg) {
    consoleerrors.innerText += '[WARN] ' + msg + '\n';
  }
});

gameController.loadLevel(testLevelToLoad);

Object.keys(levels).forEach(key => {
  var option = document.createElement('option');
  option.text = key;
  option.selected = key === levelParam;
  levelselect.appendChild(option);
});

document.addEventListener('input', function (event) {
  if (event.target.id == 'level-load') {
    location.search = `level=${levelselect.options[levelselect.selectedIndex].value}`;
  } else if (event.target.id == 'speed-slider') {
    speeddisplay.innerHTML = `Speed: ${speedslider.value}x`;
    gameController.game.time.slowMotion = 1.5 / Number.parseFloat(speedslider.value, 10);
  }
}, false);

document.getElementById('stop-button').addEventListener('click', function () {
  api.resetAttempt();
  previous = false;
});

playbutton.addEventListener('click', function () {
  if (previous) {
    api.resetAttempt();
  }
  previous = true;
  playbutton.blur();
  phasergame.focus();
  gameController.game.canvas.id = 'game-canvas';
  gameController.player.selectedItem = blocktype.options[blocktype.selectedIndex].text;
  try {this.selectedItem
    new Function('api', `'use strict'; ${codemirror.getValue()}`)(api);
  } catch (err) {
    consoleerrors.innerText += '[ERR] ' + err + '\n';
    consolepre.scrollTop = consolepre.scrollHeight - consolepre.clientHeight;
  }
  api.startAttempt();
});

blocktype.addEventListener('change', function () {
  gameController.player.selectedItem = blocktype.options[blocktype.selectedIndex].text;
});
