'use strict';

import React from 'react';
import { Popover, MenuItem, OverlayTrigger } from 'react-bootstrap';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import MenuImageButtonStore from './MenuImageButtonStore';
import { observer } from 'mobx-react';
import Theme from '../../Theme';

const theme = new Theme();

@observer
export default class MenuImageButton extends React.Component {
    constructor(props) {
        super(props);

        this._handleClick = index => {
            this.props.store.selectedIndex = this.props.store.selectedIndex === index ? -1 : index;

            if (this.props.onClick) {
                this.props.onClick(index);
            }
        };
    }

    render() {
        return (
            <OverlayTrigger
                trigger="click"
                placement={this.props.menuPosition}
                rootClose={true}
                overlay={
                    <Popover id={this.props.store.itemId + '-popover'}>
                        <ul className="dropdown-menu" style={{ display : 'block', position : 'static', minWidth : 0, border : 0, boxShadow : 'none', WebkitBoxShadow : 'none' }}>
                        {this.props.store.items.map((item, index) => {
                            return (
                                <MenuItem
                                    key={item + '-' + index}
                                    eventKey={index}
                                    onSelect={() => this._handleClick(index)}>
                                    <span style={{ fontWeight : this.props.store.selectedIndex === index ? 'bold' : 'normal' }}>{item}</span>
                                </MenuItem>
                            );
                        })}
                        </ul>
                    </Popover>
                }>
                <IconButton
                    disabled={this.props.store.disabled}
                    className="imageButton">
                    <FontIcon
                        className={'imageButton ' + this.props.store.icon}
                        style={{ color : this.props.store.disabled ? theme.disabledTextColor : '' }} />
                </IconButton>
            </OverlayTrigger>
        );
    }
}

MenuImageButton.propTypes = {
    store        : React.PropTypes.instanceOf(MenuImageButtonStore).isRequired,
    menuPosition : React.PropTypes.oneOf([ 'left', 'right', 'top', 'bottom' ]),
    onClick      : React.PropTypes.func
};

MenuImageButton.defaultProps = {
    menuPosition : 'right'
};

module.exports = MenuImageButton;
