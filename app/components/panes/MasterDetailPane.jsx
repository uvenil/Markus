'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import SplitPane from 'react-split-pane';
import Text from '../text/Text.jsx';
import ListView from '../lists/ListView.jsx';
import ListViewStore from '../lists/ListViewStore';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';

@observer
export default class MasterDetailPane extends React.Component {
    constructor(props) {
        super(props);

        this._childIds = [];

        this.props.children.forEach((child, i) => this._childIds.push(Unique.elementId('md-' + i)));

        this._handleItemClick = index => {
            this.props.masterStore.selectedIndex = index;
        };
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

        return (
            <SplitPane
                split="vertical"
                defaultSize={this.props.masterWidth}
                allowResize={false}
                style={{ backgroundColor : theme.secondaryBackgroundColor }}>
                <ListView
                    selectedIndex={this.props.masterStore.selectedIndex}
                    backgroundColor={theme.secondaryBackgroundColor}
                    theme={this.props.theme}
                    onItemClick={index => this._handleItemClick(index)}>
                    {this.props.masterStore.items.map(item => {
                        return (
                            <div
                                key={item.itemId}
                                style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px', borderBottom : '1px solid ' + theme.borderColor }}>
                                <Text theme={this.props.theme}>{item.primaryText}</Text>
                            </div>
                        );
                    })}
                </ListView>
                <div>
                    {this.props.children.map((child, i) => {
                        return (
                            <div
                                id={this._childIds[i]}
                                key={this._childIds[i]}
                                style={{ display : this.props.masterStore.selectedIndex === i ? 'block' : 'none' }}>
                                {child}
                            </div>
                        );
                    })}
                </div>
            </SplitPane>
        );
    }
}

MasterDetailPane.propTypes = {
    masterWidth : React.PropTypes.number.isRequired,
    masterStore : React.PropTypes.instanceOf(ListViewStore).isRequired,
    theme       : React.PropTypes.oneOf([ 'light', 'dark' ])
};

MasterDetailPane.defaultProps = {
    theme : 'light'
};

module.exports = MasterDetailPane;
