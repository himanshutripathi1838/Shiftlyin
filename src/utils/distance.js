export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const values = [lat1, lon1, lat2, lon2].map(Number);
  if (values.some((value) => Number.isNaN(value))) return null;

  const [aLat, aLon, bLat, bLon] = values;
  const radiusKm = 6371;
  const toRad = (degree) => (degree * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;

  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isWithinMeters(lat1, lon1, lat2, lon2, meters = 100) {
  const distance = calculateDistanceKm(lat1, lon1, lat2, lon2);
  return distance !== null && distance * 1000 <= meters;
}

export function formatDistance(distanceKm) {
  if (distanceKm === null) return "Location needed";
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m away`;
  return `${distanceKm.toFixed(1)} km away`;
}
