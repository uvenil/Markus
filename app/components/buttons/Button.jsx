'use strict';

import React from 'react';
import Config from '../../../config.json';

const Button = props => {
    const theme = props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

    let textColor       = props.textColor ? props.textColor : theme.primaryTextColor;
    let backgroundColor = theme.buttonDefaultColor;

    if (props.backgroundColor === 'primary') {
        textColor       = theme.primaryTextColorInverted;
        backgroundColor = theme.buttonPrimaryColor;
    } else if (props.backgroundColor === 'success') {
        textColor       = theme.primaryTextColorInverted;
        backgroundColor = theme.buttonSuccessColor;
    } else if (props.backgroundColor === 'error') {
        textColor       = theme.primaryTextColorInverted;
        backgroundColor = theme.buttonErrorColor;
    } else if (props.backgroundColor === 'warning') {
        textColor       = theme.primaryTextColorInverted;
        backgroundColor = theme.buttonWarningColor;
    } else if (props.backgroundColor === 'none') {
        backgroundColor = 'transparent';
    }

    return (
        <button
            type="button"
            className={props.className}
            style={{ WebkitUserSelect : 'none', cursor : 'default', width : props.width, fontFamily : props.fontFamily, fontSize : props.textSize, color : textColor, backgroundColor : backgroundColor, outline : 'none', borderWidth : '1px', borderStyle : 'solid', borderRadius : Config.paddingX0 + 'px', borderColor : backgroundColor, padding : Config.paddingX0 + 'px ' + Config.paddingX0 + 'px', pointerEvents : props.disabled ? 'none' : 'auto' }}
            onClick={() => {
                if (props.onClick) props.onClick();
            }}>
            {props.children}
        </button>
    );
};

Button.propTypes = {
    className       : React.PropTypes.string,
    width           : React.PropTypes.string,
    fontFamily      : React.PropTypes.string,
    textSize        : React.PropTypes.string,
    textColor       : React.PropTypes.string,
    backgroundColor : React.PropTypes.oneOf([ 'default', 'primary', 'success', 'error', 'warning', 'none' ]),
    theme           : React.PropTypes.oneOf([ 'light', 'dark' ]),
    disabled        : React.PropTypes.bool,
    onClick         : React.PropTypes.func
};

Button.defaultProps = {
    className       : 'Button',
    backgroundColor : 'default',
    theme           : 'light',
    disabled        : false
};

module.exports = { Button };
