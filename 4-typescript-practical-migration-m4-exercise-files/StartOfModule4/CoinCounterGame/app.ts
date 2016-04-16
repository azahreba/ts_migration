module CoinCounter {
    "use strict";

    export var app = {
        imagePath: "/img",
        pointsForCorrect: 10,
        pointsForIncorrect: 5,
        msTimeoutAfterCorrect: 1500,
        msTimeoutAfterIncorrect: 1000,
        gameLengthInSeconds: 20,
        bonusSecondsForCorrectPerCoin: 1,
        maxHighScoreItems: 3,
        starterHighScoreList: [
            { name: "Alice", score: 29 },
            { name: "Bob", score: 19 },
            { name: "Charlie", score: 9 }
        ]
    };
}