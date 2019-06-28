import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import BookEdition from '../BookEdition/BookEdition';

class AddBookForm extends Component {
	state = {
		adding_book: false,
	};

	handleBookAddModal = () => {
		const { adding_book } = this.state;
		this.setState({ adding_book: !adding_book });
	}

	render() {
		const { adding_book } = this.state;
		const { mybooks, updateMyBooksRaw } = this.props;

		if (adding_book) {
			return (
				<>
					<button
						type="button"
						styleName="add-book-button in-form"
						onClick={this.handleBookAddModal}>
						Fechar
					</button>
					<div styleName="form-wrapper">
						<BookEdition
							type="add"
							mybooks={mybooks}
							updateMyBooksRaw={updateMyBooksRaw}
							handleBookEdition={this.handleBookAddModal} />
					</div>
				</>
			);
		}

		return (
			<button
				type="button"
				styleName="add-book-button"
				onClick={this.handleBookAddModal}>
				Cadastrar novo livro
			</button>
		);
	}
}

AddBookForm.propTypes = {
	mybooks: PropTypes.object.isRequired,
	updateMyBooksRaw: PropTypes.func.isRequired,
};

export default CSSModules(AddBookForm, styles, { allowMultiple: true });
