// src/utils/loadAlbums.js
import albumMaMoM from '@/assets/albums/ma-mom/album.js';
import songsMaMoM from '@/assets/albums/ma-mom/songs.js';
import albumWernherWon from '@/assets/albums/wernher-won/album.js';
import songsWernherWon from '@/assets/albums/wernher-won/songs.js';

const loadAlbums = () => {
  const albums = [
    {
      ...albumMaMoM,
      songs: songsMaMoM,
      route: '/album-ma-mom'
    },
    {
      ...albumWernherWon,
      songs: songsWernherWon,
      route: '/album-wernher-won'
    }
    // Add more albums as needed
  ];
  return albums;
};

export default loadAlbums;
