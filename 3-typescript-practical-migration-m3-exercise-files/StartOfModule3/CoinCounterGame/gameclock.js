var GameClock = function (initialTimeInSeconds, callbackOnClockElapsed) {
    "use strict";
    var self = this;
    var _initialTimeInSeconds = initialTimeInSeconds || 30;
    var _callbackOnClockElapsed = callbackOnClockElapsed;
    var intervalHandle;
    self.start = function () {
        if (!self.isRunning()) {
            self.isRunning(true);
            intervalHandle = setInterval(_tick, 1000);
        }
    };
    self.isRunning = ko.observable(false);
    self.secondsRemaining = ko.observable(_initialTimeInSeconds);
    self.timeRemainingFormatted = ko.computed(function () {
        var date = new Date(null);
        date.setSeconds(self.secondsRemaining());
        var result = date.toISOString().substr(14, 5);
        return result.replace(/^0+/, '');
    });
    var _tick = function () {
        if (self.isRunning()) {
            self.secondsRemaining(self.secondsRemaining() - 1);
            if (self.secondsRemaining() <= 0) {
                self.stop();
                self.secondsRemaining(0);
                if (_callbackOnClockElapsed && typeof _callbackOnClockElapsed === "function") {
                    _callbackOnClockElapsed();
                }
            }
        }
    };
    self.stop = function () {
        self.isRunning(false);
        clearInterval(intervalHandle);
    };
    self.reset = function () {
        self.stop();
        self.secondsRemaining(_initialTimeInSeconds);
    };
    self.addSeconds = function (numberOfSeconds) {
        this.secondsRemaining(this.secondsRemaining() + numberOfSeconds);
    };
};
//# sourceMappingURL=gameclock.js.map