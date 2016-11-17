import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

// components
import { Loading } from '../shared/Loadings';
import ActionBar from '../Navigation/ActionBar';
import NavigationBar from '../Navigation/NavigationBar';
import MyBooksWrapper from './MyBooksWrapper';

class MyBooksContainer extends Component {
    constructor() {
        super();
        this._renderLoading = this._renderLoading.bind(this);
        this._renderError = this._renderError.bind(this);
        this._renderBooks = this._renderBooks.bind(this);
        this._renderNotLogged = this._renderNotLogged.bind(this);
    }
    
	componentDidMount() {
        this.props.mybooks.loading !== 2 
            ? this.props.getMyBooks()
                : false
	}
    
    _renderLoading() {
        return <Loading />;
    }

    _renderError() {
        return (
            <div>Uh oh: </div>
        );
    }

    _renderNotLogged() {
        return (
            <div>Sorry, you are not logged</div>
        );
    }
    
    _renderBooks() {
        if (this.props.mybooks.loading === 3) {
            return this._renderError();
        }
        else if (this.props.mybooks.loading === 2 && this.props.mybooks.data[0].logged === false) {
            return this._renderNotLogged();
        }

        return (
            <div>
                <div className="row expanded collapse">
                    <div className="small-12 columns mybooks-addbutton">
                        <button className="button gradient-1">Adicionar novo livro</button>
                    </div>
                </div>
                <div className="row expanded collapse">
                    <div className="small-12 columns">
                        {this.props.mybooks.data.map((book) => {
                            return (
                                <MyBooksWrapper
                                    key={book.id}
                                    id={book.id}
                                    title={book.title}
                                    author={book.author}
                                    link={book.link} />
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }

	render () {
		return (
			<div className="mybooks-wrapper">
				<ActionBar {...this.props} />
				<NavigationBar {...this.props} />
            
                {this.props.mybooks.loading === 0 || this.props.mybooks.loading === 1
                    ? this._renderLoading() 
                        : this._renderBooks()}
			</div>
		)
	}
}

export default MyBooksContainer;
