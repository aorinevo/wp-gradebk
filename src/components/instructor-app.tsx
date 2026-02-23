import { useGradebook } from '../context/gradebook-context';
import CourseList from './course-list/course-list';
import GradebookTable from './gradebook-table/gradebook-table';

export default function InstructorApp(): JSX.Element {
	const { state } = useGradebook();

	return (
		<div className="an-gb-instructor">
			<CourseList />
			{ state.selectedCourseId && (
				<div className="an-gb-gradebook-area">
					<GradebookTable courseId={ state.selectedCourseId } />
				</div>
			) }
		</div>
	);
}
