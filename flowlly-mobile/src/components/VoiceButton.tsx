import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Text,
  Dimensions,
} from "react-native";
import { Icon } from "react-native-elements";

interface VoiceButtonProps {
  isListening: boolean;
  onPress: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BUTTON_SIZE = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.45; // 45% of screen
const HALO_COLORS = [
  "#9C27B0", // Purple
  "#673AB7", // Deep Purple
  "#3F51B5", // Indigo
  "#5E35B1", // Deep Purple variant
  "#4527A0", // Deep Purple darker
  "#311B92", // Deep Purple darkest
  "#4A148C", // Purple darkest
];

export default function VoiceButton({
  isListening,
  onPress,
}: VoiceButtonProps) {
  const pulseAnims = useRef(
    HALO_COLORS.map(() => new Animated.Value(1))
  ).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isListening) {
      // Create rainbow pulse animations with different timings
      pulseAnims.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 2.5,
              duration: 2000 + index * 200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 1,
              duration: 2000 + index * 200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Create rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Create organic wobble animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(wobbleAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: -1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Create glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Create subtle scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animations when not listening
      pulseAnims.forEach((anim) => anim.setValue(1));
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
      wobbleAnim.setValue(0);
      glowAnim.setValue(0);
    }
  }, [isListening]);

  return (
    <View style={styles.container}>
      {/* Purple halos */}
      {isListening &&
        pulseAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.halo,
              {
                backgroundColor: HALO_COLORS[index],
                transform: [
                  { scale: anim },
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                  {
                    translateX: wobbleAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [-30, 0, 30],
                    }),
                  },
                  {
                    translateY: wobbleAnim.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: [30, 0, -30],
                    }),
                  },
                ],
                opacity: anim.interpolate({
                  inputRange: [1, 2.5],
                  outputRange: [0.2, 0],
                }),
              },
            ]}
          />
        ))}

      {/* Main button */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <Animated.View
          style={[
            styles.button,
            {
              transform: [
                { scale: scaleAnim },
                {
                  translateX: wobbleAnim.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [-15, 0, 15],
                  }),
                },
                {
                  translateY: wobbleAnim.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [15, 0, -15],
                  }),
                },
              ],
              backgroundColor: isListening ? "#673AB7" : "#9C27B0",
            },
          ]}
        >
          <Icon
            name="mic"
            type="material"
            size={BUTTON_SIZE * 0.4}
            color="#fff"
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Status text */}
      <Animated.Text
        style={[
          styles.status,
          {
            transform: [
              {
                translateY: wobbleAnim.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [5, 0, -5],
                }),
              },
            ],
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1],
            }),
          },
        ]}
      >
        {isListening ? "Listening..." : "CLICK TO TALK"}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  halo: {
    position: "absolute",
    width: BUTTON_SIZE * 2,
    height: BUTTON_SIZE * 2,
    borderRadius: BUTTON_SIZE,
  },
  touchable: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  button: {
    width: "100%",
    height: "100%",
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: "#9C27B0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  status: {
    marginTop: 30,
    fontSize: 28,
    color: "#fff",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    letterSpacing: 2,
  },
});
