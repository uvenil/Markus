'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const Text = props => {
    return (
        <span
            className={props.className}
            style={{ display : 'block', WebkitUserSelect : 'none', cursor : 'default', fontWeight : props.fontWeight, fontSize : props.textSize, color : props.muiTheme.palette.textColor, pointerEvents : props.disabled ? 'none' : 'auto' }}>
            {props.children}
        </span>
    );
};

Text.propTypes = {
    className  : React.PropTypes.string,
    fontWeight : React.PropTypes.oneOfType([ React.PropTypes.string, React.PropTypes.number ]),
    textSize   : React.PropTypes.string,
    disabled   : React.PropTypes.bool
};

Text.defaultProps = {
    className : 'Text',
    disabled  : false
};

export default muiThemeable()(Text);
