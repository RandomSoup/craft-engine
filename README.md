# craft-engine
Fork of the original [craft](https://github.com/code-dot-org/craft) by [Code.org](https://code.org).

## Building
### Profiles
`craft-engine` uses a custom build system, with two "profiles": `prod` and `dev`. The `prod` profile builds, minifies and stores the generated files under the `build` directory. On the other hand, `dev` works directly in memory, does not minify the files, and starts a server at `localhost:8000`.

### Dev dependencies
The build system requires `node >= 10`, `npm`, and some additional packages. To install them, do:
```sh
npm install
```

### Commands
Finally, to build `craft-engine` itself, do:
```sh
# For the dev profile
npm run build-dev
# For the prod profile
npm run build-prod
```

## Licensing
This project is licensed under an Apache 2.0 license. See the [LICENSE](https://github.com/craft-devs/craft-engine/blob/master/LICENSE) and [NOTICE](https://github.com/craft-devs/craft-engine/blob/master/NOTICE) files for more information.

### Third-party licenses
Both Phaser.js and CodeMirror are licensed under a MIT license. See the [Phaser.LICENSE](https://github.com/craft-devs/craft-engine/blob/master/Phaser.LICENSE) and [CodeMirror.LICENSE](https://github.com/craft-devs/craft-engine/blob/master/CodeMirror.LICENSE) files.
