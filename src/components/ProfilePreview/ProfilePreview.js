import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Components
import BookView from '../BookView/BookView';

// Functions
import { _get } from '../../functions/_requests';

class ProfilePreview extends Component {
	// static getDerivedStateFromProps(nextProps, prevState) {
	// 	const { profile_preview_id } = nextProps.libraries;
	// }

	state = {
		show: false,
		loading: 0,
		library: {},
	};

	componentDidMount() {
		this.buscaProfile();
		setTimeout(() => this.setState({ show: true }), 60);
		setTimeout(() => {
			window.addEventListener('keyup', this.escClose);
		}, 400);
	}

	componentDidUpdate(prevProps/* , prevState */) {
		const { profile_preview_id: prev_id } = prevProps.libraries;
		const { profile_preview_id: next_id } = this.props.libraries;

		if (prev_id !== next_id) {
			this.buscaProfile();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('keyup', this.escClose);
	}

	escClose = (e) => {
		if (e.keyCode === 27) {
			this.closeProfile();
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
		const { show, loading, library } = this.state;
		const wrapper_class = show
			? 'profile-wrapper in'
			: 'profile-wrapper';

		const name = library.name || '';
		const letters = library.letters || '';
		const color = library.color || '';
		const books = library.books || [];

		if (loading === 1) {
			return (
				<div styleName={wrapper_class}>
					loading...
				</div>
			);
		}

		return (
			<div styleName={wrapper_class}>
				{/* <button
					type="button"
					onClick={this.closeProfile}>
					Close
				</button> */}

				<div styleName="profile-picture" style={{ background: color }}>{letters}</div>
				<div styleName="name">{name}</div>

				<button type="button">Mensagem</button>
				<button type="button">Adicionar como favorito</button>

				{books.map(book => (
					<BookView book={book} />
				))}
			</div>
		);
	}
}

ProfilePreview.propTypes = {
	libraries: PropTypes.object.isRequired,
	updateLibrariesRaw: PropTypes.func.isRequired,
};

export default CSSModules(ProfilePreview, styles, { allowMultiple: true });
