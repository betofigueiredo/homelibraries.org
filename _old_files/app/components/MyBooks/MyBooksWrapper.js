import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// Components
import BookSVG from '../shared/BookSVG';
import SwitcheryAvailable from './SwitcheryAvailable';

class MyBooksWrapper extends Component {
    constructor() {
        super();
        this._handleDeleteBook = this._handleDeleteBook.bind(this);
    }

    _handleDeleteBook(e) {
        const bookId = Number(e.target.getAttribute('data-bookid'));
        const i = Number(e.target.getAttribute('data-i'));
    	this.props.deleteBook(bookId, i);
    	e.target.setAttribute('disabled', 'disabled');
    	e.target.setAttribute('class', 'delete -clicked');
    }

	render() {
		const { id, i, onClickEvent, title, author, link, available } = this.props;
		const bookId = `book_${id}`;
		const editBookUrl = `/mybooks/edit/${id}/`;

		return (
			<div id={bookId} className="row expanded collapse mybook-border" data-id={id}>
				<div className="small-12 columns mybooks-books">
					{available == 1
						? <BookSVG />
							: <BookSVG fill="#dddddd" />}
					<button className="title" data-id={id} onClick={onClickEvent}>{title}</button>
					<div className="author">{author}</div>
					<div className="link">
						<Link to={link} target="_blank">{link}</Link>
					</div>
					<SwitcheryAvailable
						available={available}
						id={id}
						i={i}
						{...this.props} />
		            <div className="buttons">
		            	<Link to={editBookUrl}><button className="edit"><i className="fa fa-edit fa-fw"></i> Editar</button></Link>
		                <button className="delete" data-bookid={id} data-i={i} onClick={this._handleDeleteBook}><i className="fa fa-times fa-fw"></i> Apagar</button>
		            </div>
				</div>
			</div>
		)
	}
}

MyBooksWrapper.propTypes = {
	id: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	author: PropTypes.string.isRequired
}

MyBooksWrapper.defaultProps = {
	id: 0,
	title: "Nome do livro",
	author: "Autor do livro"
}

export default MyBooksWrapper;
