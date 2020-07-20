let Parser = function (source) {
    this.fromSource(source);
};

Parser.prototype.source = null;
Parser.prototype.sourceType = null;
Parser.prototype.dates = null;

Parser.prototype.dateRegExp = '!\\\(([0-9]{4})-([0-9]{2})-([0-9]{2})( ?([0-9]{2}):([0-9]{2}))?( ?- ?([0-9]{4})-([0-9]{2})-([0-9]{2})( ?([0-9]{2}):([0-9]{2}))?)?( ?\\\| ?(~?)([0-9]+)([dwmy])([1-7]*))?\\\)';

Parser.prototype.fromSource = function (source) {
    if (source) {
        // TODO Make sure this is a copy and not a reference to the original
        this.source = source;

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
        // Range Date
        rangeDate: null,
        rangeYear: null,
        rangeMonth: null,
        rangeDay: null,
        // Range Time
        rangeTime: null,
        rangeHour: null,
        rangeMinute: null,
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

    obj.hour = m[5] ? parseInt(m[5]) : null;
    obj.minute = m[6] ? parseInt(m[6]) : null;

    obj.rangeYear = m[8] ? parseInt(m[8]) : null;
    obj.rangeMonth = m[9] ? parseInt(m[9]) : null;
    obj.rangeDay = m[10] ? parseInt(m[10]) : null;

    obj.rangeHour = m[12] ? parseInt(m[12]) : null;
    obj.rangeMinute = m[13] ? parseInt(m[13]) : null;

    obj.recurrence = !!m[14];
    obj.recurrenceFromCompletion = !!m[15];
    obj.recurrenceAmount = m[16] ? parseInt(m[16]) : null;
    obj.recurrenceUnit = m[17] ? m[17] : null;

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

    if (obj.recurrence) {
        obj.recurrenceString = (obj.recurrenceFromCompletion ? '~' : '') + obj.recurrenceAmount + obj.recurrenceUnit;
    } else {
        obj.recurrenceString = null;
    }

    obj.string = [
        '!(',
        obj.date,
        obj.time ? ' ' + obj.time : '',
        obj.rangeDate ? ' - ' + obj.rangeDate : '',
        obj.rangeTime ? ' ' + obj.rangeTime : '',
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
