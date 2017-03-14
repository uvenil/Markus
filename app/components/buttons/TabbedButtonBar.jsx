// @flow
'use strict';

import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Tabs, Tab } from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import Constants from '../../Constants';

const TabbedButtonBar = (props: Object) => {
    const muiTheme : Object = getMuiTheme({
        palette : {
            primary1Color      : 'rgba(0, 0, 0, 0)',
            accent1Color       : props.muiTheme.palette.textColor,
            alternateTextColor : props.muiTheme.palette.textColor
        }
    });

    return (
        <MuiThemeProvider muiTheme={muiTheme}>
            <Tabs
                style={{ height : Constants.BUTTON_HEIGHT_X1 }}
                initialSelectedIndex={props.initialSelectedIndex}
                onChange={props.onSelectedIndexChange}>
                {props.icons.map((icon : string, index : number) => {
                    return (
                        <Tab
                            value={index}
                            icon={<FontIcon className={'TabbedButtonIcon fa fa-fw fa-' + icon} />}
                            style={{
                                width  : Constants.BUTTON_HEIGHT_X1,
                                height : Constants.BUTTON_HEIGHT_X1
                            }} />
                    );
                })}
            </Tabs>
        </MuiThemeProvider>
    );
};

TabbedButtonBar.propTypes = {
    icons                 : React.PropTypes.arrayOf(React.PropTypes.string),
    initialSelectedIndex  : React.PropTypes.number,
    onSelectedIndexChange : React.PropTypes.func
};

TabbedButtonBar.defaultProps = {
    initialSelectedIndex : 0
};

export default muiThemeable()(TabbedButtonBar);
