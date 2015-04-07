var React = require('react'),
  AutosuggestItem = require('./AutosuggestItem.jsx'),
  superagent = require('superagent'),
  superagentJSONP = require('superagent-jsonp');

superagentJSONP(superagent);
  

var Autosuggest = React.createClass({
  /**
   * Get the default props
   * @return {Object} The state
   */
  getDefaultProps: function() {
    return {
      fixtures: [],
      placeholder: 'Search',
      onSuggestSelect: function() {},
      jsonp: 'false',
      url:'',
      minChars: 3
    };
  },

  /**
   * Get the initial state
   * @return {Object} The state
   */
  getInitialState: function() {
    return {
      isSuggestsHidden: true,
      userInput: '',
      activeSuggest: null,
      suggests: [],
    };
  },

  /**
   * When the input got changed
   */
  onInputChange: function() {
    var userInput = this.refs.autosuggestInput.getDOMNode().value;
    this.props.queryString = userInput;
    this.setState({userInput: userInput}, function() {
      if (!userInput) {
        this.updateSuggests();
      }
    }.bind(this));

    if (!userInput || userInput.length < this.props.minChars) {
      return;
    }

    if(this.props.jsonp === 'true'){
      var self = this;
      superagent.get(this.props.url)
        .query({'q':userInput })
        .jsonp()
        .end(function(response){
          self.updateSuggests(response);
        })
    }else{
       superagent.get(this.props.url)
        .query({'q': userInput })
        .send()
        .end(function(response){
          self.updateSuggests(response);
        })
    }
  },

  /**
   * Update the suggests
   * @param  {Object}  suggestsData The new suggested data
   */
  updateSuggests: function(suggestsData) {
    if (!suggestsData) {
      suggestsData = [];
    }

    var suggests = [],
      regex = new RegExp(this.state.userInput, 'gim'),
      suggestItems;

    this.props.fixtures.forEach(function(suggest) {
      if (suggest.label.match(regex)) {
        suggest.placeId = suggest.label;
        suggests.push(suggest);
      }
    }.bind(this));

    suggestsData.forEach(function(suggest) {
      suggests.push({
        label: suggest,
        placeId: suggest
      });
    }.bind(this));

    this.setState({suggests: suggests});
  },

  /**
   * When the input gets focused
   * @param  {Event} event The focus event
   */
  showSuggests: function(event) {
    this.updateSuggests();

    this.setState({isSuggestsHidden: false});
  },

  /**
   * When the input loses focused
   * @param  {Event} event The focus event
   */
  hideSuggests: function(event) {
    setTimeout(function() {
      this.setState({isSuggestsHidden: true});
    }.bind(this), 100);
  },

  /**
   * When a key gets pressed in the input
   * @param  {Event} event The keypress event
   */
  onInputKeyDown: function(event) {
    switch (event.which) {
      case 40: // DOWN
        event.preventDefault();
        this.activateSuggest('next');
        break;
      case 38: // UP
        event.preventDefault();
        this.activateSuggest('prev');
        break;
      case 13: // ENTER
        this.selectSuggest(this.state.activeSuggest);
        break;
      case 9: // TAB
        this.selectSuggest(this.state.activeSuggest);
        break;
      case 27: // ESC
        this.hideSuggests();
        break;
    }
  },

  /**
   * Activate a new suggest
   * @param {String} direction The direction in which to activate new suggest
   */
  activateSuggest: function(direction) {
    var suggestsCount = this.state.suggests.length - 1,
      next = direction === ('next'),
      newActiveSuggest = null,
      newIndex = 0,
      i = 0;

    for (i; i <= suggestsCount; i++) {
      if (this.state.suggests[i] === this.state.activeSuggest) {
        newIndex = next ? i + 1 : i - 1;
      }
    }

    if (!this.state.activeSuggest) {
      newIndex = next ? 0 : suggestsCount;
    }

    if (newIndex >= 0 && newIndex <= suggestsCount) {
      newActiveSuggest = this.state.suggests[newIndex];
    }

    this.setState({activeSuggest: newActiveSuggest});
  },

  /**
   * When an item got selected
   * @param {AutosuggestItem} suggest The selected suggest item
   */
  selectSuggest: function(suggest) {
    if (!suggest) {
      suggest = {
        label: this.state.userInput
      };
    }

    this.setState({
      isSuggestsHidden: true,
      userInput: suggest.label
    });
  },


  /**
   * Render the view
   */
  render: function() {
    return (
      <div className="autosuggest" onClick={this.onClick}>
        <input
          className="autosuggest__input"
          ref="autosuggestInput"
          type="text"
          value={this.state.userInput}
          placeholder={this.props.placeholder}
          onKeyDown={this.onInputKeyDown}
          onChange={this.onInputChange}
          onFocus={this.showSuggests}
          onBlur={this.hideSuggests} />
        <ul className={this.getSuggestsClasses()}>
          {this.getSuggestItems()}
        </ul>
      </div>
    );
  },

  /**
   * Get the suggest items for the list
   * @return {Array} The suggestions
   */
  getSuggestItems: function() {
    return this.state.suggests.map(function(suggest) {
      var isActive = (this.state.activeSuggest &&
        suggest.placeId === this.state.activeSuggest.placeId);

      return (
        <AutosuggestItem
          key={suggest.placeId}
          suggest={suggest}
          isActive={isActive}
          onSuggestSelect={this.selectSuggest} />
      );
    }.bind(this));
  },

  /**
   * The classes for the suggests list
   * @return {String} The classes
   */
  getSuggestsClasses: function() {
    var classes = 'autosuggest__suggests'

    classes += this.state.isSuggestsHidden ?
      ' autosuggest__suggests--hidden' : '';

    return classes;
  }
});

module.exports = Autosuggest;
