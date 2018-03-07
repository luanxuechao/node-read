# The Node.js Event Loop, Timers, and process.nextTick()
## 原文
  - [地址](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
## 什么是事件循环
  事件循环是让Node.js能够实现非阻塞I/O的核心，尽管javascript是单线程，尽可能的操作作系统内核。

  现在大多数系统内核是多线程的，它们可以在后台实现多线程操作。当其中一个线程完成时，系统内核通知Node.js以便于它的callback函数加入到poll队列里去执行。我们将在本主题后面进一步详细解释这个知识点。

## 事件循环的解释
  当Node.js启动时，它就初始化了事件循环，进程提供加载的脚本(或者文档中没有涉及到的REPL),它们也许是异步API的回调、计划定时器或者`process.nextTick()`,然后开始处理事件循环。

  下图显示了事件循环的操作顺序以及概述
  ```code
     ┌───────────────────────┐
┌> │        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<─────┤  connections, │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
     └───────────────────────┘

```
  备注：每个块都代表着事件循环的一个阶段。

  每个阶段都有一个FIFO(先进先出)的回调队列被执行。每个阶段都有它自己的特殊之处，通常情况下，当事件循环进入一个阶段时，它将执行特定于该阶段的任何操作，然后在该阶段的队列中执行回调，直到队列被耗尽或者执行了最大数量的回调。当队列被耗尽或者回调数量达到最大值，事件循环将进入下一个阶段，重复循环上述操作。

  因为这些操作中任何一个都可能调用更多的操作和新的事件在poll阶段按顺序被内核处理。轮询事件可以在轮询事件正在处理时排队。结果显示，长时间运行回调可以使poll阶段的运行事件比timer的阈值长的多。在`timers` 和 `poll`章节有更详细的描述。

 *备注： Windows与Unix/Linux实现存在细微的差异,但并不影响这个演示。最重要的部分在这里。实际上有七八个步骤，但我们关心的和node.js实际使用的 - 就是上述那些部分。*

## 阶段概述

- __timers：__ 这个阶段执行由`setTimeout()`和`setInterval()`生成计划的回调
- __I/O callbacks:__ 执行除了关闭回调、定时计划回调和`setImmediate()`之外的几乎所有的回调
- __idle,prepare:__ 只用于内部
- __poll:__ 检索新的I/O事件；有时会在此节点阻塞
- __check:__ 在这里调用`setimmediate()`的回调
- __close callbacks__ 例如`socket.on('close', ...)`

在每个事件循环中,node.js都会检查它是否在存在等待的任何异步I/O或定时器，并在没有任何异步I/O或定时器时关闭。

## 阶段详情
### timer
一个计时器指定了阈值之后就可以提供一个可以执行的回调，而不是人们希望的在某个时间确切时间去执行。定时器回调将在指定的时间过后，按计划运行;但是，操作系统调度或其他回调的运行可能会延迟它们。

 *__备注:__ 技术上,`poll`阶段可以控制计时器什么时候被执行。*

 例如，你计划了一个阈值为100ms的计时器，但是你的脚本异步开始读取需要95ms的文件:
```code
const fs = require('fs');

function someAsyncOperation(callback) {
  // Assume this takes 95ms to complete
  fs.readFile('/path/to/file', callback);
}

const timeoutScheduled = Date.now();

setTimeout(() => {
  const delay = Date.now() - timeoutScheduled;

  console.log(`${delay}ms have passed since I was scheduled`);
}, 100);


// do someAsyncOperation which takes 95 ms to complete
someAsyncOperation(() => {
  const startCallback = Date.now();

  // do something that will take 10ms...
  while (Date.now() - startCallback < 10) {
    // do nothing
  }
});

```
 当事件循环进入`poll`阶段，它是一个空队列(`fs.readFile()`还没有完成)，因此它会等待剩下的时间(ms数)，直到达到最快的定时器阈值。当它等待95ms之后。`fs.readFile()`完成了读取文件，并且其需要10ms完成回调被添加到**poll**队列里并执行。当回调完成之后，队列中不再有回调，所以事件循环会看到已经有达到最快阈值的计时器，然后回到`timer`阶段以执行计时器的回调。在这个例子中，你会发现计划的定时器和它正在执行的回调之间的总延迟将是105ms。

备注：为了防止`poll`阶段在事件循环中为空，`libuv`在停止轮询更多事件之前，它也有一个硬性最大值（系统相关)。

## I/O callbacks
此阶段为某些系统操作（如tcp错误类型）执行回调。例如，如果一个tcp套接字在尝试连接时收到了`econnrefused`，一些*nix系统想要等待报告该错误。这将排队在I/O回调阶段执行。

## poll

__poll__ 阶段有两个主要功能：
- 为阈值已过的定时器执行脚本
- 处理__poll__队列中的事件



当事件循环进入__poll__阶段并且没有定时器计划时，会发生以下两件事之一：
- 如果`poll`队列不为空，事件循环将遍历其同步执行它们的回调队列，直到队列耗尽或达到系统相关硬件限制
- 如果`poll`队列不为空，会发生以下两件事之一：
  - 如果脚本已由`setimmediate()`计划，事件循环将结束`poll`阶段并继续执行`check`阶段以执行这些预定脚本
  - 如果脚本尚未由`setimmediate()`计划，则事件循环将等待将回调添加到队列中，然后立即执行它们。

一旦`poll`队列为空时，事件循环就会检查已达到阈值的定时器。如果有一个或者多个定时器准备好了，事件循环将回到`timer`阶段以执行这些定时器的回调。

## check
这个阶段允许一个可以在`poll`阶段结束后立即执行的回调。如果`poll`阶段变得空闲并且脚本已经用`setimmediate()`排队。事件循环可以进入`check`阶段而不是等待。
`setImmediate()`事件上是一个在事件循环的单独阶段运行的特殊定时器，它使用libuv API来调用回调以便于在`poll`阶段完成之后执行。

通常，随着代码的执行，事件循环将最终进入`poll`阶段，在那里它将等待传入连接、请求等。然而，如果有一个是有`setimmediate()`调用产生的回调并且`poll`队列是空闲的，`poll`阶段将会结束，并且进入`check`阶段而不是继续等待进入`poll`队列的事件。

## close callbacks
如果一个socket 或者一个处理突然关闭（例如`socket.destroy()`）, 它的`close`事件会在这个阶段广播，除此之外还会通过`process.nextTick()`广播。

## `setImmediate()` VS `setTimeout()`

`setImmediate`和`setTimeout()` 是类似的，但取决于何时被调用，其行为方式不同。
- `setImmediate` 被设计成在当前`poll`阶段完成后被执行。
- `setTimeout()` 计划脚本以毫秒为单位运行最小阈值后运行。

与定时器的执行顺序将根据调用的上下文而有所变化。如果两者都在主模块内被调用，那么执行时机将受到流程表现的约束（这可能会受到机器上运行的其他应用程序的影响）。

例如，如果我们运行不在I/O周期内的以下脚本（即主模块），则执行两个定时器的顺序是非确定性的，因为它受流程执行的约束。
```code
// timeout_vs_immediate.js
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});
```
```code
$ node timeout_vs_immediate.js
timeout
immediate

$ node timeout_vs_immediate.js
immediate
timeout

```
但是，如果在一个I/O周期内移动这两个调用，则`immediate`回调总是首先执行
```code
// timeout_vs_immediate.js
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  setImmediate(() => {
    console.log('immediate');
  });
});
```
```code
$ node timeout_vs_immediate.js
immediate
timeout

$ node timeout_vs_immediate.js
immediate
timeout
```

使用`setimemediate()`超过`settimeout()`的主要优点是`setimmediate()`将始终在任何定时器之前执行（如果在I / O周期内进行调度），而不管有多少个定时器。

## `process.nextTick()`
### 理解 `process.nextTick()`
你可能已经注意到`process.nexttick()`未显示在图中，即使它是异步API的一部分。这是因为`process.nexttick（)`并不是事件循环的一部分。相反，`nextTickQueue`将在当前操作完成后处理，而不管事件循环的当前到哪个阶段了。

回头看我们的图，任何时候，在给定阶段调用`process.nextTick()`时，传递给`process.nextTick()`的所有回调将在事件循环继续之前解析,这可能会造成一些不好的情况，因为它允许你通过递归process.nexttick（）调用来"streve"你的I/O,这可以防止事件循环到达轮询阶段。

### 为什么`process.nextTick()`会被允许
为什么像这样的方法被包含在node.js中？它的一部分是一个设计理念，即api应该始终是异步的，即使它不是必须的，以此代码片段为例：
```code
function apiCall(arg, callback) {
  if (typeof arg !== 'string')
    return process.nextTick(callback,
                            new TypeError('argument should be string'));
}
```
该代码段会进行参数检查，如果不正确，它会将错误传递给回调函数。最近更新的api允许将参数传递给`process.nexttick()`，允许它在回调之后传递的任何参数作为参数传播给回调函数，因此您不必嵌套函数。

我们正在做的是向用户传递一个错误，但是只有在我们允许剩下的用户代码执行之后。通过使用`process.nexttick()`，我们保证`apicall()`总是在用户代码的其余部分之后并且允许继续进行事件循环之前运行其回调。为了达到这个目的，js调用堆栈被允许展开，然后立即执行提供的回调，允许人对`process.nexttick（）`进行递归调用而不会达到`RangeError`：最大调用堆栈大小超过了v8。

这种理念会导致一些潜在的问题。以此片段为例：
```code
let bar;

// this has an asynchronous signature, but calls callback synchronously
function someAsyncApiCall(callback) { callback(); }

// the callback is called before `someAsyncApiCall` completes.
someAsyncApiCall(() => {
  // since someAsyncApiCall has completed, bar hasn't been assigned any value
  console.log('bar', bar); // undefined
});

bar = 1;
```
这是另一个真实存在的例子：
```code
const server = net.createServer(() => {}).listen(8080);

server.on('listening', () => {});
```
当只有端口被监听时，这个端口应该被立即映射。因此`listening`的回调应该立即被执行，但是这个时候`.on('listening')`的回调函数还没有生成。
为了解决这个问题,`listening`事件被排在`nextTick()`队列中去执行脚本。这允许用户设置他们想要的任何事件处理程序。
## `process.nextTick()` VS `setImmediate()`
对于用户而言，他们两是两个极其类似的调用，但是他们的名字不是一样的。
- `process.nextTick()`会在在该阶段立即执行
- `setImmediate()` 触发以下迭代或事件循环的发生。


本质上，他们的名字应该交换。`process.nextTick()` 会比`setImmediate()`更快的发生，但这是不可能改变的。如果改变，会破坏npm上许多包。每天都有新的模块生成，这意味着我们每天都在等待，发生更多潜在的破坏。当他们混淆时，名字本身不会改变。
我们建议开发人员在所有情况下都使用`setimmediate()`，因为它更容易理解。（它会让代码与更广泛的环境（如浏览器js）兼容）

## 为什么会使用`process.nextTick()`
有以下两点主要原因：
- 允许用户处理错误，清理任何不需要的资源，或者可能在事件循环继续之前再次尝试请求
- 有时有必要在调用堆栈解除之后但事件循环继续之前允许回调运行

一个例子是匹配用户的期望。简单的例子：
```code
const server = net.createServer();
server.on('connection', (conn) => { });

server.listen(8080);
server.on('listening', () => { });
```
比如说`listen()`函数在事件循环开始时运行，但是它的回调是放在`setImmediate()`中。除了主机名被传递外，会立即映射到端口。为了继续进行事件循环，它必须进入`poll`阶段，这个意味着没有任何连接事件会发生在监听事件之前。

另一个例子是运行一个函数构造函数，它可以继承eventemitter，并且它想在构造函数中调用一个事件：
```code
const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this);
  this.emit('event');
}
util.inherits(MyEmitter, EventEmitter);

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```
您不能立即从构造函数广播事件，因为脚本不会处理到用户为该事件分配回调的位置。因此，在构造函数本身中，可以使用`process.nexttick()`来设置回调，以在构造函数完成后广播事件，该函数提供预期结果:
```code
const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this);

  // use nextTick to emit the event once a handler is assigned
  process.nextTick(() => {
    this.emit('event');
  });
}
util.inherits(MyEmitter, EventEmitter);

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```
