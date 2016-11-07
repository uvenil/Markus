'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import List from './List.jsx';
import ListStore from './ListStore';
import Text from '../text/Text.jsx';
import { observer } from 'mobx-react';
import Unique from '../../utils/Unique';
import Constants from '../../utils/Constants';
import { Shortcuts } from 'react-shortcuts';

@observer
class NoteList extends React.Component {
    constructor(props) {
        super(props);

        this._handleShortcuts = action => {
            switch (action) {
                case 'up':
                    if (this.props.store.selectedIndex > 0) {
                        this.props.store.selectedIndex = this.props.store.selectedIndex - 1;

                        document.getElementById(this.props.store.selectedItem.itemId).parentElement.focus();
                    }

                    break;

                case 'down':
                    if (this.props.store.selectedIndex < this.props.store.count - 1) {
                        this.props.store.selectedIndex = this.props.store.selectedIndex + 1;

                        document.getElementById(this.props.store.selectedItem.itemId).parentElement.focus();
                    }

                    break;
            }
        };
    }

    render() {
        return (
            <List
                header={this.props.store.headerText}
                selectedIndex={this.props.store.selectedIndex}
                className={this.props.className}
                style={{ height : 'calc(100vh - ' + (Constants.TOP_BAR_HEIGHT + Constants.BOTTOM_BAR_HEIGHT) + 'px)', overflowY : 'auto' }}
                onItemClick={this.props.onItemClick}
                onItemRightClick={this.props.onItemRightClick}>
                {this.props.store.items.map(item => {
                    return (
                        <Shortcuts
                            name="NoteListItem"
                            className="no-outline"
                            handler={this._handleShortcuts}>
                            <div
                                id={item.itemId}
                                key={Unique.nextString()}
                                title={item.tooltip}
                                style={{ padding : Constants.PADDING_X2, borderBottom : '1px solid ' + this.props.muiTheme.palette.borderColor, WebkitUserSelect : 'none', cursor : 'pointer' }}>
                                <Text style={{ lineHeight : '1.7em', whiteSpace : 'nowrap', overflow : 'hidden', textOverflow : 'ellipsis', fontWeight : 'bolder', fontSize : '115%', cursor : 'pointer' }}>{item.primaryText}</Text>
                                <Text style={{ height : '3.0em', lineHeight : '1.5em', display : '-webkit-box', WebkitLineClamp : 2, WebkitBoxOrient : 'vertical', overflow : 'hidden', textOverflow : 'ellipsis', cursor : 'pointer' }}>{item.secondaryText}</Text>
                                <Text style={{ lineHeight : '1.5em', whiteSpace : 'nowrap', overflow : 'hidden', textOverflow : 'ellipsis', fontWeight : 'lighter', fontSize : '95%', cursor : 'pointer' }}>{item.tertiaryText}</Text>
                            </div>
                        </Shortcuts>
                    );
                })}
            </List>
        );
    }
}

NoteList.propTypes = {
    store            : React.PropTypes.instanceOf(ListStore).isRequired,
    className        : React.PropTypes.string,
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

export default muiThemeable()(NoteList);
