var request = require("request-promise");
var process = require("process");
var _ = require("lodash");
var db = require("./database");

const ACCESS_KEY = process.env.FIREBASE_NOTIFICATION_ACCESS_KEY;


/**
 * The notification server notifies the friends of a user about liked estates
 * by sending a push notification to their devices
 */
class NotificationService {
    /**
     * Creates a new instance that uses the passed in real estate service
     * @param realEstateService {RealEstateService}
     */
    constructor(realEstateService) {
        this.realEstateService = realEstateService;
    }

    sendNotificationOnChange(snapshot) {
        if (snapshot.val().update) {
            this.sendNotifications(snapshot);
        }
    }

    sendNotifications(snapshot) {
        const vote = snapshot.val();

        const numberOfVotes = _.values(vote.yes).length + _.values(vote.no).length;
        if (vote.votesRequired && numberOfVotes >= vote.votesRequired) {
            return;
        }

        return this.realEstateService.getRealEstate(vote.advertisementId)
            .then(realEstate => this._notifyFriends(snapshot, realEstate, snapshot.key))
            .catch(function (error) {
                console.error("Failed to send notifications out of reason", error);
            });
    };

    _notifyFriends(snapshot, estate, voteKey) {
        const vote = snapshot.val();
        if (!estate) {
            console.warn(`Suppress notification for ${vote.advertisementId} as the real estate seems to be no longer available`);
            return;
        }

        if (_.values(vote.yes).length === 0) {
            // was a no vote of a user, just for training
            return;
        }

        const responders = _.values(vote.yes).concat(_.values(vote.no));
        const friendIdRefs = db.ref(`friends/${responders[0]}`).once("value");
        const friends = friendIdRefs.then(idsRef => {
            const ids = idsRef.val() ? idsRef.val() : [];

            if (!vote.votesRequired) {
                snapshot.ref.update({
                    votesRequired: ids.length + 1
                });
            }

            const pendingIds = _.without(ids, responders);
            return Promise.all(pendingIds.map(friend => db.ref(`users/${friend}`).once("value")))
        });

        return friends.then(friendRefs => {
            const completed = [];
            for (const friendRef of friendRefs) {
                const friend = friendRef.val();
                if (friend) {
                    console.log(`Send notification to ${friend.notificationToken}`);
                    completed.push(this._sendNotification(friend.notificationToken, estate, _.values(vote.yes), voteKey));
                }
            }

            return Promise.all(completed).then(() => completed.length);
        });
    }

    _sendNotification(notificationToken, estate, uids, voteKey) {
        const usernames = _.join(uids, ", ");
        return request.post({
            uri: "https://fcm.googleapis.com/fcm/send",
            json: true,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `key=${ACCESS_KEY}`
            },
            body: {
                notification: {
                    title: estate.title,
                    text: `The following flat looks promising to ${usernames}, what do you think?`
                },
                data: {
                    advertisementId: estate.advertisementId,
                    voteKey
                },
                to: notificationToken
            }
        }).then(response => {
            if (response.failure > 0) {
                console.error(`Failed to notify device with id ${notificationToken} for reason '${response.results[0].error}'`);
            }
        });
    }
}

module.exports = NotificationService;