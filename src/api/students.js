import apiFetch from './client';

export function createStudent( data ) {
	return apiFetch( {
		path: '/an-gradebook/v1/students',
		method: 'POST',
		data,
	} );
}

export function updateStudent( id, data ) {
	return apiFetch( {
		path: `/an-gradebook/v1/students/${ id }`,
		method: 'PUT',
		data,
	} );
}

export function deleteStudent( id, gbid, deleteOptions ) {
	return apiFetch( {
		path: `/an-gradebook/v1/students/${ id }?gbid=${ gbid }&delete_options=${ deleteOptions }`,
		method: 'DELETE',
	} );
}
