'use strict';

import React from 'react';

export default class Label extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const theme     = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');
        const textColor = this.props.textColor ? this.props.textColor : theme.primaryTextColor;

        return (
            <span
                className={this.props.className}
                style={{ WebkitUserSelect : 'none', cursor : 'default', fontFamily : this.props.fontFamily, fontWeight : this.props.fontWeight, fontSize : this.props.textSize, color : textColor, pointerEvents : this.props.disabled ? 'none' : 'auto' }}>
                {this.props.children}
            </span>
        );
    }
}

Label.propTypes = {
    className  : React.PropTypes.string,
    fontFamily : React.PropTypes.string,
    fontWeight : React.PropTypes.oneOfType([ React.PropTypes.string, React.PropTypes.number ]),
    textSize   : React.PropTypes.string,
    textColor  : React.PropTypes.string,
    theme      : React.PropTypes.oneOf([ 'light', 'dark' ]),
    disabled   : React.PropTypes.bool
};

Label.defaultProps = {
    className : 'Label',
    theme     : 'light',
    disabled  : false
};

module.exports = Label;
