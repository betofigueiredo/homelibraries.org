function rad2deg(angle) {
    return angle * 57.29577951308232; // angle / Math.PI * 180
}

function deg2rad(degrees) {
    const pi = Math.PI;
    return degrees * (pi/180);
}

// Start
const lat = -23.987194;
const lng = -46.260386;
const distance = 5; // km
const radius = 6371;
// Set
const dis_rad = distance / radius;
// latitude boundaries
const maxlat = lat + rad2deg(dis_rad);
const minlat = lat - rad2deg(dis_rad);
// longitude boundaries (longitude gets smaller when latitude increases)
const maxlng = lng + rad2deg(dis_rad / Math.cos(deg2rad(lat)));
const minlng = lng - rad2deg(dis_rad / Math.cos(deg2rad(lat)));


console.log(
    minlng
);



    //     "id": "ck1sfhh45001o0738ofyol3up",
    //     "name": "Bob",
    //     "username": null,
    //     "email": "bob@prisma.io",
    //     "lat": "-23.99644600",
    //     "lng": "-46.25787500"
    //   },
    //   {
    //     "id": "ck25926ho001l0738apih5znq",
    //     "name": "Beto Figueiredo",
    //     "username": "",
    //     "email": "beto@2sidesof1.com",
    //     "lat": "-24.01268000",
    //     "lng": "-46.27833700"
    //   },
    //   {
    //     "id": "ck2b2xdq5000m0738c8kb8s1q",
    //     "name": "Floripa Library",
    //     "username": "",
    //     "email": "floripa@teste.com",
    //     "lat": "-27.589924",
    //     "lng": "-48.580800"

