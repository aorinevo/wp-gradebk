import { useState } from '@wordpress/element';
import StudentCourseList from './student-course-list/student-course-list';
import StudentGradebook from './student-gradebook/student-gradebook';

export default function StudentApp(): JSX.Element {
	const [ selectedCourseId, setSelectedCourseId ] = useState< number | null >(
		null
	);

	return (
		<div className="an-gb-student">
			<StudentCourseList
				onSelect={ ( id ) =>
					setSelectedCourseId( selectedCourseId === id ? null : id )
				}
				selectedCourseId={ selectedCourseId }
			/>
			{ selectedCourseId && (
				<div className="an-gb-gradebook-area">
					<StudentGradebook courseId={ selectedCourseId } />
				</div>
			) }
		</div>
	);
}
