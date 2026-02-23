import apiFetch from './client';
import type { Student, Cell } from '../types/models';

export function createStudent(
	data: Omit< Student, 'id' >
): Promise< { student: Student; cells: Cell[] } > {
	return apiFetch< { student: Student; cells: Cell[] } >( {
		path: '/an-gradebook/v1/students',
		method: 'POST',
		data,
	} );
}

export function updateStudent(
	id: number,
	data: Partial< Student >
): Promise< Student > {
	return apiFetch< Student >( {
		path: `/an-gradebook/v1/students/${ id }`,
		method: 'PUT',
		data,
	} );
}

export function deleteStudent(
	id: number,
	gbid: number,
	deleteOptions: string
): Promise< { deleted: boolean } > {
	return apiFetch< { deleted: boolean } >( {
		path: `/an-gradebook/v1/students/${ id }?gbid=${ gbid }&delete_options=${ deleteOptions }`,
		method: 'DELETE',
	} );
}
