// koffee 0.52.0

/*
000   000  000       0000000   00000000   
000  000   000      000   000  000   000  
0000000    000      000   000  0000000    
000  000   000      000   000  000   000  
000   000  0000000   0000000   000   000
 */
var FLOAT, HEADER, HEX, HEXNUM, NUMBER, PUNCT, SPACE, actExt, addValue, addValues, blockComment, blocked, chunk, chunkIndex, chunked, codeTypes, coffeePunct, coffeeWord, commentHeader, cppMacro, cssWord, dashArrow, dict, escape, ext, extStack, extTop, exts, fillComment, float, getChunk, getValue, getmatch, handl, handlers, hashComment, interpolation, j, jsPunct, jsWord, jsonPunct, jsonWord, k, keyword, keywords, lang, len, len1, len2, len3, line, mdPunct, names, noon, noonComment, noonProp, noonPunct, noonWord, notCode, number, obj, p, pad, parse, path, popExt, popStack, property, pushExt, pushStack, q, ref, ref1, regexp, replaceTabs, setValue, shPunct, simpleString, slashComment, stack, stackTop, stacked, starComment, swtch, thisCall, topType, tripleRegexp, tripleString, urlPunct, urlWord, value, word, words, xmlPunct,
    indexOf = [].indexOf;

noon = require('noon');

path = require('path');

exts = ['txt', 'log', 'koffee'];

lang = {};

ref = noon.load(path.join(__dirname, '..', 'coffee', 'lang.noon'));
for (names in ref) {
    keywords = ref[names];
    ref1 = names.split(/\s/);
    for (j = 0, len = ref1.length; j < len; j++) {
        ext = ref1[j];
        if (indexOf.call(exts, ext) < 0) {
            exts.push(ext);
        }
        if (lang[ext] != null) {
            lang[ext];
        } else {
            lang[ext] = {};
        }
        for (value in keywords) {
            words = keywords[value];
            for (k = 0, len1 = words.length; k < len1; k++) {
                word = words[k];
                lang[ext][word] = value;
            }
        }
    }
}

swtch = {
    coffee: {
        doc: {
            turd: '▸',
            to: 'md',
            indent: 1
        }
    },
    md: {
        coffeescript: {
            turd: '```',
            to: 'coffee',
            end: '```',
            add: 'code triple'
        },
        javascript: {
            turd: '```',
            to: 'js',
            end: '```',
            add: 'code triple'
        }
    }
};

for (p = 0, len2 = exts.length; p < len2; p++) {
    ext = exts[p];
    swtch.md[ext] = {
        turd: '```',
        to: ext,
        end: '```',
        add: 'code triple'
    };
}

SPACE = /\s/;

HEADER = /^0+$/;

PUNCT = /\W+/g;

NUMBER = /^\d+$/;

FLOAT = /^\d+f$/;

HEXNUM = /^0x[a-fA-F\d]+$/;

HEX = /^[a-fA-F\d]+$/;

codeTypes = ['interpolation', 'code triple'];

''

chunked = function(lines, ext) {
    var lineno;
    if (ext === 'koffee') {
        ext = 'coffee';
    }
    if (indexOf.call(exts, ext) < 0) {
        ext = 'txt';
    }
    lineno = 0;
    return lines.map(function(text) {
        var advance, c, chunks, l, last, len3, line, m, pc, pi, punct, q, ref2, ref3, rl, s, sc, turd, w, wl;
        line = {
            chunks: [],
            chars: 0,
            index: lineno++,
            number: lineno,
            ext: ext
        };
        chunks = replaceTabs(text).split(SPACE);
        if (chunks.length === 1 && chunks[0] === '') {
            return line;
        }
        c = 0;
        for (q = 0, len3 = chunks.length; q < len3; q++) {
            s = chunks[q];
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
                            start: c,
                            length: wl,
                            match: w,
                            value: 'text'
                        });
                        c += wl;
                    }
                    turd = punct = m[0];
                    pi = 0;
                    advance = 1;
                    value = 'punct';
                    while (pi < punct.length - 1) {
                        pc = punct[pi];
                        advance = 1;
                        if ((0xD800 <= (ref2 = punct.charCodeAt(pi)) && ref2 <= 0xDBFF) && (0xDC00 <= (ref3 = punct.charCodeAt(pi + 1)) && ref3 <= 0xDFFF)) {
                            advance = 2;
                            value = 'text';
                            pc += punct[pi + 1];
                        } else {
                            value = 'punct';
                        }
                        pi += advance;
                        line.chunks.push({
                            start: c,
                            length: advance,
                            match: pc,
                            turd: turd,
                            value: value
                        });
                        c += advance;
                        turd = turd.slice(advance);
                    }
                    if (pi < punct.length) {
                        line.chunks.push({
                            start: c,
                            length: advance,
                            match: punct.slice(pi),
                            value: 'punct'
                        });
                        c += advance;
                    }
                }
                if (c < sc + l) {
                    rl = sc + l - c;
                    w = s.slice(l - rl);
                    line.chunks.push({
                        start: c,
                        length: rl,
                        match: w,
                        value: 'text'
                    });
                    c += rl;
                }
            }
        }
        if (line.chunks.length) {
            last = line.chunks.slice(-1)[0];
            line.chars = last.start + last.length;
        }
        return line;
    });
};


/*
000   000   0000000   000   000  0000000    000      00000000  00000000    0000000    
000   000  000   000  0000  000  000   000  000      000       000   000  000         
000000000  000000000  000 0 000  000   000  000      0000000   0000000    0000000     
000   000  000   000  000  0000  000   000  000      000       000   000       000    
000   000  000   000  000   000  0000000    0000000  00000000  000   000  0000000
 */

extStack = [];

stack = [];

handl = [];

extTop = null;

stackTop = null;

notCode = false;

topType = '';

ext = '';

line = null;

chunk = null;

chunkIndex = 0;

fillComment = function(n) {
    var c, i, len3, len4, mightBeHeader, q, r, ref2, restChunks, t;
    for (i = q = 0, ref2 = n; 0 <= ref2 ? q < ref2 : q > ref2; i = 0 <= ref2 ? ++q : --q) {
        addValue(i, 'comment');
    }
    if (chunkIndex < line.chunks.length - n) {
        restChunks = line.chunks.slice(chunkIndex + n);
        mightBeHeader = true;
        for (r = 0, len3 = restChunks.length; r < len3; r++) {
            c = restChunks[r];
            c.value = 'comment';
            if (mightBeHeader && !HEADER.test(c.match)) {
                mightBeHeader = false;
            }
        }
        if (mightBeHeader) {
            for (t = 0, len4 = restChunks.length; t < len4; t++) {
                c = restChunks[t];
                c.value += ' header';
            }
        }
    }
    return line.chunks.length - chunkIndex + n;
};

hashComment = function() {
    if (stackTop && topType !== 'regexp triple') {
        return;
    }
    if (stackTop && stackTop.lineno === line.number) {
        return;
    }
    if (chunk.match === "#") {
        return fillComment(1);
    }
};

noonComment = function() {
    if (stackTop) {
        return;
    }
    if (chunk.match === "#" && chunkIndex === 0) {
        return fillComment(1);
    }
};

slashComment = function() {
    var ref2;
    if (stackTop) {
        return;
    }
    if ((ref2 = chunk.turd) != null ? ref2.startsWith("//") : void 0) {
        return fillComment(2);
    }
};

blockComment = function() {
    var type;
    if (!chunk.turd || chunk.turd.length < 3) {
        return;
    }
    type = 'comment triple';
    if (topType && (topType !== 'interpolation' && topType !== type)) {
        return;
    }
    if (chunk.turd.slice(0, 3) === '###') {
        if (topType === type) {
            popStack();
        } else {
            pushStack({
                type: type,
                strong: true
            });
        }
        return addValues(3, type);
    }
};

starComment = function() {
    var type;
    if (!chunk.turd) {
        return;
    }
    type = 'comment triple';
    if (topType && topType !== type) {
        return;
    }
    if (chunk.turd.slice(0, 2) === '/*' && !topType) {
        pushStack({
            type: type,
            strong: true
        });
        return addValues(2, type);
    }
    if (chunk.turd.slice(0, 2) === '*/' && topType === type) {
        popStack();
        return addValues(2, type);
    }
};

dashArrow = function() {
    var markFunc, ref2;
    if (notCode) {
        return;
    }
    markFunc = function() {
        if (line.chunks[0].value === 'text') {
            if (line.chunks[1].match === '=' && line.chunks[2].match !== '>') {
                line.chunks[0].value = 'function';
                return line.chunks[1].value += ' function';
            } else if (line.chunks[1].match === ':') {
                line.chunks[0].value = 'method';
                return line.chunks[1].value += ' method';
            }
        }
    };
    if (chunk.turd) {
        if (chunk.turd.startsWith('->')) {
            markFunc();
            addValue(0, 'function tail');
            addValue(1, 'function head');
            if (line.chunks[0].value === 'dictionary key' || ((ref2 = line.chunks[0].turd) != null ? ref2.slice(0, 2) : void 0) === '@:') {
                line.chunks[0].value = 'method';
                line.chunks[1].value = 'punct method';
            } else if (line.chunks[0].match === '@' && line.chunks[1].value === 'dictionary key') {
                line.chunks[0].value = 'punct method class';
                line.chunks[1].value = 'method class';
                line.chunks[2].value = 'punct method class';
            }
            return 2;
        }
        if (chunk.turd.startsWith('=>')) {
            markFunc();
            addValue(0, 'function bound tail');
            addValue(1, 'function bound head');
            if (line.chunks[0].value === 'dictionary key') {
                line.chunks[0].value = 'method';
                line.chunks[1].value = 'punct method';
            }
            return 2;
        }
    }
};

commentHeader = function() {
    if (topType === 'comment triple') {
        if (HEADER.test(chunk.match)) {
            chunk.value = 'comment triple header';
            return 1;
        }
    }
};

thisCall = function() {
    setValue(-1, 'function call');
    if (getmatch(-2) === '@') {
        setValue(-2, 'punct function call');
    }
    return 0;
};

coffeePunct = function() {
    var next, prev, prevEnd, ref2, ref3, ref4;
    if (notCode) {
        return;
    }
    if (chunk.match === '▸') {
        return addValue(0, 'meta');
    }
    if (chunk.turd === '~>') {
        return addValues(2, 'meta');
    }
    if (prev = getChunk(-1)) {
        if (((ref2 = chunk.turd) != null ? ref2.startsWith('..') : void 0) && prev.match !== '.') {
            if (chunk.turd[2] !== '.') {
                return addValues(2, 'range');
            }
            if (chunk.turd[3] !== '.') {
                return addValues(3, 'range');
            }
        }
        if (prev.value.startsWith('text') || prev.value === 'property') {
            prevEnd = prev.start + prev.length;
            if (chunk.match === '(' && prevEnd === chunk.start) {
                return thisCall();
            } else if (prevEnd < chunk.start) {
                if (ref3 = chunk.match, indexOf.call('@[({"\'', ref3) >= 0) {
                    return thisCall();
                } else if (ref4 = chunk.match, indexOf.call('+-/', ref4) >= 0) {
                    next = getChunk(1);
                    if (!next || next.match !== '=' && next.start === chunk.start + 1) {
                        return thisCall();
                    }
                }
            }
        }
    }
};

coffeeWord = function() {
    var prev, ref2;
    if (notCode) {
        return;
    }
    if (prev = getChunk(-1)) {
        if (prev.value === 'punct meta') {
            if (chunk.start === prev.start + 1) {
                setValue(0, 'meta');
                return 0;
            }
        }
        if ((ref2 = prev.match) === 'class' || ref2 === 'extends') {
            setValue(0, 'class');
            return 1;
        }
        if (chunk.value.startsWith('keyword')) {
            return 1;
        }
        if (prev.match === '@') {
            addValue(-1, 'this');
            addValue(0, 'this');
            return 1;
        }
        if ((prev.value.startsWith('text') || prev.value === 'property') && prev.start + prev.length < chunk.start) {
            return thisCall();
        }
    }
};

property = function() {
    var prevPrev, ref2;
    if (notCode) {
        return;
    }
    if (getmatch(-1) === '.') {
        prevPrev = getChunk(-2);
        if ((prevPrev != null ? prevPrev.match : void 0) !== '.') {
            addValue(-1, 'property');
            setValue(0, 'property');
            if (prevPrev) {
                if (((ref2 = prevPrev.value) !== 'property' && ref2 !== 'number') && !prevPrev.value.startsWith('punct')) {
                    setValue(-2, 'obj');
                }
            }
            return 1;
        }
    }
};

noonProp = function() {
    var i, prev, q, ref2;
    if (prev = getChunk(-1)) {
        if (prev.start + prev.length + 1 < chunk.start) {
            if (prev.value !== 'obj') {
                for (i = q = ref2 = chunkIndex - 1; ref2 <= 0 ? q <= 0 : q >= 0; i = ref2 <= 0 ? ++q : --q) {
                    if (i < chunkIndex - 1 && line.chunks[i].start + line.chunks[i].length + 1 < line.chunks[i + 1].start) {
                        break;
                    }
                    if (line.chunks[i].value === 'text' || line.chunks[i].value === 'obj') {
                        line.chunks[i].value = 'property';
                    } else if (line.chunks[i].value === 'punct') {
                        line.chunks[i].value = 'punct property';
                    } else {
                        break;
                    }
                }
            }
        }
    }
    return 0;
};

noonPunct = function() {
    if (notCode) {
        return;
    }
    return noonProp();
};

noonWord = function() {
    if (notCode) {
        return;
    }
    if (chunk.start === 0) {
        setValue(0, 'obj');
        return 1;
    }
    return noonProp();
};

urlPunct = function() {
    var fileext, i, next, prev, q, ref2, ref3, ref4;
    if (prev = getChunk(-1)) {
        if (chunk.turd === '://') {
            if (getmatch(4) === '.' && getChunk(5)) {
                setValue(-1, 'url protocol');
                addValues(3, 'url');
                setValue(3, 'url domain');
                setValue(4, 'punct url tld');
                setValue(5, 'url tld');
                return 6;
            }
        }
        if (chunk.match === '.') {
            if (!prev.value.startsWith('number') && prev.value !== 'semver' && (ref2 = prev.match, indexOf.call('\\./', ref2) < 0)) {
                if (next = getChunk(1)) {
                    if (next.start === chunk.start + chunk.length) {
                        fileext = next.match;
                        if (indexOf.call('\\./', fileext) < 0) {
                            setValue(-1, fileext + ' file');
                            addValue(0, fileext);
                            setValue(1, fileext + ' ext');
                            return 2;
                        }
                    }
                }
            }
        }
        if (chunk.match === '/') {
            for (i = q = ref3 = chunkIndex; ref3 <= 0 ? q <= 0 : q >= 0; i = ref3 <= 0 ? ++q : --q) {
                if (line.chunks[i].start + line.chunks[i].length < ((ref4 = line.chunks[i + 1]) != null ? ref4.start : void 0)) {
                    break;
                }
                if (line.chunks[i].value.endsWith('dir')) {
                    break;
                }
                if (line.chunks[i].value.startsWith('url')) {
                    break;
                }
                if (line.chunks[i].match === '"') {
                    break;
                }
                if (line.chunks[i].value.startsWith('punct')) {
                    line.chunks[i].value = 'punct dir';
                } else {
                    line.chunks[i].value = 'text dir';
                }
            }
            return 1;
        }
    }
    return 0;
};

urlWord = function() {
    var next, prev, ref2, ref3;
    if (prev = getChunk(-1)) {
        if (ref2 = prev.match, indexOf.call('\\/', ref2) >= 0) {
            next = getChunk(1);
            if (!next || next.start > chunk.start + chunk.length || (ref3 = next.match, indexOf.call('\\./', ref3) < 0)) {
                return addValue(0, 'file');
            }
        }
    }
};

jsPunct = function() {
    var prev;
    if (notCode) {
        return;
    }
    if (prev = getChunk(-1)) {
        if (chunk.match === '(') {
            if (prev.value.startsWith('text') || prev.value === 'property') {
                setValue(-1, 'function call');
                return 1;
            }
        }
    }
};

jsWord = function() {
    if (chunk.value === 'keyword function') {
        if (getmatch(-1) === '=' && getValue(-2).startsWith('text')) {
            setValue(-2, 'function');
        }
    }
    return 0;
};

dict = function() {
    var prev, ref2, ref3;
    if (notCode) {
        return;
    }
    if (chunk.match === ':' && !((ref2 = chunk.turd) != null ? ref2.startsWith('::') : void 0)) {
        if (prev = getChunk(-1)) {
            if ((ref3 = prev.value.split(' ')[0]) === 'string' || ref3 === 'number' || ref3 === 'text' || ref3 === 'keyword') {
                setValue(-1, 'dictionary key');
                setValue(0, 'punct dictionary');
                return 1;
            }
        }
    }
};

jsonPunct = function() {
    var i, prev, q, ref2;
    if (notCode) {
        return;
    }
    if (chunk.match === ':') {
        if (prev = getChunk(-1)) {
            if (prev.match === '"') {
                for (i = q = ref2 = chunkIndex - 2; ref2 <= 0 ? q <= 0 : q >= 0; i = ref2 <= 0 ? ++q : --q) {
                    if (line.chunks[i].value === 'punct string double') {
                        line.chunks[i].value = 'punct dictionary';
                        break;
                    }
                    line.chunks[i].value = 'dictionary key';
                }
                setValue(-1, 'punct dictionary');
                setValue(0, 'punct dictionary');
                return 1;
            }
        }
    }
};

jsonWord = function() {
    var prev, ref2, ref3;
    if (topType === 'string double' && (prev = getChunk(-1))) {
        if (ref2 = prev.match, indexOf.call('"^~', ref2) >= 0) {
            if (NUMBER.test(getmatch(0)) && getmatch(1) === '.' && NUMBER.test(getmatch(2)) && getmatch(3) === '.' && NUMBER.test(getmatch(4))) {
                if (ref3 = prev.match, indexOf.call('^~', ref3) >= 0) {
                    setValue(-1, 'punct semver');
                }
                setValue(0, 'semver');
                setValue(1, 'punct semver');
                setValue(2, 'semver');
                setValue(3, 'punct semver');
                setValue(4, 'semver');
                return 5;
            }
        }
    }
};

escape = function() {
    var ref2, ref3;
    if (chunk.match === '\\' && ((topType != null ? topType.startsWith('regexp') : void 0) || (topType != null ? topType.startsWith('string') : void 0))) {
        if (chunkIndex === 0 || !((ref2 = getChunk(-1)) != null ? ref2.escape : void 0)) {
            if (((ref3 = getChunk(1)) != null ? ref3.start : void 0) === chunk.start + 1) {
                chunk.escape = true;
                addValue(0, 'escape');
                return stacked();
            }
        }
    }
};

regexp = function() {
    var next, prev, ref2, ref3;
    if (topType != null ? topType.startsWith('string') : void 0) {
        return;
    }
    if ((ref2 = getChunk(-1)) != null ? ref2.escape : void 0) {
        return stacked();
    }
    if (chunk.match === '/') {
        if (topType === 'regexp') {
            chunk.value += ' regexp end';
            popStack();
            return 1;
        }
        if (chunkIndex) {
            prev = getChunk(-1);
            next = getChunk(+1);
            if (!prev.value.startsWith('punct') && !prev.value.startsWith('keyword') || (ref3 = prev.match, indexOf.call(")]", ref3) >= 0)) {
                if ((prev.start + prev.length < chunk.start) && (next != null ? next.start : void 0) > chunk.start + 1) {
                    return;
                }
                if ((prev.start + prev.length === chunk.start) && (next != null ? next.start : void 0) === chunk.start + 1) {
                    return;
                }
            }
            if ((next != null ? next.match : void 0) === '=') {
                return;
            }
            if (prev.value.startsWith('number')) {
                return;
            }
        }
        pushStack({
            type: 'regexp'
        });
        return addValue(0, 'regexp start');
    }
    return escape();
};

tripleRegexp = function() {
    var type;
    if (!chunk.turd || chunk.turd.length < 3) {
        return;
    }
    type = 'regexp triple';
    if (topType && (topType !== 'interpolation' && topType !== type)) {
        return;
    }
    if (chunk.turd.slice(0, 3) === '///') {
        if (topType === type) {
            popStack();
        } else {
            pushStack({
                type: type,
                lineno: line.number
            });
        }
        return addValues(3, type);
    }
};

simpleString = function() {
    var ref2, ref3, type;
    if (topType === 'regexp') {
        return;
    }
    if ((ref2 = getChunk(-1)) != null ? ref2.escape : void 0) {
        return stacked();
    }
    if (ref3 = chunk.match, indexOf.call('"\'', ref3) >= 0) {
        type = (function() {
            switch (chunk.match) {
                case '"':
                    return 'string double';
                case "'":
                    return 'string single';
            }
        })();
        if (topType === type) {
            addValue(0, type);
            popStack();
            return 1;
        } else if (notCode) {
            return stacked();
        }
        pushStack({
            strong: true,
            type: type
        });
        addValue(0, type);
        return 1;
    }
    return escape();
};

tripleString = function() {
    var ref2, type;
    if (!chunk.turd || chunk.turd.length < 3) {
        return;
    }
    if (topType === 'regexp' || topType === 'string single' || topType === 'string double') {
        return;
    }
    if ((ref2 = getChunk(-1)) != null ? ref2.escape : void 0) {
        return stacked();
    }
    type = (function() {
        switch (chunk.turd.slice(0, 3)) {
            case '"""':
                return 'string double triple';
            case "'''":
                return 'string single triple';
        }
    })();
    if (type) {
        if (type !== topType && (topType != null ? topType.startsWith('string') : void 0)) {
            return;
        }
        if (topType === type) {
            popStack();
        } else {
            pushStack({
                strong: true,
                type: type
            });
        }
        return addValues(3, type);
    }
    return escape();
};

number = function() {
    var ref2;
    if (notCode) {
        return;
    }
    if (NUMBER.test(chunk.match)) {
        if (getmatch(-1) === '.') {
            if (getValue(-4) === 'number float' && getValue(-2) === 'number float') {
                if (ref2 = getmatch(-5), indexOf.call('^~', ref2) >= 0) {
                    setValue(-5, 'punct semver');
                }
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
    if (HEXNUM.test(chunk.match)) {
        chunk.value = 'number hex';
        return 1;
    }
};

float = function() {
    if (FLOAT.test(chunk.match)) {
        if (getmatch(-1) === '.') {
            if (getValue(-2) === 'number') {
                setValue(-2, 'number float');
                addValue(-1, 'number float');
                setValue(0, 'number float');
                return 1;
            }
        }
        chunk.value = 'number float';
        return 1;
    }
};

cssWord = function() {
    var prev, prevPrev, ref2, ref3, ref4;
    if (((ref2 = chunk.match.slice(-2)) === 'px' || ref2 === 'em' || ref2 === 'ex') && NUMBER.test(chunk.match.slice(0, -2))) {
        setValue(0, 'number');
        return 1;
    }
    if (((ref3 = chunk.match.slice(-1)) === 's') && NUMBER.test(chunk.match.slice(0, -1))) {
        setValue(0, 'number');
        return 1;
    }
    if (prev = getChunk(-1)) {
        if (prev.match === '.') {
            addValue(-1, 'class');
            setValue(0, 'class');
            return 1;
        }
        if (prev.match === "#") {
            if (chunk.match.length === 3 || chunk.match.length === 6) {
                if (HEX.test(chunk.match)) {
                    addValue(-1, 'number hex');
                    setValue(0, 'number hex');
                    return 1;
                }
            }
            addValue(-1, 'function');
            setValue(0, 'function');
            return 1;
        }
        if (prev.match === '-') {
            if (prevPrev = getChunk(-2)) {
                if ((ref4 = prevPrev.value) === 'class' || ref4 === 'function') {
                    addValue(-1, prevPrev.value);
                    setValue(0, prevPrev.value);
                    return 1;
                }
            }
        }
    }
};

mdPunct = function() {
    var ref2, ref3, ref4, ref5, ref6, type;
    if (chunkIndex === 0) {
        if (!chunk.turd && (ref2 = chunk.match, indexOf.call('-*', ref2) >= 0) && ((ref3 = getChunk(1)) != null ? ref3.start : void 0) > chunk.start + 1) {
            type = ['li1', 'li2', 'li3'][chunk.start / 4];
            pushStack({
                merge: true,
                fill: true,
                type: type
            });
            return addValue(0, type + ' marker');
        }
        if (chunk.match === '#') {
            if (!chunk.turd) {
                pushStack({
                    merge: true,
                    fill: true,
                    type: 'h1'
                });
                return addValue(0, 'h1');
            }
            switch (chunk.turd) {
                case '##':
                    pushStack({
                        merge: true,
                        fill: true,
                        type: 'h2'
                    });
                    return addValues(2, 'h2');
                case '###':
                    pushStack({
                        merge: true,
                        fill: true,
                        type: 'h3'
                    });
                    return addValues(3, 'h3');
                case '####':
                    pushStack({
                        merge: true,
                        fill: true,
                        type: 'h4'
                    });
                    return addValues(4, 'h4');
                case '#####':
                    pushStack({
                        merge: true,
                        fill: true,
                        type: 'h5'
                    });
                    return addValues(5, 'h5');
            }
        }
    }
    if (chunk.match === '*') {
        if (((ref4 = chunk.turd) != null ? ref4.slice(0, 2) : void 0) === '**') {
            type = 'bold';
            if (topType != null ? topType.endsWith(type) : void 0) {
                addValues(2, topType);
                popStack();
                return 2;
            }
            if (stackTop != null ? stackTop.merge : void 0) {
                type = stackTop.type + ' ' + type;
            }
            pushStack({
                merge: true,
                type: type
            });
            return addValues(2, type);
        }
        type = 'italic';
        if (topType != null ? topType.endsWith(type) : void 0) {
            addValue(0, topType);
            popStack();
            return 1;
        }
        if (stackTop != null ? stackTop.merge : void 0) {
            type = stackTop.type + ' ' + type;
        }
        pushStack({
            merge: true,
            type: type
        });
        addValue(0, type);
        return 1;
    }
    if (chunk.match === '`') {
        if (((ref5 = chunk.turd) != null ? ref5.slice(0, 3) : void 0) === '```') {
            type = 'code triple';
            if ((ref6 = getmatch(3)) === 'coffeescript' || ref6 === 'javascript' || ref6 === 'js') {
                setValue(3, 'comment');
                return addValues(3, type);
            }
            pushStack({
                weak: true,
                type: type
            });
            return addValues(3, type);
        }
        type = 'code';
        if (topType != null ? topType.endsWith(type) : void 0) {
            addValue(0, topType);
            popStack();
            return 1;
        }
        if (stackTop != null ? stackTop.merge : void 0) {
            type = stackTop.type + ' ' + type;
        }
        pushStack({
            merge: true,
            type: type
        });
        return addValue(0, type);
    }
};

interpolation = function() {
    var ref2;
    if (topType != null ? topType.startsWith('string double') : void 0) {
        if ((ref2 = chunk.turd) != null ? ref2.startsWith("\#{") : void 0) {
            pushStack({
                type: 'interpolation',
                weak: true
            });
            setValue(0, 'punct string interpolation start');
            setValue(1, 'punct string interpolation start');
            return 2;
        }
    } else if (topType === 'interpolation') {
        if (chunk.match === '}') {
            setValue(0, 'punct string interpolation end');
            popStack();
            return 1;
        }
    }
};

keyword = function() {
    if (notCode) {
        return;
    }
    if (!lang[ext]) {
        return;
    }
    if (lang[ext].hasOwnProperty(chunk.match)) {
        chunk.value = lang[ext][chunk.match];
    }
};

xmlPunct = function() {
    var ref2;
    if (chunk.turd === '</') {
        return addValues(2, 'keyword');
    }
    if ((ref2 = chunk.match) === '<' || ref2 === '>') {
        return addValue(0, 'keyword');
    }
};

cppMacro = function() {
    if (chunk.match === "#") {
        addValue(0, 'define');
        setValue(1, 'define');
        return 2;
    }
};

shPunct = function() {
    var ref2, ref3, ref4, ref5;
    if (chunk.match === '/' && ((ref2 = getChunk(-1)) != null ? ref2.start : void 0) + ((ref3 = getChunk(-1)) != null ? ref3.length : void 0) === chunk.start) {
        return addValue(-1, 'dir');
    }
    if (chunk.turd === '--' && ((ref4 = getChunk(2)) != null ? ref4.start : void 0) === chunk.start + 2) {
        addValue(0, 'argument');
        addValue(1, 'argument');
        setValue(2, 'argument');
        return 3;
    }
    if (chunk.match === '-' && ((ref5 = getChunk(1)) != null ? ref5.start : void 0) === chunk.start + 1) {
        addValue(0, 'argument');
        setValue(1, 'argument');
        return 2;
    }
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
};

pushExt = function(mtch) {
    extTop = {
        "switch": mtch,
        start: line,
        stack: stack
    };
    return extStack.push(extTop);
};

actExt = function() {
    stack = [];
    stackTop = null;
    topType = '';
    return notCode = false;
};

popExt = function() {
    stack = extTop.stack;
    line.ext = extTop.start.ext;
    extStack.pop();
    extTop = extStack.slice(-1)[0];
    stackTop = stack.slice(-1)[0];
    topType = stackTop != null ? stackTop.type : void 0;
    return notCode = stackTop && indexOf.call(codeTypes, topType) < 0;
};

pushStack = function(o) {
    stack.push(o);
    stackTop = o;
    topType = o.type;
    return notCode = indexOf.call(codeTypes, topType) < 0;
};

popStack = function() {
    stack.pop();
    stackTop = stack.slice(-1)[0];
    topType = stackTop != null ? stackTop.type : void 0;
    return notCode = stackTop && indexOf.call(codeTypes, topType) < 0;
};

getChunk = function(d) {
    return line.chunks[chunkIndex + d];
};

setValue = function(d, value) {
    var ref2;
    if ((0 <= (ref2 = chunkIndex + d) && ref2 < line.chunks.length)) {
        return line.chunks[chunkIndex + d].value = value;
    }
};

getValue = function(d) {
    var ref2, ref3;
    return (ref2 = (ref3 = getChunk(d)) != null ? ref3.value : void 0) != null ? ref2 : '';
};

getmatch = function(d) {
    var ref2, ref3;
    return (ref2 = (ref3 = getChunk(d)) != null ? ref3.match : void 0) != null ? ref2 : '';
};

addValue = function(d, value) {
    var ref2;
    if ((0 <= (ref2 = chunkIndex + d) && ref2 < line.chunks.length)) {
        line.chunks[chunkIndex + d].value += ' ' + value;
    }
    return 1;
};

addValues = function(n, value) {
    var i, q, ref2;
    for (i = q = 0, ref2 = n; 0 <= ref2 ? q < ref2 : q > ref2; i = 0 <= ref2 ? ++q : --q) {
        addValue(i, value);
    }
    return n;
};

handlers = {
    coffee: {
        punct: [blockComment, hashComment, tripleRegexp, coffeePunct, tripleString, simpleString, interpolation, dashArrow, regexp, dict],
        word: [keyword, coffeeWord, number, property]
    },
    noon: {
        punct: [noonComment, noonPunct, urlPunct],
        word: [noonWord, urlWord, number]
    },
    js: {
        punct: [starComment, slashComment, jsPunct, simpleString, dashArrow, regexp, dict],
        word: [keyword, jsWord, number, property]
    },
    ts: {
        punct: [starComment, slashComment, jsPunct, simpleString, dashArrow, regexp, dict],
        word: [keyword, jsWord, number, property]
    },
    iss: {
        punct: [starComment, slashComment, simpleString],
        word: [keyword, number]
    },
    ini: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [number]
    },
    cpp: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float]
    },
    hpp: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float]
    },
    c: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float]
    },
    h: {
        punct: [starComment, slashComment, simpleString, cppMacro],
        word: [keyword, number, float]
    },
    cs: {
        punct: [starComment, slashComment, simpleString],
        word: [keyword, number]
    },
    pug: {
        punct: [starComment, slashComment, simpleString],
        word: [keyword, number]
    },
    styl: {
        punct: [starComment, slashComment, simpleString],
        word: [keyword, cssWord, number]
    },
    css: {
        punct: [starComment, slashComment, simpleString],
        word: [keyword, cssWord, number]
    },
    sass: {
        punct: [starComment, slashComment, simpleString],
        word: [keyword, cssWord, number]
    },
    scss: {
        punct: [starComment, slashComment, simpleString],
        word: [keyword, cssWord, number]
    },
    svg: {
        punct: [simpleString, xmlPunct],
        word: [keyword, number]
    },
    html: {
        punct: [simpleString, xmlPunct],
        word: [keyword, number]
    },
    htm: {
        punct: [simpleString, xmlPunct],
        word: [keyword, number]
    },
    sh: {
        punct: [hashComment, simpleString, urlPunct, shPunct],
        word: [keyword, urlWord, number]
    },
    json: {
        punct: [simpleString, jsonPunct, urlPunct],
        word: [keyword, jsonWord, urlWord, number]
    },
    log: {
        punct: [simpleString, urlPunct, dict],
        word: [urlWord, number]
    },
    md: {
        punct: [mdPunct, urlPunct, xmlPunct],
        word: [urlWord, number]
    },
    fish: {
        punct: [hashComment, simpleString],
        word: [keyword, number]
    }
};

for (q = 0, len3 = exts.length; q < len3; q++) {
    ext = exts[q];
    if (handlers[ext] == null) {
        handlers[ext] = {
            punct: [simpleString],
            word: [number]
        };
    }
}

for (ext in handlers) {
    obj = handlers[ext];
    handlers[ext].punct.push(stacked);
    handlers[ext].word.push(stacked);
}


/*
0000000    000       0000000    0000000  000   000  00000000  0000000    
000   000  000      000   000  000       000  000   000       000   000  
0000000    000      000   000  000       0000000    0000000   000   000  
000   000  000      000   000  000       000  000   000       000   000  
0000000    0000000   0000000    0000000  000   000  00000000  0000000
 */

''

blocked = function(lines) {
    var advance, beforeIndex, hnd, len4, len5, len6, len7, len8, mightBeHeader, mtch, r, ref10, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t, turdChunk, u, v, x;
    extStack = [];
    stack = [];
    handl = [];
    extTop = null;
    stackTop = null;
    notCode = false;
    topType = '';
    ext = '';
    line = null;
    chunk = null;
    chunkIndex = 0;
    for (r = 0, len4 = lines.length; r < len4; r++) {
        line = lines[r];
        if (stackTop) {
            if (stackTop.type === 'comment triple') {
                mightBeHeader = true;
                ref2 = line.chunks;
                for (t = 0, len5 = ref2.length; t < len5; t++) {
                    chunk = ref2[t];
                    if (!HEADER.test(chunk.match)) {
                        mightBeHeader = false;
                        break;
                    }
                }
                if (mightBeHeader) {
                    ref3 = line.chunks;
                    for (u = 0, len6 = ref3.length; u < len6; u++) {
                        chunk = ref3[u];
                        chunk.value = 'comment triple header';
                    }
                    continue;
                }
            }
            if (stackTop.fill) {
                popStack();
            }
        }
        if (extTop) {
            if (extTop["switch"].indent && ((ref4 = line.chunks[0]) != null ? ref4.start : void 0) <= extTop.start.chunks[0].start) {
                popExt();
            } else {
                line.ext = extTop["switch"].to;
            }
        }
        if (ext !== line.ext) {
            actExt();
            handl = handlers[ext = line.ext];
            if (!handl) {
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1082[39m', line);
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1083[39m', handlers);
            }
            if (!(handl)) {
                console.log('[33m[93mklor[33m[2m.[22m[2mcoffee[22m[39m[2m[34m:[39m[22m[94m1084[39m', '[1m[97massertion failure![39m[22m');

                process.exit(666);
            };
        }
        chunkIndex = 0;
        while (chunkIndex < line.chunks.length) {
            chunk = line.chunks[chunkIndex];
            beforeIndex = chunkIndex;
            if (chunk.value === 'punct') {
                if (extTop) {
                    if ((extTop["switch"].end != null) && extTop["switch"].end === chunk.turd) {
                        if (extTop["switch"].add) {
                            addValues(chunk.turd.length, extTop["switch"].add);
                        }
                        popExt();
                    }
                }
                ref6 = (ref5 = handl.punct) != null ? ref5 : [];
                for (v = 0, len7 = ref6.length; v < len7; v++) {
                    hnd = ref6[v];
                    if (advance = hnd()) {
                        chunkIndex += advance;
                        break;
                    }
                }
            } else {
                if (!notCode) {
                    if (mtch = (ref7 = swtch[line.ext]) != null ? ref7[chunk.match] : void 0) {
                        if (mtch.turd) {
                            turdChunk = getChunk(-mtch.turd.length);
                            if (mtch.turd === ((ref8 = turdChunk != null ? turdChunk.turd : void 0) != null ? ref8 : turdChunk != null ? turdChunk.match : void 0)) {
                                pushExt(mtch);
                            }
                        }
                    }
                }
                ref10 = (ref9 = handl.word) != null ? ref9 : [];
                for (x = 0, len8 = ref10.length; x < len8; x++) {
                    hnd = ref10[x];
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

pad = function(l) {
    var s;
    s = '';
    while (l > 0) {
        s += ' ';
        l--;
    }
    return s;
};

replaceTabs = function(s) {
    var i;
    i = 0;
    while (i < s.length) {
        if (s[i] === '\t') {
            s = s.splice(i, 1, pad(4 - (i % 4)));
        }
        i += 1;
    }
    return s;
};

parse = function(lines, ext) {
    if (ext == null) {
        ext = 'coffee';
    }
    return blocked(chunked(lines, ext));
};

module.exports = {
    kolor: require('./kolor'),
    exts: exts,
    parse: parse,
    chunked: chunked,
    ranges: function(line, ext) {
        if (ext == null) {
            ext = 'coffee';
        }
        return parse([line], ext)[0].chunks;
    },
    dissect: function(lines, ext) {
        if (ext == null) {
            ext = 'coffee';
        }
        return parse(lines, ext).map(function(l) {
            return l.chunks;
        });
    }
};

;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2xvci5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMHpCQUFBO0lBQUE7O0FBUUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7QUFDUCxJQUFBLEdBQU8sQ0FBQyxLQUFELEVBQU0sS0FBTixFQUFXLFFBQVg7O0FBQ1AsSUFBQSxHQUFPOztBQUVQO0FBQUEsS0FBQSxZQUFBOztBQUVJO0FBQUEsU0FBQSxzQ0FBQTs7UUFDSSxJQUFrQixhQUFXLElBQVgsRUFBQSxHQUFBLEtBQWxCO1lBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQUE7OztZQUNBLElBQUssQ0FBQSxHQUFBOztZQUFMLElBQUssQ0FBQSxHQUFBLElBQVE7O0FBQ2IsYUFBQSxpQkFBQTs7QUFDSSxpQkFBQSx5Q0FBQTs7Z0JBQ0ksSUFBSyxDQUFBLEdBQUEsQ0FBSyxDQUFBLElBQUEsQ0FBVixHQUFrQjtBQUR0QjtBQURKO0FBSEo7QUFGSjs7QUFRQSxLQUFBLEdBQ0k7SUFBQSxNQUFBLEVBQ0k7UUFBQSxHQUFBLEVBQUs7WUFBQSxJQUFBLEVBQUssR0FBTDtZQUFTLEVBQUEsRUFBRyxJQUFaO1lBQWlCLE1BQUEsRUFBUSxDQUF6QjtTQUFMO0tBREo7SUFFQSxFQUFBLEVBQ0k7UUFBQSxZQUFBLEVBQWM7WUFBQSxJQUFBLEVBQUssS0FBTDtZQUFXLEVBQUEsRUFBRyxRQUFkO1lBQXVCLEdBQUEsRUFBSSxLQUEzQjtZQUFpQyxHQUFBLEVBQUksYUFBckM7U0FBZDtRQUNBLFVBQUEsRUFBYztZQUFBLElBQUEsRUFBSyxLQUFMO1lBQVcsRUFBQSxFQUFHLElBQWQ7WUFBdUIsR0FBQSxFQUFJLEtBQTNCO1lBQWlDLEdBQUEsRUFBSSxhQUFyQztTQURkO0tBSEo7OztBQU1KLEtBQUEsd0NBQUE7O0lBQ0ksS0FBSyxDQUFDLEVBQUcsQ0FB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RUEsQ0FBQSxJQUFLO0lBSFQ7V0FJQTtBQU5VOztBQWNkLEtBQUEsR0FBUSxTQUFDLEtBQUQsRUFBUSxHQUFSOztRQUFRLE1BQUk7O1dBQWEsT0FBQSxDQUFRLE9BQUEsQ0FBUSxLQUFSLEVBQWUsR0FBZixDQUFSO0FBQXpCOztBQUVSLE1BQU0sQ0FBQyxPQUFQLEdBRUk7SUFBQSxLQUFBLEVBQVMsT0FBQSxDQUFRLFNBQVIsQ0FBVDtJQUNBLElBQUEsRUFBUyxJQURUO0lBRUEsS0FBQSxFQUFTLEtBRlQ7SUFHQSxPQUFBLEVBQVMsT0FIVDtJQUlBLE1BQUEsRUFBUyxTQUFDLElBQUQsRUFBTyxHQUFQOztZQUFPLE1BQUk7O2VBQWMsS0FBQSxDQUFNLENBQUMsSUFBRCxDQUFOLEVBQWMsR0FBZCxDQUFtQixDQUFBLENBQUEsQ0FBRSxDQUFDO0lBQS9DLENBSlQ7SUFLQSxPQUFBLEVBQVMsU0FBQyxLQUFELEVBQVEsR0FBUjs7WUFBUSxNQUFJOztlQUFhLEtBQUEsQ0FBTSxLQUFOLEVBQWEsR0FBYixDQUFpQixDQUFDLEdBQWxCLENBQXNCLFNBQUMsQ0FBRDttQkFBTyxDQUFDLENBQUM7UUFBVCxDQUF0QjtJQUF6QixDQUxUIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbjAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4wMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbm5vb24gPSByZXF1aXJlICdub29uJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5leHRzID0gWyd0eHQnJ2xvZycna29mZmVlJ10gXG5sYW5nID0ge31cbiAgICBcbmZvciBuYW1lcywga2V5d29yZHMgb2Ygbm9vbi5sb2FkIHBhdGguam9pbiBfX2Rpcm5hbWUsJy4uJydjb2ZmZWUnJ2xhbmcubm9vbidcbiAgICBcbiAgICBmb3IgZXh0IGluIG5hbWVzLnNwbGl0IC9cXHMvXG4gICAgICAgIGV4dHMucHVzaChleHQpIGlmIGV4dCBub3QgaW4gZXh0c1xuICAgICAgICBsYW5nW2V4dF0gPz0ge31cbiAgICAgICAgZm9yIHZhbHVlLHdvcmRzIG9mIGtleXdvcmRzXG4gICAgICAgICAgICBmb3Igd29yZCBpbiB3b3Jkc1xuICAgICAgICAgICAgICAgIGxhbmdbZXh0XVt3b3JkXSA9IHZhbHVlXG5zd3RjaCA9IFxuICAgIGNvZmZlZTogXG4gICAgICAgIGRvYzogdHVyZDon4pa4JyB0bzonbWQnIGluZGVudDogMVxuICAgIG1kOiAgICAgXG4gICAgICAgIGNvZmZlZXNjcmlwdDogdHVyZDonYGBgJyB0bzonY29mZmVlJyBlbmQ6J2BgYCcgYWRkOidjb2RlIHRyaXBsZSdcbiAgICAgICAgamF2YXNjcmlwdDogICB0dXJkOidgYGAnIHRvOidqcycgICAgIGVuZDonYGBgJyBhZGQ6J2NvZGUgdHJpcGxlJ1xuICAgICAgICBcbmZvciBleHQgaW4gZXh0c1xuICAgIHN3dGNoLm1kW2V4dF0gPSB0dXJkOidgYGAnIHRvOmV4dCwgZW5kOidgYGAnIGFkZDonY29kZSB0cmlwbGUnXG4gICAgICAgICAgICBcblNQQUNFICA9IC9cXHMvXG5IRUFERVIgPSAvXjArJC9cblBVTkNUICA9IC9cXFcrL2dcbk5VTUJFUiA9IC9eXFxkKyQvXG5GTE9BVCAgPSAvXlxcZCtmJC9cbkhFWE5VTSA9IC9eMHhbYS1mQS1GXFxkXSskL1xuSEVYICAgID0gL15bYS1mQS1GXFxkXSskL1xuXG5jb2RlVHlwZXMgPSBbJ2ludGVycG9sYXRpb24nICdjb2RlIHRyaXBsZSddXG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIFxuXG7ilrhkb2MgJ2NodW5rZWQgbGluZXMsIGV4dCdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgcmV0dXJucyBhcnJheSBvZlxuICAgICAgICBcbiAgICAgICAgY2h1bmtzOiBbXG4gICAgICAgICAgICAgICAgICAgIHR1cmQ6ICAgc1xuICAgICAgICAgICAgICAgICAgICBtYXRjaDogIHNcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICBzXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiAgblxuICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IG5cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgIGV4dDogICAgc1xuICAgICAgICBjaGFyczogIG5cbiAgICAgICAgaW5kZXg6ICBuXG4gICAgICAgIG51bWJlcjogbisxXG5cbmNodW5rZWQgPSAobGluZXMsIGV4dCkgLT4gICAgXG4gICAgICAgIFxuICAgIGV4dCA9ICdjb2ZmZWUnIGlmIGV4dCA9PSAna29mZmVlJ1xuICAgIGV4dCA9ICd0eHQnIGlmIGV4dCBub3QgaW4gZXh0c1xuICAgICAgICAgICAgXG4gICAgbGluZW5vID0gMFxuICAgIGxpbmVzLm1hcCAodGV4dCkgLT4gXG4gICAgICAgIFxuICAgICAgICBsaW5lID0gXG4gICAgICAgICAgICBjaHVua3M6IFtdXG4gICAgICAgICAgICBjaGFyczogIDBcbiAgICAgICAgICAgIGluZGV4OiAgbGluZW5vKytcbiAgICAgICAgICAgIG51bWJlcjogbGluZW5vXG4gICAgICAgICAgICBleHQ6ICAgIGV4dFxuXG4gICAgICAgIGNodW5rcyA9IHJlcGxhY2VUYWJzKHRleHQpLnNwbGl0IFNQQUNFXG4gICAgICAgIFxuICAgICAgICBpZiBjaHVua3MubGVuZ3RoID09IDEgYW5kIGNodW5rc1swXSA9PSAnJ1xuICAgICAgICAgICAgcmV0dXJuIGxpbmUgIyBlbXB0eSBsaW5lXG4gICAgICAgICAgICBcbiAgICAgICAgYyA9IDBcbiAgICAgICAgZm9yIHMgaW4gY2h1bmtzXG4gICAgICAgICAgICBpZiBzID09ICcnXG4gICAgICAgICAgICAgICAgYysrXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3MubGVuZ3RoIHRoZW4gYysrXG4gICAgICAgICAgICAgICAgbCA9IHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgc2MgPSBjXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgIyBzZXBlcmF0ZSBieSBwdW5jdHVhdGlvblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHdoaWxlIG0gPSBQVU5DVC5leGVjIHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIG0uaW5kZXggPiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB3bCA9IG0uaW5kZXgtKGMtc2MpXG4gICAgICAgICAgICAgICAgICAgICAgICB3ID0gc1tjLXNjLi4ubS5pbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzLnB1c2ggc3RhcnQ6YywgbGVuZ3RoOndsLCBtYXRjaDp3LCB2YWx1ZTondGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gd2xcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHR1cmQgPSBwdW5jdCA9IG1bMF1cblxuICAgICAgICAgICAgICAgICAgICBwaSA9IDBcbiAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDFcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB3aGlsZSBwaSA8IHB1bmN0Lmxlbmd0aC0xXG4gICAgICAgICAgICAgICAgICAgICAgICBwYyA9IHB1bmN0W3BpXVxuICAgICAgICAgICAgICAgICAgICAgICAgYWR2YW5jZSA9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIDB4RDgwMCA8PSBwdW5jdC5jaGFyQ29kZUF0KHBpKSA8PSAweERCRkYgYW5kIDB4REMwMCA8PSBwdW5jdC5jaGFyQ29kZUF0KHBpKzEpIDw9IDB4REZGRlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkdmFuY2UgPSAyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYyArPSBwdW5jdFtwaSsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgcGkgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6YWR2YW5jZSwgbWF0Y2g6cGMsIHR1cmQ6dHVyZCwgdmFsdWU6dmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGMgKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgdHVyZCA9IHR1cmRbYWR2YW5jZS4uXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIHBpIDwgcHVuY3QubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rcy5wdXNoIHN0YXJ0OmMsIGxlbmd0aDphZHZhbmNlLCBtYXRjaDpwdW5jdFtwaS4uXSwgdmFsdWU6J3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgYyArPSBhZHZhbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgYyA8IHNjK2wgICAgICAgICMgY2hlY2sgZm9yIHJlbWFpbmluZyBub24tcHVuY3RcbiAgICAgICAgICAgICAgICAgICAgcmwgPSBzYytsLWMgICAgIyBsZW5ndGggb2YgcmVtYWluZGVyXG4gICAgICAgICAgICAgICAgICAgIHcgPSBzW2wtcmwuLl0gICMgdGV4dCAgIG9mIHJlbWFpbmRlciBcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3MucHVzaCBzdGFydDpjLCBsZW5ndGg6cmwsIG1hdGNoOncsIHZhbHVlOid0ZXh0J1xuICAgICAgICAgICAgICAgICAgICBjICs9IHJsXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBsaW5lLmNodW5rcy5sZW5ndGhcbiAgICAgICAgICAgIGxhc3QgPSBsaW5lLmNodW5rc1stMV1cbiAgICAgICAgICAgIGxpbmUuY2hhcnMgPSBsYXN0LnN0YXJ0ICsgbGFzdC5sZW5ndGhcbiAgICAgICAgICAgIFxuICAgICAgICBsaW5lXG4gICAgICAgIFxuIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICBcbiMjI1xuICAgICAgICAgIFxuZXh0U3RhY2sgICA9IFtdXG5zdGFjayAgICAgID0gW11cbmhhbmRsICAgICAgPSBbXVxuZXh0VG9wICAgICA9IG51bGxcbnN0YWNrVG9wICAgPSBudWxsXG5ub3RDb2RlICAgID0gZmFsc2UgIyBzaG9ydGN1dCBmb3IgdG9wIG9mIHN0YWNrIG5vdCBpbiBjb2RlVHlwZXNcbnRvcFR5cGUgICAgPSAnJ1xuZXh0ICAgICAgICA9ICcnXG5saW5lICAgICAgID0gbnVsbFxuY2h1bmsgICAgICA9IG51bGxcbmNodW5rSW5kZXggPSAwXG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxuZmlsbENvbW1lbnQgPSAobikgLT5cbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgIGFkZFZhbHVlIGksICdjb21tZW50J1xuICAgIGlmIGNodW5rSW5kZXggPCBsaW5lLmNodW5rcy5sZW5ndGgtblxuICAgICAgICByZXN0Q2h1bmtzID0gbGluZS5jaHVua3NbY2h1bmtJbmRleCtuLi5dXG4gICAgICAgIG1pZ2h0QmVIZWFkZXIgPSB0cnVlXG4gICAgICAgIGZvciBjIGluIHJlc3RDaHVua3NcbiAgICAgICAgICAgIGMudmFsdWUgPSAnY29tbWVudCdcbiAgICAgICAgICAgIGlmIG1pZ2h0QmVIZWFkZXIgYW5kIG5vdCBIRUFERVIudGVzdCBjLm1hdGNoXG4gICAgICAgICAgICAgICAgbWlnaHRCZUhlYWRlciA9IGZhbHNlXG4gICAgICAgIGlmIG1pZ2h0QmVIZWFkZXJcbiAgICAgICAgICAgIGZvciBjIGluIHJlc3RDaHVua3NcbiAgICAgICAgICAgICAgICBjLnZhbHVlICs9ICcgaGVhZGVyJ1xuICAgIGxpbmUuY2h1bmtzLmxlbmd0aCAtIGNodW5rSW5kZXggKyBuXG4gICAgXG5oYXNoQ29tbWVudCA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBzdGFja1RvcCBhbmQgdG9wVHlwZSAhPSAncmVnZXhwIHRyaXBsZSdcbiAgICBpZiBzdGFja1RvcCBhbmQgc3RhY2tUb3AubGluZW5vID09IGxpbmUubnVtYmVyXG4gICAgICAgIHJldHVybiAjIGNvbW1lbnRzIGluc2lkZSB0cmlwbGUgcmVnZXhwIG9ubHkgdmFsaWQgb24gaW50ZXJuYWwgbGluZXM/XG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgZmlsbENvbW1lbnQgMVxuXG5ub29uQ29tbWVudCA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBzdGFja1RvcFxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiIGFuZCBjaHVua0luZGV4ID09IDBcbiAgICAgICAgZmlsbENvbW1lbnQgMVxuICAgIFxuc2xhc2hDb21tZW50ID0gLT5cblxuICAgIHJldHVybiBpZiBzdGFja1RvcFxuICAgIFxuICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGggXCIvL1wiXG4gICAgICAgIGZpbGxDb21tZW50IDJcbiAgICBcbmJsb2NrQ29tbWVudCA9IC0+IFxuICAgIFxuICAgIHJldHVybiBpZiBub3QgY2h1bmsudHVyZCBvciBjaHVuay50dXJkLmxlbmd0aCA8IDNcbiAgICBcbiAgICB0eXBlID0gJ2NvbW1lbnQgdHJpcGxlJ1xuICAgIFxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuICAgIFxuICAgIGlmIGNodW5rLnR1cmRbLi4yXSA9PSAnIyMjJ1xuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgc3Ryb25nOnRydWVcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzIHR5cGUgICAgICAgICAgICBcblxuc3RhckNvbW1lbnQgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmRcbiAgICBcbiAgICB0eXBlID0gJ2NvbW1lbnQgdHJpcGxlJ1xuICAgIFxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlICE9IHR5cGVcbiAgICBcbiAgICBpZiBjaHVuay50dXJkWy4uMV0gPT0gJy8qJyBhbmQgbm90IHRvcFR5cGUgXG4gICAgICAgIHB1c2hTdGFjayB0eXBlOnR5cGUsIHN0cm9uZzp0cnVlICAgICAgICAgICAgICAgIFxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuICAgIGlmIGNodW5rLnR1cmRbLi4xXSA9PSAnKi8nIGFuZCB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgdHlwZVxuICAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG5cbmRhc2hBcnJvdyA9IC0+XG5cbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIG1hcmtGdW5jID0gLT5cbiAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ3RleHQnIFxuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMV0ubWF0Y2ggPT0gJz0nIGFuZCBsaW5lLmNodW5rc1syXS5tYXRjaCAhPSAnPidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1sxXS52YWx1ZSArPSAnIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgZWxzZSBpZiBsaW5lLmNodW5rc1sxXS5tYXRjaCA9PSAnOidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgKz0gJyBtZXRob2QnXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZFxuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZC5zdGFydHNXaXRoICctPidcbiAgICAgICAgICAgIG1hcmtGdW5jKClcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgJ2Z1bmN0aW9uIHRhaWwnXG4gICAgICAgICAgICBhZGRWYWx1ZSAxICdmdW5jdGlvbiBoZWFkJ1xuICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbMF0udmFsdWUgPT0gJ2RpY3Rpb25hcnkga2V5JyBvciBsaW5lLmNodW5rc1swXS50dXJkP1suLjFdID09ICdAOidcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgZWxzZSBpZiBsaW5lLmNodW5rc1swXS5tYXRjaCA9PSAnQCcgYW5kIGxpbmUuY2h1bmtzWzFdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAnbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgICAgIGxpbmUuY2h1bmtzWzJdLnZhbHVlID0gJ3B1bmN0IG1ldGhvZCBjbGFzcydcbiAgICAgICAgICAgIHJldHVybiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQuc3RhcnRzV2l0aCAnPT4nXG4gICAgICAgICAgICBtYXJrRnVuYygpXG4gICAgICAgICAgICBhZGRWYWx1ZSAwICdmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICAgICAgYWRkVmFsdWUgMSAnZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzWzBdLnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1swXS52YWx1ZSA9ICdtZXRob2QnXG4gICAgICAgICAgICAgICAgbGluZS5jaHVua3NbMV0udmFsdWUgPSAncHVuY3QgbWV0aG9kJ1xuICAgICAgICAgICAgcmV0dXJuIDJcbiAgICAgICAgICBcbmNvbW1lbnRIZWFkZXIgPSAtPlxuICAgIFxuICAgIGlmIHRvcFR5cGUgPT0gJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpZiBIRUFERVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnRoaXNDYWxsID0gLT5cbiAgICBcbiAgICBzZXRWYWx1ZSAtMSAnZnVuY3Rpb24gY2FsbCdcbiAgICBpZiBnZXRtYXRjaCgtMikgPT0gJ0AnXG4gICAgICAgIHNldFZhbHVlIC0yICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgIDBcblxuY29mZmVlUHVuY3QgPSAtPlxuXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICAgICAgICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICfilrgnXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdtZXRhJ1xuICAgICAgICBcbiAgICBpZiBjaHVuay50dXJkID09ICd+PidcbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyICdtZXRhJ1xuICAgICAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLnR1cmQ/LnN0YXJ0c1dpdGgoJy4uJykgYW5kIHByZXYubWF0Y2ggIT0gJy4nXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkWzJdICE9ICcuJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAncmFuZ2UnXG4gICAgICAgICAgICBpZiBjaHVuay50dXJkWzNdICE9ICcuJ1xuICAgICAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyAncmFuZ2UnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHByZXYudmFsdWUuc3RhcnRzV2l0aCgndGV4dCcpIG9yIHByZXYudmFsdWUgPT0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHJldkVuZCA9IHByZXYuc3RhcnQrcHJldi5sZW5ndGhcbiAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcoJyBhbmQgcHJldkVuZCA9PSBjaHVuay5zdGFydFxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG4gICAgICAgICAgICBlbHNlIGlmIHByZXZFbmQgPCBjaHVuay5zdGFydCAjIHNwYWNlZFxuICAgICAgICAgICAgICAgIGlmIGNodW5rLm1hdGNoIGluICdAWyh7XCJcXCcnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzQ2FsbCgpXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBjaHVuay5tYXRjaCBpbiAnKy0vJyBcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IG5leHQgb3IgbmV4dC5tYXRjaCAhPSAnPScgYW5kIG5leHQuc3RhcnQgPT0gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDYWxsKClcblxuY29mZmVlV29yZCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBwcmV2LnZhbHVlID09ICdwdW5jdCBtZXRhJ1xuICAgICAgICAgICAgaWYgY2h1bmsuc3RhcnQgPT0gcHJldi5zdGFydCsxXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMCAnbWV0YSdcbiAgICAgICAgICAgICAgICByZXR1cm4gMCAjIGdpdmUgc3dpdGNoIGEgY2hhbmNlXG4gICAgICAgIFxuICAgICAgICBpZiBwcmV2Lm1hdGNoIGluIFsnY2xhc3MnLCAnZXh0ZW5kcyddXG4gICAgICAgICAgICBzZXRWYWx1ZSAwICdjbGFzcydcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay52YWx1ZS5zdGFydHNXaXRoICdrZXl3b3JkJyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiAxICMgd2UgYXJlIGRvbmUgd2l0aCB0aGUga2V5d29yZFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJ0AnXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAndGhpcydcbiAgICAgICAgICAgIGFkZFZhbHVlICAwICd0aGlzJ1xuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICBpZiAocHJldi52YWx1ZS5zdGFydHNXaXRoKCd0ZXh0Jykgb3IgcHJldi52YWx1ZSA9PSAncHJvcGVydHknKSBhbmQgcHJldi5zdGFydCtwcmV2Lmxlbmd0aCA8IGNodW5rLnN0YXJ0ICMgc3BhY2VkXG4gICAgICAgICAgICByZXR1cm4gdGhpc0NhbGwoKVxuICAgICAgICAgICBcbnByb3BlcnR5ID0gLT4gIyB3b3JkXG4gICAgICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuICAgICAgICBcbiAgICAgICAgcHJldlByZXYgPSBnZXRDaHVuayAtMlxuICAgICAgICBcbiAgICAgICAgaWYgcHJldlByZXY/Lm1hdGNoICE9ICcuJ1xuICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgc2V0VmFsdWUgMCAncHJvcGVydHknXG4gICAgICAgICAgICBpZiBwcmV2UHJldlxuICAgICAgICAgICAgICAgIGlmIHByZXZQcmV2LnZhbHVlIG5vdCBpbiBbJ3Byb3BlcnR5JywgJ251bWJlciddIGFuZCBub3QgcHJldlByZXYudmFsdWUuc3RhcnRzV2l0aCAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdvYmonXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbm5vb25Qcm9wID0gLT5cbiAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5zdGFydCtwcmV2Lmxlbmd0aCsxIDwgY2h1bmsuc3RhcnRcbiAgICAgICAgICAgIGlmIHByZXYudmFsdWUgIT0gJ29iaidcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbY2h1bmtJbmRleC0xLi4wXVxuICAgICAgICAgICAgICAgICAgICBpZiBpIDwgY2h1bmtJbmRleC0xIGFuZCBsaW5lLmNodW5rc1tpXS5zdGFydCtsaW5lLmNodW5rc1tpXS5sZW5ndGgrMSA8IGxpbmUuY2h1bmtzW2krMV0uc3RhcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlID09ICd0ZXh0JyBvciBsaW5lLmNodW5rc1tpXS52YWx1ZSA9PSAnb2JqJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbGluZS5jaHVua3NbaV0udmFsdWUgPT0gJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgMFxuXG5ub29uUHVuY3QgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlICMgbWFrZXMgdGhpcyBzZW5zZSBoZXJlID8/P1xuXG4gICAgbm9vblByb3AoKVxuICAgICAgICAgICAgXG5ub29uV29yZCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGUgIyBtYWtlcyB0aGlzIHNlbnNlIGhlcmUgPz8/XG4gICAgXG4gICAgaWYgY2h1bmsuc3RhcnQgPT0gMFxuICAgICAgICBzZXRWYWx1ZSAwICdvYmonXG4gICAgICAgIHJldHVybiAxXG5cbiAgICBub29uUHJvcCgpXG4gICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG51cmxQdW5jdCA9IC0+XG4gICAgXG4gICAgaWYgcHJldiA9IGdldENodW5rIC0xXG4gICAgICAgIGlmIGNodW5rLnR1cmQgPT0gJzovLycgXG4gICAgICAgICAgICBpZiBnZXRtYXRjaCg0KSA9PSAnLicgYW5kIGdldENodW5rKDUpXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgMyAndXJsJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICAzICd1cmwgZG9tYWluJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICA0ICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlICA1ICd1cmwgdGxkJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiA2XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICcuJ1xuICAgICAgICAgICAgaWYgbm90IHByZXYudmFsdWUuc3RhcnRzV2l0aCgnbnVtYmVyJykgYW5kIHByZXYudmFsdWUgIT0gJ3NlbXZlcicgYW5kIHByZXYubWF0Y2ggbm90IGluICdcXFxcLi8nXG4gICAgICAgICAgICAgICAgaWYgbmV4dCA9IGdldENodW5rIDFcbiAgICAgICAgICAgICAgICAgICAgaWYgbmV4dC5zdGFydCA9PSBjaHVuay5zdGFydCtjaHVuay5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVleHQgPSBuZXh0Lm1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBmaWxlZXh0IG5vdCBpbiAnXFxcXC4vJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xIGZpbGVleHQgKyAnIGZpbGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWUgIDAgZmlsZWV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAxIGZpbGVleHQgKyAnIGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBjaHVuay5tYXRjaCA9PSAnLydcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXguLjBdXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0uc3RhcnQrbGluZS5jaHVua3NbaV0ubGVuZ3RoIDwgbGluZS5jaHVua3NbaSsxXT8uc3RhcnQgXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0udmFsdWUuZW5kc1dpdGggJ2RpcidcbiAgICAgICAgICAgICAgICBicmVhayBpZiBsaW5lLmNodW5rc1tpXS52YWx1ZS5zdGFydHNXaXRoICd1cmwnXG4gICAgICAgICAgICAgICAgYnJlYWsgaWYgbGluZS5jaHVua3NbaV0ubWF0Y2ggPT0gJ1wiJ1xuICAgICAgICAgICAgICAgIGlmIGxpbmUuY2h1bmtzW2ldLnZhbHVlLnN0YXJ0c1dpdGggJ3B1bmN0J1xuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS52YWx1ZSA9ICdwdW5jdCBkaXInXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS52YWx1ZSA9ICd0ZXh0IGRpcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgIDBcbiAgICBcbnVybFdvcmQgPSAtPlxuICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICBpZiBwcmV2Lm1hdGNoIGluICdcXFxcLydcbiAgICAgICAgICAgIG5leHQgPSBnZXRDaHVuayAxXG4gICAgICAgICAgICBpZiBub3QgbmV4dCBvciBuZXh0LnN0YXJ0ID4gY2h1bmsuc3RhcnQrY2h1bmsubGVuZ3RoIG9yIG5leHQubWF0Y2ggbm90IGluICdcXFxcLi8nXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCwgJ2ZpbGUnXG4gICAgXG4jICAgICAgIDAwMCAgIDAwMDAwMDAgIFxuIyAgICAgICAwMDAgIDAwMCAgICAgICBcbiMgICAgICAgMDAwICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICBcblxuanNQdW5jdCA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJygnXG4gICAgICAgICAgICBpZiBwcmV2LnZhbHVlLnN0YXJ0c1dpdGgoJ3RleHQnKSBvciBwcmV2LnZhbHVlID09ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG5qc1dvcmQgPSAtPlxuICAgIFxuICAgIGlmIGNodW5rLnZhbHVlID09ICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICBpZiBnZXRtYXRjaCgtMSkgPT0gJz0nIGFuZCBnZXRWYWx1ZSgtMikuc3RhcnRzV2l0aCAndGV4dCdcbiAgICAgICAgICAgIHNldFZhbHVlIC0yICdmdW5jdGlvbidcbiAgICAwICMgd2UgbmVlZCB0aGlzIGhlcmVcbiAgICBcbmRpY3QgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJzonIGFuZCBub3QgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCAnOjonXG4gICAgICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgaWYgcHJldi52YWx1ZS5zcGxpdCgnICcpWzBdIGluIFsnc3RyaW5nJywgJ251bWJlcicsICd0ZXh0JywgJ2tleXdvcmQnXVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4jICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5qc29uUHVuY3QgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBub3RDb2RlXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJzonXG4gICAgICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuICAgICAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnXCInXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gW2NodW5rSW5kZXgtMi4uMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgbGluZS5jaHVua3NbaV0udmFsdWUgPT0gJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lLmNodW5rc1tpXS52YWx1ZSA9ICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgbGluZS5jaHVua3NbaV0udmFsdWUgPSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgICAgICBcbmpzb25Xb3JkID0gLT5cblxuICAgIGlmIHRvcFR5cGUgPT0gJ3N0cmluZyBkb3VibGUnIGFuZCBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgaWYgcHJldi5tYXRjaCBpbiAnXCJeficgXG4gICAgICAgICAgICBpZiBOVU1CRVIudGVzdChnZXRtYXRjaCgwKSkgYW5kIGdldG1hdGNoKDEpID09ICcuJyBhbmQgTlVNQkVSLnRlc3QoZ2V0bWF0Y2goMikpIGFuZCBnZXRtYXRjaCgzKSA9PSAnLicgYW5kIE5VTUJFUi50ZXN0KGdldG1hdGNoKDQpKVxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xICdwdW5jdCBzZW12ZXInIGlmIHByZXYubWF0Y2ggaW4gJ15+J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDAgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAxICdwdW5jdCBzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMiAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIDMgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSA0ICdzZW12ZXInXG4gICAgICAgICAgICAgICAgcmV0dXJuIDVcbiAgICAgICAgICAgICAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG5cbmVzY2FwZSA9IC0+XG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJ1xcXFwnIGFuZCAodG9wVHlwZT8uc3RhcnRzV2l0aCgncmVnZXhwJykgb3IgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJylcbiAgICAgICAgaWYgY2h1bmtJbmRleCA9PSAwIG9yIG5vdCBnZXRDaHVuaygtMSk/LmVzY2FwZVxuICAgICAgICAgICAgaWYgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgICAgICAgICBjaHVuay5lc2NhcGUgPSB0cnVlXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgMCAnZXNjYXBlJ1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja2VkKClcblxucmVnZXhwID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgdG9wVHlwZT8uc3RhcnRzV2l0aCAnc3RyaW5nJ1xuXG4gICAgaWYgZ2V0Q2h1bmsoLTEpPy5lc2NhcGUgdGhlbiByZXR1cm4gc3RhY2tlZCgpXG4gICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggPT0gJy8nXG4gICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09ICdyZWdleHAnXG4gICAgICAgICAgICBjaHVuay52YWx1ZSArPSAnIHJlZ2V4cCBlbmQnXG4gICAgICAgICAgICBwb3BTdGFjaygpXG4gICAgICAgICAgICByZXR1cm4gMVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rSW5kZXggXG4gICAgICAgICAgICBwcmV2ID0gZ2V0Q2h1bmsgLTFcbiAgICAgICAgICAgIG5leHQgPSBnZXRDaHVuayArMVxuICAgICAgICAgICAgaWYgbm90IHByZXYudmFsdWUuc3RhcnRzV2l0aCgncHVuY3QnKSBhbmQgbm90IHByZXYudmFsdWUuc3RhcnRzV2l0aCgna2V5d29yZCcpIG9yIHByZXYubWF0Y2ggaW4gXCIpXVwiXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIChwcmV2LnN0YXJ0K3ByZXYubGVuZ3RoIDwgIGNodW5rLnN0YXJ0KSBhbmQgbmV4dD8uc3RhcnQgPiAgY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgICAgIHJldHVybiBpZiAocHJldi5zdGFydCtwcmV2Lmxlbmd0aCA9PSBjaHVuay5zdGFydCkgYW5kIG5leHQ/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgXG4gICAgICAgICAgICByZXR1cm4gaWYgbmV4dD8ubWF0Y2ggPT0gJz0nXG4gICAgICAgICAgICByZXR1cm4gaWYgcHJldi52YWx1ZS5zdGFydHNXaXRoICdudW1iZXInXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHB1c2hTdGFjayB0eXBlOidyZWdleHAnXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwICdyZWdleHAgc3RhcnQnXG4gICAgICAgIFxuICAgIGVzY2FwZSgpXG4gICAgXG50cmlwbGVSZWdleHAgPSAtPiBcbiAgICBcbiAgICByZXR1cm4gaWYgbm90IGNodW5rLnR1cmQgb3IgY2h1bmsudHVyZC5sZW5ndGggPCAzXG4gICAgXG4gICAgdHlwZSA9ICdyZWdleHAgdHJpcGxlJ1xuICAgIFxuICAgIHJldHVybiBpZiB0b3BUeXBlIGFuZCB0b3BUeXBlIG5vdCBpbiBbJ2ludGVycG9sYXRpb24nLCB0eXBlXVxuICAgIGlmIGNodW5rLnR1cmRbLi4yXSA9PSAnLy8vJ1xuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6dHlwZSwgbGluZW5vOmxpbmUubnVtYmVyXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlICAgXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuc2ltcGxlU3RyaW5nID0gLT5cbiAgICAgICAgXG4gICAgcmV0dXJuIGlmIHRvcFR5cGUgPT0gJ3JlZ2V4cCdcbiAgICAgICAgICAgIFxuICAgIGlmIGdldENodW5rKC0xKT8uZXNjYXBlIHRoZW4gcmV0dXJuIHN0YWNrZWQoKVxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoIGluICdcIlxcJydcbiAgICAgICAgXG4gICAgICAgIHR5cGUgPSBzd2l0Y2ggY2h1bmsubWF0Y2ggXG4gICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZScgXG4gICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgdG9wVHlwZSA9PSB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIGVsc2UgaWYgbm90Q29kZVxuICAgICAgICAgICAgcmV0dXJuIHN0YWNrZWQoKVxuICAgICAgICAgICAgXG4gICAgICAgIHB1c2hTdGFjayBzdHJvbmc6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgIGVzY2FwZSgpXG4gICAgICAgICAgICAgICAgICAgIFxudHJpcGxlU3RyaW5nID0gLT4gXG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdCBjaHVuay50dXJkIG9yIGNodW5rLnR1cmQubGVuZ3RoIDwgM1xuICAgIHJldHVybiBpZiB0b3BUeXBlIGluIFsncmVnZXhwJydzdHJpbmcgc2luZ2xlJydzdHJpbmcgZG91YmxlJ11cbiAgICBcbiAgICBpZiBnZXRDaHVuaygtMSk/LmVzY2FwZSB0aGVuIHJldHVybiBzdGFja2VkKClcbiAgICAgICAgICAgIFxuICAgIHR5cGUgPSBzd2l0Y2ggY2h1bmsudHVyZFsuLjJdXG4gICAgICAgIHdoZW4gJ1wiXCJcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSB0cmlwbGUnIFxuICAgICAgICB3aGVuIFwiJycnXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG5cbiAgICBpZiB0eXBlXG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgdHlwZSAhPSB0b3BUeXBlIGFuZCB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcnXG4gICAgICAgIFxuICAgICAgICBpZiB0b3BUeXBlID09IHR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgcHVzaFN0YWNrIHN0cm9uZzp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG4gICAgICAgIFxuICAgIGVzY2FwZSgpXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbm51bWJlciA9IC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIG5vdENvZGVcbiAgICBcbiAgICBpZiBOVU1CRVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICBcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtNCkgPT0gJ251bWJlciBmbG9hdCcgYW5kIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC01ICdwdW5jdCBzZW12ZXInIGlmIGdldG1hdGNoKC01KSBpbiAnXn4nXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTQgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMyAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdzZW12ZXInXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgYWRkVmFsdWUgLTEgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAgMCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgY2h1bmsudmFsdWUgPSAnbnVtYmVyJ1xuICAgICAgICByZXR1cm4gMVxuICAgICAgICBcbiAgICBpZiBIRVhOVU0udGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgXG4gICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBoZXgnXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcblxuZmxvYXQgPSAtPlxuICAgIFxuICAgIGlmIEZMT0FULnRlc3QgY2h1bmsubWF0Y2hcbiAgICAgICAgaWYgZ2V0bWF0Y2goLTEpID09ICcuJ1xuXG4gICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGNodW5rLnZhbHVlID0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgcmV0dXJuIDFcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuXG5jc3NXb3JkID0gLT5cbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaFstMi4uXSBpbiBbJ3B4JydlbScnZXgnXSBhbmQgTlVNQkVSLnRlc3QgY2h1bmsubWF0Y2hbLi4uLTJdXG4gICAgICAgIHNldFZhbHVlIDAgJ251bWJlcidcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2hbLTEuLl0gaW4gWydzJ10gYW5kIE5VTUJFUi50ZXN0IGNodW5rLm1hdGNoWy4uLi0xXVxuICAgICAgICBzZXRWYWx1ZSAwICdudW1iZXInXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuICAgIGlmIHByZXYgPSBnZXRDaHVuayAtMVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gJy4nXG4gICAgICAgICAgICBhZGRWYWx1ZSAtMSAnY2xhc3MnXG4gICAgICAgICAgICBzZXRWYWx1ZSAgMCAnY2xhc3MnXG4gICAgICAgICAgICByZXR1cm4gMVxuXG4gICAgICAgIGlmIHByZXYubWF0Y2ggPT0gXCIjXCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgY2h1bmsubWF0Y2gubGVuZ3RoID09IDMgb3IgY2h1bmsubWF0Y2gubGVuZ3RoID09IDZcbiAgICAgICAgICAgICAgICBpZiBIRVgudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgICAgICBhZGRWYWx1ZSAtMSAnbnVtYmVyIGhleCdcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgIDAgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFkZFZhbHVlIC0xICdmdW5jdGlvbidcbiAgICAgICAgICAgIHNldFZhbHVlICAwICdmdW5jdGlvbidcbiAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgcHJldi5tYXRjaCA9PSAnLSdcbiAgICAgICAgICAgIGlmIHByZXZQcmV2ID0gZ2V0Q2h1bmsgLTJcbiAgICAgICAgICAgICAgICBpZiBwcmV2UHJldi52YWx1ZSBpbiBbJ2NsYXNzJydmdW5jdGlvbiddXG4gICAgICAgICAgICAgICAgICAgIGFkZFZhbHVlIC0xIHByZXZQcmV2LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlICAwIHByZXZQcmV2LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAxXG4gICAgICAgIFxuIyAwMCAgICAgMDAgIDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG5tZFB1bmN0ID0gLT5cbiAgICBcbiAgICBpZiBjaHVua0luZGV4ID09IDAgXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgY2h1bmsudHVyZCBhbmQgY2h1bmsubWF0Y2ggaW4gJy0qJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID4gY2h1bmsuc3RhcnQrMVxuICAgICAgICAgICAgdHlwZSA9IFsnbGkxJydsaTInJ2xpMyddW2NodW5rLnN0YXJ0LzRdXG4gICAgICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSBmaWxsOnRydWUgdHlwZTp0eXBlXG4gICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCB0eXBlICsgJyBtYXJrZXInXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsubWF0Y2ggPT0gJyMnXG4gICAgICAgICAgICBpZiBub3QgY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMSdcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWUgMCAnaDEnXG4gICAgICAgICAgICBzd2l0Y2ggY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgIHdoZW4gJyMjJyBcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2gyJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDIgJ2gyJ1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIycgXG4gICAgICAgICAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIGZpbGw6dHJ1ZSB0eXBlOidoMydcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAzICdoMydcbiAgICAgICAgICAgICAgICB3aGVuICcjIyMjJyBcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2g0J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDQgJ2g0J1xuICAgICAgICAgICAgICAgIHdoZW4gJyMjIyMjJyBcbiAgICAgICAgICAgICAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgZmlsbDp0cnVlIHR5cGU6J2g1J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDUgJ2g1J1xuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICcqJ1xuICAgICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZD9bLi4xXSA9PSAnKionXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGUgPSAnYm9sZCdcbiAgICAgICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgICAgICBhZGRWYWx1ZXMgMiB0b3BUeXBlXG4gICAgICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgICAgIHJldHVybiAyXG5cbiAgICAgICAgICAgIHR5cGUgPSBzdGFja1RvcC50eXBlICsgJyAnICsgdHlwZSBpZiBzdGFja1RvcD8ubWVyZ2VcbiAgICAgICAgICAgIHB1c2hTdGFjayBtZXJnZTp0cnVlIHR5cGU6dHlwZVxuICAgICAgICAgICAgcmV0dXJuIGFkZFZhbHVlcyAyIHR5cGVcbiAgICAgICAgXG4gICAgICAgIHR5cGUgPSAnaXRhbGljJ1xuICAgICAgICBpZiB0b3BUeXBlPy5lbmRzV2l0aCB0eXBlXG4gICAgICAgICAgICBhZGRWYWx1ZSAwIHRvcFR5cGVcbiAgICAgICAgICAgIHBvcFN0YWNrKClcbiAgICAgICAgICAgIHJldHVybiAxXG5cbiAgICAgICAgdHlwZSA9IHN0YWNrVG9wLnR5cGUgKyAnICcgKyB0eXBlIGlmIHN0YWNrVG9wPy5tZXJnZVxuICAgICAgICBwdXNoU3RhY2sgbWVyZ2U6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgYWRkVmFsdWUgMCB0eXBlXG4gICAgICAgIHJldHVybiAxXG4gICAgICAgICAgICAgICAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnYCdcbiAgICAgIFxuICAgICAgICBpZiBjaHVuay50dXJkP1suLjJdID09ICdgYGAnXG5cbiAgICAgICAgICAgIHR5cGUgPSAnY29kZSB0cmlwbGUnXG5cbiAgICAgICAgICAgIGlmIGdldG1hdGNoKDMpIGluIFsnY29mZmVlc2NyaXB0JydqYXZhc2NyaXB0JydqcyddXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgMyAnY29tbWVudCdcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkVmFsdWVzIDMgdHlwZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcHVzaFN0YWNrIHdlYWs6dHJ1ZSB0eXBlOnR5cGVcbiAgICAgICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMyB0eXBlXG4gICAgICAgIFxuICAgICAgICB0eXBlID0gJ2NvZGUnXG4gICAgICAgIGlmIHRvcFR5cGU/LmVuZHNXaXRoIHR5cGVcbiAgICAgICAgICAgIGFkZFZhbHVlIDAgdG9wVHlwZVxuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgICAgIFxuICAgICAgICB0eXBlID0gc3RhY2tUb3AudHlwZSArICcgJyArIHR5cGUgaWYgc3RhY2tUb3A/Lm1lcmdlXG5cbiAgICAgICAgcHVzaFN0YWNrIG1lcmdlOnRydWUgdHlwZTp0eXBlXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZSAwIHR5cGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgXG4jIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwIFxuXG5pbnRlcnBvbGF0aW9uID0gLT5cbiAgICBcbiAgICBpZiB0b3BUeXBlPy5zdGFydHNXaXRoICdzdHJpbmcgZG91YmxlJ1xuICAgICBcbiAgICAgICAgaWYgY2h1bmsudHVyZD8uc3RhcnRzV2l0aCBcIlxcI3tcIlxuICAgICAgICAgICAgcHVzaFN0YWNrIHR5cGU6J2ludGVycG9sYXRpb24nLCB3ZWFrOnRydWVcbiAgICAgICAgICAgIHNldFZhbHVlIDAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICAgICAgc2V0VmFsdWUgMSAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgICAgICByZXR1cm4gMlxuXG4gICAgZWxzZSBpZiB0b3BUeXBlID09ICdpbnRlcnBvbGF0aW9uJ1xuICAgICAgICAgXG4gICAgICAgIGlmIGNodW5rLm1hdGNoID09ICd9J1xuICAgICAgICAgICAgc2V0VmFsdWUgMCAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gZW5kJ1xuICAgICAgICAgICAgcG9wU3RhY2soKVxuICAgICAgICAgICAgcmV0dXJuIDFcbiAgICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5rZXl3b3JkID0gLT5cbiAgICBcbiAgICByZXR1cm4gaWYgbm90Q29kZVxuICAgIFxuICAgIGlmIG5vdCBsYW5nW2V4dF1cbiAgICAgICAgIyBsb2cgXCJubyBsYW5nIGZvciBleHQ/ICN7ZXh0fVwiXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIGlmIGxhbmdbZXh0XS5oYXNPd25Qcm9wZXJ0eShjaHVuay5tYXRjaCkgXG4gICAgICAgIGNodW5rLnZhbHVlID0gbGFuZ1tleHRdW2NodW5rLm1hdGNoXVxuICAgICAgICByZXR1cm4gIyBnaXZlIGNvZmZlZUZ1bmMgYSBjaGFuY2UsIG51bWJlciBiYWlscyBmb3IgdXNcbiAgICAgICAgICAgICAgICBcbiMgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMCAgICAgIFxuIyAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICBcbiMgIDAwMCAwMDAgICAwMDAgMCAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbnhtbFB1bmN0ID0gLT4gXG4gICAgXG4gICAgaWYgY2h1bmsudHVyZCA9PSAnPC8nXG4gICAgICAgIHJldHVybiBhZGRWYWx1ZXMgMiAna2V5d29yZCdcbiAgICAgICAgXG4gICAgaWYgY2h1bmsubWF0Y2ggaW4gWyc8Jyc+J11cbiAgICAgICAgcmV0dXJuIGFkZFZhbHVlIDAgJ2tleXdvcmQnXG4gICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuXG5jcHBNYWNybyA9IC0+IFxuICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09IFwiI1wiXG4gICAgICAgIGFkZFZhbHVlIDAgJ2RlZmluZSdcbiAgICAgICAgc2V0VmFsdWUgMSAnZGVmaW5lJ1xuICAgICAgICByZXR1cm4gMlxuXG4jICAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgMDAwMDAwMDAwXG4jICAgICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgIDAwMFxuXG5zaFB1bmN0ID0gLT5cbiAgICBcbiAgICBpZiBjaHVuay5tYXRjaCA9PSAnLycgYW5kIGdldENodW5rKC0xKT8uc3RhcnQgKyBnZXRDaHVuaygtMSk/Lmxlbmd0aCA9PSBjaHVuay5zdGFydFxuICAgICAgICByZXR1cm4gYWRkVmFsdWUgLTEgJ2RpcidcbiAgICBcbiAgICBpZiBjaHVuay50dXJkID09ICctLScgYW5kIGdldENodW5rKDIpPy5zdGFydCA9PSBjaHVuay5zdGFydCsyXG4gICAgICAgIGFkZFZhbHVlIDAgJ2FyZ3VtZW50J1xuICAgICAgICBhZGRWYWx1ZSAxICdhcmd1bWVudCdcbiAgICAgICAgc2V0VmFsdWUgMiAnYXJndW1lbnQnXG4gICAgICAgIHJldHVybiAzXG4gICAgICAgIFxuICAgIGlmIGNodW5rLm1hdGNoID09ICctJyBhbmQgZ2V0Q2h1bmsoMSk/LnN0YXJ0ID09IGNodW5rLnN0YXJ0KzFcbiAgICAgICAgYWRkVmFsdWUgMCAnYXJndW1lbnQnXG4gICAgICAgIHNldFZhbHVlIDEgJ2FyZ3VtZW50J1xuICAgICAgICByZXR1cm4gMlxuICAgICAgICAgICAgICAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwIFxuIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICBcbiMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgXG4jIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuXG5zdGFja2VkID0gLT5cblxuICAgIGlmIHN0YWNrVG9wXG4gICAgICAgIHJldHVybiBpZiBzdGFja1RvcC53ZWFrXG4gICAgICAgIGlmIHN0YWNrVG9wLnN0cm9uZ1xuICAgICAgICAgICAgY2h1bmsudmFsdWUgPSB0b3BUeXBlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNodW5rLnZhbHVlICs9ICcgJyArIHRvcFR5cGVcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgICBcbnB1c2hFeHQgPSAobXRjaCkgLT5cbiAgICBleHRUb3AgPSBzd2l0Y2g6bXRjaCwgc3RhcnQ6bGluZSwgc3RhY2s6c3RhY2tcbiAgICBleHRTdGFjay5wdXNoIGV4dFRvcFxuICAgIFxuYWN0RXh0ID0gLT5cbiAgICBzdGFjayAgICA9IFtdXG4gICAgc3RhY2tUb3AgPSBudWxsXG4gICAgdG9wVHlwZSAgPSAnJ1xuICAgIG5vdENvZGUgID0gZmFsc2VcbiAgICBcbnBvcEV4dCA9IC0+XG4gICAgc3RhY2sgPSBleHRUb3Auc3RhY2tcbiAgICBsaW5lLmV4dCA9IGV4dFRvcC5zdGFydC5leHRcbiAgICBleHRTdGFjay5wb3AoKSAgICAgICAgICAgICAgIFxuICAgIGV4dFRvcCA9IGV4dFN0YWNrWy0xXVxuICAgIFxuICAgIHN0YWNrVG9wID0gc3RhY2tbLTFdXG4gICAgdG9wVHlwZSA9IHN0YWNrVG9wPy50eXBlXG4gICAgbm90Q29kZSA9IHN0YWNrVG9wIGFuZCB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcbiAgICBcbnB1c2hTdGFjayA9IChvKSAtPiBcbiAgICBzdGFjay5wdXNoIG8gXG4gICAgc3RhY2tUb3AgPSBvXG4gICAgdG9wVHlwZSA9IG8udHlwZVxuICAgIG5vdENvZGUgPSB0b3BUeXBlIG5vdCBpbiBjb2RlVHlwZXNcbiAgICBcbnBvcFN0YWNrID0gLT4gXG4gICAgc3RhY2sucG9wKClcbiAgICBzdGFja1RvcCA9IHN0YWNrWy0xXVxuICAgIHRvcFR5cGUgPSBzdGFja1RvcD8udHlwZVxuICAgIG5vdENvZGUgPSBzdGFja1RvcCBhbmQgdG9wVHlwZSBub3QgaW4gY29kZVR5cGVzXG4gICAgXG5nZXRDaHVuayA9IChkKSAtPiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdXG5zZXRWYWx1ZSA9IChkLCB2YWx1ZSkgLT4gaWYgMCA8PSBjaHVua0luZGV4K2QgPCBsaW5lLmNodW5rcy5sZW5ndGggdGhlbiBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlID0gdmFsdWVcbmdldFZhbHVlID0gKGQpIC0+IGdldENodW5rKGQpPy52YWx1ZSA/ICcnXG5nZXRtYXRjaCA9IChkKSAtPiBnZXRDaHVuayhkKT8ubWF0Y2ggPyAnJ1xuYWRkVmFsdWUgPSAoZCwgdmFsdWUpIC0+IFxuICAgIGlmIDAgPD0gY2h1bmtJbmRleCtkIDwgbGluZS5jaHVua3MubGVuZ3RoIFxuICAgICAgICBsaW5lLmNodW5rc1tjaHVua0luZGV4K2RdLnZhbHVlICs9ICcgJyArIHZhbHVlXG4gICAgMVxuICAgICAgICBcbmFkZFZhbHVlcyA9IChuLHZhbHVlKSAtPiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgIGFkZFZhbHVlIGksIHZhbHVlXG4gICAgblxuICAgIFxuaGFuZGxlcnMgPSBcbiAgICBjb2ZmZWU6IFxuICAgICAgICAgIHB1bmN0OlsgYmxvY2tDb21tZW50LCBoYXNoQ29tbWVudCwgdHJpcGxlUmVnZXhwLCBjb2ZmZWVQdW5jdCwgdHJpcGxlU3RyaW5nLCBzaW1wbGVTdHJpbmcsIGludGVycG9sYXRpb24sIGRhc2hBcnJvdywgcmVnZXhwLCBkaWN0IF1cbiAgICAgICAgICB3b3JkOiBbIGtleXdvcmQsIGNvZmZlZVdvcmQsIG51bWJlciwgcHJvcGVydHkgXVxuICAgIG5vb246IHB1bmN0Olsgbm9vbkNvbW1lbnQsICBub29uUHVuY3QsIHVybFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIG5vb25Xb3JkLCB1cmxXb3JkLCBudW1iZXIgICAgICAgICAgXVxuICAgIGpzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIGpzUHVuY3QsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIGRpY3QgXSwgd29yZDpbIGtleXdvcmQsIGpzV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSAgXVxuICAgIHRzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIGpzUHVuY3QsIHNpbXBsZVN0cmluZywgZGFzaEFycm93LCByZWdleHAsIGRpY3QgXSwgd29yZDpbIGtleXdvcmQsIGpzV29yZCwgbnVtYmVyLCBwcm9wZXJ0eSAgXVxuICAgIGlzczogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGluaTogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbICAgICAgICAgIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGNwcDogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQgICAgICAgICAgICAgXVxuICAgIGhwcDogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQgICAgICAgICAgICAgXVxuICAgIGM6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQgICAgICAgICAgICAgXVxuICAgIGg6ICAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZywgY3BwTWFjcm8gICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciwgZmxvYXQgICAgICAgICAgICAgXVxuICAgIGNzOiAgIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIHB1ZzogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIHN0eWw6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIGNzczogIHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIHNhc3M6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIHNjc3M6IHB1bmN0Olsgc3RhckNvbW1lbnQsICBzbGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGNzc1dvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIHN2ZzogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGh0bWw6IHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGh0bTogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHhtbFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIHNoOiAgIHB1bmN0OlsgaGFzaENvbW1lbnQsICBzaW1wbGVTdHJpbmcsIHVybFB1bmN0LCBzaFB1bmN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgXVxuICAgIGpzb246IHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIGpzb25QdW5jdCwgdXJsUHVuY3QgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIGpzb25Xb3JkLCB1cmxXb3JkLCBudW1iZXIgXVxuICAgIGxvZzogIHB1bmN0OlsgICAgICAgICAgICAgICBzaW1wbGVTdHJpbmcsIHVybFB1bmN0LCBkaWN0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIG1kOiAgIHB1bmN0OlsgICAgICAgICAgICAgICAgICAgIG1kUHVuY3QsIHVybFB1bmN0LCB4bWxQdW5jdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIHVybFdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIGZpc2g6IHB1bmN0OlsgICAgICAgICAgICAgICAgaGFzaENvbW1lbnQsIHNpbXBsZVN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSwgd29yZDpbIGtleXdvcmQsIG51bWJlciAgICAgICAgICAgICAgICAgICAgXVxuICAgIFxuZm9yIGV4dCBpbiBleHRzXG4gICAgaWYgbm90IGhhbmRsZXJzW2V4dF0/XG4gICAgICAgIGhhbmRsZXJzW2V4dF0gPSBwdW5jdDpbIHNpbXBsZVN0cmluZyBdLCB3b3JkOlsgbnVtYmVyIF1cbiAgICAgICAgXG5mb3IgZXh0LG9iaiBvZiBoYW5kbGVyc1xuICAgIGhhbmRsZXJzW2V4dF0ucHVuY3QucHVzaCBzdGFja2VkXG4gICAgaGFuZGxlcnNbZXh0XS53b3JkLnB1c2ggc3RhY2tlZFxuICAgIFxuIyMjXG4wMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxu4pa4ZG9jICdibG9ja2VkIGxpbmVzJ1xuICAgIFxuICAgIGxpbmVzOiBhcnJheSBvZiBjaHVua2VkIGxpbmVzXG4gICAgXG4gICAgcmV0dXJucyBsaW5lcyB3aXRoIFxuICAgIC0gJ2V4dCcgc3dpdGNoZWQgaW4gc29tZSBsaW5lc1xuICAgIC0gJ3ZhbHVlJyBjaGFuZ2VkIGluIGNodW5rcyB0aGF0IG1hdGNoIGxhbmd1YWdlIHBhdHRlcm5zXG5cbmJsb2NrZWQgPSAobGluZXMpIC0+XG4gICAgXG4gICAgZXh0U3RhY2sgICA9IFtdXG4gICAgc3RhY2sgICAgICA9IFtdXG4gICAgaGFuZGwgICAgICA9IFtdXG4gICAgZXh0VG9wICAgICA9IG51bGxcbiAgICBzdGFja1RvcCAgID0gbnVsbFxuICAgIG5vdENvZGUgICAgPSBmYWxzZSAjIHNob3J0Y3V0IGZvciB0b3Agb2Ygc3RhY2sgbm90IGluIGNvZGVUeXBlc1xuICAgIHRvcFR5cGUgICAgPSAnJ1xuICAgIGV4dCAgICAgICAgPSAnJ1xuICAgIGxpbmUgICAgICAgPSBudWxsXG4gICAgY2h1bmsgICAgICA9IG51bGxcbiAgICBjaHVua0luZGV4ID0gMFxuICAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBmb3IgbGluZSBpbiBsaW5lc1xuXG4gICAgICAgIGlmIHN0YWNrVG9wXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHN0YWNrVG9wLnR5cGUgPT0gJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG1pZ2h0QmVIZWFkZXIgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm9yIGNodW5rIGluIGxpbmUuY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBIRUFERVIudGVzdCBjaHVuay5tYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgbWlnaHRCZUhlYWRlciA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGlmIG1pZ2h0QmVIZWFkZXJcbiAgICAgICAgICAgICAgICAgICAgZm9yIGNodW5rIGluIGxpbmUuY2h1bmtzXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVuay52YWx1ZSA9ICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgc3RhY2tUb3AuZmlsbCB0aGVuIHBvcFN0YWNrKClcbiAgICAgICAgXG4gICAgICAgIGlmIGV4dFRvcFxuICAgICAgICAgICAgaWYgZXh0VG9wLnN3aXRjaC5pbmRlbnQgYW5kIGxpbmUuY2h1bmtzWzBdPy5zdGFydCA8PSBleHRUb3Auc3RhcnQuY2h1bmtzWzBdLnN0YXJ0XG4gICAgICAgICAgICAgICAgcG9wRXh0KCkgICAgICAgICAgICAgICAgICAgICAgICAjIGVuZCBvZiBleHRlbnNpb24gYmxvY2sgcmVhY2hlZCB0aGF0IGlzIHRlcm1pbmF0ZWQgYnkgaW5kZW50YXRpb25cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBsaW5lLmV4dCA9IGV4dFRvcC5zd2l0Y2gudG8gICAgICMgbWFrZSBzdXJlIHRoZSBjdXJyZW50IGxpbmUgZXh0IG1hdGNoZXMgdGhlIHRvcG1vc3QgZnJvbSBzdGFja1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBleHQgIT0gbGluZS5leHQgICAgICAgICAgICAgICAgICAgICAgIyBlaXRoZXIgYXQgc3RhcnQgb2YgZmlsZSBvciB3ZSBzd2l0Y2hlZCBleHRlbnNpb25cbiAgICAgICAgICAgIGFjdEV4dCgpXG4gICAgICAgICAgICBoYW5kbCA9IGhhbmRsZXJzW2V4dCA9IGxpbmUuZXh0XSAgICAjIGluc3RhbGwgbmV3IGhhbmRsZXJzXG4gICAgICAgICAgICBpZiBub3QgaGFuZGxcbiAgICAgICAgICAgICAgICDilrhkYmcgbGluZVxuICAgICAgICAgICAgICAgIOKWuGRiZyBoYW5kbGVyc1xuICAgICAgICAgICAg4pa4YXNzZXJ0IGhhbmRsXG4gICAgICAgICAgICBcbiAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIFxuICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4gICAgICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICAgICBcbiAgICAgICAgY2h1bmtJbmRleCA9IDBcbiAgICAgICAgd2hpbGUgY2h1bmtJbmRleCA8IGxpbmUuY2h1bmtzLmxlbmd0aFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaHVuayA9IGxpbmUuY2h1bmtzW2NodW5rSW5kZXhdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGJlZm9yZUluZGV4ID0gY2h1bmtJbmRleFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBjaHVuay52YWx1ZSA9PSAncHVuY3QnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgZXh0VG9wXG4gICAgICAgICAgICAgICAgICAgIGlmIGV4dFRvcC5zd2l0Y2guZW5kPyBhbmQgZXh0VG9wLnN3aXRjaC5lbmQgPT0gY2h1bmsudHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkVmFsdWVzIGNodW5rLnR1cmQubGVuZ3RoLCBleHRUb3Auc3dpdGNoLmFkZCBpZiBleHRUb3Auc3dpdGNoLmFkZFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9wRXh0KCkgIyBlbmQgb2YgZXh0ZW5zaW9uIGJsb2NrIHJlYWNoZWQgdGhhdCBpcyB0ZXJtaW5hdGVkIGJ5IHR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBobmQgaW4gaGFuZGwucHVuY3QgPyBbXVxuICAgICAgICAgICAgICAgICAgICBpZiBhZHZhbmNlID0gaG5kKClcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSW5kZXggKz0gYWR2YW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSAjIHdvcmRzLCBudW1iZXJzXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgbm90IG5vdENvZGVcbiAgICAgICAgICAgICAgICAgICAgaWYgbXRjaCA9IHN3dGNoW2xpbmUuZXh0XT9bY2h1bmsubWF0Y2hdIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaC50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHVyZENodW5rID0gZ2V0Q2h1bmsgLW10Y2gudHVyZC5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBtdGNoLnR1cmQgPT0gKHR1cmRDaHVuaz8udHVyZCA/IHR1cmRDaHVuaz8ubWF0Y2gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgcHVzaCBhIG5ldyBleHRlbnNpb24gb250byB0aGUgc3RhY2ssIGV4dCB3aWxsIGNoYW5nZSBvbiBzdGFydCBvZiBuZXh0IGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVzaEV4dCBtdGNoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGhuZCBpbiBoYW5kbC53b3JkID8gW11cbiAgICAgICAgICAgICAgICAgICAgaWYgYWR2YW5jZSA9IGhuZCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaHVua0luZGV4ICs9IGFkdmFuY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIGNodW5rSW5kZXggPT0gYmVmb3JlSW5kZXhcbiAgICAgICAgICAgICAgICBjaHVua0luZGV4KytcbiAgICBsaW5lc1xuXG5wYWQgPSAobCkgLT5cbiAgICBzID0gJydcbiAgICB3aGlsZSBsID4gMFxuICAgICAgICBzICs9ICcgJ1xuICAgICAgICBsLS1cbiAgICBzXG4gICAgXG5yZXBsYWNlVGFicyA9IChzKSAtPlxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IHMubGVuZ3RoXG4gICAgICAgIGlmIHNbaV0gPT0gJ1xcdCdcbiAgICAgICAgICAgIHMgPSBzLnNwbGljZSBpLCAxLCBwYWQgNC0oaSU0KVxuICAgICAgICBpICs9IDFcbiAgICBzXG4gICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxucGFyc2UgPSAobGluZXMsIGV4dD0nY29mZmVlJykgLT4gYmxvY2tlZCBjaHVua2VkIGxpbmVzLCBleHRcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIFxuICAgIGtvbG9yOiAgIHJlcXVpcmUgJy4va29sb3InXG4gICAgZXh0czogICAgZXh0c1xuICAgIHBhcnNlOiAgIHBhcnNlXG4gICAgY2h1bmtlZDogY2h1bmtlZFxuICAgIHJhbmdlczogIChsaW5lLCBleHQ9J2NvZmZlZScpICAtPiBwYXJzZShbbGluZV0sIGV4dClbMF0uY2h1bmtzXG4gICAgZGlzc2VjdDogKGxpbmVzLCBleHQ9J2NvZmZlZScpIC0+IHBhcnNlKGxpbmVzLCBleHQpLm1hcCAobCkgLT4gbC5jaHVua3NcbiAgICBcbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbuKWuHRlc3QgJ3Byb2ZpbGUnXG4gICAgXG4gICAgdGV4dDAgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS8uLi8uLi9rb2ZmZWUvY29mZmVlL25vZGVzLmNvZmZlZVwiXG4gICAgdGV4dDEgPSBzbGFzaC5yZWFkVGV4dCBcIiN7X19kaXJuYW1lfS90ZXN0LmNvZmZlZVwiXG5cbiAgICDilrhhdmVyYWdlIDJcbiAgICAgICAgbGluZXMwID0gdGV4dDAuc3BsaXQgJ1xcbidcbiAgICDilrhhdmVyYWdlIDJcbiAgICAgICAgbGluZXMxID0gdGV4dDEuc3BsaXQgJ1xcbidcblxuICAgIGZvciBpIGluIFswLi41XVxuICAgICAgICBwYXJzZSBsaW5lczBcbiAgICAgICAgXG4gICAg4pa4YXZlcmFnZSA1MFxuICAgICAgICBwYXJzZSBsaW5lczBcbiAgICAgIl19
//# sourceURL=../coffee/klor.coffee