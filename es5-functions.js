'use strict';

//
// Static functions like Array.isArray and Object.keys
//

function wrap(fun) {
    return '((' + fun.toString().replace(/\s+/g, ' ') + ')())';
}

exports.isArrayFun = wrap(function() {
    return Array.isArray || function(value) {
        return (value && typeof value == 'object' && typeof value.length == 'number' &&
            Object.prototype.toString.call(value) == '[object Array]') || false;
    };
});

exports.keysFun = wrap(function() {
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

exports.forEachFun = wrapDynamic(exports.isArrayFun, 'forEach', function(arr) {
    return function(fun) {
        if (Array.prototype.forEach) {
            return arr.forEach(fun);
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

function isFunction(fun) {
    return typeof fun === 'function';
}

exports.bindFun = wrapDynamic(isFunction, 'bind', function(thisFun) {
    return function(that) {
        if (Function.prototype.bind) {
            return thisFun.bind(that);
        }

        function Empty() {}

        var target = thisFun;
        if (!isFunction(target)) {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        var args = Array.prototype.slice.call(arguments, 1);
        var binder = function () {

            if (this instanceof bound) {
                var result = target.apply(
                    this,
                    args.concat(Array.prototype.slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                return target.apply(
                    that,
                    args.concat(Array.prototype.slice.call(arguments))
                );

            }

        };
        var boundLength = Math.max(0, target.length - args.length);
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push("$" + i);
        }
        var bound = Function("binder", "return function(" + boundArgs.join(",") + "){return binder.apply(this,arguments)}")(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }

        return bound;
    };
});

exports.mapFun = wrapDynamic(exports.isArrayFun, 'map', function(arr) {
    return function(fun) {
        if (Array.prototype.map) {
            return arr.map(fun);
        }
        var length = arr.length;
        var result = new Array(length);

        if (typeof fun !== 'function') {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in arr) {
                result[i] = fun.call(arr, arr[i], i);
            }
        }
        return result;
    };
});

// TODO: varargs for reduce (defaultVal === undefined is not a sufficient test)
exports.reduceFun = wrapDynamic(exports.isArrayFun, 'reduce', function(self) {
   return function(fun, defaultVal) {
       if (Array.prototype.reduce) {
           return self.reduce(fun, defaultVal);
       }
       var length = self.length;

       if (!isFunction(fun)) {
           throw new TypeError(fun + " is not a function");
       }

       var i = 0;
       var result;
       if (typeof defaultVal !== 'undefined') {
           result = defaultVal;
       } else {
           do {
               if (i in self) {
                   result = self[i++];
                   break;
               }

               if (++i >= length) {
                   throw new TypeError("reduce of empty array with no initial value");
               }
           } while (true);
       }

       for (; i < length; i++) {
           if (i in self) {
               result = fun.call(void 0, result, self[i], i);
           }
       }

       return result;
   };
});

exports.filterFun = wrapDynamic(exports.isArrayFun, 'filter', function(self) {
    return function (fun) {
        if (Array.prototype.filter) {
            return self.filter(fun);
        }
        var length = self.length,
            result = [],
            value;

        if (typeof fun !== 'function') {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (fun.call(self, value, i)) {
                    result.push(value);
                }
            }
        }
        return result;
    };
});

exports.staticFunctions = [
    ['Array', 'isArray', exports.isArrayFun],
    ['Object', 'keys', exports.keysFun]
];

exports.dynamicFunctions = [
    ['forEach', exports.forEachFun],
    ['bind', exports.bindFun],
    ['map', exports.mapFun],
    ['reduce', exports.reduceFun],
    ['filter', exports.filterFun]
];