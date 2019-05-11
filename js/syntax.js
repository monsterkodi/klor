// koffee 0.30.0

/*
 0000000  000   000  000   000  000000000   0000000   000   000
000        000 000   0000  000     000     000   000   000 000 
0000000     00000    000 0 000     000     000000000    00000  
     000     000     000  0000     000     000   000   000 000 
0000000      000     000   000     000     000   000  000   000
 */
var Syntax, _, empty, error, first, last, log, noon, ref, slash, valid,
    indexOf = [].indexOf;

ref = require('../../kxk'), noon = ref.noon, slash = ref.slash, first = ref.first, valid = ref.valid, empty = ref.empty, last = ref.last, error = ref.error, _ = ref._;

log = console.log;

Syntax = (function() {
    function Syntax() {}

    Syntax.exts = [];

    Syntax.lang = null;

    Syntax.init = function() {
        var data, ext, extNames, info, mtchInfo, results, value, valueWords, word, words;
        if (Syntax.lang !== null) {
            return;
        }
        data = noon.load(slash.join(__dirname, '..', 'coffee', 'lang.noon'));
        Syntax.lang = {};
        Syntax.info = {};
        Syntax.mtch = {};
        Syntax.fill = {};
        Syntax.word = {};
        Syntax.turd = {};
        results = [];
        for (extNames in data) {
            valueWords = data[extNames];
            results.push((function() {
                var base, i, len, ref1, results1;
                ref1 = extNames.split(/\s/);
                results1 = [];
                for (i = 0, len = ref1.length; i < len; i++) {
                    ext = ref1[i];
                    if (indexOf.call(Syntax.exts, ext) < 0) {
                        Syntax.exts.push(ext);
                    }
                    if ((base = Syntax.lang)[ext] != null) {
                        base[ext];
                    } else {
                        base[ext] = {};
                    }
                    results1.push((function() {
                        var base1, results2;
                        results2 = [];
                        for (value in valueWords) {
                            words = valueWords[value];
                            if (value === 'comment') {
                                if ((base1 = Syntax.info)[ext] != null) {
                                    base1[ext];
                                } else {
                                    base1[ext] = {};
                                }
                                results2.push(Syntax.info[ext][value] = words);
                            } else if (value === 'match') {
                                results2.push((function() {
                                    var base2, base3, base4, base5, base6, name, results3;
                                    results3 = [];
                                    for (value in words) {
                                        mtchInfo = words[value];
                                        if (mtchInfo.fill) {
                                            if ((base2 = Syntax.fill)[ext] != null) {
                                                base2[ext];
                                            } else {
                                                base2[ext] = {};
                                            }
                                            mtchInfo.value = value;
                                            results3.push(Syntax.fill[ext][mtchInfo.fill] = mtchInfo);
                                        } else if (mtchInfo.end) {
                                            if ((base3 = Syntax.mtch)[ext] != null) {
                                                base3[ext];
                                            } else {
                                                base3[ext] = {};
                                            }
                                            if ((base4 = Syntax.mtch[ext])[name = last(mtchInfo.end)] != null) {
                                                base4[name];
                                            } else {
                                                base4[name] = [];
                                            }
                                            mtchInfo.value = value;
                                            results3.push(Syntax.mtch[ext][last(mtchInfo.end)].push(mtchInfo));
                                        } else if (mtchInfo.turd) {
                                            if ((base5 = Syntax.turd)[ext] != null) {
                                                base5[ext];
                                            } else {
                                                base5[ext] = {};
                                            }
                                            mtchInfo.match = value;
                                            results3.push(Syntax.turd[ext][value] = mtchInfo);
                                        } else {
                                            if ((base6 = Syntax.word)[ext] != null) {
                                                base6[ext];
                                            } else {
                                                base6[ext] = {};
                                            }
                                            mtchInfo.value = value;
                                            results3.push(Syntax.word[ext][value] = mtchInfo);
                                        }
                                    }
                                    return results3;
                                })());
                            } else {
                                if (!_.isArray(words)) {
                                    results2.push((function() {
                                        var base2, base3, results3;
                                        results3 = [];
                                        for (word in words) {
                                            info = words[word];
                                            if (info) {
                                                if ((base2 = Syntax.info)[ext] != null) {
                                                    base2[ext];
                                                } else {
                                                    base2[ext] = {};
                                                }
                                                if ((base3 = Syntax.info[ext])[value] != null) {
                                                    base3[value];
                                                } else {
                                                    base3[value] = [];
                                                }
                                                results3.push(Syntax.info[ext][value].push({
                                                    kind: word[0] === 't' ? 'turd' : 'word',
                                                    offset: parseInt(word.slice(1)),
                                                    info: info
                                                }));
                                            } else {
                                                results3.push(Syntax.lang[ext][word] = value);
                                            }
                                        }
                                        return results3;
                                    })());
                                } else {
                                    results2.push((function() {
                                        var j, len1, results3;
                                        results3 = [];
                                        for (j = 0, len1 = words.length; j < len1; j++) {
                                            word = words[j];
                                            results3.push(Syntax.lang[ext][word] = value);
                                        }
                                        return results3;
                                    })());
                                }
                            }
                        }
                        return results2;
                    })());
                }
                return results1;
            })());
        }
        return results;
    };

    Syntax.ranges = function(text, ext) {
        var char, i, len, obj;
        Syntax.init();
        obj = {
            ext: ext != null ? ext : 'txt',
            rgs: [],
            words: [],
            word: '',
            turd: '',
            last: '',
            index: 0,
            text: text
        };
        switch (obj.ext) {
            case 'cpp':
            case 'hpp':
            case 'c':
            case 'h':
            case 'cc':
            case 'cxx':
            case 'cs':
                obj.cpplang = true;
                obj.cpp = true;
                break;
            case 'coffee':
            case 'koffee':
            case 'js':
            case 'ts':
                obj.jslang = true;
                obj[obj.ext] = true;
                if (obj.ext === 'koffee') {
                    obj.coffee = true;
                }
                break;
            case 'html':
            case 'htm':
                obj.html = true;
                break;
            case 'yaml':
            case 'yml':
                obj.yaml = true;
                break;
            case 'css':
            case 'styl':
            case 'scss':
            case 'sass':
                obj.csslang = true;
                obj[obj.ext] = true;
                break;
            default:
                obj[obj.ext] = true;
        }
        if (obj.jslang || obj.iss || obj.log || obj.json || obj.yaml) {
            obj.dictlang = true;
        }
        if (obj.csslang || obj.iss || obj.pug) {
            obj.dashlang = true;
        }
        if (obj.cpplang || obj.jslang || obj.log) {
            obj.dotlang = true;
        }
        if (obj.xml || obj.html || obj.plist) {
            obj.xmllang = true;
        }
        for (i = 0, len = text.length; i < len; i++) {
            char = text[i];
            if (obj.char === '\\') {
                if (obj.escp) {
                    delete obj.escp;
                } else {
                    obj.escp = true;
                }
            } else {
                delete obj.escp;
            }
            obj.char = char;
            if (obj.interpolation && obj.char === '}') {
                Syntax.endWord(obj);
                obj.rgs.push({
                    start: obj.index,
                    match: obj.char,
                    value: obj.interpolation + " punctuation"
                });
                obj.string = {
                    start: obj.index + 1,
                    value: obj.interpolation,
                    match: ''
                };
                obj.index++;
                continue;
            }
            if (obj.string) {
                Syntax.doString(obj);
            } else if (obj.comment) {
                Syntax.doComment(obj);
            } else {
                switch (char) {
                    case "'":
                    case '"':
                    case '`':
                        if (!obj.escp && (char !== "'" || obj.jslang || obj.pug)) {
                            Syntax.startString(obj);
                        } else {
                            Syntax.doPunct(obj);
                        }
                        break;
                    case '+':
                    case '*':
                    case '<':
                    case '>':
                    case '=':
                    case '^':
                    case '~':
                    case '@':
                    case '$':
                    case '&':
                    case '%':
                    case '#':
                    case '/':
                    case '\\':
                    case ':':
                    case '.':
                    case ';':
                    case ',':
                    case '!':
                    case '?':
                    case '|':
                    case '{':
                    case '}':
                    case '(':
                    case ')':
                    case '[':
                    case ']':
                        Syntax.doPunct(obj);
                        break;
                    case '-':
                        if (obj.dashlang) {
                            Syntax.doWord(obj);
                        } else {
                            Syntax.doPunct(obj);
                        }
                        break;
                    case ' ':
                    case '\t':
                        Syntax.endWord(obj);
                        break;
                    default:
                        Syntax.doWord(obj);
                }
                if (char !== ' ' && char !== '\t') {
                    Syntax.coffeeCall(obj);
                }
            }
            obj.index++;
        }
        obj.char = null;
        Syntax.endWord(obj);
        Syntax.endLine(obj);
        return obj.rgs;
    };

    Syntax.endWord = function(obj) {
        var char, clss, getMatch, getValue, i, index, j, k, l, lastTurd, lcword, len, match, matchValue, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref3, ref4, ref5, ref6, ref7, ref8, ref9, setClass, setValue, turdInfo, valueInfo, word, wordInfo, wordValue;
        char = (ref1 = obj.char) != null ? ref1 : '';
        obj.turd += char;
        switch (char) {
            case ' ':
            case '\t':
                Syntax.doTurd(obj);
                if ((obj.regexp != null) && !obj.escp) {
                    delete obj.regexp;
                }
                if (obj.noon) {
                    if (obj.turd.endsWith('  ')) {
                        if (((ref2 = first(obj.rgs)) != null ? ref2.start : void 0) > 0) {
                            for (index = i = 0, ref3 = obj.rgs.length; 0 <= ref3 ? i < ref3 : i > ref3; index = 0 <= ref3 ? ++i : --i) {
                                Syntax.substitute(obj, -index - 1, ['text'], ['property']);
                                Syntax.substitute(obj, -index - 1, ['punctuation'], ['property punctuation']);
                            }
                        }
                    }
                }
        }
        if (valid(obj.word)) {
            word = obj.word;
            obj.words.push(word);
            obj.word = '';
            getValue = function(back) {
                if (back == null) {
                    back = -1;
                }
                return Syntax.getValue(obj, back);
            };
            getMatch = function(back) {
                if (back == null) {
                    back = -1;
                }
                return Syntax.getMatch(obj, back);
            };
            setValue = function(back, value) {
                return Syntax.setValue(obj, back, value);
            };
            setClass = function(clss) {
                var ref4;
                if (obj.coffee) {
                    if (((ref4 = last(obj.rgs)) != null ? ref4.match : void 0) === '@') {
                        if (clss === 'text') {
                            clss = 'member';
                        }
                        last(obj.rgs).value = clss + ' punctuation';
                    }
                } else if (obj.js) {
                    if (clss === 'keyword function') {
                        Syntax.replace(obj, -2, [
                            {
                                word: true
                            }, {
                                match: '='
                            }
                        ], [
                            {
                                value: 'function'
                            }
                        ]);
                    }
                }
                obj.rgs.push({
                    start: obj.index - word.length,
                    match: word,
                    value: clss
                });
                return null;
            };
            if (valid(obj.fill)) {
                return setClass(obj.fill.value);
            }
            switch (char) {
                case ':':
                    if (obj.dictlang) {
                        return setClass('dictionary key');
                    }
                    break;
                case '=':
                    if (obj.ini) {
                        return setClass('property');
                    }
            }
            if (Syntax.turd[obj.ext]) {
                lastTurd = last(obj.last.split(/\s+/));
                if (turdInfo = Syntax.turd[obj.ext][lastTurd]) {
                    if (turdInfo.spaced !== true || obj.last[obj.last.length - lastTurd.length - 1] === ' ') {
                        if (turdInfo['w-1']) {
                            setValue(-turdInfo.match.length - 1, turdInfo['w-1']);
                        }
                        for (index = j = 0, ref4 = turdInfo.match.length; 0 <= ref4 ? j < ref4 : j > ref4; index = 0 <= ref4 ? ++j : --j) {
                            setValue(-index - 1, turdInfo.turd);
                        }
                        if (turdInfo['w-0']) {
                            return setClass(turdInfo['w-0']);
                        }
                    }
                }
            }
            lcword = word.toLowerCase();
            if (wordInfo = (ref5 = Syntax.word[obj.ext]) != null ? ref5[lcword] : void 0) {
                if ((wordInfo['t-1'] != null) && (ref6 = obj.last, indexOf.call(Object.keys(wordInfo['t-1']), ref6) >= 0)) {
                    setValue(-2, wordInfo.value + ' ' + wordInfo['w-1']);
                    setValue(-1, wordInfo.value + ' ' + wordInfo['t-1'][obj.last]);
                    return setClass(wordInfo.value + ' ' + wordInfo.word);
                }
            }
            if (wordValue = (ref7 = Syntax.lang[obj.ext]) != null ? ref7[lcword] : void 0) {
                if (((ref8 = Syntax.info[obj.ext]) != null ? ref8[wordValue] : void 0) != null) {
                    ref9 = Syntax.info[obj.ext][wordValue];
                    for (k = 0, len = ref9.length; k < len; k++) {
                        valueInfo = ref9[k];
                        ref10 = valueInfo.info;
                        for (match in ref10) {
                            matchValue = ref10[match];
                            if (obj.last.trim().endsWith(match)) {
                                for (index = l = 0, ref11 = match.length; 0 <= ref11 ? l < ref11 : l > ref11; index = 0 <= ref11 ? ++l : --l) {
                                    setValue(-1 - index, matchValue + ' punctuation');
                                }
                                return setClass(matchValue);
                            }
                        }
                    }
                } else {
                    return setClass(wordValue);
                }
            }
            if (obj.coffee) {
                if ((ref12 = getMatch(-1)) === 'class' || ref12 === 'extends') {
                    return setClass('class');
                }
                if (((ref13 = getValue(-1)) != null ? typeof ref13.indexOf === "function" ? ref13.indexOf('punctuation') : void 0 : void 0) < 0) {
                    if (word !== 'else' && word !== 'then' && word !== 'and' && word !== 'or' && word !== 'in') {
                        if ((ref14 = last(obj.rgs).value) !== 'keyword' && ref14 !== 'function head' && ref14 !== 'require' && ref14 !== 'number') {
                            setValue(-1, 'function call');
                        }
                    }
                }
            }
            if (/^0x[a-fA-F\d][a-fA-F\d][a-fA-F\d]+$/.test(word)) {
                setValue(-2, 'number hex punctuation');
                setValue(-1, 'number hex punctuation');
                return setClass('number hex');
            }
            if (getMatch(-1) === "#") {
                if (/^[a-fA-F\d]+$/.test(word)) {
                    setValue(-1, 'number hex punctuation');
                    return setClass('number hex');
                }
            }
            if (obj.noon) {
                if (obj.words.length === 1) {
                    if (empty(obj.last)) {
                        return setClass('class');
                    }
                }
            } else if (obj.sh) {
                if (obj.words.length > 1 && getMatch(-1) === '-' && getValue(-2) === 'argument') {
                    setClass(-1, 'argument punctuation');
                    return setClass('argument');
                }
            }
            if (obj.cpplang) {
                if (obj.last === '::') {
                    if (obj.rgs.length >= 3) {
                        setValue(-3, 'namespace');
                        setValue(-2, 'punctuation namespace');
                        setValue(-1, 'punctuation namespace');
                        if (char === '(') {
                            return setClass('function call');
                        }
                        return setClass('property');
                    }
                }
                if (/^[\\_A-Z][\\_A-Z0-9]+$/.test(word)) {
                    return setClass('macro');
                }
                if (/^[UA][A-Z]\w+$/.test(word)) {
                    return setClass('type class');
                } else if (/^[SF][A-Z]\w+$/.test(word)) {
                    return setClass('type struct');
                } else if (/^[E][A-Z]\w+$/.test(word)) {
                    return setClass('type enum');
                }
                if (indexOf.call(obj.words, 'class') >= 0) {
                    return setClass('class');
                }
                if (char === '<') {
                    return setClass('type template');
                }
                if (obj.last === '::') {
                    if ((ref15 = getValue(-3)) === 'enum' || ref15 === 'class' || ref15 === 'struct') {
                        console.log('really?');
                        clss = getValue(-3);
                        setValue(-3, getValue(-3) + ' punctuation');
                        setValue(-2, getValue(-3) + ' punctuation');
                        setValue(-1, getValue(-3) + ' punctuation');
                    }
                }
                if (obj.last === '.' && /^\d+f$/.test(word)) {
                    if (getValue(-2) === 'number') {
                        setValue(-2, 'number float');
                        setValue(-1, 'number float punctuation');
                        return setClass('number float');
                    }
                }
                if (obj.last.endsWith("##")) {
                    setValue(-2, 'punctuation operator');
                    setValue(-1, 'punctuation operator');
                } else if (obj.last.endsWith('->')) {
                    setValue(-3, 'obj');
                    setValue(-2, 'property punctuation');
                    setValue(-1, 'property punctuation');
                    return setClass('property');
                }
                if (first(obj.words).startsWith('U') && ((ref16 = first(obj.rgs)) != null ? ref16.value : void 0) === 'macro') {
                    if (word.startsWith('Blueprint')) {
                        return setClass('macro punctuation');
                    }
                    if ((ref17 = word.toLowerCase()) === 'meta' || ref17 === 'displayname' || ref17 === 'category' || ref17 === 'worldcontext' || ref17 === 'editanywhere') {
                        return setClass('macro punctuation');
                    }
                    if ((ref18 = word.toLowerCase()) === 'config' || ref18 === 'transient' || ref18 === 'editdefaultsonly' || ref18 === 'visibleanywhere' || ref18 === 'nontransactional' || ref18 === 'interp' || ref18 === 'globalconfig') {
                        return setClass('macro');
                    }
                }
            }
            if (/^\d+$/.test(word)) {
                if (obj.last === '.') {
                    if (getValue(-4) === 'number float' && getValue(-2) === 'number float') {
                        setValue(-4, 'semver');
                        setValue(-3, 'semver punctuation');
                        setValue(-2, 'semver');
                        setValue(-1, 'semver punctuation');
                        return setClass('semver');
                    }
                    if (getValue(-2) === 'number') {
                        setValue(-2, 'number float');
                        setValue(-1, 'number float punctuation');
                        return setClass('number float');
                    }
                }
                return setClass('number');
            }
            if (obj.dotlang) {
                if ((ref19 = obj.last) === '.' || ref19 === ':') {
                    if ((ref20 = getValue(-2)) === 'text' || ref20 === 'module' || ref20 === 'class' || ref20 === 'member' || ref20 === 'keyword') {
                        if (getValue(-2) === 'text') {
                            setValue(-2, 'obj');
                        }
                        setValue(-1, 'property punctuation');
                        if (char === '(') {
                            return setClass('function call');
                        } else {
                            return setClass('property');
                        }
                    }
                }
                if (obj.last.endsWith('.')) {
                    if (getValue(-2) === 'property') {
                        setValue(-1, 'property punctuation');
                        if (char === '(') {
                            return setClass('function call');
                        } else {
                            return setClass('property');
                        }
                    }
                    if (obj.last.length > 1) {
                        if ((ref21 = obj.last[obj.last.length - 2]) === ')' || ref21 === ']') {
                            setValue(-1, 'property punctuation');
                            return setClass('property');
                        }
                        if (obj.coffee) {
                            if (obj.last[obj.last.length - 2] === '?') {
                                if (getValue(-3) === 'text') {
                                    setValue(-3, 'obj');
                                }
                                setValue(-2, 'operator punctuation');
                                setValue(-1, 'property punctuation');
                                return setClass('property');
                            }
                        }
                    }
                }
            }
            if (obj.csslang) {
                if (word.endsWith('s')) {
                    if (/\d+s/.test(word)) {
                        return setClass('number');
                    }
                }
                if ((ref22 = word.slice(word.length - 2)) === 'px' || ref22 === 'em' || ref22 === 'ex' || ref22 === 'ch') {
                    return setClass('number');
                }
            }
            if (obj.csslang || obj.pug) {
                if (obj.last.endsWith('.')) {
                    setValue(-1, 'class punctuation');
                    return setClass('class');
                }
                if (obj.last.endsWith("#")) {
                    setValue(-1, 'cssid punctuation');
                    return setClass('cssid');
                }
            }
            if (obj.cpplang || obj.js) {
                if (char === '(') {
                    return setClass('function call');
                }
            }
            return setClass('text');
        }
        return null;
    };

    Syntax.coffeeCall = function(obj) {
        var ref1, ref2, ref3, val;
        if (obj.coffee) {
            if (obj.turd === '(') {
                return Syntax.setValue(obj, -2, 'function call');
            } else if (obj.turd.length > 1 && obj.turd[obj.turd.length - 2] === ' ') {
                if (ref1 = last(obj.turd), indexOf.call('@+-\'"([{', ref1) >= 0) {
                    if (ref2 = last(obj.turd), indexOf.call('+-', ref2) >= 0) {
                        if (obj.text[obj.index + 1] === ' ') {
                            return;
                        }
                    }
                    val = Syntax.getValue(obj, -2);
                    if (valid(val) && (val !== 'keyword' && val !== 'function head' && val !== 'require')) {
                        if (val.indexOf('punctuation') < 0 && ((ref3 = obj.rgs.slice(-2, -1)[0].value) !== 'number')) {
                            return Syntax.setValue(obj, -2, "function call");
                        }
                    }
                }
            }
        }
    };

    Syntax.doWord = function(obj) {
        if (valid(obj.turd)) {
            Syntax.doTurd(obj);
            obj.last = obj.turd;
            obj.turd = '';
        }
        obj.word += obj.char;
        return null;
    };

    Syntax.doTurd = function(obj) {
        var i, index, ref1, ref2, ref3, results;
        if (empty(obj.fill) && empty(obj.words) && (((ref1 = Syntax.fill[obj.ext]) != null ? ref1[obj.turd] : void 0) != null)) {
            obj.fill = (ref2 = Syntax.fill[obj.ext]) != null ? ref2[obj.turd] : void 0;
            results = [];
            for (index = i = 0, ref3 = obj.turd.length; 0 <= ref3 ? i < ref3 : i > ref3; index = 0 <= ref3 ? ++i : --i) {
                if (obj.fill.turd) {
                    results.push(Syntax.setValue(obj, -1 - index, obj.fill.turd));
                } else {
                    results.push(Syntax.setValue(obj, -1 - index, obj.fill.value + ' ' + 'punctuation'));
                }
            }
            return results;
        }
    };

    Syntax.doPunct = function(obj) {
        var getValue, i, index, j, len, matchValue, mtch, ref1, ref2, ref3, ref4, ref5, setValue, turd, val, value;
        Syntax.endWord(obj);
        getValue = function(back) {
            if (back == null) {
                back = -1;
            }
            return Syntax.getValue(obj, back);
        };
        setValue = function(back, value) {
            return Syntax.setValue(obj, back, value);
        };
        value = 'punctuation';
        switch (obj.char) {
            case ':':
                if (obj.dictlang && obj.turd.length === 1) {
                    if (((ref1 = last(obj.rgs)) != null ? ref1.value : void 0) === 'dictionary key') {
                        value = 'dictionary punctuation';
                    }
                } else {
                    if (obj.coffee) {
                        setValue(-1, 'method');
                        value = 'method punctuation';
                    }
                }
                break;
            case '>':
                if (obj.jslang) {
                    ref2 = [['->', ''], ['=>', ' bound']];
                    for (i = 0, len = ref2.length; i < len; i++) {
                        ref3 = ref2[i], turd = ref3[0], val = ref3[1];
                        if (obj.turd.endsWith(turd)) {
                            Syntax.substitute(obj, -3, ['dictionary key', 'dictionary punctuation'], ['method', 'method punctuation']);
                            Syntax.surround(obj, -1, {
                                start: '(',
                                add: 'argument',
                                end: ')'
                            });
                            Syntax.replace(obj, -3, [
                                {
                                    word: true,
                                    ignore: 'argument'
                                }, {
                                    match: '='
                                }
                            ], [
                                {
                                    value: 'function'
                                }
                            ]);
                            setValue(-1, 'function tail' + val + ' punctuation');
                            value = 'function head' + val + ' punctuation';
                        }
                    }
                } else if (obj.xmllang || obj.md) {
                    if (obj.turd.endsWith('/>')) {
                        setValue(-1, 'keyword punctuation');
                    }
                    value = 'keyword punctuation';
                }
                break;
            case '/':
                if (obj.jslang) {
                    if (!obj.escp) {
                        if (obj.regexp != null) {
                            for (index = j = ref4 = obj.rgs.length - 1; ref4 <= 0 ? j <= 0 : j >= 0; index = ref4 <= 0 ? ++j : --j) {
                                if (obj.rgs[index].start < obj.regexp) {
                                    break;
                                }
                                obj.rgs[index].value = 'regexp ' + obj.rgs[index].value;
                            }
                            value = 'regexp punctuation';
                        } else {
                            obj.regexp = obj.index;
                        }
                    }
                }
        }
        if (mtch = (ref5 = Syntax.mtch[obj.ext]) != null ? ref5[obj.char] : void 0) {
            if (matchValue = Syntax.doMatch(obj, mtch)) {
                value = matchValue;
            }
        }
        if (obj.fill) {
            value = obj.fill.value + ' ' + value;
        }
        obj.rgs.push({
            start: obj.index,
            match: obj.char,
            value: value
        });
        return Syntax.checkComment(obj);
    };


    /*
     0000000   0000000   00     00  00     00  00000000  000   000  000000000  
    000       000   000  000   000  000   000  000       0000  000     000     
    000       000   000  000000000  000000000  0000000   000 0 000     000     
    000       000   000  000 0 000  000 0 000  000       000  0000     000     
     0000000   0000000   000   000  000   000  00000000  000   000     000
     */

    Syntax.checkComment = function(obj) {
        var comment, ref1;
        if (empty((ref1 = Syntax.info[obj.ext]) != null ? ref1.comment : void 0)) {
            return;
        }
        if (obj.regexp != null) {
            return;
        }
        comment = Syntax.info[obj.ext].comment;
        if (comment.line && obj.turd.endsWith(comment.line) && !obj.turd.endsWith('\\' + comment.line) && empty(obj.words)) {
            Syntax.startComment(obj, comment.line);
        }
        if (comment.tail && obj.turd.endsWith(comment.tail) && !obj.turd.endsWith('\\' + comment.tail)) {
            Syntax.startComment(obj, comment.tail);
        } else if (comment.start && obj.turd.endsWith(comment.start) && !obj.turd.endsWith('\\' + comment.start)) {
            Syntax.startComment(obj, comment.start);
        }
        return null;
    };

    Syntax.startComment = function(obj, start) {
        var i, index, ref1, results;
        obj.comment = {
            start: obj.index + 1,
            match: '',
            value: 'comment'
        };
        results = [];
        for (index = i = 0, ref1 = start.length; 0 <= ref1 ? i < ref1 : i > ref1; index = 0 <= ref1 ? ++i : --i) {
            results.push(Syntax.setValue(obj, -1 - index, 'comment punctuation'));
        }
        return results;
    };

    Syntax.doComment = function(obj) {
        var comment, i, index, ref1;
        comment = Syntax.info[obj.ext].comment;
        if (comment.end && obj.turd.endsWith(comment.end)) {
            obj.rgs.push(obj.comment);
            delete obj.comment;
            for (index = i = 0, ref1 = comment.end.length; 0 <= ref1 ? i < ref1 : i > ref1; index = 0 <= ref1 ? ++i : --i) {
                Syntax.setValue(obj, -1 - index, 'comment punctuation');
            }
        } else {
            Syntax.cont(obj, 'comment');
        }
        return null;
    };


    /*
     0000000  000000000  00000000   000  000   000   0000000   
    000          000     000   000  000  0000  000  000        
    0000000      000     0000000    000  000 0 000  000  0000  
         000     000     000   000  000  000  0000  000   000  
    0000000      000     000   000  000  000   000   0000000
     */

    Syntax.startString = function(obj) {
        var stringType;
        Syntax.endWord(obj);
        stringType = (function() {
            switch (obj.char) {
                case "'":
                    return 'string single';
                case '"':
                    return 'string double';
                case '`':
                    return 'string backtick';
            }
        })();
        if (!stringType) {
            console.error("no string char '" + obj.char + "'");
            return;
        }
        obj.rgs.push({
            start: obj.index,
            match: obj.char,
            value: stringType + " punctuation"
        });
        obj.string = {
            value: stringType,
            start: obj.index + 1,
            match: ''
        };
        return null;
    };

    Syntax.doString = function(obj) {
        var stringType;
        if (obj.coffee) {
            if (obj.char === '{' && obj.string.value !== 'string single' && obj.string.match.endsWith("#")) {
                obj.interpolation = obj.string.value;
                obj.rgs.push(obj.string);
                obj.rgs.push({
                    start: obj.index,
                    match: obj.char,
                    value: obj.interpolation + " punctuation"
                });
                delete obj.string;
                return;
            }
        }
        stringType = (function() {
            switch (obj.char) {
                case "'":
                    return 'string single';
                case '"':
                    return 'string double';
                case '`':
                    return 'string backtick';
            }
        })();
        if (!obj.escp && obj.string.value === stringType) {
            if (valid(obj.string.match.trim())) {
                obj.rgs.push(obj.string);
            }
            delete obj.string;
            obj.rgs.push({
                start: obj.index,
                match: obj.char,
                value: stringType + " punctuation"
            });
        } else {
            Syntax.cont(obj, 'string');
        }
        return null;
    };

    Syntax.cont = function(obj, key) {
        var strOrCmt;
        strOrCmt = obj[key];
        switch (obj.char) {
            case ' ':
            case '\t':
                if (strOrCmt.match === '') {
                    strOrCmt.start += 1;
                } else {
                    if (valid(strOrCmt.match)) {
                        obj.rgs.push(strOrCmt);
                    }
                    obj[key] = {
                        start: obj.index + 1,
                        match: '',
                        value: strOrCmt.value
                    };
                }
                break;
            default:
                strOrCmt.match += obj.char;
        }
        return null;
    };

    Syntax.endLine = function(obj) {
        if (obj.string) {
            if (obj.jslang || obj.cpplang) {
                obj.rgs.push(obj.string);
            }
        } else if (obj.comment) {
            obj.rgs.push(obj.comment);
        }
        return null;
    };

    Syntax.getMatch = function(obj, back) {
        var ref1, ref2;
        if (back < 0) {
            return (ref1 = obj.rgs[obj.rgs.length + back]) != null ? ref1.match : void 0;
        } else {
            return (ref2 = obj.rgs[back]) != null ? ref2.match : void 0;
        }
    };

    Syntax.getValue = function(obj, back) {
        var ref1, ref2;
        if (back < 0) {
            return (ref1 = obj.rgs[obj.rgs.length + back]) != null ? ref1.value : void 0;
        } else {
            return (ref2 = obj.rgs[back]) != null ? ref2.value : void 0;
        }
    };

    Syntax.setValue = function(obj, back, value) {
        var ref1;
        if (back < 0) {
            back = obj.rgs.length + back;
        }
        if (back < obj.rgs.length && back >= 0) {
            obj.rgs[back].value = value;
            if (obj.coffee && (obj.rgs[back - 1] != null)) {
                if (((ref1 = obj.rgs[back - 1]) != null ? ref1.match : void 0) === '@') {
                    return obj.rgs[back - 1].value = value + ' punctuation';
                }
            }
        }
    };

    Syntax.addValue = function(obj, back, value) {
        var i, len, ref1, results, val;
        if (back < 0) {
            back = obj.rgs.length + back;
        }
        if (back < obj.rgs.length && back >= 0) {
            ref1 = value.split(/\s+/);
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
                val = ref1[i];
                if (indexOf.call(obj.rgs[back].value.split(/\s+/), val) < 0) {
                    results.push(obj.rgs[back].value = val + ' ' + obj.rgs[back].value);
                } else {
                    results.push(void 0);
                }
            }
            return results;
        }
    };

    Syntax.substitute = function(obj, back, oldVals, newVals) {
        var i, index, j, ref1, ref2, val;
        for (index = i = 0, ref1 = oldVals.length; 0 <= ref1 ? i < ref1 : i > ref1; index = 0 <= ref1 ? ++i : --i) {
            val = Syntax.getValue(obj, back + index);
            if (val !== oldVals[index]) {
                break;
            }
        }
        if (index === oldVals.length) {
            for (index = j = 0, ref2 = oldVals.length; 0 <= ref2 ? j < ref2 : j > ref2; index = 0 <= ref2 ? ++j : --j) {
                Syntax.setValue(obj, back + index, newVals[index]);
            }
            return;
        }
        if (obj.rgs.length + back - 1 >= 0) {
            return Syntax.substitute(obj, back - 1, oldVals, newVals);
        }
    };

    Syntax.replace = function(obj, back, oldObjs, newObjs) {
        var advance, backObj, i, index, j, k, key, len, ref1, ref2, ref3, ref4, ref5, results;
        if (obj.rgs.length + back < 0) {
            return;
        }
        advance = function() {
            if (obj.rgs.length + back - 1 >= 0) {
                return Syntax.replace(obj, back - 1, oldObjs, newObjs);
            }
        };
        for (index = i = 0, ref1 = oldObjs.length; 0 <= ref1 ? i < ref1 : i > ref1; index = 0 <= ref1 ? ++i : --i) {
            backObj = obj.rgs[obj.rgs.length + back + index];
            if (!backObj) {
                console.log('dafuk?', str(obj));
                console.log('dafuk?', obj.rgs.length + back + index, obj.rgs.length, back, index);
                return;
            }
            if (oldObjs[index].ignore) {
                if (((ref2 = backObj.value) != null ? typeof ref2.indexOf === "function" ? ref2.indexOf(oldObjs[index].ignore) : void 0 : void 0) >= 0) {
                    return advance();
                }
            }
            ref3 = Object.keys(oldObjs[index]);
            for (j = 0, len = ref3.length; j < len; j++) {
                key = ref3[j];
                switch (key) {
                    case 'word':
                        if (((ref4 = backObj.value) != null ? typeof ref4.indexOf === "function" ? ref4.indexOf('punctuation') : void 0 : void 0) >= 0) {
                            return advance();
                        }
                        break;
                    case 'ignore':
                        break;
                    default:
                        if (oldObjs[index][key] !== backObj[key]) {
                            return advance();
                        }
                }
            }
        }
        results = [];
        for (index = k = 0, ref5 = newObjs.length; 0 <= ref5 ? k < ref5 : k > ref5; index = 0 <= ref5 ? ++k : --k) {
            backObj = obj.rgs[obj.rgs.length + back + index];
            results.push((function() {
                var l, len1, ref6, results1;
                ref6 = Object.keys(newObjs[index]);
                results1 = [];
                for (l = 0, len1 = ref6.length; l < len1; l++) {
                    key = ref6[l];
                    results1.push(backObj[key] = newObjs[index][key]);
                }
                return results1;
            })());
        }
        return results;
    };

    Syntax.doMatch = function(obj, mtchs) {
        var endIndex, endMatches, i, index, j, k, l, len, m, mtch, n, o, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, startIndex, startLength, startMatches;
        for (i = 0, len = mtchs.length; i < len; i++) {
            mtch = mtchs[i];
            startLength = (ref1 = (ref2 = mtch.start) != null ? ref2.length : void 0) != null ? ref1 : 0;
            if (mtch.single) {
                if (obj.text[obj.index + 1] === mtch.end) {
                    continue;
                }
                if (((ref3 = last(obj.rgs)) != null ? ref3.match : void 0) === mtch.end) {
                    continue;
                }
            }
            if (obj.rgs.length - mtch.end.length - startLength < 0) {
                continue;
            }
            endMatches = true;
            for (endIndex = j = 1, ref4 = mtch.end.length; 1 <= ref4 ? j < ref4 : j > ref4; endIndex = 1 <= ref4 ? ++j : --j) {
                if (obj.rgs[obj.rgs.length - endIndex].match !== mtch.end[mtch.end.length - endIndex]) {
                    endMatches = false;
                    break;
                }
            }
            if (!endMatches) {
                continue;
            }
            if (mtch.spaced === false) {
                if (obj.turd.indexOf(' ') >= 0) {
                    continue;
                }
            }
            if (mtch.start) {
                for (startIndex = k = ref5 = obj.rgs.length - startLength - mtch.end.length; ref5 <= 0 ? k <= 0 : k >= 0; startIndex = ref5 <= 0 ? ++k : --k) {
                    startMatches = true;
                    for (index = l = 0, ref6 = startLength; 0 <= ref6 ? l < ref6 : l > ref6; index = 0 <= ref6 ? ++l : --l) {
                        if (Syntax.getMatch(obj, startIndex + index) !== mtch.start[index]) {
                            startMatches = false;
                            break;
                        }
                    }
                    if (startMatches) {
                        break;
                    }
                }
                if (startIndex >= 0) {
                    for (index = m = ref7 = startIndex, ref8 = startIndex + startLength; ref7 <= ref8 ? m < ref8 : m > ref8; index = ref7 <= ref8 ? ++m : --m) {
                        Syntax.addValue(obj, index, mtch.value + ' punctuation');
                    }
                    for (index = n = ref9 = startIndex + startLength, ref10 = obj.rgs.length - mtch.end.length + 1; ref9 <= ref10 ? n < ref10 : n > ref10; index = ref9 <= ref10 ? ++n : --n) {
                        Syntax.addValue(obj, index, mtch.value);
                    }
                    for (index = o = ref11 = obj.rgs.length - mtch.end.length + 1, ref12 = obj.rgs.length; ref11 <= ref12 ? o < ref12 : o > ref12; index = ref11 <= ref12 ? ++o : --o) {
                        Syntax.addValue(obj, index, mtch.value + ' punctuation');
                    }
                    return mtch.value + ' punctuation';
                }
            } else {
                Syntax.addValue(obj, -1, mtch.value);
                index = -2;
                while (Syntax.getMatch(obj, index) === '-') {
                    Syntax.setValue(obj, index, mtch.value + ' punctuation');
                    Syntax.addValue(obj, index - 1, mtch.value);
                    index -= 2;
                }
                return mtch.value + ' punctuation';
            }
        }
        return null;
    };

    Syntax.surround = function(obj, back, range) {
        var addIndex, endIndex, i, j, k, ref1, ref2, ref3, ref4, ref5, ref6, startIndex;
        if (obj.rgs.length - 1 + back <= 1) {
            return;
        }
        for (endIndex = i = ref1 = obj.rgs.length - 1 + back; ref1 <= 0 ? i <= 0 : i >= 0; endIndex = ref1 <= 0 ? ++i : --i) {
            if (endIndex >= obj.rgs.length || endIndex < 0) {
                console.log('dafuk?', endIndex, obj.rgs.length, back);
                return;
            }
            if (obj.rgs[endIndex] == null) {
                console.log('dafuk2?', endIndex, obj.rgs.length, back);
                return;
            }
            if (range.end === ((ref2 = obj.rgs[endIndex]) != null ? ref2.match : void 0)) {
                for (startIndex = j = ref3 = endIndex - 1; ref3 <= 0 ? j <= 0 : j >= 0; startIndex = ref3 <= 0 ? ++j : --j) {
                    if (range.start === ((ref4 = obj.rgs[startIndex]) != null ? ref4.match : void 0)) {
                        for (addIndex = k = ref5 = startIndex + 1, ref6 = endIndex; ref5 <= ref6 ? k < ref6 : k > ref6; addIndex = ref5 <= ref6 ? ++k : --k) {
                            obj.rgs[addIndex].value = range.add + ' ' + obj.rgs[addIndex].value;
                        }
                    }
                }
            }
        }
    };

    return Syntax;

})();

module.exports = Syntax;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxrRUFBQTtJQUFBOztBQVFBLE1BQXVELE9BQUEsQ0FBUSxXQUFSLENBQXZELEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxlQUFwQyxFQUEwQyxpQkFBMUMsRUFBaUQ7O0FBRWpELEdBQUEsR0FBTSxPQUFPLENBQUM7O0FBRVI7OztJQUVGLE1BQUMsQ0FBQSxJQUFELEdBQVE7O0lBQ1IsTUFBQyxDQUFBLElBQUQsR0FBUTs7SUFRUixNQUFDLENBQUEsSUFBRCxHQUFPLFNBQUE7QUFFSCxZQUFBO1FBQUEsSUFBVSxNQUFNLENBQUMsSUFBUCxLQUFlLElBQXpCO0FBQUEsbUJBQUE7O1FBRUEsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTRCLFFBQTVCLEVBQXNDLFdBQXRDLENBQVY7UUFFUCxNQUFNLENBQUMsSUFBUCxHQUFjO1FBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztRQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7UUFDZCxNQUFNLENBQUMsSUFBUCxHQUFjO1FBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztRQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7QUFFZDthQUFBLGdCQUFBOzs7O0FBQ0k7QUFBQTtxQkFBQSxzQ0FBQTs7b0JBRUksSUFBeUIsYUFBVyxNQUFNLENBQUMsSUFBbEIsRUFBQSxHQUFBLEtBQXpCO3dCQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBWixDQUFpQixHQUFqQixFQUFBOzs7NEJBRVksQ0FBQSxHQUFBOzs0QkFBQSxDQUFBLEdBQUEsSUFBUTs7OztBQUNwQjs2QkFBQSxtQkFBQTs7NEJBRUksSUFBRyxLQUFBLEtBQVMsU0FBWjs7eUNB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QUFBO1FBQUEsSUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQVIsR0FBZSxDQUFmLEdBQWlCLElBQWpCLElBQXlCLENBQW5DO0FBQUEsbUJBQUE7O0FBQ0EsYUFBZ0IsOEdBQWhCO1lBQ0ksSUFBRyxRQUFBLElBQVksR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFwQixJQUE4QixRQUFBLEdBQVcsQ0FBNUM7Z0JBQ0csT0FBQSxDQUFDLEdBQUQsQ0FBSyxRQUFMLEVBQWUsUUFBZixFQUF5QixHQUFHLENBQUMsR0FBRyxDQUFDLE1BQWpDLEVBQXlDLElBQXpDO0FBQ0MsdUJBRko7O1lBR0EsSUFBTyx5QkFBUDtnQkFDRyxPQUFBLENBQUMsR0FBRCxDQUFLLFNBQUwsRUFBZ0IsUUFBaEIsRUFBMEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFsQyxFQUEwQyxJQUExQztBQUNDLHVCQUZKOztZQUdBLElBQUcsS0FBSyxDQUFDLEdBQU4sK0NBQThCLENBQUUsZUFBbkM7QUFDSSxxQkFBa0IscUdBQWxCO29CQUNJLElBQUcsS0FBSyxDQUFDLEtBQU4saURBQWtDLENBQUUsZUFBdkM7QUFDSSw2QkFBZ0IsOEhBQWhCOzRCQUNJLEdBQUcsQ0FBQyxHQUFJLENBQUEsUUFBQSxDQUFTLENBQUMsS0FBbEIsR0FBMEIsS0FBSyxDQUFDLEdBQU4sR0FBWSxHQUFaLEdBQWtCLEdBQUcsQ0FBQyxHQUFJLENBQUEsUUFBQSxDQUFTLENBQUM7QUFEbEUseUJBREo7O0FBREosaUJBREo7O0FBUEo7SUFITzs7Ozs7O0FBZ0JmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwIFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgbm9vbiwgc2xhc2gsIGZpcnN0LCB2YWxpZCwgZW1wdHksIGxhc3QsIGVycm9yLCBfIH0gPSByZXF1aXJlICcuLi8uLi9reGsnXG5cbmxvZyA9IGNvbnNvbGUubG9nXG5cbmNsYXNzIFN5bnRheFxuXG4gICAgQGV4dHMgPSBbXSBcbiAgICBAbGFuZyA9IG51bGxcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBpbml0OiAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIFN5bnRheC5sYW5nICE9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGRhdGEgPSBub29uLmxvYWQgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicsICdjb2ZmZWUnLCAnbGFuZy5ub29uJ1xuICAgICAgICBcbiAgICAgICAgU3ludGF4LmxhbmcgPSB7fVxuICAgICAgICBTeW50YXguaW5mbyA9IHt9XG4gICAgICAgIFN5bnRheC5tdGNoID0ge31cbiAgICAgICAgU3ludGF4LmZpbGwgPSB7fVxuICAgICAgICBTeW50YXgud29yZCA9IHt9XG4gICAgICAgIFN5bnRheC50dXJkID0ge31cbiAgICAgICAgXG4gICAgICAgIGZvciBleHROYW1lcyx2YWx1ZVdvcmRzIG9mIGRhdGFcbiAgICAgICAgICAgIGZvciBleHQgaW4gZXh0TmFtZXMuc3BsaXQgL1xccy9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFN5bnRheC5leHRzLnB1c2goZXh0KSBpZiBleHQgbm90IGluIFN5bnRheC5leHRzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBTeW50YXgubGFuZ1tleHRdID89IHt9XG4gICAgICAgICAgICAgICAgZm9yIHZhbHVlLHdvcmRzIG9mIHZhbHVlV29yZHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbHVlID09ICdjb21tZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmluZm9bZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmluZm9bZXh0XVt2YWx1ZV0gPSB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIHZhbHVlID09ICdtYXRjaCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciB2YWx1ZSxtdGNoSW5mbyBvZiB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG10Y2hJbmZvLmZpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmZpbGxbZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGNoSW5mby52YWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5maWxsW2V4dF1bbXRjaEluZm8uZmlsbF0gPSBtdGNoSW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbXRjaEluZm8uZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5tdGNoW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4Lm10Y2hbZXh0XVtsYXN0IG10Y2hJbmZvLmVuZF0gPz0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRjaEluZm8udmFsdWUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubXRjaFtleHRdW2xhc3QgbXRjaEluZm8uZW5kXS5wdXNoIG10Y2hJbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBtdGNoSW5mby50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC50dXJkW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRjaEluZm8ubWF0Y2ggPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgudHVyZFtleHRdW3ZhbHVlXSA9IG10Y2hJbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgud29yZFtleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG10Y2hJbmZvLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LndvcmRbZXh0XVt2YWx1ZV0gPSBtdGNoSW5mb1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgXy5pc0FycmF5IHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHdvcmQsaW5mbyBvZiB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBpbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdW3ZhbHVlXSA/PSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmluZm9bZXh0XVt2YWx1ZV0ucHVzaCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiAgIGlmIHdvcmRbMF0gPT0gJ3QnIHRoZW4gJ3R1cmQnIGVsc2UgJ3dvcmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBwYXJzZUludCB3b3JkLnNsaWNlIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiAgIGluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmxhbmdbZXh0XVt3b3JkXSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Igd29yZCBpbiB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubGFuZ1tleHRdW3dvcmRdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICMgbG9nIHN0ciBTeW50YXgubXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBAcmFuZ2VzOiAodGV4dCwgZXh0KSAtPlxuICAgICAgICBcbiAgICAgICAgU3ludGF4LmluaXQoKVxuICAgICAgICBcbiAgICAgICAgb2JqID1cbiAgICAgICAgICAgIGV4dDogICAgZXh0ID8gJ3R4dCcgXG4gICAgICAgICAgICByZ3M6ICAgIFtdICAgIyBsaXN0IG9mIHJhbmdlcyAocmVzdWx0KVxuICAgICAgICAgICAgd29yZHM6ICBbXSAgICMgZW5jb3VudGVyZWQgd29yZHNcbiAgICAgICAgICAgIHdvcmQ6ICAgJycgICAjIGN1cnJlbnRseSBwYXJzZWQgd29yZFxuICAgICAgICAgICAgdHVyZDogICAnJyAgICMgY3VycmVudGx5IHBhcnNlZCBzdHVmZiBpbmJldHdlZW4gd29yZHMgXG4gICAgICAgICAgICBsYXN0OiAgICcnICAgIyB0aGUgdHVyZCBiZWZvcmUgdGhlIGN1cnJlbnQvbGFzdC1jb21wbGV0ZWQgd29yZFxuICAgICAgICAgICAgaW5kZXg6ICAwIFxuICAgICAgICAgICAgdGV4dDogICB0ZXh0XG4gICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIG9iai5leHRcbiAgICAgICAgICAgIHdoZW4gJ2NwcCcsICdocHAnLCAnYycsICdoJywgJ2NjJywgJ2N4eCcsICdjcydcbiAgICAgICAgICAgICAgICBvYmouY3BwbGFuZyAgPSB0cnVlXG4gICAgICAgICAgICAgICAgb2JqLmNwcCAgICAgID0gdHJ1ZVxuICAgICAgICAgICAgd2hlbiAnY29mZmVlJywgJ2tvZmZlZScsICdqcycsICd0cydcbiAgICAgICAgICAgICAgICBvYmouanNsYW5nICAgPSB0cnVlXG4gICAgICAgICAgICAgICAgb2JqW29iai5leHRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIG9iai5jb2ZmZWUgICA9IHRydWUgaWYgb2JqLmV4dCBpcyAna29mZmVlJ1xuICAgICAgICAgICAgd2hlbiAnaHRtbCcsICdodG0nXG4gICAgICAgICAgICAgICAgb2JqLmh0bWwgICAgID0gdHJ1ZVxuICAgICAgICAgICAgd2hlbiAneWFtbCcsICd5bWwnXG4gICAgICAgICAgICAgICAgb2JqLnlhbWwgICAgID0gdHJ1ZVxuICAgICAgICAgICAgd2hlbiAnY3NzJywgJ3N0eWwnLCAnc2NzcycsICdzYXNzJ1xuICAgICAgICAgICAgICAgIG9iai5jc3NsYW5nICA9IHRydWVcbiAgICAgICAgICAgICAgICBvYmpbb2JqLmV4dF0gPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb2JqW29iai5leHRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBvYmouZGljdGxhbmcgPSB0cnVlIGlmIG9iai5qc2xhbmcgb3Igb2JqLmlzcyBvciBvYmoubG9nIG9yIG9iai5qc29uIG9yIG9iai55YW1sXG4gICAgICAgIG9iai5kYXNobGFuZyA9IHRydWUgaWYgb2JqLmNzc2xhbmcgb3Igb2JqLmlzcyBvciBvYmoucHVnICMgb2JqLm5vb24gb3IgXG4gICAgICAgIG9iai5kb3RsYW5nICA9IHRydWUgaWYgb2JqLmNwcGxhbmcgb3Igb2JqLmpzbGFuZyBvciBvYmoubG9nXG4gICAgICAgIG9iai54bWxsYW5nICA9IHRydWUgaWYgb2JqLnhtbCBvciBvYmouaHRtbCBvciBvYmoucGxpc3RcbiAgICAgICAgXG4gICAgICAgIGZvciBjaGFyIGluIHRleHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNoYXIgPT0gJ1xcXFwnXG4gICAgICAgICAgICAgICAgaWYgb2JqLmVzY3AgXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmouZXNjcFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb2JqLmVzY3AgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai5lc2NwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmouY2hhciA9IGNoYXJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmludGVycG9sYXRpb24gYW5kIG9iai5jaGFyID09ICd9J1xuICAgICAgICAgICAgICAgIFN5bnRheC5lbmRXb3JkIG9ialxuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogb2JqLmluZGV4XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiBvYmouY2hhclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCIje29iai5pbnRlcnBvbGF0aW9ufSBwdW5jdHVhdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9iai5zdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICBzdGFydDogIG9iai5pbmRleCsxXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAgb2JqLmludGVycG9sYXRpb25cbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6ICAnJ1xuICAgICAgICAgICAgICAgIG9iai5pbmRleCsrXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmRvU3RyaW5nIG9ialxuXG4gICAgICAgICAgICBlbHNlIGlmIG9iai5jb21tZW50XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmRvQ29tbWVudCBvYmpcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIGNoYXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCInXCIsICdcIicsICdgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3Qgb2JqLmVzY3AgYW5kIChjaGFyICE9IFwiJ1wiIG9yIG9iai5qc2xhbmcgb3Igb2JqLnB1ZylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc3RhcnRTdHJpbmcgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvUHVuY3Qgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnKycsICcqJywgJzwnLCAnPicsICc9JywgJ14nLCAnficsICdAJywgJyQnLCAnJicsICclJywgJyMnLCAnLycsICdcXFxcJywgJzonLCAnLicsICc7JywgJywnLCAnIScsICc/JywgJ3wnLCAneycsICd9JywgJygnLCAnKScsICdbJywgJ10nXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5kb1B1bmN0IG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0nXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5kYXNobGFuZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5kb1dvcmQgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvUHVuY3Qgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB3aGVuICcgJywgJ1xcdCcgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5lbmRXb3JkIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgIyBzdGFydCBhIG5ldyB3b3JkIC8gY29udGludWUgdGhlIGN1cnJlbnQgd29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZG9Xb3JkIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgY2hhciBub3QgaW4gWycgJywgJ1xcdCddXG4gICAgICAgICAgICAgICAgICAgIFN5bnRheC5jb2ZmZWVDYWxsIG9ialxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5pbmRleCsrXG4gICAgICAgICAgXG4gICAgICAgIG9iai5jaGFyID0gbnVsbFxuICAgICAgICBTeW50YXguZW5kV29yZCBvYmpcbiAgICAgICAgU3ludGF4LmVuZExpbmUgb2JqXG4gICAgICAgICAgICBcbiAgICAgICAgb2JqLnJnc1xuICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBlbmRXb3JkOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgY2hhciA9IG9iai5jaGFyID8gJydcbiAgICAgICAgXG4gICAgICAgIG9iai50dXJkICs9IGNoYXIgIyBkb24ndCB1c2UgPSBoZXJlIVxuXG4gICAgICAgIHN3aXRjaCBjaGFyXG4gICAgICAgICAgICB3aGVuICcgJywgJ1xcdCdcbiAgICAgICAgICAgICAgICBTeW50YXguZG9UdXJkIG9ialxuICAgICAgICAgICAgICAgIGlmIG9iai5yZWdleHA/IGFuZCBub3Qgb2JqLmVzY3BcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG9iai5yZWdleHAgIyBhYm9ydCByZWdleHAgb24gZmlyc3QgdW5lc2NhcGVkIHNwYWNlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5ub29uXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai50dXJkLmVuZHNXaXRoICcgICdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0KG9iai5yZ3MpPy5zdGFydCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5vYmoucmdzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnN1YnN0aXR1dGUgb2JqLCAtaW5kZXgtMSwgWyd0ZXh0J10sIFsncHJvcGVydHknXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc3Vic3RpdHV0ZSBvYmosIC1pbmRleC0xLCBbJ3B1bmN0dWF0aW9uJ10sIFsncHJvcGVydHkgcHVuY3R1YXRpb24nXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHZhbGlkIG9iai53b3JkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdvcmQgPSBvYmoud29yZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmoud29yZHMucHVzaCB3b3JkXG4gICAgICAgICAgICBvYmoud29yZCA9ICcnXG5cbiAgICAgICAgICAgIGdldFZhbHVlID0gKGJhY2s9LTEpICAgICAtPiBTeW50YXguZ2V0VmFsdWUgb2JqLCBiYWNrIFxuICAgICAgICAgICAgZ2V0TWF0Y2ggPSAoYmFjaz0tMSkgICAgIC0+IFN5bnRheC5nZXRNYXRjaCBvYmosIGJhY2tcbiAgICAgICAgICAgIHNldFZhbHVlID0gKGJhY2ssIHZhbHVlKSAtPiBTeW50YXguc2V0VmFsdWUgb2JqLCBiYWNrLCB2YWx1ZSAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNldENsYXNzID0gKGNsc3MpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmNvZmZlZSBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnJncyk/Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2xzcyA9PSAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHNzID0gJ21lbWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Qob2JqLnJncykudmFsdWUgPSBjbHNzICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgb2JqLmpzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBjbHNzID09ICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnJlcGxhY2Ugb2JqLCAtMiwgW3t3b3JkOnRydWV9LCB7bWF0Y2g6Jz0nfV0sIFt7dmFsdWU6J2Z1bmN0aW9uJ31dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXggLSB3b3JkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBtYXRjaDogd29yZFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY2xzc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB2YWxpZCBvYmouZmlsbFxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyBvYmouZmlsbC52YWx1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc3dpdGNoIGNoYXJcbiAgICAgICAgICAgICAgICB3aGVuICc6J1xuICAgICAgICAgICAgICAgICAgICBpZiBvYmouZGljdGxhbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgd2hlbiAnPSdcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmluaVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgU3ludGF4LnR1cmRbb2JqLmV4dF1cbiAgICAgICAgICAgICAgICBsYXN0VHVyZCA9IGxhc3Qgb2JqLmxhc3Quc3BsaXQgL1xccysvXG4gICAgICAgICAgICAgICAgaWYgdHVyZEluZm8gPSBTeW50YXgudHVyZFtvYmouZXh0XVtsYXN0VHVyZF1cbiAgICAgICAgICAgICAgICAgICAgaWYgdHVyZEluZm8uc3BhY2VkICE9IHRydWUgb3Igb2JqLmxhc3Rbb2JqLmxhc3QubGVuZ3RoLWxhc3RUdXJkLmxlbmd0aC0xXSA9PSAnICdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR1cmRJbmZvWyd3LTEnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC10dXJkSW5mby5tYXRjaC5sZW5ndGgtMSwgdHVyZEluZm9bJ3ctMSddXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi50dXJkSW5mby5tYXRjaC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLWluZGV4LTEsIHR1cmRJbmZvLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR1cmRJbmZvWyd3LTAnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyB0dXJkSW5mb1sndy0wJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGN3b3JkID0gd29yZC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHdvcmRJbmZvID0gU3ludGF4LndvcmRbb2JqLmV4dF0/W2xjd29yZF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB3b3JkSW5mb1sndC0xJ10/IGFuZCBvYmoubGFzdCBpbiBPYmplY3Qua2V5cyB3b3JkSW5mb1sndC0xJ11cbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsIHdvcmRJbmZvLnZhbHVlICsgJyAnICsgd29yZEluZm9bJ3ctMSddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCB3b3JkSW5mby52YWx1ZSArICcgJyArIHdvcmRJbmZvWyd0LTEnXVtvYmoubGFzdF1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIHdvcmRJbmZvLnZhbHVlICsgJyAnICsgd29yZEluZm8ud29yZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB3b3JkVmFsdWUgPSBTeW50YXgubGFuZ1tvYmouZXh0XT9bbGN3b3JkXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFN5bnRheC5pbmZvW29iai5leHRdP1t3b3JkVmFsdWVdP1xuICAgICAgICAgICAgICAgICAgICBmb3IgdmFsdWVJbmZvIGluIFN5bnRheC5pbmZvW29iai5leHRdW3dvcmRWYWx1ZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBtYXRjaCxtYXRjaFZhbHVlIG9mIHZhbHVlSW5mby5pbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QudHJpbSgpLmVuZHNXaXRoIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm1hdGNoLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLWluZGV4LCBtYXRjaFZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIG1hdGNoVmFsdWVcbiAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3Mgd29yZFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgICAgICAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNvZmZlZVxuICAgICAgICAgICAgICAgIGlmIGdldE1hdGNoKC0xKSBpbiBbJ2NsYXNzJywgJ2V4dGVuZHMnXVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0xKT8uaW5kZXhPZj8oJ3B1bmN0dWF0aW9uJykgPCAwXG4gICAgICAgICAgICAgICAgICAgIGlmIHdvcmQgbm90IGluIFsnZWxzZScsICd0aGVuJywgJ2FuZCcsICdvcicsICdpbiddXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai5yZ3MpLnZhbHVlIG5vdCBpbiBbJ2tleXdvcmQnLCAnZnVuY3Rpb24gaGVhZCcsICdyZXF1aXJlJywgJ251bWJlciddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdmdW5jdGlvbiBjYWxsJyAjIGNvZmZlZSBlbmRXb3JkIC0xIG5vIHB1bmN0dWF0aW9uIGFuZCB3b3JkICE9ICdlbHNlIC4uLidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgICAgICAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgICAgICAgICBpZiAvXjB4W2EtZkEtRlxcZF1bYS1mQS1GXFxkXVthLWZBLUZcXGRdKyQvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnbnVtYmVyIGhleCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ251bWJlciBoZXggcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZ2V0TWF0Y2goLTEpID09IFwiI1wiXG4gICAgICAgICAgICAgICAgaWYgL15bYS1mQS1GXFxkXSskLy50ZXN0IHdvcmRcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdudW1iZXIgaGV4IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmoubm9vblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai53b3Jkcy5sZW5ndGggPT0gMSBcbiAgICAgICAgICAgICAgICAgICAgaWYgZW1wdHkgb2JqLmxhc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBvYmouc2hcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoud29yZHMubGVuZ3RoID4gMSBhbmQgZ2V0TWF0Y2goLTEpID09ICctJyBhbmQgZ2V0VmFsdWUoLTIpID09ICdhcmd1bWVudCdcbiAgICAgICAgICAgICAgICAgICAgc2V0Q2xhc3MgLTEsICdhcmd1bWVudCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdhcmd1bWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuXG4gICAgICAgICAgICBpZiBvYmouY3BwbGFuZ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0ID09ICc6OidcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnJncy5sZW5ndGggPj0gM1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICduYW1lc3BhY2UnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3B1bmN0dWF0aW9uIG5hbWVzcGFjZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHVuY3R1YXRpb24gbmFtZXNwYWNlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2hhciA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Z1bmN0aW9uIGNhbGwnICMgY3BwIDo6d29yZCAoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIC9eW1xcXFxfQS1aXVtcXFxcX0EtWjAtOV0rJC8udGVzdCB3b3JkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbWFjcm8nXG5cbiAgICAgICAgICAgICAgICBpZiAgICAgIC9eW1VBXVtBLVpdXFx3KyQvLnRlc3Qod29yZCkgdGhlbiByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgY2xhc3MnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAvXltTRl1bQS1aXVxcdyskLy50ZXN0KHdvcmQpIHRoZW4gcmV0dXJuIHNldENsYXNzICd0eXBlIHN0cnVjdCdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIC9eW0VdW0EtWl1cXHcrJC8udGVzdCh3b3JkKSAgdGhlbiByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgZW51bSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICdjbGFzcycgaW4gb2JqLndvcmRzIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjaGFyID09ICc8J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgdGVtcGxhdGUnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0ID09ICc6OidcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTMpIGluIFsnZW51bScsICdjbGFzcycsICdzdHJ1Y3QnXVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nICdyZWFsbHk/J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xzcyA9IGdldFZhbHVlKC0zKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsIGdldFZhbHVlKC0zKSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgZ2V0VmFsdWUoLTMpICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCBnZXRWYWx1ZSgtMykgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgPT0gJy4nIGFuZCAvXlxcZCtmJC8udGVzdCh3b3JkKVxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdudW1iZXIgZmxvYXQgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoIFwiIyNcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdwdW5jdHVhdGlvbiBvcGVyYXRvcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwdW5jdHVhdGlvbiBvcGVyYXRvcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBvYmoubGFzdC5lbmRzV2l0aCAnLT4nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zLCAnb2JqJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGZpcnN0KG9iai53b3Jkcykuc3RhcnRzV2l0aCgnVScpIGFuZCBmaXJzdChvYmoucmdzKT8udmFsdWUgPT0gJ21hY3JvJ1xuICAgICAgICAgICAgICAgICAgICBpZiB3b3JkLnN0YXJ0c1dpdGggJ0JsdWVwcmludCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbWFjcm8gcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIGlmIHdvcmQudG9Mb3dlckNhc2UoKSBpbiBbJ21ldGEnLCAnZGlzcGxheW5hbWUnLCAnY2F0ZWdvcnknLCAnd29ybGRjb250ZXh0JywgJ2VkaXRhbnl3aGVyZSddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ21hY3JvIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBpZiB3b3JkLnRvTG93ZXJDYXNlKCkgaW4gWydjb25maWcnLCAndHJhbnNpZW50JywgJ2VkaXRkZWZhdWx0c29ubHknLCAndmlzaWJsZWFueXdoZXJlJywgJ25vbnRyYW5zYWN0aW9uYWwnLCAnaW50ZXJwJywgJ2dsb2JhbGNvbmZpZyddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ21hY3JvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgICAgICAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIC9eXFxkKyQvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0ID09ICcuJyAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTQpID09ICdudW1iZXIgZmxvYXQnIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC00LCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICdzZW12ZXIgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnc2VtdmVyIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ251bWJlciBmbG9hdCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwIDAwMCAgXG4gICAgICAgICAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5kb3RsYW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgaW4gWycuJywgJzonXVxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgaW4gWyd0ZXh0JywgJ21vZHVsZScsICdjbGFzcycsICdtZW1iZXInLCAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ29iaicgaWYgZ2V0VmFsdWUoLTIpID09ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJygnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZnVuY3Rpb24gY2FsbCcgIyBkb3RsYW5nIC53b3JkIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoICcuJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJygnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZnVuY3Rpb24gY2FsbCcgIyBkb3RsYW5nIC5wcm9wZXJ0eSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcblxuICAgICAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC5sZW5ndGggPiAxIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoubGFzdFtvYmoubGFzdC5sZW5ndGgtMl0gaW4gWycpJywgJ10nXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHJvcGVydHkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmNvZmZlZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0W29iai5sYXN0Lmxlbmd0aC0yXSA9PSAnPydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICdvYmonIGlmIGdldFZhbHVlKC0zKSA9PSAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdvcGVyYXRvciBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcblxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgICAgMDAwICAgICAgMDAwIDAwMCAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouY3NzbGFuZ1xuXG4gICAgICAgICAgICAgICAgaWYgd29yZC5lbmRzV2l0aCAncydcbiAgICAgICAgICAgICAgICAgICAgaWYgL1xcZCtzLy50ZXN0IHdvcmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgd29yZC5zbGljZSh3b3JkLmxlbmd0aC0yKSBpbiBbJ3B4JywgJ2VtJywgJ2V4JywgJ2NoJ11cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNzc2xhbmcgb3Igb2JqLnB1Z1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoICcuJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2NsYXNzIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC5lbmRzV2l0aCBcIiNcIlxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2Nzc2lkIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Nzc2lkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5jcHBsYW5nIG9yIG9iai5qc1xuICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJygnIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Z1bmN0aW9uIGNhbGwnICMgY3BwICYganMgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICd0ZXh0J1xuICAgICAgICBudWxsXG4gICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgQGNvZmZlZUNhbGw6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvYmouY29mZmVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai50dXJkID09ICcoJ1xuICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0yLCAnZnVuY3Rpb24gY2FsbCcgIyBjb2ZmZWUgY2FsbCAoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG9iai50dXJkLmxlbmd0aCA+IDEgYW5kIG9iai50dXJkW29iai50dXJkLmxlbmd0aC0yXSA9PSAnICdcbiAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai50dXJkKSBpbiAnQCstXFwnXCIoW3snXG4gICAgICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnR1cmQpIGluICcrLSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai50ZXh0W29iai5pbmRleCsxXSA9PSAnICdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIyBiYWlsIG91dCBpZiBuZXh0IGNoYXJhY3RlciBpcyBhIHNwYWNlIChjaGVhdGVyISlcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gU3ludGF4LmdldFZhbHVlIG9iaiwgLTJcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsaWQodmFsKSBhbmQgdmFsIG5vdCBpbiBbJ2tleXdvcmQnLCAnZnVuY3Rpb24gaGVhZCcsICdyZXF1aXJlJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC5pbmRleE9mKCdwdW5jdHVhdGlvbicpIDwgMCBhbmQgb2JqLnJnc1stMl0udmFsdWUgbm90IGluIFsnbnVtYmVyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCAtMiwgXCJmdW5jdGlvbiBjYWxsXCIgIyBjb2ZmZWUgY2FsbCBAKy1cXCdcIihbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAZG9Xb3JkOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdmFsaWQgb2JqLnR1cmRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3ludGF4LmRvVHVyZCBvYmpcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLmxhc3QgPSBvYmoudHVyZFxuICAgICAgICAgICAgb2JqLnR1cmQgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgb2JqLndvcmQgKz0gb2JqLmNoYXJcbiAgICAgICAgXG4gICAgICAgIG51bGxcblxuICAgIEBkb1R1cmQ6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eShvYmouZmlsbCkgYW5kIGVtcHR5KG9iai53b3JkcykgYW5kIFN5bnRheC5maWxsW29iai5leHRdP1tvYmoudHVyZF0/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5maWxsID0gU3ludGF4LmZpbGxbb2JqLmV4dF0/W29iai50dXJkXVxuICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4ub2JqLnR1cmQubGVuZ3RoXVxuICAgICAgICAgICAgICAgIGlmIG9iai5maWxsLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTEtaW5kZXgsIG9iai5maWxsLnR1cmRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0xLWluZGV4LCBvYmouZmlsbC52YWx1ZSArICcgJyArICdwdW5jdHVhdGlvbidcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBkb1B1bmN0OiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgIFxuICAgICAgICBnZXRWYWx1ZSA9IChiYWNrPS0xKSAgICAgLT4gU3ludGF4LmdldFZhbHVlIG9iaiwgYmFjayBcbiAgICAgICAgc2V0VmFsdWUgPSAoYmFjaywgdmFsdWUpIC0+IFN5bnRheC5zZXRWYWx1ZSBvYmosIGJhY2ssIHZhbHVlICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdmFsdWUgPSAncHVuY3R1YXRpb24nXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggb2JqLmNoYXJcbiAgICAgICAgICAgIHdoZW4gJzonXG4gICAgICAgICAgICAgICAgaWYgb2JqLmRpY3RsYW5nIGFuZCBvYmoudHVyZC5sZW5ndGggPT0gMVxuICAgICAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai5yZ3MpPy52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdkaWN0aW9uYXJ5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmNvZmZlZSAjIGtvZmZlZSBjb25zdHJ1Y3RvciBzaG9ydGN1dFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdtZXRob2QnXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdtZXRob2QgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICB3aGVuICc+J1xuICAgICAgICAgICAgICAgIGlmIG9iai5qc2xhbmdcbiAgICAgICAgICAgICAgICAgICAgZm9yIFt0dXJkLCB2YWxdIGluIFtbJy0+JywgJyddLCBbJz0+JywgJyBib3VuZCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnR1cmQuZW5kc1dpdGggdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdWJzdGl0dXRlIG9iaiwgLTMsIFsnZGljdGlvbmFyeSBrZXknLCAnZGljdGlvbmFyeSBwdW5jdHVhdGlvbiddLCBbJ21ldGhvZCcsICdtZXRob2QgcHVuY3R1YXRpb24nXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdXJyb3VuZCAgIG9iaiwgLTEsIHN0YXJ0OicoJywgYWRkOidhcmd1bWVudCcsIGVuZDonKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgucmVwbGFjZSAgICBvYmosIC0zLCBbe3dvcmQ6dHJ1ZSwgaWdub3JlOidhcmd1bWVudCd9LCB7bWF0Y2g6Jz0nfV0sIFt7dmFsdWU6J2Z1bmN0aW9uJ31dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdmdW5jdGlvbiB0YWlsJyArIHZhbCArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAnZnVuY3Rpb24gaGVhZCcgKyB2YWwgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgb2JqLnhtbGxhbmcgb3Igb2JqLm1kXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai50dXJkLmVuZHNXaXRoICcvPidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAna2V5d29yZCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAna2V5d29yZCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIHdoZW4gJy8nXG4gICAgICAgICAgICAgICAgaWYgb2JqLmpzbGFuZ1xuICAgICAgICAgICAgICAgICAgICBpZiBub3Qgb2JqLmVzY3BcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5yZWdleHA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFtvYmoucmdzLmxlbmd0aC0xLi4wXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoucmdzW2luZGV4XS5zdGFydCA8IG9iai5yZWdleHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5yZ3NbaW5kZXhdLnZhbHVlID0gJ3JlZ2V4cCAnICsgb2JqLnJnc1tpbmRleF0udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdyZWdleHAgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnJlZ2V4cCA9IG9iai5pbmRleCAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIG10Y2ggPSBTeW50YXgubXRjaFtvYmouZXh0XT9bb2JqLmNoYXJdXG4gICAgICAgICAgICBpZiBtYXRjaFZhbHVlID0gU3ludGF4LmRvTWF0Y2ggb2JqLCBtdGNoXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBtYXRjaFZhbHVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG9iai5maWxsIHRoZW4gdmFsdWUgPSBvYmouZmlsbC52YWx1ZSArICcgJyArIHZhbHVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcblxuICAgICAgICBTeW50YXguY2hlY2tDb21tZW50IG9ialxuICAgICAgICBcbiAgICAjIyNcbiAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIyNcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAY2hlY2tDb21tZW50OiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IFN5bnRheC5pbmZvW29iai5leHRdPy5jb21tZW50XG4gICAgICAgIHJldHVybiBpZiBvYmoucmVnZXhwP1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNvbW1lbnQgPSBTeW50YXguaW5mb1tvYmouZXh0XS5jb21tZW50XG4gICAgICAgIFxuICAgICAgICBpZiBjb21tZW50LmxpbmUgYW5kIG9iai50dXJkLmVuZHNXaXRoKGNvbW1lbnQubGluZSkgYW5kIG5vdCBvYmoudHVyZC5lbmRzV2l0aCgnXFxcXCcrY29tbWVudC5saW5lKSBhbmQgZW1wdHkob2JqLndvcmRzKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTeW50YXguc3RhcnRDb21tZW50IG9iaiwgY29tbWVudC5saW5lXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY29tbWVudC50YWlsIGFuZCBvYmoudHVyZC5lbmRzV2l0aChjb21tZW50LnRhaWwpIGFuZCBub3Qgb2JqLnR1cmQuZW5kc1dpdGgoJ1xcXFwnK2NvbW1lbnQudGFpbClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3ludGF4LnN0YXJ0Q29tbWVudCBvYmosIGNvbW1lbnQudGFpbFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgY29tbWVudC5zdGFydCBhbmQgb2JqLnR1cmQuZW5kc1dpdGgoY29tbWVudC5zdGFydCkgYW5kIG5vdCBvYmoudHVyZC5lbmRzV2l0aCgnXFxcXCcrY29tbWVudC5zdGFydClcblxuICAgICAgICAgICAgU3ludGF4LnN0YXJ0Q29tbWVudCBvYmosIGNvbW1lbnQuc3RhcnRcbiAgICAgICAgICAgIFxuICAgICAgICBudWxsXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHN0YXJ0Q29tbWVudDogKG9iaiwgc3RhcnQpIC0+XG4gICAgICAgIFxuICAgICAgICBvYmouY29tbWVudCA9XG4gICAgICAgICAgICBzdGFydDogb2JqLmluZGV4KzFcbiAgICAgICAgICAgIG1hdGNoOiAnJ1xuICAgICAgICAgICAgdmFsdWU6ICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLnN0YXJ0Lmxlbmd0aF1cbiAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0xLWluZGV4LCAnY29tbWVudCBwdW5jdHVhdGlvbidcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCBcbiAgICBcbiAgICBAZG9Db21tZW50OiAob2JqKSAtPlxuXG4gICAgICAgIGNvbW1lbnQgPSBTeW50YXguaW5mb1tvYmouZXh0XS5jb21tZW50XG4gICAgICAgIFxuICAgICAgICBpZiBjb21tZW50LmVuZCBhbmQgb2JqLnR1cmQuZW5kc1dpdGgoY29tbWVudC5lbmQpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouY29tbWVudFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBkZWxldGUgb2JqLmNvbW1lbnRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4uY29tbWVudC5lbmQubGVuZ3RoXVxuICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0xLWluZGV4LCAnY29tbWVudCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG5cbiAgICAgICAgICAgIFN5bnRheC5jb250IG9iaiwgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICMjI1xuICAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIyNcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHN0YXJ0U3RyaW5nOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgIFxuICAgICAgICBzdHJpbmdUeXBlID0gc3dpdGNoIG9iai5jaGFyXG4gICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgIHdoZW4gJ2AnIHRoZW4gJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBub3Qgc3RyaW5nVHlwZVxuICAgICAgICAgICAgZXJyb3IgXCJubyBzdHJpbmcgY2hhciAnI3tvYmouY2hhcn0nXCJcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICB2YWx1ZTogXCIje3N0cmluZ1R5cGV9IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBvYmouc3RyaW5nID1cbiAgICAgICAgICAgIHZhbHVlOiAgc3RyaW5nVHlwZVxuICAgICAgICAgICAgc3RhcnQ6ICBvYmouaW5kZXgrMVxuICAgICAgICAgICAgbWF0Y2g6ICAnJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBudWxsXG5cbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwIFxuICAgIFxuICAgIEBkb1N0cmluZzogKG9iaikgLT5cblxuICAgICAgICBpZiBvYmouY29mZmVlIFxuICAgICAgICAgICAgaWYgb2JqLmNoYXIgPT0gJ3snIGFuZCBvYmouc3RyaW5nLnZhbHVlICE9ICdzdHJpbmcgc2luZ2xlJyBhbmQgb2JqLnN0cmluZy5tYXRjaC5lbmRzV2l0aCBcIiNcIlxuICAgICAgICAgICAgICAgIG9iai5pbnRlcnBvbGF0aW9uID0gb2JqLnN0cmluZy52YWx1ZVxuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIiN7b2JqLmludGVycG9sYXRpb259IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWxldGUgb2JqLnN0cmluZ1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgc3RyaW5nVHlwZSA9IHN3aXRjaCBvYmouY2hhclxuICAgICAgICAgICAgd2hlbiBcIidcIiB0aGVuICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnXG4gICAgICAgICAgICB3aGVuICdgJyB0aGVuICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgb2JqLmVzY3AgYW5kIG9iai5zdHJpbmcudmFsdWUgPT0gc3RyaW5nVHlwZVxuXG4gICAgICAgICAgICBpZiB2YWxpZCBvYmouc3RyaW5nLm1hdGNoLnRyaW0oKVxuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBkZWxldGUgb2JqLnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXhcbiAgICAgICAgICAgICAgICBtYXRjaDogb2JqLmNoYXJcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCIje3N0cmluZ1R5cGV9IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTeW50YXguY29udCBvYmosICdzdHJpbmcnXG4gICAgICAgICAgICBcbiAgICAgICAgbnVsbFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQGNvbnQ6IChvYmosIGtleSkgLT5cbiAgICAgICAgXG4gICAgICAgIHN0ck9yQ210ID0gb2JqW2tleV1cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBvYmouY2hhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnICcsICdcXHQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RyT3JDbXQubWF0Y2ggPT0gJydcbiAgICAgICAgICAgICAgICAgICAgc3RyT3JDbXQuc3RhcnQgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoIHN0ck9yQ210IGlmIHZhbGlkIHN0ck9yQ210Lm1hdGNoXG4gICAgICAgICAgICAgICAgICAgIG9ialtrZXldID0gXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogb2JqLmluZGV4KzFcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHN0ck9yQ210LnZhbHVlXG4gICAgICAgICAgICBlbHNlIFxuXG4gICAgICAgICAgICAgICAgc3RyT3JDbXQubWF0Y2ggKz0gb2JqLmNoYXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQGVuZExpbmU6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvYmouc3RyaW5nXG4gICAgICAgICAgICBpZiBvYmouanNsYW5nIG9yIG9iai5jcHBsYW5nXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5zdHJpbmdcbiAgICAgICAgZWxzZSBpZiBvYmouY29tbWVudFxuICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5jb21tZW50XG4gICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQGdldE1hdGNoOiAob2JqLCBiYWNrKSAgICAgICAgLT4gaWYgYmFjayA8IDAgdGhlbiBvYmoucmdzW29iai5yZ3MubGVuZ3RoK2JhY2tdPy5tYXRjaCBlbHNlIG9iai5yZ3NbYmFja10/Lm1hdGNoXG4gICAgQGdldFZhbHVlOiAob2JqLCBiYWNrKSAgICAgICAgLT4gaWYgYmFjayA8IDAgdGhlbiBvYmoucmdzW29iai5yZ3MubGVuZ3RoK2JhY2tdPy52YWx1ZSBlbHNlIG9iai5yZ3NbYmFja10/LnZhbHVlICAgICBcbiAgICBAc2V0VmFsdWU6IChvYmosIGJhY2ssIHZhbHVlKSAtPiBcbiAgICAgICAgaWYgYmFjayA8IDBcbiAgICAgICAgICAgIGJhY2sgPSBvYmoucmdzLmxlbmd0aCtiYWNrXG4gICAgICAgIGlmIGJhY2sgPCBvYmoucmdzLmxlbmd0aCBhbmQgYmFjayA+PSAwXG4gICAgICAgICAgICBvYmoucmdzW2JhY2tdLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgIGlmIG9iai5jb2ZmZWUgYW5kIG9iai5yZ3NbYmFjay0xXT9cbiAgICAgICAgICAgICAgICBpZiBvYmoucmdzW2JhY2stMV0/Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgICAgICAgICBvYmoucmdzW2JhY2stMV0udmFsdWUgPSB2YWx1ZSArICcgcHVuY3R1YXRpb24nXG5cbiAgICBAYWRkVmFsdWU6IChvYmosIGJhY2ssIHZhbHVlKSAtPiBcbiAgICAgICAgaWYgYmFjayA8IDBcbiAgICAgICAgICAgIGJhY2sgPSBvYmoucmdzLmxlbmd0aCtiYWNrXG4gICAgICAgIGlmIGJhY2sgPCBvYmoucmdzLmxlbmd0aCBhbmQgYmFjayA+PSAwXG4gICAgICAgICAgICBmb3IgdmFsIGluIHZhbHVlLnNwbGl0IC9cXHMrL1xuICAgICAgICAgICAgICAgIGlmIHZhbCBub3QgaW4gb2JqLnJnc1tiYWNrXS52YWx1ZS5zcGxpdCAvXFxzKy9cbiAgICAgICAgICAgICAgICAgICAgb2JqLnJnc1tiYWNrXS52YWx1ZSA9IHZhbCArICcgJyArIG9iai5yZ3NbYmFja10udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAc3Vic3RpdHV0ZTogKG9iaiwgYmFjaywgb2xkVmFscywgbmV3VmFscykgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9sZFZhbHMubGVuZ3RoXVxuICAgICAgICAgICAgdmFsID0gU3ludGF4LmdldFZhbHVlIG9iaiwgYmFjaytpbmRleFxuICAgICAgICAgICAgaWYgdmFsICE9IG9sZFZhbHNbaW5kZXhdXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgaW5kZXggPT0gb2xkVmFscy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9sZFZhbHMubGVuZ3RoXVxuICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIGJhY2sraW5kZXgsIG5ld1ZhbHNbaW5kZXhdXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvYmoucmdzLmxlbmd0aCArIGJhY2stMSA+PSAwXG4gICAgICAgICAgICBTeW50YXguc3Vic3RpdHV0ZSBvYmosIGJhY2stMSwgb2xkVmFscywgbmV3VmFsc1xuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEByZXBsYWNlOiAob2JqLCBiYWNrLCBvbGRPYmpzLCBuZXdPYmpzKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG9iai5yZ3MubGVuZ3RoK2JhY2sgPCAwXG4gICAgICAgIFxuICAgICAgICBhZHZhbmNlID0gLT5cbiAgICAgICAgICAgIGlmIG9iai5yZ3MubGVuZ3RoICsgYmFjay0xID49IDBcbiAgICAgICAgICAgICAgICBTeW50YXgucmVwbGFjZSBvYmosIGJhY2stMSwgb2xkT2JqcywgbmV3T2Jqc1xuXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9sZE9ianMubGVuZ3RoXVxuICAgICAgICAgICAgYmFja09iaiA9IG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgrYmFjaytpbmRleF1cbiAgICAgICAgICAgIGlmIG5vdCBiYWNrT2JqXG4gICAgICAgICAgICAgICAgbG9nICdkYWZ1az8nLCBzdHIgb2JqXG4gICAgICAgICAgICAgICAgbG9nICdkYWZ1az8nLCBvYmoucmdzLmxlbmd0aCtiYWNrK2luZGV4LCBvYmoucmdzLmxlbmd0aCwgYmFjaywgaW5kZXhcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGlmIG9sZE9ianNbaW5kZXhdLmlnbm9yZVxuICAgICAgICAgICAgICAgIGlmIGJhY2tPYmoudmFsdWU/LmluZGV4T2Y/KG9sZE9ianNbaW5kZXhdLmlnbm9yZSkgPj0gMFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWR2YW5jZSgpXG4gICAgICAgICAgICBmb3Iga2V5IGluIE9iamVjdC5rZXlzIG9sZE9ianNbaW5kZXhdXG4gICAgICAgICAgICAgICAgc3dpdGNoIGtleSBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd29yZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGJhY2tPYmoudmFsdWU/LmluZGV4T2Y/KCdwdW5jdHVhdGlvbicpID49IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWR2YW5jZSgpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lnbm9yZScgdGhlblxuICAgICAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2xkT2Jqc1tpbmRleF1ba2V5XSAhPSBiYWNrT2JqW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWR2YW5jZSgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5uZXdPYmpzLmxlbmd0aF1cbiAgICAgICAgICAgIGJhY2tPYmogPSBvYmoucmdzW29iai5yZ3MubGVuZ3RoK2JhY2sraW5kZXhdXG4gICAgICAgICAgICBmb3Iga2V5IGluIE9iamVjdC5rZXlzIG5ld09ianNbaW5kZXhdXG4gICAgICAgICAgICAgICAgYmFja09ialtrZXldID0gbmV3T2Jqc1tpbmRleF1ba2V5XVxuICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGRvTWF0Y2g6IChvYmosIG10Y2hzKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIG10Y2ggaW4gbXRjaHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3RhcnRMZW5ndGggPSBtdGNoLnN0YXJ0Py5sZW5ndGggPyAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG10Y2guc2luZ2xlIFxuICAgICAgICAgICAgICAgIGlmIG9iai50ZXh0W29iai5pbmRleCsxXSA9PSBtdGNoLmVuZFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnJncyk/Lm1hdGNoID09IG10Y2guZW5kXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5yZ3MubGVuZ3RoLW10Y2guZW5kLmxlbmd0aC1zdGFydExlbmd0aCA8IDBcbiAgICAgICAgICAgICAgICBjb250aW51ZSBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZW5kTWF0Y2hlcyA9IHRydWVcbiAgICAgICAgICAgIGZvciBlbmRJbmRleCBpbiBbMS4uLm10Y2guZW5kLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBpZiBvYmoucmdzW29iai5yZ3MubGVuZ3RoLWVuZEluZGV4XS5tYXRjaCAhPSBtdGNoLmVuZFttdGNoLmVuZC5sZW5ndGgtZW5kSW5kZXhdXG4gICAgICAgICAgICAgICAgICAgIGVuZE1hdGNoZXMgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWYgbm90IGVuZE1hdGNoZXNcbiAgICAgICAgICAgICAgICBjb250aW51ZSBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG10Y2guc3BhY2VkID09IGZhbHNlXG4gICAgICAgICAgICAgICAgaWYgb2JqLnR1cmQuaW5kZXhPZignICcpID49IDBcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG10Y2guc3RhcnRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3Igc3RhcnRJbmRleCBpbiBbb2JqLnJncy5sZW5ndGgtc3RhcnRMZW5ndGgtbXRjaC5lbmQubGVuZ3RoLi4wXVxuICAgICAgICAgICAgICAgICAgICBzdGFydE1hdGNoZXMgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLnN0YXJ0TGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgU3ludGF4LmdldE1hdGNoKG9iaiwgc3RhcnRJbmRleCtpbmRleCkgIT0gbXRjaC5zdGFydFtpbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydE1hdGNoZXMgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIGlmIHN0YXJ0TWF0Y2hlc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBzdGFydEluZGV4ID49IDBcbiAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFtzdGFydEluZGV4Li4uc3RhcnRJbmRleCtzdGFydExlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIGluZGV4LCBtdGNoLnZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFtzdGFydEluZGV4K3N0YXJ0TGVuZ3RoLi4ub2JqLnJncy5sZW5ndGgtbXRjaC5lbmQubGVuZ3RoKzFdXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCBpbmRleCwgbXRjaC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gW29iai5yZ3MubGVuZ3RoLW10Y2guZW5kLmxlbmd0aCsxLi4ub2JqLnJncy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCBpbmRleCwgbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIC0xLCBtdGNoLnZhbHVlXG4gICAgICAgICAgICAgICAgaW5kZXggPSAtMlxuICAgICAgICAgICAgICAgIHdoaWxlIFN5bnRheC5nZXRNYXRjaChvYmosIGluZGV4KSA9PSAnLSdcbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgaW5kZXgsIG10Y2gudmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCBpbmRleC0xLCBtdGNoLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGluZGV4IC09IDJcbiAgICAgICAgICAgICAgICByZXR1cm4gbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAc3Vycm91bmQ6IChvYmosIGJhY2ssIHJhbmdlKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG9iai5yZ3MubGVuZ3RoLTErYmFjayA8PSAxXG4gICAgICAgIGZvciBlbmRJbmRleCBpbiBbb2JqLnJncy5sZW5ndGgtMStiYWNrLi4wXVxuICAgICAgICAgICAgaWYgZW5kSW5kZXggPj0gb2JqLnJncy5sZW5ndGggb3IgZW5kSW5kZXggPCAwXG4gICAgICAgICAgICAgICAgbG9nICdkYWZ1az8nLCBlbmRJbmRleCwgb2JqLnJncy5sZW5ndGgsIGJhY2tcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGlmIG5vdCBvYmoucmdzW2VuZEluZGV4XT9cbiAgICAgICAgICAgICAgICBsb2cgJ2RhZnVrMj8nLCBlbmRJbmRleCwgb2JqLnJncy5sZW5ndGgsIGJhY2tcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGlmIHJhbmdlLmVuZCA9PSBvYmoucmdzW2VuZEluZGV4XT8ubWF0Y2hcbiAgICAgICAgICAgICAgICBmb3Igc3RhcnRJbmRleCBpbiBbZW5kSW5kZXgtMS4uMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgcmFuZ2Uuc3RhcnQgPT0gb2JqLnJnc1tzdGFydEluZGV4XT8ubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBhZGRJbmRleCBpbiBbc3RhcnRJbmRleCsxLi4uZW5kSW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnJnc1thZGRJbmRleF0udmFsdWUgPSByYW5nZS5hZGQgKyAnICcgKyBvYmoucmdzW2FkZEluZGV4XS52YWx1ZVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3ludGF4XG4iXX0=
//# sourceURL=../coffee/syntax.coffee