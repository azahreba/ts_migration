var CoinCounter;
(function (CoinCounter) {
    "use strict";
    var Coin = (function () {
        function Coin(name, style, value, max) {
            var _this = this;
            if (max === void 0) { max = 10; }
            this.name = name;
            this.style = style;
            this.value = value;
            this.imgSrc = this.style + ".png";
            this.count = ko.observable(0);
            this.max = ko.observable(max);
            this.canTakeAway = ko.computed(function () {
                return _this.count() > 0;
            });
            this.canAddMore = ko.computed(function () {
                return _this.count() < _this.max();
            });
        }
        return Coin;
    })();
    CoinCounter.Coin = Coin;
    CoinCounter.coins = [
        new Coin("Penny", "penny", Big('0.01')),
        new Coin("Nickel", "nickel", Big('0.05')),
        new Coin("Dime", "dime", Big('0.10')),
        new Coin("Quarter", "quarter", Big('0.25'), 4)
    ];
})(CoinCounter || (CoinCounter = {}));
//# sourceMappingURL=coins.js.map