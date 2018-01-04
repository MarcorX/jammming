
const clientId = "c4a31972eacb4396b522dd3923389115";
const spotifySearchAPI = 'https://api.spotify.com/v1/search';
const spotifyUserProfileAPI = 'https://api.spotify.com/v1/me';
const spotifyPlaylistAPI = 'https://api.spotify.com/v1/users/${userId}/playlists';
const spotifyPlaylistTracksAPI = 'https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks';
const spotifyRedirectUrl = "http://marcor_jammming.surge.sh";

let accessToken;
let expiresIn;

const Spotify = {

  getAccessToken() {

    if (accessToken) {
        return accessToken;
    }

    let url = window.location.href;
    accessToken = url.match(/access_token=([^&]*)/);
    expiresIn = url.match(/expires_in=([^&]*)/);
    if (accessToken) {
      accessToken = accessToken.slice(1);
      expiresIn = expiresIn.slice(1);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      console.log('access token successful retrieved');
      return accessToken;
    } else {

      let state = Math.floor(1000 + (9999 - 1000) * Math.random());;
      console.log(state);
      window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-private&redirect_uri=${spotifyRedirectUrl}&state=${state}`;
    }
  },

  /* returns a promise */
  search(term) {
    return fetch(`${spotifySearchAPI}?type=track&q=${term}`, {headers: this.buildAuthorizationHeader()}).then(response => response.json()).then(jsonResponse => {
      if (jsonResponse.tracks) {
        return jsonResponse.tracks.items.map(function(track) {
          return {
            id: track.id,
            name: track.name,
            uri: track.uri,
            album: track.album.name,
            artist: track.artists[0].name
          }
        })
      } else {
        return [];
      }
    });
  },

  /* returns a promise */
  savePlaylist(name, trackURIs) {
    return fetch(`${spotifyUserProfileAPI}`, {headers: this.buildAuthorizationHeader()}).then(response => response.json()).then(jsonResponse => {
      let userId = jsonResponse.id;
      return this.createPlaylistWithTracks(userId, name, trackURIs);
    });
  },

  /* returns a promise */
  createPlaylistWithTracks(userId, playlistName, playlistTracks) {
    let jsonBody = JSON.stringify({name: playlistName, public: false});
    let url = spotifyPlaylistAPI.replace("${userId}", userId);
    return fetch(url, { headers: this.buildAuthorizationHeader(), method:'POST', body: jsonBody}).then(response => this.handleResponse(response)).then(jsonResponse => {
      console.log("playlist successful created.");
      let playlistId = jsonResponse.id;
      return this.saveTracksToPlaylist(userId, playlistId, playlistTracks);
    });
  },

  /* returns a promise */
  saveTracksToPlaylist(userId, playlistId, playlistTracks) {
    let jsonBody = JSON.stringify(playlistTracks);
    let url = spotifyPlaylistTracksAPI.replace("${userId}", userId).replace("${playlistId}", playlistId);
    return fetch(url, { headers: this.buildAuthorizationHeader(), method:'POST', body: jsonBody}).then(response => this.handleResponse(response)).then(jsonResponse => {
      console.log("tracks successful stored");
      return jsonResponse.snapshot_id;
    });
  },

  /* returns a promise */
  handleResponse(response) {
    if (response.ok) {
        return response.json();
    }
    throw new Error('Request failed!');
  },

  buildAuthorizationHeader() {
      let token = this.getAccessToken();
      return {Authorization: `Bearer ${token}`};
  },

};

export default Spotify;
