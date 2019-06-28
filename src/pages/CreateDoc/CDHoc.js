/* eslint class-methods-use-this: 0 */
import React, { Component } from 'react';

/**
 * @render react
 * @name CDHoc
 * @description HOC para validar info antes de enviar o documento
 * @example
 */

function CDHoc(Comp) {
	return class PP extends Component {
		constructor(props) {
			super(props);
			this.state = {
				window_height: 600,
			};
		}

		validationAll = doc => {
			const title = doc.title || '';
			if (title === '') return false;

			const contacts = doc.contacts || [];
			if (contacts.length === 0) return false;

			const security_time = doc.security_time || 0;
			if (security_time === 0) return false;

			const content = doc.content || '';
			if (content === '') return false;

			console.log(doc);
			return true;
		}

		render() {
			return (
				<Comp
					{...this.state}
					{...this.props}
					validationAll={this.validationAll} />
			);
		}
	};
}

export default CDHoc;
