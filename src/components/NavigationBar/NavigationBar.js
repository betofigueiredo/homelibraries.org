import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

/**
 * @render react
 * @name NavigationBar
 * @description Menu principal
 * @example
 */

// Language
// import { translate } from '../../languages/translate';

// Components
import NavButton from './NavButton';

const NavigationBar = ({ match }) => {
	const libraries_matches = ['/libraries'];
	const mybooks_matches = ['/mybooks'];
	const messages_matches = ['/messages'];
	const account_matches = [
		'/account',
		'/account/name',
		'/account/url',
		'/account/address',
		'/account/map',
		'/account/lfl',
		'/account/email',
		'/account/password',
		'/account/language',
	];

	return (
		<div styleName="navigation-wrapper">
			<div styleName="menu-top">
				<Link to="/libraries">.</Link>
			</div>
			<ul styleName="menu">
				<NavButton
					label="Mapa"
					icon="fa fa-map-marker"
					link="/libraries"
					match={match}
					url_matches={libraries_matches} />
				<NavButton
					label="Meus livros"
					icon="fa fa-book"
					link="/mybooks"
					match={match}
					url_matches={mybooks_matches} />
				<NavButton
					label="Trocas"
					icon="fa fa-handshake-o"
					link="/trades"
					match={match}
					url_matches={[]} />
				<NavButton
					label="Mensagens"
					icon="fa fa-comments"
					link="/messages"
					match={match}
					url_matches={messages_matches} />
				<NavButton
					label="Conta"
					icon="fa fa-user"
					link="/account"
					match={match}
					url_matches={account_matches} />
			</ul>
		</div>
	);
};

NavigationBar.propTypes = {
	match: PropTypes.object.isRequired,
	// locale: PropTypes.string.isRequired,
};

// NavigationBar.defaultProps = {
// 	route_path: '',
// };

export default withRouter(CSSModules(NavigationBar, styles, { allowMultiple: true }));
