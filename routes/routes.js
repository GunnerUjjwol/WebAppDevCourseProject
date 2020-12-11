import { Router } from "../deps.js";
import * as userController from "./controllers/userController.js";
import * as behaviorReportingController from "./controllers/behaviorReporting.js";
import * as behaviorReportingApi from "./apis/behaviorReportingApi.js";
import * as userApi from "./apis/userApi.js";

const router = new Router();

router.get('/', behaviorReportingController.landingPage)

router.get('/auth/register', userController.registrationForm)
router.post('/auth/register', userApi.register)

router.get('/auth/login', userController.loginForm)
router.post('/auth/login', userApi.authenticate)
router.get('/auth/logout', userApi.logout)

router.post('/behavior/reporting', behaviorReportingController.reportSelection)
router.get('/behavior/reporting', behaviorReportingController.reportSelectionForm)
router.post('/behavior/reporting/morning', behaviorReportingApi.morningReportSubmission)
router.post('/behavior/reporting/evening', behaviorReportingApi.eveningReportSubmission)
router.get('/behavior/summary', behaviorReportingController.summaryReport)
router.post('/behavior/summary', behaviorReportingController.summaryReport)
router.get('/api/summary', behaviorReportingApi.summaryOfLastWeek)
router.get('/api/summary/:year/:month/:day', behaviorReportingApi.summaryOfGivenDate)


export { router };