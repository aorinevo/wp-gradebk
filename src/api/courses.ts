import apiFetch from './client';
import type { Course } from '../types/models';

export function fetchCourses(): Promise< Course[] > {
	return apiFetch< Course[] >( { path: '/an-gradebook/v1/courses' } );
}

export function createCourse( data: Omit< Course, 'id' > ): Promise< Course > {
	return apiFetch< Course >( {
		path: '/an-gradebook/v1/courses',
		method: 'POST',
		data,
	} );
}

export function updateCourse(
	id: number,
	data: Partial< Course >
): Promise< Course > {
	return apiFetch< Course >( {
		path: `/an-gradebook/v1/courses/${ id }`,
		method: 'PUT',
		data,
	} );
}

export function deleteCourse( id: number ): Promise< { deleted: boolean } > {
	return apiFetch< { deleted: boolean } >( {
		path: `/an-gradebook/v1/courses/${ id }`,
		method: 'DELETE',
	} );
}

export function exportCSV( id: number ): void {
	const restUrl =
		window.anGradebookSettings?.restUrl || '/wp-json/an-gradebook/v1/';
	const url = `${ restUrl }courses/${ id }/export`;
	window.open( url, '_blank' );
}
