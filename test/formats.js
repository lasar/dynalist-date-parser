const should = require('should');

const Parser = require('../');

function compareInputOutput(input, output) {
    const outputDefaults = {
        origin: input,
        string: input,
        date: null,
        year: null,
        month: null,
        day: null,
        time: null,
        hour: null,
        minute: null,
        timezone: null,
        timezoneHour: null,
        timezoneMinute: null,
        rangeDate: null,
        rangeYear: null,
        rangeMonth: null,
        rangeDay: null,
        rangeTime: null,
        rangeHour: null,
        rangeMinute: null,
        rangeTimezone: null,
        rangeTimezoneHour: null,
        rangeTimezoneMinute: null,
        recurrence: false,
        recurrenceString: null,
        recurrenceFromCompletion: false,
        recurrenceAmount: null,
        recurrenceUnit: null,
        recurrenceDays: null
    };

    let expectedOutput = JSON.parse(JSON.stringify(outputDefaults));

    for(let k in output) {
        expectedOutput[k] = output[k];
    }

    const ddp = new Parser(input);

    ddp.dates.should.be.an.Array();
    ddp.dates.should.not.be.empty();

    const d = ddp.dates[0];

    d.should.be.an.Object();
    d.should.eql(expectedOutput);
}

describe('Date Formats', function () {
    it('Date', function () {
        compareInputOutput('!(2020-07-28)', {
            date: '2020-07-28',
            year: 2020,
            month: 7,
            day: 28,
        });
    });

    it('Date/time', function () {
        compareInputOutput('!(2020-07-28 10:00)', {
            date: '2020-07-28',
            year: 2020,
            month: 7,
            day: 28,
            time: '10:00',
            hour: 10,
            minute: 0
        });
    });

    it('Date/time with timezone', function () {
        compareInputOutput('!(2020-07-20 01:00 +02:00)', {
            date: '2020-07-20',
            year: 2020,
            month: 7,
            day: 20,
            time: '01:00',
            hour: 1,
            minute: 0,
            timezone: '02:00',
            timezoneHour: 2,
            timezoneMinute: 0,
        });
    });

    it('Date range', function () {
        compareInputOutput('!(2020-07-28 - 2021-08-29)', {
            date: '2020-07-28',
            year: 2020,
            month: 7,
            day: 28,
            rangeDate: '2021-08-29',
            rangeYear: 2021,
            rangeMonth: 8,
            rangeDay: 29,
        });
    });

    it('Date/time range', function () {
        compareInputOutput('!(2020-07-28 10:00 - 2021-08-29 16:30)', {
            date: '2020-07-28',
            year: 2020,
            month: 7,
            day: 28,
            time: '10:00',
            hour: 10,
            minute: 0,
            rangeDate: '2021-08-29',
            rangeYear: 2021,
            rangeMonth: 8,
            rangeDay: 29,
            rangeTime: '16:30',
            rangeHour: 16,
            rangeMinute: 30,
        });
    });

    it('Date/time range with timezone', function () {
        compareInputOutput('!(2020-07-28 10:00 +02:00 - 2021-08-29 16:30 +02:00)', {
            date: '2020-07-28',
            year: 2020,
            month: 7,
            day: 28,
            time: '10:00',
            hour: 10,
            minute: 0,
            timezone: '02:00',
            timezoneHour: 2,
            timezoneMinute: 0,
            rangeDate: '2021-08-29',
            rangeYear: 2021,
            rangeMonth: 8,
            rangeDay: 29,
            rangeTime: '16:30',
            rangeHour: 16,
            rangeMinute: 30,
            rangeTimezone: '02:00',
            rangeTimezoneHour: 2,
            rangeTimezoneMinute: 0,
        });
    });

    it('Date/time range with timezone and recurrence', function () {
        compareInputOutput('!(2020-07-28 10:00 +02:00 - 2021-08-29 16:30 +02:00 | ~1w135)', {
            date: '2020-07-28',
            year: 2020,
            month: 7,
            day: 28,
            time: '10:00',
            hour: 10,
            minute: 0,
            timezone: '02:00',
            timezoneHour: 2,
            timezoneMinute: 0,
            rangeDate: '2021-08-29',
            rangeYear: 2021,
            rangeMonth: 8,
            rangeDay: 29,
            rangeTime: '16:30',
            rangeHour: 16,
            rangeMinute: 30,
            rangeTimezone: '02:00',
            rangeTimezoneHour: 2,
            rangeTimezoneMinute: 0,
            recurrence: true,
            recurrenceString: '~1w135',
            recurrenceFromCompletion: true,
            recurrenceAmount: 1,
            recurrenceUnit: 'w',
            recurrenceDays: [1, 3, 5],
        });
    });

    it('Date recurrence - every 2 days', function () {
        compareInputOutput('!(2020-07-28 | 2d)', {
            date: '2020-07-28',
            year: 2020,
            month: 7,
            day: 28,
            recurrenceString: '2d',
            recurrence: true,
            recurrenceAmount: 2,
            recurrenceUnit: 'd',
        });
    });

    it('Date recurrence - every week', function () {
        compareInputOutput('!(2020-07-28 | 1w)', {
            date: '2020-07-28',
            year: 2020,
            month: 7,
            day: 28,
            recurrenceString: '1w',
            recurrence: true,
            recurrenceAmount: 1,
            recurrenceUnit: 'w',
        });
    });

    it('Date recurrence - every week on monday, wednesday, friday', function () {
        compareInputOutput('!(2020-07-28 | 1w135)', {
            date: '2020-07-28',
            year: 2020,
            month: 7,
            day: 28,
            recurrenceString: '1w135',
            recurrence: true,
            recurrenceAmount: 1,
            recurrenceUnit: 'w',
            recurrenceDays: [1, 3, 5],
        });
    });
});
