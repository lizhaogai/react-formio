'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  getDefaultValue: function getDefaultValue(value) {
    // Allow components to set different default values.
    if (value == null) {
      if (this.props.component.defaultValue) {
        value = this.props.component.defaultValue;
        if (typeof this.onChangeCustom === 'function') {
          value = this.onChangeCustom(value);
        }
      } else if (typeof this.getInitialValue === 'function') {
        value = this.getInitialValue();
      } else {
        value = '';
      }
    }
    if (this.props.component.type !== 'datagrid' && this.props.component.type !== 'container') {
      value = this.safeSingleToMultiple(value);
    }
    return value;
  },
  getInitialState: function getInitialState() {
    var value = this.getDefaultValue(this.props.value);
    var valid = this.validate(value);
    return {
      value: value,
      isValid: valid.isValid,
      errorMessage: valid.errorMessage,
      isPristine: true
    };
  },
  validate: function validate(value) {
    // Allow components to have custom validation.
    if (typeof this.validateCustom === 'function') {
      return this.validateCustom(value);
    }
    var state = {
      isValid: true,
      errorMessage: ''
    };
    // Validate each item if multiple.
    if (this.props.component.multiple) {
      value.forEach(function (item) {
        if (state.isValid) {
          state = this.validateItem(item);
        }
      }.bind(this));
    } else {
      state = this.validateItem(value);
    }
    return state;
  },
  validateItem: function validateItem(item) {
    var state = {
      isValid: true,
      errorMessage: ''
    };
    // Check for no validation criteria
    if (!this.props.component.validate) {
      return state;
    }
    // Required
    if (!item && this.props.component.validate.required) {
      state.isValid = false;
      state.errorMessage = (this.props.component.label || this.props.component.key) + ' is required.';
    }
    // Email
    if (state.isValid && this.props.component.type === 'email' && !item.match(/\S+@\S+/)) {
      state.isValid = false;
      state.errorMessage = (this.props.component.label || this.props.component.key) + ' must be a valid email.';
    }
    // MaxLength
    if (state.isValid && this.props.component.validate.maxLength && item.length > this.props.component.validate.maxLength) {
      state.isValid = false;
      state.errorMessage = (this.props.component.label || this.props.component.key) + ' cannot be longer than ' + this.props.component.validate.maxLength + ' characters.';
    }
    // MinLength
    if (state.isValid && this.props.component.validate.minLength && item.length < this.props.component.validate.minLength) {
      state.isValid = false;
      state.errorMessage = (this.props.component.label || this.props.component.key) + ' cannot be shorter than ' + this.props.component.validate.minLength + ' characters.';
    }
    // MaxValue
    if (state.isValid && this.props.component.validate.max && item > this.props.component.validate.max) {
      state.isValid = false;
      state.errorMessage = (this.props.component.label || this.props.component.key) + ' cannot be greater than ' + this.props.component.validate.max;
    }
    // MinValue
    if (state.isValid && this.props.component.validate.min && item < this.props.component.validate.min) {
      state.isValid = false;
      state.errorMessage = (this.props.component.label || this.props.component.key) + ' cannot be less than ' + this.props.component.validate.min;
    }
    // Regex
    if (state.isValid && this.props.component.validate.pattern) {
      var re = new RegExp(this.props.component.validate.pattern, 'g');
      state.isValid = item.match(re);
      if (!state.isValid) {
        state.errorMessage = (this.props.component.label || this.props.component.key) + ' must match the expression: ' + this.props.component.validate.pattern;
      }
    }
    // Custom
    if (state.isValid && this.props.component.validate.custom) {
      var custom = this.props.component.validate.custom;
      custom = custom.replace(/({{\s+(.*)\s+}})/, function (match, $1, $2) {
        return this.props.data[$2];
      }.bind(this));
      var input = item;
      /* jshint evil: true */
      var valid = eval(custom);
      state.isValid = valid === true;
      if (!state.isValid) {
        state.errorMessage = valid || (this.props.component.label || this.props.component.key) + 'is not a valid value.';
      }
    }
    return state;
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      var value = this.safeSingleToMultiple(nextProps.value);
      var valid = this.validate(value);
      this.setState({
        value: value,
        isValid: valid.isValid,
        errorMessage: valid.errorMessage,
        isPristine: true
      });
    }
    if (typeof this.willReceiveProps === 'function') {
      this.willReceiveProps(nextProps);
    }
  },
  safeSingleToMultiple: function safeSingleToMultiple(value) {
    // If this was a single but is not a multivalue.
    if (this.props.component.multiple && !Array.isArray(value)) {
      value = [value];
    }
    // If this was a multivalue but is now single value.
    // RE-60 :-Need to return the value as array of object instead of object while converting  a multivalue to single value for datagrid component
    else if (!this.props.component.multiple && Array.isArray(value) && !this.props.component.type === 'datagrid') {
        value = value[0];
      }
    // Set dates to Date object.
    if (this.props.component.type === 'datetime' && value && !(value instanceof Date)) {
      value = new Date(value);
    }
    return value;
  },
  componentWillMount: function componentWillMount() {
    if (!this.props.options || !this.props.options.hasOwnProperty('skipInit') || !this.props.options.skipInit) {
      this.setValue(this.state.value, null, true);
    }
    this.props.attachToForm(this);
  },
  componentWillUnmount: function componentWillUnmount() {
    this.props.detachFromForm(this);
  },
  onChange: function onChange(event) {
    var value = event.target.value;
    // Allow components to respond to onChange event.
    if (typeof this.onChangeCustom === 'function') {
      value = this.onChangeCustom(value);
    }
    var index = this.props.component.multiple ? event.target.getAttribute('data-index') : null;
    this.setValue(value, index);
  },
  setValue: function setValue(value, index, pristine) {
    if (index === undefined) {
      index = null;
    }
    this.setState(function (previousState) {
      if (index !== null && Array.isArray(previousState.value)) {
        previousState.value[index] = value;
      } else {
        previousState.value = value;
      }
      previousState.isPristine = !!pristine;
      Object.assign(previousState, this.validate(previousState.value));
      return previousState;
    }.bind(this), function () {
      if (typeof this.props.onChange === 'function') {
        this.props.onChange(this);
      }
    }.bind(this));
  },
  getComponent: function getComponent() {
    var id = 'form-group-' + this.props.component.key;
    var classNames = 'form-group form-field-type-' + this.props.component.type + ' ' + id + (this.state.errorMessage !== '' && !this.state.isPristine ? ' has-error' : '') + (this.props.component.customClass ? ' ' + this.props.component.customClass : '');
    var Elements = this.getElements();
    var Error = this.state.errorMessage && !this.state.isPristine ? _react2.default.createElement(
      'p',
      { className: 'help-block' },
      this.state.errorMessage
    ) : '';
    return _react2.default.createElement(
      'div',
      { className: classNames, id: id },
      Elements,
      Error
    );
  },
  render: function render() {
    var element = this.getComponent();
    if (typeof this.props.onElementRender === 'function') {
      element = this.props.onElementRender(this, element);
    }
    return element;
  },
  getDisplay: function getDisplay(component, value) {
    if (typeof this.getValueDisplay === 'function') {
      if (Array.isArray(value) && component.multiple && component.type !== 'file') {
        return value.map(this.getValueDisplay.bind(null, component)).join(', ');
      } else {
        return this.getValueDisplay(component, value);
      }
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    // If this is still an object, something went wrong and we don't know what to do with it.
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
      return '[object Object]';
    }
    return value;
  }
};