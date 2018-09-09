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
    *)
        echo "Usage: $0 {vimrc|zshrc|slackrc|zsh-theme|vim-theme}"
        exit 1
        ;;
esac
