import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Target, MapPin, Users, Calendar, Trophy } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SAMPLE_MISSIONS = [
  {
    id: "1",
    title: "Beach Cleanup - Santa Monica",
    description: "Join us for a community cleanup at Santa Monica Beach. Target area includes pier and surrounding coastline.",
    organizerName: "Ocean Guardians",
    latitude: 34.0095,
    longitude: -118.4988,
    startDate: Date.now() + 86400000 * 2,
    participantCount: 24,
    status: "active" as const,
    pointsReward: 150,
    targetReportIds: ["r1", "r2", "r3"]
  },
  {
    id: "2",
    title: "Oil Spill Response - Marina",
    description: "Urgent cleanup needed for small oil spill detected in marina area. Volunteers needed immediately.",
    organizerName: "Marine Response Team",
    latitude: 33.9806,
    longitude: -118.4517,
    startDate: Date.now() + 86400000,
    participantCount: 8,
    status: "active" as const,
    pointsReward: 300,
    targetReportIds: ["r4"]
  },
  {
    id: "3",
    title: "Plastic Free Harbor Day",
    description: "Annual harbor cleanup event. All equipment provided. Breakfast and lunch included for volunteers.",
    organizerName: "Clean Seas Initiative",
    latitude: 33.7434,
    longitude: -118.2680,
    startDate: Date.now() + 86400000 * 7,
    participantCount: 156,
    status: "active" as const,
    pointsReward: 200,
    targetReportIds: ["r5", "r6"]
  }
];

export default function MissionsScreen() {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#00A8E8", "#00D4AA"]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Cleanup Missions</Text>
              <Text style={styles.subtitle}>Make a difference together</Text>
            </View>
            <View style={styles.missionBadge}>
              <Target size={20} color="#FFFFFF" />
              <Text style={styles.missionCount}>{SAMPLE_MISSIONS.length}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Active Missions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>188</Text>
            <Text style={styles.statLabel}>Total Volunteers</Text>
          </View>
        </View>

        <View style={styles.missionsSection}>
          <Text style={styles.sectionTitle}>Available Missions</Text>
          
          {SAMPLE_MISSIONS.map((mission) => (
            <View key={mission.id} style={styles.missionCard}>
              <View style={styles.missionHeader}>
                <View style={styles.urgencyBadge}>
                  <Text style={styles.urgencyText}>
                    {mission.pointsReward > 200 ? "🔥 URGENT" : "📍 Active"}
                  </Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Trophy size={14} color="#FFB800" />
                  <Text style={styles.pointsText}>+{mission.pointsReward} pts</Text>
                </View>
              </View>

              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.missionDescription} numberOfLines={2}>
                {mission.description}
              </Text>

              <View style={styles.missionDetails}>
                <View style={styles.detailRow}>
                  <Users size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>
                    {mission.participantCount} volunteers
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={16} color="#8E8E93" />
                  <Text style={styles.detailText}>
                    {formatDate(mission.startDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.organizerInfo}>
                <Text style={styles.organizerLabel}>Organized by</Text>
                <Text style={styles.organizerName}>{mission.organizerName}</Text>
              </View>

              <View style={styles.locationInfo}>
                <MapPin size={14} color="#0066CC" />
                <Text style={styles.locationText}>
                  {mission.latitude.toFixed(4)}, {mission.longitude.toFixed(4)}
                </Text>
              </View>

              <TouchableOpacity style={styles.joinButton}>
                <LinearGradient
                  colors={["#00D4AA", "#00A8E8"]}
                  style={styles.joinButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Target size={20} color="#FFFFFF" />
                  <Text style={styles.joinButtonText}>Join Mission</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Want to organize a cleanup mission?
          </Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Create Mission</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  headerGradient: {
    paddingBottom: 24,
  },
  safeArea: {
    flex: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  missionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  missionCount: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: -10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" as const,
      },
    }),
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#00A8E8",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500" as const,
  },
  missionsSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1C1C1E",
    marginBottom: 16,
  },
  missionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)" as const,
      },
    }),
  },
  missionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  urgencyBadge: {
    backgroundColor: "#FFF4ED",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#FF6B35",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#B8860B",
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1C1C1E",
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    color: "#3A3A3C",
    lineHeight: 20,
    marginBottom: 12,
  },
  missionDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "500" as const,
  },
  organizerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  organizerLabel: {
    fontSize: 12,
    color: "#8E8E93",
  },
  organizerName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#1C1C1E",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 12,
    color: "#0066CC",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  joinButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  joinButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 40,
    gap: 16,
  },
  footerText: {
    fontSize: 15,
    color: "#3A3A3C",
    textAlign: "center",
    fontWeight: "500" as const,
  },
  createButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  bottomPadding: {
    height: 20,
  },
});
