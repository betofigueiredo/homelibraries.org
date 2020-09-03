import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Actions
import { tryLogin } from '../../store/actions';

// Components
import LayoutWrapper from '../../../shared/components/LayoutWrapper';
import InputText from '../../../shared/components/InputText';
import SignInErrors from './SignInErrors';

const SignIn = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const dispatch = useDispatch();

	function submitLogin() {
		dispatch(
			tryLogin(email, password),
		);
	}

	return (
		<LayoutWrapper>
			<div className="grid-container" styleName="smaller-grid-container">
				<div className="grid-x grid-padding-x">
					<div className="small-12 cell">
						<h3 styleName="h3">Sign In</h3>
					</div>
				</div>
				<div className="grid-x grid-padding-x">
					<div className="small-12 cell">
						<InputText
							input_id="login-field-email"
							label="email"
							default_value={email}
							updateFunc={setEmail}
						/>
						<InputText
							input_id="login-field-password"
							label="password"
							default_value={password}
							updateFunc={setPassword}
						/>
						<button
							type="button"
							onClick={submitLogin}
						>
							Entrar
						</button>
						<SignInErrors />
					</div>
				</div>
			</div>
		</LayoutWrapper>
	);
};

export default CSSModules(SignIn, styles, { allowMultiple: true });
