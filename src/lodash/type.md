## lodash源码解析js类型判断
### isArguments
> arguments--- 每个函数都有一个arguments属性，表示函数的实参集合,就是执行函数时实际传入的参数集合，arguments不是数组而是一个对象，他和数组很相似，所以通常称为类数组对象，arguments对象不能显示的创建，它只有在函数执行是才可用。

#### 示例代码
```
function test(){
  console.log(typeof arguments)
  console.log(arguments  instanceof Array)
}
test([1,2],'1',{a:1});
# object
# false
```
#### lodash 源码
```
function isArguments(value) {
  return isObjectLike(value) && getTag(value) == '[object Arguments]'
}
```
>判断其是一个Object 并且是一个Arguments对象

### isNumber
#### lodash 源码
```
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike(value) && getTag(value) == '[object Number]')
}
```
>typeof 操作符可以返回一个字符串，表示未经计算的操作数的类型。对于 Number、String、Boolean、Undefined、String 可以很明确的得到它的类型。那么为何还有或语语句

```
const value = new Number(1)
console.log(value) //1
console.log(typeof value) // "object"
```
>这时，单单只是使用 typeof 操作符就没法判断 value 的类型是否为数值。所以要结合以下两个函数来判断，value 是否为 object 然后再通过过 toString() 来获取每个对象的类型

### isInteger
#### lodash 源码

```
function isInteger(value) {
    return
        typeof value == 'number'
        && value == toInteger(value);
}
```
> 首先判断其是否是一个number类型，然后把其转换成Integer类型，判断其值是否相等

### isString
#### lodash 源码
```
function isString(value) {
  const type = typeof value
  return type == 'string' || (type == 'object' && value != null && !Array.isArray(value) && getTag(value) == '[object String]')
}
```
> 检测字符串，除了基本字符串以外还要注意字符串对象

### isBoolean
#### lodash 源码
```
function isBoolean(value) {
  return
    value === true || value === false ||
    (isObjectLike(value)
     && getTag(value) == '[object Boolean]')
}
```
> 该类型只有两个字面值：true 和 false。同样也需要区分基本的 Boolean 类型以及 Boolean 对象。

### isSymbol
#### lodash 源码
```
function isSymbol(value) {
  const type = typeof value
  return type == 'symbol' ||
      (isObjectLike(value) &&
       getTag(value) == '[object Symbol]')
}
```
> symbol 不能使用new Symbol
### isUndefined
#### lodash 源码
```
function isUndefined(value) {
    return value === undefined;
}
```
>Undefined 类型只有一个值 undefined

### isNull
#### lodash 源码
```
function isNull(value) {
  return value === null
}
```
### isObject
#### lodash 源码
```
function isObject(value) {
  const type = typeof value
  return value != null &&
      (type == 'object' || type == 'function')
}
```
> Object 类型是所有它的实例的基础

### isFunction
#### lodash 源码
```
function isFunction(value) {
  if (!isObject(value)) {
    return false
  }

  const tag = getTag(value)
  return tag == '[object Function]' ||
          tag == '[object AsyncFunction]' ||
        tag == '[object GeneratorFunction]' ||
          tag == '[object Proxy]'
}
```
### isArray
#### lodash 源码
```
function isArray=(value){
  return Object.prototype.toString.call(value) === '[object Array]'
}
```
>如果是 Node 就利用 util.types.isDate(value) 来检测，如果是在游览器，就还是通过 Object.prototype.toString 来判断

### isSet
#### lodash 源码
```
const isSet = nodeIsSet
  ? (value) => nodeIsSet(value)
  : (value) => isObjectLike(value) && getTag(value) == '[object Set]'
```

### isMap
#### lodash 源码
```
const isMap = nodeIsMap
  ? (value) => nodeIsMap(value)
  : (value) => isObjectLike(value) && getTag(value) == '[object Map]'
```

### isError
#### lodash 源码
```
function isError(value) {
  if (!isObjectLike(value)) {
    return false
  }

  const tag = getTag(value)
  return tag == '[object Error]' ||
      tag == '[object DOMException]' ||
    (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value))
}
```

> 如果对象满足以下条件，也可以被视为一个 Error

1. 具备 message、name 属性，且值为 string；
2. 是普通对象。 也就是说该对象由 Object 构造函数创建，或者 [[Prototype]] 为 null

### isObjectLike
#### lodash 源码
```
function isObjectLike(value) {
  return typeof value == 'object' && value !== null
}
```
>不同对象底层都表示为二进制，在javascript中二进制前三位都为0的话都会判为object,null的二进制表示全为零，前三位为也为零，所以typeof 会返回Object;
- 二进制前三位标识数据类型
  - 000: 对象
  - 1：整型，数据是31位带符号的整数
  - 010：双精度类型，数据是双精度数字
  - 100：字符串，数据是字符串
  - 110： 布尔类型，数据是布尔值


### 工具类方法源码
#### getTag
```code
const toString = Object.prototype.toString
function getTag(value) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  return toString.call(value)
}
```

>toString被调用时分别执行以下几个步骤
1. 如果this的值为undefined,则返回"[object Undefined]".
2. 如果this的值为null,则返回"[object Null]"。
3. 让O成为调用ToObject(this)的结果。
4. 让class成为O的内部属性[[Class]]的值。
5. 返回三个字符串"[object ", class, 以及 "]"连接后的新字符串。

#### toInteger
```
function toInteger(value) {
    var result = toFinite(value),
        remainder = result % 1;

    return result === result ?
        (remainder ? result - remainder : result) : 0;
}
```
#### toFinite
```
const INFINITY = 1 / 0; //Infinity
const MAX_INTEGER = 1.7976931348623157e+308;
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0
  }
  value = toNumber(value)
  if (value === INFINITY || value === -INFINITY) {
    const sign = (value < 0 ? -1 : 1)
    return sign * MAX_INTEGER
  }
  return value === value ? value : 0
}
```
> 转化为有限值，Infinity 将呗转化为0

#### toNumber

```
function toNumber(value) {
  if (typeof value == 'number') {
    return value
  }
  if (isSymbol(value)) {
    return NAN
  }
  if (isObject(value)) {
    const other = typeof value.valueOf == 'function' ? value.valueOf() : value
    value = isObject(other) ? `${other}` : other
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value
  }
  value = value.replace(reTrim, '')
  const isBinary = reIsBinary.test(value)
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value)
}
```


