import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import InputText from '../../../../components/_inputs/InputText/InputText';
import Button from '../../../../components/Button/Button';
import BookSVG from '../../../../components/_svgs/BookSVG';

// Functions
import { _post } from '../../../../functions/_requests';

class BookEdition extends Component {
	state = {
		title: this.props.book.title,
		author: this.props.book.author,
		link: this.props.book.link,
		saving: 0,
	};

	handleFields = (values) => {
		this.setState(values);
	}

	addBook = () => {
		this.setState({ saving: 10 });
		const { mybooks, updateMyBooksRaw, handleBookEdition } = this.props;
		const { title, author, link } = this.state;
		const params = {
			title,
			author,
			link,
		};
		_post('/book/add', params).then(response => {
			const new_book = response.data;
			const { by_id } = mybooks;
			const _by_id = {
				...by_id,
				[new_book.id]: {
					...new_book,
					edited: false,
					added: true,
				},
			};
			const _all_ids = Object.keys(_by_id)
				.map(id => ({ id: _by_id[id].id, title: _by_id[id].title }))
				.sort((a, b) => {
					if (a.title < b.title) { return -1; }
					if (a.title > b.title) { return 1; }
					return 0;
				})
				.map(c => c.id);
			updateMyBooksRaw({
				by_id: _by_id,
				all_ids: _all_ids,
			});
			handleBookEdition();
		}).catch(() => {
			this.setState({ saving: 30 });
		});
	}

	changeBook = () => {
		this.setState({ saving: 10 });
		const { book, updateBook, handleBookEdition } = this.props;
		const { title, author, link } = this.state;
		const params = {
			title,
			author,
			link,
		};
		_post(`/book/${book.id}/update`, params).then(response => {
			const book_data = response.data;
			const fields_to_update = {
				title: book_data.title,
				author: book_data.author,
				link: book_data.link,
				edited: true,
			};
			updateBook(book.id, fields_to_update);
			handleBookEdition();
		}).catch(() => {
			this.setState({ saving: 30 });
		});
	}

	render() {
		const { title, author, link, saving } = this.state;
		const { type, handleBookEdition } = this.props;

		const save_function = type === 'add'
			? this.addBook
			: this.changeBook;
		const cancelar_button_style = saving === 10
			? { opacity: '0.3', marginRight: '15px' }
			: { marginRight: '15px' };
		const cancelar_button_click = saving === 10
			? null
			: handleBookEdition;
		const salvar_button_click = saving === 10
			? null
			: save_function;

		return (
			<>
				{/* saving !== 10 && (
					<button
						type="button"
						className="close"
						styleName="close-button"
						data-dismiss="modal"
						aria-label="Close"
						onClick={handleBookEdition}>
						<span aria-hidden="true">&times;</span>
					</button>
				) */}
				<div styleName="icon"><BookSVG fill="#a8dee6" /></div>
				<div styleName="content" data-test="component-bookedition">
					{type === 'add' ? (
						<h5 styleName="h5">Cadastrar novo livro</h5>
					) : (
						<h5 styleName="h5">Editar livro</h5>
					)}
					<InputText
						label="Nome do livro"
						field="title"
						default_value={title}
						updateFunc={this.handleFields} />
					<InputText
						label="Autor"
						field="author"
						default_value={author}
						updateFunc={this.handleFields} />
					<InputText
						label="Link para uma descrição do livro"
						field="link"
						default_value={link}
						updateFunc={this.handleFields} />

					{saving === 30 && (
						<div className="alert alert-danger" role="alert">
							<i className="fa fa-exclamation-triangle fa-fw" aria-hidden="true" /> error
						</div>
					)}

					<button
						type="button"
						className="hollow button secondary"
						style={cancelar_button_style}
						onClick={cancelar_button_click}>
						Cancelar
					</button>
					<Button
						text="Salvar"
						loading={saving}
						onClick={salvar_button_click} />
				</div>
			</>
		);
	}
}

BookEdition.propTypes = {
	type: PropTypes.string.isRequired,
	book: PropTypes.shape({
		id: PropTypes.number.isRequired,
		title: PropTypes.string.isRequired,
		author: PropTypes.string.isRequired,
		link: PropTypes.string.isRequired,
		available: PropTypes.bool.isRequired,
	}),
	mybooks: PropTypes.object,
	updateBook: PropTypes.func,
	updateMyBooksRaw: PropTypes.func,
	handleBookEdition: PropTypes.func,
};

BookEdition.defaultProps = {
	book: {
		id: 0,
		title: '',
		author: '',
		link: '',
		available: true,
	},
	mybooks: {},
	updateBook: () => {},
	updateMyBooksRaw: () => {},
	handleBookEdition: () => {},
};

export default CSSModules(BookEdition, styles, { allowMultiple: true });
