import Modal from './modal';
import AssignmentPieChart from '../charts/assignment-pie-chart';
import { Assignment } from '../../types/models';

interface AssignmentStatsModalProps {
	assignment: Assignment;
	onClose: () => void;
}

export default function AssignmentStatsModal( {
	assignment,
	onClose,
}: AssignmentStatsModalProps ) {
	return (
		<Modal
			title={ `Stats: ${ assignment.assign_name }` }
			onClose={ onClose }
		>
			<AssignmentPieChart amid={ assignment.id } />
			<div className="an-gb-modal-actions">
				<button type="button" className="button" onClick={ onClose }>
					Close
				</button>
			</div>
		</Modal>
	);
}
