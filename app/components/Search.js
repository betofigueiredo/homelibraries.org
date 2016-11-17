import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router';

class Search extends Component {
    constructor(props) {
        super(props);
        this._goSearch = this._goSearch.bind(this);
        this._handleRadio = this._handleRadio.bind(this);
        this._goBack = this._goBack.bind(this);
    }

    _handleRadio(e) {
        const sRadiusChange = parseInt(e.target.value);
        this.refs.search_radius.value = sRadiusChange;
    }

    _goSearch(e) {
        e.preventDefault();
        const sAdrress = this.refs.search_address.value;
        const sRadius = parseInt(this.refs.search_radius.value);
        const sBookAuthor = this.refs.search_bookauthor.value;
        const sLibrary = this.refs.search_library.value;
        const sLfl = false;
		this.props.searchLibraries(sAdrress, sRadius, sBookAuthor, sLibrary, sLfl);
		browserHistory.push('/libraries/');
    }

    _goBack() {
        window.history.go(-1);
    }

	render() {
        const { address, book_author, lat, lng, lfl, library, radius } = this.props.libraries.search;
		return (
			<div className={this.props.wrapperClass}>


				<div className="row">
					<div className="small-12 columns">
						<div className="profile-books-title">Search</div>

                        <form ref="searchForm" onSubmit={this._goSearch}>
                            <label className="form-label" htmlFor="search_address">Address</label>
                            <input type="text" id="search_address" ref="search_address" className="form-input" defaultValue={address} />
                            <label className="form-label">Radius</label>
                            <div>
                                <input type="hidden" ref="search_radius" defaultValue="5" />
                            	<input type="radio" id="radius-1" name="search_radius_radios" onChange={this._handleRadio} defaultValue="1" defaultChecked={radius == 1 ? true : false} />
        						<label htmlFor="radius-1">1</label>
                            	<input type="radio" id="radius-5" name="search_radius_radios" onChange={this._handleRadio} defaultValue="5" defaultChecked={radius == 5 ? true : false} />
        						<label htmlFor="radius-5">5</label>
                                <input type="radio" id="radius-10" name="search_radius_radios" onChange={this._handleRadio} defaultValue="10" defaultChecked={radius == 10 ? true : false} />
                                <label htmlFor="radius-10">10</label>
                                <input type="radio" id="radius-15" name="search_radius_radios" onChange={this._handleRadio} defaultValue="15" defaultChecked={radius == 15 ? true : false} />
                                <label htmlFor="radius-15">15</label>
                                <input type="radio" id="radius-20" name="search_radius_radios" onChange={this._handleRadio} defaultValue="20" defaultChecked={radius == 20 ? true : false} />
                                <label htmlFor="radius-20">20</label>
                            </div>

                            <label className="form-label">Book or author</label>
                            <input type="text" id="search_bookauthor" ref="search_bookauthor" className="form-input" defaultValue={book_author} />
                            <label className="form-label">Library name</label>
                            <input type="text" id="search_library" ref="search_library" className="form-input"defaultValue={library} />

                            <button type="submit" className="button gradient-1">Search</button>
                            <div><button type="button" className="button hollow primary" onClick={this._goBack}>Cancelar</button></div>
                        </form>
					</div>
				</div>




				

			</div>
		);
	}
}

export default Search;
