"use strict";

var miniSpec = require('./mini-spec');
var defaultAssertions = require('./default-assertions');
var Deco = require('./deco');

var nodeConsole = require('./node-console');
var Colors = nodeConsole.Colors;

var COLUMNS = 80;

function state() {
    return {
        print: function (s) {
            process.stdout.write(s, 'utf-8');
        },
        ok: [],
        errors: [],

        events: [],
    };
}

function reprint(s, newEvt) {
    s.events.push(newEvt);
    function p(color, group, n) {
        s.print(Colors.text[color](Deco[group].random(n || 1)));
    }

    switch (newEvt) {
        case 'assert-ok':
            // s.print('\'');
            // s.print(' ');
            // p('green', 'dotish');
            break;

        case 'assert-error':
            p('yellow', 'typing');
            break;

        case 'start':
            // s.print('.');
            // p('green', 'cross');
            break;

        case 'ok':
            p('green', 'pipeish');
            break;

        case 'error':
            p('red', 'cross');
            break;
    }

    if (s.events.length % COLUMNS === 0) {
        s.print("\n")
        // s.print("\t[" + s.events.length + "]\n");
    }
    // }
    // s.print('\n');
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
    // s.print('.\b');
    // reprint(s, 'assert-ok');
    return s;
}
function assertErrorHandler(s, e) {
    // s.print(Colors.text.red('@\b'));
    reprint(s, 'assert-error');
    return s;
}


function onStart(s, e) {
    // s.print(Colors.text.blue('^\b'));
    // reprint(s, 'start');
    return s;
}

function okHandler(s, ok) {
    // s.print(Colors.text.green('.'));
    s.ok.push(ok);
    reprint(s, 'ok');
    return s;
}
function errorHandler(s, e) {
    // s.print(Colors.text.red('F'));
    s.errors.push(e);
    reprint(s, 'error');
    return s;
}
function doneHandler(s, assertCount) {
    console.log();
    s.errors.forEach(function (e, i) {
        console.log(Deco.pipeish.header(25, Colors.text.red("ERROR: " + e.name), '     '));

        if (e.error.assertText) {
            console.log(Colors.text.red(e.error.assertText));
        }
        console.log(e.error.stack.split('\n').map(cleanLogLine).join('\n'));
        console.log();
    });
    // console.log(Deco.pipeish.header(32, "DONE", '     '));
    console.log("\n");
    console.log(
        Colors.text.cyan("%d nodes"), s.ok.length,
        Colors.text.white("\t" + assertCount + " assertions\t"),
        Colors.text.black(
            (s.errors.length > 0)
                ? Colors.bg.red(" " + s.errors.length + " errors \t")
                : Colors.bg.green("  OK  ")
        )
    );
    return Object.assign(s, {assertCount: assertCount});
}

module.exports = function (specs) {
    miniSpec({
        assertPredicates: [defaultAssertions()],
        ok: okHandler,
        error: errorHandler,
        done: doneHandler,
        start: onStart,
        onAssertOk: assertOkHandler,
        onAssertError: assertErrorHandler,
    }, state(), specs);
};

