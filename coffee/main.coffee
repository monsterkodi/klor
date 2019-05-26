###
000   000  000       0000000   00000000     
000  000   000      000   000  000   000    
0000000    000      000   000  0000000      
000  000   000      000   000  000   000    
000   000  0000000   0000000   000   000    
###

Syntax = require './syntax'
klor   = require './klor'
kolor  = require './kolor'
    
module.exports = 
    kolor:   kolor
    chunked: klor.chunked
    dissect: klor.dissect
    blocks:  klor.blocks
    ranges:  klor.ranges
    init:    Syntax.init
    exts:    Syntax.exts
