'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import { ListView, ListViewSection, ListViewRow, Text } from 'react-desktop/macOs';
import ListStore from './ListStore';
import Theme from '../../Theme';
import Config from '../../../config/config.json';

const theme = new Theme();

@observer
export default class SimpleList extends React.Component {
    constructor(props) {
        super(props);

        this._handleItemClick = itemId => {
            if (this.props.store.selectedItemId !== itemId) {
                this.props.store.selectedItemId = itemId;

                if (this.props.onItemClick) {
                    this.props.onItemClick(itemId);
                }
            }
        };
    }

    render() {
        return (
            <div className="simpleList">
                <ListView
                    disableRubberBand={true}
                    background={theme.primaryBackgroundColor}>
                    <ListViewSection>
                        {this.props.store.items.map(item => {
                            return (
                                <div key={item.itemId + '-container'}>
                                    <ListViewRow
                                        key={item.itemId}
                                        background={item.selected ? theme.selectedBackgroundColor : null}
                                        marginTop={0}
                                        marginBottom={0}
                                        paddingLeft={Config.paddingX1}
                                        paddingRight={Config.paddingX1}
                                        paddingTop={4}
                                        paddingBottom={4}
                                        onClick={() => this._handleItemClick(item.itemId)}>
                                        <Text>{item.primaryText}</Text>
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

SimpleList.propTypes = {
    store       : React.PropTypes.instanceOf(ListStore).isRequired,
    onItemClick : React.PropTypes.func,
};

module.exports = SimpleList;
