import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// components
import BackBar from '../Navigation/BackBar';
import NotLogged from '../shared/NotLogged';

class AccountUrl extends Component {
    constructor() {
        super();
        this._renderNotLogged = this._renderNotLogged.bind(this);
        this._renderView = this._renderView.bind(this);
        this._handleSubmiteditName = this._handleSubmiteditName.bind(this);
    }

    componentWillMount() {
        this.props.cleanEditionState();
    }

    _handleSubmiteditName(e) {
        e.preventDefault();
        const field = 'url';
        const values = [this.refs.userUrl.value];
        this.props.editAccount(field, values);
    }

    _renderNotLogged() {
		return (
			<div className="edit-account-wrapper smaller">
				<BackBar header="EDITAR PERFIL" />
                <div className="row expanded collapse">
                    <div className="small-12 columns edit-book-title">
                    	Url personalizada
                    </div>
                </div>
                <NotLogged origin="account" locale={this.props.user.language} />
			</div>
		)
    }

    _renderView() {
		return (
			<div className="edit-account-wrapper smaller">
				<BackBar header="EDITAR PERFIL" />

                <div className="row expanded collapse">
                    <div className="small-12 columns edit-book-title">
                    	Url personalizada
                    </div>
                </div>

                <div className="row">
                    <div className="small-12 columns edit-book-form">
                    	<div className="edit-account-list-item no-border float-center">
	                        <form ref="editNameForm" onSubmit={this._handleSubmiteditName}>
	                            <label className="form-label" htmlFor="userUrl">
                                    Url {this.props.user.editing.error == 'already_exist' ? <span className="url-error-span">Este nome já está cadastrado.</span> : false}
                                </label>
	                            <input type="text" id="userUrl" ref="userUrl" className="form-input url" defaultValue={this.props.user.url} required={true} />
                                <div className="form-input-back-placeholder">homelibraries.org/</div>
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
	        	return this._renderNotLogged(); break;
	    }
	}
}

export default AccountUrl;
