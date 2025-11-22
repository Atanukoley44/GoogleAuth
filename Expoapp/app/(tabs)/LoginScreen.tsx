import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar, Dimensions, FlatList, Image } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import supabase from "./supabase";

WebBrowser.maybeCompleteAuthSession();

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

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "1065391255871-q68jsg1igm343ardoasgjhnlhhe46iu8.apps.googleusercontent.com",
    webClientId:
      "1065391255871-n0iigit6bb496n4es4oigmutej3d0pbd.apps.googleusercontent.com",
    iosClientId: "1065391255871-fakeiosid.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success" && selectedRole) {
      getUserData(response.authentication?.accessToken, selectedRole);
    }
  }, [response, selectedRole]);

  const getUserData = async (token: string | undefined, role: string) => {
    try {
      setLoading(true);
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await res.json();
      console.log("Google User Data:", JSON.stringify(userInfo, null, 2));

      if (userInfo) {
        await saveUserToSupabase(userInfo, role);
        setUser(userInfo);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      Alert.alert("Error", "Failed to get user information.");
    } finally {
      setLoading(false);
    }
  };

  const saveUserToSupabase = async (userInfo: any, role: string) => {
    try {
      const payload = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        role: role,
      };

      const { data, error } = await supabase
        .from("users")
        .upsert(payload, { onConflict: "email" })
        .select()
        .single();

      if (error) {
        console.error("Supabase upsert error:", error);
        Alert.alert("Database error", error.message ?? "Failed to save user.");
      } else {
        console.log("User saved to Supabase:", data);
      }
    } catch (err) {
      console.error("Unexpected saveUserToSupabase error:", err);
      Alert.alert("Error", "Unexpected error saving user.");
    }
  };

  const handleLogin = (role: string) => {
    setSelectedRole(role);
    promptAsync();
  };

  const handleLogout = () => {
    setUser(null);
    setUsers([]);
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error);
        Alert.alert("Error", "Failed to fetch users from Supabase.");
        setUsers([]);
      } else {
        setUsers(data ?? []);
        console.log("Fetched users:", data);
      }
    } catch (err) {
      console.error("Unexpected error fetching users:", err);
      Alert.alert("Error", "Unexpected error fetching users.");
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Logging in...</Text>
      </View>
    );
  }

  if (user) {
    return (
      <View style={styles.dashboardContainer}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Users List */}
        <Text style={styles.sectionTitle}>Logged-in Users Database</Text>
        {usersLoading ? (
          <ActivityIndicator style={{ marginTop: 12 }} />
        ) : (
          users.length > 0 && (
            <View style={{ marginTop: 16, width: "100%" }}>
              <FlatList
                data={users}
                keyExtractor={(item) =>
                  item.id?.toString() ?? Math.random().toString()
                }
                renderItem={({ item }) => (
                  <View style={styles.userRow}>
                    {item.picture ? (
                      <Image
                        source={{ uri: item.picture }}
                        style={styles.userAvatar}
                      />
                    ) : null}
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ fontWeight: "600", color: "#ffffff" }}>{item.name}</Text>
                      <Text style={{ color: "#A0AEC0" }}>{item.email}</Text>
                      <Text style={{ color: "#81E6D9", fontWeight: "bold" }}>Role: {item.role}</Text>
                    </View>
                  </View>
                )}
              />
            </View>
          )
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back.</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleLogin("user")}
          disabled={!request}
        >
          <Text style={styles.buttonText}>Login as User</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleLogin("ngo")}
          disabled={!request}
        >
          <Text style={styles.buttonText}>Login as NGO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleLogin("captain")}
          disabled={!request}
        >
          <Text style={styles.buttonText}>Login as Captain</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#0B0F17", // deep dark background
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#E8F0FF",
    textAlign: "center",
    marginBottom: 50,
  },

  buttonContainer: {
    gap: 20,
  },

  button: {
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: "rgba(0, 255, 180, 0.4)", // neon tint
    backgroundColor: "rgba(255, 255, 255, 0.06)", // glass effect
    borderRadius: 16,
    alignItems: "center",

    // Soft glow effect
    shadowColor: "#00FFB4",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  buttonText: {
    fontSize: 18,
    color: "#E8F0FF",
    fontWeight: "600",
  },

  loadingText: {
    fontSize: 16,
    color: "#E8F0FF",
    marginTop: 20,
  },

  dashboardContainer: {
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
  logoutButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#E53E3E",
    borderRadius: 8,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "600",
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
    textAlign: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#4A5568",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
