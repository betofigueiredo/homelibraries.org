import React, { useEffect } from 'react';
// import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { connect, useSelector, useDispatch } from 'react-redux';

// Redux HOC
import withStore from '../../../../store/withStore';

// CSS
import styles from './style.module.sass';

// Components
import ContactRow from '../ContactRow';

function MessagesList() {
	const dispatch = useDispatch();
	const messages = useSelector(store => store.messages);
	const { fetching, all_messages } = messages;
	const { by_id, all_ids } = all_messages;

	useEffect(() => {
		dispatch({ type: 'MESSAGES_REQUESTED' });
	}, []);

	if (fetching.all_messages === 10) {
		return (
			<div styleName="messages-list">
				Loading
			</div>
		);
	}

	if (fetching.all_messages === 30) {
		return (
			<div styleName="messages-list">
				Error
			</div>
		);
	}

	return (
		<div styleName="messages-list">
			<h3 styleName="h3">Mensagens</h3>
			{all_ids.map(m_id => (
				<ContactRow
					key={m_id}
					contact_message={by_id[m_id]} />
			))}
		</div>
	);
}

// MessagesList.propTypes = {
// 	contact: PropTypes.object,
// 	mybooks: PropTypes.object.isRequired,
// };

const withCSS = CSSModules(MessagesList, styles, { allowMultiple: true });
export default withStore(connect()(withCSS));
