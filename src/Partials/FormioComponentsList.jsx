import React from 'react';

export const FormioComponentsList = React.createClass({
  displayName: 'FormioComponents',
  render: function() {
    return (
      <div className="formio-components">
        {
          this.props.components.map(function(component, index) {
            var key = component.key || component.type + index;
            var value = (this.props.values && this.props.values.hasOwnProperty(component.key) ? this.props.values[component.key] : null);
            // FormioComponents is a global variable so external scripts can define custom components.
            var FormioElement;
            if (FormioComponents[component.type]) {
              FormioElement = FormioComponents[component.type];
            }
            else {
              FormioElement = FormioComponents['custom'];
            }
            if (this.props.checkConditional(component)) {
              return (
                <FormioElement
                  {...this.props}
                  name={component.key}
                  key={key}
                  component={component}
                  value={value}
                />
              );
            }
            else {
              return null;
            }
          }.bind(this))
        }
      </div>
    );
  }
});
