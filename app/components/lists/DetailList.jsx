// @flow
'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import List from './List.jsx';
import ListItemStore from './ListItemStore.jsx';
import ListStore from './ListStore';
import Text from '../text/Text.jsx';
import Unique from '../../utils/Unique';
import Constants from '../../Constants';
import Shortcuts from 'react-shortcuts/lib/component/shortcuts';

const requestFocus = (id : string) : void => {
    const detailList : any = document.getElementById(id);

    if (detailList) {
        const parentElement : any = detailList.parentElement;

        if (parentElement) parentElement.focus();
    }
};

const handleShortcuts = (id : string, action : string, store : ListStore) : void => {
    switch (action) {
        case 'up':
            if (store.selectedIndex > 0) {
                store.selectedIndex = store.selectedIndex - 1;

                requestFocus(id);
            }

            break;

        case 'down':
            if (store.selectedIndex < store.count - 1) {
                store.selectedIndex = store.selectedIndex + 1;

                requestFocus(id);
            }

            break;
    }
};

@observer
class DetailList extends React.Component {
    static propTypes : Object;

    _id : string;

    constructor(props : Object) {
        super(props);

        this._id = Unique.nextString('detailList');
    }

    render() : any {
        return (
            <Shortcuts
                name="listItem"
                className="no-outline"
                handler={(action : string) => handleShortcuts(this._id, action, this.props.store)}>
                <List
                    id={this._id}
                    header={this.props.store.headerText}
                    selectedIndex={this.props.store.selectedIndex}
                    className={this.props.className}
                    style={{
                        height    : 'calc(100vh - ' + (Constants.TOP_BAR_HEIGHT + Constants.BOTTOM_BAR_HEIGHT) + 'px)',
                        overflowY : 'auto'
                    }}
                    onItemClick={this.props.onItemClick}
                    onItemRightClick={this.props.onItemRightClick}>
                    {this.props.store.items.map((item : ListItemStore, index : number) => {
                        return (
                            <div
                                key={Unique.nextString('detailListItem' + index)}
                                title={item.tooltip}
                                style={{
                                    padding          : Constants.PADDING_X2,
                                    borderBottom     : '1px solid ' + this.props.muiTheme.palette.borderColor,
                                    WebkitUserSelect : 'none',
                                    cursor           : 'pointer'
                                }}>
                                <Text style={{
                                    lineHeight   : '1.7em',
                                    whiteSpace   : 'nowrap',
                                    overflow     : 'hidden',
                                    textOverflow : 'ellipsis',
                                    fontWeight   : 'bolder',
                                    fontSize     : '115%',
                                    cursor       : 'pointer'
                                }}>{item.primaryText}</Text>
                                <Text style={{
                                    height          : '3.0em',
                                    lineHeight      : '1.5em',
                                    display         : '-webkit-box',
                                    WebkitLineClamp : 2,
                                    WebkitBoxOrient : 'vertical',
                                    overflow        : 'hidden',
                                    textOverflow    : 'ellipsis',
                                    cursor          : 'pointer'
                                }}>{item.secondaryText}</Text>
                                <Text style={{
                                    lineHeight   : '1.5em',
                                    whiteSpace   : 'nowrap',
                                    overflow     : 'hidden',
                                    textOverflow : 'ellipsis',
                                    fontWeight   : 'lighter',
                                    fontSize     : '95%',
                                    cursor       : 'pointer'
                                }}>{item.tertiaryText}</Text>
                            </div>
                        );
                    })}
                </List>
            </Shortcuts>
        );
    }
}

DetailList.propTypes = {
    store            : React.PropTypes.instanceOf(ListStore).isRequired,
    className        : React.PropTypes.string,
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

export default muiThemeable()(DetailList);
