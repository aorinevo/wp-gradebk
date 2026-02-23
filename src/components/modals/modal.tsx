import type React from 'react';
import { useEffect, useRef, createPortal } from '@wordpress/element';

interface ModalProps {
	title: string;
	children: React.ReactNode;
	onClose: () => void;
}

export default function Modal( { title, children, onClose }: ModalProps ) {
	const overlayRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		function handleKey( e: KeyboardEvent ) {
			if ( e.key === 'Escape' ) {
				onClose();
			}
		}
		document.addEventListener( 'keydown', handleKey );
		return () => document.removeEventListener( 'keydown', handleKey );
	}, [ onClose ] );

	function handleOverlayClick( e: React.MouseEvent< HTMLDivElement > ) {
		if ( e.target === overlayRef.current ) {
			onClose();
		}
	}

	return createPortal(
		<div
			className="an-gb-modal-overlay"
			ref={ overlayRef }
			role="presentation"
			onClick={ handleOverlayClick }
			onKeyDown={ ( e ) => {
				if ( e.key === 'Escape' ) {
					onClose();
				}
			} }
		>
			<div className="an-gb-modal">
				<div className="an-gb-modal-header">
					<h2>{ title }</h2>
					<button
						type="button"
						className="an-gb-modal-close"
						onClick={ onClose }
					>
						&times;
					</button>
				</div>
				<div className="an-gb-modal-body">{ children }</div>
			</div>
		</div>,
		document.body
	);
}
