'use strict';

import React from 'react';
import Config from '../../../config.json';

export default class TextBox extends React.Component {
    constructor(props) {
        super(props);

        this._handleChange = value => {
            if (this.props.onChange) {
                this.props.onChange(value);
            }
        };
    }

    render() {
        const theme     = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');
        const textColor = this.props.textColor ? this.props.textColor : theme.primaryTextColor;

        return (
            <input
                type="text"
                style={{ WebkitUserSelect : 'none', fontFamily : this.props.fontFamily, fontSize : this.props.textSize, color : textColor, outline : 'none', borderWidth : '1px', borderStyle : 'solid', borderRadius : Config.paddingX0 + 'px', borderColor : theme.borderColor, padding : Config.paddingX0 + 'px', pointerEvents : this.props.disabled ? 'none' : 'auto' }}
                onChange={event => this._handleChange(event.target.value)} />
        );
    }
}

TextBox.propTypes = {
    className  : React.PropTypes.string,
    fontFamily : React.PropTypes.string,
    textSize   : React.PropTypes.string,
    textColor  : React.PropTypes.string,
    theme      : React.PropTypes.oneOf([ 'light', 'dark' ]),
    disabled   : React.PropTypes.bool,
    onChange   : React.PropTypes.func
};

TextBox.defaultProps = {
    className : 'TextBox',
    theme     : 'light',
    disabled  : false
};

module.exports = TextBox;
