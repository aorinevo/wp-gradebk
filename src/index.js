import { createRoot } from '@wordpress/element';
import App from './App';
import './styles/gradebook.css';

document.addEventListener( 'DOMContentLoaded', () => {
	const container = document.getElementById( 'an-gradebook-react-root' );
	if ( container ) {
		const root = createRoot( container );
		root.render( <App /> );
	}
} );
