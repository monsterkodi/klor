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
        inc(rgs, 28, "'", 'punct');
        rgs = ranges("['s' 'll' 'd' 't']");
        inc(rgs, 1, "'", 'punct string single');
        inc(rgs, 2, "s", 'string single');
        inc(rgs, 3, "'", 'punct string single');
        inc(rgs, 5, "'", 'punct string single');
        return inc(rgs, 8, "'", 'punct string single');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInRlc3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLElBQUEsR0FBTyxPQUFBLENBQVEsS0FBUjs7QUFDUCxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0FBQ04sR0FBRyxDQUFDLElBQUosQ0FBQTs7QUFDQSxDQUFBLEdBQUksR0FBRyxDQUFDOztBQUVSLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixJQUFwQjtXQUE2QixHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDtlQUFPLENBQUMsQ0FBQyxJQUFGLENBQU8sQ0FBUCxFQUFVLENBQUMsT0FBRCxFQUFRLE9BQVIsRUFBZSxNQUFmLENBQVY7SUFBUCxDQUFSLENBQWlELENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUE5RCxDQUEwRTtRQUFBLEtBQUEsRUFBTSxLQUFOO1FBQWEsS0FBQSxFQUFNLEtBQW5CO1FBQTBCLElBQUEsRUFBSyxJQUEvQjtLQUExRTtBQUE3Qjs7QUFDTixHQUFBLEdBQU0sU0FBQyxHQUFELEVBQU0sS0FBTixFQUFhLEtBQWIsRUFBb0IsSUFBcEI7V0FBNkIsR0FBRyxDQUFDLEdBQUosQ0FBUSxTQUFDLENBQUQ7ZUFBTyxDQUFDLENBQUMsSUFBRixDQUFPLENBQVAsRUFBVSxDQUFDLE9BQUQsRUFBUSxPQUFSLEVBQWUsTUFBZixDQUFWO0lBQVAsQ0FBUixDQUFpRCxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQWxFLENBQTBFO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsSUFBQSxFQUFLLElBQS9CO0tBQTFFO0FBQTdCOztBQUVOLEdBQUEsR0FBTTs7QUFDTixJQUFBLEdBQVUsU0FBQyxDQUFEO1dBQU8sR0FBQSxHQUFNO0FBQWI7O0FB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LENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO0lBbkVVLENBQWQ7QUEzR2EsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiMjI1xuXG5rbG9yID0gcmVxdWlyZSAnLi4vJ1xua3hrID0gcmVxdWlyZSAna3hrJ1xua3hrLmNoYWkoKVxuXyA9IGt4ay5fXG5cbmluYyA9IChyZ3MsIHN0YXJ0LCBtYXRjaCwgY2xzcykgLT4gcmdzLm1hcCgocikgLT4gXy5waWNrIHIsIFsnc3RhcnQnJ21hdGNoJydjbHNzJ10gKS5zaG91bGQuZGVlcC5pbmNsdWRlICAgICBzdGFydDpzdGFydCwgbWF0Y2g6bWF0Y2gsIGNsc3M6Y2xzc1xubnV0ID0gKHJncywgc3RhcnQsIG1hdGNoLCBjbHNzKSAtPiByZ3MubWFwKChyKSAtPiBfLnBpY2sgciwgWydzdGFydCcnbWF0Y2gnJ2Nsc3MnXSApLnNob3VsZC5ub3QuZGVlcC5pbmNsdWRlIHN0YXJ0OnN0YXJ0LCBtYXRjaDptYXRjaCwgY2xzczpjbHNzXG5cbmV4dCA9ICdjb2ZmZWUnXG5sYW5nICAgID0gKGwpIC0+IGV4dCA9IGxcbnJhbmdlcyAgPSAocyxlKSAtPiBrbG9yLnJhbmdlcyAgcywgZSA/IGV4dFxucGFyc2UgICA9IChjLGUpIC0+IGtsb3IucGFyc2UgICBjLnNwbGl0KCdcXG4nKSwgZSA/IGV4dFxuZGlzc2VjdCA9IChjLGUpIC0+IGtsb3IuZGlzc2VjdCBjLnNwbGl0KCdcXG4nKSwgZSA/IGV4dFxuICBcbiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuIyMjXG5cbmRlc2NyaWJlICdyYW5nZXMnIC0+XG4gICAgICAgICAgXG4gICAgaXQgJ2ZhbGxiYWNrJyAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICd0ZXh0JyAndW5rbm93bidcbiAgICAgICAgaW5jIHJncywgMCAndGV4dCcgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICd0ZXh0JyAnZmlzaCdcbiAgICAgICAgaW5jIHJncywgMCAndGV4dCcgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjIyNcIiAnLmNvZmZlZScgXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3VuaWNvZGUnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCLwn4yIXCJcbiAgICAgICAgaW5jIHJncywgMCAn8J+MiCcgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwi8J+MiPCfjLFcIlxuICAgICAgICBpbmMgcmdzLCAwICfwn4yIJyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiAn8J+MsScgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCLwn5mCbG9s8J+YgFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ/CfmYInICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAyICdsb2wnICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA1ICfwn5iAJyAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImHinpxiIGHilqzilrZiXCJcbiAgICAgICAgIyBsb2cgcmdzXG4gICAgICAgIGluYyByZ3MsIDEgJ+KenCcgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICfilqwnICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNiAn4pa2JyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCLwn5CA8J+QgfCfkILwn5CD8J+QhPCfkIXwn5CG8J+Qh/CfkIjwn5CJ8J+QivCfkIvwn5CM8J+QjfCfkI7wn5CP8J+QkPCfkJHwn5CS8J+Qk/CfkJTwn5CV8J+QlvCfkJfwn5CY8J+QmfCfkJrwn5Cb8J+QnPCfkJ3wn5Ce8J+Qn/CfkKDwn5Ch8J+QovCfkKPwn5Ck8J+QpVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ/CfkIAnICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAyNCAn8J+QjCcgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiJ/CflKcnIGJsYToxXCJcbiAgICAgICAgaW5jIHJncywgNiAnYmxhJyAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpY29uOiAn8J+UpycgYmxhOjFcIlxuICAgICAgICBpbmMgcmdzLCAxMiAnYmxhJyAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdjb21tZW50cycgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImhlbGxvICMgd29ybGRcIlxuICAgICAgICBpbmMgcmdzLCA2IFwiI1wiICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA4IFwid29ybGRcIiAnY29tbWVudCdcblxuICAgICAgICBsYW5nICdub29uJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgICAjIGJsYSBibHViXCJcbiAgICAgICAgaW5jIHJncywgMyBcIiNcIiAgICAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDUgXCJibGFcIiAgICdjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA5IFwiYmx1YlwiICAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIoXlxccyojXFxzKikoLiopJFwiXG4gICAgICAgIGZvciBybmcgaW4gcmdzXG4gICAgICAgICAgICBybmcuc2hvdWxkLm5vdC5oYXZlLnByb3BlcnR5ICdjbHNzJyAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgIGl0ICd0cmlwbGUgY29tbWVudCcgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMjI2EjIyNcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMSBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDIgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiYVwiICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNCBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDUgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiIyMjXFxuYVxcbiMjI1wiXG4gICAgICAgIGluYyBkc3NbMF0sIDAgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAxIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMiBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDAgXCJhXCIgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAwIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMSBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDIgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuXG4gICAgICAgIGxhbmcgJ3N0eWwnXG4gICAgICAgIFxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiLypcXG5hXFxuKi9cIiBcbiAgICAgICAgaW5jIGRzc1swXSwgMCBcIi9cIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEgXCIqXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwIFwiYVwiICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMCBcIipcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEgXCIvXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBcbiAgICBpdCAnY29tbWVudCBoZWFkZXInIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjIDAgMDAgMDAwMFwiIFxuICAgICAgICBpbmMgcmdzLCAwICBcIiNcIiAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgMiAgXCIwXCIgICAgJ2NvbW1lbnQgaGVhZGVyJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcIjAwXCIgICAnY29tbWVudCBoZWFkZXInXG4gICAgICAgIGluYyByZ3MsIDcgIFwiMDAwMFwiICdjb21tZW50IGhlYWRlcidcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiIyMjXFxuIDAgMDAgMCBcXG4jIyNcIlxuICAgICAgICBpbmMgZHNzWzFdLCAxIFwiMFwiICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjIDAgKiAwLjJcIlxuICAgICAgICBpbmMgcmdzLCAyICcwJyAnY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgNiAnMCcgJ2NvbW1lbnQnXG4gICAgICAgIFxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiIyMjXFxuIDAgMSAwIFxcbiMjI1wiXG4gICAgICAgIGluYyBkc3NbMV0sIDEgXCIwXCIgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBcbiAgICAgICAgbGFuZyAnc3R5bCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi8vIDAwMFwiXG4gICAgICAgIGluYyByZ3MsIDMgIFwiMDAwXCIgICAgJ2NvbW1lbnQgaGVhZGVyJ1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIvKlxcbiAwIDAgMCBcXG4qL1wiXG4gICAgICAgIGluYyBkc3NbMV0sIDEgXCIwXCIgJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdudW1iZXJzJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhIDY2NzBcIlxuICAgICAgICBpbmMgcmdzLCAyIFwiNjY3MFwiICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMHg2NjdBQ1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCIweDY2N0FDXCIgJ251bWJlciBoZXgnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNjYuNzAwXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjY2XCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIuXCIgICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAzIFwiNzAwXCIgJ251bWJlciBmbG9hdCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI3Ny44MDAgLTEwMFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCI3N1wiICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA4IFwiMTAwXCIgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIoOC45LDEwMC4yKVwiXG4gICAgICAgIGluYyByZ3MsIDMgXCI5XCIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgOSBcIjJcIiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzZW12ZXInIC0+ICAgIFxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNjYuNzAuMFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCI2NlwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDIgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCI3MFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDYgXCIwXCIgICdzZW12ZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXjAuNy4xXCJcbiAgICAgICAgaW5jIHJncywgMCBcIl5cIiAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiMFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCI3XCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSBcIjFcIiAnc2VtdmVyJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIl4xLjAuMC1hbHBoYS4xMlwiXG4gICAgICAgIGluYyByZ3MsIDEgXCIxXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMyBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiMFwiICdzZW12ZXInXG4gICAgICAgIFxuICAgICAgICAjIGxhbmcgJ25vb24nXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI+PTYuNy45XCJcbiAgICAgICAgaW5jIHJncywgMCBcIj5cIiAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiPVwiICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDIgXCI2XCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMyBcIi5cIiAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiN1wiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIuXCIgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgNiBcIjlcIiAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ3N0cmluZ3MnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJcIlwiYT1cIlxcXFxcIkVcXFxcXCJcIiBcIlwiXCJcbiAgICAgICAgaW5jIHJncywgMiAnXCInICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA0ICdcIicgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDUgJ0UnICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA4ICdcIicgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XCJcXCdYXFwnXCInXG4gICAgICAgIGluYyByZ3MsIDIgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiJ1wiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDQgXCJYXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNiAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdhPVxcJ1wiWFwiXFwnJyAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiJ1wiICAgJ3B1bmN0IHN0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDMgJ1wiJyAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA0ICdYJyAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiJ1wiICAgJ3B1bmN0IHN0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhPVwiICBcXCdYXFwnICBZICBcIiAnXG4gICAgICAgIGluYyByZ3MsIDIgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiJ1wiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCJYXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNyBcIidcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxMyAnXCInICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XCJcIjtiPVwiIFwiO2M9XCJYXCInXG4gICAgICAgIGZvciBpIGluIFsyIDMgNyA5IDEzIDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgJ1wiJywgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDE0ICdYJyAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYT0nJztiPScgJztjPSdZJ1wiXG4gICAgICAgIGZvciBpIGluIFsyIDMgNyA5IDEzIDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgXCInXCIsICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnWScgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJycnXCJzID0gJy9zb21lXFxcXHBhdGgvZmlsZS50eHQ6MTAnXCInJydcbiAgICAgICAgaW5jIHJncywgNSBcIidcIiAgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDE3IFwiZmlsZVwiICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyMSBcIi5cIiAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjIgXCJ0eHRcIiAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDI2IFwiMTBcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyOCBcIidcIiAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjkgJ1wiJyAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnJyd3aGVuICdcIlwiXCInIHRoZW4gJ3N0cmluZyBkb3VibGUgdHJpcGxlXFwnJycnXG4gICAgICAgIGluYyByZ3MsIDYgJ1wiJyAgICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDcgJ1wiJyAgICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDggJ1wiJyAgICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCInJyd3aGVuXFxcXCcnJydcIlxuICAgICAgICBpbmMgcmdzLCAzICBcIndoZW5cIiAgJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA4ICBcIidcIiAgICAgJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAxMSBcIidcIiAgICAgJ3B1bmN0IHN0cmluZyBzaW5nbGUgdHJpcGxlJ1xuICAgICAgICBcbiAgICAgICAgIyBpbnRlcnBvbGF0aW9uXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiI3t4eHh9XCInXG4gICAgICAgIGluYyByZ3MsIDAgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiI1wiICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAyIFwie1wiICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAzICd4eHgnICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA2IFwifVwiICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIGVuZCdcbiAgICAgICAgaW5jIHJncywgNyAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdcIiN7NjY2fVwiJ1xuICAgICAgICBpbmMgcmdzLCAwICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMyAnNjY2JyAnbnVtYmVyJ1xuICAgICAgICBpbmMgcmdzLCA3ICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiXCJcIiN7Nzc3fVwiXCJcIidcbiAgICAgICAgaW5jIHJncywgMCAgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMSAgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMiAgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMyAgJyMnICAgJ3B1bmN0IHN0cmluZyBpbnRlcnBvbGF0aW9uIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCA0ICAneycgICAncHVuY3Qgc3RyaW5nIGludGVycG9sYXRpb24gc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDUgICc3NzcnICdudW1iZXInXG4gICAgICAgIGluYyByZ3MsIDggICd9JyAgICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBlbmQnXG4gICAgICAgIGluYyByZ3MsIDkgICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDEwICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDExICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSB0cmlwbGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiI3tfX2Rpcm5hbWV9Ly4uL1wiJ1xuICAgICAgICBpbmMgcmdzLCAxMiwgJ30nICdwdW5jdCBzdHJpbmcgaW50ZXJwb2xhdGlvbiBlbmQnXG4gICAgICAgIGluYyByZ3MsIDEzLCAnLycgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICBsYW5nICd0eHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpdCdzIGFsbCB3ZSdsbCBldmVyIG5lZWQuIHdlJ2QgbmV2ZXIgZG8gdGhhdCFcIlxuICAgICAgICBpbmMgcmdzLCAyICBcIidcIiAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDMgIFwic1wiICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAxMSBcIidcIiAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDI4IFwiJ1wiICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsncycgJ2xsJyAnZCcgJ3QnXVwiXG4gICAgICAgIGluYyByZ3MsIDEgIFwiJ1wiICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCAyICBcInNcIiAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgMyAgXCInXCIgJ3B1bmN0IHN0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDUgIFwiJ1wiICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA4ICBcIidcIiAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcblxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ25vb24nIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgbGFuZyAnbm9vbidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiAgICBwcm9wZXJ0eSAgdmFsdWVcIlxuICAgICAgICBpbmMgcmdzLCA0ICdwcm9wZXJ0eScgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxNCAndmFsdWUnICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInRvcFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ3RvcCcgICdvYmonXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidG9wICBwcm9wXCJcbiAgICAgICAgaW5jIHJncywgMCAndG9wJyAgJ29iaidcbiAgICAgICAgaW5jIHJncywgNSAncHJvcCcgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidmVyc2lvbiAgXjAuMS4yXCJcbiAgICAgICAgaW5jIHJncywgMCAndmVyc2lvbicgICdvYmonXG4gICAgICAgIGluYyByZ3MsIDkgJ14nICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDEwICcwJyAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwic29tZS1wYWNrYWdlLW5hbWUgIDFcIlxuICAgICAgICBpbmMgcmdzLCAwICAnc29tZScgICAgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCA1ICAncGFja2FnZScgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxMyAnbmFtZScgICAgJ3Byb3BlcnR5J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInNvbWUtcGFja2FnZS1uYW1lICBeMS4yLjNcIlxuICAgICAgICBpbmMgcmdzLCAwICAnc29tZScgICAgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCA1ICAncGFja2FnZScgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxMyAnbmFtZScgICAgJ3Byb3BlcnR5J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidG9wICBwcm9wICB2YWx1ZVwiXG4gICAgICAgIGluYyByZ3MsIDAgICd0b3AnICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgNSAgJ3Byb3AnICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDExICd2YWx1ZScgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJodHRwOi8vZG9tYWluLmNvbVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2h0dHAnICd1cmwgcHJvdG9jb2wnXG4gICAgICAgIGluYyByZ3MsIDQgJzonICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDcgJ2RvbWFpbicgJ3VybCBkb21haW4nXG4gICAgICAgIGluYyByZ3MsIDEzICcuJyAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgaW5jIHJncywgMTQgJ2NvbScgJ3VybCB0bGQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaHR0cDovL2RvbWFpbi5jb20vZGlyL3BhZ2UuaHRtbFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2h0dHAnICd1cmwgcHJvdG9jb2wnXG4gICAgICAgIGluYyByZ3MsIDQgJzonICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDcgJ2RvbWFpbicgJ3VybCBkb21haW4nXG4gICAgICAgIGluYyByZ3MsIDEzICcuJyAncHVuY3QgdXJsIHRsZCdcbiAgICAgICAgaW5jIHJncywgMTQgJ2NvbScgJ3VybCB0bGQnXG4gICAgICAgIGluYyByZ3MsIDE3ICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmlsZS5jb2ZmZWVcIlxuICAgICAgICBpbmMgcmdzLCAwICdmaWxlJyAnY29mZmVlIGZpbGUnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCBjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDUgJ2NvZmZlZScgJ2NvZmZlZSBleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL3NvbWUvcGF0aFwiXG4gICAgICAgIGluYyByZ3MsIDEgJ3NvbWUnICAgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAgICAgICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDYgJ3BhdGgnICAgJ3RleHQgZmlsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCdcbiAgICAgICAgaW5jIHJncywgMCAgJy8nICAgICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDEgICdzb21lJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDUgICdcXFxcJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNSAnLicgICdwdW5jdCB0eHQnXG4gICAgICAgIGluYyByZ3MsIDE5ICc6JyAgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgIHRlc3QgIC4vbm9kZV9tb2R1bGVzLy5iaW4vbW9jaGFcIlxuICAgICAgICBpbmMgcmdzLCA0ICd0ZXN0JyAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEwICcuJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxMSAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMTIgJ25vZGVfbW9kdWxlcycgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyNCAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMjUgJy4nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDI2ICdiaW4nICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgMjkgJy8nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDMwICdtb2NoYScgJ3RleHQgZmlsZSdcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2NvZmZlZScgLT5cblxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ1dGlsID0gcmVxdWlyZSAndXRpbCdcIlxuICAgICAgICBpbmMgcmdzLCA3ICdyZXF1aXJlJyAncmVxdWlyZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImNsYXNzIE1hY3JvIGV4dGVuZHMgQ29tbWFuZFwiXG4gICAgICAgIGluYyByZ3MsIDAgICdjbGFzcycgICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNiAgJ01hY3JvJyAgICdjbGFzcydcbiAgICAgICAgaW5jIHJncywgMTIgJ2V4dGVuZHMnICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyMCAnQ29tbWFuZCcgJ2NsYXNzJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZXhpc3Q/LnByb3BcIlxuICAgICAgICBpbmMgcmdzLCA3ICdwcm9wJyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYSBhbmQgYlwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJhXCIgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIgXCJhbmRcIiAna2V5d29yZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpZiBhIHRoZW4gYlwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJpZlwiICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiYVwiICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA1IFwidGhlblwiICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxMCBcImJcIiAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJzd2l0Y2ggYVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJzd2l0Y2hcIiAna2V5d29yZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBhOiBiXCJcbiAgICAgICAgaW5jIHJncywgMSBcImFcIiAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJvYmoudmFsdWUgPSBvYmouYW5vdGhlci52YWx1ZVwiXG4gICAgICAgIGluYyByZ3MsIDAgIFwib2JqXCIgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgNCAgXCJ2YWx1ZVwiICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEyIFwib2JqXCIgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgMTYgXCJhbm90aGVyXCIncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDI0IFwidmFsdWVcIiAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIHNvbWVPYmplY3Quc29tZVByb3BcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiaWZcIiAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMyBcInNvbWVPYmplY3RcIiAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxMyBcIi5cIiAncHVuY3QgcHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDE0IFwic29tZVByb3BcIiAncHJvcGVydHknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIxICdhJ1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCIxXCIgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWzBdLnByb3BcIlxuICAgICAgICBpbmMgcmdzLCAzICddJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJbIGYgXVwiXG4gICAgICAgIGluYyByZ3MsIDIgJ2YnICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsgZiAsIGYgXVwiXG4gICAgICAgIGluYyByZ3MsIDIgJ2YnICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsuLi4yXVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy4nICdwdW5jdCByYW5nZSdcbiAgICAgICAgaW5jIHJncywgMyAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCA0ICcuJyAncHVuY3QgcmFuZ2UnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsgLTEgLi4gXVwiXG4gICAgICAgIGluYyByZ3MsIDYgJy4nICdwdW5jdCByYW5nZSdcbiAgICAgICAgaW5jIHJncywgNyAnLicgJ3B1bmN0IHJhbmdlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbMS4ubl1cIlxuICAgICAgICBpbmMgcmdzLCAzICcuJyAncHVuY3QgcmFuZ2UnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCByYW5nZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWyAuLi4uIF1cIlxuICAgICAgICBpbmMgcmdzLCAzICcuJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAnLicgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA2ICcuJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAZiBbMV1cIlxuICAgICAgICBpbmMgcmdzLCAwIFwiQFwiICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBmID0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJAXCIgJ3B1bmN0IHRoaXMnXG4gICAgICAgIGluYyByZ3MsIDEgXCJmXCIgJ3RleHQgdGhpcydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBoZWlnaHQvMiArIEBoZWlnaHQvNlwiXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICAgICAgJ3B1bmN0IHRoaXMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2hlaWdodCcgJ3RleHQgdGhpcydcbiAgICAgICAgaW5jIHJncywgOCBcIjJcIiAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiAgICBpdCAnY29mZmVlIGZ1bmN0aW9uJyAtPlxuXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm9iai5wcm9wLmNhbGwgMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ29iaicgJ29iaidcbiAgICAgICAgaW5jIHJncywgNCAncHJvcCcgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCA5ICdjYWxsJyAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImRvbGF0ZXIgPT5cIlxuICAgICAgICBpbmMgcmdzLCA4ICc9JyAncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgaW5jIHJncywgOSAnPicgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZG9sYXRlciAtPlwiXG4gICAgICAgIGluYyByZ3MsIDggJy0nICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA5ICc+JyAncHVuY3QgZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkBhIEBiICdjJ1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ0AnICdwdW5jdCBmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBpbmMgcmdzLCAxICdhJyAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgaW5jIHJncywgMyAnQCcgJ3B1bmN0IGZ1bmN0aW9uIGNhbGwnXG4gICAgICAgIGluYyByZ3MsIDQgJ2InICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQGEgMyBAYiAnNSdcIlxuICAgICAgICBpbmMgcmdzLCAwICdAJyAncHVuY3QgZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgaW5jIHJncywgMSAnYScgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmIDFcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiZmZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgJ2EnXCJcbiAgICAgICAgaW5jIHJncywgMCBcImZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmICdiJ1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmZmYgLTFcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiZmZmZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgWzFdXCJcbiAgICAgICAgaW5jIHJncywgMCBcImZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmZmZmIHsxfVwiXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZmZmZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKythXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICs0XCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAtNFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicG9zPSAoaXRlbSwgcCkgLT4gXCJcbiAgICAgICAgaW5jIHJncywgMCBcInBvc1wiICdmdW5jdGlvbidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgIT0gZmFsc2VcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICs9IDFcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgLT0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKj0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgLz0gMVwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSA/IGZhbHNlXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSA8IDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpID4gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgKyAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAtIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpICogM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgLyAzXCJcbiAgICAgICAgaW5jIHJncywgMCAnaScgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaSAlIDNcIlxuICAgICAgICBpbmMgcmdzLCAwICdpJyAndGV4dCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpID0gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImkgPT0gM1wiXG4gICAgICAgIGluYyByZ3MsIDAgJ2knICd0ZXh0J1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGl0ICdjb2ZmZWUgbWV0aG9kJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIGE6ID0+XCJcbiAgICAgICAgaW5jIHJncywgMSBcImFcIiAnbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiOlwiICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQgXCI9XCIgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUgXCI+XCIgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgYTogLT5cIlxuICAgICAgICBpbmMgcmdzLCAxIFwiYVwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCBcIi1cIiAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAncHVuY3QgZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm10aGQ6ICAoYXJnKSAgICA9PiBAbWVtYmVyIG1lbWFyZ1wiXG4gICAgICAgIGluYyByZ3MsIDAgICdtdGhkJyAnbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0ICAnOicgICAgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMTYgJz0nICAgICdwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCAxNyAnPicgICAgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAbXRoZDogKGFyZykgLT5cIlxuICAgICAgICBpbmMgcmdzLCAwICdAJyAgICAncHVuY3QgbWV0aG9kIGNsYXNzJ1xuICAgICAgICBpbmMgcmdzLCAxICdtdGhkJyAnbWV0aG9kIGNsYXNzJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdrb2ZmZWUgY29uc3RydWN0b3InIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgQDogLT5cIlxuICAgICAgICBpbmMgcmdzLCAxIFwiQFwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCBcIi1cIiAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAncHVuY3QgZnVuY3Rpb24gaGVhZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgQDotPmFcIlxuICAgICAgICBpbmMgcmdzLCAxIFwiQFwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMyBcIi1cIiAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNCBcIj5cIiAncHVuY3QgZnVuY3Rpb24gaGVhZCdcblxuICAgIGl0ICdrb2ZmZWUgbWV0YSBpZiB0aGVuIGVsc2UnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCLilrhpZiDilrh0aGVuIOKWuGVsaWYg4pa4ZWxzZVwiXG4gICAgICAgIGluYyByZ3MsIDAgIFwi4pa4XCIgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDEgIFwiaWZcIiAgICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcIuKWuFwiICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCA1ICBcInRoZW5cIiAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTAgXCLilrhcIiAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTEgXCJlbGlmXCIgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDE2IFwi4pa4XCIgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDE3IFwiZWxzZVwiICdtZXRhJ1xuXG4gICAgaXQgJ2tvZmZlZSBubyBjb21tYScgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsxICd4JyBhOjEgYzpkXVwiXG4gICAgICAgIGluYyByZ3MsIDEgIFwiMVwiICAgJ251bWJlcidcbiAgICAgICAgaW5jIHJncywgNCAgXCJ4XCIgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNyAgXCJhXCIgICAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIGluYyByZ3MsIDExIFwiY1wiICAgJ2RpY3Rpb25hcnkga2V5J1xuXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdqcycgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2pzJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwib2JqLnByb3AuY2FsbCgxKTtcIlxuICAgICAgICBpbmMgcmdzLCAwICdvYmonICdvYmonXG4gICAgICAgIGluYyByZ3MsIDQgJ3Byb3AnICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgOSAnY2FsbCcgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmdW5jID0gZnVuY3Rpb24oKSB7XCJcbiAgICAgICAgaW5jIHJncywgMCAnZnVuYycgJ2Z1bmN0aW9uJ1xuICAgICAgICBpbmMgcmdzLCA3ICdmdW5jdGlvbicgJ2tleXdvcmQgZnVuY3Rpb24nXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJvYmoudmFsdWUgPSBvYmouYW5vdGhlci52YWx1ZVwiXG4gICAgICAgIGluYyByZ3MsIDAgIFwib2JqXCIgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgNCAgXCJ2YWx1ZVwiICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEyIFwib2JqXCIgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgMTYgXCJhbm90aGVyXCIncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDI0IFwidmFsdWVcIiAgJ3Byb3BlcnR5J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYSgyKTtcIlxuICAgICAgICBpbmMgcmdzLCAwICdhJyAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6XCJcbiAgICAgICAgaW5jIHJncywgMCBcIi9cIiAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgMSBcIi9cIiAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgMiBcIiNcIiAnY29tbWVudCdcbiAgICAgIFxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgICAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdqc29uJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnanNvbidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlwiXCJ7IFwiQSBaXCI6IDEgfVwiXCJcIlxuICAgICAgICBpbmMgcmdzLCAyICdcIicgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgIGluYyByZ3MsIDMgJ0EnICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgNSAnWicgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCA2ICdcIicgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgIGluYyByZ3MsIDcgJzonICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdcImFcIjogXCJodHRwOi8vZG9tYWluLmNvbVwiJ1xuICAgICAgICBpbmMgcmdzLCA2ICdodHRwJyAndXJsIHByb3RvY29sJ1xuICAgICAgICBpbmMgcmdzLCAxMCAnOicgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgMTEgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgIGluYyByZ3MsIDEyICcvJyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCAxMyAnZG9tYWluJyAndXJsIGRvbWFpbidcbiAgICAgICAgaW5jIHJncywgMTkgJy4nICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICBpbmMgcmdzLCAyMCAnY29tJyAndXJsIHRsZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiaHR0cDovL2RvbWFpbi5jb20vZGlyL3BhZ2UuaHRtbFwiJ1xuICAgICAgICBpbmMgcmdzLCAxICdodHRwJyAndXJsIHByb3RvY29sJ1xuICAgICAgICBpbmMgcmdzLCA1ICc6JyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCA2ICcvJyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCA3ICcvJyAncHVuY3QgdXJsJ1xuICAgICAgICBpbmMgcmdzLCA4ICdkb21haW4nICd1cmwgZG9tYWluJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnLicgJ3B1bmN0IHVybCB0bGQnXG4gICAgICAgIGluYyByZ3MsIDE1ICdjb20nICd1cmwgdGxkJ1xuICAgICAgICBpbmMgcmdzLCAxOCAnLycgJ3B1bmN0IGRpcidcbiAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiZmlsZS5jb2ZmZWVcIidcbiAgICAgICAgaW5jIHJncywgMSAnZmlsZScgJ2NvZmZlZSBmaWxlJ1xuICAgICAgICBpbmMgcmdzLCA1ICcuJyAncHVuY3QgY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA2ICdjb2ZmZWUnICdjb2ZmZWUgZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIvc29tZS9wYXRoXCInXG4gICAgICAgIGluYyByZ3MsIDIgJ3NvbWUnICAgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA2ICcvJyAgICAgICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDcgJ3BhdGgnICAgJ3RleHQgZmlsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMFwiJ1xuICAgICAgICBpbmMgcmdzLCAwICdcIicgICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxICAnLycgICAgJ3B1bmN0IGRpcidcbiAgICAgICAgaW5jIHJncywgMiAgJ3NvbWUnICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgMTYgJy4nICAncHVuY3QgdHh0J1xuICAgICAgICBpbmMgcmdzLCAyMCAnOicgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyMyAnXCInICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiLi9ub2RlX21vZHVsZXMvLmJpbi9tb2NoYVwiJ1xuICAgICAgICBpbmMgcmdzLCAxICcuJyAndGV4dCBkaXInICMgd2h5IGlzIHRoaXMgdGV4dCBhbmQgbm90IHB1bmN0P1xuICAgICAgICBpbmMgcmdzLCAyICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAzICdub2RlX21vZHVsZXMnICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgMTUgJy8nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE2ICcuJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE3ICdiaW4nICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgMjAgJy8nICdwdW5jdCBkaXInXG4gICAgICAgIGluYyByZ3MsIDIxICdtb2NoYScgJ3RleHQgZmlsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiNjYuNzAuMFwiJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiNjZcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiLlwiICAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiNzBcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA2IFwiLlwiICAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA3IFwiMFwiICAnc2VtdmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCJeMC43LjFcIidcbiAgICAgICAgaW5jIHJncywgMSBcIl5cIiAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiMFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDQgXCI3XCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNiBcIjFcIiAnc2VtdmVyJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCJeMS4wLjAtYWxwaGEuMTJcIidcbiAgICAgICAgaW5jIHJncywgMiBcIjFcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiMFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDYgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCI+PTYuNy44XCInXG4gICAgICAgIGluYyByZ3MsIDEgXCI+XCIgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgMiBcIj1cIiAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiNlwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDQgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCI3XCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNiBcIi5cIiAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgNyBcIjhcIiAgJ3NlbXZlcidcblxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdyZWdleHAnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJyPS9hL1wiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDMgJ2EnICAgICAgICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgNCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBlbmQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi8oYXwuKnxcXHNcXGRcXHdcXFNcXFckfF5cXHMrKS9cIlxuICAgICAgICBpbmMgcmdzLCAwICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAyICdhJyAgICAgICAndGV4dCByZWdleHAnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL14jaW5jbHVkZS9cIlxuICAgICAgICBpbmMgcmdzLCAwICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAyIFwiI1wiICAgICAgICdwdW5jdCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDMgXCJpbmNsdWRlXCIgJ3RleHQgcmVnZXhwJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi9cXFxcJ2hlbGxvXFxcXCcvIFwiXG4gICAgICAgIGluYyByZ3MsIDAgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDEgXCJcXFxcXCIgICAgICAncHVuY3QgZXNjYXBlIHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMiBcIidcIiAgICAgICAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiaGVsbG9cIiAgICd0ZXh0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmIGEgL2IgLSBjL2dpXCJcbiAgICAgICAgaW5jIHJncywgNCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgNSAnYicgICAgICAgJ3RleHQgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAxMCAnLycgICAgICAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInc9bC5zcGxpdCAvW1xcXFxzXFxcXC9dLyA7IGJsYVwiXG4gICAgICAgIGluYyByZ3MsIDEwICcvJyAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDE0ICdcXFxcJyAgICAgJ3B1bmN0IGVzY2FwZSByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDE3ICcvJyAgICAgICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICBpbmMgcmdzLCAxOSAnOycgICAgICAncHVuY3QgbWlub3InXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhID0gMSAvIDJcIlxuICAgICAgICBpbmMgcmdzLCA2ICcvJywgICAgICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgOCAnMicsICAgICAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIigxKzEpIC8gMlwiXG4gICAgICAgIGluYyByZ3MsIDYgJy8nLCAgICAgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA4ICcyJywgICAgICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsxMF0gLyAyXCJcbiAgICAgICAgaW5jIHJncywgNiAnLycsICAgICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDggJzInLCAgICAgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpZiAvIGFhIC8udGVzdCBzXCJcbiAgICAgICAgaW5jIHJncywgMyAnLycgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCA4ICcvJyAgICAgICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICBpbmMgcmdzLCA5ICcuJyAgICAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTAgJ3Rlc3QnICAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgaW5jIHJncywgMTUgJ3MnICAgICAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIC8g8J+YoSAvLnRlc3Qgc1wiXG4gICAgICAgIGluYyByZ3MsIDMgJy8nICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgOCAnLycgICAgICAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgaW5jIHJncywgOSAnLicgICAgICAncHVuY3QgcHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEwICd0ZXN0JyAgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgIGluYyByZ3MsIDE1ICdzJyAgICAgJ3RleHQnXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAndHJpcGxlIHJlZ2V4cCcgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi8vL2EvLy8sYlwiXG4gICAgICAgIGluYyByZ3MsIDAgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDEgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDIgXCIvXCIgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDMgXCJhXCIgJ3RleHQgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNCBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNSBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNiBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgOCBcImJcIiAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCIvLy9cXG5hXFxuLy8vXCJcbiAgICAgICAgaW5jIGRzc1swXSwgMCBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMiBcIi9cIiAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMCBcImFcIiAndGV4dCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAwIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAxIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAyIFwiL1wiICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBcbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIlwiXCJcbiAgICAgICAgICAgIC8vL1xuICAgICAgICAgICAgICAgIChbXFxcXFxcXFw/XSkgIyBjb21tZW50XG4gICAgICAgICAgICAvLy8sIGFcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpbmMgZHNzWzBdLCAwICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMiAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCA0ICBcIihcIiAgJ3B1bmN0IG1pbm9yIHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDYgIFwiXFxcXFwiICdwdW5jdCBlc2NhcGUgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTIgXCIjXCIgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgZHNzWzFdLCAxNCBcImNvbW1lbnRcIiAnY29tbWVudCdcbiAgICAgICAgaW5jIGRzc1syXSwgMCAgXCIvXCIgICdwdW5jdCByZWdleHAgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAxICBcIi9cIiAgJ3B1bmN0IHJlZ2V4cCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDIgIFwiL1wiICAncHVuY3QgcmVnZXhwIHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgNSAgXCJhXCIgICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgZHNzID0gZGlzc2VjdCBcIlwiXCJcbiAgICAgICAgICAgIGFyciA9IFsgLy8vYVxcI3tifS8vL1xuICAgICAgICAgICAgICAgICAgICBrZXk6ICd2YWx1ZSdcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpbmMgZHNzWzFdLCA4ICdrZXknLCAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgaXQgJ25vIHJlZ2V4cCcgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NvZmZlZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ2EgLyBiIC0gYyAvIGQnIFxuICAgICAgICBudXQgcmdzLCAyICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnZiBhL2IsIGMvZCdcbiAgICAgICAgbnV0IHJncywgMyAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm0gPSAnLydcIlxuICAgICAgICBudXQgcmdzLCA1ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm0gYSwgJy8nJy8nXCJcbiAgICAgICAgbnV0IHJncywgNiAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlwiXCJcXFwibSA9ICcvJ1xcXCJcIlwiXCJcbiAgICAgICAgbnV0IHJncywgNiAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInMgPSAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCdcIlxuICAgICAgICBudXQgcmdzLCA1ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBudXQgcmdzLCA5ICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibnVtIC89IDEwXCJcbiAgICAgICAgbnV0IHJncywgNCAnLycgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIG51dCByZ3MsIDcgJzEwJyAndGV4dCByZWdleHAnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0IC8gMiAvIDFcIlxuICAgICAgICBpbmMgcmdzLCAyICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDYgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQvMi8xXCJcbiAgICAgICAgaW5jIHJncywgMSAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAzICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0LyAyIC8gMVwiXG4gICAgICAgIGluYyByZ3MsIDEgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNCAvMiAvIDFcIlxuICAgICAgICBpbmMgcmdzLCAyICcvJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDUgJy8nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjQgLyAyLyAxXCJcbiAgICAgICAgaW5jIHJncywgMiAnLycgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICcvJyAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI0IC8gMiAvMVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNCAvMi8gMVwiXG4gICAgICAgIGluYyByZ3MsIDIgJy8nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNCAnLycgJ3B1bmN0J1xuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpdCAnbWQnIC0+XG4gICAgICAgIFxuICAgICAgICBsYW5nICdtZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIioqYm9sZCoqXCJcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMSAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMiAnYm9sZCcgICAndGV4dCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA2ICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA3ICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLCoqYioqLFwiXG4gICAgICAgIGluYyByZ3MsIDEgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDMgJ2InICAgICAgJ3RleHQgYm9sZCdcbiAgICAgICAgaW5jIHJncywgNCAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKml0IGxpYypcIlxuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2l0JyAgICAgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA0ICdsaWMnICAgICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNyAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKml0YWxpYypcIlxuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2l0YWxpYycgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA3ICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIipgaXRhbGljIGNvZGVgKlwiXG4gICAgICAgIGluYyByZ3MsIDAgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgMSAnYCcgICAgICAncHVuY3QgaXRhbGljIGNvZGUnXG4gICAgICAgIGluYyByZ3MsIDIgJ2l0YWxpYycgJ3RleHQgaXRhbGljIGNvZGUnXG4gICAgICAgIGluYyByZ3MsIDkgJ2NvZGUnICAgJ3RleHQgaXRhbGljIGNvZGUnXG4gICAgICAgIGluYyByZ3MsIDE0ICcqJyAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIml0J3MgZ29vZFwiXG4gICAgICAgIGluYyByZ3MsIDAgJ2l0JyAgICAgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIgXCInXCIgICAgICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDMgJ3MnICAgICAgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpZiBpcyBlbXB0eSBpbiB0aGVuXCJcbiAgICAgICAgaW5jIHJncywgMCAgJ2lmJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMyAgJ2lzJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNiAgJ2VtcHR5JyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTIgJ2luJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTUgJ3RoZW4nICAndGV4dCdcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwi4pa4ZG9jXFxuICAgIGlmIGlzIGVtcHR5IGluIHRoZW5cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgZHNzWzFdLCA0ICAnaWYnICAgICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCA3ICAnaXMnICAgICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCAxMCAgJ2VtcHR5JyAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTYgJ2luJyAgICAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTkgJ3RoZW4nICAndGV4dCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAndGV4dCBmaWxlcy4gYmxhJ1xuICAgICAgICBpbmMgcmdzLCAwLCAndGV4dCcgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDEwLCAnLicgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICcuLmJsYSdcbiAgICAgICAgaW5jIHJncywgMCwgJy4nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMSwgJy4nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYGBgY29mZmVlc2NyaXB0J1xuICAgICAgICBpbmMgcmdzLCAwICdgJyAncHVuY3QgY29kZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDMgJ2NvZmZlZXNjcmlwdCcgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLSBsaVwiXG4gICAgICAgIGluYyByZ3MsIDAgJy0nICAncHVuY3QgbGkxIG1hcmtlcidcbiAgICAgICAgaW5jIHJncywgMiAnbGknICd0ZXh0IGxpMSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgICAgLSAqKmJvbGQqKlwiXG4gICAgICAgIGluYyByZ3MsIDQgJy0nICAgICdwdW5jdCBsaTIgbWFya2VyJ1xuICAgICAgICBpbmMgcmdzLCA4ICdib2xkJyAndGV4dCBsaTIgYm9sZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiAgICAgICAgLSAqKmJvbGQqKlwiXG4gICAgICAgIGluYyByZ3MsIDggJy0nICAgICdwdW5jdCBsaTMgbWFya2VyJ1xuICAgICAgICBpbmMgcmdzLCAxMiAnYm9sZCcgJ3RleHQgbGkzIGJvbGQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgICAgICAqICoqYm9sZCoqXCJcbiAgICAgICAgaW5jIHJncywgOCAnKicgICAgJ3B1bmN0IGxpMyBtYXJrZXInXG4gICAgICAgIGluYyByZ3MsIDEyICdib2xkJyAndGV4dCBsaTMgYm9sZCdcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiXCJcIlxuICAgICAgICAgICAgLSBsaTFcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGluYyBkc3NbMF0sIDAgICctJyAgICAncHVuY3QgbGkxIG1hcmtlcidcbiAgICAgICAgaW5jIGRzc1sxXSwgMCAgJ3RleHQnICd0ZXh0J1xuXG4gICAgICAgIGRzcyA9IGRpc3NlY3QgXCJcIlwiXG4gICAgICAgICAgICAjIGgxXG4gICAgICAgICAgICAjIyBoMlxuICAgICAgICAgICAgIyMjIGgzXG4gICAgICAgICAgICAjIyMjIGg0XG4gICAgICAgICAgICAjIyMjIyBoNVxuICAgICAgICBcIlwiXCJcbiAgICAgICAgaW5jIGRzc1swXSwgMCAgXCIjXCIgICAgJ3B1bmN0IGgxJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyICBcImgxXCIgICAndGV4dCBoMSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMCAgXCIjXCIgICAgJ3B1bmN0IGgyJ1xuICAgICAgICBpbmMgZHNzWzFdLCAzICBcImgyXCIgICAndGV4dCBoMidcbiAgICAgICAgaW5jIGRzc1syXSwgMCAgXCIjXCIgICAgJ3B1bmN0IGgzJ1xuICAgICAgICBpbmMgZHNzWzJdLCA0ICBcImgzXCIgICAndGV4dCBoMydcbiAgICAgICAgaW5jIGRzc1szXSwgMCAgXCIjXCIgICAgJ3B1bmN0IGg0J1xuICAgICAgICBpbmMgZHNzWzNdLCA1ICBcImg0XCIgICAndGV4dCBoNCdcbiAgICAgICAgaW5jIGRzc1s0XSwgMCAgXCIjXCIgICAgJ3B1bmN0IGg1J1xuICAgICAgICBpbmMgZHNzWzRdLCA2ICBcImg1XCIgICAndGV4dCBoNSdcblxuICAgICAgICBkc3MgPSBkaXNzZWN0IFwiXCJcIlxuICAgICAgICAgICAgYGBganNcbiAgICAgICAgICAgIGBgYFxuICAgICAgICBcIlwiXCJcbiAgICAgICAgaW5jIGRzc1sxXSwgMCAnYCcgJ3B1bmN0IGNvZGUgdHJpcGxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgIFxuICAgIGl0ICdodG1sJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnaHRtbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjwvZGl2PlwiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiPFwiICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiL1wiICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiZGl2XCIgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiPlwiICAgICdwdW5jdCBrZXl3b3JkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjxkaXY+XCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCI8XCIgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEgXCJkaXZcIiAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDQgXCI+XCIgICAgJ3B1bmN0IGtleXdvcmQnXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAgMDAwIDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgICAwMDAwMCAgICAwMDAgICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdzdHlsJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnc3R5bCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjFlbVwiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiMWVtXCIgICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMWV4XCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIxZXhcIiAgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIxcHhcIiBcbiAgICAgICAgaW5jIHJncywgMCBcIjFweFwiICAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjFzXCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIxc1wiICAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjEuMFwiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiMVwiICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAxIFwiLlwiICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAyIFwiMFwiICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLmNsc3NcIiBcbiAgICAgICAgaW5jIHJncywgMCBcIi5cIiAgICAgJ3B1bmN0IGNsYXNzJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiY2xzc1wiICAnY2xhc3MnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2lkXCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIjXCIgICAgJ3B1bmN0IGZ1bmN0aW9uJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiaWRcIiAgICdmdW5jdGlvbidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjaWQtZm9vLWJhclwiIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICdwdW5jdCBmdW5jdGlvbidcbiAgICAgICAgaW5jIHJncywgMSBcImlkXCIgICAnZnVuY3Rpb24nXG4gICAgICAgIGluYyByZ3MsIDMgXCItXCIgICAgJ3B1bmN0IGZ1bmN0aW9uJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiZm9vXCIgICdmdW5jdGlvbidcbiAgICAgICAgaW5jIHJncywgNyBcIi1cIiAgICAncHVuY3QgZnVuY3Rpb24nXG4gICAgICAgIGluYyByZ3MsIDggXCJiYXJcIiAgJ2Z1bmN0aW9uJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi5jbHNzLWZvby1iYXJcIiBcbiAgICAgICAgaW5jIHJncywgMCBcIi5cIiAgICAncHVuY3QgY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEgXCJjbHNzXCIgJ2NsYXNzJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiLVwiICAgICdwdW5jdCBjbGFzcydcbiAgICAgICAgaW5jIHJncywgNiBcImZvb1wiICAnY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDkgXCItXCIgICAgJ3B1bmN0IGNsYXNzJ1xuICAgICAgICBpbmMgcmdzLCAxMCBcImJhclwiICAnY2xhc3MnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjNjY2XCJcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICdwdW5jdCBudW1iZXIgaGV4J1xuICAgICAgICBpbmMgcmdzLCAxIFwiNjY2XCIgJ251bWJlciBoZXgnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjYWJjXCJcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICdwdW5jdCBudW1iZXIgaGV4J1xuICAgICAgICBpbmMgcmdzLCAxIFwiYWJjXCIgJ251bWJlciBoZXgnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjZjBmMGYwXCJcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICAgICdwdW5jdCBudW1iZXIgaGV4J1xuICAgICAgICBpbmMgcmdzLCAxIFwiZjBmMGYwXCIgJ251bWJlciBoZXgnXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnY3NzJyAtPlxuICAgICAgICBcbiAgICAgICAgbGFuZyAnY3NzJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMC41XCIgXG4gICAgICAgIGluYyByZ3MsIDAgXCIwXCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDEgXCIuXCIgICdwdW5jdCBudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDIgXCI1XCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgXG4gICAgXG4gICAgaXQgJ2NwcCcgLT5cbiAgICAgICAgXG4gICAgICAgIGxhbmcgJ2NwcCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiNpbmNsdWRlXCIgICAgICBcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiaW5jbHVkZVwiICAgICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2lmXCIgICAgICAgICAgICBcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiaWZcIiAgICAgICAgICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIyAgaWZcIiAgICAgICAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICAgICAgICdwdW5jdCBkZWZpbmUnXG4gICAgICAgIGluYyByZ3MsIDMgXCJpZlwiICAgICAgICAgJ2RlZmluZSdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpZiAodHJ1ZSkge30gZWxzZSB7fVwiICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiaWZcIiAgICAgICAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA0IFwidHJ1ZVwiICAgICAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxMyBcImVsc2VcIiAgICAgICdrZXl3b3JkJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjEuMGZcIlxuICAgICAgICBpbmMgcmdzLCAwIFwiMVwiICAgICAgICAgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDEgXCIuXCIgICAgICAgICAgJ3B1bmN0IG51bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMiBcIjBmXCIgICAgICAgICAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjAuMDAwMGZcIlxuICAgICAgICBpbmMgcmdzLCAyIFwiMDAwMGZcIiAgICAgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJvYmoudmFsdWUgPSBvYmouYW5vdGhlci52YWx1ZTtcIlxuICAgICAgICBpbmMgcmdzLCAwICBcIm9ialwiICAgICAgICdvYmonXG4gICAgICAgIGluYyByZ3MsIDQgIFwidmFsdWVcIiAgICAgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxMiBcIm9ialwiICAgICAgICdvYmonXG4gICAgICAgIGluYyByZ3MsIDE2IFwiYW5vdGhlclwiICAgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAyNCBcInZhbHVlXCIgICAgICdwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIkNhc3Q8dGFyZz5cIlxuICAgICAgICBpbmMgcmdzLCA0ICc8JyAgICAgICAgICAncHVuY3QgdGVtcGxhdGUnXG4gICAgICAgIGluYyByZ3MsIDUgJ3RhcmcnICAgICAgICd0ZW1wbGF0ZSdcbiAgICAgICAgaW5jIHJncywgOSAnPicgICAgICAgICAgJ3B1bmN0IHRlbXBsYXRlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiVE1hcDxGR3JpZCwgRlJvdXRlPlwiXG4gICAgICAgIGluYyByZ3MsIDAgJ1RNYXAnICAgICAgICdrZXl3b3JkIHR5cGUnXG4gICAgICAgIGluYyByZ3MsIDQgJzwnICAgICAgICAgICdwdW5jdCB0ZW1wbGF0ZSdcbiAgICAgICAgaW5jIHJncywgNSAnRkdyaWQnICAgICAgJ3RlbXBsYXRlJ1xuICAgICAgICBpbmMgcmdzLCAxMCAnLCcgICAgICAgICAncHVuY3QgdGVtcGxhdGUnXG4gICAgICAgIGluYyByZ3MsIDEyICdGUm91dGUnICAgICd0ZW1wbGF0ZSdcbiAgICAgICAgaW5jIHJncywgMTggJz4nICAgICAgICAgJ3B1bmN0IHRlbXBsYXRlJ1xuICAgICAgICBcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzaCcgLT5cblxuICAgICAgICBsYW5nICdzaCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImRpci9wYXRoL3dpdGgvZGFzaGVzL2ZpbGUudHh0XCJcbiAgICAgICAgaW5jIHJncywgMCAnZGlyJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDQgJ3BhdGgnICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgOSAnd2l0aCcgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnZGFzaGVzJyAndGV4dCBkaXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJwcmcgLS1hcmcxIC1hcmcyXCJcbiAgICAgICAgaW5jIHJncywgNCAnLScgJ3B1bmN0IGFyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCA1ICctJyAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDYgJ2FyZzEnICdhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgMTEgJy0nICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgMTIgJ2FyZzInICdhcmd1bWVudCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImNkIH5cIlxuICAgICAgICBpbmMgcmdzLCAzICd+JyAndGV4dCBkaXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwifi9ob21lXCJcbiAgICAgICAgaW5jIHJncywgMCAnficgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxICcvJyAncHVuY3QgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAyICdob21lJyAndGV4dCBmaWxlJ1xuICAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnbG9nJyAtPlxuXG4gICAgICAgIGxhbmcgJ2xvZydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImh0dHA6Ly9kb21haW4uY29tXCJcbiAgICAgICAgaW5jIHJncywgMCAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgaW5jIHJncywgNCAnOicgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNSAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNiAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgaW5jIHJncywgNyAnZG9tYWluJyAndXJsIGRvbWFpbidcbiAgICAgICAgaW5jIHJncywgMTMgJy4nICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnY29tJyAndXJsIHRsZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZpbGUuY29mZmVlXCJcbiAgICAgICAgaW5jIHJncywgMCAnZmlsZScgJ2NvZmZlZSBmaWxlJ1xuICAgICAgICBpbmMgcmdzLCA0ICcuJyAncHVuY3QgY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA1ICdjb2ZmZWUnICdjb2ZmZWUgZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi9zb21lL3BhdGhcIlxuICAgICAgICBpbmMgcmdzLCAxICdzb21lJyAgICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNSAnLycgICAgICAncHVuY3QgZGlyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImtleTogdmFsdWVcIlxuICAgICAgICBpbmMgcmdzLCAwICdrZXknICAgICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMyAnOicgICAgICAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4jIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuIyMjXG5cbmRlc2NyaWJlICdwYXJzZScgLT5cbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaXQgJ2NvbW1lbnQnIC0+XG4gICAgIFxuICAgICAgICBsYW5nICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICBwYXJzZShcIiMjXCIpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiI1wiIGNsc3M6J3B1bmN0IGNvbW1lbnQnIHR1cmQ6XCIjI1wifSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgY2xzczonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgIFxuICAgICAgICBwYXJzZShcIiwjYVwiKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDpcIixcIiBjbHNzOidwdW5jdCBtaW5vcicgdHVyZDogXCIsI1wifSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgY2xzczoncHVuY3QgY29tbWVudCd9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDpcImFcIiBjbHNzOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnZnVuY3Rpb24nIC0+XG4gICAgXG4gICAgICAgIHBhcnNlKCctPicpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOictJyBjbHNzOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIGNsc3M6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgcGFyc2UoJz0+Jykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jz0nIGNsc3M6J3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnIHR1cmQ6ICc9Pid9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDonPicgY2xzczoncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICBwYXJzZSgnZj0tPjEnKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6NSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonZicgY2xzczonZnVuY3Rpb24nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz0nIGNsc3M6J3B1bmN0IGZ1bmN0aW9uJyAgICAgIHR1cmQ6Jz0tPicgfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgbGVuZ3RoOjEgbWF0Y2g6Jy0nIGNsc3M6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6Jy0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDozIGxlbmd0aDoxIG1hdGNoOic+JyBjbHNzOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDo0IGxlbmd0aDoxIG1hdGNoOicxJyBjbHNzOidudW1iZXInfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdtaW5pbWFsJyAtPlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcGFyc2UoJzEnKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOicxJyBjbHNzOidudW1iZXInfSBdXVxuICAgICAgICBwYXJzZSgnYScpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6J2EnIGNsc3M6J3RleHQnfSBdXVxuICAgICAgICBwYXJzZSgnLicpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy4nIGNsc3M6J3B1bmN0J30gXV1cbiAgICBcbiAgICAgICAgcGFyc2UoJzEuYScpLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCAgbGVuZ3RoOjEgbWF0Y2g6JzEnIGNsc3M6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDoxIG1hdGNoOicuJyBjbHNzOidwdW5jdCBwcm9wZXJ0eSd9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgIGxlbmd0aDoxIG1hdGNoOidhJyBjbHNzOidwcm9wZXJ0eSd9IFxuICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBwYXJzZSgnKythJykuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDonKycgY2xzczoncHVuY3QnIHR1cmQ6JysrJ30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjEgbWF0Y2g6JysnIGNsc3M6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiAgbGVuZ3RoOjEgbWF0Y2g6J2EnIGNsc3M6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcGFyc2UoXCLilrhkb2MgJ2hlbGxvJ1wiKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MTIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCAgbGVuZ3RoOjEgbWF0Y2g6J+KWuCcgICAgIGNsc3M6J3B1bmN0IG1ldGEnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjMgbWF0Y2g6J2RvYycgICBjbHNzOidtZXRhJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjUgIGxlbmd0aDoxIG1hdGNoOlwiJ1wiICAgICBjbHNzOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjYgIGxlbmd0aDo1IG1hdGNoOlwiaGVsbG9cIiBjbHNzOidzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjExIGxlbmd0aDoxIG1hdGNoOlwiJ1wiICAgICBjbHNzOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnc3BhY2UnIC0+XG4gICAgXG4gICAgICAgIGIgPSBwYXJzZSBcInhcIlxuICAgICAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDBcbiAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiIHh4XCJcbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAxXG4gICAgICAgIFxuICAgICAgICBiID0gcGFyc2UgXCIgICAgeHh4XCJcbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgXG4gICAgICAgIGIgPSBwYXJzZSBcIiAgICB4IDEgICwgXCJcbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgICAgIGJbMF0uY2h1bmtzWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNlxuICAgICAgICBiWzBdLmNodW5rc1syXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDlcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ3N3aXRjaGVzJyAtPlxuICAgICAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICAgIFxuICAgICAgICAgICAgICAgIHlcbiAgICAgICAgICAgIGlmIDEgdGhlbiBmYWxzZVwiXCJcIlxuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICBcbiAgICAgICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICAgICAgeVxuICAgICAgICAgICAgMVwiXCJcIlxuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiXCJcIiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0ICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgMSsxICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICDilrhkb2MgJ2FnYWluJyAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvbWUgKipkb2NzKiogICAgIFxuICAgICAgICAgICAgICAgIGBgYCAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgeSAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIDFcIlwiXCJcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbN10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzhdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICBiID0gcGFyc2UgXCJcIlwiXG4gICAgICAgICAgICDilrhkb29jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICBcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBcbiAgICAgICAgYiA9IHBhcnNlIFwiXCJcIlxuICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzE7XG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIFwiXCJcIiwgJ21kJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2pzJ1xuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/test.coffee