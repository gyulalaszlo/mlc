"use strict";


function random(s) {
    function rnd(n) {
        var o = [];
        for (var i = 0; i < n; ++i) {
            o.push(s[Math.floor(Math.random() * (s.length - 0.001))]);
        }
        return o.join('');
    }

    function header(n, str, indent) {
        var h = rnd(n) + (indent || '    ');
        return h + str + h.split('').reverse().join('');
    }

    return {
        random: rnd,
        header: header,
    }
}

function stuff(s) {
    return s.split('');
}
function groupBy(pred, s) {
    return s.reduce(function (memo, c, i) {
        var k = pred(c, i);
        memo[k] = c;
        return memo;
    }, [])
}

function groupsOf(n, s) {
    return groupBy(function (_, i) {
        return i % n;
    }, s);
}


var Deco = {
        typing: random(stuff("~!@#$%^&*+")),
        dotish: random(stuff('.,')),
        spindot: random(stuff('.,;:|\'"`;,')),
        pipeish: random(stuff('-~')),
        dpipeish: random(stuff('=')),
        cross: random(stuff('+')),

        greek: random(stuff("αβγδεζηθικλμνξοπρςτυφχψω")),
        numeric: random(stuff("⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑᵢⱼₒᵣᵤᵥₓₔ")),
        op: random(stuff("×✕✖÷{…}⊕⊖⊗⊘⊙⊚⊛⊜⊝{…}⊞⊟⊠⊡−∕∗∘∙⋅⋆∅ℵ")),
        sym: random(groupsOf(2, stuff(
            "∈∋∉∌⋶⋽⋲⋺⋳⋻" +
            "∊∍⋷⋾⋴⋼⋵⋸⋹⫙⟒⊂⊃⊆⊇⊈⊉⊊⊋⊄⊅⫅⫆⫋⫌⫃⫄⫇⫈⫉⫊⟃⟄⫏⫐⫑⫒⫓⫔⫕⫖⫗⫘⋐⋑" +
            "⟈⟉∪⩁⩂⩅⩌⩏⩐∩⩀⩃⩄⩍⩎⩆⩇⩈⩉⩊⩋⪽⪾⪿⫀⫁⫂⋒⋓⋂⋃⊌⊍⊎⨃⨄⨅⨆⨝⟕⟖⟗≺≻" +
            "≼≽≾≿⊀⊁⋞⋟⋠⋡⋨⋩⪯⪰⪱⪲⪳⪴⪵⪶⪷⪸⪹⪺⪻⪼<>≮≯≤≥≰≱⪇⪈≦≧≨≩⋜⋝⪙⪚≶≷≸≹" +
            "⋚⋛⪋⪌⪑⪒⪓⪔⪅⪆⪉⪊≲≳⋦⋧≴≵⪝⪞⪟⪠⪍⪎⪏⪐⩽⩾⫹⫺⪕⪖⪛⪜⪣⪤⪥⪦⪧⪨⪩⪪⪫⪬⪭⪡⪢⫷⫸⩹⩺" +
            "⩻⩼≪≫⋘⋙≬⋖⋗⩿⪀⪗⪘⪁⪂⪃⪄"
        ))),

        pipe: random(stuff("≝≞≟≠∹≎≏⪮≐≑≒≓≔≕≖≗≘≙≚≛≜⩬⩭⩮⩱⩲⩦⩴⩵⩶⩷≡≢⩧≍≭≣⩸" +
            "≁≂≃≄⋍≅≆≇≈≉≊≋≌⩯⩰∻⊏⊐⊑⊒⊓⊔⋢⋣⋤⋥⫴⫵⊲⊳⊴⊵⋪⋫⋬⋭¬⫬⫭⊨⊭")),

        misc: random(stuff(
            "∀∁∃∄∴∵⊦⊬⊧⊩⊮⊫⊯⊪⊰⊱∧∨⊻⨰⨱⨲⨳⋇⟌⟠∎⫯⫰⫱∾⊺⋔⫚⟊⟔⟓⟡⟢⟣" +
            "⊼⊽⋎⋏⟑⟇⩑⩒⩓⩔⩕⩖⩗⩘⩙⩚⩛⩜⩝⩞⩟⩠⩢⩣⨇⨈⋀⋁∣∤⫮⌅⌆ℓ⫛∝∶∷∺∥∦⫲⫳⋕⟂⫡⦜∟⊾⦝⊿∠∡" +
            "⦛⦞⦟⦢⦣⦤⦥⦦⦧⦨⦩⦪⦫⦬⦭⦮⦯⦓⦔⦕⦖⟀∢⦠⦡⌈⌉⌊⌋⫍⫎∫∬∭∮∯∰∱∲∳⨋⨌⨍⨎⨏⨐⨑⨒⨓⨔⨕⨖" +
            "⨗⨘⨙⨚⨛⨜∂′″‴∆⨯∇⊹∼∽⩪⩫⩳⋄⫶⫼⫾≀⨿⨼⨽⧢⋉⋊⋋⋌∑⨊⨁⨀⨂∏∐⨉⧴⨢⨣⨤⨥⨦⨧⨨⨭⨮∔⧺⧻∸⨩⨪⨫⨬" +
            "±∓⋮⋯⋰⋱∿⊣⊢⊥⊤⟘⟙⟛⟝⟞⟟⫧⫨⫩⫪⫫⫞⫟⫠⫢⫣⫤⫥⟚⦁⦂⨾⨟⨠⨡⩤⩥⦇⦈⦉⦊⧵⧶⧷⧸⫽⫻⧹⊶⊷⊸⟜⧟" +
            "⦰⦱⦲⦳⦴⦵⦶⦷⦸⦹⦺⦻⨴⨵⨶⨷⨸⦼⦽⧀⧁⧂⧃⧡⧣⧤⧥⧦⧧⧾⨞⧊⧋⧌⧍⨹⨺⨻⧎⧏⧐⩡⩨⩩⫝̸⫝⫦"
        ))

    }
    ;


// fuck with unicode stuff
module.exports = Deco;
