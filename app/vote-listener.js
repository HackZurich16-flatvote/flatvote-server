const db = require("./database");

class VoteListener {

    constructor() {
        this.listeners = [];
        this.changeListeners = [];
    }

    registerListener(callback, context) {
        this.listeners.push(function () {
            callback.apply(context, arguments);
        });
    }

    registerChangeListener(callback, context) {
        this.changeListeners.push(function () {
            callback.apply(context, arguments);
        });
    }

    start() {
        db.ref("votes").on("child_added", this.invokeListeners, function (error) {
            console.error(`Failed to retrieve votes out of reason`, error);
        }, this);

        db.ref("votes").on("child_changed", this.invokeChangeListeners, function (error) {
            console.error(`Failed to retrieve votes out of reason`, error);
        }, this);
    }

    invokeListeners() {
        for (const listener of this.listeners) {
            listener.apply(undefined, arguments);
        }
    }

    invokeChangeListeners() {
        for (const listener of this.changeListeners) {
            listener.apply(undefined, arguments);
        }
    }

    stop() {
        db.ref("votes").off("child_added", this.invokeListeners);
        db.ref("votes").off("child_changed", this.invokeChangeListeners);
    }
}

module.exports = VoteListener;