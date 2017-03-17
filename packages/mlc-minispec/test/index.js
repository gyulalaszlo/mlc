var miniSpec = require('../src/index');

// Assertion
// ---------


miniSpec.nodeJs(function (describe, it, assert) {

    describe('foo', function () {
        describe('bar', function () {
            it('should assert on errors', function () {

                assert.eq('foo', 'foo');
            })
        })

        it('should assert on errors', function () {
            var error;
            try {
                assert.eq('foo', 'foos');
            } catch (e) {
                error = e;
            }
            assert.isDefined(error);
        })
    });
});


// function simpleTest(name, input, output) {
//
// }
//
//
// var specBuilder = makeSpec(describe, it);
//
// specBuilder()