" Name:       matrix.vim
" Version:    0.1.0
" Maintainer: github.com/charbz
" License:    The MIT License (MIT)
"
" A minimal colorscheme for Vim that only puts emphasis on the paramount.
"
" Based on the pencil and off colorschemes:
"
" https://github.com/reedes/vim-colors-pencil
" https://github.com/reedes/vim-colors-off
"
"""
hi clear

if exists('syntax on')
    syntax reset
endif

let g:colors_name='paramount'

let s:black		= { "gui": "#1c1c1c", "cterm": "234" }
let s:medium_gray	= { "gui": "#767676", "cterm": "243" }
let s:white		= { "gui": "#F1F1F1", "cterm": "15"  }
let s:actual_white	= { "gui": "#FFFFFF", "cterm": "231" }
let s:subtle_black	= { "gui": "#303030", "cterm": "235" }
let s:light_black	= { "gui": "#262626", "cterm": "235" }
let s:lighter_black	= { "gui": "#414141", "cterm": "240" }
let s:light_gray	= { "gui": "#A8A8A8", "cterm": "248" }
let s:lighter_gray	= { "gui": "#C6C6C6", "cterm": "251" }
let s:lightest_gray	= { "gui": "#EEEEEE", "cterm": "255" }
let s:pink		= { "gui": "#fb007a", "cterm": "9"   }
let s:dark_red		= { "gui": "#C30771", "cterm": "1"   }
let s:light_red		= { "gui": "#E32791", "cterm": "1"   }
let s:orange		= { "gui": "#d78700", "cterm": "172" }
let s:subtle_highlight	= { "gui": "#f49842", "cterm": "172" }
let s:darker_blue	= { "gui": "#005F87", "cterm": "18"  }
let s:dark_blue		= { "gui": "#008EC4", "cterm": "32"   }
let s:blue		= { "gui": "#20BBFC", "cterm": "12"  }
let s:light_blue	= { "gui": "#b6d6fd", "cterm": "153" }
let s:dark_cyan		= { "gui": "#20A5BA", "cterm": "6"   }
let s:light_cyan	= { "gui": "#4FB8CC", "cterm": "14"  }
let s:dark_green	= { "gui": "#5faf5f", "cterm": "22"  }
let s:light_green	= { "gui": "#00d78f", "cterm": "77"  }
let s:dark_purple	= { "gui": "#af5fd7", "cterm": "134" }
let s:light_purple	= { "gui": "#a790d5", "cterm": "140" }
let s:yellow		= { "gui": "#F3E430", "cterm": "11"  }
let s:light_yellow	= { "gui": "#ffff87", "cterm": "228" }
let s:dark_yellow	= { "gui": "#A89C14", "cterm": "72"   }

let s:g0    = { "gui": "#5faf5f", "cterm": "22"  }
let s:g1    = { "gui": "#5faf5f", "cterm": "36"  }
let s:g2    = { "gui": "#00d78f", "cterm": "41"  }
let s:g3    = { "gui": "#5faf5f", "cterm": "76"  }
let s:g4    = { "gui": "#00d78f", "cterm": "78"  }
let s:g5    = { "gui": "#000000", "cterm": "40"  }
let s:prim  = { "gui": "#222222", "cterm": "151" }
let s:spec  = { "gui": "#222222", "cterm": "145" }
let s:comm  = { "gui": "#222222", "cterm": "242" }
let s:kword = { "gui": "#444424", "cterm": "35"  }
let s:func  = { "gui": "#444424", "cterm": "77"  }
let s:str  = { "gui": "#444424", "cterm": "119"  }
let s:skey = { "gui": "#444444", "cterm": "35" }

let s:background = "dark"

let s:bg              = s:black
let s:bg_subtle       = s:lighter_black
let s:bg_very_subtle  = s:subtle_black
let s:norm            = s:lightest_gray
let s:norm_subtle     = s:light_gray
let s:purple          = s:light_purple
let s:cyan            = s:light_cyan
let s:green           = s:light_green
let s:red             = s:light_red
let s:visual          = s:dark_green
let s:yellow          = s:light_yellow

" https://github.com/noahfrederick/vim-hemisu/
function! s:h(group, style)
  execute "highlight" a:group
    \ "guifg="   (has_key(a:style, "fg")    ? a:style.fg.gui   : "NONE")
    \ "guibg="   (has_key(a:style, "bg")    ? a:style.bg.gui   : "NONE")
    \ "guisp="   (has_key(a:style, "sp")    ? a:style.sp.gui   : "NONE")
    \ "gui="     (has_key(a:style, "gui")   ? a:style.gui      : "NONE")
    \ "ctermfg=" (has_key(a:style, "fg")    ? a:style.fg.cterm : "NONE")
    \ "ctermbg=" (has_key(a:style, "bg")    ? a:style.bg.cterm : "NONE")
    \ "cterm="   (has_key(a:style, "cterm") ? a:style.cterm    : "NONE")
endfunction

call s:h("Normal",        {"bg": s:bg, "fg": s:norm})

" restore &background's value in case changing Normal changed &background (:help :hi-normal-cterm)
if &background != s:background
   execute "set background=" . s:background
endif

call s:h("Cursor",        {"bg": s:purple, "fg": s:norm })
call s:h("Comment",       {"fg": s:comm, "gui": "italic"})

call s:h("Orango",      {"fg": s:g1})
hi! link jsGlobal         Orango

call s:h("Constant",      {"fg": s:str})
hi! link String           Constant
hi! link Character        Constant

call s:h("Primitive",     {"fg": s:prim})
hi! link Number           Primitive
hi! link Boolean          Primitive
hi! link Float            Primitive

call s:h("Identifier",    {"fg": s:dark_blue})
hi! link Identifier       Orango

call s:h("Function",      {"fg": s:func})
hi! link Function         Function

call s:h("Statement",     {"fg": s:kword})
hi! link Conditonal       Statement
hi! link Repeat           Statement
hi! link Label            Statement
hi! link Keyword          Statement
hi! link Exception        Statement

call s:h("Operator",      {"fg": s:norm, "cterm": "bold", "gui": "bold"})

call s:h("PreProc",     {"fg": s:g1})
hi! link Include          PreProc
hi! link Define           PreProc
hi! link Macro            PreProc
hi! link PreCondit        PreProc
hi! link Tag              PreProc
hi! link Delimiter        PreProc
hi! link SpecialComment   PreProc
hi! link Debug            PreProc

call s:h("Type",          {"fg": s:kword})
hi! link StorageClass     Type
hi! link Structure        Type
hi! link Typedef          Type

call s:h("Special",       {"fg": s:spec, "gui": "italic"})
hi! link SpecialChar      Special

call s:h("Underlined",    {"fg": s:norm, "gui": "underline", "cterm": "underline"})
call s:h("Ignore",        {"fg": s:bg})
call s:h("Error",         {"fg": s:actual_white, "bg": s:subtle_highlight, "cterm": "bold"})
call s:h("Todo",          {"fg": s:purple, "gui": "underline", "cterm": "underline"})
call s:h("SpecialKey",    {"fg": s:light_green})
call s:h("NonText",       {"fg": s:medium_gray})
call s:h("Directory",     {"fg": s:g4})
call s:h("ErrorMsg",      {"fg": s:red})
call s:h("IncSearch",     {"bg": s:orange, "fg": s:white})
call s:h("Search",        {"bg": s:dark_green, "fg": s:white})
call s:h("MoreMsg",       {"fg": s:medium_gray, "cterm": "bold", "gui": "bold"})
hi! link ModeMsg MoreMsg
call s:h("LineNr",        {"fg": s:subtle_black})
call s:h("CursorLineNr",  {"fg": s:purple, "bg": s:bg_very_subtle})
call s:h("Question",      {"fg": s:red})
call s:h("StatusLine",    {"bg": s:bg_very_subtle})
call s:h("StatusLineNC",  {"bg": s:bg_very_subtle, "fg": s:medium_gray})
call s:h("VertSplit",     {"bg": s:bg_very_subtle, "fg": s:bg_very_subtle})
call s:h("Title",         {"fg": s:g2})
call s:h("Visual",        {"fg": s:norm, "bg": s:visual})
call s:h("VisualNOS",     {"bg": s:bg_subtle})
call s:h("WarningMsg",    {"fg": s:yellow})
call s:h("WildMenu",      {"fg": s:bg, "bg": s:norm})
call s:h("Folded",        {"fg": s:medium_gray})
call s:h("FoldColumn",    {"fg": s:bg_subtle})
call s:h("DiffAdd",       {"fg": s:green})
call s:h("DiffDelete",    {"fg": s:red})
call s:h("DiffChange",    {"fg": s:dark_yellow})
call s:h("DiffText",      {"fg": s:dark_blue})
call s:h("SignColumn",    {"fg": s:light_green})


if has("gui_running")
  call s:h("SpellBad",    {"gui": "underline", "sp": s:red})
  call s:h("SpellCap",    {"gui": "underline", "sp": s:light_green})
  call s:h("SpellRare",   {"gui": "underline", "sp": s:pink})
  call s:h("SpellLocal",  {"gui": "underline", "sp": s:dark_green})
else
  call s:h("SpellBad",    {"cterm": "underline", "fg": s:red})
  call s:h("SpellCap",    {"cterm": "underline", "fg": s:light_green})
  call s:h("SpellRare",   {"cterm": "underline", "fg": s:pink})
  call s:h("SpellLocal",  {"cterm": "underline", "fg": s:dark_green})
endif

call s:h("Pmenu",         {"fg": s:norm, "bg": s:bg_subtle})
call s:h("PmenuSel",      {"fg": s:norm, "bg": s:purple})
call s:h("PmenuSbar",     {"fg": s:norm, "bg": s:bg_subtle})
call s:h("PmenuThumb",    {"fg": s:norm, "bg": s:bg_subtle})
call s:h("TabLine",       {"fg": s:norm, "bg": s:bg_very_subtle})
call s:h("TabLineSel",    {"fg": s:purple, "bg": s:bg_subtle, "gui": "bold", "cterm": "bold"})
call s:h("TabLineFill",   {"fg": s:norm, "bg": s:bg_very_subtle})
call s:h("CursorColumn",  {"bg": s:bg_very_subtle})
call s:h("CursorLine",    {"bg": s:bg_very_subtle})
call s:h("ColorColumn",   {"bg": s:bg_subtle})

call s:h("MatchParen",    {"bg": s:bg_subtle, "fg": s:norm})
call s:h("qfLineNr",      {"fg": s:subtle_black})

call s:h("htmlH1",        {"bg": s:bg, "fg": s:norm})
call s:h("htmlH2",        {"bg": s:bg, "fg": s:norm})
call s:h("htmlH3",        {"bg": s:bg, "fg": s:norm})
call s:h("htmlH4",        {"bg": s:bg, "fg": s:norm})
call s:h("htmlH5",        {"bg": s:bg, "fg": s:norm})
call s:h("htmlH6",        {"bg": s:bg, "fg": s:norm})

" Synatastic
call s:h("SyntasticWarningSign",    {"fg": s:yellow})
call s:h("SyntasticWarning",        {"bg": s:yellow, "fg": s:black, "gui": "bold", "cterm": "bold"})
call s:h("SyntasticErrorSign",      {"fg": s:red})
call s:h("SyntasticError",          {"bg": s:subtle_highlight, "fg": s:white, "gui": "bold", "cterm": "bold"})

" Neomake
hi link NeomakeWarningSign	SyntasticWarningSign
hi link NeomakeErrorSign	SyntasticErrorSign

" ALE
hi link ALEWarningSign	SyntasticWarningSign
hi link ALEErrorSign	SyntasticErrorSign

" Signify, git-gutter
hi link SignifySignAdd              LineNr
hi link SignifySignDelete           LineNr
hi link SignifySignChange           LineNr
hi link GitGutterAdd                LineNr
hi link GitGutterDelete             LineNr
hi link GitGutterChange             LineNr
hi link GitGutterChangeDelete       LineNr
