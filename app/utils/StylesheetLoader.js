'use strict';

export default class StylesheetLoader {
    static load(path) {
        const element = document.createElement('link');

        element.setAttribute('rel', 'stylesheet');
        element.setAttribute('type', 'text/css');
        element.setAttribute('href', path);

        document.getElementsByTagName('head')[0].appendChild(element);
    }

    static unload(path) {
        let elements = document.getElementsByTagName('link');

        if (elements) {
            for (let i = 0; i < elements.length; i++) {
                if (elements[i] && elements[i].outerHTML && elements[i].outerHTML.indexOf(path) > -1) {
                    elements[i].parentNode.removeChild(elements[i]);
                }
            }
        }
    }
}

module.exports = StylesheetLoader;
