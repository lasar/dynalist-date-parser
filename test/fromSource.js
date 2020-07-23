const should = require('should');

const Parser = require('../');

describe('Parser::fromSource', function () {
    it('should skip undefined input', function () {
        const ddp = new Parser();

        (ddp.source === null).should.be.true();
        (ddp.sourceType === null).should.be.true();
        (ddp.dates === null).should.be.true();
    });

    it('should parse string', function () {
        const input = 'A string with a !(2020-07-06) date';

        const ddp = new Parser(input);

        ddp.source.should.eql(input);
        ddp.sourceType.should.equal('string');
        ddp.dates.should.be.an.Array();
        ddp.dates.should.be.of.length(1);
    });

    it('should parse node', function () {
        const input = {
            id: 123,
            content: 'A string with a !(2020-07-06) date',
            note: 'A string with another date !(2021-02-21)',
        };

        const ddp = new Parser(input);

        ddp.source.should.eql(input);
        ddp.sourceType.should.equal('node');
        ddp.dates.should.be.an.Array();
        ddp.dates.should.be.of.length(2);
    });

    it('should handle unknown input', function() {
        const input = {
            id: 123,
            text: 'A string with another date !(2021-02-21)',
        };

        const ddp = new Parser(input);

        ddp.source.should.eql(input);
        ddp.sourceType.should.equal('unknown');
        (ddp.dates === null).should.be.true();
    });
});
