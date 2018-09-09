# super-configs
I have customized my command line ( and other software ) for optimal productivity and kick-ass color schemes and decided to share it with the world.

**This repo contains:**
- my vimrc
- my zshrc
- my hyper config
- matrix theme for vim
- matrix theme for zsh
- matrix theme for slack
- my power-status plugin for hyper

if you want a kick-ass command-line that looks like this follow (Full Installation) instructions

![Command line preview](https://raw.githubusercontent.com/charbz/super-configs/master/images/prev1.png)

![Vim preview](https://raw.githubusercontent.com/charbz/super-configs/master/images/prev2.png)

# Full Installation

**Requirements**
*make sure you have the following installed*
- zsh
- oh-my-zsh
- hyper terminal

Clone this repo

```
git clone git@github.com:charbz/super-configs.git
```

Update zshrc ( make sure you keep a copy of your old ~/.zshrc first )

```
./update.zsh zshrc
./update.zsh zsh-theme
source ~/.zshrc
```

Update vimrc

```
./update.zsh vimrc
./update.zsh vim-theme
```

Install power-status plugin

```
./update.zsh powerstatus
cd ~/.hyper_plugins/local/power-status && npm install
```

Update .hyper.js

```
./update.zsh hyper
```

**Enjoy**
