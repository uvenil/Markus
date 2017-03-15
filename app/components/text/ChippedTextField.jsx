// @flow
'use strict';

import React from 'react';
import { observer } from 'mobx-react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Chip from 'material-ui/Chip';
import ChippedTextFieldStore from './ChippedTextFieldStore';
import Unique from '../../utils/Unique';
import { showTextBoxContextMenu } from '../../utils/ContextMenuUtils';
import Constants from '../../Constants';
import indexOf from 'lodash.indexof';
import sortBy from 'lodash.sortby';

const cleanUp = (value : string) : string => {
    if (value && value.length > 0) {
        if (value[0] !== '#') {
            if (value[0] !== ' ' && value.slice(-1) !== ' ') return value;

            return cleanUp(value.trim());
        }

        return cleanUp(value.slice(1));
    }

    return value;
};

const toArray = (values : any) : string[] => {
    const array : string[] = [];

    for (let i = 0; i < values.length; i++) array.push(values[i]);

    return array;
};

@observer
class ChippedTextField extends React.Component {
    static propTypes    : Object;
    static defaultProps : Object;

    containerId          : string;
    textBoxId            : string;
    _handleRequestDelete : Function;
    _handleChange        : Function;
    _renderChip          : Function;

    constructor(props : Object) {
        super(props);

        this.containerId = Unique.nextString('ChippedTextField_container');
        this.textBoxId   = Unique.nextString('ChippedTextField_textBoxId');

        this._handleRequestDelete = (chip : string) : void => {
            const values : string[] = toArray(this.props.store.chips);
            const index  : number   = indexOf(values, chip);

            if (index >= 0) this.props.store.chips.splice(index, 1);

            if (this.props.onChange) this.props.onChange(this.props.store.chips);
        };

        this._handleChange = (chip : ?string) : void => {
            if (chip && chip.length > 0 && chip.slice(-1) === ' ') {
                this.refs[this.textBoxId].value = '';

                const value  : ?string  = cleanUp(chip.trim());
                const values : string[] = toArray(this.props.store.chips);

                if (value && value.length > 0 && indexOf(values, value) === -1) {
                    values.push(value);

                    this.props.store.chips = sortBy(values);

                    if (this.props.onChange) this.props.onChange(values);
                }
            }
        };

        this._renderChip = (chip : string) : any => {
            return (
                <Chip
                    key={chip}
                    backgroundColor={this.props.chipBackground}
                    style={{
                        marginLeft   : Constants.PADDING_X0,
                        marginRight  : Constants.PADDING_X0,
                        marginTop    : Constants.PADDING_X1,
                        marginBottom : Constants.PADDING_X1,
                        flex         : '1 1 0'
                    }}
                    onRequestDelete={() => this._handleRequestDelete(chip)}
                    onTouchTap={() : void => this.refs[this.containerId].focus()}>
                    {chip}
                </Chip>
            );
        };
    }

    render() : any {
        const chips = [];

        for (let i = 0; i < this.props.store.chips.length; i++) chips.push(this._renderChip(this.props.store.chips[i]));

        return (
            <div
                id={this.containerId}
                ref={this.containerId}
                style={{
                    position : 'absolute',
                    display  : 'flex',
                    flexFlow : 'row',
                    width    : '100%'
                }}>
                <input
                    id={this.textBoxId}
                    ref={this.textBoxId}
                    type="text"
                    placeholder={this.props.hintText}
                    style={{
                        width           : Constants.HASHTAG_TEXTBOX_WIDTH,
                        height          : Constants.PADDING_X2,
                        margin          : Constants.PADDING_X1,
                        border          : 'none',
                        outline         : 'none',
                        backgroundColor : this.props.textBackground
                    }}
                    onChange={event => this._handleChange(event.target.value)}
                    onMouseDown={event => {
                        if (event.nativeEvent.button === 2) showTextBoxContextMenu();
                    }} />
                <div
                    style={{
                        display   : 'flex',
                        flexFlow  : 'row',
                        overflowX : 'scroll'
                    }}>
                    {chips}
                </div>
            </div>
        );
    }
}

ChippedTextField.propTypes = {
    store          : React.PropTypes.instanceOf(ChippedTextFieldStore).isRequired,
    hintText       : React.PropTypes.string,
    chipBackground : React.PropTypes.string,
    textBackground : React.PropTypes.string,
    onChange       : React.PropTypes.func
};

ChippedTextField.defaultProps = {
    hintText       : '#hashtag',
    textBackground : 'rgba(0, 0, 0, 0)'
};

export default muiThemeable()(ChippedTextField);
