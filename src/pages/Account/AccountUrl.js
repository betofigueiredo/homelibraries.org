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
 * @name AccountUrl
 * @description Container para a url /account/url
 * @example
 */

// Components
import RequestsWrapper from '../../hocs/RequestsWrapper/RequestsWrapper';
import InputTextWithIcon from '../../components/_inputs/InputTextWithIcon/InputTextWithIcon';

// Functions
import { _post } from '../../functions/_requests';
import { setValueLocalstorageUser } from '../../functions/_getLocalstorageData';

class AccountUrl extends Component {
	state = {
		username: this.props.user.username || '',
	};

	handleFields = (field, value) => {
		this.setState({ [field]: value });
	}

	saveUsername = () => {
		// this.setState({ saving: 1 });
		const { updateUserRaw, history } = this.props;
		const { username } = this.state;
		_post('/user/update', { username }).then(() => {
			setValueLocalstorageUser('username', username);
			updateUserRaw({ username });
			history.push('/account');
		}).catch(() => {
			// this.setState({ saving: 3 });
		});
	}

	render() {
		const { username } = this.state;

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
								<InputTextWithIcon
									label="Url personalizada"
									icon="homelibraries.org/"
									field="username"
									default_value={username}
									updateFunc={this.handleFields} />
							</div>
							<div className="cell">
								<button
									type="button"
									className="button"
									onClick={this.saveUsername}>
									Salvar
								</button>
							</div>
						</div>
					</div>
				</>
			</RequestsWrapper>
		);
	}
}

AccountUrl.propTypes = {
	// =========== store
	user: PropTypes.object.isRequired,
	// =========== funcs
	updateUserRaw: PropTypes.func.isRequired,
	// =========== router
	// match: PropTypes.object.isRequired,
	// history: PropTypes.object.isRequired,
};

const _AccountUrl = CSSModules(AccountUrl, styles, { allowMultiple: true });
const mapStateToProps = props => buildMapStateToProps(props);
const mapDispatchToProps = dispatch => buildmapDispatchToProps(dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(_AccountUrl);
