const should = require('should');

const Parser = require('../');

describe('Parser::updateSource', function () {
    it('should apply year change', function () {
        const ddp = new Parser('A string with non-recurring !(2020-07-06) date');

        ddp.modifyDates(date => {
            date.year = 2021;
            return date;
        });

        ddp.updateSource().should.match(/2021/);
    });

    it('should delete the date', function () {
        const ddp = new Parser('A string with non-recurring !(2020-07-06) date');

        ddp.modifyDates(date => {
            date.delete = true;
            return date;
        });

        ddp.updateSource().should.match('A string with non-recurring  date');
    });
});
