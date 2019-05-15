// koffee 0.42.0
var kstr, lineno, lines, noon, ranges, ref, slash, spaced, syntax, text;

ref = require('kxk'), slash = ref.slash, kstr = ref.kstr, noon = ref.noon;

if (koffee_4_0 = process.hrtime()) {
    syntax = require('./syntax');
    console.log('-----', require('pretty-time')(process.hrtime(koffee_4_0)));
};

if (koffee_7_0 = process.hrtime()) {
    if (koffee_9_4 = process.hrtime()) {
        text = slash.readText(__dirname + "/../../koffee/coffee/nodes.coffee");
        console.log('read', require('pretty-time')(process.hrtime(koffee_9_4)));
    };
    if (koffee_13_4 = process.hrtime()) {
        lines = text.split('\n');
        console.log('split', require('pretty-time')(process.hrtime(koffee_13_4)));
    };
    if (koffee_16_4 = process.hrtime()) {
        lineno = 0;
        spaced = lines.map(function(l) {
            var c, chunks, i, last, len, lineinfo, m, p, pl, re, rl, s, sc, wl;
            lineinfo = [];
            lineinfo.c = 0;
            lineinfo.i = lineno++;
            lineinfo.n = lineno;
            chunks = l.split(/\s/);
            if (chunks.length === 1 && chunks[0] === '') {
                return lineinfo;
            }
            c = 0;
            p = true;
            for (i = 0, len = chunks.length; i < len; i++) {
                s = chunks[i];
                if (s === '') {
                    c++;
                    p = true;
                } else {
                    if (p === false) {
                        c++;
                    }
                    p = false;
                    l = s.length;
                    sc = c;
                    re = /\W+/gi;
                    while (m = re.exec(s)) {
                        if (m.index > 0) {
                            wl = m.index - c;
                            lineinfo.push({
                                s: s.slice(c, m.index),
                                c: c,
                                l: wl,
                                v: 'word'
                            });
                            c += wl;
                        }
                        pl = m[0].length;
                        lineinfo.push({
                            s: m[0],
                            c: c,
                            l: pl,
                            v: 'punct'
                        });
                        c += pl;
                    }
                    if (c < sc + l) {
                        rl = l - c;
                        lineinfo.push({
                            s: s.slice(l - rl),
                            c: c,
                            l: rl,
                            v: 'word'
                        });
                        c = rl;
                    }
                }
            }
            if (lineinfo.length) {
                last = lineinfo.slice(-1)[0];
                lineinfo.c = last.c + last.l;
            }
            return lineinfo;
        });
        console.log('spaced', require('pretty-time')(process.hrtime(koffee_16_4)));
    };
    console.log('total', require('pretty-time')(process.hrtime(koffee_7_0)));
};

if (koffee_61_0 = process.hrtime()) {
    ranges = lines.map(function(l) {
        return syntax.ranges(l, 'coffee');
    });
    console.log('syntax', require('pretty-time')(process.hrtime(koffee_61_0)));
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWl0LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlOztBQUFzQixJQUFBLDZCQUFBO0lBR2pDLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixFQUh3Qjs2RUFBQTs7O0FBS3JDLElBQUEsNkJBQUE7SUFFRyxJQUFBLDZCQUFBO1FBQ0ssSUFBQSxHQUFPLEtBQUssQ0FBQyxRQUFOLENBQWtCLFNBQUQsR0FBVyxtQ0FBNUIsRUFEWjtnRkFBQTs7SUFJQyxJQUFBLDhCQUFBO1FBQ0ksS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxFQURaO2tGQUFBOztJQUdBLElBQUEsOEJBQUE7UUFDSSxNQUFBLEdBQVM7UUFDVCxNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLENBQUQ7QUFDZixnQkFBQTtZQUFBLFFBQUEsR0FBVztZQUNYLFFBQVEsQ0FBQyxDQUFULEdBQWE7WUFDYixRQUFRLENBQUMsQ0FBVCxHQUFhLE1BQUE7WUFDYixRQUFRLENBQUMsQ0FBVCxHQUFhO1lBQ2IsTUFBQSxHQUFTLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBUjtZQUVULElBQUcsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBakIsSUFBdUIsTUFBTyxDQUFBLENBQUEsQ0FBUCxLQUFhLEVBQXZDO0FBQ0ksdUJBQU8sU0FEWDs7WUFFQSxDQUFBLEdBQUk7WUFDSixDQUFBLEdBQUk7QUFDSixpQkFBQSx3Q0FBQTs7Z0JBQ0ksSUFBRyxDQUFBLEtBQUssRUFBUjtvQkFDSSxDQUFBO29CQUNBLENBQUEsR0FBSSxLQUZSO2lCQUFBLE1BQUE7b0JBSUksSUFBRyxDQUFBLEtBQUssS0FBUjt3QkFBbUIsQ0FBQSxHQUFuQjs7b0JBQ0EsQ0FBQSxHQUFJO29CQUNKLENBQUEsR0FBSSxDQUFDLENBQUM7b0JBQ04sRUFBQSxHQUFLO29CQUdMLEVBQUEsR0FBSztBQUNMLDJCQUFNLENBQUEsR0FBSSxFQUFFLENBQUMsSUFBSCxDQUFRLENBQVIsQ0FBVjt3QkFFSSxJQUFHLENBQUMsQ0FBQyxLQUFGLEdBQVUsQ0FBYjs0QkFDSSxFQUFBLEdBQUssQ0FBQyxDQUFDLEtBQUYsR0FBVTs0QkFDZixRQUFRLENBQUMsSUFBVCxDQUFjO2dDQUFBLENBQUEsRUFBRSxDQUFFLGtCQUFKO2dDQUFrQixDQUFBLEVBQUUsQ0FBcEI7Z0NBQXVCLENBQUEsRUFBRSxFQUF6QjtnQ0FBNkIsQ0FBQSxFQUFFLE1BQS9COzZCQUFkOzRCQUNBLENBQUEsSUFBSyxHQUhUOzt3QkFJQSxFQUFBLEdBQUssQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDO3dCQUNWLFFBQVEsQ0FBQyxJQUFULENBQWM7NEJBQUEsQ0FBQSxFQUFFLENBQUUsQ0FBQSxDQUFBLENBQUo7NEJBQVEsQ0FBQSxFQUFFLENBQVY7NEJBQWEsQ0FBQSxFQUFFLEVBQWY7NEJBQW1CLENBQUEsRUFBRSxPQUFyQjt5QkFBZDt3QkFDQSxDQUFBLElBQUs7b0JBUlQ7b0JBVUEsSUFBRyxDQUFBLEdBQUksRUFBQSxHQUFLLENBQVo7d0JBQ0ksRUFBQSxHQUFLLENBQUEsR0FBRTt3QkFDUCxRQUFRLENBQUMsSUFBVCxDQUFjOzRCQUFBLENBQUEsRUFBRSxDQUFFLGNBQUo7NEJBQWEsQ0FBQSxFQUFFLENBQWY7NEJBQWtCLENBQUEsRUFBRSxFQUFwQjs0QkFBd0IsQ0FBQSxFQUFFLE1BQTFCO3lCQUFkO3dCQUNBLENBQUEsR0FBSSxHQUhSO3FCQXJCSjs7QUFESjtZQTJCQSxJQUFHLFFBQVEsQ0FBQyxNQUFaO2dCQUNJLElBQUEsR0FBTyxRQUFTLFVBQUUsQ0FBQSxDQUFBO2dCQUNsQixRQUFRLENBQUMsQ0FBVCxHQUFhLElBQUksQ0FBQyxDQUFMLEdBQVMsSUFBSSxDQUFDLEVBRi9COzttQkFHQTtRQXpDZSxDQUFWLEVBRmI7bUZBQUE7TUFUSjs2RUFBQTs7O0FBc0RBLElBQUEsOEJBQUE7SUFFSSxNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLENBQUQ7ZUFBTyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQWQsRUFBaUIsUUFBakI7SUFBUCxDQUFWLEVBRmI7K0VBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJcbnsgc2xhc2gsIGtzdHIsIG5vb24gfSA9IHJlcXVpcmUgJ2t4aydcblxu4pa4cHJvZmlsZSAnLS0tLS0nIFxuICAgIHN5bnRheCA9IHJlcXVpcmUgJy4vc3ludGF4J1xuXG7ilrhwcm9maWxlICd0b3RhbCdcbiAgICBcbiAgICDilrhwcm9maWxlICdyZWFkJyBcbiAgICAgICAgdGV4dCA9IHNsYXNoLnJlYWRUZXh0IFwiI3tfX2Rpcm5hbWV9Ly4uLy4uL2tvZmZlZS9jb2ZmZWUvbm9kZXMuY29mZmVlXCJcbiAgICAgICAgIyB0ZXh0ID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL3Rlc3Qua29mZmVlXCJcbiAgICBcbiAgICDilrhwcm9maWxlICdzcGxpdCdcbiAgICAgICAgbGluZXMgPSB0ZXh0LnNwbGl0ICdcXG4nXG4gICAgXG4gICAg4pa4cHJvZmlsZSAnc3BhY2VkJ1xuICAgICAgICBsaW5lbm8gPSAwXG4gICAgICAgIHNwYWNlZCA9IGxpbmVzLm1hcCAobCkgLT4gXG4gICAgICAgICAgICBsaW5laW5mbyA9IFtdXG4gICAgICAgICAgICBsaW5laW5mby5jID0gMFxuICAgICAgICAgICAgbGluZWluZm8uaSA9IGxpbmVubysrXG4gICAgICAgICAgICBsaW5laW5mby5uID0gbGluZW5vXG4gICAgICAgICAgICBjaHVua3MgPSBsLnNwbGl0IC9cXHMvXG4gICAgICAgICAgICAjIOKWuGRiZyBjaHVua3NcbiAgICAgICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpbmVpbmZvICMgZW1wdHkgbGluZVxuICAgICAgICAgICAgYyA9IDBcbiAgICAgICAgICAgIHAgPSB0cnVlXG4gICAgICAgICAgICBmb3IgcyBpbiBjaHVua3NcbiAgICAgICAgICAgICAgICBpZiBzID09ICcnXG4gICAgICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgICAgICAgICBwID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgcCA9PSBmYWxzZSB0aGVuIGMrK1xuICAgICAgICAgICAgICAgICAgICBwID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgbCA9IHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIHNjID0gY1xuICAgICAgICAgICAgICAgICAgICAjIHNlcGVyYXRlIGJ5IHB1bmN0dWF0aW9uXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZSA9IC9cXFcrL2dpXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIG0gPSByZS5leGVjIHNcbiAgICAgICAgICAgICAgICAgICAgICAgICMgbG9nIG0jWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdsID0gbS5pbmRleCAtIGNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5laW5mby5wdXNoIHM6c1tjLi4ubS5pbmRleF0sIGM6YywgbDp3bCwgdjond29yZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbCA9IG1bMF0ubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5laW5mby5wdXNoIHM6bVswXSwgYzpjLCBsOnBsLCB2OidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gcGxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGMgPCBzYyArIGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJsID0gbC1jXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5laW5mby5wdXNoIHM6c1tsLXJsLi5dLCBjOmMsIGw6cmwsIHY6J3dvcmQnXG4gICAgICAgICAgICAgICAgICAgICAgICBjID0gcmxcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbGluZWluZm8ubGVuZ3RoXG4gICAgICAgICAgICAgICAgbGFzdCA9IGxpbmVpbmZvWy0xXVxuICAgICAgICAgICAgICAgIGxpbmVpbmZvLmMgPSBsYXN0LmMgKyBsYXN0LmwgXG4gICAgICAgICAgICBsaW5laW5mb1xuICAgIFxu4pa4cHJvZmlsZSAnc3ludGF4J1xuXG4gICAgcmFuZ2VzID0gbGluZXMubWFwIChsKSAtPiBzeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG4gICAgICAgIFxuIyBsb2cgbGluZXMyWzAuLjEwXSwgbGluZXNbMC4uMTBdXG4jIGxvZyBsaW5lczJbLTEwLi5dLCBsaW5lc1stMTAuLl1cbiAgICBcbiMg4pa4ZGJnIHtsaW5lcywgc3BhY2VkfVxuIyDilrhkYmcgc3BhY2VkWy4uMl1cbiMg4pa4ZGJnIHNwYWNlZFxuIyDilrhkYmcgcmFuZ2VzWy4uMjBdXG5cbiMg4pa4ZGJnIHN5bnRheFxuIyDilrhkYmcgc3ludGF4Lmxhbmcua29mZmVlXG4iXX0=
//# sourceURL=../coffee/timeit.coffee