'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Text } from '../text/Text.jsx';
import { ListView } from '../lists/ListView.jsx';
import DialogStore from './DialogStore';
import ListViewStore from '../lists/ListViewStore';
import Constants from '../../utils/Constants';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

@observer
export default class ListViewDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

        const renderListItem = item => {
            return (
                <div
                    key={item.itemId}
                    style={{ width : '100%', paddingLeft : Constants.PADDING_X1 + 'px', paddingRight : Constants.PADDING_X1 + 'px', paddingTop : Constants.PADDING_X0 + 'px', paddingBottom : Constants.PADDING_X0 + 'px', borderBottom : '1px solid ' + theme.borderColor }}>
                    <Text theme={this.props.theme}>{item.primaryText}</Text>
                </div>
            );
        };

        return (
            <Dialog
                title="Editor"
                autoScrollBodyContent={true}
                open={this.props.store.visible}
                bodyStyle={{ padding : 0, overflowX : 'hidden' }}
                actions={[
                    <FlatButton
                        label="Close"
                        primary={true}
                        onTouchTap={() => this.props.store.visible = false} />
                ]}
                onRequestClose={() => this.props.store.visible = false}>
                <ListView
                    selectedIndex={this.props.listViewStore.selectedIndex}
                    backgroundColor={theme.primaryBackgroundColor}
                    theme={this.props.theme}
                    onItemClick={this.props.onItemClick}>
                    {this.props.listViewStore.items.map(item => renderListItem(item))}
                </ListView>
            </Dialog>
        );
    }
}

ListViewDialog.propTypes = {
    store         : React.PropTypes.instanceOf(DialogStore),
    listViewStore : React.PropTypes.instanceOf(ListViewStore),
    theme         : React.PropTypes.oneOf([ 'light', 'dark' ]),
    onItemClick   : React.PropTypes.func
};

ListViewDialog.defaultProps = {
    theme : 'light'
};

module.exports = ListViewDialog;
