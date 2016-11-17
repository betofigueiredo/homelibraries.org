import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// components
import BackBar from '../Navigation/BackBar';
import NotLogged from '../shared/NotLogged';

class AccountLanguage extends Component {
    constructor() {
        super();
        this._renderNotLogged = this._renderNotLogged.bind(this);
        this._renderView = this._renderView.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
        this._handleSetValues = this._handleSetValues.bind(this);
        this.state = { language: 'pt-br' };
    }

    componentWillMount() {
        this.props.cleanEditionState();
    }

    componentDidMount() {
        this.setState({ language: this.props.user.language });
    }

    _handleSubmit(e) {
        e.preventDefault();
        const field = 'language';
        const values = [this.refs.userLanguage.value];
        this.props.editAccount(field, values);
    }

    _handleSetValues(e) {
        const preValue = e.target.value;
        this.refs.userLanguage.value = preValue;
        this.setState({ language: preValue });
    }

    _renderNotLogged() {
		return (
			<div className="edit-account-wrapper smaller">
				<BackBar header="EDITAR PERFIL" />
                <div className="row expanded collapse">
                    <div className="small-12 columns edit-book-title">
                    	Idioma
                    </div>
                </div>
                <NotLogged origin="account" locale={this.props.user.language} />
			</div>
		)
    }

    _renderView() {
        const { language } = this.state;
		return (
			<div className="edit-account-wrapper smaller">
				<BackBar header="EDITAR PERFIL" />

                <div className="row expanded collapse">
                    <div className="small-12 columns edit-book-title">
                    	Idioma
                    </div>
                </div>

                <div className="row">
                    <div className="small-12 columns edit-book-form">
                    	<div className="edit-account-list-item no-border float-center">
	                        <form ref="editEmailForm" onSubmit={this._handleSubmit}>
                                <label className="form-label">Selecione o idioma</label>
                                <input type="hidden" ref="userLanguage" defaultValue={language} />

                                <div className="radio-wrapper">
                                    <input id="pt-br" type="radio" name="language-options" defaultValue="pt-br" onChange={this._handleSetValues} checked={language == 'pt-br' ? true : false} />
                                    <label htmlFor="pt-br"><span><span></span></span>Português</label>
                                </div>
                                <div className="radio-wrapper">
                                    <input id="en-us" type="radio" name="language-options" defaultValue="en-us" onChange={this._handleSetValues} checked={language == 'en-us' ? true : false} />
                                    <label htmlFor="en-us"><span><span></span></span>English</label>
                                </div>
	                            <input type="submit" className="button gradient-1 signin" defaultValue="Save" />
                                {this.props.user.editing.status == 2 ? <div className="account-edited-ok">Salvo! <i className="fa fa-check-circle" aria-hidden="true"></i></div> : false}
	                        </form>
	                    </div>
                    </div>
                </div>

				<div className="row expanded collapse">
			        <div className="small-12 columns">
			            <p><br /></p>
			        </div>
				</div>
			</div>
		)
    }

	render() {
		const { logged } = this.props.user;
	    switch(logged) {
	    	case true:
	    		return this._renderView();break;
	        case false:
	        	return this._renderView(); break;//_renderNotLogged
	    }
	}
}

export default AccountLanguage;
