# Markus

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/7cae33f07ea84076b6b3240228fbe2f1)](https://www.codacy.com/app/ayltai/Markus?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ayltai/Markus&amp;utm_campaign=Badge_Grade)

Apps should be *beautiful*, *clean* and *intuitive*. Writing should be *efficient* and *effective*. Stay *organized*, use **Markus**, a note-taking app, hand crafted with ❤

<img src="https://raw.githubusercontent.com/ayltai/Markus/master/screenshots/screenshot_light.png" width="882" height="574" />
<img src="https://raw.githubusercontent.com/ayltai/Markus/master/screenshots/screenshot_dark.png" width="882" height="574" />

## Features
* Markdown
* Live preview
* Syntax highlighting
* Over 20 themes
* Auto save in real time
* Hashtags

## Installation
To install from source, you will need [`npm`](https://www.npmjs.com/) or [`yarn`](https://yarnpkg.com/).

### Install with `npm`
Run this command from the app project directory:
```
npm i
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
npm i -g electron-packager
electron-packager . Markus --platform=darwin --arch=x64 --icon=./app/images/logo.icns --ignore=__tests__ --ignore=__mocks__ --ignore=screenshots --ignore=.idea --ignore=.gitignore --ignore=yarn.lock --ignore=.DS_Store
```
`Markus-darwin-x64/Markus.app` will be generated. Double-click to run it.

#### Windows
Run this command from the app project directory:

```
npm i -g electron-packager
electron-packager . Markus --platform=win32 --arch=x64 --icon=./app/images/logo.ico --ignore=__tests__ --ignore=__mocks__ --ignore=screenshots --ignore=.idea --ignore=.gitignore --ignore=yarn.lock --ignore=.DS_Store
```
`Markus-win32-x64` folder will be generated. Double-click `Markus-win32-x64\Markus.exe` to start the app.
