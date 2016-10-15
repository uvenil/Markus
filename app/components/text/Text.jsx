'use strict';

import React from 'react';

export default class Text extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const theme     = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');
        const textColor = this.props.textColor ? this.props.textColor : theme.primaryTextColor;

        return (
            <span
                className={this.props.className}
                style={{ display : 'block', WebkitUserSelect : 'none', cursor : 'default', fontFamily : this.props.fontFamily, fontWeight : this.props.fontWeight, fontSize : this.props.textSize, color : textColor, pointerEvents : this.props.disabled ? 'none' : 'auto' }}>
                {this.props.children}
            </span>
        );
    }
}

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

module.exports = Text;
