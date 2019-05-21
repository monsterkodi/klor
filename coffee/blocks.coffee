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
HEADER = /^0+$/
PUNCT  = /\W+/gi
NUMBER = /^\d+$/
FLOAT  = /^\d+f$/
HEXNUM = /^0x[a-fA-F\d]+$/

codeTypes = ['interpolation' 'code triple']

#  0000000  000   000  000   000  000   000  000   000  00000000  0000000    
# 000       000   000  000   000  0000  000  000  000   000       000   000  
# 000       000000000  000   000  000 0 000  0000000    0000000   000   000  
# 000       000   000  000   000  000  0000  000  000   000       000   000  
#  0000000  000   000   0000000   000   000  000   000  00000000  0000000    

chunked = (lines, ext) ->    

    ▸doc 'chunked *lines*, *ext*'
                        
        **returns** array of
            
            chunks: [
                        match: s
                        value:  s
                        start: n
                        length: n
                    ]
            ext:    s
            chars:  n
            index:  n
            number: n+1
        
    lineno = 0
    lines.map (text) -> 
        
        line = 
            chunks: []
            chars:  0
            index:  lineno++
            number: lineno
            ext:    ext

        chunks = kstr.replaceTabs(text).split SPACE
        
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
                        line.chunks.push start:c, length:wl, match:w, value:'text'
                        c += wl
                        
                    turd = punct = m[0]
                    for pc in punct[...-1]
                        line.chunks.push start:c++, length:1, match:pc, turd:turd, value:'punct'
                        turd = turd[1..]
                    line.chunks.push start:c++, length:1, match:punct[-1], value:'punct'
                                        
                if c < sc+l        # check for remaining non-punct
                    rl = sc+l-c    # length of remainder
                    w = s[l-rl..]  # text   of remainder 
                    line.chunks.push start:c, length:rl, match:w, value:'text'
                    c += rl
                    
        if line.chunks.length
            last = line.chunks[-1]
            line.chars = last.start + last.length
            
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
    notCode    = false # shortcut for top of stack not in codeTypes
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
        
        return if stackTop
        
        if chunk.match == "#"
            chunk.value += ' comment'
            if chunkIndex < line.chunks.length-1
                for c in line.chunks[chunkIndex+1..]
                    c.value = 'comment'
                    if HEADER.test c.match
                        c.value += ' header'
            return line.chunks.length - chunkIndex + 1

    noonComment = -> 
        
        return if stackTop
        
        if chunk.match == "#" and chunkIndex == 0 # the only difference. merge with hashComment?
            chunk.value += ' comment'
            if chunkIndex < line.chunks.length-1
                for c in line.chunks[chunkIndex+1..]
                    c.value = 'comment'
            return line.chunks.length - chunkIndex + 1
        
    slashComment = ->
    
    blockComment = -> 
        
        return if not chunk.turd or chunk.turd.length < 3
        
        type = 'comment triple' 
        
        return if topType and topType not in ['interpolation', type]
        
        if chunk.turd[..2] == '###'
            if topType == type
                popStack()
            else
                pushStack type:type, strong:true
                
            addValue 0, type
            addValue 1, type
            addValue 2, type
            return 3            
                
    #  0000000   00000000   00000000    0000000   000   000  
    # 000   000  000   000  000   000  000   000  000 0 000  
    # 000000000  0000000    0000000    000   000  000000000  
    # 000   000  000   000  000   000  000   000  000   000  
    # 000   000  000   000  000   000   0000000   00     00  
    
    dashArrow = ->

        return if notCode
        
        markFunc = ->
            if line.chunks[0].value == 'text' 
                if line.chunks[1].match == '='
                    line.chunks[0].value = 'function'
                    line.chunks[1].value += ' function'
                else if line.chunks[1].match == ':'
                    line.chunks[0].value = 'method'
                    line.chunks[1].value += ' method'
        
        if chunk.turd == '->'
            markFunc()
            addValue 0, 'function tail'
            addValue 1, 'function head'
            if line.chunks[0].value == 'dictionary key' or line.chunks[0].turd == '@:'
                line.chunks[0].value = 'method'
                line.chunks[1].value = 'punct method'
            return 2
                
        if chunk.turd == '=>'
            markFunc()
            addValue 0, 'function bound tail'
            addValue 1, 'function bound head'
            if line.chunks[0].value == 'dictionary key'
                line.chunks[0].value = 'method'
                line.chunks[1].value = 'punct method'
            return 2
              
    commentHeader = ->
        
        if topType == 'comment triple'
            if HEADER.test chunk.match
                chunk.value = 'comment triple header'
                return 1
                    
    #  0000000   0000000   00000000  00000000  00000000  00000000  
    # 000       000   000  000       000       000       000       
    # 000       000   000  000000    000000    0000000   0000000   
    # 000       000   000  000       000       000       000       
    #  0000000   0000000   000       000       00000000  00000000  
    
    coffeeFunc = ->        

        return if notCode
                
        if chunk.match == '▸'  
            addValue 0, 'meta'
            return 1
            
        if chunk.turd == '~>'
            addValue 0, 'meta'
            addValue 1, 'meta'
            return 2
        
        if prev = getChunk -1
        
            if prev.match in ['class', 'extends']
                setValue 0, 'class'
                return 1
            
            if prev.value == 'punct meta'
                if chunk.start == prev.start+1
                    setValue 0, 'meta'
                    return 0 # give switch a chance
            
            return 1 if chunk.value.startsWith 'keyword' # we are done with the keyword
            
            if prev.value == 'text'
                if chunk.match == '(' and prev.start+prev.length == chunk.start
                    setValue -1, 'function call'
                else if prev.start+prev.length < chunk.start # spaced
                    if chunk.match not in '=]})/%;,.'
                        setValue -1, 'function call' 
        0 # we need this here
    
    property = ->
            
        return if notCode
        
        if getmatch(-1) == '.'
            addValue -1, 'property'
            setValue 0, 'property'
            if prevPrev = getChunk -2
                if prevPrev.value not in ['property', 'number', 'punct']
                    setValue -2, 'obj'
            return 1
        
    jsFunc = ->
        
        if chunk.value == 'keyword function'
            if getmatch(-1) == '=' and getValue(-2).startsWith 'text'
                setValue -2, 'function'
        0 # we need this here
        
    dict = ->
        
        return if notCode
        
        if chunk.match == ':' and not chunk.turd?.startsWith '::'
            if prev = getChunk -1
                if prev.value.split(' ')[0] in ['string', 'number', 'text', 'keyword']
                    setValue -1, 'dictionary key'
                    setValue  0, 'punct dictionary'
                    return 1
        
    # 00000000   00000000   0000000   00000000  000   000  00000000   
    # 000   000  000       000        000        000 000   000   000  
    # 0000000    0000000   000  0000  0000000     00000    00000000   
    # 000   000  000       000   000  000        000 000   000        
    # 000   000  00000000   0000000   00000000  000   000  000        
    
    regexp = ->
        
        return if topType?.startsWith 'string'

        if chunk.match == '/'
            
            if topType == 'regexp'
                chunk.value += ' regexp end'
                popStack()
                return 1
                
            if chunkIndex 
                prev = getChunk -1
                next = getChunk +1
                if not prev.value.startsWith 'punct'
                    return if (prev.start+prev.length <  chunk.start) and next?.start >  chunk.start+1
                    return if (prev.start+prev.length == chunk.start) and next?.start == chunk.start+1
  
            pushStack type:'regexp'
            chunk.value += ' regexp start'
            return 1
        
    #  0000000  000000000  00000000   000  000   000   0000000   
    # 000          000     000   000  000  0000  000  000        
    # 0000000      000     0000000    000  000 0 000  000  0000  
    #      000     000     000   000  000  000  0000  000   000  
    # 0000000      000     000   000  000  000   000   0000000   
    
    simpleString = ->
        
        return if topType == 'regexp'
                
        if getChunk(-1)?.escape then return stacked()
        
        if chunk.match in '"\'`'
            
            type = switch chunk.match 
                when '"' then 'string double' 
                when "'" then 'string single'
                when '`' then 'string backtick'
                
            if topType == type
                chunk.value += ' ' + type
                popStack()
                return 1
            else if notCode
                return stacked()
                
            pushStack type:type, strong:true
            chunk.value += ' ' + type
            return 1
            
        if chunk.match == '\\' and topType?.startsWith 'string'
            if chunkIndex == 0 or not getChunk(-1).escape
                if getChunk(1).start == chunk.start+1
                    chunk.escape = true
                    return stacked()
                        
    tripleString = -> 
        
        return if not chunk.turd or chunk.turd.length < 3
        return if topType in ['regexp', 'string single', 'string double']
        
        if getChunk(-1)?.escape then return stacked()
                
        type = switch chunk.turd[..2]
            when '"""' then 'string double triple' 
            when "'''" then 'string single triple'
            # when '```' then 'string backtick triple'

        if type
            
            return if type != topType and topType?.startsWith 'string'
            
            if topType == type
                popStack()
            else
                pushStack type:type, strong:true
                
            addValue 0, type
            addValue 1, type
            addValue 2, type
            return 3
            
        if chunk.match == '\\' and topType?.startsWith 'string'
            if chunkIndex == 0 or not line.chunks[chunkIndex-1].escape
                if getChunk(1).start == chunk.start+1
                    chunk.escape = true
                    return stacked()
        
    # 00     00  0000000         0000000  000000000  00000000   000  000   000   0000000   
    # 000   000  000   000      000          000     000   000  000  0000  000  000        
    # 000000000  000   000      0000000      000     0000000    000  000 0 000  000  0000  
    # 000 0 000  000   000           000     000     000   000  000  000  0000  000   000  
    # 000   000  0000000        0000000      000     000   000  000  000   000   0000000   
    
    mdString = ->
        
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
            
        if chunk.match == '*'
            
            type = 'italic'
            if topType?.endsWith type
                addValue 0, topType
                popStack()
                return 1

            type = stackTop.type + ' ' + type if stackTop?.merge
            pushStack merge:true, type:type
            addValue 0, type
            return 1
                      
        if chunk.match == '`'
          
            if chunk.turd?[..2] == '```'
    
                # type = 'string backtick triple'
                type = 'code triple'
    
                if topType == type
                    popStack()
                else
                    pushStack type:type, weak:true
                    
                addValue 0, type
                addValue 1, type
                addValue 2, type
                return 3
            
            type = 'code'
            if topType?.endsWith type
                addValue 0, topType
                popStack()
                return 1
                
            type = stackTop.type + ' ' + type if stackTop?.merge
            # pushStack merge:true, type:type
            pushStack merge:true, type:type
            addValue 0, type
            return 1
                    
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
            
            if chunk.match == '}'
                addValue 0, 'match interpolation end'
                popStack()
                return 1
        
    # 000   000  00000000  000   000  000   000   0000000   00000000   0000000    
    # 000  000   000        000 000   000 0 000  000   000  000   000  000   000  
    # 0000000    0000000     00000    000000000  000   000  0000000    000   000  
    # 000  000   000          000     000   000  000   000  000   000  000   000  
    # 000   000  00000000     000     00     00   0000000   000   000  0000000    
    
    keyword = ->
        
        return if notCode
        
        if Syntax.lang[ext].hasOwnProperty(chunk.match) 
            chunk.value = Syntax.lang[ext][chunk.match]
            return 0 # give coffeeFunc a chance, number bails for us
                
    # 000   000  000   000  00     00  0000000    00000000  00000000   
    # 0000  000  000   000  000   000  000   000  000       000   000  
    # 000 0 000  000   000  000000000  0000000    0000000   0000000    
    # 000  0000  000   000  000 0 000  000   000  000       000   000  
    # 000   000   0000000   000   000  0000000    00000000  000   000  
    
    number = ->
        
        return 1 if chunk.value != 'text'
        return if notCode
        
        if NUMBER.test chunk.match
            
            if getmatch(-1) == '.'

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
            
        if HEXNUM.test chunk.match
            
            chunk.value = 'number hex'
            return 1
        
    # 00000000  000       0000000    0000000   000000000  
    # 000       000      000   000  000   000     000     
    # 000000    000      000   000  000000000     000     
    # 000       000      000   000  000   000     000     
    # 000       0000000   0000000   000   000     000     
    
    float = ->
        
        if FLOAT.test chunk.match
            if getmatch(-1) == '.'

                if getValue(-2) == 'number'
                    setValue -2, 'number float'
                    addValue -1, 'number float'
                    setValue  0, 'number float'
                    return 1

            chunk.value = 'number float'
            return 1
        
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
            
        if chunk.match in ['<''>']
            addValue 0, 'keyword'
            return 1
            
    #  0000000  00000000   00000000   
    # 000       000   000  000   000  
    # 000       00000000   00000000   
    # 000       000        000        
    #  0000000  000        000        
    
    cppMacro = -> 
        
        if chunk.match == "#"
            addValue 0, 'define'
            setValue 1, 'define'
            return 2

    #  0000000  000   000
    # 000       000   000
    # 0000000   000000000
    #      000  000   000
    # 0000000   000   000
    
    shPunct = ->
        
        if chunk.match == '/' and getChunk(-1)?.start + getChunk(-1)?.length == chunk.start
            addValue -1, 'dir'
            return 1
        
        if chunk.turd == '--' and getChunk(2)?.start == chunk.start+2
            addValue 0, 'argument'
            addValue 1, 'argument'
            setValue 2, 'argument'
            return 3
            
        if chunk.match == '-' and getChunk(1)?.start == chunk.start+1
            addValue 0, 'argument'
            setValue 1, 'argument'
            return 2
                 
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
       
    pushExt = (mtch) ->
        extTop = switch:mtch, start:line, stack:stack
        extStack.push extTop
        
    actExt = ->
        stack    = []
        stackTop = null
        topType  = ''
        notCode  = false
        
    popExt = ->
        stack = extTop.stack
        line.ext = extTop.start.ext
        extStack.pop()               
        extTop = extStack[-1]
        
        stackTop = stack[-1]
        topType = stackTop?.type
        notCode = stackTop and topType not in codeTypes
        
    pushStack = (o) -> 
        stack.push o 
        stackTop = o
        topType = o.type
        notCode = topType not in codeTypes
        
    popStack = -> 
        stack.pop()
        stackTop = stack[-1]
        topType = stackTop?.type
        notCode = stackTop and topType not in codeTypes
        
    getChunk  = (d) -> line.chunks[chunkIndex+d]
    setValue  = (d, value) -> if 0 <= chunkIndex+d < line.chunks.length then line.chunks[chunkIndex+d].value = value
    addValue  = (d, value) -> if 0 <= chunkIndex+d < line.chunks.length then line.chunks[chunkIndex+d].value += ' ' + value
    getValue  = (d) -> getChunk(d)?.value ? ''
    getmatch = (d) -> getChunk(d)?.match ? ''
        
    # 000   000   0000000   000   000  0000000    000      00000000  00000000    0000000  
    # 000   000  000   000  0000  000  000   000  000      000       000   000  000       
    # 000000000  000000000  000 0 000  000   000  000      0000000   0000000    0000000   
    # 000   000  000   000  000  0000  000   000  000      000       000   000       000  
    # 000   000  000   000  000   000  0000000    0000000  00000000  000   000  0000000   
    
    handlers = 
        coffee: 
                punct: [ blockComment, hashComment, coffeeFunc, tripleString, simpleString, interpolation, dashArrow, regexp, dict, stacked ]
                word:  [ keyword, coffeeFunc, commentHeader, number, property, stacked ]
        noon:   punct: [ noonComment,                                   stacked ], word: [keyword, number,           stacked]
        json:   punct: [               simpleString, dict,              stacked ], word: [keyword, number,           stacked]
        js:     punct: [ slashComment, simpleString, dashArrow, regexp, stacked ], word: [keyword, jsFunc, number,   stacked]
        ts:     punct: [ slashComment, simpleString, dashArrow, regexp, stacked ], word: [keyword, jsFunc, number,   stacked]
        md:     punct: [                   mdString, xmlPunct,          stacked ], word: [         number,           stacked]
        iss:    punct: [ slashComment, simpleString,                    stacked ], word: [keyword, number,           stacked]
        ini:    punct: [ slashComment, simpleString, cppMacro,          stacked ], word: [         number,           stacked]
        cpp:    punct: [ slashComment, simpleString, cppMacro,          stacked ], word: [keyword, number, float,    stacked]
        hpp:    punct: [ slashComment, simpleString, cppMacro,          stacked ], word: [keyword, number, float,    stacked]
        c:      punct: [ slashComment, simpleString, cppMacro,          stacked ], word: [keyword, number, float,    stacked]
        h:      punct: [ slashComment, simpleString, cppMacro,          stacked ], word: [keyword, number, float,    stacked]
        sh:     punct: [ hashComment,  simpleString, shPunct,           stacked ], word: [keyword, number,           stacked]
        cs:     punct: [ slashComment, simpleString,                    stacked ], word: [keyword, number,           stacked]
        pug:    punct: [ slashComment, simpleString,                    stacked ], word: [keyword, number,           stacked]
        svg:    punct: [               simpleString, xmlPunct,          stacked ], word: [keyword, number,           stacked]
        html:   punct: [               simpleString, xmlPunct,          stacked ], word: [keyword, number,           stacked]
        htm:    punct: [               simpleString, xmlPunct,          stacked ], word: [keyword, number,           stacked]
        styl:   punct: [ slashComment, simpleString,                    stacked ], word: [keyword, number,           stacked]
        css:    punct: [ slashComment, simpleString,                    stacked ], word: [keyword, number,           stacked]
        sass:   punct: [ slashComment, simpleString,                    stacked ], word: [keyword, number,           stacked]
        scss:   punct: [ slashComment, simpleString,                    stacked ], word: [keyword, number,           stacked]
        log:    punct: [ slashComment, simpleString,                    stacked ], word: [         number,           stacked]
        txt:    punct: [ slashComment, simpleString,                    stacked ], word: [         number,           stacked]
                        
    # 000      000  000   000  00000000  000       0000000    0000000   00000000   
    # 000      000  0000  000  000       000      000   000  000   000  000   000  
    # 000      000  000 0 000  0000000   000      000   000  000   000  00000000   
    # 000      000  000  0000  000       000      000   000  000   000  000        
    # 0000000  000  000   000  00000000  0000000   0000000    0000000   000        
    
    for line in lines
           
        if extTop
            if extTop.switch.indent and line.chunks[0]?.start <= extTop.start.chunks[0].start
                popExt()                        # end of extension block reached that is terminated by indentation
            else
                line.ext = extTop.switch.to     # make sure the current line ext matches the topmost from stack
                
        if ext != line.ext                      # either at start of file or we switched extension
            actExt()
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
                
                if not notCode
                    if mtch = Syntax.swtch[line.ext]?[chunk.match] 
                        if mtch.turd
                            turdChunk = getChunk -mtch.turd.length
                            if mtch.turd == (turdChunk?.turd ? turdChunk?.match)
                                # push a new extension onto the stack, ext will change on start of next line
                                pushExt mtch
                
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
                start: chunk.start
                match: chunk.match
                value: chunk.value
            rngs.push range
    rngs

# 0000000    000   0000000   0000000  00000000   0000000  000000000  
# 000   000  000  000       000       000       000          000     
# 000   000  000  0000000   0000000   0000000   000          000     
# 000   000  000       000       000  000       000          000     
# 0000000    000  0000000   0000000   00000000   0000000     000     

dissect = (lines) ->
    
    diss = []
    for line in lines
        d = []
        for chunk in line.chunks
            range =
                start: chunk.start
                match: chunk.match
                value: chunk.value
            d.push range
        diss.push d
    diss
        
# 00000000  000   000  00000000    0000000   00000000   000000000   0000000  
# 000        000 000   000   000  000   000  000   000     000     000       
# 0000000     00000    00000000   000   000  0000000       000     0000000   
# 000        000 000   000        000   000  000   000     000          000  
# 00000000  000   000  000         0000000   000   000     000     0000000   

module.exports =
    blocks:  blocks
    ranges:  (line, ext)  -> ranged blocks [line], ext
    dissect: (lines, ext) -> dissect blocks lines, ext
    
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

    for i in [0..5]
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
            
###
000000000  00000000   0000000  000000000  
   000     000       000          000     
   000     0000000   0000000      000     
   000     000            000     000     
   000     00000000  0000000      000     
###

▸test 'test'

    require('kxk').chai()    

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
        