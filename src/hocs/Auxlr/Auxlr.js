// eslint-disable-next-line no-unused-vars
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { buildMapStateToProps, buildmapDispatchToProps } from '../../store/reduxDispatchs';

// Redux HOC
import withStore from '../../store/withStore';

// Functions
import { getLocalstorageData, setLocalstorageData } from '../../functions/_getLocalstorageData';

class Auxlr extends Component {
	componentDidMount() {
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
		/**
		 * addEventListener
		 */
		window.addEventListener('mouseup', this.handleMouseUp);
		/**
		 * checkAuth
		 */
		this.checkAuth();
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

		return <>{children}</>;
	}
}

Auxlr.propTypes = {
	updateUserRaw: PropTypes.func.isRequired,
	children: PropTypes.object.isRequired,
};

const mapStateToProps = (props) => buildMapStateToProps(props);
const mapDispatchToProps = (dispatch) => buildmapDispatchToProps(dispatch);
export default withStore(connect(mapStateToProps, mapDispatchToProps)(Auxlr));
