var transform = require('../index.js').transform;

var es5Functions = require('../es5-functions');

var isArray = es5Functions.isArrayFun;
var keys = es5Functions.keysFun;
var forEach = es5Functions.forEachFun;
var bind = es5Functions.bindFun;

describe('es3ify', function() {
    it('should quote property keys', function() {
        expect(transform('x = {dynamic: 0, static: 17};'))
                .toEqual('x = {dynamic: 0, "static": 17};');
    });

    it('should quote member properties', function() {
        expect(transform('x.dynamic++; x.static++;'))
                .toEqual('x.dynamic++; x["static"]++;');
    });

    it('should remove trailing commas in arrays', function() {
        expect(transform('[2, 3, 4,]'))
                .toEqual('[2, 3, 4]');
    });

    it('should keep comments near a trailing comma', function() {
        expect(transform('[2, 3, 4 /* = 2^2 */,// = 6 - 2\n]'))
                .toEqual('[2, 3, 4 /* = 2^2 */// = 6 - 2\n]');
    });

    it('should remove trailing commas in objects', function() {
        expect(transform('({x: 3, y: 4,})'))
                .toEqual('({x: 3, y: 4})');
    });

    it('should transform everything at once', function() {
        expect(transform('({a:2,\tfor :[2,,3,],}\n.class)'))
                .toEqual('({a:2,\t"for" :[2,,3]}[\n"class"])');
    });

    it('should transform Array.isArray', function() {
        expect(transform('if (Array.isArray(["foo"])) console.log("hello");'))
                .toEqual('if (' + isArray + '(["foo"])) console.log("hello");');
    });

    it('should transform Object.keys', function() {
        expect(transform('console.log(Object.keys({foo: bar}).indexOf("foo"));'))
            .toEqual('console.log(' + keys + '({foo: bar}).indexOf("foo"));');
    });

    it('should transform Array.prototype.forEach', function() {
        expect(transform('[1, 2, 3].forEach(function (el, i) { console.log(el); });'))
            .toEqual('(' + forEach + '([1, 2, 3]))(function (el, i) { console.log(el); });');
    });

    it('should transform Function.prototype.bind', function() {
        expect(transform('foo.bind(bar);'))
            .toEqual('(' + bind + '(foo))(bar);');
    });
});
