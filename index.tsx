import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useReports } from "@/contexts/ReportsContext";
import { Waves, AlertTriangle, MapPin, Clock, Wifi, WifiOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { reports, offlineQueue, isOnline, isSyncing, isLoading } = useReports();
  const router = useRouter();

  const recentReports = reports.slice(0, 5);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0066CC", "#00A8E8", "#00CED1"]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SeaSync</Text>
              <Text style={styles.subtitle}>Marine Pollution Reporter</Text>
            </View>
            <View style={styles.statusBadge}>
              {isOnline ? (
                <Wifi size={16} color="#FFFFFF" />
              ) : (
                <WifiOff size={16} color="#FFFFFF" />
              )}
              <Text style={styles.statusText}>
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>

          <View style={styles.waveContainer}>
            <Waves size={60} color="rgba(255, 255, 255, 0.3)" style={styles.waveIcon} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MapPin size={24} color="#0066CC" />
            </View>
            <Text style={styles.statNumber}>{reports.length}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: "#FFE5D9" }]}>
              <Clock size={24} color="#FF6B35" />
            </View>
            <Text style={styles.statNumber}>{offlineQueue.length}</Text>
            <Text style={styles.statLabel}>Pending Sync</Text>
          </View>
        </View>

        {isSyncing && (
          <View style={styles.syncingBanner}>
            <ActivityIndicator size="small" color="#0066CC" />
            <Text style={styles.syncingText}>Syncing reports...</Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => router.push("/report")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF6B35", "#FF8C42"]}
              style={styles.reportButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AlertTriangle size={28} color="#FFFFFF" />
              <Text style={styles.reportButtonText}>Report Pollution</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => router.push("/map")}
            activeOpacity={0.8}
          >
            <MapPin size={24} color="#0066CC" />
            <Text style={styles.mapButtonText}>View Map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066CC" />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : recentReports.length === 0 ? (
            <View style={styles.emptyState}>
              <Waves size={48} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>No reports yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Be the first to report marine pollution
              </Text>
            </View>
          ) : (
            recentReports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportTypeContainer}>
                    <View
                      style={[
                        styles.reportTypeDot,
                        { backgroundColor: getTypeColor(report.type) },
                      ]}
                    />
                    <Text style={styles.reportType}>{formatType(report.type)}</Text>
                  </View>
                  <Text style={styles.reportTime}>
                    {formatTimestamp(report.timestamp)}
                  </Text>
                </View>
                <Text style={styles.reportDescription} numberOfLines={2}>
                  {report.description}
                </Text>
                <View style={styles.reportLocation}>
                  <MapPin size={14} color="#8E8E93" />
                  <Text style={styles.reportLocationText}>
                    {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Help protect our oceans by reporting pollution
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function formatType(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    plastic: "#FF6B35",
    "oil-spill": "#2D3142",
    debris: "#8B4513",
    chemical: "#9D4EDD",
    sewage: "#6B4423",
    other: "#718355",
  };
  return colors[type] || "#718355";
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  headerGradient: {
    paddingBottom: 40,
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  waveContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  waveIcon: {
    opacity: 0.3,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
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
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5F1FB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1C1C1E",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500" as const,
  },
  syncingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5F1FB",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  syncingText: {
    fontSize: 14,
    color: "#0066CC",
    fontWeight: "500" as const,
  },
  actionContainer: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  reportButton: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#FF6B35",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)" as const,
      },
    }),
  },
  reportButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  reportButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 2,
    borderColor: "#0066CC",
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#0066CC",
  },
  recentSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1C1C1E",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1C1C1E",
    marginTop: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)" as const,
      },
    }),
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reportTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reportType: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1C1C1E",
  },
  reportTime: {
    fontSize: 12,
    color: "#8E8E93",
  },
  reportDescription: {
    fontSize: 14,
    color: "#3A3A3C",
    marginBottom: 8,
    lineHeight: 20,
  },
  reportLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reportLocationText: {
    fontSize: 12,
    color: "#8E8E93",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
});
