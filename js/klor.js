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
                klog('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1177[39m', line);
                klog('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1178[39m', handlers);
            }
            if (!(handl)) {
                klog('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1179[39m', '[1m[97massertion failure![39m[22m');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2xvci5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImtsb3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGswQkFBQTtJQUFBOzs7O0FBa0NBLE1BQWlCLE9BQUEsQ0FBVyxTQUFELEdBQVcsa0JBQXJCLENBQWpCLEVBQUUsZUFBRixFQUFROztBQUNSLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFFUixLQUFBLEdBQ0k7SUFBQSxNQUFBLEVBQ0k7UUFBQSxHQUFBLEVBQUs7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFTLEVBQUEsRUFBRyxJQUFaO1lBQWlCLE1BQUEsRUFBTyxDQUF4QjtTQUFMO0tBREo7SUFFQSxHQUFBLEVBQ0k7UUFBQSxNQUFBLEVBQVE7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFTLEVBQUEsRUFBRyxJQUFaO1lBQWlCLE1BQUEsRUFBTyxDQUF4QjtTQUFSO0tBSEo7SUFJQSxFQUFBLEVBQ0k7UUFBQSxZQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxRQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtZQUFpQyxHQUFBLEVBQUksYUFBckM7U0FBZDtRQUNBLFVBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLElBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1lBQWlDLEdBQUEsRUFBSSxhQUFyQztTQURkO0tBTEo7OztBQVFKLEtBQUEsc0NBQUE7O0lBQ0ksS0FBSyxDQUFDLEVBQUcsQ0FBQSxHQUFBLENBQVQsR0FBZ0I7UUFBQSxJQUFBLEVBQUssS0FBTDtRQUFXLEVBQUEsRUFBRyxHQUFkO1FBQW1CLEdBQUEsRUFBSSxLQUF2QjtRQUE2QixHQUFBLEVBQUksYUFBakM7O0FBRHBCOztBQUdBLEtBQUEsR0FBVTs7QUFDVixNQUFBLEdBQVU7O0FBQ1YsS0FBQSxHQUFVOztBQUNWLE1BQUEsR0FBVTs7QUFD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R0FBYjtRQUNJLElBQUEsR0FBTyxLQUFNLENBQUEsS0FBQTtRQUNiLElBQUcsR0FBQSxLQUFPLElBQVAsSUFBZ0IsSUFBSSxDQUFDLFVBQUwsQ0FBZ0Isc0JBQWhCLENBQW5CO0FBQ0kscUJBREo7O1FBRUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxjQUFBLENBQWU7WUFBQSxNQUFBLEVBQU8sSUFBSyxDQUFBLEtBQUEsQ0FBWjtZQUFvQixNQUFBLEVBQU8sT0FBQSxJQUFZLEtBQUEsR0FBTSxDQUE3QztTQUFmLENBQVo7QUFKSjtXQUtBLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBWjtBQVhLOztBQW1CVCxNQUFNLENBQUMsT0FBUCxHQUVJO0lBQUEsS0FBQSxFQUFZLEtBQVo7SUFDQSxJQUFBLEVBQVksSUFEWjtJQUVBLEtBQUEsRUFBWSxLQUZaO0lBR0EsT0FBQSxFQUFZLE9BSFo7SUFJQSxNQUFBLEVBQVksU0FBQyxJQUFELEVBQU8sR0FBUDs7WUFBTyxNQUFJOztlQUFjLEtBQUEsQ0FBTSxDQUFDLElBQUQsQ0FBTixFQUFjLEdBQWQsQ0FBbUIsQ0FBQSxDQUFBLENBQUUsQ0FBQztJQUEvQyxDQUpaO0lBS0EsT0FBQSxFQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7O1lBQVEsTUFBSTs7ZUFBYSxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsQ0FBaUIsQ0FBQyxHQUFsQixDQUFzQixTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDO1FBQVQsQ0FBdEI7SUFBekIsQ0FMWjtJQU1BLFFBQUEsRUFBWSxRQU5aO0lBT0EsY0FBQSxFQUFnQixjQVBoQjtJQVFBLE1BQUEsRUFBWSxNQVJaIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDBcbjAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIyNcblxu4pa4aWYgb3B0cy5sYW5nICMga29mZmVlIC0tbGFuZyBrbG9yLmNvZmZlZVxuXG4gICAgZnMgICA9IHJlcXVpcmUgJ2ZzJ1xuICAgIG5vb25fbG9hZCA9IHJlcXVpcmUgJ25vb24vanMvbG9hZCdcbiAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcblxuICAgIG5vb25GaWxlID0gcGF0aC5qb2luIF9fZGlybmFtZSwgJ2xhbmcubm9vbidcbiAgICBqc29uRmlsZSA9IHBhdGguam9pbiBfX2Rpcm5hbWUsICcuLicgJ2pzJyAnbGFuZy5qc29uJ1xuXG4gICAgbG9nICdjb21waWxlOicgbm9vbkZpbGVcbiAgICBsb2cgJ291dHB1dDonICBqc29uRmlsZVxuXG4gICAgbGFuZyA9IHt9XG4gICAgZXh0cyA9IFsndHh0Jydsb2cnXVxuICAgIGZvciBuYW1lcywga2V5d29yZHMgb2Ygbm9vbl9sb2FkIG5vb25GaWxlXG5cbiAgICAgICAgZm9yIGV4dCBpbiBuYW1lcy5zcGxpdCAvXFxzL1xuICAgICAgICAgICAgZXh0cy5wdXNoKGV4dCkgaWYgZXh0IG5vdCBpbiBleHRzXG4gICAgICAgICAgICBsYW5nW2V4dF0gPz0ge31cbiAgICAgICAgICAgIGZvciB2YWx1ZSx3b3JkcyBvZiBrZXl3b3Jkc1xuICAgICAgICAgICAgICAgIGZvciB3b3JkIGluIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgIGxhbmdbZXh0XVt3b3JkXSA9IHZhbHVlXG5cbiAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkge2V4dHM6ZXh0cywgbGFuZzpsYW5nfSwgbnVsbCwgJyAgICAnXG4gICAgZnMud3JpdGVGaWxlU3luYyBqc29uRmlsZSwganNvbiwgJ3V0ZjgnXG5cbnsgZXh0cywgbGFuZyB9ID0gcmVxdWlyZSBcIiN7X19kaXJuYW1lfS8uLi9qcy9sYW5nLmpzb25cIlxua29sb3IgPSByZXF1aXJlICcuL2tvbG9yJ1xuXG5zd3RjaCA9XG4gICAgY29mZmVlOlxuICAgICAgICBkb2M6IHR1cmQ6J+KWuCcgdG86J21kJyBpbmRlbnQ6MVxuICAgIHB1ZzpcbiAgICAgICAgc2NyaXB0OiBuZXh0OicuJyB0bzonanMnIGluZGVudDoxXG4gICAgbWQ6XG4gICAgICAgIGNvZmZlZXNjcmlwdDogdHVyZDonYGBgJyB0bzonY29mZmVlJyBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcbiAgICAgICAgamF2YXNjcmlwdDogICB0dXJkOidgYGAnIHRvOidqcycgICAgIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuXG5mb3IgZXh0IGluIGV4dHNcbiAgICBzd3RjaC5tZFtleHRdID0gdHVyZDonYGBgJyB0bzpleHQsIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuXG5TUEFDRSAgID0gL1xccy9cbkhFQURFUiAgPSAvXjArJC9cblBVTkNUICAgPSAvXFxXKy9nXG5OVU1CRVIgID0gL15cXGQrJC9cbkZMT0FUICAgPSAvXlxcZCtmJC9cbkhFWE5VTSAgPSAvXjB4W2EtZkEtRlxcZF0rJC9cbkhFWCAgICAgPSAvXlthLWZBLUZcXGRdKyQvXG5ORVdMSU5FID0gL1xccj9cXG4vXG5MSSAgICAgID0gLyhcXHNsaVxcZFxcc3xcXHNoXFxkXFxzKS9cblxuY29kZVR5cGVzID0gWydpbnRlcnBvbGF0aW9uJyAnY29kZSB0cmlwbGUnXVxuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG5cbuKWuGRvYyAnY2h1bmtlZCBsaW5lcywgZXh0J1xuXG4gICAgcmV0dXJucyBhcnJheSBvZlxuXG4gICAgICAgIGNodW5rczogW1xuICAgICAgICAgICAgICAgICAgICB0dXJkOiAgIHNcbiAgICAgICAgICAgICAgICAgICAgY2xzczogICBzXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiAgc1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogIG5cbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICBleHQ6ICAgIHNcbiAgICAgICAgY2hhcnM6ICBuXG4gICAgICAgIGluZGV4OiAgblxuICAgICAgICBudW1iZXI6IG4rMVxuXG5jaHVua2VkID0gKGxpbmVzLCBleHQpIC0+XG5cbiAgICBleHQgPSBleHRbMS4uXSBpZiBleHRbMF0gPT0gJy4nXG4gICAgZXh0ID0gJ3R4dCcgaWYgZXh0IG5vdCBpbiBleHRzXG5cbiAgICBsaW5lbm8gPSAwXG4gICAgbGluZXMubWFwICh0ZXh0KSAtPlxuXG4gICAgICAgIGxpbmUgPVxuICAgICAgICAgICAgY2h1bmtzOiBbXVxuICAgICAgICAgICAgY2hhcnM6ICAwXG4gICAgICAgICAgICBpbmRleDogIGxpbmVubysrXG4gICAgICAgICAgICBudW1iZXI6IGxpbmVub1xuICAgICAgICAgICAgZXh0OiAgICBleHRcblxuICAgICAgICByZXR1cm4gbGluZSBpZiBub3QgdGV4dCBpbnN0YW5jZW9mIFN0cmluZ1xuICAgICAgICBcbiAgICAgICAgY2h1bmtzID0gcmVwbGFjZVRhYnModGV4dCkuc3BsaXQgU1BBQ0VcblxuICAgICAgICBpZiBjaHVua3MubGVuZ3RoID09IDEgYW5kIGNodW5rc1swXSA9PSAnJ1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUgIyBlbXB0eSBsaW5lXG5cbiAgICAgICAgYyA9IDBcbiAgICAgICAgZm9yIHMgaW4gY2h1bmtzXG4gICAgICAgICAgICBpZiBzID09ICcnXG4gICAgICAgICAgICAgICAgYysrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gYysrXG4gICAgICAgICAgICAgICAgbCA9IHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgc2MgPSBjXG5cbiAgICAgICAgICAgICAgICAjIHNlcGVyYXRlIGJ5IHB1bmN0dWF0aW9uXG5cbiAgICAgICAgICAgICAgICB3aGlsZSBtID0gUFVOQ1QuZXhlYyBzXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgbS5pbmRleCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdsID0gbS5pbmRleC0oYy1zYylcbiAgICAgICAgICAgICAgICAgICAgICAgIHcgPSBzW2Mtc2MuLi5tLmluZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6d2wsIG1hdGNoOncsIGNsc3M6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG5cbiAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHB1bmN0ID0gbVswXVxuXG4gICAgICAgICAgICAgICAgICAgIHBpID0gMFxuICAgICAgICAgICAgICAgICAgICBhZHZhbmNlID0gMVxuICAgICAgICAgICAgICAgICAgICBjbHNzID0gJ3B1bmN0J1xuXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIHBpIDwgcHVuY3QubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIHBjID0gcHVuY3RbcGldXG4gICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlID0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgMHhEODAwIDw9IHB1bmN0LmNoYXJDb2RlQXQocGkpIDw9IDB4REJGRiBhbmQgMHhEQzAwIDw9IHB1bmN0LmNoYXJDb2RlQXQocGkrMSkgPD0gMHhERkZGXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHNzID0gJ3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGMgKz0gcHVuY3RbcGkrMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHNzID0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHBjIGluIFsnLCcnOycneycnfScnKCcnKSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsc3MgKz0gJyBtaW5vcidcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOmFkdmFuY2UsIG1hdGNoOnBjLCB0dXJkOnR1cmQsIGNsc3M6Y2xzc1xuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJkID0gdHVyZFthZHZhbmNlLi5dXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgcGkgPCBwdW5jdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsc3MgPSAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBwdW5jdFtwaS4uXSBpbiBbJywnJzsnJ3snJ30nJygnJyknXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsc3MgKz0gJyBtaW5vcidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOmFkdmFuY2UsIG1hdGNoOnB1bmN0W3BpLi5dLCBjbHNzOmNsc3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gYWR2YW5jZVxuXG4gICAgICAgICAgICAgICAgaWYgYyA8IHNjK2wgICAgICAgICMgY2hlY2sgZm9yIHJlbWFpbmluZyBub24tcHVuY3RcbiAgICAgICAgICAgICAgICAgICAgcmwgPSBzYytsLWMgICAgIyBsZW5ndGggb2YgcmVtYWluZGVyXG4gICAgICAgICAgICAgICAgICAgIHcgPSBzW2wtcmwuLl0gICMgdGV4dCAgIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDpybCwgbWF0Y2g6dywgY2xzczondGV4dCdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuXG4gICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmUuY2h1bmtzWy0xXVxuICAgICAgICAgICAgbGluZS5jaGFycyA9IGxhc3Quc3RhcnQgKyBsYXN0Lmxlbmd0aFxuXG4gICAgICAgIGxpbmVcblxuIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiMjI1xuXG5leHRTdGFjayAgID0gW11cbnN0YWNrICAgICAgPSBbXVxuaGFuZGwgICAgICA9IFtdXG5leHRUb3AgICAgID0gbnVsbFxuc3RhY2tUb3AgICA9IG51bGxcbm5vdENvZGUgICAgPSBmYWxzZSAjIHNob3J0Y3V0IGZvciB0b3Agb2Ygc3RhY2sgbm90IGluIGNvZGVUeXBlc1xudG9wVHlwZSAgICA9ICcnXG5leHQgICAgICAgID0gJydcbmxpbmUgICAgICAgPSBudWxsXG5jaHVuayAgICAgID0gbnVsbFxuY2h1bmtJbmRleCA9IDBcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuZmlsbENvbW1lbnQgPSAobikgLT5cblxuICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgYWRkVmFsdWUgaSwgJ2NvbW1lbnQnXG4gICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC1uXG4gICAgICAgIHJlc3RDaHVua3MgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4K24uLl1cbiAgICAgICAgbWlnaHRCZUhlYWRlciA9IHRydWVcbiAgICAgICAgZm9yIGMgaW4gcmVzdENodW5rc1xuICAgICAgICAgICAgYy5jbHNzID0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBpZiBtaWdodEJlSGVhZGVyIGFuZCBub3QgSEVBREVSLnRlc3QgYy5tYXRjaFxuICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSBmYWxzZVxuICAgICAgICBpZiBtaWdodEJlSGVhZGVyXG4gICAgICAgICAgICBmb3IgYyBpbiByZXN0Q2h1bmtzXG4gICAgICAgICAgICAgICAgYy5jbHNzICs9ICcgaGVhZGVyJ1xuICAgIGxpbmUuY2h1bmtzLmxlbmd0aCAtIGNodW5rSW5kZXggKyBuXG5cbmhhc2hDb21tZW50ID0gLT5cblxuICAgIHJldHVybiBpZiBzdGFja1RvcCBhbmQgdG9wVHlwZSAhPSAncmVnZXhwIHRyaXBsZSdcbiAgICBpZiBzdGFja1RvcCBhbmQgc3RhY2tUb3AubGluZW5vID09IGxpbmUubnVtYmVyXG4gICAgICAgIHJldHVybiAjIGNvbW1lbnRzIGluc2lkZSB0cmlwbGUgcmVnZXhwIG9ubHkgdmFsaWQgb24gaW50ZXJuYWwgbGluZXM/XG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIlxuICAgICAgICBmaWxsQ29tbWVudCAxXG5cbm5vb25Db21tZW50ID0gLT5cblxuICAgIHJldHVybiBpZiBzdGFja1RvcFxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCIgYW5kIGNodW5rSW5kZXggPT0gMFxuICAgICAgICBmaWxsQ29tbWVudCAxXG5cbnNsYXNoQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgc3RhY2tUb3BcblxuICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggXCIvL1wiXG4gICAgICAgIGZpbGxDb21tZW50IDJcblxuYmxvY2tDb21tZW50ID0gLT5cblxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcblxuICAgIHR5cGUgPSAnY29tbWVudCB0cmlwbGUnXG5cbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSBub3QgaW4gWydpbnRlcnBvbGF0aW9uJywgdHlwZV1cblxuICAgIGlmIGNodW5rLnR1cmRbLi4yXSA9PSAnIyMjJ1xuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWVcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcblxuc3RhckNvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkXG5cbiAgICB0eXBlID0gJ2NvbW1lbnQgdHJpcGxlJ1xuXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgIT0gdHlwZVxuXG4gICAgaWYgY2h1bmsudHVyZFsuLjFdID09ICcvKicgYW5kIG5vdCB0b3BUeXBlXG4gICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG4gICAgaWYgY2h1bmsudHVyZFsuLjFdID09ICcqLycgYW5kIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDBcblxuZGFzaEFycm93ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBtYXJrRnVuYyA9IC0+XG4gICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLmNsc3MgPT0gJ3RleHQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1sxXS5tYXRjaCA9PSAnPScgYW5kIGxpbmUuY2h1bmtzWzJdLm1hdGNoICE9ICc+J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLmNsc3MgPSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0uY2xzcyArPSAnIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgZWxzZSBpZiBsaW5lLmNodW5rc1sxXS5tYXRjaCA9PSAnOidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS5jbHNzID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS5jbHNzICs9ICcgbWV0aG9kJ1xuXG4gICAgaWYgY2h1bmsudHVyZFxuXG4gICAgICAgIGlmIGNodW5rLnR1cmQuc3RhcnRzV2l0aCAnLT4nXG4gICAgICAgICAgICBtYXJrRnVuYygpXG4gICAgICAgICAgICBhZGRWYWx1ZSAwICdmdW5jdGlvbiB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSAnZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLmNsc3MgPT0gJ2RpY3Rpb25hcnkga2V5JyBvciBsaW5lLmNodW5rc1swXS50dXJkP1suLjFdID09ICdAOidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS5jbHNzID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS5jbHNzID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbMF0ubWF0Y2ggPT0gJ0AnIGFuZCBsaW5lLmNodW5rc1sxXS5jbHNzID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS5jbHNzID0gJ3B1bmN0IG1ldGhvZCBjbGFzcydcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS5jbHNzID0gJ21ldGhvZCBjbGFzcydcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1syXS5jbHNzID0gJ3B1bmN0IG1ldGhvZCBjbGFzcydcbiAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAgICAgaWYgY2h1bmsudHVyZC5zdGFydHNXaXRoICc9PidcbiAgICAgICAgICAgIG1hcmtGdW5jKClcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2Z1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxICdmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMF0uY2xzcyA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0uY2xzcyA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0uY2xzcyA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICByZXR1cm4gMlxuXG5jcHBQb2ludGVyID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIGNodW5rLnR1cmRcbiAgICAgICAgaWYgY2h1bmsudHVyZC5zdGFydHNXaXRoICctPidcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2Fycm93IHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxICdhcnJvdyBoZWFkJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIFxuY29tbWVudEhlYWRlciA9IC0+XG5cbiAgICBpZiB0b3BUeXBlID09ICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaWYgSEVBREVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIGNodW5rLmNsc3MgPSAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDBcblxudGhpc0NhbGwgPSAtPlxuXG4gICAgc2V0VmFsdWUgLTEgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgaWYgZ2V0bWF0Y2goLTIpID09ICdAJ1xuICAgICAgICBzZXRWYWx1ZSAtMiAncHVuY3QgZnVuY3Rpb24gY2FsbCdcbiAgICAwXG5cbmNvZmZlZVB1bmN0ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAn4pa4J1xuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAnbWV0YSdcblxuICAgIGlmIGNodW5rLnR1cmQgPT0gJ34+J1xuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ21ldGEnXG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcblxuICAgICAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoKCcuLicpIGFuZCBwcmV2Lm1hdGNoICE9ICcuJ1xuICAgICAgICAgICAgaWYgY2h1bmsudHVyZFsyXSAhPSAnLidcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ3JhbmdlJ1xuICAgICAgICAgICAgaWYgY2h1bmsudHVyZFszXSAhPSAnLidcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgJ3JhbmdlJ1xuXG4gICAgICAgIGlmIHByZXYuY2xzcy5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi5jbHNzID09ICdwcm9wZXJ0eSdcblxuICAgICAgICAgICAgcHJldkVuZCA9IHByZXYuc3RhcnQrcHJldi5sZW5ndGhcbiAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcoJyBhbmQgcHJldkVuZCA9PSBjaHVuay5zdGFydFxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG4gICAgICAgICAgICBlbHNlIGlmIHByZXZFbmQgPCBjaHVuay5zdGFydCAjIHNwYWNlZFxuICAgICAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoIGluICdAWyh7XCJcXCcnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjaHVuay5tYXRjaCBpbiAnKy0vJ1xuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgbmV4dCBvciBuZXh0Lm1hdGNoICE9ICc9JyBhbmQgbmV4dC5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuXG5jb2ZmZWVXb3JkID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcblxuICAgICAgICBpZiBwcmV2LmNsc3MgPT0gJ3B1bmN0IG1ldGEnXG4gICAgICAgICAgICBpZiBjaHVuay5zdGFydCA9PSBwcmV2LnN0YXJ0KzFcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdtZXRhJ1xuICAgICAgICAgICAgICAgIHJldHVybiAwICMgZ2l2ZSBzd2l0Y2ggYSBjaGFuY2VcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoIGluIFsnY2xhc3MnLCAnZXh0ZW5kcyddXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdjbGFzcydcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgY2h1bmsuY2xzcy5zdGFydHNXaXRoICdrZXl3b3JkJ1xuXG4gICAgICAgICAgICByZXR1cm4gMSAjIHdlIGFyZSBkb25lIHdpdGggdGhlIGtleXdvcmRcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ3RoaXMnXG4gICAgICAgICAgICBhZGRWYWx1ZSAgMCAndGhpcydcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgKHByZXYuY2xzcy5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi5jbHNzID09ICdwcm9wZXJ0eScpIGFuZCBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgY2h1bmsuc3RhcnQgIyBzcGFjZWRcbiAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG5cbnByb3BlcnR5ID0gLT4gIyB3b3JkXG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgIHByZXZQcmV2ID0gZ2V0Q2h1bmsgLTJcblxuICAgICAgICBpZiBwcmV2UHJldj8ubWF0Y2ggIT0gJy4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAncHJvcGVydHknXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIGlmIHByZXZQcmV2XG4gICAgICAgICAgICAgICAgaWYgcHJldlByZXYuY2xzcyBub3QgaW4gWydwcm9wZXJ0eScgJ251bWJlciddIGFuZCBub3QgcHJldlByZXYuY2xzcy5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ29iaidcbiAgICAgICAgICAgIHJldHVybiAxXG5cbmNwcFdvcmQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIHAgPSBwcm9wZXJ0eSgpIHRoZW4gcmV0dXJuIHBcblxuICAgIGlmIGdldENodW5rKC0yKT8udHVyZCA9PSAnOjonXG5cbiAgICAgICAgaWYgcHJldlByZXYgPSBnZXRDaHVuayAtM1xuICAgICAgICAgICAgc2V0VmFsdWUgLTMgJ3B1bmN0IG9iaidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0yICdvYmonXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAnb2JqJ1xuICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ21ldGhvZCdcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJzwnIGFuZCBnZXRtYXRjaCgxKSBpbiAnLD4nIG9yIGdldG1hdGNoKDEpID09ICc+JyBhbmQgZ2V0bWF0Y2goLTEpIGluICcsJ1xuXG4gICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCB0ZW1wbGF0ZSdcbiAgICAgICAgc2V0VmFsdWUgIDAgJ3RlbXBsYXRlJ1xuICAgICAgICBzZXRWYWx1ZSAgMSAncHVuY3QgdGVtcGxhdGUnXG4gICAgICAgIHJldHVybiAyXG5cbiAgICBpZiAvW0EtWl0vLnRlc3QgY2h1bmsubWF0Y2hbMV1cbiAgICAgICAgc3dpdGNoIGNodW5rLm1hdGNoWzBdXG4gICAgICAgICAgICB3aGVuICdUJ1xuICAgICAgICAgICAgICAgIGlmIGdldG1hdGNoKDEpID09ICc8J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdrZXl3b3JkIHR5cGUnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIHdoZW4gJ0YnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMCAnc3RydWN0J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIHdoZW4gJ0EnICdVJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ29iaidcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgaWYgY2h1bmsuY2xzcyA9PSAndGV4dCcgYW5kIGdldG1hdGNoKDEpID09ICcoJ1xuICAgICAgICBzZXRWYWx1ZSAwICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICByZXR1cm4gMVxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxubm9vblByb3AgPSAtPlxuXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIHByZXYuc3RhcnQrcHJldi5sZW5ndGgrMSA8IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICBpZiBwcmV2LmNsc3MgIT0gJ29iaidcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbY2h1bmtJbmRleC0xLi4wXVxuICAgICAgICAgICAgICAgICAgICBpZiBpIDwgY2h1bmtJbmRleC0xIGFuZCBsaW5lLmNodW5rc1tpXS5zdGFydCtsaW5lLmNodW5rc1tpXS5sZW5ndGgrMSA8IGxpbmUuY2h1bmtzW2krMV0uc3RhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLmNsc3MgPT0gJ3RleHQnIG9yIGxpbmUuY2h1bmtzW2ldLmNsc3MgPT0gJ29iaidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLmNsc3MgPSAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbaV0uY2xzcyA9PSAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS5jbHNzID0gJ3B1bmN0IHByb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgIDBcblxubm9vblB1bmN0ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlICMgbWFrZXMgdGhpcyBzZW5zZSBoZXJlID8/P1xuXG4gICAgbm9vblByb3AoKVxuXG5ub29uV29yZCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZSAjIG1ha2VzIHRoaXMgc2Vuc2UgaGVyZSA/Pz9cblxuICAgIGlmIGNodW5rLnN0YXJ0ID09IDBcbiAgICAgICAgc2V0VmFsdWUgMCAnb2JqJ1xuICAgICAgICByZXR1cm4gMVxuXG4gICAgbm9vblByb3AoKVxuXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDBcbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDBcblxudXJsUHVuY3QgPSAtPlxuXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJzovLydcbiAgICAgICAgICAgIGlmIGdldG1hdGNoKDQpID09ICcuJyBhbmQgZ2V0Q2h1bmsoNSlcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAndXJsIHByb3RvY29sJ1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlcyAzICd1cmwnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDMgJ3VybCBkb21haW4nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDQgJ3B1bmN0IHVybCB0bGQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDUgJ3VybCB0bGQnXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gNlxuXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcuJ1xuICAgICAgICAgICAgaWYgbm90IHByZXYuY2xzcy5zdGFydHNXaXRoKCdudW1iZXInKSBhbmQgcHJldi5jbHNzICE9ICdzZW12ZXInIGFuZCBwcmV2Lm1hdGNoIG5vdCBpbiAnXFxcXC4vJ1xuICAgICAgICAgICAgICAgIGlmIG5leHQgPSBnZXRDaHVuayAxXG4gICAgICAgICAgICAgICAgICAgIGlmIG5leHQuc3RhcnQgPT0gY2h1bmsuc3RhcnQrY2h1bmsubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlZXh0ID0gbmV4dC5tYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZmlsZWV4dCBub3QgaW4gJ1xcXFwuLyorJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xIGZpbGVleHQgKyAnIGZpbGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgIDAgZmlsZWV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAxIGZpbGVleHQgKyAnIGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuXG4gICAgICAgICAgICBmb3IgaSBpbiBbY2h1bmtJbmRleC4uMF1cbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS5zdGFydCtsaW5lLmNodW5rc1tpXS5sZW5ndGggPCBsaW5lLmNodW5rc1tpKzFdPy5zdGFydFxuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGxpbmUuY2h1bmtzW2ldLmNsc3MuZW5kc1dpdGggJ2RpcidcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS5jbHNzLnN0YXJ0c1dpdGggJ3VybCdcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS5tYXRjaCA9PSAnXCInXG4gICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbaV0uY2xzcy5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0uY2xzcyA9ICdwdW5jdCBkaXInXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS5jbHNzID0gJ3RleHQgZGlyJ1xuXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgIDBcblxudXJsV29yZCA9IC0+XG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiAnXFxcXC8nXG4gICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgaWYgbm90IG5leHQgb3IgbmV4dC5zdGFydCA+IGNodW5rLnN0YXJ0K2NodW5rLmxlbmd0aCBvciBuZXh0Lm1hdGNoIG5vdCBpbiAnXFxcXC4vJ1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsICdmaWxlJ1xuXG4jICAgICAgIDAwMCAgIDAwMDAwMDBcbiMgICAgICAgMDAwICAwMDBcbiMgICAgICAgMDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgICAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwXG5cbmpzUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKCdcbiAgICAgICAgICAgIGlmIHByZXYuY2xzcy5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi5jbHNzID09ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG5qc1dvcmQgPSAtPlxuXG4gICAgaWYgY2h1bmsuY2xzcyA9PSAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICc9JyBhbmQgZ2V0VmFsdWUoLTIpLnN0YXJ0c1dpdGggJ3RleHQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAtMiAnZnVuY3Rpb24nXG4gICAgMCAjIHdlIG5lZWQgdGhpcyBoZXJlXG5cbmRpY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICc6JyBhbmQgbm90IGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggJzo6J1xuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIGlmIHByZXYuY2xzcy5zcGxpdCgnICcpWzBdIGluIFsnc3RyaW5nJyAnbnVtYmVyJyAndGV4dCcgJ2tleXdvcmQnXVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4jICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4jICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbmpzb25QdW5jdCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJzonXG4gICAgICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnXCInXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXgtMi4uMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbaV0uY2xzcyA9PSAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLmNsc3MgPSAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLmNsc3MgPSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuanNvbldvcmQgPSAtPlxuXG4gICAgaWYgKHRvcFR5cGUgPT0gJ3N0cmluZyBkb3VibGUnIG9yIHRvcFR5cGUgPT0gJ3N0cmluZyBzaW5nbGUnKSBhbmQgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIHByZXYubWF0Y2ggaW4gJ1wiXn49J1xuICAgICAgICAgICAgaWYgTlVNQkVSLnRlc3QoZ2V0bWF0Y2goMCkpIGFuZCBnZXRtYXRjaCgxKSA9PSAnLicgYW5kIE5VTUJFUi50ZXN0KGdldG1hdGNoKDIpKSBhbmQgZ2V0bWF0Y2goMykgPT0gJy4nIGFuZCBOVU1CRVIudGVzdChnZXRtYXRjaCg0KSlcbiAgICAgICAgICAgICAgICBpZiBwcmV2Lm1hdGNoIGluICdefj0nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBzZW12ZXInIFxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAncHVuY3Qgc2VtdmVyJyBpZiBnZXRtYXRjaCgtMikgPT0gJz4nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDEgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAyICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMyAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDQgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICByZXR1cm4gNVxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMFxuXG5lc2NhcGUgPSAtPlxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ1xcXFwnIGFuZCAodG9wVHlwZT8uc3RhcnRzV2l0aCgncmVnZXhwJykgb3IgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJylcbiAgICAgICAgaWYgY2h1bmtJbmRleCA9PSAwIG9yIG5vdCBnZXRDaHVuaygtMSk/LmVzY2FwZVxuICAgICAgICAgICAgaWYgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICBjaHVuay5lc2NhcGUgPSB0cnVlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCAnZXNjYXBlJ1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcblxucmVnZXhwID0gLT5cblxuICAgIHJldHVybiBpZiB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG5cbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgICAgIGNodW5rLmNsc3MgKz0gJyByZWdleHAgZW5kJ1xuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBpZiBjaHVua0luZGV4XG4gICAgICAgICAgICBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIG5leHQgPSBnZXRDaHVuayArMVxuICAgICAgICAgICAgaWYgbm90IHByZXYuY2xzcy5zdGFydHNXaXRoKCdwdW5jdCcpIGFuZCBub3QgcHJldi5jbHNzLnN0YXJ0c1dpdGgoJ2tleXdvcmQnKSBvciBwcmV2Lm1hdGNoIGluIFwiKV1cIlxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAocHJldi5zdGFydCtwcmV2Lmxlbmd0aCA8ICBjaHVuay5zdGFydCkgYW5kIG5leHQ/LnN0YXJ0ID4gIGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPT0gY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA9PSBjaHVuay5zdGFydCsxXG5cbiAgICAgICAgICAgIHJldHVybiBpZiBuZXh0Py5tYXRjaCA9PSAnPSdcbiAgICAgICAgICAgIHJldHVybiBpZiBwcmV2LmNsc3Muc3RhcnRzV2l0aCAnbnVtYmVyJ1xuXG4gICAgICAgIHB1c2hTdGFjayB0eXBlOidyZWdleHAnXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdyZWdleHAgc3RhcnQnXG5cbiAgICBlc2NhcGUoKVxuXG50cmlwbGVSZWdleHAgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuXG4gICAgdHlwZSA9ICdyZWdleHAgdHJpcGxlJ1xuXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgbm90IGluIFsnaW50ZXJwb2xhdGlvbicsIHR5cGVdXG4gICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcvLy8nXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBsaW5lbm86bGluZS5udW1iZXJcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMFxuXG5zaW1wbGVTdHJpbmcgPSAtPlxuXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcblxuICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuXG4gICAgaWYgY2h1bmsubWF0Y2ggaW4gJ1wiXFwnJ1xuXG4gICAgICAgIHR5cGUgPSBzd2l0Y2ggY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIHdoZW4gJ1wiJyB0aGVuICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgd2hlbiBcIidcIiB0aGVuICdzdHJpbmcgc2luZ2xlJ1xuXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBlbHNlIGlmIG5vdENvZGVcbiAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcblxuICAgICAgICBwdXNoU3RhY2sgc3Ryb25nOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICByZXR1cm4gMVxuXG4gICAgZXNjYXBlKClcblxudHJpcGxlU3RyaW5nID0gLT5cblxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICByZXR1cm4gaWYgdG9wVHlwZSBpbiBbJ3JlZ2V4cCcnc3RyaW5nIHNpbmdsZScnc3RyaW5nIGRvdWJsZSddXG5cbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcblxuICAgIHR5cGUgPSBzd2l0Y2ggY2h1bmsudHVyZFsuLjJdXG4gICAgICAgIHdoZW4gJ1wiXCJcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSB0cmlwbGUnXG4gICAgICAgIHdoZW4gXCInJydcIiB0aGVuICdzdHJpbmcgc2luZ2xlIHRyaXBsZSdcblxuICAgIGlmIHR5cGVcblxuICAgICAgICByZXR1cm4gaWYgdHlwZSAhPSB0b3BUeXBlIGFuZCB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG5cbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBzdHJvbmc6dHJ1ZSB0eXBlOnR5cGVcblxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuXG4gICAgZXNjYXBlKClcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbm51bWJlciA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuXG4gICAgaWYgTlVNQkVSLnRlc3QgY2h1bmsubWF0Y2hcblxuICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgICAgIGlmIGdldFZhbHVlKC00KSA9PSAnbnVtYmVyIGZsb2F0JyBhbmQgZ2V0VmFsdWUoLTIpID09ICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgaWYgZ2V0bWF0Y2goLTUpIGluICdefj0nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC01ICdwdW5jdCBzZW12ZXInIFxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtNiAncHVuY3Qgc2VtdmVyJyBpZiBnZXRtYXRjaCgtNikgPT0gJz4nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTQgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMyAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgY2h1bmsuY2xzcyA9ICdudW1iZXInXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBIRVhOVU0udGVzdCBjaHVuay5tYXRjaFxuXG4gICAgICAgIGNodW5rLmNsc3MgPSAnbnVtYmVyIGhleCdcbiAgICAgICAgcmV0dXJuIDFcblxuIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMFxuXG5mbG9hdCA9IC0+XG5cbiAgICBpZiBGTE9BVC50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBjaHVuay5jbHNzID0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgcmV0dXJuIDFcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuIyAwMDAgICAgICAgICAgICAwMDAgICAgICAgMDAwXG4jICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuXG5jc3NXb3JkID0gLT5cblxuICAgIGlmIGNodW5rLm1hdGNoWy0yLi5dIGluIFsncHgnJ2VtJydleCddIGFuZCBOVU1CRVIudGVzdCBjaHVuay5tYXRjaFsuLi4tMl1cbiAgICAgICAgc2V0VmFsdWUgMCAnbnVtYmVyJ1xuICAgICAgICByZXR1cm4gMVxuXG4gICAgaWYgY2h1bmsubWF0Y2hbLTEuLl0gaW4gWydzJ10gYW5kIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoWy4uLi0xXVxuICAgICAgICBzZXRWYWx1ZSAwICdudW1iZXInXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICcuJyBhbmQgZ2V0Q2h1bmsoLTIpPy5jbHNzICE9ICdudW1iZXInXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAnY2xhc3MnXG4gICAgICAgICAgICBzZXRWYWx1ZSAgMCAnY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gXCIjXCJcblxuICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2gubGVuZ3RoID09IDMgb3IgY2h1bmsubWF0Y2gubGVuZ3RoID09IDZcbiAgICAgICAgICAgICAgICBpZiBIRVgudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSAnbnVtYmVyIGhleCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdmdW5jdGlvbidcbiAgICAgICAgICAgIHNldFZhbHVlICAwICdmdW5jdGlvbidcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnLSdcbiAgICAgICAgICAgIGlmIHByZXZQcmV2ID0gZ2V0Q2h1bmsgLTJcbiAgICAgICAgICAgICAgICBpZiBwcmV2UHJldi5jbHNzIGluIFsnY2xhc3MnJ2Z1bmN0aW9uJ11cbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgcHJldlByZXYuY2xzc1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCBwcmV2UHJldi5jbHNzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiMgMDAgICAgIDAwICAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG5tZFB1bmN0ID0gLT5cblxuICAgIGlmIGNodW5rSW5kZXggPT0gMFxuXG4gICAgICAgIGlmIG5vdCBjaHVuay50dXJkIGFuZCBjaHVuay5tYXRjaCBpbiAnLSonIGFuZCBnZXRDaHVuaygxKT8uc3RhcnQgPiBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICB0eXBlID0gWydsaTEnJ2xpMicnbGkzJ11bY2h1bmsuc3RhcnQvNF1cbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZSAwIHR5cGUgKyAnIG1hcmtlcidcblxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnIydcbiAgICAgICAgICAgIGlmIG5vdCBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2gxJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdoMSdcbiAgICAgICAgICAgIHN3aXRjaCBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMnXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdoMidcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMnXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMydcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzICdoMydcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMjJ1xuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgNCAnaDQnXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMjIyMnXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoNSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyA1ICdoNSdcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICcqJ1xuXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/Wy4uMV0gPT0gJyoqJ1xuXG4gICAgICAgICAgICB0eXBlID0gJ2JvbGQnXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWVzIDIgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG5cbiAgICAgICAgdHlwZSA9ICdpdGFsaWMnXG4gICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdG9wVHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgcmV0dXJuIDFcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICdgJ1xuXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/Wy4uMl0gPT0gJ2BgYCdcblxuICAgICAgICAgICAgdHlwZSA9ICdjb2RlIHRyaXBsZSdcblxuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goMykgaW4gWydjb2ZmZWVzY3JpcHQnJ2phdmFzY3JpcHQnJ2pzJ11cbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAzICdjb21tZW50J1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG5cbiAgICAgICAgICAgIHB1c2hTdGFjayB3ZWFrOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuXG4gICAgICAgIHR5cGUgPSAnY29kZSdcbiAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCB0b3BUeXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcblxuICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgdHlwZVxuXG4jIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDBcbiMgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMFxuIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwXG4jIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDBcbiMgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDBcblxuaW50ZXJwb2xhdGlvbiA9IC0+XG5cbiAgICBpZiB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggXCJcXCN7XCJcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidpbnRlcnBvbGF0aW9uJywgd2Vhazp0cnVlXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgIHNldFZhbHVlIDEgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgIGVsc2UgaWYgdG9wVHlwZSA9PSAnaW50ZXJwb2xhdGlvbidcblxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnfSdcbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG5rZXl3b3JkID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG5cbiAgICBpZiBub3QgbGFuZ1tleHRdXG4gICAgICAgICMgbG9nIFwibm8gbGFuZyBmb3IgZXh0PyAje2V4dH1cIlxuICAgICAgICByZXR1cm5cblxuICAgIGlmIGxhbmdbZXh0XS5oYXNPd25Qcm9wZXJ0eShjaHVuay5tYXRjaClcbiAgICAgICAgY2h1bmsuY2xzcyA9IGxhbmdbZXh0XVtjaHVuay5tYXRjaF1cbiAgICAgICAgcmV0dXJuICMgZ2l2ZSBjb2ZmZWVGdW5jIGEgY2hhbmNlLCBudW1iZXIgYmFpbHMgZm9yIHVzXG5cbiMgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMFxuIyAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwXG4jICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDBcbiMgIDAwMCAwMDAgICAwMDAgMCAwMDAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG54bWxQdW5jdCA9IC0+XG5cbiAgICBpZiBjaHVuay50dXJkID09ICc8LydcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdrZXl3b3JkJ1xuXG4gICAgaWYgY2h1bmsubWF0Y2ggaW4gWyc8Jyc+J11cbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ2tleXdvcmQnXG5cbiMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAgIDAwMFxuIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDBcblxuY3BwTWFjcm8gPSAtPlxuXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgYWRkVmFsdWUgMCAnZGVmaW5lJ1xuICAgICAgICBzZXRWYWx1ZSAxICdkZWZpbmUnXG4gICAgICAgIHJldHVybiAyXG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAwMDAwMDBcbiMgICAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgMDAwICAgMDAwXG5cbnNoUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcblxuICAgIGlmIGNodW5rLm1hdGNoID09ICcvJyBhbmQgZ2V0Q2h1bmsoLTEpPy5zdGFydCArIGdldENodW5rKC0xKT8ubGVuZ3RoID09IGNodW5rLnN0YXJ0XG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAtMSAnZGlyJ1xuXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnLS0nIGFuZCBnZXRDaHVuaygyKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMiBhbmQgZ2V0Q2h1bmsoLTEpPy5zdGFydCtnZXRDaHVuaygtMSk/Lmxlbmd0aCA8IGNodW5rLnN0YXJ0XG4gICAgICAgIGFkZFZhbHVlIDAgJ2FyZ3VtZW50J1xuICAgICAgICBhZGRWYWx1ZSAxICdhcmd1bWVudCdcbiAgICAgICAgc2V0VmFsdWUgMiAnYXJndW1lbnQnXG4gICAgICAgIHJldHVybiAzXG5cbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnLScgYW5kIGdldENodW5rKDEpPy5zdGFydCA9PSBjaHVuay5zdGFydCsxIGFuZCBnZXRDaHVuaygtMSk/LnN0YXJ0K2dldENodW5rKC0xKT8ubGVuZ3RoIDwgY2h1bmsuc3RhcnRcbiAgICAgICAgYWRkVmFsdWUgMCAnYXJndW1lbnQnXG4gICAgICAgIHNldFZhbHVlIDEgJ2FyZ3VtZW50J1xuICAgICAgICByZXR1cm4gMlxuICAgICAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnficgYW5kIChub3QgZ2V0Q2h1bmsoLTEpIG9yIGdldENodW5rKC0xKS5zdGFydCArIGdldENodW5rKC0xKS5sZW5ndGggPCBjaHVuay5zdGFydClcbiAgICAgICAgc2V0VmFsdWUgMCAndGV4dCBkaXInXG4gICAgICAgIHJldHVybiAxXG5cbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbnN0YWNrZWQgPSAtPlxuXG4gICAgaWYgc3RhY2tUb3BcbiAgICAgICAgcmV0dXJuIGlmIHN0YWNrVG9wLndlYWtcbiAgICAgICAgaWYgc3RhY2tUb3Auc3Ryb25nXG4gICAgICAgICAgICBjaHVuay5jbHNzID0gdG9wVHlwZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjaHVuay5jbHNzICs9ICcgJyArIHRvcFR5cGVcbiAgICAgICAgcmV0dXJuIDFcblxucHVzaEV4dCA9IChtdGNoKSAtPlxuICAgIGV4dFRvcCA9IHN3aXRjaDptdGNoLCBzdGFydDpsaW5lLCBzdGFjazpzdGFja1xuICAgIGV4dFN0YWNrLnB1c2ggZXh0VG9wXG5cbmFjdEV4dCA9IC0+XG4gICAgc3RhY2sgICAgPSBbXVxuICAgIHN0YWNrVG9wID0gbnVsbFxuICAgIHRvcFR5cGUgID0gJydcbiAgICBub3RDb2RlICA9IGZhbHNlXG5cbnBvcEV4dCA9IC0+XG4gICAgc3RhY2sgPSBleHRUb3Auc3RhY2tcbiAgICBsaW5lLmV4dCA9IGV4dFRvcC5zdGFydC5leHRcbiAgICBleHRTdGFjay5wb3AoKVxuICAgIGV4dFRvcCA9IGV4dFN0YWNrWy0xXVxuXG4gICAgc3RhY2tUb3AgPSBzdGFja1stMV1cbiAgICB0b3BUeXBlID0gc3RhY2tUb3A/LnR5cGVcbiAgICBub3RDb2RlID0gc3RhY2tUb3AgYW5kIHRvcFR5cGUgbm90IGluIGNvZGVUeXBlc1xuXG5wdXNoU3RhY2sgPSAobykgLT5cbiAgICBzdGFjay5wdXNoIG9cbiAgICBzdGFja1RvcCA9IG9cbiAgICB0b3BUeXBlID0gby50eXBlXG4gICAgbm90Q29kZSA9IHRvcFR5cGUgbm90IGluIGNvZGVUeXBlc1xuXG5wb3BTdGFjayA9IC0+XG4gICAgc3RhY2sucG9wKClcbiAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgIG5vdENvZGUgPSBzdGFja1RvcCBhbmQgdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG5cbmdldENodW5rID0gKGQpIC0+IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF1cbnNldFZhbHVlID0gKGQsIHZhbHVlKSAtPiBpZiAwIDw9IGNodW5rSW5kZXgrZCA8IGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF0uY2xzcyA9IHZhbHVlXG5nZXRWYWx1ZSA9IChkKSAtPiBnZXRDaHVuayhkKT8uY2xzcyA/ICcnXG5nZXRtYXRjaCA9IChkKSAtPiBnZXRDaHVuayhkKT8ubWF0Y2ggPyAnJ1xuYWRkVmFsdWUgPSAoZCwgdmFsdWUpIC0+XG4gICAgaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS5jbHNzICs9ICcgJyArIHZhbHVlXG4gICAgMVxuXG5hZGRWYWx1ZXMgPSAobix2YWx1ZSkgLT5cbiAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgIGFkZFZhbHVlIGksIHZhbHVlXG4gICAgblxuXG5oYW5kbGVycyA9XG4gICAgY29mZmVlOlxuICAgICAgICAgIHB1bmN0OlsgYmxvY2tDb21tZW50LCBoYXNoQ29tbWVudCwgdHJpcGxlUmVnZXhwLCBjb2ZmZWVQdW5jdCwgdHJpcGxlU3RyaW5nLCBzaW1wbGVTdHJpbmcsIGludGVycG9sYXRpb24sIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0IF1cbiAgICAgICAgICB3b3JkOiBbIGtleXdvcmQsIGNvZmZlZVdvcmQsIG51bWJlciwgcHJvcGVydHkgXVxuICAgIG5vb246IHB1bmN0Olsgbm9vbkNvbW1lbnQsICBub29uUHVuY3QsIHVybFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIG5vb25Xb3JkLCB1cmxXb3JkLCBudW1iZXIgICAgICAgICAgXVxuICAgIGpzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIGpzUHVuY3QsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIGRpY3QgXSwgd29yZDpbIGtleXdvcmQsIGpzV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSAgXVxuICAgIHRzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIGpzUHVuY3QsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIGRpY3QgXSwgd29yZDpbIGtleXdvcmQsIGpzV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSAgXVxuICAgIGlzczogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGluaTogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sIGNwcFBvaW50ZXIgICAgICAgICAgICAgXSwgd29yZDpbICAgICAgICAgIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGNwcDogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sIGNwcFBvaW50ZXIgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQsIGNwcFdvcmQgICAgXVxuICAgIGZyYWc6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sIGNwcFBvaW50ZXIgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQsIGNwcFdvcmQgICAgXVxuICAgIHZlcnQ6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sIGNwcFBvaW50ZXIgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQsIGNwcFdvcmQgICAgXVxuICAgIGhwcDogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sIGNwcFBvaW50ZXIgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQsIGNwcFdvcmQgICAgXVxuICAgIGM6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sIGNwcFBvaW50ZXIgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQsIGNwcFdvcmQgICAgXVxuICAgIGg6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sIGNwcFBvaW50ZXIgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQsIGNwcFdvcmQgICAgXVxuICAgIGNzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIHB1ZzogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIHN0eWw6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIGNzczogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIHNhc3M6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIHNjc3M6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIHN3aWZ0OiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGRpY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgcHJvcGVydHkgICAgICAgICAgXVxuICAgIHN2ZzogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGh0bWw6IHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGh0bTogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIHhtbDogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIG51bWJlciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgIHNoOiAgIHB1bmN0OlsgaGFzaENvbW1lbnQsICBzaW1wbGVTdHJpbmcsIHVybFB1bmN0LCBzaFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIGpzb246IHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIGpzb25QdW5jdCwgdXJsUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGpzb25Xb3JkLCB1cmxXb3JkLCBudW1iZXIgXVxuICAgIHltbDogIHB1bmN0OlsgaGFzaENvbW1lbnQsICBzaW1wbGVTdHJpbmcsIHVybFB1bmN0LCBzaFB1bmN0LCBkaWN0ICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGpzb25Xb3JkLCB1cmxXb3JkLCBudW1iZXIsIHByb3BlcnR5IF1cbiAgICB5YW1sOiBwdW5jdDpbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCB1cmxQdW5jdCwgc2hQdW5jdCwgZGljdCAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBqc29uV29yZCwgdXJsV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSBdXG4gICAgbG9nOiAgcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgdXJsUHVuY3QsIGRpY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsgdXJsV29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgbWQ6ICAgcHVuY3Q6WyAgICAgICAgICAgICAgICAgICAgbWRQdW5jdCwgdXJsUHVuY3QsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsgdXJsV29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgZmlzaDogcHVuY3Q6WyAgICAgICAgICAgICAgICBoYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG4gICAgcHk6ICAgcHVuY3Q6WyAgICAgICAgICAgICAgICBoYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCB3b3JkOlsga2V5d29yZCwgbnVtYmVyICAgICAgICAgICAgICAgICAgICBdXG5cbmZvciBleHQgaW4gZXh0c1xuICAgIGlmIG5vdCBoYW5kbGVyc1tleHRdP1xuICAgICAgICBoYW5kbGVyc1tleHRdID0gcHVuY3Q6WyBzaW1wbGVTdHJpbmcgXSwgd29yZDpbIG51bWJlciBdXG5cbmZvciBleHQsb2JqIG9mIGhhbmRsZXJzXG4gICAgaGFuZGxlcnNbZXh0XS5wdW5jdC5wdXNoIHN0YWNrZWRcbiAgICBoYW5kbGVyc1tleHRdLndvcmQucHVzaCBzdGFja2VkXG5cbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDBcbiMjI1xuXG7ilrhkb2MgJ2Jsb2NrZWQgbGluZXMnXG5cbiAgICBsaW5lczogYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuXG4gICAgcmV0dXJucyBsaW5lcyB3aXRoXG4gICAgLSAnZXh0JyBzd2l0Y2hlZCBpbiBzb21lIGxpbmVzXG4gICAgLSAndmFsdWUnIGNoYW5nZWQgaW4gY2h1bmtzIHRoYXQgbWF0Y2ggbGFuZ3VhZ2UgcGF0dGVybnNcblxuYmxvY2tlZCA9IChsaW5lcykgLT5cblxuICAgIGV4dFN0YWNrICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBbXVxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIGV4dFRvcCAgICAgPSBudWxsXG4gICAgc3RhY2tUb3AgICA9IG51bGxcbiAgICBub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbiAgICB0b3BUeXBlICAgID0gJydcbiAgICBleHQgICAgICAgID0gJydcbiAgICBsaW5lICAgICAgID0gbnVsbFxuICAgIGNodW5rICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IDBcblxuICAgICMgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAgIDAwMFxuICAgICMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwXG5cbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuXG4gICAgICAgIGlmIHN0YWNrVG9wXG5cbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLnR5cGUgPT0gJ2NvbW1lbnQgdHJpcGxlJ1xuXG4gICAgICAgICAgICAgICAgbWlnaHRCZUhlYWRlciA9IHRydWVcbiAgICAgICAgICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IEhFQURFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgaWYgbWlnaHRCZUhlYWRlclxuICAgICAgICAgICAgICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rLmNsc3MgPSAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuXG4gICAgICAgICAgICBpZiBzdGFja1RvcC5maWxsIHRoZW4gcG9wU3RhY2soKVxuXG4gICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5pbmRlbnQgYW5kIGxpbmUuY2h1bmtzWzBdPy5zdGFydCA8PSBleHRUb3Auc3RhcnQuY2h1bmtzWzBdLnN0YXJ0XG4gICAgICAgICAgICAgICAgcG9wRXh0KCkgICAgICAgICAgICAgICAgICAgICAgICAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgaW5kZW50YXRpb25cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsaW5lLmV4dCA9IGV4dFRvcC5zd2l0Y2gudG8gICAgICMgbWFrZSBzdXJlIHRoZSBjdXJyZW50IGxpbmUgZXh0IG1hdGNoZXMgdGhlIHRvcG1vc3QgZnJvbSBzdGFja1xuXG4gICAgICAgIGlmIGV4dCAhPSBsaW5lLmV4dCAgICAgICAgICAgICAgICAgICAgICAjIGVpdGhlciBhdCBzdGFydCBvZiBmaWxlIG9yIHdlIHN3aXRjaGVkIGV4dGVuc2lvblxuICAgICAgICAgICAgYWN0RXh0KClcbiAgICAgICAgICAgIGhhbmRsID0gaGFuZGxlcnNbZXh0ID0gbGluZS5leHRdICAgICMgaW5zdGFsbCBuZXcgaGFuZGxlcnNcbiAgICAgICAgICAgIGlmIG5vdCBoYW5kbFxuICAgICAgICAgICAgICAgIOKWuGRiZyBsaW5lXG4gICAgICAgICAgICAgICAg4pa4ZGJnIGhhbmRsZXJzXG4gICAgICAgICAgICDilrhhc3NlcnQgaGFuZGxcblxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwXG4gICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwXG4gICAgICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwXG4gICAgICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcblxuICAgICAgICAgICAgY2h1bmsgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4XVxuXG4gICAgICAgICAgICBiZWZvcmVJbmRleCA9IGNodW5rSW5kZXhcblxuICAgICAgICAgICAgaWYgY2h1bmsuY2xzcy5zdGFydHNXaXRoICdwdW5jdCdcblxuICAgICAgICAgICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmVuZD8gYW5kIGV4dFRvcC5zd2l0Y2guZW5kID09IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlcyBjaHVuay50dXJkLmxlbmd0aCwgZXh0VG9wLnN3aXRjaC5hZGQgaWYgZXh0VG9wLnN3aXRjaC5hZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcEV4dCgpICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSB0dXJkXG5cbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLnB1bmN0ID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIGVsc2UgIyB3b3JkcywgbnVtYmVyc1xuXG4gICAgICAgICAgICAgICAgaWYgbm90IG5vdENvZGVcbiAgICAgICAgICAgICAgICAgICAgaWYgbXRjaCA9IHN3dGNoW2xpbmUuZXh0XT9bY2h1bmsubWF0Y2hdXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dXJkQ2h1bmsgPSBnZXRDaHVuayAtbXRjaC50dXJkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG10Y2gudHVyZCA9PSAodHVyZENodW5rPy50dXJkID8gdHVyZENodW5rPy5tYXRjaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBwdXNoIGEgbmV3IGV4dGVuc2lvbiBvbnRvIHRoZSBzdGFjaywgZXh0IHdpbGwgY2hhbmdlIG9uIHN0YXJ0IG9mIG5leHQgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoRXh0IG10Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbXRjaC5uZXh0IGFuZCBnZXRDaHVuaygxKS5tYXRjaCA9PSBtdGNoLm5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoRXh0IG10Y2hcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLndvcmQgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSBiZWZvcmVJbmRleFxuICAgICAgICAgICAgICAgIGNodW5rSW5kZXgrK1xuICAgIGxpbmVzXG5cbnJwYWQgPSAocywgbCkgLT5cbiAgICBzID0gU3RyaW5nIHNcbiAgICB3aGlsZSBzLmxlbmd0aCA8IGwgdGhlbiBzICs9ICcgJ1xuICAgIHNcblxucGFkID0gKGwpIC0+IHJwYWQgJycsIGxcbiAgICBcbnJlcGxhY2VUYWJzID0gKHMpIC0+XG4gICAgaSA9IDBcbiAgICB3aGlsZSBpIDwgcy5sZW5ndGhcbiAgICAgICAgaWYgc1tpXSA9PSAnXFx0J1xuICAgICAgICAgICAgcyA9IHNbLi4uaV0gKyBwYWQoNC0oaSU0KSkgKyBzW2krMS4uXVxuICAgICAgICBpICs9IDFcbiAgICBzXG5cbnBhcnNlID0gKGxpbmVzLCBleHQ9J2NvZmZlZScpIC0+IGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxua29sb3JpemUgPSAoY2h1bmspIC0+IFxuICAgIFxuICAgIGlmIGNuID0ga29sb3IubWFwW2NodW5rLmNsc3NdXG4gICAgICAgIGlmIGNuIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgICAgICAgIHYgPSBjaHVuay5tYXRjaFxuICAgICAgICAgICAgZm9yIGNyIGluIGNuXG4gICAgICAgICAgICAgICAgdiA9IGtvbG9yW2NyXSB2XG4gICAgICAgICAgICByZXR1cm4gdlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICByZXR1cm4ga29sb3JbY25dIGNodW5rLm1hdGNoXG4gICAgICAgICAgICBcbiAgICBpZiBjaHVuay5jbHNzLmVuZHNXaXRoICdmaWxlJ1xuICAgICAgICB3OCBjaHVuay5tYXRjaFxuICAgIGVsc2UgaWYgY2h1bmsuY2xzcy5lbmRzV2l0aCAnZXh0J1xuICAgICAgICB3MyBjaHVuay5tYXRjaFxuICAgIGVsc2UgaWYgY2h1bmsuY2xzcy5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgaWYgTEkudGVzdCBjaHVuay5jbHNzXG4gICAgICAgICAgICBrb2xvcml6ZSBtYXRjaDpjaHVuay5tYXRjaCwgY2xzczpjaHVuay5jbHNzLnJlcGxhY2UgTEksICcgJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB3MiBjaHVuay5tYXRjaFxuICAgIGVsc2VcbiAgICAgICAgaWYgTEkudGVzdCBjaHVuay5jbHNzXG4gICAgICAgICAgICBrb2xvcml6ZSBtYXRjaDpjaHVuay5tYXRjaCwgY2xzczpjaHVuay5jbHNzLnJlcGxhY2UgTEksICcgJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjaHVuay5tYXRjaFxuXG5rb2xvcml6ZUNodW5rcyA9IChjaHVua3M6W10sIG51bWJlcjopIC0+XG4gICAgXG4gICAgY2xyemQgPSAnJ1xuICAgIGlmIG51bWJlclxuICAgICAgICBudW1zdHIgPSBTdHJpbmcgbnVtYmVyXG4gICAgICAgIGNscnpkICs9IHcyKG51bXN0cikgKyBycGFkICcnLCA0LW51bXN0ci5sZW5ndGhcbiAgICAgICAgXG4gICAgYyA9IDBcbiAgICBmb3IgaSBpbiBbMC4uLmNodW5rcy5sZW5ndGhdXG4gICAgICAgIHdoaWxlIGMgPCBjaHVua3NbaV0uc3RhcnQgXG4gICAgICAgICAgICBjbHJ6ZCArPSAnICdcbiAgICAgICAgICAgIGMrK1xuICAgICAgICBjbHJ6ZCArPSBrb2xvcml6ZSBjaHVua3NbaV1cbiAgICAgICAgYyArPSBjaHVua3NbaV0ubGVuZ3RoXG4gICAgY2xyemRcbiAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAgIDAwMDAwICAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuXG5zeW50YXggPSAodGV4dDp0ZXh0LCBleHQ6J2NvZmZlZScsIG51bWJlcnM6ZmFsc2UpIC0+XG4gICAgXG4gICAgbGluZXMgPSB0ZXh0LnNwbGl0IE5FV0xJTkVcbiAgICBybmdzICA9IHBhcnNlKGxpbmVzLCBleHQpLm1hcCAobCkgLT4gbC5jaHVua3NcbiAgICBcbiAgICBjbGluZXMgPSBbXVxuICAgIGZvciBpbmRleCBpbiBbMC4uLmxpbmVzLmxlbmd0aF1cbiAgICAgICAgbGluZSA9IGxpbmVzW2luZGV4XVxuICAgICAgICBpZiBleHQgPT0gJ2pzJyBhbmQgbGluZS5zdGFydHNXaXRoICcvLyMgc291cmNlTWFwcGluZ1VSTCdcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGNsaW5lcy5wdXNoIGtvbG9yaXplQ2h1bmtzIGNodW5rczpybmdzW2luZGV4XSwgbnVtYmVyOm51bWJlcnMgYW5kIGluZGV4KzFcbiAgICBjbGluZXMuam9pbiAnXFxuJ1xuXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuXG4gICAga29sb3I6ICAgICAga29sb3JcbiAgICBleHRzOiAgICAgICBleHRzXG4gICAgcGFyc2U6ICAgICAgcGFyc2VcbiAgICBjaHVua2VkOiAgICBjaHVua2VkXG4gICAgcmFuZ2VzOiAgICAgKGxpbmUsIGV4dD0nY29mZmVlJykgIC0+IHBhcnNlKFtsaW5lXSwgZXh0KVswXS5jaHVua3NcbiAgICBkaXNzZWN0OiAgICAobGluZXMsIGV4dD0nY29mZmVlJykgLT4gcGFyc2UobGluZXMsIGV4dCkubWFwIChsKSAtPiBsLmNodW5rc1xuICAgIGtvbG9yaXplOiAgIGtvbG9yaXplXG4gICAga29sb3JpemVDaHVua3M6IGtvbG9yaXplQ2h1bmtzXG4gICAgc3ludGF4OiAgICAgc3ludGF4XG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbuKWuHRlc3QgJ3Byb2ZpbGUnXG5cbiAgICB7IHNsYXNoIH0gPSByZXF1aXJlICdreGsnXG4gICAgdGV4dDAgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvY29mZmVlL25vZGVzLmNvZmZlZVwiXG4gICAgdGV4dDEgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiXG5cbiAgICBsaW5lczAgPSB0ZXh0MC5zcGxpdCAnXFxuJ1xuICAgIGxpbmVzMSA9IHRleHQxLnNwbGl0ICdcXG4nXG5cbiAgICBmb3IgaSBpbiBbMC4uNV1cbiAgICAgICAgcGFyc2UgbGluZXMwXG5cbiAgICDilrhhdmVyYWdlIDEwMFxuICAgICAgICBwYXJzZSBsaW5lczBcbiJdfQ==
//# sourceURL=../coffee/klor.coffee