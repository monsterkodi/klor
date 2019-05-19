// koffee 0.43.0
var HEXNUM, NUMBER, PUNCT, SPACE, Syntax, _, blocked, blocks, chai, chunked, i, j, k, klog, kstr, lines0, lines1, noon, ranged, ref, slash, text0, text1;

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
    var addValue, advance, beforeIndex, chunk, chunkIndex, dashArrow, ext, extStack, extTop, formatString, getChunk, getString, getValue, handl, handlers, hashComment, hnd, interpolation, j, k, len, len1, len2, line, mtch, n, noonComment, number, popExt, popStack, popped, pushStack, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, regexp, setValue, simpleString, slashComment, stack, stackTop, stacked, topType;
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
            return 2;
        }
        if (chunk.turd === '=>') {
            addValue(0, 'function bound tail');
            addValue(1, 'function bound head');
            return 2;
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
                prev = line.chunks[chunkIndex - 1];
                next = line.chunks[chunkIndex + 1];
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
            pushStack({
                merge: true,
                type: (stackTop != null ? stackTop.merge : void 0) && stackTop.type + ' ' + type || type
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
            pushStack({
                merge: true,
                type: (stackTop != null ? stackTop.merge : void 0) && stackTop.type + ' ' + type || type
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
            pushStack({
                merge: true,
                type: (stackTop != null ? stackTop.merge : void 0) && stackTop.type + ' ' + type || type
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
        var ref1;
        return (ref1 = getChunk(d)) != null ? ref1.value : void 0;
    };
    getString = function(d) {
        var ref1;
        return (ref1 = getChunk(d)) != null ? ref1.string : void 0;
    };
    handlers = {
        koffee: {
            punct: [simpleString, hashComment, interpolation, dashArrow, regexp, stacked],
            word: [number, stacked]
        },
        coffee: {
            punct: [simpleString, hashComment, interpolation, dashArrow, regexp, stacked],
            word: [number, stacked]
        },
        noon: {
            punct: [noonComment, stacked],
            word: [number, stacked]
        },
        js: {
            punct: [slashComment, simpleString, dashArrow, regexp, stacked],
            word: [number, stacked]
        },
        ts: {
            punct: [slashComment, simpleString, dashArrow, regexp, stacked],
            word: [number, stacked]
        },
        md: {
            punct: [formatString, simpleString, stacked],
            word: [number, stacked]
        },
        js: {},
        iss: {},
        ini: {},
        sh: {},
        cpp: {},
        hpp: {},
        cs: {},
        c: {},
        h: {},
        pug: {},
        svg: {},
        html: {},
        htm: {},
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
    if (koffee_557_8 = process.hrtime()) {
        blocks(lines0);
        console.log('lines0', require('pretty-time')(process.hrtime(koffee_557_8)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUF1QyxPQUFBLENBQVEsS0FBUixDQUF2QyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkIsZUFBM0IsRUFBaUM7O0FBQW1CLElBQUEsNkJBQUE7SUFHaEQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO0lBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBQTtJQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7UUFBQSxNQUFBLEVBQVE7WUFBQSxHQUFBLEVBQVE7Z0JBQUEsRUFBQSxFQUFJLElBQUo7Z0JBQWEsRUFBQSxFQUFHLEtBQWhCO2dCQUErQixNQUFBLEVBQVEsQ0FBdkM7YUFBUjtTQUFSO1FBQ0EsRUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFRO2dCQUFBLEVBQUEsRUFBSSxRQUFKO2dCQUFhLEVBQUEsRUFBRyxjQUFoQjtnQkFBK0IsR0FBQSxFQUFRLEtBQXZDO2FBQVI7U0FEUjs7SUFHSixLQUFBLEdBQVEsS0FBSyxDQUFDLFFBQU4sQ0FBa0IsU0FBRCxHQUFXLG1DQUE1QjtJQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsUUFBTixDQUFrQixTQUFELEdBQVcsY0FBNUI7SUFFUixNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaO0lBQ1QsTUFBQSxHQUFTLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBWixFQWR1Qzs2RUFBQTs7O0FBZ0JwRCxLQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBUVQsT0FBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFFUCxRQUFBO0FBQUE7SUFrQkMsSUFBQSxHQUFPLFNBQUMsQ0FBRDtRQUFPLElBQUcsTUFBTSxDQUFDLElBQUssQ0FBQSxHQUFBLENBQUksQ0FBQyxjQUFqQixDQUFn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QUMsT0FBWixDQUFvQixPQUFwQixFQUE2QixhQUE3QixDQUZQOztZQUdKLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVjtBQU5KO0FBREo7V0FRQTtBQXhCSzs7QUEyQkwsS0FBUywwQkFBVDtJQUNJLE1BQUEsQ0FBTyxNQUFQO0FBREo7QUFLQSxLQUFTLDJCQUFUO0lBRUcsSUFBQSwrQkFBQTtRQUNLLE1BQUEsQ0FBTyxNQUFQLEVBREw7b0ZBQUE7O0FBRkg7O0FBWUosTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLE1BQUEsRUFBUSxTQUFDLFFBQUQsRUFBVyxHQUFYO2VBQW1CLE1BQUEsQ0FBTyxNQUFBLENBQU8sQ0FBQyxRQUFELENBQVAsRUFBbUIsR0FBbkIsQ0FBUDtJQUFuQixDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiXG57IHNsYXNoLCBrc3RyLCBrbG9nLCBub29uLCBjaGFpLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbuKWuHByb2ZpbGUgJy0tLS0tJyBcbiAgICBTeW50YXggPSByZXF1aXJlICcuL3N5bnRheCdcbiAgICBTeW50YXguaW5pdCgpXG4gICAgXG4gICAgU3ludGF4LnN3dGNoID0gXG4gICAgICAgIGtvZmZlZTogJ+KWuCc6ICAgIHRvOiAnbWQnICAgICB3MDonZG9jJyAgICAgICAgICBpbmRlbnQ6IDFcbiAgICAgICAgbWQ6ICAgICAnYGBgJzogIHRvOiAna29mZmVlJyB3MDonY29mZmVlc2NyaXB0JyBlbmQ6ICAgICdgYGAnXG5cbiAgICB0ZXh0MCA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9Ly4uLy4uL2tvZmZlZS9jb2ZmZWUvbm9kZXMuY29mZmVlXCIgIyA2LTExbXNcbiAgICB0ZXh0MSA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9L3Rlc3QuY29mZmVlXCIgIyA1MC0xMjDOvHNcblxuICAgIGxpbmVzMCA9IHRleHQwLnNwbGl0ICdcXG4nXG4gICAgbGluZXMxID0gdGV4dDEuc3BsaXQgJ1xcbidcbiAgICAgICAgXG5TUEFDRSAgPSAvXFxzL1xuUFVOQ1QgID0gL1xcVysvZ2lcbk5VTUJFUiA9IC9eXFxkKyQvXG5IRVhOVU0gPSAvXjB4W2EtZkEtRlxcZF0rJC9cblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbmNodW5rZWQgPSAobGluZXMsIGV4dCkgLT4gICAgXG5cbiAgICDilrhkb2MgJ2NodW5rZWQgKmxpbmVzKiwgKmV4dConXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmc6IHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAgc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IG5cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgZXh0OiAgICBzXG4gICAgICAgICAgICBjaGFyczogIG5cbiAgICAgICAgICAgIGluZGV4OiAgblxuICAgICAgICAgICAgbnVtYmVyOiBuKzFcbiAgICBcbiAgICB3b3JkID0gKHcpIC0+IGlmIFN5bnRheC5sYW5nW2V4dF0uaGFzT3duUHJvcGVydHkgdyB0aGVuIFN5bnRheC5sYW5nW2V4dF1bd10gZWxzZSAndGV4dCdcbiAgICBcbiAgICBsaW5lbm8gPSAwXG4gICAgbGluZXMubWFwICh0ZXh0KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGxpbmUgPSBcbiAgICAgICAgICAgIGNodW5rczogW11cbiAgICAgICAgICAgIGNoYXJzOiAgMFxuICAgICAgICAgICAgaW5kZXg6ICBsaW5lbm8rK1xuICAgICAgICAgICAgbnVtYmVyOiBsaW5lbm9cbiAgICAgICAgICAgIGV4dDogICAgZXh0XG5cbiAgICAgICAgY2h1bmtzID0gdGV4dC5zcGxpdCBTUEFDRVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmtzLmxlbmd0aCA9PSAxIGFuZCBjaHVua3NbMF0gPT0gJydcbiAgICAgICAgICAgIHJldHVybiBsaW5lICMgZW1wdHkgbGluZVxuICAgICAgICAgICAgXG4gICAgICAgIGMgPSAwXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB3aGlsZSBtID0gUFVOQ1QuZXhlYyBzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgd2wgPSBtLmluZGV4LShjLXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHNbYy1zYy4uLm0uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIGNvbHVtbjpjLCBsZW5ndGg6d2wsIHN0cmluZzp3LCB2YWx1ZTp3b3JkIHcgXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHB1bmN0ID0gbVswXVxuICAgICAgICAgICAgICAgICAgICBmb3IgcGMgaW4gcHVuY3RbLi4uLTFdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIGNvbHVtbjpjKyssIGxlbmd0aDoxLCBzdHJpbmc6cGMsIHR1cmQ6dHVyZCwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHR1cmRbMS4uXVxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIGNvbHVtbjpjKyssIGxlbmd0aDoxLCBzdHJpbmc6cHVuY3RbLTFdLCB2YWx1ZToncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgYyA8IHNjK2wgICAgICAgICMgY2hlY2sgZm9yIHJlbWFpbmluZyBub24tcHVuY3RcbiAgICAgICAgICAgICAgICAgICAgcmwgPSBzYytsLWMgICAgIyBsZW5ndGggb2YgcmVtYWluZGVyXG4gICAgICAgICAgICAgICAgICAgIHcgPSBzW2wtcmwuLl0gICMgdGV4dCAgIG9mIHJlbWFpbmRlciBcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YywgbGVuZ3RoOnJsLCBzdHJpbmc6dywgdmFsdWU6d29yZCB3XG4gICAgICAgICAgICAgICAgICAgIGMgKz0gcmxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmUuY2h1bmtzWy0xXVxuICAgICAgICAgICAgbGluZS5jaGFycyA9IGxhc3QuY29sdW1uICsgbGFzdC5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICBsaW5lXG4gICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcblxuYmxvY2tlZCA9IChsaW5lcykgLT5cbiAgICBcbiAgICDilrhkb2MgJ2Jsb2NrZWQgKmxpbmVzKidcbiAgICAgICAgXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgICAgIFxuICAgICAgICAqKnJldHVybnMqKiBsaW5lcyB3aXRoIFxuICAgICAgICAtICdleHQnIHN3aXRjaGVkIGluIHNvbWUgbGluZXNcbiAgICAgICAgLSAndmFsdWUnIGNoYW5nZWQgaW4gY2h1bmtzIHRoYXQgbWF0Y2ggbGFuZ3VhZ2UgcGF0dGVybnNcbiAgICAgICAgICBcbiAgICBleHRTdGFjayAgID0gW11cbiAgICBleHRUb3AgICAgID0gbnVsbFxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBbXVxuICAgIHRvcFR5cGUgICAgPSBudWxsXG4gICAgc3RhY2tUb3AgICA9IG51bGxcbiAgICBleHQgICAgICAgID0gbnVsbFxuICAgIGNodW5rICAgICAgPSBudWxsXG4gICAgbGluZSAgICAgICA9IG51bGxcbiAgICBjaHVua0luZGV4ID0gbnVsbFxuXG4gICAgcG9wRXh0ID0gLT5cbiAgICAgICAgc3RhY2sgPSBleHRUb3Auc3RhY2tcbiAgICAgICAgIyBsaW5lLnBvcCA9IHRydWVcbiAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3RhcnQuZXh0XG4gICAgICAgIGV4dFN0YWNrLnBvcCgpICAgICAgICAgICAgICAgXG4gICAgICAgIGV4dFRvcCA9IGV4dFN0YWNrWy0xXVxuICAgIFxuICAgIHB1c2hTdGFjayA9IChvKSAtPiBcbiAgICAgICAgc3RhY2sucHVzaCBvIFxuICAgICAgICBzdGFja1RvcCA9IG9cbiAgICAgICAgdG9wVHlwZSA9IG8udHlwZVxuICAgICAgICBcbiAgICBwb3BTdGFjayA9IC0+IFxuICAgICAgICBzdGFjay5wb3AoKVxuICAgICAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgICAgICB0b3BUeXBlID0gc3RhY2tUb3A/LnR5cGVcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGhhc2hDb21tZW50ID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMCBpZiBzdGFja1RvcFxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09IFwiI1wiXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIGNvbW1lbnQnXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICBmb3IgYyBpbiBsaW5lLmNodW5rc1tjaHVua0luZGV4KzEuLl1cbiAgICAgICAgICAgICAgICAgICAgYy52YWx1ZSA9ICdjb21tZW50J1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUuY2h1bmtzLmxlbmd0aCAtIGNodW5rSW5kZXggKyAxXG4gICAgICAgIDBcblxuICAgIG5vb25Db21tZW50ID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMCBpZiBzdGFja1RvcFxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09IFwiI1wiIGFuZCBjaHVua0luZGV4ID09IDAgIyB0aGUgb25seSBkaWZmZXJlbmNlLiBtZXJnZSB3aXRoIGhhc2hDb21tZW50P1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyBjb21tZW50J1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgZm9yIGMgaW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCsxLi5dXG4gICAgICAgICAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgIHJldHVybiBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgIHNsYXNoQ29tbWVudCA9IC0+IDBcbiAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcbiAgICBcbiAgICBkYXNoQXJyb3cgPSAtPlxuXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJy0+J1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2Z1bmN0aW9uIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJz0+J1xuICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2Z1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxLCAnZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgIDBcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICByZWdleHAgPSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgdG9wVHlwZSA9PSAnc3RyaW5nJ1xuXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9wVHlwZSA9PSAncmVnZXhwJ1xuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggXG4gICAgICAgICAgICAgICAgcHJldiA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgtMV1cbiAgICAgICAgICAgICAgICBuZXh0ID0gbGluZS5jaHVua3NbY2h1bmtJbmRleCsxXVxuICAgICAgICAgICAgICAgIGlmIG5vdCBwcmV2LnZhbHVlLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMCBpZiAocHJldi5jb2x1bW4rcHJldi5sZW5ndGggPCAgY2h1bmsuY29sdW1uKSBhbmQgbmV4dD8uY29sdW1uID4gIGNodW5rLmNvbHVtbisxXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwIGlmIChwcmV2LmNvbHVtbitwcmV2Lmxlbmd0aCA9PSBjaHVuay5jb2x1bW4pIGFuZCBuZXh0Py5jb2x1bW4gPT0gY2h1bmsuY29sdW1uKzFcbiAgXG4gICAgICAgICAgICBwdXNoU3RhY2sgdHlwZToncmVnZXhwJ1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyByZWdleHAgc3RhcnQnXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgc2ltcGxlU3RyaW5nID0gLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiAwIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyBpbiBbJ1wiJyBcIidcIiAnYCddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgtMV0/LmVzY2FwZVxuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZSA9IHN3aXRjaCBjaHVuay5zdHJpbmcgXG4gICAgICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnIFxuICAgICAgICAgICAgICAgIHdoZW4gXCInXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgICAgICB3aGVuICdgJyB0aGVuICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRvcFR5cGUgPT0gdHlwZVxuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIHR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIGVsc2UgaWYgc3RhY2tUb3AgYW5kIHRvcFR5cGUgIT0gJ2ludGVycG9sYXRpb24nXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWVcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09ICdcXFxcJyBhbmQgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSAwIG9yIG5vdCBsaW5lLmNodW5rc1tjaHVua0luZGV4LTFdLmVzY2FwZVxuICAgICAgICAgICAgICAgIGNodW5rLmVzY2FwZSA9IHRydWVcbiAgICAgICAgMFxuICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwICAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBmb3JtYXRTdHJpbmcgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnKionXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSAnYm9sZCdcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMSwgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSwgdHlwZTpzdGFja1RvcD8ubWVyZ2UgYW5kIHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIG9yIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09ICcqJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gJ2l0YWxpYydcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlLCB0eXBlOnN0YWNrVG9wPy5tZXJnZSBhbmQgc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgb3IgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09ICdgJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlID0gJ2JhY2t0aWNrJ1xuICAgICAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggdHlwZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlLCB0eXBlOnN0YWNrVG9wPy5tZXJnZSBhbmQgc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgb3IgdHlwZVxuICAgICAgICAgICAgYWRkVmFsdWUgMCwgdHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4gICAgXG4gICAgaW50ZXJwb2xhdGlvbiA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09ICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggXCJcXCN7XCJcbiAgICAgICAgICAgICAgICBwdXNoU3RhY2sgdHlwZTonaW50ZXJwb2xhdGlvbicsIHdlYWs6dHJ1ZVxuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAxLCAnc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiB0b3BUeXBlID09ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gJ30nXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ3N0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIG51bWJlciA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBOVU1CRVIudGVzdCBjaHVuay5zdHJpbmdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZ2V0U3RyaW5nKC0xKSA9PSAnLidcblxuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC00KSA9PSAnbnVtYmVyIGZsb2F0JyBhbmQgZ2V0VmFsdWUoLTIpID09ICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC00LCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXInXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEhFWE5VTS50ZXN0IGNodW5rLnN0cmluZ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIHN0YWNrZWQgPSAtPlxuXG4gICAgICAgIGlmIHN0YWNrVG9wXG4gICAgICAgICAgICByZXR1cm4gaWYgc3RhY2tUb3Aud2Vha1xuICAgICAgICAgICAgaWYgc3RhY2tUb3Auc3Ryb25nXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgPSB0b3BUeXBlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgdG9wVHlwZVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICBnZXRDaHVuayAgPSAoZCkgLT4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXVxuICAgIHNldFZhbHVlICA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlID0gdmFsdWVcbiAgICBhZGRWYWx1ZSAgPSAoZCwgdmFsdWUpIC0+IGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS52YWx1ZSArPSAnICcgKyB2YWx1ZVxuICAgIGdldFZhbHVlICA9IChkKSAtPiBnZXRDaHVuayhkKT8udmFsdWVcbiAgICBnZXRTdHJpbmcgPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/LnN0cmluZ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaGFuZGxlcnMgPSBcbiAgICAgICAga29mZmVlOiBwdW5jdDogWyBzaW1wbGVTdHJpbmcsIGhhc2hDb21tZW50LCBpbnRlcnBvbGF0aW9uLCBkYXNoQXJyb3csICByZWdleHAsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgc3RhY2tlZF1cbiAgICAgICAgY29mZmVlOiBwdW5jdDogWyBzaW1wbGVTdHJpbmcsIGhhc2hDb21tZW50LCBpbnRlcnBvbGF0aW9uLCBkYXNoQXJyb3csICByZWdleHAsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgc3RhY2tlZF1cbiAgICAgICAgbm9vbjogICBwdW5jdDogWyBub29uQ29tbWVudCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgc3RhY2tlZF1cbiAgICAgICAganM6ICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgc3RhY2tlZF1cbiAgICAgICAgdHM6ICAgICBwdW5jdDogWyBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgc3RhY2tlZF1cbiAgICAgICAgbWQ6ICAgICBwdW5jdDogWyBmb3JtYXRTdHJpbmcsIHNpbXBsZVN0cmluZywgc3RhY2tlZCBdLCB3b3JkOiBbbnVtYmVyLCBzdGFja2VkXVxuICAgICAgICBqczogICAgIHt9XG4gICAgICAgIGlzczogICAge31cbiAgICAgICAgaW5pOiAgICB7fVxuICAgICAgICBzaDogICAgIHt9XG4gICAgICAgIGNwcDogICAge31cbiAgICAgICAgaHBwOiAgICB7fVxuICAgICAgICBjczogICAgIHt9XG4gICAgICAgIGM6ICAgICAge31cbiAgICAgICAgaDogICAgICB7fVxuICAgICAgICBwdWc6ICAgIHt9XG4gICAgICAgIHN2ZzogICAge31cbiAgICAgICAgaHRtbDogICB7fVxuICAgICAgICBodG06ICAgIHt9XG4gICAgICAgIHN0eWw6ICAge30gICBcbiAgICAgICAgY3NzOiAgICB7fSAgIFxuICAgICAgICBzYXNzOiAgIHt9ICAgXG4gICAgICAgIHNjc3M6ICAge30gIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICBcbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICAgICBcbiAgICAgICAgaWYgZXh0VG9wXG4gICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmluZGVudCBhbmQgbGluZS5jaHVua3NbMF0/LmNvbHVtbiA8PSBleHRUb3Auc3RhcnQuY2h1bmtzWzBdLmNvbHVtblxuICAgICAgICAgICAgICAgIHBvcEV4dCgpICAgICAgICAgICAgICAgICAgICAgICAgIyBlbmQgb2YgZXh0ZW5zaW9uIGJsb2NrIHJlYWNoZWQgdGhhdCBpcyB0ZXJtaW5hdGVkIGJ5IGluZGVudGF0aW9uXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGluZS5leHQgPSBleHRUb3Auc3dpdGNoLnRvICAgICAjIG1ha2Ugc3VyZSB0aGUgY3VycmVudCBsaW5lIGV4dCBtYXRjaGVzIHRoZSB0b3Btb3N0IGZyb20gc3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZXh0ICE9IGxpbmUuZXh0ICAgICAgICAgICAgICAgICAgICAgICMgZWl0aGVyIGF0IHN0YXJ0IG9mIGZpbGUgb3Igd2Ugc3dpdGNoZWQgZXh0ZW5zaW9uXG4gICAgICAgICAgICBoYW5kbCA9IGhhbmRsZXJzW2V4dCA9IGxpbmUuZXh0XSAgICAjIGluc3RhbGwgbmV3IGhhbmRsZXJzXG4gICAgICAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgd2hpbGUgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgY2h1bmsgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4XVxuICAgICAgICAgICAgYmVmb3JlSW5kZXggPSBjaHVua0luZGV4XG4gICAgICAgICAgICBpZiBjaHVuay52YWx1ZSA9PSAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbXRjaCA9IFN5bnRheC50dXJkW2xpbmUuZXh0XT9bY2h1bmsuc3RyaW5nXSAjIOKWuCBkb2NcbiAgICAgICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgbXRjaC50dXJkIGlmIG10Y2gudHVyZFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tjaHVua0luZGV4KzFdPy52YWx1ZSA9IG10Y2hbJ3ctMCddIGlmIG10Y2hbJ3ctMCddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwb3BwZWQgPSBmYWxzZVxuICAgICAgICAgICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmVuZD8gYW5kIGV4dFRvcC5zd2l0Y2guZW5kID09IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcEV4dCgpICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSB0dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BwZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBwb3BwZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgbXRjaCA9IFN5bnRheC5zd3RjaFtsaW5lLmV4dF0/W2NodW5rLnR1cmQgPyBjaHVuay5zdHJpbmddXG4gICAgICAgICAgICAgICAgICAgICAgICAjIHB1c2ggYSBuZXcgZXh0ZW5zaW9uIG9udG8gdGhlIHN0YWNrLCBleHQgd2lsbCBjaGFuZ2Ugb24gc3RhcnQgb2YgbmV4dCBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRTdGFjay5wdXNoIGV4dFRvcCA9IHN3aXRjaDptdGNoLCBzdGFydDpsaW5lLCBzdGFjazpzdGFja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBobmQgaW4gaGFuZGwucHVuY3QgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLndvcmQgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSBiZWZvcmVJbmRleFxuICAgICAgICAgICAgICAgIGNodW5rSW5kZXgrK1xuICAgIGxpbmVzXG4gICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmJsb2NrcyA9IChsaW5lcywgZXh0PSdrb2ZmZWUnKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tzICpsaW5lcyosICpleHQqJ1xuXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBzdHJpbmdzXG4gICAgICAgIFxuICAgICAgICAqZXh0KjpcbiAgICAgICAgLSBrb2ZmZWUgY29mZmVlIGpzIHRzIFxuICAgICAgICAtIHN0eWwgY3NzIHNhc3Mgc2NzcyBcbiAgICAgICAgLSBwdWcgaHRtbCBodG0gc3ZnIFxuICAgICAgICAtIGNwcCBocHAgY3h4IGMgaCBcbiAgICAgICAgLSBiYXNoIGZpc2ggc2ggXG4gICAgICAgIC0gbm9vbiBqc29uXG4gICAgICAgIC0gbWQgcGxpc3QgXG4gICAgICAgIC0gaXNzIGluaVxuICAgICAgICAtIHR4dCBsb2cgXG5cbiAgICAgICAgKipyZXR1cm5zKiogdGhlIHJlc3VsdCBvZlxuICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICAgICAgYGBgXG5cbiAgICBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5yYW5nZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdyYW5nZWQgKmxpbmVzKidcbiAgICAgICAgXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgICAgIFxuICAgICAgICAqKnJldHVybnMqKiBhcnJheSBvZlxuXG4gICAgICAgICAgICBzdGFydDogblxuICAgICAgICAgICAgbWF0Y2g6IHNcbiAgICAgICAgICAgIHZhbHVlOiBzXG4gICAgICAgIFxuICAgIHJuZ3MgPSBbXVxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAga2xvZyBjaHVuay52YWx1ZSBpZiBub3QgY2h1bmsudmFsdWUucmVwbGFjZVxuICAgICAgICAgICAgcmFuZ2UgPVxuICAgICAgICAgICAgICAgIHN0YXJ0OiBjaHVuay5jb2x1bW5cbiAgICAgICAgICAgICAgICBtYXRjaDogY2h1bmsuc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNodW5rLnZhbHVlLnJlcGxhY2UgJ3B1bmN0JywgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgcm5ncy5wdXNoIHJhbmdlXG4gICAgcm5nc1xuXG7ilrhpZiAxXG4gICAgZm9yIGkgaW4gWzAuLjNdXG4gICAgICAgIGJsb2NrcyBsaW5lczBcbiAgICAgICAgIyBibG9ja3MgbGluZXMxXG4gICAgICAgICMgbGluZXMwLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAna29mZmVlJ1xuICAgICAgICBcbiAgICBmb3IgaSBpbiBbMC4uMTVdXG4gICAgICAgIFxuICAgICAgICDilrhwcm9maWxlICdsaW5lczAnXG4gICAgICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgICAgICMg4pa4cHJvZmlsZSAnc3ludGF4MCdcbiAgICAgICAgICAgICMgbGluZXMwLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAna29mZmVlJ1xuICAgICAgICAgICAgXG4gICAgICAgICMg4pa4cHJvZmlsZSAnbGluZXMxJ1xuICAgICAgICAgICAgIyBibG9ja3MgbGluZXMxXG4gICAgICAgICMg4pa4cHJvZmlsZSAnc3ludGF4MSdcbiAgICAgICAgICAgICMgbGluZXMxLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAna29mZmVlJ1xuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID1cbiAgICByYW5nZXM6ICh0ZXh0bGluZSwgZXh0KSAtPiByYW5nZWQgYmxvY2tzIFt0ZXh0bGluZV0sIGV4dFxuICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgICAgICAgICAgIDAwMCAgICAgMDAwICAgICBcbiMgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG5cbuKWuHRlc3QgJ2NvbW1lbnQnXG5cbiAgICBjaGFpKClcbiAgICBcbiAgICBibG9ja3MoW1wiIyNcIl0pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCcgdHVyZDpcIiMjXCJ9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MSBsZW5ndGg6MSBzdHJpbmc6XCIjXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICBdXVxuXG4gICAgYmxvY2tzKFtcIiwjYVwiXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOlwiLFwiIHZhbHVlOidwdW5jdCcgdHVyZDogXCIsI1wifSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50J30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoyIGxlbmd0aDoxIHN0cmluZzpcImFcIiB2YWx1ZTonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgXG7ilrh0ZXN0ICdmdW5jdGlvbidcblxuICAgIGJsb2NrcyhbJy0+J10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6ICctPid9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MSBsZW5ndGg6MSBzdHJpbmc6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICBibG9ja3MoWyc9PiddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6Jz0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJyB0dXJkOiAnPT4nfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCd9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgYmxvY2tzKFsnZj0tPjEnXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjUgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOidmJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MSBsZW5ndGg6MSBzdHJpbmc6Jz0nIHZhbHVlOidwdW5jdCcgICAgICAgICAgICAgICB0dXJkOic9LT4nIH0gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoyIGxlbmd0aDoxIHN0cmluZzonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6Jy0+J30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjozIGxlbmd0aDoxIHN0cmluZzonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjQgbGVuZ3RoOjEgc3RyaW5nOicxJyB2YWx1ZTonbnVtYmVyJ30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICBcbuKWuHRlc3QgJ21pbmltYWwnXG4gICAgICAgICAgICAgICAgXG4gICAgYmxvY2tzKFsnMSddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6JzEnIHZhbHVlOidudW1iZXInfSBdXVxuICAgIGJsb2NrcyhbJ2EnXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOidhJyB2YWx1ZTondGV4dCd9IF1dXG4gICAgYmxvY2tzKFsnLiddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6Jy4nIHZhbHVlOidwdW5jdCd9IF1dXG5cbiAgICBibG9ja3MoWycxLmEnXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjowICBsZW5ndGg6MSBzdHJpbmc6JzEnIHZhbHVlOidudW1iZXInfSBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjoxICBsZW5ndGg6MSBzdHJpbmc6Jy4nIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjIgIGxlbmd0aDoxIHN0cmluZzonYScgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgXG4gICAgYmxvY2tzKFsnKythJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MCAgbGVuZ3RoOjEgc3RyaW5nOicrJyB2YWx1ZToncHVuY3QnLCB0dXJkOicrKyd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDoxIHN0cmluZzonKycgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MiAgbGVuZ3RoOjEgc3RyaW5nOidhJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoW1wi4pa4ZG9jICdoZWxsbydcIl0pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxMiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjowICBsZW5ndGg6MSBzdHJpbmc6J+KWuCcgICAgIHZhbHVlOidwdW5jdCBtZXRhJ30gXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDozIHN0cmluZzonZG9jJyAgIHZhbHVlOidtZXRhJ30gXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjUgIGxlbmd0aDoxIHN0cmluZzpcIidcIiAgICAgdmFsdWU6J3B1bmN0IHN0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46NiAgbGVuZ3RoOjUgc3RyaW5nOlwiaGVsbG9cIiB2YWx1ZTonc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjoxMSBsZW5ndGg6MSBzdHJpbmc6XCInXCIgICAgIHZhbHVlOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgXG7ilrh0ZXN0ICdzcGFjZSdcblxuICAgIGIgPSBibG9ja3MgW1wieFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDBcblxuICAgIGIgPSBibG9ja3MgW1wiIHh4XCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgMVxuICAgIFxuICAgIGIgPSBibG9ja3MgW1wiICAgIHh4eFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDRcblxuICAgIGIgPSBibG9ja3MgW1wiICAgIHggMSAgLCBcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyA0XG4gICAgYlswXS5jaHVua3NbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgNlxuICAgIGJbMF0uY2h1bmtzWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDlcblxu4pa4dGVzdCAnc3dpdGNoZXMnXG4gICAgXG4gICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgIHggICAgXG4gICAgICAgICAgICB5XG4gICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuXG4gICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgIHggIFxuICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIHlcbiAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuXG4gICAgYiA9IGJsb2NrcyBcIlwiXCIgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICDilrhkb2MgJ2hlbGxvJyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdCAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgMSsxICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIOKWuGRvYyAnYWdhaW4nICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lICoqZG9jcyoqICAgICBcbiAgICAgICAgICAgIGBgYCAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB5ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nICAgICAgICAgICAgICAgXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls3XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYls4XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIFxuIl19
//# sourceURL=../coffee/blocks.coffee