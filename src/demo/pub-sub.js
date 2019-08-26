const Pubsub = function () {
    this.handles = {};
}
Pubsub.prototype = {
    on: function (type, handle) {
        if (!this.handles[type]) {
            this.handles[type] = [];
        }
        this.handles[type].push(handle)
    },
    emit: function () {
        let type = Array.prototype.shift.call(arguments);
        if (!this.handles[type]) {
            throw new Error('无观察者')
        }
        for (let i = 0; i < this.handles[type].length; i++) {
            let handle = this.handles[type][i];
            handle.apply(this, arguments)
        }
    },
    off: function (type, handle) {
        handles = this.handles[type];
        if (handles) {
            if (!handle) {
                handles.length = 0;//清空数组
            } else {
                for (var i = 0; i < handles.length; i++) {
                    var _handle = handles[i];
                    if (_handle === handle) {
                        handles.splice(i, 1);
                    }
                }
            }
        }

    }
}
var p1 = new Pubsub();
p1.on('mm', function (name) {
    console.log('mm: ' + name);
});
p1.emit('mm', '哈哈哈哈');
console.log('===============');
var p2 = new Pubsub();
var fn = function (name) {
    console.log('mm2: ' + name);
};
var fn2 = function (name) {
    console.log('mm222: ' + name);
};
p2.on('mm2', fn);
p2.on('mm2', fn2);
p2.emit('mm2', '121231');
console.log('-------------');
p2.off('mm2', fn);
p2.emit('mm2', '121231');
console.log('-------------');
p2.off('mm2');
p2.emit('mm2', '121231');
console.log('-------------');