// @flow
'use strict';

import React from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Unique from '../../utils/Unique';
import { showTextBoxContextMenu } from '../../utils/ContextMenuUtils';
import Constants from '../../Constants';
import isEmpty from 'lodash.isempty';
import merge from 'lodash.merge';

class SearchField extends React.Component {
    static propTypes    : Object;
    static defaultProps : Object;

    textBoxId     : string;
    clearButtonId : string;
    _handleChange : Function;
    _handleClear  : Function;

    constructor(props : Object) {
        super(props);

        this.textBoxId     = Unique.nextString('SearchField_textBoxId');
        this.clearButtonId = Unique.nextString('SearchField_clearButtonId');

        this._handleChange = (value : ?string) : void => {
            this.refs[this.clearButtonId].style.display = isEmpty(value) ? 'none' : 'block';

            if (this.props.onChange) this.props.onChange(value);
        };

        this._handleClear = () : void => {
            const textBox = this.refs[this.textBoxId];

            textBox.value = '';
            textBox.focus();

            this._handleChange('');
        };
    }

    render() : any {
        const style = {
            width         : '100%',
            position      : 'relative',
            pointerEvents : this.props.disabled ? 'none' : 'auto'
        };

        return (
            <div
                className={this.props.className}
                style={merge(style, this.props.style)}>
                <i
                    className="fa fa-fw fa-search"
                    style={{
                        position : 'absolute',
                        left     : Constants.PADDING_X0 + Constants.PADDING_X1,
                        top      : Constants.PADDING_X0 + Constants.PADDING_X1,
                        fontSize : Constants.FONT_SIZE_ICON,
                        color    : this.props.muiTheme.palette.disabledColor,
                        cursor   : 'default'
                    }} />
                <input
                    id={this.textBoxId}
                    ref={this.textBoxId}
                    type="text"
                    placeholder={this.props.hintText}
                    style={{
                        width            : 'calc(100% - ' + (Constants.PADDING_X1 * 2 + Constants.PADDING_X2 * 2) + 'px)',
                        paddingLeft      : Constants.PADDING_X1 + Constants.PADDING_X2,
                        paddingRight     : Constants.PADDING_X1 + Constants.PADDING_X2,
                        paddingTop       : Constants.PADDING_X0,
                        paddingBottom    : Constants.PADDING_X0,
                        WebkitUserSelect : 'none',
                        color            : this.props.muiTheme.palette.textColor,
                        border           : 'none',
                        outline          : 'none'
                    }}
                    onChange={event => this._handleChange(event.target.value)}
                    onMouseDown={event => {
                        if (event.nativeEvent.button === 2) showTextBoxContextMenu();
                    }} />
                <i
                    id={this.clearButtonId}
                    ref={this.clearButtonId}
                    className="fa fa-fw fa-times-circle"
                    style={{
                        display  : 'none',
                        position : 'absolute',
                        right    : Constants.PADDING_X0 + Constants.PADDING_X1,
                        top      : Constants.PADDING_X0 + Constants.PADDING_X1,
                        fontSize : Constants.FONT_SIZE_ICON,
                        color    : this.props.muiTheme.palette.disabledColor,
                        cursor   : 'pointer'
                    }}
                    onClick={this._handleClear} />
            </div>
        );
    }
}

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
