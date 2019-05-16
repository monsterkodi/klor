// koffee 0.42.0
var kstr, lineno, lines, noon, ranges, ref, slash, spaced, syntax, text, word;

ref = require('kxk'), slash = ref.slash, kstr = ref.kstr, noon = ref.noon;

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
        text = slash.readText(__dirname + "/../../koffee/test.koffee");
        console.log('read', require('pretty-time')(process.hrtime(koffee_11_4)));
    };
    if (koffee_15_4 = process.hrtime()) {
        lines = text.split('\n');
        console.log('split', require('pretty-time')(process.hrtime(koffee_15_4)));
    };
    console.log('load', require('pretty-time')(process.hrtime(koffee_9_0)));
};

if (koffee_19_0 = process.hrtime()) {
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
    console.log('spaced', require('pretty-time')(process.hrtime(koffee_19_0)));
};

if (koffee_69_0 = process.hrtime()) {
    ranges = lines.map(function(l) {
        return syntax.ranges(l, 'coffee');
    });
    console.log('syntax1', require('pretty-time')(process.hrtime(koffee_69_0)));
};

console.log(kstr(spaced));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWl0LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsSUFBQTs7QUFBQSxNQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixFQUFFLGlCQUFGLEVBQVMsZUFBVCxFQUFlOztBQUFzQixJQUFBLDZCQUFBO0lBR2pDLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUjtJQUFrQixJQUFBLDZCQUFBO1FBRXZCLE1BQU0sQ0FBQyxJQUFQLENBQUEsRUFGdUI7Z0ZBQUE7TUFITTs2RUFBQTs7O0FBT3JDLElBQUEsNkJBQUE7SUFFRyxJQUFBLDhCQUFBO1FBRUssSUFBQSxHQUFPLEtBQUssQ0FBQyxRQUFOLENBQWtCLFNBQUQsR0FBVywyQkFBNUIsRUFGWjtpRkFBQTs7SUFJQyxJQUFBLDhCQUFBO1FBQ0ksS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxFQURaO2tGQUFBO01BTko7NEVBQUE7OztBQVVBLElBQUEsOEJBQUE7SUFFSSxJQUFBLEdBQU8sU0FBQyxDQUFEO0FBQU8sWUFBQTsrREFBd0I7SUFBL0I7SUFFUCxNQUFBLEdBQVM7SUFDVCxNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFDLENBQUQ7QUFDZixZQUFBO1FBQUEsUUFBQSxHQUFXO1FBQ1gsUUFBUSxDQUFDLENBQVQsR0FBYTtRQUNiLFFBQVEsQ0FBQyxDQUFULEdBQWEsTUFBQTtRQUNiLFFBQVEsQ0FBQyxDQUFULEdBQWE7UUFDYixNQUFBLEdBQVMsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFSO1FBRVQsSUFBRyxNQUFNLENBQUMsTUFBUCxLQUFpQixDQUFqQixJQUF1QixNQUFPLENBQUEsQ0FBQSxDQUFQLEtBQWEsRUFBdkM7QUFDSSxtQkFBTyxTQURYOztRQUVBLENBQUEsR0FBSTtRQUNKLENBQUEsR0FBSTtBQUNKLGFBQUEsd0NBQUE7O1lBQ0ksSUFBRyxDQUFBLEtBQUssRUFBUjtnQkFDSSxDQUFBO2dCQUNBLENBQUEsR0FBSSxLQUZSO2FBQUEsTUFBQTtnQkFJSSxJQUFHLENBQUEsS0FBSyxLQUFSO29CQUFtQixDQUFBLEdBQW5COztnQkFDQSxDQUFBLEdBQUk7Z0JBQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQztnQkFDTixFQUFBLEdBQUs7Z0JBR0wsRUFBQSxHQUFLO0FBQ0wsdUJBQU0sQ0FBQSxHQUFJLEVBQUUsQ0FBQyxJQUFILENBQVEsQ0FBUixDQUFWO29CQUVJLElBQUcsQ0FBQyxDQUFDLEtBQUYsR0FBVSxDQUFiO3dCQUNJLEVBQUEsR0FBSyxDQUFDLENBQUMsS0FBRixHQUFVO3dCQUNmLENBQUEsR0FBSSxDQUFFO3dCQUNOLFFBQVEsQ0FBQyxJQUFULENBQWM7NEJBQUEsQ0FBQSxFQUFFLENBQUY7NEJBQUssQ0FBQSxFQUFFLENBQVA7NEJBQVUsQ0FBQSxFQUFFLEVBQVo7NEJBQWdCLENBQUEsRUFBRSxJQUFBLENBQUssQ0FBTCxDQUFsQjt5QkFBZDt3QkFDQSxDQUFBLElBQUssR0FKVDs7b0JBS0EsRUFBQSxHQUFLLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQztvQkFDVixRQUFRLENBQUMsSUFBVCxDQUFjO3dCQUFBLENBQUEsRUFBRSxDQUFFLENBQUEsQ0FBQSxDQUFKO3dCQUFRLENBQUEsRUFBRSxDQUFWO3dCQUFhLENBQUEsRUFBRSxFQUFmO3dCQUFtQixDQUFBLEVBQUUsT0FBckI7cUJBQWQ7b0JBQ0EsQ0FBQSxJQUFLO2dCQVRUO2dCQVdBLElBQUcsQ0FBQSxHQUFJLEVBQUEsR0FBSyxDQUFaO29CQUNJLEVBQUEsR0FBSyxFQUFBLEdBQUcsQ0FBSCxHQUFLO29CQUNWLENBQUEsR0FBSSxDQUFFO29CQUNOLFFBQVEsQ0FBQyxJQUFULENBQWM7d0JBQUEsQ0FBQSxFQUFFLENBQUY7d0JBQUssQ0FBQSxFQUFFLENBQVA7d0JBQVUsQ0FBQSxFQUFFLEVBQVo7d0JBQWdCLENBQUEsRUFBRSxJQUFBLENBQUssQ0FBTCxDQUFsQjtxQkFBZDtvQkFDQSxDQUFBLElBQUssR0FKVDtpQkF0Qko7O0FBREo7UUE2QkEsSUFBRyxRQUFRLENBQUMsTUFBWjtZQUNJLElBQUEsR0FBTyxRQUFTLFVBQUUsQ0FBQSxDQUFBO1lBQ2xCLFFBQVEsQ0FBQyxDQUFULEdBQWEsSUFBSSxDQUFDLENBQUwsR0FBUyxJQUFJLENBQUMsRUFGL0I7O2VBR0E7SUEzQ2UsQ0FBVixFQUxiOytFQUFBOzs7QUFrREEsSUFBQSw4QkFBQTtJQUVJLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFNBQUMsQ0FBRDtlQUFPLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBZCxFQUFpQixRQUFqQjtJQUFQLENBQVYsRUFGYjtnRkFBQTs7O0FBV0EsT0FBQSxDQUFBLEdBQUEsQ0FBSSxJQUFBLENBQUssTUFBTCxDQUFKIiwic291cmNlc0NvbnRlbnQiOlsiXG57IHNsYXNoLCBrc3RyLCBub29uIH0gPSByZXF1aXJlICdreGsnXG5cbuKWuHByb2ZpbGUgJy0tLS0tJyBcbiAgICBzeW50YXggPSByZXF1aXJlICcuL3N5bnRheCdcbiAgICDilrhwcm9maWxlICdpbml0JyBcbiAgICAgICAgc3ludGF4LmluaXQoKVxuXG7ilrhwcm9maWxlICdsb2FkJ1xuICAgIFxuICAgIOKWuHByb2ZpbGUgJ3JlYWQnIFxuICAgICAgICAjIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvY29mZmVlL25vZGVzLmNvZmZlZVwiXG4gICAgICAgIHRleHQgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvdGVzdC5rb2ZmZWVcIlxuICAgIFxuICAgIOKWuHByb2ZpbGUgJ3NwbGl0J1xuICAgICAgICBsaW5lcyA9IHRleHQuc3BsaXQgJ1xcbidcbiAgICBcblxu4pa4cHJvZmlsZSAnc3BhY2VkJ1xuICAgIFxuICAgIHdvcmQgPSAodykgLT4gc3ludGF4Lmxhbmcua29mZmVlW3ddID8gJ3RleHQnXG5cbiAgICBsaW5lbm8gPSAwXG4gICAgc3BhY2VkID0gbGluZXMubWFwIChsKSAtPiBcbiAgICAgICAgbGluZWluZm8gPSBbXVxuICAgICAgICBsaW5laW5mby5jID0gMFxuICAgICAgICBsaW5laW5mby5pID0gbGluZW5vKytcbiAgICAgICAgbGluZWluZm8ubiA9IGxpbmVub1xuICAgICAgICBjaHVua3MgPSBsLnNwbGl0IC9cXHMvXG4gICAgICAgICMg4pa4ZGJnIGNodW5rc1xuICAgICAgICBpZiBjaHVua3MubGVuZ3RoID09IDEgYW5kIGNodW5rc1swXSA9PSAnJ1xuICAgICAgICAgICAgcmV0dXJuIGxpbmVpbmZvICMgZW1wdHkgbGluZVxuICAgICAgICBjID0gMFxuICAgICAgICBwID0gdHJ1ZVxuICAgICAgICBmb3IgcyBpbiBjaHVua3NcbiAgICAgICAgICAgIGlmIHMgPT0gJydcbiAgICAgICAgICAgICAgICBjKytcbiAgICAgICAgICAgICAgICBwID0gdHJ1ZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGlmIHAgPT0gZmFsc2UgdGhlbiBjKytcbiAgICAgICAgICAgICAgICBwID0gZmFsc2VcbiAgICAgICAgICAgICAgICBsID0gcy5sZW5ndGhcbiAgICAgICAgICAgICAgICBzYyA9IGNcbiAgICAgICAgICAgICAgICAjIHNlcGVyYXRlIGJ5IHB1bmN0dWF0aW9uXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmUgPSAvXFxXKy9naVxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSByZS5leGVjIHNcbiAgICAgICAgICAgICAgICAgICAgIyBsb2cgbSNbMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgbS5pbmRleCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIHdsID0gbS5pbmRleCAtIGNcbiAgICAgICAgICAgICAgICAgICAgICAgIHcgPSBzW2MuLi5tLmluZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZWluZm8ucHVzaCBzOncsIGM6YywgbDp3bCwgdjp3b3JkIHcgXG4gICAgICAgICAgICAgICAgICAgICAgICBjICs9IHdsXG4gICAgICAgICAgICAgICAgICAgIHBsID0gbVswXS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgbGluZWluZm8ucHVzaCBzOm1bMF0sIGM6YywgbDpwbCwgdjoncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIGMgKz0gcGxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjIDwgc2MgKyBsXG4gICAgICAgICAgICAgICAgICAgIHJsID0gc2MrbC1jXG4gICAgICAgICAgICAgICAgICAgIHcgPSBzW2wtcmwuLl1cbiAgICAgICAgICAgICAgICAgICAgbGluZWluZm8ucHVzaCBzOncsIGM6YywgbDpybCwgdjp3b3JkIHdcbiAgICAgICAgICAgICAgICAgICAgYyArPSBybFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgbGluZWluZm8ubGVuZ3RoXG4gICAgICAgICAgICBsYXN0ID0gbGluZWluZm9bLTFdXG4gICAgICAgICAgICBsaW5laW5mby5jID0gbGFzdC5jICsgbGFzdC5sIFxuICAgICAgICBsaW5laW5mb1xuXG7ilrhwcm9maWxlICdzeW50YXgxJ1xuXG4gICAgcmFuZ2VzID0gbGluZXMubWFwIChsKSAtPiBzeW50YXgucmFuZ2VzIGwsICdjb2ZmZWUnXG5cbiMg4pa4cHJvZmlsZSAnc3ludGF4MidcblxuICAgICMgcmFuZ2VzMiA9IHN5bnRheC5yYW5nZXMgdGV4dCwgJ2NvZmZlZSdcbiAgICBcbiMgbG9nIGxpbmVzMlswLi4xMF0sIGxpbmVzWzAuLjEwXVxuIyBsb2cgbGluZXMyWy0xMC4uXSwgbGluZXNbLTEwLi5dXG4gIFxubG9nIGtzdHIgc3BhY2VkXG4jIOKWuGRiZyB7bGluZXMsIHNwYWNlZH1cbiMg4pa4ZGJnIHNwYWNlZFsuLjJdXG4jIOKWuGRiZyBzcGFjZWRbLi4yXVxuIyDilrhkYmcgcmFuZ2VzWy4uMjBdXG5cbiMg4pa4ZGJnIHJhbmdlczFcbiMg4pa4ZGJnIHJhbmdlczJcbiJdfQ==
//# sourceURL=../coffee/timeit.coffee