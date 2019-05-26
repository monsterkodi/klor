
## 🦋 klor

**klor** is a simple syntax highlighting tool.

It exports the following function:

### **blocks** *lines*, *ext*

- *lines*: array of strings
- *ext*: file type
    - coffee js ts 
    - styl css sass
    - pug html svg 
    - bash fish sh 
    - cpp hpp c h 
    - noon json
    - md plist 
    
**returns** an array of objects:

```coffeescript
[
    chunks: [
                match:  string 
                value:  string
                turd:   string
                start:  number
                length: number
            ]
    ext:    string
    chars:  number
    index:  number
    number: index+1
...
]
```

## 🌈 kolor

**kolor** is a submodule of **klor** which exports a bunch of functions that wrap strings in 256 color ansi codes.

It's a merge of [colorette](https://github.com/jorgebucaran/colorette) and [ansi-256-colors](https://github.com/jbnicolai/ansi-256-colors)

- [r g b c m y w][1..8] foreground colors 
- [R G B C M Y W][1..8] background colors
    
```coffeescript
klor = require 'klor'
klor.kolor.globalize() # hoist color functions into the global scope
log y8 'bright yellow' + R1 'on dark red'
```
