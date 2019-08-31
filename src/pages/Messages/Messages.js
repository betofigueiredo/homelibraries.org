import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { connect, useSelector } from 'react-redux';

// CSS
import styles from './style.module.sass';

// Redux HOC
import withStore from '../../store/withStore';

// Components
import LayoutWrapper from '../../components/LayoutWrapper';
import NotLogged from '../../components/NotLogged';
import MessagesList from './subcomponents/MessagesList';
import Conversation from './subcomponents/Conversation';

function Messages({ match }) {
	const messages = useSelector(store => store.messages);
	const { fetching } = messages;

	useEffect(() => {
		document.title = 'Mensagens - Home Libraries';
	}, []);

	if (
		fetching.all_messages === 40
		|| fetching.conversation === 40
	) {
		return <NotLogged />;
	}

	return (
		<LayoutWrapper fetching={20}>
			<div styleName="messages-wrapper">
				<MessagesList />
				<Conversation match={match} />
			</div>
		</LayoutWrapper>
	);
}

Messages.propTypes = {
	match: PropTypes.object.isRequired,
};

const withCSS = CSSModules(Messages, styles, { allowMultiple: true });
export default withStore(connect()(withCSS));
