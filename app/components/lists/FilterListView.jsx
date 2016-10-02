'use strict';

import React from 'react';
import ListView from './ListView.jsx';
import ListViewStore from './ListViewStore';
import Text from '../text/Text.jsx';
import { observer } from 'mobx-react';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';

@observer
export default class FilterListView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px' }}>
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
                                style={{ width : '100%', display : 'flex', flexFlow : 'row', paddingLeft : Config.paddingX2 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px' }}>
                                <div style={{ flex : '1 1 0' }}>
                                    <Text>{item.primaryText}</Text>
                                </div>
                                <Text>{item.secondaryText}</Text>
                            </div>
                        );
                    })}
                </ListView>
            </div>
        );
    }
}

FilterListView.propTypes = {
    store            : React.PropTypes.instanceOf(ListViewStore).isRequired,
    backgroundColor  : React.PropTypes.string,
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

module.exports = FilterListView;
