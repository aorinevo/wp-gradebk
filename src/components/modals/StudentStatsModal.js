import Modal from './Modal';
import StudentLineChart from '../charts/StudentLineChart';

export default function StudentStatsModal( {
	student,
	gbid,
	isStudentView,
	onClose,
} ) {
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
				<button
					type="button"
					className="button"
					onClick={ onClose }
				>
					Close
				</button>
			</div>
		</Modal>
	);
}
