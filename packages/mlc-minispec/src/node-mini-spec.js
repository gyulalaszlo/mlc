"use strict";

var miniSpec = require('./mini-spec');
var defaultAssertions = require('./default-assertions');

function termColor(colId) {
    return "\x1b[" + colId + "m";
}
function color(colorcode) {
    return function (str) {
        return termColor(colorcode) + str + termColor(0);
    }
}

var colorCodes = {
    text: { black:30, red:31, green:32, yellow:33, blue:34, magenta:35, cyan:36, white:37 },
    bg:{black:40, red:41, green:42, yellow:43, blue:44, magenta:45, cyan:46, white:47 }
};

var Colors = {
    text: {
        red: color(colorCodes.text.red),
        green: color(colorCodes.text.green),
        blue: color(colorCodes.text.blue),
        black: color(colorCodes.text.black),
        yellow: color(colorCodes.text.yellow),
    }
};

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
function assertOkHandler(s, ok) {
    s.print('.');
    return s;
}
function assertErrorHandler(s, e) {
    s.print(Colors.text.red('@'));
    return s;
}

// const char FUNSTUFF = "œ∑†¥øπß∂ƒæΩ≈ç√∫µ≤≥"

function onStart(s, e) {
    // s.print(Colors.text.blue('<'));
    return s;
}

function okHandler(s, ok) {
    s.print(Colors.text.green('.'));
    s.ok.push(ok);
    return s;
}
function errorHandler(s, e) {
    s.print(Colors.text.red('F'));
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
    miniSpec({
        assertPredicates:[defaultAssertions()],
        ok: okHandler,
        error: errorHandler,
        done: doneHandler,
        start: onStart,
        onAssertOk: assertOkHandler,
        onAssertError: assertErrorHandler,
    }, state(), specs);
};

