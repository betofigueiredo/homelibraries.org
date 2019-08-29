import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { connect, useSelector, useDispatch } from 'react-redux';
import { detailedmapDispatchToProps } from '../../store/reduxDispatchs';

// CSS
import styles from './style.module.sass';

// Redux HOC
import withStore from '../../store/withStore';

// Components
import LayoutWrapper from '../../components/LayoutWrapper';
import Map from '../../components/Map';
import ProfilePreview from '../../components/ProfilePreview';
import Search from '../../components/Search';

function Libraries({
	getLibraries,
	updateLibrariesRaw,
	updateMapRaw,
	updateSearchRaw,
}) {
	const dispatch = useDispatch();
	const libraries = useSelector(store => store.libraries);
	const map = useSelector(store => store.map);
	const search = useSelector(store => store.search);
	const { profile_preview_id, fetching } = libraries;

	useEffect(() => {
		document.title = 'Home Libraries';
		/**
		 * Remove all markers to load new ones
		 * on the next mount
		 */
		dispatch({
			type: 'UPDATE_LIBRARIES_RAW',
			fields_n_values: {
				by_id: {},
				all_ids: [],
				profile_preview_id: 0,
			},
		});
	}, []);

	const openSearch = useCallback(() => {
		updateSearchRaw({ open: true });
	}, [dispatch]);

	return (
		<LayoutWrapper fetching={20}>
			<div styleName="libraries-wrapper">
				<button
					type="button"
					styleName="search-button"
					onClick={openSearch}>
					<i className="fa fa-search" aria-hidden="true" />
				</button>
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
		</LayoutWrapper>
	);
}

Libraries.propTypes = {
	getLibraries: PropTypes.func.isRequired,
	updateLibrariesRaw: PropTypes.func.isRequired,
	updateMapRaw: PropTypes.func.isRequired,
	updateSearchRaw: PropTypes.func.isRequired,
};

const dispach_picks = ['getLibraries', 'updateLibrariesRaw', 'updateMapRaw', 'updateSearchRaw'];
const mapDispatchToProps = (dispatch) => detailedmapDispatchToProps(dispatch, dispach_picks);
const withCSS = CSSModules(Libraries, styles, { allowMultiple: true });
export default withStore(connect(null, mapDispatchToProps)(withCSS));
