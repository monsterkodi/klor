// koffee 0.43.0

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
        inc(rgs, 1, "\\", 'punct regexp');
        inc(rgs, 2, "'", 'punct regexp');
        inc(rgs, 3, "hello", 'text regexp');
        rgs = ranges("f a /b - c/gi", 'coffee');
        inc(rgs, 4, '/', 'punct regexp start');
        inc(rgs, 5, 'b', 'text regexp');
        return inc(rgs, 10, '/', 'punct regexp end');
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
        var rgs;
        rgs = ranges("hello # world", 'coffee');
        inc(rgs, 6, "#", 'punct comment');
        inc(rgs, 8, "world", 'comment');
        rgs = ranges("   # bla blub", 'noon');
        inc(rgs, 3, "#", 'punct comment');
        inc(rgs, 5, "bla", 'comment');
        inc(rgs, 9, "blub", 'comment');
        it('no comment', function() {
            var j, len, results, rng;
            rgs = ranges("(^\s*#\s*)(.*)$", 'noon');
            results = [];
            for (j = 0, len = rgs.length; j < len; j++) {
                rng = rgs[j];
                results.push(rng.should.not.have.property('value', 'comment'));
            }
            return results;
        });
        it('triple comment', function() {
            var dss;
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
            return inc(dss[2], 2, "#", 'punct comment triple');
        });
        return it('comment header', function() {
            var dss;
            rgs = ranges("# 0 00 0000", 'coffee');
            inc(rgs, 0, "#", 'punct comment');
            inc(rgs, 2, "0", 'comment header');
            inc(rgs, 4, "00", 'comment header');
            inc(rgs, 7, "0000", 'comment header');
            dss = Blocks.dissect("###\n 0 00 0 \n###".split('\n'), 'coffee');
            return inc(dss[1], 1, "0", 'comment triple header');
        });
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
        return inc(rgs, 2, 'f', 'text');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULE9BQUEsQ0FBUSxLQUFSLENBQWMsQ0FBQyxJQUFmLENBQUE7O0FBRUEsR0FBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCO1dBQThCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQWhCLENBQTRCO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsS0FBQSxFQUFNLEtBQWhDO0tBQTVCO0FBQTlCOztBQUNOLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixLQUFwQjtXQUE4QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBcEIsQ0FBNEI7UUFBQSxLQUFBLEVBQU0sS0FBTjtRQUFhLEtBQUEsRUFBTSxLQUFuQjtRQUEwQixLQUFBLEVBQU0sS0FBaEM7S0FBNUI7QUFBOUI7O0FBRU4sTUFBQSxHQUFTLE1BQU0sQ0FBQzs7QUFDaEIsTUFBQSxHQUFTLE1BQU0sQ0FBQzs7QUFDaEIsT0FBQSxHQUFVLE1BQU0sQ0FBQzs7O0FBRWpCOzs7Ozs7OztBQVFBLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7SUFRZixFQUFBLENBQUcsUUFBSCxFQUFhLFNBQUE7QUFDVCxZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxPQUFQLEVBQWdCLFFBQWhCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFnQixvQkFBaEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWdCLGFBQWhCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVks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RUFBbUMsSUFBbkM7SUFuRVcsQ0FBZjtBQXpHZSxDQUFuQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyMjXG5cbkJsb2NrcyA9IHJlcXVpcmUgJy4vYmxvY2tzJ1xucmVxdWlyZSgna3hrJykuY2hhaSgpXG5cbmluYyA9IChyZ3MsIHN0YXJ0LCBtYXRjaCwgdmFsdWUpIC0+IHJncy5zaG91bGQuZGVlcC5pbmNsdWRlICAgICBzdGFydDpzdGFydCwgbWF0Y2g6bWF0Y2gsIHZhbHVlOnZhbHVlXG5udXQgPSAocmdzLCBzdGFydCwgbWF0Y2gsIHZhbHVlKSAtPiByZ3Muc2hvdWxkLm5vdC5kZWVwLmluY2x1ZGUgc3RhcnQ6c3RhcnQsIG1hdGNoOm1hdGNoLCB2YWx1ZTp2YWx1ZVxuXG5ibG9ja3MgPSBCbG9ja3MuYmxvY2tzXG5yYW5nZXMgPSBCbG9ja3MucmFuZ2VzXG5kaXNzZWN0ID0gQmxvY2tzLmRpc3NlY3RcbiAgICBcbiMjI1xuMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuIyMjXG5cbmRlc2NyaWJlICdyYW5nZXMnLCAtPlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBpdCAncmVnZXhwJywgLT5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicj0vYS9cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiwgJy8nICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDMsICdhJyAndGV4dCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDQsICcvJyAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiLyhhfC4qfFxcc1xcZFxcd1xcU1xcVyR8XlxccyspL1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnLycgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMiwgJ2EnICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvXiNpbmNsdWRlL1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnLycgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMiwgXCIjXCIsICAgICAgICdwdW5jdCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDMsIFwiaW5jbHVkZVwiLCAndGV4dCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL1xcXFwnaGVsbG9cXFxcJy8gXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICcvJyAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAxLCBcIlxcXFxcIiwgICAgICAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcIidcIiwgICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMywgXCJoZWxsb1wiLCAgICd0ZXh0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmIGEgL2IgLSBjL2dpXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDQsICcvJyAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCA1LCAnYicgJ3RleHQgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAxMCwgJy8nICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdubyByZWdleHAnLCAtPlxuICAgICAgICBcbiAgICAgICAgIyBmIGEgLyBiIC0gYy9naVxuICAgICAgICAjIGYgYS9iIC0gYy9naVxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhIC8gYiAtIGMgLyBkJyAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCAyLCAnLycgJ3B1bmN0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ2YgYS9iLCBjL2QnICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDMsICcvJyAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibSA9ICcvJ1wiLCAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA1LCAnLycgJ3B1bmN0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJtIGEsICcvJycvJ1wiLCAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA2LCAnLycgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlwiXCJcXFwibSA9ICcvJ1xcXCJcIlwiXCIsICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDYsICcvJyAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicyA9ICcvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwJ1wiLCAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA1LCAnLycgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgbnV0IHJncywgOSwgJy8nICdwdW5jdCByZWdleHAnXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3JlcXVpcmUnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwidXRpbCA9IHJlcXVpcmUgJ3V0aWwnXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDcsICdyZXF1aXJlJyAncmVxdWlyZSdcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnY29tbWVudHMnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaGVsbG8gIyB3b3JsZFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA2LCBcIiNcIiwgICAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDgsIFwid29ybGRcIiwgJ2NvbW1lbnQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiICAgIyBibGEgYmx1YlwiLCAnbm9vbidcbiAgICAgICAgaW5jIHJncywgMywgXCIjXCIsICAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgNSwgXCJibGFcIiwgICAnY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgOSwgXCJibHViXCIsICAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgICAgICBpdCAnbm8gY29tbWVudCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJncyA9IHJhbmdlcyBcIiheXFxzKiNcXHMqKSguKikkXCIsICdub29uJ1xuICAgICAgICAgICAgZm9yIHJuZyBpbiByZ3NcbiAgICAgICAgICAgICAgICBybmcuc2hvdWxkLm5vdC5oYXZlLnByb3BlcnR5ICd2YWx1ZScgJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGl0ICd0cmlwbGUgY29tbWVudCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJncyA9IHJhbmdlcyBcIiMjI2EjIyNcIiwgJ2NvZmZlZSdcbiAgICAgICAgICAgIGluYyByZ3MsIDAsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgICAgICBpbmMgcmdzLCAxLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgaW5jIHJncywgMiwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgIGluYyByZ3MsIDMsIFwiYVwiLCAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgICAgICBpbmMgcmdzLCA0LCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgaW5jIHJncywgNSwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgIGluYyByZ3MsIDYsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgXG4gICAgICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBcIiMjI1xcbmFcXG4jIyNcIi5zcGxpdCgnXFxuJyksICdjb2ZmZWUnXG4gICAgICAgICAgICBpbmMgZHNzWzBdLCAwLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgaW5jIGRzc1swXSwgMSwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgIGluYyBkc3NbMF0sIDIsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgICAgICBpbmMgZHNzWzFdLCAwLCBcImFcIiwgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgaW5jIGRzc1syXSwgMCwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgIGluYyBkc3NbMl0sIDEsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgICAgICBpbmMgZHNzWzJdLCAyLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdjb21tZW50IGhlYWRlcicsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJncyA9IHJhbmdlcyBcIiMgMCAwMCAwMDAwXCIsICdjb2ZmZWUnXG4gICAgICAgICAgICBpbmMgcmdzLCAwLCAgXCIjXCIsICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICAgICAgaW5jIHJncywgMiwgIFwiMFwiLCAgICAnY29tbWVudCBoZWFkZXInXG4gICAgICAgICAgICBpbmMgcmdzLCA0LCAgXCIwMFwiLCAgICdjb21tZW50IGhlYWRlcidcbiAgICAgICAgICAgIGluYyByZ3MsIDcsICBcIjAwMDBcIiwgJ2NvbW1lbnQgaGVhZGVyJ1xuICAgIFxuICAgICAgICAgICAgZHNzID0gQmxvY2tzLmRpc3NlY3QgXCIjIyNcXG4gMCAwMCAwIFxcbiMjI1wiLnNwbGl0KCdcXG4nKSwgJ2NvZmZlZSdcbiAgICAgICAgICAgIGluYyBkc3NbMV0sIDEsIFwiMFwiLCAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ251bWJlcnMnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYSA2NjcwXCJcbiAgICAgICAgaW5jIHJncywgMiwgXCI2NjcwXCIsICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMHg2NjdBQ1wiXG4gICAgICAgIGluYyByZ3MsIDAsIFwiMHg2NjdBQ1wiLCAnbnVtYmVyIGhleCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI2Ni43MDBcIlxuICAgICAgICBpbmMgcmdzLCAwLCBcIjY2XCIsICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAyLCBcIi5cIiwgICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAzLCBcIjcwMFwiLCAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjc3LjgwMCAtMTAwXCJcbiAgICAgICAgaW5jIHJncywgMCwgXCI3N1wiLCAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgOCwgXCIxMDBcIiwgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIoOC45LDEwMC4yKVwiXG4gICAgICAgIGluYyByZ3MsIDMsIFwiOVwiLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA5LCBcIjJcIiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnc2VtdmVyJywgLT4gICAgXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI2Ni43MC4wXCJcbiAgICAgICAgaW5jIHJncywgMCwgXCI2NlwiLCAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcIi5cIiwgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMsIFwiNzBcIiwgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSwgXCIuXCIsICAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA2LCBcIjBcIiwgICdzZW12ZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXjAuNy4xXCJcbiAgICAgICAgaW5jIHJncywgMSwgXCIwXCIsICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMsIFwiN1wiLCAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIjFcIiwgJ3NlbXZlcidcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJeMS4wLjAtYWxwaGEuMTJcIlxuICAgICAgICBpbmMgcmdzLCAxLCBcIjFcIiwgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMywgXCIwXCIsICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUsIFwiMFwiLCAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ3N0cmluZ3MnLCAtPlxuICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJcIlwiYT1cIlxcXFxcIkVcXFxcXCJcIiBcIlwiXCJcbiAgICAgICAgaW5jIHJncywgMiwgJ1wiJyAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNCwgJ1wiJyAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNSwgJ0UnICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA4LCAnXCInICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhPVwiXFwnWFxcJ1wiJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMsIFwiJ1wiLCAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIlhcIiwgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNiwgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cXCdcIlhcIlxcJycgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiwgXCInXCIsICAgJ3B1bmN0IHN0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDMsICdcIicgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNCwgJ1gnICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDYsIFwiJ1wiLCAgICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1gXCJYXCJgJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcImBcIiwgICAncHVuY3Qgc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCAzLCAnXCInICAgJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgNCwgJ1gnICAgJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgNiwgXCJgXCIsICAgJ3B1bmN0IHN0cmluZyBiYWNrdGljaydcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJ2E9XCIgIFxcJ1hcXCcgIFkgIFwiICdcbiAgICAgICAgaW5jIHJncywgMiwgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIidcIiwgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNiwgXCJYXCIsICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDcsIFwiJ1wiLCAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxMywgJ1wiJyAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhPVwiXCI7Yj1cIiBcIjtjPVwiWFwiJ1xuICAgICAgICBmb3IgaSBpbiBbMiwzLDcsOSwxMywxNV1cbiAgICAgICAgICAgIGluYyByZ3MsIGksICdcIicgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDE0LCAnWCcgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImE9Jyc7Yj0nICc7Yz0nWSdcIiwgJ2NvZmZlZSdcbiAgICAgICAgZm9yIGkgaW4gWzIsMyw3LDksMTMsMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCBcIidcIiwgJ3B1bmN0IHN0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDE0LCAnWScgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImE9YGA7Yj1gIGA7Yz1gWmBcIlxuICAgICAgICBmb3IgaSBpbiBbMiwzLDcsOSwxMywxNV1cbiAgICAgICAgICAgIGluYyByZ3MsIGksIFwiYFwiLCAncHVuY3Qgc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCAxNCwgJ1onICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJycnXCJzID0gJy9zb21lXFxcXHBhdGgvZmlsZS50eHQ6MTAnXCInJydcbiAgICAgICAgaW5jIHJncywgNSwgXCInXCIsICAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTcsIFwiZmlsZVwiLCAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjEsIFwiLlwiLCAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjIsIFwidHh0XCIsICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjYsIFwiMTBcIiwgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjgsIFwiJ1wiLCAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMjksICdcIicgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJycnd2hlbiAnXCJcIlwiJyB0aGVuICdzdHJpbmcgZG91YmxlIHRyaXBsZVxcJycnJ1xuICAgICAgICBpbmMgcmdzLCA2LCAnXCInICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNywgJ1wiJyAgICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDgsICdcIicgICAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiJycnd2hlblxcXFwnJycnXCJcbiAgICAgICAgaW5jIHJncywgMywgIFwid2hlblwiLCAgJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA4LCAgXCInXCIsICAgICAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDExLCBcIidcIiwgICAgICdwdW5jdCBzdHJpbmcgc2luZ2xlIHRyaXBsZSdcblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgXG4gICAgaXQgJ2ludGVycG9sYXRpb24nLCAtPiAgICBcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIje3h4eH1cIicgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAzLCAneHh4JyAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNywgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIjezY2Nn1cIicgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgJ1wiJyAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAzLCAnNjY2JyAnbnVtYmVyJ1xuICAgICAgICBpbmMgcmdzLCA3LCAnXCInICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpdCAnbWQnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKipib2xkKipcIiwgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMSwgJyonICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDIsICdib2xkJyAgICd0ZXh0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDYsICcqJyAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA3LCAnKicgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKml0IGxpYypcIiwgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxLCAnaXQnICAgICAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDQsICdsaWMnICAgICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNywgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIippdGFsaWMqXCIsICdtZCdcbiAgICAgICAgaW5jIHJncywgMCwgJyonICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgMSwgJ2l0YWxpYycgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA3LCAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIqYGl0YWxpYyBjb2RlYCpcIiwgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnKicgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxLCAnYCcgICAgICAncHVuY3QgaXRhbGljIGNvZGUnXG4gICAgICAgIGluYyByZ3MsIDIsICdpdGFsaWMnICd0ZXh0IGl0YWxpYyBjb2RlJ1xuICAgICAgICBpbmMgcmdzLCA5LCAnY29kZScgICAndGV4dCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgMTQsICcqJyAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIml0J3MgZ29vZFwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICdpdCcgICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAyLCBcIidcIiwgICAgICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDMsICdzJyAgICAgICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgaXMgZW1wdHkgaW4gdGhlblwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICAnaWYnICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAzLCAgJ2lzJyAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNiwgICdlbXB0eScgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDEyLCAnaW4nICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAxNSwgJ3RoZW4nICAndGV4dCdcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBbXCLilrhkb2MgJ21kJ1wiLCBcIiAgICBpZiBpcyBlbXB0eSBpbiB0aGVuXCJdLCAnY29mZmVlJ1xuICAgICAgICBpbmMgZHNzWzFdLCA0LCAgJ2lmJyAgICAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgNywgICdpcycgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDEwLCAgJ2VtcHR5JyAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTYsICdpbicgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDE5LCAndGhlbicgICd0ZXh0J1xuICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcIi0gbGlcIiwgJ21kJ1xuICAgICAgICAjIGluYyByZ3MsIDAsICctJyAgJ2xpMSBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgMiwgJ2xpJyAnbGkxJ1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiICAgIC0gKipib2xkKipcIiwgJ21kJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICctJyAgICAnbGkyIG1hcmtlcidcbiAgICAgICAgIyBpbmMgcmdzLCA4LCAnYm9sZCcgJ2xpMiBib2xkJ1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiICAgIC0gKipcIiwgJ21kJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICctJyAgICAnbGkyIG1hcmtlcidcbiAgICAgICAgIyBpbmMgcmdzLCA2LCAnKicgICAgJ3B1bmN0IGxpMidcbiAgICAgICAgIyBpbmMgcmdzLCA3LCAnKicgICAgJ3B1bmN0IGxpMidcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2NvZmZlZScsIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImNsYXNzIE1hY3JvIGV4dGVuZHMgQ29tbWFuZFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAgJ2NsYXNzJyAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA2LCAgJ01hY3JvJyAgICdjbGFzcydcbiAgICAgICAgaW5jIHJncywgMTIsICdleHRlbmRzJyAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMjAsICdDb21tYW5kJyAnY2xhc3MnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJleGlzdD8ucHJvcFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA3LCAncHJvcCcgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJAaGVpZ2h0LzIgKyBAaGVpZ2h0LzZcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgOCwgXCIyXCIsICdudW1iZXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhIGFuZCBiXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiYVwiLCAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiwgXCJhbmRcIiwgJ2tleXdvcmQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgYSB0aGVuIGJcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJpZlwiLCAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMywgXCJhXCIsICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA1LCBcInRoZW5cIiwgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEwLCBcImJcIiwgJ3RleHQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwic3dpdGNoIGFcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJzd2l0Y2hcIiwgJ2tleXdvcmQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgYTogYlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImFcIiwgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCAyLCBcIjpcIiwgJ3B1bmN0IGRpY3Rpb25hcnknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJvYmoudmFsdWUgPSBvYmouYW5vdGhlci52YWx1ZVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAgXCJvYmpcIiwgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgNCwgIFwidmFsdWVcIiwgICdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTIsIFwib2JqXCIsICAgICdvYmonXG4gICAgICAgIGluYyByZ3MsIDE2LCBcImFub3RoZXJcIiwncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDI0LCBcInZhbHVlXCIsICAncHJvcGVydHknXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgc29tZU9iamVjdC5zb21lUHJvcFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImlmXCIsICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcInNvbWVPYmplY3RcIiwgJ29iaidcbiAgICAgICAgaW5jIHJncywgMTMsIFwiLlwiLCAncHVuY3QgcHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDE0LCBcInNvbWVQcm9wXCIsICdwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjEgJ2EnXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiMVwiLCAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImFbMF0ucHJvcFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAzLCAnXScgJ3B1bmN0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiWyBmIF1cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiwgJ2YnICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsgZiAsIGYgXVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnZicgJ3RleHQnXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiAgICBpdCAnY29mZmVlIGZ1bmN0aW9uJywgLT5cblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmZmYgMVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImZmZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiAnYSdcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJmXCIsICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmYgJ2InXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZmZcIiwgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmZiAtMVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImZmZmZcIiwgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZiBbMV1cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJmXCIsICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmZmZmIHsxfVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImZmZmZmXCIsICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInBvcz0gKGl0ZW0sIHApIC0+IFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcInBvc1wiLCAnZnVuY3Rpb24nXG4gICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGl0ICdjb2ZmZWUgbWV0aG9kJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBhOiA9PlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImFcIiwgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiwgXCI6XCIsICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiPVwiLCAncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSwgXCI+XCIsICdwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIGE6IC0+XCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiYVwiLCAnbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcIjpcIiwgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCwgXCItXCIsICdwdW5jdCBmdW5jdGlvbiB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIj5cIiwgJ3B1bmN0IGZ1bmN0aW9uIGhlYWQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJtdGhkOiAgKGFyZykgICAgPT4gQG1lbWJlciBtZW1hcmdcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgICdtdGhkJyAnbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0LCAgJzonICAgICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDE2LCAnPScgICAgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDE3LCAnPicgICAgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2tvZmZlZScsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgQDogLT5cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJAXCIsICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiOlwiLCAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIi1cIiwgJ3B1bmN0IGZ1bmN0aW9uIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiPlwiLCAncHVuY3QgZnVuY3Rpb24gaGVhZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCLilrhpZiDilrh0aGVuIOKWuGVsaWYg4pa4ZWxzZVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAgXCLilrhcIiwgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDEsICBcImlmXCIsICAgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDQsICBcIuKWuFwiLCAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgNSwgIFwidGhlblwiLCAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTAsIFwi4pa4XCIsICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxMSwgXCJlbGlmXCIsICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxNiwgXCLilrhcIiwgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDE3LCBcImVsc2VcIiwgJ21ldGEnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiWzEgJ3gnIGE6MSBjOmRdXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDEsICBcIjFcIiwgICAnbnVtYmVyJ1xuICAgICAgICBpbmMgcmdzLCA0LCAgXCJ4XCIsICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDcsICBcImFcIiwgICAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIGluYyByZ3MsIDExLCBcImNcIiwgICAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgIFxuICAgIFxuICAgIGl0ICdwdW5jdCcsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJy9zb21lXFxcXHBhdGgvZmlsZS50eHQ6MTAnICdub29uJ1xuICAgICAgICBpbmMgcmdzLCAwLCAgJy8nICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDUsICAnXFxcXCcgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAxNSwgJy4nICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDE5LCAnOicgICdwdW5jdCdcbiAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgIFxuICAgIGl0ICdodG1sJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjwvZGl2PlwiLCAnaHRtbCcgXG4gICAgICAgIGluYyByZ3MsIDAsIFwiPFwiLCAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMSwgXCIvXCIsICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcImRpdlwiLCAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiPlwiLCAgICAncHVuY3Qga2V5d29yZCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI8ZGl2PlwiLCAnaHRtbCcgXG4gICAgICAgIGluYyByZ3MsIDAsIFwiPFwiLCAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMSwgXCJkaXZcIiwgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIj5cIiwgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgXG4gICAgXG4gICAgaXQgJ2NwcCcsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjaW5jbHVkZVwiLCAnY3BwJyAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwLCBcIiNcIiwgICAgICAgICdwdW5jdCBkZWZpbmUnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiaW5jbHVkZVwiLCAgJ2RlZmluZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIjaWZcIiwgJ2NwcCcgICAgICAgICAgICBcbiAgICAgICAgaW5jIHJncywgMCwgXCIjXCIsICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImlmXCIsICAgICAgICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIyAgaWZcIiwgJ2NwcCcgICAgICAgICAgICBcbiAgICAgICAgaW5jIHJncywgMCwgXCIjXCIsICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcImlmXCIsICAgICAgICdkZWZpbmUnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgKHRydWUpIHt9IGVsc2Uge31cIiwgJ2NwcCcgICAgXG4gICAgICAgIGluYyByZ3MsIDAsIFwiaWZcIiwgICAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDQsIFwidHJ1ZVwiLCAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEzLCBcImVsc2VcIiwgJ2tleXdvcmQnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMS4wZlwiLCAnY3BwJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcIjFcIiwgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiLlwiLCAgJ3B1bmN0IG51bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMiwgXCIwZlwiLCAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjAuMDAwMGZcIiwgJ2NwcCdcbiAgICAgICAgaW5jIHJncywgMiwgXCIwMDAwZlwiLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgICMgaXQgJ2lzcycsIC0+XG4jICAgICAgICAgXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiYT17I2tleX1cIiwgJ2lzcydcbiAgICAgICAgIyBpbmMgcmdzLCAyLCAneycgICAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgMywgXCIjXCIsICAgJ3B1bmN0IHByb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDQsICdrZXknICdwcm9wZXJ0eSB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDcsIFwifVwiLCAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdqcycsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmdW5jID0gZnVuY3Rpb24oKSB7XCIsICdqcydcbiAgICAgICAgaW5jIHJncywgMCwgJ2Z1bmMnICdmdW5jdGlvbidcbiAgICAgICAgaW5jIHJncywgNywgJ2Z1bmN0aW9uJyAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzaCcsIC0+XG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZGlyL3BhdGgvd2l0aC9kYXNoZXMvZmlsZS50eHRcIiwgJ3NoJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnZGlyJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDQsICdwYXRoJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDksICd3aXRoJyAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE0LCAnZGFzaGVzJyAndGV4dCBkaXInXG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImRpci9wYXRoLXdpdGgtZGFzaGVzL2ZpbGUudHh0XCIsICdzaCdcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAnZGlyJyAnZGlyIHRleHQnXG4gICAgICAgICMgaW5jIHJncywgNCwgJ3BhdGgnICdkaXIgdGV4dCdcbiAgICAgICAgIyBpbmMgcmdzLCA5LCAnd2l0aCcgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDE0LCAnZGFzaGVzJyAnZGlyIHRleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJwcmcgLS1hcmcxIC1hcmcyXCIsICdzaCdcbiAgICAgICAgaW5jIHJncywgNCwgJy0nICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgNSwgJy0nICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgNiwgJ2FyZzEnICdhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgMTEsICctJyAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDEyLCAnYXJnMicgJ2FyZ3VtZW50J1xuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdsb2cnLCAtPlxuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiaHR0cDovL2RvbWFpbi5jb21cIiwgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAnaHR0cCcgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgIyBpbmMgcmdzLCA0LCAnOicgJ3B1bmN0IHVybCdcbiAgICAgICAgIyBpbmMgcmdzLCA1LCAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgIyBpbmMgcmdzLCA2LCAnLycgJ3B1bmN0IHVybCdcbiAgICAgICAgIyBpbmMgcmdzLCA3LCAnZG9tYWluJyAndXJsIGRvbWFpbidcbiAgICAgICAgIyBpbmMgcmdzLCAxMywgJy4nICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICAjIGluYyByZ3MsIDE0LCAnY29tJyAndXJsIHRsZCdcbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiZmlsZS5jb2ZmZWVcIiwgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAnZmlsZScgJ2NvZmZlZSBmaWxlJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICcuJyAncHVuY3QgY29mZmVlJ1xuICAgICAgICAjIGluYyByZ3MsIDUsICdjb2ZmZWUnICdjb2ZmZWUgZXh0J1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwia2V5IC9cIiwgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAna2V5JyAgICd0ZXh0J1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiL3NvbWUvcGF0aFwiLCAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDEsICdzb21lJyAgICdkaXIgdGV4dCdcbiAgICAgICAgIyBpbmMgcmdzLCA1LCAnLycgICAgICAncHVuY3QgZGlyJ1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwia2V5OiB2YWx1ZVwiLCAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAsICdrZXknICAgICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgIyBpbmMgcmdzLCAzLCAnOicgICAgICAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnbm9vbicsIC0+XG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcIiAgICBwcm9wZXJ0eSAgdmFsdWVcIiwgJ25vb24nXG4gICAgICAgICMgaW5jIHJncywgNCwgJ3Byb3BlcnR5JyAncHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgMTQsICd2YWx1ZScgJ3RleHQnXG5cbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCIgICAgcHJvcC5lcnR5ICB2YWx1ZVwiLCAnbm9vbidcbiAgICAgICAgIyBpbmMgcmdzLCA0LCAncHJvcCcgJ3Byb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDgsICcuJyAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgOSwgJ2VydHknICdwcm9wZXJ0eSdcbiAgICAgICAgXG4jIyNcbjAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgIFxuMDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgXG4wMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuIyMjXG5cbmRlc2NyaWJlICdibG9ja3MnLCAtPlxuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpdCAnY29tbWVudCcsIC0+XG4gICAgIFxuICAgICAgICBibG9ja3MoW1wiIyNcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50JyB0dXJkOlwiIyNcIn0gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgXG4gICAgICAgIGJsb2NrcyhbXCIsI2FcIl0pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOlwiLFwiIHZhbHVlOidwdW5jdCcgdHVyZDogXCIsI1wifSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgbGVuZ3RoOjEgbWF0Y2g6XCJhXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdmdW5jdGlvbicsIC0+XG4gICAgXG4gICAgICAgIGJsb2NrcyhbJy0+J10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOictJyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gdGFpbCcgdHVyZDogJy0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICBibG9ja3MoWyc9PiddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonPScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnIHR1cmQ6ICc9Pid9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGJvdW5kIGhlYWQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgYmxvY2tzKFsnZj0tPjEnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjUgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6J2YnIHZhbHVlOidmdW5jdGlvbid9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDonPScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uJyAgICAgIHR1cmQ6Jz0tPicgfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgbGVuZ3RoOjEgbWF0Y2g6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOictPid9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MyBsZW5ndGg6MSBtYXRjaDonPicgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIGhlYWQnfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjQgbGVuZ3RoOjEgbWF0Y2g6JzEnIHZhbHVlOidudW1iZXInfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdtaW5pbWFsJywgLT5cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGJsb2NrcyhbJzEnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IF1dXG4gICAgICAgIGJsb2NrcyhbJ2EnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3RleHQnfSBdXVxuICAgICAgICBibG9ja3MoWycuJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy4nIHZhbHVlOidwdW5jdCd9IF1dXG4gICAgXG4gICAgICAgIGJsb2NrcyhbJzEuYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOicxJyB2YWx1ZTonbnVtYmVyJ30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSAgbGVuZ3RoOjEgbWF0Y2g6Jy4nIHZhbHVlOidwdW5jdCBwcm9wZXJ0eSd9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjIgIGxlbmd0aDoxIG1hdGNoOidhJyB2YWx1ZToncHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgYmxvY2tzKFsnKythJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCAgbGVuZ3RoOjEgbWF0Y2g6JysnIHZhbHVlOidwdW5jdCcgdHVyZDonKysnfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MSBtYXRjaDonKycgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGJsb2NrcyhbXCLilrhkb2MgJ2hlbGxvJ1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOifilrgnICAgICB2YWx1ZToncHVuY3QgbWV0YSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MyBtYXRjaDonZG9jJyAgIHZhbHVlOidtZXRhJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjUgIGxlbmd0aDoxIG1hdGNoOlwiJ1wiICAgICB2YWx1ZToncHVuY3Qgc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDo2ICBsZW5ndGg6NSBtYXRjaDpcImhlbGxvXCIgdmFsdWU6J3N0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MTEgbGVuZ3RoOjEgbWF0Y2g6XCInXCIgICAgIHZhbHVlOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnc3BhY2UnLCAtPlxuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcInhcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAwXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgW1wiIHh4XCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgMVxuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBbXCIgICAgeHh4XCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcIiAgICB4IDEgICwgXCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgICAgICBiWzBdLmNodW5rc1sxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDZcbiAgICAgICAgYlswXS5jaHVua3NbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA5XG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdzd2l0Y2hlcycsIC0+XG4gICAgICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICAgIFxuICAgICAgICAgICAgICAgIHlcbiAgICAgICAgICAgIGlmIDEgdGhlbiBmYWxzZVwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgXG4gICAgICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgICAgIHlcbiAgICAgICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIOKWuGRvYyAnaGVsbG8nICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHQgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAxKzEgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIOKWuGRvYyAnYWdhaW4nICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgc29tZSAqKmRvY3MqKiAgICAgXG4gICAgICAgICAgICAgICAgYGBgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB5ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJyAgICAgICAgICAgICAgIFxuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls3XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbOF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgICAgICDilrhkb29jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICBcbiAgICAgICAgICAgIFwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgICAgICAgICAgMSsxO1xuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICBcIlwiXCIuc3BsaXQoJ1xcbicpLCAnbWQnXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnanMnXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../coffee/test.coffee