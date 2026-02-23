import apiFetch from './client';

export function createAssignment( data ) {
	return apiFetch( {
		path: '/an-gradebook/v1/assignments',
		method: 'POST',
		data,
	} );
}

export function updateAssignment( id, data ) {
	return apiFetch( {
		path: `/an-gradebook/v1/assignments/${ id }`,
		method: 'PUT',
		data,
	} );
}

export function deleteAssignment( id ) {
	return apiFetch( {
		path: `/an-gradebook/v1/assignments/${ id }`,
		method: 'DELETE',
	} );
}
