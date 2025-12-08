import { Text, View, StyleSheet, Image, Animated, ActivityIndicator } from 'react-native'
import MapView, { Marker, PROVIDER_APPLE } from 'react-native-maps'
import { useState, useRef, useEffect } from 'react'
import { useBeaches } from '../../../hooks/useBeaches';
import { getImage } from '../../../lib/getImage';
import { AppDrawer } from '../../../components';

export default function Index() {
	const { data, loading, error } = useBeaches();
	const [selectedMarker, setSelectedMarker] = useState(null)
	const [showDrawer, setShowDrawer] = useState(false);
	const drawerHeight = useRef(new Animated.Value(-300)).current

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
		image: beach.safetyFlag
	})) || []

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

	return (
		<View style={styles.container}>
			{/* <Link href={'/inside/standalone'}>
				<Text>Open standalone</Text>
			</Link> */}
			<MapView
				provider="google"
				style={styles.map}
				initialRegion={{
					latitude: -34.9177467,
					longitude: -56.1679434,
					latitudeDelta: 0.2,
					longitudeDelta: 0.2,
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
          <Text>{selectedMarker.title}</Text>
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
});