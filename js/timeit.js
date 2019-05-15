// koffee 0.42.0
var kstr, lineno, lines, noon, ranges, ref, slash, spaced, syntax, text, word;

ref = require('kxk'), slash = ref.slash, kstr = ref.kstr, noon = ref.noon;

if (koffee_4_0 = process.hrtime()) {
    syntax = require('./syntax');
    console.log('-----', require('pretty-time')(process.hrtime(koffee_4_0)));
};

if (koffee_7_0 = process.hrtime()) {
    if (koffee_9_4 = process.hrtime()) {
        text = slash.readText(__dirname + "/../../koffee/test.koffee");
        console.log('read', require('pretty-time')(process.hrtime(koffee_9_4)));
    };
    if (koffee_13_4 = process.hrtime()) {
        lines = text.split('\n');
        console.log('split', require('pretty-time')(process.hrtime(koffee_13_4)));
    };
    console.log('load', require('pretty-time')(process.hrtime(koffee_7_0)));
};

if (koffee_16_0 = process.hrtime()) {
    word = function(w) {
        var ref1;
        return (ref1 = syntax.lang.koffee[w]) != null ? ref1 : 'text';
    };
    lineno = 0;
    spaced = lines.map(function(l) {
        var c, chunks, i, last, len, lineinfo, m, p, pl, re, rl, s, sc, w, wl;
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
                        w = s.slice(c, m.index);
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
    console.log('spaced', require('pretty-time')(process.hrtime(koffee_16_0)));
};

if (koffee_66_0 = process.hrtime()) {
    ranges = lines.map(function(l) {
        return syntax.ranges(l, 'coffee');
    });
    console.log('syntax1', require('pretty-time')(process.hrtime(koffee_66_0)));
};

console.log(kstr(spaced));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWl0LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlOztBQUFzQixJQUFBLDZCQUFBO0lBR2pDLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixFQUh3Qjs2RUFBQTs7O0FBS3JDLElBQUEsNkJBQUE7SUFFRyxJQUFBLDZCQUFBO1FBRUssSUFBQSxHQUFPLEtBQUssQ0FBQyxRQUFOLENBQWtCLFNBQUQsR0FBVywyQkFBNUIsRUFGWjtnRkFBQTs7SUFJQyxJQUFBLDhCQUFBO1FBQ0ksS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxFQURaO2tGQUFBO01BTko7NEVBQUE7OztBQVNBLElBQUEsOEJBQUE7SUFFSSxJQUFBLEdBQU8sU0FBQyxDQUFEO0FBQU8sWUFBQTsrREFBd0I7SUFBL0I7SUFFUCxNQUFBLEdBQVM7SUFDVCxNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLENBQUQ7QUFDZixZQUFBO1FBQUEsUUFBQSxHQUFXO1FBQ1gsUUFBUSxDQUFDLENBQVQsR0FBYTtRQUNiLFFBQVEsQ0FBQyxDQUFULEdBQWEsTUFBQTtRQUNiLFFBQVEsQ0FBQyxDQUFULEdBQWE7UUFDYixNQUFBLEdBQVMsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFSO1FBRVQsSUFBRyxNQUFNLENBQUMsTUFBUCxLQUFpQixDQUFqQixJQUF1QixNQUFPLENBQUEsQ0FBQSxDQUFQLEtBQWEsRUFBdkM7QUFDSSxtQkFBTyxTQURYOztRQUVBLENBQUEsR0FBSTtRQUNKLENBQUEsR0FBSTtBQUNKLGFBQUEsd0NBQUE7O1lBQ0ksSUFBRyxDQUFBLEtBQUssRUFBUjtnQkFDSSxDQUFBO2dCQUNBLENBQUEsR0FBSSxLQUZSO2FBQUEsTUFBQTtnQkFJSSxJQUFHLENBQUEsS0FBSyxLQUFSO29CQUFtQixDQUFBLEdBQW5COztnQkFDQSxDQUFBLEdBQUk7Z0JBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQztnQkFDTixFQUFBLEdBQUs7Z0JBR0wsRUFBQSxHQUFLO0FBQ0wsdUJBQU0sQ0FBQSxHQUFJLEVBQUUsQ0FBQyxJQUFILENBQVEsQ0FBUixDQUFWO29CQUVJLElBQUcsQ0FBQyxDQUFDLEtBQUYsR0FBVSxDQUFiO3dCQUNJLEVBQUEsR0FBSyxDQUFDLENBQUMsS0FBRixHQUFVO3dCQUNmLENBQUEsR0FBSSxDQUFFO3dCQUNOLFFBQVEsQ0FBQyxJQUFULENBQWM7NEJBQUEsQ0FBQSxFQUFFLENBQUY7NEJBQUssQ0FBQSxFQUFFLENBQVA7NEJBQVUsQ0FBQSxFQUFFLEVBQVo7NEJBQWdCLENBQUEsRUFBRSxJQUFBLENBQUssQ0FBTCxDQUFsQjt5QkFBZDt3QkFDQSxDQUFBLElBQUssR0FKVDs7b0JBS0EsRUFBQSxHQUFLLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQztvQkFDVixRQUFRLENBQUMsSUFBVCxDQUFjO3dCQUFBLENBQUEsRUFBRSxDQUFFLENBQUEsQ0FBQSxDQUFKO3dCQUFRLENBQUEsRUFBRSxDQUFWO3dCQUFhLENBQUEsRUFBRSxFQUFmO3dCQUFtQixDQUFBLEVBQUUsT0FBckI7cUJBQWQ7b0JBQ0EsQ0FBQSxJQUFLO2dCQVRUO2dCQVdBLElBQUcsQ0FBQSxHQUFJLEVBQUEsR0FBSyxDQUFaO29CQUNJLEVBQUEsR0FBSyxFQUFBLEdBQUcsQ0FBSCxHQUFLO29CQUNWLENBQUEsR0FBSSxDQUFFO29CQUNOLFFBQVEsQ0FBQyxJQUFULENBQWM7d0JBQUEsQ0FBQSxFQUFFLENBQUY7d0JBQUssQ0FBQSxFQUFFLENBQVA7d0JBQVUsQ0FBQSxFQUFFLEVBQVo7d0JBQWdCLENBQUEsRUFBRSxJQUFBLENBQUssQ0FBTCxDQUFsQjtxQkFBZDtvQkFDQSxDQUFBLElBQUssR0FKVDtpQkF0Qko7O0FBREo7UUE2QkEsSUFBRyxRQUFRLENBQUMsTUFBWjtZQUNJLElBQUEsR0FBTyxRQUFTLFVBQUUsQ0FBQSxDQUFBO1lBQ2xCLFFBQVEsQ0FBQyxDQUFULEdBQWEsSUFBSSxDQUFDLENBQUwsR0FBUyxJQUFJLENBQUMsRUFGL0I7O2VBR0E7SUEzQ2UsQ0FBVixFQUxiOytFQUFBOzs7QUFrREEsSUFBQSw4QkFBQTtJQUVJLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsQ0FBRDtlQUFPLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBZCxFQUFpQixRQUFqQjtJQUFQLENBQVYsRUFGYjtnRkFBQTs7O0FBV0EsT0FBQSxDQUFBLEdBQUEsQ0FBSSxJQUFBLENBQUssTUFBTCxDQUFKIiwic291cmNlc0NvbnRlbnQiOlsiXG57IHNsYXNoLCBrc3RyLCBub29uIH0gPSByZXF1aXJlICdreGsnXG5cbuKWuHByb2ZpbGUgJy0tLS0tJyBcbiAgICBzeW50YXggPSByZXF1aXJlICcuL3N5bnRheCdcblxu4pa4cHJvZmlsZSAnbG9hZCdcbiAgICBcbiAgICDilrhwcm9maWxlICdyZWFkJyBcbiAgICAgICAgIyB0ZXh0ID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL2NvZmZlZS9ub2Rlcy5jb2ZmZWVcIlxuICAgICAgICB0ZXh0ID0gc2xhc2gucmVhZFRleHQgXCIje19fZGlybmFtZX0vLi4vLi4va29mZmVlL3Rlc3Qua29mZmVlXCJcbiAgICBcbiAgICDilrhwcm9maWxlICdzcGxpdCdcbiAgICAgICAgbGluZXMgPSB0ZXh0LnNwbGl0ICdcXG4nXG4gICAgXG7ilrhwcm9maWxlICdzcGFjZWQnXG4gICAgXG4gICAgd29yZCA9ICh3KSAtPiBzeW50YXgubGFuZy5rb2ZmZWVbd10gPyAndGV4dCdcblxuICAgIGxpbmVubyA9IDBcbiAgICBzcGFjZWQgPSBsaW5lcy5tYXAgKGwpIC0+IFxuICAgICAgICBsaW5laW5mbyA9IFtdXG4gICAgICAgIGxpbmVpbmZvLmMgPSAwXG4gICAgICAgIGxpbmVpbmZvLmkgPSBsaW5lbm8rK1xuICAgICAgICBsaW5laW5mby5uID0gbGluZW5vXG4gICAgICAgIGNodW5rcyA9IGwuc3BsaXQgL1xccy9cbiAgICAgICAgIyDilrhkYmcgY2h1bmtzXG4gICAgICAgIGlmIGNodW5rcy5sZW5ndGggPT0gMSBhbmQgY2h1bmtzWzBdID09ICcnXG4gICAgICAgICAgICByZXR1cm4gbGluZWluZm8gIyBlbXB0eSBsaW5lXG4gICAgICAgIGMgPSAwXG4gICAgICAgIHAgPSB0cnVlXG4gICAgICAgIGZvciBzIGluIGNodW5rc1xuICAgICAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgICAgIGMrK1xuICAgICAgICAgICAgICAgIHAgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgcCA9PSBmYWxzZSB0aGVuIGMrK1xuICAgICAgICAgICAgICAgIHAgPSBmYWxzZVxuICAgICAgICAgICAgICAgIGwgPSBzLmxlbmd0aFxuICAgICAgICAgICAgICAgIHNjID0gY1xuICAgICAgICAgICAgICAgICMgc2VwZXJhdGUgYnkgcHVuY3R1YXRpb25cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZSA9IC9cXFcrL2dpXG4gICAgICAgICAgICAgICAgd2hpbGUgbSA9IHJlLmV4ZWMgc1xuICAgICAgICAgICAgICAgICAgICAjIGxvZyBtI1swXVxuICAgICAgICAgICAgICAgICAgICBpZiBtLmluZGV4ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgd2wgPSBtLmluZGV4IC0gY1xuICAgICAgICAgICAgICAgICAgICAgICAgdyA9IHNbYy4uLm0uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5laW5mby5wdXNoIHM6dywgYzpjLCBsOndsLCB2OndvcmQgdyBcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gd2xcbiAgICAgICAgICAgICAgICAgICAgcGwgPSBtWzBdLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBsaW5laW5mby5wdXNoIHM6bVswXSwgYzpjLCBsOnBsLCB2OidwdW5jdCdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBwbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGMgPCBzYyArIGxcbiAgICAgICAgICAgICAgICAgICAgcmwgPSBzYytsLWNcbiAgICAgICAgICAgICAgICAgICAgdyA9IHNbbC1ybC4uXVxuICAgICAgICAgICAgICAgICAgICBsaW5laW5mby5wdXNoIHM6dywgYzpjLCBsOnJsLCB2OndvcmQgd1xuICAgICAgICAgICAgICAgICAgICBjICs9IHJsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBsaW5laW5mby5sZW5ndGhcbiAgICAgICAgICAgIGxhc3QgPSBsaW5laW5mb1stMV1cbiAgICAgICAgICAgIGxpbmVpbmZvLmMgPSBsYXN0LmMgKyBsYXN0LmwgXG4gICAgICAgIGxpbmVpbmZvXG5cbuKWuHByb2ZpbGUgJ3N5bnRheDEnXG5cbiAgICByYW5nZXMgPSBsaW5lcy5tYXAgKGwpIC0+IHN5bnRheC5yYW5nZXMgbCwgJ2NvZmZlZSdcblxuIyDilrhwcm9maWxlICdzeW50YXgyJ1xuXG4gICAgIyByYW5nZXMyID0gc3ludGF4LnJhbmdlcyB0ZXh0LCAnY29mZmVlJ1xuICAgIFxuIyBsb2cgbGluZXMyWzAuLjEwXSwgbGluZXNbMC4uMTBdXG4jIGxvZyBsaW5lczJbLTEwLi5dLCBsaW5lc1stMTAuLl1cbiAgXG5sb2cga3N0ciBzcGFjZWRcbiMg4pa4ZGJnIHtsaW5lcywgc3BhY2VkfVxuIyDilrhkYmcgc3BhY2VkWy4uMl1cbiMg4pa4ZGJnIHNwYWNlZFsuLjJdXG4jIOKWuGRiZyByYW5nZXNbLi4yMF1cblxuIyDilrhkYmcgcmFuZ2VzMVxuIyDilrhkYmcgcmFuZ2VzMlxuIyDilrhkYmcgc3ludGF4Lmxhbmcua29mZmVlXG4iXX0=
//# sourceURL=../coffee/timeit.coffee