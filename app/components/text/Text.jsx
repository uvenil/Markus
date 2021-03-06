// @flow
'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Label from './Label.jsx';
import merge from 'lodash.merge';

const Text = (props : Object) => {
    const style = { display : 'block' };

    return (
        <Label
            className={props.className}
            style={merge(style, props.style)}
            onClick={props.onClick}
            onRightClick={props.onRightClick}>
            {props.children}
        </Label>
    );
};

Text.propTypes = {
    className    : React.PropTypes.string,
    style        : React.PropTypes.object,
    disabled     : React.PropTypes.bool,
    onClick      : React.PropTypes.func,
    onRightClick : React.PropTypes.func
};

Text.defaultProps = {
    disabled : false
};

export default muiThemeable()(Text);
