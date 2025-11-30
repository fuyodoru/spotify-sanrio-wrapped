const CLIENT_ID = '894e36ebf0a7460f99d52b98b8063ffa';
const REDIRECT_URI = 'https://fuyodoru.github.io/spotify-sanrio-wrapped/'; 
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = 'user-top-read';

let accessToken = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');

    // Load saved theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        document.getElementById("theme").value = savedTheme;
        applyTheme();
    }

    // Login with Spotify
    document.getElementById('login-btn').addEventListener('click', () => {
        const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
            REDIRECT_URI
        )}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;

        console.log('Redirecting to:', authUrl);
        window.location.href = authUrl;
    });

    // Try to get token from URL
    getAccessToken();

    // Show My Wrapped button
    document.getElementById('get-data-btn').addEventListener('click', async () => {
        console.log('Show My Wrapped button clicked');

        if (!accessToken) {
            alert('Please log in with Spotify first!');
            console.warn('No access token found');
            return;
        }

        const timeRange = document.getElementById('time-range').value;
        console.log('Selected time range:', timeRange);

        // Optional: show temporary "Loading..." text
        document.getElementById('top-tracks').innerHTML = '<li>Loading tracks...</li>';
        document.getElementById('top-artists').innerHTML = '<li>Loading artists...</li>';
        document.getElementById('top-genres').innerHTML = '<li>Loading genres...</li>';

        try {
            const [tracks, artists] = await Promise.all([
                fetchSpotifyAPI(
                    `https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${timeRange}`
                ),
                fetchSpotifyAPI(
                    `https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${timeRange}`
                ),
            ]);

            console.log('Tracks response:', tracks);
            console.log('Artists response:', artists);

            if (!tracks.items || !artists.items) {
                throw new Error('No items in response (check scopes and token)');
            }

            displayTopTracks(tracks.items);
            displayTopArtists(artists.items);
            displayTopGenres(artists.items);
        } catch (error) {
            console.error('Error fetching Spotify data:', error);
            alert('Something went wrong fetching your data. Check the browser console for details.');
        }
    });
});

function getAccessToken() {
    const hash = window.location.hash;
    console.log('Current hash:', hash);

    if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        accessToken = params.get('access_token');
        const tokenType = params.get('token_type');
        const expiresIn = params.get('expires_in');

        console.log('Access token:', accessToken);
        console.log('Token type:', tokenType);
        console.log('Expires in (seconds):', expiresIn);

        // Show the button once token exists
        document.getElementById('get-data-btn').style.display = 'inline-block';

        // Remove hash but keep the path (important for GitHub Pages)
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        console.warn('No access token found in URL hash.');
    }
}

async function fetchSpotifyAPI(url) {
    console.log('Fetching:', url);

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Spotify API error body:', errorText);
        throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
}

function displayTopTracks(tracks) {
    const trackList = document.getElementById('top-tracks');
    trackList.innerHTML = '';

    if (!tracks.length) {
        trackList.innerHTML = '<li>No top tracks found. Maybe you haven\'t listened enough yet?</li>';
        return;
    }

    tracks.forEach(track => {
        const item = document.createElement('li');
        item.innerHTML = `
            <div class="song">
                <img src="${track.album.images[0]?.url || ''}" width="50" alt="${track.name}" />
                <span>${track.name} by ${track.artists[0].name}</span>
            </div>
        `;
        trackList.appendChild(item);
    });
}

function displayTopArtists(artists) {
    const artistList = document.getElementById('top-artists');
    artistList.innerHTML = '';

    if (!artists.length) {
        artistList.innerHTML = '<li>No top artists found.</li>';
        return;
    }

    artists.forEach(artist => {
        const item = document.createElement('li');
        item.innerHTML = `
            <div class="artist">
                <img src="${artist.images[0]?.url || ''}" width="50" alt="${artist.name}" />
                <span>${artist.name}</span>
            </div>
        `;
        artistList.appendChild(item);
    });
}

function displayTopGenres(artists) {
    const genreList = document.getElementById('top-genres');
    genreList.innerHTML = '';

    const genres = artists.flatMap(a => a.genres || []);
    if (!genres.length) {
        genreList.innerHTML = '<li>No genres found.</li>';
        return;
    }

    const unique = [...new Set(genres)];

    unique.forEach(g => {
        const item = document.createElement('li');
        item.textContent = g;
        genreList.appendChild(item);
    });
}

function applyTheme() {
    const theme = document.getElementById('theme').value;
    const container = document.querySelector('.container');

    container.classList.remove(
        'cinnamoroll-theme',
        'badtz-maru-theme',
        'hello-kitty-theme',
        'keroppi-theme'
    );
    container.classList.add(`${theme}-theme`);

    localStorage.setItem('selectedTheme', theme);
}
