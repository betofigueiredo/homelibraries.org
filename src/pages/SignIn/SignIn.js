import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Components
import BookSVG from '../../components/_svgs/BookSVG';

const Login = ({
	// =========== state
	logging,
	email,
	password,
	// =========== props
	// =========== local funcs
	handleEdition,
	handleSubmit,
	// =========== props funcs
}) => {
	const error_class = logging === 3
		? 'form-group has-error'
		: 'form-group';

	return (
		<div className="container">
			<div className="row">
				<div className="col-xs-12" styleName="col">
					<div styleName="login-wrapper">
						<BookSVG />
						<h4 styleName="h3-margin">Faça seu login</h4>
						<form onSubmit={handleSubmit}>
							<div className={error_class}>
								<label htmlFor="email">E-mail</label>
								<input
									type="email"
									className="form-control"
									id="email"
									value={email}
									onChange={handleEdition} />
							</div>
							<div className={error_class}>
								<label htmlFor="password">Senha</label>
								<input
									type="password"
									className="form-control"
									id="password"
									value={password}
									onChange={handleEdition} />
							</div>
							{logging === 4 && (
								<div className="alert alert-danger" role="alert">
									<i className="fa fa-exclamation-triangle fa-fw" aria-hidden="true" /> E-mail não cadastrado em nosso sistema!
								</div>
							)}
							{logging === 5 && (
								<div className="alert alert-danger" role="alert">
									<i className="fa fa-exclamation-triangle fa-fw" aria-hidden="true" /> Senha inválida!
								</div>
							)}
							{(logging === 1 || logging === 2) ? (
								<button
									type="button"
									className="button"
									disabled="disabled">
									Entrando
								</button>
							) : (
								<button
									type="submit"
									className="button">
									Entrar
								</button>
							)}
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

Login.propTypes = {
	// =========== state
	logging: PropTypes.number.isRequired,
	email: PropTypes.string.isRequired,
	password: PropTypes.string.isRequired,
	// =========== props
	// =========== local funcs
	handleEdition: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	// =========== props funcs
};

export default CSSModules(Login, styles, { allowMultiple: true });
