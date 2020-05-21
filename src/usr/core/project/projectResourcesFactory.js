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

import cloneDeep from 'lodash/cloneDeep';
import uniqueId from 'lodash/uniqueId';
import constants from '../../../commons/constants';
import { getParticleName } from '../utils/textUtils';
import { makeResourceModelCanonicalKey } from '../utils/resourceUtils';
import PageComposerManager from '../pageComposer/PageComposerManager';
import FlowComposerManager from '../flowComposer/FlowComposerManager';

export function createFunctionsModels (modelKey, declarationsInFile, displayName) {
  const result = [];
  const functionsKey = `${modelKey}_functions`;
  const functionsModel = {
    key: functionsKey,
    type: constants.GRAPH_MODEL_FUNCTIONS_TYPE,
    props: {
      resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
      displayName,
      functionsName: modelKey,
    },
    children: [],
  };
  declarationsInFile.declarations.forEach(functionDeclaration => {
    const { functionName, dispatches, wcdAnnotations } = functionDeclaration;
    const canonicalFunctionName = makeResourceModelCanonicalKey(modelKey, functionName);
    // let sortedDispatches = [];
    // if (dispatches && dispatches.length > 0) {
    //   sortedDispatches = dispatches.sort((a, b) => a.name.localeCompare(b.name));
    // }
    // sortedDispatches.push({
    //   name: constants.FUNCTION_OUTPUT_ERROR_NAME,
    //   wcdAnnotations: {
    //     [constants.ANNOTATION_COMMENT]:
    //     'A dispatch is added automatically to each function. ' +
    //     'The dispatch is triggered when an error is not caught in the function body. ' +
    //     'The output payload has the Error type.'
    //   }
    // });
    functionsModel.children.push({
      key: canonicalFunctionName,
      type: constants.GRAPH_MODEL_USER_FUNCTION_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
        name: functionName,
        displayName: functionName,
        functionName: canonicalFunctionName,
        functionComment: wcdAnnotations[constants.ANNOTATION_COMMENT],
        parentFunctionsKey: modelKey,
        dispatches: dispatches,
      }
    });
  });
  result.push(functionsModel);
  return result;
}

export function createComponentsModels (modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(componentDeclaration => {
    const { componentName, properties, defaultProps, wcdAnnotations, externalProperties } = componentDeclaration;
    const canonicalComponentName = modelKey;
    result.push({
      key: canonicalComponentName,
      type: constants.GRAPH_MODEL_COMPONENT_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
        name: componentName,
        displayName: componentName,
        componentName: canonicalComponentName,
        properties: properties,
        defaultProps: defaultProps,
        externalProperties: externalProperties,
        componentComment: wcdAnnotations[constants.ANNOTATION_COMMENT],
      }
    });
  });
  return result;
}

export function createPropTypesModels (modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(componentDeclaration => {
    const { name, properties } = componentDeclaration;
    const canonicalPropTypesName = makeResourceModelCanonicalKey(modelKey, name);
    result.push({
      key: canonicalPropTypesName,
      type: constants.GRAPH_MODEL_PROP_TYPES_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
        name,
        displayName: name,
        properties: properties,
      }
    });
  });
  return result;
}

export function createPageModels(modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(pageDeclaration => {
    const { pageName, pagePath, componentsTree, isTest } = pageDeclaration;
    const pageModel = {
      key: pagePath, // set page path as a key in order to find the resource from any place
      type: constants.GRAPH_MODEL_PAGE_TYPE,
      props: {
        displayName: pageName,
        pageName,
        pagePath,
        isTest,
        resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
        componentsTree: componentsTree,
      },
      children: [],
    };
    const pageComposerManager = new PageComposerManager(componentsTree);
    let componentInstanceIndex = 0;
    const componentInstancesTree = pageComposerManager.getInstancesTree((nodeModelProps, componentsTreeBranch) => {
      const { componentName, componentInstance } = nodeModelProps;
      return {
        key: `${makeResourceModelCanonicalKey(modelKey, componentInstance)}-${componentInstanceIndex++}`,
        type: constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE,
        props: {
          resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
          name: componentInstance,
          displayName: componentInstance,
          componentName: componentName,
          componentInstance: componentInstance,
          componentsTreeBranch: componentsTreeBranch,
          pageName,
          pagePath,
          isTest,
        }
      };
    });
    if (componentInstancesTree && componentInstancesTree.type) {
      // test if the tree is not empty
      pageModel.children.push(componentInstancesTree);
    }
    result.push(pageModel);
  });
  return result;
}

export function createTemplateModels(modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(pageDeclaration => {
    const { templateName, componentsTree } = pageDeclaration;
    const templateModel = {
      key: makeResourceModelCanonicalKey(modelKey, templateName),
      type: constants.GRAPH_MODEL_TEMPLATE_TYPE,
      props: {
        displayName: templateName,
        templateName,
        resourceType: declarationsInFile.resourceType,
        componentsTree: componentsTree,
      },
      children: [],
    };
    const pageComposerManager = new PageComposerManager(componentsTree);
    const componentInstances = pageComposerManager.getInstancesListUniq();
    let componentInstanceModel;
    if (componentInstances && componentInstances.length > 0) {
      componentInstances.forEach((componentInstanceItem, instanceIndex) => {
        const { componentName, componentInstance } = componentInstanceItem;
        componentInstanceModel = {
          key: `${makeResourceModelCanonicalKey(modelKey, componentInstance)}-${instanceIndex}`,
          type: constants.GRAPH_MODEL_COMPONENT_INSTANCE_TYPE,
          props: {
            resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
            name: componentInstance,
            displayName: componentInstance,
            componentName: componentName,
            componentInstance: componentInstance,
          }
        };
        templateModel.children.push(componentInstanceModel);
      });
    }
    result.push(templateModel);
  });
  return result;
}

export function createFlowModels(modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(declaration => {
    const { flowName, model, isDisabled, isTest } = declaration;
    const flowModel = {
      key: modelKey,
      type: constants.GRAPH_MODEL_FLOW_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
        flowName: flowName,
        isDisabled,
        isTest,
        displayName: flowName,
        flowTree: model,
      },
      children: [],
    };
    const flowComposerManager = new FlowComposerManager(model);
    const flowParticles = flowComposerManager.getFlowParticles();
    if (flowParticles && flowParticles.length > 0) {
      let particleModel;
      let particleDisplayName;
      flowParticles.forEach((flowParticle, particleIndex) => {
        const {
          flowParticleType,
          functionName,
          componentName,
          componentInstance,
          inputs,
          outputs,
        } = flowParticle;
        if (flowParticleType === constants.FLOW_USER_FUNCTION_TYPE) {
          particleDisplayName = getParticleName(functionName);
          particleModel = {
            key: `${makeResourceModelCanonicalKey(modelKey, particleDisplayName)}-${particleIndex}`,
            type: constants.GRAPH_MODEL_FLOW_USER_FUNCTION_TYPE,
            props: {
              resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
              name: functionName,
              isTest,
              displayName: particleDisplayName,
              functionName: functionName,
              inputs: inputs,
              outputs: outputs,
            }
          };
          flowModel.children.push(particleModel);
        } else if (flowParticleType === constants.FLOW_COMPONENT_INSTANCE_TYPE) {
          particleModel = {
            key: `${makeResourceModelCanonicalKey(modelKey, componentInstance)}-${particleIndex}`,
            type: constants.GRAPH_MODEL_FLOW_COMPONENT_INSTANCE_TYPE,
            props: {
              resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
              name: componentInstance,
              displayName: componentInstance,
              componentName: componentName,
              componentInstance: componentInstance,
              isTest,
              inputs: inputs,
              outputs: outputs,
            }
          };
          flowModel.children.push(particleModel);
        }
      });
    }
    result.push(flowModel);
  });
  return result;
}

export function createMarkdownModels (modelKey, declarationsInFile, displayName) {
  const result = [];
  declarationsInFile.declarations.forEach(markdownDeclaration => {
    const { markdownContent } = markdownDeclaration;
    const canonicalReadmeName = makeResourceModelCanonicalKey(modelKey, 'readme');
    result.push({
      key: canonicalReadmeName,
      type: constants.GRAPH_MODEL_MARKDOWN_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
        displayName,
        markdownContent,
      }
    });
  });
  return result;
}

export function createSettingsConfigModels (modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(settingsConfigDeclaration => {
    const { properties, defaultProps } = settingsConfigDeclaration;
    result.push({
      key: modelKey,
      type: constants.GRAPH_MODEL_SETTINGS_CONF_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
        settingsConfProperties: properties,
        defaultProps: defaultProps,
      }
    });
  });
  return result;
}

export function createSettingsModels (modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(settingsDeclaration => {
    const { model } = settingsDeclaration;
    result.push({
      key: modelKey,
      type: constants.GRAPH_MODEL_SETTINGS_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
        settingsProperties: model,
      }
    });
  });
  return result;
}

export function createStateModels (modelKey, declarationsInFile) {
  const result = [];
  declarationsInFile.declarations.forEach(settingsDeclaration => {
    const { componentInstancesState } = settingsDeclaration;
    result.push({
      key: modelKey,
      type: constants.GRAPH_MODEL_STATE_TYPE,
      props: {
        resourceType: declarationsInFile.resourceType, // the resource type can be obtained from adapter, so we don't need keep resource type here
        componentInstancesState: componentInstancesState,
      }
    });
  });
  return result;
}

export function createClipboardModel(clipboardItemModel) {
  let newClipboardItemModel = clipboardItemModel ? cloneDeep(clipboardItemModel) : {};
  newClipboardItemModel.props = newClipboardItemModel.props || {};
  delete newClipboardItemModel.key;
  const result = {
    key: uniqueId('clipboardItem'),
    type: constants.GRAPH_MODEL_CLIPBOARD_ITEM_TYPE,
    props: {
      resourceType: constants.RESOURCE_IN_CLIPBOARD_TYPE,
      // fixme: change this when the clipboard will accept other models than component instances
      displayName: newClipboardItemModel.props.componentInstance,
      itemModel: newClipboardItemModel,
    }
  };
  return result;
}