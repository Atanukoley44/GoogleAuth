import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const FeatureCard = ({
  label,
  lines,
}: {
  label: string;
  lines: string[];
}) => {
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.iconBox} />
      <View style={styles.cardTextContainer}>
        {lines.map((line, index) => (
          <Text key={index} style={styles.cardText}>
            {line}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default function UserDashboard() {
  const userName = "user";
  const email = "user@email.com";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome,</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        <FeatureCard
          label="Generate Reserve Request"
          lines={["Generate", "Reserve", "Request"]}
        />
        <FeatureCard label="Adopt" lines={["Adopt"]} />
        <FeatureCard label="Donate to NGO" lines={["Donate to", "NGO"]} />
        <FeatureCard
          label="Order Services from Captain"
          lines={["Order", "Services", "from Captain"]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  welcome: {
    fontSize: 36,
    fontWeight: "300",
    color: "#81E6D9",
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
  },
  email: {
    fontSize: 16,
    color: "#A0AEC0",
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: width * 0.42,
    height: 140,
    backgroundColor: "#2D3748",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#4A5568",
    padding: 12,
    marginBottom: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconBox: {
    width: 28,
    height: 28,
    backgroundColor: "#718096",
    borderRadius: 6,
  },
  cardTextContainer: {
    alignItems: "center",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 20,
  },
});
