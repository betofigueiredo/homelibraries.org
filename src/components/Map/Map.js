import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import Markers from './Markers';

// functions
import { addCircleRadius } from './subfunctions/addCircleRadius';

// map style
import light_and_clean from '../../styles/map/light-and-clean';

/* eslint-disable */

class Map extends Component {
	// static getDerivedStateFromProps(nextProps) {
	// 	const { search } = nextProps;
	// 	return { radius: search.radius };
	// }

	state = {
		map_height: 500,
		lat: -23.991506,
		lng: -46.258046,
		zoom: this.props.map_data.zoom,
		// radius: 5,
	};

	componentDidMount() {
		window.addEventListener('resize', this.handleDimensions);
		this.initLatLng();
		this.handleDimensions();
	}

	// shouldComponentUpdate() {
	// 	return false;
	// }

	componentDidUpdate(prevProps, prevState) {
		const { search: prev_search } = prevProps;
		const { search } = this.props;
		const { lat, lng } = search;

		if (prev_search.radius !== search.radius) {
			this.circle.setMap(null);
			this.drawCircle(lat, lng);
		}

		if (
			(prev_search.lat !== lat || prev_search.lng !== lng)
			&& this.map !== undefined
		) {
			this.map.panTo({ lat, lng });
			this.drawCenterIcon(lat, lng);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleDimensions);
	}

	handleDimensions = () => {
		const map_element = document.getElementById('map_element');
		const parent_element = (map_element || {}).parentElement;

		if (parent_element) {
			const parent_height = parent_element.offsetHeight || 0;
			this.setState({ map_height: parent_height });
		}
	}

	initLatLng() {
		const { map_data } = this.props;
		const { lat, lng } = map_data;

		if (window.navigator.geolocation && (lat === 0 || lng === 0)) {
			window.navigator.geolocation.getCurrentPosition(position => {
				const { latitude, longitude } = position.coords;
				// this.setState(
				// 	{ lat: latitude, lng: longitude },
				// 	this.drawMap,
				// );
				this.drawMap();
			}, () => {
				this.drawMap();
			});
		} else {
			this.drawMap();
		}
	}

	drawMap() {
		const { map_data, search, getLibraries } = this.props;
		const { zoom } = map_data;
		const { lat, lng, radius } = search;
		getLibraries({ lat, lng, radius });
		const map_element = document.getElementById('map_element');

		if (!map_element || window.google === undefined) {
			return;
		}

		this.map = new window.google.maps.Map(map_element, {
			center: { lat, lng },
			disableDoubleClickZoom: true,
			zoom,
			backgroundColor: '#f5f8fa',
		});
		this.map.setOptions({ styles: light_and_clean });
		this.drawCenterIcon(lat, lng);
	}

	drawCenterIcon(lat, lng) {
		if (this.circle) {
			this.circle.setMap(null);
			this.circleCenterMarker.setMap(null);
		}
		this.circleCenterMarker = new window.google.maps.Marker({
			position: { lat, lng },
			map: this.map,
			icon: '/images/center-marker.png',
			zIndex: 0,
		});
		this.drawCircle(lat, lng);
	}

	drawCircle(lat, lng) {
		const { draw_circle, search } = this.props;
		if (draw_circle) {
			const { radius } = search;
			this.circle = addCircleRadius(this.map, lat, lng, radius);
		}
		this.addMapListeners();
	}

	addMapListeners() {
		this.map.addListener('zoom_changed', () => {
			this.handleZoom();
		});
		this.map.addListener('dblclick', (e) => {
			this.handleDblClick(e.latLng.lat(), e.latLng.lng());
		});
		this.circle.addListener('dblclick', (e) => {
			this.handleDblClick(e.latLng.lat(), e.latLng.lng());
		});
		// this.map.addListener('click', () => {
		// 	for (let i = 0; i < this.state.markers.length; i++) {
		// 		this.state.markers[i].setIcon('/images/marker-green.png');
		// 		this.state.markers[i].setZIndex(1);
		// 	}
		// 	this.setState({
		// 		preview: {
		// 			open: 'library-info-window',
		// 			name: '',
		// 			url: '',
		// 			number_of_books: 0,
		// 		},
		// 	});
		// });
	}

	handleZoom() {
		const { updateMapRaw } = this.props;
		const zoom = this.map.getZoom();
		updateMapRaw({ zoom });
	}

	handleDblClick(lat, lng) {
		const { search, getLibraries, updateMapRaw } = this.props;
		const { radius } = search;
		this.map.panTo({ lat, lng });
		getLibraries({ lat, lng, radius });
		this.drawCenterIcon(lat, lng);
		updateMapRaw({ lat, lng });
	}

	render() {
		const { map_height } = this.state;
		const { libraries, updateLibrariesRaw } = this.props;

		return (
			<>
				<div id="map_element" styleName="map-element" style={{ height: map_height }} />
				<Markers
					map={this.map}
					libraries={libraries}
					updateLibrariesRaw={updateLibrariesRaw} />
			</>
		);
	}
}

Map.propTypes = {
	map_data: PropTypes.object,
	libraries: PropTypes.object,
	draw_circle: PropTypes.bool,
	getLibraries: PropTypes.func,
	search: PropTypes.object,
	updateLibrariesRaw: PropTypes.func,
	updateMapRaw: PropTypes.func,
};

Map.defaultProps = {
	map_data: {
		zoom: 13,
		radius: 5,
		lat: -23.991506,
		lng: -46.258046,
		address: '',
		book_author: '',
		library: '',
		preview: {
			open: 'library-info-window',
			name: '',
			url: '',
			number_of_books: 0,
		},
	},
	search: {},
	libraries: {},
	draw_circle: false,
	getLibraries: () => {},
	updateLibrariesRaw: () => {},
	updateMapRaw: () => {},
};

export default CSSModules(Map, styles, { allowMultiple: true });
