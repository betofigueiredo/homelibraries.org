import React from 'react';
import PropTypes from 'prop-types';

/* Book icon color: 00b1a5 / 51dd9f */
const BookSVG = ({ fill }) => (
	<svg version="1.1" width="50" height="50" viewBox="0 0 50 50">
		<g>
			<path fill={fill} stroke={fill} strokeWidth="1" d="M 23 6 L 8 10 L 8 29 L 11 32 L 25 28 L 25 9 L 11 13 L 11 13 L 8 10" />
			<path stroke="#ffffff" strokeWidth="1" d="M 13 17 L 24 14" />
			<path stroke="#ffffff" strokeWidth="1" d="M 13 21 L 24 18" />
			<path stroke="#ffffff" strokeWidth="1" d="M 13 25 L 24 22" />
		</g>
	</svg>
);

BookSVG.propTypes = {
	fill: PropTypes.string,
};

BookSVG.defaultProps = {
	fill: '#a8dee6',
};

export default BookSVG;
