import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { buildMapStateToProps, buildmapDispatchToProps } from '../../store/reduxDispatchs';

/**
 * @render react
 * @name LibrariesContainer
 * @description Container para a url /libraries
 * @example
 */

// Components
// import RequestsWrapperFuture from '../../hocs/RequestsWrapper/RequestsWrapperFuture';
import Libraries from './Libraries';

// Functions
import { _get } from '../../functions/_requests';

// map style
import light_and_clean from '../../styles/map/light-and-clean';

class LibrariesContainer extends Component {
	// static getDerivedStateFromProps(nextProps, prevState) {
	// 	const { match } = nextProps;
	// 	let id = match.params.id || '';
	// 	let urls_to_fetch = [];
	// 	if (prevState.id === '' || match.params.id !== prevState.id) {
	// 		id = match.params.id || '';
	// 		urls_to_fetch = [`/v2/compras/${match.params.id}`];
	// 	}
	// 	document.title = `#${id} - Compra - Conaz`;
	// 	return { id, urls_to_fetch };
	// }

	state = {
		id: '',
		urls_to_fetch: [],
		markers: [],
		preview: {
			open: 'library-info-window',
			name: '',
			url: '',
			number_of_books: 0,
		},
		zoom: 13,
	};

	// componentDidMount() {
	// 	/**
	// 	 * GoogleAnalytics
	// 	 */
	// 	// window.ga('set', 'page', window.location.pathname + window.location.search);
	// 	// window.ga('send', 'pageview');
	// 	/**
	// 	 * Set page title
	// 	 */
	// 	document.title = 'Bibliotecas - Home Libraries';
	// }

	componentDidMount() {
		// const page = this.props.routes[1].path;
		// const username = this.props.location.pathname;
		// this._setPage(page, username);
		this._setMap();
		// window resize
		window.addEventListener('resize', this.setSizesOnChanges);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.setSizesOnChanges);
	}

	setSizesOnChanges = () => {
		const map_elem = document.getElementById('libraries_map');
		if (map_elem) {
			map_elem.style.height = window.innerHeight;
		}
	}

	getLibraries = (lat, lng, radius, bookauthor, libraries, lfl) => {
		const params = { lat, lng, radius, bookauthor, libraries, lfl };
		_get('/requests/libraries', params).then(response => {
			console.log(response);
		}).catch(error => {
			console.log(error);
		});
	}

	_backToMyLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				this._reSetMapClick(position.coords.latitude, position.coords.longitude);
			}, () => {
				// handleLocationError(true, infoWindow, this.map.getCenter());
			});
		} else {
			// Browser doesn't support Geolocation
			// handleLocationError(false, infoWindow, this.map.getCenter());
		}
	}

	_setMap() {
		const { zoom } = this.state;
		const { libraries } = this.props;
		const elem = document.getElementById('libraries_map');

		if (!elem || window.google === undefined) {
			return;
		}

		this.map = new window.google.maps.Map(document.getElementById('libraries_map'), {
			center: { lat: -23.991506, lng: -46.258046 },
			disableDoubleClickZoom: true,
			zoom,
		});
		this.map.setOptions({ styles: light_and_clean });

		const { address, lat, lng, book_author, library, lfl } = libraries.search;
		const radius = libraries.search.radius || 5;

		if (address === '' && lat === 0 && lng === 0) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(position => {
					const pos = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};
					this.map.setCenter(pos);
					this._setMapItems(position.coords.latitude, position.coords.longitude);
					this._setMapListeners();
					this.getLibraries(lat, lng, radius, book_author, library, lfl);
				}, () => {
					// handleLocationError(true, infoWindow, this.map.getCenter());
				});
			} else {
				console.log('asdasd');
				// Browser doesn't support Geolocation
				// handleLocationError(false, infoWindow, this.map.getCenter());
			}

			return;
		}

		if (address !== '') {
			this.geocoder = new window.google.maps.Geocoder();
			this.geocoder.geocode({ address }, (results, status) => {
				if (status === window.google.maps.GeocoderStatus.OK) {
					const geo_lat = results[0].geometry.location.lat();
					const geo_lng = results[0].geometry.location.lng();
					this.map.setCenter(results[0].geometry.location);
					this._setMapItems(geo_lat, geo_lng);
					this._setMapListeners();
					this.getLibraries(geo_lat, geo_lng, radius, book_author, library, lfl);
					this.setState({ markers: [] });
				} else {
					alert(`Geocode was not successful for the following reason: ${status}`);
				}
			});
		} else {
			const pos = {
				lat,
				lng,
			};
			this.map.setCenter(pos);
			this._setMapItems(lat, lng);
			this._setMapListeners();
			this.getLibraries(lat, lng, radius, book_author, library, lfl);
			this.setState({ markers: [] });
		}
	}

	_reSetMapClick(lat, lng) {
		const { markers } = this.state;
		const { libraries } = this.props;
		const { book_author, library, lfl } = libraries.search;
		const radius = libraries.search.radius || 5;
		this.map.panTo({ lat, lng });
		this._setMapItems(lat, lng);
		this.getLibraries(lat, lng, radius, book_author, library, lfl);
		if (markers.length > 0) {
			for (let i = 0; i < markers.length; i++) {
				markers[i].setMap(null);
			}
		}
		this._setMarkers();
	}

	_setMapItems(lat, lng) {
		if (this.circle) { this.circle.setMap(null); this.circleCenterMarker.setMap(null); }
		// Center marker
		this.circleCenterMarker = new window.google.maps.Marker({
			position: { lat, lng },
			map: this.map,
			icon: '/images/center-marker.png',
			zIndex: 0,
		});
		// Circle
		const radius = parseInt(this.props.libraries.search.radius, 0) * 1000;
		this.circle = new window.google.maps.Circle({
			strokeColor: '#51dd9f',
			strokeOpacity: 0.5,
			strokeWeight: 0.8,
			fillColor: '#ffffff',
			fillOpacity: 0.3,
			map: this.map,
			center: { lat, lng },
			radius,
			zIndex: -1,
		});
		this.circle.addListener('click', () => {
			for (let i = 0; i < this.state.markers.length; i++) {
				this.state.markers[i].setIcon('/images/marker-green.png');
				this.state.markers[i].setZIndex(1);
			}
			this.setState({
				preview: {
					open: 'library-info-window',
					name: '',
					url: '',
					number_of_books: 0,
				},
			});
		});
		this.circle.addListener('dblclick', (event) => {
			this._reSetMapClick(event.latLng.lat(), event.latLng.lng());
		});
	}

	_setMapListeners() {
		this.map.addListener('click', () => {
			for (let i = 0; i < this.state.markers.length; i++) {
				this.state.markers[i].setIcon('/images/marker-green.png');
				this.state.markers[i].setZIndex(1);
			}
			this.setState({
				preview: {
					open: 'library-info-window',
					name: '',
					url: '',
					number_of_books: 0,
				},
			});
		});
		this.map.addListener('zoom_changed', () => {
			this.setState({ zoom: this.map.getZoom() });
		});
		this.map.addListener('dblclick', (event) => {
			this._reSetMapClick(event.latLng.lat(), event.latLng.lng());
		});
	}

	/* eslint-disable */
	_setMarkers() {
		this.setState({ markers: [] });
		const { loading_libraries } = this.state;

		if (loading_libraries === 2) {
			this.props.libraries.data.map((library, i) => {
				// Set marker
				const marker = new window.google.maps.Marker({
					position: { lat: library.address.lat, lng: library.address.lng },
					map: this.map,
					animation: window.google.maps.Animation.DROP,
					icon: library.marker,
					libraryKey: i,
					zIndex: 1,
				});
				// Add click event
				marker.addListener('click', () => {
					// Change markers icon
					for (let i2 = 0; i2 < this.state.markers.length; i2++) {
						this.state.markers[i2].setIcon('/images/marker-greyer.png');
						this.state.markers[i2].setZIndex(1);
					}
					marker.setIcon('/images/marker-green.png');
					marker.setZIndex(2);
					// Info window
					this._handleInfoWindow(marker.libraryKey);
					// Center on marker
					this.map.panTo(marker.getPosition());
				});
				this.state.markers.push(marker);
			});
		}
	}

	_handleInfoWindow(i) {
		this.setState({
			preview: {
				open: 'library-info-window open',
				name: this.props.libraries.data[i].name,
				url: `/${this.props.libraries.data[i].url}`,
				number_of_books: this.props.libraries.data[i].number_of_books,
			},
		});
	}

	_setPage(page, username) {
		switch (page) {
		case 'libraries':
			// Libraries
			if (this.mapState === 0 || this.props.libraries.loading === 4) {
				this._setMap();
				this.mapState = 1;
			}
			if (this.state.markers.length === 0) {
				this._setMarkers();
			}
			// Profile
			this.profileState = 0;
			break;
		case '*':
		default:
			// Profile
			if (this.profileState === 0) {
				console.log(username);
				this.props.getProfiles(username);
				this.profileState = 1;
			}
			break;
		case 'search':
			// Profile
			this.profileState = 0;
			break;
		}
	}

	// componentDidUpdate() {
	// 	const page = this.props.routes[1].path;
	// 	const username = this.props.location.pathname;
	// 	this._setPage(page, username);
	// }

	render() {
		return (
			<Libraries
				{...this.state}
				{...this.props}
				_backToMyLocation={this._backToMyLocation} />
		);
	}


	// render() {
	// 	const { urls_to_fetch } = this.state;

	// 	return (
	// 		<RequestsWrapperFuture
	// 			urls_to_fetch={urls_to_fetch}
	// 			handleResponses={this.handleResponses}
	// 			{...this.props}>

	// 			<Libraries
	// 				{...this.state}
	// 				{...this.props} />

	// 		</RequestsWrapperFuture>
	// 	);
	// }
}

LibrariesContainer.propTypes = {
	// =========== store
	// compras: PropTypes.object.isRequired,
	// =========== funcs
	// updateUi: PropTypes.func.isRequired,
	updateLibrariesRaw: PropTypes.func.isRequired,
	// =========== router
	// match: PropTypes.object.isRequired,
	// history: PropTypes.object.isRequired,
};

const mapStateToProps = props => buildMapStateToProps(props);
const mapDispatchToProps = dispatch => buildmapDispatchToProps(dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(LibrariesContainer);
