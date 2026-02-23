import apiFetch from './client';
import type { Cell } from '../types/models';

export function updateCell(
	data: Pick< Cell, 'uid' | 'gbid' | 'amid' | 'assign_points_earned' >
): Promise< Cell > {
	return apiFetch< Cell >( {
		path: '/an-gradebook/v1/cells',
		method: 'PUT',
		data,
	} );
}
