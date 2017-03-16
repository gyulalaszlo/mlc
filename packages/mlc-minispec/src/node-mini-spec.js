/**
 * Created by t on 16/03/17.
 */

var miniSpec = require('./mini-spec');
var defaultAssertions = require('./default-assertions');

function state() {
    return {
        print: function (s) {
            process.stdout.write(s, 'utf-8');
        },
        ok: [],
        errors: []
    };
}

function cleanLogLine(line) {
    function removeNodeModules(line) {
        return /\/node_modules\//.test(line)
            ? '   ... <SNIP> ... '
            : line;
    }

    return removeNodeModules(line);
}

function okHandler(s, ok) {
    s.print('.');
    s.ok.push(ok);
    return s;
}
function errorHandler(s, e) {
    s.print('F');
    s.errors.push(e);
    return s;
}
function doneHandler(s, assertCount) {
    console.log();
    s.errors.forEach(function (e, i) {
        console.error("\n -----  Error #%d: %s -----\n", i, e.name);
        console.error(e.error.stack.split('\n').map(cleanLogLine).join('\n'));
        console.log();
    });
    console.log("%d nodes, %d assertions, %d errors", s.ok.length, assertCount, s.errors.length);
    return Object.assign(s, {assertCount: assertCount});
}

module.exports = function (specs) {
    runSpecs = function (specFn) {
        miniSpec([defaultAssertions()],okHandler, errorHandler, doneHandler, state(), specFn);
    };
    return (Array.isArray(specs) ? specs : [specs]).map(runSpecs);
};

