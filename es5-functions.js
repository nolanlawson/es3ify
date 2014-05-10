
function wrap(fun) {
    var res = '((' + fun.toString().replace(/\s+/g, ' ') + ')())'
    return res;
}

exports.isArray = wrap(function() {
    return Array.isArray || function(value) {
        return (value && typeof value == 'object' && typeof value.length == 'number' &&
            Object.prototype.toString.call(value) == '[object Array]') || false;
    };
});

exports.keys = wrap(function() {
    return Object.keys || function(object) {
        if ((typeof object !== 'object' &&
            typeof object !== 'function') ||
            object === null) {
            throw new TypeError('Object.keys called on a non-object');
        }

        var mykeys = [];
        for (var name in object) {
            if (Object.prototype.hasOwnProperty.call(object, name)) {
                mykeys.push(name);
            }
        }
        return mykeys;
    };
});

exports.staticFunctions = [
    ['Array', 'isArray', exports.isArray],
    ['Object', 'keys', exports.keys]
];