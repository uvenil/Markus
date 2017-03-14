// @flow
'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import merge from 'lodash.merge';

const Label = (props : Object) => {
    const style : Object = {
        WebkitUserSelect : 'none',
        cursor           : 'default',
        color            : props.muiTheme.palette.textColor,
        pointerEvents    : props.disabled ? 'none' : 'auto'
    };

    const handleClick = event => {
        if (event.nativeEvent.button === 2) {
            if (props.onRightClick) props.onRightClick();
        } else {
            if (props.onClick) props.onClick();
        }
    };

    return (
        <span
            className={props.className}
            style={merge(style, props.style)}
            onMouseDown={event => handleClick(event)}>
            {props.children}
        </span>
    );
};

Label.propTypes = {
    className    : React.PropTypes.string,
    style        : React.PropTypes.object,
    disabled     : React.PropTypes.bool,
    onClick      : React.PropTypes.func,
    onRightClick : React.PropTypes.func
};

Label.defaultProps = {
    disabled : false
};

export default muiThemeable()(Label);
