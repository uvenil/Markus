'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Label from './Label.jsx';
import _ from 'lodash';

const Text = props => {
    const style = { display : 'block' };

    return (
        <Label
            className={props.className}
            style={_.assign(style, props.style)}
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
