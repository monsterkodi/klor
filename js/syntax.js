// koffee 0.42.0

/*
 0000000  000   000  000   000  000000000   0000000   000   000
000        000 000   0000  000     000     000   000   000 000 
0000000     00000    000 0 000     000     000000000    00000  
     000     000     000  0000     000     000   000   000 000 
0000000      000     000   000     000     000   000  000   000
 */
var Syntax, _, empty, first, kerror, last, noon, ref, slash, valid,
    indexOf = [].indexOf;

ref = require('../../kxk'), noon = ref.noon, slash = ref.slash, first = ref.first, valid = ref.valid, empty = ref.empty, last = ref.last, kerror = ref.kerror, _ = ref._;

''

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
            kerror("no string char '" + obj.char + "'");
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
            if (!(backObj)) {
                console.log('[33m[93msyntax[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m903[39m', '[1m[97massertion failure![39m[22m');

            };
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
                return;
            }
            if (obj.rgs[endIndex] == null) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4REFBQTtJQUFBOztBQVFBLE1BQXdELE9BQUEsQ0FBUSxXQUFSLENBQXhELEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxlQUFwQyxFQUEwQyxtQkFBMUMsRUFBa0Q7O0FBQXlCOztBQWNyRTs7O0lBRUYsTUFBQyxDQUFBLElBQUQsR0FBUTs7SUFDUixNQUFDLENBQUEsSUFBRCxHQUFROztJQVFSLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtBQUVILFlBQUE7UUFBQSxJQUFVLE1BQU0sQ0FBQyxJQUFQLEtBQWUsSUFBekI7QUFBQSxtQkFBQTs7UUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMEIsUUFBMUIsRUFBa0MsV0FBbEMsQ0FBVjtRQUVQLE1BQU0sQ0FBQyxJQUFQLEdBQWM7UUFDZCxNQUFNLENBQUMsSUFBUCxHQUFjO1FBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztRQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7UUFDZCxNQUFNLENBQUMsSUFBUCxHQUFjO1FBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztBQUVkO2FBQUEsZ0JBQUE7Ozs7QUFDSTtBQUFBO3FCQUFBLHNDQUFBOztvQkFFSSxJQUF5QixhQUFXLE1BQU0sQ0FBQyxJQUFsQixFQUFBLEdBQUEsS0FBekI7d0JBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLEdBQWpCLEVBQUE7Ozs0QkFFWSxDQUFBLEdBQUE7OzRCQUFBLENBQUEsR0FBQSxJQUFROzs7O0FBQ3BCOzZCQUFBLG1CQUFBOzs0QkFFSSxJQUFHLEtBQUEsS0FBUyxTQUFaOzt5Q0FDZ0IsQ0FBQSxHQUFBOzt5Q0FB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QUE4QixDQUFFLGVBQW5DO0FBQ0kscUJBQWtCLHFHQUFsQjtvQkFDSSxJQUFHLEtBQUssQ0FBQyxLQUFOLGlEQUFrQyxDQUFFLGVBQXZDO0FBQ0ksNkJBQWdCLDhIQUFoQjs0QkFDSSxHQUFHLENBQUMsR0FBSSxDQUFBLFFBQUEsQ0FBUyxDQUFDLEtBQWxCLEdBQTBCLEtBQUssQ0FBQyxHQUFOLEdBQVksR0FBWixHQUFrQixHQUFHLENBQUMsR0FBSSxDQUFBLFFBQUEsQ0FBUyxDQUFDO0FBRGxFLHlCQURKOztBQURKLGlCQURKOztBQUxKO0lBSE87Ozs7OztBQWNmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwIFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgbm9vbiwgc2xhc2gsIGZpcnN0LCB2YWxpZCwgZW1wdHksIGxhc3QsIGtlcnJvciwgXyB9ID0gcmVxdWlyZSAnLi4vLi4va3hrJ1xuXG7ilrhkb2MgJ3N5bnRheCdcblxuICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgU3ludGF4LnJhbmdlcyB0ZXh0bGluZSwgZXh0XG4gICBgYGBcbiAgIFxuICAgdGV4dGxpbmUgc2hvdWxkICoqbm90KiogY29udGFpbiBuZXdsaW5lcy4gXG4gICBvcHRpbWl6ZWQgdG8gcnVuIGZhc3Qgb24gc2hvcnRlciBpbnB1dHMuXG5cbmNsYXNzIFN5bnRheFxuXG4gICAgQGV4dHMgPSBbXSBcbiAgICBAbGFuZyA9IG51bGxcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBpbml0OiAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIFN5bnRheC5sYW5nICE9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGRhdGEgPSBub29uLmxvYWQgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicnY29mZmVlJydsYW5nLm5vb24nXG4gICAgICAgIFxuICAgICAgICBTeW50YXgubGFuZyA9IHt9XG4gICAgICAgIFN5bnRheC5pbmZvID0ge31cbiAgICAgICAgU3ludGF4Lm10Y2ggPSB7fVxuICAgICAgICBTeW50YXguZmlsbCA9IHt9XG4gICAgICAgIFN5bnRheC53b3JkID0ge31cbiAgICAgICAgU3ludGF4LnR1cmQgPSB7fVxuICAgICAgICBcbiAgICAgICAgZm9yIGV4dE5hbWVzLHZhbHVlV29yZHMgb2YgZGF0YVxuICAgICAgICAgICAgZm9yIGV4dCBpbiBleHROYW1lcy5zcGxpdCAvXFxzL1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmV4dHMucHVzaChleHQpIGlmIGV4dCBub3QgaW4gU3ludGF4LmV4dHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFN5bnRheC5sYW5nW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICBmb3IgdmFsdWUsd29yZHMgb2YgdmFsdWVXb3Jkc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdW3ZhbHVlXSA9IHdvcmRzXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgdmFsdWUgPT0gJ21hdGNoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHZhbHVlLG10Y2hJbmZvIG9mIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaEluZm8uZmlsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZmlsbFtleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG10Y2hJbmZvLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmZpbGxbZXh0XVttdGNoSW5mby5maWxsXSA9IG10Y2hJbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBtdGNoSW5mby5lbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4Lm10Y2hbZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubXRjaFtleHRdW2xhc3QgbXRjaEluZm8uZW5kXSA/PSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGNoSW5mby52YWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5tdGNoW2V4dF1bbGFzdCBtdGNoSW5mby5lbmRdLnB1c2ggbXRjaEluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIG10Y2hJbmZvLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnR1cmRbZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGNoSW5mby5tYXRjaCA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC50dXJkW2V4dF1bdmFsdWVdID0gbXRjaEluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC53b3JkW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRjaEluZm8udmFsdWUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgud29yZFtleHRdW3ZhbHVlXSA9IG10Y2hJbmZvXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBfLmlzQXJyYXkgd29yZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Igd29yZCxpbmZvIG9mIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5pbmZvW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5pbmZvW2V4dF1bdmFsdWVdID89IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdW3ZhbHVlXS5wdXNoIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6ICAgaWYgd29yZFswXSA9PSAndCcgdGhlbiAndHVyZCcgZWxzZSAnd29yZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHBhcnNlSW50IHdvcmQuc2xpY2UgMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm86ICAgaW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubGFuZ1tleHRdW3dvcmRdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB3b3JkIGluIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5sYW5nW2V4dF1bd29yZF0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgIyBsb2cgc3RyIFN5bnRheC5tdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEByYW5nZXM6ICh0ZXh0LCBleHQpIC0+XG4gICAgICAgIFxuICAgICAgICBTeW50YXguaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBvYmogPVxuICAgICAgICAgICAgZXh0OiAgICBleHQgPyAndHh0JyBcbiAgICAgICAgICAgIHJnczogICAgW10gICAjIGxpc3Qgb2YgcmFuZ2VzIChyZXN1bHQpXG4gICAgICAgICAgICB3b3JkczogIFtdICAgIyBlbmNvdW50ZXJlZCB3b3Jkc1xuICAgICAgICAgICAgd29yZDogICAnJyAgICMgY3VycmVudGx5IHBhcnNlZCB3b3JkXG4gICAgICAgICAgICB0dXJkOiAgICcnICAgIyBjdXJyZW50bHkgcGFyc2VkIHN0dWZmIGluYmV0d2VlbiB3b3JkcyBcbiAgICAgICAgICAgIGxhc3Q6ICAgJycgICAjIHRoZSB0dXJkIGJlZm9yZSB0aGUgY3VycmVudC9sYXN0LWNvbXBsZXRlZCB3b3JkXG4gICAgICAgICAgICBpbmRleDogIDAgXG4gICAgICAgICAgICB0ZXh0OiAgIHRleHRcbiAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggb2JqLmV4dFxuICAgICAgICAgICAgd2hlbiAnY3BwJyAnaHBwJyAnYycgJ2gnICdjYycgJ2N4eCcgJ2NzJ1xuICAgICAgICAgICAgICAgIG9iai5jcHBsYW5nICA9IHRydWVcbiAgICAgICAgICAgICAgICBvYmouY3BwICAgICAgPSB0cnVlXG4gICAgICAgICAgICB3aGVuICdjb2ZmZWUnICdrb2ZmZWUnICdqcycgJ3RzJ1xuICAgICAgICAgICAgICAgIG9iai5qc2xhbmcgICA9IHRydWVcbiAgICAgICAgICAgICAgICBvYmpbb2JqLmV4dF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgb2JqLmNvZmZlZSAgID0gdHJ1ZSBpZiBvYmouZXh0IGlzICdrb2ZmZWUnXG4gICAgICAgICAgICB3aGVuICdodG1sJyAnaHRtJ1xuICAgICAgICAgICAgICAgIG9iai5odG1sICAgICA9IHRydWVcbiAgICAgICAgICAgIHdoZW4gJ3lhbWwnICd5bWwnXG4gICAgICAgICAgICAgICAgb2JqLnlhbWwgICAgID0gdHJ1ZVxuICAgICAgICAgICAgd2hlbiAnY3NzJyAnc3R5bCcgJ3Njc3MnICdzYXNzJ1xuICAgICAgICAgICAgICAgIG9iai5jc3NsYW5nICA9IHRydWVcbiAgICAgICAgICAgICAgICBvYmpbb2JqLmV4dF0gPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb2JqW29iai5leHRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBvYmouZGljdGxhbmcgPSB0cnVlIGlmIG9iai5qc2xhbmcgb3Igb2JqLmlzcyBvciBvYmoubG9nIG9yIG9iai5qc29uIG9yIG9iai55YW1sXG4gICAgICAgIG9iai5kYXNobGFuZyA9IHRydWUgaWYgb2JqLmNzc2xhbmcgb3Igb2JqLmlzcyBvciBvYmoucHVnICMgb2JqLm5vb24gb3IgXG4gICAgICAgIG9iai5kb3RsYW5nICA9IHRydWUgaWYgb2JqLmNwcGxhbmcgb3Igb2JqLmpzbGFuZyBvciBvYmoubG9nXG4gICAgICAgIG9iai54bWxsYW5nICA9IHRydWUgaWYgb2JqLnhtbCBvciBvYmouaHRtbCBvciBvYmoucGxpc3RcbiAgICAgICAgXG4gICAgICAgIGZvciBjaGFyIGluIHRleHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNoYXIgPT0gJ1xcXFwnXG4gICAgICAgICAgICAgICAgaWYgb2JqLmVzY3AgXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmouZXNjcFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb2JqLmVzY3AgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai5lc2NwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmouY2hhciA9IGNoYXJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmludGVycG9sYXRpb24gYW5kIG9iai5jaGFyID09ICd9J1xuICAgICAgICAgICAgICAgIFN5bnRheC5lbmRXb3JkIG9ialxuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogb2JqLmluZGV4XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiBvYmouY2hhclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCIje29iai5pbnRlcnBvbGF0aW9ufSBwdW5jdHVhdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9iai5zdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICBzdGFydDogIG9iai5pbmRleCsxXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAgb2JqLmludGVycG9sYXRpb25cbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6ICAnJ1xuICAgICAgICAgICAgICAgIG9iai5pbmRleCsrXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmRvU3RyaW5nIG9ialxuXG4gICAgICAgICAgICBlbHNlIGlmIG9iai5jb21tZW50XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmRvQ29tbWVudCBvYmpcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIGNoYXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCInXCIgJ1wiJyAnYCdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IG9iai5lc2NwIGFuZCAoY2hhciAhPSBcIidcIiBvciBvYmouanNsYW5nIG9yIG9iai5wdWcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnN0YXJ0U3RyaW5nIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5kb1B1bmN0IG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJysnICcqJyAnPCcgJz4nICc9JyAnXicgJ34nICdAJyAnJCcgJyYnICclJyAnIycgJy8nICdcXFxcJyAnOicgJy4nICc7JyAnLCcgJyEnICc/JyAnfCcgJ3snICd9JyAnKCcgJyknICdbJyAnXSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvUHVuY3Qgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmRhc2hsYW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvV29yZCBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZG9QdW5jdCBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJyAnICdcXHQnIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZW5kV29yZCBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBlbHNlICMgc3RhcnQgYSBuZXcgd29yZCAvIGNvbnRpbnVlIHRoZSBjdXJyZW50IHdvcmRcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvV29yZCBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGNoYXIgbm90IGluIFsnICcgJ1xcdCddXG4gICAgICAgICAgICAgICAgICAgIFN5bnRheC5jb2ZmZWVDYWxsIG9ialxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5pbmRleCsrXG4gICAgICAgICAgXG4gICAgICAgIG9iai5jaGFyID0gbnVsbFxuICAgICAgICBTeW50YXguZW5kV29yZCBvYmpcbiAgICAgICAgU3ludGF4LmVuZExpbmUgb2JqXG4gICAgICAgICAgICBcbiAgICAgICAgb2JqLnJnc1xuICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBlbmRXb3JkOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgY2hhciA9IG9iai5jaGFyID8gJydcbiAgICAgICAgXG4gICAgICAgIG9iai50dXJkICs9IGNoYXIgIyBkb24ndCB1c2UgPSBoZXJlIVxuXG4gICAgICAgIHN3aXRjaCBjaGFyXG4gICAgICAgICAgICB3aGVuICcgJywgJ1xcdCdcbiAgICAgICAgICAgICAgICBTeW50YXguZG9UdXJkIG9ialxuICAgICAgICAgICAgICAgIGlmIG9iai5yZWdleHA/IGFuZCBub3Qgb2JqLmVzY3BcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG9iai5yZWdleHAgIyBhYm9ydCByZWdleHAgb24gZmlyc3QgdW5lc2NhcGVkIHNwYWNlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5ub29uXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai50dXJkLmVuZHNXaXRoICcgICdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0KG9iai5yZ3MpPy5zdGFydCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5vYmoucmdzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnN1YnN0aXR1dGUgb2JqLCAtaW5kZXgtMSwgWyd0ZXh0J10sIFsncHJvcGVydHknXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc3Vic3RpdHV0ZSBvYmosIC1pbmRleC0xLCBbJ3B1bmN0dWF0aW9uJ10sIFsncHJvcGVydHkgcHVuY3R1YXRpb24nXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHZhbGlkIG9iai53b3JkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdvcmQgPSBvYmoud29yZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmoud29yZHMucHVzaCB3b3JkXG4gICAgICAgICAgICBvYmoud29yZCA9ICcnXG5cbiAgICAgICAgICAgIGdldFZhbHVlID0gKGJhY2s9LTEpICAgICAtPiBTeW50YXguZ2V0VmFsdWUgb2JqLCBiYWNrIFxuICAgICAgICAgICAgZ2V0TWF0Y2ggPSAoYmFjaz0tMSkgICAgIC0+IFN5bnRheC5nZXRNYXRjaCBvYmosIGJhY2tcbiAgICAgICAgICAgIHNldFZhbHVlID0gKGJhY2ssIHZhbHVlKSAtPiBTeW50YXguc2V0VmFsdWUgb2JqLCBiYWNrLCB2YWx1ZSAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNldENsYXNzID0gKGNsc3MpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmNvZmZlZSBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnJncyk/Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2xzcyA9PSAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHNzID0gJ21lbWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Qob2JqLnJncykudmFsdWUgPSBjbHNzICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgb2JqLmpzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBjbHNzID09ICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnJlcGxhY2Ugb2JqLCAtMiwgW3t3b3JkOnRydWV9LCB7bWF0Y2g6Jz0nfV0sIFt7dmFsdWU6J2Z1bmN0aW9uJ31dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXggLSB3b3JkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBtYXRjaDogd29yZFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY2xzc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB2YWxpZCBvYmouZmlsbFxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyBvYmouZmlsbC52YWx1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc3dpdGNoIGNoYXJcbiAgICAgICAgICAgICAgICB3aGVuICc6J1xuICAgICAgICAgICAgICAgICAgICBpZiBvYmouZGljdGxhbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgd2hlbiAnPSdcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmluaVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgU3ludGF4LnR1cmRbb2JqLmV4dF1cbiAgICAgICAgICAgICAgICBsYXN0VHVyZCA9IGxhc3Qgb2JqLmxhc3Quc3BsaXQgL1xccysvXG4gICAgICAgICAgICAgICAgaWYgdHVyZEluZm8gPSBTeW50YXgudHVyZFtvYmouZXh0XVtsYXN0VHVyZF1cbiAgICAgICAgICAgICAgICAgICAgaWYgdHVyZEluZm8uc3BhY2VkICE9IHRydWUgb3Igb2JqLmxhc3Rbb2JqLmxhc3QubGVuZ3RoLWxhc3RUdXJkLmxlbmd0aC0xXSA9PSAnICdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR1cmRJbmZvWyd3LTEnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC10dXJkSW5mby5tYXRjaC5sZW5ndGgtMSwgdHVyZEluZm9bJ3ctMSddXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi50dXJkSW5mby5tYXRjaC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLWluZGV4LTEsIHR1cmRJbmZvLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR1cmRJbmZvWyd3LTAnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyB0dXJkSW5mb1sndy0wJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGN3b3JkID0gd29yZC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHdvcmRJbmZvID0gU3ludGF4LndvcmRbb2JqLmV4dF0/W2xjd29yZF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB3b3JkSW5mb1sndC0xJ10/IGFuZCBvYmoubGFzdCBpbiBPYmplY3Qua2V5cyB3b3JkSW5mb1sndC0xJ11cbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsIHdvcmRJbmZvLnZhbHVlICsgJyAnICsgd29yZEluZm9bJ3ctMSddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCB3b3JkSW5mby52YWx1ZSArICcgJyArIHdvcmRJbmZvWyd0LTEnXVtvYmoubGFzdF1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIHdvcmRJbmZvLnZhbHVlICsgJyAnICsgd29yZEluZm8ud29yZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB3b3JkVmFsdWUgPSBTeW50YXgubGFuZ1tvYmouZXh0XT9bbGN3b3JkXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFN5bnRheC5pbmZvW29iai5leHRdP1t3b3JkVmFsdWVdP1xuICAgICAgICAgICAgICAgICAgICBmb3IgdmFsdWVJbmZvIGluIFN5bnRheC5pbmZvW29iai5leHRdW3dvcmRWYWx1ZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBtYXRjaCxtYXRjaFZhbHVlIG9mIHZhbHVlSW5mby5pbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QudHJpbSgpLmVuZHNXaXRoIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm1hdGNoLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLWluZGV4LCBtYXRjaFZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIG1hdGNoVmFsdWVcbiAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3Mgd29yZFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgICAgICAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNvZmZlZVxuICAgICAgICAgICAgICAgIGlmIGdldE1hdGNoKC0xKSBpbiBbJ2NsYXNzJyAnZXh0ZW5kcyddXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY2xhc3MnXG4gICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTEpPy5pbmRleE9mPygncHVuY3R1YXRpb24nKSA8IDBcbiAgICAgICAgICAgICAgICAgICAgaWYgd29yZCBub3QgaW4gWydlbHNlJyAndGhlbicgJ2FuZCcgJ29yJyAnaW4nXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbGFzdChvYmoucmdzKS52YWx1ZSBub3QgaW4gWydrZXl3b3JkJyAnZnVuY3Rpb24gaGVhZCcgJ3JlcXVpcmUnICdudW1iZXInXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZnVuY3Rpb24gY2FsbCcgIyBjb2ZmZWUgZW5kV29yZCAtMSBubyBwdW5jdHVhdGlvbiBhbmQgd29yZCAhPSAnZWxzZSAuLi4nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgICAgICAgICAgaWYgL14weFthLWZBLUZcXGRdW2EtZkEtRlxcZF1bYS1mQS1GXFxkXSskLy50ZXN0IHdvcmRcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ251bWJlciBoZXggcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdudW1iZXIgaGV4IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyIGhleCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGdldE1hdGNoKC0xKSA9PSBcIiNcIlxuICAgICAgICAgICAgICAgIGlmIC9eW2EtZkEtRlxcZF0rJC8udGVzdCB3b3JkXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnbnVtYmVyIGhleCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAgICAgICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAgICAgICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLm5vb25cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoud29yZHMubGVuZ3RoID09IDEgXG4gICAgICAgICAgICAgICAgICAgIGlmIGVtcHR5IG9iai5sYXN0XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgb2JqLnNoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLndvcmRzLmxlbmd0aCA+IDEgYW5kIGdldE1hdGNoKC0xKSA9PSAnLScgYW5kIGdldFZhbHVlKC0yKSA9PSAnYXJndW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIHNldENsYXNzIC0xLCAnYXJndW1lbnQgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnYXJndW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICAgICAgICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcblxuICAgICAgICAgICAgaWYgb2JqLmNwcGxhbmdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdCA9PSAnOjonXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai5yZ3MubGVuZ3RoID49IDNcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zLCAnbmFtZXNwYWNlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdwdW5jdHVhdGlvbiBuYW1lc3BhY2UnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3B1bmN0dWF0aW9uIG5hbWVzcGFjZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJygnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdmdW5jdGlvbiBjYWxsJyAjIGNwcCA6OndvcmQgKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAvXltcXFxcX0EtWl1bXFxcXF9BLVowLTldKyQvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ21hY3JvJ1xuXG4gICAgICAgICAgICAgICAgaWYgICAgICAvXltVQV1bQS1aXVxcdyskLy50ZXN0KHdvcmQpIHRoZW4gcmV0dXJuIHNldENsYXNzICd0eXBlIGNsYXNzJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgL15bU0ZdW0EtWl1cXHcrJC8udGVzdCh3b3JkKSB0aGVuIHJldHVybiBzZXRDbGFzcyAndHlwZSBzdHJ1Y3QnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAvXltFXVtBLVpdXFx3KyQvLnRlc3Qod29yZCkgIHRoZW4gcmV0dXJuIHNldENsYXNzICd0eXBlIGVudW0nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAnY2xhc3MnIGluIG9iai53b3JkcyBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdjbGFzcydcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgY2hhciA9PSAnPCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICd0eXBlIHRlbXBsYXRlJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdCA9PSAnOjonXG4gICAgICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0zKSBpbiBbJ2VudW0nLCAnY2xhc3MnLCAnc3RydWN0J11cbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZyAncmVhbGx5PydcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsc3MgPSBnZXRWYWx1ZSgtMylcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zLCBnZXRWYWx1ZSgtMykgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsIGdldFZhbHVlKC0zKSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgZ2V0VmFsdWUoLTMpICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0ID09ICcuJyBhbmQgL15cXGQrZiQvLnRlc3Qod29yZClcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnbnVtYmVyIGZsb2F0IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC5lbmRzV2l0aCBcIiMjXCJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAncHVuY3R1YXRpb24gb3BlcmF0b3InXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHVuY3R1YXRpb24gb3BlcmF0b3InXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgb2JqLmxhc3QuZW5kc1dpdGggJy0+J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ29iaidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBmaXJzdChvYmoud29yZHMpLnN0YXJ0c1dpdGgoJ1UnKSBhbmQgZmlyc3Qob2JqLnJncyk/LnZhbHVlID09ICdtYWNybydcbiAgICAgICAgICAgICAgICAgICAgaWYgd29yZC5zdGFydHNXaXRoICdCbHVlcHJpbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ21hY3JvIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBpZiB3b3JkLnRvTG93ZXJDYXNlKCkgaW4gWydtZXRhJyAnZGlzcGxheW5hbWUnICdjYXRlZ29yeScgJ3dvcmxkY29udGV4dCcgJ2VkaXRhbnl3aGVyZSddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ21hY3JvIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBpZiB3b3JkLnRvTG93ZXJDYXNlKCkgaW4gWydjb25maWcnICd0cmFuc2llbnQnICdlZGl0ZGVmYXVsdHNvbmx5JyAndmlzaWJsZWFueXdoZXJlJyAnbm9udHJhbnNhY3Rpb25hbCcgJ2ludGVycCcgJ2dsb2JhbGNvbmZpZyddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ21hY3JvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgICAgICAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIC9eXFxkKyQvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0ID09ICcuJyAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTQpID09ICdudW1iZXIgZmxvYXQnIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC00LCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICdzZW12ZXIgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnc2VtdmVyIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ251bWJlciBmbG9hdCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwIDAwMCAgXG4gICAgICAgICAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5kb3RsYW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgaW4gWycuJyAnOiddXG4gICAgICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSBpbiBbJ3RleHQnICdtb2R1bGUnICdjbGFzcycgJ21lbWJlcicgJ2tleXdvcmQnXVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdvYmonIGlmIGdldFZhbHVlKC0yKSA9PSAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHJvcGVydHkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjaGFyID09ICcoJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Z1bmN0aW9uIGNhbGwnICMgZG90bGFuZyAud29yZCAoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC5lbmRzV2l0aCAnLidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHJvcGVydHkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjaGFyID09ICcoJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Z1bmN0aW9uIGNhbGwnICMgZG90bGFuZyAucHJvcGVydHkgKFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAncHJvcGVydHknXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QubGVuZ3RoID4gMSBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmxhc3Rbb2JqLmxhc3QubGVuZ3RoLTJdIGluIFsnKScgJ10nXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHJvcGVydHkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmNvZmZlZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0W29iai5sYXN0Lmxlbmd0aC0yXSA9PSAnPydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICdvYmonIGlmIGdldFZhbHVlKC0zKSA9PSAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdvcGVyYXRvciBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcblxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgICAgMDAwICAgICAgMDAwIDAwMCAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouY3NzbGFuZ1xuXG4gICAgICAgICAgICAgICAgaWYgd29yZC5lbmRzV2l0aCAncydcbiAgICAgICAgICAgICAgICAgICAgaWYgL1xcZCtzLy50ZXN0IHdvcmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgd29yZC5zbGljZSh3b3JkLmxlbmd0aC0yKSBpbiBbJ3B4JyAnZW0nICdleCcgJ2NoJ11cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNzc2xhbmcgb3Igb2JqLnB1Z1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoICcuJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2NsYXNzIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC5lbmRzV2l0aCBcIiNcIlxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2Nzc2lkIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Nzc2lkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5jcHBsYW5nIG9yIG9iai5qc1xuICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJygnIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Z1bmN0aW9uIGNhbGwnICMgY3BwICYganMgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICd0ZXh0J1xuICAgICAgICBudWxsXG4gICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgQGNvZmZlZUNhbGw6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvYmouY29mZmVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai50dXJkID09ICcoJ1xuICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0yLCAnZnVuY3Rpb24gY2FsbCcgIyBjb2ZmZWUgY2FsbCAoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG9iai50dXJkLmxlbmd0aCA+IDEgYW5kIG9iai50dXJkW29iai50dXJkLmxlbmd0aC0yXSA9PSAnICdcbiAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai50dXJkKSBpbiAnQCstXFwnXCIoW3snXG4gICAgICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnR1cmQpIGluICcrLSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai50ZXh0W29iai5pbmRleCsxXSA9PSAnICdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIyBiYWlsIG91dCBpZiBuZXh0IGNoYXJhY3RlciBpcyBhIHNwYWNlIChjaGVhdGVyISlcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gU3ludGF4LmdldFZhbHVlIG9iaiwgLTJcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsaWQodmFsKSBhbmQgdmFsIG5vdCBpbiBbJ2tleXdvcmQnLCAnZnVuY3Rpb24gaGVhZCcsICdyZXF1aXJlJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC5pbmRleE9mKCdwdW5jdHVhdGlvbicpIDwgMCBhbmQgb2JqLnJnc1stMl0udmFsdWUgbm90IGluIFsnbnVtYmVyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCAtMiwgXCJmdW5jdGlvbiBjYWxsXCIgIyBjb2ZmZWUgY2FsbCBAKy1cXCdcIihbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAZG9Xb3JkOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdmFsaWQgb2JqLnR1cmRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3ludGF4LmRvVHVyZCBvYmpcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLmxhc3QgPSBvYmoudHVyZFxuICAgICAgICAgICAgb2JqLnR1cmQgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgb2JqLndvcmQgKz0gb2JqLmNoYXJcbiAgICAgICAgXG4gICAgICAgIG51bGxcblxuICAgIEBkb1R1cmQ6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eShvYmouZmlsbCkgYW5kIGVtcHR5KG9iai53b3JkcykgYW5kIFN5bnRheC5maWxsW29iai5leHRdP1tvYmoudHVyZF0/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5maWxsID0gU3ludGF4LmZpbGxbb2JqLmV4dF0/W29iai50dXJkXVxuICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4ub2JqLnR1cmQubGVuZ3RoXVxuICAgICAgICAgICAgICAgIGlmIG9iai5maWxsLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTEtaW5kZXgsIG9iai5maWxsLnR1cmRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0xLWluZGV4LCBvYmouZmlsbC52YWx1ZSArICcgJyArICdwdW5jdHVhdGlvbidcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBkb1B1bmN0OiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgIFxuICAgICAgICBnZXRWYWx1ZSA9IChiYWNrPS0xKSAgICAgLT4gU3ludGF4LmdldFZhbHVlIG9iaiwgYmFjayBcbiAgICAgICAgc2V0VmFsdWUgPSAoYmFjaywgdmFsdWUpIC0+IFN5bnRheC5zZXRWYWx1ZSBvYmosIGJhY2ssIHZhbHVlICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdmFsdWUgPSAncHVuY3R1YXRpb24nXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggb2JqLmNoYXJcbiAgICAgICAgICAgIHdoZW4gJzonXG4gICAgICAgICAgICAgICAgaWYgb2JqLmRpY3RsYW5nIGFuZCBvYmoudHVyZC5sZW5ndGggPT0gMVxuICAgICAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai5yZ3MpPy52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdkaWN0aW9uYXJ5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmNvZmZlZSAjIGtvZmZlZSBjb25zdHJ1Y3RvciBzaG9ydGN1dFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdtZXRob2QnXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdtZXRob2QgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICB3aGVuICc+J1xuICAgICAgICAgICAgICAgIGlmIG9iai5qc2xhbmdcbiAgICAgICAgICAgICAgICAgICAgZm9yIFt0dXJkLCB2YWxdIGluIFtbJy0+JywgJyddLCBbJz0+JywgJyBib3VuZCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnR1cmQuZW5kc1dpdGggdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdWJzdGl0dXRlIG9iaiwgLTMsIFsnZGljdGlvbmFyeSBrZXknLCAnZGljdGlvbmFyeSBwdW5jdHVhdGlvbiddLCBbJ21ldGhvZCcsICdtZXRob2QgcHVuY3R1YXRpb24nXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdXJyb3VuZCAgIG9iaiwgLTEsIHN0YXJ0OicoJywgYWRkOidhcmd1bWVudCcsIGVuZDonKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgucmVwbGFjZSAgICBvYmosIC0zLCBbe3dvcmQ6dHJ1ZSwgaWdub3JlOidhcmd1bWVudCd9LCB7bWF0Y2g6Jz0nfV0sIFt7dmFsdWU6J2Z1bmN0aW9uJ31dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdmdW5jdGlvbiB0YWlsJyArIHZhbCArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAnZnVuY3Rpb24gaGVhZCcgKyB2YWwgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgb2JqLnhtbGxhbmcgb3Igb2JqLm1kXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai50dXJkLmVuZHNXaXRoICcvPidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAna2V5d29yZCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAna2V5d29yZCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIHdoZW4gJy8nXG4gICAgICAgICAgICAgICAgaWYgb2JqLmpzbGFuZ1xuICAgICAgICAgICAgICAgICAgICBpZiBub3Qgb2JqLmVzY3BcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5yZWdleHA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFtvYmoucmdzLmxlbmd0aC0xLi4wXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoucmdzW2luZGV4XS5zdGFydCA8IG9iai5yZWdleHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5yZ3NbaW5kZXhdLnZhbHVlID0gJ3JlZ2V4cCAnICsgb2JqLnJnc1tpbmRleF0udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdyZWdleHAgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnJlZ2V4cCA9IG9iai5pbmRleCAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIG10Y2ggPSBTeW50YXgubXRjaFtvYmouZXh0XT9bb2JqLmNoYXJdXG4gICAgICAgICAgICBpZiBtYXRjaFZhbHVlID0gU3ludGF4LmRvTWF0Y2ggb2JqLCBtdGNoXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBtYXRjaFZhbHVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG9iai5maWxsIHRoZW4gdmFsdWUgPSBvYmouZmlsbC52YWx1ZSArICcgJyArIHZhbHVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcblxuICAgICAgICBTeW50YXguY2hlY2tDb21tZW50IG9ialxuICAgICAgICBcbiAgICAjIyNcbiAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIyNcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAY2hlY2tDb21tZW50OiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IFN5bnRheC5pbmZvW29iai5leHRdPy5jb21tZW50XG4gICAgICAgIHJldHVybiBpZiBvYmoucmVnZXhwP1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNvbW1lbnQgPSBTeW50YXguaW5mb1tvYmouZXh0XS5jb21tZW50XG4gICAgICAgIFxuICAgICAgICBpZiBjb21tZW50LmxpbmUgYW5kIG9iai50dXJkLmVuZHNXaXRoKGNvbW1lbnQubGluZSkgYW5kIG5vdCBvYmoudHVyZC5lbmRzV2l0aCgnXFxcXCcrY29tbWVudC5saW5lKSBhbmQgZW1wdHkob2JqLndvcmRzKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTeW50YXguc3RhcnRDb21tZW50IG9iaiwgY29tbWVudC5saW5lXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY29tbWVudC50YWlsIGFuZCBvYmoudHVyZC5lbmRzV2l0aChjb21tZW50LnRhaWwpIGFuZCBub3Qgb2JqLnR1cmQuZW5kc1dpdGgoJ1xcXFwnK2NvbW1lbnQudGFpbClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3ludGF4LnN0YXJ0Q29tbWVudCBvYmosIGNvbW1lbnQudGFpbFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgY29tbWVudC5zdGFydCBhbmQgb2JqLnR1cmQuZW5kc1dpdGgoY29tbWVudC5zdGFydCkgYW5kIG5vdCBvYmoudHVyZC5lbmRzV2l0aCgnXFxcXCcrY29tbWVudC5zdGFydClcblxuICAgICAgICAgICAgU3ludGF4LnN0YXJ0Q29tbWVudCBvYmosIGNvbW1lbnQuc3RhcnRcbiAgICAgICAgICAgIFxuICAgICAgICBudWxsXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHN0YXJ0Q29tbWVudDogKG9iaiwgc3RhcnQpIC0+XG4gICAgICAgIFxuICAgICAgICBvYmouY29tbWVudCA9XG4gICAgICAgICAgICBzdGFydDogb2JqLmluZGV4KzFcbiAgICAgICAgICAgIG1hdGNoOiAnJ1xuICAgICAgICAgICAgdmFsdWU6ICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLnN0YXJ0Lmxlbmd0aF1cbiAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0xLWluZGV4LCAnY29tbWVudCBwdW5jdHVhdGlvbidcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCBcbiAgICBcbiAgICBAZG9Db21tZW50OiAob2JqKSAtPlxuXG4gICAgICAgIGNvbW1lbnQgPSBTeW50YXguaW5mb1tvYmouZXh0XS5jb21tZW50XG4gICAgICAgIFxuICAgICAgICBpZiBjb21tZW50LmVuZCBhbmQgb2JqLnR1cmQuZW5kc1dpdGgoY29tbWVudC5lbmQpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouY29tbWVudFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBkZWxldGUgb2JqLmNvbW1lbnRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4uY29tbWVudC5lbmQubGVuZ3RoXVxuICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0xLWluZGV4LCAnY29tbWVudCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG5cbiAgICAgICAgICAgIFN5bnRheC5jb250IG9iaiwgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICMjI1xuICAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIyNcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHN0YXJ0U3RyaW5nOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgIFxuICAgICAgICBzdHJpbmdUeXBlID0gc3dpdGNoIG9iai5jaGFyXG4gICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgIHdoZW4gJ2AnIHRoZW4gJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBub3Qgc3RyaW5nVHlwZVxuICAgICAgICAgICAga2Vycm9yIFwibm8gc3RyaW5nIGNoYXIgJyN7b2JqLmNoYXJ9J1wiXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBvYmoucmdzLnB1c2hcbiAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXhcbiAgICAgICAgICAgIG1hdGNoOiBvYmouY2hhclxuICAgICAgICAgICAgdmFsdWU6IFwiI3tzdHJpbmdUeXBlfSBwdW5jdHVhdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgb2JqLnN0cmluZyA9XG4gICAgICAgICAgICB2YWx1ZTogIHN0cmluZ1R5cGVcbiAgICAgICAgICAgIHN0YXJ0OiAgb2JqLmluZGV4KzFcbiAgICAgICAgICAgIG1hdGNoOiAgJydcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgbnVsbFxuXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCBcbiAgICBcbiAgICBAZG9TdHJpbmc6IChvYmopIC0+XG5cbiAgICAgICAgaWYgb2JqLmNvZmZlZSBcbiAgICAgICAgICAgIGlmIG9iai5jaGFyID09ICd7JyBhbmQgb2JqLnN0cmluZy52YWx1ZSAhPSAnc3RyaW5nIHNpbmdsZScgYW5kIG9iai5zdHJpbmcubWF0Y2guZW5kc1dpdGggXCIjXCJcbiAgICAgICAgICAgICAgICBvYmouaW50ZXJwb2xhdGlvbiA9IG9iai5zdHJpbmcudmFsdWVcbiAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2ggb2JqLnN0cmluZ1xuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogb2JqLmluZGV4XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiBvYmouY2hhclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCIje29iai5pbnRlcnBvbGF0aW9ufSBwdW5jdHVhdGlvblwiXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai5zdHJpbmdcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgXG4gICAgICAgIHN0cmluZ1R5cGUgPSBzd2l0Y2ggb2JqLmNoYXJcbiAgICAgICAgICAgIHdoZW4gXCInXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgIHdoZW4gJ1wiJyB0aGVuICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgd2hlbiAnYCcgdGhlbiAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBcbiAgICAgICAgaWYgbm90IG9iai5lc2NwIGFuZCBvYmouc3RyaW5nLnZhbHVlID09IHN0cmluZ1R5cGVcblxuICAgICAgICAgICAgaWYgdmFsaWQgb2JqLnN0cmluZy5tYXRjaC50cmltKClcbiAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2ggb2JqLnN0cmluZ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZGVsZXRlIG9iai5zdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmoucmdzLnB1c2hcbiAgICAgICAgICAgICAgICBzdGFydDogb2JqLmluZGV4XG4gICAgICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICAgICAgdmFsdWU6IFwiI3tzdHJpbmdUeXBlfSBwdW5jdHVhdGlvblwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3ludGF4LmNvbnQgb2JqLCAnc3RyaW5nJ1xuICAgICAgICAgICAgXG4gICAgICAgIG51bGxcblxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBjb250OiAob2JqLCBrZXkpIC0+XG4gICAgICAgIFxuICAgICAgICBzdHJPckNtdCA9IG9ialtrZXldXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggb2JqLmNoYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gJyAnLCAnXFx0J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0ck9yQ210Lm1hdGNoID09ICcnXG4gICAgICAgICAgICAgICAgICAgIHN0ck9yQ210LnN0YXJ0ICs9IDFcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaCBzdHJPckNtdCBpZiB2YWxpZCBzdHJPckNtdC5tYXRjaFxuICAgICAgICAgICAgICAgICAgICBvYmpba2V5XSA9IFxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleCsxXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzdHJPckNtdC52YWx1ZVxuICAgICAgICAgICAgZWxzZSBcblxuICAgICAgICAgICAgICAgIHN0ck9yQ210Lm1hdGNoICs9IG9iai5jaGFyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBlbmRMaW5lOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb2JqLnN0cmluZ1xuICAgICAgICAgICAgaWYgb2JqLmpzbGFuZyBvciBvYmouY3BwbGFuZ1xuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouc3RyaW5nXG4gICAgICAgIGVsc2UgaWYgb2JqLmNvbW1lbnRcbiAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouY29tbWVudFxuICAgICAgICBudWxsXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgIDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBnZXRNYXRjaDogKG9iaiwgYmFjaykgICAgICAgIC0+IGlmIGJhY2sgPCAwIHRoZW4gb2JqLnJnc1tvYmoucmdzLmxlbmd0aCtiYWNrXT8ubWF0Y2ggZWxzZSBvYmoucmdzW2JhY2tdPy5tYXRjaFxuICAgIEBnZXRWYWx1ZTogKG9iaiwgYmFjaykgICAgICAgIC0+IGlmIGJhY2sgPCAwIHRoZW4gb2JqLnJnc1tvYmoucmdzLmxlbmd0aCtiYWNrXT8udmFsdWUgZWxzZSBvYmoucmdzW2JhY2tdPy52YWx1ZSAgICAgXG4gICAgQHNldFZhbHVlOiAob2JqLCBiYWNrLCB2YWx1ZSkgLT4gXG4gICAgICAgIGlmIGJhY2sgPCAwXG4gICAgICAgICAgICBiYWNrID0gb2JqLnJncy5sZW5ndGgrYmFja1xuICAgICAgICBpZiBiYWNrIDwgb2JqLnJncy5sZW5ndGggYW5kIGJhY2sgPj0gMFxuICAgICAgICAgICAgb2JqLnJnc1tiYWNrXS52YWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICBpZiBvYmouY29mZmVlIGFuZCBvYmoucmdzW2JhY2stMV0/XG4gICAgICAgICAgICAgICAgaWYgb2JqLnJnc1tiYWNrLTFdPy5tYXRjaCA9PSAnQCdcbiAgICAgICAgICAgICAgICAgICAgb2JqLnJnc1tiYWNrLTFdLnZhbHVlID0gdmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuXG4gICAgQGFkZFZhbHVlOiAob2JqLCBiYWNrLCB2YWx1ZSkgLT4gXG4gICAgICAgIGlmIGJhY2sgPCAwXG4gICAgICAgICAgICBiYWNrID0gb2JqLnJncy5sZW5ndGgrYmFja1xuICAgICAgICBpZiBiYWNrIDwgb2JqLnJncy5sZW5ndGggYW5kIGJhY2sgPj0gMFxuICAgICAgICAgICAgZm9yIHZhbCBpbiB2YWx1ZS5zcGxpdCAvXFxzKy9cbiAgICAgICAgICAgICAgICBpZiB2YWwgbm90IGluIG9iai5yZ3NbYmFja10udmFsdWUuc3BsaXQgL1xccysvXG4gICAgICAgICAgICAgICAgICAgIG9iai5yZ3NbYmFja10udmFsdWUgPSB2YWwgKyAnICcgKyBvYmoucmdzW2JhY2tdLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQHN1YnN0aXR1dGU6IChvYmosIGJhY2ssIG9sZFZhbHMsIG5ld1ZhbHMpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5vbGRWYWxzLmxlbmd0aF1cbiAgICAgICAgICAgIHZhbCA9IFN5bnRheC5nZXRWYWx1ZSBvYmosIGJhY2sraW5kZXhcbiAgICAgICAgICAgIGlmIHZhbCAhPSBvbGRWYWxzW2luZGV4XVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGluZGV4ID09IG9sZFZhbHMubGVuZ3RoXG4gICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5vbGRWYWxzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCBiYWNrK2luZGV4LCBuZXdWYWxzW2luZGV4XVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgb2JqLnJncy5sZW5ndGggKyBiYWNrLTEgPj0gMFxuICAgICAgICAgICAgU3ludGF4LnN1YnN0aXR1dGUgb2JqLCBiYWNrLTEsIG9sZFZhbHMsIG5ld1ZhbHNcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAcmVwbGFjZTogKG9iaiwgYmFjaywgb2xkT2JqcywgbmV3T2JqcykgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBvYmoucmdzLmxlbmd0aCtiYWNrIDwgMFxuICAgICAgICBcbiAgICAgICAgYWR2YW5jZSA9IC0+XG4gICAgICAgICAgICBpZiBvYmoucmdzLmxlbmd0aCArIGJhY2stMSA+PSAwXG4gICAgICAgICAgICAgICAgU3ludGF4LnJlcGxhY2Ugb2JqLCBiYWNrLTEsIG9sZE9ianMsIG5ld09ianNcblxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5vbGRPYmpzLmxlbmd0aF1cbiAgICAgICAgICAgIGJhY2tPYmogPSBvYmoucmdzW29iai5yZ3MubGVuZ3RoK2JhY2sraW5kZXhdXG4gICAgICAgICAgICDilrhhc3NlcnQgYmFja09ialxuICAgICAgICAgICAgaWYgb2xkT2Jqc1tpbmRleF0uaWdub3JlXG4gICAgICAgICAgICAgICAgaWYgYmFja09iai52YWx1ZT8uaW5kZXhPZj8ob2xkT2Jqc1tpbmRleF0uaWdub3JlKSA+PSAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZHZhbmNlKClcbiAgICAgICAgICAgIGZvciBrZXkgaW4gT2JqZWN0LmtleXMgb2xkT2Jqc1tpbmRleF1cbiAgICAgICAgICAgICAgICBzd2l0Y2gga2V5IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICd3b3JkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYmFja09iai52YWx1ZT8uaW5kZXhPZj8oJ3B1bmN0dWF0aW9uJykgPj0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhZHZhbmNlKClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWdub3JlJyB0aGVuXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvbGRPYmpzW2luZGV4XVtrZXldICE9IGJhY2tPYmpba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhZHZhbmNlKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm5ld09ianMubGVuZ3RoXVxuICAgICAgICAgICAgYmFja09iaiA9IG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgrYmFjaytpbmRleF1cbiAgICAgICAgICAgIGZvciBrZXkgaW4gT2JqZWN0LmtleXMgbmV3T2Jqc1tpbmRleF1cbiAgICAgICAgICAgICAgICBiYWNrT2JqW2tleV0gPSBuZXdPYmpzW2luZGV4XVtrZXldXG4gICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAZG9NYXRjaDogKG9iaiwgbXRjaHMpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgbXRjaCBpbiBtdGNoc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdGFydExlbmd0aCA9IG10Y2guc3RhcnQ/Lmxlbmd0aCA/IDBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbXRjaC5zaW5nbGUgXG4gICAgICAgICAgICAgICAgaWYgb2JqLnRleHRbb2JqLmluZGV4KzFdID09IG10Y2guZW5kXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgaWYgbGFzdChvYmoucmdzKT8ubWF0Y2ggPT0gbXRjaC5lbmRcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLnJncy5sZW5ndGgtbXRjaC5lbmQubGVuZ3RoLXN0YXJ0TGVuZ3RoIDwgMFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIFxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbmRNYXRjaGVzID0gdHJ1ZVxuICAgICAgICAgICAgZm9yIGVuZEluZGV4IGluIFsxLi4ubXRjaC5lbmQubGVuZ3RoXVxuICAgICAgICAgICAgICAgIGlmIG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgtZW5kSW5kZXhdLm1hdGNoICE9IG10Y2guZW5kW210Y2guZW5kLmxlbmd0aC1lbmRJbmRleF1cbiAgICAgICAgICAgICAgICAgICAgZW5kTWF0Y2hlcyA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpZiBub3QgZW5kTWF0Y2hlc1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbXRjaC5zcGFjZWQgPT0gZmFsc2VcbiAgICAgICAgICAgICAgICBpZiBvYmoudHVyZC5pbmRleE9mKCcgJykgPj0gMFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbXRjaC5zdGFydFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBzdGFydEluZGV4IGluIFtvYmoucmdzLmxlbmd0aC1zdGFydExlbmd0aC1tdGNoLmVuZC5sZW5ndGguLjBdXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0TWF0Y2hlcyA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4uc3RhcnRMZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBTeW50YXguZ2V0TWF0Y2gob2JqLCBzdGFydEluZGV4K2luZGV4KSAhPSBtdGNoLnN0YXJ0W2luZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0TWF0Y2hlcyA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgaWYgc3RhcnRNYXRjaGVzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0YXJ0SW5kZXggPj0gMFxuICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gW3N0YXJ0SW5kZXguLi5zdGFydEluZGV4K3N0YXJ0TGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmFkZFZhbHVlIG9iaiwgaW5kZXgsIG10Y2gudmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gW3N0YXJ0SW5kZXgrc3RhcnRMZW5ndGguLi5vYmoucmdzLmxlbmd0aC1tdGNoLmVuZC5sZW5ndGgrMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIGluZGV4LCBtdGNoLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbb2JqLnJncy5sZW5ndGgtbXRjaC5lbmQubGVuZ3RoKzEuLi5vYmoucmdzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIGluZGV4LCBtdGNoLnZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtdGNoLnZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgU3ludGF4LmFkZFZhbHVlIG9iaiwgLTEsIG10Y2gudmFsdWVcbiAgICAgICAgICAgICAgICBpbmRleCA9IC0yXG4gICAgICAgICAgICAgICAgd2hpbGUgU3ludGF4LmdldE1hdGNoKG9iaiwgaW5kZXgpID09ICctJ1xuICAgICAgICAgICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCBpbmRleCwgbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIGluZGV4LTEsIG10Y2gudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggLT0gMlxuICAgICAgICAgICAgICAgIHJldHVybiBtdGNoLnZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBzdXJyb3VuZDogKG9iaiwgYmFjaywgcmFuZ2UpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgb2JqLnJncy5sZW5ndGgtMStiYWNrIDw9IDFcbiAgICAgICAgZm9yIGVuZEluZGV4IGluIFtvYmoucmdzLmxlbmd0aC0xK2JhY2suLjBdXG4gICAgICAgICAgICBpZiBlbmRJbmRleCA+PSBvYmoucmdzLmxlbmd0aCBvciBlbmRJbmRleCA8IDBcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGlmIG5vdCBvYmoucmdzW2VuZEluZGV4XT9cbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGlmIHJhbmdlLmVuZCA9PSBvYmoucmdzW2VuZEluZGV4XT8ubWF0Y2hcbiAgICAgICAgICAgICAgICBmb3Igc3RhcnRJbmRleCBpbiBbZW5kSW5kZXgtMS4uMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgcmFuZ2Uuc3RhcnQgPT0gb2JqLnJnc1tzdGFydEluZGV4XT8ubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBhZGRJbmRleCBpbiBbc3RhcnRJbmRleCsxLi4uZW5kSW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnJnc1thZGRJbmRleF0udmFsdWUgPSByYW5nZS5hZGQgKyAnICcgKyBvYmoucmdzW2FkZEluZGV4XS52YWx1ZVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3ludGF4XG4iXX0=
//# sourceURL=../coffee/syntax.coffee