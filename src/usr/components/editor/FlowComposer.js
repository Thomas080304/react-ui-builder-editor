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

import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isEqual from 'lodash/isEqual';
import forOwn from 'lodash/forOwn';
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import FlowComposerManager from '../../core/flowComposer/FlowComposerManager';
import { CommonToolbar, CommonToolbarDivider } from '../commons/Commons.parts';
import Diagram from '../diagram/Diagram';
import ToolbarButton from '../commons/ToolbarButton';
import globalStore from '../../core/config/globalStore';
import constants from '../../../commons/constants';

const styles = theme => ({
  root: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  centralPane: {
    position: 'absolute',
    top: '39px',
    bottom: 0,
    right: 0,
    left: 0,
    overflow: 'hidden',
  },
  topPane: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '39px',
    right: 0,
    minWidth: '800px'
  },
  tooltip: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    color: '#cdcdcd',
  },
  tooltipLabel: {
    padding: '2px 4px',
    fontSize: '90%',
    color: '#cccccc',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  editorPane: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    overflow: 'auto',
  }
});

class FlowComposer extends React.Component {
  static propTypes = {
    dataId: PropTypes.string,
    isVisible: PropTypes.bool,
    data: PropTypes.object,
    draggedItem: PropTypes.object,
    isDraggingItem: PropTypes.bool,
    updateHistory: PropTypes.array,
    onUpdate: PropTypes.func,
    onErrorClick: PropTypes.func,
    onSearchRequest: PropTypes.func,
    onUndo: PropTypes.func,
    onOpen: PropTypes.func,
  };

  static defaultProps = {
    dataId: '',
    isVisible: true,
    data: null,
    draggedItem: null,
    isDraggingItem: false,
    updateHistory: [],
    onUpdate: () => {
      console.info('FlowComposer.onUpdate is not set.');
    },
    onErrorClick: () => {
      console.info('FlowComposer.onErrorClick is not set.');
    },
    onSearchRequest: () => {
      console.info('FlowComposer.onSearchRequest is not set.');
    },
    onUndo: () => {
      console.info('FlowComposer.onUndo is not set.');
    },
    onOpen: () => {
      console.info('FlowComposer.onOpen is not set.');
    },
  };

  constructor (props) {
    super(props);
    this.updateCounter = 0;
    this.state = {
      selectedModels: null,
      updateCounter: 0,
      zoomK: this.getViewFlag('zoomK', 0.5),
    };
    const { data } = this.props;
    if (data) {
      this.flowComposerManager = new FlowComposerManager(data.flowTree);
      this.state.localFlowTree = this.flowComposerManager.getFlowModel();
      this.state.selectedModels = this.flowComposerManager.getSelected();
    }
  }

  componentDidMount () {
    window.document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount () {
    window.document.removeEventListener('keydown', this.handleKeyDown);
  }

  shouldComponentUpdate (nextProps, nextState, nextContext) {
    const { data, isVisible, isDraggingItem, updateHistory, flowConnectionsMap } = this.props;
    const {
      localFlowTree,
      selectedModels,
      updateCounter,
      zoomK
    } = this.state;
    let dataIsChanged = nextProps.data && data !== nextProps.data;
    if (dataIsChanged) {
      // it seems new data is arrived
      const newFlowComposerManager = new FlowComposerManager(nextProps.data.flowTree);
      const newLocalFlowTree = newFlowComposerManager.getFlowModel();
      // we need to check if the flow tree model objects are equal
      dataIsChanged = !isEqual(newLocalFlowTree, localFlowTree);
      if (dataIsChanged) {
        // these objects are equal, then set new composer manager instance with new flow tree model
        delete this.flowComposerManager;
        this.flowComposerManager = newFlowComposerManager;
      }
    }
    return dataIsChanged
      || isVisible !== nextProps.isVisible
      || isDraggingItem !== nextProps.isDraggingItem
      || updateHistory !== nextProps.updateHistory
      || flowConnectionsMap !== nextProps.flowConnectionsMap
      || localFlowTree !== nextState.localFlowTree
      || selectedModels !== nextState.selectedModels
      || updateCounter !== nextState.updateCounter
      || zoomK !== nextState.zoomK;
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { updateCounter, localFlowTree } = this.state;
    const { data } = this.props;
    if (
      data
      && prevProps.data
      && data !== prevProps.data
      && updateCounter === 0
    ) {
      // we set new this.flowComposerManager in the shouldComponentUpdate method
      const newLocalFlowTree = this.flowComposerManager.getFlowModel();
      if (!isEqual(newLocalFlowTree, localFlowTree)) {
        this.setState({
          localFlowTree: newLocalFlowTree,
          selectedModels: this.flowComposerManager.getSelected(),
        });
      }
    }
    if(updateCounter > 0 && updateCounter !== prevState.updateCounter) {
      this.sendUpdate();
    }
  }

  sendUpdate = () => {
    this.setState({updateCounter: 0});
    this.props.onUpdate({ flowTree: this.flowComposerManager.getSerializableFlowModel() });
  };

  storeViewFlag = (flagName, flagValue) => {
    const { dataId } = this.props;
    if (dataId) {
      const recordViewFlags = globalStore.get(constants.STORAGE_RECORD_FLOW_COMPOSER_FLAGS) || {};
      const viewFlags = recordViewFlags[dataId] || {};
      viewFlags[flagName] = flagValue;
      recordViewFlags[dataId] = viewFlags;
      globalStore.set(constants.STORAGE_RECORD_FLOW_COMPOSER_FLAGS, recordViewFlags, true);
    }
  };

  getViewFlag = (flagName, flagDefaultValue) => {
    const { dataId } = this.props;
    if (dataId) {
      const recordViewFlags = globalStore.get(constants.STORAGE_RECORD_FLOW_COMPOSER_FLAGS) || {};
      const viewFlags = recordViewFlags[dataId] || {};
      const viewFlag = viewFlags[flagName];
      return typeof viewFlag === 'undefined' ? flagDefaultValue : viewFlag;
    }
    return flagDefaultValue;
  };

  handleKeyDown = (e) => {
    if (
      this.props.isVisible
      && e
      && e.target
      && e.target.tagName !== 'INPUT'
      && e.target.tagName !== 'TEXTAREA'
    ) {
      const {keyCode, metaKey, ctrlKey} = e;
      if (metaKey || ctrlKey) {
        if (keyCode === 90) { // Undo
          e.stopPropagation();
          e.preventDefault();
          this.handleUndo();
        }
      } else {
        if (keyCode === 8 || keyCode === 46) { // Delete
          e.stopPropagation();
          e.preventDefault();
          this.handleDeleteItem();
        }
      }
    }
  };

  handleItemClick = (node) => {
    const { updateCounter } = this.state;
    this.flowComposerManager.setSelected(node);
    this.setState({
      localFlowTree: this.flowComposerManager.getFlowModel(),
      selectedModels: this.flowComposerManager.getSelected(),
      updateCounter: updateCounter + 1,
    });
  };

  handleDropNew = (source, destination, position) => {
    const { updateCounter } = this.state;
    if (destination) {
      this.flowComposerManager.replaceWithResource(source, destination);
    } else {
      this.flowComposerManager.addResourceToBasket(source, position);
    }
    this.flowComposerManager.enrichModel();
    this.setState({
      localFlowTree: this.flowComposerManager.getFlowModel(),
      updateCounter: updateCounter + 1,
    });
  };

  handleConnectInput = (outputKey, outputName, inputKey, inputName) => {
    const { updateCounter } = this.state;
    const isConnected = this.flowComposerManager.connectInput(outputKey, outputName, inputKey, inputName);
    if (isConnected) {
      this.flowComposerManager.setSelectedByKey(inputKey);
      this.flowComposerManager.enrichModel();
      this.setState({
        localFlowTree: this.flowComposerManager.getFlowModel(),
        selectedModels: this.flowComposerManager.getSelected(),
        updateCounter: updateCounter + 1,
      });
    }
  };

  handleErrorClick = (errors) => {
    if (errors) {
      if (isString(errors)) {
        this.props.onErrorClick([{message: errors}]);
      } else if (isObject(errors)) {
        const messages = [];
        forOwn(errors, (value) => {
          messages.push({
            message: value,
          })
        });
        this.props.onErrorClick(messages);
      }
    }
  };

  handleDeleteItem = () => {
    const { updateCounter } = this.state;
    this.flowComposerManager.deleteSelected();
    this.flowComposerManager.enrichModel();
    this.setState({
      localFlowTree: this.flowComposerManager.getFlowModel(),
      updateCounter: updateCounter + 1,
      selectedModels: null,
    });
  };

  handleSearchRequest = (text) => () => {
    this.props.onSearchRequest(text);
  };

  handleUndo = () => {
    this.props.onUndo();
  };

  handleDragEndBasket = (key, newPosition) => {
    const { updateCounter } = this.state;
    this.flowComposerManager.setNewBasketPosition(key, newPosition);
    this.flowComposerManager.setSelectedByKey(key);
    this.setState({
      localFlowTree: this.flowComposerManager.getFlowModel(),
      selectedModels: this.flowComposerManager.getSelected(),
      updateCounter: updateCounter + 1,
    });
  };

  handleOpen = () => {
    const { selectedModels } = this.state;
    if (selectedModels) {
      const { nodeModel } = selectedModels;
      if (nodeModel && nodeModel.props) {
        if (nodeModel.props.componentName) {
          this.props.onOpen(nodeModel.props.componentName);
        } else if (nodeModel.props.functionName) {
          this.props.onOpen(nodeModel.props.functionName);
        }
      }
    }
  };

  handleIncreaseZoom = () => {
    const {zoomK} = this.state;
    const newZoomK = zoomK < 0.8 ? zoomK + 0.1 : zoomK;
    this.storeViewFlag('zoomK', Number(newZoomK));
    this.setState({
      zoomK: Number(newZoomK)
    })
  };

  handleDecreaseZoom = () => {
    const {zoomK} = this.state;
    const newZoomK = zoomK > 0.2 ? zoomK - 0.1 : zoomK;
    this.storeViewFlag('zoomK', Number(newZoomK));
    this.setState({
      zoomK: Number(newZoomK)
    })
  };

  handleInitialZoom = () => {
    this.storeViewFlag('zoomK', 0.5);
    this.setState({
      zoomK: 0.5
    })
  };

  handleZoomed = (zoomedK) => {
    this.storeViewFlag('zoomK', Number(zoomedK));
    this.setState({
      zoomK: Number(zoomedK),
    });
  };

  render () {
    const {
      localFlowTree,
      selectedModels,
      zoomK
    } = this.state;
    if (!localFlowTree) {
      return <h1>Flow tree is not specified</h1>
    }
    const { classes, draggedItem, isDraggingItem, updateHistory, isVisible } = this.props;
    let title;
    // let searchName;
    // let className;
    let openTitle = "Jump to";
    let selectedNode;
    if (selectedModels) {
      selectedNode = selectedModels.nodeModel;
      if (selectedNode && selectedNode.props.title !== 'Application') {
        title = selectedNode.props.title;
        // className = getComponentName(selectedNode.props.componentName);
        // searchName = selectedNode.props.searchName;
        if (selectedNode.props.componentName) {
          openTitle += " Component";
        } else if (selectedNode.props.functionName) {
          openTitle += " Function";
        } else if (selectedNode.props.pagePath) {
          openTitle += " Page";
        }
      }
    }

    return (
      <div className={classes.root}>
        <div className={classes.topPane}>
          <CommonToolbar disableGutters={true} dense="true">
            <ToolbarButton
              disabled={!title}
              title={openTitle}
              iconType="OpenInNew"
              tooltip="Open in the new tab"
              onClick={this.handleOpen}
            />
            <CommonToolbarDivider />
            <ToolbarButton
              iconType="Delete"
              iconColor="#E53935"
              disabled={!title}
              onClick={this.handleDeleteItem}
              title="Delete"
              tooltip="Remove the selected particle from the flow (Delete | Back Space)"
            />
            <ToolbarButton
              iconType="Undo"
              disabled={(!updateHistory || updateHistory.length === 0)}
              onClick={this.handleUndo}
              title="Undo"
              tooltip="Undo current changes to the last saving (⌘+z | ctrl+z)"
            />
            <CommonToolbarDivider />
            <ToolbarButton
              iconType="ZoomIn"
              onClick={this.handleIncreaseZoom}
              tooltip="Zoom Plus (Scroll Wheel Down)"
            />
            <ToolbarButton
              iconType="ZoomOut"
              onClick={this.handleDecreaseZoom}
              tooltip="Zoom Minus (Scroll Wheel Up)"
            />
            <ToolbarButton
              iconType="Adjust"
              onClick={this.handleInitialZoom}
              tooltip="Zoom 100%"
              title="100%"
            />
          </CommonToolbar>
        </div>
        <div className={classes.centralPane}>
          <Diagram
            treeData={localFlowTree}
            draggedItem={isDraggingItem ? draggedItem : null}
            zoomK={zoomK}
            isVisible={isVisible}
            onItemClick={this.handleItemClick}
            onErrorClick={this.handleErrorClick}
            onDropNew={this.handleDropNew}
            onConnectInput={this.handleConnectInput}
            onItemDelete={this.handleDeleteItem}
            onItemDragEnd={this.handleDragEndBasket}
            onZoomed={this.handleZoomed}
          />
          <div className={classes.tooltip}>
            <code className={classes.tooltipLabel}>Drag & drop here</code>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(FlowComposer);
