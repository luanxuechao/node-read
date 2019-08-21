## ['1', '2', '3'].map(parseInt) what & why ?
解析:：
展开此方法即：
 ```
 ['1', '2', '3'].map((num,index)=>{
    return parseInt(num,index);
 });
 // num 1  index 0(以10进制)  result ==> 1,
 // num 2  index 1 result ==>NaN 
 // ....
 [1,NaN,NaN]
 ``` 
 变形：
 ```
let unary = fn => val => fn(val)
let parse = unary(parseInt)
console.log(['1.1', '2', '0.3'].map(parse))
 ```
```
['1.1', '2', '0.3'].map((num,index)=>{
    return parseInt(num)
})
// [1,2,0]
```
### 介绍下 Set、Map、WeakSet 和 WeakMap 的区别？
#### Set
1. 成员不能重复
2. 只有健值，没有健名，有点类似数组。
3. 可以遍历，方法有add, delete,has
#### weakSet

1. 成员都是对象
2. 成员都是弱引用，随时可以消失。 可以用来保存DOM节点，不容易造成内存泄漏
3. 不能遍历，方法有add, delete,has
#### Map

1. 本质上是健值对的集合，类似集合
2. 可以遍历，方法很多，可以干跟各种数据格式转换
#### weakMap
1. 直接受对象作为健名（null除外），不接受其他类型的值作为健名
2. 健名所指向的对象，不计入垃圾回收机制
3. 不能遍历，方法同get,set,has,delete
### 请写出下面代码的运行结果
```code
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    console.log('async2');
}
console.log('script start');
setTimeout(function() {
    console.log('setTimeout');
}, 0)
async1();
new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');
```

```
console.log('script start');
 console.log('async1 start');
  console.log('async2');
    console.log('promise1');
    console.log('script end');
     console.log('async1 end');
     console.log('promise2');
      console.log('setTimeout');
```
### 变形
```
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    //async2做出如下更改：
    new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
    });
}
console.log('script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0)
async1();

new Promise(function(resolve) {
    console.log('promise3');
    resolve();
}).then(function() {
    console.log('promise4');
});

console.log('script end');
```
```
script start
async1 start
promise1
promise3
script end
promise2
async1 end
promise4
setTimeout
```
### 变形二
```
async function async1() {
    console.log('async1 start');
    await async2();
    //更改如下：
    setTimeout(function() {
        console.log('setTimeout1')
    },0)
}
async function async2() {
    //更改如下：
	setTimeout(function() {
		console.log('setTimeout2')
	},0)
}
console.log('script start');

setTimeout(function() {
    console.log('setTimeout3');
}, 0)
async1();

new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');
```

```
script start
async1 start
promise1
script end
promise2
setTimeout3
setTimeout2
setTimeout1
```
