// koffee 0.45.0

/*
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000
 */
var Blocks, _, blocks, dissect, inc, kxk, nut, ranges;

Blocks = require('./blocks');

kxk = require('kxk');

kxk.chai();

_ = kxk._;

inc = function(rgs, start, match, value) {
    return rgs.map(function(r) {
        return _.pick(r, ['start', 'match', 'value']);
    }).should.deep.include({
        start: start,
        match: match,
        value: value
    });
};

nut = function(rgs, start, match, value) {
    return rgs.map(function(r) {
        return _.pick(r, ['start', 'match', 'value']);
    }).should.not.deep.include({
        start: start,
        match: match,
        value: value
    });
};

blocks = Blocks.blocks;

ranges = Blocks.ranges;

dissect = function(c, l) {
    return Blocks.dissect(c.split('\n'), l);
};

''


/*
00000000    0000000   000   000   0000000   00000000   0000000  
000   000  000   000  0000  000  000        000       000       
0000000    000000000  000 0 000  000  0000  0000000   0000000   
000   000  000   000  000  0000  000   000  000            000  
000   000  000   000  000   000   0000000   00000000  0000000
 */

describe('ranges', function() {
    it('fallback', function() {
        var rgs;
        rgs = ranges('text', 'unknown');
        inc(rgs, 0, 'text', 'text');
        rgs = ranges('text', 'fish');
        return inc(rgs, 0, 'text', 'text');
    });
    it('unicode', function() {
        var rgs;
        rgs = ranges("🌈");
        inc(rgs, 0, '🌈', 'punct');
        rgs = ranges("🌈🌱");
        inc(rgs, 0, '🌈', 'punct');
        inc(rgs, 2, '🌱', 'punct');
        rgs = ranges("🙂lol😀");
        inc(rgs, 0, '🙂', 'punct');
        inc(rgs, 2, 'lol', 'text');
        inc(rgs, 5, '😀', 'punct');
        rgs = ranges("a➜b a▬▶b");
        inc(rgs, 1, '➜', 'punct');
        inc(rgs, 5, '▬', 'punct');
        inc(rgs, 6, '▶', 'punct');
        rgs = ranges("🐀🐁🐂🐃🐄🐅🐆🐇🐈🐉🐊🐋🐌🐍🐎🐏🐐🐑🐒🐓🐔🐕🐖🐗🐘🐙🐚🐛🐜🐝🐞🐟🐠🐡🐢🐣🐤🐥");
        inc(rgs, 0, '🐀', 'punct');
        return inc(rgs, 24, '🐌', 'punct');
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
        dss = dissect("###\na\n###", 'coffee');
        inc(dss[0], 0, "#", 'punct comment triple');
        inc(dss[0], 1, "#", 'punct comment triple');
        inc(dss[0], 2, "#", 'punct comment triple');
        inc(dss[1], 0, "a", 'comment triple');
        inc(dss[2], 0, "#", 'punct comment triple');
        inc(dss[2], 1, "#", 'punct comment triple');
        inc(dss[2], 2, "#", 'punct comment triple');
        dss = dissect("/*\na\n*/", 'styl');
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
        dss = dissect("###\n 0 00 0 \n###", 'coffee');
        inc(dss[1], 1, "0", 'comment triple header');
        rgs = ranges("// 000", 'styl');
        inc(rgs, 3, "000", 'comment header');
        dss = dissect("/*\n 0 0 0 \n*/", 'styl');
        inc(dss[1], 1, "0", 'comment triple header');
        rgs = ranges("# 0 * 0.2");
        inc(rgs, 2, '0', 'comment');
        inc(rgs, 6, '0', 'comment');
        dss = dissect("###\n 0 1 0 \n###", 'coffee');
        return inc(dss[1], 1, "0", 'comment triple');
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
        var i, j, k, len, len1, ref, ref1, rgs;
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
        inc(rgs, 11, "'", 'punct string single triple');
        rgs = ranges('"#{xxx}"', 'coffee');
        inc(rgs, 0, '"', 'punct string double');
        inc(rgs, 1, "#", 'punct string interpolation start');
        inc(rgs, 2, "{", 'punct string interpolation start');
        inc(rgs, 3, 'xxx', 'text');
        inc(rgs, 6, "}", 'punct string interpolation end');
        inc(rgs, 7, '"', 'punct string double');
        rgs = ranges('"#{666}"', 'coffee');
        inc(rgs, 0, '"', 'punct string double');
        inc(rgs, 3, '666', 'number');
        inc(rgs, 7, '"', 'punct string double');
        rgs = ranges('"#{__dirname}/../"', 'coffee');
        inc(rgs, 12, '}', 'punct string interpolation end');
        return inc(rgs, 13, '/', 'string double');
    });
    it('coffee', function() {
        var rgs;
        rgs = ranges("util = require 'util'", 'coffee');
        inc(rgs, 7, 'require', 'require');
        rgs = ranges("class Macro extends Command", 'coffee');
        inc(rgs, 0, 'class', 'keyword');
        inc(rgs, 6, 'Macro', 'class');
        inc(rgs, 12, 'extends', 'keyword');
        inc(rgs, 20, 'Command', 'class');
        rgs = ranges("exist?.prop", 'coffee');
        inc(rgs, 7, 'prop', 'property');
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
        inc(rgs, 6, '.', 'punct');
        rgs = ranges("@f [1]", 'coffee');
        inc(rgs, 0, "@", 'punct function call');
        inc(rgs, 1, "f", 'function call');
        rgs = ranges("@f = 1", 'coffee');
        inc(rgs, 0, "@", 'punct this');
        inc(rgs, 1, "f", 'text this');
        rgs = ranges("@height/2 + @height/6", 'coffee');
        inc(rgs, 0, '@', 'punct this');
        inc(rgs, 1, 'height', 'text this');
        return inc(rgs, 8, "2", 'number');
    });
    it('coffee function', function() {
        var rgs;
        rgs = ranges("dolater =>");
        inc(rgs, 8, '=', 'punct function bound tail');
        inc(rgs, 9, '>', 'punct function bound head');
        rgs = ranges("dolater ->");
        inc(rgs, 8, '-', 'punct function tail');
        inc(rgs, 9, '>', 'punct function head');
        rgs = ranges("@a @b 'c'", 'coffee');
        inc(rgs, 0, '@', 'punct function call');
        inc(rgs, 1, 'a', 'function call');
        inc(rgs, 3, '@', 'punct function call');
        inc(rgs, 4, 'b', 'function call');
        rgs = ranges("@a 3 @b '5'");
        inc(rgs, 0, '@', 'punct function call');
        inc(rgs, 1, 'a', 'function call');
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
        inc(rgs, 17, '>', 'punct function bound head');
        rgs = ranges("@mthd: (arg) ->");
        inc(rgs, 0, '@', 'punct method class');
        return inc(rgs, 1, 'mthd', 'method class');
    });
    it('koffee', function() {
        var rgs;
        rgs = ranges(" @: ->", 'coffee');
        inc(rgs, 1, "@", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "-", 'punct function tail');
        inc(rgs, 5, ">", 'punct function head');
        rgs = ranges(" @:->a", 'coffee');
        inc(rgs, 1, "@", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 3, "-", 'punct function tail');
        inc(rgs, 4, ">", 'punct function head');
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
        rgs = ranges("///a///,b", 'coffee');
        inc(rgs, 0, "/", 'punct regexp triple');
        inc(rgs, 1, "/", 'punct regexp triple');
        inc(rgs, 2, "/", 'punct regexp triple');
        inc(rgs, 3, "a", 'text regexp triple');
        inc(rgs, 4, "/", 'punct regexp triple');
        inc(rgs, 5, "/", 'punct regexp triple');
        inc(rgs, 6, "/", 'punct regexp triple');
        inc(rgs, 8, "b", 'text');
        dss = dissect("///\na\n///", 'coffee');
        inc(dss[0], 0, "/", 'punct regexp triple');
        inc(dss[0], 1, "/", 'punct regexp triple');
        inc(dss[0], 2, "/", 'punct regexp triple');
        inc(dss[1], 0, "a", 'text regexp triple');
        inc(dss[2], 0, "/", 'punct regexp triple');
        inc(dss[2], 1, "/", 'punct regexp triple');
        inc(dss[2], 2, "/", 'punct regexp triple');
        dss = dissect("///\n    ([\\\\?]) # comment\n///, a", 'coffee');
        inc(dss[0], 0, "/", 'punct regexp triple');
        inc(dss[0], 1, "/", 'punct regexp triple');
        inc(dss[0], 2, "/", 'punct regexp triple');
        inc(dss[1], 4, "(", 'punct regexp triple');
        inc(dss[1], 6, "\\", 'punct escape regexp triple');
        inc(dss[1], 12, "#", 'punct comment');
        inc(dss[1], 14, "comment", 'comment');
        inc(dss[2], 0, "/", 'punct regexp triple');
        inc(dss[2], 1, "/", 'punct regexp triple');
        inc(dss[2], 2, "/", 'punct regexp triple');
        inc(dss[2], 5, "a", 'text');
        dss = dissect("arr = [ ///a\#{b}///\n        key: 'value'\n      ]", 'coffee');
        return inc(dss[1], 8, 'key', 'dictionary key');
    });
    it('no regexp', function() {
        var rgs;
        rgs = ranges('a / b - c / d', 'coffee');
        nut(rgs, 2, '/', 'punct regexp start');
        rgs = ranges('f a/b, c/d', 'coffee');
        nut(rgs, 3, '/', 'punct regexp start');
        rgs = ranges("m = '/'", 'coffee');
        nut(rgs, 5, '/', 'punct regexp start');
        rgs = ranges("m a, '/''/'", 'coffee');
        nut(rgs, 6, '/', 'punct regexp start');
        rgs = ranges("\"m = '/'\"", 'coffee');
        nut(rgs, 6, '/', 'punct regexp start');
        rgs = ranges("s = '/some\\path/file.txt:10'", 'coffee');
        nut(rgs, 5, '/', 'punct regexp start');
        nut(rgs, 9, '/', 'punct regexp start');
        rgs = ranges("num /= 10");
        nut(rgs, 4, '/', 'punct regexp start');
        nut(rgs, 7, '10', 'text regexp');
        rgs = ranges("4 / 2 / 1");
        inc(rgs, 2, '/', 'punct');
        inc(rgs, 6, '/', 'punct');
        rgs = ranges("4/2/1");
        inc(rgs, 1, '/', 'punct');
        inc(rgs, 3, '/', 'punct');
        rgs = ranges("4/ 2 / 1");
        inc(rgs, 1, '/', 'punct');
        inc(rgs, 5, '/', 'punct');
        rgs = ranges("4 /2 / 1");
        inc(rgs, 2, '/', 'punct');
        inc(rgs, 5, '/', 'punct');
        rgs = ranges("4 / 2/ 1");
        inc(rgs, 2, '/', 'punct');
        inc(rgs, 5, '/', 'punct');
        rgs = ranges("4 / 2 /1");
        inc(rgs, 2, '/', 'punct');
        inc(rgs, 6, '/', 'punct');
        rgs = ranges("4 /2/ 1");
        inc(rgs, 2, '/', 'punct');
        return inc(rgs, 4, '/', 'punct');
    });
    it('md', function() {
        var dss, rgs;
        rgs = ranges("**bold**", 'md');
        inc(rgs, 0, '*', 'punct bold');
        inc(rgs, 1, '*', 'punct bold');
        inc(rgs, 2, 'bold', 'text bold');
        inc(rgs, 6, '*', 'punct bold');
        inc(rgs, 7, '*', 'punct bold');
        rgs = ranges(",**b**,", 'md');
        inc(rgs, 1, '*', 'punct bold');
        inc(rgs, 3, 'b', 'text bold');
        inc(rgs, 4, '*', 'punct bold');
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
        dss = dissect("▸doc 'md'\n    if is empty in then", 'coffee');
        inc(dss[1], 4, 'if', 'text');
        inc(dss[1], 7, 'is', 'text');
        inc(dss[1], 10, 'empty', 'text');
        inc(dss[1], 16, 'in', 'text');
        inc(dss[1], 19, 'then', 'text');
        rgs = ranges('```coffeescript', 'md');
        inc(rgs, 0, '`', 'punct code triple');
        inc(rgs, 3, 'coffeescript', 'comment');
        rgs = ranges("- li", 'md');
        inc(rgs, 0, '-', 'punct li1 marker');
        inc(rgs, 2, 'li', 'text li1');
        rgs = ranges("    - **bold**", 'md');
        inc(rgs, 4, '-', 'punct li2 marker');
        inc(rgs, 8, 'bold', 'text li2 bold');
        rgs = ranges("        - **bold**", 'md');
        inc(rgs, 8, '-', 'punct li3 marker');
        inc(rgs, 12, 'bold', 'text li3 bold');
        rgs = ranges("        * **bold**", 'md');
        inc(rgs, 8, '*', 'punct li3 marker');
        inc(rgs, 12, 'bold', 'text li3 bold');
        dss = dissect("- li1\ntext", 'md');
        inc(dss[0], 0, '-', 'punct li1 marker');
        inc(dss[1], 0, 'text', 'text');
        dss = dissect("# h1\n## h2\n### h3\n#### h4\n##### h5", 'md');
        inc(dss[0], 0, "#", 'punct h1');
        inc(dss[0], 2, "h1", 'text h1');
        inc(dss[1], 0, "#", 'punct h2');
        inc(dss[1], 3, "h2", 'text h2');
        inc(dss[2], 0, "#", 'punct h3');
        inc(dss[2], 4, "h3", 'text h3');
        inc(dss[3], 0, "#", 'punct h4');
        inc(dss[3], 5, "h4", 'text h4');
        inc(dss[4], 0, "#", 'punct h5');
        inc(dss[4], 6, "h5", 'text h5');
        dss = dissect("```js\n```", 'md');
        return inc(dss[1], 0, '`', 'punct code triple');
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
    return it('noon', function() {
        var rgs;
        rgs = ranges('/some\\path/file.txt:10', 'noon');
        inc(rgs, 0, '/', 'punct');
        inc(rgs, 5, '\\', 'punct');
        inc(rgs, 15, '.', 'punct');
        return inc(rgs, 19, ':', 'punct');
    });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7QUFDTixHQUFHLENBQUMsSUFBSixDQUFBOztBQUNBLENBQUEsR0FBSSxHQUFHLENBQUM7O0FBRVIsR0FBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCO1dBQThCLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBTyxDQUFQLEVBQVUsQ0FBQyxPQUFELEVBQVEsT0FBUixFQUFlLE9BQWYsQ0FBVjtJQUFQLENBQVIsQ0FBa0QsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQS9ELENBQTJFO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsS0FBQSxFQUFNLEtBQWhDO0tBQTNFO0FBQTlCOztBQUNOLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixLQUFwQjtXQUE4QixHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxJQUFGLENBQU8sQ0FBUCxFQUFVLENBQUMsT0FBRCxFQUFRLE9BQVIsRUFBZSxPQUFmLENBQVY7SUFBUCxDQUFSLENBQWtELENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBbkUsQ0FBMkU7UUFBQSxLQUFBLEVBQU0sS0FBTjtRQUFhLEtBQUEsRUFBTSxLQUFuQjtRQUEwQixLQUFBLEVBQU0sS0FBaEM7S0FBM0U7QUFBOUI7O0FBRU4sTUFBQSxHQUFVLE1BQU0sQ0FBQzs7QUFDakIsTUFBQSxHQUFVLE1BQU0sQ0FBQzs7QUFDakIsT0FBQSxHQUFVLFNBQUMsQ0FBRCxFQUFH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Y2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiMjI1xuXG5CbG9ja3MgPSByZXF1aXJlICcuL2Jsb2Nrcydcbmt4ayA9IHJlcXVpcmUgJ2t4aydcbmt4ay5jaGFpKClcbl8gPSBreGsuX1xuXG5pbmMgPSAocmdzLCBzdGFydCwgbWF0Y2gsIHZhbHVlKSAtPiByZ3MubWFwKChyKSAtPiBfLnBpY2sgciwgWydzdGFydCcnbWF0Y2gnJ3ZhbHVlJ10gKS5zaG91bGQuZGVlcC5pbmNsdWRlICAgICBzdGFydDpzdGFydCwgbWF0Y2g6bWF0Y2gsIHZhbHVlOnZhbHVlXG5udXQgPSAocmdzLCBzdGFydCwgbWF0Y2gsIHZhbHVlKSAtPiByZ3MubWFwKChyKSAtPiBfLnBpY2sgciwgWydzdGFydCcnbWF0Y2gnJ3ZhbHVlJ10gKS5zaG91bGQubm90LmRlZXAuaW5jbHVkZSBzdGFydDpzdGFydCwgbWF0Y2g6bWF0Y2gsIHZhbHVlOnZhbHVlXG5cbmJsb2NrcyAgPSBCbG9ja3MuYmxvY2tzXG5yYW5nZXMgID0gQmxvY2tzLnJhbmdlc1xuZGlzc2VjdCA9IChjLGwpIC0+IEJsb2Nrcy5kaXNzZWN0IGMuc3BsaXQoJ1xcbicpLCBsXG4gIFxu4pa4ZG9jICdzYW1wbGUnXG4gICAgYGBgY29mZmVlc2NyaXB0XG4gICAgY2xhc3MgQ2xhc3MgZXh0ZW5kcyBTdXBlclxuICAgICAgICBAOiAtPiBAYSAzIGIgQGMrMSAvZC9cbiAgICBgYGBcblxuIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4jIyNcblxuZGVzY3JpYmUgJ3JhbmdlcycgLT5cbiAgICAgICAgICBcbiAgICBpdCAnZmFsbGJhY2snIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ3RleHQnLCAndW5rbm93bidcbiAgICAgICAgaW5jIHJncywgMCAndGV4dCcsICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAndGV4dCcsICdmaXNoJ1xuICAgICAgICBpbmMgcmdzLCAwICd0ZXh0JywgJ3RleHQnXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAndW5pY29kZScgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIvCfjIhcIlxuICAgICAgICBpbmMgcmdzLCAwICfwn4yIJyAncHVuY3QnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwi8J+MiPCfjLFcIlxuICAgICAgICBpbmMgcmdzLCAwICfwn4yIJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDIgJ/CfjLEnICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIvCfmYJsb2zwn5iAXCJcbiAgICAgICAgaW5jIHJncywgMCAn8J+ZgicgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAyICdsb2wnICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA1ICfwn5iAJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJh4p6cYiBh4pas4pa2YlwiXG4gICAgICAgICMgbG9nIHJnc1xuICAgICAgICBpbmMgcmdzLCAxICfinpwnICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAn4pasJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDYgJ+KWticgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwi8J+QgPCfkIHwn5CC8J+Qg/CfkITwn5CF8J+QhvCfkIfwn5CI8J+QifCfkIrwn5CL8J+QjPCfkI3wn5CO8J+Qj/CfkJDwn5CR8J+QkvCfkJPwn5CU8J+QlfCfkJbwn5CX8J+QmPCfkJnwn5Ca8J+Qm/CfkJzwn5Cd8J+QnvCfkJ/wn5Cg8J+QofCfkKLwn5Cj8J+QpPCfkKVcIlxuICAgICAgICBpbmMgcmdzLCAwICfwn5CAJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDI0ICfwn5CMJyAncHVuY3QnXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdjb21tZW50cycgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImhlbGxvICMgd29ybGRcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiI1wiICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA4IFwid29ybGRcIiAnY29tbWVudCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgICAjIGJsYSBibHViXCIgJ25vb24nXG4gICAgICAgIGluYyByZ3MsIDMgXCIjXCIgICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA1IFwiYmxhXCIgICAnY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgOSBcImJsdWJcIiAgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKF5cXHMqI1xccyopKC4qKSRcIiAnbm9vbidcbiAgICAgICAgZm9yIHJuZyBpbiByZ3NcbiAgICAgICAgICAgIHJuZy5zaG91bGQubm90LmhhdmUucHJvcGVydHkgJ3ZhbHVlJyAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgIGl0ICd0cmlwbGUgY29tbWVudCcgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMjI2EjIyNcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMSBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDIgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiYVwiICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNCBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDUgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiIyMjXFxuYVxcbiMjI1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMF0sIDAgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAxIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMiBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDAgXCJhXCIgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAwIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMSBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDIgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIvKlxcbmFcXG4qL1wiICdzdHlsJ1xuICAgICAgICBpbmMgZHNzWzBdLCAwIFwiL1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSBcIipcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDAgXCJhXCIgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAwIFwiKlwiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMSBcIi9cIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIFxuICAgIGl0ICdjb21tZW50IGhlYWRlcicgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMgMCAwMCAwMDAwXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAgXCIjXCIgICAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDIgIFwiMFwiICAgICdjb21tZW50IGhlYWRlcidcbiAgICAgICAgaW5jIHJncywgNCAgXCIwMFwiICAgJ2NvbW1lbnQgaGVhZGVyJ1xuICAgICAgICBpbmMgcmdzLCA3ICBcIjAwMDBcIiAnY29tbWVudCBoZWFkZXInXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIiMjI1xcbiAwIDAwIDAgXFxuIyMjXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMSBcIjBcIiAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLy8gMDAwXCIgJ3N0eWwnXG4gICAgICAgIGluYyByZ3MsIDMgIFwiMDAwXCIgICAgJ2NvbW1lbnQgaGVhZGVyJ1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIvKlxcbiAwIDAgMCBcXG4qL1wiICdzdHlsJ1xuICAgICAgICBpbmMgZHNzWzFdLCAxIFwiMFwiICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjIDAgKiAwLjJcIlxuICAgICAgICBpbmMgcmdzLCAyICcwJyAnY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgNiAnMCcgJ2NvbW1lbnQnXG4gICAgICAgIFxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiIyMjXFxuIDAgMSAwIFxcbiMjI1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMV0sIDEgXCIwXCIgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ251bWJlcnMnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhIDY2NzBcIlxuICAgICAgICBpbmMgcmdzLCAyIFwiNjY3MFwiICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMHg2NjdBQ1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCIweDY2N0FDXCIgJ251bWJlciBoZXgnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNjYuNzAwXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjY2XCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIuXCIgICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAzIFwiNzAwXCIgJ251bWJlciBmbG9hdCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI3Ny44MDAgLTEwMFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCI3N1wiICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA4IFwiMTAwXCIgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIoOC45LDEwMC4yKVwiXG4gICAgICAgIGluYyByZ3MsIDMgXCI5XCIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgOSBcIjJcIiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzZW12ZXInIC0+ICAgIFxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNjYuNzAuMFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCI2NlwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDIgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCI3MFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDYgXCIwXCIgICdzZW12ZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXjAuNy4xXCJcbiAgICAgICAgaW5jIHJncywgMSBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiN1wiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIxXCIgJ3NlbXZlcidcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJeMS4wLjAtYWxwaGEuMTJcIlxuICAgICAgICBpbmMgcmdzLCAxIFwiMVwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ3N0cmluZ3MnIC0+XG4gICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlwiXCJhPVwiXFxcXFwiRVxcXFxcIlwiIFwiXCJcIlxuICAgICAgICBpbmMgcmdzLCAyICdcIicgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDQgJ1wiJyAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNSAnRScgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDggJ1wiJyAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cIlxcJ1hcXCdcIidcbiAgICAgICAgaW5jIHJncywgMiAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMgXCInXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNCBcIlhcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA2ICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XFwnXCJYXCJcXCcnICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDIgXCInXCIgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgMyAnXCInICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDQgJ1gnICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCInXCIgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XCIgIFxcJ1hcXCcgIFkgIFwiICdcbiAgICAgICAgaW5jIHJncywgMiAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDUgXCInXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNiBcIlhcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA3IFwiJ1wiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDEzICdcIicgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cIlwiO2I9XCIgXCI7Yz1cIlhcIidcbiAgICAgICAgZm9yIGkgaW4gWzIgMyA3IDkgMTMgMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCAnXCInLCAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTQgJ1gnICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhPScnO2I9JyAnO2M9J1knXCIgJ2NvZmZlZSdcbiAgICAgICAgZm9yIGkgaW4gWzIgMyA3IDkgMTMgMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCBcIidcIiwgJ3B1bmN0IHN0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDE0ICdZJyAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnJydcInMgPSAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCdcIicnJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiJ1wiICAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTcgXCJmaWxlXCIgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDIxIFwiLlwiICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyMiBcInR4dFwiICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjYgXCIxMFwiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDI4IFwiJ1wiICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyOSAnXCInICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICcnJ3doZW4gJ1wiXCJcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSB0cmlwbGVcXCcnJydcbiAgICAgICAgaW5jIHJncywgNiAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNyAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgOCAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIicnJ3doZW5cXFxcJycnJ1wiXG4gICAgICAgIGluYyByZ3MsIDMgIFwid2hlblwiICAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDggIFwiJ1wiICAgICAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDExIFwiJ1wiICAgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG5cbiAgICAgICAgIyByZ3MgPSByYW5nZXMgJ2E9YFwiWFwiYCdcbiAgICAgICAgIyBpbmMgcmdzLCAyIFwiYFwiICAgJ3B1bmN0IHN0cmluZyBiYWNrdGljaydcbiAgICAgICAgIyBpbmMgcmdzLCAzICdcIicgICAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICAjIGluYyByZ3MsIDQgJ1gnICAgJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgIyBpbmMgcmdzLCA2IFwiYFwiICAgJ3B1bmN0IHN0cmluZyBiYWNrdGljaydcbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiYT1gYDtiPWAgYDtjPWBaYFwiXG4gICAgICAgICMgZm9yIGkgaW4gWzIgMyA3IDkgMTMgMTVdXG4gICAgICAgICAgICAjIGluYyByZ3MsIGksIFwiYFwiLCAncHVuY3Qgc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICAjIGluYyByZ3MsIDE0ICdaJyAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBcbiAgICAgICAgIyBpbnRlcnBvbGF0aW9uXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiI3t4eHh9XCInICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiI1wiICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAyIFwie1wiICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAzICd4eHgnICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA2IFwifVwiICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgaW5jIHJncywgNyAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIiN7NjY2fVwiJyAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMyAnNjY2JyAnbnVtYmVyJ1xuICAgICAgICBpbmMgcmdzLCA3ICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIje19fZGlybmFtZX0vLi4vXCInICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDEyLCAnfScgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgaW5jIHJncywgMTMsICcvJyAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2NvZmZlZScgLT5cblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ1dGlsID0gcmVxdWlyZSAndXRpbCdcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA3ICdyZXF1aXJlJyAncmVxdWlyZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImNsYXNzIE1hY3JvIGV4dGVuZHMgQ29tbWFuZFwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgICdjbGFzcycgICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNiAgJ01hY3JvJyAgICdjbGFzcydcbiAgICAgICAgaW5jIHJncywgMTIgJ2V4dGVuZHMnICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyMCAnQ29tbWFuZCcgJ2NsYXNzJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZXhpc3Q/LnByb3BcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA3ICdwcm9wJyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYSBhbmQgYlwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJhXCIgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIgXCJhbmRcIiAna2V5d29yZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpZiBhIHRoZW4gYlwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJpZlwiICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiYVwiICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA1IFwidGhlblwiICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxMCBcImJcIiAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJzd2l0Y2ggYVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJzd2l0Y2hcIiAna2V5d29yZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBhOiBiXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSBcImFcIiAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJvYmoudmFsdWUgPSBvYmouYW5vdGhlci52YWx1ZVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgIFwib2JqXCIgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgNCAgXCJ2YWx1ZVwiICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEyIFwib2JqXCIgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgMTYgXCJhbm90aGVyXCIncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDI0IFwidmFsdWVcIiAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIHNvbWVPYmplY3Quc29tZVByb3BcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiaWZcIiAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMyBcInNvbWVPYmplY3RcIiAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxMyBcIi5cIiAncHVuY3QgcHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDE0IFwic29tZVByb3BcIiAncHJvcGVydHknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIxICdhJ1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCIxXCIgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWzBdLnByb3BcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAzICddJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJbIGYgXVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDIgJ2YnICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsgZiAsIGYgXVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDIgJ2YnICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsuLi4yXVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDIgJy4nICdwdW5jdCByYW5nZSdcbiAgICAgICAgaW5jIHJncywgMyAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCA0ICcuJyAncHVuY3QgcmFuZ2UnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsgLTEgLi4gXVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDYgJy4nICdwdW5jdCByYW5nZSdcbiAgICAgICAgaW5jIHJncywgNyAnLicgJ3B1bmN0IHJhbmdlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbMS4ubl1cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAzICcuJyAncHVuY3QgcmFuZ2UnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCByYW5nZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWyAuLi4uIF1cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAzICcuJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAnLicgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA2ICcuJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAZiBbMV1cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiQFwiICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBmID0gMVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJAXCIgJ3B1bmN0IHRoaXMnXG4gICAgICAgIGluYyByZ3MsIDEgXCJmXCIgJ3RleHQgdGhpcydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBoZWlnaHQvMiArIEBoZWlnaHQvNlwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICAgICAgJ3B1bmN0IHRoaXMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2hlaWdodCcgJ3RleHQgdGhpcydcbiAgICAgICAgaW5jIHJncywgOCBcIjJcIiAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiAgICBpdCAnY29mZmVlIGZ1bmN0aW9uJyAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZG9sYXRlciA9PlwiXG4gICAgICAgIGluYyByZ3MsIDggJz0nICdwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA5ICc+JyAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJkb2xhdGVyIC0+XCJcbiAgICAgICAgaW5jIHJncywgOCAnLScgJ3B1bmN0IGZ1bmN0aW9uIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDkgJz4nICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQGEgQGIgJ2MnXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAnQCcgJ3B1bmN0IGZ1bmN0aW9uIGNhbGwnXG4gICAgICAgIGluYyByZ3MsIDEgJ2EnICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAzICdAJyAncHVuY3QgZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgaW5jIHJncywgNCAnYicgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAYSAzIEBiICc1J1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAxICdhJyAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmZmYgMVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiAnYSdcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmYgJ2InXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcImZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmZiAtMVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiBbMV1cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmZmYgezF9XCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcImZmZmZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSArK2FcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKzRcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpIC00XCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJwb3M9IChpdGVtLCBwKSAtPiBcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwicG9zXCIgJ2Z1bmN0aW9uJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAhPSBmYWxzZVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKz0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAtPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAqPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAvPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpID8gZmFsc2VcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpIDwgM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgPiAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSArIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpIC0gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKiAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAvIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICUgM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgPSAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSA9PSAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaXQgJ2NvZmZlZSBtZXRob2QnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgYTogPT5cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiYVwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCBcIj1cIiAncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBhOiAtPlwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDEgXCJhXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiLVwiICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibXRoZDogIChhcmcpICAgID0+IEBtZW1iZXIgbWVtYXJnXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAgJ210aGQnICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQgICc6JyAgICAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAxNiAnPScgICAgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDE3ICc+JyAgICAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBtdGhkOiAoYXJnKSAtPlwiXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICAgICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEgJ210aGQnICdtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2tvZmZlZScgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBAOiAtPlwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDEgXCJAXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiLVwiICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBAOi0+YVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDEgXCJAXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiLVwiICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwi4pa4aWYg4pa4dGhlbiDilrhlbGlmIOKWuGVsc2VcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwICBcIuKWuFwiICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxICBcImlmXCIgICAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgNCAgXCLilrhcIiAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgNSAgXCJ0aGVuXCIgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDEwIFwi4pa4XCIgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDExIFwiZWxpZlwiICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxNiBcIuKWuFwiICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxNyBcImVsc2VcIiAnbWV0YSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJbMSAneCcgYToxIGM6ZF1cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxICBcIjFcIiAgICdudW1iZXInXG4gICAgICAgIGluYyByZ3MsIDQgIFwieFwiICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDcgIFwiYVwiICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCAxMSBcImNcIiAgICdkaWN0aW9uYXJ5IGtleSdcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdyZWdleHAnIC0+XG4gICAgICAgIHJncyA9IHJhbmdlcyBcInI9L2EvXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMyAnYScgICAgICAgJ3RleHQgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCA0ICcvJyAgICAgICAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLyhhfC4qfFxcc1xcZFxcd1xcU1xcVyR8XlxccyspL1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDIgJ2EnICAgICAgICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvXiNpbmNsdWRlL1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIjXCIgICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMyBcImluY2x1ZGVcIiAndGV4dCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL1xcXFwnaGVsbG9cXFxcJy8gXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMSBcIlxcXFxcIiAgICAgICdwdW5jdCBlc2NhcGUgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiJ1wiICAgICAgICdwdW5jdCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDMgXCJoZWxsb1wiICAgJ3RleHQgcmVnZXhwJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgYSAvYiAtIGMvZ2lcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA0ICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCA1ICdiJyAgICAgICAndGV4dCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDEwICcvJyAgICAgICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidz1sLnNwbGl0IC9bXFxcXHNcXFxcL10vIDsgYmxhXCJcbiAgICAgICAgaW5jIHJncywgMTAgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDE0ICdcXFxcJyAgICAgICdwdW5jdCBlc2NhcGUgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAxNyAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBlbmQnXG4gICAgICAgIGluYyByZ3MsIDE5ICc7JyAgICAgICAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhID0gMSAvIDJcIlxuICAgICAgICBpbmMgcmdzLCA2ICcvJywgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA4ICcyJywgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIoMSsxKSAvIDJcIlxuICAgICAgICBpbmMgcmdzLCA2ICcvJywgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA4ICcyJywgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWzEwXSAvIDJcIlxuICAgICAgICBpbmMgcmdzLCA2ICcvJywgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA4ICcyJywgJ251bWJlcidcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICd0cmlwbGUgcmVnZXhwJyAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLy8vYS8vLyxiXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMSBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMiBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMyBcImFcIiAndGV4dCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA4IFwiYlwiICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIi8vL1xcbmFcXG4vLy9cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAwIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAxIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwIFwiYVwiICd0ZXh0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDAgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDIgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIFxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiXCJcIlxuICAgICAgICAgICAgLy8vXG4gICAgICAgICAgICAgICAgKFtcXFxcXFxcXD9dKSAjIGNvbW1lbnRcbiAgICAgICAgICAgIC8vLywgYVxuICAgICAgICAgICAgXCJcIlwiICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMF0sIDAgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDQgIFwiKFwiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgNiAgXCJcXFxcXCIgJ3B1bmN0IGVzY2FwZSByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAxMiBcIiNcIiAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyBkc3NbMV0sIDE0IFwiY29tbWVudFwiICdjb21tZW50J1xuICAgICAgICBpbmMgZHNzWzJdLCAwICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMiAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCA1ICBcImFcIiAgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiXCJcIlxuICAgICAgICAgICAgYXJyID0gWyAvLy9hXFwje2J9Ly8vXG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3ZhbHVlJ1xuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMV0sIDggJ2tleScsICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBpdCAnbm8gcmVnZXhwJyAtPlxuICAgICAgICBcbiAgICAgICAgIyBmIGEgLyBiIC0gYy9naVxuICAgICAgICAjIGYgYS9iIC0gYy9naVxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhIC8gYiAtIGMgLyBkJyAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCAyICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnZiBhL2IsIGMvZCcgJ2NvZmZlZSdcbiAgICAgICAgbnV0IHJncywgMyAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm0gPSAnLydcIiAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA1ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm0gYSwgJy8nJy8nXCIgJ2NvZmZlZSdcbiAgICAgICAgbnV0IHJncywgNiAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlwiXCJcXFwibSA9ICcvJ1xcXCJcIlwiXCIgJ2NvZmZlZSdcbiAgICAgICAgbnV0IHJncywgNiAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInMgPSAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCdcIiAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA1ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBudXQgcmdzLCA5ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibnVtIC89IDEwXCJcbiAgICAgICAgbnV0IHJncywgNCAnLycgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIG51dCByZ3MsIDcgJzEwJyAndGV4dCByZWdleHAnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0IC8gMiAvIDFcIlxuICAgICAgICBpbmMgcmdzLCAyICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQvMi8xXCJcbiAgICAgICAgaW5jIHJncywgMSAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAzICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0LyAyIC8gMVwiXG4gICAgICAgIGluYyByZ3MsIDEgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNCAvMiAvIDFcIlxuICAgICAgICBpbmMgcmdzLCAyICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQgLyAyLyAxXCJcbiAgICAgICAgaW5jIHJncywgMiAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0IC8gMiAvMVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNCAvMi8gMVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNCAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpdCAnbWQnIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIioqYm9sZCoqXCIgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCAxICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCAyICdib2xkJyAgICd0ZXh0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDYgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDcgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIsKipiKiosXCIgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAxICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCAzICdiJyAgICAgICd0ZXh0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDQgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIippdCBsaWMqXCIgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2l0JyAgICAgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA0ICdsaWMnICAgICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNyAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKml0YWxpYypcIiAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgMSAnaXRhbGljJyAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDcgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKmBpdGFsaWMgY29kZWAqXCIgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2AnICAgICAgJ3B1bmN0IGl0YWxpYyBjb2RlJ1xuICAgICAgICBpbmMgcmdzLCAyICdpdGFsaWMnICd0ZXh0IGl0YWxpYyBjb2RlJ1xuICAgICAgICBpbmMgcmdzLCA5ICdjb2RlJyAgICd0ZXh0IGl0YWxpYyBjb2RlJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnKicgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpdCdzIGdvb2RcIiAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAgJ2l0JyAgICAgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIgXCInXCIgICAgICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDMgJ3MnICAgICAgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpZiBpcyBlbXB0eSBpbiB0aGVuXCIgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwICAnaWYnICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAzICAnaXMnICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA2ICAnZW1wdHknICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAxMiAnaW4nICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAxNSAndGhlbicgICd0ZXh0J1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCLilrhkb2MgJ21kJ1xcbiAgICBpZiBpcyBlbXB0eSBpbiB0aGVuXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgNCAgJ2lmJyAgICAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgNyAgJ2lzJyAgICAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTAgICdlbXB0eScgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDE2ICdpbicgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDE5ICd0aGVuJyAgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2BgYGNvZmZlZXNjcmlwdCcsICdtZCdcbiAgICAgICAgaW5jIHJncywgMCAnYCcgJ3B1bmN0IGNvZGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAzICdjb2ZmZWVzY3JpcHQnICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi0gbGlcIiAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAgJy0nICAncHVuY3QgbGkxIG1hcmtlcidcbiAgICAgICAgaW5jIHJncywgMiAnbGknICd0ZXh0IGxpMSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgICAgLSAqKmJvbGQqKlwiICdtZCdcbiAgICAgICAgaW5jIHJncywgNCAnLScgICAgJ3B1bmN0IGxpMiBtYXJrZXInXG4gICAgICAgIGluYyByZ3MsIDggJ2JvbGQnICd0ZXh0IGxpMiBib2xkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgICAgICAtICoqYm9sZCoqXCIgJ21kJ1xuICAgICAgICBpbmMgcmdzLCA4ICctJyAgICAncHVuY3QgbGkzIG1hcmtlcidcbiAgICAgICAgaW5jIHJncywgMTIgJ2JvbGQnICd0ZXh0IGxpMyBib2xkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiAgICAgICAgKiAqKmJvbGQqKlwiICdtZCdcbiAgICAgICAgaW5jIHJncywgOCAnKicgICAgJ3B1bmN0IGxpMyBtYXJrZXInXG4gICAgICAgIGluYyByZ3MsIDEyICdib2xkJyAndGV4dCBsaTMgYm9sZCdcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiXCJcIlxuICAgICAgICAgICAgLSBsaTFcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgXCJcIlwiICdtZCdcbiAgICAgICAgaW5jIGRzc1swXSwgMCAgJy0nICAgICdwdW5jdCBsaTEgbWFya2VyJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwICAndGV4dCcgJ3RleHQnXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIlwiXCJcbiAgICAgICAgICAgICMgaDFcbiAgICAgICAgICAgICMjIGgyXG4gICAgICAgICAgICAjIyMgaDNcbiAgICAgICAgICAgICMjIyMgaDRcbiAgICAgICAgICAgICMjIyMjIGg1XG4gICAgICAgIFwiXCJcIiAnbWQnXG4gICAgICAgIGluYyBkc3NbMF0sIDAgIFwiI1wiICAgICdwdW5jdCBoMSdcbiAgICAgICAgaW5jIGRzc1swXSwgMiAgXCJoMVwiICAgJ3RleHQgaDEnXG4gICAgICAgIGluYyBkc3NbMV0sIDAgIFwiI1wiICAgICdwdW5jdCBoMidcbiAgICAgICAgaW5jIGRzc1sxXSwgMyAgXCJoMlwiICAgJ3RleHQgaDInXG4gICAgICAgIGluYyBkc3NbMl0sIDAgIFwiI1wiICAgICdwdW5jdCBoMydcbiAgICAgICAgaW5jIGRzc1syXSwgNCAgXCJoM1wiICAgJ3RleHQgaDMnXG4gICAgICAgIGluYyBkc3NbM10sIDAgIFwiI1wiICAgICdwdW5jdCBoNCdcbiAgICAgICAgaW5jIGRzc1szXSwgNSAgXCJoNFwiICAgJ3RleHQgaDQnXG4gICAgICAgIGluYyBkc3NbNF0sIDAgIFwiI1wiICAgICdwdW5jdCBoNSdcbiAgICAgICAgaW5jIGRzc1s0XSwgNiAgXCJoNVwiICAgJ3RleHQgaDUnXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIlwiXCJcbiAgICAgICAgICAgIGBgYGpzXG4gICAgICAgICAgICBgYGBcbiAgICAgICAgXCJcIlwiICdtZCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMCAnYCcgJ3B1bmN0IGNvZGUgdHJpcGxlJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgMCAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICBcbiAgICBpdCAnaHRtbCcgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjwvZGl2PlwiICdodG1sJyBcbiAgICAgICAgaW5jIHJncywgMCBcIjxcIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMSBcIi9cIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMiBcImRpdlwiICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAgICAncHVuY3Qga2V5d29yZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI8ZGl2PlwiICdodG1sJyBcbiAgICAgICAgaW5jIHJncywgMCBcIjxcIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMSBcImRpdlwiICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNCBcIj5cIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICBcbiAgICBcbiAgICBpdCAnY3BwJyAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2luY2x1ZGVcIiAnY3BwJyAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiaW5jbHVkZVwiICAnZGVmaW5lJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiNpZlwiICdjcHAnICAgICAgICAgICAgXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgICAgICAgICdwdW5jdCBkZWZpbmUnXG4gICAgICAgIGluYyByZ3MsIDEgXCJpZlwiICAgICAgICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIyAgaWZcIiAnY3BwJyAgICAgICAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiaWZcIiAgICAgICAnZGVmaW5lJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmICh0cnVlKSB7fSBlbHNlIHt9XCIgJ2NwcCcgICAgXG4gICAgICAgIGluYyByZ3MsIDAgXCJpZlwiICAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA0IFwidHJ1ZVwiICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMTMgXCJlbHNlXCIgJ2tleXdvcmQnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMS4wZlwiICdjcHAnXG4gICAgICAgIGluYyByZ3MsIDAgXCIxXCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDEgXCIuXCIgICdwdW5jdCBudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIwZlwiICdudW1iZXIgZmxvYXQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMC4wMDAwZlwiICdjcHAnXG4gICAgICAgIGluYyByZ3MsIDIgXCIwMDAwZlwiICdudW1iZXIgZmxvYXQnXG4gICAgICAgXG4gICAgIyAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgIyBpdCAnaXNzJyAtPlxuIyAgICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImE9eyNrZXl9XCIgJ2lzcydcbiAgICAgICAgIyBpbmMgcmdzLCAyICd7JyAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCAzIFwiI1wiICAgJ3B1bmN0IHByb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDQgJ2tleScgJ3Byb3BlcnR5IHRleHQnXG4gICAgICAgICMgaW5jIHJncywgNyBcIn1cIiAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdqcycgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZ1bmMgPSBmdW5jdGlvbigpIHtcIiAnanMnXG4gICAgICAgIGluYyByZ3MsIDAgJ2Z1bmMnICdmdW5jdGlvbidcbiAgICAgICAgaW5jIHJncywgNyAnZnVuY3Rpb24nICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NoJyAtPlxuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImRpci9wYXRoL3dpdGgvZGFzaGVzL2ZpbGUudHh0XCIgJ3NoJ1xuICAgICAgICBpbmMgcmdzLCAwICdkaXInICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNCAncGF0aCcgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA5ICd3aXRoJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE0ICdkYXNoZXMnICd0ZXh0IGRpcidcbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiZGlyL3BhdGgtd2l0aC1kYXNoZXMvZmlsZS50eHRcIiAnc2gnXG4gICAgICAgICMgaW5jIHJncywgMCAnZGlyJyAnZGlyIHRleHQnXG4gICAgICAgICMgaW5jIHJncywgNCAncGF0aCcgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDkgJ3dpdGgnICdkaXIgdGV4dCdcbiAgICAgICAgIyBpbmMgcmdzLCAxNCAnZGFzaGVzJyAnZGlyIHRleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJwcmcgLS1hcmcxIC1hcmcyXCIgJ3NoJ1xuICAgICAgICBpbmMgcmdzLCA0ICctJyAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDUgJy0nICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgNiAnYXJnMScgJ2FyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCAxMSAnLScgJ3B1bmN0IGFyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCAxMiAnYXJnMicgJ2FyZ3VtZW50J1xuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdsb2cnIC0+XG5cbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCJodHRwOi8vZG9tYWluLmNvbVwiICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgIyBpbmMgcmdzLCA0ICc6JyAncHVuY3QgdXJsJ1xuICAgICAgICAjIGluYyByZ3MsIDUgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgICMgaW5jIHJncywgNiAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgIyBpbmMgcmdzLCA3ICdkb21haW4nICd1cmwgZG9tYWluJ1xuICAgICAgICAjIGluYyByZ3MsIDEzICcuJyAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgIyBpbmMgcmdzLCAxNCAnY29tJyAndXJsIHRsZCdcbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiZmlsZS5jb2ZmZWVcIiAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAgJ2ZpbGUnICdjb2ZmZWUgZmlsZSdcbiAgICAgICAgIyBpbmMgcmdzLCA0ICcuJyAncHVuY3QgY29mZmVlJ1xuICAgICAgICAjIGluYyByZ3MsIDUgJ2NvZmZlZScgJ2NvZmZlZSBleHQnXG5cbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCJrZXkgL1wiICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCAna2V5JyAgICd0ZXh0J1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiL3NvbWUvcGF0aFwiICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMSAnc29tZScgICAnZGlyIHRleHQnXG4gICAgICAgICMgaW5jIHJncywgNSAnLycgICAgICAncHVuY3QgZGlyJ1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwia2V5OiB2YWx1ZVwiICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCAna2V5JyAgICAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICMgaW5jIHJncywgMyAnOicgICAgICAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnbm9vbicgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCcgJ25vb24nXG4gICAgICAgIGluYyByZ3MsIDAgICcvJyAgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICAnXFxcXCcgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAxNSAnLicgICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMTkgJzonICAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcIiAgICBwcm9wZXJ0eSAgdmFsdWVcIiAnbm9vbidcbiAgICAgICAgIyBpbmMgcmdzLCA0ICdwcm9wZXJ0eScgJ3Byb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDE0ICd2YWx1ZScgJ3RleHQnXG5cbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCIgICAgcHJvcC5lcnR5ICB2YWx1ZVwiICdub29uJ1xuICAgICAgICAjIGluYyByZ3MsIDQgJ3Byb3AnICdwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCA4ICcuJyAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgOSAnZXJ0eScgJ3Byb3BlcnR5J1xuICAgICAgICBcbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIyNcblxuZGVzY3JpYmUgJ2Jsb2NrcycgLT5cbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaXQgJ2NvbW1lbnQnIC0+XG4gICAgIFxuICAgICAgICBibG9ja3MoW1wiIyNcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50JyB0dXJkOlwiIyNcIn0gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgXG4gICAgICAgIGJsb2NrcyhbXCIsI2FcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiLFwiIHZhbHVlOidwdW5jdCcgdHVyZDogXCIsI1wifSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgbGVuZ3RoOjEgbWF0Y2g6XCJhXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdmdW5jdGlvbicgLT5cbiAgICBcbiAgICAgICAgYmxvY2tzKFsnLT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgIGJsb2NrcyhbJz0+J10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICBibG9ja3MoWydmPS0+MSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6NSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonZicgdmFsdWU6J2Z1bmN0aW9uJ30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24nICAgICAgdHVyZDonPS0+JyB9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6Jy0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDozIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ21pbmltYWwnIC0+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBibG9ja3MoWycxJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6JzEnIHZhbHVlOidudW1iZXInfSBdXVxuICAgICAgICBibG9ja3MoWydhJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOid0ZXh0J30gXV1cbiAgICAgICAgYmxvY2tzKFsnLiddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QnfSBdXVxuICAgIFxuICAgICAgICBibG9ja3MoWycxLmEnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QgcHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoyICBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3Byb3BlcnR5J30gXG4gICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGJsb2NrcyhbJysrYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOicrJyB2YWx1ZToncHVuY3QnIHR1cmQ6JysrJ30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjEgbWF0Y2g6JysnIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgIGxlbmd0aDoxIG1hdGNoOidhJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBibG9ja3MoW1wi4pa4ZG9jICdoZWxsbydcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxMiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDon4pa4JyAgICAgdmFsdWU6J3B1bmN0IG1ldGEnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjMgbWF0Y2g6J2RvYycgICB2YWx1ZTonbWV0YSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDo1ICBsZW5ndGg6MSBtYXRjaDpcIidcIiAgICAgdmFsdWU6J3B1bmN0IHN0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NiAgbGVuZ3RoOjUgbWF0Y2g6XCJoZWxsb1wiIHZhbHVlOidzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjExIGxlbmd0aDoxIG1hdGNoOlwiJ1wiICAgICB2YWx1ZToncHVuY3Qgc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3NwYWNlJyAtPlxuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcInhcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAwXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgW1wiIHh4XCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgMVxuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBbXCIgICAgeHh4XCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcIiAgICB4IDEgICwgXCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgICAgICBiWzBdLmNodW5rc1sxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDZcbiAgICAgICAgYlswXS5jaHVua3NbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA5XG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdzd2l0Y2hlcycgLT5cbiAgICAgICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIHggICAgXG4gICAgICAgICAgICAgICAgeVxuICAgICAgICAgICAgaWYgMSB0aGVuIGZhbHNlXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICBcbiAgICAgICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICAgICAgeVxuICAgICAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCIgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbycgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdCAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIDErMSAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAg4pa4ZG9jICdhZ2FpbicgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzb21lICoqZG9jcyoqICAgICBcbiAgICAgICAgICAgICAgICBgYGAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHkgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nICAgICAgICAgICAgICAgXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzddLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls4XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAgICAgIOKWuGRvb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIHggIFxuICAgICAgICAgICAgXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzE7XG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIFwiXCJcIi5zcGxpdCgnXFxuJyksICdtZCdcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdqcydcbiAgICAgICAgICAgICJdfQ==
//# sourceURL=../coffee/test.coffee