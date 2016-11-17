import React, { Component, PropTypes } from 'react';

class SwitcheryAvailable extends Component {
    constructor(props) {
        super(props);
        this._handleAvailableBook = this._handleAvailableBook.bind(this);
    }

    _handleAvailableBook(e) {
    	const bookAvailable = Number(e.target.getAttribute('data-available'));
        const bookId = Number(e.target.getAttribute('data-bookid'));
        const i = Number(e.target.getAttribute('data-i'));
    	e.target.setAttribute('disabled', 'disabled');
    	this.props.toogleAvailableBook(bookId, i, bookAvailable);
    }

	render() {
		const { available, id, i } = this.props;
		
		if (available == 1) {
			return (
		        <div className="switcherys">
		            <button className="changing-switchery" data-available={available} data-bookid={id} data-i={i} onClick={this._handleAvailableBook}></button>
		            <button className="switchery active"><small className="active"></small></button>
		            <div className="text-switchery active">Disponível</div>
		        </div>
			)
		} else {
			return (
		        <div className="switcherys">
		            <div className="changing-switchery" data-available={available} data-bookid={id} data-i={i} onClick={this._handleAvailableBook}></div>
		            <button className="switchery"><small></small></button>
		            <div className="text-switchery">Indisponível</div>
		        </div>
			)
		}
	}
}

export default SwitcheryAvailable;