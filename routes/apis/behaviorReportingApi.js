import { executeQuery } from "../../database/database.js";
import { validate, required, isNumeric,minNumber,maxNumber,numberBetween } from "../../deps.js";

const eveningData = {
    studyDuration : null,
    exerciseDuration: null,
    regularity: null,
    genericMood: null,
    errors: []
};

const eveningValidationRules = {
    studyDuration: [required, isNumeric, minNumber(0.00)],
    exerciseDuration: [required, isNumeric, minNumber(0.00)],
    regularity: [required, isNumeric, minNumber(1), maxNumber(5)],
    genericMood: [required, isNumeric, minNumber(1), maxNumber(5)]
};

const eveningReportSubmission = async({request, response, session, render}) => {
	eveningData.errors = null;
	const body = request.body();
  	const document = await body.value;
    const date = document.get('date');
    const studyDuration = document.get('studyDuration')
    eveningData.studyDuration = Number(studyDuration)
    const exerciseDuration = document.get('exerciseDuration')
    eveningData.exerciseDuration = Number(exerciseDuration)
    const regularity = document.get('regularity')
    eveningData.regularity = Number(regularity)
    const genericMood = document.get('genericMood')
    eveningData.genericMood = Number(genericMood)
    console.log(eveningData)
    const [passes, errors] = await validate(eveningData, eveningValidationRules);
    eveningData.errors = errors
    console.log(passes, errors)
    if(passes) {
		const user = await session.get('user');
	 	const user_id = user.id
	 	const existingReport = await executeQuery("SELECT * FROM report WHERE user_id = $1 and date= $2 and reportType =2", user_id, date);
	  	if (existingReport.rowCount > 0) {
		    await executeQuery("UPDATE report SET studyDuration =$1, exerciseDuration= $2, regularity = $3, genericMood = $4 WHERE user_id = $5 and date = $6 and reportType =2",  studyDuration, exerciseDuration, regularity, genericMood, user_id, date);
		    response.status = 200;
		    response.redirect('/behavior/reportSelection')
	  	}else {
	  		await executeQuery("INSERT INTO report (date, studyDuration, exerciseDuration, regularity, genericMood, user_id, reportType) VALUES ($1, $2, $3, $4, $5, $6, 2);", date, studyDuration, exerciseDuration, regularity, genericMood, user_id);
	    	response.status = 200;
	    	response.redirect('/behavior/reportSelection')
	  	}
    } else {
	  	render('eveningReportForm.ejs', {...eveningData,authenticated: await session.get('authenticated')})
	 }
    
    
}

const morningData = {
    sleepDuration : null,
    sleepQuality: null,
    genericMood: null,
    errors: []
};

const morningValidationRules = {
    sleepDuration: [required, isNumeric, minNumber(0.00)],
    sleepQuality: [required, isNumeric, minNumber(1), maxNumber(5)],
    genericMood: [required, isNumeric, minNumber(1), maxNumber(5)]
};

const morningReportSubmission = async({request, response, session, render}) => {
	morningData.errors = null;
    const body = request.body();
    const document = await body.value;
    const date = document.get('date');
    const sleepDuration = document.get('sleepDuration')
    morningData.sleepDuration = Number(sleepDuration)
    const sleepQuality = document.get('sleepQuality')
    morningData.sleepQuality = Number(sleepQuality)
    const genericMood = document.get('genericMood')
    morningData.genericMood = Number(genericMood)
    console.log(morningData)
    const [passes, errors] = await validate(morningData, morningValidationRules);
    morningData.errors = errors
    console.log(passes, errors)
    if (passes) {
    	const user = await session.get('user');
	 	const user_id = user.id
	 	const existingReport = await executeQuery("SELECT * FROM report WHERE reportType = 1 and user_id = $1 and date= $2", user_id, date);
	  	if (existingReport.rowCount > 0) {
		    await executeQuery("UPDATE report SET sleepDuration =$1, sleepQuality= $2, genericMood = $3 WHERE user_id = $4 and date = $5 and reportType = 1",  sleepDuration, sleepQuality, genericMood, user_id, date);
		    response.status = 200;
		    response.redirect('/behavior/reportSelection')
	  	}else {
		  	await executeQuery("INSERT INTO report (date, sleepDuration, sleepQuality, genericMood, user_id, reportType) VALUES ($1, $2, $3, $4, $5, 1);", date, sleepDuration, sleepQuality, genericMood, user_id);
		    response.status = 200;
		    response.redirect('/behavior/reportSelection')
	  	}
	  } else {
	  	render('morningReportForm.ejs', {...morningData, authenticated: await session.get('authenticated')})
	  }
        
};

const summaryOfLastWeek = async({response}) => {
	const avgRes = await executeQuery("SELECT avg(sleepDuration) as sleepAvg, avg(sleepQuality) as sleepQualityAvg,avg(studyDuration) as studyAvg, avg(exerciseDuration) as exerciseAvg, avg(genericMood) as moodAvg FROM report WHERE date > current_date - 7 ")
	response.body = avgRes.rowsOfObjects()[0];
}

const summaryOfGivenDate = async({response, params}) => {
	console.log(params);
	const year = params.year;
	const month = params.month;
	const day = params.day;
	const avgRes = await executeQuery("SELECT avg(sleepDuration) as sleepAvg, avg(sleepQuality) as sleepQualityAvg,avg(studyDuration) as studyAvg, avg(exerciseDuration) as exerciseAvg, avg(genericMood) as moodAvg FROM report WHERE ( select extract('year' from date)) = $1 and ( select extract('month' from date)) = $2 and  ( select extract('day' from date)) = $3", year, month, day)
	response.body = avgRes.rowsOfObjects()[0];
}

export {morningReportSubmission, eveningReportSubmission, summaryOfLastWeek, summaryOfGivenDate}