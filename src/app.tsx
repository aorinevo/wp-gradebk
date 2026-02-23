import './api/client';
import { GradebookProvider } from './context/gradebook-context';
import InstructorApp from './components/instructor-app';
import StudentApp from './components/student-app';

export default function App(): JSX.Element {
	const { userRole } = window.anGradebookSettings || {};

	return (
		<GradebookProvider>
			<div className="wrap an-gradebook-app">
				{ userRole === 'instructor' ? (
					<InstructorApp />
				) : (
					<StudentApp />
				) }
			</div>
		</GradebookProvider>
	);
}
