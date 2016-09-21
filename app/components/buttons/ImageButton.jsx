'use strict';

import React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import ImageButtonStore from './ImageButtonStore';
import { observer } from 'mobx-react';
import Theme from '../../Theme';

const theme = new Theme();

@observer
export default class ImageButton extends React.Component {
    constructor(props) {
        super(props);

        this._handleClick = () => {
            if (!this.props.store.disabled && this.props.onClick) {
                this.props.onClick();
            }
        };
    }

    render() {
        return (
            <OverlayTrigger
                trigger="hover"
                placement={this.props.tooltipPosition}
                overlay={
                    <Tooltip id={this.props.store.itemId + '-tooltip'}>{this.props.store.tooltip}</Tooltip>
                }>
                <IconButton
                    disabled={this.props.store.disabled}
                    className="imageButton"
                    onClick={this._handleClick}>
                    <FontIcon
                        className={'imageButton ' + this.props.store.icon}
                        style={{ color : this.props.store.disabled ? theme.disabledTextColor : '' }} />
                </IconButton>
            </OverlayTrigger>
        );
    }
}

ImageButton.propTypes = {
    store           : React.PropTypes.instanceOf(ImageButtonStore).isRequired,
    tooltipPosition : React.PropTypes.oneOf([ 'left', 'right', 'top', 'bottom' ]),
    onClick         : React.PropTypes.func
};

ImageButton.defaultProps = {
    tooltipPosition : 'bottom'
};

module.exports = ImageButton;
