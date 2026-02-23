import { useState, useEffect } from '@wordpress/element';
import { fetchStudentCourses } from '../../api/student-view';
import { Course } from '../../types/models';
import StudentCourseRow from './student-course-row';

interface StudentCourseListProps {
	onSelect: ( id: number ) => void;
	selectedCourseId: number | null;
}

export default function StudentCourseList( {
	onSelect,
	selectedCourseId,
}: StudentCourseListProps ) {
	const [ courses, setCourses ] = useState< Course[] >( [] );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState< string | null >( null );

	useEffect( () => {
		async function load() {
			try {
				const data = await fetchStudentCourses();
				setCourses( data );
			} catch ( err ) {
				setError(
					err instanceof Error
						? err.message
						: 'Failed to load courses'
				);
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
						<th>Course</th>
						<th>School</th>
						<th>Semester</th>
						<th>Year</th>
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
