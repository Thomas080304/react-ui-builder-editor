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

import path from 'path-browserify';
import * as pageComposerFactory from '../pageComposer/pageComposerFactory';
import * as flowComposerFactory from '../flowComposer/flowComposerFactory';
import * as projectResourcesManager from './projectResourcesManager';
import * as config from '../config/config';
import constants from '../../../commons/constants';
import { repairPath } from '../utils/fileUtils';

export function createNewPageFileObject (name, directoryName) {
  directoryName = directoryName || '';
  const filePath = repairPath(path.join(config.etcPagesSourceDir, directoryName, `${name}.json`));
  const pageFileDataObject = {
    pageName: name,
    pagePath: repairPath(path.join(directoryName, name)),
    componentsTree: pageComposerFactory.createDefaultModel(),
  };
  return { filePath, fileData: JSON.stringify(pageFileDataObject) };
}

export function createNewTemplateFileObject (name, templateModel, directoryName) {
  directoryName = directoryName || '';
  const filePath = repairPath(path.join(config.etcTemplatesSourceDir, directoryName, `${name}.json`));
  const templateFileDataObject = {
    templateName: name,
    componentsTree: templateModel || pageComposerFactory.createDefaultModel(),
  };
  return { filePath, fileData: JSON.stringify(templateFileDataObject) };
}

export function createNewFlowFileObject (name, directoryName) {
  directoryName = directoryName || '';
  const filePath = repairPath(path.join(config.etcFlowsSourceDir, directoryName, `${name}.json`));
  const flowFileDataObject = {
    flowName: name,
    model: flowComposerFactory.createDefaultModel(),
  };
  return { filePath, fileData: JSON.stringify(flowFileDataObject) };
}

export function createCopyPageFileObject (source, name, directoryName) {
  directoryName = directoryName || '';
  const filePath = repairPath(path.join(config.etcPagesSourceDir, directoryName, `${name}.json`));
  const pageFileDataObject = {
    pageName: name,
    pagePath: repairPath(path.join(directoryName, name)),
    componentsTree: source.componentsTree,
  };
  return { filePath, fileData: JSON.stringify(pageFileDataObject) };
}

export function createCopyTemplateFileObject (source, name, directoryName) {
  directoryName = directoryName || '';
  const filePath = repairPath(path.join(config.etcTemplatesSourceDir, directoryName, `${name}.json`));
  const templateFileDataObject = {
    templateName: name,
    componentsTree: source.componentsTree,
  };
  return { filePath, fileData: JSON.stringify(templateFileDataObject) };
}

export function createCopyFlowFileObject (source, name, directoryName) {
  directoryName = directoryName || '';
  const filePath = repairPath(path.join(config.etcFlowsSourceDir, directoryName, `${name}.json`));
  const flowFileDataObject = {
    flowName: name,
    model: source.flowTree,
  };
  return { filePath, fileData: JSON.stringify(flowFileDataObject) };
}

/**
 * To be updated the data should have the same fields that has given resource
 *
 * @param resource
 * @param data
 */
export function createFileObjectsWithNewData (resource, data) {
  let fileObjects = [];
  if (resource.isPage) {
    const { componentsTree: dataComponentsTree, componentInstancesState } = data;
    const parentKeys = resource.allParentKeys;
    if (parentKeys && parentKeys.length > 1) {
      const pageFileResource = projectResourcesManager.getResourceByKey(parentKeys[0]);
      fileObjects.push({
        filePath: pageFileResource.absolutePath,
        fileData: JSON.stringify({
          pageName: resource.pageName,
          pagePath: resource.pagePath,
          isTest: resource.isTest,
          componentsTree: dataComponentsTree
        })
      });
    }

    if (componentInstancesState) {
      const stateIndexResource = projectResourcesManager.getResourceByKey(constants.GRAPH_MODEL_STATE_KEY);
      if (stateIndexResource) {
        const stateIndexParentKeys = stateIndexResource.allParentKeys;
        if (stateIndexParentKeys && stateIndexParentKeys.length > 1) {
          const stateIndexFileResource = projectResourcesManager.getResourceByKey(stateIndexParentKeys[0]);
          fileObjects.push({
            filePath: stateIndexFileResource.absolutePath,
            fileData: JSON.stringify(
              stateIndexResource.componentInstancesState
                ? { ...stateIndexResource.componentInstancesState, ...componentInstancesState }
                : componentInstancesState
            )
          });
        }
      }
    }

  } else if (resource.isTemplate) {
    const { componentsTree: dataComponentsTree, componentInstancesState } = data;
    const parentKeys = resource.allParentKeys;
    if (parentKeys && parentKeys.length > 1) {
      const pageFileResource = projectResourcesManager.getResourceByKey(parentKeys[0]);
      fileObjects.push({
        filePath: pageFileResource.absolutePath,
        fileData: JSON.stringify({
          templateName: resource.templateName,
          componentsTree: dataComponentsTree
        })
      });
    }

    if (componentInstancesState) {
      const stateIndexResource = projectResourcesManager.getResourceByKey(constants.GRAPH_MODEL_STATE_KEY);
      if (stateIndexResource) {
        const stateIndexParentKeys = stateIndexResource.allParentKeys;
        if (stateIndexParentKeys && stateIndexParentKeys.length > 1) {
          const stateIndexFileResource = projectResourcesManager.getResourceByKey(stateIndexParentKeys[0]);
          fileObjects.push({
            filePath: stateIndexFileResource.absolutePath,
            fileData: JSON.stringify(
              stateIndexResource.componentInstancesState
                ? { ...stateIndexResource.componentInstancesState, ...componentInstancesState }
                : componentInstancesState
            )
          });
        }
      }
    }

  } else if (resource.isFlow) {
    const { flowTree } = data;
    const parentResource = projectResourcesManager.getResourceByKey(resource.parentKey);
    fileObjects.push({
      filePath: parentResource.absolutePath,
      fileData: JSON.stringify({
        isDisabled: resource.isDisabled,
        isTest: resource.isTest,
        flowName: resource.displayName,
        model: flowTree,
      })
    });
  }
  return fileObjects;
}

export function createFileObject (resource, fileDataOptions = {}) {
  let fileObject = {};
  if (resource.isPage) {
    const parentKeys = resource.allParentKeys;
    if (parentKeys && parentKeys.length > 1) {
      const pageFileResource = projectResourcesManager.getResourceByKey(parentKeys[0]);
      fileObject.filePath = pageFileResource.absolutePath;
      fileObject.fileData = JSON.stringify({
        ...fileDataOptions,
        pageName: resource.pageName,
        pagePath: resource.pagePath,
        componentsTree: resource.componentsTree
      });
    }
  } else if (resource.isFlow) {
    const parentResource = projectResourcesManager.getResourceByKey(resource.parentKey);
    fileObject.filePath = parentResource.absolutePath;
    fileObject.fileData = JSON.stringify({
      ...fileDataOptions,
      flowName: resource.displayName,
      model: resource.flowTree,
    });
  }
  return fileObject;
}

export function createBackupFileObjects (resource) {
  let fileObjects = [];
  if (resource.isPage) {
    const parentKeys = resource.allParentKeys;
    if (parentKeys && parentKeys.length > 1) {
      const pageFileResource = projectResourcesManager.getResourceByKey(parentKeys[0]);
      fileObjects.push({
        filePath: pageFileResource.absolutePath,
        fileData: JSON.stringify({
          isTest: resource.isTest,
          pageName: resource.pageName,
          pagePath: resource.pagePath,
          componentsTree: resource.componentsTree
        })
      });
    }
    const stateIndexResource = projectResourcesManager.getResourceByKey(constants.GRAPH_MODEL_STATE_KEY);
    if (stateIndexResource) {
      const stateIndexParentKeys = stateIndexResource.allParentKeys;
      if (stateIndexParentKeys && stateIndexParentKeys.length > 1) {
        const stateIndexFileResource = projectResourcesManager.getResourceByKey(stateIndexParentKeys[0]);
        fileObjects.push({
          filePath: stateIndexFileResource.absolutePath,
          fileData: JSON.stringify(stateIndexResource.componentInstancesState || {})
        });
      }
    }

  } else if (resource.isFlow) {
    const parentResource = projectResourcesManager.getResourceByKey(resource.parentKey);
    fileObjects.push({
      filePath: parentResource.absolutePath,
      fileData: JSON.stringify({
        isTest: resource.isTest,
        flowName: resource.displayName,
        model: resource.flowTree,
      })
    });
  }
  return fileObjects;
}

export function createSettingsFileObject (settings) {
  return {
    filePath: config.etcSettingsFile,
    fileData: JSON.stringify({model: settings}),
  };
}
