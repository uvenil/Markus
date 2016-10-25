'use strict';

import React from 'react';

const Text = props => {
    const theme     = props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');
    const textColor = props.textColor ? props.textColor : theme.primaryTextColor;

    return (
        <span
            className={props.className}
            style={{ display : 'block', WebkitUserSelect : 'none', cursor : 'default', fontFamily : props.fontFamily, fontWeight : props.fontWeight, fontSize : props.textSize, color : textColor, pointerEvents : props.disabled ? 'none' : 'auto' }}>
            {props.children}
        </span>
    );
};

Text.propTypes = {
    className  : React.PropTypes.string,
    fontFamily : React.PropTypes.string,
    fontWeight : React.PropTypes.oneOfType([ React.PropTypes.string, React.PropTypes.number ]),
    textSize   : React.PropTypes.string,
    textColor  : React.PropTypes.string,
    theme      : React.PropTypes.oneOf([ 'light', 'dark' ]),
    disabled   : React.PropTypes.bool
};

Text.defaultProps = {
    className : 'Text',
    theme     : 'light',
    disabled  : false
};

module.exports = { Text };
