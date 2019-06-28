import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss'

class Loading extends Component {
	render() {
		return (
			<div styleName="loader">
				<svg styleName="circular" viewBox="25 25 50 50">
					<circle styleName="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10"/>
				</svg>
			</div>
		)
	}
}

Loading.propTypes = {
	mensagem: PropTypes.string
}

export default CSSModules(Loading, styles, { allowMultiple: true });
