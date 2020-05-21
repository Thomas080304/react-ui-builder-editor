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

import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import ResourceIcon from '../commons/ResourceIcon';
import constants from '../../../commons/constants';

class NewTemplateDialog extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    dirPath: PropTypes.string,
    templateModel: PropTypes.object,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    dirPath: '',
    templateModel: null,
    onClose: () => {
      console.info('NewTemplateDialog.onClose is not set');
    },
    onSubmit: (options) => {
      console.info('NewTemplateDialog.onSubmit is not set: ', options);
    },
  };

  constructor (props) {
    super(props);
    this.state = {
      templateNameText: '',
      templateNameError: false,
      directoryNameText: this.props.dirPath,
      directoryNameError: false,
    };
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const {isOpen, dirPath, templateModel} = this.props;
    const { templateNameText, templateNameError, directoryNameText, directoryNameError } = this.state;
    return isOpen !== nextProps.isOpen
      || dirPath !== nextProps.dirPath
      || templateModel !== nextProps.templateModel
      || templateNameText !== nextState.templateNameText
      || templateNameError !== nextState.templateNameError
      || directoryNameText !== nextState.directoryNameText
      || directoryNameError !== nextState.directoryNameError;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { dirPath, isOpen } = this.props;
    if (dirPath !== prevProps.dirPath || isOpen !== prevProps.isOpen) {
      this.setState({
        directoryNameText: dirPath,
      });
    }
  }

  handleClose = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.props.onClose(false);
  };

  handleSubmit = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const { templateNameText, directoryNameText } = this.state;
    const { templateNameError, directoryNameError } = this.validateTexts({
      directoryNameText,
      templateNameText
    });
    if (!templateNameError && !directoryNameError) {
      const { onSubmit, templateModel } = this.props;
      onSubmit({
        templateName: templateNameText,
        directoryName: directoryNameText,
        templateModel,
      });
    } else {
      this.setState({
        templateNameError,
        directoryNameError
      });
    }
  };

  validateTexts = ({templateNameText, directoryNameText}) => {
    const templateNameMatches = constants.FILE_NAME_VALID_REGEXP.exec(templateNameText);
    const directoryNameMatches = constants.FILE_PATH_VALID_REGEXP.exec(directoryNameText);
    return {
      pageNameError: !templateNameText || !templateNameMatches,
      directoryNameError: !!(directoryNameText && !directoryNameMatches),
    };
  };

  handleTemplateNameChange = (e) => {
    const templateNameText = e.target.value;
    const newState = {
      templateNameText,
      ...this.validateTexts({templateNameText, directoryNameText: this.state.directoryNameText})
    };
    this.setState(newState);
  };

  handleDirectoryNameChange = (e) => {
    const directoryNameText = e.target.value;
    const newState = {
      directoryNameText,
      ...this.validateTexts({templateNameText: this.state.templateNameText, directoryNameText})
    };
    this.setState(newState);
  };

  render () {
    const { isOpen } = this.props;
    if (!isOpen) {
      return null;
    }
    const { templateNameText, templateNameError, directoryNameText, directoryNameError } = this.state;
    return (
      <Dialog
        aria-labelledby="NewTemplateDialog-dialog-title"
        onClose={this.handleClose}
        open={isOpen}
        maxWidth="sm"
        fullWidth={true}
      >
        <form onSubmit={this.handleSubmit}>
          <DialogTitle
            id="NewTemplateDialog-dialog-title"
            disableTypography={true}
          >
            Create New Template
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus={true}
              margin="dense"
              id="templateName"
              label="Template Name"
              type="text"
              fullWidth={true}
              required={true}
              value={templateNameText}
              error={templateNameError}
              onChange={this.handleTemplateNameChange}
              InputProps={{
                startAdornment:
                  <InputAdornment position="start">
                    <ResourceIcon resourceType={constants.GRAPH_MODEL_TEMPLATE_TYPE} />
                  </InputAdornment>,
              }}
              helperText="Enter the name on the new template. Use alphanumeric characters and '_' character."
            />
            <TextField
              margin="dense"
              id="directory"
              label="Path (optional)"
              type="text"
              fullWidth={true}
              required={false}
              value={directoryNameText}
              error={directoryNameError}
              onChange={this.handleDirectoryNameChange}
              InputProps={{
                startAdornment:
                  <InputAdornment position="start">
                    <ResourceIcon resourceType={constants.GRAPH_MODEL_DIR_TYPE} isMuted={true}/>
                  </InputAdornment>,
              }}
              helperText="Enter the path. Use '/' as a separator of the nested directories."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
            <Button type="submit" onClick={this.handleSubmit} color="primary">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export default NewTemplateDialog;
