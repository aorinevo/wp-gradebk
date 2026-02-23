import { useState } from '@wordpress/element';
import Modal from './Modal';

export default function DeleteStudentModal( { student, onConfirm, onClose } ) {
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
				<label>
					<input
						type="radio"
						name="delete-option"
						value="gradebook"
						checked={ option === 'gradebook' }
						onChange={ () => setOption( 'gradebook' ) }
					/>
					{ ' ' }
					Remove from this gradebook only
				</label>
				<label>
					<input
						type="radio"
						name="delete-option"
						value="all_gradebooks"
						checked={ option === 'all_gradebooks' }
						onChange={ () => setOption( 'all_gradebooks' ) }
					/>
					{ ' ' }
					Remove from all gradebooks
				</label>
				<label>
					<input
						type="radio"
						name="delete-option"
						value="database"
						checked={ option === 'database' }
						onChange={ () => setOption( 'database' ) }
					/>
					{ ' ' }
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
				<button
					type="button"
					className="button"
					onClick={ onClose }
				>
					Cancel
				</button>
			</div>
		</Modal>
	);
}
