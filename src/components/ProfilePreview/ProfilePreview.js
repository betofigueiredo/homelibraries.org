import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import SideBar from '../SideBar';
import BookView from '../BookView';

// Functions
import { _get } from '../../functions/_requests';

class ProfilePreview extends Component {
	state = {
		loading: 0,
		library: {},
	};

	componentDidMount() {
		this.buscaProfile();
	}

	componentDidUpdate(prevProps/* , prevState */) {
		const { profile_preview_id: prev_id } = prevProps.libraries;
		const { profile_preview_id: next_id } = this.props.libraries;

		if (prev_id !== next_id) {
			this.buscaProfile();
		}
	}

	closeProfile = () => {
		const { updateLibrariesRaw } = this.props;
		updateLibrariesRaw({ profile_preview_id: 0 });
	}

	buscaProfile() {
		this.setState({ loading: 1 });
		const { libraries } = this.props;
		const { profile_preview_id } = libraries;

		_get(`/library/${profile_preview_id}`).then(response => {
			const library = response.data || {};
			// console.log(library);
			this.setState({ library, loading: 2 });
		}).catch(() => {
			this.setState({ loading: 3 });
		});
	}

	render() {
		const { loading, library } = this.state;
		const name = library.name || '';
		const letters = library.letters || '';
		const color = library.color || '';
		const books = library.books || [];
		const number_of_books = books.length;

		if (loading === 1) {
			return (
				<SideBar closeSidebar={this.closeProfile}>
					<p>loading...</p>
				</SideBar>
			);
		}

		return (
			<SideBar closeSidebar={this.closeProfile}>
				<div styleName="content">
					<button
						type="button"
						onClick={this.closeProfile}>
						Close
					</button>

					<div styleName="profile-picture" style={{ background: color }}>{letters}</div>
					<div styleName="name">{name}</div>
					<div styleName="location">São Paulo, SP</div>

					<div styleName="details">
						<div styleName="d-block">
							<div styleName="number">{number_of_books}</div>
							Livros
						</div>
						<div styleName="d-block">
							<div styleName="number">12</div>
							Empréstimos
						</div>
						<div styleName="d-block">
							<div styleName="number">3</div>
							Livros
						</div>
					</div>


					<button type="button">Mensagem</button>
					<button type="button">Adicionar como favorito</button>

					{books.map(book => (
						<BookView
							key={book.id}
							book={book} />
					))}
				</div>
			</SideBar>
		);
	}
}

ProfilePreview.propTypes = {
	libraries: PropTypes.object.isRequired,
	updateLibrariesRaw: PropTypes.func.isRequired,
};

export default CSSModules(ProfilePreview, styles, { allowMultiple: true });
