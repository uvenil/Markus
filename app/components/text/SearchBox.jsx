'use strict';

import React from 'react';
import { showTextBoxContextMenu } from '../../utils/ContextMenuUtils';
import Unique from '../../utils/Unique';
import Constants from '../../utils/Constants';
import _ from 'lodash';
import muiThemeable from 'material-ui/styles/muiThemeable';

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

    return (
        <div
            className={props.className}
            style={{ width : '100%', position : 'relative', pointerEvents : props.disabled ? 'none' : 'auto' }}>
            <i
                className="fa fa-fw fa-search"
                style={{ position : 'absolute', left : Constants.PADDING_X1 + 'px', top : Constants.PADDING_X0 + 'px', fontSize : props.textSize, color : props.muiTheme.palette.disabledColor, cursor : 'default' }} />
            <input
                id={textBoxId}
                type="text"
                placeholder={props.hintText}
                style={{ width : 'calc(100% - 4 * ' + Constants.PADDING_X2 + 'px)', WebkitUserSelect : 'none', color : props.muiTheme.palette.textColor, backgroundColor : props.muiTheme.palette.primary2Color, outline : 'none', borderWidth : '1px', borderStyle : 'solid', borderRadius : Constants.PADDING_X2 + 'px', borderColor : props.muiTheme.palette.borderColor, paddingLeft : 'calc(2 * ' + Constants.PADDING_X2 + 'px)', paddingRight : 'calc(2 * ' + Constants.PADDING_X2 + 'px)', paddingTop : Constants.PADDING_X0, paddingBottom : Constants.PADDING_X0 }}
                onChange={event => handleChange(event.target.value)}
                onMouseDown={event => {
                    if (event.nativeEvent.button === 2) {
                        showTextBoxContextMenu();
                    }
                }} />
            <i
                id={clearButtonId}
                className="fa fa-fw fa-times-circle"
                style={{ display : 'none', position : 'absolute', right : Constants.PADDING_X1 + 'px', top : Constants.PADDING_X0 + 'px', color : props.muiTheme.palette.disabledColor, cursor : 'pointer' }}
                onClick={handleClear} />
        </div>
    );
};

SearchBox.propTypes = {
    hintText  : React.PropTypes.string,
    className : React.PropTypes.string,
    disabled  : React.PropTypes.bool,
    onChange  : React.PropTypes.func
};

SearchBox.defaultProps = {
    hintText  : 'Search',
    className : 'SearchBox',
    disabled  : false
};

export default muiThemeable()(SearchBox);
