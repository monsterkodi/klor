// koffee 0.43.0

/*
0000000    000       0000000    0000000  000   000   0000000    
000   000  000      000   000  000       000  000   000         
0000000    000      000   000  000       0000000    0000000     
000   000  000      000   000  000       000  000        000    
0000000    0000000   0000000    0000000  000   000  0000000
 */
var FLOAT, HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, blocked, blocks, chai, chunked, klog, kstr, noon, ranged, ref, slash;

ref = require('kxk'), slash = ref.slash, kstr = ref.kstr, klog = ref.klog, noon = ref.noon, chai = ref.chai, _ = ref._;

Syntax = require('./syntax');

Syntax.init();

Syntax.swtch = {
    coffee: {
        '▸': {
            to: 'md',
            w0: 'doc',
            indent: 1
        }
    },
    md: {
        '```': {
            to: 'coffee',
            w0: 'coffeescript',
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
                            column: c,
                            length: wl,
                            string: w,
                            value: word(w)
                        });
                        c += wl;
                    }
                    turd = punct = m[0];
                    ref1 = punct.slice(0, -1);
                    for (k = 0, len1 = ref1.length; k < len1; k++) {
                        pc = ref1[k];
                        line.chunks.push({
                            column: c++,
                            length: 1,
                            string: pc,
                            turd: turd,
                            value: 'punct'
                        });
                        turd = turd.slice(1);
                    }
                    line.chunks.push({
                        column: c++,
                        length: 1,
                        string: punct.slice(-1)[0],
                        value: 'punct'
                    });
                }
                if (c < sc + l) {
                    rl = sc + l - c;
                    w = s.slice(l - rl);
                    line.chunks.push({
                        column: c,
                        length: rl,
                        string: w,
                        value: word(w)
                    });
                    c += rl;
                }
            }
        }
        if (line.chunks.length) {
            last = line.chunks.slice(-1)[0];
            line.chars = last.column + last.length;
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
    var addValue, advance, beforeIndex, chunk, chunkIndex, coffeeFunc, coffeeWord, cppMacro, dashArrow, dict, ext, extStack, extTop, float, formatString, getChunk, getString, getValue, handl, handlers, hashComment, hnd, interpolation, j, jsFunc, k, len, len1, len2, line, mtch, n, noonComment, number, popExt, popStack, popped, pushStack, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, regexp, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, topType, xmlPunct;
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
        if (chunk.string === "#") {
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
        if (chunk.string === "#" && chunkIndex === 0) {
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
        var prevPrev, prevString, ref1;
        prevString = getString(-1);
        if (prevString === 'class' || prevString === 'extends') {
            setValue(0, 'class');
            return 1;
        }
        if (prevString === '.') {
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
        var prev;
        if (stackTop && topType !== 'interpolation') {
            return 0;
        }
        if (chunk.value.startsWith('keyword')) {
            return 0;
        }
        if (prev = getChunk(-1)) {
            if (prev.value.startsWith('text')) {
                if (chunk.string === '=') {
                    setValue(-1, 'function');
                } else if (prev.column + prev.length < chunk.column) {
                    setValue(-1, 'function call');
                }
            }
        }
        return 0;
    };
    jsFunc = function() {
        if (chunk.value === 'keyword function') {
            if (getString(-1) === '=' && getValue(-2).startsWith('text')) {
                setValue(-2, 'function');
            }
        }
        return 0;
    };
    dict = function() {
        var prev, ref1, ref2;
        if (chunk.string === ':' && !((ref1 = chunk.turd) != null ? ref1.startsWith('::') : void 0)) {
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
        if (chunk.string === '/') {
            if (topType === 'regexp') {
                chunk.value += ' regexp end';
                popStack();
                return 1;
            }
            if (chunkIndex) {
                prev = getChunk(-1);
                next = getChunk(+1);
                if (!prev.value.startsWith('punct')) {
                    if ((prev.column + prev.length < chunk.column) && (next != null ? next.column : void 0) > chunk.column + 1) {
                        return 0;
                    }
                    if ((prev.column + prev.length === chunk.column) && (next != null ? next.column : void 0) === chunk.column + 1) {
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
        if ((ref1 = chunk.string) === '"' || ref1 === "'" || ref1 === '`') {
            if ((ref2 = line.chunks[chunkIndex - 1]) != null ? ref2.escape : void 0) {
                return stacked();
            }
            type = (function() {
                switch (chunk.string) {
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
        if (chunk.string === '\\' && (topType != null ? topType.startsWith('string') : void 0)) {
            if (chunkIndex === 0 || !line.chunks[chunkIndex - 1].escape) {
                chunk.escape = true;
            }
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
        if (chunk.string === '*') {
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
        if (chunk.string === '`') {
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
            if (chunk.string === '}') {
                addValue(0, 'string interpolation end');
                popStack();
                return 1;
            }
        }
        return 0;
    };
    number = function() {
        if (NUMBER.test(chunk.string)) {
            if (getString(-1) === '.') {
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
        if (HEXNUM.test(chunk.string)) {
            chunk.value = 'number hex';
            return 1;
        }
        return 0;
    };
    float = function() {
        if (FLOAT.test(chunk.string)) {
            if (getString(-1) === '.') {
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
        if ((ref1 = chunk.string) === '<' || ref1 === '>') {
            addValue(0, 'keyword');
            return 1;
        }
        return 0;
    };
    cppMacro = function() {
        if (chunk.string === "#") {
            addValue(0, 'define');
            setValue(1, 'define');
            return 2;
        }
        return 0;
    };
    shPunct = function() {
        var ref1, ref2, ref3, ref4;
        if (chunk.string === '/' && ((ref1 = getChunk(-1)) != null ? ref1.column : void 0) + ((ref2 = getChunk(-1)) != null ? ref2.length : void 0) === chunk.column) {
            addValue(-1, 'dir');
            return 1;
        }
        if (chunk.turd === '--' && ((ref3 = getChunk(2)) != null ? ref3.column : void 0) === chunk.column + 2) {
            addValue(0, 'argument');
            addValue(1, 'argument');
            setValue(2, 'argument');
            return 3;
        }
        if (chunk.string === '-' && ((ref4 = getChunk(1)) != null ? ref4.column : void 0) === chunk.column + 1) {
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
    getString = function(d) {
        var ref1, ref2;
        return (ref1 = (ref2 = getChunk(d)) != null ? ref2.string : void 0) != null ? ref1 : '';
    };
    handlers = {
        coffee: {
            punct: [coffeeFunc, simpleString, hashComment, interpolation, dashArrow, regexp, dict, stacked],
            word: [coffeeFunc, number, coffeeWord, stacked]
        },
        noon: {
            punct: [noonComment, stacked],
            word: [number, stacked]
        },
        json: {
            punct: [dict, simpleString, stacked],
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
            punct: [formatString, simpleString, xmlPunct, stacked],
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
            punct: [simpleString, hashComment, shPunct, stacked],
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
            punct: [xmlPunct, simpleString, stacked],
            word: [number, stacked]
        },
        html: {
            punct: [xmlPunct, simpleString, stacked],
            word: [number, stacked]
        },
        htm: {
            punct: [xmlPunct, simpleString, stacked],
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
        }
    };
    for (j = 0, len = lines.length; j < len; j++) {
        line = lines[j];
        if (extTop) {
            if (extTop["switch"].indent && ((ref1 = line.chunks[0]) != null ? ref1.column : void 0) <= extTop.start.chunks[0].column) {
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
                if (mtch = (ref2 = Syntax.turd[line.ext]) != null ? ref2[chunk.string] : void 0) {
                    if (mtch.turd) {
                        chunk.value += ' ' + mtch.turd;
                    }
                    if (mtch['w-0']) {
                        if ((ref3 = line.chunks[chunkIndex + 1]) != null) {
                            ref3.value = mtch['w-0'];
                        }
                    }
                }
                popped = false;
                if (extTop) {
                    if ((extTop["switch"].end != null) && extTop["switch"].end === chunk.turd) {
                        popExt();
                        popped = true;
                    }
                }
                if (!popped) {
                    if (mtch = (ref4 = Syntax.swtch[line.ext]) != null ? ref4[(ref5 = chunk.turd) != null ? ref5 : chunk.string] : void 0) {
                        extStack.push(extTop = {
                            "switch": mtch,
                            start: line,
                            stack: stack
                        });
                    }
                }
                ref7 = (ref6 = handl.punct) != null ? ref6 : [];
                for (k = 0, len1 = ref7.length; k < len1; k++) {
                    hnd = ref7[k];
                    if (advance = hnd()) {
                        chunkIndex += advance;
                        break;
                    }
                }
            } else {
                ref9 = (ref8 = handl.word) != null ? ref8 : [];
                for (n = 0, len2 = ref9.length; n < len2; n++) {
                    hnd = ref9[n];
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
            if (!chunk.value.replace) {
                klog(chunk.value);
            }
            range = {
                start: chunk.column,
                match: chunk.string,
                value: chunk.value.replace('punct', 'punctuation')
            };
            rngs.push(range);
        }
    }
    return rngs;
};

;

module.exports = {
    ranges: function(textline, ext) {
        return ranged(blocks([textline], ext));
    }
};

;

;

;

;

;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQTs7QUFRQSxNQUF1QyxPQUFBLENBQVEsS0FBUixDQUF2QyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkIsZUFBM0IsRUFBaUM7O0FBRWpDLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjs7QUFDVCxNQUFNLENBQUMsSUFBUCxDQUFBOztBQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQVE7UUFBQSxHQUFBLEVBQVE7WUFBQSxFQUFBLEVBQUksSUFBSjtZQUFhLEVBQUEsRUFBRyxLQUFoQjtZQUErQixNQUFBLEVBQVEsQ0FBdkM7U0FBUjtLQUFSO0lBQ0EsRUFBQSxFQUFRO1FBQUEsS0FBQSxFQUFRO1lBQUEsRUFBQSxFQUFJLFFBQUo7WUFBYSxFQUFBLEVBQUcsY0FBaEI7WUFBK0IsR0FBQSxFQUFRLEtBQXZDO1NBQVI7S0FEUjs7O0FBR0osS0FBQSxHQUFTOztBQUNULEtBQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFRVCxPQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsR0FBUjtBQUVQLFFBQUE7QUFBQTtJQWtCQyxJQUFBLEdBQU8sU0FBQyxDQUFEO1FBQU8sSUFBRyxNQUFNLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBSSxDQUFDLGNBQWpCLENBQWdDLENBQWhDLENBQUg7bUJBQTBDLE1BQU0sQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUFLLENBQUEsQ0FBQSxFQUEzRDtTQUFBLE1BQUE7bUJBQW1FLE9BQW5FOztJQUFQO0lBRVAsTUFBQSxHQUFTO1dBQ1QsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLElBQUQ7QUFFTixZQUFBO1FBQUEsSUFBQSxHQUNJO1lBQUEsTUFBQSxFQUFRLEVBQVI7WUFD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REE7QUFoZ0JNOztBQXdnQlYsTUFBQSxHQUFTLFNBQUMsS0FBRCxFQUFRLEdBQVI7O1FBQVEsTUFBSTs7QUFFbEI7V0F1QkMsT0FBQSxDQUFRLE9BQUEsQ0FBUSxLQUFSLEVBQWUsR0FBZixDQUFSO0FBekJLOztBQWlDVCxNQUFBLEdBQVMsU0FBQyxLQUFEO0FBRU4sUUFBQTtBQUFBO0lBYUMsSUFBQSxHQUFPO0FBQ1AsU0FBQSx1Q0FBQTs7QUFDSTtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksSUFBb0IsQ0FBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQXBDO2dCQUFBLElBQUEsQ0FBSyxLQUFLLENBQUMsS0FBWCxFQUFBOztZQUNBLEtBQUEsR0FDSTtnQkFBQSxLQUFBLEVBQU8sS0FBSyxDQUFDLE1BQWI7Z0JBQ0EsS0FBQSxFQUFPLEtBQUssQ0FBQyxNQURiO2dCQUVBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVosQ0FBb0IsT0FBcEIsRUFBNkIsYUFBN0IsQ0FGUDs7WUFHSixJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVY7QUFOSjtBQURKO1dBUUE7QUF4Qks7Ozs7QUEyRFQsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLE1BQUEsRUFBUSxTQUFDLFFBQUQsRUFBVyxHQUFYO2VBQW1CLE1BQUEsQ0FBTyxNQUFBLENBQU8sQ0FBQyxRQUFELENBQVAsRUFBbUIsR0FBbkIsQ0FBUDtJQUFuQixDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgICAgXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgXG4jIyNcblxueyBzbGFzaCwga3N0ciwga2xvZywgbm9vbiwgY2hhaSwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuICAgICAgICBcblN5bnRheCA9IHJlcXVpcmUgJy4vc3ludGF4J1xuU3ludGF4LmluaXQoKVxuXG5TeW50YXguc3d0Y2ggPSBcbiAgICBjb2ZmZWU6ICfilrgnOiAgICB0bzogJ21kJyAgICAgdzA6J2RvYycgICAgICAgICAgaW5kZW50OiAxXG4gICAgbWQ6ICAgICAnYGBgJzogIHRvOiAnY29mZmVlJyB3MDonY29mZmVlc2NyaXB0JyBlbmQ6ICAgICdgYGAnXG5cblNQQUNFICA9IC9cXHMvXG5QVU5DVCAgPSAvXFxXKy9naVxuTlVNQkVSID0gL15cXGQrJC9cbkZMT0FUICA9IC9eXFxkK2YkL1xuSEVYTlVNID0gL14weFthLWZBLUZcXGRdKyQvXG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5jaHVua2VkID0gKGxpbmVzLCBleHQpIC0+ICAgIFxuXG4gICAg4pa4ZG9jICdjaHVua2VkICpsaW5lcyosICpleHQqJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGFycmF5IG9mXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nOiBzXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogIHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogblxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIGV4dDogICAgc1xuICAgICAgICAgICAgY2hhcnM6ICBuXG4gICAgICAgICAgICBpbmRleDogIG5cbiAgICAgICAgICAgIG51bWJlcjogbisxXG4gICAgXG4gICAgd29yZCA9ICh3KSAtPiBpZiBTeW50YXgubGFuZ1tleHRdLmhhc093blByb3BlcnR5IHcgdGhlbiBTeW50YXgubGFuZ1tleHRdW3ddIGVsc2UgJ3RleHQnXG4gICAgXG4gICAgbGluZW5vID0gMFxuICAgIGxpbmVzLm1hcCAodGV4dCkgLT4gXG4gICAgICAgIFxuICAgICAgICBsaW5lID0gXG4gICAgICAgICAgICBjaHVua3M6IFtdXG4gICAgICAgICAgICBjaGFyczogIDBcbiAgICAgICAgICAgIGluZGV4OiAgbGluZW5vKytcbiAgICAgICAgICAgIG51bWJlcjogbGluZW5vXG4gICAgICAgICAgICBleHQ6ICAgIGV4dFxuXG4gICAgICAgIGNodW5rcyA9IHRleHQuc3BsaXQgU1BBQ0VcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICByZXR1cm4gbGluZSAjIGVtcHR5IGxpbmVcbiAgICAgICAgICAgIFxuICAgICAgICBjID0gMFxuICAgICAgICBmb3IgcyBpbiBjaHVua3NcbiAgICAgICAgICAgIGlmIHMgPT0gJydcbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBjKytcbiAgICAgICAgICAgICAgICBsID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzYyA9IGNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIHNlcGVyYXRlIGJ5IHB1bmN0dWF0aW9uXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hpbGUgbSA9IFBVTkNULmV4ZWMgc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5pbmRleCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdsID0gbS5pbmRleC0oYy1zYylcbiAgICAgICAgICAgICAgICAgICAgICAgIHcgPSBzW2Mtc2MuLi5tLmluZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YywgbGVuZ3RoOndsLCBzdHJpbmc6dywgdmFsdWU6d29yZCB3IFxuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSB3bFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHR1cmQgPSBwdW5jdCA9IG1bMF1cbiAgICAgICAgICAgICAgICAgICAgZm9yIHBjIGluIHB1bmN0Wy4uLi0xXVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YysrLCBsZW5ndGg6MSwgc3RyaW5nOnBjLCB0dXJkOnR1cmQsIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHR1cmQgPSB0dXJkWzEuLl1cbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YysrLCBsZW5ndGg6MSwgc3RyaW5nOnB1bmN0Wy0xXSwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXIgXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggY29sdW1uOmMsIGxlbmd0aDpybCwgc3RyaW5nOncsIHZhbHVlOndvcmQgd1xuICAgICAgICAgICAgICAgICAgICBjICs9IHJsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGxhc3QgPSBsaW5lLmNodW5rc1stMV1cbiAgICAgICAgICAgIGxpbmUuY2hhcnMgPSBsYXN0LmNvbHVtbiArIGxhc3QubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgbGluZVxuICAgICAgICBcbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbmJsb2NrZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdibG9ja2VkICpsaW5lcyonXG4gICAgICAgIFxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogbGluZXMgd2l0aCBcbiAgICAgICAgLSAnZXh0JyBzd2l0Y2hlZCBpbiBzb21lIGxpbmVzXG4gICAgICAgIC0gJ3ZhbHVlJyBjaGFuZ2VkIGluIGNodW5rcyB0aGF0IG1hdGNoIGxhbmd1YWdlIHBhdHRlcm5zXG4gICAgICAgICAgXG4gICAgZXh0U3RhY2sgICA9IFtdXG4gICAgc3RhY2sgICAgICA9IFtdXG4gICAgaGFuZGwgICAgICA9IFtdXG4gICAgZXh0VG9wICAgICA9IG51bGxcbiAgICBzdGFja1RvcCAgID0gbnVsbFxuICAgIHRvcFR5cGUgICAgPSAnJ1xuICAgIGV4dCAgICAgICAgPSAnJ1xuICAgIGxpbmUgICAgICAgPSBudWxsXG4gICAgY2h1bmsgICAgICA9IG51bGxcbiAgICBjaHVua0luZGV4ID0gMFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaGFzaENvbW1lbnQgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAwIGlmIHN0YWNrVG9wXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gXCIjXCJcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgY29tbWVudCdcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGgtMVxuICAgICAgICAgICAgICAgIGZvciBjIGluIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMS4uXVxuICAgICAgICAgICAgICAgICAgICBjLnZhbHVlID0gJ2NvbW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gbGluZS5jaHVua3MubGVuZ3RoIC0gY2h1bmtJbmRleCArIDFcbiAgICAgICAgMFxuXG4gICAgbm9vbkNvbW1lbnQgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAwIGlmIHN0YWNrVG9wXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gXCIjXCIgYW5kIGNodW5rSW5kZXggPT0gMCAjIHRoZSBvbmx5IGRpZmZlcmVuY2UuIG1lcmdlIHdpdGggaGFzaENvbW1lbnQ/XG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIGNvbW1lbnQnXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICBmb3IgYyBpbiBsaW5lLmNodW5rc1tjaHVua0luZGV4KzEuLl1cbiAgICAgICAgICAgICAgICAgICAgYy52YWx1ZSA9ICdjb21tZW50J1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUuY2h1bmtzLmxlbmd0aCAtIGNodW5rSW5kZXggKyAxXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgc2xhc2hDb21tZW50ID0gLT4gMFxuICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuICAgIFxuICAgIGRhc2hBcnJvdyA9IC0+XG5cbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnLT4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsICdmdW5jdGlvbiBoZWFkJ1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5JyBvciBsaW5lLmNodW5rc1swXS50dXJkID09ICdAOidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnPT4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsICdmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzBdLnZhbHVlID0gJ21ldGhvZCdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QnXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAwXG4gICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBjb2ZmZWVXb3JkID0gLT5cbiAgICAgICAgXG4gICAgICAgIHByZXZTdHJpbmcgPSBnZXRTdHJpbmcoLTEpXG4gICAgICAgIGlmIHByZXZTdHJpbmcgaW4gWydjbGFzcycsICdleHRlbmRzJ11cbiAgICAgICAgICAgIHNldFZhbHVlIDAsICdjbGFzcydcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgcHJldlN0cmluZyA9PSAnLidcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xLCAncHJvcGVydHknXG4gICAgICAgICAgICBzZXRWYWx1ZSAwLCAncHJvcGVydHknXG4gICAgICAgICAgICBpZiBwcmV2UHJldiA9IGdldENodW5rIC0yXG4gICAgICAgICAgICAgICAgaWYgcHJldlByZXYudmFsdWUgbm90IGluIFsncHJvcGVydHknLCAnbnVtYmVyJ11cbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdvYmonXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG5cbiAgICBjb2ZmZWVGdW5jID0gLT4gICAgICAgIFxuXG4gICAgICAgIHJldHVybiAwIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICByZXR1cm4gMCBpZiBjaHVuay52YWx1ZS5zdGFydHNXaXRoICdrZXl3b3JkJ1xuICAgICAgICBcbiAgICAgICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgcHJldi52YWx1ZS5zdGFydHNXaXRoICd0ZXh0J1xuICAgICAgICAgICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnPSdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICBlbHNlIGlmIHByZXYuY29sdW1uK3ByZXYubGVuZ3RoIDwgY2h1bmsuY29sdW1uXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZnVuY3Rpb24gY2FsbCcgXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAganNGdW5jID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnZhbHVlID09ICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgaWYgZ2V0U3RyaW5nKC0xKSA9PSAnPScgYW5kIGdldFZhbHVlKC0yKS5zdGFydHNXaXRoICd0ZXh0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnZnVuY3Rpb24nXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgZGljdCA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gJzonIGFuZCBub3QgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCAnOjonXG4gICAgICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnNwbGl0KCcgJylbMF0gaW4gWydzdHJpbmcnLCAnbnVtYmVyJywgJ3RleHQnLCAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwLCAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICByZWdleHAgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgdG9wVHlwZSA9PSAnc3RyaW5nJ1xuXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggXG4gICAgICAgICAgICAgICAgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICAgICAgbmV4dCA9IGdldENodW5rICsxXG4gICAgICAgICAgICAgICAgaWYgbm90IHByZXYudmFsdWUuc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwIGlmIChwcmV2LmNvbHVtbitwcmV2Lmxlbmd0aCA8ICBjaHVuay5jb2x1bW4pIGFuZCBuZXh0Py5jb2x1bW4gPiAgY2h1bmsuY29sdW1uKzFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDAgaWYgKHByZXYuY29sdW1uK3ByZXYubGVuZ3RoID09IGNodW5rLmNvbHVtbikgYW5kIG5leHQ/LmNvbHVtbiA9PSBjaHVuay5jb2x1bW4rMVxuICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidyZWdleHAnXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIHJlZ2V4cCBzdGFydCdcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzaW1wbGVTdHJpbmcgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nIGluIFsnXCInIFwiJ1wiICdgJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbY2h1bmtJbmRleC0xXT8uZXNjYXBlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLnN0cmluZyBcbiAgICAgICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZScgXG4gICAgICAgICAgICAgICAgd2hlbiBcIidcIiB0aGVuICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ2AnIHRoZW4gJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgZWxzZSBpZiBzdGFja1RvcCBhbmQgdG9wVHlwZSAhPSAnaW50ZXJwb2xhdGlvbidcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gJ1xcXFwnIGFuZCB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4ID09IDAgb3Igbm90IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgtMV0uZXNjYXBlXG4gICAgICAgICAgICAgICAgY2h1bmsuZXNjYXBlID0gdHJ1ZVxuICAgICAgICAwXG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAgICAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGZvcm1hdFN0cmluZyA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkID09ICcqKidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdib2xkJ1xuICAgICAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAxLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlLCB0eXBlOnR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09ICcqJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gJ2l0YWxpYydcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlLCB0eXBlOnR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnYCdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdiYWNrdGljaydcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSwgdHlwZTp0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBpbnRlcnBvbGF0aW9uID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCBcIlxcI3tcIlxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidpbnRlcnBvbGF0aW9uJywgd2Vhazp0cnVlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ3N0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDEsICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIHRvcFR5cGUgPT0gJ2ludGVycG9sYXRpb24nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnfSdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCAnc3RyaW5nIGludGVycG9sYXRpb24gZW5kJ1xuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgbnVtYmVyID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIE5VTUJFUi50ZXN0IGNodW5rLnN0cmluZ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBnZXRTdHJpbmcoLTEpID09ICcuJ1xuXG4gICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTQpID09ICdudW1iZXIgZmxvYXQnIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTQsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zLCAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwLCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlcidcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgSEVYTlVNLnRlc3QgY2h1bmsuc3RyaW5nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBoZXgnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGZsb2F0ID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEZMT0FULnRlc3QgY2h1bmsuc3RyaW5nXG4gICAgICAgICAgICBpZiBnZXRTdHJpbmcoLTEpID09ICcuJ1xuXG4gICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIDAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgeG1sUHVuY3QgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJzwvJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2tleXdvcmQnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAna2V5d29yZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nIGluIFsnPCcnPiddXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAna2V5d29yZCdcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgIFxuICAgIGNwcE1hY3JvID0gLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gXCIjXCJcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdkZWZpbmUnXG4gICAgICAgICAgICBzZXRWYWx1ZSAxLCAnZGVmaW5lJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgMFxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwXG4gICAgXG4gICAgc2hQdW5jdCA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gJy8nIGFuZCBnZXRDaHVuaygtMSk/LmNvbHVtbiArIGdldENodW5rKC0xKT8ubGVuZ3RoID09IGNodW5rLmNvbHVtblxuICAgICAgICAgICAgYWRkVmFsdWUgLTEsICdkaXInXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnLS0nIGFuZCBnZXRDaHVuaygyKT8uY29sdW1uID09IGNodW5rLmNvbHVtbisyXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCAnYXJndW1lbnQnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnYXJndW1lbnQnXG4gICAgICAgICAgICBzZXRWYWx1ZSAyLCAnYXJndW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gM1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnLScgYW5kIGdldENodW5rKDEpPy5jb2x1bW4gPT0gY2h1bmsuY29sdW1uKzFcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdhcmd1bWVudCdcbiAgICAgICAgICAgIHNldFZhbHVlIDEsICdhcmd1bWVudCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBzdGFja2VkID0gLT5cblxuICAgICAgICBpZiBzdGFja1RvcFxuICAgICAgICAgICAgcmV0dXJuIGlmIHN0YWNrVG9wLndlYWtcbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLnN0cm9uZ1xuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlID0gdG9wVHlwZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIHRvcFR5cGVcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIDBcbiAgICAgICBcbiAgICBwb3BFeHQgPSAtPlxuICAgICAgICBzdGFjayA9IGV4dFRvcC5zdGFja1xuICAgICAgICBsaW5lLmV4dCA9IGV4dFRvcC5zdGFydC5leHRcbiAgICAgICAgZXh0U3RhY2sucG9wKCkgICAgICAgICAgICAgICBcbiAgICAgICAgZXh0VG9wID0gZXh0U3RhY2tbLTFdXG4gICAgXG4gICAgcHVzaFN0YWNrID0gKG8pIC0+IFxuICAgICAgICBzdGFjay5wdXNoIG8gXG4gICAgICAgIHN0YWNrVG9wID0gb1xuICAgICAgICB0b3BUeXBlID0gby50eXBlXG4gICAgICAgIFxuICAgIHBvcFN0YWNrID0gLT4gXG4gICAgICAgIHN0YWNrLnBvcCgpXG4gICAgICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgICAgICBcbiAgICBnZXRDaHVuayAgPSAoZCkgLT4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXVxuICAgIHNldFZhbHVlICA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlID0gdmFsdWVcbiAgICBhZGRWYWx1ZSAgPSAoZCwgdmFsdWUpIC0+IGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS52YWx1ZSArPSAnICcgKyB2YWx1ZVxuICAgIGdldFZhbHVlICA9IChkKSAtPiBnZXRDaHVuayhkKT8udmFsdWUgPyAnJ1xuICAgIGdldFN0cmluZyA9IChkKSAtPiBnZXRDaHVuayhkKT8uc3RyaW5nID8gJydcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGhhbmRsZXJzID0gXG4gICAgICAgIGNvZmZlZTogcHVuY3Q6IFsgY29mZmVlRnVuYywgICBzaW1wbGVTdHJpbmcsIGhhc2hDb21tZW50LCBpbnRlcnBvbGF0aW9uLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCwgc3RhY2tlZCBdLCB3b3JkOiBbY29mZmVlRnVuYywgbnVtYmVyLCBjb2ZmZWVXb3JkLCBzdGFja2VkXVxuICAgICAgICBub29uOiAgIHB1bmN0OiBbIG5vb25Db21tZW50LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAganNvbjogICBwdW5jdDogWyBkaWN0LCAgICAgICAgIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwganNGdW5jLCAgIHN0YWNrZWRdXG4gICAgICAgIGpzOiAgICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIGpzRnVuYywgICBzdGFja2VkXVxuICAgICAgICB0czogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCBqc0Z1bmMsICAgc3RhY2tlZF1cbiAgICAgICAgbWQ6ICAgICBwdW5jdDogWyBmb3JtYXRTdHJpbmcsIHNpbXBsZVN0cmluZywgeG1sUHVuY3QsICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIGlzczogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBpbmk6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybywgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgY3BwOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgZmxvYXQsICAgIHN0YWNrZWRdXG4gICAgICAgIGhwcDogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvLCAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIGZsb2F0LCAgICBzdGFja2VkXVxuICAgICAgICBjOiAgICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybywgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCBmbG9hdCwgICAgc3RhY2tlZF1cbiAgICAgICAgaDogICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8sICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgZmxvYXQsICAgIHN0YWNrZWRdXG4gICAgICAgIHNoOiAgICAgcHVuY3Q6IFsgc2ltcGxlU3RyaW5nLCBoYXNoQ29tbWVudCwgIHNoUHVuY3QsICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBjczogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgcHVnOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHN2ZzogICAgcHVuY3Q6IFsgeG1sUHVuY3QsICAgICBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBodG1sOiAgIHB1bmN0OiBbIHhtbFB1bmN0LCAgICAgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgaHRtOiAgICBwdW5jdDogWyB4bWxQdW5jdCwgICAgIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHN0eWw6ICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBjc3M6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgc2FzczogICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgICAgICAgICAgICAgICAgICAgIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgICAgICAgICAgIHN0YWNrZWRdXG4gICAgICAgIHNjc3M6ICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsICAgICAgICAgICAgICAgICAgICBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsICAgICAgICAgICBzdGFja2VkXVxuICAgICAgICBsb2c6ICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCAgICAgICAgICAgICAgICAgICAgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCAgICAgICAgICAgc3RhY2tlZF1cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcbiAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5pbmRlbnQgYW5kIGxpbmUuY2h1bmtzWzBdPy5jb2x1bW4gPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5jb2x1bW5cbiAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSBpbmRlbnRhdGlvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN3aXRjaC50byAgICAgIyBtYWtlIHN1cmUgdGhlIGN1cnJlbnQgbGluZSBleHQgbWF0Y2hlcyB0aGUgdG9wbW9zdCBmcm9tIHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dCAhPSBsaW5lLmV4dCAgICAgICAgICAgICAgICAgICAgICAjIGVpdGhlciBhdCBzdGFydCBvZiBmaWxlIG9yIHdlIHN3aXRjaGVkIGV4dGVuc2lvblxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGNodW5rID0gbGluZS5jaHVua3NbY2h1bmtJbmRleF1cbiAgICAgICAgICAgIGJlZm9yZUluZGV4ID0gY2h1bmtJbmRleFxuICAgICAgICAgICAgaWYgY2h1bmsudmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXgudHVyZFtsaW5lLmV4dF0/W2NodW5rLnN0cmluZ10gIyDilrggZG9jXG4gICAgICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIG10Y2gudHVyZCBpZiBtdGNoLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbY2h1bmtJbmRleCsxXT8udmFsdWUgPSBtdGNoWyd3LTAnXSBpZiBtdGNoWyd3LTAnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcG9wcGVkID0gZmFsc2VcbiAgICAgICAgICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5lbmQ/IGFuZCBleHRUb3Auc3dpdGNoLmVuZCA9PSBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BFeHQoKSAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9wcGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBub3QgcG9wcGVkXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXguc3d0Y2hbbGluZS5leHRdP1tjaHVuay50dXJkID8gY2h1bmsuc3RyaW5nXVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBwdXNoIGEgbmV3IGV4dGVuc2lvbiBvbnRvIHRoZSBzdGFjaywgZXh0IHdpbGwgY2hhbmdlIG9uIHN0YXJ0IG9mIG5leHQgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0U3RhY2sucHVzaCBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLnB1bmN0ID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC53b3JkID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gYmVmb3JlSW5kZXhcbiAgICAgICAgICAgICAgICBjaHVua0luZGV4KytcbiAgICBsaW5lc1xuICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5ibG9ja3MgPSAobGluZXMsIGV4dD0nY29mZmVlJykgLT5cbiAgICBcbiAgICDilrhkb2MgJ2Jsb2NrcyAqbGluZXMqLCAqZXh0KidcblxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2Ygc3RyaW5nc1xuICAgICAgICBcbiAgICAgICAgKmV4dCo6XG4gICAgICAgIC0ga29mZmVlIGNvZmZlZSBqcyB0cyBcbiAgICAgICAgLSBzdHlsIGNzcyBzYXNzIHNjc3MgXG4gICAgICAgIC0gcHVnIGh0bWwgaHRtIHN2ZyBcbiAgICAgICAgLSBjcHAgaHBwIGN4eCBjIGggXG4gICAgICAgIC0gYmFzaCBmaXNoIHNoIFxuICAgICAgICAtIG5vb24ganNvblxuICAgICAgICAtIG1kIHBsaXN0IFxuICAgICAgICAtIGlzcyBpbmlcbiAgICAgICAgLSB0eHQgbG9nIFxuXG4gICAgICAgICoqcmV0dXJucyoqIHRoZSByZXN1bHQgb2ZcbiAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgIGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG4gICAgICAgIGBgYFxuXG4gICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcblxucmFuZ2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIOKWuGRvYyAncmFuZ2VkICpsaW5lcyonXG4gICAgICAgIFxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcblxuICAgICAgICAgICAgc3RhcnQ6IG5cbiAgICAgICAgICAgIG1hdGNoOiBzXG4gICAgICAgICAgICB2YWx1ZTogc1xuICAgICAgICBcbiAgICBybmdzID0gW11cbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgIGtsb2cgY2h1bmsudmFsdWUgaWYgbm90IGNodW5rLnZhbHVlLnJlcGxhY2VcbiAgICAgICAgICAgIHJhbmdlID1cbiAgICAgICAgICAgICAgICBzdGFydDogY2h1bmsuY29sdW1uXG4gICAgICAgICAgICAgICAgbWF0Y2g6IGNodW5rLnN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlOiBjaHVuay52YWx1ZS5yZXBsYWNlICdwdW5jdCcsICdwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIHJuZ3MucHVzaCByYW5nZVxuICAgIHJuZ3NcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAwMDAgICAgICAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxu4pa4dGVzdCAncHJvZmlsZSdcbiAgICBcbiAgICDilrhwcm9maWxlICctLS0tLSdcbiAgICAgICAgXG4gICAgICAgIHRleHQwID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL2NvZmZlZS9ub2Rlcy5jb2ZmZWVcIiAjIDYtMTFtc1xuICAgICAgICB0ZXh0MSA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9L3Rlc3QuY29mZmVlXCIgIyA1MC0xMjDOvHNcbiAgICBcbiAgICAgICAgbGluZXMwID0gdGV4dDAuc3BsaXQgJ1xcbidcbiAgICAgICAgbGluZXMxID0gdGV4dDEuc3BsaXQgJ1xcbidcblxuICAgIGZvciBpIGluIFswLi4zXVxuICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgZm9yIGkgaW4gWzAuLjE1XVxuICAgICAgICBcbiAgICAgICAg4pa4cHJvZmlsZSAnbGluZXMwJ1xuICAgICAgICAgICAgYmxvY2tzIGxpbmVzMFxuICAgICAgICAjIOKWuHByb2ZpbGUgJ3N5bnRheDAnXG4gICAgICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2NvZmZlZSdcbiAgICAgICAgICAgIFxuICAgICAgICAjIOKWuHByb2ZpbGUgJ2xpbmVzMSdcbiAgICAgICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICAgICAjIOKWuHByb2ZpbGUgJ3N5bnRheDEnXG4gICAgICAgICAgICAjIGxpbmVzMS5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2NvZmZlZSdcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgcmFuZ2VzOiAodGV4dGxpbmUsIGV4dCkgLT4gcmFuZ2VkIGJsb2NrcyBbdGV4dGxpbmVdLCBleHRcbiAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiMgICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4jICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuXG7ilrh0ZXN0ICdjb21tZW50J1xuXG4gICAgY2hhaSgpXG4gICAgXG4gICAgYmxvY2tzKFtcIiMjXCJdKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnIHR1cmQ6XCIjI1wifSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOlwiI1wiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgXV1cblxuICAgIGJsb2NrcyhbXCIsI2FcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzpcIixcIiB2YWx1ZToncHVuY3QnIHR1cmQ6IFwiLCNcIn0gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCd9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MiBsZW5ndGg6MSBzdHJpbmc6XCJhXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnZnVuY3Rpb24nXG5cbiAgICBibG9ja3MoWyctPiddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgYmxvY2tzKFsnPT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgIGJsb2NrcyhbJ2Y9LT4xJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczo1IGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonZicgdmFsdWU6J2Z1bmN0aW9uJ30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzonPScgdmFsdWU6J3B1bmN0JyAgICAgICAgICAgICAgIHR1cmQ6Jz0tPicgfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjIgbGVuZ3RoOjEgc3RyaW5nOictJyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDonLT4nfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjMgbGVuZ3RoOjEgc3RyaW5nOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46NCBsZW5ndGg6MSBzdHJpbmc6JzEnIHZhbHVlOidudW1iZXInfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnbWluaW1hbCdcbiAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoWycxJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonMScgdmFsdWU6J251bWJlcid9IF1dXG4gICAgYmxvY2tzKFsnYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6J2EnIHZhbHVlOid0ZXh0J30gXV1cbiAgICBibG9ja3MoWycuJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonLicgdmFsdWU6J3B1bmN0J30gXV1cblxuICAgIGJsb2NrcyhbJzEuYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjAgIGxlbmd0aDoxIHN0cmluZzonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDoxIHN0cmluZzonLicgdmFsdWU6J3B1bmN0IHByb3BlcnR5J30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MiAgbGVuZ3RoOjEgc3RyaW5nOidhJyB2YWx1ZToncHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgXG4gICAgYmxvY2tzKFsnKythJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MCAgbGVuZ3RoOjEgc3RyaW5nOicrJyB2YWx1ZToncHVuY3QnLCB0dXJkOicrKyd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDoxIHN0cmluZzonKycgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MiAgbGVuZ3RoOjEgc3RyaW5nOidhJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoW1wi4pa4ZG9jICdoZWxsbydcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxMiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjowICBsZW5ndGg6MSBzdHJpbmc6J+KWuCcgICAgIHZhbHVlOidwdW5jdCBtZXRhJ30gXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDozIHN0cmluZzonZG9jJyAgIHZhbHVlOidtZXRhJ30gXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjUgIGxlbmd0aDoxIHN0cmluZzpcIidcIiAgICAgdmFsdWU6J3B1bmN0IHN0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46NiAgbGVuZ3RoOjUgc3RyaW5nOlwiaGVsbG9cIiB2YWx1ZTonc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjoxMSBsZW5ndGg6MSBzdHJpbmc6XCInXCIgICAgIHZhbHVlOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgXG7ilrh0ZXN0ICdzcGFjZSdcblxuICAgIGIgPSBibG9ja3MgW1wieFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDBcblxuICAgIGIgPSBibG9ja3MgW1wiIHh4XCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgMVxuICAgIFxuICAgIGIgPSBibG9ja3MgW1wiICAgIHh4eFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDRcblxuICAgIGIgPSBibG9ja3MgW1wiICAgIHggMSAgLCBcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyA0XG4gICAgYlswXS5jaHVua3NbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgNlxuICAgIGJbMF0uY2h1bmtzWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDlcblxu4pa4dGVzdCAnc3dpdGNoZXMnXG4gICAgXG4gICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgIHggICAgXG4gICAgICAgICAgICB5XG4gICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuXG4gICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgIHggIFxuICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIHlcbiAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuXG4gICAgYiA9IGJsb2NrcyBcIlwiXCIgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICDilrhkb2MgJ2hlbGxvJyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdCAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgMSsxICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIOKWuGRvYyAnYWdhaW4nICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lICoqZG9jcyoqICAgICBcbiAgICAgICAgICAgIGBgYCAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB5ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nICAgICAgICAgICAgICAgXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls3XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls4XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIFxuIl19
//# sourceURL=../coffee/blocks.coffee