// koffee 1.3.0

/*
000   000  000       0000000   00000000
000  000   000      000   000  000   000
0000000    000      000   000  0000000
000  000   000      000   000  000   000
000   000  0000000   0000000   000   000
 */
var FLOAT, HEADER, HEX, HEXNUM, LI, NEWLINE, NUMBER, PUNCT, SPACE, actExt, addValue, addValues, blockComment, blocked, chunk, chunkIndex, chunked, codeTypes, coffeePunct, coffeeWord, commentHeader, cppMacro, cppWord, cssWord, dashArrow, dict, escape, ext, extStack, extTop, exts, fillComment, float, getChunk, getValue, getmatch, handl, handlers, hashComment, interpolation, j, jsPunct, jsWord, jsonPunct, jsonWord, k, keyword, kolor, kolorize, kolorizeChunks, lang, len, len1, line, mdPunct, noonComment, noonProp, noonPunct, noonWord, notCode, number, obj, pad, parse, popExt, popStack, property, pushExt, pushStack, ref, regexp, replaceTabs, rpad, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, starComment, swtch, syntax, thisCall, topType, tripleRegexp, tripleString, urlPunct, urlWord, xmlPunct,
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
    if (ext === 'koffee') {
        ext = 'coffee';
    }
    if (indexOf.call(exts, ext) < 0) {
        ext = 'txt';
    }
    lineno = 0;
    return lines.map(function(text) {
        var advance, c, chunks, k, l, last, len1, line, m, pc, pi, punct, ref1, ref2, rl, s, sc, turd, value, w, wl;
        line = {
            chunks: [],
            chars: 0,
            index: lineno++,
            number: lineno,
            ext: ext
        };
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
                            value: 'text'
                        });
                        c += wl;
                    }
                    turd = punct = m[0];
                    pi = 0;
                    advance = 1;
                    value = 'punct';
                    while (pi < punct.length - 1) {
                        pc = punct[pi];
                        advance = 1;
                        if ((0xD800 <= (ref1 = punct.charCodeAt(pi)) && ref1 <= 0xDBFF) && (0xDC00 <= (ref2 = punct.charCodeAt(pi + 1)) && ref2 <= 0xDFFF)) {
                            advance = 2;
                            value = 'text';
                            pc += punct[pi + 1];
                        } else {
                            value = 'punct';
                        }
                        pi += advance;
                        line.chunks.push({
                            start: c,
                            length: advance,
                            match: pc,
                            turd: turd,
                            value: value
                        });
                        c += advance;
                        turd = turd.slice(advance);
                    }
                    if (pi < punct.length) {
                        line.chunks.push({
                            start: c,
                            length: advance,
                            match: punct.slice(pi),
                            value: 'punct'
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
                        value: 'text'
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
            c.value = 'comment';
            if (mightBeHeader && !HEADER.test(c.match)) {
                mightBeHeader = false;
            }
        }
        if (mightBeHeader) {
            for (r = 0, len2 = restChunks.length; r < len2; r++) {
                c = restChunks[r];
                c.value += ' header';
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
        if (line.chunks[0].value === 'text') {
            if (line.chunks[1].match === '=' && line.chunks[2].match !== '>') {
                line.chunks[0].value = 'function';
                return line.chunks[1].value += ' function';
            } else if (line.chunks[1].match === ':') {
                line.chunks[0].value = 'method';
                return line.chunks[1].value += ' method';
            }
        }
    };
    if (chunk.turd) {
        if (chunk.turd.startsWith('->')) {
            markFunc();
            addValue(0, 'function tail');
            addValue(1, 'function head');
            if (line.chunks[0].value === 'dictionary key' || ((ref1 = line.chunks[0].turd) != null ? ref1.slice(0, 2) : void 0) === '@:') {
                line.chunks[0].value = 'method';
                line.chunks[1].value = 'punct method';
            } else if (line.chunks[0].match === '@' && line.chunks[1].value === 'dictionary key') {
                line.chunks[0].value = 'punct method class';
                line.chunks[1].value = 'method class';
                line.chunks[2].value = 'punct method class';
            }
            return 2;
        }
        if (chunk.turd.startsWith('=>')) {
            markFunc();
            addValue(0, 'function bound tail');
            addValue(1, 'function bound head');
            if (line.chunks[0].value === 'dictionary key') {
                line.chunks[0].value = 'method';
                line.chunks[1].value = 'punct method';
            }
            return 2;
        }
    }
};

commentHeader = function() {
    if (topType === 'comment triple') {
        if (HEADER.test(chunk.match)) {
            chunk.value = 'comment triple header';
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
        if (prev.value.startsWith('text') || prev.value === 'property') {
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
        if (prev.value === 'punct meta') {
            if (chunk.start === prev.start + 1) {
                setValue(0, 'meta');
                return 0;
            }
        }
        if ((ref1 = prev.match) === 'class' || ref1 === 'extends') {
            setValue(0, 'class');
            return 1;
        }
        if (chunk.value.startsWith('keyword')) {
            return 1;
        }
        if (prev.match === '@') {
            addValue(-1, 'this');
            addValue(0, 'this');
            return 1;
        }
        if ((prev.value.startsWith('text') || prev.value === 'property') && prev.start + prev.length < chunk.start) {
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
                if (((ref1 = prevPrev.value) !== 'property' && ref1 !== 'number') && !prevPrev.value.startsWith('punct')) {
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
                setValue(0, 'obj');
                return 1;
        }
    }
    if (chunk.value === 'text' && getmatch(1) === '(') {
        setValue(0, 'function call');
        return 1;
    }
};

noonProp = function() {
    var i, k, prev, ref1;
    if (prev = getChunk(-1)) {
        if (prev.start + prev.length + 1 < chunk.start) {
            if (prev.value !== 'obj') {
                for (i = k = ref1 = chunkIndex - 1; ref1 <= 0 ? k <= 0 : k >= 0; i = ref1 <= 0 ? ++k : --k) {
                    if (i < chunkIndex - 1 && line.chunks[i].start + line.chunks[i].length + 1 < line.chunks[i + 1].start) {
                        break;
                    }
                    if (line.chunks[i].value === 'text' || line.chunks[i].value === 'obj') {
                        line.chunks[i].value = 'property';
                    } else if (line.chunks[i].value === 'punct') {
                        line.chunks[i].value = 'punct property';
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
            if (!prev.value.startsWith('number') && prev.value !== 'semver' && (ref1 = prev.match, indexOf.call('\\./', ref1) < 0)) {
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
                if (line.chunks[i].value.endsWith('dir')) {
                    break;
                }
                if (line.chunks[i].value.startsWith('url')) {
                    break;
                }
                if (line.chunks[i].match === '"') {
                    break;
                }
                if (line.chunks[i].value.startsWith('punct')) {
                    line.chunks[i].value = 'punct dir';
                } else {
                    line.chunks[i].value = 'text dir';
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
            if (prev.value.startsWith('text') || prev.value === 'property') {
                setValue(-1, 'function call');
                return 1;
            }
        }
    }
};

jsWord = function() {
    if (chunk.value === 'keyword function') {
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
            if ((ref2 = prev.value.split(' ')[0]) === 'string' || ref2 === 'number' || ref2 === 'text' || ref2 === 'keyword') {
                setValue(-1, 'dictionary key');
                setValue(0, 'punct dictionary');
                return 1;
            }
        }
    }
};

jsonPunct = function() {
    var i, k, prev, ref1;
    if (notCode) {
        return;
    }
    if (chunk.match === ':') {
        if (prev = getChunk(-1)) {
            if (prev.match === '"') {
                for (i = k = ref1 = chunkIndex - 2; ref1 <= 0 ? k <= 0 : k >= 0; i = ref1 <= 0 ? ++k : --k) {
                    if (line.chunks[i].value === 'punct string double') {
                        line.chunks[i].value = 'punct dictionary';
                        break;
                    }
                    line.chunks[i].value = 'dictionary key';
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
    var ref1, ref2;
    if (chunk.match === '\\' && ((topType != null ? topType.startsWith('regexp') : void 0) || (topType != null ? topType.startsWith('string') : void 0))) {
        if (chunkIndex === 0 || !((ref1 = getChunk(-1)) != null ? ref1.escape : void 0)) {
            if (((ref2 = getChunk(1)) != null ? ref2.start : void 0) === chunk.start + 1) {
                chunk.escape = true;
                addValue(0, 'escape');
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
            chunk.value += ' regexp end';
            popStack();
            return 1;
        }
        if (chunkIndex) {
            prev = getChunk(-1);
            next = getChunk(+1);
            if (!prev.value.startsWith('punct') && !prev.value.startsWith('keyword') || (ref2 = prev.match, indexOf.call(")]", ref2) >= 0)) {
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
            if (prev.value.startsWith('number')) {
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
    var ref1, ref2, type;
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
        chunk.value = 'number';
        return 1;
    }
    if (HEXNUM.test(chunk.match)) {
        chunk.value = 'number hex';
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
        chunk.value = 'number float';
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
        if (prev.match === '.' && ((ref3 = getChunk(-2)) != null ? ref3.value : void 0) !== 'number') {
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
                if ((ref4 = prevPrev.value) === 'class' || ref4 === 'function') {
                    addValue(-1, prevPrev.value);
                    setValue(0, prevPrev.value);
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
        chunk.value = lang[ext][chunk.match];
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
};

stacked = function() {
    if (stackTop) {
        if (stackTop.weak) {
            return;
        }
        if (stackTop.strong) {
            chunk.value = topType;
        } else {
            chunk.value += ' ' + topType;
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
        return line.chunks[chunkIndex + d].value = value;
    }
};

getValue = function(d) {
    var ref1, ref2;
    return (ref1 = (ref2 = getChunk(d)) != null ? ref2.value : void 0) != null ? ref1 : '';
};

getmatch = function(d) {
    var ref1, ref2;
    return (ref1 = (ref2 = getChunk(d)) != null ? ref2.match : void 0) != null ? ref1 : '';
};

addValue = function(d, value) {
    var ref1;
    if ((0 <= (ref1 = chunkIndex + d) && ref1 < line.chunks.length)) {
        line.chunks[chunkIndex + d].value += ' ' + value;
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
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [number]
    },
    cpp: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float, cppWord]
    },
    hpp: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float, cppWord]
    },
    c: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float, cppWord]
    },
    h: {
        punct: [starComment, slashComment, simpleString, cppMacro],
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
                        chunk.value = 'comment triple header';
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
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1154[39m', line);
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1155[39m', handlers);
            }
            if (!(handl)) {
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1156[39m', '[1m[97massertion failure![39m[22m');

                process.exit(666);
            };
        }
        chunkIndex = 0;
        while (chunkIndex < line.chunks.length) {
            chunk = line.chunks[chunkIndex];
            beforeIndex = chunkIndex;
            if (chunk.value === 'punct') {
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
    if (cn = kolor.map[chunk.value]) {
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
    if (chunk.value.endsWith('file')) {
        return w8(chunk.match);
    } else if (chunk.value.endsWith('ext')) {
        return w3(chunk.match);
    } else if (chunk.value.startsWith('punct')) {
        if (LI.test(chunk.value)) {
            return kolorize({
                match: chunk.match,
                value: chunk.value.replace(LI, ' ')
            });
        } else {
            return w2(chunk.match);
        }
    } else {
        if (LI.test(chunk.value)) {
            return kolorize({
                match: chunk.match,
                value: chunk.value.replace(LI, ' ')
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
        if (ext === 'js' && line.startsWith('//# sourceMappingURL')) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2xvci5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsc3pCQUFBO0lBQUE7Ozs7QUFrQ0EsTUFBaUIsT0FBQSxDQUFXLFNBQUQsR0FBVyxrQkFBckIsQ0FBakIsRUFBRSxlQUFGLEVBQVE7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLEtBQUEsR0FDSTtJQUFBLE1BQUEsRUFDSTtRQUFBLEdBQUEsRUFBSztZQUFBLElBQUEsRUFBSyxHQUFMO1lBQVMsRUFBQSxFQUFHLElBQVo7WUFBaUIsTUFBQSxFQUFPLENBQXhCO1NBQUw7S0FESjtJQUVBLEdBQUEsRUFDSTtRQUFBLE1BQUEsRUFBUTtZQUFBLElBQUEsRUFBSyxHQUFMO1lBQVMsRUFBQSxFQUFHLElBQVo7WUFBaUIsTUFBQSxFQUFPLENBQXhCO1NBQVI7S0FISjtJQUlBLEVBQUEsRUFDSTtRQUFBLFlBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLFFBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1lBQWlDLEdBQUEsRUFBSSxhQUFyQztTQUFkO1FBQ0EsVUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7WUFBaUMsR0FBQSxFQUFJLGFBQXJDO1NBRGQ7S0FMSjs7O0FBUUosS0FBQSxzQ0FBQTs7SUFDSSxLQUFLLENBQUMsRUFBRyxDQUFBLEdBQUEsQ0FBVCxHQUFnQjtRQUFBLElBQUEsRUFBSyxLQUFMO1FBQVcsRUFBQSxFQUFHLEdBQWQ7UUFBbUIsR0FBQSxFQUFJLEtBQXZCO1FBQTZCLEdBQUEsRUFBSSxhQUFqQzs7QUFEcEI7O0FBR0EsS0FBQSxHQUFVOztBQUNWLE1BQUEsR0FBVTs7QUFDVixLQUFBLEdBQVU7O0FBQ1YsTUFBQSxHQUFVOztBQUNWLEtBQUEsR0FBVTs7QUFDVixN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LENBQW1CLENBQUEsQ0FBQSxDQUFFLENBQUM7SUFBL0MsQ0FKWjtJQUtBLE9BQUEsRUFBWSxTQUFDLEtBQUQsRUFBUSxHQUFSOztZQUFRLE1BQUk7O2VBQWEsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLENBQWlCLENBQUMsR0FBbEIsQ0FBc0IsU0FBQyxDQUFEO21CQUFPLENBQUMsQ0FBQztRQUFULENBQXRCO0lBQXpCLENBTFo7SUFNQSxRQUFBLEVBQVksUUFOWjtJQU9BLGNBQUEsRUFBZ0IsY0FQaEI7SUFRQSxNQUFBLEVBQVksTUFSWiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyMjXG5cbuKWuGlmIG9wdHMubGFuZyAjIGtvZmZlZSAtLWxhbmcga2xvci5jb2ZmZWVcblxuICAgIGZzICAgPSByZXF1aXJlICdmcydcbiAgICBub29uX2xvYWQgPSByZXF1aXJlICdub29uL2pzL2xvYWQnXG4gICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbiAgICBub29uRmlsZSA9IHBhdGguam9pbiBfX2Rpcm5hbWUsICdsYW5nLm5vb24nXG4gICAganNvbkZpbGUgPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdqcycgJ2xhbmcuanNvbidcblxuICAgIGxvZyAnY29tcGlsZTonIG5vb25GaWxlXG4gICAgbG9nICdvdXRwdXQ6JyAganNvbkZpbGVcblxuICAgIGxhbmcgPSB7fVxuICAgIGV4dHMgPSBbJ3R4dCcnbG9nJydrb2ZmZWUnXVxuICAgIGZvciBuYW1lcywga2V5d29yZHMgb2Ygbm9vbl9sb2FkIG5vb25GaWxlXG5cbiAgICAgICAgZm9yIGV4dCBpbiBuYW1lcy5zcGxpdCAvXFxzL1xuICAgICAgICAgICAgZXh0cy5wdXNoKGV4dCkgaWYgZXh0IG5vdCBpbiBleHRzXG4gICAgICAgICAgICBsYW5nW2V4dF0gPz0ge31cbiAgICAgICAgICAgIGZvciB2YWx1ZSx3b3JkcyBvZiBrZXl3b3Jkc1xuICAgICAgICAgICAgICAgIGZvciB3b3JkIGluIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgIGxhbmdbZXh0XVt3b3JkXSA9IHZhbHVlXG5cbiAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkge2V4dHM6ZXh0cywgbGFuZzpsYW5nfSwgbnVsbCwgJyAgICAnXG4gICAgZnMud3JpdGVGaWxlU3luYyBqc29uRmlsZSwganNvbiwgJ3V0ZjgnXG5cbnsgZXh0cywgbGFuZyB9ID0gcmVxdWlyZSBcIiN7X19kaXJuYW1lfS8uLi9qcy9sYW5nLmpzb25cIlxua29sb3IgPSByZXF1aXJlICcuL2tvbG9yJ1xuXG5zd3RjaCA9XG4gICAgY29mZmVlOlxuICAgICAgICBkb2M6IHR1cmQ6J+KWuCcgdG86J21kJyBpbmRlbnQ6MVxuICAgIHB1ZzpcbiAgICAgICAgc2NyaXB0OiBuZXh0OicuJyB0bzonanMnIGluZGVudDoxXG4gICAgbWQ6XG4gICAgICAgIGNvZmZlZXNjcmlwdDogdHVyZDonYGBgJyB0bzonY29mZmVlJyBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcbiAgICAgICAgamF2YXNjcmlwdDogICB0dXJkOidgYGAnIHRvOidqcycgICAgIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuXG5mb3IgZXh0IGluIGV4dHNcbiAgICBzd3RjaC5tZFtleHRdID0gdHVyZDonYGBgJyB0bzpleHQsIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuXG5TUEFDRSAgID0gL1xccy9cbkhFQURFUiAgPSAvXjArJC9cblBVTkNUICAgPSAvXFxXKy9nXG5OVU1CRVIgID0gL15cXGQrJC9cbkZMT0FUICAgPSAvXlxcZCtmJC9cbkhFWE5VTSAgPSAvXjB4W2EtZkEtRlxcZF0rJC9cbkhFWCAgICAgPSAvXlthLWZBLUZcXGRdKyQvXG5ORVdMSU5FID0gL1xccj9cXG4vXG5MSSAgICAgID0gLyhcXHNsaVxcZFxcc3xcXHNoXFxkXFxzKS9cblxuY29kZVR5cGVzID0gWydpbnRlcnBvbGF0aW9uJyAnY29kZSB0cmlwbGUnXVxuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG5cbuKWuGRvYyAnY2h1bmtlZCBsaW5lcywgZXh0J1xuXG4gICAgcmV0dXJucyBhcnJheSBvZlxuXG4gICAgICAgIGNodW5rczogW1xuICAgICAgICAgICAgICAgICAgICB0dXJkOiAgIHNcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6ICBzXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAgc1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogIG5cbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICBleHQ6ICAgIHNcbiAgICAgICAgY2hhcnM6ICBuXG4gICAgICAgIGluZGV4OiAgblxuICAgICAgICBudW1iZXI6IG4rMVxuXG5jaHVua2VkID0gKGxpbmVzLCBleHQpIC0+XG5cbiAgICBleHQgPSBleHRbMS4uXSBpZiBleHRbMF0gPT0gJy4nXG4gICAgZXh0ID0gJ2NvZmZlZScgaWYgZXh0ID09ICdrb2ZmZWUnXG4gICAgZXh0ID0gJ3R4dCcgaWYgZXh0IG5vdCBpbiBleHRzXG5cbiAgICBsaW5lbm8gPSAwXG4gICAgbGluZXMubWFwICh0ZXh0KSAtPlxuXG4gICAgICAgIGxpbmUgPVxuICAgICAgICAgICAgY2h1bmtzOiBbXVxuICAgICAgICAgICAgY2hhcnM6ICAwXG4gICAgICAgICAgICBpbmRleDogIGxpbmVubysrXG4gICAgICAgICAgICBudW1iZXI6IGxpbmVub1xuICAgICAgICAgICAgZXh0OiAgICBleHRcblxuICAgICAgICBjaHVua3MgPSByZXBsYWNlVGFicyh0ZXh0KS5zcGxpdCBTUEFDRVxuXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICByZXR1cm4gbGluZSAjIGVtcHR5IGxpbmVcblxuICAgICAgICBjID0gMFxuICAgICAgICBmb3IgcyBpbiBjaHVua3NcbiAgICAgICAgICAgIGlmIHMgPT0gJydcbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBjKytcbiAgICAgICAgICAgICAgICBsID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzYyA9IGNcblxuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cblxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSBQVU5DVC5leGVjIHNcblxuICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgd2wgPSBtLmluZGV4LShjLXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHNbYy1zYy4uLm0uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDp3bCwgbWF0Y2g6dywgdmFsdWU6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG5cbiAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHB1bmN0ID0gbVswXVxuXG4gICAgICAgICAgICAgICAgICAgIHBpID0gMFxuICAgICAgICAgICAgICAgICAgICBhZHZhbmNlID0gMVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdwdW5jdCdcblxuICAgICAgICAgICAgICAgICAgICB3aGlsZSBwaSA8IHB1bmN0Lmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBwYyA9IHB1bmN0W3BpXVxuICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIDB4RDgwMCA8PSBwdW5jdC5jaGFyQ29kZUF0KHBpKSA8PSAweERCRkYgYW5kIDB4REMwMCA8PSBwdW5jdC5jaGFyQ29kZUF0KHBpKzEpIDw9IDB4REZGRlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgPSAyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYyArPSBwdW5jdFtwaSsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgcGkgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6YWR2YW5jZSwgbWF0Y2g6cGMsIHR1cmQ6dHVyZCwgdmFsdWU6dmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHR1cmRbYWR2YW5jZS4uXVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIHBpIDwgcHVuY3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDphZHZhbmNlLCBtYXRjaDpwdW5jdFtwaS4uXSwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBhZHZhbmNlXG5cbiAgICAgICAgICAgICAgICBpZiBjIDwgc2MrbCAgICAgICAgIyBjaGVjayBmb3IgcmVtYWluaW5nIG5vbi1wdW5jdFxuICAgICAgICAgICAgICAgICAgICBybCA9IHNjK2wtYyAgICAjIGxlbmd0aCBvZiByZW1haW5kZXJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHNbbC1ybC4uXSAgIyB0ZXh0ICAgb2YgcmVtYWluZGVyXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOnJsLCBtYXRjaDp3LCB2YWx1ZTondGV4dCdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuXG4gICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmUuY2h1bmtzWy0xXVxuICAgICAgICAgICAgbGluZS5jaGFycyA9IGxhc3Quc3RhcnQgKyBsYXN0Lmxlbmd0aFxuXG4gICAgICAgIGxpbmVcblxuIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiMjI1xuXG5leHRTdGFjayAgID0gW11cbnN0YWNrICAgICAgPSBbXVxuaGFuZGwgICAgICA9IFtdXG5leHRUb3AgICAgID0gbnVsbFxuc3RhY2tUb3AgICA9IG51bGxcbm5vdENvZGUgICAgPSBmYWxzZSAjIHNob3J0Y3V0IGZvciB0b3Agb2Ygc3RhY2sgbm90IGluIGNvZGVUeXBlc1xudG9wVHlwZSAgICA9ICcnXG5leHQgICAgICAgID0gJydcbmxpbmUgICAgICAgPSBudWxsXG5jaHVuayAgICAgID0gbnVsbFxuY2h1bmtJbmRleCA9IDBcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuZmlsbENvbW1lbnQgPSAobikgLT5cblxuICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgYWRkVmFsdWUgaSwgJ2NvbW1lbnQnXG4gICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC1uXG4gICAgICAgIHJlc3RDaHVua3MgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4K24uLl1cbiAgICAgICAgbWlnaHRCZUhlYWRlciA9IHRydWVcbiAgICAgICAgZm9yIGMgaW4gcmVzdENodW5rc1xuICAgICAgICAgICAgYy52YWx1ZSA9ICdjb21tZW50J1xuICAgICAgICAgICAgaWYgbWlnaHRCZUhlYWRlciBhbmQgbm90IEhFQURFUi50ZXN0IGMubWF0Y2hcbiAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gZmFsc2VcbiAgICAgICAgaWYgbWlnaHRCZUhlYWRlclxuICAgICAgICAgICAgZm9yIGMgaW4gcmVzdENodW5rc1xuICAgICAgICAgICAgICAgIGMudmFsdWUgKz0gJyBoZWFkZXInXG4gICAgbGluZS5jaHVua3MubGVuZ3RoIC0gY2h1bmtJbmRleCArIG5cblxuaGFzaENvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdyZWdleHAgdHJpcGxlJ1xuICAgIGlmIHN0YWNrVG9wIGFuZCBzdGFja1RvcC5saW5lbm8gPT0gbGluZS5udW1iZXJcbiAgICAgICAgcmV0dXJuICMgY29tbWVudHMgaW5zaWRlIHRyaXBsZSByZWdleHAgb25seSB2YWxpZCBvbiBpbnRlcm5hbCBsaW5lcz9cblxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgIGZpbGxDb21tZW50IDFcblxubm9vbkNvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIiBhbmQgY2h1bmtJbmRleCA9PSAwXG4gICAgICAgIGZpbGxDb21tZW50IDFcblxuc2xhc2hDb21tZW50ID0gLT5cblxuICAgIHJldHVybiBpZiBzdGFja1RvcFxuXG4gICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCBcIi8vXCJcbiAgICAgICAgZmlsbENvbW1lbnQgMlxuXG5ibG9ja0NvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuXG4gICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZSdcblxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuXG4gICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcjIyMnXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuXG5zdGFyQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmRcblxuICAgIHR5cGUgPSAnY29tbWVudCB0cmlwbGUnXG5cbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSAhPSB0eXBlXG5cbiAgICBpZiBjaHVuay50dXJkWy4uMV0gPT0gJy8qJyBhbmQgbm90IHRvcFR5cGVcbiAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWVcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcbiAgICBpZiBjaHVuay50dXJkWy4uMV0gPT0gJyovJyBhbmQgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMFxuXG5kYXNoQXJyb3cgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIG1hcmtGdW5jID0gLT5cbiAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ3RleHQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1sxXS5tYXRjaCA9PSAnPScgYW5kIGxpbmUuY2h1bmtzWzJdLm1hdGNoICE9ICc+J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlICs9ICcgZnVuY3Rpb24nXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzFdLm1hdGNoID09ICc6J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSArPSAnIG1ldGhvZCdcblxuICAgIGlmIGNodW5rLnR1cmRcblxuICAgICAgICBpZiBjaHVuay50dXJkLnN0YXJ0c1dpdGggJy0+J1xuICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEgJ2Z1bmN0aW9uIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknIG9yIGxpbmUuY2h1bmtzWzBdLnR1cmQ/Wy4uMV0gPT0gJ0A6J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzBdLm1hdGNoID09ICdAJyBhbmQgbGluZS5jaHVua3NbMV0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCBjbGFzcydcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMl0udmFsdWUgPSAncHVuY3QgbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICAgICBpZiBjaHVuay50dXJkLnN0YXJ0c1dpdGggJz0+J1xuICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEgJ2Z1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIHJldHVybiAyXG5cbmNvbW1lbnRIZWFkZXIgPSAtPlxuXG4gICAgaWYgdG9wVHlwZSA9PSAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGlmIEhFQURFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMFxuXG50aGlzQ2FsbCA9IC0+XG5cbiAgICBzZXRWYWx1ZSAtMSAnZnVuY3Rpb24gY2FsbCdcbiAgICBpZiBnZXRtYXRjaCgtMikgPT0gJ0AnXG4gICAgICAgIHNldFZhbHVlIC0yICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgIDBcblxuY29mZmVlUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICfilrgnXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdtZXRhJ1xuXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnfj4nXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAnbWV0YSdcblxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGgoJy4uJykgYW5kIHByZXYubWF0Y2ggIT0gJy4nXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkWzJdICE9ICcuJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAncmFuZ2UnXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkWzNdICE9ICcuJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyAncmFuZ2UnXG5cbiAgICAgICAgaWYgcHJldi52YWx1ZS5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi52YWx1ZSA9PSAncHJvcGVydHknXG5cbiAgICAgICAgICAgIHByZXZFbmQgPSBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoXG4gICAgICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKCcgYW5kIHByZXZFbmQgPT0gY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgZWxzZSBpZiBwcmV2RW5kIDwgY2h1bmsuc3RhcnQgIyBzcGFjZWRcbiAgICAgICAgICAgICAgICBpZiBjaHVuay5tYXRjaCBpbiAnQFsoe1wiXFwnJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY2h1bmsubWF0Y2ggaW4gJystLydcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IG5leHQgb3IgbmV4dC5tYXRjaCAhPSAnPScgYW5kIG5leHQuc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcblxuY29mZmVlV29yZCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG5cbiAgICAgICAgaWYgcHJldi52YWx1ZSA9PSAncHVuY3QgbWV0YSdcbiAgICAgICAgICAgIGlmIGNodW5rLnN0YXJ0ID09IHByZXYuc3RhcnQrMVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ21ldGEnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAgIyBnaXZlIHN3aXRjaCBhIGNoYW5jZVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggaW4gWydjbGFzcycsICdleHRlbmRzJ11cbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ2NsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBpZiBjaHVuay52YWx1ZS5zdGFydHNXaXRoICdrZXl3b3JkJ1xuXG4gICAgICAgICAgICByZXR1cm4gMSAjIHdlIGFyZSBkb25lIHdpdGggdGhlIGtleXdvcmRcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ3RoaXMnXG4gICAgICAgICAgICBhZGRWYWx1ZSAgMCAndGhpcydcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgKHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5JykgYW5kIHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCBjaHVuay5zdGFydCAjIHNwYWNlZFxuICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcblxucHJvcGVydHkgPSAtPiAjIHdvcmRcblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgcHJldlByZXYgPSBnZXRDaHVuayAtMlxuXG4gICAgICAgIGlmIHByZXZQcmV2Py5tYXRjaCAhPSAnLidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgaWYgcHJldlByZXZcbiAgICAgICAgICAgICAgICBpZiBwcmV2UHJldi52YWx1ZSBub3QgaW4gWydwcm9wZXJ0eScsICdudW1iZXInXSBhbmQgbm90IHByZXZQcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnb2JqJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuY3BwV29yZCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgcCA9IHByb3BlcnR5KCkgdGhlbiByZXR1cm4gcFxuXG4gICAgaWYgZ2V0Q2h1bmsoLTIpPy50dXJkID09ICc6OidcblxuICAgICAgICBpZiBwcmV2UHJldiA9IGdldENodW5rIC0zXG4gICAgICAgICAgICBzZXRWYWx1ZSAtMyAncHVuY3Qgb2JqJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTIgJ29iaidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdvYmonXG4gICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnPCcgYW5kIGdldG1hdGNoKDEpIGluICcsPicgb3IgZ2V0bWF0Y2goMSkgPT0gJz4nIGFuZCBnZXRtYXRjaCgtMSkgaW4gJywnXG5cbiAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IHRlbXBsYXRlJ1xuICAgICAgICBzZXRWYWx1ZSAgMCAndGVtcGxhdGUnXG4gICAgICAgIHNldFZhbHVlICAxICdwdW5jdCB0ZW1wbGF0ZSdcbiAgICAgICAgcmV0dXJuIDJcblxuICAgIGlmIC9bQS1aXS8udGVzdCBjaHVuay5tYXRjaFsxXVxuICAgICAgICBzd2l0Y2ggY2h1bmsubWF0Y2hbMF1cbiAgICAgICAgICAgIHdoZW4gJ1QnXG4gICAgICAgICAgICAgICAgaWYgZ2V0bWF0Y2goMSkgPT0gJzwnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ2tleXdvcmQgdHlwZSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgd2hlbiAnRidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdzdHJ1Y3QnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgd2hlbiAnQSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdvYmonXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIGNodW5rLnZhbHVlID09ICd0ZXh0JyBhbmQgZ2V0bWF0Y2goMSkgPT0gJygnXG4gICAgICAgIHNldFZhbHVlIDAgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIHJldHVybiAxXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5ub29uUHJvcCA9IC0+XG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5zdGFydCtwcmV2Lmxlbmd0aCsxIDwgY2h1bmsuc3RhcnRcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUgIT0gJ29iaidcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbY2h1bmtJbmRleC0xLi4wXVxuICAgICAgICAgICAgICAgICAgICBpZiBpIDwgY2h1bmtJbmRleC0xIGFuZCBsaW5lLmNodW5rc1tpXS5zdGFydCtsaW5lLmNodW5rc1tpXS5sZW5ndGgrMSA8IGxpbmUuY2h1bmtzW2krMV0uc3RhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICd0ZXh0JyBvciBsaW5lLmNodW5rc1tpXS52YWx1ZSA9PSAnb2JqJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbaV0udmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgMFxuXG5ub29uUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGUgIyBtYWtlcyB0aGlzIHNlbnNlIGhlcmUgPz8/XG5cbiAgICBub29uUHJvcCgpXG5cbm5vb25Xb3JkID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlICMgbWFrZXMgdGhpcyBzZW5zZSBoZXJlID8/P1xuXG4gICAgaWYgY2h1bmsuc3RhcnQgPT0gMFxuICAgICAgICBzZXRWYWx1ZSAwICdvYmonXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBub29uUHJvcCgpXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG51cmxQdW5jdCA9IC0+XG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnOi8vJ1xuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goNCkgPT0gJy4nIGFuZCBnZXRDaHVuayg1KVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICd1cmwgcHJvdG9jb2wnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWVzIDMgJ3VybCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMyAndXJsIGRvbWFpbidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgNCAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgNSAndXJsIHRsZCdcblxuICAgICAgICAgICAgICAgIHJldHVybiA2XG5cbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJy4nXG4gICAgICAgICAgICBpZiBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoKCdudW1iZXInKSBhbmQgcHJldi52YWx1ZSAhPSAnc2VtdmVyJyBhbmQgcHJldi5tYXRjaCBub3QgaW4gJ1xcXFwuLydcbiAgICAgICAgICAgICAgICBpZiBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgICAgICAgICBpZiBuZXh0LnN0YXJ0ID09IGNodW5rLnN0YXJ0K2NodW5rLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZWV4dCA9IG5leHQubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpbGVleHQgbm90IGluICdcXFxcLi8qKydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSBmaWxlZXh0ICsgJyBmaWxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlICAwIGZpbGVleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMSBmaWxlZXh0ICsgJyBleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLydcblxuICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXguLjBdXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0uc3RhcnQrbGluZS5jaHVua3NbaV0ubGVuZ3RoIDwgbGluZS5jaHVua3NbaSsxXT8uc3RhcnRcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS52YWx1ZS5lbmRzV2l0aCAnZGlyJ1xuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlLnN0YXJ0c1dpdGggJ3VybCdcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS5tYXRjaCA9PSAnXCInXG4gICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbaV0udmFsdWUuc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3B1bmN0IGRpcidcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3RleHQgZGlyJ1xuXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgIDBcblxudXJsV29yZCA9IC0+XG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiAnXFxcXC8nXG4gICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgaWYgbm90IG5leHQgb3IgbmV4dC5zdGFydCA+IGNodW5rLnN0YXJ0K2NodW5rLmxlbmd0aCBvciBuZXh0Lm1hdGNoIG5vdCBpbiAnXFxcXC4vJ1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsICdmaWxlJ1xuXG4jICAgICAgIDAwMCAgIDAwMDAwMDBcbiMgICAgICAgMDAwICAwMDBcbiMgICAgICAgMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmpzUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKCdcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbmpzV29yZCA9IC0+XG5cbiAgICBpZiBjaHVuay52YWx1ZSA9PSAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICc9JyBhbmQgZ2V0VmFsdWUoLTIpLnN0YXJ0c1dpdGggJ3RleHQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAtMiAnZnVuY3Rpb24nXG4gICAgMCAjIHdlIG5lZWQgdGhpcyBoZXJlXG5cbmRpY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICc6JyBhbmQgbm90IGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggJzo6J1xuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUuc3BsaXQoJyAnKVswXSBpbiBbJ3N0cmluZycsICdudW1iZXInLCAndGV4dCcsICdrZXl3b3JkJ11cbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuIyAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuIyAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5qc29uUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICc6J1xuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGZvciBpIGluIFtjaHVua0luZGV4LTIuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbmpzb25Xb3JkID0gLT5cblxuICAgIGlmICh0b3BUeXBlID09ICdzdHJpbmcgZG91YmxlJyBvciB0b3BUeXBlID09ICdzdHJpbmcgc2luZ2xlJykgYW5kIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBwcmV2Lm1hdGNoIGluICdcIl5+PSdcbiAgICAgICAgICAgIGlmIE5VTUJFUi50ZXN0KGdldG1hdGNoKDApKSBhbmQgZ2V0bWF0Y2goMSkgPT0gJy4nIGFuZCBOVU1CRVIudGVzdChnZXRtYXRjaCgyKSkgYW5kIGdldG1hdGNoKDMpID09ICcuJyBhbmQgTlVNQkVSLnRlc3QoZ2V0bWF0Y2goNCkpXG4gICAgICAgICAgICAgICAgaWYgcHJldi5tYXRjaCBpbiAnXn49J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAncHVuY3Qgc2VtdmVyJyBcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ3B1bmN0IHNlbXZlcicgaWYgZ2V0bWF0Y2goLTIpID09ICc+J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAxICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMiAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDMgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSA0ICdzZW12ZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIDVcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDBcblxuZXNjYXBlID0gLT5cblxuICAgIGlmIGNodW5rLm1hdGNoID09ICdcXFxcJyBhbmQgKHRvcFR5cGU/LnN0YXJ0c1dpdGgoJ3JlZ2V4cCcpIG9yIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZycpXG4gICAgICAgIGlmIGNodW5rSW5kZXggPT0gMCBvciBub3QgZ2V0Q2h1bmsoLTEpPy5lc2NhcGVcbiAgICAgICAgICAgIGlmIGdldENodW5rKDEpPy5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgY2h1bmsuZXNjYXBlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2VzY2FwZSdcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG5cbnJlZ2V4cCA9IC0+XG5cbiAgICByZXR1cm4gaWYgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnLydcblxuICAgICAgICBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIHJlZ2V4cCBlbmQnXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGlmIGNodW5rSW5kZXhcbiAgICAgICAgICAgIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgbmV4dCA9IGdldENodW5rICsxXG4gICAgICAgICAgICBpZiBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoKCdwdW5jdCcpIGFuZCBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoKCdrZXl3b3JkJykgb3IgcHJldi5tYXRjaCBpbiBcIildXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCAgY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA+ICBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoID09IGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuXG4gICAgICAgICAgICByZXR1cm4gaWYgbmV4dD8ubWF0Y2ggPT0gJz0nXG4gICAgICAgICAgICByZXR1cm4gaWYgcHJldi52YWx1ZS5zdGFydHNXaXRoICdudW1iZXInXG5cbiAgICAgICAgcHVzaFN0YWNrIHR5cGU6J3JlZ2V4cCdcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ3JlZ2V4cCBzdGFydCdcblxuICAgIGVzY2FwZSgpXG5cbnRyaXBsZVJlZ2V4cCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG5cbiAgICB0eXBlID0gJ3JlZ2V4cCB0cmlwbGUnXG5cbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSBub3QgaW4gWydpbnRlcnBvbGF0aW9uJywgdHlwZV1cbiAgICBpZiBjaHVuay50dXJkWy4uMl0gPT0gJy8vLydcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIGxpbmVubzpsaW5lLm51bWJlclxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG5cbnNpbXBsZVN0cmluZyA9IC0+XG5cbiAgICByZXR1cm4gaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG5cbiAgICBpZiBjaHVuay5tYXRjaCBpbiAnXCJcXCcnXG5cbiAgICAgICAgdHlwZSA9IHN3aXRjaCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnXG4gICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG5cbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIGVsc2UgaWYgbm90Q29kZVxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuXG4gICAgICAgIHB1c2hTdGFjayBzdHJvbmc6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBlc2NhcGUoKVxuXG50cmlwbGVTdHJpbmcgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgIHJldHVybiBpZiB0b3BUeXBlIGluIFsncmVnZXhwJydzdHJpbmcgc2luZ2xlJydzdHJpbmcgZG91YmxlJ11cblxuICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuXG4gICAgdHlwZSA9IHN3aXRjaCBjaHVuay50dXJkWy4uMl1cbiAgICAgICAgd2hlbiAnXCJcIlwiJyB0aGVuICdzdHJpbmcgZG91YmxlIHRyaXBsZSdcbiAgICAgICAgd2hlbiBcIicnJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuXG4gICAgaWYgdHlwZVxuXG4gICAgICAgIHJldHVybiBpZiB0eXBlICE9IHRvcFR5cGUgYW5kIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZydcblxuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHN0cm9uZzp0cnVlIHR5cGU6dHlwZVxuXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG5cbiAgICBlc2NhcGUoKVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxubnVtYmVyID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBOVU1CRVIudGVzdCBjaHVuay5tYXRjaFxuXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTQpID09ICdudW1iZXIgZmxvYXQnIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBpZiBnZXRtYXRjaCgtNSkgaW4gJ15+PSdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTUgJ3B1bmN0IHNlbXZlcicgXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC02ICdwdW5jdCBzZW12ZXInIGlmIGdldG1hdGNoKC02KSA9PSAnPidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtNCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdzZW12ZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXInXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBIRVhOVU0udGVzdCBjaHVuay5tYXRjaFxuXG4gICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBoZXgnXG4gICAgICAgIHJldHVybiAxXG5cbiMgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDBcblxuZmxvYXQgPSAtPlxuXG4gICAgaWYgRkxPQVQudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICByZXR1cm4gMVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAgICAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmNzc1dvcmQgPSAtPlxuXG4gICAgaWYgY2h1bmsubWF0Y2hbLTIuLl0gaW4gWydweCcnZW0nJ2V4J10gYW5kIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoWy4uLi0yXVxuICAgICAgICBzZXRWYWx1ZSAwICdudW1iZXInXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBjaHVuay5tYXRjaFstMS4uXSBpbiBbJ3MnXSBhbmQgTlVNQkVSLnRlc3QgY2h1bmsubWF0Y2hbLi4uLTFdXG4gICAgICAgIHNldFZhbHVlIDAgJ251bWJlcidcbiAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJy4nIGFuZCBnZXRDaHVuaygtMik/LnZhbHVlICE9ICdudW1iZXInXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAnY2xhc3MnXG4gICAgICAgICAgICBzZXRWYWx1ZSAgMCAnY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gXCIjXCJcblxuICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2gubGVuZ3RoID09IDMgb3IgY2h1bmsubWF0Y2gubGVuZ3RoID09IDZcbiAgICAgICAgICAgICAgICBpZiBIRVgudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSAnbnVtYmVyIGhleCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdmdW5jdGlvbidcbiAgICAgICAgICAgIHNldFZhbHVlICAwICdmdW5jdGlvbidcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnLSdcbiAgICAgICAgICAgIGlmIHByZXZQcmV2ID0gZ2V0Q2h1bmsgLTJcbiAgICAgICAgICAgICAgICBpZiBwcmV2UHJldi52YWx1ZSBpbiBbJ2NsYXNzJydmdW5jdGlvbiddXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xIHByZXZQcmV2LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwIHByZXZQcmV2LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiMgMDAgICAgIDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG5tZFB1bmN0ID0gLT5cblxuICAgIGlmIGNodW5rSW5kZXggPT0gMFxuXG4gICAgICAgIGlmIG5vdCBjaHVuay50dXJkIGFuZCBjaHVuay5tYXRjaCBpbiAnLSonIGFuZCBnZXRDaHVuaygxKT8uc3RhcnQgPiBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICB0eXBlID0gWydsaTEnJ2xpMicnbGkzJ11bY2h1bmsuc3RhcnQvNF1cbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZSAwIHR5cGUgKyAnIG1hcmtlcidcblxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnIydcbiAgICAgICAgICAgIGlmIG5vdCBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2gxJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdoMSdcbiAgICAgICAgICAgIHN3aXRjaCBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMnXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdoMidcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMnXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMydcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzICdoMydcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMjJ1xuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgNCAnaDQnXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMjIyMnXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoNSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyA1ICdoNSdcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICcqJ1xuXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/Wy4uMV0gPT0gJyoqJ1xuXG4gICAgICAgICAgICB0eXBlID0gJ2JvbGQnXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWVzIDIgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG5cbiAgICAgICAgdHlwZSA9ICdpdGFsaWMnXG4gICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdG9wVHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICdgJ1xuXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/Wy4uMl0gPT0gJ2BgYCdcblxuICAgICAgICAgICAgdHlwZSA9ICdjb2RlIHRyaXBsZSdcblxuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goMykgaW4gWydjb2ZmZWVzY3JpcHQnJ2phdmFzY3JpcHQnJ2pzJ11cbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAzICdjb21tZW50J1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG5cbiAgICAgICAgICAgIHB1c2hTdGFjayB3ZWFrOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuXG4gICAgICAgIHR5cGUgPSAnY29kZSdcbiAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCB0b3BUeXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcblxuICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgdHlwZVxuXG4jIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDBcbiMgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuaW50ZXJwb2xhdGlvbiA9IC0+XG5cbiAgICBpZiB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggXCJcXCN7XCJcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidpbnRlcnBvbGF0aW9uJywgd2Vhazp0cnVlXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgIHNldFZhbHVlIDEgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgIGVsc2UgaWYgdG9wVHlwZSA9PSAnaW50ZXJwb2xhdGlvbidcblxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnfSdcbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG5rZXl3b3JkID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBub3QgbGFuZ1tleHRdXG4gICAgICAgICMgbG9nIFwibm8gbGFuZyBmb3IgZXh0PyAje2V4dH1cIlxuICAgICAgICByZXR1cm5cblxuICAgIGlmIGxhbmdbZXh0XS5oYXNPd25Qcm9wZXJ0eShjaHVuay5tYXRjaClcbiAgICAgICAgY2h1bmsudmFsdWUgPSBsYW5nW2V4dF1bY2h1bmsubWF0Y2hdXG4gICAgICAgIHJldHVybiAjIGdpdmUgY29mZmVlRnVuYyBhIGNoYW5jZSwgbnVtYmVyIGJhaWxzIGZvciB1c1xuXG4jIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDBcbiMgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMFxuIyAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwXG4jICAwMDAgMDAwICAgMDAwIDAgMDAwICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxueG1sUHVuY3QgPSAtPlxuXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnPC8nXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAna2V5d29yZCdcblxuICAgIGlmIGNodW5rLm1hdGNoIGluIFsnPCcnPiddXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdrZXl3b3JkJ1xuXG4jICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgICAgICAwMDBcbiMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwXG5cbmNwcE1hY3JvID0gLT5cblxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgIGFkZFZhbHVlIDAgJ2RlZmluZSdcbiAgICAgICAgc2V0VmFsdWUgMSAnZGVmaW5lJ1xuICAgICAgICByZXR1cm4gMlxuXG4jICAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwXG4jICAgICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5zaFB1bmN0ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnLycgYW5kIGdldENodW5rKC0xKT8uc3RhcnQgKyBnZXRDaHVuaygtMSk/Lmxlbmd0aCA9PSBjaHVuay5zdGFydFxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgLTEgJ2RpcidcblxuICAgIGlmIGNodW5rLnR1cmQgPT0gJy0tJyBhbmQgZ2V0Q2h1bmsoMik/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzIgYW5kIGdldENodW5rKC0xKT8uc3RhcnQrZ2V0Q2h1bmsoLTEpPy5sZW5ndGggPCBjaHVuay5zdGFydFxuICAgICAgICBhZGRWYWx1ZSAwICdhcmd1bWVudCdcbiAgICAgICAgYWRkVmFsdWUgMSAnYXJndW1lbnQnXG4gICAgICAgIHNldFZhbHVlIDIgJ2FyZ3VtZW50J1xuICAgICAgICByZXR1cm4gM1xuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJy0nIGFuZCBnZXRDaHVuaygxKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMSBhbmQgZ2V0Q2h1bmsoLTEpPy5zdGFydCtnZXRDaHVuaygtMSk/Lmxlbmd0aCA8IGNodW5rLnN0YXJ0XG4gICAgICAgIGFkZFZhbHVlIDAgJ2FyZ3VtZW50J1xuICAgICAgICBzZXRWYWx1ZSAxICdhcmd1bWVudCdcbiAgICAgICAgcmV0dXJuIDJcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcblxuc3RhY2tlZCA9IC0+XG5cbiAgICBpZiBzdGFja1RvcFxuICAgICAgICByZXR1cm4gaWYgc3RhY2tUb3Aud2Vha1xuICAgICAgICBpZiBzdGFja1RvcC5zdHJvbmdcbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gdG9wVHlwZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0b3BUeXBlXG4gICAgICAgIHJldHVybiAxXG5cbnB1c2hFeHQgPSAobXRjaCkgLT5cbiAgICBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICBleHRTdGFjay5wdXNoIGV4dFRvcFxuXG5hY3RFeHQgPSAtPlxuICAgIHN0YWNrICAgID0gW11cbiAgICBzdGFja1RvcCA9IG51bGxcbiAgICB0b3BUeXBlICA9ICcnXG4gICAgbm90Q29kZSAgPSBmYWxzZVxuXG5wb3BFeHQgPSAtPlxuICAgIHN0YWNrID0gZXh0VG9wLnN0YWNrXG4gICAgbGluZS5leHQgPSBleHRUb3Auc3RhcnQuZXh0XG4gICAgZXh0U3RhY2sucG9wKClcbiAgICBleHRUb3AgPSBleHRTdGFja1stMV1cblxuICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgbm90Q29kZSA9IHN0YWNrVG9wIGFuZCB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcblxucHVzaFN0YWNrID0gKG8pIC0+XG4gICAgc3RhY2sucHVzaCBvXG4gICAgc3RhY2tUb3AgPSBvXG4gICAgdG9wVHlwZSA9IG8udHlwZVxuICAgIG5vdENvZGUgPSB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcblxucG9wU3RhY2sgPSAtPlxuICAgIHN0YWNrLnBvcCgpXG4gICAgc3RhY2tUb3AgPSBzdGFja1stMV1cbiAgICB0b3BUeXBlID0gc3RhY2tUb3A/LnR5cGVcbiAgICBub3RDb2RlID0gc3RhY2tUb3AgYW5kIHRvcFR5cGUgbm90IGluIGNvZGVUeXBlc1xuXG5nZXRDaHVuayA9IChkKSAtPiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdXG5zZXRWYWx1ZSA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlID0gdmFsdWVcbmdldFZhbHVlID0gKGQpIC0+IGdldENodW5rKGQpPy52YWx1ZSA/ICcnXG5nZXRtYXRjaCA9IChkKSAtPiBnZXRDaHVuayhkKT8ubWF0Y2ggPyAnJ1xuYWRkVmFsdWUgPSAoZCwgdmFsdWUpIC0+XG4gICAgaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS52YWx1ZSArPSAnICcgKyB2YWx1ZVxuICAgIDFcblxuYWRkVmFsdWVzID0gKG4sdmFsdWUpIC0+XG4gICAgZm9yIGkgaW4gWzAuLi5uXVxuICAgICAgICBhZGRWYWx1ZSBpLCB2YWx1ZVxuICAgIG5cblxuaGFuZGxlcnMgPVxuICAgIGNvZmZlZTpcbiAgICAgICAgICBwdW5jdDpbIGJsb2NrQ29tbWVudCwgaGFzaENvbW1lbnQsIHRyaXBsZVJlZ2V4cCwgY29mZmVlUHVuY3QsIHRyaXBsZVN0cmluZywgc2ltcGxlU3RyaW5nLCBpbnRlcnBvbGF0aW9uLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCBdXG4gICAgICAgICAgd29yZDogWyBrZXl3b3JkLCBjb2ZmZWVXb3JkLCBudW1iZXIsIHByb3BlcnR5IF1cbiAgICBub29uOiBwdW5jdDpbIG5vb25Db21tZW50LCAgbm9vblB1bmN0LCB1cmxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBub29uV29yZCwgdXJsV29yZCwgbnVtYmVyICAgICAgICAgIF1cbiAgICBqczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBqc1B1bmN0LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0IF0sIHdvcmQ6WyBrZXl3b3JkLCBqc1dvcmQsIG51bWJlciwgcHJvcGVydHkgIF1cbiAgICB0czogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBqc1B1bmN0LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0IF0sIHdvcmQ6WyBrZXl3b3JkLCBqc1dvcmQsIG51bWJlciwgcHJvcGVydHkgIF1cbiAgICBpc3M6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBpbmk6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyAgICAgICAgICBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBjcHA6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCBjcHBXb3JkICAgIF1cbiAgICBocHA6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCBjcHBXb3JkICAgIF1cbiAgICBjOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCBjcHBXb3JkICAgIF1cbiAgICBoOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCBjcHBXb3JkICAgIF1cbiAgICBjczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBwdWc6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzdHlsOiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBjc3M6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzYXNzOiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzY3NzOiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzdmc6ICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBodG1sOiBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBodG06ICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICB4bWw6ICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBudW1iZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBzaDogICBwdW5jdDpbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCB1cmxQdW5jdCwgc2hQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCB1cmxXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBqc29uOiBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCBqc29uUHVuY3QsIHVybFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBqc29uV29yZCwgdXJsV29yZCwgbnVtYmVyIF1cbiAgICB5bWw6ICBwdW5jdDpbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCB1cmxQdW5jdCwgc2hQdW5jdCwgZGljdCAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBqc29uV29yZCwgdXJsV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSBdXG4gICAgeWFtbDogcHVuY3Q6WyBoYXNoQ29tbWVudCwgIHNpbXBsZVN0cmluZywgdXJsUHVuY3QsIHNoUHVuY3QsIGRpY3QgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwganNvbldvcmQsIHVybFdvcmQsIG51bWJlciwgcHJvcGVydHkgXVxuICAgIGxvZzogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHVybFB1bmN0LCBkaWN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIG1kOiAgIHB1bmN0OlsgICAgICAgICAgICAgICAgICAgIG1kUHVuY3QsIHVybFB1bmN0LCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGZpc2g6IHB1bmN0OlsgICAgICAgICAgICAgICAgaGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIHB5OiAgIHB1bmN0OlsgICAgICAgICAgICAgICAgaGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuXG5mb3IgZXh0IGluIGV4dHNcbiAgICBpZiBub3QgaGFuZGxlcnNbZXh0XT9cbiAgICAgICAgaGFuZGxlcnNbZXh0XSA9IHB1bmN0Olsgc2ltcGxlU3RyaW5nIF0sIHdvcmQ6WyBudW1iZXIgXVxuXG5mb3IgZXh0LG9iaiBvZiBoYW5kbGVyc1xuICAgIGhhbmRsZXJzW2V4dF0ucHVuY3QucHVzaCBzdGFja2VkXG4gICAgaGFuZGxlcnNbZXh0XS53b3JkLnB1c2ggc3RhY2tlZFxuXG4jIyNcbjAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG4jIyNcblxu4pa4ZG9jICdibG9ja2VkIGxpbmVzJ1xuXG4gICAgbGluZXM6IGFycmF5IG9mIGNodW5rZWQgbGluZXNcblxuICAgIHJldHVybnMgbGluZXMgd2l0aFxuICAgIC0gJ2V4dCcgc3dpdGNoZWQgaW4gc29tZSBsaW5lc1xuICAgIC0gJ3ZhbHVlJyBjaGFuZ2VkIGluIGNodW5rcyB0aGF0IG1hdGNoIGxhbmd1YWdlIHBhdHRlcm5zXG5cbmJsb2NrZWQgPSAobGluZXMpIC0+XG5cbiAgICBleHRTdGFjayAgID0gW11cbiAgICBzdGFjayAgICAgID0gW11cbiAgICBoYW5kbCAgICAgID0gW11cbiAgICBleHRUb3AgICAgID0gbnVsbFxuICAgIHN0YWNrVG9wICAgPSBudWxsXG4gICAgbm90Q29kZSAgICA9IGZhbHNlICMgc2hvcnRjdXQgZm9yIHRvcCBvZiBzdGFjayBub3QgaW4gY29kZVR5cGVzXG4gICAgdG9wVHlwZSAgICA9ICcnXG4gICAgZXh0ICAgICAgICA9ICcnXG4gICAgbGluZSAgICAgICA9IG51bGxcbiAgICBjaHVuayAgICAgID0gbnVsbFxuICAgIGNodW5rSW5kZXggPSAwXG5cbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcblxuICAgICAgICBpZiBzdGFja1RvcFxuXG4gICAgICAgICAgICBpZiBzdGFja1RvcC50eXBlID09ICdjb21tZW50IHRyaXBsZSdcblxuICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm9yIGNodW5rIGluIGxpbmUuY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBIRUFERVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgbWlnaHRCZUhlYWRlciA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGlmIG1pZ2h0QmVIZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgZm9yIGNodW5rIGluIGxpbmUuY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLmZpbGwgdGhlbiBwb3BTdGFjaygpXG5cbiAgICAgICAgaWYgZXh0VG9wXG4gICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmluZGVudCBhbmQgbGluZS5jaHVua3NbMF0/LnN0YXJ0IDw9IGV4dFRvcC5zdGFydC5jaHVua3NbMF0uc3RhcnRcbiAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSBpbmRlbnRhdGlvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN3aXRjaC50byAgICAgIyBtYWtlIHN1cmUgdGhlIGN1cnJlbnQgbGluZSBleHQgbWF0Y2hlcyB0aGUgdG9wbW9zdCBmcm9tIHN0YWNrXG5cbiAgICAgICAgaWYgZXh0ICE9IGxpbmUuZXh0ICAgICAgICAgICAgICAgICAgICAgICMgZWl0aGVyIGF0IHN0YXJ0IG9mIGZpbGUgb3Igd2Ugc3dpdGNoZWQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBhY3RFeHQoKVxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICAgICAgaWYgbm90IGhhbmRsXG4gICAgICAgICAgICAgICAg4pa4ZGJnIGxpbmVcbiAgICAgICAgICAgICAgICDilrhkYmcgaGFuZGxlcnNcbiAgICAgICAgICAgIOKWuGFzc2VydCBoYW5kbFxuXG4gICAgICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwXG4gICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICAgICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgd2hpbGUgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuXG4gICAgICAgICAgICBjaHVuayA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXhdXG5cbiAgICAgICAgICAgIGJlZm9yZUluZGV4ID0gY2h1bmtJbmRleFxuXG4gICAgICAgICAgICBpZiBjaHVuay52YWx1ZSA9PSAncHVuY3QnXG5cbiAgICAgICAgICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5lbmQ/IGFuZCBleHRUb3Auc3dpdGNoLmVuZCA9PSBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgY2h1bmsudHVyZC5sZW5ndGgsIGV4dFRvcC5zd2l0Y2guYWRkIGlmIGV4dFRvcC5zd2l0Y2guYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BFeHQoKSAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgdHVyZFxuXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC5wdW5jdCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBlbHNlICMgd29yZHMsIG51bWJlcnNcblxuICAgICAgICAgICAgICAgIGlmIG5vdCBub3RDb2RlXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBzd3RjaFtsaW5lLmV4dF0/W2NodW5rLm1hdGNoXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHVyZENodW5rID0gZ2V0Q2h1bmsgLW10Y2gudHVyZC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoLnR1cmQgPT0gKHR1cmRDaHVuaz8udHVyZCA/IHR1cmRDaHVuaz8ubWF0Y2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcHVzaCBhIG5ldyBleHRlbnNpb24gb250byB0aGUgc3RhY2ssIGV4dCB3aWxsIGNoYW5nZSBvbiBzdGFydCBvZiBuZXh0IGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaEV4dCBtdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIG10Y2gubmV4dCBhbmQgZ2V0Q2h1bmsoMSkubWF0Y2ggPT0gbXRjaC5uZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaEV4dCBtdGNoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC53b3JkID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gYmVmb3JlSW5kZXhcbiAgICAgICAgICAgICAgICBjaHVua0luZGV4KytcbiAgICBsaW5lc1xuXG5ycGFkID0gKHMsIGwpIC0+XG4gICAgcyA9IFN0cmluZyBzXG4gICAgd2hpbGUgcy5sZW5ndGggPCBsIHRoZW4gcyArPSAnICdcbiAgICBzXG5cbnBhZCA9IChsKSAtPiBycGFkICcnLCBsXG4gICAgXG5yZXBsYWNlVGFicyA9IChzKSAtPlxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IHMubGVuZ3RoXG4gICAgICAgIGlmIHNbaV0gPT0gJ1xcdCdcbiAgICAgICAgICAgIHMgPSBzWy4uLmldICsgcGFkKDQtKGklNCkpICsgc1tpKzEuLl1cbiAgICAgICAgaSArPSAxXG4gICAgc1xuXG5wYXJzZSA9IChsaW5lcywgZXh0PSdjb2ZmZWUnKSAtPiBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbmtvbG9yaXplID0gKGNodW5rKSAtPiBcbiAgICBcbiAgICBpZiBjbiA9IGtvbG9yLm1hcFtjaHVuay52YWx1ZV1cbiAgICAgICAgaWYgY24gaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgdiA9IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBmb3IgY3IgaW4gY25cbiAgICAgICAgICAgICAgICB2ID0ga29sb3JbY3JdIHZcbiAgICAgICAgICAgIHJldHVybiB2XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBrb2xvcltjbl0gY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIFxuICAgIGlmIGNodW5rLnZhbHVlLmVuZHNXaXRoICdmaWxlJ1xuICAgICAgICB3OCBjaHVuay5tYXRjaFxuICAgIGVsc2UgaWYgY2h1bmsudmFsdWUuZW5kc1dpdGggJ2V4dCdcbiAgICAgICAgdzMgY2h1bmsubWF0Y2hcbiAgICBlbHNlIGlmIGNodW5rLnZhbHVlLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICBpZiBMSS50ZXN0IGNodW5rLnZhbHVlXG4gICAgICAgICAgICBrb2xvcml6ZSBtYXRjaDpjaHVuay5tYXRjaCwgdmFsdWU6Y2h1bmsudmFsdWUucmVwbGFjZSBMSSwgJyAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHcyIGNodW5rLm1hdGNoXG4gICAgZWxzZVxuICAgICAgICBpZiBMSS50ZXN0IGNodW5rLnZhbHVlXG4gICAgICAgICAgICBrb2xvcml6ZSBtYXRjaDpjaHVuay5tYXRjaCwgdmFsdWU6Y2h1bmsudmFsdWUucmVwbGFjZSBMSSwgJyAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNodW5rLm1hdGNoXG5cbmtvbG9yaXplQ2h1bmtzID0gKGNodW5rczpbXSwgbnVtYmVyOikgLT5cbiAgICBcbiAgICBjbHJ6ZCA9ICcnXG4gICAgaWYgbnVtYmVyXG4gICAgICAgIG51bXN0ciA9IFN0cmluZyBudW1iZXJcbiAgICAgICAgY2xyemQgKz0gdzIobnVtc3RyKSArIHJwYWQgJycsIDQtbnVtc3RyLmxlbmd0aFxuICAgICAgICBcbiAgICBjID0gMFxuICAgIGZvciBpIGluIFswLi4uY2h1bmtzLmxlbmd0aF1cbiAgICAgICAgd2hpbGUgYyA8IGNodW5rc1tpXS5zdGFydCBcbiAgICAgICAgICAgIGNscnpkICs9ICcgJ1xuICAgICAgICAgICAgYysrXG4gICAgICAgIGNscnpkICs9IGtvbG9yaXplIGNodW5rc1tpXVxuICAgICAgICBjICs9IGNodW5rc1tpXS5sZW5ndGhcbiAgICBjbHJ6ZFxuICAgICAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgICAgMDAwMDAgICAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG5cbnN5bnRheCA9ICh0ZXh0OnRleHQsIGV4dDonY29mZmVlJywgbnVtYmVyczpmYWxzZSkgLT5cbiAgICBcbiAgICBsaW5lcyA9IHRleHQuc3BsaXQgTkVXTElORVxuICAgIHJuZ3MgID0gcGFyc2UobGluZXMsIGV4dCkubWFwIChsKSAtPiBsLmNodW5rc1xuICAgIFxuICAgIGNsaW5lcyA9IFtdXG4gICAgZm9yIGluZGV4IGluIFswLi4ubGluZXMubGVuZ3RoXVxuICAgICAgICBsaW5lID0gbGluZXNbaW5kZXhdXG4gICAgICAgIGlmIGV4dCA9PSAnanMnIGFuZCBsaW5lLnN0YXJ0c1dpdGggJy8vIyBzb3VyY2VNYXBwaW5nVVJMJ1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgY2xpbmVzLnB1c2gga29sb3JpemVDaHVua3MgY2h1bmtzOnJuZ3NbaW5kZXhdLCBudW1iZXI6bnVtYmVycyBhbmQgaW5kZXgrMVxuICAgIGNsaW5lcy5qb2luICdcXG4nXG5cbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgICBrb2xvcjogICAgICBrb2xvclxuICAgIGV4dHM6ICAgICAgIGV4dHNcbiAgICBwYXJzZTogICAgICBwYXJzZVxuICAgIGNodW5rZWQ6ICAgIGNodW5rZWRcbiAgICByYW5nZXM6ICAgICAobGluZSwgZXh0PSdjb2ZmZWUnKSAgLT4gcGFyc2UoW2xpbmVdLCBleHQpWzBdLmNodW5rc1xuICAgIGRpc3NlY3Q6ICAgIChsaW5lcywgZXh0PSdjb2ZmZWUnKSAtPiBwYXJzZShsaW5lcywgZXh0KS5tYXAgKGwpIC0+IGwuY2h1bmtzXG4gICAga29sb3JpemU6ICAga29sb3JpemVcbiAgICBrb2xvcml6ZUNodW5rczoga29sb3JpemVDaHVua3NcbiAgICBzeW50YXg6ICAgICBzeW50YXhcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxu4pa4dGVzdCAncHJvZmlsZSdcblxuICAgIHtzbGFzaH0gPSByZXF1aXJlICdreGsnXG4gICAgdGV4dDAgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvY29mZmVlL25vZGVzLmNvZmZlZVwiXG4gICAgdGV4dDEgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiXG5cbiAgICBsaW5lczAgPSB0ZXh0MC5zcGxpdCAnXFxuJ1xuICAgIGxpbmVzMSA9IHRleHQxLnNwbGl0ICdcXG4nXG5cbiAgICBmb3IgaSBpbiBbMC4uNV1cbiAgICAgICAgcGFyc2UgbGluZXMwXG5cbiAgICDilrhhdmVyYWdlIDEwMFxuICAgICAgICBwYXJzZSBsaW5lczBcbiJdfQ==
//# sourceURL=../coffee/klor.coffee