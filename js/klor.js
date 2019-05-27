// koffee 0.45.0

/*
000   000  000       0000000   00000000   
000  000   000      000   000  000   000  
0000000    000      000   000  0000000    
000  000   000      000   000  000   000  
000   000  0000000   0000000   000   000
 */
var FLOAT, HEADER, HEX, HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, actExt, addValue, addValues, blockComment, blocked, chunk, chunkIndex, chunked, codeTypes, coffeePunct, coffeeWord, commentHeader, cppMacro, cssWord, dashArrow, dict, escape, ext, extStack, extTop, fillComment, float, getChunk, getValue, getmatch, handl, handlers, hashComment, interpolation, j, jsPunct, jsWord, jsonPunct, jsonWord, k, keyword, klog, kstr, len, len1, line, mdPunct, noon, noonComment, noonProp, noonPunct, noonWord, notCode, number, obj, parse, popExt, popStack, property, pushExt, pushStack, ref, ref1, ref2, regexp, setValue, shPunct, simpleString, slash, slashComment, stack, stackTop, stacked, starComment, thisCall, topType, tripleRegexp, tripleString, urlPunct, urlWord, xmlPunct,
    indexOf = [].indexOf;

ref = require('kxk'), slash = ref.slash, kstr = ref.kstr, klog = ref.klog, noon = ref.noon, _ = ref._;

Syntax = require('./syntax');

Syntax.init();

Syntax.swtch = {
    coffee: {
        doc: {
            turd: '▸',
            to: 'md',
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

ref1 = Syntax.exts;
for (j = 0, len = ref1.length; j < len; j++) {
    ext = ref1[j];
    Syntax.swtch.md[ext] = {
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

codeTypes = ['interpolation', 'code triple'];

''

chunked = function(lines, ext) {
    var lineno;
    if (ext === 'koffee') {
        ext = 'coffee';
    }
    if (indexOf.call(Syntax.exts, ext) < 0) {
        ext = 'txt';
    }
    lineno = 0;
    return lines.map(function(text) {
        var advance, c, chunks, k, l, last, len1, line, m, pc, pi, punct, ref2, ref3, rl, s, sc, turd, value, w, wl;
        line = {
            chunks: [],
            chars: 0,
            index: lineno++,
            number: lineno,
            ext: ext
        };
        chunks = kstr.replaceTabs(text).split(SPACE);
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
                        if ((0xD800 <= (ref2 = punct.charCodeAt(pi)) && ref2 <= 0xDBFF) && (0xDC00 <= (ref3 = punct.charCodeAt(pi + 1)) && ref3 <= 0xDFFF)) {
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
                            value: value
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
    var c, i, k, len1, len2, mightBeHeader, p, q, ref2, restChunks;
    for (i = k = 0, ref2 = n; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
        addValue(i, 'comment');
    }
    if (chunkIndex < line.chunks.length - n) {
        restChunks = line.chunks.slice(chunkIndex + n);
        mightBeHeader = true;
        for (p = 0, len1 = restChunks.length; p < len1; p++) {
            c = restChunks[p];
            c.value = 'comment';
            if (mightBeHeader && !HEADER.test(c.match)) {
                mightBeHeader = false;
            }
        }
        if (mightBeHeader) {
            for (q = 0, len2 = restChunks.length; q < len2; q++) {
                c = restChunks[q];
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
    var ref2;
    if (stackTop) {
        return;
    }
    if ((ref2 = chunk.turd) != null ? ref2.startsWith("//") : void 0) {
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
    var markFunc, ref2;
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
            if (line.chunks[0].value === 'dictionary key' || ((ref2 = line.chunks[0].turd) != null ? ref2.slice(0, 2) : void 0) === '@:') {
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
    var next, prev, prevEnd, ref2, ref3, ref4;
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
        if (((ref2 = chunk.turd) != null ? ref2.startsWith('..') : void 0) && prev.match !== '.') {
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
                if (ref3 = chunk.match, indexOf.call('@[({"\'', ref3) >= 0) {
                    return thisCall();
                } else if (ref4 = chunk.match, indexOf.call('+-/', ref4) >= 0) {
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
    var prev, ref2;
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
        if ((ref2 = prev.match) === 'class' || ref2 === 'extends') {
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
    var prevPrev, ref2;
    if (notCode) {
        return;
    }
    if (getmatch(-1) === '.') {
        prevPrev = getChunk(-2);
        if ((prevPrev != null ? prevPrev.match : void 0) !== '.') {
            addValue(-1, 'property');
            setValue(0, 'property');
            if (prevPrev) {
                if (((ref2 = prevPrev.value) !== 'property' && ref2 !== 'number') && !prevPrev.value.startsWith('punct')) {
                    setValue(-2, 'obj');
                }
            }
            return 1;
        }
    }
};

noonProp = function() {
    var i, k, prev, ref2;
    if (prev = getChunk(-1)) {
        if (prev.start + prev.length + 1 < chunk.start) {
            if (prev.value !== 'obj') {
                for (i = k = ref2 = chunkIndex - 1; ref2 <= 0 ? k <= 0 : k >= 0; i = ref2 <= 0 ? ++k : --k) {
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
    var fileext, i, k, next, prev, ref2, ref3, ref4;
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
            if (!prev.value.startsWith('number') && prev.value !== 'semver' && (ref2 = prev.match, indexOf.call('\\./', ref2) < 0)) {
                if (next = getChunk(1)) {
                    if (next.start === chunk.start + chunk.length) {
                        fileext = next.match;
                        if (indexOf.call('\\./', fileext) < 0) {
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
            for (i = k = ref3 = chunkIndex; ref3 <= 0 ? k <= 0 : k >= 0; i = ref3 <= 0 ? ++k : --k) {
                if (line.chunks[i].start + line.chunks[i].length < ((ref4 = line.chunks[i + 1]) != null ? ref4.start : void 0)) {
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
    var next, prev, ref2, ref3;
    if (prev = getChunk(-1)) {
        if (ref2 = prev.match, indexOf.call('\\/', ref2) >= 0) {
            next = getChunk(1);
            if (!next || next.start > chunk.start + chunk.length || (ref3 = next.match, indexOf.call('\\./', ref3) < 0)) {
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
    var prev, ref2, ref3;
    if (notCode) {
        return;
    }
    if (chunk.match === ':' && !((ref2 = chunk.turd) != null ? ref2.startsWith('::') : void 0)) {
        if (prev = getChunk(-1)) {
            if ((ref3 = prev.value.split(' ')[0]) === 'string' || ref3 === 'number' || ref3 === 'text' || ref3 === 'keyword') {
                setValue(-1, 'dictionary key');
                setValue(0, 'punct dictionary');
                return 1;
            }
        }
    }
};

jsonPunct = function() {
    var i, k, prev, ref2;
    if (notCode) {
        return;
    }
    if (chunk.match === ':') {
        if (prev = getChunk(-1)) {
            if (prev.match === '"') {
                for (i = k = ref2 = chunkIndex - 2; ref2 <= 0 ? k <= 0 : k >= 0; i = ref2 <= 0 ? ++k : --k) {
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
    var prev, ref2, ref3;
    if (topType === 'string double' && (prev = getChunk(-1))) {
        if (ref2 = prev.match, indexOf.call('"^~', ref2) >= 0) {
            if (NUMBER.test(getmatch(0)) && getmatch(1) === '.' && NUMBER.test(getmatch(2)) && getmatch(3) === '.' && NUMBER.test(getmatch(4))) {
                if (ref3 = prev.match, indexOf.call('^~', ref3) >= 0) {
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
    var ref2, ref3;
    if (chunk.match === '\\' && ((topType != null ? topType.startsWith('regexp') : void 0) || (topType != null ? topType.startsWith('string') : void 0))) {
        if (chunkIndex === 0 || !((ref2 = getChunk(-1)) != null ? ref2.escape : void 0)) {
            if (((ref3 = getChunk(1)) != null ? ref3.start : void 0) === chunk.start + 1) {
                chunk.escape = true;
                addValue(0, 'escape');
                return stacked();
            }
        }
    }
};

regexp = function() {
    var next, prev, ref2, ref3;
    if (topType != null ? topType.startsWith('string') : void 0) {
        return;
    }
    if ((ref2 = getChunk(-1)) != null ? ref2.escape : void 0) {
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
            if (!prev.value.startsWith('punct') || (ref3 = prev.match, indexOf.call(")]", ref3) >= 0)) {
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
    var ref2, ref3, type;
    if (topType === 'regexp') {
        return;
    }
    if ((ref2 = getChunk(-1)) != null ? ref2.escape : void 0) {
        return stacked();
    }
    if (ref3 = chunk.match, indexOf.call('"\'', ref3) >= 0) {
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
    var ref2, type;
    if (!chunk.turd || chunk.turd.length < 3) {
        return;
    }
    if (topType === 'regexp' || topType === 'string single' || topType === 'string double') {
        return;
    }
    if ((ref2 = getChunk(-1)) != null ? ref2.escape : void 0) {
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
    var ref2;
    if (notCode) {
        return;
    }
    if (NUMBER.test(chunk.match)) {
        if (getmatch(-1) === '.') {
            if (getValue(-4) === 'number float' && getValue(-2) === 'number float') {
                if (ref2 = getmatch(-5), indexOf.call('^~', ref2) >= 0) {
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
    var prev, prevPrev, ref2, ref3, ref4;
    if (((ref2 = chunk.match.slice(-2)) === 'px' || ref2 === 'em' || ref2 === 'ex') && NUMBER.test(chunk.match.slice(0, -2))) {
        setValue(0, 'number');
        return 1;
    }
    if (((ref3 = chunk.match.slice(-1)) === 's') && NUMBER.test(chunk.match.slice(0, -1))) {
        setValue(0, 'number');
        return 1;
    }
    if (prev = getChunk(-1)) {
        if (prev.match === '.') {
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
    var ref2, ref3, ref4, ref5, ref6, type;
    if (chunkIndex === 0) {
        if (!chunk.turd && (ref2 = chunk.match, indexOf.call('-*', ref2) >= 0) && ((ref3 = getChunk(1)) != null ? ref3.start : void 0) > chunk.start + 1) {
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
        if (((ref4 = chunk.turd) != null ? ref4.slice(0, 2) : void 0) === '**') {
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
        if (((ref5 = chunk.turd) != null ? ref5.slice(0, 3) : void 0) === '```') {
            type = 'code triple';
            if ((ref6 = getmatch(3)) === 'coffeescript' || ref6 === 'javascript' || ref6 === 'js') {
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
    var ref2;
    if (topType === 'string double') {
        if ((ref2 = chunk.turd) != null ? ref2.startsWith("\#{") : void 0) {
            pushStack({
                type: 'interpolation',
                weak: true
            });
            return addValues(2, 'string interpolation start');
        }
    } else if (topType === 'interpolation') {
        if (chunk.match === '}') {
            addValue(0, 'string interpolation end');
            popStack();
            return 1;
        }
    }
};

keyword = function() {
    if (notCode) {
        return;
    }
    if (!Syntax.lang[ext]) {
        return;
    }
    if (Syntax.lang[ext].hasOwnProperty(chunk.match)) {
        chunk.value = Syntax.lang[ext][chunk.match];
    }
};

xmlPunct = function() {
    var ref2;
    if (chunk.turd === '</') {
        return addValues(2, 'keyword');
    }
    if ((ref2 = chunk.match) === '<' || ref2 === '>') {
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
    var ref2, ref3, ref4, ref5;
    if (chunk.match === '/' && ((ref2 = getChunk(-1)) != null ? ref2.start : void 0) + ((ref3 = getChunk(-1)) != null ? ref3.length : void 0) === chunk.start) {
        return addValue(-1, 'dir');
    }
    if (chunk.turd === '--' && ((ref4 = getChunk(2)) != null ? ref4.start : void 0) === chunk.start + 2) {
        addValue(0, 'argument');
        addValue(1, 'argument');
        setValue(2, 'argument');
        return 3;
    }
    if (chunk.match === '-' && ((ref5 = getChunk(1)) != null ? ref5.start : void 0) === chunk.start + 1) {
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
    var ref2;
    if ((0 <= (ref2 = chunkIndex + d) && ref2 < line.chunks.length)) {
        return line.chunks[chunkIndex + d].value = value;
    }
};

getValue = function(d) {
    var ref2, ref3;
    return (ref2 = (ref3 = getChunk(d)) != null ? ref3.value : void 0) != null ? ref2 : '';
};

getmatch = function(d) {
    var ref2, ref3;
    return (ref2 = (ref3 = getChunk(d)) != null ? ref3.match : void 0) != null ? ref2 : '';
};

addValue = function(d, value) {
    var ref2;
    if ((0 <= (ref2 = chunkIndex + d) && ref2 < line.chunks.length)) {
        line.chunks[chunkIndex + d].value += ' ' + value;
    }
    return 1;
};

addValues = function(n, value) {
    var i, k, ref2;
    for (i = k = 0, ref2 = n; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
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
        word: [keyword, number, float]
    },
    hpp: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float]
    },
    c: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float]
    },
    h: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float]
    },
    cs: {
        punct: [starComment, slashComment, simpleString],
        word: [keyword, number]
    },
    pug: {
        punct: [starComment, slashComment, simpleString],
        word: [keyword, number]
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

ref2 = Syntax.exts;
for (k = 0, len1 = ref2.length; k < len1; k++) {
    ext = ref2[k];
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
    var advance, beforeIndex, hnd, len2, len3, len4, len5, len6, mightBeHeader, mtch, p, q, r, ref10, ref11, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t, turdChunk, u;
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
    for (p = 0, len2 = lines.length; p < len2; p++) {
        line = lines[p];
        if (stackTop) {
            if (stackTop.type === 'comment triple') {
                mightBeHeader = true;
                ref3 = line.chunks;
                for (q = 0, len3 = ref3.length; q < len3; q++) {
                    chunk = ref3[q];
                    if (!HEADER.test(chunk.match)) {
                        mightBeHeader = false;
                        break;
                    }
                }
                if (mightBeHeader) {
                    ref4 = line.chunks;
                    for (r = 0, len4 = ref4.length; r < len4; r++) {
                        chunk = ref4[r];
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
            if (extTop["switch"].indent && ((ref5 = line.chunks[0]) != null ? ref5.start : void 0) <= extTop.start.chunks[0].start) {
                popExt();
            } else {
                line.ext = extTop["switch"].to;
            }
        }
        if (ext !== line.ext) {
            actExt();
            handl = handlers[ext = line.ext];
            if (!handl) {
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1071[39m', line);
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1072[39m', handlers);
            }
            if (!(handl)) {
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1073[39m', '[1m[97massertion failure![39m[22m');

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
                ref7 = (ref6 = handl.punct) != null ? ref6 : [];
                for (t = 0, len5 = ref7.length; t < len5; t++) {
                    hnd = ref7[t];
                    if (advance = hnd()) {
                        chunkIndex += advance;
                        break;
                    }
                }
            } else {
                if (!notCode) {
                    if (mtch = (ref8 = Syntax.swtch[line.ext]) != null ? ref8[chunk.match] : void 0) {
                        if (mtch.turd) {
                            turdChunk = getChunk(-mtch.turd.length);
                            if (mtch.turd === ((ref9 = turdChunk != null ? turdChunk.turd : void 0) != null ? ref9 : turdChunk != null ? turdChunk.match : void 0)) {
                                pushExt(mtch);
                            }
                        }
                    }
                }
                ref11 = (ref10 = handl.word) != null ? ref10 : [];
                for (u = 0, len6 = ref11.length; u < len6; u++) {
                    hnd = ref11[u];
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

parse = function(lines, ext) {
    if (ext == null) {
        ext = 'coffee';
    }
    return blocked(chunked(lines, ext));
};

module.exports = {
    kolor: require('./kolor'),
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
    exts: Syntax.exts
};

;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2xvci5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsNHZCQUFBO0lBQUE7O0FBUUEsTUFBaUMsT0FBQSxDQUFRLEtBQVIsQ0FBakMsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCOztBQUUzQixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBQTs7QUFFQSxNQUFNLENBQUMsS0FBUCxHQUNJO0lBQUEsTUFBQSxFQUNJO1FBQUEsR0FBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEdBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUFvQixNQUFBLEVBQVEsQ0FBNUI7U0FBZDtLQURKO0lBRUEsRUFBQSxFQUNJO1FBQUEsWUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsUUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7WUFBaUMsR0FBQSxFQUFJLGFBQXJDO1NBQWQ7UUFDQSxVQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxJQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtZQUFpQyxHQUFBLEVBQUksYUFBckM7U0FEZDtLQUhKOzs7QUFNSjtBQUFBLEtBQUEsc0NBQUE7O0lBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFHLENBQUEsR0FBQSxDQUFoQixHQUF1QjtRQUFBLElBQUEsRUFBSyxLQUFMO1FBQVcsRUFBQSxFQUFHLEdBQWQ7UUFBbUIsR0FBQSxFQUFJLEtBQXZCO1FBQTZCLEdBQUEsRUFBSSxhQUFqQzs7QUFEM0I7O0FBR0EsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQUNULEtBQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsR0FBQSxHQUFTOztBQUVULFNBQUEsR0FBWSxDQUFDLGVBQUQsRUFBaUIsYUFBakI7O0FBTWlFOztBQXFCN0UsT0FBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFFTixRQUFBO0lBQUEsSUFBa0IsR0FBQSxLQUFPLFFBQXpCO1FBQUEsR0FBQSxHQUFNLFNBQU47O0lBQ0EsSUFBZSxhQUFXLE1BQU0sQ0FBQyxJQUFsQixFQUFBLEdBQUEsS0FBZjtRQUFBLEdBQUEsR0FBTSxNQUFOOztJQUVBLE1BQUEsR0FBUztXQUNULEtBQUssQ0FBQyxHQUFOLENBQVUsU0FBQyxJQUFEO0FBRU4sWUFBQTtRQUFBLElBQUEsR0FDSTtZQUFBLE1BQUEsRUFBUSxFQUFSO1lBQ0EsS0FBQSxFQUFRLENBRFI7WUFFQSxLQUFBLEVBQVEsTUFBQSxFQUZSO1lBR0EsTUFBQSxFQUFRLE1BSFI7WUFJQSxHQUFBLEVBQVEsR0FKUjs7UUFNSixNQUFBLEdBQVMsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBakIsQ0FBc0IsQ0FBQyxLQUF2QixDQUE2QixLQUE3QjtRQUVULElBQUcsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBakIsSUFBdUIsTUFBTyxDQUFBLENBQUEsQ0FBUCxLQUFhLEVBQXZDO0FBQ0ksbUJBQU8sS0FEWDs7UUFHQSxDQUFBLEdBQUk7QUFDSixhQUFBLDBDQUFBOztZQUNJLElBQUcsQ0FBQSxLQUFLLEVBQVI7Z0JBQ0ksQ0FBQSxHQURKO2FBQUEsTUFBQTtnQkFHSSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBZjtvQkFBMkIsQ0FBQSxHQUEzQjs7Z0JBQ0EsQ0FBQSxHQUFJLENBQUMsQ0FBQztnQkFDTixFQUFBLEdBQUs7QUFJTCx1QkFBTSxDQUFBLEdBQUksS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQVY7b0JBRUksSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLENBQWI7d0JBQ0ksRUFBQSxHQUFLLENBQUMsQ0FBQyxLQUFGLEdBQVEsQ0FBQyxDQUFBLEdBQUUsRUFBSDt3QkFDYixDQUFBLEdBQUksQ0FBRTt3QkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLElBQVosQ0FBaUI7NEJBQUEsS0FBQSxFQUFNLENBQU47NEJBQVMsTUFBQSxFQUFPLEVBQWhCOzRCQUFvQixLQUFBLEVBQU0sQ0FBMUI7NEJBQTZCLEtBQUEsRUFBTSxNQUFuQzt5QkFBakI7d0JBQ0EsQ0FBQSxJQUFLLEdBSlQ7O29CQU1BLElBQUEsR0FBTyxLQUFBLEdBQVEsQ0FBRSxDQUFBLENBQUE7b0JBRWpCLEVBQUEsR0FBSztvQkFDTCxPQUFBLEdBQVU7b0JBQ1YsS0FBQSxHQUFRO0FBQ1IsMkJBQU0sRUFBQSxHQUFLLEtBQUssQ0FBQyxNQUFOLEdBQWEsQ0FBeEI7d0JBQ0ksRUFBQSxHQUFLLEtBQU0sQ0FBQSxFQUFBO3dCQUNYLE9BQUEsR0FBVTt3QkFDVixJQUFHLENBQUEsTUFBQSxZQUFVLEtBQUssQ0FBQyxVQUFOLENBQWlCLEVBQWpCLEVBQVYsUUFBQSxJQUFrQyxNQUFsQyxDQUFBLElBQTZDLENBQUEsTUFBQSxZQUFVLEtBQUssQ0FBQyxVQUFOLENBQWlCLEVBQUEsR0FBRyxDQUFwQixFQUFWLFFBQUEsSUFBb0MsTUFBcEMsQ0FBaEQ7NEJBQ0ksT0FBQSxHQUFVOzRCQUNWLEtBQUEsR0FBUTs0QkFDUixFQUFBLElBQU0sS0FBTSxDQUFBLEVBQUEsR0FBRyxDQUFILEVBSGhCO3lCQUFBLE1BQUE7NEJBS0ksS0FBQSxHQUFRLFFBTFo7O3dCQU1BLEVBQUEsSUFBTTt3QkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLElBQVosQ0FBaUI7NEJBQUEsS0FBQSxFQUFNLENBQU47NEJBQVMsTUFBQSxFQUFPLE9BQWhCOzRCQUF5QixLQUFBLEVBQU0sRUFBL0I7NEJBQW1DLElBQUEsRUFBSyxJQUF4Qzs0QkFBOEMsS0FBQSxFQUFNLEtBQXBEO3lCQUFqQjt3QkFDQSxDQUFBLElBQUs7d0JBQ0wsSUFBQSxHQUFPLElBQUs7b0JBWmhCO29CQWNBLElBQUcsRUFBQSxHQUFLLEtBQUssQ0FBQyxNQUFkO3dCQUNJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBWixDQUFpQjs0QkFBQSxLQUFBLEVBQU0sQ0FBTjs0QkFBUyxNQUFBLEVBQU8sT0FBaEI7NEJBQXlCLEtBQUEsRUFBTSxLQUFNLFVBQXJDOzRCQUE0QyxLQUFBLEVBQU0sS0FBbEQ7eUJBQWpCO3dCQUNBLENBQUEsSUFBSyxRQUZUOztnQkEzQko7Z0JBK0JBLElBQUcsQ0FBQSxHQUFJLEVBQUEsR0FBRyxDQUFWO29CQUNJLEVBQUEsR0FBSyxFQUFBLEdBQUcsQ0FBSCxHQUFLO29CQUNWLENBQUEsR0FBSSxDQUFFO29CQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBWixDQUFpQjt3QkFBQSxLQUFBLEVBQU0sQ0FBTjt3QkFBUyxNQUFBLEVBQU8sRUFBaEI7d0JBQW9CLEtBQUEsRUFBTSxDQUExQjt3QkFBNkIsS0FBQSxFQUFNLE1BQW5DO3FCQUFqQjtvQkFDQSxDQUFBLElBQUssR0FKVDtpQkF4Q0o7O0FBREo7UUErQ0EsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQWY7WUFDSSxJQUFBLEdBQU8sSUFBSSxDQUFDLE1BQU8sVUFBRSxDQUFBLENBQUE7WUFDckIsSUFBSSxDQUFDLEtBQUwsR0FBYSxJQUFJLENBQUMsS0FBTCxHQUFhLElBQUksQ0FBQyxPQUZuQzs7ZUFJQTtJQWxFTSxDQUFWO0FBTk07OztBQTBFVjs7Ozs7Ozs7QUFRQSxRQUFBLEdBQWE7O0FBQ2IsS0FBQSxHQUFhOztBQUNiLEtBQUEsR0FBYTs7QUFDYixNQUFBLEdBQWE7O0FBQ2IsUUFBQSxHQUFhOztBQUNiLE9BQUEsR0FBYTs7QUFDYixPQUFBLEdBQWE7O0FBQ2IsR0FBQSxHQUFhOztBQUNiLElBQUEsR0FBYTs7QUFDYixLQUFBLEdBQWE7O0FBQ2IsVUFBQSxHQUFhOztBQVFiLFdBQUEsR0FBYyxTQUFDLENBQUQ7QUFFVixRQUFBO0FBQUEsU0FBUywrRUFBVDtRQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksU0FBWjtBQURKO0lBRUEsSUFBRyxVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFaLEdBQW1CLENBQW5DO1FBQ0ksVUFBQSxHQUFhLElBQUksQ0FBQyxNQUFPO1FBQ3pCLGFBQUEsR0FBZ0I7QUFDaEIsYUFBQSw4Q0FBQTs7WUFDSSxDQUFDLENBQUMsS0FBRixHQUFVO1lBQ1YsSUFBRyxhQUFBLElBQWtCLENBQUksTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFDLENBQUMsS0FBZCxDQUF6QjtnQkFDSSxhQUFBLEdBQWdCLE1BRHBCOztBQUZKO1FBSUEsSUFBRyxhQUFIO0FBQ0ksaUJBQUEsOENBQUE7O2dCQUNJLENBQUMsQ0FBQyxLQUFGLElBQVc7QUFEZixhQURKO1NBUEo7O1dBVUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFaLEdBQXFCLFVBQXJCLEdBQWtDO0FBZHhCOztBQWdCZCxXQUFBLEdBQWMsU0FBQTtJQUVWLElBQVUsUUFBQSxJQUFhLE9BQUEsS0FBVyxlQUFsQztBQUFBLGVBQUE7O0lBQ0EsSUFBRyxRQUFBLElBQWEsUUFBUSxDQUFDLE1BQVQsS0FBbUIsSUFBSSxDQUFDLE1BQXhDO0FBQ0ksZUFESjs7SUFHQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsR0FBbEI7ZUFDSSxXQUFBLENBQVksQ0FBWixFQURKOztBQU5VOztBQVNkLFdBQUEsR0FBYyxTQUFBO0lBRVYsSUFBVSxRQUFWO0FBQUEsZUFBQTs7SUFFQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsR0FBZixJQUF1QixVQUFBLEtBQWMsQ0FBeEM7ZUFDSSxXQUFBLENBQVksQ0FBWixFQURKOztBQUpVOztBQU9kLFlBQUEsR0FBZSxTQUFBO0FBRVgsUUFBQTtJQUFBLElBQVUsUUFBVjtBQUFBLGVBQUE7O0lBRUEsc0NBQWEsQ0FBRSxVQUFaLENBQXVCLElBQXZCLFVBQUg7ZUFDSSxXQUFBLENBQVksQ0FBWixFQURKOztBQUpXOztBQU9mLFlBQUEsR0FBZSxTQUFBO0FBRVgsUUFBQTtJQUFBLElBQVUsQ0FBSSxLQUFLLENBQUMsSUFBVixJQUFrQixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQVgsR0FBb0IsQ0FBaEQ7QUFBQSxlQUFBOztJQUVBLElBQUEsR0FBTztJQUVQLElBQVUsT0FBQSxJQUFZLENBQUEsT0FBQSxLQUFnQixlQUFoQixJQUFBLE9BQUEsS0FBaUMsSUFBakMsQ0FBdEI7QUFBQSxlQUFBOztJQUVBLElBQUcsS0FBSyxDQUFDLElBQUssWUFBWCxLQUFtQixLQUF0QjtRQUNJLElBQUcsT0FBQSxLQUFXLElBQWQ7WUFDSSxRQUFBLENBQUEsRUFESjtTQUFBLE1BQUE7WUFHSSxTQUFBLENBQVU7Z0JBQUEsSUFBQSxFQUFLLElBQUw7Z0JBQVcsTUFBQSxFQUFPLElBQWxCO2FBQVYsRUFISjs7QUFJQSxlQUFPLFNBQUEsQ0FBVSxDQUFWLEVBQVksSUFBWixFQUxYOztBQVJXOztBQWVmLFdBQUEsR0FBYyxTQUFBO0FBRVYsUUFBQTtJQUFBLElBQVUsQ0FBSSxLQUFLLENBQUMsSUFBcEI7QUFBQSxlQUFBOztJQUVBLElBQUEsR0FBTztJQUVQLElBQVUsT0FBQSxJQUFZLE9BQUEsS0FBVyxJQUFqQztBQUFBLGVBQUE7O0lBRUEsSUFBRyxLQUFLLENBQUMsSUFBSyxZQUFYLEtBQW1CLElBQW5CLElBQTRCLENBQUksT0FBbkM7UUFDSSxTQUFBLENBQVU7WUFBQSxJQUFBLEVBQUssSUFBTDtZQUFXLE1BQUEsRUFBTyxJQUFsQjtTQUFWO0FBQ0EsZUFBTyxTQUFBLENBQVUsQ0FBVixFQUFZLElBQVosRUFGWDs7SUFHQSxJQUFHLEtBQUssQ0FBQyxJQUFLLFlBQVgsS0FBbUIsSUFBbkIsSUFBNEIsT0FBQSxLQUFXLElBQTFDO1FBQ0ksUUFBQSxDQUFBO0FBQ0EsZUFBTyxTQUFBLENBQVUsQ0FBVixFQUFZLElBQVosRUFGWDs7QUFYVTs7QUFxQmQsU0FBQSxHQUFZLFNBQUE7QUFFUixRQUFBO0lBQUEsSUFBVSxPQUFWO0FBQUEsZUFBQTs7SUFFQSxRQUFBLEdBQVcsU0FBQTtRQUNQLElBQUcsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEtBQXdCLE1BQTNCO1lBQ0ksSUFBRyxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsS0FBd0IsR0FBeEIsSUFBZ0MsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEtBQXdCLEdBQTNEO2dCQUNJLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUF1Qjt1QkFDdkIsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLElBQXdCLFlBRjVCO2FBQUEsTUFHSyxJQUFHLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixLQUF3QixHQUEzQjtnQkFDRCxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsR0FBdUI7dUJBQ3ZCLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixJQUF3QixVQUZ2QjthQUpUOztJQURPO0lBU1gsSUFBRyxLQUFLLENBQUMsSUFBVDtRQUVJLElBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFYLENBQXNCLElBQXRCLENBQUg7WUFDSSxRQUFBLENBQUE7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFXLGVBQVg7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFXLGVBQVg7WUFDQSxJQUFHLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixLQUF3QixnQkFBeEIsZ0RBQWlFLHNCQUFyQixLQUE2QixJQUE1RTtnQkFDSSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsR0FBdUI7Z0JBQ3ZCLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUF1QixlQUYzQjthQUFBLE1BR0ssSUFBRyxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsS0FBd0IsR0FBeEIsSUFBZ0MsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEtBQXdCLGdCQUEzRDtnQkFDRCxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsR0FBdUI7Z0JBQ3ZCLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUF1QjtnQkFDdkIsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEdBQXVCLHFCQUh0Qjs7QUFJTCxtQkFBTyxFQVhYOztRQWFBLElBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFYLENBQXNCLElBQXRCLENBQUg7WUFDSSxRQUFBLENBQUE7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFXLHFCQUFYO1lBQ0EsUUFBQSxDQUFTLENBQVQsRUFBVyxxQkFBWDtZQUNBLElBQUcsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEtBQXdCLGdCQUEzQjtnQkFDSSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsR0FBdUI7Z0JBQ3ZCLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUF1QixlQUYzQjs7QUFHQSxtQkFBTyxFQVBYO1NBZko7O0FBYlE7O0FBcUNaLGFBQUEsR0FBZ0IsU0FBQTtJQUVaLElBQUcsT0FBQSxLQUFXLGdCQUFkO1FBQ0ksSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQUssQ0FBQyxLQUFsQixDQUFIO1lBQ0ksS0FBSyxDQUFDLEtBQU4sR0FBYztBQUNkLG1CQUFPLEVBRlg7U0FESjs7QUFGWTs7QUFhaEIsUUFBQSxHQUFXLFNBQUE7SUFFUCxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksZUFBWjtJQUNBLElBQUcsUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFBLEtBQWdCLEdBQW5CO1FBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFZLHFCQUFaLEVBREo7O1dBRUE7QUFMTzs7QUFPWCxXQUFBLEdBQWMsU0FBQTtBQUVWLFFBQUE7SUFBQSxJQUFVLE9BQVY7QUFBQSxlQUFBOztJQUVBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFsQjtBQUNJLGVBQU8sUUFBQSxDQUFTLENBQVQsRUFBVyxNQUFYLEVBRFg7O0lBR0EsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLElBQWpCO0FBQ0ksZUFBTyxTQUFBLENBQVUsQ0FBVixFQUFZLE1BQVosRUFEWDs7SUFHQSxJQUFHLElBQUEsR0FBTyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQVY7UUFFSSx1Q0FBYSxDQUFFLFVBQVosQ0FBdUIsSUFBdkIsV0FBQSxJQUFpQyxJQUFJLENBQUMsS0FBTCxLQUFjLEdBQWxEO1lBQ0ksSUFBRyxLQUFLLENBQUMsSUFBSyxDQUFBLENBQUEsQ0FBWCxLQUFpQixHQUFwQjtBQUNJLHVCQUFPLFNBQUEsQ0FBVSxDQUFWLEVBQVksT0FBWixFQURYOztZQUVBLElBQUcsS0FBSyxDQUFDLElBQUssQ0FBQSxDQUFBLENBQVgsS0FBaUIsR0FBcEI7QUFDSSx1QkFBTyxTQUFBLENBQVUsQ0FBVixFQUFZLE9BQVosRUFEWDthQUhKOztRQU1BLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFYLENBQXNCLE1BQXRCLENBQUEsSUFBaUMsSUFBSSxDQUFDLEtBQUwsS0FBYyxVQUFsRDtZQUVJLE9BQUEsR0FBVSxJQUFJLENBQUMsS0FBTCxHQUFXLElBQUksQ0FBQztZQUMxQixJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsR0FBZixJQUF1QixPQUFBLEtBQVcsS0FBSyxDQUFDLEtBQTNDO0FBQ0ksdUJBQU8sUUFBQSxDQUFBLEVBRFg7YUFBQSxNQUVLLElBQUcsT0FBQSxHQUFVLEtBQUssQ0FBQyxLQUFuQjtnQkFDRCxXQUFHLEtBQUssQ0FBQyxLQUFOLEVBQUEsYUFBZSxTQUFmLEVBQUEsSUFBQSxNQUFIO0FBQ0ksMkJBQU8sUUFBQSxDQUFBLEVBRFg7aUJBQUEsTUFFSyxXQUFHLEtBQUssQ0FBQyxLQUFOLEVBQUEsYUFBZSxLQUFmLEVBQUEsSUFBQSxNQUFIO29CQUNELElBQUEsR0FBTyxRQUFBLENBQVMsQ0FBVDtvQkFDUCxJQUFHLENBQUksSUFBSixJQUFZLElBQUksQ0FBQyxLQUFMLEtBQWMsR0FBZCxJQUFzQixJQUFJLENBQUMsS0FBTCxLQUFjLEtBQUssQ0FBQyxLQUFOLEdBQVksQ0FBL0Q7QUFDSSwrQkFBTyxRQUFBLENBQUEsRUFEWDtxQkFGQztpQkFISjthQUxUO1NBUko7O0FBVlU7O0FBK0JkLFVBQUEsR0FBYSxTQUFBO0FBRVQsUUFBQTtJQUFBLElBQVUsT0FBVjtBQUFBLGVBQUE7O0lBRUEsSUFBRyxJQUFBLEdBQU8sUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFWO1FBRUksSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLFlBQWpCO1lBQ0ksSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLElBQUksQ0FBQyxLQUFMLEdBQVcsQ0FBN0I7Z0JBQ0ksUUFBQSxDQUFTLENBQVQsRUFBVyxNQUFYO0FBQ0EsdUJBQU8sRUFGWDthQURKOztRQUtBLFlBQUcsSUFBSSxDQUFDLE1BQUwsS0FBZSxPQUFmLElBQUEsSUFBQSxLQUF3QixTQUEzQjtZQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVcsT0FBWDtBQUNBLG1CQUFPLEVBRlg7O1FBSUEsSUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVosQ0FBdUIsU0FBdkIsQ0FBSDtBQUVJLG1CQUFPLEVBRlg7O1FBSUEsSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLEdBQWpCO1lBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFZLE1BQVo7WUFDQSxRQUFBLENBQVUsQ0FBVixFQUFZLE1BQVo7QUFDQSxtQkFBTyxFQUhYOztRQUtBLElBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVgsQ0FBc0IsTUFBdEIsQ0FBQSxJQUFpQyxJQUFJLENBQUMsS0FBTCxLQUFjLFVBQWhELENBQUEsSUFBZ0UsSUFBSSxDQUFDLEtBQUwsR0FBVyxJQUFJLENBQUMsTUFBaEIsR0FBeUIsS0FBSyxDQUFDLEtBQWxHO0FBQ0ksbUJBQU8sUUFBQSxDQUFBLEVBRFg7U0FwQko7O0FBSlM7O0FBMkJiLFFBQUEsR0FBVyxTQUFBO0FBRVAsUUFBQTtJQUFBLElBQVUsT0FBVjtBQUFBLGVBQUE7O0lBRUEsSUFBRyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQUEsS0FBZ0IsR0FBbkI7UUFFSSxRQUFBLEdBQVcsUUFBQSxDQUFTLENBQUMsQ0FBVjtRQUVYLHdCQUFHLFFBQVEsQ0FBRSxlQUFWLEtBQW1CLEdBQXRCO1lBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFZLFVBQVo7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFXLFVBQVg7WUFDQSxJQUFHLFFBQUg7Z0JBQ0ksSUFBRyxTQUFBLFFBQVEsQ0FBQyxNQUFULEtBQXVCLFVBQXZCLElBQUEsSUFBQSxLQUFtQyxRQUFuQyxDQUFBLElBQWlELENBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFmLENBQTBCLE9BQTFCLENBQXhEO29CQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBWSxLQUFaLEVBREo7aUJBREo7O0FBR0EsbUJBQU8sRUFOWDtTQUpKOztBQUpPOztBQXNCWCxRQUFBLEdBQVcsU0FBQTtBQUVQLFFBQUE7SUFBQSxJQUFHLElBQUEsR0FBTyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQVY7UUFDSSxJQUFHLElBQUksQ0FBQyxLQUFMLEdBQVcsSUFBSSxDQUFDLE1BQWhCLEdBQXVCLENBQXZCLEdBQTJCLEtBQUssQ0FBQyxLQUFwQztZQUNJLElBQUcsSUFBSSxDQUFDLEtBQUwsS0FBYyxLQUFqQjtBQUNJLHFCQUFTLHFGQUFUO29CQUNJLElBQUcsQ0FBQSxHQUFJLFVBQUEsR0FBVyxDQUFmLElBQXFCLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUFxQixJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXBDLEdBQTJDLENBQTNDLEdBQStDLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBSSxDQUFDLEtBQXhGO0FBQ0ksOEJBREo7O29CQUVBLElBQUcsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEtBQXdCLE1BQXhCLElBQWtDLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixLQUF3QixLQUE3RDt3QkFDSSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsR0FBdUIsV0FEM0I7cUJBQUEsTUFFSyxJQUFHLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixLQUF3QixPQUEzQjt3QkFDRCxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsR0FBdUIsaUJBRHRCO3FCQUFBLE1BQUE7QUFHRCw4QkFIQzs7QUFMVCxpQkFESjthQURKO1NBREo7O1dBWUE7QUFkTzs7QUFnQlgsU0FBQSxHQUFZLFNBQUE7SUFFUixJQUFVLE9BQVY7QUFBQSxlQUFBOztXQUVBLFFBQUEsQ0FBQTtBQUpROztBQU1aLFFBQUEsR0FBVyxTQUFBO0lBRVAsSUFBVSxPQUFWO0FBQUEsZUFBQTs7SUFFQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsQ0FBbEI7UUFDSSxRQUFBLENBQVMsQ0FBVCxFQUFXLEtBQVg7QUFDQSxlQUFPLEVBRlg7O1dBSUEsUUFBQSxDQUFBO0FBUk87O0FBZ0JYLFFBQUEsR0FBVyxTQUFBO0FBRVAsUUFBQTtJQUFBLElBQUcsSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBVjtRQUNJLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxLQUFqQjtZQUNJLElBQUcsUUFBQSxDQUFTLENBQVQsQ0FBQSxLQUFlLEdBQWYsSUFBdUIsUUFBQSxDQUFTLENBQVQsQ0FBMUI7Z0JBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFZLGNBQVo7Z0JBQ0EsU0FBQSxDQUFVLENBQVYsRUFBWSxLQUFaO2dCQUNBLFFBQUEsQ0FBVSxDQUFWLEVBQVksWUFBWjtnQkFDQSxRQUFBLENBQVUsQ0FBVixFQUFZLGVBQVo7Z0JBQ0EsUUFBQSxDQUFVLENBQVYsRUFBWSxTQUFaO0FBRUEsdUJBQU8sRUFQWDthQURKOztRQVVBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFsQjtZQUNJLElBQUcsQ0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVgsQ0FBc0IsUUFBdEIsQ0FBSixJQUF3QyxJQUFJLENBQUMsS0FBTCxLQUFjLFFBQXRELElBQW1FLFFBQUEsSUFBSSxDQUFDLEtBQUwsRUFBQSxhQUFrQixNQUFsQixFQUFBLElBQUEsS0FBQSxDQUF0RTtnQkFDSSxJQUFHLElBQUEsR0FBTyxRQUFBLENBQVMsQ0FBVCxDQUFWO29CQUNJLElBQUcsSUFBSSxDQUFDLEtBQUwsS0FBYyxLQUFLLENBQUMsS0FBTixHQUFZLEtBQUssQ0FBQyxNQUFuQzt3QkFDSSxPQUFBLEdBQVUsSUFBSSxDQUFDO3dCQUNmLElBQUcsYUFBZSxNQUFmLEVBQUEsT0FBQSxLQUFIOzRCQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBWSxPQUFBLEdBQVUsT0FBdEI7NEJBQ0EsUUFBQSxDQUFVLENBQVYsRUFBWSxPQUFaOzRCQUNBLFFBQUEsQ0FBVSxDQUFWLEVBQVksT0FBQSxHQUFVLE1BQXRCO0FBQ0EsbUNBQU8sRUFKWDt5QkFGSjtxQkFESjtpQkFESjthQURKOztRQVdBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFsQjtBQUVJLGlCQUFTLGlGQUFUO2dCQUNJLElBQVMsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEdBQXFCLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBcEMsOENBQTZELENBQUUsZUFBeEU7QUFBQSwwQkFBQTs7Z0JBQ0EsSUFBUyxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQUssQ0FBQyxRQUFyQixDQUE4QixLQUE5QixDQUFUO0FBQUEsMEJBQUE7O2dCQUNBLElBQVMsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFLLENBQUMsVUFBckIsQ0FBZ0MsS0FBaEMsQ0FBVDtBQUFBLDBCQUFBOztnQkFDQSxJQUFTLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixLQUF3QixHQUFqQztBQUFBLDBCQUFBOztnQkFDQSxJQUFHLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBSyxDQUFDLFVBQXJCLENBQWdDLE9BQWhDLENBQUg7b0JBQ0ksSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEdBQXVCLFlBRDNCO2lCQUFBLE1BQUE7b0JBR0ksSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEdBQXVCLFdBSDNCOztBQUxKO0FBVUEsbUJBQU8sRUFaWDtTQXRCSjs7V0FtQ0E7QUFyQ087O0FBdUNYLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLElBQUcsSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBVjtRQUNJLFdBQUcsSUFBSSxDQUFDLEtBQUwsRUFBQSxhQUFjLEtBQWQsRUFBQSxJQUFBLE1BQUg7WUFDSSxJQUFBLEdBQU8sUUFBQSxDQUFTLENBQVQ7WUFDUCxJQUFHLENBQUksSUFBSixJQUFZLElBQUksQ0FBQyxLQUFMLEdBQWEsS0FBSyxDQUFDLEtBQU4sR0FBWSxLQUFLLENBQUMsTUFBM0MsSUFBcUQsUUFBQSxJQUFJLENBQUMsS0FBTCxFQUFBLGFBQWtCLE1BQWxCLEVBQUEsSUFBQSxLQUFBLENBQXhEO3VCQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksTUFBWixFQURKO2FBRko7U0FESjs7QUFGTTs7QUFjVixPQUFBLEdBQVUsU0FBQTtBQUVOLFFBQUE7SUFBQSxJQUFVLE9BQVY7QUFBQSxlQUFBOztJQUVBLElBQUcsSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBVjtRQUNJLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFsQjtZQUNJLElBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFYLENBQXNCLE1BQXRCLENBQUEsSUFBaUMsSUFBSSxDQUFDLEtBQUwsS0FBYyxVQUFsRDtnQkFDSSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksZUFBWjtBQUNBLHVCQUFPLEVBRlg7YUFESjtTQURKOztBQUpNOztBQVVWLE1BQUEsR0FBUyxTQUFBO0lBRUwsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLGtCQUFsQjtRQUNJLElBQUcsUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFBLEtBQWdCLEdBQWhCLElBQXdCLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBWSxDQUFDLFVBQWIsQ0FBd0IsTUFBeEIsQ0FBM0I7WUFDSSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksVUFBWixFQURKO1NBREo7O1dBR0E7QUFMSzs7QUFPVCxJQUFBLEdBQU8sU0FBQTtBQUVILFFBQUE7SUFBQSxJQUFVLE9BQVY7QUFBQSxlQUFBOztJQUVBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFmLElBQXVCLG9DQUFjLENBQUUsVUFBWixDQUF1QixJQUF2QixXQUE5QjtRQUNJLElBQUcsSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBVjtZQUNJLFlBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFYLENBQWlCLEdBQWpCLENBQXNCLENBQUEsQ0FBQSxFQUF0QixLQUE2QixRQUE3QixJQUFBLElBQUEsS0FBdUMsUUFBdkMsSUFBQSxJQUFBLEtBQWlELE1BQWpELElBQUEsSUFBQSxLQUF5RCxTQUE1RDtnQkFDSSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksZ0JBQVo7Z0JBQ0EsUUFBQSxDQUFVLENBQVYsRUFBWSxrQkFBWjtBQUNBLHVCQUFPLEVBSFg7YUFESjtTQURKOztBQUpHOztBQWlCUCxTQUFBLEdBQVksU0FBQTtBQUVSLFFBQUE7SUFBQSxJQUFVLE9BQVY7QUFBQSxlQUFBOztJQUVBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFsQjtRQUNJLElBQUcsSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBVjtZQUNJLElBQUcsSUFBSSxDQUFDLEtBQUwsS0FBYyxHQUFqQjtBQUNJLHFCQUFTLHFGQUFUO29CQUNJLElBQUcsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEtBQXdCLHFCQUEzQjt3QkFDSSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsR0FBdUI7QUFDdkIsOEJBRko7O29CQUdBLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUF1QjtBQUozQjtnQkFLQSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksa0JBQVo7Z0JBQ0EsUUFBQSxDQUFVLENBQVYsRUFBWSxrQkFBWjtBQUNBLHVCQUFPLEVBUlg7YUFESjtTQURKOztBQUpROztBQWdCWixRQUFBLEdBQVcsU0FBQTtBQUVQLFFBQUE7SUFBQSxJQUFHLE9BQUEsS0FBVyxlQUFYLElBQStCLENBQUEsSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBUCxDQUFsQztRQUNJLFdBQUcsSUFBSSxDQUFDLEtBQUwsRUFBQSxhQUFjLEtBQWQsRUFBQSxJQUFBLE1BQUg7WUFDSSxJQUFHLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBQSxDQUFTLENBQVQsQ0FBWixDQUFBLElBQTZCLFFBQUEsQ0FBUyxDQUFULENBQUEsS0FBZSxHQUE1QyxJQUFvRCxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQUEsQ0FBUyxDQUFULENBQVosQ0FBcEQsSUFBaUYsUUFBQSxDQUFTLENBQVQsQ0FBQSxLQUFlLEdBQWhHLElBQXdHLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBQSxDQUFTLENBQVQsQ0FBWixDQUEzRztnQkFDSSxXQUE4QixJQUFJLENBQUMsS0FBTCxFQUFBLGFBQWMsSUFBZCxFQUFBLElBQUEsTUFBOUI7b0JBQUEsUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFZLGNBQVosRUFBQTs7Z0JBQ0EsUUFBQSxDQUFTLENBQVQsRUFBVyxRQUFYO2dCQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVcsY0FBWDtnQkFDQSxRQUFBLENBQVMsQ0FBVCxFQUFXLFFBQVg7Z0JBQ0EsUUFBQSxDQUFTLENBQVQsRUFBVyxjQUFYO2dCQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVcsUUFBWDtBQUNBLHVCQUFPLEVBUFg7YUFESjtTQURKOztBQUZPOztBQW1CWCxNQUFBLEdBQVMsU0FBQTtBQUVMLFFBQUE7SUFBQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsSUFBZixJQUF3QixvQkFBQyxPQUFPLENBQUUsVUFBVCxDQUFvQixRQUFwQixXQUFBLHVCQUFpQyxPQUFPLENBQUUsVUFBVCxDQUFvQixRQUFwQixXQUFsQyxDQUEzQjtRQUNJLElBQUcsVUFBQSxLQUFjLENBQWQsSUFBbUIsc0NBQWdCLENBQUUsZ0JBQXhDO1lBQ0ksd0NBQWMsQ0FBRSxlQUFiLEtBQXNCLEtBQUssQ0FBQyxLQUFOLEdBQVksQ0FBckM7Z0JBQ0ksS0FBSyxDQUFDLE1BQU4sR0FBZTtnQkFDZixRQUFBLENBQVMsQ0FBVCxFQUFXLFFBQVg7QUFDQSx1QkFBTyxPQUFBLENBQUEsRUFIWDthQURKO1NBREo7O0FBRks7O0FBU1QsTUFBQSxHQUFTLFNBQUE7QUFFTCxRQUFBO0lBQUEsc0JBQVUsT0FBTyxDQUFFLFVBQVQsQ0FBb0IsUUFBcEIsVUFBVjtBQUFBLGVBQUE7O0lBRUEsd0NBQWUsQ0FBRSxlQUFqQjtBQUE2QixlQUFPLE9BQUEsQ0FBQSxFQUFwQzs7SUFFQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsR0FBbEI7UUFFSSxJQUFHLE9BQUEsS0FBVyxRQUFkO1lBQ0ksS0FBSyxDQUFDLEtBQU4sSUFBZTtZQUNmLFFBQUEsQ0FBQTtBQUNBLG1CQUFPLEVBSFg7O1FBS0EsSUFBRyxVQUFIO1lBQ0ksSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVY7WUFDUCxJQUFBLEdBQU8sUUFBQSxDQUFTLENBQUMsQ0FBVjtZQUNQLElBQUcsQ0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVgsQ0FBc0IsT0FBdEIsQ0FBSixJQUFzQyxRQUFBLElBQUksQ0FBQyxLQUFMLEVBQUEsYUFBYyxJQUFkLEVBQUEsSUFBQSxNQUFBLENBQXpDO2dCQUNJLElBQVUsQ0FBQyxJQUFJLENBQUMsS0FBTCxHQUFXLElBQUksQ0FBQyxNQUFoQixHQUEwQixLQUFLLENBQUMsS0FBakMsQ0FBQSxvQkFBNEMsSUFBSSxDQUFFLGVBQU4sR0FBZSxLQUFLLENBQUMsS0FBTixHQUFZLENBQWpGO0FBQUEsMkJBQUE7O2dCQUNBLElBQVUsQ0FBQyxJQUFJLENBQUMsS0FBTCxHQUFXLElBQUksQ0FBQyxNQUFoQixLQUEwQixLQUFLLENBQUMsS0FBakMsQ0FBQSxvQkFBNEMsSUFBSSxDQUFFLGVBQU4sS0FBZSxLQUFLLENBQUMsS0FBTixHQUFZLENBQWpGO0FBQUEsMkJBQUE7aUJBRko7O1lBSUEsb0JBQVUsSUFBSSxDQUFFLGVBQU4sS0FBZSxHQUF6QjtBQUFBLHVCQUFBOztZQUNBLElBQVUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFYLENBQXNCLFFBQXRCLENBQVY7QUFBQSx1QkFBQTthQVJKOztRQVVBLFNBQUEsQ0FBVTtZQUFBLElBQUEsRUFBSyxRQUFMO1NBQVY7QUFDQSxlQUFPLFFBQUEsQ0FBUyxDQUFULEVBQVcsY0FBWCxFQWxCWDs7V0FvQkEsTUFBQSxDQUFBO0FBMUJLOztBQTRCVCxZQUFBLEdBQWUsU0FBQTtBQUVYLFFBQUE7SUFBQSxJQUFVLENBQUksS0FBSyxDQUFDLElBQVYsSUFBa0IsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFYLEdBQW9CLENBQWhEO0FBQUEsZUFBQTs7SUFFQSxJQUFBLEdBQU87SUFFUCxJQUFVLE9BQUEsSUFBWSxDQUFBLE9BQUEsS0FBZ0IsZUFBaEIsSUFBQSxPQUFBLEtBQWlDLElBQWpDLENBQXRCO0FBQUEsZUFBQTs7SUFDQSxJQUFHLEtBQUssQ0FBQyxJQUFLLFlBQVgsS0FBbUIsS0FBdEI7UUFDSSxJQUFHLE9BQUEsS0FBVyxJQUFkO1lBQ0ksUUFBQSxDQUFBLEVBREo7U0FBQSxNQUFBO1lBR0ksU0FBQSxDQUFVO2dCQUFBLElBQUEsRUFBSyxJQUFMO2dCQUFXLE1BQUEsRUFBTyxJQUFJLENBQUMsTUFBdkI7YUFBVixFQUhKOztBQUlBLGVBQU8sU0FBQSxDQUFVLENBQVYsRUFBWSxJQUFaLEVBTFg7O0FBUFc7O0FBb0JmLFlBQUEsR0FBZSxTQUFBO0FBRVgsUUFBQTtJQUFBLElBQVUsT0FBQSxLQUFXLFFBQXJCO0FBQUEsZUFBQTs7SUFFQSx3Q0FBZSxDQUFFLGVBQWpCO0FBQTZCLGVBQU8sT0FBQSxDQUFBLEVBQXBDOztJQUVBLFdBQUcsS0FBSyxDQUFDLEtBQU4sRUFBQSxhQUFlLEtBQWYsRUFBQSxJQUFBLE1BQUg7UUFFSSxJQUFBO0FBQU8sb0JBQU8sS0FBSyxDQUFDLEtBQWI7QUFBQSxxQkFDRSxHQURGOzJCQUNXO0FBRFgscUJBRUUsR0FGRjsyQkFFVztBQUZYOztRQUlQLElBQUcsT0FBQSxLQUFXLElBQWQ7WUFDSSxRQUFBLENBQVMsQ0FBVCxFQUFXLElBQVg7WUFDQSxRQUFBLENBQUE7QUFDQSxtQkFBTyxFQUhYO1NBQUEsTUFJSyxJQUFHLE9BQUg7QUFDRCxtQkFBTyxPQUFBLENBQUEsRUFETjs7UUFHTCxTQUFBLENBQVU7WUFBQSxNQUFBLEVBQU8sSUFBUDtZQUFZLElBQUEsRUFBSyxJQUFqQjtTQUFWO1FBQ0EsUUFBQSxDQUFTLENBQVQsRUFBVyxJQUFYO0FBQ0EsZUFBTyxFQWZYOztXQWlCQSxNQUFBLENBQUE7QUF2Qlc7O0FBeUJmLFlBQUEsR0FBZSxTQUFBO0FBRVgsUUFBQTtJQUFBLElBQVUsQ0FBSSxLQUFLLENBQUMsSUFBVixJQUFrQixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQVgsR0FBb0IsQ0FBaEQ7QUFBQSxlQUFBOztJQUNBLElBQVUsT0FBQSxLQUFZLFFBQVosSUFBQSxPQUFBLEtBQW9CLGVBQXBCLElBQUEsT0FBQSxLQUFtQyxlQUE3QztBQUFBLGVBQUE7O0lBRUEsd0NBQWUsQ0FBRSxlQUFqQjtBQUE2QixlQUFPLE9BQUEsQ0FBQSxFQUFwQzs7SUFFQSxJQUFBO0FBQU8sZ0JBQU8sS0FBSyxDQUFDLElBQUssWUFBbEI7QUFBQSxpQkFDRSxLQURGO3VCQUNhO0FBRGIsaUJBRUUsS0FGRjt1QkFFYTtBQUZiOztJQUlQLElBQUcsSUFBSDtRQUVJLElBQVUsSUFBQSxLQUFRLE9BQVIsdUJBQW9CLE9BQU8sQ0FBRSxVQUFULENBQW9CLFFBQXBCLFdBQTlCO0FBQUEsbUJBQUE7O1FBRUEsSUFBRyxPQUFBLEtBQVcsSUFBZDtZQUNJLFFBQUEsQ0FBQSxFQURKO1NBQUEsTUFBQTtZQUdJLFNBQUEsQ0FBVTtnQkFBQSxNQUFBLEVBQU8sSUFBUDtnQkFBWSxJQUFBLEVBQUssSUFBakI7YUFBVixFQUhKOztBQUtBLGVBQU8sU0FBQSxDQUFVLENBQVYsRUFBWSxJQUFaLEVBVFg7O1dBV0EsTUFBQSxDQUFBO0FBdEJXOztBQThCZixNQUFBLEdBQVMsU0FBQTtBQUVMLFFBQUE7SUFBQSxJQUFVLE9BQVY7QUFBQSxlQUFBOztJQUVBLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLENBQUMsS0FBbEIsQ0FBSDtRQUVJLElBQUcsUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFBLEtBQWdCLEdBQW5CO1lBRUksSUFBRyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQUEsS0FBZ0IsY0FBaEIsSUFBbUMsUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFBLEtBQWdCLGNBQXREO2dCQUNJLFdBQThCLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBQSxFQUFBLGFBQWdCLElBQWhCLEVBQUEsSUFBQSxNQUE5QjtvQkFBQSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksY0FBWixFQUFBOztnQkFDQSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksUUFBWjtnQkFDQSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksY0FBWjtnQkFDQSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksUUFBWjtnQkFDQSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksY0FBWjtnQkFDQSxRQUFBLENBQVUsQ0FBVixFQUFZLFFBQVo7QUFDQSx1QkFBTyxFQVBYOztZQVNBLElBQUcsUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFBLEtBQWdCLFFBQW5CO2dCQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBWSxjQUFaO2dCQUNBLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBWSxjQUFaO2dCQUNBLFFBQUEsQ0FBVSxDQUFWLEVBQVksY0FBWjtBQUNBLHVCQUFPLEVBSlg7YUFYSjs7UUFpQkEsS0FBSyxDQUFDLEtBQU4sR0FBYztBQUNkLGVBQU8sRUFwQlg7O0lBc0JBLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLENBQUMsS0FBbEIsQ0FBSDtRQUVJLEtBQUssQ0FBQyxLQUFOLEdBQWM7QUFDZCxlQUFPLEVBSFg7O0FBMUJLOztBQXFDVCxLQUFBLEdBQVEsU0FBQTtJQUVKLElBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsS0FBakIsQ0FBSDtRQUNJLElBQUcsUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFBLEtBQWdCLEdBQW5CO1lBRUksSUFBRyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQUEsS0FBZ0IsUUFBbkI7Z0JBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFZLGNBQVo7Z0JBQ0EsUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFZLGNBQVo7Z0JBQ0EsUUFBQSxDQUFVLENBQVYsRUFBWSxjQUFaO0FBQ0EsdUJBQU8sRUFKWDthQUZKOztRQVFBLEtBQUssQ0FBQyxLQUFOLEdBQWM7QUFDZCxlQUFPLEVBVlg7O0FBRkk7O0FBb0JSLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLElBQUcsU0FBQSxLQUFLLENBQUMsS0FBTSxXQUFaLEtBQXNCLElBQXRCLElBQUEsSUFBQSxLQUEwQixJQUExQixJQUFBLElBQUEsS0FBOEIsSUFBOUIsQ0FBQSxJQUF3QyxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQUssQ0FBQyxLQUFNLGFBQXhCLENBQTNDO1FBQ0ksUUFBQSxDQUFTLENBQVQsRUFBVyxRQUFYO0FBQ0EsZUFBTyxFQUZYOztJQUlBLElBQUcsU0FBQSxLQUFLLENBQUMsS0FBTSxXQUFaLEtBQXNCLEdBQXRCLENBQUEsSUFBK0IsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFLLENBQUMsS0FBTSxhQUF4QixDQUFsQztRQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVcsUUFBWDtBQUNBLGVBQU8sRUFGWDs7SUFJQSxJQUFHLElBQUEsR0FBTyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQVY7UUFFSSxJQUFHLElBQUksQ0FBQyxLQUFMLEtBQWMsR0FBakI7WUFDSSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksT0FBWjtZQUNBLFFBQUEsQ0FBVSxDQUFWLEVBQVksT0FBWjtBQUNBLG1CQUFPLEVBSFg7O1FBS0EsSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLEdBQWpCO1lBRUksSUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQVosS0FBc0IsQ0FBdEIsSUFBMkIsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFaLEtBQXNCLENBQXBEO2dCQUNJLElBQUcsR0FBRyxDQUFDLElBQUosQ0FBUyxLQUFLLENBQUMsS0FBZixDQUFIO29CQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBWSxZQUFaO29CQUNBLFFBQUEsQ0FBVSxDQUFWLEVBQVksWUFBWjtBQUNBLDJCQUFPLEVBSFg7aUJBREo7O1lBTUEsUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFZLFVBQVo7WUFDQSxRQUFBLENBQVUsQ0FBVixFQUFZLFVBQVo7QUFDQSxtQkFBTyxFQVZYOztRQVlBLElBQUcsSUFBSSxDQUFDLEtBQUwsS0FBYyxHQUFqQjtZQUNJLElBQUcsUUFBQSxHQUFXLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBZDtnQkFDSSxZQUFHLFFBQVEsQ0FBQyxNQUFULEtBQW1CLE9BQW5CLElBQUEsSUFBQSxLQUEwQixVQUE3QjtvQkFDSSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQVksUUFBUSxDQUFDLEtBQXJCO29CQUNBLFFBQUEsQ0FBVSxDQUFWLEVBQVksUUFBUSxDQUFDLEtBQXJCO0FBQ0EsMkJBQU8sRUFIWDtpQkFESjthQURKO1NBbkJKOztBQVZNOztBQTBDVixPQUFBLEdBQVUsU0FBQTtBQUVOLFFBQUE7SUFBQSxJQUFHLFVBQUEsS0FBYyxDQUFqQjtRQUVJLElBQUcsQ0FBSSxLQUFLLENBQUMsSUFBVixJQUFtQixRQUFBLEtBQUssQ0FBQyxLQUFOLEVBQUEsYUFBZSxJQUFmLEVBQUEsSUFBQSxNQUFBLENBQW5CLHdDQUFzRCxDQUFFLGVBQWIsR0FBcUIsS0FBSyxDQUFDLEtBQU4sR0FBWSxDQUEvRTtZQUNJLElBQUEsR0FBTyxDQUFDLEtBQUQsRUFBTSxLQUFOLEVBQVcsS0FBWCxDQUFrQixDQUFBLEtBQUssQ0FBQyxLQUFOLEdBQVksQ0FBWjtZQUN6QixTQUFBLENBQVU7Z0JBQUEsS0FBQSxFQUFNLElBQU47Z0JBQVcsSUFBQSxFQUFLLElBQWhCO2dCQUFxQixJQUFBLEVBQUssSUFBMUI7YUFBVjtBQUNBLG1CQUFPLFFBQUEsQ0FBUyxDQUFULEVBQVcsSUFBQSxHQUFPLFNBQWxCLEVBSFg7O1FBS0EsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLEdBQWxCO1lBQ0ksSUFBRyxDQUFJLEtBQUssQ0FBQyxJQUFiO2dCQUNJLFNBQUEsQ0FBVTtvQkFBQSxLQUFBLEVBQU0sSUFBTjtvQkFBVyxJQUFBLEVBQUssSUFBaEI7b0JBQXFCLElBQUEsRUFBSyxJQUExQjtpQkFBVjtBQUNBLHVCQUFPLFFBQUEsQ0FBUyxDQUFULEVBQVcsSUFBWCxFQUZYOztBQUdBLG9CQUFPLEtBQUssQ0FBQyxJQUFiO0FBQUEscUJBQ1MsSUFEVDtvQkFFUSxTQUFBLENBQVU7d0JBQUEsS0FBQSxFQUFNLElBQU47d0JBQVcsSUFBQSxFQUFLLElBQWhCO3dCQUFxQixJQUFBLEVBQUssSUFBMUI7cUJBQVY7QUFDQSwyQkFBTyxTQUFBLENBQVUsQ0FBVixFQUFZLElBQVo7QUFIZixxQkFJUyxLQUpUO29CQUtRLFNBQUEsQ0FBVTt3QkFBQSxLQUFBLEVBQU0sSUFBTjt3QkFBVyxJQUFBLEVBQUssSUFBaEI7d0JBQXFCLElBQUEsRUFBSyxJQUExQjtxQkFBVjtBQUNBLDJCQUFPLFNBQUEsQ0FBVSxDQUFWLEVBQVksSUFBWjtBQU5mLHFCQU9TLE1BUFQ7b0JBUVEsU0FBQSxDQUFVO3dCQUFBLEtBQUEsRUFBTSxJQUFOO3dCQUFXLElBQUEsRUFBSyxJQUFoQjt3QkFBcUIsSUFBQSxFQUFLLElBQTFCO3FCQUFWO0FBQ0EsMkJBQU8sU0FBQSxDQUFVLENBQVYsRUFBWSxJQUFaO0FBVGYscUJBVVMsT0FWVDtvQkFXUSxTQUFBLENBQVU7d0JBQUEsS0FBQSxFQUFNLElBQU47d0JBQVcsSUFBQSxFQUFLLElBQWhCO3dCQUFxQixJQUFBLEVBQUssSUFBMUI7cUJBQVY7QUFDQSwyQkFBTyxTQUFBLENBQVUsQ0FBVixFQUFZLElBQVo7QUFaZixhQUpKO1NBUEo7O0lBeUJBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFsQjtRQUVJLHVDQUFlLHNCQUFaLEtBQW9CLElBQXZCO1lBRUksSUFBQSxHQUFPO1lBQ1Asc0JBQUcsT0FBTyxDQUFFLFFBQVQsQ0FBa0IsSUFBbEIsVUFBSDtnQkFDSSxTQUFBLENBQVUsQ0FBVixFQUFZLE9BQVo7Z0JBQ0EsUUFBQSxDQUFBO0FBQ0EsdUJBQU8sRUFIWDs7WUFLQSx1QkFBcUMsUUFBUSxDQUFFLGNBQS9DO2dCQUFBLElBQUEsR0FBTyxRQUFRLENBQUMsSUFBVCxHQUFnQixHQUFoQixHQUFzQixLQUE3Qjs7WUFDQSxTQUFBLENBQVU7Z0JBQUEsS0FBQSxFQUFNLElBQU47Z0JBQVcsSUFBQSxFQUFLLElBQWhCO2FBQVY7QUFDQSxtQkFBTyxTQUFBLENBQVUsQ0FBVixFQUFZLElBQVosRUFWWDs7UUFZQSxJQUFBLEdBQU87UUFDUCxzQkFBRyxPQUFPLENBQUUsUUFBVCxDQUFrQixJQUFsQixVQUFIO1lBQ0ksUUFBQSxDQUFTLENBQVQsRUFBVyxPQUFYO1lBQ0EsUUFBQSxDQUFBO0FBQ0EsbUJBQU8sRUFIWDs7UUFLQSx1QkFBcUMsUUFBUSxDQUFFLGNBQS9DO1lBQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxJQUFULEdBQWdCLEdBQWhCLEdBQXNCLEtBQTdCOztRQUNBLFNBQUEsQ0FBVTtZQUFBLEtBQUEsRUFBTSxJQUFOO1lBQVcsSUFBQSxFQUFLLElBQWhCO1NBQVY7UUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFXLElBQVg7QUFDQSxlQUFPLEVBdkJYOztJQXlCQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsR0FBbEI7UUFFSSx1Q0FBZSxzQkFBWixLQUFvQixLQUF2QjtZQUVJLElBQUEsR0FBTztZQUVQLFlBQUcsUUFBQSxDQUFTLENBQVQsRUFBQSxLQUFnQixjQUFoQixJQUFBLElBQUEsS0FBOEIsWUFBOUIsSUFBQSxJQUFBLEtBQTBDLElBQTdDO2dCQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVcsU0FBWDtBQUNBLHVCQUFPLFNBQUEsQ0FBVSxDQUFWLEVBQVksSUFBWixFQUZYOztZQUlBLFNBQUEsQ0FBVTtnQkFBQSxJQUFBLEVBQUssSUFBTDtnQkFBVSxJQUFBLEVBQUssSUFBZjthQUFWO0FBQ0EsbUJBQU8sU0FBQSxDQUFVLENBQVYsRUFBWSxJQUFaLEVBVFg7O1FBV0EsSUFBQSxHQUFPO1FBQ1Asc0JBQUcsT0FBTyxDQUFFLFFBQVQsQ0FBa0IsSUFBbEIsVUFBSDtZQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVcsT0FBWDtZQUNBLFFBQUEsQ0FBQTtBQUNBLG1CQUFPLEVBSFg7O1FBS0EsdUJBQXFDLFFBQVEsQ0FBRSxjQUEvQztZQUFBLElBQUEsR0FBTyxRQUFRLENBQUMsSUFBVCxHQUFnQixHQUFoQixHQUFzQixLQUE3Qjs7UUFFQSxTQUFBLENBQVU7WUFBQSxLQUFBLEVBQU0sSUFBTjtZQUFXLElBQUEsRUFBSyxJQUFoQjtTQUFWO0FBQ0EsZUFBTyxRQUFBLENBQVMsQ0FBVCxFQUFXLElBQVgsRUF0Qlg7O0FBcERNOztBQWtGVixhQUFBLEdBQWdCLFNBQUE7QUFFWixRQUFBO0lBQUEsSUFBRyxPQUFBLEtBQVcsZUFBZDtRQUVJLHNDQUFhLENBQUUsVUFBWixDQUF1QixLQUF2QixVQUFIO1lBQ0ksU0FBQSxDQUFVO2dCQUFBLElBQUEsRUFBSyxlQUFMO2dCQUFzQixJQUFBLEVBQUssSUFBM0I7YUFBVjtBQUNBLG1CQUFPLFNBQUEsQ0FBVSxDQUFWLEVBQVksNEJBQVosRUFGWDtTQUZKO0tBQUEsTUFNSyxJQUFHLE9BQUEsS0FBVyxlQUFkO1FBRUQsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLEdBQWxCO1lBQ0ksUUFBQSxDQUFTLENBQVQsRUFBVywwQkFBWDtZQUNBLFFBQUEsQ0FBQTtBQUNBLG1CQUFPLEVBSFg7U0FGQzs7QUFSTzs7QUFxQmhCLE9BQUEsR0FBVSxTQUFBO0lBRU4sSUFBVSxPQUFWO0FBQUEsZUFBQTs7SUFFQSxJQUFHLENBQUksTUFBTSxDQUFDLElBQUssQ0FBQSxHQUFBLENBQW5CO0FBRUksZUFGSjs7SUFJQSxJQUFHLE1BQU0sQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUFJLENBQUMsY0FBakIsQ0FBZ0MsS0FBSyxDQUFDLEtBQXRDLENBQUg7UUFDSSxLQUFLLENBQUMsS0FBTixHQUFjLE1BQU0sQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUFLLENBQUEsS0FBSyxDQUFDLEtBQU4sRUFEbkM7O0FBUk07O0FBa0JWLFFBQUEsR0FBVyxTQUFBO0FBRVAsUUFBQTtJQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxJQUFqQjtBQUNJLGVBQU8sU0FBQSxDQUFVLENBQVYsRUFBWSxTQUFaLEVBRFg7O0lBR0EsWUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixHQUFoQixJQUFBLElBQUEsS0FBbUIsR0FBdEI7QUFDSSxlQUFPLFFBQUEsQ0FBUyxDQUFULEVBQVcsU0FBWCxFQURYOztBQUxPOztBQWNYLFFBQUEsR0FBVyxTQUFBO0lBRVAsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLEdBQWxCO1FBQ0ksUUFBQSxDQUFTLENBQVQsRUFBVyxRQUFYO1FBQ0EsUUFBQSxDQUFTLENBQVQsRUFBVyxRQUFYO0FBQ0EsZUFBTyxFQUhYOztBQUZPOztBQWFYLE9BQUEsR0FBVSxTQUFBO0FBRU4sUUFBQTtJQUFBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFmLHlDQUFtQyxDQUFFLGVBQWQsd0NBQWtDLENBQUUsZ0JBQXBDLEtBQThDLEtBQUssQ0FBQyxLQUE5RTtBQUNJLGVBQU8sUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFZLEtBQVosRUFEWDs7SUFHQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsSUFBZCx3Q0FBa0MsQ0FBRSxlQUFiLEtBQXNCLEtBQUssQ0FBQyxLQUFOLEdBQVksQ0FBNUQ7UUFDSSxRQUFBLENBQVMsQ0FBVCxFQUFXLFVBQVg7UUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFXLFVBQVg7UUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFXLFVBQVg7QUFDQSxlQUFPLEVBSlg7O0lBTUEsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLEdBQWYsd0NBQWtDLENBQUUsZUFBYixLQUFzQixLQUFLLENBQUMsS0FBTixHQUFZLENBQTVEO1FBQ0ksUUFBQSxDQUFTLENBQVQsRUFBVyxVQUFYO1FBQ0EsUUFBQSxDQUFTLENBQVQsRUFBVyxVQUFYO0FBQ0EsZUFBTyxFQUhYOztBQVhNOztBQXNCVixPQUFBLEdBQVUsU0FBQTtJQUVOLElBQUcsUUFBSDtRQUNJLElBQVUsUUFBUSxDQUFDLElBQW5CO0FBQUEsbUJBQUE7O1FBQ0EsSUFBRyxRQUFRLENBQUMsTUFBWjtZQUNJLEtBQUssQ0FBQyxLQUFOLEdBQWMsUUFEbEI7U0FBQSxNQUFBO1lBR0ksS0FBSyxDQUFDLEtBQU4sSUFBZSxHQUFBLEdBQU0sUUFIekI7O0FBSUEsZUFBTyxFQU5YOztBQUZNOztBQVVWLE9BQUEsR0FBVSxTQUFDLElBQUQ7SUFDTixNQUFBLEdBQVM7UUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFPLElBQVA7UUFBYSxLQUFBLEVBQU0sSUFBbkI7UUFBeUIsS0FBQSxFQUFNLEtBQS9COztXQUNULFFBQVEsQ0FBQyxJQUFULENBQWMsTUFBZDtBQUZNOztBQUlWLE1BQUEsR0FBUyxTQUFBO0lBQ0wsS0FBQSxHQUFXO0lBQ1gsUUFBQSxHQUFXO0lBQ1gsT0FBQSxHQUFXO1dBQ1gsT0FBQSxHQUFXO0FBSk47O0FBTVQsTUFBQSxHQUFTLFNBQUE7SUFDTCxLQUFBLEdBQVEsTUFBTSxDQUFDO0lBQ2YsSUFBSSxDQUFDLEdBQUwsR0FBVyxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ3hCLFFBQVEsQ0FBQyxHQUFULENBQUE7SUFDQSxNQUFBLEdBQVMsUUFBUyxVQUFFLENBQUEsQ0FBQTtJQUVwQixRQUFBLEdBQVcsS0FBTSxVQUFFLENBQUEsQ0FBQTtJQUNuQixPQUFBLHNCQUFVLFFBQVEsQ0FBRTtXQUNwQixPQUFBLEdBQVUsUUFBQSxJQUFhLGFBQWUsU0FBZixFQUFBLE9BQUE7QUFSbEI7O0FBVVQsU0FBQSxHQUFZLFNBQUMsQ0FBRDtJQUNSLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWDtJQUNBLFFBQUEsR0FBVztJQUNYLE9BQUEsR0FBVSxDQUFDLENBQUM7V0FDWixPQUFBLEdBQVUsYUFBZSxTQUFmLEVBQUEsT0FBQTtBQUpGOztBQU1aLFFBQUEsR0FBVyxTQUFBO0lBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBQTtJQUNBLFFBQUEsR0FBVyxLQUFNLFVBQUUsQ0FBQSxDQUFBO0lBQ25CLE9BQUEsc0JBQVUsUUFBUSxDQUFFO1dBQ3BCLE9BQUEsR0FBVSxRQUFBLElBQWEsYUFBZSxTQUFmLEVBQUEsT0FBQTtBQUpoQjs7QUFNWCxRQUFBLEdBQVcsU0FBQyxDQUFEO1dBQU8sSUFBSSxDQUFDLE1BQU8sQ0FBQSxVQUFBLEdBQVcsQ0FBWDtBQUFuQjs7QUFDWCxRQUFBLEdBQVcsU0FBQyxDQUFELEVBQUksS0FBSjtBQUFjLFFBQUE7SUFBQSxJQUFHLENBQUEsQ0FBQSxZQUFLLFVBQUEsR0FBVyxFQUFoQixRQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBaEMsQ0FBSDtlQUErQyxJQUFJLENBQUMsTUFBTyxDQUFBLFVBQUEsR0FBVyxDQUFYLENBQWEsQ0FBQyxLQUExQixHQUFrQyxNQUFqRjs7QUFBZDs7QUFDWCxRQUFBLEdBQVcsU0FBQyxDQUFEO0FBQU8sUUFBQTt3RkFBcUI7QUFBNUI7O0FBQ1gsUUFBQSxHQUFXLFNBQUMsQ0FBRDtBQUFPLFFBQUE7d0ZBQXFCO0FBQTVCOztBQUNYLFFBQUEsR0FBVyxTQUFDLENBQUQsRUFBSSxLQUFKO0FBQ1AsUUFBQTtJQUFBLElBQUcsQ0FBQSxDQUFBLFlBQUssVUFBQSxHQUFXLEVBQWhCLFFBQUEsR0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFoQyxDQUFIO1FBQ0ksSUFBSSxDQUFDLE1BQU8sQ0FBQSxVQUFBLEdBQVcsQ0FBWCxDQUFhLENBQUMsS0FBMUIsSUFBbUMsR0FBQSxHQUFNLE1BRDdDOztXQUVBO0FBSE87O0FBS1gsU0FBQSxHQUFZLFNBQUMsQ0FBRCxFQUFHLEtBQUg7QUFDUixRQUFBO0FBQUEsU0FBUywrRUFBVDtRQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksS0FBWjtBQURKO1dBRUE7QUFIUTs7QUFLWixRQUFBLEdBQ0k7SUFBQSxNQUFBLEVBQ007UUFBQSxLQUFBLEVBQU0sQ0FBRSxZQUFGLEVBQWdCLFdBQWhCLEVBQTZCLFlBQTdCLEVBQTJDLFdBQTNDLEVBQXdELFlBQXhELEVBQXNFLFlBQXRFLEVBQW9GLGFBQXBGLEVBQW1HLFNBQW5HLEVBQThHLE1BQTlHLEVBQXNILElBQXRILENBQU47UUFDQSxJQUFBLEVBQU0sQ0FBRSxPQUFGLEVBQVcsVUFBWCxFQUF1QixNQUF2QixFQUErQixRQUEvQixDQUROO0tBRE47SUFHQSxJQUFBLEVBQU07UUFBQSxLQUFBLEVBQU0sQ0FBRSxXQUFGLEVBQWdCLFNBQWhCLEVBQTJCLFFBQTNCLENBQU47UUFBc0YsSUFBQSxFQUFLLENBQUUsUUFBRixFQUFZLE9BQVosRUFBcUIsTUFBckIsQ0FBM0Y7S0FITjtJQUlBLEVBQUEsRUFBTTtRQUFBLEtBQUEsRUFBTSxDQUFFLFdBQUYsRUFBZ0IsWUFBaEIsRUFBOEIsT0FBOUIsRUFBdUMsWUFBdkMsRUFBcUQsU0FBckQsRUFBZ0UsTUFBaEUsRUFBd0UsSUFBeEUsQ0FBTjtRQUFzRixJQUFBLEVBQUssQ0FBRSxPQUFGLEVBQVcsTUFBWCxFQUFtQixNQUFuQixFQUEyQixRQUEzQixDQUEzRjtLQUpOO0lBS0EsRUFBQSxFQUFNO1FBQUEsS0FBQSxFQUFNLENBQUUsV0FBRixFQUFnQixZQUFoQixFQUE4QixPQUE5QixFQUF1QyxZQUF2QyxFQUFxRCxTQUFyRCxFQUFnRSxNQUFoRSxFQUF3RSxJQUF4RSxDQUFOO1FBQXNGLElBQUEsRUFBSyxDQUFFLE9BQUYsRUFBVyxNQUFYLEVBQW1CLE1BQW5CLEVBQTJCLFFBQTNCLENBQTNGO0tBTE47SUFNQSxHQUFBLEVBQU07UUFBQSxLQUFBLEVBQU0sQ0FBRSxXQUFGLEVBQWdCLFlBQWhCLEVBQThCLFlBQTlCLENBQU47UUFBc0YsSUFBQSxFQUFLLENBQUUsT0FBRixFQUFXLE1BQVgsQ0FBM0Y7S0FOTjtJQU9BLEdBQUEsRUFBTTtRQUFBLEtBQUEsRUFBTSxDQUFFLFdBQUYsRUFBZ0IsWUFBaEIsRUFBOEIsWUFBOUIsRUFBNEMsUUFBNUMsQ0FBTjtRQUFzRixJQUFBLEVBQUssQ0FBVyxNQUFYLENBQTNGO0tBUE47SUFRQSxHQUFBLEVBQU07UUFBQSxLQUFBLEVBQU0sQ0FBRSxXQUFGLEVBQWdCLFlBQWhCLEVBQThCLFlBQTlCLEVBQTRDLFFBQTVDLENBQU47UUFBc0YsSUFBQSxFQUFLLENBQUUsT0FBRixFQUFXLE1BQVgsRUFBbUIsS0FBbkIsQ0FBM0Y7S0FSTjtJQVNBLEdBQUEsRUFBTTtRQUFBLEtBQUEsRUFBTSxDQUFFLFdBQUYsRUFBZ0IsWUFBaEIsRUFBOEIsWUFBOUIsRUFBNEMsUUFBNUMsQ0FBTjtRQUFzRixJQUFBLEVBQUssQ0FBRSxPQUFGLEVBQVcsTUFBWCxFQUFtQixLQUFuQixDQUEzRjtLQVROO0lBVUEsQ0FBQSxFQUFNO1FBQUEsS0FBQSxFQUFNLENBQUUsV0FBRixFQUFnQixZQUFoQixFQUE4QixZQUE5QixFQUE0QyxRQUE1QyxDQUFOO1FBQXNGLElBQUEsRUFBSyxDQUFFLE9BQUYsRUFBVyxNQUFYLEVBQW1CLEtBQW5CLENBQTNGO0tBVk47SUFXQSxDQUFBLEVBQU07UUFBQSxLQUFBLEVBQU0sQ0FBRSxXQUFGLEVBQWdCLFlBQWhCLEVBQThCLFlBQTlCLEVBQTRDLFFBQTVDLENBQU47UUFBc0YsSUFBQSxFQUFLLENBQUUsT0FBRixFQUFXLE1BQVgsRUFBbUIsS0FBbkIsQ0FBM0Y7S0FYTjtJQVlBLEVBQUEsRUFBTTtRQUFBLEtBQUEsRUFBTSxDQUFFLFdBQUYsRUFBZ0IsWUFBaEIsRUFBOEIsWUFBOUIsQ0FBTjtRQUFzRixJQUFBLEVBQUssQ0FBRSxPQUFGLEVBQVcsTUFBWCxDQUEzRjtLQVpOO0lBYUEsR0FBQSxFQUFNO1FBQUEsS0FBQSxFQUFNLENBQUUsV0FBRixFQUFnQixZQUFoQixFQUE4QixZQUE5QixDQUFOO1FBQXNGLElBQUEsRUFBSyxDQUFFLE9BQUYsRUFBVyxNQUFYLENBQTNGO0tBYk47SUFjQSxJQUFBLEVBQU07UUFBQSxLQUFBLEVBQU0sQ0FBRSxXQUFGLEVBQWdCLFlBQWhCLEVBQThCLFlBQTlCLENBQU47UUFBc0YsSUFBQSxFQUFLLENBQUUsT0FBRixFQUFXLE9BQVgsRUFBb0IsTUFBcEIsQ0FBM0Y7S0FkTjtJQWVBLEdBQUEsRUFBTTtRQUFBLEtBQUEsRUFBTSxDQUFFLFdBQUYsRUFBZ0IsWUFBaEIsRUFBOEIsWUFBOUIsQ0FBTjtRQUFzRixJQUFBLEVBQUssQ0FBRSxPQUFGLEVBQVcsT0FBWCxFQUFvQixNQUFwQixDQUEzRjtLQWZOO0lBZ0JBLElBQUEsRUFBTTtRQUFBLEtBQUEsRUFBTSxDQUFFLFdBQUYsRUFBZ0IsWUFBaEIsRUFBOEIsWUFBOUIsQ0FBTjtRQUFzRixJQUFBLEVBQUssQ0FBRSxPQUFGLEVBQVcsT0FBWCxFQUFvQixNQUFwQixDQUEzRjtLQWhCTjtJQWlCQSxJQUFBLEVBQU07UUFBQSxLQUFBLEVBQU0sQ0FBRSxXQUFGLEVBQWdCLFlBQWhCLEVBQThCLFlBQTlCLENBQU47UUFBc0YsSUFBQSxFQUFLLENBQUUsT0FBRixFQUFXLE9BQVgsRUFBb0IsTUFBcEIsQ0FBM0Y7S0FqQk47SUFrQkEsR0FBQSxFQUFNO1FBQUEsS0FBQSxFQUFNLENBQWdCLFlBQWhCLEVBQThCLFFBQTlCLENBQU47UUFBc0YsSUFBQSxFQUFLLENBQUUsT0FBRixFQUFXLE1BQVgsQ0FBM0Y7S0FsQk47SUFtQkEsSUFBQSxFQUFNO1FBQUEsS0FBQSxFQUFNLENBQWdCLFlBQWhCLEVBQThCLFFBQTlCLENBQU47UUFBc0YsSUFBQSxFQUFLLENBQUUsT0FBRixFQUFXLE1BQVgsQ0FBM0Y7S0FuQk47SUFvQkEsR0FBQSxFQUFNO1FBQUEsS0FBQSxFQUFNLENBQWdCLFlBQWhCLEVBQThCLFFBQTlCLENBQU47UUFBc0YsSUFBQSxFQUFLLENBQUUsT0FBRixFQUFXLE1BQVgsQ0FBM0Y7S0FwQk47SUFxQkEsRUFBQSxFQUFNO1FBQUEsS0FBQSxFQUFNLENBQUUsV0FBRixFQUFnQixZQUFoQixFQUE4QixRQUE5QixFQUF3QyxPQUF4QyxDQUFOO1FBQXNGLElBQUEsRUFBSyxDQUFFLE9BQUYsRUFBVyxPQUFYLEVBQW9CLE1BQXBCLENBQTNGO0tBckJOO0lBc0JBLElBQUEsRUFBTTtRQUFBLEtBQUEsRUFBTSxDQUFnQixZQUFoQixFQUE4QixTQUE5QixFQUF5QyxRQUF6QyxDQUFOO1FBQXNGLElBQUEsRUFBSyxDQUFFLE9BQUYsRUFBVyxRQUFYLEVBQXFCLE9BQXJCLEVBQThCLE1BQTlCLENBQTNGO0tBdEJOO0lBdUJBLEdBQUEsRUFBTTtRQUFBLEtBQUEsRUFBTSxDQUFnQixZQUFoQixFQUE4QixRQUE5QixFQUF3QyxJQUF4QyxDQUFOO1FBQXNGLElBQUEsRUFBSyxDQUFFLE9BQUYsRUFBVyxNQUFYLENBQTNGO0tBdkJOO0lBd0JBLEVBQUEsRUFBTTtRQUFBLEtBQUEsRUFBTSxDQUFxQixPQUFyQixFQUE4QixRQUE5QixFQUF3QyxRQUF4QyxDQUFOO1FBQXNGLElBQUEsRUFBSyxDQUFFLE9BQUYsRUFBVyxNQUFYLENBQTNGO0tBeEJOO0lBeUJBLElBQUEsRUFBTTtRQUFBLEtBQUEsRUFBTSxDQUFpQixXQUFqQixFQUE4QixZQUE5QixDQUFOO1FBQXNGLElBQUEsRUFBSyxDQUFFLE9BQUYsRUFBVyxNQUFYLENBQTNGO0tBekJOOzs7QUEyQko7QUFBQSxLQUFBLHdDQUFBOztJQUNJLElBQU8scUJBQVA7UUFDSSxRQUFTLENBQUEsR0FBQSxDQUFULEdBQWdCO1lBQUEsS0FBQSxFQUFNLENBQUUsWUFBRixDQUFOO1lBQXdCLElBQUEsRUFBSyxDQUFFLE1BQUYsQ0FBN0I7VUFEcEI7O0FBREo7O0FBSUEsS0FBQSxlQUFBOztJQUNJLFFBQVMsQ0FBQSxHQUFBLENBQUksQ0FBQyxLQUFLLENBQUMsSUFBcEIsQ0FBeUIsT0FBekI7SUFDQSxRQUFTLENBQUEsR0FBQSxDQUFJLENBQUMsSUFBSSxDQUFDLElBQW5CLENBQXdCLE9BQXhCO0FBRko7OztBQUlBOzs7Ozs7OztBQU1HOztBQWFILE9BQUEsR0FBVSxTQUFDLEtBQUQ7QUFFTixRQUFBO0lBQUEsUUFBQSxHQUFhO0lBQ2IsS0FBQSxHQUFhO0lBQ2IsS0FBQSxHQUFhO0lBQ2IsTUFBQSxHQUFhO0lBQ2IsUUFBQSxHQUFhO0lBQ2IsT0FBQSxHQUFhO0lBQ2IsT0FBQSxHQUFhO0lBQ2IsR0FBQSxHQUFhO0lBQ2IsSUFBQSxHQUFhO0lBQ2IsS0FBQSxHQUFhO0lBQ2IsVUFBQSxHQUFhO0FBUWIsU0FBQSx5Q0FBQTs7UUFFSSxJQUFHLFFBQUg7WUFFSSxJQUFHLFFBQVEsQ0FBQyxJQUFULEtBQWlCLGdCQUFwQjtnQkFFSSxhQUFBLEdBQWdCO0FBQ2hCO0FBQUEscUJBQUEsd0NBQUE7O29CQUNJLElBQUcsQ0FBSSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQUssQ0FBQyxLQUFsQixDQUFQO3dCQUNJLGFBQUEsR0FBZ0I7QUFDaEIsOEJBRko7O0FBREo7Z0JBSUEsSUFBRyxhQUFIO0FBQ0k7QUFBQSx5QkFBQSx3Q0FBQTs7d0JBQ0ksS0FBSyxDQUFDLEtBQU4sR0FBYztBQURsQjtBQUVBLDZCQUhKO2lCQVBKOztZQVlBLElBQUcsUUFBUSxDQUFDLElBQVo7Z0JBQXNCLFFBQUEsQ0FBQSxFQUF0QjthQWRKOztRQWdCQSxJQUFHLE1BQUg7WUFDSSxJQUFHLE1BQU0sRUFBQyxNQUFELEVBQU8sQ0FBQyxNQUFkLDJDQUF1QyxDQUFFLGVBQWhCLElBQXlCLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQTVFO2dCQUNJLE1BQUEsQ0FBQSxFQURKO2FBQUEsTUFBQTtnQkFHSSxJQUFJLENBQUMsR0FBTCxHQUFXLE1BQU0sRUFBQyxNQUFELEVBQU8sQ0FBQyxHQUg3QjthQURKOztRQU1BLElBQUcsR0FBQSxLQUFPLElBQUksQ0FBQyxHQUFmO1lBQ0ksTUFBQSxDQUFBO1lBQ0EsS0FBQSxHQUFRLFFBQVMsQ0FBQSxHQUFBLEdBQU0sSUFBSSxDQUFDLEdBQVg7WUFDakIsSUFBRyxDQUFJLEtBQVA7Z0JBQ0csbUdBQU0sSUFBTjtnQkFBVSxtR0FDSixRQURJLEVBRGI7O1lBR0EsSUFBQSxRQUFBO0FBQUE7QUFBQTtjQU5KOztRQWNBLFVBQUEsR0FBYTtBQUNiLGVBQU0sVUFBQSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBL0I7WUFFSSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU8sQ0FBQSxVQUFBO1lBQ3BCLFdBQUEsR0FBYztZQUVkLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxPQUFsQjtnQkFFSSxJQUFHLE1BQUg7b0JBQ0ksSUFBRyw4QkFBQSxJQUF1QixNQUFNLEVBQUMsTUFBRCxFQUFPLENBQUMsR0FBZCxLQUFxQixLQUFLLENBQUMsSUFBckQ7d0JBQ0ksSUFBa0QsTUFBTSxFQUFDLE1BQUQsRUFBTyxDQUFDLEdBQWhFOzRCQUFBLFNBQUEsQ0FBVSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQXJCLEVBQTZCLE1BQU0sRUFBQyxNQUFELEVBQU8sQ0FBQyxHQUEzQyxFQUFBOzt3QkFDQSxNQUFBLENBQUEsRUFGSjtxQkFESjs7QUFLQTtBQUFBLHFCQUFBLHdDQUFBOztvQkFDSSxJQUFHLE9BQUEsR0FBVSxHQUFBLENBQUEsQ0FBYjt3QkFDSSxVQUFBLElBQWM7QUFDZCw4QkFGSjs7QUFESixpQkFQSjthQUFBLE1BQUE7Z0JBY0ksSUFBRyxDQUFJLE9BQVA7b0JBQ0ksSUFBRyxJQUFBLGlEQUErQixDQUFBLEtBQUssQ0FBQyxLQUFOLFVBQWxDO3dCQUNJLElBQUcsSUFBSSxDQUFDLElBQVI7NEJBQ0ksU0FBQSxHQUFZLFFBQUEsQ0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBcEI7NEJBQ1osSUFBRyxJQUFJLENBQUMsSUFBTCxLQUFhLDJGQUFtQixTQUFTLENBQUUsY0FBOUIsQ0FBaEI7Z0NBRUksT0FBQSxDQUFRLElBQVIsRUFGSjs2QkFGSjt5QkFESjtxQkFESjs7QUFRQTtBQUFBLHFCQUFBLHlDQUFBOztvQkFDSSxJQUFHLE9BQUEsR0FBVSxHQUFBLENBQUEsQ0FBYjt3QkFDSSxVQUFBLElBQWM7QUFDZCw4QkFGSjs7QUFESixpQkF0Qko7O1lBMkJBLElBQUcsVUFBQSxLQUFjLFdBQWpCO2dCQUNJLFVBQUEsR0FESjs7UUFoQ0o7QUF2Q0o7V0F5RUE7QUE3Rk07O0FBcUdWLEtBQUEsR0FBUSxTQUFDLEtBQUQsRUFBUSxHQUFSOztRQUFRLE1BQUk7O1dBQWEsT0FBQSxDQUFRLE9BQUEsQ0FBUSxLQUFSLEVBQWUsR0FBZixDQUFSO0FBQXpCOztBQUVSLE1BQU0sQ0FBQyxPQUFQLEdBRUk7SUFBQSxLQUFBLEVBQVMsT0FBQSxDQUFRLFNBQVIsQ0FBVDtJQUNBLEtBQUEsRUFBUyxLQURUO0lBRUEsT0FBQSxFQUFTLE9BRlQ7SUFHQSxNQUFBLEVBQVMsU0FBQyxJQUFELEVBQU8sR0FBUDs7WUFBTyxNQUFJOztlQUFjLEtBQUEsQ0FBTSxDQUFDLElBQUQsQ0FBTixFQUFjLEdBQWQsQ0FBbUIsQ0FBQSxDQUFBLENBQUUsQ0FBQztJQUEvQyxDQUhUO0lBSUEsT0FBQSxFQUFTLFNBQUMsS0FBRCxFQUFRLEdBQVI7O1lBQVEsTUFBSTs7ZUFBYSxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsQ0FBaUIsQ0FBQyxHQUFsQixDQUFzQixTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDO1FBQVQsQ0FBdEI7SUFBekIsQ0FKVDtJQUtBLElBQUEsRUFBUyxNQUFNLENBQUMsSUFMaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBzbGFzaCwga3N0ciwga2xvZywgbm9vbiwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuICBcblN5bnRheCA9IHJlcXVpcmUgJy4vc3ludGF4J1xuU3ludGF4LmluaXQoKVxuXG5TeW50YXguc3d0Y2ggPSBcbiAgICBjb2ZmZWU6IFxuICAgICAgICBkb2M6ICAgICAgICAgIHR1cmQ6J+KWuCcgICB0bzonbWQnICBpbmRlbnQ6IDFcbiAgICBtZDogICAgIFxuICAgICAgICBjb2ZmZWVzY3JpcHQ6IHR1cmQ6J2BgYCcgdG86J2NvZmZlZScgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgIGphdmFzY3JpcHQ6ICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcbiAgICAgICAgXG5mb3IgZXh0IGluIFN5bnRheC5leHRzXG4gICAgU3ludGF4LnN3dGNoLm1kW2V4dF0gPSB0dXJkOidgYGAnIHRvOmV4dCwgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgICAgICBcblNQQUNFICA9IC9cXHMvXG5IRUFERVIgPSAvXjArJC9cblBVTkNUICA9IC9cXFcrL2dcbk5VTUJFUiA9IC9eXFxkKyQvXG5GTE9BVCAgPSAvXlxcZCtmJC9cbkhFWE5VTSA9IC9eMHhbYS1mQS1GXFxkXSskL1xuSEVYICAgID0gL15bYS1mQS1GXFxkXSskL1xuXG5jb2RlVHlwZXMgPSBbJ2ludGVycG9sYXRpb24nICdjb2RlIHRyaXBsZSddXG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG7ilrhkb2MgJ2NodW5rZWQgbGluZXMsIGV4dCdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgcmV0dXJucyBhcnJheSBvZlxuICAgICAgICBcbiAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICAgICAgICAgIHR1cmQ6ICAgc1xuICAgICAgICAgICAgICAgICAgICBtYXRjaDogIHNcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICBzXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiAgblxuICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IG5cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgIGV4dDogICAgc1xuICAgICAgICBjaGFyczogIG5cbiAgICAgICAgaW5kZXg6ICBuXG4gICAgICAgIG51bWJlcjogbisxXG5cbmNodW5rZWQgPSAobGluZXMsIGV4dCkgLT4gICAgXG4gICAgICAgIFxuICAgIGV4dCA9ICdjb2ZmZWUnIGlmIGV4dCA9PSAna29mZmVlJ1xuICAgIGV4dCA9ICd0eHQnIGlmIGV4dCBub3QgaW4gU3ludGF4LmV4dHNcbiAgICAgICAgICAgIFxuICAgIGxpbmVubyA9IDBcbiAgICBsaW5lcy5tYXAgKHRleHQpIC0+IFxuICAgICAgICBcbiAgICAgICAgbGluZSA9IFxuICAgICAgICAgICAgY2h1bmtzOiBbXVxuICAgICAgICAgICAgY2hhcnM6ICAwXG4gICAgICAgICAgICBpbmRleDogIGxpbmVubysrXG4gICAgICAgICAgICBudW1iZXI6IGxpbmVub1xuICAgICAgICAgICAgZXh0OiAgICBleHRcblxuICAgICAgICBjaHVua3MgPSBrc3RyLnJlcGxhY2VUYWJzKHRleHQpLnNwbGl0IFNQQUNFXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVua3MubGVuZ3RoID09IDEgYW5kIGNodW5rc1swXSA9PSAnJ1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUgIyBlbXB0eSBsaW5lXG4gICAgICAgICAgICBcbiAgICAgICAgYyA9IDBcbiAgICAgICAgZm9yIHMgaW4gY2h1bmtzXG4gICAgICAgICAgICBpZiBzID09ICcnXG4gICAgICAgICAgICAgICAgYysrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gYysrXG4gICAgICAgICAgICAgICAgbCA9IHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgc2MgPSBjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBzZXBlcmF0ZSBieSBwdW5jdHVhdGlvblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSBQVU5DVC5leGVjIHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIG0uaW5kZXggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB3bCA9IG0uaW5kZXgtKGMtc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICB3ID0gc1tjLXNjLi4ubS5pbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOndsLCBtYXRjaDp3LCB2YWx1ZTondGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gd2xcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHR1cmQgPSBwdW5jdCA9IG1bMF1cblxuICAgICAgICAgICAgICAgICAgICBwaSA9IDBcbiAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDFcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIHBpIDwgcHVuY3QubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIHBjID0gcHVuY3RbcGldXG4gICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlID0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgMHhEODAwIDw9IHB1bmN0LmNoYXJDb2RlQXQocGkpIDw9IDB4REJGRiBhbmQgMHhEQzAwIDw9IHB1bmN0LmNoYXJDb2RlQXQocGkrMSkgPD0gMHhERkZGXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBjICs9IHB1bmN0W3BpKzFdXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBwaSArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDphZHZhbmNlLCBtYXRjaDpwYywgdHVyZDp0dXJkLCB2YWx1ZTp2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJkID0gdHVyZFthZHZhbmNlLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgcGkgPCBwdW5jdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOmFkdmFuY2UsIG1hdGNoOnB1bmN0W3BpLi5dLCB2YWx1ZTp2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgYyA8IHNjK2wgICAgICAgICMgY2hlY2sgZm9yIHJlbWFpbmluZyBub24tcHVuY3RcbiAgICAgICAgICAgICAgICAgICAgcmwgPSBzYytsLWMgICAgIyBsZW5ndGggb2YgcmVtYWluZGVyXG4gICAgICAgICAgICAgICAgICAgIHcgPSBzW2wtcmwuLl0gICMgdGV4dCAgIG9mIHJlbWFpbmRlciBcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6cmwsIG1hdGNoOncsIHZhbHVlOid0ZXh0J1xuICAgICAgICAgICAgICAgICAgICBjICs9IHJsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGxhc3QgPSBsaW5lLmNodW5rc1stMV1cbiAgICAgICAgICAgIGxpbmUuY2hhcnMgPSBsYXN0LnN0YXJ0ICsgbGFzdC5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICBsaW5lXG4gICAgICAgIFxuIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICBcbiMjI1xuICAgICAgICAgIFxuZXh0U3RhY2sgICA9IFtdXG5zdGFjayAgICAgID0gW11cbmhhbmRsICAgICAgPSBbXVxuZXh0VG9wICAgICA9IG51bGxcbnN0YWNrVG9wICAgPSBudWxsXG5ub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbnRvcFR5cGUgICAgPSAnJ1xuZXh0ICAgICAgICA9ICcnXG5saW5lICAgICAgID0gbnVsbFxuY2h1bmsgICAgICA9IG51bGxcbmNodW5rSW5kZXggPSAwXG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxuZmlsbENvbW1lbnQgPSAobikgLT5cbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgIGFkZFZhbHVlIGksICdjb21tZW50J1xuICAgIGlmIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGgtblxuICAgICAgICByZXN0Q2h1bmtzID0gbGluZS5jaHVua3NbY2h1bmtJbmRleCtuLi5dXG4gICAgICAgIG1pZ2h0QmVIZWFkZXIgPSB0cnVlXG4gICAgICAgIGZvciBjIGluIHJlc3RDaHVua3NcbiAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgIGlmIG1pZ2h0QmVIZWFkZXIgYW5kIG5vdCBIRUFERVIudGVzdCBjLm1hdGNoXG4gICAgICAgICAgICAgICAgbWlnaHRCZUhlYWRlciA9IGZhbHNlXG4gICAgICAgIGlmIG1pZ2h0QmVIZWFkZXJcbiAgICAgICAgICAgIGZvciBjIGluIHJlc3RDaHVua3NcbiAgICAgICAgICAgICAgICBjLnZhbHVlICs9ICcgaGVhZGVyJ1xuICAgIGxpbmUuY2h1bmtzLmxlbmd0aCAtIGNodW5rSW5kZXggKyBuXG4gICAgXG5oYXNoQ29tbWVudCA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBzdGFja1RvcCBhbmQgdG9wVHlwZSAhPSAncmVnZXhwIHRyaXBsZSdcbiAgICBpZiBzdGFja1RvcCBhbmQgc3RhY2tUb3AubGluZW5vID09IGxpbmUubnVtYmVyXG4gICAgICAgIHJldHVybiAjIGNvbW1lbnRzIGluc2lkZSB0cmlwbGUgcmVnZXhwIG9ubHkgdmFsaWQgb24gaW50ZXJuYWwgbGluZXM/XG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgZmlsbENvbW1lbnQgMVxuXG5ub29uQ29tbWVudCA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBzdGFja1RvcFxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiIGFuZCBjaHVua0luZGV4ID09IDBcbiAgICAgICAgZmlsbENvbW1lbnQgMVxuICAgIFxuc2xhc2hDb21tZW50ID0gLT5cblxuICAgIHJldHVybiBpZiBzdGFja1RvcFxuICAgIFxuICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggXCIvL1wiXG4gICAgICAgIGZpbGxDb21tZW50IDJcbiAgICBcbmJsb2NrQ29tbWVudCA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICBcbiAgICB0eXBlID0gJ2NvbW1lbnQgdHJpcGxlJ1xuICAgIFxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuICAgIFxuICAgIGlmIGNodW5rLnR1cmRbLi4yXSA9PSAnIyMjJ1xuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWVcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGUgICAgICAgICAgICBcblxuc3RhckNvbW1lbnQgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmRcbiAgICBcbiAgICB0eXBlID0gJ2NvbW1lbnQgdHJpcGxlJ1xuICAgIFxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlICE9IHR5cGVcbiAgICBcbiAgICBpZiBjaHVuay50dXJkWy4uMV0gPT0gJy8qJyBhbmQgbm90IHRvcFR5cGUgXG4gICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuICAgIGlmIGNodW5rLnR1cmRbLi4xXSA9PSAnKi8nIGFuZCB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuICAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG5cbmRhc2hBcnJvdyA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIG1hcmtGdW5jID0gLT5cbiAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ3RleHQnIFxuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMV0ubWF0Y2ggPT0gJz0nIGFuZCBsaW5lLmNodW5rc1syXS5tYXRjaCAhPSAnPidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSArPSAnIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgZWxzZSBpZiBsaW5lLmNodW5rc1sxXS5tYXRjaCA9PSAnOidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgKz0gJyBtZXRob2QnXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZFxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZC5zdGFydHNXaXRoICctPidcbiAgICAgICAgICAgIG1hcmtGdW5jKClcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2Z1bmN0aW9uIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxICdmdW5jdGlvbiBoZWFkJ1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5JyBvciBsaW5lLmNodW5rc1swXS50dXJkP1suLjFdID09ICdAOidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgZWxzZSBpZiBsaW5lLmNodW5rc1swXS5tYXRjaCA9PSAnQCcgYW5kIGxpbmUuY2h1bmtzWzFdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAnbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzJdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCBjbGFzcydcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQuc3RhcnRzV2l0aCAnPT4nXG4gICAgICAgICAgICBtYXJrRnVuYygpXG4gICAgICAgICAgICBhZGRWYWx1ZSAwICdmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSAnZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICBcbmNvbW1lbnRIZWFkZXIgPSAtPlxuICAgIFxuICAgIGlmIHRvcFR5cGUgPT0gJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpZiBIRUFERVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnRoaXNDYWxsID0gLT5cbiAgICBcbiAgICBzZXRWYWx1ZSAtMSAnZnVuY3Rpb24gY2FsbCdcbiAgICBpZiBnZXRtYXRjaCgtMikgPT0gJ0AnXG4gICAgICAgIHNldFZhbHVlIC0yICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgIDBcblxuY29mZmVlUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICAgICAgICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICfilrgnXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdtZXRhJ1xuICAgICAgICBcbiAgICBpZiBjaHVuay50dXJkID09ICd+PidcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdtZXRhJ1xuICAgICAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGgoJy4uJykgYW5kIHByZXYubWF0Y2ggIT0gJy4nXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkWzJdICE9ICcuJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAncmFuZ2UnXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkWzNdICE9ICcuJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyAncmFuZ2UnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJldkVuZCA9IHByZXYuc3RhcnQrcHJldi5sZW5ndGhcbiAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcoJyBhbmQgcHJldkVuZCA9PSBjaHVuay5zdGFydFxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG4gICAgICAgICAgICBlbHNlIGlmIHByZXZFbmQgPCBjaHVuay5zdGFydCAjIHNwYWNlZFxuICAgICAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoIGluICdAWyh7XCJcXCcnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjaHVuay5tYXRjaCBpbiAnKy0vJyBcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IG5leHQgb3IgbmV4dC5tYXRjaCAhPSAnPScgYW5kIG5leHQuc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcblxuY29mZmVlV29yZCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBwcmV2LnZhbHVlID09ICdwdW5jdCBtZXRhJ1xuICAgICAgICAgICAgaWYgY2h1bmsuc3RhcnQgPT0gcHJldi5zdGFydCsxXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMCAnbWV0YSdcbiAgICAgICAgICAgICAgICByZXR1cm4gMCAjIGdpdmUgc3dpdGNoIGEgY2hhbmNlXG4gICAgICAgIFxuICAgICAgICBpZiBwcmV2Lm1hdGNoIGluIFsnY2xhc3MnLCAnZXh0ZW5kcyddXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdjbGFzcydcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay52YWx1ZS5zdGFydHNXaXRoICdrZXl3b3JkJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiAxICMgd2UgYXJlIGRvbmUgd2l0aCB0aGUga2V5d29yZFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJ0AnXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAndGhpcydcbiAgICAgICAgICAgIGFkZFZhbHVlICAwICd0aGlzJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAocHJldi52YWx1ZS5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi52YWx1ZSA9PSAncHJvcGVydHknKSBhbmQgcHJldi5zdGFydCtwcmV2Lmxlbmd0aCA8IGNodW5rLnN0YXJ0ICMgc3BhY2VkXG4gICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICBcbnByb3BlcnR5ID0gLT4gIyB3b3JkXG4gICAgICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuICAgICAgICBcbiAgICAgICAgcHJldlByZXYgPSBnZXRDaHVuayAtMlxuICAgICAgICBcbiAgICAgICAgaWYgcHJldlByZXY/Lm1hdGNoICE9ICcuJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgc2V0VmFsdWUgMCAncHJvcGVydHknXG4gICAgICAgICAgICBpZiBwcmV2UHJldlxuICAgICAgICAgICAgICAgIGlmIHByZXZQcmV2LnZhbHVlIG5vdCBpbiBbJ3Byb3BlcnR5JywgJ251bWJlciddIGFuZCBub3QgcHJldlByZXYudmFsdWUuc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdvYmonXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbm5vb25Qcm9wID0gLT5cbiAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5zdGFydCtwcmV2Lmxlbmd0aCsxIDwgY2h1bmsuc3RhcnRcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUgIT0gJ29iaidcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbY2h1bmtJbmRleC0xLi4wXVxuICAgICAgICAgICAgICAgICAgICBpZiBpIDwgY2h1bmtJbmRleC0xIGFuZCBsaW5lLmNodW5rc1tpXS5zdGFydCtsaW5lLmNodW5rc1tpXS5sZW5ndGgrMSA8IGxpbmUuY2h1bmtzW2krMV0uc3RhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICd0ZXh0JyBvciBsaW5lLmNodW5rc1tpXS52YWx1ZSA9PSAnb2JqJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbaV0udmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgMFxuXG5ub29uUHVuY3QgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlICMgbWFrZXMgdGhpcyBzZW5zZSBoZXJlID8/P1xuXG4gICAgbm9vblByb3AoKVxuICAgICAgICAgICAgXG5ub29uV29yZCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGUgIyBtYWtlcyB0aGlzIHNlbnNlIGhlcmUgPz8/XG4gICAgXG4gICAgaWYgY2h1bmsuc3RhcnQgPT0gMFxuICAgICAgICBzZXRWYWx1ZSAwICdvYmonXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBub29uUHJvcCgpXG4gICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG51cmxQdW5jdCA9IC0+XG4gICAgXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJzovLycgXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCg0KSA9PSAnLicgYW5kIGdldENodW5rKDUpXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgMyAndXJsJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAzICd1cmwgZG9tYWluJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICA0ICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICA1ICd1cmwgdGxkJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiA2XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcuJ1xuICAgICAgICAgICAgaWYgbm90IHByZXYudmFsdWUuc3RhcnRzV2l0aCgnbnVtYmVyJykgYW5kIHByZXYudmFsdWUgIT0gJ3NlbXZlcicgYW5kIHByZXYubWF0Y2ggbm90IGluICdcXFxcLi8nXG4gICAgICAgICAgICAgICAgaWYgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgICAgICAgICAgaWYgbmV4dC5zdGFydCA9PSBjaHVuay5zdGFydCtjaHVuay5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVleHQgPSBuZXh0Lm1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBmaWxlZXh0IG5vdCBpbiAnXFxcXC4vJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xIGZpbGVleHQgKyAnIGZpbGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgIDAgZmlsZWV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAxIGZpbGVleHQgKyAnIGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXguLjBdXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0uc3RhcnQrbGluZS5jaHVua3NbaV0ubGVuZ3RoIDwgbGluZS5jaHVua3NbaSsxXT8uc3RhcnQgXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0udmFsdWUuZW5kc1dpdGggJ2RpcidcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS52YWx1ZS5zdGFydHNXaXRoICd1cmwnXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0ubWF0Y2ggPT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS52YWx1ZSA9ICdwdW5jdCBkaXInXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS52YWx1ZSA9ICd0ZXh0IGRpcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgIDBcbiAgICBcbnVybFdvcmQgPSAtPlxuICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBwcmV2Lm1hdGNoIGluICdcXFxcLydcbiAgICAgICAgICAgIG5leHQgPSBnZXRDaHVuayAxXG4gICAgICAgICAgICBpZiBub3QgbmV4dCBvciBuZXh0LnN0YXJ0ID4gY2h1bmsuc3RhcnQrY2h1bmsubGVuZ3RoIG9yIG5leHQubWF0Y2ggbm90IGluICdcXFxcLi8nXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2ZpbGUnXG4gICAgXG4jICAgICAgIDAwMCAgIDAwMDAwMDAgIFxuIyAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgICAgICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxuanNQdW5jdCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJygnXG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3RleHQnKSBvciBwcmV2LnZhbHVlID09ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG5qc1dvcmQgPSAtPlxuICAgIFxuICAgIGlmIGNodW5rLnZhbHVlID09ICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJz0nIGFuZCBnZXRWYWx1ZSgtMikuc3RhcnRzV2l0aCAndGV4dCdcbiAgICAgICAgICAgIHNldFZhbHVlIC0yICdmdW5jdGlvbidcbiAgICAwICMgd2UgbmVlZCB0aGlzIGhlcmVcbiAgICBcbmRpY3QgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJzonIGFuZCBub3QgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCAnOjonXG4gICAgICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgaWYgcHJldi52YWx1ZS5zcGxpdCgnICcpWzBdIGluIFsnc3RyaW5nJywgJ251bWJlcicsICd0ZXh0JywgJ2tleXdvcmQnXVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4jICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5qc29uUHVuY3QgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJzonXG4gICAgICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnXCInXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXgtMi4uMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbaV0udmFsdWUgPT0gJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS52YWx1ZSA9ICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbmpzb25Xb3JkID0gLT5cblxuICAgIGlmIHRvcFR5cGUgPT0gJ3N0cmluZyBkb3VibGUnIGFuZCBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiAnXCJeficgXG4gICAgICAgICAgICBpZiBOVU1CRVIudGVzdChnZXRtYXRjaCgwKSkgYW5kIGdldG1hdGNoKDEpID09ICcuJyBhbmQgTlVNQkVSLnRlc3QoZ2V0bWF0Y2goMikpIGFuZCBnZXRtYXRjaCgzKSA9PSAnLicgYW5kIE5VTUJFUi50ZXN0KGdldG1hdGNoKDQpKVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBzZW12ZXInIGlmIHByZXYubWF0Y2ggaW4gJ15+J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAxICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMiAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDMgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSA0ICdzZW12ZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIDVcbiAgICAgICAgICAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbmVzY2FwZSA9IC0+XG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ1xcXFwnIGFuZCAodG9wVHlwZT8uc3RhcnRzV2l0aCgncmVnZXhwJykgb3IgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJylcbiAgICAgICAgaWYgY2h1bmtJbmRleCA9PSAwIG9yIG5vdCBnZXRDaHVuaygtMSk/LmVzY2FwZVxuICAgICAgICAgICAgaWYgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICBjaHVuay5lc2NhcGUgPSB0cnVlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCAnZXNjYXBlJ1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcblxucmVnZXhwID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nXG4gICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIHJlZ2V4cCBlbmQnXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rSW5kZXggXG4gICAgICAgICAgICBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIG5leHQgPSBnZXRDaHVuayArMVxuICAgICAgICAgICAgaWYgbm90IHByZXYudmFsdWUuc3RhcnRzV2l0aCgncHVuY3QnKSBvciBwcmV2Lm1hdGNoIGluIFwiKV1cIlxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAocHJldi5zdGFydCtwcmV2Lmxlbmd0aCA8ICBjaHVuay5zdGFydCkgYW5kIG5leHQ/LnN0YXJ0ID4gIGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPT0gY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5leHQ/Lm1hdGNoID09ICc9J1xuICAgICAgICAgICAgcmV0dXJuIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBwdXNoU3RhY2sgdHlwZToncmVnZXhwJ1xuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAncmVnZXhwIHN0YXJ0J1xuICAgICAgICBcbiAgICBlc2NhcGUoKVxuICAgIFxudHJpcGxlUmVnZXhwID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgIFxuICAgIHR5cGUgPSAncmVnZXhwIHRyaXBsZSdcbiAgICBcbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSBub3QgaW4gWydpbnRlcnBvbGF0aW9uJywgdHlwZV1cbiAgICBpZiBjaHVuay50dXJkWy4uMl0gPT0gJy8vLydcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIGxpbmVubzpsaW5lLm51bWJlclxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZSAgIFxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbnNpbXBsZVN0cmluZyA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgICAgIFxuICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoIGluICdcIlxcJydcbiAgICAgICAgXG4gICAgICAgIHR5cGUgPSBzd2l0Y2ggY2h1bmsubWF0Y2ggXG4gICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZScgXG4gICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIGVsc2UgaWYgbm90Q29kZVxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICAgICAgXG4gICAgICAgIHB1c2hTdGFjayBzdHJvbmc6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgIGVzY2FwZSgpXG4gICAgICAgICAgICAgICAgICAgIFxudHJpcGxlU3RyaW5nID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgIHJldHVybiBpZiB0b3BUeXBlIGluIFsncmVnZXhwJydzdHJpbmcgc2luZ2xlJydzdHJpbmcgZG91YmxlJ11cbiAgICBcbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgIFxuICAgIHR5cGUgPSBzd2l0Y2ggY2h1bmsudHVyZFsuLjJdXG4gICAgICAgIHdoZW4gJ1wiXCJcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSB0cmlwbGUnIFxuICAgICAgICB3aGVuIFwiJycnXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG5cbiAgICBpZiB0eXBlXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgdHlwZSAhPSB0b3BUeXBlIGFuZCB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG4gICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHN0cm9uZzp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG4gICAgICAgIFxuICAgIGVzY2FwZSgpXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbm51bWJlciA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBOVU1CRVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICBcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtNCkgPT0gJ251bWJlciBmbG9hdCcgYW5kIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC01ICdwdW5jdCBzZW12ZXInIGlmIGdldG1hdGNoKC01KSBpbiAnXn4nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTQgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMyAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyJ1xuICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICBpZiBIRVhOVU0udGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgXG4gICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBoZXgnXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxuZmxvYXQgPSAtPlxuICAgIFxuICAgIGlmIEZMT0FULnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgcmV0dXJuIDFcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5jc3NXb3JkID0gLT5cbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaFstMi4uXSBpbiBbJ3B4JydlbScnZXgnXSBhbmQgTlVNQkVSLnRlc3QgY2h1bmsubWF0Y2hbLi4uLTJdXG4gICAgICAgIHNldFZhbHVlIDAgJ251bWJlcidcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2hbLTEuLl0gaW4gWydzJ10gYW5kIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoWy4uLi0xXVxuICAgICAgICBzZXRWYWx1ZSAwICdudW1iZXInXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJy4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAnY2xhc3MnXG4gICAgICAgICAgICBzZXRWYWx1ZSAgMCAnY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2gubGVuZ3RoID09IDMgb3IgY2h1bmsubWF0Y2gubGVuZ3RoID09IDZcbiAgICAgICAgICAgICAgICBpZiBIRVgudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSAnbnVtYmVyIGhleCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdmdW5jdGlvbidcbiAgICAgICAgICAgIHNldFZhbHVlICAwICdmdW5jdGlvbidcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnLSdcbiAgICAgICAgICAgIGlmIHByZXZQcmV2ID0gZ2V0Q2h1bmsgLTJcbiAgICAgICAgICAgICAgICBpZiBwcmV2UHJldi52YWx1ZSBpbiBbJ2NsYXNzJydmdW5jdGlvbiddXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xIHByZXZQcmV2LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwIHByZXZQcmV2LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuIyAwMCAgICAgMDAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG5tZFB1bmN0ID0gLT5cbiAgICBcbiAgICBpZiBjaHVua0luZGV4ID09IDAgXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgY2h1bmsudHVyZCBhbmQgY2h1bmsubWF0Y2ggaW4gJy0qJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID4gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgdHlwZSA9IFsnbGkxJydsaTInJ2xpMyddW2NodW5rLnN0YXJ0LzRdXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCB0eXBlICsgJyBtYXJrZXInXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJyMnXG4gICAgICAgICAgICBpZiBub3QgY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMSdcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAnaDEnXG4gICAgICAgICAgICBzd2l0Y2ggY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgIHdoZW4gJyMjJyBcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2gyJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ2gyJ1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIycgXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMydcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzICdoMydcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMjJyBcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2g0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDQgJ2g0J1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIyMjJyBcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2g1J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDUgJ2g1J1xuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICcqJ1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZD9bLi4xXSA9PSAnKionXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSAnYm9sZCdcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgMiB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcbiAgICAgICAgXG4gICAgICAgIHR5cGUgPSAnaXRhbGljJ1xuICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHRvcFR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnYCdcbiAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkP1suLjJdID09ICdgYGAnXG5cbiAgICAgICAgICAgIHR5cGUgPSAnY29kZSB0cmlwbGUnXG5cbiAgICAgICAgICAgIGlmIGdldG1hdGNoKDMpIGluIFsnY29mZmVlc2NyaXB0JydqYXZhc2NyaXB0JydqcyddXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMyAnY29tbWVudCdcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHVzaFN0YWNrIHdlYWs6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gJ2NvZGUnXG4gICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdG9wVHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG5cbiAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuXG5pbnRlcnBvbGF0aW9uID0gLT5cbiAgICBcbiAgICBpZiB0b3BUeXBlID09ICdzdHJpbmcgZG91YmxlJ1xuICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoIFwiXFwje1wiXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTonaW50ZXJwb2xhdGlvbicsIHdlYWs6dHJ1ZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcblxuICAgIGVsc2UgaWYgdG9wVHlwZSA9PSAnaW50ZXJwb2xhdGlvbidcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICd9J1xuICAgICAgICAgICAgYWRkVmFsdWUgMCAnc3RyaW5nIGludGVycG9sYXRpb24gZW5kJ1xuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5rZXl3b3JkID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIG5vdCBTeW50YXgubGFuZ1tleHRdXG4gICAgICAgICMgbG9nIFwibm8gbGFuZyBmb3IgZXh0PyAje2V4dH1cIlxuICAgICAgICByZXR1cm5cbiAgICBcbiAgICBpZiBTeW50YXgubGFuZ1tleHRdLmhhc093blByb3BlcnR5KGNodW5rLm1hdGNoKSBcbiAgICAgICAgY2h1bmsudmFsdWUgPSBTeW50YXgubGFuZ1tleHRdW2NodW5rLm1hdGNoXVxuICAgICAgICByZXR1cm4gIyBnaXZlIGNvZmZlZUZ1bmMgYSBjaGFuY2UsIG51bWJlciBiYWlscyBmb3IgdXNcbiAgICAgICAgICAgICAgICBcbiMgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgICAgIFxuIyAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICBcbiMgIDAwMCAwMDAgICAwMDAgMCAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbnhtbFB1bmN0ID0gLT4gXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnPC8nXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAna2V5d29yZCdcbiAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggaW4gWyc8Jyc+J11cbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ2tleXdvcmQnXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuXG5jcHBNYWNybyA9IC0+IFxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgIGFkZFZhbHVlIDAgJ2RlZmluZSdcbiAgICAgICAgc2V0VmFsdWUgMSAnZGVmaW5lJ1xuICAgICAgICByZXR1cm4gMlxuXG4jICAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwXG4jICAgICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5zaFB1bmN0ID0gLT5cbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnLycgYW5kIGdldENodW5rKC0xKT8uc3RhcnQgKyBnZXRDaHVuaygtMSk/Lmxlbmd0aCA9PSBjaHVuay5zdGFydFxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgLTEgJ2RpcidcbiAgICBcbiAgICBpZiBjaHVuay50dXJkID09ICctLScgYW5kIGdldENodW5rKDIpPy5zdGFydCA9PSBjaHVuay5zdGFydCsyXG4gICAgICAgIGFkZFZhbHVlIDAgJ2FyZ3VtZW50J1xuICAgICAgICBhZGRWYWx1ZSAxICdhcmd1bWVudCdcbiAgICAgICAgc2V0VmFsdWUgMiAnYXJndW1lbnQnXG4gICAgICAgIHJldHVybiAzXG4gICAgICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICctJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgYWRkVmFsdWUgMCAnYXJndW1lbnQnXG4gICAgICAgIHNldFZhbHVlIDEgJ2FyZ3VtZW50J1xuICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG5zdGFja2VkID0gLT5cblxuICAgIGlmIHN0YWNrVG9wXG4gICAgICAgIHJldHVybiBpZiBzdGFja1RvcC53ZWFrXG4gICAgICAgIGlmIHN0YWNrVG9wLnN0cm9uZ1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSB0b3BUeXBlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIHRvcFR5cGVcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICBcbnB1c2hFeHQgPSAobXRjaCkgLT5cbiAgICBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICBleHRTdGFjay5wdXNoIGV4dFRvcFxuICAgIFxuYWN0RXh0ID0gLT5cbiAgICBzdGFjayAgICA9IFtdXG4gICAgc3RhY2tUb3AgPSBudWxsXG4gICAgdG9wVHlwZSAgPSAnJ1xuICAgIG5vdENvZGUgID0gZmFsc2VcbiAgICBcbnBvcEV4dCA9IC0+XG4gICAgc3RhY2sgPSBleHRUb3Auc3RhY2tcbiAgICBsaW5lLmV4dCA9IGV4dFRvcC5zdGFydC5leHRcbiAgICBleHRTdGFjay5wb3AoKSAgICAgICAgICAgICAgIFxuICAgIGV4dFRvcCA9IGV4dFN0YWNrWy0xXVxuICAgIFxuICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgbm90Q29kZSA9IHN0YWNrVG9wIGFuZCB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcbiAgICBcbnB1c2hTdGFjayA9IChvKSAtPiBcbiAgICBzdGFjay5wdXNoIG8gXG4gICAgc3RhY2tUb3AgPSBvXG4gICAgdG9wVHlwZSA9IG8udHlwZVxuICAgIG5vdENvZGUgPSB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcbiAgICBcbnBvcFN0YWNrID0gLT4gXG4gICAgc3RhY2sucG9wKClcbiAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgIG5vdENvZGUgPSBzdGFja1RvcCBhbmQgdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG4gICAgXG5nZXRDaHVuayA9IChkKSAtPiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdXG5zZXRWYWx1ZSA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlID0gdmFsdWVcbmdldFZhbHVlID0gKGQpIC0+IGdldENodW5rKGQpPy52YWx1ZSA/ICcnXG5nZXRtYXRjaCA9IChkKSAtPiBnZXRDaHVuayhkKT8ubWF0Y2ggPyAnJ1xuYWRkVmFsdWUgPSAoZCwgdmFsdWUpIC0+IFxuICAgIGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIFxuICAgICAgICBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlICs9ICcgJyArIHZhbHVlXG4gICAgMVxuICAgICAgICBcbmFkZFZhbHVlcyA9IChuLHZhbHVlKSAtPiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgIGFkZFZhbHVlIGksIHZhbHVlXG4gICAgblxuICAgIFxuaGFuZGxlcnMgPSBcbiAgICBjb2ZmZWU6IFxuICAgICAgICAgIHB1bmN0OlsgYmxvY2tDb21tZW50LCBoYXNoQ29tbWVudCwgdHJpcGxlUmVnZXhwLCBjb2ZmZWVQdW5jdCwgdHJpcGxlU3RyaW5nLCBzaW1wbGVTdHJpbmcsIGludGVycG9sYXRpb24sIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0IF1cbiAgICAgICAgICB3b3JkOiBbIGtleXdvcmQsIGNvZmZlZVdvcmQsIG51bWJlciwgcHJvcGVydHkgXVxuICAgIG5vb246IHB1bmN0Olsgbm9vbkNvbW1lbnQsICBub29uUHVuY3QsIHVybFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIG5vb25Xb3JkLCB1cmxXb3JkLCBudW1iZXIgICAgICAgICAgXVxuICAgIGpzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIGpzUHVuY3QsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIGRpY3QgXSwgd29yZDpbIGtleXdvcmQsIGpzV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSAgXVxuICAgIHRzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIGpzUHVuY3QsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIGRpY3QgXSwgd29yZDpbIGtleXdvcmQsIGpzV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSAgXVxuICAgIGlzczogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGluaTogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbICAgICAgICAgIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGNwcDogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQgICAgICAgICAgICAgXVxuICAgIGhwcDogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQgICAgICAgICAgICAgXVxuICAgIGM6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQgICAgICAgICAgICAgXVxuICAgIGg6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQgICAgICAgICAgICAgXVxuICAgIGNzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIHB1ZzogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIHN0eWw6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIGNzczogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIHNhc3M6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIHNjc3M6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIHN2ZzogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGh0bWw6IHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGh0bTogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIHNoOiAgIHB1bmN0OlsgaGFzaENvbW1lbnQsICBzaW1wbGVTdHJpbmcsIHVybFB1bmN0LCBzaFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIGpzb246IHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIGpzb25QdW5jdCwgdXJsUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGpzb25Xb3JkLCB1cmxXb3JkLCBudW1iZXIgXVxuICAgIGxvZzogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHVybFB1bmN0LCBkaWN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIG1kOiAgIHB1bmN0OlsgICAgICAgICAgICAgICAgICAgIG1kUHVuY3QsIHVybFB1bmN0LCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGZpc2g6IHB1bmN0OlsgICAgICAgICAgICAgICAgaGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIFxuZm9yIGV4dCBpbiBTeW50YXguZXh0c1xuICAgIGlmIG5vdCBoYW5kbGVyc1tleHRdP1xuICAgICAgICBoYW5kbGVyc1tleHRdID0gcHVuY3Q6WyBzaW1wbGVTdHJpbmcgXSwgd29yZDpbIG51bWJlciBdXG4gICAgICAgIFxuZm9yIGV4dCxvYmogb2YgaGFuZGxlcnNcbiAgICBoYW5kbGVyc1tleHRdLnB1bmN0LnB1c2ggc3RhY2tlZFxuICAgIGhhbmRsZXJzW2V4dF0ud29yZC5wdXNoIHN0YWNrZWRcbiAgICBcbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbuKWuGRvYyAnYmxvY2tlZCBsaW5lcydcbiAgICBcbiAgICBsaW5lczogYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuICAgIFxuICAgIHJldHVybnMgbGluZXMgd2l0aCBcbiAgICAtICdleHQnIHN3aXRjaGVkIGluIHNvbWUgbGluZXNcbiAgICAtICd2YWx1ZScgY2hhbmdlZCBpbiBjaHVua3MgdGhhdCBtYXRjaCBsYW5ndWFnZSBwYXR0ZXJuc1xuXG5ibG9ja2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIGV4dFN0YWNrICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBbXVxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIGV4dFRvcCAgICAgPSBudWxsXG4gICAgc3RhY2tUb3AgICA9IG51bGxcbiAgICBub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbiAgICB0b3BUeXBlICAgID0gJydcbiAgICBleHQgICAgICAgID0gJydcbiAgICBsaW5lICAgICAgID0gbnVsbFxuICAgIGNodW5rICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IDBcbiAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcblxuICAgICAgICBpZiBzdGFja1RvcFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdGFja1RvcC50eXBlID09ICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAgICAgICAgICBpZiBub3QgSEVBREVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBpZiBtaWdodEJlSGVhZGVyXG4gICAgICAgICAgICAgICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLmZpbGwgdGhlbiBwb3BTdGFjaygpXG4gICAgICAgIFxuICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgIGlmIGV4dFRvcC5zd2l0Y2guaW5kZW50IGFuZCBsaW5lLmNodW5rc1swXT8uc3RhcnQgPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5zdGFydFxuICAgICAgICAgICAgICAgIHBvcEV4dCgpICAgICAgICAgICAgICAgICAgICAgICAgIyBlbmQgb2YgZXh0ZW5zaW9uIGJsb2NrIHJlYWNoZWQgdGhhdCBpcyB0ZXJtaW5hdGVkIGJ5IGluZGVudGF0aW9uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3dpdGNoLnRvICAgICAjIG1ha2Ugc3VyZSB0aGUgY3VycmVudCBsaW5lIGV4dCBtYXRjaGVzIHRoZSB0b3Btb3N0IGZyb20gc3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZXh0ICE9IGxpbmUuZXh0ICAgICAgICAgICAgICAgICAgICAgICMgZWl0aGVyIGF0IHN0YXJ0IG9mIGZpbGUgb3Igd2Ugc3dpdGNoZWQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBhY3RFeHQoKVxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICAgICAgaWYgbm90IGhhbmRsXG4gICAgICAgICAgICAgICAg4pa4ZGJnIGxpbmVcbiAgICAgICAgICAgICAgICDilrhkYmcgaGFuZGxlcnNcbiAgICAgICAgICAgIOKWuGFzc2VydCBoYW5kbFxuICAgICAgICAgICAgXG4gICAgICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAgICAgXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmsgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4XVxuICAgICAgICAgICAgYmVmb3JlSW5kZXggPSBjaHVua0luZGV4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnZhbHVlID09ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5lbmQ/IGFuZCBleHRUb3Auc3dpdGNoLmVuZCA9PSBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgY2h1bmsudHVyZC5sZW5ndGgsIGV4dFRvcC5zd2l0Y2guYWRkIGlmIGV4dFRvcC5zd2l0Y2guYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BFeHQoKSAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC5wdW5jdCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlICMgd29yZHMsIG51bWJlcnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBub3Qgbm90Q29kZVxuICAgICAgICAgICAgICAgICAgICBpZiBtdGNoID0gU3ludGF4LnN3dGNoW2xpbmUuZXh0XT9bY2h1bmsubWF0Y2hdIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHVyZENodW5rID0gZ2V0Q2h1bmsgLW10Y2gudHVyZC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoLnR1cmQgPT0gKHR1cmRDaHVuaz8udHVyZCA/IHR1cmRDaHVuaz8ubWF0Y2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcHVzaCBhIG5ldyBleHRlbnNpb24gb250byB0aGUgc3RhY2ssIGV4dCB3aWxsIGNoYW5nZSBvbiBzdGFydCBvZiBuZXh0IGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaEV4dCBtdGNoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC53b3JkID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gYmVmb3JlSW5kZXhcbiAgICAgICAgICAgICAgICBjaHVua0luZGV4KytcbiAgICBsaW5lc1xuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbnBhcnNlID0gKGxpbmVzLCBleHQ9J2NvZmZlZScpIC0+IGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBcbiAgICBrb2xvcjogICByZXF1aXJlICcuL2tvbG9yJ1xuICAgIHBhcnNlOiAgIHBhcnNlXG4gICAgY2h1bmtlZDogY2h1bmtlZFxuICAgIHJhbmdlczogIChsaW5lLCBleHQ9J2NvZmZlZScpICAtPiBwYXJzZShbbGluZV0sIGV4dClbMF0uY2h1bmtzXG4gICAgZGlzc2VjdDogKGxpbmVzLCBleHQ9J2NvZmZlZScpIC0+IHBhcnNlKGxpbmVzLCBleHQpLm1hcCAobCkgLT4gbC5jaHVua3NcbiAgICBleHRzOiAgICBTeW50YXguZXh0c1xuICAgIFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxu4pa4dGVzdCAncHJvZmlsZSdcbiAgICBcbiAgICDilrhwcm9maWxlICctLS0tLSdcbiAgICAgICAgXG4gICAgICAgIHRleHQwID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL2NvZmZlZS9ub2Rlcy5jb2ZmZWVcIiAjIDYtMTFtc1xuICAgICAgICB0ZXh0MSA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9L3Rlc3QuY29mZmVlXCIgIyA1MC0xMjDOvHNcbiAgICBcbiAgICAgICAgbGluZXMwID0gdGV4dDAuc3BsaXQgJ1xcbidcbiAgICAgICAgbGluZXMxID0gdGV4dDEuc3BsaXQgJ1xcbidcblxuICAgIGZvciBpIGluIFswLi41XVxuICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgICAgIFxuICAgIGZvciBpIGluIFswLi4xNV1cbiAgICAgICAgXG4gICAgICAgIOKWuHByb2ZpbGUgJ2xpbmVzMCdcbiAgICAgICAgICAgIGJsb2NrcyBsaW5lczBcbiAgICAgICAgICAgICJdfQ==
//# sourceURL=../coffee/klor.coffee