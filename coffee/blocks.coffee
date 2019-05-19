
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
        
SPACE  = /\s/
PUNCT  = /\W+/gi
NUMBER = /^\d+$/
HEXNUM = /^0x[a-fA-F\d]+$/

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

        chunks = text.split SPACE
        
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
                
                while m = PUNCT.exec s
                    
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
    topType    = null
    stackTop   = null
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
    
    pushStack = (o) -> 
        stack.push o 
        stackTop = o
        topType = o.type
        
    popStack = -> 
        stack.pop()
        stackTop = stack[-1]
        topType = stackTop?.type
        
    #  0000000   0000000   00     00  00     00  00000000  000   000  000000000  
    # 000       000   000  000   000  000   000  000       0000  000     000     
    # 000       000   000  000000000  000000000  0000000   000 0 000     000     
    # 000       000   000  000 0 000  000 0 000  000       000  0000     000     
    #  0000000   0000000   000   000  000   000  00000000  000   000     000     
    
    hashComment = -> 
        
        return 0 if stackTop
        
        if chunk.string == "#"
            chunk.value += ' comment'
            if chunkIndex < line.chunks.length-1
                for c in line.chunks[chunkIndex+1..]
                    c.value = 'comment'
            return line.chunks.length - chunkIndex + 1
        0

    noonComment = -> 
        
        return 0 if stackTop
        
        if chunk.string == "#" and chunkIndex == 0 # the only difference. merge with hashComment?
            chunk.value += ' comment'
            if chunkIndex < line.chunks.length-1
                for c in line.chunks[chunkIndex+1..]
                    c.value = 'comment'
            return line.chunks.length - chunkIndex + 1
        0
        
    slashComment = -> 0
                
    #  0000000   00000000   00000000    0000000   000   000  
    # 000   000  000   000  000   000  000   000  000 0 000  
    # 000000000  0000000    0000000    000   000  000000000  
    # 000   000  000   000  000   000  000   000  000   000  
    # 000   000  000   000  000   000   0000000   00     00  
    
    dashArrow = ->

        if chunk.turd == '->'
            addValue 0, 'function tail'
            addValue 1, 'function head'
            return 2
                
        if chunk.turd == '=>'
            addValue 0, 'function bound tail'
            addValue 1, 'function bound head'
            return 2
        0
                
    # 00000000   00000000   0000000   00000000  000   000  00000000   
    # 000   000  000       000        000        000 000   000   000  
    # 0000000    0000000   000  0000  0000000     00000    00000000   
    # 000   000  000       000   000  000        000 000   000        
    # 000   000  00000000   0000000   00000000  000   000  000        
    
    regexp = ->
        
        return 0 if topType == 'string'

        if chunk.string == '/'
            
            if topType == 'regexp'
                chunk.value += ' regexp end'
                popStack()
                return 1
                
            if chunkIndex 
                prev = line.chunks[chunkIndex-1]
                next = line.chunks[chunkIndex+1]
                if not prev.value.startsWith 'punct'
                    return 0 if (prev.column+prev.length <  chunk.column) and next?.column >  chunk.column+1
                    return 0 if (prev.column+prev.length == chunk.column) and next?.column == chunk.column+1
  
            pushStack type:'regexp'
            chunk.value += ' regexp start'
            return 1
        0
        
    #  0000000  000000000  00000000   000  000   000   0000000   
    # 000          000     000   000  000  0000  000  000        
    # 0000000      000     0000000    000  000 0 000  000  0000  
    #      000     000     000   000  000  000  0000  000   000  
    # 0000000      000     000   000  000  000   000   0000000   
    
    simpleString = ->
        
        return 0 if topType == 'regexp'
        
        if chunk.string in ['"' "'" '`']
            
            if line.chunks[chunkIndex-1]?.escape
                return stacked()
            
            type = switch chunk.string 
                when '"' then 'string double' 
                when "'" then 'string single'
                when '`' then 'string backtick'
            
            if topType == type
                chunk.value += ' ' + type
                popStack()
                return 1
            else if stackTop and topType != 'interpolation'
                return stacked()
                
            pushStack type:type, strong:true
            chunk.value += ' ' + type
            return 1
            
        if chunk.string == '\\' and topType?.startsWith 'string'
            if chunkIndex == 0 or not line.chunks[chunkIndex-1].escape
                chunk.escape = true
        0
    
    # 00     00  0000000          00000000   0000000   00000000   00     00   0000000   000000000  
    # 000   000  000   000        000       000   000  000   000  000   000  000   000     000     
    # 000000000  000   000        000000    000   000  0000000    000000000  000000000     000     
    # 000 0 000  000   000        000       000   000  000   000  000 0 000  000   000     000     
    # 000   000  0000000          000        0000000   000   000  000   000  000   000     000     
    
    formatString = ->
        
        if chunk.turd == '**'
            
            type = 'bold'
            if topType?.endsWith type
                addValue 0, topType
                addValue 1, topType
                popStack()
                return 2

            pushStack merge:true, type:stackTop?.merge and stackTop.type + ' ' + type or type
            addValue 0, type
            addValue 1, type
            return 2
            
        if chunk.string == '*'
            
            type = 'italic'
            if topType?.endsWith type
                addValue 0, topType
                popStack()
                return 1

            pushStack merge:true, type:stackTop?.merge and stackTop.type + ' ' + type or type
            addValue 0, type
            return 1
          
        if chunk.string == '`'
            
            type = 'backtick'
            if topType?.endsWith type
                addValue 0, topType
                popStack()
                return 1
                
            pushStack merge:true, type:stackTop?.merge and stackTop.type + ' ' + type or type
            addValue 0, type
            return 1
        0
        
    # 000  000   000  000000000  00000000  00000000   00000000    0000000   000     
    # 000  0000  000     000     000       000   000  000   000  000   000  000     
    # 000  000 0 000     000     0000000   0000000    00000000   000   000  000     
    # 000  000  0000     000     000       000   000  000        000   000  000     
    # 000  000   000     000     00000000  000   000  000         0000000   0000000 
    
    interpolation = ->
        
        if topType == 'string double'
        
            if chunk.turd?.startsWith "\#{"
                pushStack type:'interpolation', weak:true
                addValue 0, 'string interpolation start'
                addValue 1, 'string interpolation start'
                return 2
                
        else if topType == 'interpolation'
            
            if chunk.string == '}'
                addValue 0, 'string interpolation end'
                popStack()
                return 1
        0
        
    # 000   000  000   000  00     00  0000000    00000000  00000000   
    # 0000  000  000   000  000   000  000   000  000       000   000  
    # 000 0 000  000   000  000000000  0000000    0000000   0000000    
    # 000  0000  000   000  000 0 000  000   000  000       000   000  
    # 000   000   0000000   000   000  0000000    00000000  000   000  
    
    number = ->
        
        if NUMBER.test chunk.string
            
            if getString(-1) == '.'

                if getValue(-4) == 'number float' and getValue(-2) == 'number float'
                    setValue -4, 'semver'
                    setValue -3, 'punct semver'
                    setValue -2, 'semver'
                    setValue -1, 'punct semver'
                    setValue  0, 'semver'
                    return 1

                if getValue(-2) == 'number'
                    setValue -2, 'number float'
                    addValue -1, 'number float'
                    setValue  0, 'number float'
                    return 1

            chunk.value = 'number'
            return 1
            
        if HEXNUM.test chunk.string
            
            chunk.value = 'number hex'
            return 1
        0
        
    #  0000000  000000000   0000000    0000000  000   000  00000000  0000000    
    # 000          000     000   000  000       000  000   000       000   000  
    # 0000000      000     000000000  000       0000000    0000000   000   000  
    #      000     000     000   000  000       000  000   000       000   000  
    # 0000000      000     000   000   0000000  000   000  00000000  0000000    
    
    stacked = ->

        if stackTop
            return if stackTop.weak
            if stackTop.strong
                chunk.value = topType
            else
                chunk.value += ' ' + topType
            return 1
        0
        
    getChunk  = (d) -> line.chunks[chunkIndex+d]
    setValue  = (d, value) -> if 0 <= chunkIndex+d < line.chunks.length then line.chunks[chunkIndex+d].value = value
    addValue  = (d, value) -> if 0 <= chunkIndex+d < line.chunks.length then line.chunks[chunkIndex+d].value += ' ' + value
    getValue  = (d) -> getChunk(d)?.value
    getString = (d) -> getChunk(d)?.string
        
    # 000   000   0000000   000   000  0000000    000      00000000  00000000    0000000  
    # 000   000  000   000  0000  000  000   000  000      000       000   000  000       
    # 000000000  000000000  000 0 000  000   000  000      0000000   0000000    0000000   
    # 000   000  000   000  000  0000  000   000  000      000       000   000       000  
    # 000   000  000   000  000   000  0000000    0000000  00000000  000   000  0000000   
    
    handlers = 
        koffee: punct: [ simpleString, hashComment, interpolation, dashArrow,  regexp, stacked ], word: [number, stacked]
        coffee: punct: [ simpleString, hashComment, interpolation, dashArrow,  regexp, stacked ], word: [number, stacked]
        noon:   punct: [ noonComment                                  , stacked ], word: [number, stacked]
        js:     punct: [ slashComment, simpleString, dashArrow, regexp, stacked ], word: [number, stacked]
        ts:     punct: [ slashComment, simpleString, dashArrow, regexp, stacked ], word: [number, stacked]
        md:     punct: [ formatString, simpleString, stacked ], word: [number, stacked]
        js:     {}
        iss:    {}
        ini:    {}
        sh:     {}
        cpp:    {}
        hpp:    {}
        cs:     {}
        c:      {}
        h:      {}
        pug:    {}
        svg:    {}
        html:   {}
        htm:    {}
        styl:   {}   
        css:    {}   
        sass:   {}   
        scss:   {}  
                        
    # 000      000  000   000  00000000  000       0000000    0000000   00000000   
    # 000      000  0000  000  000       000      000   000  000   000  000   000  
    # 000      000  000 0 000  0000000   000      000   000  000   000  00000000   
    # 000      000  000  0000  000       000      000   000  000   000  000        
    # 0000000  000  000   000  00000000  0000000   0000000    0000000   000        
    
    for line in lines
           
        if extTop
            if extTop.switch.indent and line.chunks[0]?.column <= extTop.start.chunks[0].column
                popExt()                        # end of extension block reached that is terminated by indentation
            else
                line.ext = extTop.switch.to     # make sure the current line ext matches the topmost from stack
                
        if ext != line.ext                      # either at start of file or we switched extension
            handl = handlers[ext = line.ext]    # install new handlers
        
        #  0000000  000   000  000   000  000   000  000   000  000       0000000    0000000   00000000   
        # 000       000   000  000   000  0000  000  000  000   000      000   000  000   000  000   000  
        # 000       000000000  000   000  000 0 000  0000000    000      000   000  000   000  00000000   
        # 000       000   000  000   000  000  0000  000  000   000      000   000  000   000  000        
        #  0000000  000   000   0000000   000   000  000   000  0000000   0000000    0000000   000        
        
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

▸if 1
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

    chai()
    
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
                {column:4 length:1 string:'1' value:'number'} 
                ]]
                
▸test 'minimal'
                
    blocks(['1']).should.eql [ext:'koffee' chars:1 index:0 number:1 chunks:[ {column:0 length:1 string:'1' value:'number'} ]]
    blocks(['a']).should.eql [ext:'koffee' chars:1 index:0 number:1 chunks:[ {column:0 length:1 string:'a' value:'text'} ]]
    blocks(['.']).should.eql [ext:'koffee' chars:1 index:0 number:1 chunks:[ {column:0 length:1 string:'.' value:'punct'} ]]

    blocks(['1.a']).should.eql [ext:'koffee' chars:3 index:0 number:1 chunks:[ 
                 {column:0  length:1 string:'1' value:'number'} 
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
                  {column:5  length:1 string:"'"     value:'punct string single'} 
                  {column:6  length:5 string:"hello" value:'string single'} 
                  {column:11 length:1 string:"'"     value:'punct string single'} 
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
    
