###
000000000  00000000   0000000  000000000
   000     000       000          000   
   000     0000000   0000000      000   
   000     000            000     000   
   000     00000000  0000000      000   
###

klor = require '../'
kxk = require 'kxk'
kxk.chai()
_ = kxk._

inc = (rgs, start, match, value) -> rgs.map((r) -> _.pick r, ['start''match''value'] ).should.deep.include     start:start, match:match, value:value
nut = (rgs, start, match, value) -> rgs.map((r) -> _.pick r, ['start''match''value'] ).should.not.deep.include start:start, match:match, value:value

ext = 'coffee'
lang    = (l) -> ext = l
ranges  = (s,e) -> klor.ranges  s, e ? ext
parse   = (c,e) -> klor.parse   c.split('\n'), e ? ext
dissect = (c,e) -> klor.dissect c.split('\n'), e ? ext
  
###
00000000    0000000   000   000   0000000   00000000   0000000  
000   000  000   000  0000  000  000        000       000       
0000000    000000000  000 0 000  000  0000  0000000   0000000   
000   000  000   000  000  0000  000   000  000            000  
000   000  000   000  000   000   0000000   00000000  0000000   
###

describe 'ranges' ->
          
    it 'fallback' ->
        
        rgs = ranges 'text', 'unknown'
        inc rgs, 0 'text', 'text'

        rgs = ranges 'text', 'fish'
        inc rgs, 0 'text', 'text'
        
    # 000   000  000   000  000   0000000   0000000   0000000    00000000  
    # 000   000  0000  000  000  000       000   000  000   000  000       
    # 000   000  000 0 000  000  000       000   000  000   000  0000000   
    # 000   000  000  0000  000  000       000   000  000   000  000       
    #  0000000   000   000  000   0000000   0000000   0000000    00000000  
    
    it 'unicode' ->
        
        lang 'coffee'
        
        rgs = ranges "🌈"
        inc rgs, 0 '🌈' 'text'

        rgs = ranges "🌈🌱"
        inc rgs, 0 '🌈' 'text'
        inc rgs, 2 '🌱' 'text'
        
        rgs = ranges "🙂lol😀"
        inc rgs, 0 '🙂' 'text'
        inc rgs, 2 'lol' 'text'
        inc rgs, 5 '😀' 'text'
        
        rgs = ranges "a➜b a▬▶b"
        # log rgs
        inc rgs, 1 '➜' 'punct'
        inc rgs, 5 '▬' 'punct'
        inc rgs, 6 '▶' 'punct'
        
        rgs = ranges "🐀🐁🐂🐃🐄🐅🐆🐇🐈🐉🐊🐋🐌🐍🐎🐏🐐🐑🐒🐓🐔🐕🐖🐗🐘🐙🐚🐛🐜🐝🐞🐟🐠🐡🐢🐣🐤🐥"
        inc rgs, 0 '🐀' 'text'
        inc rgs, 24 '🐌' 'text'

        rgs = ranges "'🔧' bla:1"
        inc rgs, 6 'bla' 'dictionary key'
        
        rgs = ranges "icon: '🔧' bla:1"
        inc rgs, 12 'bla' 'dictionary key'
        
    #  0000000   0000000   00     00  00     00  00000000  000   000  000000000   0000000  
    # 000       000   000  000   000  000   000  000       0000  000     000     000       
    # 000       000   000  000000000  000000000  0000000   000 0 000     000     0000000   
    # 000       000   000  000 0 000  000 0 000  000       000  0000     000          000  
    #  0000000   0000000   000   000  000   000  00000000  000   000     000     0000000   
    
    it 'comments' ->
        
        lang 'coffee'
        
        rgs = ranges "hello # world"
        inc rgs, 6 "#"    'punct comment'
        inc rgs, 8 "world" 'comment'

        lang 'noon'
                
        rgs = ranges "   # bla blub"
        inc rgs, 3 "#"     'punct comment'
        inc rgs, 5 "bla"   'comment'
        inc rgs, 9 "blub"  'comment'
            
        rgs = ranges "(^\s*#\s*)(.*)$"
        for rng in rgs
            rng.should.not.have.property 'value' 'comment'
            
    it 'triple comment' ->
        
        lang 'coffee'
        
        rgs = ranges "###a###"
        inc rgs, 0 "#" 'punct comment triple'
        inc rgs, 1 "#" 'punct comment triple'
        inc rgs, 2 "#" 'punct comment triple'
        inc rgs, 3 "a" 'comment triple'
        inc rgs, 4 "#" 'punct comment triple'
        inc rgs, 5 "#" 'punct comment triple'
        inc rgs, 6 "#" 'punct comment triple'

        dss = dissect "###\na\n###"
        inc dss[0], 0 "#" 'punct comment triple'
        inc dss[0], 1 "#" 'punct comment triple'
        inc dss[0], 2 "#" 'punct comment triple'
        inc dss[1], 0 "a" 'comment triple'
        inc dss[2], 0 "#" 'punct comment triple'
        inc dss[2], 1 "#" 'punct comment triple'
        inc dss[2], 2 "#" 'punct comment triple'

        lang 'styl'
        
        dss = dissect "/*\na\n*/" 
        inc dss[0], 0 "/" 'punct comment triple'
        inc dss[0], 1 "*" 'punct comment triple'
        inc dss[1], 0 "a" 'comment triple'
        inc dss[2], 0 "*" 'punct comment triple'
        inc dss[2], 1 "/" 'punct comment triple'
        
    it 'comment header' ->
        
        lang 'coffee'
        
        rgs = ranges "# 0 00 0000" 
        inc rgs, 0  "#"    'punct comment'
        inc rgs, 2  "0"    'comment header'
        inc rgs, 4  "00"   'comment header'
        inc rgs, 7  "0000" 'comment header'

        dss = dissect "###\n 0 00 0 \n###"
        inc dss[1], 1 "0" 'comment triple header'
        
        rgs = ranges "# 0 * 0.2"
        inc rgs, 2 '0' 'comment'
        inc rgs, 6 '0' 'comment'
        
        dss = dissect "###\n 0 1 0 \n###"
        inc dss[1], 1 "0" 'comment triple'
        
        lang 'styl'
        
        rgs = ranges "// 000"
        inc rgs, 3  "000"    'comment header'

        dss = dissect "/*\n 0 0 0 \n*/"
        inc dss[1], 1 "0" 'comment triple header'
        
    # 000   000  000   000  00     00  0000000    00000000  00000000    0000000  
    # 0000  000  000   000  000   000  000   000  000       000   000  000       
    # 000 0 000  000   000  000000000  0000000    0000000   0000000    0000000   
    # 000  0000  000   000  000 0 000  000   000  000       000   000       000  
    # 000   000   0000000   000   000  0000000    00000000  000   000  0000000   
    
    it 'numbers' ->
        
        lang 'coffee'
                
        rgs = ranges "a 6670"
        inc rgs, 2 "6670" 'number'

        rgs = ranges "0x667AC"
        inc rgs, 0 "0x667AC" 'number hex'

        rgs = ranges "66.700"
        inc rgs, 0 "66"  'number float'
        inc rgs, 2 "."   'punct number float'
        inc rgs, 3 "700" 'number float'

        rgs = ranges "77.800 -100"
        inc rgs, 0 "77"  'number float'
        inc rgs, 8 "100" 'number'

        rgs = ranges "(8.9,100.2)"
        inc rgs, 3 "9" 'number float'
        inc rgs, 9 "2" 'number float'
         
    #  0000000  00000000  00     00  000   000  00000000  00000000   
    # 000       000       000   000  000   000  000       000   000  
    # 0000000   0000000   000000000   000 000   0000000   0000000    
    #      000  000       000 0 000     000     000       000   000  
    # 0000000   00000000  000   000      0      00000000  000   000  
    
    it 'semver' ->    
        
        lang 'coffee'
        
        rgs = ranges "66.70.0"
        inc rgs, 0 "66" 'semver'
        inc rgs, 2 "."  'punct semver'
        inc rgs, 3 "70" 'semver'
        inc rgs, 5 "."  'punct semver'
        inc rgs, 6 "0"  'semver'

        rgs = ranges "^0.7.1"
        inc rgs, 0 "^" 'punct semver'
        inc rgs, 1 "0" 'semver'
        inc rgs, 3 "7" 'semver'
        inc rgs, 5 "1" 'semver'
            
        rgs = ranges "^1.0.0-alpha.12"
        inc rgs, 1 "1" 'semver'
        inc rgs, 3 "0" 'semver'
        inc rgs, 5 "0" 'semver'
        
    #  0000000  000000000  00000000   000  000   000   0000000    0000000  
    # 000          000     000   000  000  0000  000  000        000       
    # 0000000      000     0000000    000  000 0 000  000  0000  0000000   
    #      000     000     000   000  000  000  0000  000   000       000  
    # 0000000      000     000   000  000  000   000   0000000   0000000   
    
    it 'strings' ->
        
        lang 'coffee'
        
        rgs = ranges """a="\\"E\\"" """
        inc rgs, 2 '"'    'punct string double'
        inc rgs, 4 '"'    'string double'
        inc rgs, 5 'E'    'string double'
        inc rgs, 8 '"'    'punct string double'
        
        rgs = ranges 'a="\'X\'"'
        inc rgs, 2 '"'   'punct string double'
        inc rgs, 3 "'"   'string double'
        inc rgs, 4 "X"   'string double'
        inc rgs, 6 '"'   'punct string double'

        rgs = ranges 'a=\'"X"\'' 'coffee'
        inc rgs, 2 "'"   'punct string single'
        inc rgs, 3 '"'   'string single'
        inc rgs, 4 'X'   'string single'
        inc rgs, 6 "'"   'punct string single'
            
        rgs = ranges 'a="  \'X\'  Y  " '
        inc rgs, 2 '"'   'punct string double'
        inc rgs, 5 "'"   'string double'
        inc rgs, 6 "X"   'string double'
        inc rgs, 7 "'"   'string double'
        inc rgs, 13 '"'  'punct string double'
                        
        rgs = ranges 'a="";b=" ";c="X"'
        for i in [2 3 7 9 13 15]
            inc rgs, i, '"', 'punct string double'
        inc rgs, 14 'X' 'string double'
                
        rgs = ranges "a='';b=' ';c='Y'"
        for i in [2 3 7 9 13 15]
            inc rgs, i, "'", 'punct string single'
        inc rgs, 14 'Y' 'string single'
        
        rgs = ranges '''"s = '/some\\path/file.txt:10'"'''
        inc rgs, 5 "'"     'string double'
        inc rgs, 17 "file" 'string double'
        inc rgs, 21 "."    'string double'
        inc rgs, 22 "txt"  'string double'
        inc rgs, 26 "10"   'string double'
        inc rgs, 28 "'"    'string double'
        inc rgs, 29 '"'    'punct string double'
        
        rgs = ranges '''when '"""' then 'string double triple\''''
        inc rgs, 6 '"'     'string single'
        inc rgs, 7 '"'     'string single'
        inc rgs, 8 '"'     'string single'
        
        rgs = ranges "'''when\\''''"
        inc rgs, 3  "when"  'string single triple'
        inc rgs, 8  "'"     'string single triple'
        inc rgs, 11 "'"     'punct string single triple'
        
        # interpolation
        
        rgs = ranges '"#{xxx}"'
        inc rgs, 0 '"'   'punct string double'
        inc rgs, 1 "#"   'punct string interpolation start'
        inc rgs, 2 "{"   'punct string interpolation start'
        inc rgs, 3 'xxx' 'text'
        inc rgs, 6 "}"   'punct string interpolation end'
        inc rgs, 7 '"'   'punct string double'

        rgs = ranges '"#{666}"'
        inc rgs, 0 '"'   'punct string double'
        inc rgs, 3 '666' 'number'
        inc rgs, 7 '"'   'punct string double'

        rgs = ranges '"""#{777}"""'
        inc rgs, 0  '"'   'punct string double triple'
        inc rgs, 1  '"'   'punct string double triple'
        inc rgs, 2  '"'   'punct string double triple'
        inc rgs, 3  '#'   'punct string interpolation start'
        inc rgs, 4  '{'   'punct string interpolation start'
        inc rgs, 5  '777' 'number'
        inc rgs, 8  '}'   'punct string interpolation end'
        inc rgs, 9  '"'   'punct string double triple'
        inc rgs, 10 '"'   'punct string double triple'
        inc rgs, 11 '"'   'punct string double triple'
        
        rgs = ranges '"#{__dirname}/../"'
        inc rgs, 12, '}' 'punct string interpolation end'
        inc rgs, 13, '/' 'string double'

    # 000   000   0000000    0000000   000   000  
    # 0000  000  000   000  000   000  0000  000  
    # 000 0 000  000   000  000   000  000 0 000  
    # 000  0000  000   000  000   000  000  0000  
    # 000   000   0000000    0000000   000   000  
    
    it 'noon' ->
            
        lang 'noon'
        
        rgs = ranges "    property  value"
        inc rgs, 4 'property' 'property'
        inc rgs, 14 'value' 'text'

        rgs = ranges "top"
        inc rgs, 0 'top'  'obj'

        rgs = ranges "top  prop"
        inc rgs, 0 'top'  'obj'
        inc rgs, 5 'prop' 'text'

        rgs = ranges "version  ^0.1.2"
        inc rgs, 0 'version'  'obj'
        inc rgs, 9 '^' 'punct semver'
        inc rgs, 10 '0' 'semver'
        
        rgs = ranges "some-package-name  1"
        inc rgs, 0  'some'    'property'
        inc rgs, 5  'package' 'property'
        inc rgs, 13 'name'    'property'

        rgs = ranges "some-package-name  ^1.2.3"
        inc rgs, 0  'some'    'property'
        inc rgs, 5  'package' 'property'
        inc rgs, 13 'name'    'property'
        
        rgs = ranges "top  prop  value"
        inc rgs, 0  'top'   'obj'
        inc rgs, 5  'prop'  'property'
        inc rgs, 11 'value' 'text'
        
        rgs = ranges "http://domain.com"
        inc rgs, 0 'http' 'url protocol'
        inc rgs, 4 ':' 'punct url'
        inc rgs, 5 '/' 'punct url'
        inc rgs, 6 '/' 'punct url'
        inc rgs, 7 'domain' 'url domain'
        inc rgs, 13 '.' 'punct url tld'
        inc rgs, 14 'com' 'url tld'

        rgs = ranges "http://domain.com/dir/page.html"
        inc rgs, 0 'http' 'url protocol'
        inc rgs, 4 ':' 'punct url'
        inc rgs, 5 '/' 'punct url'
        inc rgs, 6 '/' 'punct url'
        inc rgs, 7 'domain' 'url domain'
        inc rgs, 13 '.' 'punct url tld'
        inc rgs, 14 'com' 'url tld'
        inc rgs, 17 '/' 'punct dir'
        
        rgs = ranges "file.coffee"
        inc rgs, 0 'file' 'coffee file'
        inc rgs, 4 '.' 'punct coffee'
        inc rgs, 5 'coffee' 'coffee ext'

        rgs = ranges "/some/path"
        inc rgs, 1 'some'   'text dir'
        inc rgs, 5 '/'      'punct dir'
        inc rgs, 6 'path'   'text file'
        
        rgs = ranges '/some\\path/file.txt:10'
        inc rgs, 0  '/'    'punct dir'
        inc rgs, 1  'some' 'text dir'
        inc rgs, 5  '\\' 'punct dir'
        inc rgs, 15 '.'  'punct txt'
        inc rgs, 19 ':'  'punct'
        
        rgs = ranges "    test  ./node_modules/.bin/mocha"
        inc rgs, 4 'test' 'property'
        inc rgs, 10 '.' 'punct dir'
        inc rgs, 11 '/' 'punct dir'
        inc rgs, 12 'node_modules' 'text dir'
        inc rgs, 24 '/' 'punct dir'
        inc rgs, 25 '.' 'punct dir'
        inc rgs, 26 'bin' 'text dir'
        inc rgs, 29 '/' 'punct dir'
        inc rgs, 30 'mocha' 'text file'
        
    #  0000000   0000000   00000000  00000000  00000000  00000000  
    # 000       000   000  000       000       000       000       
    # 000       000   000  000000    000000    0000000   0000000   
    # 000       000   000  000       000       000       000       
    #  0000000   0000000   000       000       00000000  00000000  
    
    it 'coffee' ->

        lang 'coffee'
        
        rgs = ranges "util = require 'util'"
        inc rgs, 7 'require' 'require'
        
        rgs = ranges "class Macro extends Command"
        inc rgs, 0  'class'   'keyword'
        inc rgs, 6  'Macro'   'class'
        inc rgs, 12 'extends' 'keyword'
        inc rgs, 20 'Command' 'class'
        
        rgs = ranges "exist?.prop"
        inc rgs, 7 'prop' 'property'
                        
        rgs = ranges "a and b"
        inc rgs, 0 "a" 'text'
        inc rgs, 2 "and" 'keyword'

        rgs = ranges "if a then b"
        inc rgs, 0 "if" 'keyword'
        inc rgs, 3 "a" 'text'
        inc rgs, 5 "then" 'keyword'
        inc rgs, 10 "b" 'text'

        rgs = ranges "switch a"
        inc rgs, 0 "switch" 'keyword'
        
        rgs = ranges " a: b"
        inc rgs, 1 "a" 'dictionary key'
        inc rgs, 2 ":" 'punct dictionary'
        
        rgs = ranges "obj.value = obj.another.value"
        inc rgs, 0  "obj"    'obj'
        inc rgs, 4  "value"  'property'
        inc rgs, 12 "obj"    'obj'
        inc rgs, 16 "another"'property'
        inc rgs, 24 "value"  'property'
            
        rgs = ranges "if someObject.someProp"
        inc rgs, 0 "if" 'keyword'
        inc rgs, 3 "someObject" 'obj'
        inc rgs, 13 "." 'punct property'
        inc rgs, 14 "someProp" 'property'
        
        rgs = ranges "1 'a'"
        inc rgs, 0 "1" 'number'

        rgs = ranges "a[0].prop"
        inc rgs, 3 ']' 'punct'
        
        rgs = ranges "[ f ]"
        inc rgs, 2 'f' 'text'

        rgs = ranges "[ f , f ]"
        inc rgs, 2 'f' 'text'
        
        rgs = ranges "a[...2]"
        inc rgs, 2 '.' 'punct range'
        inc rgs, 3 '.' 'punct range'
        inc rgs, 4 '.' 'punct range'

        rgs = ranges "a[ -1 .. ]"
        inc rgs, 6 '.' 'punct range'
        inc rgs, 7 '.' 'punct range'

        rgs = ranges "a[1..n]"
        inc rgs, 3 '.' 'punct range'
        inc rgs, 4 '.' 'punct range'

        rgs = ranges "a[ .... ]"
        inc rgs, 3 '.' 'punct'
        inc rgs, 4 '.' 'punct'
        inc rgs, 5 '.' 'punct'
        inc rgs, 6 '.' 'punct'
        
        rgs = ranges "@f [1]"
        inc rgs, 0 "@" 'punct function call'
        inc rgs, 1 "f" 'function call'

        rgs = ranges "@f = 1"
        inc rgs, 0 "@" 'punct this'
        inc rgs, 1 "f" 'text this'
        
        rgs = ranges "@height/2 + @height/6"
        inc rgs, 0 '@'      'punct this'
        inc rgs, 1 'height' 'text this'
        inc rgs, 8 "2" 'number'
                
    # 00000000  000   000  000   000   0000000  000000000  000   0000000   000   000  
    # 000       000   000  0000  000  000          000     000  000   000  0000  000  
    # 000000    000   000  000 0 000  000          000     000  000   000  000 0 000  
    # 000       000   000  000  0000  000          000     000  000   000  000  0000  
    # 000        0000000   000   000   0000000     000     000   0000000   000   000  

    it 'coffee function' ->

        lang 'coffee'
        
        rgs = ranges "obj.prop.call 1"
        inc rgs, 0 'obj' 'obj'
        inc rgs, 4 'prop' 'property'
        inc rgs, 9 'call' 'function call'
        
        rgs = ranges "dolater =>"
        inc rgs, 8 '=' 'punct function bound tail'
        inc rgs, 9 '>' 'punct function bound head'

        rgs = ranges "dolater ->"
        inc rgs, 8 '-' 'punct function tail'
        inc rgs, 9 '>' 'punct function head'
        
        rgs = ranges "@a @b 'c'"
        inc rgs, 0 '@' 'punct function call'
        inc rgs, 1 'a' 'function call'
        inc rgs, 3 '@' 'punct function call'
        inc rgs, 4 'b' 'function call'
        
        rgs = ranges "@a 3 @b '5'"
        inc rgs, 0 '@' 'punct function call'
        inc rgs, 1 'a' 'function call'

        rgs = ranges "fff 1"
        inc rgs, 0 "fff" 'function call'
                
        rgs = ranges "f 'a'"
        inc rgs, 0 "f" 'function call'
        
        rgs = ranges "ff 'b'"
        inc rgs, 0 "ff" 'function call'

        rgs = ranges "ffff -1"
        inc rgs, 0 "ffff" 'function call'

        rgs = ranges "f [1]"
        inc rgs, 0 "f" 'function call'
        
        rgs = ranges "fffff {1}"
        inc rgs, 0 "fffff" 'function call'

        rgs = ranges "i ++a"
        inc rgs, 0 'i' 'function call'
        
        rgs = ranges "i +4"
        inc rgs, 0 'i' 'function call'

        rgs = ranges "i -4"
        inc rgs, 0 'i' 'function call'
        
        rgs = ranges "pos= (item, p) -> "
        inc rgs, 0 "pos" 'function'
        
        rgs = ranges "i != false"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i += 1"
        inc rgs, 0 'i' 'text'
        
        rgs = ranges "i -= 1"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i *= 1"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i /= 1"
        inc rgs, 0 'i' 'text'
        
        rgs = ranges "i ? false"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i < 3"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i > 3"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i + 3"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i - 3"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i * 3"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i / 3"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i % 3"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i = 3"
        inc rgs, 0 'i' 'text'

        rgs = ranges "i == 3"
        inc rgs, 0 'i' 'text'
        
    # 00     00  00000000  000000000  000   000   0000000   0000000    
    # 000   000  000          000     000   000  000   000  000   000  
    # 000000000  0000000      000     000000000  000   000  000   000  
    # 000 0 000  000          000     000   000  000   000  000   000  
    # 000   000  00000000     000     000   000   0000000   0000000    
    
    it 'coffee method' ->
        
        lang 'coffee'
        
        rgs = ranges " a: =>"
        inc rgs, 1 "a" 'method'
        inc rgs, 2 ":" 'punct method'
        inc rgs, 4 "=" 'punct function bound tail'
        inc rgs, 5 ">" 'punct function bound head'
        
        rgs = ranges " a: ->"
        inc rgs, 1 "a" 'method'
        inc rgs, 2 ":" 'punct method'
        inc rgs, 4 "-" 'punct function tail'
        inc rgs, 5 ">" 'punct function head'
        
        rgs = ranges "mthd:  (arg)    => @member memarg"
        inc rgs, 0  'mthd' 'method'
        inc rgs, 4  ':'    'punct method'
        inc rgs, 16 '='    'punct function bound tail'
        inc rgs, 17 '>'    'punct function bound head'
        
        rgs = ranges "@mthd: (arg) ->"
        inc rgs, 0 '@'    'punct method class'
        inc rgs, 1 'mthd' 'method class'
                                
    # 000   000   0000000   00000000  00000000  00000000  00000000  
    # 000  000   000   000  000       000       000       000       
    # 0000000    000   000  000000    000000    0000000   0000000   
    # 000  000   000   000  000       000       000       000       
    # 000   000   0000000   000       000       00000000  00000000  
    
    it 'koffee' ->
        
        lang 'koffee'
        
        rgs = ranges " @: ->"
        inc rgs, 1 "@" 'method'
        inc rgs, 2 ":" 'punct method'
        inc rgs, 4 "-" 'punct function tail'
        inc rgs, 5 ">" 'punct function head'

        rgs = ranges " @:->a"
        inc rgs, 1 "@" 'method'
        inc rgs, 2 ":" 'punct method'
        inc rgs, 3 "-" 'punct function tail'
        inc rgs, 4 ">" 'punct function head'
        
        rgs = ranges "▸if ▸then ▸elif ▸else"
        inc rgs, 0  "▸"    'punct meta'
        inc rgs, 1  "if"   'meta'
        inc rgs, 4  "▸"    'punct meta'
        inc rgs, 5  "then" 'meta'
        inc rgs, 10 "▸"    'punct meta'
        inc rgs, 11 "elif" 'meta'
        inc rgs, 16 "▸"    'punct meta'
        inc rgs, 17 "else" 'meta'

        rgs = ranges "[1 'x' a:1 c:d]"
        inc rgs, 1  "1"   'number'
        inc rgs, 4  "x"   'string single'
        inc rgs, 7  "a"   'dictionary key'
        inc rgs, 11 "c"   'dictionary key'

    #       000   0000000  
    #       000  000       
    #       000  0000000   
    # 000   000       000  
    #  0000000   0000000   
    
    it 'js' ->
        
        lang 'js'
        
        rgs = ranges "obj.prop.call(1);"
        inc rgs, 0 'obj' 'obj'
        inc rgs, 4 'prop' 'property'
        inc rgs, 9 'call' 'function call'
        
        rgs = ranges "func = function() {"
        inc rgs, 0 'func' 'function'
        inc rgs, 7 'function' 'keyword function'
        
        rgs = ranges "obj.value = obj.another.value"
        inc rgs, 0  "obj"    'obj'
        inc rgs, 4  "value"  'property'
        inc rgs, 12 "obj"    'obj'
        inc rgs, 16 "another"'property'
        inc rgs, 24 "value"  'property'
        
        rgs = ranges "a(2);"
        inc rgs, 0 'a' 'function call'
        
        rgs = ranges "//# sourceMappingURL=data:"
        inc rgs, 0 "/" 'punct comment'
        inc rgs, 1 "/" 'punct comment'
        inc rgs, 2 "#" 'comment'
      
    #       000   0000000   0000000   000   000  
    #       000  000       000   000  0000  000  
    #       000  0000000   000   000  000 0 000  
    # 000   000       000  000   000  000  0000  
    #  0000000   0000000    0000000   000   000  
    
    it 'json' ->
        
        lang 'json'
        
        rgs = ranges """{ "A Z": 1 }"""
        inc rgs, 2 '"' 'punct dictionary'
        inc rgs, 3 'A' 'dictionary key'
        inc rgs, 5 'Z' 'dictionary key'
        inc rgs, 6 '"' 'punct dictionary'
        inc rgs, 7 ':' 'punct dictionary'
        
        rgs = ranges '"a": "http://domain.com"'
        inc rgs, 6 'http' 'url protocol'
        inc rgs, 10 ':' 'punct url'
        inc rgs, 11 '/' 'punct url'
        inc rgs, 12 '/' 'punct url'
        inc rgs, 13 'domain' 'url domain'
        inc rgs, 19 '.' 'punct url tld'
        inc rgs, 20 'com' 'url tld'

        rgs = ranges '"http://domain.com/dir/page.html"'
        inc rgs, 1 'http' 'url protocol'
        inc rgs, 5 ':' 'punct url'
        inc rgs, 6 '/' 'punct url'
        inc rgs, 7 '/' 'punct url'
        inc rgs, 8 'domain' 'url domain'
        inc rgs, 14 '.' 'punct url tld'
        inc rgs, 15 'com' 'url tld'
        inc rgs, 18 '/' 'punct dir'
         
        rgs = ranges '"file.coffee"'
        inc rgs, 1 'file' 'coffee file'
        inc rgs, 5 '.' 'punct coffee'
        inc rgs, 6 'coffee' 'coffee ext'

        rgs = ranges '"/some/path"'
        inc rgs, 2 'some'   'text dir'
        inc rgs, 6 '/'      'punct dir'
        inc rgs, 7 'path'   'text file'

        rgs = ranges '"/some\\path/file.txt:10"'
        inc rgs, 0 '"'     'punct string double'
        inc rgs, 1  '/'    'punct dir'
        inc rgs, 2  'some' 'text dir'
        inc rgs, 16 '.'  'punct txt'
        inc rgs, 20 ':'  'string double'
        inc rgs, 23 '"'  'punct string double'

        rgs = ranges '"./node_modules/.bin/mocha"'
        inc rgs, 1 '.' 'text dir' # why is this text and not punct?
        inc rgs, 2 '/' 'punct dir'
        inc rgs, 3 'node_modules' 'text dir'
        inc rgs, 15 '/' 'punct dir'
        inc rgs, 16 '.' 'text dir'
        inc rgs, 17 'bin' 'text dir'
        inc rgs, 20 '/' 'punct dir'
        inc rgs, 21 'mocha' 'text file'

        rgs = ranges '"66.70.0"'
        inc rgs, 1 "66" 'semver'
        inc rgs, 3 "."  'punct semver'
        inc rgs, 4 "70" 'semver'
        inc rgs, 6 "."  'punct semver'
        inc rgs, 7 "0"  'semver'

        rgs = ranges '"^0.7.1"'
        inc rgs, 1 "^" 'punct semver'
        inc rgs, 2 "0" 'semver'
        inc rgs, 4 "7" 'semver'
        inc rgs, 6 "1" 'semver'
            
        rgs = ranges '"^1.0.0-alpha.12"'
        inc rgs, 2 "1" 'semver'
        inc rgs, 4 "0" 'semver'
        inc rgs, 6 "0" 'semver'
        
    # 00000000   00000000   0000000   00000000  000   000  00000000   
    # 000   000  000       000        000        000 000   000   000  
    # 0000000    0000000   000  0000  0000000     00000    00000000   
    # 000   000  000       000   000  000        000 000   000        
    # 000   000  00000000   0000000   00000000  000   000  000        
    
    it 'regexp' ->
        
        lang 'coffee'
        
        rgs = ranges "r=/a/"
        inc rgs, 2 '/'       'punct regexp start'
        inc rgs, 3 'a'       'text regexp'
        inc rgs, 4 '/'       'punct regexp end'
                
        rgs = ranges "/(a|.*|\s\d\w\S\W$|^\s+)/"
        inc rgs, 0 '/'       'punct regexp start'
        inc rgs, 2 'a'       'text regexp'
            
        rgs = ranges "/^#include/"
        inc rgs, 0 '/'       'punct regexp start'
        inc rgs, 2 "#"       'punct regexp'
        inc rgs, 3 "include" 'text regexp'

        rgs = ranges "/\\'hello\\'/ "
        inc rgs, 0 '/'       'punct regexp start'
        inc rgs, 1 "\\"      'punct escape regexp'
        inc rgs, 2 "'"       'punct regexp'
        inc rgs, 3 "hello"   'text regexp'

        rgs = ranges "f a /b - c/gi"
        inc rgs, 4 '/'       'punct regexp start'
        inc rgs, 5 'b'       'text regexp'
        inc rgs, 10 '/'      'punct regexp end'
        
        rgs = ranges "w=l.split /[\\s\\/]/ ; bla"
        inc rgs, 10 '/'      'punct regexp start'
        inc rgs, 14 '\\'     'punct escape regexp'
        inc rgs, 17 '/'      'punct regexp end'
        inc rgs, 19 ';'      'punct'
        
        rgs = ranges "a = 1 / 2"
        inc rgs, 6 '/',     'punct'
        inc rgs, 8 '2',     'number'

        rgs = ranges "(1+1) / 2"
        inc rgs, 6 '/',     'punct'
        inc rgs, 8 '2',     'number'

        rgs = ranges "a[10] / 2"
        inc rgs, 6 '/',     'punct'
        inc rgs, 8 '2',     'number'

        rgs = ranges "if / aa /.test s"
        inc rgs, 3 '/'      'punct regexp start'
        inc rgs, 8 '/'      'punct regexp end'
        inc rgs, 9 '.'      'punct property'
        inc rgs, 10 'test'  'function call'
        inc rgs, 15 's'     'text'
        
        rgs = ranges "if / 😡 /.test s"
        inc rgs, 3 '/'      'punct regexp start'
        inc rgs, 8 '/'      'punct regexp end'
        inc rgs, 9 '.'      'punct property'
        inc rgs, 10 'test'  'function call'
        inc rgs, 15 's'     'text'
        
    # 000000000  00000000   000  00000000   000      00000000  
    #    000     000   000  000  000   000  000      000       
    #    000     0000000    000  00000000   000      0000000   
    #    000     000   000  000  000        000      000       
    #    000     000   000  000  000        0000000  00000000  
    
    it 'triple regexp' ->
        
        lang 'coffee'
        
        rgs = ranges "///a///,b"
        inc rgs, 0 "/" 'punct regexp triple'
        inc rgs, 1 "/" 'punct regexp triple'
        inc rgs, 2 "/" 'punct regexp triple'
        inc rgs, 3 "a" 'text regexp triple'
        inc rgs, 4 "/" 'punct regexp triple'
        inc rgs, 5 "/" 'punct regexp triple'
        inc rgs, 6 "/" 'punct regexp triple'
        inc rgs, 8 "b" 'text'
        
        dss = dissect "///\na\n///"
        inc dss[0], 0 "/" 'punct regexp triple'
        inc dss[0], 1 "/" 'punct regexp triple'
        inc dss[0], 2 "/" 'punct regexp triple'
        inc dss[1], 0 "a" 'text regexp triple'
        inc dss[2], 0 "/" 'punct regexp triple'
        inc dss[2], 1 "/" 'punct regexp triple'
        inc dss[2], 2 "/" 'punct regexp triple'
        
        dss = dissect """
            ///
                ([\\\\?]) # comment
            ///, a
            """
        inc dss[0], 0  "/"  'punct regexp triple'
        inc dss[0], 1  "/"  'punct regexp triple'
        inc dss[0], 2  "/"  'punct regexp triple'
        inc dss[1], 4  "("  'punct regexp triple'
        inc dss[1], 6  "\\" 'punct escape regexp triple'
        inc dss[1], 12 "#"  'punct comment'
        inc dss[1], 14 "comment" 'comment'
        inc dss[2], 0  "/"  'punct regexp triple'
        inc dss[2], 1  "/"  'punct regexp triple'
        inc dss[2], 2  "/"  'punct regexp triple'
        inc dss[2], 5  "a"  'text'
        
        dss = dissect """
            arr = [ ///a\#{b}///
                    key: 'value'
                  ]
            """
        inc dss[1], 8 'key', 'dictionary key'
        
    # 000   000   0000000         00000000   00000000   0000000   00000000  000   000  00000000   
    # 0000  000  000   000        000   000  000       000        000        000 000   000   000  
    # 000 0 000  000   000        0000000    0000000   000  0000  0000000     00000    00000000   
    # 000  0000  000   000        000   000  000       000   000  000        000 000   000        
    # 000   000   0000000         000   000  00000000   0000000   00000000  000   000  000        
    
    it 'no regexp' ->
        
        lang 'coffee'

        rgs = ranges 'a / b - c / d' 
        nut rgs, 2 '/' 'punct regexp start'

        rgs = ranges 'f a/b, c/d'
        nut rgs, 3 '/' 'punct regexp start'
        
        rgs = ranges "m = '/'"
        nut rgs, 5 '/' 'punct regexp start'

        rgs = ranges "m a, '/''/'"
        nut rgs, 6 '/' 'punct regexp start'
        
        rgs = ranges """\"m = '/'\""""
        nut rgs, 6 '/' 'punct regexp start'
        
        rgs = ranges "s = '/some\\path/file.txt:10'"
        nut rgs, 5 '/' 'punct regexp start'
        nut rgs, 9 '/' 'punct regexp start'
        
        rgs = ranges "num /= 10"
        nut rgs, 4 '/'  'punct regexp start'
        nut rgs, 7 '10' 'text regexp'
        
        rgs = ranges "4 / 2 / 1"
        inc rgs, 2 '/' 'punct'
        inc rgs, 6 '/' 'punct'
        
        rgs = ranges "4/2/1"
        inc rgs, 1 '/' 'punct'
        inc rgs, 3 '/' 'punct'
        
        rgs = ranges "4/ 2 / 1"
        inc rgs, 1 '/' 'punct'
        inc rgs, 5 '/' 'punct'
        
        rgs = ranges "4 /2 / 1"
        inc rgs, 2 '/' 'punct'
        inc rgs, 5 '/' 'punct'
        
        rgs = ranges "4 / 2/ 1"
        inc rgs, 2 '/' 'punct'
        inc rgs, 5 '/' 'punct'
        
        rgs = ranges "4 / 2 /1"
        inc rgs, 2 '/' 'punct'
        inc rgs, 6 '/' 'punct'
        
        rgs = ranges "4 /2/ 1"
        inc rgs, 2 '/' 'punct'
        inc rgs, 4 '/' 'punct'
        
    # 00     00  0000000    
    # 000   000  000   000  
    # 000000000  000   000  
    # 000 0 000  000   000  
    # 000   000  0000000    
    
    it 'md' ->
        
        lang 'md'
        
        rgs = ranges "**bold**"
        inc rgs, 0 '*'      'punct bold'
        inc rgs, 1 '*'      'punct bold'
        inc rgs, 2 'bold'   'text bold'
        inc rgs, 6 '*'      'punct bold'
        inc rgs, 7 '*'      'punct bold'
        
        rgs = ranges ",**b**,"
        inc rgs, 1 '*'      'punct bold'
        inc rgs, 3 'b'      'text bold'
        inc rgs, 4 '*'      'punct bold'
                
        rgs = ranges "*it lic*"
        inc rgs, 0 '*'      'punct italic'
        inc rgs, 1 'it'     'text italic'
        inc rgs, 4 'lic'    'text italic'
        inc rgs, 7 '*'      'punct italic'
        
        rgs = ranges "*italic*"
        inc rgs, 0 '*'      'punct italic'
        inc rgs, 1 'italic' 'text italic'
        inc rgs, 7 '*'      'punct italic'
 
        rgs = ranges "*`italic code`*"
        inc rgs, 0 '*'      'punct italic'
        inc rgs, 1 '`'      'punct italic code'
        inc rgs, 2 'italic' 'text italic code'
        inc rgs, 9 'code'   'text italic code'
        inc rgs, 14 '*'     'punct italic'
        
        rgs = ranges "it's good"
        inc rgs, 0 'it'     'text'
        inc rgs, 2 "'"      'punct'
        inc rgs, 3 's'      'text'
        
        rgs = ranges "if is empty in then"
        inc rgs, 0  'if'    'text'
        inc rgs, 3  'is'    'text'
        inc rgs, 6  'empty' 'text'
        inc rgs, 12 'in'    'text'
        inc rgs, 15 'then'  'text'

        dss = dissect "▸doc\n    if is empty in then" 'coffee'
        inc dss[1], 4  'if'    'text'
        inc dss[1], 7  'is'    'text'
        inc dss[1], 10  'empty' 'text'
        inc dss[1], 16 'in'    'text'
        inc dss[1], 19 'then'  'text'
        
        rgs = ranges 'text files. bla'
        inc rgs, 0, 'text' 'text'
        inc rgs, 10, '.' 'punct'
        
        rgs = ranges '..bla'
        inc rgs, 0, '.' 'punct'
        inc rgs, 1, '.' 'punct'
        
        rgs = ranges '```coffeescript'
        inc rgs, 0 '`' 'punct code triple'
        inc rgs, 3 'coffeescript' 'comment'
            
        rgs = ranges "- li"
        inc rgs, 0 '-'  'punct li1 marker'
        inc rgs, 2 'li' 'text li1'

        rgs = ranges "    - **bold**"
        inc rgs, 4 '-'    'punct li2 marker'
        inc rgs, 8 'bold' 'text li2 bold'
        
        rgs = ranges "        - **bold**"
        inc rgs, 8 '-'    'punct li3 marker'
        inc rgs, 12 'bold' 'text li3 bold'

        rgs = ranges "        * **bold**"
        inc rgs, 8 '*'    'punct li3 marker'
        inc rgs, 12 'bold' 'text li3 bold'

        dss = dissect """
            - li1
            text
        """
        inc dss[0], 0  '-'    'punct li1 marker'
        inc dss[1], 0  'text' 'text'

        dss = dissect """
            # h1
            ## h2
            ### h3
            #### h4
            ##### h5
        """
        inc dss[0], 0  "#"    'punct h1'
        inc dss[0], 2  "h1"   'text h1'
        inc dss[1], 0  "#"    'punct h2'
        inc dss[1], 3  "h2"   'text h2'
        inc dss[2], 0  "#"    'punct h3'
        inc dss[2], 4  "h3"   'text h3'
        inc dss[3], 0  "#"    'punct h4'
        inc dss[3], 5  "h4"   'text h4'
        inc dss[4], 0  "#"    'punct h5'
        inc dss[4], 6  "h5"   'text h5'

        dss = dissect """
            ```js
            ```
        """
        inc dss[1], 0 '`' 'punct code triple'
                
    # 000   000  000000000  00     00  000    
    # 000   000     000     000   000  000    
    # 000000000     000     000000000  000    
    # 000   000     000     000 0 000  000    
    # 000   000     000     000   000  0000000
    
    it 'html' ->
        
        lang 'html'
        
        rgs = ranges "</div>" 
        inc rgs, 0 "<"    'punct keyword'
        inc rgs, 1 "/"    'punct keyword'
        inc rgs, 2 "div"  'keyword'
        inc rgs, 5 ">"    'punct keyword'

        rgs = ranges "<div>" 
        inc rgs, 0 "<"    'punct keyword'
        inc rgs, 1 "div"  'keyword'
        inc rgs, 4 ">"    'punct keyword'

    #  0000000  000000000  000   000  000      
    # 000          000      000 000   000      
    # 0000000      000       00000    000      
    #      000     000        000     000      
    # 0000000      000        000     0000000  
    
    it 'styl' ->
        
        lang 'styl'
        
        rgs = ranges "1em" 
        inc rgs, 0 "1em"  'number'

        rgs = ranges "1ex" 
        inc rgs, 0 "1ex"  'number'

        rgs = ranges "1px" 
        inc rgs, 0 "1px"  'number'

        rgs = ranges "1s" 
        inc rgs, 0 "1s"  'number'

        rgs = ranges "1.0" 
        inc rgs, 0 "1"  'number float'
        inc rgs, 1 "."  'punct number float'
        inc rgs, 2 "0"  'number float'
        
        rgs = ranges ".clss" 
        inc rgs, 0 "."     'punct class'
        inc rgs, 1 "clss"  'class'

        rgs = ranges "#id" 
        inc rgs, 0 "#"    'punct function'
        inc rgs, 1 "id"   'function'

        rgs = ranges "#id-foo-bar" 
        inc rgs, 0 "#"    'punct function'
        inc rgs, 1 "id"   'function'
        inc rgs, 3 "-"    'punct function'
        inc rgs, 4 "foo"  'function'
        inc rgs, 7 "-"    'punct function'
        inc rgs, 8 "bar"  'function'

        rgs = ranges ".clss-foo-bar" 
        inc rgs, 0 "."    'punct class'
        inc rgs, 1 "clss" 'class'
        inc rgs, 5 "-"    'punct class'
        inc rgs, 6 "foo"  'class'
        inc rgs, 9 "-"    'punct class'
        inc rgs, 10 "bar"  'class'
        
        rgs = ranges "#666"
        inc rgs, 0 "#"   'punct number hex'
        inc rgs, 1 "666" 'number hex'
        
        rgs = ranges "#abc"
        inc rgs, 0 "#"   'punct number hex'
        inc rgs, 1 "abc" 'number hex'
        
        rgs = ranges "#f0f0f0"
        inc rgs, 0 "#"      'punct number hex'
        inc rgs, 1 "f0f0f0" 'number hex'
        
    #  0000000   0000000   0000000  
    # 000       000       000       
    # 000       0000000   0000000   
    # 000            000       000  
    #  0000000  0000000   0000000   
    
    it 'css' ->
        
        lang 'css'
        
        rgs = ranges "0.5" 
        inc rgs, 0 "0"  'number float'
        inc rgs, 1 "."  'punct number float'
        inc rgs, 2 "5"  'number float'
        
        
    #  0000000  00000000   00000000 
    # 000       000   000  000   000
    # 000       00000000   00000000 
    # 000       000        000      
    #  0000000  000        000      
    
    it 'cpp' ->
        
        lang 'cpp'
        
        rgs = ranges "#include"      
        inc rgs, 0 "#"          'punct define'
        inc rgs, 1 "include"    'define'

        rgs = ranges "#if"            
        inc rgs, 0 "#"          'punct define'
        inc rgs, 1 "if"         'define'

        rgs = ranges "#  if"            
        inc rgs, 0 "#"          'punct define'
        inc rgs, 3 "if"         'define'
            
        rgs = ranges "if (true) {} else {}"    
        inc rgs, 0 "if"         'keyword'
        inc rgs, 4 "true"       'keyword'
        inc rgs, 13 "else"      'keyword'
            
        rgs = ranges "1.0f"
        inc rgs, 0 "1"          'number float'
        inc rgs, 1 "."          'punct number float'
        inc rgs, 2 "0f"         'number float'

        rgs = ranges "0.0000f"
        inc rgs, 2 "0000f"      'number float'
        
        rgs = ranges "obj.value = obj.another.value;"
        inc rgs, 0  "obj"       'obj'
        inc rgs, 4  "value"     'property'
        inc rgs, 12 "obj"       'obj'
        inc rgs, 16 "another"   'property'
        inc rgs, 24 "value"     'property'
        
        rgs = ranges "Cast<targ>"
        inc rgs, 4 '<'          'punct template'
        inc rgs, 5 'targ'       'template'
        inc rgs, 9 '>'          'punct template'
        
        rgs = ranges "TMap<FGrid, FRoute>"
        inc rgs, 0 'TMap'       'keyword type'
        inc rgs, 4 '<'          'punct template'
        inc rgs, 5 'FGrid'      'template'
        inc rgs, 10 ','         'punct template'
        inc rgs, 12 'FRoute'    'template'
        inc rgs, 18 '>'         'punct template'
        
        
    #  0000000  000   000  
    # 000       000   000  
    # 0000000   000000000  
    #      000  000   000  
    # 0000000   000   000  
    
    it 'sh' ->

        lang 'sh'
        
        rgs = ranges "dir/path/with/dashes/file.txt"
        inc rgs, 0 'dir' 'text dir'
        inc rgs, 4 'path' 'text dir'
        inc rgs, 9 'with' 'text dir'
        inc rgs, 14 'dashes' 'text dir'
        
        rgs = ranges "prg --arg1 -arg2"
        inc rgs, 4 '-' 'punct argument'
        inc rgs, 5 '-' 'punct argument'
        inc rgs, 6 'arg1' 'argument'
        inc rgs, 11 '-' 'punct argument'
        inc rgs, 12 'arg2' 'argument'
    
    # 000       0000000    0000000   
    # 000      000   000  000        
    # 000      000   000  000  0000  
    # 000      000   000  000   000  
    # 0000000   0000000    0000000   
    
    it 'log' ->

        lang 'log'
        
        rgs = ranges "http://domain.com"
        inc rgs, 0 'http' 'url protocol'
        inc rgs, 4 ':' 'punct url'
        inc rgs, 5 '/' 'punct url'
        inc rgs, 6 '/' 'punct url'
        inc rgs, 7 'domain' 'url domain'
        inc rgs, 13 '.' 'punct url tld'
        inc rgs, 14 'com' 'url tld'
        
        rgs = ranges "file.coffee"
        inc rgs, 0 'file' 'coffee file'
        inc rgs, 4 '.' 'punct coffee'
        inc rgs, 5 'coffee' 'coffee ext'

        rgs = ranges "/some/path"
        inc rgs, 1 'some'   'text dir'
        inc rgs, 5 '/'      'punct dir'

        rgs = ranges "key: value"
        inc rgs, 0 'key'    'dictionary key'
        inc rgs, 3 ':'      'punct dictionary'
        
###
00000000    0000000   00000000    0000000  00000000  
000   000  000   000  000   000  000       000       
00000000   000000000  0000000    0000000   0000000   
000        000   000  000   000       000  000       
000        000   000  000   000  0000000   00000000  
###

describe 'parse' ->
    
    #  0000000   0000000   00     00  00     00  00000000  000   000  000000000  
    # 000       000   000  000   000  000   000  000       0000  000     000     
    # 000       000   000  000000000  000000000  0000000   000 0 000     000     
    # 000       000   000  000 0 000  000 0 000  000       000  0000     000     
    #  0000000   0000000   000   000  000   000  00000000  000   000     000     
    
    it 'comment' ->
     
        lang 'coffee'
        
        parse("##").should.eql [ext:'coffee' chars:2 index:0 number:1 chunks:[ 
                    {start:0 length:1 match:"#" value:'punct comment' turd:"##"} 
                    {start:1 length:1 match:"#" value:'comment'} 
                    ]]
    
        parse(",#a").should.eql [ext:'coffee' chars:3 index:0 number:1 chunks:[ 
                    {start:0 length:1 match:"," value:'punct' turd: ",#"} 
                    {start:1 length:1 match:"#" value:'punct comment'} 
                    {start:2 length:1 match:"a" value:'comment'} 
                    ]]
                
    # 00000000  000   000  000   000   0000000  000000000  000   0000000   000   000  
    # 000       000   000  0000  000  000          000     000  000   000  0000  000  
    # 000000    000   000  000 0 000  000          000     000  000   000  000 0 000  
    # 000       000   000  000  0000  000          000     000  000   000  000  0000  
    # 000        0000000   000   000   0000000     000     000   0000000   000   000  
    
    it 'function' ->
    
        parse('->').should.eql [ext:'coffee' chars:2 index:0 number:1 chunks:[ 
                    {start:0 length:1 match:'-' value:'punct function tail' turd: '->'} 
                    {start:1 length:1 match:'>' value:'punct function head'} 
                    ]]
        parse('=>').should.eql [ext:'coffee' chars:2 index:0 number:1 chunks:[ 
                    {start:0 length:1 match:'=' value:'punct function bound tail' turd: '=>'} 
                    {start:1 length:1 match:'>' value:'punct function bound head'} 
                    ]]
        parse('f=->1').should.eql [ext:'coffee' chars:5 index:0 number:1 chunks:[ 
                    {start:0 length:1 match:'f' value:'function'} 
                    {start:1 length:1 match:'=' value:'punct function'      turd:'=->' } 
                    {start:2 length:1 match:'-' value:'punct function tail' turd:'->'} 
                    {start:3 length:1 match:'>' value:'punct function head'} 
                    {start:4 length:1 match:'1' value:'number'} 
                    ]]
                    
    # 00     00  000  000   000  000  00     00   0000000   000      
    # 000   000  000  0000  000  000  000   000  000   000  000      
    # 000000000  000  000 0 000  000  000000000  000000000  000      
    # 000 0 000  000  000  0000  000  000 0 000  000   000  000      
    # 000   000  000  000   000  000  000   000  000   000  0000000  
    
    it 'minimal' ->
                    
        parse('1').should.eql [ext:'coffee' chars:1 index:0 number:1 chunks:[ {start:0 length:1 match:'1' value:'number'} ]]
        parse('a').should.eql [ext:'coffee' chars:1 index:0 number:1 chunks:[ {start:0 length:1 match:'a' value:'text'} ]]
        parse('.').should.eql [ext:'coffee' chars:1 index:0 number:1 chunks:[ {start:0 length:1 match:'.' value:'punct'} ]]
    
        parse('1.a').should.eql [ext:'coffee' chars:3 index:0 number:1 chunks:[ 
                     {start:0  length:1 match:'1' value:'number'} 
                     {start:1  length:1 match:'.' value:'punct property'} 
                     {start:2  length:1 match:'a' value:'property'} 
                     ]]
                     
        parse('++a').should.eql [ext:'coffee' chars:3 index:0 number:1 chunks:[ 
                     {start:0  length:1 match:'+' value:'punct' turd:'++'} 
                     {start:1  length:1 match:'+' value:'punct'} 
                     {start:2  length:1 match:'a' value:'text'} 
                     ]]
                     
        parse("▸doc 'hello'").should.eql [ext:'coffee' chars:12 index:0 number:1 chunks:[ 
                      {start:0  length:1 match:'▸'     value:'punct meta'} 
                      {start:1  length:3 match:'doc'   value:'meta'} 
                      {start:5  length:1 match:"'"     value:'punct string single'} 
                      {start:6  length:5 match:"hello" value:'string single'} 
                      {start:11 length:1 match:"'"     value:'punct string single'} 
                      ]]
                      
    #  0000000  00000000    0000000    0000000  00000000  
    # 000       000   000  000   000  000       000       
    # 0000000   00000000   000000000  000       0000000   
    #      000  000        000   000  000       000       
    # 0000000   000        000   000   0000000  00000000  
    
    it 'space' ->
    
        b = parse "x"
        b[0].chunks[0].should.include.property 'start' 0
    
        b = parse " xx"
        b[0].chunks[0].should.include.property 'start' 1
        
        b = parse "    xxx"
        b[0].chunks[0].should.include.property 'start' 4
    
        b = parse "    x 1  , "
        b[0].chunks[0].should.include.property 'start' 4
        b[0].chunks[1].should.include.property 'start' 6
        b[0].chunks[2].should.include.property 'start' 9
    
    #  0000000  000   000  000  000000000   0000000  000   000  00000000   0000000  
    # 000       000 0 000  000     000     000       000   000  000       000       
    # 0000000   000000000  000     000     000       000000000  0000000   0000000   
    #      000  000   000  000     000     000       000   000  000            000  
    # 0000000   00     00  000     000      0000000  000   000  00000000  0000000   
    
    it 'switches' ->
        
        b = parse """
            ▸doc 'hello'
                x    
                y
            if 1 then false"""
        b[0].should.include.property 'ext' 'coffee'
        b[1].should.include.property 'ext' 'md'
        b[2].should.include.property 'ext' 'md'
        b[3].should.include.property 'ext' 'coffee'
        
        b = parse """
            ▸doc 'hello'
                x  
                ```coffeescript
                    1+1
                ```
                y
            1"""
        b[0].should.include.property 'ext' 'coffee'
        b[1].should.include.property 'ext' 'md'
        b[2].should.include.property 'ext' 'md'
        b[3].should.include.property 'ext' 'coffee'
        b[4].should.include.property 'ext' 'md'
        b[5].should.include.property 'ext' 'md'
        b[6].should.include.property 'ext' 'coffee'
    
        b = parse """                    
            ▸doc 'hello'                  
                x                         
                ```coffeescript           
                    1+1                   
                    ▸doc 'again'          
                        some **docs**     
                ```                       
                y                         
            1"""
        b[0].should.include.property 'ext' 'coffee'
        b[1].should.include.property 'ext' 'md'
        b[2].should.include.property 'ext' 'md'
        b[3].should.include.property 'ext' 'coffee'
        b[4].should.include.property 'ext' 'coffee'
        b[5].should.include.property 'ext' 'md'
        b[6].should.include.property 'ext' 'md'
        b[7].should.include.property 'ext' 'md'
        b[8].should.include.property 'ext' 'coffee'
        
        b = parse """
            ▸dooc 'hello'
                x  
            """
        b[0].should.include.property 'ext' 'coffee'
        b[1].should.include.property 'ext' 'coffee'
    
        b = parse """
            ```coffeescript
                1+1
            ```
            ```javascript
                1+1;
            ```
            """, 'md'
        b[0].should.include.property 'ext' 'md'
        b[1].should.include.property 'ext' 'coffee'
        b[2].should.include.property 'ext' 'md'
        b[3].should.include.property 'ext' 'md'
        b[4].should.include.property 'ext' 'js'
            