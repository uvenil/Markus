'use strict';

import React from 'react';
import { Popover, MenuItem, OverlayTrigger } from 'react-bootstrap';
import { Text } from 'react-desktop/macOs';
import MenuTextButtonStore from './MenuTextButtonStore';
import { observer } from 'mobx-react';
import Theme from '../../Theme';

const theme = new Theme();

@observer
export default class MenuTextButton extends React.Component {
    constructor(props) {
        super(props);

        this._handleClick = index => {
            this.props.store.selectedIndex = index;

            if (this.props.onClick) {
                this.props.onClick(index);
            }
        };
    }

    render() {
        if (this.props.store.disabled) {
            return (
                <Text
                    textAlign="right"
                    color={theme.disabledTextColor}>{this.props.store.text}</Text>
            );
        }

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
                <Text textAlign="right">{this.props.store.text}</Text>
            </OverlayTrigger>
        );
    }
}

MenuTextButton.propTypes = {
    store        : React.PropTypes.instanceOf(MenuTextButtonStore).isRequired,
    menuPosition : React.PropTypes.oneOf([ 'left', 'right', 'top', 'bottom' ]),
    onClick      : React.PropTypes.func
};

MenuTextButton.defaultProps = {
    menuPosition : 'right'
};

module.exports = MenuTextButton;
