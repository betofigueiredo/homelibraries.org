import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Components
import Map from '../../components/Map';
import ProfilePreview from '../../components/ProfilePreview';
import Search from '../../components/Search';

const Libraries = ({
	// =========== state
	// preview,
	// =========== props
	libraries,
	map,
	search,
	// =========== local funcs
	openSearch,
	// =========== props funcs
	getLibraries,
	updateLibrariesRaw,
	updateMapRaw,
	updateSearchRaw,
}) => {
	const { profile_preview_id, fetching } = libraries;

	return (
		<div styleName="libraries-wrapper">
			<button type="button" onClick={openSearch}>aaaa</button>
			{search.open && (
				<Search
					search={search}
					updateSearchRaw={updateSearchRaw}
					getLibraries={getLibraries}
					fetching={fetching}
					updateLibrariesRaw={updateLibrariesRaw} />
			)}

			{profile_preview_id !== 0 && (
				<ProfilePreview
					updateLibrariesRaw={updateLibrariesRaw}
					libraries={libraries} />
			)}

			<Map
				map_data={map}
				getLibraries={getLibraries}
				search={search}
				draw_circle
				libraries={libraries}
				updateLibrariesRaw={updateLibrariesRaw}
				updateMapRaw={updateMapRaw} />
		</div>
	);
};

Libraries.propTypes = {
	// =========== state
	// preview: PropTypes.object.isRequired,
	// =========== props
	libraries: PropTypes.object.isRequired,
	map: PropTypes.object.isRequired,
	search: PropTypes.object.isRequired,
	// =========== local funcs
	openSearch: PropTypes.object.isRequired,
	// =========== props funcs
	getLibraries: PropTypes.func.isRequired,
	updateLibrariesRaw: PropTypes.func.isRequired,
	updateMapRaw: PropTypes.func.isRequired,
	updateSearchRaw: PropTypes.func.isRequired,
};

export default CSSModules(Libraries, styles, { allowMultiple: true });
