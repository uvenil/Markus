'use strict';

import React from 'react';
import { ListView, ListViewSection, ListViewRow, Text } from 'react-desktop/macOs';
import ListStore from './ListStore';
import { observer } from 'mobx-react';
import Theme from '../../Theme';
import Config from '../../../config/config.json';

const theme = new Theme();

@observer
export default class NoteList extends React.Component {
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
                    this.props.store.selectedItemId = itemId;

                    if (this.props.onItemClick) {
                        this.props.onItemClick(itemId);
                    }
                }
            }
        };
    }

    render() {
        return (
            <div className="noteList">
                <ListView disableRubberBand={true}>
                    <ListViewSection>
                        {this.props.store.items.map(item => {
                            return (
                                <ListViewRow
                                    key={item.itemId}
                                    background={item.selected ? theme.selectedBackgroundColor : null}
                                    onMouseDown={event => this._handleItemClick(event, item.itemId)}>
                                    <div style={{ flex : '1 1 0', padding : Config.paddingX1, borderBottom : '1px solid rgba(0, 0, 0, 0.25)', cursor : 'default' }}>
                                        <div style={{ lineHeight : '1.5em', whiteSpace : 'nowrap', overflow : 'hidden', textOverflow : 'ellipsis' }}>
                                            <Text bold={500}>{item.primaryText}</Text>
                                        </div>
                                        <div className="noteListItem" style={{ lineHeight : '1.2em', height : '2.4em', display : '-webkit-box', WebkitLineClamp : 2, WebkitBoxOrient : 'vertical', overflow : 'hidden', textOverflow : 'ellipsis' }}>
                                            <Text bold={400}>{item.secondaryText}</Text>
                                        </div>
                                        <div style={{ whiteSpace : 'nowrap', textOverflow : 'ellipsis' }}>
                                            <Text bold={300}>{item.tertiaryText}</Text>
                                        </div>
                                    </div>
                                </ListViewRow>
                            );
                        })}
                    </ListViewSection>
                </ListView>
            </div>
        );
    }
}

NoteList.propTypes = {
    store            : React.PropTypes.instanceOf(ListStore).isRequired,
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

module.exports = NoteList;
