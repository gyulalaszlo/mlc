"use strict";

var mapObj = require('./map-obj');

function termColor(colId) {
    return "\x1b[" + colId + "m";
}
function color(colorcode) {
    return function (str) {
        return termColor(colorcode) + str + termColor(0);
    }
}

var colorBase = { black: 0, red: 1, green: 2, yellow: 3, blue: 4, magenta: 5, cyan: 6, white: 7};

var colorCodes = {
    text: 30, bg: 40,
};



var Colors = mapObj(function(colors){
    return mapObj(function(code){
        return color(colors + code);
    }, colorBase);
}, colorCodes);



module.exports = {termColor, color, colorCodes, Colors};