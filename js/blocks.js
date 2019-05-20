// koffee 0.43.0

/*
0000000    000       0000000    0000000  000   000   0000000    
000   000  000      000   000  000       000  000   000         
0000000    000      000   000  000       0000000    0000000     
000   000  000      000   000  000       000  000        000    
0000000    0000000   0000000    0000000  000   000  0000000
 */
var FLOAT, HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, blocked, blocks, chunked, dissect, klog, kstr, noon, ranged, ref, slash;

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
    var addValue, advance, beforeIndex, blockComment, chunk, chunkIndex, coffeeFunc, coffeeWord, cppMacro, dashArrow, dict, ext, extStack, extTop, float, formatString, getChunk, getValue, getmatch, handl, handlers, hashComment, hnd, interpolation, j, jsFunc, k, len, len1, len2, line, mtch, n, noonComment, number, popExt, popStack, pushStack, ref1, ref2, ref3, ref4, ref5, ref6, ref7, regexp, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, topType, tripleString, turdChunk, xmlPunct;
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
            return 0;
        }
        if (chunk.match === "#") {
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
        return 0;
    };
    noonComment = function() {
        var c, j, len, ref1;
        if (stackTop) {
            return 0;
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
        return 0;
    };
    slashComment = function() {
        return 0;
    };
    blockComment = function() {
        var type;
        if (!chunk.turd || chunk.turd.length < 3) {
            return 0;
        }
        type = 'comment triple';
        if (topType && (topType !== 'interpolation' && topType !== type)) {
            return 0;
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
        return 0;
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
        return 0;
    };
    coffeeWord = function() {
        var prevPrev, prevmatch, ref1;
        prevmatch = getmatch(-1);
        if (prevmatch === 'class' || prevmatch === 'extends') {
            setValue(0, 'class');
            return 1;
        }
        if (prevmatch === '.') {
            addValue(-1, 'property');
            setValue(0, 'property');
            if (prevPrev = getChunk(-2)) {
                if ((ref1 = prevPrev.value) !== 'property' && ref1 !== 'number') {
                    setValue(-2, 'obj');
                }
            }
            return 1;
        }
        return 0;
    };
    coffeeFunc = function() {
        var next, prev, ref1;
        if (stackTop && topType !== 'interpolation') {
            return 0;
        }
        if (chunk.value.startsWith('keyword')) {
            return 0;
        }
        if (chunk.match === '▸') {
            if (next = getChunk(1)) {
                if (next.start === chunk.start + 1 && ((ref1 = next.value) === 'text' || ref1 === 'keyword')) {
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
        return 0;
    };
    regexp = function() {
        var next, prev;
        if (topType === 'string') {
            return 0;
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
                        return 0;
                    }
                    if ((prev.start + prev.length === chunk.start) && (next != null ? next.start : void 0) === chunk.start + 1) {
                        return 0;
                    }
                }
            }
            pushStack({
                type: 'regexp'
            });
            chunk.value += ' regexp start';
            return 1;
        }
        return 0;
    };
    simpleString = function() {
        var ref1, ref2, type;
        if (topType === 'regexp') {
            return 0;
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
            return 0;
        }
        if (topType === 'regexp') {
            return 0;
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
        return 0;
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
        return 0;
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
        return 0;
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
        return 0;
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
        return 0;
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
        return 0;
    };
    cppMacro = function() {
        if (chunk.match === "#") {
            addValue(0, 'define');
            setValue(1, 'define');
            return 2;
        }
        return 0;
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
        return 0;
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
        return 0;
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
            word: [coffeeFunc, number, coffeeWord, stacked]
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
            range.clss = range.value;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUFpQyxPQUFBLENBQVEsS0FBUixDQUFqQyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkI7O0FBRTNCLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxNQUFNLENBQUMsSUFBUCxDQUFBOztBQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQ0k7UUFBQSxHQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFXLEVBQUEsRUFBRyxJQUFkO1lBQW9CLE1BQUEsRUFBUSxDQUE1QjtTQUFkO0tBREo7SUFFQSxFQUFBLEVBQ0k7UUFBQSxZQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxRQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtTQUFkO1FBQ0EsVUFBQSxFQUFjO1lBQUEsSUFBQSxFQUFLLEtBQUw7WUFBVyxFQUFBLEVBQUcsSUFBZDtZQUF1QixHQUFBLEVBQUksS0FBM0I7U0FEZDtLQUhKOzs7QUFNSixLQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQVFULE9BQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxHQUFSO0FBRVAsUUFBQTtBQUFBO0lBa0JDLElBQUEsR0FBTyxTQUFDLENBQUQ7UUFBTyxJQUFHLE1BQU0sQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUFJLENBQUMsY0FBakIsQ0FBZ0MsQ0FBaEMsQ0FBSDttQkFBMEMsTUFBTSxDQUFDLElBQUssQ0FBQSxHQUFBLENBQUssQ0FBQSxDQUFBLEVBQTNEO1NBQUEsTUFBQTttQkFBbUUsT0FBbkU7O0lBQVA7SUFFUCxNQUFBLEdBQVM7V0FDVCxLQUFLLENBQUMs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LENBQVUsS0FBVjtBQUxKO0FBREo7V0FPQTtBQXZCSzs7QUErQlQsT0FBQSxHQUFVLFNBQUMsS0FBRDtBQUVOLFFBQUE7SUFBQSxJQUFBLEdBQU87QUFDUCxTQUFBLHVDQUFBOztRQUNJLENBQUEsR0FBSTtBQUNKO0FBQUEsYUFBQSx3Q0FBQTs7WUFDSSxLQUFBLEdBQ0k7Z0JBQUEsS0FBQSxFQUFPLEtBQUssQ0FBQyxLQUFiO2dCQUNBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FEYjtnQkFFQSxLQUFBLEVBQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFaLENBQW9CLE9BQXBCLEVBQTZCLGFBQTdCLENBRlA7O1lBR0osS0FBSyxDQUFDLElBQU4sR0FBYSxLQUFLLENBQUM7WUFDbkIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQO0FBTko7UUFPQSxJQUFJLENBQUMsSUFBTCxDQUFVLENBQVY7QUFUSjtXQVVBO0FBYk07O0FBcUJWLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQVMsU0FBQyxJQUFELEVBQU8sR0FBUDtlQUFnQixNQUFBLENBQU8sTUFBQSxDQUFPLENBQUMsSUFBRCxDQUFQLEVBQWUsR0FBZixDQUFQO0lBQWhCLENBQVQ7SUFDQSxPQUFBLEVBQVMsU0FBQyxLQUFELEVBQVEsR0FBUjtlQUFnQixPQUFBLENBQVEsTUFBQSxDQUFPLEtBQVAsRUFBYyxHQUFkLENBQVI7SUFBaEIsQ0FEVDs7Ozs7O0FBb0NKIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgXG4jIyNcblxueyBzbGFzaCwga3N0ciwga2xvZywgbm9vbiwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuICAgICAgICBcblN5bnRheCA9IHJlcXVpcmUgJy4vc3ludGF4J1xuU3ludGF4LmluaXQoKVxuXG5TeW50YXguc3d0Y2ggPSBcbiAgICBjb2ZmZWU6IFxuICAgICAgICBkb2M6ICAgICAgICAgIHR1cmQ6J+KWuCcgICB0bzonbWQnICBpbmRlbnQ6IDFcbiAgICBtZDogICAgIFxuICAgICAgICBjb2ZmZWVzY3JpcHQ6IHR1cmQ6J2BgYCcgdG86J2NvZmZlZScgZW5kOidgYGAnXG4gICAgICAgIGphdmFzY3JpcHQ6ICAgdHVyZDonYGBgJyB0bzonanMnICAgICBlbmQ6J2BgYCdcbiAgICAgICAgICAgIFxuU1BBQ0UgID0gL1xccy9cblBVTkNUICA9IC9cXFcrL2dpXG5OVU1CRVIgPSAvXlxcZCskL1xuRkxPQVQgID0gL15cXGQrZiQvXG5IRVhOVU0gPSAvXjB4W2EtZkEtRlxcZF0rJC9cblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbmNodW5rZWQgPSAobGluZXMsIGV4dCkgLT4gICAgXG5cbiAgICDilrhkb2MgJ2NodW5rZWQgKmxpbmVzKiwgKmV4dConXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaDogc1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICBzXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogblxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIGV4dDogICAgc1xuICAgICAgICAgICAgY2hhcnM6ICBuXG4gICAgICAgICAgICBpbmRleDogIG5cbiAgICAgICAgICAgIG51bWJlcjogbisxXG4gICAgXG4gICAgd29yZCA9ICh3KSAtPiBpZiBTeW50YXgubGFuZ1tleHRdLmhhc093blByb3BlcnR5IHcgdGhlbiBTeW50YXgubGFuZ1tleHRdW3ddIGVsc2UgJ3RleHQnXG4gICAgXG4gICAgbGluZW5vID0gMFxuICAgIGxpbmVzLm1hcCAodGV4dCkgLT4gXG4gICAgICAgIFxuICAgICAgICBsaW5lID0gXG4gICAgICAgICAgICBjaHVua3M6IFtdXG4gICAgICAgICAgICBjaGFyczogIDBcbiAgICAgICAgICAgIGluZGV4OiAgbGluZW5vKytcbiAgICAgICAgICAgIG51bWJlcjogbGluZW5vXG4gICAgICAgICAgICBleHQ6ICAgIGV4dFxuXG4gICAgICAgIGNodW5rcyA9IHRleHQuc3BsaXQgU1BBQ0VcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICByZXR1cm4gbGluZSAjIGVtcHR5IGxpbmVcbiAgICAgICAgICAgIFxuICAgICAgICBjID0gMFxuICAgICAgICBmb3IgcyBpbiBjaHVua3NcbiAgICAgICAgICAgIGlmIHMgPT0gJydcbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBjKytcbiAgICAgICAgICAgICAgICBsID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzYyA9IGNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIHNlcGVyYXRlIGJ5IHB1bmN0dWF0aW9uXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hpbGUgbSA9IFBVTkNULmV4ZWMgc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5pbmRleCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdsID0gbS5pbmRleC0oYy1zYylcbiAgICAgICAgICAgICAgICAgICAgICAgIHcgPSBzW2Mtc2MuLi5tLmluZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6d2wsIG1hdGNoOncsIHZhbHVlOndvcmQgdyBcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gd2xcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0dXJkID0gcHVuY3QgPSBtWzBdXG4gICAgICAgICAgICAgICAgICAgIGZvciBwYyBpbiBwdW5jdFsuLi4tMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YysrLCBsZW5ndGg6MSwgbWF0Y2g6cGMsIHR1cmQ6dHVyZCwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHR1cmRbMS4uXVxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMrKywgbGVuZ3RoOjEsIG1hdGNoOnB1bmN0Wy0xXSwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXIgXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOnJsLCBtYXRjaDp3LCB2YWx1ZTp3b3JkIHdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoXG4gICAgICAgICAgICBsYXN0ID0gbGluZS5jaHVua3NbLTFdXG4gICAgICAgICAgICBsaW5lLmNoYXJzID0gbGFzdC5zdGFydCArIGxhc3QubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgbGluZVxuICAgICAgICBcbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbmJsb2NrZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdibG9ja2VkICpsaW5lcyonXG4gICAgICAgIFxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogbGluZXMgd2l0aCBcbiAgICAgICAgLSAnZXh0JyBzd2l0Y2hlZCBpbiBzb21lIGxpbmVzXG4gICAgICAgIC0gJ3ZhbHVlJyBjaGFuZ2VkIGluIGNodW5rcyB0aGF0IG1hdGNoIGxhbmd1YWdlIHBhdHRlcm5zXG4gICAgICAgICAgXG4gICAgZXh0U3RhY2sgICA9IFtdXG4gICAgc3RhY2sgICAgICA9IFtdXG4gICAgaGFuZGwgICAgICA9IFtdXG4gICAgZXh0VG9wICAgICA9IG51bGxcbiAgICBzdGFja1RvcCAgID0gbnVsbFxuICAgIHRvcFR5cGUgICAgPSAnJ1xuICAgIGV4dCAgICAgICAgPSAnJ1xuICAgIGxpbmUgICAgICAgPSBudWxsXG4gICAgY2h1bmsgICAgICA9IG51bGxcbiAgICBjaHVua0luZGV4ID0gMFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaGFzaENvbW1lbnQgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAwIGlmIHN0YWNrVG9wXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSBcIiNcIlxuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyBjb21tZW50J1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgZm9yIGMgaW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCsxLi5dXG4gICAgICAgICAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgIHJldHVybiBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgMVxuICAgICAgICAwXG5cbiAgICBub29uQ29tbWVudCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgc3RhY2tUb3BcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiIGFuZCBjaHVua0luZGV4ID09IDAgIyB0aGUgb25seSBkaWZmZXJlbmNlLiBtZXJnZSB3aXRoIGhhc2hDb21tZW50P1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyBjb21tZW50J1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgZm9yIGMgaW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCsxLi5dXG4gICAgICAgICAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgIHJldHVybiBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgIHNsYXNoQ29tbWVudCA9IC0+IDBcbiAgICBcbiAgICBibG9ja0NvbW1lbnQgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAwIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgICAgICBcbiAgICAgICAgdHlwZSA9ICdjb21tZW50IHRyaXBsZScgXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMCBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZFsuLjJdID09ICcjIyMnXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDIsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAzXG4gICAgICAgIDBcbiAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcbiAgICBcbiAgICBkYXNoQXJyb3cgPSAtPlxuXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJy0+J1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2Z1bmN0aW9uIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleScgb3IgbGluZS5jaHVua3NbMF0udHVyZCA9PSAnQDonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJz0+J1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2Z1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgMFxuICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY29mZmVlV29yZCA9IC0+XG4gICAgICAgIFxuICAgICAgICBwcmV2bWF0Y2ggPSBnZXRtYXRjaCgtMSlcbiAgICAgICAgaWYgcHJldm1hdGNoIGluIFsnY2xhc3MnLCAnZXh0ZW5kcyddXG4gICAgICAgICAgICBzZXRWYWx1ZSAwLCAnY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHByZXZtYXRjaCA9PSAnLidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xLCAncHJvcGVydHknXG4gICAgICAgICAgICBzZXRWYWx1ZSAwLCAncHJvcGVydHknXG4gICAgICAgICAgICBpZiBwcmV2UHJldiA9IGdldENodW5rIC0yXG4gICAgICAgICAgICAgICAgaWYgcHJldlByZXYudmFsdWUgbm90IGluIFsncHJvcGVydHknLCAnbnVtYmVyJ11cbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdvYmonXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG5cbiAgICBjb2ZmZWVGdW5jID0gLT4gICAgICAgIFxuXG4gICAgICAgIHJldHVybiAwIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICByZXR1cm4gMCBpZiBjaHVuay52YWx1ZS5zdGFydHNXaXRoICdrZXl3b3JkJ1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJ+KWuCdcbiAgICAgICAgICAgIGlmIG5leHQgPSBnZXRDaHVuayAxXG4gICAgICAgICAgICAgICAgaWYgbmV4dC5zdGFydCA9PSBjaHVuay5zdGFydCsxIGFuZCBuZXh0LnZhbHVlIGluIFsndGV4dCcsICdrZXl3b3JkJ11cbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ21ldGEnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIDEsICdtZXRhJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMSAjIGdpdmUgc3dpdGNoIGEgY2hhbmNlXG4gICAgICAgIFxuICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgXG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ3RleHQnXG4gICAgICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJz0nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdmdW5jdGlvbiBjYWxsJyBcbiAgICAgICAgMFxuICAgICAgICBcbiAgICBqc0Z1bmMgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudmFsdWUgPT0gJ2tleXdvcmQgZnVuY3Rpb24nXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJz0nIGFuZCBnZXRWYWx1ZSgtMikuc3RhcnRzV2l0aCAndGV4dCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ2Z1bmN0aW9uJ1xuICAgICAgICAwXG4gICAgICAgIFxuICAgIGRpY3QgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJzonIGFuZCBub3QgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCAnOjonXG4gICAgICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnNwbGl0KCcgJylbMF0gaW4gWydzdHJpbmcnLCAnbnVtYmVyJywgJ3RleHQnLCAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwLCAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICByZWdleHAgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgdG9wVHlwZSA9PSAnc3RyaW5nJ1xuXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyByZWdleHAgZW5kJ1xuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCBcbiAgICAgICAgICAgICAgICBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgICAgICBuZXh0ID0gZ2V0Q2h1bmsgKzFcbiAgICAgICAgICAgICAgICBpZiBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDAgaWYgKHByZXYuc3RhcnQrcHJldi5sZW5ndGggPCAgY2h1bmsuc3RhcnQpIGFuZCBuZXh0Py5zdGFydCA+ICBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoID09IGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidyZWdleHAnXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIHJlZ2V4cCBzdGFydCdcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzaW1wbGVTdHJpbmcgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggaW4gWydcIicgXCInXCIgJ2AnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tjaHVua0luZGV4LTFdPy5lc2NhcGVcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSBzd2l0Y2ggY2h1bmsubWF0Y2ggXG4gICAgICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnIFxuICAgICAgICAgICAgICAgIHdoZW4gXCInXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgICAgICB3aGVuICdgJyB0aGVuICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0eXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBlbHNlIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICdcXFxcJyBhbmQgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSAwIG9yIG5vdCBsaW5lLmNodW5rc1tjaHVua0luZGV4LTFdLmVzY2FwZVxuICAgICAgICAgICAgICAgIGNodW5rLmVzY2FwZSA9IHRydWVcbiAgICAgICAgMFxuXG4gICAgdHJpcGxlU3RyaW5nID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMCBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICAgICAgcmV0dXJuIDAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgdHlwZSA9IHN3aXRjaCBjaHVuay50dXJkWy4uMl1cbiAgICAgICAgICAgIHdoZW4gJ1wiXCJcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSB0cmlwbGUnIFxuICAgICAgICAgICAgd2hlbiBcIicnJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuICAgICAgICAgICAgd2hlbiAnYGBgJyB0aGVuICdzdHJpbmcgYmFja3RpY2sgdHJpcGxlJ1xuXG4gICAgICAgIGlmIHR5cGVcbiAgICAgICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMSwgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMiwgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDNcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgZm9ybWF0U3RyaW5nID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJyoqJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gJ2JvbGQnXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgdG9wVHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDEsIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcblxuICAgICAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUsIHR5cGU6dHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMSwgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnKidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdpdGFsaWMnXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSwgdHlwZTp0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnYCdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdiYWNrdGljaydcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSwgdHlwZTp0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBpbnRlcnBvbGF0aW9uID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCBcIlxcI3tcIlxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidpbnRlcnBvbGF0aW9uJywgd2Vhazp0cnVlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ3N0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDEsICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIHRvcFR5cGUgPT0gJ2ludGVycG9sYXRpb24nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoID09ICd9J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsICdtYXRjaCBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG51bWJlciA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBOVU1CRVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtNCkgPT0gJ251bWJlciBmbG9hdCcgYW5kIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtNCwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBIRVhOVU0udGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBmbG9hdCA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBGTE9BVC50ZXN0IGNodW5rLm1hdGNoXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJy4nXG5cbiAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMCAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAgICAgICBcbiAgICAjICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjICAwMDAgMDAwICAgMDAwIDAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICB4bWxQdW5jdCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnPC8nXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAna2V5d29yZCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsICdrZXl3b3JkJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCBpbiBbJzwnJz4nXVxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2tleXdvcmQnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICBcbiAgICBcbiAgICBjcHBNYWNybyA9IC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdkZWZpbmUnXG4gICAgICAgICAgICBzZXRWYWx1ZSAxLCAnZGVmaW5lJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgMFxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgXG4gICAgc2hQdW5jdCA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLycgYW5kIGdldENodW5rKC0xKT8uc3RhcnQgKyBnZXRDaHVuaygtMSk/Lmxlbmd0aCA9PSBjaHVuay5zdGFydFxuICAgICAgICAgICAgYWRkVmFsdWUgLTEsICdkaXInXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnLS0nIGFuZCBnZXRDaHVuaygyKT8uc3RhcnQgPT0gY2h1bmsuc3RhcnQrMlxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2FyZ3VtZW50J1xuICAgICAgICAgICAgYWRkVmFsdWUgMSwgJ2FyZ3VtZW50J1xuICAgICAgICAgICAgc2V0VmFsdWUgMiwgJ2FyZ3VtZW50J1xuICAgICAgICAgICAgcmV0dXJuIDNcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLScgYW5kIGdldENodW5rKDEpPy5zdGFydCA9PSBjaHVuay5zdGFydCsxXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnYXJndW1lbnQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAxLCAnYXJndW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAwXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgc3RhY2tlZCA9IC0+XG5cbiAgICAgICAgaWYgc3RhY2tUb3BcbiAgICAgICAgICAgIHJldHVybiBpZiBzdGFja1RvcC53ZWFrXG4gICAgICAgICAgICBpZiBzdGFja1RvcC5zdHJvbmdcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSA9IHRvcFR5cGVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0b3BUeXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG4gICAgICAgXG4gICAgcG9wRXh0ID0gLT5cbiAgICAgICAgc3RhY2sgPSBleHRUb3Auc3RhY2tcbiAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3RhcnQuZXh0XG4gICAgICAgIGV4dFN0YWNrLnBvcCgpICAgICAgICAgICAgICAgXG4gICAgICAgIGV4dFRvcCA9IGV4dFN0YWNrWy0xXVxuICAgIFxuICAgIHB1c2hTdGFjayA9IChvKSAtPiBcbiAgICAgICAgc3RhY2sucHVzaCBvIFxuICAgICAgICBzdGFja1RvcCA9IG9cbiAgICAgICAgdG9wVHlwZSA9IG8udHlwZVxuICAgICAgICBcbiAgICBwb3BTdGFjayA9IC0+IFxuICAgICAgICBzdGFjay5wb3AoKVxuICAgICAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgICAgICB0b3BUeXBlID0gc3RhY2tUb3A/LnR5cGVcbiAgICAgICAgXG4gICAgZ2V0Q2h1bmsgID0gKGQpIC0+IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF1cbiAgICBzZXRWYWx1ZSAgPSAoZCwgdmFsdWUpIC0+IGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS52YWx1ZSA9IHZhbHVlXG4gICAgYWRkVmFsdWUgID0gKGQsIHZhbHVlKSAtPiBpZiAwIDw9IGNodW5rSW5kZXgrZCA8IGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF0udmFsdWUgKz0gJyAnICsgdmFsdWVcbiAgICBnZXRWYWx1ZSAgPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/LnZhbHVlID8gJydcbiAgICBnZXRtYXRjaCA9IChkKSAtPiBnZXRDaHVuayhkKT8ubWF0Y2ggPyAnJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaGFuZGxlcnMgPSBcbiAgICAgICAgY29mZmVlOiBwdW5jdDogWyBibG9ja0NvbW1lbnQsIGhhc2hDb21tZW50LCBjb2ZmZWVGdW5jLCB0cmlwbGVTdHJpbmcsIHNpbXBsZVN0cmluZywgaW50ZXJwb2xhdGlvbiwgZGFzaEFycm93LCByZWdleHAsIGRpY3QsIHN0YWNrZWQgXSwgd29yZDogW2NvZmZlZUZ1bmMsIG51bWJlciwgY29mZmVlV29yZCwgc3RhY2tlZF1cbiAgICAgICAgbm9vbjogICBwdW5jdDogWyBub29uQ29tbWVudCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGpzb246ICAgcHVuY3Q6IFsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIGRpY3QsICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIGpzRnVuYywgICBzdGFja2VkXVxuICAgICAgICBqczogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCBqc0Z1bmMsICAgc3RhY2tlZF1cbiAgICAgICAgdHM6ICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwganNGdW5jLCAgIHN0YWNrZWRdXG4gICAgICAgIG1kOiAgICAgcHVuY3Q6IFsgZm9ybWF0U3RyaW5nLCB0cmlwbGVTdHJpbmcsIHNpbXBsZVN0cmluZywgeG1sUHVuY3QsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGlzczogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBpbmk6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybywgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgY3BwOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgZmxvYXQsICAgIHN0YWNrZWRdXG4gICAgICAgIGhwcDogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIGZsb2F0LCAgICBzdGFja2VkXVxuICAgICAgICBjOiAgICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybywgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCBmbG9hdCwgICAgc3RhY2tlZF1cbiAgICAgICAgaDogICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgZmxvYXQsICAgIHN0YWNrZWRdXG4gICAgICAgIHNoOiAgICAgcHVuY3Q6IFsgaGFzaENvbW1lbnQsICBzaW1wbGVTdHJpbmcsIHNoUHVuY3QsICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBjczogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgcHVnOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHN2ZzogICAgcHVuY3Q6IFsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0LCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBodG1sOiAgIHB1bmN0OiBbICAgICAgICAgICAgICAgc2ltcGxlU3RyaW5nLCB4bWxQdW5jdCwgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgaHRtOiAgICBwdW5jdDogWyAgICAgICAgICAgICAgIHNpbXBsZVN0cmluZywgeG1sUHVuY3QsICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHN0eWw6ICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBjc3M6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgc2FzczogICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHNjc3M6ICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBsb2c6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgdHh0OiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgICAgIFxuICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgIGlmIGV4dFRvcC5zd2l0Y2guaW5kZW50IGFuZCBsaW5lLmNodW5rc1swXT8uc3RhcnQgPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5zdGFydFxuICAgICAgICAgICAgICAgIHBvcEV4dCgpICAgICAgICAgICAgICAgICAgICAgICAgIyBlbmQgb2YgZXh0ZW5zaW9uIGJsb2NrIHJlYWNoZWQgdGhhdCBpcyB0ZXJtaW5hdGVkIGJ5IGluZGVudGF0aW9uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3dpdGNoLnRvICAgICAjIG1ha2Ugc3VyZSB0aGUgY3VycmVudCBsaW5lIGV4dCBtYXRjaGVzIHRoZSB0b3Btb3N0IGZyb20gc3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZXh0ICE9IGxpbmUuZXh0ICAgICAgICAgICAgICAgICAgICAgICMgZWl0aGVyIGF0IHN0YXJ0IG9mIGZpbGUgb3Igd2Ugc3dpdGNoZWQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBoYW5kbCA9IGhhbmRsZXJzW2V4dCA9IGxpbmUuZXh0XSAgICAjIGluc3RhbGwgbmV3IGhhbmRsZXJzXG4gICAgICAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgd2hpbGUgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaHVuayA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXhdXG4gICAgICAgICAgICBiZWZvcmVJbmRleCA9IGNodW5rSW5kZXhcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmVuZD8gYW5kIGV4dFRvcC5zd2l0Y2guZW5kID09IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcEV4dCgpICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSB0dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLnB1bmN0ID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbXRjaCA9IFN5bnRheC5zd3RjaFtsaW5lLmV4dF0/W2NodW5rLm1hdGNoXSBcbiAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJkQ2h1bmsgPSBnZXRDaHVuayAtbXRjaC50dXJkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkID09ICh0dXJkQ2h1bms/LnR1cmQgPyB0dXJkQ2h1bms/Lm1hdGNoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcHVzaCBhIG5ldyBleHRlbnNpb24gb250byB0aGUgc3RhY2ssIGV4dCB3aWxsIGNoYW5nZSBvbiBzdGFydCBvZiBuZXh0IGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRTdGFjay5wdXNoIGV4dFRvcCA9IHN3aXRjaDptdGNoLCBzdGFydDpsaW5lLCBzdGFjazpzdGFja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBobmQgaW4gaGFuZGwud29yZCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4ID09IGJlZm9yZUluZGV4XG4gICAgICAgICAgICAgICAgY2h1bmtJbmRleCsrXG4gICAgbGluZXNcbiAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxuYmxvY2tzID0gKGxpbmVzLCBleHQ9J2NvZmZlZScpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdibG9ja3MgKmxpbmVzKiwgKmV4dConXG5cbiAgICAgICAgKmxpbmVzKjogIGFycmF5IG9mIHN0cmluZ3NcbiAgICAgICAgXG4gICAgICAgICpleHQqOlxuICAgICAgICAtIGtvZmZlZSBjb2ZmZWUganMgdHMgXG4gICAgICAgIC0gc3R5bCBjc3Mgc2FzcyBzY3NzIFxuICAgICAgICAtIHB1ZyBodG1sIGh0bSBzdmcgXG4gICAgICAgIC0gY3BwIGhwcCBjeHggYyBoIFxuICAgICAgICAtIGJhc2ggZmlzaCBzaCBcbiAgICAgICAgLSBub29uIGpzb25cbiAgICAgICAgLSBtZCBwbGlzdCBcbiAgICAgICAgLSBpc3MgaW5pXG4gICAgICAgIC0gdHh0IGxvZyBcblxuICAgICAgICAqKnJldHVybnMqKiB0aGUgcmVzdWx0IG9mXG4gICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuICAgICAgICBgYGBcblxuICAgIGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG4gICAgXG4jIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbnJhbmdlZCA9IChsaW5lcykgLT5cbiAgICBcbiAgICDilrhkb2MgJ3JhbmdlZCAqbGluZXMqJ1xuICAgICAgICBcbiAgICAgICAgKmxpbmVzKjogIGFycmF5IG9mIGNodW5rZWQgbGluZXNcbiAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGFycmF5IG9mXG5cbiAgICAgICAgICAgIHN0YXJ0OiBuXG4gICAgICAgICAgICBtYXRjaDogc1xuICAgICAgICAgICAgdmFsdWU6IHNcbiAgICAgICAgXG4gICAgcm5ncyA9IFtdXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcbiAgICAgICAgZm9yIGNodW5rIGluIGxpbmUuY2h1bmtzXG4gICAgICAgICAgICByYW5nZSA9XG4gICAgICAgICAgICAgICAgc3RhcnQ6IGNodW5rLnN0YXJ0XG4gICAgICAgICAgICAgICAgbWF0Y2g6IGNodW5rLm1hdGNoXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNodW5rLnZhbHVlLnJlcGxhY2UgJ3B1bmN0JywgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgcm5ncy5wdXNoIHJhbmdlXG4gICAgcm5nc1xuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuXG5kaXNzZWN0ID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIGRpc3MgPSBbXVxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIGQgPSBbXVxuICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgIHJhbmdlID1cbiAgICAgICAgICAgICAgICBzdGFydDogY2h1bmsuc3RhcnRcbiAgICAgICAgICAgICAgICBtYXRjaDogY2h1bmsubWF0Y2hcbiAgICAgICAgICAgICAgICB2YWx1ZTogY2h1bmsudmFsdWUucmVwbGFjZSAncHVuY3QnLCAncHVuY3R1YXRpb24nXG4gICAgICAgICAgICByYW5nZS5jbHNzID0gcmFuZ2UudmFsdWVcbiAgICAgICAgICAgIGQucHVzaCByYW5nZVxuICAgICAgICBkaXNzLnB1c2ggZFxuICAgIGRpc3NcbiAgICAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIHJhbmdlczogIChsaW5lLCBleHQpICAtPiByYW5nZWQgYmxvY2tzIFtsaW5lXSwgZXh0XG4gICAgZGlzc2VjdDogKGxpbmVzLCBleHQpIC0+IGRpc3NlY3QgYmxvY2tzIGxpbmVzLCBleHRcbiAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbuKWuHRlc3QgJ3Byb2ZpbGUnXG4gICAgXG4gICAg4pa4cHJvZmlsZSAnLS0tLS0nXG4gICAgICAgIFxuICAgICAgICB0ZXh0MCA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9Ly4uLy4uL2tvZmZlZS9jb2ZmZWUvbm9kZXMuY29mZmVlXCIgIyA2LTExbXNcbiAgICAgICAgdGV4dDEgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiICMgNTAtMTIwzrxzXG4gICAgXG4gICAgICAgIGxpbmVzMCA9IHRleHQwLnNwbGl0ICdcXG4nXG4gICAgICAgIGxpbmVzMSA9IHRleHQxLnNwbGl0ICdcXG4nXG5cbiAgICBmb3IgaSBpbiBbMC4uM11cbiAgICAgICAgYmxvY2tzIGxpbmVzMFxuICAgICAgICAjIGJsb2NrcyBsaW5lczFcbiAgICAgICAgIyBsaW5lczAubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG4gICAgICAgIFxuICAgIGZvciBpIGluIFswLi4xNV1cbiAgICAgICAgXG4gICAgICAgIOKWuHByb2ZpbGUgJ2xpbmVzMCdcbiAgICAgICAgICAgIGJsb2NrcyBsaW5lczBcbiAgICAgICAgIyDilrhwcm9maWxlICdzeW50YXgwJ1xuICAgICAgICAgICAgIyBsaW5lczAubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG4gICAgICAgICAgICBcbiAgICAgICAgIyDilrhwcm9maWxlICdsaW5lczEnXG4gICAgICAgICAgICAjIGJsb2NrcyBsaW5lczFcbiAgICAgICAgIyDilrhwcm9maWxlICdzeW50YXgxJ1xuICAgICAgICAgICAgIyBsaW5lczEubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG4gICAgICAgICAgICBcbiMjI1xuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4gICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcbiMjI1xuXG7ilrh0ZXN0ICdjb21tZW50J1xuXG4gICAgcmVxdWlyZSgna3hrJykuY2hhaSgpXG4gICAgXG4gICAgYmxvY2tzKFtcIiMjXCJdKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50JyB0dXJkOlwiIyNcIn0gXG4gICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICBdXVxuXG4gICAgYmxvY2tzKFtcIiwjYVwiXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDpcIixcIiB2YWx1ZToncHVuY3QnIHR1cmQ6IFwiLCNcIn0gXG4gICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDpcImFcIiB2YWx1ZTonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgXG7ilrh0ZXN0ICdmdW5jdGlvbidcblxuICAgIGJsb2NrcyhbJy0+J10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgIGJsb2NrcyhbJz0+J10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jz0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJyB0dXJkOiAnPT4nfSBcbiAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgIGJsb2NrcyhbJ2Y9LT4xJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczo1IGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6J2YnIHZhbHVlOidmdW5jdGlvbid9IFxuICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QnICAgICAgICAgICAgICAgdHVyZDonPS0+JyB9IFxuICAgICAgICAgICAgICAgIHtzdGFydDoyIGxlbmd0aDoxIG1hdGNoOictJyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDonLT4nfSBcbiAgICAgICAgICAgICAgICB7c3RhcnQ6MyBsZW5ndGg6MSBtYXRjaDonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICB7c3RhcnQ6NCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgXG7ilrh0ZXN0ICdtaW5pbWFsJ1xuICAgICAgICAgICAgICAgIFxuICAgIGJsb2NrcyhbJzEnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IF1dXG4gICAgYmxvY2tzKFsnYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOidhJyB2YWx1ZTondGV4dCd9IF1dXG4gICAgYmxvY2tzKFsnLiddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QnfSBdXVxuXG4gICAgYmxvY2tzKFsnMS5hJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjEgbWF0Y2g6Jy4nIHZhbHVlOidwdW5jdCBwcm9wZXJ0eSd9IFxuICAgICAgICAgICAgICAgICB7c3RhcnQ6MiAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOidwcm9wZXJ0eSd9IFxuICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoWycrK2EnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOicrJyB2YWx1ZToncHVuY3QnLCB0dXJkOicrKyd9IFxuICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjEgbWF0Y2g6JysnIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICB7c3RhcnQ6MiAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgIFxuICAgIGJsb2NrcyhbXCLilrhkb2MgJ2hlbGxvJ1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICB7c3RhcnQ6MCAgbGVuZ3RoOjEgbWF0Y2g6J+KWuCcgICAgIHZhbHVlOidwdW5jdCBtZXRhJ30gXG4gICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjMgbWF0Y2g6J2RvYycgICB2YWx1ZTonbWV0YSd9IFxuICAgICAgICAgICAgICAgICAge3N0YXJ0OjUgIGxlbmd0aDoxIG1hdGNoOlwiJ1wiICAgICB2YWx1ZToncHVuY3QgbWF0Y2ggc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICB7c3RhcnQ6NiAgbGVuZ3RoOjUgbWF0Y2g6XCJoZWxsb1wiIHZhbHVlOidtYXRjaCBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgIHtzdGFydDoxMSBsZW5ndGg6MSBtYXRjaDpcIidcIiAgICAgdmFsdWU6J3B1bmN0IG1hdGNoIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnc3BhY2UnXG5cbiAgICBiID0gYmxvY2tzIFtcInhcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDBcblxuICAgIGIgPSBibG9ja3MgW1wiIHh4XCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAxXG4gICAgXG4gICAgYiA9IGJsb2NrcyBbXCIgICAgeHh4XCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG5cbiAgICBiID0gYmxvY2tzIFtcIiAgICB4IDEgICwgXCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgYlswXS5jaHVua3NbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA2XG4gICAgYlswXS5jaHVua3NbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA5XG5cbuKWuHRlc3QgJ3N3aXRjaGVzJ1xuICAgIFxuICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICB4ICAgIFxuICAgICAgICAgICAgeVxuICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcblxuICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICB4ICBcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICB5XG4gICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcblxuICAgIGIgPSBibG9ja3MgXCJcIlwiICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAg4pa4ZG9jICdoZWxsbycgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHQgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDErMSAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICDilrhkb2MgJ2FnYWluJyAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZSAqKmRvY3MqKiAgICAgXG4gICAgICAgICAgICBgYGAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgeSAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJyAgICAgICAgICAgICAgIFxuICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbN10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbOF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBcbiAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICDilrhkb29jICdoZWxsbydcbiAgICAgICAgICAgIHggIFxuICAgICAgICBcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuXG4gICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAxKzFcbiAgICAgICAgYGBgXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgICAgIDErMTtcbiAgICAgICAgYGBgXG4gICAgICAgIFwiXCJcIi5zcGxpdCgnXFxuJyksICdtZCdcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnanMnXG4gICAgXG4iXX0=
//# sourceURL=../coffee/blocks.coffee