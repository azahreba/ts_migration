var CoinCounterViewModel;

CoinCounterViewModel = function () {
    "use strict";
    var self = this;
    self.handleGameClockElapsed = function () {
        var highScoreIndex = self.tryPushHighScore({ name: self.playerName(), score: self.score() });
        var message = "Your score was " + self.score() + ".";
        if (highScoreIndex === 0) {
            message += "<br />That's the high score!";
        }
        else if (highScoreIndex !== -1) {
            message += "<br />That's good for #" + (highScoreIndex + 1) + " on the high score list!";
        }
        self.endOfGameMessage(message);
        $("#gameOverModal").modal('show');
    };
    self.highScoreList = ko.observableArray(app.starterHighScoreList);
    self.tryPushHighScore = function (theScore) {
        var hsl = self.highScoreList();
        if (theScore.score === 0) {
            return -1;
        }
        if (!theScore.name) {
            theScore.name = "No name";
        }
        if (hsl.length === 0) {
            self.highScoreList.push(theScore);
            return 0;
        }
        for (var i = 0; i < self.highScoreList().length; i += 1) {
            if (hsl[i].score < theScore.score) {
                hsl.splice(i, 0, theScore);
                if (hsl.length > app.maxHighScoreItems) {
                    hsl.length = app.maxHighScoreItems;
                }
                self.highScoreList(hsl);
                return i;
            }
        }
        return -1;
    };
    self.gameClock = new GameClock(app.gameLengthInSeconds, self.handleGameClockElapsed);
    self.pauseGame = function () {
        self.gameClock.stop();
    };
    self.resumeGame = function () {
        self.gameClock.start();
    };
    self.statusMessage = ko.observable("");
    self.statusMessageVisible = ko.observable(false);
    self.isPaused = ko.computed(function () {
        return !self.gameClock.isRunning() && self.gameClock.secondsRemaining() > 0 && !self.statusMessageVisible();
    });
    self.canBePaused = ko.computed(function () {
        return self.gameClock.isRunning() && self.gameClock.secondsRemaining() > 0 && !self.statusMessageVisible();
    });
    self.playerName = ko.observable("");
    self.playerNameQuestion = ko.observable("");
    self.coins = coins;
    self.app = app;
    self.score = ko.observable(0);
    self.scoreText = ko.computed(function () {
        return self.playerName() === "" ?
            "Score: " + self.score() :
            self.playerName() + "'s score: " + self.score();
    });
    self.imageElementName = function (coinName, zeroBasedIndex) {
        return "img" + spacesToUnderscore(coinName) + String(zeroBasedIndex);
    };
    self.buttonsEnabled = ko.computed(function () {
        return !self.isPaused() && self.gameClock.isRunning();
    });
    self.addCoin = function (coin) {
        if (coin.count() === coin.max()) {
            return;
        }
        var oldCoinCount = coin.count();
        coin.count(coin.count() + 1);
        var newCoin = document.createElement("img");
        newCoin.src = app.imagePath + "/" + coin.imgSrc;
        newCoin.id = self.imageElementName(coin.name, oldCoinCount);
        newCoin.classList.add(coin.style);
        var destinationDiv = document.getElementById(self.destinationDivIDForCoin(coin));
        destinationDiv.appendChild(newCoin);
    };
    self.destinationDivIDForCoin = function (coin) {
        return "draw" + spacesToUnderscore(coin.name);
    };
    self.removeCoin = function (coin) {
        if (coin.count() === 0) {
            return;
        }
        coin.count(coin.count() - 1);
        var coinToRemove = document.getElementById(self.imageElementName(coin.name, coin.count()));
        coinToRemove.parentNode.removeChild(coinToRemove);
    };
    self.goalAmount = ko.observable(null);
    self.whatTheUserShouldBeDoing = function () {
        if (self && self.goalAmount) {
            var ga = self.goalAmount();
            if (ga !== null && ga.toFixed) {
                return "Try to make " + ga.times(100).toString() + " cent" +
                    (ga.eq(Big("0.01")) ? "" : "s") + ".";
            }
        }
        return "";
    };
    self.calculateTotal = function () {
        var total = Big(0);
        this.coins.forEach(function (coin) {
            total = total.plus(coin.value.times(coin.count()));
        });
        return total;
    };
    self.checkForVictory = function () {
        var message;
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
            this.showStatusMessage(message, app.msTimeoutAfterCorrect, function () {
                $("#splash").removeClass("correct");
                self.startNewGame();
            });
            $("#splash").addClass("correct");
        } else {
            this.score(this.score() - app.pointsForIncorrect);
            message = "Incorrect.<br />-" + app.pointsForIncorrect + " points.";
            this.showStatusMessage(message, app.msTimeoutAfterIncorrect, function () {
                $("#splash").removeClass("flyIn");
            });
            $("#splash").addClass("flyIn");
        }
    };
    self.startNewGame = function () {
        self.clearStatusMessage();
        self.clearCoins();
        var goalAmount = Math.floor((Math.random() * 100) + 1) / 100;
        self.goalAmount(Big(goalAmount.toFixed(2)));
        self.gameClock.start();
    };
    self.startBrandNewGame = function () {
        self.visiblePage("game");
        self.playerNameQuestion("Enter player name:");
        $('#gameOverModal').modal('hide');
        $('#nameModal').modal('show');
    };
    self.showStatusMessage = function (message, timeout, callback) {
        this.statusMessage(message);
        this.statusMessageVisible(true);
        var self = this;
        setTimeout(function () {
            self.clearStatusMessage();
            if (callback) {
                callback(self);
            }
        }, timeout);
    };
    self.clearStatusMessage = function () {
        this.statusMessage("");
        this.statusMessageVisible(false);
    };
    self.clearCoins = function () {
        for (var coinIndex = 0 ; coinIndex < coins.length; coinIndex += 1) {
            var coin = coins[coinIndex];
            coin.count(0);
            var div = document.getElementById("draw" + spacesToUnderscore(coin.name));
            while (div && div.lastChild) {
                div.removeChild(div.lastChild);
            }
        }
    };
    self.endOfGameVisible = ko.observable(false);
    self.endOfGameMessage = ko.observable("");
    self.visiblePage = ko.observable("game");
    self.gameVisible = ko.computed(function () {
        return self.visiblePage() === "game";
    });
    self.highScoreVisible = ko.computed(function () {
        return self.visiblePage() === "highscore";
    });
    self.aboutVisible = ko.computed(function () {
        return self.visiblePage() === "about";
    });
    self.setGameVisible = function () {
        if (self.visiblePage() === "game") {
            self.startBrandNewGame();
        }
        self.visiblePage("game");
    };
    self.setAboutPageVisible = function () {
        self.pauseGame();
        self.visiblePage("about");
    };
    self.setHighScoreVisible = function () {
        self.pauseGame();
        self.visiblePage("highscore");
    };
    self.newGameButtonClass = ko.computed(function () {
        if (self.gameVisible()) {
            return "active";
        }
        return "";
    });
    self.aboutButtonClass = ko.computed(function () {
        if (self.aboutVisible()) {
            return "active";
        }
        return "";
    });
    self.unitTestsButtonClick = function () {
        if (!self.isPaused()) {
            self.pauseGame();
        }
        var response = confirm("Do you want to run the unit tests?\nThis will cancel any current game and forget your high scores.");
        if (response) {
            window.location = "tests/tests.html";
        }
    };
    self.newGameButtonText = ko.computed(function () {
        if (self.visiblePage() !== "game") {
            return "Game";
        }
        return "New Game";
    });
    self.initialize = function () {

        // add computeds to coins (which reference vm)
        (function () {
            for (var i = 0; i < coins.length; i += 1) {
                (function (coin) {
                    coin.addCoinEnabled = ko.computed(function () {
                        return self.buttonsEnabled() && (coin.count() < coin.max());
                    });
                    coin.removeCoinEnabled = ko.computed(function () {
                        return self.buttonsEnabled() && (coin.count() > 0);
                    });
                })(coins[i]);
            }
        })();

        $('#nameModal')
            .on('shown.bs.modal', function () {
                setTimeout(function () {
                    $("#playerNameInput").focus();
                }, 100);
            })
            .on('hidden.bs.modal', function () {
                self.startNewGame();
                self.score(0);
                self.gameClock.reset();
                self.gameClock.start();
            });
        $('#playerNameInput').bind('keypress', function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                $('#playerNameOK').trigger('click');
            }
        });
        self.startBrandNewGame();
    };
};

function spacesToUnderscore(inputString) {
    return inputString.replace(/ /g, '_');
}

