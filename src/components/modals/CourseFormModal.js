import { useState } from '@wordpress/element';
import Modal from './Modal';

export default function CourseFormModal( { course, onSave, onClose } ) {
	const isEdit = !! course;
	const [ name, setName ] = useState( course?.name || '' );
	const [ school, setSchool ] = useState( course?.school || '' );
	const [ semester, setSemester ] = useState( course?.semester || '' );
	const [ year, setYear ] = useState(
		course?.year || new Date().getFullYear()
	);

	function handleSubmit( e ) {
		e.preventDefault();
		if ( ! name.trim() ) {
			return;
		}
		onSave( {
			name: name.trim(),
			school: school.trim(),
			semester: semester.trim(),
			year: parseInt( year, 10 ),
		} );
	}

	return (
		<Modal
			title={ isEdit ? 'Edit Course' : 'Add Course' }
			onClose={ onClose }
		>
			<form onSubmit={ handleSubmit }>
				<table className="form-table">
					<tbody>
						<tr>
							<th scope="row">
								<label htmlFor="an-gb-course-name">
									Course
								</label>
							</th>
							<td>
								<input
									id="an-gb-course-name"
									type="text"
									className="regular-text"
									value={ name }
									onChange={ ( e ) =>
										setName( e.target.value )
									}
									required
								/>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="an-gb-course-school">
									School
								</label>
							</th>
							<td>
								<input
									id="an-gb-course-school"
									type="text"
									className="regular-text"
									value={ school }
									onChange={ ( e ) =>
										setSchool( e.target.value )
									}
								/>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="an-gb-course-semester">
									Semester
								</label>
							</th>
							<td>
								<input
									id="an-gb-course-semester"
									type="text"
									className="regular-text"
									value={ semester }
									onChange={ ( e ) =>
										setSemester( e.target.value )
									}
								/>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label htmlFor="an-gb-course-year">
									Year
								</label>
							</th>
							<td>
								<input
									id="an-gb-course-year"
									type="number"
									className="small-text"
									value={ year }
									onChange={ ( e ) =>
										setYear( e.target.value )
									}
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<div className="an-gb-modal-actions">
					<button
						type="submit"
						className="button button-primary"
					>
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
