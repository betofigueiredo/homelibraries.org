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
		address: '',
		lat: 0,
		lng: 0,
		radius: 5,
		author_name: '',
		library_name: '',
	};

	closeSearch = () => {
		// const { updateLibrariesRaw } = this.props;
		// updateLibrariesRaw({ profile_preview_id: 0 });
	}

	handleEdition = (values) => {
		this.setState(values);
	}

	startSearch = () => {
		const {
			address,
			lat,
			lng,
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
			address,
			lat,
			lng,
			radius,
		});
	}

	render() {
		const { radius } = this.state;
		const { search, fetching } = this.props;

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
							default_value={search.address}
							updateFunc={this.handleEdition} />
					</div>
					<div styleName="row">
						<InputText
							label="Livro ou Autor"
							field="book_author" />
					</div>
					<div styleName="row">
						<InputText
							label="Nome da pessoa/biblioteca"
							field="library" />
					</div>
					<div styleName="row buttons">
						<Button
							text="Buscar"
							loading={fetching}
							onClick={this.startSearch} />
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
};

export default CSSModules(Search, styles, { allowMultiple: true });
