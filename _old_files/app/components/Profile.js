import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { Loading } from './shared/Loadings';
import BookSVG from './shared/BookSVG';

const BookRow = ({ id, title, author, link, available, onClickEvent }) => {
    let buttonView;
    if (available == 0) {
        buttonView = <button type="button" className="button disabled">Indisponível</button>;
    } else {
        buttonView = <button type="button" className="button gradient-1">Pegar emprestado</button>;
    }
	return (
        <div className="profile-books">
            <button id={`book_details_${id}`} className="details" data-book={id} onClick={onClickEvent}>
                <BookSVG />
                <i className="fa fa-chevron-down" aria-hidden="true"></i>
                <i className="fa fa-chevron-up" aria-hidden="true"></i>
                <div className="title">{title}</div>
                <div className="author">{author}</div>
                <div className="link">{link}</div>
            </button>
            <div id={`book_getform_${id}`} className="get-form">
                <textarea className="books-line-msg-textarea" rows="4" defaultValue={`Olá, gostaria de pegar emprestado o livro ${title}, de ${author}.`}></textarea>
                <button type="button" className="button gradient-1">Enviar mensagem</button>
                <button type="button" className="button hollow cancel" data-book={id} onClick={onClickEvent}>Cancelar</button>
                <div className="bottom-space"></div>
            </div>
        </div>
	)
}

class Profile extends Component {
    constructor(props) {
        super(props);
        this._renderLoading = this._renderLoading.bind(this);
        this._renderError = this._renderError.bind(this);
        this._renderProfile = this._renderProfile.bind(this);
        this._openBookDetails = this._openBookDetails.bind(this);
    }

    _openBookDetails(e) {
        const bookToView = e.currentTarget.getAttribute('data-book');
        const bookDetails_element = document.getElementById(`book_details_${bookToView}`);
        const book_GetForm_element = document.getElementById(`book_getform_${bookToView}`);
        if (book_GetForm_element.getAttribute('class') == 'get-form -open') {
            bookDetails_element.setAttribute('class', 'details');
            book_GetForm_element.setAttribute('class', 'get-form');
        } else {
            bookDetails_element.setAttribute('class', 'details -open');
            book_GetForm_element.setAttribute('class', 'get-form -open');
        }
    }

    _renderLoading() {
    	return <Loading />;
    }

    _renderError() {
    	return <div>Uh oh: </div>;
    }

    _renderProfile() {
        if (this.props.profiles.loading === 3) {
            return this._renderError();
        }

        const { address, name, letters, color, picture, followers, following, books } = this.props.profiles.data[0];

        return (
        	<div className="profile-wrapper-inside">
        		
				<div className="row expanded profile-info-wrapper">
					<div className="small-12 columns">
						{picture === 0
							? <div className="profile-info-image" style={{backgroundColor: `${color}`}}>{letters}</div>
								: <div className="profile-info-image" style={{backgroundImage: `${picture}`}}></div>}
						<div className="profile-info-name">{name}</div>
						<div className="profile-info-address">{address.details}</div>
						<div className="profile-info-followers">
							<div><span>{books.length}</span> {books.length >= 2 ? 'livros' : 'livro'}</div>
							<div className="profile-info-followers-border-division"><span>{followers}</span> followers</div>
							<div><span>{following}</span> following</div>
						</div>
					</div>
				</div>

				<div className="row smaller">
					<div className="small-12 columns">
						<div className="profile-books-title">Books ({books.length})</div>

                        {books.map((book) => {
                            return (
                            	<BookRow
                            		key={book.id}
                            		id={book.id}
									title={book.title}
	                                author={book.author}
                                    link={book.link}
                                    available={book.available}
                                    onClickEvent={this._openBookDetails} />
                            )
                        })}

					</div>
				</div>

                <div className="row">
                    <div className="small-12 columns">
                        <p><br /></p>
                    </div>
                </div>
        	</div>
        );
    }

	render() {
		return (
			<div className={this.props.wrapperClass}>
				{this.props.profiles.loading === 0 || this.props.profiles.loading === 1
					? this._renderLoading() 
						: this._renderProfile()}
			</div>
		);
	}
}

export default Profile;
