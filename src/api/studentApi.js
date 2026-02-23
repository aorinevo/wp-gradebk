import apiFetch from './client';

export function fetchStudentCourses() {
	return apiFetch( { path: '/an-gradebook/v1/student/courses' } );
}

export function fetchStudentGradebook( courseId ) {
	return apiFetch( {
		path: `/an-gradebook/v1/student/courses/${ courseId }/gradebook`,
	} );
}
