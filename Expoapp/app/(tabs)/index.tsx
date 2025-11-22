import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import supabase from "./supabase";

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "1065391255871-q68jsg1igm343ardoasgjhnlhhe46iu8.apps.googleusercontent.com",
    webClientId:
      "1065391255871-n0iigit6bb496n4es4oigmutej3d0pbd.apps.googleusercontent.com",
    iosClientId: "1065391255871-fakeiosid.apps.googleusercontent.com",
    // optionally: scopes: ['profile','email']
  });

  useEffect(() => {
    if (response?.type === "success") {
      getUserData(response.authentication?.accessToken);
    }
  }, [response]);

  const getUserData = async (token: string | undefined) => {
    try {
      setLoading(true);
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await res.json();
      console.log("Google User Data:", JSON.stringify(userInfo, null, 2));

      if (userInfo) {
        setUser(userInfo);
        await saveUserToSupabase(userInfo);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      Alert.alert("Error", "Failed to get user information.");
    } finally {
      setLoading(false);
    }
  };

  const saveUserToSupabase = async (userInfo: any) => {
    try {
      // Note: do not set created_at here if DB default exists. Let DB set it.
      const payload = {
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      };

      const { data, error } = await supabase
        .from("users")
        .upsert(payload, { onConflict: "email" })
        .select()
        .single(); // returns the single upserted row (if your onConflict is email)

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

  const handleLogout = async () => {
    setUser(null);
    Alert.alert("Logged out", "You have been logged out.");
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
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Image source={{ uri: user.picture }} style={styles.image} />
          <Text style={styles.text}>Welcome, {user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { marginTop: 12 }]}
            onPress={fetchUsers}
          >
            <Text style={styles.buttonText}>Show all users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { marginTop: 12, backgroundColor: "#7c3aed" },
            ]}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={styles.buttonText}>Go to Profile</Text>
          </TouchableOpacity>

          {usersLoading ? (
            <ActivityIndicator style={{ marginTop: 12 }} />
          ) : (
            users.length > 0 && (
              <View style={{ marginTop: 16, width: "100%" }}>
                <Text style={{ fontWeight: "600", marginBottom: 8 }}>
                  Supabase users:
                </Text>
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
                      <View style={{ marginLeft: 12 }}>
                        <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                        <Text style={{ color: "#666" }}>{item.email}</Text>
                      </View>
                    </View>
                  )}
                />
              </View>
            )
          )}
        </>
      ) : (
        <>
          <Text style={styles.title}>Sign in with Google</Text>
          <TouchableOpacity
            disabled={!request}
            style={styles.button}
            onPress={() => promptAsync()}
          >
            <Text style={styles.buttonText}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { marginTop: 12 }]}
            onPress={fetchUsers}
          >
            <Text style={styles.buttonText}>Show all users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              { marginTop: 12, backgroundColor: "#7c3aed" },
            ]}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={styles.buttonText}>Go to Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 30 },
  text: { fontSize: 18, color: "#333", marginTop: 10 },
  email: { fontSize: 14, color: "#666", marginBottom: 20 },
  image: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  button: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  userAvatar: { width: 44, height: 44, borderRadius: 22 },
});
