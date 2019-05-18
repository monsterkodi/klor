
{ slash, kstr, klog, noon, chai, _ } = require 'kxk'

▸profile '-----' 
    Syntax = require './syntax'
    Syntax.init()
    
    Syntax.swtch = 
        koffee: '▸':    to: 'md'     w0:'doc'          indent: 1
        md:     '```':  to: 'koffee' w0:'coffeescript' end:    '```'

    text = slash.readText "#{__dirname}/../../koffee/coffee/nodes.coffee" # 22ms
    # text = slash.readText "#{__dirname}/../../koffee/test.koffee"
    # text = slash.readText "#{__dirname}/test.coffee" # 500us

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
    
    word = (w) -> if Syntax.lang[ext].hasOwnProperty w then Syntax.lang[ext][w] else 'text'
    
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
                        line.chunks.push column:c, length:wl, string:w, value:word w 
                        c += wl
                    punct = m[0]
                    pl = punct.length
                    line.chunks.push column:c, length:pl, string:m[0], value:'punct'
                                        
                    c += pl
                
                if c < sc+l        # check for remaining non-punct
                    rl = sc+l-c    # length of remainder
                    w = s[l-rl..]  # text   of remainder 
                    line.chunks.push column:c, length:rl, string:w, value:word w
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
                line.pop = true
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
                        line.pop = true
                        line.ext = top.start.ext
                        continue
                        
                if mtch = Syntax.swtch[line.ext]?[chunk.string]
                    extStack.push switch:mtch, start:line
    lines

# 00     00   0000000   000000000   0000000  000   000  00000000  0000000    
# 000   000  000   000     000     000       000   000  000       000   000  
# 000000000  000000000     000     000       000000000  0000000   000   000  
# 000 0 000  000   000     000     000       000   000  000       000   000  
# 000   000  000   000     000      0000000  000   000  00000000  0000000    

matched = (lines) ->
    
    ▸doc 'matched *lines*'
        
        *lines*:  array of blocked lines
        
        **returns** lines with 'value' changed in chunks that match language pattern
    
        
    stacks     = []
    handl      = []
    stack      = null
    ext        = null
    chunk      = null
    line       = null
    chunkIndex = null
           
    split = ->
        
        if chunk.length > 1

            args = [chunkIndex, 1]
            for c in chunk.string
                args.push column:chunk.column+args.length-2, length:1, string:c, value:chunk.value
            [].splice.apply line.chunks, args
            chunk = line.chunks[chunkIndex]
        0
    
    hashComment = -> 
        
        return 0 if stack.length > 1
        
        if chunk.string == "#"
            chunk.value += ' comment'
            if chunkIndex < line.chunks.length-1
                for c in line.chunks[chunkIndex+1..]
                    c.value = 'comment'
            return line.chunks.length - chunkIndex + 1
        0

    slashComment = -> 0
                
    dashArrow = ->
        
        if chunk.string == '>' and chunkIndex > 0
            
            prev = line.chunks[chunkIndex-1]
            
            if prev.string == '-'
                prev.value += ' function tail'
                chunk.value += ' function head'
                return 1
                
            if prev.string == '=' 
                prev.value += ' function bound tail'
                chunk.value += ' function bound head'
                return 1
        0
                
    regexp = ->
        
        if chunk.string == '/'
            chunk.value += ' regexp'
            return 1
        0
    
    handlers = 
        koffee: punct: [ split, hashComment,  dashArrow, regexp ]
        coffee: punct: [ split, hashComment,  dashArrow, regexp ]
        js:     punct: [ split, slashComment, dashArrow, regexp ]
        ts:     punct: [ split, slashComment, dashArrow, regexp ]
        md:     {}
    
    for line in lines

        if ext != line.ext
            ext = line.ext
            if stacks.length and line.pop
                stack = stacks.pop
            else
                stacks.push stack if stack
                stack = [ ext:ext ]
                
            handl = handlers[ext]
        
        chunkIndex = 0
        while chunkIndex < line.chunks.length
            chunk = line.chunks[chunkIndex]
            beforeIndex = chunkIndex
            if chunk.value == 'punct'
                for hnd in handl.punct ? []
                    if advance = hnd()
                        chunkIndex += advance
                        break
            else
                for hnd in handl.word ? []
                    if advance = hnd()
                        chunkIndex += advance
                        break
            if chunkIndex == beforeIndex
                chunkIndex++
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
        matched blocked chunked lines, ext
        ```
        
    matched blocked chunked lines, ext
    
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
            klog chunk.value if not chunk.value.replace
            range =
                start: chunk.column
                match: chunk.string
                value: chunk.value.replace 'punct', 'punctuation'
            rngs.push range
    rngs
    
▸profile 'blocks'

    # spaced = ranged blocks lines
    spaced = blocks lines

▸profile 'syntax1'
    ranges = lines.map (l) -> Syntax.ranges l, 'koffee'

# klog spaced
# klog ranges

module.exports =
    ranges: (textline, ext) -> ranged blocks [textline], ext
    
# 000000000  00000000   0000000  000000000  
#    000     000       000          000     
#    000     0000000   0000000      000     
#    000     000            000     000     
#    000     00000000  0000000      000     

▸test 'comment'

    blocks(["##"]).should.eql [ext:'koffee' chars:2 index:0 number:1 chunks:[ 
                {column:0, length:1, string:"#", value:'punct comment'} 
                {column:1, length:1, string:"#", value:'comment'} 
                ]]

    blocks([",#a"]).should.eql [ext:'koffee' chars:3 index:0 number:1 chunks:[ 
                {column:0, length:1, string:",", value:'punct'} 
                {column:1, length:1, string:"#", value:'punct comment'} 
                {column:2, length:1, string:"a", value:'comment'} 
                ]]
                
▸test 'function'

    blocks(['->']).should.eql [ext:'koffee' chars:2 index:0 number:1 chunks:[ 
                {column:0, length:1, string:'-', value:'punct function tail'} 
                {column:1, length:1, string:'>', value:'punct function head'} 
                ]]
    blocks(['=>']).should.eql [ext:'koffee' chars:2 index:0 number:1 chunks:[ 
                {column:0, length:1, string:'=', value:'punct function bound tail'} 
                {column:1, length:1, string:'>', value:'punct function bound head'} 
                ]]
    blocks(['f=->1']).should.eql [ext:'koffee' chars:5 index:0 number:1 chunks:[ 
                {column:0, length:1, string:'f', value:'text'} 
                {column:1, length:1, string:'=', value:'punct'} 
                {column:2, length:1, string:'-', value:'punct function tail'} 
                {column:3, length:1, string:'>', value:'punct function head'} 
                {column:4, length:1, string:'1', value:'text'} 
                ]]
                
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
                 {column:0  length:1 string:'+'     value:'punct'} 
                 {column:1  length:1 string:'+'     value:'punct'} 
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
    
