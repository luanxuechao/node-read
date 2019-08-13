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
