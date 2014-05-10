//
// Static functions like Array.isArray and Object.keys
//

function wrap(fun) {
    return '((' + fun.toString().replace(/\s+/g, ' ') + ')())'
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

//
// Dynamic functions, such as Array.prototype.forEach and Function.prototype.bind
// For these, for simplicity's sake, we replace the entire function with a
// wrapper that checks the type and uses the shim only if necessary. This
// covers cases where e.g. the user decides to name a method on a non-Array
// prototype "forEach", for whatever reason.
//

function wrapDynamic(parentTest, memberName, fun) {
    var ret = '(function (x) { return (' + parentTest.toString() + ')(x) ? ((' +
        fun.toString() + ')(x)) : x.' + memberName + ';})'
    ret = ret.replace(/\s+/g, ' ');
    return ret;
};

exports.forEach = wrapDynamic(exports.isArray, 'forEach', function(arr) {
    return function(fun) {
        if (Array.prototype.forEach) {
            arr.forEach(fun);
            return;
        }
        var i = -1;
        var length = arr.length;

        while (++i < length) {
            if (i in arr) {
                fun.call(arr, arr[i], i);
            }
        }
    };
});

exports.staticFunctions = [
    ['Array', 'isArray', exports.isArray],
    ['Object', 'keys', exports.keys]
];

exports.dynamicFunctions = [
    ['forEach', exports.forEach]
];