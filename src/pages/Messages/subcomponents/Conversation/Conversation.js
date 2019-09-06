import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { connect, useSelector, useDispatch } from 'react-redux';

// Redux HOC
import withStore from '../../../../store/withStore';

// CSS
import styles from './style.module.sass';

// Components
import ConversationMessage from '../ConversationMessage';

function Conversation({ match }) {
	const dispatch = useDispatch();
	const messages = useSelector(store => store.messages);
	const { fetching, conversation } = messages;
	const {
		// color,
		// name,
		// url,
		// uuid,
		by_id,
		all_ids,
	} = conversation;
	const uuid = match.params.uuid || '';

	useEffect(() => {
		if (uuid !== '') {
			dispatch({
				type: 'CONVERSATION_REQUESTED',
				uuid,
			});
			return;
		}

		function resetConversation() {
			dispatch({
				type: 'UPDATE_MESSAGES_RAW',
				fields_n_values: {
					fetching: {
						...messages.fetching,
						conversation: 20,
					},
					conversation: {
						uuid: '',
						by_id: {},
						all_ids: [],
					},
				},
				value: 20,
			});
		}
		resetConversation();
	}, [uuid]);

	if (fetching.conversation === 10) {
		return (
			<div styleName="chat-wrapper">
				Loading
			</div>
		);
	}

	if (fetching.conversation === 30) {
		return (
			<div styleName="chat-wrapper">
				Error
			</div>
		);
	}

	return (
		<div styleName="chat-wrapper" data-test="component-conversation">
			<div className="grid-container" styleName="smaller-grid-container">
				<div className="grid-x grid-padding-x">
					<div className="small-12 cell">
						<h3>Meus livros</h3>
					</div>
				</div>
				<div className="grid-x grid-padding-x">
					<div className="small-12 cell">
						{all_ids.map(c_id => (
							<ConversationMessage
								key={c_id}
								message={by_id[c_id]} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

Conversation.propTypes = {
	match: PropTypes.object.isRequired,
};

const withCSS = CSSModules(Conversation, styles, { allowMultiple: true });
export default withStore(connect()(withCSS));
