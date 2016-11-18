import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';
import { translate } from '../languages/translate';

class SignUp extends Component {
    constructor() {
        super();
        this._handleSignUp = this._handleSignUp.bind(this);
        this._handleResults = this._handleResults.bind(this);
        this._closeAlerts = this._closeAlerts.bind(this);
    }

    _handleSignUp(e) {
		e.preventDefault();

		this.refs.alert1.setAttribute('class', 'row sign-in-alerts');
		this.refs.alert2.setAttribute('class', 'row sign-in-alerts');

		const name = this.refs.name.value;
		const email = this.refs.email.value;
		e.target.setAttribute('disabled', 'disabled');
		this.props.signUp(name, email);
    }

    _handleResults() {
    	const { loading, error } = this.props.user;
    	const origin = this.props.params.origin || '';
	    switch(loading) {
	    	/* Auth or SignIn ok ====================== */
	        case 2:
	        case 5:
			    switch(error) {
			        case 0:
			        	origin == '' ? browserHistory.push('/libraries') : browserHistory.push(`/${origin.substring(2)}/`);
			        	break;
			        case 1:
			        	// blank_fields
        				this.refs.alert1.setAttribute('class', 'row signin');
			        	break;
			        case 2:
			        	// already_exist
			        	this.refs.alert2.setAttribute('class', 'row signin');
			        	break;
			    }
	        	break;
	    }
    }

    _closeAlerts(e) {
		e.preventDefault();
		const alertToClose = e.currentTarget.getAttribute('data-alert');
		this.refs[`alert${alertToClose}`].setAttribute('class', 'row sign-in-alerts');
    }

    componentDidMount() {
    	this._handleResults();
    }

    componentDidUpdate() {
    	this._handleResults();
    }

	render () {
		const locale = this.props.user.language;

		return (
			<div className="sign-in-wrapper">
				<div className="row signin">
					<div className="small-12 columns">
						<div className="sign-in-logo">
							<div>
								<svg version="1.1" width="96" height="96" viewBox="0 0 96 66">
									<g><path fill="#43d996" d="M22.5,28.3v33.6c15.6,0,18.5,1.9,24,4.7V32.9C43.7,30.1,39.6,28.3,22.5,28.3z M73.5,28.3
									c-17.1,0-21.3,1.9-24,4.7v33.6c5.5-2.8,8.4-4.7,24-4.7V28.3z M15.5,31.8v36H44c-4.6-2.2-7.9-3.5-21.5-3.5h-2.3v-2.3V31.8H15.5z
									 M75.9,31.8v30.1v2.3h-2.3c-13.6,0-16.9,1.3-21.5,3.5h28.5v-36H75.9z"/></g>
								</svg>
							</div>
							Home Libraries
						</div>
					</div>
				</div>
				<div ref="alert1" className="row sign-in-alerts">
					<div className="small-12 columns">
						<div className="sign-in-alert">
							<button data-alert="1" onClick={this._closeAlerts}><i className="fa fa-times" aria-hidden="true"></i></button>
							<i className="fa fa-exclamation-circle fa-fw" aria-hidden="true"></i> Preencha todos os campos.
						</div>
					</div>
				</div>
				<div ref="alert2" className="row sign-in-alerts">
					<div className="small-12 columns">
						<div className="sign-in-alert">
							<button data-alert="2" onClick={this._closeAlerts}><i className="fa fa-times" aria-hidden="true"></i></button>
							<i className="fa fa-exclamation-circle fa-fw" aria-hidden="true"></i> E-mail já cadastrado.
						</div>
					</div>
				</div>
				<div className="row signin">
					<div className="small-12 columns">
                        <form ref="emailSignUpForm" className="sign-in-form" onSubmit={this._handleSignUp}>
                            <label className="form-label" htmlFor="name">Seu nome</label>
                            <input type="text" id="name" ref="name" className="form-input" />
                            <label className="form-label" htmlFor="email">E-mail</label>
                            <input type="text" id="email" ref="email" className="form-input" required={true} />
                            <button type="submit" className="button gradient-1 signin">Cadastrar</button>
                        </form>
					</div>
				</div>

				<div className="row signin">
					<div className="small-12 columns">
						<div className="create-account-button">
							{translate[locale].alreadyHaveAccount} <Link to="/sign/in">{translate[locale].signIn}</Link>
						</div>
					</div>
				</div>

			</div>
		)
	}
}

export default SignUp;
