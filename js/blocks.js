// koffee 0.42.0
var Syntax, blocks, chai, klog, kstr, lines, noon, ranges, ref, slash, spaced, text;

ref = require('kxk'), slash = ref.slash, kstr = ref.kstr, klog = ref.klog, noon = ref.noon, chai = ref.chai;

if (koffee_4_0 = process.hrtime()) {
    Syntax = require('./syntax');
    Syntax.init();
    text = slash.readText(__dirname + "/test.coffee");
    lines = text.split('\n');
    console.log('-----', require('pretty-time')(process.hrtime(koffee_4_0)));
};

blocks = function(lines, ext) {
    var lineno, word;
    if (ext == null) {
        ext = 'koffee';
    }
    word = function(w) {
        var ref1;
        return (ref1 = Syntax.lang[ext][w]) != null ? ref1 : 'text';
    };
    lineno = 0;
    return lines.map(function(text) {
        var c, chunks, i, l, last, len, lineinfo, m, matchValue, mtch, obj, pl, re, ref1, rl, s, sc, w, wl;
        lineinfo = {
            chunks: [],
            chars: 0,
            index: lineno++,
            number: lineno,
            ext: ext
        };
        obj = Syntax.makeObj(text, ext);
        chunks = text.split(/\s/);
        if (chunks.length === 1 && chunks[0] === '') {
            return lineinfo;
        }
        c = 0;
        for (i = 0, len = chunks.length; i < len; i++) {
            s = chunks[i];
            if (s === '') {
                c++;
            } else {
                if (c) {
                    c++;
                }
                l = s.length;
                sc = c;
                re = /\W+/gi;
                while (m = re.exec(s)) {
                    if (m.index > 0) {
                        wl = m.index - (c - sc);
                        w = s.slice(c - sc, m.index);
                        lineinfo.chunks.push({
                            string: w,
                            column: c,
                            length: wl,
                            value: word(w)
                        });
                        c += wl;
                    }
                    pl = m[0].length;
                    lineinfo.chunks.push({
                        string: m[0],
                        column: c,
                        length: pl,
                        value: 'punct'
                    });
                    if (mtch = (ref1 = Syntax.turd[lineinfo.ext]) != null ? ref1[m[0]] : void 0) {
                        console.log('match!', m[0]);
                        if (matchValue = Syntax.doMatch(obj, mtch)) {
                            console.log('matchgValue', matchValue);
                        }
                    }
                    c += pl;
                }
                if (c < sc + l) {
                    rl = sc + l - c;
                    w = s.slice(l - rl);
                    lineinfo.chunks.push({
                        string: w,
                        column: c,
                        length: rl,
                        value: word(w)
                    });
                    c += rl;
                }
            }
        }
        if (lineinfo.chunks.length) {
            last = lineinfo.chunks.slice(-1)[0];
            lineinfo.chars = last.column + last.length;
        }
        return lineinfo;
    });
};

if (koffee_80_0 = process.hrtime()) {
    spaced = blocks(lines);
    console.log('blocks', require('pretty-time')(process.hrtime(koffee_80_0)));
};

if (koffee_84_0 = process.hrtime()) {
    ranges = lines.map(function(l) {
        return Syntax.ranges(l, 'koffee');
    });
    console.log('syntax1', require('pretty-time')(process.hrtime(koffee_84_0)));
};

console.log('[33m[93mblocks[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m90[39m', Syntax.turd.koffee);

;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tzLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUFvQyxPQUFBLENBQVEsS0FBUixDQUFwQyxFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUIsZUFBckIsRUFBMkI7O0FBQXNCLElBQUEsNkJBQUE7SUFHN0MsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO0lBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBQTtJQUlBLElBQUEsR0FBTyxLQUFLLENBQUMsUUFBTixDQUFrQixTQUFELEdBQVcsY0FBNUI7SUFFUCxLQUFBLEdBQVEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEVBVnFDOzZFQUFBOzs7QUFrQmpELE1BQUEsR0FBUyxTQUFDLEtBQUQsRUFBUSxHQUFSO0FBRUwsUUFBQTs7UUFGYSxNQUFJOztJQUVqQixJQUFBLEdBQU8sU0FBQyxDQUFEO0FBQU8sWUFBQTs2REFBc0I7SUFBN0I7SUFFUCxNQUFBLEdBQVM7V0FDVCxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsSUFBRDtBQUVOLFlBQUE7UUFBQSxRQUFBLEdBQ0k7WUFBQSxNQUFBLEVBQVEsRUFBUjtZQUNBLEtBQUEsRUFBUSxDQURSO1lBRUEsS0FBQSxFQUFRLE1BQUEsRUFGUjtZQUdBLE1BQUEsRUFBUSxNQUhSO1lBSUEsR0FBQSxFQUFRLEdBSlI7O1FBTUosR0FBQSxHQUFNLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQixHQUFyQjtRQUVOLE1BQUEsR0FBUyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVg7UUFFVCxJQUFHLE1BQU0sQ0FBQyxNQUFQLEtBQWlCLENBQWpCLElBQXVCLE1BQU8sQ0FBQSxDQUFBLENBQVAsS0FBYSxFQUF2QztBQUNJLG1CQUFPLFNBRFg7O1FBR0EsQ0FBQSxHQUFJO0FBQ0osYUFBQSx3Q0FBQTs7WUFDSSxJQUFHLENBQUEsS0FBSyxFQUFSO2dCQUNJLENBQUEsR0FESjthQUFBLE1BQUE7Z0JBR0ksSUFBRyxDQUFIO29CQUFVLENBQUEsR0FBVjs7Z0JBQ0EsQ0FBQSxHQUFJLENBQUMsQ0FBQztnQkFDTixFQUFBLEdBQUs7Z0JBSUwsRUFBQSxHQUFLO0FBQ0wsdUJBQU0sQ0FBQSxHQUFJLEVBQUUsQ0FBQyxJQUFILENBQVEsQ0FBUixDQUFWO29CQUNJLElBQUcsQ0FBQyxDQUFDLEtBQUYsR0FBVSxDQUFiO3dCQUNJLEVBQUEsR0FBSyxDQUFDLENBQUMsS0FBRixHQUFRLENBQUMsQ0FBQSxHQUFFLEVBQUg7d0JBQ2IsQ0FBQSxHQUFJLENBQUU7d0JBQ04sUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFoQixDQUFxQjs0QkFBQSxNQUFBLEVBQU8sQ0FBUDs0QkFBVSxNQUFBLEVBQU8sQ0FBakI7NEJBQW9CLE1BQUEsRUFBTyxFQUEzQjs0QkFBK0IsS0FBQSxFQUFNLElBQUEsQ0FBSyxDQUFMLENBQXJDO3lCQUFyQjt3QkFDQSxDQUFBLElBQUssR0FKVDs7b0JBS0EsRUFBQSxHQUFLLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQztvQkFDVixRQUFRLENBQUMsTUFBTSxDQUFDLElBQWhCLENBQXFCO3dCQUFBLE1BQUEsRUFBTyxDQUFFLENBQUEsQ0FBQSxDQUFUO3dCQUFhLE1BQUEsRUFBTyxDQUFwQjt3QkFBdUIsTUFBQSxFQUFPLEVBQTlCO3dCQUFrQyxLQUFBLEVBQU0sT0FBeEM7cUJBQXJCO29CQUVBLElBQUcsSUFBQSxvREFBa0MsQ0FBQSxDQUFFLENBQUEsQ0FBQSxDQUFGLFVBQXJDO3dCQUNHLE9BQUEsQ0FBQyxHQUFELENBQUssUUFBTCxFQUFlLENBQUUsQ0FBQSxDQUFBLENBQWpCO3dCQUNDLElBQUcsVUFBQSxHQUFhLE1BQU0sQ0FBQyxPQUFQLENBQWUsR0FBZixFQUFvQixJQUFwQixDQUFoQjs0QkFDRyxPQUFBLENBQUMsR0FBRCxDQUFLLGFBQUwsRUFBb0IsVUFBcEIsRUFESDt5QkFGSjs7b0JBS0EsQ0FBQSxJQUFLO2dCQWRUO2dCQWdCQSxJQUFHLENBQUEsR0FBSSxFQUFBLEdBQUcsQ0FBVjtvQkFDSSxFQUFBLEdBQUssRUFBQSxHQUFHLENBQUgsR0FBSztvQkFDVixDQUFBLEdBQUksQ0FBRTtvQkFDTixRQUFRLENBQUMsTUFBTSxDQUFDLElBQWhCLENBQXFCO3dCQUFBLE1BQUEsRUFBTyxDQUFQO3dCQUFVLE1BQUEsRUFBTyxDQUFqQjt3QkFBb0IsTUFBQSxFQUFPLEVBQTNCO3dCQUErQixLQUFBLEVBQU0sSUFBQSxDQUFLLENBQUwsQ0FBckM7cUJBQXJCO29CQUNBLENBQUEsSUFBSyxHQUpUO2lCQTFCSjs7QUFESjtRQWlDQSxJQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBbkI7WUFDSSxJQUFBLEdBQU8sUUFBUSxDQUFDLE1BQU8sVUFBRSxDQUFBLENBQUE7WUFDekIsUUFBUSxDQUFDLEtBQVQsR0FBaUIsSUFBSSxDQUFDLE1BQUwsR0FBYyxJQUFJLENBQUMsT0FGeEM7O2VBR0E7SUFyRE0sQ0FBVjtBQUxLOztBQTREVCxJQUFBLDhCQUFBO0lBRUksTUFBQSxHQUFTLE1BQUEsQ0FBTyxLQUFQLEVBRmI7K0VBQUE7OztBQUlBLElBQUEsOEJBQUE7SUFFSSxNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLENBQUQ7ZUFBTyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQWQsRUFBaUIsUUFBakI7SUFBUCxDQUFWLEVBRmI7Z0ZBQUE7OztBQU1BLG1HQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJcbnsgc2xhc2gsIGtzdHIsIGtsb2csIG5vb24sIGNoYWkgfSA9IHJlcXVpcmUgJ2t4aydcblxu4pa4cHJvZmlsZSAnLS0tLS0nIFxuICAgIFN5bnRheCA9IHJlcXVpcmUgJy4vc3ludGF4J1xuICAgIFN5bnRheC5pbml0KClcblxuICAgICMgdGV4dCA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9Ly4uLy4uL2tvZmZlZS9jb2ZmZWUvbm9kZXMuY29mZmVlXCJcbiAgICAjIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvdGVzdC5rb2ZmZWVcIlxuICAgIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiXG5cbiAgICBsaW5lcyA9IHRleHQuc3BsaXQgJ1xcbidcbiAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcblxuYmxvY2tzID0gKGxpbmVzLCBleHQ9J2tvZmZlZScpIC0+XG4gICAgXG4gICAgd29yZCA9ICh3KSAtPiBTeW50YXgubGFuZ1tleHRdW3ddID8gJ3RleHQnXG4gICAgXG4gICAgbGluZW5vID0gMFxuICAgIGxpbmVzLm1hcCAodGV4dCkgLT4gXG4gICAgICAgIFxuICAgICAgICBsaW5laW5mbyA9IFxuICAgICAgICAgICAgY2h1bmtzOiBbXVxuICAgICAgICAgICAgY2hhcnM6ICAwXG4gICAgICAgICAgICBpbmRleDogIGxpbmVubysrXG4gICAgICAgICAgICBudW1iZXI6IGxpbmVub1xuICAgICAgICAgICAgZXh0OiAgICBleHRcblxuICAgICAgICBvYmogPSBTeW50YXgubWFrZU9iaiB0ZXh0LCBleHRcbiAgICAgICAgICAgIFxuICAgICAgICBjaHVua3MgPSB0ZXh0LnNwbGl0IC9cXHMvXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVua3MubGVuZ3RoID09IDEgYW5kIGNodW5rc1swXSA9PSAnJ1xuICAgICAgICAgICAgcmV0dXJuIGxpbmVpbmZvICMgZW1wdHkgbGluZVxuICAgICAgICAgICAgXG4gICAgICAgIGMgPSAwXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIGMgdGhlbiBjKytcbiAgICAgICAgICAgICAgICBsID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzYyA9IGNcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIHNlcGVyYXRlIGJ5IHB1bmN0dWF0aW9uXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmUgPSAvXFxXKy9naVxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSByZS5leGVjIHNcbiAgICAgICAgICAgICAgICAgICAgaWYgbS5pbmRleCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdsID0gbS5pbmRleC0oYy1zYylcbiAgICAgICAgICAgICAgICAgICAgICAgIHcgPSBzW2Mtc2MuLi5tLmluZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZWluZm8uY2h1bmtzLnB1c2ggc3RyaW5nOncsIGNvbHVtbjpjLCBsZW5ndGg6d2wsIHZhbHVlOndvcmQgdyBcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gd2xcbiAgICAgICAgICAgICAgICAgICAgcGwgPSBtWzBdLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBsaW5laW5mby5jaHVua3MucHVzaCBzdHJpbmc6bVswXSwgY29sdW1uOmMsIGxlbmd0aDpwbCwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgbXRjaCA9IFN5bnRheC50dXJkW2xpbmVpbmZvLmV4dF0/W21bMF1dXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ21hdGNoIScsIG1bMF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG1hdGNoVmFsdWUgPSBTeW50YXguZG9NYXRjaCBvYmosIG10Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ21hdGNoZ1ZhbHVlJywgbWF0Y2hWYWx1ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgYyArPSBwbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXIgXG4gICAgICAgICAgICAgICAgICAgIGxpbmVpbmZvLmNodW5rcy5wdXNoIHN0cmluZzp3LCBjb2x1bW46YywgbGVuZ3RoOnJsLCB2YWx1ZTp3b3JkIHdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbGluZWluZm8uY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmVpbmZvLmNodW5rc1stMV1cbiAgICAgICAgICAgIGxpbmVpbmZvLmNoYXJzID0gbGFzdC5jb2x1bW4gKyBsYXN0Lmxlbmd0aFxuICAgICAgICBsaW5laW5mb1xuXG7ilrhwcm9maWxlICdibG9ja3MnXG5cbiAgICBzcGFjZWQgPSBibG9ja3MgbGluZXNcbiAgICAgICAgXG7ilrhwcm9maWxlICdzeW50YXgxJ1xuXG4gICAgcmFuZ2VzID0gbGluZXMubWFwIChsKSAtPiBTeW50YXgucmFuZ2VzIGwsICdrb2ZmZWUnXG5cbiMg4pa4ZGJnIHNwYWNlZFsuLi5dXG4jIOKWuGRiZyByYW5nZXNbLi4uXVxu4pa4ZGJnIFN5bnRheC50dXJkLmtvZmZlZVxuIyDilrhkYmcgU3ludGF4Lm10Y2hbJ2NvZmZlZSddXG4jIOKWuGRiZyBTeW50YXguZmlsbC5rb2ZmZWVcbiMg4pa4ZGJnIFN5bnRheC53b3JkLmtvZmZlZVxuIyDilrhkYmcgU3ludGF4Lmxhbmcua29mZmVlXG4jIOKWuGRiZyBTeW50YXguaW5mby5rb2ZmZWVcblxu4pa4dGVzdCAnbWluaW1hbCdcbiAgICAgICAgICAgICAgICBcbiAgICBibG9ja3MoWycxJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge2NvbHVtbjowLCBsZW5ndGg6MSwgc3RyaW5nOicxJywgdmFsdWU6J3RleHQnfSBdXVxuICAgIGJsb2NrcyhbJ2EnXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7Y29sdW1uOjAsIGxlbmd0aDoxLCBzdHJpbmc6J2EnLCB2YWx1ZTondGV4dCd9IF1dXG4gICAgYmxvY2tzKFsnLiddKS5zaG91bGQuZXFsIFtleHQ6J2tvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtjb2x1bW46MCwgbGVuZ3RoOjEsIHN0cmluZzonLicsIHZhbHVlOidwdW5jdCd9IF1dXG5cbiAgICBibG9ja3MoWycxLmEnXSkuc2hvdWxkLmVxbCBbZXh0Oidrb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjowICBsZW5ndGg6MSBzdHJpbmc6JzEnICAgICB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjEgIGxlbmd0aDoxIHN0cmluZzonLicgICAgIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjIgIGxlbmd0aDoxIHN0cmluZzonYScgICAgIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgIF1dXG4gICAgYmxvY2tzKFsnKythJ10pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MCAgbGVuZ3RoOjIgc3RyaW5nOicrKycgICAgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MiAgbGVuZ3RoOjEgc3RyaW5nOidhJyAgICAgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAgXV1cbiAgICBibG9ja3MoW1wi4pa4ZG9jICdoZWxsbydcIl0pLnNob3VsZC5lcWwgW2V4dDona29mZmVlJyBjaGFyczoxMiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjAgIGxlbmd0aDoxIHN0cmluZzon4pa4JyAgICAgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgIHtjb2x1bW46MSAgbGVuZ3RoOjMgc3RyaW5nOidkb2MnICAgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjo1ICBsZW5ndGg6MSBzdHJpbmc6XCInXCIgICAgIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICB7Y29sdW1uOjYgIGxlbmd0aDo1IHN0cmluZzpcImhlbGxvXCIgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAge2NvbHVtbjoxMSBsZW5ndGg6MSBzdHJpbmc6XCInXCIgICAgIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICBdXVxuICAgIFxuIl19
//# sourceURL=../coffee/blocks.coffee