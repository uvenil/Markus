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
            <div style={{ height : 'calc(100vh - ' + (Constants.TOP_BAR_HEIGHT + Constants.BOTTOM_BAR_HEIGHT + 2) + 'px)', overflowY : 'auto' }}>
                <ListView
                    header={this.props.store.headerText}
                    selectedIndex={this.props.store.selectedIndex}
                    onItemClick={this.props.onItemClick}
                    onItemRightClick={this.props.onItemRightClick}>
                    {this.props.store.items.map(item => {
                        return (
                            <div
                                key={Unique.elementId()}
                                title={item.tooltip}
                                style={{ width : 'calc(100% - ' + Constants.PADDING_X2 + 'px)', padding : Constants.PADDING_X1, borderBottom : '1px solid ' + this.props.muiTheme.palette.borderColor, cursor : 'default' }}>
                                <Text>
                                    <div style={{ lineHeight : '1.5em', whiteSpace : 'nowrap', overflow : 'hidden', textOverflow : 'ellipsis', fontWeight : 'bolder', fontSize : '105%' }}>
                                        {item.primaryText}
                                    </div>
                                </Text>
                                <Text>
                                    <div style={{ lineHeight : '1.2em', height : '2.4em', display : '-webkit-box', WebkitLineClamp : 2, WebkitBoxOrient : 'vertical', overflow : 'hidden', textOverflow : 'ellipsis' }}>
                                        {item.secondaryText}
                                    </div>
                                </Text>
                                <Text>
                                    <div style={{ whiteSpace : 'nowrap', overflow : 'hidden', textOverflow : 'ellipsis', fontWeight : 'lighter', fontSize : '95%' }}>
                                        {item.tertiaryText}
                                    </div>
                                </Text>
                            </div>
                        );
                    })}
                </ListView>
            </div>
        );
    }
}

NoteListView.propTypes = {
    store            : React.PropTypes.instanceOf(ListViewStore).isRequired,
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

export default muiThemeable()(NoteListView);
