// koffee 0.45.0

/*
0000000    000       0000000    0000000  000   000   0000000    
000   000  000      000   000  000       000  000   000         
0000000    000      000   000  000       0000000    0000000     
000   000  000      000   000  000       000  000        000    
0000000    0000000   0000000    0000000  000   000  0000000
 */
var FLOAT, HEADER, HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, actExt, addValue, addValues, blockComment, blocked, blocks, chunk, chunkIndex, chunked, codeTypes, coffeePunct, coffeeWord, commentHeader, cppMacro, dashArrow, dict, escape, ext, extStack, extTop, fillComment, float, getChunk, getValue, getmatch, handl, handlers, hashComment, interpolation, j, jsFunc, keyword, klog, kstr, len, line, mdPunct, noon, noonComment, notCode, number, popExt, popStack, property, pushExt, pushStack, ref, ref1, regexp, setValue, shPunct, simpleString, slash, slashComment, stack, stackTop, stacked, starComment, thisCall, topType, tripleRegexp, tripleString, xmlPunct,
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

chunked = function(lines, ext) {
    var lineno;
''
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
0000000    000       0000000    0000000  000   000  00000000  0000000    
000   000  000      000   000  000       000  000   000       000   000  
0000000    000      000   000  000       0000000    0000000   000   000  
000   000  000      000   000  000       000  000   000       000   000  
0000000    0000000   0000000    0000000  000   000  00000000  0000000
 */

''

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
    if (stackTop) {
        return;
    }
    if (chunk.turd === "//") {
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
        if (prev.value.startsWith('text') && prev.start + prev.length < chunk.start) {
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

jsFunc = function() {
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
        } else if (topType === 'interpolation') {
            if (chunk.match === '}') {
                addValue(0, 'string interpolation end');
                popStack();
                return 1;
            }
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

number = function() {
    if (chunk.value !== 'text') {
        return 1;
    }
    if (notCode) {
        return;
    }
    if (NUMBER.test(chunk.match)) {
        if (getmatch(-1) === '.') {
            if (getValue(-4) === 'number float' && getValue(-2) === 'number float') {
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
        punct: [noonComment, stacked],
        word: [keyword, number, stacked]
    },
    js: {
        punct: [starComment, slashComment, simpleString, dashArrow, regexp, stacked],
        word: [keyword, jsFunc, number, stacked]
    },
    ts: {
        punct: [starComment, slashComment, simpleString, dashArrow, regexp, stacked],
        word: [keyword, jsFunc, number, stacked]
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
        punct: [simpleString, dict, stacked],
        word: [keyword, number, stacked]
    },
    md: {
        punct: [mdPunct, xmlPunct, stacked],
        word: [number, stacked]
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
                console.log('[33m[93mblocks[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m876[39m', line);
                console.log('[33m[93mblocks[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m877[39m', handlers);
            }
            if (!(handl)) {
                console.log('[33m[93mblocks[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m878[39m', '[1m[97massertion failure![39m[22m');

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwyb0JBQUE7SUFBQTs7QUFRQSxNQUFpQyxPQUFBLENBQVEsS0FBUixDQUFqQyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkI7O0FBRTNCLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxNQUFNLENBQUMsSUFBUCxDQUFBOztBQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQ0k7UUFBQSxHQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFXLEVBQUEsRUFBRyxJQUFkO1lBQW9CLE1BQUEsRUFBUSxDQUE1QjtTQUFkO0tBREo7SUFFQSxFQUFBLEVBQ0k7UUFBQSxZQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxRQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtZQUFpQyxHQUFBLEVBQUksYUFBckM7U0FBZDtRQUNBLFVBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLElBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1lBQWlDLEdBQUEsRUFBSSxhQUFyQztTQURkO1FBRUEsRUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7WUFBaUMsR0FBQSxFQUFJLGFBQXJDO1NBRmQ7S0FISjs7O0FBT0osS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQUNULEtBQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBRVQsU0FBQSxHQUFZLENBQUMsZUFBRCxFQUFpQixhQUFqQjs7QUFRWixPQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsR0FBUjtBQUVQLFFB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QUFBLENBQUUsQ0FBQztJQUF2QyxDQURUO0lBRUEsT0FBQSxFQUFTLFNBQUMsS0FBRCxFQUFRLEdBQVI7ZUFBZ0IsTUFBQSxDQUFPLEtBQVAsRUFBYyxHQUFkLENBQWtCLENBQUMsR0FBbkIsQ0FBdUIsU0FBQyxDQUFEO21CQUFPLENBQUMsQ0FBQztRQUFULENBQXZCO0lBQWhCLENBRlQ7Ozs7OztBQXFDSiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIFxuIyMjXG5cbnsgc2xhc2gsIGtzdHIsIGtsb2csIG5vb24sIF8gfSA9IHJlcXVpcmUgJ2t4aydcbiAgXG5TeW50YXggPSByZXF1aXJlICcuL3N5bnRheCdcblN5bnRheC5pbml0KClcblxuU3ludGF4LnN3dGNoID0gXG4gICAgY29mZmVlOiBcbiAgICAgICAgZG9jOiAgICAgICAgICB0dXJkOifilrgnICAgdG86J21kJyAgaW5kZW50OiAxXG4gICAgbWQ6ICAgICBcbiAgICAgICAgY29mZmVlc2NyaXB0OiB0dXJkOidgYGAnIHRvOidjb2ZmZWUnIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuICAgICAgICBqYXZhc2NyaXB0OiAgIHR1cmQ6J2BgYCcgdG86J2pzJyAgICAgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgIGpzOiAgICAgICAgICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcbiAgICAgICAgICAgIFxuU1BBQ0UgID0gL1xccy9cbkhFQURFUiA9IC9eMCskL1xuUFVOQ1QgID0gL1xcVysvZ1xuTlVNQkVSID0gL15cXGQrJC9cbkZMT0FUICA9IC9eXFxkK2YkL1xuSEVYTlVNID0gL14weFthLWZBLUZcXGRdKyQvXG5cbmNvZGVUeXBlcyA9IFsnaW50ZXJwb2xhdGlvbicgJ2NvZGUgdHJpcGxlJ11cblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbmNodW5rZWQgPSAobGluZXMsIGV4dCkgLT4gICAgXG5cbiAgICDilrhkb2MgJ2NodW5rZWQgKmxpbmVzKiwgKmV4dConXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJkOiAgIHNcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOiAgc1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICBzXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogIG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogblxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBleHQ6ICAgIHNcbiAgICAgICAgICAgIGNoYXJzOiAgblxuICAgICAgICAgICAgaW5kZXg6ICBuXG4gICAgICAgICAgICBudW1iZXI6IG4rMVxuICAgICAgICBcbiAgICBleHQgPSAnY29mZmVlJyBpZiBleHQgPT0gJ2tvZmZlZSdcbiAgICBleHQgPSAndHh0JyBpZiBleHQgbm90IGluIFN5bnRheC5leHRzXG4gICAgICAgICAgICBcbiAgICBsaW5lbm8gPSAwXG4gICAgbGluZXMubWFwICh0ZXh0KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGxpbmUgPSBcbiAgICAgICAgICAgIGNodW5rczogW11cbiAgICAgICAgICAgIGNoYXJzOiAgMFxuICAgICAgICAgICAgaW5kZXg6ICBsaW5lbm8rK1xuICAgICAgICAgICAgbnVtYmVyOiBsaW5lbm9cbiAgICAgICAgICAgIGV4dDogICAgZXh0XG5cbiAgICAgICAgY2h1bmtzID0ga3N0ci5yZXBsYWNlVGFicyh0ZXh0KS5zcGxpdCBTUEFDRVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmtzLmxlbmd0aCA9PSAxIGFuZCBjaHVua3NbMF0gPT0gJydcbiAgICAgICAgICAgIHJldHVybiBsaW5lICMgZW1wdHkgbGluZVxuICAgICAgICAgICAgXG4gICAgICAgIGMgPSAwXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGlsZSBtID0gUFVOQ1QuZXhlYyBzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgd2wgPSBtLmluZGV4LShjLXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHNbYy1zYy4uLm0uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDp3bCwgbWF0Y2g6dywgdmFsdWU6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0dXJkID0gcHVuY3QgPSBtWzBdXG5cbiAgICAgICAgICAgICAgICAgICAgcGkgPSAwXG4gICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgPSAxXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIHBpIDwgcHVuY3QubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIHBjID0gcHVuY3RbcGldXG4gICAgICAgICAgICAgICAgICAgICAgICBhZHZhbmNlID0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgMHhEODAwIDw9IHB1bmN0LmNoYXJDb2RlQXQocGkpIDw9IDB4REJGRiBhbmQgMHhEQzAwIDw9IHB1bmN0LmNoYXJDb2RlQXQocGkrMSkgPD0gMHhERkZGXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYyArPSBwdW5jdFtwaSsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgcGkgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6YWR2YW5jZSwgbWF0Y2g6cGMsIHR1cmQ6dHVyZCwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJkID0gdHVyZFthZHZhbmNlLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgcGkgPCBwdW5jdC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOmFkdmFuY2UsIG1hdGNoOnB1bmN0W3BpLi5dLCB2YWx1ZToncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjIDwgc2MrbCAgICAgICAgIyBjaGVjayBmb3IgcmVtYWluaW5nIG5vbi1wdW5jdFxuICAgICAgICAgICAgICAgICAgICBybCA9IHNjK2wtYyAgICAjIGxlbmd0aCBvZiByZW1haW5kZXJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHNbbC1ybC4uXSAgIyB0ZXh0ICAgb2YgcmVtYWluZGVyIFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDpybCwgbWF0Y2g6dywgdmFsdWU6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgIGMgKz0gcmxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmUuY2h1bmtzWy0xXVxuICAgICAgICAgICAgbGluZS5jaGFycyA9IGxhc3Quc3RhcnQgKyBsYXN0Lmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgIGxpbmVcbiAgICAgICAgXG4jIyNcbjAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuICAgIFxu4pa4ZG9jICdibG9ja2VkICpsaW5lcyonXG4gICAgXG4gICAgKmxpbmVzKjogIGFycmF5IG9mIGNodW5rZWQgbGluZXNcbiAgICBcbiAgICAqKnJldHVybnMqKiBsaW5lcyB3aXRoIFxuICAgIC0gJ2V4dCcgc3dpdGNoZWQgaW4gc29tZSBsaW5lc1xuICAgIC0gJ3ZhbHVlJyBjaGFuZ2VkIGluIGNodW5rcyB0aGF0IG1hdGNoIGxhbmd1YWdlIHBhdHRlcm5zXG4gICAgICBcbmV4dFN0YWNrICAgPSBbXVxuc3RhY2sgICAgICA9IFtdXG5oYW5kbCAgICAgID0gW11cbmV4dFRvcCAgICAgPSBudWxsXG5zdGFja1RvcCAgID0gbnVsbFxubm90Q29kZSAgICA9IGZhbHNlICMgc2hvcnRjdXQgZm9yIHRvcCBvZiBzdGFjayBub3QgaW4gY29kZVR5cGVzXG50b3BUeXBlICAgID0gJydcbmV4dCAgICAgICAgPSAnJ1xubGluZSAgICAgICA9IG51bGxcbmNodW5rICAgICAgPSBudWxsXG5jaHVua0luZGV4ID0gMFxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG5cbmZpbGxDb21tZW50ID0gKG4pIC0+XG4gICAgXG4gICAgZm9yIGkgaW4gWzAuLi5uXVxuICAgICAgICBhZGRWYWx1ZSBpLCAnY29tbWVudCdcbiAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLW5cbiAgICAgICAgcmVzdENodW5rcyA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrbi4uXVxuICAgICAgICBtaWdodEJlSGVhZGVyID0gdHJ1ZVxuICAgICAgICBmb3IgYyBpbiByZXN0Q2h1bmtzXG4gICAgICAgICAgICBjLnZhbHVlID0gJ2NvbW1lbnQnXG4gICAgICAgICAgICBpZiBtaWdodEJlSGVhZGVyIGFuZCBub3QgSEVBREVSLnRlc3QgYy5tYXRjaFxuICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSBmYWxzZVxuICAgICAgICBpZiBtaWdodEJlSGVhZGVyXG4gICAgICAgICAgICBmb3IgYyBpbiByZXN0Q2h1bmtzXG4gICAgICAgICAgICAgICAgYy52YWx1ZSArPSAnIGhlYWRlcidcbiAgICByZXR1cm4gbGluZS5jaHVua3MubGVuZ3RoIC0gY2h1bmtJbmRleCArIG5cbiAgICBcbmhhc2hDb21tZW50ID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdyZWdleHAgdHJpcGxlJ1xuICAgIGlmIHN0YWNrVG9wIGFuZCBzdGFja1RvcC5saW5lbm8gPT0gbGluZS5udW1iZXJcbiAgICAgICAgcmV0dXJuICMgY29tbWVudHMgaW5zaWRlIHRyaXBsZSByZWdleHAgb25seSB2YWxpZCBvbiBpbnRlcm5hbCBsaW5lcz9cbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIlxuICAgICAgICBmaWxsQ29tbWVudCAxXG5cbm5vb25Db21tZW50ID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCIgYW5kIGNodW5rSW5kZXggPT0gMFxuICAgICAgICBmaWxsQ29tbWVudCAxXG4gICAgXG5zbGFzaENvbW1lbnQgPSAtPlxuXG4gICAgcmV0dXJuIGlmIHN0YWNrVG9wXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZCA9PSBcIi8vXCJcbiAgICAgICAgZmlsbENvbW1lbnQgMlxuICAgIFxuYmxvY2tDb21tZW50ID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgIFxuICAgIHR5cGUgPSAnY29tbWVudCB0cmlwbGUnXG4gICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgbm90IGluIFsnaW50ZXJwb2xhdGlvbicsIHR5cGVdXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcjIyMnXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZSAgICAgICAgICAgIFxuXG5zdGFyQ29tbWVudCA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZFxuICAgIFxuICAgIHR5cGUgPSAnY29tbWVudCB0cmlwbGUnXG4gICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgIT0gdHlwZVxuICAgIFxuICAgIGlmIGNodW5rLnR1cmRbLi4xXSA9PSAnLyonIGFuZCBub3QgdG9wVHlwZSBcbiAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWUgICAgICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG4gICAgaWYgY2h1bmsudHVyZFsuLjFdID09ICcqLycgYW5kIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuZGFzaEFycm93ID0gLT5cblxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgbWFya0Z1bmMgPSAtPlxuICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAndGV4dCcgXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1sxXS5tYXRjaCA9PSAnPScgYW5kIGxpbmUuY2h1bmtzWzJdLm1hdGNoICE9ICc+J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlICs9ICcgZnVuY3Rpb24nXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzFdLm1hdGNoID09ICc6J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSArPSAnIG1ldGhvZCdcbiAgICBcbiAgICBpZiBjaHVuay50dXJkXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkLnN0YXJ0c1dpdGggJy0+J1xuICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEgJ2Z1bmN0aW9uIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknIG9yIGxpbmUuY2h1bmtzWzBdLnR1cmQ/Wy4uMV0gPT0gJ0A6J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzBdLm1hdGNoID09ICdAJyBhbmQgbGluZS5jaHVua3NbMV0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCBjbGFzcydcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMl0udmFsdWUgPSAncHVuY3QgbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZC5zdGFydHNXaXRoICc9PidcbiAgICAgICAgICAgIG1hcmtGdW5jKClcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2Z1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxICdmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgIFxuY29tbWVudEhlYWRlciA9IC0+XG4gICAgXG4gICAgaWYgdG9wVHlwZSA9PSAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGlmIEhFQURFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcblxudGhpc0NhbGwgPSAtPlxuICAgIFxuICAgIHNldFZhbHVlIC0xICdmdW5jdGlvbiBjYWxsJ1xuICAgIGlmIGdldG1hdGNoKC0yKSA9PSAnQCdcbiAgICAgICAgc2V0VmFsdWUgLTIgJ3B1bmN0IGZ1bmN0aW9uIGNhbGwnXG4gICAgMFxuXG5jb2ZmZWVQdW5jdCA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgICAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ+KWuCdcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ21ldGEnXG4gICAgICAgIFxuICAgIGlmIGNodW5rLnR1cmQgPT0gJ34+J1xuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ21ldGEnXG4gICAgICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCgnLi4nKSBhbmQgcHJldi5tYXRjaCAhPSAnLidcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmRbMl0gIT0gJy4nXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdyYW5nZSdcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmRbM10gIT0gJy4nXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzICdyYW5nZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgcHJldi52YWx1ZS5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi52YWx1ZSA9PSAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmV2RW5kID0gcHJldi5zdGFydCtwcmV2Lmxlbmd0aFxuICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJygnIGFuZCBwcmV2RW5kID09IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcbiAgICAgICAgICAgIGVsc2UgaWYgcHJldkVuZCA8IGNodW5rLnN0YXJ0ICMgc3BhY2VkXG4gICAgICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2ggaW4gJ0BbKHtcIlxcJydcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGNodW5rLm1hdGNoIGluICcrLS8nIFxuICAgICAgICAgICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgMVxuICAgICAgICAgICAgICAgICAgICBpZiBub3QgbmV4dCBvciBuZXh0Lm1hdGNoICE9ICc9JyBhbmQgbmV4dC5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuXG5jb2ZmZWVXb3JkID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHByZXYudmFsdWUgPT0gJ3B1bmN0IG1ldGEnXG4gICAgICAgICAgICBpZiBjaHVuay5zdGFydCA9PSBwcmV2LnN0YXJ0KzFcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdtZXRhJ1xuICAgICAgICAgICAgICAgIHJldHVybiAwICMgZ2l2ZSBzd2l0Y2ggYSBjaGFuY2VcbiAgICAgICAgXG4gICAgICAgIGlmIHByZXYubWF0Y2ggaW4gWydjbGFzcycsICdleHRlbmRzJ11cbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ2NsYXNzJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnZhbHVlLnN0YXJ0c1dpdGggJ2tleXdvcmQnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIDEgIyB3ZSBhcmUgZG9uZSB3aXRoIHRoZSBrZXl3b3JkXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnQCdcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICd0aGlzJ1xuICAgICAgICAgICAgYWRkVmFsdWUgIDAgJ3RoaXMnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIGFuZCBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgY2h1bmsuc3RhcnQgIyBzcGFjZWRcbiAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5wcm9wZXJ0eSA9IC0+XG4gICAgICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuICAgICAgICBwcmV2UHJldiA9IGdldENodW5rIC0yXG4gICAgICAgIGlmIHByZXZQcmV2Py5tYXRjaCAhPSAnLidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgaWYgcHJldlByZXZcbiAgICAgICAgICAgICAgICBpZiBwcmV2UHJldi52YWx1ZSBub3QgaW4gWydwcm9wZXJ0eScsICdudW1iZXInXSBhbmQgbm90IHByZXZQcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnb2JqJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICBcbmpzRnVuYyA9IC0+XG4gICAgXG4gICAgaWYgY2h1bmsudmFsdWUgPT0gJ2tleXdvcmQgZnVuY3Rpb24nXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnPScgYW5kIGdldFZhbHVlKC0yKS5zdGFydHNXaXRoICd0ZXh0J1xuICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ2Z1bmN0aW9uJ1xuICAgIDAgIyB3ZSBuZWVkIHRoaXMgaGVyZVxuICAgIFxuZGljdCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnOicgYW5kIG5vdCBjaHVuay50dXJkPy5zdGFydHNXaXRoICc6OidcbiAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnNwbGl0KCcgJylbMF0gaW4gWydzdHJpbmcnLCAnbnVtYmVyJywgJ3RleHQnLCAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuXG5lc2NhcGUgPSAtPlxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICdcXFxcJyBhbmQgKHRvcFR5cGU/LnN0YXJ0c1dpdGgoJ3JlZ2V4cCcpIG9yIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZycpXG4gICAgICAgIGlmIGNodW5rSW5kZXggPT0gMCBvciBub3QgZ2V0Q2h1bmsoLTEpPy5lc2NhcGVcbiAgICAgICAgICAgIGlmIGdldENodW5rKDEpPy5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgY2h1bmsuZXNjYXBlID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2VzY2FwZSdcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG5cbnJlZ2V4cCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZydcblxuICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyByZWdleHAgZW5kJ1xuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVua0luZGV4IFxuICAgICAgICAgICAgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgKzFcbiAgICAgICAgICAgIGlmIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3B1bmN0Jykgb3IgcHJldi5tYXRjaCBpbiBcIildXCJcbiAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCAgY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA+ICBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoID09IGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICBcbiAgICAgICAgICAgIHJldHVybiBpZiBuZXh0Py5tYXRjaCA9PSAnPSdcbiAgICAgICAgICAgIHJldHVybiBpZiBwcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ251bWJlcidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcHVzaFN0YWNrIHR5cGU6J3JlZ2V4cCdcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ3JlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgZXNjYXBlKClcbiAgICBcbnRyaXBsZVJlZ2V4cCA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICBcbiAgICB0eXBlID0gJ3JlZ2V4cCB0cmlwbGUnXG4gICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgbm90IGluIFsnaW50ZXJwb2xhdGlvbicsIHR5cGVdXG4gICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcvLy8nXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBsaW5lbm86bGluZS5udW1iZXJcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGUgICBcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4jICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG5zaW1wbGVTdHJpbmcgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICBcbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCBpbiAnXCJcXCcnXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLm1hdGNoIFxuICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnIFxuICAgICAgICAgICAgd2hlbiBcIidcIiB0aGVuICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBlbHNlIGlmIG5vdENvZGVcbiAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgIFxuICAgICAgICBwdXNoU3RhY2sgc3Ryb25nOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICBlc2NhcGUoKVxuICAgICAgICAgICAgICAgICAgICBcbnRyaXBsZVN0cmluZyA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICByZXR1cm4gaWYgdG9wVHlwZSBpbiBbJ3JlZ2V4cCcnc3RyaW5nIHNpbmdsZScnc3RyaW5nIGRvdWJsZSddXG4gICAgXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgICAgICBcbiAgICB0eXBlID0gc3dpdGNoIGNodW5rLnR1cmRbLi4yXVxuICAgICAgICB3aGVuICdcIlwiXCInIHRoZW4gJ3N0cmluZyBkb3VibGUgdHJpcGxlJyBcbiAgICAgICAgd2hlbiBcIicnJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuXG4gICAgaWYgdHlwZVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIHR5cGUgIT0gdG9wVHlwZSBhbmQgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBzdHJvbmc6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuICAgICAgICBcbiAgICBlc2NhcGUoKVxuICAgIFxuIyAwMCAgICAgMDAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG5tZFB1bmN0ID0gLT5cbiAgICBcbiAgICBpZiBjaHVua0luZGV4ID09IDAgXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgY2h1bmsudHVyZCBhbmQgY2h1bmsubWF0Y2ggaW4gJy0qJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID4gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgdHlwZSA9IFsnbGkxJydsaTInJ2xpMyddW2NodW5rLnN0YXJ0LzRdXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCB0eXBlICsgJyBtYXJrZXInXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJyMnXG4gICAgICAgICAgICBpZiBub3QgY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMSdcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAnaDEnXG4gICAgICAgICAgICBzd2l0Y2ggY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgIHdoZW4gJyMjJyBcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2gyJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ2gyJ1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIycgXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMydcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzICdoMydcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMjJyBcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2g0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDQgJ2g0J1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIyMjJyBcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2g1J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDUgJ2g1J1xuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICcqJ1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZD9bLi4xXSA9PSAnKionXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSAnYm9sZCdcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgMiB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcbiAgICAgICAgXG4gICAgICAgIHR5cGUgPSAnaXRhbGljJ1xuICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHRvcFR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnYCdcbiAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkP1suLjJdID09ICdgYGAnXG5cbiAgICAgICAgICAgIHR5cGUgPSAnY29kZSB0cmlwbGUnXG5cbiAgICAgICAgICAgIGlmIGdldG1hdGNoKDMpIGluIFsnY29mZmVlc2NyaXB0JydqYXZhc2NyaXB0JydqcyddXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMyAnY29tbWVudCdcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHVzaFN0YWNrIHdlYWs6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gJ2NvZGUnXG4gICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdG9wVHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG5cbiAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuXG5pbnRlcnBvbGF0aW9uID0gLT5cbiAgICBcbiAgICBpZiB0b3BUeXBlID09ICdzdHJpbmcgZG91YmxlJ1xuICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoIFwiXFwje1wiXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTonaW50ZXJwb2xhdGlvbicsIHdlYWs6dHJ1ZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcblxuXG4gICAgICAgIGVsc2UgaWYgdG9wVHlwZSA9PSAnaW50ZXJwb2xhdGlvbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ30nXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCAnc3RyaW5nIGludGVycG9sYXRpb24gZW5kJ1xuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbmtleXdvcmQgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgU3ludGF4LmxhbmdbZXh0XS5oYXNPd25Qcm9wZXJ0eShjaHVuay5tYXRjaCkgXG4gICAgICAgIGNodW5rLnZhbHVlID0gU3ludGF4LmxhbmdbZXh0XVtjaHVuay5tYXRjaF1cbiAgICAgICAgcmV0dXJuIDAgIyBnaXZlIGNvZmZlZUZ1bmMgYSBjaGFuY2UsIG51bWJlciBiYWlscyBmb3IgdXNcbiAgICAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5udW1iZXIgPSAtPlxuICAgIFxuICAgIHJldHVybiAxIGlmIGNodW5rLnZhbHVlICE9ICd0ZXh0J1xuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgTlVNQkVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgXG4gICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTQpID09ICdudW1iZXIgZmxvYXQnIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtNCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdzZW12ZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXInXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgIGlmIEhFWE5VTS50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBcbiAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyIGhleCdcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG5mbG9hdCA9IC0+XG4gICAgXG4gICAgaWYgRkxPQVQudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICByZXR1cm4gMVxuICAgIFxuIyAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwICAgICAgXG4jICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcblxueG1sUHVuY3QgPSAtPiBcbiAgICBcbiAgICBpZiBjaHVuay50dXJkID09ICc8LydcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdrZXl3b3JkJ1xuICAgICAgICBcbiAgICBpZiBjaHVuay5tYXRjaCBpbiBbJzwnJz4nXVxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAna2V5d29yZCdcbiAgICAgICAgXG4jICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG5cbmNwcE1hY3JvID0gLT4gXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgYWRkVmFsdWUgMCAnZGVmaW5lJ1xuICAgICAgICBzZXRWYWx1ZSAxICdkZWZpbmUnXG4gICAgICAgIHJldHVybiAyXG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAwMDAwMDBcbiMgICAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgMDAwICAgMDAwXG5cbnNoUHVuY3QgPSAtPlxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICcvJyBhbmQgZ2V0Q2h1bmsoLTEpPy5zdGFydCArIGdldENodW5rKC0xKT8ubGVuZ3RoID09IGNodW5rLnN0YXJ0XG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAtMSAnZGlyJ1xuICAgIFxuICAgIGlmIGNodW5rLnR1cmQgPT0gJy0tJyBhbmQgZ2V0Q2h1bmsoMik/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzJcbiAgICAgICAgYWRkVmFsdWUgMCAnYXJndW1lbnQnXG4gICAgICAgIGFkZFZhbHVlIDEgJ2FyZ3VtZW50J1xuICAgICAgICBzZXRWYWx1ZSAyICdhcmd1bWVudCdcbiAgICAgICAgcmV0dXJuIDNcbiAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJy0nIGFuZCBnZXRDaHVuaygxKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICAgICAgICBhZGRWYWx1ZSAwICdhcmd1bWVudCdcbiAgICAgICAgc2V0VmFsdWUgMSAnYXJndW1lbnQnXG4gICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5zdGFja2VkID0gLT5cblxuICAgIGlmIHN0YWNrVG9wXG4gICAgICAgIHJldHVybiBpZiBzdGFja1RvcC53ZWFrXG4gICAgICAgIGlmIHN0YWNrVG9wLnN0cm9uZ1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSB0b3BUeXBlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIHRvcFR5cGVcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICBcbnB1c2hFeHQgPSAobXRjaCkgLT5cbiAgICBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICBleHRTdGFjay5wdXNoIGV4dFRvcFxuICAgIFxuYWN0RXh0ID0gLT5cbiAgICBzdGFjayAgICA9IFtdXG4gICAgc3RhY2tUb3AgPSBudWxsXG4gICAgdG9wVHlwZSAgPSAnJ1xuICAgIG5vdENvZGUgID0gZmFsc2VcbiAgICBcbnBvcEV4dCA9IC0+XG4gICAgc3RhY2sgPSBleHRUb3Auc3RhY2tcbiAgICBsaW5lLmV4dCA9IGV4dFRvcC5zdGFydC5leHRcbiAgICBleHRTdGFjay5wb3AoKSAgICAgICAgICAgICAgIFxuICAgIGV4dFRvcCA9IGV4dFN0YWNrWy0xXVxuICAgIFxuICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgbm90Q29kZSA9IHN0YWNrVG9wIGFuZCB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcbiAgICBcbnB1c2hTdGFjayA9IChvKSAtPiBcbiAgICBzdGFjay5wdXNoIG8gXG4gICAgc3RhY2tUb3AgPSBvXG4gICAgdG9wVHlwZSA9IG8udHlwZVxuICAgIG5vdENvZGUgPSB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcbiAgICBcbnBvcFN0YWNrID0gLT4gXG4gICAgc3RhY2sucG9wKClcbiAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgIG5vdENvZGUgPSBzdGFja1RvcCBhbmQgdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG4gICAgXG5nZXRDaHVuayA9IChkKSAtPiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdXG5zZXRWYWx1ZSA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlID0gdmFsdWVcbmdldFZhbHVlID0gKGQpIC0+IGdldENodW5rKGQpPy52YWx1ZSA/ICcnXG5nZXRtYXRjaCA9IChkKSAtPiBnZXRDaHVuayhkKT8ubWF0Y2ggPyAnJ1xuYWRkVmFsdWUgPSAoZCwgdmFsdWUpIC0+IFxuICAgIGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIFxuICAgICAgICBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlICs9ICcgJyArIHZhbHVlXG4gICAgMVxuICAgICAgICBcbmFkZFZhbHVlcyA9IChuLHZhbHVlKSAtPiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgIGFkZFZhbHVlIGksIHZhbHVlXG4gICAgblxuICAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmhhbmRsZXJzID0gXG4gICAgY29mZmVlOiBcbiAgICAgICAgICAgIHB1bmN0OlsgYmxvY2tDb21tZW50LCBoYXNoQ29tbWVudCwgdHJpcGxlUmVnZXhwLCBjb2ZmZWVQdW5jdCwgdHJpcGxlU3RyaW5nLCBzaW1wbGVTdHJpbmcsIGludGVycG9sYXRpb24sIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0LCBzdGFja2VkIF1cbiAgICAgICAgICAgIHdvcmQ6IFsga2V5d29yZCwgY29mZmVlV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSwgc3RhY2tlZCBdXG4gICAgbm9vbjogICBwdW5jdDpbIG5vb25Db21tZW50LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAganM6ICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBqc0Z1bmMsIG51bWJlciwgc3RhY2tlZCBdXG4gICAgdHM6ICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBqc0Z1bmMsIG51bWJlciwgc3RhY2tlZCBdXG4gICAgaXNzOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgaW5pOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyAgICAgICAgICBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgY3BwOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgc3RhY2tlZCBdXG4gICAgaHBwOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgc3RhY2tlZCBdXG4gICAgYzogICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgc3RhY2tlZCBdXG4gICAgaDogICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgc3RhY2tlZCBdXG4gICAgY3M6ICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgcHVnOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgc3R5bDogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgY3NzOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgc2FzczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgc2NzczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgc3ZnOiAgICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgaHRtbDogICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgaHRtOiAgICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgc2g6ICAgICBwdW5jdDpbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCBzaFB1bmN0LCAgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAganNvbjogICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCBkaWN0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgbWQ6ICAgICBwdW5jdDpbICAgICAgICAgICAgICAgICAgICBtZFB1bmN0LCB4bWxQdW5jdCwgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyAgICAgICAgICBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgXG5mb3IgZXh0IGluIFN5bnRheC5leHRzXG4gICAgaWYgbm90IGhhbmRsZXJzW2V4dF0/XG4gICAgICAgIGhhbmRsZXJzW2V4dF0gPSBwdW5jdDpbICAgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyAgICAgICAgICBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgIyBsb2c6ICAgIHB1bmN0OlsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbICAgICAgICAgIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICAjIHR4dDogICAgcHVuY3Q6WyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOlsgICAgICAgICAgbnVtYmVyLCAgICAgICAgIHN0YWNrZWQgXVxuICAgICMgZmlzaDogICBwdW5jdDpbICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyAgICAgICAgICBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5ibG9ja2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIGV4dFN0YWNrICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBbXVxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIGV4dFRvcCAgICAgPSBudWxsXG4gICAgc3RhY2tUb3AgICA9IG51bGxcbiAgICBub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbiAgICB0b3BUeXBlICAgID0gJydcbiAgICBleHQgICAgICAgID0gJydcbiAgICBsaW5lICAgICAgID0gbnVsbFxuICAgIGNodW5rICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IDBcbiAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIGZvciBsaW5lIGluIGxpbmVzXG5cbiAgICAgICAgaWYgc3RhY2tUb3BcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3RhY2tUb3AudHlwZSA9PSAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbWlnaHRCZUhlYWRlciA9IHRydWVcbiAgICAgICAgICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IEhFQURFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWdodEJlSGVhZGVyID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgaWYgbWlnaHRCZUhlYWRlclxuICAgICAgICAgICAgICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBzdGFja1RvcC5maWxsIHRoZW4gcG9wU3RhY2soKVxuICAgICAgICBcbiAgICAgICAgaWYgZXh0VG9wXG4gICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmluZGVudCBhbmQgbGluZS5jaHVua3NbMF0/LnN0YXJ0IDw9IGV4dFRvcC5zdGFydC5jaHVua3NbMF0uc3RhcnRcbiAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSBpbmRlbnRhdGlvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN3aXRjaC50byAgICAgIyBtYWtlIHN1cmUgdGhlIGN1cnJlbnQgbGluZSBleHQgbWF0Y2hlcyB0aGUgdG9wbW9zdCBmcm9tIHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dCAhPSBsaW5lLmV4dCAgICAgICAgICAgICAgICAgICAgICAjIGVpdGhlciBhdCBzdGFydCBvZiBmaWxlIG9yIHdlIHN3aXRjaGVkIGV4dGVuc2lvblxuICAgICAgICAgICAgYWN0RXh0KClcbiAgICAgICAgICAgIGhhbmRsID0gaGFuZGxlcnNbZXh0ID0gbGluZS5leHRdICAgICMgaW5zdGFsbCBuZXcgaGFuZGxlcnNcbiAgICAgICAgICAgIGlmIG5vdCBoYW5kbFxuICAgICAgICAgICAgICAgIOKWuGRiZyBsaW5lXG4gICAgICAgICAgICAgICAg4pa4ZGJnIGhhbmRsZXJzXG4gICAgICAgICAgICDilrhhc3NlcnQgaGFuZGxcbiAgICAgICAgICAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgd2hpbGUgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaHVuayA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXhdXG4gICAgICAgICAgICBiZWZvcmVJbmRleCA9IGNodW5rSW5kZXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmVuZD8gYW5kIGV4dFRvcC5zd2l0Y2guZW5kID09IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlcyBjaHVuay50dXJkLmxlbmd0aCwgZXh0VG9wLnN3aXRjaC5hZGQgaWYgZXh0VG9wLnN3aXRjaC5hZGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcEV4dCgpICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSB0dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLnB1bmN0ID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgIyB3b3JkcywgbnVtYmVyc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBub3RDb2RlXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXguc3d0Y2hbbGluZS5leHRdP1tjaHVuay5tYXRjaF0gXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0dXJkQ2h1bmsgPSBnZXRDaHVuayAtbXRjaC50dXJkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG10Y2gudHVyZCA9PSAodHVyZENodW5rPy50dXJkID8gdHVyZENodW5rPy5tYXRjaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBwdXNoIGEgbmV3IGV4dGVuc2lvbiBvbnRvIHRoZSBzdGFjaywgZXh0IHdpbGwgY2hhbmdlIG9uIHN0YXJ0IG9mIG5leHQgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwdXNoRXh0IG10Y2hcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLndvcmQgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSBiZWZvcmVJbmRleFxuICAgICAgICAgICAgICAgIGNodW5rSW5kZXgrK1xuICAgIGxpbmVzXG4gICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmJsb2NrcyA9IChsaW5lcywgZXh0PSdjb2ZmZWUnKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tzICpsaW5lcyosICpleHQqJ1xuXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBzdHJpbmdzXG4gICAgICAgIFxuICAgICAgICAqZXh0KjpcbiAgICAgICAgLSBrb2ZmZWUgY29mZmVlIGpzIHRzIFxuICAgICAgICAtIHN0eWwgY3NzIHNhc3Mgc2NzcyBcbiAgICAgICAgLSBwdWcgaHRtbCBodG0gc3ZnIFxuICAgICAgICAtIGNwcCBocHAgY3h4IGMgaCBcbiAgICAgICAgLSBiYXNoIGZpc2ggc2ggXG4gICAgICAgIC0gbm9vbiBqc29uXG4gICAgICAgIC0gbWQgcGxpc3QgXG4gICAgICAgIC0gaXNzIGluaVxuICAgICAgICAtIHR4dCBsb2cgXG5cbiAgICAgICAgKipyZXR1cm5zKiogdGhlIHJlc3VsdCBvZlxuICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICAgICAgYGBgXG4gICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgXG4gICAgYmxvY2tzOiAgYmxvY2tzXG4gICAgcmFuZ2VzOiAgKGxpbmUsIGV4dCkgIC0+IGJsb2NrcyhbbGluZV0sIGV4dClbMF0uY2h1bmtzXG4gICAgZGlzc2VjdDogKGxpbmVzLCBleHQpIC0+IGJsb2NrcyhsaW5lcywgZXh0KS5tYXAgKGwpIC0+IGwuY2h1bmtzXG4gICAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG7ilrh0ZXN0ICdwcm9maWxlJ1xuICAgIFxuICAgIOKWuHByb2ZpbGUgJy0tLS0tJ1xuICAgICAgICBcbiAgICAgICAgdGV4dDAgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvY29mZmVlL25vZGVzLmNvZmZlZVwiICMgNi0xMW1zXG4gICAgICAgIHRleHQxID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vdGVzdC5jb2ZmZWVcIiAjIDUwLTEyMM68c1xuICAgIFxuICAgICAgICBsaW5lczAgPSB0ZXh0MC5zcGxpdCAnXFxuJ1xuICAgICAgICBsaW5lczEgPSB0ZXh0MS5zcGxpdCAnXFxuJ1xuXG4gICAgZm9yIGkgaW4gWzAuLjVdXG4gICAgICAgIGJsb2NrcyBsaW5lczBcbiAgICAgICAgIyBibG9ja3MgbGluZXMxXG4gICAgICAgICMgbGluZXMwLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAnY29mZmVlJ1xuICAgICAgICBcbiAgICBmb3IgaSBpbiBbMC4uMTVdXG4gICAgICAgIFxuICAgICAgICDilrhwcm9maWxlICdsaW5lczAnXG4gICAgICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgICAgICMg4pa4cHJvZmlsZSAnc3ludGF4MCdcbiAgICAgICAgICAgICMgbGluZXMwLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAnY29mZmVlJ1xuICAgICAgICAgICAgXG4gICAgICAgICMg4pa4cHJvZmlsZSAnbGluZXMxJ1xuICAgICAgICAgICAgIyBibG9ja3MgbGluZXMxXG4gICAgICAgICMg4pa4cHJvZmlsZSAnc3ludGF4MSdcbiAgICAgICAgICAgICMgbGluZXMxLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAnY29mZmVlJ1xuICAgICAgICAgICAgXG4jIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4jIyNcblxu4pa4dGVzdCAndGVzdCdcblxuICAgIHJlcXVpcmUoJ2t4aycpLmNoYWkoKSAgICBcblxuICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICB4ICBcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICB5XG4gICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgIl19
//# sourceURL=../coffee/blocks.coffee