import React from 'react';
// import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Components
import BookSVG from '../BookSVG';

const LoadingPage = () => (
	<div styleName="page-wrapper">
		<div styleName="loading-wrapper">
			<div styleName="logo">
				<BookSVG />
			</div>
			<div styleName="progress">
				<div styleName="indeterminate" />
			</div>
		</div>
	</div>
);

// LoadingPage.propTypes = {
// 	open_menu: PropTypes.bool
// }

export default CSSModules(LoadingPage, styles, { allowMultiple: true });
