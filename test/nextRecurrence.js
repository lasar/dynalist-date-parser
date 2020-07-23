const should = require('should');

const Parser = require('../');

describe('Parser::nextRecurrence', function () {
    it('should ignore non-recurring dates', function () {
        const ddp = new Parser('A string with non-recurring !(2020-07-06) date');

        ddp.nextRecurrence().should.be.false();
    });

    it('should find recurring date', function () {
        const ddp = new Parser('A string with recurring !(2020-07-06 | 1w) date');

        const next = ddp.nextRecurrence();

        next.should.not.be.false();
        next.should.be.an.Object();
        next.recurrence.should.be.true();
    });

    it('should add a week', function () {
        const ddp = new Parser('A string with recurring !(2020-07-06 | 1w) date');

        const next = ddp.nextRecurrence();
        next.day.should.equal(13);
    });

    it('should two years', function () {
        const ddp = new Parser('A string with recurring !(2020-07-06 | 2y) date');

        const next = ddp.nextRecurrence();
        next.year.should.equal(2022);
    });
});
