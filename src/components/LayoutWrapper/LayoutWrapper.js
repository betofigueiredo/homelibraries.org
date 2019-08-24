import React from 'react';
import PropTypes from 'prop-types';
// require('es6-promise').polyfill();

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Components
import LoadingPage from '../_loadings/LoadingPage/LoadingPage';
import NavigationBar from '../NavigationBar/NavigationBar';

const LayoutWrapper = ({
	fetching,
	children,
}) => {
	switch (fetching) {
	/* ========================================================================== *\
			Render
	\* ========================================================================== */
	case 20:
	default: {
		return (
			<div styleName="page-wrapper">
				<NavigationBar />
				{React.cloneElement(children)}
			</div>
		);
	}

	/* ========================================================================== *\
			Loading
	\* ========================================================================== */
	case 0:
	case 10:
		return (
			<div styleName="page-wrapper">
				<NavigationBar />
				<LoadingPage />
			</div>
		);

	/* ========================================================================== *\
			Error
	\* ========================================================================== */
	case 30:
		return (
			<div styleName="page-wrapper">
				<NavigationBar />
				<div className="container" style={{ marginTop: '36px' }}>
					<div className="row">
						<div className="col-sm-12" styleName="error-wrapper">
							<i className="fa fa-exclamation-circle" aria-hidden="true" />
							<h3>Desculpe, tivemos um problema!</h3>
							<p>Atualize a página como descrito abaixo ou entre em contato com nossa equipe de suporte pelo chat.</p>
						</div>
					</div>
					<div className="row">
						<div className="col-sm-12" style={{ textAlign: 'center' }}>
							<div styleName="keyboards-wrapper">
								<div styleName="keyboards">
									<div styleName="type">Windows:</div>
									<div styleName="keys">
										<div styleName="key c89" style={{ width: '70px' }}><span>Ctrl</span></div>
										<div styleName="key-plus">+</div>
										<div styleName="key c89"><span>F5</span></div>
									</div>
								</div>
								<div styleName="keyboards">
									<div styleName="type">Mac OS:</div>
									<div styleName="keys">
										<div styleName="key c89" style={{ width: '70px' }}><span>&#8984;</span></div>
										<div styleName="key-plus">+</div>
										<div styleName="key c89"><span>R</span></div>
									</div>
								</div>
								<div styleName="keyboards">
									<div styleName="type">Linux:</div>
									<div styleName="keys">
										<div styleName="key c89" style={{ width: '70px' }}><span>Ctrl</span></div>
										<div styleName="key-plus">+</div>
										<div styleName="key c89"><span>F5</span></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
};

LayoutWrapper.propTypes = {
	fetching: PropTypes.number,
	children: PropTypes.object.isRequired,
};

LayoutWrapper.defaultProps = {
	fetching: 0,
};

export default CSSModules(LayoutWrapper, styles, { allowMultiple: true });
