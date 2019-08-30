import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import uuidv1 from 'uuid/v1';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

class Markers extends Component {
	state = {
		markers: [],
	};

	componentDidMount() {
		this.drawMarkers();
		// const uuidv1asdasd = uuidv1();
	}

	componentDidUpdate(prevProps) {
		const { markers } = this.state;
		const prev_markers = JSON.stringify(prevProps.libraries.all_ids);
		const next_markers = JSON.stringify(this.props.libraries.all_ids);

		if (prev_markers !== next_markers) {
			for (let i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
			this.drawMarkers();
		}
	}

	drawMarkers() {
		this.setState({ markers: [] });
		const { libraries, map, updateLibrariesRaw } = this.props;
		const all_ids = libraries.all_ids || [];
		const by_id = libraries.by_id || {};
		const markers = [];

		for (let i = 0; i < all_ids.length; i++) {
			const library_id = all_ids[i];
			const library = by_id[library_id];

			// Set marker
			const marker = new window.google.maps.Marker({
				position: { lat: library.address.lat, lng: library.address.lng },
				map,
				animation: window.google.maps.Animation.DROP,
				icon: library.icon,
				libraryKey: library_id,
				zIndex: 1,
			});

			// Add click event
			marker.addListener('click', () => {
				// Info window
				updateLibrariesRaw({
					profile_preview_id: marker.libraryKey,
				});
				// Center on marker
				map.panTo(marker.getPosition());
			});

			markers.push(marker);
		}

		this.setState({ markers });
	}

	render() {
		return (
			<div />
		);
	}
}

Markers.propTypes = {
	map: PropTypes.object,
	libraries: PropTypes.object,
	updateLibrariesRaw: PropTypes.func,
};

Markers.defaultProps = {
	map: {},
	libraries: {},
	updateLibrariesRaw: () => {},
};

export default CSSModules(Markers, styles, { allowMultiple: true });
