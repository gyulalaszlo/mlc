/**
 * Created by t on 16/03/17.
 */

var miniSpec = require('./mini-spec');

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
            ? '...'
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
function doneHandler(s) {
    console.log();
    s.errors.forEach(function (e, i) {
        console.error(e.error.stack.split('\n').map(cleanLogLine).join('\n'));
        console.log();
    });
    console.log("%d nodes, %d errors", s.ok.length, s.errors.length);
}

module.exports = function (specs) {
    miniSpec(state(), okHandler, errorHandler, doneHandler, specs);
};

