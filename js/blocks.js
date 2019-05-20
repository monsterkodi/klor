// koffee 0.43.0

/*
0000000    000       0000000    0000000  000   000   0000000    
000   000  000      000   000  000       000  000   000         
0000000    000      000   000  000       0000000    0000000     
000   000  000      000   000  000       000  000        000    
0000000    0000000   0000000    0000000  000   000  0000000
 */
var FLOAT, HEADER, HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, blocked, blocks, chunked, dissect, klog, kstr, noon, ranged, ref, slash,
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
            end: '```'
        },
        javascript: {
            turd: '```',
            to: 'js',
            end: '```'
        }
    }
};

SPACE = /\s/;

HEADER = /^0+$/;

PUNCT = /\W+/gi;

NUMBER = /^\d+$/;

FLOAT = /^\d+f$/;

HEXNUM = /^0x[a-fA-F\d]+$/;

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
        chunks = text.split(SPACE);
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
    var addValue, advance, beforeIndex, blockComment, chunk, chunkIndex, coffeeFunc, commentHeader, cppMacro, dashArrow, dict, ext, extStack, extTop, float, getChunk, getValue, getmatch, handl, handlers, hashComment, hnd, interpolation, j, jsFunc, k, keyword, len, len1, len2, line, mdString, mtch, n, noonComment, notCode, number, popExt, popStack, property, pushStack, ref1, ref2, ref3, ref4, ref5, ref6, ref7, regexp, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, topType, tripleString, turdChunk, xmlPunct;
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
    hashComment = function() {
        var c, j, len, ref1;
        if (stackTop) {
            return;
        }
        if (chunk.match === "#") {
            chunk.value += ' comment';
            if (chunkIndex < line.chunks.length - 1) {
                ref1 = line.chunks.slice(chunkIndex + 1);
                for (j = 0, len = ref1.length; j < len; j++) {
                    c = ref1[j];
                    c.value = 'comment';
                    if (HEADER.test(c.match)) {
                        c.value += ' header';
                    }
                }
            }
            return line.chunks.length - chunkIndex + 1;
        }
    };
    noonComment = function() {
        var c, j, len, ref1;
        if (stackTop) {
            return;
        }
        if (chunk.match === "#" && chunkIndex === 0) {
            chunk.value += ' comment';
            if (chunkIndex < line.chunks.length - 1) {
                ref1 = line.chunks.slice(chunkIndex + 1);
                for (j = 0, len = ref1.length; j < len; j++) {
                    c = ref1[j];
                    c.value = 'comment';
                }
            }
            return line.chunks.length - chunkIndex + 1;
        }
    };
    slashComment = function() {};
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
            addValue(0, type);
            addValue(1, type);
            addValue(2, type);
            return 3;
        }
    };
    dashArrow = function() {
        if (chunk.turd === '->') {
            addValue(0, 'function tail');
            addValue(1, 'function head');
            if (line.chunks[0].value === 'dictionary key' || line.chunks[0].turd === '@:') {
                line.chunks[0].value = 'method';
                line.chunks[1].value = 'punct method';
            }
            return 2;
        }
        if (chunk.turd === '=>') {
            addValue(0, 'function bound tail');
            addValue(1, 'function bound head');
            if (line.chunks[0].value === 'dictionary key') {
                line.chunks[0].value = 'method';
                line.chunks[1].value = 'punct method';
            }
            return 2;
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
    coffeeFunc = function() {
        var prev, ref1;
        if (notCode) {
            return;
        }
        if (chunk.match === '▸') {
            addValue(0, 'meta');
            return 1;
        }
        if (chunk.turd === '~>') {
            addValue(0, 'meta');
            addValue(1, 'meta');
            return 2;
        }
        if (prev = getChunk(-1)) {
            if ((ref1 = prev.match) === 'class' || ref1 === 'extends') {
                setValue(0, 'class');
                return 1;
            }
            if (prev.value === 'punct meta') {
                if (chunk.start === prev.start + 1) {
                    setValue(0, 'meta');
                    return 0;
                }
            }
            if (chunk.value.startsWith('keyword')) {
                return 1;
            }
            if (prev.value === 'text') {
                if (chunk.match === '=') {
                    setValue(-1, 'function');
                } else if (prev.start + prev.length < chunk.start) {
                    setValue(-1, 'function call');
                }
            }
        }
        return 0;
    };
    property = function() {
        var prevPrev, ref1;
        if (notCode) {
            return;
        }
        if (getmatch(-1) === '.') {
            addValue(-1, 'property');
            setValue(0, 'property');
            if (prevPrev = getChunk(-2)) {
                if ((ref1 = prevPrev.value) !== 'property' && ref1 !== 'number') {
                    setValue(-2, 'obj');
                }
            }
            return 1;
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
    regexp = function() {
        var next, prev;
        if (topType != null ? topType.startsWith('string') : void 0) {
            return;
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
                if (!prev.value.startsWith('punct')) {
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
            chunk.value += ' regexp start';
            return 1;
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
        if (ref2 = chunk.match, indexOf.call('"\'`', ref2) >= 0) {
            type = (function() {
                switch (chunk.match) {
                    case '"':
                        return 'string double';
                    case "'":
                        return 'string single';
                    case '`':
                        return 'string backtick';
                }
            })();
            if (topType === type) {
                chunk.value += ' ' + type;
                popStack();
                return 1;
            } else if (notCode) {
                return stacked();
            }
            pushStack({
                type: type,
                strong: true
            });
            chunk.value += ' ' + type;
            return 1;
        }
        if (chunk.match === '\\' && (topType != null ? topType.startsWith('string') : void 0)) {
            if (chunkIndex === 0 || !getChunk(-1).escape) {
                if (getChunk(1).start === chunk.start + 1) {
                    chunk.escape = true;
                    return stacked();
                }
            }
        }
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
                    type: type,
                    strong: true
                });
            }
            addValue(0, type);
            addValue(1, type);
            addValue(2, type);
            return 3;
        }
        if (chunk.match === '\\' && (topType != null ? topType.startsWith('string') : void 0)) {
            if (chunkIndex === 0 || !line.chunks[chunkIndex - 1].escape) {
                if (getChunk(1).start === chunk.start + 1) {
                    chunk.escape = true;
                    return stacked();
                }
            }
        }
    };
    mdString = function() {
        var ref1, type;
        if (chunk.turd === '**') {
            type = 'bold';
            if (topType != null ? topType.endsWith(type) : void 0) {
                addValue(0, topType);
                addValue(1, topType);
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
            addValue(0, type);
            addValue(1, type);
            return 2;
        }
        if (chunk.match === '*') {
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
            if (((ref1 = chunk.turd) != null ? ref1.slice(0, 3) : void 0) === '```') {
                type = 'string backtick triple';
                if (topType === type) {
                    popStack();
                } else {
                    pushStack({
                        type: type,
                        weak: true
                    });
                }
                addValue(0, type);
                addValue(1, type);
                addValue(2, type);
                return 3;
            }
            type = 'backtick';
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
    };
    interpolation = function() {
        var ref1;
        if (topType === 'string double') {
            if ((ref1 = chunk.turd) != null ? ref1.startsWith("\#{") : void 0) {
                pushStack({
                    type: 'interpolation',
                    weak: true
                });
                addValue(0, 'string interpolation start');
                addValue(1, 'string interpolation start');
                return 2;
            }
        } else if (topType === 'interpolation') {
            if (chunk.match === '}') {
                addValue(0, 'match interpolation end');
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
            addValue(0, 'keyword');
            addValue(1, 'keyword');
            return 2;
        }
        if ((ref1 = chunk.match) === '<' || ref1 === '>') {
            addValue(0, 'keyword');
            return 1;
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
            addValue(-1, 'dir');
            return 1;
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
    popExt = function() {
        stack = extTop.stack;
        line.ext = extTop.start.ext;
        extStack.pop();
        return extTop = extStack.slice(-1)[0];
    };
    pushStack = function(o) {
        stack.push(o);
        stackTop = o;
        topType = o.type;
        return notCode = topType !== 'interpolation';
    };
    popStack = function() {
        stack.pop();
        stackTop = stack.slice(-1)[0];
        topType = stackTop != null ? stackTop.type : void 0;
        return notCode = stackTop && topType !== 'interpolation';
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
    addValue = function(d, value) {
        var ref1;
        if ((0 <= (ref1 = chunkIndex + d) && ref1 < line.chunks.length)) {
            return line.chunks[chunkIndex + d].value += ' ' + value;
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
    handlers = {
        coffee: {
            punct: [blockComment, hashComment, coffeeFunc, tripleString, simpleString, interpolation, dashArrow, regexp, dict, stacked],
            word: [keyword, coffeeFunc, commentHeader, number, property, stacked]
        },
        noon: {
            punct: [noonComment, stacked],
            word: [keyword, number, stacked]
        },
        json: {
            punct: [simpleString, dict, stacked],
            word: [keyword, number, stacked]
        },
        js: {
            punct: [slashComment, simpleString, dashArrow, regexp, stacked],
            word: [keyword, jsFunc, number, stacked]
        },
        ts: {
            punct: [slashComment, simpleString, dashArrow, regexp, stacked],
            word: [keyword, jsFunc, number, stacked]
        },
        md: {
            punct: [mdString, xmlPunct, stacked],
            word: [number, stacked]
        },
        iss: {
            punct: [slashComment, simpleString, stacked],
            word: [keyword, number, stacked]
        },
        ini: {
            punct: [slashComment, simpleString, cppMacro, stacked],
            word: [number, stacked]
        },
        cpp: {
            punct: [slashComment, simpleString, cppMacro, stacked],
            word: [keyword, number, float, stacked]
        },
        hpp: {
            punct: [slashComment, simpleString, cppMacro, stacked],
            word: [keyword, number, float, stacked]
        },
        c: {
            punct: [slashComment, simpleString, cppMacro, stacked],
            word: [keyword, number, float, stacked]
        },
        h: {
            punct: [slashComment, simpleString, cppMacro, stacked],
            word: [keyword, number, float, stacked]
        },
        sh: {
            punct: [hashComment, simpleString, shPunct, stacked],
            word: [keyword, number, stacked]
        },
        cs: {
            punct: [slashComment, simpleString, stacked],
            word: [keyword, number, stacked]
        },
        pug: {
            punct: [slashComment, simpleString, stacked],
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
        styl: {
            punct: [slashComment, simpleString, stacked],
            word: [keyword, number, stacked]
        },
        css: {
            punct: [slashComment, simpleString, stacked],
            word: [keyword, number, stacked]
        },
        sass: {
            punct: [slashComment, simpleString, stacked],
            word: [keyword, number, stacked]
        },
        scss: {
            punct: [slashComment, simpleString, stacked],
            word: [keyword, number, stacked]
        },
        log: {
            punct: [slashComment, simpleString, stacked],
            word: [number, stacked]
        },
        txt: {
            punct: [slashComment, simpleString, stacked],
            word: [number, stacked]
        }
    };
    for (j = 0, len = lines.length; j < len; j++) {
        line = lines[j];
        if (extTop) {
            if (extTop["switch"].indent && ((ref1 = line.chunks[0]) != null ? ref1.start : void 0) <= extTop.start.chunks[0].start) {
                popExt();
            } else {
                line.ext = extTop["switch"].to;
            }
        }
        if (ext !== line.ext) {
            handl = handlers[ext = line.ext];
        }
        chunkIndex = 0;
        while (chunkIndex < line.chunks.length) {
            chunk = line.chunks[chunkIndex];
            beforeIndex = chunkIndex;
            if (chunk.value === 'punct') {
                if (extTop) {
                    if ((extTop["switch"].end != null) && extTop["switch"].end === chunk.turd) {
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
                if (mtch = (ref4 = Syntax.swtch[line.ext]) != null ? ref4[chunk.match] : void 0) {
                    if (mtch.turd) {
                        turdChunk = getChunk(-mtch.turd.length);
                        if (mtch.turd === ((ref5 = turdChunk != null ? turdChunk.turd : void 0) != null ? ref5 : turdChunk != null ? turdChunk.match : void 0)) {
                            extStack.push(extTop = {
                                "switch": mtch,
                                start: line,
                                stack: stack
                            });
                        }
                    }
                }
                ref7 = (ref6 = handl.word) != null ? ref6 : [];
                for (n = 0, len2 = ref7.length; n < len2; n++) {
                    hnd = ref7[n];
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

ranged = function(lines) {
    var chunk, j, k, len, len1, line, range, ref1, rngs;
''
    rngs = [];
    for (j = 0, len = lines.length; j < len; j++) {
        line = lines[j];
        ref1 = line.chunks;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
            chunk = ref1[k];
            range = {
                start: chunk.start,
                match: chunk.match,
                value: chunk.value
            };
            rngs.push(range);
        }
    }
    return rngs;
};

dissect = function(lines) {
    var chunk, d, diss, j, k, len, len1, line, range, ref1;
    diss = [];
    for (j = 0, len = lines.length; j < len; j++) {
        line = lines[j];
        d = [];
        ref1 = line.chunks;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
            chunk = ref1[k];
            range = {
                start: chunk.start,
                match: chunk.match,
                value: chunk.value
            };
            d.push(range);
        }
        diss.push(d);
    }
    return diss;
};

module.exports = {
    blocks: blocks,
    ranges: function(line, ext) {
        return ranged(blocks([line], ext));
    },
    dissect: function(lines, ext) {
        return dissect(blocks(lines, ext));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwrSEFBQTtJQUFBOztBQVFBLE1BQWlDLE9BQUEsQ0FBUSxLQUFSLENBQWpDLEVBQUUsaUJBQUYsRUFBUyxlQUFULEVBQWUsZUFBZixFQUFxQixlQUFyQixFQUEyQjs7QUFFM0IsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULE1BQU0sQ0FBQyxJQUFQLENBQUE7O0FBRUEsTUFBTSxDQUFDLEtBQVAsR0FDSTtJQUFBLE1BQUEsRUFDSTtRQUFBLEdBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxHQUFMO1lBQVcsRUFBQSxFQUFHLElBQWQ7WUFBb0IsTUFBQSxFQUFRLENBQTVCO1NBQWQ7S0FESjtJQUVBLEVBQUEsRUFDSTtRQUFBLFlBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLFFBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1NBQWQ7UUFDQSxVQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxJQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtTQURkO0tBSEo7OztBQU1KLEtBQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQVFULE9BQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxHQUFSO0FBRVAsUUFBQTtBQUFBO0lBa0JDLE1BQUEsR0FBUztXQUNULEtBQUssQ0FBQyxHQUFOLENBQVUsU0FBQyxJQUFEO0FBRU4sWUFBQTtRQUFBLElBQUEsR0FDSTtZQUFBLE1BQUEsRUFBUSxFQUFSO1lBQ0EsS0FBQSxFQUFRLENBRFI7WUFFQSxLQUFBLEVBQVEsTUFBQSxFQUZSO1lBR0EsTUFBQSxFQUFRLE1BSFI7WUFJQSxHQUFBLEVBQVEsR0FK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RCxFQUFRLEdBQVI7ZUFBZ0IsT0FBQSxDQUFRLE1BQUEsQ0FBTyxLQUFQLEVBQWMsR0FBZCxDQUFSO0lBQWhCLENBRlQ7Ozs7OztBQXFDSiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIFxuIyMjXG5cbnsgc2xhc2gsIGtzdHIsIGtsb2csIG5vb24sIF8gfSA9IHJlcXVpcmUgJ2t4aydcbiAgICAgICAgXG5TeW50YXggPSByZXF1aXJlICcuL3N5bnRheCdcblN5bnRheC5pbml0KClcblxuU3ludGF4LnN3dGNoID0gXG4gICAgY29mZmVlOiBcbiAgICAgICAgZG9jOiAgICAgICAgICB0dXJkOifilrgnICAgdG86J21kJyAgaW5kZW50OiAxXG4gICAgbWQ6ICAgICBcbiAgICAgICAgY29mZmVlc2NyaXB0OiB0dXJkOidgYGAnIHRvOidjb2ZmZWUnIGVuZDonYGBgJ1xuICAgICAgICBqYXZhc2NyaXB0OiAgIHR1cmQ6J2BgYCcgdG86J2pzJyAgICAgZW5kOidgYGAnXG4gICAgICAgICAgICBcblNQQUNFICA9IC9cXHMvXG5IRUFERVIgPSAvXjArJC9cblBVTkNUICA9IC9cXFcrL2dpXG5OVU1CRVIgPSAvXlxcZCskL1xuRkxPQVQgID0gL15cXGQrZiQvXG5IRVhOVU0gPSAvXjB4W2EtZkEtRlxcZF0rJC9cblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbmNodW5rZWQgPSAobGluZXMsIGV4dCkgLT4gICAgXG5cbiAgICDilrhkb2MgJ2NodW5rZWQgKmxpbmVzKiwgKmV4dConXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDogc1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICBzXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogblxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIGV4dDogICAgc1xuICAgICAgICAgICAgY2hhcnM6ICBuXG4gICAgICAgICAgICBpbmRleDogIG5cbiAgICAgICAgICAgIG51bWJlcjogbisxXG4gICAgICAgIFxuICAgIGxpbmVubyA9IDBcbiAgICBsaW5lcy5tYXAgKHRleHQpIC0+IFxuICAgICAgICBcbiAgICAgICAgbGluZSA9IFxuICAgICAgICAgICAgY2h1bmtzOiBbXVxuICAgICAgICAgICAgY2hhcnM6ICAwXG4gICAgICAgICAgICBpbmRleDogIGxpbmVubysrXG4gICAgICAgICAgICBudW1iZXI6IGxpbmVub1xuICAgICAgICAgICAgZXh0OiAgICBleHRcblxuICAgICAgICBjaHVua3MgPSB0ZXh0LnNwbGl0IFNQQUNFXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVua3MubGVuZ3RoID09IDEgYW5kIGNodW5rc1swXSA9PSAnJ1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUgIyBlbXB0eSBsaW5lXG4gICAgICAgICAgICBcbiAgICAgICAgYyA9IDBcbiAgICAgICAgZm9yIHMgaW4gY2h1bmtzXG4gICAgICAgICAgICBpZiBzID09ICcnXG4gICAgICAgICAgICAgICAgYysrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gYysrXG4gICAgICAgICAgICAgICAgbCA9IHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgc2MgPSBjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBzZXBlcmF0ZSBieSBwdW5jdHVhdGlvblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSBQVU5DVC5leGVjIHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIG0uaW5kZXggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB3bCA9IG0uaW5kZXgtKGMtc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICB3ID0gc1tjLXNjLi4ubS5pbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOndsLCBtYXRjaDp3LCB2YWx1ZTondGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gd2xcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0dXJkID0gcHVuY3QgPSBtWzBdXG4gICAgICAgICAgICAgICAgICAgIGZvciBwYyBpbiBwdW5jdFsuLi4tMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YysrLCBsZW5ndGg6MSwgbWF0Y2g6cGMsIHR1cmQ6dHVyZCwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHR1cmRbMS4uXVxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMrKywgbGVuZ3RoOjEsIG1hdGNoOnB1bmN0Wy0xXSwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXIgXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOnJsLCBtYXRjaDp3LCB2YWx1ZTondGV4dCdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoXG4gICAgICAgICAgICBsYXN0ID0gbGluZS5jaHVua3NbLTFdXG4gICAgICAgICAgICBsaW5lLmNoYXJzID0gbGFzdC5zdGFydCArIGxhc3QubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgbGluZVxuICAgICAgICBcbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbmJsb2NrZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdibG9ja2VkICpsaW5lcyonXG4gICAgICAgIFxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogbGluZXMgd2l0aCBcbiAgICAgICAgLSAnZXh0JyBzd2l0Y2hlZCBpbiBzb21lIGxpbmVzXG4gICAgICAgIC0gJ3ZhbHVlJyBjaGFuZ2VkIGluIGNodW5rcyB0aGF0IG1hdGNoIGxhbmd1YWdlIHBhdHRlcm5zXG4gICAgICAgICAgXG4gICAgZXh0U3RhY2sgICA9IFtdXG4gICAgc3RhY2sgICAgICA9IFtdXG4gICAgaGFuZGwgICAgICA9IFtdXG4gICAgZXh0VG9wICAgICA9IG51bGxcbiAgICBzdGFja1RvcCAgID0gbnVsbFxuICAgIG5vdENvZGUgICAgPSBmYWxzZSAjIHNob3J0Y3V0IGZvciB0b3Agb2Ygc3RhY2sgIT0gaW50ZXJwb2xhdGlvblxuICAgIHRvcFR5cGUgICAgPSAnJ1xuICAgIGV4dCAgICAgICAgPSAnJ1xuICAgIGxpbmUgICAgICAgPSBudWxsXG4gICAgY2h1bmsgICAgICA9IG51bGxcbiAgICBjaHVua0luZGV4ID0gMFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaGFzaENvbW1lbnQgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBzdGFja1RvcFxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgY29tbWVudCdcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGgtMVxuICAgICAgICAgICAgICAgIGZvciBjIGluIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMS4uXVxuICAgICAgICAgICAgICAgICAgICBjLnZhbHVlID0gJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgICAgIGlmIEhFQURFUi50ZXN0IGMubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGMudmFsdWUgKz0gJyBoZWFkZXInXG4gICAgICAgICAgICByZXR1cm4gbGluZS5jaHVua3MubGVuZ3RoIC0gY2h1bmtJbmRleCArIDFcblxuICAgIG5vb25Db21tZW50ID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgc3RhY2tUb3BcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiIGFuZCBjaHVua0luZGV4ID09IDAgIyB0aGUgb25seSBkaWZmZXJlbmNlLiBtZXJnZSB3aXRoIGhhc2hDb21tZW50P1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyBjb21tZW50J1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgZm9yIGMgaW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCsxLi5dXG4gICAgICAgICAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgIHJldHVybiBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgMVxuICAgICAgICBcbiAgICBzbGFzaENvbW1lbnQgPSAtPlxuICAgIFxuICAgIGJsb2NrQ29tbWVudCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgICAgICBcbiAgICAgICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZScgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgdG9wVHlwZSBhbmQgdG9wVHlwZSBub3QgaW4gWydpbnRlcnBvbGF0aW9uJywgdHlwZV1cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmRbLi4yXSA9PSAnIyMjJ1xuICAgICAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAyLCB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMyAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuICAgIFxuICAgIGRhc2hBcnJvdyA9IC0+XG5cbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnLT4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsICdmdW5jdGlvbiBoZWFkJ1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5JyBvciBsaW5lLmNodW5rc1swXS50dXJkID09ICdAOidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnPT4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsICdmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICBcbiAgICBjb21tZW50SGVhZGVyID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgaWYgSEVBREVSLnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY29mZmVlRnVuYyA9IC0+ICAgICAgICBcblxuICAgICAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAn4pa4JyAgXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnbWV0YSdcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnfj4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnbWV0YSdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsICdtZXRhJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgXG4gICAgICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBcbiAgICAgICAgICAgIGlmIHByZXYubWF0Y2ggaW4gWydjbGFzcycsICdleHRlbmRzJ11cbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAwLCAnY2xhc3MnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcHJldi52YWx1ZSA9PSAncHVuY3QgbWV0YSdcbiAgICAgICAgICAgICAgICBpZiBjaHVuay5zdGFydCA9PSBwcmV2LnN0YXJ0KzFcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgMCwgJ21ldGEnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwICMgZ2l2ZSBzd2l0Y2ggYSBjaGFuY2VcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIDEgaWYgY2h1bmsudmFsdWUuc3RhcnRzV2l0aCAna2V5d29yZCcgIyB3ZSBhcmUgZG9uZSB3aXRoIHRoZSBrZXl3b3JkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUgPT0gJ3RleHQnXG4gICAgICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJz0nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdmdW5jdGlvbiBjYWxsJyBcbiAgICAgICAgMCAjIHdlIG5lZWQgdGhpcyBoZXJlXG4gICAgXG4gICAgcHJvcGVydHkgPSAtPlxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgICAgIFxuICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSwgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgc2V0VmFsdWUgMCwgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgaWYgcHJldlByZXYgPSBnZXRDaHVuayAtMlxuICAgICAgICAgICAgICAgIGlmIHByZXZQcmV2LnZhbHVlIG5vdCBpbiBbJ3Byb3BlcnR5JywgJ251bWJlciddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnb2JqJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAganNGdW5jID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnZhbHVlID09ICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICc9JyBhbmQgZ2V0VmFsdWUoLTIpLnN0YXJ0c1dpdGggJ3RleHQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdmdW5jdGlvbidcbiAgICAgICAgMCAjIHdlIG5lZWQgdGhpcyBoZXJlXG4gICAgICAgIFxuICAgIGRpY3QgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICc6JyBhbmQgbm90IGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggJzo6J1xuICAgICAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICAgICAgaWYgcHJldi52YWx1ZS5zcGxpdCgnICcpWzBdIGluIFsnc3RyaW5nJywgJ251bWJlcicsICd0ZXh0JywgJ2tleXdvcmQnXVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIHJlZ2V4cCA9IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyByZWdleHAgZW5kJ1xuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCBcbiAgICAgICAgICAgICAgICBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgKzFcbiAgICAgICAgICAgICAgICBpZiBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgIGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPiAgY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPT0gY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gIFxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6J3JlZ2V4cCdcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgcmVnZXhwIHN0YXJ0J1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzaW1wbGVTdHJpbmcgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCBpbiAnXCJcXCdgJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLm1hdGNoIFxuICAgICAgICAgICAgICAgIHdoZW4gJ1wiJyB0aGVuICdzdHJpbmcgZG91YmxlJyBcbiAgICAgICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICAgICAgd2hlbiAnYCcgdGhlbiAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgZWxzZSBpZiBub3RDb2RlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWVcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ1xcXFwnIGFuZCB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4ID09IDAgb3Igbm90IGdldENodW5rKC0xKS5lc2NhcGVcbiAgICAgICAgICAgICAgICBpZiBnZXRDaHVuaygxKS5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgICAgIGNodW5rLmVzY2FwZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgdHJpcGxlU3RyaW5nID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgICAgIHJldHVybiBpZiB0b3BUeXBlIGluIFsncmVnZXhwJywgJ3N0cmluZyBzaW5nbGUnLCAnc3RyaW5nIGRvdWJsZSddXG4gICAgICAgIFxuICAgICAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdHlwZSA9IHN3aXRjaCBjaHVuay50dXJkWy4uMl1cbiAgICAgICAgICAgIHdoZW4gJ1wiXCJcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSB0cmlwbGUnIFxuICAgICAgICAgICAgd2hlbiBcIicnJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuICAgICAgICAgICAgIyB3aGVuICdgYGAnIHRoZW4gJ3N0cmluZyBiYWNrdGljayB0cmlwbGUnXG5cbiAgICAgICAgaWYgdHlwZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gaWYgdHlwZSAhPSB0b3BUeXBlIGFuZCB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMSwgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMiwgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDNcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnXFxcXCcgYW5kIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZydcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gMCBvciBub3QgbGluZS5jaHVua3NbY2h1bmtJbmRleC0xXS5lc2NhcGVcbiAgICAgICAgICAgICAgICBpZiBnZXRDaHVuaygxKS5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgICAgIGNodW5rLmVzY2FwZSA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBtZFN0cmluZyA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkID09ICcqKidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdib2xkJ1xuICAgICAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAxLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlLCB0eXBlOnR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJyonXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSAnaXRhbGljJ1xuICAgICAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUsIHR5cGU6dHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ2AnXG4gICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkP1suLjJdID09ICdgYGAnXG4gICAgXG4gICAgICAgICAgICAgICAgdHlwZSA9ICdzdHJpbmcgYmFja3RpY2sgdHJpcGxlJ1xuICAgIFxuICAgICAgICAgICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCB3ZWFrOnRydWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDEsIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAyLCB0eXBlXG4gICAgICAgICAgICAgICAgcmV0dXJuIDNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdiYWNrdGljaydcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSwgdHlwZTp0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4gICAgXG4gICAgaW50ZXJwb2xhdGlvbiA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09ICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggXCJcXCN7XCJcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTonaW50ZXJwb2xhdGlvbicsIHdlYWs6dHJ1ZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAxLCAnc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiB0b3BUeXBlID09ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnfSdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCAnbWF0Y2ggaW50ZXJwb2xhdGlvbiBlbmQnXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGtleXdvcmQgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICAgICAgXG4gICAgICAgIGlmIFN5bnRheC5sYW5nW2V4dF0uaGFzT3duUHJvcGVydHkoY2h1bmsubWF0Y2gpIFxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSBTeW50YXgubGFuZ1tleHRdW2NodW5rLm1hdGNoXVxuICAgICAgICAgICAgcmV0dXJuIDAgIyBnaXZlIGNvZmZlZUZ1bmMgYSBjaGFuY2UsIG51bWJlciBiYWlscyBmb3IgdXNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG51bWJlciA9IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMSBpZiBjaHVuay52YWx1ZSAhPSAndGV4dCdcbiAgICAgICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICAgICAgXG4gICAgICAgIGlmIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC00KSA9PSAnbnVtYmVyIGZsb2F0JyBhbmQgZ2V0VmFsdWUoLTIpID09ICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC00LCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXInXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEhFWE5VTS50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBoZXgnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBmbG9hdCA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBGTE9BVC50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgeG1sUHVuY3QgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJzwvJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2tleXdvcmQnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAna2V5d29yZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggaW4gWyc8Jyc+J11cbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdrZXl3b3JkJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgY3BwTWFjcm8gPSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnZGVmaW5lJ1xuICAgICAgICAgICAgc2V0VmFsdWUgMSwgJ2RlZmluZSdcbiAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICBcbiAgICBzaFB1bmN0ID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcvJyBhbmQgZ2V0Q2h1bmsoLTEpPy5zdGFydCArIGdldENodW5rKC0xKT8ubGVuZ3RoID09IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSwgJ2RpcidcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkID09ICctLScgYW5kIGdldENodW5rKDIpPy5zdGFydCA9PSBjaHVuay5zdGFydCsyXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnYXJndW1lbnQnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnYXJndW1lbnQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAyLCAnYXJndW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gM1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICctJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdhcmd1bWVudCdcbiAgICAgICAgICAgIHNldFZhbHVlIDEsICdhcmd1bWVudCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgc3RhY2tlZCA9IC0+XG5cbiAgICAgICAgaWYgc3RhY2tUb3BcbiAgICAgICAgICAgIHJldHVybiBpZiBzdGFja1RvcC53ZWFrXG4gICAgICAgICAgICBpZiBzdGFja1RvcC5zdHJvbmdcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSA9IHRvcFR5cGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0b3BUeXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgIFxuICAgIHBvcEV4dCA9IC0+XG4gICAgICAgIHN0YWNrID0gZXh0VG9wLnN0YWNrXG4gICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN0YXJ0LmV4dFxuICAgICAgICBleHRTdGFjay5wb3AoKSAgICAgICAgICAgICAgIFxuICAgICAgICBleHRUb3AgPSBleHRTdGFja1stMV1cbiAgICBcbiAgICBwdXNoU3RhY2sgPSAobykgLT4gXG4gICAgICAgIHN0YWNrLnB1c2ggbyBcbiAgICAgICAgc3RhY2tUb3AgPSBvXG4gICAgICAgIHRvcFR5cGUgPSBvLnR5cGVcbiAgICAgICAgbm90Q29kZSA9IHRvcFR5cGUgIT0gJ2ludGVycG9sYXRpb24nXG4gICAgICAgIFxuICAgIHBvcFN0YWNrID0gLT4gXG4gICAgICAgIHN0YWNrLnBvcCgpXG4gICAgICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgICAgICBub3RDb2RlID0gc3RhY2tUb3AgYW5kIHRvcFR5cGUgIT0gJ2ludGVycG9sYXRpb24nXG4gICAgICAgIFxuICAgIGdldENodW5rICA9IChkKSAtPiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdXG4gICAgc2V0VmFsdWUgID0gKGQsIHZhbHVlKSAtPiBpZiAwIDw9IGNodW5rSW5kZXgrZCA8IGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF0udmFsdWUgPSB2YWx1ZVxuICAgIGFkZFZhbHVlICA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlICs9ICcgJyArIHZhbHVlXG4gICAgZ2V0VmFsdWUgID0gKGQpIC0+IGdldENodW5rKGQpPy52YWx1ZSA/ICcnXG4gICAgZ2V0bWF0Y2ggPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/Lm1hdGNoID8gJydcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGhhbmRsZXJzID0gXG4gICAgICAgIGNvZmZlZTogXG4gICAgICAgICAgICAgICAgcHVuY3Q6IFsgYmxvY2tDb21tZW50LCBoYXNoQ29tbWVudCwgY29mZmVlRnVuYywgdHJpcGxlU3RyaW5nLCBzaW1wbGVTdHJpbmcsIGludGVycG9sYXRpb24sIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0LCBzdGFja2VkIF1cbiAgICAgICAgICAgICAgICB3b3JkOiAgWyBrZXl3b3JkLCBjb2ZmZWVGdW5jLCBjb21tZW50SGVhZGVyLCBudW1iZXIsIHByb3BlcnR5LCBzdGFja2VkIF1cbiAgICAgICAgbm9vbjogICBwdW5jdDogWyBub29uQ29tbWVudCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGpzb246ICAgcHVuY3Q6IFsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIGRpY3QsICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBqczogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwganNGdW5jLCBudW1iZXIsICAgc3RhY2tlZF1cbiAgICAgICAgdHM6ICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIGpzRnVuYywgbnVtYmVyLCAgIHN0YWNrZWRdXG4gICAgICAgIG1kOiAgICAgcHVuY3Q6IFsgICAgICAgICAgICAgICAgICAgbWRTdHJpbmcsIHhtbFB1bmN0LCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFsgICAgICAgICBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBpc3M6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgaW5pOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogWyAgICAgICAgIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGNwcDogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgICBzdGFja2VkXVxuICAgICAgICBocHA6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybywgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgICAgc3RhY2tlZF1cbiAgICAgICAgYzogICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIG51bWJlciwgZmxvYXQsICAgIHN0YWNrZWRdXG4gICAgICAgIGg6ICAgICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgICBzdGFja2VkXVxuICAgICAgICBzaDogICAgIHB1bmN0OiBbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCBzaFB1bmN0LCAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgY3M6ICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHB1ZzogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBzdmc6ICAgIHB1bmN0OiBbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgaHRtbDogICBwdW5jdDogWyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QsICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGh0bTogICAgcHVuY3Q6IFsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0LCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBzdHlsOiAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgY3NzOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHNhc3M6ICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBzY3NzOiAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgbG9nOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogWyAgICAgICAgIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHR4dDogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFsgICAgICAgICBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICBcbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICAgICBcbiAgICAgICAgaWYgZXh0VG9wXG4gICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmluZGVudCBhbmQgbGluZS5jaHVua3NbMF0/LnN0YXJ0IDw9IGV4dFRvcC5zdGFydC5jaHVua3NbMF0uc3RhcnRcbiAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSBpbmRlbnRhdGlvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN3aXRjaC50byAgICAgIyBtYWtlIHN1cmUgdGhlIGN1cnJlbnQgbGluZSBleHQgbWF0Y2hlcyB0aGUgdG9wbW9zdCBmcm9tIHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dCAhPSBsaW5lLmV4dCAgICAgICAgICAgICAgICAgICAgICAjIGVpdGhlciBhdCBzdGFydCBvZiBmaWxlIG9yIHdlIHN3aXRjaGVkIGV4dGVuc2lvblxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmsgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4XVxuICAgICAgICAgICAgYmVmb3JlSW5kZXggPSBjaHVua0luZGV4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnZhbHVlID09ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5lbmQ/IGFuZCBleHRUb3Auc3dpdGNoLmVuZCA9PSBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BFeHQoKSAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC5wdW5jdCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXguc3d0Y2hbbGluZS5leHRdP1tjaHVuay5tYXRjaF0gXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2gudHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZENodW5rID0gZ2V0Q2h1bmsgLW10Y2gudHVyZC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG10Y2gudHVyZCA9PSAodHVyZENodW5rPy50dXJkID8gdHVyZENodW5rPy5tYXRjaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHB1c2ggYSBuZXcgZXh0ZW5zaW9uIG9udG8gdGhlIHN0YWNrLCBleHQgd2lsbCBjaGFuZ2Ugb24gc3RhcnQgb2YgbmV4dCBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0U3RhY2sucHVzaCBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLndvcmQgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSBiZWZvcmVJbmRleFxuICAgICAgICAgICAgICAgIGNodW5rSW5kZXgrK1xuICAgIGxpbmVzXG4gICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmJsb2NrcyA9IChsaW5lcywgZXh0PSdjb2ZmZWUnKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tzICpsaW5lcyosICpleHQqJ1xuXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBzdHJpbmdzXG4gICAgICAgIFxuICAgICAgICAqZXh0KjpcbiAgICAgICAgLSBrb2ZmZWUgY29mZmVlIGpzIHRzIFxuICAgICAgICAtIHN0eWwgY3NzIHNhc3Mgc2NzcyBcbiAgICAgICAgLSBwdWcgaHRtbCBodG0gc3ZnIFxuICAgICAgICAtIGNwcCBocHAgY3h4IGMgaCBcbiAgICAgICAgLSBiYXNoIGZpc2ggc2ggXG4gICAgICAgIC0gbm9vbiBqc29uXG4gICAgICAgIC0gbWQgcGxpc3QgXG4gICAgICAgIC0gaXNzIGluaVxuICAgICAgICAtIHR4dCBsb2cgXG5cbiAgICAgICAgKipyZXR1cm5zKiogdGhlIHJlc3VsdCBvZlxuICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICAgICAgYGBgXG5cbiAgICBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5yYW5nZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdyYW5nZWQgKmxpbmVzKidcbiAgICAgICAgXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgICAgIFxuICAgICAgICAqKnJldHVybnMqKiBhcnJheSBvZlxuXG4gICAgICAgICAgICBzdGFydDogblxuICAgICAgICAgICAgbWF0Y2g6IHNcbiAgICAgICAgICAgIHZhbHVlOiBzXG4gICAgICAgIFxuICAgIHJuZ3MgPSBbXVxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAgcmFuZ2UgPVxuICAgICAgICAgICAgICAgIHN0YXJ0OiBjaHVuay5zdGFydFxuICAgICAgICAgICAgICAgIG1hdGNoOiBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjaHVuay52YWx1ZVxuICAgICAgICAgICAgcm5ncy5wdXNoIHJhbmdlXG4gICAgcm5nc1xuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuXG5kaXNzZWN0ID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIGRpc3MgPSBbXVxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIGQgPSBbXVxuICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgIHJhbmdlID1cbiAgICAgICAgICAgICAgICBzdGFydDogY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICBtYXRjaDogY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2h1bmsudmFsdWVcbiAgICAgICAgICAgIGQucHVzaCByYW5nZVxuICAgICAgICBkaXNzLnB1c2ggZFxuICAgIGRpc3NcbiAgICAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGJsb2NrczogIGJsb2Nrc1xuICAgIHJhbmdlczogIChsaW5lLCBleHQpICAtPiByYW5nZWQgYmxvY2tzIFtsaW5lXSwgZXh0XG4gICAgZGlzc2VjdDogKGxpbmVzLCBleHQpIC0+IGRpc3NlY3QgYmxvY2tzIGxpbmVzLCBleHRcbiAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbuKWuHRlc3QgJ3Byb2ZpbGUnXG4gICAgXG4gICAg4pa4cHJvZmlsZSAnLS0tLS0nXG4gICAgICAgIFxuICAgICAgICB0ZXh0MCA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9Ly4uLy4uL2tvZmZlZS9jb2ZmZWUvbm9kZXMuY29mZmVlXCIgIyA2LTExbXNcbiAgICAgICAgdGV4dDEgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiICMgNTAtMTIwzrxzXG4gICAgXG4gICAgICAgIGxpbmVzMCA9IHRleHQwLnNwbGl0ICdcXG4nXG4gICAgICAgIGxpbmVzMSA9IHRleHQxLnNwbGl0ICdcXG4nXG5cbiAgICBmb3IgaSBpbiBbMC4uNV1cbiAgICAgICAgYmxvY2tzIGxpbmVzMFxuICAgICAgICAjIGJsb2NrcyBsaW5lczFcbiAgICAgICAgIyBsaW5lczAubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG4gICAgICAgIFxuICAgIGZvciBpIGluIFswLi4xNV1cbiAgICAgICAgXG4gICAgICAgIOKWuHByb2ZpbGUgJ2xpbmVzMCdcbiAgICAgICAgICAgIGJsb2NrcyBsaW5lczBcbiAgICAgICAgIyDilrhwcm9maWxlICdzeW50YXgwJ1xuICAgICAgICAgICAgIyBsaW5lczAubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG4gICAgICAgICAgICBcbiAgICAgICAgIyDilrhwcm9maWxlICdsaW5lczEnXG4gICAgICAgICAgICAjIGJsb2NrcyBsaW5lczFcbiAgICAgICAgIyDilrhwcm9maWxlICdzeW50YXgxJ1xuICAgICAgICAgICAgIyBsaW5lczEubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG4gICAgICAgICAgICBcbiMjI1xuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiMjI1xuXG7ilrh0ZXN0ICd0ZXN0J1xuXG4gICAgcmVxdWlyZSgna3hrJykuY2hhaSgpICAgIFxuIl19
//# sourceURL=../coffee/blocks.coffee