function SuperType() {
    this.property = true;
}
SuperType.prototype.getSuperValue = function() {
    return this.property
}

function SubType() {
    this.subproperty = true;
}
SubType.prototype = new SuperType();
SubType.prototype.getSubValue = function() {
    return this.subproperty;
}
var instance = new SubType();
console.log(Object.getPrototypeOf(instance))
console.log(instance.constructor.prototype.constructor  )
console.log(instance.constructor._proto_)