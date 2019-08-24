import React from 'react';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import ContactsList from './subcomponents/ContactsList';
import Chat from './subcomponents/Chat';

const Messages = () => (
	<div styleName="messages-wrapper">
		<ContactsList />
		<Chat />
	</div>
);

// const Messages = () => (
// 	<div className="grid-container">
// 		<div className="grid-x grid-padding-x">
// 			<ContactsList />
// 			<Chat />
// 		</div>
// 	</div>
// );

export default CSSModules(Messages, styles, { allowMultiple: true });
