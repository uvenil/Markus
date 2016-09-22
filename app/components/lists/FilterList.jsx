'use strict';

import React from 'react';
import { ListView, ListViewSection, ListViewSectionHeader, ListViewRow, Text } from 'react-desktop/macOs';
import ListStore from './ListStore';
import { observer } from 'mobx-react';
import Theme from '../../Theme';

const theme = new Theme();

@observer
export default class FilterList extends React.Component {
    constructor(props) {
        super(props);

        this._handleItemClick = (event, itemId) => {
            if (event.nativeEvent.button === 2) {
                // Right-clicked
                event.preventDefault();

                if (this.props.onItemRightClick) {
                    this.props.onItemRightClick(itemId);
                }
            } else {
                // Left-clicked
                if (this.props.store.selectedItemId !== itemId) {
                    this.props.store.selectedItemId    = itemId;
                    this.props.category.selectedItemId = undefined;

                    if (this.props.onItemClick) {
                        this.props.onItemClick(itemId);
                    }
                }
            }
        };

        this._handleCategoryClick = (event, itemId) => {
            if (event.nativeEvent.button === 2) {
                // Right-clicked
                event.preventDefault();

                if (this.props.onCategoryRightClick) {
                    this.props.onCategoryRightClick(itemId);
                }
            } else {
                // Left-clicked
                if (this.props.category.selectedItemId !== itemId) {
                    this.props.store.selectedItemId    = undefined;
                    this.props.category.selectedItemId = itemId;

                    if (this.props.onCategoryClick) {
                        this.props.onCategoryClick(itemId);
                    }
                }
            }
        };
    }

    render() {
        return (
            <div className="filterList">
                <ListView
                    disableRubberBand={true}
                    background={theme.secondaryBackgroundColor}>
                    <ListViewSection header={
                        <ListViewSectionHeader>{this.props.store.headerText}</ListViewSectionHeader>
                    }>
                        {this.props.store.items.map(item => {
                            return (
                                <div style={{ borderLeft : item.selected ? '4px solid #03a9f4' : 'none' }}>
                                    <ListViewRow
                                        key={item.itemId}
                                        background={item.selected ? theme.selectedBackgroundColor : null}
                                        marginTop={0}
                                        marginBottom={0}
                                        paddingLeft={item.selected ? 14 : 18}
                                        paddingRight={18}
                                        paddingTop={4}
                                        paddingBottom={4}
                                        onMouseDown={event => this._handleItemClick(event, item.itemId)}>
                                        <div style={{ width : '100%', display : 'flex', flexFlow : 'row' }}>
                                            <div style={{ flex : '1 1 0' }}>
                                                <Text>{item.primaryText}</Text>
                                            </div>
                                            <Text>{item.secondaryText}</Text>
                                        </div>
                                    </ListViewRow>
                                </div>
                            );
                        })}
                    </ListViewSection>
                    <ListViewSection header={
                        <ListViewSectionHeader>{this.props.category.headerText}</ListViewSectionHeader>
                    }>
                        {this.props.category.items.map(item => {
                            return (
                                <div style={{ borderLeft : item.selected ? '4px solid #03a9f4' : 'none' }}>
                                    <ListViewRow
                                        key={item.itemId}
                                        background={item.selected ? theme.selectedBackgroundColor : null}
                                        marginTop={0}
                                        marginBottom={0}
                                        paddingLeft={item.selected ? 14 : 18}
                                        paddingRight={18}
                                        paddingTop={4}
                                        paddingBottom={4}
                                        onMouseDown={event => this._handleCategoryClick(event, item.itemId)}>
                                        <div style={{ width : '100%', display : 'flex', flexFlow : 'row' }}>
                                            <div  style={{ flex : '1 1 0' }}>
                                                <Text>{item.primaryText}</Text>
                                            </div>
                                            <Text>{item.secondaryText}</Text>
                                        </div>
                                    </ListViewRow>
                                </div>
                            );
                        })}
                    </ListViewSection>
                </ListView>
            </div>
        );
    }
}

FilterList.propTypes = {
    store                : React.PropTypes.instanceOf(ListStore).isRequired,
    category             : React.PropTypes.instanceOf(ListStore).isRequired,
    onItemClick          : React.PropTypes.func,
    onItemRightClick     : React.PropTypes.func,
    onCategoryClick      : React.PropTypes.func,
    onCategoryRightClick : React.PropTypes.func
};

module.exports = FilterList;
