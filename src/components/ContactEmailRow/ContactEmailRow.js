import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

/**
 * @render react
 * @name ContactEmailRow
 * @description Componente mostra key para envio de email
 * @example
 */

/* eslint-disable */
class ContactEmailRow extends Component {
	// selectContactLocal = () => {
	// 	const { contact, selectContact } = this.props;
	// 	selectContact(contact.id);
	// }

	render() {
		const { data } = this.props;

		return (
			<div className="small-12 cell">
				<div styleName="contact-wrapper">
					<div styleName="fake-image">MF</div>
					<div styleName="name">{data.name}</div>
					<div styleName="email">{data.email}</div>
				</div>
			</div>
		);
	}
}

ContactEmailRow.propTypes = {
	data: PropTypes.object.isRequired,
};

export default CSSModules(ContactEmailRow, styles, { allowMultiple: true });
