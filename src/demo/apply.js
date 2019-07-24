'use strict';
Function.prototype.apply2 = function(context,args){
    context.fn = this;
    if (!args) {
        result = context.fn();
    }
    const result = context.fn(...args);
    delete context.fn;
    return result;
}
var foo = {
    value:1
}
var bar = function(name,age){
    console.log(name)
    console.log(age)
    console.log(this.value);
    return {
        value: this.value,
        name: name,
        age: age
    }
}
const result = bar.apply2(foo,['rest',11])
console.log(result)