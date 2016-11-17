import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { browserHistory } from 'react-router';

// components
import { Loading } from '../shared/Loadings';
import NotLogged from '../shared/NotLogged';
import ActionBar from '../Navigation/ActionBar';
import NavigationBar from '../Navigation/NavigationBar';

class EditBook extends Component {
    constructor() {
        super();
        this._handleSubmit = this._handleSubmit.bind(this);
        this._renderLoading = this._renderLoading.bind(this);
        this._renderError = this._renderError.bind(this);
        this._renderNotLogged = this._renderNotLogged.bind(this);
        this._renderView = this._renderView.bind(this);
        // Local state
        this.state = { editionState: 0 };
    }

    _handleSubmit(e) {
        e.preventDefault();
        const bookId = parseInt(this.props.params.id);
        const bookI = this.props.mybooks.data.findIndex((book) => book.id === bookId);
        const bookTitle = this.refs.bookTitle.value;
        const bookAuthor = this.refs.bookAuthor.value;
        const bookLink = this.refs.bookLink.value;
    	e.target.setAttribute('disabled', 'disabled');
    	// e.target.setAttribute('class', 'delete -clicked');
        this.props.editBook(bookId, bookI, bookTitle, bookAuthor, bookLink);
        this.setState({ editionState: 1 });
    }

    componentDidMount() {
        this.props.mybooks.loading !== 2 
            ? this.props.getMyBooks()
                : false
    }

    componentWillUpdate() {
    	if (this.state.editionState == 1) {
	        this.props.mybooks.editing !== 2 
	            ? browserHistory.push('/mybooks/')
	                : false
    	}
    }

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
    			<NotLogged />
    		</div>
    	)
    }

    _renderView() {

		const { mybooks } = this.props;
        const i = mybooks.data.findIndex((book) => book.id === parseInt(this.props.params.id));
        const bookTitlePreValue = mybooks.data[i].title;
        const bookAuthorPreValue = mybooks.data[i].author;
        const bookLinkPreValue = mybooks.data[i].link;

    	return (
			<div className="mybooks-wrapper">
				<ActionBar {...this.props} />
				<NavigationBar {...this.props} />
                <div className="row expanded collapse">
                    <div className="small-12 columns edit-book-title">
                    	Edit book info
                    </div>
                </div>
                <div className="row">
                    <div className="small-12 columns edit-book-form">
                        <form ref="editBookForm" onSubmit={this._handleSubmit}>
                            <label className="form-label">Nome do livro</label>
                            <input type="text" ref="bookTitle" className="form-input" defaultValue={bookTitlePreValue} required={true} />
                            <label className="form-label">Autor</label>
                            <input type="text" ref="bookAuthor" className="form-input" defaultValue={bookAuthorPreValue} required={true} />
                            <label className="form-label">Link sobre o livro</label>
                            <input type="text" ref="bookLink" className="form-input" defaultValue={bookLinkPreValue} />
                            <input type="submit" className="button gradient-1 signin" defaultValue="Save" />
                        </form>
                    </div>
                </div>
    		</div>
    	)
    }

	render () {
		let loadingState = this.props.mybooks.loading;
	    switch(loadingState) {
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
	        	if (this.props.mybooks.data[0].logged === false) {
	        		/* Not logged ===================== */
	        		return this._renderNotLogged();
	        	} else {
	        		/* Ok ============================= */
	        		return this._renderView();
	        	}
	    }
	}
}

export default EditBook;
