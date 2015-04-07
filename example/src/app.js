var React = require('react'),
  Autosuggest = require('../../src/Autosuggest.jsx');

var App = React.createClass({
  /**
   * Render the example app
   */
  render: function() {
    var fixtures = [
    ];

    return (
      <div>
        <Autosuggest
          fixtures={fixtures}
          url='http://gd.geobytes.com/AutoCompleteCity'
          jsonp='true'
          onSuggestSelect={this.onSuggestSelect} />
      </div>
    );
  },

  /**
   * When a suggest got selected
   * @param  {Object} suggest The suggest
   */
  onSuggestSelect: function(suggest) {
    console.log(suggest);
  }
});

React.render(<App />, document.getElementById('app'));
