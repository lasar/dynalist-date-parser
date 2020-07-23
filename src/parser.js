const {DateTime} = require("luxon");

let Parser = function (source) {
    this.fromSource(source);
};

Parser.prototype.source = null;
Parser.prototype.sourceType = null;
Parser.prototype.dates = null;

Parser.prototype.dateRegExp = (() => {
    return '!\\\(' +
        '([0-9]{4})-([0-9]{2})-([0-9]{2})' + // Date
        '( ?([0-9]{2}):([0-9]{2}))?' + // Time
        '( ?([+-])([0-9]{2}):([0-9]{2}))?' + // Timezone
        '( ?- ?' + // Begin range
        '([0-9]{4})-([0-9]{2})-([0-9]{2})' + // Range Date
        '( ?([0-9]{2}):([0-9]{2}))?' + // Range Time
        '( ?([+-])([0-9]{2}):([0-9]{2}))?' + // Range Timezone
        ')?' + // End range
        '( ?\\\| ?(~?)([0-9]+)([dwmy])([1-7]*))?' + // Recurrence
        '\\\)';
})();

Parser.prototype.fromSource = function (source) {
    if (source) {
        this.source = JSON.parse(JSON.stringify(source));

        if (typeof this.source === 'string') {
            this.sourceType = 'string';
            this.dates = this.extractDatesFromString(this.source);
        } else if (typeof this.source === 'object' && typeof this.source.content === 'string') {
            this.sourceType = 'node';
            this.dates = [
                ...this.extractDatesFromString(this.source.content),
                ...this.extractDatesFromString(this.source.note)
            ];
        } else {
            this.sourceType = 'unknown';
            this.dates = null;
        }
    }
};

Parser.prototype.extractDatesFromString = function (str) {
    const matches = str && str.match(new RegExp(this.dateRegExp, 'g')) || [];

    return matches.map(match => this.parseDate(match)).filter(m => !!m);
};

Parser.prototype.parseDate = function (input) {
    const m = input.match(new RegExp(this.dateRegExp));

    let obj = {
        origin: input,
        string: null,
        // Date
        date: null,
        year: null,
        month: null,
        day: null,
        // Time
        time: null,
        hour: null,
        minute: null,
        timezone: null,
        timezoneDirection: null,
        timezoneHour: null,
        timezoneMinute: null,
        // Range Date
        rangeDate: null,
        rangeYear: null,
        rangeMonth: null,
        rangeDay: null,
        // Range Time
        rangeTime: null,
        rangeHour: null,
        rangeMinute: null,
        rangeTimezone: null,
        rangeTimezoneDirection: null,
        rangeTimezoneHour: null,
        rangeTimezoneMinute: null,
        // Recurrence
        recurrence: null,
        recurrenceString: null,
        recurrenceFromCompletion: null,
        recurrenceAmount: null,
        recurrenceUnit: null,
        recurrenceDays: null,
    };

    obj.year = m[1] ? parseInt(m[1]) : null;
    obj.month = m[2] ? parseInt(m[2]) : null;
    obj.day = m[3] ? parseInt(m[3]) : null;
    // 4 time string
    obj.hour = m[5] ? parseInt(m[5]) : null;
    obj.minute = m[6] ? parseInt(m[6]) : null;
    obj.timezoneDirection = m[8] === '-' ? -1 : (m[8] === '+' ? 1 : null);
    // 7 timezone string
    obj.timezoneHour = m[9] ? parseInt(m[9]) : null;
    obj.timezoneMinute = m[10] ? parseInt(m[10]) : null;
    // 11 range string
    obj.rangeYear = m[12] ? parseInt(m[12]) : null;
    obj.rangeMonth = m[13] ? parseInt(m[13]) : null;
    obj.rangeDay = m[14] ? parseInt(m[14]) : null;
    // 15 range time string
    obj.rangeHour = m[16] ? parseInt(m[16]) : null;
    obj.rangeMinute = m[17] ? parseInt(m[17]) : null;
    // 18 range timezone string
    obj.rangeTimezoneDirection = m[19] === '-' ? -1 : (m[19] === '+' ? 1 : null);
    obj.rangeTimezoneHour = m[20] ? parseInt(m[20]) : null;
    obj.rangeTimezoneMinute = m[21] ? parseInt(m[21]) : null;
    // 22 recurrence string
    obj.recurrence = !!m[22];
    obj.recurrenceFromCompletion = !!m[23];
    obj.recurrenceAmount = m[24] ? parseInt(m[24]) : null;
    obj.recurrenceUnit = m[25] ? m[25] : null;

    if (m[26]) {
        obj.recurrenceDays = m[26].split('').map(d => parseInt(d)).filter(d => d >= 1 && d <= 7);
    } else {
        obj.recurrenceDays = null;
    }

    obj = this.updateDateStrings(obj);

    return obj;
}

Parser.prototype.updateDateStrings = function (obj) {
    if (obj.year) {
        obj.date = obj.year + '-' + this.nullify(obj.month, 2) + '-' + this.nullify(obj.day, 2);
    } else {
        obj.date = null;
    }

    if (obj.hour) {
        obj.time = this.nullify(obj.hour, 2) + ':' + this.nullify(obj.minute, 2);
    } else {
        obj.time = null;
    }

    if (obj.timezoneDirection) {
        obj.timezone = (obj.timezoneDirection > 0 ? '+' : '-') + this.nullify(obj.timezoneHour, 2) + ':' + this.nullify(obj.timezoneMinute, 2);
    } else {
        obj.timezone = null;
    }

    if (obj.rangeYear) {
        obj.rangeDate = obj.rangeYear + '-' + this.nullify(obj.rangeMonth, 2) + '-' + this.nullify(obj.rangeDay, 2);
    } else {
        obj.rangeDate = null;
    }

    if (obj.rangeHour) {
        obj.rangeTime = this.nullify(obj.rangeHour, 2) + ':' + this.nullify(obj.rangeMinute, 2);
    } else {
        obj.rangeTime = null;
    }

    if (obj.rangeTimezoneDirection) {
        obj.rangeTimezone = (obj.rangeTimezoneDirection > 0 ? '+' : '-') + this.nullify(obj.rangeTimezoneHour, 2) + ':' + this.nullify(obj.rangeTimezoneMinute, 2);
    } else {
        obj.rangeTimezone = null;
    }

    if (obj.recurrence) {
        obj.recurrenceString = (obj.recurrenceFromCompletion ? '~' : '') + obj.recurrenceAmount + obj.recurrenceUnit + (obj.recurrenceDays ? obj.recurrenceDays.join('') : '');
    } else {
        obj.recurrenceString = null;
    }

    obj.string = [
        '!(',
        obj.date,
        obj.time ? ' ' + obj.time : '',
        obj.timezone ? ' ' + obj.timezone : '',
        obj.rangeDate ? ' - ' + obj.rangeDate : '',
        obj.rangeTime ? ' ' + obj.rangeTime : '',
        obj.rangeTimezone ? ' ' + obj.rangeTimezone : '',
        obj.recurrence ? ' | ' + obj.recurrenceString : '',
        ')'
    ].join('');

    return obj;
}

Parser.prototype.nullify = function (num, length) {
    return ('' + num).padStart(length, '0');
};

Parser.prototype.modifyDates = function (fn, idx = null) {
    const self = this;

    this.dates = this.dates.map((value, index) => {
        if (idx !== null && idx !== index) {
            return value;
        }

        value = fn(value);
        value = self.updateDateStrings(value);
        return value;
    });
};

Parser.prototype.updateSource = function () {
    const self = this;

    if (this.sourceType === 'string') {
        this.dates.map(date => {
            self.source = self.source.replace(date.origin, date.string);
        });
    } else if (this.sourceType === 'node') {
        this.dates.map(date => {
            if (self.source.content) {
                self.source.content = self.source.content.replace(date.origin, date.string);
            }
            if (self.source.note) {
                self.source.note = self.source.note.replace(date.origin, date.string);
            }
        });
    }

    return this.source;
}

module.exports = Parser;
