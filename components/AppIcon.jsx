import { MaterialCommunityIcons } from "@expo/vector-icons";

export function AppIcon({
	icon = "airplane",
}) {
	return (
		<MaterialCommunityIcons
			name={icon}
			size={22}
			style={{
				backgroundColor: "gray",
				borderRadius: 999,
				color: "black",
				width: 40,
				height: 40,
				textAlign: "center",
				lineHeight: 40,
				fontSize: 23,
			}}
		/>
	)
}
