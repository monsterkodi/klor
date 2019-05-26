###
000   000   0000000   000       0000000   00000000 
000  000   000   000  000      000   000  000   000
0000000    000   000  000      000   000  0000000  
000  000   000   000  000      000   000  000   000
000   000   0000000   0000000   0000000   000   000
###

exports.map =
    'punct':                            'w3'
    'punct this':                       'b3'
    'punct comment':                    'w1' 
    'punct comment triple':             'w1' 
    'punct regexp start':               'm8' 
    'punct regexp end':                 'm8' 
    'punct regexp':                     'm2'
    'punct regexp triple':              'm2'
    'punct semver':                     'r2' 
    'punct escape regexp':              'm1'
    'punct escape regexp triple':       'm1'
    'punct string single':              'g1' 
    'punct string single triple':       'g1' 
    'punct string double':              'g1' 
    'punct string double triple':       'g1' 
    'punct string interpolation start': 'g1'
    'punct string interpolation end':   'g1'
    'punct dictionary':                 'y1' 
    'punct property':                   'y1' 
    'punct range':                      'b4' 
    'punct method':                     'r2'
    'punct function':                   'r1'
    'punct function tail':              ['b6' 'bold' 'B1']
    'punct function head':              ['b6' 'bold' 'B1']
    'punct function bound tail':        ['r5' 'bold' 'R1']
    'punct function bound head':        ['r5' 'bold' 'R1']
    'punct h1':                         'y1'
    'text h1':                          'y4'
    'punct h2':                         'r1'
    'text h2':                          'r4'
    'punct h3':                         'b3'
    'text h3':                          'b8'
    'punct h4':                         'b2'
    'text h4':                          'b6'
    'punct h5':                         'b1'
    'text h5':                          'b5'
    'string single':                    'g3' 
    'string single triple':             'g3' 
    'string double':                    'g4' 
    'string double triple':             'g4' 
    'nil':                              'm2'
    'obj':                              'y5' 
    'text':                             'w8' 
    'text this':                        'b8' 
    'text regexp':                      'm6'
    'text regexp triple':               'm6'
    'require':                          'w3' 
    'keyword':                          'b8' 
    'number':                           'b7' 
    'number hex':                       'c3' 
    'number float':                     'r7' 
    'punct number float':               'r3' 
    'semver':                           'r5' 
    'module this':                      'y2' 
    'module':                           'y6' 
    'class':                            'y5' 
    'method class':                     'y7' 
    'property':                         'y6' 
    'dictionary key':                   'y8' 
    'punct function call':              'r2' 
    'function call this':               'r2' 
    'function call':                    'r5' 
    'function':                         'r4' 
    'keyword function':                 'w2' 
    'method':                           'r6'
    'punct bold':                       'y1'
    'text bold':                        'y7'
    'punct italic':                     'm1'
    'text li1':                         'g4'
    'text li2':                         'g2'
    'text li3':                         'g1'
    'text italic':                      ['m7''italic']
    'text code':                        'b8'
    'argument':                         'b8'
    'punct code':                       'b1' 
    'punct code triple':                'b1' 
    'punct meta':                       'g1' 
    'meta':                             'g4' 
    'url protocol':                     'b2'
    'url domain':                       'b8'
    'url tld':                          'b4'
    'punct url':                        'b1'
    'punct url tld':                    'b1'
    'text dir':                         'g4'
    'text file':                        'g6'
    'punct dir':                        'g1'
    'comment':                          'w3'
    'comment triple':                   'w4'
    'coffee file':                      'y4'
    'punct coffee':                     'y1'
    'coffee ext':                       'y1'
    'js file':                          'm4'
    'punct js':                         'm1'
    'js ext':                           'm2'
    'git file':                         'w8'
    'punct git':                        'w1'
    'git ext':                          'w2'
    'comment header':                   ['g1' 'G1']
    'comment triple header':            ['g2' 'G2']

f = (r, g, b) -> '\x1b[38;5;' + (16 + 36*r + 6*g + b) + 'm'
F = (r, g, b) -> '\x1b[48;5;' + (16 + 36*r + 6*g + b) + 'm'

r = (i=4) -> (i < 6) and f(i, 0, 0) or f(  5, i-5, i-5)
R = (i=4) -> (i < 6) and F(i, 0, 0) or F(  5, i-5, i-5)
g = (i=4) -> (i < 6) and f(0, i, 0) or f(i-5,   5, i-5)
G = (i=4) -> (i < 6) and F(0, i, 0) or F(i-5,   5, i-5)
b = (i=4) -> (i < 6) and f(0, 0, i) or f(i-5, i-5,   5)
B = (i=4) -> (i < 6) and F(0, 0, i) or F(i-5, i-5,   5)
y = (i=4) -> (i < 6) and f(i, i, 0) or f(  5,   5, i-5)
Y = (i=4) -> (i < 6) and F(i, i, 0) or F(  5,   5, i-5)
m = (i=4) -> (i < 6) and f(i, 0, i) or f(  5, i-5,   5)
M = (i=4) -> (i < 6) and F(i, 0, i) or F(  5, i-5,   5)
c = (i=4) -> (i < 6) and f(0, i, i) or f(i-5,  5,    5)
C = (i=4) -> (i < 6) and F(0, i, i) or F(i-5,  5,    5)
w = (i=4) -> '\x1b[38;5;' + (232+(i-1)*3) + 'm'
W = (i=4) -> '\x1b[48;5;' + (232+(i-1)*3+2) + 'm'

FG_COLORS = ['r' 'g' 'b' 'c' 'm' 'y' 'w']
BG_COLORS = ['R' 'M' 'B' 'Y' 'G' 'C' 'W']

wrap = (open, close, searchRegex, replaceValue) ->
    (s) -> open + (~(s += "").indexOf(close, 4) and s.replace(searchRegex, replaceValue) or s) + close

init = (open, close) -> wrap "\x1b[#{open}m", "\x1b[#{close}m", new RegExp("\\x1b\\[#{close}m", "g"), "\x1b[#{open}m"

F256 = (open) -> wrap open, "\x1b[39m", new RegExp("\\x1b\\[39m", "g"), open
B256 = (open) -> wrap open, "\x1b[49m", new RegExp("\\x1b\\[49m", "g"), open

exports.bold      = wrap "\x1b[1m" "\x1b[22m", /\x1b\[22m/g, "\x1b[22m\x1b[1m"
exports.dim       = wrap "\x1b[2m" "\x1b[22m", /\x1b\[22m/g, "\x1b[22m\x1b[2m"
exports.reset     = init 0  0
exports.italic    = init 3  23
exports.underline = init 4  24
exports.inverse   = init 7  27
exports.hidden    = init 8  28
exports.black     = init 30 39
exports.red       = init 31 39
exports.green     = init 32 39
exports.yellow    = init 33 39
exports.blue      = init 34 39
exports.magenta   = init 35 39
exports.cyan      = init 36 39
exports.white     = init 37 39
exports.gray      = init 90 39

for bg in BG_COLORS
    exports[bg] = eval bg
    for i in [1..8]
        exports[bg+i] = B256 exports[bg] i

for fg in FG_COLORS
    exports[fg] = eval fg
    for i in [1..8]
        exports[fg+i] = F256 exports[fg] i

#  0000000   000       0000000   0000000     0000000   000      000  0000000  00000000  
# 000        000      000   000  000   000  000   000  000      000     000   000       
# 000  0000  000      000   000  0000000    000000000  000      000    000    0000000   
# 000   000  000      000   000  000   000  000   000  000      000   000     000       
#  0000000   0000000   0000000   0000000    000   000  0000000  000  0000000  00000000  

exports.globalize = ->
    
    for fg in FG_COLORS
        for i in [1..8]
            bg = fg.toUpperCase()
            global[fg+i] = exports[fg+i] 
            global[bg+i] = exports[bg+i] 
            for n in ['underline''bold''italic''inverse']
                global[n] = exports[n]
        
if require.main == module

    reset = '\x1b[0m'
    bold  = '\x1b[1m'
                
    for bg in BG_COLORS
        for i in [1..8]
            s  = reset
            fg = bg.toLowerCase()
            s += module.exports[fg+i]("#{fg+i} #{bg+i} ")
            for fg in FG_COLORS
                s += module.exports[bg+i] module.exports[fg+(9-i)] ' ' + fg + ' '
            log s + reset
            
    log " "
    