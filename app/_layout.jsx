import { Stack } from "expo-router";

export default function RootLayout() {
  return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					title: "Getting Started"
				}}
			/>
			<Stack.Screen
				name="inside"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
