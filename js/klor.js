// koffee 1.12.0

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
    var i, k, prev, ref1;
    if (notCode) {
        return;
    }
    if (chunk.match === ':') {
        if (prev = getChunk(-1)) {
            if (prev.match === '"') {
                for (i = k = ref1 = chunkIndex - 2; ref1 <= 0 ? k <= 0 : k >= 0; i = ref1 <= 0 ? ++k : --k) {
                    if (line.chunks[i].clss === 'punct string double') {
                        line.chunks[i].clss = 'punct dictionary';
                        break;
                    }
                    line.chunks[i].clss = 'dictionary key';
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
    frag: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float, cppWord]
    },
    vert: {
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
                klog('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1167[39m', line);
                klog('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1168[39m', handlers);
            }
            if (!(handl)) {
                klog('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1169[39m', '[1m[97massertion failure![39m[22m');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2xvci5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtsb3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHN6QkFBQTtJQUFBOzs7O0FBa0NBLE1BQWlCLE9BQUEsQ0FBVyxTQUFELEdBQVcsa0JBQXJCLENBQWpCLEVBQUUsZUFBRixFQUFROztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFFUixLQUFBLEdBQ0k7SUFBQSxNQUFBLEVBQ0k7UUFBQSxHQUFBLEVBQUs7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFTLEVBQUEsRUFBRyxJQUFaO1lBQWlCLE1BQUEsRUFBTyxDQUF4QjtTQUFMO0tBREo7SUFFQSxHQUFBLEVBQ0k7UUFBQSxNQUFBLEVBQVE7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFTLEVBQUEsRUFBRyxJQUFaO1lBQWlCLE1BQUEsRUFBTyxDQUF4QjtTQUFSO0tBSEo7SUFJQSxFQUFBLEVBQ0k7UUFBQSxZQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxRQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtZQUFpQyxHQUFBLEVBQUksYUFBckM7U0FBZDtRQUNBLFVBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLElBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1lBQWlDLEdBQUEsRUFBSSxhQUFyQztTQURkO0tBTEo7OztBQVFKLEtBQUEsc0NBQUE7O0lBQ0ksS0FBSyxDQUFDLEVBQUcsQ0FBQSxHQUFBLENBQVQsR0FBZ0I7UUFBQSxJQUFBLEVBQUssS0FBTDtRQUFXLEVBQUEsRUFBRyxHQUFkO1FBQW1CLEdBQUEsRUFBSSxLQUF2QjtRQUE2QixHQUFBLEVBQUksYUFBakM7O0FBRHBCOztBQUdBLEtBQUEsR0FBVTs7QUFDVixNQUFBLEdBQVU7O0FBQ1YsS0FBQSxHQUFVOztBQUNWLE1BQUEsR0FBVTs7QUFD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RUFBWSxLQUFaO0lBQ0EsSUFBQSxFQUFZLElBRFo7SUFFQSxLQUFBLEVBQVksS0FGWjtJQUdBLE9BQUEsRUFBWSxPQUhaO0lBSUEsTUFBQSxFQUFZLFNBQUMsSUFBRCxFQUFPLEdBQVA7O1lBQU8sTUFBSTs7ZUFBYyxLQUFBLENBQU0sQ0FBQyxJQUFELENBQU4sRUFBYyxHQUFkLENBQW1CLENBQUEsQ0FBQSxDQUFFLENBQUM7SUFBL0MsQ0FKWjtJQUtBLE9BQUEsRUFBWSxTQUFDLEtBQUQsRUFBUSxHQUFSOztZQUFRLE1BQUk7O2VBQWEsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLENBQWlCLENBQUMsR0FBbEIsQ0FBc0IsU0FBQyxDQUFEO21CQUFPLENBQUMsQ0FBQztRQUFULENBQXRCO0lBQXpCLENBTFo7SUFNQSxRQUFBLEVBQVksUUFOWjtJQU9BLGNBQUEsRUFBZ0IsY0FQaEI7SUFRQSxNQUFBLEVBQVksTUFSWiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyMjXG5cbuKWuGlmIG9wdHMubGFuZyAjIGtvZmZlZSAtLWxhbmcga2xvci5jb2ZmZWVcblxuICAgIGZzICAgPSByZXF1aXJlICdmcydcbiAgICBub29uX2xvYWQgPSByZXF1aXJlICdub29uL2pzL2xvYWQnXG4gICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbiAgICBub29uRmlsZSA9IHBhdGguam9pbiBfX2Rpcm5hbWUsICdsYW5nLm5vb24nXG4gICAganNvbkZpbGUgPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdqcycgJ2xhbmcuanNvbidcblxuICAgIGxvZyAnY29tcGlsZTonIG5vb25GaWxlXG4gICAgbG9nICdvdXRwdXQ6JyAganNvbkZpbGVcblxuICAgIGxhbmcgPSB7fVxuICAgIGV4dHMgPSBbJ3R4dCcnbG9nJ11cbiAgICBmb3IgbmFtZXMsIGtleXdvcmRzIG9mIG5vb25fbG9hZCBub29uRmlsZVxuXG4gICAgICAgIGZvciBleHQgaW4gbmFtZXMuc3BsaXQgL1xccy9cbiAgICAgICAgICAgIGV4dHMucHVzaChleHQpIGlmIGV4dCBub3QgaW4gZXh0c1xuICAgICAgICAgICAgbGFuZ1tleHRdID89IHt9XG4gICAgICAgICAgICBmb3IgdmFsdWUsd29yZHMgb2Yga2V5d29yZHNcbiAgICAgICAgICAgICAgICBmb3Igd29yZCBpbiB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICBsYW5nW2V4dF1bd29yZF0gPSB2YWx1ZVxuXG4gICAganNvbiA9IEpTT04uc3RyaW5naWZ5IHtleHRzOmV4dHMsIGxhbmc6bGFuZ30sIG51bGwsICcgICAgJ1xuICAgIGZzLndyaXRlRmlsZVN5bmMganNvbkZpbGUsIGpzb24sICd1dGY4J1xuXG57IGV4dHMsIGxhbmcgfSA9IHJlcXVpcmUgXCIje19fZGlybmFtZX0vLi4vanMvbGFuZy5qc29uXCJcbmtvbG9yID0gcmVxdWlyZSAnLi9rb2xvcidcblxuc3d0Y2ggPVxuICAgIGNvZmZlZTpcbiAgICAgICAgZG9jOiB0dXJkOifilrgnIHRvOidtZCcgaW5kZW50OjFcbiAgICBwdWc6XG4gICAgICAgIHNjcmlwdDogbmV4dDonLicgdG86J2pzJyBpbmRlbnQ6MVxuICAgIG1kOlxuICAgICAgICBjb2ZmZWVzY3JpcHQ6IHR1cmQ6J2BgYCcgdG86J2NvZmZlZScgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgIGphdmFzY3JpcHQ6ICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcblxuZm9yIGV4dCBpbiBleHRzXG4gICAgc3d0Y2gubWRbZXh0XSA9IHR1cmQ6J2BgYCcgdG86ZXh0LCBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcblxuU1BBQ0UgICA9IC9cXHMvXG5IRUFERVIgID0gL14wKyQvXG5QVU5DVCAgID0gL1xcVysvZ1xuTlVNQkVSICA9IC9eXFxkKyQvXG5GTE9BVCAgID0gL15cXGQrZiQvXG5IRVhOVU0gID0gL14weFthLWZBLUZcXGRdKyQvXG5IRVggICAgID0gL15bYS1mQS1GXFxkXSskL1xuTkVXTElORSA9IC9cXHI/XFxuL1xuTEkgICAgICA9IC8oXFxzbGlcXGRcXHN8XFxzaFxcZFxccykvXG5cbmNvZGVUeXBlcyA9IFsnaW50ZXJwb2xhdGlvbicgJ2NvZGUgdHJpcGxlJ11cblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuXG7ilrhkb2MgJ2NodW5rZWQgbGluZXMsIGV4dCdcblxuICAgIHJldHVybnMgYXJyYXkgb2ZcblxuICAgICAgICBjaHVua3M6IFtcbiAgICAgICAgICAgICAgICAgICAgdHVyZDogICBzXG4gICAgICAgICAgICAgICAgICAgIGNsc3M6ICAgc1xuICAgICAgICAgICAgICAgICAgICBtYXRjaDogIHNcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6ICBuXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogblxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgZXh0OiAgICBzXG4gICAgICAgIGNoYXJzOiAgblxuICAgICAgICBpbmRleDogIG5cbiAgICAgICAgbnVtYmVyOiBuKzFcblxuY2h1bmtlZCA9IChsaW5lcywgZXh0KSAtPlxuXG4gICAgZXh0ID0gZXh0WzEuLl0gaWYgZXh0WzBdID09ICcuJ1xuICAgIGV4dCA9ICd0eHQnIGlmIGV4dCBub3QgaW4gZXh0c1xuXG4gICAgbGluZW5vID0gMFxuICAgIGxpbmVzLm1hcCAodGV4dCkgLT5cblxuICAgICAgICBsaW5lID1cbiAgICAgICAgICAgIGNodW5rczogW11cbiAgICAgICAgICAgIGNoYXJzOiAgMFxuICAgICAgICAgICAgaW5kZXg6ICBsaW5lbm8rK1xuICAgICAgICAgICAgbnVtYmVyOiBsaW5lbm9cbiAgICAgICAgICAgIGV4dDogICAgZXh0XG5cbiAgICAgICAgcmV0dXJuIGxpbmUgaWYgbm90IHRleHQgaW5zdGFuY2VvZiBTdHJpbmdcbiAgICAgICAgXG4gICAgICAgIGNodW5rcyA9IHJlcGxhY2VUYWJzKHRleHQpLnNwbGl0IFNQQUNFXG5cbiAgICAgICAgaWYgY2h1bmtzLmxlbmd0aCA9PSAxIGFuZCBjaHVua3NbMF0gPT0gJydcbiAgICAgICAgICAgIHJldHVybiBsaW5lICMgZW1wdHkgbGluZVxuXG4gICAgICAgIGMgPSAwXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuXG4gICAgICAgICAgICAgICAgIyBzZXBlcmF0ZSBieSBwdW5jdHVhdGlvblxuXG4gICAgICAgICAgICAgICAgd2hpbGUgbSA9IFBVTkNULmV4ZWMgc1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIG0uaW5kZXggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB3bCA9IG0uaW5kZXgtKGMtc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICB3ID0gc1tjLXNjLi4ubS5pbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOndsLCBtYXRjaDp3LCBjbHNzOid0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSB3bFxuXG4gICAgICAgICAgICAgICAgICAgIHR1cmQgPSBwdW5jdCA9IG1bMF1cblxuICAgICAgICAgICAgICAgICAgICBwaSA9IDBcbiAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDFcbiAgICAgICAgICAgICAgICAgICAgY2xzcyA9ICdwdW5jdCdcblxuICAgICAgICAgICAgICAgICAgICB3aGlsZSBwaSA8IHB1bmN0Lmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBwYyA9IHB1bmN0W3BpXVxuICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIDB4RDgwMCA8PSBwdW5jdC5jaGFyQ29kZUF0KHBpKSA8PSAweERCRkYgYW5kIDB4REMwMCA8PSBwdW5jdC5jaGFyQ29kZUF0KHBpKzEpIDw9IDB4REZGRlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgPSAyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xzcyA9ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBjICs9IHB1bmN0W3BpKzFdXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xzcyA9ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBwYyBpbiBbJywnJzsnJ3snJ30nJygnJyknXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHNzICs9ICcgbWlub3InXG4gICAgICAgICAgICAgICAgICAgICAgICBwaSArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDphZHZhbmNlLCBtYXRjaDpwYywgdHVyZDp0dXJkLCBjbHNzOmNsc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHR1cmRbYWR2YW5jZS4uXVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIHBpIDwgcHVuY3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHNzID0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcHVuY3RbcGkuLl0gaW4gWycsJyc7Jyd7Jyd9JycoJycpJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHNzICs9ICcgbWlub3InXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDphZHZhbmNlLCBtYXRjaDpwdW5jdFtwaS4uXSwgY2xzczpjbHNzXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IGFkdmFuY2VcblxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXJcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6cmwsIG1hdGNoOncsIGNsc3M6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgIGMgKz0gcmxcblxuICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGxhc3QgPSBsaW5lLmNodW5rc1stMV1cbiAgICAgICAgICAgIGxpbmUuY2hhcnMgPSBsYXN0LnN0YXJ0ICsgbGFzdC5sZW5ndGhcblxuICAgICAgICBsaW5lXG5cbiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4jIyNcblxuZXh0U3RhY2sgICA9IFtdXG5zdGFjayAgICAgID0gW11cbmhhbmRsICAgICAgPSBbXVxuZXh0VG9wICAgICA9IG51bGxcbnN0YWNrVG9wICAgPSBudWxsXG5ub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbnRvcFR5cGUgICAgPSAnJ1xuZXh0ICAgICAgICA9ICcnXG5saW5lICAgICAgID0gbnVsbFxuY2h1bmsgICAgICA9IG51bGxcbmNodW5rSW5kZXggPSAwXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmZpbGxDb21tZW50ID0gKG4pIC0+XG5cbiAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgIGFkZFZhbHVlIGksICdjb21tZW50J1xuICAgIGlmIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGgtblxuICAgICAgICByZXN0Q2h1bmtzID0gbGluZS5jaHVua3NbY2h1bmtJbmRleCtuLi5dXG4gICAgICAgIG1pZ2h0QmVIZWFkZXIgPSB0cnVlXG4gICAgICAgIGZvciBjIGluIHJlc3RDaHVua3NcbiAgICAgICAgICAgIGMuY2xzcyA9ICdjb21tZW50J1xuICAgICAgICAgICAgaWYgbWlnaHRCZUhlYWRlciBhbmQgbm90IEhFQURFUi50ZXN0IGMubWF0Y2hcbiAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gZmFsc2VcbiAgICAgICAgaWYgbWlnaHRCZUhlYWRlclxuICAgICAgICAgICAgZm9yIGMgaW4gcmVzdENodW5rc1xuICAgICAgICAgICAgICAgIGMuY2xzcyArPSAnIGhlYWRlcidcbiAgICBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgblxuXG5oYXNoQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgc3RhY2tUb3AgYW5kIHRvcFR5cGUgIT0gJ3JlZ2V4cCB0cmlwbGUnXG4gICAgaWYgc3RhY2tUb3AgYW5kIHN0YWNrVG9wLmxpbmVubyA9PSBsaW5lLm51bWJlclxuICAgICAgICByZXR1cm4gIyBjb21tZW50cyBpbnNpZGUgdHJpcGxlIHJlZ2V4cCBvbmx5IHZhbGlkIG9uIGludGVybmFsIGxpbmVzP1xuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgZmlsbENvbW1lbnQgMVxuXG5ub29uQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgc3RhY2tUb3BcblxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiIGFuZCBjaHVua0luZGV4ID09IDBcbiAgICAgICAgZmlsbENvbW1lbnQgMVxuXG5zbGFzaENvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wXG5cbiAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoIFwiLy9cIlxuICAgICAgICBmaWxsQ29tbWVudCAyXG5cbmJsb2NrQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG5cbiAgICB0eXBlID0gJ2NvbW1lbnQgdHJpcGxlJ1xuXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgbm90IGluIFsnaW50ZXJwb2xhdGlvbicsIHR5cGVdXG5cbiAgICBpZiBjaHVuay50dXJkWy4uMl0gPT0gJyMjIydcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG5cbnN0YXJDb21tZW50ID0gLT5cblxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZFxuXG4gICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZSdcblxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlICE9IHR5cGVcblxuICAgIGlmIGNodW5rLnR1cmRbLi4xXSA9PSAnLyonIGFuZCBub3QgdG9wVHlwZVxuICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuICAgIGlmIGNodW5rLnR1cmRbLi4xXSA9PSAnKi8nIGFuZCB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwXG5cbmRhc2hBcnJvdyA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgbWFya0Z1bmMgPSAtPlxuICAgICAgICBpZiBsaW5lLmNodW5rc1swXS5jbHNzID09ICd0ZXh0J1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMV0ubWF0Y2ggPT0gJz0nIGFuZCBsaW5lLmNodW5rc1syXS5tYXRjaCAhPSAnPidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS5jbHNzID0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLmNsc3MgKz0gJyBmdW5jdGlvbidcbiAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbMV0ubWF0Y2ggPT0gJzonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0uY2xzcyA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0uY2xzcyArPSAnIG1ldGhvZCdcblxuICAgIGlmIGNodW5rLnR1cmRcblxuICAgICAgICBpZiBjaHVuay50dXJkLnN0YXJ0c1dpdGggJy0+J1xuICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEgJ2Z1bmN0aW9uIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS5jbHNzID09ICdkaWN0aW9uYXJ5IGtleScgb3IgbGluZS5jaHVua3NbMF0udHVyZD9bLi4xXSA9PSAnQDonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0uY2xzcyA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0uY2xzcyA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzBdLm1hdGNoID09ICdAJyBhbmQgbGluZS5jaHVua3NbMV0uY2xzcyA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0uY2xzcyA9ICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0uY2xzcyA9ICdtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMl0uY2xzcyA9ICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgICAgIGlmIGNodW5rLnR1cmQuc3RhcnRzV2l0aCAnPT4nXG4gICAgICAgICAgICBtYXJrRnVuYygpXG4gICAgICAgICAgICBhZGRWYWx1ZSAwICdmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSAnZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLmNsc3MgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLmNsc3MgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLmNsc3MgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDJcblxuY29tbWVudEhlYWRlciA9IC0+XG5cbiAgICBpZiB0b3BUeXBlID09ICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaWYgSEVBREVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIGNodW5rLmNsc3MgPSAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDBcblxudGhpc0NhbGwgPSAtPlxuXG4gICAgc2V0VmFsdWUgLTEgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgaWYgZ2V0bWF0Y2goLTIpID09ICdAJ1xuICAgICAgICBzZXRWYWx1ZSAtMiAncHVuY3QgZnVuY3Rpb24gY2FsbCdcbiAgICAwXG5cbmNvZmZlZVB1bmN0ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAn4pa4J1xuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAnbWV0YSdcblxuICAgIGlmIGNodW5rLnR1cmQgPT0gJ34+J1xuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ21ldGEnXG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcblxuICAgICAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoKCcuLicpIGFuZCBwcmV2Lm1hdGNoICE9ICcuJ1xuICAgICAgICAgICAgaWYgY2h1bmsudHVyZFsyXSAhPSAnLidcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ3JhbmdlJ1xuICAgICAgICAgICAgaWYgY2h1bmsudHVyZFszXSAhPSAnLidcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgJ3JhbmdlJ1xuXG4gICAgICAgIGlmIHByZXYuY2xzcy5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi5jbHNzID09ICdwcm9wZXJ0eSdcblxuICAgICAgICAgICAgcHJldkVuZCA9IHByZXYuc3RhcnQrcHJldi5sZW5ndGhcbiAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcoJyBhbmQgcHJldkVuZCA9PSBjaHVuay5zdGFydFxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG4gICAgICAgICAgICBlbHNlIGlmIHByZXZFbmQgPCBjaHVuay5zdGFydCAjIHNwYWNlZFxuICAgICAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoIGluICdAWyh7XCJcXCcnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjaHVuay5tYXRjaCBpbiAnKy0vJ1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgbmV4dCBvciBuZXh0Lm1hdGNoICE9ICc9JyBhbmQgbmV4dC5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuXG5jb2ZmZWVXb3JkID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcblxuICAgICAgICBpZiBwcmV2LmNsc3MgPT0gJ3B1bmN0IG1ldGEnXG4gICAgICAgICAgICBpZiBjaHVuay5zdGFydCA9PSBwcmV2LnN0YXJ0KzFcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdtZXRhJ1xuICAgICAgICAgICAgICAgIHJldHVybiAwICMgZ2l2ZSBzd2l0Y2ggYSBjaGFuY2VcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoIGluIFsnY2xhc3MnLCAnZXh0ZW5kcyddXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdjbGFzcydcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgY2h1bmsuY2xzcy5zdGFydHNXaXRoICdrZXl3b3JkJ1xuXG4gICAgICAgICAgICByZXR1cm4gMSAjIHdlIGFyZSBkb25lIHdpdGggdGhlIGtleXdvcmRcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ3RoaXMnXG4gICAgICAgICAgICBhZGRWYWx1ZSAgMCAndGhpcydcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgKHByZXYuY2xzcy5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi5jbHNzID09ICdwcm9wZXJ0eScpIGFuZCBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgY2h1bmsuc3RhcnQgIyBzcGFjZWRcbiAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG5cbnByb3BlcnR5ID0gLT4gIyB3b3JkXG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgIHByZXZQcmV2ID0gZ2V0Q2h1bmsgLTJcblxuICAgICAgICBpZiBwcmV2UHJldj8ubWF0Y2ggIT0gJy4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAncHJvcGVydHknXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIGlmIHByZXZQcmV2XG4gICAgICAgICAgICAgICAgaWYgcHJldlByZXYuY2xzcyBub3QgaW4gWydwcm9wZXJ0eScgJ251bWJlciddIGFuZCBub3QgcHJldlByZXYuY2xzcy5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ29iaidcbiAgICAgICAgICAgIHJldHVybiAxXG5cbmNwcFdvcmQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIHAgPSBwcm9wZXJ0eSgpIHRoZW4gcmV0dXJuIHBcblxuICAgIGlmIGdldENodW5rKC0yKT8udHVyZCA9PSAnOjonXG5cbiAgICAgICAgaWYgcHJldlByZXYgPSBnZXRDaHVuayAtM1xuICAgICAgICAgICAgc2V0VmFsdWUgLTMgJ3B1bmN0IG9iaidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0yICdvYmonXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAnb2JqJ1xuICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ21ldGhvZCdcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJzwnIGFuZCBnZXRtYXRjaCgxKSBpbiAnLD4nIG9yIGdldG1hdGNoKDEpID09ICc+JyBhbmQgZ2V0bWF0Y2goLTEpIGluICcsJ1xuXG4gICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCB0ZW1wbGF0ZSdcbiAgICAgICAgc2V0VmFsdWUgIDAgJ3RlbXBsYXRlJ1xuICAgICAgICBzZXRWYWx1ZSAgMSAncHVuY3QgdGVtcGxhdGUnXG4gICAgICAgIHJldHVybiAyXG5cbiAgICBpZiAvW0EtWl0vLnRlc3QgY2h1bmsubWF0Y2hbMV1cbiAgICAgICAgc3dpdGNoIGNodW5rLm1hdGNoWzBdXG4gICAgICAgICAgICB3aGVuICdUJ1xuICAgICAgICAgICAgICAgIGlmIGdldG1hdGNoKDEpID09ICc8J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdrZXl3b3JkIHR5cGUnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIHdoZW4gJ0YnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMCAnc3RydWN0J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIHdoZW4gJ0EnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMCAnb2JqJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBjaHVuay5jbHNzID09ICd0ZXh0JyBhbmQgZ2V0bWF0Y2goMSkgPT0gJygnXG4gICAgICAgIHNldFZhbHVlIDAgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIHJldHVybiAxXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5ub29uUHJvcCA9IC0+XG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5zdGFydCtwcmV2Lmxlbmd0aCsxIDwgY2h1bmsuc3RhcnRcbiAgICAgICAgICAgIGlmIHByZXYuY2xzcyAhPSAnb2JqJ1xuICAgICAgICAgICAgICAgIGZvciBpIGluIFtjaHVua0luZGV4LTEuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIGkgPCBjaHVua0luZGV4LTEgYW5kIGxpbmUuY2h1bmtzW2ldLnN0YXJ0K2xpbmUuY2h1bmtzW2ldLmxlbmd0aCsxIDwgbGluZS5jaHVua3NbaSsxXS5zdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbaV0uY2xzcyA9PSAndGV4dCcgb3IgbGluZS5jaHVua3NbaV0uY2xzcyA9PSAnb2JqJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0uY2xzcyA9ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBsaW5lLmNodW5rc1tpXS5jbHNzID09ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLmNsc3MgPSAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgMFxuXG5ub29uUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGUgIyBtYWtlcyB0aGlzIHNlbnNlIGhlcmUgPz8/XG5cbiAgICBub29uUHJvcCgpXG5cbm5vb25Xb3JkID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlICMgbWFrZXMgdGhpcyBzZW5zZSBoZXJlID8/P1xuXG4gICAgaWYgY2h1bmsuc3RhcnQgPT0gMFxuICAgICAgICBzZXRWYWx1ZSAwICdvYmonXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBub29uUHJvcCgpXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG51cmxQdW5jdCA9IC0+XG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnOi8vJ1xuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goNCkgPT0gJy4nIGFuZCBnZXRDaHVuayg1KVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICd1cmwgcHJvdG9jb2wnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWVzIDMgJ3VybCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMyAndXJsIGRvbWFpbidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgNCAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgNSAndXJsIHRsZCdcblxuICAgICAgICAgICAgICAgIHJldHVybiA2XG5cbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJy4nXG4gICAgICAgICAgICBpZiBub3QgcHJldi5jbHNzLnN0YXJ0c1dpdGgoJ251bWJlcicpIGFuZCBwcmV2LmNsc3MgIT0gJ3NlbXZlcicgYW5kIHByZXYubWF0Y2ggbm90IGluICdcXFxcLi8nXG4gICAgICAgICAgICAgICAgaWYgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgICAgICAgICAgaWYgbmV4dC5zdGFydCA9PSBjaHVuay5zdGFydCtjaHVuay5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVleHQgPSBuZXh0Lm1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBmaWxlZXh0IG5vdCBpbiAnXFxcXC4vKisnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgZmlsZWV4dCArICcgZmlsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAgMCBmaWxlZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDEgZmlsZWV4dCArICcgZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nXG5cbiAgICAgICAgICAgIGZvciBpIGluIFtjaHVua0luZGV4Li4wXVxuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGxpbmUuY2h1bmtzW2ldLnN0YXJ0K2xpbmUuY2h1bmtzW2ldLmxlbmd0aCA8IGxpbmUuY2h1bmtzW2krMV0/LnN0YXJ0XG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0uY2xzcy5lbmRzV2l0aCAnZGlyJ1xuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGxpbmUuY2h1bmtzW2ldLmNsc3Muc3RhcnRzV2l0aCAndXJsJ1xuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGxpbmUuY2h1bmtzW2ldLm1hdGNoID09ICdcIidcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tpXS5jbHNzLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS5jbHNzID0gJ3B1bmN0IGRpcidcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLmNsc3MgPSAndGV4dCBkaXInXG5cbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgMFxuXG51cmxXb3JkID0gLT5cblxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBwcmV2Lm1hdGNoIGluICdcXFxcLydcbiAgICAgICAgICAgIG5leHQgPSBnZXRDaHVuayAxXG4gICAgICAgICAgICBpZiBub3QgbmV4dCBvciBuZXh0LnN0YXJ0ID4gY2h1bmsuc3RhcnQrY2h1bmsubGVuZ3RoIG9yIG5leHQubWF0Y2ggbm90IGluICdcXFxcLi8nXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2ZpbGUnXG5cbiMgICAgICAgMDAwICAgMDAwMDAwMFxuIyAgICAgICAwMDAgIDAwMFxuIyAgICAgICAwMDAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAgICAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDBcblxuanNQdW5jdCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcoJ1xuICAgICAgICAgICAgaWYgcHJldi5jbHNzLnN0YXJ0c1dpdGgoJ3RleHQnKSBvciBwcmV2LmNsc3MgPT0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbmpzV29yZCA9IC0+XG5cbiAgICBpZiBjaHVuay5jbHNzID09ICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJz0nIGFuZCBnZXRWYWx1ZSgtMikuc3RhcnRzV2l0aCAndGV4dCdcbiAgICAgICAgICAgIHNldFZhbHVlIC0yICdmdW5jdGlvbidcbiAgICAwICMgd2UgbmVlZCB0aGlzIGhlcmVcblxuZGljdCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJzonIGFuZCBub3QgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCAnOjonXG4gICAgICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgaWYgcHJldi5jbHNzLnNwbGl0KCcgJylbMF0gaW4gWydzdHJpbmcnICdudW1iZXInICd0ZXh0JyAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDBcbiMgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiMgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuanNvblB1bmN0ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnOidcbiAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICdcIidcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbY2h1bmtJbmRleC0yLi4wXVxuICAgICAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tpXS5jbHNzID09ICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0uY2xzcyA9ICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0uY2xzcyA9ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG5qc29uV29yZCA9IC0+XG5cbiAgICBpZiAodG9wVHlwZSA9PSAnc3RyaW5nIGRvdWJsZScgb3IgdG9wVHlwZSA9PSAnc3RyaW5nIHNpbmdsZScpIGFuZCBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiAnXCJefj0nXG4gICAgICAgICAgICBpZiBOVU1CRVIudGVzdChnZXRtYXRjaCgwKSkgYW5kIGdldG1hdGNoKDEpID09ICcuJyBhbmQgTlVNQkVSLnRlc3QoZ2V0bWF0Y2goMikpIGFuZCBnZXRtYXRjaCgzKSA9PSAnLicgYW5kIE5VTUJFUi50ZXN0KGdldG1hdGNoKDQpKVxuICAgICAgICAgICAgICAgIGlmIHByZXYubWF0Y2ggaW4gJ15+PSdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IHNlbXZlcicgXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdwdW5jdCBzZW12ZXInIGlmIGdldG1hdGNoKC0yKSA9PSAnPidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMSAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDIgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAzICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgNCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiA1XG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwXG5cbmVzY2FwZSA9IC0+XG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnXFxcXCcgYW5kICh0b3BUeXBlPy5zdGFydHNXaXRoKCdyZWdleHAnKSBvciB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnKVxuICAgICAgICBpZiBjaHVua0luZGV4ID09IDAgb3Igbm90IGdldENodW5rKC0xKT8uZXNjYXBlXG4gICAgICAgICAgICBpZiBnZXRDaHVuaygxKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgIGNodW5rLmVzY2FwZSA9IHRydWVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwICdlc2NhcGUnXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuXG5yZWdleHAgPSAtPlxuXG4gICAgcmV0dXJuIGlmIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZydcblxuICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nXG5cbiAgICAgICAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICAgICAgY2h1bmsuY2xzcyArPSAnIHJlZ2V4cCBlbmQnXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGlmIGNodW5rSW5kZXhcbiAgICAgICAgICAgIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgbmV4dCA9IGdldENodW5rICsxXG4gICAgICAgICAgICBpZiBub3QgcHJldi5jbHNzLnN0YXJ0c1dpdGgoJ3B1bmN0JykgYW5kIG5vdCBwcmV2LmNsc3Muc3RhcnRzV2l0aCgna2V5d29yZCcpIG9yIHByZXYubWF0Y2ggaW4gXCIpXVwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgIGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPiAgY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAocHJldi5zdGFydCtwcmV2Lmxlbmd0aCA9PSBjaHVuay5zdGFydCkgYW5kIG5leHQ/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcblxuICAgICAgICAgICAgcmV0dXJuIGlmIG5leHQ/Lm1hdGNoID09ICc9J1xuICAgICAgICAgICAgcmV0dXJuIGlmIHByZXYuY2xzcy5zdGFydHNXaXRoICdudW1iZXInXG5cbiAgICAgICAgcHVzaFN0YWNrIHR5cGU6J3JlZ2V4cCdcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ3JlZ2V4cCBzdGFydCdcblxuICAgIGVzY2FwZSgpXG5cbnRyaXBsZVJlZ2V4cCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG5cbiAgICB0eXBlID0gJ3JlZ2V4cCB0cmlwbGUnXG5cbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSBub3QgaW4gWydpbnRlcnBvbGF0aW9uJywgdHlwZV1cbiAgICBpZiBjaHVuay50dXJkWy4uMl0gPT0gJy8vLydcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIGxpbmVubzpsaW5lLm51bWJlclxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG5cbnNpbXBsZVN0cmluZyA9IC0+XG5cbiAgICByZXR1cm4gaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG5cbiAgICBpZiBjaHVuay5tYXRjaCBpbiAnXCJcXCcnXG5cbiAgICAgICAgdHlwZSA9IHN3aXRjaCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnXG4gICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG5cbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIGVsc2UgaWYgbm90Q29kZVxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuXG4gICAgICAgIHB1c2hTdGFjayBzdHJvbmc6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBlc2NhcGUoKVxuXG50cmlwbGVTdHJpbmcgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgIHJldHVybiBpZiB0b3BUeXBlIGluIFsncmVnZXhwJydzdHJpbmcgc2luZ2xlJydzdHJpbmcgZG91YmxlJ11cblxuICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuXG4gICAgdHlwZSA9IHN3aXRjaCBjaHVuay50dXJkWy4uMl1cbiAgICAgICAgd2hlbiAnXCJcIlwiJyB0aGVuICdzdHJpbmcgZG91YmxlIHRyaXBsZSdcbiAgICAgICAgd2hlbiBcIicnJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuXG4gICAgaWYgdHlwZVxuXG4gICAgICAgIHJldHVybiBpZiB0eXBlICE9IHRvcFR5cGUgYW5kIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZydcblxuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHN0cm9uZzp0cnVlIHR5cGU6dHlwZVxuXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG5cbiAgICBlc2NhcGUoKVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDBcblxubnVtYmVyID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBOVU1CRVIudGVzdCBjaHVuay5tYXRjaFxuXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTQpID09ICdudW1iZXIgZmxvYXQnIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBpZiBnZXRtYXRjaCgtNSkgaW4gJ15+PSdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTUgJ3B1bmN0IHNlbXZlcicgXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC02ICdwdW5jdCBzZW12ZXInIGlmIGdldG1hdGNoKC02KSA9PSAnPidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtNCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdzZW12ZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBjaHVuay5jbHNzID0gJ251bWJlcidcbiAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIEhFWE5VTS50ZXN0IGNodW5rLm1hdGNoXG5cbiAgICAgICAgY2h1bmsuY2xzcyA9ICdudW1iZXIgaGV4J1xuICAgICAgICByZXR1cm4gMVxuXG4jIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmZsb2F0ID0gLT5cblxuICAgIGlmIEZMT0FULnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGNodW5rLmNsc3MgPSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICByZXR1cm4gMVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAgICAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmNzc1dvcmQgPSAtPlxuXG4gICAgaWYgY2h1bmsubWF0Y2hbLTIuLl0gaW4gWydweCcnZW0nJ2V4J10gYW5kIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoWy4uLi0yXVxuICAgICAgICBzZXRWYWx1ZSAwICdudW1iZXInXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBjaHVuay5tYXRjaFstMS4uXSBpbiBbJ3MnXSBhbmQgTlVNQkVSLnRlc3QgY2h1bmsubWF0Y2hbLi4uLTFdXG4gICAgICAgIHNldFZhbHVlIDAgJ251bWJlcidcbiAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJy4nIGFuZCBnZXRDaHVuaygtMik/LmNsc3MgIT0gJ251bWJlcidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdjbGFzcydcbiAgICAgICAgICAgIHNldFZhbHVlICAwICdjbGFzcydcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgcHJldi5tYXRjaCA9PSBcIiNcIlxuXG4gICAgICAgICAgICBpZiBjaHVuay5tYXRjaC5sZW5ndGggPT0gMyBvciBjaHVuay5tYXRjaC5sZW5ndGggPT0gNlxuICAgICAgICAgICAgICAgIGlmIEhFWC50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbnVtYmVyIGhleCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICctJ1xuICAgICAgICAgICAgaWYgcHJldlByZXYgPSBnZXRDaHVuayAtMlxuICAgICAgICAgICAgICAgIGlmIHByZXZQcmV2LmNsc3MgaW4gWydjbGFzcycnZnVuY3Rpb24nXVxuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSBwcmV2UHJldi5jbHNzXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwIHByZXZQcmV2LmNsc3NcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuIyAwMCAgICAgMDAgIDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAwMDAwXG5cbm1kUHVuY3QgPSAtPlxuXG4gICAgaWYgY2h1bmtJbmRleCA9PSAwXG5cbiAgICAgICAgaWYgbm90IGNodW5rLnR1cmQgYW5kIGNodW5rLm1hdGNoIGluICctKicgYW5kIGdldENodW5rKDEpPy5zdGFydCA+IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgIHR5cGUgPSBbJ2xpMScnbGkyJydsaTMnXVtjaHVuay5zdGFydC80XVxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgdHlwZSArICcgbWFya2VyJ1xuXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcjJ1xuICAgICAgICAgICAgaWYgbm90IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDEnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ2gxJ1xuICAgICAgICAgICAgc3dpdGNoIGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICB3aGVuICcjIydcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2gyJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ2gyJ1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIydcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2gzJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgJ2gzJ1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIyMnXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoNCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyA0ICdoNCdcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMjIydcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2g1J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDUgJ2g1J1xuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJyonXG5cbiAgICAgICAgaWYgY2h1bmsudHVyZD9bLi4xXSA9PSAnKionXG5cbiAgICAgICAgICAgIHR5cGUgPSAnYm9sZCdcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgMiB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcblxuICAgICAgICB0eXBlID0gJ2l0YWxpYydcbiAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCB0b3BUeXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICByZXR1cm4gMVxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ2AnXG5cbiAgICAgICAgaWYgY2h1bmsudHVyZD9bLi4yXSA9PSAnYGBgJ1xuXG4gICAgICAgICAgICB0eXBlID0gJ2NvZGUgdHJpcGxlJ1xuXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCgzKSBpbiBbJ2NvZmZlZXNjcmlwdCcnamF2YXNjcmlwdCcnanMnXVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIDMgJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcblxuICAgICAgICAgICAgcHVzaFN0YWNrIHdlYWs6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG5cbiAgICAgICAgdHlwZSA9ICdjb2RlJ1xuICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHRvcFR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuXG4gICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCB0eXBlXG5cbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMFxuIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuXG5pbnRlcnBvbGF0aW9uID0gLT5cblxuICAgIGlmIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZyBkb3VibGUnXG5cbiAgICAgICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCBcIlxcI3tcIlxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6J2ludGVycG9sYXRpb24nLCB3ZWFrOnRydWVcbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICAgICAgc2V0VmFsdWUgMSAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgZWxzZSBpZiB0b3BUeXBlID09ICdpbnRlcnBvbGF0aW9uJ1xuXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICd9J1xuICAgICAgICAgICAgc2V0VmFsdWUgMCAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gZW5kJ1xuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcblxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbmtleXdvcmQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIG5vdCBsYW5nW2V4dF1cbiAgICAgICAgIyBsb2cgXCJubyBsYW5nIGZvciBleHQ/ICN7ZXh0fVwiXG4gICAgICAgIHJldHVyblxuXG4gICAgaWYgbGFuZ1tleHRdLmhhc093blByb3BlcnR5KGNodW5rLm1hdGNoKVxuICAgICAgICBjaHVuay5jbHNzID0gbGFuZ1tleHRdW2NodW5rLm1hdGNoXVxuICAgICAgICByZXR1cm4gIyBnaXZlIGNvZmZlZUZ1bmMgYSBjaGFuY2UsIG51bWJlciBiYWlscyBmb3IgdXNcblxuIyAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwXG4jICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDBcbiMgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMFxuIyAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbnhtbFB1bmN0ID0gLT5cblxuICAgIGlmIGNodW5rLnR1cmQgPT0gJzwvJ1xuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ2tleXdvcmQnXG5cbiAgICBpZiBjaHVuay5tYXRjaCBpbiBbJzwnJz4nXVxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAna2V5d29yZCdcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwXG4jICAwMDAwMDAwICAwMDAgICAgICAgIDAwMFxuXG5jcHBNYWNybyA9IC0+XG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIlxuICAgICAgICBhZGRWYWx1ZSAwICdkZWZpbmUnXG4gICAgICAgIHNldFZhbHVlIDEgJ2RlZmluZSdcbiAgICAgICAgcmV0dXJuIDJcblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMDAwMDAwMFxuIyAgICAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAgICAwMDBcblxuc2hQdW5jdCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nIGFuZCBnZXRDaHVuaygtMSk/LnN0YXJ0ICsgZ2V0Q2h1bmsoLTEpPy5sZW5ndGggPT0gY2h1bmsuc3RhcnRcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIC0xICdkaXInXG5cbiAgICBpZiBjaHVuay50dXJkID09ICctLScgYW5kIGdldENodW5rKDIpPy5zdGFydCA9PSBjaHVuay5zdGFydCsyIGFuZCBnZXRDaHVuaygtMSk/LnN0YXJ0K2dldENodW5rKC0xKT8ubGVuZ3RoIDwgY2h1bmsuc3RhcnRcbiAgICAgICAgYWRkVmFsdWUgMCAnYXJndW1lbnQnXG4gICAgICAgIGFkZFZhbHVlIDEgJ2FyZ3VtZW50J1xuICAgICAgICBzZXRWYWx1ZSAyICdhcmd1bWVudCdcbiAgICAgICAgcmV0dXJuIDNcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICctJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzEgYW5kIGdldENodW5rKC0xKT8uc3RhcnQrZ2V0Q2h1bmsoLTEpPy5sZW5ndGggPCBjaHVuay5zdGFydFxuICAgICAgICBhZGRWYWx1ZSAwICdhcmd1bWVudCdcbiAgICAgICAgc2V0VmFsdWUgMSAnYXJndW1lbnQnXG4gICAgICAgIHJldHVybiAyXG4gICAgICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICd+JyBhbmQgKG5vdCBnZXRDaHVuaygtMSkgb3IgZ2V0Q2h1bmsoLTEpLnN0YXJ0ICsgZ2V0Q2h1bmsoLTEpLmxlbmd0aCA8IGNodW5rLnN0YXJ0KVxuICAgICAgICBzZXRWYWx1ZSAwICd0ZXh0IGRpcidcbiAgICAgICAgcmV0dXJuIDFcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcblxuc3RhY2tlZCA9IC0+XG5cbiAgICBpZiBzdGFja1RvcFxuICAgICAgICByZXR1cm4gaWYgc3RhY2tUb3Aud2Vha1xuICAgICAgICBpZiBzdGFja1RvcC5zdHJvbmdcbiAgICAgICAgICAgIGNodW5rLmNsc3MgPSB0b3BUeXBlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNodW5rLmNsc3MgKz0gJyAnICsgdG9wVHlwZVxuICAgICAgICByZXR1cm4gMVxuXG5wdXNoRXh0ID0gKG10Y2gpIC0+XG4gICAgZXh0VG9wID0gc3dpdGNoOm10Y2gsIHN0YXJ0OmxpbmUsIHN0YWNrOnN0YWNrXG4gICAgZXh0U3RhY2sucHVzaCBleHRUb3BcblxuYWN0RXh0ID0gLT5cbiAgICBzdGFjayAgICA9IFtdXG4gICAgc3RhY2tUb3AgPSBudWxsXG4gICAgdG9wVHlwZSAgPSAnJ1xuICAgIG5vdENvZGUgID0gZmFsc2VcblxucG9wRXh0ID0gLT5cbiAgICBzdGFjayA9IGV4dFRvcC5zdGFja1xuICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN0YXJ0LmV4dFxuICAgIGV4dFN0YWNrLnBvcCgpXG4gICAgZXh0VG9wID0gZXh0U3RhY2tbLTFdXG5cbiAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgIG5vdENvZGUgPSBzdGFja1RvcCBhbmQgdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG5cbnB1c2hTdGFjayA9IChvKSAtPlxuICAgIHN0YWNrLnB1c2ggb1xuICAgIHN0YWNrVG9wID0gb1xuICAgIHRvcFR5cGUgPSBvLnR5cGVcbiAgICBub3RDb2RlID0gdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG5cbnBvcFN0YWNrID0gLT5cbiAgICBzdGFjay5wb3AoKVxuICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgbm90Q29kZSA9IHN0YWNrVG9wIGFuZCB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcblxuZ2V0Q2h1bmsgPSAoZCkgLT4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXVxuc2V0VmFsdWUgPSAoZCwgdmFsdWUpIC0+IGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS5jbHNzID0gdmFsdWVcbmdldFZhbHVlID0gKGQpIC0+IGdldENodW5rKGQpPy5jbHNzID8gJydcbmdldG1hdGNoID0gKGQpIC0+IGdldENodW5rKGQpPy5tYXRjaCA/ICcnXG5hZGRWYWx1ZSA9IChkLCB2YWx1ZSkgLT5cbiAgICBpZiAwIDw9IGNodW5rSW5kZXgrZCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLmNsc3MgKz0gJyAnICsgdmFsdWVcbiAgICAxXG5cbmFkZFZhbHVlcyA9IChuLHZhbHVlKSAtPlxuICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgYWRkVmFsdWUgaSwgdmFsdWVcbiAgICBuXG5cbmhhbmRsZXJzID1cbiAgICBjb2ZmZWU6XG4gICAgICAgICAgcHVuY3Q6WyBibG9ja0NvbW1lbnQsIGhhc2hDb21tZW50LCB0cmlwbGVSZWdleHAsIGNvZmZlZVB1bmN0LCB0cmlwbGVTdHJpbmcsIHNpbXBsZVN0cmluZywgaW50ZXJwb2xhdGlvbiwgZGFzaEFycm93LCByZWdleHAsIGRpY3QgXVxuICAgICAgICAgIHdvcmQ6IFsga2V5d29yZCwgY29mZmVlV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSBdXG4gICAgbm9vbjogcHVuY3Q6WyBub29uQ29tbWVudCwgIG5vb25QdW5jdCwgdXJsUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsgbm9vbldvcmQsIHVybFdvcmQsIG51bWJlciAgICAgICAgICBdXG4gICAganM6ICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwganNQdW5jdCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCBdLCB3b3JkOlsga2V5d29yZCwganNXb3JkLCBudW1iZXIsIHByb3BlcnR5ICBdXG4gICAgdHM6ICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwganNQdW5jdCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCBdLCB3b3JkOlsga2V5d29yZCwganNXb3JkLCBudW1iZXIsIHByb3BlcnR5ICBdXG4gICAgaXNzOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgaW5pOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsgICAgICAgICAgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgY3BwOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgY3BwV29yZCAgICBdXG4gICAgZnJhZzogcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgY3BwV29yZCAgICBdXG4gICAgdmVydDogcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgY3BwV29yZCAgICBdXG4gICAgaHBwOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgY3BwV29yZCAgICBdXG4gICAgYzogICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgY3BwV29yZCAgICBdXG4gICAgaDogICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgY3BwV29yZCAgICBdXG4gICAgY3M6ICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgcHVnOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgY3NzV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAgc3R5bDogcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgY3NzV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAgY3NzOiAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgY3NzV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAgc2FzczogcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgY3NzV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAgc2NzczogcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgY3NzV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAgc3dpZnQ6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgZGljdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyLCBwcm9wZXJ0eSAgICAgICAgICBdXG4gICAgc3ZnOiAgcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgaHRtbDogcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgaHRtOiAgcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgeG1sOiAgcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsgbnVtYmVyICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgc2g6ICAgcHVuY3Q6WyBoYXNoQ29tbWVudCwgIHNpbXBsZVN0cmluZywgdXJsUHVuY3QsIHNoUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgdXJsV29yZCwgbnVtYmVyICAgICAgICAgICBdXG4gICAganNvbjogcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywganNvblB1bmN0LCB1cmxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwganNvbldvcmQsIHVybFdvcmQsIG51bWJlciBdXG4gICAgeW1sOiAgcHVuY3Q6WyBoYXNoQ29tbWVudCwgIHNpbXBsZVN0cmluZywgdXJsUHVuY3QsIHNoUHVuY3QsIGRpY3QgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwganNvbldvcmQsIHVybFdvcmQsIG51bWJlciwgcHJvcGVydHkgXVxuICAgIHlhbWw6IHB1bmN0OlsgaGFzaENvbW1lbnQsICBzaW1wbGVTdHJpbmcsIHVybFB1bmN0LCBzaFB1bmN0LCBkaWN0ICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGpzb25Xb3JkLCB1cmxXb3JkLCBudW1iZXIsIHByb3BlcnR5IF1cbiAgICBsb2c6ICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB1cmxQdW5jdCwgZGljdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyB1cmxXb3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBtZDogICBwdW5jdDpbICAgICAgICAgICAgICAgICAgICBtZFB1bmN0LCB1cmxQdW5jdCwgeG1sUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyB1cmxXb3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBmaXNoOiBwdW5jdDpbICAgICAgICAgICAgICAgIGhhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBweTogICBwdW5jdDpbICAgICAgICAgICAgICAgIGhhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cblxuZm9yIGV4dCBpbiBleHRzXG4gICAgaWYgbm90IGhhbmRsZXJzW2V4dF0/XG4gICAgICAgIGhhbmRsZXJzW2V4dF0gPSBwdW5jdDpbIHNpbXBsZVN0cmluZyBdLCB3b3JkOlsgbnVtYmVyIF1cblxuZm9yIGV4dCxvYmogb2YgaGFuZGxlcnNcbiAgICBoYW5kbGVyc1tleHRdLnB1bmN0LnB1c2ggc3RhY2tlZFxuICAgIGhhbmRsZXJzW2V4dF0ud29yZC5wdXNoIHN0YWNrZWRcblxuIyMjXG4wMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuIyMjXG5cbuKWuGRvYyAnYmxvY2tlZCBsaW5lcydcblxuICAgIGxpbmVzOiBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG5cbiAgICByZXR1cm5zIGxpbmVzIHdpdGhcbiAgICAtICdleHQnIHN3aXRjaGVkIGluIHNvbWUgbGluZXNcbiAgICAtICd2YWx1ZScgY2hhbmdlZCBpbiBjaHVua3MgdGhhdCBtYXRjaCBsYW5ndWFnZSBwYXR0ZXJuc1xuXG5ibG9ja2VkID0gKGxpbmVzKSAtPlxuXG4gICAgZXh0U3RhY2sgICA9IFtdXG4gICAgc3RhY2sgICAgICA9IFtdXG4gICAgaGFuZGwgICAgICA9IFtdXG4gICAgZXh0VG9wICAgICA9IG51bGxcbiAgICBzdGFja1RvcCAgID0gbnVsbFxuICAgIG5vdENvZGUgICAgPSBmYWxzZSAjIHNob3J0Y3V0IGZvciB0b3Agb2Ygc3RhY2sgbm90IGluIGNvZGVUeXBlc1xuICAgIHRvcFR5cGUgICAgPSAnJ1xuICAgIGV4dCAgICAgICAgPSAnJ1xuICAgIGxpbmUgICAgICAgPSBudWxsXG4gICAgY2h1bmsgICAgICA9IG51bGxcbiAgICBjaHVua0luZGV4ID0gMFxuXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgICAgMDAwXG4gICAgIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcblxuICAgIGZvciBsaW5lIGluIGxpbmVzXG5cbiAgICAgICAgaWYgc3RhY2tUb3BcblxuICAgICAgICAgICAgaWYgc3RhY2tUb3AudHlwZSA9PSAnY29tbWVudCB0cmlwbGUnXG5cbiAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAgICAgICAgICBpZiBub3QgSEVBREVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBpZiBtaWdodEJlSGVhZGVyXG4gICAgICAgICAgICAgICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsuY2xzcyA9ICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLmZpbGwgdGhlbiBwb3BTdGFjaygpXG5cbiAgICAgICAgaWYgZXh0VG9wXG4gICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmluZGVudCBhbmQgbGluZS5jaHVua3NbMF0/LnN0YXJ0IDw9IGV4dFRvcC5zdGFydC5jaHVua3NbMF0uc3RhcnRcbiAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSBpbmRlbnRhdGlvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN3aXRjaC50byAgICAgIyBtYWtlIHN1cmUgdGhlIGN1cnJlbnQgbGluZSBleHQgbWF0Y2hlcyB0aGUgdG9wbW9zdCBmcm9tIHN0YWNrXG5cbiAgICAgICAgaWYgZXh0ICE9IGxpbmUuZXh0ICAgICAgICAgICAgICAgICAgICAgICMgZWl0aGVyIGF0IHN0YXJ0IG9mIGZpbGUgb3Igd2Ugc3dpdGNoZWQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBhY3RFeHQoKVxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICAgICAgaWYgbm90IGhhbmRsXG4gICAgICAgICAgICAgICAg4pa4ZGJnIGxpbmVcbiAgICAgICAgICAgICAgICDilrhkYmcgaGFuZGxlcnNcbiAgICAgICAgICAgIOKWuGFzc2VydCBoYW5kbFxuXG4gICAgICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwXG4gICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG5cbiAgICAgICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgd2hpbGUgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuXG4gICAgICAgICAgICBjaHVuayA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXhdXG5cbiAgICAgICAgICAgIGJlZm9yZUluZGV4ID0gY2h1bmtJbmRleFxuXG4gICAgICAgICAgICBpZiBjaHVuay5jbHNzLnN0YXJ0c1dpdGggJ3B1bmN0J1xuXG4gICAgICAgICAgICAgICAgaWYgZXh0VG9wXG4gICAgICAgICAgICAgICAgICAgIGlmIGV4dFRvcC5zd2l0Y2guZW5kPyBhbmQgZXh0VG9wLnN3aXRjaC5lbmQgPT0gY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWVzIGNodW5rLnR1cmQubGVuZ3RoLCBleHRUb3Auc3dpdGNoLmFkZCBpZiBleHRUb3Auc3dpdGNoLmFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9wRXh0KCkgIyBlbmQgb2YgZXh0ZW5zaW9uIGJsb2NrIHJlYWNoZWQgdGhhdCBpcyB0ZXJtaW5hdGVkIGJ5IHR1cmRcblxuICAgICAgICAgICAgICAgIGZvciBobmQgaW4gaGFuZGwucHVuY3QgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgZWxzZSAjIHdvcmRzLCBudW1iZXJzXG5cbiAgICAgICAgICAgICAgICBpZiBub3Qgbm90Q29kZVxuICAgICAgICAgICAgICAgICAgICBpZiBtdGNoID0gc3d0Y2hbbGluZS5leHRdP1tjaHVuay5tYXRjaF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG10Y2gudHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR1cmRDaHVuayA9IGdldENodW5rIC1tdGNoLnR1cmQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkID09ICh0dXJkQ2h1bms/LnR1cmQgPyB0dXJkQ2h1bms/Lm1hdGNoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHB1c2ggYSBuZXcgZXh0ZW5zaW9uIG9udG8gdGhlIHN0YWNrLCBleHQgd2lsbCBjaGFuZ2Ugb24gc3RhcnQgb2YgbmV4dCBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hFeHQgbXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBtdGNoLm5leHQgYW5kIGdldENodW5rKDEpLm1hdGNoID09IG10Y2gubmV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hFeHQgbXRjaFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBobmQgaW4gaGFuZGwud29yZCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4ID09IGJlZm9yZUluZGV4XG4gICAgICAgICAgICAgICAgY2h1bmtJbmRleCsrXG4gICAgbGluZXNcblxucnBhZCA9IChzLCBsKSAtPlxuICAgIHMgPSBTdHJpbmcgc1xuICAgIHdoaWxlIHMubGVuZ3RoIDwgbCB0aGVuIHMgKz0gJyAnXG4gICAgc1xuXG5wYWQgPSAobCkgLT4gcnBhZCAnJywgbFxuICAgIFxucmVwbGFjZVRhYnMgPSAocykgLT5cbiAgICBpID0gMFxuICAgIHdoaWxlIGkgPCBzLmxlbmd0aFxuICAgICAgICBpZiBzW2ldID09ICdcXHQnXG4gICAgICAgICAgICBzID0gc1suLi5pXSArIHBhZCg0LShpJTQpKSArIHNbaSsxLi5dXG4gICAgICAgIGkgKz0gMVxuICAgIHNcblxucGFyc2UgPSAobGluZXMsIGV4dD0nY29mZmVlJykgLT4gYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5rb2xvcml6ZSA9IChjaHVuaykgLT4gXG4gICAgXG4gICAgaWYgY24gPSBrb2xvci5tYXBbY2h1bmsuY2xzc11cbiAgICAgICAgaWYgY24gaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICAgICAgdiA9IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBmb3IgY3IgaW4gY25cbiAgICAgICAgICAgICAgICB2ID0ga29sb3JbY3JdIHZcbiAgICAgICAgICAgIHJldHVybiB2XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiBrb2xvcltjbl0gY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIFxuICAgIGlmIGNodW5rLmNsc3MuZW5kc1dpdGggJ2ZpbGUnXG4gICAgICAgIHc4IGNodW5rLm1hdGNoXG4gICAgZWxzZSBpZiBjaHVuay5jbHNzLmVuZHNXaXRoICdleHQnXG4gICAgICAgIHczIGNodW5rLm1hdGNoXG4gICAgZWxzZSBpZiBjaHVuay5jbHNzLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICBpZiBMSS50ZXN0IGNodW5rLmNsc3NcbiAgICAgICAgICAgIGtvbG9yaXplIG1hdGNoOmNodW5rLm1hdGNoLCBjbHNzOmNodW5rLmNsc3MucmVwbGFjZSBMSSwgJyAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHcyIGNodW5rLm1hdGNoXG4gICAgZWxzZVxuICAgICAgICBpZiBMSS50ZXN0IGNodW5rLmNsc3NcbiAgICAgICAgICAgIGtvbG9yaXplIG1hdGNoOmNodW5rLm1hdGNoLCBjbHNzOmNodW5rLmNsc3MucmVwbGFjZSBMSSwgJyAnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNodW5rLm1hdGNoXG5cbmtvbG9yaXplQ2h1bmtzID0gKGNodW5rczpbXSwgbnVtYmVyOikgLT5cbiAgICBcbiAgICBjbHJ6ZCA9ICcnXG4gICAgaWYgbnVtYmVyXG4gICAgICAgIG51bXN0ciA9IFN0cmluZyBudW1iZXJcbiAgICAgICAgY2xyemQgKz0gdzIobnVtc3RyKSArIHJwYWQgJycsIDQtbnVtc3RyLmxlbmd0aFxuICAgICAgICBcbiAgICBjID0gMFxuICAgIGZvciBpIGluIFswLi4uY2h1bmtzLmxlbmd0aF1cbiAgICAgICAgd2hpbGUgYyA8IGNodW5rc1tpXS5zdGFydCBcbiAgICAgICAgICAgIGNscnpkICs9ICcgJ1xuICAgICAgICAgICAgYysrXG4gICAgICAgIGNscnpkICs9IGtvbG9yaXplIGNodW5rc1tpXVxuICAgICAgICBjICs9IGNodW5rc1tpXS5sZW5ndGhcbiAgICBjbHJ6ZFxuICAgICAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgICAgMDAwMDAgICAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG5cbnN5bnRheCA9ICh0ZXh0OnRleHQsIGV4dDonY29mZmVlJywgbnVtYmVyczpmYWxzZSkgLT5cbiAgICBcbiAgICBsaW5lcyA9IHRleHQuc3BsaXQgTkVXTElORVxuICAgIHJuZ3MgID0gcGFyc2UobGluZXMsIGV4dCkubWFwIChsKSAtPiBsLmNodW5rc1xuICAgIFxuICAgIGNsaW5lcyA9IFtdXG4gICAgZm9yIGluZGV4IGluIFswLi4ubGluZXMubGVuZ3RoXVxuICAgICAgICBsaW5lID0gbGluZXNbaW5kZXhdXG4gICAgICAgIGlmIGV4dCA9PSAnanMnIGFuZCBsaW5lLnN0YXJ0c1dpdGggJy8vIyBzb3VyY2VNYXBwaW5nVVJMJ1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgY2xpbmVzLnB1c2gga29sb3JpemVDaHVua3MgY2h1bmtzOnJuZ3NbaW5kZXhdLCBudW1iZXI6bnVtYmVycyBhbmQgaW5kZXgrMVxuICAgIGNsaW5lcy5qb2luICdcXG4nXG5cbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgICBrb2xvcjogICAgICBrb2xvclxuICAgIGV4dHM6ICAgICAgIGV4dHNcbiAgICBwYXJzZTogICAgICBwYXJzZVxuICAgIGNodW5rZWQ6ICAgIGNodW5rZWRcbiAgICByYW5nZXM6ICAgICAobGluZSwgZXh0PSdjb2ZmZWUnKSAgLT4gcGFyc2UoW2xpbmVdLCBleHQpWzBdLmNodW5rc1xuICAgIGRpc3NlY3Q6ICAgIChsaW5lcywgZXh0PSdjb2ZmZWUnKSAtPiBwYXJzZShsaW5lcywgZXh0KS5tYXAgKGwpIC0+IGwuY2h1bmtzXG4gICAga29sb3JpemU6ICAga29sb3JpemVcbiAgICBrb2xvcml6ZUNodW5rczoga29sb3JpemVDaHVua3NcbiAgICBzeW50YXg6ICAgICBzeW50YXhcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxu4pa4dGVzdCAncHJvZmlsZSdcblxuICAgIHsgc2xhc2ggfSA9IHJlcXVpcmUgJ2t4aydcbiAgICB0ZXh0MCA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9Ly4uLy4uL2tvZmZlZS9jb2ZmZWUvbm9kZXMuY29mZmVlXCJcbiAgICB0ZXh0MSA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9L3Rlc3QuY29mZmVlXCJcblxuICAgIGxpbmVzMCA9IHRleHQwLnNwbGl0ICdcXG4nXG4gICAgbGluZXMxID0gdGV4dDEuc3BsaXQgJ1xcbidcblxuICAgIGZvciBpIGluIFswLi41XVxuICAgICAgICBwYXJzZSBsaW5lczBcblxuICAgIOKWuGF2ZXJhZ2UgMTAwXG4gICAgICAgIHBhcnNlIGxpbmVzMFxuIl19
//# sourceURL=../coffee/klor.coffee