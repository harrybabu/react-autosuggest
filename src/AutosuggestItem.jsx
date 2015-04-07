var React = require('react');

var AutosuggestItem = React.createClass({
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
      <li className={this.getSuggestClasses()}
        onClick={this.onClick}>
          {this.props.suggest.label}
      </li>
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
