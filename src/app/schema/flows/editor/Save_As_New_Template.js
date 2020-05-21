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

export default [
  {
    type: 'component',
    props: {
      componentName: 'usr.components.editor.ResourceEditor.ResourceEditor',
      componentInstance: 'resourceEditor1',
    },
    events: [
      {
        name: 'onSaveAsTemplate',
        targets: [
          {
            type: 'userFunction',
            props: {
              functionName: 'usr.api.resourcesTreeViewMethods.createNewTemplateStart',
            },
            events: [
              {
                name: 'isDialogOpen',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.NewTemplateDialog.NewTemplateDialog',
                      componentInstance: 'newTemplateDialog1',
                      propertyName: 'isOpen'
                    },
                  }
                ]
              },
              {
                name: 'dirPath',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.NewTemplateDialog.NewTemplateDialog',
                      componentInstance: 'newTemplateDialog1',
                      propertyName: 'dirPath'
                    },
                  }
                ]
              },
              {
                name: 'templateModel',
                targets: [
                  {
                    type: 'component',
                    props: {
                      componentName: 'usr.components.dialogs.NewTemplateDialog.NewTemplateDialog',
                      componentInstance: 'newTemplateDialog1',
                      propertyName: 'templateModel'
                    },
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]