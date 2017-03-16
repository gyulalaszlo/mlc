// var yaml = require('js-yaml');

// :: any -> String
function _j(o) {
    return JSON.stringify(o);
}

// :: (string -> ( () -> () ) -> ()) -> (string -> in -> out -> ()) -> (string -> Array<any>)
function specRunner(it, predicate) {
    // :: string -> Array<any> -> ()
    return function (name, cases) {
        cases.forEach(function (_case) {
            it(name + ': ' + j(_case.input) + " -> " + j(_case.output),
                predicate(name, _case.input, _case.output));
        });
    }
}

function makeSpec(describe, it) {
    return function (predicate, fileName) {
        var run = specRunner(it, predicate);

        function createGroup(group) {
            describe(group.name + ":", specs.map(run));
        }

        // Get document, or throw exception on error
        try {
            // var doc = yaml.safeLoad(fs.readFileSync(fileName, 'utf8'));
            // console.log(doc);
        } catch (e) {
            // console.log(e);
        }
    }
}

module.exports = makeSpec;