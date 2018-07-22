###
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000   
###

{ log } = require '../../kxk'

Syntax = require '../js/syntax'
assert = require 'assert'
chai   = require 'chai'
expect = chai.expect
chai.should()

inc = (rgs, start, match, value) -> expect(rgs).to.deep.include     start:start, match:match, value:value
nut = (rgs, start, match, value) -> expect(rgs).to.not.deep.include start:start, match:match, value:value
    
describe 'syntax', ->
    
    # 00000000   00000000   0000000   00000000  000   000  00000000   
    # 000   000  000       000        000        000 000   000   000  
    # 0000000    0000000   000  0000  0000000     00000    00000000   
    # 000   000  000       000   000  000        000 000   000        
    # 000   000  00000000   0000000   00000000  000   000  000        
    
    it 'regexp', ->
        
        rgs = Syntax.ranges "r=/a/", 'coffee'
        inc rgs, 2, '/', 'regexp punctuation'
        inc rgs, 3, 'a', 'regexp text'
        inc rgs, 4, '/', 'regexp punctuation'
    
        rgs = Syntax.ranges 'a / b - c / d', 'coffee'
        nut rgs, 2, '/', 'regexp punctuation'

        rgs = Syntax.ranges 'f a/b, c/d', 'coffee'
        nut rgs, 3, '/', 'regexp punctuation'
            
        rgs = Syntax.ranges "/(a|.*|\s\d\w\S\W$|^\s+)/", 'coffee'
        inc rgs, 0, '/', 'regexp punctuation'
        inc rgs, 2, 'a', 'regexp text'
            
        rgs = Syntax.ranges "/^#include/", 'coffee'
        inc rgs, 0, '/',       'regexp punctuation'
        inc rgs, 2, "#",       'regexp punctuation'
        inc rgs, 3, "include", 'regexp text'

        rgs = Syntax.ranges "/\\'hello\\'/ ", 'coffee'
        inc rgs, 0, '/',       'regexp punctuation'
        inc rgs, 1, "\\",      'regexp punctuation'
        inc rgs, 2, "'",       'regexp punctuation'
        inc rgs, 3, "hello",   'regexp text'
            
    # 00000000   00000000   0000000   000   000  000  00000000   00000000  
    # 000   000  000       000   000  000   000  000  000   000  000       
    # 0000000    0000000   000 00 00  000   000  000  0000000    0000000   
    # 000   000  000       000 0000   000   000  000  000   000  000       
    # 000   000  00000000   00000 00   0000000   000  000   000  00000000  
    
    it 'require', ->
        
        rgs = Syntax.ranges "util = require 'util'", 'coffee'
        inc rgs, 7, 'require', 'require'
    
    # 000  000   000  000000000  00000000  00000000   00000000    0000000   000       0000000   000000000  000   0000000   000   000  
    # 000  0000  000     000     000       000   000  000   000  000   000  000      000   000     000     000  000   000  0000  000  
    # 000  000 0 000     000     0000000   0000000    00000000   000   000  000      000000000     000     000  000   000  000 0 000  
    # 000  000  0000     000     000       000   000  000        000   000  000      000   000     000     000  000   000  000  0000  
    # 000  000   000     000     00000000  000   000  000         0000000   0000000  000   000     000     000   0000000   000   000  
    
    it 'interpolation', ->    
        
        rgs = Syntax.ranges '"#{666}"', 'coffee'
        inc rgs, 0, '"',   'string double punctuation'
        inc rgs, 3, '666', 'number'
        inc rgs, 7, '"',   'string double punctuation'
    
    #  0000000  000000000  00000000   000  000   000   0000000    0000000  
    # 000          000     000   000  000  0000  000  000        000       
    # 0000000      000     0000000    000  000 0 000  000  0000  0000000   
    #      000     000     000   000  000  000  0000  000   000       000  
    # 0000000      000     000   000  000  000   000   0000000   0000000   
    
    it 'strings', ->
       
        rgs = Syntax.ranges """a="\\"E\\"" """
        inc rgs, 2, '"',       'string double punctuation'
        inc rgs, 3, '\\"E\\"', 'string double'
        inc rgs, 8, '"',       'string double punctuation'
        
        rgs = Syntax.ranges 'a="\'X\'"'
        inc rgs, 2, '"',   'string double punctuation'
        inc rgs, 3, "'X'", 'string double'
        inc rgs, 6, '"',   'string double punctuation'

        rgs = Syntax.ranges 'a=\'"X"\''
        inc rgs, 2, "'",   'string single punctuation'
        inc rgs, 3, '"X"', 'string single'
        inc rgs, 6, "'",   'string single punctuation'

        rgs = Syntax.ranges 'a=`"X"`'
        inc rgs, 2, "`",   'string backtick punctuation'
        inc rgs, 3, '"X"', 'string backtick'
        inc rgs, 6, "`",   'string backtick punctuation'
            
        rgs = Syntax.ranges 'a="  \'X\'  Y  " '
        inc rgs, 2, '"',   'string double punctuation'
        inc rgs, 5, "'X'", 'string double'
        inc rgs, 10, "Y",  'string double'
        inc rgs, 13, '"',  'string double punctuation'
                        
        rgs = Syntax.ranges 'a="";b=" ";c="X"'
        for i in [2,3,7,9,13,15]
            inc rgs, i, '"', 'string double punctuation'
        inc rgs, 14, 'X', 'string double'
                
        rgs = Syntax.ranges "a='';b=' ';c='Y'"
        for i in [2,3,7,9,13,15]
            inc rgs, i, "'", 'string single punctuation'
        inc rgs, 14, 'Y', 'string single'
                
        rgs = Syntax.ranges "a=``;b=` `;c=`Z`"
        for i in [2,3,7,9,13,15]
            inc rgs, i, "`", 'string backtick punctuation'
        inc rgs, 14, 'Z', 'string backtick'
                
    #  0000000   0000000   00     00  00     00  00000000  000   000  000000000   0000000  
    # 000       000   000  000   000  000   000  000       0000  000     000     000       
    # 000       000   000  000000000  000000000  0000000   000 0 000     000     0000000   
    # 000       000   000  000 0 000  000 0 000  000       000  0000     000          000  
    #  0000000   0000000   000   000  000   000  00000000  000   000     000     0000000   
    
    it 'comments', ->
        
        rgs = Syntax.ranges "hello # world", 'coffee'
        inc rgs, 6, "#",    'comment punctuation'
        inc rgs, 8, "world", 'comment'

        rgs = Syntax.ranges "   # bla blub", 'noon'
        inc rgs, 3, "#",    'comment punctuation'
        inc rgs, 5, "bla",   'comment'
        inc rgs, 9, "blub",  'comment'
            
    it 'no comment', ->
        
        rgs = Syntax.ranges "(^\s*#\s*)(.*)$", 'noon'
        for rng in rgs
            expect(rng).to.not.have.property 'value', 'comment'
                
    # 000   000  000000000  00     00  000    
    # 000   000     000     000   000  000    
    # 000000000     000     000000000  000    
    # 000   000     000     000 0 000  000    
    # 000   000     000     000   000  0000000
    
    it 'html', ->
        
        rgs = Syntax.ranges "</div>", 'html' 
        inc rgs, 0, "<",    'keyword punctuation'
        inc rgs, 1, "/",    'keyword punctuation'
        inc rgs, 2, "div",  'keyword'
        inc rgs, 5, ">",    'keyword punctuation'

        rgs = Syntax.ranges "<div>", 'html' 
        inc rgs, 0, "<",    'keyword punctuation'
        inc rgs, 1, "div",  'keyword'
        inc rgs, 4, ">",    'keyword punctuation'
            
    #  0000000  00000000   00000000         0000000    00000000  00000000  000  000   000  00000000  
    # 000       000   000  000   000        000   000  000       000       000  0000  000  000       
    # 000       00000000   00000000         000   000  0000000   000000    000  000 0 000  0000000   
    # 000       000        000              000   000  000       000       000  000  0000  000       
    #  0000000  000        000              0000000    00000000  000       000  000   000  00000000  
    
    it 'cpp define', ->
        
        rgs = Syntax.ranges "#include", 'cpp'      
        inc rgs, 0, "#",        'define punctuation'
        inc rgs, 1, "include",  'define'

        rgs = Syntax.ranges "#if", 'cpp'            
        inc rgs, 0, "#",        'define punctuation'
        inc rgs, 1, "if",       'define'

        rgs = Syntax.ranges "#  if", 'cpp'            
        inc rgs, 0, "#",        'define punctuation'
        inc rgs, 3, "if",       'define'
            
    it 'cpp keyword', ->
        
        rgs = Syntax.ranges "if (true) {} else {}", 'cpp'    
        inc rgs, 0, "if",    'keyword'
        inc rgs, 4, "true",  'keyword'
        inc rgs, 13, "else", 'keyword'
            
    #  0000000  00000000   00000000         00000000  000       0000000    0000000   000000000  
    # 000       000   000  000   000        000       000      000   000  000   000     000     
    # 000       00000000   00000000         000000    000      000   000  000000000     000     
    # 000       000        000              000       000      000   000  000   000     000     
    #  0000000  000        000              000       0000000   0000000   000   000     000     
    
    it 'cpp float', ->

        rgs = Syntax.ranges "'abc"            
        inc rgs, 1, "abc", 'string single'
        
        rgs = Syntax.ranges "1.0f", 'cpp'
        inc rgs, 0, "1",  'number float'
        inc rgs, 1, ".",  'number float punctuation'
        inc rgs, 2, "0f", 'number float'

        rgs = Syntax.ranges "0.0000f", 'cpp'
        inc rgs, 2, "0000f", 'number float'
       
    # 000   0000000   0000000  
    # 000  000       000       
    # 000  0000000   0000000   
    # 000       000       000  
    # 000  0000000   0000000   
    
    it 'iss', ->
        
        rgs = Syntax.ranges "a={#key}", 'iss'
        inc rgs, 2, '{',   'property punctuation'
        inc rgs, 3, "#",   'property punctuation'
        inc rgs, 4, 'key', 'property'
        inc rgs, 7, "}",   'property punctuation'
        
    #       000   0000000  
    #       000  000       
    #       000  0000000   
    # 000   000       000  
    #  0000000   0000000   
    
    it 'js', ->
        
        rgs = Syntax.ranges "func = function() {", 'js'
        inc rgs, 0, 'func', 'function'
        
    #  0000000   0000000   00000000  00000000  00000000  00000000  
    # 000       000   000  000       000       000       000       
    # 000       000   000  000000    000000    0000000   0000000   
    # 000       000   000  000       000       000       000       
    #  0000000   0000000   000       000       00000000  00000000  
    
    it 'coffee', ->
        
        rgs = Syntax.ranges "mthd:  (arg)    => @member memarg", 'coffee'
        inc rgs, 0,  'mthd', 'method'
        inc rgs, 4,  ':',    'method punctuation'
        inc rgs, 16, '=',    'function tail bound punctuation'
        inc rgs, 17, '>',    'function head bound punctuation'
        
        rgs = Syntax.ranges "@height/2 + @height/6", 'coffee'
        inc rgs, 8, "2", 'number'
        
        rgs = Syntax.ranges "a and b", 'coffee'
        inc rgs, 0, "a", 'text'
        inc rgs, 2, "and", 'keyword'

        rgs = Syntax.ranges "if a then b", 'coffee'
        inc rgs, 0, "if", 'keyword'
        inc rgs, 3, "a", 'text'
        inc rgs, 5, "then", 'keyword'
        inc rgs, 10, "b", 'text'
            
        rgs = Syntax.ranges "f 'a'", 'coffee'
        inc rgs, 0, "f", 'function call'

        rgs = Syntax.ranges "ff 'b'", 'coffee'
        inc rgs, 0, "ff", 'function call'

        rgs = Syntax.ranges "fff 1", 'coffee'
        inc rgs, 0, "fff", 'function call'

        rgs = Syntax.ranges "ffff -1", 'coffee'
        inc rgs, 0, "ffff", 'function call'

        rgs = Syntax.ranges "f [1]", 'coffee'
        inc rgs, 0, "f", 'function call'
            
        rgs = Syntax.ranges "fffff {1}", 'coffee'
        inc rgs, 0, "fffff", 'function call'

        rgs = Syntax.ranges "switch a", 'coffee'
        inc rgs, 0, "switch", 'keyword'
            
        rgs = Syntax.ranges "pos: (item, p) -> ", 'coffee'
        inc rgs, 0, "pos", 'method'
        inc rgs, 3, ":", 'method punctuation'

        rgs = Syntax.ranges "pos= (item, p) -> ", 'coffee'
        inc rgs, 0, "pos", 'function'
            
        rgs = Syntax.ranges " a: =>", 'coffee'
        inc rgs, 1, "a", 'method'
        inc rgs, 2, ":", 'method punctuation'
        inc rgs, 4, "=", 'function tail bound punctuation'
        inc rgs, 5, ">", 'function head bound punctuation'
        
        rgs = Syntax.ranges " a: ->", 'coffee'
        inc rgs, 1, "a", 'method'
        inc rgs, 2, ":", 'method punctuation'
        inc rgs, 4, "-", 'function tail punctuation'
        inc rgs, 5, ">", 'function head punctuation'
            
        rgs = Syntax.ranges " a: b", 'coffee'
        inc rgs, 1, "a", 'dictionary key'
        inc rgs, 2, ":", 'dictionary punctuation'
        
        rgs = Syntax.ranges "obj.value = obj.another.value", 'coffee'
        inc rgs, 0,  "obj",    'obj'
        inc rgs, 4,  "value",  'property'
        inc rgs, 12, "obj",    'obj'
        inc rgs, 16, "another",'property'
        inc rgs, 24, "value",  'property'
            
        rgs = Syntax.ranges "if someObject.someProp", 'coffee'
        inc rgs, 0, "if", 'keyword'
        inc rgs, 3, "someObject", 'obj'
        inc rgs, 13, ".", 'property punctuation'
        inc rgs, 14, "someProp", 'property'
            
        rgs = Syntax.ranges "a(b).length", 'coffee'
        inc rgs, 0, "a", 'function call'
        inc rgs, 5, "length", 'property'
    
    # 000   000  000   000  00     00  0000000    00000000  00000000    0000000  
    # 0000  000  000   000  000   000  000   000  000       000   000  000       
    # 000 0 000  000   000  000000000  0000000    0000000   0000000    0000000   
    # 000  0000  000   000  000 0 000  000   000  000       000   000       000  
    # 000   000   0000000   000   000  0000000    00000000  000   000  0000000   
    
    it 'numbers', ->
        
        rgs = Syntax.ranges "a 6670"
        inc rgs, 2, "6670", 'number'

        rgs = Syntax.ranges "0x667AC"
        inc rgs, 0, "0x667AC", 'number hex'

        rgs = Syntax.ranges "66.700"
        inc rgs, 0, "66",  'number float'
        inc rgs, 2, ".",   'number float punctuation'
        inc rgs, 3, "700", 'number float'

        rgs = Syntax.ranges "77.800 -100"
        inc rgs, 0, "77",  'number float'
        inc rgs, 8, "100", 'number'

        rgs = Syntax.ranges "(8.9,100.2)"
        inc rgs, 3, "9", 'number float'
        inc rgs, 9, "2", 'number float'
            
    #  0000000  00000000  00     00  000   000  00000000  00000000   
    # 000       000       000   000  000   000  000       000   000  
    # 0000000   0000000   000000000   000 000   0000000   0000000    
    #      000  000       000 0 000     000     000       000   000  
    # 0000000   00000000  000   000      0      00000000  000   000  
    
    it 'semver', ->    
        
        rgs = Syntax.ranges "66.70.0"
        inc rgs, 0, "66", 'semver'
        inc rgs, 3, "70", 'semver'
        inc rgs, 6, "0",  'semver'

        rgs = Syntax.ranges "^0.7.1"
        inc rgs, 1, "0", 'semver'
        inc rgs, 3, "7", 'semver'
        inc rgs, 5, "1", 'semver'
            
        rgs = Syntax.ranges "^1.0.0-alpha.12"
        inc rgs, 1, "1", 'semver'
        inc rgs, 3, "0", 'semver'
        inc rgs, 5, "0", 'semver'
                            
    # 00000000   000   000  000   000   0000000  000000000  000   000   0000000   000000000  000   0000000   000   000  
    # 000   000  000   000  0000  000  000          000     000   000  000   000     000     000  000   000  0000  000  
    # 00000000   000   000  000 0 000  000          000     000   000  000000000     000     000  000   000  000 0 000  
    # 000        000   000  000  0000  000          000     000   000  000   000     000     000  000   000  000  0000  
    # 000         0000000   000   000   0000000     000      0000000   000   000     000     000   0000000   000   000  
    
    it 'punctuation', ->
        
        rgs = Syntax.ranges '/some\\path/file.txt:10'
        inc rgs, 0,  '/',  'punctuation'
        inc rgs, 5,  '\\', 'punctuation'
        inc rgs, 15, '.',  'punctuation'
        inc rgs, 19, ':',  'punctuation'
            