'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Dialog from 'material-ui/Dialog';
import Button from '../buttons/Button.jsx';
import Text from '../text/Text.jsx';
import List from '../lists/List.jsx';
import ListDialogStore from './ListDialogStore';
import Constants from '../../utils/Constants';
import muiThemeable from 'material-ui/styles/muiThemeable';

@observer
class ListDialog extends React.Component {
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

        const actions = [
            <Button
                label="Close"
                color={this.props.positiveAction ? 'default' : 'primary'}
                onTouchTap={() => this.props.store.booleanValue = false} />
        ];

        if (this.props.neutralAction) actions.push(this.props.neutralAction);
        if (this.props.positiveAction) actions.push(this.props.positiveAction);

        return (
            <Dialog
                title={this.props.title}
                autoScrollBodyContent={true}
                open={this.props.store.booleanValue}
                bodyStyle={{ padding : 0, overflowX : 'hidden' }}
                actions={actions}
                onRequestClose={() => this.props.store.booleanValue = false}>
                <List
                    selectedIndex={this.props.store.list.selectedIndex}
                    backgroundColor={this.props.muiTheme.palette.canvasColor}
                    onItemClick={this.props.onItemClick}>
                    {this.props.store.list.items.map(item => renderListItem(item))}
                </List>
            </Dialog>
        );
    }
}

ListDialog.propTypes = {
    store          : React.PropTypes.instanceOf(ListDialogStore),
    title          : React.PropTypes.string,
    neutralAction  : React.PropTypes.element,
    positiveAction : React.PropTypes.element,
    onItemClick    : React.PropTypes.func
};

export default muiThemeable()(ListDialog);
