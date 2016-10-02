'use strict';

import React from 'react';
import Unique from '../../utils/Unique';

export default class Overlay extends React.Component {
    constructor(props) {
        super(props);

        this._overlayId = Unique.elementId('popUp-overlay');
        this._targetId  = Unique.elementId('popUp-target');
        this._popUpId   = Unique.elementId('popUp-popUp');

        this._showPopUp = () => {
            const overlay = document.getElementById(this._overlayId);
            const popUp   = document.getElementById(this._popUpId);

            popUp.style.display = 'block';

            if (this.props.hAnchor === 'right') {
                popUp.style.left = (overlay.offsetWidth - popUp.offsetWidth) + 'px';
            } else if (this.props.hAnchor === 'left') {
                popUp.style.left = 0;
            }

            if (this.props.vAnchor === 'bottom') {
                popUp.style.top = -popUp.offsetHeight + 'px';
            } else if (this.props.vAnchor === 'top') {
                popUp.style.top = 0;
            }
        };

        this._handleClick = () => {
            if (this.props.trigger === 'click') {
                this._showPopUp();
            }
        };

        this._handleMouseOver = () => {
            if (this.props.trigger === 'hover') {
                this._showPopUp();
            }
        };

        this._handleFocus = () => {
            if (this.props.trigger === 'focus') {
                this._showPopUp();
            }
        };

        this._handleBlur = () => {
            const popUps = document.getElementsByClassName('PopUpContent');

            for (let i = 0; i < popUps.length; i++) {
                popUps[i].style.display = 'none';
            }
        };
    }

    render() {
        return (
            <div
                id={this._overlayId}
                className="PopUp"
                style={{ width : '100%' }}>
                <div
                    id={this._targetId}
                    onClick={() => this._handleClick()}
                    onMouseOver={() => this._handleMouseOver()}
                    onFocus={() => this._handleFocus()}
                    onBlur={() => this._handleBlur()}>
                    {this.props.children}
                </div>
                <div
                    id={this._popUpId}
                    className="PopUpContent">
                    {this.props.popUp}
                </div>
            </div>
        );
    }
}

Overlay.propTypes = {
    trigger : React.PropTypes.oneOf([ 'click', 'hover', 'focus' ]),
    hAnchor : React.PropTypes.oneOf([ 'left', 'right' ]),
    vAnchor : React.PropTypes.oneOf([ 'top', 'bottom' ]),
    popUp   : React.PropTypes.element
};

Overlay.defaultProps = {
    trigger : 'click',
    hAnchor : 'left',
    vAnchor : 'top'
};

module.exports = Overlay;
