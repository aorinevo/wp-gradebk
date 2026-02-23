import type React from 'react';
import { useState } from '@wordpress/element';
import Modal from './modal';
import { Assignment } from '../../types/models';

interface AssignmentFormData {
	assign_name: string;
	assign_date: string;
	assign_due: string;
	assign_category: string;
	assignVisibilityOptions: string;
	assign_order?: number;
}

interface AssignmentFormModalProps {
	assignment?: Assignment;
	onSave: ( data: AssignmentFormData ) => void;
	onClose: () => void;
}

export default function AssignmentFormModal( {
	assignment,
	onSave,
	onClose,
}: AssignmentFormModalProps ) {
	const isEdit = !! assignment;
	const [ assignName, setAssignName ] = useState(
		assignment?.assign_name || ''
	);
	const [ assignDate, setAssignDate ] = useState(
		assignment?.assign_date || ''
	);
	const [ assignDue, setAssignDue ] = useState(
		assignment?.assign_due || ''
	);
	const [ assignCategory, setAssignCategory ] = useState(
		assignment?.assign_category || ''
	);
	const [ assignVisibility, setAssignVisibility ] = useState(
		assignment?.assign_visibility || 'Instructor'
	);

	function handleSubmit( e: React.FormEvent< HTMLFormElement > ) {
		e.preventDefault();
		if ( ! assignName.trim() ) {
			return;
		}
		onSave( {
			assign_name: assignName.trim(),
			assign_date: assignDate,
			assign_due: assignDue,
			assign_category: assignCategory.trim(),
			assignVisibilityOptions: assignVisibility,
			...( isEdit ? { assign_order: assignment.assign_order } : {} ),
		} );
	}

	return (
		<Modal
			title={ isEdit ? 'Edit Assignment' : 'Add Assignment' }
			onClose={ onClose }
		>
			<form onSubmit={ handleSubmit }>
				<table className="form-table">
					<tbody>
						<tr>
							<th scope="row">
								<label htmlFor="an-gb-assign-name">Name</label>
							</th>
							<td>
								<input
									id="an-gb-assign-name"
									type="text"
									className="regular-text"
									value={ assignName }
									onChange={ ( e ) =>
										setAssignName( e.target.value )
									}
									required
								/>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="an-gb-assign-date">Date</label>
							</th>
							<td>
								<input
									id="an-gb-assign-date"
									type="date"
									value={ assignDate }
									onChange={ ( e ) =>
										setAssignDate( e.target.value )
									}
								/>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="an-gb-assign-due">
									Due Date
								</label>
							</th>
							<td>
								<input
									id="an-gb-assign-due"
									type="date"
									value={ assignDue }
									onChange={ ( e ) =>
										setAssignDue( e.target.value )
									}
								/>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="an-gb-assign-cat">
									Category
								</label>
							</th>
							<td>
								<input
									id="an-gb-assign-cat"
									type="text"
									className="regular-text"
									value={ assignCategory }
									onChange={ ( e ) =>
										setAssignCategory( e.target.value )
									}
								/>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="an-gb-assign-vis">
									Visibility
								</label>
							</th>
							<td>
								<select
									id="an-gb-assign-vis"
									value={ assignVisibility }
									onChange={ ( e ) =>
										setAssignVisibility( e.target.value )
									}
								>
									<option value="Instructor">
										Instructor Only
									</option>
									<option value="Students">Students</option>
								</select>
							</td>
						</tr>
					</tbody>
				</table>
				<div className="an-gb-modal-actions">
					<button type="submit" className="button button-primary">
						{ isEdit ? 'Update' : 'Create' }
					</button>
					<button
						type="button"
						className="button"
						onClick={ onClose }
					>
						Cancel
					</button>
				</div>
			</form>
		</Modal>
	);
}
