/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Redux
import { buildMapStateToProps, buildmapDispatchToProps } from '../../store/reduxDispatchs';

// Components
import RequestsWrapper from '../../hocs/RequestsWrapper/RequestsWrapper';
import AccLinkRow from './subcomponents/AccLinkRow/AccLinkRow';

const Account = ({ ...props }) => {
	const {
		logged,
		name,
		username,
		email,
	} = props.user;

	if (!logged) {
		return (
			<p>not logged</p>
		);
	}

	// console.log(props.user);

	return (
		<RequestsWrapper {...props}>
			<>
				<div className="grid-container smaller-grid-container">
					<div className="grid-x grid-padding-x">
						<div className="small-12 cell">
							<h3 styleName="h3">Minha conta</h3>
						</div>
					</div>
				</div>
				<div className="grid-container smaller-grid-container">
					<div className="grid-x grid-padding-x">
						<div className="small-12 cell" styleName="title">EDITAR PERFIL</div>
					</div>
				</div>
				<div className="grid-container fluid full" styleName="white-container">
					<div className="grid-container smaller-grid-container">
						<div className="grid-x grid-padding-x">
							<div className="cell">
								<AccLinkRow
									url="/account/name"
									menu="Nome"
									value={name} />
								<AccLinkRow
									url="/account/url"
									menu="Url personalizada"
									value={`homelibraries.org/${username}`} />
								<AccLinkRow
									url="/account/address"
									menu="Endereço"
									value="Rod Amaro Antonio Vieira" />
								<AccLinkRow
									url="/account/map"
									menu="Sua localização no mapa" />
							</div>
						</div>
					</div>
				</div>
				<div className="grid-container smaller-grid-container">
					<div className="grid-x grid-padding-x">
						<div className="small-12 cell" styleName="title">CONTA</div>
					</div>
				</div>
				<div className="grid-container fluid full" styleName="white-container">
					<div className="grid-container smaller-grid-container">
						<div className="grid-x grid-padding-x">
							<div className="cell">
								<AccLinkRow
									url="/account/email"
									menu="E-mail"
									value={email} />
								<AccLinkRow
									url="/account/password"
									menu="Senha"
									value="****" />
								{/*
								<AccLinkRow
									url="/account/language"
									menu="Idioma"
									value="Português/Brasil" />
								*/}
							</div>
						</div>
					</div>
				</div>
				<div className="grid-container smaller-grid-container">
					<div className="grid-x grid-padding-x">
						<div className="small-12 cell" styleName="title">SAIR</div>
					</div>
				</div>
				<div className="grid-container fluid full" styleName="white-container">
					<div className="grid-container smaller-grid-container">
						<div className="grid-x grid-padding-x">
							<div className="cell">
								<AccLinkRow
									url="/sign/out"
									menu="Sair" />
								<AccLinkRow
									url="/account/delete"
									menu="Apagar conta" />
							</div>
						</div>
					</div>
				</div>
			</>
		</RequestsWrapper>
	);
};

const _Account = CSSModules(Account, styles, { allowMultiple: true });
const mapStateToProps = props => buildMapStateToProps(props);
const mapDispatchToProps = dispatch => buildmapDispatchToProps(dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(_Account);
