/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';

// Redux HOC
import withStore from '../../store/withStore';

// Components
import LayoutWrapper from '../../components/LayoutWrapper';
import Messages from './Messages';
/* eslint-disable */
function MessagesContainer({
	getMessages,
	match,
}) {
	const dispatch = useDispatch();

	useEffect(() => {
		document.title = 'Meus livros - Home Libraries';
		dispatch({ type: 'MYBOOKS_REQUESTED' });
		// const uuid = match.params.uuid || '';
		// getMessages(`/messages/${uuid}`, {});
	}, []);

	return (
		<LayoutWrapper fetching={20}>
			<Messages />
		</LayoutWrapper>
	);
}

MessagesContainer.propTypes = {
	getMessages: PropTypes.func.isRequired,
	match: PropTypes.object.isRequired,
};

export default withStore(connect(null, null)(MessagesContainer));
