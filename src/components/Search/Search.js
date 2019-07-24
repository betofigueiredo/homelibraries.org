import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import SideBar from '../SideBar';
import InputText from '../_inputs/InputText/InputText';
import Button from '../Button/Button';
import RadiusButton from './RadiusButton';

// Functions
// import { _get } from '../../functions/_requests';

class Search extends Component {
	static getDerivedStateFromProps(nextProps) {
		const { search } = nextProps;
		const { lat, lng } = search;
		return { lat, lng };
	}

	state = {
		address: this.props.search.address,
		lat: 0,
		lng: 0,
		radius: 5,
		author_name: this.props.search.author_name,
		library_name: this.props.search.library_name,
	};

	closeSearch = () => {
		const { updateSearchRaw } = this.props;
		updateSearchRaw({ open: false });
	}

	handleEdition = (values) => {
		this.setState(values);
	}

	handleAddressFirst = () => {
		const { updateLibrariesRaw } = this.props;
		updateLibrariesRaw({ fetching: 10 });

		const { address, lat, lng } = this.state;

		if (address !== '' && window.google !== undefined) {
			this.geocoder = new window.google.maps.Geocoder();
			this.geocoder.geocode({ address }, (results, status) => {
				if (status === window.google.maps.GeocoderStatus.OK) {
					const location = (((results || [])[0] || {})
						.geometry || {})
						.location || {};
					this.startSearch(location.lat(), location.lng());
					return;
				}

				this.startSearch(lat, lng);
			});
			return;
		}

		this.startSearch(lat, lng);
	}

	startSearch = (lat, lng) => {
		const {
			address,
			radius,
			author_name,
			library_name,
		} = this.state;
		const {
			updateSearchRaw,
			getLibraries,
		} = this.props;
		updateSearchRaw({
			address,
			lat,
			lng,
			radius,
			author_name,
			library_name,
		});
		getLibraries({
			lat,
			lng,
			radius,
			bookauthor: author_name,
			libraries: library_name,
		});
	}

	render() {
		const { radius, address, author_name, library_name } = this.state;
		const { fetching } = this.props;

		const all_radius = [5, 10, 15, 20, 25];

		return (
			<SideBar closeSidebar={this.closeSearch}>
				<div styleName="content">
					<div styleName="row">
						<h5 styleName="h5">Encontre livros na sua região</h5>
					</div>
					<div styleName="row">
						<label styleName="label">Área da busca <span>(em km)</span></label>
						{all_radius.map(rad => (
							<RadiusButton
								key={rad}
								radius={rad}
								selected={rad === radius}
								updateFunc={this.handleEdition} />
						))}
					</div>
					<div styleName="row">
						<InputText
							label="Endereço"
							field="address"
							default_value={address}
							updateFunc={this.handleEdition}
							onEnterPressed={this.handleAddressFirst} />
					</div>
					<div styleName="row">
						<InputText
							label="Livro ou Autor"
							field="author_name"
							default_value={author_name}
							updateFunc={this.handleEdition}
							onEnterPressed={this.handleAddressFirst} />
					</div>
					<div styleName="row">
						<InputText
							label="Nome da pessoa/biblioteca"
							field="library_name"
							default_value={library_name}
							updateFunc={this.handleEdition}
							onEnterPressed={this.handleAddressFirst} />
					</div>
					<div styleName="row buttons">
						<Button
							text="Buscar"
							loading={fetching}
							onClick={this.handleAddressFirst} />
					</div>
				</div>
			</SideBar>
		);
	}
}

Search.propTypes = {
	search: PropTypes.object.isRequired,
	updateSearchRaw: PropTypes.func.isRequired,
	getLibraries: PropTypes.func.isRequired,
	fetching: PropTypes.number.isRequired,
	updateLibrariesRaw: PropTypes.func.isRequired,
};

export default CSSModules(Search, styles, { allowMultiple: true });
