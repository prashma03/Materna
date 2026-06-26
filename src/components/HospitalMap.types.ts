export interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface HospitalMapProps {
  dark: boolean;
  accent: string;
  userLocation: { latitude: number; longitude: number } | null;
  hospitals: MapPoint[];
  ambulances: MapPoint[];
  linkedHospitalId: string;
  selectedHospitalId?: string | null;
  onSelectHospital?: (hospitalId: string) => void;
}
