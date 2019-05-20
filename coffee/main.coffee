###
000   000  000       0000000   00000000     
000  000   000      000   000  000   000    
0000000    000      000   000  0000000      
000  000   000      000   000  000   000    
000   000  0000000   0000000   000   000    
###

Syntax = require './syntax'
Blocks = require './blocks'

module.exports = 
    dissected:  Blocks.dissected
    # ranges:     Syntax.ranges
    ranges:     Blocks.ranges
    init:       Syntax.init
    exts:       Syntax.exts
