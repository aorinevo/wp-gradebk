import './api/client';
import { GradebookProvider } from './context/GradebookContext';
import InstructorApp from './components/InstructorApp';
import StudentApp from './components/StudentApp';

export default function App() {
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
