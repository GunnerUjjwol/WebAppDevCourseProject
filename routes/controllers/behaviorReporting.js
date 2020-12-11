import { executeQuery } from "../../database/database.js";
const landingPage = async ({session,render}) => {
	const authenticated = await session.get('authenticated');
	const authenticatedUser = await session.get('user')
	const resmoodToday = await executeQuery("SELECT avg(genericMood) as moodAvgToday FROM report WHERE date= current_date");
	const resmoodYesterday = await executeQuery("SELECT avg(genericMood) as moodAvgYesterday FROM report WHERE date= current_date -1");
	const moodToday = resmoodToday.rowsOfObjects()[0].moodavgtoday;
	const moodYesterday = resmoodYesterday.rowsOfObjects()[0].moodavgyesterday;
	let moodComparision;
	if(moodToday && moodYesterday){
		if(moodToday >= moodYesterday) {
			moodComparision = "things are looking bright today"
		}else {
			moodComparision = "things are looking gloomy today"
		}
	}
	render('landingPage.ejs', {moodToday, moodYesterday, moodComparision, authenticated, authenticatedUser})
}

const reportSelection = async({render,request,session}) => {
	const authenticatedUser = await session.get('user')
	const body = request.body();
  	const params = await body.value;
	const reportType = params.get('reportType');
  	console.log(reportType);
  	const morningData = {
	    sleepDuration : null,
	    sleepQuality: null,
	    genericMood: null,
	    errors: []
	};
	const eveningData = {
	    studyDuration : null,
	    exerciseDuration: null,
	    regularity: null,
	    genericMood: null,
	    errors: []
	};
  	if(reportType === 'morningReport'){
  		render('morningReportForm.ejs', {...morningData, authenticated: await session.get('authenticated'), authenticatedUser})
  	}else if(reportType === 'eveningReport') {
  		render('eveningReportForm.ejs', {...eveningData, authenticated: await session.get('authenticated'), authenticatedUser})
  	}	
}

	let week ;
	let month ;
	let weekNo;
	let monthNo;
const summaryReport = async({render, request, session}) => {
	const authenticatedUser = await session.get('user')
	const user = await session.get('user');
 	const user_id = user.id
	
	if(request.method === 'GET'){
		const resWeek = await executeQuery ("select (extract('week' from current_date ) -1) as lastweek");
		const resMonth = await executeQuery ("select (extract('month' from current_date ) -1) as lastmonth");
		week = resWeek.rowsOfObjects()[0].lastweek;
		month = resMonth.rowsOfObjects()[0].lastmonth;
	} else {
		const body = request.body();
		const params = await body.value;
		if(params.get('week')){
			weekNo = params.get('week');
			console.log(weekNo);
			week = Number(weekNo.substring(6))
			console.log(week);
		} else if (params.get('month')){
			monthNo = params.get('month');
			console.log(monthNo);
			month = Number(monthNo.substring(5))
			console.log(month);
		}
		
	}
	
 	const dataForTheWeek =  await executeQuery("SELECT * from report where ( select extract('week' from date)) = $1  and user_id = $2", week, user_id);
 	let weekAvg;
 	if(dataForTheWeek.rowsOfObjects().length === 0) {
 		weekAvg = null;
 	}else {
 		const weekResult = await executeQuery("SELECT avg(sleepDuration) as sleepAvg, avg(sleepQuality) as sleepQualityAvg,avg(studyDuration) as studyAvg, avg(exerciseDuration) as exerciseAvg, avg(genericMood) as moodAvg FROM report WHERE ( select extract('week' from date)) = $1 and user_id= $2",week, user_id)
		weekAvg = weekResult.rowsOfObjects()[0]
		
 	}
 	console.log("Week Avg :", weekAvg)
	const dataForTheMonth =  await executeQuery("SELECT * from report where ( select extract('month' from date)) = $1 and user_id = $2", month, user_id);
 	let monthAvg;
 	if(dataForTheMonth.rowsOfObjects().length === 0) {
 		monthAvg = null;
 	}else {
 		const monthResult = await executeQuery("SELECT avg(sleepDuration) as sleepAvg, avg(sleepQuality) as sleepQualityAvg,avg(studyDuration) as studyAvg, avg(exerciseDuration) as exerciseAvg, avg(genericMood) as moodAvg FROM report WHERE ( select extract('month' from date)) = $1 and user_id= $2",month, user_id)
		monthAvg = monthResult.rowsOfObjects()[0]
		
 	}
	console.log("Month Avg :",monthAvg)
	render('summaryReport.ejs', {weekAvg: weekAvg, monthAvg: monthAvg, weekNo: weekNo, monthNo: monthNo, authenticated: await session.get('authenticated'), authenticatedUser})
}

const reportSelectionForm = async({render,session})=> {
	const authenticatedUser = await session.get('user')
	const user = await session.get('user');
 	const user_id = user.id
	const resMor = await executeQuery("SELECT * from report where user_id =$1 and reportType = 1 and date = current_date", user_id)
	let morningReport;
	if(resMor.rowsOfObjects().length === 0){
		morningReport = 'Not Done';
	}else {
		morningReport = 'Done';
	}
	const resEve = await executeQuery("SELECT * from report where user_id =$1 and reportType = 2 and date = current_date", user_id)
	let eveningReport;
	if(resEve.rowsOfObjects().length === 0){
		eveningReport = 'Not Done';
	}else {
		eveningReport = 'Done';
	}
	render('reportingForm.ejs', {eveningReport,morningReport, authenticated: await session.get('authenticated'), authenticatedUser})
}


export {reportSelectionForm, landingPage, reportSelection, summaryReport}