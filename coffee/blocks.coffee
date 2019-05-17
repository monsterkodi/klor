
{ slash, kstr, klog, noon, chai } = require 'kxk'

▸profile '-----' 
    Syntax = require './syntax'
    Syntax.init()
    
    Syntax.swtch = 
        koffee: '▸':    to: 'md'     w0:'doc'          indent: 1
        md:     '```':  to: 'koffee' w0:'coffeescript' end:    '```'

    # text = slash.readText "#{__dirname}/../../koffee/coffee/nodes.coffee" # 22ms
    # text = slash.readText "#{__dirname}/../../koffee/test.koffee"
    text = slash.readText "#{__dirname}/test.coffee" # 500us

    lines = text.split '\n'
        
#  0000000  000   000  000   000  000   000  000   000  00000000  0000000    
# 000       000   000  000   000  0000  000  000  000   000       000   000  
# 000       000000000  000   000  000 0 000  0000000    0000000   000   000  
# 000       000   000  000   000  000  0000  000  000   000       000   000  
#  0000000  000   000   0000000   000   000  000   000  00000000  0000000    

chunked = (lines, ext) ->    

    ▸doc 'chunked *lines*, *ext*'
                        
        **returns** array of
            
            chunks: [
                        string: s
                        value:  s
                        column: n
                        length: n
                    ]
            ext:    s
            chars:  n
            index:  n
            number: n+1
    
    word = (w) -> Syntax.lang[ext][w] ? 'text'
    
    lineno = 0
    lines.map (text) -> 
        
        line = 
            chunks: []
            chars:  0
            index:  lineno++
            number: lineno
            ext:    ext

        chunks = text.split /\s/
        
        if chunks.length == 1 and chunks[0] == ''
            return line # empty line
            
        c = 0
        for s in chunks
            if s == ''
                c++
            else
                if line.chunks.length then c++
                l = s.length
                sc = c
                
                # seperate by punctuation
                
                re = /\W+/gi
                while m = re.exec s
                    if m.index > 0
                        wl = m.index-(c-sc)
                        w = s[c-sc...m.index]
                        line.chunks.push string:w, column:c, length:wl, value:word w 
                        c += wl
                    punct = m[0]
                    pl = punct.length
                    line.chunks.push string:m[0], column:c, length:pl, value:'punct'
                                        
                    c += pl
                
                if c < sc+l        # check for remaining non-punct
                    rl = sc+l-c    # length of remainder
                    w = s[l-rl..]  # text   of remainder 
                    line.chunks.push string:w, column:c, length:rl, value:word w
                    c += rl
                    
        if line.chunks.length
            last = line.chunks[-1]
            line.chars = last.column + last.length
            
        line

# 0000000    000       0000000    0000000  000   000  00000000  0000000    
# 000   000  000      000   000  000       000  000   000       000   000  
# 0000000    000      000   000  000       0000000    0000000   000   000  
# 000   000  000      000   000  000       000  000   000       000   000  
# 0000000    0000000   0000000    0000000  000   000  00000000  0000000    

blocked = (lines) ->
    
    ▸doc 'blocked *lines*'
        
        *lines*:  array of chunked lines
        
        **returns** lines with 
        - 'ext' switched in some lines
        - 'value' changed in chunks that match turd pattern, e.g. ▸doc
            
    extStack = []
    
    for line in lines
        
        if extStack.length
            top = extStack[-1]
            if top.switch.indent and line.chunks[0]?.column <= top.start.chunks[0].column
                extStack.pop()
                line.ext = top.start.ext
            else
                line.ext = top.switch.to
        
        for chunkIndex in [0...line.chunks.length]
            chunk = line.chunks[chunkIndex]
            if chunk.value == 'punct' 
                
                if mtch = Syntax.turd[line.ext]?[chunk.string]
                    chunk.value += ' ' + mtch.turd if mtch.turd
                    line.chunks[chunkIndex+1]?.value = mtch['w-0'] if mtch['w-0']
                                    
                if extStack.length
                    top = extStack[-1]
                    if top.switch.end == chunk.string
                        extStack.pop()
                        line.ext = top.start.ext
                        continue
                        
                if mtch = Syntax.swtch[line.ext]?[chunk.string]
                    extStack.push switch:mtch, start:line
    lines

# 0000000    000       0000000    0000000  000   000   0000000  
# 000   000  000      000   000  000       000  000   000       
# 0000000    000      000   000  000       0000000    0000000   
# 000   000  000      000   000  000       000  000        000  
# 0000000    0000000   0000000    0000000  000   000  0000000   

blocks = (lines, ext='koffee') ->
    
    ▸doc 'blocks *lines*, *ext*'

        *lines*:  array of strings
        
        *ext*:
        - koffee coffee js ts 
        - styl css sass scss 
        - pug html htm svg 
        - cpp hpp cxx c h 
        - bash fish sh 
        - noon json
        - md plist 
        - iss ini
        - txt log 

        **returns** the result of
        ```coffeescript
        blocked chunked lines, ext
        ```
        
    blocked chunked lines, ext
    
# 00000000    0000000   000   000   0000000   00000000  0000000    
# 000   000  000   000  0000  000  000        000       000   000  
# 0000000    000000000  000 0 000  000  0000  0000000   000   000  
# 000   000  000   000  000  0000  000   000  000       000   000  
# 000   000  000   000  000   000   0000000   00000000  0000000    

ranged = (lines) ->
    
    ▸doc 'ranged *lines*'
        
        *lines*:  array of chunked lines
        
        **returns** array of

            start: n
            match: s
            value: s
        
    rngs = []
    for line in lines
        for chunk in line.chunks
            range =
                start: chunk.column
                match: chunk.string
                value: chunk.value.replace 'punct', 'punctuation'
            rngs.push range
    rngs
    
▸profile 'blocks'

    spaced = ranged blocks lines

# klog spaced
# ▸profile 'syntax1'
    # ranges = lines.map (l) -> Syntax.ranges l, 'koffee'

module.exports =
    ranges: (textline, ext) -> ranged blocks [textline], ext
    
# 000000000  00000000   0000000  000000000  
#    000     000       000          000     
#    000     0000000   0000000      000     
#    000     000            000     000     
#    000     00000000  0000000      000     

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
                  {column:0  length:1 string:'▸'     value:'punct meta'} 
                  {column:1  length:3 string:'doc'   value:'meta'} 
                  {column:5  length:1 string:"'"     value:'punct'} 
                  {column:6  length:5 string:"hello" value:'text'} 
                  {column:11 length:1 string:"'"     value:'punct'} 
                  ]]
                  
▸test 'space'

    b = blocks ["x"]
    b[0].chunks[0].should.include.property 'column' 0

    b = blocks [" xx"]
    b[0].chunks[0].should.include.property 'column' 1
    
    b = blocks ["    xxx"]
    b[0].chunks[0].should.include.property 'column' 4

    b = blocks ["    x 1  , "]
    b[0].chunks[0].should.include.property 'column' 4
    b[0].chunks[1].should.include.property 'column' 6
    b[0].chunks[2].should.include.property 'column' 9

▸test 'switches'
    
    b = blocks """
        ▸doc 'hello'
            x    
            y
        1""".split '\n'
    b[0].should.include.property 'ext' 'koffee'
    b[1].should.include.property 'ext' 'md'
    b[2].should.include.property 'ext' 'md'
    b[3].should.include.property 'ext' 'koffee'

    b = blocks """
        ▸doc 'hello'
            x  
            ```coffeescript
                1+1
            ```
            y
        1""".split '\n'
    b[0].should.include.property 'ext' 'koffee'
    b[1].should.include.property 'ext' 'md'
    b[2].should.include.property 'ext' 'md'
    b[3].should.include.property 'ext' 'koffee'
    b[4].should.include.property 'ext' 'md'
    b[5].should.include.property 'ext' 'md'
    b[6].should.include.property 'ext' 'koffee'

    b = blocks """                    
        ▸doc 'hello'                  
            x                         
            ```coffeescript           
                1+1                   
                ▸doc 'again'          
                    some **docs**     
            ```                       
            y                         
        1""".split '\n'               
    b[0].should.include.property 'ext' 'koffee'
    b[1].should.include.property 'ext' 'md'
    b[2].should.include.property 'ext' 'md'
    b[3].should.include.property 'ext' 'koffee'
    b[4].should.include.property 'ext' 'koffee'
    b[5].should.include.property 'ext' 'md'
    b[6].should.include.property 'ext' 'md'
    b[7].should.include.property 'ext' 'md'
    b[8].should.include.property 'ext' 'koffee'
    
