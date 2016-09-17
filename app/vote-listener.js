const db = require("./database");

const ACCESS_KEY = process.env.FIREBASE_NOTIFICATION_ACCESS_KEY;

class VoteListener {

    constructor() {
        this.listeners = [];
    }

    registerListener(callback, context) {
        this.listeners.push(function () {
            callback.apply(context, arguments);
        });
    }

    start() {
        db.ref("votes").on("child_added", this.invokeListeners, function (error) {
            console.error(`Failed to retrieve votes out of reason`, error);
        }, this);
    }

    invokeListeners() {
        for (const listener of this.listeners) {
            listener.apply(undefined, arguments);
        }
    }

    stop() {
        db.ref("votes").off("child_added", this.invokeListeners);
    }
}

module.exports = VoteListener;