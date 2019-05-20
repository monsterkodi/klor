// koffee 0.43.0

/*
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000
 */
var Blocks, inc, nut;

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

describe('Blocks', function() {
    it('regexp', function() {
        var rgs;
        rgs = Blocks.ranges("r=/a/", 'coffee');
        inc(rgs, 2, '/', 'punctuation regexp start');
        inc(rgs, 3, 'a', 'text regexp');
        inc(rgs, 4, '/', 'punctuation regexp end');
        rgs = Blocks.ranges("/(a|.*|\s\d\w\S\W$|^\s+)/", 'coffee');
        inc(rgs, 0, '/', 'punctuation regexp start');
        inc(rgs, 2, 'a', 'text regexp');
        rgs = Blocks.ranges("/^#include/", 'coffee');
        inc(rgs, 0, '/', 'punctuation regexp start');
        inc(rgs, 2, "#", 'punctuation regexp');
        inc(rgs, 3, "include", 'text regexp');
        rgs = Blocks.ranges("/\\'hello\\'/ ", 'coffee');
        inc(rgs, 0, '/', 'punctuation regexp start');
        inc(rgs, 1, "\\", 'punctuation regexp');
        inc(rgs, 2, "'", 'punctuation regexp');
        inc(rgs, 3, "hello", 'text regexp');
        rgs = Blocks.ranges("f a /b - c/gi", 'coffee');
        inc(rgs, 4, '/', 'punctuation regexp start');
        inc(rgs, 5, 'b', 'text regexp');
        return inc(rgs, 10, '/', 'punctuation regexp end');
    });
    it('no regexp', function() {
        var rgs;
        rgs = Blocks.ranges('a / b - c / d', 'coffee');
        nut(rgs, 2, '/', 'punctuation regexp');
        rgs = Blocks.ranges('f a/b, c/d', 'coffee');
        return nut(rgs, 3, '/', 'punctuation regexp');
    });
    it('require', function() {
        var rgs;
        rgs = Blocks.ranges("util = require 'util'", 'coffee');
        return inc(rgs, 7, 'require', 'require');
    });
    it('comments', function() {
        var rgs;
        rgs = Blocks.ranges("hello # world", 'coffee');
        inc(rgs, 6, "#", 'punctuation comment');
        inc(rgs, 8, "world", 'comment');
        rgs = Blocks.ranges("   # bla blub", 'noon');
        inc(rgs, 3, "#", 'punctuation comment');
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
        inc(rgs, 0, "#", 'punctuation comment triple');
        inc(rgs, 1, "#", 'punctuation comment triple');
        inc(rgs, 2, "#", 'punctuation comment triple');
        inc(rgs, 3, "a", 'comment triple');
        inc(rgs, 4, "#", 'punctuation comment triple');
        inc(rgs, 5, "#", 'punctuation comment triple');
        inc(rgs, 6, "#", 'punctuation comment triple');
        dss = Blocks.dissect("###\na\n###".split('\n'), 'coffee');
        inc(dss[0], 0, "#", 'punctuation comment triple');
        inc(dss[0], 1, "#", 'punctuation comment triple');
        inc(dss[0], 2, "#", 'punctuation comment triple');
        inc(dss[1], 0, "a", 'comment triple');
        inc(dss[2], 0, "#", 'punctuation comment triple');
        inc(dss[2], 1, "#", 'punctuation comment triple');
        return inc(dss[2], 2, "#", 'punctuation comment triple');
    });
    it('comment header', function() {
        var dss, rgs;
        rgs = Blocks.ranges("# 0 00 0000", 'coffee');
        inc(rgs, 0, "#", 'punctuation comment');
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
        inc(rgs, 2, ".", 'punctuation number float');
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
        inc(rgs, 2, ".", 'punctuation semver');
        inc(rgs, 3, "70", 'semver');
        inc(rgs, 5, ".", 'punctuation semver');
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
        inc(rgs, 2, '"', 'punctuation string double');
        inc(rgs, 4, '"', 'string double');
        inc(rgs, 5, 'E', 'string double');
        inc(rgs, 8, '"', 'punctuation string double');
        rgs = Blocks.ranges('a="\'X\'"');
        inc(rgs, 2, '"', 'punctuation string double');
        inc(rgs, 3, "'", 'string double');
        inc(rgs, 4, "X", 'string double');
        inc(rgs, 6, '"', 'punctuation string double');
        rgs = Blocks.ranges('a=\'"X"\'', 'coffee');
        inc(rgs, 2, "'", 'punctuation string single');
        inc(rgs, 3, '"', 'string single');
        inc(rgs, 4, 'X', 'string single');
        inc(rgs, 6, "'", 'punctuation string single');
        rgs = Blocks.ranges('a=`"X"`');
        inc(rgs, 2, "`", 'punctuation string backtick');
        inc(rgs, 3, '"', 'string backtick');
        inc(rgs, 4, 'X', 'string backtick');
        inc(rgs, 6, "`", 'punctuation string backtick');
        rgs = Blocks.ranges('a="  \'X\'  Y  " ');
        inc(rgs, 2, '"', 'punctuation string double');
        inc(rgs, 5, "'", 'string double');
        inc(rgs, 6, "X", 'string double');
        inc(rgs, 7, "'", 'string double');
        inc(rgs, 13, '"', 'punctuation string double');
        rgs = Blocks.ranges('a="";b=" ";c="X"');
        ref = [2, 3, 7, 9, 13, 15];
        for (j = 0, len = ref.length; j < len; j++) {
            i = ref[j];
            inc(rgs, i, '"', 'punctuation string double');
        }
        inc(rgs, 14, 'X', 'string double');
        rgs = Blocks.ranges("a='';b=' ';c='Y'", 'coffee');
        ref1 = [2, 3, 7, 9, 13, 15];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
            i = ref1[k];
            inc(rgs, i, "'", 'punctuation string single');
        }
        inc(rgs, 14, 'Y', 'string single');
        rgs = Blocks.ranges("a=``;b=` `;c=`Z`");
        ref2 = [2, 3, 7, 9, 13, 15];
        for (l = 0, len2 = ref2.length; l < len2; l++) {
            i = ref2[l];
            inc(rgs, i, "`", 'punctuation string backtick');
        }
        return inc(rgs, 14, 'Z', 'string backtick');
    });
    it('interpolation', function() {
        var rgs;
        rgs = Blocks.ranges('"#{xxx}"', 'coffee');
        inc(rgs, 0, '"', 'punctuation string double');
        inc(rgs, 3, 'xxx', 'text');
        inc(rgs, 7, '"', 'punctuation string double');
        rgs = Blocks.ranges('"#{666}"', 'coffee');
        inc(rgs, 0, '"', 'punctuation string double');
        inc(rgs, 3, '666', 'number');
        return inc(rgs, 7, '"', 'punctuation string double');
    });
    it('md bold', function() {
        var rgs;
        rgs = Blocks.ranges("**bold**", 'md');
        inc(rgs, 0, '*', 'punctuation bold');
        inc(rgs, 1, '*', 'punctuation bold');
        inc(rgs, 2, 'bold', 'text bold');
        inc(rgs, 6, '*', 'punctuation bold');
        return inc(rgs, 7, '*', 'punctuation bold');
    });
    it('md italic', function() {
        var rgs;
        rgs = Blocks.ranges("*it lic*", 'md');
        inc(rgs, 0, '*', 'punctuation italic');
        inc(rgs, 1, 'it', 'text italic');
        inc(rgs, 4, 'lic', 'text italic');
        inc(rgs, 7, '*', 'punctuation italic');
        rgs = Blocks.ranges("*italic*", 'md');
        inc(rgs, 0, '*', 'punctuation italic');
        inc(rgs, 1, 'italic', 'text italic');
        inc(rgs, 7, '*', 'punctuation italic');
        rgs = Blocks.ranges("*`italic code`*", 'md');
        inc(rgs, 0, '*', 'punctuation italic');
        inc(rgs, 1, '`', 'punctuation italic backtick');
        inc(rgs, 2, 'italic', 'text italic backtick');
        inc(rgs, 9, 'code', 'text italic backtick');
        return inc(rgs, 14, '*', 'punctuation italic');
    });
    it('md no string', function() {
        var rgs;
        rgs = Blocks.ranges("it's good", 'md');
        inc(rgs, 0, 'it', 'text');
        inc(rgs, 2, "'", 'punctuation');
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
        inc(rgs, 2, ":", 'punctuation dictionary');
        rgs = Blocks.ranges("obj.value = obj.another.value", 'coffee');
        inc(rgs, 0, "obj", 'obj');
        inc(rgs, 4, "value", 'property');
        inc(rgs, 12, "obj", 'obj');
        inc(rgs, 16, "another", 'property');
        inc(rgs, 24, "value", 'property');
        rgs = Blocks.ranges("if someObject.someProp", 'coffee');
        inc(rgs, 0, "if", 'keyword');
        inc(rgs, 3, "someObject", 'obj');
        inc(rgs, 13, ".", 'punctuation property');
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
        inc(rgs, 2, ":", 'punctuation method');
        inc(rgs, 4, "=", 'punctuation function bound tail');
        inc(rgs, 5, ">", 'punctuation function bound head');
        rgs = Blocks.ranges(" a: ->", 'coffee');
        inc(rgs, 1, "a", 'method');
        inc(rgs, 2, ":", 'punctuation method');
        inc(rgs, 4, "-", 'punctuation function tail');
        inc(rgs, 5, ">", 'punctuation function head');
        rgs = Blocks.ranges("mthd:  (arg)    => @member memarg", 'coffee');
        inc(rgs, 0, 'mthd', 'method');
        inc(rgs, 4, ':', 'punctuation method');
        inc(rgs, 16, '=', 'punctuation function bound tail');
        return inc(rgs, 17, '>', 'punctuation function bound head');
    });
    it('koffee', function() {
        var rgs;
        rgs = Blocks.ranges(" @: ->", 'coffee');
        inc(rgs, 1, "@", 'method');
        inc(rgs, 2, ":", 'punctuation method');
        inc(rgs, 4, "-", 'punctuation function tail');
        inc(rgs, 5, ">", 'punctuation function head');
        rgs = Blocks.ranges("▸if ▸then ▸elif ▸else", 'coffee');
        inc(rgs, 0, "▸", 'punctuation meta');
        inc(rgs, 1, "if", 'meta');
        inc(rgs, 4, "▸", 'punctuation meta');
        inc(rgs, 5, "then", 'meta');
        inc(rgs, 10, "▸", 'punctuation meta');
        inc(rgs, 11, "elif", 'meta');
        inc(rgs, 16, "▸", 'punctuation meta');
        inc(rgs, 17, "else", 'meta');
        rgs = Blocks.ranges("[1 'x' a:1 c:d]", 'coffee');
        inc(rgs, 1, "1", 'number');
        inc(rgs, 4, "x", 'string single');
        inc(rgs, 7, "a", 'dictionary key');
        return inc(rgs, 11, "c", 'dictionary key');
    });
    it('punctuation', function() {
        var rgs;
        rgs = Blocks.ranges('/some\\path/file.txt:10', 'noon');
        inc(rgs, 0, '/', 'punctuation');
        inc(rgs, 5, '\\', 'punctuation');
        inc(rgs, 15, '.', 'punctuation');
        return inc(rgs, 19, ':', 'punctuation');
    });
    it('html', function() {
        var rgs;
        rgs = Blocks.ranges("</div>", 'html');
        inc(rgs, 0, "<", 'punctuation keyword');
        inc(rgs, 1, "/", 'punctuation keyword');
        inc(rgs, 2, "div", 'keyword');
        inc(rgs, 5, ">", 'punctuation keyword');
        rgs = Blocks.ranges("<div>", 'html');
        inc(rgs, 0, "<", 'punctuation keyword');
        inc(rgs, 1, "div", 'keyword');
        return inc(rgs, 4, ">", 'punctuation keyword');
    });
    it('cpp define', function() {
        var rgs;
        rgs = Blocks.ranges("#include", 'cpp');
        inc(rgs, 0, "#", 'punctuation define');
        inc(rgs, 1, "include", 'define');
        rgs = Blocks.ranges("#if", 'cpp');
        inc(rgs, 0, "#", 'punctuation define');
        inc(rgs, 1, "if", 'define');
        rgs = Blocks.ranges("#  if", 'cpp');
        inc(rgs, 0, "#", 'punctuation define');
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
        inc(rgs, 1, ".", 'punctuation number float');
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
        inc(rgs, 4, '-', 'punctuation argument');
        inc(rgs, 5, '-', 'punctuation argument');
        inc(rgs, 6, 'arg1', 'argument');
        inc(rgs, 11, '-', 'punctuation argument');
        return inc(rgs, 12, 'arg2', 'argument');
    });
    it('log', function() {});
    return it('noon', function() {});
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxVQUFSOztBQUNULE9BQUEsQ0FBUSxLQUFSLENBQWMsQ0FBQyxJQUFmLENBQUE7O0FBRUEsR0FBQSxHQUFNLFNBQUMsR0FBRCxFQUFNLEtBQU4sRUFBYSxLQUFiLEVBQW9CLEtBQXBCO1dBQThCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQWhCLENBQTRCO1FBQUEsS0FBQSxFQUFNLEtBQU47UUFBYSxLQUFBLEVBQU0sS0FBbkI7UUFBMEIsS0FBQSxFQUFNLEtBQWhDO0tBQTVCO0FBQTlCOztBQUNOLEdBQUEsR0FBTSxTQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWEsS0FBYixFQUFvQixLQUFwQjtXQUE4QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBcEIsQ0FBNEI7UUFBQSxLQUFBLEVBQU0sS0FBTjtRQUFhLEtBQUEsRUFBTSxLQUFuQjtRQUEwQixLQUFBLEVBQU0sS0FBaEM7S0FBNUI7QUFBOUI7O0FBRU4sUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQTtJQVFmLEVBQUEsQ0FBRyxRQUFILEVBQWEsU0FBQTtBQUNULFlBQUE7UUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxPQUFkLEVBQXVCLFFBQXZCO1FBQ04sR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQiwwQkFBakI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLGFBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksR0FBWixFQUFpQix3QkFBakI7UUFFQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYywyQkFBZCxFQUEyQyxRQUEzQztRQUNOLEdBQUEsQ0FB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QUFJLEdBQUosRUFBUyxDQUFULEVBQVksTUFBWixFQUFvQixVQUFwQjtJQUhLLENBQVQ7SUFXQSxFQUFBLENBQUcsSUFBSCxFQUFTLFNBQUE7QUFFTCxZQUFBO1FBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsK0JBQWQsRUFBK0MsSUFBL0M7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxLQUFaLEVBQW1CLFVBQW5CO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksTUFBWixFQUFvQixVQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLE1BQVosRUFBb0IsVUFBcEI7UUFDQSxHQUFBLENBQUksR0FBSixFQUFTLEVBQVQsRUFBYSxRQUFiLEVBQXVCLFVBQXZCO1FBUUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxNQUFQLENBQWMsa0JBQWQsRUFBa0MsSUFBbEM7UUFDTixHQUFBLENBQUksR0FBSixFQUFTLENBQVQsRUFBWSxHQUFaLEVBQWlCLHNCQUFqQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosRUFBaUIsc0JBQWpCO1FBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxDQUFULEVBQVksTUFBWixFQUFvQixVQUFwQjtRQUNBLEdBQUEsQ0FBSSxHQUFKLEVBQVMsRUFBVCxFQUFhLEdBQWIsRUFBa0Isc0JBQWxCO2VBQ0EsR0FBQSxDQUFJLEdBQUosRUFBUyxFQUFULEVBQWEsTUFBYixFQUFxQixVQUFyQjtJQW5CSyxDQUFUO0lBMkJBLEVBQUEsQ0FBRyxLQUFILEVBQVUsU0FBQSxHQUFBLENBQVY7V0FpQ0EsRUFBQSxDQUFHLE1BQUgsRUFBVyxTQUFBLEdBQUEsQ0FBWDtBQTdrQmUsQ0FBbkIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgICAgICAgMDAwICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICBcbiMjI1xuXG5CbG9ja3MgPSByZXF1aXJlICcuL2Jsb2NrcydcbnJlcXVpcmUoJ2t4aycpLmNoYWkoKVxuXG5pbmMgPSAocmdzLCBzdGFydCwgbWF0Y2gsIHZhbHVlKSAtPiByZ3Muc2hvdWxkLmRlZXAuaW5jbHVkZSAgICAgc3RhcnQ6c3RhcnQsIG1hdGNoOm1hdGNoLCB2YWx1ZTp2YWx1ZVxubnV0ID0gKHJncywgc3RhcnQsIG1hdGNoLCB2YWx1ZSkgLT4gcmdzLnNob3VsZC5ub3QuZGVlcC5pbmNsdWRlIHN0YXJ0OnN0YXJ0LCBtYXRjaDptYXRjaCwgdmFsdWU6dmFsdWVcbiAgICBcbmRlc2NyaWJlICdCbG9ja3MnLCAtPlxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICBcbiAgICBpdCAncmVnZXhwJywgLT5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcInI9L2EvXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDIsICcvJywgJ3B1bmN0dWF0aW9uIHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMywgJ2EnLCAndGV4dCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDQsICcvJywgJ3B1bmN0dWF0aW9uIHJlZ2V4cCBlbmQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIvKGF8Lip8XFxzXFxkXFx3XFxTXFxXJHxeXFxzKykvXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICcvJywgJ3B1bmN0dWF0aW9uIHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMiwgJ2EnLCAndGV4dCByZWdleHAnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIi9eI2luY2x1ZGUvXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsICcvJywgICAgICAgJ3B1bmN0dWF0aW9uIHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgMiwgXCIjXCIsICAgICAgICdwdW5jdHVhdGlvbiByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDMsIFwiaW5jbHVkZVwiLCAndGV4dCByZWdleHAnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIi9cXFxcJ2hlbGxvXFxcXCcvIFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnLycsICAgICAgICdwdW5jdHVhdGlvbiByZWdleHAgc3RhcnQnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiXFxcXFwiLCAgICAgICdwdW5jdHVhdGlvbiByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDIsIFwiJ1wiLCAgICAgICAncHVuY3R1YXRpb24gcmVnZXhwJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcImhlbGxvXCIsICAgJ3RleHQgcmVnZXhwJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJmIGEgL2IgLSBjL2dpXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDQsICcvJywgJ3B1bmN0dWF0aW9uIHJlZ2V4cCBzdGFydCdcbiAgICAgICAgaW5jIHJncywgNSwgJ2InLCAndGV4dCByZWdleHAnXG4gICAgICAgIGluYyByZ3MsIDEwLCAnLycsICdwdW5jdHVhdGlvbiByZWdleHAgZW5kJ1xuICAgICAgICBcbiAgICBpdCAnbm8gcmVnZXhwJywgLT5cbiAgICAgICAgXG4gICAgICAgICMgZiBhIC8gYiAtIGMvZ2lcbiAgICAgICAgIyBmIGEvYiAtIGMvZ2lcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJ2EgLyBiIC0gYyAvIGQnLCAnY29mZmVlJ1xuICAgICAgICBudXQgcmdzLCAyLCAnLycsICdwdW5jdHVhdGlvbiByZWdleHAnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyAnZiBhL2IsIGMvZCcsICdjb2ZmZWUnXG4gICAgICAgIG51dCByZ3MsIDMsICcvJywgJ3B1bmN0dWF0aW9uIHJlZ2V4cCdcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIGl0ICdyZXF1aXJlJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJ1dGlsID0gcmVxdWlyZSAndXRpbCdcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNywgJ3JlcXVpcmUnLCAncmVxdWlyZSdcbiAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnY29tbWVudHMnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImhlbGxvICMgd29ybGRcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgNiwgXCIjXCIsICAgICdwdW5jdHVhdGlvbiBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA4LCBcIndvcmxkXCIsICdjb21tZW50J1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgICAjIGJsYSBibHViXCIsICdub29uJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcIiNcIiwgICAgICdwdW5jdHVhdGlvbiBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA1LCBcImJsYVwiLCAgICdjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCA5LCBcImJsdWJcIiwgICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgaXQgJ25vIGNvbW1lbnQnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiheXFxzKiNcXHMqKSguKikkXCIsICdub29uJ1xuICAgICAgICBmb3Igcm5nIGluIHJnc1xuICAgICAgICAgICAgcm5nLnNob3VsZC5ub3QuaGF2ZS5wcm9wZXJ0eSAndmFsdWUnLCAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgIGl0ICd0cmlwbGUgY29tbWVudCcsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiIyMjYSMjI1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcIiNcIiwgJ3B1bmN0dWF0aW9uIGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcIiNcIiwgJ3B1bmN0dWF0aW9uIGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcIiNcIiwgJ3B1bmN0dWF0aW9uIGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcImFcIiwgJ2NvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIiNcIiwgJ3B1bmN0dWF0aW9uIGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA1LCBcIiNcIiwgJ3B1bmN0dWF0aW9uIGNvbW1lbnQgdHJpcGxlJ1xuICAgICAgICBpbmMgcmdzLCA2LCBcIiNcIiwgJ3B1bmN0dWF0aW9uIGNvbW1lbnQgdHJpcGxlJ1xuXG4gICAgICAgIGRzcyA9IEJsb2Nrcy5kaXNzZWN0IFwiIyMjXFxuYVxcbiMjI1wiLnNwbGl0KCdcXG4nKSwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMCwgXCIjXCIsICdwdW5jdHVhdGlvbiBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMSwgXCIjXCIsICdwdW5jdHVhdGlvbiBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1swXSwgMiwgXCIjXCIsICdwdW5jdHVhdGlvbiBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1sxXSwgMCwgXCJhXCIsICdjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMCwgXCIjXCIsICdwdW5jdHVhdGlvbiBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMSwgXCIjXCIsICdwdW5jdHVhdGlvbiBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgaW5jIGRzc1syXSwgMiwgXCIjXCIsICdwdW5jdHVhdGlvbiBjb21tZW50IHRyaXBsZSdcbiAgICAgICAgXG4gICAgaXQgJ2NvbW1lbnQgaGVhZGVyJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIjIDAgMDAgMDAwMFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAgXCIjXCIsICAgICdwdW5jdHVhdGlvbiBjb21tZW50J1xuICAgICAgICBpbmMgcmdzLCAyLCAgXCIwXCIsICAgICdjb21tZW50IGhlYWRlcidcbiAgICAgICAgaW5jIHJncywgNCwgIFwiMDBcIiwgICAnY29tbWVudCBoZWFkZXInXG4gICAgICAgIGluYyByZ3MsIDcsICBcIjAwMDBcIiwgJ2NvbW1lbnQgaGVhZGVyJ1xuXG4gICAgICAgIGRzcyA9IEJsb2Nrcy5kaXNzZWN0IFwiIyMjXFxuIDAgMDAgMCBcXG4jIyNcIi5zcGxpdCgnXFxuJyksICdjb2ZmZWUnXG4gICAgICAgIGluYyBkc3NbMV0sIDEsIFwiMFwiLCAnY29tbWVudCB0cmlwbGUgaGVhZGVyJ1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ251bWJlcnMnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImEgNjY3MFwiXG4gICAgICAgIGluYyByZ3MsIDIsIFwiNjY3MFwiLCAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIweDY2N0FDXCJcbiAgICAgICAgaW5jIHJncywgMCwgXCIweDY2N0FDXCIsICdudW1iZXIgaGV4J1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCI2Ni43MDBcIlxuICAgICAgICBpbmMgcmdzLCAwLCBcIjY2XCIsICAnbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAyLCBcIi5cIiwgICAncHVuY3R1YXRpb24gbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAzLCBcIjcwMFwiLCAnbnVtYmVyIGZsb2F0J1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCI3Ny44MDAgLTEwMFwiXG4gICAgICAgIGluYyByZ3MsIDAsIFwiNzdcIiwgICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDgsIFwiMTAwXCIsICdudW1iZXInXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIig4LjksMTAwLjIpXCJcbiAgICAgICAgaW5jIHJncywgMywgXCI5XCIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGluYyByZ3MsIDksIFwiMlwiLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdzZW12ZXInLCAtPiAgICBcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCI2Ni43MC4wXCJcbiAgICAgICAgaW5jIHJncywgMCwgXCI2NlwiLCAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcIi5cIiwgICdwdW5jdHVhdGlvbiBzZW12ZXInXG4gICAgICAgIGluYyByZ3MsIDMsIFwiNzBcIiwgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSwgXCIuXCIsICAncHVuY3R1YXRpb24gc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCA2LCBcIjBcIiwgICdzZW12ZXInXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIl4wLjcuMVwiXG4gICAgICAgIGluYyByZ3MsIDEsIFwiMFwiLCAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcIjdcIiwgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSwgXCIxXCIsICdzZW12ZXInXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIl4xLjAuMC1hbHBoYS4xMlwiXG4gICAgICAgIGluYyByZ3MsIDEsIFwiMVwiLCAnc2VtdmVyJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcIjBcIiwgJ3NlbXZlcidcbiAgICAgICAgaW5jIHJncywgNSwgXCIwXCIsICdzZW12ZXInXG4gICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBpdCAnc3RyaW5ncycsIC0+XG4gICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJcIlwiYT1cIlxcXFxcIkVcXFxcXCJcIiBcIlwiXCJcbiAgICAgICAgaW5jIHJncywgMiwgJ1wiJywgICAgJ3B1bmN0dWF0aW9uIHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDQsICdcIicsICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA1LCAnRScsICAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA4LCAnXCInLCAgICAncHVuY3R1YXRpb24gc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJ2E9XCJcXCdYXFwnXCInXG4gICAgICAgIGluYyByZ3MsIDIsICdcIicsICAgJ3B1bmN0dWF0aW9uIHN0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDMsIFwiJ1wiLCAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcIlhcIiwgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNiwgJ1wiJywgICAncHVuY3R1YXRpb24gc3RyaW5nIGRvdWJsZSdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzICdhPVxcJ1wiWFwiXFwnJywgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMiwgXCInXCIsICAgJ3B1bmN0dWF0aW9uIHN0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDMsICdcIicsICAgJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDQsICdYJywgICAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgaW5jIHJncywgNiwgXCInXCIsICAgJ3B1bmN0dWF0aW9uIHN0cmluZyBzaW5nbGUnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyAnYT1gXCJYXCJgJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcImBcIiwgICAncHVuY3R1YXRpb24gc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCAzLCAnXCInLCAgICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDQsICdYJywgICAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBpbmMgcmdzLCA2LCBcImBcIiwgICAncHVuY3R1YXRpb24gc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJ2E9XCIgIFxcJ1hcXCcgIFkgIFwiICdcbiAgICAgICAgaW5jIHJncywgMiwgJ1wiJywgICAncHVuY3R1YXRpb24gc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgNSwgXCInXCIsICAgJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGluYyByZ3MsIDYsIFwiWFwiLCAgICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCA3LCBcIidcIiwgICAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMTMsICdcIicsICAncHVuY3R1YXRpb24gc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzICdhPVwiXCI7Yj1cIiBcIjtjPVwiWFwiJ1xuICAgICAgICBmb3IgaSBpbiBbMiwzLDcsOSwxMywxNV1cbiAgICAgICAgICAgIGluYyByZ3MsIGksICdcIicsICdwdW5jdHVhdGlvbiBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAxNCwgJ1gnLCAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImE9Jyc7Yj0nICc7Yz0nWSdcIiwgJ2NvZmZlZSdcbiAgICAgICAgZm9yIGkgaW4gWzIsMyw3LDksMTMsMTVdXG4gICAgICAgICAgICBpbmMgcmdzLCBpLCBcIidcIiwgJ3B1bmN0dWF0aW9uIHN0cmluZyBzaW5nbGUnXG4gICAgICAgIGluYyByZ3MsIDE0LCAnWScsICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiYT1gYDtiPWAgYDtjPWBaYFwiXG4gICAgICAgIGZvciBpIGluIFsyLDMsNyw5LDEzLDE1XVxuICAgICAgICAgICAgaW5jIHJncywgaSwgXCJgXCIsICdwdW5jdHVhdGlvbiBzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDE0LCAnWicsICdzdHJpbmcgYmFja3RpY2snXG5cbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdpbnRlcnBvbGF0aW9uJywgLT4gICAgXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzICdcIiN7eHh4fVwiJywgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgJ1wiJywgICAncHVuY3R1YXRpb24gc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgaW5jIHJncywgMywgJ3h4eCcsICd0ZXh0J1xuICAgICAgICBpbmMgcmdzLCA3LCAnXCInLCAgICdwdW5jdHVhdGlvbiBzdHJpbmcgZG91YmxlJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJ1wiI3s2NjZ9XCInLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnXCInLCAgICdwdW5jdHVhdGlvbiBzdHJpbmcgZG91YmxlJ1xuICAgICAgICBpbmMgcmdzLCAzLCAnNjY2JywgJ251bWJlcidcbiAgICAgICAgaW5jIHJncywgNywgJ1wiJywgICAncHVuY3R1YXRpb24gc3RyaW5nIGRvdWJsZSdcblxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIGl0ICdtZCBib2xkJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIqKmJvbGQqKlwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICcqJywgICAgICAncHVuY3R1YXRpb24gYm9sZCdcbiAgICAgICAgaW5jIHJncywgMSwgJyonLCAgICAgICdwdW5jdHVhdGlvbiBib2xkJ1xuICAgICAgICBpbmMgcmdzLCAyLCAnYm9sZCcsICAgJ3RleHQgYm9sZCdcbiAgICAgICAgaW5jIHJncywgNiwgJyonLCAgICAgICdwdW5jdHVhdGlvbiBib2xkJ1xuICAgICAgICBpbmMgcmdzLCA3LCAnKicsICAgICAgJ3B1bmN0dWF0aW9uIGJvbGQnXG4gICAgICAgICAgICAgICAgXG4gICAgaXQgJ21kIGl0YWxpYycsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiKml0IGxpYypcIiwgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnKicsICAgICAgJ3B1bmN0dWF0aW9uIGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgMSwgJ2l0JywgICAgICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNCwgJ2xpYycsICAgICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNywgJyonLCAgICAgICdwdW5jdHVhdGlvbiBpdGFsaWMnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiKml0YWxpYypcIiwgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnKicsICAgICAgJ3B1bmN0dWF0aW9uIGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgMSwgJ2l0YWxpYycsICd0ZXh0IGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgNywgJyonLCAgICAgICdwdW5jdHVhdGlvbiBpdGFsaWMnXG4gXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIqYGl0YWxpYyBjb2RlYCpcIiwgJ21kJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnKicsICAgICAgJ3B1bmN0dWF0aW9uIGl0YWxpYydcbiAgICAgICAgaW5jIHJncywgMSwgJ2AnLCAgICAgICdwdW5jdHVhdGlvbiBpdGFsaWMgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDIsICdpdGFsaWMnLCAndGV4dCBpdGFsaWMgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDksICdjb2RlJywgICAndGV4dCBpdGFsaWMgYmFja3RpY2snXG4gICAgICAgIGluYyByZ3MsIDE0LCAnKicsICAgICAncHVuY3R1YXRpb24gaXRhbGljJ1xuICAgICAgICBcbiAgICBpdCAnbWQgbm8gc3RyaW5nJywgLT5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIml0J3MgZ29vZFwiLCAnbWQnXG4gICAgICAgIGluYyByZ3MsIDAsICdpdCcsICAgICAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiwgXCInXCIsICAgICAgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICBpbmMgcmdzLCAzLCAncycsICAgICAgJ3RleHQnXG4gICAgICAgIFxuICAgICMgaXQgJ21kIGxpJywgLT5cbiMgICAgICAgICAgICAgICAgIFxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCItIGxpXCIsICdtZCdcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAnLScsICAnbGkxIG1hcmtlcidcbiAgICAgICAgIyBpbmMgcmdzLCAyLCAnbGknLCAnbGkxJ1xuIyAgICAgICAgIFxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgICAgLSAqKmJvbGQqKlwiLCAnbWQnXG4gICAgICAgICMgaW5jIHJncywgNCwgJy0nLCAgICAnbGkyIG1hcmtlcidcbiAgICAgICAgIyBpbmMgcmdzLCA4LCAnYm9sZCcsICdsaTIgYm9sZCdcbiMgICAgICAgICBcbiAgICAgICAgIyByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiICAgIC0gKipcIiwgJ21kJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICctJywgICAgJ2xpMiBtYXJrZXInXG4gICAgICAgICMgaW5jIHJncywgNiwgJyonLCAgICAncHVuY3R1YXRpb24gbGkyJ1xuICAgICAgICAjIGluYyByZ3MsIDcsICcqJywgICAgJ3B1bmN0dWF0aW9uIGxpMidcbiAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2NvZmZlZScsIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJjbGFzcyBNYWNybyBleHRlbmRzIENvbW1hbmRcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgICdjbGFzcycsICAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDYsICAnTWFjcm8nLCAgICdjbGFzcydcbiAgICAgICAgaW5jIHJncywgMTIsICdleHRlbmRzJywgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDIwLCAnQ29tbWFuZCcsICdjbGFzcydcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJleGlzdD8ucHJvcFwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA3LCAncHJvcCcsICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIkBoZWlnaHQvMiArIEBoZWlnaHQvNlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCA4LCBcIjJcIiwgJ251bWJlcidcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJhIGFuZCBiXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiYVwiLCAndGV4dCdcbiAgICAgICAgaW5jIHJncywgMiwgXCJhbmRcIiwgJ2tleXdvcmQnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImlmIGEgdGhlbiBiXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiaWZcIiwgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDMsIFwiYVwiLCAndGV4dCdcbiAgICAgICAgaW5jIHJncywgNSwgXCJ0aGVuXCIsICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxMCwgXCJiXCIsICd0ZXh0J1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJzd2l0Y2ggYVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcInN3aXRjaFwiLCAna2V5d29yZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgYTogYlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImFcIiwgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCAyLCBcIjpcIiwgJ3B1bmN0dWF0aW9uIGRpY3Rpb25hcnknXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwib2JqLnZhbHVlID0gb2JqLmFub3RoZXIudmFsdWVcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgIFwib2JqXCIsICAgICdvYmonXG4gICAgICAgIGluYyByZ3MsIDQsICBcInZhbHVlXCIsICAncHJvcGVydHknXG4gICAgICAgIGluYyByZ3MsIDEyLCBcIm9ialwiLCAgICAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxNiwgXCJhbm90aGVyXCIsJ3Byb3BlcnR5J1xuICAgICAgICBpbmMgcmdzLCAyNCwgXCJ2YWx1ZVwiLCAgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJpZiBzb21lT2JqZWN0LnNvbWVQcm9wXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiaWZcIiwgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDMsIFwic29tZU9iamVjdFwiLCAnb2JqJ1xuICAgICAgICBpbmMgcmdzLCAxMywgXCIuXCIsICdwdW5jdHVhdGlvbiBwcm9wZXJ0eSdcbiAgICAgICAgaW5jIHJncywgMTQsIFwic29tZVByb3BcIiwgJ3Byb3BlcnR5J1xuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIjEgJ2EnXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiMVwiLCAnbnVtYmVyJ1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4gICAgaXQgJ2NvZmZlZSBmdW5jdGlvbicsIC0+XG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImZmZiAxXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZmZmXCIsICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZiAnYSdcIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJmXCIsICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImZmICdiJ1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCBcImZmXCIsICdmdW5jdGlvbiBjYWxsJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJmZmZmIC0xXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiZmZmZlwiLCAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZiBbMV1cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJmXCIsICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJmZmZmZiB7MX1cIiwgJ2NvZmZlZSdcbiAgICAgICAgaW5jIHJncywgMCwgXCJmZmZmZlwiLCAnZnVuY3Rpb24gY2FsbCdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwicG9zPSAoaXRlbSwgcCkgLT4gXCIsICdjb2ZmZWUnXG4gICAgICAgIGluYyByZ3MsIDAsIFwicG9zXCIsICdmdW5jdGlvbidcbiAgICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgaXQgJ2NvZmZlZSBtZXRob2QnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiBhOiA9PlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImFcIiwgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiwgXCI6XCIsICdwdW5jdHVhdGlvbiBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiPVwiLCAncHVuY3R1YXRpb24gZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSwgXCI+XCIsICdwdW5jdHVhdGlvbiBmdW5jdGlvbiBib3VuZCBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiBhOiAtPlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImFcIiwgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiwgXCI6XCIsICdwdW5jdHVhdGlvbiBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiLVwiLCAncHVuY3R1YXRpb24gZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSwgXCI+XCIsICdwdW5jdHVhdGlvbiBmdW5jdGlvbiBoZWFkJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIm10aGQ6ICAoYXJnKSAgICA9PiBAbWVtYmVyIG1lbWFyZ1wiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAgJ210aGQnLCAnbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCA0LCAgJzonLCAgICAncHVuY3R1YXRpb24gbWV0aG9kJ1xuICAgICAgICBpbmMgcmdzLCAxNiwgJz0nLCAgICAncHVuY3R1YXRpb24gZnVuY3Rpb24gYm91bmQgdGFpbCdcbiAgICAgICAgaW5jIHJncywgMTcsICc+JywgICAgJ3B1bmN0dWF0aW9uIGZ1bmN0aW9uIGJvdW5kIGhlYWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIGl0ICdrb2ZmZWUnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiBAOiAtPlwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcIkBcIiwgJ21ldGhvZCdcbiAgICAgICAgaW5jIHJncywgMiwgXCI6XCIsICdwdW5jdHVhdGlvbiBtZXRob2QnXG4gICAgICAgIGluYyByZ3MsIDQsIFwiLVwiLCAncHVuY3R1YXRpb24gZnVuY3Rpb24gdGFpbCdcbiAgICAgICAgaW5jIHJncywgNSwgXCI+XCIsICdwdW5jdHVhdGlvbiBmdW5jdGlvbiBoZWFkJ1xuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCLilrhpZiDilrh0aGVuIOKWuGVsaWYg4pa4ZWxzZVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAwLCAgXCLilrhcIiwgICAgJ3B1bmN0dWF0aW9uIG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDEsICBcImlmXCIsICAgJ21ldGEnXG4gICAgICAgIGluYyByZ3MsIDQsICBcIuKWuFwiLCAgICAncHVuY3R1YXRpb24gbWV0YSdcbiAgICAgICAgaW5jIHJncywgNSwgIFwidGhlblwiLCAnbWV0YSdcbiAgICAgICAgaW5jIHJncywgMTAsIFwi4pa4XCIsICAgICdwdW5jdHVhdGlvbiBtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxMSwgXCJlbGlmXCIsICdtZXRhJ1xuICAgICAgICBpbmMgcmdzLCAxNiwgXCLilrhcIiwgICAgJ3B1bmN0dWF0aW9uIG1ldGEnXG4gICAgICAgIGluYyByZ3MsIDE3LCBcImVsc2VcIiwgJ21ldGEnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIlsxICd4JyBhOjEgYzpkXVwiLCAnY29mZmVlJ1xuICAgICAgICBpbmMgcmdzLCAxLCAgXCIxXCIsICAgJ251bWJlcidcbiAgICAgICAgaW5jIHJncywgNCwgIFwieFwiLCAgICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBpbmMgcmdzLCA3LCAgXCJhXCIsICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICBpbmMgcmdzLCAxMSwgXCJjXCIsICAgJ2RpY3Rpb25hcnkga2V5J1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3B1bmN0dWF0aW9uJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgJy9zb21lXFxcXHBhdGgvZmlsZS50eHQ6MTAnLCAnbm9vbidcbiAgICAgICAgaW5jIHJncywgMCwgICcvJywgICdwdW5jdHVhdGlvbidcbiAgICAgICAgaW5jIHJncywgNSwgICdcXFxcJywgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICBpbmMgcmdzLCAxNSwgJy4nLCAgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICBpbmMgcmdzLCAxOSwgJzonLCAgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwXG4gICAgXG4gICAgaXQgJ2h0bWwnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIjwvZGl2PlwiLCAnaHRtbCcgXG4gICAgICAgIGluYyByZ3MsIDAsIFwiPFwiLCAgICAncHVuY3R1YXRpb24ga2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgMSwgXCIvXCIsICAgICdwdW5jdHVhdGlvbiBrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAyLCBcImRpdlwiLCAgJ2tleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDUsIFwiPlwiLCAgICAncHVuY3R1YXRpb24ga2V5d29yZCdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiPGRpdj5cIiwgJ2h0bWwnIFxuICAgICAgICBpbmMgcmdzLCAwLCBcIjxcIiwgICAgJ3B1bmN0dWF0aW9uIGtleXdvcmQnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiZGl2XCIsICAna2V5d29yZCdcbiAgICAgICAgaW5jIHJncywgNCwgXCI+XCIsICAgICdwdW5jdHVhdGlvbiBrZXl3b3JkJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnY3BwIGRlZmluZScsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiI2luY2x1ZGVcIiwgJ2NwcCcgICAgICBcbiAgICAgICAgaW5jIHJncywgMCwgXCIjXCIsICAgICAgICAncHVuY3R1YXRpb24gZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAxLCBcImluY2x1ZGVcIiwgICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiNpZlwiLCAnY3BwJyAgICAgICAgICAgIFxuICAgICAgICBpbmMgcmdzLCAwLCBcIiNcIiwgICAgICAgICdwdW5jdHVhdGlvbiBkZWZpbmUnXG4gICAgICAgIGluYyByZ3MsIDEsIFwiaWZcIiwgICAgICAgJ2RlZmluZSdcblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiIyAgaWZcIiwgJ2NwcCcgICAgICAgICAgICBcbiAgICAgICAgaW5jIHJncywgMCwgXCIjXCIsICAgICAgICAncHVuY3R1YXRpb24gZGVmaW5lJ1xuICAgICAgICBpbmMgcmdzLCAzLCBcImlmXCIsICAgICAgICdkZWZpbmUnXG4gICAgICAgICAgICBcbiAgICBpdCAnY3BwIGtleXdvcmQnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcImlmICh0cnVlKSB7fSBlbHNlIHt9XCIsICdjcHAnICAgIFxuICAgICAgICBpbmMgcmdzLCAwLCBcImlmXCIsICAgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCA0LCBcInRydWVcIiwgICdrZXl3b3JkJ1xuICAgICAgICBpbmMgcmdzLCAxMywgXCJlbHNlXCIsICdrZXl3b3JkJ1xuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgICAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIGl0ICdjcHAgZmxvYXQnLCAtPlxuXG4gICAgICAgIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIxLjBmXCIsICdjcHAnXG4gICAgICAgIGluYyByZ3MsIDAsIFwiMVwiLCAgJ251bWJlciBmbG9hdCdcbiAgICAgICAgaW5jIHJncywgMSwgXCIuXCIsICAncHVuY3R1YXRpb24gbnVtYmVyIGZsb2F0J1xuICAgICAgICBpbmMgcmdzLCAyLCBcIjBmXCIsICdudW1iZXIgZmxvYXQnXG5cbiAgICAgICAgcmdzID0gQmxvY2tzLnJhbmdlcyBcIjAuMDAwMGZcIiwgJ2NwcCdcbiAgICAgICAgaW5jIHJncywgMiwgXCIwMDAwZlwiLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgIFxuICAgICMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgICMgaXQgJ2lzcycsIC0+XG4jICAgICAgICAgXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcImE9eyNrZXl9XCIsICdpc3MnXG4gICAgICAgICMgaW5jIHJncywgMiwgJ3snLCAgICdwdW5jdHVhdGlvbiBwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCAzLCBcIiNcIiwgICAncHVuY3R1YXRpb24gcHJvcGVydHknXG4gICAgICAgICMgaW5jIHJncywgNCwgJ2tleScsICdwcm9wZXJ0eSB0ZXh0J1xuICAgICAgICAjIGluYyByZ3MsIDcsIFwifVwiLCAgICdwdW5jdHVhdGlvbiBwcm9wZXJ0eSdcbiAgICAgICAgXG4gICAgIyAgICAgICAwMDAgICAwMDAwMDAwICBcbiAgICAjICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdqcycsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZnVuYyA9IGZ1bmN0aW9uKCkge1wiLCAnanMnXG4gICAgICAgIGluYyByZ3MsIDAsICdmdW5jJywgJ2Z1bmN0aW9uJ1xuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NoJywgLT5cblxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZGlyL3BhdGgvd2l0aC9kYXNoZXMvZmlsZS50eHRcIiwgJ3NoJ1xuICAgICAgICBpbmMgcmdzLCAwLCAnZGlyJywgJ3RleHQgZGlyJ1xuICAgICAgICBpbmMgcmdzLCA0LCAncGF0aCcsICd0ZXh0IGRpcidcbiAgICAgICAgaW5jIHJncywgOSwgJ3dpdGgnLCAndGV4dCBkaXInXG4gICAgICAgIGluYyByZ3MsIDE0LCAnZGFzaGVzJywgJ3RleHQgZGlyJ1xuICAgICAgICBcbiAgICAgICAgIyByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZGlyL3BhdGgtd2l0aC1kYXNoZXMvZmlsZS50eHRcIiwgJ3NoJ1xuICAgICAgICAjIGluYyByZ3MsIDAsICdkaXInLCAnZGlyIHRleHQnXG4gICAgICAgICMgaW5jIHJncywgNCwgJ3BhdGgnLCAnZGlyIHRleHQnXG4gICAgICAgICMgaW5jIHJncywgOSwgJ3dpdGgnLCAnZGlyIHRleHQnXG4gICAgICAgICMgaW5jIHJncywgMTQsICdkYXNoZXMnLCAnZGlyIHRleHQnXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBCbG9ja3MucmFuZ2VzIFwicHJnIC0tYXJnMSAtYXJnMlwiLCAnc2gnXG4gICAgICAgIGluYyByZ3MsIDQsICctJywgJ3B1bmN0dWF0aW9uIGFyZ3VtZW50J1xuICAgICAgICBpbmMgcmdzLCA1LCAnLScsICdwdW5jdHVhdGlvbiBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgNiwgJ2FyZzEnLCAnYXJndW1lbnQnXG4gICAgICAgIGluYyByZ3MsIDExLCAnLScsICdwdW5jdHVhdGlvbiBhcmd1bWVudCdcbiAgICAgICAgaW5jIHJncywgMTIsICdhcmcyJywgJ2FyZ3VtZW50J1xuICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdsb2cnLCAtPlxuXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcImh0dHA6Ly9kb21haW4uY29tXCIsICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMCwgJ2h0dHAnLCAndXJsIHByb3RvY29sJ1xuICAgICAgICAjIGluYyByZ3MsIDQsICc6JywgJ3B1bmN0dWF0aW9uIHVybCdcbiAgICAgICAgIyBpbmMgcmdzLCA1LCAnLycsICdwdW5jdHVhdGlvbiB1cmwnXG4gICAgICAgICMgaW5jIHJncywgNiwgJy8nLCAncHVuY3R1YXRpb24gdXJsJ1xuICAgICAgICAjIGluYyByZ3MsIDcsICdkb21haW4nLCAndXJsIGRvbWFpbidcbiAgICAgICAgIyBpbmMgcmdzLCAxMywgJy4nLCAncHVuY3R1YXRpb24gdXJsIHRsZCdcbiAgICAgICAgIyBpbmMgcmdzLCAxNCwgJ2NvbScsICd1cmwgdGxkJ1xuICAgICAgICBcbiAgICAgICAgIyByZ3MgPSBCbG9ja3MucmFuZ2VzIFwiZmlsZS5jb2ZmZWVcIiwgJ2xvZydcbiAgICAgICAgIyBpbmMgcmdzLCAwLCAnZmlsZScsICdjb2ZmZWUgZmlsZSdcbiAgICAgICAgIyBpbmMgcmdzLCA0LCAnLicsICdwdW5jdHVhdGlvbiBjb2ZmZWUnXG4gICAgICAgICMgaW5jIHJncywgNSwgJ2NvZmZlZScsICdjb2ZmZWUgZXh0J1xuIyAgICAgICAgIFxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCJrZXkgL1wiLCAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAsICdrZXknLCAgICd0ZXh0J1xuIyAgICAgICAgIFxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIvc29tZS9wYXRoXCIsICdsb2cnXG4gICAgICAgICMgaW5jIHJncywgMSwgJ3NvbWUnLCAgICdkaXIgdGV4dCdcbiAgICAgICAgIyBpbmMgcmdzLCA1LCAnLycsICAgICAgJ3B1bmN0dWF0aW9uIGRpcidcbiMgICAgICAgICBcbiAgICAgICAgIyByZ3MgPSBCbG9ja3MucmFuZ2VzIFwia2V5OiB2YWx1ZVwiLCAnbG9nJ1xuICAgICAgICAjIGluYyByZ3MsIDAsICdrZXknLCAgICAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICMgaW5jIHJncywgMywgJzonLCAgICAgICdwdW5jdHVhdGlvbiBkaWN0aW9uYXJ5J1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdub29uJywgLT5cbiAgICAgICAgXG4gICAgICAgICMgcmdzID0gQmxvY2tzLnJhbmdlcyBcIiAgICBwcm9wZXJ0eSAgdmFsdWVcIiwgJ25vb24nXG4gICAgICAgICMgaW5jIHJncywgNCwgJ3Byb3BlcnR5JywgJ3Byb3BlcnR5J1xuICAgICAgICAjIGluYyByZ3MsIDE0LCAndmFsdWUnLCAndGV4dCdcblxuICAgICAgICAjIHJncyA9IEJsb2Nrcy5yYW5nZXMgXCIgICAgcHJvcC5lcnR5ICB2YWx1ZVwiLCAnbm9vbidcbiAgICAgICAgIyBpbmMgcmdzLCA0LCAncHJvcCcsICdwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCA4LCAnLicsICdwdW5jdHVhdGlvbiBwcm9wZXJ0eSdcbiAgICAgICAgIyBpbmMgcmdzLCA5LCAnZXJ0eScsICdwcm9wZXJ0eSdcbiAgICAgICAgIl19
//# sourceURL=../coffee/test.coffee