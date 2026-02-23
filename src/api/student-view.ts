import apiFetch from './client';
import type { Course, GradebookData } from '../types/models';

export function fetchStudentCourses(): Promise< Course[] > {
	return apiFetch< Course[] >( { path: '/an-gradebook/v1/student/courses' } );
}

export function fetchStudentGradebook(
	courseId: number
): Promise< GradebookData > {
	return apiFetch< GradebookData >( {
		path: `/an-gradebook/v1/student/courses/${ courseId }/gradebook`,
	} );
}
