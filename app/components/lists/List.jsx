// @flow
'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Text from '../text/Text.jsx';
import Unique from '../../utils/Unique';
import Constants from '../../Constants';

const List = (props : Object) => {
    let header : any;

    if (props.header) {
        header = (
            <div
                style={{
                    paddingLeft   : Constants.PADDING_X2,
                    paddingRight  : Constants.PADDING_X2,
                    paddingTop    : Constants.PADDING_X0,
                    paddingBottom : Constants.PADDING_X1
                }}>
                <Text
                    style={{
                        fontWeight : 'bold',
                        fontSize   : Constants.FONT_SIZE_SMALL,
                        color      : '#7a7b7c'
                    }}>
                    {props.header}
                </Text>
            </div>
        );
    }

    return (
        <div
            id={props.id}
            className={props.className}
            style={props.style}>
            {header}
            {props.children.map((child : any, index : number) => {
                return (
                    <div
                        key={Unique.nextString('List_item_' + index)}
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
