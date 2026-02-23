import Modal from './Modal';
import AssignmentPieChart from '../charts/AssignmentPieChart';

export default function AssignmentStatsModal( { assignment, onClose } ) {
	return (
		<Modal
			title={ `Stats: ${ assignment.assign_name }` }
			onClose={ onClose }
		>
			<AssignmentPieChart amid={ assignment.id } />
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
