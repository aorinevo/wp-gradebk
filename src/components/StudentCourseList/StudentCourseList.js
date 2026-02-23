import { useState, useEffect } from '@wordpress/element';
import { fetchStudentCourses } from '../../api/studentApi';
import StudentCourseRow from './StudentCourseRow';

export default function StudentCourseList( { onSelect, selectedCourseId } ) {
	const [ courses, setCourses ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		async function load() {
			try {
				const data = await fetchStudentCourses();
				setCourses( data );
			} catch ( err ) {
				setError( err.message );
			} finally {
				setLoading( false );
			}
		}
		load();
	}, [] );

	if ( loading ) {
		return <p>Loading courses&hellip;</p>;
	}

	if ( error ) {
		return (
			<div className="notice notice-error">
				<p>{ error }</p>
			</div>
		);
	}

	if ( courses.length === 0 ) {
		return <p>You are not enrolled in any courses.</p>;
	}

	return (
		<div className="an-gb-course-list">
			<h2>My Courses</h2>
			<table className="widefat striped">
				<thead>
					<tr>
						<th>Name</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					{ courses.map( ( course ) => (
						<StudentCourseRow
							key={ course.id }
							course={ course }
							isSelected={ selectedCourseId === course.id }
							onSelect={ onSelect }
						/>
					) ) }
				</tbody>
			</table>
		</div>
	);
}
