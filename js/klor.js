// koffee 0.56.0

/*
000   000  000       0000000   00000000
000  000   000      000   000  000   000
0000000    000      000   000  0000000
000  000   000      000   000  000   000
000   000  0000000   0000000   000   000
 */
var FLOAT, HEADER, HEX, HEXNUM, LI, NEWLINE, NUMBER, PUNCT, SPACE, actExt, addValue, addValues, blockComment, blocked, chunk, chunkIndex, chunked, codeTypes, coffeePunct, coffeeWord, commentHeader, cppMacro, cppWord, cssWord, dashArrow, dict, escape, ext, extStack, extTop, exts, fillComment, float, getChunk, getValue, getmatch, handl, handlers, hashComment, interpolation, j, jsPunct, jsWord, jsonPunct, jsonWord, k, keyword, kolor, kolorize, lang, len, len1, line, mdPunct, noonComment, noonProp, noonPunct, noonWord, notCode, number, obj, pad, parse, popExt, popStack, property, pushExt, pushStack, ref, regexp, replaceTabs, rpad, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, starComment, swtch, syntax, thisCall, topType, tripleRegexp, tripleString, urlPunct, urlWord, xmlPunct,
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
    var c, i, k, len1, len2, mightBeHeader, q, ref1, restChunks, t;
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
            for (t = 0, len2 = restChunks.length; t < len2; t++) {
                c = restChunks[t];
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
    if (topType === 'string double' && (prev = getChunk(-1))) {
        if (ref1 = prev.match, indexOf.call('"^~', ref1) >= 0) {
            if (NUMBER.test(getmatch(0)) && getmatch(1) === '.' && NUMBER.test(getmatch(2)) && getmatch(3) === '.' && NUMBER.test(getmatch(4))) {
                if (ref2 = prev.match, indexOf.call('^~', ref2) >= 0) {
                    setValue(-1, 'punct semver');
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
                if (ref1 = getmatch(-5), indexOf.call('^~', ref1) >= 0) {
                    setValue(-5, 'punct semver');
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
    sh: {
        punct: [hashComment, simpleString, urlPunct, shPunct],
        word: [keyword, urlWord, number]
    },
    json: {
        punct: [simpleString, jsonPunct, urlPunct],
        word: [keyword, jsonWord, urlWord, number]
    },
    yml: {
        punct: [hashComment, simpleString, dict, urlPunct, shPunct],
        word: [keyword, urlWord, number, property]
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
    var advance, beforeIndex, hnd, len2, len3, len4, len5, len6, mightBeHeader, mtch, q, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t, turdChunk, u, x, y;
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
                for (t = 0, len3 = ref1.length; t < len3; t++) {
                    chunk = ref1[t];
                    if (!HEADER.test(chunk.match)) {
                        mightBeHeader = false;
                        break;
                    }
                }
                if (mightBeHeader) {
                    ref2 = line.chunks;
                    for (u = 0, len4 = ref2.length; u < len4; u++) {
                        chunk = ref2[u];
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
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1146[39m', line);
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1147[39m', handlers);
            }
            if (!(handl)) {
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1148[39m', '[1m[97massertion failure![39m[22m');

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
                for (x = 0, len5 = ref5.length; x < len5; x++) {
                    hnd = ref5[x];
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
                for (y = 0, len6 = ref9.length; y < len6; y++) {
                    hnd = ref9[y];
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

syntax = function(arg) {
    var c, clines, clrzd, ext, i, index, lines, numbers, numstr, q, r, ref1, ref2, ref3, ref4, rngs, t, text;
    text = arg.text, ext = (ref1 = arg.ext) != null ? ref1 : 'coffee', numbers = (ref2 = arg.numbers) != null ? ref2 : false;
    lines = text.split(NEWLINE);
    rngs = parse(lines, ext).map(function(l) {
        return l.chunks;
    });
    clines = [];
    for (index = q = 0, ref3 = lines.length; 0 <= ref3 ? q < ref3 : q > ref3; index = 0 <= ref3 ? ++q : --q) {
        line = lines[index];
        if (line.startsWith('//# sourceMappingURL')) {
            continue;
        }
        clrzd = '';
        if (numbers) {
            numstr = String(index + 1);
            clrzd += w2(numstr) + rpad('', 4 - numstr.length);
        }
        c = 0;
        r = rngs[index];
        for (i = t = 0, ref4 = r.length; 0 <= ref4 ? t < ref4 : t > ref4; i = 0 <= ref4 ? ++t : --t) {
            while (c < r[i].start) {
                clrzd += ' ';
                c++;
            }
            clrzd += kolorize(r[i]);
            c += r[i].length;
        }
        clines.push(clrzd);
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
    syntax: syntax
};

;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2xvci5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsc3lCQUFBO0lBQUE7Ozs7QUFrQ0EsTUFBaUIsT0FBQSxDQUFXLFNBQUQsR0FBVyxrQkFBckIsQ0FBakIsRUFBRSxlQUFGLEVBQVE7O0FBQ1IsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVSLEtBQUEsR0FDSTtJQUFBLE1BQUEsRUFDSTtRQUFBLEdBQUEsRUFBSztZQUFBLElBQUEsRUFBSyxHQUFMO1lBQVMsRUFBQSxFQUFHLElBQVo7WUFBaUIsTUFBQSxFQUFPLENBQXhCO1NBQUw7S0FESjtJQUVBLEdBQUEsRUFDSTtRQUFBLE1BQUEsRUFBUTtZQUFBLElBQUEsRUFBSyxHQUFMO1lBQVMsRUFBQSxFQUFHLElBQVo7WUFBaUIsTUFBQSxFQUFPLENBQXhCO1NBQVI7S0FISjtJQUlBLEVBQUEsRUFDSTtRQUFBLFlBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLFFBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1lBQWlDLEdBQUEsRUFBSSxhQUFyQztTQUFkO1FBQ0EsVUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7WUFBaUMsR0FBQSxFQUFJLGFBQXJDO1NBRGQ7S0FMSjs7O0FBUUosS0FBQSxzQ0FBQTs7SUFDSSxLQUFLLENBQUMsRUFBRyxDQUFBLEdBQUEsQ0FBVCxHQUFnQjtRQUFBLElBQUEsRUFBSyxLQUFMO1FBQVcsRUFBQSxFQUFHLEdBQWQ7UUFBbUIsR0FBQSxFQUFJLEtBQXZCO1FBQTZCLEdBQUEsRUFBSSxhQUFqQzs7QUFEcEI7O0FBR0EsS0FBQSxHQUFVOztBQUNWLE1BQUEsR0FBVTs7QUFDVixLQUFBLEdBQVU7O0FBQ1YsTUFBQSxHQUFVOztBQUNWLEtBQUEsR0FBVTs7QUFDVixN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QSxNQUFBLEVBQVksU0FBQyxJQUFELEVBQU8sR0FBUDs7WUFBTyxNQUFJOztlQUFjLEtBQUEsQ0FBTSxDQUFDLElBQUQsQ0FBTixFQUFjLEdBQWQsQ0FBbUIsQ0FBQSxDQUFBLENBQUUsQ0FBQztJQUEvQyxDQUpaO0lBS0EsT0FBQSxFQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7O1lBQVEsTUFBSTs7ZUFBYSxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsQ0FBaUIsQ0FBQyxHQUFsQixDQUFzQixTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDO1FBQVQsQ0FBdEI7SUFBekIsQ0FMWjtJQU1BLFFBQUEsRUFBWSxRQU5aO0lBT0EsTUFBQSxFQUFZLE1BUFoiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDBcbjAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMjI1xuXG7ilrhpZiBvcHRzLmxhbmcgIyBrb2ZmZWUgLS1sYW5nIGtsb3IuY29mZmVlXG5cbiAgICBmcyAgID0gcmVxdWlyZSAnZnMnXG4gICAgbm9vbl9sb2FkID0gcmVxdWlyZSAnbm9vbi9qcy9sb2FkJ1xuICAgIHBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG4gICAgbm9vbkZpbGUgPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAnbGFuZy5ub29uJ1xuICAgIGpzb25GaWxlID0gcGF0aC5qb2luIF9fZGlybmFtZSwgJy4uJyAnanMnICdsYW5nLmpzb24nXG5cbiAgICBsb2cgJ2NvbXBpbGU6JyBub29uRmlsZVxuICAgIGxvZyAnb3V0cHV0OicgIGpzb25GaWxlXG5cbiAgICBsYW5nID0ge31cbiAgICBleHRzID0gWyd0eHQnJ2xvZycna29mZmVlJ11cbiAgICBmb3IgbmFtZXMsIGtleXdvcmRzIG9mIG5vb25fbG9hZCBub29uRmlsZVxuXG4gICAgICAgIGZvciBleHQgaW4gbmFtZXMuc3BsaXQgL1xccy9cbiAgICAgICAgICAgIGV4dHMucHVzaChleHQpIGlmIGV4dCBub3QgaW4gZXh0c1xuICAgICAgICAgICAgbGFuZ1tleHRdID89IHt9XG4gICAgICAgICAgICBmb3IgdmFsdWUsd29yZHMgb2Yga2V5d29yZHNcbiAgICAgICAgICAgICAgICBmb3Igd29yZCBpbiB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICBsYW5nW2V4dF1bd29yZF0gPSB2YWx1ZVxuXG4gICAganNvbiA9IEpTT04uc3RyaW5naWZ5IHtleHRzOmV4dHMsIGxhbmc6bGFuZ30sIG51bGwsICcgICAgJ1xuICAgIGZzLndyaXRlRmlsZVN5bmMganNvbkZpbGUsIGpzb24sICd1dGY4J1xuXG57IGV4dHMsIGxhbmcgfSA9IHJlcXVpcmUgXCIje19fZGlybmFtZX0vLi4vanMvbGFuZy5qc29uXCJcbmtvbG9yID0gcmVxdWlyZSAnLi9rb2xvcidcblxuc3d0Y2ggPVxuICAgIGNvZmZlZTpcbiAgICAgICAgZG9jOiB0dXJkOifilrgnIHRvOidtZCcgaW5kZW50OjFcbiAgICBwdWc6XG4gICAgICAgIHNjcmlwdDogbmV4dDonLicgdG86J2pzJyBpbmRlbnQ6MVxuICAgIG1kOlxuICAgICAgICBjb2ZmZWVzY3JpcHQ6IHR1cmQ6J2BgYCcgdG86J2NvZmZlZScgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgIGphdmFzY3JpcHQ6ICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcblxuZm9yIGV4dCBpbiBleHRzXG4gICAgc3d0Y2gubWRbZXh0XSA9IHR1cmQ6J2BgYCcgdG86ZXh0LCBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcblxuU1BBQ0UgICA9IC9cXHMvXG5IRUFERVIgID0gL14wKyQvXG5QVU5DVCAgID0gL1xcVysvZ1xuTlVNQkVSICA9IC9eXFxkKyQvXG5GTE9BVCAgID0gL15cXGQrZiQvXG5IRVhOVU0gID0gL14weFthLWZBLUZcXGRdKyQvXG5IRVggICAgID0gL15bYS1mQS1GXFxkXSskL1xuTkVXTElORSA9IC9cXHI/XFxuL1xuTEkgICAgICA9IC8oXFxzbGlcXGRcXHN8XFxzaFxcZFxccykvXG5cbmNvZGVUeXBlcyA9IFsnaW50ZXJwb2xhdGlvbicgJ2NvZGUgdHJpcGxlJ11cblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuXG7ilrhkb2MgJ2NodW5rZWQgbGluZXMsIGV4dCdcblxuICAgIHJldHVybnMgYXJyYXkgb2ZcblxuICAgICAgICBjaHVua3M6IFtcbiAgICAgICAgICAgICAgICAgICAgdHVyZDogICBzXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiAgc1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogIHNcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6ICBuXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogblxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgZXh0OiAgICBzXG4gICAgICAgIGNoYXJzOiAgblxuICAgICAgICBpbmRleDogIG5cbiAgICAgICAgbnVtYmVyOiBuKzFcblxuY2h1bmtlZCA9IChsaW5lcywgZXh0KSAtPlxuXG4gICAgZXh0ID0gJ2NvZmZlZScgaWYgZXh0ID09ICdrb2ZmZWUnXG4gICAgZXh0ID0gJ3R4dCcgaWYgZXh0IG5vdCBpbiBleHRzXG5cbiAgICBsaW5lbm8gPSAwXG4gICAgbGluZXMubWFwICh0ZXh0KSAtPlxuXG4gICAgICAgIGxpbmUgPVxuICAgICAgICAgICAgY2h1bmtzOiBbXVxuICAgICAgICAgICAgY2hhcnM6ICAwXG4gICAgICAgICAgICBpbmRleDogIGxpbmVubysrXG4gICAgICAgICAgICBudW1iZXI6IGxpbmVub1xuICAgICAgICAgICAgZXh0OiAgICBleHRcblxuICAgICAgICBjaHVua3MgPSByZXBsYWNlVGFicyh0ZXh0KS5zcGxpdCBTUEFDRVxuXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICByZXR1cm4gbGluZSAjIGVtcHR5IGxpbmVcblxuICAgICAgICBjID0gMFxuICAgICAgICBmb3IgcyBpbiBjaHVua3NcbiAgICAgICAgICAgIGlmIHMgPT0gJydcbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBjKytcbiAgICAgICAgICAgICAgICBsID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzYyA9IGNcblxuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cblxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSBQVU5DVC5leGVjIHNcblxuICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgd2wgPSBtLmluZGV4LShjLXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHNbYy1zYy4uLm0uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDp3bCwgbWF0Y2g6dywgdmFsdWU6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG5cbiAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHB1bmN0ID0gbVswXVxuXG4gICAgICAgICAgICAgICAgICAgIHBpID0gMFxuICAgICAgICAgICAgICAgICAgICBhZHZhbmNlID0gMVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdwdW5jdCdcblxuICAgICAgICAgICAgICAgICAgICB3aGlsZSBwaSA8IHB1bmN0Lmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBwYyA9IHB1bmN0W3BpXVxuICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIDB4RDgwMCA8PSBwdW5jdC5jaGFyQ29kZUF0KHBpKSA8PSAweERCRkYgYW5kIDB4REMwMCA8PSBwdW5jdC5jaGFyQ29kZUF0KHBpKzEpIDw9IDB4REZGRlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgPSAyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYyArPSBwdW5jdFtwaSsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgcGkgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6YWR2YW5jZSwgbWF0Y2g6cGMsIHR1cmQ6dHVyZCwgdmFsdWU6dmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHR1cmRbYWR2YW5jZS4uXVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIHBpIDwgcHVuY3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDphZHZhbmNlLCBtYXRjaDpwdW5jdFtwaS4uXSwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBhZHZhbmNlXG5cbiAgICAgICAgICAgICAgICBpZiBjIDwgc2MrbCAgICAgICAgIyBjaGVjayBmb3IgcmVtYWluaW5nIG5vbi1wdW5jdFxuICAgICAgICAgICAgICAgICAgICBybCA9IHNjK2wtYyAgICAjIGxlbmd0aCBvZiByZW1haW5kZXJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHNbbC1ybC4uXSAgIyB0ZXh0ICAgb2YgcmVtYWluZGVyXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOnJsLCBtYXRjaDp3LCB2YWx1ZTondGV4dCdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuXG4gICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmUuY2h1bmtzWy0xXVxuICAgICAgICAgICAgbGluZS5jaGFycyA9IGxhc3Quc3RhcnQgKyBsYXN0Lmxlbmd0aFxuXG4gICAgICAgIGxpbmVcblxuIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiMjI1xuXG5leHRTdGFjayAgID0gW11cbnN0YWNrICAgICAgPSBbXVxuaGFuZGwgICAgICA9IFtdXG5leHRUb3AgICAgID0gbnVsbFxuc3RhY2tUb3AgICA9IG51bGxcbm5vdENvZGUgICAgPSBmYWxzZSAjIHNob3J0Y3V0IGZvciB0b3Agb2Ygc3RhY2sgbm90IGluIGNvZGVUeXBlc1xudG9wVHlwZSAgICA9ICcnXG5leHQgICAgICAgID0gJydcbmxpbmUgICAgICAgPSBudWxsXG5jaHVuayAgICAgID0gbnVsbFxuY2h1bmtJbmRleCA9IDBcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuZmlsbENvbW1lbnQgPSAobikgLT5cblxuICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgYWRkVmFsdWUgaSwgJ2NvbW1lbnQnXG4gICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC1uXG4gICAgICAgIHJlc3RDaHVua3MgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4K24uLl1cbiAgICAgICAgbWlnaHRCZUhlYWRlciA9IHRydWVcbiAgICAgICAgZm9yIGMgaW4gcmVzdENodW5rc1xuICAgICAgICAgICAgYy52YWx1ZSA9ICdjb21tZW50J1xuICAgICAgICAgICAgaWYgbWlnaHRCZUhlYWRlciBhbmQgbm90IEhFQURFUi50ZXN0IGMubWF0Y2hcbiAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gZmFsc2VcbiAgICAgICAgaWYgbWlnaHRCZUhlYWRlclxuICAgICAgICAgICAgZm9yIGMgaW4gcmVzdENodW5rc1xuICAgICAgICAgICAgICAgIGMudmFsdWUgKz0gJyBoZWFkZXInXG4gICAgbGluZS5jaHVua3MubGVuZ3RoIC0gY2h1bmtJbmRleCArIG5cblxuaGFzaENvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdyZWdleHAgdHJpcGxlJ1xuICAgIGlmIHN0YWNrVG9wIGFuZCBzdGFja1RvcC5saW5lbm8gPT0gbGluZS5udW1iZXJcbiAgICAgICAgcmV0dXJuICMgY29tbWVudHMgaW5zaWRlIHRyaXBsZSByZWdleHAgb25seSB2YWxpZCBvbiBpbnRlcm5hbCBsaW5lcz9cblxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgIGZpbGxDb21tZW50IDFcblxubm9vbkNvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIiBhbmQgY2h1bmtJbmRleCA9PSAwXG4gICAgICAgIGZpbGxDb21tZW50IDFcblxuc2xhc2hDb21tZW50ID0gLT5cblxuICAgIHJldHVybiBpZiBzdGFja1RvcFxuXG4gICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCBcIi8vXCJcbiAgICAgICAgZmlsbENvbW1lbnQgMlxuXG5ibG9ja0NvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuXG4gICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZSdcblxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuXG4gICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcjIyMnXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuXG5zdGFyQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmRcblxuICAgIHR5cGUgPSAnY29tbWVudCB0cmlwbGUnXG5cbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSAhPSB0eXBlXG5cbiAgICBpZiBjaHVuay50dXJkWy4uMV0gPT0gJy8qJyBhbmQgbm90IHRvcFR5cGVcbiAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWVcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcbiAgICBpZiBjaHVuay50dXJkWy4uMV0gPT0gJyovJyBhbmQgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMFxuXG5kYXNoQXJyb3cgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIG1hcmtGdW5jID0gLT5cbiAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ3RleHQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1sxXS5tYXRjaCA9PSAnPScgYW5kIGxpbmUuY2h1bmtzWzJdLm1hdGNoICE9ICc+J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlICs9ICcgZnVuY3Rpb24nXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzFdLm1hdGNoID09ICc6J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSArPSAnIG1ldGhvZCdcblxuICAgIGlmIGNodW5rLnR1cmRcblxuICAgICAgICBpZiBjaHVuay50dXJkLnN0YXJ0c1dpdGggJy0+J1xuICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEgJ2Z1bmN0aW9uIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknIG9yIGxpbmUuY2h1bmtzWzBdLnR1cmQ/Wy4uMV0gPT0gJ0A6J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzBdLm1hdGNoID09ICdAJyBhbmQgbGluZS5jaHVua3NbMV0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCBjbGFzcydcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMl0udmFsdWUgPSAncHVuY3QgbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICAgICBpZiBjaHVuay50dXJkLnN0YXJ0c1dpdGggJz0+J1xuICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEgJ2Z1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIHJldHVybiAyXG5cbmNvbW1lbnRIZWFkZXIgPSAtPlxuXG4gICAgaWYgdG9wVHlwZSA9PSAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGlmIEhFQURFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMFxuXG50aGlzQ2FsbCA9IC0+XG5cbiAgICBzZXRWYWx1ZSAtMSAnZnVuY3Rpb24gY2FsbCdcbiAgICBpZiBnZXRtYXRjaCgtMikgPT0gJ0AnXG4gICAgICAgIHNldFZhbHVlIC0yICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgIDBcblxuY29mZmVlUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICfilrgnXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdtZXRhJ1xuXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnfj4nXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAnbWV0YSdcblxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGgoJy4uJykgYW5kIHByZXYubWF0Y2ggIT0gJy4nXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkWzJdICE9ICcuJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAncmFuZ2UnXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkWzNdICE9ICcuJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyAncmFuZ2UnXG5cbiAgICAgICAgaWYgcHJldi52YWx1ZS5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi52YWx1ZSA9PSAncHJvcGVydHknXG5cbiAgICAgICAgICAgIHByZXZFbmQgPSBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoXG4gICAgICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKCcgYW5kIHByZXZFbmQgPT0gY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgZWxzZSBpZiBwcmV2RW5kIDwgY2h1bmsuc3RhcnQgIyBzcGFjZWRcbiAgICAgICAgICAgICAgICBpZiBjaHVuay5tYXRjaCBpbiAnQFsoe1wiXFwnJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY2h1bmsubWF0Y2ggaW4gJystLydcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IG5leHQgb3IgbmV4dC5tYXRjaCAhPSAnPScgYW5kIG5leHQuc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcblxuY29mZmVlV29yZCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG5cbiAgICAgICAgaWYgcHJldi52YWx1ZSA9PSAncHVuY3QgbWV0YSdcbiAgICAgICAgICAgIGlmIGNodW5rLnN0YXJ0ID09IHByZXYuc3RhcnQrMVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ21ldGEnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAgIyBnaXZlIHN3aXRjaCBhIGNoYW5jZVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggaW4gWydjbGFzcycsICdleHRlbmRzJ11cbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ2NsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBpZiBjaHVuay52YWx1ZS5zdGFydHNXaXRoICdrZXl3b3JkJ1xuXG4gICAgICAgICAgICByZXR1cm4gMSAjIHdlIGFyZSBkb25lIHdpdGggdGhlIGtleXdvcmRcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ3RoaXMnXG4gICAgICAgICAgICBhZGRWYWx1ZSAgMCAndGhpcydcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgKHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5JykgYW5kIHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCBjaHVuay5zdGFydCAjIHNwYWNlZFxuICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcblxucHJvcGVydHkgPSAtPiAjIHdvcmRcblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgcHJldlByZXYgPSBnZXRDaHVuayAtMlxuXG4gICAgICAgIGlmIHByZXZQcmV2Py5tYXRjaCAhPSAnLidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgaWYgcHJldlByZXZcbiAgICAgICAgICAgICAgICBpZiBwcmV2UHJldi52YWx1ZSBub3QgaW4gWydwcm9wZXJ0eScsICdudW1iZXInXSBhbmQgbm90IHByZXZQcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnb2JqJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuY3BwV29yZCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgcCA9IHByb3BlcnR5KCkgdGhlbiByZXR1cm4gcFxuXG4gICAgaWYgZ2V0Q2h1bmsoLTIpPy50dXJkID09ICc6OidcblxuICAgICAgICBpZiBwcmV2UHJldiA9IGdldENodW5rIC0zXG4gICAgICAgICAgICBzZXRWYWx1ZSAtMyAncHVuY3Qgb2JqJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTIgJ29iaidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdvYmonXG4gICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnPCcgYW5kIGdldG1hdGNoKDEpIGluICcsPicgb3IgZ2V0bWF0Y2goMSkgPT0gJz4nIGFuZCBnZXRtYXRjaCgtMSkgaW4gJywnXG5cbiAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IHRlbXBsYXRlJ1xuICAgICAgICBzZXRWYWx1ZSAgMCAndGVtcGxhdGUnXG4gICAgICAgIHNldFZhbHVlICAxICdwdW5jdCB0ZW1wbGF0ZSdcbiAgICAgICAgcmV0dXJuIDJcblxuICAgIGlmIC9bQS1aXS8udGVzdCBjaHVuay5tYXRjaFsxXVxuICAgICAgICBzd2l0Y2ggY2h1bmsubWF0Y2hbMF1cbiAgICAgICAgICAgIHdoZW4gJ1QnXG4gICAgICAgICAgICAgICAgaWYgZ2V0bWF0Y2goMSkgPT0gJzwnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ2tleXdvcmQgdHlwZSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgd2hlbiAnRidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdzdHJ1Y3QnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgd2hlbiAnQSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdvYmonXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIGNodW5rLnZhbHVlID09ICd0ZXh0JyBhbmQgZ2V0bWF0Y2goMSkgPT0gJygnXG4gICAgICAgIHNldFZhbHVlIDAgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIHJldHVybiAxXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5ub29uUHJvcCA9IC0+XG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5zdGFydCtwcmV2Lmxlbmd0aCsxIDwgY2h1bmsuc3RhcnRcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUgIT0gJ29iaidcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbY2h1bmtJbmRleC0xLi4wXVxuICAgICAgICAgICAgICAgICAgICBpZiBpIDwgY2h1bmtJbmRleC0xIGFuZCBsaW5lLmNodW5rc1tpXS5zdGFydCtsaW5lLmNodW5rc1tpXS5sZW5ndGgrMSA8IGxpbmUuY2h1bmtzW2krMV0uc3RhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICd0ZXh0JyBvciBsaW5lLmNodW5rc1tpXS52YWx1ZSA9PSAnb2JqJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbaV0udmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgMFxuXG5ub29uUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGUgIyBtYWtlcyB0aGlzIHNlbnNlIGhlcmUgPz8/XG5cbiAgICBub29uUHJvcCgpXG5cbm5vb25Xb3JkID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlICMgbWFrZXMgdGhpcyBzZW5zZSBoZXJlID8/P1xuXG4gICAgaWYgY2h1bmsuc3RhcnQgPT0gMFxuICAgICAgICBzZXRWYWx1ZSAwICdvYmonXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBub29uUHJvcCgpXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG51cmxQdW5jdCA9IC0+XG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnOi8vJ1xuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goNCkgPT0gJy4nIGFuZCBnZXRDaHVuayg1KVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICd1cmwgcHJvdG9jb2wnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWVzIDMgJ3VybCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMyAndXJsIGRvbWFpbidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgNCAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgNSAndXJsIHRsZCdcblxuICAgICAgICAgICAgICAgIHJldHVybiA2XG5cbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJy4nXG4gICAgICAgICAgICBpZiBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoKCdudW1iZXInKSBhbmQgcHJldi52YWx1ZSAhPSAnc2VtdmVyJyBhbmQgcHJldi5tYXRjaCBub3QgaW4gJ1xcXFwuLydcbiAgICAgICAgICAgICAgICBpZiBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgICAgICAgICBpZiBuZXh0LnN0YXJ0ID09IGNodW5rLnN0YXJ0K2NodW5rLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZWV4dCA9IG5leHQubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpbGVleHQgbm90IGluICdcXFxcLi8qKydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSBmaWxlZXh0ICsgJyBmaWxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlICAwIGZpbGVleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMSBmaWxlZXh0ICsgJyBleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLydcblxuICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXguLjBdXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0uc3RhcnQrbGluZS5jaHVua3NbaV0ubGVuZ3RoIDwgbGluZS5jaHVua3NbaSsxXT8uc3RhcnRcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS52YWx1ZS5lbmRzV2l0aCAnZGlyJ1xuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlLnN0YXJ0c1dpdGggJ3VybCdcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS5tYXRjaCA9PSAnXCInXG4gICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbaV0udmFsdWUuc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3B1bmN0IGRpcidcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3RleHQgZGlyJ1xuXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgIDBcblxudXJsV29yZCA9IC0+XG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiAnXFxcXC8nXG4gICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgaWYgbm90IG5leHQgb3IgbmV4dC5zdGFydCA+IGNodW5rLnN0YXJ0K2NodW5rLmxlbmd0aCBvciBuZXh0Lm1hdGNoIG5vdCBpbiAnXFxcXC4vJ1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsICdmaWxlJ1xuXG4jICAgICAgIDAwMCAgIDAwMDAwMDBcbiMgICAgICAgMDAwICAwMDBcbiMgICAgICAgMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmpzUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKCdcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbmpzV29yZCA9IC0+XG5cbiAgICBpZiBjaHVuay52YWx1ZSA9PSAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICc9JyBhbmQgZ2V0VmFsdWUoLTIpLnN0YXJ0c1dpdGggJ3RleHQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAtMiAnZnVuY3Rpb24nXG4gICAgMCAjIHdlIG5lZWQgdGhpcyBoZXJlXG5cbmRpY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICc6JyBhbmQgbm90IGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggJzo6J1xuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUuc3BsaXQoJyAnKVswXSBpbiBbJ3N0cmluZycsICdudW1iZXInLCAndGV4dCcsICdrZXl3b3JkJ11cbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuIyAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuIyAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5qc29uUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICc6J1xuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGZvciBpIGluIFtjaHVua0luZGV4LTIuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbmpzb25Xb3JkID0gLT5cblxuICAgIGlmIHRvcFR5cGUgPT0gJ3N0cmluZyBkb3VibGUnIGFuZCBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiAnXCJefidcbiAgICAgICAgICAgIGlmIE5VTUJFUi50ZXN0KGdldG1hdGNoKDApKSBhbmQgZ2V0bWF0Y2goMSkgPT0gJy4nIGFuZCBOVU1CRVIudGVzdChnZXRtYXRjaCgyKSkgYW5kIGdldG1hdGNoKDMpID09ICcuJyBhbmQgTlVNQkVSLnRlc3QoZ2V0bWF0Y2goNCkpXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IHNlbXZlcicgaWYgcHJldi5tYXRjaCBpbiAnXn4nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDEgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAyICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMyAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDQgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICByZXR1cm4gNVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMFxuXG5lc2NhcGUgPSAtPlxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ1xcXFwnIGFuZCAodG9wVHlwZT8uc3RhcnRzV2l0aCgncmVnZXhwJykgb3IgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJylcbiAgICAgICAgaWYgY2h1bmtJbmRleCA9PSAwIG9yIG5vdCBnZXRDaHVuaygtMSk/LmVzY2FwZVxuICAgICAgICAgICAgaWYgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICBjaHVuay5lc2NhcGUgPSB0cnVlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCAnZXNjYXBlJ1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcblxucmVnZXhwID0gLT5cblxuICAgIHJldHVybiBpZiB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG5cbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgY2h1bmtJbmRleFxuICAgICAgICAgICAgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgKzFcbiAgICAgICAgICAgIGlmIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3B1bmN0JykgYW5kIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ2tleXdvcmQnKSBvciBwcmV2Lm1hdGNoIGluIFwiKV1cIlxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAocHJldi5zdGFydCtwcmV2Lmxlbmd0aCA8ICBjaHVuay5zdGFydCkgYW5kIG5leHQ/LnN0YXJ0ID4gIGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPT0gY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA9PSBjaHVuay5zdGFydCsxXG5cbiAgICAgICAgICAgIHJldHVybiBpZiBuZXh0Py5tYXRjaCA9PSAnPSdcbiAgICAgICAgICAgIHJldHVybiBpZiBwcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ251bWJlcidcblxuICAgICAgICBwdXNoU3RhY2sgdHlwZToncmVnZXhwJ1xuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAncmVnZXhwIHN0YXJ0J1xuXG4gICAgZXNjYXBlKClcblxudHJpcGxlUmVnZXhwID0gLT5cblxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcblxuICAgIHR5cGUgPSAncmVnZXhwIHRyaXBsZSdcblxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuICAgIGlmIGNodW5rLnR1cmRbLi4yXSA9PSAnLy8vJ1xuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgbGluZW5vOmxpbmUubnVtYmVyXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG5cbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuc2ltcGxlU3RyaW5nID0gLT5cblxuICAgIHJldHVybiBpZiB0b3BUeXBlID09ICdyZWdleHAnXG5cbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcblxuICAgIGlmIGNodW5rLm1hdGNoIGluICdcIlxcJydcblxuICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLm1hdGNoXG4gICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgIHdoZW4gXCInXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSdcblxuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgZWxzZSBpZiBub3RDb2RlXG4gICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG5cbiAgICAgICAgcHVzaFN0YWNrIHN0cm9uZzp0cnVlIHR5cGU6dHlwZVxuICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgcmV0dXJuIDFcblxuICAgIGVzY2FwZSgpXG5cbnRyaXBsZVN0cmluZyA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgaW4gWydyZWdleHAnJ3N0cmluZyBzaW5nbGUnJ3N0cmluZyBkb3VibGUnXVxuXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG5cbiAgICB0eXBlID0gc3dpdGNoIGNodW5rLnR1cmRbLi4yXVxuICAgICAgICB3aGVuICdcIlwiXCInIHRoZW4gJ3N0cmluZyBkb3VibGUgdHJpcGxlJ1xuICAgICAgICB3aGVuIFwiJycnXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG5cbiAgICBpZiB0eXBlXG5cbiAgICAgICAgcmV0dXJuIGlmIHR5cGUgIT0gdG9wVHlwZSBhbmQgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwdXNoU3RhY2sgc3Ryb25nOnRydWUgdHlwZTp0eXBlXG5cbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcblxuICAgIGVzY2FwZSgpXG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDBcbiMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG5udW1iZXIgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoXG5cbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtNCkgPT0gJ251bWJlciBmbG9hdCcgYW5kIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC01ICdwdW5jdCBzZW12ZXInIGlmIGdldG1hdGNoKC01KSBpbiAnXn4nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTQgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMyAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyJ1xuICAgICAgICByZXR1cm4gMVxuXG4gICAgaWYgSEVYTlVNLnRlc3QgY2h1bmsubWF0Y2hcblxuICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXIgaGV4J1xuICAgICAgICByZXR1cm4gMVxuXG4jIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmZsb2F0ID0gLT5cblxuICAgIGlmIEZMT0FULnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgcmV0dXJuIDFcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgICAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuXG5jc3NXb3JkID0gLT5cblxuICAgIGlmIGNodW5rLm1hdGNoWy0yLi5dIGluIFsncHgnJ2VtJydleCddIGFuZCBOVU1CRVIudGVzdCBjaHVuay5tYXRjaFsuLi4tMl1cbiAgICAgICAgc2V0VmFsdWUgMCAnbnVtYmVyJ1xuICAgICAgICByZXR1cm4gMVxuXG4gICAgaWYgY2h1bmsubWF0Y2hbLTEuLl0gaW4gWydzJ10gYW5kIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoWy4uLi0xXVxuICAgICAgICBzZXRWYWx1ZSAwICdudW1iZXInXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICcuJyBhbmQgZ2V0Q2h1bmsoLTIpPy52YWx1ZSAhPSAnbnVtYmVyJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ2NsYXNzJ1xuICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ2NsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09IFwiI1wiXG5cbiAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoLmxlbmd0aCA9PSAzIG9yIGNodW5rLm1hdGNoLmxlbmd0aCA9PSA2XG4gICAgICAgICAgICAgICAgaWYgSEVYLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAnZnVuY3Rpb24nXG4gICAgICAgICAgICBzZXRWYWx1ZSAgMCAnZnVuY3Rpb24nXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJy0nXG4gICAgICAgICAgICBpZiBwcmV2UHJldiA9IGdldENodW5rIC0yXG4gICAgICAgICAgICAgICAgaWYgcHJldlByZXYudmFsdWUgaW4gWydjbGFzcycnZnVuY3Rpb24nXVxuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSBwcmV2UHJldi52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCBwcmV2UHJldi52YWx1ZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4jIDAwICAgICAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMDAwMDBcblxubWRQdW5jdCA9IC0+XG5cbiAgICBpZiBjaHVua0luZGV4ID09IDBcblxuICAgICAgICBpZiBub3QgY2h1bmsudHVyZCBhbmQgY2h1bmsubWF0Y2ggaW4gJy0qJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID4gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgdHlwZSA9IFsnbGkxJydsaTInJ2xpMyddW2NodW5rLnN0YXJ0LzRdXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCB0eXBlICsgJyBtYXJrZXInXG5cbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJyMnXG4gICAgICAgICAgICBpZiBub3QgY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMSdcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAnaDEnXG4gICAgICAgICAgICBzd2l0Y2ggY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgIHdoZW4gJyMjJ1xuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDInXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAnaDInXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMjJ1xuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDMnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyAnaDMnXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMjIydcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2g0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDQgJ2g0J1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIyMjJ1xuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDUnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgNSAnaDUnXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnKidcblxuICAgICAgICBpZiBjaHVuay50dXJkP1suLjFdID09ICcqKidcblxuICAgICAgICAgICAgdHlwZSA9ICdib2xkJ1xuICAgICAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlcyAyIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuXG4gICAgICAgIHR5cGUgPSAnaXRhbGljJ1xuICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHRvcFR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnYCdcblxuICAgICAgICBpZiBjaHVuay50dXJkP1suLjJdID09ICdgYGAnXG5cbiAgICAgICAgICAgIHR5cGUgPSAnY29kZSB0cmlwbGUnXG5cbiAgICAgICAgICAgIGlmIGdldG1hdGNoKDMpIGluIFsnY29mZmVlc2NyaXB0JydqYXZhc2NyaXB0JydqcyddXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMyAnY29tbWVudCdcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuXG4gICAgICAgICAgICBwdXNoU3RhY2sgd2Vhazp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcblxuICAgICAgICB0eXBlID0gJ2NvZGUnXG4gICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdG9wVHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG5cbiAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwIHR5cGVcblxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwXG4jIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmludGVycG9sYXRpb24gPSAtPlxuXG4gICAgaWYgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoIFwiXFwje1wiXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTonaW50ZXJwb2xhdGlvbicsIHdlYWs6dHJ1ZVxuICAgICAgICAgICAgc2V0VmFsdWUgMCAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAxICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICBlbHNlIGlmIHRvcFR5cGUgPT0gJ2ludGVycG9sYXRpb24nXG5cbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ30nXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBlbmQnXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxua2V5d29yZCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgbm90IGxhbmdbZXh0XVxuICAgICAgICAjIGxvZyBcIm5vIGxhbmcgZm9yIGV4dD8gI3tleHR9XCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICBpZiBsYW5nW2V4dF0uaGFzT3duUHJvcGVydHkoY2h1bmsubWF0Y2gpXG4gICAgICAgIGNodW5rLnZhbHVlID0gbGFuZ1tleHRdW2NodW5rLm1hdGNoXVxuICAgICAgICByZXR1cm4gIyBnaXZlIGNvZmZlZUZ1bmMgYSBjaGFuY2UsIG51bWJlciBiYWlscyBmb3IgdXNcblxuIyAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwXG4jICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDBcbiMgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMFxuIyAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbnhtbFB1bmN0ID0gLT5cblxuICAgIGlmIGNodW5rLnR1cmQgPT0gJzwvJ1xuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ2tleXdvcmQnXG5cbiAgICBpZiBjaHVuay5tYXRjaCBpbiBbJzwnJz4nXVxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAna2V5d29yZCdcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwXG4jICAwMDAwMDAwICAwMDAgICAgICAgIDAwMFxuXG5jcHBNYWNybyA9IC0+XG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIlxuICAgICAgICBhZGRWYWx1ZSAwICdkZWZpbmUnXG4gICAgICAgIHNldFZhbHVlIDEgJ2RlZmluZSdcbiAgICAgICAgcmV0dXJuIDJcblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMDAwMDAwMFxuIyAgICAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAgICAwMDBcblxuc2hQdW5jdCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nIGFuZCBnZXRDaHVuaygtMSk/LnN0YXJ0ICsgZ2V0Q2h1bmsoLTEpPy5sZW5ndGggPT0gY2h1bmsuc3RhcnRcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIC0xICdkaXInXG5cbiAgICBpZiBjaHVuay50dXJkID09ICctLScgYW5kIGdldENodW5rKDIpPy5zdGFydCA9PSBjaHVuay5zdGFydCsyIGFuZCBnZXRDaHVuaygtMSk/LnN0YXJ0K2dldENodW5rKC0xKT8ubGVuZ3RoIDwgY2h1bmsuc3RhcnRcbiAgICAgICAgYWRkVmFsdWUgMCAnYXJndW1lbnQnXG4gICAgICAgIGFkZFZhbHVlIDEgJ2FyZ3VtZW50J1xuICAgICAgICBzZXRWYWx1ZSAyICdhcmd1bWVudCdcbiAgICAgICAgcmV0dXJuIDNcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICctJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzEgYW5kIGdldENodW5rKC0xKT8uc3RhcnQrZ2V0Q2h1bmsoLTEpPy5sZW5ndGggPCBjaHVuay5zdGFydFxuICAgICAgICBhZGRWYWx1ZSAwICdhcmd1bWVudCdcbiAgICAgICAgc2V0VmFsdWUgMSAnYXJndW1lbnQnXG4gICAgICAgIHJldHVybiAyXG5cbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbnN0YWNrZWQgPSAtPlxuXG4gICAgaWYgc3RhY2tUb3BcbiAgICAgICAgcmV0dXJuIGlmIHN0YWNrVG9wLndlYWtcbiAgICAgICAgaWYgc3RhY2tUb3Auc3Ryb25nXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9IHRvcFR5cGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdG9wVHlwZVxuICAgICAgICByZXR1cm4gMVxuXG5wdXNoRXh0ID0gKG10Y2gpIC0+XG4gICAgZXh0VG9wID0gc3dpdGNoOm10Y2gsIHN0YXJ0OmxpbmUsIHN0YWNrOnN0YWNrXG4gICAgZXh0U3RhY2sucHVzaCBleHRUb3BcblxuYWN0RXh0ID0gLT5cbiAgICBzdGFjayAgICA9IFtdXG4gICAgc3RhY2tUb3AgPSBudWxsXG4gICAgdG9wVHlwZSAgPSAnJ1xuICAgIG5vdENvZGUgID0gZmFsc2VcblxucG9wRXh0ID0gLT5cbiAgICBzdGFjayA9IGV4dFRvcC5zdGFja1xuICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN0YXJ0LmV4dFxuICAgIGV4dFN0YWNrLnBvcCgpXG4gICAgZXh0VG9wID0gZXh0U3RhY2tbLTFdXG5cbiAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgIG5vdENvZGUgPSBzdGFja1RvcCBhbmQgdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG5cbnB1c2hTdGFjayA9IChvKSAtPlxuICAgIHN0YWNrLnB1c2ggb1xuICAgIHN0YWNrVG9wID0gb1xuICAgIHRvcFR5cGUgPSBvLnR5cGVcbiAgICBub3RDb2RlID0gdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG5cbnBvcFN0YWNrID0gLT5cbiAgICBzdGFjay5wb3AoKVxuICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgbm90Q29kZSA9IHN0YWNrVG9wIGFuZCB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcblxuZ2V0Q2h1bmsgPSAoZCkgLT4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXVxuc2V0VmFsdWUgPSAoZCwgdmFsdWUpIC0+IGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS52YWx1ZSA9IHZhbHVlXG5nZXRWYWx1ZSA9IChkKSAtPiBnZXRDaHVuayhkKT8udmFsdWUgPyAnJ1xuZ2V0bWF0Y2ggPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/Lm1hdGNoID8gJydcbmFkZFZhbHVlID0gKGQsIHZhbHVlKSAtPlxuICAgIGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoXG4gICAgICAgIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF0udmFsdWUgKz0gJyAnICsgdmFsdWVcbiAgICAxXG5cbmFkZFZhbHVlcyA9IChuLHZhbHVlKSAtPlxuICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgYWRkVmFsdWUgaSwgdmFsdWVcbiAgICBuXG5cbmhhbmRsZXJzID1cbiAgICBjb2ZmZWU6XG4gICAgICAgICAgcHVuY3Q6WyBibG9ja0NvbW1lbnQsIGhhc2hDb21tZW50LCB0cmlwbGVSZWdleHAsIGNvZmZlZVB1bmN0LCB0cmlwbGVTdHJpbmcsIHNpbXBsZVN0cmluZywgaW50ZXJwb2xhdGlvbiwgZGFzaEFycm93LCByZWdleHAsIGRpY3QgXVxuICAgICAgICAgIHdvcmQ6IFsga2V5d29yZCwgY29mZmVlV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSBdXG4gICAgbm9vbjogcHVuY3Q6WyBub29uQ29tbWVudCwgIG5vb25QdW5jdCwgdXJsUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsgbm9vbldvcmQsIHVybFdvcmQsIG51bWJlciAgICAgICAgICBdXG4gICAganM6ICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwganNQdW5jdCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCBdLCB3b3JkOlsga2V5d29yZCwganNXb3JkLCBudW1iZXIsIHByb3BlcnR5ICBdXG4gICAgdHM6ICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwganNQdW5jdCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCBdLCB3b3JkOlsga2V5d29yZCwganNXb3JkLCBudW1iZXIsIHByb3BlcnR5ICBdXG4gICAgaXNzOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgaW5pOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsgICAgICAgICAgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgY3BwOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgY3BwV29yZCAgICBdXG4gICAgaHBwOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgY3BwV29yZCAgICBdXG4gICAgYzogICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgY3BwV29yZCAgICBdXG4gICAgaDogICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgY3BwV29yZCAgICBdXG4gICAgY3M6ICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgcHVnOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgY3NzV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAgc3R5bDogcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgY3NzV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAgY3NzOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgY3NzV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAgc2FzczogcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgY3NzV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAgc2NzczogcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgY3NzV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAgc3ZnOiAgcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgaHRtbDogcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgaHRtOiAgcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgc2g6ICAgcHVuY3Q6WyBoYXNoQ29tbWVudCwgIHNpbXBsZVN0cmluZywgdXJsUHVuY3QsIHNoUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgdXJsV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAganNvbjogcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywganNvblB1bmN0LCB1cmxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwganNvbldvcmQsIHVybFdvcmQsIG51bWJlciBdXG4gICAgeW1sOiAgcHVuY3Q6WyBoYXNoQ29tbWVudCwgIHNpbXBsZVN0cmluZywgZGljdCwgdXJsUHVuY3QsIHNoUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgdXJsV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSBdXG4gICAgbG9nOiAgcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgdXJsUHVuY3QsIGRpY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsgdXJsV29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgbWQ6ICAgcHVuY3Q6WyAgICAgICAgICAgICAgICAgICAgbWRQdW5jdCwgdXJsUHVuY3QsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsgdXJsV29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgZmlzaDogcHVuY3Q6WyAgICAgICAgICAgICAgICBoYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG5cbmZvciBleHQgaW4gZXh0c1xuICAgIGlmIG5vdCBoYW5kbGVyc1tleHRdP1xuICAgICAgICBoYW5kbGVyc1tleHRdID0gcHVuY3Q6WyBzaW1wbGVTdHJpbmcgXSwgd29yZDpbIG51bWJlciBdXG5cbmZvciBleHQsb2JqIG9mIGhhbmRsZXJzXG4gICAgaGFuZGxlcnNbZXh0XS5wdW5jdC5wdXNoIHN0YWNrZWRcbiAgICBoYW5kbGVyc1tleHRdLndvcmQucHVzaCBzdGFja2VkXG5cbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcbiMjI1xuXG7ilrhkb2MgJ2Jsb2NrZWQgbGluZXMnXG5cbiAgICBsaW5lczogYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuXG4gICAgcmV0dXJucyBsaW5lcyB3aXRoXG4gICAgLSAnZXh0JyBzd2l0Y2hlZCBpbiBzb21lIGxpbmVzXG4gICAgLSAndmFsdWUnIGNoYW5nZWQgaW4gY2h1bmtzIHRoYXQgbWF0Y2ggbGFuZ3VhZ2UgcGF0dGVybnNcblxuYmxvY2tlZCA9IChsaW5lcykgLT5cblxuICAgIGV4dFN0YWNrICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBbXVxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIGV4dFRvcCAgICAgPSBudWxsXG4gICAgc3RhY2tUb3AgICA9IG51bGxcbiAgICBub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbiAgICB0b3BUeXBlICAgID0gJydcbiAgICBleHQgICAgICAgID0gJydcbiAgICBsaW5lICAgICAgID0gbnVsbFxuICAgIGNodW5rICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IDBcblxuICAgICMgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuXG4gICAgICAgIGlmIHN0YWNrVG9wXG5cbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLnR5cGUgPT0gJ2NvbW1lbnQgdHJpcGxlJ1xuXG4gICAgICAgICAgICAgICAgbWlnaHRCZUhlYWRlciA9IHRydWVcbiAgICAgICAgICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IEhFQURFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgaWYgbWlnaHRCZUhlYWRlclxuICAgICAgICAgICAgICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaWYgc3RhY2tUb3AuZmlsbCB0aGVuIHBvcFN0YWNrKClcblxuICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgIGlmIGV4dFRvcC5zd2l0Y2guaW5kZW50IGFuZCBsaW5lLmNodW5rc1swXT8uc3RhcnQgPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5zdGFydFxuICAgICAgICAgICAgICAgIHBvcEV4dCgpICAgICAgICAgICAgICAgICAgICAgICAgIyBlbmQgb2YgZXh0ZW5zaW9uIGJsb2NrIHJlYWNoZWQgdGhhdCBpcyB0ZXJtaW5hdGVkIGJ5IGluZGVudGF0aW9uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3dpdGNoLnRvICAgICAjIG1ha2Ugc3VyZSB0aGUgY3VycmVudCBsaW5lIGV4dCBtYXRjaGVzIHRoZSB0b3Btb3N0IGZyb20gc3RhY2tcblxuICAgICAgICBpZiBleHQgIT0gbGluZS5leHQgICAgICAgICAgICAgICAgICAgICAgIyBlaXRoZXIgYXQgc3RhcnQgb2YgZmlsZSBvciB3ZSBzd2l0Y2hlZCBleHRlbnNpb25cbiAgICAgICAgICAgIGFjdEV4dCgpXG4gICAgICAgICAgICBoYW5kbCA9IGhhbmRsZXJzW2V4dCA9IGxpbmUuZXh0XSAgICAjIGluc3RhbGwgbmV3IGhhbmRsZXJzXG4gICAgICAgICAgICBpZiBub3QgaGFuZGxcbiAgICAgICAgICAgICAgICDilrhkYmcgbGluZVxuICAgICAgICAgICAgICAgIOKWuGRiZyBoYW5kbGVyc1xuICAgICAgICAgICAg4pa4YXNzZXJ0IGhhbmRsXG5cbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgICAgICBjaHVua0luZGV4ID0gMFxuICAgICAgICB3aGlsZSBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoXG5cbiAgICAgICAgICAgIGNodW5rID0gbGluZS5jaHVua3NbY2h1bmtJbmRleF1cblxuICAgICAgICAgICAgYmVmb3JlSW5kZXggPSBjaHVua0luZGV4XG5cbiAgICAgICAgICAgIGlmIGNodW5rLnZhbHVlID09ICdwdW5jdCdcblxuICAgICAgICAgICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmVuZD8gYW5kIGV4dFRvcC5zd2l0Y2guZW5kID09IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlcyBjaHVuay50dXJkLmxlbmd0aCwgZXh0VG9wLnN3aXRjaC5hZGQgaWYgZXh0VG9wLnN3aXRjaC5hZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcEV4dCgpICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSB0dXJkXG5cbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLnB1bmN0ID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGVsc2UgIyB3b3JkcywgbnVtYmVyc1xuXG4gICAgICAgICAgICAgICAgaWYgbm90IG5vdENvZGVcbiAgICAgICAgICAgICAgICAgICAgaWYgbXRjaCA9IHN3dGNoW2xpbmUuZXh0XT9bY2h1bmsubWF0Y2hdXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dXJkQ2h1bmsgPSBnZXRDaHVuayAtbXRjaC50dXJkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG10Y2gudHVyZCA9PSAodHVyZENodW5rPy50dXJkID8gdHVyZENodW5rPy5tYXRjaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBwdXNoIGEgbmV3IGV4dGVuc2lvbiBvbnRvIHRoZSBzdGFjaywgZXh0IHdpbGwgY2hhbmdlIG9uIHN0YXJ0IG9mIG5leHQgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoRXh0IG10Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbXRjaC5uZXh0IGFuZCBnZXRDaHVuaygxKS5tYXRjaCA9PSBtdGNoLm5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoRXh0IG10Y2hcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLndvcmQgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSBiZWZvcmVJbmRleFxuICAgICAgICAgICAgICAgIGNodW5rSW5kZXgrK1xuICAgIGxpbmVzXG5cbnJwYWQgPSAocywgbCkgLT5cbiAgICBzID0gU3RyaW5nIHNcbiAgICB3aGlsZSBzLmxlbmd0aCA8IGwgdGhlbiBzICs9ICcgJ1xuICAgIHNcblxucGFkID0gKGwpIC0+IHJwYWQgJycsIGxcbiAgICBcbnJlcGxhY2VUYWJzID0gKHMpIC0+XG4gICAgaSA9IDBcbiAgICB3aGlsZSBpIDwgcy5sZW5ndGhcbiAgICAgICAgaWYgc1tpXSA9PSAnXFx0J1xuICAgICAgICAgICAgcyA9IHNbLi4uaV0gKyBwYWQoNC0oaSU0KSkgKyBzW2krMS4uXVxuICAgICAgICBpICs9IDFcbiAgICBzXG5cbnBhcnNlID0gKGxpbmVzLCBleHQ9J2NvZmZlZScpIC0+IGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxua29sb3JpemUgPSAoY2h1bmspIC0+IFxuICAgIFxuICAgIGlmIGNuID0ga29sb3IubWFwW2NodW5rLnZhbHVlXVxuICAgICAgICBpZiBjbiBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICB2ID0gY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIGZvciBjciBpbiBjblxuICAgICAgICAgICAgICAgIHYgPSBrb2xvcltjcl0gdlxuICAgICAgICAgICAgcmV0dXJuIHZcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGtvbG9yW2NuXSBjaHVuay5tYXRjaFxuICAgICAgICAgICAgXG4gICAgaWYgY2h1bmsudmFsdWUuZW5kc1dpdGggJ2ZpbGUnXG4gICAgICAgIHc4IGNodW5rLm1hdGNoXG4gICAgZWxzZSBpZiBjaHVuay52YWx1ZS5lbmRzV2l0aCAnZXh0J1xuICAgICAgICB3MyBjaHVuay5tYXRjaFxuICAgIGVsc2UgaWYgY2h1bmsudmFsdWUuc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgIGlmIExJLnRlc3QgY2h1bmsudmFsdWVcbiAgICAgICAgICAgIGtvbG9yaXplIG1hdGNoOmNodW5rLm1hdGNoLCB2YWx1ZTpjaHVuay52YWx1ZS5yZXBsYWNlIExJLCAnICdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdzIgY2h1bmsubWF0Y2hcbiAgICBlbHNlXG4gICAgICAgIGlmIExJLnRlc3QgY2h1bmsudmFsdWVcbiAgICAgICAgICAgIGtvbG9yaXplIG1hdGNoOmNodW5rLm1hdGNoLCB2YWx1ZTpjaHVuay52YWx1ZS5yZXBsYWNlIExJLCAnICdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAgIDAwMDAwICAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuXG5zeW50YXggPSAodGV4dDp0ZXh0LCBleHQ6J2NvZmZlZScsIG51bWJlcnM6ZmFsc2UpIC0+XG4gICAgXG4gICAgbGluZXMgPSB0ZXh0LnNwbGl0IE5FV0xJTkVcbiAgICBybmdzICA9IHBhcnNlKGxpbmVzLCBleHQpLm1hcCAobCkgLT4gbC5jaHVua3NcbiAgICBcbiAgICBjbGluZXMgPSBbXVxuICAgIGZvciBpbmRleCBpbiBbMC4uLmxpbmVzLmxlbmd0aF1cbiAgICAgICAgbGluZSA9IGxpbmVzW2luZGV4XVxuICAgICAgICBpZiBsaW5lLnN0YXJ0c1dpdGggJy8vIyBzb3VyY2VNYXBwaW5nVVJMJ1xuICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICBjbHJ6ZCA9ICcnXG4gICAgICAgIGlmIG51bWJlcnNcbiAgICAgICAgICAgIG51bXN0ciA9IFN0cmluZyBpbmRleCsxXG4gICAgICAgICAgICBjbHJ6ZCArPSB3MihudW1zdHIpICsgcnBhZCAnJywgNC1udW1zdHIubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgYyA9IDBcbiAgICAgICAgciA9IHJuZ3NbaW5kZXhdXG4gICAgXG4gICAgICAgIGZvciBpIGluIFswLi4uci5sZW5ndGhdXG4gICAgICAgICAgICB3aGlsZSBjIDwgcltpXS5zdGFydCBcbiAgICAgICAgICAgICAgICBjbHJ6ZCArPSAnICdcbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgIGNscnpkICs9IGtvbG9yaXplIHJbaV1cbiAgICAgICAgICAgIGMgKz0gcltpXS5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICBjbGluZXMucHVzaCBjbHJ6ZFxuICAgIGNsaW5lcy5qb2luICdcXG4nXG5cbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgICBrb2xvcjogICAgICBrb2xvclxuICAgIGV4dHM6ICAgICAgIGV4dHNcbiAgICBwYXJzZTogICAgICBwYXJzZVxuICAgIGNodW5rZWQ6ICAgIGNodW5rZWRcbiAgICByYW5nZXM6ICAgICAobGluZSwgZXh0PSdjb2ZmZWUnKSAgLT4gcGFyc2UoW2xpbmVdLCBleHQpWzBdLmNodW5rc1xuICAgIGRpc3NlY3Q6ICAgIChsaW5lcywgZXh0PSdjb2ZmZWUnKSAtPiBwYXJzZShsaW5lcywgZXh0KS5tYXAgKGwpIC0+IGwuY2h1bmtzXG4gICAga29sb3JpemU6ICAga29sb3JpemVcbiAgICBzeW50YXg6ICAgICBzeW50YXhcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxu4pa4dGVzdCAncHJvZmlsZSdcblxuICAgIHtzbGFzaH0gPSByZXF1aXJlICdreGsnXG4gICAgdGV4dDAgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvY29mZmVlL25vZGVzLmNvZmZlZVwiXG4gICAgdGV4dDEgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiXG5cbiAgICBsaW5lczAgPSB0ZXh0MC5zcGxpdCAnXFxuJ1xuICAgIGxpbmVzMSA9IHRleHQxLnNwbGl0ICdcXG4nXG5cbiAgICBmb3IgaSBpbiBbMC4uNV1cbiAgICAgICAgcGFyc2UgbGluZXMwXG5cbiAgICDilrhhdmVyYWdlIDEwMFxuICAgICAgICBwYXJzZSBsaW5lczBcbiJdfQ==
//# sourceURL=../coffee/klor.coffee