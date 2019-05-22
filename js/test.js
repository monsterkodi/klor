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
        rgs = ranges("pos= (item, p) -> ", 'coffee');
        return inc(rgs, 0, "pos", 'function');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULE9BQUEsQ0FBUSxLQUFSLENBQWMsQ0FBQyxJQUFmLENBQUE7O0FBRUEsR0FBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCO1dBQThCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQWhCLENBQTRCO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsS0FBQSxFQUFNLEtBQWhDO0tBQTVCO0FBQTlCOztBQUNOLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixLQUFwQjtXQUE4QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBcEIsQ0FBNEI7UUFBQSxLQUFBLEVBQU0sS0FBTjtRQUFhLEtBQUEsRUFBTSxLQUFuQjtRQUEwQixLQUFBLEVBQU0sS0FBaEM7S0FBNUI7QUFBOUI7O0FBRU4sTUFBQSxHQUFVLE1BQU0sQ0FBQzs7QUFDakIsTUFBQSxHQUFVLE1BQU0sQ0FBQzs7QUFDakIsT0FBQSxHQUFVLE1BQU0sQ0FBQzs7O0FBRWpCOzs7Ozs7OztBQVFBLFFBQUEsQ0FBUyxRQUFULEVBQWtCLFNBQUE7SUFRZCxFQUFBLENBQUcsUUFBSCxFQUFZLFNBQUE7QUFDUixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxPQUFQLEVBQWUsUUFBZjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdBQVgsRUFBcUIsb0JBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVcsR0FBWCxFQUFxQixhQUFyQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFXLEdB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QUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7SUFuRVUsQ0FBZDtBQXpHYyxDQUFsQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyMjXG5cbkJsb2NrcyA9IHJlcXVpcmUgJy4vYmxvY2tzJ1xucmVxdWlyZSgna3hrJykuY2hhaSgpXG5cbmluYyA9IChyZ3MsIHN0YXJ0LCBtYXRjaCwgdmFsdWUpIC0+IHJncy5zaG91bGQuZGVlcC5pbmNsdWRlICAgICBzdGFydDpzdGFydCwgbWF0Y2g6bWF0Y2gsIHZhbHVlOnZhbHVlXG5udXQgPSAocmdzLCBzdGFydCwgbWF0Y2gsIHZhbHVlKSAtPiByZ3Muc2hvdWxkLm5vdC5kZWVwLmluY2x1ZGUgc3RhcnQ6c3RhcnQsIG1hdGNoOm1hdGNoLCB2YWx1ZTp2YWx1ZVxuXG5ibG9ja3MgID0gQmxvY2tzLmJsb2Nrc1xucmFuZ2VzICA9IEJsb2Nrcy5yYW5nZXNcbmRpc3NlY3QgPSBCbG9ja3MuZGlzc2VjdFxuICAgIFxuIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4jIyNcblxuZGVzY3JpYmUgJ3JhbmdlcycgLT5cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgaXQgJ3JlZ2V4cCcgLT5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicj0vYS9cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAyICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAzICdhJyAgICAgICAndGV4dCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDQgJy8nICAgICAgICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvKGF8Lip8XFxzXFxkXFx3XFxTXFxXJHxeXFxzKykvXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMiAnYScgICAgICAgJ3RleHQgcmVnZXhwJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi9eI2luY2x1ZGUvXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMiBcIiNcIiAgICAgICAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiaW5jbHVkZVwiICd0ZXh0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvXFxcXCdoZWxsb1xcXFwnLyBcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAxIFwiXFxcXFwiICAgICAgJ3B1bmN0IGVzY2FwZSByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDIgXCInXCIgICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMyBcImhlbGxvXCIgICAndGV4dCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiBhIC9iIC0gYy9naVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDQgJy8nICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDUgJ2InICAgICAgICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMTAgJy8nICAgICAgJ3B1bmN0IHJlZ2V4cCBlbmQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ3PWwuc3BsaXQgL1tcXFxcc1xcXFwvXS8gOyBibGFcIlxuICAgICAgICBpbmMgcmdzLCAxMCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMTQgJ1xcXFwnICAgICAgJ3B1bmN0IGVzY2FwZSByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDE3ICcvJyAgICAgICAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgaW5jIHJncywgMTkgJzsnICAgICAgICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImEgPSAxIC8gMlwiXG4gICAgICAgIGluYyByZ3MsIDYgJy8nLCAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDggJzInLCAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIigxKzEpIC8gMlwiXG4gICAgICAgIGluYyByZ3MsIDYgJy8nLCAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDggJzInLCAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbMTBdIC8gMlwiXG4gICAgICAgIGluYyByZ3MsIDYgJy8nLCAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDggJzInLCAnbnVtYmVyJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdubyByZWdleHAnIC0+XG4gICAgICAgIFxuICAgICAgICAjIGYgYSAvIGIgLSBjL2dpXG4gICAgICAgICMgZiBhL2IgLSBjL2dpXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2EgLyBiIC0gYyAvIGQnICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDIgJy8nICdwdW5jdCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzICdmIGEvYiwgYy9kJyAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCAzICcvJyAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibSA9ICcvJ1wiICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDUgJy8nICdwdW5jdCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibSBhLCAnLycnLydcIiAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA2ICcvJyAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXCJcIlxcXCJtID0gJy8nXFxcIlwiXCJcIiAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA2ICcvJyAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicyA9ICcvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwJ1wiICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDUgJy8nICdwdW5jdCByZWdleHAnXG4gICAgICAgIG51dCByZ3MsIDkgJy8nICdwdW5jdCByZWdleHAnXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3JlcXVpcmUnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJ1dGlsID0gcmVxdWlyZSAndXRpbCdcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA3ICdyZXF1aXJlJyAncmVxdWlyZSdcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnY29tbWVudHMnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJoZWxsbyAjIHdvcmxkXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNiBcIiNcIiAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgOCBcIndvcmxkXCIgJ2NvbW1lbnQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgIyBibGEgYmx1YlwiICdub29uJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiI1wiICAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgNSBcImJsYVwiICAgJ2NvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDkgXCJibHViXCIgICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiheXFxzKiNcXHMqKSguKikkXCIgJ25vb24nXG4gICAgICAgIGZvciBybmcgaW4gcmdzXG4gICAgICAgICAgICBybmcuc2hvdWxkLm5vdC5oYXZlLnByb3BlcnR5ICd2YWx1ZScgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICBpdCAndHJpcGxlIGNvbW1lbnQnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjIyNhIyMjXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDEgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMyBcImFcIiAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDQgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNiBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG5cbiAgICAgICAgZHNzID0gQmxvY2tzLmRpc3NlY3QgXCIjIyNcXG5hXFxuIyMjXCIuc3BsaXQoJ1xcbicpLCAnY29mZmVlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAwIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDIgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwIFwiYVwiICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMCBcIiNcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEgXCIjXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAyIFwiI1wiICdwdW5jdCBjb21tZW50IHRyaXBsZSdcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBcIi8qXFxuYVxcbiovXCIuc3BsaXQoJ1xcbicpLCAnc3R5bCdcbiAgICAgICAgaW5jIGRzc1swXSwgMCBcIi9cIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEgXCIqXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwIFwiYVwiICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMCBcIipcIiAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEgXCIvXCIgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBcbiAgICBpdCAnY29tbWVudCBoZWFkZXInIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjIDAgMDAgMDAwMFwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgIFwiI1wiICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCAyICBcIjBcIiAgICAnY29tbWVudCBoZWFkZXInXG4gICAgICAgIGluYyByZ3MsIDQgIFwiMDBcIiAgICdjb21tZW50IGhlYWRlcidcbiAgICAgICAgaW5jIHJncywgNyAgXCIwMDAwXCIgJ2NvbW1lbnQgaGVhZGVyJ1xuXG4gICAgICAgIGRzcyA9IEJsb2Nrcy5kaXNzZWN0IFwiIyMjXFxuIDAgMDAgMCBcXG4jIyNcIi5zcGxpdCgnXFxuJyksICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMV0sIDEgXCIwXCIgJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIi8vIDAwMFwiICdzdHlsJ1xuICAgICAgICBpbmMgcmdzLCAzICBcIjAwMFwiICAgICdjb21tZW50IGhlYWRlcidcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBcIi8qXFxuIDAgMCAwIFxcbiovXCIuc3BsaXQoJ1xcbicpLCAnc3R5bCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMSBcIjBcIiAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ251bWJlcnMnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhIDY2NzBcIlxuICAgICAgICBpbmMgcmdzLCAyIFwiNjY3MFwiICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMHg2NjdBQ1wiXG4gICAgICAgIGluYyByZ3MsIDAgXCIweDY2N0FDXCIgJ251bWJlciBoZXgnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNjYuNzAwXCJcbiAgICAgICAgaW5jIHJncywgMCBcIjY2XCIgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDIgXCIuXCIgICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAzIFwiNzAwXCIgJ251bWJlciBmbG9hdCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI3Ny44MDAgLTEwMFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCI3N1wiICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA4IFwiMTAwXCIgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIoOC45LDEwMC4yKVwiXG4gICAgICAgIGluYyByZ3MsIDMgXCI5XCIgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgOSBcIjJcIiAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzZW12ZXInIC0+ICAgIFxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiNjYuNzAuMFwiXG4gICAgICAgIGluYyByZ3MsIDAgXCI2NlwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDIgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCI3MFwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIuXCIgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDYgXCIwXCIgICdzZW12ZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXjAuNy4xXCJcbiAgICAgICAgaW5jIHJncywgMSBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzIFwiN1wiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUgXCIxXCIgJ3NlbXZlcidcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJeMS4wLjAtYWxwaGEuMTJcIlxuICAgICAgICBpbmMgcmdzLCAxIFwiMVwiICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMgXCIwXCIgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSBcIjBcIiAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ3N0cmluZ3MnIC0+XG4gICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlwiXCJhPVwiXFxcXFwiRVxcXFxcIlwiIFwiXCJcIlxuICAgICAgICBpbmMgcmdzLCAyICdcIicgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDQgJ1wiJyAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNSAnRScgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDggJ1wiJyAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cIlxcJ1hcXCdcIidcbiAgICAgICAgaW5jIHJncywgMiAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMgXCInXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNCBcIlhcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA2ICdcIicgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XFwnXCJYXCJcXCcnICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDIgXCInXCIgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgMyAnXCInICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDQgJ1gnICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCInXCIgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9YFwiWFwiYCdcbiAgICAgICAgaW5jIHJncywgMiBcImBcIiAgICdwdW5jdCBzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDMgJ1wiJyAgICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDQgJ1gnICAgJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgNiBcImBcIiAgICdwdW5jdCBzdHJpbmcgYmFja3RpY2snXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhPVwiICBcXCdYXFwnICBZICBcIiAnXG4gICAgICAgIGluYyByZ3MsIDIgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiJ1wiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDYgXCJYXCIgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNyBcIidcIiAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxMyAnXCInICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XCJcIjtiPVwiIFwiO2M9XCJYXCInXG4gICAgICAgIGZvciBpIGluIFsyIDMgNyA5IDEzIDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgJ1wiJywgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDE0ICdYJyAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYT0nJztiPScgJztjPSdZJ1wiICdjb2ZmZWUnXG4gICAgICAgIGZvciBpIGluIFsyIDMgNyA5IDEzIDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgXCInXCIsICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnWScgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImE9YGA7Yj1gIGA7Yz1gWmBcIlxuICAgICAgICBmb3IgaSBpbiBbMiAzIDcgOSAxMyAxNV1cbiAgICAgICAgICAgIGluYyByZ3MsIGksIFwiYFwiLCAncHVuY3Qgc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnWicgJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnJydcInMgPSAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCdcIicnJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiJ1wiICAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTcgXCJmaWxlXCIgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDIxIFwiLlwiICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyMiBcInR4dFwiICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjYgXCIxMFwiICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDI4IFwiJ1wiICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyOSAnXCInICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICcnJ3doZW4gJ1wiXCJcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSB0cmlwbGVcXCcnJydcbiAgICAgICAgaW5jIHJncywgNiAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNyAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgOCAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIicnJ3doZW5cXFxcJycnJ1wiXG4gICAgICAgIGluYyByZ3MsIDMgIFwid2hlblwiICAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDggIFwiJ1wiICAgICAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDExIFwiJ1wiICAgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMFxuICAgIFxuICAgIGl0ICdpbnRlcnBvbGF0aW9uJyAtPiAgICBcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIje3h4eH1cIicgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMgJ3h4eCcgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDcgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIjezY2Nn1cIicgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMgJzY2NicgJ251bWJlcidcbiAgICAgICAgaW5jIHJncywgNyAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpdCAnbWQnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIqKmJvbGQqKlwiICdtZCdcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMSAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMiAnYm9sZCcgICAndGV4dCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA2ICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA3ICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIqaXQgbGljKlwiICdtZCdcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxICdpdCcgICAgICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNCAnbGljJyAgICAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDcgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIippdGFsaWMqXCIgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEgJ2l0YWxpYycgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA3ICcqJyAgICAgICdwdW5jdCBpdGFsaWMnXG4gXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIipgaXRhbGljIGNvZGVgKlwiICdtZCdcbiAgICAgICAgaW5jIHJncywgMCAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxICdgJyAgICAgICdwdW5jdCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgMiAnaXRhbGljJyAndGV4dCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgOSAnY29kZScgICAndGV4dCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgMTQgJyonICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaXQncyBnb29kXCIgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwICdpdCcgICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAyIFwiJ1wiICAgICAgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAzICdzJyAgICAgICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgaXMgZW1wdHkgaW4gdGhlblwiICdtZCdcbiAgICAgICAgaW5jIHJncywgMCAgJ2lmJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMyAgJ2lzJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNiAgJ2VtcHR5JyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTIgJ2luJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTUgJ3RoZW4nICAndGV4dCdcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBbXCLilrhkb2MgJ21kJ1wiIFwiICAgIGlmIGlzIGVtcHR5IGluIHRoZW5cIl0sICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMV0sIDQgICdpZicgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDcgICdpcycgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDEwICAnZW1wdHknICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCAxNiAnaW4nICAgICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCAxOSAndGhlbicgICd0ZXh0J1xuICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcIi0gbGlcIiAnbWQnXG4gICAgICAgICMgaW5jIHJncywgMCAnLScgICdsaTEgbWFya2VyJ1xuICAgICAgICAjIGluYyByZ3MsIDIgJ2xpJyAnbGkxJ1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiICAgIC0gKipib2xkKipcIiAnbWQnXG4gICAgICAgICMgaW5jIHJncywgNCAnLScgICAgJ2xpMiBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgOCAnYm9sZCcgJ2xpMiBib2xkJ1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiICAgIC0gKipcIiAnbWQnXG4gICAgICAgICMgaW5jIHJncywgNCAnLScgICAgJ2xpMiBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgNiAnKicgICAgJ3B1bmN0IGxpMidcbiAgICAgICAgIyBpbmMgcmdzLCA3ICcqJyAgICAncHVuY3QgbGkyJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnY29mZmVlJyAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJjbGFzcyBNYWNybyBleHRlbmRzIENvbW1hbmRcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwICAnY2xhc3MnICAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDYgICdNYWNybycgICAnY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEyICdleHRlbmRzJyAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMjAgJ0NvbW1hbmQnICdjbGFzcydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImV4aXN0Py5wcm9wXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNyAncHJvcCcgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAaGVpZ2h0LzIgKyBAaGVpZ2h0LzZcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA4IFwiMlwiICdudW1iZXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhIGFuZCBiXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcImFcIiAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiBcImFuZFwiICdrZXl3b3JkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIGEgdGhlbiBiXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcImlmXCIgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDMgXCJhXCIgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDUgXCJ0aGVuXCIgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEwIFwiYlwiICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInN3aXRjaCBhXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcInN3aXRjaFwiICdrZXl3b3JkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIGE6IGJcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiYVwiICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm9iai52YWx1ZSA9IG9iai5hbm90aGVyLnZhbHVlXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCAgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcInZhbHVlXCIgICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTIgXCJvYmpcIiAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxNiBcImFub3RoZXJcIidwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMjQgXCJ2YWx1ZVwiICAncHJvcGVydHknXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgc29tZU9iamVjdC5zb21lUHJvcFwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJpZlwiICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzIFwic29tZU9iamVjdFwiICdvYmonXG4gICAgICAgIGluYyByZ3MsIDEzIFwiLlwiICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTQgXCJzb21lUHJvcFwiICdwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjEgJ2EnXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcIjFcIiAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbMF0ucHJvcFwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDMgJ10nICdwdW5jdCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsgZiBdXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiAnZicgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiWyBmICwgZiBdXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiAnZicgJ3RleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWy4uLjJdXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCAzICcuJyAncHVuY3QgcmFuZ2UnXG4gICAgICAgIGluYyByZ3MsIDQgJy4nICdwdW5jdCByYW5nZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWyAtMSAuLiBdXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNiAnLicgJ3B1bmN0IHJhbmdlJ1xuICAgICAgICBpbmMgcmdzLCA3ICcuJyAncHVuY3QgcmFuZ2UnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYVsxLi5uXVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDMgJy4nICdwdW5jdCByYW5nZSdcbiAgICAgICAgaW5jIHJncywgNCAnLicgJ3B1bmN0IHJhbmdlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbIC4uLi4gXVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDMgJy4nICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNCAnLicgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1ICcuJyAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDYgJy4nICdwdW5jdCdcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuICAgIGl0ICdjb2ZmZWUgZnVuY3Rpb24nIC0+XG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmIDFcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiZmZmXCIgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgJ2EnXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcImZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmICdiJ1wiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgXCJmZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmZmYgLTFcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiZmZmZlwiICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgWzFdXCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCBcImZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmZmZmZiB7MX1cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiZmZmZmZcIiAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJwb3M9IChpdGVtLCBwKSAtPiBcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwIFwicG9zXCIgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpdCAnY29mZmVlIG1ldGhvZCcgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBhOiA9PlwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDEgXCJhXCIgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiBcIjpcIiAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0IFwiPVwiICdwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA1IFwiPlwiICdwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIGE6IC0+XCIgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSBcImFcIiAnbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiOlwiICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQgXCItXCIgJ3B1bmN0IGZ1bmN0aW9uIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUgXCI+XCIgJ3B1bmN0IGZ1bmN0aW9uIGhlYWQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJtdGhkOiAgKGFyZykgICAgPT4gQG1lbWJlciBtZW1hcmdcIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwICAnbXRoZCcgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCAgJzonICAgICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDE2ICc9JyAgICAncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgaW5jIHJncywgMTcgJz4nICAgICdwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdrb2ZmZWUnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgQDogLT5cIiAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiQFwiICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIgXCI6XCIgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCBcIi1cIiAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSBcIj5cIiAncHVuY3QgZnVuY3Rpb24gaGVhZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCLilrhpZiDilrh0aGVuIOKWuGVsaWYg4pa4ZWxzZVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAgIFwi4pa4XCIgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDEgIFwiaWZcIiAgICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCA0ICBcIuKWuFwiICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCA1ICBcInRoZW5cIiAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTAgXCLilrhcIiAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTEgXCJlbGlmXCIgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDE2IFwi4pa4XCIgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDE3IFwiZWxzZVwiICdtZXRhJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsxICd4JyBhOjEgYzpkXVwiICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDEgIFwiMVwiICAgJ251bWJlcidcbiAgICAgICAgaW5jIHJncywgNCAgXCJ4XCIgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNyAgXCJhXCIgICAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIGluYyByZ3MsIDExIFwiY1wiICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICBcbiAgICBcbiAgICBpdCAncHVuY3QnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJy9zb21lXFxcXHBhdGgvZmlsZS50eHQ6MTAnICdub29uJ1xuICAgICAgICBpbmMgcmdzLCAwICAnLycgICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSAgJ1xcXFwnICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMTUgJy4nICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDE5ICc6JyAgJ3B1bmN0J1xuICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgXG4gICAgaXQgJ2h0bWwnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI8L2Rpdj5cIiAnaHRtbCcgXG4gICAgICAgIGluYyByZ3MsIDAgXCI8XCIgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEgXCIvXCIgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDIgXCJkaXZcIiAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDUgXCI+XCIgICAgJ3B1bmN0IGtleXdvcmQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiPGRpdj5cIiAnaHRtbCcgXG4gICAgICAgIGluYyByZ3MsIDAgXCI8XCIgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEgXCJkaXZcIiAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDQgXCI+XCIgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgXG4gICAgXG4gICAgaXQgJ2NwcCcgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiNpbmNsdWRlXCIgJ2NwcCcgICAgICBcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICAgICAgJ3B1bmN0IGRlZmluZSdcbiAgICAgICAgaW5jIHJncywgMSBcImluY2x1ZGVcIiAgJ2RlZmluZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjaWZcIiAnY3BwJyAgICAgICAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiI1wiICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxIFwiaWZcIiAgICAgICAnZGVmaW5lJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMgIGlmXCIgJ2NwcCcgICAgICAgICAgICBcbiAgICAgICAgaW5jIHJncywgMCBcIiNcIiAgICAgICAgJ3B1bmN0IGRlZmluZSdcbiAgICAgICAgaW5jIHJncywgMyBcImlmXCIgICAgICAgJ2RlZmluZSdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpZiAodHJ1ZSkge30gZWxzZSB7fVwiICdjcHAnICAgIFxuICAgICAgICBpbmMgcmdzLCAwIFwiaWZcIiAgICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNCBcInRydWVcIiAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEzIFwiZWxzZVwiICdrZXl3b3JkJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjEuMGZcIiAnY3BwJ1xuICAgICAgICBpbmMgcmdzLCAwIFwiMVwiICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAxIFwiLlwiICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAyIFwiMGZcIiAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjAuMDAwMGZcIiAnY3BwJ1xuICAgICAgICBpbmMgcmdzLCAyIFwiMDAwMGZcIiAnbnVtYmVyIGZsb2F0J1xuICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgICMgaXQgJ2lzcycgLT5cbiMgICAgICAgICBcbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCJhPXsja2V5fVwiICdpc3MnXG4gICAgICAgICMgaW5jIHJncywgMiAneycgICAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgMyBcIiNcIiAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCA0ICdrZXknICdwcm9wZXJ0eSB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDcgXCJ9XCIgICAncHVuY3QgcHJvcGVydHknXG4gICAgICAgIFxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAgICAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnanMnIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmdW5jID0gZnVuY3Rpb24oKSB7XCIgJ2pzJ1xuICAgICAgICBpbmMgcmdzLCAwICdmdW5jJyAnZnVuY3Rpb24nXG4gICAgICAgIGluYyByZ3MsIDcgJ2Z1bmN0aW9uJyAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzaCcgLT5cblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJkaXIvcGF0aC93aXRoL2Rhc2hlcy9maWxlLnR4dFwiICdzaCdcbiAgICAgICAgaW5jIHJncywgMCAnZGlyJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDQgJ3BhdGgnICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgOSAnd2l0aCcgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNCAnZGFzaGVzJyAndGV4dCBkaXInXG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImRpci9wYXRoLXdpdGgtZGFzaGVzL2ZpbGUudHh0XCIgJ3NoJ1xuICAgICAgICAjIGluYyByZ3MsIDAgJ2RpcicgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDQgJ3BhdGgnICdkaXIgdGV4dCdcbiAgICAgICAgIyBpbmMgcmdzLCA5ICd3aXRoJyAnZGlyIHRleHQnXG4gICAgICAgICMgaW5jIHJncywgMTQgJ2Rhc2hlcycgJ2RpciB0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicHJnIC0tYXJnMSAtYXJnMlwiICdzaCdcbiAgICAgICAgaW5jIHJncywgNCAnLScgJ3B1bmN0IGFyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCA1ICctJyAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDYgJ2FyZzEnICdhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgMTEgJy0nICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgMTIgJ2FyZzInICdhcmd1bWVudCdcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnbG9nJyAtPlxuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiaHR0cDovL2RvbWFpbi5jb21cIiAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAgJ2h0dHAnICd1cmwgcHJvdG9jb2wnXG4gICAgICAgICMgaW5jIHJncywgNCAnOicgJ3B1bmN0IHVybCdcbiAgICAgICAgIyBpbmMgcmdzLCA1ICcvJyAncHVuY3QgdXJsJ1xuICAgICAgICAjIGluYyByZ3MsIDYgJy8nICdwdW5jdCB1cmwnXG4gICAgICAgICMgaW5jIHJncywgNyAnZG9tYWluJyAndXJsIGRvbWFpbidcbiAgICAgICAgIyBpbmMgcmdzLCAxMyAnLicgJ3B1bmN0IHVybCB0bGQnXG4gICAgICAgICMgaW5jIHJncywgMTQgJ2NvbScgJ3VybCB0bGQnXG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImZpbGUuY29mZmVlXCIgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAwICdmaWxlJyAnY29mZmVlIGZpbGUnXG4gICAgICAgICMgaW5jIHJncywgNCAnLicgJ3B1bmN0IGNvZmZlZSdcbiAgICAgICAgIyBpbmMgcmdzLCA1ICdjb2ZmZWUnICdjb2ZmZWUgZXh0J1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwia2V5IC9cIiAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAgJ2tleScgICAndGV4dCdcblxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcIi9zb21lL3BhdGhcIiAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDEgJ3NvbWUnICAgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDUgJy8nICAgICAgJ3B1bmN0IGRpcidcblxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImtleTogdmFsdWVcIiAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAgJ2tleScgICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAjIGluYyByZ3MsIDMgJzonICAgICAgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ25vb24nIC0+XG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcIiAgICBwcm9wZXJ0eSAgdmFsdWVcIiAnbm9vbidcbiAgICAgICAgIyBpbmMgcmdzLCA0ICdwcm9wZXJ0eScgJ3Byb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDE0ICd2YWx1ZScgJ3RleHQnXG5cbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCIgICAgcHJvcC5lcnR5ICB2YWx1ZVwiICdub29uJ1xuICAgICAgICAjIGluYyByZ3MsIDQgJ3Byb3AnICdwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCA4ICcuJyAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgOSAnZXJ0eScgJ3Byb3BlcnR5J1xuICAgICAgICBcbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIyNcblxuZGVzY3JpYmUgJ2Jsb2NrcycgLT5cbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaXQgJ2NvbW1lbnQnIC0+XG4gICAgIFxuICAgICAgICBibG9ja3MoW1wiIyNcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50JyB0dXJkOlwiIyNcIn0gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgXG4gICAgICAgIGJsb2NrcyhbXCIsI2FcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiLFwiIHZhbHVlOidwdW5jdCcgdHVyZDogXCIsI1wifSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgbGVuZ3RoOjEgbWF0Y2g6XCJhXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdmdW5jdGlvbicgLT5cbiAgICBcbiAgICAgICAgYmxvY2tzKFsnLT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgIGJsb2NrcyhbJz0+J10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICBibG9ja3MoWydmPS0+MSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6NSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonZicgdmFsdWU6J2Z1bmN0aW9uJ30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24nICAgICAgdHVyZDonPS0+JyB9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6Jy0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDozIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ21pbmltYWwnIC0+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBibG9ja3MoWycxJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6JzEnIHZhbHVlOidudW1iZXInfSBdXVxuICAgICAgICBibG9ja3MoWydhJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOid0ZXh0J30gXV1cbiAgICAgICAgYmxvY2tzKFsnLiddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QnfSBdXVxuICAgIFxuICAgICAgICBibG9ja3MoWycxLmEnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QgcHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoyICBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3Byb3BlcnR5J30gXG4gICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGJsb2NrcyhbJysrYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOicrJyB2YWx1ZToncHVuY3QnIHR1cmQ6JysrJ30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjEgbWF0Y2g6JysnIHZhbHVlOidwdW5jdCd9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgIGxlbmd0aDoxIG1hdGNoOidhJyB2YWx1ZTondGV4dCd9IFxuICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBibG9ja3MoW1wi4pa4ZG9jICdoZWxsbydcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxMiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDon4pa4JyAgICAgdmFsdWU6J3B1bmN0IG1ldGEnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjMgbWF0Y2g6J2RvYycgICB2YWx1ZTonbWV0YSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDo1ICBsZW5ndGg6MSBtYXRjaDpcIidcIiAgICAgdmFsdWU6J3B1bmN0IHN0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NiAgbGVuZ3RoOjUgbWF0Y2g6XCJoZWxsb1wiIHZhbHVlOidzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjExIGxlbmd0aDoxIG1hdGNoOlwiJ1wiICAgICB2YWx1ZToncHVuY3Qgc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3NwYWNlJyAtPlxuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcInhcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAwXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgW1wiIHh4XCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgMVxuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBbXCIgICAgeHh4XCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcIiAgICB4IDEgICwgXCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgICAgICBiWzBdLmNodW5rc1sxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDZcbiAgICAgICAgYlswXS5jaHVua3NbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA5XG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdzd2l0Y2hlcycgLT5cbiAgICAgICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIHggICAgXG4gICAgICAgICAgICAgICAgeVxuICAgICAgICAgICAgaWYgMSB0aGVuIGZhbHNlXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICBcbiAgICAgICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICAgICAgeVxuICAgICAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCIgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbycgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdCAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIDErMSAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAg4pa4ZG9jICdhZ2FpbicgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzb21lICoqZG9jcyoqICAgICBcbiAgICAgICAgICAgICAgICBgYGAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHkgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nICAgICAgICAgICAgICAgXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls1XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzddLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls4XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAgICAgIOKWuGRvb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIHggIFxuICAgICAgICAgICAgXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAgICAgMSsxXG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzE7XG4gICAgICAgICAgICBgYGBcbiAgICAgICAgICAgIFwiXCJcIi5zcGxpdCgnXFxuJyksICdtZCdcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdqcydcbiAgICAgICAgICAgICJdfQ==
//# sourceURL=../coffee/test.coffee