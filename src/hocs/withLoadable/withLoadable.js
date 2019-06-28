import React from 'react';
import Loadable from 'react-loadable';

const LoadableComponent = () => Loadable({
	loader: () => import('./my-component'),
	loading: <div>Loading...</div>,
});

// const withLoadable = () => <LoadableComponent/>;

export default LoadableComponent;
