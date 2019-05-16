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
                if (obj.ext === 'ts') {
                    obj.js = true;
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
        if (!obj.fill && obj.words.length === 0 && (((ref1 = Syntax.fill[obj.ext]) != null ? ref1[obj.turd] : void 0) != null)) {
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
                console.log('[33m[93msyntax[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m904[39m', '[1m[97massertion failure![39m[22m');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw4REFBQTtJQUFBOztBQVFBLE1BQXdELE9BQUEsQ0FBUSxXQUFSLENBQXhELEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxlQUFwQyxFQUEwQyxtQkFBMUMsRUFBa0Q7O0FBQXlCOztBQWNyRTs7O0lBRUYsTUFBQyxDQUFBLElBQUQsR0FBUTs7SUFDUixNQUFDLENBQUEsSUFBRCxHQUFROztJQVFSLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtBQUVILFlBQUE7UUFBQSxJQUFVLE1BQU0sQ0FBQyxJQUFQLEtBQWUsSUFBekI7QUFBQSxtQkFBQTs7UUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMEIsUUFBMUIsRUFBa0MsV0FBbEMsQ0FBVjtRQUVQLE1BQU0sQ0FBQyxJQUFQLEdBQWM7UUFDZCxNQUFNLENBQUMsSUFBUCxHQUFjO1FBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztRQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7UUFDZCxNQUFNLENBQUMsSUFBUCxHQUFjO1FBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztBQUVkO2FBQUEsZ0JBQUE7Ozs7QUFDSTtBQUFBO3FCQUFBLHNDQUFBOztvQkFFSSxJQUF5QixhQUFXLE1BQU0sQ0FBQyxJQUFsQixFQUFBLEdBQUEsS0FBekI7d0JBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLEdBQWpCLEVBQUE7Ozs0QkFFWSxDQUFBLEdBQUE7OzRCQUFBLENBQUEsR0FBQSxJQUFROzs7O0FBQ3BCOzZCQUFBLG1CQUFBOzs0QkFFSSxJQUFHLEtBQUEsS0FBUyxTQUFaOzt5Q0FDZ0IsQ0FBQSxHQUFBOzt5Q0FB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QUNJLHVCQURKOztZQUVBLElBQU8seUJBQVA7QUFDSSx1QkFESjs7WUFFQSxJQUFHLEtBQUssQ0FBQyxHQUFOLCtDQUE4QixDQUFFLGVBQW5DO0FBQ0kscUJBQWtCLHFHQUFsQjtvQkFDSSxJQUFHLEtBQUssQ0FBQyxLQUFOLGlEQUFrQyxDQUFFLGVBQXZDO0FBQ0ksNkJBQWdCLDhIQUFoQjs0QkFDSSxHQUFHLENBQUMsR0FBSSxDQUFBLFFBQUEsQ0FBUyxDQUFDLEtBQWxCLEdBQTBCLEtBQUssQ0FBQyxHQUFOLEdBQVksR0FBWixHQUFrQixHQUFHLENBQUMsR0FBSSxDQUFBLFFBQUEsQ0FBUyxDQUFDO0FBRGxFLHlCQURKOztBQURKLGlCQURKOztBQUxKO0lBSE87Ozs7OztBQWNmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwIFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgbm9vbiwgc2xhc2gsIGZpcnN0LCB2YWxpZCwgZW1wdHksIGxhc3QsIGtlcnJvciwgXyB9ID0gcmVxdWlyZSAnLi4vLi4va3hrJ1xuXG7ilrhkb2MgJ3N5bnRheCdcblxuICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgU3ludGF4LnJhbmdlcyB0ZXh0bGluZSwgZXh0XG4gICBgYGBcbiAgIFxuICAgdGV4dGxpbmUgc2hvdWxkICoqbm90KiogY29udGFpbiBuZXdsaW5lcy4gXG4gICBvcHRpbWl6ZWQgdG8gcnVuIGZhc3Qgb24gc2hvcnRlciBpbnB1dHMuXG5cbmNsYXNzIFN5bnRheFxuXG4gICAgQGV4dHMgPSBbXSBcbiAgICBAbGFuZyA9IG51bGxcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBpbml0OiAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIFN5bnRheC5sYW5nICE9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGRhdGEgPSBub29uLmxvYWQgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicnY29mZmVlJydsYW5nLm5vb24nXG4gICAgICAgIFxuICAgICAgICBTeW50YXgubGFuZyA9IHt9XG4gICAgICAgIFN5bnRheC5pbmZvID0ge31cbiAgICAgICAgU3ludGF4Lm10Y2ggPSB7fVxuICAgICAgICBTeW50YXguZmlsbCA9IHt9XG4gICAgICAgIFN5bnRheC53b3JkID0ge31cbiAgICAgICAgU3ludGF4LnR1cmQgPSB7fVxuICAgICAgICBcbiAgICAgICAgZm9yIGV4dE5hbWVzLHZhbHVlV29yZHMgb2YgZGF0YVxuICAgICAgICAgICAgZm9yIGV4dCBpbiBleHROYW1lcy5zcGxpdCAvXFxzL1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmV4dHMucHVzaChleHQpIGlmIGV4dCBub3QgaW4gU3ludGF4LmV4dHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFN5bnRheC5sYW5nW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICBmb3IgdmFsdWUsd29yZHMgb2YgdmFsdWVXb3Jkc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdW3ZhbHVlXSA9IHdvcmRzXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgdmFsdWUgPT0gJ21hdGNoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHZhbHVlLG10Y2hJbmZvIG9mIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaEluZm8uZmlsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZmlsbFtleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG10Y2hJbmZvLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmZpbGxbZXh0XVttdGNoSW5mby5maWxsXSA9IG10Y2hJbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBtdGNoSW5mby5lbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4Lm10Y2hbZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubXRjaFtleHRdW2xhc3QgbXRjaEluZm8uZW5kXSA/PSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGNoSW5mby52YWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5tdGNoW2V4dF1bbGFzdCBtdGNoSW5mby5lbmRdLnB1c2ggbXRjaEluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIG10Y2hJbmZvLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnR1cmRbZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGNoSW5mby5tYXRjaCA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC50dXJkW2V4dF1bdmFsdWVdID0gbXRjaEluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC53b3JkW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRjaEluZm8udmFsdWUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgud29yZFtleHRdW3ZhbHVlXSA9IG10Y2hJbmZvXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBfLmlzQXJyYXkgd29yZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Igd29yZCxpbmZvIG9mIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5pbmZvW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5pbmZvW2V4dF1bdmFsdWVdID89IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdW3ZhbHVlXS5wdXNoIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6ICAgaWYgd29yZFswXSA9PSAndCcgdGhlbiAndHVyZCcgZWxzZSAnd29yZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHBhcnNlSW50IHdvcmQuc2xpY2UgMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm86ICAgaW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubGFuZ1tleHRdW3dvcmRdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB3b3JkIGluIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5sYW5nW2V4dF1bd29yZF0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgIyBsb2cgc3RyIFN5bnRheC5tdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEByYW5nZXM6ICh0ZXh0LCBleHQpIC0+XG4gICAgICAgIFxuICAgICAgICBTeW50YXguaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBvYmogPVxuICAgICAgICAgICAgZXh0OiAgICBleHQgPyAndHh0JyBcbiAgICAgICAgICAgIHJnczogICAgW10gICAjIGxpc3Qgb2YgcmFuZ2VzIChyZXN1bHQpXG4gICAgICAgICAgICB3b3JkczogIFtdICAgIyBlbmNvdW50ZXJlZCB3b3Jkc1xuICAgICAgICAgICAgd29yZDogICAnJyAgICMgY3VycmVudGx5IHBhcnNlZCB3b3JkXG4gICAgICAgICAgICB0dXJkOiAgICcnICAgIyBjdXJyZW50bHkgcGFyc2VkIHN0dWZmIGluYmV0d2VlbiB3b3JkcyBcbiAgICAgICAgICAgIGxhc3Q6ICAgJycgICAjIHRoZSB0dXJkIGJlZm9yZSB0aGUgY3VycmVudC9sYXN0LWNvbXBsZXRlZCB3b3JkXG4gICAgICAgICAgICBpbmRleDogIDAgXG4gICAgICAgICAgICB0ZXh0OiAgIHRleHRcbiAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggb2JqLmV4dFxuICAgICAgICAgICAgd2hlbiAnY3BwJyAnaHBwJyAnYycgJ2gnICdjYycgJ2N4eCcgJ2NzJ1xuICAgICAgICAgICAgICAgIG9iai5jcHBsYW5nICA9IHRydWVcbiAgICAgICAgICAgICAgICBvYmouY3BwICAgICAgPSB0cnVlXG4gICAgICAgICAgICB3aGVuICdjb2ZmZWUnICdrb2ZmZWUnICdqcycgJ3RzJ1xuICAgICAgICAgICAgICAgIG9iai5qc2xhbmcgICA9IHRydWVcbiAgICAgICAgICAgICAgICBvYmpbb2JqLmV4dF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgb2JqLmNvZmZlZSAgID0gdHJ1ZSBpZiBvYmouZXh0IGlzICdrb2ZmZWUnXG4gICAgICAgICAgICAgICAgb2JqLmpzICAgICAgID0gdHJ1ZSBpZiBvYmouZXh0IGlzICd0cydcbiAgICAgICAgICAgIHdoZW4gJ2h0bWwnICdodG0nXG4gICAgICAgICAgICAgICAgb2JqLmh0bWwgICAgID0gdHJ1ZVxuICAgICAgICAgICAgd2hlbiAneWFtbCcgJ3ltbCdcbiAgICAgICAgICAgICAgICBvYmoueWFtbCAgICAgPSB0cnVlXG4gICAgICAgICAgICB3aGVuICdjc3MnICdzdHlsJyAnc2NzcycgJ3Nhc3MnXG4gICAgICAgICAgICAgICAgb2JqLmNzc2xhbmcgID0gdHJ1ZVxuICAgICAgICAgICAgICAgIG9ialtvYmouZXh0XSA9IHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvYmpbb2JqLmV4dF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG9iai5kaWN0bGFuZyA9IHRydWUgaWYgb2JqLmpzbGFuZyBvciBvYmouaXNzIG9yIG9iai5sb2cgb3Igb2JqLmpzb24gb3Igb2JqLnlhbWxcbiAgICAgICAgb2JqLmRhc2hsYW5nID0gdHJ1ZSBpZiBvYmouY3NzbGFuZyBvciBvYmouaXNzIG9yIG9iai5wdWdcbiAgICAgICAgb2JqLmRvdGxhbmcgID0gdHJ1ZSBpZiBvYmouY3BwbGFuZyBvciBvYmouanNsYW5nIG9yIG9iai5sb2dcbiAgICAgICAgb2JqLnhtbGxhbmcgID0gdHJ1ZSBpZiBvYmoueG1sIG9yIG9iai5odG1sIG9yIG9iai5wbGlzdFxuICAgICAgICBcbiAgICAgICAgZm9yIGNoYXIgaW4gdGV4dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouY2hhciA9PSAnXFxcXCdcbiAgICAgICAgICAgICAgICBpZiBvYmouZXNjcCBcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG9iai5lc2NwXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvYmouZXNjcCA9IHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBkZWxldGUgb2JqLmVzY3BcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5jaGFyID0gY2hhclxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouaW50ZXJwb2xhdGlvbiBhbmQgb2JqLmNoYXIgPT0gJ30nXG4gICAgICAgICAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIiN7b2JqLmludGVycG9sYXRpb259IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb2JqLnN0cmluZyA9XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiAgb2JqLmluZGV4KzFcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICBvYmouaW50ZXJwb2xhdGlvblxuICAgICAgICAgICAgICAgICAgICBtYXRjaDogICcnXG4gICAgICAgICAgICAgICAgb2JqLmluZGV4KytcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5zdHJpbmdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBTeW50YXguZG9TdHJpbmcgb2JqXG5cbiAgICAgICAgICAgIGVsc2UgaWYgb2JqLmNvbW1lbnRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBTeW50YXguZG9Db21tZW50IG9ialxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggY2hhclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIidcIiAnXCInICdgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3Qgb2JqLmVzY3AgYW5kIChjaGFyICE9IFwiJ1wiIG9yIG9iai5qc2xhbmcgb3Igb2JqLnB1ZylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc3RhcnRTdHJpbmcgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvUHVuY3Qgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnKycgJyonICc8JyAnPicgJz0nICdeJyAnficgJ0AnICckJyAnJicgJyUnICcjJyAnLycgJ1xcXFwnICc6JyAnLicgJzsnICcsJyAnIScgJz8nICd8JyAneycgJ30nICcoJyAnKScgJ1snICddJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZG9QdW5jdCBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB3aGVuICctJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmouZGFzaGxhbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZG9Xb3JkIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5kb1B1bmN0IG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnICcgJ1xcdCcgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5lbmRXb3JkIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgIyBzdGFydCBhIG5ldyB3b3JkIC8gY29udGludWUgdGhlIGN1cnJlbnQgd29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZG9Xb3JkIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgY2hhciBub3QgaW4gWycgJyAnXFx0J11cbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LmNvZmZlZUNhbGwgb2JqXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLmluZGV4KytcbiAgICAgICAgICBcbiAgICAgICAgb2JqLmNoYXIgPSBudWxsXG4gICAgICAgIFN5bnRheC5lbmRXb3JkIG9ialxuICAgICAgICBTeW50YXguZW5kTGluZSBvYmpcbiAgICAgICAgICAgIFxuICAgICAgICBvYmoucmdzXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgQGVuZFdvcmQ6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBjaGFyID0gb2JqLmNoYXIgPyAnJ1xuICAgICAgICBcbiAgICAgICAgb2JqLnR1cmQgKz0gY2hhciAjIGRvbid0IHVzZSA9IGhlcmUhXG5cbiAgICAgICAgc3dpdGNoIGNoYXJcbiAgICAgICAgICAgIHdoZW4gJyAnLCAnXFx0J1xuICAgICAgICAgICAgICAgIFN5bnRheC5kb1R1cmQgb2JqXG4gICAgICAgICAgICAgICAgaWYgb2JqLnJlZ2V4cD8gYW5kIG5vdCBvYmouZXNjcFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgb2JqLnJlZ2V4cCAjIGFib3J0IHJlZ2V4cCBvbiBmaXJzdCB1bmVzY2FwZWQgc3BhY2VcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLm5vb25cbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnR1cmQuZW5kc1dpdGggJyAgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZmlyc3Qob2JqLnJncyk/LnN0YXJ0ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9iai5yZ3MubGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc3Vic3RpdHV0ZSBvYmosIC1pbmRleC0xLCBbJ3RleHQnXSwgWydwcm9wZXJ0eSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdWJzdGl0dXRlIG9iaiwgLWluZGV4LTEsIFsncHVuY3R1YXRpb24nXSwgWydwcm9wZXJ0eSBwdW5jdHVhdGlvbiddXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgdmFsaWQgb2JqLndvcmRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd29yZCA9IG9iai53b3JkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai53b3Jkcy5wdXNoIHdvcmRcbiAgICAgICAgICAgIG9iai53b3JkID0gJydcblxuICAgICAgICAgICAgZ2V0VmFsdWUgPSAoYmFjaz0tMSkgICAgIC0+IFN5bnRheC5nZXRWYWx1ZSBvYmosIGJhY2sgXG4gICAgICAgICAgICBnZXRNYXRjaCA9IChiYWNrPS0xKSAgICAgLT4gU3ludGF4LmdldE1hdGNoIG9iaiwgYmFja1xuICAgICAgICAgICAgc2V0VmFsdWUgPSAoYmFjaywgdmFsdWUpIC0+IFN5bnRheC5zZXRWYWx1ZSBvYmosIGJhY2ssIHZhbHVlICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2V0Q2xhc3MgPSAoY2xzcykgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmouY29mZmVlIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgbGFzdChvYmoucmdzKT8ubWF0Y2ggPT0gJ0AnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjbHNzID09ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsc3MgPSAnbWVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdChvYmoucmdzKS52YWx1ZSA9IGNsc3MgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBvYmouanNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGNsc3MgPT0gJ2tleXdvcmQgZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgucmVwbGFjZSBvYmosIC0yLCBbe3dvcmQ6dHJ1ZX0sIHttYXRjaDonPSd9XSwgW3t2YWx1ZTonZnVuY3Rpb24nfV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleCAtIHdvcmQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiB3b3JkXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjbHNzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHZhbGlkIG9iai5maWxsXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIG9iai5maWxsLnZhbHVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzd2l0Y2ggY2hhclxuICAgICAgICAgICAgICAgIHdoZW4gJzonXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai5kaWN0bGFuZ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICB3aGVuICc9J1xuICAgICAgICAgICAgICAgICAgICBpZiBvYmouaW5pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBTeW50YXgudHVyZFtvYmouZXh0XVxuICAgICAgICAgICAgICAgIGxhc3RUdXJkID0gbGFzdCBvYmoubGFzdC5zcGxpdCAvXFxzKy9cbiAgICAgICAgICAgICAgICBpZiB0dXJkSW5mbyA9IFN5bnRheC50dXJkW29iai5leHRdW2xhc3RUdXJkXVxuICAgICAgICAgICAgICAgICAgICBpZiB0dXJkSW5mby5zcGFjZWQgIT0gdHJ1ZSBvciBvYmoubGFzdFtvYmoubGFzdC5sZW5ndGgtbGFzdFR1cmQubGVuZ3RoLTFdID09ICcgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHVyZEluZm9bJ3ctMSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLXR1cmRJbmZvLm1hdGNoLmxlbmd0aC0xLCB0dXJkSW5mb1sndy0xJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLnR1cmRJbmZvLm1hdGNoLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtaW5kZXgtMSwgdHVyZEluZm8udHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHVyZEluZm9bJ3ctMCddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIHR1cmRJbmZvWyd3LTAnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsY3dvcmQgPSB3b3JkLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgd29yZEluZm8gPSBTeW50YXgud29yZFtvYmouZXh0XT9bbGN3b3JkXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHdvcmRJbmZvWyd0LTEnXT8gYW5kIG9iai5sYXN0IGluIE9iamVjdC5rZXlzIHdvcmRJbmZvWyd0LTEnXVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgd29yZEluZm8udmFsdWUgKyAnICcgKyB3b3JkSW5mb1sndy0xJ11cbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsIHdvcmRJbmZvLnZhbHVlICsgJyAnICsgd29yZEluZm9bJ3QtMSddW29iai5sYXN0XVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3Mgd29yZEluZm8udmFsdWUgKyAnICcgKyB3b3JkSW5mby53b3JkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHdvcmRWYWx1ZSA9IFN5bnRheC5sYW5nW29iai5leHRdP1tsY3dvcmRdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgU3ludGF4LmluZm9bb2JqLmV4dF0/W3dvcmRWYWx1ZV0/XG4gICAgICAgICAgICAgICAgICAgIGZvciB2YWx1ZUluZm8gaW4gU3ludGF4LmluZm9bb2JqLmV4dF1bd29yZFZhbHVlXVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIG1hdGNoLG1hdGNoVmFsdWUgb2YgdmFsdWVJbmZvLmluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC50cmltKCkuZW5kc1dpdGggbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4ubWF0Y2gubGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEtaW5kZXgsIG1hdGNoVmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgbWF0Y2hWYWx1ZVxuICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyB3b3JkVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAgICAgICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouY29mZmVlXG4gICAgICAgICAgICAgICAgaWYgZ2V0TWF0Y2goLTEpIGluIFsnY2xhc3MnICdleHRlbmRzJ11cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdjbGFzcydcbiAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMSk/LmluZGV4T2Y/KCdwdW5jdHVhdGlvbicpIDwgMFxuICAgICAgICAgICAgICAgICAgICBpZiB3b3JkIG5vdCBpbiBbJ2Vsc2UnICd0aGVuJyAnYW5kJyAnb3InICdpbiddXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai5yZ3MpLnZhbHVlIG5vdCBpbiBbJ2tleXdvcmQnICdmdW5jdGlvbiBoZWFkJyAncmVxdWlyZScgJ251bWJlciddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdmdW5jdGlvbiBjYWxsJyAjIGNvZmZlZSBlbmRXb3JkIC0xIG5vIHB1bmN0dWF0aW9uIGFuZCB3b3JkICE9ICdlbHNlIC4uLidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgICAgICAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgICAgICAgICBpZiAvXjB4W2EtZkEtRlxcZF1bYS1mQS1GXFxkXVthLWZBLUZcXGRdKyQvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnbnVtYmVyIGhleCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ251bWJlciBoZXggcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZ2V0TWF0Y2goLTEpID09IFwiI1wiXG4gICAgICAgICAgICAgICAgaWYgL15bYS1mQS1GXFxkXSskLy50ZXN0IHdvcmRcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdudW1iZXIgaGV4IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmoubm9vblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai53b3Jkcy5sZW5ndGggPT0gMSBcbiAgICAgICAgICAgICAgICAgICAgaWYgZW1wdHkgb2JqLmxhc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBvYmouc2hcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoud29yZHMubGVuZ3RoID4gMSBhbmQgZ2V0TWF0Y2goLTEpID09ICctJyBhbmQgZ2V0VmFsdWUoLTIpID09ICdhcmd1bWVudCdcbiAgICAgICAgICAgICAgICAgICAgc2V0Q2xhc3MgLTEsICdhcmd1bWVudCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdhcmd1bWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuXG4gICAgICAgICAgICBpZiBvYmouY3BwbGFuZ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0ID09ICc6OidcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnJncy5sZW5ndGggPj0gM1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICduYW1lc3BhY2UnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3B1bmN0dWF0aW9uIG5hbWVzcGFjZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHVuY3R1YXRpb24gbmFtZXNwYWNlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2hhciA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Z1bmN0aW9uIGNhbGwnICMgY3BwIDo6d29yZCAoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIC9eW1xcXFxfQS1aXVtcXFxcX0EtWjAtOV0rJC8udGVzdCB3b3JkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbWFjcm8nXG5cbiAgICAgICAgICAgICAgICBpZiAgICAgIC9eW1VBXVtBLVpdXFx3KyQvLnRlc3Qod29yZCkgdGhlbiByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgY2xhc3MnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAvXltTRl1bQS1aXVxcdyskLy50ZXN0KHdvcmQpIHRoZW4gcmV0dXJuIHNldENsYXNzICd0eXBlIHN0cnVjdCdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIC9eW0VdW0EtWl1cXHcrJC8udGVzdCh3b3JkKSAgdGhlbiByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgZW51bSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICdjbGFzcycgaW4gb2JqLndvcmRzIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjaGFyID09ICc8J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgdGVtcGxhdGUnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0ID09ICc6OidcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTMpIGluIFsnZW51bScsICdjbGFzcycsICdzdHJ1Y3QnXVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nICdyZWFsbHk/J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xzcyA9IGdldFZhbHVlKC0zKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsIGdldFZhbHVlKC0zKSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgZ2V0VmFsdWUoLTMpICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCBnZXRWYWx1ZSgtMykgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgPT0gJy4nIGFuZCAvXlxcZCtmJC8udGVzdCh3b3JkKVxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdudW1iZXIgZmxvYXQgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoIFwiIyNcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdwdW5jdHVhdGlvbiBvcGVyYXRvcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwdW5jdHVhdGlvbiBvcGVyYXRvcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBvYmoubGFzdC5lbmRzV2l0aCAnLT4nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zLCAnb2JqJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGZpcnN0KG9iai53b3Jkcykuc3RhcnRzV2l0aCgnVScpIGFuZCBmaXJzdChvYmoucmdzKT8udmFsdWUgPT0gJ21hY3JvJ1xuICAgICAgICAgICAgICAgICAgICBpZiB3b3JkLnN0YXJ0c1dpdGggJ0JsdWVwcmludCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbWFjcm8gcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIGlmIHdvcmQudG9Mb3dlckNhc2UoKSBpbiBbJ21ldGEnICdkaXNwbGF5bmFtZScgJ2NhdGVnb3J5JyAnd29ybGRjb250ZXh0JyAnZWRpdGFueXdoZXJlJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbWFjcm8gcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIGlmIHdvcmQudG9Mb3dlckNhc2UoKSBpbiBbJ2NvbmZpZycgJ3RyYW5zaWVudCcgJ2VkaXRkZWZhdWx0c29ubHknICd2aXNpYmxlYW55d2hlcmUnICdub250cmFuc2FjdGlvbmFsJyAnaW50ZXJwJyAnZ2xvYmFsY29uZmlnJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbWFjcm8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAgICAgICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAgICAgICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgL15cXGQrJC8udGVzdCB3b3JkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgPT0gJy4nICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtNCkgPT0gJ251bWJlciBmbG9hdCcgYW5kIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTQsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ3NlbXZlciBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdzZW12ZXIgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnbnVtYmVyIGZsb2F0IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAgMDAwICBcbiAgICAgICAgICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmRvdGxhbmdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdCBpbiBbJy4nICc6J11cbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpIGluIFsndGV4dCcgJ21vZHVsZScgJ2NsYXNzJyAnbWVtYmVyJyAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ29iaicgaWYgZ2V0VmFsdWUoLTIpID09ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJygnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZnVuY3Rpb24gY2FsbCcgIyBkb3RsYW5nIC53b3JkIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoICcuJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJygnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZnVuY3Rpb24gY2FsbCcgIyBkb3RsYW5nIC5wcm9wZXJ0eSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcblxuICAgICAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC5sZW5ndGggPiAxIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoubGFzdFtvYmoubGFzdC5sZW5ndGgtMl0gaW4gWycpJyAnXSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmouY29mZmVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmxhc3Rbb2JqLmxhc3QubGVuZ3RoLTJdID09ICc/J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ29iaicgaWYgZ2V0VmFsdWUoLTMpID09ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ29wZXJhdG9yIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuXG4gICAgICAgICAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAgICAwMDAgICAgICAwMDAgMDAwICAgMDAwICAgICAgXG4gICAgICAgICAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgMDAwMDAgICAgMDAwICAgICAgXG4gICAgICAgICAgICAjICAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgXG4gICAgICAgICAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5jc3NsYW5nXG5cbiAgICAgICAgICAgICAgICBpZiB3b3JkLmVuZHNXaXRoICdzJ1xuICAgICAgICAgICAgICAgICAgICBpZiAvXFxkK3MvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB3b3JkLnNsaWNlKHdvcmQubGVuZ3RoLTIpIGluIFsncHgnICdlbScgJ2V4JyAnY2gnXVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouY3NzbGFuZyBvciBvYmoucHVnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QuZW5kc1dpdGggJy4nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnY2xhc3MgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoIFwiI1wiXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnY3NzaWQgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY3NzaWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNwcGxhbmcgb3Igb2JqLmpzXG4gICAgICAgICAgICAgICAgaWYgY2hhciA9PSAnKCcgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZnVuY3Rpb24gY2FsbCcgIyBjcHAgJiBqcyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3RleHQnXG4gICAgICAgIG51bGxcbiAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBAY29mZmVlQ2FsbDogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9iai5jb2ZmZWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLnR1cmQgPT0gJygnXG4gICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTIsICdmdW5jdGlvbiBjYWxsJyAjIGNvZmZlZSBjYWxsIChcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgb2JqLnR1cmQubGVuZ3RoID4gMSBhbmQgb2JqLnR1cmRbb2JqLnR1cmQubGVuZ3RoLTJdID09ICcgJ1xuICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnR1cmQpIGluICdAKy1cXCdcIihbeydcbiAgICAgICAgICAgICAgICAgICAgaWYgbGFzdChvYmoudHVyZCkgaW4gJystJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnRleHRbb2JqLmluZGV4KzFdID09ICcgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAjIGJhaWwgb3V0IGlmIG5leHQgY2hhcmFjdGVyIGlzIGEgc3BhY2UgKGNoZWF0ZXIhKVxuICAgICAgICAgICAgICAgICAgICB2YWwgPSBTeW50YXguZ2V0VmFsdWUgb2JqLCAtMlxuICAgICAgICAgICAgICAgICAgICBpZiB2YWxpZCh2YWwpIGFuZCB2YWwgbm90IGluIFsna2V5d29yZCcsICdmdW5jdGlvbiBoZWFkJywgJ3JlcXVpcmUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLmluZGV4T2YoJ3B1bmN0dWF0aW9uJykgPCAwIGFuZCBvYmoucmdzWy0yXS52YWx1ZSBub3QgaW4gWydudW1iZXInXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0yLCBcImZ1bmN0aW9uIGNhbGxcIiAjIGNvZmZlZSBjYWxsIEArLVxcJ1wiKFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBkb1dvcmQ6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB2YWxpZCBvYmoudHVyZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTeW50YXguZG9UdXJkIG9ialxuICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmoubGFzdCA9IG9iai50dXJkXG4gICAgICAgICAgICBvYmoudHVyZCA9ICcnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBvYmoud29yZCArPSBvYmouY2hhclxuICAgICAgICBcbiAgICAgICAgbnVsbFxuXG4gICAgQGRvVHVyZDogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBvYmouZmlsbCBhbmQgb2JqLndvcmRzLmxlbmd0aD09MCBhbmQgU3ludGF4LmZpbGxbb2JqLmV4dF0/W29iai50dXJkXT9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLmZpbGwgPSBTeW50YXguZmlsbFtvYmouZXh0XT9bb2JqLnR1cmRdXG4gICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5vYmoudHVyZC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgaWYgb2JqLmZpbGwudHVyZFxuICAgICAgICAgICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCAtMS1pbmRleCwgb2JqLmZpbGwudHVyZFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTEtaW5kZXgsIG9iai5maWxsLnZhbHVlICsgJyAnICsgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQGRvUHVuY3Q6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBTeW50YXguZW5kV29yZCBvYmpcbiAgICAgICAgXG4gICAgICAgIGdldFZhbHVlID0gKGJhY2s9LTEpICAgICAtPiBTeW50YXguZ2V0VmFsdWUgb2JqLCBiYWNrIFxuICAgICAgICBzZXRWYWx1ZSA9IChiYWNrLCB2YWx1ZSkgLT4gU3ludGF4LnNldFZhbHVlIG9iaiwgYmFjaywgdmFsdWUgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICB2YWx1ZSA9ICdwdW5jdHVhdGlvbidcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBvYmouY2hhclxuICAgICAgICAgICAgd2hlbiAnOidcbiAgICAgICAgICAgICAgICBpZiBvYmouZGljdGxhbmcgYW5kIG9iai50dXJkLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnJncyk/LnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ2RpY3Rpb25hcnkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBvYmouY29mZmVlICMga29mZmVlIGNvbnN0cnVjdG9yIHNob3J0Y3V0XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ21ldGhvZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ21ldGhvZCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIHdoZW4gJz4nXG4gICAgICAgICAgICAgICAgaWYgb2JqLmpzbGFuZ1xuICAgICAgICAgICAgICAgICAgICBmb3IgW3R1cmQsIHZhbF0gaW4gW1snLT4nLCAnJ10sIFsnPT4nLCAnIGJvdW5kJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoudHVyZC5lbmRzV2l0aCB0dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnN1YnN0aXR1dGUgb2JqLCAtMywgWydkaWN0aW9uYXJ5IGtleScsICdkaWN0aW9uYXJ5IHB1bmN0dWF0aW9uJ10sIFsnbWV0aG9kJywgJ21ldGhvZCBwdW5jdHVhdGlvbiddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnN1cnJvdW5kICAgb2JqLCAtMSwgc3RhcnQ6JygnLCBhZGQ6J2FyZ3VtZW50JywgZW5kOicpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5yZXBsYWNlICAgIG9iaiwgLTMsIFt7d29yZDp0cnVlLCBpZ25vcmU6J2FyZ3VtZW50J30sIHttYXRjaDonPSd9XSwgW3t2YWx1ZTonZnVuY3Rpb24nfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2Z1bmN0aW9uIHRhaWwnICsgdmFsICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdmdW5jdGlvbiBoZWFkJyArIHZhbCArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBvYmoueG1sbGFuZyBvciBvYmoubWRcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnR1cmQuZW5kc1dpdGggJy8+J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdrZXl3b3JkIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdrZXl3b3JkIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgd2hlbiAnLydcbiAgICAgICAgICAgICAgICBpZiBvYmouanNsYW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBvYmouZXNjcFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnJlZ2V4cD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gW29iai5yZ3MubGVuZ3RoLTEuLjBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5yZ3NbaW5kZXhdLnN0YXJ0IDwgb2JqLnJlZ2V4cFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnJnc1tpbmRleF0udmFsdWUgPSAncmVnZXhwICcgKyBvYmoucmdzW2luZGV4XS52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ3JlZ2V4cCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmoucmVnZXhwID0gb2JqLmluZGV4ICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgbXRjaCA9IFN5bnRheC5tdGNoW29iai5leHRdP1tvYmouY2hhcl1cbiAgICAgICAgICAgIGlmIG1hdGNoVmFsdWUgPSBTeW50YXguZG9NYXRjaCBvYmosIG10Y2hcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG1hdGNoVmFsdWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgb2JqLmZpbGwgdGhlbiB2YWx1ZSA9IG9iai5maWxsLnZhbHVlICsgJyAnICsgdmFsdWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICBzdGFydDogb2JqLmluZGV4XG4gICAgICAgICAgICBtYXRjaDogb2JqLmNoYXJcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuXG4gICAgICAgIFN5bnRheC5jaGVja0NvbW1lbnQgb2JqXG4gICAgICAgIFxuICAgICMjI1xuICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMjI1xuICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBjaGVja0NvbW1lbnQ6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgU3ludGF4LmluZm9bb2JqLmV4dF0/LmNvbW1lbnRcbiAgICAgICAgcmV0dXJuIGlmIG9iai5yZWdleHA/XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY29tbWVudCA9IFN5bnRheC5pbmZvW29iai5leHRdLmNvbW1lbnRcbiAgICAgICAgXG4gICAgICAgIGlmIGNvbW1lbnQubGluZSBhbmQgb2JqLnR1cmQuZW5kc1dpdGgoY29tbWVudC5saW5lKSBhbmQgbm90IG9iai50dXJkLmVuZHNXaXRoKCdcXFxcJytjb21tZW50LmxpbmUpIGFuZCBlbXB0eShvYmoud29yZHMpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFN5bnRheC5zdGFydENvbW1lbnQgb2JqLCBjb21tZW50LmxpbmVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjb21tZW50LnRhaWwgYW5kIG9iai50dXJkLmVuZHNXaXRoKGNvbW1lbnQudGFpbCkgYW5kIG5vdCBvYmoudHVyZC5lbmRzV2l0aCgnXFxcXCcrY29tbWVudC50YWlsKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTeW50YXguc3RhcnRDb21tZW50IG9iaiwgY29tbWVudC50YWlsXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBjb21tZW50LnN0YXJ0IGFuZCBvYmoudHVyZC5lbmRzV2l0aChjb21tZW50LnN0YXJ0KSBhbmQgbm90IG9iai50dXJkLmVuZHNXaXRoKCdcXFxcJytjb21tZW50LnN0YXJ0KVxuXG4gICAgICAgICAgICBTeW50YXguc3RhcnRDb21tZW50IG9iaiwgY29tbWVudC5zdGFydFxuICAgICAgICAgICAgXG4gICAgICAgIG51bGxcblxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc3RhcnRDb21tZW50OiAob2JqLCBzdGFydCkgLT5cbiAgICAgICAgXG4gICAgICAgIG9iai5jb21tZW50ID1cbiAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXgrMVxuICAgICAgICAgICAgbWF0Y2g6ICcnXG4gICAgICAgICAgICB2YWx1ZTogJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIGluZGV4IGluIFswLi4uc3RhcnQubGVuZ3RoXVxuICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTEtaW5kZXgsICdjb21tZW50IHB1bmN0dWF0aW9uJ1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwIFxuICAgIFxuICAgIEBkb0NvbW1lbnQ6IChvYmopIC0+XG5cbiAgICAgICAgY29tbWVudCA9IFN5bnRheC5pbmZvW29iai5leHRdLmNvbW1lbnRcbiAgICAgICAgXG4gICAgICAgIGlmIGNvbW1lbnQuZW5kIGFuZCBvYmoudHVyZC5lbmRzV2l0aChjb21tZW50LmVuZClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5jb21tZW50XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouY29tbWVudFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5jb21tZW50LmVuZC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTEtaW5kZXgsICdjb21tZW50IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcblxuICAgICAgICAgICAgU3ludGF4LmNvbnQgb2JqLCAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjXG4gICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMjI1xuICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc3RhcnRTdHJpbmc6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBTeW50YXguZW5kV29yZCBvYmpcbiAgICAgICAgXG4gICAgICAgIHN0cmluZ1R5cGUgPSBzd2l0Y2ggb2JqLmNoYXJcbiAgICAgICAgICAgIHdoZW4gXCInXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgIHdoZW4gJ1wiJyB0aGVuICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgd2hlbiAnYCcgdGhlbiAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBzdHJpbmdUeXBlXG4gICAgICAgICAgICBrZXJyb3IgXCJubyBzdHJpbmcgY2hhciAnI3tvYmouY2hhcn0nXCJcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICB2YWx1ZTogXCIje3N0cmluZ1R5cGV9IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBvYmouc3RyaW5nID1cbiAgICAgICAgICAgIHZhbHVlOiAgc3RyaW5nVHlwZVxuICAgICAgICAgICAgc3RhcnQ6ICBvYmouaW5kZXgrMVxuICAgICAgICAgICAgbWF0Y2g6ICAnJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBudWxsXG5cbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwIFxuICAgIFxuICAgIEBkb1N0cmluZzogKG9iaikgLT5cblxuICAgICAgICBpZiBvYmouY29mZmVlIFxuICAgICAgICAgICAgaWYgb2JqLmNoYXIgPT0gJ3snIGFuZCBvYmouc3RyaW5nLnZhbHVlICE9ICdzdHJpbmcgc2luZ2xlJyBhbmQgb2JqLnN0cmluZy5tYXRjaC5lbmRzV2l0aCBcIiNcIlxuICAgICAgICAgICAgICAgIG9iai5pbnRlcnBvbGF0aW9uID0gb2JqLnN0cmluZy52YWx1ZVxuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIiN7b2JqLmludGVycG9sYXRpb259IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWxldGUgb2JqLnN0cmluZ1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgc3RyaW5nVHlwZSA9IHN3aXRjaCBvYmouY2hhclxuICAgICAgICAgICAgd2hlbiBcIidcIiB0aGVuICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnXG4gICAgICAgICAgICB3aGVuICdgJyB0aGVuICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgb2JqLmVzY3AgYW5kIG9iai5zdHJpbmcudmFsdWUgPT0gc3RyaW5nVHlwZVxuXG4gICAgICAgICAgICBpZiB2YWxpZCBvYmouc3RyaW5nLm1hdGNoLnRyaW0oKVxuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBkZWxldGUgb2JqLnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXhcbiAgICAgICAgICAgICAgICBtYXRjaDogb2JqLmNoYXJcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCIje3N0cmluZ1R5cGV9IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTeW50YXguY29udCBvYmosICdzdHJpbmcnXG4gICAgICAgICAgICBcbiAgICAgICAgbnVsbFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQGNvbnQ6IChvYmosIGtleSkgLT5cbiAgICAgICAgXG4gICAgICAgIHN0ck9yQ210ID0gb2JqW2tleV1cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBvYmouY2hhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnICcsICdcXHQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RyT3JDbXQubWF0Y2ggPT0gJydcbiAgICAgICAgICAgICAgICAgICAgc3RyT3JDbXQuc3RhcnQgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoIHN0ck9yQ210IGlmIHZhbGlkIHN0ck9yQ210Lm1hdGNoXG4gICAgICAgICAgICAgICAgICAgIG9ialtrZXldID0gXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogb2JqLmluZGV4KzFcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHN0ck9yQ210LnZhbHVlXG4gICAgICAgICAgICBlbHNlIFxuXG4gICAgICAgICAgICAgICAgc3RyT3JDbXQubWF0Y2ggKz0gb2JqLmNoYXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQGVuZExpbmU6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvYmouc3RyaW5nXG4gICAgICAgICAgICBpZiBvYmouanNsYW5nIG9yIG9iai5jcHBsYW5nXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5zdHJpbmdcbiAgICAgICAgZWxzZSBpZiBvYmouY29tbWVudFxuICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5jb21tZW50XG4gICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQGdldE1hdGNoOiAob2JqLCBiYWNrKSAgICAgICAgLT4gaWYgYmFjayA8IDAgdGhlbiBvYmoucmdzW29iai5yZ3MubGVuZ3RoK2JhY2tdPy5tYXRjaCBlbHNlIG9iai5yZ3NbYmFja10/Lm1hdGNoXG4gICAgQGdldFZhbHVlOiAob2JqLCBiYWNrKSAgICAgICAgLT4gaWYgYmFjayA8IDAgdGhlbiBvYmoucmdzW29iai5yZ3MubGVuZ3RoK2JhY2tdPy52YWx1ZSBlbHNlIG9iai5yZ3NbYmFja10/LnZhbHVlICAgICBcbiAgICBAc2V0VmFsdWU6IChvYmosIGJhY2ssIHZhbHVlKSAtPiBcbiAgICAgICAgaWYgYmFjayA8IDBcbiAgICAgICAgICAgIGJhY2sgPSBvYmoucmdzLmxlbmd0aCtiYWNrXG4gICAgICAgIGlmIGJhY2sgPCBvYmoucmdzLmxlbmd0aCBhbmQgYmFjayA+PSAwXG4gICAgICAgICAgICBvYmoucmdzW2JhY2tdLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgIGlmIG9iai5jb2ZmZWUgYW5kIG9iai5yZ3NbYmFjay0xXT9cbiAgICAgICAgICAgICAgICBpZiBvYmoucmdzW2JhY2stMV0/Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgICAgICAgICBvYmoucmdzW2JhY2stMV0udmFsdWUgPSB2YWx1ZSArICcgcHVuY3R1YXRpb24nXG5cbiAgICBAYWRkVmFsdWU6IChvYmosIGJhY2ssIHZhbHVlKSAtPiBcbiAgICAgICAgaWYgYmFjayA8IDBcbiAgICAgICAgICAgIGJhY2sgPSBvYmoucmdzLmxlbmd0aCtiYWNrXG4gICAgICAgIGlmIGJhY2sgPCBvYmoucmdzLmxlbmd0aCBhbmQgYmFjayA+PSAwXG4gICAgICAgICAgICBmb3IgdmFsIGluIHZhbHVlLnNwbGl0IC9cXHMrL1xuICAgICAgICAgICAgICAgIGlmIHZhbCBub3QgaW4gb2JqLnJnc1tiYWNrXS52YWx1ZS5zcGxpdCAvXFxzKy9cbiAgICAgICAgICAgICAgICAgICAgb2JqLnJnc1tiYWNrXS52YWx1ZSA9IHZhbCArICcgJyArIG9iai5yZ3NbYmFja10udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAc3Vic3RpdHV0ZTogKG9iaiwgYmFjaywgb2xkVmFscywgbmV3VmFscykgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9sZFZhbHMubGVuZ3RoXVxuICAgICAgICAgICAgdmFsID0gU3ludGF4LmdldFZhbHVlIG9iaiwgYmFjaytpbmRleFxuICAgICAgICAgICAgaWYgdmFsICE9IG9sZFZhbHNbaW5kZXhdXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgaW5kZXggPT0gb2xkVmFscy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9sZFZhbHMubGVuZ3RoXVxuICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIGJhY2sraW5kZXgsIG5ld1ZhbHNbaW5kZXhdXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvYmoucmdzLmxlbmd0aCArIGJhY2stMSA+PSAwXG4gICAgICAgICAgICBTeW50YXguc3Vic3RpdHV0ZSBvYmosIGJhY2stMSwgb2xkVmFscywgbmV3VmFsc1xuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEByZXBsYWNlOiAob2JqLCBiYWNrLCBvbGRPYmpzLCBuZXdPYmpzKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG9iai5yZ3MubGVuZ3RoK2JhY2sgPCAwXG4gICAgICAgIFxuICAgICAgICBhZHZhbmNlID0gLT5cbiAgICAgICAgICAgIGlmIG9iai5yZ3MubGVuZ3RoICsgYmFjay0xID49IDBcbiAgICAgICAgICAgICAgICBTeW50YXgucmVwbGFjZSBvYmosIGJhY2stMSwgb2xkT2JqcywgbmV3T2Jqc1xuXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9sZE9ianMubGVuZ3RoXVxuICAgICAgICAgICAgYmFja09iaiA9IG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgrYmFjaytpbmRleF1cbiAgICAgICAgICAgIOKWuGFzc2VydCBiYWNrT2JqXG4gICAgICAgICAgICBpZiBvbGRPYmpzW2luZGV4XS5pZ25vcmVcbiAgICAgICAgICAgICAgICBpZiBiYWNrT2JqLnZhbHVlPy5pbmRleE9mPyhvbGRPYmpzW2luZGV4XS5pZ25vcmUpID49IDBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkdmFuY2UoKVxuICAgICAgICAgICAgZm9yIGtleSBpbiBPYmplY3Qua2V5cyBvbGRPYmpzW2luZGV4XVxuICAgICAgICAgICAgICAgIHN3aXRjaCBrZXkgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ3dvcmQnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBiYWNrT2JqLnZhbHVlPy5pbmRleE9mPygncHVuY3R1YXRpb24nKSA+PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkdmFuY2UoKVxuICAgICAgICAgICAgICAgICAgICB3aGVuICdpZ25vcmUnIHRoZW5cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9sZE9ianNbaW5kZXhdW2tleV0gIT0gYmFja09ialtrZXldXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkdmFuY2UoKVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIGluZGV4IGluIFswLi4ubmV3T2Jqcy5sZW5ndGhdXG4gICAgICAgICAgICBiYWNrT2JqID0gb2JqLnJnc1tvYmoucmdzLmxlbmd0aCtiYWNrK2luZGV4XVxuICAgICAgICAgICAgZm9yIGtleSBpbiBPYmplY3Qua2V5cyBuZXdPYmpzW2luZGV4XVxuICAgICAgICAgICAgICAgIGJhY2tPYmpba2V5XSA9IG5ld09ianNbaW5kZXhdW2tleV1cbiAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBkb01hdGNoOiAob2JqLCBtdGNocykgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBtdGNoIGluIG10Y2hzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN0YXJ0TGVuZ3RoID0gbXRjaC5zdGFydD8ubGVuZ3RoID8gMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtdGNoLnNpbmdsZSBcbiAgICAgICAgICAgICAgICBpZiBvYmoudGV4dFtvYmouaW5kZXgrMV0gPT0gbXRjaC5lbmRcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai5yZ3MpPy5tYXRjaCA9PSBtdGNoLmVuZFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmoucmdzLmxlbmd0aC1tdGNoLmVuZC5sZW5ndGgtc3RhcnRMZW5ndGggPCAwXG4gICAgICAgICAgICAgICAgY29udGludWUgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVuZE1hdGNoZXMgPSB0cnVlXG4gICAgICAgICAgICBmb3IgZW5kSW5kZXggaW4gWzEuLi5tdGNoLmVuZC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgaWYgb2JqLnJnc1tvYmoucmdzLmxlbmd0aC1lbmRJbmRleF0ubWF0Y2ggIT0gbXRjaC5lbmRbbXRjaC5lbmQubGVuZ3RoLWVuZEluZGV4XVxuICAgICAgICAgICAgICAgICAgICBlbmRNYXRjaGVzID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGlmIG5vdCBlbmRNYXRjaGVzXG4gICAgICAgICAgICAgICAgY29udGludWUgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtdGNoLnNwYWNlZCA9PSBmYWxzZVxuICAgICAgICAgICAgICAgIGlmIG9iai50dXJkLmluZGV4T2YoJyAnKSA+PSAwXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBtdGNoLnN0YXJ0XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIHN0YXJ0SW5kZXggaW4gW29iai5yZ3MubGVuZ3RoLXN0YXJ0TGVuZ3RoLW10Y2guZW5kLmxlbmd0aC4uMF1cbiAgICAgICAgICAgICAgICAgICAgc3RhcnRNYXRjaGVzID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5zdGFydExlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIFN5bnRheC5nZXRNYXRjaChvYmosIHN0YXJ0SW5kZXgraW5kZXgpICE9IG10Y2guc3RhcnRbaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRNYXRjaGVzID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBicmVhayBpZiBzdGFydE1hdGNoZXNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RhcnRJbmRleCA+PSAwXG4gICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbc3RhcnRJbmRleC4uLnN0YXJ0SW5kZXgrc3RhcnRMZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCBpbmRleCwgbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbc3RhcnRJbmRleCtzdGFydExlbmd0aC4uLm9iai5yZ3MubGVuZ3RoLW10Y2guZW5kLmxlbmd0aCsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmFkZFZhbHVlIG9iaiwgaW5kZXgsIG10Y2gudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFtvYmoucmdzLmxlbmd0aC1tdGNoLmVuZC5sZW5ndGgrMS4uLm9iai5yZ3MubGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmFkZFZhbHVlIG9iaiwgaW5kZXgsIG10Y2gudmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG10Y2gudmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCAtMSwgbXRjaC52YWx1ZVxuICAgICAgICAgICAgICAgIGluZGV4ID0gLTJcbiAgICAgICAgICAgICAgICB3aGlsZSBTeW50YXguZ2V0TWF0Y2gob2JqLCBpbmRleCkgPT0gJy0nXG4gICAgICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIGluZGV4LCBtdGNoLnZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LmFkZFZhbHVlIG9iaiwgaW5kZXgtMSwgbXRjaC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBpbmRleCAtPSAyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG10Y2gudmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICBudWxsXG4gICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgQHN1cnJvdW5kOiAob2JqLCBiYWNrLCByYW5nZSkgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBvYmoucmdzLmxlbmd0aC0xK2JhY2sgPD0gMVxuICAgICAgICBmb3IgZW5kSW5kZXggaW4gW29iai5yZ3MubGVuZ3RoLTErYmFjay4uMF1cbiAgICAgICAgICAgIGlmIGVuZEluZGV4ID49IG9iai5yZ3MubGVuZ3RoIG9yIGVuZEluZGV4IDwgMFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgaWYgbm90IG9iai5yZ3NbZW5kSW5kZXhdP1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgaWYgcmFuZ2UuZW5kID09IG9iai5yZ3NbZW5kSW5kZXhdPy5tYXRjaFxuICAgICAgICAgICAgICAgIGZvciBzdGFydEluZGV4IGluIFtlbmRJbmRleC0xLi4wXVxuICAgICAgICAgICAgICAgICAgICBpZiByYW5nZS5zdGFydCA9PSBvYmoucmdzW3N0YXJ0SW5kZXhdPy5tYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGFkZEluZGV4IGluIFtzdGFydEluZGV4KzEuLi5lbmRJbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmoucmdzW2FkZEluZGV4XS52YWx1ZSA9IHJhbmdlLmFkZCArICcgJyArIG9iai5yZ3NbYWRkSW5kZXhdLnZhbHVlXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTeW50YXhcbiJdfQ==
//# sourceURL=../coffee/syntax.coffee