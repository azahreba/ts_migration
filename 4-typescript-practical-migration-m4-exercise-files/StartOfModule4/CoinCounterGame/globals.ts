module CoinCounter {
    "use strict";

    export type ClassFunction = any;

    export function spacesToUnderscore(inputString: string) {
        return inputString.replace(/ /g, '_');
    }
}