// koffee 0.43.0

/*
0000000    000       0000000    0000000  000   000   0000000    
000   000  000      000   000  000       000  000   000         
0000000    000      000   000  000       0000000    0000000     
000   000  000      000   000  000       000  000        000    
0000000    0000000   0000000    0000000  000   000  0000000
 */
var FLOAT, HEADER, HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, blocked, blocks, chunked, dissect, klog, kstr, noon, ranged, ref, slash;

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
    var addValue, advance, beforeIndex, blockComment, chunk, chunkIndex, coffeeFunc, commentHeader, cppMacro, dashArrow, dict, ext, extStack, extTop, float, getChunk, getValue, getmatch, handl, handlers, hashComment, hnd, interpolation, j, jsFunc, k, keyword, len, len1, len2, line, mdString, mtch, n, noonComment, number, popExt, popStack, property, pushStack, ref1, ref2, ref3, ref4, ref5, ref6, ref7, regexp, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, topType, tripleString, turdChunk, xmlPunct;
''
    extStack = [];
    stack = [];
    handl = [];
    extTop = null;
    stackTop = null;
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
        if (stackTop && topType !== 'interpolation') {
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
        if (topType === 'string') {
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
        if ((ref1 = chunk.match) === '"' || ref1 === "'" || ref1 === '`') {
            if ((ref2 = line.chunks[chunkIndex - 1]) != null ? ref2.escape : void 0) {
                return stacked();
            }
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
            } else if (stackTop && topType !== 'interpolation') {
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
            if (chunkIndex === 0 || !line.chunks[chunkIndex - 1].escape) {
                chunk.escape = true;
            }
        }
        return 0;
    };
    tripleString = function() {
        var type;
        if (!chunk.turd || chunk.turd.length < 3) {
            return;
        }
        if (topType === 'regexp') {
            return;
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
        if (Syntax.lang[ext].hasOwnProperty(chunk.match)) {
            chunk.value = Syntax.lang[ext][chunk.match];
            return 0;
        }
    };
    number = function() {
        if (chunk.value !== 'text') {
            return 1;
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
        return topType = o.type;
    };
    popStack = function() {
        stack.pop();
        stackTop = stack.slice(-1)[0];
        return topType = stackTop != null ? stackTop.type : void 0;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFpQyxPQUFBLENBQVEsS0FBUixDQUFqQyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkI7O0FBRTNCLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxNQUFNLENBQUMsSUFBUCxDQUFBOztBQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQ0k7UUFBQSxHQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFXLEVBQUEsRUFBRyxJQUFkO1lBQW9CLE1BQUEsRUFBUSxDQUE1QjtTQUFkO0tBREo7SUFFQSxFQUFBLEVBQ0k7UUFBQSxZQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxRQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtTQUFkO1FBQ0EsVUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7U0FEZDtLQUhKOzs7QUFNSixLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQUNULEtBQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFRVCxPQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsR0FBUjtBQUVQLFFBQUE7QUFBQTtJQWtCQyxNQUFBLEdBQVM7V0FDVCxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsSUFBRDtBQUVOLFlBQUE7UUFBQSxJQUFBLEdBQ0k7WUFBQSxNQUFBLEVBQVEsRUFBUjtZQUNBLEtBQUEsRUFBUSxDQURSO1lBRUEsS0FBQSxFQUFRLE1BQUEsRUFGUjtZQUdBLE1BQUEsRUFBUSxNQUhSO1lBSUEsR0FBQSxFQUFRLEdBSlI7O1FBTUosTUFBQSxHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBWDtRQUVULElBQUcsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBakIsSUFBdUIsTUFBTyxDQUFBLENBQUEsQ0FBUCxLQUFhLEVBQXZDO0FBQ0ksbUJBQU8sS0FEWDs7UUFHQSxDQUFBLEdBQUk7QUFDSixhQUFBLHdDQUFBOztZQUNJLElBQUcsQ0FBQSxLQUFLLEVBQVI7Z0JBQ0ksQ0FBQSxHQURKO2FBQUEsTUFBQTtnQkFHSSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBZjtvQkFBMkIsQ0FBQSxHQUEzQjs7Z0JBQ0EsQ0FBQSxHQUFJLENBQUMsQ0FBQztnQkFDTixFQUFBLEdBQUs7QUFJTCx1QkFBTSxDQUFBLEdBQUksS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQVY7b0JBRUksSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLENBQWI7d0JBQ0ksRUFBQSxHQUFLLENBQUMsQ0FBQyxLQUFGLEdBQVEsQ0FBQyxDQUFBLEdBQUUsRUFBSDt3QkFDYixDQUFBLEdBQUksQ0FBRTt3QkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLElBQVosQ0FBaUI7NEJBQUEsS0FBQSxFQUFNLENBQU47NEJBQVMsTUFBQSxFQUFPLEVBQWhCOzRCQUFvQixLQUFBLEVBQU0sQ0FBMUI7NEJBQTZCLEtBQUEsRUFBTSxNQUFuQzt5QkFBakI7d0JBQ0EsQ0FBQSxJQUFLLEdBSlQ7O29CQU1BLElBQUEsR0FBTyxLQUFBLEdBQVEsQ0FBRSxDQUFBLENBQUE7QUFDakI7QUFBQSx5QkFBQSx3Q0FBQTs7d0JBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFaLENBQWlCOzRCQUFBLEtBQUEsRUFBTSxDQUFBLEVBQU47NEJBQVcsTUFBQSxFQUFPLENBQWxCOzRCQUFxQixLQUFBLEVBQU0sRUFBM0I7NEJBQStCLElBQUEsRUFBSyxJQUFwQzs0QkFBMEMsS0FBQSxFQUFNLE9BQWhEO3lCQUFqQjt3QkFDQSxJQUFBLEdBQU8sSUFBSztBQUZoQjtvQkFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQVosQ0FBaUI7d0JBQUEsS0FBQSxFQUFNLENBQUEsRUFBTjt3QkFBVyxNQUFBLEVBQU8sQ0FBbEI7d0JBQXFCLEtBQUEsRUFBTSxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQW5DO3dCQUFzQyxLQUFBLEVBQU0sT0FBNUM7cUJBQWpCO2dCQVpKO2dCQWNBLElBQUcsQ0FBQSxHQUFJLEVBQUEsR0FBRyxDQUFWO29CQUNJLEVBQUEsR0FBSyxFQUFBLEdBQUcsQ0FBSCxHQUFLO29CQUNWLENBQUEsR0FBSSxDQUFFO29CQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBWixDQUFpQjt3QkFBQSxLQUFBLEVBQU0sQ0FBTjt3QkFBUyxNQUFBLEVBQU8sRUFBaEI7d0JBQW9CLEtBQUEsRUFBTSxDQUExQjt3QkFBNkIsS0FBQSxFQUFNLE1BQW5DO3FCQUFqQjtvQkFDQSxDQUFBLElBQUssR0FKVDtpQkF2Qko7O0FBREo7UUE4QkEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQWY7WUFDSSxJQUFBLEdBQU8sSUFBSSxDQUFDLE1BQU8sVUFBRSxDQUFBLENBQUE7WUFDckIsSUFBSSxDQUFDLEtBQUwsR0FBYSxJQUFJLENBQUMsS0FBTCxHQUFhLElBQUksQ0FBQyxPQUZuQzs7ZUFJQTtJQWpETSxDQUFWO0FBckJNOzs7QUF3RVY7Ozs7Ozs7O0FBUUEsT0FBQSxHQUFVLFNBQUMsS0FBRDtBQUVQLFFBQUE7QUFBQTtJQVdDLFFBQUEsR0FBYTtJQUNiLEtBQUEsR0FBYTtJQUNiLEtBQUEsR0FBYTtJQUNiLE1BQUEsR0FBYTtJQUNiLFFBQUEsR0FBYTtJQUNiLE9BQUEsR0FBYTtJQUNiLEdBQUEsR0FBYTtJQUNiLElBQUEsR0FBYTtJQUNiLEtBQUEsR0FBYTtJQUNiLFVBQUEsR0FBYTtJQVFiLFdBQUEsR0FBYyxTQUFBO0FBRVYsWUFBQTtRQUFBLElBQVUsUUFBVjtBQUFBLG1CQUFBOztRQUVBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFsQjtZQUNJLEtBQUssQ0FBQyxLQUFOLElBQWU7WUFDZixJQUFHLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQVosR0FBbUIsQ0FBbkM7QUFDSTtBQUFBLHFCQUFBLHNDQUFBOztvQkFDSSxDQUFDLENBQUMsS0FBRixHQUFVO29CQUNWLElBQUcsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFDLENBQUMsS0FBZCxDQUFIO3dCQUNJLENBQUMsQ0FBQyxLQUFGLElBQVcsVUFEZjs7QUFGSixpQkFESjs7QUFLQSxtQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQVosR0FBcUIsVUFBckIsR0FBa0MsRUFQN0M7O0lBSlU7SUFhZCxXQUFBLEdBQWMsU0FBQTtBQUVWLFlBQUE7UUFBQSxJQUFVLFFBQVY7QUFBQSxtQkFBQTs7UUFFQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsR0FBZixJQUF1QixVQUFBLEtBQWMsQ0FBeEM7WUFDSSxLQUFLLENBQUMsS0FBTixJQUFlO1lBQ2YsSUFBRyxVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFaLEdBQW1CLENBQW5DO0FBQ0k7QUFBQSxxQkFBQSxzQ0FBQTs7b0JBQ0ksQ0FBQyxDQUFDLEtBQUYsR0FBVTtBQURkLGlCQURKOztBQUdBLG1CQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBWixHQUFxQixVQUFyQixHQUFrQyxFQUw3Qzs7SUFKVTtJQVdkLFlBQUEsR0FBZSxTQUFBLEdBQUE7SUFFZixZQUFBLEdBQWUsU0FBQTtBQUVYLFlBQUE7UUFBQSxJQUFVLENBQUksS0FBSyxDQUFDLElBQVYsSUFBa0IsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFYLEdBQW9CLENBQWhEO0FBQUEsbUJBQUE7O1FBRUEsSUFBQSxHQUFPO1FBRVAsSUFBVSxPQUFBLElBQVksQ0FBQSxPQUFBLEtBQWdCLGVBQWhCLElBQUEsT0FBQSxLQUFpQyxJQUFqQyxDQUF0QjtBQUFBLG1CQUFBOztRQUVBLElBQUcsS0FBSyxDQUFDLElBQUssWUFBWCxLQUFtQixLQUF0QjtZQUNJLElBQUcsT0FBQSxLQUFXLElBQWQ7Z0JBQ0ksUUFBQSxDQUFBLEVBREo7YUFBQSxNQUFBO2dCQUdJLFNBQUEsQ0FBVTtvQkFBQSxJQUFBLEVBQUssSUFBTDtvQkFBVyxNQUFBLEVBQU8sSUFBbEI7aUJBQVYsRUFISjs7WUFLQSxRQUFBLENBQVMsQ0FBVCxFQUFZLElBQVo7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFZLElBQVo7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFZLElBQVo7QUFDQSxtQkFBTyxFQVRYOztJQVJXO0lBeUJmLFNBQUEsR0FBWSxTQUFBO1FBRVIsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLElBQWpCO1lBQ0ksUUFBQSxDQUFTLENBQVQsRUFBWSxlQUFaO1lBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSxlQUFaO1lBQ0EsSUFBRyxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsS0FBd0IsZ0JBQXhCLElBQTRDLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBZixLQUF1QixJQUF0RTtnQkFDSSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsR0FBdUI7Z0JBQ3ZCLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUF1QixlQUYzQjs7QUFHQSxtQkFBTyxFQU5YOztRQVFBLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxJQUFqQjtZQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVkscUJBQVo7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFZLHFCQUFaO1lBQ0EsSUFBRyxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsS0FBd0IsZ0JBQTNCO2dCQUNJLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUF1QjtnQkFDdkIsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEdBQXVCLGVBRjNCOztBQUdBLG1CQUFPLEVBTlg7O0lBVlE7SUFrQlosYUFBQSxHQUFnQixTQUFBO1FBRVosSUFBRyxPQUFBLEtBQVcsZ0JBQWQ7WUFDSSxJQUFHLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBSyxDQUFDLEtBQWxCLENBQUg7Z0JBQ0ksS0FBSyxDQUFDLEtBQU4sR0FBYztBQUNkLHVCQUFPLEVBRlg7YUFESjs7SUFGWTtJQWFoQixVQUFBLEdBQWEsU0FBQTtBQUVULFlBQUE7UUFBQSxJQUFVLFFBQUEsSUFBYSxPQUFBLEtBQVcsZUFBbEM7QUFBQSxtQkFBQTs7UUFFQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsR0FBbEI7WUFDSSxRQUFBLENBQVMsQ0FBVCxFQUFZLE1BQVo7QUFDQSxtQkFBTyxFQUZYOztRQUlBLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxJQUFqQjtZQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksTUFBWjtZQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksTUFBWjtBQUNBLG1CQUFPLEVBSFg7O1FBS0EsSUFBRyxJQUFBLEdBQU8sUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFWO1lBRUksWUFBRyxJQUFJLENBQUMsTUFBTCxLQUFlLE9BQWYsSUFBQSxJQUFBLEtBQXdCLFNBQTNCO2dCQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksT0FBWjtBQUNBLHVCQUFPLEVBRlg7O1lBSUEsSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLFlBQWpCO2dCQUNJLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxJQUFJLENBQUMsS0FBTCxHQUFXLENBQTdCO29CQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksTUFBWjtBQUNBLDJCQUFPLEVBRlg7aUJBREo7O1lBS0EsSUFBWSxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVosQ0FBdUIsU0FBdkIsQ0FBWjtBQUFBLHVCQUFPLEVBQVA7O1lBRUEsSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLE1BQWpCO2dCQUNJLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFsQjtvQkFDSSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQWEsVUFBYixFQURKO2lCQUFBLE1BRUssSUFBRyxJQUFJLENBQUMsS0FBTCxHQUFXLElBQUksQ0FBQyxNQUFoQixHQUF5QixLQUFLLENBQUMsS0FBbEM7b0JBQ0QsUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLGVBQWIsRUFEQztpQkFIVDthQWJKOztlQWtCQTtJQS9CUztJQWlDYixRQUFBLEdBQVcsU0FBQTtBQUVQLFlBQUE7UUFBQSxJQUFHLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBQSxLQUFnQixHQUFuQjtZQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxVQUFiO1lBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSxVQUFaO1lBQ0EsSUFBRyxRQUFBLEdBQVcsUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFkO2dCQUNJLFlBQUcsUUFBUSxDQUFDLE1BQVQsS0FBdUIsVUFBdkIsSUFBQSxJQUFBLEtBQW1DLFFBQXRDO29CQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxLQUFiLEVBREo7aUJBREo7O0FBR0EsbUJBQU8sRUFOWDs7SUFGTztJQVVYLE1BQUEsR0FBUyxTQUFBO1FBUUwsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLGtCQUFsQjtZQUNJLElBQUcsUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFBLEtBQWdCLEdBQWhCLElBQXdCLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBWSxDQUFDLFVBQWIsQ0FBd0IsTUFBeEIsQ0FBM0I7Z0JBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLFVBQWIsRUFESjthQURKOztlQUdBO0lBWEs7SUFhVCxJQUFBLEdBQU8sU0FBQTtBQUVILFlBQUE7UUFBQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsR0FBZixJQUF1QixvQ0FBYyxDQUFFLFVBQVosQ0FBdUIsSUFBdkIsV0FBOUI7WUFDSSxJQUFHLElBQUEsR0FBTyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQVY7Z0JBQ0ksWUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQVgsQ0FBaUIsR0FBakIsQ0FBc0IsQ0FBQSxDQUFBLEVBQXRCLEtBQTZCLFFBQTdCLElBQUEsSUFBQSxLQUF1QyxRQUF2QyxJQUFBLElBQUEsS0FBaUQsTUFBakQsSUFBQSxJQUFBLEtBQXlELFNBQTVEO29CQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxnQkFBYjtvQkFDQSxRQUFBLENBQVUsQ0FBVixFQUFhLGtCQUFiO0FBQ0EsMkJBQU8sRUFIWDtpQkFESjthQURKOztJQUZHO0lBZVAsTUFBQSxHQUFTLFNBQUE7QUFFTCxZQUFBO1FBQUEsSUFBVSxPQUFBLEtBQVcsUUFBckI7QUFBQSxtQkFBQTs7UUFFQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsR0FBbEI7WUFFSSxJQUFHLE9BQUEsS0FBVyxRQUFkO2dCQUNJLEtBQUssQ0FBQyxLQUFOLElBQWU7Z0JBQ2YsUUFBQSxDQUFBO0FBQ0EsdUJBQU8sRUFIWDs7WUFLQSxJQUFHLFVBQUg7Z0JBQ0ksSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVY7Z0JBQ1AsSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVY7Z0JBQ1AsSUFBRyxDQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBWCxDQUFzQixPQUF0QixDQUFQO29CQUNJLElBQVUsQ0FBQyxJQUFJLENBQUMsS0FBTCxHQUFXLElBQUksQ0FBQyxNQUFoQixHQUEwQixLQUFLLENBQUMsS0FBakMsQ0FBQSxvQkFBNEMsSUFBSSxDQUFFLGVBQU4sR0FBZSxLQUFLLENBQUMsS0FBTixHQUFZLENBQWpGO0FBQUEsK0JBQUE7O29CQUNBLElBQVUsQ0FBQyxJQUFJLENBQUMsS0FBTCxHQUFXLElBQUksQ0FBQyxNQUFoQixLQUEwQixLQUFLLENBQUMsS0FBakMsQ0FBQSxvQkFBNEMsSUFBSSxDQUFFLGVBQU4sS0FBZSxLQUFLLENBQUMsS0FBTixHQUFZLENBQWpGO0FBQUEsK0JBQUE7cUJBRko7aUJBSEo7O1lBT0EsU0FBQSxDQUFVO2dCQUFBLElBQUEsRUFBSyxRQUFMO2FBQVY7WUFDQSxLQUFLLENBQUMsS0FBTixJQUFlO0FBQ2YsbUJBQU8sRUFoQlg7O0lBSks7SUE0QlQsWUFBQSxHQUFlLFNBQUE7QUFFWCxZQUFBO1FBQUEsSUFBVSxPQUFBLEtBQVcsUUFBckI7QUFBQSxtQkFBQTs7UUFFQSxZQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLEdBQWhCLElBQUEsSUFBQSxLQUFvQixHQUFwQixJQUFBLElBQUEsS0FBd0IsR0FBM0I7WUFFSSx1REFBNEIsQ0FBRSxlQUE5QjtBQUNJLHVCQUFPLE9BQUEsQ0FBQSxFQURYOztZQUdBLElBQUE7QUFBTyx3QkFBTyxLQUFLLENBQUMsS0FBYjtBQUFBLHlCQUNFLEdBREY7K0JBQ1c7QUFEWCx5QkFFRSxHQUZGOytCQUVXO0FBRlgseUJBR0UsR0FIRjsrQkFHVztBQUhYOztZQUtQLElBQUcsT0FBQSxLQUFXLElBQWQ7Z0JBQ0ksS0FBSyxDQUFDLEtBQU4sSUFBZSxHQUFBLEdBQU07Z0JBQ3JCLFFBQUEsQ0FBQTtBQUNBLHVCQUFPLEVBSFg7YUFBQSxNQUlLLElBQUcsUUFBQSxJQUFhLE9BQUEsS0FBVyxlQUEzQjtBQUNELHVCQUFPLE9BQUEsQ0FBQSxFQUROOztZQUdMLFNBQUEsQ0FBVTtnQkFBQSxJQUFBLEVBQUssSUFBTDtnQkFBVyxNQUFBLEVBQU8sSUFBbEI7YUFBVjtZQUNBLEtBQUssQ0FBQyxLQUFOLElBQWUsR0FBQSxHQUFNO0FBQ3JCLG1CQUFPLEVBbkJYOztRQXFCQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsSUFBZix1QkFBd0IsT0FBTyxDQUFFLFVBQVQsQ0FBb0IsUUFBcEIsV0FBM0I7WUFDSSxJQUFHLFVBQUEsS0FBYyxDQUFkLElBQW1CLENBQUksSUFBSSxDQUFDLE1BQU8sQ0FBQSxVQUFBLEdBQVcsQ0FBWCxDQUFhLENBQUMsTUFBcEQ7Z0JBQ0ksS0FBSyxDQUFDLE1BQU4sR0FBZSxLQURuQjthQURKOztlQUdBO0lBNUJXO0lBOEJmLFlBQUEsR0FBZSxTQUFBO0FBRVgsWUFBQTtRQUFBLElBQVUsQ0FBSSxLQUFLLENBQUMsSUFBVixJQUFrQixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQVgsR0FBb0IsQ0FBaEQ7QUFBQSxtQkFBQTs7UUFDQSxJQUFVLE9BQUEsS0FBVyxRQUFyQjtBQUFBLG1CQUFBOztRQUVBLElBQUE7QUFBTyxvQkFBTyxLQUFLLENBQUMsSUFBSyxZQUFsQjtBQUFBLHFCQUNFLEtBREY7MkJBQ2E7QUFEYixxQkFFRSxLQUZGOzJCQUVhO0FBRmI7O1FBS1AsSUFBRyxJQUFIO1lBQ0ksSUFBRyxPQUFBLEtBQVcsSUFBZDtnQkFDSSxRQUFBLENBQUEsRUFESjthQUFBLE1BQUE7Z0JBR0ksU0FBQSxDQUFVO29CQUFBLElBQUEsRUFBSyxJQUFMO29CQUFXLE1BQUEsRUFBTyxJQUFsQjtpQkFBVixFQUhKOztZQUtBLFFBQUEsQ0FBUyxDQUFULEVBQVksSUFBWjtZQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksSUFBWjtZQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksSUFBWjtBQUNBLG1CQUFPLEVBVFg7O0lBVlc7SUEyQmYsUUFBQSxHQUFXLFNBQUE7QUFFUCxZQUFBO1FBQUEsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLElBQWpCO1lBRUksSUFBQSxHQUFPO1lBQ1Asc0JBQUcsT0FBTyxDQUFFLFFBQVQsQ0FBa0IsSUFBbEIsVUFBSDtnQkFDSSxRQUFBLENBQVMsQ0FBVCxFQUFZLE9BQVo7Z0JBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSxPQUFaO2dCQUNBLFFBQUEsQ0FBQTtBQUNBLHVCQUFPLEVBSlg7O1lBTUEsdUJBQXFDLFFBQVEsQ0FBRSxjQUEvQztnQkFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLElBQVQsR0FBZ0IsR0FBaEIsR0FBc0IsS0FBN0I7O1lBQ0EsU0FBQSxDQUFVO2dCQUFBLEtBQUEsRUFBTSxJQUFOO2dCQUFZLElBQUEsRUFBSyxJQUFqQjthQUFWO1lBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSxJQUFaO1lBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSxJQUFaO0FBQ0EsbUJBQU8sRUFiWDs7UUFlQSxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsR0FBbEI7WUFFSSxJQUFBLEdBQU87WUFDUCxzQkFBRyxPQUFPLENBQUUsUUFBVCxDQUFrQixJQUFsQixVQUFIO2dCQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksT0FBWjtnQkFDQSxRQUFBLENBQUE7QUFDQSx1QkFBTyxFQUhYOztZQUtBLHVCQUFxQyxRQUFRLENBQUUsY0FBL0M7Z0JBQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxJQUFULEdBQWdCLEdBQWhCLEdBQXNCLEtBQTdCOztZQUNBLFNBQUEsQ0FBVTtnQkFBQSxLQUFBLEVBQU0sSUFBTjtnQkFBWSxJQUFBLEVBQUssSUFBakI7YUFBVjtZQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksSUFBWjtBQUNBLG1CQUFPLEVBWFg7O1FBYUEsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLEdBQWxCO1lBRUksdUNBQWUsc0JBQVosS0FBb0IsS0FBdkI7Z0JBRUksSUFBQSxHQUFPO2dCQUVQLElBQUcsT0FBQSxLQUFXLElBQWQ7b0JBQ0ksUUFBQSxDQUFBLEVBREo7aUJBQUEsTUFBQTtvQkFHSSxTQUFBLENBQVU7d0JBQUEsSUFBQSxFQUFLLElBQUw7d0JBQVcsSUFBQSxFQUFLLElBQWhCO3FCQUFWLEVBSEo7O2dCQUtBLFFBQUEsQ0FBUyxDQUFULEVBQVksSUFBWjtnQkFDQSxRQUFBLENBQVMsQ0FBVCxFQUFZLElBQVo7Z0JBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSxJQUFaO0FBQ0EsdUJBQU8sRUFaWDs7WUFjQSxJQUFBLEdBQU87WUFDUCxzQkFBRyxPQUFPLENBQUUsUUFBVCxDQUFrQixJQUFsQixVQUFIO2dCQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksT0FBWjtnQkFDQSxRQUFBLENBQUE7QUFDQSx1QkFBTyxFQUhYOztZQUtBLHVCQUFxQyxRQUFRLENBQUUsY0FBL0M7Z0JBQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxJQUFULEdBQWdCLEdBQWhCLEdBQXNCLEtBQTdCOztZQUNBLFNBQUEsQ0FBVTtnQkFBQSxLQUFBLEVBQU0sSUFBTjtnQkFBWSxJQUFBLEVBQUssSUFBakI7YUFBVjtZQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksSUFBWjtBQUNBLG1CQUFPLEVBekJYOztJQTlCTztJQStEWCxhQUFBLEdBQWdCLFNBQUE7QUFFWixZQUFBO1FBQUEsSUFBRyxPQUFBLEtBQVcsZUFBZDtZQUVJLHNDQUFhLENBQUUsVUFBWixDQUF1QixLQUF2QixVQUFIO2dCQUNJLFNBQUEsQ0FBVTtvQkFBQSxJQUFBLEVBQUssZUFBTDtvQkFBc0IsSUFBQSxFQUFLLElBQTNCO2lCQUFWO2dCQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksNEJBQVo7Z0JBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSw0QkFBWjtBQUNBLHVCQUFPLEVBSlg7YUFGSjtTQUFBLE1BUUssSUFBRyxPQUFBLEtBQVcsZUFBZDtZQUVELElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFsQjtnQkFDSSxRQUFBLENBQVMsQ0FBVCxFQUFZLHlCQUFaO2dCQUNBLFFBQUEsQ0FBQTtBQUNBLHVCQUFPLEVBSFg7YUFGQzs7SUFWTztJQXVCaEIsT0FBQSxHQUFVLFNBQUE7UUFFTixJQUFHLE1BQU0sQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUFJLENBQUMsY0FBakIsQ0FBZ0MsS0FBSyxDQUFDLEtBQXRDLENBQUg7WUFDSSxLQUFLLENBQUMsS0FBTixHQUFjLE1BQU0sQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUFLLENBQUEsS0FBSyxDQUFDLEtBQU47QUFDL0IsbUJBQU8sRUFGWDs7SUFGTTtJQVlWLE1BQUEsR0FBUyxTQUFBO1FBRUwsSUFBWSxLQUFLLENBQUMsS0FBTixLQUFlLE1BQTNCO0FBQUEsbUJBQU8sRUFBUDs7UUFFQSxJQUFHLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBSyxDQUFDLEtBQWxCLENBQUg7WUFFSSxJQUFHLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBQSxLQUFnQixHQUFuQjtnQkFFSSxJQUFHLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBQSxLQUFnQixjQUFoQixJQUFtQyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQUEsS0FBZ0IsY0FBdEQ7b0JBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLFFBQWI7b0JBQ0EsUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLGNBQWI7b0JBQ0EsUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLFFBQWI7b0JBQ0EsUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLGNBQWI7b0JBQ0EsUUFBQSxDQUFVLENBQVYsRUFBYSxRQUFiO0FBQ0EsMkJBQU8sRUFOWDs7Z0JBUUEsSUFBRyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQUEsS0FBZ0IsUUFBbkI7b0JBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLGNBQWI7b0JBQ0EsUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLGNBQWI7b0JBQ0EsUUFBQSxDQUFVLENBQVYsRUFBYSxjQUFiO0FBQ0EsMkJBQU8sRUFKWDtpQkFWSjs7WUFnQkEsS0FBSyxDQUFDLEtBQU4sR0FBYztBQUNkLG1CQUFPLEVBbkJYOztRQXFCQSxJQUFHLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBSyxDQUFDLEtBQWxCLENBQUg7WUFFSSxLQUFLLENBQUMsS0FBTixHQUFjO0FBQ2QsbUJBQU8sRUFIWDs7SUF6Qks7SUFvQ1QsS0FBQSxHQUFRLFNBQUE7UUFFSixJQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsS0FBSyxDQUFDLEtBQWpCLENBQUg7WUFDSSxJQUFHLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBQSxLQUFnQixHQUFuQjtnQkFFSSxJQUFHLFFBQUEsQ0FBUyxDQUFDLENBQVYsQ0FBQSxLQUFnQixRQUFuQjtvQkFDSSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQWEsY0FBYjtvQkFDQSxRQUFBLENBQVMsQ0FBQyxDQUFWLEVBQWEsY0FBYjtvQkFDQSxRQUFBLENBQVUsQ0FBVixFQUFhLGNBQWI7QUFDQSwyQkFBTyxFQUpYO2lCQUZKOztZQVFBLEtBQUssQ0FBQyxLQUFOLEdBQWM7QUFDZCxtQkFBTyxFQVZYOztJQUZJO0lBb0JSLFFBQUEsR0FBVyxTQUFBO0FBRVAsWUFBQTtRQUFBLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxJQUFqQjtZQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksU0FBWjtZQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksU0FBWjtBQUNBLG1CQUFPLEVBSFg7O1FBS0EsWUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixHQUFoQixJQUFBLElBQUEsS0FBbUIsR0FBdEI7WUFDSSxRQUFBLENBQVMsQ0FBVCxFQUFZLFNBQVo7QUFDQSxtQkFBTyxFQUZYOztJQVBPO0lBaUJYLFFBQUEsR0FBVyxTQUFBO1FBRVAsSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLEdBQWxCO1lBQ0ksUUFBQSxDQUFTLENBQVQsRUFBWSxRQUFaO1lBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSxRQUFaO0FBQ0EsbUJBQU8sRUFIWDs7SUFGTztJQWFYLE9BQUEsR0FBVSxTQUFBO0FBRU4sWUFBQTtRQUFBLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFmLHlDQUFtQyxDQUFFLGVBQWQsd0NBQWtDLENBQUUsZ0JBQXBDLEtBQThDLEtBQUssQ0FBQyxLQUE5RTtZQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxLQUFiO0FBQ0EsbUJBQU8sRUFGWDs7UUFJQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsSUFBZCx3Q0FBa0MsQ0FBRSxlQUFiLEtBQXNCLEtBQUssQ0FBQyxLQUFOLEdBQVksQ0FBNUQ7WUFDSSxRQUFBLENBQVMsQ0FBVCxFQUFZLFVBQVo7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFZLFVBQVo7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFZLFVBQVo7QUFDQSxtQkFBTyxFQUpYOztRQU1BLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxHQUFmLHdDQUFrQyxDQUFFLGVBQWIsS0FBc0IsS0FBSyxDQUFDLEtBQU4sR0FBWSxDQUE1RDtZQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksVUFBWjtZQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksVUFBWjtBQUNBLG1CQUFPLEVBSFg7O0lBWk07SUF1QlYsT0FBQSxHQUFVLFNBQUE7UUFFTixJQUFHLFFBQUg7WUFDSSxJQUFVLFFBQVEsQ0FBQyxJQUFuQjtBQUFBLHVCQUFBOztZQUNBLElBQUcsUUFBUSxDQUFDLE1BQVo7Z0JBQ0ksS0FBSyxDQUFDLEtBQU4sR0FBYyxRQURsQjthQUFBLE1BQUE7Z0JBR0ksS0FBSyxDQUFDLEtBQU4sSUFBZSxHQUFBLEdBQU0sUUFIekI7O0FBSUEsbUJBQU8sRUFOWDs7SUFGTTtJQVVWLE1BQUEsR0FBUyxTQUFBO1FBQ0wsS0FBQSxHQUFRLE1BQU0sQ0FBQztRQUNmLElBQUksQ0FBQyxHQUFMLEdBQVcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUN4QixRQUFRLENBQUMsR0FBVCxDQUFBO2VBQ0EsTUFBQSxHQUFTLFFBQVMsVUFBRSxDQUFBLENBQUE7SUFKZjtJQU1ULFNBQUEsR0FBWSxTQUFDLENBQUQ7UUFDUixLQUFLLENBQUMsSUFBTixDQUFXLENBQVg7UUFDQSxRQUFBLEdBQVc7ZUFDWCxPQUFBLEdBQVUsQ0FBQyxDQUFDO0lBSEo7SUFLWixRQUFBLEdBQVcsU0FBQTtRQUNQLEtBQUssQ0FBQyxHQUFOLENBQUE7UUFDQSxRQUFBLEdBQVcsS0FBTSxVQUFFLENBQUEsQ0FBQTtlQUNuQixPQUFBLHNCQUFVLFFBQVEsQ0FBRTtJQUhiO0lBS1gsUUFBQSxHQUFZLFNBQUMsQ0FBRDtlQUFPLElBQUksQ0FBQyxNQUFPLENBQUEsVUFBQSxHQUFXLENBQVg7SUFBbkI7SUFDWixRQUFBLEdBQVksU0FBQyxDQUFELEVBQUksS0FBSjtBQUFjLFlBQUE7UUFBQSxJQUFHLENBQUEsQ0FBQSxZQUFLLFVBQUEsR0FBVyxFQUFoQixRQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBaEMsQ0FBSDttQkFBK0MsSUFBSSxDQUFDLE1BQU8sQ0FBQSxVQUFBLEdBQVcsQ0FBWCxDQUFhLENBQUMsS0FBMUIsR0FBa0MsTUFBakY7O0lBQWQ7SUFDWixRQUFBLEdBQVksU0FBQyxDQUFELEVBQUksS0FBSjtBQUFjLFlBQUE7UUFBQSxJQUFHLENBQUEsQ0FBQSxZQUFLLFVBQUEsR0FBVyxFQUFoQixRQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBaEMsQ0FBSDttQkFBK0MsSUFBSSxDQUFDLE1BQU8sQ0FBQSxVQUFBLEdBQVcsQ0FBWCxDQUFhLENBQUMsS0FBMUIsSUFBbUMsR0FBQSxHQUFNLE1BQXhGOztJQUFkO0lBQ1osUUFBQSxHQUFZLFNBQUMsQ0FBRDtBQUFPLFlBQUE7NEZBQXFCO0lBQTVCO0lBQ1osUUFBQSxHQUFXLFNBQUMsQ0FBRDtBQUFPLFlBQUE7NEZBQXFCO0lBQTVCO0lBUVgsUUFBQSxHQUNJO1FBQUEsTUFBQSxFQUNRO1lBQUEsS0FBQSxFQUFPLENBQUUsWUFBRixFQUFnQixXQUFoQixFQUE2QixVQUE3QixFQUF5QyxZQUF6QyxFQUF1RCxZQUF2RCxFQUFxRSxhQUFyRSxFQUFvRixTQUFwRixFQUErRixNQUEvRixFQUF1RyxJQUF2RyxFQUE2RyxPQUE3RyxDQUFQO1lBQ0EsSUFBQSxFQUFPLENBQUUsT0FBRixFQUFXLFVBQVgsRUFBdUIsYUFBdkIsRUFBc0MsTUFBdEMsRUFBOEMsUUFBOUMsRUFBd0QsT0FBeEQsQ0FEUDtTQURSO1FBR0EsSUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsV0FBRixFQUFpRCxPQUFqRCxDQUFQO1lBQW1FLElBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQTRCLE9BQTVCLENBQXpFO1NBSFI7UUFJQSxJQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBZ0IsWUFBaEIsRUFBOEIsSUFBOUIsRUFBaUQsT0FBakQsQ0FBUDtZQUFtRSxJQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixFQUE0QixPQUE1QixDQUF6RTtTQUpSO1FBS0EsRUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsWUFBRixFQUFnQixZQUFoQixFQUE4QixTQUE5QixFQUF5QyxNQUF6QyxFQUFpRCxPQUFqRCxDQUFQO1lBQW1FLElBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLE1BQWxCLEVBQTRCLE9BQTVCLENBQXpFO1NBTFI7UUFNQSxFQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBRSxZQUFGLEVBQWdCLFlBQWhCLEVBQThCLFNBQTlCLEVBQXlDLE1BQXpDLEVBQWlELE9BQWpELENBQVA7WUFBbUUsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsTUFBbEIsRUFBNEIsT0FBNUIsQ0FBekU7U0FOUjtRQU9BLEVBQUEsRUFBUTtZQUFBLEtBQUEsRUFBTyxDQUFvQixRQUFwQixFQUE4QixRQUE5QixFQUFpRCxPQUFqRCxDQUFQO1lBQW1FLElBQUEsRUFBTSxDQUFVLE1BQVYsRUFBNEIsT0FBNUIsQ0FBekU7U0FQUjtRQVFBLEdBQUEsRUFBUTtZQUFBLEtBQUEsRUFBTyxDQUFFLFlBQUYsRUFBZ0IsWUFBaEIsRUFBaUQsT0FBakQsQ0FBUDtZQUFtRSxJQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixFQUE0QixPQUE1QixDQUF6RTtTQVJSO1FBU0EsR0FBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsWUFBRixFQUFnQixZQUFoQixFQUE4QixRQUE5QixFQUFpRCxPQUFqRCxDQUFQO1lBQW1FLElBQUEsRUFBTSxDQUFVLE1BQVYsRUFBNEIsT0FBNUIsQ0FBekU7U0FUUjtRQVVBLEdBQUEsRUFBUTtZQUFBLEtBQUEsRUFBTyxDQUFFLFlBQUYsRUFBZ0IsWUFBaEIsRUFBOEIsUUFBOUIsRUFBaUQsT0FBakQsQ0FBUDtZQUFtRSxJQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixLQUFsQixFQUE0QixPQUE1QixDQUF6RTtTQVZSO1FBV0EsR0FBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsWUFBRixFQUFnQixZQUFoQixFQUE4QixRQUE5QixFQUFpRCxPQUFqRCxDQUFQO1lBQW1FLElBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLEtBQWxCLEVBQTRCLE9BQTVCLENBQXpFO1NBWFI7UUFZQSxDQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBRSxZQUFGLEVBQWdCLFlBQWhCLEVBQThCLFFBQTlCLEVBQWlELE9BQWpELENBQVA7WUFBbUUsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBa0IsS0FBbEIsRUFBNEIsT0FBNUIsQ0FBekU7U0FaUjtRQWFBLENBQUEsRUFBUTtZQUFBLEtBQUEsRUFBTyxDQUFFLFlBQUYsRUFBZ0IsWUFBaEIsRUFBOEIsUUFBOUIsRUFBaUQsT0FBakQsQ0FBUDtZQUFtRSxJQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixFQUFrQixLQUFsQixFQUE0QixPQUE1QixDQUF6RTtTQWJSO1FBY0EsRUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsV0FBRixFQUFnQixZQUFoQixFQUE4QixPQUE5QixFQUFpRCxPQUFqRCxDQUFQO1lBQW1FLElBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQTRCLE9BQTVCLENBQXpFO1NBZFI7UUFlQSxFQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBRSxZQUFGLEVBQWdCLFlBQWhCLEVBQWlELE9BQWpELENBQVA7WUFBbUUsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBNEIsT0FBNUIsQ0FBekU7U0FmUjtRQWdCQSxHQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBRSxZQUFGLEVBQWdCLFlBQWhCLEVBQWlELE9BQWpELENBQVA7WUFBbUUsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBNEIsT0FBNUIsQ0FBekU7U0FoQlI7UUFpQkEsR0FBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQWdCLFlBQWhCLEVBQThCLFFBQTlCLEVBQWlELE9BQWpELENBQVA7WUFBbUUsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBNEIsT0FBNUIsQ0FBekU7U0FqQlI7UUFrQkEsSUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQWdCLFlBQWhCLEVBQThCLFFBQTlCLEVBQWlELE9BQWpELENBQVA7WUFBbUUsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBNEIsT0FBNUIsQ0FBekU7U0FsQlI7UUFtQkEsR0FBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQWdCLFlBQWhCLEVBQThCLFFBQTlCLEVBQWlELE9BQWpELENBQVA7WUFBbUUsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBNEIsT0FBNUIsQ0FBekU7U0FuQlI7UUFvQkEsSUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsWUFBRixFQUFnQixZQUFoQixFQUFpRCxPQUFqRCxDQUFQO1lBQW1FLElBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQTRCLE9BQTVCLENBQXpFO1NBcEJSO1FBcUJBLEdBQUEsRUFBUTtZQUFBLEtBQUEsRUFBTyxDQUFFLFlBQUYsRUFBZ0IsWUFBaEIsRUFBaUQsT0FBakQsQ0FBUDtZQUFtRSxJQUFBLEVBQU0sQ0FBQyxPQUFELEVBQVUsTUFBVixFQUE0QixPQUE1QixDQUF6RTtTQXJCUjtRQXNCQSxJQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBRSxZQUFGLEVBQWdCLFlBQWhCLEVBQWlELE9BQWpELENBQVA7WUFBbUUsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQVYsRUFBNEIsT0FBNUIsQ0FBekU7U0F0QlI7UUF1QkEsSUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsWUFBRixFQUFnQixZQUFoQixFQUFpRCxPQUFqRCxDQUFQO1lBQW1FLElBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQTRCLE9BQTVCLENBQXpFO1NBdkJSO1FBd0JBLEdBQUEsRUFBUTtZQUFBLEtBQUEsRUFBTyxDQUFFLFlBQUYsRUFBZ0IsWUFBaEIsRUFBaUQsT0FBakQsQ0FBUDtZQUFtRSxJQUFBLEVBQU0sQ0FBVSxNQUFWLEVBQTRCLE9BQTVCLENBQXpFO1NBeEJSO1FBeUJBLEdBQUEsRUFBUTtZQUFBLEtBQUEsRUFBTyxDQUFFLFlBQUYsRUFBZ0IsWUFBaEIsRUFBaUQsT0FBakQsQ0FBUDtZQUFtRSxJQUFBLEVBQU0sQ0FBVSxNQUFWLEVBQTRCLE9BQTVCLENBQXpFO1NBekJSOztBQWlDSixTQUFBLHVDQUFBOztRQUVJLElBQUcsTUFBSDtZQUNJLElBQUcsTUFBTSxFQUFDLE1BQUQsRUFBTyxDQUFDLE1BQWQsMkNBQXVDLENBQUUsZUFBaEIsSUFBeUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBNUU7Z0JBQ0ksTUFBQSxDQUFBLEVBREo7YUFBQSxNQUFBO2dCQUdJLElBQUksQ0FBQyxHQUFMLEdBQVcsTUFBTSxFQUFDLE1BQUQsRUFBTyxDQUFDLEdBSDdCO2FBREo7O1FBTUEsSUFBRyxHQUFBLEtBQU8sSUFBSSxDQUFDLEdBQWY7WUFDSSxLQUFBLEdBQVEsUUFBUyxDQUFBLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBWCxFQURyQjs7UUFTQSxVQUFBLEdBQWE7QUFDYixlQUFNLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQS9CO1lBRUksS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFPLENBQUEsVUFBQTtZQUNwQixXQUFBLEdBQWM7WUFFZCxJQUFHLEtBQUssQ0FBQyxLQUFOLEtBQWUsT0FBbEI7Z0JBRUksSUFBRyxNQUFIO29CQUNJLElBQUcsOEJBQUEsSUFBdUIsTUFBTSxFQUFDLE1BQUQsRUFBTyxDQUFDLEdBQWQsS0FBcUIsS0FBSyxDQUFDLElBQXJEO3dCQUNJLE1BQUEsQ0FBQSxFQURKO3FCQURKOztBQUlBO0FBQUEscUJBQUEsd0NBQUE7O29CQUNJLElBQUcsT0FBQSxHQUFVLEdBQUEsQ0FBQSxDQUFiO3dCQUNJLFVBQUEsSUFBYztBQUNkLDhCQUZKOztBQURKLGlCQU5KO2FBQUEsTUFBQTtnQkFZSSxJQUFHLElBQUEsaURBQStCLENBQUEsS0FBSyxDQUFDLEtBQU4sVUFBbEM7b0JBQ0ksSUFBRyxJQUFJLENBQUMsSUFBUjt3QkFDSSxTQUFBLEdBQVksUUFBQSxDQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFwQjt3QkFDWixJQUFHLElBQUksQ0FBQyxJQUFMLEtBQWEsMkZBQW1CLFNBQVMsQ0FBRSxjQUE5QixDQUFoQjs0QkFFSSxRQUFRLENBQUMsSUFBVCxDQUFjLE1BQUEsR0FBUztnQ0FBQSxDQUFBLE1BQUEsQ0FBQSxFQUFPLElBQVA7Z0NBQWEsS0FBQSxFQUFNLElBQW5CO2dDQUF5QixLQUFBLEVBQU0sS0FBL0I7NkJBQXZCLEVBRko7eUJBRko7cUJBREo7O0FBT0E7QUFBQSxxQkFBQSx3Q0FBQTs7b0JBQ0ksSUFBRyxPQUFBLEdBQVUsR0FBQSxDQUFBLENBQWI7d0JBQ0ksVUFBQSxJQUFjO0FBQ2QsOEJBRko7O0FBREosaUJBbkJKOztZQXdCQSxJQUFHLFVBQUEsS0FBYyxXQUFqQjtnQkFDSSxVQUFBLEdBREo7O1FBN0JKO0FBbEJKO1dBaURBO0FBcGxCTTs7QUE0bEJWLE1BQUEsR0FBUyxTQUFDLEtBQUQsRUFBUSxHQUFSOztRQUFRLE1BQUk7O0FBRWxCO1dBdUJDLE9BQUEsQ0FBUSxPQUFBLENBQVEsS0FBUixFQUFlLEdBQWYsQ0FBUjtBQXpCSzs7QUFpQ1QsTUFBQSxHQUFTLFNBQUMsS0FBRDtBQUVOLFFBQUE7QUFBQTtJQWFDLElBQUEsR0FBTztBQUNQLFNBQUEsdUNBQUE7O0FBQ0k7QUFBQSxhQUFBLHdDQUFBOztZQUNJLEtBQUEsR0FDSTtnQkFBQSxLQUFBLEVBQU8sS0FBSyxDQUFDLEtBQWI7Z0JBQ0EsS0FBQSxFQUFPLEtBQUssQ0FBQyxLQURiO2dCQUVBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FGYjs7WUFHSixJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVY7QUFMSjtBQURKO1dBT0E7QUF2Qks7O0FBK0JULE9BQUEsR0FBVSxTQUFDLEtBQUQ7QUFFTixRQUFBO0lBQUEsSUFBQSxHQUFPO0FBQ1AsU0FBQSx1Q0FBQTs7UUFDSSxDQUFBLEdBQUk7QUFDSjtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksS0FBQSxHQUNJO2dCQUFBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FBYjtnQkFDQSxLQUFBLEVBQU8sS0FBSyxDQUFDLEtBRGI7Z0JBRUEsS0FBQSxFQUFPLEtBQUssQ0FBQyxLQUZiOztZQUdKLENBQUMsQ0FBQyxJQUFGLENBQU8sS0FBUDtBQUxKO1FBTUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFWO0FBUko7V0FTQTtBQVpNOztBQW9CVixNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsTUFBQSxFQUFTLE1BQVQ7SUFDQSxNQUFBLEVBQVMsU0FBQyxJQUFELEVBQU8sR0FBUDtlQUFnQixNQUFBLENBQU8sTUFBQSxDQUFPLENBQUMsSUFBRCxDQUFQLEVBQWUsR0FBZixDQUFQO0lBQWhCLENBRFQ7SUFFQSxPQUFBLEVBQVMsU0FBQyxLQUFELEVBQVEsR0FBUjtlQUFnQixPQUFBLENBQVEsTUFBQSxDQUFPLEtBQVAsRUFBYyxHQUFkLENBQVI7SUFBaEIsQ0FGVDs7Ozs7O0FBcUNKIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgXG4jIyNcblxueyBzbGFzaCwga3N0ciwga2xvZywgbm9vbiwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuICAgICAgICBcblN5bnRheCA9IHJlcXVpcmUgJy4vc3ludGF4J1xuU3ludGF4LmluaXQoKVxuXG5TeW50YXguc3d0Y2ggPSBcbiAgICBjb2ZmZWU6IFxuICAgICAgICBkb2M6ICAgICAgICAgIHR1cmQ6J+KWuCcgICB0bzonbWQnICBpbmRlbnQ6IDFcbiAgICBtZDogICAgIFxuICAgICAgICBjb2ZmZWVzY3JpcHQ6IHR1cmQ6J2BgYCcgdG86J2NvZmZlZScgZW5kOidgYGAnXG4gICAgICAgIGphdmFzY3JpcHQ6ICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCdcbiAgICAgICAgICAgIFxuU1BBQ0UgID0gL1xccy9cbkhFQURFUiA9IC9eMCskL1xuUFVOQ1QgID0gL1xcVysvZ2lcbk5VTUJFUiA9IC9eXFxkKyQvXG5GTE9BVCAgPSAvXlxcZCtmJC9cbkhFWE5VTSA9IC9eMHhbYS1mQS1GXFxkXSskL1xuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcblxuY2h1bmtlZCA9IChsaW5lcywgZXh0KSAtPiAgICBcblxuICAgIOKWuGRvYyAnY2h1bmtlZCAqbGluZXMqLCAqZXh0KidcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAqKnJldHVybnMqKiBhcnJheSBvZlxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaHVua3M6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOiBzXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogIHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IG5cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgZXh0OiAgICBzXG4gICAgICAgICAgICBjaGFyczogIG5cbiAgICAgICAgICAgIGluZGV4OiAgblxuICAgICAgICAgICAgbnVtYmVyOiBuKzFcbiAgICAgICAgXG4gICAgbGluZW5vID0gMFxuICAgIGxpbmVzLm1hcCAodGV4dCkgLT4gXG4gICAgICAgIFxuICAgICAgICBsaW5lID0gXG4gICAgICAgICAgICBjaHVua3M6IFtdXG4gICAgICAgICAgICBjaGFyczogIDBcbiAgICAgICAgICAgIGluZGV4OiAgbGluZW5vKytcbiAgICAgICAgICAgIG51bWJlcjogbGluZW5vXG4gICAgICAgICAgICBleHQ6ICAgIGV4dFxuXG4gICAgICAgIGNodW5rcyA9IHRleHQuc3BsaXQgU1BBQ0VcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICByZXR1cm4gbGluZSAjIGVtcHR5IGxpbmVcbiAgICAgICAgICAgIFxuICAgICAgICBjID0gMFxuICAgICAgICBmb3IgcyBpbiBjaHVua3NcbiAgICAgICAgICAgIGlmIHMgPT0gJydcbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBjKytcbiAgICAgICAgICAgICAgICBsID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzYyA9IGNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIHNlcGVyYXRlIGJ5IHB1bmN0dWF0aW9uXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hpbGUgbSA9IFBVTkNULmV4ZWMgc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5pbmRleCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdsID0gbS5pbmRleC0oYy1zYylcbiAgICAgICAgICAgICAgICAgICAgICAgIHcgPSBzW2Mtc2MuLi5tLmluZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6d2wsIG1hdGNoOncsIHZhbHVlOid0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSB3bFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHR1cmQgPSBwdW5jdCA9IG1bMF1cbiAgICAgICAgICAgICAgICAgICAgZm9yIHBjIGluIHB1bmN0Wy4uLi0xXVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjKyssIGxlbmd0aDoxLCBtYXRjaDpwYywgdHVyZDp0dXJkLCB2YWx1ZToncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJkID0gdHVyZFsxLi5dXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YysrLCBsZW5ndGg6MSwgbWF0Y2g6cHVuY3RbLTFdLCB2YWx1ZToncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgYyA8IHNjK2wgICAgICAgICMgY2hlY2sgZm9yIHJlbWFpbmluZyBub24tcHVuY3RcbiAgICAgICAgICAgICAgICAgICAgcmwgPSBzYytsLWMgICAgIyBsZW5ndGggb2YgcmVtYWluZGVyXG4gICAgICAgICAgICAgICAgICAgIHcgPSBzW2wtcmwuLl0gICMgdGV4dCAgIG9mIHJlbWFpbmRlciBcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6cmwsIG1hdGNoOncsIHZhbHVlOid0ZXh0J1xuICAgICAgICAgICAgICAgICAgICBjICs9IHJsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGxhc3QgPSBsaW5lLmNodW5rc1stMV1cbiAgICAgICAgICAgIGxpbmUuY2hhcnMgPSBsYXN0LnN0YXJ0ICsgbGFzdC5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICBsaW5lXG4gICAgICAgIFxuIyMjXG4wMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxuYmxvY2tlZCA9IChsaW5lcykgLT5cbiAgICBcbiAgICDilrhkb2MgJ2Jsb2NrZWQgKmxpbmVzKidcbiAgICAgICAgXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgICAgIFxuICAgICAgICAqKnJldHVybnMqKiBsaW5lcyB3aXRoIFxuICAgICAgICAtICdleHQnIHN3aXRjaGVkIGluIHNvbWUgbGluZXNcbiAgICAgICAgLSAndmFsdWUnIGNoYW5nZWQgaW4gY2h1bmtzIHRoYXQgbWF0Y2ggbGFuZ3VhZ2UgcGF0dGVybnNcbiAgICAgICAgICBcbiAgICBleHRTdGFjayAgID0gW11cbiAgICBzdGFjayAgICAgID0gW11cbiAgICBoYW5kbCAgICAgID0gW11cbiAgICBleHRUb3AgICAgID0gbnVsbFxuICAgIHN0YWNrVG9wICAgPSBudWxsXG4gICAgdG9wVHlwZSAgICA9ICcnXG4gICAgZXh0ICAgICAgICA9ICcnXG4gICAgbGluZSAgICAgICA9IG51bGxcbiAgICBjaHVuayAgICAgID0gbnVsbFxuICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBoYXNoQ29tbWVudCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIHN0YWNrVG9wXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIlxuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyBjb21tZW50J1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgZm9yIGMgaW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCsxLi5dXG4gICAgICAgICAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgICAgICAgICAgaWYgSEVBREVSLnRlc3QgYy5tYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgYy52YWx1ZSArPSAnIGhlYWRlcidcbiAgICAgICAgICAgIHJldHVybiBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgMVxuXG4gICAgbm9vbkNvbW1lbnQgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBzdGFja1RvcFxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCIgYW5kIGNodW5rSW5kZXggPT0gMCAjIHRoZSBvbmx5IGRpZmZlcmVuY2UuIG1lcmdlIHdpdGggaGFzaENvbW1lbnQ/XG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIGNvbW1lbnQnXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICBmb3IgYyBpbiBsaW5lLmNodW5rc1tjaHVua0luZGV4KzEuLl1cbiAgICAgICAgICAgICAgICAgICAgYy52YWx1ZSA9ICdjb21tZW50J1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUuY2h1bmtzLmxlbmd0aCAtIGNodW5rSW5kZXggKyAxXG4gICAgICAgIFxuICAgIHNsYXNoQ29tbWVudCA9IC0+XG4gICAgXG4gICAgYmxvY2tDb21tZW50ID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gJ2NvbW1lbnQgdHJpcGxlJyBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcjIyMnXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDIsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAzICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG4gICAgXG4gICAgZGFzaEFycm93ID0gLT5cblxuICAgICAgICBpZiBjaHVuay50dXJkID09ICctPidcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdmdW5jdGlvbiB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSwgJ2Z1bmN0aW9uIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknIG9yIGxpbmUuY2h1bmtzWzBdLnR1cmQgPT0gJ0A6J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkID09ICc9PidcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSwgJ2Z1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1swXS52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgIFxuICAgIGNvbW1lbnRIZWFkZXIgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgICAgICBpZiBIRUFERVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBjb2ZmZWVGdW5jID0gLT4gICAgICAgIFxuXG4gICAgICAgIHJldHVybiBpZiBzdGFja1RvcCBhbmQgdG9wVHlwZSAhPSAnaW50ZXJwb2xhdGlvbidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ+KWuCcgIFxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ21ldGEnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJ34+J1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ21ldGEnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnbWV0YSdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgIFxuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgXG4gICAgICAgICAgICBpZiBwcmV2Lm1hdGNoIGluIFsnY2xhc3MnLCAnZXh0ZW5kcyddXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMCwgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUgPT0gJ3B1bmN0IG1ldGEnXG4gICAgICAgICAgICAgICAgaWYgY2h1bmsuc3RhcnQgPT0gcHJldi5zdGFydCsxXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIDAsICdtZXRhJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMCAjIGdpdmUgc3dpdGNoIGEgY2hhbmNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiAxIGlmIGNodW5rLnZhbHVlLnN0YXJ0c1dpdGggJ2tleXdvcmQnICMgd2UgYXJlIGRvbmUgd2l0aCB0aGUga2V5d29yZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlID09ICd0ZXh0J1xuICAgICAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoID09ICc9J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgcHJldi5zdGFydCtwcmV2Lmxlbmd0aCA8IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZnVuY3Rpb24gY2FsbCcgXG4gICAgICAgIDAgIyB3ZSBuZWVkIHRoaXMgaGVyZVxuICAgIFxuICAgIHByb3BlcnR5ID0gLT5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSwgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgc2V0VmFsdWUgMCwgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgaWYgcHJldlByZXYgPSBnZXRDaHVuayAtMlxuICAgICAgICAgICAgICAgIGlmIHByZXZQcmV2LnZhbHVlIG5vdCBpbiBbJ3Byb3BlcnR5JywgJ251bWJlciddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnb2JqJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAganNGdW5jID0gLT5cbiAgICAgICAgXG4gICAgICAgICMgaWYgcHJldi52YWx1ZSA9PSAndGV4dCdcbiAgICAgICAgICAgICMgaWYgY2h1bmsubWF0Y2ggPT0gJz0nXG4gICAgICAgICAgICAgICAgIyBzZXRWYWx1ZSAtMSwgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgIyBlbHNlIGlmIHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCBjaHVuay5zdGFydFxuICAgICAgICAgICAgICAgICMgc2V0VmFsdWUgLTEsICdmdW5jdGlvbiBjYWxsJyBcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnZhbHVlID09ICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICc9JyBhbmQgZ2V0VmFsdWUoLTIpLnN0YXJ0c1dpdGggJ3RleHQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdmdW5jdGlvbidcbiAgICAgICAgMCAjIHdlIG5lZWQgdGhpcyBoZXJlXG4gICAgICAgIFxuICAgIGRpY3QgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJzonIGFuZCBub3QgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCAnOjonXG4gICAgICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnNwbGl0KCcgJylbMF0gaW4gWydzdHJpbmcnLCAnbnVtYmVyJywgJ3RleHQnLCAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwLCAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgcmVnZXhwID0gLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiB0b3BUeXBlID09ICdzdHJpbmcnXG5cbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIHJlZ2V4cCBlbmQnXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IFxuICAgICAgICAgICAgICAgIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgICAgIG5leHQgPSBnZXRDaHVuayArMVxuICAgICAgICAgICAgICAgIGlmIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCAgY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA+ICBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpZiAocHJldi5zdGFydCtwcmV2Lmxlbmd0aCA9PSBjaHVuay5zdGFydCkgYW5kIG5leHQ/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZToncmVnZXhwJ1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyByZWdleHAgc3RhcnQnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHNpbXBsZVN0cmluZyA9IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggaW4gWydcIicgXCInXCIgJ2AnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tjaHVua0luZGV4LTFdPy5lc2NhcGVcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSBzd2l0Y2ggY2h1bmsubWF0Y2ggXG4gICAgICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnIFxuICAgICAgICAgICAgICAgIHdoZW4gXCInXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgICAgICB3aGVuICdgJyB0aGVuICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0eXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBlbHNlIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICdcXFxcJyBhbmQgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSAwIG9yIG5vdCBsaW5lLmNodW5rc1tjaHVua0luZGV4LTFdLmVzY2FwZVxuICAgICAgICAgICAgICAgIGNodW5rLmVzY2FwZSA9IHRydWVcbiAgICAgICAgMCAjIHdlIG5lZWQgdGhpcyBoZXJlXG5cbiAgICB0cmlwbGVTdHJpbmcgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICAgICAgcmV0dXJuIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgXG4gICAgICAgIHR5cGUgPSBzd2l0Y2ggY2h1bmsudHVyZFsuLjJdXG4gICAgICAgICAgICB3aGVuICdcIlwiXCInIHRoZW4gJ3N0cmluZyBkb3VibGUgdHJpcGxlJyBcbiAgICAgICAgICAgIHdoZW4gXCInJydcIiB0aGVuICdzdHJpbmcgc2luZ2xlIHRyaXBsZSdcbiAgICAgICAgICAgICMgd2hlbiAnYGBgJyB0aGVuICdzdHJpbmcgYmFja3RpY2sgdHJpcGxlJ1xuXG4gICAgICAgIGlmIHR5cGVcbiAgICAgICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMSwgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMiwgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDNcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgbWRTdHJpbmcgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnKionXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSAnYm9sZCdcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMSwgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSwgdHlwZTp0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcqJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gJ2l0YWxpYydcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlLCB0eXBlOnR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICdgJ1xuICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudHVyZD9bLi4yXSA9PSAnYGBgJ1xuICAgIFxuICAgICAgICAgICAgICAgIHR5cGUgPSAnc3RyaW5nIGJhY2t0aWNrIHRyaXBsZSdcbiAgICBcbiAgICAgICAgICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgd2Vhazp0cnVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAxLCB0eXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMiwgdHlwZVxuICAgICAgICAgICAgICAgIHJldHVybiAzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSAnYmFja3RpY2snXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUsIHR5cGU6dHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuICAgIFxuICAgIGludGVycG9sYXRpb24gPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoIFwiXFwje1wiXG4gICAgICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6J2ludGVycG9sYXRpb24nLCB3ZWFrOnRydWVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCAnc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMSwgJ3N0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgdG9wVHlwZSA9PSAnaW50ZXJwb2xhdGlvbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ30nXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ21hdGNoIGludGVycG9sYXRpb24gZW5kJ1xuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBrZXl3b3JkID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIFN5bnRheC5sYW5nW2V4dF0uaGFzT3duUHJvcGVydHkoY2h1bmsubWF0Y2gpIFxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSBTeW50YXgubGFuZ1tleHRdW2NodW5rLm1hdGNoXVxuICAgICAgICAgICAgcmV0dXJuIDAgIyBnaXZlIGNvZmZlZUZ1bmMgYSBjaGFuY2UsIG51bWJlciBiYWlscyBmb3IgdXNcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG51bWJlciA9IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMSBpZiBjaHVuay52YWx1ZSAhPSAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIGlmIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC00KSA9PSAnbnVtYmVyIGZsb2F0JyBhbmQgZ2V0VmFsdWUoLTIpID09ICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC00LCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXInXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEhFWE5VTS50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBoZXgnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBmbG9hdCA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBGTE9BVC50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgeG1sUHVuY3QgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJzwvJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2tleXdvcmQnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAna2V5d29yZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggaW4gWyc8Jyc+J11cbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdrZXl3b3JkJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgY3BwTWFjcm8gPSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnZGVmaW5lJ1xuICAgICAgICAgICAgc2V0VmFsdWUgMSwgJ2RlZmluZSdcbiAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICBcbiAgICBzaFB1bmN0ID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcvJyBhbmQgZ2V0Q2h1bmsoLTEpPy5zdGFydCArIGdldENodW5rKC0xKT8ubGVuZ3RoID09IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSwgJ2RpcidcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkID09ICctLScgYW5kIGdldENodW5rKDIpPy5zdGFydCA9PSBjaHVuay5zdGFydCsyXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnYXJndW1lbnQnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnYXJndW1lbnQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAyLCAnYXJndW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gM1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICctJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdhcmd1bWVudCdcbiAgICAgICAgICAgIHNldFZhbHVlIDEsICdhcmd1bWVudCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgc3RhY2tlZCA9IC0+XG5cbiAgICAgICAgaWYgc3RhY2tUb3BcbiAgICAgICAgICAgIHJldHVybiBpZiBzdGFja1RvcC53ZWFrXG4gICAgICAgICAgICBpZiBzdGFja1RvcC5zdHJvbmdcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSA9IHRvcFR5cGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0b3BUeXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgIFxuICAgIHBvcEV4dCA9IC0+XG4gICAgICAgIHN0YWNrID0gZXh0VG9wLnN0YWNrXG4gICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN0YXJ0LmV4dFxuICAgICAgICBleHRTdGFjay5wb3AoKSAgICAgICAgICAgICAgIFxuICAgICAgICBleHRUb3AgPSBleHRTdGFja1stMV1cbiAgICBcbiAgICBwdXNoU3RhY2sgPSAobykgLT4gXG4gICAgICAgIHN0YWNrLnB1c2ggbyBcbiAgICAgICAgc3RhY2tUb3AgPSBvXG4gICAgICAgIHRvcFR5cGUgPSBvLnR5cGVcbiAgICAgICAgXG4gICAgcG9wU3RhY2sgPSAtPiBcbiAgICAgICAgc3RhY2sucG9wKClcbiAgICAgICAgc3RhY2tUb3AgPSBzdGFja1stMV1cbiAgICAgICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgICAgIFxuICAgIGdldENodW5rICA9IChkKSAtPiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdXG4gICAgc2V0VmFsdWUgID0gKGQsIHZhbHVlKSAtPiBpZiAwIDw9IGNodW5rSW5kZXgrZCA8IGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF0udmFsdWUgPSB2YWx1ZVxuICAgIGFkZFZhbHVlICA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlICs9ICcgJyArIHZhbHVlXG4gICAgZ2V0VmFsdWUgID0gKGQpIC0+IGdldENodW5rKGQpPy52YWx1ZSA/ICcnXG4gICAgZ2V0bWF0Y2ggPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/Lm1hdGNoID8gJydcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGhhbmRsZXJzID0gXG4gICAgICAgIGNvZmZlZTogXG4gICAgICAgICAgICAgICAgcHVuY3Q6IFsgYmxvY2tDb21tZW50LCBoYXNoQ29tbWVudCwgY29mZmVlRnVuYywgdHJpcGxlU3RyaW5nLCBzaW1wbGVTdHJpbmcsIGludGVycG9sYXRpb24sIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0LCBzdGFja2VkIF1cbiAgICAgICAgICAgICAgICB3b3JkOiAgWyBrZXl3b3JkLCBjb2ZmZWVGdW5jLCBjb21tZW50SGVhZGVyLCBudW1iZXIsIHByb3BlcnR5LCBzdGFja2VkIF1cbiAgICAgICAgbm9vbjogICBwdW5jdDogWyBub29uQ29tbWVudCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGpzb246ICAgcHVuY3Q6IFsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIGRpY3QsICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBqczogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwganNGdW5jLCBudW1iZXIsICAgc3RhY2tlZF1cbiAgICAgICAgdHM6ICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIGpzRnVuYywgbnVtYmVyLCAgIHN0YWNrZWRdXG4gICAgICAgIG1kOiAgICAgcHVuY3Q6IFsgICAgICAgICAgICAgICAgICAgbWRTdHJpbmcsIHhtbFB1bmN0LCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFsgICAgICAgICBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBpc3M6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgaW5pOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogWyAgICAgICAgIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGNwcDogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgICBzdGFja2VkXVxuICAgICAgICBocHA6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybywgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCBmbG9hdCwgICAgc3RhY2tlZF1cbiAgICAgICAgYzogICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIG51bWJlciwgZmxvYXQsICAgIHN0YWNrZWRdXG4gICAgICAgIGg6ICAgICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsIGZsb2F0LCAgICBzdGFja2VkXVxuICAgICAgICBzaDogICAgIHB1bmN0OiBbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCBzaFB1bmN0LCAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgY3M6ICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHB1ZzogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBzdmc6ICAgIHB1bmN0OiBbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgaHRtbDogICBwdW5jdDogWyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QsICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGh0bTogICAgcHVuY3Q6IFsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0LCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBzdHlsOiAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgY3NzOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW2tleXdvcmQsIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHNhc3M6ICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtrZXl3b3JkLCBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBzY3NzOiAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBba2V5d29yZCwgbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgbG9nOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogWyAgICAgICAgIG51bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHR4dDogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFsgICAgICAgICBudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICBcbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICAgICBcbiAgICAgICAgaWYgZXh0VG9wXG4gICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmluZGVudCBhbmQgbGluZS5jaHVua3NbMF0/LnN0YXJ0IDw9IGV4dFRvcC5zdGFydC5jaHVua3NbMF0uc3RhcnRcbiAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSBpbmRlbnRhdGlvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN3aXRjaC50byAgICAgIyBtYWtlIHN1cmUgdGhlIGN1cnJlbnQgbGluZSBleHQgbWF0Y2hlcyB0aGUgdG9wbW9zdCBmcm9tIHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dCAhPSBsaW5lLmV4dCAgICAgICAgICAgICAgICAgICAgICAjIGVpdGhlciBhdCBzdGFydCBvZiBmaWxlIG9yIHdlIHN3aXRjaGVkIGV4dGVuc2lvblxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmsgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4XVxuICAgICAgICAgICAgYmVmb3JlSW5kZXggPSBjaHVua0luZGV4XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnZhbHVlID09ICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5lbmQ/IGFuZCBleHRUb3Auc3dpdGNoLmVuZCA9PSBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BFeHQoKSAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC5wdW5jdCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXguc3d0Y2hbbGluZS5leHRdP1tjaHVuay5tYXRjaF0gXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2gudHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZENodW5rID0gZ2V0Q2h1bmsgLW10Y2gudHVyZC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG10Y2gudHVyZCA9PSAodHVyZENodW5rPy50dXJkID8gdHVyZENodW5rPy5tYXRjaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIHB1c2ggYSBuZXcgZXh0ZW5zaW9uIG9udG8gdGhlIHN0YWNrLCBleHQgd2lsbCBjaGFuZ2Ugb24gc3RhcnQgb2YgbmV4dCBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0U3RhY2sucHVzaCBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLndvcmQgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSBiZWZvcmVJbmRleFxuICAgICAgICAgICAgICAgIGNodW5rSW5kZXgrK1xuICAgIGxpbmVzXG4gICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmJsb2NrcyA9IChsaW5lcywgZXh0PSdjb2ZmZWUnKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tzICpsaW5lcyosICpleHQqJ1xuXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBzdHJpbmdzXG4gICAgICAgIFxuICAgICAgICAqZXh0KjpcbiAgICAgICAgLSBrb2ZmZWUgY29mZmVlIGpzIHRzIFxuICAgICAgICAtIHN0eWwgY3NzIHNhc3Mgc2NzcyBcbiAgICAgICAgLSBwdWcgaHRtbCBodG0gc3ZnIFxuICAgICAgICAtIGNwcCBocHAgY3h4IGMgaCBcbiAgICAgICAgLSBiYXNoIGZpc2ggc2ggXG4gICAgICAgIC0gbm9vbiBqc29uXG4gICAgICAgIC0gbWQgcGxpc3QgXG4gICAgICAgIC0gaXNzIGluaVxuICAgICAgICAtIHR4dCBsb2cgXG5cbiAgICAgICAgKipyZXR1cm5zKiogdGhlIHJlc3VsdCBvZlxuICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICAgICAgYGBgXG5cbiAgICBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5yYW5nZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdyYW5nZWQgKmxpbmVzKidcbiAgICAgICAgXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgICAgIFxuICAgICAgICAqKnJldHVybnMqKiBhcnJheSBvZlxuXG4gICAgICAgICAgICBzdGFydDogblxuICAgICAgICAgICAgbWF0Y2g6IHNcbiAgICAgICAgICAgIHZhbHVlOiBzXG4gICAgICAgIFxuICAgIHJuZ3MgPSBbXVxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAgcmFuZ2UgPVxuICAgICAgICAgICAgICAgIHN0YXJ0OiBjaHVuay5zdGFydFxuICAgICAgICAgICAgICAgIG1hdGNoOiBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgIHZhbHVlOiBjaHVuay52YWx1ZVxuICAgICAgICAgICAgcm5ncy5wdXNoIHJhbmdlXG4gICAgcm5nc1xuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuXG5kaXNzZWN0ID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIGRpc3MgPSBbXVxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIGQgPSBbXVxuICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgIHJhbmdlID1cbiAgICAgICAgICAgICAgICBzdGFydDogY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICBtYXRjaDogY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2h1bmsudmFsdWVcbiAgICAgICAgICAgIGQucHVzaCByYW5nZVxuICAgICAgICBkaXNzLnB1c2ggZFxuICAgIGRpc3NcbiAgICAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGJsb2NrczogIGJsb2Nrc1xuICAgIHJhbmdlczogIChsaW5lLCBleHQpICAtPiByYW5nZWQgYmxvY2tzIFtsaW5lXSwgZXh0XG4gICAgZGlzc2VjdDogKGxpbmVzLCBleHQpIC0+IGRpc3NlY3QgYmxvY2tzIGxpbmVzLCBleHRcbiAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbuKWuHRlc3QgJ3Byb2ZpbGUnXG4gICAgXG4gICAg4pa4cHJvZmlsZSAnLS0tLS0nXG4gICAgICAgIFxuICAgICAgICB0ZXh0MCA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9Ly4uLy4uL2tvZmZlZS9jb2ZmZWUvbm9kZXMuY29mZmVlXCIgIyA2LTExbXNcbiAgICAgICAgdGV4dDEgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiICMgNTAtMTIwzrxzXG4gICAgXG4gICAgICAgIGxpbmVzMCA9IHRleHQwLnNwbGl0ICdcXG4nXG4gICAgICAgIGxpbmVzMSA9IHRleHQxLnNwbGl0ICdcXG4nXG5cbiAgICBmb3IgaSBpbiBbMC4uM11cbiAgICAgICAgYmxvY2tzIGxpbmVzMFxuICAgICAgICAjIGJsb2NrcyBsaW5lczFcbiAgICAgICAgIyBsaW5lczAubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG4gICAgICAgIFxuICAgIGZvciBpIGluIFswLi4xNV1cbiAgICAgICAgXG4gICAgICAgIOKWuHByb2ZpbGUgJ2xpbmVzMCdcbiAgICAgICAgICAgIGJsb2NrcyBsaW5lczBcbiAgICAgICAgIyDilrhwcm9maWxlICdzeW50YXgwJ1xuICAgICAgICAgICAgIyBsaW5lczAubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG4gICAgICAgICAgICBcbiAgICAgICAgIyDilrhwcm9maWxlICdsaW5lczEnXG4gICAgICAgICAgICAjIGJsb2NrcyBsaW5lczFcbiAgICAgICAgIyDilrhwcm9maWxlICdzeW50YXgxJ1xuICAgICAgICAgICAgIyBsaW5lczEubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG4gICAgICAgICAgICBcbiMjI1xuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiMjI1xuXG7ilrh0ZXN0ICd0ZXN0J1xuXG4gICAgcmVxdWlyZSgna3hrJykuY2hhaSgpICAgIFxuIl19
//# sourceURL=../coffee/blocks.coffee