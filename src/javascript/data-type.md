## javacript 数据类型
### 解读
1. js的数据类型有哪些，有什么区别

    js的数据类型可以分为两大类，一类为基本数据类型，一类为引用数据类型。他们之间区别在于一个为在赋值时一个为值传递，一个为引用传递。值传递即在赋值是传递变量本身的值，引用传递则在赋值时传递该变量的内存地址（即指针，js里弱化了指针的概念，不懂可以补下数据结构）当赋值的变量值发生改变时，值传递互不影响，但引用会跟着改变。

    ```note
     示例代码（可直接用浏览器运行）
    ```
    ```code
    var a =1;
    var b = a;
    a= 2;
    console.log(a,b);
    // 2 1
    var c = {};// 语法糖写法
    var d = c;
    c.e =1;
    console.log(c,d)
    // {e: 1} {e: 1}
    ```
    由上述代码可以看出，js的number类型是值传递，而object是个引用数据类型

### 基本类型（值传递）
    - null
    - undefined
    - number
    - string
    - boolean
    - Symbol(es6)
### 引用类型
    - Object
    - Array
    - Function
    - Date
    -  ....
### null
    null值表示一个空指针对象，表示变量未指向任何对象,即如下:
     ```code
     typeof null
     // "object"
     ```
    那么此时我们又该如何判断一个对象是不是null呢？因为typeof方法返回是个object，因此我们无法用typeof来判断,所以我们只能用===来判断？为什么不是==，因为如下：
    ```code
     null == undefined
     // true
     // 这是设计规范导致
     ```
### 解读
#### null 和 undefined 有什么区别？什么时候时null 什么时候时是undefined？
1. 在定义一个变量未给其赋值时,它是个undefined。在定义一个变量给他赋值为null,它才是一个null,null值表示一个空指针对象，表示变量未指向任何对象。我们经常可以在手动GC（垃圾回收，后面再说）的时候使用，手动释放内存。
2. 做加减是转换时
null是一个表示"无"的对象，转为数值时为0；undefined是一个表示"无"的原始值，转为数值时为NaN
 ```code
 Number(null)
 // 0
 1 + null
 // 1
 Number(undefined)
 // NaN
 1+undefined
 // NaN
```
#### 隐式转换

用js大家在做判断的时候都会用== 或者===,由于js是弱类型语言，导致我们在使用==时，会做一些隐式转换
类型相同时，没有类型转换，主要注意NaN不与任何值相等，包括它自己，即NaN !== NaN。
1. x,y 为null、undefined两者中一个 // 返回true
2. x、y为Number和String类型时，则转换为Number类型比较
3. 有Boolean类型时，Boolean转化为Number类型比较
4. 一个Object类型，一个String或Number类型，将Object类型进行原始转换后，按上面流程进行原始值比较
5. 如果 x y 类型相同时 返回 x===y 的结果

##### 两篇隐式转换很全的文章

1. [你所忽略的js隐式转换](https://juejin.im/post/5a7172d9f265da3e3245cbca)

2. [从++[[]][+[]]+[+[]]==10?深入浅出弱类型JS的隐式转换](https://github.com/jawil/blog/issues/5)

#### object 浅拷贝与深拷贝
1. 什么是浅拷贝？什么是深拷贝
浅拷贝的时候如果数据是基本数据类型，那么就如同直接赋值那种，会拷贝其本身，如果除了基本数据类型之外还有一层对象，那么对于浅拷贝而言就只能拷贝其引用，对象的改变会反应到拷贝对象上；但是深拷贝就会拷贝多层，即使是嵌套了对象，也会都拷贝出来。
   (1) 实现浅拷贝方法

        - Object.assign(target, ...sources)
        -

        ```code
        function copy(initalObj){
             var obj = {};
            for ( var i in initalObj) {
                obj[i] = initalObj[i];
            }
            return obj;
        }
        ```
   (2) 实现深拷贝

        - JSON.parse(JSON.stringify(tagert))
            - 此方法会使 object丢失原来的构造函数以及会丢失funtion 类的属性
        - Object.create()
        - 代码实现
        ```code
            function deepClone(obj){
                let result = {}
                function copy(ret,copyObj){
                for(let key in copyObj){
                    if(typeof copyObj[key] !== 'object'){
                        ret[key] = copyObj[key]
                    }else {
                        ret[key] ={};
                        copy(ret[key],copyObj[key])
                    }
                }
                    return ret;
                }
                return copy(result,obj);
            }
        ```









#### number
1. 在不知道浮点数位数时应该怎样判断两个浮点数之和与第三数是否相等（典型题目 0.1+0.2===0.3？）

