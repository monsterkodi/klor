// koffee 1.12.0

/*
000   000  000       0000000   00000000
000  000   000      000   000  000   000
0000000    000      000   000  0000000
000  000   000      000   000  000   000
000   000  0000000   0000000   000   000
 */
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
    var next, ref1, ref2, ref3, type;
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
            if ((ref3 = next != null ? next.match : void 0) === 's' || ref3 === 'll' || ref3 === 'd') {
                return stacked();
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
                klog('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1182[39m', line);
                klog('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1183[39m', handlers);
            }
            if (!(handl)) {
                klog('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1184[39m', '[1m[97massertion failure![39m[22m');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2xvci5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtsb3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGswQkFBQTtJQUFBOzs7O0FBa0NBLE1BQWlCLE9BQUEsQ0FBVyxTQUFELEdBQVcsa0JBQXJCLENBQWpCLEVBQUUsZUFBRixFQUFROztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFFUixLQUFBLEdBQ0k7SUFBQSxNQUFBLEVBQ0k7UUFBQSxHQUFBLEVBQUs7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFTLEVBQUEsRUFBRyxJQUFaO1lBQWlCLE1BQUEsRUFBTyxDQUF4QjtTQUFMO0tBREo7SUFFQSxHQUFBLEVBQ0k7UUFBQSxNQUFBLEVBQVE7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFTLEVBQUEsRUFBRyxJQUFaO1lBQWlCLE1BQUEsRUFBTyxDQUF4QjtTQUFSO0tBSEo7SUFJQSxFQUFBLEVBQ0k7UUFBQSxZQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxRQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtZQUFpQyxHQUFBLEVBQUksYUFBckM7U0FBZDtRQUNBLFVBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLElBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1lBQWlDLEdBQUEsRUFBSSxhQUFyQztTQURkO0tBTEo7OztBQVFKLEtBQUEsc0NBQUE7O0lBQ0ksS0FBSyxDQUFDLEVBQUcsQ0FBQSxHQUFBLENBQVQsR0FBZ0I7UUFBQSxJQUFBLEVBQUssS0FBTDtRQUFXLEVBQUEsRUFBRyxHQUFkO1FBQW1CLEdBQUEsRUFBSSxLQUF2QjtRQUE2QixHQUFBLEVBQUksYUFBakM7O0FBRHBCOztBQUdBLEtBQUEsR0FBVTs7QUFDVixNQUFBLEdBQVU7O0FBQ1YsS0FBQSxHQUFVOztBQUNWLE1BQUEsR0FBVTs7QUFD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dXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyMjXG5cbuKWuGlmIG9wdHMubGFuZyAjIGtvZmZlZSAtLWxhbmcga2xvci5jb2ZmZWVcblxuICAgIGZzICAgPSByZXF1aXJlICdmcydcbiAgICBub29uX2xvYWQgPSByZXF1aXJlICdub29uL2pzL2xvYWQnXG4gICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5cbiAgICBub29uRmlsZSA9IHBhdGguam9pbiBfX2Rpcm5hbWUsICdsYW5nLm5vb24nXG4gICAganNvbkZpbGUgPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAnLi4nICdqcycgJ2xhbmcuanNvbidcblxuICAgIGxvZyAnY29tcGlsZTonIG5vb25GaWxlXG4gICAgbG9nICdvdXRwdXQ6JyAganNvbkZpbGVcblxuICAgIGxhbmcgPSB7fVxuICAgIGV4dHMgPSBbJ3R4dCcnbG9nJ11cbiAgICBmb3IgbmFtZXMsIGtleXdvcmRzIG9mIG5vb25fbG9hZCBub29uRmlsZVxuXG4gICAgICAgIGZvciBleHQgaW4gbmFtZXMuc3BsaXQgL1xccy9cbiAgICAgICAgICAgIGV4dHMucHVzaChleHQpIGlmIGV4dCBub3QgaW4gZXh0c1xuICAgICAgICAgICAgbGFuZ1tleHRdID89IHt9XG4gICAgICAgICAgICBmb3IgdmFsdWUsd29yZHMgb2Yga2V5d29yZHNcbiAgICAgICAgICAgICAgICBmb3Igd29yZCBpbiB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICBsYW5nW2V4dF1bd29yZF0gPSB2YWx1ZVxuXG4gICAganNvbiA9IEpTT04uc3RyaW5naWZ5IHtleHRzOmV4dHMsIGxhbmc6bGFuZ30sIG51bGwsICcgICAgJ1xuICAgIGZzLndyaXRlRmlsZVN5bmMganNvbkZpbGUsIGpzb24sICd1dGY4J1xuXG57IGV4dHMsIGxhbmcgfSA9IHJlcXVpcmUgXCIje19fZGlybmFtZX0vLi4vanMvbGFuZy5qc29uXCJcbmtvbG9yID0gcmVxdWlyZSAnLi9rb2xvcidcblxuc3d0Y2ggPVxuICAgIGNvZmZlZTpcbiAgICAgICAgZG9jOiB0dXJkOifilrgnIHRvOidtZCcgaW5kZW50OjFcbiAgICBwdWc6XG4gICAgICAgIHNjcmlwdDogbmV4dDonLicgdG86J2pzJyBpbmRlbnQ6MVxuICAgIG1kOlxuICAgICAgICBjb2ZmZWVzY3JpcHQ6IHR1cmQ6J2BgYCcgdG86J2NvZmZlZScgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgIGphdmFzY3JpcHQ6ICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcblxuZm9yIGV4dCBpbiBleHRzXG4gICAgc3d0Y2gubWRbZXh0XSA9IHR1cmQ6J2BgYCcgdG86ZXh0LCBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcblxuU1BBQ0UgICA9IC9cXHMvXG5IRUFERVIgID0gL14wKyQvXG5QVU5DVCAgID0gL1xcVysvZ1xuTlVNQkVSICA9IC9eXFxkKyQvXG5GTE9BVCAgID0gL15cXGQrZiQvXG5IRVhOVU0gID0gL14weFthLWZBLUZcXGRdKyQvXG5IRVggICAgID0gL15bYS1mQS1GXFxkXSskL1xuTkVXTElORSA9IC9cXHI/XFxuL1xuTEkgICAgICA9IC8oXFxzbGlcXGRcXHN8XFxzaFxcZFxccykvXG5cbmNvZGVUeXBlcyA9IFsnaW50ZXJwb2xhdGlvbicgJ2NvZGUgdHJpcGxlJ11cblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuXG7ilrhkb2MgJ2NodW5rZWQgbGluZXMsIGV4dCdcblxuICAgIHJldHVybnMgYXJyYXkgb2ZcblxuICAgICAgICBjaHVua3M6IFtcbiAgICAgICAgICAgICAgICAgICAgdHVyZDogICBzXG4gICAgICAgICAgICAgICAgICAgIGNsc3M6ICAgc1xuICAgICAgICAgICAgICAgICAgICBtYXRjaDogIHNcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6ICBuXG4gICAgICAgICAgICAgICAgICAgIGxlbmd0aDogblxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgZXh0OiAgICBzXG4gICAgICAgIGNoYXJzOiAgblxuICAgICAgICBpbmRleDogIG5cbiAgICAgICAgbnVtYmVyOiBuKzFcblxuY2h1bmtlZCA9IChsaW5lcywgZXh0KSAtPlxuXG4gICAgZXh0ID0gZXh0WzEuLl0gaWYgZXh0WzBdID09ICcuJ1xuICAgIGV4dCA9ICd0eHQnIGlmIGV4dCBub3QgaW4gZXh0c1xuXG4gICAgbGluZW5vID0gMFxuICAgIGxpbmVzLm1hcCAodGV4dCkgLT5cblxuICAgICAgICBsaW5lID1cbiAgICAgICAgICAgIGNodW5rczogW11cbiAgICAgICAgICAgIGNoYXJzOiAgMFxuICAgICAgICAgICAgaW5kZXg6ICBsaW5lbm8rK1xuICAgICAgICAgICAgbnVtYmVyOiBsaW5lbm9cbiAgICAgICAgICAgIGV4dDogICAgZXh0XG5cbiAgICAgICAgcmV0dXJuIGxpbmUgaWYgbm90IHRleHQgaW5zdGFuY2VvZiBTdHJpbmdcbiAgICAgICAgXG4gICAgICAgIGNodW5rcyA9IHJlcGxhY2VUYWJzKHRleHQpLnNwbGl0IFNQQUNFXG5cbiAgICAgICAgaWYgY2h1bmtzLmxlbmd0aCA9PSAxIGFuZCBjaHVua3NbMF0gPT0gJydcbiAgICAgICAgICAgIHJldHVybiBsaW5lICMgZW1wdHkgbGluZVxuXG4gICAgICAgIGMgPSAwXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuXG4gICAgICAgICAgICAgICAgIyBzZXBlcmF0ZSBieSBwdW5jdHVhdGlvblxuXG4gICAgICAgICAgICAgICAgd2hpbGUgbSA9IFBVTkNULmV4ZWMgc1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIG0uaW5kZXggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB3bCA9IG0uaW5kZXgtKGMtc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICB3ID0gc1tjLXNjLi4ubS5pbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOndsLCBtYXRjaDp3LCBjbHNzOid0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSB3bFxuXG4gICAgICAgICAgICAgICAgICAgIHR1cmQgPSBwdW5jdCA9IG1bMF1cblxuICAgICAgICAgICAgICAgICAgICBwaSA9IDBcbiAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDFcbiAgICAgICAgICAgICAgICAgICAgY2xzcyA9ICdwdW5jdCdcblxuICAgICAgICAgICAgICAgICAgICB3aGlsZSBwaSA8IHB1bmN0Lmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBwYyA9IHB1bmN0W3BpXVxuICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIDB4RDgwMCA8PSBwdW5jdC5jaGFyQ29kZUF0KHBpKSA8PSAweERCRkYgYW5kIDB4REMwMCA8PSBwdW5jdC5jaGFyQ29kZUF0KHBpKzEpIDw9IDB4REZGRlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgPSAyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xzcyA9ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBjICs9IHB1bmN0W3BpKzFdXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xzcyA9ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBwYyBpbiBbJywnJzsnJ3snJ30nJygnJyknXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHNzICs9ICcgbWlub3InXG4gICAgICAgICAgICAgICAgICAgICAgICBwaSArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDphZHZhbmNlLCBtYXRjaDpwYywgdHVyZDp0dXJkLCBjbHNzOmNsc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHR1cmRbYWR2YW5jZS4uXVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIHBpIDwgcHVuY3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHNzID0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgcHVuY3RbcGkuLl0gaW4gWycsJyc7Jyd7Jyd9JycoJycpJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHNzICs9ICcgbWlub3InXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDphZHZhbmNlLCBtYXRjaDpwdW5jdFtwaS4uXSwgY2xzczpjbHNzXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IGFkdmFuY2VcblxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXJcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6cmwsIG1hdGNoOncsIGNsc3M6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgIGMgKz0gcmxcblxuICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGxhc3QgPSBsaW5lLmNodW5rc1stMV1cbiAgICAgICAgICAgIGxpbmUuY2hhcnMgPSBsYXN0LnN0YXJ0ICsgbGFzdC5sZW5ndGhcblxuICAgICAgICBsaW5lXG5cbiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4jIyNcblxuZXh0U3RhY2sgICA9IFtdXG5zdGFjayAgICAgID0gW11cbmhhbmRsICAgICAgPSBbXVxuZXh0VG9wICAgICA9IG51bGxcbnN0YWNrVG9wICAgPSBudWxsXG5ub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbnRvcFR5cGUgICAgPSAnJ1xuZXh0ICAgICAgICA9ICcnXG5saW5lICAgICAgID0gbnVsbFxuY2h1bmsgICAgICA9IG51bGxcbmNodW5rSW5kZXggPSAwXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmZpbGxDb21tZW50ID0gKG4pIC0+XG5cbiAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgIGFkZFZhbHVlIGksICdjb21tZW50J1xuICAgIGlmIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGgtblxuICAgICAgICByZXN0Q2h1bmtzID0gbGluZS5jaHVua3NbY2h1bmtJbmRleCtuLi5dXG4gICAgICAgIG1pZ2h0QmVIZWFkZXIgPSB0cnVlXG4gICAgICAgIGZvciBjIGluIHJlc3RDaHVua3NcbiAgICAgICAgICAgIGMuY2xzcyA9ICdjb21tZW50J1xuICAgICAgICAgICAgaWYgbWlnaHRCZUhlYWRlciBhbmQgbm90IEhFQURFUi50ZXN0IGMubWF0Y2hcbiAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gZmFsc2VcbiAgICAgICAgaWYgbWlnaHRCZUhlYWRlclxuICAgICAgICAgICAgZm9yIGMgaW4gcmVzdENodW5rc1xuICAgICAgICAgICAgICAgIGMuY2xzcyArPSAnIGhlYWRlcidcbiAgICBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgblxuXG5oYXNoQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgc3RhY2tUb3AgYW5kIHRvcFR5cGUgIT0gJ3JlZ2V4cCB0cmlwbGUnXG4gICAgaWYgc3RhY2tUb3AgYW5kIHN0YWNrVG9wLmxpbmVubyA9PSBsaW5lLm51bWJlclxuICAgICAgICByZXR1cm4gIyBjb21tZW50cyBpbnNpZGUgdHJpcGxlIHJlZ2V4cCBvbmx5IHZhbGlkIG9uIGludGVybmFsIGxpbmVzP1xuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgZmlsbENvbW1lbnQgMVxuXG5ub29uQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgc3RhY2tUb3BcblxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiIGFuZCBjaHVua0luZGV4ID09IDBcbiAgICAgICAgZmlsbENvbW1lbnQgMVxuXG5zbGFzaENvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wXG5cbiAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoIFwiLy9cIlxuICAgICAgICBmaWxsQ29tbWVudCAyXG5cbmJsb2NrQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG5cbiAgICB0eXBlID0gJ2NvbW1lbnQgdHJpcGxlJ1xuXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgbm90IGluIFsnaW50ZXJwb2xhdGlvbicsIHR5cGVdXG5cbiAgICBpZiBjaHVuay50dXJkWy4uMl0gPT0gJyMjIydcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG5cbnN0YXJDb21tZW50ID0gLT5cblxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZFxuXG4gICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZSdcblxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlICE9IHR5cGVcblxuICAgIGlmIGNodW5rLnR1cmRbLi4xXSA9PSAnLyonIGFuZCBub3QgdG9wVHlwZVxuICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuICAgIGlmIGNodW5rLnR1cmRbLi4xXSA9PSAnKi8nIGFuZCB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwXG5cbmRhc2hBcnJvdyA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgbWFya0Z1bmMgPSAtPlxuICAgICAgICBpZiBsaW5lLmNodW5rc1swXS5jbHNzID09ICd0ZXh0J1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMV0ubWF0Y2ggPT0gJz0nIGFuZCBsaW5lLmNodW5rc1syXS5tYXRjaCAhPSAnPidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS5jbHNzID0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLmNsc3MgKz0gJyBmdW5jdGlvbidcbiAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbMV0ubWF0Y2ggPT0gJzonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0uY2xzcyA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0uY2xzcyArPSAnIG1ldGhvZCdcblxuICAgIGlmIGNodW5rLnR1cmRcblxuICAgICAgICBpZiBjaHVuay50dXJkLnN0YXJ0c1dpdGggJy0+J1xuICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEgJ2Z1bmN0aW9uIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS5jbHNzID09ICdkaWN0aW9uYXJ5IGtleScgb3IgbGluZS5jaHVua3NbMF0udHVyZD9bLi4xXSA9PSAnQDonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0uY2xzcyA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0uY2xzcyA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzBdLm1hdGNoID09ICdAJyBhbmQgbGluZS5jaHVua3NbMV0uY2xzcyA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0uY2xzcyA9ICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0uY2xzcyA9ICdtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMl0uY2xzcyA9ICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgICAgIGlmIGNodW5rLnR1cmQuc3RhcnRzV2l0aCAnPT4nXG4gICAgICAgICAgICBtYXJrRnVuYygpXG4gICAgICAgICAgICBhZGRWYWx1ZSAwICdmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSAnZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLmNsc3MgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLmNsc3MgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLmNsc3MgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDJcblxuY3BwUG9pbnRlciA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBjaHVuay50dXJkXG4gICAgICAgIGlmIGNodW5rLnR1cmQuc3RhcnRzV2l0aCAnLT4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAwICdhcnJvdyB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSAnYXJyb3cgaGVhZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcbmNvbW1lbnRIZWFkZXIgPSAtPlxuXG4gICAgaWYgdG9wVHlwZSA9PSAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGlmIEhFQURFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBjaHVuay5jbHNzID0gJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwXG5cbnRoaXNDYWxsID0gLT5cblxuICAgIHNldFZhbHVlIC0xICdmdW5jdGlvbiBjYWxsJ1xuICAgIGlmIGdldG1hdGNoKC0yKSA9PSAnQCdcbiAgICAgICAgc2V0VmFsdWUgLTIgJ3B1bmN0IGZ1bmN0aW9uIGNhbGwnXG4gICAgMFxuXG5jb2ZmZWVQdW5jdCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ+KWuCdcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ21ldGEnXG5cbiAgICBpZiBjaHVuay50dXJkID09ICd+PidcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdtZXRhJ1xuXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG5cbiAgICAgICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCgnLi4nKSBhbmQgcHJldi5tYXRjaCAhPSAnLidcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmRbMl0gIT0gJy4nXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdyYW5nZSdcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmRbM10gIT0gJy4nXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzICdyYW5nZSdcblxuICAgICAgICBpZiBwcmV2LmNsc3Muc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYuY2xzcyA9PSAncHJvcGVydHknXG5cbiAgICAgICAgICAgIHByZXZFbmQgPSBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoXG4gICAgICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKCcgYW5kIHByZXZFbmQgPT0gY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgZWxzZSBpZiBwcmV2RW5kIDwgY2h1bmsuc3RhcnQgIyBzcGFjZWRcbiAgICAgICAgICAgICAgICBpZiBjaHVuay5tYXRjaCBpbiAnQFsoe1wiXFwnJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY2h1bmsubWF0Y2ggaW4gJystLydcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IG5leHQgb3IgbmV4dC5tYXRjaCAhPSAnPScgYW5kIG5leHQuc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcblxuY29mZmVlV29yZCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG5cbiAgICAgICAgaWYgcHJldi5jbHNzID09ICdwdW5jdCBtZXRhJ1xuICAgICAgICAgICAgaWYgY2h1bmsuc3RhcnQgPT0gcHJldi5zdGFydCsxXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMCAnbWV0YSdcbiAgICAgICAgICAgICAgICByZXR1cm4gMCAjIGdpdmUgc3dpdGNoIGEgY2hhbmNlXG5cbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiBbJ2NsYXNzJywgJ2V4dGVuZHMnXVxuICAgICAgICAgICAgc2V0VmFsdWUgMCAnY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGlmIGNodW5rLmNsc3Muc3RhcnRzV2l0aCAna2V5d29yZCdcblxuICAgICAgICAgICAgcmV0dXJuIDEgIyB3ZSBhcmUgZG9uZSB3aXRoIHRoZSBrZXl3b3JkXG5cbiAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnQCdcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICd0aGlzJ1xuICAgICAgICAgICAgYWRkVmFsdWUgIDAgJ3RoaXMnXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGlmIChwcmV2LmNsc3Muc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYuY2xzcyA9PSAncHJvcGVydHknKSBhbmQgcHJldi5zdGFydCtwcmV2Lmxlbmd0aCA8IGNodW5rLnN0YXJ0ICMgc3BhY2VkXG4gICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuXG5wcm9wZXJ0eSA9IC0+ICMgd29yZFxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICBwcmV2UHJldiA9IGdldENodW5rIC0yXG5cbiAgICAgICAgaWYgcHJldlByZXY/Lm1hdGNoICE9ICcuJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgc2V0VmFsdWUgMCAncHJvcGVydHknXG4gICAgICAgICAgICBpZiBwcmV2UHJldlxuICAgICAgICAgICAgICAgIGlmIHByZXZQcmV2LmNsc3Mgbm90IGluIFsncHJvcGVydHknICdudW1iZXInXSBhbmQgbm90IHByZXZQcmV2LmNsc3Muc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdvYmonXG4gICAgICAgICAgICByZXR1cm4gMVxuXG5jcHBXb3JkID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBwID0gcHJvcGVydHkoKSB0aGVuIHJldHVybiBwXG5cbiAgICBpZiBnZXRDaHVuaygtMik/LnR1cmQgPT0gJzo6J1xuXG4gICAgICAgIGlmIHByZXZQcmV2ID0gZ2V0Q2h1bmsgLTNcbiAgICAgICAgICAgIHNldFZhbHVlIC0zICdwdW5jdCBvYmonXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMiAnb2JqJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ29iaidcbiAgICAgICAgICAgIHNldFZhbHVlICAwICdtZXRob2QnXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgaWYgZ2V0bWF0Y2goLTEpID09ICc8JyBhbmQgZ2V0bWF0Y2goMSkgaW4gJyw+JyBvciBnZXRtYXRjaCgxKSA9PSAnPicgYW5kIGdldG1hdGNoKC0xKSBpbiAnLCdcblxuICAgICAgICBzZXRWYWx1ZSAtMSAncHVuY3QgdGVtcGxhdGUnXG4gICAgICAgIHNldFZhbHVlICAwICd0ZW1wbGF0ZSdcbiAgICAgICAgc2V0VmFsdWUgIDEgJ3B1bmN0IHRlbXBsYXRlJ1xuICAgICAgICByZXR1cm4gMlxuXG4gICAgaWYgL1tBLVpdLy50ZXN0IGNodW5rLm1hdGNoWzFdXG4gICAgICAgIHN3aXRjaCBjaHVuay5tYXRjaFswXVxuICAgICAgICAgICAgd2hlbiAnVCdcbiAgICAgICAgICAgICAgICBpZiBnZXRtYXRjaCgxKSA9PSAnPCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgMCAna2V5d29yZCB0eXBlJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICB3aGVuICdGJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ3N0cnVjdCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICB3aGVuICdBJyAnVSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdvYmonXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIGNodW5rLmNsc3MgPT0gJ3RleHQnIGFuZCBnZXRtYXRjaCgxKSA9PSAnKCdcbiAgICAgICAgc2V0VmFsdWUgMCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgcmV0dXJuIDFcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbm5vb25Qcm9wID0gLT5cblxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoKzEgPCBjaHVuay5zdGFydFxuICAgICAgICAgICAgaWYgcHJldi5jbHNzICE9ICdvYmonXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXgtMS4uMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgaSA8IGNodW5rSW5kZXgtMSBhbmQgbGluZS5jaHVua3NbaV0uc3RhcnQrbGluZS5jaHVua3NbaV0ubGVuZ3RoKzEgPCBsaW5lLmNodW5rc1tpKzFdLnN0YXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tpXS5jbHNzID09ICd0ZXh0JyBvciBsaW5lLmNodW5rc1tpXS5jbHNzID09ICdvYmonXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS5jbHNzID0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzW2ldLmNsc3MgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0uY2xzcyA9ICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAwXG5cbm5vb25QdW5jdCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZSAjIG1ha2VzIHRoaXMgc2Vuc2UgaGVyZSA/Pz9cblxuICAgIG5vb25Qcm9wKClcblxubm9vbldvcmQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGUgIyBtYWtlcyB0aGlzIHNlbnNlIGhlcmUgPz8/XG5cbiAgICBpZiBjaHVuay5zdGFydCA9PSAwXG4gICAgICAgIHNldFZhbHVlIDAgJ29iaidcbiAgICAgICAgcmV0dXJuIDFcblxuICAgIG5vb25Qcm9wKClcblxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwXG5cbnVybFB1bmN0ID0gLT5cblxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBjaHVuay50dXJkID09ICc6Ly8nXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCg0KSA9PSAnLicgYW5kIGdldENodW5rKDUpXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgMyAndXJsJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAzICd1cmwgZG9tYWluJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICA0ICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICA1ICd1cmwgdGxkJ1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIDZcblxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLidcbiAgICAgICAgICAgIGlmIG5vdCBwcmV2LmNsc3Muc3RhcnRzV2l0aCgnbnVtYmVyJykgYW5kIHByZXYuY2xzcyAhPSAnc2VtdmVyJyBhbmQgcHJldi5tYXRjaCBub3QgaW4gJ1xcXFwuLydcbiAgICAgICAgICAgICAgICBpZiBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgICAgICAgICBpZiBuZXh0LnN0YXJ0ID09IGNodW5rLnN0YXJ0K2NodW5rLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZWV4dCA9IG5leHQubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpbGVleHQgbm90IGluICdcXFxcLi8qKydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSBmaWxlZXh0ICsgJyBmaWxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlICAwIGZpbGVleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMSBmaWxlZXh0ICsgJyBleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLydcblxuICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXguLjBdXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0uc3RhcnQrbGluZS5jaHVua3NbaV0ubGVuZ3RoIDwgbGluZS5jaHVua3NbaSsxXT8uc3RhcnRcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS5jbHNzLmVuZHNXaXRoICdkaXInXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0uY2xzcy5zdGFydHNXaXRoICd1cmwnXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0ubWF0Y2ggPT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLmNsc3Muc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLmNsc3MgPSAncHVuY3QgZGlyJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0uY2xzcyA9ICd0ZXh0IGRpcidcblxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAwXG5cbnVybFdvcmQgPSAtPlxuXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIHByZXYubWF0Y2ggaW4gJ1xcXFwvJ1xuICAgICAgICAgICAgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgIGlmIG5vdCBuZXh0IG9yIG5leHQuc3RhcnQgPiBjaHVuay5zdGFydCtjaHVuay5sZW5ndGggb3IgbmV4dC5tYXRjaCBub3QgaW4gJ1xcXFwuLydcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCAnZmlsZSdcblxuIyAgICAgICAwMDAgICAwMDAwMDAwXG4jICAgICAgIDAwMCAgMDAwXG4jICAgICAgIDAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMFxuXG5qc1B1bmN0ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJygnXG4gICAgICAgICAgICBpZiBwcmV2LmNsc3Muc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYuY2xzcyA9PSAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuanNXb3JkID0gLT5cblxuICAgIGlmIGNodW5rLmNsc3MgPT0gJ2tleXdvcmQgZnVuY3Rpb24nXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnPScgYW5kIGdldFZhbHVlKC0yKS5zdGFydHNXaXRoICd0ZXh0J1xuICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ2Z1bmN0aW9uJ1xuICAgIDAgIyB3ZSBuZWVkIHRoaXMgaGVyZVxuXG5kaWN0ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnOicgYW5kIG5vdCBjaHVuay50dXJkPy5zdGFydHNXaXRoICc6OidcbiAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBpZiBwcmV2LmNsc3Muc3BsaXQoJyAnKVswXSBpbiBbJ3N0cmluZycgJ251bWJlcicgJ3RleHQnICdrZXl3b3JkJ11cbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuIyAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuIyAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5qc29uUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICc6J1xuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGZvciBpIGluIFtjaHVua0luZGV4LTIuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLmNsc3MgPT0gJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS5jbHNzID0gJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS5jbHNzID0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbmpzb25Xb3JkID0gLT5cblxuICAgIGlmICh0b3BUeXBlID09ICdzdHJpbmcgZG91YmxlJyBvciB0b3BUeXBlID09ICdzdHJpbmcgc2luZ2xlJykgYW5kIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBwcmV2Lm1hdGNoIGluICdcIl5+PSdcbiAgICAgICAgICAgIGlmIE5VTUJFUi50ZXN0KGdldG1hdGNoKDApKSBhbmQgZ2V0bWF0Y2goMSkgPT0gJy4nIGFuZCBOVU1CRVIudGVzdChnZXRtYXRjaCgyKSkgYW5kIGdldG1hdGNoKDMpID09ICcuJyBhbmQgTlVNQkVSLnRlc3QoZ2V0bWF0Y2goNCkpXG4gICAgICAgICAgICAgICAgaWYgcHJldi5tYXRjaCBpbiAnXn49J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAncHVuY3Qgc2VtdmVyJyBcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ3B1bmN0IHNlbXZlcicgaWYgZ2V0bWF0Y2goLTIpID09ICc+J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAxICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMiAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDMgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSA0ICdzZW12ZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIDVcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDBcblxuZXNjYXBlID0gLT5cblxuICAgIGlmIGNodW5rLm1hdGNoID09ICdcXFxcJyBhbmQgKHRvcFR5cGU/LnN0YXJ0c1dpdGgoJ3JlZ2V4cCcpIG9yIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZycpXG4gICAgICAgIGlmIGNodW5rSW5kZXggPT0gMCBvciBub3QgZ2V0Q2h1bmsoLTEpPy5lc2NhcGVcbiAgICAgICAgICAgIGlmIGdldENodW5rKDEpPy5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgY2h1bmsuZXNjYXBlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2VzY2FwZSdcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG5cbnJlZ2V4cCA9IC0+XG5cbiAgICByZXR1cm4gaWYgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnLydcblxuICAgICAgICBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICBjaHVuay5jbHNzICs9ICcgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgY2h1bmtJbmRleFxuICAgICAgICAgICAgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgKzFcbiAgICAgICAgICAgIGlmIG5vdCBwcmV2LmNsc3Muc3RhcnRzV2l0aCgncHVuY3QnKSBhbmQgbm90IHByZXYuY2xzcy5zdGFydHNXaXRoKCdrZXl3b3JkJykgb3IgcHJldi5tYXRjaCBpbiBcIildXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCAgY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA+ICBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoID09IGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuXG4gICAgICAgICAgICByZXR1cm4gaWYgbmV4dD8ubWF0Y2ggPT0gJz0nXG4gICAgICAgICAgICByZXR1cm4gaWYgcHJldi5jbHNzLnN0YXJ0c1dpdGggJ251bWJlcidcblxuICAgICAgICBwdXNoU3RhY2sgdHlwZToncmVnZXhwJ1xuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAncmVnZXhwIHN0YXJ0J1xuXG4gICAgZXNjYXBlKClcblxudHJpcGxlUmVnZXhwID0gLT5cblxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcblxuICAgIHR5cGUgPSAncmVnZXhwIHRyaXBsZSdcblxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuICAgIGlmIGNodW5rLnR1cmRbLi4yXSA9PSAnLy8vJ1xuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgbGluZW5vOmxpbmUubnVtYmVyXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG5cbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDBcblxuc2ltcGxlU3RyaW5nID0gLT5cblxuICAgIHJldHVybiBpZiB0b3BUeXBlID09ICdyZWdleHAnXG5cbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcblxuICAgIGlmIGNodW5rLm1hdGNoIGluICdcIlxcJydcblxuICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLm1hdGNoXG4gICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgIHdoZW4gXCInXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSdcblxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSBcIidcIlxuICAgICAgICAgICAgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgIGlmIG5leHQ/Lm1hdGNoIGluIFsncycnbGwnJ2QnXVxuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgZWxzZSBpZiBub3RDb2RlXG4gICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG5cbiAgICAgICAgcHVzaFN0YWNrIHN0cm9uZzp0cnVlIHR5cGU6dHlwZVxuICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgcmV0dXJuIDFcblxuICAgIGVzY2FwZSgpXG5cbnRyaXBsZVN0cmluZyA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgaW4gWydyZWdleHAnJ3N0cmluZyBzaW5nbGUnJ3N0cmluZyBkb3VibGUnXVxuXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG5cbiAgICB0eXBlID0gc3dpdGNoIGNodW5rLnR1cmRbLi4yXVxuICAgICAgICB3aGVuICdcIlwiXCInIHRoZW4gJ3N0cmluZyBkb3VibGUgdHJpcGxlJ1xuICAgICAgICB3aGVuIFwiJycnXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG5cbiAgICBpZiB0eXBlXG5cbiAgICAgICAgcmV0dXJuIGlmIHR5cGUgIT0gdG9wVHlwZSBhbmQgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwdXNoU3RhY2sgc3Ryb25nOnRydWUgdHlwZTp0eXBlXG5cbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcblxuICAgIGVzY2FwZSgpXG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDBcbiMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMFxuXG5udW1iZXIgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoXG5cbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtNCkgPT0gJ251bWJlciBmbG9hdCcgYW5kIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIGlmIGdldG1hdGNoKC01KSBpbiAnXn49J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtNSAncHVuY3Qgc2VtdmVyJyBcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTYgJ3B1bmN0IHNlbXZlcicgaWYgZ2V0bWF0Y2goLTYpID09ICc+J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC00ICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGNodW5rLmNsc3MgPSAnbnVtYmVyJ1xuICAgICAgICByZXR1cm4gMVxuXG4gICAgaWYgSEVYTlVNLnRlc3QgY2h1bmsubWF0Y2hcblxuICAgICAgICBjaHVuay5jbHNzID0gJ251bWJlciBoZXgnXG4gICAgICAgIHJldHVybiAxXG5cbiMgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDBcblxuZmxvYXQgPSAtPlxuXG4gICAgaWYgRkxPQVQudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgY2h1bmsuY2xzcyA9ICdudW1iZXIgZmxvYXQnXG4gICAgICAgIHJldHVybiAxXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDBcbiMgMDAwICAgICAgICAgICAgMDAwICAgICAgIDAwMFxuIyAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcblxuY3NzV29yZCA9IC0+XG5cbiAgICBpZiBjaHVuay5tYXRjaFstMi4uXSBpbiBbJ3B4JydlbScnZXgnXSBhbmQgTlVNQkVSLnRlc3QgY2h1bmsubWF0Y2hbLi4uLTJdXG4gICAgICAgIHNldFZhbHVlIDAgJ251bWJlcidcbiAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIGNodW5rLm1hdGNoWy0xLi5dIGluIFsncyddIGFuZCBOVU1CRVIudGVzdCBjaHVuay5tYXRjaFsuLi4tMV1cbiAgICAgICAgc2V0VmFsdWUgMCAnbnVtYmVyJ1xuICAgICAgICByZXR1cm4gMVxuXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG5cbiAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnLicgYW5kIGdldENodW5rKC0yKT8uY2xzcyAhPSAnbnVtYmVyJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ2NsYXNzJ1xuICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ2NsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09IFwiI1wiXG5cbiAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoLmxlbmd0aCA9PSAzIG9yIGNodW5rLm1hdGNoLmxlbmd0aCA9PSA2XG4gICAgICAgICAgICAgICAgaWYgSEVYLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAnZnVuY3Rpb24nXG4gICAgICAgICAgICBzZXRWYWx1ZSAgMCAnZnVuY3Rpb24nXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJy0nXG4gICAgICAgICAgICBpZiBwcmV2UHJldiA9IGdldENodW5rIC0yXG4gICAgICAgICAgICAgICAgaWYgcHJldlByZXYuY2xzcyBpbiBbJ2NsYXNzJydmdW5jdGlvbiddXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xIHByZXZQcmV2LmNsc3NcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgcHJldlByZXYuY2xzc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4jIDAwICAgICAwMCAgMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMDAwMDBcblxubWRQdW5jdCA9IC0+XG5cbiAgICBpZiBjaHVua0luZGV4ID09IDBcblxuICAgICAgICBpZiBub3QgY2h1bmsudHVyZCBhbmQgY2h1bmsubWF0Y2ggaW4gJy0qJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID4gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgdHlwZSA9IFsnbGkxJydsaTInJ2xpMyddW2NodW5rLnN0YXJ0LzRdXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCB0eXBlICsgJyBtYXJrZXInXG5cbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJyMnXG4gICAgICAgICAgICBpZiBub3QgY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMSdcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAnaDEnXG4gICAgICAgICAgICBzd2l0Y2ggY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgIHdoZW4gJyMjJ1xuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDInXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAnaDInXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMjJ1xuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDMnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyAnaDMnXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMjIydcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2g0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDQgJ2g0J1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIyMjJ1xuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDUnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgNSAnaDUnXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnKidcblxuICAgICAgICBpZiBjaHVuay50dXJkP1suLjFdID09ICcqKidcblxuICAgICAgICAgICAgdHlwZSA9ICdib2xkJ1xuICAgICAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlcyAyIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuXG4gICAgICAgIHR5cGUgPSAnaXRhbGljJ1xuICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHRvcFR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnYCdcblxuICAgICAgICBpZiBjaHVuay50dXJkP1suLjJdID09ICdgYGAnXG5cbiAgICAgICAgICAgIHR5cGUgPSAnY29kZSB0cmlwbGUnXG5cbiAgICAgICAgICAgIGlmIGdldG1hdGNoKDMpIGluIFsnY29mZmVlc2NyaXB0JydqYXZhc2NyaXB0JydqcyddXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMyAnY29tbWVudCdcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuXG4gICAgICAgICAgICBwdXNoU3RhY2sgd2Vhazp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcblxuICAgICAgICB0eXBlID0gJ2NvZGUnXG4gICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdG9wVHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG5cbiAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwIHR5cGVcblxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwXG4jIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmludGVycG9sYXRpb24gPSAtPlxuXG4gICAgaWYgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoIFwiXFwje1wiXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTonaW50ZXJwb2xhdGlvbicsIHdlYWs6dHJ1ZVxuICAgICAgICAgICAgc2V0VmFsdWUgMCAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAxICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICBlbHNlIGlmIHRvcFR5cGUgPT0gJ2ludGVycG9sYXRpb24nXG5cbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ30nXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBlbmQnXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxua2V5d29yZCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgbm90IGxhbmdbZXh0XVxuICAgICAgICAjIGxvZyBcIm5vIGxhbmcgZm9yIGV4dD8gI3tleHR9XCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICBpZiBsYW5nW2V4dF0uaGFzT3duUHJvcGVydHkoY2h1bmsubWF0Y2gpXG4gICAgICAgIGNodW5rLmNsc3MgPSBsYW5nW2V4dF1bY2h1bmsubWF0Y2hdXG4gICAgICAgIHJldHVybiAjIGdpdmUgY29mZmVlRnVuYyBhIGNoYW5jZSwgbnVtYmVyIGJhaWxzIGZvciB1c1xuXG4jIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDBcbiMgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMFxuIyAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwXG4jICAwMDAgMDAwICAgMDAwIDAgMDAwICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxueG1sUHVuY3QgPSAtPlxuXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnPC8nXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAna2V5d29yZCdcblxuICAgIGlmIGNodW5rLm1hdGNoIGluIFsnPCcnPiddXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdrZXl3b3JkJ1xuXG4jICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgICAgICAwMDBcbiMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwXG5cbmNwcE1hY3JvID0gLT5cblxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgIGFkZFZhbHVlIDAgJ2RlZmluZSdcbiAgICAgICAgc2V0VmFsdWUgMSAnZGVmaW5lJ1xuICAgICAgICByZXR1cm4gMlxuXG4jICAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwXG4jICAgICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5zaFB1bmN0ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnLycgYW5kIGdldENodW5rKC0xKT8uc3RhcnQgKyBnZXRDaHVuaygtMSk/Lmxlbmd0aCA9PSBjaHVuay5zdGFydFxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgLTEgJ2RpcidcblxuICAgIGlmIGNodW5rLnR1cmQgPT0gJy0tJyBhbmQgZ2V0Q2h1bmsoMik/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzIgYW5kIGdldENodW5rKC0xKT8uc3RhcnQrZ2V0Q2h1bmsoLTEpPy5sZW5ndGggPCBjaHVuay5zdGFydFxuICAgICAgICBhZGRWYWx1ZSAwICdhcmd1bWVudCdcbiAgICAgICAgYWRkVmFsdWUgMSAnYXJndW1lbnQnXG4gICAgICAgIHNldFZhbHVlIDIgJ2FyZ3VtZW50J1xuICAgICAgICByZXR1cm4gM1xuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJy0nIGFuZCBnZXRDaHVuaygxKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMSBhbmQgZ2V0Q2h1bmsoLTEpPy5zdGFydCtnZXRDaHVuaygtMSk/Lmxlbmd0aCA8IGNodW5rLnN0YXJ0XG4gICAgICAgIGFkZFZhbHVlIDAgJ2FyZ3VtZW50J1xuICAgICAgICBzZXRWYWx1ZSAxICdhcmd1bWVudCdcbiAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ34nIGFuZCAobm90IGdldENodW5rKC0xKSBvciBnZXRDaHVuaygtMSkuc3RhcnQgKyBnZXRDaHVuaygtMSkubGVuZ3RoIDwgY2h1bmsuc3RhcnQpXG4gICAgICAgIHNldFZhbHVlIDAgJ3RleHQgZGlyJ1xuICAgICAgICByZXR1cm4gMVxuXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG5zdGFja2VkID0gLT5cblxuICAgIGlmIHN0YWNrVG9wXG4gICAgICAgIHJldHVybiBpZiBzdGFja1RvcC53ZWFrXG4gICAgICAgIGlmIHN0YWNrVG9wLnN0cm9uZ1xuICAgICAgICAgICAgY2h1bmsuY2xzcyA9IHRvcFR5cGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2h1bmsuY2xzcyArPSAnICcgKyB0b3BUeXBlXG4gICAgICAgIHJldHVybiAxXG5cbnB1c2hFeHQgPSAobXRjaCkgLT5cbiAgICBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICBleHRTdGFjay5wdXNoIGV4dFRvcFxuXG5hY3RFeHQgPSAtPlxuICAgIHN0YWNrICAgID0gW11cbiAgICBzdGFja1RvcCA9IG51bGxcbiAgICB0b3BUeXBlICA9ICcnXG4gICAgbm90Q29kZSAgPSBmYWxzZVxuXG5wb3BFeHQgPSAtPlxuICAgIHN0YWNrID0gZXh0VG9wLnN0YWNrXG4gICAgbGluZS5leHQgPSBleHRUb3Auc3RhcnQuZXh0XG4gICAgZXh0U3RhY2sucG9wKClcbiAgICBleHRUb3AgPSBleHRTdGFja1stMV1cblxuICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgbm90Q29kZSA9IHN0YWNrVG9wIGFuZCB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcblxucHVzaFN0YWNrID0gKG8pIC0+XG4gICAgc3RhY2sucHVzaCBvXG4gICAgc3RhY2tUb3AgPSBvXG4gICAgdG9wVHlwZSA9IG8udHlwZVxuICAgIG5vdENvZGUgPSB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcblxucG9wU3RhY2sgPSAtPlxuICAgIHN0YWNrLnBvcCgpXG4gICAgc3RhY2tUb3AgPSBzdGFja1stMV1cbiAgICB0b3BUeXBlID0gc3RhY2tUb3A/LnR5cGVcbiAgICBub3RDb2RlID0gc3RhY2tUb3AgYW5kIHRvcFR5cGUgbm90IGluIGNvZGVUeXBlc1xuXG5nZXRDaHVuayA9IChkKSAtPiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdXG5zZXRWYWx1ZSA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLmNsc3MgPSB2YWx1ZVxuZ2V0VmFsdWUgPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/LmNsc3MgPyAnJ1xuZ2V0bWF0Y2ggPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/Lm1hdGNoID8gJydcbmFkZFZhbHVlID0gKGQsIHZhbHVlKSAtPlxuICAgIGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoXG4gICAgICAgIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF0uY2xzcyArPSAnICcgKyB2YWx1ZVxuICAgIDFcblxuYWRkVmFsdWVzID0gKG4sdmFsdWUpIC0+XG4gICAgZm9yIGkgaW4gWzAuLi5uXVxuICAgICAgICBhZGRWYWx1ZSBpLCB2YWx1ZVxuICAgIG5cblxuaGFuZGxlcnMgPVxuICAgIGNvZmZlZTpcbiAgICAgICAgICBwdW5jdDpbIGJsb2NrQ29tbWVudCwgaGFzaENvbW1lbnQsIHRyaXBsZVJlZ2V4cCwgY29mZmVlUHVuY3QsIHRyaXBsZVN0cmluZywgc2ltcGxlU3RyaW5nLCBpbnRlcnBvbGF0aW9uLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCBdXG4gICAgICAgICAgd29yZDogWyBrZXl3b3JkLCBjb2ZmZWVXb3JkLCBudW1iZXIsIHByb3BlcnR5IF1cbiAgICBub29uOiBwdW5jdDpbIG5vb25Db21tZW50LCAgbm9vblB1bmN0LCB1cmxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBub29uV29yZCwgdXJsV29yZCwgbnVtYmVyICAgICAgICAgIF1cbiAgICBqczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBqc1B1bmN0LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0IF0sIHdvcmQ6WyBrZXl3b3JkLCBqc1dvcmQsIG51bWJlciwgcHJvcGVydHkgIF1cbiAgICB0czogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBqc1B1bmN0LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0IF0sIHdvcmQ6WyBrZXl3b3JkLCBqc1dvcmQsIG51bWJlciwgcHJvcGVydHkgIF1cbiAgICBpc3M6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBpbmk6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCBjcHBQb2ludGVyICAgICAgICAgICAgIF0sIHdvcmQ6WyAgICAgICAgICBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBjcHA6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCBjcHBQb2ludGVyICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCBjcHBXb3JkICAgIF1cbiAgICBmcmFnOiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCBjcHBQb2ludGVyICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCBjcHBXb3JkICAgIF1cbiAgICB2ZXJ0OiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCBjcHBQb2ludGVyICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCBjcHBXb3JkICAgIF1cbiAgICBocHA6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCBjcHBQb2ludGVyICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCBjcHBXb3JkICAgIF1cbiAgICBjOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCBjcHBQb2ludGVyICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCBjcHBXb3JkICAgIF1cbiAgICBoOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCBjcHBQb2ludGVyICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCBjcHBXb3JkICAgIF1cbiAgICBjczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBwdWc6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzdHlsOiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBjc3M6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzYXNzOiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzY3NzOiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzd2lmdDogcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBkaWN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIHByb3BlcnR5ICAgICAgICAgIF1cbiAgICBzdmc6ICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBodG1sOiBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBodG06ICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICB4bWw6ICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBudW1iZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICBzaDogICBwdW5jdDpbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCB1cmxQdW5jdCwgc2hQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCB1cmxXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBqc29uOiBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCBqc29uUHVuY3QsIHVybFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBqc29uV29yZCwgdXJsV29yZCwgbnVtYmVyIF1cbiAgICB5bWw6ICBwdW5jdDpbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCB1cmxQdW5jdCwgc2hQdW5jdCwgZGljdCAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBqc29uV29yZCwgdXJsV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSBdXG4gICAgeWFtbDogcHVuY3Q6WyBoYXNoQ29tbWVudCwgIHNpbXBsZVN0cmluZywgdXJsUHVuY3QsIHNoUHVuY3QsIGRpY3QgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwganNvbldvcmQsIHVybFdvcmQsIG51bWJlciwgcHJvcGVydHkgXVxuICAgIGxvZzogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHVybFB1bmN0LCBkaWN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIG1kOiAgIHB1bmN0OlsgICAgICAgICAgICAgICAgICAgIG1kUHVuY3QsIHVybFB1bmN0LCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGZpc2g6IHB1bmN0OlsgICAgICAgICAgICAgICAgaGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIHB5OiAgIHB1bmN0OlsgICAgICAgICAgICAgICAgaGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuXG5mb3IgZXh0IGluIGV4dHNcbiAgICBpZiBub3QgaGFuZGxlcnNbZXh0XT9cbiAgICAgICAgaGFuZGxlcnNbZXh0XSA9IHB1bmN0Olsgc2ltcGxlU3RyaW5nIF0sIHdvcmQ6WyBudW1iZXIgXVxuXG5mb3IgZXh0LG9iaiBvZiBoYW5kbGVyc1xuICAgIGhhbmRsZXJzW2V4dF0ucHVuY3QucHVzaCBzdGFja2VkXG4gICAgaGFuZGxlcnNbZXh0XS53b3JkLnB1c2ggc3RhY2tlZFxuXG4jIyNcbjAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG4jIyNcblxu4pa4ZG9jICdibG9ja2VkIGxpbmVzJ1xuXG4gICAgbGluZXM6IGFycmF5IG9mIGNodW5rZWQgbGluZXNcblxuICAgIHJldHVybnMgbGluZXMgd2l0aFxuICAgIC0gJ2V4dCcgc3dpdGNoZWQgaW4gc29tZSBsaW5lc1xuICAgIC0gJ3ZhbHVlJyBjaGFuZ2VkIGluIGNodW5rcyB0aGF0IG1hdGNoIGxhbmd1YWdlIHBhdHRlcm5zXG5cbmJsb2NrZWQgPSAobGluZXMpIC0+XG5cbiAgICBleHRTdGFjayAgID0gW11cbiAgICBzdGFjayAgICAgID0gW11cbiAgICBoYW5kbCAgICAgID0gW11cbiAgICBleHRUb3AgICAgID0gbnVsbFxuICAgIHN0YWNrVG9wICAgPSBudWxsXG4gICAgbm90Q29kZSAgICA9IGZhbHNlICMgc2hvcnRjdXQgZm9yIHRvcCBvZiBzdGFjayBub3QgaW4gY29kZVR5cGVzXG4gICAgdG9wVHlwZSAgICA9ICcnXG4gICAgZXh0ICAgICAgICA9ICcnXG4gICAgbGluZSAgICAgICA9IG51bGxcbiAgICBjaHVuayAgICAgID0gbnVsbFxuICAgIGNodW5rSW5kZXggPSAwXG5cbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgICAwMDBcbiAgICAjIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMFxuXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcblxuICAgICAgICBpZiBzdGFja1RvcFxuXG4gICAgICAgICAgICBpZiBzdGFja1RvcC50eXBlID09ICdjb21tZW50IHRyaXBsZSdcblxuICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm9yIGNodW5rIGluIGxpbmUuY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBIRUFERVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgbWlnaHRCZUhlYWRlciA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGlmIG1pZ2h0QmVIZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgZm9yIGNodW5rIGluIGxpbmUuY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVuay5jbHNzID0gJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcblxuICAgICAgICAgICAgaWYgc3RhY2tUb3AuZmlsbCB0aGVuIHBvcFN0YWNrKClcblxuICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgIGlmIGV4dFRvcC5zd2l0Y2guaW5kZW50IGFuZCBsaW5lLmNodW5rc1swXT8uc3RhcnQgPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5zdGFydFxuICAgICAgICAgICAgICAgIHBvcEV4dCgpICAgICAgICAgICAgICAgICAgICAgICAgIyBlbmQgb2YgZXh0ZW5zaW9uIGJsb2NrIHJlYWNoZWQgdGhhdCBpcyB0ZXJtaW5hdGVkIGJ5IGluZGVudGF0aW9uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3dpdGNoLnRvICAgICAjIG1ha2Ugc3VyZSB0aGUgY3VycmVudCBsaW5lIGV4dCBtYXRjaGVzIHRoZSB0b3Btb3N0IGZyb20gc3RhY2tcblxuICAgICAgICBpZiBleHQgIT0gbGluZS5leHQgICAgICAgICAgICAgICAgICAgICAgIyBlaXRoZXIgYXQgc3RhcnQgb2YgZmlsZSBvciB3ZSBzd2l0Y2hlZCBleHRlbnNpb25cbiAgICAgICAgICAgIGFjdEV4dCgpXG4gICAgICAgICAgICBoYW5kbCA9IGhhbmRsZXJzW2V4dCA9IGxpbmUuZXh0XSAgICAjIGluc3RhbGwgbmV3IGhhbmRsZXJzXG4gICAgICAgICAgICBpZiBub3QgaGFuZGxcbiAgICAgICAgICAgICAgICDilrhkYmcgbGluZVxuICAgICAgICAgICAgICAgIOKWuGRiZyBoYW5kbGVyc1xuICAgICAgICAgICAg4pa4YXNzZXJ0IGhhbmRsXG5cbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMFxuICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcblxuICAgICAgICBjaHVua0luZGV4ID0gMFxuICAgICAgICB3aGlsZSBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoXG5cbiAgICAgICAgICAgIGNodW5rID0gbGluZS5jaHVua3NbY2h1bmtJbmRleF1cblxuICAgICAgICAgICAgYmVmb3JlSW5kZXggPSBjaHVua0luZGV4XG5cbiAgICAgICAgICAgIGlmIGNodW5rLmNsc3Muc3RhcnRzV2l0aCAncHVuY3QnXG5cbiAgICAgICAgICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5lbmQ/IGFuZCBleHRUb3Auc3dpdGNoLmVuZCA9PSBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgY2h1bmsudHVyZC5sZW5ndGgsIGV4dFRvcC5zd2l0Y2guYWRkIGlmIGV4dFRvcC5zd2l0Y2guYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BFeHQoKSAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgdHVyZFxuXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC5wdW5jdCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICBlbHNlICMgd29yZHMsIG51bWJlcnNcblxuICAgICAgICAgICAgICAgIGlmIG5vdCBub3RDb2RlXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBzd3RjaFtsaW5lLmV4dF0/W2NodW5rLm1hdGNoXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHVyZENodW5rID0gZ2V0Q2h1bmsgLW10Y2gudHVyZC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoLnR1cmQgPT0gKHR1cmRDaHVuaz8udHVyZCA/IHR1cmRDaHVuaz8ubWF0Y2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcHVzaCBhIG5ldyBleHRlbnNpb24gb250byB0aGUgc3RhY2ssIGV4dCB3aWxsIGNoYW5nZSBvbiBzdGFydCBvZiBuZXh0IGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaEV4dCBtdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIG10Y2gubmV4dCBhbmQgZ2V0Q2h1bmsoMSkubWF0Y2ggPT0gbXRjaC5uZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaEV4dCBtdGNoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC53b3JkID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gYmVmb3JlSW5kZXhcbiAgICAgICAgICAgICAgICBjaHVua0luZGV4KytcbiAgICBsaW5lc1xuXG5ycGFkID0gKHMsIGwpIC0+XG4gICAgcyA9IFN0cmluZyBzXG4gICAgd2hpbGUgcy5sZW5ndGggPCBsIHRoZW4gcyArPSAnICdcbiAgICBzXG5cbnBhZCA9IChsKSAtPiBycGFkICcnLCBsXG4gICAgXG5yZXBsYWNlVGFicyA9IChzKSAtPlxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IHMubGVuZ3RoXG4gICAgICAgIGlmIHNbaV0gPT0gJ1xcdCdcbiAgICAgICAgICAgIHMgPSBzWy4uLmldICsgcGFkKDQtKGklNCkpICsgc1tpKzEuLl1cbiAgICAgICAgaSArPSAxXG4gICAgc1xuXG5wYXJzZSA9IChsaW5lcywgZXh0PSdjb2ZmZWUnKSAtPiBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbmtvbG9yaXplID0gKGNodW5rKSAtPiBcbiAgICBcbiAgICBpZiBjbiA9IGtvbG9yLm1hcFtjaHVuay5jbHNzXVxuICAgICAgICBpZiBjbiBpbnN0YW5jZW9mIEFycmF5XG4gICAgICAgICAgICB2ID0gY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIGZvciBjciBpbiBjblxuICAgICAgICAgICAgICAgIHYgPSBrb2xvcltjcl0gdlxuICAgICAgICAgICAgcmV0dXJuIHZcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmV0dXJuIGtvbG9yW2NuXSBjaHVuay5tYXRjaFxuICAgICAgICAgICAgXG4gICAgaWYgY2h1bmsuY2xzcy5lbmRzV2l0aCAnZmlsZSdcbiAgICAgICAgdzggY2h1bmsubWF0Y2hcbiAgICBlbHNlIGlmIGNodW5rLmNsc3MuZW5kc1dpdGggJ2V4dCdcbiAgICAgICAgdzMgY2h1bmsubWF0Y2hcbiAgICBlbHNlIGlmIGNodW5rLmNsc3Muc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgIGlmIExJLnRlc3QgY2h1bmsuY2xzc1xuICAgICAgICAgICAga29sb3JpemUgbWF0Y2g6Y2h1bmsubWF0Y2gsIGNsc3M6Y2h1bmsuY2xzcy5yZXBsYWNlIExJLCAnICdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdzIgY2h1bmsubWF0Y2hcbiAgICBlbHNlXG4gICAgICAgIGlmIExJLnRlc3QgY2h1bmsuY2xzc1xuICAgICAgICAgICAga29sb3JpemUgbWF0Y2g6Y2h1bmsubWF0Y2gsIGNsc3M6Y2h1bmsuY2xzcy5yZXBsYWNlIExJLCAnICdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2h1bmsubWF0Y2hcblxua29sb3JpemVDaHVua3MgPSAoY2h1bmtzOltdLCBudW1iZXI6KSAtPlxuICAgIFxuICAgIGNscnpkID0gJydcbiAgICBpZiBudW1iZXJcbiAgICAgICAgbnVtc3RyID0gU3RyaW5nIG51bWJlclxuICAgICAgICBjbHJ6ZCArPSB3MihudW1zdHIpICsgcnBhZCAnJywgNC1udW1zdHIubGVuZ3RoXG4gICAgICAgIFxuICAgIGMgPSAwXG4gICAgZm9yIGkgaW4gWzAuLi5jaHVua3MubGVuZ3RoXVxuICAgICAgICB3aGlsZSBjIDwgY2h1bmtzW2ldLnN0YXJ0IFxuICAgICAgICAgICAgY2xyemQgKz0gJyAnXG4gICAgICAgICAgICBjKytcbiAgICAgICAgY2xyemQgKz0ga29sb3JpemUgY2h1bmtzW2ldXG4gICAgICAgIGMgKz0gY2h1bmtzW2ldLmxlbmd0aFxuICAgIGNscnpkXG4gICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgICAwMDAwMCAgICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcblxuc3ludGF4ID0gKHRleHQ6dGV4dCwgZXh0Oidjb2ZmZWUnLCBudW1iZXJzOmZhbHNlKSAtPlxuICAgIFxuICAgIGxpbmVzID0gdGV4dC5zcGxpdCBORVdMSU5FXG4gICAgcm5ncyAgPSBwYXJzZShsaW5lcywgZXh0KS5tYXAgKGwpIC0+IGwuY2h1bmtzXG4gICAgXG4gICAgY2xpbmVzID0gW11cbiAgICBmb3IgaW5kZXggaW4gWzAuLi5saW5lcy5sZW5ndGhdXG4gICAgICAgIGxpbmUgPSBsaW5lc1tpbmRleF1cbiAgICAgICAgaWYgZXh0ID09ICdqcycgYW5kIGxpbmUuc3RhcnRzV2l0aCAnLy8jIHNvdXJjZU1hcHBpbmdVUkwnXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICBjbGluZXMucHVzaCBrb2xvcml6ZUNodW5rcyBjaHVua3M6cm5nc1tpbmRleF0sIG51bWJlcjpudW1iZXJzIGFuZCBpbmRleCsxXG4gICAgY2xpbmVzLmpvaW4gJ1xcbidcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICAgIGtvbG9yOiAgICAgIGtvbG9yXG4gICAgZXh0czogICAgICAgZXh0c1xuICAgIHBhcnNlOiAgICAgIHBhcnNlXG4gICAgY2h1bmtlZDogICAgY2h1bmtlZFxuICAgIHJhbmdlczogICAgIChsaW5lLCBleHQ9J2NvZmZlZScpICAtPiBwYXJzZShbbGluZV0sIGV4dClbMF0uY2h1bmtzXG4gICAgZGlzc2VjdDogICAgKGxpbmVzLCBleHQ9J2NvZmZlZScpIC0+IHBhcnNlKGxpbmVzLCBleHQpLm1hcCAobCkgLT4gbC5jaHVua3NcbiAgICBrb2xvcml6ZTogICBrb2xvcml6ZVxuICAgIGtvbG9yaXplQ2h1bmtzOiBrb2xvcml6ZUNodW5rc1xuICAgIHN5bnRheDogICAgIHN5bnRheFxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuXG7ilrh0ZXN0ICdwcm9maWxlJ1xuXG4gICAgeyBzbGFzaCB9ID0gcmVxdWlyZSAna3hrJ1xuICAgIHRleHQwID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL2NvZmZlZS9ub2Rlcy5jb2ZmZWVcIlxuICAgIHRleHQxID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vdGVzdC5jb2ZmZWVcIlxuXG4gICAgbGluZXMwID0gdGV4dDAuc3BsaXQgJ1xcbidcbiAgICBsaW5lczEgPSB0ZXh0MS5zcGxpdCAnXFxuJ1xuXG4gICAgZm9yIGkgaW4gWzAuLjVdXG4gICAgICAgIHBhcnNlIGxpbmVzMFxuXG4gICAg4pa4YXZlcmFnZSAxMDBcbiAgICAgICAgcGFyc2UgbGluZXMwXG4iXX0=
//# sourceURL=../coffee/klor.coffee