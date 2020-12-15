###
000   000  000       0000000   00000000
000  000   000      000   000  000   000
0000000    000      000   000  0000000
000  000   000      000   000  000   000
000   000  0000000   0000000   000   000
###

▸if opts.lang # koffee --lang klor.coffee

    fs   = require 'fs'
    noon_load = require 'noon/js/load'
    path = require 'path'

    noonFile = path.join __dirname, 'lang.noon'
    jsonFile = path.join __dirname, '..' 'js' 'lang.json'

    log 'compile:' noonFile
    log 'output:'  jsonFile

    lang = {}
    exts = ['txt''log']
    for names, keywords of noon_load noonFile

        for ext in names.split /\s/
            exts.push(ext) if ext not in exts
            lang[ext] ?= {}
            for value,words of keywords
                for word in words
                    lang[ext][word] = value

    json = JSON.stringify {exts:exts, lang:lang}, null, '    '
    fs.writeFileSync jsonFile, json, 'utf8'

{ exts, lang } = require "#{__dirname}/../js/lang.json"
kolor = require './kolor'

swtch =
    coffee:
        doc: turd:'▸' to:'md' indent:1
    pug:
        script: next:'.' to:'js' indent:1
    md:
        coffeescript: turd:'```' to:'coffee' end:'```' add:'code triple'
        javascript:   turd:'```' to:'js'     end:'```' add:'code triple'

for ext in exts
    swtch.md[ext] = turd:'```' to:ext, end:'```' add:'code triple'

SPACE   = /\s/
HEADER  = /^0+$/
PUNCT   = /\W+/g
NUMBER  = /^\d+$/
FLOAT   = /^\d+f$/
HEXNUM  = /^0x[a-fA-F\d]+$/
HEX     = /^[a-fA-F\d]+$/
NEWLINE = /\r?\n/
LI      = /(\sli\d\s|\sh\d\s)/

codeTypes = ['interpolation' 'code triple']

#  0000000  000   000  000   000  000   000  000   000  00000000  0000000
# 000       000   000  000   000  0000  000  000  000   000       000   000
# 000       000000000  000   000  000 0 000  0000000    0000000   000   000
# 000       000   000  000   000  000  0000  000  000   000       000   000
#  0000000  000   000   0000000   000   000  000   000  00000000  0000000

▸doc 'chunked lines, ext'

    returns array of

        chunks: [
                    turd:   s
                    clss:   s
                    match:  s
                    start:  n
                    length: n
                ]
        ext:    s
        chars:  n
        index:  n
        number: n+1

chunked = (lines, ext) ->

    ext = ext[1..] if ext[0] == '.'
    ext = 'txt' if ext not in exts

    lineno = 0
    lines.map (text) ->

        line =
            chunks: []
            chars:  0
            index:  lineno++
            number: lineno
            ext:    ext

        return line if not text instanceof String
        
        chunks = replaceTabs(text).split SPACE

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
                        line.chunks.push start:c, length:wl, match:w, clss:'text'
                        c += wl

                    turd = punct = m[0]

                    pi = 0
                    advance = 1
                    clss = 'punct'

                    while pi < punct.length-1
                        pc = punct[pi]
                        advance = 1
                        if 0xD800 <= punct.charCodeAt(pi) <= 0xDBFF and 0xDC00 <= punct.charCodeAt(pi+1) <= 0xDFFF
                            advance = 2
                            clss = 'text'
                            pc += punct[pi+1]
                        else
                            clss = 'punct'
                            if pc in [','';''{''}''('')']
                                clss += ' minor'
                        pi += advance
                        line.chunks.push start:c, length:advance, match:pc, turd:turd, clss:clss
                        c += advance
                        turd = turd[advance..]

                    if pi < punct.length
                        clss = 'punct'
                        if punct[pi..] in [','';''{''}''('')']
                            clss += ' minor'
                        line.chunks.push start:c, length:advance, match:punct[pi..], clss:clss
                        c += advance

                if c < sc+l        # check for remaining non-punct
                    rl = sc+l-c    # length of remainder
                    w = s[l-rl..]  # text   of remainder
                    line.chunks.push start:c, length:rl, match:w, clss:'text'
                    c += rl

        if line.chunks.length
            last = line.chunks[-1]
            line.chars = last.start + last.length

        line

###
000   000   0000000   000   000  0000000    000      00000000  00000000    0000000
000   000  000   000  0000  000  000   000  000      000       000   000  000
000000000  000000000  000 0 000  000   000  000      0000000   0000000    0000000
000   000  000   000  000  0000  000   000  000      000       000   000       000
000   000  000   000  000   000  0000000    0000000  00000000  000   000  0000000
###

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
            c.clss = 'comment'
            if mightBeHeader and not HEADER.test c.match
                mightBeHeader = false
        if mightBeHeader
            for c in restChunks
                c.clss += ' header'
    line.chunks.length - chunkIndex + n

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

    if chunk.turd?.startsWith "//"
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
        if line.chunks[0].clss == 'text'
            if line.chunks[1].match == '=' and line.chunks[2].match != '>'
                line.chunks[0].clss = 'function'
                line.chunks[1].clss += ' function'
            else if line.chunks[1].match == ':'
                line.chunks[0].clss = 'method'
                line.chunks[1].clss += ' method'

    if chunk.turd

        if chunk.turd.startsWith '->'
            markFunc()
            addValue 0 'function tail'
            addValue 1 'function head'
            if line.chunks[0].clss == 'dictionary key' or line.chunks[0].turd?[..1] == '@:'
                line.chunks[0].clss = 'method'
                line.chunks[1].clss = 'punct method'
            else if line.chunks[0].match == '@' and line.chunks[1].clss == 'dictionary key'
                line.chunks[0].clss = 'punct method class'
                line.chunks[1].clss = 'method class'
                line.chunks[2].clss = 'punct method class'
            return 2

        if chunk.turd.startsWith '=>'
            markFunc()
            addValue 0 'function bound tail'
            addValue 1 'function bound head'
            if line.chunks[0].clss == 'dictionary key'
                line.chunks[0].clss = 'method'
                line.chunks[1].clss = 'punct method'
            return 2

cppPointer = ->
    
    return if notCode
    
    if chunk.turd
        if chunk.turd.startsWith '->'
            addValue 0 'arrow tail'
            addValue 1 'arrow head'
            return 2
            
commentHeader = ->

    if topType == 'comment triple'
        if HEADER.test chunk.match
            chunk.clss = 'comment triple header'
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

        if prev.clss.startsWith('text') or prev.clss == 'property'

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

        if prev.clss == 'punct meta'
            if chunk.start == prev.start+1
                setValue 0 'meta'
                return 0 # give switch a chance

        if prev.match in ['class', 'extends']
            setValue 0 'class'
            return 1

        if chunk.clss.startsWith 'keyword'

            return 1 # we are done with the keyword

        if prev.match == '@'
            addValue -1 'this'
            addValue  0 'this'
            return 1

        if (prev.clss.startsWith('text') or prev.clss == 'property') and prev.start+prev.length < chunk.start # spaced
            return thisCall()

property = -> # word

    return if notCode

    if getmatch(-1) == '.'

        prevPrev = getChunk -2

        if prevPrev?.match != '.'
            addValue -1 'property'
            setValue 0 'property'
            if prevPrev
                if prevPrev.clss not in ['property' 'number'] and not prevPrev.clss.startsWith 'punct'
                    setValue -2 'obj'
            return 1

cppWord = ->

    return if notCode

    if p = property() then return p

    if getChunk(-2)?.turd == '::'

        if prevPrev = getChunk -3
            setValue -3 'punct obj'
            addValue -2 'obj'
            addValue -1 'obj'
            setValue  0 'method'
            return 1

    if getmatch(-1) == '<' and getmatch(1) in ',>' or getmatch(1) == '>' and getmatch(-1) in ','

        setValue -1 'punct template'
        setValue  0 'template'
        setValue  1 'punct template'
        return 2

    if /[A-Z]/.test chunk.match[1]
        switch chunk.match[0]
            when 'T'
                if getmatch(1) == '<'
                    setValue 0 'keyword type'
                    return 1

            when 'F'
                setValue 0 'struct'
                return 1

            when 'A' 'U'
                setValue 0 'obj'
                return 1

    if chunk.clss == 'text' and getmatch(1) == '('
        setValue 0 'function call'
        return 1

# 000   000   0000000    0000000   000   000
# 0000  000  000   000  000   000  0000  000
# 000 0 000  000   000  000   000  000 0 000
# 000  0000  000   000  000   000  000  0000
# 000   000   0000000    0000000   000   000

noonProp = ->

    if prev = getChunk -1
        if prev.start+prev.length+1 < chunk.start
            if prev.clss != 'obj'
                for i in [chunkIndex-1..0]
                    if i < chunkIndex-1 and line.chunks[i].start+line.chunks[i].length+1 < line.chunks[i+1].start
                        break
                    if line.chunks[i].clss == 'text' or line.chunks[i].clss == 'obj'
                        line.chunks[i].clss = 'property'
                    else if line.chunks[i].clss == 'punct'
                        line.chunks[i].clss = 'punct property'
                    else
                        break
    0

noonPunct = ->

    return if notCode # makes this sense here ???

    noonProp()

noonWord = ->

    return if notCode # makes this sense here ???

    if chunk.start == 0
        setValue 0 'obj'
        return 1

    noonProp()

# 000   000  00000000   000
# 000   000  000   000  000
# 000   000  0000000    000
# 000   000  000   000  000
#  0000000   000   000  0000000

urlPunct = ->

    if prev = getChunk -1
        if chunk.turd == '://'
            if getmatch(4) == '.' and getChunk(5)
                setValue -1 'url protocol'
                addValues 3 'url'
                setValue  3 'url domain'
                setValue  4 'punct url tld'
                setValue  5 'url tld'

                return 6

        if chunk.match == '.'
            if not prev.clss.startsWith('number') and prev.clss != 'semver' and prev.match not in '\\./'
                if next = getChunk 1
                    if next.start == chunk.start+chunk.length
                        fileext = next.match
                        if fileext not in '\\./*+'
                            setValue -1 fileext + ' file'
                            addValue  0 fileext
                            setValue  1 fileext + ' ext'
                            return 2

        if chunk.match == '/'

            for i in [chunkIndex..0]
                break if line.chunks[i].start+line.chunks[i].length < line.chunks[i+1]?.start
                break if line.chunks[i].clss.endsWith 'dir'
                break if line.chunks[i].clss.startsWith 'url'
                break if line.chunks[i].match == '"'
                if line.chunks[i].clss.startsWith 'punct'
                    line.chunks[i].clss = 'punct dir'
                else
                    line.chunks[i].clss = 'text dir'

            return 1
    0

urlWord = ->

    if prev = getChunk -1
        if prev.match in '\\/'
            next = getChunk 1
            if not next or next.start > chunk.start+chunk.length or next.match not in '\\./'
                addValue 0, 'file'

#       000   0000000
#       000  000
#       000  0000000
# 000   000       000
#  0000000   0000000

jsPunct = ->

    return if notCode

    if prev = getChunk -1
        if chunk.match == '('
            if prev.clss.startsWith('text') or prev.clss == 'property'
                setValue -1 'function call'
                return 1

jsWord = ->

    if chunk.clss == 'keyword function'
        if getmatch(-1) == '=' and getValue(-2).startsWith 'text'
            setValue -2 'function'
    0 # we need this here

dict = ->

    return if notCode

    if chunk.match == ':' and not chunk.turd?.startsWith '::'
        if prev = getChunk -1
            if prev.clss.split(' ')[0] in ['string' 'number' 'text' 'keyword']
                setValue -1 'dictionary key'
                setValue  0 'punct dictionary'
                return 1

#       000   0000000   0000000   000   000
#       000  000       000   000  0000  000
#       000  0000000   000   000  000 0 000
# 000   000       000  000   000  000  0000
#  0000000   0000000    0000000   000   000

jsonPunct = ->

    return if notCode

    if chunk.match == ':'
        if prev = getChunk -1
            if prev.match == '"'
                for i in [Math.max(0,chunkIndex-2)..0]
                    if line.chunks[i]?.clss == 'punct string double'
                        line.chunks[i].clss = 'punct dictionary'
                        break
                    line.chunks[i]?.clss = 'dictionary key'
                setValue -1 'punct dictionary'
                setValue  0 'punct dictionary'
                return 1

jsonWord = ->

    if (topType == 'string double' or topType == 'string single') and prev = getChunk -1
        if prev.match in '"^~='
            if NUMBER.test(getmatch(0)) and getmatch(1) == '.' and NUMBER.test(getmatch(2)) and getmatch(3) == '.' and NUMBER.test(getmatch(4))
                if prev.match in '^~='
                    setValue -1 'punct semver' 
                    setValue -2 'punct semver' if getmatch(-2) == '>'
                setValue 0 'semver'
                setValue 1 'punct semver'
                setValue 2 'semver'
                setValue 3 'punct semver'
                setValue 4 'semver'
                return 5

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
            chunk.clss += ' regexp end'
            popStack()
            return 1

        if chunkIndex
            prev = getChunk -1
            next = getChunk +1
            if not prev.clss.startsWith('punct') and not prev.clss.startsWith('keyword') or prev.match in ")]"
                return if (prev.start+prev.length <  chunk.start) and next?.start >  chunk.start+1
                return if (prev.start+prev.length == chunk.start) and next?.start == chunk.start+1

            return if next?.match == '='
            return if prev.clss.startsWith 'number'

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

        if chunk.match == "'"
            next = getChunk 1
            
            if next?.match in ['s' 'd' 't' 'll' 're']
                if next.start == chunk.start + chunk.length
                    scnd = getChunk 2
                    if not scnd or scnd.match != "'"
                        return stacked()
            
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

# 000   000  000   000  00     00  0000000    00000000  00000000
# 0000  000  000   000  000   000  000   000  000       000   000
# 000 0 000  000   000  000000000  0000000    0000000   0000000
# 000  0000  000   000  000 0 000  000   000  000       000   000
# 000   000   0000000   000   000  0000000    00000000  000   000

number = ->

    return if notCode

    if NUMBER.test chunk.match

        if getmatch(-1) == '.'

            if getValue(-4) == 'number float' and getValue(-2) == 'number float'
                if getmatch(-5) in '^~='
                    setValue -5 'punct semver' 
                    setValue -6 'punct semver' if getmatch(-6) == '>'
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

        chunk.clss = 'number'
        return 1

    if HEXNUM.test chunk.match

        chunk.clss = 'number hex'
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

        chunk.clss = 'number float'
        return 1

#  0000000   0000000   0000000
# 000       000       000
# 000       0000000   0000000
# 000            000       000
#  0000000  0000000   0000000

cssWord = ->

    if chunk.match[-2..] in ['px''em''ex'] and NUMBER.test chunk.match[...-2]
        setValue 0 'number'
        return 1

    if chunk.match[-1..] in ['s'] and NUMBER.test chunk.match[...-1]
        setValue 0 'number'
        return 1

    if prev = getChunk -1

        if prev.match == '.' and getChunk(-2)?.clss != 'number'
            addValue -1 'class'
            setValue  0 'class'
            return 1

        if prev.match == "#"

            if chunk.match.length == 3 or chunk.match.length == 6
                if HEX.test chunk.match
                    addValue -1 'number hex'
                    setValue  0 'number hex'
                    return 1

            addValue -1 'function'
            setValue  0 'function'
            return 1

        if prev.match == '-'
            if prevPrev = getChunk -2
                if prevPrev.clss in ['class''function']
                    addValue -1 prevPrev.clss
                    setValue  0 prevPrev.clss
                    return 1

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

    if topType?.startsWith 'string double'

        if chunk.turd?.startsWith "\#{"
            pushStack type:'interpolation', weak:true
            setValue 0 'punct string interpolation start'
            setValue 1 'punct string interpolation start'
            return 2

    else if topType == 'interpolation'

        if chunk.match == '}'
            setValue 0 'punct string interpolation end'
            popStack()
            return 1

# 000   000  00000000  000   000  000   000   0000000   00000000   0000000
# 000  000   000        000 000   000 0 000  000   000  000   000  000   000
# 0000000    0000000     00000    000000000  000   000  0000000    000   000
# 000  000   000          000     000   000  000   000  000   000  000   000
# 000   000  00000000     000     00     00   0000000   000   000  0000000

keyword = ->

    return if notCode

    if not lang[ext]
        # log "no lang for ext? #{ext}"
        return

    if lang[ext].hasOwnProperty(chunk.match)
        chunk.clss = lang[ext][chunk.match]
        return # give coffeeFunc a chance, number bails for us

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

    return if notCode

    if chunk.match == '/' and getChunk(-1)?.start + getChunk(-1)?.length == chunk.start
        return addValue -1 'dir'

    if chunk.turd == '--' and getChunk(2)?.start == chunk.start+2 and getChunk(-1)?.start+getChunk(-1)?.length < chunk.start
        addValue 0 'argument'
        addValue 1 'argument'
        setValue 2 'argument'
        return 3

    if chunk.match == '-' and getChunk(1)?.start == chunk.start+1 and getChunk(-1)?.start+getChunk(-1)?.length < chunk.start
        addValue 0 'argument'
        setValue 1 'argument'
        return 2
        
    if chunk.match == '~' and (not getChunk(-1) or getChunk(-1).start + getChunk(-1).length < chunk.start)
        setValue 0 'text dir'
        return 1

#  0000000  000000000   0000000    0000000  000   000
# 000          000     000   000  000       000  000
# 0000000      000     000000000  000       0000000
#      000     000     000   000  000       000  000
# 0000000      000     000   000   0000000  000   000

stacked = ->

    if stackTop
        return if stackTop.weak
        if stackTop.strong
            chunk.clss = topType
        else
            chunk.clss += ' ' + topType
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

getChunk = (d) -> line.chunks[chunkIndex+d]
setValue = (d, value) -> if 0 <= chunkIndex+d < line.chunks.length then line.chunks[chunkIndex+d].clss = value
getValue = (d) -> getChunk(d)?.clss ? ''
getmatch = (d) -> getChunk(d)?.match ? ''
addValue = (d, value) ->
    if 0 <= chunkIndex+d < line.chunks.length
        line.chunks[chunkIndex+d].clss += ' ' + value
    1

addValues = (n,value) ->
    for i in [0...n]
        addValue i, value
    n

handlers =
    coffee:
          punct:[ blockComment, hashComment, tripleRegexp, coffeePunct, tripleString, simpleString, interpolation, dashArrow, regexp, dict ]
          word: [ keyword, coffeeWord, number, property ]
    noon: punct:[ noonComment,  noonPunct, urlPunct                                          ], word:[ noonWord, urlWord, number          ]
    js:   punct:[ starComment,  slashComment, jsPunct, simpleString, dashArrow, regexp, dict ], word:[ keyword, jsWord, number, property  ]
    ts:   punct:[ starComment,  slashComment, jsPunct, simpleString, dashArrow, regexp, dict ], word:[ keyword, jsWord, number, property  ]
    iss:  punct:[ starComment,  slashComment, simpleString                                   ], word:[ keyword, number                    ]
    ini:  punct:[ starComment,  slashComment, simpleString, cppMacro, cppPointer             ], word:[          number                    ]
    cpp:  punct:[ starComment,  slashComment, simpleString, cppMacro, cppPointer             ], word:[ keyword, number, float, cppWord    ]
    frag: punct:[ starComment,  slashComment, simpleString, cppMacro, cppPointer             ], word:[ keyword, number, float, cppWord    ]
    vert: punct:[ starComment,  slashComment, simpleString, cppMacro, cppPointer             ], word:[ keyword, number, float, cppWord    ]
    hpp:  punct:[ starComment,  slashComment, simpleString, cppMacro, cppPointer             ], word:[ keyword, number, float, cppWord    ]
    c:    punct:[ starComment,  slashComment, simpleString, cppMacro, cppPointer             ], word:[ keyword, number, float, cppWord    ]
    h:    punct:[ starComment,  slashComment, simpleString, cppMacro, cppPointer             ], word:[ keyword, number, float, cppWord    ]
    cs:   punct:[ starComment,  slashComment, simpleString                                   ], word:[ keyword, number                    ]
    pug:  punct:[ starComment,  slashComment, simpleString                                   ], word:[ keyword, cssWord, number           ]
    styl: punct:[ starComment,  slashComment, simpleString                                   ], word:[ keyword, cssWord, number           ]
    css:  punct:[ starComment,  slashComment, simpleString                                   ], word:[ keyword, cssWord, number           ]
    sass: punct:[ starComment,  slashComment, simpleString                                   ], word:[ keyword, cssWord, number           ]
    scss: punct:[ starComment,  slashComment, simpleString                                   ], word:[ keyword, cssWord, number           ]
    swift: punct:[ starComment,  slashComment, simpleString, dict                            ], word:[ keyword, number, property          ]
    svg:  punct:[               simpleString, xmlPunct                                       ], word:[ keyword, number                    ]
    html: punct:[               simpleString, xmlPunct                                       ], word:[ keyword, number                    ]
    htm:  punct:[               simpleString, xmlPunct                                       ], word:[ keyword, number                    ]
    xml:  punct:[               simpleString, xmlPunct                                       ], word:[ number                             ]
    sh:   punct:[ hashComment,  simpleString, urlPunct, shPunct                              ], word:[ keyword, urlWord, number           ]
    json: punct:[               simpleString, jsonPunct, urlPunct                            ], word:[ keyword, jsonWord, urlWord, number ]
    yml:  punct:[ hashComment,  simpleString, urlPunct, shPunct, dict                        ], word:[ keyword, jsonWord, urlWord, number, property ]
    yaml: punct:[ hashComment,  simpleString, urlPunct, shPunct, dict                        ], word:[ keyword, jsonWord, urlWord, number, property ]
    log:  punct:[               simpleString, urlPunct, dict                                 ], word:[ urlWord, number                    ]
    md:   punct:[                    mdPunct, urlPunct, xmlPunct                             ], word:[ urlWord, number                    ]
    fish: punct:[                hashComment, simpleString                                   ], word:[ keyword, number                    ]
    py:   punct:[                hashComment, simpleString                                   ], word:[ keyword, number                    ]

for ext in exts
    if not handlers[ext]?
        handlers[ext] = punct:[ simpleString ], word:[ number ]

for ext,obj of handlers
    handlers[ext].punct.push stacked
    handlers[ext].word.push stacked

###
0000000    000       0000000    0000000  000   000  00000000  0000000
000   000  000      000   000  000       000  000   000       000   000
0000000    000      000   000  000       0000000    0000000   000   000
000   000  000      000   000  000       000  000   000       000   000
0000000    0000000   0000000    0000000  000   000  00000000  0000000
###

▸doc 'blocked lines'

    lines: array of chunked lines

    returns lines with
    - 'ext' switched in some lines
    - 'value' changed in chunks that match language patterns

blocked = (lines) ->

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

    # 000      000  000   000  00000000   0000000
    # 000      000  0000  000  000       000
    # 000      000  000 0 000  0000000   0000000
    # 000      000  000  0000  000            000
    # 0000000  000  000   000  00000000  0000000

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
                        chunk.clss = 'comment triple header'
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
            if not handl
                ▸dbg line
                ▸dbg handlers
            ▸assert handl

        #  0000000  000   000  000   000  000   000  000   000   0000000
        # 000       000   000  000   000  0000  000  000  000   000
        # 000       000000000  000   000  000 0 000  0000000    0000000
        # 000       000   000  000   000  000  0000  000  000        000
        #  0000000  000   000   0000000   000   000  000   000  0000000

        chunkIndex = 0
        while chunkIndex < line.chunks.length

            chunk = line.chunks[chunkIndex]

            beforeIndex = chunkIndex

            if chunk.clss.startsWith 'punct'

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
                    if mtch = swtch[line.ext]?[chunk.match]
                        if mtch.turd
                            turdChunk = getChunk -mtch.turd.length
                            if mtch.turd == (turdChunk?.turd ? turdChunk?.match)
                                # push a new extension onto the stack, ext will change on start of next line
                                pushExt mtch
                        else if mtch.next and getChunk(1).match == mtch.next
                            pushExt mtch
                
                for hnd in handl.word ? []
                    if advance = hnd()
                        chunkIndex += advance
                        break

            if chunkIndex == beforeIndex
                chunkIndex++
    lines

rpad = (s, l) ->
    s = String s
    while s.length < l then s += ' '
    s

pad = (l) -> rpad '', l
    
replaceTabs = (s) ->
    i = 0
    while i < s.length
        if s[i] == '\t'
            s = s[...i] + pad(4-(i%4)) + s[i+1..]
        i += 1
    s

parse = (lines, ext='coffee') -> blocked chunked lines, ext

# 000   000   0000000   000       0000000   00000000   000  0000000  00000000  
# 000  000   000   000  000      000   000  000   000  000     000   000       
# 0000000    000   000  000      000   000  0000000    000    000    0000000   
# 000  000   000   000  000      000   000  000   000  000   000     000       
# 000   000   0000000   0000000   0000000   000   000  000  0000000  00000000  

kolorize = (chunk) -> 
    
    if cn = kolor.map[chunk.clss]
        if cn instanceof Array
            v = chunk.match
            for cr in cn
                v = kolor[cr] v
            return v
        else
            return kolor[cn] chunk.match
            
    if chunk.clss.endsWith 'file'
        w8 chunk.match
    else if chunk.clss.endsWith 'ext'
        w3 chunk.match
    else if chunk.clss.startsWith 'punct'
        if LI.test chunk.clss
            kolorize match:chunk.match, clss:chunk.clss.replace LI, ' '
        else
            w2 chunk.match
    else
        if LI.test chunk.clss
            kolorize match:chunk.match, clss:chunk.clss.replace LI, ' '
        else
            chunk.match

kolorizeChunks = (chunks:[], number:) ->
    
    clrzd = ''
    if number
        numstr = String number
        clrzd += w2(numstr) + rpad '', 4-numstr.length
        
    c = 0
    for i in [0...chunks.length]
        while c < chunks[i].start 
            clrzd += ' '
            c++
        clrzd += kolorize chunks[i]
        c += chunks[i].length
    clrzd
            
#  0000000  000   000  000   000  000000000   0000000   000   000  
# 000        000 000   0000  000     000     000   000   000 000   
# 0000000     00000    000 0 000     000     000000000    00000    
#      000     000     000  0000     000     000   000   000 000   
# 0000000      000     000   000     000     000   000  000   000  

syntax = (text:text, ext:'coffee', numbers:false) ->
    
    lines = text.split NEWLINE
    rngs  = parse(lines, ext).map (l) -> l.chunks
    
    clines = []
    for index in [0...lines.length]
        line = lines[index]
        if ext == 'js' and line.startsWith '//# sourceMappingURL'
            continue
        clines.push kolorizeChunks chunks:rngs[index], number:numbers and index+1
    clines.join '\n'

# 00000000  000   000  00000000    0000000   00000000   000000000   0000000  
# 000        000 000   000   000  000   000  000   000     000     000       
# 0000000     00000    00000000   000   000  0000000       000     0000000   
# 000        000 000   000        000   000  000   000     000          000  
# 00000000  000   000  000         0000000   000   000     000     0000000   

module.exports =

    kolor:      kolor
    exts:       exts
    parse:      parse
    chunked:    chunked
    ranges:     (line, ext='coffee')  -> parse([line], ext)[0].chunks
    dissect:    (lines, ext='coffee') -> parse(lines, ext).map (l) -> l.chunks
    kolorize:   kolorize
    kolorizeChunks: kolorizeChunks
    syntax:     syntax

# 00000000   00000000    0000000   00000000  000  000      00000000
# 000   000  000   000  000   000  000       000  000      000
# 00000000   0000000    000   000  000000    000  000      0000000
# 000        000   000  000   000  000       000  000      000
# 000        000   000   0000000   000       000  0000000  00000000

▸test 'profile'

    { slash } = require 'kxk'
    text0 = slash.readText "#{__dirname}/../../koffee/coffee/nodes.coffee"
    text1 = slash.readText "#{__dirname}/test.coffee"

    lines0 = text0.split '\n'
    lines1 = text1.split '\n'

    for i in [0..5]
        parse lines0

    ▸average 100
        parse lines0
