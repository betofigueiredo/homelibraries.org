/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
// import ModalPortal from '../../../../components/_modals/ModalPortal/ModalPortal';
// import ModalWrapperPortal from '../../../../components/_modals/ModalPortal/ModalWrapperPortal';
import BookEdition from '../BookEdition';
import BookSVG from '../../../../components/_svgs/BookSVG';
import Switchery from '../../../../components/Switchery/Switchery';
import ToolTip from '../../../../components/ToolTip/ToolTip';
import EditionButton from './EditionButton';
import DeleteButton from './DeleteButton';

// Functions
import { setClasses } from '../../../../functions/_setClasses';
import { _post } from '../../../../functions/_requests';

class Book extends Component {
	static getDerivedStateFromProps(nextProps) {
		const { book, updateBook } = nextProps;
		if (book.edited) {
			setTimeout(() => {
				updateBook(book.id, { edited: false });
			}, 15000);
		}
		return null;
	}

	state = {
		editing_book: false,
		deleting_book: false,
		deleting: 0,
	};

	handleBookEdition = () => {
		const { editing_book } = this.state;
		this.setState({ editing_book: !editing_book });
	}

	handleBookDeleteConfirm = () => {
		const { deleting_book } = this.state;
		this.setState({ deleting_book: !deleting_book });
	}

	deleteBook = () => {
		this.setState({ deleting: 1 });
		const { book, mybooks, updateMyBooksRaw } = this.props;
		_post(`/book/${book.id}/delete`, {}).then(() => {
			const { all_ids } = mybooks;
			const _all_ids = all_ids.filter(x => x !== book.id);
			updateMyBooksRaw({
				all_ids: _all_ids,
			});
			this.setState({ deleting: 2, deleting_book: false });
		}).catch(() => {
			this.setState({ deleting: 3 });
		});
	}

	render() {
		const { editing_book, deleting_book, deleting } = this.state;
		const { book, updateBook } = this.props;

		// class
		const book_wrapper_classes = {
			edited: book.edited,
			added: book.added,
			unavailable: !book.available,
		};
		const book_wrapper_class = setClasses('book-wrapper', book_wrapper_classes);

		const icon_fill = !book.available
			? '#dbe1e6'
			: '#a8dee6';

		if (editing_book) {
			return (
				<div className="grid-x grid-padding-x">
					<div className="small-12 cell" styleName="cell">
						<div styleName="book-wrapper">
							<BookEdition
								type="edition"
								book={book}
								updateBook={updateBook}
								handleBookEdition={this.handleBookEdition} />
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className="grid-x grid-padding-x">
				<div className="small-12 cell" styleName="cell">
					<div styleName={book_wrapper_class}>
						<div styleName="icon"><BookSVG fill={icon_fill} /></div>
						<div styleName="info">
							<p styleName="title">{book.title}</p>
							<p styleName="author">{book.author}</p>
							{book.link !== '' ? (
								<p styleName="link"><a href={book.link} target="_blank" rel="noopener noreferrer" data-account-menu>{book.link}</a></p>
							) : (
								<p styleName="link"><em>Sem link de descrição</em></p>
							)}
						</div>
						{!deleting_book ? (
							<div styleName="buttons">
								<Switchery
									book={book}
									updateBook={updateBook} />
								<ToolTip
									text="Editar livro"
									render={(handleMouseEnter, handleMouseLeave) => (
										<EditionButton
											handleMouseEnter={handleMouseEnter}
											handleMouseLeave={handleMouseLeave}
											handleBookEdition={this.handleBookEdition} />
									)} />
								<ToolTip
									text="Apagar livro"
									render={(handleMouseEnter, handleMouseLeave) => (
										<DeleteButton
											handleMouseEnter={handleMouseEnter}
											handleMouseLeave={handleMouseLeave}
											handleBookDeleteConfirm={this.handleBookDeleteConfirm} />
									)} />
							</div>
						) : (
							<div styleName="delete-confirm">
								<div styleName="delete-text">Apagar este livro?</div>
								{deleting === 1 ? (
									<button
										type="button"
										className="alert button small">
										Apagando
									</button>
								) : (
									<button
										type="button"
										className="alert button small"
										onClick={this.deleteBook}>
										Apagar
									</button>
								)}
								<button
									type="button"
									className="clear button small"
									onClick={this.handleBookDeleteConfirm}>
									Não
								</button>
							</div>
						)}
						{book.edited && (
							<div styleName="edited">Livro editado com sucesso!</div>
						)}
						{book.added && (
							<div styleName="added">Livro cadastrado com sucesso!</div>
						)}
					</div>
				</div>
			</div>
		);
	}
}

Book.propTypes = {
	book: PropTypes.shape({
		id: PropTypes.number.isRequired,
		title: PropTypes.string.isRequired,
		author: PropTypes.string.isRequired,
		link: PropTypes.string.isRequired,
		available: PropTypes.bool.isRequired,
	}).isRequired,
	mybooks: PropTypes.object.isRequired,
	updateMyBooksRaw: PropTypes.func.isRequired,
	updateBook: PropTypes.func.isRequired,
};

export default CSSModules(Book, styles, { allowMultiple: true });
