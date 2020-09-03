import PropTypes from 'prop-types';

const bookInterface = PropTypes.shape({
	id: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	author: PropTypes.string.isRequired,
	link: PropTypes.string.isRequired,
	available: PropTypes.bool.isRequired,
	edited: PropTypes.bool.isRequired,
	added: PropTypes.bool.isRequired,
});

export default bookInterface;
