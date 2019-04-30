
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
        if ((wordInfo['t-1'] != null) && (ref6 = obj.last, indexOf.call(Object.keys(wordInfo['t-1']), ref6) >= 0)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDBFQUFBO0VBQUE7O0FBUUEsTUFBb0UsT0FBQSxDQUFRLFdBQVIsQ0FBcEUsRUFBRSxpQkFBRixFQUFTLGlCQUFULEVBQWdCLGlCQUFoQixFQUF1QixpQkFBdkIsRUFBOEIsZUFBOUIsRUFBb0MsZUFBcEMsRUFBMEMsYUFBMUMsRUFBK0MsaUJBQS9DLEVBQXNELGFBQXRELEVBQTJELFNBQTNELEVBQThEOztBQUU5RCxHQUFBLEdBQU0sT0FBTyxDQUFDOztBQUVSOzs7RUFFRixNQUFDLENBQUEsSUFBRCxHQUFROztFQUNSLE1BQUMsQ0FBQSxJQUFELEdBQVE7O0VBUVIsTUFBQyxDQUFBLElBQUQsR0FBTyxTQUFBO0FBRUgsUUFBQTtJQUFBLElBQVUsTUFBTSxDQUFDLElBQVAsS0FBZSxJQUF6QjtBQUFBLGFBQUE7O0lBRUEsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFYLEVBQXNCLElBQXRCLEVBQTRCLFFBQTVCLEVBQXNDLFdBQXRDLENBQVY7SUFFUCxNQUFNLENBQUMsSUFBUCxHQUFjO0lBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztJQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7SUFDZCxNQUFNLENBQUMsSUFBUCxHQUFjO0lBQ2QsTUFBTSxDQUFDLElBQVAsR0FBYztJQUNkLE1BQU0sQ0FBQyxJQUFQLEdBQWM7QUFFZDtTQUFBLGdCQUFBOzs7O0FBQ0k7QUFBQTthQUFBLHNDQUFBOztVQUVJLElBQXlCLGFBQVcsTUFBTSxDQUFDLElBQWxCLEVBQUEsR0FBQSxLQUF6QjtZQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBWixDQUFpQixHQUFqQixFQUFBOzs7Z0JBRVksQ0FBQSxHQUFBLElBQVE7Ozs7QUFDcEI7aUJBQUEsbUJBQUE7O2NBRUksSUFBRyxLQUFB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QUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCBcbjAwMDAwMDAgICAgIDAwMDAwICAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMDAgICAgMDAwMDAgIFxuICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgXG4wMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IHNsYXNoLCBmaXJzdCwgdmFsaWQsIGVtcHR5LCBsYXN0LCBub29uLCBzdHIsIGVycm9yLCBsb2csICQsIF8gfSA9IHJlcXVpcmUgJy4uLy4uL2t4aydcblxubG9nID0gY29uc29sZS5sb2dcblxuY2xhc3MgU3ludGF4XG5cbiAgICBAZXh0cyA9IFtdIFxuICAgIEBsYW5nID0gbnVsbFxuICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQGluaXQ6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgU3ludGF4LmxhbmcgIT0gbnVsbFxuICAgICAgICBcbiAgICAgICAgZGF0YSA9IG5vb24ubG9hZCBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJywgJ2NvZmZlZScsICdsYW5nLm5vb24nXG4gICAgICAgIFxuICAgICAgICBTeW50YXgubGFuZyA9IHt9XG4gICAgICAgIFN5bnRheC5pbmZvID0ge31cbiAgICAgICAgU3ludGF4Lm10Y2ggPSB7fVxuICAgICAgICBTeW50YXguZmlsbCA9IHt9XG4gICAgICAgIFN5bnRheC53b3JkID0ge31cbiAgICAgICAgU3ludGF4LnR1cmQgPSB7fVxuICAgICAgICBcbiAgICAgICAgZm9yIGV4dE5hbWVzLHZhbHVlV29yZHMgb2YgZGF0YVxuICAgICAgICAgICAgZm9yIGV4dCBpbiBleHROYW1lcy5zcGxpdCAvXFxzL1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmV4dHMucHVzaChleHQpIGlmIGV4dCBub3QgaW4gU3ludGF4LmV4dHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFN5bnRheC5sYW5nW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICBmb3IgdmFsdWUsd29yZHMgb2YgdmFsdWVXb3Jkc1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWUgPT0gJ2NvbW1lbnQnXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdW3ZhbHVlXSA9IHdvcmRzXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgdmFsdWUgPT0gJ21hdGNoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIHZhbHVlLG10Y2hJbmZvIG9mIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgbXRjaEluZm8uZmlsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZmlsbFtleHRdID89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG10Y2hJbmZvLnZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmZpbGxbZXh0XVttdGNoSW5mby5maWxsXSA9IG10Y2hJbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBtdGNoSW5mby5lbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4Lm10Y2hbZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubXRjaFtleHRdW2xhc3QgbXRjaEluZm8uZW5kXSA/PSBbXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGNoSW5mby52YWx1ZSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5tdGNoW2V4dF1bbGFzdCBtdGNoSW5mby5lbmRdLnB1c2ggbXRjaEluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIG10Y2hJbmZvLnR1cmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnR1cmRbZXh0XSA/PSB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdGNoSW5mby5tYXRjaCA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC50dXJkW2V4dF1bdmFsdWVdID0gbXRjaEluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC53b3JkW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXRjaEluZm8udmFsdWUgPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgud29yZFtleHRdW3ZhbHVlXSA9IG10Y2hJbmZvXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBfLmlzQXJyYXkgd29yZHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3Igd29yZCxpbmZvIG9mIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIGluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5pbmZvW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5pbmZvW2V4dF1bdmFsdWVdID89IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguaW5mb1tleHRdW3ZhbHVlXS5wdXNoIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ6ICAgaWYgd29yZFswXSA9PSAndCcgdGhlbiAndHVyZCcgZWxzZSAnd29yZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IHBhcnNlSW50IHdvcmQuc2xpY2UgMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm86ICAgaW5mb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgubGFuZ1tleHRdW3dvcmRdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciB3b3JkIGluIHdvcmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5sYW5nW2V4dF1bd29yZF0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgIyBsb2cgc3RyIFN5bnRheC5tdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIEByYW5nZXM6ICh0ZXh0LCBleHQpIC0+XG4gICAgICAgIFxuICAgICAgICBTeW50YXguaW5pdCgpXG4gICAgICAgIFxuICAgICAgICBvYmogPVxuICAgICAgICAgICAgZXh0OiAgICBleHQgPyAndHh0JyBcbiAgICAgICAgICAgIHJnczogICAgW10gICAjIGxpc3Qgb2YgcmFuZ2VzIChyZXN1bHQpXG4gICAgICAgICAgICB3b3JkczogIFtdICAgIyBlbmNvdW50ZXJlZCB3b3Jkc1xuICAgICAgICAgICAgd29yZDogICAnJyAgICMgY3VycmVudGx5IHBhcnNlZCB3b3JkXG4gICAgICAgICAgICB0dXJkOiAgICcnICAgIyBjdXJyZW50bHkgcGFyc2VkIHN0dWZmIGluYmV0d2VlbiB3b3JkcyBcbiAgICAgICAgICAgIGxhc3Q6ICAgJycgICAjIHRoZSB0dXJkIGJlZm9yZSB0aGUgY3VycmVudC9sYXN0LWNvbXBsZXRlZCB3b3JkXG4gICAgICAgICAgICBpbmRleDogIDAgXG4gICAgICAgICAgICB0ZXh0OiAgIHRleHRcbiAgICAgICAgICAgIFxuICAgICAgICBzd2l0Y2ggb2JqLmV4dFxuICAgICAgICAgICAgd2hlbiAnY3BwJywgJ2hwcCcsICdjJywgJ2gnLCAnY2MnLCAnY3h4JywgJ2NzJ1xuICAgICAgICAgICAgICAgIG9iai5jcHBsYW5nICA9IHRydWVcbiAgICAgICAgICAgICAgICBvYmouY3BwICAgICAgPSB0cnVlXG4gICAgICAgICAgICB3aGVuICdjb2ZmZWUnLCAna29mZmVlJywgJ2pzJywgJ3RzJ1xuICAgICAgICAgICAgICAgIG9iai5qc2xhbmcgICA9IHRydWVcbiAgICAgICAgICAgICAgICBvYmpbb2JqLmV4dF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgb2JqLmNvZmZlZSAgID0gdHJ1ZSBpZiBvYmouZXh0IGlzICdrb2ZmZWUnXG4gICAgICAgICAgICB3aGVuICdodG1sJywgJ2h0bSdcbiAgICAgICAgICAgICAgICBvYmouaHRtbCAgICAgPSB0cnVlXG4gICAgICAgICAgICB3aGVuICd5YW1sJywgJ3ltbCdcbiAgICAgICAgICAgICAgICBvYmoueWFtbCAgICAgPSB0cnVlXG4gICAgICAgICAgICB3aGVuICdjc3MnLCAnc3R5bCcsICdzY3NzJywgJ3Nhc3MnXG4gICAgICAgICAgICAgICAgb2JqLmNzc2xhbmcgID0gdHJ1ZVxuICAgICAgICAgICAgICAgIG9ialtvYmouZXh0XSA9IHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBvYmpbb2JqLmV4dF0gPSB0cnVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG9iai5kaWN0bGFuZyA9IHRydWUgaWYgb2JqLmpzbGFuZyBvciBvYmouaXNzIG9yIG9iai5sb2cgb3Igb2JqLmpzb24gb3Igb2JqLnlhbWxcbiAgICAgICAgb2JqLmRhc2hsYW5nID0gdHJ1ZSBpZiBvYmouY3NzbGFuZyBvciBvYmouaXNzIG9yIG9iai5wdWcgIyBvYmoubm9vbiBvciBcbiAgICAgICAgb2JqLmRvdGxhbmcgID0gdHJ1ZSBpZiBvYmouY3BwbGFuZyBvciBvYmouanNsYW5nIG9yIG9iai5sb2dcbiAgICAgICAgb2JqLnhtbGxhbmcgID0gdHJ1ZSBpZiBvYmoueG1sIG9yIG9iai5odG1sIG9yIG9iai5wbGlzdFxuICAgICAgICBcbiAgICAgICAgZm9yIGNoYXIgaW4gdGV4dFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouY2hhciA9PSAnXFxcXCdcbiAgICAgICAgICAgICAgICBpZiBvYmouZXNjcCBcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIG9iai5lc2NwXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvYmouZXNjcCA9IHRydWVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBkZWxldGUgb2JqLmVzY3BcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai5jaGFyID0gY2hhclxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouaW50ZXJwb2xhdGlvbiBhbmQgb2JqLmNoYXIgPT0gJ30nXG4gICAgICAgICAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2g6IG9iai5jaGFyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBcIiN7b2JqLmludGVycG9sYXRpb259IHB1bmN0dWF0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb2JqLnN0cmluZyA9XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiAgb2JqLmluZGV4KzFcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICBvYmouaW50ZXJwb2xhdGlvblxuICAgICAgICAgICAgICAgICAgICBtYXRjaDogICcnXG4gICAgICAgICAgICAgICAgb2JqLmluZGV4KytcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5zdHJpbmdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBTeW50YXguZG9TdHJpbmcgb2JqXG5cbiAgICAgICAgICAgIGVsc2UgaWYgb2JqLmNvbW1lbnRcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBTeW50YXguZG9Db21tZW50IG9ialxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzd2l0Y2ggY2hhclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiBcIidcIiwgJ1wiJywgJ2AnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG5vdCBvYmouZXNjcCBhbmQgKGNoYXIgIT0gXCInXCIgb3Igb2JqLmpzbGFuZyBvciBvYmoucHVnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdGFydFN0cmluZyBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZG9QdW5jdCBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB3aGVuICcrJywgJyonLCAnPCcsICc+JywgJz0nLCAnXicsICd+JywgJ0AnLCAnJCcsICcmJywgJyUnLCAnIycsICcvJywgJ1xcXFwnLCAnOicsICcuJywgJzsnLCAnLCcsICchJywgJz8nLCAnfCcsICd7JywgJ30nLCAnKCcsICcpJywgJ1snLCAnXSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvUHVuY3Qgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnLSdcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmRhc2hsYW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmRvV29yZCBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguZG9QdW5jdCBvYmpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHdoZW4gJyAnLCAnXFx0JyBcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmVuZFdvcmQgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZWxzZSAjIHN0YXJ0IGEgbmV3IHdvcmQgLyBjb250aW51ZSB0aGUgY3VycmVudCB3b3JkXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5kb1dvcmQgb2JqXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBjaGFyIG5vdCBpbiBbJyAnLCAnXFx0J11cbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LmNvZmZlZUNhbGwgb2JqXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLmluZGV4KytcbiAgICAgICAgICBcbiAgICAgICAgb2JqLmNoYXIgPSBudWxsXG4gICAgICAgIFN5bnRheC5lbmRXb3JkIG9ialxuICAgICAgICBTeW50YXguZW5kTGluZSBvYmpcbiAgICAgICAgICAgIFxuICAgICAgICBvYmoucmdzXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgQGVuZFdvcmQ6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBjaGFyID0gb2JqLmNoYXIgPyAnJ1xuICAgICAgICBcbiAgICAgICAgb2JqLnR1cmQgKz0gY2hhciAjIGRvbid0IHVzZSA9IGhlcmUhXG5cbiAgICAgICAgc3dpdGNoIGNoYXJcbiAgICAgICAgICAgIHdoZW4gJyAnLCAnXFx0J1xuICAgICAgICAgICAgICAgIFN5bnRheC5kb1R1cmQgb2JqXG4gICAgICAgICAgICAgICAgaWYgb2JqLnJlZ2V4cD8gYW5kIG5vdCBvYmouZXNjcFxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgb2JqLnJlZ2V4cCAjIGFib3J0IHJlZ2V4cCBvbiBmaXJzdCB1bmVzY2FwZWQgc3BhY2VcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLm5vb25cbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnR1cmQuZW5kc1dpdGggJyAgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZmlyc3Qob2JqLnJncyk/LnN0YXJ0ID4gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm9iai5yZ3MubGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTeW50YXguc3Vic3RpdHV0ZSBvYmosIC1pbmRleC0xLCBbJ3RleHQnXSwgWydwcm9wZXJ0eSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5zdWJzdGl0dXRlIG9iaiwgLWluZGV4LTEsIFsncHVuY3R1YXRpb24nXSwgWydwcm9wZXJ0eSBwdW5jdHVhdGlvbiddXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgdmFsaWQgb2JqLndvcmRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd29yZCA9IG9iai53b3JkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIG9iai53b3Jkcy5wdXNoIHdvcmRcbiAgICAgICAgICAgIG9iai53b3JkID0gJydcblxuICAgICAgICAgICAgZ2V0VmFsdWUgPSAoYmFjaz0tMSkgICAgIC0+IFN5bnRheC5nZXRWYWx1ZSBvYmosIGJhY2sgXG4gICAgICAgICAgICBnZXRNYXRjaCA9IChiYWNrPS0xKSAgICAgLT4gU3ludGF4LmdldE1hdGNoIG9iaiwgYmFja1xuICAgICAgICAgICAgc2V0VmFsdWUgPSAoYmFjaywgdmFsdWUpIC0+IFN5bnRheC5zZXRWYWx1ZSBvYmosIGJhY2ssIHZhbHVlICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc2V0Q2xhc3MgPSAoY2xzcykgLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmouY29mZmVlIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgbGFzdChvYmoucmdzKT8ubWF0Y2ggPT0gJ0AnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjbHNzID09ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsc3MgPSAnbWVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdChvYmoucmdzKS52YWx1ZSA9IGNsc3MgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBvYmouanNcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGNsc3MgPT0gJ2tleXdvcmQgZnVuY3Rpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBTeW50YXgucmVwbGFjZSBvYmosIC0yLCBbe3dvcmQ6dHJ1ZX0sIHttYXRjaDonPSd9XSwgW3t2YWx1ZTonZnVuY3Rpb24nfV1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleCAtIHdvcmQubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIG1hdGNoOiB3b3JkXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjbHNzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHZhbGlkIG9iai5maWxsXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIG9iai5maWxsLnZhbHVlXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzd2l0Y2ggY2hhclxuICAgICAgICAgICAgICAgIHdoZW4gJzonXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai5kaWN0bGFuZ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICB3aGVuICc9J1xuICAgICAgICAgICAgICAgICAgICBpZiBvYmouaW5pXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBTeW50YXgudHVyZFtvYmouZXh0XVxuICAgICAgICAgICAgICAgIGxhc3RUdXJkID0gbGFzdCBvYmoubGFzdC5zcGxpdCAvXFxzKy9cbiAgICAgICAgICAgICAgICBpZiB0dXJkSW5mbyA9IFN5bnRheC50dXJkW29iai5leHRdW2xhc3RUdXJkXVxuICAgICAgICAgICAgICAgICAgICBpZiB0dXJkSW5mby5zcGFjZWQgIT0gdHJ1ZSBvciBvYmoubGFzdFtvYmoubGFzdC5sZW5ndGgtbGFzdFR1cmQubGVuZ3RoLTFdID09ICcgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHVyZEluZm9bJ3ctMSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLXR1cmRJbmZvLm1hdGNoLmxlbmd0aC0xLCB0dXJkSW5mb1sndy0xJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbMC4uLnR1cmRJbmZvLm1hdGNoLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtaW5kZXgtMSwgdHVyZEluZm8udHVyZFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdHVyZEluZm9bJ3ctMCddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzIHR1cmRJbmZvWyd3LTAnXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBsY3dvcmQgPSB3b3JkLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgd29yZEluZm8gPSBTeW50YXgud29yZFtvYmouZXh0XT9bbGN3b3JkXVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHdvcmRJbmZvWyd0LTEnXT8gYW5kIG9iai5sYXN0IGluIE9iamVjdC5rZXlzIHdvcmRJbmZvWyd0LTEnXVxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgd29yZEluZm8udmFsdWUgKyAnICcgKyB3b3JkSW5mb1sndy0xJ11cbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsIHdvcmRJbmZvLnZhbHVlICsgJyAnICsgd29yZEluZm9bJ3QtMSddW29iai5sYXN0XVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3Mgd29yZEluZm8udmFsdWUgKyAnICcgKyB3b3JkSW5mby53b3JkXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHdvcmRWYWx1ZSA9IFN5bnRheC5sYW5nW29iai5leHRdP1tsY3dvcmRdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgU3ludGF4LmluZm9bb2JqLmV4dF0/W3dvcmRWYWx1ZV0/XG4gICAgICAgICAgICAgICAgICAgIGZvciB2YWx1ZUluZm8gaW4gU3ludGF4LmluZm9bb2JqLmV4dF1bd29yZFZhbHVlXVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIG1hdGNoLG1hdGNoVmFsdWUgb2YgdmFsdWVJbmZvLmluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoubGFzdC50cmltKCkuZW5kc1dpdGggbWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4ubWF0Y2gubGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEtaW5kZXgsIG1hdGNoVmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgbWF0Y2hWYWx1ZVxuICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyB3b3JkVmFsdWVcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICAgICAgICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAgICAgICAgICMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouY29mZmVlXG4gICAgICAgICAgICAgICAgaWYgZ2V0TWF0Y2goLTEpIGluIFsnY2xhc3MnLCAnZXh0ZW5kcyddXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY2xhc3MnXG4gICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTEpPy5pbmRleE9mPygncHVuY3R1YXRpb24nKSA8IDBcbiAgICAgICAgICAgICAgICAgICAgaWYgd29yZCBub3QgaW4gWydlbHNlJywgJ3RoZW4nLCAnYW5kJywgJ29yJywgJ2luJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnJncykudmFsdWUgbm90IGluIFsna2V5d29yZCcsICdmdW5jdGlvbiBoZWFkJywgJ3JlcXVpcmUnLCAnbnVtYmVyJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2Z1bmN0aW9uIGNhbGwnICMgY29mZmVlIGVuZFdvcmQgLTEgbm8gcHVuY3R1YXRpb24gYW5kIHdvcmQgIT0gJ2Vsc2UgLi4uJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAgICAgICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICAgICAgICAgIGlmIC9eMHhbYS1mQS1GXFxkXVthLWZBLUZcXGRdW2EtZkEtRlxcZF0rJC8udGVzdCB3b3JkXG4gICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgaGV4IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnbnVtYmVyIGhleCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlciBoZXgnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBnZXRNYXRjaCgtMSkgPT0gXCIjXCJcbiAgICAgICAgICAgICAgICBpZiAvXlthLWZBLUZcXGRdKyQvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ251bWJlciBoZXggcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyIGhleCdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5ub29uXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLndvcmRzLmxlbmd0aCA9PSAxIFxuICAgICAgICAgICAgICAgICAgICBpZiBlbXB0eSBvYmoubGFzdFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdjbGFzcydcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlIGlmIG9iai5zaFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai53b3Jkcy5sZW5ndGggPiAxIGFuZCBnZXRNYXRjaCgtMSkgPT0gJy0nIGFuZCBnZXRWYWx1ZSgtMikgPT0gJ2FyZ3VtZW50J1xuICAgICAgICAgICAgICAgICAgICBzZXRDbGFzcyAtMSwgJ2FyZ3VtZW50IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ2FyZ3VtZW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAgXG4gICAgICAgICAgICAjICAwMDAwMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgXG5cbiAgICAgICAgICAgIGlmIG9iai5jcHBsYW5nXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgPT0gJzo6J1xuICAgICAgICAgICAgICAgICAgICBpZiBvYmoucmdzLmxlbmd0aCA+PSAzXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ25hbWVzcGFjZSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAncHVuY3R1YXRpb24gbmFtZXNwYWNlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwdW5jdHVhdGlvbiBuYW1lc3BhY2UnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjaGFyID09ICcoJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZnVuY3Rpb24gY2FsbCcgIyBjcHAgOjp3b3JkIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgL15bXFxcXF9BLVpdW1xcXFxfQS1aMC05XSskLy50ZXN0IHdvcmRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdtYWNybydcblxuICAgICAgICAgICAgICAgIGlmICAgICAgL15bVUFdW0EtWl1cXHcrJC8udGVzdCh3b3JkKSB0aGVuIHJldHVybiBzZXRDbGFzcyAndHlwZSBjbGFzcydcbiAgICAgICAgICAgICAgICBlbHNlIGlmIC9eW1NGXVtBLVpdXFx3KyQvLnRlc3Qod29yZCkgdGhlbiByZXR1cm4gc2V0Q2xhc3MgJ3R5cGUgc3RydWN0J1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgL15bRV1bQS1aXVxcdyskLy50ZXN0KHdvcmQpICB0aGVuIHJldHVybiBzZXRDbGFzcyAndHlwZSBlbnVtJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgJ2NsYXNzJyBpbiBvYmoud29yZHMgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIGNoYXIgPT0gJzwnXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAndHlwZSB0ZW1wbGF0ZSdcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgPT0gJzo6J1xuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMykgaW4gWydlbnVtJywgJ2NsYXNzJywgJ3N0cnVjdCddXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cgJ3JlYWxseT8nXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHNzID0gZ2V0VmFsdWUoLTMpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgZ2V0VmFsdWUoLTMpICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCBnZXRWYWx1ZSgtMykgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsIGdldFZhbHVlKC0zKSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdCA9PSAnLicgYW5kIC9eXFxkK2YkLy50ZXN0KHdvcmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTIsICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ251bWJlciBmbG9hdCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QuZW5kc1dpdGggXCIjI1wiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ3B1bmN0dWF0aW9uIG9wZXJhdG9yJ1xuICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3B1bmN0dWF0aW9uIG9wZXJhdG9yJ1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBlbHNlIGlmIG9iai5sYXN0LmVuZHNXaXRoICctPidcbiAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTMsICdvYmonXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAncHJvcGVydHkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAncHJvcGVydHkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgZmlyc3Qob2JqLndvcmRzKS5zdGFydHNXaXRoKCdVJykgYW5kIGZpcnN0KG9iai5yZ3MpPy52YWx1ZSA9PSAnbWFjcm8nXG4gICAgICAgICAgICAgICAgICAgIGlmIHdvcmQuc3RhcnRzV2l0aCAnQmx1ZXByaW50J1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdtYWNybyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgaWYgd29yZC50b0xvd2VyQ2FzZSgpIGluIFsnbWV0YScsICdkaXNwbGF5bmFtZScsICdjYXRlZ29yeScsICd3b3JsZGNvbnRleHQnLCAnZWRpdGFueXdoZXJlJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbWFjcm8gcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIGlmIHdvcmQudG9Mb3dlckNhc2UoKSBpbiBbJ2NvbmZpZycsICd0cmFuc2llbnQnLCAnZWRpdGRlZmF1bHRzb25seScsICd2aXNpYmxlYW55d2hlcmUnLCAnbm9udHJhbnNhY3Rpb25hbCcsICdpbnRlcnAnLCAnZ2xvYmFsY29uZmlnJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnbWFjcm8nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAgICAgICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAgICAgICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgL15cXGQrJC8udGVzdCB3b3JkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QgPT0gJy4nICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtNCkgPT0gJ251bWJlciBmbG9hdCcgYW5kIGdldFZhbHVlKC0yKSA9PSAnbnVtYmVyIGZsb2F0J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTQsICdzZW12ZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ3NlbXZlciBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnc2VtdmVyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdzZW12ZXIgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3NlbXZlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgZ2V0VmFsdWUoLTIpID09ICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ251bWJlciBmbG9hdCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnbnVtYmVyIGZsb2F0IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXIgZmxvYXQnXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCBcbiAgICAgICAgICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAgMDAwICBcbiAgICAgICAgICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICBcbiAgICAgICAgICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmRvdGxhbmdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBvYmoubGFzdCBpbiBbJy4nLCAnOiddXG4gICAgICAgICAgICAgICAgICAgIGlmIGdldFZhbHVlKC0yKSBpbiBbJ3RleHQnLCAnbW9kdWxlJywgJ2NsYXNzJywgJ21lbWJlcicsICdrZXl3b3JkJ11cbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0yLCAnb2JqJyBpZiBnZXRWYWx1ZSgtMikgPT0gJ3RleHQnXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2hhciA9PSAnKCcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdmdW5jdGlvbiBjYWxsJyAjIGRvdGxhbmcgLndvcmQgKFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAncHJvcGVydHknXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QuZW5kc1dpdGggJy4nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiBnZXRWYWx1ZSgtMikgPT0gJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2hhciA9PSAnKCcgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdmdW5jdGlvbiBjYWxsJyAjIGRvdGxhbmcgLnByb3BlcnR5IChcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0Lmxlbmd0aCA+IDEgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0W29iai5sYXN0Lmxlbmd0aC0yXSBpbiBbJyknLCAnXSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdwcm9wZXJ0eSBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmouY29mZmVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLmxhc3Rbb2JqLmxhc3QubGVuZ3RoLTJdID09ICc/J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMywgJ29iaicgaWYgZ2V0VmFsdWUoLTMpID09ICd0ZXh0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMiwgJ29wZXJhdG9yIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ3Byb3BlcnR5IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3Byb3BlcnR5J1xuXG4gICAgICAgICAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4gICAgICAgICAgICAjIDAwMCAgICAgICAgICAwMDAgICAgICAwMDAgMDAwICAgMDAwICAgICAgXG4gICAgICAgICAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgMDAwMDAgICAgMDAwICAgICAgXG4gICAgICAgICAgICAjICAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgXG4gICAgICAgICAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIG9iai5jc3NsYW5nXG5cbiAgICAgICAgICAgICAgICBpZiB3b3JkLmVuZHNXaXRoICdzJ1xuICAgICAgICAgICAgICAgICAgICBpZiAvXFxkK3MvLnRlc3Qgd29yZFxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldENsYXNzICdudW1iZXInXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiB3b3JkLnNsaWNlKHdvcmQubGVuZ3RoLTIpIGluIFsncHgnLCAnZW0nLCAnZXgnLCAnY2gnXVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBvYmouY3NzbGFuZyBvciBvYmoucHVnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgb2JqLmxhc3QuZW5kc1dpdGggJy4nXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnY2xhc3MgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY2xhc3MnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIG9iai5sYXN0LmVuZHNXaXRoIFwiI1wiXG4gICAgICAgICAgICAgICAgICAgIHNldFZhbHVlIC0xLCAnY3NzaWQgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnY3NzaWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLmNwcGxhbmcgb3Igb2JqLmpzXG4gICAgICAgICAgICAgICAgaWYgY2hhciA9PSAnKCcgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRDbGFzcyAnZnVuY3Rpb24gY2FsbCcgIyBjcHAgJiBqcyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gc2V0Q2xhc3MgJ3RleHQnXG4gICAgICAgIG51bGxcbiAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBAY29mZmVlQ2FsbDogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9iai5jb2ZmZWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLnR1cmQgPT0gJygnXG4gICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTIsICdmdW5jdGlvbiBjYWxsJyAjIGNvZmZlZSBjYWxsIChcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGVsc2UgaWYgb2JqLnR1cmQubGVuZ3RoID4gMSBhbmQgb2JqLnR1cmRbb2JqLnR1cmQubGVuZ3RoLTJdID09ICcgJ1xuICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnR1cmQpIGluICdAKy1cXCdcIihbeydcbiAgICAgICAgICAgICAgICAgICAgaWYgbGFzdChvYmoudHVyZCkgaW4gJystJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnRleHRbb2JqLmluZGV4KzFdID09ICcgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAjIGJhaWwgb3V0IGlmIG5leHQgY2hhcmFjdGVyIGlzIGEgc3BhY2UgKGNoZWF0ZXIhKVxuICAgICAgICAgICAgICAgICAgICB2YWwgPSBTeW50YXguZ2V0VmFsdWUgb2JqLCAtMlxuICAgICAgICAgICAgICAgICAgICBpZiB2YWxpZCh2YWwpIGFuZCB2YWwgbm90IGluIFsna2V5d29yZCcsICdmdW5jdGlvbiBoZWFkJywgJ3JlcXVpcmUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgdmFsLmluZGV4T2YoJ3B1bmN0dWF0aW9uJykgPCAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTIsICdmdW5jdGlvbiBjYWxsJyAjIGNvZmZlZSBjYWxsIEArLVxcJ1wiKFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBkb1dvcmQ6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB2YWxpZCBvYmoudHVyZFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTeW50YXguZG9UdXJkIG9ialxuICAgICAgICAgICAgXG4gICAgICAgICAgICBvYmoubGFzdCA9IG9iai50dXJkXG4gICAgICAgICAgICBvYmoudHVyZCA9ICcnXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBvYmoud29yZCArPSBvYmouY2hhclxuICAgICAgICBcbiAgICAgICAgbnVsbFxuXG4gICAgQGRvVHVyZDogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIGVtcHR5KG9iai5maWxsKSBhbmQgZW1wdHkob2JqLndvcmRzKSBhbmQgU3ludGF4LmZpbGxbb2JqLmV4dF0/W29iai50dXJkXT9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLmZpbGwgPSBTeW50YXguZmlsbFtvYmouZXh0XT9bb2JqLnR1cmRdXG4gICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5vYmoudHVyZC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgaWYgb2JqLmZpbGwudHVyZFxuICAgICAgICAgICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCAtMS1pbmRleCwgb2JqLmZpbGwudHVyZFxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTEtaW5kZXgsIG9iai5maWxsLnZhbHVlICsgJyAnICsgJ3B1bmN0dWF0aW9uJ1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgQGRvUHVuY3Q6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBTeW50YXguZW5kV29yZCBvYmpcbiAgICAgICAgXG4gICAgICAgIGdldFZhbHVlID0gKGJhY2s9LTEpICAgICAtPiBTeW50YXguZ2V0VmFsdWUgb2JqLCBiYWNrIFxuICAgICAgICBzZXRWYWx1ZSA9IChiYWNrLCB2YWx1ZSkgLT4gU3ludGF4LnNldFZhbHVlIG9iaiwgYmFjaywgdmFsdWUgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICB2YWx1ZSA9ICdwdW5jdHVhdGlvbidcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBvYmouY2hhclxuICAgICAgICAgICAgd2hlbiAnOidcbiAgICAgICAgICAgICAgICBpZiBvYmouZGljdGxhbmcgYW5kIG9iai50dXJkLmxlbmd0aCA9PSAxXG4gICAgICAgICAgICAgICAgICAgIGlmIGxhc3Qob2JqLnJncyk/LnZhbHVlID09ICdkaWN0aW9uYXJ5IGtleSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ2RpY3Rpb25hcnkgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpZiBvYmouY29mZmVlICMga29mZmVlIGNvbnN0cnVjdG9yIHNob3J0Y3V0XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ21ldGhvZCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ21ldGhvZCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgIHdoZW4gJz4nXG4gICAgICAgICAgICAgICAgaWYgb2JqLmpzbGFuZ1xuICAgICAgICAgICAgICAgICAgICBmb3IgW3R1cmQsIHZhbF0gaW4gW1snLT4nLCAnJ10sIFsnPT4nLCAnIGJvdW5kJ11dXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvYmoudHVyZC5lbmRzV2l0aCB0dXJkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnN1YnN0aXR1dGUgb2JqLCAtMywgWydkaWN0aW9uYXJ5IGtleScsICdkaWN0aW9uYXJ5IHB1bmN0dWF0aW9uJ10sIFsnbWV0aG9kJywgJ21ldGhvZCBwdW5jdHVhdGlvbiddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LnN1cnJvdW5kICAgb2JqLCAtMSwgc3RhcnQ6JygnLCBhZGQ6J2FyZ3VtZW50JywgZW5kOicpJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5yZXBsYWNlICAgIG9iaiwgLTMsIFt7d29yZDp0cnVlLCBpZ25vcmU6J2FyZ3VtZW50J30sIHttYXRjaDonPSd9XSwgW3t2YWx1ZTonZnVuY3Rpb24nfV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZSAtMSwgJ2Z1bmN0aW9uIHRhaWwnICsgdmFsICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdmdW5jdGlvbiBoZWFkJyArIHZhbCArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBvYmoueG1sbGFuZyBvciBvYmoubWRcbiAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnR1cmQuZW5kc1dpdGggJy8+J1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWUgLTEsICdrZXl3b3JkIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdrZXl3b3JkIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgd2hlbiAnLydcbiAgICAgICAgICAgICAgICBpZiBvYmouanNsYW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBvYmouZXNjcFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgb2JqLnJlZ2V4cD9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gW29iai5yZ3MubGVuZ3RoLTEuLjBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9iai5yZ3NbaW5kZXhdLnN0YXJ0IDwgb2JqLnJlZ2V4cFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnJnc1tpbmRleF0udmFsdWUgPSAncmVnZXhwICcgKyBvYmoucmdzW2luZGV4XS52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJ3JlZ2V4cCBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmoucmVnZXhwID0gb2JqLmluZGV4ICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgaWYgbXRjaCA9IFN5bnRheC5tdGNoW29iai5leHRdP1tvYmouY2hhcl1cbiAgICAgICAgICAgIGlmIG1hdGNoVmFsdWUgPSBTeW50YXguZG9NYXRjaCBvYmosIG10Y2hcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IG1hdGNoVmFsdWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgb2JqLmZpbGwgdGhlbiB2YWx1ZSA9IG9iai5maWxsLnZhbHVlICsgJyAnICsgdmFsdWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICBzdGFydDogb2JqLmluZGV4XG4gICAgICAgICAgICBtYXRjaDogb2JqLmNoYXJcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuXG4gICAgICAgIFN5bnRheC5jaGVja0NvbW1lbnQgb2JqXG4gICAgICAgIFxuICAgICMjI1xuICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIFxuICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIFxuICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIFxuICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMjI1xuICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgIFxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIEBjaGVja0NvbW1lbnQ6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgZW1wdHkgU3ludGF4LmluZm9bb2JqLmV4dF0/LmNvbW1lbnRcbiAgICAgICAgcmV0dXJuIGlmIG9iai5yZWdleHA/XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgY29tbWVudCA9IFN5bnRheC5pbmZvW29iai5leHRdLmNvbW1lbnRcbiAgICAgICAgXG4gICAgICAgIGlmIGNvbW1lbnQubGluZSBhbmQgb2JqLnR1cmQuZW5kc1dpdGgoY29tbWVudC5saW5lKSBhbmQgbm90IG9iai50dXJkLmVuZHNXaXRoKCdcXFxcJytjb21tZW50LmxpbmUpIGFuZCBlbXB0eShvYmoud29yZHMpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFN5bnRheC5zdGFydENvbW1lbnQgb2JqLCBjb21tZW50LmxpbmVcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBjb21tZW50LnRhaWwgYW5kIG9iai50dXJkLmVuZHNXaXRoKGNvbW1lbnQudGFpbCkgYW5kIG5vdCBvYmoudHVyZC5lbmRzV2l0aCgnXFxcXCcrY29tbWVudC50YWlsKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBTeW50YXguc3RhcnRDb21tZW50IG9iaiwgY29tbWVudC50YWlsXG4gICAgICAgICAgICBcbiAgICAgICAgZWxzZSBpZiBjb21tZW50LnN0YXJ0IGFuZCBvYmoudHVyZC5lbmRzV2l0aChjb21tZW50LnN0YXJ0KSBhbmQgbm90IG9iai50dXJkLmVuZHNXaXRoKCdcXFxcJytjb21tZW50LnN0YXJ0KVxuXG4gICAgICAgICAgICBTeW50YXguc3RhcnRDb21tZW50IG9iaiwgY29tbWVudC5zdGFydFxuICAgICAgICAgICAgXG4gICAgICAgIG51bGxcblxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc3RhcnRDb21tZW50OiAob2JqLCBzdGFydCkgLT5cbiAgICAgICAgXG4gICAgICAgIG9iai5jb21tZW50ID1cbiAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXgrMVxuICAgICAgICAgICAgbWF0Y2g6ICcnXG4gICAgICAgICAgICB2YWx1ZTogJ2NvbW1lbnQnXG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIGluZGV4IGluIFswLi4uc3RhcnQubGVuZ3RoXVxuICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTEtaW5kZXgsICdjb21tZW50IHB1bmN0dWF0aW9uJ1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAwMDAwICAgICAwMDAwMDAwIFxuICAgIFxuICAgIEBkb0NvbW1lbnQ6IChvYmopIC0+XG5cbiAgICAgICAgY29tbWVudCA9IFN5bnRheC5pbmZvW29iai5leHRdLmNvbW1lbnRcbiAgICAgICAgXG4gICAgICAgIGlmIGNvbW1lbnQuZW5kIGFuZCBvYmoudHVyZC5lbmRzV2l0aChjb21tZW50LmVuZClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5jb21tZW50XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouY29tbWVudFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgaW5kZXggaW4gWzAuLi5jb21tZW50LmVuZC5sZW5ndGhdXG4gICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgLTEtaW5kZXgsICdjb21tZW50IHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgXG4gICAgICAgIGVsc2VcblxuICAgICAgICAgICAgU3ludGF4LmNvbnQgb2JqLCAnY29tbWVudCdcbiAgICAgICAgICAgIFxuICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgIyMjXG4gICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIFxuICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgXG4gICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgICMjI1xuICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIFxuICAgICMgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAc3RhcnRTdHJpbmc6IChvYmopIC0+XG4gICAgICAgIFxuICAgICAgICBTeW50YXguZW5kV29yZCBvYmpcbiAgICAgICAgXG4gICAgICAgIHN0cmluZ1R5cGUgPSBzd2l0Y2ggb2JqLmNoYXJcbiAgICAgICAgICAgIHdoZW4gXCInXCIgdGhlbiAnc3RyaW5nIHNpbmdsZSdcbiAgICAgICAgICAgIHdoZW4gJ1wiJyB0aGVuICdzdHJpbmcgZG91YmxlJ1xuICAgICAgICAgICAgd2hlbiAnYCcgdGhlbiAnc3RyaW5nIGJhY2t0aWNrJ1xuICAgICAgICAgICAgXG4gICAgICAgIGlmIG5vdCBzdHJpbmdUeXBlXG4gICAgICAgICAgICBlcnJvciBcIm5vIHN0cmluZyBjaGFyICcje29iai5jaGFyfSdcIlxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICBzdGFydDogb2JqLmluZGV4XG4gICAgICAgICAgICBtYXRjaDogb2JqLmNoYXJcbiAgICAgICAgICAgIHZhbHVlOiBcIiN7c3RyaW5nVHlwZX0gcHVuY3R1YXRpb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIG9iai5zdHJpbmcgPVxuICAgICAgICAgICAgdmFsdWU6ICBzdHJpbmdUeXBlXG4gICAgICAgICAgICBzdGFydDogIG9iai5pbmRleCsxXG4gICAgICAgICAgICBtYXRjaDogICcnXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG51bGxcblxuICAgICMgMDAwMDAwMCAgICAgMDAwMDAwMCBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAjIDAwMDAwMDAgICAgIDAwMDAwMDAgXG4gICAgXG4gICAgQGRvU3RyaW5nOiAob2JqKSAtPlxuXG4gICAgICAgIGlmIG9iai5jb2ZmZWUgXG4gICAgICAgICAgICBpZiBvYmouY2hhciA9PSAneycgYW5kIG9iai5zdHJpbmcudmFsdWUgIT0gJ3N0cmluZyBzaW5nbGUnIGFuZCBvYmouc3RyaW5nLm1hdGNoLmVuZHNXaXRoIFwiI1wiXG4gICAgICAgICAgICAgICAgb2JqLmludGVycG9sYXRpb24gPSBvYmouc3RyaW5nLnZhbHVlXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5zdHJpbmdcbiAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2hcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgICAgICAgICBtYXRjaDogb2JqLmNoYXJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFwiI3tvYmouaW50ZXJwb2xhdGlvbn0gcHVuY3R1YXRpb25cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBzdHJpbmdUeXBlID0gc3dpdGNoIG9iai5jaGFyXG4gICAgICAgICAgICB3aGVuIFwiJ1wiIHRoZW4gJ3N0cmluZyBzaW5nbGUnXG4gICAgICAgICAgICB3aGVuICdcIicgdGhlbiAnc3RyaW5nIGRvdWJsZSdcbiAgICAgICAgICAgIHdoZW4gJ2AnIHRoZW4gJ3N0cmluZyBiYWNrdGljaydcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBvYmouZXNjcCBhbmQgb2JqLnN0cmluZy52YWx1ZSA9PSBzdHJpbmdUeXBlXG5cbiAgICAgICAgICAgIGlmIHZhbGlkIG9iai5zdHJpbmcubWF0Y2gudHJpbSgpXG4gICAgICAgICAgICAgICAgb2JqLnJncy5wdXNoIG9iai5zdHJpbmdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGRlbGV0ZSBvYmouc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgb2JqLnJncy5wdXNoXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG9iai5pbmRleFxuICAgICAgICAgICAgICAgIG1hdGNoOiBvYmouY2hhclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcIiN7c3RyaW5nVHlwZX0gcHVuY3R1YXRpb25cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFN5bnRheC5jb250IG9iaiwgJ3N0cmluZydcbiAgICAgICAgICAgIFxuICAgICAgICBudWxsXG5cbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICBcbiAgICAjICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBAY29udDogKG9iaiwga2V5KSAtPlxuICAgICAgICBcbiAgICAgICAgc3RyT3JDbXQgPSBvYmpba2V5XVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIG9iai5jaGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuICcgJywgJ1xcdCdcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiBzdHJPckNtdC5tYXRjaCA9PSAnJ1xuICAgICAgICAgICAgICAgICAgICBzdHJPckNtdC5zdGFydCArPSAxXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2ggc3RyT3JDbXQgaWYgdmFsaWQgc3RyT3JDbXQubWF0Y2hcbiAgICAgICAgICAgICAgICAgICAgb2JqW2tleV0gPSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0OiBvYmouaW5kZXgrMVxuICAgICAgICAgICAgICAgICAgICAgICAgbWF0Y2g6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RyT3JDbXQudmFsdWVcbiAgICAgICAgICAgIGVsc2UgXG5cbiAgICAgICAgICAgICAgICBzdHJPckNtdC5tYXRjaCArPSBvYmouY2hhclxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgICAgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAZW5kTGluZTogKG9iaikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG9iai5zdHJpbmdcbiAgICAgICAgICAgIGlmIG9iai5qc2xhbmcgb3Igb2JqLmNwcGxhbmdcbiAgICAgICAgICAgICAgICBvYmoucmdzLnB1c2ggb2JqLnN0cmluZ1xuICAgICAgICBlbHNlIGlmIG9iai5jb21tZW50XG4gICAgICAgICAgICBvYmoucmdzLnB1c2ggb2JqLmNvbW1lbnRcbiAgICAgICAgbnVsbFxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAwMDAgMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjICAgICAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBAZ2V0TWF0Y2g6IChvYmosIGJhY2spICAgICAgICAtPiBpZiBiYWNrIDwgMCB0aGVuIG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgrYmFja10/Lm1hdGNoIGVsc2Ugb2JqLnJnc1tiYWNrXT8ubWF0Y2hcbiAgICBAZ2V0VmFsdWU6IChvYmosIGJhY2spICAgICAgICAtPiBpZiBiYWNrIDwgMCB0aGVuIG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgrYmFja10/LnZhbHVlIGVsc2Ugb2JqLnJnc1tiYWNrXT8udmFsdWUgICAgIFxuICAgIEBzZXRWYWx1ZTogKG9iaiwgYmFjaywgdmFsdWUpIC0+IFxuICAgICAgICBpZiBiYWNrIDwgMFxuICAgICAgICAgICAgYmFjayA9IG9iai5yZ3MubGVuZ3RoK2JhY2tcbiAgICAgICAgaWYgYmFjayA8IG9iai5yZ3MubGVuZ3RoIGFuZCBiYWNrID49IDBcbiAgICAgICAgICAgIG9iai5yZ3NbYmFja10udmFsdWUgPSB2YWx1ZVxuICAgICAgICAgICAgaWYgb2JqLmNvZmZlZSBhbmQgb2JqLnJnc1tiYWNrLTFdP1xuICAgICAgICAgICAgICAgIGlmIG9iai5yZ3NbYmFjay0xXT8ubWF0Y2ggPT0gJ0AnXG4gICAgICAgICAgICAgICAgICAgIG9iai5yZ3NbYmFjay0xXS52YWx1ZSA9IHZhbHVlICsgJyBwdW5jdHVhdGlvbidcblxuICAgIEBhZGRWYWx1ZTogKG9iaiwgYmFjaywgdmFsdWUpIC0+IFxuICAgICAgICBpZiBiYWNrIDwgMFxuICAgICAgICAgICAgYmFjayA9IG9iai5yZ3MubGVuZ3RoK2JhY2tcbiAgICAgICAgaWYgYmFjayA8IG9iai5yZ3MubGVuZ3RoIGFuZCBiYWNrID49IDBcbiAgICAgICAgICAgIGZvciB2YWwgaW4gdmFsdWUuc3BsaXQgL1xccysvXG4gICAgICAgICAgICAgICAgaWYgdmFsIG5vdCBpbiBvYmoucmdzW2JhY2tdLnZhbHVlLnNwbGl0IC9cXHMrL1xuICAgICAgICAgICAgICAgICAgICBvYmoucmdzW2JhY2tdLnZhbHVlID0gdmFsICsgJyAnICsgb2JqLnJnc1tiYWNrXS52YWx1ZVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIEBzdWJzdGl0dXRlOiAob2JqLCBiYWNrLCBvbGRWYWxzLCBuZXdWYWxzKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGluZGV4IGluIFswLi4ub2xkVmFscy5sZW5ndGhdXG4gICAgICAgICAgICB2YWwgPSBTeW50YXguZ2V0VmFsdWUgb2JqLCBiYWNrK2luZGV4XG4gICAgICAgICAgICBpZiB2YWwgIT0gb2xkVmFsc1tpbmRleF1cbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiBpbmRleCA9PSBvbGRWYWxzLmxlbmd0aFxuICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4ub2xkVmFscy5sZW5ndGhdXG4gICAgICAgICAgICAgICAgU3ludGF4LnNldFZhbHVlIG9iaiwgYmFjaytpbmRleCwgbmV3VmFsc1tpbmRleF1cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIG9iai5yZ3MubGVuZ3RoICsgYmFjay0xID49IDBcbiAgICAgICAgICAgIFN5bnRheC5zdWJzdGl0dXRlIG9iaiwgYmFjay0xLCBvbGRWYWxzLCBuZXdWYWxzXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgQHJlcGxhY2U6IChvYmosIGJhY2ssIG9sZE9ianMsIG5ld09ianMpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgb2JqLnJncy5sZW5ndGgrYmFjayA8IDBcbiAgICAgICAgXG4gICAgICAgIGFkdmFuY2UgPSAtPlxuICAgICAgICAgICAgaWYgb2JqLnJncy5sZW5ndGggKyBiYWNrLTEgPj0gMFxuICAgICAgICAgICAgICAgIFN5bnRheC5yZXBsYWNlIG9iaiwgYmFjay0xLCBvbGRPYmpzLCBuZXdPYmpzXG5cbiAgICAgICAgZm9yIGluZGV4IGluIFswLi4ub2xkT2Jqcy5sZW5ndGhdXG4gICAgICAgICAgICBiYWNrT2JqID0gb2JqLnJnc1tvYmoucmdzLmxlbmd0aCtiYWNrK2luZGV4XVxuICAgICAgICAgICAgaWYgbm90IGJhY2tPYmpcbiAgICAgICAgICAgICAgICBsb2cgJ2RhZnVrPycsIHN0ciBvYmpcbiAgICAgICAgICAgICAgICBsb2cgJ2RhZnVrPycsIG9iai5yZ3MubGVuZ3RoK2JhY2sraW5kZXgsIG9iai5yZ3MubGVuZ3RoLCBiYWNrLCBpbmRleFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgaWYgb2xkT2Jqc1tpbmRleF0uaWdub3JlXG4gICAgICAgICAgICAgICAgaWYgYmFja09iai52YWx1ZT8uaW5kZXhPZj8ob2xkT2Jqc1tpbmRleF0uaWdub3JlKSA+PSAwXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhZHZhbmNlKClcbiAgICAgICAgICAgIGZvciBrZXkgaW4gT2JqZWN0LmtleXMgb2xkT2Jqc1tpbmRleF1cbiAgICAgICAgICAgICAgICBzd2l0Y2gga2V5IFxuICAgICAgICAgICAgICAgICAgICB3aGVuICd3b3JkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgYmFja09iai52YWx1ZT8uaW5kZXhPZj8oJ3B1bmN0dWF0aW9uJykgPj0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhZHZhbmNlKClcbiAgICAgICAgICAgICAgICAgICAgd2hlbiAnaWdub3JlJyB0aGVuXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBvbGRPYmpzW2luZGV4XVtrZXldICE9IGJhY2tPYmpba2V5XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhZHZhbmNlKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGZvciBpbmRleCBpbiBbMC4uLm5ld09ianMubGVuZ3RoXVxuICAgICAgICAgICAgYmFja09iaiA9IG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgrYmFjaytpbmRleF1cbiAgICAgICAgICAgIGZvciBrZXkgaW4gT2JqZWN0LmtleXMgbmV3T2Jqc1tpbmRleF1cbiAgICAgICAgICAgICAgICBiYWNrT2JqW2tleV0gPSBuZXdPYmpzW2luZGV4XVtrZXldXG4gICAgICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICBAZG9NYXRjaDogKG9iaiwgbXRjaHMpIC0+XG4gICAgICAgIFxuICAgICAgICBmb3IgbXRjaCBpbiBtdGNoc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdGFydExlbmd0aCA9IG10Y2guc3RhcnQ/Lmxlbmd0aCA/IDBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbXRjaC5zaW5nbGUgXG4gICAgICAgICAgICAgICAgaWYgb2JqLnRleHRbb2JqLmluZGV4KzFdID09IG10Y2guZW5kXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgaWYgbGFzdChvYmoucmdzKT8ubWF0Y2ggPT0gbXRjaC5lbmRcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgb2JqLnJncy5sZW5ndGgtbXRjaC5lbmQubGVuZ3RoLXN0YXJ0TGVuZ3RoIDwgMFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlIFxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbmRNYXRjaGVzID0gdHJ1ZVxuICAgICAgICAgICAgZm9yIGVuZEluZGV4IGluIFsxLi4ubXRjaC5lbmQubGVuZ3RoXVxuICAgICAgICAgICAgICAgIGlmIG9iai5yZ3Nbb2JqLnJncy5sZW5ndGgtZW5kSW5kZXhdLm1hdGNoICE9IG10Y2guZW5kW210Y2guZW5kLmxlbmd0aC1lbmRJbmRleF1cbiAgICAgICAgICAgICAgICAgICAgZW5kTWF0Y2hlcyA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBpZiBub3QgZW5kTWF0Y2hlc1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbXRjaC5zcGFjZWQgPT0gZmFsc2VcbiAgICAgICAgICAgICAgICBpZiBvYmoudHVyZC5pbmRleE9mKCcgJykgPj0gMFxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgbXRjaC5zdGFydFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBzdGFydEluZGV4IGluIFtvYmoucmdzLmxlbmd0aC1zdGFydExlbmd0aC1tdGNoLmVuZC5sZW5ndGguLjBdXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0TWF0Y2hlcyA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgZm9yIGluZGV4IGluIFswLi4uc3RhcnRMZW5ndGhdXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBTeW50YXguZ2V0TWF0Y2gob2JqLCBzdGFydEluZGV4K2luZGV4KSAhPSBtdGNoLnN0YXJ0W2luZGV4XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0TWF0Y2hlcyA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWsgaWYgc3RhcnRNYXRjaGVzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIHN0YXJ0SW5kZXggPj0gMFxuICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gW3N0YXJ0SW5kZXguLi5zdGFydEluZGV4K3N0YXJ0TGVuZ3RoXVxuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmFkZFZhbHVlIG9iaiwgaW5kZXgsIG10Y2gudmFsdWUgKyAnIHB1bmN0dWF0aW9uJ1xuICAgICAgICAgICAgICAgICAgICBmb3IgaW5kZXggaW4gW3N0YXJ0SW5kZXgrc3RhcnRMZW5ndGguLi5vYmoucmdzLmxlbmd0aC1tdGNoLmVuZC5sZW5ndGgrMV1cbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIGluZGV4LCBtdGNoLnZhbHVlXG4gICAgICAgICAgICAgICAgICAgIGZvciBpbmRleCBpbiBbb2JqLnJncy5sZW5ndGgtbXRjaC5lbmQubGVuZ3RoKzEuLi5vYmoucmdzLmxlbmd0aF1cbiAgICAgICAgICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIGluZGV4LCBtdGNoLnZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtdGNoLnZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgU3ludGF4LmFkZFZhbHVlIG9iaiwgLTEsIG10Y2gudmFsdWVcbiAgICAgICAgICAgICAgICBpbmRleCA9IC0yXG4gICAgICAgICAgICAgICAgd2hpbGUgU3ludGF4LmdldE1hdGNoKG9iaiwgaW5kZXgpID09ICctJ1xuICAgICAgICAgICAgICAgICAgICBTeW50YXguc2V0VmFsdWUgb2JqLCBpbmRleCwgbXRjaC52YWx1ZSArICcgcHVuY3R1YXRpb24nXG4gICAgICAgICAgICAgICAgICAgIFN5bnRheC5hZGRWYWx1ZSBvYmosIGluZGV4LTEsIG10Y2gudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggLT0gMlxuICAgICAgICAgICAgICAgIHJldHVybiBtdGNoLnZhbHVlICsgJyBwdW5jdHVhdGlvbidcbiAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIEBzdXJyb3VuZDogKG9iaiwgYmFjaywgcmFuZ2UpIC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgb2JqLnJncy5sZW5ndGgtMStiYWNrIDw9IDFcbiAgICAgICAgZm9yIGVuZEluZGV4IGluIFtvYmoucmdzLmxlbmd0aC0xK2JhY2suLjBdXG4gICAgICAgICAgICBpZiBlbmRJbmRleCA+PSBvYmoucmdzLmxlbmd0aCBvciBlbmRJbmRleCA8IDBcbiAgICAgICAgICAgICAgICBsb2cgJ2RhZnVrPycsIGVuZEluZGV4LCBvYmoucmdzLmxlbmd0aCwgYmFja1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgaWYgbm90IG9iai5yZ3NbZW5kSW5kZXhdP1xuICAgICAgICAgICAgICAgIGxvZyAnZGFmdWsyPycsIGVuZEluZGV4LCBvYmoucmdzLmxlbmd0aCwgYmFja1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgaWYgcmFuZ2UuZW5kID09IG9iai5yZ3NbZW5kSW5kZXhdPy5tYXRjaFxuICAgICAgICAgICAgICAgIGZvciBzdGFydEluZGV4IGluIFtlbmRJbmRleC0xLi4wXVxuICAgICAgICAgICAgICAgICAgICBpZiByYW5nZS5zdGFydCA9PSBvYmoucmdzW3N0YXJ0SW5kZXhdPy5tYXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGFkZEluZGV4IGluIFtzdGFydEluZGV4KzEuLi5lbmRJbmRleF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmoucmdzW2FkZEluZGV4XS52YWx1ZSA9IHJhbmdlLmFkZCArICcgJyArIG9iai5yZ3NbYWRkSW5kZXhdLnZhbHVlXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTeW50YXhcbiJdfQ==
//# sourceURL=../coffee/syntax.coffee