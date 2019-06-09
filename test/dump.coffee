###
0000000    000   000  00     00  00000000 
000   000  000   000  000   000  000   000
000   000  000   000  000000000  00000000 
000   000  000   000  000 0 000  000      
0000000     0000000   000   000  000      
###

{ slash } = require 'kxk'
klor = require '../'

for file in ['../coffee/kolor.coffee' '../package.noon' '../package.json' 'cpp.cpp' 'sample.md']
    file = slash.resolve slash.join __dirname, file
    text = slash.readText file
    log file
    log klor.syntax text:text, ext:slash.ext file

        
        