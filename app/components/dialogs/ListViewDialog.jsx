'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Dialog from 'material-ui/Dialog';
import Button from '../buttons/Button.jsx';
import Text from '../text/Text.jsx';
import ListView from '../lists/ListView.jsx';
import ListViewDialogStore from './ListViewDialogStore';
import Constants from '../../utils/Constants';
import PubSub from 'pubsub-js';
import is from 'electron-is';
import muiThemeable from 'material-ui/styles/muiThemeable';

if (is.dev()) PubSub.immediateExceptions = true;

@observer
class ListViewDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const renderListItem = item => {
            return (
                <div
                    key={item.itemId}
                    style={{ width : '100%', paddingLeft : Constants.PADDING_X2, paddingRight : Constants.PADDING_X2, paddingTop : Constants.PADDING_X1, paddingBottom : Constants.PADDING_X1, borderBottom : '1px solid ' + this.props.muiTheme.palette.borderColor }}>
                    <Text>{item.primaryText}</Text>
                </div>
            );
        };

        return (
            <Dialog
                title={this.props.title}
                autoScrollBodyContent={true}
                open={this.props.store.booleanValue}
                bodyStyle={{ padding : 0, overflowX : 'hidden' }}
                actions={[
                    <Button
                        label="Close"
                        color="primary"
                        onTouchTap={() => this.props.store.booleanValue = false} />
                ]}
                onRequestClose={() => this.props.store.booleanValue = false}>
                <ListView
                    selectedIndex={this.props.store.list.selectedIndex}
                    backgroundColor={this.props.muiTheme.palette.canvasColor}
                    onItemClick={this.props.onItemClick}>
                    {this.props.store.list.items.map(item => renderListItem(item))}
                </ListView>
            </Dialog>
        );
    }
}

ListViewDialog.propTypes = {
    store       : React.PropTypes.instanceOf(ListViewDialogStore),
    title       : React.PropTypes.string,
    onItemClick : React.PropTypes.func
};

export default muiThemeable()(ListViewDialog);
