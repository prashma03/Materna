import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { Navigation, Phone } from "lucide-react-native";
import HospitalMap from "../components/HospitalMap";

interface Props {
  theme: "dark" | "light";
  riskLevel: "Green" | "Yellow" | "Red";
}

const HOSPITALS = [
  {
    id: "1",
    name: "Delta Memorial Hospital",
    type: "Labor & Delivery",
    county: "Desha",
    phone: "8707935000",
    address: "811 South St, Dumas, AR",
    beds: 3,
    hasED: true,
    lat: 33.8876,
    lng: -91.4929,
  },
  {
    id: "2",
    name: "UAMS Medical Center",
    type: "Full OB Care",
    county: "Pulaski",
    phone: "5016865000",
    address: "4301 W Markham St, Little Rock, AR",
    beds: 7,
    hasED: true,
    lat: 34.7465,
    lng: -92.3459,
  },
  {
    id: "3",
    name: "Jefferson Regional Medical Center",
    type: "OB & Labor Unit",
    county: "Jefferson",
    phone: "8705412000",
    address: "1600 W 40th Ave, Pine Bluff, AR",
    beds: 4,
    hasED: true,
    lat: 34.2284,
    lng: -92.0032,
  },
  {
    id: "4",
    name: "ARcare Rural Health Clinic",
    type: "Prenatal Care Only",
    county: "Desha",
    phone: "8704602000",
    address: "106 Main St, McGehee, AR",
    beds: 0,
    hasED: false,
    lat: 33.6337,
    lng: -91.3998,
  },
];

const AMBULANCES = [
  { id: "amb-1", name: "Ambulance 047", county: "Desha", lat: 33.82, lng: -91.45 },
  { id: "amb-2", name: "Ambulance 031", county: "Jefferson", lat: 34.18, lng: -91.91 },
  { id: "amb-3", name: "Ambulance 018", county: "Pulaski", lat: 34.72, lng: -92.3 },
];

const ARKANSAS_COUNTIES = [
  "Arkansas",
  "Ashley",
  "Baxter",
  "Benton",
  "Boone",
  "Bradley",
  "Calhoun",
  "Carroll",
  "Chicot",
  "Clark",
  "Clay",
  "Cleburne",
  "Cleveland",
  "Columbia",
  "Conway",
  "Craighead",
  "Crawford",
  "Crittenden",
  "Cross",
  "Dallas",
  "Desha",
  "Drew",
  "Faulkner",
  "Franklin",
  "Fulton",
  "Garland",
  "Grant",
  "Greene",
  "Hempstead",
  "Hot Spring",
  "Howard",
  "Independence",
  "Izard",
  "Jackson",
  "Jefferson",
  "Johnson",
  "Lafayette",
  "Lawrence",
  "Lee",
  "Lincoln",
  "Little River",
  "Logan",
  "Lonoke",
  "Madison",
  "Marion",
  "Miller",
  "Mississippi",
  "Monroe",
  "Montgomery",
  "Nevada",
  "Newton",
  "Ouachita",
  "Perry",
  "Phillips",
  "Pike",
  "Poinsett",
  "Polk",
  "Pope",
  "Prairie",
  "Pulaski",
  "Randolph",
  "St. Francis",
  "Saline",
  "Scott",
  "Searcy",
  "Sebastian",
  "Sevier",
  "Sharp",
  "Stone",
  "Union",
  "Van Buren",
  "Washington",
  "White",
  "Woodruff",
  "Yell",
];

type LocationStatus = "idle" | "requesting" | "granted" | "denied";
type ResourceType = "ambulance" | "ld" | "ed";

export default function HospitalsScreen({ theme, riskLevel }: Props) {
  const dark = theme === "dark";
  const c = dark ? colors.dark : colors.light;

  const [selectedTab, setSelectedTab] = useState<"map" | "list">("list");
  const [selectedCounty, setSelectedCounty] = useState("All");
  const [countyMenuOpen, setCountyMenuOpen] = useState(false);
  const [countySearch, setCountySearch] = useState("");
  const [linkedId, setLinkedId] = useState("1");
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>("1");
  const [ambulances, setAmbulances] = useState(AMBULANCES);
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLabel, setLocationLabel] = useState("Location not shared");

  const matchingCounties = useMemo(() => {
    const query = countySearch.trim().toLowerCase();
    return query
      ? ARKANSAS_COUNTIES.filter((county) =>
          county.toLowerCase().includes(query)
        )
      : ARKANSAS_COUNTIES;
  }, [countySearch]);

  const filteredHospitals = useMemo(
    () =>
      selectedCounty === "All"
        ? HOSPITALS
        : HOSPITALS.filter((hospital) => hospital.county === selectedCounty),
    [selectedCounty]
  );

  const filteredAmbulances = useMemo(
    () =>
      selectedCounty === "All"
        ? ambulances
        : ambulances.filter((ambulance) => ambulance.county === selectedCounty),
    [ambulances, selectedCounty]
  );

  const rankedHospitals = useMemo(
    () =>
      filteredHospitals
        .map((hospital) => {
          if (!userLocation) {
            return {
              ...hospital,
              directMiles: null,
              estimatedRoadMiles: null,
              estimatedMinutes: null,
            };
          }

          const directMiles = calculateDistanceMiles(
            userLocation.latitude,
            userLocation.longitude,
            hospital.lat,
            hospital.lng
          );
          const estimatedRoadMiles = directMiles * 1.18;

          return {
            ...hospital,
            directMiles,
            estimatedRoadMiles,
            estimatedMinutes: Math.max(
              1,
              Math.round((estimatedRoadMiles / 45) * 60)
            ),
          };
        })
        .sort((a, b) => {
          if (riskLevel === "Red" && a.hasED !== b.hasED) {
            return a.hasED ? -1 : 1;
          }
          if (a.directMiles === null || b.directMiles === null) return 0;
          return a.directMiles - b.directMiles;
        }),
    [filteredHospitals, riskLevel, userLocation]
  );

  const laborDeliveryHospitals = rankedHospitals.filter((hospital) => hospital.beds > 0);
  const emergencyHospitals = rankedHospitals.filter((hospital) => hospital.hasED);
  const selectedHospital =
    rankedHospitals.find((hospital) => hospital.id === selectedHospitalId) ||
    rankedHospitals[0] ||
    null;
  const recommendedHospital =
    riskLevel === "Red"
      ? emergencyHospitals[0] || rankedHospitals[0] || null
      : rankedHospitals[0] || null;

  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances((current) =>
        current.map((ambulance) => ({
          ...ambulance,
          lat: ambulance.lat + (Math.random() - 0.5) * 0.004,
          lng: ambulance.lng + (Math.random() - 0.5) * 0.004,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTab === "map" && locationStatus === "idle") {
      requestLocation();
    }
  }, [selectedTab, locationStatus]);

  useEffect(() => {
    if (recommendedHospital) {
      setSelectedHospitalId(recommendedHospital.id);
    }
  }, [recommendedHospital?.id, riskLevel]);

  async function requestLocation() {
    try {
      setLocationStatus("requesting");
      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setLocationStatus("denied");
        setLocationLabel("Location permission was not allowed");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setUserLocation(coordinates);
      setLocationStatus("granted");

      const places = await Location.reverseGeocodeAsync(coordinates);
      const place = places[0];
      if (place) {
        const label = [place.city, place.region].filter(Boolean).join(", ");
        setLocationLabel(label || "Current location");
      } else {
        setLocationLabel("Current location");
      }
    } catch {
      setLocationStatus("denied");
      setLocationLabel("Unable to get current location");
    }
  }

  function handleCall(phone: string) {
    Linking.openURL(`tel:${phone}`);
  }

  function handleDirections(hospital: (typeof HOSPITALS)[number]) {
    const destination = `${hospital.lat},${hospital.lng}`;
    const origin = userLocation
      ? `&origin=${userLocation.latitude},${userLocation.longitude}`
      : "";
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${destination}${origin}&travelmode=driving`
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={[styles.header, { borderBottomColor: c.cardBorder }]}>
        <View>
          <Text style={[styles.screenTitle, { color: c.accent }]}>MATERNA</Text>
          <Text style={[styles.pageLabel, { color: c.textMuted }]}>
            Obstetric Care Finder
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.locationButton, { borderColor: c.accent }]}
          onPress={requestLocation}
        >
          <Text style={[styles.locationButtonText, { color: c.accent }]}>
            Use my location
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.locationRow, { backgroundColor: c.card }]}>
        {locationStatus === "requesting" && <ActivityIndicator size="small" color={c.accent} />}
        <Text style={[styles.locationText, { color: c.textMuted }]}>{locationLabel}</Text>
      </View>

      {riskLevel === "Red" && recommendedHospital && (
        <View style={styles.emergencyRouteCard}>
          <Text style={styles.emergencyRouteLabel}>RED ALERT · EMERGENCY CARE</Text>
          <Text style={styles.emergencyRouteTitle}>
            Severe breathing trouble: call 911 now
          </Text>
          <Text style={styles.emergencyRouteBody}>
            Do not drive yourself. Nearest listed emergency department:{" "}
            {recommendedHospital.name}
            {recommendedHospital.estimatedRoadMiles !== null
              ? ` · about ${recommendedHospital.estimatedRoadMiles.toFixed(1)} road miles · ${recommendedHospital.estimatedMinutes} min`
              : ""}.
          </Text>
          <View style={styles.emergencyRouteActions}>
            <TouchableOpacity
              style={styles.call911Button}
              onPress={() => Linking.openURL("tel:911")}
            >
              <Text style={styles.call911Text}>Call 911</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.routeNowButton}
              onPress={() => handleDirections(recommendedHospital)}
            >
              <Text style={styles.routeNowText}>Open route</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={[styles.tabRow, { backgroundColor: c.card, borderBottomColor: c.cardBorder }]}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "map" && styles.activeTab, selectedTab === "map" && { borderBottomColor: c.accent }]}
          onPress={() => setSelectedTab("map")}
        >
          <Text style={[styles.tabText, { color: selectedTab === "map" ? c.accent : c.textMuted }]}>
            Live Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "list" && styles.activeTab, selectedTab === "list" && { borderBottomColor: c.accent }]}
          onPress={() => setSelectedTab("list")}
        >
          <Text style={[styles.tabText, { color: selectedTab === "list" ? c.accent : c.textMuted }]}>
            Hospital List
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.countyPanel, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        <TouchableOpacity
          style={styles.countySelector}
          onPress={() => {
            setCountyMenuOpen((open) => !open);
            setCountySearch("");
          }}
        >
          <View>
            <Text style={[styles.selectorLabel, { color: c.textMuted }]}>COUNTY</Text>
            <Text style={[styles.selectorValue, { color: c.text }]}>
              {selectedCounty === "All" ? "All nearby counties" : `${selectedCounty} County`}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: c.accent }]}>{countyMenuOpen ? "Up" : "Select"}</Text>
        </TouchableOpacity>

        {countyMenuOpen && (
          <View style={[styles.countyOptions, { borderTopColor: c.cardBorder }]}>
            <TextInput
              value={countySearch}
              onChangeText={setCountySearch}
              placeholder="Search Arkansas counties"
              placeholderTextColor={c.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              style={[
                styles.countySearch,
                {
                  color: c.text,
                  borderColor: c.cardBorder,
                  backgroundColor: c.background,
                },
              ]}
            />
            <ScrollView
              style={styles.countyList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {!countySearch.trim() && (
                <CountyOption
                  county="All"
                  selectedCounty={selectedCounty}
                  c={c}
                  onSelect={() => {
                    setSelectedCounty("All");
                    setCountyMenuOpen(false);
                    setCountySearch("");
                  }}
                />
              )}
              {matchingCounties.map((county) => (
                <CountyOption
                  key={county}
                  county={county}
                  selectedCounty={selectedCounty}
                  c={c}
                  onSelect={() => {
                    setSelectedCounty(county);
                    setCountyMenuOpen(false);
                    setCountySearch("");
                  }}
                />
              ))}
              {matchingCounties.length === 0 && (
                <Text style={[styles.noCountyResults, { color: c.textMuted }]}>
                  No Arkansas counties match "{countySearch}".
                </Text>
              )}
            </ScrollView>
          </View>
        )}

        <View style={styles.availabilityRow}>
          <AvailabilityBox
            label="Ambulance"
            value={`${filteredAmbulances.length} available`}
            c={c}
            onPress={() => setSelectedResource("ambulance")}
          />
          <AvailabilityBox
            label="L&D"
            value={`${laborDeliveryHospitals.length} available`}
            c={c}
            onPress={() => setSelectedResource("ld")}
          />
          <AvailabilityBox
            label="ED"
            value={`${emergencyHospitals.length} available`}
            c={c}
            onPress={() => setSelectedResource("ed")}
          />
        </View>
      </View>

      {selectedResource ? (
        <ResourceDetails
          type={selectedResource}
          county={selectedCounty}
          hospitals={
            selectedResource === "ld"
              ? laborDeliveryHospitals
              : selectedResource === "ed"
              ? emergencyHospitals
              : []
          }
          ambulances={selectedResource === "ambulance" ? filteredAmbulances : []}
          c={c}
          onBack={() => setSelectedResource(null)}
          onCall={handleCall}
          onDirections={handleDirections}
        />
      ) : selectedTab === "map" ? (
        <View style={styles.mapSection}>
          <HospitalMap
            dark={dark}
            accent={c.accent}
            userLocation={userLocation}
            hospitals={rankedHospitals}
            ambulances={filteredAmbulances}
            linkedHospitalId={linkedId}
            selectedHospitalId={selectedHospital?.id}
            onSelectHospital={setSelectedHospitalId}
          />
          {selectedHospital && (
            <View
              style={[
                styles.mapFacilityPanel,
                { backgroundColor: c.card, borderColor: c.cardBorder },
              ]}
            >
              <View style={styles.mapFacilityTop}>
                <View style={styles.mapFacilityHeading}>
                  <Text style={[styles.mapFacilityName, { color: c.text }]}>
                    {selectedHospital.name}
                  </Text>
                  <Text style={[styles.mapFacilityMeta, { color: c.textMuted }]}>
                    {selectedHospital.estimatedRoadMiles !== null
                      ? `About ${selectedHospital.estimatedRoadMiles.toFixed(1)} road mi · ${selectedHospital.estimatedMinutes} min · `
                      : ""}
                    {selectedHospital.beds > 0
                      ? `${selectedHospital.beds} L&D beds listed`
                      : "Prenatal care only"}
                    {" · "}
                    {selectedHospital.hasED ? "ED available" : "No ED"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        selectedHospital.beds > 0 ? "#22C55E" : "#d97706",
                    },
                  ]}
                />
              </View>

              <View style={styles.mapActionRow}>
                <TouchableOpacity
                  accessibilityLabel={`Call ${selectedHospital.name}`}
                  style={[styles.mapIconButton, { backgroundColor: c.accent }]}
                  onPress={() => handleCall(selectedHospital.phone)}
                >
                  <Phone size={18} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityLabel={`Directions to ${selectedHospital.name}`}
                  style={[
                    styles.mapIconButton,
                    { backgroundColor: c.cardBorder },
                  ]}
                  onPress={() => handleDirections(selectedHospital)}
                >
                  <Navigation size={18} color={c.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.linkFacilityButton,
                    { borderColor: c.accent },
                  ]}
                  onPress={() => setLinkedId(selectedHospital.id)}
                >
                  <Text style={[styles.linkFacilityText, { color: c.accent }]}>
                    {linkedId === selectedHospital.id
                      ? "Linked hospital"
                      : "Link hospital"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {locationStatus === "denied" && (
            <TouchableOpacity
              style={[styles.permissionNotice, { backgroundColor: c.card, borderColor: c.accent }]}
              onPress={requestLocation}
            >
              <Text style={[styles.permissionTitle, { color: c.text }]}>Location is off</Text>
              <Text style={[styles.permissionText, { color: c.textMuted }]}>
                Tap to allow location and center the map on nearby care.
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {filteredHospitals.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
              <Text style={[styles.emptyTitle, { color: c.text }]}>No L&D hospital listed in this county</Text>
              <Text style={[styles.emptyText, { color: c.textMuted }]}>
                Check the map or select another county for the nearest available care.
              </Text>
            </View>
          ) : (
            rankedHospitals.map((hospital) => {
              const linked = linkedId === hospital.id;
              return (
                <View
                  key={hospital.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: c.card,
                      borderColor: linked ? c.accent : c.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.cardHeading}>
                      <Text style={[styles.hospitalName, { color: c.text }]}>{hospital.name}</Text>
                      <Text style={[styles.hospitalType, { color: c.textMuted }]}>
                        {hospital.type} · {hospital.county} County
                      </Text>
                    </View>
                    {linked && <Text style={[styles.linkedText, { color: c.accent }]}>Linked</Text>}
                  </View>

                  {hospital.estimatedRoadMiles !== null && (
                    <Text style={[styles.distanceText, { color: c.accent }]}>
                      About {hospital.estimatedRoadMiles.toFixed(1)} road miles · {hospital.estimatedMinutes} min
                    </Text>
                  )}

                  <Text style={[styles.availabilityText, { color: c.textMuted }]}>
                    L&D: {hospital.beds > 0 ? `${hospital.beds} beds` : "Not available"} · ED: {hospital.hasED ? "Available" : "Not available"}
                  </Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: c.accent }]}
                      onPress={() => handleCall(hospital.phone)}
                    >
                      <Text style={styles.primaryButtonText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: c.cardBorder }]}
                      onPress={() => handleDirections(hospital)}
                    >
                      <Text style={[styles.secondaryButtonText, { color: c.text }]}>Directions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { borderColor: c.accent, borderWidth: 1 }]}
                      onPress={() => setLinkedId(hospital.id)}
                    >
                      <Text style={[styles.secondaryButtonText, { color: c.accent }]}>
                        {linked ? "Linked" : "Link"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function CountyOption({
  county,
  selectedCounty,
  c,
  onSelect,
}: {
  county: string;
  selectedCounty: string;
  c: any;
  onSelect: () => void;
}) {
  const selected = selectedCounty === county;
  return (
    <TouchableOpacity
      style={[
        styles.countyOption,
        selected && { backgroundColor: `${c.accent}18` },
      ]}
      onPress={onSelect}
    >
      <Text style={{ color: selected ? c.accent : c.text }}>
        {county === "All" ? "All nearby counties" : `${county} County`}
      </Text>
    </TouchableOpacity>
  );
}

function AvailabilityBox({
  label,
  value,
  c,
  onPress,
}: {
  label: string;
  value: string;
  c: any;
  onPress: () => void;
}) {
  const unavailable = value.startsWith("0");
  const color = unavailable ? "#e11d48" : value === "Limited" ? "#d97706" : "#22C55E";

  return (
    <TouchableOpacity
      style={[styles.availabilityBox, { borderColor: c.cardBorder }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.availabilityLabel, { color: c.textMuted }]}>{label}</Text>
      <Text style={[styles.availabilityValue, { color }]}>{value}</Text>
      <Text style={[styles.availabilityLink, { color: c.textMuted }]}>View details</Text>
    </TouchableOpacity>
  );
}

function ResourceDetails({
  type,
  county,
  hospitals,
  ambulances,
  c,
  onBack,
  onCall,
  onDirections,
}: {
  type: ResourceType;
  county: string;
  hospitals: typeof HOSPITALS;
  ambulances: typeof AMBULANCES;
  c: any;
  onBack: () => void;
  onCall: (phone: string) => void;
  onDirections: (hospital: (typeof HOSPITALS)[number]) => void;
}) {
  const title =
    type === "ambulance"
      ? "Available ambulances"
      : type === "ld"
      ? "Labor & Delivery care"
      : "Emergency departments";

  return (
    <ScrollView contentContainerStyle={styles.resourceScroll}>
      <TouchableOpacity style={styles.resourceBack} onPress={onBack}>
        <Text style={[styles.resourceBackText, { color: c.accent }]}>Back to care finder</Text>
      </TouchableOpacity>

      <Text style={[styles.resourceTitle, { color: c.text }]}>{title}</Text>
      <Text style={[styles.resourceSubtitle, { color: c.textMuted }]}>
        {county === "All" ? "All nearby counties" : `${county} County`}
      </Text>

      {type === "ambulance" &&
        ambulances.map((ambulance) => (
          <View
            key={ambulance.id}
            style={[styles.resourceCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}
          >
            <View style={styles.resourceCardTop}>
              <View>
                <Text style={[styles.resourceName, { color: c.text }]}>{ambulance.name}</Text>
                <Text style={[styles.resourceMeta, { color: c.textMuted }]}>
                  {ambulance.county} County
                </Text>
              </View>
              <View style={styles.movingBadge}>
                <Text style={styles.movingBadgeText}>Moving live</Text>
              </View>
            </View>
            <Text style={[styles.resourceMeta, { color: c.textMuted }]}>
              Location updates every 3 seconds on the live map.
            </Text>
          </View>
        ))}

      {type !== "ambulance" &&
        hospitals.map((hospital) => (
          <View
            key={hospital.id}
            style={[styles.resourceCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}
          >
            <Text style={[styles.resourceName, { color: c.text }]}>{hospital.name}</Text>
            <Text style={[styles.resourceMeta, { color: c.textMuted }]}>
              {hospital.type} · {hospital.county} County
            </Text>
            <Text style={[styles.resourceAvailability, { color: "#22C55E" }]}>
              {type === "ld"
                ? `${hospital.beds} L&D beds listed`
                : "Emergency department available"}
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: c.accent }]}
                onPress={() => onCall(hospital.phone)}
              >
                <Text style={styles.primaryButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: c.cardBorder }]}
                onPress={() => onDirections(hospital)}
              >
                <Text style={[styles.secondaryButtonText, { color: c.text }]}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      {(type === "ambulance" ? ambulances.length === 0 : hospitals.length === 0) && (
        <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
          <Text style={[styles.emptyTitle, { color: c.text }]}>No availability listed</Text>
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            Select another county or call 911 during an emergency.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function calculateDistanceMiles(
  fromLatitude: number,
  fromLongitude: number,
  toLatitude: number,
  toLongitude: number
) {
  const earthRadiusMiles = 3958.8;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeChange = toRadians(toLatitude - fromLatitude);
  const longitudeChange = toRadians(toLongitude - fromLongitude);
  const startLatitude = toRadians(fromLatitude);
  const endLatitude = toRadians(toLatitude);
  const a =
    Math.sin(latitudeChange / 2) ** 2 +
    Math.sin(longitudeChange / 2) ** 2 *
      Math.cos(startLatitude) *
      Math.cos(endLatitude);

  return (
    earthRadiusMiles *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

function getColors(mode: "dark" | "light") {
  const dark = mode === "dark";
  return {
    background: dark ? "#0f1117" : "#f5f7fa",
    text: dark ? "#f0f0f0" : "#1a1a1a",
    textMuted: dark ? "#8a8fa8" : "#6b7280",
    accent: "#6c63ff",
    card: dark ? "#1c1f2e" : "#ffffff",
    cardBorder: dark ? "#2e3347" : "#e5e7eb",
  };
}

const colors = { dark: getColors("dark"), light: getColors("light") };

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  screenTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 3 },
  pageLabel: { fontSize: 12, marginTop: 2 },
  locationButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  locationButtonText: { fontSize: 11, fontWeight: "700" },
  locationRow: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18 },
  locationText: { fontSize: 11 },
  emergencyRouteCard: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: "#35070d",
    borderColor: "#e11d48",
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
  },
  emergencyRouteLabel: { color: "#fb7185", fontSize: 9, fontWeight: "900" },
  emergencyRouteTitle: { color: "#ffffff", fontSize: 15, fontWeight: "900", marginTop: 5 },
  emergencyRouteBody: { color: "#fecdd3", fontSize: 11, lineHeight: 17, marginTop: 5 },
  emergencyRouteActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  call911Button: { flex: 1, backgroundColor: "#e11d48", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  call911Text: { color: "#ffffff", fontSize: 12, fontWeight: "900" },
  routeNowButton: { flex: 1, borderColor: "#fb7185", borderWidth: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  routeNowText: { color: "#fb7185", fontSize: 12, fontWeight: "800" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontWeight: "700" },
  countyPanel: { margin: 12, borderWidth: 1, borderRadius: 12, overflow: "hidden" },
  countySelector: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12 },
  selectorLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  selectorValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  chevron: { fontSize: 11, fontWeight: "700" },
  countyOptions: { borderTopWidth: 1, paddingVertical: 4 },
  countySearch: { margin: 10, marginBottom: 6, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  countyList: { maxHeight: 260 },
  countyOption: { paddingHorizontal: 12, paddingVertical: 10 },
  noCountyResults: { paddingHorizontal: 12, paddingVertical: 18, fontSize: 12, textAlign: "center" },
  availabilityRow: { flexDirection: "row", paddingHorizontal: 8, paddingBottom: 8, gap: 6 },
  availabilityBox: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 8, minHeight: 70 },
  availabilityLabel: { fontSize: 9, fontWeight: "700", marginBottom: 4 },
  availabilityValue: { fontSize: 11, fontWeight: "800" },
  availabilityLink: { fontSize: 8, marginTop: 5 },
  mapSection: { flex: 1, minHeight: 300 },
  mapFacilityPanel: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  mapFacilityTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  mapFacilityHeading: { flex: 1 },
  mapFacilityName: { fontSize: 14, fontWeight: "800" },
  mapFacilityMeta: { fontSize: 10, marginTop: 3 },
  statusDot: { width: 9, height: 9, borderRadius: 5, marginTop: 4 },
  mapActionRow: { flexDirection: "row", gap: 8, marginTop: 11 },
  mapIconButton: {
    width: 42,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  linkFacilityButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  linkFacilityText: { fontSize: 11, fontWeight: "800" },
  permissionNotice: { position: "absolute", left: 14, right: 14, bottom: 14, borderWidth: 1, borderRadius: 10, padding: 12 },
  permissionTitle: { fontSize: 13, fontWeight: "800" },
  permissionText: { fontSize: 11, marginTop: 3 },
  scroll: { padding: 12, paddingBottom: 40 },
  emptyCard: { borderWidth: 1, borderRadius: 12, padding: 18 },
  emptyTitle: { fontSize: 15, fontWeight: "800" },
  emptyText: { fontSize: 12, lineHeight: 18, marginTop: 6 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  cardHeading: { flex: 1 },
  hospitalName: { fontSize: 15, fontWeight: "800" },
  hospitalType: { fontSize: 11, marginTop: 3 },
  distanceText: { fontSize: 10, fontWeight: "800", marginTop: 9 },
  linkedText: { fontSize: 11, fontWeight: "800" },
  availabilityText: { fontSize: 11, marginTop: 10 },
  buttonRow: { flexDirection: "row", gap: 7, marginTop: 12 },
  actionButton: { flex: 1, borderRadius: 8, paddingVertical: 9, alignItems: "center" },
  primaryButtonText: { color: "#ffffff", fontSize: 11, fontWeight: "700" },
  secondaryButtonText: { fontSize: 11, fontWeight: "700" },
  resourceScroll: { padding: 14, paddingBottom: 40 },
  resourceBack: { alignSelf: "flex-start", paddingVertical: 8, marginBottom: 6 },
  resourceBackText: { fontSize: 12, fontWeight: "700" },
  resourceTitle: { fontSize: 22, fontWeight: "900" },
  resourceSubtitle: { fontSize: 12, marginTop: 3, marginBottom: 16 },
  resourceCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  resourceCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  resourceName: { fontSize: 15, fontWeight: "800" },
  resourceMeta: { fontSize: 11, marginTop: 4 },
  resourceAvailability: { fontSize: 11, fontWeight: "700", marginTop: 10 },
  movingBadge: { backgroundColor: "#14532d", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  movingBadgeText: { color: "#4ade80", fontSize: 9, fontWeight: "800" },
});
