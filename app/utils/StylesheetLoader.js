'use strict';

export default class CssLoader {
    static load(path) {
        const element = document.createElement('link');

        element.setAttribute('rel', 'stylesheet');
        element.setAttribute('type', 'text/css');
        element.setAttribute('href', path);

        document.getElementsByTagName('head')[0].appendChild(element);
    }

    static unload(path) {
        let elements = document.getElementsByTagName('link');

        if (elements && elements.length > 0) {
            elements.forEach(element => {
                if (element && element.getAttribute('href') && element.getAttribute('href') === path) {
                    element.parentNode.removeChild(element);
                }
            });
        }
    }
}

module.exports = CssLoader;
