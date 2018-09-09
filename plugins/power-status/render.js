class footer extends React.PureComponent {
  render() {
    return (
      <footer className="footer_footer">

      	<div className="footer_group group_overflow">
      	  <div className="component_component component_cwd">
      	    <div className="component_item item_icon item_cwd item_clickable"
      	    	 title={this.state.cwd}
      		     onClick={this.handleCwdClick}
      		     hidden={!this.state.cwd}>
      	         {this.state.cwd ? tildify(String(this.state.cwd)) : ''}
      	    </div>
      	  </div>
          <div className={`component_item item_icon item_branch ${this.state.remote ? 'item_clickable' : ''}`}
               title={this.state.remote}
         onClick={this.handleBranchClick}
         hidden={!this.state.branch}>
            {this.state.branch}
          </div>
          <div className="component_item item_icon item_number item_dirty"
    		 title={`${this.state.dirty} dirty ${this.state.dirty > 1 ? 'files' : 'file'}`}
		 hidden={!this.state.dirty}>
    	      {this.state.dirty}
    	    </div>
    	    <div className="component_item item_icon item_number item_ahead"
    		 title={`${this.state.ahead} ${this.state.ahead > 1 ? 'commits' : 'commit'} ahead`}
		 hidden={!this.state.ahead}>
    	      {this.state.ahead}
    	    </div>
          <div className="component_item item_icon item_coins">
	    <div className="coins">
	      {this.state.coins.map(this.renderCoin)}
	    </div>
          </div>
          <div className="component_item item_icon item_news marquee">
            <span className="source">{this.state.cnewsSource}</span>
            <span className="title"><a onClick={this.openLink} href={this.state.cnewsUrl}>{this.state.cnewsTitle}</a></span>
          </div>
      	</div>

      	<div className="footer_group group_overflow">
      	  <div className="component_component component_vim">
      		  <div className="component_item item_icon item_vim item_clickable"
      		       title="Vim Mode"
      		       onClick={this.handleVimClick}
      		       hidden={!this.state.visible}>
      		   Vim
      	      </div>
              <div className={`vim_helper ${!this.state.vimHelperVisible ? 'height-hidden' : ''}`}>
		            <div className="vim_title_container">
                  <div className="vim_title">Vim Menu</div>
                  <div className="closer" onClick={this.handleVimClick}>►</div>
                </div>
                <ul>
                  <li className="hint">File Search: <span>[esc] f</span></li>
                  <li className="hint">Keyword Search: <span>[esc] s</span></li>
                  <li className="hint">Dir Tree: <span>[esc] t</span></li>
                  <li onClick={this.openFilename}>Open {this.state.filename}</li>
                  <li onClick={this.openVimrc}>Open ~/.vimrc</li>
                </ul>
              </div>
      	  </div>
      	</div>

      </footer>
    );
  }
}
