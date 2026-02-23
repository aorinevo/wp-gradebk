import apiFetch from './client';

export function updateCell( data ) {
	return apiFetch( {
		path: '/an-gradebook/v1/cells',
		method: 'PUT',
		data,
	} );
}
