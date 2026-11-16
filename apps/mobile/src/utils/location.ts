import * as Location from 'expo-location';

/** Ask for permission and read the phone's position. Returns null if refused or unavailable. */
export async function getDeviceLocation(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return null;
    const last = await Location.getLastKnownPositionAsync({ maxAge: 30 * 60 * 1000 });
    const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { latitude: Math.round(pos.coords.latitude * 1e5) / 1e5, longitude: Math.round(pos.coords.longitude * 1e5) / 1e5 };
  } catch {
    return null;
  }
}
