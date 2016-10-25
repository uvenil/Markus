'use strict';

import React from 'react';
import { Text } from '../text/Text.jsx';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';

const ListView = props => {
    const theme = props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

    let backgroundColor         = props.backgroundColor ? props.backgroundColor : theme.primaryBackgroundColor;
    let selectedBackgroundColor = props.selectedBackgroundColor ? props.selectedBackgroundColor : theme.selectedBackgroundColor;

    let header;

    if (props.header) {
        header = (
            <div style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px' }}>
                <Text
                    className="ListViewHeader"
                    theme={props.theme}>{props.header}</Text>
            </div>
        );
    }

    return (
        <div
            className={props.className}
            style={{ backgroundColor : backgroundColor }}>
            {header}
            {props.children.map((child, index) => {
                return (
                    <div
                        key={Unique.elementId()}
                        style={{ backgroundColor : index === props.selectedIndex ? selectedBackgroundColor : backgroundColor }}
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
    header                  : React.PropTypes.node,
    selectedIndex           : React.PropTypes.number,
    className               : React.PropTypes.string,
    fontFamily              : React.PropTypes.string,
    textSize                : React.PropTypes.string,
    textColor               : React.PropTypes.string,
    selectedTextColor       : React.PropTypes.string,
    backgroundColor         : React.PropTypes.string,
    selectedBackgroundColor : React.PropTypes.string,
    theme                   : React.PropTypes.oneOf([ 'light', 'dark' ]),
    disabled                : React.PropTypes.bool,
    onItemClick             : React.PropTypes.func,
    onItemRightClick        : React.PropTypes.func
};

ListView.defaultProps = {
    selectedIndex : -1,
    className     : 'ListView',
    theme         : 'light',
    disabled      : false
};

module.exports = { ListView };
