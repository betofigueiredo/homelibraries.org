import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { connect, useDispatch } from 'react-redux';

// Redux HOC
import withStore from '../../../../store/withStore';

// CSS
import styles from './style.module.sass';

// Components
import Button from '../../../../components/Button/Button';

function ConversationReply() {
	const [message, setMessage] = useState('');
	const dispatch = useDispatch();

	const sendNewMessage = () => {
		dispatch({
			type: 'SEND_NEW_MESSAGE_REQUESTED',
			uuid: '', // TODO get uuid to send
			message,
		});
	};

	return (
		<div styleName="reply-wrapper">
			<textarea
				value={message}
				onChange={e => setMessage(e.target.value)}
				rows={4} />
			<Button
				text="Enviar"
				onClick={() => sendNewMessage()} />
		</div>
	);
}

ConversationReply.propTypes = {
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

const withCSS = CSSModules(ConversationReply, styles, { allowMultiple: true });
export default withStore(connect()(withCSS));
