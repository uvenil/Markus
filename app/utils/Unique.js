// @flow
'use strict';

import RandomString from 'randomstring';

export default class Unique {
    /**
     * Returns a random string of length specified optionally.
     * @param {number|String} [length=4]
     */
    static nextString(length : any) : string {
        if (typeof length === 'string') return length;

        return RandomString.generate({
            length  : length !== undefined ? length : 4,
            charset : 'alphabetic'
        });
    }
}
