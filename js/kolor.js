// koffee 1.4.0

/*
000   000   0000000   000       0000000   00000000 
000  000   000   000  000      000   000  000   000
0000000    000   000  000      000   000  0000000  
000  000   000   000  000      000   000  000   000
000   000   0000000   0000000   0000000   000   000
 */
var B, B256, BG_COLORS, C, F, F256, FG_COLORS, G, M, R, STRIPANSI, W, Y, b, bg, bold, c, f, fg, g, i, init, j, k, l, len, len1, len2, len3, m, o, p, q, r, reset, s, t, w, wrap, y;

f = function(r, g, b) {
    return '\x1b[38;5;' + (16 + 36 * r + 6 * g + b) + 'm';
};

F = function(r, g, b) {
    return '\x1b[48;5;' + (16 + 36 * r + 6 * g + b) + 'm';
};

r = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && f(i, 0, 0) || f(5, i - 5, i - 5);
};

R = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && F(i, 0, 0) || F(5, i - 5, i - 5);
};

g = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && f(0, i, 0) || f(i - 5, 5, i - 5);
};

G = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && F(0, i, 0) || F(i - 5, 5, i - 5);
};

b = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && f(0, 0, i) || f(i - 5, i - 5, 5);
};

B = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && F(0, 0, i) || F(i - 5, i - 5, 5);
};

y = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && f(i, i, 0) || f(5, 5, i - 5);
};

Y = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && F(i, i, 0) || F(5, 5, i - 5);
};

m = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && f(i, 0, i) || f(5, i - 5, 5);
};

M = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && F(i, 0, i) || F(5, i - 5, 5);
};

c = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && f(0, i, i) || f(i - 5, 5, 5);
};

C = function(i) {
    if (i == null) {
        i = 4;
    }
    return (i < 6) && F(0, i, i) || F(i - 5, 5, 5);
};

w = function(i) {
    if (i == null) {
        i = 4;
    }
    return '\x1b[38;5;' + (232 + (i - 1) * 3) + 'm';
};

W = function(i) {
    if (i == null) {
        i = 4;
    }
    return '\x1b[48;5;' + (232 + (i - 1) * 3 + 2) + 'm';
};

FG_COLORS = ['r', 'g', 'b', 'c', 'm', 'y', 'w'];

BG_COLORS = ['R', 'M', 'B', 'Y', 'G', 'C', 'W'];

wrap = function(open, close, searchRegex, replaceValue) {
    return function(s) {
        return open + (~(s += "").indexOf(close, 4) && s.replace(searchRegex, replaceValue) || s) + close;
    };
};

init = function(open, close) {
    return wrap("\x1b[" + open + "m", "\x1b[" + close + "m", new RegExp("\\x1b\\[" + close + "m", "g"), "\x1b[" + open + "m");
};

F256 = function(open) {
    return wrap(open, "\x1b[39m", new RegExp("\\x1b\\[39m", "g"), open);
};

B256 = function(open) {
    return wrap(open, "\x1b[49m", new RegExp("\\x1b\\[49m", "g"), open);
};

exports.bold = wrap("\x1b[1m", "\x1b[22m", /\x1b\[22m/g, "\x1b[22m\x1b[1m");

exports.dim = wrap("\x1b[2m", "\x1b[22m", /\x1b\[22m/g, "\x1b[22m\x1b[2m");

exports.reset = init(0, 0);

exports.italic = init(3, 23);

exports.underline = init(4, 24);

exports.inverse = init(7, 27);

exports.hidden = init(8, 28);

exports.black = init(30, 39);

exports.red = init(31, 39);

exports.green = init(32, 39);

exports.yellow = init(33, 39);

exports.blue = init(34, 39);

exports.magenta = init(35, 39);

exports.cyan = init(36, 39);

exports.white = init(37, 39);

exports.gray = init(90, 39);

exports.BG_COLORS = BG_COLORS;

exports.FG_COLORS = FG_COLORS;

exports.BG_NAMES = [];

exports.FG_NAMES = [];

for (j = 0, len = BG_COLORS.length; j < len; j++) {
    bg = BG_COLORS[j];
    exports[bg] = eval(bg);
    for (i = k = 1; k <= 8; i = ++k) {
        exports[bg + i] = B256(exports[bg](i));
        exports.BG_NAMES.push(bg + i);
    }
}

for (l = 0, len1 = FG_COLORS.length; l < len1; l++) {
    fg = FG_COLORS[l];
    exports[fg] = eval(fg);
    for (i = o = 1; o <= 8; i = ++o) {
        exports[fg + i] = F256(exports[fg](i));
        exports.FG_NAMES.push(fg + i);
    }
}

exports.globalize = function() {
    var len2, n, p, q, results;
    results = [];
    for (p = 0, len2 = FG_COLORS.length; p < len2; p++) {
        fg = FG_COLORS[p];
        for (i = q = 1; q <= 8; i = ++q) {
            bg = fg.toUpperCase();
            global[fg + i] = exports[fg + i];
            global[bg + i] = exports[bg + i];
        }
        results.push((function() {
            var len3, ref, results1, t;
            ref = ['underline', 'bold', 'dim', 'italic', 'inverse', 'reset', 'strip', 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'];
            results1 = [];
            for (t = 0, len3 = ref.length; t < len3; t++) {
                n = ref[t];
                results1.push(global[n] = exports[n]);
            }
            return results1;
        })());
    }
    return results;
};

STRIPANSI = /\x1B[[(?);]{0,2}(;?\d)*./g;

exports.strip = function(s) {
    return String(s).replace(STRIPANSI, '');
};

if (require.main === module) {
    reset = '\x1b[0m';
    bold = '\x1b[1m';
    for (p = 0, len2 = BG_COLORS.length; p < len2; p++) {
        bg = BG_COLORS[p];
        for (i = q = 1; q <= 8; i = ++q) {
            s = reset;
            fg = bg.toLowerCase();
            s += module.exports[fg + i]((fg + i) + " " + (bg + i) + " ");
            for (t = 0, len3 = FG_COLORS.length; t < len3; t++) {
                fg = FG_COLORS[t];
                s += module.exports[bg + i](module.exports[fg + (9 - i)](' ' + fg + ' '));
            }
            console.log(s + reset);
        }
    }
    console.log(" ");
}

exports.map = {
    'punct': 'w3',
    'punct this': 'b3',
    'punct comment': 'w1',
    'punct comment triple': 'w1',
    'punct semver': 'r2',
    'punct regexp': 'm2',
    'punct regexp start': 'm8',
    'punct regexp end': 'm8',
    'punct regexp triple': 'm2',
    'punct escape regexp': 'm1',
    'punct escape regexp triple': 'm1',
    'punct string single': 'g1',
    'punct string single triple': 'g1',
    'punct string double': 'g1',
    'punct string double triple': 'g1',
    'punct string interpolation start': 'g1',
    'punct string interpolation end': 'g1',
    'punct number float': 'r3',
    'punct method': 'r2',
    'punct dictionary': 'y1',
    'punct property': 'y1',
    'punct range': 'b4',
    'punct code': 'b1',
    'punct code triple': 'b1',
    'punct meta': 'g1',
    'punct bold': 'y1',
    'punct italic': 'm1',
    'punct url': 'b1',
    'punct url tld': 'b1',
    'punct coffee': 'y1',
    'punct dir': 'g1',
    'punct obj': 'y1',
    'punct js': 'm1',
    'punct git': 'w1',
    'punct li1': 'g1',
    'punct li2': 'g1',
    'punct li3': 'g1',
    'punct li1 marker': 'g4',
    'punct li2 marker': 'g3',
    'punct li3 marker': 'g2',
    'punct class': 'y2',
    'punct method class': 'y2',
    'punct keyword': 'b6',
    'punct function': 'r1',
    'punct function call': 'r2',
    'punct function tail': ['b6', 'bold', 'B1'],
    'punct function head': ['b6', 'bold', 'B1'],
    'punct function bound tail': ['r5', 'bold', 'R1'],
    'punct function bound head': ['r5', 'bold', 'R1'],
    'punct h1': 'y1',
    'punct h2': 'r1',
    'punct h3': 'b3',
    'punct h4': 'b2',
    'punct h5': 'b1',
    'punct template': 'm1',
    'text': 'w8',
    'text h1': 'y4',
    'text h2': 'r4',
    'text h3': 'b8',
    'text h4': 'b6',
    'text h5': 'b5',
    'text li1': 'g4',
    'text li2': 'g2',
    'text li3': 'g1',
    'text dir': 'g4',
    'text file': 'g6',
    'text this': 'b8',
    'text bold': 'y7',
    'text code': 'b8',
    'text italic': ['m7', 'italic'],
    'text regexp': 'm6',
    'text regexp triple': 'm6',
    'string single': 'g3',
    'string double': 'g4',
    'string single triple': 'g3',
    'string double triple': 'g4',
    'nil': 'm2',
    'obj': 'y5',
    'define': 'w3',
    'require': 'w3',
    'doctype': 'b8',
    'number': 'b7',
    'number hex': 'c3',
    'number float': 'r7',
    'semver': 'r5',
    'module': 'y6',
    'module this': 'y2',
    'meta': 'g4',
    'class': 'y5',
    'method': 'r6',
    'method class': 'y7',
    'function': 'r4',
    'function call': 'r5',
    'function call this': 'r2',
    'keyword': 'b8',
    'keyword function': 'w2',
    'keyword type': 'm4',
    'keyword html': 'b8',
    'keyword svg': 'b8',
    'property': 'y6',
    'property color': 'm4',
    'property special': 'm4',
    'dictionary key': 'y8',
    'argument': 'c3',
    'url protocol': 'b2',
    'url domain': 'b8',
    'url tld': 'b4',
    'coffee file': 'y4',
    'coffee ext': 'y1',
    'js file': 'm4',
    'js ext': 'm2',
    'git file': 'w8',
    'git ext': 'w2',
    'important': 'w4',
    'template': 'm3',
    'struct': 'c3',
    'comment': 'w3',
    'comment triple': 'w4',
    'comment header': ['g1', 'G1'],
    'comment triple header': ['g2', 'G2']
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia29sb3IuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLENBQUEsR0FBSSxTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUDtXQUFhLFlBQUEsR0FBZSxDQUFDLEVBQUEsR0FBSyxFQUFBLEdBQUcsQ0FBUixHQUFZLENBQUEsR0FBRSxDQUFkLEdBQWtCLENBQW5CLENBQWYsR0FBdUM7QUFBcEQ7O0FBQ0osQ0FBQSxHQUFJLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQO1dBQWEsWUFBQSxHQUFlLENBQUMsRUFBQSxHQUFLLEVBQUEsR0FBRyxDQUFSLEdBQVksQ0FBQSxHQUFFLENBQWQsR0FBa0IsQ0FBbkIsQ0FBZixHQUF1QztBQUFwRDs7QUFFSixDQUFBLEdBQUksU0FBQyxDQUFEOztRQUFDLElBQUU7O1dBQU0sQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLElBQVksQ0FBQSxDQUFFLENBQUYsRUFBSyxDQUFMLEVBQVEsQ0FBUixDQUFaLElBQTBCLENBQUEsQ0FBSSxDQUFKLEVBQU8sQ0FBQSxHQUFFLENBQVQsRUFBWSxDQUFBLEdBQUUsQ0FBZDtBQUFuQzs7QUFDSixDQUFBLEdBQUksU0FBQyxDQUFEOztRQUFDLElBQUU7O1dBQU0sQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLElBQVksQ0FBQSxDQUFFLENBQUYsRUFBSyxDQUFMLEVBQVEsQ0FBUixDQUFaLElBQTBCLENBQUEsQ0FBSSxDQUFKLEVBQU8sQ0FBQSxHQUFFLENBQVQsRUFBWSxDQUFBLEdBQUUsQ0FBZDtBQUFuQzs7QUFDSixDQUFBLEdBQUksU0FBQyxDQUFEOztRQUFDLElBQUU7O1dBQU0sQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLElBQVksQ0FBQSxDQUFFLENBQUYsRUFBSyxDQUFMLEVBQVEsQ0FBUixDQUFaLElBQTBCLENBQUEsQ0FBRSxDQUFBLEdBQUUsQ0FBSixFQUFTLENB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QWpIcEM7SUFrSEEsVUFBQSxFQUFvQyxJQWxIcEM7SUFtSEEsUUFBQSxFQUFvQyxJQW5IcEM7SUFvSEEsU0FBQSxFQUFvQyxJQXBIcEM7SUFxSEEsZ0JBQUEsRUFBb0MsSUFySHBDO0lBc0hBLGdCQUFBLEVBQW9DLENBQUMsSUFBRCxFQUFNLElBQU4sQ0F0SHBDO0lBdUhBLHVCQUFBLEVBQW9DLENBQUMsSUFBRCxFQUFNLElBQU4sQ0F2SHBDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyMjXG5cbmYgPSAociwgZywgYikgLT4gJ1xceDFiWzM4OzU7JyArICgxNiArIDM2KnIgKyA2KmcgKyBiKSArICdtJ1xuRiA9IChyLCBnLCBiKSAtPiAnXFx4MWJbNDg7NTsnICsgKDE2ICsgMzYqciArIDYqZyArIGIpICsgJ20nXG5cbnIgPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBmKGksIDAsIDApIG9yIGYoICA1LCBpLTUsIGktNSlcblIgPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBGKGksIDAsIDApIG9yIEYoICA1LCBpLTUsIGktNSlcbmcgPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBmKDAsIGksIDApIG9yIGYoaS01LCAgIDUsIGktNSlcbkcgPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBGKDAsIGksIDApIG9yIEYoaS01LCAgIDUsIGktNSlcbmIgPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBmKDAsIDAsIGkpIG9yIGYoaS01LCBpLTUsICAgNSlcbkIgPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBGKDAsIDAsIGkpIG9yIEYoaS01LCBpLTUsICAgNSlcbnkgPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBmKGksIGksIDApIG9yIGYoICA1LCAgIDUsIGktNSlcblkgPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBGKGksIGksIDApIG9yIEYoICA1LCAgIDUsIGktNSlcbm0gPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBmKGksIDAsIGkpIG9yIGYoICA1LCBpLTUsICAgNSlcbk0gPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBGKGksIDAsIGkpIG9yIEYoICA1LCBpLTUsICAgNSlcbmMgPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBmKDAsIGksIGkpIG9yIGYoaS01LCAgNSwgICAgNSlcbkMgPSAoaT00KSAtPiAoaSA8IDYpIGFuZCBGKDAsIGksIGkpIG9yIEYoaS01LCAgNSwgICAgNSlcbncgPSAoaT00KSAtPiAnXFx4MWJbMzg7NTsnICsgKDIzMisoaS0xKSozKSArICdtJ1xuVyA9IChpPTQpIC0+ICdcXHgxYls0ODs1OycgKyAoMjMyKyhpLTEpKjMrMikgKyAnbSdcblxuRkdfQ09MT1JTID0gWydyJyAnZycgJ2InICdjJyAnbScgJ3knICd3J11cbkJHX0NPTE9SUyA9IFsnUicgJ00nICdCJyAnWScgJ0cnICdDJyAnVyddXG5cbndyYXAgPSAob3BlbiwgY2xvc2UsIHNlYXJjaFJlZ2V4LCByZXBsYWNlVmFsdWUpIC0+XG4gICAgKHMpIC0+IG9wZW4gKyAofihzICs9IFwiXCIpLmluZGV4T2YoY2xvc2UsIDQpIGFuZCBzLnJlcGxhY2Uoc2VhcmNoUmVnZXgsIHJlcGxhY2VWYWx1ZSkgb3IgcykgKyBjbG9zZVxuXG5pbml0ID0gKG9wZW4sIGNsb3NlKSAtPiB3cmFwIFwiXFx4MWJbI3tvcGVufW1cIiwgXCJcXHgxYlsje2Nsb3NlfW1cIiwgbmV3IFJlZ0V4cChcIlxcXFx4MWJcXFxcWyN7Y2xvc2V9bVwiLCBcImdcIiksIFwiXFx4MWJbI3tvcGVufW1cIlxuXG5GMjU2ID0gKG9wZW4pIC0+IHdyYXAgb3BlbiwgXCJcXHgxYlszOW1cIiwgbmV3IFJlZ0V4cChcIlxcXFx4MWJcXFxcWzM5bVwiLCBcImdcIiksIG9wZW5cbkIyNTYgPSAob3BlbikgLT4gd3JhcCBvcGVuLCBcIlxceDFiWzQ5bVwiLCBuZXcgUmVnRXhwKFwiXFxcXHgxYlxcXFxbNDltXCIsIFwiZ1wiKSwgb3BlblxuXG5leHBvcnRzLmJvbGQgICAgICA9IHdyYXAgXCJcXHgxYlsxbVwiIFwiXFx4MWJbMjJtXCIsIC9cXHgxYlxcWzIybS9nLCBcIlxceDFiWzIybVxceDFiWzFtXCJcbmV4cG9ydHMuZGltICAgICAgID0gd3JhcCBcIlxceDFiWzJtXCIgXCJcXHgxYlsyMm1cIiwgL1xceDFiXFxbMjJtL2csIFwiXFx4MWJbMjJtXFx4MWJbMm1cIlxuZXhwb3J0cy5yZXNldCAgICAgPSBpbml0IDAgIDBcbmV4cG9ydHMuaXRhbGljICAgID0gaW5pdCAzICAyM1xuZXhwb3J0cy51bmRlcmxpbmUgPSBpbml0IDQgIDI0XG5leHBvcnRzLmludmVyc2UgICA9IGluaXQgNyAgMjdcbmV4cG9ydHMuaGlkZGVuICAgID0gaW5pdCA4ICAyOFxuZXhwb3J0cy5ibGFjayAgICAgPSBpbml0IDMwIDM5XG5leHBvcnRzLnJlZCAgICAgICA9IGluaXQgMzEgMzlcbmV4cG9ydHMuZ3JlZW4gICAgID0gaW5pdCAzMiAzOVxuZXhwb3J0cy55ZWxsb3cgICAgPSBpbml0IDMzIDM5XG5leHBvcnRzLmJsdWUgICAgICA9IGluaXQgMzQgMzlcbmV4cG9ydHMubWFnZW50YSAgID0gaW5pdCAzNSAzOVxuZXhwb3J0cy5jeWFuICAgICAgPSBpbml0IDM2IDM5XG5leHBvcnRzLndoaXRlICAgICA9IGluaXQgMzcgMzlcbmV4cG9ydHMuZ3JheSAgICAgID0gaW5pdCA5MCAzOVxuXG5leHBvcnRzLkJHX0NPTE9SUyA9IEJHX0NPTE9SUyBcbmV4cG9ydHMuRkdfQ09MT1JTID0gRkdfQ09MT1JTIFxuZXhwb3J0cy5CR19OQU1FUyAgPSBbXVxuZXhwb3J0cy5GR19OQU1FUyAgPSBbXVxuXG5mb3IgYmcgaW4gQkdfQ09MT1JTXG4gICAgZXhwb3J0c1tiZ10gPSBldmFsIGJnXG4gICAgZm9yIGkgaW4gWzEuLjhdXG4gICAgICAgIGV4cG9ydHNbYmcraV0gPSBCMjU2IGV4cG9ydHNbYmddIGlcbiAgICAgICAgZXhwb3J0cy5CR19OQU1FUy5wdXNoIGJnK2lcblxuZm9yIGZnIGluIEZHX0NPTE9SU1xuICAgIGV4cG9ydHNbZmddID0gZXZhbCBmZ1xuICAgIGZvciBpIGluIFsxLi44XVxuICAgICAgICBleHBvcnRzW2ZnK2ldID0gRjI1NiBleHBvcnRzW2ZnXSBpXG4gICAgICAgIGV4cG9ydHMuRkdfTkFNRVMucHVzaCBmZytpXG5cbiMgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwICAwMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuZXhwb3J0cy5nbG9iYWxpemUgPSAtPlxuICAgIFxuICAgIGZvciBmZyBpbiBGR19DT0xPUlNcbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFsxLi44XVxuICAgICAgICAgICAgYmcgPSBmZy50b1VwcGVyQ2FzZSgpXG4gICAgICAgICAgICBnbG9iYWxbZmcraV0gPSBleHBvcnRzW2ZnK2ldIFxuICAgICAgICAgICAgZ2xvYmFsW2JnK2ldID0gZXhwb3J0c1tiZytpXSBcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgbiBpbiBbJ3VuZGVybGluZScnYm9sZCcnZGltJydpdGFsaWMnJ2ludmVyc2UnJ3Jlc2V0JydzdHJpcCdcbiAgICAgICAgICAgICAgICAgICdibGFjaycncmVkJydncmVlbicneWVsbG93JydibHVlJydtYWdlbnRhJydjeWFuJyd3aGl0ZScnZ3JheSddXG4gICAgICAgICAgICBnbG9iYWxbbl0gPSBleHBvcnRzW25dXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgXG5cblNUUklQQU5TSSA9IC9cXHgxQltbKD8pO117MCwyfSg7P1xcZCkqLi9nXG5leHBvcnRzLnN0cmlwID0gKHMpIC0+IFN0cmluZyhzKS5yZXBsYWNlIFNUUklQQU5TSSwgJydcbiAgICAgICAgICAgICAgICBcbiMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICBcblxuaWYgcmVxdWlyZS5tYWluID09IG1vZHVsZVxuXG4gICAgcmVzZXQgPSAnXFx4MWJbMG0nXG4gICAgYm9sZCAgPSAnXFx4MWJbMW0nXG4gICAgICAgICAgICAgICAgXG4gICAgZm9yIGJnIGluIEJHX0NPTE9SU1xuICAgICAgICBmb3IgaSBpbiBbMS4uOF1cbiAgICAgICAgICAgIHMgID0gcmVzZXRcbiAgICAgICAgICAgIGZnID0gYmcudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgcyArPSBtb2R1bGUuZXhwb3J0c1tmZytpXShcIiN7ZmcraX0gI3tiZytpfSBcIilcbiAgICAgICAgICAgIGZvciBmZyBpbiBGR19DT0xPUlNcbiAgICAgICAgICAgICAgICBzICs9IG1vZHVsZS5leHBvcnRzW2JnK2ldIG1vZHVsZS5leHBvcnRzW2ZnKyg5LWkpXSAnICcgKyBmZyArICcgJ1xuICAgICAgICAgICAgbG9nIHMgKyByZXNldFxuICAgICAgICAgICAgXG4gICAgbG9nIFwiIFwiXG4gICAgXG5leHBvcnRzLm1hcCA9XG4gICAgJ3B1bmN0JzogICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3czJ1xuICAgICdwdW5jdCB0aGlzJzogICAgICAgICAgICAgICAgICAgICAgICdiMydcbiAgICAncHVuY3QgY29tbWVudCc6ICAgICAgICAgICAgICAgICAgICAndzEnIFxuICAgICdwdW5jdCBjb21tZW50IHRyaXBsZSc6ICAgICAgICAgICAgICd3MScgXG4gICAgJ3B1bmN0IHNlbXZlcic6ICAgICAgICAgICAgICAgICAgICAgJ3IyJyBcbiAgICAncHVuY3QgcmVnZXhwJzogICAgICAgICAgICAgICAgICAgICAnbTInXG4gICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCc6ICAgICAgICAgICAgICAgJ204JyBcbiAgICAncHVuY3QgcmVnZXhwIGVuZCc6ICAgICAgICAgICAgICAgICAnbTgnIFxuICAgICdwdW5jdCByZWdleHAgdHJpcGxlJzogICAgICAgICAgICAgICdtMidcbiAgICAncHVuY3QgZXNjYXBlIHJlZ2V4cCc6ICAgICAgICAgICAgICAnbTEnXG4gICAgJ3B1bmN0IGVzY2FwZSByZWdleHAgdHJpcGxlJzogICAgICAgJ20xJ1xuICAgICdwdW5jdCBzdHJpbmcgc2luZ2xlJzogICAgICAgICAgICAgICdnMScgXG4gICAgJ3B1bmN0IHN0cmluZyBzaW5nbGUgdHJpcGxlJzogICAgICAgJ2cxJyBcbiAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSc6ICAgICAgICAgICAgICAnZzEnIFxuICAgICdwdW5jdCBzdHJpbmcgZG91YmxlIHRyaXBsZSc6ICAgICAgICdnMScgXG4gICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0JzogJ2cxJ1xuICAgICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBlbmQnOiAgICdnMSdcbiAgICAncHVuY3QgbnVtYmVyIGZsb2F0JzogICAgICAgICAgICAgICAncjMnIFxuICAgICdwdW5jdCBtZXRob2QnOiAgICAgICAgICAgICAgICAgICAgICdyMidcbiAgICAncHVuY3QgZGljdGlvbmFyeSc6ICAgICAgICAgICAgICAgICAneTEnIFxuICAgICdwdW5jdCBwcm9wZXJ0eSc6ICAgICAgICAgICAgICAgICAgICd5MScgXG4gICAgJ3B1bmN0IHJhbmdlJzogICAgICAgICAgICAgICAgICAgICAgJ2I0JyBcbiAgICAncHVuY3QgY29kZSc6ICAgICAgICAgICAgICAgICAgICAgICAnYjEnIFxuICAgICdwdW5jdCBjb2RlIHRyaXBsZSc6ICAgICAgICAgICAgICAgICdiMScgXG4gICAgJ3B1bmN0IG1ldGEnOiAgICAgICAgICAgICAgICAgICAgICAgJ2cxJ1xuICAgICdwdW5jdCBib2xkJzogICAgICAgICAgICAgICAgICAgICAgICd5MSdcbiAgICAncHVuY3QgaXRhbGljJzogICAgICAgICAgICAgICAgICAgICAnbTEnXG4gICAgJ3B1bmN0IHVybCc6ICAgICAgICAgICAgICAgICAgICAgICAgJ2IxJ1xuICAgICdwdW5jdCB1cmwgdGxkJzogICAgICAgICAgICAgICAgICAgICdiMSdcbiAgICAncHVuY3QgY29mZmVlJzogICAgICAgICAgICAgICAgICAgICAneTEnXG4gICAgJ3B1bmN0IGRpcic6ICAgICAgICAgICAgICAgICAgICAgICAgJ2cxJ1xuICAgICdwdW5jdCBvYmonOiAgICAgICAgICAgICAgICAgICAgICAgICd5MSdcbiAgICAncHVuY3QganMnOiAgICAgICAgICAgICAgICAgICAgICAgICAnbTEnXG4gICAgJ3B1bmN0IGdpdCc6ICAgICAgICAgICAgICAgICAgICAgICAgJ3cxJ1xuICAgICdwdW5jdCBsaTEnOiAgICAgICAgICAgICAgICAgICAgICAgICdnMSdcbiAgICAncHVuY3QgbGkyJzogICAgICAgICAgICAgICAgICAgICAgICAnZzEnXG4gICAgJ3B1bmN0IGxpMyc6ICAgICAgICAgICAgICAgICAgICAgICAgJ2cxJ1xuICAgICdwdW5jdCBsaTEgbWFya2VyJzogICAgICAgICAgICAgICAgICdnNCdcbiAgICAncHVuY3QgbGkyIG1hcmtlcic6ICAgICAgICAgICAgICAgICAnZzMnXG4gICAgJ3B1bmN0IGxpMyBtYXJrZXInOiAgICAgICAgICAgICAgICAgJ2cyJ1xuICAgICdwdW5jdCBjbGFzcyc6ICAgICAgICAgICAgICAgICAgICAgICd5MicgXG4gICAgJ3B1bmN0IG1ldGhvZCBjbGFzcyc6ICAgICAgICAgICAgICAgJ3kyJyBcbiAgICAncHVuY3Qga2V5d29yZCc6ICAgICAgICAgICAgICAgICAgICAnYjYnXG4gICAgJ3B1bmN0IGZ1bmN0aW9uJzogICAgICAgICAgICAgICAgICAgJ3IxJ1xuICAgICdwdW5jdCBmdW5jdGlvbiBjYWxsJzogICAgICAgICAgICAgICdyMicgICAgIFxuICAgICdwdW5jdCBmdW5jdGlvbiB0YWlsJzogICAgICAgICAgICAgIFsnYjYnICdib2xkJyAnQjEnXVxuICAgICdwdW5jdCBmdW5jdGlvbiBoZWFkJzogICAgICAgICAgICAgIFsnYjYnICdib2xkJyAnQjEnXVxuICAgICdwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJzogICAgICAgIFsncjUnICdib2xkJyAnUjEnXVxuICAgICdwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJzogICAgICAgIFsncjUnICdib2xkJyAnUjEnXVxuICAgICdwdW5jdCBoMSc6ICAgICAgICAgICAgICAgICAgICAgICAgICd5MSdcbiAgICAncHVuY3QgaDInOiAgICAgICAgICAgICAgICAgICAgICAgICAncjEnXG4gICAgJ3B1bmN0IGgzJzogICAgICAgICAgICAgICAgICAgICAgICAgJ2IzJ1xuICAgICdwdW5jdCBoNCc6ICAgICAgICAgICAgICAgICAgICAgICAgICdiMidcbiAgICAncHVuY3QgaDUnOiAgICAgICAgICAgICAgICAgICAgICAgICAnYjEnXG4gICAgJ3B1bmN0IHRlbXBsYXRlJzogICAgICAgICAgICAgICAgICAgJ20xJ1xuICAgICd0ZXh0JzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3OCcgXG4gICAgJ3RleHQgaDEnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ3k0J1xuICAgICd0ZXh0IGgyJzogICAgICAgICAgICAgICAgICAgICAgICAgICdyNCdcbiAgICAndGV4dCBoMyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAnYjgnXG4gICAgJ3RleHQgaDQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2I2J1xuICAgICd0ZXh0IGg1JzogICAgICAgICAgICAgICAgICAgICAgICAgICdiNSdcbiAgICAndGV4dCBsaTEnOiAgICAgICAgICAgICAgICAgICAgICAgICAnZzQnXG4gICAgJ3RleHQgbGkyJzogICAgICAgICAgICAgICAgICAgICAgICAgJ2cyJ1xuICAgICd0ZXh0IGxpMyc6ICAgICAgICAgICAgICAgICAgICAgICAgICdnMSdcbiAgICAndGV4dCBkaXInOiAgICAgICAgICAgICAgICAgICAgICAgICAnZzQnXG4gICAgJ3RleHQgZmlsZSc6ICAgICAgICAgICAgICAgICAgICAgICAgJ2c2J1xuICAgICd0ZXh0IHRoaXMnOiAgICAgICAgICAgICAgICAgICAgICAgICdiOCcgXG4gICAgJ3RleHQgYm9sZCc6ICAgICAgICAgICAgICAgICAgICAgICAgJ3k3J1xuICAgICd0ZXh0IGNvZGUnOiAgICAgICAgICAgICAgICAgICAgICAgICdiOCdcbiAgICAndGV4dCBpdGFsaWMnOiAgICAgICAgICAgICAgICAgICAgICBbJ203JydpdGFsaWMnXVxuICAgICd0ZXh0IHJlZ2V4cCc6ICAgICAgICAgICAgICAgICAgICAgICdtNidcbiAgICAndGV4dCByZWdleHAgdHJpcGxlJzogICAgICAgICAgICAgICAnbTYnXG4gICAgJ3N0cmluZyBzaW5nbGUnOiAgICAgICAgICAgICAgICAgICAgJ2czJyBcbiAgICAnc3RyaW5nIGRvdWJsZSc6ICAgICAgICAgICAgICAgICAgICAnZzQnIFxuICAgICdzdHJpbmcgc2luZ2xlIHRyaXBsZSc6ICAgICAgICAgICAgICdnMycgXG4gICAgJ3N0cmluZyBkb3VibGUgdHJpcGxlJzogICAgICAgICAgICAgJ2c0JyBcbiAgICAnbmlsJzogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbTInXG4gICAgJ29iaic6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3k1JyBcbiAgICAnZGVmaW5lJzogICAgICAgICAgICAgICAgICAgICAgICAgICAndzMnIFxuICAgICdyZXF1aXJlJzogICAgICAgICAgICAgICAgICAgICAgICAgICd3MycgXG4gICAgJ2RvY3R5cGUnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2I4JyBcbiAgICAnbnVtYmVyJzogICAgICAgICAgICAgICAgICAgICAgICAgICAnYjcnIFxuICAgICdudW1iZXIgaGV4JzogICAgICAgICAgICAgICAgICAgICAgICdjMycgXG4gICAgJ251bWJlciBmbG9hdCc6ICAgICAgICAgICAgICAgICAgICAgJ3I3JyBcbiAgICAnc2VtdmVyJzogICAgICAgICAgICAgICAgICAgICAgICAgICAncjUnIFxuICAgICdtb2R1bGUnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICd5NicgXG4gICAgJ21vZHVsZSB0aGlzJzogICAgICAgICAgICAgICAgICAgICAgJ3kyJyBcbiAgICAnbWV0YSc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZzQnIFxuICAgICdjbGFzcyc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICd5NScgXG4gICAgJ21ldGhvZCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3I2J1xuICAgICdtZXRob2QgY2xhc3MnOiAgICAgICAgICAgICAgICAgICAgICd5NycgXG4gICAgJ2Z1bmN0aW9uJzogICAgICAgICAgICAgICAgICAgICAgICAgJ3I0JyBcbiAgICAnZnVuY3Rpb24gY2FsbCc6ICAgICAgICAgICAgICAgICAgICAncjUnIFxuICAgICdmdW5jdGlvbiBjYWxsIHRoaXMnOiAgICAgICAgICAgICAgICdyMicgXG4gICAgJ2tleXdvcmQnOiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2I4JyBcbiAgICAna2V5d29yZCBmdW5jdGlvbic6ICAgICAgICAgICAgICAgICAndzInIFxuICAgICdrZXl3b3JkIHR5cGUnOiAgICAgICAgICAgICAgICAgICAgICdtNCcgXG4gICAgJ2tleXdvcmQgaHRtbCc6ICAgICAgICAgICAgICAgICAgICAgJ2I4JyBcbiAgICAna2V5d29yZCBzdmcnOiAgICAgICAgICAgICAgICAgICAgICAnYjgnIFxuICAgICdwcm9wZXJ0eSc6ICAgICAgICAgICAgICAgICAgICAgICAgICd5NicgXG4gICAgJ3Byb3BlcnR5IGNvbG9yJzogICAgICAgICAgICAgICAgICAgJ200J1xuICAgICdwcm9wZXJ0eSBzcGVjaWFsJzogICAgICAgICAgICAgICAgICdtNCdcbiAgICAnZGljdGlvbmFyeSBrZXknOiAgICAgICAgICAgICAgICAgICAneTgnIFxuICAgICdhcmd1bWVudCc6ICAgICAgICAgICAgICAgICAgICAgICAgICdjMydcbiAgICAndXJsIHByb3RvY29sJzogICAgICAgICAgICAgICAgICAgICAnYjInXG4gICAgJ3VybCBkb21haW4nOiAgICAgICAgICAgICAgICAgICAgICAgJ2I4J1xuICAgICd1cmwgdGxkJzogICAgICAgICAgICAgICAgICAgICAgICAgICdiNCdcbiAgICAnY29mZmVlIGZpbGUnOiAgICAgICAgICAgICAgICAgICAgICAneTQnXG4gICAgJ2NvZmZlZSBleHQnOiAgICAgICAgICAgICAgICAgICAgICAgJ3kxJ1xuICAgICdqcyBmaWxlJzogICAgICAgICAgICAgICAgICAgICAgICAgICdtNCdcbiAgICAnanMgZXh0JzogICAgICAgICAgICAgICAgICAgICAgICAgICAnbTInXG4gICAgJ2dpdCBmaWxlJzogICAgICAgICAgICAgICAgICAgICAgICAgJ3c4J1xuICAgICdnaXQgZXh0JzogICAgICAgICAgICAgICAgICAgICAgICAgICd3MidcbiAgICAnaW1wb3J0YW50JzogICAgICAgICAgICAgICAgICAgICAgICAndzQnXG4gICAgJ3RlbXBsYXRlJzogICAgICAgICAgICAgICAgICAgICAgICAgJ20zJ1xuICAgICdzdHJ1Y3QnOiAgICAgICAgICAgICAgICAgICAgICAgICAgICdjMydcbiAgICAnY29tbWVudCc6ICAgICAgICAgICAgICAgICAgICAgICAgICAndzMnXG4gICAgJ2NvbW1lbnQgdHJpcGxlJzogICAgICAgICAgICAgICAgICAgJ3c0J1xuICAgICdjb21tZW50IGhlYWRlcic6ICAgICAgICAgICAgICAgICAgIFsnZzEnICdHMSddXG4gICAgJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcic6ICAgICAgICAgICAgWydnMicgJ0cyJ11cbiAgICBcbiAgICAiXX0=
//# sourceURL=../coffee/kolor.coffee