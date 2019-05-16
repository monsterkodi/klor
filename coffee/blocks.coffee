
{ slash, kstr, klog, noon } = require 'kxk'

▸profile '-----' 
    syntax = require './syntax'
    syntax.init()

    # text = slash.readText "#{__dirname}/../../koffee/coffee/nodes.coffee"
    # text = slash.readText "#{__dirname}/../../koffee/test.koffee"
    text = slash.readText "#{__dirname}/test.coffee"

    lines = text.split '\n'
    
# 0000000    000       0000000    0000000  000   000   0000000  
# 000   000  000      000   000  000       000  000   000       
# 0000000    000      000   000  000       0000000    0000000   
# 000   000  000      000   000  000       000  000        000  
# 0000000    0000000   0000000    0000000  000   000  0000000   

blocks = (lines, ext='koffee') ->
    
    word = (w) -> syntax.lang[ext][w] ? 'text'

    lineno = 0
    spaced = lines.map (l) -> 
        
        lineinfo = []
        lineinfo.characters = 0
        lineinfo.index  = lineno++
        lineinfo.number = lineno
        lineinfo.ext    = ext
        
        chunks = l.split /\s/
        
        if chunks.length == 1 and chunks[0] == ''
            return lineinfo # empty line
            
        c = 0
        for s in chunks
            if s == ''
                c++
            else
                if c then c++
                l = s.length
                sc = c
                
                # seperate by punctuation
                
                re = /\W+/gi
                while m = re.exec s
                    if m.index > 0
                        wl = m.index-(c-sc)
                        w = s[c-sc...m.index]
                        lineinfo.push string:w, column:c, length:wl, value:word w 
                        c += wl
                    pl = m[0].length
                    lineinfo.push string:m[0], column:c, length:pl, value:'punct'
                    c += pl
                
                if c < sc+l        # check for remaining non-punct
                    rl = sc+l-c    # length of remainder
                    w = s[l-rl..]  # text   of remainder 
                    lineinfo.push string:w, column:c, length:rl, value:word w
                    c += rl
                    
        if lineinfo.length
            last = lineinfo[-1]
            lineinfo.characters = last.column + last.length
        lineinfo

▸profile 'blocks'

    spaced = blocks lines
        
▸profile 'syntax1'

    ranges = lines.map (l) -> syntax.ranges l, 'coffee'

▸dbg spaced[...]
# ▸dbg ranges[...]
