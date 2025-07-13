// Utilitário para carregar o Google Maps de forma assíncrona
const GOOGLE_MAPS_API_KEY = 'AIzaSyA5MXgqpCfg7RlwtaZoZ2VS7s_DIV0NkDU';

let googleMapsLoaded = false;
let loadPromise = null;

export const loadGoogleMaps = () => {
  if (googleMapsLoaded) {
    return Promise.resolve(window.google);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // Verifica se já está carregado
    if (window.google && window.google.maps) {
      googleMapsLoaded = true;
      resolve(window.google);
      return;
    }

    // Cria o script dinamicamente
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    // Define a função de callback global
    window.initGoogleMaps = () => {
      googleMapsLoaded = true;
      resolve(window.google);
    };

    // Adiciona o script ao DOM
    document.head.appendChild(script);

    // Timeout para evitar que fique carregando indefinidamente
    setTimeout(() => {
      if (!googleMapsLoaded) {
        reject(new Error('Falha ao carregar Google Maps'));
      }
    }, 10000);
  });

  return loadPromise;
};

export const isGoogleMapsLoaded = () => googleMapsLoaded; 