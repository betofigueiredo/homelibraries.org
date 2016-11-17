import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// components
import BackBar from '../Navigation/BackBar';
import NotLogged from '../shared/NotLogged';

class AccountMap extends Component {
    constructor() {
        super();
        this._renderNotLogged = this._renderNotLogged.bind(this);
        this._renderView = this._renderView.bind(this);
        this._getMyLocation = this._getMyLocation.bind(this);
    }

    componentWillMount() {
        this.props.cleanEditionState();
    }

    _getMyLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                const field = 'map';
                const values = [position.coords.latitude, position.coords.longitude];
                this.props.editAccount(field, values);
            }, function() {
                // handleLocationError(true, infoWindow, this.map.getCenter());
            });

        } else {
            // Browser doesn't support Geolocation
            // handleLocationError(false, infoWindow, this.map.getCenter());
        }
    }

    _renderNotLogged() {
		return (
			<div className="edit-account-wrapper smaller">
				<BackBar header="EDITAR PERFIL" />
                <div className="row expanded collapse">
                    <div className="small-12 columns edit-book-title">
                    	Sua localização no mapa
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
                    	Sua localização no mapa
                    </div>
                </div>

                <div className="row">
                    <div className="small-12 columns edit-book-form">
                        <div className="edit-account-list-item no-border float-center">
                            Quando estiver na sua casa, clique no botão abaixo que buscamos sua localização automaticamente.
                        </div>
                        <div className="edit-account-list-item no-border float-center">
                            <input type="submit" className="button gradient-1 signin" defaultValue="Buscar minha localização" onClick={this._getMyLocation} />
                            {this.props.user.editing.status == 2 ? <div className="account-edited-ok">Salvo! <i className="fa fa-check-circle" aria-hidden="true"></i></div> : false}
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

export default AccountMap;
