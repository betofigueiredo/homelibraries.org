import React from 'react';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import ContactsList from './subcomponents/ContactsList';

const Messages = () => (
	<div className="grid-container">
		<div className="grid-x grid-padding-x">
			<ContactsList />
			<div className="small-7 cell">
				.
			</div>
		</div>
	</div>
);

export default CSSModules(Messages, styles, { allowMultiple: true });
