// 模拟实现call 函数
'use strict';
Function.prototype.call2 = function(context){
    context.fn = this;
    let args =[];
    for(var i = 1, len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
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
const result = bar.call2(foo,'rest',11)
console.log(result)