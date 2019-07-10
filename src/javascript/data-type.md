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