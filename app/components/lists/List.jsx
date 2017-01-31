'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Text from '../text/Text.jsx';
import Unique from '../../utils/Unique';
import Constants from '../../utils/Constants';

const List = props => {
    let header;

    if (props.header) {
        header = (
            <div style={{ paddingLeft : Constants.PADDING_X2, paddingRight : Constants.PADDING_X2, paddingTop : Constants.PADDING_X0, paddingBottom : Constants.PADDING_X1 }}>
                <Text style={{ fontWeight : 'bold', fontSize : 11, color : '#7a7b7c' }}>{props.header}</Text>
            </div>
        );
    }

    return (
        <div
            id={props.id}
            className={props.className}
            style={props.style}>
            {header}
            {props.children.map((child, index) => {
                return (
                    <div
                        key={Unique.nextString()}
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

List.propTypes = {
    id               : React.PropTypes.string,
    header           : React.PropTypes.node,
    selectedIndex    : React.PropTypes.number,
    className        : React.PropTypes.string,
    style            : React.PropTypes.object,
    onItemClick      : React.PropTypes.func,
    onItemRightClick : React.PropTypes.func
};

List.defaultProps = {
    selectedIndex : -1
};

export default muiThemeable()(List);
