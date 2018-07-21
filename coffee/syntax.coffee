###
 0000000  000   000  000   000  000000000   0000000   000   000
000        000 000   0000  000     000     000   000   000 000 
0000000     00000    000 0 000     000     000000000    00000  
     000     000     000  0000     000     000   000   000 000 
0000000      000     000   000     000     000   000  000   000
###

{ valid, slash, empty, first, noon, last, str, log, $ } = require 'kxk'

log = console.log

class Syntax

    @lang           = null
    @noComment      = ['txt', 'md']
    @hashComment    = ['coffee', 'sh', 'yml', 'yaml', 'noon']
    @noSlashComment = Syntax.noComment.concat Syntax.hashComment
    
    @init: ->
        
        return if Syntax.lang != null
        
        data = noon.load slash.join __dirname, '..', 'coffee', 'lang.noon'
        
        Syntax.lang = {}
        for extNames,valueWords of data
            for ext in extNames.split /\s/
                Syntax.lang[ext] ?= {}
                for value,words of valueWords
                    for word in words
                        Syntax.lang[ext][word] = value
                        
        # log 'Syntax.lang', Syntax.lang 
    
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
            stack:  []   # unclosed strings 
            word:   ''   # currently parsed word
            turd:   ''   # currently parsed stuff inbetween words 
            last:   ''   # the turd before the current/last-completed word
            index:  0  
            
        obj.coffee   = true if obj.ext == 'coffee'
        obj.js       = true if obj.ext == 'js'
        obj.noon     = true if obj.ext == 'noon'
        obj.jslang   = obj.coffee or obj.js
        obj.cpplang  = obj.ext in ['cpp', 'hpp', 'c', 'h', 'cc', 'cxx']
        obj.dictlang = obj.jslang or obj.ext in ['json', 'yaml', 'yml']
        obj.dotlang  = obj.cpplang or obj.jslang
        
        for char in string
            
            obj.char = char
            
            switch char
                
                when "'", '"', '`', '#'
                    
                    Syntax.endWord   obj
                    Syntax.doStack   obj
                    
                when '+', '-', '*', '<', '>', '=', '^', '~', '@', '$', '&', '%', '/', '\\', ':', '.', ';', ',', '!', '?', '|', '{', '}', '(', ')', '[', ']'
                    
                    Syntax.endWord   obj
                    Syntax.doPunct   obj
                    Syntax.stackChar obj
                            
                when ' ', '\t' 
                    
                    Syntax.endWord   obj
                    Syntax.stackChar obj
                    
                else # start a new word / continue the current word
                    
                    Syntax.endTurd   obj
                    Syntax.stackChar obj
                    
            if char not in [' ', '\t']
                Syntax.nonSpace obj
                    
            obj.index++
          
        obj.char = null
        Syntax.endWord    obj
        Syntax.endComment obj
            
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
                
                if obj.cpplang and obj.last.endsWith("#") and obj.last.trim() == "#"
                    # and  'include', 'define', 'if', 'ifdef', 'ifndef', 'else', 'endif', 'undef', 'pragma'
                    if clss == 'define'
                        setValue -1, 'define punctuation'
                    
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
                
            if Syntax.lang[obj.ext]?[word]?
                return setClass Syntax.lang[obj.ext][word]
                            
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
            
    # 00000000  000   000  0000000                   
    # 000       0000  000  000   000                 
    # 0000000   000 0 000  000   000                 
    # 000       000  0000  000   000  000  000  000  
    # 00000000  000   000  0000000    000  000  000  
    
    @endComment: (obj) ->
        
        bot = first obj.stack
        
        if bot?.type == 'comment'
            obj.rgs.push
                start: bot.index
                match: bot.match
                value: 'comment'
        else if bot?
            obj.rgs.push
                start: bot.index
                match: bot.match
                value: bot.type
        null
                    
    @endTurd: (obj) ->
        
        obj.word += obj.char
        if valid obj.turd
            obj.last = obj.turd
            obj.turd = ''
            
        null

    # 00000000   000   000  000   000   0000000  000000000  
    # 000   000  000   000  0000  000  000          000     
    # 00000000   000   000  000 0 000  000          000     
    # 000        000   000  000  0000  000          000     
    # 000         0000000   000   000   0000000     000     
    
    @doPunct: (obj) ->
        
        getValue = (back=-1)     -> Syntax.getValue obj, back 
        setValue = (back, value) -> Syntax.setValue obj, back, value  
                
        char = obj.char
        
        value = 'punctuation'
        
        switch char
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
        
        obj.rgs.push
            start: obj.index
            match: char
            value: value

        switch char 
            when '{' 
                if obj.coffee and last(obj.turd) == '#' and first(obj.stack).type == 'comment' and first(obj.stack).index == obj.index
                    obj.stack = []
            when '/' 
                if obj.ext not in @noSlashComment
                    if last(obj.turd) == '/' and empty obj.stack
                        obj.rgs.push
                            start: obj.index-1
                            match: '//'
                            value: "comment punctuation"
                        obj.stack.push type:'comment', index:obj.index, match:''
                        
        null
                        
    # 0000000     0000000    0000000  000000000   0000000    0000000  000   000  
    # 000   000  000   000  000          000     000   000  000       000  000   
    # 000   000  000   000  0000000      000     000000000  000       0000000    
    # 000   000  000   000       000     000     000   000  000       000  000   
    # 0000000     0000000   0000000      000     000   000   0000000  000   000  
    
    @doStack: (obj) ->
        
        char = obj.char
        
        stringType = switch char
            when "'" then 'string single'
            when '"' then 'string double'
            when '`' then 'string backtick'
            when "#" 
                if obj.ext == 'noon'
                    if empty(obj.words) and empty obj.turd.trim()
                        'comment'
                    else
                        Syntax.doPunct obj
                else if obj.ext in Syntax.hashComment 
                    'comment'
                else
                    Syntax.doPunct obj
            
        if not stringType
            Syntax.stackChar obj
            return
                
        if empty(obj.stack) or last(obj.stack)?.type == stringType        
            obj.rgs.push
                start: obj.index
                match: char
                value: "#{stringType} punctuation"
            
        if last(obj.turd) == '\\'
            Syntax.stackChar obj
            return
            
        if last(obj.stack)?.type == stringType and stringType != 'comment'
            top = obj.stack.pop()
            obj.rgs.push
                start: top.index
                match: top.match
                value: stringType
        else
            if empty obj.stack
                obj.stack.push type:stringType, index:obj.index+1, match:''
            else
                Syntax.stackChar obj
                
        null

    #  0000000  000000000   0000000    0000000  000   000   0000000  000   000   0000000   00000000   
    # 000          000     000   000  000       000  000   000       000   000  000   000  000   000  
    # 0000000      000     000000000  000       0000000    000       000000000  000000000  0000000    
    #      000     000     000   000  000       000  000   000       000   000  000   000  000   000  
    # 0000000      000     000   000   0000000  000   000   0000000  000   000  000   000  000   000  
    
    @stackChar: (obj) -> 
        
        for item in obj.stack
            item.match += obj.char
            
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
