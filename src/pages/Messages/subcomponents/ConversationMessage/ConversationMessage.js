import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

function ConversationMessage({ message }) {
	const {
		mine,
		message: text,
	} = message;

	const message_class = mine
		? 'message mine'
		: 'message';

	return (
		<div styleName="message-wrapper" data-test="component-conversation-message">
			<div styleName={message_class}>{text}</div>
		</div>
	);
}

ConversationMessage.propTypes = {
	message: PropTypes.shape({
		book_confirmed: PropTypes.bool.isRequired,
		created: PropTypes.string.isRequired,
		id: PropTypes.number.isRequired,
		id_book: PropTypes.number.isRequired,
		id_received: PropTypes.string.isRequired,
		id_send: PropTypes.string.isRequired,
		is_read: PropTypes.bool.isRequired,
		message: PropTypes.string.isRequired,
		mine: PropTypes.bool.isRequired,
	}).isRequired,
};

export default CSSModules(ConversationMessage, styles, { allowMultiple: true });
