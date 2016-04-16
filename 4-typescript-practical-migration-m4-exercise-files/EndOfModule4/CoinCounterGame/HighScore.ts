module CoinCounter {
    "use strict";

    export interface HighScoreItem {
        score: number;
        name: string;
    }

    export class HighScoreList {
        private starterHighScoreList: HighScoreItem[] = [
            { name: "Alice", score: 29 },
            { name: "Bob", score: 19 },
            { name: "Charlie", score: 9 }
        ]

        public List = ko.observableArray(this.starterHighScoreList);

        public tryPushHighScore = (theScore: HighScoreItem) => {
            var hsl = this.List();
            if (theScore.score === 0) {
                return -1;
            }
            if (!theScore.name) {
                theScore.name = "No name";
            }
            if (hsl.length === 0) {
                this.List.push(theScore);
                return 0;
            }
            for (var i = 0; i < this.List().length; i += 1) {
                if (hsl[i].score < theScore.score) {
                    hsl.splice(i, 0, theScore);
                    if (hsl.length > app.maxHighScoreItems) {
                        hsl.length = app.maxHighScoreItems;
                    }
                    this.List(hsl);
                    return i;
                }
            }
            return -1;
        };
    }
} 