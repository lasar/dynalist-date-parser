const should = require('should');

const Parser = require('../');

describe('Constructor', function () {
    it('should return instance', function () {
        const ddp = new Parser();

        ddp.should.be.an.Object();
    });
});
