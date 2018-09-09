case "$1" in
    vimrc)
        echo "updating ~/.vimrc"
	cp ./configs/vimrc ~/.vimrc
        ;;
    zshrc)
        echo "updating ~/.zshrc"
	cp ./configs/zshrc ~/.zshrc
        ;;
    zsh-theme)
        echo "updating zshell theme"
	cp ./themes/matrix.zsh-theme ~/.oh-my-zsh/themes/matrix.zsh-theme
        ;;
    vim-theme)
        echo "updating vim theme"
        cp ./themes/matrix.vim ~/.vim/colors/matrix.vim
        ;;
    slackrc)
        echo "updating slackrc.js"
        cp ./themes/slackrc.js /Applications/Slack.app/Contents/Resources/app.asar.unpacked/src/static/ssb-interop.js
	;;
    powerstatus)
        echo "updating powerstatus plugin"
	cp ./plugins/power-status/index.js ~/.hyper_plugins/local/power-status/index.js
	cp ./plugins/power-status/render.js ~/.hyper_plugins/local/power-status/render.js
	cp ./plugins/power-status/package.json ~/.hyper_plugins/local/power-status/package.json
	echo "Finished updating - dont forget to do npm install in ~/.hyper_plugins/local/power-status"
        ;;
    hyper)
        echo "updating ~/.hyper.js"
	cp ./configs/hyper.js ~/.hyper.js
	;;
    *)
        echo "Usage: $0 {vimrc|zshrc|hyper|slackrc|zsh-theme|vim-theme|powerstatus}"
        exit 1
        ;;
esac
