import { useState } from '@wordpress/element';
import StudentCourseList from './StudentCourseList/StudentCourseList';
import StudentGradebook from './StudentGradebook/StudentGradebook';

export default function StudentApp() {
	const [ selectedCourseId, setSelectedCourseId ] = useState( null );

	return (
		<div className="an-gb-student">
			<StudentCourseList
				onSelect={ ( id ) =>
					setSelectedCourseId(
						selectedCourseId === id ? null : id
					)
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
