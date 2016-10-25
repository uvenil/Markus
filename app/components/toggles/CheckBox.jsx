'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import ToggleStore from './ToggleStore';
import Unique from '../../utils/Unique';

@observer
export default class CheckBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const checkBoxId = Unique.elementId();
        const theme      = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');
        const textColor  = this.props.textColor ? this.props.textColor : theme.primaryTextColor;

        return (
            <div
                className={this.props.className}
                style={{ verticalAlign : 'middle' }}>
                <input
                    id={checkBoxId}
                    type="checkbox"
                    checked={this.props.store.checked}
                    onChange={event => {
                        if (this.props.onChange) this.props.onChange(event.target.checked);
                    }} />
                <label
                    htmlFor={checkBoxId}
                    style={{ WebkitUserSelect : 'none', cursor : 'default', fontFamily : this.props.fontFamily, fontSize : this.props.textSize, color : textColor }}>
                    {this.props.children}
                </label>
            </div>
        );
    }
}

CheckBox.propTypes = {
    store      : React.PropTypes.instanceOf(ToggleStore),
    className  : React.PropTypes.string,
    fontFamily : React.PropTypes.string,
    textSize   : React.PropTypes.string,
    textColor  : React.PropTypes.string,
    theme      : React.PropTypes.oneOf([ 'light', 'dark' ]),
    onChange   : React.PropTypes.func
};

CheckBox.defaultProps = {
    className : 'CheckBox',
    theme     : 'light'
};

module.exports = CheckBox;
