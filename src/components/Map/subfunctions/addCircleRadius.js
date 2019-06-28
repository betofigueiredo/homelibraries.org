export const addCircleRadius = (map, lat, lng, radius) => {
	const _radius = parseInt(radius, 0) * 1000;
	return new window.google.maps.Circle({
		strokeColor: '#51dd9f',
		strokeOpacity: 0.5,
		strokeWeight: 0.8,
		fillColor: '#ffffff',
		fillOpacity: 0.3,
		map,
		center: { lat, lng },
		radius: _radius,
		zIndex: -1,
	});
};
