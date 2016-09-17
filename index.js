const startApi = require("./app/rest-api");

const NotificationService = require("./app/notification-service");
const RealEstateService = require("./app/real-estate-service");

const VoteListener = require("./app/vote-listener");

const realEstateService = new RealEstateService();

startApi(realEstateService);

const notificationService = new NotificationService(realEstateService);
const voteListener = new VoteListener();

voteListener.registerListener(notificationService.sendNotifications, notificationService);
voteListener.registerListener(realEstateService.onVoteAdded, realEstateService);
voteListener.start();