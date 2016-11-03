'use strict';

import React from 'react';
import ListView from './ListView.jsx';
import ListViewStore from './ListViewStore';
import Text from '../text/Text.jsx';
import { observer } from 'mobx-react';
import Unique from '../../utils/Unique';
import Constants from '../../utils/Constants';
import muiThemeable from 'material-ui/styles/muiThemeable';

@observer
class NoteListView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ListView
                header={this.props.store.headerText}
                selectedIndex={this.props.store.selectedIndex}
                style={{ height : 'calc(100vh - ' + (Constants.TOP_BAR_HEIGHT + Constants.BOTTOM_BAR_HEIGHT + 2) + 'px)', overflowY : 'auto' }}
                onItemClick={this.props.onItemClick}
                onItemRightClick={this.props.onItemRightClick}>
                {this.props.store.items.map(item => {
                    return (
                        <div
                            key={Unique.nextString()}
                            title={item.tooltip}
                            style={{ width : 'calc(100% - ' + Constants.PADDING_X2 + 'px)', padding : Constants.PADDING_X1, borderBottom : '1px solid ' + this.props.muiTheme.palette.borderColor, cursor : 'default' }}>
                            <Text style={{ lineHeight : '1.5em', whiteSpace : 'nowrap', overflow : 'hidden', textOverflow : 'ellipsis', fontWeight : 'bolder', fontSize : '105%' }}>{item.primaryText}</Text>
                            <Text style={{ lineHeight : '1.2em', height : '2.4em', display : '-webkit-box', WebkitLineClamp : 2, WebkitBoxOrient : 'vertical', overflow : 'hidden', textOverflow : 'ellipsis' }}>{item.secondaryText}</Text>
                            <Text style={{ whiteSpace : 'nowrap', overflow : 'hidden', textOverflow : 'ellipsis', fontWeight : 'lighter', fontSize : '95%' }}>{item.tertiaryText}</Text>
                        </div>
                    );
                })}
            </ListView>
        );
    }
}

NoteListView.propTypes = {
    store            : React.PropTypes.instanceOf(ListViewStore).isRequired,
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

export default muiThemeable()(NoteListView);
