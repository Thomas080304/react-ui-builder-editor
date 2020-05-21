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
import { withStyles } from '@material-ui/core/styles';
import Placeholder from './Placeholder';

const styles = theme => ({
  root: {
    display: 'grid',
    gridGap: '1em',
    gridTemplateColumns: '300px minmax(200px, auto)',
  },
  cell1: {
    position: 'relative',
    gridColumn: '1',
    gridRow: '1',
  },
  cell2: {
    position: 'relative',
    gridColumn: '2',
    gridRow: '1',
  },
  cell3: {
    position: 'relative',
    gridColumn: '1',
    gridRow: '2',
  },
  cell4: {
    position: 'relative',
    gridColumn: '2',
    gridRow: '2',
  },
  cell13: {
    position: 'relative',
    gridColumn: '1',
    gridRow: '1/3',
  }
});

const ComponentPublishLayout = (props) => {
  const {classes, cell1, cell2, cell3, cell4, cell13} = props;
  return (
    <div className={classes.root}>
      {!cell13 && (
        <div className={classes.cell1}>
          {cell1}
        </div>
      )}
      {cell13 && (
        <div className={classes.cell13}>
          {cell13}
        </div>
      )}
      <div className={classes.cell2}>
        {cell2}
      </div>
      {!cell13 && (
        <div className={classes.cell3}>
          {cell3}
        </div>
      )}
      <div className={classes.cell4}>
        {cell4}
      </div>
    </div>
  );
};

ComponentPublishLayout.propTypes = {
  cell1: PropTypes.element,
  cell2: PropTypes.element,
  cell3: PropTypes.element,
  cell4: PropTypes.element,
  cell13: PropTypes.element,
};

ComponentPublishLayout.defaultProps = {
  cell1: <Placeholder title="cell1" />,
  cell2: <Placeholder title="cell2" />,
  cell3: <Placeholder title="cell3" />,
  cell4: <Placeholder title="cell4" />,
  cell13: null,
};

export default withStyles(styles)(ComponentPublishLayout);