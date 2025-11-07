import React, { useEffect, useState } from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export default function HomeScreen() {
  const [userInfo, setUserInfo] = useState<any>(null);

  // Configure all platform client IDs
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "1065391255871-q68jsg1igm343ardoasgjhnlhhe46iu8.apps.googleusercontent.com",
    webClientId:
      "1065391255871-n0iigit6bb496n4es4oigmutej3d0pbd.apps.googleusercontent.com",
    iosClientId:
      "1065391255871-fakeiosid.apps.googleusercontent.com", // optional if you’re not testing iOS
  });

  //  When user successfully signs in
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      getUserData(authentication?.accessToken);
    }
  }, [response]);

  // Fetch Google profile using access token
  const getUserData = async (accessToken: string) => {
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = await res.json();
      console.log("User Info:", user);
      setUserInfo(user);
    } catch (error) {
      console.error("❌ Failed to fetch user info:", error);
    }
  };

  //  Sign-out function
  const handleSignOut = () => {
    setUserInfo(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Welcome to Expo Google Login</Text>

      {!userInfo ? (
        <Button
          title="Sign in with Google"
          disabled={!request}
          onPress={() => promptAsync()}
        />
      ) : (
        <View style={styles.profileBox}>
          {userInfo.picture && (
            <Image source={{ uri: userInfo.picture }} style={styles.profileImage} />
          )}
          <Text style={styles.name}>{userInfo.name}</Text>
          <Text style={styles.email}>{userInfo.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} color="red" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30 },
  profileBox: { alignItems: "center", marginTop: 20 },
  profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  name: { fontSize: 18, fontWeight: "bold" },
  email: { fontSize: 14, color: "#555", marginBottom: 10 },
});
