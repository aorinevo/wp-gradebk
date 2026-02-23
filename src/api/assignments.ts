import apiFetch from './client';
import type { Assignment, Cell } from '../types/models';

export function createAssignment(
	data: Omit< Assignment, 'id' >
): Promise< { assignmentDetails: Assignment; assignmentStudents: Cell[] } > {
	return apiFetch< {
		assignmentDetails: Assignment;
		assignmentStudents: Cell[];
	} >( {
		path: '/an-gradebook/v1/assignments',
		method: 'POST',
		data,
	} );
}

export function updateAssignment(
	id: number,
	data: Partial< Assignment >
): Promise< Assignment > {
	return apiFetch< Assignment >( {
		path: `/an-gradebook/v1/assignments/${ id }`,
		method: 'PUT',
		data,
	} );
}

export function deleteAssignment(
	id: number
): Promise< { deleted: boolean } > {
	return apiFetch< { deleted: boolean } >( {
		path: `/an-gradebook/v1/assignments/${ id }`,
		method: 'DELETE',
	} );
}
