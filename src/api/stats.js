import apiFetch from './client';

export function fetchPieChart( amid ) {
	return apiFetch( {
		path: `/an-gradebook/v1/stats/assignment/${ amid }`,
	} );
}

export function fetchLineChart( uid, gbid ) {
	return apiFetch( {
		path: `/an-gradebook/v1/stats/student?uid=${ uid }&gbid=${ gbid }`,
	} );
}

export function fetchStudentLineChart( gbid ) {
	return apiFetch( {
		path: `/an-gradebook/v1/stats/student/me?gbid=${ gbid }`,
	} );
}
