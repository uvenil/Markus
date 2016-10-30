'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import Label from '../text/Label.jsx';
import ListView from './ListView.jsx';
import ListViewStore from './ListViewStore';
import Unique from '../../utils/Unique';
import Constants from '../../utils/Constants';
import muiThemeable from 'material-ui/styles/muiThemeable';

@observer
class FilterListView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ paddingTop : Constants.PADDING_X0, paddingBottom : Constants.PADDING_X0 }}>
                <ListView
                    header={this.props.store.headerText}
                    selectedIndex={this.props.store.selectedIndex}
                    onItemClick={this.props.onItemClick}
                    onItemRightClick={this.props.onItemRightClick}>
                    {this.props.store.items.map(item => {
                        const icon = item.icon ?
                            <i
                                className={'fa fa-fw fa-' + item.icon}
                                style={{ color : this.props.muiTheme.palette.textColor }} /> : '';

                        return (
                            <div
                                key={Unique.elementId()}
                                style={{ display : 'flex', flexFlow : 'row', paddingLeft : Constants.PADDING_X2, paddingRight : Constants.PADDING_X1, paddingTop : Constants.PADDING_X1, paddingBottom : Constants.PADDING_X1 }}>
                                <div style={{ flex : '1 1 0' }}>
                                    {icon}&nbsp;<Label>{item.primaryText}</Label>
                                </div>
                                <Label
                                    fontWeight={300}
                                    theme={this.props.theme}>
                                    {item.secondaryText}
                                </Label>
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
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

export default muiThemeable()(FilterListView);
