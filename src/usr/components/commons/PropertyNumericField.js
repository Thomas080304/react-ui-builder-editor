/*
 *     React UI Builder
 *     Copyright (C) React UI Builder Team
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import debounce from 'lodash/debounce';
import isNumber from 'lodash/isNumber';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Close from '@material-ui/icons/Close';
import InputBase from '@material-ui/core/InputBase';

const PropertyNumericInput = withStyles(theme => ({
  root: {
    width: '100%'
  },
  input: {
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    fontSize: '0.8125rem',
    borderRadius: '4px',
    padding: '3px',
  },
}))(InputBase);

const PropertyNumericIconButton = withStyles(theme => ({
  root: {
    padding: '4px',
    fontWeight: 'normal',
  }
}))(IconButton);

const CloseIcon = withStyles(theme => ({
  root: {
    fontSize: '12px',
    padding: '3px'
  }
}))(Close);

const PropertyNumericInputAdornment = withStyles(theme => ({
  positionStart: {
    marginRight: 0,
  },
  positionEnd: {
    marginLeft: 0,
  }
}))(InputAdornment);

const styles = theme => ({
  root: {
    width: '100%',
    fontSize: '0.8125rem',
  }
});

function makeValidValue(value) {
  return isNumber(value)
    ? value
    : value && value.length > 0 ? Number(value) : undefined
}

class PropertyTextField extends React.Component {
  static propTypes = {
    value: PropTypes.number,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    value: null,
    onChange: () => {
      console.info('PropertyTextField.onChange is not set');
    },
    onSubmit: () => {
      console.info('PropertyTextField.onSubmit is not set');
    },
  };

  constructor (props) {
    super(props);
    this.state = {
      inputValue: makeValidValue(this.props.value),
    };
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const { inputValue } = this.state;
    return inputValue !== nextProps.value || inputValue !== nextState.inputValue;
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { value } = this.props;
    if (value !== prevProps.value) {
      this.setState({
        inputValue: makeValidValue(value),
      });
    }
  }

  debounceOnChange = debounce((newInputValue) => {
    this.props.onChange(newInputValue);
  }, 500);

  handleOnChange = () => {
    const inputValue = makeValidValue(this.input.value);
    this.setState({
      inputValue,
    });
    this.debounceOnChange(inputValue);
  };

  handleOnCancel = () => {
    this.setState({
      inputValue: undefined,
    });
    this.input.focus();
    this.props.onChange();
  };

  handleOnSubmit = () => {
    this.props.onSubmit(this.state.inputValue);
  };

  handleOnKeyDown = (e) => {
    if (e) {
      if (e.which === 13) {
        // Enter
        this.handleOnSubmit();
      } else if (e.which === 27) {
        // Cancel
        this.handleOnCancel();
      }
    }
  };

  render () {
    const {inputValue} = this.state;
    return (
      <PropertyNumericInput
        inputRef={me => this.input = me}
        type="number"
        value={typeof inputValue === 'undefined' ? '' : inputValue}
        placeholder="Number"
        onChange={this.handleOnChange}
        onKeyDown={this.handleOnKeyDown}
        endAdornment={
          <PropertyNumericInputAdornment position="end">
            <PropertyNumericIconButton onClick={this.handleOnCancel}>
              <CloseIcon color="disabled"/>
            </PropertyNumericIconButton>
          </PropertyNumericInputAdornment>
        }
      />
    );
  }
}

export default withStyles(styles)(PropertyTextField);
