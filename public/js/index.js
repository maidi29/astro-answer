const zodiacs = {
    aries: 'Mar 21 – Apr 19',
    taurus: 'Apr 20 – May 20',
    gemini: 'May 21 – Jun 20',
    cancer: 'Jun 21 – Jul 22',
    leo: 'Jul 23 – Aug 22',
    virgo: 'Aug 23 – Sep 22',
    libra: 'Sep 23 – Oct 22',
    scorpio: 'Oct 23 – Nov 21',
    sagittarius: 'Nov 22 – Dec 21',
    capricorn: 'Dec 22 – Jan 19',
    aquarius: 'Jan 20 – Feb 18',
    pisces: 'Feb 19 – Mar 20',
};
const isExtension = window.chrome && chrome.runtime && chrome.runtime.id;
// Extensions and pages opened as a file can't use relative API paths
const API = isExtension || location.protocol === 'file:' ? 'https://astro-answer.com/api' : '/api';
const config = {
    width: window.innerHeight - window.innerWidth < 0 ? 0 : window.innerHeight * 2, // Default width, 0 = full parent element width;// height is determined by projection
    projection: "aitoff",    // Map projection used: see below
    projectionRatio: null,   // Optional override for default projection ratio
    transform: "equatorial", // Coordinate transformation: equatorial (default),
                             // ecliptic, galactic, supergalactic
    center: null,       // Initial center coordinates in set transform
                        // [longitude, latitude, orientation] all in degrees
                        // null = default center [0,0,0]
    orientationfixed: true,  // Keep orientation angle the same as center[2]
    geopos: null,       // optional initial geographic position [lat,lon] in degrees,
                        // overrides center
    follow: "zenith",   // on which coordinates to center the map, default: zenith, if location enabled,
                        // otherwise center
    zoomlevel: 3,    // initial zoom level 0...zoomextend; 0|null = default, 1 = 100%, 0 < x <= zoomextend
    zoomextend: 10,     // maximum zoom level
    adaptable: true,    // Sizes are increased with higher zoom-levels
    interactive: !window.matchMedia("(pointer: coarse)").matches,  // Enable zooming and rotation with mousewheel and dragging
    form:  false,         // Display form for interactive settings. Needs a div with
                        // id="celestial-form", created automatically if not present
    location: false,    // Display location settings. Deprecated, use formFields below
    formFields: {
        "location": true,  // Set visiblity for each group of fields with the respective id
        "general": true,
        "stars": true,
        "dsos": true,
        "constellations": true,
        "lines": true,
        "other": true,
        "download": false},
    advanced: true,     // Display fewer form fields if false
    daterange: [],      // Calender date range; null: displaydate-+10; [n<100]: displaydate-+n; [yr]: yr-+10;
                        // [yr, n<100]: [yr-n, yr+n]; [yr0, yr1]
    controls: true,     // Display zoom controls
    lang: "",           // Global language override for names, any name setting that has the chosen language available
                        // Default: desig or empty string for designations, other languages as used anywhere else
    culture: "",        // Source of constellations and star names, default "iau", other: "cn" Traditional Chinese
    container: null,   // ID of parent element, e.g. div, null = html-body
    datapath: "data/",  // Path/URL to data files, empty = subfolder 'data'
    stars: {
        show: true,    // Show stars
        limit: 6,      // Show only stars brighter than limit magnitude
        colors: true,  // Show stars in spectral colors, if not use default color
        style: { fill: "#ffffff", opacity: 1 }, // Default style for stars
        designation: false, // Show star names (Bayer, Flamsteed, Variable star, Gliese or designation,
                           // i.e. whichever of the previous applies first); may vary with culture setting
        designationType: "desig",  // Which kind of name is displayed as designation (fieldname in starnames.json)
        designationStyle: { fill: "#ddddbb", font: "11px Comfortaa, sans-serif", align: "left", baseline: "top" },
        designationLimit: 2.5,  // Show only names for stars brighter than nameLimit
        propername: window.innerHeight - window.innerWidth < 50,   // Show proper name (if present)
        propernameType: "name", // Language for proper name, default IAU name; may vary with culture setting
                                // (see list below of languages codes available for stars)
        propernameStyle: { fill: "#ddddbb", font: "13px Comfortaa, sans-serif", align: "right", baseline: "bottom" },
        propernameLimit: 1.5,  // Show proper names for stars brighter than propernameLimit
        size: 7,       // Maximum size (radius) of star circle in pixels
        exponent: -0.28, // Scale exponent for star size, larger = more linear
        data: 'stars.6.json' // Data source for stellar data,
                             // number indicates limit magnitude
    },
    dsos: {
        show: true,    // Show Deep Space Objects
        limit: 6,      // Show only DSOs brighter than limit magnitude
        colors: true,  // // Show DSOs in symbol colors if true, use style setting below if false
        style: { fill: "#cccccc", stroke: "#cccccc", width: 2, opacity: 1 }, // Default style for dsos
        names: window.innerHeight - window.innerWidth < 50,   // Show DSO names
        namesType: "name",  // Type of DSO ('desig' or language) name shown
                            // (see list below for languages codes available for dsos)
        nameStyle: { fill: "#cccccc", font: "11px Comfortaa, sans-serif",
            align: "left", baseline: "top" }, // Style for DSO names
        nameLimit: 6,  // Show only names for DSOs brighter than namelimit
        size: null,    // Optional seperate scale size for DSOs, null = stars.size
        exponent: 1.4, // Scale exponent for DSO size, larger = more non-linear
        data: 'dsos.bright.json', // Data source for DSOs,
                                  // opt. number indicates limit magnitude
        symbols: {  //DSO symbol styles, 'stroke'-parameter present = outline
            gg: {shape: "circle", fill: "#8384C3"},          // Galaxy cluster
            g:  {shape: "ellipse", fill: "#8384C3"},         // Generic galaxy
            s:  {shape: "ellipse", fill: "#8384C3"},         // Spiral galaxy
            s0: {shape: "ellipse", fill: "#8384C3"},         // Lenticular galaxy
            sd: {shape: "ellipse", fill: "#8384C3"},         // Dwarf galaxy
            e:  {shape: "ellipse", fill: "#8384C3"},         // Elliptical galaxy
            i:  {shape: "ellipse", fill: "#8384C3"},         // Irregular galaxy
            oc: {shape: "circle", fill: "#FFE785", stroke: "#FFE785", width: 1.5},             // Open cluster
            gc: {shape: "circle", fill: "#ffbe5c"},          // Globular cluster
            en: {shape: "square", fill: "#e576c9"},          // Emission nebula
            bn: {shape: "square", fill: "#e576c9", stroke: "#e576c9", width: 2}, // Generic bright nebula
            sfr:{shape: "square", fill: "#e270ff", stroke: "#e270ff", width: 2},  // Star forming region
            rn: {shape: "square", fill: "#00cccc"},          // Reflection nebula
            pn: {shape: "diamond", fill: "#00cccc"},         // Planetary nebula
            snr:{shape: "diamond", fill: "#e576c9"},         // Supernova remnant
            dn: {shape: "square", fill: "#999999", stroke: "#999999", width: 2},               // Dark nebula grey
            pos:{shape: "marker", fill: "#cccccc", stroke: "#cccccc", width: 1.5}              // Generic marker
        }
    },
    planets: {  //Show planet locations, if date-time is set
        show: true,
        // List of all objects to show
        which: ["sol", "mer", "ven", "ter", "lun", "mar", "jup", "sat", "ura", "nep"],
        // Font styles for planetary symbols
        symbols: {  // Character and color for each symbol in 'which' above (simple circle: \u25cf), optional size override for Sun & Moon
            "sol": {symbol: "\u2609", letter:"Su", fill: "#ffff00", size:""},
            "mer": {symbol: "\u263f", letter:"Me", fill: "#cccccc"},
            "ven": {symbol: "\u2640", letter:"V", fill: "#eeeecc"},
            "ter": {symbol: "\u2295", letter:"T", fill: "#00ccff"},
            "lun": {symbol: "\u25cf", letter:"L", fill: "#ffffff", size:""}, // overridden by generated crecent, except letter & size
            "mar": {symbol: "\u2642", letter:"Ma", fill: "#ff6600"},
            "cer": {symbol: "\u26b3", letter:"C", fill: "#cccccc"},
            "ves": {symbol: "\u26b6", letter:"Ma", fill: "#cccccc"},
            "jup": {symbol: "\u2643", letter:"J", fill: "#ffaa33"},
            "sat": {symbol: "\u2644", letter:"Sa", fill: "#ffdd66"},
            "ura": {symbol: "\u2645", letter:"U", fill: "#66ccff"},
            "nep": {symbol: "\u2646", letter:"N", fill: "#6666ff"},
            "plu": {symbol: "\u2647", letter:"P", fill: "#aaaaaa"},
            "eri": {symbol: "\u26aa", letter:"E", fill: "#eeeeee"}
        },
        symbolStyle: { fill: "#fad0e3", font: "bold 20px Comfortaa, sans-serif",
            align: "center", baseline: "middle" },
        symbolType: "symbol",  // Type of planet symbol: 'symbol' graphic planet sign, 'disk' filled circle scaled by magnitude
                               // 'letter': 1 or 2 letters S Me V L Ma J S U N
        names: false,          // Show name in nameType language next to symbol
        nameStyle: { fill: "#fad0e3", font: "12px Comfortaa, sans-serif", align: "right", baseline: "top" },
        namesType: "en"     // Language of planet name (see list below of language codes available for planets),
                               // or desig = 3-letter designation
    },
    constellations: {
        names: window.innerHeight - window.innerWidth < 50,      // Show constellation names
        namesType: "iau", // Type of name Latin (iau, default), 3 letter designation (desig) or other language (see list below)
        nameStyle: { fill:"#cccc99", align: "center", baseline: "middle",
            font: ["12px Comfortaa, sans-serif",  // Style for constellations
                "11px Comfortaa, sans-serif",  // Different fonts for diff.
                "10px Comfortaa, sans-serif"]},// ranked constellations
        lines: true,   // Show constellation lines, style below
        lineStyle: { stroke: "#cccccc", width: 1, opacity: 0.3 },
        bounds: false, // Show constellation boundaries, style below
        boundStyle: { stroke: "#cccc99", width: 0.5, opacity: 0.8, dash: [2, 4] }
    },
    mw: {
        show: true,     // Show Milky Way as filled multi-polygon outlines
        style: { fill: "#ffffff", opacity: 0.1 }  // Style for MW layers
    },
    lines: {  // Display & styles for graticule & some planes
        graticule: { show: false, stroke: "#cccccc", width: 0.6, opacity: 0.8,
            // grid values: "outline", "center", or [lat,...] specific position
            lon: {pos: [""], fill: "#eee", font: "10px Comfortaa, sans-serif"},
            // grid values: "outline", "center", or [lon,...] specific position
            lat: {pos: [""], fill: "#eee", font: "10px Comfortaa, sans-serif"}},
        equatorial: { show: false, stroke: "#aaaaaa", width: 1.3, opacity: 0.7 },
        ecliptic: { show: true, stroke: "#66cc66", width: 1.3, opacity: 0.7 },
        galactic: { show: true, stroke: "#cc6666", width: 1.3, opacity: 0.7 },
        supergalactic: { show: false, stroke: "#cc66cc", width: 1.3, opacity: 0.7 }
    },
    background: {        // Background style
        fill: "#070E22",   // Area fill
        opacity: 1,
        stroke: "#070E22", // Outline
        width: 1.5
    },
    horizon: {  //Show horizon marker, if location is set and map projection is all-sky
        show: true,
        stroke: "#cccccc", // Line
        width: 1.0,
        fill: "#030711",   // Area below horizon
        opacity: 0.5
    },
    daylight: {  //Show day sky as a gradient, if location is set and map projection is hemispheric
        show: true
    }
};


// The star map is decoration, so the rest of the page keeps working if it fails to load
let mapReady = false;
try {
    Celestial.display(config);
    mapReady = true;

    onresize = () => {
        Celestial.resize({width: window.innerHeight - window.innerWidth < 0 ? 0 : window.innerHeight});
    };

    navigator.geolocation.getCurrentPosition((position) => {
        Celestial.location([position.coords.latitude, position.coords.longitude]);
    });
} catch (e) {
    console.error('Could not display star map', e);
}

// "The sky above <place>, <date and time>" below the title
let coords = null;
let place = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').split('/').pop().replace(/_/g, ' ');

const sky = document.getElementById('sky');
const skyReset = document.getElementById('sky-reset');
let skyShown = true;

const renderSky = () => {
    const now = new Date().toLocaleString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    sky.textContent = place ? `The sky above ${place}, ${now}` : `The sky, ${now}`;
    skyReset.textContent = place ? `↺ Back to the sky above ${place}` : '↺ Back to your sky';
};
renderSky();
setInterval(() => skyShown && renderSky(), 30 * 1000);

// Once the map is dragged or zoomed it no longer shows the sky above the visitor.
// The view right before the first interaction is remembered, so it can be restored.
let skyView = null;

const rememberView = () => {
    if (skyShown && mapReady) {
        skyView = {center: Celestial.rotate().slice(), zoom: Celestial.zoomBy()};
    }
};

const hideSky = () => {
    if (!skyShown || !skyView) return;
    skyShown = false;
    sky.classList.add('hidden');
    skyReset.classList.remove('hidden');
};

skyReset.addEventListener('click', () => {
    Celestial.rotate({center: skyView.center.slice()});
    Celestial.zoomBy(skyView.zoom / Celestial.zoomBy());
    skyShown = true;
    renderSky();
    sky.classList.remove('hidden');
    skyReset.classList.add('hidden');
});
const map = document.getElementById('celestial-map');
let dragStart = null;
// Capture phase, so the view is remembered before the map itself reacts
map.addEventListener('wheel', () => { rememberView(); hideSky(); }, {capture: true, passive: true});
map.addEventListener('pointerdown', (event) => {
    rememberView();
    dragStart = {x: event.clientX, y: event.clientY};
}, {capture: true});
map.addEventListener('pointerup', () => dragStart = null);
map.addEventListener('pointermove', (event) => {
    if (dragStart && Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) > 5) {
        hideSky();
    }
});
document.addEventListener('click', (event) => {
    if (event.target.closest('#celestial-zoomin, #celestial-zoomout')) {
        hideSky();
    }
});
document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('#celestial-zoomin, #celestial-zoomout')) {
        rememberView();
    }
}, {capture: true});

navigator.geolocation?.getCurrentPosition((position) => {
    const {latitude, longitude} = position.coords;
    // Rounded (~1 km) - enough to know what is above the horizon
    coords = {latitude: +latitude.toFixed(2), longitude: +longitude.toFixed(2)};
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${navigator.language.split('-')[0]}`)
        .then((response) => response.ok ? response.json() : Promise.reject(response))
        .then((data) => {
            place = data.city || data.locality || data.principalSubdivision || data.countryName || place;
            renderSky();
        })
        .catch(() => {});
});

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

const skeleton = '<span class="skeleton"></span><span class="skeleton"></span><span class="skeleton short"></span>';

const fetchText = (url, field) => fetch(url).then((response) =>
    response.ok ? response.json().then((data) => data[field]) : Promise.reject(response)
);

// Dialogs
const zodiacDialog = document.getElementById('zodiac-dialog');
const aboutDialog = document.getElementById('about');

document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
        // Close on close button or a click on the backdrop (outside the dialog box)
        const rect = dialog.getBoundingClientRect();
        const outside = event.clientX < rect.left || event.clientX > rect.right
            || event.clientY < rect.top || event.clientY > rect.bottom;
        if (event.target.closest('[data-close]') || (event.target === dialog && outside)) {
            dialog.close();
        }
    });
});
document.getElementById('about-button').addEventListener('click', () => aboutDialog.showModal());

const openZodiacDialog = () => zodiacDialog.showModal();

document.getElementById('zodiac-grid').innerHTML = Object.entries(zodiacs).map(([z, dates]) => `
    <button class="zodiac-option" type="button" data-zodiac="${z}">
        <img src="images/zodiac/${z}.svg" width="96" height="96" alt="">
        <span class="zodiac-name">${capitalize(z)}</span>
        <span class="zodiac-dates">${dates}</span>
    </button>
`).join('');

document.getElementById('zodiac-grid').addEventListener('click', (event) => {
    const option = event.target.closest('[data-zodiac]');
    if (!option) return;
    const zodiac = option.dataset.zodiac;
    try { localStorage.setItem('zodiac', zodiac); } catch (e) {}
    selectedZodiac = zodiac;
    if (isExtension) {
        chrome.storage.sync.set({zodiac});
    }
    zodiacDialog.close();
    showHoroscope(zodiac);
});

// Horoscope
let selectedZodiac = null;

const showHoroscope = (zodiac) => {
    if (!zodiacs[zodiac]) return;
    selectedZodiac = zodiac;
    const card = document.getElementById('zodiac');
    card.innerHTML = `
        <div class="horoscope-header">
            <button class="zodiac-badge" id="change-zodiac" type="button" title="Change sign">
                <img src="images/zodiac/${zodiac}.svg" width="64" height="64" alt="${capitalize(zodiac)}">
            </button>
            <div>
                <h2>${capitalize(zodiac)}</h2>
                <p class="muted date-line">${today}</p>
            </div>
            <button class="link-button change" id="change-zodiac-link" type="button">Change</button>
        </div>
        <p id="horoscope" class="horoscope">${skeleton}</p>
    `;
    document.getElementById('change-zodiac').addEventListener('click', openZodiacDialog);
    document.getElementById('change-zodiac-link').addEventListener('click', openZodiacDialog);
    fetchText(`${API}/horoscope/${zodiac}`, 'horoscope')
        .then((horoscope) => document.getElementById('horoscope').textContent = horoscope)
        .catch(() => document.getElementById('horoscope').textContent = 'No horoscope available at the moment. Try again later.');
};

document.getElementById('choose-zodiac').addEventListener('click', openZodiacDialog);

// One question per day
const localDay = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

const loadAnswer = () => {
    try {
        const saved = JSON.parse(localStorage.getItem('answer'));
        return saved && saved.day === localDay() ? saved : null;
    } catch (e) {
        return null;
    }
};

const untilTomorrow = () => {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const minutes = Math.ceil((midnight - new Date()) / 60000);
    return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
};

const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

const renderAsk = () => {
    const ask = document.getElementById('ask');
    const saved = loadAnswer();
    if (saved) {
        ask.innerHTML = `
            <p class="question">“${escapeHtml(saved.question)}”</p>
            <p class="answer">${saved.answer ? escapeHtml(saved.answer) : 'The stars have already answered today.'}</p>
            <p class="muted next">You can ask the stars your next question in <span id="countdown">${untilTomorrow()}</span></p>
        `;
        return;
    }
    ask.innerHTML = `
        <form id="question-form" autocomplete="off">
            <div class="input-wrapper">
                <input type="text" id="question" minlength="5" maxlength="300" required
                       placeholder="Ask the stars a question…" aria-label="Ask the stars one question today">
                <button class="button" type="submit">Ask</button>
            </div>
        </form>
    `;
    document.getElementById('question-form').addEventListener('submit', askQuestion);
};

const askQuestion = (event) => {
    event.preventDefault();
    const question = document.getElementById('question').value.trim();
    const ask = document.getElementById('ask');
    ask.innerHTML = `
        <p class="question">“${escapeHtml(question)}”</p>
        <p class="answer">${skeleton}</p>
    `;
    const save = (answer) => {
        try { localStorage.setItem('answer', JSON.stringify({day: localDay(), question, answer})); } catch (e) {}
        renderAsk();
    };
    fetch(`${API}/ask`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            question,
            zodiac: selectedZodiac,
            place,
            localTime: new Date().toLocaleString('en-GB', {dateStyle: 'full', timeStyle: 'short'}),
            ...coords,
        }),
    }).then((response) => {
        if (response.status === 429) return save(null);
        if (!response.ok) return Promise.reject(response);
        return response.json().then((data) => save(data.answer));
    }).catch(() => {
        renderAsk();
        document.getElementById('question').value = question;
        document.getElementById('question-form').insertAdjacentHTML('beforeend',
            '<p class="muted">The stars are clouded right now. Try again in a moment.</p>');
    });
};

renderAsk();
setInterval(() => {
    const countdown = document.getElementById('countdown');
    if (countdown) {
        loadAnswer() ? countdown.textContent = untilTomorrow() : renderAsk();
    }
}, 30 * 1000);

// Restore the saved zodiac sign
if (isExtension) {
    chrome.storage.sync.get(['zodiac'], (items) => showHoroscope(items.zodiac || localStorage.getItem('zodiac')));
} else {
    try { showHoroscope(localStorage.getItem('zodiac')); } catch (e) {}
}
