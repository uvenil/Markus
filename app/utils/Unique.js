// @flow
'use strict';

import RandomString from 'randomstring';

const Unique = {
    /**
     * Returns a random string of the specified length, or returns the given string.
     * @param {number|string} [lengthOrMockString=4] The length of the string to generate, or the string to return.
     * @return {string}
     */
    nextString : function(lengthOrMockString : ?number|?string) : string {
        if (typeof lengthOrMockString === 'string') return lengthOrMockString;

        return RandomString.generate({
            length  : lengthOrMockString ? lengthOrMockString : 4,
            charset : 'alphabetic'
        });
    }
};

export default Unique;
