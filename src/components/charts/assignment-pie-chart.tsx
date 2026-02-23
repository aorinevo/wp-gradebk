import { useState, useEffect, useMemo } from '@wordpress/element';
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';
import { fetchPieChart } from '../../api/stats';

interface AssignmentPieChartProps {
	amid: number;
}

const COLORS = [ '#4caf50', '#2196f3', '#ff9800', '#ff5722', '#9e9e9e' ];
const LABELS = [ 'A', 'B', 'C', 'D', 'F' ];

export default function AssignmentPieChart( {
	amid,
}: AssignmentPieChartProps ) {
	const [ rawData, setRawData ] = useState< number[] | null >( null );
	const [ loading, setLoading ] = useState< boolean >( true );

	useEffect( () => {
		let cancelled = false;
		setLoading( true );

		async function load() {
			try {
				const result = await fetchPieChart( amid );
				if ( ! cancelled ) {
					setRawData( result.grades );
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
	}, [ amid ] );

	const chartData = useMemo( () => {
		if ( ! rawData ) {
			return [];
		}
		return rawData.map( ( value, i ) => ( {
			name: LABELS[ i ],
			value,
		} ) );
	}, [ rawData ] );

	if ( loading ) {
		return <p>Loading chart&hellip;</p>;
	}

	const total = chartData.reduce( ( sum, d ) => sum + d.value, 0 );
	if ( total === 0 ) {
		return <p>No grade data available.</p>;
	}

	return (
		<ResponsiveContainer width="100%" height={ 300 }>
			<PieChart>
				<Pie
					data={ chartData }
					dataKey="value"
					nameKey="name"
					cx="50%"
					cy="50%"
					outerRadius={ 100 }
					label={ ( { name, percent } ) =>
						`${ name } (${ ( percent * 100 ).toFixed( 0 ) }%)`
					}
				>
					{ chartData.map( ( entry, index ) => (
						<Cell
							key={ entry.name }
							fill={ COLORS[ index % COLORS.length ] }
						/>
					) ) }
				</Pie>
				<Tooltip />
				<Legend />
			</PieChart>
		</ResponsiveContainer>
	);
}
