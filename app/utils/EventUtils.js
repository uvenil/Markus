'use strict';

import PubSub from 'pubsub-js';
import is from 'electron-is';

if (is.dev()) PubSub.immediateExceptions = true;

export default class EventUtils {
    /**
     * Registers a handler to an event with the specified name.
     * @param {String} eventName The name of the event to register.
     * @param {function} handler The handler to invoke upon receiving the specified event.
     * @return {String} The token that represents this event registration.
     */
    static register(eventName, handler) {
        return PubSub.subscribe(eventName, (eventName, data) => handler(data));
    }

    /**
     * Un-registers the previous event registration specified by the token.
     * @param {String} token The token that represents the event registration to un-register.
     */
    static unregister(token) {
        PubSub.unsubscribe(token);
    }

    /**
     * Broadcasts the specified event, optionally associated with the specified data.
     * @param {String} eventName The name of the event to broadcast.
     * @param {*} [data] The data, if any, associated with this broadcast.
     */
    static broadcast(eventName, data) {
        PubSub.publish(eventName, data);
    }
}

module.exports = EventUtils;
