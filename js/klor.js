// koffee 0.45.0

/*
000   000  000       0000000   00000000   
000  000   000      000   000  000   000  
0000000    000      000   000  0000000    
000  000   000      000   000  000   000  
000   000  0000000   0000000   000   000
 */
var FLOAT, HEADER, HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, actExt, addValue, addValues, blockComment, blocked, blocks, chunk, chunkIndex, chunked, codeTypes, coffeePunct, coffeeWord, commentHeader, cppMacro, dashArrow, dict, escape, ext, extStack, extTop, fillComment, float, getChunk, getValue, getmatch, handl, handlers, hashComment, interpolation, j, jsPunct, jsWord, jsonDict, keyword, klog, kstr, len, line, mdPunct, noon, noonComment, noonProp, noonPunct, noonWord, notCode, number, popExt, popStack, property, pushExt, pushStack, ref, ref1, regexp, setValue, shPunct, simpleString, slash, slashComment, stack, stackTop, stacked, starComment, thisCall, topType, tripleRegexp, tripleString, urlPunct, xmlPunct,
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
    var i, j, prev, ref1, ref2;
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
            if (!prev.value.startsWith('number') && prev.value !== 'semver' && prev.match !== '/') {
                if (ext = (ref1 = getChunk(1)) != null ? ref1.match : void 0) {
                    if (ext !== '/') {
                        setValue(-1, ext + ' file');
                        addValue(0, ext);
                        setValue(1, ext + ' ext');
                        return 2;
                    }
                }
            }
        }
        if (chunk.match === '/') {
            for (i = j = ref2 = chunkIndex; ref2 <= 0 ? j <= 0 : j >= 0; i = ref2 <= 0 ? ++j : --j) {
                if (line.chunks[i].start + line.chunks[i].length < line.chunks[i + 1].start || line.chunks[i].value.endsWith('dir')) {
                    break;
                }
                line.chunks[i].value += ' dir';
            }
            return 1;
        }
    }
    return 0;
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

jsonDict = function() {
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
    if (Syntax.lang[ext].hasOwnProperty(chunk.match)) {
        chunk.value = Syntax.lang[ext][chunk.match];
        return 0;
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
        word: [noonWord, number, stacked]
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
        punct: [hashComment, simpleString, shPunct, stacked],
        word: [keyword, number, stacked]
    },
    json: {
        punct: [simpleString, jsonDict, stacked],
        word: [keyword, number, stacked]
    },
    md: {
        punct: [mdPunct, xmlPunct, stacked],
        word: [number, stacked]
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
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m985[39m', line);
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m986[39m', handlers);
            }
            if (!(handl)) {
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m987[39m', '[1m[97massertion failure![39m[22m');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2xvci5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdXNCQUFBO0lBQUE7O0FBUUEsTUFBaUMsT0FBQSxDQUFRLEtBQVIsQ0FBakMsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxlQUFmLEVBQXFCLGVBQXJCLEVBQTJCOztBQUUzQixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0FBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBQTs7QUFFQSxNQUFNLENBQUMsS0FBUCxHQUNJO0lBQUEsTUFBQSxFQUNJO1FBQUEsR0FBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEdBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUFvQixNQUFBLEVBQVEsQ0FBNUI7U0FBZDtLQURKO0lBRUEsRUFBQSxFQUNJO1FBQUEsWUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsUUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7WUFBaUMsR0FBQSxFQUFJLGFBQXJDO1NBQWQ7UUFDQSxVQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxJQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtZQUFpQyxHQUFBLEVBQUksYUFBckM7U0FEZDtRQUVBLEVBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLElBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1lBQWlDLEdBQUEsRUFBSSxhQUFyQztTQUZkO0tBSEo7OztBQU9KLEtBQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQUVULFNBQUEsR0FBWSxDQUFDLGVBQUQsRUFBaUIsYUFBakI7O0FBTWlFOztBQXFCN0UsT0FBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLEdBQVI7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UyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBcEI7NEJBQ1osSUFBRyxJQUFJLENBQUMsSUFBTCxLQUFhLDJGQUFtQixTQUFTLENBQUUsY0FBOUIsQ0FBaEI7Z0NBRUksT0FBQSxDQUFRLElBQVIsRUFGSjs2QkFGSjt5QkFESjtxQkFESjs7QUFRQTtBQUFBLHFCQUFBLHlDQUFBOztvQkFDSSxJQUFHLE9BQUEsR0FBVSxHQUFBLENBQUEsQ0FBYjt3QkFDSSxVQUFBLElBQWM7QUFDZCw4QkFGSjs7QUFESixpQkF0Qko7O1lBMkJBLElBQUcsVUFBQSxLQUFjLFdBQWpCO2dCQUNJLFVBQUEsR0FESjs7UUFoQ0o7QUF2Q0o7V0F5RUE7QUE3Rk07O0FBcUdWLE1BQUEsR0FBUyxTQUFDLEtBQUQsRUFBUSxHQUFSOztRQUFRLE1BQUk7O0FBRWxCO1dBc0JDLE9BQUEsQ0FBUSxPQUFBLENBQVEsS0FBUixFQUFlLEdBQWYsQ0FBUjtBQXhCSzs7QUFnQ1QsTUFBTSxDQUFDLE9BQVAsR0FFSTtJQUFBLE1BQUEsRUFBUyxNQUFUO0lBQ0EsTUFBQSxFQUFTLFNBQUMsSUFBRCxFQUFPLEdBQVA7ZUFBZ0IsTUFBQSxDQUFPLENBQUMsSUFBRCxDQUFQLEVBQWUsR0FBZixDQUFvQixDQUFBLENBQUEsQ0FBRSxDQUFDO0lBQXZDLENBRFQ7SUFFQSxPQUFBLEVBQVMsU0FBQyxLQUFELEVBQVEsR0FBUjtlQUFnQixNQUFBLENBQU8sS0FBUCxFQUFjLEdBQWQsQ0FBa0IsQ0FBQyxHQUFuQixDQUF1QixTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDO1FBQVQsQ0FBdkI7SUFBaEIsQ0FGVDs7Ozs7O0FBcUNKIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4wMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbnsgc2xhc2gsIGtzdHIsIGtsb2csIG5vb24sIF8gfSA9IHJlcXVpcmUgJ2t4aydcbiAgXG5TeW50YXggPSByZXF1aXJlICcuL3N5bnRheCdcblN5bnRheC5pbml0KClcblxuU3ludGF4LnN3dGNoID0gXG4gICAgY29mZmVlOiBcbiAgICAgICAgZG9jOiAgICAgICAgICB0dXJkOifilrgnICAgdG86J21kJyAgaW5kZW50OiAxXG4gICAgbWQ6ICAgICBcbiAgICAgICAgY29mZmVlc2NyaXB0OiB0dXJkOidgYGAnIHRvOidjb2ZmZWUnIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuICAgICAgICBqYXZhc2NyaXB0OiAgIHR1cmQ6J2BgYCcgdG86J2pzJyAgICAgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgIGpzOiAgICAgICAgICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcbiAgICAgICAgICAgIFxuU1BBQ0UgID0gL1xccy9cbkhFQURFUiA9IC9eMCskL1xuUFVOQ1QgID0gL1xcVysvZ1xuTlVNQkVSID0gL15cXGQrJC9cbkZMT0FUICA9IC9eXFxkK2YkL1xuSEVYTlVNID0gL14weFthLWZBLUZcXGRdKyQvXG5cbmNvZGVUeXBlcyA9IFsnaW50ZXJwb2xhdGlvbicgJ2NvZGUgdHJpcGxlJ11cblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbuKWuGRvYyAnY2h1bmtlZCAqbGluZXMqLCAqZXh0KidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcbiAgICAgICAgXG4gICAgICAgIGNodW5rczogW1xuICAgICAgICAgICAgICAgICAgICB0dXJkOiAgIHNcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6ICBzXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAgc1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogIG5cbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICBleHQ6ICAgIHNcbiAgICAgICAgY2hhcnM6ICBuXG4gICAgICAgIGluZGV4OiAgblxuICAgICAgICBudW1iZXI6IG4rMVxuXG5jaHVua2VkID0gKGxpbmVzLCBleHQpIC0+ICAgIFxuICAgICAgICBcbiAgICBleHQgPSAnY29mZmVlJyBpZiBleHQgPT0gJ2tvZmZlZSdcbiAgICBleHQgPSAndHh0JyBpZiBleHQgbm90IGluIFN5bnRheC5leHRzXG4gICAgICAgICAgICBcbiAgICBsaW5lbm8gPSAwXG4gICAgbGluZXMubWFwICh0ZXh0KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGxpbmUgPSBcbiAgICAgICAgICAgIGNodW5rczogW11cbiAgICAgICAgICAgIGNoYXJzOiAgMFxuICAgICAgICAgICAgaW5kZXg6ICBsaW5lbm8rK1xuICAgICAgICAgICAgbnVtYmVyOiBsaW5lbm9cbiAgICAgICAgICAgIGV4dDogICAgZXh0XG5cbiAgICAgICAgY2h1bmtzID0ga3N0ci5yZXBsYWNlVGFicyh0ZXh0KS5zcGxpdCBTUEFDRVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmtzLmxlbmd0aCA9PSAxIGFuZCBjaHVua3NbMF0gPT0gJydcbiAgICAgICAgICAgIHJldHVybiBsaW5lICMgZW1wdHkgbGluZVxuICAgICAgICAgICAgXG4gICAgICAgIGMgPSAwXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGlsZSBtID0gUFVOQ1QuZXhlYyBzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgd2wgPSBtLmluZGV4LShjLXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHNbYy1zYy4uLm0uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDp3bCwgbWF0Y2g6dywgdmFsdWU6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0dXJkID0gcHVuY3QgPSBtWzBdXG5cbiAgICAgICAgICAgICAgICAgICAgcGkgPSAwXG4gICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgPSAxXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIHBpIDwgcHVuY3QubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIHBjID0gcHVuY3RbcGldXG4gICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlID0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgMHhEODAwIDw9IHB1bmN0LmNoYXJDb2RlQXQocGkpIDw9IDB4REJGRiBhbmQgMHhEQzAwIDw9IHB1bmN0LmNoYXJDb2RlQXQocGkrMSkgPD0gMHhERkZGXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYyArPSBwdW5jdFtwaSsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgcGkgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6YWR2YW5jZSwgbWF0Y2g6cGMsIHR1cmQ6dHVyZCwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJkID0gdHVyZFthZHZhbmNlLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgcGkgPCBwdW5jdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOmFkdmFuY2UsIG1hdGNoOnB1bmN0W3BpLi5dLCB2YWx1ZToncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjIDwgc2MrbCAgICAgICAgIyBjaGVjayBmb3IgcmVtYWluaW5nIG5vbi1wdW5jdFxuICAgICAgICAgICAgICAgICAgICBybCA9IHNjK2wtYyAgICAjIGxlbmd0aCBvZiByZW1haW5kZXJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHNbbC1ybC4uXSAgIyB0ZXh0ICAgb2YgcmVtYWluZGVyIFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDpybCwgbWF0Y2g6dywgdmFsdWU6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgIGMgKz0gcmxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmUuY2h1bmtzWy0xXVxuICAgICAgICAgICAgbGluZS5jaGFycyA9IGxhc3Quc3RhcnQgKyBsYXN0Lmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgIGxpbmVcbiAgICAgICAgXG4jIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIFxuIyMjXG4gICAgICAgICAgXG5leHRTdGFjayAgID0gW11cbnN0YWNrICAgICAgPSBbXVxuaGFuZGwgICAgICA9IFtdXG5leHRUb3AgICAgID0gbnVsbFxuc3RhY2tUb3AgICA9IG51bGxcbm5vdENvZGUgICAgPSBmYWxzZSAjIHNob3J0Y3V0IGZvciB0b3Agb2Ygc3RhY2sgbm90IGluIGNvZGVUeXBlc1xudG9wVHlwZSAgICA9ICcnXG5leHQgICAgICAgID0gJydcbmxpbmUgICAgICAgPSBudWxsXG5jaHVuayAgICAgID0gbnVsbFxuY2h1bmtJbmRleCA9IDBcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5maWxsQ29tbWVudCA9IChuKSAtPlxuICAgIFxuICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgYWRkVmFsdWUgaSwgJ2NvbW1lbnQnXG4gICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC1uXG4gICAgICAgIHJlc3RDaHVua3MgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4K24uLl1cbiAgICAgICAgbWlnaHRCZUhlYWRlciA9IHRydWVcbiAgICAgICAgZm9yIGMgaW4gcmVzdENodW5rc1xuICAgICAgICAgICAgYy52YWx1ZSA9ICdjb21tZW50J1xuICAgICAgICAgICAgaWYgbWlnaHRCZUhlYWRlciBhbmQgbm90IEhFQURFUi50ZXN0IGMubWF0Y2hcbiAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gZmFsc2VcbiAgICAgICAgaWYgbWlnaHRCZUhlYWRlclxuICAgICAgICAgICAgZm9yIGMgaW4gcmVzdENodW5rc1xuICAgICAgICAgICAgICAgIGMudmFsdWUgKz0gJyBoZWFkZXInXG4gICAgbGluZS5jaHVua3MubGVuZ3RoIC0gY2h1bmtJbmRleCArIG5cbiAgICBcbmhhc2hDb21tZW50ID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdyZWdleHAgdHJpcGxlJ1xuICAgIGlmIHN0YWNrVG9wIGFuZCBzdGFja1RvcC5saW5lbm8gPT0gbGluZS5udW1iZXJcbiAgICAgICAgcmV0dXJuICMgY29tbWVudHMgaW5zaWRlIHRyaXBsZSByZWdleHAgb25seSB2YWxpZCBvbiBpbnRlcm5hbCBsaW5lcz9cbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIlxuICAgICAgICBmaWxsQ29tbWVudCAxXG5cbm5vb25Db21tZW50ID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCIgYW5kIGNodW5rSW5kZXggPT0gMFxuICAgICAgICBmaWxsQ29tbWVudCAxXG4gICAgXG5zbGFzaENvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCBcIi8vXCJcbiAgICAgICAgZmlsbENvbW1lbnQgMlxuICAgIFxuYmxvY2tDb21tZW50ID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgIFxuICAgIHR5cGUgPSAnY29tbWVudCB0cmlwbGUnXG4gICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgbm90IGluIFsnaW50ZXJwb2xhdGlvbicsIHR5cGVdXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcjIyMnXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZSAgICAgICAgICAgIFxuXG5zdGFyQ29tbWVudCA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZFxuICAgIFxuICAgIHR5cGUgPSAnY29tbWVudCB0cmlwbGUnXG4gICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgIT0gdHlwZVxuICAgIFxuICAgIGlmIGNodW5rLnR1cmRbLi4xXSA9PSAnLyonIGFuZCBub3QgdG9wVHlwZSBcbiAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWUgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG4gICAgaWYgY2h1bmsudHVyZFsuLjFdID09ICcqLycgYW5kIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuZGFzaEFycm93ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgbWFya0Z1bmMgPSAtPlxuICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAndGV4dCcgXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1sxXS5tYXRjaCA9PSAnPScgYW5kIGxpbmUuY2h1bmtzWzJdLm1hdGNoICE9ICc+J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlICs9ICcgZnVuY3Rpb24nXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzFdLm1hdGNoID09ICc6J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSArPSAnIG1ldGhvZCdcbiAgICBcbiAgICBpZiBjaHVuay50dXJkXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkLnN0YXJ0c1dpdGggJy0+J1xuICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEgJ2Z1bmN0aW9uIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknIG9yIGxpbmUuY2h1bmtzWzBdLnR1cmQ/Wy4uMV0gPT0gJ0A6J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzBdLm1hdGNoID09ICdAJyBhbmQgbGluZS5jaHVua3NbMV0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCBjbGFzcydcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMl0udmFsdWUgPSAncHVuY3QgbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZC5zdGFydHNXaXRoICc9PidcbiAgICAgICAgICAgIG1hcmtGdW5jKClcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2Z1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxICdmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgIFxuY29tbWVudEhlYWRlciA9IC0+XG4gICAgXG4gICAgaWYgdG9wVHlwZSA9PSAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGlmIEhFQURFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcblxudGhpc0NhbGwgPSAtPlxuICAgIFxuICAgIHNldFZhbHVlIC0xICdmdW5jdGlvbiBjYWxsJ1xuICAgIGlmIGdldG1hdGNoKC0yKSA9PSAnQCdcbiAgICAgICAgc2V0VmFsdWUgLTIgJ3B1bmN0IGZ1bmN0aW9uIGNhbGwnXG4gICAgMFxuXG5jb2ZmZWVQdW5jdCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgICAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ+KWuCdcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ21ldGEnXG4gICAgICAgIFxuICAgIGlmIGNodW5rLnR1cmQgPT0gJ34+J1xuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ21ldGEnXG4gICAgICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCgnLi4nKSBhbmQgcHJldi5tYXRjaCAhPSAnLidcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmRbMl0gIT0gJy4nXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdyYW5nZSdcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmRbM10gIT0gJy4nXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzICdyYW5nZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgcHJldi52YWx1ZS5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi52YWx1ZSA9PSAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmV2RW5kID0gcHJldi5zdGFydCtwcmV2Lmxlbmd0aFxuICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJygnIGFuZCBwcmV2RW5kID09IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcbiAgICAgICAgICAgIGVsc2UgaWYgcHJldkVuZCA8IGNodW5rLnN0YXJ0ICMgc3BhY2VkXG4gICAgICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2ggaW4gJ0BbKHtcIlxcJydcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGNodW5rLm1hdGNoIGluICcrLS8nIFxuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgbmV4dCBvciBuZXh0Lm1hdGNoICE9ICc9JyBhbmQgbmV4dC5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuXG5jb2ZmZWVXb3JkID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHByZXYudmFsdWUgPT0gJ3B1bmN0IG1ldGEnXG4gICAgICAgICAgICBpZiBjaHVuay5zdGFydCA9PSBwcmV2LnN0YXJ0KzFcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdtZXRhJ1xuICAgICAgICAgICAgICAgIHJldHVybiAwICMgZ2l2ZSBzd2l0Y2ggYSBjaGFuY2VcbiAgICAgICAgXG4gICAgICAgIGlmIHByZXYubWF0Y2ggaW4gWydjbGFzcycsICdleHRlbmRzJ11cbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ2NsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnZhbHVlLnN0YXJ0c1dpdGggJ2tleXdvcmQnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIDEgIyB3ZSBhcmUgZG9uZSB3aXRoIHRoZSBrZXl3b3JkXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnQCdcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICd0aGlzJ1xuICAgICAgICAgICAgYWRkVmFsdWUgIDAgJ3RoaXMnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIChwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3RleHQnKSBvciBwcmV2LnZhbHVlID09ICdwcm9wZXJ0eScpIGFuZCBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgY2h1bmsuc3RhcnQgIyBzcGFjZWRcbiAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG4gICAgICAgICAgIFxucHJvcGVydHkgPSAtPiAjIHdvcmRcbiAgICAgICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG4gICAgICAgIFxuICAgICAgICBwcmV2UHJldiA9IGdldENodW5rIC0yXG4gICAgICAgIFxuICAgICAgICBpZiBwcmV2UHJldj8ubWF0Y2ggIT0gJy4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAncHJvcGVydHknXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIGlmIHByZXZQcmV2XG4gICAgICAgICAgICAgICAgaWYgcHJldlByZXYudmFsdWUgbm90IGluIFsncHJvcGVydHknLCAnbnVtYmVyJ10gYW5kIG5vdCBwcmV2UHJldi52YWx1ZS5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ29iaidcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxubm9vblByb3AgPSAtPlxuICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoKzEgPCBjaHVuay5zdGFydFxuICAgICAgICAgICAgaWYgcHJldi52YWx1ZSAhPSAnb2JqJ1xuICAgICAgICAgICAgICAgIGZvciBpIGluIFtjaHVua0luZGV4LTEuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIGkgPCBjaHVua0luZGV4LTEgYW5kIGxpbmUuY2h1bmtzW2ldLnN0YXJ0K2xpbmUuY2h1bmtzW2ldLmxlbmd0aCsxIDwgbGluZS5jaHVua3NbaSsxXS5zdGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbaV0udmFsdWUgPT0gJ3RleHQnIG9yIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICdvYmonXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS52YWx1ZSA9ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBsaW5lLmNodW5rc1tpXS52YWx1ZSA9PSAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS52YWx1ZSA9ICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAwXG5cbm5vb25QdW5jdCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGUgIyBtYWtlcyB0aGlzIHNlbnNlIGhlcmUgPz8/XG5cbiAgICBub29uUHJvcCgpXG4gICAgICAgICAgICBcbm5vb25Xb3JkID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZSAjIG1ha2VzIHRoaXMgc2Vuc2UgaGVyZSA/Pz9cbiAgICBcbiAgICBpZiBjaHVuay5zdGFydCA9PSAwXG4gICAgICAgIHNldFZhbHVlIDAgJ29iaidcbiAgICAgICAgcmV0dXJuIDFcblxuICAgIG5vb25Qcm9wKClcbiAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbnVybFB1bmN0ID0gLT5cbiAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnOi8vJyBcbiAgICAgICAgICAgIGlmIGdldG1hdGNoKDQpID09ICcuJyBhbmQgZ2V0Q2h1bmsoNSlcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAndXJsIHByb3RvY29sJ1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlcyAzICd1cmwnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDMgJ3VybCBkb21haW4nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDQgJ3B1bmN0IHVybCB0bGQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDUgJ3VybCB0bGQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIDZcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJy4nXG4gICAgICAgICAgICBpZiBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoKCdudW1iZXInKSBhbmQgcHJldi52YWx1ZSAhPSAnc2VtdmVyJyBhbmQgcHJldi5tYXRjaCAhPSAnLydcbiAgICAgICAgICAgICAgICBpZiBleHQgPSBnZXRDaHVuaygxKT8ubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0ICE9ICcvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgZXh0ICsgJyBmaWxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgIDAgZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMSBleHQgKyAnIGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgaSBpbiBbY2h1bmtJbmRleC4uMF1cbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tpXS5zdGFydCtsaW5lLmNodW5rc1tpXS5sZW5ndGggPCBsaW5lLmNodW5rc1tpKzFdLnN0YXJ0IG9yIGxpbmUuY2h1bmtzW2ldLnZhbHVlLmVuZHNXaXRoICdkaXInXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgKz0gJyBkaXInXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgIDBcbiAgICBcbiMgICAgICAgMDAwICAgMDAwMDAwMCAgXG4jICAgICAgIDAwMCAgMDAwICAgICAgIFxuIyAgICAgICAwMDAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAgICAgIDAwMCAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5qc1B1bmN0ID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKCdcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbmpzV29yZCA9IC0+XG4gICAgXG4gICAgaWYgY2h1bmsudmFsdWUgPT0gJ2tleXdvcmQgZnVuY3Rpb24nXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnPScgYW5kIGdldFZhbHVlKC0yKS5zdGFydHNXaXRoICd0ZXh0J1xuICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ2Z1bmN0aW9uJ1xuICAgIDAgIyB3ZSBuZWVkIHRoaXMgaGVyZVxuICAgIFxuZGljdCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnOicgYW5kIG5vdCBjaHVuay50dXJkPy5zdGFydHNXaXRoICc6OidcbiAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnNwbGl0KCcgJylbMF0gaW4gWydzdHJpbmcnLCAnbnVtYmVyJywgJ3RleHQnLCAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4jICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbmpzb25EaWN0ID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICc6J1xuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGZvciBpIGluIFtjaHVua0luZGV4LTIuLjBdXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2ldLnZhbHVlID0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuXG5lc2NhcGUgPSAtPlxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICdcXFxcJyBhbmQgKHRvcFR5cGU/LnN0YXJ0c1dpdGgoJ3JlZ2V4cCcpIG9yIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZycpXG4gICAgICAgIGlmIGNodW5rSW5kZXggPT0gMCBvciBub3QgZ2V0Q2h1bmsoLTEpPy5lc2NhcGVcbiAgICAgICAgICAgIGlmIGdldENodW5rKDEpPy5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgY2h1bmsuZXNjYXBlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2VzY2FwZSdcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG5cbnJlZ2V4cCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZydcblxuICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyByZWdleHAgZW5kJ1xuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVua0luZGV4IFxuICAgICAgICAgICAgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgKzFcbiAgICAgICAgICAgIGlmIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3B1bmN0Jykgb3IgcHJldi5tYXRjaCBpbiBcIildXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCAgY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA+ICBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoID09IGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICBcbiAgICAgICAgICAgIHJldHVybiBpZiBuZXh0Py5tYXRjaCA9PSAnPSdcbiAgICAgICAgICAgIHJldHVybiBpZiBwcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ251bWJlcidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcHVzaFN0YWNrIHR5cGU6J3JlZ2V4cCdcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ3JlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgZXNjYXBlKClcbiAgICBcbnRyaXBsZVJlZ2V4cCA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICBcbiAgICB0eXBlID0gJ3JlZ2V4cCB0cmlwbGUnXG4gICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgbm90IGluIFsnaW50ZXJwb2xhdGlvbicsIHR5cGVdXG4gICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcvLy8nXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBsaW5lbm86bGluZS5udW1iZXJcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGUgICBcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG5zaW1wbGVTdHJpbmcgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICBcbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCBpbiAnXCJcXCcnXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLm1hdGNoIFxuICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnIFxuICAgICAgICAgICAgd2hlbiBcIidcIiB0aGVuICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBlbHNlIGlmIG5vdENvZGVcbiAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgIFxuICAgICAgICBwdXNoU3RhY2sgc3Ryb25nOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICBlc2NhcGUoKVxuICAgICAgICAgICAgICAgICAgICBcbnRyaXBsZVN0cmluZyA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICByZXR1cm4gaWYgdG9wVHlwZSBpbiBbJ3JlZ2V4cCcnc3RyaW5nIHNpbmdsZScnc3RyaW5nIGRvdWJsZSddXG4gICAgXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgICAgICBcbiAgICB0eXBlID0gc3dpdGNoIGNodW5rLnR1cmRbLi4yXVxuICAgICAgICB3aGVuICdcIlwiXCInIHRoZW4gJ3N0cmluZyBkb3VibGUgdHJpcGxlJyBcbiAgICAgICAgd2hlbiBcIicnJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuXG4gICAgaWYgdHlwZVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIHR5cGUgIT0gdG9wVHlwZSBhbmQgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBzdHJvbmc6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuICAgICAgICBcbiAgICBlc2NhcGUoKVxuICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5udW1iZXIgPSAtPlxuICAgIFxuICAgICMgcmV0dXJuIDEgaWYgY2h1bmsudmFsdWUgIT0gJ3RleHQnXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBOVU1CRVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICBcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtNCkgPT0gJ251bWJlciBmbG9hdCcgYW5kIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC01ICdwdW5jdCBzZW12ZXInIGlmIGdldG1hdGNoKC01KSBpbiAnXn4nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTQgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMyAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyJ1xuICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICBpZiBIRVhOVU0udGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgXG4gICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBoZXgnXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxuZmxvYXQgPSAtPlxuICAgIFxuICAgIGlmIEZMT0FULnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgcmV0dXJuIDFcbiAgICBcbiMgMDAgICAgIDAwICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAwMDAwICBcblxubWRQdW5jdCA9IC0+XG4gICAgXG4gICAgaWYgY2h1bmtJbmRleCA9PSAwIFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IGNodW5rLnR1cmQgYW5kIGNodW5rLm1hdGNoIGluICctKicgYW5kIGdldENodW5rKDEpPy5zdGFydCA+IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgIHR5cGUgPSBbJ2xpMScnbGkyJydsaTMnXVtjaHVuay5zdGFydC80XVxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgdHlwZSArICcgbWFya2VyJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcjJ1xuICAgICAgICAgICAgaWYgbm90IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDEnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ2gxJ1xuICAgICAgICAgICAgc3dpdGNoIGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICB3aGVuICcjIycgXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdoMidcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMnIFxuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDMnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyAnaDMnXG4gICAgICAgICAgICAgICAgd2hlbiAnIyMjIycgXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoNCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyA0ICdoNCdcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMjIycgXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoNSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyA1ICdoNSdcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnKidcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/Wy4uMV0gPT0gJyoqJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gJ2JvbGQnXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWVzIDIgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gJ2l0YWxpYydcbiAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCB0b3BUeXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ2AnXG4gICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZD9bLi4yXSA9PSAnYGBgJ1xuXG4gICAgICAgICAgICB0eXBlID0gJ2NvZGUgdHJpcGxlJ1xuXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCgzKSBpbiBbJ2NvZmZlZXNjcmlwdCcnamF2YXNjcmlwdCcnanMnXVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIDMgJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB3ZWFrOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuICAgICAgICBcbiAgICAgICAgdHlwZSA9ICdjb2RlJ1xuICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHRvcFR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuXG4gICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCBcblxuaW50ZXJwb2xhdGlvbiA9IC0+XG4gICAgXG4gICAgaWYgdG9wVHlwZSA9PSAnc3RyaW5nIGRvdWJsZSdcbiAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCBcIlxcI3tcIlxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6J2ludGVycG9sYXRpb24nLCB3ZWFrOnRydWVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAnc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG5cbiAgICBlbHNlIGlmIHRvcFR5cGUgPT0gJ2ludGVycG9sYXRpb24nXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnfSdcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgJ3N0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcblxua2V5d29yZCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBTeW50YXgubGFuZ1tleHRdLmhhc093blByb3BlcnR5KGNodW5rLm1hdGNoKSBcbiAgICAgICAgY2h1bmsudmFsdWUgPSBTeW50YXgubGFuZ1tleHRdW2NodW5rLm1hdGNoXVxuICAgICAgICByZXR1cm4gMCAjIGdpdmUgY29mZmVlRnVuYyBhIGNoYW5jZSwgbnVtYmVyIGJhaWxzIGZvciB1c1xuICAgICAgICAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwICAgICAgXG4jICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcblxueG1sUHVuY3QgPSAtPiBcbiAgICBcbiAgICBpZiBjaHVuay50dXJkID09ICc8LydcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdrZXl3b3JkJ1xuICAgICAgICBcbiAgICBpZiBjaHVuay5tYXRjaCBpbiBbJzwnJz4nXVxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAna2V5d29yZCdcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG5cbmNwcE1hY3JvID0gLT4gXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgYWRkVmFsdWUgMCAnZGVmaW5lJ1xuICAgICAgICBzZXRWYWx1ZSAxICdkZWZpbmUnXG4gICAgICAgIHJldHVybiAyXG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAwMDAwMDBcbiMgICAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgMDAwICAgMDAwXG5cbnNoUHVuY3QgPSAtPlxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICcvJyBhbmQgZ2V0Q2h1bmsoLTEpPy5zdGFydCArIGdldENodW5rKC0xKT8ubGVuZ3RoID09IGNodW5rLnN0YXJ0XG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAtMSAnZGlyJ1xuICAgIFxuICAgIGlmIGNodW5rLnR1cmQgPT0gJy0tJyBhbmQgZ2V0Q2h1bmsoMik/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzJcbiAgICAgICAgYWRkVmFsdWUgMCAnYXJndW1lbnQnXG4gICAgICAgIGFkZFZhbHVlIDEgJ2FyZ3VtZW50J1xuICAgICAgICBzZXRWYWx1ZSAyICdhcmd1bWVudCdcbiAgICAgICAgcmV0dXJuIDNcbiAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJy0nIGFuZCBnZXRDaHVuaygxKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICAgICAgICBhZGRWYWx1ZSAwICdhcmd1bWVudCdcbiAgICAgICAgc2V0VmFsdWUgMSAnYXJndW1lbnQnXG4gICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbnN0YWNrZWQgPSAtPlxuXG4gICAgaWYgc3RhY2tUb3BcbiAgICAgICAgcmV0dXJuIGlmIHN0YWNrVG9wLndlYWtcbiAgICAgICAgaWYgc3RhY2tUb3Auc3Ryb25nXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9IHRvcFR5cGVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdG9wVHlwZVxuICAgICAgICByZXR1cm4gMVxuICAgICAgIFxucHVzaEV4dCA9IChtdGNoKSAtPlxuICAgIGV4dFRvcCA9IHN3aXRjaDptdGNoLCBzdGFydDpsaW5lLCBzdGFjazpzdGFja1xuICAgIGV4dFN0YWNrLnB1c2ggZXh0VG9wXG4gICAgXG5hY3RFeHQgPSAtPlxuICAgIHN0YWNrICAgID0gW11cbiAgICBzdGFja1RvcCA9IG51bGxcbiAgICB0b3BUeXBlICA9ICcnXG4gICAgbm90Q29kZSAgPSBmYWxzZVxuICAgIFxucG9wRXh0ID0gLT5cbiAgICBzdGFjayA9IGV4dFRvcC5zdGFja1xuICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN0YXJ0LmV4dFxuICAgIGV4dFN0YWNrLnBvcCgpICAgICAgICAgICAgICAgXG4gICAgZXh0VG9wID0gZXh0U3RhY2tbLTFdXG4gICAgXG4gICAgc3RhY2tUb3AgPSBzdGFja1stMV1cbiAgICB0b3BUeXBlID0gc3RhY2tUb3A/LnR5cGVcbiAgICBub3RDb2RlID0gc3RhY2tUb3AgYW5kIHRvcFR5cGUgbm90IGluIGNvZGVUeXBlc1xuICAgIFxucHVzaFN0YWNrID0gKG8pIC0+IFxuICAgIHN0YWNrLnB1c2ggbyBcbiAgICBzdGFja1RvcCA9IG9cbiAgICB0b3BUeXBlID0gby50eXBlXG4gICAgbm90Q29kZSA9IHRvcFR5cGUgbm90IGluIGNvZGVUeXBlc1xuICAgIFxucG9wU3RhY2sgPSAtPiBcbiAgICBzdGFjay5wb3AoKVxuICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgbm90Q29kZSA9IHN0YWNrVG9wIGFuZCB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcbiAgICBcbmdldENodW5rID0gKGQpIC0+IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF1cbnNldFZhbHVlID0gKGQsIHZhbHVlKSAtPiBpZiAwIDw9IGNodW5rSW5kZXgrZCA8IGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF0udmFsdWUgPSB2YWx1ZVxuZ2V0VmFsdWUgPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/LnZhbHVlID8gJydcbmdldG1hdGNoID0gKGQpIC0+IGdldENodW5rKGQpPy5tYXRjaCA/ICcnXG5hZGRWYWx1ZSA9IChkLCB2YWx1ZSkgLT4gXG4gICAgaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggXG4gICAgICAgIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF0udmFsdWUgKz0gJyAnICsgdmFsdWVcbiAgICAxXG4gICAgICAgIFxuYWRkVmFsdWVzID0gKG4sdmFsdWUpIC0+ICAgIFxuICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgYWRkVmFsdWUgaSwgdmFsdWVcbiAgICBuXG4gICAgXG5oYW5kbGVycyA9IFxuICAgIGNvZmZlZTogXG4gICAgICAgICAgICBwdW5jdDpbIGJsb2NrQ29tbWVudCwgaGFzaENvbW1lbnQsIHRyaXBsZVJlZ2V4cCwgY29mZmVlUHVuY3QsIHRyaXBsZVN0cmluZywgc2ltcGxlU3RyaW5nLCBpbnRlcnBvbGF0aW9uLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCwgc3RhY2tlZCBdXG4gICAgICAgICAgICB3b3JkOiBbIGtleXdvcmQsIGNvZmZlZVdvcmQsIG51bWJlciwgcHJvcGVydHksIHN0YWNrZWQgXVxuICAgIG5vb246ICAgcHVuY3Q6WyBub29uQ29tbWVudCwgIG5vb25QdW5jdCwgdXJsUHVuY3QsICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOlsgbm9vbldvcmQsIG51bWJlciwgc3RhY2tlZCBdXG4gICAganM6ICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBqc1B1bmN0LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0LCBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBqc1dvcmQsIG51bWJlciwgcHJvcGVydHksIHN0YWNrZWQgXVxuICAgIHRzOiAgICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwganNQdW5jdCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCwgc3RhY2tlZCBdLCB3b3JkOlsga2V5d29yZCwganNXb3JkLCBudW1iZXIsIHByb3BlcnR5LCBzdGFja2VkIF1cbiAgICBpc3M6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBpbmk6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbICAgICAgICAgIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBjcHA6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQsICBzdGFja2VkIF1cbiAgICBocHA6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQsICBzdGFja2VkIF1cbiAgICBjOiAgICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQsICBzdGFja2VkIF1cbiAgICBoOiAgICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQsICBzdGFja2VkIF1cbiAgICBjczogICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBwdWc6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBzdHlsOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBjc3M6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBzYXNzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBzY3NzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBzdmc6ICAgIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0LCAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBodG1sOiAgIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0LCAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBodG06ICAgIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0LCAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBzaDogICAgIHB1bmN0OlsgaGFzaENvbW1lbnQsICBzaW1wbGVTdHJpbmcsIHNoUHVuY3QsICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBqc29uOiAgIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIGpzb25EaWN0LCAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBtZDogICAgIHB1bmN0OlsgICAgICAgICAgICAgICAgICAgIG1kUHVuY3QsIHhtbFB1bmN0LCAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbICAgICAgICAgIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBmaXNoOiAgIHB1bmN0OlsgICAgICAgICAgICAgICAgaGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBcbmZvciBleHQgaW4gU3ludGF4LmV4dHNcbiAgICBpZiBub3QgaGFuZGxlcnNbZXh0XT9cbiAgICAgICAgaGFuZGxlcnNbZXh0XSA9IHB1bmN0OlsgICAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbICAgICAgICAgIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICBcbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbuKWuGRvYyAnYmxvY2tlZCAqbGluZXMqJ1xuICAgIFxuICAgICpsaW5lcyo6IGFycmF5IG9mIGNodW5rZWQgbGluZXNcbiAgICBcbiAgICAqKnJldHVybnMqKiBsaW5lcyB3aXRoIFxuICAgIC0gJ2V4dCcgc3dpdGNoZWQgaW4gc29tZSBsaW5lc1xuICAgIC0gJ3ZhbHVlJyBjaGFuZ2VkIGluIGNodW5rcyB0aGF0IG1hdGNoIGxhbmd1YWdlIHBhdHRlcm5zXG5cbmJsb2NrZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAgZXh0U3RhY2sgICA9IFtdXG4gICAgc3RhY2sgICAgICA9IFtdXG4gICAgaGFuZGwgICAgICA9IFtdXG4gICAgZXh0VG9wICAgICA9IG51bGxcbiAgICBzdGFja1RvcCAgID0gbnVsbFxuICAgIG5vdENvZGUgICAgPSBmYWxzZSAjIHNob3J0Y3V0IGZvciB0b3Agb2Ygc3RhY2sgbm90IGluIGNvZGVUeXBlc1xuICAgIHRvcFR5cGUgICAgPSAnJ1xuICAgIGV4dCAgICAgICAgPSAnJ1xuICAgIGxpbmUgICAgICAgPSBudWxsXG4gICAgY2h1bmsgICAgICA9IG51bGxcbiAgICBjaHVua0luZGV4ID0gMFxuICAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuXG4gICAgICAgIGlmIHN0YWNrVG9wXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLnR5cGUgPT0gJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm9yIGNodW5rIGluIGxpbmUuY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBIRUFERVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgbWlnaHRCZUhlYWRlciA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGlmIG1pZ2h0QmVIZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgZm9yIGNodW5rIGluIGxpbmUuY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3RhY2tUb3AuZmlsbCB0aGVuIHBvcFN0YWNrKClcbiAgICAgICAgXG4gICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5pbmRlbnQgYW5kIGxpbmUuY2h1bmtzWzBdPy5zdGFydCA8PSBleHRUb3Auc3RhcnQuY2h1bmtzWzBdLnN0YXJ0XG4gICAgICAgICAgICAgICAgcG9wRXh0KCkgICAgICAgICAgICAgICAgICAgICAgICAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgaW5kZW50YXRpb25cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsaW5lLmV4dCA9IGV4dFRvcC5zd2l0Y2gudG8gICAgICMgbWFrZSBzdXJlIHRoZSBjdXJyZW50IGxpbmUgZXh0IG1hdGNoZXMgdGhlIHRvcG1vc3QgZnJvbSBzdGFja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBleHQgIT0gbGluZS5leHQgICAgICAgICAgICAgICAgICAgICAgIyBlaXRoZXIgYXQgc3RhcnQgb2YgZmlsZSBvciB3ZSBzd2l0Y2hlZCBleHRlbnNpb25cbiAgICAgICAgICAgIGFjdEV4dCgpXG4gICAgICAgICAgICBoYW5kbCA9IGhhbmRsZXJzW2V4dCA9IGxpbmUuZXh0XSAgICAjIGluc3RhbGwgbmV3IGhhbmRsZXJzXG4gICAgICAgICAgICBpZiBub3QgaGFuZGxcbiAgICAgICAgICAgICAgICDilrhkYmcgbGluZVxuICAgICAgICAgICAgICAgIOKWuGRiZyBoYW5kbGVyc1xuICAgICAgICAgICAg4pa4YXNzZXJ0IGhhbmRsXG4gICAgICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4gICAgICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICAgICBcbiAgICAgICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgd2hpbGUgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaHVuayA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXhdXG4gICAgICAgICAgICBiZWZvcmVJbmRleCA9IGNodW5rSW5kZXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmVuZD8gYW5kIGV4dFRvcC5zd2l0Y2guZW5kID09IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlcyBjaHVuay50dXJkLmxlbmd0aCwgZXh0VG9wLnN3aXRjaC5hZGQgaWYgZXh0VG9wLnN3aXRjaC5hZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcEV4dCgpICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSB0dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLnB1bmN0ID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyB3b3JkcywgbnVtYmVyc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBub3RDb2RlXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXguc3d0Y2hbbGluZS5leHRdP1tjaHVuay5tYXRjaF0gXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dXJkQ2h1bmsgPSBnZXRDaHVuayAtbXRjaC50dXJkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG10Y2gudHVyZCA9PSAodHVyZENodW5rPy50dXJkID8gdHVyZENodW5rPy5tYXRjaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBwdXNoIGEgbmV3IGV4dGVuc2lvbiBvbnRvIHRoZSBzdGFjaywgZXh0IHdpbGwgY2hhbmdlIG9uIHN0YXJ0IG9mIG5leHQgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoRXh0IG10Y2hcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLndvcmQgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSBiZWZvcmVJbmRleFxuICAgICAgICAgICAgICAgIGNodW5rSW5kZXgrK1xuICAgIGxpbmVzXG4gICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmJsb2NrcyA9IChsaW5lcywgZXh0PSdjb2ZmZWUnKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tzICpsaW5lcyosICpleHQqJ1xuXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBzdHJpbmdzXG4gICAgICAgIFxuICAgICAgICAqZXh0KjpcbiAgICAgICAgLSBrb2ZmZWUgY29mZmVlIGpzIHRzIFxuICAgICAgICAtIHN0eWwgY3NzIHNhc3Mgc2NzcyBcbiAgICAgICAgLSBwdWcgaHRtbCBodG0gc3ZnIFxuICAgICAgICAtIGNwcCBocHAgY3h4IGMgaCBcbiAgICAgICAgLSBiYXNoIGZpc2ggc2ggXG4gICAgICAgIC0gbm9vbiBqc29uXG4gICAgICAgIC0gbWQgcGxpc3QgXG4gICAgICAgIC0gaXNzIGluaVxuICAgICAgICAtIHR4dCBsb2cgXG5cbiAgICAgICAgKipyZXR1cm5zKiogdGhlIHJlc3VsdCBvZlxuICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICAgICAgYGBgXG4gICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgXG4gICAgYmxvY2tzOiAgYmxvY2tzXG4gICAgcmFuZ2VzOiAgKGxpbmUsIGV4dCkgIC0+IGJsb2NrcyhbbGluZV0sIGV4dClbMF0uY2h1bmtzXG4gICAgZGlzc2VjdDogKGxpbmVzLCBleHQpIC0+IGJsb2NrcyhsaW5lcywgZXh0KS5tYXAgKGwpIC0+IGwuY2h1bmtzXG4gICAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG7ilrh0ZXN0ICdwcm9maWxlJ1xuICAgIFxuICAgIOKWuHByb2ZpbGUgJy0tLS0tJ1xuICAgICAgICBcbiAgICAgICAgdGV4dDAgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvY29mZmVlL25vZGVzLmNvZmZlZVwiICMgNi0xMW1zXG4gICAgICAgIHRleHQxID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vdGVzdC5jb2ZmZWVcIiAjIDUwLTEyMM68c1xuICAgIFxuICAgICAgICBsaW5lczAgPSB0ZXh0MC5zcGxpdCAnXFxuJ1xuICAgICAgICBsaW5lczEgPSB0ZXh0MS5zcGxpdCAnXFxuJ1xuXG4gICAgZm9yIGkgaW4gWzAuLjVdXG4gICAgICAgIGJsb2NrcyBsaW5lczBcbiAgICAgICAgIyBibG9ja3MgbGluZXMxXG4gICAgICAgICMgbGluZXMwLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAnY29mZmVlJ1xuICAgICAgICBcbiAgICBmb3IgaSBpbiBbMC4uMTVdXG4gICAgICAgIFxuICAgICAgICDilrhwcm9maWxlICdsaW5lczAnXG4gICAgICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgICAgICMg4pa4cHJvZmlsZSAnc3ludGF4MCdcbiAgICAgICAgICAgICMgbGluZXMwLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAnY29mZmVlJ1xuICAgICAgICAgICAgXG4gICAgICAgICMg4pa4cHJvZmlsZSAnbGluZXMxJ1xuICAgICAgICAgICAgIyBibG9ja3MgbGluZXMxXG4gICAgICAgICMg4pa4cHJvZmlsZSAnc3ludGF4MSdcbiAgICAgICAgICAgICMgbGluZXMxLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAnY29mZmVlJ1xuICAgICAgICAgICAgXG4jIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4jIyNcblxu4pa4dGVzdCAndGVzdCdcblxuICAgIHJlcXVpcmUoJ2t4aycpLmNoYWkoKSAgICBcbiJdfQ==
//# sourceURL=../coffee/klor.coffee