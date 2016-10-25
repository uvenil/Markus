'use strict';

import React from 'react';
import { showTextBoxContextMenu } from '../../utils/ContextMenuUtils';
import Unique from '../../utils/Unique';
import Config from '../../../config.json';
import _ from 'lodash';

const SearchBox = props => {
    const textBoxId     = Unique.elementId();
    const clearButtonId = Unique.elementId();

    const handleChange = value => {
        document.getElementById(clearButtonId).style.display = _.isEmpty(value) ? 'none' : 'block';

        if (props.onChange) {
            props.onChange(value);
        }
    };

    const handleClear = () => {
        const textBox = document.getElementById(textBoxId);

        textBox.value = '';
        textBox.focus();

        handleChange('');
    };

    const theme     = props.theme === 'dark' ? require('../../theme.dark.json') : require('../../theme.light.json');
    const textColor = props.textColor ? props.textColor : theme.primaryTextColor;

    return (
        <div
            className={props.className}
            style={{ width : '100%', position : 'relative', pointerEvents : props.disabled ? 'none' : 'auto' }}>
            <i
                className="fa fa-fw fa-search"
                style={{ position : 'absolute', left : Config.paddingX1 + 'px', top : Config.paddingX0 + 'px', fontSize : props.textSize, color : '#888', cursor : 'default' }} />
            <input
                id={textBoxId}
                type="text"
                placeholder={props.hintText}
                style={{ width : 'calc(100% - 4 * ' + Config.paddingX2 + 'px)', WebkitUserSelect : 'none', fontFamily : props.fontFamily, fontSize : props.textSize, color : textColor, backgroundColor : theme.secondaryBackgroundColor, outline : 'none', borderWidth : '1px', borderStyle : 'solid', borderRadius : Config.paddingX2 + 'px', borderColor : theme.borderColor, paddingLeft : 'calc(2 * ' + Config.paddingX2 + 'px)', paddingRight : 'calc(2 * ' + Config.paddingX2 + 'px)', paddingTop : Config.paddingX0 + 'px', paddingBottom : Config.paddingX0 + 'px' }}
                onChange={event => handleChange(event.target.value)}
                onMouseDown={event => {
                    if (event.nativeEvent.button === 2) {
                        showTextBoxContextMenu();
                    }
                }} />
            <i
                id={clearButtonId}
                className="fa fa-fw fa-times-circle"
                style={{ display : 'none', position : 'absolute', right : Config.paddingX1 + 'px', top : Config.paddingX0 + 'px', color : '#888', cursor : 'pointer' }}
                onClick={handleClear} />
        </div>
    );
};

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

module.exports = { SearchBox };
