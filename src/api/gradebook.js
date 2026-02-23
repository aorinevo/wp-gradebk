import apiFetch from './client';

export function fetchGradebook( courseId ) {
	return apiFetch( {
		path: `/an-gradebook/v1/courses/${ courseId }/gradebook`,
	} );
}
