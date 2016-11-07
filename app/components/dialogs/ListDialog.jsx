'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Dialog from 'material-ui/Dialog';
import Button from '../buttons/Button.jsx';
import Text from '../text/Text.jsx';
import List from '../lists/List.jsx';
import ListDialogStore from './ListDialogStore';
import Constants from '../../utils/Constants';
import { Shortcuts } from 'react-shortcuts';

@observer
class ListDialog extends React.Component {
    constructor(props) {
        super(props);

        this._focus = () => document.getElementById(this.props.id).parentElement.focus();

        this._handleItemClick = index => {
            window.setTimeout(() => this._focus(), 100);

            if (this.props.onItemClick) {
                this.props.onItemClick(index);
            }
        };

        this._handleShortcuts = action => {
            switch (action) {
                case 'up':
                    if (this.props.store.list.selectedIndex > 0) {
                        this.props.store.list.selectedIndex = this.props.store.list.selectedIndex - 1;

                        this._focus();
                    }

                    break;

                case 'down':
                    if (this.props.store.list.selectedIndex < this.props.store.list.count - 1) {
                        this.props.store.list.selectedIndex = this.props.store.list.selectedIndex + 1;

                        this._focus();
                    }

                    break;
            }
        };
    }

    render() {
        const renderListItem = item => {
            return (
                <div
                    id={item.itemId}
                    key={item.itemId}
                    style={{ width : '100%', paddingLeft : Constants.PADDING_X2, paddingRight : Constants.PADDING_X2, paddingTop : Constants.PADDING_X1, paddingBottom : Constants.PADDING_X1, borderBottom : '1px solid ' + this.props.muiTheme.palette.borderColor, WebkitUserSelect : 'none', cursor : 'pointer' }}>
                    <Text style={{ cursor : 'pointer' }}>{item.primaryText}</Text>
                </div>
            );
        };

        const actions = [
            <Button
                label="Close"
                labelSize={Constants.DIALOG_BUTTON_FONT_SIZE}
                color={this.props.positiveAction ? 'default' : 'primary'}
                height={Constants.BUTTON_HEIGHT_X1}
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
                <Shortcuts
                    name="listItem"
                    className="no-outline"
                    handler={this._handleShortcuts}>
                    <List
                        id={this.props.id}
                        selectedIndex={this.props.store.list.selectedIndex}
                        backgroundColor={this.props.muiTheme.palette.canvasColor}
                        onItemClick={index => this._handleItemClick(index)}>
                        {this.props.store.list.items.map(item => renderListItem(item))}
                    </List>
                </Shortcuts>
            </Dialog>
        );
    }
}

ListDialog.propTypes = {
    id             : React.PropTypes.string,
    store          : React.PropTypes.instanceOf(ListDialogStore),
    title          : React.PropTypes.string,
    neutralAction  : React.PropTypes.element,
    positiveAction : React.PropTypes.element,
    onItemClick    : React.PropTypes.func
};

export default muiThemeable()(ListDialog);
