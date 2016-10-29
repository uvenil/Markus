'use strict';

import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FontIcon from 'material-ui/FontIcon';
import Constants from '../../utils/Constants';

const Button = props => {
    const icon = props.icon ?
        <FontIcon
            className={'fa fa-fw fa-' + props.icon}
            style={{ marginLeft : props.labelPosition === 'before' || !props.label ? 0 : Constants.PADDING_X1, marginRight : props.labelPosition === 'after' || !props.label ? 0 : Constants.PADDING_X1, fontSize : Constants.TEXT_FONT_SIZE }} /> : undefined;

    const style = props.style ? props.style : {};

    style.minWidth   = props.width;
    style.height     = props.height;
    style.lineHeight = props.height + 'px';
    style.textAlign  = props.align;

    if (props.borderless) {
        return (
            <FlatButton
                label={props.label}
                labelPosition={props.labelPosition}
                labelStyle={props.label ? { paddingLeft : Constants.PADDING_X1, paddingRight : Constants.PADDING_X1, fontSize : Constants.TEXT_FONT_SIZE, textTransform : 'none' } : {}}
                icon={icon}
                primary={props.color === 'primary'}
                secondary={props.color === 'secondary'}
                disabled={props.disabled}
                style={style}
                onTouchTap={props.onTouchTap} />
        );
    }

    return (
        <RaisedButton
            label={props.label}
            labelStyle={props.label ? { paddingLeft : Constants.PADDING_X1, paddingRight : Constants.PADDING_X1, fontSize : Constants.TEXT_FONT_SIZE, textTransform : 'none' } : {}}
            icon={icon}
            primary={props.color === 'primary'}
            secondary={props.color === 'secondary'}
            disabled={props.disabled}
            style={style}
            onTouchTap={props.onTouchTap} />
    );
};

Button.propTypes = {
    label         : React.PropTypes.string,
    labelPosition : React.PropTypes.oneOf([ 'before', 'after' ]),
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
    width         : Constants.BUTTON_MIN_WIDTH,
    height        : Constants.BUTTON_MIN_HEIGHT,
    borderless    : true,
    color         : 'default',
    align         : 'center',
    disabled      : false
};

module.exports = { Button };
