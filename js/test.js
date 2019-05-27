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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxLQUFSOztBQUNQLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7QUFDTixHQUFHLENBQUMsSUFBSixDQUFBOztBQUNBLENBQUEsR0FBSSxHQUFHLENBQUM7O0FBRVIsR0FBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCO1dBQThCLEdBQUcsQ0FBQyxHQUFKLENBQVEsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBTyxDQUFQLEVBQVUsQ0FBQyxPQUFELEVBQVEsT0FBUixFQUFlLE9BQWYsQ0FBVjtJQUFQLENBQVIsQ0FBa0QsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQS9ELENBQTJFO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsS0FBQSxFQUFNLEtBQWhDO0tBQTNFO0FBQTlCOztBQUNOLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixLQUFwQjtXQUE4QixHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxJQUFGLENBQU8sQ0FBUCxFQUFVLENBQUMsT0FBRCxFQUFRLE9BQVIsRUFBZSxPQUFmLENBQVY7SUFBUCxDQUFSLENBQWtELENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBbkUsQ0FBMkU7UUFBQSxLQUFBLEVBQU0sS0FBTjtRQUFhLEtBQUEsRUFBTSxLQUFuQjtRQUEwQixLQUFBLEVBQU0sS0FBaEM7S0FBM0U7QUFBOUI7O0FBRU4sR0FBQSxHQUFNOztBQUNOLElBQUEsR0FBVSxTQUFDLENBQUQ7V0FBTyxHQUFBLEdBQU07QUFBYjs7QUFDVixNQUFBLEdBQVUsU0FBQyxD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QUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztlQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO0lBbkVVLENBQWQ7QUEzR2EsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiMjI1xuXG5rbG9yID0gcmVxdWlyZSAnLi4vJ1xua3hrID0gcmVxdWlyZSAna3hrJ1xua3hrLmNoYWkoKVxuXyA9IGt4ay5fXG5cbmluYyA9IChyZ3MsIHN0YXJ0LCBtYXRjaCwgdmFsdWUpIC0+IHJncy5tYXAoKHIpIC0+IF8ucGljayByLCBbJ3N0YXJ0JydtYXRjaCcndmFsdWUnXSApLnNob3VsZC5kZWVwLmluY2x1ZGUgICAgIHN0YXJ0OnN0YXJ0LCBtYXRjaDptYXRjaCwgdmFsdWU6dmFsdWVcbm51dCA9IChyZ3MsIHN0YXJ0LCBtYXRjaCwgdmFsdWUpIC0+IHJncy5tYXAoKHIpIC0+IF8ucGljayByLCBbJ3N0YXJ0JydtYXRjaCcndmFsdWUnXSApLnNob3VsZC5ub3QuZGVlcC5pbmNsdWRlIHN0YXJ0OnN0YXJ0LCBtYXRjaDptYXRjaCwgdmFsdWU6dmFsdWVcblxuZXh0ID0gJ2NvZmZlZSdcbmxhbmcgICAgPSAobCkgLT4gZXh0ID0gbFxucmFuZ2VzICA9IChzLGUpIC0+IGtsb3IucmFuZ2VzICBzLCBlID8gZXh0XG5wYXJzZSAgID0gKGMsZSkgLT4ga2xvci5wYXJzZSAgIGMuc3BsaXQoJ1xcbicpLCBlID8gZXh0XG5kaXNzZWN0ID0gKGMsZSkgLT4ga2xvci5kaXNzZWN0IGMuc3BsaXQoJ1xcbicpLCBlID8gZXh0XG4gIFxuIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4jIyNcblxuZGVzY3JpYmUgJ3JhbmdlcycgLT5cbiAgICAgICAgICBcbiAgICBpdCAnZmFsbGJhY2snIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ3RleHQnLCAndW5rbm93bidcbiAgICAgICAgaW5jIHJncywgMCAndGV4dCcsICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAndGV4dCcsICdmaXNoJ1xuICAgICAgICBpbmMgcmdzLCAwICd0ZXh0JywgJ3RleHQnXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAndW5pY29kZScgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIvCfjIhcIlxuICAgICAgICBpbmMgcmdzLCAwICfwn4yIJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCLwn4yI8J+MsVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ/CfjIgnICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAyICfwn4yxJyAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIvCfmYJsb2zwn5iAXCJcbiAgICAgICAgaW5jIHJncywgMCAn8J+ZgicgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIgJ2xvbCcgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDUgJ/CfmIAnICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYeKenGIgYeKWrOKWtmJcIlxuICAgICAgICAjIGxvZyByZ3NcbiAgICAgICAgaW5jIHJncywgMSAn4p6cJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDUgJ+KWrCcgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA2ICfilrYnICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIvCfkIDwn5CB8J+QgvCfkIPwn5CE8J+QhfCfkIbwn5CH8J+QiPCfkInwn5CK8J+Qi/CfkIzwn5CN8J+QjvCfkI/wn5CQ8J+QkfCfkJLwn5CT8J+QlPCfkJXwn5CW8J+Ql/CfkJjwn5CZ8J+QmvCfkJvwn5Cc8J+QnfCfkJ7wn5Cf8J+QoPCfkKHwn5Ci8J+Qo/CfkKTwn5ClXCJcbiAgICAgICAgaW5jIHJncywgMCAn8J+QgCcgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDI0ICfwn5CMJyAndGV4dCdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ2NvbW1lbnRzJyAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaGVsbG8gIyB3b3JsZFwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDYgXCIjXCIgICAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDggXCJ3b3JsZFwiICdjb21tZW50J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiAgICMgYmxhIGJsdWJcIiAnbm9vbidcbiAgICAgICAgaW5jIHJncywgMyBcIiNcIiAgICAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDUgXCJibGFcIiAgICdjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA5IFwiYmx1YlwiICAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIoXlxccyojXFxzKikoLiopJFwiICdub29uJ1xuICAgICAgICBmb3Igcm5nIGluIHJnc1xuICAgICAgICAgICAgcm5nLnNob3VsZC5ub3QuaGF2ZS5wcm9wZXJ0eSAndmFsdWUnICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgaXQgJ3RyaXBsZSBjb21tZW50JyAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIyMjYSMjI1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMiBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDMgXCJhXCIgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNSBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIjIyNcXG5hXFxuIyMjXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMCBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMCBcImFcIiAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDAgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAxIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMiBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIi8qXFxuYVxcbiovXCIgJ3N0eWwnXG4gICAgICAgIGluYyBkc3NbMF0sIDAgXCIvXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAxIFwiKlwiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMCBcImFcIiAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDAgXCIqXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAxIFwiL1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgXG4gICAgaXQgJ2NvbW1lbnQgaGVhZGVyJyAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIyAwIDAwIDAwMDBcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwICBcIiNcIiAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgMiAgXCIwXCIgICAgJ2NvbW1lbnQgaGVhZGVyJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcIjAwXCIgICAnY29tbWVudCBoZWFkZXInXG4gICAgICAgIGluYyByZ3MsIDcgIFwiMDAwMFwiICdjb21tZW50IGhlYWRlcidcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiIyMjXFxuIDAgMDAgMCBcXG4jIyNcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAxIFwiMFwiICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvLyAwMDBcIiAnc3R5bCdcbiAgICAgICAgaW5jIHJncywgMyAgXCIwMDBcIiAgICAnY29tbWVudCBoZWFkZXInXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIi8qXFxuIDAgMCAwIFxcbiovXCIgJ3N0eWwnXG4gICAgICAgIGluYyBkc3NbMV0sIDEgXCIwXCIgJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMgMCAqIDAuMlwiXG4gICAgICAgIGluYyByZ3MsIDIgJzAnICdjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA2ICcwJyAnY29tbWVudCdcbiAgICAgICAgXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIjIyNcXG4gMCAxIDAgXFxuIyMjXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMSBcIjBcIiAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnbnVtYmVycycgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImEgNjY3MFwiXG4gICAgICAgIGluYyByZ3MsIDIgXCI2NjcwXCIgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIweDY2N0FDXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjB4NjY3QUNcIiAnbnVtYmVyIGhleCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI2Ni43MDBcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiNjZcIiAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMiBcIi5cIiAgICdwdW5jdCBudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDMgXCI3MDBcIiAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjc3LjgwMCAtMTAwXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjc3XCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDggXCIxMDBcIiAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIig4LjksMTAwLjIpXCJcbiAgICAgICAgaW5jIHJncywgMyBcIjlcIiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA5IFwiMlwiICdudW1iZXIgZmxvYXQnXG4gICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NlbXZlcicgLT4gICAgXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI2Ni43MC4wXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjY2XCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMiBcIi5cIiAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgMyBcIjcwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSBcIi5cIiAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgNiBcIjBcIiAgJ3NlbXZlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJeMC43LjFcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiXlwiICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDEgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMyBcIjdcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiMVwiICdzZW12ZXInXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXjEuMC4wLWFscGhhLjEyXCJcbiAgICAgICAgaW5jIHJncywgMSBcIjFcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiMFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdzdHJpbmdzJyAtPlxuICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJcIlwiYT1cIlxcXFxcIkVcXFxcXCJcIiBcIlwiXCJcbiAgICAgICAgaW5jIHJncywgMiAnXCInICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA0ICdcIicgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDUgJ0UnICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA4ICdcIicgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XCJcXCdYXFwnXCInXG4gICAgICAgIGluYyByZ3MsIDIgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiJ1wiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDQgXCJYXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNiAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdhPVxcJ1wiWFwiXFwnJyAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiJ1wiICAgJ3B1bmN0IHN0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDMgJ1wiJyAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA0ICdYJyAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiJ1wiICAgJ3B1bmN0IHN0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhPVwiICBcXCdYXFwnICBZICBcIiAnXG4gICAgICAgIGluYyByZ3MsIDIgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiJ1wiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCJYXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNyBcIidcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxMyAnXCInICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XCJcIjtiPVwiIFwiO2M9XCJYXCInXG4gICAgICAgIGZvciBpIGluIFsyIDMgNyA5IDEzIDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgJ1wiJywgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDE0ICdYJyAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYT0nJztiPScgJztjPSdZJ1wiICdjb2ZmZWUnXG4gICAgICAgIGZvciBpIGluIFsyIDMgNyA5IDEzIDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgXCInXCIsICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnWScgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJycnXCJzID0gJy9zb21lXFxcXHBhdGgvZmlsZS50eHQ6MTAnXCInJydcbiAgICAgICAgaW5jIHJncywgNSBcIidcIiAgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDE3IFwiZmlsZVwiICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyMSBcIi5cIiAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjIgXCJ0eHRcIiAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDI2IFwiMTBcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyOCBcIidcIiAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjkgJ1wiJyAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnJyd3aGVuICdcIlwiXCInIHRoZW4gJ3N0cmluZyBkb3VibGUgdHJpcGxlXFwnJycnXG4gICAgICAgIGluYyByZ3MsIDYgJ1wiJyAgICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDcgJ1wiJyAgICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDggJ1wiJyAgICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCInJyd3aGVuXFxcXCcnJydcIlxuICAgICAgICBpbmMgcmdzLCAzICBcIndoZW5cIiAgJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA4ICBcIidcIiAgICAgJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAxMSBcIidcIiAgICAgJ3B1bmN0IHN0cmluZyBzaW5nbGUgdHJpcGxlJ1xuICAgICAgICBcbiAgICAgICAgIyBpbnRlcnBvbGF0aW9uXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiI3t4eHh9XCInICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiI1wiICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAyIFwie1wiICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAzICd4eHgnICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA2IFwifVwiICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgaW5jIHJncywgNyAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIiN7NjY2fVwiJyAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMyAnNjY2JyAnbnVtYmVyJ1xuICAgICAgICBpbmMgcmdzLCA3ICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIje19fZGlybmFtZX0vLi4vXCInICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDEyLCAnfScgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgaW5jIHJncywgMTMsICcvJyAnc3RyaW5nIGRvdWJsZSdcblxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ25vb24nIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgbGFuZyAnbm9vbidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiAgICBwcm9wZXJ0eSAgdmFsdWVcIlxuICAgICAgICBpbmMgcmdzLCA0ICdwcm9wZXJ0eScgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxNCAndmFsdWUnICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInRvcFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ3RvcCcgICdvYmonXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidG9wICBwcm9wXCJcbiAgICAgICAgaW5jIHJncywgMCAndG9wJyAgJ29iaidcbiAgICAgICAgaW5jIHJncywgNSAncHJvcCcgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidmVyc2lvbiAgXjAuMS4yXCJcbiAgICAgICAgaW5jIHJncywgMCAndmVyc2lvbicgICdvYmonXG4gICAgICAgIGluYyByZ3MsIDkgJ14nICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDEwICcwJyAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwic29tZS1wYWNrYWdlLW5hbWUgIDFcIlxuICAgICAgICBpbmMgcmdzLCAwICAnc29tZScgICAgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCA1ICAncGFja2FnZScgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxMyAnbmFtZScgICAgJ3Byb3BlcnR5J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInNvbWUtcGFja2FnZS1uYW1lICBeMS4yLjNcIlxuICAgICAgICBpbmMgcmdzLCAwICAnc29tZScgICAgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCA1ICAncGFja2FnZScgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxMyAnbmFtZScgICAgJ3Byb3BlcnR5J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidG9wICBwcm9wICB2YWx1ZVwiXG4gICAgICAgIGluYyByZ3MsIDAgICd0b3AnICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgNSAgJ3Byb3AnICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDExICd2YWx1ZScgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJodHRwOi8vZG9tYWluLmNvbVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2h0dHAnICd1cmwgcHJvdG9jb2wnXG4gICAgICAgIGluYyByZ3MsIDQgJzonICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDcgJ2RvbWFpbicgJ3VybCBkb21haW4nXG4gICAgICAgIGluYyByZ3MsIDEzICcuJyAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgaW5jIHJncywgMTQgJ2NvbScgJ3VybCB0bGQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaHR0cDovL2RvbWFpbi5jb20vZGlyL3BhZ2UuaHRtbFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2h0dHAnICd1cmwgcHJvdG9jb2wnXG4gICAgICAgIGluYyByZ3MsIDQgJzonICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDcgJ2RvbWFpbicgJ3VybCBkb21haW4nXG4gICAgICAgIGluYyByZ3MsIDEzICcuJyAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgaW5jIHJncywgMTQgJ2NvbScgJ3VybCB0bGQnXG4gICAgICAgIGluYyByZ3MsIDE3ICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmlsZS5jb2ZmZWVcIlxuICAgICAgICBpbmMgcmdzLCAwICdmaWxlJyAnY29mZmVlIGZpbGUnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCBjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDUgJ2NvZmZlZScgJ2NvZmZlZSBleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL3NvbWUvcGF0aFwiXG4gICAgICAgIGluYyByZ3MsIDEgJ3NvbWUnICAgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAgICAgICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDYgJ3BhdGgnICAgJ3RleHQgZmlsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCdcbiAgICAgICAgaW5jIHJncywgMCAgJy8nICAgICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDEgICdzb21lJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDUgICdcXFxcJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNSAnLicgICdwdW5jdCB0eHQnXG4gICAgICAgIGluYyByZ3MsIDE5ICc6JyAgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgIHRlc3QgIC4vbm9kZV9tb2R1bGVzLy5iaW4vbW9jaGFcIlxuICAgICAgICBpbmMgcmdzLCA0ICd0ZXN0JyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEwICcuJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxMSAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMTIgJ25vZGVfbW9kdWxlcycgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyNCAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMjUgJy4nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDI2ICdiaW4nICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgMjkgJy8nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDMwICdtb2NoYScgJ3RleHQgZmlsZSdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2NvZmZlZScgLT5cblxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ1dGlsID0gcmVxdWlyZSAndXRpbCdcIlxuICAgICAgICBpbmMgcmdzLCA3ICdyZXF1aXJlJyAncmVxdWlyZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImNsYXNzIE1hY3JvIGV4dGVuZHMgQ29tbWFuZFwiXG4gICAgICAgIGluYyByZ3MsIDAgICdjbGFzcycgICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNiAgJ01hY3JvJyAgICdjbGFzcydcbiAgICAgICAgaW5jIHJncywgMTIgJ2V4dGVuZHMnICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyMCAnQ29tbWFuZCcgJ2NsYXNzJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZXhpc3Q/LnByb3BcIlxuICAgICAgICBpbmMgcmdzLCA3ICdwcm9wJyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYSBhbmQgYlwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJhXCIgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIgXCJhbmRcIiAna2V5d29yZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpZiBhIHRoZW4gYlwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJpZlwiICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiYVwiICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA1IFwidGhlblwiICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxMCBcImJcIiAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJzd2l0Y2ggYVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJzd2l0Y2hcIiAna2V5d29yZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBhOiBiXCJcbiAgICAgICAgaW5jIHJncywgMSBcImFcIiAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJvYmoudmFsdWUgPSBvYmouYW5vdGhlci52YWx1ZVwiXG4gICAgICAgIGluYyByZ3MsIDAgIFwib2JqXCIgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgNCAgXCJ2YWx1ZVwiICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEyIFwib2JqXCIgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgMTYgXCJhbm90aGVyXCIncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDI0IFwidmFsdWVcIiAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIHNvbWVPYmplY3Quc29tZVByb3BcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiaWZcIiAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMyBcInNvbWVPYmplY3RcIiAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxMyBcIi5cIiAncHVuY3QgcHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDE0IFwic29tZVByb3BcIiAncHJvcGVydHknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIxICdhJ1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCIxXCIgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWzBdLnByb3BcIlxuICAgICAgICBpbmMgcmdzLCAzICddJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJbIGYgXVwiXG4gICAgICAgIGluYyByZ3MsIDIgJ2YnICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsgZiAsIGYgXVwiXG4gICAgICAgIGluYyByZ3MsIDIgJ2YnICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsuLi4yXVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy4nICdwdW5jdCByYW5nZSdcbiAgICAgICAgaW5jIHJncywgMyAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCA0ICcuJyAncHVuY3QgcmFuZ2UnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsgLTEgLi4gXVwiXG4gICAgICAgIGluYyByZ3MsIDYgJy4nICdwdW5jdCByYW5nZSdcbiAgICAgICAgaW5jIHJncywgNyAnLicgJ3B1bmN0IHJhbmdlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbMS4ubl1cIlxuICAgICAgICBpbmMgcmdzLCAzICcuJyAncHVuY3QgcmFuZ2UnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCByYW5nZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWyAuLi4uIF1cIlxuICAgICAgICBpbmMgcmdzLCAzICcuJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAnLicgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA2ICcuJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAZiBbMV1cIlxuICAgICAgICBpbmMgcmdzLCAwIFwiQFwiICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBmID0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJAXCIgJ3B1bmN0IHRoaXMnXG4gICAgICAgIGluYyByZ3MsIDEgXCJmXCIgJ3RleHQgdGhpcydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBoZWlnaHQvMiArIEBoZWlnaHQvNlwiXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICAgICAgJ3B1bmN0IHRoaXMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2hlaWdodCcgJ3RleHQgdGhpcydcbiAgICAgICAgaW5jIHJncywgOCBcIjJcIiAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiAgICBpdCAnY29mZmVlIGZ1bmN0aW9uJyAtPlxuXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm9iai5wcm9wLmNhbGwgMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ29iaicgJ29iaidcbiAgICAgICAgaW5jIHJncywgNCAncHJvcCcgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCA5ICdjYWxsJyAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImRvbGF0ZXIgPT5cIlxuICAgICAgICBpbmMgcmdzLCA4ICc9JyAncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgaW5jIHJncywgOSAnPicgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZG9sYXRlciAtPlwiXG4gICAgICAgIGluYyByZ3MsIDggJy0nICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA5ICc+JyAncHVuY3QgZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBhIEBiICdjJ1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAxICdhJyAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgaW5jIHJncywgMyAnQCcgJ3B1bmN0IGZ1bmN0aW9uIGNhbGwnXG4gICAgICAgIGluYyByZ3MsIDQgJ2InICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQGEgMyBAYiAnNSdcIlxuICAgICAgICBpbmMgcmdzLCAwICdAJyAncHVuY3QgZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgaW5jIHJncywgMSAnYScgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmIDFcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiZmZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgJ2EnXCJcbiAgICAgICAgaW5jIHJncywgMCBcImZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmICdiJ1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmZmYgLTFcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiZmZmZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgWzFdXCJcbiAgICAgICAgaW5jIHJncywgMCBcImZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmZmZmIHsxfVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZmZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKythXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICs0XCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAtNFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicG9zPSAoaXRlbSwgcCkgLT4gXCJcbiAgICAgICAgaW5jIHJncywgMCBcInBvc1wiICdmdW5jdGlvbidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgIT0gZmFsc2VcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICs9IDFcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgLT0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKj0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgLz0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSA/IGZhbHNlXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSA8IDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpID4gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKyAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAtIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICogM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgLyAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAlIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpID0gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgPT0gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGl0ICdjb2ZmZWUgbWV0aG9kJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIGE6ID0+XCJcbiAgICAgICAgaW5jIHJncywgMSBcImFcIiAnbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiOlwiICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQgXCI9XCIgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUgXCI+XCIgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgYTogLT5cIlxuICAgICAgICBpbmMgcmdzLCAxIFwiYVwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCBcIi1cIiAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAncHVuY3QgZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm10aGQ6ICAoYXJnKSAgICA9PiBAbWVtYmVyIG1lbWFyZ1wiXG4gICAgICAgIGluYyByZ3MsIDAgICdtdGhkJyAnbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0ICAnOicgICAgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMTYgJz0nICAgICdwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCAxNyAnPicgICAgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAbXRoZDogKGFyZykgLT5cIlxuICAgICAgICBpbmMgcmdzLCAwICdAJyAgICAncHVuY3QgbWV0aG9kIGNsYXNzJ1xuICAgICAgICBpbmMgcmdzLCAxICdtdGhkJyAnbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdrb2ZmZWUnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdrb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgQDogLT5cIlxuICAgICAgICBpbmMgcmdzLCAxIFwiQFwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCBcIi1cIiAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAncHVuY3QgZnVuY3Rpb24gaGVhZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgQDotPmFcIlxuICAgICAgICBpbmMgcmdzLCAxIFwiQFwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMyBcIi1cIiAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNCBcIj5cIiAncHVuY3QgZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIuKWuGlmIOKWuHRoZW4g4pa4ZWxpZiDilrhlbHNlXCJcbiAgICAgICAgaW5jIHJncywgMCAgXCLilrhcIiAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMSAgXCJpZlwiICAgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDQgIFwi4pa4XCIgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDUgIFwidGhlblwiICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxMCBcIuKWuFwiICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxMSBcImVsaWZcIiAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTYgXCLilrhcIiAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTcgXCJlbHNlXCIgJ21ldGEnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiWzEgJ3gnIGE6MSBjOmRdXCJcbiAgICAgICAgaW5jIHJncywgMSAgXCIxXCIgICAnbnVtYmVyJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcInhcIiAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA3ICBcImFcIiAgICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMTEgXCJjXCIgICAnZGljdGlvbmFyeSBrZXknXG5cbiAgICAjICAgICAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgICAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ2pzJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnanMnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJvYmoucHJvcC5jYWxsKDEpO1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ29iaicgJ29iaidcbiAgICAgICAgaW5jIHJncywgNCAncHJvcCcgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCA5ICdjYWxsJyAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZ1bmMgPSBmdW5jdGlvbigpIHtcIlxuICAgICAgICBpbmMgcmdzLCAwICdmdW5jJyAnZnVuY3Rpb24nXG4gICAgICAgIGluYyByZ3MsIDcgJ2Z1bmN0aW9uJyAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm9iai52YWx1ZSA9IG9iai5hbm90aGVyLnZhbHVlXCJcbiAgICAgICAgaW5jIHJncywgMCAgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcInZhbHVlXCIgICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTIgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxNiBcImFub3RoZXJcIidwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMjQgXCJ2YWx1ZVwiICAncHJvcGVydHknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhKDIpO1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2EnICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTpcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiL1wiICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCAxIFwiL1wiICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCAyIFwiI1wiICdjb21tZW50J1xuICAgICAgXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ2pzb24nIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdqc29uJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXCJcInsgXCJBIFpcIjogMSB9XCJcIlwiXG4gICAgICAgIGluYyByZ3MsIDIgJ1wiJyAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgaW5jIHJncywgMyAnQScgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCA1ICdaJyAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIGluYyByZ3MsIDYgJ1wiJyAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgaW5jIHJncywgNyAnOicgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiYVwiOiBcImh0dHA6Ly9kb21haW4uY29tXCInXG4gICAgICAgIGluYyByZ3MsIDYgJ2h0dHAnICd1cmwgcHJvdG9jb2wnXG4gICAgICAgIGluYyByZ3MsIDEwICc6JyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCAxMSAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgMTIgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDEzICdkb21haW4nICd1cmwgZG9tYWluJ1xuICAgICAgICBpbmMgcmdzLCAxOSAnLicgJ3B1bmN0IHVybCB0bGQnXG4gICAgICAgIGluYyByZ3MsIDIwICdjb20nICd1cmwgdGxkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCJodHRwOi8vZG9tYWluLmNvbS9kaXIvcGFnZS5odG1sXCInXG4gICAgICAgIGluYyByZ3MsIDEgJ2h0dHAnICd1cmwgcHJvdG9jb2wnXG4gICAgICAgIGluYyByZ3MsIDUgJzonICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDcgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDggJ2RvbWFpbicgJ3VybCBkb21haW4nXG4gICAgICAgIGluYyByZ3MsIDE0ICcuJyAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgaW5jIHJncywgMTUgJ2NvbScgJ3VybCB0bGQnXG4gICAgICAgIGluYyByZ3MsIDE4ICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCJmaWxlLmNvZmZlZVwiJ1xuICAgICAgICBpbmMgcmdzLCAxICdmaWxlJyAnY29mZmVlIGZpbGUnXG4gICAgICAgIGluYyByZ3MsIDUgJy4nICdwdW5jdCBjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDYgJ2NvZmZlZScgJ2NvZmZlZSBleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIi9zb21lL3BhdGhcIidcbiAgICAgICAgaW5jIHJncywgMiAnc29tZScgICAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICAgICAgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgNyAncGF0aCcgICAndGV4dCBmaWxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwXCInXG4gICAgICAgIGluYyByZ3MsIDAgJ1wiJyAgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDEgICcvJyAgICAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyICAnc29tZScgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNiAnLicgICdwdW5jdCB0eHQnXG4gICAgICAgIGluYyByZ3MsIDIwICc6JyAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDIzICdcIicgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIuL25vZGVfbW9kdWxlcy8uYmluL21vY2hhXCInXG4gICAgICAgIGluYyByZ3MsIDEgJy4nICd0ZXh0IGRpcicgIyB3aHkgaXMgdGhpcyB0ZXh0IGFuZCBub3QgcHVuY3Q/XG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDMgJ25vZGVfbW9kdWxlcycgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNSAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMTYgJy4nICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgMTcgJ2JpbicgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyMCAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMjEgJ21vY2hhJyAndGV4dCBmaWxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCI2Ni43MC4wXCInXG4gICAgICAgIGluYyByZ3MsIDEgXCI2NlwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDQgXCI3MFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDYgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDcgXCIwXCIgICdzZW12ZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIl4wLjcuMVwiJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiXlwiICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDIgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNCBcIjdcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiMVwiICdzZW12ZXInXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIl4xLjAuMC1hbHBoYS4xMlwiJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiMVwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDQgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNiBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBpdCAncmVnZXhwJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicj0vYS9cIlxuICAgICAgICBpbmMgcmdzLCAyICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAzICdhJyAgICAgICAndGV4dCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDQgJy8nICAgICAgICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvKGF8Lip8XFxzXFxkXFx3XFxTXFxXJHxeXFxzKykvXCJcbiAgICAgICAgaW5jIHJncywgMCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMiAnYScgICAgICAgJ3RleHQgcmVnZXhwJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi9eI2luY2x1ZGUvXCJcbiAgICAgICAgaW5jIHJncywgMCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMiBcIiNcIiAgICAgICAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiaW5jbHVkZVwiICd0ZXh0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvXFxcXCdoZWxsb1xcXFwnLyBcIlxuICAgICAgICBpbmMgcmdzLCAwICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAxIFwiXFxcXFwiICAgICAgJ3B1bmN0IGVzY2FwZSByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDIgXCInXCIgICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMyBcImhlbGxvXCIgICAndGV4dCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiBhIC9iIC0gYy9naVwiXG4gICAgICAgIGluYyByZ3MsIDQgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDUgJ2InICAgICAgICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMTAgJy8nICAgICAgJ3B1bmN0IHJlZ2V4cCBlbmQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ3PWwuc3BsaXQgL1tcXFxcc1xcXFwvXS8gOyBibGFcIlxuICAgICAgICBpbmMgcmdzLCAxMCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMTQgJ1xcXFwnICAgICAgJ3B1bmN0IGVzY2FwZSByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDE3ICcvJyAgICAgICAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgaW5jIHJncywgMTkgJzsnICAgICAgICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImEgPSAxIC8gMlwiXG4gICAgICAgIGluYyByZ3MsIDYgJy8nLCAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDggJzInLCAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIigxKzEpIC8gMlwiXG4gICAgICAgIGluYyByZ3MsIDYgJy8nLCAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDggJzInLCAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbMTBdIC8gMlwiXG4gICAgICAgIGluYyByZ3MsIDYgJy8nLCAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDggJzInLCAnbnVtYmVyJ1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3RyaXBsZSByZWdleHAnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvLy9hLy8vLGJcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiYVwiICd0ZXh0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDQgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDUgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDggXCJiXCIgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiLy8vXFxuYVxcbi8vL1wiXG4gICAgICAgIGluYyBkc3NbMF0sIDAgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDIgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDAgXCJhXCIgJ3RleHQgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMCBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMSBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMiBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCJcIlwiXG4gICAgICAgICAgICAvLy9cbiAgICAgICAgICAgICAgICAoW1xcXFxcXFxcP10pICMgY29tbWVudFxuICAgICAgICAgICAgLy8vLCBhXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaW5jIGRzc1swXSwgMCAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAxICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDIgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgNCAgXCIoXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCA2ICBcIlxcXFxcIiAncHVuY3QgZXNjYXBlIHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDEyIFwiI1wiICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTQgXCJjb21tZW50XCIgJ2NvbW1lbnQnXG4gICAgICAgIGluYyBkc3NbMl0sIDAgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMSAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAyICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDUgIFwiYVwiICAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCJcIlwiXG4gICAgICAgICAgICBhcnIgPSBbIC8vL2FcXCN7Yn0vLy9cbiAgICAgICAgICAgICAgICAgICAga2V5OiAndmFsdWUnXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaW5jIGRzc1sxXSwgOCAna2V5JywgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdubyByZWdleHAnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdhIC8gYiAtIGMgLyBkJyBcbiAgICAgICAgbnV0IHJncywgMiAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ2YgYS9iLCBjL2QnXG4gICAgICAgIG51dCByZ3MsIDMgJy8nICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJtID0gJy8nXCJcbiAgICAgICAgbnV0IHJncywgNSAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJtIGEsICcvJycvJ1wiXG4gICAgICAgIG51dCByZ3MsIDYgJy8nICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJcIlwiXFxcIm0gPSAnLydcXFwiXCJcIlwiXG4gICAgICAgIG51dCByZ3MsIDYgJy8nICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJzID0gJy9zb21lXFxcXHBhdGgvZmlsZS50eHQ6MTAnXCJcbiAgICAgICAgbnV0IHJncywgNSAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgbnV0IHJncywgOSAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm51bSAvPSAxMFwiXG4gICAgICAgIG51dCByZ3MsIDQgJy8nICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBudXQgcmdzLCA3ICcxMCcgJ3RleHQgcmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNCAvIDIgLyAxXCJcbiAgICAgICAgaW5jIHJncywgMiAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA2ICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0LzIvMVwiXG4gICAgICAgIGluYyByZ3MsIDEgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMyAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNC8gMiAvIDFcIlxuICAgICAgICBpbmMgcmdzLCAxICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQgLzIgLyAxXCJcbiAgICAgICAgaW5jIHJncywgMiAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0IC8gMi8gMVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNCAvIDIgLzFcIlxuICAgICAgICBpbmMgcmdzLCAyICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQgLzIvIDFcIlxuICAgICAgICBpbmMgcmdzLCAyICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDQgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaXQgJ21kJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnbWQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIqKmJvbGQqKlwiXG4gICAgICAgIGluYyByZ3MsIDAgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDEgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDIgJ2JvbGQnICAgJ3RleHQgYm9sZCdcbiAgICAgICAgaW5jIHJncywgNiAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgNyAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiwqKmIqKixcIlxuICAgICAgICBpbmMgcmdzLCAxICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCAzICdiJyAgICAgICd0ZXh0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDQgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIippdCBsaWMqXCJcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxICdpdCcgICAgICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNCAnbGljJyAgICAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDcgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIippdGFsaWMqXCJcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxICdpdGFsaWMnICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNyAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIqYGl0YWxpYyBjb2RlYCpcIlxuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2AnICAgICAgJ3B1bmN0IGl0YWxpYyBjb2RlJ1xuICAgICAgICBpbmMgcmdzLCAyICdpdGFsaWMnICd0ZXh0IGl0YWxpYyBjb2RlJ1xuICAgICAgICBpbmMgcmdzLCA5ICdjb2RlJyAgICd0ZXh0IGl0YWxpYyBjb2RlJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnKicgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpdCdzIGdvb2RcIlxuICAgICAgICBpbmMgcmdzLCAwICdpdCcgICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAyIFwiJ1wiICAgICAgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAzICdzJyAgICAgICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgaXMgZW1wdHkgaW4gdGhlblwiXG4gICAgICAgIGluYyByZ3MsIDAgICdpZicgICAgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDMgICdpcycgICAgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDYgICdlbXB0eScgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDEyICdpbicgICAgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDE1ICd0aGVuJyAgJ3RleHQnXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIuKWuGRvY1xcbiAgICBpZiBpcyBlbXB0eSBpbiB0aGVuXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgNCAgJ2lmJyAgICAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgNyAgJ2lzJyAgICAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTAgICdlbXB0eScgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDE2ICdpbicgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDE5ICd0aGVuJyAgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ3RleHQgZmlsZXMuIGJsYSdcbiAgICAgICAgaW5jIHJncywgMCwgJ3RleHQnICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAxMCwgJy4nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnLi5ibGEnXG4gICAgICAgIGluYyByZ3MsIDAsICcuJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDEsICcuJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2BgYGNvZmZlZXNjcmlwdCdcbiAgICAgICAgaW5jIHJncywgMCAnYCcgJ3B1bmN0IGNvZGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAzICdjb2ZmZWVzY3JpcHQnICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi0gbGlcIlxuICAgICAgICBpbmMgcmdzLCAwICctJyAgJ3B1bmN0IGxpMSBtYXJrZXInXG4gICAgICAgIGluYyByZ3MsIDIgJ2xpJyAndGV4dCBsaTEnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgIC0gKipib2xkKipcIlxuICAgICAgICBpbmMgcmdzLCA0ICctJyAgICAncHVuY3QgbGkyIG1hcmtlcidcbiAgICAgICAgaW5jIHJncywgOCAnYm9sZCcgJ3RleHQgbGkyIGJvbGQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgICAgICAgIC0gKipib2xkKipcIlxuICAgICAgICBpbmMgcmdzLCA4ICctJyAgICAncHVuY3QgbGkzIG1hcmtlcidcbiAgICAgICAgaW5jIHJncywgMTIgJ2JvbGQnICd0ZXh0IGxpMyBib2xkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiAgICAgICAgKiAqKmJvbGQqKlwiXG4gICAgICAgIGluYyByZ3MsIDggJyonICAgICdwdW5jdCBsaTMgbWFya2VyJ1xuICAgICAgICBpbmMgcmdzLCAxMiAnYm9sZCcgJ3RleHQgbGkzIGJvbGQnXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIlwiXCJcbiAgICAgICAgICAgIC0gbGkxXG4gICAgICAgICAgICB0ZXh0XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBpbmMgZHNzWzBdLCAwICAnLScgICAgJ3B1bmN0IGxpMSBtYXJrZXInXG4gICAgICAgIGluYyBkc3NbMV0sIDAgICd0ZXh0JyAndGV4dCdcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiXCJcIlxuICAgICAgICAgICAgIyBoMVxuICAgICAgICAgICAgIyMgaDJcbiAgICAgICAgICAgICMjIyBoM1xuICAgICAgICAgICAgIyMjIyBoNFxuICAgICAgICAgICAgIyMjIyMgaDVcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGluYyBkc3NbMF0sIDAgIFwiI1wiICAgICdwdW5jdCBoMSdcbiAgICAgICAgaW5jIGRzc1swXSwgMiAgXCJoMVwiICAgJ3RleHQgaDEnXG4gICAgICAgIGluYyBkc3NbMV0sIDAgIFwiI1wiICAgICdwdW5jdCBoMidcbiAgICAgICAgaW5jIGRzc1sxXSwgMyAgXCJoMlwiICAgJ3RleHQgaDInXG4gICAgICAgIGluYyBkc3NbMl0sIDAgIFwiI1wiICAgICdwdW5jdCBoMydcbiAgICAgICAgaW5jIGRzc1syXSwgNCAgXCJoM1wiICAgJ3RleHQgaDMnXG4gICAgICAgIGluYyBkc3NbM10sIDAgIFwiI1wiICAgICdwdW5jdCBoNCdcbiAgICAgICAgaW5jIGRzc1szXSwgNSAgXCJoNFwiICAgJ3RleHQgaDQnXG4gICAgICAgIGluYyBkc3NbNF0sIDAgIFwiI1wiICAgICdwdW5jdCBoNSdcbiAgICAgICAgaW5jIGRzc1s0XSwgNiAgXCJoNVwiICAgJ3RleHQgaDUnXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIlwiXCJcbiAgICAgICAgICAgIGBgYGpzXG4gICAgICAgICAgICBgYGBcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGluYyBkc3NbMV0sIDAgJ2AnICdwdW5jdCBjb2RlIHRyaXBsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgMCAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICBcbiAgICBpdCAnaHRtbCcgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2h0bWwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI8L2Rpdj5cIiBcbiAgICAgICAgaW5jIHJncywgMCBcIjxcIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMSBcIi9cIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMiBcImRpdlwiICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAgICAncHVuY3Qga2V5d29yZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI8ZGl2PlwiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiPFwiICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiZGl2XCIgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiPlwiICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgIFxuICAgIFxuICAgIGl0ICdjcHAnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjcHAnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjaW5jbHVkZVwiICAgICAgXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgICAgICAgICdwdW5jdCBkZWZpbmUnXG4gICAgICAgIGluYyByZ3MsIDEgXCJpbmNsdWRlXCIgICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2lmXCIgICAgICAgICAgICBcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICAgICAgJ3B1bmN0IGRlZmluZSdcbiAgICAgICAgaW5jIHJncywgMSBcImlmXCIgICAgICAgJ2RlZmluZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjICBpZlwiICAgICAgICAgICAgXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgICAgICAgICdwdW5jdCBkZWZpbmUnXG4gICAgICAgIGluYyByZ3MsIDMgXCJpZlwiICAgICAgICdkZWZpbmUnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgKHRydWUpIHt9IGVsc2Uge31cIiAgICBcbiAgICAgICAgaW5jIHJncywgMCBcImlmXCIgICAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDQgXCJ0cnVlXCIgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxMyBcImVsc2VcIiAna2V5d29yZCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIxLjBmXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjFcIiAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMSBcIi5cIiAgJ3B1bmN0IG51bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMiBcIjBmXCIgJ251bWJlciBmbG9hdCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIwLjAwMDBmXCJcbiAgICAgICAgaW5jIHJncywgMiBcIjAwMDBmXCIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzaCcgLT5cblxuICAgICAgICBsYW5nICdzaCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImRpci9wYXRoL3dpdGgvZGFzaGVzL2ZpbGUudHh0XCJcbiAgICAgICAgaW5jIHJncywgMCAnZGlyJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDQgJ3BhdGgnICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgOSAnd2l0aCcgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnZGFzaGVzJyAndGV4dCBkaXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJwcmcgLS1hcmcxIC1hcmcyXCJcbiAgICAgICAgaW5jIHJncywgNCAnLScgJ3B1bmN0IGFyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCA1ICctJyAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDYgJ2FyZzEnICdhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgMTEgJy0nICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgMTIgJ2FyZzInICdhcmd1bWVudCdcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnbG9nJyAtPlxuXG4gICAgICAgIGxhbmcgJ2xvZydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImh0dHA6Ly9kb21haW4uY29tXCJcbiAgICAgICAgaW5jIHJncywgMCAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgaW5jIHJncywgNCAnOicgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNyAnZG9tYWluJyAndXJsIGRvbWFpbidcbiAgICAgICAgaW5jIHJncywgMTMgJy4nICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnY29tJyAndXJsIHRsZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZpbGUuY29mZmVlXCJcbiAgICAgICAgaW5jIHJncywgMCAnZmlsZScgJ2NvZmZlZSBmaWxlJ1xuICAgICAgICBpbmMgcmdzLCA0ICcuJyAncHVuY3QgY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA1ICdjb2ZmZWUnICdjb2ZmZWUgZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi9zb21lL3BhdGhcIlxuICAgICAgICBpbmMgcmdzLCAxICdzb21lJyAgICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNSAnLycgICAgICAncHVuY3QgZGlyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImtleTogdmFsdWVcIlxuICAgICAgICBpbmMgcmdzLCAwICdrZXknICAgICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMyAnOicgICAgICAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4jIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuIyMjXG5cbmRlc2NyaWJlICdwYXJzZScgLT5cbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaXQgJ2NvbW1lbnQnIC0+XG4gICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICBwYXJzZShcIiMjXCIpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50JyB0dXJkOlwiIyNcIn0gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgXG4gICAgICAgIHBhcnNlKFwiLCNhXCIpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiLFwiIHZhbHVlOidwdW5jdCcgdHVyZDogXCIsI1wifSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgbGVuZ3RoOjEgbWF0Y2g6XCJhXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdmdW5jdGlvbicgLT5cbiAgICBcbiAgICAgICAgcGFyc2UoJy0+Jykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgIHBhcnNlKCc9PicpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICBwYXJzZSgnZj0tPjEnKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6NSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonZicgdmFsdWU6J2Z1bmN0aW9uJ30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24nICAgICAgdHVyZDonPS0+JyB9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6Jy0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDozIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ21pbmltYWwnIC0+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBwYXJzZSgnMScpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6JzEnIHZhbHVlOidudW1iZXInfSBdXVxuICAgICAgICBwYXJzZSgnYScpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOid0ZXh0J30gXV1cbiAgICAgICAgcGFyc2UoJy4nKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QnfSBdXVxuICAgIFxuICAgICAgICBwYXJzZSgnMS5hJykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QgcHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoyICBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3Byb3BlcnR5J30gXG4gICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHBhcnNlKCcrK2EnKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOicrJyB2YWx1ZToncHVuY3QnIHR1cmQ6JysrJ30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjEgbWF0Y2g6JysnIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgIGxlbmd0aDoxIG1hdGNoOidhJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBwYXJzZShcIuKWuGRvYyAnaGVsbG8nXCIpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxMiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDon4pa4JyAgICAgdmFsdWU6J3B1bmN0IG1ldGEnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjMgbWF0Y2g6J2RvYycgICB2YWx1ZTonbWV0YSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDo1ICBsZW5ndGg6MSBtYXRjaDpcIidcIiAgICAgdmFsdWU6J3B1bmN0IHN0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NiAgbGVuZ3RoOjUgbWF0Y2g6XCJoZWxsb1wiIHZhbHVlOidzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjExIGxlbmd0aDoxIG1hdGNoOlwiJ1wiICAgICB2YWx1ZToncHVuY3Qgc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3NwYWNlJyAtPlxuICAgIFxuICAgICAgICBiID0gcGFyc2UgXCJ4XCJcbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAwXG4gICAgXG4gICAgICAgIGIgPSBwYXJzZSBcIiB4eFwiXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgMVxuICAgICAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiICAgIHh4eFwiXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgIFxuICAgICAgICBiID0gcGFyc2UgXCIgICAgeCAxICAsIFwiXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgICAgICBiWzBdLmNodW5rc1sxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDZcbiAgICAgICAgYlswXS5jaHVua3NbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA5XG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdzd2l0Y2hlcycgLT5cbiAgICAgICAgXG4gICAgICAgIGIgPSBwYXJzZSBcIlwiXCJcbiAgICAgICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgICBcbiAgICAgICAgICAgICAgICB5XG4gICAgICAgICAgICBpZiAxIHRoZW4gZmFsc2VcIlwiXCJcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIGIgPSBwYXJzZSBcIlwiXCJcbiAgICAgICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgXG4gICAgICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgICAgIHlcbiAgICAgICAgICAgIDFcIlwiXCJcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgXG4gICAgICAgIGIgPSBwYXJzZSBcIlwiXCIgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbycgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdCAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIDErMSAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAg4pa4ZG9jICdhZ2FpbicgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzb21lICoqZG9jcyoqICAgICBcbiAgICAgICAgICAgICAgICBgYGAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHkgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAxXCJcIlwiXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzddLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls4XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9vYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgXG4gICAgICAgIGIgPSBwYXJzZSBcIlwiXCJcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgICAgICAgICAgMSsxO1xuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICBcIlwiXCIsICdtZCdcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdqcydcbiAgICAgICAgICAgICJdfQ==
//# sourceURL=../coffee/test.coffee