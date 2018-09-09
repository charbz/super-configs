const { shell } = require('electron');
const { exec } = require('child_process');
const afterAll = require('after-all-results');
const tildify = require('tildify');
const color = require('color');
const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('d2d0d136ff7c4812a9fa8964977a1328');
const Client = require('node-rest-client').Client;
const client = new Client();

///////////////// GLOBAL FUNCTIONS //////////////////////

let pid;
let cwd;

let crypto = ['bitcoin','eos','cardano'];

let git = {
  branch: '',
  remote: '',
  dirty: 0,
  ahead: 0
};

let global = {
  visible: false,
  vimHelperVisible: false,
  filename: '',
  locked: false,
  gitlocked: false,
  cnewsTitle: '',
  cnewsUrl: '',
  cnewsSource: '',
  coins: []
};

let news = [];

const hideMe = () => {
  global.visible = false;
}

const showMe = () => {
  global.visible = true;
}

const setCwd = (pid, action) => {
  if (global.gitlocked) return;
  if (process.platform == 'win32') {
    let directoryRegex = /([a-zA-Z]:[^\:\[\]\?\"\<\>\|]+)/mi;
    if (action && action.data) {
      let path = directoryRegex.exec(action.data);
      if(path){
	cwd = path[0];
	setGit(cwd);
      }
    }
  } else {
    exec(`lsof -p ${pid} | awk '$4=="cwd"' | tr -s ' ' | cut -d ' ' -f9-`, (err, stdout) => {
      cwd = stdout.trim();
      setGit(cwd);
      global.gitlocked = true;
      setTimeout(function() { global.gitlocked = false; }, 1000);
    });
  }
};

const checkVim = (pid, action) => {
  if (global.locked) return;
  let psResult='';
  let lsofResult='';
  let subPid = '';
  let filename = '';
  let temp;
  exec(`ps -f | grep vim | awk '$3=="${pid}"' | tr -s ' '`, (err, stdout) => {
    if (stdout && stdout.length > 0) {
      showMe();
      psResult = stdout.trim().split(' ');
      subPid = psResult[1];
      exec(`lsof -p ${subPid} | grep vim.*\.swp | tr -s ' ' | cut -d ' ' -f9-`, (err, stdout) => {
	lsofResult = stdout.trim();
	filename = lsofResult.substr(0,lsofResult.length-4);
	temp = filename.lastIndexOf('/.');
	filename = filename.substr(0, temp+1) + filename.substr(temp+2, filename.length);
	global.filename = filename;
	global.locked = true;
	setTimeout(function() { global.locked = false; }, 3000);
      });
    } else {
      hideMe();
    }
  });
};

const isGit = (dir, cb) => {
  exec(`git rev-parse --is-inside-work-tree`, { cwd: dir }, (err) => {
    cb(!err);
  });
}

const gitBranch = (repo, cb) => {
  exec(`git symbolic-ref --short HEAD || git rev-parse --short HEAD`, { cwd: repo }, (err, stdout) => {
    if (err) {
      return cb(err);
    }
    cb(null, stdout.trim());
  });
}

const gitRemote = (repo, cb) => {
  exec(`git ls-remote --get-url`, { cwd: repo }, (err, stdout) => {
    cb(null, stdout.trim().replace(/^git@(.*?):/, 'https://$1/').replace(/[A-z0-9\-]+@/, '').replace(/\.git$/, ''));
  });
}

const gitDirty = (repo, cb) => {
  exec(`git status --porcelain --ignore-submodules -uno`, { cwd: repo }, (err, stdout) => {
    if (err) {
      return cb(err);
    }
    cb(null, !stdout ? 0 : parseInt(stdout.trim().split('\n').length, 10));
  });
}

const gitAhead = (repo, cb) => {
  exec(`git rev-list --left-only --count HEAD...@'{u}' 2>/dev/null`, { cwd: repo }, (err, stdout) => {
    cb(null, parseInt(stdout, 10));
  });
}

const gitCheck = (repo, cb) => {
  const next = afterAll((err, results) => {
    if (err) {
      return cb(err);
    }
    const branch = results[0];
    const remote = results[1];
    const dirty = results[2];
    const ahead = results[3];
    cb(null, {
      branch: branch,
      remote: remote,
      dirty: dirty,
      ahead: ahead
      });
    });
  gitBranch(repo, next());
  gitRemote(repo, next());
  gitDirty(repo, next());
  gitAhead(repo, next());
}

const setGit = (repo) => {
  isGit(repo, (exists) => {
    if (!exists) {
      git = {
	branch: '',
	remote: '',
	dirty: 0,
	ahead: 0
      }
      return;
    }
    gitCheck(repo, (err, result) => {
      if (err) {
        throw err;
      }
      git = {
	branch: result.branch,
	remote: result.remote,
	dirty: result.dirty,
	ahead: result.ahead
      }
    })
  });
}

const getCoins = () => {
  global.coins = [];
  for (let i=0; i<crypto.length; i++) {
    setTimeout(getCoin.bind(this,crypto[i]), 1000 * i);
  }
}

const getCoin = (name) => {
  client.get(`https://api.coinmarketcap.com/v1/ticker/${name}`, function (data, response) {
    let statusCode = response.statusCode;
    if (statusCode === 200) {
     global.coins.push(data[0]);
    }
  });
}

const getNews = () => {
  newsapi.v2.topHeadlines({
    sources: 'hacker-news,ars-technica,crypto-coins-news,techcrunch,techradar',
    pageSize: 100
  }).then(response => {
    news = response.articles
    displayResults(0);
  });
}

const displayResults = (ind) => {
  let i=ind;
  if (i>=news.length) {
    getNews();
    getCoins();
    return;
  }
  else {
    global.cnewsSource = '[' + news[i].source.id + '] ';
    global.cnewsTitle = news[i].title;
    global.cnewsUrl = news[i].url;
    i++;
    setTimeout(function() {
     displayResults(i);
    }, 30000);
  }
}

getNews();
getCoins();

///////////////// MIDDLEWARE //////////////////////

exports.middleware = (store) => (next) => (action) => {
  const uids = store.getState().sessions.sessions;
  switch (action.type) {
    case 'SESSION_SET_XTERM_TITLE':
      pid = uids[action.uid].pid;
    break;

    case 'SESSION_ADD':
      pid = action.pid;
      setCwd(pid);
    break;

    case 'SESSION_ADD_DATA':
      const { data } = action;
      const enterKey = data.indexOf('\n') > 0;
      if (enterKey) {
	setCwd(pid, action);
	checkVim(pid, action);
      }
    break;

    case 'SESSION_SET_ACTIVE':
      pid = uids[action.uid].pid;
      setCwd(pid);
    break;
  }
  next(action);
};

///////////////// DECORATEHYPER //////////////////////

exports.decorateHyper = (Hyper, { React }) => {
  return class extends React.PureComponent {
    constructor(props) {
      super(props);

      this.state = {
          cwd: '',
          branch: '',
          remote: '',
          dirty: 0,
          ahead: 0,
          visible: false,
          vimHelperVisible: false,
          filename: '',
	  cnewsTitle: '',
	  cnewsUrl: '',
	  cnewsSource: '',
	  coins: []
      }

      this.handleCwdClick = this.handleCwdClick.bind(this);
      this.handleBranchClick = this.handleBranchClick.bind(this);
      this.handleVimClick = this.handleVimClick.bind(this);
      this.openFilename = this.openFilename.bind(this);
    }

    handleCwdClick(event) {
      shell.openExternal('file://'+this.state.cwd);
    }

    handleVimClick(event) {
      global.vimHelperVisible = !global.vimHelperVisible;
    }

    openVimrc(event) {
      shell.openItem('~/.vimrc');
    }

    openFilename(event) {
      shell.openItem(this.state.filename);
    }

    handleBranchClick(event) {
      shell.openExternal(this.state.remote);
    }

    openLink(e) {
      e.preventDefault();
      shell.openExternal(global.cnewsUrl);
    }

    renderCoin(coin) {
      return (
        React.createElement(
	  "div",
	  {},
	  React.createElement(
	    "span",
	    { className: "coin_name" },
	    coin.symbol
	  ),
	  React.createElement(
	    "span",
	    { className: "coin_price" },
	    Number(coin.price_usd).toFixed(2)
	  )
	)
      );
    }

    render() {
      const { customChildren } = this.props
      const existingChildren = customChildren ? customChildren instanceof Array ? customChildren : [customChildren] : [];

      return (
        React.createElement(Hyper, Object.assign({}, this.props, {
          customInnerChildren: existingChildren.concat(
            // PASTE BEGIN ////////////////////////////////////////////////////////////////////
	    React.createElement(
	      "footer",
	      { className: "footer_footer" },
	      React.createElement(
		"div",
		{ className: "footer_group group_overflow" },
		React.createElement(
		  "div",
		  { className: "component_component component_cwd" },
		  React.createElement(
		    "div",
		    { className: "component_item item_icon item_cwd item_clickable",
		      title: this.state.cwd,
		      onClick: this.handleCwdClick,
		      hidden: !this.state.cwd },
		    this.state.cwd ? tildify(String(this.state.cwd)) : ''
		  )
		),
		React.createElement(
		  "div",
		  { className: `component_item item_icon item_branch ${this.state.remote ? 'item_clickable' : ''}`,
		    title: this.state.remote,
		    onClick: this.handleBranchClick,
		    hidden: !this.state.branch },
		  this.state.branch
		),
		React.createElement(
		  "div",
		  { className: "component_item item_icon item_number item_dirty",
		    title: `${this.state.dirty} dirty ${this.state.dirty > 1 ? 'files' : 'file'}`,
		    hidden: !this.state.dirty },
		  this.state.dirty
		),
		React.createElement(
		  "div",
		  { className: "component_item item_icon item_number item_ahead",
		    title: `${this.state.ahead} ${this.state.ahead > 1 ? 'commits' : 'commit'} ahead`,
		    hidden: !this.state.ahead },
		  this.state.ahead
		),
		React.createElement(
		  "div",
		  { className: "component_item item_icon item_coins" },
		  React.createElement(
		    "div",
		    { className: "coins" },
		    this.state.coins.map(this.renderCoin)
		  )
		),
		React.createElement(
		  "div",
		  { className: "component_item item_icon item_news marquee" },
		  React.createElement(
		    "span",
		    { className: "source" },
		    this.state.cnewsSource
		  ),
		  React.createElement(
		    "span",
		    { className: "title" },
		    React.createElement(
		      "a",
		      { onClick: this.openLink, href: this.state.cnewsUrl },
		      this.state.cnewsTitle
		    )
		  )
		)
	      ),
	      React.createElement(
		"div",
		{ className: "footer_group group_overflow" },
		React.createElement(
		  "div",
		  { className: "component_component component_vim" },
		  React.createElement(
		    "div",
		    { className: "component_item item_icon item_vim item_clickable",
		      title: "Vim Mode",
		      onClick: this.handleVimClick,
		      hidden: !this.state.visible },
		    "Vim"
		  ),
		  React.createElement(
		    "div",
		    { className: `vim_helper ${!this.state.vimHelperVisible ? 'height-hidden' : ''}` },
		    React.createElement(
		      "div",
		      { className: "vim_title_container" },
		      React.createElement(
			"div",
			{ className: "vim_title" },
			"Vim Menu"
		      ),
		      React.createElement(
			"div",
			{ className: "closer", onClick: this.handleVimClick },
			"\u25BA"
		      )
		    ),
		    React.createElement(
		      "ul",
		      null,
		      React.createElement(
			"li",
			{ className: "hint" },
			"File Search: ",
			React.createElement(
			  "span",
			  null,
			  "[esc] f"
			)
		      ),
		      React.createElement(
			"li",
			{ className: "hint" },
			"Keyword Search: ",
			React.createElement(
			  "span",
			  null,
			  "[esc] s"
			)
		      ),
		      React.createElement(
			"li",
			{ className: "hint" },
			"Dir Tree: ",
			React.createElement(
			  "span",
			  null,
			  "[esc] t"
			)
		      ),
		      React.createElement(
			"li",
			{ onClick: this.openFilename },
			"Open ",
			this.state.filename
		      ),
		      React.createElement(
			"li",
			{ onClick: this.openVimrc },
			"Open ~/.vimrc"
		      )
		    )
		  )
		)
	      )
	    )
            ////////////////////////////////////////////////////////////////////// PASTE END
          )
        })
        )
      )
    }

    componentDidMount() {
      this.interval = setInterval(() => {
	this.setState({
	  cwd: cwd,
	  branch: git.branch,
	  remote: git.remote,
	  dirty: git.dirty,
	  ahead: git.ahead,
	  visible: global.visible,
	  vimHelperVisible: global.vimHelperVisible,
	  filename: global.filename,
	  cnewsTitle: global.cnewsTitle,
	  cnewsUrl: global.cnewsUrl,
	  cnewsSource: global.cnewsSource,
	  coins: global.coins
	});
      }, 2000);
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }
  };
};

///////////////// DECORATE CONFIG //////////////////////

exports.decorateConfig = (config) => {

    const psConfig = config.powerStatus || {};
    const colorForeground = color(psConfig.foregroundColor || config.foregroundColor || '#fff');
    const colorBackground = color(psConfig.backgroundColor || config.backgroundColor || '#000');
    const colorSecondary = color(psConfig.secondaryColor || 'lime');
    const colors = {
      foreground: colorForeground.string(),
      background: colorBackground.lighten(0.3).string(),
      secondary: colorSecondary.string()
    };

    const configColors = Object.assign({
        black: '#000000',
        red: '#ff0000',
        green: '#33ff00',
        yellow: '#ffff00',
        blue: '#0066ff',
        magenta: '#cc00ff',
        cyan: '#00ffff',
        white: '#d0d0d0',
        lightBlack: '#808080',
        lightRed: '#ff0000',
        lightGreen: '#33ff00',
        lightYellow: '#ffff00',
        lightBlue: '#0066ff',
        lightMagenta: '#cc00ff',
        lightCyan: '#00ffff',
        lightWhite: '#ffffff'
    }, config.colors);

    const powerStatusLine = Object.assign({
        dirtyColor: configColors.lightYellow,
        aheadColor: configColors.blue
    }, psConfig);

    return Object.assign({}, config, {
        css: `
            ${config.css || ''}
            .terms_terms {
                margin-bottom: 35px;
            }
            .footer_footer {
                display: flex;
                justify-content: space-between;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 100;
                font-size: 15px;
                height: 35px;
                background-color: ${colors.background};
                cursor: default;
                -webkit-user-select: none;
                transition: opacity 250ms ease;
            }
            .footer_footer .footer_group {
                display: flex;
                color: ${colors.foreground};
                white-space: nowrap;
                margin: 0px 10px 0px 2px;
            }
            .footer_footer .group_overflow {
                overflow: hidden;
            }
            .footer_footer .component_component {
                display: flex;
		padding-left: 35px;
            }
            .footer_footer .component_item {
                position: relative;
                line-height: 30px;
                margin-left: 12px;
            }
            .footer_footer .component_item:first-of-type {
                margin-left: 0;
            }
            .footer_footer .item_clickable:hover {
                text-decoration: underline;
                cursor: pointer;
            }
            .footer_footer .item_icon:before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 18px;
                height: 100%;
                -webkit-mask-repeat: no-repeat;
                -webkit-mask-position: 0 center;
                background-color: ${colors.foreground};
            }
            .footer_footer .item_number {
                font-size: 12px;
                font-weight: 500;
            }
	    .marquee {
	      line-height:30px;
	      padding: 0 17px 0 35px;
	      color:#8a8a8a;
	      width: auto;
	      margin-left: 16px;
	      border-left: 1px solid #4a4a4a;
	      border-right: 1px solid #4a4a4a;
	      background: #1b1b1b;
	    }
	    .marquee a {
	      color: #fff;
	      text-decoration: none;
	    }
	    .marquee a:hover {
	      text-decoration: underline;
	    }
	    .source {
	      color: orange;
	      padding-right: 5px;
	    }
	    .component_vim {
	      border-left: 1px solid #424242;
	      padding-left: 40px;
	    }
	    .vim_title_container {
	      padding: 10px 0;
	      color: #6eb38e;
	    }
	    .vim_title {
	      float: left;
	      margin-left: 7px;
	      font-weight:bold;
	    }
	    .closer {
	      text-align:right;
	      cursor: pointer;
	      margin-right: 7px;
	    }
	    .closer:hover {
	      color: lime;
	    }
	    .vim_helper.height-hidden {
	      right:-300px;
	    }
      	    .vim_helper {
      	      position: absolute;
      	      background: rgb(31,31,31);
      	      right: 0px;
      	      bottom: 35px;
      	      padding: 5px;
      	      border: 1px solid #404040;
              border-bottom: none;
	      width: 300px;
	      overflow: hidden;
	      transition: all 0.3s ease;
      	    }
      	    .vim_helper ul {
      	      list-style-type: none;
      	    }
      	    .vim_helper ul li {
      	      padding: 8px;
      	      cursor: pointer;
	      white-space: nowrap;
	      text-overflow: ellipsis;
	      width: 255px;
	      overflow: hidden;
      	    }
      	    .vim_helper ul li:hover {
      	      color: #08ff41;
      	    }
      	    .vim_helper ul li.hint {
      	      cursor: default;
      	      color: #7b7b7b;
              font-weight: normal;
      	    }
      	    .vim_helper ul li.hint span {
      	      font-weight:bold;
      	      color: #7b7b7b;
      	    }
            .footer_footer .item_cwd:before {
              -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDE0IDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMywyIEw3LDIgTDcsMSBDNywwLjM0IDYuNjksMCA2LDAgTDEsMCBDMC40NSwwIDAsMC40NSAwLDEgTDAsMTEgQzAsMTEuNTUgMC40NSwxMiAxLDEyIEwxMywxMiBDMTMuNTUsMTIgMTQsMTEuNTUgMTQsMTEgTDE0LDMgQzE0LDIuNDUgMTMuNTUsMiAxMywyIEwxMywyIFogTTYsMiBMMSwyIEwxLDEgTDYsMSBMNiwyIEw2LDIgWiIvPjwvc3ZnPg==');
	      -webkit-mask-size: 18px 18px;
	      margin-left: -25px;
	      top: -1px;
            }
      	    .footer_footer .item_icon:before {
      	      background: ${colors.secondary};
      	    }
	    .footer_footer .item_news {

	    }
	    .footer_footer .item_news:before {
	      -webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDU2LjY5MyA1Ni42OTMiIGhlaWdodD0iNTYuNjkzcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1Ni42OTMgNTYuNjkzIiB3aWR0aD0iNTYuNjkzcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxwYXRoIGQ9Ik0yOC4zNDcsNS4xNTVjLTEzLjYsMC0yNC42MjUsMTEuMDI1LTI0LjYyNSwyNC42MjVjMCwxMy42MDIsMTEuMDI0LDI0LjYyNSwyNC42MjUsMjQuNjI1ICBjMTMuNjAyLDAsMjQuNjI1LTExLjAyMywyNC42MjUtMjQuNjI1QzUyLjk3MiwxNi4xOCw0MS45NDgsNS4xNTUsMjguMzQ3LDUuMTU1eiBNMjAuNzEsNDAuODljLTEuNzg4LDAtMy4yMzctMS40NTEtMy4yMzctMy4yMzggIGMwLTEuNzg5LDEuNDQ5LTMuMjM4LDMuMjM3LTMuMjM4YzEuNzg3LDAsMy4yMzgsMS40NDksMy4yMzgsMy4yMzhDMjMuOTQ4LDM5LjQzOCwyMi40OTcsNDAuODksMjAuNzEsNDAuODl6IE0yOC44MzMsNDAuOTExICBjMC0zLjA1Ny0xLjE4Mi01LjkyOC0zLjMzLTguMDgyYy0yLjE0My0yLjE1NC00Ljk5Mi0zLjM0Mi04LjAyOC0zLjM0MnYtNC42NzRjOC44NCwwLDE2LjAzLDcuMjIzLDE2LjAzLDE2LjA5OEgyOC44MzN6ICAgTTM3LjA4OSw0MC45MTVjMC0xMC44NjctOC43OTUtMTkuNzExLTE5LjYwNi0xOS43MTF2LTQuNjc2YzEzLjM4NywwLDI0LjI4LDEwLjk0MiwyNC4yOCwyNC4zODdIMzcuMDg5eiIvPjwvc3ZnPg==');
	      -webkit-mask-size: 20px 20px;
	      margin-left: 8px;
	      top: -1px;
	      width: 20px;
	      background: orange;
	    }
	    .footer_footer .item_coins:before {
	      -webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjI2Ljc3NyAyMjYuNzc3IiBoZWlnaHQ9IjIyNi43NzdweCIgaWQ9IkxheWVyXzEiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDIyNi43NzcgMjI2Ljc3NyIgd2lkdGg9IjIyNi43NzdweCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBhdGggZD0iTTE4Mi45ODEsMTEyLjg1NGMtNy4zLTUuNDk4LTE3LjY5OS03LjY5Ny0xNy42OTktNy42OTdzOC44LTUuMTAyLDEyLjM5Ni0xMC4xOTkgIGMzLjYtNS4wOTksNS4zOTktMTIuOTk5LDUuNy0xNy4wOThjMC4yOTktNC4xMDEsMS0yMS4yOTYtMTIuMzk5LTMxLjE5M2MtMTAuMzY0LTcuNjU4LTIyLjI0MS0xMC42OTgtMzguMTktMTEuNjg3VjAuMjc4aC0yMS4zOTYgIFYzNC41N2MtNC43NzQsMC0xMC4zNTMsMC0xNi4yOTcsMFYwLjI3OEg3My43MDJWMzQuNTdjLTIxLjg0MSwwLTQyLjA5MiwwLTQyLjA5MiwwdjIyLjIxOWMwLDAsOC45OTgsMCwxMi4zNzIsMCAgYzMuMzczLDAsOS4zNzIsMC4zNzUsMTEuOTIxLDMuMjI4YzIuNTUsMi44NDgsMyw0LjM0OSwzLDkuODk1YzAsNS41NDgsMC4wMDEsODYuNDM1LDAuMDAxLDg4LjUzNWMwLDIuMDk5LTAuNCw0LjY5Ny0yLjIwMSw2LjM5OCAgYy0xLjc5OCwxLjcwMS0zLjU5NywyLjA5OC03Ljg5OCwyLjA5OGMtNC4zLDAtMTIuNzk2LDAtMTIuNzk2LDBsLTQuMzk5LDI1LjY5OGMwLDAsMjAuOTE4LDAsNDIuMDkyLDB2MzQuMTk1aDIxLjM5NXYtMzQuMTk1ICBjNi41NzQsMCwxMi4yOTgsMCwxNi4yOTcsMHYzNC4xOTVoMjEuMzk2di0zNC43NTljNS41MzEtMC4zMjMsMTAuNjg4LTAuNzQyLDEzLjY5Ni0xLjEzNmM2LjEtMC43OTgsMTkuODk2LTIuMzk4LDMyLjc5Ni0xMS4zOTcgIGMxMi44OTYtOSwxNS43OTMtMjMuMDk4LDE2LjA5NC0zNy4yOTRDMTk1LjY4LDEyOC4wNTMsMTkwLjI3NCwxMTguMzUzLDE4Mi45ODEsMTEyLjg1NHogTTk1LjA5Niw1OC43NjYgIGMwLDAsNi43OTgtMC41OTksMTMuNDk3LTAuNTAxYzYuNzAxLDAuMDk5LDEyLjU5NywwLjMsMjEuMzk4LDNjOC43OTcsMi43MDEsMTMuOTkyLDkuMywxNC4xOTYsMTcuMDk5ICBjMC4xOTksNy43OTktMy4yMDQsMTIuOTk2LTkuMiwxNi4yOTZjLTUuOTk4LDMuMjk5LTE0LjI5Miw1LjA5OS0yMi4wOTQsNS4zOTZjLTcuNzk3LDAuMzAxLTE3Ljc5NywwLTE3Ljc5NywwVjU4Ljc2NnogICBNMTQyLjk4NiwxNjEuMDQ1Yy00Ljg5OSwyLjcwMS0xNC42OTgsNS4xLTI0LjE5NCw1Ljc5OGMtOS40OTksMC43MDEtMjMuNjk2LDAuNDAxLTIzLjY5NiwwLjQwMXYtNDUuODkzYzAsMCwxMy41OTgtMC42OTgsMjQuMTk3LDAgIGMxMC41OTcsMC43MDMsMTkuNDk1LDMuNCwyMy40OTIsNS40MDNjMy45OTksMS45OTgsMTEsNi4zOTYsMTEsMTYuODk2QzE1My43ODUsMTU0LjE0NiwxNDcuODgyLDE1OC4zNDYsMTQyLjk4NiwxNjEuMDQ1eiIgaWQ9IkJUQ19hbHRfMV8iLz48L3N2Zz4=');
	      -webkit-mask-size: 18px 18px;
	      top: -1px;
	      width: 18px;
	    }
            .footer_footer .item_branch {
              padding-left: 17px;
	      margin-left: 19px;
            }
      	    .footer_footer .item_vim:before {
      	      -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIzNCIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDM0IDMyIj48cGF0aCBmaWxsPSIjNDQ0IiBkPSJNMTguNzUyIDE5LjQ0MmMuMDQyLjA0Mi4xMjUuMTA1LjE4OC4xMDVoMS4xMDljLjA2MyAwIC4xNDYtLjA2My4xODgtLjEwNWwuMjkzLS4zMTRjLjA0Mi0uMDQyLjA2My0uMDg0LjA2My0uMTI1bC4zMTQtMS4wNjdjLjAyMS0uMTA1IDAtLjIwOS0uMDYzLS4yNzJsLS4yMy0uMTg4Yy0uMDQyLS4wNDItLjEyNS0uMDIxLS4xODgtLjAyMWgtMS4wMDRsLS4wNjMtLjA2M2MtLjA0MiAwLS4wODQtLjAyMS0uMTI2LjAyMWwtLjM5OC4yNTFjLS4wNDIgMC0uMDYzLjEwNS0uMDg0LjE0NmwtLjMzNSAxLjAyNWEuMjkyLjI5MiAwIDAgMCAuMDYzLjMxNGwuMjcyLjI5M3ptLjE2NyA1LjUyNGwtLjA4NC4wMjFoLS4yNTFsMS41MDctNC40MTVjLjA0Mi0uMTQ2LS4wMjEtLjMxNC0uMTY3LS4zNTZsLS4wODQtLjAyMWgtMi41MzJhLjI2OS4yNjkgMCAwIDAtLjIwOS4yMDlsLS4xNDYuNTIzYy0uMDQyLjE0Ni4wNjMuMjcyLjIwOS4zMTRsLjA2My0uMDIxaC4zNzdsLTEuNTI4IDQuMzczYy0uMDQyLjE0Ni4wMjEuMzM1LjE2Ny4zOThsLjA4NC4wNjNoMi4zNDRjLjEyNSAwIC4yMy0uMTA1LjI3Mi0uMjNsLjE0Ni0uNTAyYS4yNjQuMjY0IDAgMCAwLS4xNjctLjM1NnptMTEuMTEyLTQuMTIybC0uMzk4LS41MjNWMjAuM2MtLjA2My0uMDYzLS4xMjUtLjEyNS0uMjA5LS4xMjVoLTEuNTA3Yy0uMDg0IDAtLjE0Ni4wODQtLjIwOS4xMjVsLS40MTkuNTAyaC0uNjQ5bC0uNDM5LS41MDJ2LS4wMjFhLjI1OC4yNTggMCAwIDAtLjIwOS0uMTA1aC0uODM3bDQuMjI3LTQuMjI3LTQuNzI5LTQuNjg3IDQuMjI3LTQuMzUyVjUuMDI1bC0uNTg2LS43NTNoLTguNTU4bC0uNjkxLjczMnYuNjA3TDE2LjY4IDMuMjI2bC0xLjYxMSAxLjU2OS0uNTAyLS41MjNINi4xMTNsLS42Ny43NzR2MS45NjdsLjYyOC42MDdoLjYyOHY1LjQ2MUwzLjc3IDE2LjAxbDIuOTI5IDIuOTN2Ni42OTZsMS4wODguNjA3aDIuNDI3bDEuOTA0LTEuOTg4IDQuNTIgNC41MiAzLjAzNC0zLjAzNGMuMDIxLjA4NC4wODQuMTA1LjE4OC4xNDZsLjA4NC0uMDQyaDEuOTY3Yy4xMjYgMCAuMjMtLjAyMS4yNTEtLjEyNWwuMTQ2LS40MThjLjA0Mi0uMTQ2LS4wMjEtLjI3Mi0uMTY3LS4zMTRsLS4wODQuMDIxaC0uMDg0bC43MTItMi4yMzkuNDgxLS40ODFoMS4wNDZsLTEuMDQ2IDMuMzI3Yy0uMDQyLjE0Ni4wNDIuMjMuMTg4LjI5M2wuMDg0LS4wNDJoMS45MDRjLjEwNSAwIC4yMDktLjAyMS4yNTEtLjEyNWwuMTY3LS4zNzdjLjA2My0uMTQ2LS4wMjEtLjI3Mi0uMTQ2LS4zMzUtLjAyMS0uMDIxLS4wNjMgMC0uMTA1IDBoLS4wODRsLjg3OS0yLjcyaDEuMjc2bC0xLjA2NyAzLjMyN2MtLjA0Mi4xNDYuMDQyLjIzLjE4OC4yNzJsLjA4NC0uMDYzaDIuMDkzYy4xMDUgMCAuMjA5LS4wMjEuMjUxLS4xMjVsLjE2Ny0uNDE4Yy4wNjMtLjE0Ni0uMDIxLS4yNzItLjE2Ny0uMzE0LS4wMjEtLjAyMS0uMDYzLjAyMS0uMTA1LjAyMWgtLjE0NmwxLjE3Mi0zLjg3MWEuMzQ1LjM0NSAwIDAgMC0uMDIxLS4yOTN6TTE2LjY4IDMuNjIzbDIuMzY1IDIuMzY1di45ODRsLjcxMS44NThoLjMzNWwtNi4wNjggNS44NTlWNy44M2guNjkxbC41NjUtLjg3OVY1LjA4OWwtLjA0Mi0uMDYzIDEuNDQ0LTEuNDAyek00LjE2NyAxNi4wMWwyLjUzMi0yLjUzMnY1LjA2NEw0LjE2NyAxNi4wMXptOC4xNCA4LjAxNWwxMi4yMi0xMi41NTUgNC40NzggNC40OTktNC4yMjcgNC4yMjdoLS4wMjFhLjM2Ni4zNjYgMCAwIDAtLjE0Ni4xMDVsLS40MzkuNTAyaC0uNjA3bC0uNDYtLjUwMmMtLjA0Mi0uMDYzLS4xMjYtLjEyNS0uMjA5LS4xMjVoLTEuODQxYS4yOS4yOSAwIDAgMC0uMjcyLjIwOWwtLjE2Ny41MjNjLS4wNDIuMTQ2LjAyMS4yNzIuMTY3LjMzNWguMzE0bC0xLjMzOSAzLjk1NS0zLjE2IDMuMTgxLTQuMjktNC4zNTJ6Ii8+PG1ldGFkYXRhPjxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgeG1sbnM6cmRmcz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wMS9yZGYtc2NoZW1hIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIj48cmRmOkRlc2NyaXB0aW9uIGFib3V0PSJodHRwczovL2ljb25zY291dC5jb20vbGVnYWwjbGljZW5zZXMiIGRjOnRpdGxlPSJ2aW0iIGRjOmRlc2NyaXB0aW9uPSJ2aW0iIGRjOnB1Ymxpc2hlcj0iSWNvbnNjb3V0IiBkYzpkYXRlPSIyMDE3LTA5LTI0IiBkYzpmb3JtYXQ9ImltYWdlL3N2Zyt4bWwiIGRjOmxhbmd1YWdlPSJlbiI+PGRjOmNyZWF0b3I+PHJkZjpCYWc+PHJkZjpsaT5Wb3JpbGxhejwvcmRmOmxpPjwvcmRmOkJhZz48L2RjOmNyZWF0b3I+PC9yZGY6RGVzY3JpcHRpb24+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PC9zdmc+');
      	     -webkit-mask-size: 22px 22px;
      	     width: 30px;
             margin-left: -25px;
      	    }
            .footer_footer .item_branch:before {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5IiBoZWlnaHQ9IjEyIiB2aWV3Qm94PSIwIDAgOSAxMiI+PHBhdGggZmlsbD0iIzAwMDAwMCIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNOSwzLjQyODU3NzQ2IEM5LDIuNDc3MTQ4ODggOC4xOTksMS43MTQyOTE3NCA3LjIsMS43MTQyOTE3NCBDNi4zODY5NDE5NCwxLjcxMjI0NTc4IDUuNjc0MTI3NDksMi4yMzEzMDI2NCA1LjQ2MzA1NjAyLDIuOTc5MDk4NzEgQzUuMjUxOTg0NTQsMy43MjY4OTQ3OCA1LjU5NTQ1MzE3LDQuNTE2Mzc3NDEgNi4zLDQuOTAyODYzMTcgTDYuMyw1LjE2MDAwNjAzIEM2LjI4Miw1LjYwNTcyMDMxIDYuMDkzLDYuMDAwMDA2MDMgNS43MzMsNi4zNDI4NjMxNyBDNS4zNzMsNi42ODU3MjAzMSA0Ljk1OSw2Ljg2NTcyMDMxIDQuNDkxLDYuODgyODYzMTcgQzMuNzQ0LDYuOTAwMDA2MDMgMy4xNTksNy4wMjAwMDYwMyAyLjY5MSw3LjI2ODU3NzQ2IEwyLjY5MSwzLjE4ODU3NzQ2IEMzLjM5NTU0NjgzLDIuODAyMDkxNyAzLjczOTAxNTQ2LDIuMDEyNjA5MDcgMy41Mjc5NDM5OCwxLjI2NDgxMjk5IEMzLjMxNjg3MjUxLDAuNTE3MDE2OTIzIDIuNjA0MDU4MDYsLTAuMDAyMDM5OTM0MTUgMS43OTEsNi4wMjY4NzM4NWUtMDYgQzAuNzkyLDYuMDI2ODczODVlLTA2IDkuOTkyMDA3MjJlLTE3LDAuNzYyODYzMTcgOS45OTIwMDcyMmUtMTcsMS43MTQyOTE3NCBDMC4wMDM4NTgyMzAyNiwyLjMyMzA1MzU2IDAuMzQ2NDE5ODM1LDIuODg0MjAyMDkgMC45LDMuMTg4NTc3NDYgTDAuOSw4LjgxMTQzNDYgQzAuMzY5LDkuMTExNDM0NiAwLDkuNjYwMDA2MDMgMCwxMC4yODU3MjAzIEMwLDExLjIzNzE0ODkgMC44MDEsMTIuMDAwMDA2IDEuOCwxMi4wMDAwMDYgQzIuNzk5LDEyLjAwMDAwNiAzLjYsMTEuMjM3MTQ4OSAzLjYsMTAuMjg1NzIwMyBDMy42LDkuODMxNDM0NiAzLjQyLDkuNDI4NTc3NDYgMy4xMjMsOS4xMjAwMDYwMyBDMy4yMDQsOS4wNjg1Nzc0NiAzLjU1NSw4Ljc2ODU3NzQ2IDMuNjU0LDguNzE3MTQ4ODggQzMuODc5LDguNjIyODYzMTcgNC4xNTgsOC41NzE0MzQ2IDQuNSw4LjU3MTQzNDYgQzUuNDQ1LDguNTI4NTc3NDYgNi4yNTUsOC4xODU3MjAzMSA2Ljk3NSw3LjUwMDAwNjAzIEM3LjY5NSw2LjgxNDI5MTc0IDguMDU1LDUuODAyODYzMTcgOC4xLDQuOTExNDM0NiBMOC4wODIsNC45MTE0MzQ2IEM4LjYzMSw0LjYwMjg2MzE3IDksNC4wNTQyOTE3NCA5LDMuNDI4NTc3NDYgTDksMy40Mjg1Nzc0NiBaIE0xLjgsMC42ODU3MjAzMTMgQzIuMzk0LDAuNjg1NzIwMzEzIDIuODgsMS4xNTcxNDg4OCAyLjg4LDEuNzE0MjkxNzQgQzIuODgsMi4yNzE0MzQ2IDIuMzg1LDIuNzQyODYzMTcgMS44LDIuNzQyODYzMTcgQzEuMjE1LDIuNzQyODYzMTcgMC43MiwyLjI3MTQzNDYgMC43MiwxLjcxNDI5MTc0IEMwLjcyLDEuMTU3MTQ4ODggMS4yMTUsMC42ODU3MjAzMTMgMS44LDAuNjg1NzIwMzEzIEwxLjgsMC42ODU3MjAzMTMgWiBNMS44LDExLjMyMjg2MzIgQzEuMjA2LDExLjMyMjg2MzIgMC43MiwxMC44NTE0MzQ2IDAuNzIsMTAuMjk0MjkxNyBDMC43Miw5LjczNzE0ODg4IDEuMjE1LDkuMjY1NzIwMzEgMS44LDkuMjY1NzIwMzEgQzIuMzg1LDkuMjY1NzIwMzEgMi44OCw5LjczNzE0ODg4IDIuODgsMTAuMjk0MjkxNyBDMi44OCwxMC44NTE0MzQ2IDIuMzg1LDExLjMyMjg2MzIgMS44LDExLjMyMjg2MzIgTDEuOCwxMS4zMjI4NjMyIFogTTcuMiw0LjQ2NTcyMDMxIEM2LjYwNiw0LjQ2NTcyMDMxIDYuMTIsMy45OTQyOTE3NCA2LjEyLDMuNDM3MTQ4ODggQzYuMTIsMi44ODAwMDYwMyA2LjYxNSwyLjQwODU3NzQ2IDcuMiwyLjQwODU3NzQ2IEM3Ljc4NSwyLjQwODU3NzQ2IDguMjgsMi44ODAwMDYwMyA4LjI4LDMuNDM3MTQ4ODggQzguMjgsMy45OTQyOTE3NCA3Ljc4NSw0LjQ2NTcyMDMxIDcuMiw0LjQ2NTcyMDMxIEw3LjIsNC40NjU3MjAzMSBaIi8+PC9zdmc+');
		            -webkit-mask-size: 14px 18px;
    		        margin-left: -2px;
            }
            .footer_footer .item_dirty {
                color: ${powerStatusLine.dirtyColor};
                padding-left: 15px;
            }
            .footer_footer .item_dirty:before {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMS4xNDI4NTcxLDAgTDAuODU3MTQyODU3LDAgQzAuMzg1NzE0Mjg2LDAgMCwwLjM4NTcxNDI4NiAwLDAuODU3MTQyODU3IEwwLDExLjE0Mjg1NzEgQzAsMTEuNjE0Mjg1NyAwLjM4NTcxNDI4NiwxMiAwLjg1NzE0Mjg1NywxMiBMMTEuMTQyODU3MSwxMiBDMTEuNjE0Mjg1NywxMiAxMiwxMS42MTQyODU3IDEyLDExLjE0Mjg1NzEgTDEyLDAuODU3MTQyODU3IEMxMiwwLjM4NTcxNDI4NiAxMS42MTQyODU3LDAgMTEuMTQyODU3MSwwIEwxMS4xNDI4NTcxLDAgWiBNMTEuMTQyODU3MSwxMS4xNDI4NTcxIEwwLjg1NzE0Mjg1NywxMS4xNDI4NTcxIEwwLjg1NzE0Mjg1NywwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwxMS4xNDI4NTcxIEwxMS4xNDI4NTcxLDExLjE0Mjg1NzEgWiBNMy40Mjg1NzE0Myw2IEMzLjQyODU3MTQzLDQuNTc3MTQyODYgNC41NzcxNDI4NiwzLjQyODU3MTQzIDYsMy40Mjg1NzE0MyBDNy40MjI4NTcxNCwzLjQyODU3MTQzIDguNTcxNDI4NTcsNC41NzcxNDI4NiA4LjU3MTQyODU3LDYgQzguNTcxNDI4NTcsNy40MjI4NTcxNCA3LjQyMjg1NzE0LDguNTcxNDI4NTcgNiw4LjU3MTQyODU3IEM0LjU3NzE0Mjg2LDguNTcxNDI4NTcgMy40Mjg1NzE0Myw3LjQyMjg1NzE0IDMuNDI4NTcxNDMsNiBMMy40Mjg1NzE0Myw2IFoiLz48L3N2Zz4=');
                -webkit-mask-size: 12px 12px;
                background-color: ${powerStatusLine.dirtyColor};
            }
            .footer_footer .item_ahead {
                color: ${powerStatusLine.aheadColor};
                padding-left: 15px;
            }
            .footer_footer .item_ahead:before {
                -webkit-mask-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgdmlld0JveD0iMCAwIDEyIDEyIj48cGF0aCBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01LjE0Mjg1NzE0LDYuODU3MTQyODYgTDIuNTcxNDI4NTcsNi44NTcxNDI4NiBMMi41NzE0Mjg1Nyw1LjE0Mjg1NzE0IEw1LjE0Mjg1NzE0LDUuMTQyODU3MTQgTDUuMTQyODU3MTQsMi41NzE0Mjg1NyBMOS40Mjg1NzE0Myw2IEw1LjE0Mjg1NzE0LDkuNDI4NTcxNDMgTDUuMTQyODU3MTQsNi44NTcxNDI4NiBMNS4xNDI4NTcxNCw2Ljg1NzE0Mjg2IFogTTEyLDAuODU3MTQyODU3IEwxMiwxMS4xNDI4NTcxIEMxMiwxMS42MTQyODU3IDExLjYxNDI4NTcsMTIgMTEuMTQyODU3MSwxMiBMMC44NTcxNDI4NTcsMTIgQzAuMzg1NzE0Mjg2LDEyIDAsMTEuNjE0Mjg1NyAwLDExLjE0Mjg1NzEgTDAsMC44NTcxNDI4NTcgQzAsMC4zODU3MTQyODYgMC4zODU3MTQyODYsMCAwLjg1NzE0Mjg1NywwIEwxMS4xNDI4NTcxLDAgQzExLjYxNDI4NTcsMCAxMiwwLjM4NTcxNDI4NiAxMiwwLjg1NzE0Mjg1NyBMMTIsMC44NTcxNDI4NTcgWiBNMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMC44NTcxNDI4NTcsMC44NTcxNDI4NTcgTDAuODU3MTQyODU3LDExLjE0Mjg1NzEgTDExLjE0Mjg1NzEsMTEuMTQyODU3MSBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBMMTEuMTQyODU3MSwwLjg1NzE0Mjg1NyBaIiB0cmFuc2Zvcm09Im1hdHJpeCgwIC0xIC0xIDAgMTIgMTIpIi8+PC9zdmc+');
                -webkit-mask-size: 12px 12px;
               background-color: ${powerStatusLine.aheadColor};
            }
            .notifications_view {
                bottom: 50px;
            }
	    .coins div {
	      display: inline-block;
	      margin: 0 0px 0 13px;
	    }
	    .coin_name {
	      margin-right: 5px;
	    }
	    .coin_price {
	      color: #afafaf
	    }
	    .coins {
	      padding-left: 15px;
	    }
	    `
    });
};
