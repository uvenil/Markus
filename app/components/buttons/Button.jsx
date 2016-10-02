'use strict';

import React from 'react';
import Config from '../../../config.json';

export default class Button extends React.Component {
    constructor(props) {
        super(props);

        this._handleClick = () => {
            if (this.props.onClick) {
                this.props.onClick();
            }
        };
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

        let textColor       = this.props.textColor ? this.props.textColor : theme.primaryTextColor;
        let backgroundColor = theme.buttonDefaultColor;

        if (this.props.backgroundColor === 'primary') {
            textColor       = theme.primaryTextColorInverted;
            backgroundColor = theme.buttonPrimaryColor;
        } else if (this.props.backgroundColor === 'success') {
            textColor       = theme.primaryTextColorInverted;
            backgroundColor = theme.buttonSuccessColor;
        } else if (this.props.backgroundColor === 'error') {
            textColor       = theme.primaryTextColorInverted;
            backgroundColor = theme.buttonErrorColor;
        } else if (this.props.backgroundColor === 'warning') {
            textColor       = theme.primaryTextColorInverted;
            backgroundColor = theme.buttonWarningColor;
        } else if (this.props.backgroundColor === 'none') {
            backgroundColor = 'transparent';
        }

        return (
            <button
                type="button"
                className={this.props.className}
                style={{ WebkitUserSelect : 'none', cursor : 'default', fontFamily : this.props.fontFamily, fontSize : this.props.textSize, color : textColor, backgroundColor : backgroundColor, outline : 'none', borderWidth : '1px', borderStyle : 'solid', borderRadius : Config.paddingX0 + 'px', borderColor : backgroundColor, padding : Config.paddingX0 + 'px ' + Config.paddingX1 + 'px', pointerEvents : this.props.disabled ? 'none' : 'auto' }}
                onClick={() => this._handleClick()}>
                {this.props.children}
            </button>
        );
    }
}

Button.propTypes = {
    className       : React.PropTypes.string,
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

module.exports = Button;
