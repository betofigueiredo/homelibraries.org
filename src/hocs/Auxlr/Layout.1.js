import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { buildMapStateToProps, buildmapDispatchToProps } from '../../store/reduxDispatchs';

// Components
import Auxlr from '../Auxlr/Auxlr';

// Functions
import { getLocalstorageData, setLocalstorageData } from '../../functions/_getLocalstorageData';

class Layout extends Component {
	componentWillMount() {
		/**
		 * Define base url
		 */
		const origin = window.location.href;
		let base_url = 'https://api.homelibraries.org';
		let environment = '';
		if (origin.indexOf('http://localhost') !== -1) {
			base_url = 'https://api.homelibraries.org';
			environment = 'dev';
		}
		setLocalstorageData('environment', { base_url, environment });
		this.checkAuth();
	}

	componentDidMount() {
		window.addEventListener('mouseup', this.handleMouseUp);
	}

	handleMouseUp = (e) => {
		const { ui, updateUi } = this.props;
		if (ui.dropdown && !e.target.getAttribute('data-dropdown')) {
			const dropdowns = document.getElementsByClassName('dropdown-pane is-open');
			for (let i = 0; i < dropdowns.length; i++) dropdowns[i].className = 'dropdown-pane';
			if (document.getElementsByClassName('dropdown clearfix open').length > 0) {
				document.getElementsByClassName('dropdown clearfix open')[0].className = 'dropdown-pane';
			}
			updateUi(['dropdown'], false);
		}
	}

	checkAuth() {
		const { updateUserRaw } = this.props;
		const token = getLocalstorageData('user', 'token') || '';
		const email = getLocalstorageData('user', 'email') || '';
		const id = getLocalstorageData('user', 'id') || 0;
		const username = getLocalstorageData('user', 'username') || '';
		const name = getLocalstorageData('user', 'name') || '';
		const language = localStorage.getItem('locale') || 'pt-br';
		const color = getLocalstorageData('user', 'color') || '';
		const lfl = getLocalstorageData('user', 'lfl') || '';

		if (token !== '' && email !== '') {
			updateUserRaw({
				token,
				email,
				id,
				username,
				name,
				language,
				color,
				lfl,
				logged: true,
			});
			return;
		}

		localStorage.setItem('user', JSON.stringify({}));
	}

	render() {
		const { children } = this.props;

		return <Auxlr>{children}</Auxlr>;
	}
}

Layout.propTypes = {
	ui: PropTypes.object.isRequired,
	children: PropTypes.object.isRequired,
	updateUi: PropTypes.func.isRequired,
	updateUserRaw: PropTypes.func.isRequired,
};

const mapStateToProps = props => buildMapStateToProps(props);
const mapDispatchToProps = dispatch => buildmapDispatchToProps(dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(Layout);
