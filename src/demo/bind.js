'use strict';
Function.prototype.bind2 = function(context){
    var self =this;
    var args = Array.prototype.slice.call(arguments,1);
    var fBound = function() {
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(this instanceof fBound?this:context,args.concat(bindArgs))
    }
    fBound.prototype = this.prototype;
    return fBound;
}
var value = 2;

var foo = {
    value: 1
};

function bar(name, age) {
    this.habit = 'shopping';
    console.log(this.value);
    console.log(name);
    console.log(age);
}

bar.prototype.friend = 'kevin';

var bindFoo = bar.bind2(foo, 'daisy');

var obj = new bindFoo('18');
console.log(obj.habit);
console.log(obj.friend);