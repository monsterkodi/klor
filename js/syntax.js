// koffee 0.43.0

/*
 0000000  000   000  000   000  000000000   0000000   000   000
000        000 000   0000  000     000     000   000   000 000 
0000000     00000    000 0 000     000     000000000    00000  
     000     000     000  0000     000     000   000   000 000 
0000000      000     000   000     000     000   000  000   000
 */
var Syntax, _, empty, first, kerror, klog, last, noon, ref, slash, valid,
    indexOf = [].indexOf;

ref = require('kxk'), noon = ref.noon, slash = ref.slash, first = ref.first, valid = ref.valid, empty = ref.empty, last = ref.last, klog = ref.klog, kerror = ref.kerror, _ = ref._;

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

    Syntax.makeObj = function(text, ext) {
        return {
            ext: ext != null ? ext : 'txt',
            rgs: [],
            words: [],
            word: '',
            turd: '',
            last: '',
            index: 0,
            text: text
        };
    };

    Syntax.ranges = function(text, ext) {
        var char, i, len, obj;
        Syntax.init();
        obj = Syntax.makeObj(text, ext);
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
                console.log('[33m[93msyntax[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m907[39m', '[1m[97massertion failure![39m[22m');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxvRUFBQTtJQUFBOztBQVFBLE1BQThELE9BQUEsQ0FBUSxLQUFSLENBQTlELEVBQUUsZUFBRixFQUFRLGlCQUFSLEVBQWUsaUJBQWYsRUFBc0IsaUJBQXRCLEVBQTZCLGlCQUE3QixFQUFvQyxlQUFwQyxFQUEwQyxlQUExQyxFQUFnRCxtQkFBaEQsRUFBd0Q7O0FBQW1COztBQWNyRTs7O0lBRUYsTUFBQyxDQUFBLElBQUQsR0FBUTs7SUFDUixNQUFDLENBQUEsSUFBRCxHQUFROztJQVFSLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtBQUVILFlBQUE7UUFBQSxJQUFVLE1BQU0sQ0FBQyxJQUFQLEtBQWUsSUFBekI7QUFBQSxtQkFBQTs7UUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQVgsRUFBc0IsSUFBdEIsRUFBMEIsUUFBMUIsRUFBa0MsV0FBbEMsQ0FBVjtRQUVQLE1BQU0sQ0FBQyxJQUFQLEdBQWM7UUFDZCxNQUFNLENBQUMsSUFBUCxHQUFjO1FBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztRQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7UUFDZCxNQUFNLENBQUMsSUFBUCxHQUFjO1FBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztBQUVkO2FBQUEsZ0JBQUE7Ozs7QUFDSTtBQUFBO3FCQUFBLHNDQUFBOztvQkFFSSxJQUF5QixhQUFXLE1BQU0sQ0FBQyxJQUFsQixFQUFBLEdBQUEsS0FBekI7d0JBQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLEdBQWpCLEVBQUE7Ozs0QkFFWSxDQUFBLEdBQUE7OzRCQUFBLENBQUEsR0FBQSxJQUFROzs7O0FBQ3BCOzZCQUFBLG1CQUFBOzs0QkFFSSxJQUFHLEtBQUEsS0FBUyxTQUFaOzt5Q0FDZ0IsQ0FB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Q0FBbkM7QUFBQSxtQkFBQTs7QUFDQSxhQUFnQiw4R0FBaEI7WUFDSSxJQUFHLFFBQUEsSUFBWSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQXBCLElBQThCLFFBQUEsR0FBVyxDQUE1QztBQUNJLHVCQURKOztZQUVBLElBQU8seUJBQVA7QUFDSSx1QkFESjs7WUFFQSxJQUFHLEtBQUssQ0FBQyxHQUFOLCtDQUE4QixDQUFFLGVBQW5DO0FBQ0kscUJBQWtCLHFHQUFsQjtvQkFDSSxJQUFHLEtBQUssQ0FBQyxLQUFOLGlEQUFrQyxDQUFFLGVBQXZDO0FBQ0ksNkJBQWdCLDhIQUFoQjs0QkFDSSxHQUFHLENBQUMsR0FBSSxDQUFBLFFBQUEsQ0FBUyxDQUFDLEtBQWxCLEdBQTBCLEtBQUssQ0FBQyxHQUFOLEdBQVksR0FBWixHQUFrQixHQUFHLENBQUMsR0FBSSxDQUFBLFFBQUEsQ0FBUyxDQUFDO0FBRGxFLHlCQURKOztBQURKLGlCQURKOztBQUxKO0lBSE87Ozs7OztBQWNmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwIFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgXG4gICAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCBcbjAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgbm9vbiwgc2xhc2gsIGZpcnN0LCB2YWxpZCwgZW1wdHksIGxhc3QsIGtsb2csIGtlcnJvciwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG7ilrhkb2MgJ3N5bnRheCdcblxuICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgIFN5bnRheC5yYW5nZXMgdGV4dGxpbmUsIGV4dFxuICAgIGBgYFxuICAgIFxuICAgIHRleHRsaW5lIHNob3VsZCAqKm5vdCoqIGNvbnRhaW4gbmV3bGluZXMuIFxuICAgIG9wdGltaXplZCB0byBydW4gZmFzdCBvbiBzaG9ydGVyIGlucHV0cy5cblxuY2xhc3MgU3ludGF4XG5cbiAgICBAZXh0cyA9IFtdIFxuICAgIEBsYW5nID0gbnVsbFxuICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQGluaXQ6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgU3ludGF4LmxhbmcgIT0gbnVsbFxuICAgICAgICBcbiAgICAgICAgZGF0YSA9IG5vb24ubG9hZCBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJydjb2ZmZWUnJ2xhbmcubm9vbidcbiAgICAgICAgXG4gICAgICAgIFN5bnRheC5sYW5nID0ge31cbiAgICAgICAgU3ludGF4LmluZm8gPSB7fVxuICAgICAgICBTeW50YXgubXRjaCA9IHt9XG4gICAgICAgIFN5bnRheC5maWxsID0ge31cbiAgICAgICAgU3ludGF4LndvcmQgPSB7fVxuICAgICAgICBTeW50YXgudHVyZCA9IHt9XG4gICAgICAgIFxuICAgICAgICBmb3IgZXh0TmFtZXMsdmFsdWVXb3JkcyBvZiBkYXRhXG4gICAgICAgICAgICBmb3IgZXh0IGluIGV4dE5hbWVzLnNwbGl0IC9cXHMvXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBTeW50YXguZXh0cy5wdXNoKGV4dCkgaWYgZXh0IG5vdCBpbiBTeW50YXguZXh0c1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmxhbmdbZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgIGZvciB2YWx1ZSx3b3JkcyBvZiB2YWx1ZVdvcmRzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiB2YWx1ZSA9PSAnY29tbWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5pbmZvW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5pbmZvW2V4dF1bdmFsdWVdID0gd29yZHNcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiB2YWx1ZSA9PSAnbWF0Y2gnXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgdmFsdWUsbXRjaEluZm8gb2Ygd29yZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoSW5mby5maWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5maWxsW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRjaEluZm8udmFsdWUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZmlsbFtleHRdW210Y2hJbmZvLmZpbGxdID0gbXRjaEluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIG10Y2hJbmZvLmVuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubXRjaFtleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5tdGNoW2V4dF1bbGFzdCBtdGNoSW5mby5lbmRdID89IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG10Y2hJbmZvLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4Lm10Y2hbZXh0XVtsYXN0IG10Y2hJbmZvLmVuZF0ucHVzaCBtdGNoSW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbXRjaEluZm8udHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgudHVyZFtleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG10Y2hJbmZvLm1hdGNoID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnR1cmRbZXh0XVt2YWx1ZV0gPSBtdGNoSW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LndvcmRbZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGNoSW5mby52YWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC53b3JkW2V4dF1bdmFsdWVdID0gbXRjaEluZm9cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbm90IF8uaXNBcnJheSB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB3b3JkLGluZm8gb2Ygd29yZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgaW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmluZm9bZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmluZm9bZXh0XVt2YWx1ZV0gPz0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5pbmZvW2V4dF1bdmFsdWVdLnB1c2ggXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZDogICBpZiB3b3JkWzBdID09ICd0JyB0aGVuICd0dXJkJyBlbHNlICd3b3JkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldDogcGFyc2VJbnQgd29yZC5zbGljZSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mbzogICBpbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5sYW5nW2V4dF1bd29yZF0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHdvcmQgaW4gd29yZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmxhbmdbZXh0XVt3b3JkXSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAjIGxvZyBzdHIgU3ludGF4Lm10Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgQG1ha2VPYmo6ICh0ZXh0LCBleHQpIC0+XG4gICAgICAgIFxuICAgICAgICBleHQ6ICAgIGV4dCA/ICd0eHQnIFxuICAgICAgICByZ3M6ICAgIFtdICAgIyBsaXN0IG9mIHJhbmdlcyAocmVzdWx0KVxuICAgICAgICB3b3JkczogIFtdICAgIyBlbmNvdW50ZXJlZCB3b3Jkc1xuICAgICAgICB3b3JkOiAgICcnICAgIyBjdXJyZW50bHkgcGFyc2VkIHdvcmRcbiAgICAgICAgdHVyZDogICAnJyAgICMgY3VycmVudGx5IHBhcnNlZCBzdHVmZiBpbmJldHdlZW4gd29yZHMgXG4gICAgICAgIGxhc3Q6ICAgJycgICAjIHRoZSB0dXJkIGJlZm9yZSB0aGUgY3VycmVudC9sYXN0LWNvbXBsZXRlZCB3b3JkXG4gICAgICAgIGluZGV4OiAgMCBcbiAgICAgICAgdGV4dDogICB0ZXh0XG4gICAgXG4gICAgQHJhbmdlczogKHRleHQsIGV4dCkgLT5cbiAgICAgICAgXG4gICAgICAgIFN5bnRheC5pbml0KClcbiAgICAgICAgXG4gICAgICAgIG9iaiA9IFN5bnRheC5tYWtlT2JqIHRleHQsIGV4dFxuICAgICAgICAgICAgXG4gICAgICAgIHN3aXRjaCBvYmouZXh0XG4gICAgICAgICAgICB3aGVuICdjcHAnICdocHAnICdjJyAnaCcgJ2NjJyAnY3h4JyAnY3MnXG4gICAgICAgICAgICAgICAgb2JqLmNwcGxhbmcgID0gdHJ1ZVxuICAgICAgICAgICAgICAgIG9iai5jcHAgICAgICA9IHRydWVcbiAgICAgICAgICAgIHdoZW4gJ2NvZmZlZScgJ2tvZmZlZScgJ2pzJyAndHMnXG4gICAgICAgICAgICAgICAgb2JqLmpzbGFuZyAgID0gdHJ1ZVxuICAgICAgICAgICAgICAgIG9ialtvYmouZXh0XSA9IHRydWVcbiAgICAgICAgICAgICAgICBvYmouY29mZmVlICAgPSB0cnVlIGlmIG9iai5leHQgaXMgJ2tvZmZlZSdcbiAgICAgICAgICAgICAgICBvYmouanMgICAgICAgPSB0cnVlIGlmIG9iai5leHQgaXMgJ3RzJ1xuICAgICAgICAgICAgd2hlbiAnaHRtbCcgJ2h0bSdcbiAgICAgICAgICAgICAgICBvYmouaHRtbCAgICAgPSB0cnVlXG4gICAgICAgICAgICB3aGVuICd5YW1sJyAneW1sJ1xuICAgICAgICAgICAgICAgIG9iai55YW1sICAgICA9IHRydWVcbiAgICAgICAgICAgIHdoZW4gJ2NzcycgJ3N0eWwnICdzY3NzJyAnc2FzcydcbiAgICAgICAgICAgICAgICBvYmouY3NzbGFuZyAgPSB0cnVlXG4gICAgICAgICAgICAgICAgb2JqW29iai5leHRdID0gdHJ1ZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG9ialtvYmouZXh0XSA9IHRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgb2JqLmRpY3RsYW5nID0gdHJ1ZSBpZiBvYmouanNsYW5nIG9yIG9iai5pc3Mgb3Igb2JqLmxvZyBvciBvYmouanNvbiBvciBvYmoueWFtbFxuICAgICAgICBvYmouZGFzaGxhbmcgPSB0cnVlIGlmIG9iai5jc3NsYW5nIG9yIG9iai5pc3Mgb3Igb2JqLnB1Z1xuICAgICAgICBvYmouZG90bGFuZyAgPSB0cnVlIGlmIG9iai5jcHBsYW5nIG9yIG9iai5qc2xhbmcgb3Igb2JqLmxvZ1xuICAgICAgICBvYmoueG1sbGFuZyAgPSB0cnVlIGlmIG9iai54bWwgb3Igb2JqLmh0bWwgb3Igb2JqLnBsaXN0XG4gICAgICAgIFxuICAgICAgICBmb3IgY2hhciBpbiB0ZXh0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5jaGFyID09ICdcXFxcJ1xuICAgICAgICAgICAgICAgIGlmIG9iai5lc2NwIFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgb2JqLmVzY3BcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG9iai5lc2NwID0gdHJ1ZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmouZXNjcFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLmNoYXIgPSBjaGFyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5pbnRlcnBvbGF0aW9uIGFuZCBvYmouY2hhciA9PSAnfSdcbiAgICAgICAgICAgICAgICBTeW50YXguZW5kV29yZCBvYmpcbiAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgICAgICAgICBtYXRjaDogb2JqLmNoYXJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiI3tvYmouaW50ZXJwb2xhdGlvbn0gcHVuY3R1YXRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvYmouc3RyaW5nID1cbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6ICBvYmouaW5kZXgrMVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogIG9iai5pbnRlcnBvbGF0aW9uXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiAgJydcbiAgICAgICAgICAgICAgICBvYmouaW5kZXgrK1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLnN0cmluZ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFN5bnRheC5kb1N0cmluZyBvYmpcblxuICAgICAgICAgICAgZWxzZSBpZiBvYmouY29tbWVudFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFN5bnRheC5kb0NvbW1lbnQgb2JqXG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHN3aXRjaCBjaGFyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB3aGVuIFwiJ1wiICdcIicgJ2AnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBvYmouZXNjcCBhbmQgKGNoYXIgIT0gXCInXCIgb3Igb2JqLmpzbGFuZyBvciBvYmoucHVnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdGFydFN0cmluZyBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZG9QdW5jdCBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB3aGVuICcrJyAnKicgJzwnICc+JyAnPScgJ14nICd+JyAnQCcgJyQnICcmJyAnJScgJyMnICcvJyAnXFxcXCcgJzonICcuJyAnOycgJywnICchJyAnPycgJ3wnICd7JyAnfScgJygnICcpJyAnWycgJ10nXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5kb1B1bmN0IG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0nXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5kYXNobGFuZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5kb1dvcmQgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvUHVuY3Qgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB3aGVuICcgJyAnXFx0JyBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZWxzZSAjIHN0YXJ0IGEgbmV3IHdvcmQgLyBjb250aW51ZSB0aGUgY3VycmVudCB3b3JkXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5kb1dvcmQgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjaGFyIG5vdCBpbiBbJyAnICdcXHQnXVxuICAgICAgICAgICAgICAgICAgICBTeW50YXguY29mZmVlQ2FsbCBvYmpcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmouaW5kZXgrK1xuICAgICAgICAgIFxuICAgICAgICBvYmouY2hhciA9IG51bGxcbiAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgIFN5bnRheC5lbmRMaW5lIG9ialxuICAgICAgICAgICAgXG4gICAgICAgIG9iai5yZ3NcbiAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAZW5kV29yZDogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIGNoYXIgPSBvYmouY2hhciA/ICcnXG4gICAgICAgIFxuICAgICAgICBvYmoudHVyZCArPSBjaGFyICMgZG9uJ3QgdXNlID0gaGVyZSFcblxuICAgICAgICBzd2l0Y2ggY2hhclxuICAgICAgICAgICAgd2hlbiAnICcsICdcXHQnXG4gICAgICAgICAgICAgICAgU3ludGF4LmRvVHVyZCBvYmpcbiAgICAgICAgICAgICAgICBpZiBvYmoucmVnZXhwPyBhbmQgbm90IG9iai5lc2NwXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmoucmVnZXhwICMgYWJvcnQgcmVnZXhwIG9uIGZpcnN0IHVuZXNjYXBlZCBzcGFjZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubm9vblxuICAgICAgICAgICAgICAgICAgICBpZiBvYmoudHVyZC5lbmRzV2l0aCAnICAnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBmaXJzdChvYmoucmdzKT8uc3RhcnQgPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4ub2JqLnJncy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdWJzdGl0dXRlIG9iaiwgLWluZGV4LTEsIFsndGV4dCddLCBbJ3Byb3BlcnR5J11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnN1YnN0aXR1dGUgb2JqLCAtaW5kZXgtMSwgWydwdW5jdHVhdGlvbiddLCBbJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiB2YWxpZCBvYmoud29yZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3b3JkID0gb2JqLndvcmRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLndvcmRzLnB1c2ggd29yZFxuICAgICAgICAgICAgb2JqLndvcmQgPSAnJ1xuXG4gICAgICAgICAgICBnZXRWYWx1ZSA9IChiYWNrPS0xKSAgICAgLT4gU3ludGF4LmdldFZhbHVlIG9iaiwgYmFjayBcbiAgICAgICAgICAgIGdldE1hdGNoID0gKGJhY2s9LTEpICAgICAtPiBTeW50YXguZ2V0TWF0Y2ggb2JqLCBiYWNrXG4gICAgICAgICAgICBzZXRWYWx1ZSA9IChiYWNrLCB2YWx1ZSkgLT4gU3ludGF4LnNldFZhbHVlIG9iaiwgYmFjaywgdmFsdWUgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzZXRDbGFzcyA9IChjbHNzKSAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5jb2ZmZWUgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai5yZ3MpPy5tYXRjaCA9PSAnQCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNsc3MgPT0gJ3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xzcyA9ICdtZW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0KG9iai5yZ3MpLnZhbHVlID0gY2xzcyArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG9iai5qc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgY2xzcyA9PSAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5yZXBsYWNlIG9iaiwgLTIsIFt7d29yZDp0cnVlfSwge21hdGNoOic9J31dLCBbe3ZhbHVlOidmdW5jdGlvbid9XVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogb2JqLmluZGV4IC0gd29yZC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IHdvcmRcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNsc3NcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdmFsaWQgb2JqLmZpbGxcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3Mgb2JqLmZpbGwudmFsdWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHN3aXRjaCBjaGFyXG4gICAgICAgICAgICAgICAgd2hlbiAnOidcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmRpY3RsYW5nXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIHdoZW4gJz0nXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai5pbmlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIFN5bnRheC50dXJkW29iai5leHRdXG4gICAgICAgICAgICAgICAgbGFzdFR1cmQgPSBsYXN0IG9iai5sYXN0LnNwbGl0IC9cXHMrL1xuICAgICAgICAgICAgICAgIGlmIHR1cmRJbmZvID0gU3ludGF4LnR1cmRbb2JqLmV4dF1bbGFzdFR1cmRdXG4gICAgICAgICAgICAgICAgICAgIGlmIHR1cmRJbmZvLnNwYWNlZCAhPSB0cnVlIG9yIG9iai5sYXN0W29iai5sYXN0Lmxlbmd0aC1sYXN0VHVyZC5sZW5ndGgtMV0gPT0gJyAnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB0dXJkSW5mb1sndy0xJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtdHVyZEluZm8ubWF0Y2gubGVuZ3RoLTEsIHR1cmRJbmZvWyd3LTEnXVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4udHVyZEluZm8ubWF0Y2gubGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC1pbmRleC0xLCB0dXJkSW5mby50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB0dXJkSW5mb1sndy0wJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgdHVyZEluZm9bJ3ctMCddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxjd29yZCA9IHdvcmQudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB3b3JkSW5mbyA9IFN5bnRheC53b3JkW29iai5leHRdP1tsY3dvcmRdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgd29yZEluZm9bJ3QtMSddPyBhbmQgb2JqLmxhc3QgaW4gT2JqZWN0LmtleXMgd29yZEluZm9bJ3QtMSddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCB3b3JkSW5mby52YWx1ZSArICcgJyArIHdvcmRJbmZvWyd3LTEnXVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgd29yZEluZm8udmFsdWUgKyAnICcgKyB3b3JkSW5mb1sndC0xJ11bb2JqLmxhc3RdXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyB3b3JkSW5mby52YWx1ZSArICcgJyArIHdvcmRJbmZvLndvcmRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgd29yZFZhbHVlID0gU3ludGF4Lmxhbmdbb2JqLmV4dF0/W2xjd29yZF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBTeW50YXguaW5mb1tvYmouZXh0XT9bd29yZFZhbHVlXT9cbiAgICAgICAgICAgICAgICAgICAgZm9yIHZhbHVlSW5mbyBpbiBTeW50YXguaW5mb1tvYmouZXh0XVt3b3JkVmFsdWVdXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgbWF0Y2gsbWF0Y2hWYWx1ZSBvZiB2YWx1ZUluZm8uaW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LnRyaW0oKS5lbmRzV2l0aCBtYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5tYXRjaC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMS1pbmRleCwgbWF0Y2hWYWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyBtYXRjaFZhbHVlXG4gICAgICAgICAgICAgICAgZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIHdvcmRWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5jb2ZmZWVcbiAgICAgICAgICAgICAgICBpZiBnZXRNYXRjaCgtMSkgaW4gWydjbGFzcycgJ2V4dGVuZHMnXVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0xKT8uaW5kZXhPZj8oJ3B1bmN0dWF0aW9uJykgPCAwXG4gICAgICAgICAgICAgICAgICAgIGlmIHdvcmQgbm90IGluIFsnZWxzZScgJ3RoZW4nICdhbmQnICdvcicgJ2luJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnJncykudmFsdWUgbm90IGluIFsna2V5d29yZCcgJ2Z1bmN0aW9uIGhlYWQnICdyZXF1aXJlJyAnbnVtYmVyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2Z1bmN0aW9uIGNhbGwnICMgY29mZmVlIGVuZFdvcmQgLTEgbm8gcHVuY3R1YXRpb24gYW5kIHdvcmQgIT0gJ2Vsc2UgLi4uJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAgICAgICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICAgICAgICAgIGlmIC9eMHhbYS1mQS1GXFxkXVthLWZBLUZcXGRdW2EtZkEtRlxcZF0rJC8udGVzdCB3b3JkXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgaGV4IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnbnVtYmVyIGhleCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBnZXRNYXRjaCgtMSkgPT0gXCIjXCJcbiAgICAgICAgICAgICAgICBpZiAvXlthLWZBLUZcXGRdKyQvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ251bWJlciBoZXggcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyIGhleCdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5ub29uXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLndvcmRzLmxlbmd0aCA9PSAxIFxuICAgICAgICAgICAgICAgICAgICBpZiBlbXB0eSBvYmoubGFzdFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdjbGFzcydcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG9iai5zaFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai53b3Jkcy5sZW5ndGggPiAxIGFuZCBnZXRNYXRjaCgtMSkgPT0gJy0nIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ2FyZ3VtZW50J1xuICAgICAgICAgICAgICAgICAgICBzZXRDbGFzcyAtMSwgJ2FyZ3VtZW50IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2FyZ3VtZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgICAgICAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG5cbiAgICAgICAgICAgIGlmIG9iai5jcHBsYW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgPT0gJzo6J1xuICAgICAgICAgICAgICAgICAgICBpZiBvYmoucmdzLmxlbmd0aCA+PSAzXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ25hbWVzcGFjZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAncHVuY3R1YXRpb24gbmFtZXNwYWNlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwdW5jdHVhdGlvbiBuYW1lc3BhY2UnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjaGFyID09ICcoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZnVuY3Rpb24gY2FsbCcgIyBjcHAgOjp3b3JkIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgL15bXFxcXF9BLVpdW1xcXFxfQS1aMC05XSskLy50ZXN0IHdvcmRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdtYWNybydcblxuICAgICAgICAgICAgICAgIGlmICAgICAgL15bVUFdW0EtWl1cXHcrJC8udGVzdCh3b3JkKSB0aGVuIHJldHVybiBzZXRDbGFzcyAndHlwZSBjbGFzcydcbiAgICAgICAgICAgICAgICBlbHNlIGlmIC9eW1NGXVtBLVpdXFx3KyQvLnRlc3Qod29yZCkgdGhlbiByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgc3RydWN0J1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgL15bRV1bQS1aXVxcdyskLy50ZXN0KHdvcmQpICB0aGVuIHJldHVybiBzZXRDbGFzcyAndHlwZSBlbnVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgJ2NsYXNzJyBpbiBvYmoud29yZHMgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJzwnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAndHlwZSB0ZW1wbGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgPT0gJzo6J1xuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMykgaW4gWydlbnVtJywgJ2NsYXNzJywgJ3N0cnVjdCddXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ3JlYWxseT8nXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHNzID0gZ2V0VmFsdWUoLTMpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgZ2V0VmFsdWUoLTMpICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCBnZXRWYWx1ZSgtMykgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsIGdldFZhbHVlKC0zKSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdCA9PSAnLicgYW5kIC9eXFxkK2YkLy50ZXN0KHdvcmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ251bWJlciBmbG9hdCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QuZW5kc1dpdGggXCIjI1wiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3B1bmN0dWF0aW9uIG9wZXJhdG9yJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3B1bmN0dWF0aW9uIG9wZXJhdG9yJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG9iai5sYXN0LmVuZHNXaXRoICctPidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICdvYmonXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAncHJvcGVydHkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHJvcGVydHkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgZmlyc3Qob2JqLndvcmRzKS5zdGFydHNXaXRoKCdVJykgYW5kIGZpcnN0KG9iai5yZ3MpPy52YWx1ZSA9PSAnbWFjcm8nXG4gICAgICAgICAgICAgICAgICAgIGlmIHdvcmQuc3RhcnRzV2l0aCAnQmx1ZXByaW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdtYWNybyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgaWYgd29yZC50b0xvd2VyQ2FzZSgpIGluIFsnbWV0YScgJ2Rpc3BsYXluYW1lJyAnY2F0ZWdvcnknICd3b3JsZGNvbnRleHQnICdlZGl0YW55d2hlcmUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdtYWNybyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgaWYgd29yZC50b0xvd2VyQ2FzZSgpIGluIFsnY29uZmlnJyAndHJhbnNpZW50JyAnZWRpdGRlZmF1bHRzb25seScgJ3Zpc2libGVhbnl3aGVyZScgJ25vbnRyYW5zYWN0aW9uYWwnICdpbnRlcnAnICdnbG9iYWxjb25maWcnXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdtYWNybydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICAgICAgICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAvXlxcZCskLy50ZXN0IHdvcmRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdCA9PSAnLicgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC00KSA9PSAnbnVtYmVyIGZsb2F0JyBhbmQgZ2V0VmFsdWUoLTIpID09ICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtNCwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zLCAnc2VtdmVyIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3NlbXZlciBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdudW1iZXIgZmxvYXQgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMCAwMDAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgICAgICAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouZG90bGFuZ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0IGluIFsnLicgJzonXVxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgaW4gWyd0ZXh0JyAnbW9kdWxlJyAnY2xhc3MnICdtZW1iZXInICdrZXl3b3JkJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnb2JqJyBpZiBnZXRWYWx1ZSgtMikgPT0gJ3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2hhciA9PSAnKCcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdmdW5jdGlvbiBjYWxsJyAjIGRvdGxhbmcgLndvcmQgKFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QuZW5kc1dpdGggJy4nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2hhciA9PSAnKCcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdmdW5jdGlvbiBjYWxsJyAjIGRvdGxhbmcgLnByb3BlcnR5IChcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0Lmxlbmd0aCA+IDEgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0W29iai5sYXN0Lmxlbmd0aC0yXSBpbiBbJyknICddJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5jb2ZmZWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoubGFzdFtvYmoubGFzdC5sZW5ndGgtMl0gPT0gJz8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zLCAnb2JqJyBpZiBnZXRWYWx1ZSgtMykgPT0gJ3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnb3BlcmF0b3IgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHJvcGVydHkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAncHJvcGVydHknXG5cbiAgICAgICAgICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgIDAwMCAwMDAgICAwMDAgICAgICBcbiAgICAgICAgICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAwMDAwMCAgICAwMDAgICAgICBcbiAgICAgICAgICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgICBcbiAgICAgICAgICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAwMDAwICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNzc2xhbmdcblxuICAgICAgICAgICAgICAgIGlmIHdvcmQuZW5kc1dpdGggJ3MnXG4gICAgICAgICAgICAgICAgICAgIGlmIC9cXGQrcy8udGVzdCB3b3JkXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHdvcmQuc2xpY2Uod29yZC5sZW5ndGgtMikgaW4gWydweCcgJ2VtJyAnZXgnICdjaCddXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5jc3NsYW5nIG9yIG9iai5wdWdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC5lbmRzV2l0aCAnLidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdjbGFzcyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdjbGFzcydcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QuZW5kc1dpdGggXCIjXCJcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdjc3NpZCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdjc3NpZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouY3BwbGFuZyBvciBvYmouanNcbiAgICAgICAgICAgICAgICBpZiBjaGFyID09ICcoJyBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdmdW5jdGlvbiBjYWxsJyAjIGNwcCAmIGpzIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAndGV4dCdcbiAgICAgICAgbnVsbFxuICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIEBjb2ZmZWVDYWxsOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgb2JqLmNvZmZlZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmoudHVyZCA9PSAnKCdcbiAgICAgICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCAtMiwgJ2Z1bmN0aW9uIGNhbGwnICMgY29mZmVlIGNhbGwgKFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBvYmoudHVyZC5sZW5ndGggPiAxIGFuZCBvYmoudHVyZFtvYmoudHVyZC5sZW5ndGgtMl0gPT0gJyAnXG4gICAgICAgICAgICAgICAgaWYgbGFzdChvYmoudHVyZCkgaW4gJ0ArLVxcJ1wiKFt7J1xuICAgICAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai50dXJkKSBpbiAnKy0nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoudGV4dFtvYmouaW5kZXgrMV0gPT0gJyAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICMgYmFpbCBvdXQgaWYgbmV4dCBjaGFyYWN0ZXIgaXMgYSBzcGFjZSAoY2hlYXRlciEpXG4gICAgICAgICAgICAgICAgICAgIHZhbCA9IFN5bnRheC5nZXRWYWx1ZSBvYmosIC0yXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbGlkKHZhbCkgYW5kIHZhbCBub3QgaW4gWydrZXl3b3JkJywgJ2Z1bmN0aW9uIGhlYWQnLCAncmVxdWlyZSddXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiB2YWwuaW5kZXhPZigncHVuY3R1YXRpb24nKSA8IDAgYW5kIG9iai5yZ3NbLTJdLnZhbHVlIG5vdCBpbiBbJ251bWJlciddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTIsIFwiZnVuY3Rpb24gY2FsbFwiICMgY29mZmVlIGNhbGwgQCstXFwnXCIoW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgQGRvV29yZDogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHZhbGlkIG9iai50dXJkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFN5bnRheC5kb1R1cmQgb2JqXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5sYXN0ID0gb2JqLnR1cmRcbiAgICAgICAgICAgIG9iai50dXJkID0gJydcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIG9iai53b3JkICs9IG9iai5jaGFyXG4gICAgICAgIFxuICAgICAgICBudWxsXG5cbiAgICBAZG9UdXJkOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IG9iai5maWxsIGFuZCBvYmoud29yZHMubGVuZ3RoPT0wIGFuZCBTeW50YXguZmlsbFtvYmouZXh0XT9bb2JqLnR1cmRdP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmouZmlsbCA9IFN5bnRheC5maWxsW29iai5leHRdP1tvYmoudHVyZF1cbiAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9iai50dXJkLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBpZiBvYmouZmlsbC50dXJkXG4gICAgICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0xLWluZGV4LCBvYmouZmlsbC50dXJkXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCAtMS1pbmRleCwgb2JqLmZpbGwudmFsdWUgKyAnICcgKyAncHVuY3R1YXRpb24nXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAZG9QdW5jdDogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIFN5bnRheC5lbmRXb3JkIG9ialxuICAgICAgICBcbiAgICAgICAgZ2V0VmFsdWUgPSAoYmFjaz0tMSkgICAgIC0+IFN5bnRheC5nZXRWYWx1ZSBvYmosIGJhY2sgXG4gICAgICAgIHNldFZhbHVlID0gKGJhY2ssIHZhbHVlKSAtPiBTeW50YXguc2V0VmFsdWUgb2JqLCBiYWNrLCB2YWx1ZSAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHZhbHVlID0gJ3B1bmN0dWF0aW9uJ1xuICAgICAgICBcbiAgICAgICAgc3dpdGNoIG9iai5jaGFyXG4gICAgICAgICAgICB3aGVuICc6J1xuICAgICAgICAgICAgICAgIGlmIG9iai5kaWN0bGFuZyBhbmQgb2JqLnR1cmQubGVuZ3RoID09IDFcbiAgICAgICAgICAgICAgICAgICAgaWYgbGFzdChvYmoucmdzKT8udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAnZGljdGlvbmFyeSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai5jb2ZmZWUgIyBrb2ZmZWUgY29uc3RydWN0b3Igc2hvcnRjdXQgQDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAnbWV0aG9kIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgd2hlbiAnPidcbiAgICAgICAgICAgICAgICBpZiBvYmouanNsYW5nXG4gICAgICAgICAgICAgICAgICAgIGZvciBbdHVyZCwgdmFsXSBpbiBbWyctPicsICcnXSwgWyc9PicsICcgYm91bmQnXV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai50dXJkLmVuZHNXaXRoIHR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc3Vic3RpdHV0ZSBvYmosIC0zLCBbJ2RpY3Rpb25hcnkga2V5JywgJ2RpY3Rpb25hcnkgcHVuY3R1YXRpb24nXSwgWydtZXRob2QnLCAnbWV0aG9kIHB1bmN0dWF0aW9uJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc3Vycm91bmQgICBvYmosIC0xLCBzdGFydDonKCcsIGFkZDonYXJndW1lbnQnLCBlbmQ6JyknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnJlcGxhY2UgICAgb2JqLCAtMywgW3t3b3JkOnRydWUsIGlnbm9yZTonYXJndW1lbnQnfSwge21hdGNoOic9J31dLCBbe3ZhbHVlOidmdW5jdGlvbid9XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZnVuY3Rpb24gdGFpbCcgKyB2YWwgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ2Z1bmN0aW9uIGhlYWQnICsgdmFsICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG9iai54bWxsYW5nIG9yIG9iai5tZFxuICAgICAgICAgICAgICAgICAgICBpZiBvYmoudHVyZC5lbmRzV2l0aCAnLz4nXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2tleXdvcmQgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ2tleXdvcmQgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICB3aGVuICcvJ1xuICAgICAgICAgICAgICAgIGlmIG9iai5qc2xhbmdcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IG9iai5lc2NwXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoucmVnZXhwP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbb2JqLnJncy5sZW5ndGgtMS4uMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnJnc1tpbmRleF0uc3RhcnQgPCBvYmoucmVnZXhwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmoucmdzW2luZGV4XS52YWx1ZSA9ICdyZWdleHAgJyArIG9iai5yZ3NbaW5kZXhdLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAncmVnZXhwIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5yZWdleHAgPSBvYmouaW5kZXggICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiBtdGNoID0gU3ludGF4Lm10Y2hbb2JqLmV4dF0/W29iai5jaGFyXVxuICAgICAgICAgICAgaWYgbWF0Y2hWYWx1ZSA9IFN5bnRheC5kb01hdGNoIG9iaiwgbXRjaFxuICAgICAgICAgICAgICAgIHZhbHVlID0gbWF0Y2hWYWx1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBvYmouZmlsbCB0aGVuIHZhbHVlID0gb2JqLmZpbGwudmFsdWUgKyAnICcgKyB2YWx1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBvYmoucmdzLnB1c2hcbiAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXhcbiAgICAgICAgICAgIG1hdGNoOiBvYmouY2hhclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG5cbiAgICAgICAgU3ludGF4LmNoZWNrQ29tbWVudCBvYmpcbiAgICAgICAgXG4gICAgIyMjXG4gICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyMjXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGNoZWNrQ29tbWVudDogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBlbXB0eSBTeW50YXguaW5mb1tvYmouZXh0XT8uY29tbWVudFxuICAgICAgICByZXR1cm4gaWYgb2JqLnJlZ2V4cD9cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBjb21tZW50ID0gU3ludGF4LmluZm9bb2JqLmV4dF0uY29tbWVudFxuICAgICAgICBcbiAgICAgICAgaWYgY29tbWVudC5saW5lIGFuZCBvYmoudHVyZC5lbmRzV2l0aChjb21tZW50LmxpbmUpIGFuZCBub3Qgb2JqLnR1cmQuZW5kc1dpdGgoJ1xcXFwnK2NvbW1lbnQubGluZSkgYW5kIGVtcHR5KG9iai53b3JkcylcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3ludGF4LnN0YXJ0Q29tbWVudCBvYmosIGNvbW1lbnQubGluZVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNvbW1lbnQudGFpbCBhbmQgb2JqLnR1cmQuZW5kc1dpdGgoY29tbWVudC50YWlsKSBhbmQgbm90IG9iai50dXJkLmVuZHNXaXRoKCdcXFxcJytjb21tZW50LnRhaWwpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFN5bnRheC5zdGFydENvbW1lbnQgb2JqLCBjb21tZW50LnRhaWxcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIGNvbW1lbnQuc3RhcnQgYW5kIG9iai50dXJkLmVuZHNXaXRoKGNvbW1lbnQuc3RhcnQpIGFuZCBub3Qgb2JqLnR1cmQuZW5kc1dpdGgoJ1xcXFwnK2NvbW1lbnQuc3RhcnQpXG5cbiAgICAgICAgICAgIFN5bnRheC5zdGFydENvbW1lbnQgb2JqLCBjb21tZW50LnN0YXJ0XG4gICAgICAgICAgICBcbiAgICAgICAgbnVsbFxuXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzdGFydENvbW1lbnQ6IChvYmosIHN0YXJ0KSAtPlxuICAgICAgICBcbiAgICAgICAgb2JqLmNvbW1lbnQgPVxuICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleCsxXG4gICAgICAgICAgICBtYXRjaDogJydcbiAgICAgICAgICAgIHZhbHVlOiAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5zdGFydC5sZW5ndGhdXG4gICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCAtMS1pbmRleCwgJ2NvbW1lbnQgcHVuY3R1YXRpb24nXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgXG4gICAgXG4gICAgQGRvQ29tbWVudDogKG9iaikgLT5cblxuICAgICAgICBjb21tZW50ID0gU3ludGF4LmluZm9bb2JqLmV4dF0uY29tbWVudFxuICAgICAgICBcbiAgICAgICAgaWYgY29tbWVudC5lbmQgYW5kIG9iai50dXJkLmVuZHNXaXRoKGNvbW1lbnQuZW5kKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmoucmdzLnB1c2ggb2JqLmNvbW1lbnRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZGVsZXRlIG9iai5jb21tZW50XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLmNvbW1lbnQuZW5kLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCAtMS1pbmRleCwgJ2NvbW1lbnQgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZVxuXG4gICAgICAgICAgICBTeW50YXguY29udCBvYmosICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAjIyNcbiAgICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4gICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgIyMjXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBzdGFydFN0cmluZzogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIFN5bnRheC5lbmRXb3JkIG9ialxuICAgICAgICBcbiAgICAgICAgc3RyaW5nVHlwZSA9IHN3aXRjaCBvYmouY2hhclxuICAgICAgICAgICAgd2hlbiBcIidcIiB0aGVuICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnXG4gICAgICAgICAgICB3aGVuICdgJyB0aGVuICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgbm90IHN0cmluZ1R5cGVcbiAgICAgICAgICAgIGtlcnJvciBcIm5vIHN0cmluZyBjaGFyICcje29iai5jaGFyfSdcIlxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICBzdGFydDogb2JqLmluZGV4XG4gICAgICAgICAgICBtYXRjaDogb2JqLmNoYXJcbiAgICAgICAgICAgIHZhbHVlOiBcIiN7c3RyaW5nVHlwZX0gcHVuY3R1YXRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIG9iai5zdHJpbmcgPVxuICAgICAgICAgICAgdmFsdWU6ICBzdHJpbmdUeXBlXG4gICAgICAgICAgICBzdGFydDogIG9iai5pbmRleCsxXG4gICAgICAgICAgICBtYXRjaDogICcnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG51bGxcblxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgXG4gICAgXG4gICAgQGRvU3RyaW5nOiAob2JqKSAtPlxuXG4gICAgICAgIGlmIG9iai5jb2ZmZWUgXG4gICAgICAgICAgICBpZiBvYmouY2hhciA9PSAneycgYW5kIG9iai5zdHJpbmcudmFsdWUgIT0gJ3N0cmluZyBzaW5nbGUnIGFuZCBvYmouc3RyaW5nLm1hdGNoLmVuZHNXaXRoIFwiI1wiXG4gICAgICAgICAgICAgICAgb2JqLmludGVycG9sYXRpb24gPSBvYmouc3RyaW5nLnZhbHVlXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5zdHJpbmdcbiAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgICAgICAgICBtYXRjaDogb2JqLmNoYXJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiI3tvYmouaW50ZXJwb2xhdGlvbn0gcHVuY3R1YXRpb25cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBzdHJpbmdUeXBlID0gc3dpdGNoIG9iai5jaGFyXG4gICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgIHdoZW4gJ2AnIHRoZW4gJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBvYmouZXNjcCBhbmQgb2JqLnN0cmluZy52YWx1ZSA9PSBzdHJpbmdUeXBlXG5cbiAgICAgICAgICAgIGlmIHZhbGlkIG9iai5zdHJpbmcubWF0Y2gudHJpbSgpXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5zdHJpbmdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgICAgIG1hdGNoOiBvYmouY2hhclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcIiN7c3RyaW5nVHlwZX0gcHVuY3R1YXRpb25cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFN5bnRheC5jb250IG9iaiwgJ3N0cmluZydcbiAgICAgICAgICAgIFxuICAgICAgICBudWxsXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAY29udDogKG9iaiwga2V5KSAtPlxuICAgICAgICBcbiAgICAgICAgc3RyT3JDbXQgPSBvYmpba2V5XVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIG9iai5jaGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICcgJywgJ1xcdCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBzdHJPckNtdC5tYXRjaCA9PSAnJ1xuICAgICAgICAgICAgICAgICAgICBzdHJPckNtdC5zdGFydCArPSAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2ggc3RyT3JDbXQgaWYgdmFsaWQgc3RyT3JDbXQubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgb2JqW2tleV0gPSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXgrMVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RyT3JDbXQudmFsdWVcbiAgICAgICAgICAgIGVsc2UgXG5cbiAgICAgICAgICAgICAgICBzdHJPckNtdC5tYXRjaCArPSBvYmouY2hhclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAZW5kTGluZTogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9iai5zdHJpbmdcbiAgICAgICAgICAgIGlmIG9iai5qc2xhbmcgb3Igb2JqLmNwcGxhbmdcbiAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2ggb2JqLnN0cmluZ1xuICAgICAgICBlbHNlIGlmIG9iai5jb21tZW50XG4gICAgICAgICAgICBvYmoucmdzLnB1c2ggb2JqLmNvbW1lbnRcbiAgICAgICAgbnVsbFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAZ2V0TWF0Y2g6IChvYmosIGJhY2spICAgICAgICAtPiBpZiBiYWNrIDwgMCB0aGVuIG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgrYmFja10/Lm1hdGNoIGVsc2Ugb2JqLnJnc1tiYWNrXT8ubWF0Y2hcbiAgICBAZ2V0VmFsdWU6IChvYmosIGJhY2spICAgICAgICAtPiBpZiBiYWNrIDwgMCB0aGVuIG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgrYmFja10/LnZhbHVlIGVsc2Ugb2JqLnJnc1tiYWNrXT8udmFsdWUgICAgIFxuICAgIEBzZXRWYWx1ZTogKG9iaiwgYmFjaywgdmFsdWUpIC0+IFxuICAgICAgICBpZiBiYWNrIDwgMFxuICAgICAgICAgICAgYmFjayA9IG9iai5yZ3MubGVuZ3RoK2JhY2tcbiAgICAgICAgaWYgYmFjayA8IG9iai5yZ3MubGVuZ3RoIGFuZCBiYWNrID49IDBcbiAgICAgICAgICAgIG9iai5yZ3NbYmFja10udmFsdWUgPSB2YWx1ZVxuICAgICAgICAgICAgaWYgb2JqLmNvZmZlZSBhbmQgb2JqLnJnc1tiYWNrLTFdP1xuICAgICAgICAgICAgICAgIGlmIG9iai5yZ3NbYmFjay0xXT8ubWF0Y2ggPT0gJ0AnXG4gICAgICAgICAgICAgICAgICAgIG9iai5yZ3NbYmFjay0xXS52YWx1ZSA9IHZhbHVlICsgJyBwdW5jdHVhdGlvbidcblxuICAgIEBhZGRWYWx1ZTogKG9iaiwgYmFjaywgdmFsdWUpIC0+IFxuICAgICAgICBpZiBiYWNrIDwgMFxuICAgICAgICAgICAgYmFjayA9IG9iai5yZ3MubGVuZ3RoK2JhY2tcbiAgICAgICAgaWYgYmFjayA8IG9iai5yZ3MubGVuZ3RoIGFuZCBiYWNrID49IDBcbiAgICAgICAgICAgIGZvciB2YWwgaW4gdmFsdWUuc3BsaXQgL1xccysvXG4gICAgICAgICAgICAgICAgaWYgdmFsIG5vdCBpbiBvYmoucmdzW2JhY2tdLnZhbHVlLnNwbGl0IC9cXHMrL1xuICAgICAgICAgICAgICAgICAgICBvYmoucmdzW2JhY2tdLnZhbHVlID0gdmFsICsgJyAnICsgb2JqLnJnc1tiYWNrXS52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBzdWJzdGl0dXRlOiAob2JqLCBiYWNrLCBvbGRWYWxzLCBuZXdWYWxzKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGluZGV4IGluIFswLi4ub2xkVmFscy5sZW5ndGhdXG4gICAgICAgICAgICB2YWwgPSBTeW50YXguZ2V0VmFsdWUgb2JqLCBiYWNrK2luZGV4XG4gICAgICAgICAgICBpZiB2YWwgIT0gb2xkVmFsc1tpbmRleF1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBpbmRleCA9PSBvbGRWYWxzLmxlbmd0aFxuICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4ub2xkVmFscy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgYmFjaytpbmRleCwgbmV3VmFsc1tpbmRleF1cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG9iai5yZ3MubGVuZ3RoICsgYmFjay0xID49IDBcbiAgICAgICAgICAgIFN5bnRheC5zdWJzdGl0dXRlIG9iaiwgYmFjay0xLCBvbGRWYWxzLCBuZXdWYWxzXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQHJlcGxhY2U6IChvYmosIGJhY2ssIG9sZE9ianMsIG5ld09ianMpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgb2JqLnJncy5sZW5ndGgrYmFjayA8IDBcbiAgICAgICAgXG4gICAgICAgIGFkdmFuY2UgPSAtPlxuICAgICAgICAgICAgaWYgb2JqLnJncy5sZW5ndGggKyBiYWNrLTEgPj0gMFxuICAgICAgICAgICAgICAgIFN5bnRheC5yZXBsYWNlIG9iaiwgYmFjay0xLCBvbGRPYmpzLCBuZXdPYmpzXG5cbiAgICAgICAgZm9yIGluZGV4IGluIFswLi4ub2xkT2Jqcy5sZW5ndGhdXG4gICAgICAgICAgICBiYWNrT2JqID0gb2JqLnJnc1tvYmoucmdzLmxlbmd0aCtiYWNrK2luZGV4XVxuICAgICAgICAgICAg4pa4YXNzZXJ0IGJhY2tPYmpcbiAgICAgICAgICAgIGlmIG9sZE9ianNbaW5kZXhdLmlnbm9yZVxuICAgICAgICAgICAgICAgIGlmIGJhY2tPYmoudmFsdWU/LmluZGV4T2Y/KG9sZE9ianNbaW5kZXhdLmlnbm9yZSkgPj0gMFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWR2YW5jZSgpXG4gICAgICAgICAgICBmb3Iga2V5IGluIE9iamVjdC5rZXlzIG9sZE9ianNbaW5kZXhdXG4gICAgICAgICAgICAgICAgc3dpdGNoIGtleSBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd29yZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGJhY2tPYmoudmFsdWU/LmluZGV4T2Y/KCdwdW5jdHVhdGlvbicpID49IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWR2YW5jZSgpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lnbm9yZScgdGhlblxuICAgICAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2xkT2Jqc1tpbmRleF1ba2V5XSAhPSBiYWNrT2JqW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWR2YW5jZSgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5uZXdPYmpzLmxlbmd0aF1cbiAgICAgICAgICAgIGJhY2tPYmogPSBvYmoucmdzW29iai5yZ3MubGVuZ3RoK2JhY2sraW5kZXhdXG4gICAgICAgICAgICBmb3Iga2V5IGluIE9iamVjdC5rZXlzIG5ld09ianNbaW5kZXhdXG4gICAgICAgICAgICAgICAgYmFja09ialtrZXldID0gbmV3T2Jqc1tpbmRleF1ba2V5XVxuICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGRvTWF0Y2g6IChvYmosIG10Y2hzKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIG10Y2ggaW4gbXRjaHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3RhcnRMZW5ndGggPSBtdGNoLnN0YXJ0Py5sZW5ndGggPyAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG10Y2guc2luZ2xlIFxuICAgICAgICAgICAgICAgIGlmIG9iai50ZXh0W29iai5pbmRleCsxXSA9PSBtdGNoLmVuZFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnJncyk/Lm1hdGNoID09IG10Y2guZW5kXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5yZ3MubGVuZ3RoLW10Y2guZW5kLmxlbmd0aC1zdGFydExlbmd0aCA8IDBcbiAgICAgICAgICAgICAgICBjb250aW51ZSBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZW5kTWF0Y2hlcyA9IHRydWVcbiAgICAgICAgICAgIGZvciBlbmRJbmRleCBpbiBbMS4uLm10Y2guZW5kLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBpZiBvYmoucmdzW29iai5yZ3MubGVuZ3RoLWVuZEluZGV4XS5tYXRjaCAhPSBtdGNoLmVuZFttdGNoLmVuZC5sZW5ndGgtZW5kSW5kZXhdXG4gICAgICAgICAgICAgICAgICAgIGVuZE1hdGNoZXMgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWYgbm90IGVuZE1hdGNoZXNcbiAgICAgICAgICAgICAgICBjb250aW51ZSBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG10Y2guc3BhY2VkID09IGZhbHNlXG4gICAgICAgICAgICAgICAgaWYgb2JqLnR1cmQuaW5kZXhPZignICcpID49IDBcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG10Y2guc3RhcnRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3Igc3RhcnRJbmRleCBpbiBbb2JqLnJncy5sZW5ndGgtc3RhcnRMZW5ndGgtbXRjaC5lbmQubGVuZ3RoLi4wXVxuICAgICAgICAgICAgICAgICAgICBzdGFydE1hdGNoZXMgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLnN0YXJ0TGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgU3ludGF4LmdldE1hdGNoKG9iaiwgc3RhcnRJbmRleCtpbmRleCkgIT0gbXRjaC5zdGFydFtpbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydE1hdGNoZXMgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIGlmIHN0YXJ0TWF0Y2hlc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBzdGFydEluZGV4ID49IDBcbiAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFtzdGFydEluZGV4Li4uc3RhcnRJbmRleCtzdGFydExlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIGluZGV4LCBtdGNoLnZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFtzdGFydEluZGV4K3N0YXJ0TGVuZ3RoLi4ub2JqLnJncy5sZW5ndGgtbXRjaC5lbmQubGVuZ3RoKzFdXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCBpbmRleCwgbXRjaC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gW29iai5yZ3MubGVuZ3RoLW10Y2guZW5kLmxlbmd0aCsxLi4ub2JqLnJncy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCBpbmRleCwgbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIC0xLCBtdGNoLnZhbHVlXG4gICAgICAgICAgICAgICAgaW5kZXggPSAtMlxuICAgICAgICAgICAgICAgIHdoaWxlIFN5bnRheC5nZXRNYXRjaChvYmosIGluZGV4KSA9PSAnLSdcbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgaW5kZXgsIG10Y2gudmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCBpbmRleC0xLCBtdGNoLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGluZGV4IC09IDJcbiAgICAgICAgICAgICAgICByZXR1cm4gbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAc3Vycm91bmQ6IChvYmosIGJhY2ssIHJhbmdlKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG9iai5yZ3MubGVuZ3RoLTErYmFjayA8PSAxXG4gICAgICAgIGZvciBlbmRJbmRleCBpbiBbb2JqLnJncy5sZW5ndGgtMStiYWNrLi4wXVxuICAgICAgICAgICAgaWYgZW5kSW5kZXggPj0gb2JqLnJncy5sZW5ndGggb3IgZW5kSW5kZXggPCAwXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBpZiBub3Qgb2JqLnJnc1tlbmRJbmRleF0/XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBpZiByYW5nZS5lbmQgPT0gb2JqLnJnc1tlbmRJbmRleF0/Lm1hdGNoXG4gICAgICAgICAgICAgICAgZm9yIHN0YXJ0SW5kZXggaW4gW2VuZEluZGV4LTEuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIHJhbmdlLnN0YXJ0ID09IG9iai5yZ3Nbc3RhcnRJbmRleF0/Lm1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgYWRkSW5kZXggaW4gW3N0YXJ0SW5kZXgrMS4uLmVuZEluZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5yZ3NbYWRkSW5kZXhdLnZhbHVlID0gcmFuZ2UuYWRkICsgJyAnICsgb2JqLnJnc1thZGRJbmRleF0udmFsdWVcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFN5bnRheFxuIl19
//# sourceURL=../coffee/syntax.coffee