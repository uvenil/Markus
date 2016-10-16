'use strict';

import React from 'react';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';
import _ from 'lodash';

export default class SearchBox extends React.Component {
    constructor(props) {
        super(props);

        this._textBoxId     = Unique.elementId('a');
        this._clearButtonId = Unique.elementId('b');

        this._handleChange = value => {
            document.getElementById(this._clearButtonId).style.display = _.isEmpty(value) ? 'none' : 'block';

            if (this.props.onChange) {
                this.props.onChange(value);
            }
        };

        this._handleClear = () => {
            const textBox = document.getElementById(this._textBoxId);
            textBox.value = '';
            textBox.focus();

            this._handleChange('');
        };
    }

    render() {
        const theme     = this.props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');
        const textColor = this.props.textColor ? this.props.textColor : theme.primaryTextColor;

        return (
            <div
                className={this.props.className}
                style={{ width : '100%', position : 'relative', pointerEvents : this.props.disabled ? 'none' : 'auto' }}>
                <i
                    className="fa fa-fw fa-search"
                    style={{ position : 'absolute', left : Config.paddingX1 + 'px', top : Config.paddingX0 + 'px', fontSize : this.props.textSize, color : '#888', cursor : 'default' }} />
                <input
                    id={this._textBoxId}
                    type="text"
                    placeholder={this.props.hintText}
                    style={{ width : 'calc(100% - 4 * ' + Config.paddingX2 + 'px)', WebkitUserSelect : 'none', fontFamily : this.props.fontFamily, fontSize : this.props.textSize, color : textColor, backgroundColor : theme.secondaryBackgroundColor, outline : 'none', borderWidth : '1px', borderStyle : 'solid', borderRadius : Config.paddingX2 + 'px', borderColor : theme.borderColor, paddingLeft : 'calc(2 * ' + Config.paddingX2 + 'px)', paddingRight : 'calc(2 * ' + Config.paddingX2 + 'px)', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px' }}
                    onChange={event => this._handleChange(event.target.value)} />
                <i
                    id={this._clearButtonId}
                    className="fa fa-fw fa-times-circle"
                    style={{ display : 'none', position : 'absolute', right : Config.paddingX1 + 'px', top : Config.paddingX0 + 'px', color : '#888', cursor : 'pointer' }}
                    onClick={this._handleClear} />
            </div>
        );
    }
}

SearchBox.propTypes = {
    hintText   : React.PropTypes.string,
    className  : React.PropTypes.string,
    fontFamily : React.PropTypes.string,
    textSize   : React.PropTypes.string,
    textColor  : React.PropTypes.string,
    theme      : React.PropTypes.oneOf([ 'light', 'dark' ]),
    disabled   : React.PropTypes.bool,
    onChange   : React.PropTypes.func
};

SearchBox.defaultProps = {
    hintText  : 'Search',
    className : 'SearchBox',
    theme     : 'light',
    disabled  : false
};

module.exports = SearchBox;
