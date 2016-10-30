'use strict';

import React from 'react';
import Text from '../text/Text.jsx';
import Unique from '../../utils/Unique';
import Constants from '../../utils/Constants';
import muiThemeable from 'material-ui/styles/muiThemeable';

const ListView = props => {
    let header;

    if (props.header) {
        header = (
            <div style={{ paddingLeft : Constants.PADDING_X1, paddingRight : Constants.PADDING_X1, paddingTop : Constants.PADDING_X0, paddingBottom : Constants.PADDING_X0 }}>
                <Text className="ListViewHeader">{props.header}</Text>
            </div>
        );
    }

    return (
        <div className={props.className}>
            {header}
            {props.children.map((child, index) => {
                return (
                    <div
                        key={Unique.elementId()}
                        style={{ backgroundColor : index === props.selectedIndex ? props.muiTheme.palette.accent2Color : 'transparent' }}
                        onMouseDown={event => {
                            if (event.nativeEvent.button === 2) {
                                if (props.onItemRightClick) props.onItemRightClick(index);
                            } else {
                                if (props.onItemClick) props.onItemClick(index);
                            }
                        }}>
                        {child}
                    </div>
                );
            })}
        </div>
    );
};

ListView.propTypes = {
    header           : React.PropTypes.node,
    selectedIndex    : React.PropTypes.number,
    className        : React.PropTypes.string,
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

ListView.defaultProps = {
    selectedIndex : -1,
    className     : 'ListView'
};

export default muiThemeable()(ListView);
