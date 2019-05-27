// koffee 0.45.0

/*
 0000000  000   000  000   000  000000000   0000000   000   000
000        000 000   0000  000     000     000   000   000 000 
0000000     00000    000 0 000     000     000000000    00000  
     000     000     000  0000     000     000   000   000 000 
0000000      000     000   000     000     000   000  000   000
 */
var Syntax, noon, ref, slash,
    indexOf = [].indexOf;

ref = require('kxk'), slash = ref.slash, noon = ref.noon;

Syntax = (function() {
    function Syntax() {}

    Syntax.exts = [];

    Syntax.lang = null;

    Syntax.init = function() {
        var ext, extNames, langFile, ref1, results, value, valueWords, word, words;
        if (Syntax.lang !== null) {
            return;
        }
        Syntax.lang = {};
        Syntax.exts.push('txt');
        Syntax.exts.push('log');
        Syntax.exts.push('koffee');
        langFile = slash.join(__dirname, '..', 'coffee', 'lang.noon');
        ref1 = noon.load(langFile);
        results = [];
        for (extNames in ref1) {
            valueWords = ref1[extNames];
            results.push((function() {
                var base, i, len, ref2, results1;
                ref2 = extNames.split(/\s/);
                results1 = [];
                for (i = 0, len = ref2.length; i < len; i++) {
                    ext = ref2[i];
                    if (indexOf.call(Syntax.exts, ext) < 0) {
                        Syntax.exts.push(ext);
                    }
                    if ((base = Syntax.lang)[ext] != null) {
                        base[ext];
                    } else {
                        base[ext] = {};
                    }
                    results1.push((function() {
                        var results2;
                        results2 = [];
                        for (value in valueWords) {
                            words = valueWords[value];
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
                        return results2;
                    })());
                }
                return results1;
            })());
        }
        return results;
    };

    return Syntax;

})();

module.exports = Syntax;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ludGF4LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx3QkFBQTtJQUFBOztBQVFBLE1BQWtCLE9BQUEsQ0FBUSxLQUFSLENBQWxCLEVBQUUsaUJBQUYsRUFBUzs7QUFFSDs7O0lBRUYsTUFBQyxDQUFBLElBQUQsR0FBUTs7SUFDUixNQUFDLENBQUEsSUFBRCxHQUFROztJQUVSLE1BQUMsQ0FBQSxJQUFELEdBQU8sU0FBQTtBQUVILFlBQUE7UUFBQSxJQUFVLE1BQU0sQ0FBQyxJQUFQLEtBQWUsSUFBekI7QUFBQSxtQkFBQTs7UUFFQSxNQUFNLENBQUMsSUFBUCxHQUFjO1FBRWQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLEtBQWpCO1FBQ0EsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLEtBQWpCO1FBQ0EsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFaLENBQWlCLFFBQWpCO1FBRUEsUUFBQSxHQUFXLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFxQixJQUFyQixFQUF5QixRQUF6QixFQUFpQyxXQUFqQztBQUNYO0FBQUE7YUFBQSxnQkFBQTs7OztBQUNJO0FBQUE7cUJBQUEsc0NBQUE7O29CQUVJLElBQXlCLGFBQVcsTUFBTSxDQUFDLElBQWxCLEVBQUEsR0FBQSxLQUF6Qjt3QkFBQSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQVosQ0FBaUIsR0FBakIsRUFBQTs7OzRCQUVZLENBQUEsR0FBQTs7NEJBQUEsQ0FBQSxHQUFBLElBQVE7Ozs7QUFDcEI7NkJBQUEsbUJBQUE7Ozs7QUFDSTtxQ0FBQSx5Q0FBQTs7a0RBQ0ksTUFBTSxDQUFDLElBQUssQ0FBQSxHQUFBLENBQUssQ0FBQSxJQUFBLENBQWpCLEdBQXlCO0FBRDdCOzs7QUFESjs7O0FBTEo7OztBQURKOztJQVhHOzs7Ozs7QUFxQlgsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAwMDAgMDAwICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgXG4wMDAwMDAwICAgICAwMDAwMCAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAwICAgIDAwMDAwICBcbiAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAgMDAwIFxuMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBzbGFzaCwgbm9vbiB9ID0gcmVxdWlyZSAna3hrJ1xuXG5jbGFzcyBTeW50YXhcblxuICAgIEBleHRzID0gW10gXG4gICAgQGxhbmcgPSBudWxsXG4gICAgXG4gICAgQGluaXQ6IC0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgU3ludGF4LmxhbmcgIT0gbnVsbFxuICAgICAgICBcbiAgICAgICAgU3ludGF4LmxhbmcgPSB7fVxuICAgICAgICBcbiAgICAgICAgU3ludGF4LmV4dHMucHVzaCAndHh0J1xuICAgICAgICBTeW50YXguZXh0cy5wdXNoICdsb2cnXG4gICAgICAgIFN5bnRheC5leHRzLnB1c2ggJ2tvZmZlZSdcbiAgICAgICAgXG4gICAgICAgIGxhbmdGaWxlID0gc2xhc2guam9pbiBfX2Rpcm5hbWUsJy4uJydjb2ZmZWUnJ2xhbmcubm9vbidcbiAgICAgICAgZm9yIGV4dE5hbWVzLCB2YWx1ZVdvcmRzIG9mIG5vb24ubG9hZCBsYW5nRmlsZVxuICAgICAgICAgICAgZm9yIGV4dCBpbiBleHROYW1lcy5zcGxpdCAvXFxzL1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgU3ludGF4LmV4dHMucHVzaChleHQpIGlmIGV4dCBub3QgaW4gU3ludGF4LmV4dHNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFN5bnRheC5sYW5nW2V4dF0gPz0ge31cbiAgICAgICAgICAgICAgICBmb3IgdmFsdWUsd29yZHMgb2YgdmFsdWVXb3Jkc1xuICAgICAgICAgICAgICAgICAgICBmb3Igd29yZCBpbiB3b3Jkc1xuICAgICAgICAgICAgICAgICAgICAgICAgU3ludGF4LmxhbmdbZXh0XVt3b3JkXSA9IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBTeW50YXhcbiJdfQ==
//# sourceURL=../coffee/syntax.coffee