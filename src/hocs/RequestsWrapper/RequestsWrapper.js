import React, { Component } from 'react';
import PropTypes from 'prop-types';
// require('es6-promise').polyfill();

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Components
import LoadingPage from '../../components/_loadings/LoadingPage/LoadingPage';
import NavigationBar from '../../components/NavigationBar/NavigationBar';

// Functions
import { _get } from '../../functions/_requests';
// import { handleRequestErrors } from '../../functions/_handleRequestErrors';
// import { getLocalstorageData } from '../_functions/_getLocalstorageData';
import { handleUpdateState } from '../../functions/_handleUpdateState';

class RequestsWrapper extends Component {
	state = {
		request_state: 0,
	};

	componentDidMount() {
		/**
		 * Inicia as funções para request se nada foi carregado
		 */
		const { request_state } = this.state;
		if (request_state === 0) {
			this.handleUrls();
		}
	}

	componentDidUpdate(prevProps) {
		/**
		 * Verifica se tem novas url's para carregar
		 */
		const { request_state } = this.state;
		const { urls_to_fetch } = this.props;
		if (
			request_state === 2
			&& prevProps.urls_to_fetch.length === 0
			&& urls_to_fetch.length > 0
		) this.handleUrls();
	}

	componentWillUnmount() {
		/**
		 * Cancela os requests caso o componente seja desmontado
		 */
		if (this.cancel !== undefined) {
			this.cancel('canceled_request');
		}
	}

	handleUrls = () => {
		/**
		 * Carrega primeiro grupo de url's
		 */
		const { urls_to_fetch } = this.props;
		if (urls_to_fetch.length > 0) {
			this.setState({ request_state: 1 });
			this.handleFetch(urls_to_fetch);
		} else {
			this.setState({ request_state: 2 });
		}
	}

	handleFetch = (urls_to_fetch) => {
		const { handleResponses } = this.props;
		const all_fetch_urls = urls_to_fetch.map(url => _get(url));
		Promise.all(all_fetch_urls).then(responses => {
			handleResponses(responses, this.updateWrapperState);
		}).catch(error => {
			this.handleError(error);
		});
	}

	updateWrapperState = (field, value) => {
		/**
		 * Função enviada para outros componentes atualizarem o state desse componente
		 * handleUpdateState lida com valores `true` e `false`
		 */
		const _value = handleUpdateState({}, value);
		this.setState({ [field]: _value });
	}

	handleError = (error) => {
		const { handleError, updateUserRaw } = this.props;
		/**
		 * Caso a função que trata o erro venha do outro componente (child)
		 */
		if (handleError !== null) {
			handleError(error);
			return;
		}
		/**
		 * Default, o erro é tratado aqui mesmo
		 */
		if (error.message !== 'canceled_request') {
			this.setState({ request_state: 3 });
			if (error.response && error.response.status === 403) {
				const user_localstorage = {
					token: '',
					email: '',
					id: 0,
					username: '',
					name: '',
					color: '',
					lfl: '',
				};
				localStorage.setItem('user', JSON.stringify(user_localstorage));
				updateUserRaw({
					logged: false,
					token: '',
					email: '',
					id: '',
					username: '',
					name: '',
					color: '',
					lfl: '',
				});
			} else {
				this.setState({ request_state: 3 });
				// handleRequestErrors(error);
			}
		}
	}

	render() {
		const { request_state } = this.state;
		// store
		const { user, match, children } = this.props;

		const { locale } = user;

		switch (request_state) {
		/* ========================================================================== *\
				Render
		\* ========================================================================== */
		case 2:
		default: {
			return (
				<div styleName="page-wrapper">
					<NavigationBar
						route_path={match.path}
						locale={locale} />
					{React.cloneElement(children)}
				</div>
			);
		}

		/* ========================================================================== *\
				Loading
		\* ========================================================================== */
		case 0:
		case 1:
			return (
				<div styleName="page-wrapper">
					<NavigationBar
						route_path={match.path}
						locale={locale} />
					<LoadingPage />
				</div>
			);

		/* ========================================================================== *\
				Error
		\* ========================================================================== */
		case 3:
			return (
				<div styleName="page-wrapper">
					<NavigationBar
						route_path={match.path}
						locale={locale} />
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
	}
}

RequestsWrapper.propTypes = {
	// auth: PropTypes.bool,
	urls_to_fetch: PropTypes.array,
	handleResponses: PropTypes.func,
	handleError: PropTypes.func,
	// =========== store
	user: PropTypes.object.isRequired,
	// =========== funcs
	updateUserRaw: PropTypes.func.isRequired,
	// =========== router
	match: PropTypes.object.isRequired,
	// history: PropTypes.object.isRequired,
	// =========== children
	children: PropTypes.object.isRequired,
};

RequestsWrapper.defaultProps = {
	// auth: true,
	urls_to_fetch: [],
	handleResponses: () => {},
	handleError: null,
};

export default CSSModules(RequestsWrapper, styles, { allowMultiple: true });
