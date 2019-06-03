// koffee 0.56.0

/*
000   000  000       0000000   00000000   
000  000   000      000   000  000   000  
0000000    000      000   000  0000000    
000  000   000      000   000  000   000  
000   000  0000000   0000000   000   000
 */
var FLOAT, HEADER, HEX, HEXNUM, NUMBER, PUNCT, SPACE, actExt, addValue, addValues, blockComment, blocked, chunk, chunkIndex, chunked, codeTypes, coffeePunct, coffeeWord, commentHeader, cppMacro, cssWord, dashArrow, dict, escape, ext, extStack, extTop, exts, fillComment, float, getChunk, getValue, getmatch, handl, handlers, hashComment, interpolation, j, jsPunct, jsWord, jsonPunct, jsonWord, k, keyword, lang, len, len1, line, mdPunct, noonComment, noonProp, noonPunct, noonWord, notCode, number, obj, pad, parse, popExt, popStack, property, pushExt, pushStack, ref, regexp, replaceTabs, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, starComment, swtch, thisCall, topType, tripleRegexp, tripleString, urlPunct, urlWord, xmlPunct,
    indexOf = [].indexOf;

;

ref = require('./lang.json'), exts = ref.exts, lang = ref.lang;

swtch = {
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
    var c, i, k, len1, len2, mightBeHeader, p, q, ref1, restChunks;
    for (i = k = 0, ref1 = n; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
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
    var prev, prevPrev, ref1, ref2, ref3;
    if (((ref1 = chunk.match.slice(-2)) === 'px' || ref1 === 'em' || ref1 === 'ex') && NUMBER.test(chunk.match.slice(0, -2))) {
        setValue(0, 'number');
        return 1;
    }
    if (((ref2 = chunk.match.slice(-1)) === 's') && NUMBER.test(chunk.match.slice(0, -1))) {
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
                if ((ref3 = prevPrev.value) === 'class' || ref3 === 'function') {
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
    var ref1, ref2, ref3, ref4;
    if (chunk.match === '/' && ((ref1 = getChunk(-1)) != null ? ref1.start : void 0) + ((ref2 = getChunk(-1)) != null ? ref2.length : void 0) === chunk.start) {
        return addValue(-1, 'dir');
    }
    if (chunk.turd === '--' && ((ref3 = getChunk(2)) != null ? ref3.start : void 0) === chunk.start + 2) {
        addValue(0, 'argument');
        addValue(1, 'argument');
        setValue(2, 'argument');
        return 3;
    }
    if (chunk.match === '-' && ((ref4 = getChunk(1)) != null ? ref4.start : void 0) === chunk.start + 1) {
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
    var advance, beforeIndex, hnd, len2, len3, len4, len5, len6, mightBeHeader, mtch, p, q, r, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t, turdChunk, u;
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
                ref1 = line.chunks;
                for (q = 0, len3 = ref1.length; q < len3; q++) {
                    chunk = ref1[q];
                    if (!HEADER.test(chunk.match)) {
                        mightBeHeader = false;
                        break;
                    }
                }
                if (mightBeHeader) {
                    ref2 = line.chunks;
                    for (r = 0, len4 = ref2.length; r < len4; r++) {
                        chunk = ref2[r];
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
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1097[39m', line);
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1098[39m', handlers);
            }
            if (!(handl)) {
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1099[39m', '[1m[97massertion failure![39m[22m');

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
                for (t = 0, len5 = ref5.length; t < len5; t++) {
                    hnd = ref5[t];
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
                        }
                    }
                }
                ref9 = (ref8 = handl.word) != null ? ref8 : [];
                for (u = 0, len6 = ref9.length; u < len6; u++) {
                    hnd = ref9[u];
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

pad = function(l) {
    var s;
    s = '';
    while (l > 0) {
        s += ' ';
        l--;
    }
    return s;
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

module.exports = {
    kolor: require('./kolor'),
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
    }
};

;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2xvci5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaXZCQUFBO0lBQUE7Ozs7QUFrQ0EsTUFBaUIsT0FBQSxDQUFRLGFBQVIsQ0FBakIsRUFBRSxlQUFGLEVBQVE7O0FBRVIsS0FBQSxHQUNJO0lBQUEsTUFBQSxFQUNJO1FBQUEsR0FBQSxFQUFLO1lBQUEsSUFBQSxFQUFLLEdBQUw7WUFBUyxFQUFBLEVBQUcsSUFBWjtZQUFpQixNQUFBLEVBQVEsQ0FBekI7U0FBTDtLQURKO0lBRUEsRUFBQSxFQUNJO1FBQUEsWUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsUUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7WUFBaUMsR0FBQSxFQUFJLGFBQXJDO1NBQWQ7UUFDQSxVQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxJQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtZQUFpQyxHQUFBLEVBQUksYUFBckM7U0FEZDtLQUhKOzs7QUFNSixLQUFBLHNDQUFBOztJQUNJLEtBQUssQ0FBQyxFQUFHLENBQUEsR0FBQSxDQUFULEdBQWdCO1FBQUEsSUFBQSxFQUFLLEtBQUw7UUFBVyxFQUFBLEVBQUcsR0FBZDtRQUFtQixHQUFBLEVBQUksS0FBdkI7UUFBNkIsR0FBQSxFQUFJLGFBQWpDOztBQURwQjs7QUFHQSxLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQUNULEtBQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxHQUFBLEdBQVM7O0FBRVQsU0FBQSxHQUFZLENBQUMsZUFBRCxFQUFpQixhQUFqQjs7QUFNaUU7O0FBcUI3RSxPQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsR0FBUjtBQUVOLFFBQUE7SUFBQSxJQUFrQixHQUFBLEtBQU8sUUFBekI7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RSxDQUFDO0lBQS9DLENBSlQ7SUFLQSxPQUFBLEVBQVMsU0FBQyxLQUFELEVBQVEsR0FBUjs7WUFBUSxNQUFJOztlQUFhLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixDQUFpQixDQUFDLEdBQWxCLENBQXNCLFNBQUMsQ0FBRDttQkFBTyxDQUFDLENBQUM7UUFBVCxDQUF0QjtJQUF6QixDQUxUIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4wMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbuKWuGlmIG9wdHMubGFuZyAjIGtvZmZlZSAtLWxhbmcga2xvci5jb2ZmZWVcbiAgICBcbiAgICBmcyAgID0gcmVxdWlyZSAnZnMnXG4gICAgbm9vbiA9IHJlcXVpcmUgJ25vb24nXG4gICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG4gICAgXG4gICAgbm9vbkZpbGUgPSBwYXRoLmpvaW4gX19kaXJuYW1lLCAnbGFuZy5ub29uJ1xuICAgIGpzb25GaWxlID0gcGF0aC5qb2luIF9fZGlybmFtZSwgJy4uJyAnanMnICdsYW5nLmpzb24nXG4gICAgXG4gICAgbG9nICdjb21waWxlOicgbm9vbkZpbGVcbiAgICBsb2cgJ291dHB1dDonICBqc29uRmlsZVxuXG4gICAgbGFuZyA9IHt9XG4gICAgZXh0cyA9IFsndHh0Jydsb2cnJ2tvZmZlZSddIFxuICAgIGZvciBuYW1lcywga2V5d29yZHMgb2Ygbm9vbi5sb2FkIG5vb25GaWxlXG4gICAgICAgIFxuICAgICAgICBmb3IgZXh0IGluIG5hbWVzLnNwbGl0IC9cXHMvXG4gICAgICAgICAgICBleHRzLnB1c2goZXh0KSBpZiBleHQgbm90IGluIGV4dHNcbiAgICAgICAgICAgIGxhbmdbZXh0XSA/PSB7fVxuICAgICAgICAgICAgZm9yIHZhbHVlLHdvcmRzIG9mIGtleXdvcmRzXG4gICAgICAgICAgICAgICAgZm9yIHdvcmQgaW4gd29yZHNcbiAgICAgICAgICAgICAgICAgICAgbGFuZ1tleHRdW3dvcmRdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAganNvbiA9IEpTT04uc3RyaW5naWZ5IHtleHRzOmV4dHMsIGxhbmc6bGFuZ30sIG51bGwsICcgICAgJ1xuICAgIGZzLndyaXRlRmlsZVN5bmMganNvbkZpbGUsIGpzb24sICd1dGY4J1xuICAgXG57IGV4dHMsIGxhbmcgfSA9IHJlcXVpcmUgJy4vbGFuZy5qc29uJ1xuICAgIFxuc3d0Y2ggPSBcbiAgICBjb2ZmZWU6IFxuICAgICAgICBkb2M6IHR1cmQ6J+KWuCcgdG86J21kJyBpbmRlbnQ6IDFcbiAgICBtZDogICAgIFxuICAgICAgICBjb2ZmZWVzY3JpcHQ6IHR1cmQ6J2BgYCcgdG86J2NvZmZlZScgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgIGphdmFzY3JpcHQ6ICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcbiAgICAgICAgXG5mb3IgZXh0IGluIGV4dHNcbiAgICBzd3RjaC5tZFtleHRdID0gdHVyZDonYGBgJyB0bzpleHQsIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuICAgICAgICAgICAgXG5TUEFDRSAgPSAvXFxzL1xuSEVBREVSID0gL14wKyQvXG5QVU5DVCAgPSAvXFxXKy9nXG5OVU1CRVIgPSAvXlxcZCskL1xuRkxPQVQgID0gL15cXGQrZiQvXG5IRVhOVU0gPSAvXjB4W2EtZkEtRlxcZF0rJC9cbkhFWCAgICA9IC9eW2EtZkEtRlxcZF0rJC9cblxuY29kZVR5cGVzID0gWydpbnRlcnBvbGF0aW9uJyAnY29kZSB0cmlwbGUnXVxuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcblxu4pa4ZG9jICdjaHVua2VkIGxpbmVzLCBleHQnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgIHJldHVybnMgYXJyYXkgb2ZcbiAgICAgICAgXG4gICAgICAgIGNodW5rczogW1xuICAgICAgICAgICAgICAgICAgICB0dXJkOiAgIHNcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6ICBzXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAgc1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogIG5cbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICBleHQ6ICAgIHNcbiAgICAgICAgY2hhcnM6ICBuXG4gICAgICAgIGluZGV4OiAgblxuICAgICAgICBudW1iZXI6IG4rMVxuXG5jaHVua2VkID0gKGxpbmVzLCBleHQpIC0+ICAgIFxuICAgICAgICBcbiAgICBleHQgPSAnY29mZmVlJyBpZiBleHQgPT0gJ2tvZmZlZSdcbiAgICBleHQgPSAndHh0JyBpZiBleHQgbm90IGluIGV4dHNcbiAgICAgICAgICAgIFxuICAgIGxpbmVubyA9IDBcbiAgICBsaW5lcy5tYXAgKHRleHQpIC0+IFxuICAgICAgICBcbiAgICAgICAgbGluZSA9IFxuICAgICAgICAgICAgY2h1bmtzOiBbXVxuICAgICAgICAgICAgY2hhcnM6ICAwXG4gICAgICAgICAgICBpbmRleDogIGxpbmVubysrXG4gICAgICAgICAgICBudW1iZXI6IGxpbmVub1xuICAgICAgICAgICAgZXh0OiAgICBleHRcblxuICAgICAgICBjaHVua3MgPSByZXBsYWNlVGFicyh0ZXh0KS5zcGxpdCBTUEFDRVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmtzLmxlbmd0aCA9PSAxIGFuZCBjaHVua3NbMF0gPT0gJydcbiAgICAgICAgICAgIHJldHVybiBsaW5lICMgZW1wdHkgbGluZVxuICAgICAgICAgICAgXG4gICAgICAgIGMgPSAwXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGlsZSBtID0gUFVOQ1QuZXhlYyBzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgd2wgPSBtLmluZGV4LShjLXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHNbYy1zYy4uLm0uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDp3bCwgbWF0Y2g6dywgdmFsdWU6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0dXJkID0gcHVuY3QgPSBtWzBdXG5cbiAgICAgICAgICAgICAgICAgICAgcGkgPSAwXG4gICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgPSAxXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgcGkgPCBwdW5jdC5sZW5ndGgtMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGMgPSBwdW5jdFtwaV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAweEQ4MDAgPD0gcHVuY3QuY2hhckNvZGVBdChwaSkgPD0gMHhEQkZGIGFuZCAweERDMDAgPD0gcHVuY3QuY2hhckNvZGVBdChwaSsxKSA8PSAweERGRkZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlID0gMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGMgKz0gcHVuY3RbcGkrMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOmFkdmFuY2UsIG1hdGNoOnBjLCB0dXJkOnR1cmQsIHZhbHVlOnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHR1cmQgPSB0dXJkW2FkdmFuY2UuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBwaSA8IHB1bmN0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6YWR2YW5jZSwgbWF0Y2g6cHVuY3RbcGkuLl0sIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXIgXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOnJsLCBtYXRjaDp3LCB2YWx1ZTondGV4dCdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoXG4gICAgICAgICAgICBsYXN0ID0gbGluZS5jaHVua3NbLTFdXG4gICAgICAgICAgICBsaW5lLmNoYXJzID0gbGFzdC5zdGFydCArIGxhc3QubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgbGluZVxuICAgICAgICBcbiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgXG4jIyNcbiAgICAgICAgICBcbmV4dFN0YWNrICAgPSBbXVxuc3RhY2sgICAgICA9IFtdXG5oYW5kbCAgICAgID0gW11cbmV4dFRvcCAgICAgPSBudWxsXG5zdGFja1RvcCAgID0gbnVsbFxubm90Q29kZSAgICA9IGZhbHNlICMgc2hvcnRjdXQgZm9yIHRvcCBvZiBzdGFjayBub3QgaW4gY29kZVR5cGVzXG50b3BUeXBlICAgID0gJydcbmV4dCAgICAgICAgPSAnJ1xubGluZSAgICAgICA9IG51bGxcbmNodW5rICAgICAgPSBudWxsXG5jaHVua0luZGV4ID0gMFxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmZpbGxDb21tZW50ID0gKG4pIC0+XG4gICAgXG4gICAgZm9yIGkgaW4gWzAuLi5uXVxuICAgICAgICBhZGRWYWx1ZSBpLCAnY29tbWVudCdcbiAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLW5cbiAgICAgICAgcmVzdENodW5rcyA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrbi4uXVxuICAgICAgICBtaWdodEJlSGVhZGVyID0gdHJ1ZVxuICAgICAgICBmb3IgYyBpbiByZXN0Q2h1bmtzXG4gICAgICAgICAgICBjLnZhbHVlID0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBpZiBtaWdodEJlSGVhZGVyIGFuZCBub3QgSEVBREVSLnRlc3QgYy5tYXRjaFxuICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSBmYWxzZVxuICAgICAgICBpZiBtaWdodEJlSGVhZGVyXG4gICAgICAgICAgICBmb3IgYyBpbiByZXN0Q2h1bmtzXG4gICAgICAgICAgICAgICAgYy52YWx1ZSArPSAnIGhlYWRlcidcbiAgICBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgblxuICAgIFxuaGFzaENvbW1lbnQgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgc3RhY2tUb3AgYW5kIHRvcFR5cGUgIT0gJ3JlZ2V4cCB0cmlwbGUnXG4gICAgaWYgc3RhY2tUb3AgYW5kIHN0YWNrVG9wLmxpbmVubyA9PSBsaW5lLm51bWJlclxuICAgICAgICByZXR1cm4gIyBjb21tZW50cyBpbnNpZGUgdHJpcGxlIHJlZ2V4cCBvbmx5IHZhbGlkIG9uIGludGVybmFsIGxpbmVzP1xuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgIGZpbGxDb21tZW50IDFcblxubm9vbkNvbW1lbnQgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgc3RhY2tUb3BcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIiBhbmQgY2h1bmtJbmRleCA9PSAwXG4gICAgICAgIGZpbGxDb21tZW50IDFcbiAgICBcbnNsYXNoQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgc3RhY2tUb3BcbiAgICBcbiAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoIFwiLy9cIlxuICAgICAgICBmaWxsQ29tbWVudCAyXG4gICAgXG5ibG9ja0NvbW1lbnQgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgXG4gICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZSdcbiAgICBcbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSBub3QgaW4gWydpbnRlcnBvbGF0aW9uJywgdHlwZV1cbiAgICBcbiAgICBpZiBjaHVuay50dXJkWy4uMl0gPT0gJyMjIydcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlICAgICAgICAgICAgXG5cbnN0YXJDb21tZW50ID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkXG4gICAgXG4gICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZSdcbiAgICBcbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSAhPSB0eXBlXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZFsuLjFdID09ICcvKicgYW5kIG5vdCB0b3BUeXBlIFxuICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZSAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcbiAgICBpZiBjaHVuay50dXJkWy4uMV0gPT0gJyovJyBhbmQgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcbiAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuXG5kYXNoQXJyb3cgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBtYXJrRnVuYyA9IC0+XG4gICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICd0ZXh0JyBcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzFdLm1hdGNoID09ICc9JyBhbmQgbGluZS5jaHVua3NbMl0ubWF0Y2ggIT0gJz4nXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgKz0gJyBmdW5jdGlvbidcbiAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbMV0ubWF0Y2ggPT0gJzonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlICs9ICcgbWV0aG9kJ1xuICAgIFxuICAgIGlmIGNodW5rLnR1cmRcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQuc3RhcnRzV2l0aCAnLT4nXG4gICAgICAgICAgICBtYXJrRnVuYygpXG4gICAgICAgICAgICBhZGRWYWx1ZSAwICdmdW5jdGlvbiB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSAnZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleScgb3IgbGluZS5jaHVua3NbMF0udHVyZD9bLi4xXSA9PSAnQDonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbMF0ubWF0Y2ggPT0gJ0AnIGFuZCBsaW5lLmNodW5rc1sxXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAncHVuY3QgbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ21ldGhvZCBjbGFzcydcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1syXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkLnN0YXJ0c1dpdGggJz0+J1xuICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEgJ2Z1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgXG5jb21tZW50SGVhZGVyID0gLT5cbiAgICBcbiAgICBpZiB0b3BUeXBlID09ICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaWYgSEVBREVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG50aGlzQ2FsbCA9IC0+XG4gICAgXG4gICAgc2V0VmFsdWUgLTEgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgaWYgZ2V0bWF0Y2goLTIpID09ICdAJ1xuICAgICAgICBzZXRWYWx1ZSAtMiAncHVuY3QgZnVuY3Rpb24gY2FsbCdcbiAgICAwXG5cbmNvZmZlZVB1bmN0ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgICAgICAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAn4pa4J1xuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAnbWV0YSdcbiAgICAgICAgXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnfj4nXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAnbWV0YSdcbiAgICAgICAgXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoKCcuLicpIGFuZCBwcmV2Lm1hdGNoICE9ICcuJ1xuICAgICAgICAgICAgaWYgY2h1bmsudHVyZFsyXSAhPSAnLidcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ3JhbmdlJ1xuICAgICAgICAgICAgaWYgY2h1bmsudHVyZFszXSAhPSAnLidcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgJ3JhbmdlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3RleHQnKSBvciBwcmV2LnZhbHVlID09ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHByZXZFbmQgPSBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoXG4gICAgICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKCcgYW5kIHByZXZFbmQgPT0gY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgZWxzZSBpZiBwcmV2RW5kIDwgY2h1bmsuc3RhcnQgIyBzcGFjZWRcbiAgICAgICAgICAgICAgICBpZiBjaHVuay5tYXRjaCBpbiAnQFsoe1wiXFwnJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY2h1bmsubWF0Y2ggaW4gJystLycgXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBnZXRDaHVuayAxXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBuZXh0IG9yIG5leHQubWF0Y2ggIT0gJz0nIGFuZCBuZXh0LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG5cbmNvZmZlZVdvcmQgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgcHJldi52YWx1ZSA9PSAncHVuY3QgbWV0YSdcbiAgICAgICAgICAgIGlmIGNodW5rLnN0YXJ0ID09IHByZXYuc3RhcnQrMVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ21ldGEnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAgIyBnaXZlIHN3aXRjaCBhIGNoYW5jZVxuICAgICAgICBcbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiBbJ2NsYXNzJywgJ2V4dGVuZHMnXVxuICAgICAgICAgICAgc2V0VmFsdWUgMCAnY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudmFsdWUuc3RhcnRzV2l0aCAna2V5d29yZCcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gMSAjIHdlIGFyZSBkb25lIHdpdGggdGhlIGtleXdvcmRcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ3RoaXMnXG4gICAgICAgICAgICBhZGRWYWx1ZSAgMCAndGhpcydcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgKHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5JykgYW5kIHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCBjaHVuay5zdGFydCAjIHNwYWNlZFxuICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcbiAgICAgICAgICAgXG5wcm9wZXJ0eSA9IC0+ICMgd29yZFxuICAgICAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcbiAgICAgICAgXG4gICAgICAgIHByZXZQcmV2ID0gZ2V0Q2h1bmsgLTJcbiAgICAgICAgXG4gICAgICAgIGlmIHByZXZQcmV2Py5tYXRjaCAhPSAnLidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgaWYgcHJldlByZXZcbiAgICAgICAgICAgICAgICBpZiBwcmV2UHJldi52YWx1ZSBub3QgaW4gWydwcm9wZXJ0eScsICdudW1iZXInXSBhbmQgbm90IHByZXZQcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnb2JqJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5ub29uUHJvcCA9IC0+XG4gICAgXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIHByZXYuc3RhcnQrcHJldi5sZW5ndGgrMSA8IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlICE9ICdvYmonXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXgtMS4uMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgaSA8IGNodW5rSW5kZXgtMSBhbmQgbGluZS5jaHVua3NbaV0uc3RhcnQrbGluZS5jaHVua3NbaV0ubGVuZ3RoKzEgPCBsaW5lLmNodW5rc1tpKzFdLnN0YXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tpXS52YWx1ZSA9PSAndGV4dCcgb3IgbGluZS5jaHVua3NbaV0udmFsdWUgPT0gJ29iaidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3B1bmN0IHByb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgIDBcblxubm9vblB1bmN0ID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZSAjIG1ha2VzIHRoaXMgc2Vuc2UgaGVyZSA/Pz9cblxuICAgIG5vb25Qcm9wKClcbiAgICAgICAgICAgIFxubm9vbldvcmQgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlICMgbWFrZXMgdGhpcyBzZW5zZSBoZXJlID8/P1xuICAgIFxuICAgIGlmIGNodW5rLnN0YXJ0ID09IDBcbiAgICAgICAgc2V0VmFsdWUgMCAnb2JqJ1xuICAgICAgICByZXR1cm4gMVxuXG4gICAgbm9vblByb3AoKVxuICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICBcblxudXJsUHVuY3QgPSAtPlxuICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBjaHVuay50dXJkID09ICc6Ly8nIFxuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goNCkgPT0gJy4nIGFuZCBnZXRDaHVuayg1KVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICd1cmwgcHJvdG9jb2wnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWVzIDMgJ3VybCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMyAndXJsIGRvbWFpbidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgNCAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgNSAndXJsIHRsZCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gNlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLidcbiAgICAgICAgICAgIGlmIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ251bWJlcicpIGFuZCBwcmV2LnZhbHVlICE9ICdzZW12ZXInIGFuZCBwcmV2Lm1hdGNoIG5vdCBpbiAnXFxcXC4vJ1xuICAgICAgICAgICAgICAgIGlmIG5leHQgPSBnZXRDaHVuayAxXG4gICAgICAgICAgICAgICAgICAgIGlmIG5leHQuc3RhcnQgPT0gY2h1bmsuc3RhcnQrY2h1bmsubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlZXh0ID0gbmV4dC5tYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZmlsZWV4dCBub3QgaW4gJ1xcXFwuLydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSBmaWxlZXh0ICsgJyBmaWxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlICAwIGZpbGVleHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMSBmaWxlZXh0ICsgJyBleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciBpIGluIFtjaHVua0luZGV4Li4wXVxuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGxpbmUuY2h1bmtzW2ldLnN0YXJ0K2xpbmUuY2h1bmtzW2ldLmxlbmd0aCA8IGxpbmUuY2h1bmtzW2krMV0/LnN0YXJ0IFxuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlLmVuZHNXaXRoICdkaXInXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0udmFsdWUuc3RhcnRzV2l0aCAndXJsJ1xuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGxpbmUuY2h1bmtzW2ldLm1hdGNoID09ICdcIidcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tpXS52YWx1ZS5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHVuY3QgZGlyJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAndGV4dCBkaXInXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAwXG4gICAgXG51cmxXb3JkID0gLT5cbiAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiAnXFxcXC8nXG4gICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgaWYgbm90IG5leHQgb3IgbmV4dC5zdGFydCA+IGNodW5rLnN0YXJ0K2NodW5rLmxlbmd0aCBvciBuZXh0Lm1hdGNoIG5vdCBpbiAnXFxcXC4vJ1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsICdmaWxlJ1xuICAgIFxuIyAgICAgICAwMDAgICAwMDAwMDAwICBcbiMgICAgICAgMDAwICAwMDAgICAgICAgXG4jICAgICAgIDAwMCAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgXG5cbmpzUHVuY3QgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcoJ1xuICAgICAgICAgICAgaWYgcHJldi52YWx1ZS5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi52YWx1ZSA9PSAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuanNXb3JkID0gLT5cbiAgICBcbiAgICBpZiBjaHVuay52YWx1ZSA9PSAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICc9JyBhbmQgZ2V0VmFsdWUoLTIpLnN0YXJ0c1dpdGggJ3RleHQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAtMiAnZnVuY3Rpb24nXG4gICAgMCAjIHdlIG5lZWQgdGhpcyBoZXJlXG4gICAgXG5kaWN0ID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICc6JyBhbmQgbm90IGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggJzo6J1xuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUuc3BsaXQoJyAnKVswXSBpbiBbJ3N0cmluZycsICdudW1iZXInLCAndGV4dCcsICdrZXl3b3JkJ11cbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuIyAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiMgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuanNvblB1bmN0ID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICc6J1xuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGZvciBpIGluIFtjaHVua0luZGV4LTIuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG5qc29uV29yZCA9IC0+XG5cbiAgICBpZiB0b3BUeXBlID09ICdzdHJpbmcgZG91YmxlJyBhbmQgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIHByZXYubWF0Y2ggaW4gJ1wiXn4nIFxuICAgICAgICAgICAgaWYgTlVNQkVSLnRlc3QoZ2V0bWF0Y2goMCkpIGFuZCBnZXRtYXRjaCgxKSA9PSAnLicgYW5kIE5VTUJFUi50ZXN0KGdldG1hdGNoKDIpKSBhbmQgZ2V0bWF0Y2goMykgPT0gJy4nIGFuZCBOVU1CRVIudGVzdChnZXRtYXRjaCg0KSlcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAncHVuY3Qgc2VtdmVyJyBpZiBwcmV2Lm1hdGNoIGluICdefidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMSAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDIgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAzICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgNCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiA1XG4gICAgICAgICAgICAgICAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuXG5lc2NhcGUgPSAtPlxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICdcXFxcJyBhbmQgKHRvcFR5cGU/LnN0YXJ0c1dpdGgoJ3JlZ2V4cCcpIG9yIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZycpXG4gICAgICAgIGlmIGNodW5rSW5kZXggPT0gMCBvciBub3QgZ2V0Q2h1bmsoLTEpPy5lc2NhcGVcbiAgICAgICAgICAgIGlmIGdldENodW5rKDEpPy5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgY2h1bmsuZXNjYXBlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2VzY2FwZSdcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG5cbnJlZ2V4cCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZydcblxuICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyByZWdleHAgZW5kJ1xuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVua0luZGV4IFxuICAgICAgICAgICAgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgKzFcbiAgICAgICAgICAgIGlmIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3B1bmN0JykgYW5kIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ2tleXdvcmQnKSBvciBwcmV2Lm1hdGNoIGluIFwiKV1cIlxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAocHJldi5zdGFydCtwcmV2Lmxlbmd0aCA8ICBjaHVuay5zdGFydCkgYW5kIG5leHQ/LnN0YXJ0ID4gIGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPT0gY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gIFxuICAgICAgICAgICAgcmV0dXJuIGlmIG5leHQ/Lm1hdGNoID09ICc9J1xuICAgICAgICAgICAgcmV0dXJuIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBwdXNoU3RhY2sgdHlwZToncmVnZXhwJ1xuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAncmVnZXhwIHN0YXJ0J1xuICAgICAgICBcbiAgICBlc2NhcGUoKVxuICAgIFxudHJpcGxlUmVnZXhwID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgIFxuICAgIHR5cGUgPSAncmVnZXhwIHRyaXBsZSdcbiAgICBcbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSBub3QgaW4gWydpbnRlcnBvbGF0aW9uJywgdHlwZV1cbiAgICBpZiBjaHVuay50dXJkWy4uMl0gPT0gJy8vLydcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIGxpbmVubzpsaW5lLm51bWJlclxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZSAgIFxuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbnNpbXBsZVN0cmluZyA9IC0+XG4gICAgICAgIFxuICAgIHJldHVybiBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICBcbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCBpbiAnXCJcXCcnXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLm1hdGNoIFxuICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnIFxuICAgICAgICAgICAgd2hlbiBcIidcIiB0aGVuICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBlbHNlIGlmIG5vdENvZGVcbiAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgIFxuICAgICAgICBwdXNoU3RhY2sgc3Ryb25nOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICBlc2NhcGUoKVxuICAgICAgICAgICAgICAgICAgICBcbnRyaXBsZVN0cmluZyA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICByZXR1cm4gaWYgdG9wVHlwZSBpbiBbJ3JlZ2V4cCcnc3RyaW5nIHNpbmdsZScnc3RyaW5nIGRvdWJsZSddXG4gICAgXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgICAgICBcbiAgICB0eXBlID0gc3dpdGNoIGNodW5rLnR1cmRbLi4yXVxuICAgICAgICB3aGVuICdcIlwiXCInIHRoZW4gJ3N0cmluZyBkb3VibGUgdHJpcGxlJyBcbiAgICAgICAgd2hlbiBcIicnJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuXG4gICAgaWYgdHlwZVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIHR5cGUgIT0gdG9wVHlwZSBhbmQgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBzdHJvbmc6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuICAgICAgICBcbiAgICBlc2NhcGUoKVxuICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5udW1iZXIgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgTlVNQkVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTQpID09ICdudW1iZXIgZmxvYXQnIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtNSAncHVuY3Qgc2VtdmVyJyBpZiBnZXRtYXRjaCgtNSkgaW4gJ15+J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC00ICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlcidcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgaWYgSEVYTlVNLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIFxuICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXIgaGV4J1xuICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiMgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmZsb2F0ID0gLT5cbiAgICBcbiAgICBpZiBGTE9BVC50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXIgZmxvYXQnXG4gICAgICAgIHJldHVybiAxXG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgICAgIDAwMCAgICAgICAwMDAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxuY3NzV29yZCA9IC0+XG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2hbLTIuLl0gaW4gWydweCcnZW0nJ2V4J10gYW5kIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoWy4uLi0yXVxuICAgICAgICBzZXRWYWx1ZSAwICdudW1iZXInXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgIGlmIGNodW5rLm1hdGNoWy0xLi5dIGluIFsncyddIGFuZCBOVU1CRVIudGVzdCBjaHVuay5tYXRjaFsuLi4tMV1cbiAgICAgICAgc2V0VmFsdWUgMCAnbnVtYmVyJ1xuICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICcuJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ2NsYXNzJ1xuICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ2NsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09IFwiI1wiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoLmxlbmd0aCA9PSAzIG9yIGNodW5rLm1hdGNoLmxlbmd0aCA9PSA2XG4gICAgICAgICAgICAgICAgaWYgSEVYLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAnZnVuY3Rpb24nXG4gICAgICAgICAgICBzZXRWYWx1ZSAgMCAnZnVuY3Rpb24nXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJy0nXG4gICAgICAgICAgICBpZiBwcmV2UHJldiA9IGdldENodW5rIC0yXG4gICAgICAgICAgICAgICAgaWYgcHJldlByZXYudmFsdWUgaW4gWydjbGFzcycnZnVuY3Rpb24nXVxuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSBwcmV2UHJldi52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCBwcmV2UHJldi52YWx1ZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiMgMDAgICAgIDAwICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAwMDAwICBcblxubWRQdW5jdCA9IC0+XG4gICAgXG4gICAgaWYgY2h1bmtJbmRleCA9PSAwIFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGNodW5rLnR1cmQgYW5kIGNodW5rLm1hdGNoIGluICctKicgYW5kIGdldENodW5rKDEpPy5zdGFydCA+IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgIHR5cGUgPSBbJ2xpMScnbGkyJydsaTMnXVtjaHVuay5zdGFydC80XVxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgdHlwZSArICcgbWFya2VyJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcjJ1xuICAgICAgICAgICAgaWYgbm90IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDEnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ2gxJ1xuICAgICAgICAgICAgc3dpdGNoIGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICB3aGVuICcjIycgXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdoMidcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMnIFxuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDMnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyAnaDMnXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMjIycgXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoNCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyA0ICdoNCdcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMjIycgXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoNSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyA1ICdoNSdcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnKidcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/Wy4uMV0gPT0gJyoqJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gJ2JvbGQnXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWVzIDIgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gJ2l0YWxpYydcbiAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCB0b3BUeXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ2AnXG4gICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZD9bLi4yXSA9PSAnYGBgJ1xuXG4gICAgICAgICAgICB0eXBlID0gJ2NvZGUgdHJpcGxlJ1xuXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCgzKSBpbiBbJ2NvZmZlZXNjcmlwdCcnamF2YXNjcmlwdCcnanMnXVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIDMgJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB3ZWFrOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuICAgICAgICBcbiAgICAgICAgdHlwZSA9ICdjb2RlJ1xuICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHRvcFR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuXG4gICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCBcblxuaW50ZXJwb2xhdGlvbiA9IC0+XG4gICAgXG4gICAgaWYgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nIGRvdWJsZSdcbiAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggXCJcXCN7XCJcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidpbnRlcnBvbGF0aW9uJywgd2Vhazp0cnVlXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgIHNldFZhbHVlIDEgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgIGVsc2UgaWYgdG9wVHlwZSA9PSAnaW50ZXJwb2xhdGlvbidcbiAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnfSdcbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxua2V5d29yZCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBub3QgbGFuZ1tleHRdXG4gICAgICAgICMgbG9nIFwibm8gbGFuZyBmb3IgZXh0PyAje2V4dH1cIlxuICAgICAgICByZXR1cm5cbiAgICBcbiAgICBpZiBsYW5nW2V4dF0uaGFzT3duUHJvcGVydHkoY2h1bmsubWF0Y2gpIFxuICAgICAgICBjaHVuay52YWx1ZSA9IGxhbmdbZXh0XVtjaHVuay5tYXRjaF1cbiAgICAgICAgcmV0dXJuICMgZ2l2ZSBjb2ZmZWVGdW5jIGEgY2hhbmNlLCBudW1iZXIgYmFpbHMgZm9yIHVzXG4gICAgICAgICAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAgICAgICBcbiMgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4jICAwMDAgMDAwICAgMDAwIDAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG54bWxQdW5jdCA9IC0+IFxuICAgIFxuICAgIGlmIGNodW5rLnR1cmQgPT0gJzwvJ1xuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ2tleXdvcmQnXG4gICAgICAgIFxuICAgIGlmIGNodW5rLm1hdGNoIGluIFsnPCcnPiddXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdrZXl3b3JkJ1xuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcblxuY3BwTWFjcm8gPSAtPiBcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIlxuICAgICAgICBhZGRWYWx1ZSAwICdkZWZpbmUnXG4gICAgICAgIHNldFZhbHVlIDEgJ2RlZmluZSdcbiAgICAgICAgcmV0dXJuIDJcblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMDAwMDAwMFxuIyAgICAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAgICAwMDBcblxuc2hQdW5jdCA9IC0+XG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nIGFuZCBnZXRDaHVuaygtMSk/LnN0YXJ0ICsgZ2V0Q2h1bmsoLTEpPy5sZW5ndGggPT0gY2h1bmsuc3RhcnRcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIC0xICdkaXInXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnLS0nIGFuZCBnZXRDaHVuaygyKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMlxuICAgICAgICBhZGRWYWx1ZSAwICdhcmd1bWVudCdcbiAgICAgICAgYWRkVmFsdWUgMSAnYXJndW1lbnQnXG4gICAgICAgIHNldFZhbHVlIDIgJ2FyZ3VtZW50J1xuICAgICAgICByZXR1cm4gM1xuICAgICAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnLScgYW5kIGdldENodW5rKDEpPy5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgIGFkZFZhbHVlIDAgJ2FyZ3VtZW50J1xuICAgICAgICBzZXRWYWx1ZSAxICdhcmd1bWVudCdcbiAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICAgXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcblxuc3RhY2tlZCA9IC0+XG5cbiAgICBpZiBzdGFja1RvcFxuICAgICAgICByZXR1cm4gaWYgc3RhY2tUb3Aud2Vha1xuICAgICAgICBpZiBzdGFja1RvcC5zdHJvbmdcbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gdG9wVHlwZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0b3BUeXBlXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgXG5wdXNoRXh0ID0gKG10Y2gpIC0+XG4gICAgZXh0VG9wID0gc3dpdGNoOm10Y2gsIHN0YXJ0OmxpbmUsIHN0YWNrOnN0YWNrXG4gICAgZXh0U3RhY2sucHVzaCBleHRUb3BcbiAgICBcbmFjdEV4dCA9IC0+XG4gICAgc3RhY2sgICAgPSBbXVxuICAgIHN0YWNrVG9wID0gbnVsbFxuICAgIHRvcFR5cGUgID0gJydcbiAgICBub3RDb2RlICA9IGZhbHNlXG4gICAgXG5wb3BFeHQgPSAtPlxuICAgIHN0YWNrID0gZXh0VG9wLnN0YWNrXG4gICAgbGluZS5leHQgPSBleHRUb3Auc3RhcnQuZXh0XG4gICAgZXh0U3RhY2sucG9wKCkgICAgICAgICAgICAgICBcbiAgICBleHRUb3AgPSBleHRTdGFja1stMV1cbiAgICBcbiAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgIG5vdENvZGUgPSBzdGFja1RvcCBhbmQgdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG4gICAgXG5wdXNoU3RhY2sgPSAobykgLT4gXG4gICAgc3RhY2sucHVzaCBvIFxuICAgIHN0YWNrVG9wID0gb1xuICAgIHRvcFR5cGUgPSBvLnR5cGVcbiAgICBub3RDb2RlID0gdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG4gICAgXG5wb3BTdGFjayA9IC0+IFxuICAgIHN0YWNrLnBvcCgpXG4gICAgc3RhY2tUb3AgPSBzdGFja1stMV1cbiAgICB0b3BUeXBlID0gc3RhY2tUb3A/LnR5cGVcbiAgICBub3RDb2RlID0gc3RhY2tUb3AgYW5kIHRvcFR5cGUgbm90IGluIGNvZGVUeXBlc1xuICAgIFxuZ2V0Q2h1bmsgPSAoZCkgLT4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXVxuc2V0VmFsdWUgPSAoZCwgdmFsdWUpIC0+IGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS52YWx1ZSA9IHZhbHVlXG5nZXRWYWx1ZSA9IChkKSAtPiBnZXRDaHVuayhkKT8udmFsdWUgPyAnJ1xuZ2V0bWF0Y2ggPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/Lm1hdGNoID8gJydcbmFkZFZhbHVlID0gKGQsIHZhbHVlKSAtPiBcbiAgICBpZiAwIDw9IGNodW5rSW5kZXgrZCA8IGxpbmUuY2h1bmtzLmxlbmd0aCBcbiAgICAgICAgbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS52YWx1ZSArPSAnICcgKyB2YWx1ZVxuICAgIDFcbiAgICAgICAgXG5hZGRWYWx1ZXMgPSAobix2YWx1ZSkgLT4gICAgXG4gICAgZm9yIGkgaW4gWzAuLi5uXVxuICAgICAgICBhZGRWYWx1ZSBpLCB2YWx1ZVxuICAgIG5cbiAgICBcbmhhbmRsZXJzID0gXG4gICAgY29mZmVlOiBcbiAgICAgICAgICBwdW5jdDpbIGJsb2NrQ29tbWVudCwgaGFzaENvbW1lbnQsIHRyaXBsZVJlZ2V4cCwgY29mZmVlUHVuY3QsIHRyaXBsZVN0cmluZywgc2ltcGxlU3RyaW5nLCBpbnRlcnBvbGF0aW9uLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCBdXG4gICAgICAgICAgd29yZDogWyBrZXl3b3JkLCBjb2ZmZWVXb3JkLCBudW1iZXIsIHByb3BlcnR5IF1cbiAgICBub29uOiBwdW5jdDpbIG5vb25Db21tZW50LCAgbm9vblB1bmN0LCB1cmxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBub29uV29yZCwgdXJsV29yZCwgbnVtYmVyICAgICAgICAgIF1cbiAgICBqczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBqc1B1bmN0LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0IF0sIHdvcmQ6WyBrZXl3b3JkLCBqc1dvcmQsIG51bWJlciwgcHJvcGVydHkgIF1cbiAgICB0czogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBqc1B1bmN0LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0IF0sIHdvcmQ6WyBrZXl3b3JkLCBqc1dvcmQsIG51bWJlciwgcHJvcGVydHkgIF1cbiAgICBpc3M6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBpbmk6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyAgICAgICAgICBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBjcHA6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0ICAgICAgICAgICAgIF1cbiAgICBocHA6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0ICAgICAgICAgICAgIF1cbiAgICBjOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0ICAgICAgICAgICAgIF1cbiAgICBoOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0ICAgICAgICAgICAgIF1cbiAgICBjczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBwdWc6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBzdHlsOiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBjc3M6ICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzYXNzOiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzY3NzOiBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBjc3NXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBzdmc6ICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBodG1sOiBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBodG06ICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBzaDogICBwdW5jdDpbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCB1cmxQdW5jdCwgc2hQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCB1cmxXb3JkLCBudW1iZXIgICAgICAgICAgIF1cbiAgICBqc29uOiBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCBqc29uUHVuY3QsIHVybFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBqc29uV29yZCwgdXJsV29yZCwgbnVtYmVyIF1cbiAgICBsb2c6ICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB1cmxQdW5jdCwgZGljdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyB1cmxXb3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBtZDogICBwdW5jdDpbICAgICAgICAgICAgICAgICAgICBtZFB1bmN0LCB1cmxQdW5jdCwgeG1sUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyB1cmxXb3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBmaXNoOiBwdW5jdDpbICAgICAgICAgICAgICAgIGhhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIgICAgICAgICAgICAgICAgICAgIF1cbiAgICBcbmZvciBleHQgaW4gZXh0c1xuICAgIGlmIG5vdCBoYW5kbGVyc1tleHRdP1xuICAgICAgICBoYW5kbGVyc1tleHRdID0gcHVuY3Q6WyBzaW1wbGVTdHJpbmcgXSwgd29yZDpbIG51bWJlciBdXG4gICAgICAgIFxuZm9yIGV4dCxvYmogb2YgaGFuZGxlcnNcbiAgICBoYW5kbGVyc1tleHRdLnB1bmN0LnB1c2ggc3RhY2tlZFxuICAgIGhhbmRsZXJzW2V4dF0ud29yZC5wdXNoIHN0YWNrZWRcbiAgICBcbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbuKWuGRvYyAnYmxvY2tlZCBsaW5lcydcbiAgICBcbiAgICBsaW5lczogYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuICAgIFxuICAgIHJldHVybnMgbGluZXMgd2l0aCBcbiAgICAtICdleHQnIHN3aXRjaGVkIGluIHNvbWUgbGluZXNcbiAgICAtICd2YWx1ZScgY2hhbmdlZCBpbiBjaHVua3MgdGhhdCBtYXRjaCBsYW5ndWFnZSBwYXR0ZXJuc1xuXG5ibG9ja2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIGV4dFN0YWNrICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBbXVxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIGV4dFRvcCAgICAgPSBudWxsXG4gICAgc3RhY2tUb3AgICA9IG51bGxcbiAgICBub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbiAgICB0b3BUeXBlICAgID0gJydcbiAgICBleHQgICAgICAgID0gJydcbiAgICBsaW5lICAgICAgID0gbnVsbFxuICAgIGNodW5rICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IDBcbiAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcblxuICAgICAgICBpZiBzdGFja1RvcFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdGFja1RvcC50eXBlID09ICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAgICAgICAgICBpZiBub3QgSEVBREVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBpZiBtaWdodEJlSGVhZGVyXG4gICAgICAgICAgICAgICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLmZpbGwgdGhlbiBwb3BTdGFjaygpXG4gICAgICAgIFxuICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgIGlmIGV4dFRvcC5zd2l0Y2guaW5kZW50IGFuZCBsaW5lLmNodW5rc1swXT8uc3RhcnQgPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5zdGFydFxuICAgICAgICAgICAgICAgIHBvcEV4dCgpICAgICAgICAgICAgICAgICAgICAgICAgIyBlbmQgb2YgZXh0ZW5zaW9uIGJsb2NrIHJlYWNoZWQgdGhhdCBpcyB0ZXJtaW5hdGVkIGJ5IGluZGVudGF0aW9uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3dpdGNoLnRvICAgICAjIG1ha2Ugc3VyZSB0aGUgY3VycmVudCBsaW5lIGV4dCBtYXRjaGVzIHRoZSB0b3Btb3N0IGZyb20gc3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZXh0ICE9IGxpbmUuZXh0ICAgICAgICAgICAgICAgICAgICAgICMgZWl0aGVyIGF0IHN0YXJ0IG9mIGZpbGUgb3Igd2Ugc3dpdGNoZWQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBhY3RFeHQoKVxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICAgICAgaWYgbm90IGhhbmRsXG4gICAgICAgICAgICAgICAg4pa4ZGJnIGxpbmVcbiAgICAgICAgICAgICAgICDilrhkYmcgaGFuZGxlcnNcbiAgICAgICAgICAgIOKWuGFzc2VydCBoYW5kbFxuICAgICAgICAgICAgXG4gICAgICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAgICAgXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmsgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4XVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBiZWZvcmVJbmRleCA9IGNodW5rSW5kZXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmVuZD8gYW5kIGV4dFRvcC5zd2l0Y2guZW5kID09IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlcyBjaHVuay50dXJkLmxlbmd0aCwgZXh0VG9wLnN3aXRjaC5hZGQgaWYgZXh0VG9wLnN3aXRjaC5hZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcEV4dCgpICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSB0dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLnB1bmN0ID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyB3b3JkcywgbnVtYmVyc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBub3RDb2RlXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBzd3RjaFtsaW5lLmV4dF0/W2NodW5rLm1hdGNoXSBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG10Y2gudHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR1cmRDaHVuayA9IGdldENodW5rIC1tdGNoLnR1cmQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkID09ICh0dXJkQ2h1bms/LnR1cmQgPyB0dXJkQ2h1bms/Lm1hdGNoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHB1c2ggYSBuZXcgZXh0ZW5zaW9uIG9udG8gdGhlIHN0YWNrLCBleHQgd2lsbCBjaGFuZ2Ugb24gc3RhcnQgb2YgbmV4dCBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hFeHQgbXRjaFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBobmQgaW4gaGFuZGwud29yZCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4ID09IGJlZm9yZUluZGV4XG4gICAgICAgICAgICAgICAgY2h1bmtJbmRleCsrXG4gICAgbGluZXNcblxucGFkID0gKGwpIC0+XG4gICAgcyA9ICcnXG4gICAgd2hpbGUgbCA+IDBcbiAgICAgICAgcyArPSAnICdcbiAgICAgICAgbC0tXG4gICAgc1xuICAgIFxucmVwbGFjZVRhYnMgPSAocykgLT5cbiAgICBpID0gMFxuICAgIHdoaWxlIGkgPCBzLmxlbmd0aFxuICAgICAgICBpZiBzW2ldID09ICdcXHQnXG4gICAgICAgICAgICBzID0gc1suLi5pXSArIHBhZCg0LShpJTQpKSArIHNbaSsxLi5dXG4gICAgICAgIGkgKz0gMVxuICAgIHNcbiAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5wYXJzZSA9IChsaW5lcywgZXh0PSdjb2ZmZWUnKSAtPiBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgXG4gICAga29sb3I6ICAgcmVxdWlyZSAnLi9rb2xvcidcbiAgICBleHRzOiAgICBleHRzXG4gICAgcGFyc2U6ICAgcGFyc2VcbiAgICBjaHVua2VkOiBjaHVua2VkXG4gICAgcmFuZ2VzOiAgKGxpbmUsIGV4dD0nY29mZmVlJykgIC0+IHBhcnNlKFtsaW5lXSwgZXh0KVswXS5jaHVua3NcbiAgICBkaXNzZWN0OiAobGluZXMsIGV4dD0nY29mZmVlJykgLT4gcGFyc2UobGluZXMsIGV4dCkubWFwIChsKSAtPiBsLmNodW5rc1xuICAgIFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxu4pa4dGVzdCAncHJvZmlsZSdcbiAgICBcbiAgICB0ZXh0MCA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9Ly4uLy4uL2tvZmZlZS9jb2ZmZWUvbm9kZXMuY29mZmVlXCJcbiAgICB0ZXh0MSA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9L3Rlc3QuY29mZmVlXCJcblxuICAgIOKWuGF2ZXJhZ2UgMlxuICAgICAgICBsaW5lczAgPSB0ZXh0MC5zcGxpdCAnXFxuJ1xuICAgIOKWuGF2ZXJhZ2UgMlxuICAgICAgICBsaW5lczEgPSB0ZXh0MS5zcGxpdCAnXFxuJ1xuXG4gICAgZm9yIGkgaW4gWzAuLjVdXG4gICAgICAgIHBhcnNlIGxpbmVzMFxuICAgICAgICBcbiAgICDilrhhdmVyYWdlIDUwXG4gICAgICAgIHBhcnNlIGxpbmVzMFxuICAgICAiXX0=
//# sourceURL=../coffee/klor.coffee