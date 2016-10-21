'use strict';

import React from 'react';
import Text from '../text/Text.jsx';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';

export default class ListView extends React.Component {
    constructor(props) {
        super(props);

        this._handleClick = index => {
            if (this.props.onItemClick) {
                this.props.onItemClick(index);
            }
        };

        this._handleRightClick = index => {
            if (this.props.onItemRightClick) {
                this.props.onItemRightClick(index);
            }
        };
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

        let backgroundColor         = this.props.backgroundColor ? this.props.backgroundColor : theme.primaryBackgroundColor;
        let selectedBackgroundColor = this.props.selectedBackgroundColor ? this.props.selectedBackgroundColor : theme.selectedBackgroundColor;

        let header;

        if (this.props.header) {
            header = (
                <div style={{ paddingLeft : Config.paddingX1 + 'px', paddingRight : Config.paddingX1 + 'px', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px' }}>
                    <Text
                        className="ListViewHeader"
                        theme={this.props.theme}>{this.props.header}</Text>
                </div>
            );
        }

        return (
            <div
                className={this.props.className}
                style={{ backgroundColor : backgroundColor }}>
                {header}
                {this.props.children.map((child, index) => {
                    return (
                        <div
                            key={Unique.elementId()}
                            style={{ backgroundColor : index === this.props.selectedIndex ? selectedBackgroundColor : backgroundColor }}
                            onMouseDown={event => {
                                if (event.nativeEvent.button === 2) {
                                    this._handleRightClick(index);
                                } else {
                                    this._handleClick(index);
                                }
                            }}>
                            {child}
                        </div>
                    );
                })}
            </div>
        );
    }
}

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

module.exports = ListView;
