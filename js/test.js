// koffee 0.45.0

/*
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000
 */
var _, dissect, ext, inc, klor, kxk, lang, nut, parse, ranges;

klor = require('../');

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

ext = 'coffee';

lang = function(l) {
    return ext = l;
};

ranges = function(s, e) {
    return klor.ranges(s, e != null ? e : ext);
};

parse = function(c, e) {
    return klor.parse(c.split('\n'), e != null ? e : ext);
};

dissect = function(c, e) {
    return klor.dissect(c.split('\n'), e != null ? e : ext);
};


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
        lang('coffee');
        rgs = ranges("🌈");
        inc(rgs, 0, '🌈', 'text');
        rgs = ranges("🌈🌱");
        inc(rgs, 0, '🌈', 'text');
        inc(rgs, 2, '🌱', 'text');
        rgs = ranges("🙂lol😀");
        inc(rgs, 0, '🙂', 'text');
        inc(rgs, 2, 'lol', 'text');
        inc(rgs, 5, '😀', 'text');
        rgs = ranges("a➜b a▬▶b");
        inc(rgs, 1, '➜', 'punct');
        inc(rgs, 5, '▬', 'punct');
        inc(rgs, 6, '▶', 'punct');
        rgs = ranges("🐀🐁🐂🐃🐄🐅🐆🐇🐈🐉🐊🐋🐌🐍🐎🐏🐐🐑🐒🐓🐔🐕🐖🐗🐘🐙🐚🐛🐜🐝🐞🐟🐠🐡🐢🐣🐤🐥");
        inc(rgs, 0, '🐀', 'text');
        return inc(rgs, 24, '🐌', 'text');
    });
    it('comments', function() {
        var j, len, results, rgs, rng;
        lang('coffee');
        rgs = ranges("hello # world");
        inc(rgs, 6, "#", 'punct comment');
        inc(rgs, 8, "world", 'comment');
        lang('noon');
        rgs = ranges("   # bla blub");
        inc(rgs, 3, "#", 'punct comment');
        inc(rgs, 5, "bla", 'comment');
        inc(rgs, 9, "blub", 'comment');
        rgs = ranges("(^\s*#\s*)(.*)$");
        results = [];
        for (j = 0, len = rgs.length; j < len; j++) {
            rng = rgs[j];
            results.push(rng.should.not.have.property('value', 'comment'));
        }
        return results;
    });
    it('triple comment', function() {
        var dss, rgs;
        lang('coffee');
        rgs = ranges("###a###");
        inc(rgs, 0, "#", 'punct comment triple');
        inc(rgs, 1, "#", 'punct comment triple');
        inc(rgs, 2, "#", 'punct comment triple');
        inc(rgs, 3, "a", 'comment triple');
        inc(rgs, 4, "#", 'punct comment triple');
        inc(rgs, 5, "#", 'punct comment triple');
        inc(rgs, 6, "#", 'punct comment triple');
        dss = dissect("###\na\n###");
        inc(dss[0], 0, "#", 'punct comment triple');
        inc(dss[0], 1, "#", 'punct comment triple');
        inc(dss[0], 2, "#", 'punct comment triple');
        inc(dss[1], 0, "a", 'comment triple');
        inc(dss[2], 0, "#", 'punct comment triple');
        inc(dss[2], 1, "#", 'punct comment triple');
        inc(dss[2], 2, "#", 'punct comment triple');
        lang('styl');
        dss = dissect("/*\na\n*/");
        inc(dss[0], 0, "/", 'punct comment triple');
        inc(dss[0], 1, "*", 'punct comment triple');
        inc(dss[1], 0, "a", 'comment triple');
        inc(dss[2], 0, "*", 'punct comment triple');
        return inc(dss[2], 1, "/", 'punct comment triple');
    });
    it('comment header', function() {
        var dss, rgs;
        lang('coffee');
        rgs = ranges("# 0 00 0000");
        inc(rgs, 0, "#", 'punct comment');
        inc(rgs, 2, "0", 'comment header');
        inc(rgs, 4, "00", 'comment header');
        inc(rgs, 7, "0000", 'comment header');
        dss = dissect("###\n 0 00 0 \n###");
        inc(dss[1], 1, "0", 'comment triple header');
        rgs = ranges("# 0 * 0.2");
        inc(rgs, 2, '0', 'comment');
        inc(rgs, 6, '0', 'comment');
        dss = dissect("###\n 0 1 0 \n###");
        inc(dss[1], 1, "0", 'comment triple');
        lang('styl');
        rgs = ranges("// 000");
        inc(rgs, 3, "000", 'comment header');
        dss = dissect("/*\n 0 0 0 \n*/");
        return inc(dss[1], 1, "0", 'comment triple header');
    });
    it('numbers', function() {
        var rgs;
        lang('coffee');
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
        lang('coffee');
        rgs = ranges("66.70.0");
        inc(rgs, 0, "66", 'semver');
        inc(rgs, 2, ".", 'punct semver');
        inc(rgs, 3, "70", 'semver');
        inc(rgs, 5, ".", 'punct semver');
        inc(rgs, 6, "0", 'semver');
        rgs = ranges("^0.7.1");
        inc(rgs, 0, "^", 'punct semver');
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
        lang('coffee');
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
        rgs = ranges("a='';b=' ';c='Y'");
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
        rgs = ranges('"#{xxx}"');
        inc(rgs, 0, '"', 'punct string double');
        inc(rgs, 1, "#", 'punct string interpolation start');
        inc(rgs, 2, "{", 'punct string interpolation start');
        inc(rgs, 3, 'xxx', 'text');
        inc(rgs, 6, "}", 'punct string interpolation end');
        inc(rgs, 7, '"', 'punct string double');
        rgs = ranges('"#{666}"');
        inc(rgs, 0, '"', 'punct string double');
        inc(rgs, 3, '666', 'number');
        inc(rgs, 7, '"', 'punct string double');
        rgs = ranges('"""#{777}"""');
        inc(rgs, 0, '"', 'punct string double triple');
        inc(rgs, 1, '"', 'punct string double triple');
        inc(rgs, 2, '"', 'punct string double triple');
        inc(rgs, 3, '#', 'punct string interpolation start');
        inc(rgs, 4, '{', 'punct string interpolation start');
        inc(rgs, 5, '777', 'number');
        inc(rgs, 8, '}', 'punct string interpolation end');
        inc(rgs, 9, '"', 'punct string double triple');
        inc(rgs, 10, '"', 'punct string double triple');
        inc(rgs, 11, '"', 'punct string double triple');
        rgs = ranges('"#{__dirname}/../"');
        inc(rgs, 12, '}', 'punct string interpolation end');
        return inc(rgs, 13, '/', 'string double');
    });
    it('noon', function() {
        var rgs;
        lang('noon');
        rgs = ranges("    property  value");
        inc(rgs, 4, 'property', 'property');
        inc(rgs, 14, 'value', 'text');
        rgs = ranges("top");
        inc(rgs, 0, 'top', 'obj');
        rgs = ranges("top  prop");
        inc(rgs, 0, 'top', 'obj');
        inc(rgs, 5, 'prop', 'text');
        rgs = ranges("version  ^0.1.2");
        inc(rgs, 0, 'version', 'obj');
        inc(rgs, 9, '^', 'punct semver');
        inc(rgs, 10, '0', 'semver');
        rgs = ranges("some-package-name  1");
        inc(rgs, 0, 'some', 'property');
        inc(rgs, 5, 'package', 'property');
        inc(rgs, 13, 'name', 'property');
        rgs = ranges("some-package-name  ^1.2.3");
        inc(rgs, 0, 'some', 'property');
        inc(rgs, 5, 'package', 'property');
        inc(rgs, 13, 'name', 'property');
        rgs = ranges("top  prop  value");
        inc(rgs, 0, 'top', 'obj');
        inc(rgs, 5, 'prop', 'property');
        inc(rgs, 11, 'value', 'text');
        rgs = ranges("http://domain.com");
        inc(rgs, 0, 'http', 'url protocol');
        inc(rgs, 4, ':', 'punct url');
        inc(rgs, 5, '/', 'punct url');
        inc(rgs, 6, '/', 'punct url');
        inc(rgs, 7, 'domain', 'url domain');
        inc(rgs, 13, '.', 'punct url tld');
        inc(rgs, 14, 'com', 'url tld');
        rgs = ranges("http://domain.com/dir/page.html");
        inc(rgs, 0, 'http', 'url protocol');
        inc(rgs, 4, ':', 'punct url');
        inc(rgs, 5, '/', 'punct url');
        inc(rgs, 6, '/', 'punct url');
        inc(rgs, 7, 'domain', 'url domain');
        inc(rgs, 13, '.', 'punct url tld');
        inc(rgs, 14, 'com', 'url tld');
        inc(rgs, 17, '/', 'punct dir');
        rgs = ranges("file.coffee");
        inc(rgs, 0, 'file', 'coffee file');
        inc(rgs, 4, '.', 'punct coffee');
        inc(rgs, 5, 'coffee', 'coffee ext');
        rgs = ranges("/some/path");
        inc(rgs, 1, 'some', 'text dir');
        inc(rgs, 5, '/', 'punct dir');
        inc(rgs, 6, 'path', 'text file');
        rgs = ranges('/some\\path/file.txt:10');
        inc(rgs, 0, '/', 'punct dir');
        inc(rgs, 1, 'some', 'text dir');
        inc(rgs, 5, '\\', 'punct dir');
        inc(rgs, 15, '.', 'punct txt');
        inc(rgs, 19, ':', 'punct');
        rgs = ranges("    test  ./node_modules/.bin/mocha");
        inc(rgs, 4, 'test', 'property');
        inc(rgs, 10, '.', 'punct dir');
        inc(rgs, 11, '/', 'punct dir');
        inc(rgs, 12, 'node_modules', 'text dir');
        inc(rgs, 24, '/', 'punct dir');
        inc(rgs, 25, '.', 'punct dir');
        inc(rgs, 26, 'bin', 'text dir');
        inc(rgs, 29, '/', 'punct dir');
        return inc(rgs, 30, 'mocha', 'text file');
    });
    it('coffee', function() {
        var rgs;
        lang('coffee');
        rgs = ranges("util = require 'util'");
        inc(rgs, 7, 'require', 'require');
        rgs = ranges("class Macro extends Command");
        inc(rgs, 0, 'class', 'keyword');
        inc(rgs, 6, 'Macro', 'class');
        inc(rgs, 12, 'extends', 'keyword');
        inc(rgs, 20, 'Command', 'class');
        rgs = ranges("exist?.prop");
        inc(rgs, 7, 'prop', 'property');
        rgs = ranges("a and b");
        inc(rgs, 0, "a", 'text');
        inc(rgs, 2, "and", 'keyword');
        rgs = ranges("if a then b");
        inc(rgs, 0, "if", 'keyword');
        inc(rgs, 3, "a", 'text');
        inc(rgs, 5, "then", 'keyword');
        inc(rgs, 10, "b", 'text');
        rgs = ranges("switch a");
        inc(rgs, 0, "switch", 'keyword');
        rgs = ranges(" a: b");
        inc(rgs, 1, "a", 'dictionary key');
        inc(rgs, 2, ":", 'punct dictionary');
        rgs = ranges("obj.value = obj.another.value");
        inc(rgs, 0, "obj", 'obj');
        inc(rgs, 4, "value", 'property');
        inc(rgs, 12, "obj", 'obj');
        inc(rgs, 16, "another", 'property');
        inc(rgs, 24, "value", 'property');
        rgs = ranges("if someObject.someProp");
        inc(rgs, 0, "if", 'keyword');
        inc(rgs, 3, "someObject", 'obj');
        inc(rgs, 13, ".", 'punct property');
        inc(rgs, 14, "someProp", 'property');
        rgs = ranges("1 'a'");
        inc(rgs, 0, "1", 'number');
        rgs = ranges("a[0].prop");
        inc(rgs, 3, ']', 'punct');
        rgs = ranges("[ f ]");
        inc(rgs, 2, 'f', 'text');
        rgs = ranges("[ f , f ]");
        inc(rgs, 2, 'f', 'text');
        rgs = ranges("a[...2]");
        inc(rgs, 2, '.', 'punct range');
        inc(rgs, 3, '.', 'punct range');
        inc(rgs, 4, '.', 'punct range');
        rgs = ranges("a[ -1 .. ]");
        inc(rgs, 6, '.', 'punct range');
        inc(rgs, 7, '.', 'punct range');
        rgs = ranges("a[1..n]");
        inc(rgs, 3, '.', 'punct range');
        inc(rgs, 4, '.', 'punct range');
        rgs = ranges("a[ .... ]");
        inc(rgs, 3, '.', 'punct');
        inc(rgs, 4, '.', 'punct');
        inc(rgs, 5, '.', 'punct');
        inc(rgs, 6, '.', 'punct');
        rgs = ranges("@f [1]");
        inc(rgs, 0, "@", 'punct function call');
        inc(rgs, 1, "f", 'function call');
        rgs = ranges("@f = 1");
        inc(rgs, 0, "@", 'punct this');
        inc(rgs, 1, "f", 'text this');
        rgs = ranges("@height/2 + @height/6");
        inc(rgs, 0, '@', 'punct this');
        inc(rgs, 1, 'height', 'text this');
        return inc(rgs, 8, "2", 'number');
    });
    it('coffee function', function() {
        var rgs;
        lang('coffee');
        rgs = ranges("obj.prop.call 1");
        inc(rgs, 0, 'obj', 'obj');
        inc(rgs, 4, 'prop', 'property');
        inc(rgs, 9, 'call', 'function call');
        rgs = ranges("dolater =>");
        inc(rgs, 8, '=', 'punct function bound tail');
        inc(rgs, 9, '>', 'punct function bound head');
        rgs = ranges("dolater ->");
        inc(rgs, 8, '-', 'punct function tail');
        inc(rgs, 9, '>', 'punct function head');
        rgs = ranges("@a @b 'c'");
        inc(rgs, 0, '@', 'punct function call');
        inc(rgs, 1, 'a', 'function call');
        inc(rgs, 3, '@', 'punct function call');
        inc(rgs, 4, 'b', 'function call');
        rgs = ranges("@a 3 @b '5'");
        inc(rgs, 0, '@', 'punct function call');
        inc(rgs, 1, 'a', 'function call');
        rgs = ranges("fff 1");
        inc(rgs, 0, "fff", 'function call');
        rgs = ranges("f 'a'");
        inc(rgs, 0, "f", 'function call');
        rgs = ranges("ff 'b'");
        inc(rgs, 0, "ff", 'function call');
        rgs = ranges("ffff -1");
        inc(rgs, 0, "ffff", 'function call');
        rgs = ranges("f [1]");
        inc(rgs, 0, "f", 'function call');
        rgs = ranges("fffff {1}");
        inc(rgs, 0, "fffff", 'function call');
        rgs = ranges("i ++a");
        inc(rgs, 0, 'i', 'function call');
        rgs = ranges("i +4");
        inc(rgs, 0, 'i', 'function call');
        rgs = ranges("i -4");
        inc(rgs, 0, 'i', 'function call');
        rgs = ranges("pos= (item, p) -> ");
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
        lang('coffee');
        rgs = ranges(" a: =>");
        inc(rgs, 1, "a", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "=", 'punct function bound tail');
        inc(rgs, 5, ">", 'punct function bound head');
        rgs = ranges(" a: ->");
        inc(rgs, 1, "a", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "-", 'punct function tail');
        inc(rgs, 5, ">", 'punct function head');
        rgs = ranges("mthd:  (arg)    => @member memarg");
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
        lang('koffee');
        rgs = ranges(" @: ->");
        inc(rgs, 1, "@", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "-", 'punct function tail');
        inc(rgs, 5, ">", 'punct function head');
        rgs = ranges(" @:->a");
        inc(rgs, 1, "@", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 3, "-", 'punct function tail');
        inc(rgs, 4, ">", 'punct function head');
        rgs = ranges("▸if ▸then ▸elif ▸else");
        inc(rgs, 0, "▸", 'punct meta');
        inc(rgs, 1, "if", 'meta');
        inc(rgs, 4, "▸", 'punct meta');
        inc(rgs, 5, "then", 'meta');
        inc(rgs, 10, "▸", 'punct meta');
        inc(rgs, 11, "elif", 'meta');
        inc(rgs, 16, "▸", 'punct meta');
        inc(rgs, 17, "else", 'meta');
        rgs = ranges("[1 'x' a:1 c:d]");
        inc(rgs, 1, "1", 'number');
        inc(rgs, 4, "x", 'string single');
        inc(rgs, 7, "a", 'dictionary key');
        return inc(rgs, 11, "c", 'dictionary key');
    });
    it('js', function() {
        var rgs;
        lang('js');
        rgs = ranges("obj.prop.call(1);");
        inc(rgs, 0, 'obj', 'obj');
        inc(rgs, 4, 'prop', 'property');
        inc(rgs, 9, 'call', 'function call');
        rgs = ranges("func = function() {");
        inc(rgs, 0, 'func', 'function');
        inc(rgs, 7, 'function', 'keyword function');
        rgs = ranges("obj.value = obj.another.value");
        inc(rgs, 0, "obj", 'obj');
        inc(rgs, 4, "value", 'property');
        inc(rgs, 12, "obj", 'obj');
        inc(rgs, 16, "another", 'property');
        inc(rgs, 24, "value", 'property');
        rgs = ranges("a(2);");
        inc(rgs, 0, 'a', 'function call');
        rgs = ranges("//# sourceMappingURL=data:");
        inc(rgs, 0, "/", 'punct comment');
        inc(rgs, 1, "/", 'punct comment');
        return inc(rgs, 2, "#", 'comment');
    });
    it('json', function() {
        var rgs;
        lang('json');
        rgs = ranges("{ \"A Z\": 1 }");
        inc(rgs, 2, '"', 'punct dictionary');
        inc(rgs, 3, 'A', 'dictionary key');
        inc(rgs, 5, 'Z', 'dictionary key');
        inc(rgs, 6, '"', 'punct dictionary');
        inc(rgs, 7, ':', 'punct dictionary');
        rgs = ranges('"a": "http://domain.com"');
        inc(rgs, 6, 'http', 'url protocol');
        inc(rgs, 10, ':', 'punct url');
        inc(rgs, 11, '/', 'punct url');
        inc(rgs, 12, '/', 'punct url');
        inc(rgs, 13, 'domain', 'url domain');
        inc(rgs, 19, '.', 'punct url tld');
        inc(rgs, 20, 'com', 'url tld');
        rgs = ranges('"http://domain.com/dir/page.html"');
        inc(rgs, 1, 'http', 'url protocol');
        inc(rgs, 5, ':', 'punct url');
        inc(rgs, 6, '/', 'punct url');
        inc(rgs, 7, '/', 'punct url');
        inc(rgs, 8, 'domain', 'url domain');
        inc(rgs, 14, '.', 'punct url tld');
        inc(rgs, 15, 'com', 'url tld');
        inc(rgs, 18, '/', 'punct dir');
        rgs = ranges('"file.coffee"');
        inc(rgs, 1, 'file', 'coffee file');
        inc(rgs, 5, '.', 'punct coffee');
        inc(rgs, 6, 'coffee', 'coffee ext');
        rgs = ranges('"/some/path"');
        inc(rgs, 2, 'some', 'text dir');
        inc(rgs, 6, '/', 'punct dir');
        inc(rgs, 7, 'path', 'text file');
        rgs = ranges('"/some\\path/file.txt:10"');
        inc(rgs, 0, '"', 'punct string double');
        inc(rgs, 1, '/', 'punct dir');
        inc(rgs, 2, 'some', 'text dir');
        inc(rgs, 16, '.', 'punct txt');
        inc(rgs, 20, ':', 'string double');
        inc(rgs, 23, '"', 'punct string double');
        rgs = ranges('"./node_modules/.bin/mocha"');
        inc(rgs, 1, '.', 'text dir');
        inc(rgs, 2, '/', 'punct dir');
        inc(rgs, 3, 'node_modules', 'text dir');
        inc(rgs, 15, '/', 'punct dir');
        inc(rgs, 16, '.', 'text dir');
        inc(rgs, 17, 'bin', 'text dir');
        inc(rgs, 20, '/', 'punct dir');
        inc(rgs, 21, 'mocha', 'text file');
        rgs = ranges('"66.70.0"');
        inc(rgs, 1, "66", 'semver');
        inc(rgs, 3, ".", 'punct semver');
        inc(rgs, 4, "70", 'semver');
        inc(rgs, 6, ".", 'punct semver');
        inc(rgs, 7, "0", 'semver');
        rgs = ranges('"^0.7.1"');
        inc(rgs, 1, "^", 'punct semver');
        inc(rgs, 2, "0", 'semver');
        inc(rgs, 4, "7", 'semver');
        inc(rgs, 6, "1", 'semver');
        rgs = ranges('"^1.0.0-alpha.12"');
        inc(rgs, 2, "1", 'semver');
        inc(rgs, 4, "0", 'semver');
        return inc(rgs, 6, "0", 'semver');
    });
    it('regexp', function() {
        var rgs;
        lang('coffee');
        rgs = ranges("r=/a/");
        inc(rgs, 2, '/', 'punct regexp start');
        inc(rgs, 3, 'a', 'text regexp');
        inc(rgs, 4, '/', 'punct regexp end');
        rgs = ranges("/(a|.*|\s\d\w\S\W$|^\s+)/");
        inc(rgs, 0, '/', 'punct regexp start');
        inc(rgs, 2, 'a', 'text regexp');
        rgs = ranges("/^#include/");
        inc(rgs, 0, '/', 'punct regexp start');
        inc(rgs, 2, "#", 'punct regexp');
        inc(rgs, 3, "include", 'text regexp');
        rgs = ranges("/\\'hello\\'/ ");
        inc(rgs, 0, '/', 'punct regexp start');
        inc(rgs, 1, "\\", 'punct escape regexp');
        inc(rgs, 2, "'", 'punct regexp');
        inc(rgs, 3, "hello", 'text regexp');
        rgs = ranges("f a /b - c/gi");
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
        lang('coffee');
        rgs = ranges("///a///,b");
        inc(rgs, 0, "/", 'punct regexp triple');
        inc(rgs, 1, "/", 'punct regexp triple');
        inc(rgs, 2, "/", 'punct regexp triple');
        inc(rgs, 3, "a", 'text regexp triple');
        inc(rgs, 4, "/", 'punct regexp triple');
        inc(rgs, 5, "/", 'punct regexp triple');
        inc(rgs, 6, "/", 'punct regexp triple');
        inc(rgs, 8, "b", 'text');
        dss = dissect("///\na\n///");
        inc(dss[0], 0, "/", 'punct regexp triple');
        inc(dss[0], 1, "/", 'punct regexp triple');
        inc(dss[0], 2, "/", 'punct regexp triple');
        inc(dss[1], 0, "a", 'text regexp triple');
        inc(dss[2], 0, "/", 'punct regexp triple');
        inc(dss[2], 1, "/", 'punct regexp triple');
        inc(dss[2], 2, "/", 'punct regexp triple');
        dss = dissect("///\n    ([\\\\?]) # comment\n///, a");
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
        dss = dissect("arr = [ ///a\#{b}///\n        key: 'value'\n      ]");
        return inc(dss[1], 8, 'key', 'dictionary key');
    });
    it('no regexp', function() {
        var rgs;
        lang('coffee');
        rgs = ranges('a / b - c / d');
        nut(rgs, 2, '/', 'punct regexp start');
        rgs = ranges('f a/b, c/d');
        nut(rgs, 3, '/', 'punct regexp start');
        rgs = ranges("m = '/'");
        nut(rgs, 5, '/', 'punct regexp start');
        rgs = ranges("m a, '/''/'");
        nut(rgs, 6, '/', 'punct regexp start');
        rgs = ranges("\"m = '/'\"");
        nut(rgs, 6, '/', 'punct regexp start');
        rgs = ranges("s = '/some\\path/file.txt:10'");
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
        lang('md');
        rgs = ranges("**bold**");
        inc(rgs, 0, '*', 'punct bold');
        inc(rgs, 1, '*', 'punct bold');
        inc(rgs, 2, 'bold', 'text bold');
        inc(rgs, 6, '*', 'punct bold');
        inc(rgs, 7, '*', 'punct bold');
        rgs = ranges(",**b**,");
        inc(rgs, 1, '*', 'punct bold');
        inc(rgs, 3, 'b', 'text bold');
        inc(rgs, 4, '*', 'punct bold');
        rgs = ranges("*it lic*");
        inc(rgs, 0, '*', 'punct italic');
        inc(rgs, 1, 'it', 'text italic');
        inc(rgs, 4, 'lic', 'text italic');
        inc(rgs, 7, '*', 'punct italic');
        rgs = ranges("*italic*");
        inc(rgs, 0, '*', 'punct italic');
        inc(rgs, 1, 'italic', 'text italic');
        inc(rgs, 7, '*', 'punct italic');
        rgs = ranges("*`italic code`*");
        inc(rgs, 0, '*', 'punct italic');
        inc(rgs, 1, '`', 'punct italic code');
        inc(rgs, 2, 'italic', 'text italic code');
        inc(rgs, 9, 'code', 'text italic code');
        inc(rgs, 14, '*', 'punct italic');
        rgs = ranges("it's good");
        inc(rgs, 0, 'it', 'text');
        inc(rgs, 2, "'", 'punct');
        inc(rgs, 3, 's', 'text');
        rgs = ranges("if is empty in then");
        inc(rgs, 0, 'if', 'text');
        inc(rgs, 3, 'is', 'text');
        inc(rgs, 6, 'empty', 'text');
        inc(rgs, 12, 'in', 'text');
        inc(rgs, 15, 'then', 'text');
        dss = dissect("▸doc\n    if is empty in then", 'coffee');
        inc(dss[1], 4, 'if', 'text');
        inc(dss[1], 7, 'is', 'text');
        inc(dss[1], 10, 'empty', 'text');
        inc(dss[1], 16, 'in', 'text');
        inc(dss[1], 19, 'then', 'text');
        rgs = ranges('text files. bla');
        inc(rgs, 0, 'text', 'text');
        inc(rgs, 10, '.', 'punct');
        rgs = ranges('..bla');
        inc(rgs, 0, '.', 'punct');
        inc(rgs, 1, '.', 'punct');
        rgs = ranges('```coffeescript');
        inc(rgs, 0, '`', 'punct code triple');
        inc(rgs, 3, 'coffeescript', 'comment');
        rgs = ranges("- li");
        inc(rgs, 0, '-', 'punct li1 marker');
        inc(rgs, 2, 'li', 'text li1');
        rgs = ranges("    - **bold**");
        inc(rgs, 4, '-', 'punct li2 marker');
        inc(rgs, 8, 'bold', 'text li2 bold');
        rgs = ranges("        - **bold**");
        inc(rgs, 8, '-', 'punct li3 marker');
        inc(rgs, 12, 'bold', 'text li3 bold');
        rgs = ranges("        * **bold**");
        inc(rgs, 8, '*', 'punct li3 marker');
        inc(rgs, 12, 'bold', 'text li3 bold');
        dss = dissect("- li1\ntext");
        inc(dss[0], 0, '-', 'punct li1 marker');
        inc(dss[1], 0, 'text', 'text');
        dss = dissect("# h1\n## h2\n### h3\n#### h4\n##### h5");
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
        dss = dissect("```js\n```");
        return inc(dss[1], 0, '`', 'punct code triple');
    });
    it('html', function() {
        var rgs;
        lang('html');
        rgs = ranges("</div>");
        inc(rgs, 0, "<", 'punct keyword');
        inc(rgs, 1, "/", 'punct keyword');
        inc(rgs, 2, "div", 'keyword');
        inc(rgs, 5, ">", 'punct keyword');
        rgs = ranges("<div>");
        inc(rgs, 0, "<", 'punct keyword');
        inc(rgs, 1, "div", 'keyword');
        return inc(rgs, 4, ">", 'punct keyword');
    });
    it('styl', function() {
        var rgs;
        lang('styl');
        rgs = ranges("1em");
        inc(rgs, 0, "1em", 'number');
        rgs = ranges("1ex");
        inc(rgs, 0, "1ex", 'number');
        rgs = ranges("1px");
        inc(rgs, 0, "1px", 'number');
        rgs = ranges("1s");
        inc(rgs, 0, "1s", 'number');
        rgs = ranges(".clss");
        inc(rgs, 0, ".", 'punct class');
        inc(rgs, 1, "clss", 'class');
        rgs = ranges("#id");
        inc(rgs, 0, "#", 'punct function');
        inc(rgs, 1, "id", 'function');
        rgs = ranges("#id-foo-bar");
        inc(rgs, 0, "#", 'punct function');
        inc(rgs, 1, "id", 'function');
        inc(rgs, 3, "-", 'punct function');
        inc(rgs, 4, "foo", 'function');
        inc(rgs, 7, "-", 'punct function');
        inc(rgs, 8, "bar", 'function');
        rgs = ranges(".clss-foo-bar");
        inc(rgs, 0, ".", 'punct class');
        inc(rgs, 1, "clss", 'class');
        inc(rgs, 5, "-", 'punct class');
        inc(rgs, 6, "foo", 'class');
        inc(rgs, 9, "-", 'punct class');
        inc(rgs, 10, "bar", 'class');
        rgs = ranges("#666");
        inc(rgs, 0, "#", 'punct number hex');
        inc(rgs, 1, "666", 'number hex');
        rgs = ranges("#abc");
        inc(rgs, 0, "#", 'punct number hex');
        inc(rgs, 1, "abc", 'number hex');
        rgs = ranges("#f0f0f0");
        inc(rgs, 0, "#", 'punct number hex');
        return inc(rgs, 1, "f0f0f0", 'number hex');
    });
    it('cpp', function() {
        var rgs;
        lang('cpp');
        rgs = ranges("#include");
        inc(rgs, 0, "#", 'punct define');
        inc(rgs, 1, "include", 'define');
        rgs = ranges("#if");
        inc(rgs, 0, "#", 'punct define');
        inc(rgs, 1, "if", 'define');
        rgs = ranges("#  if");
        inc(rgs, 0, "#", 'punct define');
        inc(rgs, 3, "if", 'define');
        rgs = ranges("if (true) {} else {}");
        inc(rgs, 0, "if", 'keyword');
        inc(rgs, 4, "true", 'keyword');
        inc(rgs, 13, "else", 'keyword');
        rgs = ranges("1.0f");
        inc(rgs, 0, "1", 'number float');
        inc(rgs, 1, ".", 'punct number float');
        inc(rgs, 2, "0f", 'number float');
        rgs = ranges("0.0000f");
        return inc(rgs, 2, "0000f", 'number float');
    });
    it('sh', function() {
        var rgs;
        lang('sh');
        rgs = ranges("dir/path/with/dashes/file.txt");
        inc(rgs, 0, 'dir', 'text dir');
        inc(rgs, 4, 'path', 'text dir');
        inc(rgs, 9, 'with', 'text dir');
        inc(rgs, 14, 'dashes', 'text dir');
        rgs = ranges("prg --arg1 -arg2");
        inc(rgs, 4, '-', 'punct argument');
        inc(rgs, 5, '-', 'punct argument');
        inc(rgs, 6, 'arg1', 'argument');
        inc(rgs, 11, '-', 'punct argument');
        return inc(rgs, 12, 'arg2', 'argument');
    });
    return it('log', function() {
        var rgs;
        lang('log');
        rgs = ranges("http://domain.com");
        inc(rgs, 0, 'http', 'url protocol');
        inc(rgs, 4, ':', 'punct url');
        inc(rgs, 5, '/', 'punct url');
        inc(rgs, 6, '/', 'punct url');
        inc(rgs, 7, 'domain', 'url domain');
        inc(rgs, 13, '.', 'punct url tld');
        inc(rgs, 14, 'com', 'url tld');
        rgs = ranges("file.coffee");
        inc(rgs, 0, 'file', 'coffee file');
        inc(rgs, 4, '.', 'punct coffee');
        inc(rgs, 5, 'coffee', 'coffee ext');
        rgs = ranges("/some/path");
        inc(rgs, 1, 'some', 'text dir');
        inc(rgs, 5, '/', 'punct dir');
        rgs = ranges("key: value");
        inc(rgs, 0, 'key', 'dictionary key');
        return inc(rgs, 3, ':', 'punct dictionary');
    });
});


/*
00000000    0000000   00000000    0000000  00000000  
000   000  000   000  000   000  000       000       
00000000   000000000  0000000    0000000   0000000   
000        000   000  000   000       000  000       
000        000   000  000   000  0000000   00000000
 */

describe('parse', function() {
    it('comment', function() {
        lang('coffee');
        parse("##").should.eql([
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
        return parse(",#a").should.eql([
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
        parse('->').should.eql([
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
        parse('=>').should.eql([
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
        return parse('f=->1').should.eql([
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
        parse('1').should.eql([
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
        parse('a').should.eql([
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
        parse('.').should.eql([
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
        parse('1.a').should.eql([
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
        parse('++a').should.eql([
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
        return parse("▸doc 'hello'").should.eql([
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
        b = parse("x");
        b[0].chunks[0].should.include.property('start', 0);
        b = parse(" xx");
        b[0].chunks[0].should.include.property('start', 1);
        b = parse("    xxx");
        b[0].chunks[0].should.include.property('start', 4);
        b = parse("    x 1  , ");
        b[0].chunks[0].should.include.property('start', 4);
        b[0].chunks[1].should.include.property('start', 6);
        return b[0].chunks[2].should.include.property('start', 9);
    });
    return it('switches', function() {
        var b;
        b = parse("▸doc 'hello'\n    x    \n    y\nif 1 then false");
        b[0].should.include.property('ext', 'coffee');
        b[1].should.include.property('ext', 'md');
        b[2].should.include.property('ext', 'md');
        b[3].should.include.property('ext', 'coffee');
        b = parse("▸doc 'hello'\n    x  \n    ```coffeescript\n        1+1\n    ```\n    y\n1");
        b[0].should.include.property('ext', 'coffee');
        b[1].should.include.property('ext', 'md');
        b[2].should.include.property('ext', 'md');
        b[3].should.include.property('ext', 'coffee');
        b[4].should.include.property('ext', 'md');
        b[5].should.include.property('ext', 'md');
        b[6].should.include.property('ext', 'coffee');
        b = parse("▸doc 'hello'                  \n    x                         \n    ```coffeescript           \n        1+1                   \n        ▸doc 'again'          \n            some **docs**     \n    ```                       \n    y                         \n1");
        b[0].should.include.property('ext', 'coffee');
        b[1].should.include.property('ext', 'md');
        b[2].should.include.property('ext', 'md');
        b[3].should.include.property('ext', 'coffee');
        b[4].should.include.property('ext', 'coffee');
        b[5].should.include.property('ext', 'md');
        b[6].should.include.property('ext', 'md');
        b[7].should.include.property('ext', 'md');
        b[8].should.include.property('ext', 'coffee');
        b = parse("▸dooc 'hello'\n    x  ");
        b[0].should.include.property('ext', 'coffee');
        b[1].should.include.property('ext', 'coffee');
        b = parse("```coffeescript\n    1+1\n```\n```javascript\n    1+1;\n```", 'md');
        b[0].should.include.property('ext', 'md');
        b[1].should.include.property('ext', 'coffee');
        b[2].should.include.property('ext', 'md');
        b[3].should.include.property('ext', 'md');
        return b[4].should.include.property('ext', 'js');
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxLQUFSOztBQUNQLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7QUFDTixHQUFHLENBQUMsSUFBSixDQUFBOztBQUNBLENBQUEsR0FBSSxHQUFHLENBQUM7O0FBRVIsR0FBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCO1dBQThCLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBTyxDQUFQLEVBQVUsQ0FBQyxPQUFELEVBQVEsT0FBUixFQUFlLE9BQWYsQ0FBVjtJQUFQLENBQVIsQ0FBa0QsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQS9ELENBQTJFO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsS0FBQSxFQUFNLEtBQWhDO0tBQTNFO0FBQTlCOztBQUNOLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixLQUFwQjtXQUE4QixHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxJQUFGLENBQU8sQ0FBUCxFQUFVLENBQUMsT0FBRCxFQUFRLE9BQVIsRUFBZSxPQUFmLENBQVY7SUFBUCxDQUFSLENBQWtELENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBbkUsQ0FBMkU7UUFBQSxLQUFBLEVBQU0sS0FBTjtRQUFhLEtBQUEsRUFBTSxLQUFuQjtRQUEwQixLQUFBLEVBQU0sS0FBaEM7S0FBM0U7QUFBOUI7O0FBRU4sR0FBQSxHQUFNOztBQUNOLElBQUEsR0FBVSxTQUFDLENBQUQ7V0FBTyxHQUFBLEdBQU07QUFBYjs7QUFDVixNQUFBLEdBQVUsU0FBQyxD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LEtBQTdCLEVBQW1DLFFBQW5DO1FBRUEsQ0FBQSxHQUFJLEtBQUEsQ0FBTSx3QkFBTjtRQUlKLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsUUFBbkM7UUFFQSxDQUFBLEdBQUksS0FBQSxDQUFNLDZEQUFOLEVBT0ssSUFQTDtRQVFKLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsUUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO2VBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7SUFuRVUsQ0FBZDtBQTNHYSxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyMjXG5cbmtsb3IgPSByZXF1aXJlICcuLi8nXG5reGsgPSByZXF1aXJlICdreGsnXG5reGsuY2hhaSgpXG5fID0ga3hrLl9cblxuaW5jID0gKHJncywgc3RhcnQsIG1hdGNoLCB2YWx1ZSkgLT4gcmdzLm1hcCgocikgLT4gXy5waWNrIHIsIFsnc3RhcnQnJ21hdGNoJyd2YWx1ZSddICkuc2hvdWxkLmRlZXAuaW5jbHVkZSAgICAgc3RhcnQ6c3RhcnQsIG1hdGNoOm1hdGNoLCB2YWx1ZTp2YWx1ZVxubnV0ID0gKHJncywgc3RhcnQsIG1hdGNoLCB2YWx1ZSkgLT4gcmdzLm1hcCgocikgLT4gXy5waWNrIHIsIFsnc3RhcnQnJ21hdGNoJyd2YWx1ZSddICkuc2hvdWxkLm5vdC5kZWVwLmluY2x1ZGUgc3RhcnQ6c3RhcnQsIG1hdGNoOm1hdGNoLCB2YWx1ZTp2YWx1ZVxuXG5leHQgPSAnY29mZmVlJ1xubGFuZyAgICA9IChsKSAtPiBleHQgPSBsXG5yYW5nZXMgID0gKHMsZSkgLT4ga2xvci5yYW5nZXMgIHMsIGUgPyBleHRcbnBhcnNlICAgPSAoYyxlKSAtPiBrbG9yLnBhcnNlICAgYy5zcGxpdCgnXFxuJyksIGUgPyBleHRcbmRpc3NlY3QgPSAoYyxlKSAtPiBrbG9yLmRpc3NlY3QgYy5zcGxpdCgnXFxuJyksIGUgPyBleHRcbiAgXG4jIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbjAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiMjI1xuXG5kZXNjcmliZSAncmFuZ2VzJyAtPlxuICAgICAgICAgIFxuICAgIGl0ICdmYWxsYmFjaycgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAndGV4dCcsICd1bmtub3duJ1xuICAgICAgICBpbmMgcmdzLCAwICd0ZXh0JywgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICd0ZXh0JywgJ2Zpc2gnXG4gICAgICAgIGluYyByZ3MsIDAgJ3RleHQnLCAndGV4dCdcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICd1bmljb2RlJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwi8J+MiFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ/CfjIgnICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIvCfjIjwn4yxXCJcbiAgICAgICAgaW5jIHJncywgMCAn8J+MiCcgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIgJ/CfjLEnICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwi8J+ZgmxvbPCfmIBcIlxuICAgICAgICBpbmMgcmdzLCAwICfwn5mCJyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiAnbG9sJyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNSAn8J+YgCcgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJh4p6cYiBh4pas4pa2YlwiXG4gICAgICAgICMgbG9nIHJnc1xuICAgICAgICBpbmMgcmdzLCAxICfinpwnICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAn4pasJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDYgJ+KWticgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwi8J+QgPCfkIHwn5CC8J+Qg/CfkITwn5CF8J+QhvCfkIfwn5CI8J+QifCfkIrwn5CL8J+QjPCfkI3wn5CO8J+Qj/CfkJDwn5CR8J+QkvCfkJPwn5CU8J+QlfCfkJbwn5CX8J+QmPCfkJnwn5Ca8J+Qm/CfkJzwn5Cd8J+QnvCfkJ/wn5Cg8J+QofCfkKLwn5Cj8J+QpPCfkKVcIlxuICAgICAgICBpbmMgcmdzLCAwICfwn5CAJyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMjQgJ/CfkIwnICd0ZXh0J1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnY29tbWVudHMnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJoZWxsbyAjIHdvcmxkXCJcbiAgICAgICAgaW5jIHJncywgNiBcIiNcIiAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgOCBcIndvcmxkXCIgJ2NvbW1lbnQnXG5cbiAgICAgICAgbGFuZyAnbm9vbidcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgIyBibGEgYmx1YlwiXG4gICAgICAgIGluYyByZ3MsIDMgXCIjXCIgICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA1IFwiYmxhXCIgICAnY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgOSBcImJsdWJcIiAgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKF5cXHMqI1xccyopKC4qKSRcIlxuICAgICAgICBmb3Igcm5nIGluIHJnc1xuICAgICAgICAgICAgcm5nLnNob3VsZC5ub3QuaGF2ZS5wcm9wZXJ0eSAndmFsdWUnICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgaXQgJ3RyaXBsZSBjb21tZW50JyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIyMjYSMjI1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMiBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDMgXCJhXCIgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNSBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIjIyNcXG5hXFxuIyMjXCJcbiAgICAgICAgaW5jIGRzc1swXSwgMCBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMCBcImFcIiAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDAgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAxIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMiBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG5cbiAgICAgICAgbGFuZyAnc3R5bCdcbiAgICAgICAgXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIvKlxcbmFcXG4qL1wiIFxuICAgICAgICBpbmMgZHNzWzBdLCAwIFwiL1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSBcIipcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDAgXCJhXCIgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAwIFwiKlwiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMSBcIi9cIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIFxuICAgIGl0ICdjb21tZW50IGhlYWRlcicgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMgMCAwMCAwMDAwXCIgXG4gICAgICAgIGluYyByZ3MsIDAgIFwiI1wiICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCAyICBcIjBcIiAgICAnY29tbWVudCBoZWFkZXInXG4gICAgICAgIGluYyByZ3MsIDQgIFwiMDBcIiAgICdjb21tZW50IGhlYWRlcidcbiAgICAgICAgaW5jIHJncywgNyAgXCIwMDAwXCIgJ2NvbW1lbnQgaGVhZGVyJ1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIjIyNcXG4gMCAwMCAwIFxcbiMjI1wiXG4gICAgICAgIGluYyBkc3NbMV0sIDEgXCIwXCIgJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMgMCAqIDAuMlwiXG4gICAgICAgIGluYyByZ3MsIDIgJzAnICdjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA2ICcwJyAnY29tbWVudCdcbiAgICAgICAgXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIjIyNcXG4gMCAxIDAgXFxuIyMjXCJcbiAgICAgICAgaW5jIGRzc1sxXSwgMSBcIjBcIiAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIFxuICAgICAgICBsYW5nICdzdHlsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLy8gMDAwXCJcbiAgICAgICAgaW5jIHJncywgMyAgXCIwMDBcIiAgICAnY29tbWVudCBoZWFkZXInXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIi8qXFxuIDAgMCAwIFxcbiovXCJcbiAgICAgICAgaW5jIGRzc1sxXSwgMSBcIjBcIiAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ251bWJlcnMnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImEgNjY3MFwiXG4gICAgICAgIGluYyByZ3MsIDIgXCI2NjcwXCIgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIweDY2N0FDXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjB4NjY3QUNcIiAnbnVtYmVyIGhleCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI2Ni43MDBcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiNjZcIiAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMiBcIi5cIiAgICdwdW5jdCBudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDMgXCI3MDBcIiAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjc3LjgwMCAtMTAwXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjc3XCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDggXCIxMDBcIiAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIig4LjksMTAwLjIpXCJcbiAgICAgICAgaW5jIHJncywgMyBcIjlcIiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA5IFwiMlwiICdudW1iZXIgZmxvYXQnXG4gICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NlbXZlcicgLT4gICAgXG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI2Ni43MC4wXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjY2XCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMiBcIi5cIiAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgMyBcIjcwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSBcIi5cIiAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgNiBcIjBcIiAgJ3NlbXZlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJeMC43LjFcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiXlwiICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDEgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMyBcIjdcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiMVwiICdzZW12ZXInXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXjEuMC4wLWFscGhhLjEyXCJcbiAgICAgICAgaW5jIHJncywgMSBcIjFcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiMFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdzdHJpbmdzJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXCJcImE9XCJcXFxcXCJFXFxcXFwiXCIgXCJcIlwiXG4gICAgICAgIGluYyByZ3MsIDIgJ1wiJyAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNCAnXCInICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA1ICdFJyAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgOCAnXCInICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhPVwiXFwnWFxcJ1wiJ1xuICAgICAgICBpbmMgcmdzLCAyICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMyBcIidcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiWFwiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDYgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cXCdcIlhcIlxcJycgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiBcIidcIiAgICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCAzICdcIicgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNCAnWCcgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNiBcIidcIiAgICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cIiAgXFwnWFxcJyAgWSAgXCIgJ1xuICAgICAgICBpbmMgcmdzLCAyICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNSBcIidcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiWFwiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDcgXCInXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTMgJ1wiJyAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhPVwiXCI7Yj1cIiBcIjtjPVwiWFwiJ1xuICAgICAgICBmb3IgaSBpbiBbMiAzIDcgOSAxMyAxNV1cbiAgICAgICAgICAgIGluYyByZ3MsIGksICdcIicsICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnWCcgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImE9Jyc7Yj0nICc7Yz0nWSdcIlxuICAgICAgICBmb3IgaSBpbiBbMiAzIDcgOSAxMyAxNV1cbiAgICAgICAgICAgIGluYyByZ3MsIGksIFwiJ1wiLCAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgMTQgJ1knICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICcnJ1wicyA9ICcvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwJ1wiJycnXG4gICAgICAgIGluYyByZ3MsIDUgXCInXCIgICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxNyBcImZpbGVcIiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjEgXCIuXCIgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDIyIFwidHh0XCIgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyNiBcIjEwXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjggXCInXCIgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDI5ICdcIicgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJycnd2hlbiAnXCJcIlwiJyB0aGVuICdzdHJpbmcgZG91YmxlIHRyaXBsZVxcJycnJ1xuICAgICAgICBpbmMgcmdzLCA2ICdcIicgICAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA3ICdcIicgICAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA4ICdcIicgICAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiJycnd2hlblxcXFwnJycnXCJcbiAgICAgICAgaW5jIHJncywgMyAgXCJ3aGVuXCIgICdzdHJpbmcgc2luZ2xlIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgOCAgXCInXCIgICAgICdzdHJpbmcgc2luZ2xlIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMTEgXCInXCIgICAgICdwdW5jdCBzdHJpbmcgc2luZ2xlIHRyaXBsZSdcbiAgICAgICAgXG4gICAgICAgICMgaW50ZXJwb2xhdGlvblxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIiN7eHh4fVwiJ1xuICAgICAgICBpbmMgcmdzLCAwICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMSBcIiNcIiAgICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMiBcIntcIiAgICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMyAneHh4JyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNiBcIn1cIiAgICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBlbmQnXG4gICAgICAgIGluYyByZ3MsIDcgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIjezY2Nn1cIidcbiAgICAgICAgaW5jIHJncywgMCAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMgJzY2NicgJ251bWJlcidcbiAgICAgICAgaW5jIHJncywgNyAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIlwiXCIjezc3N31cIlwiXCInXG4gICAgICAgIGluYyByZ3MsIDAgICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDEgICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDIgICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDMgICcjJyAgICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgaW5jIHJncywgNCAgJ3snICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCA1ICAnNzc3JyAnbnVtYmVyJ1xuICAgICAgICBpbmMgcmdzLCA4ICAnfScgICAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gZW5kJ1xuICAgICAgICBpbmMgcmdzLCA5ICAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAxMCAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAxMSAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUgdHJpcGxlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIiN7X19kaXJuYW1lfS8uLi9cIidcbiAgICAgICAgaW5jIHJncywgMTIsICd9JyAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gZW5kJ1xuICAgICAgICBpbmMgcmdzLCAxMywgJy8nICdzdHJpbmcgZG91YmxlJ1xuXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnbm9vbicgLT5cbiAgICAgICAgICAgIFxuICAgICAgICBsYW5nICdub29uJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgIHByb3BlcnR5ICB2YWx1ZVwiXG4gICAgICAgIGluYyByZ3MsIDQgJ3Byb3BlcnR5JyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDE0ICd2YWx1ZScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidG9wXCJcbiAgICAgICAgaW5jIHJncywgMCAndG9wJyAgJ29iaidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ0b3AgIHByb3BcIlxuICAgICAgICBpbmMgcmdzLCAwICd0b3AnICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA1ICdwcm9wJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ2ZXJzaW9uICBeMC4xLjJcIlxuICAgICAgICBpbmMgcmdzLCAwICd2ZXJzaW9uJyAgJ29iaidcbiAgICAgICAgaW5jIHJncywgOSAnXicgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgMTAgJzAnICdzZW12ZXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJzb21lLXBhY2thZ2UtbmFtZSAgMVwiXG4gICAgICAgIGluYyByZ3MsIDAgICdzb21lJyAgICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDUgICdwYWNrYWdlJyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEzICduYW1lJyAgICAncHJvcGVydHknXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwic29tZS1wYWNrYWdlLW5hbWUgIF4xLjIuM1wiXG4gICAgICAgIGluYyByZ3MsIDAgICdzb21lJyAgICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDUgICdwYWNrYWdlJyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEzICduYW1lJyAgICAncHJvcGVydHknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ0b3AgIHByb3AgIHZhbHVlXCJcbiAgICAgICAgaW5jIHJncywgMCAgJ3RvcCcgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA1ICAncHJvcCcgICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTEgJ3ZhbHVlJyAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImh0dHA6Ly9kb21haW4uY29tXCJcbiAgICAgICAgaW5jIHJncywgMCAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgaW5jIHJncywgNCAnOicgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNyAnZG9tYWluJyAndXJsIGRvbWFpbidcbiAgICAgICAgaW5jIHJncywgMTMgJy4nICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnY29tJyAndXJsIHRsZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJodHRwOi8vZG9tYWluLmNvbS9kaXIvcGFnZS5odG1sXCJcbiAgICAgICAgaW5jIHJncywgMCAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgaW5jIHJncywgNCAnOicgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNyAnZG9tYWluJyAndXJsIGRvbWFpbidcbiAgICAgICAgaW5jIHJncywgMTMgJy4nICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnY29tJyAndXJsIHRsZCdcbiAgICAgICAgaW5jIHJncywgMTcgJy8nICdwdW5jdCBkaXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmaWxlLmNvZmZlZVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2ZpbGUnICdjb2ZmZWUgZmlsZSdcbiAgICAgICAgaW5jIHJncywgNCAnLicgJ3B1bmN0IGNvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNSAnY29mZmVlJyAnY29mZmVlIGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvc29tZS9wYXRoXCJcbiAgICAgICAgaW5jIHJncywgMSAnc29tZScgICAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICAgICAgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgNiAncGF0aCcgICAndGV4dCBmaWxlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICcvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwJ1xuICAgICAgICBpbmMgcmdzLCAwICAnLycgICAgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMSAgJ3NvbWUnICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNSAgJ1xcXFwnICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE1ICcuJyAgJ3B1bmN0IHR4dCdcbiAgICAgICAgaW5jIHJncywgMTkgJzonICAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgICAgdGVzdCAgLi9ub2RlX21vZHVsZXMvLmJpbi9tb2NoYVwiXG4gICAgICAgIGluYyByZ3MsIDQgJ3Rlc3QnICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTAgJy4nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDExICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxMiAnbm9kZV9tb2R1bGVzJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDI0ICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyNSAnLicgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMjYgJ2JpbicgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyOSAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMzAgJ21vY2hhJyAndGV4dCBmaWxlJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnY29mZmVlJyAtPlxuXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInV0aWwgPSByZXF1aXJlICd1dGlsJ1wiXG4gICAgICAgIGluYyByZ3MsIDcgJ3JlcXVpcmUnICdyZXF1aXJlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiY2xhc3MgTWFjcm8gZXh0ZW5kcyBDb21tYW5kXCJcbiAgICAgICAgaW5jIHJncywgMCAgJ2NsYXNzJyAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA2ICAnTWFjcm8nICAgJ2NsYXNzJ1xuICAgICAgICBpbmMgcmdzLCAxMiAnZXh0ZW5kcycgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDIwICdDb21tYW5kJyAnY2xhc3MnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJleGlzdD8ucHJvcFwiXG4gICAgICAgIGluYyByZ3MsIDcgJ3Byb3AnICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhIGFuZCBiXCJcbiAgICAgICAgaW5jIHJncywgMCBcImFcIiAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiBcImFuZFwiICdrZXl3b3JkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIGEgdGhlbiBiXCJcbiAgICAgICAgaW5jIHJncywgMCBcImlmXCIgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDMgXCJhXCIgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDUgXCJ0aGVuXCIgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEwIFwiYlwiICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInN3aXRjaCBhXCJcbiAgICAgICAgaW5jIHJncywgMCBcInN3aXRjaFwiICdrZXl3b3JkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIGE6IGJcIlxuICAgICAgICBpbmMgcmdzLCAxIFwiYVwiICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm9iai52YWx1ZSA9IG9iai5hbm90aGVyLnZhbHVlXCJcbiAgICAgICAgaW5jIHJncywgMCAgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcInZhbHVlXCIgICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTIgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxNiBcImFub3RoZXJcIidwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMjQgXCJ2YWx1ZVwiICAncHJvcGVydHknXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgc29tZU9iamVjdC5zb21lUHJvcFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJpZlwiICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzIFwic29tZU9iamVjdFwiICdvYmonXG4gICAgICAgIGluYyByZ3MsIDEzIFwiLlwiICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTQgXCJzb21lUHJvcFwiICdwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjEgJ2EnXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjFcIiAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbMF0ucHJvcFwiXG4gICAgICAgIGluYyByZ3MsIDMgJ10nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsgZiBdXCJcbiAgICAgICAgaW5jIHJncywgMiAnZicgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiWyBmICwgZiBdXCJcbiAgICAgICAgaW5jIHJncywgMiAnZicgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWy4uLjJdXCJcbiAgICAgICAgaW5jIHJncywgMiAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCAzICcuJyAncHVuY3QgcmFuZ2UnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCByYW5nZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWyAtMSAuLiBdXCJcbiAgICAgICAgaW5jIHJncywgNiAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCA3ICcuJyAncHVuY3QgcmFuZ2UnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsxLi5uXVwiXG4gICAgICAgIGluYyByZ3MsIDMgJy4nICdwdW5jdCByYW5nZSdcbiAgICAgICAgaW5jIHJncywgNCAnLicgJ3B1bmN0IHJhbmdlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbIC4uLi4gXVwiXG4gICAgICAgIGluYyByZ3MsIDMgJy4nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNCAnLicgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICcuJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDYgJy4nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBmIFsxXVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJAXCIgJ3B1bmN0IGZ1bmN0aW9uIGNhbGwnXG4gICAgICAgIGluYyByZ3MsIDEgXCJmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQGYgPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCBcIkBcIiAncHVuY3QgdGhpcydcbiAgICAgICAgaW5jIHJncywgMSBcImZcIiAndGV4dCB0aGlzJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQGhlaWdodC8yICsgQGhlaWdodC82XCJcbiAgICAgICAgaW5jIHJncywgMCAnQCcgICAgICAncHVuY3QgdGhpcydcbiAgICAgICAgaW5jIHJncywgMSAnaGVpZ2h0JyAndGV4dCB0aGlzJ1xuICAgICAgICBpbmMgcmdzLCA4IFwiMlwiICdudW1iZXInXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuICAgIGl0ICdjb2ZmZWUgZnVuY3Rpb24nIC0+XG5cbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwib2JqLnByb3AuY2FsbCAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnb2JqJyAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0ICdwcm9wJyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDkgJ2NhbGwnICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZG9sYXRlciA9PlwiXG4gICAgICAgIGluYyByZ3MsIDggJz0nICdwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA5ICc+JyAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJkb2xhdGVyIC0+XCJcbiAgICAgICAgaW5jIHJncywgOCAnLScgJ3B1bmN0IGZ1bmN0aW9uIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDkgJz4nICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQGEgQGIgJ2MnXCJcbiAgICAgICAgaW5jIHJncywgMCAnQCcgJ3B1bmN0IGZ1bmN0aW9uIGNhbGwnXG4gICAgICAgIGluYyByZ3MsIDEgJ2EnICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAzICdAJyAncHVuY3QgZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgaW5jIHJncywgNCAnYicgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAYSAzIEBiICc1J1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAxICdhJyAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmZmYgMVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiAnYSdcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmYgJ2InXCJcbiAgICAgICAgaW5jIHJncywgMCBcImZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmZiAtMVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiBbMV1cIlxuICAgICAgICBpbmMgcmdzLCAwIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmZmYgezF9XCJcbiAgICAgICAgaW5jIHJncywgMCBcImZmZmZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSArK2FcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKzRcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpIC00XCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJwb3M9IChpdGVtLCBwKSAtPiBcIlxuICAgICAgICBpbmMgcmdzLCAwIFwicG9zXCIgJ2Z1bmN0aW9uJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAhPSBmYWxzZVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKz0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAtPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAqPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAvPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpID8gZmFsc2VcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpIDwgM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgPiAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSArIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpIC0gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKiAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAvIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICUgM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgPSAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSA9PSAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaXQgJ2NvZmZlZSBtZXRob2QnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgYTogPT5cIlxuICAgICAgICBpbmMgcmdzLCAxIFwiYVwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCBcIj1cIiAncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBhOiAtPlwiXG4gICAgICAgIGluYyByZ3MsIDEgXCJhXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiLVwiICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibXRoZDogIChhcmcpICAgID0+IEBtZW1iZXIgbWVtYXJnXCJcbiAgICAgICAgaW5jIHJncywgMCAgJ210aGQnICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQgICc6JyAgICAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAxNiAnPScgICAgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDE3ICc+JyAgICAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBtdGhkOiAoYXJnKSAtPlwiXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICAgICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEgJ210aGQnICdtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2tvZmZlZScgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2tvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBAOiAtPlwiXG4gICAgICAgIGluYyByZ3MsIDEgXCJAXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiLVwiICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBAOi0+YVwiXG4gICAgICAgIGluYyByZ3MsIDEgXCJAXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiLVwiICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwi4pa4aWYg4pa4dGhlbiDilrhlbGlmIOKWuGVsc2VcIlxuICAgICAgICBpbmMgcmdzLCAwICBcIuKWuFwiICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxICBcImlmXCIgICAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgNCAgXCLilrhcIiAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgNSAgXCJ0aGVuXCIgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDEwIFwi4pa4XCIgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDExIFwiZWxpZlwiICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxNiBcIuKWuFwiICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxNyBcImVsc2VcIiAnbWV0YSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJbMSAneCcgYToxIGM6ZF1cIlxuICAgICAgICBpbmMgcmdzLCAxICBcIjFcIiAgICdudW1iZXInXG4gICAgICAgIGluYyByZ3MsIDQgIFwieFwiICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDcgIFwiYVwiICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCAxMSBcImNcIiAgICdkaWN0aW9uYXJ5IGtleSdcblxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAgICAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnanMnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdqcydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm9iai5wcm9wLmNhbGwoMSk7XCJcbiAgICAgICAgaW5jIHJncywgMCAnb2JqJyAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0ICdwcm9wJyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDkgJ2NhbGwnICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZnVuYyA9IGZ1bmN0aW9uKCkge1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2Z1bmMnICdmdW5jdGlvbidcbiAgICAgICAgaW5jIHJncywgNyAnZnVuY3Rpb24nICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwib2JqLnZhbHVlID0gb2JqLmFub3RoZXIudmFsdWVcIlxuICAgICAgICBpbmMgcmdzLCAwICBcIm9ialwiICAgICdvYmonXG4gICAgICAgIGluYyByZ3MsIDQgIFwidmFsdWVcIiAgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxMiBcIm9ialwiICAgICdvYmonXG4gICAgICAgIGluYyByZ3MsIDE2IFwiYW5vdGhlclwiJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAyNCBcInZhbHVlXCIgICdwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImEoMik7XCJcbiAgICAgICAgaW5jIHJncywgMCAnYScgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOlwiXG4gICAgICAgIGluYyByZ3MsIDAgXCIvXCIgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDEgXCIvXCIgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIjXCIgJ2NvbW1lbnQnXG4gICAgICBcbiAgICAjICAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnanNvbicgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2pzb24nXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJcIlwieyBcIkEgWlwiOiAxIH1cIlwiXCJcbiAgICAgICAgaW5jIHJncywgMiAnXCInICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICBpbmMgcmdzLCAzICdBJyAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIGluYyByZ3MsIDUgJ1onICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgNiAnXCInICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICBpbmMgcmdzLCA3ICc6JyAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCJhXCI6IFwiaHR0cDovL2RvbWFpbi5jb21cIidcbiAgICAgICAgaW5jIHJncywgNiAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgaW5jIHJncywgMTAgJzonICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDExICcvJyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCAxMiAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgMTMgJ2RvbWFpbicgJ3VybCBkb21haW4nXG4gICAgICAgIGluYyByZ3MsIDE5ICcuJyAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgaW5jIHJncywgMjAgJ2NvbScgJ3VybCB0bGQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcImh0dHA6Ly9kb21haW4uY29tL2Rpci9wYWdlLmh0bWxcIidcbiAgICAgICAgaW5jIHJncywgMSAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgaW5jIHJncywgNSAnOicgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNyAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgOCAnZG9tYWluJyAndXJsIGRvbWFpbidcbiAgICAgICAgaW5jIHJncywgMTQgJy4nICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICBpbmMgcmdzLCAxNSAnY29tJyAndXJsIHRsZCdcbiAgICAgICAgaW5jIHJncywgMTggJy8nICdwdW5jdCBkaXInXG4gICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdcImZpbGUuY29mZmVlXCInXG4gICAgICAgIGluYyByZ3MsIDEgJ2ZpbGUnICdjb2ZmZWUgZmlsZSdcbiAgICAgICAgaW5jIHJncywgNSAnLicgJ3B1bmN0IGNvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNiAnY29mZmVlJyAnY29mZmVlIGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiL3NvbWUvcGF0aFwiJ1xuICAgICAgICBpbmMgcmdzLCAyICdzb21lJyAgICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNiAnLycgICAgICAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA3ICdwYXRoJyAgICd0ZXh0IGZpbGUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIi9zb21lXFxcXHBhdGgvZmlsZS50eHQ6MTBcIidcbiAgICAgICAgaW5jIHJncywgMCAnXCInICAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMSAgJy8nICAgICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDIgICdzb21lJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE2ICcuJyAgJ3B1bmN0IHR4dCdcbiAgICAgICAgaW5jIHJncywgMjAgJzonICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjMgJ1wiJyAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIi4vbm9kZV9tb2R1bGVzLy5iaW4vbW9jaGFcIidcbiAgICAgICAgaW5jIHJncywgMSAnLicgJ3RleHQgZGlyJyAjIHdoeSBpcyB0aGlzIHRleHQgYW5kIG5vdCBwdW5jdD9cbiAgICAgICAgaW5jIHJncywgMiAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMyAnbm9kZV9tb2R1bGVzJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE1ICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNiAnLicgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNyAnYmluJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDIwICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyMSAnbW9jaGEnICd0ZXh0IGZpbGUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIjY2LjcwLjBcIidcbiAgICAgICAgaW5jIHJncywgMSBcIjY2XCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMyBcIi5cIiAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgNCBcIjcwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNiBcIi5cIiAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgNyBcIjBcIiAgJ3NlbXZlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiXjAuNy4xXCInXG4gICAgICAgIGluYyByZ3MsIDEgXCJeXCIgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgMiBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiN1wiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDYgXCIxXCIgJ3NlbXZlcidcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiXjEuMC4wLWFscGhhLjEyXCInXG4gICAgICAgIGluYyByZ3MsIDIgXCIxXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNCBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiMFwiICdzZW12ZXInXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdyZWdleHAnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJyPS9hL1wiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDMgJ2EnICAgICAgICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgNCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBlbmQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi8oYXwuKnxcXHNcXGRcXHdcXFNcXFckfF5cXHMrKS9cIlxuICAgICAgICBpbmMgcmdzLCAwICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAyICdhJyAgICAgICAndGV4dCByZWdleHAnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL14jaW5jbHVkZS9cIlxuICAgICAgICBpbmMgcmdzLCAwICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAyIFwiI1wiICAgICAgICdwdW5jdCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDMgXCJpbmNsdWRlXCIgJ3RleHQgcmVnZXhwJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi9cXFxcJ2hlbGxvXFxcXCcvIFwiXG4gICAgICAgIGluYyByZ3MsIDAgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDEgXCJcXFxcXCIgICAgICAncHVuY3QgZXNjYXBlIHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMiBcIidcIiAgICAgICAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiaGVsbG9cIiAgICd0ZXh0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmIGEgL2IgLSBjL2dpXCJcbiAgICAgICAgaW5jIHJncywgNCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgNSAnYicgICAgICAgJ3RleHQgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAxMCAnLycgICAgICAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInc9bC5zcGxpdCAvW1xcXFxzXFxcXC9dLyA7IGJsYVwiXG4gICAgICAgIGluYyByZ3MsIDEwICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAxNCAnXFxcXCcgICAgICAncHVuY3QgZXNjYXBlIHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMTcgJy8nICAgICAgICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICBpbmMgcmdzLCAxOSAnOycgICAgICAgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYSA9IDEgLyAyXCJcbiAgICAgICAgaW5jIHJncywgNiAnLycsICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgOCAnMicsICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKDErMSkgLyAyXCJcbiAgICAgICAgaW5jIHJncywgNiAnLycsICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgOCAnMicsICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsxMF0gLyAyXCJcbiAgICAgICAgaW5jIHJncywgNiAnLycsICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgOCAnMicsICdudW1iZXInXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAndHJpcGxlIHJlZ2V4cCcgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi8vL2EvLy8sYlwiXG4gICAgICAgIGluYyByZ3MsIDAgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDEgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDIgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDMgXCJhXCIgJ3RleHQgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNCBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNSBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNiBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgOCBcImJcIiAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIvLy9cXG5hXFxuLy8vXCJcbiAgICAgICAgaW5jIGRzc1swXSwgMCBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMiBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMCBcImFcIiAndGV4dCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAwIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAxIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAyIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBcbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIlwiXCJcbiAgICAgICAgICAgIC8vL1xuICAgICAgICAgICAgICAgIChbXFxcXFxcXFw/XSkgIyBjb21tZW50XG4gICAgICAgICAgICAvLy8sIGFcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpbmMgZHNzWzBdLCAwICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMiAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCA0ICBcIihcIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDYgIFwiXFxcXFwiICdwdW5jdCBlc2NhcGUgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTIgXCIjXCIgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgZHNzWzFdLCAxNCBcImNvbW1lbnRcIiAnY29tbWVudCdcbiAgICAgICAgaW5jIGRzc1syXSwgMCAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAxICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDIgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgNSAgXCJhXCIgICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIlwiXCJcbiAgICAgICAgICAgIGFyciA9IFsgLy8vYVxcI3tifS8vL1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICd2YWx1ZSdcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpbmMgZHNzWzFdLCA4ICdrZXknLCAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgaXQgJ25vIHJlZ2V4cCcgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ2EgLyBiIC0gYyAvIGQnIFxuICAgICAgICBudXQgcmdzLCAyICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnZiBhL2IsIGMvZCdcbiAgICAgICAgbnV0IHJncywgMyAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm0gPSAnLydcIlxuICAgICAgICBudXQgcmdzLCA1ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm0gYSwgJy8nJy8nXCJcbiAgICAgICAgbnV0IHJncywgNiAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlwiXCJcXFwibSA9ICcvJ1xcXCJcIlwiXCJcbiAgICAgICAgbnV0IHJncywgNiAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInMgPSAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCdcIlxuICAgICAgICBudXQgcmdzLCA1ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBudXQgcmdzLCA5ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibnVtIC89IDEwXCJcbiAgICAgICAgbnV0IHJncywgNCAnLycgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIG51dCByZ3MsIDcgJzEwJyAndGV4dCByZWdleHAnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0IC8gMiAvIDFcIlxuICAgICAgICBpbmMgcmdzLCAyICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQvMi8xXCJcbiAgICAgICAgaW5jIHJncywgMSAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAzICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0LyAyIC8gMVwiXG4gICAgICAgIGluYyByZ3MsIDEgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNCAvMiAvIDFcIlxuICAgICAgICBpbmMgcmdzLCAyICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQgLyAyLyAxXCJcbiAgICAgICAgaW5jIHJncywgMiAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0IC8gMiAvMVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNCAvMi8gMVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNCAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpdCAnbWQnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdtZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIioqYm9sZCoqXCJcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMSAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMiAnYm9sZCcgICAndGV4dCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA2ICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA3ICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLCoqYioqLFwiXG4gICAgICAgIGluYyByZ3MsIDEgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDMgJ2InICAgICAgJ3RleHQgYm9sZCdcbiAgICAgICAgaW5jIHJncywgNCAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKml0IGxpYypcIlxuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2l0JyAgICAgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA0ICdsaWMnICAgICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNyAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKml0YWxpYypcIlxuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2l0YWxpYycgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA3ICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIipgaXRhbGljIGNvZGVgKlwiXG4gICAgICAgIGluYyByZ3MsIDAgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgMSAnYCcgICAgICAncHVuY3QgaXRhbGljIGNvZGUnXG4gICAgICAgIGluYyByZ3MsIDIgJ2l0YWxpYycgJ3RleHQgaXRhbGljIGNvZGUnXG4gICAgICAgIGluYyByZ3MsIDkgJ2NvZGUnICAgJ3RleHQgaXRhbGljIGNvZGUnXG4gICAgICAgIGluYyByZ3MsIDE0ICcqJyAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIml0J3MgZ29vZFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2l0JyAgICAgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIgXCInXCIgICAgICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDMgJ3MnICAgICAgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpZiBpcyBlbXB0eSBpbiB0aGVuXCJcbiAgICAgICAgaW5jIHJncywgMCAgJ2lmJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMyAgJ2lzJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNiAgJ2VtcHR5JyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTIgJ2luJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTUgJ3RoZW4nICAndGV4dCdcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwi4pa4ZG9jXFxuICAgIGlmIGlzIGVtcHR5IGluIHRoZW5cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgZHNzWzFdLCA0ICAnaWYnICAgICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCA3ICAnaXMnICAgICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCAxMCAgJ2VtcHR5JyAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTYgJ2luJyAgICAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTkgJ3RoZW4nICAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAndGV4dCBmaWxlcy4gYmxhJ1xuICAgICAgICBpbmMgcmdzLCAwLCAndGV4dCcgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDEwLCAnLicgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICcuLmJsYSdcbiAgICAgICAgaW5jIHJncywgMCwgJy4nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMSwgJy4nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYGBgY29mZmVlc2NyaXB0J1xuICAgICAgICBpbmMgcmdzLCAwICdgJyAncHVuY3QgY29kZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDMgJ2NvZmZlZXNjcmlwdCcgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLSBsaVwiXG4gICAgICAgIGluYyByZ3MsIDAgJy0nICAncHVuY3QgbGkxIG1hcmtlcidcbiAgICAgICAgaW5jIHJncywgMiAnbGknICd0ZXh0IGxpMSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgICAgLSAqKmJvbGQqKlwiXG4gICAgICAgIGluYyByZ3MsIDQgJy0nICAgICdwdW5jdCBsaTIgbWFya2VyJ1xuICAgICAgICBpbmMgcmdzLCA4ICdib2xkJyAndGV4dCBsaTIgYm9sZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiAgICAgICAgLSAqKmJvbGQqKlwiXG4gICAgICAgIGluYyByZ3MsIDggJy0nICAgICdwdW5jdCBsaTMgbWFya2VyJ1xuICAgICAgICBpbmMgcmdzLCAxMiAnYm9sZCcgJ3RleHQgbGkzIGJvbGQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgICAgICAqICoqYm9sZCoqXCJcbiAgICAgICAgaW5jIHJncywgOCAnKicgICAgJ3B1bmN0IGxpMyBtYXJrZXInXG4gICAgICAgIGluYyByZ3MsIDEyICdib2xkJyAndGV4dCBsaTMgYm9sZCdcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiXCJcIlxuICAgICAgICAgICAgLSBsaTFcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGluYyBkc3NbMF0sIDAgICctJyAgICAncHVuY3QgbGkxIG1hcmtlcidcbiAgICAgICAgaW5jIGRzc1sxXSwgMCAgJ3RleHQnICd0ZXh0J1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCJcIlwiXG4gICAgICAgICAgICAjIGgxXG4gICAgICAgICAgICAjIyBoMlxuICAgICAgICAgICAgIyMjIGgzXG4gICAgICAgICAgICAjIyMjIGg0XG4gICAgICAgICAgICAjIyMjIyBoNVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgaW5jIGRzc1swXSwgMCAgXCIjXCIgICAgJ3B1bmN0IGgxJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyICBcImgxXCIgICAndGV4dCBoMSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMCAgXCIjXCIgICAgJ3B1bmN0IGgyJ1xuICAgICAgICBpbmMgZHNzWzFdLCAzICBcImgyXCIgICAndGV4dCBoMidcbiAgICAgICAgaW5jIGRzc1syXSwgMCAgXCIjXCIgICAgJ3B1bmN0IGgzJ1xuICAgICAgICBpbmMgZHNzWzJdLCA0ICBcImgzXCIgICAndGV4dCBoMydcbiAgICAgICAgaW5jIGRzc1szXSwgMCAgXCIjXCIgICAgJ3B1bmN0IGg0J1xuICAgICAgICBpbmMgZHNzWzNdLCA1ICBcImg0XCIgICAndGV4dCBoNCdcbiAgICAgICAgaW5jIGRzc1s0XSwgMCAgXCIjXCIgICAgJ3B1bmN0IGg1J1xuICAgICAgICBpbmMgZHNzWzRdLCA2ICBcImg1XCIgICAndGV4dCBoNSdcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiXCJcIlxuICAgICAgICAgICAgYGBganNcbiAgICAgICAgICAgIGBgYFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgaW5jIGRzc1sxXSwgMCAnYCcgJ3B1bmN0IGNvZGUgdHJpcGxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgIFxuICAgIGl0ICdodG1sJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnaHRtbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjwvZGl2PlwiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiPFwiICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiL1wiICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiZGl2XCIgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiPlwiICAgICdwdW5jdCBrZXl3b3JkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjxkaXY+XCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCI8XCIgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEgXCJkaXZcIiAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDQgXCI+XCIgICAgJ3B1bmN0IGtleXdvcmQnXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAgMDAwIDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAwMDAwMCAgICAwMDAgICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdzdHlsJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnc3R5bCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjFlbVwiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiMWVtXCIgICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMWV4XCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIxZXhcIiAgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIxcHhcIiBcbiAgICAgICAgaW5jIHJncywgMCBcIjFweFwiICAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjFzXCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIxc1wiICAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi5jbHNzXCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIuXCIgICAgICdwdW5jdCBjbGFzcydcbiAgICAgICAgaW5jIHJncywgMSBcImNsc3NcIiAgJ2NsYXNzJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiNpZFwiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICdwdW5jdCBmdW5jdGlvbidcbiAgICAgICAgaW5jIHJncywgMSBcImlkXCIgICAnZnVuY3Rpb24nXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2lkLWZvby1iYXJcIiBcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICAncHVuY3QgZnVuY3Rpb24nXG4gICAgICAgIGluYyByZ3MsIDEgXCJpZFwiICAgJ2Z1bmN0aW9uJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiLVwiICAgICdwdW5jdCBmdW5jdGlvbidcbiAgICAgICAgaW5jIHJncywgNCBcImZvb1wiICAnZnVuY3Rpb24nXG4gICAgICAgIGluYyByZ3MsIDcgXCItXCIgICAgJ3B1bmN0IGZ1bmN0aW9uJ1xuICAgICAgICBpbmMgcmdzLCA4IFwiYmFyXCIgICdmdW5jdGlvbidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIuY2xzcy1mb28tYmFyXCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIuXCIgICAgJ3B1bmN0IGNsYXNzJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiY2xzc1wiICdjbGFzcydcbiAgICAgICAgaW5jIHJncywgNSBcIi1cIiAgICAncHVuY3QgY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDYgXCJmb29cIiAgJ2NsYXNzJ1xuICAgICAgICBpbmMgcmdzLCA5IFwiLVwiICAgICdwdW5jdCBjbGFzcydcbiAgICAgICAgaW5jIHJncywgMTAgXCJiYXJcIiAgJ2NsYXNzJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIzY2NlwiXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgICAncHVuY3QgbnVtYmVyIGhleCdcbiAgICAgICAgaW5jIHJncywgMSBcIjY2NlwiICdudW1iZXIgaGV4J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2FiY1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgICAncHVuY3QgbnVtYmVyIGhleCdcbiAgICAgICAgaW5jIHJncywgMSBcImFiY1wiICdudW1iZXIgaGV4J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2YwZjBmMFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgICAgICAncHVuY3QgbnVtYmVyIGhleCdcbiAgICAgICAgaW5jIHJncywgMSBcImYwZjBmMFwiICdudW1iZXIgaGV4J1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgXG4gICAgXG4gICAgaXQgJ2NwcCcgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NwcCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiNpbmNsdWRlXCIgICAgICBcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICAgICAgJ3B1bmN0IGRlZmluZSdcbiAgICAgICAgaW5jIHJncywgMSBcImluY2x1ZGVcIiAgJ2RlZmluZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjaWZcIiAgICAgICAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiaWZcIiAgICAgICAnZGVmaW5lJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMgIGlmXCIgICAgICAgICAgICBcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICAgICAgJ3B1bmN0IGRlZmluZSdcbiAgICAgICAgaW5jIHJncywgMyBcImlmXCIgICAgICAgJ2RlZmluZSdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpZiAodHJ1ZSkge30gZWxzZSB7fVwiICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiaWZcIiAgICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNCBcInRydWVcIiAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEzIFwiZWxzZVwiICdrZXl3b3JkJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjEuMGZcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiMVwiICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAxIFwiLlwiICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAyIFwiMGZcIiAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjAuMDAwMGZcIlxuICAgICAgICBpbmMgcmdzLCAyIFwiMDAwMGZcIiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NoJyAtPlxuXG4gICAgICAgIGxhbmcgJ3NoJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZGlyL3BhdGgvd2l0aC9kYXNoZXMvZmlsZS50eHRcIlxuICAgICAgICBpbmMgcmdzLCAwICdkaXInICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNCAncGF0aCcgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA5ICd3aXRoJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE0ICdkYXNoZXMnICd0ZXh0IGRpcidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInByZyAtLWFyZzEgLWFyZzJcIlxuICAgICAgICBpbmMgcmdzLCA0ICctJyAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDUgJy0nICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgNiAnYXJnMScgJ2FyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCAxMSAnLScgJ3B1bmN0IGFyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCAxMiAnYXJnMicgJ2FyZ3VtZW50J1xuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdsb2cnIC0+XG5cbiAgICAgICAgbGFuZyAnbG9nJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaHR0cDovL2RvbWFpbi5jb21cIlxuICAgICAgICBpbmMgcmdzLCAwICdodHRwJyAndXJsIHByb3RvY29sJ1xuICAgICAgICBpbmMgcmdzLCA0ICc6JyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCA2ICcvJyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCA3ICdkb21haW4nICd1cmwgZG9tYWluJ1xuICAgICAgICBpbmMgcmdzLCAxMyAnLicgJ3B1bmN0IHVybCB0bGQnXG4gICAgICAgIGluYyByZ3MsIDE0ICdjb20nICd1cmwgdGxkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmlsZS5jb2ZmZWVcIlxuICAgICAgICBpbmMgcmdzLCAwICdmaWxlJyAnY29mZmVlIGZpbGUnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCBjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDUgJ2NvZmZlZScgJ2NvZmZlZSBleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL3NvbWUvcGF0aFwiXG4gICAgICAgIGluYyByZ3MsIDEgJ3NvbWUnICAgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAgICAgICdwdW5jdCBkaXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwia2V5OiB2YWx1ZVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2tleScgICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCAzICc6JyAgICAgICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICBcbiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4jIyNcblxuZGVzY3JpYmUgJ3BhcnNlJyAtPlxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpdCAnY29tbWVudCcgLT5cbiAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHBhcnNlKFwiIyNcIikuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnIHR1cmQ6XCIjI1wifSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICBcbiAgICAgICAgcGFyc2UoXCIsI2FcIikuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6XCIsXCIgdmFsdWU6J3B1bmN0JyB0dXJkOiBcIiwjXCJ9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCd9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDpcImFcIiB2YWx1ZTonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ2Z1bmN0aW9uJyAtPlxuICAgIFxuICAgICAgICBwYXJzZSgnLT4nKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6ICctPid9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgcGFyc2UoJz0+Jykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jz0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJyB0dXJkOiAnPT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgIHBhcnNlKCdmPS0+MScpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczo1IGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOidmJyB2YWx1ZTonZnVuY3Rpb24nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbicgICAgICB0dXJkOic9LT4nIH0gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoyIGxlbmd0aDoxIG1hdGNoOictJyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDonLT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjMgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDo0IGxlbmd0aDoxIG1hdGNoOicxJyB2YWx1ZTonbnVtYmVyJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnbWluaW1hbCcgLT5cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHBhcnNlKCcxJykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IF1dXG4gICAgICAgIHBhcnNlKCdhJykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3RleHQnfSBdXVxuICAgICAgICBwYXJzZSgnLicpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy4nIHZhbHVlOidwdW5jdCd9IF1dXG4gICAgXG4gICAgICAgIHBhcnNlKCcxLmEnKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOicxJyB2YWx1ZTonbnVtYmVyJ30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjEgbWF0Y2g6Jy4nIHZhbHVlOidwdW5jdCBwcm9wZXJ0eSd9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgIGxlbmd0aDoxIG1hdGNoOidhJyB2YWx1ZToncHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcGFyc2UoJysrYScpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCAgbGVuZ3RoOjEgbWF0Y2g6JysnIHZhbHVlOidwdW5jdCcgdHVyZDonKysnfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MSBtYXRjaDonKycgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHBhcnNlKFwi4pa4ZG9jICdoZWxsbydcIikuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOifilrgnICAgICB2YWx1ZToncHVuY3QgbWV0YSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MyBtYXRjaDonZG9jJyAgIHZhbHVlOidtZXRhJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjUgIGxlbmd0aDoxIG1hdGNoOlwiJ1wiICAgICB2YWx1ZToncHVuY3Qgc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDo2ICBsZW5ndGg6NSBtYXRjaDpcImhlbGxvXCIgdmFsdWU6J3N0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MTEgbGVuZ3RoOjEgbWF0Y2g6XCInXCIgICAgIHZhbHVlOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnc3BhY2UnIC0+XG4gICAgXG4gICAgICAgIGIgPSBwYXJzZSBcInhcIlxuICAgICAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDBcbiAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiIHh4XCJcbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAxXG4gICAgICAgIFxuICAgICAgICBiID0gcGFyc2UgXCIgICAgeHh4XCJcbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgXG4gICAgICAgIGIgPSBwYXJzZSBcIiAgICB4IDEgICwgXCJcbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgICAgIGJbMF0uY2h1bmtzWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNlxuICAgICAgICBiWzBdLmNodW5rc1syXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDlcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ3N3aXRjaGVzJyAtPlxuICAgICAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICAgIFxuICAgICAgICAgICAgICAgIHlcbiAgICAgICAgICAgIGlmIDEgdGhlbiBmYWxzZVwiXCJcIlxuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICBcbiAgICAgICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICAgICAgeVxuICAgICAgICAgICAgMVwiXCJcIlxuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiXCJcIiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0ICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgMSsxICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICDilrhkb2MgJ2FnYWluJyAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvbWUgKipkb2NzKiogICAgIFxuICAgICAgICAgICAgICAgIGBgYCAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgeSAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIDFcIlwiXCJcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbN10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzhdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICBiID0gcGFyc2UgXCJcIlwiXG4gICAgICAgICAgICDilrhkb29jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICBcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiXCJcIlxuICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzE7XG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIFwiXCJcIiwgJ21kJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2pzJ1xuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/test.coffee