module CoinCounter {
    "use strict";

    interface HighScoreItem {
        score: number;
        name: string;
    }

    export class CoinCounterViewModel {
        public handleGameClockElapsed = () => {
            var highScoreIndex = this.tryPushHighScore({ name: this.playerName(), score: this.score() });
            var message = "Your score was " + this.score() + ".";
            if (highScoreIndex === 0) {
                message += "<br />That's the high score!";
            }
            else if (highScoreIndex !== -1) {
                message += "<br />That's good for #" + (highScoreIndex + 1) + " on the high score list!";
            }
            this.endOfGameMessage(message);
            $("#gameOverModal").modal('show');
        };
        public highScoreList = ko.observableArray(app.starterHighScoreList);
        public tryPushHighScore = (theScore: HighScoreItem) => {
            var hsl = this.highScoreList();
            if (theScore.score === 0) {
                return -1;
            }
            if (!theScore.name) {
                theScore.name = "No name";
            }
            if (hsl.length === 0) {
                this.highScoreList.push(theScore);
                return 0;
            }
            for (var i = 0; i < this.highScoreList().length; i += 1) {
                if (hsl[i].score < theScore.score) {
                    hsl.splice(i, 0, theScore);
                    if (hsl.length > app.maxHighScoreItems) {
                        hsl.length = app.maxHighScoreItems;
                    }
                    this.highScoreList(hsl);
                    return i;
                }
            }
            return -1;
        };
        public gameClock = new GameClock(app.gameLengthInSeconds, this.handleGameClockElapsed);
        public pauseGame = () => {
            this.gameClock.stop();
        };
        public resumeGame = () => {
            this.gameClock.start();
        };
        public statusMessage = ko.observable("");
        public statusMessageVisible = ko.observable(false);
        public isPaused = ko.computed(() => {
            return !this.gameClock.isRunning() && this.gameClock.secondsRemaining() > 0 && !this.statusMessageVisible();
        });
        public canBePaused = ko.computed(() => {
            return this.gameClock.isRunning() && this.gameClock.secondsRemaining() > 0 && !this.statusMessageVisible();
        });
        public playerName = ko.observable("");
        public playerNameQuestion = ko.observable("");
        public coins = coins;
        public app = app;
        public score = ko.observable(0);
        public scoreText = ko.computed(() => {
            return this.playerName() === "" ?
                "Score: " + this.score() :
                this.playerName() + "'s score: " + this.score();
        });
        public imageElementName = function (coinName: string, zeroBasedIndex: number) {
            return "img" + spacesToUnderscore(coinName) + String(zeroBasedIndex);
        };
        public buttonsEnabled = ko.computed(() => {
            return !this.isPaused() && this.gameClock.isRunning();
        });
        public addCoin = (coin: Coin) => {
            if (coin.count() === coin.max()) {
                return;
            }
            var oldCoinCount = coin.count();
            coin.count(coin.count() + 1);
            var newCoin = document.createElement("img");
            newCoin.src = app.imagePath + "/" + coin.imgSrc;
            newCoin.id = this.imageElementName(coin.name, oldCoinCount);
            newCoin.classList.add(coin.style);
            var destinationDiv = document.getElementById(this.destinationDivIDForCoin(coin));
            destinationDiv.appendChild(newCoin);
        };
        public destinationDivIDForCoin = function (coin: Coin) {
            return "draw" + spacesToUnderscore(coin.name);
        };
        public removeCoin = (coin: Coin) => {
            if (coin.count() === 0) {
                return;
            }
            coin.count(coin.count() - 1);
            var coinToRemove = document.getElementById(this.imageElementName(coin.name, coin.count()));
            coinToRemove.parentNode.removeChild(coinToRemove);
        };
        public goalAmount = ko.observable(null);
        public whatTheUserShouldBeDoing = () => {
            if (this && this.goalAmount) {
                var ga = this.goalAmount();
                if (ga !== null && ga.toFixed) {
                    return "Try to make " + ga.times(100).toString() + " cent" +
                        (ga.eq(Big("0.01")) ? "" : "s") + ".";
                }
            }
            return "";
        };
        public calculateTotal = () => {
            var total = Big(0);
            this.coins.forEach(function (coin: Coin) {
                total = total.plus(coin.value.times(coin.count()));
            });
            return total;
        };
        public checkForVictory = () => {
            var message: string;
            if (this.calculateTotal().eq(this.goalAmount())) {
                this.gameClock.stop();
                this.score(this.score() + app.pointsForCorrect);
                var coinsUsed = 0, bonusSeconds = 0;
                for (var i = 0; i < coins.length; i += 1) {
                    if (coins[i].count() > 0) {
                        coinsUsed += 1;
                    }
                }
                bonusSeconds = coinsUsed * app.bonusSecondsForCorrectPerCoin;
                this.gameClock.addSeconds(bonusSeconds);
                message = "Correct!<br />+" + app.pointsForCorrect + " points, +" + bonusSeconds + " sec for coins used.";
                this.showStatusMessage(message, app.msTimeoutAfterCorrect,() => {
                    $("#splash").removeClass("correct");
                    this.startNewGame();
                });
                $("#splash").addClass("correct");
            } else {
                this.score(this.score() - app.pointsForIncorrect);
                message = "Incorrect.<br />-" + app.pointsForIncorrect + " points.";
                this.showStatusMessage(message, app.msTimeoutAfterIncorrect,() => {
                    $("#splash").removeClass("flyIn");
                });
                $("#splash").addClass("flyIn");
            }
        };
        public startNewGame = () => {
            this.clearStatusMessage();
            this.clearCoins();
            var goalAmount = Math.floor((Math.random() * 100) + 1) / 100;
            this.goalAmount(Big(goalAmount.toFixed(2)));
            this.gameClock.start();
        };
        public startBrandNewGame = () => {
            this.visiblePage("game");
            this.playerNameQuestion("Enter player name:");
            $('#gameOverModal').modal('hide');
            $('#nameModal').modal('show');
        };
        public showStatusMessage = (message: string, timeout: number, callback: (viewModel: CoinCounterViewModel) => void) => {
            this.statusMessage(message);
            this.statusMessageVisible(true);
            setTimeout(() => {
                this.clearStatusMessage();
                if (callback) {
                    callback(this);
                }
            }, timeout);
        };
        public clearStatusMessage = () => {
            this.statusMessage("");
            this.statusMessageVisible(false);
        };
        public clearCoins = function () {
            for (var coinIndex = 0; coinIndex < coins.length; coinIndex += 1) {
                var coin = coins[coinIndex];
                coin.count(0);
                var div = document.getElementById("draw" + spacesToUnderscore(coin.name));
                while (div && div.lastChild) {
                    div.removeChild(div.lastChild);
                }
            }
        };
        public endOfGameVisible = ko.observable(false);
        public endOfGameMessage = ko.observable("");
        public visiblePage = ko.observable("game");
        public gameVisible = ko.computed(() => {
            return this.visiblePage() === "game";
        });
        public highScoreVisible = ko.computed(() => {
            return this.visiblePage() === "highscore";
        });
        public aboutVisible = ko.computed(() => {
            return this.visiblePage() === "about";
        });
        public setGameVisible = () => {
            if (this.visiblePage() === "game") {
                this.startBrandNewGame();
            }
            this.visiblePage("game");
        };
        public setAboutPageVisible = () => {
            this.pauseGame();
            this.visiblePage("about");
        };
        public setHighScoreVisible = () => {
            this.pauseGame();
            this.visiblePage("highscore");
        };
        public newGameButtonClass = ko.computed(() => {
            if (this.gameVisible()) {
                return "active";
            }
            return "";
        });
        public aboutButtonClass = ko.computed(() => {
            if (this.aboutVisible()) {
                return "active";
            }
            return "";
        });
        public unitTestsButtonClick = () => {
            if (!this.isPaused()) {
                this.pauseGame();
            }
            var response = confirm("Do you want to run the unit tests?\nThis will cancel any current game and forget your high scores.");
            if (response) {
                window.location.href = "tests/tests.html";
            }
        };
        public newGameButtonText = ko.computed(() => {
            if (this.visiblePage() !== "game") {
                return "Game";
            }
            return "New Game";
        });
        public addCoinEnabled(coin: Coin) {
            return this.buttonsEnabled() && coin.canAddMore();
        }
        public removeCoinEnabled(coin: Coin) {
            return this.buttonsEnabled && coin.canTakeAway();
        }
        public initialize = () => {

            $('#nameModal')
                .on('shown.bs.modal', function () {
                setTimeout(function () {
                    $("#playerNameInput").focus();
                }, 100);
            })
                .on('hidden.bs.modal',() => {
                this.startNewGame();
                this.score(0);
                this.gameClock.reset();
                this.gameClock.start();
            });
            $('#playerNameInput').bind('keypress', function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    $('#playerNameOK').trigger('click');
                }
            });
            this.startBrandNewGame();
        };
    };

}