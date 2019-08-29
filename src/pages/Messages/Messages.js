import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { connect, useDispatch } from 'react-redux';

// CSS
import styles from './style.module.sass';

// Redux HOC
import withStore from '../../store/withStore';

// Components
import LayoutWrapper from '../../components/LayoutWrapper';
import ContactsList from './subcomponents/ContactsList';
import Chat from './subcomponents/Chat';

function Messages({ match }) {
	const dispatch = useDispatch();

	useEffect(() => {
		document.title = 'Mensagens - Home Libraries';
		const uuid = match.params.uuid || '';
		dispatch({
			type: 'MESSAGES_REQUESTED',
			url: `/messages/${uuid}`,
		});
	}, []);

	return (
		<LayoutWrapper fetching={20}>
			<div styleName="messages-wrapper">
				<ContactsList />
				<Chat />
			</div>
		</LayoutWrapper>
	);
}

Messages.propTypes = {
	match: PropTypes.object.isRequired,
};

const withCSS = CSSModules(Messages, styles, { allowMultiple: true });
export default withStore(connect()(withCSS));
