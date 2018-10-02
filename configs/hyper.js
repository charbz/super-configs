// Future versions of Hyper may add additional config options,
// which will not automatically be merged into this file.
// See https://hyper.is#cfg for all currently supported options.

module.exports = {
  config: {
    // choose either `'stable'` for receiving highly polished,
    // or `'canary'` for less polished but more frequent updates
    updateChannel: 'stable',

    // default font size in pixels for all tabs
    fontSize: 15,

    // font family with optional fallbacks
    fontFamily: '"Meslo LG L DZ", Monaco, "SauceCodePro Nerd Font", "DroidSansMono Nerd Font", "DejaVu Sans Mono", "Lucida Console", monospace',

    // default font weight: 'normal' or 'bold'
    fontWeight: 'normal',

    // font weight for bold characters: 'normal' or 'bold'
    fontWeightBold: 'bold',

    // terminal cursor background color and opacity (hex, rgb, hsl, hsv, hwb or cmyk)
    cursorColor: '#42f450',

    // terminal opacity
    opacity: 0.98,

    // terminal text color under BLOCK cursor
    cursorAccentColor: '#000',

    // `'BEAM'` for |, `'UNDERLINE'` for _, `'BLOCK'` for █
    cursorShape: 'BLOCK',

    // set to `true` (without backticks and without quotes) for blinking cursor
    cursorBlink: true,

    // color of the text
    foregroundColor: '#fff',

    // terminal background color
    // opacity is only supported on macOS
    backgroundColor: '#1c1c1c',

    // terminal selection color
    selectionColor: 'rgba(62, 102, 74, 0.3)',

    // border color (window, tabs)
    borderColor: '#424242',

    // custom CSS to embed in the main window
    css: `
      .header_headerRounded {
        background: #2b2b2b;
	border-bottom: 1px solid #484848;
      },
      .footer_footer {
	height: 35px;
        background: #2b2b2b;
	border-top: 1px solid #484848;
      }
      .tabs_title {
        font-size: 15px !important;
      }
    `,

    // custom CSS to embed in the terminal window
    termCSS: '',

    // if you're using a Linux setup which show native menus, set to false
    // default: `true` on Linux, `true` on Windows, ignored on macOS
    showHamburgerMenu: '',

    // set to `false` (without backticks and without quotes) if you want to hide the minimize, maximize and close buttons
    // additionally, set to `'left'` if you want them on the left, like in Ubuntu
    // default: `true` (without backticks and without quotes) on Windows and Linux, ignored on macOS
    showWindowControls: '',

    // custom padding (CSS format, i.e.: `top right bottom left`)
    padding: '5px 5px',

    // the full list. if you're going to provide the full color palette,
    // including the 6 x 6 color cubes and the grayscale map, just provide
    // an array here instead of a color map object

    // the shell to run when spawning a new session (i.e. /usr/local/bin/fish)
    // if left empty, your system's login shell will be used by default
    //
    // Windows
    // - Make sure to use a full path if the binary name doesn't work
    // - Remove `--login` in shellArgs
    //
    // Bash on Windows
    // - Example: `C:\\Windows\\System32\\bash.exe`
    //
    // PowerShell on Windows
    // - Example: `C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`
    shell: '',

    // for setting shell arguments (i.e. for using interactive shellArgs: `['-i']`)
    // by default `['--login']` will be used
    shellArgs: ['--login'],

    // for environment variables
    env: {},

    // set to `false` for no bell
    bell: 'SOUND',

    // if `true` (without backticks and without quotes), selected text will automatically be copied to the clipboard
    copyOnSelect: false,

    // if `true` (without backticks and without quotes), hyper will be set as the default protocol client for SSH
    defaultSSHApp: true,

    colors: {
      black: '#000000',
      red: '#e0634a',
      green: '#17c122',
      yellow: '#ede468',
      blue: '#5985cc',
      magenta: '#e278e2',
      cyan: '#89b5b7',
      white: '#d0d0d0',
      lightBlack: '#808080',
      lightRed: '#e57059',
      lightGreen: '#84e072',
      lightYellow: '#ffff00',
      lightBlue: '#00ff00',
      lightMagenta: '#cc00ff',
      lightCyan: '#00ffff',
      lightWhite: '#ffffff',
      grey: '#333333'
    },

    // if `true` (without backticks and without quotes), on right click selected text will be copied or pasted if no
    // selection is present (`true` by default on Windows and disables the context menu feature)
    // quickEdit: true,

    hyperTabs: {
      tabIconsColored: true,
      activityColor: '#dd7e30',
      trafficButtons: true
    },
    powerStatus: {
      foregroundColor: '#FFF',
      secondaryColor: 'lime',
      dirtyColor: '#96e088',
      aheadColor: '#96e088'
    }
  },

  // a list of plugins to fetch and install from npm
  // format: [@org/]project[#version]
  // examples:
  //   `hyperpower`
  //   `@company/project`
  //   `project#1.0.1`
  plugins: ["hyper-opacity"],

  // in development, you can create a directory under
  // `~/.hyper_plugins/local/` and include it here
  // to load it and avoid it being `npm install`ed
  localPlugins: [
    "power-status",
    "cool-tabs"
  ],

  keymaps: {
    "tab:next": "shift+right",
    "tab:prev": "shift+left"
  }
};
