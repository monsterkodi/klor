
{ slash, kstr, noon } = require 'kxk'

▸profile '-----' 
    syntax = require './syntax'

▸profile 'load'
    
    ▸profile 'read' 
        # text = slash.readText "#{__dirname}/../../koffee/coffee/nodes.coffee"
        text = slash.readText "#{__dirname}/../../koffee/test.koffee"
    
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
        # ▸dbg chunks
        if chunks.length == 1 and chunks[0] == ''
            return lineinfo # empty line
        c = 0
        p = true
        for s in chunks
            if s == ''
                c++
                p = true
            else
                if p == false then c++
                p = false
                l = s.length
                sc = c
                # seperate by punctuation
                
                re = /\W+/gi
                while m = re.exec s
                    # log m#[0]
                    if m.index > 0
                        wl = m.index - c
                        w = s[c...m.index]
                        lineinfo.push s:w, c:c, l:wl, v:word w 
                        c += wl
                    pl = m[0].length
                    lineinfo.push s:m[0], c:c, l:pl, v:'punct'
                    c += pl
                
                if c < sc + l
                    rl = sc+l-c
                    w = s[l-rl..]
                    lineinfo.push s:w, c:c, l:rl, v:word w
                    c += rl
                    
        if lineinfo.length
            last = lineinfo[-1]
            lineinfo.c = last.c + last.l 
        lineinfo

▸profile 'syntax1'

    ranges = lines.map (l) -> syntax.ranges l, 'coffee'

# ▸profile 'syntax2'

    # ranges2 = syntax.ranges text, 'coffee'
    
# log lines2[0..10], lines[0..10]
# log lines2[-10..], lines[-10..]
  
log kstr spaced
# ▸dbg {lines, spaced}
# ▸dbg spaced[..2]
# ▸dbg spaced[..2]
# ▸dbg ranges[..20]

# ▸dbg ranges1
# ▸dbg ranges2
# ▸dbg syntax.lang.koffee
