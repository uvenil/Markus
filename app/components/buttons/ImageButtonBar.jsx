'use strict';

import React from 'react';
import ImageButton from './ImageButton';
import ImageButtonBarStore from './ImageButtonBarStore';
import MenuImageButton from './MenuImageButton';
import MenuImageButtonStore from './MenuImageButtonStore';
import { observer } from 'mobx-react';
import Config from '../../../config/config.json';

@observer
export default class ImageButtonBar extends React.Component {
    constructor(props) {
        super(props);

        this._handleClick = (item, index) => {
            if (!item.disabled && this.props.onTouchTap) {
                this.props.onTouchTap(item.itemId, index);
            }
        };

        this._handleTouchTap = item => {
            if (!item.disabled && this.props.onTouchTap) {
                this.props.onTouchTap(item.itemId);
            }
        };
    }

    render() {
        const items = [];

        this.props.store.items.forEach(item => {
            if (item instanceof MenuImageButtonStore) {
                items.push(
                    <MenuImageButton
                        key={item.itemId}
                        store={item}
                        menuPosition={this.props.tooltipPosition}
                        onClick={index => this._handleClick(item, index)} />
                );
            } else {
                if (item.icon === '-') {
                    items.push(
                        <span
                            key={item.itemId}
                            style={{
                                marginLeft  : Config.paddingX1,
                                marginRight : Config.paddingX1,
                                borderLeft  : '1px solid rgba(0, 0, 0, 0.5)'
                            }} />
                    );
                } else {
                    items.push(
                        <ImageButton
                            key={item.itemId}
                            store={item}
                            tooltipPosition={this.props.tooltipPosition}
                            onClick={() => this._handleTouchTap(item)} />
                    );
                }
            }
        });

        return (
            <div style={{ display : 'inline-block', whiteSpace : 'nowrap', backgroundColor : this.props.store.backgroundColor }}>{items}</div>
        );
    }
}

ImageButtonBar.propTypes = {
    store           : React.PropTypes.instanceOf(ImageButtonBarStore).isRequired,
    tooltipPosition : React.PropTypes.string,
    onTouchTap      : React.PropTypes.func
};

ImageButtonBar.defaultProps = {
    tooltipPosition : 'bottom-right'
};

module.exports = ImageButtonBar;
