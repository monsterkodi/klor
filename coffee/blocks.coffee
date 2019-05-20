###
0000000    000       0000000    0000000  000   000   0000000    
000   000  000      000   000  000       000  000   000         
0000000    000      000   000  000       0000000    0000000     
000   000  000      000   000  000       000  000        000    
0000000    0000000   0000000    0000000  000   000  0000000     
###

{ slash, kstr, klog, noon, _ } = require 'kxk'
        
Syntax = require './syntax'
Syntax.init()

Syntax.swtch = 
    coffee: 
        doc:          turd:'▸'   to:'md'  indent: 1
    md:     
        coffeescript: turd:'```' to:'coffee' end:'```'
        javascript:   turd:'```' to:'js'     end:'```'
            
SPACE  = /\s/
PUNCT  = /\W+/gi
NUMBER = /^\d+$/
FLOAT  = /^\d+f$/
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
        
###
0000000    000       0000000    0000000  000   000  00000000  0000000    
000   000  000      000   000  000       000  000   000       000   000  
0000000    000      000   000  000       0000000    0000000   000   000  
000   000  000      000   000  000       000  000   000       000   000  
0000000    0000000   0000000    0000000  000   000  00000000  0000000    
###

blocked = (lines) ->
    
    ▸doc 'blocked *lines*'
        
        *lines*:  array of chunked lines
        
        **returns** lines with 
        - 'ext' switched in some lines
        - 'value' changed in chunks that match language patterns
          
    extStack   = []
    stack      = []
    handl      = []
    extTop     = null
    stackTop   = null
    topType    = ''
    ext        = ''
    line       = null
    chunk      = null
    chunkIndex = 0
        
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
            if line.chunks[0].value == 'dictionary key' or line.chunks[0].turd == '@:'
                line.chunks[0].value = 'method'
                line.chunks[1].value = 'punct method'
            return 2
                
        if chunk.turd == '=>'
            addValue 0, 'function bound tail'
            addValue 1, 'function bound head'
            if line.chunks[0].value == 'dictionary key'
                line.chunks[0].value = 'method'
                line.chunks[1].value = 'punct method'
            return 2
        0
               
    #  0000000   0000000   00000000  00000000  00000000  00000000  
    # 000       000   000  000       000       000       000       
    # 000       000   000  000000    000000    0000000   0000000   
    # 000       000   000  000       000       000       000       
    #  0000000   0000000   000       000       00000000  00000000  
    
    coffeeWord = ->
        
        prevString = getString(-1)
        if prevString in ['class', 'extends']
            setValue 0, 'class'
            return 1
            
        if prevString == '.'
            addValue -1, 'property'
            setValue 0, 'property'
            if prevPrev = getChunk -2
                if prevPrev.value not in ['property', 'number']
                    setValue -2, 'obj'
            return 1
        0

    coffeeFunc = ->        

        return 0 if stackTop and topType != 'interpolation'
        return 0 if chunk.value.startsWith 'keyword'
        
        if chunk.string == '▸'
            if next = getChunk 1
                if next.column == chunk.column+1 and next.value in ['text', 'keyword']
                    addValue 0, 'meta'
                    setValue 1, 'meta'
                    return 1 # give switch a chance
        
        if prev = getChunk -1
        
            if prev.value.startsWith 'text'
                if chunk.string == '='
                    setValue -1, 'function'
                else if prev.column+prev.length < chunk.column
                    setValue -1, 'function call' 
        0
        
    jsFunc = ->
        
        if chunk.value == 'keyword function'
            if getString(-1) == '=' and getValue(-2).startsWith 'text'
                setValue -2, 'function'
        0
        
    dict = ->
        
        if chunk.string == ':' and not chunk.turd?.startsWith '::'
            if prev = getChunk -1
                if prev.value.split(' ')[0] in ['string', 'number', 'text', 'keyword']
                    setValue -1, 'dictionary key'
                    setValue  0, 'punct dictionary'
                    return 1
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
                prev = getChunk -1
                next = getChunk +1
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

    tripleString = -> 
        
        return 0 if not chunk.turd or chunk.turd.length < 3
        return 0 if topType == 'regexp'
        
        type = switch chunk.turd[..2]
            when '"""' then 'string double triple' 
            when "'''" then 'string single triple'
            when '```' then 'string backtick triple'

        if type
            if topType == type
                popStack()
            else
                pushStack type:type, strong:true
                
            addValue 0, type
            addValue 1, type
            addValue 2, type
            return 3
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

            type = stackTop.type + ' ' + type if stackTop?.merge
            pushStack merge:true, type:type
            addValue 0, type
            addValue 1, type
            return 2
            
        if chunk.string == '*'
            
            type = 'italic'
            if topType?.endsWith type
                addValue 0, topType
                popStack()
                return 1

            type = stackTop.type + ' ' + type if stackTop?.merge
            pushStack merge:true, type:type
            addValue 0, type
            return 1
          
        if chunk.string == '`'
            
            type = 'backtick'
            if topType?.endsWith type
                addValue 0, topType
                popStack()
                return 1
                
            type = stackTop.type + ' ' + type if stackTop?.merge
            pushStack merge:true, type:type
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
        
    # 00000000  000       0000000    0000000   000000000  
    # 000       000      000   000  000   000     000     
    # 000000    000      000   000  000000000     000     
    # 000       000      000   000  000   000     000     
    # 000       0000000   0000000   000   000     000     
    
    float = ->
        
        if FLOAT.test chunk.string
            if getString(-1) == '.'

                if getValue(-2) == 'number'
                    setValue -2, 'number float'
                    addValue -1, 'number float'
                    setValue  0, 'number float'
                    return 1

            chunk.value = 'number float'
            return 1
        0            
        
    # 000   000  00     00  000      
    #  000 000   000   000  000      
    #   00000    000000000  000      
    #  000 000   000 0 000  000      
    # 000   000  000   000  0000000  
    
    xmlPunct = -> 
        
        if chunk.turd == '</'
            addValue 0, 'keyword'
            addValue 1, 'keyword'
            return 2
            
        if chunk.string in ['<''>']
            addValue 0, 'keyword'
            return 1
            
        0
        
    #  0000000  00000000   00000000   
    # 000       000   000  000   000  
    # 000       00000000   00000000   
    # 000       000        000        
    #  0000000  000        000        
    
    cppMacro = -> 
        
        if chunk.string == "#"
            addValue 0, 'define'
            setValue 1, 'define'
            return 2
        0

    #  0000000  000   000
    # 000       000   000
    # 0000000   000000000
    #      000  000   000
    # 0000000   000   000
    
    shPunct = ->
        
        if chunk.string == '/' and getChunk(-1)?.column + getChunk(-1)?.length == chunk.column
            addValue -1, 'dir'
            return 1
        
        if chunk.turd == '--' and getChunk(2)?.column == chunk.column+2
            addValue 0, 'argument'
            addValue 1, 'argument'
            setValue 2, 'argument'
            return 3
            
        if chunk.string == '-' and getChunk(1)?.column == chunk.column+1
            addValue 0, 'argument'
            setValue 1, 'argument'
            return 2
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
       
    popExt = ->
        stack = extTop.stack
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
        
    getChunk  = (d) -> line.chunks[chunkIndex+d]
    setValue  = (d, value) -> if 0 <= chunkIndex+d < line.chunks.length then line.chunks[chunkIndex+d].value = value
    addValue  = (d, value) -> if 0 <= chunkIndex+d < line.chunks.length then line.chunks[chunkIndex+d].value += ' ' + value
    getValue  = (d) -> getChunk(d)?.value ? ''
    getString = (d) -> getChunk(d)?.string ? ''
        
    # 000   000   0000000   000   000  0000000    000      00000000  00000000    0000000  
    # 000   000  000   000  0000  000  000   000  000      000       000   000  000       
    # 000000000  000000000  000 0 000  000   000  000      0000000   0000000    0000000   
    # 000   000  000   000  000  0000  000   000  000      000       000   000       000  
    # 000   000  000   000  000   000  0000000    0000000  00000000  000   000  0000000   
    
    handlers = 
        coffee: punct: [ coffeeFunc,   tripleString, simpleString, hashComment, interpolation, dashArrow, regexp, dict, stacked ], word: [coffeeFunc, number, coffeeWord, stacked]
        noon:   punct: [ noonComment,                                   stacked ], word: [number,           stacked]
        json:   punct: [               simpleString, dict,              stacked ], word: [number, jsFunc,   stacked]
        js:     punct: [ slashComment, simpleString, dashArrow, regexp, stacked ], word: [number, jsFunc,   stacked]
        ts:     punct: [ slashComment, simpleString, dashArrow, regexp, stacked ], word: [number, jsFunc,   stacked]
        md:     punct: [ formatString, tripleString, simpleString, xmlPunct, stacked ], word: [number,           stacked]
        iss:    punct: [ slashComment, simpleString,                    stacked ], word: [number,           stacked]
        ini:    punct: [ slashComment, simpleString, cppMacro,          stacked ], word: [number,           stacked]
        cpp:    punct: [ slashComment, simpleString, cppMacro,          stacked ], word: [number, float,    stacked]
        hpp:    punct: [ slashComment, simpleString, cppMacro,          stacked ], word: [number, float,    stacked]
        c:      punct: [ slashComment, simpleString, cppMacro,          stacked ], word: [number, float,    stacked]
        h:      punct: [ slashComment, simpleString, cppMacro,          stacked ], word: [number, float,    stacked]
        sh:     punct: [ hashComment,  simpleString, shPunct,           stacked ], word: [number,           stacked]
        cs:     punct: [ slashComment, simpleString,                    stacked ], word: [number,           stacked]
        pug:    punct: [ slashComment, simpleString,                    stacked ], word: [number,           stacked]
        svg:    punct: [               simpleString, xmlPunct,          stacked ], word: [number,           stacked]
        html:   punct: [               simpleString, xmlPunct,          stacked ], word: [number,           stacked]
        htm:    punct: [               simpleString, xmlPunct,          stacked ], word: [number,           stacked]
        styl:   punct: [ slashComment, simpleString,                    stacked ], word: [number,           stacked]
        css:    punct: [ slashComment, simpleString,                    stacked ], word: [number,           stacked]
        sass:   punct: [ slashComment, simpleString,                    stacked ], word: [number,           stacked]
        scss:   punct: [ slashComment, simpleString,                    stacked ], word: [number,           stacked]
        log:    punct: [ slashComment, simpleString,                    stacked ], word: [number,           stacked]
        txt:    punct: [ slashComment, simpleString,                    stacked ], word: [number,           stacked]
                        
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
                                        
                if extTop
                    if extTop.switch.end? and extTop.switch.end == chunk.turd
                        popExt() # end of extension block reached that is terminated by turd
                                       
                for hnd in handl.punct ? []
                    if advance = hnd()
                        chunkIndex += advance
                        break
            else
                
                if mtch = Syntax.swtch[line.ext]?[chunk.string] 
                    if mtch.turd
                        turdChunk = getChunk -mtch.turd.length
                        if mtch.turd == (turdChunk?.turd ? turdChunk?.string)
                            # push a new extension onto the stack, ext will change on start of next line
                            extStack.push extTop = switch:mtch, start:line, stack:stack
                
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

blocks = (lines, ext='coffee') ->
    
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
            range.clss = range.value
            rngs.push range
    rngs

dissected = (lines) ->
    
    diss = []
    for line in lines
        d = []
        for chunk in line.chunks
            range =
                start: chunk.column
                match: chunk.string
                value: chunk.value.replace 'punct', 'punctuation'
            range.clss = range.value
            d.push range
        diss.push d
    diss
        
# 00000000  000   000  00000000    0000000   00000000   000000000   0000000  
# 000        000 000   000   000  000   000  000   000     000     000       
# 0000000     00000    00000000   000   000  0000000       000     0000000   
# 000        000 000   000        000   000  000   000     000          000  
# 00000000  000   000  000         0000000   000   000     000     0000000   

module.exports =
    ranges: (line, ext) -> ranged blocks [line], ext
    dissected: (lines, ext) -> dissected blocks lines, ext
    
# 00000000   00000000    0000000   00000000  000  000      00000000  
# 000   000  000   000  000   000  000       000  000      000       
# 00000000   0000000    000   000  000000    000  000      0000000   
# 000        000   000  000   000  000       000  000      000       
# 000        000   000   0000000   000       000  0000000  00000000  

▸test 'profile'
    
    ▸profile '-----'
        
        text0 = slash.readText "#{__dirname}/../../koffee/coffee/nodes.coffee" # 6-11ms
        text1 = slash.readText "#{__dirname}/test.coffee" # 50-120μs
    
        lines0 = text0.split '\n'
        lines1 = text1.split '\n'

    for i in [0..3]
        blocks lines0
        # blocks lines1
        # lines0.map (l) -> Syntax.ranges l, 'coffee'
        
    for i in [0..15]
        
        ▸profile 'lines0'
            blocks lines0
        # ▸profile 'syntax0'
            # lines0.map (l) -> Syntax.ranges l, 'coffee'
            
        # ▸profile 'lines1'
            # blocks lines1
        # ▸profile 'syntax1'
            # lines1.map (l) -> Syntax.ranges l, 'coffee'
            
# 000000000  00000000   0000000  000000000  
#    000     000       000          000     
#    000     0000000   0000000      000     
#    000     000            000     000     
#    000     00000000  0000000      000     

▸test 'comment'

    require('kxk').chai()
    
    blocks(["##"]).should.eql [ext:'coffee' chars:2 index:0 number:1 chunks:[ 
                {column:0 length:1 string:"#" value:'punct comment' turd:"##"} 
                {column:1 length:1 string:"#" value:'comment'} 
                ]]

    blocks([",#a"]).should.eql [ext:'coffee' chars:3 index:0 number:1 chunks:[ 
                {column:0 length:1 string:"," value:'punct' turd: ",#"} 
                {column:1 length:1 string:"#" value:'punct comment'} 
                {column:2 length:1 string:"a" value:'comment'} 
                ]]
                
▸test 'function'

    blocks(['->']).should.eql [ext:'coffee' chars:2 index:0 number:1 chunks:[ 
                {column:0 length:1 string:'-' value:'punct function tail' turd: '->'} 
                {column:1 length:1 string:'>' value:'punct function head'} 
                ]]
    blocks(['=>']).should.eql [ext:'coffee' chars:2 index:0 number:1 chunks:[ 
                {column:0 length:1 string:'=' value:'punct function bound tail' turd: '=>'} 
                {column:1 length:1 string:'>' value:'punct function bound head'} 
                ]]
    blocks(['f=->1']).should.eql [ext:'coffee' chars:5 index:0 number:1 chunks:[ 
                {column:0 length:1 string:'f' value:'function'} 
                {column:1 length:1 string:'=' value:'punct'               turd:'=->' } 
                {column:2 length:1 string:'-' value:'punct function tail' turd:'->'} 
                {column:3 length:1 string:'>' value:'punct function head'} 
                {column:4 length:1 string:'1' value:'number'} 
                ]]
                
▸test 'minimal'
                
    blocks(['1']).should.eql [ext:'coffee' chars:1 index:0 number:1 chunks:[ {column:0 length:1 string:'1' value:'number'} ]]
    blocks(['a']).should.eql [ext:'coffee' chars:1 index:0 number:1 chunks:[ {column:0 length:1 string:'a' value:'text'} ]]
    blocks(['.']).should.eql [ext:'coffee' chars:1 index:0 number:1 chunks:[ {column:0 length:1 string:'.' value:'punct'} ]]

    blocks(['1.a']).should.eql [ext:'coffee' chars:3 index:0 number:1 chunks:[ 
                 {column:0  length:1 string:'1' value:'number'} 
                 {column:1  length:1 string:'.' value:'punct property'} 
                 {column:2  length:1 string:'a' value:'property'} 
                 ]]
                 
    blocks(['++a']).should.eql [ext:'coffee' chars:3 index:0 number:1 chunks:[ 
                 {column:0  length:1 string:'+' value:'punct', turd:'++'} 
                 {column:1  length:1 string:'+' value:'punct'} 
                 {column:2  length:1 string:'a' value:'text'} 
                 ]]
                 
    blocks(["▸doc 'hello'"]).should.eql [ext:'coffee' chars:12 index:0 number:1 chunks:[ 
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
    b[0].should.include.property 'ext' 'coffee'
    b[1].should.include.property 'ext' 'md'
    b[2].should.include.property 'ext' 'md'
    b[3].should.include.property 'ext' 'coffee'

    b = blocks """
        ▸doc 'hello'
            x  
            ```coffeescript
                1+1
            ```
            y
        1""".split '\n'
    b[0].should.include.property 'ext' 'coffee'
    b[1].should.include.property 'ext' 'md'
    b[2].should.include.property 'ext' 'md'
    b[3].should.include.property 'ext' 'coffee'
    b[4].should.include.property 'ext' 'md'
    b[5].should.include.property 'ext' 'md'
    b[6].should.include.property 'ext' 'coffee'

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
    b[0].should.include.property 'ext' 'coffee'
    b[1].should.include.property 'ext' 'md'
    b[2].should.include.property 'ext' 'md'
    b[3].should.include.property 'ext' 'coffee'
    b[4].should.include.property 'ext' 'coffee'
    b[5].should.include.property 'ext' 'md'
    b[6].should.include.property 'ext' 'md'
    b[7].should.include.property 'ext' 'md'
    b[8].should.include.property 'ext' 'coffee'
    
    b = blocks """
        ▸dooc 'hello'
            x  
        """.split '\n'
    b[0].should.include.property 'ext' 'coffee'
    b[1].should.include.property 'ext' 'coffee'

    b = blocks """
        ```coffeescript
            1+1
        ```
        ```javascript
            1+1;
        ```
        """.split('\n'), 'md'
    b[0].should.include.property 'ext' 'md'
    b[1].should.include.property 'ext' 'coffee'
    b[2].should.include.property 'ext' 'md'
    b[3].should.include.property 'ext' 'md'
    b[4].should.include.property 'ext' 'js'
    
