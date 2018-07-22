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

describe 'syntax', ->
    
    it 'interpolation', ->    
        
        rgs = Syntax.ranges '"#{666}"', 'coffee'
        expect(rgs).to.deep.include 
            start: 0
            match: '"'
            value: 'string double punctuation'
        expect(rgs).to.deep.include 
            start: 3
            match: '666'
            value: 'number'
        expect(rgs).to.deep.include 
            start: 7
            match: '"'
            value: 'string double punctuation'
    
    #  0000000  000000000  00000000   000  000   000   0000000    0000000  
    # 000          000     000   000  000  0000  000  000        000       
    # 0000000      000     0000000    000  000 0 000  000  0000  0000000   
    #      000     000     000   000  000  000  0000  000   000       000  
    # 0000000      000     000   000  000  000   000   0000000   0000000   
    
    it 'strings', ->
       
        rgs = Syntax.ranges """a="\\"E\\"" """
        expect(rgs).to.deep.include 
            start: 2
            match: '"'
            value: 'string double punctuation'
        expect(rgs).to.deep.include 
            start: 3
            match: '\\"E\\"'
            value: 'string double'
        expect(rgs).to.deep.include 
            start: 8
            match: '"'
            value: 'string double punctuation'
        
        rgs = Syntax.ranges 'a="\'X\'"'
        expect(rgs).to.deep.include 
            start: 2
            match: '"'
            value: 'string double punctuation'
        expect(rgs).to.deep.include 
            start: 3
            match: "'X'"
            value: 'string double'
        expect(rgs).to.deep.include 
            start: 6
            match: '"'
            value: 'string double punctuation'

        rgs = Syntax.ranges 'a=\'"X"\''
        expect(rgs).to.deep.include 
            start: 2
            match: "'"
            value: 'string single punctuation'
        expect(rgs).to.deep.include 
            start: 3
            match: '"X"'
            value: 'string single'
        expect(rgs).to.deep.include 
            start: 6
            match: "'"
            value: 'string single punctuation'

        rgs = Syntax.ranges 'a=`"X"`'
        expect(rgs).to.deep.include 
            start: 2
            match: "`"
            value: 'string backtick punctuation'
        expect(rgs).to.deep.include 
            start: 3
            match: '"X"'
            value: 'string backtick'
        expect(rgs).to.deep.include 
            start: 6
            match: "`"
            value: 'string backtick punctuation'
            
        rgs = Syntax.ranges 'a="  \'X\'  Y  " '
        expect(rgs).to.deep.include 
            start: 2
            match: '"'
            value: 'string double punctuation'
        expect(rgs).to.deep.include 
            start: 5
            match: "'X'"
            value: 'string double'
        expect(rgs).to.deep.include 
            start: 10
            match: "Y"
            value: 'string double'
        expect(rgs).to.deep.include 
            start: 13
            match: '"'
            value: 'string double punctuation'
                        
        rgs = Syntax.ranges 'a="";b=" ";c="X"'
        for i in [2,3,7,9,13,15]
            expect(rgs).to.deep.include 
                start: i
                match: '"'
                value: 'string double punctuation'
        expect(rgs).to.deep.include 
            start: 14
            match: 'X'
            value: 'string double'
                
        rgs = Syntax.ranges "a='';b=' ';c='Y'"
        for i in [2,3,7,9,13,15]
            expect(rgs).to.deep.include 
                start: i
                match: "'"
                value: 'string single punctuation'
        expect(rgs).to.deep.include 
            start: 14
            match: 'Y'
            value: 'string single'
                
        rgs = Syntax.ranges "a=``;b=` `;c=`Z`"
        for i in [2,3,7,9,13,15]
            expect(rgs).to.deep.include 
                start: i
                match: "`"
                value: 'string backtick punctuation'
        expect(rgs).to.deep.include 
            start: 14
            match: 'Z'
            value: 'string backtick'
                
    #  0000000   0000000   00     00  00     00  00000000  000   000  000000000   0000000  
    # 000       000   000  000   000  000   000  000       0000  000     000     000       
    # 000       000   000  000000000  000000000  0000000   000 0 000     000     0000000   
    # 000       000   000  000 0 000  000 0 000  000       000  0000     000          000  
    #  0000000   0000000   000   000  000   000  00000000  000   000     000     0000000   
    
    it 'comments', ->
        
        rgs = Syntax.ranges "hello # world", 'coffee'
        expect(rgs).to.deep.include 
            start: 6
            match: "#"
            value: 'comment punctuation'
        expect(rgs).to.deep.include
            start: 8
            match: "world"
            value: 'comment'

        rgs = Syntax.ranges "   # bla blub", 'noon'
        expect(rgs).to.deep.include 
            start: 3
            match: "#"
            value: 'comment punctuation'
        expect(rgs).to.deep.include
            start: 5
            match: "bla"
            value: 'comment'
        expect(rgs).to.deep.include
            start: 9
            match: "blub"
            value: 'comment'
            
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
        expect(rgs).to.deep.include
            start: 0
            match: "<"
            value: 'keyword punctuation'
        expect(rgs).to.deep.include
            start: 1
            match: "/"
            value: 'keyword punctuation'
        expect(rgs).to.deep.include
            start: 2
            match: "div"
            value: 'keyword'
        expect(rgs).to.deep.include
            start: 5
            match: ">"
            value: 'keyword punctuation'

        rgs = Syntax.ranges "<div>", 'html' 
        expect(rgs).to.deep.include
            start: 0
            match: "<"
            value: 'keyword punctuation'
        expect(rgs).to.deep.include
            start: 1
            match: "div"
            value: 'keyword'
        expect(rgs).to.deep.include
            start: 4
            match: ">"
            value: 'keyword punctuation'
            
    #  0000000  00000000   00000000         0000000    00000000  00000000  000  000   000  00000000  
    # 000       000   000  000   000        000   000  000       000       000  0000  000  000       
    # 000       00000000   00000000         000   000  0000000   000000    000  000 0 000  0000000   
    # 000       000        000              000   000  000       000       000  000  0000  000       
    #  0000000  000        000              0000000    00000000  000       000  000   000  00000000  
    
    it 'cpp define', ->
        
        rgs = Syntax.ranges "#include", 'cpp'      
        expect(rgs).to.deep.include
            start: 0
            match: "#"
            value: 'define punctuation'
        expect(rgs).to.deep.include
            start: 1
            match: "include"
            value: 'define'

        rgs = Syntax.ranges "#if", 'cpp'            
        expect(rgs).to.deep.include
            start: 0
            match: "#"
            value: 'define punctuation'
        expect(rgs).to.deep.include
            start: 1
            match: "if"
            value: 'define'

        rgs = Syntax.ranges "#  if", 'cpp'            
        expect(rgs).to.deep.include
            start: 0
            match: "#"
            value: 'define punctuation'
        expect(rgs).to.deep.include
            start: 3
            match: "if"
            value: 'define'
            
    it 'cpp keyword', ->
        
        rgs = Syntax.ranges "if (true) {} else {}", 'cpp'    
        expect(rgs).to.deep.include
            start: 0
            match: "if"
            value: 'keyword'
        expect(rgs).to.deep.include
            start: 4
            match: "true"
            value: 'keyword'
        expect(rgs).to.deep.include
            start: 13
            match: "else"
            value: 'keyword'
            
    #  0000000  00000000   00000000         00000000  000       0000000    0000000   000000000  
    # 000       000   000  000   000        000       000      000   000  000   000     000     
    # 000       00000000   00000000         000000    000      000   000  000000000     000     
    # 000       000        000              000       000      000   000  000   000     000     
    #  0000000  000        000              000       0000000   0000000   000   000     000     
    
    it 'cpp float', ->

        rgs = Syntax.ranges "'abc"            
        expect(rgs).to.deep.include
            start: 1
            match: "abc"
            value: 'string single'
        
        rgs = Syntax.ranges "1.0f", 'cpp'
        expect(rgs).to.deep.include
            start: 0
            match: "1"
            value: 'number float'
        expect(rgs).to.deep.include
            start: 1
            match: "."
            value: 'number float punctuation'
        expect(rgs).to.deep.include
            start: 2
            match: "0f"
            value: 'number float'

        rgs = Syntax.ranges "0.0000f", 'cpp'
        expect(rgs).to.deep.include
            start: 2
            match: "0000f"
            value: 'number float'
            
    #  0000000   0000000   00000000  00000000  00000000  00000000  
    # 000       000   000  000       000       000       000       
    # 000       000   000  000000    000000    0000000   0000000   
    # 000       000   000  000       000       000       000       
    #  0000000   0000000   000       000       00000000  00000000  
    
    it 'coffee', ->
        
        rgs = Syntax.ranges "a and b", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "a"
            value: 'text'
        expect(rgs).to.deep.include
            start: 2
            match: "and"
            value: 'keyword'

        rgs = Syntax.ranges "if a then b", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "if"
            value: 'keyword'
        expect(rgs).to.deep.include
            start: 3
            match: "a"
            value: 'text'
        expect(rgs).to.deep.include
            start: 5
            match: "then"
            value: 'keyword'
        expect(rgs).to.deep.include
            start: 10
            match: "b"
            value: 'text'
            
        rgs = Syntax.ranges "f 'a'", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "f"
            value: 'function call'

        rgs = Syntax.ranges "ff 'b'", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "ff"
            value: 'function call'

        rgs = Syntax.ranges "fff 1", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "fff"
            value: 'function call'

        rgs = Syntax.ranges "ffff -1", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "ffff"
            value: 'function call'

        rgs = Syntax.ranges "f [1]", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "f"
            value: 'function call'
            
        rgs = Syntax.ranges "fffff {1}", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "fffff"
            value: 'function call'

        rgs = Syntax.ranges "switch a", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "switch"
            value: 'keyword'
            
        rgs = Syntax.ranges "pos: (item, p) -> ", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "pos"
            value: 'method'
        expect(rgs).to.deep.include
            start: 3
            match: ":"
            value: 'method punctuation'

        rgs = Syntax.ranges "pos= (item, p) -> ", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "pos"
            value: 'function'
            
        rgs = Syntax.ranges " a: =>", 'coffee'
        expect(rgs).to.deep.include
            start: 1
            match: "a"
            value: 'method'
        expect(rgs).to.deep.include
            start: 2
            match: ":"
            value: 'method punctuation'
        expect(rgs).to.deep.include
            start: 4
            match: "="
            value: 'function tail bound'
        expect(rgs).to.deep.include
            start: 5
            match: ">"
            value: 'function head bound'
        
        rgs = Syntax.ranges " a: ->", 'coffee'
        expect(rgs).to.deep.include
            start: 1
            match: "a"
            value: 'method'
        expect(rgs).to.deep.include
            start: 2
            match: ":"
            value: 'method punctuation'
        expect(rgs).to.deep.include
            start: 4
            match: "-"
            value: 'function tail'
        expect(rgs).to.deep.include
            start: 5
            match: ">"
            value: 'function head'
            
        rgs = Syntax.ranges " a: b", 'coffee'
        expect(rgs).to.deep.include
            start: 1
            match: "a"
            value: 'dictionary key'
        expect(rgs).to.deep.include
            start: 2
            match: ":"
            value: 'dictionary punctuation'
        
        rgs = Syntax.ranges "obj.value = obj.another.value", 'coffee'
        expect(rgs).to.deep.include 
            start: 0
            match: "obj"
            value: 'obj'
        expect(rgs).to.deep.include 
            start: 4
            match: "value"
            value: 'property'
        expect(rgs).to.deep.include 
            start: 12
            match: "obj"
            value: 'obj'
        expect(rgs).to.deep.include 
            start: 16
            match: "another"
            value: 'property'
        expect(rgs).to.deep.include 
            start: 24
            match: "value"
            value: 'property'
            
        rgs = Syntax.ranges "if args.rights", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "if"
            value: 'keyword'
        expect(rgs).to.deep.include
            start: 3
            match: "args"
            value: 'obj'
        expect(rgs).to.deep.include 
            start: 8
            match: "rights"
            value: 'property'
            
        rgs = Syntax.ranges "a(b).length", 'coffee'
        expect(rgs).to.deep.include
            start: 0
            match: "a"
            value: 'function call'
        expect(rgs).to.deep.include
            start: 5
            match: "length"
            value: 'property'
    
    # 000   000  000   000  00     00  0000000    00000000  00000000    0000000  
    # 0000  000  000   000  000   000  000   000  000       000   000  000       
    # 000 0 000  000   000  000000000  0000000    0000000   0000000    0000000   
    # 000  0000  000   000  000 0 000  000   000  000       000   000       000  
    # 000   000   0000000   000   000  0000000    00000000  000   000  0000000   
    
    it 'numbers', ->
        
        rgs = Syntax.ranges "a 6670"
        expect(rgs).to.deep.include 
            start: 2
            match: "6670"
            value: 'number'

        rgs = Syntax.ranges "667AC"
        expect(rgs).to.deep.include
            start: 0
            match: "667AC"
            value: 'number hex'

        rgs = Syntax.ranges "66.700"
        expect(rgs).to.deep.include
            start: 0
            match: "66"
            value: 'number float'
        expect(rgs).to.deep.include
            start: 2
            match: "."
            value: 'number float punctuation'
        expect(rgs).to.deep.include
            start: 3
            match: "700"
            value: 'number float'

        rgs = Syntax.ranges "77.800 -100"
        expect(rgs).to.deep.include
            start: 0
            match: "77"
            value: 'number float'
        expect(rgs).to.deep.include
            start: 8
            match: "100"
            value: 'number'

        rgs = Syntax.ranges "(8.9,100.2)"
        expect(rgs).to.deep.include
            start: 3
            match: "9"
            value: 'number float'
        expect(rgs).to.deep.include
            start: 9
            match: "2"
            value: 'number float'
            
    #  0000000  00000000  00     00  000   000  00000000  00000000   
    # 000       000       000   000  000   000  000       000   000  
    # 0000000   0000000   000000000   000 000   0000000   0000000    
    #      000  000       000 0 000     000     000       000   000  
    # 0000000   00000000  000   000      0      00000000  000   000  
    
    it 'semver', ->    
        
        rgs = Syntax.ranges "66.70.0"
        expect(rgs).to.deep.include
            start: 0
            match: "66"
            value: 'semver'
        expect(rgs).to.deep.include
            start: 3
            match: "70"
            value: 'semver'
        expect(rgs).to.deep.include
            start: 6
            match: "0"
            value: 'semver'

        rgs = Syntax.ranges "^0.7.1"
        expect(rgs).to.deep.include
            start: 1
            match: "0"
            value: 'semver'
        expect(rgs).to.deep.include
            start: 3
            match: "7"
            value: 'semver'
        expect(rgs).to.deep.include
            start: 5
            match: "1"
            value: 'semver'
            
        rgs = Syntax.ranges "^1.0.0-alpha.12"
        expect(rgs).to.deep.include
            start: 1
            match: "1"
            value: 'semver'
        expect(rgs).to.deep.include
            start: 3
            match: "0"
            value: 'semver'
        expect(rgs).to.deep.include
            start: 5
            match: "0"
            value: 'semver'
                            
    # 00000000   000   000  000   000   0000000  000000000  000   000   0000000   000000000  000   0000000   000   000  
    # 000   000  000   000  0000  000  000          000     000   000  000   000     000     000  000   000  0000  000  
    # 00000000   000   000  000 0 000  000          000     000   000  000000000     000     000  000   000  000 0 000  
    # 000        000   000  000  0000  000          000     000   000  000   000     000     000  000   000  000  0000  
    # 000         0000000   000   000   0000000     000      0000000   000   000     000     000   0000000   000   000  
    
    it 'punctuation', ->
        
        rgs = Syntax.ranges '/some\\path/file.txt:10'
        expect(rgs).to.deep.include 
            start: 0
            match: '/'
            value: 'punctuation'
        expect(rgs).to.deep.include 
            start: 5
            match: '\\'
            value: 'punctuation'
        expect(rgs).to.deep.include 
            start: 15
            match: '.'
            value: 'punctuation'
        expect(rgs).to.deep.include 
            start: 19
            match: ':'
            value: 'punctuation'
            