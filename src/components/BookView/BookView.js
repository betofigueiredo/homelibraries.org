import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Components
import BookSVG from '../_svgs/BookSVG';

// Functions
import { setClasses } from '../../functions/_setClasses';
// import { _post } from '../../functions/_requests';

class BookView extends Component {
	static getDerivedStateFromProps(nextProps) {
		const { book, updateBook } = nextProps;
		if (book.edited) {
			setTimeout(() => {
				updateBook(book.id, { edited: false });
			}, 15000);
		}
		return null;
	}

	state = {};

	render() {
		const { book } = this.props;

		// class
		const book_wrapper_classes = {
			unavailable: !book.available,
		};
		const book_wrapper_class = setClasses('book-wrapper', book_wrapper_classes);

		const icon_fill = !book.available
			? '#dbe1e6'
			: '#a8dee6';

		return (
			<>
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
						</div>
					</div>
				</div>
			</>
		);
	}
}

BookView.propTypes = {
	book: PropTypes.shape({
		id: PropTypes.number.isRequired,
		title: PropTypes.string.isRequired,
		author: PropTypes.string.isRequired,
		link: PropTypes.string.isRequired,
		available: PropTypes.bool.isRequired,
		edited: PropTypes.bool.isRequired,
	}).isRequired,
	updateBook: PropTypes.func.isRequired,
};

export default CSSModules(BookView, styles, { allowMultiple: true });
