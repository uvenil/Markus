'use strict';

import React from 'react';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';

export default class TextBox extends React.Component {
    constructor(props) {
        super(props);

        this._id = Unique.elementId('a');

        this.state = {
            value : ''
        };

        this._handleChange = value => {
            this.setState({
                value : value
            });

            if (this.props.onChange) {
                this.props.onChange(value);
            }
        };

        this._handleEnter = value => {
            if (this.props.onEnter) {
                this.props.onEnter(value);
            }
        };

        this._handleEsc = value => {
            if (this.props.onEsc) {
                this.props.onEsc(value);
            }
        };
    }

    get value() {
        return this.state.value;
    }

    set value(value) {
        this.setState({
            value : value
        });
    }

    focus() {
        document.getElementById(this._id).focus();
    }

    render() {
        const theme     = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');
        const textColor = this.props.textColor ? this.props.textColor : theme.primaryTextColor;

        return (
            <input
                id={this._id}
                type="text"
                value={this.state.value}
                className={this.props.className}
                style={{ WebkitUserSelect : 'none', fontFamily : this.props.fontFamily, fontSize : this.props.textSize, color : textColor, outline : 'none', borderWidth : '1px', borderStyle : 'solid', borderRadius : Config.paddingX0 + 'px', borderColor : theme.borderColor, padding : Config.paddingX0 + 'px', pointerEvents : this.props.disabled ? 'none' : 'auto' }}
                onChange={event => this._handleChange(event.target.value)}
                onKeyPress={event => {
                    if (event.key === 'Enter') {
                        this._handleEnter(event.target.value);
                    } else if (event.key === 'Escape') {
                        this._handleEsc(event.target.value);
                    }
                }} />
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
    onChange   : React.PropTypes.func,
    onEnter    : React.PropTypes.func,
    onEsc      : React.PropTypes.func
};

TextBox.defaultProps = {
    className : 'TextBox',
    theme     : 'light',
    disabled  : false
};

module.exports = TextBox;
