import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// Components
import BookSVG from '../shared/BookSVG';

class MyBooksWrapperDeleted extends Component {
    constructor() {
        super();
        this._handleUndoDeleteBook = this._handleUndoDeleteBook.bind(this);
    }

    _handleUndoDeleteBook(e) {
        const bookId = Number(e.target.getAttribute('data-bookid'));
        const i = Number(e.target.getAttribute('data-i'));
    	this.props.undoDeleteBook(bookId, i);
    	e.target.setAttribute('disabled', 'disabled');
    	e.target.setAttribute('class', 'delete -clicked');
    }

	render() {
		const bookId = `book_${this.props.id}`;
		return (
			<div id={bookId} className="row expanded collapse mybook-border" data-id={this.props.id}>
				<div className="small-12 columns mybooks-books">
					<BookSVG fill="#dddddd" />
					<div className="title -deleted">
						{this.props.title}
						<button data-bookid={this.props.id} data-i={this.props.i} onClick={this._handleUndoDeleteBook}>Desfazer</button>
					</div>
				</div>
			</div>
		)
	}
}

export default MyBooksWrapperDeleted;
