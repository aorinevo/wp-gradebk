import { useGradebook } from '../context/GradebookContext';
import CourseList from './CourseList/CourseList';
import GradebookTable from './GradebookTable/GradebookTable';

export default function InstructorApp() {
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
