import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import supabase from "./supabase";

export default function ProfileScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error);
        Alert.alert("Error", "Failed to fetch users.");
        setUsers([]);
      } else {
        setUsers(data ?? []);
        console.log("Users fetched:", data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "Unexpected error fetching users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users Profile</Text>
      <Text style={styles.subtitle}>
        Manage and view all users from Supabase
      </Text>

      <TouchableOpacity style={styles.button} onPress={fetchUsers}>
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Fetch Users"}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#4285F4" />}

      {users.length > 0 && (
        <View style={styles.usersList}>
          <Text style={styles.usersTitle}>All Users ({users.length})</Text>
          {users.map((user) => (
            <View key={user.id || user.email} style={styles.userCard}>
              <Text style={styles.userName}>{user.name || "Unknown"}</Text>
              <Text style={styles.userEmail}>{user.email || "No email"}</Text>
              {user.created_at && (
                <Text style={styles.userDate}>
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#666" }]}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  usersList: {
    marginVertical: 20,
    maxHeight: 400,
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  userCard: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4285F4",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  userDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});
