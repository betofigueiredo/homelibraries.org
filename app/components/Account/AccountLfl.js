import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// components
import BackBar from '../Navigation/BackBar';
import NotLogged from '../shared/NotLogged';

class AccountLfl extends Component {
    constructor() {
        super();
        this._renderNotLogged = this._renderNotLogged.bind(this);
        this._renderView = this._renderView.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
    }

    componentWillMount() {
        this.props.cleanEditionState();
    }

    _handleSubmit(e) {
        e.preventDefault();
        const field = 'lfl';
        const values = [this.refs.userLfl.value];
        this.props.editAccount(field, values);
    }

    _renderNotLogged() {
		return (
			<div className="edit-account-wrapper smaller">
				<BackBar header="EDITAR PERFIL" />
                <div className="row expanded collapse">
                    <div className="small-12 columns edit-book-title">
                    	Little Free Library
                    </div>
                </div>
                <NotLogged origin="account" locale={this.props.user.language} />
			</div>
		)
    }

    _renderView() {
        const { number, confirmed } = this.props.user.lfl;
		return (
			<div className="edit-account-wrapper smaller">
				<BackBar header="EDITAR PERFIL" />

                <div className="row expanded collapse">
                    <div className="small-12 columns edit-book-title">
                    	Little Free Library
                    </div>
                </div>

                <div className="row">
                    <div className="small-12 columns edit-book-form">
                    	<div className="edit-account-list-item no-border float-center">
	                        <form ref="editNameForm" onSubmit={this._handleSubmit}>
	                            <label className="form-label" htmlFor="userLfl">Número da sua biblioteca</label>
	                            <input type="text" id="userLfl" ref="userLfl" className="form-input" defaultValue={number} required={true} />
                                {confirmed === false && number != 0 ? <div className="lfl-waiting-confirmation"><i className="fa fa-exclamation-circle" aria-hidden="true"></i> Aguardando confirmação.</div> : false}
	                            <input type="submit" className="button gradient-1 signin" defaultValue="Save" />
                                {this.props.user.editing.status == 2 ? <div className="account-edited-ok">Salvo! <i className="fa fa-check-circle" aria-hidden="true"></i></div> : false}
	                        </form>
	                    </div>
                    </div>
                </div>

                <div className="row">
                    <div className="small-12 columns edit-book-form">
                        <div className="edit-account-list-item no-border float-center">
                            <label className="form-label">O que é Little Free Library</label>
                            Little Free Library é um projeto que surgiu nos EUA, com a construção de pequenas bibliotecas públicas nas calçadas, parques e etc.
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
	        	return this._renderNotLogged(); break;
	    }
	}
}

export default AccountLfl;
