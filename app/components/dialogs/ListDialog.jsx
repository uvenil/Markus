// @flow
'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Dialog from 'material-ui/Dialog';
import Button from '../buttons/Button.jsx';
import Text from '../text/Text.jsx';
import List from '../lists/List.jsx';
import ListItemStore from '../lists/ListItemStore.jsx';
import ListDialogStore from './ListDialogStore';
import Constants from '../../Constants';
import Shortcuts from 'react-shortcuts/lib/component/shortcuts';

const ASYNC_DELAY = 100;

const requestFocus = (id : string) : void => {
    const element = document.getElementById(id);

    if (element) {
        const parentElement : any = element.parentElement;

        if (parentElement) parentElement.focus();
    }
};

const handleShortcuts = (id : string, action : string, store : ListDialogStore) : void => {
    switch (action) {
        case 'up':
            if (store.list.selectedIndex > 0) {
                store.list.selectedIndex = store.list.selectedIndex - 1;

                requestFocus(id);
            }

            break;

        case 'down':
            if (store.list.selectedIndex < store.list.count - 1) {
                store.list.selectedIndex = store.list.selectedIndex + 1;

                requestFocus(id);
            }

            break;
    }
};

@observer
class ListDialog extends React.Component {
    static propTypes : Object;

    _handleItemClick : Function;

    constructor(props : Object) {
        super(props);

        this._handleItemClick = (id : string, index : number) : void => {
            window.setTimeout(() => requestFocus(id), ASYNC_DELAY);

            if (this.props.onItemClick) this.props.onItemClick(index);
        };
    }

    render() : any {
        const renderListItem = (item : ListItemStore) : any => {
            return (
                <div
                    id={item.itemId}
                    key={item.itemId}
                    style={{
                        width            : '100%',
                        paddingLeft      : Constants.PADDING_X2,
                        paddingRight     : Constants.PADDING_X2,
                        paddingTop       : Constants.PADDING_X1,
                        paddingBottom    : Constants.PADDING_X1,
                        borderBottom     : '1px solid ' + this.props.muiTheme.palette.borderColor,
                        WebkitUserSelect : 'none',
                        cursor           : 'pointer'
                    }}>
                    <Text style={{ cursor : 'pointer' }}>{item.primaryText}</Text>
                </div>
            );
        };

        const actions = [
            <Button
                label="Close"
                labelSize={Constants.FONT_SIZE_BUTTON_DIALOG}
                color={this.props.positiveAction ? 'default' : 'primary'}
                height={Constants.BUTTON_HEIGHT_X1}
                onTouchTap={() => this.props.store.booleanValue = false} />
        ];

        if (this.props.neutralAction) actions.push(this.props.neutralAction);
        if (this.props.positiveAction) actions.push(this.props.positiveAction);

        return (
            <Dialog
                title={this.props.title}
                autoScrollBodyContent
                open={this.props.store.booleanValue}
                bodyStyle={{
                    padding : 0,
                    overflowX : 'hidden'
                }}
                actions={actions}
                onRequestClose={() => this.props.store.booleanValue = false}>
                <Shortcuts
                    name="listItem"
                    className="no-outline"
                    handler={(action : string) => handleShortcuts(this.props.id, action, this.props.store)}>
                    <List
                        id={this.props.id}
                        selectedIndex={this.props.store.list.selectedIndex}
                        backgroundColor={this.props.muiTheme.palette.canvasColor}
                        onItemClick={(index : number) => this._handleItemClick(this.props.id, index)}>
                        {this.props.store.list.items.map(item => renderListItem(item))}
                    </List>
                </Shortcuts>
            </Dialog>
        );
    }
}

ListDialog.propTypes = {
    store          : React.PropTypes.instanceOf(ListDialogStore).isRequired,
    id             : React.PropTypes.string,
    title          : React.PropTypes.string,
    neutralAction  : React.PropTypes.element,
    positiveAction : React.PropTypes.element,
    onItemClick    : React.PropTypes.func
};

export default muiThemeable()(ListDialog);
