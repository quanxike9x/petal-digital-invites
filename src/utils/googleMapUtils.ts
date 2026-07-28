/**
 * Convert arbitrary Google Maps share/location links to Embeddable iframe URLs
 */
export const getGoogleMapEmbedUrl = (url?: string, address?: string): string => {
  if (!url && !address) {
    return 'https://maps.google.com/maps?q=Ho+Chi+Minh+City&t=&z=13&ie=UTF8&iwloc=&output=embed';
  }

  if (url) {
    // Check if it's already an embed iframe URL
    if (url.includes('/maps/embed') || url.includes('output=embed')) {
      return url;
    }

    // Extract query or coords from google maps link
    const qMatch = url.match(/[?&]q=([^&]+)/);
    if (qMatch && qMatch[1]) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(qMatch[1]))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    const placeMatch = url.match(/\/place\/([^/]+)/);
    if (placeMatch && placeMatch[1]) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1]))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    const llMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) {
      return `https://maps.google.com/maps?q=${llMatch[1]},${llMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  const query = address ? address : 'Việt Nam';
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};
