import apiFetch from './client';

export interface PieChartData {
	label: string;
	value: number;
}

export interface PieChartResponse {
	grades: number[];
}

export interface LineChartData {
	label: string;
	value: number;
}

export type LineChartRow = [ string, number, number ];

export function fetchPieChart( amid: number ): Promise< PieChartResponse > {
	return apiFetch< PieChartResponse >( {
		path: `/an-gradebook/v1/stats/assignment/${ amid }`,
	} );
}

export function fetchLineChart(
	uid: number,
	gbid: number
): Promise< LineChartRow[] > {
	return apiFetch< LineChartRow[] >( {
		path: `/an-gradebook/v1/stats/student?uid=${ uid }&gbid=${ gbid }`,
	} );
}

export function fetchStudentLineChart(
	gbid: number
): Promise< LineChartRow[] > {
	return apiFetch< LineChartRow[] >( {
		path: `/an-gradebook/v1/stats/student/me?gbid=${ gbid }`,
	} );
}
