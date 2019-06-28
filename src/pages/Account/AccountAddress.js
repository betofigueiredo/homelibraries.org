import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Redux
import { buildMapStateToProps, buildmapDispatchToProps } from '../../store/reduxDispatchs';

/**
 * @render react
 * @name AccountAdress
 * @description Container para a url /account/address
 * @example
 */

// Components
import RequestsWrapper from '../../hocs/RequestsWrapper/RequestsWrapper';
import InputText from '../../components/_inputs/InputText/InputText';
import Button from '../../components/Button/Button';

// Functions
import { _post } from '../../functions/_requests';
import { setValueLocalstorageUser } from '../../functions/_getLocalstorageData';

class AccountAdress extends Component {
	state = {
		name: this.props.user.name || '',
		saving: 0,
	};

	handleFields = (field, value) => {
		this.setState({ [field]: value });
	}

	saveName = () => {
		this.setState({ saving: 1 });
		const { updateUserRaw, history } = this.props;
		const { name } = this.state;
		_post('/user/update', { name }).then(() => {
			setValueLocalstorageUser('name', name);
			updateUserRaw({ name });
			history.push('/account');
		}).catch(() => {
			this.setState({ saving: 3 });
		});
	}

	render() {
		const { name, saving } = this.state;

		return (
			<RequestsWrapper {...this.props}>
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
							<div className="cell">
								<InputText
									label="Seu nome"
									field="name"
									default_value={name}
									updateFunc={this.handleFields} />
							</div>
							<div className="cell">
								<Button
									text="Salvar"
									loading={saving}
									onClick={this.saveName} />
							</div>
						</div>
					</div>
					{/*
					<Map
						map_data={map}
						receiveLatLng={receiveLatLng}
						draw_circle
						libraries={libraries}
						updateLibrariesRaw={updateLibrariesRaw}
						updateMapRaw={updateMapRaw} />
					*/}
				</>
			</RequestsWrapper>
		);
	}
}

AccountAdress.propTypes = {
	// =========== store
	user: PropTypes.object.isRequired,
	map: PropTypes.object.isRequired,
	// =========== funcs
	updateUserRaw: PropTypes.func.isRequired,
	// =========== router
	// match: PropTypes.object.isRequired,
	// history: PropTypes.object.isRequired,
};

const _AccountAdress = CSSModules(AccountAdress, styles, { allowMultiple: true });
const mapStateToProps = props => buildMapStateToProps(props);
const mapDispatchToProps = dispatch => buildmapDispatchToProps(dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(_AccountAdress);
