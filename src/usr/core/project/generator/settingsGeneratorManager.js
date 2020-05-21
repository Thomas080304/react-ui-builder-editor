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
import * as constants from '../../../../commons/constants';
import { getArrayDefaultExportFileText } from './fileTemplates';

export function createTree(model, rootModelProps) {
  if (model && model.props) {
    const {
      type,
      children,
      props: {propertyName, propertyValue}
    } = model;
    if (type === constants.COMPONENT_PROPERTY_ARRAY_TYPE
      || type === constants.COMPONENT_PROPERTY_OBJECT_TYPE) {
      if (rootModelProps) {
        if (propertyName) {
          if (propertyValue) {
            rootModelProps[propertyName] = cloneDeep(propertyValue);
          } else {
            rootModelProps[propertyName] = null;
          }
        } else {
          // rootModelProps = rootModelProps || [];
          if (propertyValue) {
            rootModelProps = cloneDeep(propertyValue);
          }
        }
      }
    } else if (type === constants.COMPONENT_PROPERTY_SHAPE_TYPE) {
      let newObjectModel = {};
      if (children && children.length > 0) {
        children.forEach(child => {
          newObjectModel = createTree(child, newObjectModel);
        });
      }
      if (rootModelProps) {
        if (propertyName) {
          rootModelProps[propertyName] = newObjectModel;
        } else {
          rootModelProps.push(newObjectModel);
        }
      }
    } else if (type === constants.COMPONENT_PROPERTY_ARRAY_OF_TYPE) {
      let newArrayModel = [];
      if (children && children.length > 0) {
        children.forEach(child => {
          newArrayModel = createTree(child, newArrayModel);
        });
      }
      if (rootModelProps) {
        if (propertyName) {
          rootModelProps[propertyName] = newArrayModel;
        } else {
          rootModelProps.push(newArrayModel);
        }
      }
    } else if (type === constants.COMPONENT_PROPERTY_STRING_TYPE
      || type === constants.COMPONENT_PROPERTY_ONE_OF_TYPE
      || type === constants.COMPONENT_PROPERTY_SYMBOL_TYPE
      || type === constants.COMPONENT_PROPERTY_BOOL_TYPE
      || type === constants.COMPONENT_PROPERTY_ANY_TYPE
      || type === constants.COMPONENT_PROPERTY_NUMBER_TYPE) {
      if (rootModelProps) {
        if (propertyName) {
          rootModelProps[propertyName] = propertyValue;
        } else {
          if (propertyValue) {
            rootModelProps.push(propertyValue);
          }
        }
      }
    }
  }
  return rootModelProps;
}

export function createIndexObject (resourceModel, resultObject) {
  if (resourceModel) {
    const { type, props, children } = resourceModel;
    if (type === constants.GRAPH_MODEL_SETTINGS_TYPE && props && props.settingsProperties) {
      const { settingsProperties } = props;
      if (settingsProperties && settingsProperties.length > 0) {
        settingsProperties.forEach(settingsPropertyItem => {
          createTree(settingsPropertyItem, resultObject);
        });
      }
    } else if (children && children.length > 0) {
      children.forEach(child => {
        createIndexObject(child, resultObject);
      });
    }
  }
}

export function generateFiles(resourcesTrees, destFilePath) {
  const indexObject = {};
  createIndexObject(resourcesTrees, indexObject);
  return indexObject;
  // const fileBody = getArrayDefaultExportFileText({fileData: indexObject});
  // return fileBody;
  // console.info('TODO: generate settings: ', destFilePath, fileBody);
}
