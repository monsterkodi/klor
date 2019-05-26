// koffee 0.45.0

/*
000   000  000       0000000   00000000   
000  000   000      000   000  000   000  
0000000    000      000   000  0000000    
000  000   000      000   000  000   000  
000   000  0000000   0000000   000   000
 */
var FLOAT, HEADER, HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, actExt, addValue, addValues, blockComment, blocked, blocks, chunk, chunkIndex, chunked, codeTypes, coffeePunct, coffeeWord, commentHeader, cppMacro, dashArrow, dict, escape, ext, extStack, extTop, fillComment, float, getChunk, getValue, getmatch, handl, handlers, hashComment, interpolation, j, jsPunct, jsWord, jsonPunct, jsonWord, keyword, klog, kstr, len, line, mdPunct, noon, noonComment, noonProp, noonPunct, noonWord, notCode, number, popExt, popStack, property, pushExt, pushStack, ref, ref1, regexp, setValue, shPunct, simpleString, slash, slashComment, stack, stackTop, stacked, starComment, thisCall, topType, tripleRegexp, tripleString, urlPunct, urlWord, xmlPunct,
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
        },
        js: {
            turd: '```',
            to: 'js',
            end: '```',
            add: 'code triple'
        },
        sh: {
            turd: '```',
            to: 'sh',
            end: '```',
            add: 'code triple'
        }
    }
};

SPACE = /\s/;

HEADER = /^0+$/;

PUNCT = /\W+/g;

NUMBER = /^\d+$/;

FLOAT = /^\d+f$/;

HEXNUM = /^0x[a-fA-F\d]+$/;

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
        var advance, c, chunks, j, l, last, len, line, m, pc, pi, punct, ref1, ref2, rl, s, sc, turd, w, wl;
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
        for (j = 0, len = chunks.length; j < len; j++) {
            s = chunks[j];
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
                    while (pi < punct.length - 1) {
                        pc = punct[pi];
                        advance = 1;
                        if ((0xD800 <= (ref1 = punct.charCodeAt(pi)) && ref1 <= 0xDBFF) && (0xDC00 <= (ref2 = punct.charCodeAt(pi + 1)) && ref2 <= 0xDFFF)) {
                            advance = 2;
                            pc += punct[pi + 1];
                        }
                        pi += advance;
                        line.chunks.push({
                            start: c,
                            length: advance,
                            match: pc,
                            turd: turd,
                            value: 'punct'
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
    var c, i, j, k, len, len1, mightBeHeader, p, ref1, restChunks;
    for (i = j = 0, ref1 = n; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
        addValue(i, 'comment');
    }
    if (chunkIndex < line.chunks.length - n) {
        restChunks = line.chunks.slice(chunkIndex + n);
        mightBeHeader = true;
        for (k = 0, len = restChunks.length; k < len; k++) {
            c = restChunks[k];
            c.value = 'comment';
            if (mightBeHeader && !HEADER.test(c.match)) {
                mightBeHeader = false;
            }
        }
        if (mightBeHeader) {
            for (p = 0, len1 = restChunks.length; p < len1; p++) {
                c = restChunks[p];
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
    var i, j, prev, ref1;
    if (prev = getChunk(-1)) {
        if (prev.start + prev.length + 1 < chunk.start) {
            if (prev.value !== 'obj') {
                for (i = j = ref1 = chunkIndex - 1; ref1 <= 0 ? j <= 0 : j >= 0; i = ref1 <= 0 ? ++j : --j) {
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
    var i, j, next, prev, ref1, ref2, ref3;
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
                        ext = next.match;
                        if (indexOf.call('\\./', ext) < 0) {
                            setValue(-1, ext + ' file');
                            addValue(0, ext);
                            setValue(1, ext + ' ext');
                            return 2;
                        }
                    }
                }
            }
        }
        if (chunk.match === '/') {
            for (i = j = ref2 = chunkIndex; ref2 <= 0 ? j <= 0 : j >= 0; i = ref2 <= 0 ? ++j : --j) {
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
    var i, j, prev, ref1;
    if (notCode) {
        return;
    }
    if (chunk.match === ':') {
        if (prev = getChunk(-1)) {
            if (prev.match === '"') {
                for (i = j = ref1 = chunkIndex - 2; ref1 <= 0 ? j <= 0 : j >= 0; i = ref1 <= 0 ? ++j : --j) {
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
            if (!prev.value.startsWith('punct') || (ref2 = prev.match, indexOf.call(")]", ref2) >= 0)) {
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
    if (topType === 'string double') {
        if ((ref1 = chunk.turd) != null ? ref1.startsWith("\#{") : void 0) {
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
        console.log("no lang for ext? " + ext);
        return;
    }
    if (Syntax.lang[ext].hasOwnProperty(chunk.match)) {
        chunk.value = Syntax.lang[ext][chunk.match];
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
    var i, j, ref1;
    for (i = j = 0, ref1 = n; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
        addValue(i, value);
    }
    return n;
};

handlers = {
    coffee: {
        punct: [blockComment, hashComment, tripleRegexp, coffeePunct, tripleString, simpleString, interpolation, dashArrow, regexp, dict, stacked],
        word: [keyword, coffeeWord, number, property, stacked]
    },
    noon: {
        punct: [noonComment, noonPunct, urlPunct, stacked],
        word: [noonWord, urlWord, number, stacked]
    },
    js: {
        punct: [starComment, slashComment, jsPunct, simpleString, dashArrow, regexp, dict, stacked],
        word: [keyword, jsWord, number, property, stacked]
    },
    ts: {
        punct: [starComment, slashComment, jsPunct, simpleString, dashArrow, regexp, dict, stacked],
        word: [keyword, jsWord, number, property, stacked]
    },
    iss: {
        punct: [starComment, slashComment, simpleString, stacked],
        word: [keyword, number, stacked]
    },
    ini: {
        punct: [starComment, slashComment, simpleString, cppMacro, stacked],
        word: [number, stacked]
    },
    cpp: {
        punct: [starComment, slashComment, simpleString, cppMacro, stacked],
        word: [keyword, number, float, stacked]
    },
    hpp: {
        punct: [starComment, slashComment, simpleString, cppMacro, stacked],
        word: [keyword, number, float, stacked]
    },
    c: {
        punct: [starComment, slashComment, simpleString, cppMacro, stacked],
        word: [keyword, number, float, stacked]
    },
    h: {
        punct: [starComment, slashComment, simpleString, cppMacro, stacked],
        word: [keyword, number, float, stacked]
    },
    cs: {
        punct: [starComment, slashComment, simpleString, stacked],
        word: [keyword, number, stacked]
    },
    pug: {
        punct: [starComment, slashComment, simpleString, stacked],
        word: [keyword, number, stacked]
    },
    styl: {
        punct: [starComment, slashComment, simpleString, stacked],
        word: [keyword, number, stacked]
    },
    css: {
        punct: [starComment, slashComment, simpleString, stacked],
        word: [keyword, number, stacked]
    },
    sass: {
        punct: [starComment, slashComment, simpleString, stacked],
        word: [keyword, number, stacked]
    },
    scss: {
        punct: [starComment, slashComment, simpleString, stacked],
        word: [keyword, number, stacked]
    },
    svg: {
        punct: [simpleString, xmlPunct, stacked],
        word: [keyword, number, stacked]
    },
    html: {
        punct: [simpleString, xmlPunct, stacked],
        word: [keyword, number, stacked]
    },
    htm: {
        punct: [simpleString, xmlPunct, stacked],
        word: [keyword, number, stacked]
    },
    sh: {
        punct: [hashComment, simpleString, urlPunct, shPunct, stacked],
        word: [keyword, urlWord, number, stacked]
    },
    json: {
        punct: [simpleString, jsonPunct, urlPunct, stacked],
        word: [keyword, jsonWord, urlWord, number, stacked]
    },
    log: {
        punct: [simpleString, urlPunct, dict, stacked],
        word: [urlWord, number, stacked]
    },
    md: {
        punct: [mdPunct, urlPunct, xmlPunct, stacked],
        word: [urlWord, number, stacked]
    },
    fish: {
        punct: [hashComment, simpleString, stacked],
        word: [keyword, number, stacked]
    }
};

ref1 = Syntax.exts;
for (j = 0, len = ref1.length; j < len; j++) {
    ext = ref1[j];
    if (handlers[ext] == null) {
        handlers[ext] = {
            punct: [simpleString, stacked],
            word: [number, stacked]
        };
    }
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
    var advance, beforeIndex, hnd, k, len1, len2, len3, len4, len5, mightBeHeader, mtch, p, q, r, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t, turdChunk;
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
    for (k = 0, len1 = lines.length; k < len1; k++) {
        line = lines[k];
        if (stackTop) {
            if (stackTop.type === 'comment triple') {
                mightBeHeader = true;
                ref2 = line.chunks;
                for (p = 0, len2 = ref2.length; p < len2; p++) {
                    chunk = ref2[p];
                    if (!HEADER.test(chunk.match)) {
                        mightBeHeader = false;
                        break;
                    }
                }
                if (mightBeHeader) {
                    ref3 = line.chunks;
                    for (q = 0, len3 = ref3.length; q < len3; q++) {
                        chunk = ref3[q];
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
            if (extTop["switch"].indent && ((ref4 = line.chunks[0]) != null ? ref4.start : void 0) <= extTop.start.chunks[0].start) {
                popExt();
            } else {
                line.ext = extTop["switch"].to;
            }
        }
        if (ext !== line.ext) {
            actExt();
            handl = handlers[ext = line.ext];
            if (!handl) {
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1020[39m', line);
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1021[39m', handlers);
            }
            if (!(handl)) {
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1022[39m', '[1m[97massertion failure![39m[22m');

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
                ref6 = (ref5 = handl.punct) != null ? ref5 : [];
                for (r = 0, len4 = ref6.length; r < len4; r++) {
                    hnd = ref6[r];
                    if (advance = hnd()) {
                        chunkIndex += advance;
                        break;
                    }
                }
            } else {
                if (!notCode) {
                    if (mtch = (ref7 = Syntax.swtch[line.ext]) != null ? ref7[chunk.match] : void 0) {
                        if (mtch.turd) {
                            turdChunk = getChunk(-mtch.turd.length);
                            if (mtch.turd === ((ref8 = turdChunk != null ? turdChunk.turd : void 0) != null ? ref8 : turdChunk != null ? turdChunk.match : void 0)) {
                                pushExt(mtch);
                            }
                        }
                    }
                }
                ref10 = (ref9 = handl.word) != null ? ref9 : [];
                for (t = 0, len5 = ref10.length; t < len5; t++) {
                    hnd = ref10[t];
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

blocks = function(lines, ext) {
    if (ext == null) {
        ext = 'coffee';
    }
''
    return blocked(chunked(lines, ext));
};

module.exports = {
    blocks: blocks,
    ranges: function(line, ext) {
        return blocks([line], ext)[0].chunks;
    },
    dissect: function(lines, ext) {
        return blocks(lines, ext).map(function(l) {
            return l.chunks;
        });
    }
};

;


/*
000000000  00000000   0000000  000000000  
   000     000       000          000     
   000     0000000   0000000      000     
   000     000            000     000     
   000     00000000  0000000      000
 */

;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2xvci5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMnRCQUFBO0lBQUE7O0FBUUEsTUFBaUMsT0FBQSxDQUFRLEtBQVIsQ0FBakMsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCOztBQUUzQixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBQTs7QUFFQSxNQUFNLENBQUMsS0FBUCxHQUNJO0lBQUEsTUFBQSxFQUNJO1FBQUEsR0FBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEdBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUFvQixNQUFBLEVBQVEsQ0FBNUI7U0FBZDtLQURKO0lBRUEsRUFBQSxFQUNJO1FBQUEsWUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsUUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7WUFBaUMsR0FBQSxFQUFJLGFBQXJDO1NBQWQ7UUFDQSxVQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxJQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtZQUFpQyxHQUFBLEVBQUksYUFBckM7U0FEZDtRQUVBLEVBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLElBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1lBQWlDLEdBQUEsRUFBSSxhQUFyQztTQUZkO1FBR0EsRUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7WUFBaUMsR0FBQSxFQUFJLGFBQXJDO1NBSGQ7S0FISjs7O0FBUUosS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQUNULEtBQUEs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MDAwMDAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4wMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgc2xhc2gsIGtzdHIsIGtsb2csIG5vb24sIF8gfSA9IHJlcXVpcmUgJ2t4aydcbiAgXG5TeW50YXggPSByZXF1aXJlICcuL3N5bnRheCdcblN5bnRheC5pbml0KClcblxuU3ludGF4LnN3dGNoID0gXG4gICAgY29mZmVlOiBcbiAgICAgICAgZG9jOiAgICAgICAgICB0dXJkOifilrgnICAgdG86J21kJyAgaW5kZW50OiAxXG4gICAgbWQ6ICAgICBcbiAgICAgICAgY29mZmVlc2NyaXB0OiB0dXJkOidgYGAnIHRvOidjb2ZmZWUnIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuICAgICAgICBqYXZhc2NyaXB0OiAgIHR1cmQ6J2BgYCcgdG86J2pzJyAgICAgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgIGpzOiAgICAgICAgICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcbiAgICAgICAgc2g6ICAgICAgICAgICB0dXJkOidgYGAnIHRvOidzaCcgICAgIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuICAgICAgICAgICAgXG5TUEFDRSAgPSAvXFxzL1xuSEVBREVSID0gL14wKyQvXG5QVU5DVCAgPSAvXFxXKy9nXG5OVU1CRVIgPSAvXlxcZCskL1xuRkxPQVQgID0gL15cXGQrZiQvXG5IRVhOVU0gPSAvXjB4W2EtZkEtRlxcZF0rJC9cblxuY29kZVR5cGVzID0gWydpbnRlcnBvbGF0aW9uJyAnY29kZSB0cmlwbGUnXVxuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcblxu4pa4ZG9jICdjaHVua2VkICpsaW5lcyosICpleHQqJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAqKnJldHVybnMqKiBhcnJheSBvZlxuICAgICAgICBcbiAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICAgICAgICAgIHR1cmQ6ICAgc1xuICAgICAgICAgICAgICAgICAgICBtYXRjaDogIHNcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICBzXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiAgblxuICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IG5cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgIGV4dDogICAgc1xuICAgICAgICBjaGFyczogIG5cbiAgICAgICAgaW5kZXg6ICBuXG4gICAgICAgIG51bWJlcjogbisxXG5cbmNodW5rZWQgPSAobGluZXMsIGV4dCkgLT4gICAgXG4gICAgICAgIFxuICAgIGV4dCA9ICdjb2ZmZWUnIGlmIGV4dCA9PSAna29mZmVlJ1xuICAgIGV4dCA9ICd0eHQnIGlmIGV4dCBub3QgaW4gU3ludGF4LmV4dHNcbiAgICAgICAgICAgIFxuICAgIGxpbmVubyA9IDBcbiAgICBsaW5lcy5tYXAgKHRleHQpIC0+IFxuICAgICAgICBcbiAgICAgICAgbGluZSA9IFxuICAgICAgICAgICAgY2h1bmtzOiBbXVxuICAgICAgICAgICAgY2hhcnM6ICAwXG4gICAgICAgICAgICBpbmRleDogIGxpbmVubysrXG4gICAgICAgICAgICBudW1iZXI6IGxpbmVub1xuICAgICAgICAgICAgZXh0OiAgICBleHRcblxuICAgICAgICBjaHVua3MgPSBrc3RyLnJlcGxhY2VUYWJzKHRleHQpLnNwbGl0IFNQQUNFXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVua3MubGVuZ3RoID09IDEgYW5kIGNodW5rc1swXSA9PSAnJ1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUgIyBlbXB0eSBsaW5lXG4gICAgICAgICAgICBcbiAgICAgICAgYyA9IDBcbiAgICAgICAgZm9yIHMgaW4gY2h1bmtzXG4gICAgICAgICAgICBpZiBzID09ICcnXG4gICAgICAgICAgICAgICAgYysrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gYysrXG4gICAgICAgICAgICAgICAgbCA9IHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgc2MgPSBjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBzZXBlcmF0ZSBieSBwdW5jdHVhdGlvblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSBQVU5DVC5leGVjIHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIG0uaW5kZXggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB3bCA9IG0uaW5kZXgtKGMtc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICB3ID0gc1tjLXNjLi4ubS5pbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOndsLCBtYXRjaDp3LCB2YWx1ZTondGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gd2xcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHR1cmQgPSBwdW5jdCA9IG1bMF1cblxuICAgICAgICAgICAgICAgICAgICBwaSA9IDBcbiAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDFcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgcGkgPCBwdW5jdC5sZW5ndGgtMVxuICAgICAgICAgICAgICAgICAgICAgICAgcGMgPSBwdW5jdFtwaV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAweEQ4MDAgPD0gcHVuY3QuY2hhckNvZGVBdChwaSkgPD0gMHhEQkZGIGFuZCAweERDMDAgPD0gcHVuY3QuY2hhckNvZGVBdChwaSsxKSA8PSAweERGRkZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlID0gMlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBjICs9IHB1bmN0W3BpKzFdXG4gICAgICAgICAgICAgICAgICAgICAgICBwaSArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDphZHZhbmNlLCBtYXRjaDpwYywgdHVyZDp0dXJkLCB2YWx1ZToncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHR1cmQgPSB0dXJkW2FkdmFuY2UuLl1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBwaSA8IHB1bmN0Lmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6YWR2YW5jZSwgbWF0Y2g6cHVuY3RbcGkuLl0sIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXIgXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOnJsLCBtYXRjaDp3LCB2YWx1ZTondGV4dCdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoXG4gICAgICAgICAgICBsYXN0ID0gbGluZS5jaHVua3NbLTFdXG4gICAgICAgICAgICBsaW5lLmNoYXJzID0gbGFzdC5zdGFydCArIGxhc3QubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgbGluZVxuICAgICAgICBcbiMjI1xuMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgXG4jIyNcbiAgICAgICAgICBcbmV4dFN0YWNrICAgPSBbXVxuc3RhY2sgICAgICA9IFtdXG5oYW5kbCAgICAgID0gW11cbmV4dFRvcCAgICAgPSBudWxsXG5zdGFja1RvcCAgID0gbnVsbFxubm90Q29kZSAgICA9IGZhbHNlICMgc2hvcnRjdXQgZm9yIHRvcCBvZiBzdGFjayBub3QgaW4gY29kZVR5cGVzXG50b3BUeXBlICAgID0gJydcbmV4dCAgICAgICAgPSAnJ1xubGluZSAgICAgICA9IG51bGxcbmNodW5rICAgICAgPSBudWxsXG5jaHVua0luZGV4ID0gMFxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmZpbGxDb21tZW50ID0gKG4pIC0+XG4gICAgXG4gICAgZm9yIGkgaW4gWzAuLi5uXVxuICAgICAgICBhZGRWYWx1ZSBpLCAnY29tbWVudCdcbiAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLW5cbiAgICAgICAgcmVzdENodW5rcyA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrbi4uXVxuICAgICAgICBtaWdodEJlSGVhZGVyID0gdHJ1ZVxuICAgICAgICBmb3IgYyBpbiByZXN0Q2h1bmtzXG4gICAgICAgICAgICBjLnZhbHVlID0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBpZiBtaWdodEJlSGVhZGVyIGFuZCBub3QgSEVBREVSLnRlc3QgYy5tYXRjaFxuICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSBmYWxzZVxuICAgICAgICBpZiBtaWdodEJlSGVhZGVyXG4gICAgICAgICAgICBmb3IgYyBpbiByZXN0Q2h1bmtzXG4gICAgICAgICAgICAgICAgYy52YWx1ZSArPSAnIGhlYWRlcidcbiAgICBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgblxuICAgIFxuaGFzaENvbW1lbnQgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgc3RhY2tUb3AgYW5kIHRvcFR5cGUgIT0gJ3JlZ2V4cCB0cmlwbGUnXG4gICAgaWYgc3RhY2tUb3AgYW5kIHN0YWNrVG9wLmxpbmVubyA9PSBsaW5lLm51bWJlclxuICAgICAgICByZXR1cm4gIyBjb21tZW50cyBpbnNpZGUgdHJpcGxlIHJlZ2V4cCBvbmx5IHZhbGlkIG9uIGludGVybmFsIGxpbmVzP1xuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgIGZpbGxDb21tZW50IDFcblxubm9vbkNvbW1lbnQgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgc3RhY2tUb3BcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIiBhbmQgY2h1bmtJbmRleCA9PSAwXG4gICAgICAgIGZpbGxDb21tZW50IDFcbiAgICBcbnNsYXNoQ29tbWVudCA9IC0+XG5cbiAgICByZXR1cm4gaWYgc3RhY2tUb3BcbiAgICBcbiAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoIFwiLy9cIlxuICAgICAgICBmaWxsQ29tbWVudCAyXG4gICAgXG5ibG9ja0NvbW1lbnQgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgXG4gICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZSdcbiAgICBcbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSBub3QgaW4gWydpbnRlcnBvbGF0aW9uJywgdHlwZV1cbiAgICBcbiAgICBpZiBjaHVuay50dXJkWy4uMl0gPT0gJyMjIydcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlICAgICAgICAgICAgXG5cbnN0YXJDb21tZW50ID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkXG4gICAgXG4gICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZSdcbiAgICBcbiAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSAhPSB0eXBlXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZFsuLjFdID09ICcvKicgYW5kIG5vdCB0b3BUeXBlIFxuICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZSAgICAgICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcbiAgICBpZiBjaHVuay50dXJkWy4uMV0gPT0gJyovJyBhbmQgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcbiAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuXG5kYXNoQXJyb3cgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBtYXJrRnVuYyA9IC0+XG4gICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICd0ZXh0JyBcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzFdLm1hdGNoID09ICc9JyBhbmQgbGluZS5jaHVua3NbMl0ubWF0Y2ggIT0gJz4nXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgKz0gJyBmdW5jdGlvbidcbiAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbMV0ubWF0Y2ggPT0gJzonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlICs9ICcgbWV0aG9kJ1xuICAgIFxuICAgIGlmIGNodW5rLnR1cmRcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQuc3RhcnRzV2l0aCAnLT4nXG4gICAgICAgICAgICBtYXJrRnVuYygpXG4gICAgICAgICAgICBhZGRWYWx1ZSAwICdmdW5jdGlvbiB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSAnZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleScgb3IgbGluZS5jaHVua3NbMF0udHVyZD9bLi4xXSA9PSAnQDonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbMF0ubWF0Y2ggPT0gJ0AnIGFuZCBsaW5lLmNodW5rc1sxXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAncHVuY3QgbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ21ldGhvZCBjbGFzcydcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1syXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkLnN0YXJ0c1dpdGggJz0+J1xuICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEgJ2Z1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgXG5jb21tZW50SGVhZGVyID0gLT5cbiAgICBcbiAgICBpZiB0b3BUeXBlID09ICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaWYgSEVBREVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG50aGlzQ2FsbCA9IC0+XG4gICAgXG4gICAgc2V0VmFsdWUgLTEgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgaWYgZ2V0bWF0Y2goLTIpID09ICdAJ1xuICAgICAgICBzZXRWYWx1ZSAtMiAncHVuY3QgZnVuY3Rpb24gY2FsbCdcbiAgICAwXG5cbmNvZmZlZVB1bmN0ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgICAgICAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAn4pa4J1xuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAnbWV0YSdcbiAgICAgICAgXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnfj4nXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAnbWV0YSdcbiAgICAgICAgXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoKCcuLicpIGFuZCBwcmV2Lm1hdGNoICE9ICcuJ1xuICAgICAgICAgICAgaWYgY2h1bmsudHVyZFsyXSAhPSAnLidcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ3JhbmdlJ1xuICAgICAgICAgICAgaWYgY2h1bmsudHVyZFszXSAhPSAnLidcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgJ3JhbmdlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3RleHQnKSBvciBwcmV2LnZhbHVlID09ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHByZXZFbmQgPSBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoXG4gICAgICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKCcgYW5kIHByZXZFbmQgPT0gY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgZWxzZSBpZiBwcmV2RW5kIDwgY2h1bmsuc3RhcnQgIyBzcGFjZWRcbiAgICAgICAgICAgICAgICBpZiBjaHVuay5tYXRjaCBpbiAnQFsoe1wiXFwnJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgY2h1bmsubWF0Y2ggaW4gJystLycgXG4gICAgICAgICAgICAgICAgICAgIG5leHQgPSBnZXRDaHVuayAxXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBuZXh0IG9yIG5leHQubWF0Y2ggIT0gJz0nIGFuZCBuZXh0LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG5cbmNvZmZlZVdvcmQgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgcHJldi52YWx1ZSA9PSAncHVuY3QgbWV0YSdcbiAgICAgICAgICAgIGlmIGNodW5rLnN0YXJ0ID09IHByZXYuc3RhcnQrMVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ21ldGEnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDAgIyBnaXZlIHN3aXRjaCBhIGNoYW5jZVxuICAgICAgICBcbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiBbJ2NsYXNzJywgJ2V4dGVuZHMnXVxuICAgICAgICAgICAgc2V0VmFsdWUgMCAnY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudmFsdWUuc3RhcnRzV2l0aCAna2V5d29yZCcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gMSAjIHdlIGFyZSBkb25lIHdpdGggdGhlIGtleXdvcmRcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ3RoaXMnXG4gICAgICAgICAgICBhZGRWYWx1ZSAgMCAndGhpcydcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgKHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5JykgYW5kIHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCBjaHVuay5zdGFydCAjIHNwYWNlZFxuICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcbiAgICAgICAgICAgXG5wcm9wZXJ0eSA9IC0+ICMgd29yZFxuICAgICAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcbiAgICAgICAgXG4gICAgICAgIHByZXZQcmV2ID0gZ2V0Q2h1bmsgLTJcbiAgICAgICAgXG4gICAgICAgIGlmIHByZXZQcmV2Py5tYXRjaCAhPSAnLidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgaWYgcHJldlByZXZcbiAgICAgICAgICAgICAgICBpZiBwcmV2UHJldi52YWx1ZSBub3QgaW4gWydwcm9wZXJ0eScsICdudW1iZXInXSBhbmQgbm90IHByZXZQcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnb2JqJ1xuICAgICAgICAgICAgcmV0dXJuIDFcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5ub29uUHJvcCA9IC0+XG4gICAgXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIHByZXYuc3RhcnQrcHJldi5sZW5ndGgrMSA8IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlICE9ICdvYmonXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXgtMS4uMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgaSA8IGNodW5rSW5kZXgtMSBhbmQgbGluZS5jaHVua3NbaV0uc3RhcnQrbGluZS5jaHVua3NbaV0ubGVuZ3RoKzEgPCBsaW5lLmNodW5rc1tpKzFdLnN0YXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tpXS52YWx1ZSA9PSAndGV4dCcgb3IgbGluZS5jaHVua3NbaV0udmFsdWUgPT0gJ29iaidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3B1bmN0IHByb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgIDBcblxubm9vblB1bmN0ID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZSAjIG1ha2VzIHRoaXMgc2Vuc2UgaGVyZSA/Pz9cblxuICAgIG5vb25Qcm9wKClcbiAgICAgICAgICAgIFxubm9vbldvcmQgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlICMgbWFrZXMgdGhpcyBzZW5zZSBoZXJlID8/P1xuICAgIFxuICAgIGlmIGNodW5rLnN0YXJ0ID09IDBcbiAgICAgICAgc2V0VmFsdWUgMCAnb2JqJ1xuICAgICAgICByZXR1cm4gMVxuXG4gICAgbm9vblByb3AoKVxuICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICBcblxudXJsUHVuY3QgPSAtPlxuICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBjaHVuay50dXJkID09ICc6Ly8nIFxuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goNCkgPT0gJy4nIGFuZCBnZXRDaHVuayg1KVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICd1cmwgcHJvdG9jb2wnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWVzIDMgJ3VybCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMyAndXJsIGRvbWFpbidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgNCAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgNSAndXJsIHRsZCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gNlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLidcbiAgICAgICAgICAgIGlmIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ251bWJlcicpIGFuZCBwcmV2LnZhbHVlICE9ICdzZW12ZXInIGFuZCBwcmV2Lm1hdGNoIG5vdCBpbiAnXFxcXC4vJ1xuICAgICAgICAgICAgICAgIGlmIG5leHQgPSBnZXRDaHVuayAxXG4gICAgICAgICAgICAgICAgICAgIGlmIG5leHQuc3RhcnQgPT0gY2h1bmsuc3RhcnQrY2h1bmsubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBleHQgPSBuZXh0Lm1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBleHQgbm90IGluICdcXFxcLi8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgZXh0ICsgJyBmaWxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlICAwIGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAxIGV4dCArICcgZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgaSBpbiBbY2h1bmtJbmRleC4uMF1cbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS5zdGFydCtsaW5lLmNodW5rc1tpXS5sZW5ndGggPCBsaW5lLmNodW5rc1tpKzFdPy5zdGFydCBcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS52YWx1ZS5lbmRzV2l0aCAnZGlyJ1xuICAgICAgICAgICAgICAgIGJyZWFrIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlLnN0YXJ0c1dpdGggJ3VybCdcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS5tYXRjaCA9PSAnXCInXG4gICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbaV0udmFsdWUuc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3B1bmN0IGRpcidcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3RleHQgZGlyJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgMFxuICAgIFxudXJsV29yZCA9IC0+XG4gICAgXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIHByZXYubWF0Y2ggaW4gJ1xcXFwvJ1xuICAgICAgICAgICAgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgIGlmIG5vdCBuZXh0IG9yIG5leHQuc3RhcnQgPiBjaHVuay5zdGFydCtjaHVuay5sZW5ndGggb3IgbmV4dC5tYXRjaCBub3QgaW4gJ1xcXFwuLydcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCAnZmlsZSdcbiAgICBcbiMgICAgICAgMDAwICAgMDAwMDAwMCAgXG4jICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAgICAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5qc1B1bmN0ID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKCdcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbmpzV29yZCA9IC0+XG4gICAgXG4gICAgaWYgY2h1bmsudmFsdWUgPT0gJ2tleXdvcmQgZnVuY3Rpb24nXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnPScgYW5kIGdldFZhbHVlKC0yKS5zdGFydHNXaXRoICd0ZXh0J1xuICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ2Z1bmN0aW9uJ1xuICAgIDAgIyB3ZSBuZWVkIHRoaXMgaGVyZVxuICAgIFxuZGljdCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnOicgYW5kIG5vdCBjaHVuay50dXJkPy5zdGFydHNXaXRoICc6OidcbiAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnNwbGl0KCcgJylbMF0gaW4gWydzdHJpbmcnLCAnbnVtYmVyJywgJ3RleHQnLCAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4jICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbmpzb25QdW5jdCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnOidcbiAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICdcIidcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbY2h1bmtJbmRleC0yLi4wXVxuICAgICAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tpXS52YWx1ZSA9PSAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS52YWx1ZSA9ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIFxuanNvbldvcmQgPSAtPlxuXG4gICAgaWYgdG9wVHlwZSA9PSAnc3RyaW5nIGRvdWJsZScgYW5kIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBwcmV2Lm1hdGNoIGluICdcIl5+JyBcbiAgICAgICAgICAgIGlmIE5VTUJFUi50ZXN0KGdldG1hdGNoKDApKSBhbmQgZ2V0bWF0Y2goMSkgPT0gJy4nIGFuZCBOVU1CRVIudGVzdChnZXRtYXRjaCgyKSkgYW5kIGdldG1hdGNoKDMpID09ICcuJyBhbmQgTlVNQkVSLnRlc3QoZ2V0bWF0Y2goNCkpXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IHNlbXZlcicgaWYgcHJldi5tYXRjaCBpbiAnXn4nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDEgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAyICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMyAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDQgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICByZXR1cm4gNVxuICAgICAgICAgICAgICAgIFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcblxuZXNjYXBlID0gLT5cbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnXFxcXCcgYW5kICh0b3BUeXBlPy5zdGFydHNXaXRoKCdyZWdleHAnKSBvciB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnKVxuICAgICAgICBpZiBjaHVua0luZGV4ID09IDAgb3Igbm90IGdldENodW5rKC0xKT8uZXNjYXBlXG4gICAgICAgICAgICBpZiBnZXRDaHVuaygxKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgIGNodW5rLmVzY2FwZSA9IHRydWVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwICdlc2NhcGUnXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuXG5yZWdleHAgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG5cbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnLydcbiAgICAgICAgXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmtJbmRleCBcbiAgICAgICAgICAgIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgbmV4dCA9IGdldENodW5rICsxXG4gICAgICAgICAgICBpZiBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoKCdwdW5jdCcpIG9yIHByZXYubWF0Y2ggaW4gXCIpXVwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgIGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPiAgY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAocHJldi5zdGFydCtwcmV2Lmxlbmd0aCA9PSBjaHVuay5zdGFydCkgYW5kIG5leHQ/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbmV4dD8ubWF0Y2ggPT0gJz0nXG4gICAgICAgICAgICByZXR1cm4gaWYgcHJldi52YWx1ZS5zdGFydHNXaXRoICdudW1iZXInXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHB1c2hTdGFjayB0eXBlOidyZWdleHAnXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdyZWdleHAgc3RhcnQnXG4gICAgICAgIFxuICAgIGVzY2FwZSgpXG4gICAgXG50cmlwbGVSZWdleHAgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgXG4gICAgdHlwZSA9ICdyZWdleHAgdHJpcGxlJ1xuICAgIFxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuICAgIGlmIGNodW5rLnR1cmRbLi4yXSA9PSAnLy8vJ1xuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgbGluZW5vOmxpbmUubnVtYmVyXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlICAgXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuc2ltcGxlU3RyaW5nID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICAgICAgXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggaW4gJ1wiXFwnJ1xuICAgICAgICBcbiAgICAgICAgdHlwZSA9IHN3aXRjaCBjaHVuay5tYXRjaCBcbiAgICAgICAgICAgIHdoZW4gJ1wiJyB0aGVuICdzdHJpbmcgZG91YmxlJyBcbiAgICAgICAgICAgIHdoZW4gXCInXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgZWxzZSBpZiBub3RDb2RlXG4gICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgICAgICBcbiAgICAgICAgcHVzaFN0YWNrIHN0cm9uZzp0cnVlIHR5cGU6dHlwZVxuICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgZXNjYXBlKClcbiAgICAgICAgICAgICAgICAgICAgXG50cmlwbGVTdHJpbmcgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgaW4gWydyZWdleHAnJ3N0cmluZyBzaW5nbGUnJ3N0cmluZyBkb3VibGUnXVxuICAgIFxuICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICAgICAgXG4gICAgdHlwZSA9IHN3aXRjaCBjaHVuay50dXJkWy4uMl1cbiAgICAgICAgd2hlbiAnXCJcIlwiJyB0aGVuICdzdHJpbmcgZG91YmxlIHRyaXBsZScgXG4gICAgICAgIHdoZW4gXCInJydcIiB0aGVuICdzdHJpbmcgc2luZ2xlIHRyaXBsZSdcblxuICAgIGlmIHR5cGVcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiB0eXBlICE9IHRvcFR5cGUgYW5kIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZydcbiAgICAgICAgXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwdXNoU3RhY2sgc3Ryb25nOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICBcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcbiAgICAgICAgXG4gICAgZXNjYXBlKClcbiAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcblxubnVtYmVyID0gLT5cbiAgICBcbiAgICAjIHJldHVybiAxIGlmIGNodW5rLnZhbHVlICE9ICd0ZXh0J1xuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgTlVNQkVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTQpID09ICdudW1iZXIgZmxvYXQnIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtNSAncHVuY3Qgc2VtdmVyJyBpZiBnZXRtYXRjaCgtNSkgaW4gJ15+J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC00ICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlcidcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgaWYgSEVYTlVNLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgIFxuICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXIgaGV4J1xuICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiMgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmZsb2F0ID0gLT5cbiAgICBcbiAgICBpZiBGTE9BVC50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXIgZmxvYXQnXG4gICAgICAgIHJldHVybiAxXG4gICAgXG4jIDAwICAgICAwMCAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbm1kUHVuY3QgPSAtPlxuICAgIFxuICAgIGlmIGNodW5rSW5kZXggPT0gMCBcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBjaHVuay50dXJkIGFuZCBjaHVuay5tYXRjaCBpbiAnLSonIGFuZCBnZXRDaHVuaygxKT8uc3RhcnQgPiBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICB0eXBlID0gWydsaTEnJ2xpMicnbGkzJ11bY2h1bmsuc3RhcnQvNF1cbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZSAwIHR5cGUgKyAnIG1hcmtlcidcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnIydcbiAgICAgICAgICAgIGlmIG5vdCBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2gxJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdoMSdcbiAgICAgICAgICAgIHN3aXRjaCBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMnIFxuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDInXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAnaDInXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMjJyBcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2gzJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgJ2gzJ1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIyMnIFxuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgNCAnaDQnXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMjIyMnIFxuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDUnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgNSAnaDUnXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJyonXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkP1suLjFdID09ICcqKidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdib2xkJ1xuICAgICAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlcyAyIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuICAgICAgICBcbiAgICAgICAgdHlwZSA9ICdpdGFsaWMnXG4gICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdG9wVHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICdgJ1xuICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/Wy4uMl0gPT0gJ2BgYCdcblxuICAgICAgICAgICAgdHlwZSA9ICdjb2RlIHRyaXBsZSdcblxuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goMykgaW4gWydjb2ZmZWVzY3JpcHQnJ2phdmFzY3JpcHQnJ2pzJ11cbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAzICdjb21tZW50J1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwdXNoU3RhY2sgd2Vhazp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcbiAgICAgICAgXG4gICAgICAgIHR5cGUgPSAnY29kZSdcbiAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCB0b3BUeXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcblxuICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICBcbiMgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG5cbmludGVycG9sYXRpb24gPSAtPlxuICAgIFxuICAgIGlmIHRvcFR5cGUgPT0gJ3N0cmluZyBkb3VibGUnXG4gICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggXCJcXCN7XCJcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidpbnRlcnBvbGF0aW9uJywgd2Vhazp0cnVlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ3N0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuXG4gICAgZWxzZSBpZiB0b3BUeXBlID09ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ30nXG4gICAgICAgICAgICBhZGRWYWx1ZSAwICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBlbmQnXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbmtleXdvcmQgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgbm90IFN5bnRheC5sYW5nW2V4dF1cbiAgICAgICAgbG9nIFwibm8gbGFuZyBmb3IgZXh0PyAje2V4dH1cIlxuICAgICAgICByZXR1cm5cbiAgICBcbiAgICBpZiBTeW50YXgubGFuZ1tleHRdLmhhc093blByb3BlcnR5KGNodW5rLm1hdGNoKSBcbiAgICAgICAgY2h1bmsudmFsdWUgPSBTeW50YXgubGFuZ1tleHRdW2NodW5rLm1hdGNoXVxuICAgICAgICByZXR1cm4gIyBnaXZlIGNvZmZlZUZ1bmMgYSBjaGFuY2UsIG51bWJlciBiYWlscyBmb3IgdXNcbiAgICAgICAgICAgICAgICBcbiMgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgICAgIFxuIyAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICBcbiMgIDAwMCAwMDAgICAwMDAgMCAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbnhtbFB1bmN0ID0gLT4gXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnPC8nXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAna2V5d29yZCdcbiAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggaW4gWyc8Jyc+J11cbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ2tleXdvcmQnXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuXG5jcHBNYWNybyA9IC0+IFxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgIGFkZFZhbHVlIDAgJ2RlZmluZSdcbiAgICAgICAgc2V0VmFsdWUgMSAnZGVmaW5lJ1xuICAgICAgICByZXR1cm4gMlxuXG4jICAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwXG4jICAgICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5zaFB1bmN0ID0gLT5cbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnLycgYW5kIGdldENodW5rKC0xKT8uc3RhcnQgKyBnZXRDaHVuaygtMSk/Lmxlbmd0aCA9PSBjaHVuay5zdGFydFxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgLTEgJ2RpcidcbiAgICBcbiAgICBpZiBjaHVuay50dXJkID09ICctLScgYW5kIGdldENodW5rKDIpPy5zdGFydCA9PSBjaHVuay5zdGFydCsyXG4gICAgICAgIGFkZFZhbHVlIDAgJ2FyZ3VtZW50J1xuICAgICAgICBhZGRWYWx1ZSAxICdhcmd1bWVudCdcbiAgICAgICAgc2V0VmFsdWUgMiAnYXJndW1lbnQnXG4gICAgICAgIHJldHVybiAzXG4gICAgICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICctJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgYWRkVmFsdWUgMCAnYXJndW1lbnQnXG4gICAgICAgIHNldFZhbHVlIDEgJ2FyZ3VtZW50J1xuICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG5zdGFja2VkID0gLT5cblxuICAgIGlmIHN0YWNrVG9wXG4gICAgICAgIHJldHVybiBpZiBzdGFja1RvcC53ZWFrXG4gICAgICAgIGlmIHN0YWNrVG9wLnN0cm9uZ1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSB0b3BUeXBlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIHRvcFR5cGVcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICBcbnB1c2hFeHQgPSAobXRjaCkgLT5cbiAgICBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICBleHRTdGFjay5wdXNoIGV4dFRvcFxuICAgIFxuYWN0RXh0ID0gLT5cbiAgICBzdGFjayAgICA9IFtdXG4gICAgc3RhY2tUb3AgPSBudWxsXG4gICAgdG9wVHlwZSAgPSAnJ1xuICAgIG5vdENvZGUgID0gZmFsc2VcbiAgICBcbnBvcEV4dCA9IC0+XG4gICAgc3RhY2sgPSBleHRUb3Auc3RhY2tcbiAgICBsaW5lLmV4dCA9IGV4dFRvcC5zdGFydC5leHRcbiAgICBleHRTdGFjay5wb3AoKSAgICAgICAgICAgICAgIFxuICAgIGV4dFRvcCA9IGV4dFN0YWNrWy0xXVxuICAgIFxuICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgbm90Q29kZSA9IHN0YWNrVG9wIGFuZCB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcbiAgICBcbnB1c2hTdGFjayA9IChvKSAtPiBcbiAgICBzdGFjay5wdXNoIG8gXG4gICAgc3RhY2tUb3AgPSBvXG4gICAgdG9wVHlwZSA9IG8udHlwZVxuICAgIG5vdENvZGUgPSB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcbiAgICBcbnBvcFN0YWNrID0gLT4gXG4gICAgc3RhY2sucG9wKClcbiAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgIG5vdENvZGUgPSBzdGFja1RvcCBhbmQgdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG4gICAgXG5nZXRDaHVuayA9IChkKSAtPiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdXG5zZXRWYWx1ZSA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlID0gdmFsdWVcbmdldFZhbHVlID0gKGQpIC0+IGdldENodW5rKGQpPy52YWx1ZSA/ICcnXG5nZXRtYXRjaCA9IChkKSAtPiBnZXRDaHVuayhkKT8ubWF0Y2ggPyAnJ1xuYWRkVmFsdWUgPSAoZCwgdmFsdWUpIC0+IFxuICAgIGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIFxuICAgICAgICBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlICs9ICcgJyArIHZhbHVlXG4gICAgMVxuICAgICAgICBcbmFkZFZhbHVlcyA9IChuLHZhbHVlKSAtPiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgIGFkZFZhbHVlIGksIHZhbHVlXG4gICAgblxuICAgIFxuaGFuZGxlcnMgPSBcbiAgICBjb2ZmZWU6IFxuICAgICAgICAgICAgcHVuY3Q6WyBibG9ja0NvbW1lbnQsIGhhc2hDb21tZW50LCB0cmlwbGVSZWdleHAsIGNvZmZlZVB1bmN0LCB0cmlwbGVTdHJpbmcsIHNpbXBsZVN0cmluZywgaW50ZXJwb2xhdGlvbiwgZGFzaEFycm93LCByZWdleHAsIGRpY3QsIHN0YWNrZWQgXVxuICAgICAgICAgICAgd29yZDogWyBrZXl3b3JkLCBjb2ZmZWVXb3JkLCBudW1iZXIsIHByb3BlcnR5LCBzdGFja2VkIF1cbiAgICBub29uOiAgIHB1bmN0Olsgbm9vbkNvbW1lbnQsICBub29uUHVuY3QsIHVybFB1bmN0LCAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIG5vb25Xb3JkLCB1cmxXb3JkLCBudW1iZXIsIHN0YWNrZWQgXVxuICAgIGpzOiAgICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwganNQdW5jdCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCwgc3RhY2tlZCBdLCB3b3JkOlsga2V5d29yZCwganNXb3JkLCBudW1iZXIsIHByb3BlcnR5LCBzdGFja2VkIF1cbiAgICB0czogICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIGpzUHVuY3QsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIGRpY3QsIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIGpzV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSwgc3RhY2tlZCBdXG4gICAgaXNzOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgaW5pOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyAgICAgICAgICBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgY3BwOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgc3RhY2tlZCBdXG4gICAgaHBwOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgc3RhY2tlZCBdXG4gICAgYzogICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgc3RhY2tlZCBdXG4gICAgaDogICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgc3RhY2tlZCBdXG4gICAgY3M6ICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgcHVnOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgc3R5bDogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgY3NzOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgc2FzczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgc2NzczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgc3ZnOiAgICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgaHRtbDogICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgaHRtOiAgICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgc2g6ICAgICBwdW5jdDpbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCB1cmxQdW5jdCwgc2hQdW5jdCwgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCB1cmxXb3JkLCBudW1iZXIsIHN0YWNrZWQgXVxuICAgIGpzb246ICAgcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywganNvblB1bmN0LCB1cmxQdW5jdCwgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOlsga2V5d29yZCwganNvbldvcmQsIHVybFdvcmQsIG51bWJlciwgc3RhY2tlZCBdXG4gICAgbG9nOiAgICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB1cmxQdW5jdCwgZGljdCwgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyB1cmxXb3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgbWQ6ICAgICBwdW5jdDpbICAgICAgICAgICAgICAgICAgICBtZFB1bmN0LCB1cmxQdW5jdCwgeG1sUHVuY3QsICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyB1cmxXb3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgZmlzaDogICBwdW5jdDpbICAgICAgICAgICAgICAgIGhhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgXG5mb3IgZXh0IGluIFN5bnRheC5leHRzXG4gICAgaWYgbm90IGhhbmRsZXJzW2V4dF0/XG4gICAgICAgIGhhbmRsZXJzW2V4dF0gPSBwdW5jdDpbICAgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyAgICAgICAgICBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgXG4jIyNcbjAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG7ilrhkb2MgJ2Jsb2NrZWQgKmxpbmVzKidcbiAgICBcbiAgICAqbGluZXMqOiBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgXG4gICAgKipyZXR1cm5zKiogbGluZXMgd2l0aCBcbiAgICAtICdleHQnIHN3aXRjaGVkIGluIHNvbWUgbGluZXNcbiAgICAtICd2YWx1ZScgY2hhbmdlZCBpbiBjaHVua3MgdGhhdCBtYXRjaCBsYW5ndWFnZSBwYXR0ZXJuc1xuXG5ibG9ja2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIGV4dFN0YWNrICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBbXVxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIGV4dFRvcCAgICAgPSBudWxsXG4gICAgc3RhY2tUb3AgICA9IG51bGxcbiAgICBub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbiAgICB0b3BUeXBlICAgID0gJydcbiAgICBleHQgICAgICAgID0gJydcbiAgICBsaW5lICAgICAgID0gbnVsbFxuICAgIGNodW5rICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IDBcbiAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcblxuICAgICAgICBpZiBzdGFja1RvcFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdGFja1RvcC50eXBlID09ICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAgICAgICAgICBpZiBub3QgSEVBREVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBpZiBtaWdodEJlSGVhZGVyXG4gICAgICAgICAgICAgICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLmZpbGwgdGhlbiBwb3BTdGFjaygpXG4gICAgICAgIFxuICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgIGlmIGV4dFRvcC5zd2l0Y2guaW5kZW50IGFuZCBsaW5lLmNodW5rc1swXT8uc3RhcnQgPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5zdGFydFxuICAgICAgICAgICAgICAgIHBvcEV4dCgpICAgICAgICAgICAgICAgICAgICAgICAgIyBlbmQgb2YgZXh0ZW5zaW9uIGJsb2NrIHJlYWNoZWQgdGhhdCBpcyB0ZXJtaW5hdGVkIGJ5IGluZGVudGF0aW9uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3dpdGNoLnRvICAgICAjIG1ha2Ugc3VyZSB0aGUgY3VycmVudCBsaW5lIGV4dCBtYXRjaGVzIHRoZSB0b3Btb3N0IGZyb20gc3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZXh0ICE9IGxpbmUuZXh0ICAgICAgICAgICAgICAgICAgICAgICMgZWl0aGVyIGF0IHN0YXJ0IG9mIGZpbGUgb3Igd2Ugc3dpdGNoZWQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBhY3RFeHQoKVxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICAgICAgaWYgbm90IGhhbmRsXG4gICAgICAgICAgICAgICAg4pa4ZGJnIGxpbmVcbiAgICAgICAgICAgICAgICDilrhkYmcgaGFuZGxlcnNcbiAgICAgICAgICAgIOKWuGFzc2VydCBoYW5kbFxuICAgICAgICAgICAgXG4gICAgICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAgICAgXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmsgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4XVxuICAgICAgICAgICAgYmVmb3JlSW5kZXggPSBjaHVua0luZGV4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnZhbHVlID09ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5lbmQ/IGFuZCBleHRUb3Auc3dpdGNoLmVuZCA9PSBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgY2h1bmsudHVyZC5sZW5ndGgsIGV4dFRvcC5zd2l0Y2guYWRkIGlmIGV4dFRvcC5zd2l0Y2guYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BFeHQoKSAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC5wdW5jdCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlICMgd29yZHMsIG51bWJlcnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBub3Qgbm90Q29kZVxuICAgICAgICAgICAgICAgICAgICBpZiBtdGNoID0gU3ludGF4LnN3dGNoW2xpbmUuZXh0XT9bY2h1bmsubWF0Y2hdIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHVyZENodW5rID0gZ2V0Q2h1bmsgLW10Y2gudHVyZC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoLnR1cmQgPT0gKHR1cmRDaHVuaz8udHVyZCA/IHR1cmRDaHVuaz8ubWF0Y2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcHVzaCBhIG5ldyBleHRlbnNpb24gb250byB0aGUgc3RhY2ssIGV4dCB3aWxsIGNoYW5nZSBvbiBzdGFydCBvZiBuZXh0IGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaEV4dCBtdGNoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC53b3JkID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gYmVmb3JlSW5kZXhcbiAgICAgICAgICAgICAgICBjaHVua0luZGV4KytcbiAgICBsaW5lc1xuICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5ibG9ja3MgPSAobGluZXMsIGV4dD0nY29mZmVlJykgLT5cbiAgICBcbiAgICDilrhkb2MgJ2Jsb2NrcyAqbGluZXMqLCAqZXh0KidcblxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2Ygc3RyaW5nc1xuICAgICAgICBcbiAgICAgICAgKmV4dCo6XG4gICAgICAgIC0ga29mZmVlIGNvZmZlZSBqcyB0cyBcbiAgICAgICAgLSBzdHlsIGNzcyBzYXNzIHNjc3MgXG4gICAgICAgIC0gcHVnIGh0bWwgaHRtIHN2ZyBcbiAgICAgICAgLSBjcHAgaHBwIGN4eCBjIGggXG4gICAgICAgIC0gYmFzaCBmaXNoIHNoIFxuICAgICAgICAtIG5vb24ganNvblxuICAgICAgICAtIG1kIHBsaXN0IFxuICAgICAgICAtIGlzcyBpbmlcbiAgICAgICAgLSB0eHQgbG9nIFxuXG4gICAgICAgICoqcmV0dXJucyoqIHRoZSByZXN1bHQgb2ZcbiAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgIGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG4gICAgICAgIGBgYFxuICAgIGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG4gICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIFxuICAgIGJsb2NrczogIGJsb2Nrc1xuICAgIHJhbmdlczogIChsaW5lLCBleHQpICAtPiBibG9ja3MoW2xpbmVdLCBleHQpWzBdLmNodW5rc1xuICAgIGRpc3NlY3Q6IChsaW5lcywgZXh0KSAtPiBibG9ja3MobGluZXMsIGV4dCkubWFwIChsKSAtPiBsLmNodW5rc1xuICAgIFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxu4pa4dGVzdCAncHJvZmlsZSdcbiAgICBcbiAgICDilrhwcm9maWxlICctLS0tLSdcbiAgICAgICAgXG4gICAgICAgIHRleHQwID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL2NvZmZlZS9ub2Rlcy5jb2ZmZWVcIiAjIDYtMTFtc1xuICAgICAgICB0ZXh0MSA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9L3Rlc3QuY29mZmVlXCIgIyA1MC0xMjDOvHNcbiAgICBcbiAgICAgICAgbGluZXMwID0gdGV4dDAuc3BsaXQgJ1xcbidcbiAgICAgICAgbGluZXMxID0gdGV4dDEuc3BsaXQgJ1xcbidcblxuICAgIGZvciBpIGluIFswLi41XVxuICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgZm9yIGkgaW4gWzAuLjE1XVxuICAgICAgICBcbiAgICAgICAg4pa4cHJvZmlsZSAnbGluZXMwJ1xuICAgICAgICAgICAgYmxvY2tzIGxpbmVzMFxuICAgICAgICAjIOKWuHByb2ZpbGUgJ3N5bnRheDAnXG4gICAgICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2NvZmZlZSdcbiAgICAgICAgICAgIFxuICAgICAgICAjIOKWuHByb2ZpbGUgJ2xpbmVzMSdcbiAgICAgICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICAgICAjIOKWuHByb2ZpbGUgJ3N5bnRheDEnXG4gICAgICAgICAgICAjIGxpbmVzMS5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2NvZmZlZSdcbiAgICAgICAgICAgIFxuIyMjXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgICAgICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuIyMjXG5cbuKWuHRlc3QgJ3Rlc3QnXG5cbiAgICByZXF1aXJlKCdreGsnKS5jaGFpKCkgICAgXG4iXX0=
//# sourceURL=../coffee/klor.coffee