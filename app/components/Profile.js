import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { Loading } from './shared/Loadings';
import BookSVG from './shared/BookSVG';

const BookRow = ({ id, title, author, link, available }) => {
    let buttonView;
    if (available == 0) {
        buttonView = <button type="button" className="button disabled">Indisponível</button>;
    } else {
        buttonView = <button type="button" className="button gradient-1">Pegar emprestado</button>;
    }
	return (
        <div className="profile-books">
            <BookSVG />
            <div className="title">{title}</div>
            <div className="author">{author}</div>
            <div className="link">{link}</div>
            <div className="buttons">
                {buttonView}
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
        console.log(this.props.profiles.data[0])

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
						<div className="profile-books-title">Books</div>

                        {books.map((book) => {
                            return (
                            	<BookRow
                            		key={book.id}
                            		id={book.id}
									title={book.title}
	                                author={book.author}
                                    link={book.link}
                                    available={book.available} />
                            )
                        })}

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
