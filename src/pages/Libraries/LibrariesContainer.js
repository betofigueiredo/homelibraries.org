import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { buildMapStateToProps, buildmapDispatchToProps } from '../../store/reduxDispatchs';

// Redux HOC
import withStore from '../../store/withStore';

// Components
import LayoutWrapper from '../../components/LayoutWrapper';
import Libraries from './Libraries';

// Functions
// import { _get } from '../../functions/_requests';
// import { buildLibraries } from '../../store/libraries/utils';

class LibrariesContainer extends Component {
	state = {
		fetching: 0,
	};

	componentWillUnmount() {
		/**
		 * Remove all markers to load new ones
		 * on the next mount
		 */
		const { updateLibrariesRaw } = this.props;
		updateLibrariesRaw({
			by_id: {},
			all_ids: [],
			profile_preview_id: 0,
		});
	}

	openSearch = () => {
		const { updateSearchRaw } = this.props;
		updateSearchRaw({ open: true });
	}

	// receiveLatLng = (lat, lng) => {
	// 	/**
	// 	 * Wait for lat and lng to be set on the map
	// 	 */
	// 	const { updateLibrariesRaw } = this.props;
	// 	updateLibrariesRaw({ all_ids: [] });
	// 	this.requestLibraries(lat, lng);
	// }

	// requestLibraries(lat, lng) {
	// 	const { radius } = this.props.libraries.search;
	// 	const params = { lat, lng, radius };
	// 	_get('/libraries/all', params).then(response => {
	// 		const { updateLibrariesRaw } = this.props;
	// 		const libs_byid_and_allids = buildLibraries(response.data);
	// 		updateLibrariesRaw({
	// 			by_id: libs_byid_and_allids[0],
	// 			all_ids: libs_byid_and_allids[1],
	// 		});
	// 	}).catch(error => {
	// 		console.log(error);
	// 	});
	// }

	render() {
		return (
			<LayoutWrapper
				fetching={20}
				{...this.props}>

				<Libraries
					{...this.state}
					{...this.props}
					openSearch={this.openSearch} />

			</LayoutWrapper>
		);
	}
}

LibrariesContainer.propTypes = {
	// =========== store
	libraries: PropTypes.object.isRequired,
	// =========== funcs
	updateUserRaw: PropTypes.func.isRequired,
	updateLibrariesRaw: PropTypes.func.isRequired,
	updateMapRaw: PropTypes.func.isRequired,
	updateSearchRaw: PropTypes.func.isRequired,
	// =========== router
	// match: PropTypes.object.isRequired,
	// history: PropTypes.object.isRequired,
};

const mapStateToProps = (props) => buildMapStateToProps(props);
const mapDispatchToProps = (dispatch) => buildmapDispatchToProps(dispatch);
export default withStore(connect(mapStateToProps, mapDispatchToProps)(LibrariesContainer));
