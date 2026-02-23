import Modal from './modal';
import { Assignment } from '../../types/models';

interface AssignmentDetailsModalProps {
	assignment: Assignment;
	onClose: () => void;
}

export default function AssignmentDetailsModal( {
	assignment,
	onClose,
}: AssignmentDetailsModalProps ) {
	return (
		<Modal title="Assignment Details" onClose={ onClose }>
			<table className="form-table">
				<tbody>
					<tr>
						<th scope="row">Name</th>
						<td>{ assignment.assign_name }</td>
					</tr>
					<tr>
						<th scope="row">Date</th>
						<td>{ assignment.assign_date || '—' }</td>
					</tr>
					<tr>
						<th scope="row">Due Date</th>
						<td>{ assignment.assign_due || '—' }</td>
					</tr>
					<tr>
						<th scope="row">Category</th>
						<td>{ assignment.assign_category || '—' }</td>
					</tr>
				</tbody>
			</table>
			<div className="an-gb-modal-actions">
				<button type="button" className="button" onClick={ onClose }>
					Close
				</button>
			</div>
		</Modal>
	);
}
