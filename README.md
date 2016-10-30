# Artisan
A note-taking app for programmers, hand crafted with ♥

## Features

### ♥ Code Editing
Artisan is powered by the [Ace](https://ace.c9.io) code editor, support syntax highlighting for more than 120 languages, with over 20 themes, code folding, automatic indent, highlight matching parentheses, and many more!

### ♥ Themes
Artisan comes with over 20 themes for its code editor.

### ♥ Auto-Save
Artisan automatically and instantly saves your notes when they are modified. There is no "save" button in the app. Never worried about losing any changes.

### ♥ Categories
You can assign categories to your notes to better manage them.

### ♥ Cloud Support
Coming soon

## Installation
To install from source, you will need [`npm`](https://www.npmjs.com/) or [`yarn`](https://yarnpkg.com/).

### Install with `npm`
Run this command from the app project directory:
```
npm install
```

### Install with `yarn`
Run this command from the app project directory:
```
yarn
```

## Usage
This app requires [`npm`](https://www.npmjs.com/) to run.

### Run from command line
Run this command from the app project directory:
```
npm start
```

### Run from platform-specific binary

#### macOS
Run this command from the app project directory:
```
npm install -g electron-packager
electron-packager . Artisan --platform=darwin --arch=x64 --icon=./app/images/artisan.icns --ignore=.idea --ignore=.gitignore --ignore=yarn.lock --ignore=.DS_Store
```
`Artisan-darwin-x64/Artisan.app` will be generated. Double-click to run it.

#### Windows
Run this command from the app project directory:

```
npm install -g electron-packager
electron-packager . Artisan --platform=win32 --arch=x64 --icon=./app/images/artisan.ico --ignore=.idea --ignore=.gitignore --ignore=yarn.lock --ignore=.DS_Store
```
`Artisan-win32-x64` folder will be generated. Double-click `Artisan-win32-x64\Artisan.exe` to start the app.
