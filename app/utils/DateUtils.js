// @flow
'use strict';

const ROUNDING_THRESHOLD : number = 1.5;
const ONE_SECOND         : number = 1000;
const ONE_MINUTE         : number = 60;
const ONE_HOUR           : number = 3600;
const ONE_DAY            : number = 86400;
const ONE_MONTH          : number = 2592000;
const ONE_YEAR           : number = 31557600;
const ONE_MOMENT         : number = 30;

const fromNow = (seconds : number, divider : number, unit : string) : ?string => {
    const value = seconds / divider;

    if (value >= ROUNDING_THRESHOLD) return Math.round(value) + ' ' + unit + 's ago';
    if (value >= 1) return 'One ' + unit + ' ago';

    return undefined;
};

const DateUtils = {
    fromNow : function(date : number) : string {
        const seconds = Math.floor((Date.now() - date) / ONE_SECOND);

        const years   = fromNow(seconds, ONE_YEAR, 'year');
        if (years) return years;

        const months = fromNow(seconds, ONE_MONTH, 'month');
        if (months) return months;

        const days = fromNow(seconds, ONE_DAY, 'day');
        if (days) return days;

        const hours = fromNow(seconds, ONE_HOUR, 'hour');
        if (hours) return hours;

        const minutes = fromNow(seconds, ONE_MINUTE, 'minute');
        if (minutes) return minutes;

        if (seconds >= ONE_MOMENT) return 'A moment ago';

        return 'Just now';
    }
};

export default DateUtils;
