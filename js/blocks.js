// koffee 0.43.0
var Syntax, _, blocked, blocks, chai, chunked, i, j, k, klog, kstr, lines0, lines1, noon, ranged, ref, slash, text0, text1;

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
        var c, chunks, j, k, l, last, len, len1, line, m, pc, punct, re, ref1, rl, s, sc, turd, w, wl;
        line = {
            chunks: [],
            chars: 0,
            index: lineno++,
            number: lineno,
            ext: ext
        };
        chunks = text.split(/\s/);
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
                re = /\W+/gi;
                while (m = re.exec(s)) {
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
    var advance, beforeIndex, chunk, chunkIndex, dashArrow, ext, extStack, extTop, handl, handlers, hashComment, hnd, j, k, len, len1, len2, line, mtch, n, noonComment, popExt, popped, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, regexp, simpleString, slashComment, stack;
''
    extStack = [];
    extTop = null;
    handl = [];
    stack = [];
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
    hashComment = function() {
        var c, j, len, ref1;
        if (stack.length > 1) {
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
        if (stack.length > 1) {
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
            chunk.value += ' function tail';
            line.chunks[chunkIndex + 1].value += ' function head';
            return 2;
        }
        if (chunk.turd === '=>') {
            chunk.value += ' function bound tail';
            line.chunks[chunkIndex + 1].value += ' function bound head';
            return 2;
        }
        return 0;
    };
    regexp = function() {
        var c, count, j, k, len, len1, next, prev, rc, ref1, ref2;
        if (chunk.string === '/') {
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
            count = 0;
            ref1 = line.chunks.slice(chunkIndex + 1);
            for (j = 0, len = ref1.length; j < len; j++) {
                c = ref1[j];
                count++;
                if (c.string === '/') {
                    ref2 = line.chunks.slice(chunkIndex, +(chunkIndex + count) + 1 || 9e9);
                    for (k = 0, len1 = ref2.length; k < len1; k++) {
                        rc = ref2[k];
                        rc.value += ' regexp';
                    }
                    return count;
                }
            }
        }
        return 0;
    };
    simpleString = function() {
        var c, count, escape, j, k, len, len1, rc, ref1, ref2, ref3, value;
        if ((ref1 = chunk.string) === '"' || ref1 === "'" || ref1 === '`') {
            value = (function() {
                switch (chunk.string) {
                    case '"':
                        return 'double';
                    case "'":
                        return 'single';
                    case '`':
                        return 'backtick';
                }
            })();
            count = 0;
            escape = 0;
            ref2 = line.chunks.slice(chunkIndex + 1);
            for (j = 0, len = ref2.length; j < len; j++) {
                c = ref2[j];
                count++;
                if (c.string === '\\') {
                    escape++;
                }
                if (c.string === chunk.string && (escape % 2) !== 1) {
                    ref3 = line.chunks.slice(chunkIndex + 1, +(chunkIndex + count - 1) + 1 || 9e9);
                    for (k = 0, len1 = ref3.length; k < len1; k++) {
                        rc = ref3[k];
                        rc.value = "string " + value;
                    }
                    line.chunks[chunkIndex].value += " string " + value;
                    line.chunks[chunkIndex + count].value += " string " + value;
                    return count;
                }
                if (c.string !== '\\') {
                    escape = 0;
                }
            }
        }
        return 0;
    };
    handlers = {
        koffee: {
            punct: [hashComment, simpleString, dashArrow, regexp]
        },
        coffee: {
            punct: [hashComment, simpleString, dashArrow, regexp]
        },
        noon: {
            punct: [noonComment]
        },
        js: {
            punct: [slashComment, simpleString, dashArrow, regexp]
        },
        ts: {
            punct: [slashComment, simpleString, dashArrow, regexp]
        },
        md: {},
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
    if (koffee_364_4 = process.hrtime()) {
        blocks(lines0);
        console.log('lines0', require('pretty-time')(process.hrtime(koffee_364_4)));
    };
}

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUF1QyxPQUFBLENBQVEsS0FBUixDQUF2QyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkIsZUFBM0IsRUFBaUM7O0FBQW1CLElBQUEsNkJBQUE7SUFHaEQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO0lBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBQTtJQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7UUFBQSxNQUFBLEVBQVE7WUFBQSxHQUFBLEVBQVE7Z0JBQUEsRUFBQSxFQUFJLElBQUo7Z0JBQWEsRUFBQSxFQUFHLEtBQWhCO2dCQUErQixNQUFBLEVBQVEsQ0FBdkM7YUFBUjtTQUFSO1FBQ0EsRUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFRO2dCQUFBLEVBQUEsRUFBSSxRQUFKO2dCQUFhLEVBQUEsRUFBRyxjQUFoQjtnQkFBK0IsR0FBQSxFQUFRLEtBQXZDO2FBQVI7U0FEUjs7SUFHSixLQUFBLEdBQVEsS0FBSyxDQUFDLFFBQU4sQ0FBa0IsU0FBRCxHQUFXLG1DQUE1QjtJQUNSLEtBQUEsR0FBUSxLQUFLLENBQUMsUUFBTixDQUFrQixTQUFELEdBQVcsY0FBNUI7SUFFUixNQUFBLEdBQVMsS0FBSyxDQUFDLEtBQU4sQ0FBWSxJQUFaO0lBQ1QsTUFBQSxHQUFTLEtBQUssQ0FBQyxLQUFOLENBQVksSUFBWixFQWR1Qzs2RUFBQTs7O0FBc0JwRCxPQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsR0FBUjtBQUVQLFFBQUE7QUFBQTtJQWtCQyxJQUFBLEdBQU8sU0FBQyxDQUFEO1FBQU8sSUFBRyxNQUFNLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBSSxDQUFDLGNBQWpCLENBQWdDLENBQWhDLENBQUg7bUJBQTBDLE1BQU0sQ0FBQyxJQUFLLENBQUEsR0FBQSxDQUFLLENBQUEsQ0FBQSxFQUEz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QVMsMkJBQVQ7SUFFRyxJQUFBLCtCQUFBO1FBQ0ssTUFBQSxDQUFPLE1BQVAsRUFETDtvRkFBQTs7QUFGSDs7QUFZQSxNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsTUFBQSxFQUFRLFNBQUMsUUFBRCxFQUFXLEdBQVg7ZUFBbUIsTUFBQSxDQUFPLE1BQUEsQ0FBTyxDQUFDLFFBQUQsQ0FBUCxFQUFtQixHQUFuQixDQUFQO0lBQW5CLENBQVIiLCJzb3VyY2VzQ29udGVudCI6WyJcbnsgc2xhc2gsIGtzdHIsIGtsb2csIG5vb24sIGNoYWksIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxu4pa4cHJvZmlsZSAnLS0tLS0nIFxuICAgIFN5bnRheCA9IHJlcXVpcmUgJy4vc3ludGF4J1xuICAgIFN5bnRheC5pbml0KClcbiAgICBcbiAgICBTeW50YXguc3d0Y2ggPSBcbiAgICAgICAga29mZmVlOiAn4pa4JzogICAgdG86ICdtZCcgICAgIHcwOidkb2MnICAgICAgICAgIGluZGVudDogMVxuICAgICAgICBtZDogICAgICdgYGAnOiAgdG86ICdrb2ZmZWUnIHcwOidjb2ZmZWVzY3JpcHQnIGVuZDogICAgJ2BgYCdcblxuICAgIHRleHQwID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL2NvZmZlZS9ub2Rlcy5jb2ZmZWVcIiAjIDYtMTFtc1xuICAgIHRleHQxID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vdGVzdC5jb2ZmZWVcIiAjIDUwLTEyMM68c1xuXG4gICAgbGluZXMwID0gdGV4dDAuc3BsaXQgJ1xcbidcbiAgICBsaW5lczEgPSB0ZXh0MS5zcGxpdCAnXFxuJ1xuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5jaHVua2VkID0gKGxpbmVzLCBleHQpIC0+ICAgIFxuXG4gICAg4pa4ZG9jICdjaHVua2VkICpsaW5lcyosICpleHQqJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGFycmF5IG9mXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nOiBzXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogIHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogblxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIGV4dDogICAgc1xuICAgICAgICAgICAgY2hhcnM6ICBuXG4gICAgICAgICAgICBpbmRleDogIG5cbiAgICAgICAgICAgIG51bWJlcjogbisxXG4gICAgXG4gICAgd29yZCA9ICh3KSAtPiBpZiBTeW50YXgubGFuZ1tleHRdLmhhc093blByb3BlcnR5IHcgdGhlbiBTeW50YXgubGFuZ1tleHRdW3ddIGVsc2UgJ3RleHQnXG4gICAgXG4gICAgbGluZW5vID0gMFxuICAgIGxpbmVzLm1hcCAodGV4dCkgLT4gXG4gICAgICAgIFxuICAgICAgICBsaW5lID0gXG4gICAgICAgICAgICBjaHVua3M6IFtdXG4gICAgICAgICAgICBjaGFyczogIDBcbiAgICAgICAgICAgIGluZGV4OiAgbGluZW5vKytcbiAgICAgICAgICAgIG51bWJlcjogbGluZW5vXG4gICAgICAgICAgICBleHQ6ICAgIGV4dFxuXG4gICAgICAgIGNodW5rcyA9IHRleHQuc3BsaXQgL1xccy9cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICByZXR1cm4gbGluZSAjIGVtcHR5IGxpbmVcbiAgICAgICAgICAgIFxuICAgICAgICBjID0gMFxuICAgICAgICBmb3IgcyBpbiBjaHVua3NcbiAgICAgICAgICAgIGlmIHMgPT0gJydcbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBjKytcbiAgICAgICAgICAgICAgICBsID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzYyA9IGNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIHNlcGVyYXRlIGJ5IHB1bmN0dWF0aW9uXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmUgPSAvXFxXKy9naVxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSByZS5leGVjIHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIG0uaW5kZXggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB3bCA9IG0uaW5kZXgtKGMtc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICB3ID0gc1tjLXNjLi4ubS5pbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggY29sdW1uOmMsIGxlbmd0aDp3bCwgc3RyaW5nOncsIHZhbHVlOndvcmQgdyBcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gd2xcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0dXJkID0gcHVuY3QgPSBtWzBdXG4gICAgICAgICAgICAgICAgICAgIGZvciBwYyBpbiBwdW5jdFsuLi4tMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggY29sdW1uOmMrKywgbGVuZ3RoOjEsIHN0cmluZzpwYywgdHVyZDp0dXJkLCB2YWx1ZToncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICB0dXJkID0gdHVyZFsxLi5dXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggY29sdW1uOmMrKywgbGVuZ3RoOjEsIHN0cmluZzpwdW5jdFstMV0sIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjIDwgc2MrbCAgICAgICAgIyBjaGVjayBmb3IgcmVtYWluaW5nIG5vbi1wdW5jdFxuICAgICAgICAgICAgICAgICAgICBybCA9IHNjK2wtYyAgICAjIGxlbmd0aCBvZiByZW1haW5kZXJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHNbbC1ybC4uXSAgIyB0ZXh0ICAgb2YgcmVtYWluZGVyIFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIGNvbHVtbjpjLCBsZW5ndGg6cmwsIHN0cmluZzp3LCB2YWx1ZTp3b3JkIHdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoXG4gICAgICAgICAgICBsYXN0ID0gbGluZS5jaHVua3NbLTFdXG4gICAgICAgICAgICBsaW5lLmNoYXJzID0gbGFzdC5jb2x1bW4gKyBsYXN0Lmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgIGxpbmVcbiAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5ibG9ja2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tlZCAqbGluZXMqJ1xuICAgICAgICBcbiAgICAgICAgKmxpbmVzKjogIGFycmF5IG9mIGNodW5rZWQgbGluZXNcbiAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGxpbmVzIHdpdGggXG4gICAgICAgIC0gJ2V4dCcgc3dpdGNoZWQgaW4gc29tZSBsaW5lc1xuICAgICAgICAtICd2YWx1ZScgY2hhbmdlZCBpbiBjaHVua3MgdGhhdCBtYXRjaCBsYW5ndWFnZSBwYXR0ZXJuc1xuICAgICAgICAgIFxuICAgIGV4dFN0YWNrICAgPSBbXVxuICAgIGV4dFRvcCAgICAgPSBudWxsXG4gICAgaGFuZGwgICAgICA9IFtdXG4gICAgc3RhY2sgICAgICA9IFtdXG4gICAgZXh0ICAgICAgICA9IG51bGxcbiAgICBjaHVuayAgICAgID0gbnVsbFxuICAgIGxpbmUgICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IG51bGxcblxuICAgIHBvcEV4dCA9IC0+XG4gICAgICAgIHN0YWNrID0gZXh0VG9wLnN0YWNrXG4gICAgICAgICMgbGluZS5wb3AgPSB0cnVlXG4gICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN0YXJ0LmV4dFxuICAgICAgICBleHRTdGFjay5wb3AoKSAgICAgICAgICAgICAgIFxuICAgICAgICBleHRUb3AgPSBleHRTdGFja1stMV1cbiAgICBcbiAgICBoYXNoQ29tbWVudCA9IC0+IFxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIDAgaWYgc3RhY2subGVuZ3RoID4gMVxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09IFwiI1wiXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIGNvbW1lbnQnXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICBmb3IgYyBpbiBsaW5lLmNodW5rc1tjaHVua0luZGV4KzEuLl1cbiAgICAgICAgICAgICAgICAgICAgYy52YWx1ZSA9ICdjb21tZW50J1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUuY2h1bmtzLmxlbmd0aCAtIGNodW5rSW5kZXggKyAxXG4gICAgICAgIDBcblxuICAgIG5vb25Db21tZW50ID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMCBpZiBzdGFjay5sZW5ndGggPiAxXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gXCIjXCIgYW5kIGNodW5rSW5kZXggPT0gMCAjIHRoZSBvbmx5IGRpZmZlcmVuY2UuIG1lcmdlIHdpdGggaGFzaENvbW1lbnQ/XG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIGNvbW1lbnQnXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IDwgbGluZS5jaHVua3MubGVuZ3RoLTFcbiAgICAgICAgICAgICAgICBmb3IgYyBpbiBsaW5lLmNodW5rc1tjaHVua0luZGV4KzEuLl1cbiAgICAgICAgICAgICAgICAgICAgYy52YWx1ZSA9ICdjb21tZW50J1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUuY2h1bmtzLmxlbmd0aCAtIGNodW5rSW5kZXggKyAxXG4gICAgICAgIDBcbiAgICAgICAgXG4gICAgc2xhc2hDb21tZW50ID0gLT4gMFxuICAgICAgICAgICAgICAgIFxuICAgIGRhc2hBcnJvdyA9IC0+XG5cbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnLT4nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgICAgIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMV0udmFsdWUgKz0gJyBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZCA9PSAnPT4nXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgICAgIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMV0udmFsdWUgKz0gJyBmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgMFxuICAgICAgICAgICAgICAgIFxuICAgIHJlZ2V4cCA9IC0+XG4gICAgICAgIFxuICAgICAgICAjIGNoZWNrIHN0YWNrIHRvcCFcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nID09ICcvJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVua0luZGV4IFxuICAgICAgICAgICAgICAgIHByZXYgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4LTFdXG4gICAgICAgICAgICAgICAgbmV4dCA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMV1cbiAgICAgICAgICAgICAgICBpZiBub3QgcHJldi52YWx1ZS5zdGFydHNXaXRoICdwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYuY29sdW1uICsgcHJldi5sZW5ndGggPCBjaHVuay5jb2x1bW4pIGFuZCBuZXh0Py5jb2x1bW4gPiBjaHVuay5jb2x1bW4rMVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYuY29sdW1uICsgcHJldi5sZW5ndGggPT0gY2h1bmsuY29sdW1uKSBhbmQgbmV4dD8uY29sdW1uID09IGNodW5rLmNvbHVtbisxXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb3VudCA9IDBcbiAgICAgICAgICAgIGZvciBjIGluIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMS4uXVxuICAgICAgICAgICAgICAgIGNvdW50KytcbiAgICAgICAgICAgICAgICBpZiBjLnN0cmluZyA9PSAnLycgIyBjaGVjayBpZiBlc2NhcGVkIVxuICAgICAgICAgICAgICAgICAgICBmb3IgcmMgaW4gbGluZS5jaHVua3NbY2h1bmtJbmRleC4uY2h1bmtJbmRleCtjb3VudF1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJjLnZhbHVlICs9ICcgcmVnZXhwJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY291bnRcbiAgICAgICAgMFxuICAgICAgICBcbiAgICBzaW1wbGVTdHJpbmcgPSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsuc3RyaW5nIGluIFsnXCInIFwiJ1wiICdgJ11cbiAgICAgICAgICAgIHZhbHVlID0gc3dpdGNoIGNodW5rLnN0cmluZyBcbiAgICAgICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnZG91YmxlJyBcbiAgICAgICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3NpbmdsZSdcbiAgICAgICAgICAgICAgICB3aGVuICdgJyB0aGVuICdiYWNrdGljaydcbiAgICAgICAgICAgIGNvdW50ID0gMFxuICAgICAgICAgICAgZXNjYXBlID0gMFxuICAgICAgICAgICAgZm9yIGMgaW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCsxLi5dXG4gICAgICAgICAgICAgICAgY291bnQrK1xuICAgICAgICAgICAgICAgIGlmIGMuc3RyaW5nID09ICdcXFxcJ1xuICAgICAgICAgICAgICAgICAgICBlc2NhcGUrK1xuICAgICAgICAgICAgICAgIGlmIGMuc3RyaW5nID09IGNodW5rLnN0cmluZyBhbmQgKGVzY2FwZSAlIDIpICE9IDFcbiAgICAgICAgICAgICAgICAgICAgZm9yIHJjIGluIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMS4uY2h1bmtJbmRleCtjb3VudC0xXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmMudmFsdWUgPSBcInN0cmluZyAje3ZhbHVlfVwiXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2NodW5rSW5kZXhdLnZhbHVlICs9IFwiIHN0cmluZyAje3ZhbHVlfVwiXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrY291bnRdLnZhbHVlICs9IFwiIHN0cmluZyAje3ZhbHVlfVwiXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb3VudFxuICAgICAgICAgICAgICAgIGlmIGMuc3RyaW5nICE9ICdcXFxcJ1xuICAgICAgICAgICAgICAgICAgICBlc2NhcGUgPSAwXG4gICAgICAgIDBcbiAgICBcbiAgICBoYW5kbGVycyA9IFxuICAgICAgICBrb2ZmZWU6IHB1bmN0OiBbIGhhc2hDb21tZW50LCAgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCBdXG4gICAgICAgIGNvZmZlZTogcHVuY3Q6IFsgaGFzaENvbW1lbnQsICBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwIF1cbiAgICAgICAgbm9vbjogICBwdW5jdDogWyBub29uQ29tbWVudCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICBqczogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgc2ltcGxlU3RyaW5nLCBkYXNoQXJyb3csIHJlZ2V4cCBdXG4gICAgICAgIHRzOiAgICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBzaW1wbGVTdHJpbmcsIGRhc2hBcnJvdywgcmVnZXhwIF1cbiAgICAgICAgbWQ6ICAgICB7fVxuICAgICAgICBqczogICAgIHt9XG4gICAgICAgIGlzczogICAge31cbiAgICAgICAgaW5pOiAgICB7fVxuICAgICAgICBzaDogICAgIHt9XG4gICAgICAgIGNwcDogICAge31cbiAgICAgICAgaHBwOiAgICB7fVxuICAgICAgICBjczogICAgIHt9XG4gICAgICAgIGM6ICAgICAge31cbiAgICAgICAgaDogICAgICB7fVxuICAgICAgICBwdWc6ICAgIHt9XG4gICAgICAgIHN2ZzogICAge31cbiAgICAgICAgaHRtbDogICB7fVxuICAgICAgICBodG06ICAgIHt9XG4gICAgICAgIHN0eWw6ICAge30gICBcbiAgICAgICAgY3NzOiAgICB7fSAgIFxuICAgICAgICBzYXNzOiAgIHt9ICAgXG4gICAgICAgIHNjc3M6ICAge30gIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcbiAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5pbmRlbnQgYW5kIGxpbmUuY2h1bmtzWzBdPy5jb2x1bW4gPD0gZXh0VG9wLnN0YXJ0LmNodW5rc1swXS5jb2x1bW5cbiAgICAgICAgICAgICAgICBwb3BFeHQoKSAgICAgICAgICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSBpbmRlbnRhdGlvblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGxpbmUuZXh0ID0gZXh0VG9wLnN3aXRjaC50byAgICAgIyBtYWtlIHN1cmUgdGhlIGN1cnJlbnQgbGluZSBleHQgbWF0Y2hlcyB0aGUgdG9wbW9zdCBmcm9tIHN0YWNrXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dCAhPSBsaW5lLmV4dCAgICAgICAgICAgICAgICAgICAgICAjIGVpdGhlciBhdCBzdGFydCBvZiBmaWxlIG9yIHdlIHN3aXRjaGVkIGV4dGVuc2lvblxuICAgICAgICAgICAgaGFuZGwgPSBoYW5kbGVyc1tleHQgPSBsaW5lLmV4dF0gICAgIyBpbnN0YWxsIG5ldyBoYW5kbGVyc1xuICAgICAgICBcbiAgICAgICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgd2hpbGUgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgY2h1bmsgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4XVxuICAgICAgICAgICAgYmVmb3JlSW5kZXggPSBjaHVua0luZGV4XG4gICAgICAgICAgICBpZiBjaHVuay52YWx1ZSA9PSAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbXRjaCA9IFN5bnRheC50dXJkW2xpbmUuZXh0XT9bY2h1bmsuc3RyaW5nXSAjIOKWuCBkb2NcbiAgICAgICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgbXRjaC50dXJkIGlmIG10Y2gudHVyZFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tjaHVua0luZGV4KzFdPy52YWx1ZSA9IG10Y2hbJ3ctMCddIGlmIG10Y2hbJ3ctMCddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBwb3BwZWQgPSBmYWxzZVxuICAgICAgICAgICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgICAgICAgICBpZiBleHRUb3Auc3dpdGNoLmVuZD8gYW5kIGV4dFRvcC5zd2l0Y2guZW5kID09IGNodW5rLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvcEV4dCgpICAgICAgICAgICAgICAgICMgZW5kIG9mIGV4dGVuc2lvbiBibG9jayByZWFjaGVkIHRoYXQgaXMgdGVybWluYXRlZCBieSB0dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BwZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBwb3BwZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgbXRjaCA9IFN5bnRheC5zd3RjaFtsaW5lLmV4dF0/W2NodW5rLnR1cmQgPyBjaHVuay5zdHJpbmddXG4gICAgICAgICAgICAgICAgICAgICAgICAjIHB1c2ggYSBuZXcgZXh0ZW5zaW9uIG9udG8gdGhlIHN0YWNrLCBleHQgd2lsbCBjaGFuZ2Ugb24gc3RhcnQgb2YgbmV4dCBsaW5lXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRTdGFjay5wdXNoIGV4dFRvcCA9IHN3aXRjaDptdGNoLCBzdGFydDpsaW5lLCBzdGFjazpzdGFja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBobmQgaW4gaGFuZGwucHVuY3QgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmb3IgaG5kIGluIGhhbmRsLndvcmQgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSBiZWZvcmVJbmRleFxuICAgICAgICAgICAgICAgIGNodW5rSW5kZXgrK1xuICAgIGxpbmVzXG4gICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmJsb2NrcyA9IChsaW5lcywgZXh0PSdrb2ZmZWUnKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tzICpsaW5lcyosICpleHQqJ1xuXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBzdHJpbmdzXG4gICAgICAgIFxuICAgICAgICAqZXh0KjpcbiAgICAgICAgLSBrb2ZmZWUgY29mZmVlIGpzIHRzIFxuICAgICAgICAtIHN0eWwgY3NzIHNhc3Mgc2NzcyBcbiAgICAgICAgLSBwdWcgaHRtbCBodG0gc3ZnIFxuICAgICAgICAtIGNwcCBocHAgY3h4IGMgaCBcbiAgICAgICAgLSBiYXNoIGZpc2ggc2ggXG4gICAgICAgIC0gbm9vbiBqc29uXG4gICAgICAgIC0gbWQgcGxpc3QgXG4gICAgICAgIC0gaXNzIGluaVxuICAgICAgICAtIHR4dCBsb2cgXG5cbiAgICAgICAgKipyZXR1cm5zKiogdGhlIHJlc3VsdCBvZlxuICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICAgICAgYGBgXG5cbiAgICBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5yYW5nZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdyYW5nZWQgKmxpbmVzKidcbiAgICAgICAgXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgICAgIFxuICAgICAgICAqKnJldHVybnMqKiBhcnJheSBvZlxuXG4gICAgICAgICAgICBzdGFydDogblxuICAgICAgICAgICAgbWF0Y2g6IHNcbiAgICAgICAgICAgIHZhbHVlOiBzXG4gICAgICAgIFxuICAgIHJuZ3MgPSBbXVxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAga2xvZyBjaHVuay52YWx1ZSBpZiBub3QgY2h1bmsudmFsdWUucmVwbGFjZVxuICAgICAgICAgICAgcmFuZ2UgPVxuICAgICAgICAgICAgICAgIHN0YXJ0OiBjaHVuay5jb2x1bW5cbiAgICAgICAgICAgICAgICBtYXRjaDogY2h1bmsuc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNodW5rLnZhbHVlLnJlcGxhY2UgJ3B1bmN0JywgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgcm5ncy5wdXNoIHJhbmdlXG4gICAgcm5nc1xuXG5mb3IgaSBpbiBbMC4uM11cbiAgICBibG9ja3MgbGluZXMwXG4gICAgIyBibG9ja3MgbGluZXMxXG4gICAgIyBsaW5lczAubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdrb2ZmZWUnXG4gICAgXG5mb3IgaSBpbiBbMC4uMTVdXG4gICAgXG4gICAg4pa4cHJvZmlsZSAnbGluZXMwJ1xuICAgICAgICBibG9ja3MgbGluZXMwXG4gICAgIyDilrhwcm9maWxlICdzeW50YXgwJ1xuICAgICAgICAjIGxpbmVzMC5tYXAgKGwpIC0+IFN5bnRheC5yYW5nZXMgbCwgJ2tvZmZlZSdcbiAgICAgICAgXG4gICAgIyDilrhwcm9maWxlICdsaW5lczEnXG4gICAgICAgICMgYmxvY2tzIGxpbmVzMVxuICAgICMg4pa4cHJvZmlsZSAnc3ludGF4MSdcbiAgICAgICAgIyBsaW5lczEubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdrb2ZmZWUnXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPVxuICAgIHJhbmdlczogKHRleHRsaW5lLCBleHQpIC0+IHJhbmdlZCBibG9ja3MgW3RleHRsaW5lXSwgZXh0XG4gICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcblxu4pa4dGVzdCAnY29tbWVudCdcblxuICAgIGNoYWkoKVxuICAgIFxuICAgIGJsb2NrcyhbXCIjI1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50JyB0dXJkOlwiIyNcIn0gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzpcIiNcIiB2YWx1ZTonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgIF1dXG5cbiAgICBibG9ja3MoW1wiLCNhXCJdKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6XCIsXCIgdmFsdWU6J3B1bmN0JyB0dXJkOiBcIiwjXCJ9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MSBsZW5ndGg6MSBzdHJpbmc6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjIgbGVuZ3RoOjEgc3RyaW5nOlwiYVwiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICBcbuKWuHRlc3QgJ2Z1bmN0aW9uJ1xuXG4gICAgYmxvY2tzKFsnLT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOictJyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDogJy0+J30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgIGJsb2NrcyhbJz0+J10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonPScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnIHR1cmQ6ICc9Pid9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MSBsZW5ndGg6MSBzdHJpbmc6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICBibG9ja3MoWydmPS0+MSddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6NSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6J2YnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzonPScgdmFsdWU6J3B1bmN0JyAgICAgICAgICAgICAgIHR1cmQ6Jz0tPicgfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjIgbGVuZ3RoOjEgc3RyaW5nOictJyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDonLT4nfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjMgbGVuZ3RoOjEgc3RyaW5nOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46NCBsZW5ndGg6MSBzdHJpbmc6JzEnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICBcbuKWuHRlc3QgJ21pbmltYWwnXG4gICAgICAgICAgICAgICAgXG4gICAgYmxvY2tzKFsnMSddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6JzEnIHZhbHVlOid0ZXh0J30gXV1cbiAgICBibG9ja3MoWydhJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonYScgdmFsdWU6J3RleHQnfSBdXVxuICAgIGJsb2NrcyhbJy4nXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOicuJyB2YWx1ZToncHVuY3QnfSBdXVxuXG4gICAgYmxvY2tzKFsnMS5hJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MCAgbGVuZ3RoOjEgc3RyaW5nOicxJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDoxIHN0cmluZzonLicgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MiAgbGVuZ3RoOjEgc3RyaW5nOidhJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoWycrK2EnXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjowICBsZW5ndGg6MSBzdHJpbmc6JysnIHZhbHVlOidwdW5jdCcsIHR1cmQ6JysrJ30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MSAgbGVuZ3RoOjEgc3RyaW5nOicrJyB2YWx1ZToncHVuY3QnfSBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjoyICBsZW5ndGg6MSBzdHJpbmc6J2EnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgIFxuICAgIGJsb2NrcyhbXCLilrhkb2MgJ2hlbGxvJ1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjEyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjAgIGxlbmd0aDoxIHN0cmluZzon4pa4JyAgICAgdmFsdWU6J3B1bmN0IG1ldGEnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46MSAgbGVuZ3RoOjMgc3RyaW5nOidkb2MnICAgdmFsdWU6J21ldGEnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46NSAgbGVuZ3RoOjEgc3RyaW5nOlwiJ1wiICAgICB2YWx1ZToncHVuY3QnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46NiAgbGVuZ3RoOjUgc3RyaW5nOlwiaGVsbG9cIiB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjoxMSBsZW5ndGg6MSBzdHJpbmc6XCInXCIgICAgIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnc3BhY2UnXG5cbiAgICBiID0gYmxvY2tzIFtcInhcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyAwXG5cbiAgICBiID0gYmxvY2tzIFtcIiB4eFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDFcbiAgICBcbiAgICBiID0gYmxvY2tzIFtcIiAgICB4eHhcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyA0XG5cbiAgICBiID0gYmxvY2tzIFtcIiAgICB4IDEgICwgXCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgNFxuICAgIGJbMF0uY2h1bmtzWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDZcbiAgICBiWzBdLmNodW5rc1syXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyA5XG5cbuKWuHRlc3QgJ3N3aXRjaGVzJ1xuICAgIFxuICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICB4ICAgIFxuICAgICAgICAgICAgeVxuICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcblxuICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICB4ICBcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICB5XG4gICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcblxuICAgIGIgPSBibG9ja3MgXCJcIlwiICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAg4pa4ZG9jICdoZWxsbycgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHQgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDErMSAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICDilrhkb2MgJ2FnYWluJyAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZSAqKmRvY3MqKiAgICAgXG4gICAgICAgICAgICBgYGAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgeSAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJyAgICAgICAgICAgICAgIFxuICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbN10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbOF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBcbiJdfQ==
//# sourceURL=../coffee/blocks.coffee