'use strict';

import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import Constants from '../../utils/Constants';
import _ from 'lodash';

const Button = props => {
    const icon = props.icon ?
        <FontIcon
            className={'fa fa-fw fa-' + props.icon}
            style={{ marginLeft : props.labelPosition === 'before' || !props.label ? 0 : Constants.PADDING_X1, marginRight : props.labelPosition === 'after' || !props.label ? 0 : Constants.PADDING_X1, fontSize : Constants.DEFAULT_FONT_SIZE, fontWeight : 400, verticalAlign : 'inherit' }} /> : undefined;

    const style = { minWidth : props.width, height : props.height, lineHeight : props.height + 'px', textAlign : props.align };

    if (props.borderless) {
        return (
            <FlatButton
                label={props.label}
                labelPosition={props.labelPosition}
                labelStyle={props.label ? { paddingLeft : Constants.PADDING_X1, paddingRight : Constants.PADDING_X1, fontSize : props.labelSize, fontWeight : props.labelWeight === 'light' ? 300 : props.labelWeight === 'bold' ? 500 : 400, textTransform : 'none', verticalAlign : 'inherit' } : {}}
                icon={icon}
                primary={props.color === 'primary'}
                secondary={props.color === 'secondary'}
                disabled={props.disabled}
                style={_.assign(style, props.style)}
                onTouchTap={props.onTouchTap} />
        );
    }

    return (
        <RaisedButton
            label={props.label}
            labelStyle={props.label ? { paddingLeft : Constants.PADDING_X1, paddingRight : Constants.PADDING_X1, fontSize : props.labelSize, textTransform : 'none', verticalAlign : 'inherit' } : {}}
            icon={icon}
            primary={props.color === 'primary'}
            secondary={props.color === 'secondary'}
            disabled={props.disabled}
            style={_.assign(style, props.style)}
            onTouchTap={props.onTouchTap} />
    );
};

Button.propTypes = {
    label         : React.PropTypes.string,
    labelPosition : React.PropTypes.oneOf([ 'before', 'after' ]),
    labelWeight   : React.PropTypes.oneOf([ 'light', 'normal', 'bold' ]),
    labelSize     : React.PropTypes.oneOfType([ React.PropTypes.number, React.PropTypes.string ]),
    icon          : React.PropTypes.string,
    borderless    : React.PropTypes.bool,
    color         : React.PropTypes.oneOf([ 'default', 'primary', 'secondary' ]),
    width         : React.PropTypes.oneOfType([ React.PropTypes.number, React.PropTypes.string ]),
    height        : React.PropTypes.oneOfType([ React.PropTypes.number, React.PropTypes.string ]),
    align         : React.PropTypes.oneOf([ 'left', 'center', 'right' ]),
    disabled      : React.PropTypes.bool,
    style         : React.PropTypes.object,
    onTouchTap    : React.PropTypes.func
};

Button.defaultProps = {
    labelPosition : 'after',
    labelWeight   : 'bold',
    labelSize     : Constants.DIALOG_BUTTON_FONT_SIZE,
    width         : Constants.BUTTON_MIN_WIDTH,
    height        : Constants.BUTTON_HEIGHT_X0,
    borderless    : true,
    color         : 'default',
    align         : 'center',
    disabled      : false
};

export default Button;
