/*global Promise:true*/
var Promise = require('bluebird');

var workQueue = {
    queue: [],
    drain: function () {
        this.queue.forEach(function (fn) {
            fn();
        });
        this.queue = [];
    }
};

var scheduler = Promise.setScheduler(function (fn) {
    workQueue.queue.push(fn);
    scheduler(function () {
        workQueue.drain();
    });
});


var _notifyUnhandledRejection = Promise.prototype._notifyUnhandledRejection;
Promise.prototype._notifyUnhandledRejection = function () {
    var that = this;
    var args = arguments;
    scheduler(function () {
        _notifyUnhandledRejection.apply(that, args);
    });
};

module.exports = workQueue;
