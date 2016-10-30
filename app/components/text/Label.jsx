'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';

const Label = props => {
    return (
        <span
            className={props.className}
            style={{ WebkitUserSelect : 'none', cursor : 'default', fontWeight : props.fontWeight, fontSize : props.textSize, color : props.muiTheme.palette.textColor, pointerEvents : props.disabled ? 'none' : 'auto' }}>
            {props.children}
        </span>
    );
};

Label.propTypes = {
    className  : React.PropTypes.string,
    fontWeight : React.PropTypes.oneOfType([ React.PropTypes.string, React.PropTypes.number ]),
    textSize   : React.PropTypes.string,
    disabled   : React.PropTypes.bool
};

Label.defaultProps = {
    className : 'Label',
    disabled  : false
};

export default muiThemeable()(Label);
