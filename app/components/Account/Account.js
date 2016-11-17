import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// components
import ActionBar from '../Navigation/ActionBar';
import NavigationBar from '../Navigation/NavigationBar';
import NotLogged from './NotLogged';

const EditAccountListItem = ({ item, url, value = '' }) => {
	return (
		<div className="row expanded collapse">
	        <div className="small-12 columns edit-account-list-item-wrapper">
	            <Link to={url}>
		            <div className="edit-account-list-item float-center">
		                <div>{item}<span>{value}</span></div>
		                <i className="fa fa-angle-right"></i>
		            </div>
	            </Link>
	        </div>
		</div>
	)
}

class Account extends Component {
    constructor() {
        super();
        this._renderNotLogged = this._renderNotLogged.bind(this);
        this._renderView = this._renderView.bind(this);
        this._handleSignOff = this._handleSignOff.bind(this);
    }

    _handleSignOff(e) {
		e.target.setAttribute('disabled', 'disabled');
		this.props.signOff();
    }

    _renderNotLogged() {
		return (
			<div className="edit-account-wrapper">
				<ActionBar {...this.props} />
				<NavigationBar {...this.props} />
                <NotLogged origin="account" locale={this.props.user.language} />
			</div>
		)
    }

    _renderView() {
		return (
			<div className="edit-account-wrapper">
				<ActionBar {...this.props} />
				<NavigationBar {...this.props} />

				<div className="row expanded collapse">
					<div className="small-12 columns">
						<div className="edit-account-button">
							<Link to={`/${this.props.user.url}`}>
								<button className="button gradient-1">Ver meu perfil</button>
							</Link>
						</div>
					</div>
				</div>

				<div className="row expanded collapse">
					<div className="small-12 columns">
						<div className="edit-account-title">Editar perfil</div>
					</div>
				</div>

				<EditAccountListItem 
					item="Foto do perfil"
					url="/account/picture" />

				<EditAccountListItem
					url="/account/name" 
					item="Nome"
					value={` - ${this.props.user.name}`} />

				<EditAccountListItem
					url="/account/url" 
					item="Url personalizada"
					value={` - homelibraries.org/${this.props.user.url}`} />

				<EditAccountListItem
					url="/account/address" 
					item="Endereço"
					value={` - ${this.props.user.address.details}`} />

				<EditAccountListItem
					url="/account/map" 
					item="Sua localização no mapa" />

				<EditAccountListItem
					url="/account/lfl" 
					item="Little Free Library"
					value={this.props.user.lfl >= 1 ? ` - ${this.props.user.address.details}` : ''} />

				<div className="row expanded collapse">
					<div className="small-12 columns">
						<div className="edit-account-title">Editar conta</div>
					</div>
				</div>

				<EditAccountListItem
					url="/account/email" 
					item="E-mail" />

				<EditAccountListItem
					url="/account/language" 
					item="Idioma" />

				<div className="row expanded collapse">
					<div className="small-12 columns">
						<div className="edit-account-title">Sair</div>
					</div>
				</div>

				<div className="row expanded collapse">
			        <div className="small-12 columns edit-account-list-item-wrapper">
			            <button className="edit-account-list-item float-center">
			                <div>Sair</div>
			                <i className="fa fa-angle-right"></i>
			            </button>
			        </div>
				</div>

				<EditAccountListItem
					url="/account/delete" 
					item="Apagar conta" />

				<div className="row expanded collapse">
			        <div className="small-12 columns">
			            <p><br /></p>
			        </div>
				</div>
			</div>
		)
    }

	render () {
		const { logged } = this.props.user;
	    switch(logged) {
	    	case true:
	    		return this._renderView();break;
	        case false:
	        	return this._renderNotLogged(); break;
	    }
	}
}

export default Account;
