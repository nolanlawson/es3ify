
function wrap(fun) {
    var res = '((' + fun.toString().replace(/\s+/g, ' ') + ')())'
    console.log(res);
    return res;
}

exports.isArray = wrap(function() {
    return Array.isArray || function(value) {
        return (value && typeof value == 'object' && typeof value.length == 'number' &&
            Object.prototype.toString.call(value) == '[object Array]') || false;
    };
});