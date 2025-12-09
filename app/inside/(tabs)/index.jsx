import { Text, View, StyleSheet, Image, Animated, ActivityIndicator } from 'react-native'
import MapView, { Marker, PROVIDER_APPLE } from 'react-native-maps'
import { useState, useRef, useEffect } from 'react'
import { useBeaches } from '../../../hooks/useBeaches';
import { getImage } from '../../../lib/getImage';
import { getWeatherCode } from '../../../lib/getWeatherCode';
import { getWeatherIcon } from '../../../lib/getWeatherIcon';
import { AppDrawer, AppIcon } from '../../../components';
import * as Location from 'expo-location';

export default function Index() {
	const { data, loading, error } = useBeaches();
	const [selectedMarker, setSelectedMarker] = useState(null)
	const [showDrawer, setShowDrawer] = useState(false);
	const [ userLocation, setUserLocation] = useState(null);
	const drawerHeight = useRef(new Animated.Value(-300)).current
	const mapRef = useRef(null); // Agregar referencia al mapa

	// Transformar las playas en marcadores
	const markers = data?.documents?.map(beach => ({
		id: beach.$id,
		coordinate: {
			latitude: beach.coordinates[0],
			longitude: beach.coordinates[1]
		},
		title: beach.name,
		description: beach.beach,
		address: beach.address,
		image: beach.safetyFlag,
		temperature: beach.temperature ? String(beach.temperature) : null,
		weathercode: beach.weathercode ? Number(beach.weathercode) : null,
	})) || []

	useEffect(() => {
		// Solicitar permiso y obtener ubicación del usuario
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				console.log('Permiso de ubicación denegado');
				return;
			}

			let location = await Location.getCurrentPositionAsync({});
			setUserLocation(location.coords);
		})();
	}, []);

	useEffect(() => {
		if (selectedMarker) {
			// Abrir drawer
			Animated.spring(drawerHeight, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		} else {
			// Cerrar drawer
			Animated.spring(drawerHeight, {
				toValue: -300,
				useNativeDriver: true,
				tension: 65,
				friction: 11
			}).start()
		}
	}, [selectedMarker])

	const handleMarkerPress = (marker) => {
		setSelectedMarker(marker)
		setShowDrawer(true);
		
		// Animar el zoom hacia el marcador seleccionado
		if (mapRef.current) {
			mapRef.current.animateToRegion({
				latitude: marker.coordinate.latitude,
				longitude: marker.coordinate.longitude,
				latitudeDelta: 0.01, // Ajusta este valor para más/menos zoom
				longitudeDelta: 0.01, // Ajusta este valor para más/menos zoom
			}, 1000); // Duración de la animación en ms
		}
	}

	if (loading) {
		return (
			<View style={[styles.container, styles.centerContent]}>
				<ActivityIndicator size="large" color="#4ECDC4" />
				<Text style={{ marginTop: 10, color: '#666' }}>Cargando playas...</Text>
			</View>
		)
	}

	if (error) {
		return (
			<View style={[styles.container, styles.centerContent]}>
				<Text style={{ color: '#c62828', fontSize: 16 }}>Error: {error}</Text>
			</View>
		)
	}

	if (!userLocation) {
    return (
			<View style={[styles.container, styles.centerContent]}>
				<Text style={{ marginTop: 10, color: '#666' }}>Obteniendo ubicación...</Text>
			</View>
    )
	}

	return (
		<View style={styles.container}>
			<MapView
				ref={mapRef} // Agregar la referencia aquí
				provider="google"
				style={styles.map}
				showsUserLocation
				showsMyLocationButton
				initialRegion={{
					// latitude: userLocation.latitude,
					// longitude: userLocation.longitude,
					latitude: -34.899831,
					longitude: -56.12175929,
					latitudeDelta: 0.05,
					longitudeDelta: 0.05,
				}}
			>
				{markers.map((marker) => (
					<Marker
						key={marker.id}
						coordinate={marker.coordinate}
						onPress={() => handleMarkerPress(marker)}
					>
						<Image source={getImage(marker.image)} style={styles.markerImage} />
					</Marker>
				))}
			</MapView>

			{/* Drawer desde abajo */}
			{selectedMarker && (
				<AppDrawer visible={showDrawer} onClose={() => setShowDrawer(false)}>
					<View style={styles.cardImageWrapper}>
						<Image source={getImage(selectedMarker.image)} style={styles.cardImage} />
					</View>
					<Text style={styles.cardTitle}>
						Playa {selectedMarker.description}
					</Text>
					<Text style={styles.cardSubTitle}>
						{selectedMarker.title?.trim()}
					</Text>

					<View style={styles.cardText}>
						<AppIcon icon="map-marker" />
						<Text>{selectedMarker.address?.trim()}</Text>
					</View>

					<View style={styles.cardText}>
						<AppIcon icon="thermometer" />
						<Text>{selectedMarker.temperature?.trim()} °C - {getWeatherIcon(selectedMarker.weathercode)} {getWeatherCode(selectedMarker.weathercode)}</Text>
					</View>
      	</AppDrawer>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerImage: {
    width: 50,
    height: 50,
		resizeMode: 'contain',
		size: 50,
  },
	cardImageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
		marginBottom: 60,
		height: 1,
  },
	cardImage: {
		backgroundColor: '#fff',
		borderRadius: 99,
		borderWidth: 1,
		borderColor: '#ddd',
    width: 90,
    height: 90,
		resizeMode: 'contain',
		size: 90,
		padding: 5,
  },
	cardTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: 'center',
  },
	cardSubTitle: {
		fontSize: 16,
		color: "gray",
		fontWeight: "bold",
		marginBottom: 8,
		textAlign: 'center',
		textTransform: 'uppercase',
		marginBottom: 10,
  },
	cardText: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		fontSize: 16,
		color: "gray",
		fontWeight: "bold",
		marginBottom: 10,
		textAlign: 'center',
		textTransform: 'uppercase',
  },
});