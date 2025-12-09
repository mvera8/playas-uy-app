import { Modal, TouchableOpacity, Animated, View } from "react-native";
import { useRef, useEffect } from "react";

export function AppDrawer({ visible, onClose, children }) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        <Animated.View
          onStartShouldSetResponder={() => true}
          style={{
						backgroundColor: "transparent",
						padding: 20,
						paddingBottom: 30,            
            transform: [{ translateY: slideAnim }],
          }}
        >
					<View
						style={{
							backgroundColor: "white",
							borderRadius: 20,
							padding: 20,
							paddingBottom: 10,
						}}
					>
          {children}
					</View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}
