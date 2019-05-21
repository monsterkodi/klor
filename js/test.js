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
        rgs = ranges("m a, '/','/'", 'coffee');
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
                        value: 'punct',
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULE9BQUEsQ0FBUSxLQUFSLENBQWMsQ0FBQyxJQUFmLENBQUE7O0FBRUEsR0FBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCO1dBQThCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQWhCLENBQTRCO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsS0FBQSxFQUFNLEtBQWhDO0tBQTVCO0FBQTlCOztBQUNOLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixLQUFwQjtXQUE4QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBcEIsQ0FBNEI7UUFBQSxLQUFBLEVBQU0sS0FBTjtRQUFhLEtBQUEsRUFBTSxLQUFuQjtRQUEwQixLQUFBLEVBQU0sS0FBaEM7S0FBNUI7QUFBOUI7O0FBRU4sTUFBQSxHQUFTLE1BQU0sQ0FBQzs7QUFDaEIsTUFBQSxHQUFTLE1BQU0sQ0FBQzs7QUFDaEIsT0FBQSxHQUFVLE1BQU0sQ0FBQzs7O0FBRWpCOzs7Ozs7OztBQVFBLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7SUFRZixFQUFBLENBQUcsUUFBSCxFQUFhLFNBQUE7QUFDVCxZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQUEsQ0FBTyxPQUFQLEVBQWdCLFFBQWhCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixvQkFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLGFBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVks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QUFtQyxJQUFuQztJQW5FVyxDQUFmO0FBekdlLENBQW5CIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4gICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4gICAwMDAgICAgIDAwMCAgICAgICAgICAgIDAwMCAgICAgMDAwICAgXG4gICAwMDAgICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgXG4jIyNcblxuQmxvY2tzID0gcmVxdWlyZSAnLi9ibG9ja3MnXG5yZXF1aXJlKCdreGsnKS5jaGFpKClcblxuaW5jID0gKHJncywgc3RhcnQsIG1hdGNoLCB2YWx1ZSkgLT4gcmdzLnNob3VsZC5kZWVwLmluY2x1ZGUgICAgIHN0YXJ0OnN0YXJ0LCBtYXRjaDptYXRjaCwgdmFsdWU6dmFsdWVcbm51dCA9IChyZ3MsIHN0YXJ0LCBtYXRjaCwgdmFsdWUpIC0+IHJncy5zaG91bGQubm90LmRlZXAuaW5jbHVkZSBzdGFydDpzdGFydCwgbWF0Y2g6bWF0Y2gsIHZhbHVlOnZhbHVlXG5cbmJsb2NrcyA9IEJsb2Nrcy5ibG9ja3NcbnJhbmdlcyA9IEJsb2Nrcy5yYW5nZXNcbmRpc3NlY3QgPSBCbG9ja3MuZGlzc2VjdFxuICAgIFxuIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4jIyNcblxuZGVzY3JpYmUgJ3JhbmdlcycsIC0+XG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdyZWdleHAnLCAtPlxuICAgICAgICByZ3MgPSByYW5nZXMgXCJyPS9hL1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnLycsICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDMsICdhJywgJ3RleHQgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCA0LCAnLycsICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvKGF8Lip8XFxzXFxkXFx3XFxTXFxXJHxeXFxzKykvXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICcvJywgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMiwgJ2EnLCAndGV4dCByZWdleHAnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiL14jaW5jbHVkZS9cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgJy8nLCAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAyLCBcIiNcIiwgICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMywgXCJpbmNsdWRlXCIsICd0ZXh0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIvXFxcXCdoZWxsb1xcXFwnLyBcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgJy8nLCAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAxLCBcIlxcXFxcIiwgICAgICAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcIidcIiwgICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMywgXCJoZWxsb1wiLCAgICd0ZXh0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmIGEgL2IgLSBjL2dpXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDQsICcvJywgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgNSwgJ2InLCAndGV4dCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDEwLCAnLycsICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdubyByZWdleHAnLCAtPlxuICAgICAgICBcbiAgICAgICAgIyBmIGEgLyBiIC0gYy9naVxuICAgICAgICAjIGYgYS9iIC0gYy9naVxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzICdhIC8gYiAtIGMgLyBkJywgJ2NvZmZlZSdcbiAgICAgICAgbnV0IHJncywgMiwgJy8nLCAncHVuY3QgcmVnZXhwJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnZiBhL2IsIGMvZCcsICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDMsICcvJywgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm0gPSAnLydcIiwgJ2NvZmZlZSdcbiAgICAgICAgbnV0IHJncywgNSwgJy8nLCAncHVuY3QgcmVnZXhwJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIm0gYSwgJy8nLCcvJ1wiLCAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA2LCAnLycsICdwdW5jdCByZWdleHAnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJcIlwiXFxcIm0gPSAnLydcXFwiXCJcIlwiLCAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCA2LCAnLycsICdwdW5jdCByZWdleHAnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJzID0gJy9zb21lXFxcXHBhdGgvZmlsZS50eHQ6MTAnXCIsICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDUsICcvJywgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgbnV0IHJncywgOSwgJy8nLCAncHVuY3QgcmVnZXhwJ1xuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdyZXF1aXJlJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInV0aWwgPSByZXF1aXJlICd1dGlsJ1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA3LCAncmVxdWlyZScsICdyZXF1aXJlJ1xuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdjb21tZW50cycsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJoZWxsbyAjIHdvcmxkXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDYsIFwiI1wiLCAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgOCwgXCJ3b3JsZFwiLCAnY29tbWVudCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgICAjIGJsYSBibHViXCIsICdub29uJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcIiNcIiwgICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA1LCBcImJsYVwiLCAgICdjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA5LCBcImJsdWJcIiwgICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdubyBjb21tZW50JywgLT5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmdzID0gcmFuZ2VzIFwiKF5cXHMqI1xccyopKC4qKSRcIiwgJ25vb24nXG4gICAgICAgICAgICBmb3Igcm5nIGluIHJnc1xuICAgICAgICAgICAgICAgIHJuZy5zaG91bGQubm90LmhhdmUucHJvcGVydHkgJ3ZhbHVlJywgJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGl0ICd0cmlwbGUgY29tbWVudCcsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJncyA9IHJhbmdlcyBcIiMjI2EjIyNcIiwgJ2NvZmZlZSdcbiAgICAgICAgICAgIGluYyByZ3MsIDAsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgICAgICBpbmMgcmdzLCAxLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgaW5jIHJncywgMiwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgIGluYyByZ3MsIDMsIFwiYVwiLCAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgICAgICBpbmMgcmdzLCA0LCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgaW5jIHJncywgNSwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgIGluYyByZ3MsIDYsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgXG4gICAgICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBcIiMjI1xcbmFcXG4jIyNcIi5zcGxpdCgnXFxuJyksICdjb2ZmZWUnXG4gICAgICAgICAgICBpbmMgZHNzWzBdLCAwLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgaW5jIGRzc1swXSwgMSwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgIGluYyBkc3NbMF0sIDIsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgICAgICBpbmMgZHNzWzFdLCAwLCBcImFcIiwgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgaW5jIGRzc1syXSwgMCwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgICAgIGluYyBkc3NbMl0sIDEsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgICAgICBpbmMgZHNzWzJdLCAyLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICAgICAgXG4gICAgICAgIGl0ICdjb21tZW50IGhlYWRlcicsIC0+XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJncyA9IHJhbmdlcyBcIiMgMCAwMCAwMDAwXCIsICdjb2ZmZWUnXG4gICAgICAgICAgICBpbmMgcmdzLCAwLCAgXCIjXCIsICAgICdwdW5jdCBjb21tZW50J1xuICAgICAgICAgICAgaW5jIHJncywgMiwgIFwiMFwiLCAgICAnY29tbWVudCBoZWFkZXInXG4gICAgICAgICAgICBpbmMgcmdzLCA0LCAgXCIwMFwiLCAgICdjb21tZW50IGhlYWRlcidcbiAgICAgICAgICAgIGluYyByZ3MsIDcsICBcIjAwMDBcIiwgJ2NvbW1lbnQgaGVhZGVyJ1xuICAgIFxuICAgICAgICAgICAgZHNzID0gQmxvY2tzLmRpc3NlY3QgXCIjIyNcXG4gMCAwMCAwIFxcbiMjI1wiLnNwbGl0KCdcXG4nKSwgJ2NvZmZlZSdcbiAgICAgICAgICAgIGluYyBkc3NbMV0sIDEsIFwiMFwiLCAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ251bWJlcnMnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYSA2NjcwXCJcbiAgICAgICAgaW5jIHJncywgMiwgXCI2NjcwXCIsICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiMHg2NjdBQ1wiXG4gICAgICAgIGluYyByZ3MsIDAsIFwiMHg2NjdBQ1wiLCAnbnVtYmVyIGhleCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCI2Ni43MDBcIlxuICAgICAgICBpbmMgcmdzLCAwLCBcIjY2XCIsICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAyLCBcIi5cIiwgICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAzLCBcIjcwMFwiLCAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjc3LjgwMCAtMTAwXCJcbiAgICAgICAgaW5jIHJncywgMCwgXCI3N1wiLCAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgOCwgXCIxMDBcIiwgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIoOC45LDEwMC4yKVwiXG4gICAgICAgIGluYyByZ3MsIDMsIFwiOVwiLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA5LCBcIjJcIiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnc2VtdmVyJywgLT4gICAgXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI2Ni43MC4wXCJcbiAgICAgICAgaW5jIHJncywgMCwgXCI2NlwiLCAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcIi5cIiwgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMsIFwiNzBcIiwgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSwgXCIuXCIsICAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA2LCBcIjBcIiwgICdzZW12ZXInXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiXjAuNy4xXCJcbiAgICAgICAgaW5jIHJncywgMSwgXCIwXCIsICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMsIFwiN1wiLCAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIjFcIiwgJ3NlbXZlcidcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJeMS4wLjAtYWxwaGEuMTJcIlxuICAgICAgICBpbmMgcmdzLCAxLCBcIjFcIiwgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMywgXCIwXCIsICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUsIFwiMFwiLCAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ3N0cmluZ3MnLCAtPlxuICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJcIlwiYT1cIlxcXFxcIkVcXFxcXCJcIiBcIlwiXCJcbiAgICAgICAgaW5jIHJncywgMiwgJ1wiJywgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDQsICdcIicsICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA1LCAnRScsICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA4LCAnXCInLCAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cIlxcJ1hcXCdcIidcbiAgICAgICAgaW5jIHJncywgMiwgJ1wiJywgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMywgXCInXCIsICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiWFwiLCAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA2LCAnXCInLCAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cXCdcIlhcIlxcJycsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiJ1wiLCAgICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCAzLCAnXCInLCAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA0LCAnWCcsICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDYsIFwiJ1wiLCAgICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1gXCJYXCJgJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcImBcIiwgICAncHVuY3Qgc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCAzLCAnXCInLCAgICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDQsICdYJywgICAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCA2LCBcImBcIiwgICAncHVuY3Qgc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cIiAgXFwnWFxcJyAgWSAgXCIgJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnXCInLCAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIidcIiwgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNiwgXCJYXCIsICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDcsIFwiJ1wiLCAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxMywgJ1wiJywgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnYT1cIlwiO2I9XCIgXCI7Yz1cIlhcIidcbiAgICAgICAgZm9yIGkgaW4gWzIsMyw3LDksMTMsMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCAnXCInLCAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTQsICdYJywgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImE9Jyc7Yj0nICc7Yz0nWSdcIiwgJ2NvZmZlZSdcbiAgICAgICAgZm9yIGkgaW4gWzIsMyw3LDksMTMsMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCBcIidcIiwgJ3B1bmN0IHN0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDE0LCAnWScsICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhPWBgO2I9YCBgO2M9YFpgXCJcbiAgICAgICAgZm9yIGkgaW4gWzIsMyw3LDksMTMsMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCBcImBcIiwgJ3B1bmN0IHN0cmluZyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgMTQsICdaJywgJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnJydcInMgPSAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCdcIicnJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIidcIiwgICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxNywgXCJmaWxlXCIsICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyMSwgXCIuXCIsICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyMiwgXCJ0eHRcIiwgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyNiwgXCIxMFwiLCAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyOCwgXCInXCIsICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAyOSwgJ1wiJywgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgJycnd2hlbiAnXCJcIlwiJyB0aGVuICdzdHJpbmcgZG91YmxlIHRyaXBsZVxcJycnJ1xuICAgICAgICBpbmMgcmdzLCA2LCAnXCInLCAgICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDcsICdcIicsICAgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgOCwgJ1wiJywgICAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiJycnd2hlblxcXFwnJycnXCJcbiAgICAgICAgaW5jIHJncywgMywgIFwid2hlblwiLCAgJ3N0cmluZyBzaW5nbGUgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA4LCAgXCInXCIsICAgICAnc3RyaW5nIHNpbmdsZSB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDExLCBcIidcIiwgICAgICdwdW5jdCBzdHJpbmcgc2luZ2xlIHRyaXBsZSdcblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwXG4gICAgXG4gICAgaXQgJ2ludGVycG9sYXRpb24nLCAtPiAgICBcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnXCIje3h4eH1cIicsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICdcIicsICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMsICd4eHgnLCAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNywgJ1wiJywgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgJ1wiI3s2NjZ9XCInLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnXCInLCAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAzLCAnNjY2JywgJ251bWJlcidcbiAgICAgICAgaW5jIHJncywgNywgJ1wiJywgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcblxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGl0ICdtZCcsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIqKmJvbGQqKlwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICcqJywgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMSwgJyonLCAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnYm9sZCcsICAgJ3RleHQgYm9sZCdcbiAgICAgICAgaW5jIHJncywgNiwgJyonLCAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA3LCAnKicsICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIippdCBsaWMqXCIsICdtZCdcbiAgICAgICAgaW5jIHJncywgMCwgJyonLCAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEsICdpdCcsICAgICAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDQsICdsaWMnLCAgICAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDcsICcqJywgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiKml0YWxpYypcIiwgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnKicsICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgMSwgJ2l0YWxpYycsICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNywgJyonLCAgICAgICdwdW5jdCBpdGFsaWMnXG4gXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIipgaXRhbGljIGNvZGVgKlwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICcqJywgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxLCAnYCcsICAgICAgJ3B1bmN0IGl0YWxpYyBjb2RlJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnaXRhbGljJywgJ3RleHQgaXRhbGljIGNvZGUnXG4gICAgICAgIGluYyByZ3MsIDksICdjb2RlJywgICAndGV4dCBpdGFsaWMgY29kZSdcbiAgICAgICAgaW5jIHJncywgMTQsICcqJywgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJpdCdzIGdvb2RcIiwgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnaXQnLCAgICAgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiJ1wiLCAgICAgICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMywgJ3MnLCAgICAgICd0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiaWYgaXMgZW1wdHkgaW4gdGhlblwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICAnaWYnLCAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMywgICdpcycsICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA2LCAgJ2VtcHR5JywgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDEyLCAnaW4nLCAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTUsICd0aGVuJywgICd0ZXh0J1xuXG4gICAgICAgIGRzcyA9IEJsb2Nrcy5kaXNzZWN0IFtcIuKWuGRvYyAnbWQnXCIsIFwiICAgIGlmIGlzIGVtcHR5IGluIHRoZW5cIl0sICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMV0sIDQsICAnaWYnLCAgICAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgNywgICdpcycsICAgICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCAxMCwgICdlbXB0eScsICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCAxNiwgJ2luJywgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDE5LCAndGhlbicsICAndGV4dCdcbiAgICBcbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCItIGxpXCIsICdtZCdcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAnLScsICAnbGkxIG1hcmtlcidcbiAgICAgICAgIyBpbmMgcmdzLCAyLCAnbGknLCAnbGkxJ1xuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiICAgIC0gKipib2xkKipcIiwgJ21kJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICctJywgICAgJ2xpMiBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgOCwgJ2JvbGQnLCAnbGkyIGJvbGQnXG5cbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCIgICAgLSAqKlwiLCAnbWQnXG4gICAgICAgICMgaW5jIHJncywgNCwgJy0nLCAgICAnbGkyIG1hcmtlcidcbiAgICAgICAgIyBpbmMgcmdzLCA2LCAnKicsICAgICdwdW5jdCBsaTInXG4gICAgICAgICMgaW5jIHJncywgNywgJyonLCAgICAncHVuY3QgbGkyJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnY29mZmVlJywgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiY2xhc3MgTWFjcm8gZXh0ZW5kcyBDb21tYW5kXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICAnY2xhc3MnLCAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA2LCAgJ01hY3JvJywgICAnY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEyLCAnZXh0ZW5kcycsICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyMCwgJ0NvbW1hbmQnLCAnY2xhc3MnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJleGlzdD8ucHJvcFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA3LCAncHJvcCcsICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiQGhlaWdodC8yICsgQGhlaWdodC82XCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDgsIFwiMlwiLCAnbnVtYmVyJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiYSBhbmQgYlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImFcIiwgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiYW5kXCIsICdrZXl3b3JkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIGEgdGhlbiBiXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiaWZcIiwgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDMsIFwiYVwiLCAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNSwgXCJ0aGVuXCIsICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxMCwgXCJiXCIsICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcInN3aXRjaCBhXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwic3dpdGNoXCIsICdrZXl3b3JkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiIGE6IGJcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJhXCIsICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMiwgXCI6XCIsICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwib2JqLnZhbHVlID0gb2JqLmFub3RoZXIudmFsdWVcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgIFwib2JqXCIsICAgICdvYmonXG4gICAgICAgIGluYyByZ3MsIDQsICBcInZhbHVlXCIsICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEyLCBcIm9ialwiLCAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxNiwgXCJhbm90aGVyXCIsJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAyNCwgXCJ2YWx1ZVwiLCAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmIHNvbWVPYmplY3Quc29tZVByb3BcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJpZlwiLCAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMywgXCJzb21lT2JqZWN0XCIsICdvYmonXG4gICAgICAgIGluYyByZ3MsIDEzLCBcIi5cIiwgJ3B1bmN0IHByb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxNCwgXCJzb21lUHJvcFwiLCAncHJvcGVydHknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIxICdhJ1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcIjFcIiwgJ251bWJlcidcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJhWzBdLnByb3BcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMywgJ10nLCAncHVuY3QnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJbIGYgXVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnZicsICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIlsgZiAsIGYgXVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnZicsICd0ZXh0J1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4gICAgaXQgJ2NvZmZlZSBmdW5jdGlvbicsIC0+XG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiZmZmIDFcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJmZmZcIiwgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgJ2EnXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmICdiJ1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImZmXCIsICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImZmZmYgLTFcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJmZmZmXCIsICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImYgWzFdXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmZmZmZiB7MX1cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJmZmZmZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJwb3M9IChpdGVtLCBwKSAtPiBcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJwb3NcIiwgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpdCAnY29mZmVlIG1ldGhvZCcsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCIgYTogPT5cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJhXCIsICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiOlwiLCAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIj1cIiwgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiPlwiLCAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBhOiAtPlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImFcIiwgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiwgXCI6XCIsICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiLVwiLCAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSwgXCI+XCIsICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwibXRoZDogIChhcmcpICAgID0+IEBtZW1iZXIgbWVtYXJnXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICAnbXRoZCcsICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQsICAnOicsICAgICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDE2LCAnPScsICAgICdwdW5jdCBmdW5jdGlvbiBib3VuZCB0YWlsJ1xuICAgICAgICBpbmMgcmdzLCAxNywgJz4nLCAgICAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAna29mZmVlJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiBAOiAtPlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcIkBcIiwgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiwgXCI6XCIsICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiLVwiLCAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSwgXCI+XCIsICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIuKWuGlmIOKWuHRoZW4g4pa4ZWxpZiDilrhlbHNlXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICBcIuKWuFwiLCAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMSwgIFwiaWZcIiwgICAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgNCwgIFwi4pa4XCIsICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCA1LCAgXCJ0aGVuXCIsICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxMCwgXCLilrhcIiwgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDExLCBcImVsaWZcIiwgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDE2LCBcIuKWuFwiLCAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTcsIFwiZWxzZVwiLCAnbWV0YSdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJbMSAneCcgYToxIGM6ZF1cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgIFwiMVwiLCAgICdudW1iZXInXG4gICAgICAgIGluYyByZ3MsIDQsICBcInhcIiwgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNywgIFwiYVwiLCAgICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMTEsIFwiY1wiLCAgICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4gICAgIyAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgXG4gICAgXG4gICAgaXQgJ3B1bmN0JywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyAnL3NvbWVcXFxccGF0aC9maWxlLnR4dDoxMCcsICdub29uJ1xuICAgICAgICBpbmMgcmdzLCAwLCAgJy8nLCAgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCA1LCAgJ1xcXFwnLCAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDE1LCAnLicsICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDE5LCAnOicsICAncHVuY3QnXG4gICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICBcbiAgICAjIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgMCAwMDAgIDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDBcbiAgICBcbiAgICBpdCAnaHRtbCcsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCI8L2Rpdj5cIiwgJ2h0bWwnIFxuICAgICAgICBpbmMgcmdzLCAwLCBcIjxcIiwgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiL1wiLCAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMiwgXCJkaXZcIiwgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIj5cIiwgICAgJ3B1bmN0IGtleXdvcmQnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiPGRpdj5cIiwgJ2h0bWwnIFxuICAgICAgICBpbmMgcmdzLCAwLCBcIjxcIiwgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiZGl2XCIsICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNCwgXCI+XCIsICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgIFxuICAgIFxuICAgIGl0ICdjcHAnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2luY2x1ZGVcIiwgJ2NwcCcgICAgICBcbiAgICAgICAgaW5jIHJncywgMCwgXCIjXCIsICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImluY2x1ZGVcIiwgICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gcmFuZ2VzIFwiI2lmXCIsICdjcHAnICAgICAgICAgICAgXG4gICAgICAgIGluYyByZ3MsIDAsIFwiI1wiLCAgICAgICAgJ3B1bmN0IGRlZmluZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJpZlwiLCAgICAgICAnZGVmaW5lJ1xuXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIiMgIGlmXCIsICdjcHAnICAgICAgICAgICAgXG4gICAgICAgIGluYyByZ3MsIDAsIFwiI1wiLCAgICAgICAgJ3B1bmN0IGRlZmluZSdcbiAgICAgICAgaW5jIHJncywgMywgXCJpZlwiLCAgICAgICAnZGVmaW5lJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcImlmICh0cnVlKSB7fSBlbHNlIHt9XCIsICdjcHAnICAgIFxuICAgICAgICBpbmMgcmdzLCAwLCBcImlmXCIsICAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcInRydWVcIiwgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxMywgXCJlbHNlXCIsICdrZXl3b3JkJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IHJhbmdlcyBcIjEuMGZcIiwgJ2NwcCdcbiAgICAgICAgaW5jIHJncywgMCwgXCIxXCIsICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAxLCBcIi5cIiwgICdwdW5jdCBudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiMGZcIiwgJ251bWJlciBmbG9hdCdcblxuICAgICAgICByZ3MgPSByYW5nZXMgXCIwLjAwMDBmXCIsICdjcHAnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiMDAwMGZcIiwgJ251bWJlciBmbG9hdCdcbiAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICAjIGl0ICdpc3MnLCAtPlxuIyAgICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImE9eyNrZXl9XCIsICdpc3MnXG4gICAgICAgICMgaW5jIHJncywgMiwgJ3snLCAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCAzLCBcIiNcIiwgICAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgNCwgJ2tleScsICdwcm9wZXJ0eSB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDcsIFwifVwiLCAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdqcycsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSByYW5nZXMgXCJmdW5jID0gZnVuY3Rpb24oKSB7XCIsICdqcydcbiAgICAgICAgaW5jIHJncywgMCwgJ2Z1bmMnLCAnZnVuY3Rpb24nXG4gICAgICAgIGluYyByZ3MsIDcsICdmdW5jdGlvbicsICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NoJywgLT5cblxuICAgICAgICByZ3MgPSByYW5nZXMgXCJkaXIvcGF0aC93aXRoL2Rhc2hlcy9maWxlLnR4dFwiLCAnc2gnXG4gICAgICAgIGluYyByZ3MsIDAsICdkaXInLCAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDQsICdwYXRoJywgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA5LCAnd2l0aCcsICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgMTQsICdkYXNoZXMnLCAndGV4dCBkaXInXG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImRpci9wYXRoLXdpdGgtZGFzaGVzL2ZpbGUudHh0XCIsICdzaCdcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAnZGlyJywgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDQsICdwYXRoJywgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDksICd3aXRoJywgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDE0LCAnZGFzaGVzJywgJ2RpciB0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gcmFuZ2VzIFwicHJnIC0tYXJnMSAtYXJnMlwiLCAnc2gnXG4gICAgICAgIGluYyByZ3MsIDQsICctJywgJ3B1bmN0IGFyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCA1LCAnLScsICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgNiwgJ2FyZzEnLCAnYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDExLCAnLScsICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgMTIsICdhcmcyJywgJ2FyZ3VtZW50J1xuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdsb2cnLCAtPlxuXG4gICAgICAgICMgcmdzID0gcmFuZ2VzIFwiaHR0cDovL2RvbWFpbi5jb21cIiwgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAnaHR0cCcsICd1cmwgcHJvdG9jb2wnXG4gICAgICAgICMgaW5jIHJncywgNCwgJzonLCAncHVuY3QgdXJsJ1xuICAgICAgICAjIGluYyByZ3MsIDUsICcvJywgJ3B1bmN0IHVybCdcbiAgICAgICAgIyBpbmMgcmdzLCA2LCAnLycsICdwdW5jdCB1cmwnXG4gICAgICAgICMgaW5jIHJncywgNywgJ2RvbWFpbicsICd1cmwgZG9tYWluJ1xuICAgICAgICAjIGluYyByZ3MsIDEzLCAnLicsICdwdW5jdCB1cmwgdGxkJ1xuICAgICAgICAjIGluYyByZ3MsIDE0LCAnY29tJywgJ3VybCB0bGQnXG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImZpbGUuY29mZmVlXCIsICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCwgJ2ZpbGUnLCAnY29mZmVlIGZpbGUnXG4gICAgICAgICMgaW5jIHJncywgNCwgJy4nLCAncHVuY3QgY29mZmVlJ1xuICAgICAgICAjIGluYyByZ3MsIDUsICdjb2ZmZWUnLCAnY29mZmVlIGV4dCdcblxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImtleSAvXCIsICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCwgJ2tleScsICAgJ3RleHQnXG5cbiAgICAgICAgIyByZ3MgPSByYW5nZXMgXCIvc29tZS9wYXRoXCIsICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMSwgJ3NvbWUnLCAgICdkaXIgdGV4dCdcbiAgICAgICAgIyBpbmMgcmdzLCA1LCAnLycsICAgICAgJ3B1bmN0IGRpcidcblxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcImtleTogdmFsdWVcIiwgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAna2V5JywgICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAjIGluYyByZ3MsIDMsICc6JywgICAgICAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnbm9vbicsIC0+XG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcIiAgICBwcm9wZXJ0eSAgdmFsdWVcIiwgJ25vb24nXG4gICAgICAgICMgaW5jIHJncywgNCwgJ3Byb3BlcnR5JywgJ3Byb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDE0LCAndmFsdWUnLCAndGV4dCdcblxuICAgICAgICAjIHJncyA9IHJhbmdlcyBcIiAgICBwcm9wLmVydHkgIHZhbHVlXCIsICdub29uJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICdwcm9wJywgJ3Byb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDgsICcuJywgJ3B1bmN0IHByb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDksICdlcnR5JywgJ3Byb3BlcnR5J1xuICAgICAgICBcbiMjI1xuMDAwMDAwMCAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAgXG4wMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICBcbjAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4jIyNcblxuZGVzY3JpYmUgJ2Jsb2NrcycsIC0+XG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGl0ICdjb21tZW50JywgLT5cbiAgICAgXG4gICAgICAgIGJsb2NrcyhbXCIjI1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J3B1bmN0IGNvbW1lbnQnIHR1cmQ6XCIjI1wifSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6XCIjXCIgdmFsdWU6J2NvbW1lbnQnfSBcbiAgICAgICAgICAgICAgICAgICAgXV1cbiAgICBcbiAgICAgICAgYmxvY2tzKFtcIiwjYVwiXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6XCIsXCIgdmFsdWU6J3B1bmN0JyB0dXJkOiBcIiwjXCJ9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCd9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDpcImFcIiB2YWx1ZTonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ2Z1bmN0aW9uJywgLT5cbiAgICBcbiAgICAgICAgYmxvY2tzKFsnLT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgIGJsb2NrcyhbJz0+J10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICBibG9ja3MoWydmPS0+MSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6NSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonZicgdmFsdWU6J2Z1bmN0aW9uJ30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QnICAgICAgICAgICAgICAgdHVyZDonPS0+JyB9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6Jy0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDozIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ21pbmltYWwnLCAtPlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgYmxvY2tzKFsnMSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOicxJyB2YWx1ZTonbnVtYmVyJ30gXV1cbiAgICAgICAgYmxvY2tzKFsnYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOidhJyB2YWx1ZTondGV4dCd9IF1dXG4gICAgICAgIGJsb2NrcyhbJy4nXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonLicgdmFsdWU6J3B1bmN0J30gXV1cbiAgICBcbiAgICAgICAgYmxvY2tzKFsnMS5hJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczozIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCAgbGVuZ3RoOjEgbWF0Y2g6JzEnIHZhbHVlOidudW1iZXInfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MSBtYXRjaDonLicgdmFsdWU6J3B1bmN0IHByb3BlcnR5J30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOidwcm9wZXJ0eSd9IFxuICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBibG9ja3MoWycrK2EnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDonKycgdmFsdWU6J3B1bmN0JywgdHVyZDonKysnfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MSBtYXRjaDonKycgdmFsdWU6J3B1bmN0J30gXG4gICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOid0ZXh0J30gXG4gICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGJsb2NrcyhbXCLilrhkb2MgJ2hlbGxvJ1wiXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjEyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOifilrgnICAgICB2YWx1ZToncHVuY3QgbWV0YSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxICBsZW5ndGg6MyBtYXRjaDonZG9jJyAgIHZhbHVlOidtZXRhJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjUgIGxlbmd0aDoxIG1hdGNoOlwiJ1wiICAgICB2YWx1ZToncHVuY3Qgc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDo2ICBsZW5ndGg6NSBtYXRjaDpcImhlbGxvXCIgdmFsdWU6J3N0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MTEgbGVuZ3RoOjEgbWF0Y2g6XCInXCIgICAgIHZhbHVlOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnc3BhY2UnLCAtPlxuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcInhcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAwXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgW1wiIHh4XCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgMVxuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBbXCIgICAgeHh4XCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcIiAgICB4IDEgICwgXCJdXG4gICAgICAgIGJbMF0uY2h1bmtzWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNFxuICAgICAgICBiWzBdLmNodW5rc1sxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDZcbiAgICAgICAgYlswXS5jaHVua3NbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA5XG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdzd2l0Y2hlcycsIC0+XG4gICAgICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICAgIFxuICAgICAgICAgICAgICAgIHlcbiAgICAgICAgICAgIGlmIDEgdGhlbiBmYWxzZVwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgXG4gICAgICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0XG4gICAgICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgICAgIHlcbiAgICAgICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIOKWuGRvYyAnaGVsbG8nICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHQgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAxKzEgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIOKWuGRvYyAnYWdhaW4nICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgc29tZSAqKmRvY3MqKiAgICAgXG4gICAgICAgICAgICAgICAgYGBgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB5ICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgMVwiXCJcIi5zcGxpdCAnXFxuJyAgICAgICAgICAgICAgIFxuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzRdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbNV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzZdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls3XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbOF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgICAgICDilrhkb29jICdoZWxsbydcbiAgICAgICAgICAgICAgICB4ICBcbiAgICAgICAgICAgIFwiXCJcIi5zcGxpdCAnXFxuJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMV0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMVxuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgICAgICAgICAgMSsxO1xuICAgICAgICAgICAgYGBgXG4gICAgICAgICAgICBcIlwiXCIuc3BsaXQoJ1xcbicpLCAnbWQnXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnanMnXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../coffee/test.coffee