import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { HospitalMapProps } from "./HospitalMap.types";

const ARKANSAS_CENTER = {
  latitude: 34.75,
  longitude: -92.25,
  latitudeDelta: 3.2,
  longitudeDelta: 3.2,
};

export default function HospitalMap({
  dark,
  accent,
  userLocation,
  hospitals,
  ambulances,
  linkedHospitalId,
  selectedHospitalId,
  onSelectHospital,
}: HospitalMapProps) {
  const destination =
    hospitals.find((hospital) => hospital.id === selectedHospitalId) ||
    hospitals.find((hospital) => hospital.id === linkedHospitalId) ||
    hospitals[0];

  return (
    <MapView
      style={styles.map}
      initialRegion={
        userLocation
          ? { ...userLocation, latitudeDelta: 0.8, longitudeDelta: 0.8 }
          : ARKANSAS_CENTER
      }
      userInterfaceStyle={dark ? "dark" : "light"}
      showsUserLocation={Boolean(userLocation)}
      showsMyLocationButton={Boolean(userLocation)}
    >
      {hospitals.map((hospital) => (
        <Marker
          key={hospital.id}
          coordinate={{ latitude: hospital.lat, longitude: hospital.lng }}
          title={hospital.name}
          onPress={() => onSelectHospital?.(hospital.id)}
        >
          <View
            style={[
              styles.hospitalMarker,
              {
                borderColor: accent,
                backgroundColor:
                  hospital.id === selectedHospitalId ||
                  hospital.id === linkedHospitalId
                    ? accent
                    : "#ffffff",
              },
            ]}
          >
            <Text style={styles.markerText}>H</Text>
          </View>
        </Marker>
      ))}

      {ambulances.map((ambulance) => (
        <Marker
          key={ambulance.id}
          coordinate={{ latitude: ambulance.lat, longitude: ambulance.lng }}
          title={ambulance.name}
          description="Ambulance available"
        >
          <View style={styles.ambulanceMarker}>
            <Text style={styles.ambulanceText}>A</Text>
          </View>
        </Marker>
      ))}

      {userLocation && destination && (
        <Polyline
          coordinates={[
            userLocation,
            { latitude: destination.lat, longitude: destination.lng },
          ]}
          strokeColor={accent}
          strokeWidth={3}
          lineDashPattern={[8, 5]}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, minHeight: 300 },
  hospitalMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: { color: "#111827", fontSize: 14, fontWeight: "900" },
  ambulanceMarker: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
  },
  ambulanceText: { color: "#ffffff", fontSize: 13, fontWeight: "900" },
});
