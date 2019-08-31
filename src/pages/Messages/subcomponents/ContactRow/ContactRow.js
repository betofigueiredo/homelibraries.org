import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

function ContactRow({ contact_message }) {
	const { message, user } = contact_message;

	return (
		<div styleName="contact-card" data-test="component-contactrow">
			<div styleName="picture">.</div>
			<div styleName="nome">{user.name}</div>
			<div styleName="message">{message}</div>
		</div>
	);
}

ContactRow.propTypes = {
	contact_message: PropTypes.shape({
		id: PropTypes.number.isRequired,
		id_book: PropTypes.number.isRequired,
		is_read: PropTypes.bool.isRequired,
		latest_update: PropTypes.string.isRequired,
		message: PropTypes.string.isRequired,
		user: PropTypes.shape({
			color: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			uuid: PropTypes.string.isRequired,
		}).isRequired,
	}).isRequired,
};

export default CSSModules(ContactRow, styles, { allowMultiple: true });
