import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Trophy, TrendingUp, Zap, Award, ChevronRight, BarChart3 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReports } from "@/contexts/ReportsContext";
import { ALL_BADGES, calculateLevel, getPointsForNextLevel } from "@/constants/badges";

export default function ProfileScreen() {
  const { reports } = useReports();
  
  const userPoints = reports.length * 25;
  const userLevel = calculateLevel(userPoints);
  const nextLevelPoints = getPointsForNextLevel(userLevel);
  const progress = nextLevelPoints > 0 ? (userPoints / nextLevelPoints) * 100 : 100;

  const unlockedBadges = ALL_BADGES.filter((badge) => {
    if (badge.type === 'first_report') return reports.length >= 1;
    if (badge.type === 'eco_warrior') return reports.length >= 10;
    return false;
  });

  const leaderboardData = [
    { rank: 1, name: "Marina Waters", points: 2450, avatar: "🌊" },
    { rank: 2, name: "Ocean Guardian", points: 1875, avatar: "🐋" },
    { rank: 3, name: "SeaKeeper", points: 1640, avatar: "🐠" },
    { rank: 4, name: "You", points: userPoints, avatar: "👤", isCurrentUser: true },
    { rank: 5, name: "Coral Protector", points: 980, avatar: "🪸" },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#9D4EDD", "#00D4AA"]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>🌊</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Ocean Explorer</Text>
              <Text style={styles.userEmail}>explorer@seasync.app</Text>
            </View>
          </View>

          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelInfo}>
                <Text style={styles.levelLabel}>Level {userLevel}</Text>
                <Text style={styles.levelSubtitle}>
                  {nextLevelPoints - userPoints} pts to Level {userLevel + 1}
                </Text>
              </View>
              <View style={styles.pointsBadge}>
                <Zap size={16} color="#FFB800" fill="#FFB800" />
                <Text style={styles.pointsText}>{userPoints}</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#00A8E8" />
            </View>
            <Text style={styles.statValue}>{reports.length}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <Trophy size={20} color="#FFB800" />
            </View>
            <Text style={styles.statValue}>{unlockedBadges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <Award size={20} color="#9D4EDD" />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Missions</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <Text style={styles.sectionCount}>
              {unlockedBadges.length}/{ALL_BADGES.length}
            </Text>
          </View>
          <View style={styles.badgesGrid}>
            {ALL_BADGES.map((badge) => {
              const unlocked = unlockedBadges.some(b => b.type === badge.type);
              return (
                <View
                  key={badge.type}
                  style={[
                    styles.badgeCard,
                    !unlocked && styles.badgeCardLocked
                  ]}
                >
                  <Text style={[
                    styles.badgeIcon,
                    !unlocked && styles.badgeIconLocked
                  ]}>
                    {unlocked ? badge.icon : "🔒"}
                  </Text>
                  <Text style={[
                    styles.badgeName,
                    !unlocked && styles.badgeNameLocked
                  ]} numberOfLines={1}>
                    {badge.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.sectionHeaderButton}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <ChevronRight size={20} color="#0066CC" />
          </TouchableOpacity>
          
          {leaderboardData.map((user) => (
            <View
              key={user.rank}
              style={[
                styles.leaderboardItem,
                user.isCurrentUser && styles.leaderboardItemCurrent
              ]}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{user.rank}</Text>
              </View>
              <Text style={styles.userAvatar}>{user.avatar}</Text>
              <View style={styles.leaderboardInfo}>
                <Text style={[
                  styles.leaderboardName,
                  user.isCurrentUser && styles.leaderboardNameCurrent
                ]}>
                  {user.name}
                </Text>
                <View style={styles.leaderboardPoints}>
                  <Zap size={12} color="#FFB800" fill="#FFB800" />
                  <Text style={styles.leaderboardPointsText}>
                    {user.points} points
                  </Text>
                </View>
              </View>
              {user.rank <= 3 && (
                <Text style={styles.medalEmoji}>
                  {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : "🥉"}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <TouchableOpacity style={styles.analyticsCard}>
            <View style={styles.analyticsIcon}>
              <BarChart3 size={24} color="#0066CC" />
            </View>
            <View style={styles.analyticsInfo}>
              <Text style={styles.analyticsTitle}>Impact Report</Text>
              <Text style={styles.analyticsSubtitle}>View your environmental impact</Text>
            </View>
            <ChevronRight size={20} color="#C7C7CC" />
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  levelCard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    marginBottom: 2,
  },
  levelSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#1C1C1E",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500" as const,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1C1C1E",
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0066CC",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeCard: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
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
  badgeCardLocked: {
    opacity: 0.4,
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeIconLocked: {
    fontSize: 32,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: "#1C1C1E",
    textAlign: "center",
  },
  badgeNameLocked: {
    color: "#8E8E93",
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  leaderboardItemCurrent: {
    backgroundColor: "#E5F1FB",
    borderWidth: 2,
    borderColor: "#0066CC",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#3A3A3C",
  },
  userAvatar: {
    fontSize: 24,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1C1C1E",
    marginBottom: 2,
  },
  leaderboardNameCurrent: {
    color: "#0066CC",
  },
  leaderboardPoints: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leaderboardPointsText: {
    fontSize: 12,
    color: "#8E8E93",
  },
  medalEmoji: {
    fontSize: 24,
  },
  analyticsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
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
  analyticsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5F1FB",
    alignItems: "center",
    justifyContent: "center",
  },
  analyticsInfo: {
    flex: 1,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1C1C1E",
    marginBottom: 2,
  },
  analyticsSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
  bottomPadding: {
    height: 20,
  },
});
