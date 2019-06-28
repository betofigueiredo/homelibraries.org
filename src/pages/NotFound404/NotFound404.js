import React, { Component } from 'react';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

/**
 * @render react
 * @name NotFound404
 * @description Container para página não encontrada
 * @example
 */

class NotFound404 extends Component {
	static getDerivedStateFromProps(nextProps) {
		const { match, history } = nextProps;

		switch (match.url) {
		case '/login':
		case '/sign':
		case '/signin':
		case '/entrar':
			history.push('/sign/in');
			break;
		case '/signout':
		case '/logout':
		case '/logoff':
			history.push('/sign/out');
			break;
		default:
		}

		return {};
	}

	state = {};

	render() {
		return (
			<div className="container">
				<div className="row">
					<div className="col-xs-12">
						<p styleName="teste">404</p>
					</div>
				</div>
			</div>
		);
	}
}

export default CSSModules(NotFound404, styles, { allowMultiple: true });
