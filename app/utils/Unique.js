'use strict';

import RandomString from 'randomstring';

export default class Unique {
    static elementId() {
        return RandomString.generate({
            length  : 4,
            charset : 'alphabetic'
        });
    }
}

module.exports = Unique;
