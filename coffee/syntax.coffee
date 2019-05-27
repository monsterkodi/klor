###
 0000000  000   000  000   000  000000000   0000000   000   000
000        000 000   0000  000     000     000   000   000 000 
0000000     00000    000 0 000     000     000000000    00000  
     000     000     000  0000     000     000   000   000 000 
0000000      000     000   000     000     000   000  000   000
###

{ slash, noon } = require 'kxk'

class Syntax

    @exts = [] 
    @lang = null
    
    @init: ->
        
        return if Syntax.lang != null
        
        Syntax.lang = {}
        
        Syntax.exts.push 'txt'
        Syntax.exts.push 'log'
        Syntax.exts.push 'koffee'
        
        langFile = slash.join __dirname,'..''coffee''lang.noon'
        for extNames, valueWords of noon.load langFile
            for ext in extNames.split /\s/
            
                Syntax.exts.push(ext) if ext not in Syntax.exts
            
                Syntax.lang[ext] ?= {}
                for value,words of valueWords
                    for word in words
                        Syntax.lang[ext][word] = value
                                
module.exports = Syntax
