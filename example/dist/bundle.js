require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var React = require('react');

var AutosuggestItem = React.createClass({displayName: "AutosuggestItem",
  /**
   * Get the default props
   * @return {Object} The props
   */
  getDefaultProps: function() {
    return {
      isActive: false,
      suggest: {
        label: ''
      },
      onSuggestSelect: function() {}
    };
  },

  /**
   * When the element gets clicked
   * @param  {Event} event The click event
   */
  onClick: function(event) {
    event.preventDefault();
    this.props.onSuggestSelect(this.props.suggest);
  },

  /**
   * Render the view
   */
  render: function() {
    return (
      React.createElement("li", {className: this.getSuggestClasses(), 
        onClick: this.onClick}, 
          this.props.suggest.label
      )
    );
  },

  /**
   * The classes for the suggest item
   * @return {String} The classes
   */
  getSuggestClasses: function() {
    var classes = 'autosuggest-item';

    classes += this.props.isActive ? ' autosuggest-item--active' : '';

    return classes;
  }
});

module.exports = AutosuggestItem;


},{"react":undefined}],"Haribabu":[function(require,module,exports){
var React = require('react'),
  AutosuggestItem = require('./AutosuggestItem.jsx'),
  superagent = require('superagent'),
  superagentJSONP = require('superagent-jsonp');

superagentJSONP(superagent);
  

var Autosuggest = React.createClass({displayName: "Autosuggest",
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
      React.createElement("div", {className: "autosuggest", onClick: this.onClick}, 
        React.createElement("input", {
          className: "autosuggest__input", 
          ref: "autosuggestInput", 
          type: "text", 
          value: this.state.userInput, 
          placeholder: this.props.placeholder, 
          onKeyDown: this.onInputKeyDown, 
          onChange: this.onInputChange, 
          onFocus: this.showSuggests, 
          onBlur: this.hideSuggests}), 
        React.createElement("ul", {className: this.getSuggestsClasses()}, 
          this.getSuggestItems()
        )
      )
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
        React.createElement(AutosuggestItem, {
          key: suggest.placeId, 
          suggest: suggest, 
          isActive: isActive, 
          onSuggestSelect: this.selectSuggest})
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


},{"./AutosuggestItem.jsx":1,"react":undefined,"superagent":undefined,"superagent-jsonp":undefined}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC1jb21wb25lbnQtZ3VscC10YXNrcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvaGFyaWJhYnV2aXN3YW5hdGgvcmVhY3QtYXV0b3N1Z2dlc3Qvc3JjL0F1dG9zdWdnZXN0SXRlbS5qc3giLCIvaG9tZS9oYXJpYmFidXZpc3dhbmF0aC9yZWFjdC1hdXRvc3VnZ2VzdC9zcmMvQXV0b3N1Z2dlc3QuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU3QixJQUFJLHFDQUFxQywrQkFBQTtBQUN6QztBQUNBO0FBQ0E7O0VBRUUsZUFBZSxFQUFFLFdBQVc7SUFDMUIsT0FBTztNQUNMLFFBQVEsRUFBRSxLQUFLO01BQ2YsT0FBTyxFQUFFO1FBQ1AsS0FBSyxFQUFFLEVBQUU7T0FDVjtNQUNELGVBQWUsRUFBRSxXQUFXLEVBQUU7S0FDL0IsQ0FBQztBQUNOLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7RUFFRSxPQUFPLEVBQUUsU0FBUyxLQUFLLEVBQUU7SUFDdkIsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsR0FBRztBQUNIO0FBQ0E7QUFDQTs7RUFFRSxNQUFNLEVBQUUsV0FBVztJQUNqQjtNQUNFLG9CQUFBLElBQUcsRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUM7UUFDdEMsT0FBQSxFQUFPLENBQUUsSUFBSSxDQUFDLE9BQVMsQ0FBQSxFQUFBO1VBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQU07TUFDekIsQ0FBQTtNQUNMO0FBQ04s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QUEsRUFBUSxDQUFFLFFBQVEsRUFBQztVQUNuQixlQUFBLEVBQWUsQ0FBRSxJQUFJLENBQUMsYUFBYyxDQUFBLENBQUcsQ0FBQTtRQUN6QztLQUNILENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDbEIsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOztFQUVFLGtCQUFrQixFQUFFLFdBQVc7QUFDakMsSUFBSSxJQUFJLE9BQU8sR0FBRyx1QkFBdUI7O0lBRXJDLE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQjtBQUMxQyxNQUFNLGdDQUFnQyxHQUFHLEVBQUUsQ0FBQzs7SUFFeEMsT0FBTyxPQUFPLENBQUM7R0FDaEI7QUFDSCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgQXV0b3N1Z2dlc3RJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAvKipcbiAgICogR2V0IHRoZSBkZWZhdWx0IHByb3BzXG4gICAqIEByZXR1cm4ge09iamVjdH0gVGhlIHByb3BzXG4gICAqL1xuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpc0FjdGl2ZTogZmFsc2UsXG4gICAgICBzdWdnZXN0OiB7XG4gICAgICAgIGxhYmVsOiAnJ1xuICAgICAgfSxcbiAgICAgIG9uU3VnZ2VzdFNlbGVjdDogZnVuY3Rpb24oKSB7fVxuICAgIH07XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIGVsZW1lbnQgZ2V0cyBjbGlja2VkXG4gICAqIEBwYXJhbSAge0V2ZW50fSBldmVudCBUaGUgY2xpY2sgZXZlbnRcbiAgICovXG4gIG9uQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLnByb3BzLm9uU3VnZ2VzdFNlbGVjdCh0aGlzLnByb3BzLnN1Z2dlc3QpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZW5kZXIgdGhlIHZpZXdcbiAgICovXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxsaSBjbGFzc05hbWU9e3RoaXMuZ2V0U3VnZ2VzdENsYXNzZXMoKX1cbiAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrfT5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5zdWdnZXN0LmxhYmVsfVxuICAgICAgPC9saT5cbiAgICApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBUaGUgY2xhc3NlcyBmb3IgdGhlIHN1Z2dlc3QgaXRlbVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBjbGFzc2VzXG4gICAqL1xuICBnZXRTdWdnZXN0Q2xhc3NlczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNsYXNzZXMgPSAnYXV0b3N1Z2dlc3QtaXRlbSc7XG5cbiAgICBjbGFzc2VzICs9IHRoaXMucHJvcHMuaXNBY3RpdmUgPyAnIGF1dG9zdWdnZXN0LWl0ZW0tLWFjdGl2ZScgOiAnJztcblxuICAgIHJldHVybiBjbGFzc2VzO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdXRvc3VnZ2VzdEl0ZW07XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpLFxuICBBdXRvc3VnZ2VzdEl0ZW0gPSByZXF1aXJlKCcuL0F1dG9zdWdnZXN0SXRlbS5qc3gnKSxcbiAgc3VwZXJhZ2VudCA9IHJlcXVpcmUoJ3N1cGVyYWdlbnQnKSxcbiAgc3VwZXJhZ2VudEpTT05QID0gcmVxdWlyZSgnc3VwZXJhZ2VudC1qc29ucCcpO1xuXG5zdXBlcmFnZW50SlNPTlAoc3VwZXJhZ2VudCk7XG4gIFxuXG52YXIgQXV0b3N1Z2dlc3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIC8qKlxuICAgKiBHZXQgdGhlIGRlZmF1bHQgcHJvcHNcbiAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgc3RhdGVcbiAgICovXG4gIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZpeHR1cmVzOiBbXSxcbiAgICAgIHBsYWNlaG9sZGVyOiAnU2VhcmNoJyxcbiAgICAgIG9uU3VnZ2VzdFNlbGVjdDogZnVuY3Rpb24oKSB7fSxcbiAgICAgIGpzb25wOiAnZmFsc2UnLFxuICAgICAgdXJsOicnLFxuICAgICAgbWluQ2hhcnM6IDNcbiAgICB9O1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGluaXRpYWwgc3RhdGVcbiAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgc3RhdGVcbiAgICovXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlzU3VnZ2VzdHNIaWRkZW46IHRydWUsXG4gICAgICB1c2VySW5wdXQ6ICcnLFxuICAgICAgYWN0aXZlU3VnZ2VzdDogbnVsbCxcbiAgICAgIHN1Z2dlc3RzOiBbXSxcbiAgICB9O1xuICB9LFxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBpbnB1dCBnb3QgY2hhbmdlZFxuICAgKi9cbiAgb25JbnB1dENoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVzZXJJbnB1dCA9IHRoaXMucmVmcy5hdXRvc3VnZ2VzdElucHV0LmdldERPTU5vZGUoKS52YWx1ZTtcbiAgICB0aGlzLnByb3BzLnF1ZXJ5U3RyaW5nID0gdXNlcklucHV0O1xuICAgIHRoaXMuc2V0U3RhdGUoe3VzZXJJbnB1dDogdXNlcklucHV0fSwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXVzZXJJbnB1dCkge1xuICAgICAgICB0aGlzLnVwZGF0ZVN1Z2dlc3RzKCk7XG4gICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIGlmICghdXNlcklucHV0IHx8IHVzZXJJbnB1dC5sZW5ndGggPCB0aGlzLnByb3BzLm1pbkNoYXJzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYodGhpcy5wcm9wcy5qc29ucCA9PT0gJ3RydWUnKXtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHN1cGVyYWdlbnQuZ2V0KHRoaXMucHJvcHMudXJsKVxuICAgICAgICAucXVlcnkoeydxJzp1c2VySW5wdXQgfSlcbiAgICAgICAgLmpzb25wKClcbiAgICAgICAgLmVuZChmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgICAgc2VsZi51cGRhdGVTdWdnZXN0cyhyZXNwb25zZSk7XG4gICAgICAgIH0pXG4gICAgfWVsc2V7XG4gICAgICAgc3VwZXJhZ2VudC5nZXQodGhpcy5wcm9wcy51cmwpXG4gICAgICAgIC5xdWVyeSh7J3EnOiB1c2VySW5wdXQgfSlcbiAgICAgICAgLnNlbmQoKVxuICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgICBzZWxmLnVwZGF0ZVN1Z2dlc3RzKHJlc3BvbnNlKTtcbiAgICAgICAgfSlcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgc3VnZ2VzdHNcbiAgICogQHBhcmFtICB7T2JqZWN0fSAgc3VnZ2VzdHNEYXRhIFRoZSBuZXcgc3VnZ2VzdGVkIGRhdGFcbiAgICovXG4gIHVwZGF0ZVN1Z2dlc3RzOiBmdW5jdGlvbihzdWdnZXN0c0RhdGEpIHtcbiAgICBpZiAoIXN1Z2dlc3RzRGF0YSkge1xuICAgICAgc3VnZ2VzdHNEYXRhID0gW107XG4gICAgfVxuXG4gICAgdmFyIHN1Z2dlc3RzID0gW10sXG4gICAgICByZWdleCA9IG5ldyBSZWdFeHAodGhpcy5zdGF0ZS51c2VySW5wdXQsICdnaW0nKSxcbiAgICAgIHN1Z2dlc3RJdGVtcztcblxuICAgIHRoaXMucHJvcHMuZml4dHVyZXMuZm9yRWFjaChmdW5jdGlvbihzdWdnZXN0KSB7XG4gICAgICBpZiAoc3VnZ2VzdC5sYWJlbC5tYXRjaChyZWdleCkpIHtcbiAgICAgICAgc3VnZ2VzdC5wbGFjZUlkID0gc3VnZ2VzdC5sYWJlbDtcbiAgICAgICAgc3VnZ2VzdHMucHVzaChzdWdnZXN0KTtcbiAgICAgIH1cbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgc3VnZ2VzdHNEYXRhLmZvckVhY2goZnVuY3Rpb24oc3VnZ2VzdCkge1xuICAgICAgc3VnZ2VzdHMucHVzaCh7XG4gICAgICAgIGxhYmVsOiBzdWdnZXN0LFxuICAgICAgICBwbGFjZUlkOiBzdWdnZXN0XG4gICAgICB9KTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7c3VnZ2VzdHM6IHN1Z2dlc3RzfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIGlucHV0IGdldHMgZm9jdXNlZFxuICAgKiBAcGFyYW0gIHtFdmVudH0gZXZlbnQgVGhlIGZvY3VzIGV2ZW50XG4gICAqL1xuICBzaG93U3VnZ2VzdHM6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy51cGRhdGVTdWdnZXN0cygpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7aXNTdWdnZXN0c0hpZGRlbjogZmFsc2V9KTtcbiAgfSxcblxuICAvKipcbiAgICogV2hlbiB0aGUgaW5wdXQgbG9zZXMgZm9jdXNlZFxuICAgKiBAcGFyYW0gIHtFdmVudH0gZXZlbnQgVGhlIGZvY3VzIGV2ZW50XG4gICAqL1xuICBoaWRlU3VnZ2VzdHM6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2lzU3VnZ2VzdHNIaWRkZW46IHRydWV9KTtcbiAgICB9LmJpbmQodGhpcyksIDEwMCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFdoZW4gYSBrZXkgZ2V0cyBwcmVzc2VkIGluIHRoZSBpbnB1dFxuICAgKiBAcGFyYW0gIHtFdmVudH0gZXZlbnQgVGhlIGtleXByZXNzIGV2ZW50XG4gICAqL1xuICBvbklucHV0S2V5RG93bjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBzd2l0Y2ggKGV2ZW50LndoaWNoKSB7XG4gICAgICBjYXNlIDQwOiAvLyBET1dOXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVTdWdnZXN0KCduZXh0Jyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzODogLy8gVVBcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZVN1Z2dlc3QoJ3ByZXYnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDEzOiAvLyBFTlRFUlxuICAgICAgICB0aGlzLnNlbGVjdFN1Z2dlc3QodGhpcy5zdGF0ZS5hY3RpdmVTdWdnZXN0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDk6IC8vIFRBQlxuICAgICAgICB0aGlzLnNlbGVjdFN1Z2dlc3QodGhpcy5zdGF0ZS5hY3RpdmVTdWdnZXN0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI3OiAvLyBFU0NcbiAgICAgICAgdGhpcy5oaWRlU3VnZ2VzdHMoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZSBhIG5ldyBzdWdnZXN0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBkaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiBpbiB3aGljaCB0byBhY3RpdmF0ZSBuZXcgc3VnZ2VzdFxuICAgKi9cbiAgYWN0aXZhdGVTdWdnZXN0OiBmdW5jdGlvbihkaXJlY3Rpb24pIHtcbiAgICB2YXIgc3VnZ2VzdHNDb3VudCA9IHRoaXMuc3RhdGUuc3VnZ2VzdHMubGVuZ3RoIC0gMSxcbiAgICAgIG5leHQgPSBkaXJlY3Rpb24gPT09ICgnbmV4dCcpLFxuICAgICAgbmV3QWN0aXZlU3VnZ2VzdCA9IG51bGwsXG4gICAgICBuZXdJbmRleCA9IDAsXG4gICAgICBpID0gMDtcblxuICAgIGZvciAoaTsgaSA8PSBzdWdnZXN0c0NvdW50OyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLnN1Z2dlc3RzW2ldID09PSB0aGlzLnN0YXRlLmFjdGl2ZVN1Z2dlc3QpIHtcbiAgICAgICAgbmV3SW5kZXggPSBuZXh0ID8gaSArIDEgOiBpIC0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuYWN0aXZlU3VnZ2VzdCkge1xuICAgICAgbmV3SW5kZXggPSBuZXh0ID8gMCA6IHN1Z2dlc3RzQ291bnQ7XG4gICAgfVxuXG4gICAgaWYgKG5ld0luZGV4ID49IDAgJiYgbmV3SW5kZXggPD0gc3VnZ2VzdHNDb3VudCkge1xuICAgICAgbmV3QWN0aXZlU3VnZ2VzdCA9IHRoaXMuc3RhdGUuc3VnZ2VzdHNbbmV3SW5kZXhdO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe2FjdGl2ZVN1Z2dlc3Q6IG5ld0FjdGl2ZVN1Z2dlc3R9KTtcbiAgfSxcblxuICAvKipcbiAgICogV2hlbiBhbiBpdGVtIGdvdCBzZWxlY3RlZFxuICAgKiBAcGFyYW0ge0F1dG9zdWdnZXN0SXRlbX0gc3VnZ2VzdCBUaGUgc2VsZWN0ZWQgc3VnZ2VzdCBpdGVtXG4gICAqL1xuICBzZWxlY3RTdWdnZXN0OiBmdW5jdGlvbihzdWdnZXN0KSB7XG4gICAgaWYgKCFzdWdnZXN0KSB7XG4gICAgICBzdWdnZXN0ID0ge1xuICAgICAgICBsYWJlbDogdGhpcy5zdGF0ZS51c2VySW5wdXRcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBpc1N1Z2dlc3RzSGlkZGVuOiB0cnVlLFxuICAgICAgdXNlcklucHV0OiBzdWdnZXN0LmxhYmVsXG4gICAgfSk7XG4gIH0sXG5cblxuICAvKipcbiAgICogUmVuZGVyIHRoZSB2aWV3XG4gICAqL1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImF1dG9zdWdnZXN0XCIgb25DbGljaz17dGhpcy5vbkNsaWNrfT5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgY2xhc3NOYW1lPVwiYXV0b3N1Z2dlc3RfX2lucHV0XCJcbiAgICAgICAgICByZWY9XCJhdXRvc3VnZ2VzdElucHV0XCJcbiAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudXNlcklucHV0fVxuICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgIG9uS2V5RG93bj17dGhpcy5vbklucHV0S2V5RG93bn1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbklucHV0Q2hhbmdlfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMuc2hvd1N1Z2dlc3RzfVxuICAgICAgICAgIG9uQmx1cj17dGhpcy5oaWRlU3VnZ2VzdHN9IC8+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9e3RoaXMuZ2V0U3VnZ2VzdHNDbGFzc2VzKCl9PlxuICAgICAgICAgIHt0aGlzLmdldFN1Z2dlc3RJdGVtcygpfVxuICAgICAgICA8L3VsPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0IHRoZSBzdWdnZXN0IGl0ZW1zIGZvciB0aGUgbGlzdFxuICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIHN1Z2dlc3Rpb25zXG4gICAqL1xuICBnZXRTdWdnZXN0SXRlbXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnN1Z2dlc3RzLm1hcChmdW5jdGlvbihzdWdnZXN0KSB7XG4gICAgICB2YXIgaXNBY3RpdmUgPSAodGhpcy5zdGF0ZS5hY3RpdmVTdWdnZXN0ICYmXG4gICAgICAgIHN1Z2dlc3QucGxhY2VJZCA9PT0gdGhpcy5zdGF0ZS5hY3RpdmVTdWdnZXN0LnBsYWNlSWQpO1xuXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8QXV0b3N1Z2dlc3RJdGVtXG4gICAgICAgICAga2V5PXtzdWdnZXN0LnBsYWNlSWR9XG4gICAgICAgICAgc3VnZ2VzdD17c3VnZ2VzdH1cbiAgICAgICAgICBpc0FjdGl2ZT17aXNBY3RpdmV9XG4gICAgICAgICAgb25TdWdnZXN0U2VsZWN0PXt0aGlzLnNlbGVjdFN1Z2dlc3R9IC8+XG4gICAgICApO1xuICAgIH0uYmluZCh0aGlzKSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRoZSBjbGFzc2VzIGZvciB0aGUgc3VnZ2VzdHMgbGlzdFxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBjbGFzc2VzXG4gICAqL1xuICBnZXRTdWdnZXN0c0NsYXNzZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjbGFzc2VzID0gJ2F1dG9zdWdnZXN0X19zdWdnZXN0cydcblxuICAgIGNsYXNzZXMgKz0gdGhpcy5zdGF0ZS5pc1N1Z2dlc3RzSGlkZGVuID9cbiAgICAgICcgYXV0b3N1Z2dlc3RfX3N1Z2dlc3RzLS1oaWRkZW4nIDogJyc7XG5cbiAgICByZXR1cm4gY2xhc3NlcztcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXV0b3N1Z2dlc3Q7XG4iXX0=
