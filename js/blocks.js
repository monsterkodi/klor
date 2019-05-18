// koffee 0.43.0
var Syntax, _, blocked, blocks, chai, chunked, klog, kstr, lines, noon, ranged, ranges, ref, slash, spaced, text;

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
    text = slash.readText(__dirname + "/../../koffee/coffee/nodes.coffee");
    lines = text.split('\n');
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
        var c, chunks, i, j, l, last, len, len1, line, m, pc, punct, re, ref1, rl, s, sc, w, wl;
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
        for (i = 0, len = chunks.length; i < len; i++) {
            s = chunks[i];
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
                    punct = m[0];
                    if (punct.length > 1) {
                        line.chunks.push({
                            column: c++,
                            length: 1,
                            string: punct[0],
                            turd: punct,
                            value: 'punct'
                        });
                        ref1 = punct.slice(1);
                        for (j = 0, len1 = ref1.length; j < len1; j++) {
                            pc = ref1[j];
                            line.chunks.push({
                                column: c++,
                                length: 1,
                                string: pc,
                                value: 'punct'
                            });
                        }
                    } else {
                        line.chunks.push({
                            column: c++,
                            length: 1,
                            string: punct,
                            value: 'punct'
                        });
                    }
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
    var advance, beforeIndex, chunk, chunkIndex, dashArrow, ext, extStack, handl, handlers, hashComment, hnd, i, j, k, len, len1, len2, line, mtch, popped, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, regexp, slashComment, stack, stacks, top;
''
    extStack = [];
    stacks = [];
    handl = [];
    stack = null;
    ext = null;
    chunk = null;
    line = null;
    chunkIndex = null;
    hashComment = function() {
        var c, i, len, ref1;
        if (stack.length > 1) {
            return 0;
        }
        if (chunk.string === "#") {
            chunk.value += ' comment';
            if (chunkIndex < line.chunks.length - 1) {
                ref1 = line.chunks.slice(chunkIndex + 1);
                for (i = 0, len = ref1.length; i < len; i++) {
                    c = ref1[i];
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
        var prev;
        if (chunk.string === '>' && chunkIndex > 0) {
            prev = line.chunks[chunkIndex - 1];
            if (prev.string === '-') {
                prev.value += ' function tail';
                chunk.value += ' function head';
                return 1;
            }
            if (prev.string === '=') {
                prev.value += ' function bound tail';
                chunk.value += ' function bound head';
                return 1;
            }
        }
        return 0;
    };
    regexp = function() {
        if (chunk.string === '/') {
            chunk.value += ' regexp';
            return 1;
        }
        return 0;
    };
    handlers = {
        koffee: {
            punct: [hashComment, dashArrow, regexp]
        },
        coffee: {
            punct: [hashComment, dashArrow, regexp]
        },
        js: {
            punct: [slashComment, dashArrow, regexp]
        },
        ts: {
            punct: [slashComment, dashArrow, regexp]
        },
        md: {}
    };
    for (i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        if (extStack.length) {
            top = extStack.slice(-1)[0];
            if (top["switch"].indent && ((ref1 = line.chunks[0]) != null ? ref1.column : void 0) <= top.start.chunks[0].column) {
                extStack.pop();
                line.pop = true;
                line.ext = top.start.ext;
            } else {
                line.ext = top["switch"].to;
            }
        }
        if (ext !== line.ext) {
            ext = line.ext;
            if (stacks.length && line.pop) {
                stack = stacks.pop;
            } else {
                if (stack) {
                    stacks.push(stack);
                }
                stack = [
                    {
                        ext: ext
                    }
                ];
            }
            handl = handlers[ext];
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
                if (extStack.length) {
                    top = extStack.slice(-1)[0];
                    if (top["switch"].end === chunk.string) {
                        extStack.pop();
                        line.pop = true;
                        line.ext = top.start.ext;
                        popped = true;
                    }
                }
                if (!popped) {
                    if (mtch = (ref4 = Syntax.swtch[line.ext]) != null ? ref4[chunk.turd] : void 0) {
                        extStack.push({
                            "switch": mtch,
                            start: line
                        });
                    }
                }
                ref6 = (ref5 = handl.punct) != null ? ref5 : [];
                for (j = 0, len1 = ref6.length; j < len1; j++) {
                    hnd = ref6[j];
                    if (advance = hnd()) {
                        chunkIndex += advance;
                        break;
                    }
                }
            } else {
                ref8 = (ref7 = handl.word) != null ? ref7 : [];
                for (k = 0, len2 = ref8.length; k < len2; k++) {
                    hnd = ref8[k];
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
    var chunk, i, j, len, len1, line, range, ref1, rngs;
''
    rngs = [];
    for (i = 0, len = lines.length; i < len; i++) {
        line = lines[i];
        ref1 = line.chunks;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
            chunk = ref1[j];
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

if (koffee_297_0 = process.hrtime()) {
    spaced = blocks(lines);
    console.log('blocks', require('pretty-time')(process.hrtime(koffee_297_0)));
};

if (koffee_301_0 = process.hrtime()) {
    ranges = lines.map(function(l) {
        return Syntax.ranges(l, 'koffee');
    });
    console.log('syntax1', require('pretty-time')(process.hrtime(koffee_301_0)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUF1QyxPQUFBLENBQVEsS0FBUixDQUF2QyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkIsZUFBM0IsRUFBaUM7O0FBQW1CLElBQUEsNkJBQUE7SUFHaEQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO0lBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBQTtJQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7UUFBQSxNQUFBLEVBQVE7WUFBQSxHQUFBLEVBQVE7Z0JBQUEsRUFBQSxFQUFJLElBQUo7Z0JBQWEsRUFBQSxFQUFHLEtBQWhCO2dCQUErQixNQUFBLEVBQVEsQ0FBdkM7YUFBUjtTQUFSO1FBQ0EsRUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFRO2dCQUFBLEVBQUEsRUFBSSxRQUFKO2dCQUFhLEVBQUEsRUFBRyxjQUFoQjtnQkFBK0IsR0FBQSxFQUFRLEtBQXZDO2FBQVI7U0FEUjs7SUFHSixJQUFBLEdBQU8sS0FBSyxDQUFDLFFBQU4sQ0FBa0IsU0FBRCxHQUFXLG1DQUE1QjtJQUlQLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFkd0M7NkVBQUE7OztBQXNCcEQsT0FBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFFUCxRQUFBO0FBQUE7SUFrQkMsSUFBQSxHQUFPLFNBQUMsQ0FBRDtRQUFPLElBQUcsTUFBTSxDQUFDLElBQUssQ0FBQSxHQUFBLENBQUksQ0FBQyxjQUFqQixDQUFnQyxDQUFoQyxDQUFIO21CQUEwQyxNQUFNLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBSyxDQUFBLENBQUEsRUFBM0Q7U0FBQSxNQUFBO21CQUFtRSxPQUFuRTs7SUFBUDtJQUVQLE1BQUEsR0FBUztXQUNULEtBQUssQ0FBQyxHQUFOLENBQVUsU0FBQyxJQUFEO0FBRU4sWUFBQTtR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RmI7Z0ZBQUE7OztBQUlBLElBQUEsK0JBQUE7SUFDSSxNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLENBQUQ7ZUFBTyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQWQsRUFBaUIsUUFBakI7SUFBUCxDQUFWLEVBRGI7aUZBQUE7OztBQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxNQUFBLEVBQVEsU0FBQyxRQUFELEVBQVcsR0FBWDtlQUFtQixNQUFBLENBQU8sTUFBQSxDQUFPLENBQUMsUUFBRCxDQUFQLEVBQW1CLEdBQW5CLENBQVA7SUFBbkIsQ0FBUiIsInNvdXJjZXNDb250ZW50IjpbIlxueyBzbGFzaCwga3N0ciwga2xvZywgbm9vbiwgY2hhaSwgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG7ilrhwcm9maWxlICctLS0tLScgXG4gICAgU3ludGF4ID0gcmVxdWlyZSAnLi9zeW50YXgnXG4gICAgU3ludGF4LmluaXQoKVxuICAgIFxuICAgIFN5bnRheC5zd3RjaCA9IFxuICAgICAgICBrb2ZmZWU6ICfilrgnOiAgICB0bzogJ21kJyAgICAgdzA6J2RvYycgICAgICAgICAgaW5kZW50OiAxXG4gICAgICAgIG1kOiAgICAgJ2BgYCc6ICB0bzogJ2tvZmZlZScgdzA6J2NvZmZlZXNjcmlwdCcgZW5kOiAgICAnYGBgJ1xuXG4gICAgdGV4dCA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9Ly4uLy4uL2tvZmZlZS9jb2ZmZWUvbm9kZXMuY29mZmVlXCIgIyAyMm1zXG4gICAgIyB0ZXh0ID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL3Rlc3Qua29mZmVlXCJcbiAgICAjIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiICMgNTAwdXNcblxuICAgIGxpbmVzID0gdGV4dC5zcGxpdCAnXFxuJ1xuICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5jaHVua2VkID0gKGxpbmVzLCBleHQpIC0+ICAgIFxuXG4gICAg4pa4ZG9jICdjaHVua2VkICpsaW5lcyosICpleHQqJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGFycmF5IG9mXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNodW5rczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nOiBzXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogIHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogblxuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoOiBuXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIGV4dDogICAgc1xuICAgICAgICAgICAgY2hhcnM6ICBuXG4gICAgICAgICAgICBpbmRleDogIG5cbiAgICAgICAgICAgIG51bWJlcjogbisxXG4gICAgXG4gICAgd29yZCA9ICh3KSAtPiBpZiBTeW50YXgubGFuZ1tleHRdLmhhc093blByb3BlcnR5IHcgdGhlbiBTeW50YXgubGFuZ1tleHRdW3ddIGVsc2UgJ3RleHQnXG4gICAgXG4gICAgbGluZW5vID0gMFxuICAgIGxpbmVzLm1hcCAodGV4dCkgLT4gXG4gICAgICAgIFxuICAgICAgICBsaW5lID0gXG4gICAgICAgICAgICBjaHVua3M6IFtdXG4gICAgICAgICAgICBjaGFyczogIDBcbiAgICAgICAgICAgIGluZGV4OiAgbGluZW5vKytcbiAgICAgICAgICAgIG51bWJlcjogbGluZW5vXG4gICAgICAgICAgICBleHQ6ICAgIGV4dFxuXG4gICAgICAgIGNodW5rcyA9IHRleHQuc3BsaXQgL1xccy9cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICByZXR1cm4gbGluZSAjIGVtcHR5IGxpbmVcbiAgICAgICAgICAgIFxuICAgICAgICBjID0gMFxuICAgICAgICBmb3IgcyBpbiBjaHVua3NcbiAgICAgICAgICAgIGlmIHMgPT0gJydcbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBjKytcbiAgICAgICAgICAgICAgICBsID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzYyA9IGNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIHNlcGVyYXRlIGJ5IHB1bmN0dWF0aW9uXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmUgPSAvXFxXKy9naVxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSByZS5leGVjIHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIG0uaW5kZXggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB3bCA9IG0uaW5kZXgtKGMtc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICB3ID0gc1tjLXNjLi4ubS5pbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggY29sdW1uOmMsIGxlbmd0aDp3bCwgc3RyaW5nOncsIHZhbHVlOndvcmQgdyBcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gd2xcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBwdW5jdCA9IG1bMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgcHVuY3QubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YysrLCBsZW5ndGg6MSwgc3RyaW5nOnB1bmN0WzBdLCB0dXJkOnB1bmN0LCB2YWx1ZToncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgcGMgaW4gcHVuY3RbMS4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggY29sdW1uOmMrKywgbGVuZ3RoOjEsIHN0cmluZzpwYywgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIGNvbHVtbjpjKyssIGxlbmd0aDoxLCBzdHJpbmc6cHVuY3QsIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjIDwgc2MrbCAgICAgICAgIyBjaGVjayBmb3IgcmVtYWluaW5nIG5vbi1wdW5jdFxuICAgICAgICAgICAgICAgICAgICBybCA9IHNjK2wtYyAgICAjIGxlbmd0aCBvZiByZW1haW5kZXJcbiAgICAgICAgICAgICAgICAgICAgdyA9IHNbbC1ybC4uXSAgIyB0ZXh0ICAgb2YgcmVtYWluZGVyIFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIGNvbHVtbjpjLCBsZW5ndGg6cmwsIHN0cmluZzp3LCB2YWx1ZTp3b3JkIHdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoXG4gICAgICAgICAgICBsYXN0ID0gbGluZS5jaHVua3NbLTFdXG4gICAgICAgICAgICBsaW5lLmNoYXJzID0gbGFzdC5jb2x1bW4gKyBsYXN0Lmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgIGxpbmVcbiAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5ibG9ja2VkID0gKGxpbmVzKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tlZCAqbGluZXMqJ1xuICAgICAgICBcbiAgICAgICAgKmxpbmVzKjogIGFycmF5IG9mIGNodW5rZWQgbGluZXNcbiAgICAgICAgXG4gICAgICAgICoqcmV0dXJucyoqIGxpbmVzIHdpdGggXG4gICAgICAgIC0gJ2V4dCcgc3dpdGNoZWQgaW4gc29tZSBsaW5lc1xuICAgICAgICAtICd2YWx1ZScgY2hhbmdlZCBpbiBjaHVua3MgdGhhdCBtYXRjaCBsYW5ndWFnZSBwYXR0ZXJuc1xuICAgICAgICAgIFxuICAgIGV4dFN0YWNrID0gW11cbiAgICBcbiAgICBzdGFja3MgICAgID0gW11cbiAgICBoYW5kbCAgICAgID0gW11cbiAgICBzdGFjayAgICAgID0gbnVsbFxuICAgIGV4dCAgICAgICAgPSBudWxsXG4gICAgY2h1bmsgICAgICA9IG51bGxcbiAgICBsaW5lICAgICAgID0gbnVsbFxuICAgIGNodW5rSW5kZXggPSBudWxsXG4gICAgICAgICAgIFxuICAgIGhhc2hDb21tZW50ID0gLT4gXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gMCBpZiBzdGFjay5sZW5ndGggPiAxXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gXCIjXCJcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgY29tbWVudCdcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGgtMVxuICAgICAgICAgICAgICAgIGZvciBjIGluIGxpbmUuY2h1bmtzW2NodW5rSW5kZXgrMS4uXVxuICAgICAgICAgICAgICAgICAgICBjLnZhbHVlID0gJ2NvbW1lbnQnXG4gICAgICAgICAgICByZXR1cm4gbGluZS5jaHVua3MubGVuZ3RoIC0gY2h1bmtJbmRleCArIDFcbiAgICAgICAgMFxuXG4gICAgc2xhc2hDb21tZW50ID0gLT4gMFxuICAgICAgICAgICAgICAgIFxuICAgIGRhc2hBcnJvdyA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gJz4nIGFuZCBjaHVua0luZGV4ID4gMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwcmV2ID0gbGluZS5jaHVua3NbY2h1bmtJbmRleC0xXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBwcmV2LnN0cmluZyA9PSAnLSdcbiAgICAgICAgICAgICAgICBwcmV2LnZhbHVlICs9ICcgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIGZ1bmN0aW9uIGhlYWQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHByZXYuc3RyaW5nID09ICc9JyBcbiAgICAgICAgICAgICAgICBwcmV2LnZhbHVlICs9ICcgZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgICAgICAgICAgICAgIFxuICAgIHJlZ2V4cCA9IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBjaHVuay5zdHJpbmcgPT0gJy8nXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIHJlZ2V4cCdcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIDBcbiAgICBcbiAgICBoYW5kbGVycyA9IFxuICAgICAgICBrb2ZmZWU6IHB1bmN0OiBbIGhhc2hDb21tZW50LCAgZGFzaEFycm93LCByZWdleHAgXVxuICAgICAgICBjb2ZmZWU6IHB1bmN0OiBbIGhhc2hDb21tZW50LCAgZGFzaEFycm93LCByZWdleHAgXVxuICAgICAgICBqczogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgZGFzaEFycm93LCByZWdleHAgXVxuICAgICAgICB0czogICAgIHB1bmN0OiBbIHNsYXNoQ29tbWVudCwgZGFzaEFycm93LCByZWdleHAgXVxuICAgICAgICBtZDogICAgIHt9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuXG4gICAgICAgIGlmIGV4dFN0YWNrLmxlbmd0aFxuICAgICAgICAgICAgdG9wID0gZXh0U3RhY2tbLTFdXG4gICAgICAgICAgICBpZiB0b3Auc3dpdGNoLmluZGVudCBhbmQgbGluZS5jaHVua3NbMF0/LmNvbHVtbiA8PSB0b3Auc3RhcnQuY2h1bmtzWzBdLmNvbHVtblxuICAgICAgICAgICAgICAgIGV4dFN0YWNrLnBvcCgpXG4gICAgICAgICAgICAgICAgbGluZS5wb3AgPSB0cnVlXG4gICAgICAgICAgICAgICAgbGluZS5leHQgPSB0b3Auc3RhcnQuZXh0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbGluZS5leHQgPSB0b3Auc3dpdGNoLnRvXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGV4dCAhPSBsaW5lLmV4dFxuICAgICAgICAgICAgZXh0ID0gbGluZS5leHRcbiAgICAgICAgICAgIGlmIHN0YWNrcy5sZW5ndGggYW5kIGxpbmUucG9wXG4gICAgICAgICAgICAgICAgc3RhY2sgPSBzdGFja3MucG9wXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3RhY2tzLnB1c2ggc3RhY2sgaWYgc3RhY2tcbiAgICAgICAgICAgICAgICBzdGFjayA9IFsgZXh0OmV4dCBdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBoYW5kbCA9IGhhbmRsZXJzW2V4dF1cbiAgICAgICAgXG4gICAgICAgIGNodW5rSW5kZXggPSAwXG4gICAgICAgIHdoaWxlIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGNodW5rID0gbGluZS5jaHVua3NbY2h1bmtJbmRleF1cbiAgICAgICAgICAgIGJlZm9yZUluZGV4ID0gY2h1bmtJbmRleFxuICAgICAgICAgICAgaWYgY2h1bmsudmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG10Y2ggPSBTeW50YXgudHVyZFtsaW5lLmV4dF0/W2NodW5rLnN0cmluZ11cbiAgICAgICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgbXRjaC50dXJkIGlmIG10Y2gudHVyZFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tjaHVua0luZGV4KzFdPy52YWx1ZSA9IG10Y2hbJ3ctMCddIGlmIG10Y2hbJ3ctMCddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBleHRTdGFjay5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZXh0U3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgICAgIGlmIHRvcC5zd2l0Y2guZW5kID09IGNodW5rLnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgZXh0U3RhY2sucG9wKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUucG9wID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5leHQgPSB0b3Auc3RhcnQuZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BwZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBwb3BwZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgbXRjaCA9IFN5bnRheC5zd3RjaFtsaW5lLmV4dF0/W2NodW5rLnR1cmRdXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRTdGFjay5wdXNoIHN3aXRjaDptdGNoLCBzdGFydDpsaW5lXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC5wdW5jdCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciBobmQgaW4gaGFuZGwud29yZCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSBiZWZvcmVJbmRleFxuICAgICAgICAgICAgICAgIGNodW5rSW5kZXgrK1xuICAgIGxpbmVzXG4gICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmJsb2NrcyA9IChsaW5lcywgZXh0PSdrb2ZmZWUnKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tzICpsaW5lcyosICpleHQqJ1xuXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBzdHJpbmdzXG4gICAgICAgIFxuICAgICAgICAqZXh0KjpcbiAgICAgICAgLSBrb2ZmZWUgY29mZmVlIGpzIHRzIFxuICAgICAgICAtIHN0eWwgY3NzIHNhc3Mgc2NzcyBcbiAgICAgICAgLSBwdWcgaHRtbCBodG0gc3ZnIFxuICAgICAgICAtIGNwcCBocHAgY3h4IGMgaCBcbiAgICAgICAgLSBiYXNoIGZpc2ggc2ggXG4gICAgICAgIC0gbm9vbiBqc29uXG4gICAgICAgIC0gbWQgcGxpc3QgXG4gICAgICAgIC0gaXNzIGluaVxuICAgICAgICAtIHR4dCBsb2cgXG5cbiAgICAgICAgKipyZXR1cm5zKiogdGhlIHJlc3VsdCBvZlxuICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICAgICAgYGBgXG5cbiAgICBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5yYW5nZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdyYW5nZWQgKmxpbmVzKidcbiAgICAgICAgXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgICAgIFxuICAgICAgICAqKnJldHVybnMqKiBhcnJheSBvZlxuXG4gICAgICAgICAgICBzdGFydDogblxuICAgICAgICAgICAgbWF0Y2g6IHNcbiAgICAgICAgICAgIHZhbHVlOiBzXG4gICAgICAgIFxuICAgIHJuZ3MgPSBbXVxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAga2xvZyBjaHVuay52YWx1ZSBpZiBub3QgY2h1bmsudmFsdWUucmVwbGFjZVxuICAgICAgICAgICAgcmFuZ2UgPVxuICAgICAgICAgICAgICAgIHN0YXJ0OiBjaHVuay5jb2x1bW5cbiAgICAgICAgICAgICAgICBtYXRjaDogY2h1bmsuc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNodW5rLnZhbHVlLnJlcGxhY2UgJ3B1bmN0JywgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgcm5ncy5wdXNoIHJhbmdlXG4gICAgcm5nc1xuICAgIFxuICAgIFxu4pa4cHJvZmlsZSAnYmxvY2tzJ1xuXG4gICAgc3BhY2VkID0gYmxvY2tzIGxpbmVzXG5cbuKWuHByb2ZpbGUgJ3N5bnRheDEnXG4gICAgcmFuZ2VzID0gbGluZXMubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdrb2ZmZWUnXG5cbiMga2xvZyBzcGFjZWRcbiMga2xvZyByYW5nZXNcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIHJhbmdlczogKHRleHRsaW5lLCBleHQpIC0+IHJhbmdlZCBibG9ja3MgW3RleHRsaW5lXSwgZXh0XG4gICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcblxu4pa4dGVzdCAnY29tbWVudCdcblxuICAgIGJsb2NrcyhbXCIjI1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50JyB0dXJkOlwiIyNcIn0gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzpcIiNcIiB2YWx1ZTonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgIF1dXG5cbiAgICBibG9ja3MoW1wiLCNhXCJdKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6XCIsXCIgdmFsdWU6J3B1bmN0JyB0dXJkOiBcIiwjXCJ9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MSBsZW5ndGg6MSBzdHJpbmc6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjIgbGVuZ3RoOjEgc3RyaW5nOlwiYVwiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICBcbuKWuHRlc3QgJ2Z1bmN0aW9uJ1xuXG4gICAgYmxvY2tzKFsnLT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOictJyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDogJy0+J30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICBdXVxuICAgIGJsb2NrcyhbJz0+J10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonPScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnIHR1cmQ6ICc9Pid9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MSBsZW5ndGg6MSBzdHJpbmc6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICBibG9ja3MoWydmPS0+MSddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6NSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6J2YnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoxIGxlbmd0aDoxIHN0cmluZzonPScgdmFsdWU6J3B1bmN0JyB0dXJkOic9LT4nIH0gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoyIGxlbmd0aDoxIHN0cmluZzonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjMgbGVuZ3RoOjEgc3RyaW5nOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46NCBsZW5ndGg6MSBzdHJpbmc6JzEnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICBcbuKWuHRlc3QgJ21pbmltYWwnXG4gICAgICAgICAgICAgICAgXG4gICAgYmxvY2tzKFsnMSddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6JzEnIHZhbHVlOid0ZXh0J30gXV1cbiAgICBibG9ja3MoWydhJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonYScgdmFsdWU6J3RleHQnfSBdXVxuICAgIGJsb2NrcyhbJy4nXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOicuJyB2YWx1ZToncHVuY3QnfSBdXVxuXG4gICAgYmxvY2tzKFsnMS5hJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MCAgbGVuZ3RoOjEgc3RyaW5nOicxJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDoxIHN0cmluZzonLicgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MiAgbGVuZ3RoOjEgc3RyaW5nOidhJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoWycrK2EnXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjowICBsZW5ndGg6MSBzdHJpbmc6JysnIHZhbHVlOidwdW5jdCcsIHR1cmQ6JysrJ30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MSAgbGVuZ3RoOjEgc3RyaW5nOicrJyB2YWx1ZToncHVuY3QnfSBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjoyICBsZW5ndGg6MSBzdHJpbmc6J2EnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgIFxuICAgIGJsb2NrcyhbXCLilrhkb2MgJ2hlbGxvJ1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjEyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjAgIGxlbmd0aDoxIHN0cmluZzon4pa4JyAgICAgdmFsdWU6J3B1bmN0IG1ldGEnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46MSAgbGVuZ3RoOjMgc3RyaW5nOidkb2MnICAgdmFsdWU6J21ldGEnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46NSAgbGVuZ3RoOjEgc3RyaW5nOlwiJ1wiICAgICB2YWx1ZToncHVuY3QnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46NiAgbGVuZ3RoOjUgc3RyaW5nOlwiaGVsbG9cIiB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjoxMSBsZW5ndGg6MSBzdHJpbmc6XCInXCIgICAgIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgIFxu4pa4dGVzdCAnc3BhY2UnXG5cbiAgICBiID0gYmxvY2tzIFtcInhcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyAwXG5cbiAgICBiID0gYmxvY2tzIFtcIiB4eFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDFcbiAgICBcbiAgICBiID0gYmxvY2tzIFtcIiAgICB4eHhcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyA0XG5cbiAgICBiID0gYmxvY2tzIFtcIiAgICB4IDEgICwgXCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgNFxuICAgIGJbMF0uY2h1bmtzWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDZcbiAgICBiWzBdLmNodW5rc1syXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyA5XG5cbuKWuHRlc3QgJ3N3aXRjaGVzJ1xuICAgIFxuICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICB4ICAgIFxuICAgICAgICAgICAgeVxuICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcblxuICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICB4ICBcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICB5XG4gICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcblxuICAgIGIgPSBibG9ja3MgXCJcIlwiICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAg4pa4ZG9jICdoZWxsbycgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHQgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDErMSAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICDilrhkb2MgJ2FnYWluJyAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZSAqKmRvY3MqKiAgICAgXG4gICAgICAgICAgICBgYGAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgeSAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJyAgICAgICAgICAgICAgIFxuICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbN10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbOF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBcbiJdfQ==
//# sourceURL=../coffee/blocks.coffee