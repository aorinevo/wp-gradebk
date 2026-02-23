import apiFetch from './client';

export function fetchCourses() {
	return apiFetch( { path: '/an-gradebook/v1/courses' } );
}

export function createCourse( data ) {
	return apiFetch( {
		path: '/an-gradebook/v1/courses',
		method: 'POST',
		data,
	} );
}

export function updateCourse( id, data ) {
	return apiFetch( {
		path: `/an-gradebook/v1/courses/${ id }`,
		method: 'PUT',
		data,
	} );
}

export function deleteCourse( id ) {
	return apiFetch( {
		path: `/an-gradebook/v1/courses/${ id }`,
		method: 'DELETE',
	} );
}

export function exportCSV( id ) {
	const restUrl = window.anGradebookSettings?.restUrl || '/wp-json/an-gradebook/v1/';
	const url = `${ restUrl }courses/${ id }/export`;
	window.open( url, '_blank' );
}
