var request = require("request-promise");
var process = require("process");
const db = require("./database");

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

    start() {
        db.ref("votes").on("child_added", this.voteAdded, function (error) {
            console.error(`Failed to retrieve votes out of reason`, error);
        }, this);
    }

    voteAdded(snapshot) {
        const vote = snapshot.val();

        if (vote.invited) {
            return;
        }

        return this.realEstateService.getRealEstate(vote.advertisementId)
            .then(realEstate => this._notifyFriends(vote, realEstate))
            .catch(function (error) {
                console.error("Failed to send notifications out of reason", error);
            });
    };

    _notifyFriends(vote, estate) {
        if (!estate) {
            console.warn(`Suppress notification for ${vote.advertisementId} as the real estate seems to be no longer available`);
            return;
        }

        const friendIdRefs = db.ref(`friends/${vote.uid}`).once("value");
        const friends = friendIdRefs.then(idsRef => {
            const ids = idsRef.val() ? idsRef.val() : [];
            return Promise.all(ids.map(friend => db.ref(`users/${friend}`).once("value")))
        });

        return friends.then(friendRefs => {
            const completed = [];
            for (const friendRef of friendRefs) {
                const friend = friendRef.val();
                if (friend) {
                    console.log(`Send notification to ${friend.notificationId}`);
                    completed.push(this._sendNotification(friend.notificationId, estate, vote.uid));
                }
            }

            return Promise.all(completed).then(() => {
                // snapshot.update({
                //    invited: true
                //});
            });
        });
    }

    _sendNotification(notificationId, estate, userName) {
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
                    text: `The following flat looks promising to ${userName}, what do you think?`
                },
                data: {
                    advertisementId: estate.advertisementId,
                    friendName: userName
                },
                to : notificationId
            }
        }).then(response => {
            if (response.failure > 0) {
                console.error(`Failed to notify device with id ${notificationId} for reason '${response.results[0].error}'`);
            }
        });
    }

    stop() {
        db.ref("votes").off("child_added", this.voteAdded, this);
    }
}

module.exports = NotificationService;