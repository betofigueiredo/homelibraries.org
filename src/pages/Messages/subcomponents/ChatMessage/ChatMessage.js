import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Functions
// import { _post } from '../../../../functions/_requests';

function ChatMessage({ message }) {
	const { mine } = message;
	console.log(mine);

	const message_class = mine
		? 'message mine'
		: 'message';

	return (
		<div styleName="message-wrapper">
			<div styleName={message_class}>barra superior</div>
		</div>
	);
}

ChatMessage.propTypes = {
	message: PropTypes.object.isRequired,
};

export default CSSModules(ChatMessage, styles, { allowMultiple: true });
