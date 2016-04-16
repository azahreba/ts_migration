var CoinCounterViewModel = (function () {
    function CoinCounterViewModel() {
        var _this = this;
        this.handleGameClockElapsed = function () {
            var highScoreIndex = _this.tryPushHighScore({ name: _this.playerName(), score: _this.score() });
            var message = "Your score was " + _this.score() + ".";
            if (highScoreIndex === 0) {
                message += "<br />That's the high score!";
            }
            else if (highScoreIndex !== -1) {
                message += "<br />That's good for #" + (highScoreIndex + 1) + " on the high score list!";
            }
            _this.endOfGameMessage(message);
            $("#gameOverModal").modal('show');
        };
        this.highScoreList = ko.observableArray(app.starterHighScoreList);
        this.tryPushHighScore = function (theScore) {
            var hsl = _this.highScoreList();
            if (theScore.score === 0) {
                return -1;
            }
            if (!theScore.name) {
                theScore.name = "No name";
            }
            if (hsl.length === 0) {
                _this.highScoreList.push(theScore);
                return 0;
            }
            for (var i = 0; i < _this.highScoreList().length; i += 1) {
                if (hsl[i].score < theScore.score) {
                    hsl.splice(i, 0, theScore);
                    if (hsl.length > app.maxHighScoreItems) {
                        hsl.length = app.maxHighScoreItems;
                    }
                    _this.highScoreList(hsl);
                    return i;
                }
            }
            return -1;
        };
        this.gameClock = new GameClock(app.gameLengthInSeconds, this.handleGameClockElapsed);
        this.pauseGame = function () {
            _this.gameClock.stop();
        };
        this.resumeGame = function () {
            _this.gameClock.start();
        };
        this.statusMessage = ko.observable("");
        this.statusMessageVisible = ko.observable(false);
        this.isPaused = ko.computed(function () {
            return !_this.gameClock.isRunning() && _this.gameClock.secondsRemaining() > 0 && !_this.statusMessageVisible();
        });
        this.canBePaused = ko.computed(function () {
            return _this.gameClock.isRunning() && _this.gameClock.secondsRemaining() > 0 && !_this.statusMessageVisible();
        });
        this.playerName = ko.observable("");
        this.playerNameQuestion = ko.observable("");
        this.coins = coins;
        this.app = app;
        this.score = ko.observable(0);
        this.scoreText = ko.computed(function () {
            return _this.playerName() === "" ? "Score: " + _this.score() : _this.playerName() + "'s score: " + _this.score();
        });
        this.imageElementName = function (coinName, zeroBasedIndex) {
            return "img" + spacesToUnderscore(coinName) + String(zeroBasedIndex);
        };
        this.buttonsEnabled = ko.computed(function () {
            return !_this.isPaused() && _this.gameClock.isRunning();
        });
        this.addCoin = function (coin) {
            if (coin.count() === coin.max()) {
                return;
            }
            var oldCoinCount = coin.count();
            coin.count(coin.count() + 1);
            var newCoin = document.createElement("img");
            newCoin.src = app.imagePath + "/" + coin.imgSrc;
            newCoin.id = _this.imageElementName(coin.name, oldCoinCount);
            newCoin.classList.add(coin.style);
            var destinationDiv = document.getElementById(_this.destinationDivIDForCoin(coin));
            destinationDiv.appendChild(newCoin);
        };
        this.destinationDivIDForCoin = function (coin) {
            return "draw" + spacesToUnderscore(coin.name);
        };
        this.removeCoin = function (coin) {
            if (coin.count() === 0) {
                return;
            }
            coin.count(coin.count() - 1);
            var coinToRemove = document.getElementById(_this.imageElementName(coin.name, coin.count()));
            coinToRemove.parentNode.removeChild(coinToRemove);
        };
        this.goalAmount = ko.observable(null);
        this.whatTheUserShouldBeDoing = function () {
            if (_this && _this.goalAmount) {
                var ga = _this.goalAmount();
                if (ga !== null && ga.toFixed) {
                    return "Try to make " + ga.times(100).toString() + " cent" + (ga.eq(Big("0.01")) ? "" : "s") + ".";
                }
            }
            return "";
        };
        this.calculateTotal = function () {
            var total = Big(0);
            _this.coins.forEach(function (coin) {
                total = total.plus(coin.value.times(coin.count()));
            });
            return total;
        };
        this.checkForVictory = function () {
            var message;
            if (_this.calculateTotal().eq(_this.goalAmount())) {
                _this.gameClock.stop();
                _this.score(_this.score() + app.pointsForCorrect);
                var coinsUsed = 0, bonusSeconds = 0;
                for (var i = 0; i < coins.length; i += 1) {
                    if (coins[i].count() > 0) {
                        coinsUsed += 1;
                    }
                }
                bonusSeconds = coinsUsed * app.bonusSecondsForCorrectPerCoin;
                _this.gameClock.addSeconds(bonusSeconds);
                message = "Correct!<br />+" + app.pointsForCorrect + " points, +" + bonusSeconds + " sec for coins used.";
                _this.showStatusMessage(message, app.msTimeoutAfterCorrect, function () {
                    $("#splash").removeClass("correct");
                    _this.startNewGame();
                });
                $("#splash").addClass("correct");
            }
            else {
                _this.score(_this.score() - app.pointsForIncorrect);
                message = "Incorrect.<br />-" + app.pointsForIncorrect + " points.";
                _this.showStatusMessage(message, app.msTimeoutAfterIncorrect, function () {
                    $("#splash").removeClass("flyIn");
                });
                $("#splash").addClass("flyIn");
            }
        };
        this.startNewGame = function () {
            _this.clearStatusMessage();
            _this.clearCoins();
            var goalAmount = Math.floor((Math.random() * 100) + 1) / 100;
            _this.goalAmount(Big(goalAmount.toFixed(2)));
            _this.gameClock.start();
        };
        this.startBrandNewGame = function () {
            _this.visiblePage("game");
            _this.playerNameQuestion("Enter player name:");
            $('#gameOverModal').modal('hide');
            $('#nameModal').modal('show');
        };
        this.showStatusMessage = function (message, timeout, callback) {
            _this.statusMessage(message);
            _this.statusMessageVisible(true);
            setTimeout(function () {
                _this.clearStatusMessage();
                if (callback) {
                    callback(_this);
                }
            }, timeout);
        };
        this.clearStatusMessage = function () {
            _this.statusMessage("");
            _this.statusMessageVisible(false);
        };
        this.clearCoins = function () {
            for (var coinIndex = 0; coinIndex < coins.length; coinIndex += 1) {
                var coin = coins[coinIndex];
                coin.count(0);
                var div = document.getElementById("draw" + spacesToUnderscore(coin.name));
                while (div && div.lastChild) {
                    div.removeChild(div.lastChild);
                }
            }
        };
        this.endOfGameVisible = ko.observable(false);
        this.endOfGameMessage = ko.observable("");
        this.visiblePage = ko.observable("game");
        this.gameVisible = ko.computed(function () {
            return _this.visiblePage() === "game";
        });
        this.highScoreVisible = ko.computed(function () {
            return _this.visiblePage() === "highscore";
        });
        this.aboutVisible = ko.computed(function () {
            return _this.visiblePage() === "about";
        });
        this.setGameVisible = function () {
            if (_this.visiblePage() === "game") {
                _this.startBrandNewGame();
            }
            _this.visiblePage("game");
        };
        this.setAboutPageVisible = function () {
            _this.pauseGame();
            _this.visiblePage("about");
        };
        this.setHighScoreVisible = function () {
            _this.pauseGame();
            _this.visiblePage("highscore");
        };
        this.newGameButtonClass = ko.computed(function () {
            if (_this.gameVisible()) {
                return "active";
            }
            return "";
        });
        this.aboutButtonClass = ko.computed(function () {
            if (_this.aboutVisible()) {
                return "active";
            }
            return "";
        });
        this.unitTestsButtonClick = function () {
            if (!_this.isPaused()) {
                _this.pauseGame();
            }
            var response = confirm("Do you want to run the unit tests?\nThis will cancel any current game and forget your high scores.");
            if (response) {
                window.location.href = "tests/tests.html";
            }
        };
        this.newGameButtonText = ko.computed(function () {
            if (_this.visiblePage() !== "game") {
                return "Game";
            }
            return "New Game";
        });
        this.initialize = function () {
            // add computeds to coins (which reference vm)
            (function () {
                for (var i = 0; i < coins.length; i += 1) {
                    (function (coin) {
                        coin.addCoinEnabled = ko.computed(function () {
                            return _this.buttonsEnabled() && (coin.count() < coin.max());
                        });
                        coin.removeCoinEnabled = ko.computed(function () {
                            return _this.buttonsEnabled() && (coin.count() > 0);
                        });
                    })(coins[i]);
                }
            })();
            $('#nameModal').on('shown.bs.modal', function () {
                setTimeout(function () {
                    $("#playerNameInput").focus();
                }, 100);
            }).on('hidden.bs.modal', function () {
                _this.startNewGame();
                _this.score(0);
                _this.gameClock.reset();
                _this.gameClock.start();
            });
            $('#playerNameInput').bind('keypress', function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    $('#playerNameOK').trigger('click');
                }
            });
            _this.startBrandNewGame();
        };
    }
    return CoinCounterViewModel;
})();
;
//# sourceMappingURL=coinCounterViewModel.js.map