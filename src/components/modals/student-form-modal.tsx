import type React from 'react';
import { useState } from '@wordpress/element';
import Modal from './modal';
import { Student } from '../../types/models';

interface StudentFormDataNew {
	firstname: string;
	lastname: string;
}

interface StudentFormDataExisting {
	existing_user_login: string;
}

type StudentFormData = StudentFormDataNew | StudentFormDataExisting;

interface StudentFormModalProps {
	student?: Student;
	onSave: ( data: StudentFormData ) => void;
	onClose: () => void;
}

export default function StudentFormModal( {
	student,
	onSave,
	onClose,
}: StudentFormModalProps ) {
	const isEdit = !! student;
	const [ mode, setMode ] = useState( 'new' ); // 'new' or 'existing'
	const [ firstname, setFirstname ] = useState( student?.firstname || '' );
	const [ lastname, setLastname ] = useState( student?.lastname || '' );
	const [ existingLogin, setExistingLogin ] = useState( '' );

	function handleSubmit( e: React.FormEvent< HTMLFormElement > ) {
		e.preventDefault();
		if ( isEdit ) {
			onSave( { firstname, lastname } );
		} else if ( mode === 'existing' ) {
			onSave( { existing_user_login: existingLogin } );
		} else {
			onSave( { firstname, lastname } );
		}
	}

	return (
		<Modal
			title={ isEdit ? 'Edit Student' : 'Add Student' }
			onClose={ onClose }
		>
			<form onSubmit={ handleSubmit }>
				{ ! isEdit && (
					<div className="an-gb-radio-group">
						<label htmlFor="an-gb-mode-new">
							<input
								id="an-gb-mode-new"
								type="radio"
								name="student-mode"
								value="new"
								checked={ mode === 'new' }
								onChange={ () => setMode( 'new' ) }
							/>{ ' ' }
							Create new user
						</label>
						<label htmlFor="an-gb-mode-existing">
							<input
								id="an-gb-mode-existing"
								type="radio"
								name="student-mode"
								value="existing"
								checked={ mode === 'existing' }
								onChange={ () => setMode( 'existing' ) }
							/>{ ' ' }
							Enroll existing user
						</label>
					</div>
				) }

				{ ( isEdit || mode === 'new' ) && (
					<table className="form-table">
						<tbody>
							<tr>
								<th scope="row">
									<label htmlFor="an-gb-student-first">
										First Name
									</label>
								</th>
								<td>
									<input
										id="an-gb-student-first"
										type="text"
										className="regular-text"
										value={ firstname }
										onChange={ ( e ) =>
											setFirstname( e.target.value )
										}
										required
									/>
								</td>
							</tr>
							<tr>
								<th scope="row">
									<label htmlFor="an-gb-student-last">
										Last Name
									</label>
								</th>
								<td>
									<input
										id="an-gb-student-last"
										type="text"
										className="regular-text"
										value={ lastname }
										onChange={ ( e ) =>
											setLastname( e.target.value )
										}
										required
									/>
								</td>
							</tr>
						</tbody>
					</table>
				) }

				{ ! isEdit && mode === 'existing' && (
					<table className="form-table">
						<tbody>
							<tr>
								<th scope="row">
									<label htmlFor="an-gb-student-login">
										Username
									</label>
								</th>
								<td>
									<input
										id="an-gb-student-login"
										type="text"
										className="regular-text"
										value={ existingLogin }
										onChange={ ( e ) =>
											setExistingLogin( e.target.value )
										}
										required
									/>
								</td>
							</tr>
						</tbody>
					</table>
				) }

				<div className="an-gb-modal-actions">
					<button type="submit" className="button button-primary">
						{ isEdit ? 'Update' : 'Add' }
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
