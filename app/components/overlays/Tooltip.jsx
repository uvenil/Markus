'use strict';

import React from 'react';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';

export default class Tooltip extends React.Component {
    constructor(props) {
        super(props);

        this._tooltipId = Unique.elementId('tooltip');

        this._handleMouseOver = () => {
            const tooltip = document.getElementById(this._tooltipId);

            tooltip.style.visibility = 'visible';

            if (this.props.anchor === 'left') {
                tooltip.style.top   = -Config.paddingX0 + 'px';
                tooltip.style.right = '105%';
            } else if (this.props.anchor === 'right') {
                tooltip.style.top  = -Config.paddingX0 + 'px';
                tooltip.style.left = '105%';
            } else if (this.props.anchor === 'top') {
                tooltip.style.left       = '50%';
                tooltip.style.bottom     = '100%';
                tooltip.style.marginLeft = -(tooltip.offsetWidth / 2) + 'px';
            } else if (this.props.anchor === 'bottom') {
                tooltip.style.left       = '50%';
                tooltip.style.top        = '100%';
                tooltip.style.marginLeft = -(tooltip.offsetWidth / 2) + 'px';
            }
        };

        this._handleMouseOut = () => {
            const tooltip = document.getElementById(this._tooltipId);

            tooltip.style.visibility = 'hidden';
        };
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

        let textColor       = this.props.textColor ? this.props.textColor : theme.primaryBackgroundColor;
        let backgroundColor = this.props.backgroundColor ? this.props.backgroundColor : theme.primaryTextColor;

        return (
            <div
                style={{ display : 'inline-block', position : 'relative' }}
                onMouseOver={() => this._handleMouseOver()}
                onMouseOut={() => this._handleMouseOut()}>
                {this.props.children}
                <span
                    id={this._tooltipId}
                    style={{ width : this.props.width + 'px', position : 'absolute', visibility : 'hidden', padding : Config.paddingX1, color : textColor, backgroundColor : backgroundColor, textAlign : 'center', borderRadius : Config.paddingX0 + 'px', zIndex : 1 }}>
                    {this.props.content}
                </span>
            </div>
        );
    }
}

Tooltip.propTypes = {
    content         : React.PropTypes.node,
    width           : React.PropTypes.number.isRequired,
    anchor          : React.PropTypes.oneOf([ 'left', 'right', 'top', 'bottom' ]),
    backgroundColor : React.PropTypes.string,
    textColor       : React.PropTypes.string,
    theme           : React.PropTypes.oneOf([ 'light', 'dark' ])
};

Tooltip.defaultProps = {
    anchor : 'bottom',
    theme  : 'light'
};

module.exports = Tooltip;
