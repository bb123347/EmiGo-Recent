import * as Location from "expo-location";

export async function geocodeAddress(addressParts) {
  const address = addressParts.filter(Boolean).join(", ");

  if (!address.trim()) return null;

  const results = await Location.geocodeAsync(address);

  if (!results?.length) return null;

  return {
    latitude: results[0].latitude,
    longitude: results[0].longitude,
  };
}