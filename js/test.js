// koffee 1.12.0

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

inc = function(rgs, start, match, clss) {
    return rgs.map(function(r) {
        return _.pick(r, ['start', 'match', 'clss']);
    }).should.deep.include({
        start: start,
        match: match,
        clss: clss
    });
};

nut = function(rgs, start, match, clss) {
    return rgs.map(function(r) {
        return _.pick(r, ['start', 'match', 'clss']);
    }).should.not.deep.include({
        start: start,
        match: match,
        clss: clss
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
        inc(rgs, 0, 'text', 'text');
        rgs = ranges("###", '.coffee');
        return inc(rgs, 0, "#", 'punct comment triple');
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
        inc(rgs, 24, '🐌', 'text');
        rgs = ranges("'🔧' bla:1");
        inc(rgs, 6, 'bla', 'dictionary key');
        rgs = ranges("icon: '🔧' bla:1");
        return inc(rgs, 12, 'bla', 'dictionary key');
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
            results.push(rng.should.not.have.property('clss', 'comment'));
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
        inc(rgs, 5, "0", 'semver');
        rgs = ranges(">=6.7.9");
        inc(rgs, 0, ">", 'punct semver');
        inc(rgs, 1, "=", 'punct semver');
        inc(rgs, 2, "6", 'semver');
        inc(rgs, 3, ".", 'punct semver');
        inc(rgs, 4, "7", 'semver');
        inc(rgs, 5, ".", 'punct semver');
        return inc(rgs, 6, "9", 'semver');
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
        inc(rgs, 13, '/', 'string double');
        lang('txt');
        rgs = ranges("it's all we'll ever need. we'd never do that!");
        inc(rgs, 2, "'", 'punct');
        inc(rgs, 3, "s", 'text');
        inc(rgs, 11, "'", 'punct');
        return inc(rgs, 28, "'", 'punct');
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
    it('koffee constructor', function() {
        var rgs;
        lang('coffee');
        rgs = ranges(" @: ->");
        inc(rgs, 1, "@", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "-", 'punct function tail');
        inc(rgs, 5, ">", 'punct function head');
        rgs = ranges(" @:->a");
        inc(rgs, 1, "@", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 3, "-", 'punct function tail');
        return inc(rgs, 4, ">", 'punct function head');
    });
    it('koffee meta if then else', function() {
        var rgs;
        lang('coffee');
        rgs = ranges("▸if ▸then ▸elif ▸else");
        inc(rgs, 0, "▸", 'punct meta');
        inc(rgs, 1, "if", 'meta');
        inc(rgs, 4, "▸", 'punct meta');
        inc(rgs, 5, "then", 'meta');
        inc(rgs, 10, "▸", 'punct meta');
        inc(rgs, 11, "elif", 'meta');
        inc(rgs, 16, "▸", 'punct meta');
        return inc(rgs, 17, "else", 'meta');
    });
    it('koffee no comma', function() {
        var rgs;
        lang('coffee');
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
        inc(rgs, 6, "0", 'semver');
        rgs = ranges('">=6.7.8"');
        inc(rgs, 1, ">", 'punct semver');
        inc(rgs, 2, "=", 'punct semver');
        inc(rgs, 3, "6", 'semver');
        inc(rgs, 4, ".", 'punct semver');
        inc(rgs, 5, "7", 'semver');
        inc(rgs, 6, ".", 'punct semver');
        return inc(rgs, 7, "8", 'semver');
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
        inc(rgs, 19, ';', 'punct minor');
        rgs = ranges("a = 1 / 2");
        inc(rgs, 6, '/', 'punct');
        inc(rgs, 8, '2', 'number');
        rgs = ranges("(1+1) / 2");
        inc(rgs, 6, '/', 'punct');
        inc(rgs, 8, '2', 'number');
        rgs = ranges("a[10] / 2");
        inc(rgs, 6, '/', 'punct');
        inc(rgs, 8, '2', 'number');
        rgs = ranges("if / aa /.test s");
        inc(rgs, 3, '/', 'punct regexp start');
        inc(rgs, 8, '/', 'punct regexp end');
        inc(rgs, 9, '.', 'punct property');
        inc(rgs, 10, 'test', 'function call');
        inc(rgs, 15, 's', 'text');
        rgs = ranges("if / 😡 /.test s");
        inc(rgs, 3, '/', 'punct regexp start');
        inc(rgs, 8, '/', 'punct regexp end');
        inc(rgs, 9, '.', 'punct property');
        inc(rgs, 10, 'test', 'function call');
        return inc(rgs, 15, 's', 'text');
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
        inc(dss[1], 4, "(", 'punct minor regexp triple');
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
        rgs = ranges("1.0");
        inc(rgs, 0, "1", 'number float');
        inc(rgs, 1, ".", 'punct number float');
        inc(rgs, 2, "0", 'number float');
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
    it('css', function() {
        var rgs;
        lang('css');
        rgs = ranges("0.5");
        inc(rgs, 0, "0", 'number float');
        inc(rgs, 1, ".", 'punct number float');
        return inc(rgs, 2, "5", 'number float');
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
        inc(rgs, 2, "0000f", 'number float');
        rgs = ranges("obj.value = obj.another.value;");
        inc(rgs, 0, "obj", 'obj');
        inc(rgs, 4, "value", 'property');
        inc(rgs, 12, "obj", 'obj');
        inc(rgs, 16, "another", 'property');
        inc(rgs, 24, "value", 'property');
        rgs = ranges("Cast<targ>");
        inc(rgs, 4, '<', 'punct template');
        inc(rgs, 5, 'targ', 'template');
        inc(rgs, 9, '>', 'punct template');
        rgs = ranges("TMap<FGrid, FRoute>");
        inc(rgs, 0, 'TMap', 'keyword type');
        inc(rgs, 4, '<', 'punct template');
        inc(rgs, 5, 'FGrid', 'template');
        inc(rgs, 10, ',', 'punct template');
        inc(rgs, 12, 'FRoute', 'template');
        return inc(rgs, 18, '>', 'punct template');
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
        inc(rgs, 12, 'arg2', 'argument');
        rgs = ranges("cd ~");
        inc(rgs, 3, '~', 'text dir');
        rgs = ranges("~/home");
        inc(rgs, 0, '~', 'text dir');
        inc(rgs, 1, '/', 'punct dir');
        return inc(rgs, 2, 'home', 'text file');
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
                        clss: 'punct comment',
                        turd: "##"
                    }, {
                        start: 1,
                        length: 1,
                        match: "#",
                        clss: 'comment'
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
                        clss: 'punct minor',
                        turd: ",#"
                    }, {
                        start: 1,
                        length: 1,
                        match: "#",
                        clss: 'punct comment'
                    }, {
                        start: 2,
                        length: 1,
                        match: "a",
                        clss: 'comment'
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
                        clss: 'punct function tail',
                        turd: '->'
                    }, {
                        start: 1,
                        length: 1,
                        match: '>',
                        clss: 'punct function head'
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
                        clss: 'punct function bound tail',
                        turd: '=>'
                    }, {
                        start: 1,
                        length: 1,
                        match: '>',
                        clss: 'punct function bound head'
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
                        clss: 'function'
                    }, {
                        start: 1,
                        length: 1,
                        match: '=',
                        clss: 'punct function',
                        turd: '=->'
                    }, {
                        start: 2,
                        length: 1,
                        match: '-',
                        clss: 'punct function tail',
                        turd: '->'
                    }, {
                        start: 3,
                        length: 1,
                        match: '>',
                        clss: 'punct function head'
                    }, {
                        start: 4,
                        length: 1,
                        match: '1',
                        clss: 'number'
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
                        clss: 'number'
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
                        clss: 'text'
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
                        clss: 'punct'
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
                        clss: 'number'
                    }, {
                        start: 1,
                        length: 1,
                        match: '.',
                        clss: 'punct property'
                    }, {
                        start: 2,
                        length: 1,
                        match: 'a',
                        clss: 'property'
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
                        clss: 'punct',
                        turd: '++'
                    }, {
                        start: 1,
                        length: 1,
                        match: '+',
                        clss: 'punct'
                    }, {
                        start: 2,
                        length: 1,
                        match: 'a',
                        clss: 'text'
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
                        clss: 'punct meta'
                    }, {
                        start: 1,
                        length: 3,
                        match: 'doc',
                        clss: 'meta'
                    }, {
                        start: 5,
                        length: 1,
                        match: "'",
                        clss: 'punct string single'
                    }, {
                        start: 6,
                        length: 5,
                        match: "hello",
                        clss: 'string single'
                    }, {
                        start: 11,
                        length: 1,
                        match: "'",
                        clss: 'punct string single'
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRlc3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLElBQUEsR0FBTyxPQUFBLENBQVEsS0FBUjs7QUFDUCxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0FBQ04sR0FBRyxDQUFDLElBQUosQ0FBQTs7QUFDQSxDQUFBLEdBQUksR0FBRyxDQUFDOztBQUVSLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixJQUFwQjtXQUE2QixHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxJQUFGLENBQU8sQ0FBUCxFQUFVLENBQUMsT0FBRCxFQUFRLE9BQVIsRUFBZSxNQUFmLENBQVY7SUFBUCxDQUFSLENBQWlELENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUE5RCxDQUEwRTtRQUFBLEtBQUEsRUFBTSxLQUFOO1FBQWEsS0FBQSxFQUFNLEtBQW5CO1FBQTBCLElBQUEsRUFBSyxJQUEvQjtLQUExRTtBQUE3Qjs7QUFDTixHQUFBLEdBQU0sU0FBQyxHQUFELEVBQU0sS0FBTixFQUFhLEtBQWIsRUFBb0IsSUFBcEI7V0FBNkIsR0FBRyxDQUFDLEdBQUosQ0FBUSxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsSUFBRixDQUFPLENBQVAsRUFBVSxDQUFDLE9BQUQsRUFBUSxPQUFSLEVBQWUsTUFBZixDQUFWO0lBQVAsQ0FBUixDQUFpRCxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQWxFLENBQTBFO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsSUFBQSxFQUFLLElBQS9CO0tBQTFFO0FBQTdCOztBQUVOLEdBQUEsR0FBTTs7QUFDTixJQUFBLEdBQVUsU0FBQyxDQUFEO1dBQU8sR0FBQSxHQUFNO0FBQWI7O0FB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RUEsQ0FBQSxHQUFJLEtBQUEsQ0FBTSx3QkFBTjtRQUlKLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsUUFBbkM7UUFFQSxDQUFBLEdBQUksS0FBQSxDQUFNLDZEQUFOLEVBT0ssSUFQTDtRQVFKLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsUUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO2VBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7SUFuRVUsQ0FBZDtBQTNHYSxDQUFqQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyMjXG5cbmtsb3IgPSByZXF1aXJlICcuLi8nXG5reGsgPSByZXF1aXJlICdreGsnXG5reGsuY2hhaSgpXG5fID0ga3hrLl9cblxuaW5jID0gKHJncywgc3RhcnQsIG1hdGNoLCBjbHNzKSAtPiByZ3MubWFwKChyKSAtPiBfLnBpY2sgciwgWydzdGFydCcnbWF0Y2gnJ2Nsc3MnXSApLnNob3VsZC5kZWVwLmluY2x1ZGUgICAgIHN0YXJ0OnN0YXJ0LCBtYXRjaDptYXRjaCwgY2xzczpjbHNzXG5udXQgPSAocmdzLCBzdGFydCwgbWF0Y2gsIGNsc3MpIC0+IHJncy5tYXAoKHIpIC0+IF8ucGljayByLCBbJ3N0YXJ0JydtYXRjaCcnY2xzcyddICkuc2hvdWxkLm5vdC5kZWVwLmluY2x1ZGUgc3RhcnQ6c3RhcnQsIG1hdGNoOm1hdGNoLCBjbHNzOmNsc3NcblxuZXh0ID0gJ2NvZmZlZSdcbmxhbmcgICAgPSAobCkgLT4gZXh0ID0gbFxucmFuZ2VzICA9IChzLGUpIC0+IGtsb3IucmFuZ2VzICBzLCBlID8gZXh0XG5wYXJzZSAgID0gKGMsZSkgLT4ga2xvci5wYXJzZSAgIGMuc3BsaXQoJ1xcbicpLCBlID8gZXh0XG5kaXNzZWN0ID0gKGMsZSkgLT4ga2xvci5kaXNzZWN0IGMuc3BsaXQoJ1xcbicpLCBlID8gZXh0XG4gIFxuIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4jIyNcblxuZGVzY3JpYmUgJ3JhbmdlcycgLT5cbiAgICAgICAgICBcbiAgICBpdCAnZmFsbGJhY2snIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ3RleHQnICd1bmtub3duJ1xuICAgICAgICBpbmMgcmdzLCAwICd0ZXh0JyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ3RleHQnICdmaXNoJ1xuICAgICAgICBpbmMgcmdzLCAwICd0ZXh0JyAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMjI1wiICcuY29mZmVlJyBcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAndW5pY29kZScgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIvCfjIhcIlxuICAgICAgICBpbmMgcmdzLCAwICfwn4yIJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCLwn4yI8J+MsVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ/CfjIgnICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAyICfwn4yxJyAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIvCfmYJsb2zwn5iAXCJcbiAgICAgICAgaW5jIHJncywgMCAn8J+ZgicgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIgJ2xvbCcgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDUgJ/CfmIAnICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYeKenGIgYeKWrOKWtmJcIlxuICAgICAgICAjIGxvZyByZ3NcbiAgICAgICAgaW5jIHJncywgMSAn4p6cJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDUgJ+KWrCcgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA2ICfilrYnICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIvCfkIDwn5CB8J+QgvCfkIPwn5CE8J+QhfCfkIbwn5CH8J+QiPCfkInwn5CK8J+Qi/CfkIzwn5CN8J+QjvCfkI/wn5CQ8J+QkfCfkJLwn5CT8J+QlPCfkJXwn5CW8J+Ql/CfkJjwn5CZ8J+QmvCfkJvwn5Cc8J+QnfCfkJ7wn5Cf8J+QoPCfkKHwn5Ci8J+Qo/CfkKTwn5ClXCJcbiAgICAgICAgaW5jIHJncywgMCAn8J+QgCcgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDI0ICfwn5CMJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIn8J+UpycgYmxhOjFcIlxuICAgICAgICBpbmMgcmdzLCA2ICdibGEnICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImljb246ICfwn5SnJyBibGE6MVwiXG4gICAgICAgIGluYyByZ3MsIDEyICdibGEnICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ2NvbW1lbnRzJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaGVsbG8gIyB3b3JsZFwiXG4gICAgICAgIGluYyByZ3MsIDYgXCIjXCIgICAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDggXCJ3b3JsZFwiICdjb21tZW50J1xuXG4gICAgICAgIGxhbmcgJ25vb24nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiAgICMgYmxhIGJsdWJcIlxuICAgICAgICBpbmMgcmdzLCAzIFwiI1wiICAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgNSBcImJsYVwiICAgJ2NvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDkgXCJibHViXCIgICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiheXFxzKiNcXHMqKSguKikkXCJcbiAgICAgICAgZm9yIHJuZyBpbiByZ3NcbiAgICAgICAgICAgIHJuZy5zaG91bGQubm90LmhhdmUucHJvcGVydHkgJ2Nsc3MnICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgaXQgJ3RyaXBsZSBjb21tZW50JyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIyMjYSMjI1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMiBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDMgXCJhXCIgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNSBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIjIyNcXG5hXFxuIyMjXCJcbiAgICAgICAgaW5jIGRzc1swXSwgMCBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMCBcImFcIiAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDAgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAxIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMiBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG5cbiAgICAgICAgbGFuZyAnc3R5bCdcbiAgICAgICAgXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIvKlxcbmFcXG4qL1wiIFxuICAgICAgICBpbmMgZHNzWzBdLCAwIFwiL1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSBcIipcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDAgXCJhXCIgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAwIFwiKlwiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMSBcIi9cIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIFxuICAgIGl0ICdjb21tZW50IGhlYWRlcicgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMgMCAwMCAwMDAwXCIgXG4gICAgICAgIGluYyByZ3MsIDAgIFwiI1wiICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCAyICBcIjBcIiAgICAnY29tbWVudCBoZWFkZXInXG4gICAgICAgIGluYyByZ3MsIDQgIFwiMDBcIiAgICdjb21tZW50IGhlYWRlcidcbiAgICAgICAgaW5jIHJncywgNyAgXCIwMDAwXCIgJ2NvbW1lbnQgaGVhZGVyJ1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIjIyNcXG4gMCAwMCAwIFxcbiMjI1wiXG4gICAgICAgIGluYyBkc3NbMV0sIDEgXCIwXCIgJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMgMCAqIDAuMlwiXG4gICAgICAgIGluYyByZ3MsIDIgJzAnICdjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA2ICcwJyAnY29tbWVudCdcbiAgICAgICAgXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIjIyNcXG4gMCAxIDAgXFxuIyMjXCJcbiAgICAgICAgaW5jIGRzc1sxXSwgMSBcIjBcIiAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIFxuICAgICAgICBsYW5nICdzdHlsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLy8gMDAwXCJcbiAgICAgICAgaW5jIHJncywgMyAgXCIwMDBcIiAgICAnY29tbWVudCBoZWFkZXInXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIi8qXFxuIDAgMCAwIFxcbiovXCJcbiAgICAgICAgaW5jIGRzc1sxXSwgMSBcIjBcIiAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ251bWJlcnMnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImEgNjY3MFwiXG4gICAgICAgIGluYyByZ3MsIDIgXCI2NjcwXCIgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIweDY2N0FDXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjB4NjY3QUNcIiAnbnVtYmVyIGhleCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI2Ni43MDBcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiNjZcIiAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMiBcIi5cIiAgICdwdW5jdCBudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDMgXCI3MDBcIiAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjc3LjgwMCAtMTAwXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjc3XCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDggXCIxMDBcIiAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIig4LjksMTAwLjIpXCJcbiAgICAgICAgaW5jIHJncywgMyBcIjlcIiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA5IFwiMlwiICdudW1iZXIgZmxvYXQnXG4gICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NlbXZlcicgLT4gICAgXG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI2Ni43MC4wXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjY2XCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMiBcIi5cIiAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgMyBcIjcwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSBcIi5cIiAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgNiBcIjBcIiAgJ3NlbXZlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJeMC43LjFcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiXlwiICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDEgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMyBcIjdcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiMVwiICdzZW12ZXInXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXjEuMC4wLWFscGhhLjEyXCJcbiAgICAgICAgaW5jIHJncywgMSBcIjFcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiMFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgXG4gICAgICAgICMgbGFuZyAnbm9vbidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIj49Ni43LjlcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiPlwiICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDEgXCI9XCIgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgMiBcIjZcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiLlwiICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDQgXCI3XCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSBcIi5cIiAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiOVwiICdzZW12ZXInXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnc3RyaW5ncycgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlwiXCJhPVwiXFxcXFwiRVxcXFxcIlwiIFwiXCJcIlxuICAgICAgICBpbmMgcmdzLCAyICdcIicgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDQgJ1wiJyAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNSAnRScgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDggJ1wiJyAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cIlxcJ1hcXCdcIidcbiAgICAgICAgaW5jIHJncywgMiAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMgXCInXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNCBcIlhcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA2ICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XFwnXCJYXCJcXCcnICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDIgXCInXCIgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgMyAnXCInICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDQgJ1gnICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCInXCIgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XCIgIFxcJ1hcXCcgIFkgIFwiICdcbiAgICAgICAgaW5jIHJncywgMiAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDUgXCInXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNiBcIlhcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA3IFwiJ1wiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDEzICdcIicgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cIlwiO2I9XCIgXCI7Yz1cIlhcIidcbiAgICAgICAgZm9yIGkgaW4gWzIgMyA3IDkgMTMgMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCAnXCInLCAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTQgJ1gnICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhPScnO2I9JyAnO2M9J1knXCJcbiAgICAgICAgZm9yIGkgaW4gWzIgMyA3IDkgMTMgMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCBcIidcIiwgJ3B1bmN0IHN0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDE0ICdZJyAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnJydcInMgPSAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCdcIicnJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiJ1wiICAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTcgXCJmaWxlXCIgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDIxIFwiLlwiICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyMiBcInR4dFwiICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjYgXCIxMFwiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDI4IFwiJ1wiICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyOSAnXCInICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICcnJ3doZW4gJ1wiXCJcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSB0cmlwbGVcXCcnJydcbiAgICAgICAgaW5jIHJncywgNiAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNyAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgOCAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIicnJ3doZW5cXFxcJycnJ1wiXG4gICAgICAgIGluYyByZ3MsIDMgIFwid2hlblwiICAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDggIFwiJ1wiICAgICAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDExIFwiJ1wiICAgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIFxuICAgICAgICAjIGludGVycG9sYXRpb25cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIje3h4eH1cIidcbiAgICAgICAgaW5jIHJncywgMCAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDEgXCIjXCIgICAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDIgXCJ7XCIgICAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDMgJ3h4eCcgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDYgXCJ9XCIgICAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gZW5kJ1xuICAgICAgICBpbmMgcmdzLCA3ICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiI3s2NjZ9XCInXG4gICAgICAgIGluYyByZ3MsIDAgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAzICc2NjYnICdudW1iZXInXG4gICAgICAgIGluYyByZ3MsIDcgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCJcIlwiI3s3Nzd9XCJcIlwiJ1xuICAgICAgICBpbmMgcmdzLCAwICAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAxICAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAyICAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAzICAnIycgICAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDQgICd7JyAgICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBzdGFydCdcbiAgICAgICAgaW5jIHJncywgNSAgJzc3NycgJ251bWJlcidcbiAgICAgICAgaW5jIHJncywgOCAgJ30nICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgaW5jIHJncywgOSAgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMTAgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMTEgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlIHRyaXBsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIje19fZGlybmFtZX0vLi4vXCInXG4gICAgICAgIGluYyByZ3MsIDEyLCAnfScgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgaW5jIHJncywgMTMsICcvJyAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ3R4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIml0J3MgYWxsIHdlJ2xsIGV2ZXIgbmVlZC4gd2UnZCBuZXZlciBkbyB0aGF0IVwiXG4gICAgICAgIGluYyByZ3MsIDIgIFwiJ1wiICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMyAgXCJzXCIgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDExIFwiJ1wiICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMjggXCInXCIgJ3B1bmN0J1xuXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnbm9vbicgLT5cbiAgICAgICAgICAgIFxuICAgICAgICBsYW5nICdub29uJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgIHByb3BlcnR5ICB2YWx1ZVwiXG4gICAgICAgIGluYyByZ3MsIDQgJ3Byb3BlcnR5JyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDE0ICd2YWx1ZScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidG9wXCJcbiAgICAgICAgaW5jIHJncywgMCAndG9wJyAgJ29iaidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ0b3AgIHByb3BcIlxuICAgICAgICBpbmMgcmdzLCAwICd0b3AnICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA1ICdwcm9wJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ2ZXJzaW9uICBeMC4xLjJcIlxuICAgICAgICBpbmMgcmdzLCAwICd2ZXJzaW9uJyAgJ29iaidcbiAgICAgICAgaW5jIHJncywgOSAnXicgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgMTAgJzAnICdzZW12ZXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJzb21lLXBhY2thZ2UtbmFtZSAgMVwiXG4gICAgICAgIGluYyByZ3MsIDAgICdzb21lJyAgICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDUgICdwYWNrYWdlJyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEzICduYW1lJyAgICAncHJvcGVydHknXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwic29tZS1wYWNrYWdlLW5hbWUgIF4xLjIuM1wiXG4gICAgICAgIGluYyByZ3MsIDAgICdzb21lJyAgICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDUgICdwYWNrYWdlJyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEzICduYW1lJyAgICAncHJvcGVydHknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ0b3AgIHByb3AgIHZhbHVlXCJcbiAgICAgICAgaW5jIHJncywgMCAgJ3RvcCcgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA1ICAncHJvcCcgICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTEgJ3ZhbHVlJyAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImh0dHA6Ly9kb21haW4uY29tXCJcbiAgICAgICAgaW5jIHJncywgMCAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgaW5jIHJncywgNCAnOicgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNyAnZG9tYWluJyAndXJsIGRvbWFpbidcbiAgICAgICAgaW5jIHJncywgMTMgJy4nICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnY29tJyAndXJsIHRsZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJodHRwOi8vZG9tYWluLmNvbS9kaXIvcGFnZS5odG1sXCJcbiAgICAgICAgaW5jIHJncywgMCAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgaW5jIHJncywgNCAnOicgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNyAnZG9tYWluJyAndXJsIGRvbWFpbidcbiAgICAgICAgaW5jIHJncywgMTMgJy4nICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnY29tJyAndXJsIHRsZCdcbiAgICAgICAgaW5jIHJncywgMTcgJy8nICdwdW5jdCBkaXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmaWxlLmNvZmZlZVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2ZpbGUnICdjb2ZmZWUgZmlsZSdcbiAgICAgICAgaW5jIHJncywgNCAnLicgJ3B1bmN0IGNvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNSAnY29mZmVlJyAnY29mZmVlIGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvc29tZS9wYXRoXCJcbiAgICAgICAgaW5jIHJncywgMSAnc29tZScgICAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICAgICAgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgNiAncGF0aCcgICAndGV4dCBmaWxlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICcvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwJ1xuICAgICAgICBpbmMgcmdzLCAwICAnLycgICAgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMSAgJ3NvbWUnICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNSAgJ1xcXFwnICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE1ICcuJyAgJ3B1bmN0IHR4dCdcbiAgICAgICAgaW5jIHJncywgMTkgJzonICAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgICAgdGVzdCAgLi9ub2RlX21vZHVsZXMvLmJpbi9tb2NoYVwiXG4gICAgICAgIGluYyByZ3MsIDQgJ3Rlc3QnICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTAgJy4nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDExICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxMiAnbm9kZV9tb2R1bGVzJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDI0ICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyNSAnLicgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMjYgJ2JpbicgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyOSAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMzAgJ21vY2hhJyAndGV4dCBmaWxlJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnY29mZmVlJyAtPlxuXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInV0aWwgPSByZXF1aXJlICd1dGlsJ1wiXG4gICAgICAgIGluYyByZ3MsIDcgJ3JlcXVpcmUnICdyZXF1aXJlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiY2xhc3MgTWFjcm8gZXh0ZW5kcyBDb21tYW5kXCJcbiAgICAgICAgaW5jIHJncywgMCAgJ2NsYXNzJyAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA2ICAnTWFjcm8nICAgJ2NsYXNzJ1xuICAgICAgICBpbmMgcmdzLCAxMiAnZXh0ZW5kcycgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDIwICdDb21tYW5kJyAnY2xhc3MnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJleGlzdD8ucHJvcFwiXG4gICAgICAgIGluYyByZ3MsIDcgJ3Byb3AnICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhIGFuZCBiXCJcbiAgICAgICAgaW5jIHJncywgMCBcImFcIiAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiBcImFuZFwiICdrZXl3b3JkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIGEgdGhlbiBiXCJcbiAgICAgICAgaW5jIHJncywgMCBcImlmXCIgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDMgXCJhXCIgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDUgXCJ0aGVuXCIgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEwIFwiYlwiICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInN3aXRjaCBhXCJcbiAgICAgICAgaW5jIHJncywgMCBcInN3aXRjaFwiICdrZXl3b3JkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIGE6IGJcIlxuICAgICAgICBpbmMgcmdzLCAxIFwiYVwiICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm9iai52YWx1ZSA9IG9iai5hbm90aGVyLnZhbHVlXCJcbiAgICAgICAgaW5jIHJncywgMCAgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcInZhbHVlXCIgICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTIgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxNiBcImFub3RoZXJcIidwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMjQgXCJ2YWx1ZVwiICAncHJvcGVydHknXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgc29tZU9iamVjdC5zb21lUHJvcFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJpZlwiICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzIFwic29tZU9iamVjdFwiICdvYmonXG4gICAgICAgIGluYyByZ3MsIDEzIFwiLlwiICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTQgXCJzb21lUHJvcFwiICdwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjEgJ2EnXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjFcIiAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbMF0ucHJvcFwiXG4gICAgICAgIGluYyByZ3MsIDMgJ10nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsgZiBdXCJcbiAgICAgICAgaW5jIHJncywgMiAnZicgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiWyBmICwgZiBdXCJcbiAgICAgICAgaW5jIHJncywgMiAnZicgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWy4uLjJdXCJcbiAgICAgICAgaW5jIHJncywgMiAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCAzICcuJyAncHVuY3QgcmFuZ2UnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCByYW5nZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWyAtMSAuLiBdXCJcbiAgICAgICAgaW5jIHJncywgNiAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCA3ICcuJyAncHVuY3QgcmFuZ2UnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsxLi5uXVwiXG4gICAgICAgIGluYyByZ3MsIDMgJy4nICdwdW5jdCByYW5nZSdcbiAgICAgICAgaW5jIHJncywgNCAnLicgJ3B1bmN0IHJhbmdlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbIC4uLi4gXVwiXG4gICAgICAgIGluYyByZ3MsIDMgJy4nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNCAnLicgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICcuJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDYgJy4nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBmIFsxXVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJAXCIgJ3B1bmN0IGZ1bmN0aW9uIGNhbGwnXG4gICAgICAgIGluYyByZ3MsIDEgXCJmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQGYgPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCBcIkBcIiAncHVuY3QgdGhpcydcbiAgICAgICAgaW5jIHJncywgMSBcImZcIiAndGV4dCB0aGlzJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQGhlaWdodC8yICsgQGhlaWdodC82XCJcbiAgICAgICAgaW5jIHJncywgMCAnQCcgICAgICAncHVuY3QgdGhpcydcbiAgICAgICAgaW5jIHJncywgMSAnaGVpZ2h0JyAndGV4dCB0aGlzJ1xuICAgICAgICBpbmMgcmdzLCA4IFwiMlwiICdudW1iZXInXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuICAgIGl0ICdjb2ZmZWUgZnVuY3Rpb24nIC0+XG5cbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwib2JqLnByb3AuY2FsbCAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnb2JqJyAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0ICdwcm9wJyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDkgJ2NhbGwnICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZG9sYXRlciA9PlwiXG4gICAgICAgIGluYyByZ3MsIDggJz0nICdwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA5ICc+JyAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJkb2xhdGVyIC0+XCJcbiAgICAgICAgaW5jIHJncywgOCAnLScgJ3B1bmN0IGZ1bmN0aW9uIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDkgJz4nICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQGEgQGIgJ2MnXCJcbiAgICAgICAgaW5jIHJncywgMCAnQCcgJ3B1bmN0IGZ1bmN0aW9uIGNhbGwnXG4gICAgICAgIGluYyByZ3MsIDEgJ2EnICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAzICdAJyAncHVuY3QgZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgaW5jIHJncywgNCAnYicgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAYSAzIEBiICc1J1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAxICdhJyAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmZmYgMVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiAnYSdcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmYgJ2InXCJcbiAgICAgICAgaW5jIHJncywgMCBcImZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmZiAtMVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiBbMV1cIlxuICAgICAgICBpbmMgcmdzLCAwIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmZmYgezF9XCJcbiAgICAgICAgaW5jIHJncywgMCBcImZmZmZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSArK2FcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKzRcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpIC00XCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJwb3M9IChpdGVtLCBwKSAtPiBcIlxuICAgICAgICBpbmMgcmdzLCAwIFwicG9zXCIgJ2Z1bmN0aW9uJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAhPSBmYWxzZVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKz0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAtPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAqPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAvPSAxXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpID8gZmFsc2VcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpIDwgM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgPiAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSArIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpIC0gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKiAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAvIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICUgM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgPSAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSA9PSAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaXQgJ2NvZmZlZSBtZXRob2QnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgYTogPT5cIlxuICAgICAgICBpbmMgcmdzLCAxIFwiYVwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCBcIj1cIiAncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBhOiAtPlwiXG4gICAgICAgIGluYyByZ3MsIDEgXCJhXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiLVwiICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibXRoZDogIChhcmcpICAgID0+IEBtZW1iZXIgbWVtYXJnXCJcbiAgICAgICAgaW5jIHJncywgMCAgJ210aGQnICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQgICc6JyAgICAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAxNiAnPScgICAgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDE3ICc+JyAgICAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBtdGhkOiAoYXJnKSAtPlwiXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICAgICdwdW5jdCBtZXRob2QgY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEgJ210aGQnICdtZXRob2QgY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2tvZmZlZSBjb25zdHJ1Y3RvcicgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBAOiAtPlwiXG4gICAgICAgIGluYyByZ3MsIDEgXCJAXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiLVwiICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBAOi0+YVwiXG4gICAgICAgIGluYyByZ3MsIDEgXCJAXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiLVwiICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuXG4gICAgaXQgJ2tvZmZlZSBtZXRhIGlmIHRoZW4gZWxzZScgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIuKWuGlmIOKWuHRoZW4g4pa4ZWxpZiDilrhlbHNlXCJcbiAgICAgICAgaW5jIHJncywgMCAgXCLilrhcIiAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMSAgXCJpZlwiICAgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDQgIFwi4pa4XCIgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDUgIFwidGhlblwiICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxMCBcIuKWuFwiICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxMSBcImVsaWZcIiAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTYgXCLilrhcIiAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTcgXCJlbHNlXCIgJ21ldGEnXG5cbiAgICBpdCAna29mZmVlIG5vIGNvbW1hJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiWzEgJ3gnIGE6MSBjOmRdXCJcbiAgICAgICAgaW5jIHJncywgMSAgXCIxXCIgICAnbnVtYmVyJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcInhcIiAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA3ICBcImFcIiAgICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMTEgXCJjXCIgICAnZGljdGlvbmFyeSBrZXknXG5cbiAgICAjICAgICAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgICAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ2pzJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnanMnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJvYmoucHJvcC5jYWxsKDEpO1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ29iaicgJ29iaidcbiAgICAgICAgaW5jIHJncywgNCAncHJvcCcgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCA5ICdjYWxsJyAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZ1bmMgPSBmdW5jdGlvbigpIHtcIlxuICAgICAgICBpbmMgcmdzLCAwICdmdW5jJyAnZnVuY3Rpb24nXG4gICAgICAgIGluYyByZ3MsIDcgJ2Z1bmN0aW9uJyAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm9iai52YWx1ZSA9IG9iai5hbm90aGVyLnZhbHVlXCJcbiAgICAgICAgaW5jIHJncywgMCAgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcInZhbHVlXCIgICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTIgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxNiBcImFub3RoZXJcIidwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMjQgXCJ2YWx1ZVwiICAncHJvcGVydHknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhKDIpO1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2EnICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTpcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiL1wiICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCAxIFwiL1wiICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCAyIFwiI1wiICdjb21tZW50J1xuICAgICAgXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ2pzb24nIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdqc29uJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXCJcInsgXCJBIFpcIjogMSB9XCJcIlwiXG4gICAgICAgIGluYyByZ3MsIDIgJ1wiJyAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgaW5jIHJncywgMyAnQScgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCA1ICdaJyAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIGluYyByZ3MsIDYgJ1wiJyAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgaW5jIHJncywgNyAnOicgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiYVwiOiBcImh0dHA6Ly9kb21haW4uY29tXCInXG4gICAgICAgIGluYyByZ3MsIDYgJ2h0dHAnICd1cmwgcHJvdG9jb2wnXG4gICAgICAgIGluYyByZ3MsIDEwICc6JyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCAxMSAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgMTIgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDEzICdkb21haW4nICd1cmwgZG9tYWluJ1xuICAgICAgICBpbmMgcmdzLCAxOSAnLicgJ3B1bmN0IHVybCB0bGQnXG4gICAgICAgIGluYyByZ3MsIDIwICdjb20nICd1cmwgdGxkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCJodHRwOi8vZG9tYWluLmNvbS9kaXIvcGFnZS5odG1sXCInXG4gICAgICAgIGluYyByZ3MsIDEgJ2h0dHAnICd1cmwgcHJvdG9jb2wnXG4gICAgICAgIGluYyByZ3MsIDUgJzonICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDcgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDggJ2RvbWFpbicgJ3VybCBkb21haW4nXG4gICAgICAgIGluYyByZ3MsIDE0ICcuJyAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgaW5jIHJncywgMTUgJ2NvbScgJ3VybCB0bGQnXG4gICAgICAgIGluYyByZ3MsIDE4ICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCJmaWxlLmNvZmZlZVwiJ1xuICAgICAgICBpbmMgcmdzLCAxICdmaWxlJyAnY29mZmVlIGZpbGUnXG4gICAgICAgIGluYyByZ3MsIDUgJy4nICdwdW5jdCBjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDYgJ2NvZmZlZScgJ2NvZmZlZSBleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIi9zb21lL3BhdGhcIidcbiAgICAgICAgaW5jIHJncywgMiAnc29tZScgICAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICAgICAgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgNyAncGF0aCcgICAndGV4dCBmaWxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwXCInXG4gICAgICAgIGluYyByZ3MsIDAgJ1wiJyAgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDEgICcvJyAgICAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyICAnc29tZScgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNiAnLicgICdwdW5jdCB0eHQnXG4gICAgICAgIGluYyByZ3MsIDIwICc6JyAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDIzICdcIicgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIuL25vZGVfbW9kdWxlcy8uYmluL21vY2hhXCInXG4gICAgICAgIGluYyByZ3MsIDEgJy4nICd0ZXh0IGRpcicgIyB3aHkgaXMgdGhpcyB0ZXh0IGFuZCBub3QgcHVuY3Q/XG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDMgJ25vZGVfbW9kdWxlcycgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNSAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMTYgJy4nICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgMTcgJ2JpbicgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyMCAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMjEgJ21vY2hhJyAndGV4dCBmaWxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCI2Ni43MC4wXCInXG4gICAgICAgIGluYyByZ3MsIDEgXCI2NlwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDQgXCI3MFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDYgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDcgXCIwXCIgICdzZW12ZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIl4wLjcuMVwiJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiXlwiICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDIgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNCBcIjdcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiMVwiICdzZW12ZXInXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIl4xLjAuMC1hbHBoYS4xMlwiJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiMVwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDQgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNiBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIj49Ni43LjhcIidcbiAgICAgICAgaW5jIHJncywgMSBcIj5cIiAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiPVwiICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCI2XCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNCBcIi5cIiAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSBcIjdcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiLlwiICAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA3IFwiOFwiICAnc2VtdmVyJ1xuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgaXQgJ3JlZ2V4cCcgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInI9L2EvXCJcbiAgICAgICAgaW5jIHJncywgMiAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMyAnYScgICAgICAgJ3RleHQgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCA0ICcvJyAgICAgICAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLyhhfC4qfFxcc1xcZFxcd1xcU1xcVyR8XlxccyspL1wiXG4gICAgICAgIGluYyByZ3MsIDAgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDIgJ2EnICAgICAgICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvXiNpbmNsdWRlL1wiXG4gICAgICAgIGluYyByZ3MsIDAgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIjXCIgICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMyBcImluY2x1ZGVcIiAndGV4dCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL1xcXFwnaGVsbG9cXFxcJy8gXCJcbiAgICAgICAgaW5jIHJncywgMCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMSBcIlxcXFxcIiAgICAgICdwdW5jdCBlc2NhcGUgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiJ1wiICAgICAgICdwdW5jdCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDMgXCJoZWxsb1wiICAgJ3RleHQgcmVnZXhwJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgYSAvYiAtIGMvZ2lcIlxuICAgICAgICBpbmMgcmdzLCA0ICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCA1ICdiJyAgICAgICAndGV4dCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDEwICcvJyAgICAgICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidz1sLnNwbGl0IC9bXFxcXHNcXFxcL10vIDsgYmxhXCJcbiAgICAgICAgaW5jIHJncywgMTAgJy8nICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMTQgJ1xcXFwnICAgICAncHVuY3QgZXNjYXBlIHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMTcgJy8nICAgICAgJ3B1bmN0IHJlZ2V4cCBlbmQnXG4gICAgICAgIGluYyByZ3MsIDE5ICc7JyAgICAgICdwdW5jdCBtaW5vcidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImEgPSAxIC8gMlwiXG4gICAgICAgIGluYyByZ3MsIDYgJy8nLCAgICAgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA4ICcyJywgICAgICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKDErMSkgLyAyXCJcbiAgICAgICAgaW5jIHJncywgNiAnLycsICAgICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDggJzInLCAgICAgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWzEwXSAvIDJcIlxuICAgICAgICBpbmMgcmdzLCA2ICcvJywgICAgICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgOCAnMicsICAgICAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIC8gYWEgLy50ZXN0IHNcIlxuICAgICAgICBpbmMgcmdzLCAzICcvJyAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDggJy8nICAgICAgJ3B1bmN0IHJlZ2V4cCBlbmQnXG4gICAgICAgIGluYyByZ3MsIDkgJy4nICAgICAgJ3B1bmN0IHByb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxMCAndGVzdCcgICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAxNSAncycgICAgICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgLyDwn5ihIC8udGVzdCBzXCJcbiAgICAgICAgaW5jIHJncywgMyAnLycgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCA4ICcvJyAgICAgICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICBpbmMgcmdzLCA5ICcuJyAgICAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTAgJ3Rlc3QnICAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgaW5jIHJncywgMTUgJ3MnICAgICAndGV4dCdcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICd0cmlwbGUgcmVnZXhwJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLy8vYS8vLyxiXCJcbiAgICAgICAgaW5jIHJncywgMCBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMSBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMiBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMyBcImFcIiAndGV4dCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA4IFwiYlwiICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIi8vL1xcbmFcXG4vLy9cIlxuICAgICAgICBpbmMgZHNzWzBdLCAwIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAxIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwIFwiYVwiICd0ZXh0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDAgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDIgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIFxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiXCJcIlxuICAgICAgICAgICAgLy8vXG4gICAgICAgICAgICAgICAgKFtcXFxcXFxcXD9dKSAjIGNvbW1lbnRcbiAgICAgICAgICAgIC8vLywgYVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGluYyBkc3NbMF0sIDAgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDQgIFwiKFwiICAncHVuY3QgbWlub3IgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgNiAgXCJcXFxcXCIgJ3B1bmN0IGVzY2FwZSByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAxMiBcIiNcIiAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyBkc3NbMV0sIDE0IFwiY29tbWVudFwiICdjb21tZW50J1xuICAgICAgICBpbmMgZHNzWzJdLCAwICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMiAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCA1ICBcImFcIiAgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiXCJcIlxuICAgICAgICAgICAgYXJyID0gWyAvLy9hXFwje2J9Ly8vXG4gICAgICAgICAgICAgICAgICAgIGtleTogJ3ZhbHVlJ1xuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGluYyBkc3NbMV0sIDggJ2tleScsICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBpdCAnbm8gcmVnZXhwJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYSAvIGIgLSBjIC8gZCcgXG4gICAgICAgIG51dCByZ3MsIDIgJy8nICdwdW5jdCByZWdleHAgc3RhcnQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdmIGEvYiwgYy9kJ1xuICAgICAgICBudXQgcmdzLCAzICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibSA9ICcvJ1wiXG4gICAgICAgIG51dCByZ3MsIDUgJy8nICdwdW5jdCByZWdleHAgc3RhcnQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibSBhLCAnLycnLydcIlxuICAgICAgICBudXQgcmdzLCA2ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXCJcIlxcXCJtID0gJy8nXFxcIlwiXCJcIlxuICAgICAgICBudXQgcmdzLCA2ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicyA9ICcvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwJ1wiXG4gICAgICAgIG51dCByZ3MsIDUgJy8nICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIG51dCByZ3MsIDkgJy8nICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJudW0gLz0gMTBcIlxuICAgICAgICBudXQgcmdzLCA0ICcvJyAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgbnV0IHJncywgNyAnMTAnICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQgLyAyIC8gMVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNC8yLzFcIlxuICAgICAgICBpbmMgcmdzLCAxICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDMgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQvIDIgLyAxXCJcbiAgICAgICAgaW5jIHJncywgMSAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0IC8yIC8gMVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNCAvIDIvIDFcIlxuICAgICAgICBpbmMgcmdzLCAyICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQgLyAyIC8xXCJcbiAgICAgICAgaW5jIHJncywgMiAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA2ICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0IC8yLyAxXCJcbiAgICAgICAgaW5jIHJncywgMiAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA0ICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGl0ICdtZCcgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ21kJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKipib2xkKipcIlxuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCAxICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCAyICdib2xkJyAgICd0ZXh0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDYgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDcgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIsKipiKiosXCJcbiAgICAgICAgaW5jIHJncywgMSAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMyAnYicgICAgICAndGV4dCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA0ICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIqaXQgbGljKlwiXG4gICAgICAgIGluYyByZ3MsIDAgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgMSAnaXQnICAgICAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDQgJ2xpYycgICAgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA3ICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIqaXRhbGljKlwiXG4gICAgICAgIGluYyByZ3MsIDAgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgMSAnaXRhbGljJyAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDcgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKmBpdGFsaWMgY29kZWAqXCJcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxICdgJyAgICAgICdwdW5jdCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgMiAnaXRhbGljJyAndGV4dCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgOSAnY29kZScgICAndGV4dCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgMTQgJyonICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaXQncyBnb29kXCJcbiAgICAgICAgaW5jIHJncywgMCAnaXQnICAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiBcIidcIiAgICAgICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMyAncycgICAgICAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIGlzIGVtcHR5IGluIHRoZW5cIlxuICAgICAgICBpbmMgcmdzLCAwICAnaWYnICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAzICAnaXMnICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA2ICAnZW1wdHknICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAxMiAnaW4nICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAxNSAndGhlbicgICd0ZXh0J1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCLilrhkb2NcXG4gICAgaWYgaXMgZW1wdHkgaW4gdGhlblwiICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMV0sIDQgICdpZicgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDcgICdpcycgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDEwICAnZW1wdHknICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCAxNiAnaW4nICAgICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCAxOSAndGhlbicgICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICd0ZXh0IGZpbGVzLiBibGEnXG4gICAgICAgIGluYyByZ3MsIDAsICd0ZXh0JyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTAsICcuJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJy4uYmxhJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnLicgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAxLCAnLicgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdgYGBjb2ZmZWVzY3JpcHQnXG4gICAgICAgIGluYyByZ3MsIDAgJ2AnICdwdW5jdCBjb2RlIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMyAnY29mZmVlc2NyaXB0JyAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCItIGxpXCJcbiAgICAgICAgaW5jIHJncywgMCAnLScgICdwdW5jdCBsaTEgbWFya2VyJ1xuICAgICAgICBpbmMgcmdzLCAyICdsaScgJ3RleHQgbGkxJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiAgICAtICoqYm9sZCoqXCJcbiAgICAgICAgaW5jIHJncywgNCAnLScgICAgJ3B1bmN0IGxpMiBtYXJrZXInXG4gICAgICAgIGluYyByZ3MsIDggJ2JvbGQnICd0ZXh0IGxpMiBib2xkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgICAgICAtICoqYm9sZCoqXCJcbiAgICAgICAgaW5jIHJncywgOCAnLScgICAgJ3B1bmN0IGxpMyBtYXJrZXInXG4gICAgICAgIGluYyByZ3MsIDEyICdib2xkJyAndGV4dCBsaTMgYm9sZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgICAgICAgICogKipib2xkKipcIlxuICAgICAgICBpbmMgcmdzLCA4ICcqJyAgICAncHVuY3QgbGkzIG1hcmtlcidcbiAgICAgICAgaW5jIHJncywgMTIgJ2JvbGQnICd0ZXh0IGxpMyBib2xkJ1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCJcIlwiXG4gICAgICAgICAgICAtIGxpMVxuICAgICAgICAgICAgdGV4dFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgaW5jIGRzc1swXSwgMCAgJy0nICAgICdwdW5jdCBsaTEgbWFya2VyJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwICAndGV4dCcgJ3RleHQnXG5cbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIlwiXCJcbiAgICAgICAgICAgICMgaDFcbiAgICAgICAgICAgICMjIGgyXG4gICAgICAgICAgICAjIyMgaDNcbiAgICAgICAgICAgICMjIyMgaDRcbiAgICAgICAgICAgICMjIyMjIGg1XG4gICAgICAgIFwiXCJcIlxuICAgICAgICBpbmMgZHNzWzBdLCAwICBcIiNcIiAgICAncHVuY3QgaDEnXG4gICAgICAgIGluYyBkc3NbMF0sIDIgIFwiaDFcIiAgICd0ZXh0IGgxJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwICBcIiNcIiAgICAncHVuY3QgaDInXG4gICAgICAgIGluYyBkc3NbMV0sIDMgIFwiaDJcIiAgICd0ZXh0IGgyJ1xuICAgICAgICBpbmMgZHNzWzJdLCAwICBcIiNcIiAgICAncHVuY3QgaDMnXG4gICAgICAgIGluYyBkc3NbMl0sIDQgIFwiaDNcIiAgICd0ZXh0IGgzJ1xuICAgICAgICBpbmMgZHNzWzNdLCAwICBcIiNcIiAgICAncHVuY3QgaDQnXG4gICAgICAgIGluYyBkc3NbM10sIDUgIFwiaDRcIiAgICd0ZXh0IGg0J1xuICAgICAgICBpbmMgZHNzWzRdLCAwICBcIiNcIiAgICAncHVuY3QgaDUnXG4gICAgICAgIGluYyBkc3NbNF0sIDYgIFwiaDVcIiAgICd0ZXh0IGg1J1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCJcIlwiXG4gICAgICAgICAgICBgYGBqc1xuICAgICAgICAgICAgYGBgXG4gICAgICAgIFwiXCJcIlxuICAgICAgICBpbmMgZHNzWzFdLCAwICdgJyAncHVuY3QgY29kZSB0cmlwbGUnXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgXG4gICAgaXQgJ2h0bWwnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdodG1sJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiPC9kaXY+XCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCI8XCIgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEgXCIvXCIgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDIgXCJkaXZcIiAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDUgXCI+XCIgICAgJ3B1bmN0IGtleXdvcmQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiPGRpdj5cIiBcbiAgICAgICAgaW5jIHJncywgMCBcIjxcIiAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMSBcImRpdlwiICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNCBcIj5cIiAgICAncHVuY3Qga2V5d29yZCdcblxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgICAwMDAgMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIDAwMCAgICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3N0eWwnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdzdHlsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMWVtXCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIxZW1cIiAgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIxZXhcIiBcbiAgICAgICAgaW5jIHJncywgMCBcIjFleFwiICAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjFweFwiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiMXB4XCIgICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMXNcIiBcbiAgICAgICAgaW5jIHJncywgMCBcIjFzXCIgICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMS4wXCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIxXCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDEgXCIuXCIgICdwdW5jdCBudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIwXCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIuY2xzc1wiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiLlwiICAgICAncHVuY3QgY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEgXCJjbHNzXCIgICdjbGFzcydcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjaWRcIiBcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICAncHVuY3QgZnVuY3Rpb24nXG4gICAgICAgIGluYyByZ3MsIDEgXCJpZFwiICAgJ2Z1bmN0aW9uJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiNpZC1mb28tYmFyXCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgICAgJ3B1bmN0IGZ1bmN0aW9uJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiaWRcIiAgICdmdW5jdGlvbidcbiAgICAgICAgaW5jIHJncywgMyBcIi1cIiAgICAncHVuY3QgZnVuY3Rpb24nXG4gICAgICAgIGluYyByZ3MsIDQgXCJmb29cIiAgJ2Z1bmN0aW9uJ1xuICAgICAgICBpbmMgcmdzLCA3IFwiLVwiICAgICdwdW5jdCBmdW5jdGlvbidcbiAgICAgICAgaW5jIHJncywgOCBcImJhclwiICAnZnVuY3Rpb24nXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLmNsc3MtZm9vLWJhclwiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiLlwiICAgICdwdW5jdCBjbGFzcydcbiAgICAgICAgaW5jIHJncywgMSBcImNsc3NcIiAnY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDUgXCItXCIgICAgJ3B1bmN0IGNsYXNzJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiZm9vXCIgICdjbGFzcydcbiAgICAgICAgaW5jIHJncywgOSBcIi1cIiAgICAncHVuY3QgY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEwIFwiYmFyXCIgICdjbGFzcydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiM2NjZcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgJ3B1bmN0IG51bWJlciBoZXgnXG4gICAgICAgIGluYyByZ3MsIDEgXCI2NjZcIiAnbnVtYmVyIGhleCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiNhYmNcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgJ3B1bmN0IG51bWJlciBoZXgnXG4gICAgICAgIGluYyByZ3MsIDEgXCJhYmNcIiAnbnVtYmVyIGhleCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiNmMGYwZjBcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICAgJ3B1bmN0IG51bWJlciBoZXgnXG4gICAgICAgIGluYyByZ3MsIDEgXCJmMGYwZjBcIiAnbnVtYmVyIGhleCdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgICAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdjc3MnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjc3MnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIwLjVcIiBcbiAgICAgICAgaW5jIHJncywgMCBcIjBcIiAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMSBcIi5cIiAgJ3B1bmN0IG51bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMiBcIjVcIiAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICBcbiAgICBcbiAgICBpdCAnY3BwJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY3BwJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2luY2x1ZGVcIiAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICAgICAgICdwdW5jdCBkZWZpbmUnXG4gICAgICAgIGluYyByZ3MsIDEgXCJpbmNsdWRlXCIgICAgJ2RlZmluZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjaWZcIiAgICAgICAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICAgICAgICdwdW5jdCBkZWZpbmUnXG4gICAgICAgIGluYyByZ3MsIDEgXCJpZlwiICAgICAgICAgJ2RlZmluZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjICBpZlwiICAgICAgICAgICAgXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgICAgICAgICAgJ3B1bmN0IGRlZmluZSdcbiAgICAgICAgaW5jIHJncywgMyBcImlmXCIgICAgICAgICAnZGVmaW5lJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmICh0cnVlKSB7fSBlbHNlIHt9XCIgICAgXG4gICAgICAgIGluYyByZ3MsIDAgXCJpZlwiICAgICAgICAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDQgXCJ0cnVlXCIgICAgICAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEzIFwiZWxzZVwiICAgICAgJ2tleXdvcmQnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMS4wZlwiXG4gICAgICAgIGluYyByZ3MsIDAgXCIxXCIgICAgICAgICAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMSBcIi5cIiAgICAgICAgICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAyIFwiMGZcIiAgICAgICAgICdudW1iZXIgZmxvYXQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMC4wMDAwZlwiXG4gICAgICAgIGluYyByZ3MsIDIgXCIwMDAwZlwiICAgICAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm9iai52YWx1ZSA9IG9iai5hbm90aGVyLnZhbHVlO1wiXG4gICAgICAgIGluYyByZ3MsIDAgIFwib2JqXCIgICAgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgNCAgXCJ2YWx1ZVwiICAgICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEyIFwib2JqXCIgICAgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgMTYgXCJhbm90aGVyXCIgICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDI0IFwidmFsdWVcIiAgICAgJ3Byb3BlcnR5J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQ2FzdDx0YXJnPlwiXG4gICAgICAgIGluYyByZ3MsIDQgJzwnICAgICAgICAgICdwdW5jdCB0ZW1wbGF0ZSdcbiAgICAgICAgaW5jIHJncywgNSAndGFyZycgICAgICAgJ3RlbXBsYXRlJ1xuICAgICAgICBpbmMgcmdzLCA5ICc+JyAgICAgICAgICAncHVuY3QgdGVtcGxhdGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJUTWFwPEZHcmlkLCBGUm91dGU+XCJcbiAgICAgICAgaW5jIHJncywgMCAnVE1hcCcgICAgICAgJ2tleXdvcmQgdHlwZSdcbiAgICAgICAgaW5jIHJncywgNCAnPCcgICAgICAgICAgJ3B1bmN0IHRlbXBsYXRlJ1xuICAgICAgICBpbmMgcmdzLCA1ICdGR3JpZCcgICAgICAndGVtcGxhdGUnXG4gICAgICAgIGluYyByZ3MsIDEwICcsJyAgICAgICAgICdwdW5jdCB0ZW1wbGF0ZSdcbiAgICAgICAgaW5jIHJncywgMTIgJ0ZSb3V0ZScgICAgJ3RlbXBsYXRlJ1xuICAgICAgICBpbmMgcmdzLCAxOCAnPicgICAgICAgICAncHVuY3QgdGVtcGxhdGUnXG4gICAgICAgIFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NoJyAtPlxuXG4gICAgICAgIGxhbmcgJ3NoJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZGlyL3BhdGgvd2l0aC9kYXNoZXMvZmlsZS50eHRcIlxuICAgICAgICBpbmMgcmdzLCAwICdkaXInICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNCAncGF0aCcgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA5ICd3aXRoJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE0ICdkYXNoZXMnICd0ZXh0IGRpcidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInByZyAtLWFyZzEgLWFyZzJcIlxuICAgICAgICBpbmMgcmdzLCA0ICctJyAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDUgJy0nICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgNiAnYXJnMScgJ2FyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCAxMSAnLScgJ3B1bmN0IGFyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCAxMiAnYXJnMicgJ2FyZ3VtZW50J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiY2QgflwiXG4gICAgICAgIGluYyByZ3MsIDMgJ34nICd0ZXh0IGRpcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ+L2hvbWVcIlxuICAgICAgICBpbmMgcmdzLCAwICd+JyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDEgJy8nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDIgJ2hvbWUnICd0ZXh0IGZpbGUnXG4gICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdsb2cnIC0+XG5cbiAgICAgICAgbGFuZyAnbG9nJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaHR0cDovL2RvbWFpbi5jb21cIlxuICAgICAgICBpbmMgcmdzLCAwICdodHRwJyAndXJsIHByb3RvY29sJ1xuICAgICAgICBpbmMgcmdzLCA0ICc6JyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCA2ICcvJyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCA3ICdkb21haW4nICd1cmwgZG9tYWluJ1xuICAgICAgICBpbmMgcmdzLCAxMyAnLicgJ3B1bmN0IHVybCB0bGQnXG4gICAgICAgIGluYyByZ3MsIDE0ICdjb20nICd1cmwgdGxkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmlsZS5jb2ZmZWVcIlxuICAgICAgICBpbmMgcmdzLCAwICdmaWxlJyAnY29mZmVlIGZpbGUnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCBjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDUgJ2NvZmZlZScgJ2NvZmZlZSBleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL3NvbWUvcGF0aFwiXG4gICAgICAgIGluYyByZ3MsIDEgJ3NvbWUnICAgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAgICAgICdwdW5jdCBkaXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwia2V5OiB2YWx1ZVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2tleScgICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCAzICc6JyAgICAgICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICBcbiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4wMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4jIyNcblxuZGVzY3JpYmUgJ3BhcnNlJyAtPlxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpdCAnY29tbWVudCcgLT5cbiAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHBhcnNlKFwiIyNcIikuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgY2xzczoncHVuY3QgY29tbWVudCcgdHVyZDpcIiMjXCJ9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDpcIiNcIiBjbHNzOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgXG4gICAgICAgIHBhcnNlKFwiLCNhXCIpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiLFwiIGNsc3M6J3B1bmN0IG1pbm9yJyB0dXJkOiBcIiwjXCJ9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDpcIiNcIiBjbHNzOidwdW5jdCBjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoyIGxlbmd0aDoxIG1hdGNoOlwiYVwiIGNsc3M6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdmdW5jdGlvbicgLT5cbiAgICBcbiAgICAgICAgcGFyc2UoJy0+Jykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy0nIGNsc3M6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6ICctPid9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDonPicgY2xzczoncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICBwYXJzZSgnPT4nKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonPScgY2xzczoncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic+JyBjbHNzOidwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgIHBhcnNlKCdmPS0+MScpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczo1IGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOidmJyBjbHNzOidmdW5jdGlvbid9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDonPScgY2xzczoncHVuY3QgZnVuY3Rpb24nICAgICAgdHVyZDonPS0+JyB9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDonLScgY2xzczoncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDonLT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjMgbGVuZ3RoOjEgbWF0Y2g6Jz4nIGNsc3M6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjQgbGVuZ3RoOjEgbWF0Y2g6JzEnIGNsc3M6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ21pbmltYWwnIC0+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBwYXJzZSgnMScpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6JzEnIGNsc3M6J251bWJlcid9IF1dXG4gICAgICAgIHBhcnNlKCdhJykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonYScgY2xzczondGV4dCd9IF1dXG4gICAgICAgIHBhcnNlKCcuJykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonLicgY2xzczoncHVuY3QnfSBdXVxuICAgIFxuICAgICAgICBwYXJzZSgnMS5hJykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDonMScgY2xzczonbnVtYmVyJ30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjEgbWF0Y2g6Jy4nIGNsc3M6J3B1bmN0IHByb3BlcnR5J30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiAgbGVuZ3RoOjEgbWF0Y2g6J2EnIGNsc3M6J3Byb3BlcnR5J30gXG4gICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHBhcnNlKCcrK2EnKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOicrJyBjbHNzOidwdW5jdCcgdHVyZDonKysnfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MSBtYXRjaDonKycgY2xzczoncHVuY3QnfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoyICBsZW5ndGg6MSBtYXRjaDonYScgY2xzczondGV4dCd9IFxuICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBwYXJzZShcIuKWuGRvYyAnaGVsbG8nXCIpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxMiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDon4pa4JyAgICAgY2xzczoncHVuY3QgbWV0YSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MyBtYXRjaDonZG9jJyAgIGNsc3M6J21ldGEnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NSAgbGVuZ3RoOjEgbWF0Y2g6XCInXCIgICAgIGNsc3M6J3B1bmN0IHN0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NiAgbGVuZ3RoOjUgbWF0Y2g6XCJoZWxsb1wiIGNsc3M6J3N0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MTEgbGVuZ3RoOjEgbWF0Y2g6XCInXCIgICAgIGNsc3M6J3B1bmN0IHN0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdzcGFjZScgLT5cbiAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwieFwiXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgMFxuICAgIFxuICAgICAgICBiID0gcGFyc2UgXCIgeHhcIlxuICAgICAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDFcbiAgICAgICAgXG4gICAgICAgIGIgPSBwYXJzZSBcIiAgICB4eHhcIlxuICAgICAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDRcbiAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiICAgIHggMSAgLCBcIlxuICAgICAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDRcbiAgICAgICAgYlswXS5jaHVua3NbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA2XG4gICAgICAgIGJbMF0uY2h1bmtzWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgOVxuICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwIDAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnc3dpdGNoZXMnIC0+XG4gICAgICAgIFxuICAgICAgICBiID0gcGFyc2UgXCJcIlwiXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIHggICAgXG4gICAgICAgICAgICAgICAgeVxuICAgICAgICAgICAgaWYgMSB0aGVuIGZhbHNlXCJcIlwiXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICBiID0gcGFyc2UgXCJcIlwiXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIHggIFxuICAgICAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgICAgICBgYGBcbiAgICAgICAgICAgICAgICB5XG4gICAgICAgICAgICAxXCJcIlwiXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIFxuICAgICAgICBiID0gcGFyc2UgXCJcIlwiICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIOKWuGRvYyAnaGVsbG8nICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHQgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAxKzEgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIOKWuGRvYyAnYWdhaW4nICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgc29tZSAqKmRvY3MqKiAgICAgXG4gICAgICAgICAgICAgICAgYGBgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB5ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgMVwiXCJcIlxuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls3XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbOF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIGIgPSBwYXJzZSBcIlwiXCJcbiAgICAgICAgICAgIOKWuGRvb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIHggIFxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIFxuICAgICAgICBiID0gcGFyc2UgXCJcIlwiXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMTtcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgXCJcIlwiLCAnbWQnXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnanMnXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../coffee/test.coffee