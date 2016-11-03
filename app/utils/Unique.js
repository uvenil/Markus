'use strict';

import RandomString from 'randomstring';

export default class Unique {
    /**
     * Returns a random string of length specified optionally.
     * @param {number} [length=4]
     */
    static nextString(length) {
        return RandomString.generate({
            length  : length !== undefined ? length : 4,
            charset : 'alphabetic'
        });
    }
}

module.exports = Unique;
