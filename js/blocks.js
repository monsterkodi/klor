// koffee 0.45.0

/*
0000000    000       0000000    0000000  000   000   0000000    
000   000  000      000   000  000       000  000   000         
0000000    000      000   000  000       0000000    0000000     
000   000  000      000   000  000       000  000        000    
0000000    0000000   0000000    0000000  000   000  0000000
 */
var FLOAT, HEADER, HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, blocked, blocks, chunked, codeTypes, klog, kstr, noon, ref, slash,
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

PUNCT = /\W+/gi;

NUMBER = /^\d+$/;

FLOAT = /^\d+f$/;

HEXNUM = /^0x[a-fA-F\d]+$/;

codeTypes = ['interpolation', 'code triple'];

chunked = function(lines, ext) {
    var lineno;
''
    lineno = 0;
    return lines.map(function(text) {
        var c, chunks, j, k, l, last, len, len1, line, m, pc, punct, ref1, rl, s, sc, turd, w, wl;
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
                    ref1 = punct.slice(0, -1);
                    for (k = 0, len1 = ref1.length; k < len1; k++) {
                        pc = ref1[k];
                        line.chunks.push({
                            start: c++,
                            length: 1,
                            match: pc,
                            turd: turd,
                            value: 'punct'
                        });
                        turd = turd.slice(1);
                    }
                    line.chunks.push({
                        start: c++,
                        length: 1,
                        match: punct.slice(-1)[0],
                        value: 'punct'
                    });
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

blocked = function(lines) {
    var actExt, addValue, addValues, advance, beforeIndex, blockComment, chunk, chunkIndex, coffeePunct, coffeeWord, commentHeader, cppMacro, dashArrow, dict, escape, ext, extStack, extTop, fillComment, float, getChunk, getValue, getmatch, handl, handlers, hashComment, hnd, interpolation, j, jsFunc, k, keyword, len, len1, len2, line, mdPunct, mtch, noonComment, notCode, number, p, popExt, popStack, property, pushExt, pushStack, ref1, ref2, ref3, ref4, ref5, ref6, ref7, regexp, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, starComment, thisCall, topType, tripleRegexp, tripleString, turdChunk, xmlPunct;
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
        var c, i, j, k, len, ref1, ref2;
        for (i = j = 0, ref1 = n; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
            addValue(i, 'comment');
        }
        if (chunkIndex < line.chunks.length - n) {
            ref2 = line.chunks.slice(chunkIndex + n);
            for (k = 0, len = ref2.length; k < len; k++) {
                c = ref2[k];
                c.value = 'comment';
                if (HEADER.test(c.match)) {
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
            word: [keyword, coffeeWord, commentHeader, number, property, stacked]
        },
        noon: {
            punct: [noonComment, stacked],
            word: [commentHeader, keyword, number, stacked]
        },
        js: {
            punct: [starComment, slashComment, simpleString, dashArrow, regexp, stacked],
            word: [commentHeader, keyword, jsFunc, number, stacked]
        },
        ts: {
            punct: [starComment, slashComment, simpleString, dashArrow, regexp, stacked],
            word: [commentHeader, keyword, jsFunc, number, stacked]
        },
        iss: {
            punct: [starComment, slashComment, simpleString, stacked],
            word: [commentHeader, keyword, number, stacked]
        },
        ini: {
            punct: [starComment, slashComment, simpleString, cppMacro, stacked],
            word: [commentHeader, number, stacked]
        },
        cpp: {
            punct: [starComment, slashComment, simpleString, cppMacro, stacked],
            word: [commentHeader, keyword, number, float, stacked]
        },
        hpp: {
            punct: [starComment, slashComment, simpleString, cppMacro, stacked],
            word: [commentHeader, keyword, number, float, stacked]
        },
        c: {
            punct: [starComment, slashComment, simpleString, cppMacro, stacked],
            word: [commentHeader, keyword, number, float, stacked]
        },
        h: {
            punct: [starComment, slashComment, simpleString, cppMacro, stacked],
            word: [commentHeader, keyword, number, float, stacked]
        },
        cs: {
            punct: [starComment, slashComment, simpleString, stacked],
            word: [commentHeader, keyword, number, stacked]
        },
        pug: {
            punct: [starComment, slashComment, simpleString, stacked],
            word: [commentHeader, keyword, number, stacked]
        },
        styl: {
            punct: [starComment, slashComment, simpleString, stacked],
            word: [commentHeader, keyword, number, stacked]
        },
        css: {
            punct: [starComment, slashComment, simpleString, stacked],
            word: [commentHeader, keyword, number, stacked]
        },
        sass: {
            punct: [starComment, slashComment, simpleString, stacked],
            word: [commentHeader, keyword, number, stacked]
        },
        scss: {
            punct: [starComment, slashComment, simpleString, stacked],
            word: [commentHeader, keyword, number, stacked]
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
        },
        log: {
            punct: [simpleString, stacked],
            word: [number, stacked]
        },
        txt: {
            punct: [simpleString, stacked],
            word: [number, stacked]
        }
    };
    for (j = 0, len = lines.length; j < len; j++) {
        line = lines[j];
        if (stackTop != null ? stackTop.fill : void 0) {
            popStack();
        }
        if (extTop) {
            if (extTop["switch"].indent && ((ref1 = line.chunks[0]) != null ? ref1.start : void 0) <= extTop.start.chunks[0].start) {
                popExt();
            } else {
                line.ext = extTop["switch"].to;
            }
        }
        if (ext !== line.ext) {
            actExt();
            handl = handlers[ext = line.ext];
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
                ref3 = (ref2 = handl.punct) != null ? ref2 : [];
                for (k = 0, len1 = ref3.length; k < len1; k++) {
                    hnd = ref3[k];
                    if (advance = hnd()) {
                        chunkIndex += advance;
                        break;
                    }
                }
            } else {
                if (!notCode) {
                    if (mtch = (ref4 = Syntax.swtch[line.ext]) != null ? ref4[chunk.match] : void 0) {
                        if (mtch.turd) {
                            turdChunk = getChunk(-mtch.turd.length);
                            if (mtch.turd === ((ref5 = turdChunk != null ? turdChunk.turd : void 0) != null ? ref5 : turdChunk != null ? turdChunk.match : void 0)) {
                                pushExt(mtch);
                            }
                        }
                    }
                }
                ref7 = (ref6 = handl.word) != null ? ref6 : [];
                for (p = 0, len2 = ref7.length; p < len2; p++) {
                    hnd = ref7[p];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx5SEFBQTtJQUFBOztBQVFBLE1BQWlDLE9BQUEsQ0FBUSxLQUFSLENBQWpDLEVBQUUsaUJBQUYsRUFBUyxlQUFULEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQjs7QUFFM0IsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULE1BQU0sQ0FBQyxJQUFQLENBQUE7O0FBRUEsTUFBTSxDQUFDLEtBQVAsR0FDSTtJQUFBLE1BQUEsRUFDSTtRQUFBLEdBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxHQUFMO1lBQVcsRUFBQSxFQUFHLElBQWQ7WUFBb0IsTUFBQSxFQUFRLENBQTVCO1NBQWQ7S0FESjtJQUVBLEVBQUEsRUFDSTtRQUFBLFlBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLFFBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1lBQWlDLEdBQUEsRUFBSSxhQUFyQztTQUFkO1FBQ0EsVUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7WUFBaUMsR0FBQSxFQUFJLGFBQXJDO1NBRGQ7UUFFQSxFQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxJQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtZQUFpQyxHQUFBLEVBQUksYUFBckM7U0FGZDtLQUhKOzs7QUFPSixLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQUNULEtBQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFFVCxTQUFBLEdBQVksQ0FBQyxlQUFELEVBQWlCLGFBQWpCOztBQVFaLE9BQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxHQUFSO0FBRVAsUUFB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LENBQUEsQ0FBRSxDQUFDO0lBQXZDLENBRFQ7SUFFQSxPQUFBLEVBQVMsU0FBQyxLQUFELEVBQVEsR0FBUjtlQUFnQixNQUFBLENBQU8sS0FBUCxFQUFjLEdBQWQsQ0FBa0IsQ0FBQyxHQUFuQixDQUF1QixTQUFDLENBQUQ7bUJBQU8sQ0FBQyxDQUFDO1FBQVQsQ0FBdkI7SUFBaEIsQ0FGVDs7Ozs7O0FBcUNKIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgXG4jIyNcblxueyBzbGFzaCwga3N0ciwga2xvZywgbm9vbiwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuICBcblN5bnRheCA9IHJlcXVpcmUgJy4vc3ludGF4J1xuU3ludGF4LmluaXQoKVxuXG5TeW50YXguc3d0Y2ggPSBcbiAgICBjb2ZmZWU6IFxuICAgICAgICBkb2M6ICAgICAgICAgIHR1cmQ6J+KWuCcgICB0bzonbWQnICBpbmRlbnQ6IDFcbiAgICBtZDogICAgIFxuICAgICAgICBjb2ZmZWVzY3JpcHQ6IHR1cmQ6J2BgYCcgdG86J2NvZmZlZScgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgIGphdmFzY3JpcHQ6ICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcbiAgICAgICAganM6ICAgICAgICAgICB0dXJkOidgYGAnIHRvOidqcycgICAgIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuICAgICAgICAgICAgXG5TUEFDRSAgPSAvXFxzL1xuSEVBREVSID0gL14wKyQvXG5QVU5DVCAgPSAvXFxXKy9naVxuTlVNQkVSID0gL15cXGQrJC9cbkZMT0FUICA9IC9eXFxkK2YkL1xuSEVYTlVNID0gL14weFthLWZBLUZcXGRdKyQvXG5cbmNvZGVUeXBlcyA9IFsnaW50ZXJwb2xhdGlvbicgJ2NvZGUgdHJpcGxlJ11cblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbmNodW5rZWQgPSAobGluZXMsIGV4dCkgLT4gICAgXG5cbiAgICDilrhkb2MgJ2NodW5rZWQgKmxpbmVzKiwgKmV4dConXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJkOiAgIHNcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOiAgc1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICBzXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogIG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogblxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBleHQ6ICAgIHNcbiAgICAgICAgICAgIGNoYXJzOiAgblxuICAgICAgICAgICAgaW5kZXg6ICBuXG4gICAgICAgICAgICBudW1iZXI6IG4rMVxuICAgICAgICBcbiAgICBsaW5lbm8gPSAwXG4gICAgbGluZXMubWFwICh0ZXh0KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGxpbmUgPSBcbiAgICAgICAgICAgIGNodW5rczogW11cbiAgICAgICAgICAgIGNoYXJzOiAgMFxuICAgICAgICAgICAgaW5kZXg6ICBsaW5lbm8rK1xuICAgICAgICAgICAgbnVtYmVyOiBsaW5lbm9cbiAgICAgICAgICAgIGV4dDogICAgZXh0XG5cbiAgICAgICAgY2h1bmtzID0ga3N0ci5yZXBsYWNlVGFicyh0ZXh0KS5zcGxpdCBTUEFDRVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmtzLmxlbmd0aCA9PSAxIGFuZCBjaHVua3NbMF0gPT0gJydcbiAgICAgICAgICAgIHJldHVybiBsaW5lICMgZW1wdHkgbGluZVxuICAgICAgICAgICAgXG4gICAgICAgIGMgPSAwXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGlsZSBtID0gUFVOQ1QuZXhlYyBzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgd2wgPSBtLmluZGV4LShjLXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHNbYy1zYy4uLm0uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDp3bCwgbWF0Y2g6dywgdmFsdWU6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHB1bmN0ID0gbVswXVxuICAgICAgICAgICAgICAgICAgICBmb3IgcGMgaW4gcHVuY3RbLi4uLTFdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMrKywgbGVuZ3RoOjEsIG1hdGNoOnBjLCB0dXJkOnR1cmQsIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHR1cmQgPSB0dXJkWzEuLl1cbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjKyssIGxlbmd0aDoxLCBtYXRjaDpwdW5jdFstMV0sIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjIDwgc2MrbCAgICAgICAgIyBjaGVjayBmb3IgcmVtYWluaW5nIG5vbi1wdW5jdFxuICAgICAgICAgICAgICAgICAgICBybCA9IHNjK2wtYyAgICAjIGxlbmd0aCBvZiByZW1haW5kZXJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHNbbC1ybC4uXSAgIyB0ZXh0ICAgb2YgcmVtYWluZGVyIFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDpybCwgbWF0Y2g6dywgdmFsdWU6J3RleHQnXG4gICAgICAgICAgICAgICAgICAgIGMgKz0gcmxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmUuY2h1bmtzWy0xXVxuICAgICAgICAgICAgbGluZS5jaGFycyA9IGxhc3Quc3RhcnQgKyBsYXN0Lmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgIGxpbmVcbiAgICAgICAgXG4jIyNcbjAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG5ibG9ja2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tlZCAqbGluZXMqJ1xuICAgICAgICBcbiAgICAgICAgKmxpbmVzKjogIGFycmF5IG9mIGNodW5rZWQgbGluZXNcbiAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGxpbmVzIHdpdGggXG4gICAgICAgIC0gJ2V4dCcgc3dpdGNoZWQgaW4gc29tZSBsaW5lc1xuICAgICAgICAtICd2YWx1ZScgY2hhbmdlZCBpbiBjaHVua3MgdGhhdCBtYXRjaCBsYW5ndWFnZSBwYXR0ZXJuc1xuICAgICAgICAgIFxuICAgIGV4dFN0YWNrICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBbXVxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIGV4dFRvcCAgICAgPSBudWxsXG4gICAgc3RhY2tUb3AgICA9IG51bGxcbiAgICBub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbiAgICB0b3BUeXBlICAgID0gJydcbiAgICBleHQgICAgICAgID0gJydcbiAgICBsaW5lICAgICAgID0gbnVsbFxuICAgIGNodW5rICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuXG4gICAgZmlsbENvbW1lbnQgPSAobikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgICAgIGFkZFZhbHVlIGksICdjb21tZW50J1xuICAgICAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLW5cbiAgICAgICAgICAgIGZvciBjIGluIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrbi4uXVxuICAgICAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgICAgICBpZiBIRUFERVIudGVzdCBjLm1hdGNoXG4gICAgICAgICAgICAgICAgICAgIGMudmFsdWUgKz0gJyBoZWFkZXInXG4gICAgICAgIHJldHVybiBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgblxuICAgICAgICBcbiAgICBoYXNoQ29tbWVudCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdyZWdleHAgdHJpcGxlJ1xuICAgICAgICBpZiBzdGFja1RvcCBhbmQgc3RhY2tUb3AubGluZW5vID09IGxpbmUubnVtYmVyXG4gICAgICAgICAgICByZXR1cm4gIyBjb21tZW50cyBpbnNpZGUgdHJpcGxlIHJlZ2V4cCBvbmx5IHZhbGlkIG9uIGludGVybmFsIGxpbmVzP1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgICAgIGZpbGxDb21tZW50IDFcblxuICAgIG5vb25Db21tZW50ID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgc3RhY2tUb3BcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiIGFuZCBjaHVua0luZGV4ID09IDBcbiAgICAgICAgICAgIGZpbGxDb21tZW50IDFcbiAgICAgICAgXG4gICAgc2xhc2hDb21tZW50ID0gLT5cblxuICAgICAgICByZXR1cm4gaWYgc3RhY2tUb3BcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gXCIvL1wiXG4gICAgICAgICAgICBmaWxsQ29tbWVudCAyXG4gICAgICAgIFxuICAgIGJsb2NrQ29tbWVudCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgICAgICBcbiAgICAgICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcjIyMnXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlICAgICAgICAgICAgXG5cbiAgICBzdGFyQ29tbWVudCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgIT0gdHlwZVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZFsuLjFdID09ICcvKicgYW5kIG5vdCB0b3BUeXBlIFxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWUgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuICAgICAgICBpZiBjaHVuay50dXJkWy4uMV0gPT0gJyovJyBhbmQgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG4gICAgXG4gICAgZGFzaEFycm93ID0gLT5cblxuICAgICAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgICAgICBcbiAgICAgICAgbWFya0Z1bmMgPSAtPlxuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ3RleHQnIFxuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzFdLm1hdGNoID09ICc9JyBhbmQgbGluZS5jaHVua3NbMl0ubWF0Y2ggIT0gJz4nXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSArPSAnIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbMV0ubWF0Y2ggPT0gJzonXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgKz0gJyBtZXRob2QnXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmQuc3RhcnRzV2l0aCAnLT4nXG4gICAgICAgICAgICAgICAgbWFya0Z1bmMoKVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2Z1bmN0aW9uIHRhaWwnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMSAnZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknIG9yIGxpbmUuY2h1bmtzWzBdLnR1cmQ/Wy4uMV0gPT0gJ0A6J1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIGxpbmUuY2h1bmtzWzBdLm1hdGNoID09ICdAJyBhbmQgbGluZS5jaHVua3NbMV0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ21ldGhvZCBjbGFzcydcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMl0udmFsdWUgPSAncHVuY3QgbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudHVyZC5zdGFydHNXaXRoICc9PidcbiAgICAgICAgICAgICAgICBtYXJrRnVuYygpXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCAnZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAxICdmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgXG4gICAgY29tbWVudEhlYWRlciA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09ICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgIGlmIEhFQURFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHRoaXNDYWxsID0gLT5cbiAgICAgICAgXG4gICAgICAgIHNldFZhbHVlIC0xICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpZiBnZXRtYXRjaCgtMikgPT0gJ0AnXG4gICAgICAgICAgICBzZXRWYWx1ZSAtMiAncHVuY3QgZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgMFxuICAgIFxuICAgIGNvZmZlZVB1bmN0ID0gLT5cblxuICAgICAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAn4pa4J1xuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ21ldGEnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnfj4nXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ21ldGEnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGgoJy4uJykgYW5kIHByZXYubWF0Y2ggIT0gJy4nXG4gICAgICAgICAgICAgICAgaWYgY2h1bmsudHVyZFsyXSAhPSAnLidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdyYW5nZSdcbiAgICAgICAgICAgICAgICBpZiBjaHVuay50dXJkWzNdICE9ICcuJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgJ3JhbmdlJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwcmV2RW5kID0gcHJldi5zdGFydCtwcmV2Lmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcoJyBhbmQgcHJldkVuZCA9PSBjaHVuay5zdGFydFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgcHJldkVuZCA8IGNodW5rLnN0YXJ0ICMgc3BhY2VkXG4gICAgICAgICAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoIGluICdAWyh7XCJcXCcnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGNodW5rLm1hdGNoIGluICcrLS8nIFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBuZXh0IG9yIG5leHQubWF0Y2ggIT0gJz0nIGFuZCBuZXh0LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuXG4gICAgY29mZmVlV29yZCA9IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgICAgICBcbiAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlID09ICdwdW5jdCBtZXRhJ1xuICAgICAgICAgICAgICAgIGlmIGNodW5rLnN0YXJ0ID09IHByZXYuc3RhcnQrMVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdtZXRhJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMCAjIGdpdmUgc3dpdGNoIGEgY2hhbmNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHByZXYubWF0Y2ggaW4gWydjbGFzcycsICdleHRlbmRzJ11cbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwICdjbGFzcydcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVuay52YWx1ZS5zdGFydHNXaXRoICdrZXl3b3JkJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIDEgIyB3ZSBhcmUgZG9uZSB3aXRoIHRoZSBrZXl3b3JkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBwcmV2Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICd0aGlzJ1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlICAwICd0aGlzJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3RleHQnKSBhbmQgcHJldi5zdGFydCtwcmV2Lmxlbmd0aCA8IGNodW5rLnN0YXJ0ICMgc3BhY2VkXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgcHJvcGVydHkgPSAtPlxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgICAgIFxuICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG4gICAgICAgICAgICBwcmV2UHJldiA9IGdldENodW5rIC0yXG4gICAgICAgICAgICBpZiBwcmV2UHJldj8ubWF0Y2ggIT0gJy4nXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIGlmIHByZXZQcmV2XG4gICAgICAgICAgICAgICAgICAgIGlmIHByZXZQcmV2LnZhbHVlIG5vdCBpbiBbJ3Byb3BlcnR5JywgJ251bWJlciddIGFuZCBub3QgcHJldlByZXYudmFsdWUuc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnb2JqJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgIGpzRnVuYyA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay52YWx1ZSA9PSAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnPScgYW5kIGdldFZhbHVlKC0yKS5zdGFydHNXaXRoICd0ZXh0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdmdW5jdGlvbidcbiAgICAgICAgMCAjIHdlIG5lZWQgdGhpcyBoZXJlXG4gICAgICAgIFxuICAgIGRpY3QgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICc6JyBhbmQgbm90IGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggJzo6J1xuICAgICAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICAgICAgaWYgcHJldi52YWx1ZS5zcGxpdCgnICcpWzBdIGluIFsnc3RyaW5nJywgJ251bWJlcicsICd0ZXh0JywgJ2tleXdvcmQnXVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBlc2NhcGUgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ1xcXFwnIGFuZCAodG9wVHlwZT8uc3RhcnRzV2l0aCgncmVnZXhwJykgb3IgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJylcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gMCBvciBub3QgZ2V0Q2h1bmsoLTEpPy5lc2NhcGVcbiAgICAgICAgICAgICAgICBpZiBnZXRDaHVuaygxKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgICAgICBjaHVuay5lc2NhcGUgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2VzY2FwZSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuICAgIFxuICAgIHJlZ2V4cCA9IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuXG4gICAgICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIHJlZ2V4cCBlbmQnXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IFxuICAgICAgICAgICAgICAgIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgICAgIG5leHQgPSBnZXRDaHVuayArMVxuICAgICAgICAgICAgICAgIGlmIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3B1bmN0Jykgb3IgcHJldi5tYXRjaCBpbiBcIildXCJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgIGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPiAgY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPT0gY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gIFxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6J3JlZ2V4cCdcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdyZWdleHAgc3RhcnQnXG4gICAgICAgICAgICBcbiAgICAgICAgZXNjYXBlKClcbiAgICAgICAgXG4gICAgdHJpcGxlUmVnZXhwID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gJ3JlZ2V4cCB0cmlwbGUnXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSBub3QgaW4gWydpbnRlcnBvbGF0aW9uJywgdHlwZV1cbiAgICAgICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcvLy8nXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgbGluZW5vOmxpbmUubnVtYmVyXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZSAgIFxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgXG4gICAgc2ltcGxlU3RyaW5nID0gLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggaW4gJ1wiXFwnJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLm1hdGNoIFxuICAgICAgICAgICAgICAgIHdoZW4gJ1wiJyB0aGVuICdzdHJpbmcgZG91YmxlJyBcbiAgICAgICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIGVsc2UgaWYgbm90Q29kZVxuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2hTdGFjayBzdHJvbmc6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBlc2NhcGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgdHJpcGxlU3RyaW5nID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgICAgIHJldHVybiBpZiB0b3BUeXBlIGluIFsncmVnZXhwJydzdHJpbmcgc2luZ2xlJydzdHJpbmcgZG91YmxlJ11cbiAgICAgICAgXG4gICAgICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLnR1cmRbLi4yXVxuICAgICAgICAgICAgd2hlbiAnXCJcIlwiJyB0aGVuICdzdHJpbmcgZG91YmxlIHRyaXBsZScgXG4gICAgICAgICAgICB3aGVuIFwiJycnXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG5cbiAgICAgICAgaWYgdHlwZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgdHlwZSAhPSB0b3BUeXBlIGFuZCB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgc3Ryb25nOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuICAgICAgICAgICAgXG4gICAgICAgIGVzY2FwZSgpXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgbWRQdW5jdCA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVua0luZGV4ID09IDAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG5vdCBjaHVuay50dXJkIGFuZCBjaHVuay5tYXRjaCBpbiAnLSonIGFuZCBnZXRDaHVuaygxKT8uc3RhcnQgPiBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgdHlwZSA9IFsnbGkxJydsaTInJ2xpMyddW2NodW5rLnN0YXJ0LzRdXG4gICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZSAwIHR5cGUgKyAnIG1hcmtlcidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcjJ1xuICAgICAgICAgICAgICAgIGlmIG5vdCBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ2gxJ1xuICAgICAgICAgICAgICAgIHN3aXRjaCBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJyMjJyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMidcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAnaDInXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJyMjIycgXG4gICAgICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTonaDMnXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgJ2gzJ1xuICAgICAgICAgICAgICAgICAgICB3aGVuICcjIyMjJyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoNCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgNCAnaDQnXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJyMjIyMjJyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoNSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgNSAnaDUnXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudHVyZD9bLi4xXSA9PSAnKionXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdHlwZSA9ICdib2xkJ1xuICAgICAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWVzIDIgdG9wVHlwZVxuICAgICAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgXG4gICAgICAgICAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiB0eXBlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSAnaXRhbGljJ1xuICAgICAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ2AnXG4gICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkP1suLjJdID09ICdgYGAnXG4gICAgXG4gICAgICAgICAgICAgICAgdHlwZSA9ICdjb2RlIHRyaXBsZSdcbiAgICBcbiAgICAgICAgICAgICAgICBpZiBnZXRtYXRjaCgzKSBpbiBbJ2NvZmZlZXNjcmlwdCcnamF2YXNjcmlwdCcnanMnXVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAzICdjb21tZW50J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgd2Vhazp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSAnY29kZSdcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcblxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBpbnRlcnBvbGF0aW9uID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCBcIlxcI3tcIlxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidpbnRlcnBvbGF0aW9uJywgd2Vhazp0cnVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiB0b3BUeXBlID09ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnfSdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBlbmQnXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGtleXdvcmQgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICAgICAgXG4gICAgICAgIGlmIFN5bnRheC5sYW5nW2V4dF0uaGFzT3duUHJvcGVydHkoY2h1bmsubWF0Y2gpIFxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSBTeW50YXgubGFuZ1tleHRdW2NodW5rLm1hdGNoXVxuICAgICAgICAgICAgcmV0dXJuIDAgIyBnaXZlIGNvZmZlZUZ1bmMgYSBjaGFuY2UsIG51bWJlciBiYWlscyBmb3IgdXNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG51bWJlciA9IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMSBpZiBjaHVuay52YWx1ZSAhPSAndGV4dCdcbiAgICAgICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICAgICAgXG4gICAgICAgIGlmIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC00KSA9PSAnbnVtYmVyIGZsb2F0JyBhbmQgZ2V0VmFsdWUoLTIpID09ICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC00ICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBIRVhOVU0udGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgZmxvYXQgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgRkxPQVQudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgICAgIFxuICAgICMgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgIDAwMCAwMDAgICAwMDAgMCAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIHhtbFB1bmN0ID0gLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkID09ICc8LydcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAna2V5d29yZCdcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCBpbiBbJzwnJz4nXVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ2tleXdvcmQnXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIGNwcE1hY3JvID0gLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIlxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnZGVmaW5lJ1xuICAgICAgICAgICAgc2V0VmFsdWUgMSAnZGVmaW5lJ1xuICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMFxuICAgIFxuICAgIHNoUHVuY3QgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nIGFuZCBnZXRDaHVuaygtMSk/LnN0YXJ0ICsgZ2V0Q2h1bmsoLTEpPy5sZW5ndGggPT0gY2h1bmsuc3RhcnRcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZSAtMSAnZGlyJ1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnLS0nIGFuZCBnZXRDaHVuaygyKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMlxuICAgICAgICAgICAgYWRkVmFsdWUgMCAnYXJndW1lbnQnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxICdhcmd1bWVudCdcbiAgICAgICAgICAgIHNldFZhbHVlIDIgJ2FyZ3VtZW50J1xuICAgICAgICAgICAgcmV0dXJuIDNcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLScgYW5kIGdldENodW5rKDEpPy5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICBhZGRWYWx1ZSAwICdhcmd1bWVudCdcbiAgICAgICAgICAgIHNldFZhbHVlIDEgJ2FyZ3VtZW50J1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBzdGFja2VkID0gLT5cblxuICAgICAgICBpZiBzdGFja1RvcFxuICAgICAgICAgICAgcmV0dXJuIGlmIHN0YWNrVG9wLndlYWtcbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLnN0cm9uZ1xuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlID0gdG9wVHlwZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIHRvcFR5cGVcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgXG4gICAgcHVzaEV4dCA9IChtdGNoKSAtPlxuICAgICAgICBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICAgICAgZXh0U3RhY2sucHVzaCBleHRUb3BcbiAgICAgICAgXG4gICAgYWN0RXh0ID0gLT5cbiAgICAgICAgc3RhY2sgICAgPSBbXVxuICAgICAgICBzdGFja1RvcCA9IG51bGxcbiAgICAgICAgdG9wVHlwZSAgPSAnJ1xuICAgICAgICBub3RDb2RlICA9IGZhbHNlXG4gICAgICAgIFxuICAgIHBvcEV4dCA9IC0+XG4gICAgICAgIHN0YWNrID0gZXh0VG9wLnN0YWNrXG4gICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN0YXJ0LmV4dFxuICAgICAgICBleHRTdGFjay5wb3AoKSAgICAgICAgICAgICAgIFxuICAgICAgICBleHRUb3AgPSBleHRTdGFja1stMV1cbiAgICAgICAgXG4gICAgICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgICAgICBub3RDb2RlID0gc3RhY2tUb3AgYW5kIHRvcFR5cGUgbm90IGluIGNvZGVUeXBlc1xuICAgICAgICBcbiAgICBwdXNoU3RhY2sgPSAobykgLT4gXG4gICAgICAgIHN0YWNrLnB1c2ggbyBcbiAgICAgICAgc3RhY2tUb3AgPSBvXG4gICAgICAgIHRvcFR5cGUgPSBvLnR5cGVcbiAgICAgICAgbm90Q29kZSA9IHRvcFR5cGUgbm90IGluIGNvZGVUeXBlc1xuICAgICAgICBcbiAgICBwb3BTdGFjayA9IC0+IFxuICAgICAgICBzdGFjay5wb3AoKVxuICAgICAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgICAgICB0b3BUeXBlID0gc3RhY2tUb3A/LnR5cGVcbiAgICAgICAgbm90Q29kZSA9IHN0YWNrVG9wIGFuZCB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcbiAgICAgICAgXG4gICAgZ2V0Q2h1bmsgID0gKGQpIC0+IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF1cbiAgICBzZXRWYWx1ZSAgPSAoZCwgdmFsdWUpIC0+IGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS52YWx1ZSA9IHZhbHVlXG4gICAgZ2V0VmFsdWUgID0gKGQpIC0+IGdldENodW5rKGQpPy52YWx1ZSA/ICcnXG4gICAgZ2V0bWF0Y2ggID0gKGQpIC0+IGdldENodW5rKGQpPy5tYXRjaCA/ICcnXG4gICAgYWRkVmFsdWUgID0gKGQsIHZhbHVlKSAtPiBcbiAgICAgICAgaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggXG4gICAgICAgICAgICBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlICs9ICcgJyArIHZhbHVlXG4gICAgICAgIDFcbiAgICAgICAgXG4gICAgYWRkVmFsdWVzID0gKG4sdmFsdWUpIC0+ICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgICAgICBhZGRWYWx1ZSBpLCB2YWx1ZVxuICAgICAgICBuXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBoYW5kbGVycyA9IFxuICAgICAgICBjb2ZmZWU6IFxuICAgICAgICAgICAgICAgIHB1bmN0OlsgYmxvY2tDb21tZW50LCBoYXNoQ29tbWVudCwgdHJpcGxlUmVnZXhwLCBjb2ZmZWVQdW5jdCwgdHJpcGxlU3RyaW5nLCBzaW1wbGVTdHJpbmcsIGludGVycG9sYXRpb24sIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0LCBzdGFja2VkIF1cbiAgICAgICAgICAgICAgICB3b3JkOiBbIGtleXdvcmQsIGNvZmZlZVdvcmQsIGNvbW1lbnRIZWFkZXIsIG51bWJlciwgcHJvcGVydHksIHN0YWNrZWQgXVxuICAgICAgICBub29uOiAgIHB1bmN0Olsgbm9vbkNvbW1lbnQsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGNvbW1lbnRIZWFkZXIsIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICAgICAganM6ICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBzdGFja2VkIF0sIHdvcmQ6WyBjb21tZW50SGVhZGVyLCBrZXl3b3JkLCBqc0Z1bmMsIG51bWJlciwgc3RhY2tlZCBdXG4gICAgICAgIHRzOiAgICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgc3RhY2tlZCBdLCB3b3JkOlsgY29tbWVudEhlYWRlciwga2V5d29yZCwganNGdW5jLCBudW1iZXIsIHN0YWNrZWQgXVxuICAgICAgICBpc3M6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGNvbW1lbnRIZWFkZXIsIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICAgICAgaW5pOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBjb21tZW50SGVhZGVyLCAgICAgICAgICBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgICAgIGNwcDogICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybywgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOlsgY29tbWVudEhlYWRlciwga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgIHN0YWNrZWQgXVxuICAgICAgICBocHA6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGNvbW1lbnRIZWFkZXIsIGtleXdvcmQsIG51bWJlciwgZmxvYXQsICBzdGFja2VkIF1cbiAgICAgICAgYzogICAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBjb21tZW50SGVhZGVyLCBrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgc3RhY2tlZCBdXG4gICAgICAgIGg6ICAgICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybywgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOlsgY29tbWVudEhlYWRlciwga2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgIHN0YWNrZWQgXVxuICAgICAgICBjczogICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGNvbW1lbnRIZWFkZXIsIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICAgICAgcHVnOiAgICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBjb21tZW50SGVhZGVyLCBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgICAgIHN0eWw6ICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOlsgY29tbWVudEhlYWRlciwga2V5d29yZCwgbnVtYmVyLCAgICAgICAgIHN0YWNrZWQgXVxuICAgICAgICBjc3M6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbIGNvbW1lbnRIZWFkZXIsIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICAgICAgc2FzczogICBwdW5jdDpbIHN0YXJDb21tZW50LCAgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyBjb21tZW50SGVhZGVyLCBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgICAgIHNjc3M6ICAgcHVuY3Q6WyBzdGFyQ29tbWVudCwgIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOlsgY29tbWVudEhlYWRlciwga2V5d29yZCwgbnVtYmVyLCAgICAgICAgIHN0YWNrZWQgXVxuICAgICAgICBzdmc6ICAgIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0LCAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbICAgICAgICAgICAgICAgIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICAgICAgaHRtbDogICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyAgICAgICAgICAgICAgICBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgICAgIGh0bTogICAgcHVuY3Q6WyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QsICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOlsgICAgICAgICAgICAgICAga2V5d29yZCwgbnVtYmVyLCAgICAgICAgIHN0YWNrZWQgXVxuICAgICAgICBzaDogICAgIHB1bmN0OlsgaGFzaENvbW1lbnQsICBzaW1wbGVTdHJpbmcsIHNoUHVuY3QsICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbICAgICAgICAgICAgICAgIGtleXdvcmQsIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICAgICAganNvbjogICBwdW5jdDpbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCBkaWN0LCAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyAgICAgICAgICAgICAgICBrZXl3b3JkLCBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgICAgIG1kOiAgICAgcHVuY3Q6WyAgICAgICAgICAgICAgICAgICAgbWRQdW5jdCwgeG1sUHVuY3QsICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOlsgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyLCAgICAgICAgIHN0YWNrZWQgXVxuICAgICAgICBsb2c6ICAgIHB1bmN0OlsgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDpbICAgICAgICAgICAgICAgICAgICAgICAgIG51bWJlciwgICAgICAgICBzdGFja2VkIF1cbiAgICAgICAgdHh0OiAgICBwdW5jdDpbICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6WyAgICAgICAgICAgICAgICAgICAgICAgICBudW1iZXIsICAgICAgICAgc3RhY2tlZCBdXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIGZvciBsaW5lIGluIGxpbmVzXG5cbiAgICAgICAgaWYgc3RhY2tUb3A/LmZpbGxcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgXG4gICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5pbmRlbnQgYW5kIGxpbmUuY2h1bmtzWzBdPy5zdGFydCA8PSBleHRUb3Auc3RhcnQuY2h1bmtzWzBdLnN0YXJ0XG4gICAgICAgICAgICAgICAgcG9wRXh0KCkgICAgICAgICAgICAgICAgICAgICAgICAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgaW5kZW50YXRpb25cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsaW5lLmV4dCA9IGV4dFRvcC5zd2l0Y2gudG8gICAgICMgbWFrZSBzdXJlIHRoZSBjdXJyZW50IGxpbmUgZXh0IG1hdGNoZXMgdGhlIHRvcG1vc3QgZnJvbSBzdGFja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBleHQgIT0gbGluZS5leHQgICAgICAgICAgICAgICAgICAgICAgIyBlaXRoZXIgYXQgc3RhcnQgb2YgZmlsZSBvciB3ZSBzd2l0Y2hlZCBleHRlbnNpb25cbiAgICAgICAgICAgIGFjdEV4dCgpXG4gICAgICAgICAgICBoYW5kbCA9IGhhbmRsZXJzW2V4dCA9IGxpbmUuZXh0XSAgICAjIGluc3RhbGwgbmV3IGhhbmRsZXJzXG4gICAgICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmsgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4XVxuICAgICAgICAgICAgYmVmb3JlSW5kZXggPSBjaHVua0luZGV4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnZhbHVlID09ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5lbmQ/IGFuZCBleHRUb3Auc3dpdGNoLmVuZCA9PSBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgY2h1bmsudHVyZC5sZW5ndGgsIGV4dFRvcC5zd2l0Y2guYWRkIGlmIGV4dFRvcC5zd2l0Y2guYWRkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BFeHQoKSAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC5wdW5jdCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlICMgd29yZHMsIG51bWJlcnNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBub3Qgbm90Q29kZVxuICAgICAgICAgICAgICAgICAgICBpZiBtdGNoID0gU3ludGF4LnN3dGNoW2xpbmUuZXh0XT9bY2h1bmsubWF0Y2hdIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHVyZENodW5rID0gZ2V0Q2h1bmsgLW10Y2gudHVyZC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoLnR1cmQgPT0gKHR1cmRDaHVuaz8udHVyZCA/IHR1cmRDaHVuaz8ubWF0Y2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcHVzaCBhIG5ldyBleHRlbnNpb24gb250byB0aGUgc3RhY2ssIGV4dCB3aWxsIGNoYW5nZSBvbiBzdGFydCBvZiBuZXh0IGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaEV4dCBtdGNoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC53b3JkID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gYmVmb3JlSW5kZXhcbiAgICAgICAgICAgICAgICBjaHVua0luZGV4KytcbiAgICBsaW5lc1xuICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5ibG9ja3MgPSAobGluZXMsIGV4dD0nY29mZmVlJykgLT5cbiAgICBcbiAgICDilrhkb2MgJ2Jsb2NrcyAqbGluZXMqLCAqZXh0KidcblxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2Ygc3RyaW5nc1xuICAgICAgICBcbiAgICAgICAgKmV4dCo6XG4gICAgICAgIC0ga29mZmVlIGNvZmZlZSBqcyB0cyBcbiAgICAgICAgLSBzdHlsIGNzcyBzYXNzIHNjc3MgXG4gICAgICAgIC0gcHVnIGh0bWwgaHRtIHN2ZyBcbiAgICAgICAgLSBjcHAgaHBwIGN4eCBjIGggXG4gICAgICAgIC0gYmFzaCBmaXNoIHNoIFxuICAgICAgICAtIG5vb24ganNvblxuICAgICAgICAtIG1kIHBsaXN0IFxuICAgICAgICAtIGlzcyBpbmlcbiAgICAgICAgLSB0eHQgbG9nIFxuXG4gICAgICAgICoqcmV0dXJucyoqIHRoZSByZXN1bHQgb2ZcbiAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgIGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG4gICAgICAgIGBgYFxuICAgIGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG4gICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIFxuICAgIGJsb2NrczogIGJsb2Nrc1xuICAgIHJhbmdlczogIChsaW5lLCBleHQpICAtPiBibG9ja3MoW2xpbmVdLCBleHQpWzBdLmNodW5rc1xuICAgIGRpc3NlY3Q6IChsaW5lcywgZXh0KSAtPiBibG9ja3MobGluZXMsIGV4dCkubWFwIChsKSAtPiBsLmNodW5rc1xuICAgIFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxu4pa4dGVzdCAncHJvZmlsZSdcbiAgICBcbiAgICDilrhwcm9maWxlICctLS0tLSdcbiAgICAgICAgXG4gICAgICAgIHRleHQwID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL2NvZmZlZS9ub2Rlcy5jb2ZmZWVcIiAjIDYtMTFtc1xuICAgICAgICB0ZXh0MSA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9L3Rlc3QuY29mZmVlXCIgIyA1MC0xMjDOvHNcbiAgICBcbiAgICAgICAgbGluZXMwID0gdGV4dDAuc3BsaXQgJ1xcbidcbiAgICAgICAgbGluZXMxID0gdGV4dDEuc3BsaXQgJ1xcbidcblxuICAgIGZvciBpIGluIFswLi41XVxuICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgZm9yIGkgaW4gWzAuLjE1XVxuICAgICAgICBcbiAgICAgICAg4pa4cHJvZmlsZSAnbGluZXMwJ1xuICAgICAgICAgICAgYmxvY2tzIGxpbmVzMFxuICAgICAgICAjIOKWuHByb2ZpbGUgJ3N5bnRheDAnXG4gICAgICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2NvZmZlZSdcbiAgICAgICAgICAgIFxuICAgICAgICAjIOKWuHByb2ZpbGUgJ2xpbmVzMSdcbiAgICAgICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICAgICAjIOKWuHByb2ZpbGUgJ3N5bnRheDEnXG4gICAgICAgICAgICAjIGxpbmVzMS5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2NvZmZlZSdcbiAgICAgICAgICAgIFxuIyMjXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgICAgICAgICAgIDAwMCAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuIyMjXG5cbuKWuHRlc3QgJ3Rlc3QnXG5cbiAgICByZXF1aXJlKCdreGsnKS5jaGFpKCkgICAgXG5cbiAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgeCAgXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgeVxuICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgICJdfQ==
//# sourceURL=../coffee/blocks.coffee