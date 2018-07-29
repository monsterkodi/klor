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

    @exts = [] 
    @lang = null
    
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
        Syntax.mtch = {}
        Syntax.fill = {}
        Syntax.word = {}
        Syntax.turd = {}
        
        for extNames,valueWords of data
            for ext in extNames.split /\s/
            
                Syntax.exts.push(ext) if ext not in Syntax.exts
            
                Syntax.lang[ext] ?= {}
                for value,words of valueWords
                    
                    if value == 'comment'
                        Syntax.info[ext] ?= {}
                        Syntax.info[ext][value] = words
                    else if value == 'match'
                        for value,mtchInfo of words
                            if mtchInfo.fill
                                Syntax.fill[ext] ?= {}
                                mtchInfo.value = value
                                Syntax.fill[ext][mtchInfo.fill] = mtchInfo
                            else if mtchInfo.end
                                Syntax.mtch[ext] ?= {}
                                Syntax.mtch[ext][last mtchInfo.end] ?= []
                                mtchInfo.value = value
                                Syntax.mtch[ext][last mtchInfo.end].push mtchInfo
                            else if mtchInfo.turd
                                Syntax.turd[ext] ?= {}
                                mtchInfo.match = value
                                Syntax.turd[ext][value] = mtchInfo
                            else
                                Syntax.word[ext] ?= {}
                                mtchInfo.value = value
                                Syntax.word[ext][value] = mtchInfo
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
                                
        # log str Syntax.mtch
                                
    # 00000000    0000000   000   000   0000000   00000000   0000000  
    # 000   000  000   000  0000  000  000        000       000       
    # 0000000    000000000  000 0 000  000  0000  0000000   0000000   
    # 000   000  000   000  000  0000  000   000  000            000  
    # 000   000  000   000  000   000   0000000   00000000  0000000   
    
    @ranges: (text, ext) ->
        
        Syntax.init()
        
        obj =
            ext:    ext ? 'txt' 
            rgs:    []   # list of ranges (result)
            words:  []   # encountered words
            word:   ''   # currently parsed word
            turd:   ''   # currently parsed stuff inbetween words 
            last:   ''   # the turd before the current/last-completed word
            index:  0 
            text:   text
            
        switch obj.ext
            when 'cpp', 'hpp', 'c', 'h', 'cc', 'cxx', 'cs'
                obj.cpplang  = true
                obj.cpp      = true
            when 'coffee', 'js'
                obj.jslang   = true
                obj[obj.ext] = true
            when 'html', 'htm'
                obj.html     = true
            when 'yaml', 'yml'
                obj.yaml     = true
            when 'css', 'styl'
                obj.csslang  = true
                obj[obj.ext] = true
            else
                obj[obj.ext] = true
                
        obj.dictlang = true if obj.jslang or obj.iss or obj.log or obj.json or obj.yaml
        obj.dashlang = true if obj.noon or obj.csslang or obj.iss or obj.pug
        obj.dotlang  = true if obj.cpplang or obj.jslang or obj.log
        obj.xmllang  = true if obj.xml or obj.html or obj.plist
        
        for char in text
            
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
                    start:  obj.index+1
                    value:  obj.interpolation
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
                        
                        if not obj.escp and (char != "'" or obj.jslang or obj.pug)
                            Syntax.startString obj
                        else
                            Syntax.doPunct obj
                        
                    when '+', '*', '<', '>', '=', '^', '~', '@', '$', '&', '%', '#', '/', '\\', ':', '.', ';', ',', '!', '?', '|', '{', '}', '(', ')', '[', ']'
                        
                        Syntax.doPunct obj
                        
                    when '-'
                        
                        if obj.dashlang
                            Syntax.doWord obj
                        else
                            Syntax.doPunct obj
                                
                    when ' ', '\t' 
                        
                        Syntax.endWord obj
                        
                    else # start a new word / continue the current word
                        
                        Syntax.doWord obj
                        
                if char not in [' ', '\t']
                    Syntax.coffeeCall obj
                    
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

        switch char
            when ' ', '\t'
                Syntax.doTurd obj
                if obj.regexp? and not obj.escp
                    delete obj.regexp # abort regexp on first unescaped space
                        
        if valid obj.word
            
            word = obj.word
            
            obj.words.push word
            obj.word = ''

            getValue = (back=-1)     -> Syntax.getValue obj, back 
            getMatch = (back=-1)     -> Syntax.getMatch obj, back
            setValue = (back, value) -> Syntax.setValue obj, back, value  
            
            setClass = (clss) ->
                
                if obj.coffee 
                    
                    if last(obj.rgs)?.match == '@'
                        if clss == 'text'
                            clss = 'member'
                        last(obj.rgs).value = clss + ' punctuation'
                        
                else if obj.js
                    
                    if clss == 'keyword function'
                        Syntax.replace obj, -2, [{word:true}, {match:'='}], [{value:'function'}]
                
                obj.rgs.push
                    start: obj.index - word.length
                    match: word
                    value: clss
                    
                null
                            
            if valid obj.fill
                return setClass obj.fill.value
                
            switch char
                when ':'
                    if obj.dictlang
                        return setClass 'dictionary key'
                                
            # 000       0000000   000   000   0000000   
            # 000      000   000  0000  000  000        
            # 000      000000000  000 0 000  000  0000  
            # 000      000   000  000  0000  000   000  
            # 0000000  000   000  000   000   0000000   
            
            if Syntax.turd[obj.ext]
                lastTurd = last obj.last.split /\s+/
                if turdInfo = Syntax.turd[obj.ext][lastTurd]
                    if turdInfo.spaced != true or obj.last[obj.last.length-lastTurd.length-1] == ' '
                        if turdInfo['w-1']
                            setValue -turdInfo.match.length-1, turdInfo['w-1']
                        for index in [0...turdInfo.match.length]
                            setValue -index-1, turdInfo.turd
                        if turdInfo['w-0']
                            return setClass turdInfo['w-0']
            
            lcword = word.toLowerCase()
            
            if wordInfo = Syntax.word[obj.ext]?[lcword]
                
                if obj.last in Object.keys wordInfo['t-1']
                    setValue -2, wordInfo.value + ' ' + wordInfo['w-1']
                    setValue -1, wordInfo.value + ' ' + wordInfo['t-1'][obj.last]
                    return setClass wordInfo.value + ' ' + wordInfo.word
            
            if wordValue = Syntax.lang[obj.ext]?[lcword]
                
                if Syntax.info[obj.ext]?[wordValue]?
                    for valueInfo in Syntax.info[obj.ext][wordValue]
                        for match,matchValue of valueInfo.info
                            if obj.last.trim().endsWith match
                                for index in [0...match.length]
                                    setValue -1-index, matchValue + ' punctuation'
                                return setClass matchValue
                else 
                    return setClass wordValue
                    
            #  0000000   0000000   00000000  00000000  00000000  00000000  
            # 000       000   000  000       000       000       000       
            # 000       000   000  000000    000000    0000000   0000000   
            # 000       000   000  000       000       000       000       
            #  0000000   0000000   000       000       00000000  00000000  
            
            if obj.coffee
                if getMatch(-1) in ['class', 'extends']
                    return setClass 'class'
                if getValue(-1)?.indexOf('punctuation') < 0
                    if word not in ['else', 'then', 'and', 'or', 'in']
                        if last(obj.rgs).value not in ['keyword', 'function head', 'require', 'number']
                            setValue -1, 'function call' # coffee endWord -1 no punctuation and word != 'else ...'
                    
            # 000   000  00000000  000   000  
            # 000   000  000        000 000   
            # 000000000  0000000     00000    
            # 000   000  000        000 000   
            # 000   000  00000000  000   000  
    
            if /^0x[a-fA-F\d][a-fA-F\d][a-fA-F\d]+$/.test word
                setValue -2, 'number hex punctuation'
                setValue -1, 'number hex punctuation'
                return setClass 'number hex'
                
            if getMatch(-1) == "#"
                if /^[a-fA-F\d]+$/.test word
                    setValue -1, 'number hex punctuation'
                    return setClass 'number hex'
                    
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
                    
            else if obj.sh
                
                if obj.words.length > 1 and getMatch(-1) == '-' and getValue(-2) == 'argument'
                    setClass -1, 'argument punctuation'
                    return setClass 'argument'
                                                         
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
                            return setClass 'function call' # cpp ::word (
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
                            
            # 00000000   00000000    0000000   00000000   00000000  00000000   000000000  000   000 
            # 000   000  000   000  000   000  000   000  000       000   000     000      000 000  
            # 00000000   0000000    000   000  00000000   0000000   0000000       000       00000   
            # 000        000   000  000   000  000        000       000   000     000        000    
            # 000        000   000   0000000   000        00000000  000   000     000        000    
                              
            if obj.dotlang
                
                if obj.last in ['.', ':']
                    if getValue(-2) in ['text', 'module', 'class', 'member', 'keyword']
                        setValue -2, 'obj' if getValue(-2) == 'text'
                        setValue -1, 'property punctuation'
                        if char == '(' 
                            return setClass 'function call' # dotlang .word (
                        else
                            return setClass 'property'
                            
                if obj.last.endsWith '.'
                    
                    if getValue(-2) == 'property'
                        
                        setValue -1, 'property punctuation'
                        if char == '(' 
                            return setClass 'function call' # dotlang .property (
                        else
                            return setClass 'property'

                    if obj.last.length > 1 
                        
                        if obj.last[obj.last.length-2] in [')', ']']
                            setValue -1, 'property punctuation'
                            return setClass 'property'
                        
                        if obj.coffee
                            if obj.last[obj.last.length-2] == '?'
                                setValue -3, 'obj' if getValue(-3) == 'text'
                                setValue -2, 'operator punctuation'
                                setValue -1, 'property punctuation'
                                return setClass 'property'

            #  0000000  000000000  000   000  000      
            # 000          000      000 000   000      
            # 0000000      000       00000    000      
            #      000     000        000     000      
            # 0000000      000        000     0000000  
            
            if obj.csslang

                if word.endsWith 's'
                    if /\d+s/.test word
                        return setClass 'number'
                        
                if word.slice(word.length-2) in ['px', 'em', 'ex', 'ch']
                    return setClass 'number'
                    
            if obj.csslang or obj.pug
                
                if obj.last.endsWith '.'
                    setValue -1, 'class punctuation'
                    return setClass 'class'
                    
                if obj.last.endsWith "#"
                    setValue -1, 'cssid punctuation'
                    return setClass 'cssid'
                                
            if obj.cpplang or obj.js
                if char == '(' 
                    return setClass 'function call' # cpp & js (
                            
            return setClass 'text'
        null
          
    #  0000000   0000000   00000000  00000000  00000000  00000000         0000000   0000000   000      000      
    # 000       000   000  000       000       000       000             000       000   000  000      000      
    # 000       000   000  000000    000000    0000000   0000000         000       000000000  000      000      
    # 000       000   000  000       000       000       000             000       000   000  000      000      
    #  0000000   0000000   000       000       00000000  00000000         0000000  000   000  0000000  0000000  
    
    @coffeeCall: (obj) ->
        
        if obj.coffee
            
            if obj.turd == '('
                Syntax.setValue obj, -2, 'function call' # coffee call (
                
            else if obj.turd.length > 1 and obj.turd[obj.turd.length-2] == ' '
                if last(obj.turd) in '@+-\'"([{'
                    if last(obj.turd) in '+-'
                        if obj.text[obj.index+1] == ' '
                            return # bail out if next character is a space (cheater!)
                    val = Syntax.getValue obj, -2
                    if valid(val) and val not in ['keyword', 'function head', 'require']
                        if val.indexOf('punctuation') < 0
                            Syntax.setValue obj, -2, 'function call' # coffee call @+-\'"([{
                                    
    # 000   000   0000000   00000000   0000000    
    # 000 0 000  000   000  000   000  000   000  
    # 000000000  000   000  0000000    000   000  
    # 000   000  000   000  000   000  000   000  
    # 00     00   0000000   000   000  0000000    
    
    @doWord: (obj) ->
        
        if valid obj.turd
            
            Syntax.doTurd obj
            
            obj.last = obj.turd
            obj.turd = ''
                    
        obj.word += obj.char
        
        null

    @doTurd: (obj) ->
        
        if empty(obj.fill) and empty(obj.words) and Syntax.fill[obj.ext]?[obj.turd]?
            
            obj.fill = Syntax.fill[obj.ext]?[obj.turd]
            for index in [0...obj.turd.length]
                if obj.fill.turd
                    Syntax.setValue obj, -1-index, obj.fill.turd
                else
                    Syntax.setValue obj, -1-index, obj.fill.value + ' ' + 'punctuation'
        
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
                if obj.dictlang and obj.turd.length == 1
                    if last(obj.rgs)?.value == 'dictionary key'
                        value = 'dictionary punctuation'
            when '>'
                if obj.jslang
                    for [turd, val] in [['->', ''], ['=>', ' bound']]
                        if obj.turd.endsWith turd
                            Syntax.substitute obj, -3, ['dictionary key', 'dictionary punctuation'], ['method', 'method punctuation']
                            Syntax.surround   obj, -1, start:'(', add:'argument', end:')'
                            Syntax.replace    obj, -3, [{word:true, ignore:'argument'}, {match:'='}], [{value:'function'}]
                            setValue -1, 'function tail' + val + ' punctuation'
                            value = 'function head' + val + ' punctuation'
                else if obj.xmllang or obj.md
                    if obj.turd.endsWith '/>'
                        setValue -1, 'keyword punctuation'
                    value = 'keyword punctuation'
            when '/'
                if obj.jslang
                    if not obj.escp
                        if obj.regexp?
                            for index in [obj.rgs.length-1..0]
                                if obj.rgs[index].start < obj.regexp
                                    break
                                obj.rgs[index].value = 'regexp ' + obj.rgs[index].value
                            value = 'regexp punctuation'
                        else
                            obj.regexp = obj.index
        
        if mtch = Syntax.mtch[obj.ext]?[obj.char]
            if matchValue = Syntax.doMatch obj, mtch
                value = matchValue
                
        if obj.fill then value = obj.fill.value + ' ' + value
                
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
        return if obj.regexp?
                        
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
                        start: obj.index+1
                        match: ''
                        value: strOrCmt.value
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
            if obj.jslang or obj.cpplang
                obj.rgs.push obj.string
        else if obj.comment
            obj.rgs.push obj.comment
        null
        
    # 000   000   0000000   000      000   000  00000000  
    # 000   000  000   000  000      000   000  000       
    #  000 000   000000000  000      000   000  0000000   
    #    000     000   000  000      000   000  000       
    #     0      000   000  0000000   0000000   00000000  
    
    @getMatch: (obj, back)        -> if back < 0 then obj.rgs[obj.rgs.length+back]?.match else obj.rgs[back]?.match
    @getValue: (obj, back)        -> if back < 0 then obj.rgs[obj.rgs.length+back]?.value else obj.rgs[back]?.value     
    @setValue: (obj, back, value) -> 
        if back < 0
            back = obj.rgs.length+back
        if back < obj.rgs.length and back >= 0
            obj.rgs[back].value = value
            if obj.coffee and obj.rgs[back-1]?
                if obj.rgs[back-1]?.match == '@'
                    obj.rgs[back-1].value = value + ' punctuation'

    @addValue: (obj, back, value) -> 
        if back < 0
            back = obj.rgs.length+back
        if back < obj.rgs.length and back >= 0
            for val in value.split /\s+/
                if val not in obj.rgs[back].value.split /\s+/
                    obj.rgs[back].value = val + ' ' + obj.rgs[back].value
                    
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
            if oldObjs[index].ignore
                if backObj.value.indexOf(oldObjs[index].ignore) >= 0
                    return advance()
            for key in Object.keys oldObjs[index]
                switch key 
                    when 'word'
                        if backObj.value.indexOf('punctuation') >= 0
                            return advance()
                    when 'ignore' then
                    else 
                        if oldObjs[index][key] != backObj[key]
                            return advance()
                    
        for index in [0...newObjs.length]
            backObj = obj.rgs[obj.rgs.length+back+index]
            for key in Object.keys newObjs[index]
                backObj[key] = newObjs[index][key]
           
    # 00     00   0000000   000000000   0000000  000   000  
    # 000   000  000   000     000     000       000   000  
    # 000000000  000000000     000     000       000000000  
    # 000 0 000  000   000     000     000       000   000  
    # 000   000  000   000     000      0000000  000   000  
    
    @doMatch: (obj, mtchs) ->
        
        for mtch in mtchs
            
            startLength = mtch.start?.length ? 0
            
            if mtch.single 
                if obj.text[obj.index+1] == mtch.end
                    continue
                if last(obj.rgs)?.match == mtch.end
                    continue
            
            if obj.rgs.length-mtch.end.length-startLength < 0
                continue 
               
            endMatches = true
            for endIndex in [1...mtch.end.length]
                if obj.rgs[obj.rgs.length-endIndex].match != mtch.end[mtch.end.length-endIndex]
                    endMatches = false
                    break
            if not endMatches
                continue 
                
            if mtch.spaced == false
                if obj.turd.indexOf(' ') >= 0
                    continue
                
            if mtch.start
                
                for startIndex in [obj.rgs.length-startLength-mtch.end.length..0]
                    startMatches = true
                    for index in [0...startLength]
                        if Syntax.getMatch(obj, startIndex+index) != mtch.start[index]
                            startMatches = false
                            break
                    break if startMatches
                    
                if startIndex >= 0
                    for index in [startIndex...startIndex+startLength]
                        Syntax.addValue obj, index, mtch.value + ' punctuation'
                    for index in [startIndex+startLength...obj.rgs.length-mtch.end.length+1]
                        Syntax.addValue obj, index, mtch.value
                    for index in [obj.rgs.length-mtch.end.length+1...obj.rgs.length]
                        Syntax.addValue obj, index, mtch.value + ' punctuation'
                    
                    return mtch.value + ' punctuation'
                    
            else
                Syntax.addValue obj, -1, mtch.value
                index = -2
                while Syntax.getMatch(obj, index) == '-'
                    Syntax.setValue obj, index, mtch.value + ' punctuation'
                    Syntax.addValue obj, index-1, mtch.value
                    index -= 2
                return mtch.value + ' punctuation'
        null
               
    #  0000000  000   000  00000000   00000000    0000000   000   000  000   000  0000000    
    # 000       000   000  000   000  000   000  000   000  000   000  0000  000  000   000  
    # 0000000   000   000  0000000    0000000    000   000  000   000  000 0 000  000   000  
    #      000  000   000  000   000  000   000  000   000  000   000  000  0000  000   000  
    # 0000000    0000000   000   000  000   000   0000000    0000000   000   000  0000000    
    
    @surround: (obj, back, range) ->
        
        return if obj.rgs.length-1+back <= 1
        for endIndex in [obj.rgs.length-1+back..0]
            if endIndex >= obj.rgs.length or endIndex < 0
                log 'dafuk?', endIndex, obj.rgs.length, back
                return
            if not obj.rgs[endIndex]?
                log 'dafuk2?', endIndex, obj.rgs.length, back
                return
            if range.end == obj.rgs[endIndex]?.match
                for startIndex in [endIndex-1..0]
                    if range.start == obj.rgs[startIndex]?.match
                        for addIndex in [startIndex+1...endIndex]
                            obj.rgs[addIndex].value = range.add + ' ' + obj.rgs[addIndex].value
        
module.exports = Syntax
