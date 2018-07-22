(function() {
  /*
  000000000  00000000   0000000  000000000
     000     000       000          000   
     000     0000000   0000000      000   
     000     000            000     000   
     000     00000000  0000000      000   
  */
  var Syntax, assert, chai, expect, log;

  ({log} = require('../../kxk'));

  Syntax = require('../js/syntax');

  assert = require('assert');

  chai = require('chai');

  expect = chai.expect;

  chai.should();

  describe('syntax', function() {
    it('interpolation', function() {
      var rgs;
      rgs = Syntax.ranges('"#{666}"', 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: '"',
        value: 'string double punctuation'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: '666',
        value: 'number'
      });
      return expect(rgs).to.deep.include({
        start: 7,
        match: '"',
        value: 'string double punctuation'
      });
    });
    
    //  0000000  000000000  00000000   000  000   000   0000000    0000000  
    // 000          000     000   000  000  0000  000  000        000       
    // 0000000      000     0000000    000  000 0 000  000  0000  0000000   
    //      000     000     000   000  000  000  0000  000   000       000  
    // 0000000      000     000   000  000  000   000   0000000   0000000   
    it('strings', function() {
      var i, j, k, l, len, len1, len2, ref, ref1, ref2, rgs;
      rgs = Syntax.ranges("a=\"\\\"E\\\"\" ");
      expect(rgs).to.deep.include({
        start: 2,
        match: '"',
        value: 'string double punctuation'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: '\\"E\\"',
        value: 'string double'
      });
      expect(rgs).to.deep.include({
        start: 8,
        match: '"',
        value: 'string double punctuation'
      });
      rgs = Syntax.ranges('a="\'X\'"');
      expect(rgs).to.deep.include({
        start: 2,
        match: '"',
        value: 'string double punctuation'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: "'X'",
        value: 'string double'
      });
      expect(rgs).to.deep.include({
        start: 6,
        match: '"',
        value: 'string double punctuation'
      });
      rgs = Syntax.ranges('a=\'"X"\'');
      expect(rgs).to.deep.include({
        start: 2,
        match: "'",
        value: 'string single punctuation'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: '"X"',
        value: 'string single'
      });
      expect(rgs).to.deep.include({
        start: 6,
        match: "'",
        value: 'string single punctuation'
      });
      rgs = Syntax.ranges('a=`"X"`');
      expect(rgs).to.deep.include({
        start: 2,
        match: "`",
        value: 'string backtick punctuation'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: '"X"',
        value: 'string backtick'
      });
      expect(rgs).to.deep.include({
        start: 6,
        match: "`",
        value: 'string backtick punctuation'
      });
      rgs = Syntax.ranges('a="  \'X\'  Y  " ');
      expect(rgs).to.deep.include({
        start: 2,
        match: '"',
        value: 'string double punctuation'
      });
      expect(rgs).to.deep.include({
        start: 5,
        match: "'X'",
        value: 'string double'
      });
      expect(rgs).to.deep.include({
        start: 10,
        match: "Y",
        value: 'string double'
      });
      expect(rgs).to.deep.include({
        start: 13,
        match: '"',
        value: 'string double punctuation'
      });
      rgs = Syntax.ranges('a="";b=" ";c="X"');
      ref = [2, 3, 7, 9, 13, 15];
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        expect(rgs).to.deep.include({
          start: i,
          match: '"',
          value: 'string double punctuation'
        });
      }
      expect(rgs).to.deep.include({
        start: 14,
        match: 'X',
        value: 'string double'
      });
      rgs = Syntax.ranges("a='';b=' ';c='Y'");
      ref1 = [2, 3, 7, 9, 13, 15];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        i = ref1[k];
        expect(rgs).to.deep.include({
          start: i,
          match: "'",
          value: 'string single punctuation'
        });
      }
      expect(rgs).to.deep.include({
        start: 14,
        match: 'Y',
        value: 'string single'
      });
      rgs = Syntax.ranges("a=``;b=` `;c=`Z`");
      ref2 = [2, 3, 7, 9, 13, 15];
      for (l = 0, len2 = ref2.length; l < len2; l++) {
        i = ref2[l];
        expect(rgs).to.deep.include({
          start: i,
          match: "`",
          value: 'string backtick punctuation'
        });
      }
      return expect(rgs).to.deep.include({
        start: 14,
        match: 'Z',
        value: 'string backtick'
      });
    });
    
    //  0000000   0000000   00     00  00     00  00000000  000   000  000000000   0000000  
    // 000       000   000  000   000  000   000  000       0000  000     000     000       
    // 000       000   000  000000000  000000000  0000000   000 0 000     000     0000000   
    // 000       000   000  000 0 000  000 0 000  000       000  0000     000          000  
    //  0000000   0000000   000   000  000   000  00000000  000   000     000     0000000   
    it('comments', function() {
      var rgs;
      rgs = Syntax.ranges("hello # world", 'coffee');
      expect(rgs).to.deep.include({
        start: 6,
        match: "#",
        value: 'comment punctuation'
      });
      expect(rgs).to.deep.include({
        start: 8,
        match: "world",
        value: 'comment'
      });
      rgs = Syntax.ranges("   # bla blub", 'noon');
      expect(rgs).to.deep.include({
        start: 3,
        match: "#",
        value: 'comment punctuation'
      });
      expect(rgs).to.deep.include({
        start: 5,
        match: "bla",
        value: 'comment'
      });
      return expect(rgs).to.deep.include({
        start: 9,
        match: "blub",
        value: 'comment'
      });
    });
    it('no comment', function() {
      var j, len, results, rgs, rng;
      rgs = Syntax.ranges("(^\s*#\s*)(.*)$", 'noon');
      results = [];
      for (j = 0, len = rgs.length; j < len; j++) {
        rng = rgs[j];
        results.push(expect(rng).to.not.have.property('value', 'comment'));
      }
      return results;
    });
    
    // 000   000  000000000  00     00  000    
    // 000   000     000     000   000  000    
    // 000000000     000     000000000  000    
    // 000   000     000     000 0 000  000    
    // 000   000     000     000   000  0000000
    it('html', function() {
      var rgs;
      rgs = Syntax.ranges("</div>", 'html');
      expect(rgs).to.deep.include({
        start: 0,
        match: "<",
        value: 'keyword punctuation'
      });
      expect(rgs).to.deep.include({
        start: 1,
        match: "/",
        value: 'keyword punctuation'
      });
      expect(rgs).to.deep.include({
        start: 2,
        match: "div",
        value: 'keyword'
      });
      expect(rgs).to.deep.include({
        start: 5,
        match: ">",
        value: 'keyword punctuation'
      });
      rgs = Syntax.ranges("<div>", 'html');
      expect(rgs).to.deep.include({
        start: 0,
        match: "<",
        value: 'keyword punctuation'
      });
      expect(rgs).to.deep.include({
        start: 1,
        match: "div",
        value: 'keyword'
      });
      return expect(rgs).to.deep.include({
        start: 4,
        match: ">",
        value: 'keyword punctuation'
      });
    });
    
    //  0000000  00000000   00000000         0000000    00000000  00000000  000  000   000  00000000  
    // 000       000   000  000   000        000   000  000       000       000  0000  000  000       
    // 000       00000000   00000000         000   000  0000000   000000    000  000 0 000  0000000   
    // 000       000        000              000   000  000       000       000  000  0000  000       
    //  0000000  000        000              0000000    00000000  000       000  000   000  00000000  
    it('cpp define', function() {
      var rgs;
      rgs = Syntax.ranges("#include", 'cpp');
      expect(rgs).to.deep.include({
        start: 0,
        match: "#",
        value: 'define punctuation'
      });
      expect(rgs).to.deep.include({
        start: 1,
        match: "include",
        value: 'define'
      });
      rgs = Syntax.ranges("#if", 'cpp');
      expect(rgs).to.deep.include({
        start: 0,
        match: "#",
        value: 'define punctuation'
      });
      expect(rgs).to.deep.include({
        start: 1,
        match: "if",
        value: 'define'
      });
      rgs = Syntax.ranges("#  if", 'cpp');
      expect(rgs).to.deep.include({
        start: 0,
        match: "#",
        value: 'define punctuation'
      });
      return expect(rgs).to.deep.include({
        start: 3,
        match: "if",
        value: 'define'
      });
    });
    it('cpp keyword', function() {
      var rgs;
      rgs = Syntax.ranges("if (true) {} else {}", 'cpp');
      expect(rgs).to.deep.include({
        start: 0,
        match: "if",
        value: 'keyword'
      });
      expect(rgs).to.deep.include({
        start: 4,
        match: "true",
        value: 'keyword'
      });
      return expect(rgs).to.deep.include({
        start: 13,
        match: "else",
        value: 'keyword'
      });
    });
    
    //  0000000  00000000   00000000         00000000  000       0000000    0000000   000000000  
    // 000       000   000  000   000        000       000      000   000  000   000     000     
    // 000       00000000   00000000         000000    000      000   000  000000000     000     
    // 000       000        000              000       000      000   000  000   000     000     
    //  0000000  000        000              000       0000000   0000000   000   000     000     
    it('cpp float', function() {
      var rgs;
      rgs = Syntax.ranges("'abc");
      expect(rgs).to.deep.include({
        start: 1,
        match: "abc",
        value: 'string single'
      });
      rgs = Syntax.ranges("1.0f", 'cpp');
      expect(rgs).to.deep.include({
        start: 0,
        match: "1",
        value: 'number float'
      });
      expect(rgs).to.deep.include({
        start: 1,
        match: ".",
        value: 'number float punctuation'
      });
      expect(rgs).to.deep.include({
        start: 2,
        match: "0f",
        value: 'number float'
      });
      rgs = Syntax.ranges("0.0000f", 'cpp');
      return expect(rgs).to.deep.include({
        start: 2,
        match: "0000f",
        value: 'number float'
      });
    });
    
    //  0000000   0000000   00000000  00000000  00000000  00000000  
    // 000       000   000  000       000       000       000       
    // 000       000   000  000000    000000    0000000   0000000   
    // 000       000   000  000       000       000       000       
    //  0000000   0000000   000       000       00000000  00000000  
    it('coffee', function() {
      var rgs;
      rgs = Syntax.ranges("a and b", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "a",
        value: 'text'
      });
      expect(rgs).to.deep.include({
        start: 2,
        match: "and",
        value: 'keyword'
      });
      rgs = Syntax.ranges("if a then b", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "if",
        value: 'keyword'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: "a",
        value: 'text'
      });
      expect(rgs).to.deep.include({
        start: 5,
        match: "then",
        value: 'keyword'
      });
      expect(rgs).to.deep.include({
        start: 10,
        match: "b",
        value: 'text'
      });
      rgs = Syntax.ranges("f 'a'", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "f",
        value: 'function call'
      });
      rgs = Syntax.ranges("ff 'b'", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "ff",
        value: 'function call'
      });
      rgs = Syntax.ranges("fff 1", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "fff",
        value: 'function call'
      });
      rgs = Syntax.ranges("ffff -1", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "ffff",
        value: 'function call'
      });
      rgs = Syntax.ranges("f [1]", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "f",
        value: 'function call'
      });
      rgs = Syntax.ranges("fffff {1}", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "fffff",
        value: 'function call'
      });
      rgs = Syntax.ranges("switch a", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "switch",
        value: 'keyword'
      });
      rgs = Syntax.ranges("pos: (item, p) -> ", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "pos",
        value: 'method'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: ":",
        value: 'method punctuation'
      });
      rgs = Syntax.ranges("pos= (item, p) -> ", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "pos",
        value: 'function'
      });
      rgs = Syntax.ranges(" a: =>", 'coffee');
      expect(rgs).to.deep.include({
        start: 1,
        match: "a",
        value: 'method'
      });
      expect(rgs).to.deep.include({
        start: 2,
        match: ":",
        value: 'method punctuation'
      });
      expect(rgs).to.deep.include({
        start: 4,
        match: "=",
        value: 'function tail bound'
      });
      expect(rgs).to.deep.include({
        start: 5,
        match: ">",
        value: 'function head bound'
      });
      rgs = Syntax.ranges(" a: ->", 'coffee');
      expect(rgs).to.deep.include({
        start: 1,
        match: "a",
        value: 'method'
      });
      expect(rgs).to.deep.include({
        start: 2,
        match: ":",
        value: 'method punctuation'
      });
      expect(rgs).to.deep.include({
        start: 4,
        match: "-",
        value: 'function tail'
      });
      expect(rgs).to.deep.include({
        start: 5,
        match: ">",
        value: 'function head'
      });
      rgs = Syntax.ranges(" a: b", 'coffee');
      expect(rgs).to.deep.include({
        start: 1,
        match: "a",
        value: 'dictionary key'
      });
      expect(rgs).to.deep.include({
        start: 2,
        match: ":",
        value: 'dictionary punctuation'
      });
      rgs = Syntax.ranges("obj.value = obj.another.value", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "obj",
        value: 'obj'
      });
      expect(rgs).to.deep.include({
        start: 4,
        match: "value",
        value: 'property'
      });
      expect(rgs).to.deep.include({
        start: 12,
        match: "obj",
        value: 'obj'
      });
      expect(rgs).to.deep.include({
        start: 16,
        match: "another",
        value: 'property'
      });
      expect(rgs).to.deep.include({
        start: 24,
        match: "value",
        value: 'property'
      });
      rgs = Syntax.ranges("if args.rights", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "if",
        value: 'keyword'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: "args",
        value: 'obj'
      });
      expect(rgs).to.deep.include({
        start: 8,
        match: "rights",
        value: 'property'
      });
      rgs = Syntax.ranges("a(b).length", 'coffee');
      expect(rgs).to.deep.include({
        start: 0,
        match: "a",
        value: 'function call'
      });
      return expect(rgs).to.deep.include({
        start: 5,
        match: "length",
        value: 'property'
      });
    });
    
    // 000   000  000   000  00     00  0000000    00000000  00000000    0000000  
    // 0000  000  000   000  000   000  000   000  000       000   000  000       
    // 000 0 000  000   000  000000000  0000000    0000000   0000000    0000000   
    // 000  0000  000   000  000 0 000  000   000  000       000   000       000  
    // 000   000   0000000   000   000  0000000    00000000  000   000  0000000   
    it('numbers', function() {
      var rgs;
      rgs = Syntax.ranges("a 6670");
      expect(rgs).to.deep.include({
        start: 2,
        match: "6670",
        value: 'number'
      });
      rgs = Syntax.ranges("667AC");
      expect(rgs).to.deep.include({
        start: 0,
        match: "667AC",
        value: 'number hex'
      });
      rgs = Syntax.ranges("66.700");
      expect(rgs).to.deep.include({
        start: 0,
        match: "66",
        value: 'number float'
      });
      expect(rgs).to.deep.include({
        start: 2,
        match: ".",
        value: 'number float punctuation'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: "700",
        value: 'number float'
      });
      rgs = Syntax.ranges("77.800 -100");
      expect(rgs).to.deep.include({
        start: 0,
        match: "77",
        value: 'number float'
      });
      expect(rgs).to.deep.include({
        start: 8,
        match: "100",
        value: 'number'
      });
      rgs = Syntax.ranges("(8.9,100.2)");
      expect(rgs).to.deep.include({
        start: 3,
        match: "9",
        value: 'number float'
      });
      return expect(rgs).to.deep.include({
        start: 9,
        match: "2",
        value: 'number float'
      });
    });
    
    //  0000000  00000000  00     00  000   000  00000000  00000000   
    // 000       000       000   000  000   000  000       000   000  
    // 0000000   0000000   000000000   000 000   0000000   0000000    
    //      000  000       000 0 000     000     000       000   000  
    // 0000000   00000000  000   000      0      00000000  000   000  
    it('semver', function() {
      var rgs;
      rgs = Syntax.ranges("66.70.0");
      expect(rgs).to.deep.include({
        start: 0,
        match: "66",
        value: 'semver'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: "70",
        value: 'semver'
      });
      expect(rgs).to.deep.include({
        start: 6,
        match: "0",
        value: 'semver'
      });
      rgs = Syntax.ranges("^0.7.1");
      expect(rgs).to.deep.include({
        start: 1,
        match: "0",
        value: 'semver'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: "7",
        value: 'semver'
      });
      expect(rgs).to.deep.include({
        start: 5,
        match: "1",
        value: 'semver'
      });
      rgs = Syntax.ranges("^1.0.0-alpha.12");
      expect(rgs).to.deep.include({
        start: 1,
        match: "1",
        value: 'semver'
      });
      expect(rgs).to.deep.include({
        start: 3,
        match: "0",
        value: 'semver'
      });
      return expect(rgs).to.deep.include({
        start: 5,
        match: "0",
        value: 'semver'
      });
    });
    
    // 00000000   000   000  000   000   0000000  000000000  000   000   0000000   000000000  000   0000000   000   000  
    // 000   000  000   000  0000  000  000          000     000   000  000   000     000     000  000   000  0000  000  
    // 00000000   000   000  000 0 000  000          000     000   000  000000000     000     000  000   000  000 0 000  
    // 000        000   000  000  0000  000          000     000   000  000   000     000     000  000   000  000  0000  
    // 000         0000000   000   000   0000000     000      0000000   000   000     000     000   0000000   000   000  
    return it('punctuation', function() {
      var rgs;
      rgs = Syntax.ranges('/some\\path/file.txt:10');
      expect(rgs).to.deep.include({
        start: 0,
        match: '/',
        value: 'punctuation'
      });
      expect(rgs).to.deep.include({
        start: 5,
        match: '\\',
        value: 'punctuation'
      });
      expect(rgs).to.deep.include({
        start: 15,
        match: '.',
        value: 'punctuation'
      });
      return expect(rgs).to.deep.include({
        start: 19,
        match: ':',
        value: 'punctuation'
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbInN5bnRheC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTs7Ozs7OztBQUFBLE1BQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBOztFQVFBLENBQUEsQ0FBRSxHQUFGLENBQUEsR0FBVSxPQUFBLENBQVEsV0FBUixDQUFWOztFQUVBLE1BQUEsR0FBUyxPQUFBLENBQVEsY0FBUjs7RUFDVCxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsSUFBQSxHQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNULE1BQUEsR0FBUyxJQUFJLENBQUM7O0VBQ2QsSUFBSSxDQUFDLE1BQUwsQ0FBQTs7RUFFQSxRQUFBLENBQVMsUUFBVCxFQUFtQixRQUFBLENBQUEsQ0FBQTtJQUVmLEVBQUEsQ0FBRyxlQUFILEVBQW9CLFFBQUEsQ0FBQSxDQUFBO0FBRWhCLFVBQUE7TUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLE1BQVAsQ0FBYyxVQUFkLEVBQTBCLFFBQTFCO01BQ04sTUFBQSxDQUFPLEdBQVAsQ0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBcEIsQ0FDSTtRQUFBLEtBQUEsRUFBTyxDQUFQO1FBQ0EsS0FBQSxFQUFPLEdBRFA7UUFFQSxLQUFBLEVBQU87TUFGUCxDQURKO01BSUEsTUFBQSxDQUFPLEdBQVAsQ0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBcEIsQ0FDSTtRQUFBLEtBQUEsRUFBTyxDQUFQO1FBQ0EsS0FBQSxFQUFPLEtBRFA7UUFFQSxLQUFBLEVBQU87TUFGUCxDQURKO2FBSUEsTUFBQSxDQUFPLEdBQVAsQ0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBcEIsQ0FDSTtRQUFBLEtBQUEsRUFBTyxDQUFQO1FBQ0EsS0FBQSxFQUFPLEdBRFA7UUFFQSxLQUFBLEVBQU87TUFGUCxDQURKO0lBWGdCLENBQXBCLEVB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QyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQXBCLENBQ0k7UUFBQSxLQUFBLEVBQU8sQ0FBUDtRQUNBLEtBQUEsRUFBTyxHQURQO1FBRUEsS0FBQSxFQUFPO01BRlAsQ0FESjtNQUlBLE1BQUEsQ0FBTyxHQUFQLENBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQXBCLENBQ0k7UUFBQSxLQUFBLEVBQU8sQ0FBUDtRQUNBLEtBQUEsRUFBTyxJQURQO1FBRUEsS0FBQSxFQUFPO01BRlAsQ0FESjtNQUlBLE1BQUEsQ0FBTyxHQUFQLENBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQXBCLENBQ0k7UUFBQSxLQUFBLEVBQU8sRUFBUDtRQUNBLEtBQUEsRUFBTyxHQURQO1FBRUEsS0FBQSxFQUFPO01BRlAsQ0FESjthQUlBLE1BQUEsQ0FBTyxHQUFQLENBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQXBCLENBQ0k7UUFBQSxLQUFBLEVBQU8sRUFBUDtRQUNBLEtBQUEsRUFBTyxHQURQO1FBRUEsS0FBQSxFQUFPO01BRlAsQ0FESjtJQWZjLENBQWxCO0VBbmxCZSxDQUFuQjtBQWhCQSIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMFxuICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAgICAgICAgICAwMDAgICAgIDAwMCAgIFxuICAgMDAwICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyMjXG5cbnsgbG9nIH0gPSByZXF1aXJlICcuLi8uLi9reGsnXG5cblN5bnRheCA9IHJlcXVpcmUgJy4uL2pzL3N5bnRheCdcbmFzc2VydCA9IHJlcXVpcmUgJ2Fzc2VydCdcbmNoYWkgICA9IHJlcXVpcmUgJ2NoYWknXG5leHBlY3QgPSBjaGFpLmV4cGVjdFxuY2hhaS5zaG91bGQoKVxuXG5kZXNjcmliZSAnc3ludGF4JywgLT5cbiAgICBcbiAgICBpdCAnaW50ZXJwb2xhdGlvbicsIC0+ICAgIFxuICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyAnXCIjezY2Nn1cIicsICdjb2ZmZWUnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogJ1wiJ1xuICAgICAgICAgICAgdmFsdWU6ICdzdHJpbmcgZG91YmxlIHB1bmN0dWF0aW9uJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogM1xuICAgICAgICAgICAgbWF0Y2g6ICc2NjYnXG4gICAgICAgICAgICB2YWx1ZTogJ251bWJlcidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDdcbiAgICAgICAgICAgIG1hdGNoOiAnXCInXG4gICAgICAgICAgICB2YWx1ZTogJ3N0cmluZyBkb3VibGUgcHVuY3R1YXRpb24nXG4gICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdzdHJpbmdzJywgLT5cbiAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcIlwiXCJhPVwiXFxcXFwiRVxcXFxcIlwiIFwiXCJcIlxuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogMlxuICAgICAgICAgICAgbWF0Y2g6ICdcIidcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIGRvdWJsZSBwdW5jdHVhdGlvbidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDNcbiAgICAgICAgICAgIG1hdGNoOiAnXFxcXFwiRVxcXFxcIidcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDhcbiAgICAgICAgICAgIG1hdGNoOiAnXCInXG4gICAgICAgICAgICB2YWx1ZTogJ3N0cmluZyBkb3VibGUgcHVuY3R1YXRpb24nXG4gICAgICAgIFxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzICdhPVwiXFwnWFxcJ1wiJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogMlxuICAgICAgICAgICAgbWF0Y2g6ICdcIidcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIGRvdWJsZSBwdW5jdHVhdGlvbidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDNcbiAgICAgICAgICAgIG1hdGNoOiBcIidYJ1wiXG4gICAgICAgICAgICB2YWx1ZTogJ3N0cmluZyBkb3VibGUnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiA2XG4gICAgICAgICAgICBtYXRjaDogJ1wiJ1xuICAgICAgICAgICAgdmFsdWU6ICdzdHJpbmcgZG91YmxlIHB1bmN0dWF0aW9uJ1xuXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgJ2E9XFwnXCJYXCJcXCcnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiAyXG4gICAgICAgICAgICBtYXRjaDogXCInXCJcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIHNpbmdsZSBwdW5jdHVhdGlvbidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDNcbiAgICAgICAgICAgIG1hdGNoOiAnXCJYXCInXG4gICAgICAgICAgICB2YWx1ZTogJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiA2XG4gICAgICAgICAgICBtYXRjaDogXCInXCJcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIHNpbmdsZSBwdW5jdHVhdGlvbidcblxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzICdhPWBcIlhcImAnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiAyXG4gICAgICAgICAgICBtYXRjaDogXCJgXCJcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIGJhY2t0aWNrIHB1bmN0dWF0aW9uJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogM1xuICAgICAgICAgICAgbWF0Y2g6ICdcIlhcIidcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogNlxuICAgICAgICAgICAgbWF0Y2g6IFwiYFwiXG4gICAgICAgICAgICB2YWx1ZTogJ3N0cmluZyBiYWNrdGljayBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzICdhPVwiICBcXCdYXFwnICBZICBcIiAnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiAyXG4gICAgICAgICAgICBtYXRjaDogJ1wiJ1xuICAgICAgICAgICAgdmFsdWU6ICdzdHJpbmcgZG91YmxlIHB1bmN0dWF0aW9uJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogNVxuICAgICAgICAgICAgbWF0Y2g6IFwiJ1gnXCJcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDEwXG4gICAgICAgICAgICBtYXRjaDogXCJZXCJcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDEzXG4gICAgICAgICAgICBtYXRjaDogJ1wiJ1xuICAgICAgICAgICAgdmFsdWU6ICdzdHJpbmcgZG91YmxlIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgJ2E9XCJcIjtiPVwiIFwiO2M9XCJYXCInXG4gICAgICAgIGZvciBpIGluIFsyLDMsNyw5LDEzLDE1XVxuICAgICAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBpXG4gICAgICAgICAgICAgICAgbWF0Y2g6ICdcIidcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ3N0cmluZyBkb3VibGUgcHVuY3R1YXRpb24nXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiAxNFxuICAgICAgICAgICAgbWF0Y2g6ICdYJ1xuICAgICAgICAgICAgdmFsdWU6ICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiYT0nJztiPScgJztjPSdZJ1wiXG4gICAgICAgIGZvciBpIGluIFsyLDMsNyw5LDEzLDE1XVxuICAgICAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBpXG4gICAgICAgICAgICAgICAgbWF0Y2g6IFwiJ1wiXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdzdHJpbmcgc2luZ2xlIHB1bmN0dWF0aW9uJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogMTRcbiAgICAgICAgICAgIG1hdGNoOiAnWSdcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcImE9YGA7Yj1gIGA7Yz1gWmBcIlxuICAgICAgICBmb3IgaSBpbiBbMiwzLDcsOSwxMywxNV1cbiAgICAgICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgICAgICBzdGFydDogaVxuICAgICAgICAgICAgICAgIG1hdGNoOiBcImBcIlxuICAgICAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIGJhY2t0aWNrIHB1bmN0dWF0aW9uJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogMTRcbiAgICAgICAgICAgIG1hdGNoOiAnWidcbiAgICAgICAgICAgIHZhbHVlOiAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGl0ICdjb21tZW50cycsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiaGVsbG8gIyB3b3JsZFwiLCAnY29mZmVlJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogNlxuICAgICAgICAgICAgbWF0Y2g6IFwiI1wiXG4gICAgICAgICAgICB2YWx1ZTogJ2NvbW1lbnQgcHVuY3R1YXRpb24nXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDhcbiAgICAgICAgICAgIG1hdGNoOiBcIndvcmxkXCJcbiAgICAgICAgICAgIHZhbHVlOiAnY29tbWVudCdcblxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiICAgIyBibGEgYmx1YlwiLCAnbm9vbidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDNcbiAgICAgICAgICAgIG1hdGNoOiBcIiNcIlxuICAgICAgICAgICAgdmFsdWU6ICdjb21tZW50IHB1bmN0dWF0aW9uJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiA1XG4gICAgICAgICAgICBtYXRjaDogXCJibGFcIlxuICAgICAgICAgICAgdmFsdWU6ICdjb21tZW50J1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiA5XG4gICAgICAgICAgICBtYXRjaDogXCJibHViXCJcbiAgICAgICAgICAgIHZhbHVlOiAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgIGl0ICdubyBjb21tZW50JywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgXCIoXlxccyojXFxzKikoLiopJFwiLCAnbm9vbidcbiAgICAgICAgZm9yIHJuZyBpbiByZ3NcbiAgICAgICAgICAgIGV4cGVjdChybmcpLnRvLm5vdC5oYXZlLnByb3BlcnR5ICd2YWx1ZScsICdjb21tZW50J1xuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwICAgICAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgIFxuICAgICMgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuICAgIFxuICAgIGl0ICdodG1sJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgXCI8L2Rpdj5cIiwgJ2h0bWwnIFxuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCI8XCJcbiAgICAgICAgICAgIHZhbHVlOiAna2V5d29yZCBwdW5jdHVhdGlvbidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMVxuICAgICAgICAgICAgbWF0Y2g6IFwiL1wiXG4gICAgICAgICAgICB2YWx1ZTogJ2tleXdvcmQgcHVuY3R1YXRpb24nXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDJcbiAgICAgICAgICAgIG1hdGNoOiBcImRpdlwiXG4gICAgICAgICAgICB2YWx1ZTogJ2tleXdvcmQnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDVcbiAgICAgICAgICAgIG1hdGNoOiBcIj5cIlxuICAgICAgICAgICAgdmFsdWU6ICdrZXl3b3JkIHB1bmN0dWF0aW9uJ1xuXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgXCI8ZGl2PlwiLCAnaHRtbCcgXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDBcbiAgICAgICAgICAgIG1hdGNoOiBcIjxcIlxuICAgICAgICAgICAgdmFsdWU6ICdrZXl3b3JkIHB1bmN0dWF0aW9uJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAxXG4gICAgICAgICAgICBtYXRjaDogXCJkaXZcIlxuICAgICAgICAgICAgdmFsdWU6ICdrZXl3b3JkJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiA0XG4gICAgICAgICAgICBtYXRjaDogXCI+XCJcbiAgICAgICAgICAgIHZhbHVlOiAna2V5d29yZCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgaXQgJ2NwcCBkZWZpbmUnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcIiNpbmNsdWRlXCIsICdjcHAnICAgICAgXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDBcbiAgICAgICAgICAgIG1hdGNoOiBcIiNcIlxuICAgICAgICAgICAgdmFsdWU6ICdkZWZpbmUgcHVuY3R1YXRpb24nXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDFcbiAgICAgICAgICAgIG1hdGNoOiBcImluY2x1ZGVcIlxuICAgICAgICAgICAgdmFsdWU6ICdkZWZpbmUnXG5cbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcIiNpZlwiLCAnY3BwJyAgICAgICAgICAgIFxuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCIjXCJcbiAgICAgICAgICAgIHZhbHVlOiAnZGVmaW5lIHB1bmN0dWF0aW9uJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAxXG4gICAgICAgICAgICBtYXRjaDogXCJpZlwiXG4gICAgICAgICAgICB2YWx1ZTogJ2RlZmluZSdcblxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiIyAgaWZcIiwgJ2NwcCcgICAgICAgICAgICBcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMFxuICAgICAgICAgICAgbWF0Y2g6IFwiI1wiXG4gICAgICAgICAgICB2YWx1ZTogJ2RlZmluZSBwdW5jdHVhdGlvbidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogM1xuICAgICAgICAgICAgbWF0Y2g6IFwiaWZcIlxuICAgICAgICAgICAgdmFsdWU6ICdkZWZpbmUnXG4gICAgICAgICAgICBcbiAgICBpdCAnY3BwIGtleXdvcmQnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcImlmICh0cnVlKSB7fSBlbHNlIHt9XCIsICdjcHAnICAgIFxuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCJpZlwiXG4gICAgICAgICAgICB2YWx1ZTogJ2tleXdvcmQnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDRcbiAgICAgICAgICAgIG1hdGNoOiBcInRydWVcIlxuICAgICAgICAgICAgdmFsdWU6ICdrZXl3b3JkJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAxM1xuICAgICAgICAgICAgbWF0Y2g6IFwiZWxzZVwiXG4gICAgICAgICAgICB2YWx1ZTogJ2tleXdvcmQnXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgICAgICAgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMCAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAgICAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgaXQgJ2NwcCBmbG9hdCcsIC0+XG5cbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcIidhYmNcIiAgICAgICAgICAgIFxuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAxXG4gICAgICAgICAgICBtYXRjaDogXCJhYmNcIlxuICAgICAgICAgICAgdmFsdWU6ICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcIjEuMGZcIiwgJ2NwcCdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMFxuICAgICAgICAgICAgbWF0Y2g6IFwiMVwiXG4gICAgICAgICAgICB2YWx1ZTogJ251bWJlciBmbG9hdCdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMVxuICAgICAgICAgICAgbWF0Y2g6IFwiLlwiXG4gICAgICAgICAgICB2YWx1ZTogJ251bWJlciBmbG9hdCBwdW5jdHVhdGlvbidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMlxuICAgICAgICAgICAgbWF0Y2g6IFwiMGZcIlxuICAgICAgICAgICAgdmFsdWU6ICdudW1iZXIgZmxvYXQnXG5cbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcIjAuMDAwMGZcIiwgJ2NwcCdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMlxuICAgICAgICAgICAgbWF0Y2g6IFwiMDAwMGZcIlxuICAgICAgICAgICAgdmFsdWU6ICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBpdCAnY29mZmVlJywgLT5cbiAgICAgICAgXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgXCJhIGFuZCBiXCIsICdjb2ZmZWUnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDBcbiAgICAgICAgICAgIG1hdGNoOiBcImFcIlxuICAgICAgICAgICAgdmFsdWU6ICd0ZXh0J1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAyXG4gICAgICAgICAgICBtYXRjaDogXCJhbmRcIlxuICAgICAgICAgICAgdmFsdWU6ICdrZXl3b3JkJ1xuXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgXCJpZiBhIHRoZW4gYlwiLCAnY29mZmVlJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCJpZlwiXG4gICAgICAgICAgICB2YWx1ZTogJ2tleXdvcmQnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDNcbiAgICAgICAgICAgIG1hdGNoOiBcImFcIlxuICAgICAgICAgICAgdmFsdWU6ICd0ZXh0J1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiA1XG4gICAgICAgICAgICBtYXRjaDogXCJ0aGVuXCJcbiAgICAgICAgICAgIHZhbHVlOiAna2V5d29yZCdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMTBcbiAgICAgICAgICAgIG1hdGNoOiBcImJcIlxuICAgICAgICAgICAgdmFsdWU6ICd0ZXh0J1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgXCJmICdhJ1wiLCAnY29mZmVlJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCJmXCJcbiAgICAgICAgICAgIHZhbHVlOiAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiZmYgJ2InXCIsICdjb2ZmZWUnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDBcbiAgICAgICAgICAgIG1hdGNoOiBcImZmXCJcbiAgICAgICAgICAgIHZhbHVlOiAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiZmZmIDFcIiwgJ2NvZmZlZSdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMFxuICAgICAgICAgICAgbWF0Y2g6IFwiZmZmXCJcbiAgICAgICAgICAgIHZhbHVlOiAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiZmZmZiAtMVwiLCAnY29mZmVlJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCJmZmZmXCJcbiAgICAgICAgICAgIHZhbHVlOiAnZnVuY3Rpb24gY2FsbCdcblxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiZiBbMV1cIiwgJ2NvZmZlZSdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMFxuICAgICAgICAgICAgbWF0Y2g6IFwiZlwiXG4gICAgICAgICAgICB2YWx1ZTogJ2Z1bmN0aW9uIGNhbGwnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcImZmZmZmIHsxfVwiLCAnY29mZmVlJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCJmZmZmZlwiXG4gICAgICAgICAgICB2YWx1ZTogJ2Z1bmN0aW9uIGNhbGwnXG5cbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcInN3aXRjaCBhXCIsICdjb2ZmZWUnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDBcbiAgICAgICAgICAgIG1hdGNoOiBcInN3aXRjaFwiXG4gICAgICAgICAgICB2YWx1ZTogJ2tleXdvcmQnXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcInBvczogKGl0ZW0sIHApIC0+IFwiLCAnY29mZmVlJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCJwb3NcIlxuICAgICAgICAgICAgdmFsdWU6ICdtZXRob2QnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDNcbiAgICAgICAgICAgIG1hdGNoOiBcIjpcIlxuICAgICAgICAgICAgdmFsdWU6ICdtZXRob2QgcHVuY3R1YXRpb24nXG5cbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcInBvcz0gKGl0ZW0sIHApIC0+IFwiLCAnY29mZmVlJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCJwb3NcIlxuICAgICAgICAgICAgdmFsdWU6ICdmdW5jdGlvbidcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiIGE6ID0+XCIsICdjb2ZmZWUnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDFcbiAgICAgICAgICAgIG1hdGNoOiBcImFcIlxuICAgICAgICAgICAgdmFsdWU6ICdtZXRob2QnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDJcbiAgICAgICAgICAgIG1hdGNoOiBcIjpcIlxuICAgICAgICAgICAgdmFsdWU6ICdtZXRob2QgcHVuY3R1YXRpb24nXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDRcbiAgICAgICAgICAgIG1hdGNoOiBcIj1cIlxuICAgICAgICAgICAgdmFsdWU6ICdmdW5jdGlvbiB0YWlsIGJvdW5kJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiA1XG4gICAgICAgICAgICBtYXRjaDogXCI+XCJcbiAgICAgICAgICAgIHZhbHVlOiAnZnVuY3Rpb24gaGVhZCBib3VuZCdcbiAgICAgICAgXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgXCIgYTogLT5cIiwgJ2NvZmZlZSdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMVxuICAgICAgICAgICAgbWF0Y2g6IFwiYVwiXG4gICAgICAgICAgICB2YWx1ZTogJ21ldGhvZCdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMlxuICAgICAgICAgICAgbWF0Y2g6IFwiOlwiXG4gICAgICAgICAgICB2YWx1ZTogJ21ldGhvZCBwdW5jdHVhdGlvbidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogNFxuICAgICAgICAgICAgbWF0Y2g6IFwiLVwiXG4gICAgICAgICAgICB2YWx1ZTogJ2Z1bmN0aW9uIHRhaWwnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDVcbiAgICAgICAgICAgIG1hdGNoOiBcIj5cIlxuICAgICAgICAgICAgdmFsdWU6ICdmdW5jdGlvbiBoZWFkJ1xuICAgICAgICAgICAgXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgXCIgYTogYlwiLCAnY29mZmVlJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAxXG4gICAgICAgICAgICBtYXRjaDogXCJhXCJcbiAgICAgICAgICAgIHZhbHVlOiAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDJcbiAgICAgICAgICAgIG1hdGNoOiBcIjpcIlxuICAgICAgICAgICAgdmFsdWU6ICdkaWN0aW9uYXJ5IHB1bmN0dWF0aW9uJ1xuICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcIm9iai52YWx1ZSA9IG9iai5hbm90aGVyLnZhbHVlXCIsICdjb2ZmZWUnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCJvYmpcIlxuICAgICAgICAgICAgdmFsdWU6ICdvYmonXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiA0XG4gICAgICAgICAgICBtYXRjaDogXCJ2YWx1ZVwiXG4gICAgICAgICAgICB2YWx1ZTogJ3Byb3BlcnR5J1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogMTJcbiAgICAgICAgICAgIG1hdGNoOiBcIm9ialwiXG4gICAgICAgICAgICB2YWx1ZTogJ29iaidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDE2XG4gICAgICAgICAgICBtYXRjaDogXCJhbm90aGVyXCJcbiAgICAgICAgICAgIHZhbHVlOiAncHJvcGVydHknXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiAyNFxuICAgICAgICAgICAgbWF0Y2g6IFwidmFsdWVcIlxuICAgICAgICAgICAgdmFsdWU6ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgIFxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiaWYgYXJncy5yaWdodHNcIiwgJ2NvZmZlZSdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMFxuICAgICAgICAgICAgbWF0Y2g6IFwiaWZcIlxuICAgICAgICAgICAgdmFsdWU6ICdrZXl3b3JkJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAzXG4gICAgICAgICAgICBtYXRjaDogXCJhcmdzXCJcbiAgICAgICAgICAgIHZhbHVlOiAnb2JqJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogOFxuICAgICAgICAgICAgbWF0Y2g6IFwicmlnaHRzXCJcbiAgICAgICAgICAgIHZhbHVlOiAncHJvcGVydHknXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcImEoYikubGVuZ3RoXCIsICdjb2ZmZWUnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDBcbiAgICAgICAgICAgIG1hdGNoOiBcImFcIlxuICAgICAgICAgICAgdmFsdWU6ICdmdW5jdGlvbiBjYWxsJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiA1XG4gICAgICAgICAgICBtYXRjaDogXCJsZW5ndGhcIlxuICAgICAgICAgICAgdmFsdWU6ICdwcm9wZXJ0eSdcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgaXQgJ251bWJlcnMnLCAtPlxuICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcImEgNjY3MFwiXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiAyXG4gICAgICAgICAgICBtYXRjaDogXCI2NjcwXCJcbiAgICAgICAgICAgIHZhbHVlOiAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgXCI2NjdBQ1wiXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDBcbiAgICAgICAgICAgIG1hdGNoOiBcIjY2N0FDXCJcbiAgICAgICAgICAgIHZhbHVlOiAnbnVtYmVyIGhleCdcblxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiNjYuNzAwXCJcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogMFxuICAgICAgICAgICAgbWF0Y2g6IFwiNjZcIlxuICAgICAgICAgICAgdmFsdWU6ICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDJcbiAgICAgICAgICAgIG1hdGNoOiBcIi5cIlxuICAgICAgICAgICAgdmFsdWU6ICdudW1iZXIgZmxvYXQgcHVuY3R1YXRpb24nXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDNcbiAgICAgICAgICAgIG1hdGNoOiBcIjcwMFwiXG4gICAgICAgICAgICB2YWx1ZTogJ251bWJlciBmbG9hdCdcblxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzIFwiNzcuODAwIC0xMDBcIlxuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCI3N1wiXG4gICAgICAgICAgICB2YWx1ZTogJ251bWJlciBmbG9hdCdcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogOFxuICAgICAgICAgICAgbWF0Y2g6IFwiMTAwXCJcbiAgICAgICAgICAgIHZhbHVlOiAnbnVtYmVyJ1xuXG4gICAgICAgIHJncyA9IFN5bnRheC5yYW5nZXMgXCIoOC45LDEwMC4yKVwiXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDNcbiAgICAgICAgICAgIG1hdGNoOiBcIjlcIlxuICAgICAgICAgICAgdmFsdWU6ICdudW1iZXIgZmxvYXQnXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDlcbiAgICAgICAgICAgIG1hdGNoOiBcIjJcIlxuICAgICAgICAgICAgdmFsdWU6ICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgaXQgJ3NlbXZlcicsIC0+ICAgIFxuICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcIjY2LjcwLjBcIlxuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGVcbiAgICAgICAgICAgIHN0YXJ0OiAwXG4gICAgICAgICAgICBtYXRjaDogXCI2NlwiXG4gICAgICAgICAgICB2YWx1ZTogJ3NlbXZlcidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlXG4gICAgICAgICAgICBzdGFydDogM1xuICAgICAgICAgICAgbWF0Y2g6IFwiNzBcIlxuICAgICAgICAgICAgdmFsdWU6ICdzZW12ZXInXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDZcbiAgICAgICAgICAgIG1hdGNoOiBcIjBcIlxuICAgICAgICAgICAgdmFsdWU6ICdzZW12ZXInXG5cbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcIl4wLjcuMVwiXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDFcbiAgICAgICAgICAgIG1hdGNoOiBcIjBcIlxuICAgICAgICAgICAgdmFsdWU6ICdzZW12ZXInXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDNcbiAgICAgICAgICAgIG1hdGNoOiBcIjdcIlxuICAgICAgICAgICAgdmFsdWU6ICdzZW12ZXInXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDVcbiAgICAgICAgICAgIG1hdGNoOiBcIjFcIlxuICAgICAgICAgICAgdmFsdWU6ICdzZW12ZXInXG4gICAgICAgICAgICBcbiAgICAgICAgcmdzID0gU3ludGF4LnJhbmdlcyBcIl4xLjAuMC1hbHBoYS4xMlwiXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDFcbiAgICAgICAgICAgIG1hdGNoOiBcIjFcIlxuICAgICAgICAgICAgdmFsdWU6ICdzZW12ZXInXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDNcbiAgICAgICAgICAgIG1hdGNoOiBcIjBcIlxuICAgICAgICAgICAgdmFsdWU6ICdzZW12ZXInXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZVxuICAgICAgICAgICAgc3RhcnQ6IDVcbiAgICAgICAgICAgIG1hdGNoOiBcIjBcIlxuICAgICAgICAgICAgdmFsdWU6ICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgIFxuICAgIGl0ICdwdW5jdHVhdGlvbicsIC0+XG4gICAgICAgIFxuICAgICAgICByZ3MgPSBTeW50YXgucmFuZ2VzICcvc29tZVxcXFxwYXRoL2ZpbGUudHh0OjEwJ1xuICAgICAgICBleHBlY3QocmdzKS50by5kZWVwLmluY2x1ZGUgXG4gICAgICAgICAgICBzdGFydDogMFxuICAgICAgICAgICAgbWF0Y2g6ICcvJ1xuICAgICAgICAgICAgdmFsdWU6ICdwdW5jdHVhdGlvbidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDVcbiAgICAgICAgICAgIG1hdGNoOiAnXFxcXCdcbiAgICAgICAgICAgIHZhbHVlOiAncHVuY3R1YXRpb24nXG4gICAgICAgIGV4cGVjdChyZ3MpLnRvLmRlZXAuaW5jbHVkZSBcbiAgICAgICAgICAgIHN0YXJ0OiAxNVxuICAgICAgICAgICAgbWF0Y2g6ICcuJ1xuICAgICAgICAgICAgdmFsdWU6ICdwdW5jdHVhdGlvbidcbiAgICAgICAgZXhwZWN0KHJncykudG8uZGVlcC5pbmNsdWRlIFxuICAgICAgICAgICAgc3RhcnQ6IDE5XG4gICAgICAgICAgICBtYXRjaDogJzonXG4gICAgICAgICAgICB2YWx1ZTogJ3B1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgIl19
//# sourceURL=syntax.coffee