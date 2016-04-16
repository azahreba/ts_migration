module CoinCounter {
    "use strict";

    export class Coin {
        constructor(public name: string, public style: string, public value: BigJsLibrary.BigJS, max: number = 10) {
            this.imgSrc = this.style + ".png";
            this.count = ko.observable(0);
            this.max = ko.observable(max);
            this.canTakeAway = ko.computed(() => {
                return this.count() > 0;
            });
            this.canAddMore = ko.computed(() => {
                return this.count() < this.max();
            });
        }
        public imgSrc: string;
        public count: KnockoutObservable<number>;
        public max: KnockoutObservable<number>;
        public addCoinEnabled: KnockoutComputed<boolean>;
        public removeCoinEnabled: KnockoutComputed<boolean>;
        public canTakeAway: KnockoutComputed<boolean>;
        public canAddMore: KnockoutComputed<boolean>;

    }

    export var coins = [
        new Coin("Penny", "penny", Big('0.01')),
        new Coin("Nickel", "nickel", Big('0.05')),
        new Coin("Dime", "dime", Big('0.10')),
        new Coin("Quarter", "quarter", Big('0.25'), 4)
    ];


}