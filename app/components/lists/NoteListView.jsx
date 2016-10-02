'use strict';

import React from 'react';
import ListView from './ListView.jsx';
import ListViewStore from './ListViewStore';
import Text from '../text/Text.jsx';
import { observer } from 'mobx-react';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';

@observer
export default class NoteListView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

        return (
            <div style={{ height : 'calc(100vh - ' + (Config.topBarHeight + Config.bottomBarHeight + 2) + 'px)', overflowY : 'auto' }}>
                <ListView
                    header={this.props.store.headerText}
                    selectedIndex={this.props.store.selectedIndex}
                    backgroundColor={this.props.backgroundColor}
                    onItemClick={this.props.onItemClick}
                    onItemRightClick={this.props.onItemRightClick}>
                    {this.props.store.items.map(item => {
                        return (
                            <div
                                key={Unique.elementId('listViewItem') + '-' + item.itemId}
                                style={{ width : 'calc(100% - ' + Config.paddingX2 + 'px)', padding : Config.paddingX1, borderBottom : '1px solid ' + theme.borderColor, cursor : 'default' }}>
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
    backgroundColor  : React.PropTypes.string,
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

module.exports = NoteListView;
