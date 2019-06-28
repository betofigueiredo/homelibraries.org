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
 * @name AccountMap
 * @description Container para a url /account/map
 * @example
 */

// Components
import RequestsWrapper from '../../hocs/RequestsWrapper/RequestsWrapper';
import Map from '../../components/Map/Map';

class AccountMap extends Component {
	state = {};

	render() {
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
					<div className="grid-container fluid full">
						<div className="grid-x">
							<div className="cell">
								<Map />
							</div>
						</div>
					</div>
				</>
			</RequestsWrapper>
		);
	}
}

AccountMap.propTypes = {
	// =========== store
	user: PropTypes.object.isRequired,
	// =========== funcs
	updateUserRaw: PropTypes.func.isRequired,
	// =========== router
	// match: PropTypes.object.isRequired,
	// history: PropTypes.object.isRequired,
};

const _AccountMap = CSSModules(AccountMap, styles, { allowMultiple: true });
const mapStateToProps = props => buildMapStateToProps(props);
const mapDispatchToProps = dispatch => buildmapDispatchToProps(dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(_AccountMap);
