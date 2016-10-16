'use strict';

import React from 'react';
import ListView from '../lists/ListView.jsx';
import Config from '../../../config.json';

export default class PopUpMenu extends React.Component {
    constructor(props) {
        super(props);

        this._handleItemClick = index => {
            if (this.props.onItemClick) {
                this.props.onItemClick(index);
            }
        };
    }

    render() {
        const theme = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');

        return (
            <div style={{ padding : Config.paddingX1 + 'px', backgroundColor : theme.primaryBackgroundColor }}>
                <ListView
                    theme={this.props.theme}
                    onItemClick={index => this._handleItemClick(index)}>
                    {this.props.children}
                </ListView>
            </div>
        );
    }
}

PopUpMenu.propTypes = {
    theme       : React.PropTypes.oneOf([ 'light', 'dark' ]),
    onItemClick : React.PropTypes.func
};

PopUpMenu.defaultProps = {
    theme : 'light'
};

module.exports = PopUpMenu;
