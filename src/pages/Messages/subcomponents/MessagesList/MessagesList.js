import React from 'react';
// import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { connect } from 'react-redux';

// Redux HOC
import withStore from '../../../../store/withStore';

// CSS
import styles from './style.module.sass';

// Components
import ContactRow from '../ContactRow';

// Functions
// import { _post } from '../../../../functions/_requests';

function MessagesList() {
	return (
		<div styleName="messages-list">
			<h3 styleName="h3">Mensagens</h3>
			<ContactRow />
			<ContactRow />
		</div>
	);
}

// MessagesList.propTypes = {
// 	contact: PropTypes.object,
// 	mybooks: PropTypes.object.isRequired,
// };

// MessagesList.defaultProps = {
// 	contact: {},
// };

const withCSS = CSSModules(MessagesList, styles, { allowMultiple: true });
export default withStore(connect()(withCSS));
