import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
// import InputText from '../../../../components/_inputs/InputText/InputText';
// import Button from '../../../../components/Button/Button';
// import BookSVG from '../../../../components/_svgs/BookSVG';

// Functions
// import { _post } from '../../../../functions/_requests';

class SearchContacts extends Component {
	state = {};

	render() {
		const { contact } = this.props;
		console.log(contact);

		return (
			<div styleName="content" data-test="component-searchcontacts">
				.
			</div>
		);
	}
}

SearchContacts.propTypes = {
	contact: PropTypes.object,
};

SearchContacts.defaultProps = {
	contact: {},
};

export default CSSModules(SearchContacts, styles, { allowMultiple: true });
