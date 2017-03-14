// @flow
'use strict';

import EnvironmentUtils from './EnvironmentUtils';
import PubSub from 'pubsub-js';

if (EnvironmentUtils.isDev()) PubSub.immediateExceptions = true;

const EventUtils = {
    /**
     * Registers a handler to an event with the specified name.
     * @param {string} eventName The name of the event to register.
     * @param {function} handler The handler to invoke upon receiving the specified event.
     * @return {string|boolean} The token that represents this event registration, or false if the registration is failed.
     */
    register : function(eventName : string, handler : Function) : string|boolean {
        return PubSub.subscribe(eventName, (eventName, data) => handler(data));
    },

    /**
     * Un-registers an existing event registration specified by the token.
     * @param {string} token The token that represents the event registration to un-register.
     */
    unregister : function(token : string) : void {
        PubSub.unsubscribe(token);
    },

    /**
     * Broadcasts the specified event, optionally associated with the specified data.
     * @param {string} eventName The name of the event to broadcast.
     * @param {*} [data] The data, if any, associated with this broadcast.
     */
    broadcast : function(eventName : string, data : ?any) : boolean {
        return PubSub.publish(eventName, data);
    }
};

export default EventUtils;
