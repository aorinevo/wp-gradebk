import Modal from './modal';

interface ConfirmModalProps {
	title: string;
	message: string;
	onConfirm: () => void;
	onClose: () => void;
}

export default function ConfirmModal( {
	title,
	message,
	onConfirm,
	onClose,
}: ConfirmModalProps ) {
	return (
		<Modal title={ title } onClose={ onClose }>
			<p>{ message }</p>
			<div className="an-gb-modal-actions">
				<button
					type="button"
					className="button button-primary"
					onClick={ onConfirm }
				>
					Confirm
				</button>
				<button type="button" className="button" onClick={ onClose }>
					Cancel
				</button>
			</div>
		</Modal>
	);
}
