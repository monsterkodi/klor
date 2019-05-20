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
    var lineno, word;
''
    word = function(w) {
        if (Syntax.lang[ext].hasOwnProperty(w)) {
            return Syntax.lang[ext][w];
        } else {
            return 'text';
        }
    };
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
                            value: word(w)
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
                        value: word(w)
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
    var addValue, advance, beforeIndex, blockComment, chunk, chunkIndex, coffeeFunc, commentHeader, cppMacro, dashArrow, dict, ext, extStack, extTop, float, formatString, getChunk, getValue, getmatch, handl, handlers, hashComment, hnd, interpolation, j, jsFunc, k, len, len1, len2, line, mtch, n, noonComment, number, popExt, popStack, property, pushStack, ref1, ref2, ref3, ref4, ref5, ref6, ref7, regexp, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, topType, tripleString, turdChunk, xmlPunct;
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
        var next, prev, ref1, ref2;
        if (stackTop && topType !== 'interpolation') {
            return;
        }
        if ((ref1 = getmatch(-1)) === 'class' || ref1 === 'extends') {
            setValue(0, 'class');
            return 1;
        }
        if (chunk.value.startsWith('keyword')) {
            return;
        }
        if (chunk.match === '▸') {
            if (next = getChunk(1)) {
                if (next.start === chunk.start + 1 && ((ref2 = next.value) === 'text' || ref2 === 'keyword')) {
                    addValue(0, 'meta');
                    setValue(1, 'meta');
                    return 1;
                }
            }
        }
        if (prev = getChunk(-1)) {
            if (prev.value.startsWith('text')) {
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
                case '```':
                    return 'string backtick triple';
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
    formatString = function() {
        var type;
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
    number = function() {
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
            word: [coffeeFunc, commentHeader, number, property, stacked]
        },
        noon: {
            punct: [noonComment, stacked],
            word: [number, stacked]
        },
        json: {
            punct: [simpleString, dict, stacked],
            word: [number, jsFunc, stacked]
        },
        js: {
            punct: [slashComment, simpleString, dashArrow, regexp, stacked],
            word: [number, jsFunc, stacked]
        },
        ts: {
            punct: [slashComment, simpleString, dashArrow, regexp, stacked],
            word: [number, jsFunc, stacked]
        },
        md: {
            punct: [formatString, tripleString, simpleString, xmlPunct, stacked],
            word: [number, stacked]
        },
        iss: {
            punct: [slashComment, simpleString, stacked],
            word: [number, stacked]
        },
        ini: {
            punct: [slashComment, simpleString, cppMacro, stacked],
            word: [number, stacked]
        },
        cpp: {
            punct: [slashComment, simpleString, cppMacro, stacked],
            word: [number, float, stacked]
        },
        hpp: {
            punct: [slashComment, simpleString, cppMacro, stacked],
            word: [number, float, stacked]
        },
        c: {
            punct: [slashComment, simpleString, cppMacro, stacked],
            word: [number, float, stacked]
        },
        h: {
            punct: [slashComment, simpleString, cppMacro, stacked],
            word: [number, float, stacked]
        },
        sh: {
            punct: [hashComment, simpleString, shPunct, stacked],
            word: [number, stacked]
        },
        cs: {
            punct: [slashComment, simpleString, stacked],
            word: [number, stacked]
        },
        pug: {
            punct: [slashComment, simpleString, stacked],
            word: [number, stacked]
        },
        svg: {
            punct: [simpleString, xmlPunct, stacked],
            word: [number, stacked]
        },
        html: {
            punct: [simpleString, xmlPunct, stacked],
            word: [number, stacked]
        },
        htm: {
            punct: [simpleString, xmlPunct, stacked],
            word: [number, stacked]
        },
        styl: {
            punct: [slashComment, simpleString, stacked],
            word: [number, stacked]
        },
        css: {
            punct: [slashComment, simpleString, stacked],
            word: [number, stacked]
        },
        sass: {
            punct: [slashComment, simpleString, stacked],
            word: [number, stacked]
        },
        scss: {
            punct: [slashComment, simpleString, stacked],
            word: [number, stacked]
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
                value: chunk.value.replace('punct', 'punctuation')
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
                value: chunk.value.replace('punct', 'punctuation')
            };
            d.push(range);
        }
        diss.push(d);
    }
    return diss;
};

module.exports = {
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

;

;

;

;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFpQyxPQUFBLENBQVEsS0FBUixDQUFqQyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkI7O0FBRTNCLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxNQUFNLENBQUMsSUFBUCxDQUFBOztBQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQ0k7UUFBQSxHQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFXLEVBQUEsRUFBRyxJQUFkO1lBQW9CLE1BQUEsRUFBUSxDQUE1QjtTQUFkO0tBREo7SUFFQSxFQUFBLEVBQ0k7UUFBQSxZQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxRQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtTQUFkO1FBQ0EsVUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7U0FEZDtLQUhKOzs7QUFNSixLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQUNULEtBQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFRVCxPQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsR0FBUjtBQUVQLFFBQUE7QUFBQTtJQWtCQyxJQUFBLEdBQU8sU0FBQyxDQUFEO1FBQU8sSUFBRyxNQUFNLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBSSxDQUFDLGNBQWpCLENBQWdDLENBQWhDLENBQUg7bUJBQTBDLE1BQU0sQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUFLLENBQUEsQ0FBQSxFQUEzRDtTQUFBLE1BQUE7bUJBQW1FLE9BQW5FOztJQUFQO0lBRVAsTUFBQSxHQUFT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QUNBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FEYjtnQkFFQSxLQUFBLEVBQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFaLENBQW9CLE9BQXBCLEVBQTZCLGFBQTdCLENBRlA7O1lBR0osSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWO0FBTEo7QUFESjtXQU9BO0FBdkJLOztBQStCVCxPQUFBLEdBQVUsU0FBQyxLQUFEO0FBRU4sUUFBQTtJQUFBLElBQUEsR0FBTztBQUNQLFNBQUEsdUNBQUE7O1FBQ0ksQ0FBQSxHQUFJO0FBQ0o7QUFBQSxhQUFBLHdDQUFBOztZQUNJLEtBQUEsR0FDSTtnQkFBQSxLQUFBLEVBQU8sS0FBSyxDQUFDLEtBQWI7Z0JBQ0EsS0FBQSxFQUFPLEtBQUssQ0FBQyxLQURiO2dCQUVBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVosQ0FBb0IsT0FBcEIsRUFBNkIsYUFBN0IsQ0FGUDs7WUFHSixDQUFDLENBQUMsSUFBRixDQUFPLEtBQVA7QUFMSjtRQU1BLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBVjtBQVJKO1dBU0E7QUFaTTs7QUFvQlYsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLE1BQUEsRUFBUyxTQUFDLElBQUQsRUFBTyxHQUFQO2VBQWdCLE1BQUEsQ0FBTyxNQUFBLENBQU8sQ0FBQyxJQUFELENBQVAsRUFBZSxHQUFmLENBQVA7SUFBaEIsQ0FBVDtJQUNBLE9BQUEsRUFBUyxTQUFDLEtBQUQsRUFBUSxHQUFSO2VBQWdCLE9BQUEsQ0FBUSxNQUFBLENBQU8sS0FBUCxFQUFjLEdBQWQsQ0FBUjtJQUFoQixDQURUOzs7Ozs7QUFvQ0oiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgICBcbjAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICBcbiMjI1xuXG57IHNsYXNoLCBrc3RyLCBrbG9nLCBub29uLCBfIH0gPSByZXF1aXJlICdreGsnXG4gICAgICAgIFxuU3ludGF4ID0gcmVxdWlyZSAnLi9zeW50YXgnXG5TeW50YXguaW5pdCgpXG5cblN5bnRheC5zd3RjaCA9IFxuICAgIGNvZmZlZTogXG4gICAgICAgIGRvYzogICAgICAgICAgdHVyZDon4pa4JyAgIHRvOidtZCcgIGluZGVudDogMVxuICAgIG1kOiAgICAgXG4gICAgICAgIGNvZmZlZXNjcmlwdDogdHVyZDonYGBgJyB0bzonY29mZmVlJyBlbmQ6J2BgYCdcbiAgICAgICAgamF2YXNjcmlwdDogICB0dXJkOidgYGAnIHRvOidqcycgICAgIGVuZDonYGBgJ1xuICAgICAgICAgICAgXG5TUEFDRSAgPSAvXFxzL1xuSEVBREVSID0gL14wKyQvXG5QVU5DVCAgPSAvXFxXKy9naVxuTlVNQkVSID0gL15cXGQrJC9cbkZMT0FUICA9IC9eXFxkK2YkL1xuSEVYTlVNID0gL14weFthLWZBLUZcXGRdKyQvXG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5jaHVua2VkID0gKGxpbmVzLCBleHQpIC0+ICAgIFxuXG4gICAg4pa4ZG9jICdjaHVua2VkICpsaW5lcyosICpleHQqJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGFycmF5IG9mXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAgc1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxlbmd0aDogblxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBleHQ6ICAgIHNcbiAgICAgICAgICAgIGNoYXJzOiAgblxuICAgICAgICAgICAgaW5kZXg6ICBuXG4gICAgICAgICAgICBudW1iZXI6IG4rMVxuICAgIFxuICAgIHdvcmQgPSAodykgLT4gaWYgU3ludGF4LmxhbmdbZXh0XS5oYXNPd25Qcm9wZXJ0eSB3IHRoZW4gU3ludGF4LmxhbmdbZXh0XVt3XSBlbHNlICd0ZXh0J1xuICAgIFxuICAgIGxpbmVubyA9IDBcbiAgICBsaW5lcy5tYXAgKHRleHQpIC0+IFxuICAgICAgICBcbiAgICAgICAgbGluZSA9IFxuICAgICAgICAgICAgY2h1bmtzOiBbXVxuICAgICAgICAgICAgY2hhcnM6ICAwXG4gICAgICAgICAgICBpbmRleDogIGxpbmVubysrXG4gICAgICAgICAgICBudW1iZXI6IGxpbmVub1xuICAgICAgICAgICAgZXh0OiAgICBleHRcblxuICAgICAgICBjaHVua3MgPSB0ZXh0LnNwbGl0IFNQQUNFXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVua3MubGVuZ3RoID09IDEgYW5kIGNodW5rc1swXSA9PSAnJ1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUgIyBlbXB0eSBsaW5lXG4gICAgICAgICAgICBcbiAgICAgICAgYyA9IDBcbiAgICAgICAgZm9yIHMgaW4gY2h1bmtzXG4gICAgICAgICAgICBpZiBzID09ICcnXG4gICAgICAgICAgICAgICAgYysrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gYysrXG4gICAgICAgICAgICAgICAgbCA9IHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgc2MgPSBjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBzZXBlcmF0ZSBieSBwdW5jdHVhdGlvblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSBQVU5DVC5leGVjIHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIG0uaW5kZXggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB3bCA9IG0uaW5kZXgtKGMtc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICB3ID0gc1tjLXNjLi4ubS5pbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOndsLCBtYXRjaDp3LCB2YWx1ZTp3b3JkIHcgXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHB1bmN0ID0gbVswXVxuICAgICAgICAgICAgICAgICAgICBmb3IgcGMgaW4gcHVuY3RbLi4uLTFdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMrKywgbGVuZ3RoOjEsIG1hdGNoOnBjLCB0dXJkOnR1cmQsIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHR1cmQgPSB0dXJkWzEuLl1cbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjKyssIGxlbmd0aDoxLCBtYXRjaDpwdW5jdFstMV0sIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjIDwgc2MrbCAgICAgICAgIyBjaGVjayBmb3IgcmVtYWluaW5nIG5vbi1wdW5jdFxuICAgICAgICAgICAgICAgICAgICBybCA9IHNjK2wtYyAgICAjIGxlbmd0aCBvZiByZW1haW5kZXJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHNbbC1ybC4uXSAgIyB0ZXh0ICAgb2YgcmVtYWluZGVyIFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDpybCwgbWF0Y2g6dywgdmFsdWU6d29yZCB3XG4gICAgICAgICAgICAgICAgICAgIGMgKz0gcmxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmUuY2h1bmtzWy0xXVxuICAgICAgICAgICAgbGluZS5jaGFycyA9IGxhc3Quc3RhcnQgKyBsYXN0Lmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgIGxpbmVcbiAgICAgICAgXG4jIyNcbjAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG5ibG9ja2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tlZCAqbGluZXMqJ1xuICAgICAgICBcbiAgICAgICAgKmxpbmVzKjogIGFycmF5IG9mIGNodW5rZWQgbGluZXNcbiAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGxpbmVzIHdpdGggXG4gICAgICAgIC0gJ2V4dCcgc3dpdGNoZWQgaW4gc29tZSBsaW5lc1xuICAgICAgICAtICd2YWx1ZScgY2hhbmdlZCBpbiBjaHVua3MgdGhhdCBtYXRjaCBsYW5ndWFnZSBwYXR0ZXJuc1xuICAgICAgICAgIFxuICAgIGV4dFN0YWNrICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBbXVxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIGV4dFRvcCAgICAgPSBudWxsXG4gICAgc3RhY2tUb3AgICA9IG51bGxcbiAgICB0b3BUeXBlICAgID0gJydcbiAgICBleHQgICAgICAgID0gJydcbiAgICBsaW5lICAgICAgID0gbnVsbFxuICAgIGNodW5rICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGhhc2hDb21tZW50ID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgc3RhY2tUb3BcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIGNvbW1lbnQnXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICBmb3IgYyBpbiBsaW5lLmNodW5rc1tjaHVua0luZGV4KzEuLl1cbiAgICAgICAgICAgICAgICAgICAgYy52YWx1ZSA9ICdjb21tZW50J1xuICAgICAgICAgICAgICAgICAgICBpZiBIRUFERVIudGVzdCBjLm1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBjLnZhbHVlICs9ICcgaGVhZGVyJ1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUuY2h1bmtzLmxlbmd0aCAtIGNodW5rSW5kZXggKyAxXG5cbiAgICBub29uQ29tbWVudCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIHN0YWNrVG9wXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIiBhbmQgY2h1bmtJbmRleCA9PSAwICMgdGhlIG9ubHkgZGlmZmVyZW5jZS4gbWVyZ2Ugd2l0aCBoYXNoQ29tbWVudD9cbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgY29tbWVudCdcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGgtMVxuICAgICAgICAgICAgICAgIGZvciBjIGluIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMS4uXVxuICAgICAgICAgICAgICAgICAgICBjLnZhbHVlID0gJ2NvbW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gbGluZS5jaHVua3MubGVuZ3RoIC0gY2h1bmtJbmRleCArIDFcbiAgICAgICAgXG4gICAgc2xhc2hDb21tZW50ID0gLT5cbiAgICBcbiAgICBibG9ja0NvbW1lbnQgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICAgICAgXG4gICAgICAgIHR5cGUgPSAnY29tbWVudCB0cmlwbGUnIFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIHRvcFR5cGUgYW5kIHRvcFR5cGUgbm90IGluIFsnaW50ZXJwb2xhdGlvbicsIHR5cGVdXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkWy4uMl0gPT0gJyMjIydcbiAgICAgICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMSwgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMiwgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDMgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcbiAgICBcbiAgICBkYXNoQXJyb3cgPSAtPlxuXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJy0+J1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2Z1bmN0aW9uIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleScgb3IgbGluZS5jaHVua3NbMF0udHVyZCA9PSAnQDonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJz0+J1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2Z1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgXG4gICAgY29tbWVudEhlYWRlciA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09ICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgIGlmIEhFQURFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGNvZmZlZUZ1bmMgPSAtPiAgICAgICAgXG5cbiAgICAgICAgcmV0dXJuIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICBcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpIGluIFsnY2xhc3MnLCAnZXh0ZW5kcyddXG4gICAgICAgICAgICBzZXRWYWx1ZSAwLCAnY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGNodW5rLnZhbHVlLnN0YXJ0c1dpdGggJ2tleXdvcmQnXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAn4pa4J1xuICAgICAgICAgICAgaWYgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgICAgICBpZiBuZXh0LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzEgYW5kIG5leHQudmFsdWUgaW4gWyd0ZXh0JywgJ2tleXdvcmQnXVxuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCAnbWV0YSdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgMSwgJ21ldGEnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxICMgZ2l2ZSBzd2l0Y2ggYSBjaGFuY2VcbiAgICAgICAgXG4gICAgICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCAndGV4dCdcbiAgICAgICAgICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnPSdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCBjaHVuay5zdGFydFxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2Z1bmN0aW9uIGNhbGwnIFxuICAgICAgICAwICMgd2UgbmVlZCB0aGlzIGhlcmVcbiAgICBcbiAgICBwcm9wZXJ0eSA9IC0+XG4gICAgICAgICAgICBcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEsICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIHNldFZhbHVlIDAsICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIGlmIHByZXZQcmV2ID0gZ2V0Q2h1bmsgLTJcbiAgICAgICAgICAgICAgICBpZiBwcmV2UHJldi52YWx1ZSBub3QgaW4gWydwcm9wZXJ0eScsICdudW1iZXInXVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ29iaidcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgIGpzRnVuYyA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay52YWx1ZSA9PSAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnPScgYW5kIGdldFZhbHVlKC0yKS5zdGFydHNXaXRoICd0ZXh0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnZnVuY3Rpb24nXG4gICAgICAgIDAgIyB3ZSBuZWVkIHRoaXMgaGVyZVxuICAgICAgICBcbiAgICBkaWN0ID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICc6JyBhbmQgbm90IGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggJzo6J1xuICAgICAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICAgICAgaWYgcHJldi52YWx1ZS5zcGxpdCgnICcpWzBdIGluIFsnc3RyaW5nJywgJ251bWJlcicsICd0ZXh0JywgJ2tleXdvcmQnXVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIHJlZ2V4cCA9IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgdG9wVHlwZSA9PSAnc3RyaW5nJ1xuXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyByZWdleHAgZW5kJ1xuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCBcbiAgICAgICAgICAgICAgICBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgKzFcbiAgICAgICAgICAgICAgICBpZiBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgIGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPiAgY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPT0gY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gIFxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6J3JlZ2V4cCdcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgcmVnZXhwIHN0YXJ0J1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzaW1wbGVTdHJpbmcgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoIGluIFsnXCInIFwiJ1wiICdgJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbY2h1bmtJbmRleC0xXT8uZXNjYXBlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLm1hdGNoIFxuICAgICAgICAgICAgICAgIHdoZW4gJ1wiJyB0aGVuICdzdHJpbmcgZG91YmxlJyBcbiAgICAgICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICAgICAgd2hlbiAnYCcgdGhlbiAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgZWxzZSBpZiBzdGFja1RvcCBhbmQgdG9wVHlwZSAhPSAnaW50ZXJwb2xhdGlvbidcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnXFxcXCcgYW5kIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZydcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gMCBvciBub3QgbGluZS5jaHVua3NbY2h1bmtJbmRleC0xXS5lc2NhcGVcbiAgICAgICAgICAgICAgICBjaHVuay5lc2NhcGUgPSB0cnVlXG4gICAgICAgIDAgIyB3ZSBuZWVkIHRoaXMgaGVyZVxuXG4gICAgdHJpcGxlU3RyaW5nID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgICAgIHJldHVybiBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLnR1cmRbLi4yXVxuICAgICAgICAgICAgd2hlbiAnXCJcIlwiJyB0aGVuICdzdHJpbmcgZG91YmxlIHRyaXBsZScgXG4gICAgICAgICAgICB3aGVuIFwiJycnXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgICAgICB3aGVuICdgYGAnIHRoZW4gJ3N0cmluZyBiYWNrdGljayB0cmlwbGUnXG5cbiAgICAgICAgaWYgdHlwZVxuICAgICAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAyLCB0eXBlXG4gICAgICAgICAgICByZXR1cm4gM1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgZm9ybWF0U3RyaW5nID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJyoqJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gJ2JvbGQnXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgdG9wVHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDEsIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUsIHR5cGU6dHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMSwgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdpdGFsaWMnXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSwgdHlwZTp0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnYCdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdiYWNrdGljaydcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSwgdHlwZTp0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4gICAgXG4gICAgaW50ZXJwb2xhdGlvbiA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09ICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggXCJcXCN7XCJcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTonaW50ZXJwb2xhdGlvbicsIHdlYWs6dHJ1ZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAxLCAnc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiB0b3BUeXBlID09ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnfSdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCAnbWF0Y2ggaW50ZXJwb2xhdGlvbiBlbmQnXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgbnVtYmVyID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGdldG1hdGNoKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC00KSA9PSAnbnVtYmVyIGZsb2F0JyBhbmQgZ2V0VmFsdWUoLTIpID09ICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC00LCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXInXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEhFWE5VTS50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBoZXgnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBmbG9hdCA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBGTE9BVC50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgeG1sUHVuY3QgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJzwvJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2tleXdvcmQnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAna2V5d29yZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggaW4gWyc8Jyc+J11cbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdrZXl3b3JkJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgY3BwTWFjcm8gPSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnZGVmaW5lJ1xuICAgICAgICAgICAgc2V0VmFsdWUgMSwgJ2RlZmluZSdcbiAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDBcbiAgICBcbiAgICBzaFB1bmN0ID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcvJyBhbmQgZ2V0Q2h1bmsoLTEpPy5zdGFydCArIGdldENodW5rKC0xKT8ubGVuZ3RoID09IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSwgJ2RpcidcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkID09ICctLScgYW5kIGdldENodW5rKDIpPy5zdGFydCA9PSBjaHVuay5zdGFydCsyXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnYXJndW1lbnQnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnYXJndW1lbnQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAyLCAnYXJndW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gM1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICctJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdhcmd1bWVudCdcbiAgICAgICAgICAgIHNldFZhbHVlIDEsICdhcmd1bWVudCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgc3RhY2tlZCA9IC0+XG5cbiAgICAgICAgaWYgc3RhY2tUb3BcbiAgICAgICAgICAgIHJldHVybiBpZiBzdGFja1RvcC53ZWFrXG4gICAgICAgICAgICBpZiBzdGFja1RvcC5zdHJvbmdcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSA9IHRvcFR5cGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0b3BUeXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgIFxuICAgIHBvcEV4dCA9IC0+XG4gICAgICAgIHN0YWNrID0gZXh0VG9wLnN0YWNrXG4gICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN0YXJ0LmV4dFxuICAgICAgICBleHRTdGFjay5wb3AoKSAgICAgICAgICAgICAgIFxuICAgICAgICBleHRUb3AgPSBleHRTdGFja1stMV1cbiAgICBcbiAgICBwdXNoU3RhY2sgPSAobykgLT4gXG4gICAgICAgIHN0YWNrLnB1c2ggbyBcbiAgICAgICAgc3RhY2tUb3AgPSBvXG4gICAgICAgIHRvcFR5cGUgPSBvLnR5cGVcbiAgICAgICAgXG4gICAgcG9wU3RhY2sgPSAtPiBcbiAgICAgICAgc3RhY2sucG9wKClcbiAgICAgICAgc3RhY2tUb3AgPSBzdGFja1stMV1cbiAgICAgICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgICAgIFxuICAgIGdldENodW5rICA9IChkKSAtPiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdXG4gICAgc2V0VmFsdWUgID0gKGQsIHZhbHVlKSAtPiBpZiAwIDw9IGNodW5rSW5kZXgrZCA8IGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF0udmFsdWUgPSB2YWx1ZVxuICAgIGFkZFZhbHVlICA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlICs9ICcgJyArIHZhbHVlXG4gICAgZ2V0VmFsdWUgID0gKGQpIC0+IGdldENodW5rKGQpPy52YWx1ZSA/ICcnXG4gICAgZ2V0bWF0Y2ggPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/Lm1hdGNoID8gJydcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGhhbmRsZXJzID0gXG4gICAgICAgIGNvZmZlZTogXG4gICAgICAgICAgICAgICAgcHVuY3Q6IFsgYmxvY2tDb21tZW50LCBoYXNoQ29tbWVudCwgY29mZmVlRnVuYywgdHJpcGxlU3RyaW5nLCBzaW1wbGVTdHJpbmcsIGludGVycG9sYXRpb24sIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0LCBzdGFja2VkIF1cbiAgICAgICAgICAgICAgICB3b3JkOiAgWyBjb2ZmZWVGdW5jLCBjb21tZW50SGVhZGVyLCBudW1iZXIsIHByb3BlcnR5LCBzdGFja2VkIF1cbiAgICAgICAgbm9vbjogICBwdW5jdDogWyBub29uQ29tbWVudCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGpzb246ICAgcHVuY3Q6IFsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIGRpY3QsICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIGpzRnVuYywgICBzdGFja2VkXVxuICAgICAgICBqczogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCBqc0Z1bmMsICAgc3RhY2tlZF1cbiAgICAgICAgdHM6ICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwganNGdW5jLCAgIHN0YWNrZWRdXG4gICAgICAgIG1kOiAgICAgcHVuY3Q6IFsgZm9ybWF0U3RyaW5nLCB0cmlwbGVTdHJpbmcsIHNpbXBsZVN0cmluZywgeG1sUHVuY3QsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGlzczogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBpbmk6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybywgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgY3BwOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgZmxvYXQsICAgIHN0YWNrZWRdXG4gICAgICAgIGhwcDogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIGZsb2F0LCAgICBzdGFja2VkXVxuICAgICAgICBjOiAgICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybywgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCBmbG9hdCwgICAgc3RhY2tlZF1cbiAgICAgICAgaDogICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgZmxvYXQsICAgIHN0YWNrZWRdXG4gICAgICAgIHNoOiAgICAgcHVuY3Q6IFsgaGFzaENvbW1lbnQsICBzaW1wbGVTdHJpbmcsIHNoUHVuY3QsICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBjczogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgcHVnOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHN2ZzogICAgcHVuY3Q6IFsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0LCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBodG1sOiAgIHB1bmN0OiBbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgaHRtOiAgICBwdW5jdDogWyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QsICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHN0eWw6ICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBjc3M6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgc2FzczogICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHNjc3M6ICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBsb2c6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgdHh0OiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgIFxuICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgIGlmIGV4dFRvcC5zd2l0Y2guaW5kZW50IGFuZCBsaW5lLmNodW5rc1swXT8uc3RhcnQgPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5zdGFydFxuICAgICAgICAgICAgICAgIHBvcEV4dCgpICAgICAgICAgICAgICAgICAgICAgICAgIyBlbmQgb2YgZXh0ZW5zaW9uIGJsb2NrIHJlYWNoZWQgdGhhdCBpcyB0ZXJtaW5hdGVkIGJ5IGluZGVudGF0aW9uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3dpdGNoLnRvICAgICAjIG1ha2Ugc3VyZSB0aGUgY3VycmVudCBsaW5lIGV4dCBtYXRjaGVzIHRoZSB0b3Btb3N0IGZyb20gc3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZXh0ICE9IGxpbmUuZXh0ICAgICAgICAgICAgICAgICAgICAgICMgZWl0aGVyIGF0IHN0YXJ0IG9mIGZpbGUgb3Igd2Ugc3dpdGNoZWQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBoYW5kbCA9IGhhbmRsZXJzW2V4dCA9IGxpbmUuZXh0XSAgICAjIGluc3RhbGwgbmV3IGhhbmRsZXJzXG4gICAgICAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgd2hpbGUgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaHVuayA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXhdXG4gICAgICAgICAgICBiZWZvcmVJbmRleCA9IGNodW5rSW5kZXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmVuZD8gYW5kIGV4dFRvcC5zd2l0Y2guZW5kID09IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcEV4dCgpICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSB0dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLnB1bmN0ID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbXRjaCA9IFN5bnRheC5zd3RjaFtsaW5lLmV4dF0/W2NodW5rLm1hdGNoXSBcbiAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJkQ2h1bmsgPSBnZXRDaHVuayAtbXRjaC50dXJkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkID09ICh0dXJkQ2h1bms/LnR1cmQgPyB0dXJkQ2h1bms/Lm1hdGNoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcHVzaCBhIG5ldyBleHRlbnNpb24gb250byB0aGUgc3RhY2ssIGV4dCB3aWxsIGNoYW5nZSBvbiBzdGFydCBvZiBuZXh0IGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRTdGFjay5wdXNoIGV4dFRvcCA9IHN3aXRjaDptdGNoLCBzdGFydDpsaW5lLCBzdGFjazpzdGFja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBobmQgaW4gaGFuZGwud29yZCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4ID09IGJlZm9yZUluZGV4XG4gICAgICAgICAgICAgICAgY2h1bmtJbmRleCsrXG4gICAgbGluZXNcbiAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxuYmxvY2tzID0gKGxpbmVzLCBleHQ9J2NvZmZlZScpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdibG9ja3MgKmxpbmVzKiwgKmV4dConXG5cbiAgICAgICAgKmxpbmVzKjogIGFycmF5IG9mIHN0cmluZ3NcbiAgICAgICAgXG4gICAgICAgICpleHQqOlxuICAgICAgICAtIGtvZmZlZSBjb2ZmZWUganMgdHMgXG4gICAgICAgIC0gc3R5bCBjc3Mgc2FzcyBzY3NzIFxuICAgICAgICAtIHB1ZyBodG1sIGh0bSBzdmcgXG4gICAgICAgIC0gY3BwIGhwcCBjeHggYyBoIFxuICAgICAgICAtIGJhc2ggZmlzaCBzaCBcbiAgICAgICAgLSBub29uIGpzb25cbiAgICAgICAgLSBtZCBwbGlzdCBcbiAgICAgICAgLSBpc3MgaW5pXG4gICAgICAgIC0gdHh0IGxvZyBcblxuICAgICAgICAqKnJldHVybnMqKiB0aGUgcmVzdWx0IG9mXG4gICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuICAgICAgICBgYGBcblxuICAgIGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG4gICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbnJhbmdlZCA9IChsaW5lcykgLT5cbiAgICBcbiAgICDilrhkb2MgJ3JhbmdlZCAqbGluZXMqJ1xuICAgICAgICBcbiAgICAgICAgKmxpbmVzKjogIGFycmF5IG9mIGNodW5rZWQgbGluZXNcbiAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGFycmF5IG9mXG5cbiAgICAgICAgICAgIHN0YXJ0OiBuXG4gICAgICAgICAgICBtYXRjaDogc1xuICAgICAgICAgICAgdmFsdWU6IHNcbiAgICAgICAgXG4gICAgcm5ncyA9IFtdXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcbiAgICAgICAgZm9yIGNodW5rIGluIGxpbmUuY2h1bmtzXG4gICAgICAgICAgICByYW5nZSA9XG4gICAgICAgICAgICAgICAgc3RhcnQ6IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICAgICAgbWF0Y2g6IGNodW5rLm1hdGNoXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNodW5rLnZhbHVlLnJlcGxhY2UgJ3B1bmN0JywgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgcm5ncy5wdXNoIHJhbmdlXG4gICAgcm5nc1xuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuXG5kaXNzZWN0ID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIGRpc3MgPSBbXVxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIGQgPSBbXVxuICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgIHJhbmdlID1cbiAgICAgICAgICAgICAgICBzdGFydDogY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICBtYXRjaDogY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2h1bmsudmFsdWUucmVwbGFjZSAncHVuY3QnLCAncHVuY3R1YXRpb24nXG4gICAgICAgICAgICBkLnB1c2ggcmFuZ2VcbiAgICAgICAgZGlzcy5wdXNoIGRcbiAgICBkaXNzXG4gICAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICByYW5nZXM6ICAobGluZSwgZXh0KSAgLT4gcmFuZ2VkIGJsb2NrcyBbbGluZV0sIGV4dFxuICAgIGRpc3NlY3Q6IChsaW5lcywgZXh0KSAtPiBkaXNzZWN0IGJsb2NrcyBsaW5lcywgZXh0XG4gICAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG7ilrh0ZXN0ICdwcm9maWxlJ1xuICAgIFxuICAgIOKWuHByb2ZpbGUgJy0tLS0tJ1xuICAgICAgICBcbiAgICAgICAgdGV4dDAgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvY29mZmVlL25vZGVzLmNvZmZlZVwiICMgNi0xMW1zXG4gICAgICAgIHRleHQxID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vdGVzdC5jb2ZmZWVcIiAjIDUwLTEyMM68c1xuICAgIFxuICAgICAgICBsaW5lczAgPSB0ZXh0MC5zcGxpdCAnXFxuJ1xuICAgICAgICBsaW5lczEgPSB0ZXh0MS5zcGxpdCAnXFxuJ1xuXG4gICAgZm9yIGkgaW4gWzAuLjNdXG4gICAgICAgIGJsb2NrcyBsaW5lczBcbiAgICAgICAgIyBibG9ja3MgbGluZXMxXG4gICAgICAgICMgbGluZXMwLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAnY29mZmVlJ1xuICAgICAgICBcbiAgICBmb3IgaSBpbiBbMC4uMTVdXG4gICAgICAgIFxuICAgICAgICDilrhwcm9maWxlICdsaW5lczAnXG4gICAgICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgICAgICMg4pa4cHJvZmlsZSAnc3ludGF4MCdcbiAgICAgICAgICAgICMgbGluZXMwLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAnY29mZmVlJ1xuICAgICAgICAgICAgXG4gICAgICAgICMg4pa4cHJvZmlsZSAnbGluZXMxJ1xuICAgICAgICAgICAgIyBibG9ja3MgbGluZXMxXG4gICAgICAgICMg4pa4cHJvZmlsZSAnc3ludGF4MSdcbiAgICAgICAgICAgICMgbGluZXMxLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAnY29mZmVlJ1xuICAgICAgICAgICAgXG4jIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4jIyNcblxu4pa4dGVzdCAnY29tbWVudCdcblxuICAgIHJlcXVpcmUoJ2t4aycpLmNoYWkoKVxuICAgIFxuICAgIGJsb2NrcyhbXCIjI1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCcgdHVyZDpcIiMjXCJ9IFxuICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgXV1cblxuICAgIGJsb2NrcyhbXCIsI2FcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6XCIsXCIgdmFsdWU6J3B1bmN0JyB0dXJkOiBcIiwjXCJ9IFxuICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50J30gXG4gICAgICAgICAgICAgICAge3N0YXJ0OjIgbGVuZ3RoOjEgbWF0Y2g6XCJhXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnZnVuY3Rpb24nXG5cbiAgICBibG9ja3MoWyctPiddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOictJyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDogJy0+J30gXG4gICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICBibG9ja3MoWyc9PiddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICBibG9ja3MoWydmPS0+MSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6NSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOidmJyB2YWx1ZTonZnVuY3Rpb24nfSBcbiAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDonPScgdmFsdWU6J3B1bmN0JyAgICAgICAgICAgICAgIHR1cmQ6Jz0tPicgfSBcbiAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6Jy0+J30gXG4gICAgICAgICAgICAgICAge3N0YXJ0OjMgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAge3N0YXJ0OjQgbGVuZ3RoOjEgbWF0Y2g6JzEnIHZhbHVlOidudW1iZXInfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnbWluaW1hbCdcbiAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoWycxJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6JzEnIHZhbHVlOidudW1iZXInfSBdXVxuICAgIGJsb2NrcyhbJ2EnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3RleHQnfSBdXVxuICAgIGJsb2NrcyhbJy4nXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonLicgdmFsdWU6J3B1bmN0J30gXV1cblxuICAgIGJsb2NrcyhbJzEuYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICB7c3RhcnQ6MCAgbGVuZ3RoOjEgbWF0Y2g6JzEnIHZhbHVlOidudW1iZXInfSBcbiAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QgcHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAge3N0YXJ0OjIgIGxlbmd0aDoxIG1hdGNoOidhJyB2YWx1ZToncHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgXG4gICAgYmxvY2tzKFsnKythJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDonKycgdmFsdWU6J3B1bmN0JywgdHVyZDonKysnfSBcbiAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDoxIG1hdGNoOicrJyB2YWx1ZToncHVuY3QnfSBcbiAgICAgICAgICAgICAgICAge3N0YXJ0OjIgIGxlbmd0aDoxIG1hdGNoOidhJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoW1wi4pa4ZG9jICdoZWxsbydcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxMiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOifilrgnICAgICB2YWx1ZToncHVuY3QgbWV0YSd9IFxuICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDozIG1hdGNoOidkb2MnICAgdmFsdWU6J21ldGEnfSBcbiAgICAgICAgICAgICAgICAgIHtzdGFydDo1ICBsZW5ndGg6MSBtYXRjaDpcIidcIiAgICAgdmFsdWU6J3B1bmN0IG1hdGNoIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAge3N0YXJ0OjYgIGxlbmd0aDo1IG1hdGNoOlwiaGVsbG9cIiB2YWx1ZTonbWF0Y2ggc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICB7c3RhcnQ6MTEgbGVuZ3RoOjEgbWF0Y2g6XCInXCIgICAgIHZhbHVlOidwdW5jdCBtYXRjaCBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICBcbuKWuHRlc3QgJ3NwYWNlJ1xuXG4gICAgYiA9IGJsb2NrcyBbXCJ4XCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAwXG5cbiAgICBiID0gYmxvY2tzIFtcIiB4eFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgMVxuICAgIFxuICAgIGIgPSBibG9ja3MgW1wiICAgIHh4eFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuXG4gICAgYiA9IGJsb2NrcyBbXCIgICAgeCAxICAsIFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgIGJbMF0uY2h1bmtzWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNlxuICAgIGJbMF0uY2h1bmtzWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgOVxuXG7ilrh0ZXN0ICdzd2l0Y2hlcydcbiAgICBcbiAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgeCAgICBcbiAgICAgICAgICAgIHlcbiAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG5cbiAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgeCAgXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgeVxuICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG5cbiAgICBiID0gYmxvY2tzIFwiXCJcIiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0ICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAxKzEgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAg4pa4ZG9jICdhZ2FpbicgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWUgKipkb2NzKiogICAgIFxuICAgICAgICAgICAgYGBgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHkgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbicgICAgICAgICAgICAgICBcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzddLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzhdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgXG4gICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAg4pa4ZG9vYyAnaGVsbG8nXG4gICAgICAgICAgICB4ICBcbiAgICAgICAgXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcblxuICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgMSsxXG4gICAgICAgIGBgYFxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgICAgICAxKzE7XG4gICAgICAgIGBgYFxuICAgICAgICBcIlwiXCIuc3BsaXQoJ1xcbicpLCAnbWQnXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2pzJ1xuICAgIFxuIl19
//# sourceURL=../coffee/blocks.coffee