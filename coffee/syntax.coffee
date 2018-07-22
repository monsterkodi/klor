###
 0000000  000   000  000   000  000000000   0000000   000   000
000        000 000   0000  000     000     000   000   000 000 
0000000     00000    000 0 000     000     000000000    00000  
     000     000     000  0000     000     000   000   000 000 
0000000      000     000   000     000     000   000  000   000
###

{ slash, first, valid, empty, last, noon, str, error, log, $, _ } = require '../../kxk'

log = console.log

class Syntax

    @lang           = null
    @noComment      = ['txt', 'md', 'html', 'htm', 'xml']
    @hashComment    = ['coffee', 'sh', 'yml', 'yaml', 'noon']
    @noSlashComment = Syntax.noComment.concat Syntax.hashComment
    
    # 000  000   000  000  000000000  
    # 000  0000  000  000     000     
    # 000  000 0 000  000     000     
    # 000  000  0000  000     000     
    # 000  000   000  000     000     
    
    @init: ->
        
        return if Syntax.lang != null
        
        data = noon.load slash.join __dirname, '..', 'coffee', 'lang.noon'
        
        Syntax.lang = {}
        Syntax.info = {}
        
        for extNames,valueWords of data
            for ext in extNames.split /\s/
                Syntax.lang[ext] ?= {}
                for value,words of valueWords
                    
                    if value == 'comment'
                        Syntax.info[ext] ?= {}
                        Syntax.info[ext][value] = words
                    else
                        if not _.isArray words
                            for word,info of words
                                if info
                                    Syntax.info[ext] ?= {}
                                    Syntax.info[ext][value] ?= []
                                    Syntax.info[ext][value].push 
                                        kind:   if word[0] == 't' then 'turd' else 'word'
                                        offset: parseInt word.slice 1
                                        info:   info
                                else
                                    Syntax.lang[ext][word] = value
                                    
                        else
                            for word in words
                                Syntax.lang[ext][word] = value
                                            
        # log 'Syntax', str(Syntax.info)
    
    # 00000000    0000000   000   000   0000000   00000000   0000000  
    # 000   000  000   000  0000  000  000        000       000       
    # 0000000    000000000  000 0 000  000  0000  0000000   0000000   
    # 000   000  000   000  000  0000  000   000  000            000  
    # 000   000  000   000  000   000   0000000   00000000  0000000   
    
    @ranges: (string, ext) ->
        
        Syntax.init()
        
        obj =
            ext:    ext ? 'txt' 
            rgs:    []   # list of ranges (result)
            words:  []   # encountered words
            word:   ''   # currently parsed word
            turd:   ''   # currently parsed stuff inbetween words 
            last:   ''   # the turd before the current/last-completed word
            index:  0  
            
        obj.coffee   = true if obj.ext == 'coffee'
        obj.js       = true if obj.ext == 'js'
        obj.noon     = true if obj.ext == 'noon'
        obj.xml      = true if obj.ext == 'xml'
        obj.html     = true if obj.ext in ['html', 'htm']
        obj.plist    = true if obj.ext == 'plist'
        obj.jslang   = true if obj.coffee or obj.js
        obj.cpplang  = true if obj.ext in ['cpp', 'hpp', 'c', 'h', 'cc', 'cxx']
        obj.dictlang = true if obj.jslang or obj.ext in ['json', 'yaml', 'yml']
        obj.dotlang  = true if obj.cpplang or obj.jslang
        obj.xmllang  = true if obj.xml or obj.html or obj.plist
        
        # log 'ranges', obj.ext, string
        
        for char in string
            
            if obj.char == '\\'
                if obj.escp 
                    delete obj.escp
                else
                    obj.escp = true
            else
                delete obj.escp
                
            obj.char = char
            
            if obj.interpolation and obj.char == '}'
                Syntax.endWord obj
                obj.rgs.push
                    start: obj.index
                    match: obj.char
                    value: "#{obj.interpolation} punctuation"
                                
                obj.string =
                    value:  obj.interpolation
                    start:  obj.index+1
                    match:  ''
                obj.index++
                continue
                    
            if obj.string
                
                Syntax.doString obj

            else if obj.comment
                
                Syntax.doComment obj
              
            else
                switch char
                    
                    when "'", '"', '`'
                        
                        Syntax.startString obj
                        
                    when '+', '*', '<', '>', '=', '^', '~', '@', '$', '&', '%', '#', '/', '\\', ':', '.', ';', ',', '!', '?', '|', '{', '}', '(', ')', '[', ']'
                        
                        Syntax.doPunct obj                    
                        
                    when '-'
                        
                        if obj.noon
                            Syntax.doWord obj
                        else
                            Syntax.doPunct obj
                                
                    when ' ', '\t' 
                        
                        Syntax.endWord obj
                        
                    else # start a new word / continue the current word
                        
                        Syntax.doWord obj
                        
                if char not in [' ', '\t']
                    Syntax.nonSpace obj
                    
            obj.index++
          
        obj.char = null
        Syntax.endWord obj
        Syntax.endLine obj
            
        obj.rgs
    
    # 00000000  000   000  0000000    000   000   0000000   00000000   0000000    
    # 000       0000  000  000   000  000 0 000  000   000  000   000  000   000  
    # 0000000   000 0 000  000   000  000000000  000   000  0000000    000   000  
    # 000       000  0000  000   000  000   000  000   000  000   000  000   000  
    # 00000000  000   000  0000000    00     00   0000000   000   000  0000000    
    
    @endWord: (obj) ->
        
        char = obj.char ? ''
        
        obj.turd += char # don't use = here!
        
        if valid obj.word
            
            word = obj.word
            
            obj.words.push word
            obj.word = ''

            getValue = (back=-1)     -> Syntax.getValue obj, back 
            setValue = (back, value) -> Syntax.setValue obj, back, value  
            setClass = (clss) ->
                if obj.coffee and last(obj.rgs)?.match == '@'
                    if clss == 'text'
                        clss = 'member'
                    last(obj.rgs).value = clss + ' punctuation'
                
                obj.rgs.push
                    start: obj.index - word.length
                    match: word
                    value: clss
                    
                null
            
            if char == ':'
                if obj.dictlang
                    return setClass 'dictionary key'
                
            if obj.coffee
                if getValue(-1)?.indexOf('punctuation') < 0
                    if word not in ['else', 'then', 'and', 'or', 'in']
                        if last(obj.rgs).value not in ['keyword', 'function head']
                            setValue -1, 'function call'
                
            # 000       0000000   000   000   0000000   
            # 000      000   000  0000  000  000        
            # 000      000000000  000 0 000  000  0000  
            # 000      000   000  000  0000  000   000  
            # 0000000  000   000  000   000   0000000   
            
            if Syntax.lang[obj.ext]?[word]?
                
                wordValue = Syntax.lang[obj.ext][word]
                
                if Syntax.info[obj.ext]?[wordValue]?
                    for valueInfo in Syntax.info[obj.ext][wordValue]
                        for match,matchValue of valueInfo.info
                            if obj.last.trim().endsWith match
                                for index in [0...match.length]
                                    setValue -1-index, matchValue + ' punctuation'
                                return setClass matchValue
                else 
                    return setClass wordValue
                            
            # 000   000   0000000    0000000   000   000  
            # 0000  000  000   000  000   000  0000  000  
            # 000 0 000  000   000  000   000  000 0 000  
            # 000  0000  000   000  000   000  000  0000  
            # 000   000   0000000    0000000   000   000  
            
            if obj.noon
                
                if obj.words.length == 1 
                    if empty obj.last
                        return setClass 'class'
                else if obj.words.length == 2
                    if obj.last.startsWith '  '
                        if first(obj.rgs).start > 0
                            Syntax.substitute obj, -1, ['text'], ['property']
                            
                if obj.last == ' ' and last(obj.rgs)?.value != 'text'
                    return setClass last(obj.rgs)?.value
                                                
            #  0000000  00000000   00000000   
            # 000       000   000  000   000  
            # 000       00000000   00000000   
            # 000       000        000        
            #  0000000  000        000        

            if obj.cpplang
                
                if obj.last == '::'
                    if obj.rgs.length >= 3
                        setValue -3, 'namespace'
                        setValue -2, 'punctuation namespace'
                        setValue -1, 'punctuation namespace'
                        if char == '('
                            return setClass 'function call'
                        return setClass 'property'
                
                if /^[\\_A-Z][\\_A-Z0-9]+$/.test word
                    return setClass 'macro'

                if      /^[UA][A-Z]\w+$/.test(word) then return setClass 'type class'
                else if /^[SF][A-Z]\w+$/.test(word) then return setClass 'type struct'
                else if /^[E][A-Z]\w+$/.test(word)  then return setClass 'type enum'
                                                
                if 'class' in obj.words 
                    return setClass 'class'
                    
                if char == '<'
                    return setClass 'type template'
                    
                if obj.last == '::'
                    if getValue(-3) in ['enum', 'class', 'struct']
                        log 'really?'
                        clss = getValue(-3)
                        setValue -3, getValue(-3) + ' punctuation'
                        setValue -2, getValue(-3) + ' punctuation'
                        setValue -1, getValue(-3) + ' punctuation'
                        
                if obj.last == '.' and /^\d+f$/.test(word)
                    if getValue(-2) == 'number'
                        setValue -2, 'number float'
                        setValue -1, 'number float punctuation'
                        return setClass 'number float'
                        
                if obj.last.endsWith "##"
                    
                    setValue -2, 'punctuation operator'
                    setValue -1, 'punctuation operator'
                    
                else if obj.last.endsWith '->'
                    setValue -3, 'obj'
                    setValue -2, 'property punctuation'
                    setValue -1, 'property punctuation'
                    return setClass 'property'
                            
                if char == '('
                    return setClass 'function call'
                    
                if first(obj.words).startsWith('U') and first(obj.rgs)?.value == 'macro'
                    if word.startsWith 'Blueprint'
                        return setClass 'macro punctuation'
                    if word.toLowerCase() in ['meta', 'displayname', 'category', 'worldcontext', 'editanywhere']
                        return setClass 'macro punctuation'
                    if word.toLowerCase() in ['config', 'transient', 'editdefaultsonly', 'visibleanywhere', 'nontransactional', 'interp', 'globalconfig']
                        return setClass 'macro'
                                                    
            # 000   000  000   000  00     00  0000000    00000000  00000000   
            # 0000  000  000   000  000   000  000   000  000       000   000  
            # 000 0 000  000   000  000000000  0000000    0000000   0000000    
            # 000  0000  000   000  000 0 000  000   000  000       000   000  
            # 000   000   0000000   000   000  0000000    00000000  000   000  
            
            if /^\d+$/.test word
                
                if obj.last == '.'                        
                    
                    if getValue(-4) == 'number float' and getValue(-2) == 'number float'
                        setValue -4, 'semver'
                        setValue -3, 'semver punctuation'
                        setValue -2, 'semver'
                        setValue -1, 'semver punctuation'
                        return setClass 'semver'
                            
                    if getValue(-2) == 'number'
                        setValue -2, 'number float'
                        setValue -1, 'number float punctuation'
                        return setClass 'number float'
                        
                return setClass 'number'
                            
            if /^(0x)?[a-fA-F\d][a-fA-F\d][a-fA-F\d]+$/.test word
                return setClass 'number hex'
                    
            # 00000000   00000000    0000000   00000000   00000000  00000000   000000000  000   000 
            # 000   000  000   000  000   000  000   000  000       000   000     000      000 000  
            # 00000000   0000000    000   000  00000000   0000000   0000000       000       00000   
            # 000        000   000  000   000  000        000       000   000     000        000    
            # 000        000   000   0000000   000        00000000  000   000     000        000    
                              
            if obj.dotlang
                
                if obj.last in ['.', ':']
                    if getValue(-2) in ['text', 'module']
                        setValue -2, 'obj'
                        setValue -1, 'obj punctuation'
                        return setClass 'property'
                            
                if obj.last.endsWith '.'
                    if getValue(-2) == 'property'
                        setValue -1, 'property punctuation'
                        return setClass 'property'
                    else
                        if obj.last.length > 1 and obj.last[obj.last.length-2] in [')', ']']
                            setValue -1, 'property punctuation'
                            return setClass 'property'
                            
            return setClass 'text'
        null
          
    # 000   000   0000000   000   000   0000000  00000000    0000000    0000000  00000000  
    # 0000  000  000   000  0000  000  000       000   000  000   000  000       000       
    # 000 0 000  000   000  000 0 000  0000000   00000000   000000000  000       0000000   
    # 000  0000  000   000  000  0000       000  000        000   000  000       000       
    # 000   000   0000000   000   000  0000000   000        000   000   0000000  00000000  
    
    @nonSpace: (obj) ->
        
        if obj.coffee
            
            if obj.turd.length == 1 and obj.turd == '('
                Syntax.setValue obj, -2, 'function call'
                
            else if obj.turd.length > 1 and obj.turd.trim().length == 1
                if last(obj.turd) in '@+-\'"([{'
                    val = Syntax.getValue obj, -2
                    if val not in ['keyword', 'function head']
                        Syntax.setValue obj, -2, 'function call'
                        
            # function.call
            # (@?[a-zA-Z]\w*)
            # (?!\s+or|\s+i[fs]|\s+and|\s+then)
            # (?=\(|\s+[@\w\d\"\'\(\[\{])    
            
    # 000   000   0000000   00000000   0000000    
    # 000 0 000  000   000  000   000  000   000  
    # 000000000  000   000  0000000    000   000  
    # 000   000  000   000  000   000  000   000  
    # 00     00   0000000   000   000  0000000    
    
    @doWord: (obj) ->
        
        if valid obj.turd
            obj.last = obj.turd
            obj.turd = ''
            
        obj.word += obj.char
        
        null

    # 00000000   000   000  000   000   0000000  000000000  
    # 000   000  000   000  0000  000  000          000     
    # 00000000   000   000  000 0 000  000          000     
    # 000        000   000  000  0000  000          000     
    # 000         0000000   000   000   0000000     000     
    
    @doPunct: (obj) ->
        
        Syntax.endWord obj
        
        getValue = (back=-1)     -> Syntax.getValue obj, back 
        setValue = (back, value) -> Syntax.setValue obj, back, value  
                
        value = 'punctuation'
        
        switch obj.char
            when ':'
                if obj.turd.length == 1 and obj.dictlang
                    if last(obj.rgs)?.value == 'dictionary key'
                        value = 'dictionary punctuation'
            when '>'
                if obj.jslang
                    for [turd, val] in [['->', ''], ['=>', ' bound']]
                        if obj.turd.endsWith turd
                            Syntax.substitute obj, -3, ['dictionary key', 'dictionary punctuation'], ['method', 'method punctuation']
                            Syntax.replace    obj, -3, [{word:true}, {match:'='}], [{value:'function'}]
                            setValue -1, 'function tail' + val
                            value = 'function head' + val
                else if obj.xmllang
                    if obj.turd.endsWith '/>'
                        setValue -1, 'keyword punctuation'
                    value = 'keyword punctuation'
        
        obj.rgs.push
            start: obj.index
            match: obj.char
            value: value

        Syntax.checkComment obj
        
    ###
     0000000   0000000   00     00  00     00  00000000  000   000  000000000  
    000       000   000  000   000  000   000  000       0000  000     000     
    000       000   000  000000000  000000000  0000000   000 0 000     000     
    000       000   000  000 0 000  000 0 000  000       000  0000     000     
     0000000   0000000   000   000  000   000  00000000  000   000     000     
    ###
    
    #  0000000  000   000  00000000   0000000  000   000  
    # 000       000   000  000       000       000  000   
    # 000       000000000  0000000   000       0000000    
    # 000       000   000  000       000       000  000   
    #  0000000  000   000  00000000   0000000  000   000  
    
    @checkComment: (obj) ->
        
        return if empty Syntax.info[obj.ext]?.comment
                        
        comment = Syntax.info[obj.ext].comment
        
        if comment.line and obj.turd.endsWith(comment.line) and not obj.turd.endsWith('\\'+comment.line) and empty(obj.words)
            
            Syntax.startComment obj, comment.line
            
        if comment.tail and obj.turd.endsWith(comment.tail) and not obj.turd.endsWith('\\'+comment.tail)
            
            Syntax.startComment obj, comment.tail
            
        else if comment.start and obj.turd.endsWith(comment.start) and not obj.turd.endsWith('\\'+comment.start)

            Syntax.startComment obj, comment.start
            
        null

    #  0000000  000000000   0000000   00000000   000000000  
    # 000          000     000   000  000   000     000     
    # 0000000      000     000000000  0000000       000     
    #      000     000     000   000  000   000     000     
    # 0000000      000     000   000  000   000     000     
    
    @startComment: (obj, start) ->
        
        obj.comment =
            start: obj.index+1
            match: ''
            value: 'comment'
            
        for index in [0...start.length]
            Syntax.setValue obj, -1-index, 'comment punctuation'
        
    # 0000000     0000000 
    # 000   000  000   000
    # 000   000  000   000
    # 000   000  000   000
    # 0000000     0000000 
    
    @doComment: (obj) ->

        comment = Syntax.info[obj.ext].comment
        
        if comment.end and obj.turd.endsWith(comment.end)
            
            obj.rgs.push obj.comment
            
            delete obj.comment
            
            for index in [0...comment.end.length]
                Syntax.setValue obj, -1-index, 'comment punctuation'
            
        else

            Syntax.cont obj, 'comment'
            
        null
                
    ###
     0000000  000000000  00000000   000  000   000   0000000   
    000          000     000   000  000  0000  000  000        
    0000000      000     0000000    000  000 0 000  000  0000  
         000     000     000   000  000  000  0000  000   000  
    0000000      000     000   000  000  000   000   0000000   
    ###
    
    #  0000000  000000000   0000000   00000000   000000000  
    # 000          000     000   000  000   000     000     
    # 0000000      000     000000000  0000000       000     
    #      000     000     000   000  000   000     000     
    # 0000000      000     000   000  000   000     000     
    
    @startString: (obj) ->
        
        Syntax.endWord obj
        
        stringType = switch obj.char
            when "'" then 'string single'
            when '"' then 'string double'
            when '`' then 'string backtick'
            
        if not stringType
            error "no string char '#{obj.char}'"
            return
            
        obj.rgs.push
            start: obj.index
            match: obj.char
            value: "#{stringType} punctuation"
                        
        obj.string =
            value:  stringType
            start:  obj.index+1
            match:  ''
                
        null

    # 0000000     0000000 
    # 000   000  000   000
    # 000   000  000   000
    # 000   000  000   000
    # 0000000     0000000 
    
    @doString: (obj) ->

        if obj.coffee 
            if obj.char == '{' and obj.string.value != 'string single' and obj.string.match.endsWith "#"
                obj.interpolation = obj.string.value
                obj.rgs.push obj.string
                obj.rgs.push
                    start: obj.index
                    match: obj.char
                    value: "#{obj.interpolation} punctuation"
                
                delete obj.string
                return
        
        stringType = switch obj.char
            when "'" then 'string single'
            when '"' then 'string double'
            when '`' then 'string backtick'
        
        if not obj.escp and obj.string.value == stringType

            if valid obj.string.match.trim()
                obj.rgs.push obj.string
                
            delete obj.string
                    
            obj.rgs.push
                start: obj.index
                match: obj.char
                value: "#{stringType} punctuation"
        else
            
            Syntax.cont obj, 'string'
            
        null

    #  0000000   0000000   000   000  000000000  
    # 000       000   000  0000  000     000     
    # 000       000   000  000 0 000     000     
    # 000       000   000  000  0000     000     
    #  0000000   0000000   000   000     000     
    
    @cont: (obj, key) ->
        
        strOrCmt = obj[key]
        
        switch obj.char
                            
            when ' ', '\t'
                
                if strOrCmt.match == ''
                    strOrCmt.start += 1
                else
                    obj.rgs.push strOrCmt if valid strOrCmt.match
                    obj[key] = 
                        value: strOrCmt.value
                        start: obj.index+1
                        match: ''
            else 

                strOrCmt.match += obj.char
                    
        null
                
    # 00000000  000   000  0000000         000      000  000   000  00000000  
    # 000       0000  000  000   000       000      000  0000  000  000       
    # 0000000   000 0 000  000   000       000      000  000 0 000  0000000   
    # 000       000  0000  000   000       000      000  000  0000  000       
    # 00000000  000   000  0000000         0000000  000  000   000  00000000  
    
    @endLine: (obj) ->
        
        if obj.string
            obj.rgs.push obj.string
        else if obj.comment
            obj.rgs.push obj.comment
        null
        
    # 000   000   0000000   000      000   000  00000000  
    # 000   000  000   000  000      000   000  000       
    #  000 000   000000000  000      000   000  0000000   
    #    000     000   000  000      000   000  000       
    #     0      000   000  0000000   0000000   00000000  
    
    @getValue: (obj, back)        -> obj.rgs[obj.rgs.length+back]?.value         
    @setValue: (obj, back, value) -> 
        if obj.rgs.length+back < obj.rgs.length and obj.rgs.length+back >= 0
            obj.rgs[obj.rgs.length+back].value = value
            if obj.coffee and obj.rgs[obj.rgs.length+back-1]?
                if obj.rgs[obj.rgs.length+back-1]?.match == '@'
                    obj.rgs[obj.rgs.length+back-1].value = value + ' punctuation'
    
    #  0000000  000   000  0000000     0000000  000000000  000  000000000  000   000  000000000  00000000  
    # 000       000   000  000   000  000          000     000     000     000   000     000     000       
    # 0000000   000   000  0000000    0000000      000     000     000     000   000     000     0000000   
    #      000  000   000  000   000       000     000     000     000     000   000     000     000       
    # 0000000    0000000   0000000    0000000      000     000     000      0000000      000     00000000  
    
    @substitute: (obj, back, oldVals, newVals) ->
        
        for index in [0...oldVals.length]
            val = Syntax.getValue obj, back+index
            if val != oldVals[index]
                break
                
        if index == oldVals.length
            for index in [0...oldVals.length]
                Syntax.setValue obj, back+index, newVals[index]
            return
            
        if obj.rgs.length + back-1 >= 0
            Syntax.substitute obj, back-1, oldVals, newVals
            
    # 00000000   00000000  00000000   000       0000000    0000000  00000000  
    # 000   000  000       000   000  000      000   000  000       000       
    # 0000000    0000000   00000000   000      000000000  000       0000000   
    # 000   000  000       000        000      000   000  000       000       
    # 000   000  00000000  000        0000000  000   000   0000000  00000000  
    
    @replace: (obj, back, oldObjs, newObjs) ->
        
        return if obj.rgs.length+back < 0
        
        advance = ->
            if obj.rgs.length + back-1 >= 0
                Syntax.replace obj, back-1, oldObjs, newObjs
        
        for index in [0...oldObjs.length]
            backObj = obj.rgs[obj.rgs.length+back+index]
            if not backObj
                log 'dafuk?', str obj
                log 'dafuk?', obj.rgs.length+back+index, obj.rgs.length, back, index
                return
            for key in Object.keys oldObjs[index]
                if key == 'word'
                    if backObj.value.indexOf('punctuation') >= 0
                        return advance()
                else if oldObjs[index][key] != backObj[key]
                    return advance()
                    
        for index in [0...newObjs.length]
            backObj = obj.rgs[obj.rgs.length+back+index]
            for key in Object.keys newObjs[index]
                backObj[key] = newObjs[index][key]
           
module.exports = Syntax
