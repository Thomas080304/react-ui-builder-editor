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

import isString from 'lodash/isString';

export function findFlowDeclarations (sourceCode) {
  const declarations = [];
  try {
    const pageJSON = isString(sourceCode) ? JSON.parse(sourceCode) : sourceCode;
    const { flowName, model, isDisabled, isTest } = pageJSON;
    const flowDeclaration = {
      flowName,
      isDisabled,
      isTest,
      model,
    };
    declarations.push(flowDeclaration);
  } catch (e) {
    console.error('Parsing the flow source code: ', e);
    // do nothing...
  }
  return declarations;
}
