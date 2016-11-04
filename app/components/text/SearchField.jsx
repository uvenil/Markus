'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Unique from '../../utils/Unique';
import Constants from '../../utils/Constants';
import { showTextBoxContextMenu } from '../../utils/ContextMenuUtils';
import _ from 'lodash';

const SearchField = props => {
    const textBoxId     = Unique.nextString();
    const clearButtonId = Unique.nextString();

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

    const style = { width : '100%', position : 'relative', pointerEvents : props.disabled ? 'none' : 'auto' };

    return (
        <div
            className={props.className}
            style={_.assign(style, props.style)}>
            <i
                className="fa fa-fw fa-search"
                style={{ position : 'absolute', left : Constants.PADDING_X0 + Constants.PADDING_X1, top : Constants.PADDING_X0 + Constants.PADDING_X1, fontSize : 15, color : props.muiTheme.palette.disabledColor, cursor : 'default' }} />
            <input
                id={textBoxId}
                type="text"
                placeholder={props.hintText}
                style={{ width : 'calc(100% - ' + (Constants.PADDING_X1 * 2 + Constants.PADDING_X2 * 2) + 'px)', paddingLeft : Constants.PADDING_X1 + Constants.PADDING_X2, paddingRight : Constants.PADDING_X1 + Constants.PADDING_X2, paddingTop : Constants.PADDING_X0, paddingBottom : Constants.PADDING_X0, WebkitUserSelect : 'none', color : props.muiTheme.palette.textColor, backgroundColor : props.muiTheme.palette.primary2Color, outline : 'none', borderWidth : 1, borderStyle : 'solid', borderRadius : Constants.PADDING_X2 , borderColor : props.muiTheme.palette.borderColor }}
                onChange={event => handleChange(event.target.value)}
                onMouseDown={event => {
                    if (event.nativeEvent.button === 2) {
                        showTextBoxContextMenu();
                    }
                }} />
            <i
                id={clearButtonId}
                className="fa fa-fw fa-times-circle"
                style={{ display : 'none', position : 'absolute', right : Constants.PADDING_X0 + Constants.PADDING_X1, top : Constants.PADDING_X0 + Constants.PADDING_X1, fontSize : 15, color : props.muiTheme.palette.disabledColor, cursor : 'pointer' }}
                onClick={handleClear} />
        </div>
    );
};

SearchField.propTypes = {
    hintText  : React.PropTypes.string,
    className : React.PropTypes.string,
    style     : React.PropTypes.object,
    disabled  : React.PropTypes.bool,
    onChange  : React.PropTypes.func
};

SearchField.defaultProps = {
    hintText : 'Search',
    disabled : false
};

export default muiThemeable()(SearchField);
