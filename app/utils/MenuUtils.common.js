'use strict';

import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

const setMenuItemEnabled = (items, enabled) => {
    items.forEach(item => {
        if (item.submenu) {
            setMenuItemEnabled(item.submenu.items, enabled);
        } else {
            item.enabled = enabled;
        }
    });
};

const createPreferencesMenu = () => {
    return {
        label   : 'Preferences',
        submenu : [
            {
                label : 'Font',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.showFontDialog');
                }
            },
            {
                label : 'Highlight current line',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.settings', { name : 'highlightActiveLine', value : item.checked });
                }
            },
            {
                label   : 'Tab size',
                submenu : [
                    {
                        label : '2 spaces',
                        type  : 'radio',
                        click(item, win) {
                            if (win) PubSub.publish('TextEditor.settings', { name : 'tabSize', value : 2 });
                        }
                    },
                    {
                        label : '4 spaces',
                        type  : 'radio',
                        click(item, win) {
                            if (win) PubSub.publish('TextEditor.settings', { name : 'tabSize', value : 4 });
                        }
                    },
                    {
                        label : '8 spaces',
                        type  : 'radio',
                        click(item, win) {
                            if (win) PubSub.publish('TextEditor.settings', { name : 'tabSize', value : 8 });
                        }
                    }
                ]
            },
            {
                label : 'Use soft tabs',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.settings', { name : 'useSoftTabs', value : item.checked });
                }
            },
            {
                label : 'Word wrap',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.settings', { name : 'wordWrap', value : item.checked });
                }
            },
            {
                label : 'Show line numbers',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.settings', { name : 'showLineNumbers', value : item.checked });
                }
            },
            {
                label : 'Show print margin',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.settings', { name : 'showPrintMargin', value : item.checked });
                }
            },
            {
                label   : 'Print margin column',
                submenu : [
                    {
                        label : '76',
                        type  : 'radio',
                        click(item, win) {
                            if (win) PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 76 });
                        }
                    },
                    {
                        label : '80',
                        type  : 'radio',
                        click(item, win) {
                            if (win) PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 80 });
                        }
                    },
                    {
                        label : '100',
                        type  : 'radio',
                        click(item, win) {
                            if (win) PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 100 });
                        }
                    },
                    {
                        label : '120',
                        type  : 'radio',
                        click(item, win) {
                            if (win) PubSub.publish('TextEditor.settings', { name : 'printMarginColumn', value : 120 });
                        }
                    }
                ]
            },
            {
                label : 'Show invisibles',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.settings', { name : 'showInvisibles', value : item.checked });
                }
            },
            {
                label : 'Show fold widgets',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.settings', { name : 'showFoldWidgets', value : item.checked });
                }
            },
            {
                label : 'Show gutter',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.settings', { name : 'showGutter', value : item.checked });
                }
            },
            {
                label : 'Show indent guides',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.settings', { name : 'displayIndentGuides', value : item.checked });
                }
            },
            {
                label : 'Scroll past last line',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('TextEditor.settings', { name : 'scrollPastEnd', value : item.checked });
                }
            }
        ]
    };
};

const createEditMenu = () => {
    return [
        {
            role        : 'undo',
            accelerator : 'CmdOrCtrl+Z'
        },
        {
            role        : 'redo',
            accelerator : 'Shift+CmdOrCtrl+Z'
        },
        {
            type : 'separator'
        },
        {
            role        : 'cut',
            accelerator : 'CmdOrCtrl+X'
        },
        {
            role        : 'copy',
            accelerator : 'CmdOrCtrl+C'
        },
        {
            role        : 'paste',
            accelerator : 'CmdOrCtrl+V'
        },
        {
            type : 'separator'
        },
        {
            role        : 'selectall',
            accelerator : 'CmdOrCtrl+A'
        }
    ];
};

const createSyntaxMenu = () => {
    const createSyntax = (name, code) => {
        return {
            label : name,
            type  : 'radio',
            click(item, win) {
                if (win) PubSub.publish('Syntax.change', code);
            }
        };
    };

    return {
        label   : 'Syntax',
        submenu : [
            //createSyntax('ABAP', 'abap'),
            //createSyntax('ABC', 'abc'),
            createSyntax('ActionScript', 'actionscript'),
            createSyntax('Ada', 'ada'),
            createSyntax('apache.conf', 'apache_conf'),
            createSyntax('Apple Script', 'applescript'),
            //createSyntax('AsciiDoc', 'asciidoc'),
            //createSyntax('Assemble x86', 'assemble_x86'),
            //createSyntax('AutoHotKey', 'autohotkey'),
            createSyntax('Batch File', 'batchfile'),
            createSyntax('C++', 'cpp'),
            //createSyntax('Cirru', 'cirru'),
            createSyntax('Clojure', 'clojure'),
            //createSyntax('Cobol', 'cobol'),
            createSyntax('Coffee', 'coffee'),
            createSyntax('ColdFusion', 'coldfusion'),
            createSyntax('C#', 'csharp'),
            createSyntax('CSS', 'css'),
            //createSyntax('Curly', 'curly'),
            createSyntax('D', 'd'),
            //createSyntax('Dart', 'dart'),
            //createSyntax('Diff', 'diff'),
            createSyntax('Django', 'django'),
            createSyntax('Docker File', 'dockerfile'),
            //createSyntax('Dot', 'dot'),
            //createSyntax('Drools', 'drools'),
            //createSyntax('Eiffel', 'eiffel'),
            createSyntax('EJS', 'ejs'),
            createSyntax('Elixir', 'elixir'),
            createSyntax('Elm', 'elm'),
            createSyntax('Erlang', 'erlang'),
            //createSyntax('Forth', 'forth'),
            //createSyntax('Fortran', 'fortran'),
            //createSyntax('FTL', 'ftl'),
            //createSyntax('G-code', 'gcode'),
            createSyntax('Gherkin', 'gherkin'),
            createSyntax('.gitignore', 'gitignore'),
            //createSyntax('GLSL', 'glsl'),
            //createSyntax('Gobstones', 'gobstones'),
            createSyntax('Golang', 'golang'),
            createSyntax('Groovy', 'groovy'),
            createSyntax('Haml', 'haml'),
            createSyntax('Handlebars', 'handlebars'),
            createSyntax('Haskell', 'haskell'),
            //createSyntax('Haxe', 'haxe'),
            createSyntax('HTML', 'html'),
            createSyntax('HTML (Elixir)', 'html_elixir'),
            createSyntax('HTML (Ruby)', 'html_ruby'),
            createSyntax('ini', 'ini'),
            //createSyntax('IO', 'io'),
            //createSyntax('Jack', 'jack'),
            createSyntax('Jade', 'jade'),
            createSyntax('Java', 'java'),
            createSyntax('JavaScript', 'javascript'),
            createSyntax('JSON', 'json'),
            createSyntax('JSP', 'jsp'),
            createSyntax('JSX', 'jsx'),
            //createSyntax('Julia', 'julia'),
            createSyntax('Kotlin', 'kotlin'),
            createSyntax('LaTex', 'latex'),
            createSyntax('LESS', 'less'),
            //createSyntax('Liquid', 'liquid'),
            createSyntax('LISP', 'lisp'),
            //createSyntax('LiveScript', 'livescript'),
            //createSyntax('LogiQL', 'logiql'),
            //createSyntax('LSL', 'lsl'),
            createSyntax('Lua', 'lua'),
            //createSyntax('LuaPage', 'luapage'),
            //createSyntax('Lucene', 'lucene'),
            createSyntax('Makefile', 'makefile'),
            createSyntax('Markdown', 'markdown'),
            //createSyntax('Mask', 'mask'),
            createSyntax('Matlab', 'matlab'),
            //createSyntax('Maze', 'maze'),
            //createSyntax('Mel', 'mel'),
            //createSyntax('MUSHCode', 'mushcode'),
            createSyntax('MySQL', 'mysql'),
            //createSyntax('Nix', 'nix'),
            createSyntax('NSIS', 'nsis'),
            createSyntax('Objective-C', 'objectivec'),
            createSyntax('OCaml', 'ocaml'),
            //createSyntax('Pascal', 'pascal'),
            createSyntax('Perl', 'perl'),
            createSyntax('pgSQL', 'pgsql'),
            createSyntax('PHP', 'php'),
            createSyntax('Plain Text', 'plain_text'),
            createSyntax('PowerShell', 'powershell'),
            //createSyntax('Praat', 'praat'),
            createSyntax('Prolog', 'prolog'),
            createSyntax('Properties', 'properties'),
            //createSyntax('Protobuf', 'protobuf'),
            createSyntax('Python', 'python'),
            createSyntax('R', 'r'),
            //createSyntax('Razor', 'razor'),
            //createSyntax('RDoc', 'rdoc'),
            //createSyntax('RHTML', 'rhtml'),
            createSyntax('Ruby', 'ruby'),
            //createSyntax('Rust', 'rust'),
            createSyntax('SASS', 'sass'),
            //createSyntax('SCAD', 'scad'),
            createSyntax('Scala', 'scala'),
            //createSyntax('Scheme', 'scheme'),
            createSyntax('SCSS', 'scss'),
            createSyntax('sh', 'sh'),
            //createSyntax('SJS', 'sjs'),
            //createSyntax('Smarty', 'smarty'),
            //createSyntax('Soy', 'soy'),
            //createSyntax('Space', 'space'),
            createSyntax('SQL', 'sql'),
            createSyntax('SQL Server', 'sqlserver'),
            //createSyntax('Stylus', 'stylus'),
            //createSyntax('SVG', 'svg'),
            createSyntax('Swift', 'swift'),
            createSyntax('Tcl', 'tcl'),
            //createSyntax('Tex', 'tex'),
            //createSyntax('Textile', 'textile'),
            //createSyntax('Toml', 'toml'),
            //createSyntax('TSX', 'tsx'),
            //createSyntax('Twig', 'twig'),
            createSyntax('TypeScript', 'typescript'),
            //createSyntax('Vala', 'vala'),
            createSyntax('VBScript', 'vbscript'),
            //createSyntax('Velocity', 'velocity'),
            //createSyntax('Verilog', 'verilog'),
            createSyntax('VHDL', 'vhdl'),
            //createSyntax('Wollok', 'wollok'),
            createSyntax('XML', 'xml'),
            createSyntax('XQuery', 'xquery'),
            createSyntax('Yaml', 'yaml')
        ]
    };
};

const createThemeMenu = () => {
    const createTheme = (name, code) => {
        return {
            label : name,
            type  : 'radio',
            click(item, win) {
                if (win) PubSub.publish('Theme.change', code);
            }
        };
    };

    return {
        label   : 'Theme',
        submenu : [
            createTheme('Ambiance', 'ambiance'),
            createTheme('Chaos', 'chaos'),
            createTheme('Chrome', 'chrome'),
            createTheme('Clouds', 'clouds'),
            createTheme('Clouds (Midnight)', 'clouds_midnight'),
            createTheme('Cobalt', 'cobalt'),
            createTheme('Crimson', 'crimson_editor'),
            createTheme('Dawn', 'dawn'),
            createTheme('Dreamweaver', 'dreamweaver'),
            createTheme('Eclipse', 'eclipse'),
            createTheme('GitHub', 'github'),
            createTheme('Idle Fingers', 'idle_fingers'),
            createTheme('iPastic', 'ipastic'),
            createTheme('Katzenmilch', 'katzenmilch'),
            createTheme('KR Theme', 'kr_theme'),
            createTheme('Kuroir', 'kuroir'),
            createTheme('Merbivore', 'merbivore'),
            createTheme('Merbivore Soft', 'merbivore_soft'),
            createTheme('Mono Industrial', 'mono_industrial'),
            createTheme('Monokai', 'monokai'),
            createTheme('Pastal on Dark', 'pastal_on_dark'),
            createTheme('Solarized Dark', 'solarized_dark'),
            createTheme('Solarized Light', 'solarized_light'),
            createTheme('SQL Server', 'sqlserver'),
            createTheme('Terminal', 'terminal'),
            createTheme('Textmate', 'textmate'),
            createTheme('Tomorrow', 'tomorrow'),
            createTheme('Tomorrow Night', 'tomorrow_night'),
            createTheme('Tomorrow Night (Blue)', 'tomorrow_night_blue'),
            createTheme('Tomorrow Night (Bright)', 'tomorrow_night_bright'),
            createTheme('Tomorrow Night (Eighties)', 'tomorrow_night_eighties'),
            createTheme('Twilight', 'twilight'),
            createTheme('Vibrant Ink', 'vibrant_ink'),
            createTheme('Xcode', 'xcode')
        ]
    };
};

const createViewMenu = () => {
    return {
        label   : 'View',
        submenu : [
            {
                label : 'Show filter list',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('View.showFilterList', item.checked);
                }
            },
            {
                label : 'Show note list',
                type  : 'checkbox',
                click(item, win) {
                    if (win) PubSub.publish('View.showNoteList', item.checked);
                }
            },
            {
                type : 'separator'
            },
            createSyntaxMenu(),
            createThemeMenu()
        ]
    };
}

const createDeveloperMenu = () => {
    return {
        label   : 'Developer',
        submenu : [
            {
                label       : 'Reload',
                accelerator : 'CmdOrCtrl+R',
                click(item, win) {
                    if (win) win.reload();
                }
            },
            {
                label       : 'Toggle Developer Tools',
                accelerator : is.macOS() ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click(item, win) {
                    if (win) win.webContents.toggleDevTools();
                }
            },
            {
                type : 'separator'
            },
            {
                label : 'Reset settings',
                click(item, win) {
                    if (win) PubSub.publish('Settings.reset');
                }
            },
            {
                label : 'Reset database',
                click(item, win) {
                    if (win) PubSub.publish('Database.reset');
                }
            }
        ]
    }
};

module.exports = { setMenuItemEnabled, createPreferencesMenu, createEditMenu, createSyntaxMenu, createThemeMenu, createViewMenu, createDeveloperMenu };
