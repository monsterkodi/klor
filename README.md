
## 🦋 klor

**klor** is a simple syntax highlighting tool.

It exports the following:

#### blocks

**blocks** *lines*, *ext*

*lines*: array of strings
*ext*: file type
    
**returns** array of objects:

```coffeescript
    chunks: [
                turd:   string
                match:  string 
                value:  string
                start:  number
                length: number
            ]
    ext:    string
    chars:  number
    index:  number
    number: index+1
```
#### exts

list of supported file types

- koffee coffee js ts 
- styl css sass scss 
- pug html htm svg 
- cpp hpp cxx c h 
- bash fish sh 
- noon json
- md plist 
- iss ini
- txt log 

### 🌈 kolor

**kolor** is a submodule of **klor** which exports a bunch of functions that wrap strings in 256 color ansi codes.

It's a merge of [colorette](https://github.com/jorgebucaran/colorette) and [ansi-256-colors](https://github.com/jbnicolai/ansi-256-colors)

[r g b c m y w][1..8] foreground colors 
[R G B C M Y W][1..8] background colors
    
```coffeescript
klor = require 'klor'
klor.kolor.globalize() # hoist color functions into the global scope
log y8 'bright yellow' + R1 'on dark red'
```
