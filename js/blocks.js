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
            if (topType != null ? topType.endsWith('bold') : void 0) {
                addValue(0, topType);
                addValue(1, topType);
                popStack();
                return 2;
            }
            type = 'bold';
            if (stackTop != null ? stackTop.merge : void 0) {
                type = stackTop.type + ' ' + type;
            }
            pushStack({
                type: type,
                merge: true
            });
            addValue(0, type);
            addValue(1, type);
            return 2;
        }
        if (chunk.string === '*') {
            if (topType != null ? topType.endsWith('italic') : void 0) {
                addValue(0, topType);
                popStack();
                return 1;
            }
            type = 'italic';
            if (stackTop != null ? stackTop.merge : void 0) {
                type = stackTop.type + ' ' + type;
            }
            pushStack({
                type: type,
                merge: true
            });
            addValue(0, type);
            return 1;
        }
        if (chunk.string === '`') {
            if (topType != null ? topType.endsWith('backtick') : void 0) {
                addValue(0, topType);
                popStack();
                return 1;
            }
            type = 'backtick';
            if (stackTop != null ? stackTop.merge : void 0) {
                type = stackTop.type + ' ' + type;
            }
            pushStack({
                type: type,
                merge: true
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
    if (koffee_563_8 = process.hrtime()) {
        blocks(lines0);
        console.log('lines0', require('pretty-time')(process.hrtime(koffee_563_8)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUF1QyxPQUFBLENBQVEsS0FBUixDQUF2QyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkIsZUFBM0IsRUFBaUM7O0FBQW1CLElBQUEsNkJBQUE7SUFHaEQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO0lBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBQTtJQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7UUFBQSxNQUFBLEVBQVE7WUFBQSxHQUFBLEVBQVE7Z0JBQUEsRUFBQSxFQUFJLElBQUo7Z0JBQWEsRUFBQSxFQUFHLEtBQWhCO2dCQUErQixNQUFBLEVBQVEsQ0FBdkM7YUFBUjtTQUFSO1FBQ0EsRUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFRO2dCQUFBLEVBQUEsRUFBSSxRQUFKO2dCQUFhLEVBQUEsRUFBRyxjQUFoQjtnQkFBK0IsR0FBQSxFQUFRLEtBQXZDO2FBQVI7U0FEUjs7SUFHSixLQUFBLEdBQVEsS0FBSyxDQUFDLFFBQU4sQ0FBa0IsU0FBRCxHQUFXLG1DQUE1QjtJQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsUUFBTixDQUFrQixTQUFELEdBQVcsY0FBNUI7SUFFUixNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaO0lBQ1QsTUFBQSxHQUFTLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBWixFQWR1Qzs2RUFBQTs7O0FBZ0JwRCxLQUFBLEdBQVM7O0FBQ1QsS0FBQSxHQUFTOztBQUNULE1BQUEsR0FBUzs7QUFDVCxNQUFBLEdBQVM7O0FBUVQsT0FBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFFUCxRQUFBO0FBQUE7SUFrQkMsSUFBQSxHQUFPLFNBQUMsQ0FBRDtRQUFPLElBQUcsTUFBTSxDQUFDLElBQUssQ0FBQSxHQUFBLENBQUksQ0FBQyxjQUFqQixDQUFn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LEtBQUssQ0FBQyxNQURiO2dCQUVBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQVosQ0FBb0IsT0FBcEIsRUFBNkIsYUFBN0IsQ0FGUDs7WUFHSixJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVY7QUFOSjtBQURKO1dBUUE7QUF4Qks7O0FBMkJMLEtBQVMsMEJBQVQ7SUFDSSxNQUFBLENBQU8sTUFBUDtBQURKO0FBS0EsS0FBUywyQkFBVDtJQUVHLElBQUEsK0JBQUE7UUFDSyxNQUFBLENBQU8sTUFBUCxFQURMO29GQUFBOztBQUZIOztBQVlKLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQVEsU0FBQyxRQUFELEVBQVcsR0FBWDtlQUFtQixNQUFBLENBQU8sTUFBQSxDQUFPLENBQUMsUUFBRCxDQUFQLEVBQW1CLEdBQW5CLENBQVA7SUFBbkIsQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbIlxueyBzbGFzaCwga3N0ciwga2xvZywgbm9vbiwgY2hhaSwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG7ilrhwcm9maWxlICctLS0tLScgXG4gICAgU3ludGF4ID0gcmVxdWlyZSAnLi9zeW50YXgnXG4gICAgU3ludGF4LmluaXQoKVxuICAgIFxuICAgIFN5bnRheC5zd3RjaCA9IFxuICAgICAgICBrb2ZmZWU6ICfilrgnOiAgICB0bzogJ21kJyAgICAgdzA6J2RvYycgICAgICAgICAgaW5kZW50OiAxXG4gICAgICAgIG1kOiAgICAgJ2BgYCc6ICB0bzogJ2tvZmZlZScgdzA6J2NvZmZlZXNjcmlwdCcgZW5kOiAgICAnYGBgJ1xuXG4gICAgdGV4dDAgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvY29mZmVlL25vZGVzLmNvZmZlZVwiICMgNi0xMW1zXG4gICAgdGV4dDEgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiICMgNTAtMTIwzrxzXG5cbiAgICBsaW5lczAgPSB0ZXh0MC5zcGxpdCAnXFxuJ1xuICAgIGxpbmVzMSA9IHRleHQxLnNwbGl0ICdcXG4nXG4gICAgICAgIFxuU1BBQ0UgID0gL1xccy9cblBVTkNUICA9IC9cXFcrL2dpXG5OVU1CRVIgPSAvXlxcZCskL1xuSEVYTlVNID0gL14weFthLWZBLUZcXGRdKyQvXG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5jaHVua2VkID0gKGxpbmVzLCBleHQpIC0+ICAgIFxuXG4gICAg4pa4ZG9jICdjaHVua2VkICpsaW5lcyosICpleHQqJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGFycmF5IG9mXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nOiBzXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogIHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogblxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIGV4dDogICAgc1xuICAgICAgICAgICAgY2hhcnM6ICBuXG4gICAgICAgICAgICBpbmRleDogIG5cbiAgICAgICAgICAgIG51bWJlcjogbisxXG4gICAgXG4gICAgd29yZCA9ICh3KSAtPiBpZiBTeW50YXgubGFuZ1tleHRdLmhhc093blByb3BlcnR5IHcgdGhlbiBTeW50YXgubGFuZ1tleHRdW3ddIGVsc2UgJ3RleHQnXG4gICAgXG4gICAgbGluZW5vID0gMFxuICAgIGxpbmVzLm1hcCAodGV4dCkgLT4gXG4gICAgICAgIFxuICAgICAgICBsaW5lID0gXG4gICAgICAgICAgICBjaHVua3M6IFtdXG4gICAgICAgICAgICBjaGFyczogIDBcbiAgICAgICAgICAgIGluZGV4OiAgbGluZW5vKytcbiAgICAgICAgICAgIG51bWJlcjogbGluZW5vXG4gICAgICAgICAgICBleHQ6ICAgIGV4dFxuXG4gICAgICAgIGNodW5rcyA9IHRleHQuc3BsaXQgU1BBQ0VcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICByZXR1cm4gbGluZSAjIGVtcHR5IGxpbmVcbiAgICAgICAgICAgIFxuICAgICAgICBjID0gMFxuICAgICAgICBmb3IgcyBpbiBjaHVua3NcbiAgICAgICAgICAgIGlmIHMgPT0gJydcbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBjKytcbiAgICAgICAgICAgICAgICBsID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzYyA9IGNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIHNlcGVyYXRlIGJ5IHB1bmN0dWF0aW9uXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgd2hpbGUgbSA9IFBVTkNULmV4ZWMgc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5pbmRleCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdsID0gbS5pbmRleC0oYy1zYylcbiAgICAgICAgICAgICAgICAgICAgICAgIHcgPSBzW2Mtc2MuLi5tLmluZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YywgbGVuZ3RoOndsLCBzdHJpbmc6dywgdmFsdWU6d29yZCB3IFxuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSB3bFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHR1cmQgPSBwdW5jdCA9IG1bMF1cbiAgICAgICAgICAgICAgICAgICAgZm9yIHBjIGluIHB1bmN0Wy4uLi0xXVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YysrLCBsZW5ndGg6MSwgc3RyaW5nOnBjLCB0dXJkOnR1cmQsIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHR1cmQgPSB0dXJkWzEuLl1cbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YysrLCBsZW5ndGg6MSwgc3RyaW5nOnB1bmN0Wy0xXSwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXIgXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggY29sdW1uOmMsIGxlbmd0aDpybCwgc3RyaW5nOncsIHZhbHVlOndvcmQgd1xuICAgICAgICAgICAgICAgICAgICBjICs9IHJsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGxhc3QgPSBsaW5lLmNodW5rc1stMV1cbiAgICAgICAgICAgIGxpbmUuY2hhcnMgPSBsYXN0LmNvbHVtbiArIGxhc3QubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgbGluZVxuICAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbmJsb2NrZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdibG9ja2VkICpsaW5lcyonXG4gICAgICAgIFxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogbGluZXMgd2l0aCBcbiAgICAgICAgLSAnZXh0JyBzd2l0Y2hlZCBpbiBzb21lIGxpbmVzXG4gICAgICAgIC0gJ3ZhbHVlJyBjaGFuZ2VkIGluIGNodW5rcyB0aGF0IG1hdGNoIGxhbmd1YWdlIHBhdHRlcm5zXG4gICAgICAgICAgXG4gICAgZXh0U3RhY2sgICA9IFtdXG4gICAgZXh0VG9wICAgICA9IG51bGxcbiAgICBoYW5kbCAgICAgID0gW11cbiAgICBzdGFjayAgICAgID0gW11cbiAgICB0b3BUeXBlICAgID0gbnVsbFxuICAgIHN0YWNrVG9wICAgPSBudWxsXG4gICAgZXh0ICAgICAgICA9IG51bGxcbiAgICBjaHVuayAgICAgID0gbnVsbFxuICAgIGxpbmUgICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IG51bGxcblxuICAgIHBvcEV4dCA9IC0+XG4gICAgICAgIHN0YWNrID0gZXh0VG9wLnN0YWNrXG4gICAgICAgICMgbGluZS5wb3AgPSB0cnVlXG4gICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN0YXJ0LmV4dFxuICAgICAgICBleHRTdGFjay5wb3AoKSAgICAgICAgICAgICAgIFxuICAgICAgICBleHRUb3AgPSBleHRTdGFja1stMV1cbiAgICBcbiAgICBwdXNoU3RhY2sgPSAobykgLT4gXG4gICAgICAgIHN0YWNrLnB1c2ggbyBcbiAgICAgICAgc3RhY2tUb3AgPSBvXG4gICAgICAgIHRvcFR5cGUgPSBvLnR5cGVcbiAgICAgICAgXG4gICAgcG9wU3RhY2sgPSAtPiBcbiAgICAgICAgc3RhY2sucG9wKClcbiAgICAgICAgc3RhY2tUb3AgPSBzdGFja1stMV1cbiAgICAgICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBoYXNoQ29tbWVudCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgc3RhY2tUb3BcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSBcIiNcIlxuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyBjb21tZW50J1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgZm9yIGMgaW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCsxLi5dXG4gICAgICAgICAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgIHJldHVybiBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgMVxuICAgICAgICAwXG5cbiAgICBub29uQ29tbWVudCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgc3RhY2tUb3BcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSBcIiNcIiBhbmQgY2h1bmtJbmRleCA9PSAwICMgdGhlIG9ubHkgZGlmZmVyZW5jZS4gbWVyZ2Ugd2l0aCBoYXNoQ29tbWVudD9cbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgY29tbWVudCdcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGgtMVxuICAgICAgICAgICAgICAgIGZvciBjIGluIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMS4uXVxuICAgICAgICAgICAgICAgICAgICBjLnZhbHVlID0gJ2NvbW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gbGluZS5jaHVua3MubGVuZ3RoIC0gY2h1bmtJbmRleCArIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICBzbGFzaENvbW1lbnQgPSAtPiAwXG4gICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG4gICAgXG4gICAgZGFzaEFycm93ID0gLT5cblxuICAgICAgICBpZiBjaHVuay50dXJkID09ICctPidcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdmdW5jdGlvbiB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSwgJ2Z1bmN0aW9uIGhlYWQnXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkID09ICc9PidcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsICdmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSwgJ2Z1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAwXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgcmVnZXhwID0gLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiAwIGlmIHRvcFR5cGUgPT0gJ3N0cmluZydcblxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gJy8nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIHJlZ2V4cCBlbmQnXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IFxuICAgICAgICAgICAgICAgIHByZXYgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4LTFdXG4gICAgICAgICAgICAgICAgbmV4dCA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMV1cbiAgICAgICAgICAgICAgICBpZiBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDAgaWYgKHByZXYuY29sdW1uK3ByZXYubGVuZ3RoIDwgIGNodW5rLmNvbHVtbikgYW5kIG5leHQ/LmNvbHVtbiA+ICBjaHVuay5jb2x1bW4rMVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMCBpZiAocHJldi5jb2x1bW4rcHJldi5sZW5ndGggPT0gY2h1bmsuY29sdW1uKSBhbmQgbmV4dD8uY29sdW1uID09IGNodW5rLmNvbHVtbisxXG4gIFxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6J3JlZ2V4cCdcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgcmVnZXhwIHN0YXJ0J1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHNpbXBsZVN0cmluZyA9IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMCBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgaW4gWydcIicgXCInXCIgJ2AnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBsaW5lLmNodW5rc1tjaHVua0luZGV4LTFdPy5lc2NhcGVcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhY2tlZCgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSBzd2l0Y2ggY2h1bmsuc3RyaW5nIFxuICAgICAgICAgICAgICAgIHdoZW4gJ1wiJyB0aGVuICdzdHJpbmcgZG91YmxlJyBcbiAgICAgICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICAgICAgd2hlbiAnYCcgdGhlbiAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0eXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBlbHNlIGlmIHN0YWNrVG9wIGFuZCB0b3BUeXBlICE9ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnICcgKyB0eXBlXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnXFxcXCcgYW5kIHRvcFR5cGU/LnN0YXJ0c1dpdGggJ3N0cmluZydcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gMCBvciBub3QgbGluZS5jaHVua3NbY2h1bmtJbmRleC0xXS5lc2NhcGVcbiAgICAgICAgICAgICAgICBjaHVuay5lc2NhcGUgPSB0cnVlXG4gICAgICAgIDBcbiAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgZm9ybWF0U3RyaW5nID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJyoqJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCAnYm9sZCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCB0b3BUeXBlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMSwgdG9wVHlwZVxuICAgICAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgICAgICAgICB0eXBlID0gJ2JvbGQnXG4gICAgICAgICAgICBpZiBzdGFja1RvcD8ubWVyZ2UgdGhlbiB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIG1lcmdlOnRydWVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDEsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09ICcqJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCAnaXRhbGljJ1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgdHlwZSA9ICdpdGFsaWMnXG4gICAgICAgICAgICBpZiBzdGFja1RvcD8ubWVyZ2UgdGhlbiB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIG1lcmdlOnRydWVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnYCdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgdG9wVHlwZT8uZW5kc1dpdGggJ2JhY2t0aWNrJ1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsIHRvcFR5cGVcbiAgICAgICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSAnYmFja3RpY2snXG4gICAgICAgICAgICBpZiBzdGFja1RvcD8ubWVyZ2UgdGhlbiB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIG1lcmdlOnRydWVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAsIHR5cGVcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuICAgIFxuICAgIGludGVycG9sYXRpb24gPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkPy5zdGFydHNXaXRoIFwiXFwje1wiXG4gICAgICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6J2ludGVycG9sYXRpb24nLCB3ZWFrOnRydWVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZSAwLCAnc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMSwgJ3N0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgdG9wVHlwZSA9PSAnaW50ZXJwb2xhdGlvbidcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09ICd9J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIDAsICdzdHJpbmcgaW50ZXJwb2xhdGlvbiBlbmQnXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBudW1iZXIgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgTlVNQkVSLnRlc3QgY2h1bmsuc3RyaW5nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGdldFN0cmluZygtMSkgPT0gJy4nXG5cbiAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtNCkgPT0gJ251bWJlciBmbG9hdCcgYW5kIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtNCwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBIRVhOVU0udGVzdCBjaHVuay5zdHJpbmdcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyIGhleCdcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBzdGFja2VkID0gLT5cblxuICAgICAgICBpZiBzdGFja1RvcFxuICAgICAgICAgICAgcmV0dXJuIGlmIHN0YWNrVG9wLndlYWtcbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLnN0cm9uZ1xuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlID0gdG9wVHlwZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIHRvcFR5cGVcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgZ2V0Q2h1bmsgID0gKGQpIC0+IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF1cbiAgICBzZXRWYWx1ZSAgPSAoZCwgdmFsdWUpIC0+IGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCtkXS52YWx1ZSA9IHZhbHVlXG4gICAgYWRkVmFsdWUgID0gKGQsIHZhbHVlKSAtPiBpZiAwIDw9IGNodW5rSW5kZXgrZCA8IGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrZF0udmFsdWUgKz0gJyAnICsgdmFsdWVcbiAgICBnZXRWYWx1ZSAgPSAoZCkgLT4gZ2V0Q2h1bmsoZCk/LnZhbHVlXG4gICAgZ2V0U3RyaW5nID0gKGQpIC0+IGdldENodW5rKGQpPy5zdHJpbmdcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGhhbmRsZXJzID0gXG4gICAgICAgIGtvZmZlZTogcHVuY3Q6IFsgc2ltcGxlU3RyaW5nLCBoYXNoQ29tbWVudCwgaW50ZXJwb2xhdGlvbiwgZGFzaEFycm93LCAgcmVnZXhwLCBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIHN0YWNrZWRdXG4gICAgICAgIGNvZmZlZTogcHVuY3Q6IFsgc2ltcGxlU3RyaW5nLCBoYXNoQ29tbWVudCwgaW50ZXJwb2xhdGlvbiwgZGFzaEFycm93LCAgcmVnZXhwLCBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIHN0YWNrZWRdXG4gICAgICAgIG5vb246ICAgcHVuY3Q6IFsgbm9vbkNvbW1lbnQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLCBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIHN0YWNrZWRdXG4gICAgICAgIGpzOiAgICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIHN0YWNrZWRdXG4gICAgICAgIHRzOiAgICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwLCBzdGFja2VkIF0sIHdvcmQ6IFtudW1iZXIsIHN0YWNrZWRdXG4gICAgICAgIG1kOiAgICAgcHVuY3Q6IFsgZm9ybWF0U3RyaW5nLCBzaW1wbGVTdHJpbmcsIHN0YWNrZWQgXSwgd29yZDogW251bWJlciwgc3RhY2tlZF1cbiAgICAgICAganM6ICAgICB7fVxuICAgICAgICBpc3M6ICAgIHt9XG4gICAgICAgIGluaTogICAge31cbiAgICAgICAgc2g6ICAgICB7fVxuICAgICAgICBjcHA6ICAgIHt9XG4gICAgICAgIGhwcDogICAge31cbiAgICAgICAgY3M6ICAgICB7fVxuICAgICAgICBjOiAgICAgIHt9XG4gICAgICAgIGg6ICAgICAge31cbiAgICAgICAgcHVnOiAgICB7fVxuICAgICAgICBzdmc6ICAgIHt9XG4gICAgICAgIGh0bWw6ICAge31cbiAgICAgICAgaHRtOiAgICB7fVxuICAgICAgICBzdHlsOiAgIHt9ICAgXG4gICAgICAgIGNzczogICAge30gICBcbiAgICAgICAgc2FzczogICB7fSAgIFxuICAgICAgICBzY3NzOiAgIHt9ICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcbiAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5pbmRlbnQgYW5kIGxpbmUuY2h1bmtzWzBdPy5jb2x1bW4gPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5jb2x1bW5cbiAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSBpbmRlbnRhdGlvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN3aXRjaC50byAgICAgIyBtYWtlIHN1cmUgdGhlIGN1cnJlbnQgbGluZSBleHQgbWF0Y2hlcyB0aGUgdG9wbW9zdCBmcm9tIHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dCAhPSBsaW5lLmV4dCAgICAgICAgICAgICAgICAgICAgICAjIGVpdGhlciBhdCBzdGFydCBvZiBmaWxlIG9yIHdlIHN3aXRjaGVkIGV4dGVuc2lvblxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGNodW5rID0gbGluZS5jaHVua3NbY2h1bmtJbmRleF1cbiAgICAgICAgICAgIGJlZm9yZUluZGV4ID0gY2h1bmtJbmRleFxuICAgICAgICAgICAgaWYgY2h1bmsudmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXgudHVyZFtsaW5lLmV4dF0/W2NodW5rLnN0cmluZ10gIyDilrggZG9jXG4gICAgICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIG10Y2gudHVyZCBpZiBtdGNoLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbY2h1bmtJbmRleCsxXT8udmFsdWUgPSBtdGNoWyd3LTAnXSBpZiBtdGNoWyd3LTAnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcG9wcGVkID0gZmFsc2VcbiAgICAgICAgICAgICAgICBpZiBleHRUb3BcbiAgICAgICAgICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5lbmQ/IGFuZCBleHRUb3Auc3dpdGNoLmVuZCA9PSBjaHVuay50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9wcGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBub3QgcG9wcGVkXG4gICAgICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXguc3d0Y2hbbGluZS5leHRdP1tjaHVuay50dXJkID8gY2h1bmsuc3RyaW5nXVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBwdXNoIGEgbmV3IGV4dGVuc2lvbiBvbnRvIHRoZSBzdGFjaywgZXh0IHdpbGwgY2hhbmdlIG9uIHN0YXJ0IG9mIG5leHQgbGluZVxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0U3RhY2sucHVzaCBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLnB1bmN0ID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC53b3JkID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gYmVmb3JlSW5kZXhcbiAgICAgICAgICAgICAgICBjaHVua0luZGV4KytcbiAgICBsaW5lc1xuICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuXG5ibG9ja3MgPSAobGluZXMsIGV4dD0na29mZmVlJykgLT5cbiAgICBcbiAgICDilrhkb2MgJ2Jsb2NrcyAqbGluZXMqLCAqZXh0KidcblxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2Ygc3RyaW5nc1xuICAgICAgICBcbiAgICAgICAgKmV4dCo6XG4gICAgICAgIC0ga29mZmVlIGNvZmZlZSBqcyB0cyBcbiAgICAgICAgLSBzdHlsIGNzcyBzYXNzIHNjc3MgXG4gICAgICAgIC0gcHVnIGh0bWwgaHRtIHN2ZyBcbiAgICAgICAgLSBjcHAgaHBwIGN4eCBjIGggXG4gICAgICAgIC0gYmFzaCBmaXNoIHNoIFxuICAgICAgICAtIG5vb24ganNvblxuICAgICAgICAtIG1kIHBsaXN0IFxuICAgICAgICAtIGlzcyBpbmlcbiAgICAgICAgLSB0eHQgbG9nIFxuXG4gICAgICAgICoqcmV0dXJucyoqIHRoZSByZXN1bHQgb2ZcbiAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgIGJsb2NrZWQgY2h1bmtlZCBsaW5lcywgZXh0XG4gICAgICAgIGBgYFxuXG4gICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICBcbiMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcblxucmFuZ2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIOKWuGRvYyAncmFuZ2VkICpsaW5lcyonXG4gICAgICAgIFxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcblxuICAgICAgICAgICAgc3RhcnQ6IG5cbiAgICAgICAgICAgIG1hdGNoOiBzXG4gICAgICAgICAgICB2YWx1ZTogc1xuICAgICAgICBcbiAgICBybmdzID0gW11cbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuICAgICAgICBmb3IgY2h1bmsgaW4gbGluZS5jaHVua3NcbiAgICAgICAgICAgIGtsb2cgY2h1bmsudmFsdWUgaWYgbm90IGNodW5rLnZhbHVlLnJlcGxhY2VcbiAgICAgICAgICAgIHJhbmdlID1cbiAgICAgICAgICAgICAgICBzdGFydDogY2h1bmsuY29sdW1uXG4gICAgICAgICAgICAgICAgbWF0Y2g6IGNodW5rLnN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlOiBjaHVuay52YWx1ZS5yZXBsYWNlICdwdW5jdCcsICdwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIHJuZ3MucHVzaCByYW5nZVxuICAgIHJuZ3Ncblxu4pa4aWYgMVxuICAgIGZvciBpIGluIFswLi4zXVxuICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2tvZmZlZSdcbiAgICAgICAgXG4gICAgZm9yIGkgaW4gWzAuLjE1XVxuICAgICAgICBcbiAgICAgICAg4pa4cHJvZmlsZSAnbGluZXMwJ1xuICAgICAgICAgICAgYmxvY2tzIGxpbmVzMFxuICAgICAgICAjIOKWuHByb2ZpbGUgJ3N5bnRheDAnXG4gICAgICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2tvZmZlZSdcbiAgICAgICAgICAgIFxuICAgICAgICAjIOKWuHByb2ZpbGUgJ2xpbmVzMSdcbiAgICAgICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICAgICAjIOKWuHByb2ZpbGUgJ3N5bnRheDEnXG4gICAgICAgICAgICAjIGxpbmVzMS5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2tvZmZlZSdcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgcmFuZ2VzOiAodGV4dGxpbmUsIGV4dCkgLT4gcmFuZ2VkIGJsb2NrcyBbdGV4dGxpbmVdLCBleHRcbiAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiMgICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgICAgXG4jICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuXG7ilrh0ZXN0ICdjb21tZW50J1xuXG4gICAgY2hhaSgpXG4gICAgXG4gICAgYmxvY2tzKFtcIiMjXCJdKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnIHR1cmQ6XCIjI1wifSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOlwiI1wiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgXV1cblxuICAgIGJsb2NrcyhbXCIsI2FcIl0pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzpcIixcIiB2YWx1ZToncHVuY3QnIHR1cmQ6IFwiLCNcIn0gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCd9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MiBsZW5ndGg6MSBzdHJpbmc6XCJhXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnZnVuY3Rpb24nXG5cbiAgICBibG9ja3MoWyctPiddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgYmxvY2tzKFsnPT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgIGJsb2NrcyhbJ2Y9LT4xJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczo1IGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonZicgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOic9JyB2YWx1ZToncHVuY3QnICAgICAgICAgICAgICAgdHVyZDonPS0+JyB9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MiBsZW5ndGg6MSBzdHJpbmc6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOictPid9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MyBsZW5ndGg6MSBzdHJpbmc6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjo0IGxlbmd0aDoxIHN0cmluZzonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgXG7ilrh0ZXN0ICdtaW5pbWFsJ1xuICAgICAgICAgICAgICAgIFxuICAgIGJsb2NrcyhbJzEnXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOicxJyB2YWx1ZTonbnVtYmVyJ30gXV1cbiAgICBibG9ja3MoWydhJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonYScgdmFsdWU6J3RleHQnfSBdXVxuICAgIGJsb2NrcyhbJy4nXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOicuJyB2YWx1ZToncHVuY3QnfSBdXVxuXG4gICAgYmxvY2tzKFsnMS5hJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MCAgbGVuZ3RoOjEgc3RyaW5nOicxJyB2YWx1ZTonbnVtYmVyJ30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MSAgbGVuZ3RoOjEgc3RyaW5nOicuJyB2YWx1ZToncHVuY3QnfSBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjoyICBsZW5ndGg6MSBzdHJpbmc6J2EnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgIFxuICAgIGJsb2NrcyhbJysrYSddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjAgIGxlbmd0aDoxIHN0cmluZzonKycgdmFsdWU6J3B1bmN0JywgdHVyZDonKysnfSBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjoxICBsZW5ndGg6MSBzdHJpbmc6JysnIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjIgIGxlbmd0aDoxIHN0cmluZzonYScgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgXG4gICAgYmxvY2tzKFtcIuKWuGRvYyAnaGVsbG8nXCJdKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MTIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46MCAgbGVuZ3RoOjEgc3RyaW5nOifilrgnICAgICB2YWx1ZToncHVuY3QgbWV0YSd9IFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjoxICBsZW5ndGg6MyBzdHJpbmc6J2RvYycgICB2YWx1ZTonbWV0YSd9IFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjo1ICBsZW5ndGg6MSBzdHJpbmc6XCInXCIgICAgIHZhbHVlOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjYgIGxlbmd0aDo1IHN0cmluZzpcImhlbGxvXCIgdmFsdWU6J3N0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46MTEgbGVuZ3RoOjEgc3RyaW5nOlwiJ1wiICAgICB2YWx1ZToncHVuY3Qgc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnc3BhY2UnXG5cbiAgICBiID0gYmxvY2tzIFtcInhcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyAwXG5cbiAgICBiID0gYmxvY2tzIFtcIiB4eFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDFcbiAgICBcbiAgICBiID0gYmxvY2tzIFtcIiAgICB4eHhcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyA0XG5cbiAgICBiID0gYmxvY2tzIFtcIiAgICB4IDEgICwgXCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgNFxuICAgIGJbMF0uY2h1bmtzWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDZcbiAgICBiWzBdLmNodW5rc1syXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyA5XG5cbuKWuHRlc3QgJ3N3aXRjaGVzJ1xuICAgIFxuICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICB4ICAgIFxuICAgICAgICAgICAgeVxuICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcblxuICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICB4ICBcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICB5XG4gICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcblxuICAgIGIgPSBibG9ja3MgXCJcIlwiICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAg4pa4ZG9jICdoZWxsbycgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHQgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDErMSAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICDilrhkb2MgJ2FnYWluJyAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZSAqKmRvY3MqKiAgICAgXG4gICAgICAgICAgICBgYGAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgeSAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJyAgICAgICAgICAgICAgIFxuICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbN10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbOF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBcbiJdfQ==
//# sourceURL=../coffee/blocks.coffee