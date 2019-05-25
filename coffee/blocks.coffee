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
        coffeescript: turd:'```' to:'coffee' end:'```' add:'code triple'
        javascript:   turd:'```' to:'js'     end:'```' add:'code triple'
        js:           turd:'```' to:'js'     end:'```' add:'code triple'
            
SPACE  = /\s/
HEADER = /^0+$/
PUNCT  = /\W+/g
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
                        turd:   s
                        match:  s
                        value:  s
                        start:  n
                        length: n
                    ]
            ext:    s
            chars:  n
            index:  n
            number: n+1
        
    ext = 'coffee' if ext == 'koffee'
            
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
                    # for pc in punct[...-1]
                    pi = 0
                    while pi < punct.length-1
                        pc = punct[pi]
                        
                        if 0xD800 <= punct.charCodeAt(pi) <= 0xDBFF and 0xDC00 <= punct.charCodeAt(pi+1) <= 0xDFFF
                            pc += punct[pi+1]

                            if turd.length
                                line.chunks.push start:c, length:2, match:pc, turd:turd, value:'punct'
                            else
                                line.chunks.push start:c, length:2, match:pc, value:'punct'
                            turd = turd[2..]
                            c  += 2
                            pi += 2
                            continue
                        pi += 1
                                
                        line.chunks.push start:c, length:1, match:pc, turd:turd, value:'punct'
                        c += 1
                        turd = turd[1..]
                        
                    if pi < punct.length
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

    fillComment = (n) ->
        
        for i in [0...n]
            addValue i, 'comment'
        if chunkIndex < line.chunks.length-n
            restChunks = line.chunks[chunkIndex+n..]
            mightBeHeader = true
            for c in restChunks
                c.value = 'comment'
                if mightBeHeader and not HEADER.test c.match
                    mightBeHeader = false
            if mightBeHeader
                for c in restChunks
                    c.value += ' header'
        return line.chunks.length - chunkIndex + n
        
    hashComment = -> 
        
        return if stackTop and topType != 'regexp triple'
        if stackTop and stackTop.lineno == line.number
            return # comments inside triple regexp only valid on internal lines?
        
        if chunk.match == "#"
            fillComment 1

    noonComment = -> 
        
        return if stackTop
        
        if chunk.match == "#" and chunkIndex == 0
            fillComment 1
        
    slashComment = ->

        return if stackTop
        
        if chunk.turd == "//"
            fillComment 2
        
    blockComment = -> 
        
        return if not chunk.turd or chunk.turd.length < 3
        
        type = 'comment triple'
        
        return if topType and topType not in ['interpolation', type]
        
        if chunk.turd[..2] == '###'
            if topType == type
                popStack()
            else
                pushStack type:type, strong:true
            return addValues 3 type            

    starComment = -> 
        
        return if not chunk.turd
        
        type = 'comment triple'
        
        return if topType and topType != type
        
        if chunk.turd[..1] == '/*' and not topType 
            pushStack type:type, strong:true                
            return addValues 2 type
        if chunk.turd[..1] == '*/' and topType == type
            popStack()
            return addValues 2 type
            
    #  0000000   00000000   00000000    0000000   000   000  
    # 000   000  000   000  000   000  000   000  000 0 000  
    # 000000000  0000000    0000000    000   000  000000000  
    # 000   000  000   000  000   000  000   000  000   000  
    # 000   000  000   000  000   000   0000000   00     00  
    
    dashArrow = ->

        return if notCode
        
        markFunc = ->
            if line.chunks[0].value == 'text' 
                if line.chunks[1].match == '=' and line.chunks[2].match != '>'
                    line.chunks[0].value = 'function'
                    line.chunks[1].value += ' function'
                else if line.chunks[1].match == ':'
                    line.chunks[0].value = 'method'
                    line.chunks[1].value += ' method'
        
        if chunk.turd
            
            if chunk.turd.startsWith '->'
                markFunc()
                addValue 0 'function tail'
                addValue 1 'function head'
                if line.chunks[0].value == 'dictionary key' or line.chunks[0].turd?[..1] == '@:'
                    line.chunks[0].value = 'method'
                    line.chunks[1].value = 'punct method'
                else if line.chunks[0].match == '@' and line.chunks[1].value == 'dictionary key'
                    line.chunks[0].value = 'punct method class'
                    line.chunks[1].value = 'method class'
                    line.chunks[2].value = 'punct method class'
                return 2
                    
            if chunk.turd.startsWith '=>'
                markFunc()
                addValue 0 'function bound tail'
                addValue 1 'function bound head'
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
    
    thisCall = ->
        
        setValue -1 'function call'
        if getmatch(-2) == '@'
            setValue -2 'punct function call'
        0
    
    coffeePunct = ->

        return if notCode
                
        if chunk.match == '▸'
            return addValue 0 'meta'
            
        if chunk.turd == '~>'
            return addValues 2 'meta'
            
        if prev = getChunk -1
            
            if chunk.turd?.startsWith('..') and prev.match != '.'
                if chunk.turd[2] != '.'
                    return addValues 2 'range'
                if chunk.turd[3] != '.'
                    return addValues 3 'range'
                    
            if prev.value.startsWith('text') or prev.value == 'property'
                                
                prevEnd = prev.start+prev.length
                if chunk.match == '(' and prevEnd == chunk.start
                    return thisCall()
                else if prevEnd < chunk.start # spaced
                    if chunk.match in '@[({"\''
                        return thisCall()
                    else if chunk.match in '+-/' 
                        next = getChunk 1
                        if not next or next.match != '=' and next.start == chunk.start+1
                            return thisCall()

    coffeeWord = ->
        
        return if notCode
        
        if prev = getChunk -1
                            
            if prev.value == 'punct meta'
                if chunk.start == prev.start+1
                    setValue 0 'meta'
                    return 0 # give switch a chance
            
            if prev.match in ['class', 'extends']
                setValue 0 'class'
                return 1
                        
            if chunk.value.startsWith 'keyword' 
                                
                return 1 # we are done with the keyword
                
            if prev.match == '@'
                addValue -1 'this'
                addValue  0 'this'
                return 1
                
            if prev.value.startsWith('text') and prev.start+prev.length < chunk.start # spaced
                return thisCall()
                                
    property = ->
            
        return if notCode
        
        if getmatch(-1) == '.'
            prevPrev = getChunk -2
            if prevPrev?.match != '.'
                addValue -1 'property'
                setValue 0 'property'
                if prevPrev
                    if prevPrev.value not in ['property', 'number'] and not prevPrev.value.startsWith 'punct'
                        setValue -2 'obj'
                return 1
        
    jsFunc = ->
        
        if chunk.value == 'keyword function'
            if getmatch(-1) == '=' and getValue(-2).startsWith 'text'
                setValue -2 'function'
        0 # we need this here
        
    dict = ->
        
        return if notCode
        
        if chunk.match == ':' and not chunk.turd?.startsWith '::'
            if prev = getChunk -1
                if prev.value.split(' ')[0] in ['string', 'number', 'text', 'keyword']
                    setValue -1 'dictionary key'
                    setValue  0 'punct dictionary'
                    return 1
        
    # 00000000   00000000   0000000   00000000  000   000  00000000   
    # 000   000  000       000        000        000 000   000   000  
    # 0000000    0000000   000  0000  0000000     00000    00000000   
    # 000   000  000       000   000  000        000 000   000        
    # 000   000  00000000   0000000   00000000  000   000  000        
    
    escape = ->
        
        if chunk.match == '\\' and (topType?.startsWith('regexp') or topType?.startsWith 'string')
            if chunkIndex == 0 or not getChunk(-1)?.escape
                if getChunk(1)?.start == chunk.start+1
                    chunk.escape = true
                    addValue 0 'escape'
                    return stacked()
    
    regexp = ->
        
        return if topType?.startsWith 'string'

        if getChunk(-1)?.escape then return stacked()
        
        if chunk.match == '/'
            
            if topType == 'regexp'
                chunk.value += ' regexp end'
                popStack()
                return 1
                
            if chunkIndex 
                prev = getChunk -1
                next = getChunk +1
                if not prev.value.startsWith('punct') or prev.match in ")]"
                    return if (prev.start+prev.length <  chunk.start) and next?.start >  chunk.start+1
                    return if (prev.start+prev.length == chunk.start) and next?.start == chunk.start+1
  
                return if next?.match == '='
                return if prev.value.startsWith 'number'
                    
            pushStack type:'regexp'
            return addValue 0 'regexp start'
            
        escape()
        
    tripleRegexp = -> 
        
        return if not chunk.turd or chunk.turd.length < 3
        
        type = 'regexp triple'
        
        return if topType and topType not in ['interpolation', type]
        if chunk.turd[..2] == '///'
            if topType == type
                popStack()
            else
                pushStack type:type, lineno:line.number
            return addValues 3 type   
            
    #  0000000  000000000  00000000   000  000   000   0000000   
    # 000          000     000   000  000  0000  000  000        
    # 0000000      000     0000000    000  000 0 000  000  0000  
    #      000     000     000   000  000  000  0000  000   000  
    # 0000000      000     000   000  000  000   000   0000000   
        
    simpleString = ->
        
        return if topType == 'regexp'
                
        if getChunk(-1)?.escape then return stacked()
        
        if chunk.match in '"\''
            
            type = switch chunk.match 
                when '"' then 'string double' 
                when "'" then 'string single'
                
            if topType == type
                addValue 0 type
                popStack()
                return 1
            else if notCode
                return stacked()
                
            pushStack strong:true type:type
            addValue 0 type
            return 1
            
        escape()
                        
    tripleString = -> 
        
        return if not chunk.turd or chunk.turd.length < 3
        return if topType in ['regexp''string single''string double']
        
        if getChunk(-1)?.escape then return stacked()
                
        type = switch chunk.turd[..2]
            when '"""' then 'string double triple' 
            when "'''" then 'string single triple'

        if type
            
            return if type != topType and topType?.startsWith 'string'
            
            if topType == type
                popStack()
            else
                pushStack strong:true type:type
                
            return addValues 3 type
            
        escape()
        
    # 00     00  0000000  
    # 000   000  000   000
    # 000000000  000   000
    # 000 0 000  000   000
    # 000   000  0000000  
    
    mdPunct = ->
        
        if chunkIndex == 0 
            
            if not chunk.turd and chunk.match in '-*' and getChunk(1)?.start > chunk.start+1
                type = ['li1''li2''li3'][chunk.start/4]
                pushStack merge:true fill:true type:type
                return addValue 0 type + ' marker'
                
            if chunk.match == '#'
                if not chunk.turd
                    pushStack merge:true fill:true type:'h1'
                    return addValue 0 'h1'
                switch chunk.turd
                    when '##' 
                        pushStack merge:true fill:true type:'h2'
                        return addValues 2 'h2'
                    when '###' 
                        pushStack merge:true fill:true type:'h3'
                        return addValues 3 'h3'
                    when '####' 
                        pushStack merge:true fill:true type:'h4'
                        return addValues 4 'h4'
                    when '#####' 
                        pushStack merge:true fill:true type:'h5'
                        return addValues 5 'h5'
        
        if chunk.match == '*'
            
            if chunk.turd?[..1] == '**'
                
                type = 'bold'
                if topType?.endsWith type
                    addValues 2 topType
                    popStack()
                    return 2
    
                type = stackTop.type + ' ' + type if stackTop?.merge
                pushStack merge:true type:type
                return addValues 2 type
            
            type = 'italic'
            if topType?.endsWith type
                addValue 0 topType
                popStack()
                return 1

            type = stackTop.type + ' ' + type if stackTop?.merge
            pushStack merge:true type:type
            addValue 0 type
            return 1
                      
        if chunk.match == '`'
          
            if chunk.turd?[..2] == '```'
    
                type = 'code triple'
    
                if getmatch(3) in ['coffeescript''javascript''js']
                    setValue 3 'comment'
                    return addValues 3 type
                    
                pushStack weak:true type:type
                return addValues 3 type
            
            type = 'code'
            if topType?.endsWith type
                addValue 0 topType
                popStack()
                return 1
                
            type = stackTop.type + ' ' + type if stackTop?.merge

            pushStack merge:true type:type
            return addValue 0 type
                                
    # 000  000   000  000000000  00000000  00000000   00000000    0000000   000     
    # 000  0000  000     000     000       000   000  000   000  000   000  000     
    # 000  000 0 000     000     0000000   0000000    00000000   000   000  000     
    # 000  000  0000     000     000       000   000  000        000   000  000     
    # 000  000   000     000     00000000  000   000  000         0000000   0000000 
    
    interpolation = ->
        
        if topType == 'string double'
        
            if chunk.turd?.startsWith "\#{"
                pushStack type:'interpolation', weak:true
                return addValues 2 'string interpolation start'
                
        else if topType == 'interpolation'
            
            if chunk.match == '}'
                addValue 0 'string interpolation end'
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
                    setValue -4 'semver'
                    setValue -3 'punct semver'
                    setValue -2 'semver'
                    setValue -1 'punct semver'
                    setValue  0 'semver'
                    return 1

                if getValue(-2) == 'number'
                    setValue -2 'number float'
                    addValue -1 'number float'
                    setValue  0 'number float'
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
                    setValue -2 'number float'
                    addValue -1 'number float'
                    setValue  0 'number float'
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
            return addValues 2 'keyword'
            
        if chunk.match in ['<''>']
            return addValue 0 'keyword'
            
    #  0000000  00000000   00000000   
    # 000       000   000  000   000  
    # 000       00000000   00000000   
    # 000       000        000        
    #  0000000  000        000        
    
    cppMacro = -> 
        
        if chunk.match == "#"
            addValue 0 'define'
            setValue 1 'define'
            return 2

    #  0000000  000   000
    # 000       000   000
    # 0000000   000000000
    #      000  000   000
    # 0000000   000   000
    
    shPunct = ->
        
        if chunk.match == '/' and getChunk(-1)?.start + getChunk(-1)?.length == chunk.start
            return addValue -1 'dir'
        
        if chunk.turd == '--' and getChunk(2)?.start == chunk.start+2
            addValue 0 'argument'
            addValue 1 'argument'
            setValue 2 'argument'
            return 3
            
        if chunk.match == '-' and getChunk(1)?.start == chunk.start+1
            addValue 0 'argument'
            setValue 1 'argument'
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
    getValue  = (d) -> getChunk(d)?.value ? ''
    getmatch  = (d) -> getChunk(d)?.match ? ''
    addValue  = (d, value) -> 
        if 0 <= chunkIndex+d < line.chunks.length 
            line.chunks[chunkIndex+d].value += ' ' + value
        1
        
    addValues = (n,value) ->    
        for i in [0...n]
            addValue i, value
        n
        
    # 000   000   0000000   000   000  0000000    000      00000000  00000000    0000000  
    # 000   000  000   000  0000  000  000   000  000      000       000   000  000       
    # 000000000  000000000  000 0 000  000   000  000      0000000   0000000    0000000   
    # 000   000  000   000  000  0000  000   000  000      000       000   000       000  
    # 000   000  000   000  000   000  0000000    0000000  00000000  000   000  0000000   
    
    handlers = 
        coffee: 
                punct:[ blockComment, hashComment, tripleRegexp, coffeePunct, tripleString, simpleString, interpolation, dashArrow, regexp, dict, stacked ]
                word: [ keyword, coffeeWord, number, property, stacked ]
        noon:   punct:[ noonComment,                                                 stacked ], word:[ keyword, number,         stacked ]
        js:     punct:[ starComment,  slashComment, simpleString, dashArrow, regexp, stacked ], word:[ keyword, jsFunc, number, stacked ]
        ts:     punct:[ starComment,  slashComment, simpleString, dashArrow, regexp, stacked ], word:[ keyword, jsFunc, number, stacked ]
        iss:    punct:[ starComment,  slashComment, simpleString,                    stacked ], word:[ keyword, number,         stacked ]
        ini:    punct:[ starComment,  slashComment, simpleString, cppMacro,          stacked ], word:[          number,         stacked ]
        cpp:    punct:[ starComment,  slashComment, simpleString, cppMacro,          stacked ], word:[ keyword, number, float,  stacked ]
        hpp:    punct:[ starComment,  slashComment, simpleString, cppMacro,          stacked ], word:[ keyword, number, float,  stacked ]
        c:      punct:[ starComment,  slashComment, simpleString, cppMacro,          stacked ], word:[ keyword, number, float,  stacked ]
        h:      punct:[ starComment,  slashComment, simpleString, cppMacro,          stacked ], word:[ keyword, number, float,  stacked ]
        cs:     punct:[ starComment,  slashComment, simpleString,                    stacked ], word:[ keyword, number,         stacked ]
        pug:    punct:[ starComment,  slashComment, simpleString,                    stacked ], word:[ keyword, number,         stacked ]
        styl:   punct:[ starComment,  slashComment, simpleString,                    stacked ], word:[ keyword, number,         stacked ]
        css:    punct:[ starComment,  slashComment, simpleString,                    stacked ], word:[ keyword, number,         stacked ]
        sass:   punct:[ starComment,  slashComment, simpleString,                    stacked ], word:[ keyword, number,         stacked ]
        scss:   punct:[ starComment,  slashComment, simpleString,                    stacked ], word:[ keyword, number,         stacked ]
        svg:    punct:[               simpleString, xmlPunct,                        stacked ], word:[ keyword, number,         stacked ]
        html:   punct:[               simpleString, xmlPunct,                        stacked ], word:[ keyword, number,         stacked ]
        htm:    punct:[               simpleString, xmlPunct,                        stacked ], word:[ keyword, number,         stacked ]
        sh:     punct:[ hashComment,  simpleString, shPunct,                         stacked ], word:[ keyword, number,         stacked ]
        json:   punct:[               simpleString, dict,                            stacked ], word:[ keyword, number,         stacked ]
        md:     punct:[                    mdPunct, xmlPunct,                        stacked ], word:[          number,         stacked ]
        log:    punct:[                             simpleString,                    stacked ], word:[          number,         stacked ]
        txt:    punct:[                             simpleString,                    stacked ], word:[          number,         stacked ]
                        
    # 000      000  000   000  00000000  000       0000000    0000000   00000000   
    # 000      000  0000  000  000       000      000   000  000   000  000   000  
    # 000      000  000 0 000  0000000   000      000   000  000   000  00000000   
    # 000      000  000  0000  000       000      000   000  000   000  000        
    # 0000000  000  000   000  00000000  0000000   0000000    0000000   000        
    
    for line in lines

        if stackTop
            
            if stackTop.type == 'comment triple'
                
                mightBeHeader = true
                for chunk in line.chunks
                    if not HEADER.test chunk.match
                        mightBeHeader = false
                        break
                if mightBeHeader
                    for chunk in line.chunks
                        chunk.value = 'comment triple header'
                    continue
                    
            if stackTop.fill then popStack()
        
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
                        addValues chunk.turd.length, extTop.switch.add if extTop.switch.add
                        popExt() # end of extension block reached that is terminated by turd
                                       
                for hnd in handl.punct ? []
                    if advance = hnd()
                        chunkIndex += advance
                        break
                        
            else # words, numbers
                
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
    
# 00000000  000   000  00000000    0000000   00000000   000000000   0000000  
# 000        000 000   000   000  000   000  000   000     000     000       
# 0000000     00000    00000000   000   000  0000000       000     0000000   
# 000        000 000   000        000   000  000   000     000          000  
# 00000000  000   000  000         0000000   000   000     000     0000000   

module.exports =
    
    blocks:  blocks
    ranges:  (line, ext)  -> blocks([line], ext)[0].chunks
    dissect: (lines, ext) -> blocks(lines, ext).map (l) -> l.chunks
    
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
        