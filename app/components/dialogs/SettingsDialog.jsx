'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Checkbox, Radio, Button, SegmentedControl, SegmentedControlItem } from 'react-desktop/macOs';
import Dialog from './Dialog';
import DialogStore from './DialogStore';
import Config from '../../../config/config.json';

@observer
export default class SettingsDialog extends Dialog {
    constructor(props) {
        super(props);

        this._selectedKey = 'settings-theme';

        this._handleLineNumbersChange = show => {};

        this._handleInvisibleCharactersChange = show => {};

        this._handleTabSizeChange = size => {};

        this._handleSoftTabsChange = enabled => {};

        this._renderItem = (key, title, content) => {
            return (
                <SegmentedControlItem
                    key={key}
                    title={title}
                    selected={this._selectedKey === key}
                    onSelect={() => {
                        this._selectedKey = key;

                        props.store.content = this._renderContent();
                    }}>
                    {content}
                </SegmentedControlItem>
            );
        };

        this._renderContent = () => (
            <div style={{ width : '100%', textAlign : 'center' }}>
                <SegmentedControl
                    height={200}
                    box>
                    {[
                        this._renderItem('settings-theme', 'Theme', <div></div>),
                        this._renderItem('settings-editor', 'Editor', (
                            <table style={{ width : '100%', borderCollapse : 'collapse' }}>
                                <tr style={{ verticalAlign : 'top' }}>
                                    <td style={{ paddingBottom : Config.paddingX1, textAlign : 'right' }}>
                                        <Text marginRight={Config.paddingX1}>Show:</Text>
                                    </td>
                                    <td style={{ paddingBottom : Config.paddingX1 }}>
                                        <View direction="column">
                                            <Checkbox
                                                label="Line numbers"
                                                onChange={event => this._handleLineNumbersChange(event.target.checked)} />
                                            <Checkbox
                                                label="Invisible characters"
                                                onChange={event => this._handleInvisibleCharactersChange(event.target.checked)} />
                                        </View>
                                    </td>
                                </tr>
                                <tr style={{ verticalAlign : 'top' }}>
                                    <td style={{ paddingBottom : Config.paddingX1, textAlign : 'right' }}>
                                        <Text marginRight={Config.paddingX1}>Tab size:</Text>
                                    </td>
                                    <td style={{ paddingBottom : Config.paddingX1 }}>
                                        <View direction="column">
                                            <Radio
                                                label="2 spaces"
                                                name="tabSize"
                                                onChange={event => { if (event.target.checked) this._handleTabSizeChange(2); }} />
                                            <Radio
                                                label="4 spaces"
                                                name="tabSize"
                                                onChange={event => { if (event.target.checked) this._handleTabSizeChange(4); }} />
                                            <Radio
                                                label="8 spaces"
                                                name="tabSize"
                                                onChange={event => { if (event.target.checked) this._handleTabSizeChange(8); }} />
                                            <Checkbox
                                                label="Use soft tabs"
                                                onChange={event => this._handleSoftTabsChange(event.target.checked)} />
                                        </View>
                                    </td>
                                </tr>
                            </table>
                        ))
                    ]}
                </SegmentedControl>
                <hr />
                <Button onClick={() => this.props.store.hidden = true}>Close</Button>
            </div>
        );

        props.store.title   = 'Settings';
        props.store.content = this._renderContent();
    }
}

SettingsDialog.propTypes = {
    store : React.PropTypes.instanceOf(DialogStore).isRequired
};

module.exports = SettingsDialog;
