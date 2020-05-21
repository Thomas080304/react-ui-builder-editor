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

import 'prismjs/themes/prism.css';
import Prism from 'prismjs';
import * as constants from '../../../commons/constants';

require('prismjs/components/prism-typescript');
require('prismjs/components/prism-jsx');

export function getHighlightedTSCodeHtml(sourceCode) {
  return Prism.highlight(sourceCode, Prism.languages.jsx);
}

// export function highlightBlock(codeBlockElement) {
//   highlight.highlightBlock(codeBlockElement);
// }

export function markdownHighlight(str, lang) {
  // if (lang && highlight.getLanguage(lang)) {
  //   try {
  //     return highlight.highlight(lang, str, true).value;
  //   } catch (__) {}
  // }
  //
  // return ''; // use external default escaping
  let hl;

  try {
    hl = Prism.highlight(str, Prism.languages[lang])
  } catch (error) {
    console.error(error);
    hl = '';
  }

  return `<pre class="language-${lang}"><code class="language-${lang}">${hl}</code></pre>`;
}

export function offset(el) {
  const rect = el.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    right: rect.right + scrollLeft,
    bottom: rect.bottom + scrollTop }
}

export function getComponentName(canonicalComponentName) {
  const titleParts = canonicalComponentName ? canonicalComponentName.split('.') : [];
  if (titleParts.length > 0) {
    return titleParts[titleParts.length - 1];
  }
  return canonicalComponentName;
}

export function cutText(text, limit = 25) {
  if (text && text.length >= limit) {
    return text.substr(0, limit - 3) + '...';
  }
  return text;
}

export function cutFilePath(filePath, limit = 60, trimTo = 5) {
  let result = filePath;
  if (result && result.length > limit && trimTo > 1) {
    const parts = result.split(constants.FILE_SEPARATOR);
    if (parts && parts.length > trimTo) {
      result = `.../${parts.slice(parts.length - trimTo, parts.length).join(constants.FILE_SEPARATOR)}`;
      if (result.length > limit) {
        return cutFilePath(result, limit, trimTo - 1);
      }
    }
  }
  return result;
}

export function validateFileNameAndDirectoryName(fileName, directoryName) {
  const nameMatches = constants.FILE_NAME_VALID_REGEXP.exec(fileName);
  const directoryNameMatches = constants.FILE_PATH_VALID_REGEXP.exec(directoryName);
  return {
    fileNameHasError: !fileName || !nameMatches,
    directoryNameHasError: !!(directoryName && !directoryNameMatches),
  };
}
