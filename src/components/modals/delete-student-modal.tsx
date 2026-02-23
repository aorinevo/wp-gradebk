import { useState } from '@wordpress/element';
import Modal from './modal';
import { Student } from '../../types/models';

interface DeleteStudentModalProps {
	student: Student;
	onConfirm: ( option: string ) => void;
	onClose: () => void;
}

export default function DeleteStudentModal( {
	student,
	onConfirm,
	onClose,
}: DeleteStudentModalProps ) {
	const [ option, setOption ] = useState( 'gradebook' );

	return (
		<Modal title="Delete Student" onClose={ onClose }>
			<p>
				Remove{ ' ' }
				<strong>
					{ student.firstname } { student.lastname }
				</strong>
				:
			</p>
			<div className="an-gb-radio-group">
				<label htmlFor="an-gb-delete-gradebook">
					<input
						id="an-gb-delete-gradebook"
						type="radio"
						name="delete-option"
						value="gradebook"
						checked={ option === 'gradebook' }
						onChange={ () => setOption( 'gradebook' ) }
					/>{ ' ' }
					Remove from this gradebook only
				</label>
				<label htmlFor="an-gb-delete-all">
					<input
						id="an-gb-delete-all"
						type="radio"
						name="delete-option"
						value="all_gradebooks"
						checked={ option === 'all_gradebooks' }
						onChange={ () => setOption( 'all_gradebooks' ) }
					/>{ ' ' }
					Remove from all gradebooks
				</label>
				<label htmlFor="an-gb-delete-database">
					<input
						id="an-gb-delete-database"
						type="radio"
						name="delete-option"
						value="database"
						checked={ option === 'database' }
						onChange={ () => setOption( 'database' ) }
					/>{ ' ' }
					Delete user from database entirely
				</label>
			</div>
			<div className="an-gb-modal-actions">
				<button
					type="button"
					className="button button-primary an-gb-text-danger"
					onClick={ () => onConfirm( option ) }
				>
					Delete
				</button>
				<button type="button" className="button" onClick={ onClose }>
					Cancel
				</button>
			</div>
		</Modal>
	);
}
