const CLIENT_ID = '894e36ebf0a7460f99d52b98b8063ffa'; // Replace with your Spotify Client ID
const REDIRECT_URI = 'https://fuyodoru.github.io/spotify-sanrio-wrapped/'; // Update with your deployment URI
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';
const SCOPES = 'user-top-read';

let accessToken = "";

document.getElementById('login-btn').addEventListener('click', () => {
  const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;
  window.location.href = authUrl;
});

function getAccessToken() {
  const hash = window.location.hash;
  if (hash) {
    accessToken = new URLSearchParams(hash.substring(1)).get('access_token');
    window.history.replaceState({}, document.title, '/');
    document.getElementById('get-data-btn').style.display = 'inline-block';
  }
}
getAccessToken();

document.getElementById('get-data-btn').addEventListener('click', async () => {
  const timeRange = 'medium_term'; // Change this to get short, medium, or long term data
  const [tracks, artists] = await Promise.all([
    fetchSpotifyAPI(`https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${timeRange}`),
    fetchSpotifyAPI(`https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${timeRange}`)
  ]);
  displayTopTracks(tracks.items);
  displayTopArtists(artists.items);
  displayTopGenres(artists.items);
});

async function fetchSpotifyAPI(url) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
}

function displayTopTracks(tracks) {
  const trackList = document.getElementById('top-tracks');
  trackList.innerHTML = '';
  tracks.forEach((track) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <div class="song">
        <img src="${track.album.images[0].url}" width="50" alt="${track.name}" />
        <span>${track.name} by ${track.artists[0].name}</span>
      </div>`;
    trackList.appendChild(listItem);
  });
}

function displayTopArtists(artists) {
  const artistList = document.getElementById('top-artists');
  artistList.innerHTML = '';
  artists.forEach((artist) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <div class="artist">
        <img src="${artist.images[0]?.url || ''}" width="50" alt="${artist.name}" />
        <span>${artist.name}</span>
      </div>`;
    artistList.appendChild(listItem);
  });
}

function displayTopGenres(artists) {
  const genreList = document.getElementById('top-genres');
  genreList.innerHTML = '';
  const genres = artists.flatMap(artist => artist.genres);
  const uniqueGenres = [...new Set(genres)];
  uniqueGenres.forEach(genre => {
    const listItem = document.createElement('li');
    listItem.textContent = genre;
    genreList.appendChild(listItem);
  });
}

function applyTheme() {
  const theme = document.getElementById("theme").value;
  const container = document.querySelector(".container");

  // Remove existing theme classes
  container.classList.remove("cinnamoroll-theme", "badtz-maru-theme", "hello-kitty-theme", "keroppi-theme");

  // Add selected theme class
  container.classList.add(`${theme}-theme`);
}
