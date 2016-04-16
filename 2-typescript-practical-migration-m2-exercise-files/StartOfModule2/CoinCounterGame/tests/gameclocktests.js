var QUnit = QUnit || null;
if (QUnit) {

    QUnit.module("Timer Tests");

    QUnit.test("Tests run.", function (assert) {
        assert.ok(1 === 1, "Tests are running.");
    });

    QUnit.test("Can create GameClock with no parameters and defaults are as expected", function (assert) {
        var gc = new GameClock();
        assert.ok(!!gc, "expected GameClock variable to be instantiated.");
        assert.strictEqual(gc.secondsRemaining(), 30, "expected default time remaining.");
        assert.strictEqual(gc.isRunning(), false, "expected GameClock to be stopped.");
    });

    QUnit.test("Can create GameClock with time parameter and the time is equal to the time specified", function (assert) {
        var gc = new GameClock(22);
        assert.strictEqual(gc.secondsRemaining(), 22, "expected the seconds remaining to be the same as passed to constructor");
    });

    QUnit.test("Can add time.", function (assert) {
        var gc = new GameClock(103);
        gc.addSeconds(5);
        assert.strictEqual(gc.secondsRemaining(), 108, "expected the seconds to have been added.");
    });

    QUnit.test("Can start and stop.", function (assert) {
        var gc = new GameClock(101);
        gc.start();
        assert.strictEqual(gc.isRunning(), true, "expected the GameClock to be running.");
        gc.stop();
        assert.strictEqual(gc.isRunning(), false, "expected the GameClock to be stopped.");
    });

    QUnit.test("Can start, run, and reset.", function (assert) {
        assert.expect(4);
        var done = assert.async(),
            secondsToRun = 1,
            startSeconds = 75;

        var gc = new GameClock(startSeconds);
        gc.start();

        setTimeout(function () {
            var secRemaining = gc.secondsRemaining();

            assert.ok((secRemaining == (startSeconds - secondsToRun) ||
                    secRemaining == (startSeconds - secondsToRun - 1))
                , "expected " + secondsToRun + " or " + (secondsToRun + 1) + " seconds to have run off the GameClock.");
            assert.strictEqual(gc.isRunning(), true, "expected GameClock to still be running.");

            gc.reset();

            assert.strictEqual(gc.secondsRemaining(), startSeconds, "expected reset to set seconds remaining to initial value.");
            assert.strictEqual(gc.isRunning(), false, "expected GameClock to stopped after reset.");

            done();
        }, 500 + (secondsToRun * 1000));

    });

    QUnit.test("Can elapse.", function (assert) {
        assert.expect(3);
        var done = assert.async(),
            msToWait = 1500,
            startSeconds = 1,
            callback = function () {
                assert.ok(true, "expected this callback to be executed when GameClock elapsed.");
            };

        var gc = new GameClock(startSeconds,callback);
        gc.start();

        setTimeout(function () {
            assert.strictEqual(gc.secondsRemaining(), 0, "expected exactly zero seconds remaining.");

            assert.strictEqual(gc.isRunning(), false, "expected GameClock to have stopped itself.");

            done();
        }, msToWait);
    });

}