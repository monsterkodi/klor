
/*
 0000000  000   000  000   000  000000000   0000000   000   000
000        000 000   0000  000     000     000   000   000 000 
0000000     00000    000 0 000     000     000000000    00000  
     000     000     000  0000     000     000   000   000 000 
0000000      000     000   000     000     000   000  000   000
 */
var $, Syntax, _, empty, error, first, last, log, noon, ref, slash, str, valid,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

ref = require('../../kxk'), slash = ref.slash, first = ref.first, valid = ref.valid, empty = ref.empty, last = ref.last, noon = ref.noon, str = ref.str, error = ref.error, log = ref.log, $ = ref.$, _ = ref._;

log = console.log;

Syntax = (function() {
  function Syntax() {}

  Syntax.exts = [];

  Syntax.lang = null;

  Syntax.init = function() {
    var data, ext, extNames, info, mtchInfo, results, value, valueWords, word, words;
    if (Syntax.lang !== null) {
      return;
    }
    data = noon.load(slash.join(__dirname, '..', 'coffee', 'lang.noon'));
    Syntax.lang = {};
    Syntax.info = {};
    Syntax.mtch = {};
    Syntax.fill = {};
    Syntax.word = {};
    Syntax.turd = {};
    results = [];
    for (extNames in data) {
      valueWords = data[extNames];
      results.push((function() {
        var base, i, len, ref1, results1;
        ref1 = extNames.split(/\s/);
        results1 = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          ext = ref1[i];
          if (indexOf.call(Syntax.exts, ext) < 0) {
            Syntax.exts.push(ext);
          }
          if ((base = Syntax.lang)[ext] == null) {
            base[ext] = {};
          }
          results1.push((function() {
            var base1, results2;
            results2 = [];
            for (value in valueWords) {
              words = valueWords[value];
              if (value === 'comment') {
                if ((base1 = Syntax.info)[ext] == null) {
                  base1[ext] = {};
                }
                results2.push(Syntax.info[ext][value] = words);
              } else if (value === 'match') {
                results2.push((function() {
                  var base2, base3, base4, base5, base6, name, results3;
                  results3 = [];
                  for (value in words) {
                    mtchInfo = words[value];
                    if (mtchInfo.fill) {
                      if ((base2 = Syntax.fill)[ext] == null) {
                        base2[ext] = {};
                      }
                      mtchInfo.value = value;
                      results3.push(Syntax.fill[ext][mtchInfo.fill] = mtchInfo);
                    } else if (mtchInfo.end) {
                      if ((base3 = Syntax.mtch)[ext] == null) {
                        base3[ext] = {};
                      }
                      if ((base4 = Syntax.mtch[ext])[name = last(mtchInfo.end)] == null) {
                        base4[name] = [];
                      }
                      mtchInfo.value = value;
                      results3.push(Syntax.mtch[ext][last(mtchInfo.end)].push(mtchInfo));
                    } else if (mtchInfo.turd) {
                      if ((base5 = Syntax.turd)[ext] == null) {
                        base5[ext] = {};
                      }
                      mtchInfo.match = value;
                      results3.push(Syntax.turd[ext][value] = mtchInfo);
                    } else {
                      if ((base6 = Syntax.word)[ext] == null) {
                        base6[ext] = {};
                      }
                      mtchInfo.value = value;
                      results3.push(Syntax.word[ext][value] = mtchInfo);
                    }
                  }
                  return results3;
                })());
              } else {
                if (!_.isArray(words)) {
                  results2.push((function() {
                    var base2, base3, results3;
                    results3 = [];
                    for (word in words) {
                      info = words[word];
                      if (info) {
                        if ((base2 = Syntax.info)[ext] == null) {
                          base2[ext] = {};
                        }
                        if ((base3 = Syntax.info[ext])[value] == null) {
                          base3[value] = [];
                        }
                        results3.push(Syntax.info[ext][value].push({
                          kind: word[0] === 't' ? 'turd' : 'word',
                          offset: parseInt(word.slice(1)),
                          info: info
                        }));
                      } else {
                        results3.push(Syntax.lang[ext][word] = value);
                      }
                    }
                    return results3;
                  })());
                } else {
                  results2.push((function() {
                    var j, len1, results3;
                    results3 = [];
                    for (j = 0, len1 = words.length; j < len1; j++) {
                      word = words[j];
                      results3.push(Syntax.lang[ext][word] = value);
                    }
                    return results3;
                  })());
                }
              }
            }
            return results2;
          })());
        }
        return results1;
      })());
    }
    return results;
  };

  Syntax.ranges = function(text, ext) {
    var char, i, len, obj;
    Syntax.init();
    obj = {
      ext: ext != null ? ext : 'txt',
      rgs: [],
      words: [],
      word: '',
      turd: '',
      last: '',
      index: 0,
      text: text
    };
    switch (obj.ext) {
      case 'cpp':
      case 'hpp':
      case 'c':
      case 'h':
      case 'cc':
      case 'cxx':
      case 'cs':
        obj.cpplang = true;
        obj.cpp = true;
        break;
      case 'coffee':
      case 'koffee':
      case 'js':
      case 'ts':
        obj.jslang = true;
        obj[obj.ext] = true;
        if (obj.ext === 'koffee') {
          obj.coffee = true;
        }
        break;
      case 'html':
      case 'htm':
        obj.html = true;
        break;
      case 'yaml':
      case 'yml':
        obj.yaml = true;
        break;
      case 'css':
      case 'styl':
      case 'scss':
      case 'sass':
        obj.csslang = true;
        obj[obj.ext] = true;
        break;
      default:
        obj[obj.ext] = true;
    }
    if (obj.jslang || obj.iss || obj.log || obj.json || obj.yaml) {
      obj.dictlang = true;
    }
    if (obj.csslang || obj.iss || obj.pug) {
      obj.dashlang = true;
    }
    if (obj.cpplang || obj.jslang || obj.log) {
      obj.dotlang = true;
    }
    if (obj.xml || obj.html || obj.plist) {
      obj.xmllang = true;
    }
    for (i = 0, len = text.length; i < len; i++) {
      char = text[i];
      if (obj.char === '\\') {
        if (obj.escp) {
          delete obj.escp;
        } else {
          obj.escp = true;
        }
      } else {
        delete obj.escp;
      }
      obj.char = char;
      if (obj.interpolation && obj.char === '}') {
        Syntax.endWord(obj);
        obj.rgs.push({
          start: obj.index,
          match: obj.char,
          value: obj.interpolation + " punctuation"
        });
        obj.string = {
          start: obj.index + 1,
          value: obj.interpolation,
          match: ''
        };
        obj.index++;
        continue;
      }
      if (obj.string) {
        Syntax.doString(obj);
      } else if (obj.comment) {
        Syntax.doComment(obj);
      } else {
        switch (char) {
          case "'":
          case '"':
          case '`':
            if (!obj.escp && (char !== "'" || obj.jslang || obj.pug)) {
              Syntax.startString(obj);
            } else {
              Syntax.doPunct(obj);
            }
            break;
          case '+':
          case '*':
          case '<':
          case '>':
          case '=':
          case '^':
          case '~':
          case '@':
          case '$':
          case '&':
          case '%':
          case '#':
          case '/':
          case '\\':
          case ':':
          case '.':
          case ';':
          case ',':
          case '!':
          case '?':
          case '|':
          case '{':
          case '}':
          case '(':
          case ')':
          case '[':
          case ']':
            Syntax.doPunct(obj);
            break;
          case '-':
            if (obj.dashlang) {
              Syntax.doWord(obj);
            } else {
              Syntax.doPunct(obj);
            }
            break;
          case ' ':
          case '\t':
            Syntax.endWord(obj);
            break;
          default:
            Syntax.doWord(obj);
        }
        if (char !== ' ' && char !== '\t') {
          Syntax.coffeeCall(obj);
        }
      }
      obj.index++;
    }
    obj.char = null;
    Syntax.endWord(obj);
    Syntax.endLine(obj);
    return obj.rgs;
  };

  Syntax.endWord = function(obj) {
    var char, clss, getMatch, getValue, i, index, j, k, l, lastTurd, lcword, len, match, matchValue, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref22, ref3, ref4, ref5, ref6, ref7, ref8, ref9, setClass, setValue, turdInfo, valueInfo, word, wordInfo, wordValue;
    char = (ref1 = obj.char) != null ? ref1 : '';
    obj.turd += char;
    switch (char) {
      case ' ':
      case '\t':
        Syntax.doTurd(obj);
        if ((obj.regexp != null) && !obj.escp) {
          delete obj.regexp;
        }
        if (obj.noon) {
          if (obj.turd.endsWith('  ')) {
            if (((ref2 = first(obj.rgs)) != null ? ref2.start : void 0) > 0) {
              for (index = i = 0, ref3 = obj.rgs.length; 0 <= ref3 ? i < ref3 : i > ref3; index = 0 <= ref3 ? ++i : --i) {
                Syntax.substitute(obj, -index - 1, ['text'], ['property']);
                Syntax.substitute(obj, -index - 1, ['punctuation'], ['property punctuation']);
              }
            }
          }
        }
    }
    if (valid(obj.word)) {
      word = obj.word;
      obj.words.push(word);
      obj.word = '';
      getValue = function(back) {
        if (back == null) {
          back = -1;
        }
        return Syntax.getValue(obj, back);
      };
      getMatch = function(back) {
        if (back == null) {
          back = -1;
        }
        return Syntax.getMatch(obj, back);
      };
      setValue = function(back, value) {
        return Syntax.setValue(obj, back, value);
      };
      setClass = function(clss) {
        var ref4;
        if (obj.coffee) {
          if (((ref4 = last(obj.rgs)) != null ? ref4.match : void 0) === '@') {
            if (clss === 'text') {
              clss = 'member';
            }
            last(obj.rgs).value = clss + ' punctuation';
          }
        } else if (obj.js) {
          if (clss === 'keyword function') {
            Syntax.replace(obj, -2, [
              {
                word: true
              }, {
                match: '='
              }
            ], [
              {
                value: 'function'
              }
            ]);
          }
        }
        obj.rgs.push({
          start: obj.index - word.length,
          match: word,
          value: clss
        });
        return null;
      };
      if (valid(obj.fill)) {
        return setClass(obj.fill.value);
      }
      switch (char) {
        case ':':
          if (obj.dictlang) {
            return setClass('dictionary key');
          }
          break;
        case '=':
          if (obj.ini) {
            return setClass('property');
          }
      }
      if (Syntax.turd[obj.ext]) {
        lastTurd = last(obj.last.split(/\s+/));
        if (turdInfo = Syntax.turd[obj.ext][lastTurd]) {
          if (turdInfo.spaced !== true || obj.last[obj.last.length - lastTurd.length - 1] === ' ') {
            if (turdInfo['w-1']) {
              setValue(-turdInfo.match.length - 1, turdInfo['w-1']);
            }
            for (index = j = 0, ref4 = turdInfo.match.length; 0 <= ref4 ? j < ref4 : j > ref4; index = 0 <= ref4 ? ++j : --j) {
              setValue(-index - 1, turdInfo.turd);
            }
            if (turdInfo['w-0']) {
              return setClass(turdInfo['w-0']);
            }
          }
        }
      }
      lcword = word.toLowerCase();
      if (wordInfo = (ref5 = Syntax.word[obj.ext]) != null ? ref5[lcword] : void 0) {
        if (ref6 = obj.last, indexOf.call(Object.keys(wordInfo['t-1']), ref6) >= 0) {
          setValue(-2, wordInfo.value + ' ' + wordInfo['w-1']);
          setValue(-1, wordInfo.value + ' ' + wordInfo['t-1'][obj.last]);
          return setClass(wordInfo.value + ' ' + wordInfo.word);
        }
      }
      if (wordValue = (ref7 = Syntax.lang[obj.ext]) != null ? ref7[lcword] : void 0) {
        if (((ref8 = Syntax.info[obj.ext]) != null ? ref8[wordValue] : void 0) != null) {
          ref9 = Syntax.info[obj.ext][wordValue];
          for (k = 0, len = ref9.length; k < len; k++) {
            valueInfo = ref9[k];
            ref10 = valueInfo.info;
            for (match in ref10) {
              matchValue = ref10[match];
              if (obj.last.trim().endsWith(match)) {
                for (index = l = 0, ref11 = match.length; 0 <= ref11 ? l < ref11 : l > ref11; index = 0 <= ref11 ? ++l : --l) {
                  setValue(-1 - index, matchValue + ' punctuation');
                }
                return setClass(matchValue);
              }
            }
          }
        } else {
          return setClass(wordValue);
        }
      }
      if (obj.coffee) {
        if ((ref12 = getMatch(-1)) === 'class' || ref12 === 'extends') {
          return setClass('class');
        }
        if (((ref13 = getValue(-1)) != null ? typeof ref13.indexOf === "function" ? ref13.indexOf('punctuation') : void 0 : void 0) < 0) {
          if (word !== 'else' && word !== 'then' && word !== 'and' && word !== 'or' && word !== 'in') {
            if ((ref14 = last(obj.rgs).value) !== 'keyword' && ref14 !== 'function head' && ref14 !== 'require' && ref14 !== 'number') {
              setValue(-1, 'function call');
            }
          }
        }
      }
      if (/^0x[a-fA-F\d][a-fA-F\d][a-fA-F\d]+$/.test(word)) {
        setValue(-2, 'number hex punctuation');
        setValue(-1, 'number hex punctuation');
        return setClass('number hex');
      }
      if (getMatch(-1) === "#") {
        if (/^[a-fA-F\d]+$/.test(word)) {
          setValue(-1, 'number hex punctuation');
          return setClass('number hex');
        }
      }
      if (obj.noon) {
        if (obj.words.length === 1) {
          if (empty(obj.last)) {
            return setClass('class');
          }
        }
      } else if (obj.sh) {
        if (obj.words.length > 1 && getMatch(-1) === '-' && getValue(-2) === 'argument') {
          setClass(-1, 'argument punctuation');
          return setClass('argument');
        }
      }
      if (obj.cpplang) {
        if (obj.last === '::') {
          if (obj.rgs.length >= 3) {
            setValue(-3, 'namespace');
            setValue(-2, 'punctuation namespace');
            setValue(-1, 'punctuation namespace');
            if (char === '(') {
              return setClass('function call');
            }
            return setClass('property');
          }
        }
        if (/^[\\_A-Z][\\_A-Z0-9]+$/.test(word)) {
          return setClass('macro');
        }
        if (/^[UA][A-Z]\w+$/.test(word)) {
          return setClass('type class');
        } else if (/^[SF][A-Z]\w+$/.test(word)) {
          return setClass('type struct');
        } else if (/^[E][A-Z]\w+$/.test(word)) {
          return setClass('type enum');
        }
        if (indexOf.call(obj.words, 'class') >= 0) {
          return setClass('class');
        }
        if (char === '<') {
          return setClass('type template');
        }
        if (obj.last === '::') {
          if ((ref15 = getValue(-3)) === 'enum' || ref15 === 'class' || ref15 === 'struct') {
            log('really?');
            clss = getValue(-3);
            setValue(-3, getValue(-3) + ' punctuation');
            setValue(-2, getValue(-3) + ' punctuation');
            setValue(-1, getValue(-3) + ' punctuation');
          }
        }
        if (obj.last === '.' && /^\d+f$/.test(word)) {
          if (getValue(-2) === 'number') {
            setValue(-2, 'number float');
            setValue(-1, 'number float punctuation');
            return setClass('number float');
          }
        }
        if (obj.last.endsWith("##")) {
          setValue(-2, 'punctuation operator');
          setValue(-1, 'punctuation operator');
        } else if (obj.last.endsWith('->')) {
          setValue(-3, 'obj');
          setValue(-2, 'property punctuation');
          setValue(-1, 'property punctuation');
          return setClass('property');
        }
        if (first(obj.words).startsWith('U') && ((ref16 = first(obj.rgs)) != null ? ref16.value : void 0) === 'macro') {
          if (word.startsWith('Blueprint')) {
            return setClass('macro punctuation');
          }
          if ((ref17 = word.toLowerCase()) === 'meta' || ref17 === 'displayname' || ref17 === 'category' || ref17 === 'worldcontext' || ref17 === 'editanywhere') {
            return setClass('macro punctuation');
          }
          if ((ref18 = word.toLowerCase()) === 'config' || ref18 === 'transient' || ref18 === 'editdefaultsonly' || ref18 === 'visibleanywhere' || ref18 === 'nontransactional' || ref18 === 'interp' || ref18 === 'globalconfig') {
            return setClass('macro');
          }
        }
      }
      if (/^\d+$/.test(word)) {
        if (obj.last === '.') {
          if (getValue(-4) === 'number float' && getValue(-2) === 'number float') {
            setValue(-4, 'semver');
            setValue(-3, 'semver punctuation');
            setValue(-2, 'semver');
            setValue(-1, 'semver punctuation');
            return setClass('semver');
          }
          if (getValue(-2) === 'number') {
            setValue(-2, 'number float');
            setValue(-1, 'number float punctuation');
            return setClass('number float');
          }
        }
        return setClass('number');
      }
      if (obj.dotlang) {
        if ((ref19 = obj.last) === '.' || ref19 === ':') {
          if ((ref20 = getValue(-2)) === 'text' || ref20 === 'module' || ref20 === 'class' || ref20 === 'member' || ref20 === 'keyword') {
            if (getValue(-2) === 'text') {
              setValue(-2, 'obj');
            }
            setValue(-1, 'property punctuation');
            if (char === '(') {
              return setClass('function call');
            } else {
              return setClass('property');
            }
          }
        }
        if (obj.last.endsWith('.')) {
          if (getValue(-2) === 'property') {
            setValue(-1, 'property punctuation');
            if (char === '(') {
              return setClass('function call');
            } else {
              return setClass('property');
            }
          }
          if (obj.last.length > 1) {
            if ((ref21 = obj.last[obj.last.length - 2]) === ')' || ref21 === ']') {
              setValue(-1, 'property punctuation');
              return setClass('property');
            }
            if (obj.coffee) {
              if (obj.last[obj.last.length - 2] === '?') {
                if (getValue(-3) === 'text') {
                  setValue(-3, 'obj');
                }
                setValue(-2, 'operator punctuation');
                setValue(-1, 'property punctuation');
                return setClass('property');
              }
            }
          }
        }
      }
      if (obj.csslang) {
        if (word.endsWith('s')) {
          if (/\d+s/.test(word)) {
            return setClass('number');
          }
        }
        if ((ref22 = word.slice(word.length - 2)) === 'px' || ref22 === 'em' || ref22 === 'ex' || ref22 === 'ch') {
          return setClass('number');
        }
      }
      if (obj.csslang || obj.pug) {
        if (obj.last.endsWith('.')) {
          setValue(-1, 'class punctuation');
          return setClass('class');
        }
        if (obj.last.endsWith("#")) {
          setValue(-1, 'cssid punctuation');
          return setClass('cssid');
        }
      }
      if (obj.cpplang || obj.js) {
        if (char === '(') {
          return setClass('function call');
        }
      }
      return setClass('text');
    }
    return null;
  };

  Syntax.coffeeCall = function(obj) {
    var ref1, ref2, val;
    if (obj.coffee) {
      if (obj.turd === '(') {
        return Syntax.setValue(obj, -2, 'function call');
      } else if (obj.turd.length > 1 && obj.turd[obj.turd.length - 2] === ' ') {
        if (ref1 = last(obj.turd), indexOf.call('@+-\'"([{', ref1) >= 0) {
          if (ref2 = last(obj.turd), indexOf.call('+-', ref2) >= 0) {
            if (obj.text[obj.index + 1] === ' ') {
              return;
            }
          }
          val = Syntax.getValue(obj, -2);
          if (valid(val) && (val !== 'keyword' && val !== 'function head' && val !== 'require')) {
            if (val.indexOf('punctuation') < 0) {
              return Syntax.setValue(obj, -2, 'function call');
            }
          }
        }
      }
    }
  };

  Syntax.doWord = function(obj) {
    if (valid(obj.turd)) {
      Syntax.doTurd(obj);
      obj.last = obj.turd;
      obj.turd = '';
    }
    obj.word += obj.char;
    return null;
  };

  Syntax.doTurd = function(obj) {
    var i, index, ref1, ref2, ref3, results;
    if (empty(obj.fill) && empty(obj.words) && (((ref1 = Syntax.fill[obj.ext]) != null ? ref1[obj.turd] : void 0) != null)) {
      obj.fill = (ref2 = Syntax.fill[obj.ext]) != null ? ref2[obj.turd] : void 0;
      results = [];
      for (index = i = 0, ref3 = obj.turd.length; 0 <= ref3 ? i < ref3 : i > ref3; index = 0 <= ref3 ? ++i : --i) {
        if (obj.fill.turd) {
          results.push(Syntax.setValue(obj, -1 - index, obj.fill.turd));
        } else {
          results.push(Syntax.setValue(obj, -1 - index, obj.fill.value + ' ' + 'punctuation'));
        }
      }
      return results;
    }
  };

  Syntax.doPunct = function(obj) {
    var getValue, i, index, j, len, matchValue, mtch, ref1, ref2, ref3, ref4, ref5, setValue, turd, val, value;
    Syntax.endWord(obj);
    getValue = function(back) {
      if (back == null) {
        back = -1;
      }
      return Syntax.getValue(obj, back);
    };
    setValue = function(back, value) {
      return Syntax.setValue(obj, back, value);
    };
    value = 'punctuation';
    switch (obj.char) {
      case ':':
        if (obj.dictlang && obj.turd.length === 1) {
          if (((ref1 = last(obj.rgs)) != null ? ref1.value : void 0) === 'dictionary key') {
            value = 'dictionary punctuation';
          }
        } else {
          if (obj.coffee) {
            setValue(-1, 'method');
            value = 'method punctuation';
          }
        }
        break;
      case '>':
        if (obj.jslang) {
          ref2 = [['->', ''], ['=>', ' bound']];
          for (i = 0, len = ref2.length; i < len; i++) {
            ref3 = ref2[i], turd = ref3[0], val = ref3[1];
            if (obj.turd.endsWith(turd)) {
              Syntax.substitute(obj, -3, ['dictionary key', 'dictionary punctuation'], ['method', 'method punctuation']);
              Syntax.surround(obj, -1, {
                start: '(',
                add: 'argument',
                end: ')'
              });
              Syntax.replace(obj, -3, [
                {
                  word: true,
                  ignore: 'argument'
                }, {
                  match: '='
                }
              ], [
                {
                  value: 'function'
                }
              ]);
              setValue(-1, 'function tail' + val + ' punctuation');
              value = 'function head' + val + ' punctuation';
            }
          }
        } else if (obj.xmllang || obj.md) {
          if (obj.turd.endsWith('/>')) {
            setValue(-1, 'keyword punctuation');
          }
          value = 'keyword punctuation';
        }
        break;
      case '/':
        if (obj.jslang) {
          if (!obj.escp) {
            if (obj.regexp != null) {
              for (index = j = ref4 = obj.rgs.length - 1; ref4 <= 0 ? j <= 0 : j >= 0; index = ref4 <= 0 ? ++j : --j) {
                if (obj.rgs[index].start < obj.regexp) {
                  break;
                }
                obj.rgs[index].value = 'regexp ' + obj.rgs[index].value;
              }
              value = 'regexp punctuation';
            } else {
              obj.regexp = obj.index;
            }
          }
        }
    }
    if (mtch = (ref5 = Syntax.mtch[obj.ext]) != null ? ref5[obj.char] : void 0) {
      if (matchValue = Syntax.doMatch(obj, mtch)) {
        value = matchValue;
      }
    }
    if (obj.fill) {
      value = obj.fill.value + ' ' + value;
    }
    obj.rgs.push({
      start: obj.index,
      match: obj.char,
      value: value
    });
    return Syntax.checkComment(obj);
  };


  /*
   0000000   0000000   00     00  00     00  00000000  000   000  000000000  
  000       000   000  000   000  000   000  000       0000  000     000     
  000       000   000  000000000  000000000  0000000   000 0 000     000     
  000       000   000  000 0 000  000 0 000  000       000  0000     000     
   0000000   0000000   000   000  000   000  00000000  000   000     000
   */

  Syntax.checkComment = function(obj) {
    var comment, ref1;
    if (empty((ref1 = Syntax.info[obj.ext]) != null ? ref1.comment : void 0)) {
      return;
    }
    if (obj.regexp != null) {
      return;
    }
    comment = Syntax.info[obj.ext].comment;
    if (comment.line && obj.turd.endsWith(comment.line) && !obj.turd.endsWith('\\' + comment.line) && empty(obj.words)) {
      Syntax.startComment(obj, comment.line);
    }
    if (comment.tail && obj.turd.endsWith(comment.tail) && !obj.turd.endsWith('\\' + comment.tail)) {
      Syntax.startComment(obj, comment.tail);
    } else if (comment.start && obj.turd.endsWith(comment.start) && !obj.turd.endsWith('\\' + comment.start)) {
      Syntax.startComment(obj, comment.start);
    }
    return null;
  };

  Syntax.startComment = function(obj, start) {
    var i, index, ref1, results;
    obj.comment = {
      start: obj.index + 1,
      match: '',
      value: 'comment'
    };
    results = [];
    for (index = i = 0, ref1 = start.length; 0 <= ref1 ? i < ref1 : i > ref1; index = 0 <= ref1 ? ++i : --i) {
      results.push(Syntax.setValue(obj, -1 - index, 'comment punctuation'));
    }
    return results;
  };

  Syntax.doComment = function(obj) {
    var comment, i, index, ref1;
    comment = Syntax.info[obj.ext].comment;
    if (comment.end && obj.turd.endsWith(comment.end)) {
      obj.rgs.push(obj.comment);
      delete obj.comment;
      for (index = i = 0, ref1 = comment.end.length; 0 <= ref1 ? i < ref1 : i > ref1; index = 0 <= ref1 ? ++i : --i) {
        Syntax.setValue(obj, -1 - index, 'comment punctuation');
      }
    } else {
      Syntax.cont(obj, 'comment');
    }
    return null;
  };


  /*
   0000000  000000000  00000000   000  000   000   0000000   
  000          000     000   000  000  0000  000  000        
  0000000      000     0000000    000  000 0 000  000  0000  
       000     000     000   000  000  000  0000  000   000  
  0000000      000     000   000  000  000   000   0000000
   */

  Syntax.startString = function(obj) {
    var stringType;
    Syntax.endWord(obj);
    stringType = (function() {
      switch (obj.char) {
        case "'":
          return 'string single';
        case '"':
          return 'string double';
        case '`':
          return 'string backtick';
      }
    })();
    if (!stringType) {
      error("no string char '" + obj.char + "'");
      return;
    }
    obj.rgs.push({
      start: obj.index,
      match: obj.char,
      value: stringType + " punctuation"
    });
    obj.string = {
      value: stringType,
      start: obj.index + 1,
      match: ''
    };
    return null;
  };

  Syntax.doString = function(obj) {
    var stringType;
    if (obj.coffee) {
      if (obj.char === '{' && obj.string.value !== 'string single' && obj.string.match.endsWith("#")) {
        obj.interpolation = obj.string.value;
        obj.rgs.push(obj.string);
        obj.rgs.push({
          start: obj.index,
          match: obj.char,
          value: obj.interpolation + " punctuation"
        });
        delete obj.string;
        return;
      }
    }
    stringType = (function() {
      switch (obj.char) {
        case "'":
          return 'string single';
        case '"':
          return 'string double';
        case '`':
          return 'string backtick';
      }
    })();
    if (!obj.escp && obj.string.value === stringType) {
      if (valid(obj.string.match.trim())) {
        obj.rgs.push(obj.string);
      }
      delete obj.string;
      obj.rgs.push({
        start: obj.index,
        match: obj.char,
        value: stringType + " punctuation"
      });
    } else {
      Syntax.cont(obj, 'string');
    }
    return null;
  };

  Syntax.cont = function(obj, key) {
    var strOrCmt;
    strOrCmt = obj[key];
    switch (obj.char) {
      case ' ':
      case '\t':
        if (strOrCmt.match === '') {
          strOrCmt.start += 1;
        } else {
          if (valid(strOrCmt.match)) {
            obj.rgs.push(strOrCmt);
          }
          obj[key] = {
            start: obj.index + 1,
            match: '',
            value: strOrCmt.value
          };
        }
        break;
      default:
        strOrCmt.match += obj.char;
    }
    return null;
  };

  Syntax.endLine = function(obj) {
    if (obj.string) {
      if (obj.jslang || obj.cpplang) {
        obj.rgs.push(obj.string);
      }
    } else if (obj.comment) {
      obj.rgs.push(obj.comment);
    }
    return null;
  };

  Syntax.getMatch = function(obj, back) {
    var ref1, ref2;
    if (back < 0) {
      return (ref1 = obj.rgs[obj.rgs.length + back]) != null ? ref1.match : void 0;
    } else {
      return (ref2 = obj.rgs[back]) != null ? ref2.match : void 0;
    }
  };

  Syntax.getValue = function(obj, back) {
    var ref1, ref2;
    if (back < 0) {
      return (ref1 = obj.rgs[obj.rgs.length + back]) != null ? ref1.value : void 0;
    } else {
      return (ref2 = obj.rgs[back]) != null ? ref2.value : void 0;
    }
  };

  Syntax.setValue = function(obj, back, value) {
    var ref1;
    if (back < 0) {
      back = obj.rgs.length + back;
    }
    if (back < obj.rgs.length && back >= 0) {
      obj.rgs[back].value = value;
      if (obj.coffee && (obj.rgs[back - 1] != null)) {
        if (((ref1 = obj.rgs[back - 1]) != null ? ref1.match : void 0) === '@') {
          return obj.rgs[back - 1].value = value + ' punctuation';
        }
      }
    }
  };

  Syntax.addValue = function(obj, back, value) {
    var i, len, ref1, results, val;
    if (back < 0) {
      back = obj.rgs.length + back;
    }
    if (back < obj.rgs.length && back >= 0) {
      ref1 = value.split(/\s+/);
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        val = ref1[i];
        if (indexOf.call(obj.rgs[back].value.split(/\s+/), val) < 0) {
          results.push(obj.rgs[back].value = val + ' ' + obj.rgs[back].value);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

  Syntax.substitute = function(obj, back, oldVals, newVals) {
    var i, index, j, ref1, ref2, val;
    for (index = i = 0, ref1 = oldVals.length; 0 <= ref1 ? i < ref1 : i > ref1; index = 0 <= ref1 ? ++i : --i) {
      val = Syntax.getValue(obj, back + index);
      if (val !== oldVals[index]) {
        break;
      }
    }
    if (index === oldVals.length) {
      for (index = j = 0, ref2 = oldVals.length; 0 <= ref2 ? j < ref2 : j > ref2; index = 0 <= ref2 ? ++j : --j) {
        Syntax.setValue(obj, back + index, newVals[index]);
      }
      return;
    }
    if (obj.rgs.length + back - 1 >= 0) {
      return Syntax.substitute(obj, back - 1, oldVals, newVals);
    }
  };

  Syntax.replace = function(obj, back, oldObjs, newObjs) {
    var advance, backObj, i, index, j, k, key, len, ref1, ref2, ref3, ref4, ref5, results;
    if (obj.rgs.length + back < 0) {
      return;
    }
    advance = function() {
      if (obj.rgs.length + back - 1 >= 0) {
        return Syntax.replace(obj, back - 1, oldObjs, newObjs);
      }
    };
    for (index = i = 0, ref1 = oldObjs.length; 0 <= ref1 ? i < ref1 : i > ref1; index = 0 <= ref1 ? ++i : --i) {
      backObj = obj.rgs[obj.rgs.length + back + index];
      if (!backObj) {
        log('dafuk?', str(obj));
        log('dafuk?', obj.rgs.length + back + index, obj.rgs.length, back, index);
        return;
      }
      if (oldObjs[index].ignore) {
        if (((ref2 = backObj.value) != null ? typeof ref2.indexOf === "function" ? ref2.indexOf(oldObjs[index].ignore) : void 0 : void 0) >= 0) {
          return advance();
        }
      }
      ref3 = Object.keys(oldObjs[index]);
      for (j = 0, len = ref3.length; j < len; j++) {
        key = ref3[j];
        switch (key) {
          case 'word':
            if (((ref4 = backObj.value) != null ? typeof ref4.indexOf === "function" ? ref4.indexOf('punctuation') : void 0 : void 0) >= 0) {
              return advance();
            }
            break;
          case 'ignore':
            break;
          default:
            if (oldObjs[index][key] !== backObj[key]) {
              return advance();
            }
        }
      }
    }
    results = [];
    for (index = k = 0, ref5 = newObjs.length; 0 <= ref5 ? k < ref5 : k > ref5; index = 0 <= ref5 ? ++k : --k) {
      backObj = obj.rgs[obj.rgs.length + back + index];
      results.push((function() {
        var l, len1, ref6, results1;
        ref6 = Object.keys(newObjs[index]);
        results1 = [];
        for (l = 0, len1 = ref6.length; l < len1; l++) {
          key = ref6[l];
          results1.push(backObj[key] = newObjs[index][key]);
        }
        return results1;
      })());
    }
    return results;
  };

  Syntax.doMatch = function(obj, mtchs) {
    var endIndex, endMatches, i, index, j, k, l, len, m, mtch, n, o, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, startIndex, startLength, startMatches;
    for (i = 0, len = mtchs.length; i < len; i++) {
      mtch = mtchs[i];
      startLength = (ref1 = (ref2 = mtch.start) != null ? ref2.length : void 0) != null ? ref1 : 0;
      if (mtch.single) {
        if (obj.text[obj.index + 1] === mtch.end) {
          continue;
        }
        if (((ref3 = last(obj.rgs)) != null ? ref3.match : void 0) === mtch.end) {
          continue;
        }
      }
      if (obj.rgs.length - mtch.end.length - startLength < 0) {
        continue;
      }
      endMatches = true;
      for (endIndex = j = 1, ref4 = mtch.end.length; 1 <= ref4 ? j < ref4 : j > ref4; endIndex = 1 <= ref4 ? ++j : --j) {
        if (obj.rgs[obj.rgs.length - endIndex].match !== mtch.end[mtch.end.length - endIndex]) {
          endMatches = false;
          break;
        }
      }
      if (!endMatches) {
        continue;
      }
      if (mtch.spaced === false) {
        if (obj.turd.indexOf(' ') >= 0) {
          continue;
        }
      }
      if (mtch.start) {
        for (startIndex = k = ref5 = obj.rgs.length - startLength - mtch.end.length; ref5 <= 0 ? k <= 0 : k >= 0; startIndex = ref5 <= 0 ? ++k : --k) {
          startMatches = true;
          for (index = l = 0, ref6 = startLength; 0 <= ref6 ? l < ref6 : l > ref6; index = 0 <= ref6 ? ++l : --l) {
            if (Syntax.getMatch(obj, startIndex + index) !== mtch.start[index]) {
              startMatches = false;
              break;
            }
          }
          if (startMatches) {
            break;
          }
        }
        if (startIndex >= 0) {
          for (index = m = ref7 = startIndex, ref8 = startIndex + startLength; ref7 <= ref8 ? m < ref8 : m > ref8; index = ref7 <= ref8 ? ++m : --m) {
            Syntax.addValue(obj, index, mtch.value + ' punctuation');
          }
          for (index = n = ref9 = startIndex + startLength, ref10 = obj.rgs.length - mtch.end.length + 1; ref9 <= ref10 ? n < ref10 : n > ref10; index = ref9 <= ref10 ? ++n : --n) {
            Syntax.addValue(obj, index, mtch.value);
          }
          for (index = o = ref11 = obj.rgs.length - mtch.end.length + 1, ref12 = obj.rgs.length; ref11 <= ref12 ? o < ref12 : o > ref12; index = ref11 <= ref12 ? ++o : --o) {
            Syntax.addValue(obj, index, mtch.value + ' punctuation');
          }
          return mtch.value + ' punctuation';
        }
      } else {
        Syntax.addValue(obj, -1, mtch.value);
        index = -2;
        while (Syntax.getMatch(obj, index) === '-') {
          Syntax.setValue(obj, index, mtch.value + ' punctuation');
          Syntax.addValue(obj, index - 1, mtch.value);
          index -= 2;
        }
        return mtch.value + ' punctuation';
      }
    }
    return null;
  };

  Syntax.surround = function(obj, back, range) {
    var addIndex, endIndex, i, j, k, ref1, ref2, ref3, ref4, ref5, ref6, startIndex;
    if (obj.rgs.length - 1 + back <= 1) {
      return;
    }
    for (endIndex = i = ref1 = obj.rgs.length - 1 + back; ref1 <= 0 ? i <= 0 : i >= 0; endIndex = ref1 <= 0 ? ++i : --i) {
      if (endIndex >= obj.rgs.length || endIndex < 0) {
        log('dafuk?', endIndex, obj.rgs.length, back);
        return;
      }
      if (obj.rgs[endIndex] == null) {
        log('dafuk2?', endIndex, obj.rgs.length, back);
        return;
      }
      if (range.end === ((ref2 = obj.rgs[endIndex]) != null ? ref2.match : void 0)) {
        for (startIndex = j = ref3 = endIndex - 1; ref3 <= 0 ? j <= 0 : j >= 0; startIndex = ref3 <= 0 ? ++j : --j) {
          if (range.start === ((ref4 = obj.rgs[startIndex]) != null ? ref4.match : void 0)) {
            for (addIndex = k = ref5 = startIndex + 1, ref6 = endIndex; ref5 <= ref6 ? k < ref6 : k > ref6; addIndex = ref5 <= ref6 ? ++k : --k) {
              obj.rgs[addIndex].value = range.add + ' ' + obj.rgs[addIndex].value;
            }
          }
        }
      }
    }
  };

  return Syntax;

})();

module.exports = Syntax;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDBFQUFBO0VBQUE7O0FBUUEsTUFBb0UsT0FBQSxDQUFRLFdBQVIsQ0FBcEUsRUFBRSxpQkFBRixFQUFTLGlCQUFULEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsZUFBOUIsRUFBb0MsZUFBcEMsRUFBMEMsYUFBMUMsRUFBK0MsaUJBQS9DLEVBQXNELGFBQXRELEVBQTJELFNBQTNELEVBQThEOztBQUU5RCxHQUFBLEdBQU0sT0FBTyxDQUFDOztBQUVSOzs7RUFFRixNQUFDLENBQUEsSUFBRCxHQUFROztFQUNSLE1BQUMsQ0FBQSxJQUFELEdBQVE7O0VBUVIsTUFBQyxDQUFBLElBQUQsR0FBTyxTQUFBO0FBRUgsUUFBQTtJQUFBLElBQVUsTUFBTSxDQUFDLElBQVAsS0FBZSxJQUF6QjtBQUFBLGFBQUE7O0lBRUEsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTRCLFFBQTVCLEVBQXNDLFdBQXRDLENBQVY7SUFFUCxNQUFNLENBQUMsSUFBUCxHQUFjO0lBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztJQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7SUFDZCxNQUFNLENBQUMsSUFBUCxHQUFjO0lBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztJQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7QUFFZDtTQUFBLGdCQUFBOzs7O0FBQ0k7QUFBQTthQUFBLHNDQUFBOztVQUVJLElBQXlCLGFBQVcsTUFBTSxDQUFDLElBQWxCLEVBQUEsR0FBQSxLQUF6QjtZQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBWixDQUFpQixHQUFqQixFQUFBOzs7Z0JBRVksQ0FBQSxHQUFBLElBQVE7Ozs7QUFDcEI7aUJBQUEsbUJBQUE7O2NBRUksSUFBRyxLQUFB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Q29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAwMDAgMDAwICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgXG4wMDAwMDAwICAgICAwMDAwMCAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAgIDAwMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBzbGFzaCwgZmlyc3QsIHZhbGlkLCBlbXB0eSwgbGFzdCwgbm9vbiwgc3RyLCBlcnJvciwgbG9nLCAkLCBfIH0gPSByZXF1aXJlICcuLi8uLi9reGsnXG5cbmxvZyA9IGNvbnNvbGUubG9nXG5cbmNsYXNzIFN5bnRheFxuXG4gICAgQGV4dHMgPSBbXSBcbiAgICBAbGFuZyA9IG51bGxcbiAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBpbml0OiAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIFN5bnRheC5sYW5nICE9IG51bGxcbiAgICAgICAgXG4gICAgICAgIGRhdGEgPSBub29uLmxvYWQgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicsICdjb2ZmZWUnLCAnbGFuZy5ub29uJ1xuICAgICAgICBcbiAgICAgICAgU3ludGF4LmxhbmcgPSB7fVxuICAgICAgICBTeW50YXguaW5mbyA9IHt9XG4gICAgICAgIFN5bnRheC5tdGNoID0ge31cbiAgICAgICAgU3ludGF4LmZpbGwgPSB7fVxuICAgICAgICBTeW50YXgud29yZCA9IHt9XG4gICAgICAgIFN5bnRheC50dXJkID0ge31cbiAgICAgICAgXG4gICAgICAgIGZvciBleHROYW1lcyx2YWx1ZVdvcmRzIG9mIGRhdGFcbiAgICAgICAgICAgIGZvciBleHQgaW4gZXh0TmFtZXMuc3BsaXQgL1xccy9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFN5bnRheC5leHRzLnB1c2goZXh0KSBpZiBleHQgbm90IGluIFN5bnRheC5leHRzXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBTeW50YXgubGFuZ1tleHRdID89IHt9XG4gICAgICAgICAgICAgICAgZm9yIHZhbHVlLHdvcmRzIG9mIHZhbHVlV29yZHNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIHZhbHVlID09ICdjb21tZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmluZm9bZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmluZm9bZXh0XVt2YWx1ZV0gPSB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIHZhbHVlID09ICdtYXRjaCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciB2YWx1ZSxtdGNoSW5mbyBvZiB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG10Y2hJbmZvLmZpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmZpbGxbZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGNoSW5mby52YWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5maWxsW2V4dF1bbXRjaEluZm8uZmlsbF0gPSBtdGNoSW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgbXRjaEluZm8uZW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5tdGNoW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4Lm10Y2hbZXh0XVtsYXN0IG10Y2hJbmZvLmVuZF0gPz0gW11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRjaEluZm8udmFsdWUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubXRjaFtleHRdW2xhc3QgbXRjaEluZm8uZW5kXS5wdXNoIG10Y2hJbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBtdGNoSW5mby50dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC50dXJkW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRjaEluZm8ubWF0Y2ggPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgudHVyZFtleHRdW3ZhbHVlXSA9IG10Y2hJbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgud29yZFtleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG10Y2hJbmZvLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LndvcmRbZXh0XVt2YWx1ZV0gPSBtdGNoSW5mb1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3QgXy5pc0FycmF5IHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHdvcmQsaW5mbyBvZiB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBpbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdW3ZhbHVlXSA/PSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmluZm9bZXh0XVt2YWx1ZV0ucHVzaCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kOiAgIGlmIHdvcmRbMF0gPT0gJ3QnIHRoZW4gJ3R1cmQnIGVsc2UgJ3dvcmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBwYXJzZUludCB3b3JkLnNsaWNlIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvOiAgIGluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmxhbmdbZXh0XVt3b3JkXSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Igd29yZCBpbiB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubGFuZ1tleHRdW3dvcmRdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICMgbG9nIHN0ciBTeW50YXgubXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBAcmFuZ2VzOiAodGV4dCwgZXh0KSAtPlxuICAgICAgICBcbiAgICAgICAgU3ludGF4LmluaXQoKVxuICAgICAgICBcbiAgICAgICAgb2JqID1cbiAgICAgICAgICAgIGV4dDogICAgZXh0ID8gJ3R4dCcgXG4gICAgICAgICAgICByZ3M6ICAgIFtdICAgIyBsaXN0IG9mIHJhbmdlcyAocmVzdWx0KVxuICAgICAgICAgICAgd29yZHM6ICBbXSAgICMgZW5jb3VudGVyZWQgd29yZHNcbiAgICAgICAgICAgIHdvcmQ6ICAgJycgICAjIGN1cnJlbnRseSBwYXJzZWQgd29yZFxuICAgICAgICAgICAgdHVyZDogICAnJyAgICMgY3VycmVudGx5IHBhcnNlZCBzdHVmZiBpbmJldHdlZW4gd29yZHMgXG4gICAgICAgICAgICBsYXN0OiAgICcnICAgIyB0aGUgdHVyZCBiZWZvcmUgdGhlIGN1cnJlbnQvbGFzdC1jb21wbGV0ZWQgd29yZFxuICAgICAgICAgICAgaW5kZXg6ICAwIFxuICAgICAgICAgICAgdGV4dDogICB0ZXh0XG4gICAgICAgICAgICBcbiAgICAgICAgc3dpdGNoIG9iai5leHRcbiAgICAgICAgICAgIHdoZW4gJ2NwcCcsICdocHAnLCAnYycsICdoJywgJ2NjJywgJ2N4eCcsICdjcydcbiAgICAgICAgICAgICAgICBvYmouY3BwbGFuZyAgPSB0cnVlXG4gICAgICAgICAgICAgICAgb2JqLmNwcCAgICAgID0gdHJ1ZVxuICAgICAgICAgICAgd2hlbiAnY29mZmVlJywgJ2tvZmZlZScsICdqcycsICd0cydcbiAgICAgICAgICAgICAgICBvYmouanNsYW5nICAgPSB0cnVlXG4gICAgICAgICAgICAgICAgb2JqW29iai5leHRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIG9iai5jb2ZmZWUgICA9IHRydWUgaWYgb2JqLmV4dCBpcyAna29mZmVlJ1xuICAgICAgICAgICAgd2hlbiAnaHRtbCcsICdodG0nXG4gICAgICAgICAgICAgICAgb2JqLmh0bWwgICAgID0gdHJ1ZVxuICAgICAgICAgICAgd2hlbiAneWFtbCcsICd5bWwnXG4gICAgICAgICAgICAgICAgb2JqLnlhbWwgICAgID0gdHJ1ZVxuICAgICAgICAgICAgd2hlbiAnY3NzJywgJ3N0eWwnLCAnc2NzcycsICdzYXNzJ1xuICAgICAgICAgICAgICAgIG9iai5jc3NsYW5nICA9IHRydWVcbiAgICAgICAgICAgICAgICBvYmpbb2JqLmV4dF0gPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgb2JqW29iai5leHRdID0gdHJ1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBvYmouZGljdGxhbmcgPSB0cnVlIGlmIG9iai5qc2xhbmcgb3Igb2JqLmlzcyBvciBvYmoubG9nIG9yIG9iai5qc29uIG9yIG9iai55YW1sXG4gICAgICAgIG9iai5kYXNobGFuZyA9IHRydWUgaWYgb2JqLmNzc2xhbmcgb3Igb2JqLmlzcyBvciBvYmoucHVnICMgb2JqLm5vb24gb3IgXG4gICAgICAgIG9iai5kb3RsYW5nICA9IHRydWUgaWYgb2JqLmNwcGxhbmcgb3Igb2JqLmpzbGFuZyBvciBvYmoubG9nXG4gICAgICAgIG9iai54bWxsYW5nICA9IHRydWUgaWYgb2JqLnhtbCBvciBvYmouaHRtbCBvciBvYmoucGxpc3RcbiAgICAgICAgXG4gICAgICAgIGZvciBjaGFyIGluIHRleHRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNoYXIgPT0gJ1xcXFwnXG4gICAgICAgICAgICAgICAgaWYgb2JqLmVzY3AgXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmouZXNjcFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb2JqLmVzY3AgPSB0cnVlXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZGVsZXRlIG9iai5lc2NwXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmouY2hhciA9IGNoYXJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmludGVycG9sYXRpb24gYW5kIG9iai5jaGFyID09ICd9J1xuICAgICAgICAgICAgICAgIFN5bnRheC5lbmRXb3JkIG9ialxuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgICAgICAgICBzdGFydDogb2JqLmluZGV4XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiBvYmouY2hhclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogXCIje29iai5pbnRlcnBvbGF0aW9ufSBwdW5jdHVhdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG9iai5zdHJpbmcgPVxuICAgICAgICAgICAgICAgICAgICBzdGFydDogIG9iai5pbmRleCsxXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAgb2JqLmludGVycG9sYXRpb25cbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6ICAnJ1xuICAgICAgICAgICAgICAgIG9iai5pbmRleCsrXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmRvU3RyaW5nIG9ialxuXG4gICAgICAgICAgICBlbHNlIGlmIG9iai5jb21tZW50XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmRvQ29tbWVudCBvYmpcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgc3dpdGNoIGNoYXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gXCInXCIsICdcIicsICdgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBub3Qgb2JqLmVzY3AgYW5kIChjaGFyICE9IFwiJ1wiIG9yIG9iai5qc2xhbmcgb3Igb2JqLnB1ZylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc3RhcnRTdHJpbmcgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvUHVuY3Qgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnKycsICcqJywgJzwnLCAnPicsICc9JywgJ14nLCAnficsICdAJywgJyQnLCAnJicsICclJywgJyMnLCAnLycsICdcXFxcJywgJzonLCAnLicsICc7JywgJywnLCAnIScsICc/JywgJ3wnLCAneycsICd9JywgJygnLCAnKScsICdbJywgJ10nXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5kb1B1bmN0IG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJy0nXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5kYXNobGFuZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5kb1dvcmQgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvUHVuY3Qgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB3aGVuICcgJywgJ1xcdCcgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5lbmRXb3JkIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgIyBzdGFydCBhIG5ldyB3b3JkIC8gY29udGludWUgdGhlIGN1cnJlbnQgd29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZG9Xb3JkIG9ialxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgY2hhciBub3QgaW4gWycgJywgJ1xcdCddXG4gICAgICAgICAgICAgICAgICAgIFN5bnRheC5jb2ZmZWVDYWxsIG9ialxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5pbmRleCsrXG4gICAgICAgICAgXG4gICAgICAgIG9iai5jaGFyID0gbnVsbFxuICAgICAgICBTeW50YXguZW5kV29yZCBvYmpcbiAgICAgICAgU3ludGF4LmVuZExpbmUgb2JqXG4gICAgICAgICAgICBcbiAgICAgICAgb2JqLnJnc1xuICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBlbmRXb3JkOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgY2hhciA9IG9iai5jaGFyID8gJydcbiAgICAgICAgXG4gICAgICAgIG9iai50dXJkICs9IGNoYXIgIyBkb24ndCB1c2UgPSBoZXJlIVxuXG4gICAgICAgIHN3aXRjaCBjaGFyXG4gICAgICAgICAgICB3aGVuICcgJywgJ1xcdCdcbiAgICAgICAgICAgICAgICBTeW50YXguZG9UdXJkIG9ialxuICAgICAgICAgICAgICAgIGlmIG9iai5yZWdleHA/IGFuZCBub3Qgb2JqLmVzY3BcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG9iai5yZWdleHAgIyBhYm9ydCByZWdleHAgb24gZmlyc3QgdW5lc2NhcGVkIHNwYWNlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5ub29uXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai50dXJkLmVuZHNXaXRoICcgICdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGZpcnN0KG9iai5yZ3MpPy5zdGFydCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5vYmoucmdzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnN1YnN0aXR1dGUgb2JqLCAtaW5kZXgtMSwgWyd0ZXh0J10sIFsncHJvcGVydHknXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc3Vic3RpdHV0ZSBvYmosIC1pbmRleC0xLCBbJ3B1bmN0dWF0aW9uJ10sIFsncHJvcGVydHkgcHVuY3R1YXRpb24nXVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHZhbGlkIG9iai53b3JkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdvcmQgPSBvYmoud29yZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmoud29yZHMucHVzaCB3b3JkXG4gICAgICAgICAgICBvYmoud29yZCA9ICcnXG5cbiAgICAgICAgICAgIGdldFZhbHVlID0gKGJhY2s9LTEpICAgICAtPiBTeW50YXguZ2V0VmFsdWUgb2JqLCBiYWNrIFxuICAgICAgICAgICAgZ2V0TWF0Y2ggPSAoYmFjaz0tMSkgICAgIC0+IFN5bnRheC5nZXRNYXRjaCBvYmosIGJhY2tcbiAgICAgICAgICAgIHNldFZhbHVlID0gKGJhY2ssIHZhbHVlKSAtPiBTeW50YXguc2V0VmFsdWUgb2JqLCBiYWNrLCB2YWx1ZSAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNldENsYXNzID0gKGNsc3MpIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmNvZmZlZSBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnJncyk/Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2xzcyA9PSAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHNzID0gJ21lbWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3Qob2JqLnJncykudmFsdWUgPSBjbHNzICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGVsc2UgaWYgb2JqLmpzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBjbHNzID09ICdrZXl3b3JkIGZ1bmN0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnJlcGxhY2Ugb2JqLCAtMiwgW3t3b3JkOnRydWV9LCB7bWF0Y2g6Jz0nfV0sIFt7dmFsdWU6J2Z1bmN0aW9uJ31dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXggLSB3b3JkLmxlbmd0aFxuICAgICAgICAgICAgICAgICAgICBtYXRjaDogd29yZFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY2xzc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB2YWxpZCBvYmouZmlsbFxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyBvYmouZmlsbC52YWx1ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc3dpdGNoIGNoYXJcbiAgICAgICAgICAgICAgICB3aGVuICc6J1xuICAgICAgICAgICAgICAgICAgICBpZiBvYmouZGljdGxhbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgd2hlbiAnPSdcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmluaVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgU3ludGF4LnR1cmRbb2JqLmV4dF1cbiAgICAgICAgICAgICAgICBsYXN0VHVyZCA9IGxhc3Qgb2JqLmxhc3Quc3BsaXQgL1xccysvXG4gICAgICAgICAgICAgICAgaWYgdHVyZEluZm8gPSBTeW50YXgudHVyZFtvYmouZXh0XVtsYXN0VHVyZF1cbiAgICAgICAgICAgICAgICAgICAgaWYgdHVyZEluZm8uc3BhY2VkICE9IHRydWUgb3Igb2JqLmxhc3Rbb2JqLmxhc3QubGVuZ3RoLWxhc3RUdXJkLmxlbmd0aC0xXSA9PSAnICdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR1cmRJbmZvWyd3LTEnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC10dXJkSW5mby5tYXRjaC5sZW5ndGgtMSwgdHVyZEluZm9bJ3ctMSddXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi50dXJkSW5mby5tYXRjaC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLWluZGV4LTEsIHR1cmRJbmZvLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHR1cmRJbmZvWyd3LTAnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyB0dXJkSW5mb1sndy0wJ11cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGN3b3JkID0gd29yZC50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHdvcmRJbmZvID0gU3ludGF4LndvcmRbb2JqLmV4dF0/W2xjd29yZF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdCBpbiBPYmplY3Qua2V5cyB3b3JkSW5mb1sndC0xJ11cbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsIHdvcmRJbmZvLnZhbHVlICsgJyAnICsgd29yZEluZm9bJ3ctMSddXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCB3b3JkSW5mby52YWx1ZSArICcgJyArIHdvcmRJbmZvWyd0LTEnXVtvYmoubGFzdF1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIHdvcmRJbmZvLnZhbHVlICsgJyAnICsgd29yZEluZm8ud29yZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiB3b3JkVmFsdWUgPSBTeW50YXgubGFuZ1tvYmouZXh0XT9bbGN3b3JkXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIFN5bnRheC5pbmZvW29iai5leHRdP1t3b3JkVmFsdWVdP1xuICAgICAgICAgICAgICAgICAgICBmb3IgdmFsdWVJbmZvIGluIFN5bnRheC5pbmZvW29iai5leHRdW3dvcmRWYWx1ZV1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBtYXRjaCxtYXRjaFZhbHVlIG9mIHZhbHVlSW5mby5pbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QudHJpbSgpLmVuZHNXaXRoIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm1hdGNoLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLWluZGV4LCBtYXRjaFZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIG1hdGNoVmFsdWVcbiAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3Mgd29yZFZhbHVlXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgICAgICAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNvZmZlZVxuICAgICAgICAgICAgICAgIGlmIGdldE1hdGNoKC0xKSBpbiBbJ2NsYXNzJywgJ2V4dGVuZHMnXVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0xKT8uaW5kZXhPZj8oJ3B1bmN0dWF0aW9uJykgPCAwXG4gICAgICAgICAgICAgICAgICAgIGlmIHdvcmQgbm90IGluIFsnZWxzZScsICd0aGVuJywgJ2FuZCcsICdvcicsICdpbiddXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai5yZ3MpLnZhbHVlIG5vdCBpbiBbJ2tleXdvcmQnLCAnZnVuY3Rpb24gaGVhZCcsICdyZXF1aXJlJywgJ251bWJlciddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdmdW5jdGlvbiBjYWxsJyAjIGNvZmZlZSBlbmRXb3JkIC0xIG5vIHB1bmN0dWF0aW9uIGFuZCB3b3JkICE9ICdlbHNlIC4uLidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgICAgICAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgICAgICAgICBpZiAvXjB4W2EtZkEtRlxcZF1bYS1mQS1GXFxkXVthLWZBLUZcXGRdKyQvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnbnVtYmVyIGhleCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ251bWJlciBoZXggcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXIgaGV4J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgZ2V0TWF0Y2goLTEpID09IFwiI1wiXG4gICAgICAgICAgICAgICAgaWYgL15bYS1mQS1GXFxkXSskLy50ZXN0IHdvcmRcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdudW1iZXIgaGV4IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmoubm9vblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai53b3Jkcy5sZW5ndGggPT0gMSBcbiAgICAgICAgICAgICAgICAgICAgaWYgZW1wdHkgb2JqLmxhc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZSBpZiBvYmouc2hcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoud29yZHMubGVuZ3RoID4gMSBhbmQgZ2V0TWF0Y2goLTEpID09ICctJyBhbmQgZ2V0VmFsdWUoLTIpID09ICdhcmd1bWVudCdcbiAgICAgICAgICAgICAgICAgICAgc2V0Q2xhc3MgLTEsICdhcmd1bWVudCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdhcmd1bWVudCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgIFxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIFxuXG4gICAgICAgICAgICBpZiBvYmouY3BwbGFuZ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0ID09ICc6OidcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnJncy5sZW5ndGggPj0gM1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICduYW1lc3BhY2UnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3B1bmN0dWF0aW9uIG5hbWVzcGFjZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHVuY3R1YXRpb24gbmFtZXNwYWNlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2hhciA9PSAnKCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Z1bmN0aW9uIGNhbGwnICMgY3BwIDo6d29yZCAoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIC9eW1xcXFxfQS1aXVtcXFxcX0EtWjAtOV0rJC8udGVzdCB3b3JkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbWFjcm8nXG5cbiAgICAgICAgICAgICAgICBpZiAgICAgIC9eW1VBXVtBLVpdXFx3KyQvLnRlc3Qod29yZCkgdGhlbiByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgY2xhc3MnXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAvXltTRl1bQS1aXVxcdyskLy50ZXN0KHdvcmQpIHRoZW4gcmV0dXJuIHNldENsYXNzICd0eXBlIHN0cnVjdCdcbiAgICAgICAgICAgICAgICBlbHNlIGlmIC9eW0VdW0EtWl1cXHcrJC8udGVzdCh3b3JkKSAgdGhlbiByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgZW51bSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICdjbGFzcycgaW4gb2JqLndvcmRzIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjaGFyID09ICc8J1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgdGVtcGxhdGUnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0ID09ICc6OidcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTMpIGluIFsnZW51bScsICdjbGFzcycsICdzdHJ1Y3QnXVxuICAgICAgICAgICAgICAgICAgICAgICAgbG9nICdyZWFsbHk/J1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xzcyA9IGdldFZhbHVlKC0zKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsIGdldFZhbHVlKC0zKSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgZ2V0VmFsdWUoLTMpICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCBnZXRWYWx1ZSgtMykgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgPT0gJy4nIGFuZCAvXlxcZCtmJC8udGVzdCh3b3JkKVxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdudW1iZXIgZmxvYXQgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoIFwiIyNcIlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdwdW5jdHVhdGlvbiBvcGVyYXRvcidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwdW5jdHVhdGlvbiBvcGVyYXRvcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBvYmoubGFzdC5lbmRzV2l0aCAnLT4nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0zLCAnb2JqJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGZpcnN0KG9iai53b3Jkcykuc3RhcnRzV2l0aCgnVScpIGFuZCBmaXJzdChvYmoucmdzKT8udmFsdWUgPT0gJ21hY3JvJ1xuICAgICAgICAgICAgICAgICAgICBpZiB3b3JkLnN0YXJ0c1dpdGggJ0JsdWVwcmludCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbWFjcm8gcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIGlmIHdvcmQudG9Mb3dlckNhc2UoKSBpbiBbJ21ldGEnLCAnZGlzcGxheW5hbWUnLCAnY2F0ZWdvcnknLCAnd29ybGRjb250ZXh0JywgJ2VkaXRhbnl3aGVyZSddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ21hY3JvIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBpZiB3b3JkLnRvTG93ZXJDYXNlKCkgaW4gWydjb25maWcnLCAndHJhbnNpZW50JywgJ2VkaXRkZWZhdWx0c29ubHknLCAndmlzaWJsZWFueXdoZXJlJywgJ25vbnRyYW5zYWN0aW9uYWwnLCAnaW50ZXJwJywgJ2dsb2JhbGNvbmZpZyddXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ21hY3JvJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgICAgICAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIC9eXFxkKyQvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0ID09ICcuJyAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTQpID09ICdudW1iZXIgZmxvYXQnIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC00LCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICdzZW12ZXIgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnc2VtdmVyIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ251bWJlciBmbG9hdCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwIDAwMCAgXG4gICAgICAgICAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5kb3RsYW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgaW4gWycuJywgJzonXVxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgaW4gWyd0ZXh0JywgJ21vZHVsZScsICdjbGFzcycsICdtZW1iZXInLCAna2V5d29yZCddXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ29iaicgaWYgZ2V0VmFsdWUoLTIpID09ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJygnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZnVuY3Rpb24gY2FsbCcgIyBkb3RsYW5nIC53b3JkIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoICcuJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJygnIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZnVuY3Rpb24gY2FsbCcgIyBkb3RsYW5nIC5wcm9wZXJ0eSAoXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcblxuICAgICAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC5sZW5ndGggPiAxIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoubGFzdFtvYmoubGFzdC5sZW5ndGgtMl0gaW4gWycpJywgJ10nXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHJvcGVydHkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmNvZmZlZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0W29iai5sYXN0Lmxlbmd0aC0yXSA9PSAnPydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICdvYmonIGlmIGdldFZhbHVlKC0zKSA9PSAndGV4dCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdvcGVyYXRvciBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdwcm9wZXJ0eSdcblxuICAgICAgICAgICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgICAgMDAwICAgICAgMDAwIDAwMCAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgIDAwMDAwICAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgIFxuICAgICAgICAgICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouY3NzbGFuZ1xuXG4gICAgICAgICAgICAgICAgaWYgd29yZC5lbmRzV2l0aCAncydcbiAgICAgICAgICAgICAgICAgICAgaWYgL1xcZCtzLy50ZXN0IHdvcmRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgd29yZC5zbGljZSh3b3JkLmxlbmd0aC0yKSBpbiBbJ3B4JywgJ2VtJywgJ2V4JywgJ2NoJ11cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNzc2xhbmcgb3Igb2JqLnB1Z1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoICcuJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2NsYXNzIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2NsYXNzJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC5lbmRzV2l0aCBcIiNcIlxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2Nzc2lkIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Nzc2lkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5jcHBsYW5nIG9yIG9iai5qc1xuICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJygnIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2Z1bmN0aW9uIGNhbGwnICMgY3BwICYganMgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICd0ZXh0J1xuICAgICAgICBudWxsXG4gICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgQGNvZmZlZUNhbGw6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvYmouY29mZmVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai50dXJkID09ICcoJ1xuICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0yLCAnZnVuY3Rpb24gY2FsbCcgIyBjb2ZmZWUgY2FsbCAoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG9iai50dXJkLmxlbmd0aCA+IDEgYW5kIG9iai50dXJkW29iai50dXJkLmxlbmd0aC0yXSA9PSAnICdcbiAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai50dXJkKSBpbiAnQCstXFwnXCIoW3snXG4gICAgICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnR1cmQpIGluICcrLSdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai50ZXh0W29iai5pbmRleCsxXSA9PSAnICdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gIyBiYWlsIG91dCBpZiBuZXh0IGNoYXJhY3RlciBpcyBhIHNwYWNlIChjaGVhdGVyISlcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gU3ludGF4LmdldFZhbHVlIG9iaiwgLTJcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsaWQodmFsKSBhbmQgdmFsIG5vdCBpbiBbJ2tleXdvcmQnLCAnZnVuY3Rpb24gaGVhZCcsICdyZXF1aXJlJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHZhbC5pbmRleE9mKCdwdW5jdHVhdGlvbicpIDwgMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0yLCAnZnVuY3Rpb24gY2FsbCcgIyBjb2ZmZWUgY2FsbCBAKy1cXCdcIihbe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAZG9Xb3JkOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgdmFsaWQgb2JqLnR1cmRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3ludGF4LmRvVHVyZCBvYmpcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLmxhc3QgPSBvYmoudHVyZFxuICAgICAgICAgICAgb2JqLnR1cmQgPSAnJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgb2JqLndvcmQgKz0gb2JqLmNoYXJcbiAgICAgICAgXG4gICAgICAgIG51bGxcblxuICAgIEBkb1R1cmQ6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBlbXB0eShvYmouZmlsbCkgYW5kIGVtcHR5KG9iai53b3JkcykgYW5kIFN5bnRheC5maWxsW29iai5leHRdP1tvYmoudHVyZF0/XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5maWxsID0gU3ludGF4LmZpbGxbb2JqLmV4dF0/W29iai50dXJkXVxuICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4ub2JqLnR1cmQubGVuZ3RoXVxuICAgICAgICAgICAgICAgIGlmIG9iai5maWxsLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTEtaW5kZXgsIG9iai5maWxsLnR1cmRcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0xLWluZGV4LCBvYmouZmlsbC52YWx1ZSArICcgJyArICdwdW5jdHVhdGlvbidcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIEBkb1B1bmN0OiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgIFxuICAgICAgICBnZXRWYWx1ZSA9IChiYWNrPS0xKSAgICAgLT4gU3ludGF4LmdldFZhbHVlIG9iaiwgYmFjayBcbiAgICAgICAgc2V0VmFsdWUgPSAoYmFjaywgdmFsdWUpIC0+IFN5bnRheC5zZXRWYWx1ZSBvYmosIGJhY2ssIHZhbHVlICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdmFsdWUgPSAncHVuY3R1YXRpb24nXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggb2JqLmNoYXJcbiAgICAgICAgICAgIHdoZW4gJzonXG4gICAgICAgICAgICAgICAgaWYgb2JqLmRpY3RsYW5nIGFuZCBvYmoudHVyZC5sZW5ndGggPT0gMVxuICAgICAgICAgICAgICAgICAgICBpZiBsYXN0KG9iai5yZ3MpPy52YWx1ZSA9PSAnZGljdGlvbmFyeSBrZXknXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdkaWN0aW9uYXJ5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmNvZmZlZSAjIGtvZmZlZSBjb25zdHJ1Y3RvciBzaG9ydGN1dFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdtZXRob2QnXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdtZXRob2QgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICB3aGVuICc+J1xuICAgICAgICAgICAgICAgIGlmIG9iai5qc2xhbmdcbiAgICAgICAgICAgICAgICAgICAgZm9yIFt0dXJkLCB2YWxdIGluIFtbJy0+JywgJyddLCBbJz0+JywgJyBib3VuZCddXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnR1cmQuZW5kc1dpdGggdHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdWJzdGl0dXRlIG9iaiwgLTMsIFsnZGljdGlvbmFyeSBrZXknLCAnZGljdGlvbmFyeSBwdW5jdHVhdGlvbiddLCBbJ21ldGhvZCcsICdtZXRob2QgcHVuY3R1YXRpb24nXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdXJyb3VuZCAgIG9iaiwgLTEsIHN0YXJ0OicoJywgYWRkOidhcmd1bWVudCcsIGVuZDonKSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgucmVwbGFjZSAgICBvYmosIC0zLCBbe3dvcmQ6dHJ1ZSwgaWdub3JlOidhcmd1bWVudCd9LCB7bWF0Y2g6Jz0nfV0sIFt7dmFsdWU6J2Z1bmN0aW9uJ31dXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdmdW5jdGlvbiB0YWlsJyArIHZhbCArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAnZnVuY3Rpb24gaGVhZCcgKyB2YWwgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgb2JqLnhtbGxhbmcgb3Igb2JqLm1kXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai50dXJkLmVuZHNXaXRoICcvPidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAna2V5d29yZCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAna2V5d29yZCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIHdoZW4gJy8nXG4gICAgICAgICAgICAgICAgaWYgb2JqLmpzbGFuZ1xuICAgICAgICAgICAgICAgICAgICBpZiBub3Qgb2JqLmVzY3BcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5yZWdleHA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFtvYmoucmdzLmxlbmd0aC0xLi4wXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoucmdzW2luZGV4XS5zdGFydCA8IG9iai5yZWdleHBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iai5yZ3NbaW5kZXhdLnZhbHVlID0gJ3JlZ2V4cCAnICsgb2JqLnJnc1tpbmRleF0udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdyZWdleHAgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnJlZ2V4cCA9IG9iai5pbmRleCAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIG10Y2ggPSBTeW50YXgubXRjaFtvYmouZXh0XT9bb2JqLmNoYXJdXG4gICAgICAgICAgICBpZiBtYXRjaFZhbHVlID0gU3ludGF4LmRvTWF0Y2ggb2JqLCBtdGNoXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBtYXRjaFZhbHVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIG9iai5maWxsIHRoZW4gdmFsdWUgPSBvYmouZmlsbC52YWx1ZSArICcgJyArIHZhbHVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcblxuICAgICAgICBTeW50YXguY2hlY2tDb21tZW50IG9ialxuICAgICAgICBcbiAgICAjIyNcbiAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIyNcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAY2hlY2tDb21tZW50OiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIGVtcHR5IFN5bnRheC5pbmZvW29iai5leHRdPy5jb21tZW50XG4gICAgICAgIHJldHVybiBpZiBvYmoucmVnZXhwP1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGNvbW1lbnQgPSBTeW50YXguaW5mb1tvYmouZXh0XS5jb21tZW50XG4gICAgICAgIFxuICAgICAgICBpZiBjb21tZW50LmxpbmUgYW5kIG9iai50dXJkLmVuZHNXaXRoKGNvbW1lbnQubGluZSkgYW5kIG5vdCBvYmoudHVyZC5lbmRzV2l0aCgnXFxcXCcrY29tbWVudC5saW5lKSBhbmQgZW1wdHkob2JqLndvcmRzKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTeW50YXguc3RhcnRDb21tZW50IG9iaiwgY29tbWVudC5saW5lXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgY29tbWVudC50YWlsIGFuZCBvYmoudHVyZC5lbmRzV2l0aChjb21tZW50LnRhaWwpIGFuZCBub3Qgb2JqLnR1cmQuZW5kc1dpdGgoJ1xcXFwnK2NvbW1lbnQudGFpbClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgU3ludGF4LnN0YXJ0Q29tbWVudCBvYmosIGNvbW1lbnQudGFpbFxuICAgICAgICAgICAgXG4gICAgICAgIGVsc2UgaWYgY29tbWVudC5zdGFydCBhbmQgb2JqLnR1cmQuZW5kc1dpdGgoY29tbWVudC5zdGFydCkgYW5kIG5vdCBvYmoudHVyZC5lbmRzV2l0aCgnXFxcXCcrY29tbWVudC5zdGFydClcblxuICAgICAgICAgICAgU3ludGF4LnN0YXJ0Q29tbWVudCBvYmosIGNvbW1lbnQuc3RhcnRcbiAgICAgICAgICAgIFxuICAgICAgICBudWxsXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHN0YXJ0Q29tbWVudDogKG9iaiwgc3RhcnQpIC0+XG4gICAgICAgIFxuICAgICAgICBvYmouY29tbWVudCA9XG4gICAgICAgICAgICBzdGFydDogb2JqLmluZGV4KzFcbiAgICAgICAgICAgIG1hdGNoOiAnJ1xuICAgICAgICAgICAgdmFsdWU6ICdjb21tZW50J1xuICAgICAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLnN0YXJ0Lmxlbmd0aF1cbiAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0xLWluZGV4LCAnY29tbWVudCBwdW5jdHVhdGlvbidcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCBcbiAgICBcbiAgICBAZG9Db21tZW50OiAob2JqKSAtPlxuXG4gICAgICAgIGNvbW1lbnQgPSBTeW50YXguaW5mb1tvYmouZXh0XS5jb21tZW50XG4gICAgICAgIFxuICAgICAgICBpZiBjb21tZW50LmVuZCBhbmQgb2JqLnR1cmQuZW5kc1dpdGgoY29tbWVudC5lbmQpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouY29tbWVudFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBkZWxldGUgb2JqLmNvbW1lbnRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4uY29tbWVudC5lbmQubGVuZ3RoXVxuICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIC0xLWluZGV4LCAnY29tbWVudCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG5cbiAgICAgICAgICAgIFN5bnRheC5jb250IG9iaiwgJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICMjI1xuICAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICBcbiAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIFxuICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIyNcbiAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQHN0YXJ0U3RyaW5nOiAob2JqKSAtPlxuICAgICAgICBcbiAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgIFxuICAgICAgICBzdHJpbmdUeXBlID0gc3dpdGNoIG9iai5jaGFyXG4gICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgIHdoZW4gJ2AnIHRoZW4gJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBub3Qgc3RyaW5nVHlwZVxuICAgICAgICAgICAgZXJyb3IgXCJubyBzdHJpbmcgY2hhciAnI3tvYmouY2hhcn0nXCJcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICB2YWx1ZTogXCIje3N0cmluZ1R5cGV9IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBvYmouc3RyaW5nID1cbiAgICAgICAgICAgIHZhbHVlOiAgc3RyaW5nVHlwZVxuICAgICAgICAgICAgc3RhcnQ6ICBvYmouaW5kZXgrMVxuICAgICAgICAgICAgbWF0Y2g6ICAnJ1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBudWxsXG5cbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwIFxuICAgIFxuICAgIEBkb1N0cmluZzogKG9iaikgLT5cblxuICAgICAgICBpZiBvYmouY29mZmVlIFxuICAgICAgICAgICAgaWYgb2JqLmNoYXIgPT0gJ3snIGFuZCBvYmouc3RyaW5nLnZhbHVlICE9ICdzdHJpbmcgc2luZ2xlJyBhbmQgb2JqLnN0cmluZy5tYXRjaC5lbmRzV2l0aCBcIiNcIlxuICAgICAgICAgICAgICAgIG9iai5pbnRlcnBvbGF0aW9uID0gb2JqLnN0cmluZy52YWx1ZVxuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIiN7b2JqLmludGVycG9sYXRpb259IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkZWxldGUgb2JqLnN0cmluZ1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgc3RyaW5nVHlwZSA9IHN3aXRjaCBvYmouY2hhclxuICAgICAgICAgICAgd2hlbiBcIidcIiB0aGVuICdzdHJpbmcgc2luZ2xlJ1xuICAgICAgICAgICAgd2hlbiAnXCInIHRoZW4gJ3N0cmluZyBkb3VibGUnXG4gICAgICAgICAgICB3aGVuICdgJyB0aGVuICdzdHJpbmcgYmFja3RpY2snXG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgb2JqLmVzY3AgYW5kIG9iai5zdHJpbmcudmFsdWUgPT0gc3RyaW5nVHlwZVxuXG4gICAgICAgICAgICBpZiB2YWxpZCBvYmouc3RyaW5nLm1hdGNoLnRyaW0oKVxuICAgICAgICAgICAgICAgIG9iai5yZ3MucHVzaCBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBkZWxldGUgb2JqLnN0cmluZ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5yZ3MucHVzaFxuICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXhcbiAgICAgICAgICAgICAgICBtYXRjaDogb2JqLmNoYXJcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCIje3N0cmluZ1R5cGV9IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTeW50YXguY29udCBvYmosICdzdHJpbmcnXG4gICAgICAgICAgICBcbiAgICAgICAgbnVsbFxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQGNvbnQ6IChvYmosIGtleSkgLT5cbiAgICAgICAgXG4gICAgICAgIHN0ck9yQ210ID0gb2JqW2tleV1cbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBvYmouY2hhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiAnICcsICdcXHQnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgc3RyT3JDbXQubWF0Y2ggPT0gJydcbiAgICAgICAgICAgICAgICAgICAgc3RyT3JDbXQuc3RhcnQgKz0gMVxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoIHN0ck9yQ210IGlmIHZhbGlkIHN0ck9yQ210Lm1hdGNoXG4gICAgICAgICAgICAgICAgICAgIG9ialtrZXldID0gXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydDogb2JqLmluZGV4KzFcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHN0ck9yQ210LnZhbHVlXG4gICAgICAgICAgICBlbHNlIFxuXG4gICAgICAgICAgICAgICAgc3RyT3JDbXQubWF0Y2ggKz0gb2JqLmNoYXJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQGVuZExpbmU6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBvYmouc3RyaW5nXG4gICAgICAgICAgICBpZiBvYmouanNsYW5nIG9yIG9iai5jcHBsYW5nXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5zdHJpbmdcbiAgICAgICAgZWxzZSBpZiBvYmouY29tbWVudFxuICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5jb21tZW50XG4gICAgICAgIG51bGxcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgICAgMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQGdldE1hdGNoOiAob2JqLCBiYWNrKSAgICAgICAgLT4gaWYgYmFjayA8IDAgdGhlbiBvYmoucmdzW29iai5yZ3MubGVuZ3RoK2JhY2tdPy5tYXRjaCBlbHNlIG9iai5yZ3NbYmFja10/Lm1hdGNoXG4gICAgQGdldFZhbHVlOiAob2JqLCBiYWNrKSAgICAgICAgLT4gaWYgYmFjayA8IDAgdGhlbiBvYmoucmdzW29iai5yZ3MubGVuZ3RoK2JhY2tdPy52YWx1ZSBlbHNlIG9iai5yZ3NbYmFja10/LnZhbHVlICAgICBcbiAgICBAc2V0VmFsdWU6IChvYmosIGJhY2ssIHZhbHVlKSAtPiBcbiAgICAgICAgaWYgYmFjayA8IDBcbiAgICAgICAgICAgIGJhY2sgPSBvYmoucmdzLmxlbmd0aCtiYWNrXG4gICAgICAgIGlmIGJhY2sgPCBvYmoucmdzLmxlbmd0aCBhbmQgYmFjayA+PSAwXG4gICAgICAgICAgICBvYmoucmdzW2JhY2tdLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgIGlmIG9iai5jb2ZmZWUgYW5kIG9iai5yZ3NbYmFjay0xXT9cbiAgICAgICAgICAgICAgICBpZiBvYmoucmdzW2JhY2stMV0/Lm1hdGNoID09ICdAJ1xuICAgICAgICAgICAgICAgICAgICBvYmoucmdzW2JhY2stMV0udmFsdWUgPSB2YWx1ZSArICcgcHVuY3R1YXRpb24nXG5cbiAgICBAYWRkVmFsdWU6IChvYmosIGJhY2ssIHZhbHVlKSAtPiBcbiAgICAgICAgaWYgYmFjayA8IDBcbiAgICAgICAgICAgIGJhY2sgPSBvYmoucmdzLmxlbmd0aCtiYWNrXG4gICAgICAgIGlmIGJhY2sgPCBvYmoucmdzLmxlbmd0aCBhbmQgYmFjayA+PSAwXG4gICAgICAgICAgICBmb3IgdmFsIGluIHZhbHVlLnNwbGl0IC9cXHMrL1xuICAgICAgICAgICAgICAgIGlmIHZhbCBub3QgaW4gb2JqLnJnc1tiYWNrXS52YWx1ZS5zcGxpdCAvXFxzKy9cbiAgICAgICAgICAgICAgICAgICAgb2JqLnJnc1tiYWNrXS52YWx1ZSA9IHZhbCArICcgJyArIG9iai5yZ3NbYmFja10udmFsdWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAc3Vic3RpdHV0ZTogKG9iaiwgYmFjaywgb2xkVmFscywgbmV3VmFscykgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9sZFZhbHMubGVuZ3RoXVxuICAgICAgICAgICAgdmFsID0gU3ludGF4LmdldFZhbHVlIG9iaiwgYmFjaytpbmRleFxuICAgICAgICAgICAgaWYgdmFsICE9IG9sZFZhbHNbaW5kZXhdXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgaW5kZXggPT0gb2xkVmFscy5sZW5ndGhcbiAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9sZFZhbHMubGVuZ3RoXVxuICAgICAgICAgICAgICAgIFN5bnRheC5zZXRWYWx1ZSBvYmosIGJhY2sraW5kZXgsIG5ld1ZhbHNbaW5kZXhdXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBvYmoucmdzLmxlbmd0aCArIGJhY2stMSA+PSAwXG4gICAgICAgICAgICBTeW50YXguc3Vic3RpdHV0ZSBvYmosIGJhY2stMSwgb2xkVmFscywgbmV3VmFsc1xuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEByZXBsYWNlOiAob2JqLCBiYWNrLCBvbGRPYmpzLCBuZXdPYmpzKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG9iai5yZ3MubGVuZ3RoK2JhY2sgPCAwXG4gICAgICAgIFxuICAgICAgICBhZHZhbmNlID0gLT5cbiAgICAgICAgICAgIGlmIG9iai5yZ3MubGVuZ3RoICsgYmFjay0xID49IDBcbiAgICAgICAgICAgICAgICBTeW50YXgucmVwbGFjZSBvYmosIGJhY2stMSwgb2xkT2JqcywgbmV3T2Jqc1xuXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9sZE9ianMubGVuZ3RoXVxuICAgICAgICAgICAgYmFja09iaiA9IG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgrYmFjaytpbmRleF1cbiAgICAgICAgICAgIGlmIG5vdCBiYWNrT2JqXG4gICAgICAgICAgICAgICAgbG9nICdkYWZ1az8nLCBzdHIgb2JqXG4gICAgICAgICAgICAgICAgbG9nICdkYWZ1az8nLCBvYmoucmdzLmxlbmd0aCtiYWNrK2luZGV4LCBvYmoucmdzLmxlbmd0aCwgYmFjaywgaW5kZXhcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGlmIG9sZE9ianNbaW5kZXhdLmlnbm9yZVxuICAgICAgICAgICAgICAgIGlmIGJhY2tPYmoudmFsdWU/LmluZGV4T2Y/KG9sZE9ianNbaW5kZXhdLmlnbm9yZSkgPj0gMFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWR2YW5jZSgpXG4gICAgICAgICAgICBmb3Iga2V5IGluIE9iamVjdC5rZXlzIG9sZE9ianNbaW5kZXhdXG4gICAgICAgICAgICAgICAgc3dpdGNoIGtleSBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnd29yZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGJhY2tPYmoudmFsdWU/LmluZGV4T2Y/KCdwdW5jdHVhdGlvbicpID49IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWR2YW5jZSgpXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJ2lnbm9yZScgdGhlblxuICAgICAgICAgICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2xkT2Jqc1tpbmRleF1ba2V5XSAhPSBiYWNrT2JqW2tleV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWR2YW5jZSgpXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5uZXdPYmpzLmxlbmd0aF1cbiAgICAgICAgICAgIGJhY2tPYmogPSBvYmoucmdzW29iai5yZ3MubGVuZ3RoK2JhY2sraW5kZXhdXG4gICAgICAgICAgICBmb3Iga2V5IGluIE9iamVjdC5rZXlzIG5ld09ianNbaW5kZXhdXG4gICAgICAgICAgICAgICAgYmFja09ialtrZXldID0gbmV3T2Jqc1tpbmRleF1ba2V5XVxuICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgQGRvTWF0Y2g6IChvYmosIG10Y2hzKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIG10Y2ggaW4gbXRjaHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3RhcnRMZW5ndGggPSBtdGNoLnN0YXJ0Py5sZW5ndGggPyAwXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG10Y2guc2luZ2xlIFxuICAgICAgICAgICAgICAgIGlmIG9iai50ZXh0W29iai5pbmRleCsxXSA9PSBtdGNoLmVuZFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnJncyk/Lm1hdGNoID09IG10Y2guZW5kXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5yZ3MubGVuZ3RoLW10Y2guZW5kLmxlbmd0aC1zdGFydExlbmd0aCA8IDBcbiAgICAgICAgICAgICAgICBjb250aW51ZSBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZW5kTWF0Y2hlcyA9IHRydWVcbiAgICAgICAgICAgIGZvciBlbmRJbmRleCBpbiBbMS4uLm10Y2guZW5kLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBpZiBvYmoucmdzW29iai5yZ3MubGVuZ3RoLWVuZEluZGV4XS5tYXRjaCAhPSBtdGNoLmVuZFttdGNoLmVuZC5sZW5ndGgtZW5kSW5kZXhdXG4gICAgICAgICAgICAgICAgICAgIGVuZE1hdGNoZXMgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgaWYgbm90IGVuZE1hdGNoZXNcbiAgICAgICAgICAgICAgICBjb250aW51ZSBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG10Y2guc3BhY2VkID09IGZhbHNlXG4gICAgICAgICAgICAgICAgaWYgb2JqLnR1cmQuaW5kZXhPZignICcpID49IDBcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG10Y2guc3RhcnRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3Igc3RhcnRJbmRleCBpbiBbb2JqLnJncy5sZW5ndGgtc3RhcnRMZW5ndGgtbXRjaC5lbmQubGVuZ3RoLi4wXVxuICAgICAgICAgICAgICAgICAgICBzdGFydE1hdGNoZXMgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLnN0YXJ0TGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgU3ludGF4LmdldE1hdGNoKG9iaiwgc3RhcnRJbmRleCtpbmRleCkgIT0gbXRjaC5zdGFydFtpbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydE1hdGNoZXMgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrIGlmIHN0YXJ0TWF0Y2hlc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBzdGFydEluZGV4ID49IDBcbiAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFtzdGFydEluZGV4Li4uc3RhcnRJbmRleCtzdGFydExlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIGluZGV4LCBtdGNoLnZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFtzdGFydEluZGV4K3N0YXJ0TGVuZ3RoLi4ub2JqLnJncy5sZW5ndGgtbXRjaC5lbmQubGVuZ3RoKzFdXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCBpbmRleCwgbXRjaC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gW29iai5yZ3MubGVuZ3RoLW10Y2guZW5kLmxlbmd0aCsxLi4ub2JqLnJncy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCBpbmRleCwgbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIC0xLCBtdGNoLnZhbHVlXG4gICAgICAgICAgICAgICAgaW5kZXggPSAtMlxuICAgICAgICAgICAgICAgIHdoaWxlIFN5bnRheC5nZXRNYXRjaChvYmosIGluZGV4KSA9PSAnLSdcbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgaW5kZXgsIG10Y2gudmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBTeW50YXguYWRkVmFsdWUgb2JqLCBpbmRleC0xLCBtdGNoLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGluZGV4IC09IDJcbiAgICAgICAgICAgICAgICByZXR1cm4gbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgIG51bGxcbiAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICBcbiAgICBAc3Vycm91bmQ6IChvYmosIGJhY2ssIHJhbmdlKSAtPlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG9iai5yZ3MubGVuZ3RoLTErYmFjayA8PSAxXG4gICAgICAgIGZvciBlbmRJbmRleCBpbiBbb2JqLnJncy5sZW5ndGgtMStiYWNrLi4wXVxuICAgICAgICAgICAgaWYgZW5kSW5kZXggPj0gb2JqLnJncy5sZW5ndGggb3IgZW5kSW5kZXggPCAwXG4gICAgICAgICAgICAgICAgbG9nICdkYWZ1az8nLCBlbmRJbmRleCwgb2JqLnJncy5sZW5ndGgsIGJhY2tcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGlmIG5vdCBvYmoucmdzW2VuZEluZGV4XT9cbiAgICAgICAgICAgICAgICBsb2cgJ2RhZnVrMj8nLCBlbmRJbmRleCwgb2JqLnJncy5sZW5ndGgsIGJhY2tcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGlmIHJhbmdlLmVuZCA9PSBvYmoucmdzW2VuZEluZGV4XT8ubWF0Y2hcbiAgICAgICAgICAgICAgICBmb3Igc3RhcnRJbmRleCBpbiBbZW5kSW5kZXgtMS4uMF1cbiAgICAgICAgICAgICAgICAgICAgaWYgcmFuZ2Uuc3RhcnQgPT0gb2JqLnJnc1tzdGFydEluZGV4XT8ubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBhZGRJbmRleCBpbiBbc3RhcnRJbmRleCsxLi4uZW5kSW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnJnc1thZGRJbmRleF0udmFsdWUgPSByYW5nZS5hZGQgKyAnICcgKyBvYmoucmdzW2FkZEluZGV4XS52YWx1ZVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3ludGF4XG4iXX0=
//# sourceURL=../coffee/syntax.coffee