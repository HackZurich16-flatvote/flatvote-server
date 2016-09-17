const startApi = require("./app/rest-api");

const NotificationService = require("./app/notification-service");
const RealEstateService = require("./app/real-estate-service");
const realEstateService = new RealEstateService();
const notificationService = new NotificationService(realEstateService);

startApi(realEstateService);
notificationService.start();