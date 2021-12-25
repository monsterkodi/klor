// monsterkodi/kode 0.181.0

var _k_ = {list: function (l) {return (l != null ? typeof l.length === 'number' ? l : [] : [])}, in: function (a,l) {return (typeof l === 'string' && typeof a === 'string' && a.length ? '' : []).indexOf.call(l,a) >= 0}}

var ext, exts, fs, json, jsonFile, keywords, lang, names, noon_load, noonFile, path, value, word, words, _25_18_

fs = require('fs')
noon_load = require('noon/js/load')
path = require('path')
noonFile = path.join(__dirname,'lang.noon')
jsonFile = path.join(__dirname,'..','js','lang.json')
console.log('compile:',noonFile)
console.log('output:',jsonFile)
lang = {}
exts = ['txt','log']
for (names in noon_load(noonFile))
{
    keywords = noon_load(noonFile)[names]
    var list = _k_.list(names.split(/\s/))
    for (var _23_12_ = 0; _23_12_ < list.length; _23_12_++)
    {
        ext = list[_23_12_]
        if (!(_k_.in(ext,exts)))
        {
            exts.push(ext)
        }
        lang[ext] = ((_25_18_=lang[ext]) != null ? _25_18_ : {})
        for (value in keywords)
        {
            words = keywords[value]
            var list1 = _k_.list(words)
            for (var _27_21_ = 0; _27_21_ < list1.length; _27_21_++)
            {
                word = list1[_27_21_]
                lang[ext][word] = value
            }
        }
    }
}
json = JSON.stringify({exts:exts,lang:lang},null,'    ')
fs.writeFileSync(jsonFile,json,'utf8')