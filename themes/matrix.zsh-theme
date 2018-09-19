#######################
# Global definitions
#######################

SEGMENT_SEPARATOR=$'\ue0b0'

#######################
# Expose 256 Colors
#######################

typeset -Ag FX FG BG

FX=(
    reset     "[00m"
    bold      "[01m" no-bold      "[22m"
    italic    "[03m" no-italic    "[23m"
    underline "[04m" no-underline "[24m"
    blink     "[05m" no-blink     "[25m"
    reverse   "[07m" no-reverse   "[27m"
)

local SUPPORT

if (( $# == 0 )); then
    SUPPORT=256
else
    SUPPORT=$1
fi

for color in {000..$SUPPORT}; do
    FG[$color]="[38;5;${color}m"
    BG[$color]="[48;5;${color}m"
done

####################
# Customize PROMPT 
####################

#PS1="%{$BG[236]$FG[012]%} Charb %{$reset_color%}%{$BG[236]$FG[239]%}$SEGMENT_SEPARATOR%{$reset_color%}%{$BG[236]$FG[107]%} [ %D %t ] %{$reset_color%}%{$BG[236]$FG[239]%}$SEGMENT_SEPARATOR%{$BG[236]$FG[012]%} %~ %{$reset_color%}%{$FG[236]%}$SEGMENT_SEPARATOR%{$reset_color%}%  %{$FG[012]%}λ%{$reset_color%} "

PS1="%{$BG[236]$FG[012]%} Charb %{$reset_color%}%{$BG[236]$FG[239]%}$SEGMENT_SEPARATOR%{$reset_color%}%{$BG[236]$FG[107]%} [ %D %t ] %{$reset_color%}%{$BG[236]$FG[239]%}$SEGMENT_SEPARATOR%{$BG[236]$FG[012]%} %~ %{$reset_color%}%{$FG[236]%}$SEGMENT_SEPARATOR%{$reset_color%}%  "

########################
# Enable Colors for LS 
########################

autoload -U colors && colors
alias ls="ls -GFh"
export LSCOLORS=cxhcbxdxCxagedabagacad
