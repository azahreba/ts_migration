var CoinCounter;
(function (CoinCounter) {
    "use strict";
    var HighScoreList = (function () {
        function HighScoreList() {
            var _this = this;
            this.starterHighScoreList = [
                { name: "Alice", score: 29 },
                { name: "Bob", score: 19 },
                { name: "Charlie", score: 9 }
            ];
            this.List = ko.observableArray(this.starterHighScoreList);
            this.tryPushHighScore = function (theScore) {
                var hsl = _this.List();
                if (theScore.score === 0) {
                    return -1;
                }
                if (!theScore.name) {
                    theScore.name = "No name";
                }
                if (hsl.length === 0) {
                    _this.List.push(theScore);
                    return 0;
                }
                for (var i = 0; i < _this.List().length; i += 1) {
                    if (hsl[i].score < theScore.score) {
                        hsl.splice(i, 0, theScore);
                        if (hsl.length > CoinCounter.app.maxHighScoreItems) {
                            hsl.length = CoinCounter.app.maxHighScoreItems;
                        }
                        _this.List(hsl);
                        return i;
                    }
                }
                return -1;
            };
        }
        return HighScoreList;
    })();
    CoinCounter.HighScoreList = HighScoreList;
})(CoinCounter || (CoinCounter = {}));
//# sourceMappingURL=HighScore.js.map