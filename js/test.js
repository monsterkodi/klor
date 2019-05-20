// koffee 0.43.0

/*
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000
 */
var Blocks, blocks, inc, nut;

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

describe('ranges', function() {
    it('regexp', function() {
        var rgs;
        rgs = Blocks.ranges("r=/a/", 'coffee');
        inc(rgs, 2, '/', 'punct regexp start');
        inc(rgs, 3, 'a', 'text regexp');
        inc(rgs, 4, '/', 'punct regexp end');
        rgs = Blocks.ranges("/(a|.*|\s\d\w\S\W$|^\s+)/", 'coffee');
        inc(rgs, 0, '/', 'punct regexp start');
        inc(rgs, 2, 'a', 'text regexp');
        rgs = Blocks.ranges("/^#include/", 'coffee');
        inc(rgs, 0, '/', 'punct regexp start');
        inc(rgs, 2, "#", 'punct regexp');
        inc(rgs, 3, "include", 'text regexp');
        rgs = Blocks.ranges("/\\'hello\\'/ ", 'coffee');
        inc(rgs, 0, '/', 'punct regexp start');
        inc(rgs, 1, "\\", 'punct regexp');
        inc(rgs, 2, "'", 'punct regexp');
        inc(rgs, 3, "hello", 'text regexp');
        rgs = Blocks.ranges("f a /b - c/gi", 'coffee');
        inc(rgs, 4, '/', 'punct regexp start');
        inc(rgs, 5, 'b', 'text regexp');
        return inc(rgs, 10, '/', 'punct regexp end');
    });
    it('no regexp', function() {
        var rgs;
        rgs = Blocks.ranges('a / b - c / d', 'coffee');
        nut(rgs, 2, '/', 'punct regexp');
        rgs = Blocks.ranges('f a/b, c/d', 'coffee');
        return nut(rgs, 3, '/', 'punct regexp');
    });
    it('require', function() {
        var rgs;
        rgs = Blocks.ranges("util = require 'util'", 'coffee');
        return inc(rgs, 7, 'require', 'require');
    });
    it('comments', function() {
        var rgs;
        rgs = Blocks.ranges("hello # world", 'coffee');
        inc(rgs, 6, "#", 'punct comment');
        inc(rgs, 8, "world", 'comment');
        rgs = Blocks.ranges("   # bla blub", 'noon');
        inc(rgs, 3, "#", 'punct comment');
        inc(rgs, 5, "bla", 'comment');
        return inc(rgs, 9, "blub", 'comment');
    });
    it('no comment', function() {
        var j, len, results, rgs, rng;
        rgs = Blocks.ranges("(^\s*#\s*)(.*)$", 'noon');
        results = [];
        for (j = 0, len = rgs.length; j < len; j++) {
            rng = rgs[j];
            results.push(rng.should.not.have.property('value', 'comment'));
        }
        return results;
    });
    it('triple comment', function() {
        var dss, rgs;
        rgs = Blocks.ranges("###a###", 'coffee');
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
    it('comment header', function() {
        var dss, rgs;
        rgs = Blocks.ranges("# 0 00 0000", 'coffee');
        inc(rgs, 0, "#", 'punct comment');
        inc(rgs, 2, "0", 'comment header');
        inc(rgs, 4, "00", 'comment header');
        inc(rgs, 7, "0000", 'comment header');
        dss = Blocks.dissect("###\n 0 00 0 \n###".split('\n'), 'coffee');
        return inc(dss[1], 1, "0", 'comment triple header');
    });
    it('numbers', function() {
        var rgs;
        rgs = Blocks.ranges("a 6670");
        inc(rgs, 2, "6670", 'number');
        rgs = Blocks.ranges("0x667AC");
        inc(rgs, 0, "0x667AC", 'number hex');
        rgs = Blocks.ranges("66.700");
        inc(rgs, 0, "66", 'number float');
        inc(rgs, 2, ".", 'punct number float');
        inc(rgs, 3, "700", 'number float');
        rgs = Blocks.ranges("77.800 -100");
        inc(rgs, 0, "77", 'number float');
        inc(rgs, 8, "100", 'number');
        rgs = Blocks.ranges("(8.9,100.2)");
        inc(rgs, 3, "9", 'number float');
        return inc(rgs, 9, "2", 'number float');
    });
    it('semver', function() {
        var rgs;
        rgs = Blocks.ranges("66.70.0");
        inc(rgs, 0, "66", 'semver');
        inc(rgs, 2, ".", 'punct semver');
        inc(rgs, 3, "70", 'semver');
        inc(rgs, 5, ".", 'punct semver');
        inc(rgs, 6, "0", 'semver');
        rgs = Blocks.ranges("^0.7.1");
        inc(rgs, 1, "0", 'semver');
        inc(rgs, 3, "7", 'semver');
        inc(rgs, 5, "1", 'semver');
        rgs = Blocks.ranges("^1.0.0-alpha.12");
        inc(rgs, 1, "1", 'semver');
        inc(rgs, 3, "0", 'semver');
        return inc(rgs, 5, "0", 'semver');
    });
    it('strings', function() {
        var i, j, k, l, len, len1, len2, ref, ref1, ref2, rgs;
        rgs = Blocks.ranges("a=\"\\\"E\\\"\" ");
        inc(rgs, 2, '"', 'punct string double');
        inc(rgs, 4, '"', 'string double');
        inc(rgs, 5, 'E', 'string double');
        inc(rgs, 8, '"', 'punct string double');
        rgs = Blocks.ranges('a="\'X\'"');
        inc(rgs, 2, '"', 'punct string double');
        inc(rgs, 3, "'", 'string double');
        inc(rgs, 4, "X", 'string double');
        inc(rgs, 6, '"', 'punct string double');
        rgs = Blocks.ranges('a=\'"X"\'', 'coffee');
        inc(rgs, 2, "'", 'punct string single');
        inc(rgs, 3, '"', 'string single');
        inc(rgs, 4, 'X', 'string single');
        inc(rgs, 6, "'", 'punct string single');
        rgs = Blocks.ranges('a=`"X"`');
        inc(rgs, 2, "`", 'punct string backtick');
        inc(rgs, 3, '"', 'string backtick');
        inc(rgs, 4, 'X', 'string backtick');
        inc(rgs, 6, "`", 'punct string backtick');
        rgs = Blocks.ranges('a="  \'X\'  Y  " ');
        inc(rgs, 2, '"', 'punct string double');
        inc(rgs, 5, "'", 'string double');
        inc(rgs, 6, "X", 'string double');
        inc(rgs, 7, "'", 'string double');
        inc(rgs, 13, '"', 'punct string double');
        rgs = Blocks.ranges('a="";b=" ";c="X"');
        ref = [2, 3, 7, 9, 13, 15];
        for (j = 0, len = ref.length; j < len; j++) {
            i = ref[j];
            inc(rgs, i, '"', 'punct string double');
        }
        inc(rgs, 14, 'X', 'string double');
        rgs = Blocks.ranges("a='';b=' ';c='Y'", 'coffee');
        ref1 = [2, 3, 7, 9, 13, 15];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
            i = ref1[k];
            inc(rgs, i, "'", 'punct string single');
        }
        inc(rgs, 14, 'Y', 'string single');
        rgs = Blocks.ranges("a=``;b=` `;c=`Z`");
        ref2 = [2, 3, 7, 9, 13, 15];
        for (l = 0, len2 = ref2.length; l < len2; l++) {
            i = ref2[l];
            inc(rgs, i, "`", 'punct string backtick');
        }
        return inc(rgs, 14, 'Z', 'string backtick');
    });
    it('interpolation', function() {
        var rgs;
        rgs = Blocks.ranges('"#{xxx}"', 'coffee');
        inc(rgs, 0, '"', 'punct string double');
        inc(rgs, 3, 'xxx', 'text');
        inc(rgs, 7, '"', 'punct string double');
        rgs = Blocks.ranges('"#{666}"', 'coffee');
        inc(rgs, 0, '"', 'punct string double');
        inc(rgs, 3, '666', 'number');
        return inc(rgs, 7, '"', 'punct string double');
    });
    it('md bold', function() {
        var rgs;
        rgs = Blocks.ranges("**bold**", 'md');
        inc(rgs, 0, '*', 'punct bold');
        inc(rgs, 1, '*', 'punct bold');
        inc(rgs, 2, 'bold', 'text bold');
        inc(rgs, 6, '*', 'punct bold');
        return inc(rgs, 7, '*', 'punct bold');
    });
    it('md italic', function() {
        var rgs;
        rgs = Blocks.ranges("*it lic*", 'md');
        inc(rgs, 0, '*', 'punct italic');
        inc(rgs, 1, 'it', 'text italic');
        inc(rgs, 4, 'lic', 'text italic');
        inc(rgs, 7, '*', 'punct italic');
        rgs = Blocks.ranges("*italic*", 'md');
        inc(rgs, 0, '*', 'punct italic');
        inc(rgs, 1, 'italic', 'text italic');
        inc(rgs, 7, '*', 'punct italic');
        rgs = Blocks.ranges("*`italic code`*", 'md');
        inc(rgs, 0, '*', 'punct italic');
        inc(rgs, 1, '`', 'punct italic backtick');
        inc(rgs, 2, 'italic', 'text italic backtick');
        inc(rgs, 9, 'code', 'text italic backtick');
        return inc(rgs, 14, '*', 'punct italic');
    });
    it('md no string', function() {
        var rgs;
        rgs = Blocks.ranges("it's good", 'md');
        inc(rgs, 0, 'it', 'text');
        inc(rgs, 2, "'", 'punct');
        return inc(rgs, 3, 's', 'text');
    });
    it('md no keyword', function() {
        var dss, rgs;
        rgs = Blocks.ranges("if is empty in then", 'md');
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
        rgs = Blocks.ranges("class Macro extends Command", 'coffee');
        inc(rgs, 0, 'class', 'keyword');
        inc(rgs, 6, 'Macro', 'class');
        inc(rgs, 12, 'extends', 'keyword');
        inc(rgs, 20, 'Command', 'class');
        rgs = Blocks.ranges("exist?.prop", 'coffee');
        inc(rgs, 7, 'prop', 'property');
        rgs = Blocks.ranges("@height/2 + @height/6", 'coffee');
        inc(rgs, 8, "2", 'number');
        rgs = Blocks.ranges("a and b", 'coffee');
        inc(rgs, 0, "a", 'text');
        inc(rgs, 2, "and", 'keyword');
        rgs = Blocks.ranges("if a then b", 'coffee');
        inc(rgs, 0, "if", 'keyword');
        inc(rgs, 3, "a", 'text');
        inc(rgs, 5, "then", 'keyword');
        inc(rgs, 10, "b", 'text');
        rgs = Blocks.ranges("switch a", 'coffee');
        inc(rgs, 0, "switch", 'keyword');
        rgs = Blocks.ranges(" a: b", 'coffee');
        inc(rgs, 1, "a", 'dictionary key');
        inc(rgs, 2, ":", 'punct dictionary');
        rgs = Blocks.ranges("obj.value = obj.another.value", 'coffee');
        inc(rgs, 0, "obj", 'obj');
        inc(rgs, 4, "value", 'property');
        inc(rgs, 12, "obj", 'obj');
        inc(rgs, 16, "another", 'property');
        inc(rgs, 24, "value", 'property');
        rgs = Blocks.ranges("if someObject.someProp", 'coffee');
        inc(rgs, 0, "if", 'keyword');
        inc(rgs, 3, "someObject", 'obj');
        inc(rgs, 13, ".", 'punct property');
        inc(rgs, 14, "someProp", 'property');
        rgs = Blocks.ranges("1 'a'", 'coffee');
        return inc(rgs, 0, "1", 'number');
    });
    it('coffee function', function() {
        var rgs;
        rgs = Blocks.ranges("fff 1", 'coffee');
        inc(rgs, 0, "fff", 'function call');
        rgs = Blocks.ranges("f 'a'", 'coffee');
        inc(rgs, 0, "f", 'function call');
        rgs = Blocks.ranges("ff 'b'", 'coffee');
        inc(rgs, 0, "ff", 'function call');
        rgs = Blocks.ranges("ffff -1", 'coffee');
        inc(rgs, 0, "ffff", 'function call');
        rgs = Blocks.ranges("f [1]", 'coffee');
        inc(rgs, 0, "f", 'function call');
        rgs = Blocks.ranges("fffff {1}", 'coffee');
        inc(rgs, 0, "fffff", 'function call');
        rgs = Blocks.ranges("pos= (item, p) -> ", 'coffee');
        return inc(rgs, 0, "pos", 'function');
    });
    it('coffee method', function() {
        var rgs;
        rgs = Blocks.ranges(" a: =>", 'coffee');
        inc(rgs, 1, "a", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "=", 'punct function bound tail');
        inc(rgs, 5, ">", 'punct function bound head');
        rgs = Blocks.ranges(" a: ->", 'coffee');
        inc(rgs, 1, "a", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "-", 'punct function tail');
        inc(rgs, 5, ">", 'punct function head');
        rgs = Blocks.ranges("mthd:  (arg)    => @member memarg", 'coffee');
        inc(rgs, 0, 'mthd', 'method');
        inc(rgs, 4, ':', 'punct method');
        inc(rgs, 16, '=', 'punct function bound tail');
        return inc(rgs, 17, '>', 'punct function bound head');
    });
    it('koffee', function() {
        var rgs;
        rgs = Blocks.ranges(" @: ->", 'coffee');
        inc(rgs, 1, "@", 'method');
        inc(rgs, 2, ":", 'punct method');
        inc(rgs, 4, "-", 'punct function tail');
        inc(rgs, 5, ">", 'punct function head');
        rgs = Blocks.ranges("▸if ▸then ▸elif ▸else", 'coffee');
        inc(rgs, 0, "▸", 'punct meta');
        inc(rgs, 1, "if", 'meta');
        inc(rgs, 4, "▸", 'punct meta');
        inc(rgs, 5, "then", 'meta');
        inc(rgs, 10, "▸", 'punct meta');
        inc(rgs, 11, "elif", 'meta');
        inc(rgs, 16, "▸", 'punct meta');
        inc(rgs, 17, "else", 'meta');
        rgs = Blocks.ranges("[1 'x' a:1 c:d]", 'coffee');
        inc(rgs, 1, "1", 'number');
        inc(rgs, 4, "x", 'string single');
        inc(rgs, 7, "a", 'dictionary key');
        return inc(rgs, 11, "c", 'dictionary key');
    });
    it('punct', function() {
        var rgs;
        rgs = Blocks.ranges('/some\\path/file.txt:10', 'noon');
        inc(rgs, 0, '/', 'punct');
        inc(rgs, 5, '\\', 'punct');
        inc(rgs, 15, '.', 'punct');
        return inc(rgs, 19, ':', 'punct');
    });
    it('html', function() {
        var rgs;
        rgs = Blocks.ranges("</div>", 'html');
        inc(rgs, 0, "<", 'punct keyword');
        inc(rgs, 1, "/", 'punct keyword');
        inc(rgs, 2, "div", 'keyword');
        inc(rgs, 5, ">", 'punct keyword');
        rgs = Blocks.ranges("<div>", 'html');
        inc(rgs, 0, "<", 'punct keyword');
        inc(rgs, 1, "div", 'keyword');
        return inc(rgs, 4, ">", 'punct keyword');
    });
    it('cpp define', function() {
        var rgs;
        rgs = Blocks.ranges("#include", 'cpp');
        inc(rgs, 0, "#", 'punct define');
        inc(rgs, 1, "include", 'define');
        rgs = Blocks.ranges("#if", 'cpp');
        inc(rgs, 0, "#", 'punct define');
        inc(rgs, 1, "if", 'define');
        rgs = Blocks.ranges("#  if", 'cpp');
        inc(rgs, 0, "#", 'punct define');
        return inc(rgs, 3, "if", 'define');
    });
    it('cpp keyword', function() {
        var rgs;
        rgs = Blocks.ranges("if (true) {} else {}", 'cpp');
        inc(rgs, 0, "if", 'keyword');
        inc(rgs, 4, "true", 'keyword');
        return inc(rgs, 13, "else", 'keyword');
    });
    it('cpp float', function() {
        var rgs;
        rgs = Blocks.ranges("1.0f", 'cpp');
        inc(rgs, 0, "1", 'number float');
        inc(rgs, 1, ".", 'punct number float');
        inc(rgs, 2, "0f", 'number float');
        rgs = Blocks.ranges("0.0000f", 'cpp');
        return inc(rgs, 2, "0000f", 'number float');
    });
    it('js', function() {
        var rgs;
        rgs = Blocks.ranges("func = function() {", 'js');
        inc(rgs, 0, 'func', 'function');
        return inc(rgs, 7, 'function', 'keyword function');
    });
    it('sh', function() {
        var rgs;
        rgs = Blocks.ranges("dir/path/with/dashes/file.txt", 'sh');
        inc(rgs, 0, 'dir', 'text dir');
        inc(rgs, 4, 'path', 'text dir');
        inc(rgs, 9, 'with', 'text dir');
        inc(rgs, 14, 'dashes', 'text dir');
        rgs = Blocks.ranges("prg --arg1 -arg2", 'sh');
        inc(rgs, 4, '-', 'punct argument');
        inc(rgs, 5, '-', 'punct argument');
        inc(rgs, 6, 'arg1', 'argument');
        inc(rgs, 11, '-', 'punct argument');
        return inc(rgs, 12, 'arg2', 'argument');
    });
    it('log', function() {});
    return it('noon', function() {});
});

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
        b = blocks("▸doc 'hello'\n    x    \n    y\n1".split('\n'));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULE9BQUEsQ0FBUSxLQUFSLENBQWMsQ0FBQyxJQUFmLENBQUE7O0FBRUEsR0FBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCO1dBQThCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQWhCLENBQTRCO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsS0FBQSxFQUFNLEtBQWhDO0tBQTVCO0FBQTlCOztBQUNOLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixLQUFwQjtXQUE4QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBcEIsQ0FBNEI7UUFBQSxLQUFBLEVBQU0sS0FBTjtRQUFhLEtBQUEsRUFBTSxLQUFuQjtRQUEwQixLQUFBLEVBQU0sS0FBaEM7S0FBNUI7QUFBOUI7O0FBRU4sTUFBQSxHQUFTLE1BQU0sQ0FBQzs7QUFFaEIsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQTtJQVFmLEVBQUEsQ0FBRyxRQUFILEVBQWEsU0FBQTtBQUNULFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkLEVBQXVCLFFBQXZCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixvQkFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLGFBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixrQkFBakI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYywyQkFBZCxFQUEyQyxRQUEzQztRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsb0JBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixhQUFqQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLGFBQWQsRUFBNkIsUUFBN0I7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQXVCLG9CQUF2QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBdUIsY0FBdkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxTQUFaLEVBQXVCLGFBQXZCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsZ0JBQWQsRUFBZ0MsUUFBaEM7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQXVCLG9CQUF2QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLElBQVosRUFBdUIsY0FBdkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQXVCLGNBQXZCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksT0FBWixFQUF1QixhQUF2QjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLGVBQWQsRUFBK0IsUUFBL0I7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLG9CQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsYUFBakI7ZUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxHQUFiLEVBQWtCLGtCQUFsQjtJQXhCUyxDQUFiO0lBMEJBLEVBQUEsQ0FBRyxXQUFILEVBQWdCLFNBQUE7QUFLWixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsZUFBZCxFQUErQixRQUEvQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsY0FBakI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxZQUFkLEVBQTRCLFFBQTVCO2VBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixjQUFqQjtJQVRZLENBQWhCO0lBaUJBLEVBQUEsQ0FBRyxTQUFILEVBQWMsU0FBQTtBQUVWLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyx1QkFBZCxFQUF1QyxRQUF2QztlQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLFNBQVosRUFBdUIsU0FBdkI7SUFIVSxDQUFkO0lBV0EsRUFBQSxDQUFHLFVBQUgsRUFBZSxTQUFBO0FBRVgsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLGVBQWQsRUFBK0IsUUFBL0I7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQW9CLGVBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksT0FBWixFQUFxQixTQUFyQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLGVBQWQsRUFBK0IsTUFBL0I7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQXFCLGVBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksS0FBWixFQUFxQixTQUFyQjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLE1BQVosRUFBcUIsU0FBckI7SUFUVyxDQUFmO0lBV0EsRUFBQSxDQUFHLFlBQUgsRUFBaUIsU0FBQTtBQUViLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxpQkFBZCxFQUFpQyxNQUFqQztBQUNOO2FBQUEscUNBQUE7O3lCQUNJLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFwQixDQUE2QixPQUE3QixFQUFzQyxTQUF0QztBQURKOztJQUhhLENBQWpCO0lBTUEsRUFBQSxDQUFHLGdCQUFILEVBQXFCLFNBQUE7QUFFakIsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLFNBQWQsRUFBeUIsUUFBekI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLHNCQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsc0JBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixzQkFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLGdCQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsc0JBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixzQkFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLHNCQUFqQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsT0FBUCxDQUFlLGFBQWEsQ0FBQyxLQUFkLENBQW9CLElBQXBCLENBQWYsRUFBMEMsUUFBMUM7UUFDTixHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBZSxHQUFmLEVBQW9CLHNCQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFlLEdBQWYsRUFBb0Isc0JBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFaLEVBQWUsR0FBZixFQUFvQixzQkFBcEI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBZSxHQUFmLEVBQW9CLGdCQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFlLEdBQWYsRUFBb0Isc0JBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQVIsRUFBWSxDQUFaLEVBQWUsR0FBZixFQUFvQixzQkFBcEI7ZUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBZSxHQUFmLEVBQW9CLHNCQUFwQjtJQWxCaUIsQ0FBckI7SUFvQkEsRUFBQSxDQUFHLGdCQUFILEVBQXFCLFNBQUE7QUFFakIsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLGFBQWQsRUFBNkIsUUFBN0I7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBYSxHQUFiLEVBQXFCLGVBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQWEsR0FBYixFQUFxQixnQkFBckI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBYSxJQUFiLEVBQXFCLGdCQUFyQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFhLE1BQWIsRUFBcUIsZ0JBQXJCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxPQUFQLENBQWUsb0JBQW9CLENBQUMsS0FBckIsQ0FBMkIsSUFBM0IsQ0FBZixFQUFpRCxRQUFqRDtlQUNOLEdBQUEsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBWixFQUFlLEdBQWYsRUFBb0IsdUJBQXBCO0lBVGlCLENBQXJCO0lBaUJBLEVBQUEsQ0FBRyxTQUFILEVBQWMsU0FBQTtBQUVWLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxRQUFkO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksTUFBWixFQUFvQixRQUFwQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLFNBQWQ7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxTQUFaLEVBQXVCLFlBQXZCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsUUFBZDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLElBQVosRUFBbUIsY0FBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQW1CLG9CQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEtBQVosRUFBbUIsY0FBbkI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxhQUFkO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksSUFBWixFQUFtQixjQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEtBQVosRUFBbUIsUUFBbkI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxhQUFkO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixjQUFqQjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsY0FBakI7SUFuQlUsQ0FBZDtJQTJCQSxFQUFBLENBQUcsUUFBSCxFQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsU0FBZDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLElBQVosRUFBa0IsUUFBbEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWtCLGNBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksSUFBWixFQUFrQixRQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBa0IsY0FBbEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWtCLFFBQWxCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsUUFBZDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsUUFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLFFBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixRQUFqQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLGlCQUFkO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixRQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsUUFBakI7ZUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLFFBQWpCO0lBakJTLENBQWI7SUF5QkEsRUFBQSxDQUFHLFNBQUgsRUFBYyxTQUFBO0FBRVYsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLGtCQUFkO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFvQixxQkFBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQW9CLGVBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFvQixlQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBb0IscUJBQXBCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsV0FBZDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIscUJBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFtQixlQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIsZUFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQW1CLHFCQUFuQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLFdBQWQsRUFBMkIsUUFBM0I7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQW1CLHFCQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIsZUFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQW1CLGVBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFtQixxQkFBbkI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxTQUFkO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFtQix1QkFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQW1CLGlCQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIsaUJBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFtQix1QkFBbkI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxtQkFBZDtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIscUJBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFtQixlQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIsZUFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQW1CLGVBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsR0FBYixFQUFtQixxQkFBbkI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxrQkFBZDtBQUNOO0FBQUEsYUFBQSxxQ0FBQTs7WUFDSSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLHFCQUFqQjtBQURKO1FBRUEsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsR0FBYixFQUFrQixlQUFsQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLGtCQUFkLEVBQWtDLFFBQWxDO0FBQ047QUFBQSxhQUFBLHdDQUFBOztZQUNJLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIscUJBQWpCO0FBREo7UUFFQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxHQUFiLEVBQWtCLGVBQWxCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsa0JBQWQ7QUFDTjtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQix1QkFBakI7QUFESjtlQUVBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFhLEdBQWIsRUFBa0IsaUJBQWxCO0lBOUNVLENBQWQ7SUFzREEsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQTtBQUVoQixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsVUFBZCxFQUEwQixRQUExQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIscUJBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksS0FBWixFQUFtQixNQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIscUJBQW5CO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsVUFBZCxFQUEwQixRQUExQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIscUJBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksS0FBWixFQUFtQixRQUFuQjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBbUIscUJBQW5CO0lBVmdCLENBQXBCO0lBa0JBLEVBQUEsQ0FBRyxTQUFILEVBQWMsU0FBQTtBQUVWLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxVQUFkLEVBQTBCLElBQTFCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFzQixZQUF0QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBc0IsWUFBdEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxNQUFaLEVBQXNCLFdBQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFzQixZQUF0QjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBc0IsWUFBdEI7SUFQVSxDQUFkO0lBU0EsRUFBQSxDQUFHLFdBQUgsRUFBZ0IsU0FBQTtBQUVaLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxVQUFkLEVBQTBCLElBQTFCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFzQixjQUF0QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLElBQVosRUFBc0IsYUFBdEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxLQUFaLEVBQXNCLGFBQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFzQixjQUF0QjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLFVBQWQsRUFBMEIsSUFBMUI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQXNCLGNBQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksUUFBWixFQUFzQixhQUF0QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBc0IsY0FBdEI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxpQkFBZCxFQUFpQyxJQUFqQztRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBc0IsY0FBdEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQXNCLHVCQUF0QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLFFBQVosRUFBc0Isc0JBQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksTUFBWixFQUFzQixzQkFBdEI7ZUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxHQUFiLEVBQXNCLGNBQXRCO0lBbEJZLENBQWhCO0lBb0JBLEVBQUEsQ0FBRyxjQUFILEVBQW1CLFNBQUE7QUFFZixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsV0FBZCxFQUEyQixJQUEzQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLElBQVosRUFBc0IsTUFBdEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQXNCLE9BQXRCO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFzQixNQUF0QjtJQUxlLENBQW5CO0lBT0EsRUFBQSxDQUFHLGVBQUgsRUFBb0IsU0FBQTtBQUVoQixZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMscUJBQWQsRUFBcUMsSUFBckM7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBYSxJQUFiLEVBQXNCLE1BQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQWEsSUFBYixFQUFzQixNQUF0QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFhLE9BQWIsRUFBc0IsTUFBdEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxJQUFiLEVBQXNCLE1BQXRCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsTUFBYixFQUFzQixNQUF0QjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsT0FBUCxDQUFlLENBQUMsV0FBRCxFQUFjLHlCQUFkLENBQWYsRUFBeUQsUUFBekQ7UUFDTixHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBZ0IsSUFBaEIsRUFBeUIsTUFBekI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQVosRUFBZ0IsSUFBaEIsRUFBeUIsTUFBekI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLEVBQVosRUFBaUIsT0FBakIsRUFBMEIsTUFBMUI7UUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLEVBQVosRUFBZ0IsSUFBaEIsRUFBeUIsTUFBekI7ZUFDQSxHQUFBLENBQUksR0FBSSxDQUFBLENBQUEsQ0FBUixFQUFZLEVBQVosRUFBZ0IsTUFBaEIsRUFBeUIsTUFBekI7SUFkZ0IsQ0FBcEI7SUFxQ0EsRUFBQSxDQUFHLFFBQUgsRUFBYSxTQUFBO0FBRVQsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLDZCQUFkLEVBQTZDLFFBQTdDO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQWEsT0FBYixFQUF3QixTQUF4QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFhLE9BQWIsRUFBd0IsT0FBeEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxTQUFiLEVBQXdCLFNBQXhCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsU0FBYixFQUF3QixPQUF4QjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLGFBQWQsRUFBNkIsUUFBN0I7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxNQUFaLEVBQW9CLFVBQXBCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsdUJBQWQsRUFBdUMsUUFBdkM7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLFFBQWpCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsU0FBZCxFQUF5QixRQUF6QjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsTUFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxLQUFaLEVBQW1CLFNBQW5CO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsYUFBZCxFQUE2QixRQUE3QjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLElBQVosRUFBa0IsU0FBbEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLE1BQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksTUFBWixFQUFvQixTQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFhLEdBQWIsRUFBa0IsTUFBbEI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxVQUFkLEVBQTBCLFFBQTFCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksUUFBWixFQUFzQixTQUF0QjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLE9BQWQsRUFBdUIsUUFBdkI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLGdCQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsa0JBQWpCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsK0JBQWQsRUFBK0MsUUFBL0M7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBYSxLQUFiLEVBQXVCLEtBQXZCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQWEsT0FBYixFQUF1QixVQUF2QjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFhLEtBQWIsRUFBdUIsS0FBdkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxTQUFiLEVBQXVCLFVBQXZCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsT0FBYixFQUF1QixVQUF2QjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLHdCQUFkLEVBQXdDLFFBQXhDO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksSUFBWixFQUFrQixTQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLFlBQVosRUFBMEIsS0FBMUI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxHQUFiLEVBQWtCLGdCQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFhLFVBQWIsRUFBeUIsVUFBekI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkLEVBQXVCLFFBQXZCO2VBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixRQUFqQjtJQTdDUyxDQUFiO0lBcURBLEVBQUEsQ0FBRyxpQkFBSCxFQUFzQixTQUFBO0FBRWxCLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkLEVBQXVCLFFBQXZCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksS0FBWixFQUFtQixlQUFuQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLE9BQWQsRUFBdUIsUUFBdkI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLGVBQWpCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsUUFBZCxFQUF3QixRQUF4QjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLElBQVosRUFBa0IsZUFBbEI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxTQUFkLEVBQXlCLFFBQXpCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksTUFBWixFQUFvQixlQUFwQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLE9BQWQsRUFBdUIsUUFBdkI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLGVBQWpCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsV0FBZCxFQUEyQixRQUEzQjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLE9BQVosRUFBcUIsZUFBckI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxvQkFBZCxFQUFvQyxRQUFwQztlQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEtBQVosRUFBbUIsVUFBbkI7SUFyQmtCLENBQXRCO0lBNkJBLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFNBQUE7QUFFaEIsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLFFBQWQsRUFBd0IsUUFBeEI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLFFBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixjQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsMkJBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQiwyQkFBakI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxRQUFkLEVBQXdCLFFBQXhCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixRQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsY0FBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLHFCQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIscUJBQWpCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsbUNBQWQsRUFBbUQsUUFBbkQ7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBYSxNQUFiLEVBQXFCLFFBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQWEsR0FBYixFQUFxQixjQUFyQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFhLEdBQWIsRUFBcUIsMkJBQXJCO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsR0FBYixFQUFxQiwyQkFBckI7SUFsQmdCLENBQXBCO0lBMEJBLEVBQUEsQ0FBRyxRQUFILEVBQWEsU0FBQTtBQUVULFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxRQUFkLEVBQXdCLFFBQXhCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixRQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsY0FBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLHFCQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIscUJBQWpCO1FBRUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsdUJBQWQsRUFBdUMsUUFBdkM7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBYSxHQUFiLEVBQXFCLFlBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQWEsSUFBYixFQUFxQixNQUFyQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFhLEdBQWIsRUFBcUIsWUFBckI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBYSxNQUFiLEVBQXFCLE1BQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsR0FBYixFQUFxQixZQUFyQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFhLE1BQWIsRUFBcUIsTUFBckI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxHQUFiLEVBQXFCLFlBQXJCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsTUFBYixFQUFxQixNQUFyQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLGlCQUFkLEVBQWlDLFFBQWpDO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQWEsR0FBYixFQUFvQixRQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFhLEdBQWIsRUFBb0IsZUFBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBYSxHQUFiLEVBQW9CLGdCQUFwQjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFhLEdBQWIsRUFBb0IsZ0JBQXBCO0lBdEJTLENBQWI7SUE4QkEsRUFBQSxDQUFHLE9BQUgsRUFBWSxTQUFBO0FBRVIsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLHlCQUFkLEVBQXlDLE1BQXpDO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQWEsR0FBYixFQUFtQixPQUFuQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFhLElBQWIsRUFBbUIsT0FBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxHQUFiLEVBQW1CLE9BQW5CO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsR0FBYixFQUFtQixPQUFuQjtJQU5RLENBQVo7SUFjQSxFQUFBLENBQUcsTUFBSCxFQUFXLFNBQUE7QUFFUCxZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsUUFBZCxFQUF3QixNQUF4QjtRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBb0IsZUFBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQW9CLGVBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksS0FBWixFQUFvQixTQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBb0IsZUFBcEI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkLEVBQXVCLE1BQXZCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFvQixlQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEtBQVosRUFBb0IsU0FBcEI7ZUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQW9CLGVBQXBCO0lBWE8sQ0FBWDtJQW1CQSxFQUFBLENBQUcsWUFBSCxFQUFpQixTQUFBO0FBRWIsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLFVBQWQsRUFBMEIsS0FBMUI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQXdCLGNBQXhCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksU0FBWixFQUF3QixRQUF4QjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLEtBQWQsRUFBcUIsS0FBckI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQXdCLGNBQXhCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksSUFBWixFQUF3QixRQUF4QjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLE9BQWQsRUFBdUIsS0FBdkI7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQXdCLGNBQXhCO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksSUFBWixFQUF3QixRQUF4QjtJQVphLENBQWpCO0lBY0EsRUFBQSxDQUFHLGFBQUgsRUFBa0IsU0FBQTtBQUVkLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxzQkFBZCxFQUFzQyxLQUF0QztRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLElBQVosRUFBcUIsU0FBckI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxNQUFaLEVBQXFCLFNBQXJCO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsTUFBYixFQUFxQixTQUFyQjtJQUxjLENBQWxCO0lBYUEsRUFBQSxDQUFHLFdBQUgsRUFBZ0IsU0FBQTtBQUVaLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxNQUFkLEVBQXNCLEtBQXRCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFrQixjQUFsQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBa0Isb0JBQWxCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksSUFBWixFQUFrQixjQUFsQjtRQUVBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLFNBQWQsRUFBeUIsS0FBekI7ZUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxPQUFaLEVBQXFCLGNBQXJCO0lBUlksQ0FBaEI7SUE4QkEsRUFBQSxDQUFHLElBQUgsRUFBUyxTQUFBO0FBRUwsWUFBQTtRQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsTUFBUCxDQUFjLHFCQUFkLEVBQXFDLElBQXJDO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksTUFBWixFQUFvQixVQUFwQjtlQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLFVBQVosRUFBd0Isa0JBQXhCO0lBSkssQ0FBVDtJQVlBLEVBQUEsQ0FBRyxJQUFILEVBQVMsU0FBQTtBQUVMLFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYywrQkFBZCxFQUErQyxJQUEvQztRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEtBQVosRUFBbUIsVUFBbkI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxNQUFaLEVBQW9CLFVBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksTUFBWixFQUFvQixVQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFhLFFBQWIsRUFBdUIsVUFBdkI7UUFRQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxrQkFBZCxFQUFrQyxJQUFsQztRQUNOLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsZ0JBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixnQkFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxNQUFaLEVBQW9CLFVBQXBCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsR0FBYixFQUFrQixnQkFBbEI7ZUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxNQUFiLEVBQXFCLFVBQXJCO0lBbkJLLENBQVQ7SUEyQkEsRUFBQSxDQUFHLEtBQUgsRUFBVSxTQUFBLEdBQUEsQ0FBVjtXQWlDQSxFQUFBLENBQUcsTUFBSCxFQUFXLFNBQUEsR0FBQSxDQUFYO0FBcm1CZSxDQUFuQjs7QUFnbkJBLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUE7SUFFZixFQUFBLENBQUcsU0FBSCxFQUFjLFNBQUE7UUFFVixNQUFBLENBQU8sQ0FBQyxJQUFELENBQVAsQ0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUF0QixDQUEwQjtZQUFDO2dCQUFBLEdBQUEsRUFBSSxRQUFKO2dCQUFhLEtBQUEsRUFBTSxDQUFuQjtnQkFBcUIsS0FBQSxFQUFNLENBQTNCO2dCQUE2QixNQUFBLEVBQU8sQ0FBcEM7Z0JBQXNDLE1BQUEsRUFBTztvQkFDNUQ7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVMsTUFBQSxFQUFPLENBQWhCO3dCQUFrQixLQUFBLEVBQU0sR0FBeEI7d0JBQTRCLEtBQUEsRUFBTSxlQUFsQzt3QkFBa0QsSUFBQSxFQUFLLElBQXZEO3FCQUQ0RCxFQUU1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLFNBQWxDO3FCQUY0RDtpQkFBN0M7YUFBRDtTQUExQjtlQUtBLE1BQUEsQ0FBTyxDQUFDLEtBQUQsQ0FBUCxDQUFlLENBQUMsTUFBTSxDQUFDLEdBQXZCLENBQTJCO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLENBQW5CO2dCQUFxQixLQUFBLEVBQU0sQ0FBM0I7Z0JBQTZCLE1BQUEsRUFBTyxDQUFwQztnQkFBc0MsTUFBQSxFQUFPO29CQUM3RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLE9BQWxDO3dCQUEwQyxJQUFBLEVBQU0sSUFBaEQ7cUJBRDZELEVBRTdEO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFTLE1BQUEsRUFBTyxDQUFoQjt3QkFBa0IsS0FBQSxFQUFNLEdBQXhCO3dCQUE0QixLQUFBLEVBQU0sZUFBbEM7cUJBRjZELEVBRzdEO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFTLE1BQUEsRUFBTyxDQUFoQjt3QkFBa0IsS0FBQSxFQUFNLEdBQXhCO3dCQUE0QixLQUFBLEVBQU0sU0FBbEM7cUJBSDZEO2lCQUE3QzthQUFEO1NBQTNCO0lBUFUsQ0FBZDtJQWFBLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQTtRQUVYLE1BQUEsQ0FBTyxDQUFDLElBQUQsQ0FBUCxDQUFjLENBQUMsTUFBTSxDQUFDLEdBQXRCLENBQTBCO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLENBQW5CO2dCQUFxQixLQUFBLEVBQU0sQ0FBM0I7Z0JBQTZCLE1BQUEsRUFBTyxDQUFwQztnQkFBc0MsTUFBQSxFQUFPO29CQUM1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLHFCQUFsQzt3QkFBd0QsSUFBQSxFQUFNLElBQTlEO3FCQUQ0RCxFQUU1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLHFCQUFsQztxQkFGNEQ7aUJBQTdDO2FBQUQ7U0FBMUI7UUFJQSxNQUFBLENBQU8sQ0FBQyxJQUFELENBQVAsQ0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUF0QixDQUEwQjtZQUFDO2dCQUFBLEdBQUEsRUFBSSxRQUFKO2dCQUFhLEtBQUEsRUFBTSxDQUFuQjtnQkFBcUIsS0FBQSxFQUFNLENBQTNCO2dCQUE2QixNQUFBLEVBQU8sQ0FBcEM7Z0JBQXNDLE1BQUEsRUFBTztvQkFDNUQ7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVMsTUFBQSxFQUFPLENBQWhCO3dCQUFrQixLQUFBLEVBQU0sR0FBeEI7d0JBQTRCLEtBQUEsRUFBTSwyQkFBbEM7d0JBQThELElBQUEsRUFBTSxJQUFwRTtxQkFENEQsRUFFNUQ7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVMsTUFBQSxFQUFPLENBQWhCO3dCQUFrQixLQUFBLEVBQU0sR0FBeEI7d0JBQTRCLEtBQUEsRUFBTSwyQkFBbEM7cUJBRjREO2lCQUE3QzthQUFEO1NBQTFCO2VBSUEsTUFBQSxDQUFPLENBQUMsT0FBRCxDQUFQLENBQWlCLENBQUMsTUFBTSxDQUFDLEdBQXpCLENBQTZCO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLENBQW5CO2dCQUFxQixLQUFBLEVBQU0sQ0FBM0I7Z0JBQTZCLE1BQUEsRUFBTyxDQUFwQztnQkFBc0MsTUFBQSxFQUFPO29CQUMvRDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLFVBQWxDO3FCQUQrRCxFQUUvRDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLE9BQWxDO3dCQUF3RCxJQUFBLEVBQUssS0FBN0Q7cUJBRitELEVBRy9EO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFTLE1BQUEsRUFBTyxDQUFoQjt3QkFBa0IsS0FBQSxFQUFNLEdBQXhCO3dCQUE0QixLQUFBLEVBQU0scUJBQWxDO3dCQUF3RCxJQUFBLEVBQUssSUFBN0Q7cUJBSCtELEVBSS9EO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFTLE1BQUEsRUFBTyxDQUFoQjt3QkFBa0IsS0FBQSxFQUFNLEdBQXhCO3dCQUE0QixLQUFBLEVBQU0scUJBQWxDO3FCQUorRCxFQUsvRDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLFFBQWxDO3FCQUwrRDtpQkFBN0M7YUFBRDtTQUE3QjtJQVZXLENBQWY7SUFrQkEsRUFBQSxDQUFHLFNBQUgsRUFBYyxTQUFBO1FBRVYsTUFBQSxDQUFPLENBQUMsR0FBRCxDQUFQLENBQWEsQ0FBQyxNQUFNLENBQUMsR0FBckIsQ0FBeUI7WUFBQztnQkFBQSxHQUFBLEVBQUksUUFBSjtnQkFBYSxLQUFBLEVBQU0sQ0FBbkI7Z0JBQXFCLEtBQUEsRUFBTSxDQUEzQjtnQkFBNkIsTUFBQSxFQUFPLENBQXBDO2dCQUFzQyxNQUFBLEVBQU87b0JBQUU7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVMsTUFBQSxFQUFPLENBQWhCO3dCQUFrQixLQUFBLEVBQU0sR0FBeEI7d0JBQTRCLEtBQUEsRUFBTSxRQUFsQztxQkFBRjtpQkFBN0M7YUFBRDtTQUF6QjtRQUNBLE1BQUEsQ0FBTyxDQUFDLEdBQUQsQ0FBUCxDQUFhLENBQUMsTUFBTSxDQUFDLEdBQXJCLENBQXlCO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLENBQW5CO2dCQUFxQixLQUFBLEVBQU0sQ0FBM0I7Z0JBQTZCLE1BQUEsRUFBTyxDQUFwQztnQkFBc0MsTUFBQSxFQUFPO29CQUFFO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFTLE1BQUEsRUFBTyxDQUFoQjt3QkFBa0IsS0FBQSxFQUFNLEdBQXhCO3dCQUE0QixLQUFBLEVBQU0sTUFBbEM7cUJBQUY7aUJBQTdDO2FBQUQ7U0FBekI7UUFDQSxNQUFBLENBQU8sQ0FBQyxHQUFELENBQVAsQ0FBYSxDQUFDLE1BQU0sQ0FBQyxHQUFyQixDQUF5QjtZQUFDO2dCQUFBLEdBQUEsRUFBSSxRQUFKO2dCQUFhLEtBQUEsRUFBTSxDQUFuQjtnQkFBcUIsS0FBQSxFQUFNLENBQTNCO2dCQUE2QixNQUFBLEVBQU8sQ0FBcEM7Z0JBQXNDLE1BQUEsRUFBTztvQkFBRTt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBUyxNQUFBLEVBQU8sQ0FBaEI7d0JBQWtCLEtBQUEsRUFBTSxHQUF4Qjt3QkFBNEIsS0FBQSxFQUFNLE9BQWxDO3FCQUFGO2lCQUE3QzthQUFEO1NBQXpCO1FBRUEsTUFBQSxDQUFPLENBQUMsS0FBRCxDQUFQLENBQWUsQ0FBQyxNQUFNLENBQUMsR0FBdkIsQ0FBMkI7WUFBQztnQkFBQSxHQUFBLEVBQUksUUFBSjtnQkFBYSxLQUFBLEVBQU0sQ0FBbkI7Z0JBQXFCLEtBQUEsRUFBTSxDQUEzQjtnQkFBNkIsTUFBQSxFQUFPLENBQXBDO2dCQUFzQyxNQUFBLEVBQU87b0JBQzVEO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFVLE1BQUEsRUFBTyxDQUFqQjt3QkFBbUIsS0FBQSxFQUFNLEdBQXpCO3dCQUE2QixLQUFBLEVBQU0sUUFBbkM7cUJBRDRELEVBRTVEO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFVLE1BQUEsRUFBTyxDQUFqQjt3QkFBbUIsS0FBQSxFQUFNLEdBQXpCO3dCQUE2QixLQUFBLEVBQU0sZ0JBQW5DO3FCQUY0RCxFQUc1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBVSxNQUFBLEVBQU8sQ0FBakI7d0JBQW1CLEtBQUEsRUFBTSxHQUF6Qjt3QkFBNkIsS0FBQSxFQUFNLFVBQW5DO3FCQUg0RDtpQkFBN0M7YUFBRDtTQUEzQjtRQU1BLE1BQUEsQ0FBTyxDQUFDLEtBQUQsQ0FBUCxDQUFlLENBQUMsTUFBTSxDQUFDLEdBQXZCLENBQTJCO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLENBQW5CO2dCQUFxQixLQUFBLEVBQU0sQ0FBM0I7Z0JBQTZCLE1BQUEsRUFBTyxDQUFwQztnQkFBc0MsTUFBQSxFQUFPO29CQUM1RDt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBVSxNQUFBLEVBQU8sQ0FBakI7d0JBQW1CLEtBQUEsRUFBTSxHQUF6Qjt3QkFBNkIsS0FBQSxFQUFNLE9BQW5DO3dCQUE0QyxJQUFBLEVBQUssSUFBakQ7cUJBRDRELEVBRTVEO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFVLE1BQUEsRUFBTyxDQUFqQjt3QkFBbUIsS0FBQSxFQUFNLEdBQXpCO3dCQUE2QixLQUFBLEVBQU0sT0FBbkM7cUJBRjRELEVBRzVEO3dCQUFDLEtBQUEsRUFBTSxDQUFQO3dCQUFVLE1BQUEsRUFBTyxDQUFqQjt3QkFBbUIsS0FBQSxFQUFNLEdBQXpCO3dCQUE2QixLQUFBLEVBQU0sTUFBbkM7cUJBSDREO2lCQUE3QzthQUFEO1NBQTNCO2VBTUEsTUFBQSxDQUFPLENBQUMsY0FBRCxDQUFQLENBQXdCLENBQUMsTUFBTSxDQUFDLEdBQWhDLENBQW9DO1lBQUM7Z0JBQUEsR0FBQSxFQUFJLFFBQUo7Z0JBQWEsS0FBQSxFQUFNLEVBQW5CO2dCQUFzQixLQUFBLEVBQU0sQ0FBNUI7Z0JBQThCLE1BQUEsRUFBTyxDQUFyQztnQkFBdUMsTUFBQSxFQUFPO29CQUNyRTt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBVSxNQUFBLEVBQU8sQ0FBakI7d0JBQW1CLEtBQUEsRUFBTSxHQUF6Qjt3QkFBaUMsS0FBQSxFQUFNLFlBQXZDO3FCQURxRSxFQUVyRTt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBVSxNQUFBLEVBQU8sQ0FBakI7d0JBQW1CLEtBQUEsRUFBTSxLQUF6Qjt3QkFBaUMsS0FBQSxFQUFNLE1BQXZDO3FCQUZxRSxFQUdyRTt3QkFBQyxLQUFBLEVBQU0sQ0FBUDt3QkFBVSxNQUFBLEVBQU8sQ0FBakI7d0JBQW1CLEtBQUEsRUFBTSxHQUF6Qjt3QkFBaUMsS0FBQSxFQUFNLHFCQUF2QztxQkFIcUUsRUFJckU7d0JBQUMsS0FBQSxFQUFNLENBQVA7d0JBQVUsTUFBQSxFQUFPLENBQWpCO3dCQUFtQixLQUFBLEVBQU0sT0FBekI7d0JBQWlDLEtBQUEsRUFBTSxlQUF2QztxQkFKcUUsRUFLckU7d0JBQUMsS0FBQSxFQUFNLEVBQVA7d0JBQVUsTUFBQSxFQUFPLENBQWpCO3dCQUFtQixLQUFBLEVBQU0sR0FBekI7d0JBQWlDLEtBQUEsRUFBTSxxQkFBdkM7cUJBTHFFO2lCQUE5QzthQUFEO1NBQXBDO0lBbEJVLENBQWQ7SUEwQkEsRUFBQSxDQUFHLE9BQUgsRUFBWSxTQUFBO0FBRVIsWUFBQTtRQUFBLENBQUEsR0FBSSxNQUFBLENBQU8sQ0FBQyxHQUFELENBQVA7UUFDSixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBOUIsQ0FBdUMsT0FBdkMsRUFBK0MsQ0FBL0M7UUFFQSxDQUFBLEdBQUksTUFBQSxDQUFPLENBQUMsS0FBRCxDQUFQO1FBQ0osQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQTlCLENBQXVDLE9BQXZDLEVBQStDLENBQS9DO1FBRUEsQ0FBQSxHQUFJLE1BQUEsQ0FBTyxDQUFDLFNBQUQsQ0FBUDtRQUNKLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUE5QixDQUF1QyxPQUF2QyxFQUErQyxDQUEvQztRQUVBLENBQUEsR0FBSSxNQUFBLENBQU8sQ0FBQyxhQUFELENBQVA7UUFDSixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBOUIsQ0FBdUMsT0FBdkMsRUFBK0MsQ0FBL0M7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBOUIsQ0FBdUMsT0FBdkMsRUFBK0MsQ0FBL0M7ZUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBOUIsQ0FBdUMsT0FBdkMsRUFBK0MsQ0FBL0M7SUFkUSxDQUFaO1dBZ0JBLEVBQUEsQ0FBRyxVQUFILEVBQWUsU0FBQTtBQUVYLFlBQUE7UUFBQSxDQUFBLEdBQUksTUFBQSxDQUFPLG1DQUlILENBQUMsS0FKRSxDQUlJLElBSkosQ0FBUDtRQUtKLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBRUEsQ0FBQSxHQUFJLE1BQUEsQ0FBTyw0RUFPSCxDQUFDLEtBUEUsQ0FPSSxJQVBKLENBQVA7UUFRSixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxRQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxRQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxRQUFuQztRQUVBLENBQUEsR0FBSSxNQUFBLENBQU8sbVFBU0gsQ0FBQyxLQVRFLENBU0ksSUFUSixDQUFQO1FBVUosQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsUUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsUUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxRQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBRUEsQ0FBQSxHQUFJLE1BQUEsQ0FBTyx3QkFHSixDQUFDLEtBSEcsQ0FHRyxJQUhILENBQVA7UUFJSixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxRQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBRUEsQ0FBQSxHQUFJLE1BQUEsQ0FBTyw2REFPSixDQUFDLEtBUEcsQ0FPRyxJQVBILENBQVAsRUFPaUIsSUFQakI7UUFRSixDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLFFBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztlQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO0lBbkVXLENBQWY7QUEzRWUsQ0FBbkIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiMjI1xuXG5CbG9ja3MgPSByZXF1aXJlICcuL2Jsb2NrcydcbnJlcXVpcmUoJ2t4aycpLmNoYWkoKVxuXG5pbmMgPSAocmdzLCBzdGFydCwgbWF0Y2gsIHZhbHVlKSAtPiByZ3Muc2hvdWxkLmRlZXAuaW5jbHVkZSAgICAgc3RhcnQ6c3RhcnQsIG1hdGNoOm1hdGNoLCB2YWx1ZTp2YWx1ZVxubnV0ID0gKHJncywgc3RhcnQsIG1hdGNoLCB2YWx1ZSkgLT4gcmdzLnNob3VsZC5ub3QuZGVlcC5pbmNsdWRlIHN0YXJ0OnN0YXJ0LCBtYXRjaDptYXRjaCwgdmFsdWU6dmFsdWVcblxuYmxvY2tzID0gQmxvY2tzLmJsb2Nrc1xuICAgIFxuZGVzY3JpYmUgJ3JhbmdlcycsIC0+XG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgIFxuICAgIGl0ICdyZWdleHAnLCAtPlxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwicj0vYS9cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiwgJy8nLCAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAzLCAnYScsICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgNCwgJy8nLCAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIi8oYXwuKnxcXHNcXGRcXHdcXFNcXFckfF5cXHMrKS9cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgJy8nLCAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAyLCAnYScsICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiL14jaW5jbHVkZS9cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgJy8nLCAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAyLCBcIiNcIiwgICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMywgXCJpbmNsdWRlXCIsICd0ZXh0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiL1xcXFwnaGVsbG9cXFxcJy8gXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICcvJywgICAgICAgJ3B1bmN0IHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMSwgXCJcXFxcXCIsICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMiwgXCInXCIsICAgICAgICdwdW5jdCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDMsIFwiaGVsbG9cIiwgICAndGV4dCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImYgYSAvYiAtIGMvZ2lcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNCwgJy8nLCAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCA1LCAnYicsICd0ZXh0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMTAsICcvJywgJ3B1bmN0IHJlZ2V4cCBlbmQnXG4gICAgICAgIFxuICAgIGl0ICdubyByZWdleHAnLCAtPlxuICAgICAgICBcbiAgICAgICAgIyBmIGEgLyBiIC0gYy9naVxuICAgICAgICAjIGYgYS9iIC0gYy9naVxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyAnYSAvIGIgLSBjIC8gZCcsICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDIsICcvJywgJ3B1bmN0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzICdmIGEvYiwgYy9kJywgJ2NvZmZlZSdcbiAgICAgICAgbnV0IHJncywgMywgJy8nLCAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ3JlcXVpcmUnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcInV0aWwgPSByZXF1aXJlICd1dGlsJ1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA3LCAncmVxdWlyZScsICdyZXF1aXJlJ1xuICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdjb21tZW50cycsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiaGVsbG8gIyB3b3JsZFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA2LCBcIiNcIiwgICAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDgsIFwid29ybGRcIiwgJ2NvbW1lbnQnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiAgICMgYmxhIGJsdWJcIiwgJ25vb24nXG4gICAgICAgIGluYyByZ3MsIDMsIFwiI1wiLCAgICAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiYmxhXCIsICAgJ2NvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDksIFwiYmx1YlwiLCAgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICBpdCAnbm8gY29tbWVudCcsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiKF5cXHMqI1xccyopKC4qKSRcIiwgJ25vb24nXG4gICAgICAgIGZvciBybmcgaW4gcmdzXG4gICAgICAgICAgICBybmcuc2hvdWxkLm5vdC5oYXZlLnByb3BlcnR5ICd2YWx1ZScsICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgaXQgJ3RyaXBsZSBjb21tZW50JywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIjIyNhIyMjXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDMsIFwiYVwiLCAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyByZ3MsIDYsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG5cbiAgICAgICAgZHNzID0gQmxvY2tzLmRpc3NlY3QgXCIjIyNcXG5hXFxuIyMjXCIuc3BsaXQoJ1xcbicpLCAnY29mZmVlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAwLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAxLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzBdLCAyLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAwLCBcImFcIiwgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAwLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAxLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgZHNzWzJdLCAyLCBcIiNcIiwgJ3B1bmN0IGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBcbiAgICBpdCAnY29tbWVudCBoZWFkZXInLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiMgMCAwMCAwMDAwXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICBcIiNcIiwgICAgJ3B1bmN0IGNvbW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDIsICBcIjBcIiwgICAgJ2NvbW1lbnQgaGVhZGVyJ1xuICAgICAgICBpbmMgcmdzLCA0LCAgXCIwMFwiLCAgICdjb21tZW50IGhlYWRlcidcbiAgICAgICAgaW5jIHJncywgNywgIFwiMDAwMFwiLCAnY29tbWVudCBoZWFkZXInXG5cbiAgICAgICAgZHNzID0gQmxvY2tzLmRpc3NlY3QgXCIjIyNcXG4gMCAwMCAwIFxcbiMjI1wiLnNwbGl0KCdcXG4nKSwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMSwgXCIwXCIsICdjb21tZW50IHRyaXBsZSBoZWFkZXInXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnbnVtYmVycycsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiYSA2NjcwXCJcbiAgICAgICAgaW5jIHJncywgMiwgXCI2NjcwXCIsICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIjB4NjY3QUNcIlxuICAgICAgICBpbmMgcmdzLCAwLCBcIjB4NjY3QUNcIiwgJ251bWJlciBoZXgnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIjY2LjcwMFwiXG4gICAgICAgIGluYyByZ3MsIDAsIFwiNjZcIiwgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiLlwiLCAgICdwdW5jdCBudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDMsIFwiNzAwXCIsICdudW1iZXIgZmxvYXQnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIjc3LjgwMCAtMTAwXCJcbiAgICAgICAgaW5jIHJncywgMCwgXCI3N1wiLCAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgOCwgXCIxMDBcIiwgJ251bWJlcidcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiKDguOSwxMDAuMilcIlxuICAgICAgICBpbmMgcmdzLCAzLCBcIjlcIiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgOSwgXCIyXCIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NlbXZlcicsIC0+ICAgIFxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIjY2LjcwLjBcIlxuICAgICAgICBpbmMgcmdzLCAwLCBcIjY2XCIsICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDIsIFwiLlwiLCAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgMywgXCI3MFwiLCAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIi5cIiwgICdwdW5jdCBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDYsIFwiMFwiLCAgJ3NlbXZlcidcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiXjAuNy4xXCJcbiAgICAgICAgaW5jIHJncywgMSwgXCIwXCIsICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMsIFwiN1wiLCAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIjFcIiwgJ3NlbXZlcidcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiXjEuMC4wLWFscGhhLjEyXCJcbiAgICAgICAgaW5jIHJncywgMSwgXCIxXCIsICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMsIFwiMFwiLCAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIjBcIiwgJ3NlbXZlcidcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdzdHJpbmdzJywgLT5cbiAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIlwiXCJhPVwiXFxcXFwiRVxcXFxcIlwiIFwiXCJcIlxuICAgICAgICBpbmMgcmdzLCAyLCAnXCInLCAgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNCwgJ1wiJywgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDUsICdFJywgICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDgsICdcIicsICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyAnYT1cIlxcJ1hcXCdcIidcbiAgICAgICAgaW5jIHJncywgMiwgJ1wiJywgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMywgXCInXCIsICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiWFwiLCAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA2LCAnXCInLCAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJ2E9XFwnXCJYXCJcXCcnLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcIidcIiwgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgMywgJ1wiJywgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNCwgJ1gnLCAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA2LCBcIidcIiwgICAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzICdhPWBcIlhcImAnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiYFwiLCAgICdwdW5jdCBzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDMsICdcIicsICAgJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgNCwgJ1gnLCAgICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDYsIFwiYFwiLCAgICdwdW5jdCBzdHJpbmcgYmFja3RpY2snXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyAnYT1cIiAgXFwnWFxcJyAgWSAgXCIgJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnXCInLCAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIidcIiwgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNiwgXCJYXCIsICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDcsIFwiJ1wiLCAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxMywgJ1wiJywgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJ2E9XCJcIjtiPVwiIFwiO2M9XCJYXCInXG4gICAgICAgIGZvciBpIGluIFsyLDMsNyw5LDEzLDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgJ1wiJywgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDE0LCAnWCcsICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiYT0nJztiPScgJztjPSdZJ1wiLCAnY29mZmVlJ1xuICAgICAgICBmb3IgaSBpbiBbMiwzLDcsOSwxMywxNV1cbiAgICAgICAgICAgIGluYyByZ3MsIGksIFwiJ1wiLCAncHVuY3Qgc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgMTQsICdZJywgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJhPWBgO2I9YCBgO2M9YFpgXCJcbiAgICAgICAgZm9yIGkgaW4gWzIsMyw3LDksMTMsMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCBcImBcIiwgJ3B1bmN0IHN0cmluZyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgMTQsICdaJywgJ3N0cmluZyBiYWNrdGljaydcblxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ2ludGVycG9sYXRpb24nLCAtPiAgICBcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJ1wiI3t4eHh9XCInLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnXCInLCAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAzLCAneHh4JywgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDcsICdcIicsICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyAnXCIjezY2Nn1cIicsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICdcIicsICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMsICc2NjYnLCAnbnVtYmVyJ1xuICAgICAgICBpbmMgcmdzLCA3LCAnXCInLCAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaXQgJ21kIGJvbGQnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIioqYm9sZCoqXCIsICdtZCdcbiAgICAgICAgaW5jIHJncywgMCwgJyonLCAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCAxLCAnKicsICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDIsICdib2xkJywgICAndGV4dCBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA2LCAnKicsICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDcsICcqJywgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgICAgICAgICBcbiAgICBpdCAnbWQgaXRhbGljJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIqaXQgbGljKlwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICcqJywgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxLCAnaXQnLCAgICAgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA0LCAnbGljJywgICAgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA3LCAnKicsICAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIqaXRhbGljKlwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICcqJywgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxLCAnaXRhbGljJywgJ3RleHQgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCA3LCAnKicsICAgICAgJ3B1bmN0IGl0YWxpYydcbiBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIipgaXRhbGljIGNvZGVgKlwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICcqJywgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBpbmMgcmdzLCAxLCAnYCcsICAgICAgJ3B1bmN0IGl0YWxpYyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgMiwgJ2l0YWxpYycsICd0ZXh0IGl0YWxpYyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgOSwgJ2NvZGUnLCAgICd0ZXh0IGl0YWxpYyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgMTQsICcqJywgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIFxuICAgIGl0ICdtZCBubyBzdHJpbmcnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIml0J3MgZ29vZFwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICdpdCcsICAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiwgXCInXCIsICAgICAgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAzLCAncycsICAgICAgJ3RleHQnXG4gICAgICAgIFxuICAgIGl0ICdtZCBubyBrZXl3b3JkJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJpZiBpcyBlbXB0eSBpbiB0aGVuXCIsICdtZCdcbiAgICAgICAgaW5jIHJncywgMCwgICdpZicsICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAzLCAgJ2lzJywgICAgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDYsICAnZW1wdHknLCAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMTIsICdpbicsICAgICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCAxNSwgJ3RoZW4nLCAgJ3RleHQnXG5cbiAgICAgICAgZHNzID0gQmxvY2tzLmRpc3NlY3QgW1wi4pa4ZG9jICdtZCdcIiwgXCIgICAgaWYgaXMgZW1wdHkgaW4gdGhlblwiXSwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgNCwgICdpZicsICAgICd0ZXh0J1xuICAgICAgICBpbmMgZHNzWzFdLCA3LCAgJ2lzJywgICAgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDEwLCAgJ2VtcHR5JywgJ3RleHQnXG4gICAgICAgIGluYyBkc3NbMV0sIDE2LCAnaW4nLCAgICAndGV4dCdcbiAgICAgICAgaW5jIGRzc1sxXSwgMTksICd0aGVuJywgICd0ZXh0J1xuICAgICAgICBcbiAgICAjIGl0ICdtZCBsaScsIC0+XG4jICAgICAgICAgICAgICAgICBcbiAgICAgICAgIyByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiLSBsaVwiLCAnbWQnXG4gICAgICAgICMgaW5jIHJncywgMCwgJy0nLCAgJ2xpMSBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgMiwgJ2xpJywgJ2xpMSdcbiMgICAgICAgICBcbiAgICAgICAgIyByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiICAgIC0gKipib2xkKipcIiwgJ21kJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICctJywgICAgJ2xpMiBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgOCwgJ2JvbGQnLCAnbGkyIGJvbGQnXG4jICAgICAgICAgXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiAgICAtICoqXCIsICdtZCdcbiAgICAgICAgIyBpbmMgcmdzLCA0LCAnLScsICAgICdsaTIgbWFya2VyJ1xuICAgICAgICAjIGluYyByZ3MsIDYsICcqJywgICAgJ3B1bmN0IGxpMidcbiAgICAgICAgIyBpbmMgcmdzLCA3LCAnKicsICAgICdwdW5jdCBsaTInXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdjb2ZmZWUnLCAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiY2xhc3MgTWFjcm8gZXh0ZW5kcyBDb21tYW5kXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICAnY2xhc3MnLCAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA2LCAgJ01hY3JvJywgICAnY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEyLCAnZXh0ZW5kcycsICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyMCwgJ0NvbW1hbmQnLCAnY2xhc3MnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZXhpc3Q/LnByb3BcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNywgJ3Byb3AnLCAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJAaGVpZ2h0LzIgKyBAaGVpZ2h0LzZcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgOCwgXCIyXCIsICdudW1iZXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiYSBhbmQgYlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImFcIiwgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiYW5kXCIsICdrZXl3b3JkJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJpZiBhIHRoZW4gYlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImlmXCIsICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcImFcIiwgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDUsIFwidGhlblwiLCAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMTAsIFwiYlwiLCAndGV4dCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwic3dpdGNoIGFcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJzd2l0Y2hcIiwgJ2tleXdvcmQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiIGE6IGJcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJhXCIsICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMiwgXCI6XCIsICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIm9iai52YWx1ZSA9IG9iai5hbm90aGVyLnZhbHVlXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICBcIm9ialwiLCAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0LCAgXCJ2YWx1ZVwiLCAgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxMiwgXCJvYmpcIiwgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgMTYsIFwiYW5vdGhlclwiLCdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMjQsIFwidmFsdWVcIiwgICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiaWYgc29tZU9iamVjdC5zb21lUHJvcFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImlmXCIsICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcInNvbWVPYmplY3RcIiwgJ29iaidcbiAgICAgICAgaW5jIHJncywgMTMsIFwiLlwiLCAncHVuY3QgcHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDE0LCBcInNvbWVQcm9wXCIsICdwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIxICdhJ1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcIjFcIiwgJ251bWJlcidcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuICAgIGl0ICdjb2ZmZWUgZnVuY3Rpb24nLCAtPlxuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJmZmYgMVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImZmZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImYgJ2EnXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJmZiAnYidcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJmZlwiLCAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZmZmZiAtMVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImZmZmZcIiwgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImYgWzFdXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZmZmZmYgezF9XCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZmZmZmZcIiwgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcInBvcz0gKGl0ZW0sIHApIC0+IFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcInBvc1wiLCAnZnVuY3Rpb24nXG4gICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGl0ICdjb2ZmZWUgbWV0aG9kJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgYTogPT5cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJhXCIsICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiOlwiLCAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIj1cIiwgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiPlwiLCAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgYTogLT5cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJhXCIsICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiOlwiLCAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIi1cIiwgJ3B1bmN0IGZ1bmN0aW9uIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiPlwiLCAncHVuY3QgZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJtdGhkOiAgKGFyZykgICAgPT4gQG1lbWJlciBtZW1hcmdcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgICdtdGhkJywgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCwgICc6JywgICAgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMTYsICc9JywgICAgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDE3LCAnPicsICAgICdwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdrb2ZmZWUnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiBAOiAtPlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcIkBcIiwgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiwgXCI6XCIsICdwdW5jdCBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiLVwiLCAncHVuY3QgZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSwgXCI+XCIsICdwdW5jdCBmdW5jdGlvbiBoZWFkJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCLilrhpZiDilrh0aGVuIOKWuGVsaWYg4pa4ZWxzZVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAgXCLilrhcIiwgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDEsICBcImlmXCIsICAgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDQsICBcIuKWuFwiLCAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgNSwgIFwidGhlblwiLCAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTAsIFwi4pa4XCIsICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxMSwgXCJlbGlmXCIsICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxNiwgXCLilrhcIiwgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDE3LCBcImVsc2VcIiwgJ21ldGEnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIlsxICd4JyBhOjEgYzpkXVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCAgXCIxXCIsICAgJ251bWJlcidcbiAgICAgICAgaW5jIHJncywgNCwgIFwieFwiLCAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA3LCAgXCJhXCIsICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCAxMSwgXCJjXCIsICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3B1bmN0JywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJy9zb21lXFxcXHBhdGgvZmlsZS50eHQ6MTAnLCAnbm9vbidcbiAgICAgICAgaW5jIHJncywgMCwgICcvJywgICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgNSwgICdcXFxcJywgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAxNSwgJy4nLCAgJ3B1bmN0J1xuICAgICAgICBpbmMgcmdzLCAxOSwgJzonLCAgJ3B1bmN0J1xuICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgXG4gICAgaXQgJ2h0bWwnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIjwvZGl2PlwiLCAnaHRtbCcgXG4gICAgICAgIGluYyByZ3MsIDAsIFwiPFwiLCAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMSwgXCIvXCIsICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcImRpdlwiLCAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiPlwiLCAgICAncHVuY3Qga2V5d29yZCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiPGRpdj5cIiwgJ2h0bWwnIFxuICAgICAgICBpbmMgcmdzLCAwLCBcIjxcIiwgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiZGl2XCIsICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNCwgXCI+XCIsICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnY3BwIGRlZmluZScsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiI2luY2x1ZGVcIiwgJ2NwcCcgICAgICBcbiAgICAgICAgaW5jIHJncywgMCwgXCIjXCIsICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImluY2x1ZGVcIiwgICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiNpZlwiLCAnY3BwJyAgICAgICAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwLCBcIiNcIiwgICAgICAgICdwdW5jdCBkZWZpbmUnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiaWZcIiwgICAgICAgJ2RlZmluZSdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiIyAgaWZcIiwgJ2NwcCcgICAgICAgICAgICBcbiAgICAgICAgaW5jIHJncywgMCwgXCIjXCIsICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcImlmXCIsICAgICAgICdkZWZpbmUnXG4gICAgICAgICAgICBcbiAgICBpdCAnY3BwIGtleXdvcmQnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImlmICh0cnVlKSB7fSBlbHNlIHt9XCIsICdjcHAnICAgIFxuICAgICAgICBpbmMgcmdzLCAwLCBcImlmXCIsICAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcInRydWVcIiwgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxMywgXCJlbHNlXCIsICdrZXl3b3JkJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgICAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGl0ICdjcHAgZmxvYXQnLCAtPlxuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIxLjBmXCIsICdjcHAnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiMVwiLCAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMSwgXCIuXCIsICAncHVuY3QgbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAyLCBcIjBmXCIsICdudW1iZXIgZmxvYXQnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIjAuMDAwMGZcIiwgJ2NwcCdcbiAgICAgICAgaW5jIHJncywgMiwgXCIwMDAwZlwiLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgICMgaXQgJ2lzcycsIC0+XG4jICAgICAgICAgXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcImE9eyNrZXl9XCIsICdpc3MnXG4gICAgICAgICMgaW5jIHJncywgMiwgJ3snLCAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCAzLCBcIiNcIiwgICAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgNCwgJ2tleScsICdwcm9wZXJ0eSB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDcsIFwifVwiLCAgICdwdW5jdCBwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdqcycsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZnVuYyA9IGZ1bmN0aW9uKCkge1wiLCAnanMnXG4gICAgICAgIGluYyByZ3MsIDAsICdmdW5jJywgJ2Z1bmN0aW9uJ1xuICAgICAgICBpbmMgcmdzLCA3LCAnZnVuY3Rpb24nLCAna2V5d29yZCBmdW5jdGlvbidcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzaCcsIC0+XG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImRpci9wYXRoL3dpdGgvZGFzaGVzL2ZpbGUudHh0XCIsICdzaCdcbiAgICAgICAgaW5jIHJncywgMCwgJ2RpcicsICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNCwgJ3BhdGgnLCAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDksICd3aXRoJywgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNCwgJ2Rhc2hlcycsICd0ZXh0IGRpcidcbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcImRpci9wYXRoLXdpdGgtZGFzaGVzL2ZpbGUudHh0XCIsICdzaCdcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAnZGlyJywgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDQsICdwYXRoJywgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDksICd3aXRoJywgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDE0LCAnZGFzaGVzJywgJ2RpciB0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcInByZyAtLWFyZzEgLWFyZzJcIiwgJ3NoJ1xuICAgICAgICBpbmMgcmdzLCA0LCAnLScsICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgNSwgJy0nLCAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDYsICdhcmcxJywgJ2FyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCAxMSwgJy0nLCAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDEyLCAnYXJnMicsICdhcmd1bWVudCdcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnbG9nJywgLT5cblxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJodHRwOi8vZG9tYWluLmNvbVwiLCAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAsICdodHRwJywgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgIyBpbmMgcmdzLCA0LCAnOicsICdwdW5jdCB1cmwnXG4gICAgICAgICMgaW5jIHJncywgNSwgJy8nLCAncHVuY3QgdXJsJ1xuICAgICAgICAjIGluYyByZ3MsIDYsICcvJywgJ3B1bmN0IHVybCdcbiAgICAgICAgIyBpbmMgcmdzLCA3LCAnZG9tYWluJywgJ3VybCBkb21haW4nXG4gICAgICAgICMgaW5jIHJncywgMTMsICcuJywgJ3B1bmN0IHVybCB0bGQnXG4gICAgICAgICMgaW5jIHJncywgMTQsICdjb20nLCAndXJsIHRsZCdcbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcImZpbGUuY29mZmVlXCIsICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCwgJ2ZpbGUnLCAnY29mZmVlIGZpbGUnXG4gICAgICAgICMgaW5jIHJncywgNCwgJy4nLCAncHVuY3QgY29mZmVlJ1xuICAgICAgICAjIGluYyByZ3MsIDUsICdjb2ZmZWUnLCAnY29mZmVlIGV4dCdcblxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJrZXkgL1wiLCAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAsICdrZXknLCAgICd0ZXh0J1xuXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcIi9zb21lL3BhdGhcIiwgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAxLCAnc29tZScsICAgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDUsICcvJywgICAgICAncHVuY3QgZGlyJ1xuXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcImtleTogdmFsdWVcIiwgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAna2V5JywgICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAjIGluYyByZ3MsIDMsICc6JywgICAgICAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnbm9vbicsIC0+XG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgICAgcHJvcGVydHkgIHZhbHVlXCIsICdub29uJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICdwcm9wZXJ0eScsICdwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCAxNCwgJ3ZhbHVlJywgJ3RleHQnXG5cbiAgICAgICAgIyByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiICAgIHByb3AuZXJ0eSAgdmFsdWVcIiwgJ25vb24nXG4gICAgICAgICMgaW5jIHJncywgNCwgJ3Byb3AnLCAncHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgOCwgJy4nLCAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgOSwgJ2VydHknLCAncHJvcGVydHknXG4gICAgICAgIFxuZGVzY3JpYmUgJ2Jsb2NrcycsIC0+XG4gICAgXG4gICAgaXQgJ2NvbW1lbnQnLCAtPlxuICAgICBcbiAgICAgICAgYmxvY2tzKFtcIiMjXCJdKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCcgdHVyZDpcIiMjXCJ9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDpcIiNcIiB2YWx1ZTonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgIFxuICAgICAgICBibG9ja3MoW1wiLCNhXCJdKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDpcIixcIiB2YWx1ZToncHVuY3QnIHR1cmQ6IFwiLCNcIn0gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoyIGxlbmd0aDoxIG1hdGNoOlwiYVwiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgXG4gICAgaXQgJ2Z1bmN0aW9uJywgLT5cbiAgICBcbiAgICAgICAgYmxvY2tzKFsnLT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgIGJsb2NrcyhbJz0+J10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICBibG9ja3MoWydmPS0+MSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6NSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonZicgdmFsdWU6J2Z1bmN0aW9uJ30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QnICAgICAgICAgICAgICAgdHVyZDonPS0+JyB9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6Jy0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDozIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICBpdCAnbWluaW1hbCcsIC0+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBibG9ja3MoWycxJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6JzEnIHZhbHVlOidudW1iZXInfSBdXVxuICAgICAgICBibG9ja3MoWydhJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOid0ZXh0J30gXV1cbiAgICAgICAgYmxvY2tzKFsnLiddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QnfSBdXVxuICAgIFxuICAgICAgICBibG9ja3MoWycxLmEnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QgcHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoyICBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3Byb3BlcnR5J30gXG4gICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGJsb2NrcyhbJysrYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOicrJyB2YWx1ZToncHVuY3QnLCB0dXJkOicrKyd9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDoxIG1hdGNoOicrJyB2YWx1ZToncHVuY3QnfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoyICBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgYmxvY2tzKFtcIuKWuGRvYyAnaGVsbG8nXCJdKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MTIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCAgbGVuZ3RoOjEgbWF0Y2g6J+KWuCcgICAgIHZhbHVlOidwdW5jdCBtZXRhJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDozIG1hdGNoOidkb2MnICAgdmFsdWU6J21ldGEnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NSAgbGVuZ3RoOjEgbWF0Y2g6XCInXCIgICAgIHZhbHVlOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjYgIGxlbmd0aDo1IG1hdGNoOlwiaGVsbG9cIiB2YWx1ZTonc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxMSBsZW5ndGg6MSBtYXRjaDpcIidcIiAgICAgdmFsdWU6J3B1bmN0IHN0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGl0ICdzcGFjZScsIC0+XG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgW1wieFwiXVxuICAgICAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDBcbiAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBbXCIgeHhcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAxXG4gICAgICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcIiAgICB4eHhcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgW1wiICAgIHggMSAgLCBcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgICAgIGJbMF0uY2h1bmtzWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNlxuICAgICAgICBiWzBdLmNodW5rc1syXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDlcbiAgICBcbiAgICBpdCAnc3dpdGNoZXMnLCAtPlxuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgICBcbiAgICAgICAgICAgICAgICB5XG4gICAgICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIHggIFxuICAgICAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgICAgICBgYGBcbiAgICAgICAgICAgICAgICB5XG4gICAgICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0ICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgMSsxICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICDilrhkb2MgJ2FnYWluJyAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvbWUgKipkb2NzKiogICAgIFxuICAgICAgICAgICAgICAgIGBgYCAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgeSAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbicgICAgICAgICAgICAgICBcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbN10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzhdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9vYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgXG4gICAgICAgICAgICBcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMTtcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgXCJcIlwiLnNwbGl0KCdcXG4nKSwgJ21kJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2pzJ1xuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/test.coffee