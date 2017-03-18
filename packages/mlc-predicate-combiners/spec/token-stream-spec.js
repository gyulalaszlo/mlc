const {makeTokenStream} = require('../src/predicate-combiners');


module.exports = function (describe, it, expect) {

    describe('makeTokenStream', () => {
        describe('#next()', () => {
            it('should iterate through the stream', () => {
                let t = makeTokenStream(['a', 'b']);

                let s = t.next();
                expect.eq(s.done, false);
                expect.eq(s.value, 'a');

                s = t.next();
                expect.eq(s.done, false);
                expect.eq(s.value, 'b');

                s = t.next();
                expect.eq(s.done, true);
            });

        });


        describe('#currentIndex() and #restore()', () => {
            it('should currentIndex the state of the tokenstream as minimally as possible', () => {
                let t = makeTokenStream(['a', 'b', 'c']);
                let v = t.next();
                expect.eq(v.value, 'a');
                let saved = t.currentIndex();
                t.next();
                v = t.next();
                expect.eq(v.value, 'c');
                v = t.restore(saved).next();
                expect.eq(v.value, 'b');
            });

        });
    });
}
