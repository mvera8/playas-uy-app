import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native'
import { useBeaches } from '../../../hooks/useBeaches';

export default function Page() {
  const { data, loading, error, refetch } = useBeaches();

  useFocusEffect(
    useCallback(() => { 
      refetch();
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {loading && <ActivityIndicator size="large" color="#0066cc" />}
      
      {error && (
        <View style={{ backgroundColor: '#ffebee', padding: 12, borderRadius: 8, marginTop: 10 }}>
          <Text style={{ color: '#c62828' }}>
            Error: {error}
          </Text>
        </View>
      )}
      
      {data && (
        <FlatList
					data={data?.documents ?? []}
					keyExtractor={(item) => item.$id}
					ListHeaderComponent={() => (
						<Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
							Puestos de Guardavidas: {data?.total ?? 0}
						</Text>
					)}
					renderItem={({ item, index }) => (
						<View style={{ paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderColor: "#ddd" }}>
							<Text style={{ fontSize: 18, fontWeight: "bold" }}>
								{index + 1}. {item.name}
							</Text>
							<Text style={{ color: "#666" }}>
								{item.beach}
							</Text>
							<Text>{item.address?.trim()}</Text>
							<Text>Flag: {item.safetyFlag?.trim()}</Text>

							{/* Mostrar lat/lng */}
							{item.coordinates && (
								<Text style={{ color: "#333", marginTop: 4 }}>
									lat: {item.coordinates[0]} | lng: {item.coordinates[1]}
								</Text>
							)}
						</View>
					)}
				/>

      )}
    </View>
  )
}
