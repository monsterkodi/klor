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
        return inc(rgs, 0, 'func', 'function');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULE9BQUEsQ0FBUSxLQUFSLENBQWMsQ0FBQyxJQUFmLENBQUE7O0FBRUEsR0FBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCO1dBQThCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQWhCLENBQTRCO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsS0FBQSxFQUFNLEtBQWhDO0tBQTVCO0FBQTlCOztBQUNOLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixLQUFwQjtXQUE4QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBcEIsQ0FBNEI7UUFBQSxLQUFBLEVBQU0sS0FBTjtRQUFhLEtBQUEsRUFBTSxLQUFuQjtRQUEwQixLQUFBLEVBQU0sS0FBaEM7S0FBNUI7QUFBOUI7O0FBRU4sTUFBQSxHQUFTLE1BQU0sQ0FBQzs7QUFFaEIsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQTtJQVFmLEVBQUEsQ0FBRyxRQUFILEVBQWEsU0FBQTtBQUNULFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkLEVBQXVCLFFBQXZCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixvQkFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLGFBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQixrQkFBakI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYywyQkFB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QSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO1FBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsUUFBbkM7UUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFwQixDQUE2QixLQUE3QixFQUFtQyxJQUFuQztRQUNBLENBQUUsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQXBCLENBQTZCLEtBQTdCLEVBQW1DLElBQW5DO2VBQ0EsQ0FBRSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBcEIsQ0FBNkIsS0FBN0IsRUFBbUMsSUFBbkM7SUFuRVcsQ0FBZjtBQTNFZSxDQUFuQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyMjXG5cbkJsb2NrcyA9IHJlcXVpcmUgJy4vYmxvY2tzJ1xucmVxdWlyZSgna3hrJykuY2hhaSgpXG5cbmluYyA9IChyZ3MsIHN0YXJ0LCBtYXRjaCwgdmFsdWUpIC0+IHJncy5zaG91bGQuZGVlcC5pbmNsdWRlICAgICBzdGFydDpzdGFydCwgbWF0Y2g6bWF0Y2gsIHZhbHVlOnZhbHVlXG5udXQgPSAocmdzLCBzdGFydCwgbWF0Y2gsIHZhbHVlKSAtPiByZ3Muc2hvdWxkLm5vdC5kZWVwLmluY2x1ZGUgc3RhcnQ6c3RhcnQsIG1hdGNoOm1hdGNoLCB2YWx1ZTp2YWx1ZVxuXG5ibG9ja3MgPSBCbG9ja3MuYmxvY2tzXG4gICAgXG5kZXNjcmliZSAncmFuZ2VzJywgLT5cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgIDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgXG4gICAgXG4gICAgaXQgJ3JlZ2V4cCcsIC0+XG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJyPS9hL1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnLycsICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDMsICdhJywgJ3RleHQgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCA0LCAnLycsICdwdW5jdCByZWdleHAgZW5kJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiLyhhfC4qfFxcc1xcZFxcd1xcU1xcVyR8XlxccyspL1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnLycsICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDIsICdhJywgJ3RleHQgcmVnZXhwJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIvXiNpbmNsdWRlL1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnLycsICAgICAgICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiI1wiLCAgICAgICAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcImluY2x1ZGVcIiwgJ3RleHQgcmVnZXhwJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIvXFxcXCdoZWxsb1xcXFwnLyBcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgJy8nLCAgICAgICAncHVuY3QgcmVnZXhwIHN0YXJ0J1xuICAgICAgICBpbmMgcmdzLCAxLCBcIlxcXFxcIiwgICAgICAncHVuY3QgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcIidcIiwgICAgICAgJ3B1bmN0IHJlZ2V4cCdcbiAgICAgICAgaW5jIHJncywgMywgXCJoZWxsb1wiLCAgICd0ZXh0IHJlZ2V4cCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZiBhIC9iIC0gYy9naVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA0LCAnLycsICdwdW5jdCByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDUsICdiJywgJ3RleHQgcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAxMCwgJy8nLCAncHVuY3QgcmVnZXhwIGVuZCdcbiAgICAgICAgXG4gICAgaXQgJ25vIHJlZ2V4cCcsIC0+XG4gICAgICAgIFxuICAgICAgICAjIGYgYSAvIGIgLSBjL2dpXG4gICAgICAgICMgZiBhL2IgLSBjL2dpXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzICdhIC8gYiAtIGMgLyBkJywgJ2NvZmZlZSdcbiAgICAgICAgbnV0IHJncywgMiwgJy8nLCAncHVuY3QgcmVnZXhwJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJ2YgYS9iLCBjL2QnLCAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCAzLCAnLycsICdwdW5jdCByZWdleHAnXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAncmVxdWlyZScsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwidXRpbCA9IHJlcXVpcmUgJ3V0aWwnXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDcsICdyZXF1aXJlJywgJ3JlcXVpcmUnXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ2NvbW1lbnRzJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJoZWxsbyAjIHdvcmxkXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDYsIFwiI1wiLCAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgOCwgXCJ3b3JsZFwiLCAnY29tbWVudCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiICAgIyBibGEgYmx1YlwiLCAnbm9vbidcbiAgICAgICAgaW5jIHJncywgMywgXCIjXCIsICAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgNSwgXCJibGFcIiwgICAnY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgOSwgXCJibHViXCIsICAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgIGl0ICdubyBjb21tZW50JywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIoXlxccyojXFxzKikoLiopJFwiLCAnbm9vbidcbiAgICAgICAgZm9yIHJuZyBpbiByZ3NcbiAgICAgICAgICAgIHJuZy5zaG91bGQubm90LmhhdmUucHJvcGVydHkgJ3ZhbHVlJywgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICBpdCAndHJpcGxlIGNvbW1lbnQnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiMjI2EjIyNcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMiwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgMywgXCJhXCIsICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNCwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNSwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIHJncywgNiwgXCIjXCIsICdwdW5jdCBjb21tZW50IHRyaXBsZSdcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBcIiMjI1xcbmFcXG4jIyNcIi5zcGxpdCgnXFxuJyksICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMF0sIDAsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDEsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMF0sIDIsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMV0sIDAsIFwiYVwiLCAnY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDAsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDEsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIGluYyBkc3NbMl0sIDIsIFwiI1wiLCAncHVuY3QgY29tbWVudCB0cmlwbGUnXG4gICAgICAgIFxuICAgIGl0ICdjb21tZW50IGhlYWRlcicsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiIyAwIDAwIDAwMDBcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgIFwiI1wiLCAgICAncHVuY3QgY29tbWVudCdcbiAgICAgICAgaW5jIHJncywgMiwgIFwiMFwiLCAgICAnY29tbWVudCBoZWFkZXInXG4gICAgICAgIGluYyByZ3MsIDQsICBcIjAwXCIsICAgJ2NvbW1lbnQgaGVhZGVyJ1xuICAgICAgICBpbmMgcmdzLCA3LCAgXCIwMDAwXCIsICdjb21tZW50IGhlYWRlcidcblxuICAgICAgICBkc3MgPSBCbG9ja3MuZGlzc2VjdCBcIiMjI1xcbiAwIDAwIDAgXFxuIyMjXCIuc3BsaXQoJ1xcbicpLCAnY29mZmVlJ1xuICAgICAgICBpbmMgZHNzWzFdLCAxLCBcIjBcIiwgJ2NvbW1lbnQgdHJpcGxlIGhlYWRlcidcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAgICAgIDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdudW1iZXJzJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJhIDY2NzBcIlxuICAgICAgICBpbmMgcmdzLCAyLCBcIjY2NzBcIiwgJ251bWJlcidcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiMHg2NjdBQ1wiXG4gICAgICAgIGluYyByZ3MsIDAsIFwiMHg2NjdBQ1wiLCAnbnVtYmVyIGhleCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiNjYuNzAwXCJcbiAgICAgICAgaW5jIHJncywgMCwgXCI2NlwiLCAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMiwgXCIuXCIsICAgJ3B1bmN0IG51bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMywgXCI3MDBcIiwgJ251bWJlciBmbG9hdCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiNzcuODAwIC0xMDBcIlxuICAgICAgICBpbmMgcmdzLCAwLCBcIjc3XCIsICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA4LCBcIjEwMFwiLCAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIoOC45LDEwMC4yKVwiXG4gICAgICAgIGluYyByZ3MsIDMsIFwiOVwiLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCA5LCBcIjJcIiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnc2VtdmVyJywgLT4gICAgXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiNjYuNzAuMFwiXG4gICAgICAgIGluYyByZ3MsIDAsIFwiNjZcIiwgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMiwgXCIuXCIsICAncHVuY3Qgc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcIjcwXCIsICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUsIFwiLlwiLCAgJ3B1bmN0IHNlbXZlcidcbiAgICAgICAgaW5jIHJncywgNiwgXCIwXCIsICAnc2VtdmVyJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJeMC43LjFcIlxuICAgICAgICBpbmMgcmdzLCAxLCBcIjBcIiwgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMywgXCI3XCIsICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUsIFwiMVwiLCAnc2VtdmVyJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJeMS4wLjAtYWxwaGEuMTJcIlxuICAgICAgICBpbmMgcmdzLCAxLCBcIjFcIiwgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgMywgXCIwXCIsICdzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDUsIFwiMFwiLCAnc2VtdmVyJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ3N0cmluZ3MnLCAtPlxuICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiXCJcImE9XCJcXFxcXCJFXFxcXFwiXCIgXCJcIlwiXG4gICAgICAgIGluYyByZ3MsIDIsICdcIicsICAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA0LCAnXCInLCAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNSwgJ0UnLCAgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgOCwgJ1wiJywgICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzICdhPVwiXFwnWFxcJ1wiJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnXCInLCAgICdwdW5jdCBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcIidcIiwgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNCwgXCJYXCIsICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDYsICdcIicsICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyAnYT1cXCdcIlhcIlxcJycsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiJ1wiLCAgICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCAzLCAnXCInLCAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA0LCAnWCcsICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDYsIFwiJ1wiLCAgICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJ2E9YFwiWFwiYCdcbiAgICAgICAgaW5jIHJncywgMiwgXCJgXCIsICAgJ3B1bmN0IHN0cmluZyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgMywgJ1wiJywgICAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCA0LCAnWCcsICAgJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgaW5jIHJncywgNiwgXCJgXCIsICAgJ3B1bmN0IHN0cmluZyBiYWNrdGljaydcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzICdhPVwiICBcXCdYXFwnICBZICBcIiAnXG4gICAgICAgIGluYyByZ3MsIDIsICdcIicsICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiJ1wiLCAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA2LCBcIlhcIiwgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNywgXCInXCIsICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDEzLCAnXCInLCAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyAnYT1cIlwiO2I9XCIgXCI7Yz1cIlhcIidcbiAgICAgICAgZm9yIGkgaW4gWzIsMyw3LDksMTMsMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCAnXCInLCAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTQsICdYJywgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJhPScnO2I9JyAnO2M9J1knXCIsICdjb2ZmZWUnXG4gICAgICAgIGZvciBpIGluIFsyLDMsNyw5LDEzLDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgXCInXCIsICdwdW5jdCBzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCAxNCwgJ1knLCAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImE9YGA7Yj1gIGA7Yz1gWmBcIlxuICAgICAgICBmb3IgaSBpbiBbMiwzLDcsOSwxMywxNV1cbiAgICAgICAgICAgIGluYyByZ3MsIGksIFwiYFwiLCAncHVuY3Qgc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCAxNCwgJ1onLCAnc3RyaW5nIGJhY2t0aWNrJ1xuXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnaW50ZXJwb2xhdGlvbicsIC0+ICAgIFxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyAnXCIje3h4eH1cIicsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICdcIicsICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMsICd4eHgnLCAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNywgJ1wiJywgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzICdcIiN7NjY2fVwiJywgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgJ1wiJywgICAncHVuY3Qgc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMywgJzY2NicsICdudW1iZXInXG4gICAgICAgIGluYyByZ3MsIDcsICdcIicsICAgJ3B1bmN0IHN0cmluZyBkb3VibGUnXG5cbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBpdCAnbWQgYm9sZCcsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiKipib2xkKipcIiwgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnKicsICAgICAgJ3B1bmN0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDEsICcqJywgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgMiwgJ2JvbGQnLCAgICd0ZXh0IGJvbGQnXG4gICAgICAgIGluYyByZ3MsIDYsICcqJywgICAgICAncHVuY3QgYm9sZCdcbiAgICAgICAgaW5jIHJncywgNywgJyonLCAgICAgICdwdW5jdCBib2xkJ1xuICAgICAgICAgICAgICAgIFxuICAgIGl0ICdtZCBpdGFsaWMnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIippdCBsaWMqXCIsICdtZCdcbiAgICAgICAgaW5jIHJncywgMCwgJyonLCAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEsICdpdCcsICAgICAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDQsICdsaWMnLCAgICAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDcsICcqJywgICAgICAncHVuY3QgaXRhbGljJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIippdGFsaWMqXCIsICdtZCdcbiAgICAgICAgaW5jIHJncywgMCwgJyonLCAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEsICdpdGFsaWMnLCAndGV4dCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDcsICcqJywgICAgICAncHVuY3QgaXRhbGljJ1xuIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiKmBpdGFsaWMgY29kZWAqXCIsICdtZCdcbiAgICAgICAgaW5jIHJncywgMCwgJyonLCAgICAgICdwdW5jdCBpdGFsaWMnXG4gICAgICAgIGluYyByZ3MsIDEsICdgJywgICAgICAncHVuY3QgaXRhbGljIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnaXRhbGljJywgJ3RleHQgaXRhbGljIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCA5LCAnY29kZScsICAgJ3RleHQgaXRhbGljIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCAxNCwgJyonLCAgICAgJ3B1bmN0IGl0YWxpYydcbiAgICAgICAgXG4gICAgaXQgJ21kIG5vIHN0cmluZycsIC0+XG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJpdCdzIGdvb2RcIiwgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnaXQnLCAgICAgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiJ1wiLCAgICAgICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMywgJ3MnLCAgICAgICd0ZXh0J1xuICAgICAgICBcbiAgICAjIGl0ICdtZCBsaScsIC0+XG4jICAgICAgICAgICAgICAgICBcbiAgICAgICAgIyByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiLSBsaVwiLCAnbWQnXG4gICAgICAgICMgaW5jIHJncywgMCwgJy0nLCAgJ2xpMSBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgMiwgJ2xpJywgJ2xpMSdcbiMgICAgICAgICBcbiAgICAgICAgIyByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiICAgIC0gKipib2xkKipcIiwgJ21kJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICctJywgICAgJ2xpMiBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgOCwgJ2JvbGQnLCAnbGkyIGJvbGQnXG4jICAgICAgICAgXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiAgICAtICoqXCIsICdtZCdcbiAgICAgICAgIyBpbmMgcmdzLCA0LCAnLScsICAgICdsaTIgbWFya2VyJ1xuICAgICAgICAjIGluYyByZ3MsIDYsICcqJywgICAgJ3B1bmN0IGxpMidcbiAgICAgICAgIyBpbmMgcmdzLCA3LCAnKicsICAgICdwdW5jdCBsaTInXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdjb2ZmZWUnLCAtPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiY2xhc3MgTWFjcm8gZXh0ZW5kcyBDb21tYW5kXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICAnY2xhc3MnLCAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA2LCAgJ01hY3JvJywgICAnY2xhc3MnXG4gICAgICAgIGluYyByZ3MsIDEyLCAnZXh0ZW5kcycsICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyMCwgJ0NvbW1hbmQnLCAnY2xhc3MnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZXhpc3Q/LnByb3BcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNywgJ3Byb3AnLCAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJAaGVpZ2h0LzIgKyBAaGVpZ2h0LzZcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgOCwgXCIyXCIsICdudW1iZXInXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiYSBhbmQgYlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImFcIiwgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiYW5kXCIsICdrZXl3b3JkJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJpZiBhIHRoZW4gYlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImlmXCIsICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcImFcIiwgJ3RleHQnXG4gICAgICAgIGluYyByZ3MsIDUsIFwidGhlblwiLCAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMTAsIFwiYlwiLCAndGV4dCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwic3dpdGNoIGFcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJzd2l0Y2hcIiwgJ2tleXdvcmQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiIGE6IGJcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJhXCIsICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMiwgXCI6XCIsICdwdW5jdCBkaWN0aW9uYXJ5J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIm9iai52YWx1ZSA9IG9iai5hbm90aGVyLnZhbHVlXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICBcIm9ialwiLCAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCA0LCAgXCJ2YWx1ZVwiLCAgJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAxMiwgXCJvYmpcIiwgICAgJ29iaidcbiAgICAgICAgaW5jIHJncywgMTYsIFwiYW5vdGhlclwiLCdwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMjQsIFwidmFsdWVcIiwgICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiaWYgc29tZU9iamVjdC5zb21lUHJvcFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImlmXCIsICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcInNvbWVPYmplY3RcIiwgJ29iaidcbiAgICAgICAgaW5jIHJncywgMTMsIFwiLlwiLCAncHVuY3QgcHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDE0LCBcInNvbWVQcm9wXCIsICdwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIxICdhJ1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcIjFcIiwgJ251bWJlcidcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuICAgIGl0ICdjb2ZmZWUgZnVuY3Rpb24nLCAtPlxuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJmZmYgMVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImZmZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImYgJ2EnXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJmZiAnYidcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJmZlwiLCAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZmZmZiAtMVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImZmZmZcIiwgJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImYgWzFdXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZmZmZmYgezF9XCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZmZmZmZcIiwgJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcInBvcz0gKGl0ZW0sIHApIC0+IFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcInBvc1wiLCAnZnVuY3Rpb24nXG4gICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGl0ICdjb2ZmZWUgbWV0aG9kJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgYTogPT5cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJhXCIsICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiOlwiLCAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIj1cIiwgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiPlwiLCAncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgYTogLT5cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJhXCIsICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiOlwiLCAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIi1cIiwgJ3B1bmN0IGZ1bmN0aW9uIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiPlwiLCAncHVuY3QgZnVuY3Rpb24gaGVhZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJtdGhkOiAgKGFyZykgICAgPT4gQG1lbWJlciBtZW1hcmdcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgICdtdGhkJywgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgNCwgICc6JywgICAgJ3B1bmN0IG1ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMTYsICc9JywgICAgJ3B1bmN0IGZ1bmN0aW9uIGJvdW5kIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDE3LCAnPicsICAgICdwdW5jdCBmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBpdCAna29mZmVlJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgQDogLT5cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJAXCIsICdtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiOlwiLCAncHVuY3QgbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIi1cIiwgJ3B1bmN0IGZ1bmN0aW9uIHRhaWwnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiPlwiLCAncHVuY3QgZnVuY3Rpb24gaGVhZCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwi4pa4aWYg4pa4dGhlbiDilrhlbGlmIOKWuGVsc2VcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgIFwi4pa4XCIsICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxLCAgXCJpZlwiLCAgICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCA0LCAgXCLilrhcIiwgICAgJ3B1bmN0IG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDUsICBcInRoZW5cIiwgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDEwLCBcIuKWuFwiLCAgICAncHVuY3QgbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTEsIFwiZWxpZlwiLCAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTYsIFwi4pa4XCIsICAgICdwdW5jdCBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxNywgXCJlbHNlXCIsICdtZXRhJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJbMSAneCcgYToxIGM6ZF1cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMSwgIFwiMVwiLCAgICdudW1iZXInXG4gICAgICAgIGluYyByZ3MsIDQsICBcInhcIiwgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNywgIFwiYVwiLCAgICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgaW5jIHJncywgMTEsIFwiY1wiLCAgICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdwdW5jdCcsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzICcvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwJywgJ25vb24nXG4gICAgICAgIGluYyByZ3MsIDAsICAnLycsICAncHVuY3QnXG4gICAgICAgIGluYyByZ3MsIDUsICAnXFxcXCcsICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMTUsICcuJywgICdwdW5jdCdcbiAgICAgICAgaW5jIHJncywgMTksICc6JywgICdwdW5jdCdcbiAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgIFxuICAgIGl0ICdodG1sJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCI8L2Rpdj5cIiwgJ2h0bWwnIFxuICAgICAgICBpbmMgcmdzLCAwLCBcIjxcIiwgICAgJ3B1bmN0IGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiL1wiLCAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMiwgXCJkaXZcIiwgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIj5cIiwgICAgJ3B1bmN0IGtleXdvcmQnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIjxkaXY+XCIsICdodG1sJyBcbiAgICAgICAgaW5jIHJncywgMCwgXCI8XCIsICAgICdwdW5jdCBrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImRpdlwiLCAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiPlwiLCAgICAncHVuY3Qga2V5d29yZCdcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2NwcCBkZWZpbmUnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiNpbmNsdWRlXCIsICdjcHAnICAgICAgXG4gICAgICAgIGluYyByZ3MsIDAsIFwiI1wiLCAgICAgICAgJ3B1bmN0IGRlZmluZSdcbiAgICAgICAgaW5jIHJncywgMSwgXCJpbmNsdWRlXCIsICAnZGVmaW5lJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIjaWZcIiwgJ2NwcCcgICAgICAgICAgICBcbiAgICAgICAgaW5jIHJncywgMCwgXCIjXCIsICAgICAgICAncHVuY3QgZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImlmXCIsICAgICAgICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiMgIGlmXCIsICdjcHAnICAgICAgICAgICAgXG4gICAgICAgIGluYyByZ3MsIDAsIFwiI1wiLCAgICAgICAgJ3B1bmN0IGRlZmluZSdcbiAgICAgICAgaW5jIHJncywgMywgXCJpZlwiLCAgICAgICAnZGVmaW5lJ1xuICAgICAgICAgICAgXG4gICAgaXQgJ2NwcCBrZXl3b3JkJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJpZiAodHJ1ZSkge30gZWxzZSB7fVwiLCAnY3BwJyAgICBcbiAgICAgICAgaW5jIHJncywgMCwgXCJpZlwiLCAgICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNCwgXCJ0cnVlXCIsICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMTMsIFwiZWxzZVwiLCAna2V5d29yZCdcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBpdCAnY3BwIGZsb2F0JywgLT5cblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiMS4wZlwiLCAnY3BwJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcIjFcIiwgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiLlwiLCAgJ3B1bmN0IG51bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMiwgXCIwZlwiLCAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIwLjAwMDBmXCIsICdjcHAnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiMDAwMGZcIiwgJ251bWJlciBmbG9hdCdcbiAgICAgICBcbiAgICAjIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICAjIGl0ICdpc3MnLCAtPlxuIyAgICAgICAgIFxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJhPXsja2V5fVwiLCAnaXNzJ1xuICAgICAgICAjIGluYyByZ3MsIDIsICd7JywgICAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgMywgXCIjXCIsICAgJ3B1bmN0IHByb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDQsICdrZXknLCAncHJvcGVydHkgdGV4dCdcbiAgICAgICAgIyBpbmMgcmdzLCA3LCBcIn1cIiwgICAncHVuY3QgcHJvcGVydHknXG4gICAgICAgIFxuICAgICMgICAgICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAgICAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnanMnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImZ1bmMgPSBmdW5jdGlvbigpIHtcIiwgJ2pzJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnZnVuYycsICdmdW5jdGlvbidcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzaCcsIC0+XG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImRpci9wYXRoL3dpdGgvZGFzaGVzL2ZpbGUudHh0XCIsICdzaCdcbiAgICAgICAgaW5jIHJncywgMCwgJ2RpcicsICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgNCwgJ3BhdGgnLCAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDksICd3aXRoJywgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCAxNCwgJ2Rhc2hlcycsICd0ZXh0IGRpcidcbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcImRpci9wYXRoLXdpdGgtZGFzaGVzL2ZpbGUudHh0XCIsICdzaCdcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAnZGlyJywgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDQsICdwYXRoJywgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDksICd3aXRoJywgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDE0LCAnZGFzaGVzJywgJ2RpciB0ZXh0J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcInByZyAtLWFyZzEgLWFyZzJcIiwgJ3NoJ1xuICAgICAgICBpbmMgcmdzLCA0LCAnLScsICdwdW5jdCBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgNSwgJy0nLCAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDYsICdhcmcxJywgJ2FyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCAxMSwgJy0nLCAncHVuY3QgYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDEyLCAnYXJnMicsICdhcmd1bWVudCdcbiAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnbG9nJywgLT5cblxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJodHRwOi8vZG9tYWluLmNvbVwiLCAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAsICdodHRwJywgJ3VybCBwcm90b2NvbCdcbiAgICAgICAgIyBpbmMgcmdzLCA0LCAnOicsICdwdW5jdCB1cmwnXG4gICAgICAgICMgaW5jIHJncywgNSwgJy8nLCAncHVuY3QgdXJsJ1xuICAgICAgICAjIGluYyByZ3MsIDYsICcvJywgJ3B1bmN0IHVybCdcbiAgICAgICAgIyBpbmMgcmdzLCA3LCAnZG9tYWluJywgJ3VybCBkb21haW4nXG4gICAgICAgICMgaW5jIHJncywgMTMsICcuJywgJ3B1bmN0IHVybCB0bGQnXG4gICAgICAgICMgaW5jIHJncywgMTQsICdjb20nLCAndXJsIHRsZCdcbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcImZpbGUuY29mZmVlXCIsICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCwgJ2ZpbGUnLCAnY29mZmVlIGZpbGUnXG4gICAgICAgICMgaW5jIHJncywgNCwgJy4nLCAncHVuY3QgY29mZmVlJ1xuICAgICAgICAjIGluYyByZ3MsIDUsICdjb2ZmZWUnLCAnY29mZmVlIGV4dCdcblxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJrZXkgL1wiLCAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAsICdrZXknLCAgICd0ZXh0J1xuXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcIi9zb21lL3BhdGhcIiwgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAxLCAnc29tZScsICAgJ2RpciB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDUsICcvJywgICAgICAncHVuY3QgZGlyJ1xuXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcImtleTogdmFsdWVcIiwgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAna2V5JywgICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAjIGluYyByZ3MsIDMsICc6JywgICAgICAncHVuY3QgZGljdGlvbmFyeSdcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICBpdCAnbm9vbicsIC0+XG4gICAgICAgIFxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgICAgcHJvcGVydHkgIHZhbHVlXCIsICdub29uJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICdwcm9wZXJ0eScsICdwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCAxNCwgJ3ZhbHVlJywgJ3RleHQnXG5cbiAgICAgICAgIyByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiICAgIHByb3AuZXJ0eSAgdmFsdWVcIiwgJ25vb24nXG4gICAgICAgICMgaW5jIHJncywgNCwgJ3Byb3AnLCAncHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgOCwgJy4nLCAncHVuY3QgcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgOSwgJ2VydHknLCAncHJvcGVydHknXG4gICAgICAgIFxuZGVzY3JpYmUgJ2Jsb2NrcycsIC0+XG4gICAgXG4gICAgaXQgJ2NvbW1lbnQnLCAtPlxuICAgICBcbiAgICAgICAgYmxvY2tzKFtcIiMjXCJdKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MiBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDpcIiNcIiB2YWx1ZToncHVuY3QgY29tbWVudCcgdHVyZDpcIiMjXCJ9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MSBsZW5ndGg6MSBtYXRjaDpcIiNcIiB2YWx1ZTonY29tbWVudCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgIFxuICAgICAgICBibG9ja3MoW1wiLCNhXCJdKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDpcIixcIiB2YWx1ZToncHVuY3QnIHR1cmQ6IFwiLCNcIn0gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOlwiI1wiIHZhbHVlOidwdW5jdCBjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoyIGxlbmd0aDoxIG1hdGNoOlwiYVwiIHZhbHVlOidjb21tZW50J30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgXG4gICAgaXQgJ2Z1bmN0aW9uJywgLT5cbiAgICBcbiAgICAgICAgYmxvY2tzKFsnLT4nXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6Jy0nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiB0YWlsJyB0dXJkOiAnLT4nfSBcbiAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgbGVuZ3RoOjEgbWF0Y2g6Jz4nIHZhbHVlOidwdW5jdCBmdW5jdGlvbiBoZWFkJ30gXG4gICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgIGJsb2NrcyhbJz0+J10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoyIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsgXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgdGFpbCcgdHVyZDogJz0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gYm91bmQgaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICBibG9ja3MoWydmPS0+MSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6NSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCBsZW5ndGg6MSBtYXRjaDonZicgdmFsdWU6J2Z1bmN0aW9uJ30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDoxIGxlbmd0aDoxIG1hdGNoOic9JyB2YWx1ZToncHVuY3QnICAgICAgICAgICAgICAgdHVyZDonPS0+JyB9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MiBsZW5ndGg6MSBtYXRjaDonLScgdmFsdWU6J3B1bmN0IGZ1bmN0aW9uIHRhaWwnIHR1cmQ6Jy0+J30gXG4gICAgICAgICAgICAgICAgICAgIHtzdGFydDozIGxlbmd0aDoxIG1hdGNoOic+JyB2YWx1ZToncHVuY3QgZnVuY3Rpb24gaGVhZCd9IFxuICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NCBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICBcbiAgICBpdCAnbWluaW1hbCcsIC0+XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBibG9ja3MoWycxJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6JzEnIHZhbHVlOidudW1iZXInfSBdXVxuICAgICAgICBibG9ja3MoWydhJ10pLnNob3VsZC5lcWwgW2V4dDonY29mZmVlJyBjaGFyczoxIGluZGV4OjAgbnVtYmVyOjEgY2h1bmtzOlsge3N0YXJ0OjAgbGVuZ3RoOjEgbWF0Y2g6J2EnIHZhbHVlOid0ZXh0J30gXV1cbiAgICAgICAgYmxvY2tzKFsnLiddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MSBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIHtzdGFydDowIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QnfSBdXVxuICAgIFxuICAgICAgICBibG9ja3MoWycxLmEnXSkuc2hvdWxkLmVxbCBbZXh0Oidjb2ZmZWUnIGNoYXJzOjMgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDowICBsZW5ndGg6MSBtYXRjaDonMScgdmFsdWU6J251bWJlcid9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDoxIG1hdGNoOicuJyB2YWx1ZToncHVuY3QgcHJvcGVydHknfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoyICBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3Byb3BlcnR5J30gXG4gICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGJsb2NrcyhbJysrYSddKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MyBpbmRleDowIG51bWJlcjoxIGNodW5rczpbIFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjAgIGxlbmd0aDoxIG1hdGNoOicrJyB2YWx1ZToncHVuY3QnLCB0dXJkOicrKyd9IFxuICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDoxIG1hdGNoOicrJyB2YWx1ZToncHVuY3QnfSBcbiAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoyICBsZW5ndGg6MSBtYXRjaDonYScgdmFsdWU6J3RleHQnfSBcbiAgICAgICAgICAgICAgICAgICAgIF1dXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgYmxvY2tzKFtcIuKWuGRvYyAnaGVsbG8nXCJdKS5zaG91bGQuZXFsIFtleHQ6J2NvZmZlZScgY2hhcnM6MTIgaW5kZXg6MCBudW1iZXI6MSBjaHVua3M6WyBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6MCAgbGVuZ3RoOjEgbWF0Y2g6J+KWuCcgICAgIHZhbHVlOidwdW5jdCBtZXRhJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjEgIGxlbmd0aDozIG1hdGNoOidkb2MnICAgdmFsdWU6J21ldGEnfSBcbiAgICAgICAgICAgICAgICAgICAgICB7c3RhcnQ6NSAgbGVuZ3RoOjEgbWF0Y2g6XCInXCIgICAgIHZhbHVlOidwdW5jdCBzdHJpbmcgc2luZ2xlJ30gXG4gICAgICAgICAgICAgICAgICAgICAge3N0YXJ0OjYgIGxlbmd0aDo1IG1hdGNoOlwiaGVsbG9cIiB2YWx1ZTonc3RyaW5nIHNpbmdsZSd9IFxuICAgICAgICAgICAgICAgICAgICAgIHtzdGFydDoxMSBsZW5ndGg6MSBtYXRjaDpcIidcIiAgICAgdmFsdWU6J3B1bmN0IHN0cmluZyBzaW5nbGUnfSBcbiAgICAgICAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGl0ICdzcGFjZScsIC0+XG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgW1wieFwiXVxuICAgICAgICBiWzBdLmNodW5rc1swXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDBcbiAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBbXCIgeHhcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyAxXG4gICAgICAgIFxuICAgICAgICBiID0gYmxvY2tzIFtcIiAgICB4eHhcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgW1wiICAgIHggMSAgLCBcIl1cbiAgICAgICAgYlswXS5jaHVua3NbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ3N0YXJ0JyA0XG4gICAgICAgIGJbMF0uY2h1bmtzWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdzdGFydCcgNlxuICAgICAgICBiWzBdLmNodW5rc1syXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnc3RhcnQnIDlcbiAgICBcbiAgICBpdCAnc3dpdGNoZXMnLCAtPlxuICAgICAgICBcbiAgICAgICAgYiA9IGJsb2NrcyBcIlwiXCJcbiAgICAgICAgICAgIOKWuGRvYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgICBcbiAgICAgICAgICAgICAgICB5XG4gICAgICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJ1xuICAgICAgICAgICAgICAgIHggIFxuICAgICAgICAgICAgICAgIGBgYGNvZmZlZXNjcmlwdFxuICAgICAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgICAgICBgYGBcbiAgICAgICAgICAgICAgICB5XG4gICAgICAgICAgICAxXCJcIlwiLnNwbGl0ICdcXG4nXG4gICAgICAgIGJbMF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbMl0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzNdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICDilrhkb2MgJ2hlbGxvJyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgYGBgY29mZmVlc2NyaXB0ICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgMSsxICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICDilrhkb2MgJ2FnYWluJyAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvbWUgKipkb2NzKiogICAgIFxuICAgICAgICAgICAgICAgIGBgYCAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgeSAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIDFcIlwiXCIuc3BsaXQgJ1xcbicgICAgICAgICAgICAgICBcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsyXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbM10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2NvZmZlZSdcbiAgICAgICAgYls0XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzVdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYls2XS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbN10uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ21kJ1xuICAgICAgICBiWzhdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgICAgIFxuICAgICAgICBiID0gYmxvY2tzIFwiXCJcIlxuICAgICAgICAgICAg4pa4ZG9vYyAnaGVsbG8nXG4gICAgICAgICAgICAgICAgeCAgXG4gICAgICAgICAgICBcIlwiXCIuc3BsaXQgJ1xcbidcbiAgICAgICAgYlswXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzFdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdjb2ZmZWUnXG4gICAgXG4gICAgICAgIGIgPSBibG9ja3MgXCJcIlwiXG4gICAgICAgICAgICBgYGBjb2ZmZWVzY3JpcHRcbiAgICAgICAgICAgICAgICAxKzFcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICAgICAgICAgIDErMTtcbiAgICAgICAgICAgIGBgYFxuICAgICAgICAgICAgXCJcIlwiLnNwbGl0KCdcXG4nKSwgJ21kJ1xuICAgICAgICBiWzBdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlsxXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnY29mZmVlJ1xuICAgICAgICBiWzJdLnNob3VsZC5pbmNsdWRlLnByb3BlcnR5ICdleHQnICdtZCdcbiAgICAgICAgYlszXS5zaG91bGQuaW5jbHVkZS5wcm9wZXJ0eSAnZXh0JyAnbWQnXG4gICAgICAgIGJbNF0uc2hvdWxkLmluY2x1ZGUucHJvcGVydHkgJ2V4dCcgJ2pzJ1xuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/test.coffee