import React, { Component, PropTypes } from 'react';
import ReactDOM, { render } from 'react-dom';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';

// components
import ActionBar from './Navigation/ActionBar';
import NavigationBar from './Navigation/NavigationBar';
import Search from './Search';
import Profile from './Profile';
// import Libraries from './Libraries';

// map style
import light_and_clean from '../styles/map/light-and-clean';

class LibrariesNProfiles extends Component {
    constructor() {
        super();
        this._setMap = this._setMap.bind(this);
        this._setMarkers = this._setMarkers.bind(this);
        this._setPage = this._setPage.bind(this);
        this._handleInfoWindow = this._handleInfoWindow.bind(this);
        this._setMapItems = this._setMapItems.bind(this);
        this._reSetMapClick = this._reSetMapClick.bind(this);
        this._setMapListeners = this._setMapListeners.bind(this);
        this._backToMyLocation = this._backToMyLocation.bind(this);

        this.infoWindowShow = false;
        // Get map local state
        this.mapState = 0;
        this.markers = [];
        // Get profile local state
        this.profileState = 0;
        // Local state
        this.state = {
			preview: {
				open: 'library-info-window',
				name: '',
				url: '',
				number_of_books: 0
			},
			zoom: 13
		};
    }

    _reSetMapClick(lat, lng) {
		const searchRadius = this.props.libraries.search.radius || 5;
		const searchBookAuthor = this.props.libraries.search.book_author;
		const searchLibrary = this.props.libraries.search.library;
		const searchLfl = this.props.libraries.search.lfl;

		this.map.panTo({lat: lat, lng: lng});
		this._setMapItems(lat, lng);
		this.props.getLibraries(
			lat,
			lng,
			searchRadius,
			searchBookAuthor,
			searchLibrary,
			searchLfl
		);
		if (this.markers.length > 0) {
			for (let i = 0; i < this.markers.length; i++) {
				this.markers[i].setMap(null);
			}
		}
		this.markers = [];
		this._setMarkers();
    }

    _setMapItems(lat, lng) {
    	if (this.circle) { this.circle.setMap(null); this.circleCenterMarker.setMap(null); }
    	// Center marker
		this.circleCenterMarker = new google.maps.Marker({
			position: { lat: lat, lng: lng },
			map: this.map,
			icon: '/assets/images/center-marker.png',
			zIndex: 0
		});
		// Circle
    	const radius = parseInt(this.props.libraries.search.radius) * 1000;
		this.circle = new google.maps.Circle({
			strokeColor: '#51dd9f',
			strokeOpacity: 0.5,
			strokeWeight: 0.8,
			fillColor: '#ffffff',
			fillOpacity: 0.3,
			map: this.map,
			center: { lat: lat, lng: lng },
			radius: radius,
			zIndex: -1
		});
		this.circle.addListener('click', () => {
			for (let i = 0; i < this.markers.length; i++) {
				this.markers[i].setIcon('/assets/images/marker-green.png');
				this.markers[i].setZIndex(1);
			}
	    	this.setState({
				preview: {
					open: 'library-info-window',
					name: '',
					url: '',
					number_of_books: 0
				}
	    	});
		});
		this.circle.addListener('dblclick', (event) => {
			this._reSetMapClick(event.latLng.lat(), event.latLng.lng());
		});
		// this.circle.addListener('mousedown', (event) => {
		// 	this.changeSearchClickHold = window.setTimeout(() => {
		// 		this._reSetMapClick(event.latLng.lat(), event.latLng.lng());
		// 	}, 2300);
		// });
		// this.circle.addListener('mouseup', (event) => {
		// 	window.clearTimeout(this.changeSearchClickHold);
		// });
    }

    _setMapListeners() {
		this.map.addListener('click', () => {
			for (let i = 0; i < this.markers.length; i++) {
				this.markers[i].setIcon('/assets/images/marker-green.png');
				this.markers[i].setZIndex(1);
			}
	    	this.setState({
				preview: {
					open: 'library-info-window',
					name: '',
					url: '',
					number_of_books: 0
				}
	    	});
		});
		this.map.addListener('zoom_changed', () => {
			this.setState({ zoom: this.map.getZoom() });
		});
		this.map.addListener('dblclick', (event) => {
			this._reSetMapClick(event.latLng.lat(), event.latLng.lng());
		});
		// this.map.addListener('mousedown', (event) => {
		// 	this.changeSearchClickHold = window.setTimeout(() => {
		// 		this._reSetMapClick(event.latLng.lat(), event.latLng.lng());
		// 	}, 2300);
		// });
		// this.map.addListener('mouseup', () => {
		// 	window.clearTimeout(this.changeSearchClickHold);
		// });
    }

    _backToMyLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position) => {
				this._reSetMapClick(position.coords.latitude, position.coords.longitude);
			}, function() {
				// handleLocationError(true, infoWindow, this.map.getCenter());
			});
		} else {
			// Browser doesn't support Geolocation
			// handleLocationError(false, infoWindow, this.map.getCenter());
		}
    }

    _setMap() {
		this.map = new google.maps.Map(this.refs.librariesMap, {
			center: {lat: -23.991506, lng: -46.258046},
			disableDoubleClickZoom: true,
			zoom: this.state.zoom
		});
		this.map.setOptions({styles: light_and_clean});

		const searchAddress = this.props.libraries.search.address;
		const searchLat = this.props.libraries.search.lat;
		const searchLng = this.props.libraries.search.lng;
		const searchRadius = this.props.libraries.search.radius || 5;
		const searchBookAuthor = this.props.libraries.search.book_author;
		const searchLibrary = this.props.libraries.search.library;
		const searchLfl = this.props.libraries.search.lfl;

		if (searchAddress == '' && searchLat == '' && searchLng == '') {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition((position) => {
					var pos = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					this.map.setCenter(pos);
					this._setMapItems(position.coords.latitude, position.coords.longitude);
					this._setMapListeners();
					this.props.getLibraries(
						position.coords.latitude,
						position.coords.longitude,
						searchRadius,
						searchBookAuthor,
						searchLibrary,
						searchLfl
					);
				}, function() {
					// handleLocationError(true, infoWindow, this.map.getCenter());
				});
			} else {
				// Browser doesn't support Geolocation
				// handleLocationError(false, infoWindow, this.map.getCenter());
			}
		} else {

			const searchRadius = this.props.libraries.search.radius || 5;
			const searchBookAuthor = this.props.libraries.search.book_author;
			const searchLibrary = this.props.libraries.search.library;
			const searchLfl = this.props.libraries.search.lfl;

			if (searchAddress != '') {
				this.geocoder = new google.maps.Geocoder();
				this.geocoder.geocode({'address': searchAddress}, (results, status) => {
					if (status == google.maps.GeocoderStatus.OK) {
						this.map.setCenter(results[0].geometry.location);
						this._setMapItems(results[0].geometry.location.lat(), results[0].geometry.location.lng());
						this._setMapListeners();
						this.props.getLibraries(
							results[0].geometry.location.lat(),
							results[0].geometry.location.lng(),
							searchRadius,
							searchBookAuthor,
							searchLibrary,
							searchLfl
						);
						this.markers = [];
					} else {
						alert("Geocode was not successful for the following reason: " + status);
					}
				});
			} else {
				var pos = {
					lat: this.props.libraries.search.lat,
					lng: this.props.libraries.search.lng
				};
				this.map.setCenter(pos);
				this._setMapItems(this.props.libraries.search.lat, this.props.libraries.search.lng);
				this._setMapListeners();
				this.props.getLibraries(
					this.props.libraries.search.lat,
					this.props.libraries.search.lng,
					searchRadius,
					searchBookAuthor,
					searchLibrary,
					searchLfl
				);
				this.markers = [];
			}
		}
    }

    _setMarkers() {
    	this.markers = [];
        if (this.props.libraries.loading === 0 || this.props.libraries.loading === 1 || this.props.libraries.loading === 4) {
            // console.log('Loading libraries...');
        }
        // Handle error here!
        else {
        	// console.log('Libraries loaded!');
			this.props.libraries.data.map((library, i) => {
				// Set marker
				const marker = new google.maps.Marker({
					position: { lat: library.address.lat, lng: library.address.lng },
					map: this.map,
		    		animation: google.maps.Animation.DROP,
					icon: library.marker,
					libraryKey: i,
					zIndex: 1
				});
				// Add click event
				marker.addListener('click', () => {
					// Change markers icon
					for (let i = 0; i < this.markers.length; i++) {
						this.markers[i].setIcon('/assets/images/marker-greyer.png');
						this.markers[i].setZIndex(1);
					}
					marker.setIcon('/assets/images/marker-green.png');
					marker.setZIndex(2);
					// Info window
					this._handleInfoWindow(marker.libraryKey);
					// Center on marker
					this.map.panTo(marker.getPosition());
				});
				this.markers.push(marker);
	        });
	        
        }
    }

    _handleInfoWindow(i) {
    	this.setState({
			preview: {
				open: 'library-info-window open',
				name: this.props.libraries.data[i].name,
				url: `/${this.props.libraries.data[i].url}`,
				number_of_books: this.props.libraries.data[i].number_of_books
			}
    	});
    }

    _setPage(page, username) {
	    switch(page) {
	        case 'libraries':
	        	// Libraries
				if (this.mapState == 0 || this.props.libraries.loading === 4) {
					this._setMap();
					this.mapState = 1;
				}
				if (this.markers.length == 0) {
					this._setMarkers();
				}
				// Profile
	            this.profileState = 0;
	            break;
	        case '*':
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

    componentDidMount() {
		const page = this.props.routes[1].path;
		const username = this.props.location.pathname;
		this._setPage(page, username);
		// window resize
		window.onresize = function(event) {
		    document.getElementById('librariesMap').style.height = window.innerHeight;
		};
    }

	componentDidUpdate() {
		const page = this.props.routes[1].path;
		const username = this.props.location.pathname;
		this._setPage(page, username);
	}

	render() {
		const page = this.props.routes[1].path;
		let profileClass;
		let searchClass;

	    switch(page) {
	        case 'libraries':
	            profileClass = 'profile-wrapper hidden';
	            searchClass = 'search-wrapper hidden';
	            break;

	        case '*':
	            profileClass = 'profile-wrapper';
	            searchClass = 'search-wrapper hidden';
	            break;

	        case 'search':
	            profileClass = 'profile-wrapper hidden';
	            searchClass = 'search-wrapper';
	            break;
	    }

		return (
			<div className="libraries-wrapper">
				<ActionBar {...this.props} />
				<NavigationBar {...this.props} />
				<Search {...this.props} wrapperClass={searchClass} />
				<Profile {...this.props} wrapperClass={profileClass} />

				<div className={this.state.preview.open}>
					<div className="library-info-window-content">
						<div className="library-name">{this.state.preview.name}</div>
						<div className="library-n-books">{this.state.preview.number_of_books >= 2
							? `${this.state.preview.number_of_books} livros`
								: `${this.state.preview.number_of_books} livro`}</div>
					</div>
					<div className="library-info-window-button">
						<Link to={this.state.preview.url}>
							<button className="button small gradient-1 see-profile">Ver mais</button>
						</Link>
					</div>
				</div>
				<button className="my-location-button" onClick={this._backToMyLocation}><i className="fa fa-location-arrow" aria-hidden="true"></i></button>
				<Link to="/search/"><button className="search-button"><i className="fa fa-search" aria-hidden="true"></i></button></Link>
				<div ref="librariesMap" id="librariesMap" className="libraries-map"></div>
			</div>
		);
	}
}

export default LibrariesNProfiles;
