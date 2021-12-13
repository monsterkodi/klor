// koffee 1.20.0

/*
000   000  000       0000000   00000000
000  000   000      000   000  000   000
0000000    000      000   000  0000000
000  000   000      000   000  000   000
000   000  0000000   0000000   000   000
 */

(function() {
    var FLOAT, HEADER, HEX, HEXNUM, LI, NEWLINE, NUMBER, PUNCT, SPACE, actExt, addValue, addValues, blockComment, blocked, chunk, chunkIndex, chunked, codeTypes, coffeePunct, coffeeWord, commentHeader, cppMacro, cppPointer, cppWord, cssWord, dashArrow, dict, escape, ext, extStack, extTop, exts, fillComment, float, getChunk, getValue, getmatch, handl, handlers, hashComment, interpolation, j, jsPunct, jsWord, jsonPunct, jsonWord, k, keyword, kolor, kolorize, kolorizeChunks, lang, len, len1, line, mdPunct, noonComment, noonProp, noonPunct, noonWord, notCode, number, obj, pad, parse, popExt, popStack, property, pushExt, pushStack, ref, regexp, replaceTabs, rpad, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, starComment, swtch, syntax, thisCall, topType, tripleRegexp, tripleString, urlPunct, urlWord, xmlPunct,
        indexOf = [].indexOf;

    ;

    ref = require(__dirname + "/../js/lang.json"), exts = ref.exts, lang = ref.lang;

    kolor = require('./kolor');

    swtch = {
        coffee: {
            doc: {
                turd: '▸',
                to: 'md',
                indent: 1
            }
        },
        pug: {
            script: {
                next: '.',
                to: 'js',
                indent: 1
            }
        },
        md: {
            coffeescript: {
                turd: '```',
                to: 'coffee',
                end: '```',
                add: 'code triple'
            },
            javascript: {
                turd: '```',
                to: 'js',
                end: '```',
                add: 'code triple'
            }
        }
    };

    for (j = 0, len = exts.length; j < len; j++) {
        ext = exts[j];
        swtch.md[ext] = {
            turd: '```',
            to: ext,
            end: '```',
            add: 'code triple'
        };
    }

    SPACE = /\s/;

    HEADER = /^0+$/;

    PUNCT = /\W+/g;

    NUMBER = /^\d+$/;

    FLOAT = /^\d+f$/;

    HEXNUM = /^0x[a-fA-F\d]+$/;

    HEX = /^[a-fA-F\d]+$/;

    NEWLINE = /\r?\n/;

    LI = /(\sli\d\s|\sh\d\s)/;

    codeTypes = ['interpolation', 'code triple'];

''

    chunked = function(lines, ext) {
        var lineno;
        if (ext[0] === '.') {
            ext = ext.slice(1);
        }
        if (indexOf.call(exts, ext) < 0) {
            ext = 'txt';
        }
        lineno = 0;
        return lines.map(function(text) {
            var advance, c, chunks, clss, k, l, last, len1, line, m, pc, pi, punct, ref1, ref2, ref3, rl, s, sc, turd, w, wl;
            line = {
                chunks: [],
                chars: 0,
                index: lineno++,
                number: lineno,
                ext: ext
            };
            if (!text instanceof String) {
                return line;
            }
            chunks = replaceTabs(text).split(SPACE);
            if (chunks.length === 1 && chunks[0] === '') {
                return line;
            }
            c = 0;
            for (k = 0, len1 = chunks.length; k < len1; k++) {
                s = chunks[k];
                if (s === '') {
                    c++;
                } else {
                    if (line.chunks.length) {
                        c++;
                    }
                    l = s.length;
                    sc = c;
                    while (m = PUNCT.exec(s)) {
                        if (m.index > 0) {
                            wl = m.index - (c - sc);
                            w = s.slice(c - sc, m.index);
                            line.chunks.push({
                                start: c,
                                length: wl,
                                match: w,
                                clss: 'text'
                            });
                            c += wl;
                        }
                        turd = punct = m[0];
                        pi = 0;
                        advance = 1;
                        clss = 'punct';
                        while (pi < punct.length - 1) {
                            pc = punct[pi];
                            advance = 1;
                            if ((0xD800 <= (ref1 = punct.charCodeAt(pi)) && ref1 <= 0xDBFF) && (0xDC00 <= (ref2 = punct.charCodeAt(pi + 1)) && ref2 <= 0xDFFF)) {
                                advance = 2;
                                clss = 'text';
                                pc += punct[pi + 1];
                            } else {
                                clss = 'punct';
                                if (pc === ',' || pc === ';' || pc === '{' || pc === '}' || pc === '(' || pc === ')') {
                                    clss += ' minor';
                                }
                            }
                            pi += advance;
                            line.chunks.push({
                                start: c,
                                length: advance,
                                match: pc,
                                turd: turd,
                                clss: clss
                            });
                            c += advance;
                            turd = turd.slice(advance);
                        }
                        if (pi < punct.length) {
                            clss = 'punct';
                            if ((ref3 = punct.slice(pi)) === ',' || ref3 === ';' || ref3 === '{' || ref3 === '}' || ref3 === '(' || ref3 === ')') {
                                clss += ' minor';
                            }
                            line.chunks.push({
                                start: c,
                                length: advance,
                                match: punct.slice(pi),
                                clss: clss
                            });
                            c += advance;
                        }
                    }
                    if (c < sc + l) {
                        rl = sc + l - c;
                        w = s.slice(l - rl);
                        line.chunks.push({
                            start: c,
                            length: rl,
                            match: w,
                            clss: 'text'
                        });
                        c += rl;
                    }
                }
            }
            if (line.chunks.length) {
                last = line.chunks.slice(-1)[0];
                line.chars = last.start + last.length;
            }
            return line;
        });
    };


    /*
    000   000   0000000   000   000  0000000    000      00000000  00000000    0000000
    000   000  000   000  0000  000  000   000  000      000       000   000  000
    000000000  000000000  000 0 000  000   000  000      0000000   0000000    0000000
    000   000  000   000  000  0000  000   000  000      000       000   000       000
    000   000  000   000  000   000  0000000    0000000  00000000  000   000  0000000
     */

    extStack = [];

    stack = [];

    handl = [];

    extTop = null;

    stackTop = null;

    notCode = false;

    topType = '';

    ext = '';

    line = null;

    chunk = null;

    chunkIndex = 0;

    fillComment = function(n) {
        var c, i, k, len1, len2, mightBeHeader, q, r, ref1, restChunks;
        for (i = k = 0, ref1 = n; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
            addValue(i, 'comment');
        }
        if (chunkIndex < line.chunks.length - n) {
            restChunks = line.chunks.slice(chunkIndex + n);
            mightBeHeader = true;
            for (q = 0, len1 = restChunks.length; q < len1; q++) {
                c = restChunks[q];
                c.clss = 'comment';
                if (mightBeHeader && !HEADER.test(c.match)) {
                    mightBeHeader = false;
                }
            }
            if (mightBeHeader) {
                for (r = 0, len2 = restChunks.length; r < len2; r++) {
                    c = restChunks[r];
                    c.clss += ' header';
                }
            }
        }
        return line.chunks.length - chunkIndex + n;
    };

    hashComment = function() {
        if (stackTop && topType !== 'regexp triple') {
            return;
        }
        if (stackTop && stackTop.lineno === line.number) {
            return;
        }
        if (chunk.match === "#") {
            return fillComment(1);
        }
    };

    noonComment = function() {
        if (stackTop) {
            return;
        }
        if (chunk.match === "#" && chunkIndex === 0) {
            return fillComment(1);
        }
    };

    slashComment = function() {
        var ref1;
        if (stackTop) {
            return;
        }
        if ((ref1 = chunk.turd) != null ? ref1.startsWith("//") : void 0) {
            return fillComment(2);
        }
    };

    blockComment = function() {
        var type;
        if (!chunk.turd || chunk.turd.length < 3) {
            return;
        }
        type = 'comment triple';
        if (topType && (topType !== 'interpolation' && topType !== type)) {
            return;
        }
        if (chunk.turd.slice(0, 3) === '###') {
            if (topType === type) {
                popStack();
            } else {
                pushStack({
                    type: type,
                    strong: true
                });
            }
            return addValues(3, type);
        }
    };

    starComment = function() {
        var type;
        if (!chunk.turd) {
            return;
        }
        type = 'comment triple';
        if (topType && topType !== type) {
            return;
        }
        if (chunk.turd.slice(0, 2) === '/*' && !topType) {
            pushStack({
                type: type,
                strong: true
            });
            return addValues(2, type);
        }
        if (chunk.turd.slice(0, 2) === '*/' && topType === type) {
            popStack();
            return addValues(2, type);
        }
    };

    dashArrow = function() {
        var markFunc, ref1;
        if (notCode) {
            return;
        }
        markFunc = function() {
            if (line.chunks[0].clss === 'text') {
                if (line.chunks[1].match === '=' && line.chunks[2].match !== '>') {
                    line.chunks[0].clss = 'function';
                    return line.chunks[1].clss += ' function';
                } else if (line.chunks[1].match === ':') {
                    line.chunks[0].clss = 'method';
                    return line.chunks[1].clss += ' method';
                }
            }
        };
        if (chunk.turd) {
            if (chunk.turd.startsWith('->')) {
                markFunc();
                addValue(0, 'function tail');
                addValue(1, 'function head');
                if (line.chunks[0].clss === 'dictionary key' || ((ref1 = line.chunks[0].turd) != null ? ref1.slice(0, 2) : void 0) === '@:') {
                    line.chunks[0].clss = 'method';
                    line.chunks[1].clss = 'punct method';
                } else if (line.chunks[0].match === '@' && line.chunks[1].clss === 'dictionary key') {
                    line.chunks[0].clss = 'punct method class';
                    line.chunks[1].clss = 'method class';
                    line.chunks[2].clss = 'punct method class';
                }
                return 2;
            }
            if (chunk.turd.startsWith('=>')) {
                markFunc();
                addValue(0, 'function bound tail');
                addValue(1, 'function bound head');
                if (line.chunks[0].clss === 'dictionary key') {
                    line.chunks[0].clss = 'method';
                    line.chunks[1].clss = 'punct method';
                }
                return 2;
            }
        }
    };

    cppPointer = function() {
        if (notCode) {
            return;
        }
        if (chunk.turd) {
            if (chunk.turd.startsWith('->')) {
                addValue(0, 'arrow tail');
                addValue(1, 'arrow head');
                return 2;
            }
        }
    };

    commentHeader = function() {
        if (topType === 'comment triple') {
            if (HEADER.test(chunk.match)) {
                chunk.clss = 'comment triple header';
                return 1;
            }
        }
    };

    thisCall = function() {
        setValue(-1, 'function call');
        if (getmatch(-2) === '@') {
            setValue(-2, 'punct function call');
        }
        return 0;
    };

    coffeePunct = function() {
        var next, prev, prevEnd, ref1, ref2, ref3;
        if (notCode) {
            return;
        }
        if (chunk.match === '▸') {
            return addValue(0, 'meta');
        }
        if (chunk.turd === '~>') {
            return addValues(2, 'meta');
        }
        if (prev = getChunk(-1)) {
            if (((ref1 = chunk.turd) != null ? ref1.startsWith('..') : void 0) && prev.match !== '.') {
                if (chunk.turd[2] !== '.') {
                    return addValues(2, 'range');
                }
                if (chunk.turd[3] !== '.') {
                    return addValues(3, 'range');
                }
            }
            if (prev.clss.startsWith('text') || prev.clss === 'property') {
                prevEnd = prev.start + prev.length;
                if (chunk.match === '(' && prevEnd === chunk.start) {
                    return thisCall();
                } else if (prevEnd < chunk.start) {
                    if (ref2 = chunk.match, indexOf.call('@[({"\'', ref2) >= 0) {
                        return thisCall();
                    } else if (ref3 = chunk.match, indexOf.call('+-/', ref3) >= 0) {
                        next = getChunk(1);
                        if (!next || next.match !== '=' && next.start === chunk.start + 1) {
                            return thisCall();
                        }
                    }
                }
            }
        }
    };

    coffeeWord = function() {
        var prev, ref1;
        if (notCode) {
            return;
        }
        if (prev = getChunk(-1)) {
            if (prev.clss === 'punct meta') {
                if (chunk.start === prev.start + 1) {
                    setValue(0, 'meta');
                    return 0;
                }
            }
            if ((ref1 = prev.match) === 'class' || ref1 === 'extends') {
                setValue(0, 'class');
                return 1;
            }
            if (chunk.clss.startsWith('keyword')) {
                return 1;
            }
            if (prev.match === '@') {
                addValue(-1, 'this');
                addValue(0, 'this');
                return 1;
            }
            if ((prev.clss.startsWith('text') || prev.clss === 'property') && prev.start + prev.length < chunk.start) {
                return thisCall();
            }
        }
    };

    property = function() {
        var prevPrev, ref1;
        if (notCode) {
            return;
        }
        if (getmatch(-1) === '.') {
            prevPrev = getChunk(-2);
            if ((prevPrev != null ? prevPrev.match : void 0) !== '.') {
                addValue(-1, 'property');
                setValue(0, 'property');
                if (prevPrev) {
                    if (((ref1 = prevPrev.clss) !== 'property' && ref1 !== 'number') && !prevPrev.clss.startsWith('punct')) {
                        setValue(-2, 'obj');
                    }
                }
                return 1;
            }
        }
    };

    cppWord = function() {
        var p, prevPrev, ref1, ref2, ref3;
        if (notCode) {
            return;
        }
        if (p = property()) {
            return p;
        }
        if (((ref1 = getChunk(-2)) != null ? ref1.turd : void 0) === '::') {
            if (prevPrev = getChunk(-3)) {
                setValue(-3, 'punct obj');
                addValue(-2, 'obj');
                addValue(-1, 'obj');
                setValue(0, 'method');
                return 1;
            }
        }
        if (getmatch(-1) === '<' && (ref2 = getmatch(1), indexOf.call(',>', ref2) >= 0) || getmatch(1) === '>' && (ref3 = getmatch(-1), indexOf.call(',', ref3) >= 0)) {
            setValue(-1, 'punct template');
            setValue(0, 'template');
            setValue(1, 'punct template');
            return 2;
        }
        if (/[A-Z]/.test(chunk.match[1])) {
            switch (chunk.match[0]) {
                case 'T':
                    if (getmatch(1) === '<') {
                        setValue(0, 'keyword type');
                        return 1;
                    }
                    break;
                case 'F':
                    setValue(0, 'struct');
                    return 1;
                case 'A':
                case 'U':
                    setValue(0, 'obj');
                    return 1;
            }
        }
        if (chunk.clss === 'text' && getmatch(1) === '(') {
            setValue(0, 'function call');
            return 1;
        }
    };

    noonProp = function() {
        var i, k, prev, ref1;
        if (prev = getChunk(-1)) {
            if (prev.start + prev.length + 1 < chunk.start) {
                if (prev.clss !== 'obj') {
                    for (i = k = ref1 = chunkIndex - 1; ref1 <= 0 ? k <= 0 : k >= 0; i = ref1 <= 0 ? ++k : --k) {
                        if (i < chunkIndex - 1 && line.chunks[i].start + line.chunks[i].length + 1 < line.chunks[i + 1].start) {
                            break;
                        }
                        if (line.chunks[i].clss === 'text' || line.chunks[i].clss === 'obj') {
                            line.chunks[i].clss = 'property';
                        } else if (line.chunks[i].clss === 'punct') {
                            line.chunks[i].clss = 'punct property';
                        } else {
                            break;
                        }
                    }
                }
            }
        }
        return 0;
    };

    noonPunct = function() {
        if (notCode) {
            return;
        }
        return noonProp();
    };

    noonWord = function() {
        if (notCode) {
            return;
        }
        if (chunk.start === 0) {
            setValue(0, 'obj');
            return 1;
        }
        return noonProp();
    };

    urlPunct = function() {
        var fileext, i, k, next, prev, ref1, ref2, ref3;
        if (prev = getChunk(-1)) {
            if (chunk.turd === '://') {
                if (getmatch(4) === '.' && getChunk(5)) {
                    setValue(-1, 'url protocol');
                    addValues(3, 'url');
                    setValue(3, 'url domain');
                    setValue(4, 'punct url tld');
                    setValue(5, 'url tld');
                    return 6;
                }
            }
            if (chunk.match === '.') {
                if (!prev.clss.startsWith('number') && prev.clss !== 'semver' && (ref1 = prev.match, indexOf.call('\\./', ref1) < 0)) {
                    if (next = getChunk(1)) {
                        if (next.start === chunk.start + chunk.length) {
                            fileext = next.match;
                            if (indexOf.call('\\./*+', fileext) < 0) {
                                setValue(-1, fileext + ' file');
                                addValue(0, fileext);
                                setValue(1, fileext + ' ext');
                                return 2;
                            }
                        }
                    }
                }
            }
            if (chunk.match === '/') {
                for (i = k = ref2 = chunkIndex; ref2 <= 0 ? k <= 0 : k >= 0; i = ref2 <= 0 ? ++k : --k) {
                    if (line.chunks[i].start + line.chunks[i].length < ((ref3 = line.chunks[i + 1]) != null ? ref3.start : void 0)) {
                        break;
                    }
                    if (line.chunks[i].clss.endsWith('dir')) {
                        break;
                    }
                    if (line.chunks[i].clss.startsWith('url')) {
                        break;
                    }
                    if (line.chunks[i].match === '"') {
                        break;
                    }
                    if (line.chunks[i].clss.startsWith('punct')) {
                        line.chunks[i].clss = 'punct dir';
                    } else {
                        line.chunks[i].clss = 'text dir';
                    }
                }
                return 1;
            }
        }
        return 0;
    };

    urlWord = function() {
        var next, prev, ref1, ref2;
        if (prev = getChunk(-1)) {
            if (ref1 = prev.match, indexOf.call('\\/', ref1) >= 0) {
                next = getChunk(1);
                if (!next || next.start > chunk.start + chunk.length || (ref2 = next.match, indexOf.call('\\./', ref2) < 0)) {
                    return addValue(0, 'file');
                }
            }
        }
    };

    jsPunct = function() {
        var prev;
        if (notCode) {
            return;
        }
        if (prev = getChunk(-1)) {
            if (chunk.match === '(') {
                if (prev.clss.startsWith('text') || prev.clss === 'property') {
                    setValue(-1, 'function call');
                    return 1;
                }
            }
        }
    };

    jsWord = function() {
        if (chunk.clss === 'keyword function') {
            if (getmatch(-1) === '=' && getValue(-2).startsWith('text')) {
                setValue(-2, 'function');
            }
        }
        return 0;
    };

    dict = function() {
        var prev, ref1, ref2;
        if (notCode) {
            return;
        }
        if (chunk.match === ':' && !((ref1 = chunk.turd) != null ? ref1.startsWith('::') : void 0)) {
            if (prev = getChunk(-1)) {
                if ((ref2 = prev.clss.split(' ')[0]) === 'string' || ref2 === 'number' || ref2 === 'text' || ref2 === 'keyword') {
                    setValue(-1, 'dictionary key');
                    setValue(0, 'punct dictionary');
                    return 1;
                }
            }
        }
    };

    jsonPunct = function() {
        var i, k, prev, ref1, ref2, ref3;
        if (notCode) {
            return;
        }
        if (chunk.match === ':') {
            if (prev = getChunk(-1)) {
                if (prev.match === '"') {
                    for (i = k = ref1 = Math.max(0, chunkIndex - 2); ref1 <= 0 ? k <= 0 : k >= 0; i = ref1 <= 0 ? ++k : --k) {
                        if (((ref2 = line.chunks[i]) != null ? ref2.clss : void 0) === 'punct string double') {
                            line.chunks[i].clss = 'punct dictionary';
                            break;
                        }
                        if ((ref3 = line.chunks[i]) != null) {
                            ref3.clss = 'dictionary key';
                        }
                    }
                    setValue(-1, 'punct dictionary');
                    setValue(0, 'punct dictionary');
                    return 1;
                }
            }
        }
    };

    jsonWord = function() {
        var prev, ref1, ref2;
        if ((topType === 'string double' || topType === 'string single') && (prev = getChunk(-1))) {
            if (ref1 = prev.match, indexOf.call('"^~=', ref1) >= 0) {
                if (NUMBER.test(getmatch(0)) && getmatch(1) === '.' && NUMBER.test(getmatch(2)) && getmatch(3) === '.' && NUMBER.test(getmatch(4))) {
                    if (ref2 = prev.match, indexOf.call('^~=', ref2) >= 0) {
                        setValue(-1, 'punct semver');
                        if (getmatch(-2) === '>') {
                            setValue(-2, 'punct semver');
                        }
                    }
                    setValue(0, 'semver');
                    setValue(1, 'punct semver');
                    setValue(2, 'semver');
                    setValue(3, 'punct semver');
                    setValue(4, 'semver');
                    return 5;
                }
            }
        }
    };

    escape = function() {
        var ref1, ref2, ref3, ref4;
        if (chunk.match === '\\' && ((topType != null ? topType.startsWith('regexp') : void 0) || (topType != null ? topType.startsWith('string') : void 0))) {
            if (chunkIndex === 0 || !((ref1 = getChunk(-1)) != null ? ref1.escape : void 0)) {
                if (((ref2 = getChunk(1)) != null ? ref2.start : void 0) === chunk.start + 1) {
                    chunk.escape = true;
                    addValue(0, 'escape');
                    if (topType === 'string single' && ((ref3 = getChunk(1)) != null ? ref3.match : void 0) === "'") {
                        setValue(0, topType);
                        return 1;
                    }
                    if (topType === 'string double' && ((ref4 = getChunk(1)) != null ? ref4.match : void 0) === '"') {
                        setValue(0, topType);
                        return 1;
                    }
                    return stacked();
                }
            }
        }
    };

    regexp = function() {
        var next, prev, ref1, ref2;
        if (topType != null ? topType.startsWith('string') : void 0) {
            return;
        }
        if ((ref1 = getChunk(-1)) != null ? ref1.escape : void 0) {
            return stacked();
        }
        if (chunk.match === '/') {
            if (topType === 'regexp') {
                chunk.clss += ' regexp end';
                popStack();
                return 1;
            }
            if (chunkIndex) {
                prev = getChunk(-1);
                next = getChunk(+1);
                if (!prev.clss.startsWith('punct') && !prev.clss.startsWith('keyword') || (ref2 = prev.match, indexOf.call(")]", ref2) >= 0)) {
                    if ((prev.start + prev.length < chunk.start) && (next != null ? next.start : void 0) > chunk.start + 1) {
                        return;
                    }
                    if ((prev.start + prev.length === chunk.start) && (next != null ? next.start : void 0) === chunk.start + 1) {
                        return;
                    }
                }
                if ((next != null ? next.match : void 0) === '=') {
                    return;
                }
                if (prev.clss.startsWith('number')) {
                    return;
                }
            }
            pushStack({
                type: 'regexp'
            });
            return addValue(0, 'regexp start');
        }
        return escape();
    };

    tripleRegexp = function() {
        var type;
        if (!chunk.turd || chunk.turd.length < 3) {
            return;
        }
        type = 'regexp triple';
        if (topType && (topType !== 'interpolation' && topType !== type)) {
            return;
        }
        if (chunk.turd.slice(0, 3) === '///') {
            if (topType === type) {
                popStack();
            } else {
                pushStack({
                    type: type,
                    lineno: line.number
                });
            }
            return addValues(3, type);
        }
    };

    simpleString = function() {
        var next, ref1, ref2, ref3, scnd, type;
        if (topType === 'regexp') {
            return;
        }
        if ((ref1 = getChunk(-1)) != null ? ref1.escape : void 0) {
            return stacked();
        }
        if (ref2 = chunk.match, indexOf.call('"\'', ref2) >= 0) {
            type = (function() {
                switch (chunk.match) {
                    case '"':
                        return 'string double';
                    case "'":
                        return 'string single';
                }
            })();
            if (chunk.match === "'") {
                next = getChunk(1);
                if ((ref3 = next != null ? next.match : void 0) === 's' || ref3 === 'd' || ref3 === 't' || ref3 === 'll' || ref3 === 're') {
                    if (next.start === chunk.start + chunk.length) {
                        scnd = getChunk(2);
                        if (!scnd || scnd.match !== "'") {
                            return stacked();
                        }
                    }
                }
            }
            if (topType === type) {
                addValue(0, type);
                popStack();
                return 1;
            } else if (notCode) {
                return stacked();
            }
            pushStack({
                strong: true,
                type: type
            });
            addValue(0, type);
            return 1;
        }
        return escape();
    };

    tripleString = function() {
        var ref1, type;
        if (!chunk.turd || chunk.turd.length < 3) {
            return;
        }
        if (topType === 'regexp' || topType === 'string single' || topType === 'string double') {
            return;
        }
        if ((ref1 = getChunk(-1)) != null ? ref1.escape : void 0) {
            return stacked();
        }
        type = (function() {
            switch (chunk.turd.slice(0, 3)) {
                case '"""':
                    return 'string double triple';
                case "'''":
                    return 'string single triple';
            }
        })();
        if (type) {
            if (type !== topType && (topType != null ? topType.startsWith('string') : void 0)) {
                return;
            }
            if (topType === type) {
                popStack();
            } else {
                pushStack({
                    strong: true,
                    type: type
                });
            }
            return addValues(3, type);
        }
        return escape();
    };

    number = function() {
        var ref1;
        if (notCode) {
            return;
        }
        if (NUMBER.test(chunk.match)) {
            if (getmatch(-1) === '.') {
                if (getValue(-4) === 'number float' && getValue(-2) === 'number float') {
                    if (ref1 = getmatch(-5), indexOf.call('^~=', ref1) >= 0) {
                        setValue(-5, 'punct semver');
                        if (getmatch(-6) === '>') {
                            setValue(-6, 'punct semver');
                        }
                    }
                    setValue(-4, 'semver');
                    setValue(-3, 'punct semver');
                    setValue(-2, 'semver');
                    setValue(-1, 'punct semver');
                    setValue(0, 'semver');
                    return 1;
                }
                if (getValue(-2) === 'number') {
                    setValue(-2, 'number float');
                    addValue(-1, 'number float');
                    setValue(0, 'number float');
                    return 1;
                }
            }
            chunk.clss = 'number';
            return 1;
        }
        if (HEXNUM.test(chunk.match)) {
            chunk.clss = 'number hex';
            return 1;
        }
    };

    float = function() {
        if (FLOAT.test(chunk.match)) {
            if (getmatch(-1) === '.') {
                if (getValue(-2) === 'number') {
                    setValue(-2, 'number float');
                    addValue(-1, 'number float');
                    setValue(0, 'number float');
                    return 1;
                }
            }
            chunk.clss = 'number float';
            return 1;
        }
    };

    cssWord = function() {
        var prev, prevPrev, ref1, ref2, ref3, ref4;
        if (((ref1 = chunk.match.slice(-2)) === 'px' || ref1 === 'em' || ref1 === 'ex') && NUMBER.test(chunk.match.slice(0, -2))) {
            setValue(0, 'number');
            return 1;
        }
        if (((ref2 = chunk.match.slice(-1)) === 's') && NUMBER.test(chunk.match.slice(0, -1))) {
            setValue(0, 'number');
            return 1;
        }
        if (prev = getChunk(-1)) {
            if (prev.match === '.' && ((ref3 = getChunk(-2)) != null ? ref3.clss : void 0) !== 'number') {
                addValue(-1, 'class');
                setValue(0, 'class');
                return 1;
            }
            if (prev.match === "#") {
                if (chunk.match.length === 3 || chunk.match.length === 6) {
                    if (HEX.test(chunk.match)) {
                        addValue(-1, 'number hex');
                        setValue(0, 'number hex');
                        return 1;
                    }
                }
                addValue(-1, 'function');
                setValue(0, 'function');
                return 1;
            }
            if (prev.match === '-') {
                if (prevPrev = getChunk(-2)) {
                    if ((ref4 = prevPrev.clss) === 'class' || ref4 === 'function') {
                        addValue(-1, prevPrev.clss);
                        setValue(0, prevPrev.clss);
                        return 1;
                    }
                }
            }
        }
    };

    mdPunct = function() {
        var ref1, ref2, ref3, ref4, ref5, type;
        if (chunkIndex === 0) {
            if (!chunk.turd && (ref1 = chunk.match, indexOf.call('-*', ref1) >= 0) && ((ref2 = getChunk(1)) != null ? ref2.start : void 0) > chunk.start + 1) {
                type = ['li1', 'li2', 'li3'][chunk.start / 4];
                pushStack({
                    merge: true,
                    fill: true,
                    type: type
                });
                return addValue(0, type + ' marker');
            }
            if (chunk.match === '#') {
                if (!chunk.turd) {
                    pushStack({
                        merge: true,
                        fill: true,
                        type: 'h1'
                    });
                    return addValue(0, 'h1');
                }
                switch (chunk.turd) {
                    case '##':
                        pushStack({
                            merge: true,
                            fill: true,
                            type: 'h2'
                        });
                        return addValues(2, 'h2');
                    case '###':
                        pushStack({
                            merge: true,
                            fill: true,
                            type: 'h3'
                        });
                        return addValues(3, 'h3');
                    case '####':
                        pushStack({
                            merge: true,
                            fill: true,
                            type: 'h4'
                        });
                        return addValues(4, 'h4');
                    case '#####':
                        pushStack({
                            merge: true,
                            fill: true,
                            type: 'h5'
                        });
                        return addValues(5, 'h5');
                }
            }
        }
        if (chunk.match === '*') {
            if (((ref3 = chunk.turd) != null ? ref3.slice(0, 2) : void 0) === '**') {
                type = 'bold';
                if (topType != null ? topType.endsWith(type) : void 0) {
                    addValues(2, topType);
                    popStack();
                    return 2;
                }
                if (stackTop != null ? stackTop.merge : void 0) {
                    type = stackTop.type + ' ' + type;
                }
                pushStack({
                    merge: true,
                    type: type
                });
                return addValues(2, type);
            }
            type = 'italic';
            if (topType != null ? topType.endsWith(type) : void 0) {
                addValue(0, topType);
                popStack();
                return 1;
            }
            if (stackTop != null ? stackTop.merge : void 0) {
                type = stackTop.type + ' ' + type;
            }
            pushStack({
                merge: true,
                type: type
            });
            addValue(0, type);
            return 1;
        }
        if (chunk.match === '`') {
            if (((ref4 = chunk.turd) != null ? ref4.slice(0, 3) : void 0) === '```') {
                type = 'code triple';
                if ((ref5 = getmatch(3)) === 'coffeescript' || ref5 === 'javascript' || ref5 === 'js') {
                    setValue(3, 'comment');
                    return addValues(3, type);
                }
                pushStack({
                    weak: true,
                    type: type
                });
                return addValues(3, type);
            }
            type = 'code';
            if (topType != null ? topType.endsWith(type) : void 0) {
                addValue(0, topType);
                popStack();
                return 1;
            }
            if (stackTop != null ? stackTop.merge : void 0) {
                type = stackTop.type + ' ' + type;
            }
            pushStack({
                merge: true,
                type: type
            });
            return addValue(0, type);
        }
    };

    interpolation = function() {
        var ref1;
        if (topType != null ? topType.startsWith('string double') : void 0) {
            if ((ref1 = chunk.turd) != null ? ref1.startsWith("\#{") : void 0) {
                pushStack({
                    type: 'interpolation',
                    weak: true
                });
                setValue(0, 'punct string interpolation start');
                setValue(1, 'punct string interpolation start');
                return 2;
            }
        } else if (topType === 'interpolation') {
            if (chunk.match === '}') {
                setValue(0, 'punct string interpolation end');
                popStack();
                return 1;
            }
        }
    };

    keyword = function() {
        if (notCode) {
            return;
        }
        if (!lang[ext]) {
            return;
        }
        if (lang[ext].hasOwnProperty(chunk.match)) {
            chunk.clss = lang[ext][chunk.match];
        }
    };

    xmlPunct = function() {
        var ref1;
        if (chunk.turd === '</') {
            return addValues(2, 'keyword');
        }
        if ((ref1 = chunk.match) === '<' || ref1 === '>') {
            return addValue(0, 'keyword');
        }
    };

    cppMacro = function() {
        if (chunk.match === "#") {
            addValue(0, 'define');
            setValue(1, 'define');
            return 2;
        }
    };

    shPunct = function() {
        var ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8;
        if (notCode) {
            return;
        }
        if (chunk.match === '/' && ((ref1 = getChunk(-1)) != null ? ref1.start : void 0) + ((ref2 = getChunk(-1)) != null ? ref2.length : void 0) === chunk.start) {
            return addValue(-1, 'dir');
        }
        if (chunk.turd === '--' && ((ref3 = getChunk(2)) != null ? ref3.start : void 0) === chunk.start + 2 && ((ref4 = getChunk(-1)) != null ? ref4.start : void 0) + ((ref5 = getChunk(-1)) != null ? ref5.length : void 0) < chunk.start) {
            addValue(0, 'argument');
            addValue(1, 'argument');
            setValue(2, 'argument');
            return 3;
        }
        if (chunk.match === '-' && ((ref6 = getChunk(1)) != null ? ref6.start : void 0) === chunk.start + 1 && ((ref7 = getChunk(-1)) != null ? ref7.start : void 0) + ((ref8 = getChunk(-1)) != null ? ref8.length : void 0) < chunk.start) {
            addValue(0, 'argument');
            setValue(1, 'argument');
            return 2;
        }
        if (chunk.match === '~' && (!getChunk(-1) || getChunk(-1).start + getChunk(-1).length < chunk.start)) {
            setValue(0, 'text dir');
            return 1;
        }
    };

    stacked = function() {
        if (stackTop) {
            if (stackTop.weak) {
                return;
            }
            if (stackTop.strong) {
                chunk.clss = topType;
            } else {
                chunk.clss += ' ' + topType;
            }
            return 1;
        }
    };

    pushExt = function(mtch) {
        extTop = {
            "switch": mtch,
            start: line,
            stack: stack
        };
        return extStack.push(extTop);
    };

    actExt = function() {
        stack = [];
        stackTop = null;
        topType = '';
        return notCode = false;
    };

    popExt = function() {
        stack = extTop.stack;
        line.ext = extTop.start.ext;
        extStack.pop();
        extTop = extStack.slice(-1)[0];
        stackTop = stack.slice(-1)[0];
        topType = stackTop != null ? stackTop.type : void 0;
        return notCode = stackTop && indexOf.call(codeTypes, topType) < 0;
    };

    pushStack = function(o) {
        stack.push(o);
        stackTop = o;
        topType = o.type;
        return notCode = indexOf.call(codeTypes, topType) < 0;
    };

    popStack = function() {
        stack.pop();
        stackTop = stack.slice(-1)[0];
        topType = stackTop != null ? stackTop.type : void 0;
        return notCode = stackTop && indexOf.call(codeTypes, topType) < 0;
    };

    getChunk = function(d) {
        return line.chunks[chunkIndex + d];
    };

    setValue = function(d, value) {
        var ref1;
        if ((0 <= (ref1 = chunkIndex + d) && ref1 < line.chunks.length)) {
            return line.chunks[chunkIndex + d].clss = value;
        }
    };

    getValue = function(d) {
        var ref1, ref2;
        return (ref1 = (ref2 = getChunk(d)) != null ? ref2.clss : void 0) != null ? ref1 : '';
    };

    getmatch = function(d) {
        var ref1, ref2;
        return (ref1 = (ref2 = getChunk(d)) != null ? ref2.match : void 0) != null ? ref1 : '';
    };

    addValue = function(d, value) {
        var ref1;
        if ((0 <= (ref1 = chunkIndex + d) && ref1 < line.chunks.length)) {
            line.chunks[chunkIndex + d].clss += ' ' + value;
        }
        return 1;
    };

    addValues = function(n, value) {
        var i, k, ref1;
        for (i = k = 0, ref1 = n; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
            addValue(i, value);
        }
        return n;
    };

    handlers = {
        coffee: {
            punct: [blockComment, hashComment, tripleRegexp, coffeePunct, tripleString, simpleString, interpolation, dashArrow, regexp, dict],
            word: [keyword, coffeeWord, number, property]
        },
        kode: {
            punct: [blockComment, hashComment, tripleRegexp, coffeePunct, tripleString, simpleString, interpolation, dashArrow, regexp, dict],
            word: [keyword, coffeeWord, number, property]
        },
        noon: {
            punct: [noonComment, noonPunct, urlPunct],
            word: [noonWord, urlWord, number]
        },
        js: {
            punct: [starComment, slashComment, jsPunct, simpleString, dashArrow, regexp, dict],
            word: [keyword, jsWord, number, property]
        },
        ts: {
            punct: [starComment, slashComment, jsPunct, simpleString, dashArrow, regexp, dict],
            word: [keyword, jsWord, number, property]
        },
        iss: {
            punct: [starComment, slashComment, simpleString],
            word: [keyword, number]
        },
        ini: {
            punct: [starComment, slashComment, simpleString, cppMacro, cppPointer],
            word: [number]
        },
        cpp: {
            punct: [starComment, slashComment, simpleString, cppMacro, cppPointer],
            word: [keyword, number, float, cppWord]
        },
        frag: {
            punct: [starComment, slashComment, simpleString, cppMacro, cppPointer],
            word: [keyword, number, float, cppWord]
        },
        vert: {
            punct: [starComment, slashComment, simpleString, cppMacro, cppPointer],
            word: [keyword, number, float, cppWord]
        },
        hpp: {
            punct: [starComment, slashComment, simpleString, cppMacro, cppPointer],
            word: [keyword, number, float, cppWord]
        },
        c: {
            punct: [starComment, slashComment, simpleString, cppMacro, cppPointer],
            word: [keyword, number, float, cppWord]
        },
        h: {
            punct: [starComment, slashComment, simpleString, cppMacro, cppPointer],
            word: [keyword, number, float, cppWord]
        },
        cs: {
            punct: [starComment, slashComment, simpleString],
            word: [keyword, number]
        },
        pug: {
            punct: [starComment, slashComment, simpleString],
            word: [keyword, cssWord, number]
        },
        styl: {
            punct: [starComment, slashComment, simpleString],
            word: [keyword, cssWord, number]
        },
        css: {
            punct: [starComment, slashComment, simpleString],
            word: [keyword, cssWord, number]
        },
        sass: {
            punct: [starComment, slashComment, simpleString],
            word: [keyword, cssWord, number]
        },
        scss: {
            punct: [starComment, slashComment, simpleString],
            word: [keyword, cssWord, number]
        },
        swift: {
            punct: [starComment, slashComment, simpleString, dict],
            word: [keyword, number, property]
        },
        svg: {
            punct: [simpleString, xmlPunct],
            word: [keyword, number]
        },
        html: {
            punct: [simpleString, xmlPunct],
            word: [keyword, number]
        },
        htm: {
            punct: [simpleString, xmlPunct],
            word: [keyword, number]
        },
        xml: {
            punct: [simpleString, xmlPunct],
            word: [number]
        },
        sh: {
            punct: [hashComment, simpleString, urlPunct, shPunct],
            word: [keyword, urlWord, number]
        },
        json: {
            punct: [simpleString, jsonPunct, urlPunct],
            word: [keyword, jsonWord, urlWord, number]
        },
        yml: {
            punct: [hashComment, simpleString, urlPunct, shPunct, dict],
            word: [keyword, jsonWord, urlWord, number, property]
        },
        yaml: {
            punct: [hashComment, simpleString, urlPunct, shPunct, dict],
            word: [keyword, jsonWord, urlWord, number, property]
        },
        log: {
            punct: [simpleString, urlPunct, dict],
            word: [urlWord, number]
        },
        md: {
            punct: [mdPunct, urlPunct, xmlPunct],
            word: [urlWord, number]
        },
        fish: {
            punct: [hashComment, simpleString],
            word: [keyword, number]
        },
        py: {
            punct: [hashComment, simpleString],
            word: [keyword, number]
        }
    };

    for (k = 0, len1 = exts.length; k < len1; k++) {
        ext = exts[k];
        if (handlers[ext] == null) {
            handlers[ext] = {
                punct: [simpleString],
                word: [number]
            };
        }
    }

    for (ext in handlers) {
        obj = handlers[ext];
        handlers[ext].punct.push(stacked);
        handlers[ext].word.push(stacked);
    }


    /*
    0000000    000       0000000    0000000  000   000  00000000  0000000
    000   000  000      000   000  000       000  000   000       000   000
    0000000    000      000   000  000       0000000    0000000   000   000
    000   000  000      000   000  000       000  000   000       000   000
    0000000    0000000   0000000    0000000  000   000  00000000  0000000
     */

''

    blocked = function(lines) {
        var advance, beforeIndex, hnd, len2, len3, len4, len5, len6, mightBeHeader, mtch, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t, turdChunk, u, x;
        extStack = [];
        stack = [];
        handl = [];
        extTop = null;
        stackTop = null;
        notCode = false;
        topType = '';
        ext = '';
        line = null;
        chunk = null;
        chunkIndex = 0;
        for (q = 0, len2 = lines.length; q < len2; q++) {
            line = lines[q];
            if (stackTop) {
                if (stackTop.type === 'comment triple') {
                    mightBeHeader = true;
                    ref1 = line.chunks;
                    for (r = 0, len3 = ref1.length; r < len3; r++) {
                        chunk = ref1[r];
                        if (!HEADER.test(chunk.match)) {
                            mightBeHeader = false;
                            break;
                        }
                    }
                    if (mightBeHeader) {
                        ref2 = line.chunks;
                        for (t = 0, len4 = ref2.length; t < len4; t++) {
                            chunk = ref2[t];
                            chunk.clss = 'comment triple header';
                        }
                        continue;
                    }
                }
                if (stackTop.fill) {
                    popStack();
                }
            }
            if (extTop) {
                if (extTop["switch"].indent && ((ref3 = line.chunks[0]) != null ? ref3.start : void 0) <= extTop.start.chunks[0].start) {
                    popExt();
                } else {
                    line.ext = extTop["switch"].to;
                }
            }
            if (ext !== line.ext) {
                actExt();
                handl = handlers[ext = line.ext];
                if (!handl) {
                    console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1197[39m', line);
                    console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1198[39m', handlers);
                }
                if (!(handl)) {
                    console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1199[39m', '[1m[97massertion failure![39m[22m');

                    process.exit(666);
                };
            }
            chunkIndex = 0;
            while (chunkIndex < line.chunks.length) {
                chunk = line.chunks[chunkIndex];
                beforeIndex = chunkIndex;
                if (chunk.clss.startsWith('punct')) {
                    if (extTop) {
                        if ((extTop["switch"].end != null) && extTop["switch"].end === chunk.turd) {
                            if (extTop["switch"].add) {
                                addValues(chunk.turd.length, extTop["switch"].add);
                            }
                            popExt();
                        }
                    }
                    ref5 = (ref4 = handl.punct) != null ? ref4 : [];
                    for (u = 0, len5 = ref5.length; u < len5; u++) {
                        hnd = ref5[u];
                        if (advance = hnd()) {
                            chunkIndex += advance;
                            break;
                        }
                    }
                } else {
                    if (!notCode) {
                        if (mtch = (ref6 = swtch[line.ext]) != null ? ref6[chunk.match] : void 0) {
                            if (mtch.turd) {
                                turdChunk = getChunk(-mtch.turd.length);
                                if (mtch.turd === ((ref7 = turdChunk != null ? turdChunk.turd : void 0) != null ? ref7 : turdChunk != null ? turdChunk.match : void 0)) {
                                    pushExt(mtch);
                                }
                            } else if (mtch.next && getChunk(1).match === mtch.next) {
                                pushExt(mtch);
                            }
                        }
                    }
                    ref9 = (ref8 = handl.word) != null ? ref8 : [];
                    for (x = 0, len6 = ref9.length; x < len6; x++) {
                        hnd = ref9[x];
                        if (advance = hnd()) {
                            chunkIndex += advance;
                            break;
                        }
                    }
                }
                if (chunkIndex === beforeIndex) {
                    chunkIndex++;
                }
            }
        }
        return lines;
    };

    rpad = function(s, l) {
        s = String(s);
        while (s.length < l) {
            s += ' ';
        }
        return s;
    };

    pad = function(l) {
        return rpad('', l);
    };

    replaceTabs = function(s) {
        var i;
        i = 0;
        while (i < s.length) {
            if (s[i] === '\t') {
                s = s.slice(0, i) + pad(4 - (i % 4)) + s.slice(i + 1);
            }
            i += 1;
        }
        return s;
    };

    parse = function(lines, ext) {
        if (ext == null) {
            ext = 'coffee';
        }
        return blocked(chunked(lines, ext));
    };

    kolorize = function(chunk) {
        var cn, cr, len2, q, v;
        if (cn = kolor.map[chunk.clss]) {
            if (cn instanceof Array) {
                v = chunk.match;
                for (q = 0, len2 = cn.length; q < len2; q++) {
                    cr = cn[q];
                    v = kolor[cr](v);
                }
                return v;
            } else {
                return kolor[cn](chunk.match);
            }
        }
        if (chunk.clss.endsWith('file')) {
            return w8(chunk.match);
        } else if (chunk.clss.endsWith('ext')) {
            return w3(chunk.match);
        } else if (chunk.clss.startsWith('punct')) {
            if (LI.test(chunk.clss)) {
                return kolorize({
                    match: chunk.match,
                    clss: chunk.clss.replace(LI, ' ')
                });
            } else {
                return w2(chunk.match);
            }
        } else {
            if (LI.test(chunk.clss)) {
                return kolorize({
                    match: chunk.match,
                    clss: chunk.clss.replace(LI, ' ')
                });
            } else {
                return chunk.match;
            }
        }
    };

    kolorizeChunks = function(arg) {
        var c, chunks, clrzd, i, number, numstr, q, ref1, ref2, ref3;
        chunks = (ref1 = arg.chunks) != null ? ref1 : [], number = (ref2 = arg.number) != null ? ref2 : null;
        clrzd = '';
        if (number) {
            numstr = String(number);
            clrzd += w2(numstr) + rpad('', 4 - numstr.length);
        }
        c = 0;
        for (i = q = 0, ref3 = chunks.length; 0 <= ref3 ? q < ref3 : q > ref3; i = 0 <= ref3 ? ++q : --q) {
            while (c < chunks[i].start) {
                clrzd += ' ';
                c++;
            }
            clrzd += kolorize(chunks[i]);
            c += chunks[i].length;
        }
        return clrzd;
    };

    syntax = function(arg) {
        var clines, ext, index, lines, numbers, q, ref1, ref2, ref3, rngs, text;
        text = arg.text, ext = (ref1 = arg.ext) != null ? ref1 : 'coffee', numbers = (ref2 = arg.numbers) != null ? ref2 : false;
        lines = text.split(NEWLINE);
        rngs = parse(lines, ext).map(function(l) {
            return l.chunks;
        });
        clines = [];
        for (index = q = 0, ref3 = lines.length; 0 <= ref3 ? q < ref3 : q > ref3; index = 0 <= ref3 ? ++q : --q) {
            line = lines[index];
            if (ext === 'js' && line.startsWith('//# source')) {
                continue;
            }
            clines.push(kolorizeChunks({
                chunks: rngs[index],
                number: numbers && index + 1
            }));
        }
        return clines.join('\n');
    };

    module.exports = {
        kolor: kolor,
        exts: exts,
        parse: parse,
        chunked: chunked,
        ranges: function(line, ext) {
            if (ext == null) {
                ext = 'coffee';
            }
            return parse([line], ext)[0].chunks;
        },
        dissect: function(lines, ext) {
            if (ext == null) {
                ext = 'coffee';
            }
            return parse(lines, ext).map(function(l) {
                return l.chunks;
            });
        },
        kolorize: kolorize,
        kolorizeChunks: kolorizeChunks,
        syntax: syntax
    };

    ;

}).call(this);
