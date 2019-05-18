###
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000   
###

{ log } = require '../../kxk'

Syntax = require '../js/blocks'
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
        inc rgs, 2, '/', 'punctuation regexp'
        inc rgs, 3, 'a', 'text regexp'
        inc rgs, 4, '/', 'punctuation regexp'
                
        rgs = Syntax.ranges "/(a|.*|\s\d\w\S\W$|^\s+)/", 'coffee'
        inc rgs, 0, '/', 'punctuation regexp'
        inc rgs, 2, 'a', 'text regexp'
            
        rgs = Syntax.ranges "/^#include/", 'coffee'
        inc rgs, 0, '/',       'punctuation regexp'
        inc rgs, 2, "#",       'punctuation regexp'
        inc rgs, 3, "include", 'text regexp'

        rgs = Syntax.ranges "/\\'hello\\'/ ", 'coffee'
        inc rgs, 0, '/',       'punctuation regexp'
        inc rgs, 1, "\\",      'punctuation regexp'
        inc rgs, 2, "'",       'punctuation regexp'
        inc rgs, 3, "hello",   'text regexp'

        rgs = Syntax.ranges "f a /b - c/gi", 'coffee'
        inc rgs, 4, '/', 'punctuation regexp'
        inc rgs, 5, 'b', 'text regexp'
        inc rgs, 10, '/', 'punctuation regexp'
        
    it 'no regexp', ->
        
        # f a / b - c/gi
        # f a/b - c/gi
        
        rgs = Syntax.ranges 'a / b - c / d', 'coffee'
        nut rgs, 2, '/', 'punctuation regexp'

        rgs = Syntax.ranges 'f a/b, c/d', 'coffee'
        nut rgs, 3, '/', 'punctuation regexp'
        
    # 00000000   00000000   0000000   000   000  000  00000000   00000000  
    # 000   000  000       000   000  000   000  000  000   000  000       
    # 0000000    0000000   000 00 00  000   000  000  0000000    0000000   
    # 000   000  000       000 0000   000   000  000  000   000  000       
    # 000   000  00000000   00000 00   0000000   000  000   000  00000000  
    
    it 'require', ->
        
        rgs = Syntax.ranges "util = require 'util'", 'coffee'
        inc rgs, 7, 'require', 'require'
    
    #  0000000   0000000   00     00  00     00  00000000  000   000  000000000   0000000  
    # 000       000   000  000   000  000   000  000       0000  000     000     000       
    # 000       000   000  000000000  000000000  0000000   000 0 000     000     0000000   
    # 000       000   000  000 0 000  000 0 000  000       000  0000     000          000  
    #  0000000   0000000   000   000  000   000  00000000  000   000     000     0000000   
    
    it 'comments', ->
        
        rgs = Syntax.ranges "hello # world", 'coffee'
        inc rgs, 6, "#",    'punctuation comment'
        inc rgs, 8, "world", 'comment'

        rgs = Syntax.ranges "   # bla blub", 'noon'
        inc rgs, 3, "#",     'punctuation comment'
        inc rgs, 5, "bla",   'comment'
        inc rgs, 9, "blub",  'comment'
            
    it 'no comment', ->
        
        rgs = Syntax.ranges "(^\s*#\s*)(.*)$", 'noon'
        for rng in rgs
            expect(rng).to.not.have.property 'value', 'comment'
            
    #  0000000  000000000  00000000   000  000   000   0000000    0000000  
    # 000          000     000   000  000  0000  000  000        000       
    # 0000000      000     0000000    000  000 0 000  000  0000  0000000   
    #      000     000     000   000  000  000  0000  000   000       000  
    # 0000000      000     000   000  000  000   000   0000000   0000000   
    
    it 'strings', ->
       
        rgs = Syntax.ranges """a="\\"E\\"" """
        inc rgs, 2, '"',       'punctuation string double'
        inc rgs, 3, '\\"E\\"', 'string double'
        inc rgs, 8, '"',       'punctuation string double'
        
        rgs = Syntax.ranges 'a="\'X\'"'
        inc rgs, 2, '"',   'punctuation string double'
        inc rgs, 3, "'X'", 'string double'
        inc rgs, 6, '"',   'punctuation string double'

        rgs = Syntax.ranges 'a=\'"X"\'', 'coffee'
        inc rgs, 2, "'",   'punctuation string single'
        inc rgs, 3, '"X"', 'string single'
        inc rgs, 6, "'",   'punctuation string single'

        rgs = Syntax.ranges 'a=`"X"`'
        inc rgs, 2, "`",   'punctuation string backtick'
        inc rgs, 3, '"X"', 'string backtick'
        inc rgs, 6, "`",   'punctuation string backtick'
            
        rgs = Syntax.ranges 'a="  \'X\'  Y  " '
        inc rgs, 2, '"',   'punctuation string double'
        inc rgs, 5, "'X'", 'string double'
        inc rgs, 10, "Y",  'string double'
        inc rgs, 13, '"',  'punctuation string double'
                        
        rgs = Syntax.ranges 'a="";b=" ";c="X"'
        for i in [2,3,7,9,13,15]
            inc rgs, i, '"', 'punctuation string double'
        inc rgs, 14, 'X', 'string double'
                
        rgs = Syntax.ranges "a='';b=' ';c='Y'", 'coffee'
        for i in [2,3,7,9,13,15]
            inc rgs, i, "'", 'punctuation string single'
        inc rgs, 14, 'Y', 'string single'
                
        rgs = Syntax.ranges "a=``;b=` `;c=`Z`"
        for i in [2,3,7,9,13,15]
            inc rgs, i, "`", 'punctuation string backtick'
        inc rgs, 14, 'Z', 'string backtick'

    # 000  000   000  000000000  00000000  00000000   00000000    0000000   000       0000000   000000000  000   0000000   000   000  
    # 000  0000  000     000     000       000   000  000   000  000   000  000      000   000     000     000  000   000  0000  000  
    # 000  000 0 000     000     0000000   0000000    00000000   000   000  000      000000000     000     000  000   000  000 0 000  
    # 000  000  0000     000     000       000   000  000        000   000  000      000   000     000     000  000   000  000  0000  
    # 000  000   000     000     00000000  000   000  000         0000000   0000000  000   000     000     000   0000000   000   000  
    
    it 'interpolation', ->    
        
        rgs = Syntax.ranges '"#{666}"', 'coffee'
        inc rgs, 0, '"',   'punctuation string double'
        inc rgs, 3, '666', 'number'
        inc rgs, 7, '"',   'punctuation string double'
        
    # 000   000  000000000  00     00  000    
    # 000   000     000     000   000  000    
    # 000000000     000     000000000  000    
    # 000   000     000     000 0 000  000    
    # 000   000     000     000   000  0000000
    
    it 'html', ->
        
        rgs = Syntax.ranges "</div>", 'html' 
        inc rgs, 0, "<",    'punctuation keyword'
        inc rgs, 1, "/",    'punctuation keyword'
        inc rgs, 2, "div",  'keyword'
        inc rgs, 5, ">",    'punctuation keyword'

        rgs = Syntax.ranges "<div>", 'html' 
        inc rgs, 0, "<",    'punctuation keyword'
        inc rgs, 1, "div",  'keyword'
        inc rgs, 4, ">",    'punctuation keyword'
            
    #  0000000  00000000   00000000         0000000    00000000  00000000  000  000   000  00000000  
    # 000       000   000  000   000        000   000  000       000       000  0000  000  000       
    # 000       00000000   00000000         000   000  0000000   000000    000  000 0 000  0000000   
    # 000       000        000              000   000  000       000       000  000  0000  000       
    #  0000000  000        000              0000000    00000000  000       000  000   000  00000000  
    
    it 'cpp define', ->
        
        rgs = Syntax.ranges "#include", 'cpp'      
        inc rgs, 0, "#",        'punctuation define'
        inc rgs, 1, "include",  'define'

        rgs = Syntax.ranges "#if", 'cpp'            
        inc rgs, 0, "#",        'punctuation define'
        inc rgs, 1, "if",       'define'

        rgs = Syntax.ranges "#  if", 'cpp'            
        inc rgs, 0, "#",        'punctuation define'
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

        rgs = Syntax.ranges "1.0f", 'cpp'
        inc rgs, 0, "1",  'number float'
        inc rgs, 1, ".",  'punctuation number float'
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
        inc rgs, 2, '{',   'punctuation property'
        inc rgs, 3, "#",   'punctuation property'
        inc rgs, 4, 'key', 'property text'
        inc rgs, 7, "}",   'punctuation property'
        
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
        
        rgs = Syntax.ranges "getValue = (back=-1) -> ", 'coffee'
        inc rgs, 0,  'getValue', 'function'
        nut rgs, 12, 'back',     'function'
        inc rgs, 21, '-', 'punctuation function tail'
        inc rgs, 22, '>', 'punctuation function head'
        
        rgs = Syntax.ranges "class Macro extends Command", 'coffee'
        inc rgs, 0,  'class',   'keyword'
        inc rgs, 6,  'Macro',   'class'
        inc rgs, 12, 'extends', 'keyword'
        inc rgs, 20, 'Command', 'class'
        
        rgs = Syntax.ranges "exist?.prop", 'coffee'
        inc rgs, 7, 'prop', 'property'
        
        rgs = Syntax.ranges "mthd:  (arg)    => @member memarg", 'coffee'
        inc rgs, 0,  'mthd', 'method'
        inc rgs, 4,  ':',    'punctuation method'
        inc rgs, 16, '=',    'punctuation function tail bound'
        inc rgs, 17, '>',    'punctuation function head bound'
        
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
        inc rgs, 2, ":", 'punctuation method'
        inc rgs, 4, "=", 'punctuation function tail bound'
        inc rgs, 5, ">", 'punctuation function head bound'
        
        rgs = Syntax.ranges " a: ->", 'coffee'
        inc rgs, 1, "a", 'method'
        inc rgs, 2, ":", 'punctuation method'
        inc rgs, 4, "-", 'punctuation function tail'
        inc rgs, 5, ">", 'punctuation function head'
            
        rgs = Syntax.ranges " a: b", 'coffee'
        inc rgs, 1, "a", 'dictionary key'
        inc rgs, 2, ":", 'punctuation dictionary'
        
        rgs = Syntax.ranges "obj.value = obj.another.value", 'coffee'
        inc rgs, 0,  "obj",    'obj'
        inc rgs, 4,  "value",  'property'
        inc rgs, 12, "obj",    'obj'
        inc rgs, 16, "another",'property'
        inc rgs, 24, "value",  'property'
            
        rgs = Syntax.ranges "if someObject.someProp", 'coffee'
        inc rgs, 0, "if", 'keyword'
        inc rgs, 3, "someObject", 'obj'
        inc rgs, 13, ".", 'punctuation property'
        inc rgs, 14, "someProp", 'property'
            
        rgs = Syntax.ranges "a(b).length", 'coffee'
        inc rgs, 0, "a", 'function call'
        inc rgs, 5, "length", 'property'

        rgs = Syntax.ranges "1 'a'", 'coffee'
        inc rgs, 0, "1", 'number'
        
    it 'koffee', ->
        
        rgs = Syntax.ranges " @: ->", 'koffee'
        inc rgs, 1, "@", 'method'
        inc rgs, 2, ":", 'punctuation method'
        inc rgs, 4, "-", 'punctuation function tail'
        inc rgs, 5, ">", 'punctuation function head'

        rgs = Syntax.ranges "▸if ▸then ▸elif ▸else", 'koffee'
        inc rgs, 0,  "▸if",   'keyword'
        inc rgs, 4,  "▸then", 'keyword'
        inc rgs, 10, "▸elif", 'keyword'
        inc rgs, 16, "▸else", 'keyword'

        rgs = Syntax.ranges "[1 'x' a:1 c:d]", 'koffee'
        inc rgs, 1,  "1",   'number'
        inc rgs, 4,  "x",   'string single'
        inc rgs, 7,  "a",   'dictionary key'
        inc rgs, 11, "c",   'dictionary key'
        
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
        inc rgs, 2, ".",   'punctuation number float'
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
 
    it 'noon', ->
        
        rgs = Syntax.ranges "    property  value", 'noon'
        inc rgs, 4, 'property', 'property'
        inc rgs, 14, 'value', 'text'

        rgs = Syntax.ranges "    prop.erty  value", 'noon'
        inc rgs, 4, 'prop', 'property'
        inc rgs, 8, '.', 'punctuation property'
        inc rgs, 9, 'erty', 'property'
        
    #  0000000  000   000  
    # 000       000   000  
    # 0000000   000000000  
    #      000  000   000  
    # 0000000   000   000  
    
    it 'sh', ->
        
        rgs = Syntax.ranges "dir/path-with-dashes/file.txt", 'sh'
        inc rgs, 0, 'dir', 'dir text'
        inc rgs, 4, 'path', 'dir text'
        inc rgs, 9, 'with', 'dir text'
        inc rgs, 14, 'dashes', 'dir text'
        
        rgs = Syntax.ranges "prg --arg1 -arg2", 'sh'
        inc rgs, 4, '-', 'punctuation argument'
        inc rgs, 5, '-', 'punctuation argument'
        inc rgs, 6, 'arg1', 'argument'
        inc rgs, 11, '-', 'punctuation argument'
        inc rgs, 12, 'arg2', 'argument'
    
    # 000       0000000    0000000   
    # 000      000   000  000        
    # 000      000   000  000  0000  
    # 000      000   000  000   000  
    # 0000000   0000000    0000000   
    
    it 'log', ->

        rgs = Syntax.ranges "http://domain.com", 'log'
        inc rgs, 0, 'http', 'url protocol'
        inc rgs, 4, ':', 'punctuation url'
        inc rgs, 5, '/', 'punctuation url'
        inc rgs, 6, '/', 'punctuation url'
        inc rgs, 7, 'domain', 'url domain'
        inc rgs, 13, '.', 'punctuation url tld'
        inc rgs, 14, 'com', 'url tld'
        
        rgs = Syntax.ranges "file.coffee", 'log'
        inc rgs, 0, 'file', 'coffee file'
        inc rgs, 4, '.', 'punctuation coffee'
        inc rgs, 5, 'coffee', 'coffee ext'
        
        rgs = Syntax.ranges "key /", 'log'
        inc rgs, 0, 'key',   'text'
        
        rgs = Syntax.ranges "/some/path", 'log'
        inc rgs, 1, 'some',   'dir text'
        inc rgs, 5, '/',      'punctuation dir'
        
        rgs = Syntax.ranges "key: value", 'log'
        inc rgs, 0, 'key',    'dictionary key'
        inc rgs, 3, ':',      'punctuation dictionary'

    # 00     00  0000000    
    # 000   000  000   000  
    # 000000000  000   000  
    # 000 0 000  000   000  
    # 000   000  0000000    
    
    it 'md', ->
        
        rgs = Syntax.ranges "**bold**", 'md'
        inc rgs, 0, '*',      'punctuation bold'
        inc rgs, 1, '*',      'punctuation bold'
        inc rgs, 2, 'bold',   'bold text'
        inc rgs, 6, '*',      'punctuation bold'
        inc rgs, 7, '*',      'punctuation bold'
        
        rgs = Syntax.ranges "    - **bold**", 'md'
        inc rgs, 4, '-',    'li2 marker'
        inc rgs, 8, 'bold', 'bold li2'
        
        rgs = Syntax.ranges "    - **", 'md'
        inc rgs, 4, '-',    'li2 marker'
        inc rgs, 6, '*',    'punctuation li2'
        inc rgs, 7, '*',    'punctuation li2'
        
        rgs = Syntax.ranges "*`italic code`*", 'md'
        inc rgs, 0, '*',      'punctuation italic'
        inc rgs, 2, 'italic', 'italic string backtick'
        inc rgs, 9, 'code',   'italic string backtick'
        inc rgs, 14, '*',     'punctuation italic'
        
        rgs = Syntax.ranges "*it lic*", 'md'
        inc rgs, 0, '*',      'punctuation italic'
        inc rgs, 1, 'it',     'italic text'
        inc rgs, 4, 'lic',    'italic text'
        inc rgs, 7, '*',      'punctuation italic'
        
        rgs = Syntax.ranges "*italic*", 'md'
        inc rgs, 0, '*',      'punctuation italic'
        inc rgs, 1, 'italic', 'italic text'
        inc rgs, 7, '*',      'punctuation italic'
        
        rgs = Syntax.ranges "- li", 'md'
        inc rgs, 0, '-',  'li1 marker'
        inc rgs, 2, 'li', 'li1'
        