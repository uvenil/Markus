'use strict';

export default class JavaScriptLoader {
    static load(path) {
        const element = document.createElement('script');

        element.setAttribute('type', 'text/javascript');
        element.setAttribute('src', path);

        document.getElementsByTagName('head')[0].appendChild(element);
    }

    static unload(path) {
        let elements = document.getElementsByTagName('script');

        if (elements && elements.length > 0) {
            for (let i = 0; i < elements.length; i++) {
                if (elements[i] && elements[i].outerHTML && elements[i].outerHTML.indexOf(path) > -1) {
                    elements[i].parentNode.removeChild(elements[i]);
                }
            }
        }
    }
}

module.exports = JavaScriptLoader;
