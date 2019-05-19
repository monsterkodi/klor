// koffee 0.43.0
var FLOAT, HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, blocked, blocks, chai, chunked, i, j, k, klog, kstr, lines0, lines1, noon, ranged, ref, slash, text0, text1;

ref = require('kxk'), slash = ref.slash, kstr = ref.kstr, klog = ref.klog, noon = ref.noon, chai = ref.chai, _ = ref._;

if (koffee_4_0 = process.hrtime()) {
    Syntax = require('./syntax');
    Syntax.init();
    Syntax.swtch = {
        koffee: {
            '▸': {
                to: 'md',
                w0: 'doc',
                indent: 1
            }
        },
        md: {
            '```': {
                to: 'koffee',
                w0: 'coffeescript',
                end: '```'
            }
        }
    };
    text0 = slash.readText(__dirname + "/../../koffee/coffee/nodes.coffee");
    text1 = slash.readText(__dirname + "/test.coffee");
    lines0 = text0.split('\n');
    lines1 = text1.split('\n');
    console.log('-----', require('pretty-time')(process.hrtime(koffee_4_0)));
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

blocked = function(lines) {
    var addValue, advance, beforeIndex, chunk, chunkIndex, coffeeFunc, coffeeWord, cppMacro, dashArrow, dict, ext, extStack, extTop, float, formatString, getChunk, getString, getValue, handl, handlers, hashComment, hnd, interpolation, j, jsFunc, k, len, len1, len2, line, mtch, n, noonComment, number, popExt, popStack, popped, pushStack, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, regexp, setValue, simpleString, slashComment, stack, stackTop, stacked, topType, xmlPunct;
''
    extStack = [];
    extTop = null;
    handl = [];
    stack = [];
    topType = null;
    stackTop = null;
    ext = null;
    chunk = null;
    line = null;
    chunkIndex = null;
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
    xmlPunct = function() {
        return 0;
    };
    cppMacro = function() {
        return 0;
    };
    float = function() {
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
        koffee: {
            punct: [coffeeFunc, simpleString, hashComment, interpolation, dashArrow, regexp, dict, stacked],
            word: [coffeeFunc, number, coffeeWord, stacked]
        },
        coffee: {
            punct: [coffeeFunc, simpleString, hashComment, interpolation, dashArrow, regexp, dict, stacked],
            word: [coffeeFunc, number, coffeeWord, stacked]
        },
        noon: {
            punct: [noonComment, stacked],
            word: [number, stacked]
        },
        js: {
            punct: [slashComment, simpleString, dashArrow, regexp, jsFunc, stacked],
            word: [number, stacked]
        },
        ts: {
            punct: [slashComment, simpleString, dashArrow, regexp, jsFunc, stacked],
            word: [number, stacked]
        },
        md: {
            punct: [formatString, simpleString, xmlPunct, stacked],
            word: [number, stacked]
        },
        iss: {},
        ini: {},
        sh: {},
        cpp: {
            punct: [slashComment, simpleString, cppMacro],
            word: [number, float, stacked]
        },
        hpp: {
            punct: [slashComment, simpleString, cppMacro],
            word: [number, float, stacked]
        },
        c: {
            punct: [slashComment, simpleString, cppMacro],
            word: [number, float, stacked]
        },
        h: {
            punct: [slashComment, simpleString, cppMacro],
            word: [number, float, stacked]
        },
        cs: {},
        pug: {},
        svg: {
            punct: [xmlPunct]
        },
        html: {
            punct: [xmlPunct]
        },
        htm: {
            punct: [xmlPunct]
        },
        styl: {},
        css: {},
        sass: {},
        scss: {}
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
        ext = 'koffee';
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

for (i = j = 0; j <= 3; i = ++j) {
    blocks(lines0);
}
for (i = k = 0; k <= 15; i = ++k) {
    if (koffee_619_8 = process.hrtime()) {
        blocks(lines0);
        console.log('lines0', require('pretty-time')(process.hrtime(koffee_619_8)));
    };
};

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUF1QyxPQUFBLENBQVEsS0FBUixDQUF2QyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkIsZUFBM0IsRUFBaUM7O0FBQW1CLElBQUEsNkJBQUE7SUFHaEQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO0lBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBQTtJQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7UUFBQSxNQUFBLEVBQVE7WUFBQSxHQUFBLEVBQVE7Z0JBQUEsRUFBQSxFQUFJLElBQUo7Z0JBQWEsRUFBQSxFQUFHLEtBQWhCO2dCQUErQixNQUFBLEVBQVEsQ0FBdkM7YUFBUjtTQUFSO1FBQ0EsRUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFRO2dCQUFBLEVBQUEsRUFBSSxRQUFKO2dCQUFhLEVBQUEsRUFBRyxjQUFoQjtnQkFBK0IsR0FBQSxFQUFRLEtBQXZDO2FBQVI7U0FEUjs7SUFHSixLQUFBLEdBQVEsS0FBSyxDQUFDLFFBQU4sQ0FBa0IsU0FBRCxHQUFXLG1DQUE1QjtJQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsUUFBTixDQUFrQixTQUFELEdBQVcsY0FBNUI7SUFFUixNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaO0lBQ1QsTUFBQSxHQUFTLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBWixFQWR1Qzs2RUFBQTs7O0FBZ0JwRCxLQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxLQUFBLEdBQVM7O0FBQ1QsTUFBQSxHQUFTOztBQVFULE9BQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxHQUFSO0FBRVAsUUFBQTtBQUFBO0lBa0JDLElBQUEsR0FBTyxTQUFDLENBQUQ7UUFBTyxJQUFHLE1BQU0sQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUFJLENBQUMsY0FBakIsQ0FBZ0MsQ0FBaEMsQ0FBSDttQkFBMEMsTUFBTSxDQUFDLElBQUssQ0FBQSxHQUFBLENBQUssQ0FBQSxDQUFBLEVBQTNEO1NBQUEsTUFBQTttQkFBbUUsT0FBbkU7O0lBQVA7SUFFUCxNQUFBLEdBQVM7V0FDVCxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsSUFBRDtBQUVOLFlBQUE7UUFBQSxJQUFBLEdBQ0k7WUFBQSxNQUFBLEVBQVEsRUFBUjtZQUNBLEtBQUEsRUFBUSxDQURSO1lBRUEsS0FBQSxFQUFRLE1BQUEsRUFGUjtZQUdBLE1BQUEsRUFBUSxNQUhSO1lBSUEsR0FBQSxFQUFRLEdBSlI7O1FBTUosTUFBQSxHQUFTLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBWDtRQUVULElBQUcsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBakIsSUFBdUIsTUFBTyxDQUFBLENBQUEsQ0FBUCxLQUFhLEVBQXZDO0FBQ0ksbUJBQU8sS0FEWDs7UUFHQSxDQUFBLEdBQUk7QUFDSixhQUFBLHdDQUFBOztZQUNJLElBQUcsQ0FBQSxLQUFLLEVBQVI7Z0JBQ0ksQ0FBQSxHQURKO2FBQUEsTUFBQTtnQkFHSSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBZjtvQkFBMkIsQ0FBQSxHQUEzQjs7Z0JBQ0EsQ0FBQSxHQUFJLENBQUMsQ0FBQztnQkFDTixFQUFBLEdBQUs7QUFJTCx1QkFBTSxDQUFBLEdBQUksS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQVY7b0JBRUksSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLENBQWI7d0JBQ0ksRUFBQSxHQUFLLENBQUMsQ0FBQyxLQUFGLEdBQVEsQ0FBQyxDQUFBLEdBQUUsRUFBSDt3QkFDYixDQUFBLEdBQUksQ0FBRTt3QkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLElBQVosQ0FBaUI7NEJBQUEsTUFBQSxFQUFPLENBQVA7NEJBQVUsTUFBQSxFQUFPLEVBQWpCOzRCQUFxQixNQUFBLEVBQU8sQ0FBNUI7NEJBQStCLEtBQUEsRUFBTSxJQUFBLENBQUssQ0FBTCxDQUFyQzt5QkFBakI7d0JBQ0EsQ0FBQSxJQUFLLEdBSlQ7O29CQU1BLElBQUEsR0FBTyxLQUFBLEdBQVEsQ0FBRSxDQUFBLENBQUE7QUFDakI7QUFBQSx5QkFBQSx3Q0FBQTs7d0JBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFaLENBQWlCOzRCQUFBLE1BQUEsRUFBTyxDQUFBLEVBQVA7NEJBQVksTUFBQSxFQUFPLENBQW5COzRCQUFzQixNQUFBLEVBQU8sRUFBN0I7NEJBQWlDLElBQUEsRUFBSyxJQUF0Qzs0QkFBNEMsS0FBQSxFQUFNLE9BQWxEO3lCQUFqQjt3QkFDQSxJQUFBLEdBQU8sSUFBSztBQUZoQjtvQkFHQSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQVosQ0FBaUI7d0JBQUEsTUFBQSxFQUFPLENBQUEsRUFBUDt3QkFBWSxNQUFBLEVBQU8sQ0FBbkI7d0JBQXNCLE1BQUEsRUFBTyxLQUFNLFVBQUUsQ0FBQSxDQUFBLENBQXJDO3dCQUF3QyxLQUFBLEVBQU0sT0FBOUM7cUJBQWpCO2dCQVpKO2dCQWNBLElBQUcsQ0FBQSxHQUFJLEVBQUEsR0FBRyxDQUFWO29CQUNJLEVBQUEsR0FBSyxFQUFBLEdBQUcsQ0FBSCxHQUFLO29CQUNWLENBQUEsR0FBSSxDQUFFO29CQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBWixDQUFpQjt3QkFBQSxNQUFBLEVBQU8sQ0FBUDt3QkFBVSxNQUFBLEVBQU8sRUFBakI7d0JBQXFCLE1BQUEsRUFBTyxDQUE1Qjt3QkFBK0IsS0FBQSxFQUFNLElBQUEsQ0FBSyxDQUFMLENBQXJDO3FCQUFqQjtvQkFDQSxDQUFBLElBQUssR0FKVDtpQkF2Qko7O0FBREo7UUE4QkEsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQWY7WUFDSSxJQUFBLEdBQU8sSUFBSSxDQUFDLE1BQU8sVUFBRSxDQUFBLENBQUE7WUFDckIsSUFBSSxDQUFDLEtBQUwsR0FBYSxJQUFJLENBQUMsTUFBTCxHQUFjLElBQUksQ0FBQyxPQUZwQzs7ZUFJQTtJQWpETSxDQUFWO0FBdkJNOztBQWdGVixPQUFBLEdBQVUsU0FBQyxLQUFEO0FBRVAsUUFBQTtBQUFBO0lBV0MsUUFBQSxHQUFhO0lBQ2IsTUFBQSxHQUFhO0lBQ2IsS0FBQSxHQUFhO0lBQ2IsS0FBQSxHQUFhO0lBQ2IsT0FBQSxHQUFhO0lBQ2IsUUFBQSxHQUFhO0lBQ2IsR0FBQSxHQUFhO0lBQ2IsS0FBQSxHQUFhO0lBQ2IsSUFBQSxHQUFhO0lBQ2IsVUFBQSxHQUFhO0lBRWIsTUFBQSxHQUFTLFNBQUE7UUFDTCxLQUFBLEdBQVEsTUFBTSxDQUFDO1FBRWYsSUFBSSxDQUFDLEdBQUwsR0FBVyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3hCLFFBQVEsQ0FBQyxHQUFULENBQUE7ZUFDQSxNQUFBLEdBQVMsUUFBUyxVQUFFLENBQUEsQ0FBQTtJQUxmO0lBT1QsU0FBQSxHQUFZLFNBQUMsQ0FBRDtRQUNSLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWDtRQUNBLFFBQUEsR0FBVztlQUNYLE9BQUEsR0FBVSxDQUFDLENBQUM7SUFISjtJQUtaLFFBQUEsR0FBVyxTQUFBO1FBQ1AsS0FBSyxDQUFDLEdBQU4sQ0FBQTtRQUNBLFFBQUEsR0FBVyxLQUFNLFVBQUUsQ0FBQSxDQUFBO2VBQ25CLE9BQUEsc0JBQVUsUUFBUSxDQUFFO0lBSGI7SUFXWCxXQUFBLEdBQWMsU0FBQTtBQUVWLFlBQUE7UUFBQSxJQUFZLFFBQVo7QUFBQSxtQkFBTyxFQUFQOztRQUVBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsR0FBbkI7WUFDSSxLQUFLLENBQUMsS0FBTixJQUFlO1lBQ2YsSUFBRyxVQUFBLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFaLEdBQW1CLENBQW5DO0FBQ0k7QUFBQSxxQkFBQSxzQ0FBQTs7b0JBQ0ksQ0FBQyxDQUFDLEtBQUYsR0FBVTtBQURkLGlCQURKOztBQUdBLG1CQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBWixHQUFxQixVQUFyQixHQUFrQyxFQUw3Qzs7ZUFNQTtJQVZVO0lBWWQsV0FBQSxHQUFjLFNBQUE7QUFFVixZQUFBO1FBQUEsSUFBWSxRQUFaO0FBQUEsbUJBQU8sRUFBUDs7UUFFQSxJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLEdBQWhCLElBQXdCLFVBQUEsS0FBYyxDQUF6QztZQUNJLEtBQUssQ0FBQyxLQUFOLElBQWU7WUFDZixJQUFHLFVBQUEsR0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQVosR0FBbUIsQ0FBbkM7QUFDSTtBQUFBLHFCQUFBLHNDQUFBOztvQkFDSSxDQUFDLENBQUMsS0FBRixHQUFVO0FBRGQsaUJBREo7O0FBR0EsbUJBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFaLEdBQXFCLFVBQXJCLEdBQWtDLEVBTDdDOztlQU1BO0lBVlU7SUFZZCxZQUFBLEdBQWUsU0FBQTtlQUFHO0lBQUg7SUFRZixTQUFBLEdBQVksU0FBQTtRQUVSLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxJQUFqQjtZQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksZUFBWjtZQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksZUFBWjtZQUNBLElBQUcsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEtBQXdCLGdCQUF4QixJQUE0QyxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQWYsS0FBdUIsSUFBdEU7Z0JBQ0ksSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEdBQXVCO2dCQUN2QixJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsR0FBdUIsZUFGM0I7O0FBR0EsbUJBQU8sRUFOWDs7UUFRQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsSUFBakI7WUFDSSxRQUFBLENBQVMsQ0FBVCxFQUFZLHFCQUFaO1lBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSxxQkFBWjtZQUNBLElBQUcsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFmLEtBQXdCLGdCQUEzQjtnQkFDSSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQWYsR0FBdUI7Z0JBQ3ZCLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBZixHQUF1QixlQUYzQjs7QUFHQSxtQkFBTyxFQU5YOztlQU9BO0lBakJRO0lBeUJaLFVBQUEsR0FBYSxTQUFBO0FBRVQsWUFBQTtRQUFBLFVBQUEsR0FBYSxTQUFBLENBQVUsQ0FBQyxDQUFYO1FBQ2IsSUFBRyxVQUFBLEtBQWUsT0FBZixJQUFBLFVBQUEsS0FBd0IsU0FBM0I7WUFDSSxRQUFBLENBQVMsQ0FBVCxFQUFZLE9BQVo7QUFDQSxtQkFBTyxFQUZYOztRQUlBLElBQUcsVUFBQSxLQUFjLEdBQWpCO1lBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLFVBQWI7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFZLFVBQVo7WUFDQSxJQUFHLFFBQUEsR0FBVyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQWQ7Z0JBQ0ksWUFBRyxRQUFRLENBQUMsTUFBVCxLQUF1QixVQUF2QixJQUFBLElBQUEsS0FBbUMsUUFBdEM7b0JBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLEtBQWIsRUFESjtpQkFESjs7QUFHQSxtQkFBTyxFQU5YOztlQU9BO0lBZFM7SUFnQmIsVUFBQSxHQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsSUFBWSxRQUFBLElBQWEsT0FBQSxLQUFXLGVBQXBDO0FBQUEsbUJBQU8sRUFBUDs7UUFDQSxJQUFZLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBWixDQUF1QixTQUF2QixDQUFaO0FBQUEsbUJBQU8sRUFBUDs7UUFFQSxJQUFHLElBQUEsR0FBTyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQVY7WUFFSSxJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBWCxDQUFzQixNQUF0QixDQUFIO2dCQUNJLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsR0FBbkI7b0JBQ0ksUUFBQSxDQUFTLENBQUMsQ0FBVixFQUFhLFVBQWIsRUFESjtpQkFBQSxNQUVLLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBWSxJQUFJLENBQUMsTUFBakIsR0FBMEIsS0FBSyxDQUFDLE1BQW5DO29CQUNELFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxlQUFiLEVBREM7aUJBSFQ7YUFGSjs7ZUFPQTtJQVpTO0lBY2IsTUFBQSxHQUFTLFNBQUE7ZUFDTDtJQURLO0lBR1QsSUFBQSxHQUFPLFNBQUE7QUFFSCxZQUFBO1FBQUEsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixHQUFoQixJQUF3QixvQ0FBYyxDQUFFLFVBQVosQ0FBdUIsSUFBdkIsV0FBL0I7WUFDSSxJQUFHLElBQUEsR0FBTyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQVY7Z0JBQ0ksWUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQVgsQ0FBaUIsR0FBakIsQ0FBc0IsQ0FBQSxDQUFBLEVBQXRCLEtBQTZCLFFBQTdCLElBQUEsSUFBQSxLQUF1QyxRQUF2QyxJQUFBLElBQUEsS0FBaUQsTUFBakQsSUFBQSxJQUFBLEtBQXlELFNBQTVEO29CQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxnQkFBYjtvQkFDQSxRQUFBLENBQVUsQ0FBVixFQUFhLGtCQUFiO0FBQ0EsMkJBQU8sRUFIWDtpQkFESjthQURKOztlQU1BO0lBUkc7SUFnQlAsTUFBQSxHQUFTLFNBQUE7QUFFTCxZQUFBO1FBQUEsSUFBWSxPQUFBLEtBQVcsUUFBdkI7QUFBQSxtQkFBTyxFQUFQOztRQUVBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsR0FBbkI7WUFFSSxJQUFHLE9BQUEsS0FBVyxRQUFkO2dCQUNJLEtBQUssQ0FBQyxLQUFOLElBQWU7Z0JBQ2YsUUFBQSxDQUFBO0FBQ0EsdUJBQU8sRUFIWDs7WUFLQSxJQUFHLFVBQUg7Z0JBQ0ksSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVY7Z0JBQ1AsSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQVY7Z0JBQ1AsSUFBRyxDQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBWCxDQUFzQixPQUF0QixDQUFQO29CQUNJLElBQVksQ0FBQyxJQUFJLENBQUMsTUFBTCxHQUFZLElBQUksQ0FBQyxNQUFqQixHQUEyQixLQUFLLENBQUMsTUFBbEMsQ0FBQSxvQkFBOEMsSUFBSSxDQUFFLGdCQUFOLEdBQWdCLEtBQUssQ0FBQyxNQUFOLEdBQWEsQ0FBdkY7QUFBQSwrQkFBTyxFQUFQOztvQkFDQSxJQUFZLENBQUMsSUFBSSxDQUFDLE1BQUwsR0FBWSxJQUFJLENBQUMsTUFBakIsS0FBMkIsS0FBSyxDQUFDLE1BQWxDLENBQUEsb0JBQThDLElBQUksQ0FBRSxnQkFBTixLQUFnQixLQUFLLENBQUMsTUFBTixHQUFhLENBQXZGO0FBQUEsK0JBQU8sRUFBUDtxQkFGSjtpQkFISjs7WUFPQSxTQUFBLENBQVU7Z0JBQUEsSUFBQSxFQUFLLFFBQUw7YUFBVjtZQUNBLEtBQUssQ0FBQyxLQUFOLElBQWU7QUFDZixtQkFBTyxFQWhCWDs7ZUFpQkE7SUFyQks7SUE2QlQsWUFBQSxHQUFlLFNBQUE7QUFFWCxZQUFBO1FBQUEsSUFBWSxPQUFBLEtBQVcsUUFBdkI7QUFBQSxtQkFBTyxFQUFQOztRQUVBLFlBQUcsS0FBSyxDQUFDLE9BQU4sS0FBaUIsR0FBakIsSUFBQSxJQUFBLEtBQXFCLEdBQXJCLElBQUEsSUFBQSxLQUF5QixHQUE1QjtZQUVJLHVEQUE0QixDQUFFLGVBQTlCO0FBQ0ksdUJBQU8sT0FBQSxDQUFBLEVBRFg7O1lBR0EsSUFBQTtBQUFPLHdCQUFPLEtBQUssQ0FBQyxNQUFiO0FBQUEseUJBQ0UsR0FERjsrQkFDVztBQURYLHlCQUVFLEdBRkY7K0JBRVc7QUFGWCx5QkFHRSxHQUhGOytCQUdXO0FBSFg7O1lBS1AsSUFBRyxPQUFBLEtBQVcsSUFBZDtnQkFDSSxLQUFLLENBQUMsS0FBTixJQUFlLEdBQUEsR0FBTTtnQkFDckIsUUFBQSxDQUFBO0FBQ0EsdUJBQU8sRUFIWDthQUFBLE1BSUssSUFBRyxRQUFBLElBQWEsT0FBQSxLQUFXLGVBQTNCO0FBQ0QsdUJBQU8sT0FBQSxDQUFBLEVBRE47O1lBR0wsU0FBQSxDQUFVO2dCQUFBLElBQUEsRUFBSyxJQUFMO2dCQUFXLE1BQUEsRUFBTyxJQUFsQjthQUFWO1lBQ0EsS0FBSyxDQUFDLEtBQU4sSUFBZSxHQUFBLEdBQU07QUFDckIsbUJBQU8sRUFuQlg7O1FBcUJBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsSUFBaEIsdUJBQXlCLE9BQU8sQ0FBRSxVQUFULENBQW9CLFFBQXBCLFdBQTVCO1lBQ0ksSUFBRyxVQUFBLEtBQWMsQ0FBZCxJQUFtQixDQUFJLElBQUksQ0FBQyxNQUFPLENBQUEsVUFBQSxHQUFXLENBQVgsQ0FBYSxDQUFDLE1BQXBEO2dCQUNJLEtBQUssQ0FBQyxNQUFOLEdBQWUsS0FEbkI7YUFESjs7ZUFHQTtJQTVCVztJQW9DZixZQUFBLEdBQWUsU0FBQTtBQUVYLFlBQUE7UUFBQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsSUFBakI7WUFFSSxJQUFBLEdBQU87WUFDUCxzQkFBRyxPQUFPLENBQUUsUUFBVCxDQUFrQixJQUFsQixVQUFIO2dCQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksT0FBWjtnQkFDQSxRQUFBLENBQVMsQ0FBVCxFQUFZLE9BQVo7Z0JBQ0EsUUFBQSxDQUFBO0FBQ0EsdUJBQU8sRUFKWDs7WUFNQSx1QkFBcUMsUUFBUSxDQUFFLGNBQS9DO2dCQUFBLElBQUEsR0FBTyxRQUFRLENBQUMsSUFBVCxHQUFnQixHQUFoQixHQUFzQixLQUE3Qjs7WUFDQSxTQUFBLENBQVU7Z0JBQUEsS0FBQSxFQUFNLElBQU47Z0JBQVksSUFBQSxFQUFLLElBQWpCO2FBQVY7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFZLElBQVo7WUFDQSxRQUFBLENBQVMsQ0FBVCxFQUFZLElBQVo7QUFDQSxtQkFBTyxFQWJYOztRQWVBLElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsR0FBbkI7WUFFSSxJQUFBLEdBQU87WUFDUCxzQkFBRyxPQUFPLENBQUUsUUFBVCxDQUFrQixJQUFsQixVQUFIO2dCQUNJLFFBQUEsQ0FBUyxDQUFULEVBQVksT0FBWjtnQkFDQSxRQUFBLENBQUE7QUFDQSx1QkFBTyxFQUhYOztZQUtBLHVCQUFxQyxRQUFRLENBQUUsY0FBL0M7Z0JBQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxJQUFULEdBQWdCLEdBQWhCLEdBQXNCLEtBQTdCOztZQUNBLFNBQUEsQ0FBVTtnQkFBQSxLQUFBLEVBQU0sSUFBTjtnQkFBWSxJQUFBLEVBQUssSUFBakI7YUFBVjtZQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksSUFBWjtBQUNBLG1CQUFPLEVBWFg7O1FBYUEsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixHQUFuQjtZQUVJLElBQUEsR0FBTztZQUNQLHNCQUFHLE9BQU8sQ0FBRSxRQUFULENBQWtCLElBQWxCLFVBQUg7Z0JBQ0ksUUFBQSxDQUFTLENBQVQsRUFBWSxPQUFaO2dCQUNBLFFBQUEsQ0FBQTtBQUNBLHVCQUFPLEVBSFg7O1lBS0EsdUJBQXFDLFFBQVEsQ0FBRSxjQUEvQztnQkFBQSxJQUFBLEdBQU8sUUFBUSxDQUFDLElBQVQsR0FBZ0IsR0FBaEIsR0FBc0IsS0FBN0I7O1lBQ0EsU0FBQSxDQUFVO2dCQUFBLEtBQUEsRUFBTSxJQUFOO2dCQUFZLElBQUEsRUFBSyxJQUFqQjthQUFWO1lBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSxJQUFaO0FBQ0EsbUJBQU8sRUFYWDs7ZUFZQTtJQTFDVztJQWtEZixhQUFBLEdBQWdCLFNBQUE7QUFFWixZQUFBO1FBQUEsSUFBRyxPQUFBLEtBQVcsZUFBZDtZQUVJLHNDQUFhLENBQUUsVUFBWixDQUF1QixLQUF2QixVQUFIO2dCQUNJLFNBQUEsQ0FBVTtvQkFBQSxJQUFBLEVBQUssZUFBTDtvQkFBc0IsSUFBQSxFQUFLLElBQTNCO2lCQUFWO2dCQUNBLFFBQUEsQ0FBUyxDQUFULEVBQVksNEJBQVo7Z0JBQ0EsUUFBQSxDQUFTLENBQVQsRUFBWSw0QkFBWjtBQUNBLHVCQUFPLEVBSlg7YUFGSjtTQUFBLE1BUUssSUFBRyxPQUFBLEtBQVcsZUFBZDtZQUVELElBQUcsS0FBSyxDQUFDLE1BQU4sS0FBZ0IsR0FBbkI7Z0JBQ0ksUUFBQSxDQUFTLENBQVQsRUFBWSwwQkFBWjtnQkFDQSxRQUFBLENBQUE7QUFDQSx1QkFBTyxFQUhYO2FBRkM7O2VBTUw7SUFoQlk7SUF3QmhCLE1BQUEsR0FBUyxTQUFBO1FBRUwsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQUssQ0FBQyxNQUFsQixDQUFIO1lBRUksSUFBRyxTQUFBLENBQVUsQ0FBQyxDQUFYLENBQUEsS0FBaUIsR0FBcEI7Z0JBRUksSUFBRyxRQUFBLENBQVMsQ0FBQyxDQUFWLENBQUEsS0FBZ0IsY0FBaEIsSUFBbUMsUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFBLEtBQWdCLGNBQXREO29CQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxRQUFiO29CQUNBLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxjQUFiO29CQUNBLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxRQUFiO29CQUNBLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxjQUFiO29CQUNBLFFBQUEsQ0FBVSxDQUFWLEVBQWEsUUFBYjtBQUNBLDJCQUFPLEVBTlg7O2dCQVFBLElBQUcsUUFBQSxDQUFTLENBQUMsQ0FBVixDQUFBLEtBQWdCLFFBQW5CO29CQUNJLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxjQUFiO29CQUNBLFFBQUEsQ0FBUyxDQUFDLENBQVYsRUFBYSxjQUFiO29CQUNBLFFBQUEsQ0FBVSxDQUFWLEVBQWEsY0FBYjtBQUNBLDJCQUFPLEVBSlg7aUJBVko7O1lBZ0JBLEtBQUssQ0FBQyxLQUFOLEdBQWM7QUFDZCxtQkFBTyxFQW5CWDs7UUFxQkEsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQUssQ0FBQyxNQUFsQixDQUFIO1lBRUksS0FBSyxDQUFDLEtBQU4sR0FBYztBQUNkLG1CQUFPLEVBSFg7O2VBSUE7SUEzQks7SUE2QlQsUUFBQSxHQUFXLFNBQUE7ZUFBRztJQUFIO0lBQ1gsUUFBQSxHQUFXLFNBQUE7ZUFBRztJQUFIO0lBQ1gsS0FBQSxHQUFXLFNBQUE7ZUFBRztJQUFIO0lBUVgsT0FBQSxHQUFVLFNBQUE7UUFFTixJQUFHLFFBQUg7WUFDSSxJQUFVLFFBQVEsQ0FBQyxJQUFuQjtBQUFBLHVCQUFBOztZQUNBLElBQUcsUUFBUSxDQUFDLE1BQVo7Z0JBQ0ksS0FBSyxDQUFDLEtBQU4sR0FBYyxRQURsQjthQUFBLE1BQUE7Z0JBR0ksS0FBSyxDQUFDLEtBQU4sSUFBZSxHQUFBLEdBQU0sUUFIekI7O0FBSUEsbUJBQU8sRUFOWDs7ZUFPQTtJQVRNO0lBV1YsUUFBQSxHQUFZLFNBQUMsQ0FBRDtlQUFPLElBQUksQ0FBQyxNQUFPLENBQUEsVUFBQSxHQUFXLENBQVg7SUFBbkI7SUFDWixRQUFBLEdBQVksU0FBQyxDQUFELEVBQUksS0FBSjtBQUFjLFlBQUE7UUFBQSxJQUFHLENBQUEsQ0FBQSxZQUFLLFVBQUEsR0FBVyxFQUFoQixRQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBaEMsQ0FBSDttQkFBK0MsSUFBSSxDQUFDLE1BQU8sQ0FBQSxVQUFBLEdBQVcsQ0FBWCxDQUFhLENBQUMsS0FBMUIsR0FBa0MsTUFBakY7O0lBQWQ7SUFDWixRQUFBLEdBQVksU0FBQyxDQUFELEVBQUksS0FBSjtBQUFjLFlBQUE7UUFBQSxJQUFHLENBQUEsQ0FBQSxZQUFLLFVBQUEsR0FBVyxFQUFoQixRQUFBLEdBQW9CLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBaEMsQ0FBSDttQkFBK0MsSUFBSSxDQUFDLE1BQU8sQ0FBQSxVQUFBLEdBQVcsQ0FBWCxDQUFhLENBQUMsS0FBMUIsSUFBbUMsR0FBQSxHQUFNLE1BQXhGOztJQUFkO0lBQ1osUUFBQSxHQUFZLFNBQUMsQ0FBRDtBQUFPLFlBQUE7NEZBQXFCO0lBQTVCO0lBQ1osU0FBQSxHQUFZLFNBQUMsQ0FBRDtBQUFPLFlBQUE7NkZBQXNCO0lBQTdCO0lBUVosUUFBQSxHQUNJO1FBQUEsTUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsVUFBRixFQUFjLFlBQWQsRUFBNEIsV0FBNUIsRUFBeUMsYUFBekMsRUFBd0QsU0FBeEQsRUFBbUUsTUFBbkUsRUFBMkUsSUFBM0UsRUFBaUYsT0FBakYsQ0FBUDtZQUFtRyxJQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsTUFBYixFQUFxQixVQUFyQixFQUFpQyxPQUFqQyxDQUF6RztTQUFSO1FBQ0EsTUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsVUFBRixFQUFjLFlBQWQsRUFBNEIsV0FBNUIsRUFBeUMsYUFBekMsRUFBd0QsU0FBeEQsRUFBbUUsTUFBbkUsRUFBMkUsSUFBM0UsRUFBaUYsT0FBakYsQ0FBUDtZQUFtRyxJQUFBLEVBQU0sQ0FBQyxVQUFELEVBQWEsTUFBYixFQUFxQixVQUFyQixFQUFpQyxPQUFqQyxDQUF6RztTQURSO1FBRUEsSUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsV0FBRixFQUFpRCxPQUFqRCxDQUFQO1lBQW1FLElBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxPQUFULENBQXpFO1NBRlI7UUFHQSxFQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBRSxZQUFGLEVBQWdCLFlBQWhCLEVBQThCLFNBQTlCLEVBQXlDLE1BQXpDLEVBQWlELE1BQWpELEVBQXlELE9BQXpELENBQVA7WUFBMkUsSUFBQSxFQUFNLENBQUMsTUFBRCxFQUFTLE9BQVQsQ0FBakY7U0FIUjtRQUlBLEVBQUEsRUFBUTtZQUFBLEtBQUEsRUFBTyxDQUFFLFlBQUYsRUFBZ0IsWUFBaEIsRUFBOEIsU0FBOUIsRUFBeUMsTUFBekMsRUFBaUQsTUFBakQsRUFBeUQsT0FBekQsQ0FBUDtZQUEyRSxJQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsT0FBVCxDQUFqRjtTQUpSO1FBS0EsRUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsWUFBRixFQUFnQixZQUFoQixFQUE4QixRQUE5QixFQUF3QyxPQUF4QyxDQUFQO1lBQTBELElBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxPQUFULENBQWhFO1NBTFI7UUFNQSxHQUFBLEVBQVEsRUFOUjtRQU9BLEdBQUEsRUFBUSxFQVBSO1FBUUEsRUFBQSxFQUFRLEVBUlI7UUFTQSxHQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBRSxZQUFGLEVBQWdCLFlBQWhCLEVBQThCLFFBQTlCLENBQVA7WUFBaUQsSUFBQSxFQUFNLENBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsT0FBaEIsQ0FBdkQ7U0FUUjtRQVVBLEdBQUEsRUFBUTtZQUFBLEtBQUEsRUFBTyxDQUFFLFlBQUYsRUFBZ0IsWUFBaEIsRUFBOEIsUUFBOUIsQ0FBUDtZQUFpRCxJQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixPQUFoQixDQUF2RDtTQVZSO1FBV0EsQ0FBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsWUFBRixFQUFnQixZQUFoQixFQUE4QixRQUE5QixDQUFQO1lBQWlELElBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLE9BQWhCLENBQXZEO1NBWFI7UUFZQSxDQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBRSxZQUFGLEVBQWdCLFlBQWhCLEVBQThCLFFBQTlCLENBQVA7WUFBaUQsSUFBQSxFQUFNLENBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsT0FBaEIsQ0FBdkQ7U0FaUjtRQWFBLEVBQUEsRUFBUSxFQWJSO1FBY0EsR0FBQSxFQUFRLEVBZFI7UUFlQSxHQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBRSxRQUFGLENBQVA7U0FmUjtRQWdCQSxJQUFBLEVBQVE7WUFBQSxLQUFBLEVBQU8sQ0FBRSxRQUFGLENBQVA7U0FoQlI7UUFpQkEsR0FBQSxFQUFRO1lBQUEsS0FBQSxFQUFPLENBQUUsUUFBRixDQUFQO1NBakJSO1FBa0JBLElBQUEsRUFBUSxFQWxCUjtRQW1CQSxHQUFBLEVBQVEsRUFuQlI7UUFvQkEsSUFBQSxFQUFRLEVBcEJSO1FBcUJBLElBQUEsRUFBUSxFQXJCUjs7QUE2QkosU0FBQSx1Q0FBQTs7UUFFSSxJQUFHLE1BQUg7WUFDSSxJQUFHLE1BQU0sRUFBQyxNQUFELEVBQU8sQ0FBQyxNQUFkLDJDQUF1QyxDQUFFLGdCQUFoQixJQUEwQixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUE3RTtnQkFDSSxNQUFBLENBQUEsRUFESjthQUFBLE1BQUE7Z0JBR0ksSUFBSSxDQUFDLEdBQUwsR0FBVyxNQUFNLEVBQUMsTUFBRCxFQUFPLENBQUMsR0FIN0I7YUFESjs7UUFNQSxJQUFHLEdBQUEsS0FBTyxJQUFJLENBQUMsR0FBZjtZQUNJLEtBQUEsR0FBUSxRQUFTLENBQUEsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFYLEVBRHJCOztRQVNBLFVBQUEsR0FBYTtBQUNiLGVBQU0sVUFBQSxHQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBL0I7WUFDSSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU8sQ0FBQSxVQUFBO1lBQ3BCLFdBQUEsR0FBYztZQUNkLElBQUcsS0FBSyxDQUFDLEtBQU4sS0FBZSxPQUFsQjtnQkFFSSxJQUFHLElBQUEsZ0RBQThCLENBQUEsS0FBSyxDQUFDLE1BQU4sVUFBakM7b0JBQ0ksSUFBa0MsSUFBSSxDQUFDLElBQXZDO3dCQUFBLEtBQUssQ0FBQyxLQUFOLElBQWUsR0FBQSxHQUFNLElBQUksQ0FBQyxLQUExQjs7b0JBQ0EsSUFBa0QsSUFBSyxDQUFBLEtBQUEsQ0FBdkQ7O2dDQUF5QixDQUFFLEtBQTNCLEdBQW1DLElBQUssQ0FBQSxLQUFBO3lCQUF4QztxQkFGSjs7Z0JBSUEsTUFBQSxHQUFTO2dCQUNULElBQUcsTUFBSDtvQkFDSSxJQUFHLDhCQUFBLElBQXVCLE1BQU0sRUFBQyxNQUFELEVBQU8sQ0FBQyxHQUFkLEtBQXFCLEtBQUssQ0FBQyxJQUFyRDt3QkFDSSxNQUFBLENBQUE7d0JBQ0EsTUFBQSxHQUFTLEtBRmI7cUJBREo7O2dCQUtBLElBQUcsQ0FBSSxNQUFQO29CQUNJLElBQUcsSUFBQSxpREFBK0Isc0NBQWEsS0FBSyxDQUFDLE1BQW5CLFVBQWxDO3dCQUVJLFFBQVEsQ0FBQyxJQUFULENBQWMsTUFBQSxHQUFTOzRCQUFBLENBQUEsTUFBQSxDQUFBLEVBQU8sSUFBUDs0QkFBYSxLQUFBLEVBQU0sSUFBbkI7NEJBQXlCLEtBQUEsRUFBTSxLQUEvQjt5QkFBdkIsRUFGSjtxQkFESjs7QUFLQTtBQUFBLHFCQUFBLHdDQUFBOztvQkFDSSxJQUFHLE9BQUEsR0FBVSxHQUFBLENBQUEsQ0FBYjt3QkFDSSxVQUFBLElBQWM7QUFDZCw4QkFGSjs7QUFESixpQkFqQko7YUFBQSxNQUFBO0FBc0JJO0FBQUEscUJBQUEsd0NBQUE7O29CQUNJLElBQUcsT0FBQSxHQUFVLEdBQUEsQ0FBQSxDQUFiO3dCQUNJLFVBQUEsSUFBYztBQUNkLDhCQUZKOztBQURKLGlCQXRCSjs7WUEyQkEsSUFBRyxVQUFBLEtBQWMsV0FBakI7Z0JBQ0ksVUFBQSxHQURKOztRQTlCSjtBQWxCSjtXQWtEQTtBQWxiTTs7QUEwYlYsTUFBQSxHQUFTLFNBQUMsS0FBRCxFQUFRLEdBQVI7O1FBQVEsTUFBSTs7QUFFbEI7V0F1QkMsT0FBQSxDQUFRLE9BQUEsQ0FBUSxLQUFSLEVBQWUsR0FBZixDQUFSO0FBekJLOztBQWlDVCxNQUFBLEdBQVMsU0FBQyxLQUFEO0FBRU4sUUFBQTtBQUFBO0lBYUMsSUFBQSxHQUFPO0FBQ1AsU0FBQSx1Q0FBQTs7QUFDSTtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksSUFBb0IsQ0FBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQXBDO2dCQUFBLElBQUEsQ0FBSyxLQUFLLENBQUMsS0FBWCxFQUFBOztZQUNBLEtBQUEsR0FDSTtnQkFBQSxLQUFBLEVBQU8sS0FBSyxDQUFDLE1BQWI7Z0JBQ0EsS0FBQSxFQUFPLEtBQUssQ0FBQyxNQURiO2dCQUVBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVosQ0FBb0IsT0FBcEIsRUFBNkIsYUFBN0IsQ0FGUDs7WUFHSixJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVY7QUFOSjtBQURKO1dBUUE7QUF4Qks7O0FBMkJMLEtBQVMsMEJBQVQ7SUFDSSxNQUFBLENBQU8sTUFBUDtBQURKO0FBS0EsS0FBUywyQkFBVDtJQUVHLElBQUEsK0JBQUE7UUFDSyxNQUFBLENBQU8sTUFBUCxFQURMO29GQUFBOztBQUZIOztBQVlKLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQVEsU0FBQyxRQUFELEVBQVcsR0FBWDtlQUFtQixNQUFBLENBQU8sTUFBQSxDQUFPLENBQUMsUUFBRCxDQUFQLEVBQW1CLEdBQW5CLENBQVA7SUFBbkIsQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbIlxueyBzbGFzaCwga3N0ciwga2xvZywgbm9vbiwgY2hhaSwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG7ilrhwcm9maWxlICctLS0tLScgXG4gICAgU3ludGF4ID0gcmVxdWlyZSAnLi9zeW50YXgnXG4gICAgU3ludGF4LmluaXQoKVxuICAgIFxuICAgIFN5bnRheC5zd3RjaCA9IFxuICAgICAgICBrb2ZmZWU6ICfilrgnOiAgICB0bzogJ21kJyAgICAgdzA6J2RvYycgICAgICAgICAgaW5kZW50OiAxXG4gICAgICAgIG1kOiAgICAgJ2BgYCc6ICB0bzogJ2tvZmZlZScgdzA6J2NvZmZlZXNjcmlwdCcgZW5kOiAgICAnYGBgJ1xuXG4gICAgdGV4dDAgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvY29mZmVlL25vZGVzLmNvZmZlZVwiICMgNi0xMW1zXG4gICAgdGV4dDEgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiICMgNTAtMTIwzrxzXG5cbiAgICBsaW5lczAgPSB0ZXh0MC5zcGxpdCAnXFxuJ1xuICAgIGxpbmVzMSA9IHRleHQxLnNwbGl0ICdcXG4nXG4gICAgICAgIFxuU1BBQ0UgID0gL1xccy9cblBVTkNUICA9IC9cXFcrL2dpXG5OVU1CRVIgPSAvXlxcZCskL1xuRkxPQVQgID0gL15cXGQrZiQvXG5IRVhOVU0gPSAvXjB4W2EtZkEtRlxcZF0rJC9cblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbmNodW5rZWQgPSAobGluZXMsIGV4dCkgLT4gICAgXG5cbiAgICDilrhkb2MgJ2NodW5rZWQgKmxpbmVzKiwgKmV4dConXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmc6IHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAgc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IG5cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgZXh0OiAgICBzXG4gICAgICAgICAgICBjaGFyczogIG5cbiAgICAgICAgICAgIGluZGV4OiAgblxuICAgICAgICAgICAgbnVtYmVyOiBuKzFcbiAgICBcbiAgICB3b3JkID0gKHcpIC0+IGlmIFN5bnRheC5sYW5nW2V4dF0uaGFzT3duUHJvcGVydHkgdyB0aGVuIFN5bnRheC5sYW5nW2V4dF1bd10gZWxzZSAndGV4dCdcbiAgICBcbiAgICBsaW5lbm8gPSAwXG4gICAgbGluZXMubWFwICh0ZXh0KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGxpbmUgPSBcbiAgICAgICAgICAgIGNodW5rczogW11cbiAgICAgICAgICAgIGNoYXJzOiAgMFxuICAgICAgICAgICAgaW5kZXg6ICBsaW5lbm8rK1xuICAgICAgICAgICAgbnVtYmVyOiBsaW5lbm9cbiAgICAgICAgICAgIGV4dDogICAgZXh0XG5cbiAgICAgICAgY2h1bmtzID0gdGV4dC5zcGxpdCBTUEFDRVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmtzLmxlbmd0aCA9PSAxIGFuZCBjaHVua3NbMF0gPT0gJydcbiAgICAgICAgICAgIHJldHVybiBsaW5lICMgZW1wdHkgbGluZVxuICAgICAgICAgICAgXG4gICAgICAgIGMgPSAwXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGlsZSBtID0gUFVOQ1QuZXhlYyBzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgd2wgPSBtLmluZGV4LShjLXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHNbYy1zYy4uLm0uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIGNvbHVtbjpjLCBsZW5ndGg6d2wsIHN0cmluZzp3LCB2YWx1ZTp3b3JkIHcgXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHB1bmN0ID0gbVswXVxuICAgICAgICAgICAgICAgICAgICBmb3IgcGMgaW4gcHVuY3RbLi4uLTFdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIGNvbHVtbjpjKyssIGxlbmd0aDoxLCBzdHJpbmc6cGMsIHR1cmQ6dHVyZCwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHR1cmRbMS4uXVxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIGNvbHVtbjpjKyssIGxlbmd0aDoxLCBzdHJpbmc6cHVuY3RbLTFdLCB2YWx1ZToncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgYyA8IHNjK2wgICAgICAgICMgY2hlY2sgZm9yIHJlbWFpbmluZyBub24tcHVuY3RcbiAgICAgICAgICAgICAgICAgICAgcmwgPSBzYytsLWMgICAgIyBsZW5ndGggb2YgcmVtYWluZGVyXG4gICAgICAgICAgICAgICAgICAgIHcgPSBzW2wtcmwuLl0gICMgdGV4dCAgIG9mIHJlbWFpbmRlciBcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YywgbGVuZ3RoOnJsLCBzdHJpbmc6dywgdmFsdWU6d29yZCB3XG4gICAgICAgICAgICAgICAgICAgIGMgKz0gcmxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmUuY2h1bmtzWy0xXVxuICAgICAgICAgICAgbGluZS5jaGFycyA9IGxhc3QuY29sdW1uICsgbGFzdC5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICBsaW5lXG4gICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcblxuYmxvY2tlZCA9IChsaW5lcykgLT5cbiAgICBcbiAgICDilrhkb2MgJ2Jsb2NrZWQgKmxpbmVzKidcbiAgICAgICAgXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgICAgIFxuICAgICAgICAqKnJldHVybnMqKiBsaW5lcyB3aXRoIFxuICAgICAgICAtICdleHQnIHN3aXRjaGVkIGluIHNvbWUgbGluZXNcbiAgICAgICAgLSAndmFsdWUnIGNoYW5nZWQgaW4gY2h1bmtzIHRoYXQgbWF0Y2ggbGFuZ3VhZ2UgcGF0dGVybnNcbiAgICAgICAgICBcbiAgICBleHRTdGFjayAgID0gW11cbiAgICBleHRUb3AgICAgID0gbnVsbFxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBbXVxuICAgIHRvcFR5cGUgICAgPSBudWxsXG4gICAgc3RhY2tUb3AgICA9IG51bGxcbiAgICBleHQgICAgICAgID0gbnVsbFxuICAgIGNodW5rICAgICAgPSBudWxsXG4gICAgbGluZSAgICAgICA9IG51bGxcbiAgICBjaHVua0luZGV4ID0gbnVsbFxuXG4gICAgcG9wRXh0ID0gLT5cbiAgICAgICAgc3RhY2sgPSBleHRUb3Auc3RhY2tcbiAgICAgICAgIyBsaW5lLnBvcCA9IHRydWVcbiAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3RhcnQuZXh0XG4gICAgICAgIGV4dFN0YWNrLnBvcCgpICAgICAgICAgICAgICAgXG4gICAgICAgIGV4dFRvcCA9IGV4dFN0YWNrWy0xXVxuICAgIFxuICAgIHB1c2hTdGFjayA9IChvKSAtPiBcbiAgICAgICAgc3RhY2sucHVzaCBvIFxuICAgICAgICBzdGFja1RvcCA9IG9cbiAgICAgICAgdG9wVHlwZSA9IG8udHlwZVxuICAgICAgICBcbiAgICBwb3BTdGFjayA9IC0+IFxuICAgICAgICBzdGFjay5wb3AoKVxuICAgICAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgICAgICB0b3BUeXBlID0gc3RhY2tUb3A/LnR5cGVcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGhhc2hDb21tZW50ID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMCBpZiBzdGFja1RvcFxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09IFwiI1wiXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIGNvbW1lbnQnXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICBmb3IgYyBpbiBsaW5lLmNodW5rc1tjaHVua0luZGV4KzEuLl1cbiAgICAgICAgICAgICAgICAgICAgYy52YWx1ZSA9ICdjb21tZW50J1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUuY2h1bmtzLmxlbmd0aCAtIGNodW5rSW5kZXggKyAxXG4gICAgICAgIDBcblxuICAgIG5vb25Db21tZW50ID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMCBpZiBzdGFja1RvcFxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09IFwiI1wiIGFuZCBjaHVua0luZGV4ID09IDAgIyB0aGUgb25seSBkaWZmZXJlbmNlLiBtZXJnZSB3aXRoIGhhc2hDb21tZW50P1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyBjb21tZW50J1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgZm9yIGMgaW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCsxLi5dXG4gICAgICAgICAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgIHJldHVybiBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgIHNsYXNoQ29tbWVudCA9IC0+IDBcbiAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcbiAgICBcbiAgICBkYXNoQXJyb3cgPSAtPlxuXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJy0+J1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2Z1bmN0aW9uIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleScgb3IgbGluZS5jaHVua3NbMF0udHVyZCA9PSAnQDonXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMF0udmFsdWUgPSAnbWV0aG9kJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzFdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJz0+J1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2Z1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgMFxuICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgY29mZmVlV29yZCA9IC0+XG4gICAgICAgIFxuICAgICAgICBwcmV2U3RyaW5nID0gZ2V0U3RyaW5nKC0xKVxuICAgICAgICBpZiBwcmV2U3RyaW5nIGluIFsnY2xhc3MnLCAnZXh0ZW5kcyddXG4gICAgICAgICAgICBzZXRWYWx1ZSAwLCAnY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHByZXZTdHJpbmcgPT0gJy4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSwgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgc2V0VmFsdWUgMCwgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgaWYgcHJldlByZXYgPSBnZXRDaHVuayAtMlxuICAgICAgICAgICAgICAgIGlmIHByZXZQcmV2LnZhbHVlIG5vdCBpbiBbJ3Byb3BlcnR5JywgJ251bWJlciddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnb2JqJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuXG4gICAgY29mZmVlRnVuYyA9IC0+ICAgICAgICBcblxuICAgICAgICByZXR1cm4gMCBpZiBzdGFja1RvcCBhbmQgdG9wVHlwZSAhPSAnaW50ZXJwb2xhdGlvbidcbiAgICAgICAgcmV0dXJuIDAgaWYgY2h1bmsudmFsdWUuc3RhcnRzV2l0aCAna2V5d29yZCdcbiAgICAgICAgXG4gICAgICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCAndGV4dCdcbiAgICAgICAgICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gJz0nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBwcmV2LmNvbHVtbitwcmV2Lmxlbmd0aCA8IGNodW5rLmNvbHVtblxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2Z1bmN0aW9uIGNhbGwnIFxuICAgICAgICAwXG4gICAgICAgIFxuICAgIGpzRnVuYyA9IC0+XG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgZGljdCA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gJzonIGFuZCBub3QgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCAnOjonXG4gICAgICAgICAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnNwbGl0KCcgJylbMF0gaW4gWydzdHJpbmcnLCAnbnVtYmVyJywgJ3RleHQnLCAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwLCAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICByZWdleHAgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgdG9wVHlwZSA9PSAnc3RyaW5nJ1xuXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggXG4gICAgICAgICAgICAgICAgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgICAgICAgICAgbmV4dCA9IGdldENodW5rICsxXG4gICAgICAgICAgICAgICAgaWYgbm90IHByZXYudmFsdWUuc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwIGlmIChwcmV2LmNvbHVtbitwcmV2Lmxlbmd0aCA8ICBjaHVuay5jb2x1bW4pIGFuZCBuZXh0Py5jb2x1bW4gPiAgY2h1bmsuY29sdW1uKzFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDAgaWYgKHByZXYuY29sdW1uK3ByZXYubGVuZ3RoID09IGNodW5rLmNvbHVtbikgYW5kIG5leHQ/LmNvbHVtbiA9PSBjaHVuay5jb2x1bW4rMVxuICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidyZWdleHAnXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIHJlZ2V4cCBzdGFydCdcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzaW1wbGVTdHJpbmcgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nIGluIFsnXCInIFwiJ1wiICdgJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbY2h1bmtJbmRleC0xXT8uZXNjYXBlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gc3dpdGNoIGNodW5rLnN0cmluZyBcbiAgICAgICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZScgXG4gICAgICAgICAgICAgICAgd2hlbiBcIidcIiB0aGVuICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgICAgIHdoZW4gJ2AnIHRoZW4gJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgZWxzZSBpZiBzdGFja1RvcCBhbmQgdG9wVHlwZSAhPSAnaW50ZXJwb2xhdGlvbidcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTp0eXBlLCBzdHJvbmc6dHJ1ZVxuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gJ1xcXFwnIGFuZCB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4ID09IDAgb3Igbm90IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgtMV0uZXNjYXBlXG4gICAgICAgICAgICAgICAgY2h1bmsuZXNjYXBlID0gdHJ1ZVxuICAgICAgICAwXG4gICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAgICAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGZvcm1hdFN0cmluZyA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkID09ICcqKidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdib2xkJ1xuICAgICAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAxLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlLCB0eXBlOnR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09ICcqJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gJ2l0YWxpYydcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlLCB0eXBlOnR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnYCdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9ICdiYWNrdGljaydcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSwgdHlwZTp0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwLCB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCBcbiAgICBcbiAgICBpbnRlcnBvbGF0aW9uID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHRvcFR5cGUgPT0gJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCBcIlxcI3tcIlxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOidpbnRlcnBvbGF0aW9uJywgd2Vhazp0cnVlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ3N0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDEsICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlIGlmIHRvcFR5cGUgPT0gJ2ludGVycG9sYXRpb24nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnfSdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCAnc3RyaW5nIGludGVycG9sYXRpb24gZW5kJ1xuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgbnVtYmVyID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIE5VTUJFUi50ZXN0IGNodW5rLnN0cmluZ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBnZXRTdHJpbmcoLTEpID09ICcuJ1xuXG4gICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTQpID09ICdudW1iZXIgZmxvYXQnIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTQsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zLCAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwLCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlcidcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgSEVYTlVNLnRlc3QgY2h1bmsuc3RyaW5nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBoZXgnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgIHhtbFB1bmN0ID0gLT4gMFxuICAgIGNwcE1hY3JvID0gLT4gMFxuICAgIGZsb2F0ICAgID0gLT4gMFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIHN0YWNrZWQgPSAtPlxuXG4gICAgICAgIGlmIHN0YWNrVG9wXG4gICAgICAgICAgICByZXR1cm4gaWYgc3RhY2tUb3Aud2Vha1xuICAgICAgICAgICAgaWYgc3RhY2tUb3Auc3Ryb25nXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgPSB0b3BUeXBlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdG9wVHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICBnZXRDaHVuayAgPSAoZCkgLT4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXVxuICAgIHNldFZhbHVlICA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlID0gdmFsdWVcbiAgICBhZGRWYWx1ZSAgPSAoZCwgdmFsdWUpIC0+IGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS52YWx1ZSArPSAnICcgKyB2YWx1ZVxuICAgIGdldFZhbHVlICA9IChkKSAtPiBnZXRDaHVuayhkKT8udmFsdWUgPyAnJ1xuICAgIGdldFN0cmluZyA9IChkKSAtPiBnZXRDaHVuayhkKT8uc3RyaW5nID8gJydcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGhhbmRsZXJzID0gXG4gICAgICAgIGtvZmZlZTogcHVuY3Q6IFsgY29mZmVlRnVuYywgc2ltcGxlU3RyaW5nLCBoYXNoQ29tbWVudCwgaW50ZXJwb2xhdGlvbiwgZGFzaEFycm93LCByZWdleHAsIGRpY3QsIHN0YWNrZWQgXSwgd29yZDogW2NvZmZlZUZ1bmMsIG51bWJlciwgY29mZmVlV29yZCwgc3RhY2tlZF1cbiAgICAgICAgY29mZmVlOiBwdW5jdDogWyBjb2ZmZWVGdW5jLCBzaW1wbGVTdHJpbmcsIGhhc2hDb21tZW50LCBpbnRlcnBvbGF0aW9uLCBkYXNoQXJyb3csIHJlZ2V4cCwgZGljdCwgc3RhY2tlZCBdLCB3b3JkOiBbY29mZmVlRnVuYywgbnVtYmVyLCBjb2ZmZWVXb3JkLCBzdGFja2VkXVxuICAgICAgICBub29uOiAgIHB1bmN0OiBbIG5vb25Db21tZW50ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICwgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCBzdGFja2VkXVxuICAgICAgICBqczogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCwganNGdW5jLCBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIHN0YWNrZWRdXG4gICAgICAgIHRzOiAgICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBqc0Z1bmMsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgc3RhY2tlZF1cbiAgICAgICAgbWQ6ICAgICBwdW5jdDogWyBmb3JtYXRTdHJpbmcsIHNpbXBsZVN0cmluZywgeG1sUHVuY3QsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgc3RhY2tlZF1cbiAgICAgICAgaXNzOiAgICB7fVxuICAgICAgICBpbmk6ICAgIHt9XG4gICAgICAgIHNoOiAgICAge31cbiAgICAgICAgY3BwOiAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gXSwgd29yZDogW251bWJlciwgZmxvYXQsIHN0YWNrZWRdXG4gICAgICAgIGhwcDogICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGNwcE1hY3JvIF0sIHdvcmQ6IFtudW1iZXIsIGZsb2F0LCBzdGFja2VkXVxuICAgICAgICBjOiAgICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBjcHBNYWNybyBdLCB3b3JkOiBbbnVtYmVyLCBmbG9hdCwgc3RhY2tlZF1cbiAgICAgICAgaDogICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gXSwgd29yZDogW251bWJlciwgZmxvYXQsIHN0YWNrZWRdXG4gICAgICAgIGNzOiAgICAge31cbiAgICAgICAgcHVnOiAgICB7fVxuICAgICAgICBzdmc6ICAgIHB1bmN0OiBbIHhtbFB1bmN0IF1cbiAgICAgICAgaHRtbDogICBwdW5jdDogWyB4bWxQdW5jdCBdXG4gICAgICAgIGh0bTogICAgcHVuY3Q6IFsgeG1sUHVuY3QgXVxuICAgICAgICBzdHlsOiAgIHt9ICAgXG4gICAgICAgIGNzczogICAge30gICBcbiAgICAgICAgc2FzczogICB7fSAgIFxuICAgICAgICBzY3NzOiAgIHt9ICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcbiAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5pbmRlbnQgYW5kIGxpbmUuY2h1bmtzWzBdPy5jb2x1bW4gPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5jb2x1bW5cbiAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSBpbmRlbnRhdGlvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN3aXRjaC50byAgICAgIyBtYWtlIHN1cmUgdGhlIGN1cnJlbnQgbGluZSBleHQgbWF0Y2hlcyB0aGUgdG9wbW9zdCBmcm9tIHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dCAhPSBsaW5lLmV4dCAgICAgICAgICAgICAgICAgICAgICAjIGVpdGhlciBhdCBzdGFydCBvZiBmaWxlIG9yIHdlIHN3aXRjaGVkIGV4dGVuc2lvblxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGNodW5rID0gbGluZS5jaHVua3NbY2h1bmtJbmRleF1cbiAgICAgICAgICAgIGJlZm9yZUluZGV4ID0gY2h1bmtJbmRleFxuICAgICAgICAgICAgaWYgY2h1bmsudmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXgudHVyZFtsaW5lLmV4dF0/W2NodW5rLnN0cmluZ10gIyDilrggZG9jXG4gICAgICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIG10Y2gudHVyZCBpZiBtdGNoLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbY2h1bmtJbmRleCsxXT8udmFsdWUgPSBtdGNoWyd3LTAnXSBpZiBtdGNoWyd3LTAnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcG9wcGVkID0gZmFsc2VcbiAgICAgICAgICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5lbmQ/IGFuZCBleHRUb3Auc3dpdGNoLmVuZCA9PSBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9wcGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBub3QgcG9wcGVkXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXguc3d0Y2hbbGluZS5leHRdP1tjaHVuay50dXJkID8gY2h1bmsuc3RyaW5nXVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBwdXNoIGEgbmV3IGV4dGVuc2lvbiBvbnRvIHRoZSBzdGFjaywgZXh0IHdpbGwgY2hhbmdlIG9uIHN0YXJ0IG9mIG5leHQgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0U3RhY2sucHVzaCBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLnB1bmN0ID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC53b3JkID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gYmVmb3JlSW5kZXhcbiAgICAgICAgICAgICAgICBjaHVua0luZGV4KytcbiAgICBsaW5lc1xuICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5ibG9ja3MgPSAobGluZXMsIGV4dD0na29mZmVlJykgLT5cbiAgICBcbiAgICDilrhkb2MgJ2Jsb2NrcyAqbGluZXMqLCAqZXh0KidcblxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2Ygc3RyaW5nc1xuICAgICAgICBcbiAgICAgICAgKmV4dCo6XG4gICAgICAgIC0ga29mZmVlIGNvZmZlZSBqcyB0cyBcbiAgICAgICAgLSBzdHlsIGNzcyBzYXNzIHNjc3MgXG4gICAgICAgIC0gcHVnIGh0bWwgaHRtIHN2ZyBcbiAgICAgICAgLSBjcHAgaHBwIGN4eCBjIGggXG4gICAgICAgIC0gYmFzaCBmaXNoIHNoIFxuICAgICAgICAtIG5vb24ganNvblxuICAgICAgICAtIG1kIHBsaXN0IFxuICAgICAgICAtIGlzcyBpbmlcbiAgICAgICAgLSB0eHQgbG9nIFxuXG4gICAgICAgICoqcmV0dXJucyoqIHRoZSByZXN1bHQgb2ZcbiAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgIGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG4gICAgICAgIGBgYFxuXG4gICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcblxucmFuZ2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIOKWuGRvYyAncmFuZ2VkICpsaW5lcyonXG4gICAgICAgIFxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcblxuICAgICAgICAgICAgc3RhcnQ6IG5cbiAgICAgICAgICAgIG1hdGNoOiBzXG4gICAgICAgICAgICB2YWx1ZTogc1xuICAgICAgICBcbiAgICBybmdzID0gW11cbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgIGtsb2cgY2h1bmsudmFsdWUgaWYgbm90IGNodW5rLnZhbHVlLnJlcGxhY2VcbiAgICAgICAgICAgIHJhbmdlID1cbiAgICAgICAgICAgICAgICBzdGFydDogY2h1bmsuY29sdW1uXG4gICAgICAgICAgICAgICAgbWF0Y2g6IGNodW5rLnN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlOiBjaHVuay52YWx1ZS5yZXBsYWNlICdwdW5jdCcsICdwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIHJuZ3MucHVzaCByYW5nZVxuICAgIHJuZ3Ncblxu4pa4aWYgMVxuICAgIGZvciBpIGluIFswLi4zXVxuICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2tvZmZlZSdcbiAgICAgICAgXG4gICAgZm9yIGkgaW4gWzAuLjE1XVxuICAgICAgICBcbiAgICAgICAg4pa4cHJvZmlsZSAnbGluZXMwJ1xuICAgICAgICAgICAgYmxvY2tzIGxpbmVzMFxuICAgICAgICAjIOKWuHByb2ZpbGUgJ3N5bnRheDAnXG4gICAgICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2tvZmZlZSdcbiAgICAgICAgICAgIFxuICAgICAgICAjIOKWuHByb2ZpbGUgJ2xpbmVzMSdcbiAgICAgICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICAgICAjIOKWuHByb2ZpbGUgJ3N5bnRheDEnXG4gICAgICAgICAgICAjIGxpbmVzMS5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2tvZmZlZSdcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgcmFuZ2VzOiAodGV4dGxpbmUsIGV4dCkgLT4gcmFuZ2VkIGJsb2NrcyBbdGV4dGxpbmVdLCBleHRcbiAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiMgICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4jICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuXG7ilrh0ZXN0ICdjb21tZW50J1xuXG4gICAgY2hhaSgpXG4gICAgXG4gICAgYmxvY2tzKFtcIiMjXCJdKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnIHR1cmQ6XCIjI1wifSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOlwiI1wiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgXV1cblxuICAgIGJsb2NrcyhbXCIsI2FcIl0pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzpcIixcIiB2YWx1ZToncHVuY3QnIHR1cmQ6IFwiLCNcIn0gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCd9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MiBsZW5ndGg6MSBzdHJpbmc6XCJhXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnZnVuY3Rpb24nXG5cbiAgICBibG9ja3MoWyctPiddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgYmxvY2tzKFsnPT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgIGJsb2NrcyhbJ2Y9LT4xJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczo1IGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonZicgdmFsdWU6J2Z1bmN0aW9uJ30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzonPScgdmFsdWU6J3B1bmN0JyAgICAgICAgICAgICAgIHR1cmQ6Jz0tPicgfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjIgbGVuZ3RoOjEgc3RyaW5nOictJyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDonLT4nfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjMgbGVuZ3RoOjEgc3RyaW5nOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46NCBsZW5ndGg6MSBzdHJpbmc6JzEnIHZhbHVlOidudW1iZXInfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnbWluaW1hbCdcbiAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoWycxJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonMScgdmFsdWU6J251bWJlcid9IF1dXG4gICAgYmxvY2tzKFsnYSddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6J2EnIHZhbHVlOid0ZXh0J30gXV1cbiAgICBibG9ja3MoWycuJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonLicgdmFsdWU6J3B1bmN0J30gXV1cblxuICAgIGJsb2NrcyhbJzEuYSddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjAgIGxlbmd0aDoxIHN0cmluZzonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDoxIHN0cmluZzonLicgdmFsdWU6J3B1bmN0IHByb3BlcnR5J30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MiAgbGVuZ3RoOjEgc3RyaW5nOidhJyB2YWx1ZToncHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgXG4gICAgYmxvY2tzKFsnKythJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MCAgbGVuZ3RoOjEgc3RyaW5nOicrJyB2YWx1ZToncHVuY3QnLCB0dXJkOicrKyd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDoxIHN0cmluZzonKycgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MiAgbGVuZ3RoOjEgc3RyaW5nOidhJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoW1wi4pa4ZG9jICdoZWxsbydcIl0pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxMiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjowICBsZW5ndGg6MSBzdHJpbmc6J+KWuCcgICAgIHZhbHVlOidwdW5jdCBtZXRhJ30gXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDozIHN0cmluZzonZG9jJyAgIHZhbHVlOidtZXRhJ30gXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjUgIGxlbmd0aDoxIHN0cmluZzpcIidcIiAgICAgdmFsdWU6J3B1bmN0IHN0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46NiAgbGVuZ3RoOjUgc3RyaW5nOlwiaGVsbG9cIiB2YWx1ZTonc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjoxMSBsZW5ndGg6MSBzdHJpbmc6XCInXCIgICAgIHZhbHVlOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgXG7ilrh0ZXN0ICdzcGFjZSdcblxuICAgIGIgPSBibG9ja3MgW1wieFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDBcblxuICAgIGIgPSBibG9ja3MgW1wiIHh4XCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgMVxuICAgIFxuICAgIGIgPSBibG9ja3MgW1wiICAgIHh4eFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDRcblxuICAgIGIgPSBibG9ja3MgW1wiICAgIHggMSAgLCBcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyA0XG4gICAgYlswXS5jaHVua3NbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgNlxuICAgIGJbMF0uY2h1bmtzWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDlcblxu4pa4dGVzdCAnc3dpdGNoZXMnXG4gICAgXG4gICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgIHggICAgXG4gICAgICAgICAgICB5XG4gICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuXG4gICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgIHggIFxuICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIHlcbiAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuXG4gICAgYiA9IGJsb2NrcyBcIlwiXCIgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICDilrhkb2MgJ2hlbGxvJyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdCAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgMSsxICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIOKWuGRvYyAnYWdhaW4nICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lICoqZG9jcyoqICAgICBcbiAgICAgICAgICAgIGBgYCAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB5ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nICAgICAgICAgICAgICAgXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls3XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls4XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIFxuIl19
//# sourceURL=../coffee/blocks.coffee