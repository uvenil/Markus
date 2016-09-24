'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import { View, Text, Checkbox, Radio, Button, SegmentedControl, SegmentedControlItem } from 'react-desktop/macOs';
import Dialog from './Dialog';
import DialogStore from './DialogStore';
import SimpleList from '../lists/SimpleList';
import ListStore from '../lists/ListStore';
import ListItemStore from '../lists/ListItemStore';
import Config from '../../../config/config.json';
import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

@observer
export default class SettingsDialog extends Dialog {
    constructor(props) {
        super(props);

        let selectedKey = 'settings-theme';

        let themeStore = new ListStore();

        for (let i = 0; i < Config.themeNames.length; i++) {
            const item = new ListItemStore();

            item.itemId      = Config.themeCodes[i];
            item.primaryText = Config.themeNames[i];

            themeStore.items.push(item);
        }

        let handleThemeClick = itemId => {
            // TODO: Saves theme setting

            PubSub.publish('Theme.change', itemId);
        };

        let handleLineNumbersChange = show => {};

        let handleInvisibleCharactersChange = show => {};

        let handleTabSizeChange = size => {};

        let handleSoftTabsChange = enabled => {};

        let renderItem = (key, title, content) => {
            return (
                <SegmentedControlItem
                    key={key}
                    title={title}
                    selected={selectedKey === key}
                    onSelect={() => {
                        selectedKey = key;

                        props.store.content = renderContent();
                    }}>
                    {content}
                </SegmentedControlItem>
            );
        };

        let renderContent = () => (
            <div style={{ width : '100%', textAlign : 'center' }}>
                <SegmentedControl
                    height={200}
                    box>
                    {[
                        renderItem('settings-theme', 'Theme', (
                            <SimpleList
                                store={themeStore}
                                onItemClick={handleThemeClick} />
                        )),
                        renderItem('settings-editor', 'Editor', (
                            <table style={{ width : '100%', borderCollapse : 'collapse' }}>
                                <tr style={{ verticalAlign : 'top' }}>
                                    <td style={{ paddingBottom : Config.paddingX1, textAlign : 'right' }}>
                                        <Text marginRight={Config.paddingX1}>Show:</Text>
                                    </td>
                                    <td style={{ paddingBottom : Config.paddingX1 }}>
                                        <View direction="column">
                                            <Checkbox
                                                label="Line numbers"
                                                onChange={event => handleLineNumbersChange(event.target.checked)} />
                                            <Checkbox
                                                label="Invisible characters"
                                                onChange={event => handleInvisibleCharactersChange(event.target.checked)} />
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
                                                onChange={event => { if (event.target.checked) handleTabSizeChange(2); }} />
                                            <Radio
                                                label="4 spaces"
                                                name="tabSize"
                                                onChange={event => { if (event.target.checked) handleTabSizeChange(4); }} />
                                            <Radio
                                                label="8 spaces"
                                                name="tabSize"
                                                onChange={event => { if (event.target.checked) handleTabSizeChange(8); }} />
                                            <Checkbox
                                                label="Use soft tabs"
                                                onChange={event => handleSoftTabsChange(event.target.checked)} />
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
        props.store.content = renderContent();
    }
}

SettingsDialog.propTypes = {
    store : React.PropTypes.instanceOf(DialogStore).isRequired
};

module.exports = SettingsDialog;
