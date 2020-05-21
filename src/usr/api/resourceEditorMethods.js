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

import globalStore from '../core/config/globalStore';
import * as projectObjectFactory from '../core/project/projectObjectFactory';
import * as projectFileFactory from '../core/project/projectFileFactory';
import * as projectGenerator from '../core/project/projectGenerator';
import * as projectResourcesManager from '../core/project/projectResourcesManager';
import * as projectManager from '../core/project/projectManager';
import constants from '../../commons/constants';

const checkMinimalActiveTabsAmount = (resourceEditorTabs) => {
  if (resourceEditorTabs.length > 6) {
    let minTimestamp = Date.now();
    let indexToDelete = -1;
    resourceEditorTabs.forEach((tabObject, index) => {
      if (
        tabObject.timestamp < minTimestamp
        && tabObject.resourceKey !== constants.RESOURCE_README_PREVIEW_KEY
        && tabObject.resourceKey !== constants.RESOURCE_LIVE_PREVIEW_KEY
      ) {
        minTimestamp = tabObject.timestamp;
        indexToDelete = index;
      }
    });
    if (indexToDelete >= 0) {
      resourceEditorTabs.splice(indexToDelete, 1);
    }
  }
  return resourceEditorTabs;
};

/**
 *
 * @param resourceKey
 * @returns {Function}
 */
export const openTabWithResourceByKey = (resourceKey) => (dispatch) => {
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  let activeEditorTabIndex = globalStore.get('activeEditorTabIndex');
  resourceEditorTabs = checkMinimalActiveTabsAmount(resourceEditorTabs);
  let foundIndex = resourceEditorTabs.findIndex(tabObject => {
    return tabObject.resourceKey === resourceKey;
  });
  if (foundIndex < 0) {
    const newEditorTabObject =
      projectObjectFactory.createResourceEditorTabObject(resourceKey);
    if (newEditorTabObject) {
      resourceEditorTabs.push({
        resourceKey,
        resourceObject: newEditorTabObject,
        timestamp: Date.now(),
        projectSettingsObject: projectManager.getProjectSettings(),
        clipboardItems: projectResourcesManager.getClipboardItemList(),
      });
      activeEditorTabIndex = resourceEditorTabs.length - 1;
      resourceEditorTabs = [...resourceEditorTabs];
      dispatch({
        resourceEditorTabs: resourceEditorTabs,
        activeEditorTabIndex: activeEditorTabIndex
      });
    }
  } else {
    activeEditorTabIndex = foundIndex;
    resourceEditorTabs[foundIndex].timestamp = Date.now();
    dispatch({ activeEditorTabIndex: activeEditorTabIndex });
  }
  globalStore.set('resourceEditorTabs', resourceEditorTabs);
  globalStore.set('activeEditorTabIndex', activeEditorTabIndex);

};

/**
 *
 * @param selectedIndex
 * @returns {Function}
 */
export const openTabWithResourceByIndex = (selectedIndex) => (dispatch) => {
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  resourceEditorTabs[selectedIndex].timestamp = Date.now();
  globalStore.set('activeEditorTabIndex', selectedIndex);
  globalStore.set('resourceEditorTabs', resourceEditorTabs);
  dispatch({ activeEditorTabIndex: selectedIndex });
};

/**
 *
 * @param closingIndex
 * @returns {Function}
 */
export const closeTabWithResourceByIndex = (closingIndex) => (dispatch) => {
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  let activeEditorTabIndex = globalStore.get('activeEditorTabIndex');
  if (resourceEditorTabs.length > closingIndex) {
    resourceEditorTabs.splice(closingIndex, 1);
    resourceEditorTabs = [...resourceEditorTabs];
    activeEditorTabIndex = closingIndex > activeEditorTabIndex
      ? activeEditorTabIndex
      : activeEditorTabIndex - 1;
    if (activeEditorTabIndex < 0 && resourceEditorTabs.length > 0) {
      activeEditorTabIndex = 0;
    }
    globalStore.set('resourceEditorTabs', resourceEditorTabs);
    globalStore.set('activeEditorTabIndex', activeEditorTabIndex);
    dispatch({
      resourceEditorTabs: resourceEditorTabs,
      activeEditorTabIndex: activeEditorTabIndex
    });
  }
};

export const updateAllTabs = () => (dispatch) => {
  let activeEditorTabIndex = globalStore.get('activeEditorTabIndex');
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  const newResourceEditorTabs = [];
  const activeResourceTab = resourceEditorTabs[activeEditorTabIndex];
  if (resourceEditorTabs && resourceEditorTabs.length > 0) {
    resourceEditorTabs.forEach(resourceEditorTab => {
      const { livePreviewObject, readmePreviewObject, resourceObject, resourceKey } = resourceEditorTab;
      if (resourceObject) {
        const resourceEditorTabObject =
          projectObjectFactory.createResourceEditorTabObject(resourceObject.key);
        if (resourceEditorTabObject) {
          newResourceEditorTabs.push({
            resourceKey,
            resourceObject: resourceEditorTabObject,
            projectSettingsObject: projectManager.getProjectSettings(),
            clipboardItems: projectResourcesManager.getClipboardItemList(),
            timestamp: Date.now(),
          });
        }
      } else if (livePreviewObject) {
        newResourceEditorTabs.push({
          resourceKey: constants.RESOURCE_LIVE_PREVIEW_KEY,
          livePreviewObject: projectObjectFactory.createResourceEditorLivePreviewTabObject(),
          projectSettingsObject: projectManager.getProjectSettings(),
          timestamp: Date.now(),
          demoFiles: projectManager.generateFiles()
        });
      } else if (readmePreviewObject) {
        newResourceEditorTabs.push({
          resourceKey: constants.RESOURCE_README_PREVIEW_KEY,
          readmePreviewObject: projectObjectFactory.createProjectReadmePreviewTabObject(),
          projectSettingsObject: projectManager.getProjectSettings(),
          timestamp: Date.now()
        });
      }
    });
  }
  if (activeResourceTab) {
    const foundIndex = newResourceEditorTabs.findIndex(resourceTab => {
      return resourceTab.resourceKey === activeResourceTab.resourceKey;
    });
    activeEditorTabIndex = foundIndex < 0 ? 0 : foundIndex;
  }
  activeEditorTabIndex = activeEditorTabIndex < newResourceEditorTabs.length ? activeEditorTabIndex : 0;
  globalStore.set('resourceEditorTabs', newResourceEditorTabs);
  globalStore.set('activeEditorTabIndex', activeEditorTabIndex);
  dispatch({
    activeEditorTabIndex: activeEditorTabIndex,
    resourceEditorTabs: newResourceEditorTabs
  });
};

export const openTabWithLivePreview = () => (dispatch) => {
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  let activeEditorTabIndex = globalStore.get('activeEditorTabIndex');
  resourceEditorTabs = checkMinimalActiveTabsAmount(resourceEditorTabs);
  let foundIndex = resourceEditorTabs.findIndex(resourceTab => !!resourceTab.livePreviewObject);
  if (foundIndex < 0) {
    resourceEditorTabs.push({
      resourceKey: constants.RESOURCE_LIVE_PREVIEW_KEY,
      timestamp: Date.now(),
      livePreviewObject: projectObjectFactory.createResourceEditorLivePreviewTabObject(),
      projectSettingsObject: projectManager.getProjectSettings(),
      demoFiles: projectManager.generateFiles()
    });
    activeEditorTabIndex = resourceEditorTabs.length - 1;
    resourceEditorTabs = [...resourceEditorTabs];
    dispatch({
      activeEditorTabIndex: activeEditorTabIndex,
      resourceEditorTabs: resourceEditorTabs
    });
  } else {
    activeEditorTabIndex = foundIndex;
    dispatch({
      activeEditorTabIndex: activeEditorTabIndex
    });
  }
  globalStore.set('resourceEditorTabs', resourceEditorTabs);
  globalStore.set('activeEditorTabIndex', activeEditorTabIndex);
};

export const openTabWithReadmePreview = () => (dispatch) => {
  let resourceEditorTabs = globalStore.get('resourceEditorTabs') || [];
  let activeEditorTabIndex = globalStore.get('activeEditorTabIndex');
  resourceEditorTabs = checkMinimalActiveTabsAmount(resourceEditorTabs);
  let foundIndex = resourceEditorTabs.findIndex(resourceTab => !!resourceTab.readmePreviewObject);
  if (foundIndex < 0) {
    resourceEditorTabs.push({
      resourceKey: constants.RESOURCE_README_PREVIEW_KEY,
      timestamp: Date.now(),
      readmePreviewObject: projectObjectFactory.createProjectReadmePreviewTabObject(),
      projectSettingsObject: projectManager.getProjectSettings(),
    });
    activeEditorTabIndex = resourceEditorTabs.length - 1;
    resourceEditorTabs = [...resourceEditorTabs];
    dispatch({
      activeEditorTabIndex: activeEditorTabIndex,
      resourceEditorTabs: resourceEditorTabs
    });
  } else {
    activeEditorTabIndex = foundIndex;
    dispatch({ activeEditorTabIndex: activeEditorTabIndex });
  }
  globalStore.set('resourceEditorTabs', resourceEditorTabs);
  globalStore.set('activeEditorTabIndex', activeEditorTabIndex);
};

export const resourceItemDragStart = (resourceKey) => (dispatch) => {
  const resourceEditorDraggedObject =
    projectObjectFactory.createResourceEditorDraggedObject(resourceKey);
  dispatch({
    draggedItem: resourceEditorDraggedObject,
    isDraggingItem: true
  });
};

export const resourceItemDragEnd = () => (dispatch) => {
  dispatch({ isDraggingItem: false });
};

export const updateResourceByTab = ({ resource, data }) => async (dispatch) => {
  const fileObjects = projectFileFactory.createFileObjectsWithNewData(resource, data);
  if (fileObjects.length > 0) {
    const oldFileObjects = projectFileFactory.createBackupFileObjects(resource);
    if (oldFileObjects.length > 0) {
      const updateResourceHistory = projectResourcesManager.pushUpdateToResourceHistory(resource, oldFileObjects);
      dispatch({ updateResourceHistory: updateResourceHistory });
    }
    dispatch({ fileObjects: fileObjects });
  }
};

export const undoUpdateResourceByTab = (resource) => async (dispatch) => {
  const fileObjects = projectResourcesManager.popUpdateFromResourceHistory(resource);
  if (fileObjects && fileObjects.length > 0) {
    const updateResourceHistory = projectResourcesManager.getResourcesUpdateHistory();
    dispatch({
      updateResourceHistory: updateResourceHistory,
      fileObjects: fileObjects,
    });
  }
};

export const updateSettings = (settings) => async (dispatch) => {
  const fileObject = projectFileFactory.createSettingsFileObject(settings);
  if (fileObject && fileObject.filePath && fileObject.fileData) {
    dispatch({ fileObjects: [fileObject] });
  }
};

export const openUrlInExternalBrowser = (url) => (dispatch) => {
  projectManager.openUrlInExternalBrowser(url);
  dispatch({ success: true });
};

export const pushItemToClipboard = (newItem) => (dispatch) => {
  projectResourcesManager.addItemToClipboard(newItem);
  dispatch({ success: true });
};

export const clearClipboard = () => (dispatch) => {
  projectResourcesManager.clearClipboard();
};

export const openDefaultTabs = () => dispatch => {
  let resourceEditorTabs = [];
  let activeEditorTabIndex = 0;
  resourceEditorTabs.push({
    resourceKey: constants.RESOURCE_README_PREVIEW_KEY,
    timestamp: Date.now(),
    readmePreviewObject: projectObjectFactory.createProjectReadmePreviewTabObject(),
    projectSettingsObject: projectManager.getProjectSettings(),
  });
  // resourceEditorTabs.push({
  //   resourceKey: constants.RESOURCE_LIVE_PREVIEW_KEY,
  //   timestamp: Date.now(),
  //   livePreviewObject: projectObjectFactory.createResourceEditorLivePreviewTabObject(),
  //   projectSettingsObject: projectManager.getProjectSettings(),
  //   demoFiles: projectManager.generateFiles()
  // });
  dispatch({
    activeEditorTabIndex: activeEditorTabIndex,
    resourceEditorTabs: resourceEditorTabs
  });
  globalStore.set('resourceEditorTabs', resourceEditorTabs);
  globalStore.set('activeEditorTabIndex', activeEditorTabIndex);
};

export const generateCodeForResourceStart = ({resource}) => async (dispatch) => {
  if (resource) {
    dispatch({
      componentsTree: resource.componentsTree,
      isDialogOpen: true,
    });
  }
};
