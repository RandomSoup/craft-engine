#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const http = require("http");
const fse = require("fs-extra");
const uglifyjs = require("uglify-js");
const express = require("express");

var profile = process.argv[2];
var prefix = "./src/js/game";
var port = 8000;

var stages = [
	["../utils.js", "../soundEffects.js", "API/*.js", "Event/EventType.js"],
	["LevelMVC/FacingDirection.js", "LevelMVC/Position.js", "LevelMVC/Utils.js"],
	["LevelMVC/AssetLoader.js", "LevelMVC/AdjacencySet.js"], //"LevelMVC/AStarPathFinding.js", 
	["Entities/BaseEntity.js", "Entities/*.js"],
	["CommandQueue/*.js", "LevelMVC/*.js", "GameController.js"]
];

/* Polyfill from MDN */
if (!Array.prototype.flat)
{
	Array.prototype.flat = function (depth) {
		var flattend = [];
		(function flat(array, depth) {
			for (let el of array) {
				if (Array.isArray(el) && depth > 0) {
					flat(el, depth - 1);
				} else {
					flattend.push(el);
				}
			}
		})(this, Math.floor(depth) || 1);
		return flattend;
	};
}

function regex_ls(dir, regex)
{
	var i = 0;
	var arr = new Array();
	var files = fs.readdirSync(dir);
	while (i < files.length)
	{
		var filename = path.join(dir, files[i]);
		var stat = fs.lstatSync(filename);
		if (!stat.isDirectory() && regex.test(files[i]))
		{
			arr.push(filename);
		}
		i++;
	}
	return arr;
}

function do_prod(src, levels)
{
	var minified_src;
	var minified_levels;

	console.log("Minifying...");
	minified_src = uglifyjs.minify(src);
	minified_levels = uglifyjs.minify(levels);

	if (minified_src.error)
	{
		console.error(`Error minifying: ${minified_src.error}`);
		return -1;
	}
	fs.mkdirSync("./build/js/", {
		"recursive": true
	});
	fse.copySync("./demo/", "./build/", {
		"overwrite": true
	});
	fse.copySync("./src/assets/", "./build/assets/");
	fse.copySync("./src/vendor/", "./build/vendor/");

	if (minified_levels.error)
	{
		console.error(`Error minifying levels: ${minified_levels.error}`);
		return -2;
	}

	fs.writeFile("./build/js/main.js", minified_src.code, function (err) {
		if (err)
		{
			console.error(err);
		} else
		{
			fs.writeFile("./build/js/levels.js", minified_levels.code, function (err) {
				if (err)
				{
					console.error(err);
				} else
				{
					console.log("Done.");
				}
			});
		}
	});
	return 0;
}

function do_dev(src, levels)
{
	const app = express();

	app.get("/js/main.js", function (req, res) {
		res.send(src);
	});
	app.get("/js/levels.js", function (req, res) {
		res.send(levels);
	});
	app.use("/", express.static(`${__dirname}/demo/`));
	app.use("/js/", express.static(`${__dirname}/src/js/`));
	app.use("/vendor/", express.static(`${__dirname}/src/vendor/`));
	app.use("/assets/", express.static(`${__dirname}/src/assets/`));
	app.listen(port, function () {
		console.log(`Server started on port ${port}`);
	});
}

function main()
{
	var src;
	var files;
	var levels;

	console.log(`Building ${profile}...`);

	files = stages.flat().map(function (ps_regex) {
		var ps_path = path.resolve(`${prefix}/${ps_regex}`);
		var regex = new RegExp(path.basename(ps_path).replace("*.", ".*\\."));
		return regex_ls(path.dirname(ps_path), regex);
	});

	files = Array.from(new Set(files.flat()));

	src = files.map(function (file) {
		console.log(`Adding file ${file}...`);
		return fs.readFileSync(file, "utf-8");
	}).join("");

	levels = regex_ls(`${prefix}/Levels/`, /.*\.js/).map(function (file) {
		console.log(`Adding level ${file}...`);
		return fs.readFileSync(file, "utf-8");
	}).join("");
	levels += fs.readFileSync("./src/js/levels.js", "utf-8");

	if (profile == "prod")
	{
		stages = null;
		do_prod(src, levels);
	} else
	{
		/* GC a bit before sarting the server */
		stages = null;
		do_dev(src, levels);
	}
}

main();
