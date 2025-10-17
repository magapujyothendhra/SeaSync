import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Waves } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Waves size={64} color="#C7C7CC" />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>This page doesn&apos;t exist in SeaSync.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
    backgroundColor: "#F2F2F7",
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1C1C1E",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
  link: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#0066CC",
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
