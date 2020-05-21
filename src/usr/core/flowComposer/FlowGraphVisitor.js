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

import constants from '../../../commons/constants';
import cloneDeep from 'lodash/cloneDeep';

const propertiesComparator = (a, b) => {
  if (a.name === constants.FUNCTION_OUTPUT_ERROR_NAME) {
    return 1;
  }
  if (b.name === constants.FUNCTION_OUTPUT_ERROR_NAME) {
    return -1;
  }
  return a.name.localeCompare(b.name);
};

class FlowGraphVisitor {

  enrichmentVisitor = ({ nodeModel, parentModel }) => {
    const resultTasks = [];
    resultTasks.push(() => {
      const { props: { inputs, outputs } } = nodeModel;
      if (inputs && inputs.length > 0) {
        nodeModel.props.inputs = inputs.sort(propertiesComparator);
      }
      if (outputs && outputs.length > 0) {
        nodeModel.props.outputs = outputs.sort(propertiesComparator);
      }
      if (parentModel) {
        nodeModel.props = {
          ...nodeModel.props,
          acceptableTypes: [
            constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE,
            constants.GRAPH_MODEL_FLOW_COMPONENT_INSTANCE_TYPE,
            constants.GRAPH_MODEL_USER_FUNCTION_TYPE,
            constants.GRAPH_MODEL_FLOW_USER_FUNCTION_TYPE,
            constants.GRAPH_MODEL_PAGE_TYPE
          ]
        };
      } else {
        nodeModel.props = {
          ...nodeModel.props,
          acceptableTypes: [
            constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE,
            constants.GRAPH_MODEL_FLOW_COMPONENT_INSTANCE_TYPE,
            constants.GRAPH_MODEL_PAGE_TYPE
          ]
        };
      }
    });
    return resultTasks;
  };

  decreasingVisitor = ({ nodeModel, parentModel }) => {
    const { key } = nodeModel;
    return [
      () => {
        const newNodeModel = cloneDeep(nodeModel);
        delete newNodeModel.props.acceptableTypes;
        this.graphModel.assignNode(key, newNodeModel);
      }
    ];
  };

  getSelected = ({ nodeModel, parentModel }) => {
    const result = [];
    const { props: { isSelected, inputs } } = nodeModel;
    if (isSelected) {
      let inputModel = null;
      let outputModel = null;
      if (parentModel) {
        const { props: { outputs } } = parentModel;
        if (inputs && inputs.length > 0 && outputs && outputs.length > 0) {
          inputs.forEach(inputItem => {
            if (inputItem && inputItem.connectedTo) {
              outputModel = outputs.find(outputItem => outputItem.name === inputItem.connectedTo);
              if (outputModel) {
                inputModel = inputItem;
              }
            }
          });
        }
      }
      result.push({
        parentModel,
        nodeModel,
        inputModel,
        outputModel,
      });
    }
    return result;
  };

  removeSelected = ({ nodeModel, parentModel }) => {
    if (nodeModel && nodeModel.props) {
      const { props: {inputs, outputs} } = nodeModel;
      if (inputs && inputs.length > 0) {
        for (let i = 0; i < inputs.length; i++) {
          delete inputs[i].isSelected;
        }
      }
      if (outputs && outputs.length > 0) {
        for (let i = 0; i < outputs.length; i++) {
          delete outputs[i].isSelected;
        }
      }
      delete nodeModel.props.isSelected;
    }
  };

  getFlowParticles = ({ nodeModel, parentModel }) => {
    const result = [];
    const { type, props } = nodeModel;
    let flowParticle;
    if (type === constants.FLOW_USER_FUNCTION_TYPE) {
      flowParticle = {
        flowParticleType: type,
        functionName: props.functionName,
        inputs: props.inputs,
        outputs: props.outputs
      };
      result.push(flowParticle);
    } else if (type === constants.FLOW_COMPONENT_INSTANCE_TYPE) {
      flowParticle = {
        flowParticleType: type,
        componentName: props.componentName,
        componentInstance: props.componentInstance,
        inputs: props.inputs,
        outputs: props.outputs
      };
      result.push(flowParticle);
    }
    return result;
  };

  executeVisitResults = (tasks) => {
    if (tasks && tasks.length > 0) {
      tasks.forEach(task => { task(); });
    }
  };

  visitForEnrichment = (sourceGraphModel) => {
    this.graphModel = sourceGraphModel;
    this.executeVisitResults(this.graphModel.traverse(this.enrichmentVisitor));
  };

  visitForDecreasing = (sourceGraphModel) => {
    this.graphModel = sourceGraphModel;
    this.executeVisitResults(this.graphModel.traverse(this.decreasingVisitor));
  };

  visitForSelected = (sourceGraphModel) => {
    this.graphModel = sourceGraphModel;
    return this.graphModel.traverse(this.getSelected);
  };

  visitForRemoveSelected = (sourceGraphModel) => {
    this.graphModel = sourceGraphModel;
    this.graphModel.traverse(this.removeSelected);
  };

  visitForFlowParticles = (sourceGraphModel) => {
    this.graphModel = sourceGraphModel;
    return this.graphModel.traverse(this.getFlowParticles);
  };

}

export default FlowGraphVisitor;
