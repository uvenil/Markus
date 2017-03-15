// @flow
'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Label from '../text/Label.jsx';
import List from './List.jsx';
import ListItemStore from './ListItemStore.jsx';
import ListStore from './ListStore';
import Unique from '../../utils/Unique';
import Constants from '../../Constants';

@observer
class MasterList extends React.Component {
    static propTypes    : Object;
    static defaultProps : Object;

    render() : any {
        return (
            <List
                header={this.props.store.headerText}
                selectedIndex={this.props.store.selectedIndex}
                style={{
                    paddingTop    : Constants.PADDING_X1,
                    paddingBottom : Constants.PADDING_X1
                }}
                onItemClick={this.props.onItemClick}
                onItemRightClick={this.props.onItemRightClick}>
                {this.props.store.items.map((item : ListItemStore) => {
                    const iconName = item.icon ? item.icon : this.props.icon;

                    const icon : any = iconName ? (
                        <i
                            className={'fa fa-fw fa-' + iconName}
                            style={{ color : this.props.muiTheme.palette.textColor }} />
                        ): '';

                    return (
                        <div
                            key={Unique.nextString('MasterList')}
                            style={{
                                display          : 'flex',
                                flexFlow         : 'row',
                                paddingLeft      : Constants.PADDING_X3,
                                paddingRight     : Constants.PADDING_X2,
                                paddingTop       : Constants.PADDING_X1,
                                paddingBottom    : Constants.PADDING_X1,
                                WebkitUserSelect : 'none',
                                cursor           : 'pointer'
                            }}>
                            <div
                                style={{
                                    flex         : '1 1 0',
                                    overflow     : 'hidden',
                                    textOverflow : 'ellipsis',
                                    whiteSpace   : 'nowrap'
                                }}>
                                {icon}
                                <Label style={{ cursor : 'pointer' }}>&nbsp;{item.primaryText}</Label>
                            </div>
                            <Label
                                style={{
                                    fontWeight : 300,
                                    cursor     : 'pointer'
                                }}>
                                {item.secondaryText}
                            </Label>
                        </div>
                    );
                })}
            </List>
        );
    }
}

MasterList.propTypes = {
    store            : React.PropTypes.instanceOf(ListStore).isRequired,
    icon             : React.PropTypes.string,
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

MasterList.defaultProps = {
    icon : 'tags'
};

export default muiThemeable()(MasterList);
