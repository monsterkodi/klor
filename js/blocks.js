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
    var advance, beforeIndex, chunk, chunkIndex, dashArrow, ext, extStack, handl, handlers, hashComment, hnd, i, j, k, len, len1, len2, line, mtch, popped, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, regexp, slashComment, stack, stacks, top;
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
                    if ((top["switch"].end != null) && top["switch"].end === chunk.turd) {
                        extStack.pop();
                        line.pop = true;
                        line.ext = top.start.ext;
                        popped = true;
                    }
                }
                if (!popped) {
                    if (mtch = (ref4 = Syntax.swtch[line.ext]) != null ? ref4[(ref5 = chunk.turd) != null ? ref5 : chunk.string] : void 0) {
                        extStack.push({
                            "switch": mtch,
                            start: line
                        });
                    }
                }
                ref7 = (ref6 = handl.punct) != null ? ref6 : [];
                for (j = 0, len1 = ref7.length; j < len1; j++) {
                    hnd = ref7[j];
                    if (advance = hnd()) {
                        chunkIndex += advance;
                        break;
                    }
                }
            } else {
                ref9 = (ref8 = handl.word) != null ? ref8 : [];
                for (k = 0, len2 = ref9.length; k < len2; k++) {
                    hnd = ref9[k];
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

if (koffee_300_0 = process.hrtime()) {
    ranges = lines.map(function(l) {
        return Syntax.ranges(l, 'koffee');
    });
    console.log('syntax1', require('pretty-time')(process.hrtime(koffee_300_0)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUF1QyxPQUFBLENBQVEsS0FBUixDQUF2QyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkIsZUFBM0IsRUFBaUM7O0FBQW1CLElBQUEsNkJBQUE7SUFHaEQsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO0lBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBQTtJQUVBLE1BQU0sQ0FBQyxLQUFQLEdBQ0k7UUFBQSxNQUFBLEVBQVE7WUFBQSxHQUFBLEVBQVE7Z0JBQUEsRUFBQSxFQUFJLElBQUo7Z0JBQWEsRUFBQSxFQUFHLEtBQWhCO2dCQUErQixNQUFBLEVBQVEsQ0FBdkM7YUFBUjtTQUFSO1FBQ0EsRUFBQSxFQUFRO1lBQUEsS0FBQSxFQUFRO2dCQUFBLEVBQUEsRUFBSSxRQUFKO2dCQUFhLEVBQUEsRUFBRyxjQUFoQjtnQkFBK0IsR0FBQSxFQUFRLEtBQXZDO2FBQVI7U0FEUjs7SUFHSixJQUFBLEdBQU8sS0FBSyxDQUFDLFFBQU4sQ0FBa0IsU0FBRCxHQUFXLG1DQUE1QjtJQUlQLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFkd0M7NkVBQUE7OztBQXNCcEQsT0FBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFFUCxRQUFBO0FBQUE7SUFrQkMsSUFBQSxHQUFPLFNBQUMsQ0FBRDtRQUFPLElBQUcsTUFBTSxDQUFDLElBQUssQ0FBQSxHQUFBLENBQUksQ0FBQyxjQUFqQixDQUFnQyxDQUFoQyxDQUFIO21CQUEwQyxNQUFNLENBQUMsSUFBSyxDQUFBLEdBQUEsQ0FBSyxDQUFBLENBQUEsRUFBM0Q7U0FBQSxNQUFBO21CQUFtRSxPQUFuRTs7SUFBUDtJQUVQLE1BQUEsR0FBUztXQUNULEtBQUssQ0FBQyxHQUFOLENBQVUsU0FBQyxJQUFEO0FBRU4sWUFBQTtR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QSxDQUFPLEtBQVAsRUFEYjtnRkFBQTs7O0FBR0EsSUFBQSwrQkFBQTtJQUNJLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsQ0FBRDtlQUFPLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBZCxFQUFpQixRQUFqQjtJQUFQLENBQVYsRUFEYjtpRkFBQTs7O0FBTUEsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLE1BQUEsRUFBUSxTQUFDLFFBQUQsRUFBVyxHQUFYO2VBQW1CLE1BQUEsQ0FBTyxNQUFBLENBQU8sQ0FBQyxRQUFELENBQVAsRUFBbUIsR0FBbkIsQ0FBUDtJQUFuQixDQUFSIiwic291cmNlc0NvbnRlbnQiOlsiXG57IHNsYXNoLCBrc3RyLCBrbG9nLCBub29uLCBjaGFpLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbuKWuHByb2ZpbGUgJy0tLS0tJyBcbiAgICBTeW50YXggPSByZXF1aXJlICcuL3N5bnRheCdcbiAgICBTeW50YXguaW5pdCgpXG4gICAgXG4gICAgU3ludGF4LnN3dGNoID0gXG4gICAgICAgIGtvZmZlZTogJ+KWuCc6ICAgIHRvOiAnbWQnICAgICB3MDonZG9jJyAgICAgICAgICBpbmRlbnQ6IDFcbiAgICAgICAgbWQ6ICAgICAnYGBgJzogIHRvOiAna29mZmVlJyB3MDonY29mZmVlc2NyaXB0JyBlbmQ6ICAgICdgYGAnXG5cbiAgICB0ZXh0ID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL2NvZmZlZS9ub2Rlcy5jb2ZmZWVcIiAjIDMwbXNcbiAgICAjIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvdGVzdC5rb2ZmZWVcIlxuICAgICMgdGV4dCA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9L3Rlc3QuY29mZmVlXCIgIyA1MDB1c1xuXG4gICAgbGluZXMgPSB0ZXh0LnNwbGl0ICdcXG4nXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbmNodW5rZWQgPSAobGluZXMsIGV4dCkgLT4gICAgXG5cbiAgICDilrhkb2MgJ2NodW5rZWQgKmxpbmVzKiwgKmV4dConXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogYXJyYXkgb2ZcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmc6IHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAgc1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IG5cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgZXh0OiAgICBzXG4gICAgICAgICAgICBjaGFyczogIG5cbiAgICAgICAgICAgIGluZGV4OiAgblxuICAgICAgICAgICAgbnVtYmVyOiBuKzFcbiAgICBcbiAgICB3b3JkID0gKHcpIC0+IGlmIFN5bnRheC5sYW5nW2V4dF0uaGFzT3duUHJvcGVydHkgdyB0aGVuIFN5bnRheC5sYW5nW2V4dF1bd10gZWxzZSAndGV4dCdcbiAgICBcbiAgICBsaW5lbm8gPSAwXG4gICAgbGluZXMubWFwICh0ZXh0KSAtPiBcbiAgICAgICAgXG4gICAgICAgIGxpbmUgPSBcbiAgICAgICAgICAgIGNodW5rczogW11cbiAgICAgICAgICAgIGNoYXJzOiAgMFxuICAgICAgICAgICAgaW5kZXg6ICBsaW5lbm8rK1xuICAgICAgICAgICAgbnVtYmVyOiBsaW5lbm9cbiAgICAgICAgICAgIGV4dDogICAgZXh0XG5cbiAgICAgICAgY2h1bmtzID0gdGV4dC5zcGxpdCAvXFxzL1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmtzLmxlbmd0aCA9PSAxIGFuZCBjaHVua3NbMF0gPT0gJydcbiAgICAgICAgICAgIHJldHVybiBsaW5lICMgZW1wdHkgbGluZVxuICAgICAgICAgICAgXG4gICAgICAgIGMgPSAwXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzLmxlbmd0aCB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZSA9IC9cXFcrL2dpXG4gICAgICAgICAgICAgICAgd2hpbGUgbSA9IHJlLmV4ZWMgc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5pbmRleCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdsID0gbS5pbmRleC0oYy1zYylcbiAgICAgICAgICAgICAgICAgICAgICAgIHcgPSBzW2Mtc2MuLi5tLmluZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YywgbGVuZ3RoOndsLCBzdHJpbmc6dywgdmFsdWU6d29yZCB3IFxuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSB3bFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHB1bmN0ID0gbVswXVxuICAgICAgICAgICAgICAgICAgICBpZiBwdW5jdC5sZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIGNvbHVtbjpjKyssIGxlbmd0aDoxLCBzdHJpbmc6cHVuY3RbMF0sIHR1cmQ6cHVuY3QsIHZhbHVlOidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBwYyBpbiBwdW5jdFsxLi5dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBjb2x1bW46YysrLCBsZW5ndGg6MSwgc3RyaW5nOnBjLCB2YWx1ZToncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggY29sdW1uOmMrKywgbGVuZ3RoOjEsIHN0cmluZzpwdW5jdCwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXIgXG4gICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggY29sdW1uOmMsIGxlbmd0aDpybCwgc3RyaW5nOncsIHZhbHVlOndvcmQgd1xuICAgICAgICAgICAgICAgICAgICBjICs9IHJsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGxhc3QgPSBsaW5lLmNodW5rc1stMV1cbiAgICAgICAgICAgIGxpbmUuY2hhcnMgPSBsYXN0LmNvbHVtbiArIGxhc3QubGVuZ3RoXG4gICAgICAgICAgICBcbiAgICAgICAgbGluZVxuICAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG5cbmJsb2NrZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdibG9ja2VkICpsaW5lcyonXG4gICAgICAgIFxuICAgICAgICAqbGluZXMqOiAgYXJyYXkgb2YgY2h1bmtlZCBsaW5lc1xuICAgICAgICBcbiAgICAgICAgKipyZXR1cm5zKiogbGluZXMgd2l0aCBcbiAgICAgICAgLSAnZXh0JyBzd2l0Y2hlZCBpbiBzb21lIGxpbmVzXG4gICAgICAgIC0gJ3ZhbHVlJyBjaGFuZ2VkIGluIGNodW5rcyB0aGF0IG1hdGNoIGxhbmd1YWdlIHBhdHRlcm5zXG4gICAgICAgICAgXG4gICAgZXh0U3RhY2sgPSBbXVxuICAgIFxuICAgIHN0YWNrcyAgICAgPSBbXVxuICAgIGhhbmRsICAgICAgPSBbXVxuICAgIHN0YWNrICAgICAgPSBudWxsXG4gICAgZXh0ICAgICAgICA9IG51bGxcbiAgICBjaHVuayAgICAgID0gbnVsbFxuICAgIGxpbmUgICAgICAgPSBudWxsXG4gICAgY2h1bmtJbmRleCA9IG51bGxcbiAgICAgICAgICAgXG4gICAgaGFzaENvbW1lbnQgPSAtPiBcbiAgICAgICAgXG4gICAgICAgIHJldHVybiAwIGlmIHN0YWNrLmxlbmd0aCA+IDFcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSBcIiNcIlxuICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyBjb21tZW50J1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgZm9yIGMgaW4gbGluZS5jaHVua3NbY2h1bmtJbmRleCsxLi5dXG4gICAgICAgICAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgIHJldHVybiBsaW5lLmNodW5rcy5sZW5ndGggLSBjaHVua0luZGV4ICsgMVxuICAgICAgICAwXG5cbiAgICBzbGFzaENvbW1lbnQgPSAtPiAwXG4gICAgICAgICAgICAgICAgXG4gICAgZGFzaEFycm93ID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnPicgYW5kIGNodW5rSW5kZXggPiAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHByZXYgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4LTFdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHByZXYuc3RyaW5nID09ICctJ1xuICAgICAgICAgICAgICAgIHByZXYudmFsdWUgKz0gJyBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcHJldi5zdHJpbmcgPT0gJz0nIFxuICAgICAgICAgICAgICAgIHByZXYudmFsdWUgKz0gJyBmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAwXG4gICAgICAgICAgICAgICAgXG4gICAgcmVnZXhwID0gLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnN0cmluZyA9PSAnLydcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgcmVnZXhwJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgMFxuICAgIFxuICAgIGhhbmRsZXJzID0gXG4gICAgICAgIGtvZmZlZTogcHVuY3Q6IFsgaGFzaENvbW1lbnQsICBkYXNoQXJyb3csIHJlZ2V4cCBdXG4gICAgICAgIGNvZmZlZTogcHVuY3Q6IFsgaGFzaENvbW1lbnQsICBkYXNoQXJyb3csIHJlZ2V4cCBdXG4gICAgICAgIGpzOiAgICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBkYXNoQXJyb3csIHJlZ2V4cCBdXG4gICAgICAgIHRzOiAgICAgcHVuY3Q6IFsgc2xhc2hDb21tZW50LCBkYXNoQXJyb3csIHJlZ2V4cCBdXG4gICAgICAgIG1kOiAgICAge31cbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGZvciBsaW5lIGluIGxpbmVzXG5cbiAgICAgICAgaWYgZXh0U3RhY2subGVuZ3RoXG4gICAgICAgICAgICB0b3AgPSBleHRTdGFja1stMV1cbiAgICAgICAgICAgIGlmIHRvcC5zd2l0Y2guaW5kZW50IGFuZCBsaW5lLmNodW5rc1swXT8uY29sdW1uIDw9IHRvcC5zdGFydC5jaHVua3NbMF0uY29sdW1uXG4gICAgICAgICAgICAgICAgZXh0U3RhY2sucG9wKClcbiAgICAgICAgICAgICAgICBsaW5lLnBvcCA9IHRydWVcbiAgICAgICAgICAgICAgICBsaW5lLmV4dCA9IHRvcC5zdGFydC5leHRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsaW5lLmV4dCA9IHRvcC5zd2l0Y2gudG9cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgZXh0ICE9IGxpbmUuZXh0XG4gICAgICAgICAgICBleHQgPSBsaW5lLmV4dFxuICAgICAgICAgICAgaWYgc3RhY2tzLmxlbmd0aCBhbmQgbGluZS5wb3BcbiAgICAgICAgICAgICAgICBzdGFjayA9IHN0YWNrcy5wb3BcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzdGFja3MucHVzaCBzdGFjayBpZiBzdGFja1xuICAgICAgICAgICAgICAgIHN0YWNrID0gWyBleHQ6ZXh0IF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGhhbmRsID0gaGFuZGxlcnNbZXh0XVxuICAgICAgICBcbiAgICAgICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgd2hpbGUgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgY2h1bmsgPSBsaW5lLmNodW5rc1tjaHVua0luZGV4XVxuICAgICAgICAgICAgYmVmb3JlSW5kZXggPSBjaHVua0luZGV4XG4gICAgICAgICAgICBpZiBjaHVuay52YWx1ZSA9PSAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbXRjaCA9IFN5bnRheC50dXJkW2xpbmUuZXh0XT9bY2h1bmsuc3RyaW5nXSAjIOKWuCBkb2NcbiAgICAgICAgICAgICAgICAgICAgY2h1bmsudmFsdWUgKz0gJyAnICsgbXRjaC50dXJkIGlmIG10Y2gudHVyZFxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tjaHVua0luZGV4KzFdPy52YWx1ZSA9IG10Y2hbJ3ctMCddIGlmIG10Y2hbJ3ctMCddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBleHRTdGFjay5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgdG9wID0gZXh0U3RhY2tbLTFdXG4gICAgICAgICAgICAgICAgICAgIGlmIHRvcC5zd2l0Y2guZW5kPyBhbmQgdG9wLnN3aXRjaC5lbmQgPT0gY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgZXh0U3RhY2sucG9wKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUucG9wID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5leHQgPSB0b3Auc3RhcnQuZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3BwZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG5vdCBwb3BwZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgbXRjaCA9IFN5bnRheC5zd3RjaFtsaW5lLmV4dF0/W2NodW5rLnR1cmQgPyBjaHVuay5zdHJpbmddXG4gICAgICAgICAgICAgICAgICAgICAgICBleHRTdGFjay5wdXNoIHN3aXRjaDptdGNoLCBzdGFydDpsaW5lXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC5wdW5jdCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZvciBobmQgaW4gaGFuZGwud29yZCA/IFtdXG4gICAgICAgICAgICAgICAgICAgIGlmIGFkdmFuY2UgPSBobmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2h1bmtJbmRleCArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWYgY2h1bmtJbmRleCA9PSBiZWZvcmVJbmRleFxuICAgICAgICAgICAgICAgIGNodW5rSW5kZXgrK1xuICAgIGxpbmVzXG4gICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG5cbmJsb2NrcyA9IChsaW5lcywgZXh0PSdrb2ZmZWUnKSAtPlxuICAgIFxuICAgIOKWuGRvYyAnYmxvY2tzICpsaW5lcyosICpleHQqJ1xuXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBzdHJpbmdzXG4gICAgICAgIFxuICAgICAgICAqZXh0KjpcbiAgICAgICAgLSBrb2ZmZWUgY29mZmVlIGpzIHRzIFxuICAgICAgICAtIHN0eWwgY3NzIHNhc3Mgc2NzcyBcbiAgICAgICAgLSBwdWcgaHRtbCBodG0gc3ZnIFxuICAgICAgICAtIGNwcCBocHAgY3h4IGMgaCBcbiAgICAgICAgLSBiYXNoIGZpc2ggc2ggXG4gICAgICAgIC0gbm9vbiBqc29uXG4gICAgICAgIC0gbWQgcGxpc3QgXG4gICAgICAgIC0gaXNzIGluaVxuICAgICAgICAtIHR4dCBsb2cgXG5cbiAgICAgICAgKipyZXR1cm5zKiogdGhlIHJlc3VsdCBvZlxuICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcbiAgICAgICAgYGBgXG5cbiAgICBibG9ja2VkIGNodW5rZWQgbGluZXMsIGV4dFxuICAgIFxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG5yYW5nZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAg4pa4ZG9jICdyYW5nZWQgKmxpbmVzKidcbiAgICAgICAgXG4gICAgICAgICpsaW5lcyo6ICBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgICAgIFxuICAgICAgICAqKnJldHVybnMqKiBhcnJheSBvZlxuXG4gICAgICAgICAgICBzdGFydDogblxuICAgICAgICAgICAgbWF0Y2g6IHNcbiAgICAgICAgICAgIHZhbHVlOiBzXG4gICAgICAgIFxuICAgIHJuZ3MgPSBbXVxuICAgIGZvciBsaW5lIGluIGxpbmVzXG4gICAgICAgIGZvciBjaHVuayBpbiBsaW5lLmNodW5rc1xuICAgICAgICAgICAga2xvZyBjaHVuay52YWx1ZSBpZiBub3QgY2h1bmsudmFsdWUucmVwbGFjZVxuICAgICAgICAgICAgcmFuZ2UgPVxuICAgICAgICAgICAgICAgIHN0YXJ0OiBjaHVuay5jb2x1bW5cbiAgICAgICAgICAgICAgICBtYXRjaDogY2h1bmsuc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWU6IGNodW5rLnZhbHVlLnJlcGxhY2UgJ3B1bmN0JywgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgcm5ncy5wdXNoIHJhbmdlXG4gICAgcm5nc1xuICAgIFxuICAgIFxu4pa4cHJvZmlsZSAnYmxvY2tzJ1xuICAgIHNwYWNlZCA9IGJsb2NrcyBsaW5lc1xuXG7ilrhwcm9maWxlICdzeW50YXgxJ1xuICAgIHJhbmdlcyA9IGxpbmVzLm1hcCAobCkgLT4gU3ludGF4LnJhbmdlcyBsLCAna29mZmVlJ1xuXG4jIGtsb2cgc3BhY2VkXG4jIGtsb2cgcmFuZ2VzXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICByYW5nZXM6ICh0ZXh0bGluZSwgZXh0KSAtPiByYW5nZWQgYmxvY2tzIFt0ZXh0bGluZV0sIGV4dFxuICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgICAgICAgICAgIDAwMCAgICAgMDAwICAgICBcbiMgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG5cbuKWuHRlc3QgJ2NvbW1lbnQnXG5cbiAgICBibG9ja3MoW1wiIyNcIl0pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCcgdHVyZDpcIiMjXCJ9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MSBsZW5ndGg6MSBzdHJpbmc6XCIjXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICBdXVxuXG4gICAgYmxvY2tzKFtcIiwjYVwiXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOlwiLFwiIHZhbHVlOidwdW5jdCcgdHVyZDogXCIsI1wifSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50J30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjoyIGxlbmd0aDoxIHN0cmluZzpcImFcIiB2YWx1ZTonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgXG7ilrh0ZXN0ICdmdW5jdGlvbidcblxuICAgIGJsb2NrcyhbJy0+J10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6ICctPid9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MSBsZW5ndGg6MSBzdHJpbmc6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgXV1cbiAgICBibG9ja3MoWyc9PiddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6Jz0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJyB0dXJkOiAnPT4nfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjEgbGVuZ3RoOjEgc3RyaW5nOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCd9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgYmxvY2tzKFsnZj0tPjEnXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjUgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOidmJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MSBsZW5ndGg6MSBzdHJpbmc6Jz0nIHZhbHVlOidwdW5jdCcgdHVyZDonPS0+JyB9IFxuICAgICAgICAgICAgICAgIHtjb2x1bW46MiBsZW5ndGg6MSBzdHJpbmc6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJ30gXG4gICAgICAgICAgICAgICAge2NvbHVtbjozIGxlbmd0aDoxIHN0cmluZzonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICB7Y29sdW1uOjQgbGVuZ3RoOjEgc3RyaW5nOicxJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgXG7ilrh0ZXN0ICdtaW5pbWFsJ1xuICAgICAgICAgICAgICAgIFxuICAgIGJsb2NrcyhbJzEnXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7Y29sdW1uOjAgbGVuZ3RoOjEgc3RyaW5nOicxJyB2YWx1ZTondGV4dCd9IF1dXG4gICAgYmxvY2tzKFsnYSddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtjb2x1bW46MCBsZW5ndGg6MSBzdHJpbmc6J2EnIHZhbHVlOid0ZXh0J30gXV1cbiAgICBibG9ja3MoWycuJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge2NvbHVtbjowIGxlbmd0aDoxIHN0cmluZzonLicgdmFsdWU6J3B1bmN0J30gXV1cblxuICAgIGJsb2NrcyhbJzEuYSddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjAgIGxlbmd0aDoxIHN0cmluZzonMScgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjoxICBsZW5ndGg6MSBzdHJpbmc6Jy4nIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjIgIGxlbmd0aDoxIHN0cmluZzonYScgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgXG4gICAgYmxvY2tzKFsnKythJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MCAgbGVuZ3RoOjEgc3RyaW5nOicrJyB2YWx1ZToncHVuY3QnLCB0dXJkOicrKyd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDoxIHN0cmluZzonKycgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MiAgbGVuZ3RoOjEgc3RyaW5nOidhJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoW1wi4pa4ZG9jICdoZWxsbydcIl0pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxMiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAge2NvbHVtbjowICBsZW5ndGg6MSBzdHJpbmc6J+KWuCcgICAgIHZhbHVlOidwdW5jdCBtZXRhJ30gXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDozIHN0cmluZzonZG9jJyAgIHZhbHVlOidtZXRhJ30gXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjUgIGxlbmd0aDoxIHN0cmluZzpcIidcIiAgICAgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgICB7Y29sdW1uOjYgIGxlbmd0aDo1IHN0cmluZzpcImhlbGxvXCIgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAgIHtjb2x1bW46MTEgbGVuZ3RoOjEgc3RyaW5nOlwiJ1wiICAgICB2YWx1ZToncHVuY3QnfSBcbiAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICBcbuKWuHRlc3QgJ3NwYWNlJ1xuXG4gICAgYiA9IGJsb2NrcyBbXCJ4XCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgMFxuXG4gICAgYiA9IGJsb2NrcyBbXCIgeHhcIl1cbiAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyAxXG4gICAgXG4gICAgYiA9IGJsb2NrcyBbXCIgICAgeHh4XCJdXG4gICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgNFxuXG4gICAgYiA9IGJsb2NrcyBbXCIgICAgeCAxICAsIFwiXVxuICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdjb2x1bW4nIDRcbiAgICBiWzBdLmNodW5rc1sxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnY29sdW1uJyA2XG4gICAgYlswXS5jaHVua3NbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2NvbHVtbicgOVxuXG7ilrh0ZXN0ICdzd2l0Y2hlcydcbiAgICBcbiAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgeCAgICBcbiAgICAgICAgICAgIHlcbiAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG5cbiAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgeCAgXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgeVxuICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG5cbiAgICBiID0gYmxvY2tzIFwiXCJcIiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIOKWuGRvYyAnaGVsbG8nICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0ICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAxKzEgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAg4pa4ZG9jICdhZ2FpbicgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWUgKipkb2NzKiogICAgIFxuICAgICAgICAgICAgYGBgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHkgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbicgICAgICAgICAgICAgICBcbiAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAna29mZmVlJ1xuICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2tvZmZlZSdcbiAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzddLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICBiWzhdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdrb2ZmZWUnXG4gICAgXG4iXX0=
//# sourceURL=../coffee/blocks.coffee