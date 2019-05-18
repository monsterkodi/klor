
{ slash, kstr, klog, noon, chai, _ } = require 'kxk'

▸profile '-----' 
    Syntax = require './syntax'
    Syntax.init()
    
    Syntax.swtch = 
        koffee: '▸':    to: 'md'     w0:'doc'          indent: 1
        md:     '```':  to: 'koffee' w0:'coffeescript' end:    '```'

    text0 = slash.readText "#{__dirname}/../../koffee/coffee/nodes.coffee" # 6-11ms
    text1 = slash.readText "#{__dirname}/test.coffee" # 50-120μs

    lines0 = text0.split '\n'
    lines1 = text1.split '\n'
        
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
                        
                    turd = punct = m[0]
                    for pc in punct[...-1]
                        line.chunks.push column:c++, length:1, string:pc, turd:turd, value:'punct'
                        turd = turd[1..]
                    line.chunks.push column:c++, length:1, string:punct[-1], value:'punct'
                                        
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
        - 'value' changed in chunks that match language patterns
          
    extStack   = []
    extTop     = null
    handl      = []
    stack      = []
    ext        = null
    chunk      = null
    line       = null
    chunkIndex = null

    popExt = ->
        stack = extTop.stack
        # line.pop = true
        line.ext = extTop.start.ext
        extStack.pop()               
        extTop = extStack[-1]
    
    hashComment = -> 
        
        return 0 if stack.length > 1
        
        if chunk.string == "#"
            chunk.value += ' comment'
            if chunkIndex < line.chunks.length-1
                for c in line.chunks[chunkIndex+1..]
                    c.value = 'comment'
            return line.chunks.length - chunkIndex + 1
        0

    noonComment = -> 
        
        return 0 if stack.length > 1
        
        if chunk.string == "#" and chunkIndex == 0 # the only difference. merge with hashComment?
            chunk.value += ' comment'
            if chunkIndex < line.chunks.length-1
                for c in line.chunks[chunkIndex+1..]
                    c.value = 'comment'
            return line.chunks.length - chunkIndex + 1
        0
        
    slashComment = -> 0
                
    dashArrow = ->

        if chunk.turd == '->'
            
            chunk.value += ' function tail'
            line.chunks[chunkIndex+1].value += ' function head'
            return 2
                
        if chunk.turd == '=>'
            
            chunk.value += ' function bound tail'
            line.chunks[chunkIndex+1].value += ' function bound head'
            return 2
        0
                
    regexp = ->
        
        # check stack top
        if chunk.string == '/'
            
            if chunkIndex 
                prev = line.chunks[chunkIndex-1]
                next = line.chunks[chunkIndex+1]
                if not prev.value.startsWith 'punct'
                    if (prev.column + prev.length < chunk.column) and next?.column > chunk.column+1
                        return 0
                    if (prev.column + prev.length == chunk.column) and next?.column == chunk.column+1
                        return 0
            
            count = 0
            for c in line.chunks[chunkIndex+1..]
                count++
                if c.string == '/'
                    for rc in line.chunks[chunkIndex..chunkIndex+count]
                        rc.value += ' regexp'
                    return count
        0
    
    handlers = 
        koffee: punct: [ hashComment,  dashArrow, regexp ]
        coffee: punct: [ hashComment,  dashArrow, regexp ]
        noon:   punct: [ noonComment                     ]
        js:     punct: [ slashComment, dashArrow, regexp ]
        ts:     punct: [ slashComment, dashArrow, regexp ]
        md:     {}
                        
    for line in lines
           
        if extTop
            if extTop.switch.indent and line.chunks[0]?.column <= extTop.start.chunks[0].column
                popExt()                        # end of extension block reached that is terminated by indentation
            else
                line.ext = extTop.switch.to     # make sure the current line ext matches the topmost from stack
                
        if ext != line.ext                      # either at start of file or we switched extension
            handl = handlers[ext = line.ext]    # install new handlers
        
        chunkIndex = 0
        while chunkIndex < line.chunks.length
            chunk = line.chunks[chunkIndex]
            beforeIndex = chunkIndex
            if chunk.value == 'punct'
                                        
                if mtch = Syntax.turd[line.ext]?[chunk.string] # ▸ doc
                    chunk.value += ' ' + mtch.turd if mtch.turd
                    line.chunks[chunkIndex+1]?.value = mtch['w-0'] if mtch['w-0']
                              
                popped = false
                if extTop
                    if extTop.switch.end? and extTop.switch.end == chunk.turd
                        popExt()                # end of extension block reached that is terminated by turd
                        popped = true
                       
                if not popped
                    if mtch = Syntax.swtch[line.ext]?[chunk.turd ? chunk.string]
                        # push a new extension onto the stack, ext will change on start of next line
                        extStack.push extTop = switch:mtch, start:line, stack:stack
                
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
            klog chunk.value if not chunk.value.replace
            range =
                start: chunk.column
                match: chunk.string
                value: chunk.value.replace 'punct', 'punctuation'
            rngs.push range
    rngs

for i in [0..3]
    blocks lines0
    # blocks lines1
    # lines0.map (l) -> Syntax.ranges l, 'koffee'
    
for i in [0..15]
    
    ▸profile 'lines0'
        blocks lines0
    # ▸profile 'syntax0'
        # lines0.map (l) -> Syntax.ranges l, 'koffee'
        
    # ▸profile 'lines1'
        # blocks lines1
    # ▸profile 'syntax1'
        # lines1.map (l) -> Syntax.ranges l, 'koffee'
        
module.exports =
    ranges: (textline, ext) -> ranged blocks [textline], ext
    
# 000000000  00000000   0000000  000000000  
#    000     000       000          000     
#    000     0000000   0000000      000     
#    000     000            000     000     
#    000     00000000  0000000      000     

▸test 'comment'

    blocks(["##"]).should.eql [ext:'koffee' chars:2 index:0 number:1 chunks:[ 
                {column:0 length:1 string:"#" value:'punct comment' turd:"##"} 
                {column:1 length:1 string:"#" value:'comment'} 
                ]]

    blocks([",#a"]).should.eql [ext:'koffee' chars:3 index:0 number:1 chunks:[ 
                {column:0 length:1 string:"," value:'punct' turd: ",#"} 
                {column:1 length:1 string:"#" value:'punct comment'} 
                {column:2 length:1 string:"a" value:'comment'} 
                ]]
                
▸test 'function'

    blocks(['->']).should.eql [ext:'koffee' chars:2 index:0 number:1 chunks:[ 
                {column:0 length:1 string:'-' value:'punct function tail' turd: '->'} 
                {column:1 length:1 string:'>' value:'punct function head'} 
                ]]
    blocks(['=>']).should.eql [ext:'koffee' chars:2 index:0 number:1 chunks:[ 
                {column:0 length:1 string:'=' value:'punct function bound tail' turd: '=>'} 
                {column:1 length:1 string:'>' value:'punct function bound head'} 
                ]]
    blocks(['f=->1']).should.eql [ext:'koffee' chars:5 index:0 number:1 chunks:[ 
                {column:0 length:1 string:'f' value:'text'} 
                {column:1 length:1 string:'=' value:'punct'               turd:'=->' } 
                {column:2 length:1 string:'-' value:'punct function tail' turd:'->'} 
                {column:3 length:1 string:'>' value:'punct function head'} 
                {column:4 length:1 string:'1' value:'text'} 
                ]]
                
▸test 'minimal'
                
    blocks(['1']).should.eql [ext:'koffee' chars:1 index:0 number:1 chunks:[ {column:0 length:1 string:'1' value:'text'} ]]
    blocks(['a']).should.eql [ext:'koffee' chars:1 index:0 number:1 chunks:[ {column:0 length:1 string:'a' value:'text'} ]]
    blocks(['.']).should.eql [ext:'koffee' chars:1 index:0 number:1 chunks:[ {column:0 length:1 string:'.' value:'punct'} ]]

    blocks(['1.a']).should.eql [ext:'koffee' chars:3 index:0 number:1 chunks:[ 
                 {column:0  length:1 string:'1' value:'text'} 
                 {column:1  length:1 string:'.' value:'punct'} 
                 {column:2  length:1 string:'a' value:'text'} 
                 ]]
                 
    blocks(['++a']).should.eql [ext:'koffee' chars:3 index:0 number:1 chunks:[ 
                 {column:0  length:1 string:'+' value:'punct', turd:'++'} 
                 {column:1  length:1 string:'+' value:'punct'} 
                 {column:2  length:1 string:'a' value:'text'} 
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
    
