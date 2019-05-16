
{ slash, kstr, klog, noon, chai } = require 'kxk'

▸profile '-----' 
    Syntax = require './syntax'
    Syntax.init()

    # text = slash.readText "#{__dirname}/../../koffee/coffee/nodes.coffee" # 15-17ms
    # text = slash.readText "#{__dirname}/../../koffee/test.koffee"
    text = slash.readText "#{__dirname}/test.coffee" # 310us

    lines = text.split '\n'
    
# 0000000    000       0000000    0000000  000   000   0000000  
# 000   000  000      000   000  000       000  000   000       
# 0000000    000      000   000  000       0000000    0000000   
# 000   000  000      000   000  000       000  000        000  
# 0000000    0000000   0000000    0000000  000   000  0000000   

blocks = (lines, ext='koffee') ->
    
    word = (w) -> Syntax.lang[ext][w] ? 'text'
    
    lineno = 0
    lines.map (text) -> 
        
        lineinfo = 
            chunks: []
            chars:  0
            index:  lineno++
            number: lineno
            ext:    ext

        chunks = text.split /\s/
        
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
                        lineinfo.chunks.push string:w, column:c, length:wl, value:word w 
                        c += wl
                    punct = m[0]
                    pl = punct.length
                    lineinfo.chunks.push string:m[0], column:c, length:pl, value:'punct'
                    
                    # if mtch = Syntax.turd[lineinfo.ext]?[punct]
                        # log 'match!', punct, mtch
                    
                    c += pl
                
                if c < sc+l        # check for remaining non-punct
                    rl = sc+l-c    # length of remainder
                    w = s[l-rl..]  # text   of remainder 
                    lineinfo.chunks.push string:w, column:c, length:rl, value:word w
                    c += rl
                    
        if lineinfo.chunks.length
            last = lineinfo.chunks[-1]
            lineinfo.chars = last.column + last.length
        lineinfo

▸profile 'blocks'

    spaced = blocks lines
        
▸profile 'syntax1'

    ranges = lines.map (l) -> Syntax.ranges l, 'koffee'

# ▸dbg spaced[...]
# ▸dbg ranges[...]
# ▸dbg Syntax.turd.koffee
# ▸dbg Syntax.mtch['coffee']
# ▸dbg Syntax.fill.koffee
# ▸dbg Syntax.word.koffee
# ▸dbg Syntax.lang.koffee
# ▸dbg Syntax.info.koffee

▸test 'minimal'
                
    blocks(['1']).should.eql [ext:'koffee' chars:1 index:0 number:1 chunks:[ {column:0, length:1, string:'1', value:'text'} ]]
    blocks(['a']).should.eql [ext:'koffee' chars:1 index:0 number:1 chunks:[ {column:0, length:1, string:'a', value:'text'} ]]
    blocks(['.']).should.eql [ext:'koffee' chars:1 index:0 number:1 chunks:[ {column:0, length:1, string:'.', value:'punct'} ]]

    blocks(['1.a']).should.eql [ext:'koffee' chars:3 index:0 number:1 chunks:[ 
                 {column:0  length:1 string:'1'     value:'text'} 
                 {column:1  length:1 string:'.'     value:'punct'} 
                 {column:2  length:1 string:'a'     value:'text'} 
                 ]]
    blocks(['++a']).should.eql [ext:'koffee' chars:3 index:0 number:1 chunks:[ 
                 {column:0  length:2 string:'++'    value:'punct'} 
                 {column:2  length:1 string:'a'     value:'text'} 
                 ]]
    blocks(["▸doc 'hello'"]).should.eql [ext:'koffee' chars:12 index:0 number:1 chunks:[ 
                 {column:0  length:1 string:'▸'     value:'punct'} 
                 {column:1  length:3 string:'doc'   value:'text'} 
                 {column:5  length:1 string:"'"     value:'punct'} 
                 {column:6  length:5 string:"hello" value:'text'} 
                 {column:11 length:1 string:"'"     value:'punct'} 
                 ]]
    
