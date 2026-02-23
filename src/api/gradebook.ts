import apiFetch from './client';
import type { GradebookData } from '../types/models';

export function fetchGradebook( courseId: number ): Promise< GradebookData > {
	return apiFetch< GradebookData >( {
		path: `/an-gradebook/v1/courses/${ courseId }/gradebook`,
	} );
}
