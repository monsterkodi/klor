// koffee 0.45.0

/*
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000
 */
var Blocks, blocks, dissect, inc, nut, ranges;

Blocks = require('./blocks');

require('kxk').chai();

inc = function(rgs, start, match, value) {
    return rgs.should.deep.include({
        start: start,
        match: match,
        value: value
    });
};

nut = function(rgs, start, match, value) {
    return rgs.should.not.deep.include({
        start: start,
        match: match,
        value: value
    });
};

blocks = Blocks.blocks;

ranges = Blocks.ranges;

dissect = Blocks.dissect;


/*
00000000    0000000   000   000   0000000   00000000   0000000  
000   000  000   000  0000  000  000        000       000       
0000000    000000000  000 0 000  000  0000  0000000   0000000   
000   000  000   000  000  0000  000   000  000            000  
000   000  000   000  000   000   0000000   00000000  0000000
 */

describe('ranges', function() {
    it('regexp', function() {
        var rgs;
        rgs = ranges("r=/a/", 'coffee');
        inc(rgs, 2, '/', 'punct regexp start');
        inc(rgs, 3, 'a', 'text regexp');
        inc(rgs, 4, '/', 'punct regexp end');
        rgs = ranges("/(a|.*|\s\d\w\S\W$|^\s+)/", 'coffee');
        inc(rgs, 0, '/', 'punct regexp start');
        inc(rgs, 2, 'a', 'text regexp');
        rgs = ranges("/^#include/", 'coffee');
        inc(rgs, 0, '/', 'punct regexp start');
        inc(rgs, 2, "#", 'punct regexp');
        inc(rgs, 3, "include", 'text regexp');
        rgs = ranges("/\\'hello\\'/ ", 'coffee');
        inc(rgs, 0, '/', 'punct regexp start');
        inc(rgs, 1, "\\", 'punct escape regexp');
        inc(rgs, 2, "'", 'punct regexp');
        inc(rgs, 3, "hello", 'text regexp');
        rgs = ranges("f a /b - c/gi", 'coffee');
        inc(rgs, 4, '/', 'punct regexp start');
        inc(rgs, 5, 'b', 'text regexp');
        inc(rgs, 10, '/', 'punct regexp end');
        rgs = ranges("w=l.split /[\\s\\/]/ ; bla");
        inc(rgs, 10, '/', 'punct regexp start');
        inc(rgs, 14, '\\', 'punct escape regexp');
        inc(rgs, 17, '/', 'punct regexp end');
        inc(rgs, 19, ';', 'punct');
        rgs = ranges("a = 1 / 2");
        inc(rgs, 6, '/', 'punct');
        inc(rgs, 8, '2', 'number');
        rgs = ranges("(1+1) / 2");
        inc(rgs, 6, '/', 'punct');
        inc(rgs, 8, '2', 'number');
        rgs = ranges("a[10] / 2");
        inc(rgs, 6, '/', 'punct');
        return inc(rgs, 8, '2', 'number');
    });
    it('triple regexp', function() {
        var dss, rgs;
        rgs = ranges("///a///", 'coffee');
        inc(rgs, 0, "/", 'punct regexp triple');
        inc(rgs, 1, "/", 'punct regexp triple');
        inc(rgs, 2, "/", 'punct regexp triple');
        inc(rgs, 3, "a", 'text regexp triple');
        inc(rgs, 4, "/", 'punct regexp triple');
        inc(rgs, 5, "/", 'punct regexp triple');
        inc(rgs, 6, "/", 'punct regexp triple');
        dss = Blocks.dissect("///\na\n///".split('\n'), 'coffee');
        inc(dss[0], 0, "/", 'punct regexp triple');
        inc(dss[0], 1, "/", 'punct regexp triple');
        inc(dss[0], 2, "/", 'punct regexp triple');
        inc(dss[1], 0, "a", 'text regexp triple');
        inc(dss[2], 0, "/", 'punct regexp triple');
        inc(dss[2], 1, "/", 'punct regexp triple');
        inc(dss[2], 2, "/", 'punct regexp triple');
        dss = Blocks.dissect("///\n    ([\\\\?]) # comment\n///".split('\n'), 'coffee');
        inc(dss[0], 0, "/", 'punct regexp triple');
        inc(dss[0], 1, "/", 'punct regexp triple');
        inc(dss[0], 2, "/", 'punct regexp triple');
        inc(dss[1], 4, "(", 'punct regexp triple');
        inc(dss[1], 6, "\\", 'punct escape regexp triple');
        inc(dss[1], 12, "#", 'punct comment');
        inc(dss[1], 14, "comment", 'comment');
        inc(dss[2], 0, "/", 'punct regexp triple');
        inc(dss[2], 1, "/", 'punct regexp triple');
        return inc(dss[2], 2, "/", 'punct regexp triple');
    });
    it('no regexp', function() {
        var rgs;
        rgs = ranges('a / b - c / d', 'coffee');
        nut(rgs, 2, '/', 'punct regexp');
        rgs = ranges('f a/b, c/d', 'coffee');
        nut(rgs, 3, '/', 'punct regexp');
        rgs = ranges("m = '/'", 'coffee');
        nut(rgs, 5, '/', 'punct regexp');
        rgs = ranges("m a, '/''/'", 'coffee');
        nut(rgs, 6, '/', 'punct regexp');
        rgs = ranges("\"m = '/'\"", 'coffee');
        nut(rgs, 6, '/', 'punct regexp');
        rgs = ranges("s = '/some\\path/file.txt:10'", 'coffee');
        nut(rgs, 5, '/', 'punct regexp');
        return nut(rgs, 9, '/', 'punct regexp');
    });
    it('require', function() {
        var rgs;
        rgs = ranges("util = require 'util'", 'coffee');
        return inc(rgs, 7, 'require', 'require');
    });
    it('comments', function() {
        var j, len, results, rgs, rng;
        rgs = ranges("hello # world", 'coffee');
        inc(rgs, 6, "#", 'punct comment');
        inc(rgs, 8, "world", 'comment');
        rgs = ranges("   # bla blub", 'noon');
        inc(rgs, 3, "#", 'punct comment');
        inc(rgs, 5, "bla", 'comment');
        inc(rgs, 9, "blub", 'comment');
        rgs = ranges("(^\s*#\s*)(.*)$", 'noon');
        results = [];
        for (j = 0, len = rgs.length; j < len; j++) {
            rng = rgs[j];
            results.push(rng.should.not.have.property('value', 'comment'));
        }
        return results;
    });
    it('triple comment', function() {
        var dss, rgs;
        rgs = ranges("###a###", 'coffee');
        inc(rgs, 0, "#", 'punct comment triple');
        inc(rgs, 1, "#", 'punct comment triple');
        inc(rgs, 2, "#", 'punct comment triple');
        inc(rgs, 3, "a", 'comment triple');
        inc(rgs, 4, "#", 'punct comment triple');
        inc(rgs, 5, "#", 'punct comment triple');
        inc(rgs, 6, "#", 'punct comment triple');
        dss = Blocks.dissect("###\na\n###".split('\n'), 'coffee');
        inc(dss[0], 0, "#", 'punct comment triple');
        inc(dss[0], 1, "#", 'punct comment triple');
        inc(dss[0], 2, "#", 'punct comment triple');
        inc(dss[1], 0, "a", 'comment triple');
        inc(dss[2], 0, "#", 'punct comment triple');
        inc(dss[2], 1, "#", 'punct comment triple');
        inc(dss[2], 2, "#", 'punct comment triple');
        dss = Blocks.dissect("/*\na\n*/".split('\n'), 'styl');
        inc(dss[0], 0, "/", 'punct comment triple');
        inc(dss[0], 1, "*", 'punct comment triple');
        inc(dss[1], 0, "a", 'comment triple');
        inc(dss[2], 0, "*", 'punct comment triple');
        return inc(dss[2], 1, "/", 'punct comment triple');
    });
    it('comment header', function() {
        var dss, rgs;
        rgs = ranges("# 0 00 0000", 'coffee');
        inc(rgs, 0, "#", 'punct comment');
        inc(rgs, 2, "0", 'comment header');
        inc(rgs, 4, "00", 'comment header');
        inc(rgs, 7, "0000", 'comment header');
        dss = Blocks.dissect("###\n 0 00 0 \n###".split('\n'), 'coffee');
        inc(dss[1], 1, "0", 'comment triple header');
        rgs = ranges("// 000", 'styl');
        inc(rgs, 3, "000", 'comment header');
        dss = Blocks.dissect("/*\n 0 0 0 \n*/".split('\n'), 'styl');
        return inc(dss[1], 1, "0", 'comment triple header');
    });
    it('numbers', function() {
        var rgs;
        rgs = ranges("a 6670");
        inc(rgs, 2, "6670", 'number');
        rgs = ranges("0x667AC");
        inc(rgs, 0, "0x667AC", 'number hex');
        rgs = ranges("66.700");
        inc(rgs, 0, "66", 'number float');
        inc(rgs, 2, ".", 'punct number float');
        inc(rgs, 3, "700", 'number float');
        rgs = ranges("77.800 -100");
        inc(rgs, 0, "77", 'number float');
        inc(rgs, 8, "100", 'number');
        rgs = ranges("(8.9,100.2)");
        inc(rgs, 3, "9", 'number float');
        return inc(rgs, 9, "2", 'number float');
    });
    it('semver', function() {
        var rgs;
        rgs = ranges("66.70.0");
        inc(rgs, 0, "66", 'semver');
        inc(rgs, 2, ".", 'punct semver');
        inc(rgs, 3, "70", 'semver');
        inc(rgs, 5, ".", 'punct semver');
        inc(rgs, 6, "0", 'semver');
        rgs = ranges("^0.7.1");
        inc(rgs, 1, "0", 'semver');
        inc(rgs, 3, "7", 'semver');
        inc(rgs, 5, "1", 'semver');
        rgs = ranges("^1.0.0-alpha.12");
        inc(rgs, 1, "1", 'semver');
        inc(rgs, 3, "0", 'semver');
        return inc(rgs, 5, "0", 'semver');
    });
    it('strings', function() {
        var i, j, k, l, len, len1, len2, ref, ref1, ref2, rgs;
        rgs = ranges("a=\"\\\"E\\\"\" ");
        inc(rgs, 2, '"', 'punct string double');
        inc(rgs, 4, '"', 'string double');
        inc(rgs, 5, 'E', 'string double');
        inc(rgs, 8, '"', 'punct string double');
        rgs = ranges('a="\'X\'"');
        inc(rgs, 2, '"', 'punct string double');
        inc(rgs, 3, "'", 'string double');
        inc(rgs, 4, "X", 'string double');
        inc(rgs, 6, '"', 'punct string double');
        rgs = ranges('a=\'"X"\'', 'coffee');
        inc(rgs, 2, "'", 'punct string single');
        inc(rgs, 3, '"', 'string single');
        inc(rgs, 4, 'X', 'string single');
        inc(rgs, 6, "'", 'punct string single');
        rgs = ranges('a=`"X"`');
        inc(rgs, 2, "`", 'punct string backtick');
        inc(rgs, 3, '"', 'string backtick');
        inc(rgs, 4, 'X', 'string backtick');
        inc(rgs, 6, "`", 'punct string backtick');
        rgs = ranges('a="  \'X\'  Y  " ');
        inc(rgs, 2, '"', 'punct string double');
        inc(rgs, 5, "'", 'string double');
        inc(rgs, 6, "X", 'string double');
        inc(rgs, 7, "'", 'string double');
        inc(rgs, 13, '"', 'punct string double');
        rgs = ranges('a="";b=" ";c="X"');
        ref = [2, 3, 7, 9, 13, 15];
        for (j = 0, len = ref.length; j < len; j++) {
            i = ref[j];
            inc(rgs, i, '"', 'punct string double');
        }
        inc(rgs, 14, 'X', 'string double');
        rgs = ranges("a='';b=' ';c='Y'", 'coffee');
        ref1 = [2, 3, 7, 9, 13, 15];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
            i = ref1[k];
            inc(rgs, i, "'", 'punct string single');
        }
        inc(rgs, 14, 'Y', 'string single');
        rgs = ranges("a=``;b=` `;c=`Z`");
        ref2 = [2, 3, 7, 9, 13, 15];
        for (l = 0, len2 = ref2.length; l < len2; l++) {
            i = ref2[l];
            inc(rgs, i, "`", 'punct string backtick');
        }
        inc(rgs, 14, 'Z', 'string backtick');
        rgs = ranges('"s = \'/some\\path/file.txt:10\'"');
        inc(rgs, 5, "'", 'string double');
        inc(rgs, 17, "file", 'string double');
        inc(rgs, 21, ".", 'string double');
        inc(rgs, 22, "txt", 'string double');
        inc(rgs, 26, "10", 'string double');
        inc(rgs, 28, "'", 'string double');
        inc(rgs, 29, '"', 'punct string double');
        rgs = ranges('when \'"""\' then \'string double triple\'');
        inc(rgs, 6, '"', 'string single');
        inc(rgs, 7, '"', 'string single');
        inc(rgs, 8, '"', 'string single');
        rgs = ranges("'''when\\''''");
        inc(rgs, 3, "when", 'string single triple');
        inc(rgs, 8, "'", 'string single triple');
        return inc(rgs, 11, "'", 'punct string single triple');
    });
    it('interpolation', function() {
        var rgs;
        rgs = ranges('"#{xxx}"', 'coffee');
        inc(rgs, 0, '"', 'punct string double');
        inc(rgs, 3, 'xxx', 'text');
        inc(rgs, 7, '"', 'punct string double');
        rgs = ranges('"#{666}"', 'coffee');
        inc(rgs, 0, '"', 'punct string double');
        inc(rgs, 3, '666', 'number');
        return inc(rgs, 7, '"', 'punct string double');
    });
    it('md', function() {
        var dss, rgs;
        rgs = ranges("**bold**", 'md');
        inc(rgs, 0, '*', 'punct bold');
        inc(rgs, 1, '*', 'punct bold');
        inc(rgs, 2, 'bold', 'text bold');
        inc(rgs, 6, '*', 'punct bold');
        inc(rgs, 7, '*', 'punct bold');
        rgs = ranges("*it lic*", 'md');
        inc(rgs, 0, '*', 'punct italic');
        inc(rgs, 1, 'it', 'text italic');
        inc(rgs, 4, 'lic', 'text italic');
        inc(rgs, 7, '*', 'punct italic');
        rgs = ranges("*italic*", 'md');
        inc(rgs, 0, '*', 'punct italic');
        inc(rgs, 1, 'italic', 'text italic');
        inc(rgs, 7, '*', 'punct italic');
        rgs = ranges("*`italic code`*", 'md');
        inc(rgs, 0, '*', 'punct italic');
        inc(rgs, 1, '`', 'punct italic code');
        inc(rgs, 2, 'italic', 'text italic code');
        inc(rgs, 9, 'code', 'text italic code');
        inc(rgs, 14, '*', 'punct italic');
        rgs = ranges("it's good", 'md');
        inc(rgs, 0, 'it', 'text');
        inc(rgs, 2, "'", 'punct');
        inc(rgs, 3, 's', 'text');
        rgs = ranges("if is empty in then", 'md');
        inc(rgs, 0, 'if', 'text');
        inc(rgs, 3, 'is', 'text');
        inc(rgs, 6, 'empty', 'text');
        inc(rgs, 12, 'in', 'text');
        inc(rgs, 15, 'then', 'text');
        dss = Blocks.dissect(["▸doc 'md'", "    if is empty in then"], 'coffee');
        inc(dss[1], 4, 'if', 'text');
        inc(dss[1], 7, 'is', 'text');
        inc(dss[1], 10, 'empty', 'text');
        inc(dss[1], 16, 'in', 'text');
        return inc(dss[1], 19, 'then', 'text');
    });
    it('coffee', function() {
        var rgs;
        rgs = ranges("class Macro extends Command", 'coffee');
        inc(rgs, 0, 'class', 'keyword');
        inc(rgs, 6, 'Macro', 'class');
        inc(rgs, 12, 'extends', 'keyword');
        inc(rgs, 20, 'Command', 'class');
        rgs = ranges("exist?.prop", 'coffee');
        inc(rgs, 7, 'prop', 'property');
        rgs = ranges("@height/2 + @height/6", 'coffee');
        inc(rgs, 8, "2", 'number');
        rgs = ranges("a and b", 'coffee');
        inc(rgs, 0, "a", 'text');
        inc(rgs, 2, "and", 'keyword');
        rgs = ranges("if a then b", 'coffee');
        inc(rgs, 0, "if", 'keyword');
        inc(rgs, 3, "a", 'text');
        inc(rgs, 5, "then", 'keyword');
        inc(rgs, 10, "b", 'text');
        rgs = ranges("switch a", 'coffee');
        inc(rgs, 0, "switch", 'keyword');
        rgs = ranges(" a: b", 'coffee');
        inc(rgs, 1, "a", 'dictionary key');
        inc(rgs, 2, ":", 'punct dictionary');
        rgs = ranges("obj.value = obj.another.value", 'coffee');
        inc(rgs, 0, "obj", 'obj');
        inc(rgs, 4, "value", 'property');
        inc(rgs, 12, "obj", 'obj');
        inc(rgs, 16, "another", 'property');
        inc(rgs, 24, "value", 'property');
        rgs = ranges("if someObject.someProp", 'coffee');
        inc(rgs, 0, "if", 'keyword');
        inc(rgs, 3, "someObject", 'obj');
        inc(rgs, 13, ".", 'punct property');
        inc(rgs, 14, "someProp", 'property');
        rgs = ranges("1 'a'", 'coffee');
        inc(rgs, 0, "1", 'number');
        rgs = ranges("a[0].prop", 'coffee');
        inc(rgs, 3, ']', 'punct');
        rgs = ranges("[ f ]", 'coffee');
        inc(rgs, 2, 'f', 'text');
        rgs = ranges("[ f , f ]", 'coffee');
        inc(rgs, 2, 'f', 'text');
        rgs = ranges("a[...2]", 'coffee');
        inc(rgs, 2, '.', 'punct range');
        inc(rgs, 3, '.', 'punct range');
        inc(rgs, 4, '.', 'punct range');
        rgs = ranges("a[ -1 .. ]", 'coffee');
        inc(rgs, 6, '.', 'punct range');
        inc(rgs, 7, '.', 'punct range');
        rgs = ranges("a[1..n]", 'coffee');
        inc(rgs, 3, '.', 'punct range');
        inc(rgs, 4, '.', 'punct range');
        rgs = ranges("a[ .... ]", 'coffee');
        inc(rgs, 3, '.', 'punct');
        inc(rgs, 4, '.', 'punct');
        inc(rgs, 5, '.', 'punct');
        return inc(rgs, 6, '.', 'punct');
    });
    it('coffee function', function() {
        var rgs;
        rgs = ranges("fff 1", 'coffee');
        inc(rgs, 0, "fff", 'function call');
        rgs = ranges("f 'a'", 'coffee');
        inc(rgs, 0, "f", 'function call');
        rgs = ranges("ff 'b'", 'coffee');
        inc(rgs, 0, "ff", 'function call');
        rgs = ranges("ffff -1", 'coffee');
        inc(rgs, 0, "ffff", 'function call');
        rgs = ranges("f [1]", 'coffee');
        inc(rgs, 0, "f", 'function call');
        rgs = ranges("fffff {1}", 'coffee');
        inc(rgs, 0, "fffff", 'function call');
        rgs = ranges("i ++a");
        inc(rgs, 0, 'i', 'function call');
        rgs = ranges("i +4");
        inc(rgs, 0, 'i', 'function call');
        rgs = ranges("i -4");
        inc(rgs, 0, 'i', 'function call');
        rgs = ranges("pos= (item, p) -> ", 'coffee');
        inc(rgs, 0, "pos", 'function');
        rgs = ranges("i != false");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i += 1");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i -= 1");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i *= 1");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i /= 1");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i ? false");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i < 3");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i > 3");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i + 3");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i - 3");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i * 3");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i / 3");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i % 3");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i = 3");
        inc(rgs, 0, 'i', 'text');
        rgs = ranges("i == 3");
        return inc(rgs, 0, 'i', 'text');
    });
    it('coffee method', function() {
        var rgs;
        rgs = ranges(" a: =>", 'coffee');
        inc(rgs, 1, "a", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "=", 'punct function bound tail');
        inc(rgs, 5, ">", 'punct function bound head');
        rgs = ranges(" a: ->", 'coffee');
        inc(rgs, 1, "a", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "-", 'punct function tail');
        inc(rgs, 5, ">", 'punct function head');
        rgs = ranges("mthd:  (arg)    => @member memarg", 'coffee');
        inc(rgs, 0, 'mthd', 'method');
        inc(rgs, 4, ':', 'punct method');
        inc(rgs, 16, '=', 'punct function bound tail');
        return inc(rgs, 17, '>', 'punct function bound head');
    });
    it('koffee', function() {
        var rgs;
        rgs = ranges(" @: ->", 'coffee');
        inc(rgs, 1, "@", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "-", 'punct function tail');
        inc(rgs, 5, ">", 'punct function head');
        rgs = ranges("▸if ▸then ▸elif ▸else", 'coffee');
        inc(rgs, 0, "▸", 'punct meta');
        inc(rgs, 1, "if", 'meta');
        inc(rgs, 4, "▸", 'punct meta');
        inc(rgs, 5, "then", 'meta');
        inc(rgs, 10, "▸", 'punct meta');
        inc(rgs, 11, "elif", 'meta');
        inc(rgs, 16, "▸", 'punct meta');
        inc(rgs, 17, "else", 'meta');
        rgs = ranges("[1 'x' a:1 c:d]", 'coffee');
        inc(rgs, 1, "1", 'number');
        inc(rgs, 4, "x", 'string single');
        inc(rgs, 7, "a", 'dictionary key');
        return inc(rgs, 11, "c", 'dictionary key');
    });
    it('punct', function() {
        var rgs;
        rgs = ranges('/some\\path/file.txt:10', 'noon');
        inc(rgs, 0, '/', 'punct');
        inc(rgs, 5, '\\', 'punct');
        inc(rgs, 15, '.', 'punct');
        return inc(rgs, 19, ':', 'punct');
    });
    it('html', function() {
        var rgs;
        rgs = ranges("</div>", 'html');
        inc(rgs, 0, "<", 'punct keyword');
        inc(rgs, 1, "/", 'punct keyword');
        inc(rgs, 2, "div", 'keyword');
        inc(rgs, 5, ">", 'punct keyword');
        rgs = ranges("<div>", 'html');
        inc(rgs, 0, "<", 'punct keyword');
        inc(rgs, 1, "div", 'keyword');
        return inc(rgs, 4, ">", 'punct keyword');
    });
    it('cpp', function() {
        var rgs;
        rgs = ranges("#include", 'cpp');
        inc(rgs, 0, "#", 'punct define');
        inc(rgs, 1, "include", 'define');
        rgs = ranges("#if", 'cpp');
        inc(rgs, 0, "#", 'punct define');
        inc(rgs, 1, "if", 'define');
        rgs = ranges("#  if", 'cpp');
        inc(rgs, 0, "#", 'punct define');
        inc(rgs, 3, "if", 'define');
        rgs = ranges("if (true) {} else {}", 'cpp');
        inc(rgs, 0, "if", 'keyword');
        inc(rgs, 4, "true", 'keyword');
        inc(rgs, 13, "else", 'keyword');
        rgs = ranges("1.0f", 'cpp');
        inc(rgs, 0, "1", 'number float');
        inc(rgs, 1, ".", 'punct number float');
        inc(rgs, 2, "0f", 'number float');
        rgs = ranges("0.0000f", 'cpp');
        return inc(rgs, 2, "0000f", 'number float');
    });
    it('js', function() {
        var rgs;
        rgs = ranges("func = function() {", 'js');
        inc(rgs, 0, 'func', 'function');
        return inc(rgs, 7, 'function', 'keyword function');
    });
    it('sh', function() {
        var rgs;
        rgs = ranges("dir/path/with/dashes/file.txt", 'sh');
        inc(rgs, 0, 'dir', 'text dir');
        inc(rgs, 4, 'path', 'text dir');
        inc(rgs, 9, 'with', 'text dir');
        inc(rgs, 14, 'dashes', 'text dir');
        rgs = ranges("prg --arg1 -arg2", 'sh');
        inc(rgs, 4, '-', 'punct argument');
        inc(rgs, 5, '-', 'punct argument');
        inc(rgs, 6, 'arg1', 'argument');
        inc(rgs, 11, '-', 'punct argument');
        return inc(rgs, 12, 'arg2', 'argument');
    });
    it('log', function() {});
    return it('noon', function() {});
});


/*
0000000    000       0000000    0000000  000   000   0000000  
000   000  000      000   000  000       000  000   000       
0000000    000      000   000  000       0000000    0000000   
000   000  000      000   000  000       000  000        000  
0000000    0000000   0000000    0000000  000   000  0000000
 */

describe('blocks', function() {
    it('comment', function() {
        blocks(["##"]).should.eql([
            {
                ext: 'coffee',
                chars: 2,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: "#",
                        value: 'punct comment',
                        turd: "##"
                    }, {
                        start: 1,
                        length: 1,
                        match: "#",
                        value: 'comment'
                    }
                ]
            }
        ]);
        return blocks([",#a"]).should.eql([
            {
                ext: 'coffee',
                chars: 3,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: ",",
                        value: 'punct',
                        turd: ",#"
                    }, {
                        start: 1,
                        length: 1,
                        match: "#",
                        value: 'punct comment'
                    }, {
                        start: 2,
                        length: 1,
                        match: "a",
                        value: 'comment'
                    }
                ]
            }
        ]);
    });
    it('function', function() {
        blocks(['->']).should.eql([
            {
                ext: 'coffee',
                chars: 2,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: '-',
                        value: 'punct function tail',
                        turd: '->'
                    }, {
                        start: 1,
                        length: 1,
                        match: '>',
                        value: 'punct function head'
                    }
                ]
            }
        ]);
        blocks(['=>']).should.eql([
            {
                ext: 'coffee',
                chars: 2,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: '=',
                        value: 'punct function bound tail',
                        turd: '=>'
                    }, {
                        start: 1,
                        length: 1,
                        match: '>',
                        value: 'punct function bound head'
                    }
                ]
            }
        ]);
        return blocks(['f=->1']).should.eql([
            {
                ext: 'coffee',
                chars: 5,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: 'f',
                        value: 'function'
                    }, {
                        start: 1,
                        length: 1,
                        match: '=',
                        value: 'punct function',
                        turd: '=->'
                    }, {
                        start: 2,
                        length: 1,
                        match: '-',
                        value: 'punct function tail',
                        turd: '->'
                    }, {
                        start: 3,
                        length: 1,
                        match: '>',
                        value: 'punct function head'
                    }, {
                        start: 4,
                        length: 1,
                        match: '1',
                        value: 'number'
                    }
                ]
            }
        ]);
    });
    it('minimal', function() {
        blocks(['1']).should.eql([
            {
                ext: 'coffee',
                chars: 1,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: '1',
                        value: 'number'
                    }
                ]
            }
        ]);
        blocks(['a']).should.eql([
            {
                ext: 'coffee',
                chars: 1,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: 'a',
                        value: 'text'
                    }
                ]
            }
        ]);
        blocks(['.']).should.eql([
            {
                ext: 'coffee',
                chars: 1,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: '.',
                        value: 'punct'
                    }
                ]
            }
        ]);
        blocks(['1.a']).should.eql([
            {
                ext: 'coffee',
                chars: 3,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: '1',
                        value: 'number'
                    }, {
                        start: 1,
                        length: 1,
                        match: '.',
                        value: 'punct property'
                    }, {
                        start: 2,
                        length: 1,
                        match: 'a',
                        value: 'property'
                    }
                ]
            }
        ]);
        blocks(['++a']).should.eql([
            {
                ext: 'coffee',
                chars: 3,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: '+',
                        value: 'punct',
                        turd: '++'
                    }, {
                        start: 1,
                        length: 1,
                        match: '+',
                        value: 'punct'
                    }, {
                        start: 2,
                        length: 1,
                        match: 'a',
                        value: 'text'
                    }
                ]
            }
        ]);
        return blocks(["▸doc 'hello'"]).should.eql([
            {
                ext: 'coffee',
                chars: 12,
                index: 0,
                number: 1,
                chunks: [
                    {
                        start: 0,
                        length: 1,
                        match: '▸',
                        value: 'punct meta'
                    }, {
                        start: 1,
                        length: 3,
                        match: 'doc',
                        value: 'meta'
                    }, {
                        start: 5,
                        length: 1,
                        match: "'",
                        value: 'punct string single'
                    }, {
                        start: 6,
                        length: 5,
                        match: "hello",
                        value: 'string single'
                    }, {
                        start: 11,
                        length: 1,
                        match: "'",
                        value: 'punct string single'
                    }
                ]
            }
        ]);
    });
    it('space', function() {
        var b;
        b = blocks(["x"]);
        b[0].chunks[0].should.include.property('start', 0);
        b = blocks([" xx"]);
        b[0].chunks[0].should.include.property('start', 1);
        b = blocks(["    xxx"]);
        b[0].chunks[0].should.include.property('start', 4);
        b = blocks(["    x 1  , "]);
        b[0].chunks[0].should.include.property('start', 4);
        b[0].chunks[1].should.include.property('start', 6);
        return b[0].chunks[2].should.include.property('start', 9);
    });
    return it('switches', function() {
        var b;
        b = blocks("▸doc 'hello'\n    x    \n    y\nif 1 then false".split('\n'));
        b[0].should.include.property('ext', 'coffee');
        b[1].should.include.property('ext', 'md');
        b[2].should.include.property('ext', 'md');
        b[3].should.include.property('ext', 'coffee');
        b = blocks("▸doc 'hello'\n    x  \n    ```coffeescript\n        1+1\n    ```\n    y\n1".split('\n'));
        b[0].should.include.property('ext', 'coffee');
        b[1].should.include.property('ext', 'md');
        b[2].should.include.property('ext', 'md');
        b[3].should.include.property('ext', 'coffee');
        b[4].should.include.property('ext', 'md');
        b[5].should.include.property('ext', 'md');
        b[6].should.include.property('ext', 'coffee');
        b = blocks("▸doc 'hello'                  \n    x                         \n    ```coffeescript           \n        1+1                   \n        ▸doc 'again'          \n            some **docs**     \n    ```                       \n    y                         \n1".split('\n'));
        b[0].should.include.property('ext', 'coffee');
        b[1].should.include.property('ext', 'md');
        b[2].should.include.property('ext', 'md');
        b[3].should.include.property('ext', 'coffee');
        b[4].should.include.property('ext', 'coffee');
        b[5].should.include.property('ext', 'md');
        b[6].should.include.property('ext', 'md');
        b[7].should.include.property('ext', 'md');
        b[8].should.include.property('ext', 'coffee');
        b = blocks("▸dooc 'hello'\n    x  ".split('\n'));
        b[0].should.include.property('ext', 'coffee');
        b[1].should.include.property('ext', 'coffee');
        b = blocks("```coffeescript\n    1+1\n```\n```javascript\n    1+1;\n```".split('\n'), 'md');
        b[0].should.include.property('ext', 'md');
        b[1].should.include.property('ext', 'coffee');
        b[2].should.include.property('ext', 'md');
        b[3].should.include.property('ext', 'md');
        return b[4].should.include.property('ext', 'js');
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULE9BQUEsQ0FBUSxLQUFSLENBQWMsQ0FBQyxJQUFmLENBQUE7O0FBRUEsR0FBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCO1dBQThCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQWhCLENBQTRCO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsS0FBQSxFQUFNLEtBQWhDO0tBQTVCO0FBQTlCOztBQUNOLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixLQUFwQjtXQUE4QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBcEIsQ0FBNEI7UUFBQSxLQUFBLEVBQU0sS0FBTjtRQUFhLEtBQUEsRUFBTSxLQUFuQjtRQUEwQixLQUFBLEVBQU0sS0FBaEM7S0FBNUI7QUFBOUI7O0FBRU4sTUFBQSxHQUFVLE1BQU0sQ0FBQzs7QUFDakIsTUFBQSxHQUFVLE1BQU0sQ0FBQzs7QUFDakIsT0FBQSxHQUFVLE1BQU0sQ0FBQzs7O0FBRWpCOzs7Ozs7OztBQVFBLFFBQUEsQ0FBUyxRQUFULEVBQWtCLFNBQUE7SUFRZCxFQUFBLENBQUcsUUFBSCxFQUFZLFNBQUE7QUFDUixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxPQUFQLEVBQWUsUUFBZjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBcUIsb0JBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFxQixhQUFyQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBcUIsa0JBQXJCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTywyQkFBUCxFQUFtQyxRQUFuQztRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBcUIsb0JBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFxQixhQUFyQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sYUFBUCxFQUFxQixRQUFyQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBcUIsb0JBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFxQixjQUFyQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLFNBQVgsRUFBcUIsYUFBckI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLGdCQUFQLEVBQXdCLFFBQXhCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFxQixvQkFBckI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxJQUFYLEVBQXFCLHFCQUFyQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBcUIsY0FBckI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxPQUFYLEVBQXFCLGFBQXJCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxlQUFQLEVBQXVCLFFBQXZCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFxQixvQkFBckI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQXFCLGFBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksR0FBWixFQUFxQixrQkFBckI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLDRCQUFQO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksR0FBWixFQUFzQixvQkFBdEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxJQUFaLEVBQXNCLHFCQUF0QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEdBQVosRUFBc0Isa0JBQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksR0FBWixFQUFzQixPQUF0QjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sV0FBUDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZ0IsT0FBaEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWdCLFFBQWhCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxXQUFQO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFnQixPQUFoQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZ0IsUUFBaEI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFdBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWdCLE9BQWhCO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFnQixRQUFoQjtJQTFDUSxDQUFaO0lBa0RBLEVBQUEsQ0FBRyxlQUFILEVBQW1CLFNBQUE7QUFFZixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxTQUFQLEVBQWlCLFFBQWpCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLHFCQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLHFCQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLHFCQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLG9CQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLHFCQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLHFCQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLHFCQUFmO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxPQUFQLENBQWUsYUFBYSxDQUFDLEtBQWQsQ0FBb0IsSUFBcEIsQ0FBZixFQUEwQyxRQUExQztRQUNOLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFjLEdBQWQsRUFBa0IscUJBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFaLEVBQWMsR0FBZCxFQUFrQixxQkFBbEI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBYyxHQUFkLEVBQWtCLHFCQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFjLEdBQWQsRUFBa0Isb0JBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFaLEVBQWMsR0FBZCxFQUFrQixxQkFBbEI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBYyxHQUFkLEVBQWtCLHFCQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFjLEdBQWQsRUFBa0IscUJBQWxCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxPQUFQLENBQWUsbUNBSWQsQ0FBQyxLQUphLENBSVAsSUFKTyxDQUFmLEVBSWUsUUFKZjtRQUtOLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFlLEdBQWYsRUFBb0IscUJBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFaLEVBQWUsR0FBZixFQUFvQixxQkFBcEI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBZSxHQUFmLEVBQW9CLHFCQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFlLEdBQWYsRUFBb0IscUJBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFaLEVBQWUsSUFBZixFQUFvQiw0QkFBcEI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLEVBQVosRUFBZSxHQUFmLEVBQW9CLGVBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxFQUFaLEVBQWUsU0FBZixFQUF5QixTQUF6QjtRQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFlLEdBQWYsRUFBb0IscUJBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFaLEVBQWUsR0FBZixFQUFvQixxQkFBcEI7ZUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBZSxHQUFmLEVBQW9CLHFCQUFwQjtJQWxDZSxDQUFuQjtJQTBDQSxFQUFBLENBQUcsV0FBSCxFQUFlLFNBQUE7QUFLWCxZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxlQUFQLEVBQXVCLFFBQXZCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLGNBQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFlBQVAsRUFBb0IsUUFBcEI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsY0FBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sU0FBUCxFQUFpQixRQUFqQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxjQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxhQUFQLEVBQXFCLFFBQXJCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLGNBQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLGFBQVAsRUFBeUIsUUFBekI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsY0FBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sK0JBQVAsRUFBdUMsUUFBdkM7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsY0FBZjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxjQUFmO0lBdEJXLENBQWY7SUE4QkEsRUFBQSxDQUFHLFNBQUgsRUFBYSxTQUFBO0FBRVQsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFBLENBQU8sdUJBQVAsRUFBK0IsUUFBL0I7ZUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxTQUFYLEVBQXFCLFNBQXJCO0lBSFMsQ0FBYjtJQVdBLEVBQUEsQ0FBRyxVQUFILEVBQWMsU0FBQTtBQUVWLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBQSxDQUFPLGVBQVAsRUFBdUIsUUFBdkI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWtCLGVBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsT0FBWCxFQUFtQixTQUFuQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sZUFBUCxFQUF1QixNQUF2QjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBbUIsZUFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxLQUFYLEVBQW1CLFNBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsTUFBWCxFQUFtQixTQUFuQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8saUJBQVAsRUFBeUIsTUFBekI7QUFDTjthQUFBLHFDQUFBOzt5QkFDSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBcEIsQ0FBNkIsT0FBN0IsRUFBcUMsU0FBckM7QUFESjs7SUFaVSxDQUFkO0lBZUEsRUFBQSxDQUFHLGdCQUFILEVBQW9CLFNBQUE7QUFFaEIsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFBLENBQU8sU0FBUCxFQUFpQixRQUFqQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxzQkFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxzQkFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxzQkFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxnQkFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxzQkFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxzQkFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxzQkFBZjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsT0FBUCxDQUFlLGFBQWEsQ0FBQyxLQUFkLENBQW9CLElBQXBCLENBQWYsRUFBMEMsUUFBMUM7UUFDTixHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBYyxHQUFkLEVBQWtCLHNCQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFjLEdBQWQsRUFBa0Isc0JBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFaLEVBQWMsR0FBZCxFQUFrQixzQkFBbEI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBYyxHQUFkLEVBQWtCLGdCQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFjLEdBQWQsRUFBa0Isc0JBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFaLEVBQWMsR0FBZCxFQUFrQixzQkFBbEI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBYyxHQUFkLEVBQWtCLHNCQUFsQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsT0FBUCxDQUFlLFdBQVcsQ0FBQyxLQUFaLENBQWtCLElBQWxCLENBQWYsRUFBd0MsTUFBeEM7UUFDTixHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBYyxHQUFkLEVBQWtCLHNCQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFjLEdBQWQsRUFBa0Isc0JBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFaLEVBQWMsR0FBZCxFQUFrQixnQkFBbEI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBYyxHQUFkLEVBQWtCLHNCQUFsQjtlQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFjLEdBQWQsRUFBa0Isc0JBQWxCO0lBekJnQixDQUFwQjtJQTJCQSxFQUFBLENBQUcsZ0JBQUgsRUFBb0IsU0FBQTtBQUVoQixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxhQUFQLEVBQXFCLFFBQXJCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFtQixlQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIsZ0JBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksSUFBWixFQUFtQixnQkFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxNQUFaLEVBQW1CLGdCQUFuQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsT0FBUCxDQUFlLG9CQUFvQixDQUFDLEtBQXJCLENBQTJCLElBQTNCLENBQWYsRUFBaUQsUUFBakQ7UUFDTixHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBYyxHQUFkLEVBQWtCLHVCQUFsQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sUUFBUCxFQUFnQixNQUFoQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEtBQVosRUFBcUIsZ0JBQXJCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxPQUFQLENBQWUsaUJBQWlCLENBQUMsS0FBbEIsQ0FBd0IsSUFBeEIsQ0FBZixFQUE4QyxNQUE5QztlQUNOLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFjLEdBQWQsRUFBa0IsdUJBQWxCO0lBZmdCLENBQXBCO0lBdUJBLEVBQUEsQ0FBRyxTQUFILEVBQWEsU0FBQTtBQUVULFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFFBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxNQUFYLEVBQWtCLFFBQWxCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxTQUFQO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsU0FBWCxFQUFxQixZQUFyQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sUUFBUDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLElBQVgsRUFBaUIsY0FBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWlCLG9CQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEtBQVgsRUFBaUIsY0FBakI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLGFBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxJQUFYLEVBQWlCLGNBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsS0FBWCxFQUFpQixRQUFqQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sYUFBUDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxjQUFmO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLGNBQWY7SUFuQlMsQ0FBYjtJQTJCQSxFQUFBLENBQUcsUUFBSCxFQUFZLFNBQUE7QUFFUixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxTQUFQO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsSUFBWCxFQUFnQixRQUFoQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZ0IsY0FBaEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxJQUFYLEVBQWdCLFFBQWhCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFnQixjQUFoQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZ0IsUUFBaEI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFFBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsUUFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxRQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLFFBQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLGlCQUFQO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLFFBQWY7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsUUFBZjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxRQUFmO0lBakJRLENBQVo7SUF5QkEsRUFBQSxDQUFHLFNBQUgsRUFBYSxTQUFBO0FBRVQsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFBLENBQU8sa0JBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWtCLHFCQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBa0IsZUFBbEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWtCLGVBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFrQixxQkFBbEI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFdBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWlCLHFCQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBaUIsZUFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWlCLGVBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFpQixxQkFBakI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFdBQVAsRUFBbUIsUUFBbkI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWlCLHFCQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBaUIsZUFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWlCLGVBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFpQixxQkFBakI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFNBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWlCLHVCQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBaUIsaUJBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFpQixpQkFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWlCLHVCQUFqQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sbUJBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWlCLHFCQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBaUIsZUFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWlCLGVBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFpQixlQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEdBQVosRUFBaUIscUJBQWpCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxrQkFBUDtBQUNOO0FBQUEsYUFBQSxxQ0FBQTs7WUFDSSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLHFCQUFqQjtBQURKO1FBRUEsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksR0FBWixFQUFnQixlQUFoQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sa0JBQVAsRUFBMEIsUUFBMUI7QUFDTjtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixxQkFBakI7QUFESjtRQUVBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEdBQVosRUFBZ0IsZUFBaEI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLGtCQUFQO0FBQ047QUFBQSxhQUFBLHdDQUFBOztZQUNJLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsdUJBQWpCO0FBREo7UUFFQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxHQUFaLEVBQWdCLGlCQUFoQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sbUNBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQW1CLGVBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksTUFBWixFQUFtQixlQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEdBQVosRUFBbUIsZUFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxLQUFaLEVBQW1CLGVBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksSUFBWixFQUFtQixlQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEdBQVosRUFBbUIsZUFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxHQUFaLEVBQW1CLHFCQUFuQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sNENBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQW1CLGVBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFtQixlQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBbUIsZUFBbkI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLGVBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxNQUFaLEVBQW9CLHNCQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBb0Isc0JBQXBCO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksR0FBWixFQUFvQiw0QkFBcEI7SUFqRVMsQ0FBYjtJQXlFQSxFQUFBLENBQUcsZUFBSCxFQUFtQixTQUFBO0FBRWYsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFBLENBQU8sVUFBUCxFQUFrQixRQUFsQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBaUIscUJBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsS0FBWCxFQUFpQixNQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBaUIscUJBQWpCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxVQUFQLEVBQWtCLFFBQWxCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFpQixxQkFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxLQUFYLEVBQWlCLFFBQWpCO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFpQixxQkFBakI7SUFWZSxDQUFuQjtJQWtCQSxFQUFBLENBQUcsSUFBSCxFQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxVQUFQLEVBQWtCLElBQWxCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFvQixZQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBb0IsWUFBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxNQUFYLEVBQW9CLFdBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFvQixZQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBb0IsWUFBcEI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFVBQVAsRUFBa0IsSUFBbEI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQW9CLGNBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsSUFBWCxFQUFvQixhQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEtBQVgsRUFBb0IsYUFBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQW9CLGNBQXBCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxVQUFQLEVBQWtCLElBQWxCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFvQixjQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLFFBQVgsRUFBb0IsYUFBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQW9CLGNBQXBCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxpQkFBUCxFQUF5QixJQUF6QjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBb0IsY0FBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQW9CLG1CQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLFFBQVgsRUFBb0Isa0JBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsTUFBWCxFQUFvQixrQkFBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxHQUFaLEVBQW9CLGNBQXBCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxXQUFQLEVBQW1CLElBQW5CO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsSUFBWCxFQUFvQixNQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBb0IsT0FBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQW9CLE1BQXBCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxxQkFBUCxFQUE2QixJQUE3QjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLElBQVosRUFBb0IsTUFBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxJQUFaLEVBQW9CLE1BQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksT0FBWixFQUFvQixNQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLElBQVosRUFBb0IsTUFBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxNQUFaLEVBQW9CLE1BQXBCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxPQUFQLENBQWUsQ0FBQyxXQUFELEVBQWEseUJBQWIsQ0FBZixFQUF3RCxRQUF4RDtRQUNOLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFlLElBQWYsRUFBdUIsTUFBdkI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBZSxJQUFmLEVBQXVCLE1BQXZCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxFQUFaLEVBQWdCLE9BQWhCLEVBQXdCLE1BQXhCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxFQUFaLEVBQWUsSUFBZixFQUF1QixNQUF2QjtlQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksRUFBWixFQUFlLE1BQWYsRUFBdUIsTUFBdkI7SUE1Q0ksQ0FBUjtJQWlFQSxFQUFBLENBQUcsUUFBSCxFQUFZLFNBQUE7QUFFUixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyw2QkFBUCxFQUFxQyxRQUFyQztRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLE9BQVosRUFBc0IsU0FBdEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxPQUFaLEVBQXNCLE9BQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksU0FBWixFQUFzQixTQUF0QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLFNBQVosRUFBc0IsT0FBdEI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLGFBQVAsRUFBcUIsUUFBckI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxNQUFYLEVBQWtCLFVBQWxCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyx1QkFBUCxFQUErQixRQUEvQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxRQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxTQUFQLEVBQWlCLFFBQWpCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLE1BQWY7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxLQUFYLEVBQWlCLFNBQWpCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxhQUFQLEVBQXFCLFFBQXJCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsSUFBWCxFQUFnQixTQUFoQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxNQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsTUFBWCxFQUFrQixTQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEdBQVosRUFBZ0IsTUFBaEI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFVBQVAsRUFBa0IsUUFBbEI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxRQUFYLEVBQW9CLFNBQXBCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxPQUFQLEVBQWUsUUFBZjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxnQkFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxrQkFBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sK0JBQVAsRUFBdUMsUUFBdkM7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxLQUFaLEVBQXFCLEtBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksT0FBWixFQUFxQixVQUFyQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEtBQVosRUFBcUIsS0FBckI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxTQUFaLEVBQXFCLFVBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksT0FBWixFQUFxQixVQUFyQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sd0JBQVAsRUFBZ0MsUUFBaEM7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxJQUFYLEVBQWdCLFNBQWhCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsWUFBWCxFQUF3QixLQUF4QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEdBQVosRUFBZ0IsZ0JBQWhCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksVUFBWixFQUF1QixVQUF2QjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sT0FBUCxFQUFlLFFBQWY7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsUUFBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sV0FBUCxFQUFtQixRQUFuQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxPQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxPQUFQLEVBQWUsUUFBZjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxNQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxXQUFQLEVBQW1CLFFBQW5CO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLE1BQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFNBQVAsRUFBaUIsUUFBakI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsYUFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxhQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLGFBQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFlBQVAsRUFBb0IsUUFBcEI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsYUFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxhQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxTQUFQLEVBQWlCLFFBQWpCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLGFBQWY7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsYUFBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sV0FBUCxFQUFtQixRQUFuQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxPQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLE9BQWY7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsT0FBZjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxPQUFmO0lBekVRLENBQVo7SUFpRkEsRUFBQSxDQUFHLGlCQUFILEVBQXFCLFNBQUE7QUFFakIsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFBLENBQU8sT0FBUCxFQUFlLFFBQWY7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxLQUFYLEVBQWlCLGVBQWpCO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxPQUFQLEVBQWUsUUFBZjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxlQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxRQUFQLEVBQWdCLFFBQWhCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsSUFBWCxFQUFnQixlQUFoQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sU0FBUCxFQUFpQixRQUFqQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLE1BQVgsRUFBa0IsZUFBbEI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLE9BQVAsRUFBZSxRQUFmO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLGVBQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFdBQVAsRUFBbUIsUUFBbkI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxPQUFYLEVBQW1CLGVBQW5CO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxPQUFQO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLGVBQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLE1BQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsZUFBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sTUFBUDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxlQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxvQkFBUCxFQUE0QixRQUE1QjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEtBQVgsRUFBaUIsVUFBakI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFlBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsTUFBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sUUFBUDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxNQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxRQUFQO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLE1BQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFFBQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsTUFBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sUUFBUDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxNQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxXQUFQO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLE1BQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLE9BQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsTUFBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sT0FBUDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxNQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxPQUFQO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLE1BQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLE9BQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsTUFBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sT0FBUDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxNQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxPQUFQO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLE1BQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLE9BQVA7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsTUFBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sT0FBUDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxNQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxRQUFQO2VBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLE1BQWY7SUEzRWlCLENBQXJCO0lBbUZBLEVBQUEsQ0FBRyxlQUFILEVBQW1CLFNBQUE7QUFFZixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxRQUFQLEVBQWdCLFFBQWhCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLFFBQWY7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsY0FBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSwyQkFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSwyQkFBZjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sUUFBUCxFQUFnQixRQUFoQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxRQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLGNBQWY7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUscUJBQWY7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUscUJBQWY7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLG1DQUFQLEVBQTJDLFFBQTNDO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksTUFBWixFQUFtQixRQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIsY0FBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxHQUFaLEVBQW1CLDJCQUFuQjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEdBQVosRUFBbUIsMkJBQW5CO0lBbEJlLENBQW5CO0lBMEJBLEVBQUEsQ0FBRyxRQUFILEVBQVksU0FBQTtBQUVSLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFFBQVAsRUFBZ0IsUUFBaEI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWUsUUFBZjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZSxjQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLHFCQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLHFCQUFmO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyx1QkFBUCxFQUErQixRQUEvQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIsWUFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxJQUFaLEVBQW1CLE1BQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFtQixZQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLE1BQVosRUFBbUIsTUFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxHQUFaLEVBQW1CLFlBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksTUFBWixFQUFtQixNQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEdBQVosRUFBbUIsWUFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxNQUFaLEVBQW1CLE1BQW5CO1FBRUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxpQkFBUCxFQUF5QixRQUF6QjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBa0IsUUFBbEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWtCLGVBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFrQixnQkFBbEI7ZUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxHQUFaLEVBQWtCLGdCQUFsQjtJQXRCUSxDQUFaO0lBOEJBLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtBQUVQLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBQSxDQUFPLHlCQUFQLEVBQWlDLE1BQWpDO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixPQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLElBQVosRUFBaUIsT0FBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBWSxHQUFaLEVBQWlCLE9BQWpCO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksR0FBWixFQUFpQixPQUFqQjtJQU5PLENBQVg7SUFjQSxFQUFBLENBQUcsTUFBSCxFQUFVLFNBQUE7QUFFTixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxRQUFQLEVBQWdCLE1BQWhCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFrQixlQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBa0IsZUFBbEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxLQUFYLEVBQWtCLFNBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFrQixlQUFsQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sT0FBUCxFQUFlLE1BQWY7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQWtCLGVBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsS0FBWCxFQUFrQixTQUFsQjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBa0IsZUFBbEI7SUFYTSxDQUFWO0lBbUJBLEVBQUEsQ0FBRyxLQUFILEVBQVMsU0FBQTtBQUVMLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBQSxDQUFPLFVBQVAsRUFBa0IsS0FBbEI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQXNCLGNBQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsU0FBWCxFQUFzQixRQUF0QjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sS0FBUCxFQUFhLEtBQWI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQXNCLGNBQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsSUFBWCxFQUFzQixRQUF0QjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sT0FBUCxFQUFlLEtBQWY7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxHQUFYLEVBQXNCLGNBQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsSUFBWCxFQUFzQixRQUF0QjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sc0JBQVAsRUFBOEIsS0FBOUI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxJQUFYLEVBQW1CLFNBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsTUFBWCxFQUFtQixTQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLE1BQVosRUFBbUIsU0FBbkI7UUFFQSxHQUFBLEdBQU0sTUFBQSxDQUFPLE1BQVAsRUFBYyxLQUFkO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFnQixjQUFoQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBZ0Isb0JBQWhCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsSUFBWCxFQUFnQixjQUFoQjtRQUVBLEdBQUEsR0FBTSxNQUFBLENBQU8sU0FBUCxFQUFpQixLQUFqQjtlQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLE9BQVgsRUFBbUIsY0FBbkI7SUF6QkssQ0FBVDtJQStDQSxFQUFBLENBQUcsSUFBSCxFQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxxQkFBUCxFQUE2QixJQUE3QjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLE1BQVgsRUFBa0IsVUFBbEI7ZUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxVQUFYLEVBQXNCLGtCQUF0QjtJQUpJLENBQVI7SUFZQSxFQUFBLENBQUcsSUFBSCxFQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTywrQkFBUCxFQUF1QyxJQUF2QztRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEtBQVgsRUFBaUIsVUFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBVyxNQUFYLEVBQWtCLFVBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsTUFBWCxFQUFrQixVQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLFFBQVosRUFBcUIsVUFBckI7UUFRQSxHQUFBLEdBQU0sTUFBQSxDQUFPLGtCQUFQLEVBQTBCLElBQTFCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLGdCQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFlLGdCQUFmO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsTUFBWCxFQUFrQixVQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFZLEdBQVosRUFBZ0IsZ0JBQWhCO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQVksTUFBWixFQUFtQixVQUFuQjtJQW5CSSxDQUFSO0lBMkJBLEVBQUEsQ0FBRyxLQUFILEVBQVMsU0FBQSxHQUFBLENBQVQ7V0FpQ0EsRUFBQSxDQUFHLE1BQUgsRUFBVSxTQUFBLEdBQUEsQ0FBVjtBQWx4QmMsQ0FBbEI7OztBQTZ4QkE7Ozs7Ozs7O0FBUUEsUUFBQSxDQUFTLFFBQVQsRUFBa0IsU0FBQTtJQVFkLEVBQUEsQ0FBRyxTQUFILEVBQWEsU0FBQTtRQUVULE1BQUEsQ0FBTyxDQUFDLElBQUQsQ0FBUCxDQUFjLENBQUMsTUFBTSxDQUFDLEdBQXRCLENBQTBCO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLENBQW5CO2dCQUFxQixLQUFBLEVBQU0sQ0FBM0I7Z0JBQTZCLE1BQUEsRUFBTyxDQUFwQztnQkFBc0MsTUFBQSxFQUFPO29CQUM1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLGVBQWxDO3dCQUFrRCxJQUFBLEVBQUssSUFBdkQ7cUJBRDRELEVBRTVEO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFTLE1BQUEsRUFBTyxDQUFoQjt3QkFBa0IsS0FBQSxFQUFNLEdBQXhCO3dCQUE0QixLQUFBLEVBQU0sU0FBbEM7cUJBRjREO2lCQUE3QzthQUFEO1NBQTFCO2VBS0EsTUFBQSxDQUFPLENBQUMsS0FBRCxDQUFQLENBQWUsQ0FBQyxNQUFNLENBQUMsR0FBdkIsQ0FBMkI7WUFBQztnQkFBQSxHQUFBLEVBQUksUUFBSjtnQkFBYSxLQUFBLEVBQU0sQ0FBbkI7Z0JBQXFCLEtBQUEsRUFBTSxDQUEzQjtnQkFBNkIsTUFBQSxFQUFPLENBQXBDO2dCQUFzQyxNQUFBLEVBQU87b0JBQzdEO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFTLE1BQUEsRUFBTyxDQUFoQjt3QkFBa0IsS0FBQSxFQUFNLEdBQXhCO3dCQUE0QixLQUFBLEVBQU0sT0FBbEM7d0JBQTBDLElBQUEsRUFBTSxJQUFoRDtxQkFENkQsRUFFN0Q7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVMsTUFBQSxFQUFPLENBQWhCO3dCQUFrQixLQUFBLEVBQU0sR0FBeEI7d0JBQTRCLEtBQUEsRUFBTSxlQUFsQztxQkFGNkQsRUFHN0Q7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVMsTUFBQSxFQUFPLENBQWhCO3dCQUFrQixLQUFBLEVBQU0sR0FBeEI7d0JBQTRCLEtBQUEsRUFBTSxTQUFsQztxQkFINkQ7aUJBQTdDO2FBQUQ7U0FBM0I7SUFQUyxDQUFiO0lBbUJBLEVBQUEsQ0FBRyxVQUFILEVBQWMsU0FBQTtRQUVWLE1BQUEsQ0FBTyxDQUFDLElBQUQsQ0FBUCxDQUFjLENBQUMsTUFBTSxDQUFDLEdBQXRCLENBQTBCO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLENBQW5CO2dCQUFxQixLQUFBLEVBQU0sQ0FBM0I7Z0JBQTZCLE1BQUEsRUFBTyxDQUFwQztnQkFBc0MsTUFBQSxFQUFPO29CQUM1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLHFCQUFsQzt3QkFBd0QsSUFBQSxFQUFNLElBQTlEO3FCQUQ0RCxFQUU1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLHFCQUFsQztxQkFGNEQ7aUJBQTdDO2FBQUQ7U0FBMUI7UUFJQSxNQUFBLENBQU8sQ0FBQyxJQUFELENBQVAsQ0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUF0QixDQUEwQjtZQUFDO2dCQUFBLEdBQUEsRUFBSSxRQUFKO2dCQUFhLEtBQUEsRUFBTSxDQUFuQjtnQkFBcUIsS0FBQSxFQUFNLENBQTNCO2dCQUE2QixNQUFBLEVBQU8sQ0FBcEM7Z0JBQXNDLE1BQUEsRUFBTztvQkFDNUQ7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVMsTUFBQSxFQUFPLENBQWhCO3dCQUFrQixLQUFBLEVBQU0sR0FBeEI7d0JBQTRCLEtBQUEsRUFBTSwyQkFBbEM7d0JBQThELElBQUEsRUFBTSxJQUFwRTtxQkFENEQsRUFFNUQ7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVMsTUFBQSxFQUFPLENBQWhCO3dCQUFrQixLQUFBLEVBQU0sR0FBeEI7d0JBQTRCLEtBQUEsRUFBTSwyQkFBbEM7cUJBRjREO2lCQUE3QzthQUFEO1NBQTFCO2VBSUEsTUFBQSxDQUFPLENBQUMsT0FBRCxDQUFQLENBQWlCLENBQUMsTUFBTSxDQUFDLEdBQXpCLENBQTZCO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLENBQW5CO2dCQUFxQixLQUFBLEVBQU0sQ0FBM0I7Z0JBQTZCLE1BQUEsRUFBTyxDQUFwQztnQkFBc0MsTUFBQSxFQUFPO29CQUMvRDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLFVBQWxDO3FCQUQrRCxFQUUvRDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLGdCQUFsQzt3QkFBd0QsSUFBQSxFQUFLLEtBQTdEO3FCQUYrRCxFQUcvRDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLHFCQUFsQzt3QkFBd0QsSUFBQSxFQUFLLElBQTdEO3FCQUgrRCxFQUkvRDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLHFCQUFsQztxQkFKK0QsRUFLL0Q7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVMsTUFBQSxFQUFPLENBQWhCO3dCQUFrQixLQUFBLEVBQU0sR0FBeEI7d0JBQTRCLEtBQUEsRUFBTSxRQUFsQztxQkFMK0Q7aUJBQTdDO2FBQUQ7U0FBN0I7SUFWVSxDQUFkO0lBd0JBLEVBQUEsQ0FBRyxTQUFILEVBQWEsU0FBQTtRQUVULE1BQUEsQ0FBTyxDQUFDLEdBQUQsQ0FBUCxDQUFhLENBQUMsTUFBTSxDQUFDLEdBQXJCLENBQXlCO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLENBQW5CO2dCQUFxQixLQUFBLEVBQU0sQ0FBM0I7Z0JBQTZCLE1BQUEsRUFBTyxDQUFwQztnQkFBc0MsTUFBQSxFQUFPO29CQUFFO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFTLE1BQUEsRUFBTyxDQUFoQjt3QkFBa0IsS0FBQSxFQUFNLEdBQXhCO3dCQUE0QixLQUFBLEVBQU0sUUFBbEM7cUJBQUY7aUJBQTdDO2FBQUQ7U0FBekI7UUFDQSxNQUFBLENBQU8sQ0FBQyxHQUFELENBQVAsQ0FBYSxDQUFDLE1BQU0sQ0FBQyxHQUFyQixDQUF5QjtZQUFDO2dCQUFBLEdBQUEsRUFBSSxRQUFKO2dCQUFhLEtBQUEsRUFBTSxDQUFuQjtnQkFBcUIsS0FBQSxFQUFNLENBQTNCO2dCQUE2QixNQUFBLEVBQU8sQ0FBcEM7Z0JBQXNDLE1BQUEsRUFBTztvQkFBRTt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLE1BQWxDO3FCQUFGO2lCQUE3QzthQUFEO1NBQXpCO1FBQ0EsTUFBQSxDQUFPLENBQUMsR0FBRCxDQUFQLENBQWEsQ0FBQyxNQUFNLENBQUMsR0FBckIsQ0FBeUI7WUFBQztnQkFBQSxHQUFBLEVBQUksUUFBSjtnQkFBYSxLQUFBLEVBQU0sQ0FBbkI7Z0JBQXFCLEtBQUEsRUFBTSxDQUEzQjtnQkFBNkIsTUFBQSxFQUFPLENBQXBDO2dCQUFzQyxNQUFBLEVBQU87b0JBQUU7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVMsTUFBQSxFQUFPLENBQWhCO3dCQUFrQixLQUFBLEVBQU0sR0FBeEI7d0JBQTRCLEtBQUEsRUFBTSxPQUFsQztxQkFBRjtpQkFBN0M7YUFBRDtTQUF6QjtRQUVBLE1BQUEsQ0FBTyxDQUFDLEtBQUQsQ0FBUCxDQUFlLENBQUMsTUFBTSxDQUFDLEdBQXZCLENBQTJCO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLENBQW5CO2dCQUFxQixLQUFBLEVBQU0sQ0FBM0I7Z0JBQTZCLE1BQUEsRUFBTyxDQUFwQztnQkFBc0MsTUFBQSxFQUFPO29CQUM1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBVSxNQUFBLEVBQU8sQ0FBakI7d0JBQW1CLEtBQUEsRUFBTSxHQUF6Qjt3QkFBNkIsS0FBQSxFQUFNLFFBQW5DO3FCQUQ0RCxFQUU1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBVSxNQUFBLEVBQU8sQ0FBakI7d0JBQW1CLEtBQUEsRUFBTSxHQUF6Qjt3QkFBNkIsS0FBQSxFQUFNLGdCQUFuQztxQkFGNEQsRUFHNUQ7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVUsTUFBQSxFQUFPLENBQWpCO3dCQUFtQixLQUFBLEVBQU0sR0FBekI7d0JBQTZCLEtBQUEsRUFBTSxVQUFuQztxQkFINEQ7aUJBQTdDO2FBQUQ7U0FBM0I7UUFNQSxNQUFBLENBQU8sQ0FBQyxLQUFELENBQVAsQ0FBZSxDQUFDLE1BQU0sQ0FBQyxHQUF2QixDQUEyQjtZQUFDO2dCQUFBLEdBQUEsRUFBSSxRQUFKO2dCQUFhLEtBQUEsRUFBTSxDQUFuQjtnQkFBcUIsS0FBQSxFQUFNLENBQTNCO2dCQUE2QixNQUFBLEVBQU8sQ0FBcEM7Z0JBQXNDLE1BQUEsRUFBTztvQkFDNUQ7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVUsTUFBQSxFQUFPLENBQWpCO3dCQUFtQixLQUFBLEVBQU0sR0FBekI7d0JBQTZCLEtBQUEsRUFBTSxPQUFuQzt3QkFBMkMsSUFBQSxFQUFLLElBQWhEO3FCQUQ0RCxFQUU1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBVSxNQUFBLEVBQU8sQ0FBakI7d0JBQW1CLEtBQUEsRUFBTSxHQUF6Qjt3QkFBNkIsS0FBQSxFQUFNLE9BQW5DO3FCQUY0RCxFQUc1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBVSxNQUFBLEVBQU8sQ0FBakI7d0JBQW1CLEtBQUEsRUFBTSxHQUF6Qjt3QkFBNkIsS0FBQSxFQUFNLE1BQW5DO3FCQUg0RDtpQkFBN0M7YUFBRDtTQUEzQjtlQU1BLE1BQUEsQ0FBTyxDQUFDLGNBQUQsQ0FBUCxDQUF3QixDQUFDLE1BQU0sQ0FBQyxHQUFoQyxDQUFvQztZQUFDO2dCQUFBLEdBQUEsRUFBSSxRQUFKO2dCQUFhLEtBQUEsRUFBTSxFQUFuQjtnQkFBc0IsS0FBQSxFQUFNLENBQTVCO2dCQUE4QixNQUFBLEVBQU8sQ0FBckM7Z0JBQXVDLE1BQUEsRUFBTztvQkFDckU7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVUsTUFBQSxFQUFPLENBQWpCO3dCQUFtQixLQUFBLEVBQU0sR0FBekI7d0JBQWlDLEtBQUEsRUFBTSxZQUF2QztxQkFEcUUsRUFFckU7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVUsTUFBQSxFQUFPLENBQWpCO3dCQUFtQixLQUFBLEVBQU0sS0FBekI7d0JBQWlDLEtBQUEsRUFBTSxNQUF2QztxQkFGcUUsRUFHckU7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVUsTUFBQSxFQUFPLENBQWpCO3dCQUFtQixLQUFBLEVBQU0sR0FBekI7d0JBQWlDLEtBQUEsRUFBTSxxQkFBdkM7cUJBSHFFLEVBSXJFO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFVLE1BQUEsRUFBTyxDQUFqQjt3QkFBbUIsS0FBQSxFQUFNLE9BQXpCO3dCQUFpQyxLQUFBLEVBQU0sZUFBdkM7cUJBSnFFLEVBS3JFO3dCQUFDLEtBQUEsRUFBTSxFQUFQO3dCQUFVLE1BQUEsRUFBTyxDQUFqQjt3QkFBbUIsS0FBQSxFQUFNLEdBQXpCO3dCQUFpQyxLQUFBLEVBQU0scUJBQXZDO3FCQUxxRTtpQkFBOUM7YUFBRDtTQUFwQztJQWxCUyxDQUFiO0lBZ0NBLEVBQUEsQ0FBRyxPQUFILEVBQVcsU0FBQTtBQUVQLFlBQUE7UUFBQSxDQUFBLEdBQUksTUFBQSxDQUFPLENBQUMsR0FBRCxDQUFQO1FBQ0osQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQTlCLENBQXVDLE9BQXZDLEVBQStDLENBQS9DO1FBRUEsQ0FBQSxHQUFJLE1BQUEsQ0FBTyxDQUFDLEtBQUQsQ0FBUDtRQUNKLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUE5QixDQUF1QyxPQUF2QyxFQUErQyxDQUEvQztRQUVBLENBQUEsR0FBSSxNQUFBLENBQU8sQ0FBQyxTQUFELENBQVA7UUFDSixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBOUIsQ0FBdUMsT0FBdkMsRUFBK0MsQ0FBL0M7UUFFQSxDQUFBLEdBQUksTUFBQSxDQUFPLENBQUMsYUFBRCxDQUFQO1FBQ0osQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQTlCLENBQXVDLE9BQXZDLEVBQStDLENBQS9DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQTlCLENBQXVDLE9BQXZDLEVBQStDLENBQS9DO2VBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQTlCLENBQXVDLE9BQXZDLEVBQStDLENBQS9DO0lBZE8sQ0FBWDtXQXNCQSxFQUFBLENBQUcsVUFBSCxFQUFjLFNBQUE7QUFFVixZQUFBO1FBQUEsQ0FBQSxHQUFJLE1BQUEsQ0FBTyxpREFJVyxDQUFDLEtBSlosQ0FJa0IsSUFKbEIsQ0FBUDtRQUtKLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBRUEsQ0FBQSxHQUFJLE1BQUEsQ0FBTyw0RUFPSCxDQUFDLEtBUEUsQ0FPSSxJQVBKLENBQVA7UUFRSixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxRQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxRQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxRQUFuQztRQUVBLENBQUEsR0FBSSxNQUFBLENBQU8sbVFBU0gsQ0FBQyxLQVRFLENBU0ksSUFUSixDQUFQO1FBVUosQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsUUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsUUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxRQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBRUEsQ0FBQSxHQUFJLE1BQUEsQ0FBTyx3QkFHSixDQUFDLEtBSEcsQ0FHRyxJQUhILENBQVA7UUFJSixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxRQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBRUEsQ0FBQSxHQUFJLE1BQUEsQ0FBTyw2REFPSixDQUFDLEtBUEcsQ0FPRyxJQVBILENBQVAsRUFPaUIsSUFQakI7UUFRSixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztlQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO0lBbkVVLENBQWQ7QUF6R2MsQ0FBbEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiMjI1xuXG5CbG9ja3MgPSByZXF1aXJlICcuL2Jsb2NrcydcbnJlcXVpcmUoJ2t4aycpLmNoYWkoKVxuXG5pbmMgPSAocmdzLCBzdGFydCwgbWF0Y2gsIHZhbHVlKSAtPiByZ3Muc2hvdWxkLmRlZXAuaW5jbHVkZSAgICAgc3RhcnQ6c3RhcnQsIG1hdGNoOm1hdGNoLCB2YWx1ZTp2YWx1ZVxubnV0ID0gKHJncywgc3RhcnQsIG1hdGNoLCB2YWx1ZSkgLT4gcmdzLnNob3VsZC5ub3QuZGVlcC5pbmNsdWRlIHN0YXJ0OnN0YXJ0LCBtYXRjaDptYXRjaCwgdmFsdWU6dmFsdWVcblxuYmxvY2tzICA9IEJsb2Nrcy5ibG9ja3NcbnJhbmdlcyAgPSBCbG9ja3MucmFuZ2VzXG5kaXNzZWN0ID0gQmxvY2tzLmRpc3NlY3RcbiAgICBcbiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuIyMjXG5cbmRlc2NyaWJlICdyYW5nZXMnIC0+XG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdyZWdleHAnIC0+XG4gICAgICAgIHJncyA9IHJhbmdlcyBcInI9L2EvXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMyAnYScgICAgICAgJ3RleHQgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCA0ICcvJyAgICAgICAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLyhhfC4qfFxcc1xcZFxcd1xcU1xcVyR8XlxccyspL1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDIgJ2EnICAgICAgICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvXiNpbmNsdWRlL1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIjXCIgICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMyBcImluY2x1ZGVcIiAndGV4dCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL1xcXFwnaGVsbG9cXFxcJy8gXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMSBcIlxcXFxcIiAgICAgICdwdW5jdCBlc2NhcGUgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiJ1wiICAgICAgICdwdW5jdCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDMgXCJoZWxsb1wiICAgJ3RleHQgcmVnZXhwJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgYSAvYiAtIGMvZ2lcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA0ICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCA1ICdiJyAgICAgICAndGV4dCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDEwICcvJyAgICAgICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidz1sLnNwbGl0IC9bXFxcXHNcXFxcL10vIDsgYmxhXCJcbiAgICAgICAgaW5jIHJncywgMTAgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDE0ICdcXFxcJyAgICAgICdwdW5jdCBlc2NhcGUgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAxNyAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBlbmQnXG4gICAgICAgIGluYyByZ3MsIDE5ICc7JyAgICAgICAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhID0gMSAvIDJcIlxuICAgICAgICBpbmMgcmdzLCA2ICcvJywgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA4ICcyJywgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIoMSsxKSAvIDJcIlxuICAgICAgICBpbmMgcmdzLCA2ICcvJywgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA4ICcyJywgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWzEwXSAvIDJcIlxuICAgICAgICBpbmMgcmdzLCA2ICcvJywgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA4ICcyJywgJ251bWJlcidcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICd0cmlwbGUgcmVnZXhwJyAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLy8vYS8vL1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDEgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDIgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDMgXCJhXCIgJ3RleHQgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNCBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNSBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNiBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBcIi8vL1xcbmFcXG4vLy9cIi5zcGxpdCgnXFxuJyksICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMF0sIDAgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDIgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDAgXCJhXCIgJ3RleHQgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMCBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMSBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMiBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBcIlwiXCJcbiAgICAgICAgICAgIC8vL1xuICAgICAgICAgICAgICAgIChbXFxcXFxcXFw/XSkgIyBjb21tZW50XG4gICAgICAgICAgICAvLy9cbiAgICAgICAgICAgIFwiXCJcIi5zcGxpdCgnXFxuJyksICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMF0sIDAgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDQgIFwiKFwiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgNiAgXCJcXFxcXCIgJ3B1bmN0IGVzY2FwZSByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAxMiBcIiNcIiAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyBkc3NbMV0sIDE0IFwiY29tbWVudFwiICdjb21tZW50J1xuICAgICAgICBpbmMgZHNzWzJdLCAwICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMiAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdubyByZWdleHAnIC0+XG4gICAgICAgIFxuICAgICAgICAjIGYgYSAvIGIgLSBjL2dpXG4gICAgICAgICMgZiBhL2IgLSBjL2dpXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2EgLyBiIC0gYyAvIGQnICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDIgJy8nICdwdW5jdCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdmIGEvYiwgYy9kJyAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCAzICcvJyAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibSA9ICcvJ1wiICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDUgJy8nICdwdW5jdCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibSBhLCAnLycnLydcIiAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA2ICcvJyAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXCJcIlxcXCJtID0gJy8nXFxcIlwiXCJcIiAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA2ICcvJyAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicyA9ICcvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwJ1wiICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDUgJy8nICdwdW5jdCByZWdleHAnXG4gICAgICAgIG51dCByZ3MsIDkgJy8nICdwdW5jdCByZWdleHAnXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3JlcXVpcmUnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ1dGlsID0gcmVxdWlyZSAndXRpbCdcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA3ICdyZXF1aXJlJyAncmVxdWlyZSdcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnY29tbWVudHMnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJoZWxsbyAjIHdvcmxkXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNiBcIiNcIiAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgOCBcIndvcmxkXCIgJ2NvbW1lbnQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgIyBibGEgYmx1YlwiICdub29uJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiI1wiICAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgNSBcImJsYVwiICAgJ2NvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDkgXCJibHViXCIgICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiheXFxzKiNcXHMqKSguKikkXCIgJ25vb24nXG4gICAgICAgIGZvciBybmcgaW4gcmdzXG4gICAgICAgICAgICBybmcuc2hvdWxkLm5vdC5oYXZlLnByb3BlcnR5ICd2YWx1ZScgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICBpdCAndHJpcGxlIGNvbW1lbnQnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjIyNhIyMjXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDEgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMyBcImFcIiAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDQgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNiBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG5cbiAgICAgICAgZHNzID0gQmxvY2tzLmRpc3NlY3QgXCIjIyNcXG5hXFxuIyMjXCIuc3BsaXQoJ1xcbicpLCAnY29mZmVlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAwIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDIgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwIFwiYVwiICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMCBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAyIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBcIi8qXFxuYVxcbiovXCIuc3BsaXQoJ1xcbicpLCAnc3R5bCdcbiAgICAgICAgaW5jIGRzc1swXSwgMCBcIi9cIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEgXCIqXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwIFwiYVwiICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMCBcIipcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEgXCIvXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBcbiAgICBpdCAnY29tbWVudCBoZWFkZXInIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjIDAgMDAgMDAwMFwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgIFwiI1wiICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCAyICBcIjBcIiAgICAnY29tbWVudCBoZWFkZXInXG4gICAgICAgIGluYyByZ3MsIDQgIFwiMDBcIiAgICdjb21tZW50IGhlYWRlcidcbiAgICAgICAgaW5jIHJncywgNyAgXCIwMDAwXCIgJ2NvbW1lbnQgaGVhZGVyJ1xuXG4gICAgICAgIGRzcyA9IEJsb2Nrcy5kaXNzZWN0IFwiIyMjXFxuIDAgMDAgMCBcXG4jIyNcIi5zcGxpdCgnXFxuJyksICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMV0sIDEgXCIwXCIgJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi8vIDAwMFwiICdzdHlsJ1xuICAgICAgICBpbmMgcmdzLCAzICBcIjAwMFwiICAgICdjb21tZW50IGhlYWRlcidcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBcIi8qXFxuIDAgMCAwIFxcbiovXCIuc3BsaXQoJ1xcbicpLCAnc3R5bCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMSBcIjBcIiAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ251bWJlcnMnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhIDY2NzBcIlxuICAgICAgICBpbmMgcmdzLCAyIFwiNjY3MFwiICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMHg2NjdBQ1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCIweDY2N0FDXCIgJ251bWJlciBoZXgnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNjYuNzAwXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjY2XCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIuXCIgICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAzIFwiNzAwXCIgJ251bWJlciBmbG9hdCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI3Ny44MDAgLTEwMFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCI3N1wiICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA4IFwiMTAwXCIgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIoOC45LDEwMC4yKVwiXG4gICAgICAgIGluYyByZ3MsIDMgXCI5XCIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgOSBcIjJcIiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzZW12ZXInIC0+ICAgIFxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNjYuNzAuMFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCI2NlwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDIgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCI3MFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDYgXCIwXCIgICdzZW12ZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXjAuNy4xXCJcbiAgICAgICAgaW5jIHJncywgMSBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiN1wiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIxXCIgJ3NlbXZlcidcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJeMS4wLjAtYWxwaGEuMTJcIlxuICAgICAgICBpbmMgcmdzLCAxIFwiMVwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ3N0cmluZ3MnIC0+XG4gICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlwiXCJhPVwiXFxcXFwiRVxcXFxcIlwiIFwiXCJcIlxuICAgICAgICBpbmMgcmdzLCAyICdcIicgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDQgJ1wiJyAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNSAnRScgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDggJ1wiJyAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cIlxcJ1hcXCdcIidcbiAgICAgICAgaW5jIHJncywgMiAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMgXCInXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNCBcIlhcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA2ICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XFwnXCJYXCJcXCcnICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDIgXCInXCIgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgMyAnXCInICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDQgJ1gnICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCInXCIgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9YFwiWFwiYCdcbiAgICAgICAgaW5jIHJncywgMiBcImBcIiAgICdwdW5jdCBzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDMgJ1wiJyAgICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDQgJ1gnICAgJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgNiBcImBcIiAgICdwdW5jdCBzdHJpbmcgYmFja3RpY2snXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhPVwiICBcXCdYXFwnICBZICBcIiAnXG4gICAgICAgIGluYyByZ3MsIDIgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiJ1wiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCJYXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNyBcIidcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxMyAnXCInICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XCJcIjtiPVwiIFwiO2M9XCJYXCInXG4gICAgICAgIGZvciBpIGluIFsyIDMgNyA5IDEzIDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgJ1wiJywgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDE0ICdYJyAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYT0nJztiPScgJztjPSdZJ1wiICdjb2ZmZWUnXG4gICAgICAgIGZvciBpIGluIFsyIDMgNyA5IDEzIDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgXCInXCIsICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnWScgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImE9YGA7Yj1gIGA7Yz1gWmBcIlxuICAgICAgICBmb3IgaSBpbiBbMiAzIDcgOSAxMyAxNV1cbiAgICAgICAgICAgIGluYyByZ3MsIGksIFwiYFwiLCAncHVuY3Qgc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnWicgJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnJydcInMgPSAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCdcIicnJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiJ1wiICAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTcgXCJmaWxlXCIgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDIxIFwiLlwiICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyMiBcInR4dFwiICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjYgXCIxMFwiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDI4IFwiJ1wiICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyOSAnXCInICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICcnJ3doZW4gJ1wiXCJcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSB0cmlwbGVcXCcnJydcbiAgICAgICAgaW5jIHJncywgNiAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNyAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgOCAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIicnJ3doZW5cXFxcJycnJ1wiXG4gICAgICAgIGluYyByZ3MsIDMgIFwid2hlblwiICAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDggIFwiJ1wiICAgICAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDExIFwiJ1wiICAgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgIFxuICAgIGl0ICdpbnRlcnBvbGF0aW9uJyAtPiAgICBcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIje3h4eH1cIicgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMgJ3h4eCcgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDcgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIjezY2Nn1cIicgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMgJzY2NicgJ251bWJlcidcbiAgICAgICAgaW5jIHJncywgNyAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpdCAnbWQnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIqKmJvbGQqKlwiICdtZCdcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMSAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMiAnYm9sZCcgICAndGV4dCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA2ICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA3ICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIqaXQgbGljKlwiICdtZCdcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxICdpdCcgICAgICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNCAnbGljJyAgICAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDcgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIippdGFsaWMqXCIgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2l0YWxpYycgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA3ICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIipgaXRhbGljIGNvZGVgKlwiICdtZCdcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxICdgJyAgICAgICdwdW5jdCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgMiAnaXRhbGljJyAndGV4dCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgOSAnY29kZScgICAndGV4dCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgMTQgJyonICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaXQncyBnb29kXCIgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwICdpdCcgICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAyIFwiJ1wiICAgICAgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAzICdzJyAgICAgICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgaXMgZW1wdHkgaW4gdGhlblwiICdtZCdcbiAgICAgICAgaW5jIHJncywgMCAgJ2lmJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMyAgJ2lzJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNiAgJ2VtcHR5JyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTIgJ2luJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTUgJ3RoZW4nICAndGV4dCdcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBbXCLilrhkb2MgJ21kJ1wiIFwiICAgIGlmIGlzIGVtcHR5IGluIHRoZW5cIl0sICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMV0sIDQgICdpZicgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDcgICdpcycgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDEwICAnZW1wdHknICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCAxNiAnaW4nICAgICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCAxOSAndGhlbicgICd0ZXh0J1xuICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcIi0gbGlcIiAnbWQnXG4gICAgICAgICMgaW5jIHJncywgMCAnLScgICdsaTEgbWFya2VyJ1xuICAgICAgICAjIGluYyByZ3MsIDIgJ2xpJyAnbGkxJ1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiICAgIC0gKipib2xkKipcIiAnbWQnXG4gICAgICAgICMgaW5jIHJncywgNCAnLScgICAgJ2xpMiBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgOCAnYm9sZCcgJ2xpMiBib2xkJ1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiICAgIC0gKipcIiAnbWQnXG4gICAgICAgICMgaW5jIHJncywgNCAnLScgICAgJ2xpMiBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgNiAnKicgICAgJ3B1bmN0IGxpMidcbiAgICAgICAgIyBpbmMgcmdzLCA3ICcqJyAgICAncHVuY3QgbGkyJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnY29mZmVlJyAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJjbGFzcyBNYWNybyBleHRlbmRzIENvbW1hbmRcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwICAnY2xhc3MnICAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDYgICdNYWNybycgICAnY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEyICdleHRlbmRzJyAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMjAgJ0NvbW1hbmQnICdjbGFzcydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImV4aXN0Py5wcm9wXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNyAncHJvcCcgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAaGVpZ2h0LzIgKyBAaGVpZ2h0LzZcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA4IFwiMlwiICdudW1iZXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhIGFuZCBiXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcImFcIiAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiBcImFuZFwiICdrZXl3b3JkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIGEgdGhlbiBiXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcImlmXCIgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDMgXCJhXCIgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDUgXCJ0aGVuXCIgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEwIFwiYlwiICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInN3aXRjaCBhXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcInN3aXRjaFwiICdrZXl3b3JkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIGE6IGJcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiYVwiICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm9iai52YWx1ZSA9IG9iai5hbm90aGVyLnZhbHVlXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcInZhbHVlXCIgICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTIgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxNiBcImFub3RoZXJcIidwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMjQgXCJ2YWx1ZVwiICAncHJvcGVydHknXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgc29tZU9iamVjdC5zb21lUHJvcFwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJpZlwiICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzIFwic29tZU9iamVjdFwiICdvYmonXG4gICAgICAgIGluYyByZ3MsIDEzIFwiLlwiICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTQgXCJzb21lUHJvcFwiICdwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjEgJ2EnXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcIjFcIiAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbMF0ucHJvcFwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDMgJ10nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsgZiBdXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiAnZicgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiWyBmICwgZiBdXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiAnZicgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWy4uLjJdXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCAzICcuJyAncHVuY3QgcmFuZ2UnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCByYW5nZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWyAtMSAuLiBdXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNiAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCA3ICcuJyAncHVuY3QgcmFuZ2UnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsxLi5uXVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDMgJy4nICdwdW5jdCByYW5nZSdcbiAgICAgICAgaW5jIHJncywgNCAnLicgJ3B1bmN0IHJhbmdlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbIC4uLi4gXVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDMgJy4nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNCAnLicgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICcuJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDYgJy4nICdwdW5jdCdcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4gICAgaXQgJ2NvZmZlZSBmdW5jdGlvbicgLT5cblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmZmYgMVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiAnYSdcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmYgJ2InXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcImZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmZiAtMVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiBbMV1cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmZmZmIHsxfVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZmZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKythXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICs0XCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAtNFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicG9zPSAoaXRlbSwgcCkgLT4gXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcInBvc1wiICdmdW5jdGlvbidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgIT0gZmFsc2VcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICs9IDFcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgLT0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKj0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgLz0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSA/IGZhbHNlXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSA8IDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpID4gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKyAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAtIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICogM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgLyAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAlIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpID0gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgPT0gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGl0ICdjb2ZmZWUgbWV0aG9kJyAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIGE6ID0+XCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSBcImFcIiAnbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiOlwiICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQgXCI9XCIgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUgXCI+XCIgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgYTogLT5cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiYVwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCBcIi1cIiAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAncHVuY3QgZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm10aGQ6ICAoYXJnKSAgICA9PiBAbWVtYmVyIG1lbWFyZ1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgICdtdGhkJyAnbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0ICAnOicgICAgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMTYgJz0nICAgICdwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCAxNyAnPicgICAgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2tvZmZlZScgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBAOiAtPlwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDEgXCJAXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiLVwiICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIuKWuGlmIOKWuHRoZW4g4pa4ZWxpZiDilrhlbHNlXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAgXCLilrhcIiAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMSAgXCJpZlwiICAgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDQgIFwi4pa4XCIgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDUgIFwidGhlblwiICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxMCBcIuKWuFwiICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxMSBcImVsaWZcIiAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTYgXCLilrhcIiAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTcgXCJlbHNlXCIgJ21ldGEnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiWzEgJ3gnIGE6MSBjOmRdXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSAgXCIxXCIgICAnbnVtYmVyJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcInhcIiAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA3ICBcImFcIiAgICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMTEgXCJjXCIgICAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgIFxuICAgIFxuICAgIGl0ICdwdW5jdCcgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCcgJ25vb24nXG4gICAgICAgIGluYyByZ3MsIDAgICcvJyAgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICAnXFxcXCcgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAxNSAnLicgICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMTkgJzonICAncHVuY3QnXG4gICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgMCAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICBcbiAgICBpdCAnaHRtbCcgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjwvZGl2PlwiICdodG1sJyBcbiAgICAgICAgaW5jIHJncywgMCBcIjxcIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMSBcIi9cIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMiBcImRpdlwiICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAgICAncHVuY3Qga2V5d29yZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI8ZGl2PlwiICdodG1sJyBcbiAgICAgICAgaW5jIHJncywgMCBcIjxcIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMSBcImRpdlwiICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNCBcIj5cIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICBcbiAgICBcbiAgICBpdCAnY3BwJyAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2luY2x1ZGVcIiAnY3BwJyAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiaW5jbHVkZVwiICAnZGVmaW5lJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiNpZlwiICdjcHAnICAgICAgICAgICAgXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgICAgICAgICdwdW5jdCBkZWZpbmUnXG4gICAgICAgIGluYyByZ3MsIDEgXCJpZlwiICAgICAgICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIyAgaWZcIiAnY3BwJyAgICAgICAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiaWZcIiAgICAgICAnZGVmaW5lJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmICh0cnVlKSB7fSBlbHNlIHt9XCIgJ2NwcCcgICAgXG4gICAgICAgIGluYyByZ3MsIDAgXCJpZlwiICAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA0IFwidHJ1ZVwiICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMTMgXCJlbHNlXCIgJ2tleXdvcmQnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMS4wZlwiICdjcHAnXG4gICAgICAgIGluYyByZ3MsIDAgXCIxXCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDEgXCIuXCIgICdwdW5jdCBudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIwZlwiICdudW1iZXIgZmxvYXQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMC4wMDAwZlwiICdjcHAnXG4gICAgICAgIGluYyByZ3MsIDIgXCIwMDAwZlwiICdudW1iZXIgZmxvYXQnXG4gICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgIyBpdCAnaXNzJyAtPlxuIyAgICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImE9eyNrZXl9XCIgJ2lzcydcbiAgICAgICAgIyBpbmMgcmdzLCAyICd7JyAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCAzIFwiI1wiICAgJ3B1bmN0IHByb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDQgJ2tleScgJ3Byb3BlcnR5IHRleHQnXG4gICAgICAgICMgaW5jIHJncywgNyBcIn1cIiAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdqcycgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZ1bmMgPSBmdW5jdGlvbigpIHtcIiAnanMnXG4gICAgICAgIGluYyByZ3MsIDAgJ2Z1bmMnICdmdW5jdGlvbidcbiAgICAgICAgaW5jIHJncywgNyAnZnVuY3Rpb24nICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NoJyAtPlxuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImRpci9wYXRoL3dpdGgvZGFzaGVzL2ZpbGUudHh0XCIgJ3NoJ1xuICAgICAgICBpbmMgcmdzLCAwICdkaXInICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNCAncGF0aCcgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA5ICd3aXRoJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE0ICdkYXNoZXMnICd0ZXh0IGRpcidcbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiZGlyL3BhdGgtd2l0aC1kYXNoZXMvZmlsZS50eHRcIiAnc2gnXG4gICAgICAgICMgaW5jIHJncywgMCAnZGlyJyAnZGlyIHRleHQnXG4gICAgICAgICMgaW5jIHJncywgNCAncGF0aCcgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDkgJ3dpdGgnICdkaXIgdGV4dCdcbiAgICAgICAgIyBpbmMgcmdzLCAxNCAnZGFzaGVzJyAnZGlyIHRleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJwcmcgLS1hcmcxIC1hcmcyXCIgJ3NoJ1xuICAgICAgICBpbmMgcmdzLCA0ICctJyAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDUgJy0nICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgNiAnYXJnMScgJ2FyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCAxMSAnLScgJ3B1bmN0IGFyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCAxMiAnYXJnMicgJ2FyZ3VtZW50J1xuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdsb2cnIC0+XG5cbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCJodHRwOi8vZG9tYWluLmNvbVwiICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgIyBpbmMgcmdzLCA0ICc6JyAncHVuY3QgdXJsJ1xuICAgICAgICAjIGluYyByZ3MsIDUgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgICMgaW5jIHJncywgNiAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgIyBpbmMgcmdzLCA3ICdkb21haW4nICd1cmwgZG9tYWluJ1xuICAgICAgICAjIGluYyByZ3MsIDEzICcuJyAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgIyBpbmMgcmdzLCAxNCAnY29tJyAndXJsIHRsZCdcbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiZmlsZS5jb2ZmZWVcIiAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAgJ2ZpbGUnICdjb2ZmZWUgZmlsZSdcbiAgICAgICAgIyBpbmMgcmdzLCA0ICcuJyAncHVuY3QgY29mZmVlJ1xuICAgICAgICAjIGluYyByZ3MsIDUgJ2NvZmZlZScgJ2NvZmZlZSBleHQnXG5cbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCJrZXkgL1wiICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCAna2V5JyAgICd0ZXh0J1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiL3NvbWUvcGF0aFwiICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMSAnc29tZScgICAnZGlyIHRleHQnXG4gICAgICAgICMgaW5jIHJncywgNSAnLycgICAgICAncHVuY3QgZGlyJ1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwia2V5OiB2YWx1ZVwiICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCAna2V5JyAgICAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICMgaW5jIHJncywgMyAnOicgICAgICAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnbm9vbicgLT5cbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiICAgIHByb3BlcnR5ICB2YWx1ZVwiICdub29uJ1xuICAgICAgICAjIGluYyByZ3MsIDQgJ3Byb3BlcnR5JyAncHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgMTQgJ3ZhbHVlJyAndGV4dCdcblxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcIiAgICBwcm9wLmVydHkgIHZhbHVlXCIgJ25vb24nXG4gICAgICAgICMgaW5jIHJncywgNCAncHJvcCcgJ3Byb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDggJy4nICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCA5ICdlcnR5JyAncHJvcGVydHknXG4gICAgICAgIFxuIyMjXG4wMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgICBcbjAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiMjI1xuXG5kZXNjcmliZSAnYmxvY2tzJyAtPlxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpdCAnY29tbWVudCcgLT5cbiAgICAgXG4gICAgICAgIGJsb2NrcyhbXCIjI1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnIHR1cmQ6XCIjI1wifSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICBcbiAgICAgICAgYmxvY2tzKFtcIiwjYVwiXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6XCIsXCIgdmFsdWU6J3B1bmN0JyB0dXJkOiBcIiwjXCJ9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCd9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDpcImFcIiB2YWx1ZTonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ2Z1bmN0aW9uJyAtPlxuICAgIFxuICAgICAgICBibG9ja3MoWyctPiddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6ICctPid9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgYmxvY2tzKFsnPT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jz0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJyB0dXJkOiAnPT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgIGJsb2NrcyhbJ2Y9LT4xJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczo1IGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOidmJyB2YWx1ZTonZnVuY3Rpb24nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbicgICAgICB0dXJkOic9LT4nIH0gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoyIGxlbmd0aDoxIG1hdGNoOictJyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDonLT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjMgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDo0IGxlbmd0aDoxIG1hdGNoOicxJyB2YWx1ZTonbnVtYmVyJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnbWluaW1hbCcgLT5cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGJsb2NrcyhbJzEnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IF1dXG4gICAgICAgIGJsb2NrcyhbJ2EnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3RleHQnfSBdXVxuICAgICAgICBibG9ja3MoWycuJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy4nIHZhbHVlOidwdW5jdCd9IF1dXG4gICAgXG4gICAgICAgIGJsb2NrcyhbJzEuYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOicxJyB2YWx1ZTonbnVtYmVyJ30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjEgbWF0Y2g6Jy4nIHZhbHVlOidwdW5jdCBwcm9wZXJ0eSd9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgIGxlbmd0aDoxIG1hdGNoOidhJyB2YWx1ZToncHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgYmxvY2tzKFsnKythJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCAgbGVuZ3RoOjEgbWF0Y2g6JysnIHZhbHVlOidwdW5jdCcgdHVyZDonKysnfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MSBtYXRjaDonKycgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGJsb2NrcyhbXCLilrhkb2MgJ2hlbGxvJ1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOifilrgnICAgICB2YWx1ZToncHVuY3QgbWV0YSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MyBtYXRjaDonZG9jJyAgIHZhbHVlOidtZXRhJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjUgIGxlbmd0aDoxIG1hdGNoOlwiJ1wiICAgICB2YWx1ZToncHVuY3Qgc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDo2ICBsZW5ndGg6NSBtYXRjaDpcImhlbGxvXCIgdmFsdWU6J3N0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MTEgbGVuZ3RoOjEgbWF0Y2g6XCInXCIgICAgIHZhbHVlOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnc3BhY2UnIC0+XG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgW1wieFwiXVxuICAgICAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDBcbiAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBbXCIgeHhcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAxXG4gICAgICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcIiAgICB4eHhcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgW1wiICAgIHggMSAgLCBcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgICAgIGJbMF0uY2h1bmtzWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNlxuICAgICAgICBiWzBdLmNodW5rc1syXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDlcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ3N3aXRjaGVzJyAtPlxuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgICBcbiAgICAgICAgICAgICAgICB5XG4gICAgICAgICAgICBpZiAxIHRoZW4gZmFsc2VcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIHggIFxuICAgICAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgICAgICBgYGBcbiAgICAgICAgICAgICAgICB5XG4gICAgICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0ICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgMSsxICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICDilrhkb2MgJ2FnYWluJyAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvbWUgKipkb2NzKiogICAgIFxuICAgICAgICAgICAgICAgIGBgYCAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgeSAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbicgICAgICAgICAgICAgICBcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbN10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzhdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9vYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgXG4gICAgICAgICAgICBcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMTtcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgXCJcIlwiLnNwbGl0KCdcXG4nKSwgJ21kJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2pzJ1xuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/test.coffee