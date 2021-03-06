import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Redux HOC
import withStore from '../../../../utils/redux/withStore';

function Auxlr({ children }) {
	return <>{children}</>;
}

Auxlr.propTypes = {
	children: PropTypes.object.isRequired,
};

export default withStore(connect(null, null)(Auxlr));
