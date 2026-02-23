import Modal from './modal';
import StudentLineChart from '../charts/student-line-chart';
import { Student } from '../../types/models';

interface StudentStatsModalProps {
	student: Student;
	gbid: number;
	isStudentView: boolean;
	onClose: () => void;
}

export default function StudentStatsModal( {
	student,
	gbid,
	isStudentView,
	onClose,
}: StudentStatsModalProps ) {
	return (
		<Modal
			title={ `Stats: ${ student.firstname } ${ student.lastname }` }
			onClose={ onClose }
		>
			<StudentLineChart
				uid={ student.id }
				gbid={ gbid }
				isStudentView={ isStudentView }
			/>
			<div className="an-gb-modal-actions">
				<button type="button" className="button" onClick={ onClose }>
					Close
				</button>
			</div>
		</Modal>
	);
}
