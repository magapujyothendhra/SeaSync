import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useReports } from "@/contexts/ReportsContext";
import { MapPin, Filter, RefreshCw, Flame } from "lucide-react-native";
import { POLLUTION_TYPES } from "@/constants/pollutionTypes";
import { PollutionType } from "@/constants/types";

export default function MapScreen() {
  const { reports, isLoading, refreshReports } = useReports();
  const [selectedTypes, setSelectedTypes] = useState<Set<PollutionType>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const filteredReports = reports.filter(
    (report) => selectedTypes.size === 0 || selectedTypes.has(report.type)
  );

  const generateHeatmapData = () => {
    const grid: { [key: string]: number } = {};
    const gridSize = 0.01;
    
    filteredReports.forEach(report => {
      const gridX = Math.floor(report.latitude / gridSize);
      const gridY = Math.floor(report.longitude / gridSize);
      const key = `${gridX},${gridY}`;
      grid[key] = (grid[key] || 0) + 1;
    });
    
    return Object.entries(grid).map(([key, count]) => {
      const [x, y] = key.split(',').map(Number);
      return {
        lat: x * gridSize + gridSize / 2,
        lng: y * gridSize + gridSize / 2,
        intensity: count
      };
    }).sort((a, b) => b.intensity - a.intensity);
  };

  const heatmapData = generateHeatmapData();
  const maxIntensity = heatmapData[0]?.intensity || 1;

  const toggleFilter = (type: PollutionType) => {
    setSelectedTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshReports();
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Pollution Map</Text>
          <Text style={styles.headerSubtitle}>
            {filteredReports.length} reports
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.heatmapToggle}
            onPress={() => setShowHeatmap(!showHeatmap)}
          >
            <Flame size={18} color={showHeatmap ? "#FF6B35" : "#8E8E93"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              size={20}
              color="#0066CC"
              style={isRefreshing ? styles.spinning : undefined}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Filter size={16} color="#8E8E93" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {POLLUTION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.filterChip,
                selectedTypes.has(type.value) && styles.filterChipActive,
              ]}
              onPress={() => toggleFilter(type.value)}
            >
              <Text style={styles.filterEmoji}>{type.emoji}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  selectedTypes.has(type.value) && styles.filterLabelActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.mapPlaceholder}>
        {showHeatmap && heatmapData.length > 0 && (
          <View style={styles.heatmapContainer}>
            {heatmapData.slice(0, 10).map((point, index) => {
              const size = 40 + (point.intensity / maxIntensity) * 80;
              const opacity = 0.2 + (point.intensity / maxIntensity) * 0.4;
              return (
                <View
                  key={index}
                  style={[
                    styles.heatmapPoint,
                    {
                      width: size,
                      height: size,
                      left: `${(index * 13 + 15) % 80}%`,
                      top: `${(index * 19 + 20) % 60}%`,
                      backgroundColor: `rgba(255, 107, 53, ${opacity})`,
                    },
                  ]}
                />
              );
            })}
          </View>
        )}
        <View style={styles.mapOverlay}>
          <MapPin size={48} color="#0066CC" />
          <Text style={styles.mapText}>Pollution Heatmap</Text>
          <Text style={styles.mapSubtext}>
            {showHeatmap ? `${heatmapData.length} hotspots detected` : 'Heatmap disabled'}
          </Text>
          <Text style={styles.mapNote}>
            (Simulated visualization - actual map integration requires native modules)
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.reportsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.reportsContent}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        ) : filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>No reports found</Text>
            <Text style={styles.emptySubtext}>
              {selectedTypes.size > 0
                ? "Try adjusting your filters"
                : "Be the first to report pollution"}
            </Text>
          </View>
        ) : (
          filteredReports.map((report) => {
            const pollutionType = POLLUTION_TYPES.find((t) => t.value === report.type);
            return (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View
                    style={[
                      styles.reportIcon,
                      { backgroundColor: pollutionType?.color + "20" },
                    ]}
                  >
                    <Text style={styles.reportEmoji}>{pollutionType?.emoji}</Text>
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportType}>{pollutionType?.label}</Text>
                    <Text style={styles.reportTime}>
                      {formatTimestamp(report.timestamp)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: report.synced ? "#34C759" : "#FF9500" },
                    ]}
                  />
                </View>

                <Text style={styles.reportDescription} numberOfLines={2}>
                  {report.description}
                </Text>

                <View style={styles.locationContainer}>
                  <MapPin size={14} color="#0066CC" />
                  <Text style={styles.locationText}>
                    {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                  </Text>
                </View>

                {report.photoUrl && (
                  <View style={styles.photoIndicator}>
                    <Text style={styles.photoIndicatorText}>📷 Photo attached</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
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
  header: {
    paddingTop: Platform.select({ ios: 60, android: 40, default: 20 }),
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1C1C1E",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  heatmapToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  spinning: {
    transform: [{ rotate: "180deg" }],
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingLeft: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  filtersContent: {
    gap: 8,
    paddingRight: 20,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: "#E5F1FB",
  },
  filterEmoji: {
    fontSize: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#3A3A3C",
  },
  filterLabelActive: {
    color: "#0066CC",
    fontWeight: "600" as const,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: "#E5F1FB",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  heatmapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  heatmapPoint: {
    position: "absolute",
    borderRadius: 100,
  },
  mapOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
  },
  mapText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#0066CC",
  },
  mapSubtext: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  mapNote: {
    fontSize: 11,
    color: "#C7C7CC",
    textAlign: "center",
    marginTop: 4,
  },
  reportsList: {
    flex: 1,
  },
  reportsContent: {
    padding: 20,
    gap: 12,
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
  emptyText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1C1C1E",
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
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
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  reportIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  reportEmoji: {
    fontSize: 24,
  },
  reportInfo: {
    flex: 1,
    gap: 2,
  },
  reportType: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1C1C1E",
  },
  reportTime: {
    fontSize: 12,
    color: "#8E8E93",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reportDescription: {
    fontSize: 14,
    color: "#3A3A3C",
    lineHeight: 20,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#0066CC",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  photoIndicator: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoIndicatorText: {
    fontSize: 12,
    color: "#3A3A3C",
  },
});
