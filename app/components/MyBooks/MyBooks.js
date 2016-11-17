import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// components
import { Loading } from '../shared/Loadings';
import NotLogged from './NotLogged';
import ActionBar from '../Navigation/ActionBar';
import NavigationBar from '../Navigation/NavigationBar';
import MyBooksWrapper from './MyBooksWrapper';
import MyBooksWrapperDeleted from './MyBooksWrapperDeleted';

class MyBooks extends Component {
    constructor() {
        super();
        this._renderLoading = this._renderLoading.bind(this);
        this._renderError = this._renderError.bind(this);
        this._renderBooks = this._renderBooks.bind(this);
        this._renderNotLogged = this._renderNotLogged.bind(this);
        this._handleSubmit = this._handleSubmit.bind(this);
        this._openAddNewBookForm = this._openAddNewBookForm.bind(this);
        this._openBookDetails = this._openBookDetails.bind(this);
        // Local state
        this.state = {
            open_book: 0
        };
    }

    _openBookDetails(e) {
        const clickedId = Number(e.target.getAttribute('data-id'));
        if (document.getElementById(`book_${clickedId}`).getAttribute('class') == 'row expanded collapse mybook-border -open') {
            document.getElementById(`book_${clickedId}`).setAttribute('class', 'row expanded collapse mybook-border');
            this.setState({open_book: 0});
        } else {
            document.getElementById(`book_${clickedId}`).setAttribute('class', 'row expanded collapse mybook-border -open');
            this.setState({open_book: clickedId});
        }
    }

    componentDidMount() {
        this.props.mybooks.loading !== 2 
            ? this.props.getMyBooks()
                : false
    }

    componentDidUpdate() {
        this.props.mybooks.data.sort(function(a, b) {
            var nameA = a.title.toUpperCase();
            var nameB = b.title.toUpperCase();
            if (nameA < nameB) { return -1; }
            if (nameA > nameB) { return 1; }
            return 0;
        });
        if (this.refs.newBookForm && this.props.mybooks.editing == 2) { this.refs.newBookForm.reset(); }
    }

    _handleSubmit(e) {
        e.preventDefault();
        const title = this.refs.bookTitle.value;
        const author = this.refs.bookAuthor.value;
        const link = this.refs.bookLink.value;
        this.props.addNewBook(title, author, link);
        
    }

    _openAddNewBookForm() {
        this.props.mybooks.form === '' 
            ? this.props.toogleNewBookForm(true) 
                : this.props.toogleNewBookForm(false) }

    _renderLoading() {
        return (
            <div className="mybooks-wrapper">
                <ActionBar {...this.props} />
                <NavigationBar {...this.props} />
                <Loading />
            </div>
        )
    }

    _renderError() {
        return (
            <div className="mybooks-wrapper">
                <ActionBar {...this.props} />
                <NavigationBar {...this.props} />
                <div>Uh oh: </div>
            </div>
        )
    }

    _renderNotLogged() {
        return (
            <div className="mybooks-wrapper">
                <ActionBar {...this.props} />
                <NavigationBar {...this.props} />
                <NotLogged origin="mybooks" locale={this.props.user.language} />
            </div>
        )
    }

    _renderBooks() {
        const formWrapperClass = `mybooks-addbutton-wrapper${this.props.mybooks.form}`;
        return (
            <div className="mybooks-wrapper">
                <ActionBar {...this.props} />
                <NavigationBar {...this.props} />

                <div className="row expanded collapse">
                    <div className="small-12 columns mybooks-addbutton">
                        <div className={formWrapperClass}>
                            <button className="mybooks-addbutton-button" onClick={this._openAddNewBookForm}><i className="fa fa-plus fa-fw"></i>Adicionar novo livro</button>
                            <form ref="newBookForm" className="new-book-form" onSubmit={this._handleSubmit}>
                                <label className="form-label">Nome do livro</label>
                                <input type="text" ref="bookTitle" className="form-input" required={true} />
                                <label className="form-label">Autor</label>
                                <input type="text" ref="bookAuthor" className="form-input" required={true} />
                                <label className="form-label">Link sobre o livro</label>
                                <input type="text" ref="bookLink" className="form-input" />
                                <input type="submit" className="button gradient-1" defaultValue="Save" />
                            </form>
                        </div>
                    </div>
                </div>

                <div className="row expanded collapse">
                    <div className="small-12 columns">
                        <div className="profile-books-title">My books ({this.props.mybooks.data.length})</div>
                        {this.props.mybooks.data.map((book, i) => {
                            if (book.deleted == 0) {
                                return (
                                    <MyBooksWrapper
                                        key={i}
                                        i={i}
                                        id={book.id}
                                        title={book.title}
                                        author={book.author}
                                        link={book.link}
                                        available={book.available}
                                        onClickEvent={this._openBookDetails}
                                        {...this.props} />
                                )
                            } else {
                                return (
                                    <MyBooksWrapperDeleted
                                        key={i}
                                        i={i}
                                        id={book.id}
                                        title={book.title}
                                        author={book.author}
                                        link={book.link}
                                        available={book.available}
                                        onClickEvent={this._openBookDetails}
                                        {...this.props} />
                                )
                            }
                        })}
                    </div>
                </div>
            </div>
        );
    }

	render () {
        const { loading, data } = this.props.mybooks;
        switch(loading) {
            /* Loading ================================ */
            case 0:
            case 1:
                return this._renderLoading(); break;
            /* Error ================================== */
            case 3:
                return this._renderError(); break;
            /* Loaded ================================= */
            case 2:
            default:
                if (data[0] != undefined && data[0].logged === false) {
                    /* Not logged ===================== */
                    return this._renderNotLogged();
                } else {
                    /* Ok ============================= */
                    return this._renderBooks();
                }
        }
	}
}

export default MyBooks;
