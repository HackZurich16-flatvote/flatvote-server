const firebase = require("firebase");

// Initialize the app with no authentication
firebase.initializeApp({
    databaseURL: "https://flatvote.firebaseio.com/",
    serviceAccount: "./firebaseServiceAccountCredentials.json"
});

const db = firebase.database();

module.exports = db;