
const url = "http://192.168.223.141:3000/"


var map = L.map('map-wrapper', { zoomControl: false, zoom: 15, center: [49.4875, 8.4660] })
var basemap = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
    minZoom: 10,
    maxZoom: 20
});
basemap.addTo(map);
oldZoom = map.getZoom()
map.on('dragend', function () {
    // alert(map.getZoom())
    // alert(map.getBounds()["_northEast"]["lat"])
    getToiletsFast(map.getBounds()['_southWest']['lat'], map.getBounds()['_southWest']['lng'], map.getBounds()['_northEast']['lat'], map.getBounds()['_northEast']['lng'])
    oldZoom = map.getZoom()
})
map.on('zoomend', function () {
    if (map.getZoom() < oldZoom) {
        // get new toilets
        getToiletsFast(map.getBounds()['_southWest']['lat'], map.getBounds()['_southWest']['lng'], map.getBounds()['_northEast']['lat'], map.getBounds()['_northEast']['lng'])
        oldZoom = map.getZoom()
    }
})

// cheat fuer praesentation
document.getElementById("center_button").addEventListener("click", function() {
    map.setView([49.4945320,8.4787963])
})

async function overpass_fetch(overpass_query) {
    let response = await fetch(overpass_query, {
        headers: {
            'User-Agent': 'wo klo? v0.1.0'
        }
    });
    let data = await response.json().then(res => display_markers(res));
}

markers = []

var toiletIcon = L.icon({
    iconUrl: 'icons/toilet.png',
    shadowUrl: 'icons/shadow.png',
    iconSize:     [40, 40], // size of the icon
    shadowSize:   [40, 40], // size of the shadow
    shadowAnchor: [20, 30],  // the same for the shadow
    iconAnchor:   [20, 40], // point of the icon which will correspond to marker's location
});


function display_markers(markersNew) {
    console.log(markers)
    markersNew.forEach(element => {
        coords = element.slice(0,2)
        skip = false
        markers.forEach(prevMarker => {
            if (prevMarker.getLatLng()["lat"] == coords[0] && prevMarker.getLatLng()["lng"] == coords[1]) { skip = true }
        })
        if (skip) { return }
        marker = L.marker(coords, {icon: toiletIcon})
        marker.on('click', async function () {
            document.getElementById("details").style.zIndex = 2
            let response = await fetch(`${url}get_toilet?id=${element.slice(-1)[0]}`, {
                headers: {
                    'User-Agent': 'wo klo? v0.1.0'
                }
            });
            await response.json().then(res => {
                document.getElementById("toilet_name").innerText = "Toilette #" + element.slice(-1)
                badge_bar = document.getElementById("toilet_badges")
                badge_bar.innerHTML = ""
                if('wheelchair' in res) {
                    wheelchair_icon = document.createElement("img")
                    if(res['wheelchair'] == true) {
                        wheelchair_icon.src = "icons/wheelchair.svg"
                    }
                    else {
                        wheelchair_icon.src = "icons/no_wheelchair.svg"
                    }
                    badge_bar.appendChild(wheelchair_icon)
                }
                if('fee' in res) {
                    fee_icon = document.createElement("img")
                    if(res['fee'] == true) {
                        fee_icon.src = "icons/fee.svg"
                    }
                    else {
                        fee_icon.src = "icons/no_fee.svg"
                    }
                    badge_bar.appendChild(fee_icon)
                }
                gmapsbutton = document.getElementById("google_maps_button")
                gmapsbutton.addEventListener("click", function() {
                    window.location.href = `https://maps.google.com/maps?q=${element[0]},${element[1]}`
                })
                // wheelchair_icon2 = document.createElement("img")
                // wheelchair_icon2.src = "icons/wheelchair.svg"
                // badge_bar.appendChild(wheelchair_icon2)
            })
        })
        map.addLayer(marker)
        markers.push(marker)

    })
}

function getToiletsFast(x1, y1, x2, y2) {
    if (x1 == undefined) { return }
    overpass_fetch(`${url}query_toilets_fast?x1=${x1}&y1=${y1}&x2=${x2}&y2=${y2}`);
}

getToiletsFast(map.getBounds()['_southWest']['lat'], map.getBounds()['_southWest']['lng'], map.getBounds()['_northEast']['lat'], map.getBounds()['_northEast']['lng'])