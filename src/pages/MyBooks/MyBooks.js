import React from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import AddBookForm from './subcomponents/AddBookForm/AddBookForm';
import NoBooks from './subcomponents/NoBooks/NoBooks';
import BooksList from './subcomponents/BooksList/BooksList';

/* eslint-disable */
const MyBooks = ({
	// =========== state
	// =========== props
	mybooks,
	user,
	// =========== local funcs
	// =========== props funcs
	updateBook,
	updateMyBooksRaw,
}) => {
	const { logged } = user;
	const { fetching, all_ids } = mybooks;

	if (fetching === 40) {
		return (
			<p>not logged</p>
		);
	}

	return (
		<div className="grid-container" styleName="smaller-grid-container">
			<div className="grid-x grid-padding-x">
				<div className="small-12 cell">
					<h3 styleName="h3">Meus livros</h3>
				</div>
			</div>
			<div className="grid-x grid-padding-x">
				<div className="small-12 cell">
					<AddBookForm
						mybooks={mybooks}
						updateMyBooksRaw={updateMyBooksRaw} />
				</div>
			</div>
			{all_ids.length > 0 ? (
				<BooksList
					mybooks={mybooks}
					updateBook={updateBook}
					updateMyBooksRaw={updateMyBooksRaw} />
			) : (
				<NoBooks />
			)}
		</div>
	);
};

MyBooks.propTypes = {
	// =========== state
	// =========== props
	mybooks: PropTypes.object.isRequired,
	user: PropTypes.object.isRequired,
	// =========== local funcs
	// =========== props funcs
	updateBook: PropTypes.func.isRequired,
	updateMyBooksRaw: PropTypes.func.isRequired,
};

export default CSSModules(MyBooks, styles, { allowMultiple: true });
