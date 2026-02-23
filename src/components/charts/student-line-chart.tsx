import { useState, useEffect, useMemo } from '@wordpress/element';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import {
	fetchLineChart,
	fetchStudentLineChart,
	LineChartRow,
} from '../../api/stats';

interface StudentLineChartProps {
	uid: number;
	gbid: number;
	isStudentView: boolean;
}

export default function StudentLineChart( {
	uid,
	gbid,
	isStudentView,
}: StudentLineChartProps ) {
	const [ rawData, setRawData ] = useState< LineChartRow[] | null >( null );
	const [ loading, setLoading ] = useState< boolean >( true );

	useEffect( () => {
		let cancelled = false;
		setLoading( true );

		async function load() {
			try {
				const result = isStudentView
					? await fetchStudentLineChart( gbid )
					: await fetchLineChart( uid, gbid );
				if ( ! cancelled ) {
					setRawData( result );
				}
			} finally {
				if ( ! cancelled ) {
					setLoading( false );
				}
			}
		}

		load();
		return () => {
			cancelled = true;
		};
	}, [ uid, gbid, isStudentView ] );

	const chartData = useMemo( () => {
		if ( ! rawData || rawData.length <= 1 ) {
			return [];
		}
		// Skip header row: ['Assignment', 'Student Score', 'Class Average']
		return rawData.slice( 1 ).map( ( row ) => ( {
			assignment: row[ 0 ],
			studentScore: row[ 1 ],
			classAverage: row[ 2 ],
		} ) );
	}, [ rawData ] );

	if ( loading ) {
		return <p>Loading chart&hellip;</p>;
	}

	if ( chartData.length === 0 ) {
		return <p>No data available for chart.</p>;
	}

	return (
		<ResponsiveContainer width="100%" height={ 300 }>
			<LineChart data={ chartData }>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="assignment" />
				<YAxis domain={ [ 0, 100 ] } />
				<Tooltip />
				<Legend />
				<Line
					type="monotone"
					dataKey="studentScore"
					name="Student Score"
					stroke="#2196f3"
					strokeWidth={ 2 }
				/>
				<Line
					type="monotone"
					dataKey="classAverage"
					name="Class Average"
					stroke="#ff9800"
					strokeWidth={ 2 }
					strokeDasharray="5 5"
				/>
			</LineChart>
		</ResponsiveContainer>
	);
}
