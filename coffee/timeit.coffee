
{ slash, kstr, klog, noon } = require 'kxk'

▸profile '-----' 
    syntax = require './syntax'
    ▸profile 'init' 
        syntax.init()

▸profile 'load'
    
    ▸profile 'read' 
        # text = slash.readText "#{__dirname}/../../koffee/coffee/nodes.coffee"
        # text = slash.readText "#{__dirname}/../../koffee/test.koffee"
        text = slash.readText "#{__dirname}/test.coffee"
    
    ▸profile 'split'
        lines = text.split '\n'
    

▸profile 'spaced'
    
    word = (w) -> syntax.lang.koffee[w] ? 'text'

    lineno = 0
    spaced = lines.map (l) -> 
        
        lineinfo = []
        lineinfo.c = 0
        lineinfo.i = lineno++
        lineinfo.n = lineno
        
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
                        lineinfo.push s:w, c:c, l:wl, v:word w 
                        c += wl
                    pl = m[0].length
                    lineinfo.push s:m[0], c:c, l:pl, v:'punct'
                    c += pl
                
                if c < sc+l        # check for remaining non-punct
                    rl = sc+l-c    # length of remainder
                    w = s[l-rl..]  # text   of remainder 
                    lineinfo.push s:w, c:c, l:rl, v:word w
                    c += rl
                    
        if lineinfo.length
            last = lineinfo[-1]
            lineinfo.c = last.c + last.l 
        lineinfo

▸profile 'syntax1'

    ranges = lines.map (l) -> syntax.ranges l, 'coffee'

▸dbg spaced[...]
# ▸dbg ranges[...]
