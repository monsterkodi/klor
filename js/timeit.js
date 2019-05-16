// koffee 0.42.0
var klog, kstr, lineno, lines, noon, ranges, ref, slash, spaced, syntax, text, word;

ref = require('kxk'), slash = ref.slash, kstr = ref.kstr, klog = ref.klog, noon = ref.noon;

if (koffee_4_0 = process.hrtime()) {
    syntax = require('./syntax');
    if (koffee_6_4 = process.hrtime()) {
        syntax.init();
        console.log('init', require('pretty-time')(process.hrtime(koffee_6_4)));
    };
    console.log('-----', require('pretty-time')(process.hrtime(koffee_4_0)));
};

if (koffee_9_0 = process.hrtime()) {
    if (koffee_11_4 = process.hrtime()) {
        text = slash.readText(__dirname + "/test.coffee");
        console.log('read', require('pretty-time')(process.hrtime(koffee_11_4)));
    };
    if (koffee_16_4 = process.hrtime()) {
        lines = text.split('\n');
        console.log('split', require('pretty-time')(process.hrtime(koffee_16_4)));
    };
    console.log('load', require('pretty-time')(process.hrtime(koffee_9_0)));
};

if (koffee_20_0 = process.hrtime()) {
    word = function(w) {
        var ref1;
        return (ref1 = syntax.lang.koffee[w]) != null ? ref1 : 'text';
    };
    lineno = 0;
    spaced = lines.map(function(l) {
        var c, chunks, i, last, len, lineinfo, m, pl, re, rl, s, sc, w, wl;
        lineinfo = [];
        lineinfo.c = 0;
        lineinfo.i = lineno++;
        lineinfo.n = lineno;
        chunks = l.split(/\s/);
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
                        lineinfo.push({
                            s: w,
                            c: c,
                            l: wl,
                            v: word(w)
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
                    rl = sc + l - c;
                    w = s.slice(l - rl);
                    lineinfo.push({
                        s: w,
                        c: c,
                        l: rl,
                        v: word(w)
                    });
                    c += rl;
                }
            }
        }
        if (lineinfo.length) {
            last = lineinfo.slice(-1)[0];
            lineinfo.c = last.c + last.l;
        }
        return lineinfo;
    });
    console.log('spaced', require('pretty-time')(process.hrtime(koffee_20_0)));
};

if (koffee_70_0 = process.hrtime()) {
    ranges = lines.map(function(l) {
        return syntax.ranges(l, 'coffee');
    });
    console.log('syntax1', require('pretty-time')(process.hrtime(koffee_70_0)));
};

console.log('[33m[93mtimeit[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m74[39m', spaced.slice(0));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWl0LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUE4QixPQUFBLENBQVEsS0FBUixDQUE5QixFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlLGVBQWYsRUFBcUI7O0FBQXNCLElBQUEsNkJBQUE7SUFHdkMsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSO0lBQWtCLElBQUEsNkJBQUE7UUFFdkIsTUFBTSxDQUFDLElBQVAsQ0FBQSxFQUZ1QjtnRkFBQTtNQUhZOzZFQUFBOzs7QUFPM0MsSUFBQSw2QkFBQTtJQUVHLElBQUEsOEJBQUE7UUFHSyxJQUFBLEdBQU8sS0FBSyxDQUFDLFFBQU4sQ0FBa0IsU0FBRCxHQUFXLGNBQTVCLEVBSFo7aUZBQUE7O0lBS0MsSUFBQSw4QkFBQTtRQUNJLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsRUFEWjtrRkFBQTtNQVBKOzRFQUFBOzs7QUFXQSxJQUFBLDhCQUFBO0lBRUksSUFBQSxHQUFPLFNBQUMsQ0FBRDtBQUFPLFlBQUE7K0RBQXdCO0lBQS9CO0lBRVAsTUFBQSxHQUFTO0lBQ1QsTUFBQSxHQUFTLEtBQUssQ0FBQyxHQUFOLENBQVUsU0FBQyxDQUFEO0FBRWYsWUFBQTtRQUFBLFFBQUEsR0FBVztRQUNYLFFBQVEsQ0FBQyxDQUFULEdBQWE7UUFDYixRQUFRLENBQUMsQ0FBVCxHQUFhLE1BQUE7UUFDYixRQUFRLENBQUMsQ0FBVCxHQUFhO1FBRWIsTUFBQSxHQUFTLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBUjtRQUVULElBQUcsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBakIsSUFBdUIsTUFBTyxDQUFBLENBQUEsQ0FBUCxLQUFhLEVBQXZDO0FBQ0ksbUJBQU8sU0FEWDs7UUFHQSxDQUFBLEdBQUk7QUFDSixhQUFBLHdDQUFBOztZQUNJLElBQUcsQ0FBQSxLQUFLLEVBQVI7Z0JBQ0ksQ0FBQSxHQURKO2FBQUEsTUFBQTtnQkFHSSxJQUFHLENBQUg7b0JBQVUsQ0FBQSxHQUFWOztnQkFDQSxDQUFBLEdBQUksQ0FBQyxDQUFDO2dCQUNOLEVBQUEsR0FBSztnQkFJTCxFQUFBLEdBQUs7QUFDTCx1QkFBTSxDQUFBLEdBQUksRUFBRSxDQUFDLElBQUgsQ0FBUSxDQUFSLENBQVY7b0JBQ0ksSUFBRyxDQUFDLENBQUMsS0FBRixHQUFVLENBQWI7d0JBQ0ksRUFBQSxHQUFLLENBQUMsQ0FBQyxLQUFGLEdBQVEsQ0FBQyxDQUFBLEdBQUUsRUFBSDt3QkFDYixDQUFBLEdBQUksQ0FBRTt3QkFDTixRQUFRLENBQUMsSUFBVCxDQUFjOzRCQUFBLENBQUEsRUFBRSxDQUFGOzRCQUFLLENBQUEsRUFBRSxDQUFQOzRCQUFVLENBQUEsRUFBRSxFQUFaOzRCQUFnQixDQUFBLEVBQUUsSUFBQSxDQUFLLENBQUwsQ0FBbEI7eUJBQWQ7d0JBQ0EsQ0FBQSxJQUFLLEdBSlQ7O29CQUtBLEVBQUEsR0FBSyxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUM7b0JBQ1YsUUFBUSxDQUFDLElBQVQsQ0FBYzt3QkFBQSxDQUFBLEVBQUUsQ0FBRSxDQUFBLENBQUEsQ0FBSjt3QkFBUSxDQUFBLEVBQUUsQ0FBVjt3QkFBYSxDQUFBLEVBQUUsRUFBZjt3QkFBbUIsQ0FBQSxFQUFFLE9BQXJCO3FCQUFkO29CQUNBLENBQUEsSUFBSztnQkFSVDtnQkFVQSxJQUFHLENBQUEsR0FBSSxFQUFBLEdBQUcsQ0FBVjtvQkFDSSxFQUFBLEdBQUssRUFBQSxHQUFHLENBQUgsR0FBSztvQkFDVixDQUFBLEdBQUksQ0FBRTtvQkFDTixRQUFRLENBQUMsSUFBVCxDQUFjO3dCQUFBLENBQUEsRUFBRSxDQUFGO3dCQUFLLENBQUEsRUFBRSxDQUFQO3dCQUFVLENBQUEsRUFBRSxFQUFaO3dCQUFnQixDQUFBLEVBQUUsSUFBQSxDQUFLLENBQUwsQ0FBbEI7cUJBQWQ7b0JBQ0EsQ0FBQSxJQUFLLEdBSlQ7aUJBcEJKOztBQURKO1FBMkJBLElBQUcsUUFBUSxDQUFDLE1BQVo7WUFDSSxJQUFBLEdBQU8sUUFBUyxVQUFFLENBQUEsQ0FBQTtZQUNsQixRQUFRLENBQUMsQ0FBVCxHQUFhLElBQUksQ0FBQyxDQUFMLEdBQVMsSUFBSSxDQUFDLEVBRi9COztlQUdBO0lBM0NlLENBQVYsRUFMYjsrRUFBQTs7O0FBa0RBLElBQUEsOEJBQUE7SUFFSSxNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLENBQUQ7ZUFBTyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQWQsRUFBaUIsUUFBakI7SUFBUCxDQUFWLEVBRmI7Z0ZBQUE7OztBQUlBLG1HQUFLLE1BQU8sU0FBWiIsInNvdXJjZXNDb250ZW50IjpbIlxueyBzbGFzaCwga3N0ciwga2xvZywgbm9vbiB9ID0gcmVxdWlyZSAna3hrJ1xuXG7ilrhwcm9maWxlICctLS0tLScgXG4gICAgc3ludGF4ID0gcmVxdWlyZSAnLi9zeW50YXgnXG4gICAg4pa4cHJvZmlsZSAnaW5pdCcgXG4gICAgICAgIHN5bnRheC5pbml0KClcblxu4pa4cHJvZmlsZSAnbG9hZCdcbiAgICBcbiAgICDilrhwcm9maWxlICdyZWFkJyBcbiAgICAgICAgIyB0ZXh0ID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL2NvZmZlZS9ub2Rlcy5jb2ZmZWVcIlxuICAgICAgICAjIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvdGVzdC5rb2ZmZWVcIlxuICAgICAgICB0ZXh0ID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vdGVzdC5jb2ZmZWVcIlxuICAgIFxuICAgIOKWuHByb2ZpbGUgJ3NwbGl0J1xuICAgICAgICBsaW5lcyA9IHRleHQuc3BsaXQgJ1xcbidcbiAgICBcblxu4pa4cHJvZmlsZSAnc3BhY2VkJ1xuICAgIFxuICAgIHdvcmQgPSAodykgLT4gc3ludGF4Lmxhbmcua29mZmVlW3ddID8gJ3RleHQnXG5cbiAgICBsaW5lbm8gPSAwXG4gICAgc3BhY2VkID0gbGluZXMubWFwIChsKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGxpbmVpbmZvID0gW11cbiAgICAgICAgbGluZWluZm8uYyA9IDBcbiAgICAgICAgbGluZWluZm8uaSA9IGxpbmVubysrXG4gICAgICAgIGxpbmVpbmZvLm4gPSBsaW5lbm9cbiAgICAgICAgXG4gICAgICAgIGNodW5rcyA9IGwuc3BsaXQgL1xccy9cbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICByZXR1cm4gbGluZWluZm8gIyBlbXB0eSBsaW5lXG4gICAgICAgICAgICBcbiAgICAgICAgYyA9IDBcbiAgICAgICAgZm9yIHMgaW4gY2h1bmtzXG4gICAgICAgICAgICBpZiBzID09ICcnXG4gICAgICAgICAgICAgICAgYysrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgYyB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZSA9IC9cXFcrL2dpXG4gICAgICAgICAgICAgICAgd2hpbGUgbSA9IHJlLmV4ZWMgc1xuICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgd2wgPSBtLmluZGV4LShjLXNjKVxuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHNbYy1zYy4uLm0uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5laW5mby5wdXNoIHM6dywgYzpjLCBsOndsLCB2OndvcmQgdyBcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gd2xcbiAgICAgICAgICAgICAgICAgICAgcGwgPSBtWzBdLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBsaW5laW5mby5wdXNoIHM6bVswXSwgYzpjLCBsOnBsLCB2OidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBwbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYytsICAgICAgICAjIGNoZWNrIGZvciByZW1haW5pbmcgbm9uLXB1bmN0XG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jICAgICMgbGVuZ3RoIG9mIHJlbWFpbmRlclxuICAgICAgICAgICAgICAgICAgICB3ID0gc1tsLXJsLi5dICAjIHRleHQgICBvZiByZW1haW5kZXIgXG4gICAgICAgICAgICAgICAgICAgIGxpbmVpbmZvLnB1c2ggczp3LCBjOmMsIGw6cmwsIHY6d29yZCB3XG4gICAgICAgICAgICAgICAgICAgIGMgKz0gcmxcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGxpbmVpbmZvLmxlbmd0aFxuICAgICAgICAgICAgbGFzdCA9IGxpbmVpbmZvWy0xXVxuICAgICAgICAgICAgbGluZWluZm8uYyA9IGxhc3QuYyArIGxhc3QubCBcbiAgICAgICAgbGluZWluZm9cblxu4pa4cHJvZmlsZSAnc3ludGF4MSdcblxuICAgIHJhbmdlcyA9IGxpbmVzLm1hcCAobCkgLT4gc3ludGF4LnJhbmdlcyBsLCAnY29mZmVlJ1xuXG7ilrhkYmcgc3BhY2VkWy4uLl1cbiMg4pa4ZGJnIHJhbmdlc1suLi5dXG4iXX0=
//# sourceURL=../coffee/timeit.coffee