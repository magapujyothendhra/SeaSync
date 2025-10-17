import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Image as ImageIcon, MapPin, Check, X, Sparkles, Loader2 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useReports } from "@/contexts/ReportsContext";
import { POLLUTION_TYPES, SEVERITY_LEVELS } from "@/constants/pollutionTypes";
import { PollutionType, SeverityLevel } from "@/constants/types";
import { generateText } from "@rork/toolkit-sdk";

export default function ReportScreen() {
  const { addReport, isOnline } = useReports();
  const [selectedType, setSelectedType] = useState<PollutionType | null>(null);
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ type: PollutionType; confidence: number; items: string[] } | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>('medium');

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required to report pollution.");
      return false;
    }
    return true;
  };

  const getLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      console.log("Location obtained:", currentLocation.coords);
    } catch (error) {
      console.error("Failed to get location:", error);
      Alert.alert("Error", "Failed to get your location. Please try again.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzingImage(true);
    try {
      const prompt = `Analyze this image of potential marine/ocean pollution. Identify:
1. The type of pollution from these options: ${POLLUTION_TYPES.map(t => t.label).join(', ')}
2. Specific items or pollutants visible
3. Your confidence level (0-100)

Respond in this exact format:
Type: [type]
Confidence: [number]
Items: [comma-separated list]`;

      const response = await generateText({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image', image: `data:image/jpeg;base64,${base64Image}` }
            ]
          }
        ]
      });

      console.log('AI Analysis:', response);

      const typeMatch = response.match(/Type:\s*([^\n]+)/i);
      const confidenceMatch = response.match(/Confidence:\s*(\d+)/i);
      const itemsMatch = response.match(/Items:\s*([^\n]+)/i);

      if (typeMatch && confidenceMatch) {
        const suggestedTypeLabel = typeMatch[1].trim().toLowerCase();
        const matchedType = POLLUTION_TYPES.find(t => 
          suggestedTypeLabel.includes(t.label.toLowerCase()) || 
          t.keywords.some(k => suggestedTypeLabel.includes(k.toLowerCase()))
        );

        if (matchedType) {
          const items = itemsMatch ? itemsMatch[1].split(',').map(i => i.trim()) : [];
          const confidence = parseInt(confidenceMatch[1]) / 100;

          setAiSuggestion({
            type: matchedType.value,
            confidence,
            items
          });

          if (confidence > 0.7 && !selectedType) {
            setSelectedType(matchedType.value);
          }
        }
      }
    } catch (error) {
      console.error('Failed to analyze image:', error);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Media library permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      const base64 = result.assets[0].base64 || null;
      setPhotoBase64(base64);
      if (base64) {
        await analyzeImage(base64);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      const base64 = result.assets[0].base64 || null;
      setPhotoBase64(base64);
      if (base64) {
        await analyzeImage(base64);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert("Missing Information", "Please select a pollution type.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Missing Information", "Please provide a description.");
      return;
    }

    if (!location) {
      Alert.alert("Missing Information", "Please enable location detection.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addReport({
        type: selectedType,
        description: description.trim(),
        photoBase64: photoBase64 || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now(),
        severity: selectedSeverity,
        aiClassification: aiSuggestion ? {
          suggestedType: aiSuggestion.type,
          confidence: aiSuggestion.confidence,
          detectedItems: aiSuggestion.items
        } : undefined
      });

      Alert.alert(
        "Success",
        isOnline
          ? "Your report has been submitted successfully!"
          : "Your report has been saved and will be uploaded when you're back online.",
        [{ text: "OK" }]
      );

      setSelectedType(null);
      setDescription("");
      setPhotoUri(null);
      setPhotoBase64(null);
      setLocation(null);
      setAiSuggestion(null);
      setSelectedSeverity('medium');
    } catch (error) {
      console.error("Failed to submit report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0066CC", "#00A8E8"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Report Pollution</Text>
          <Text style={styles.headerSubtitle}>Help protect our oceans</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pollution Type</Text>
            {aiSuggestion && (
              <View style={styles.aiSuggestionBadge}>
                <Sparkles size={14} color="#9D4EDD" />
                <Text style={styles.aiSuggestionText}>
                  AI: {Math.round(aiSuggestion.confidence * 100)}% confident
                </Text>
              </View>
            )}
          </View>
          <View style={styles.typesGrid}>
            {POLLUTION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  selectedType === type.value && styles.typeCardSelected,
                ]}
                onPress={() => setSelectedType(type.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.typeEmoji}>{type.emoji}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    selectedType === type.value && styles.typeLabelSelected,
                  ]}
                  numberOfLines={2}
                >
                  {type.label}
                </Text>
                {selectedType === type.value && (
                  <View style={styles.checkmark}>
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what you observed..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Severity Level</Text>
          <View style={styles.severityGrid}>
            {SEVERITY_LEVELS.map((severity) => (
              <TouchableOpacity
                key={severity.value}
                style={[
                  styles.severityCard,
                  selectedSeverity === severity.value && [
                    styles.severityCardSelected,
                    { borderColor: severity.color }
                  ],
                ]}
                onPress={() => setSelectedSeverity(severity.value)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.severityIndicator,
                  { backgroundColor: severity.color }
                ]} />
                <Text
                  style={[
                    styles.severityLabel,
                    selectedSeverity === severity.value && styles.severityLabelSelected,
                  ]}
                >
                  {severity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photo (Optional)</Text>
            {isAnalyzingImage && (
              <View style={styles.analyzingBadge}>
                <Loader2 size={14} color="#0066CC" />
                <Text style={styles.analyzingText}>Analyzing...</Text>
              </View>
            )}
          </View>
          {aiSuggestion && aiSuggestion.items.length > 0 && (
            <View style={styles.detectedItemsContainer}>
              <Text style={styles.detectedItemsTitle}>🔍 Detected items:</Text>
              <Text style={styles.detectedItemsText}>{aiSuggestion.items.join(', ')}</Text>
            </View>
          )}
          <View style={styles.photoContainer}>
            {photoUri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => {
                    setPhotoUri(null);
                    setPhotoBase64(null);
                  }}
                >
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                  <Camera size={32} color="#0066CC" />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                  <ImageIcon size={32} color="#0066CC" />
                  <Text style={styles.photoButtonText}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          {location ? (
            <View style={styles.locationCard}>
              <View style={styles.locationInfo}>
                <MapPin size={20} color="#00A8E8" />
                <View style={styles.locationText}>
                  <Text style={styles.locationLabel}>Current Location</Text>
                  <Text style={styles.coordinates}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={getLocation}
                disabled={isLoadingLocation}
              >
                <Text style={styles.updateLocationText}>Update</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getLocation}
              disabled={isLoadingLocation}
            >
              {isLoadingLocation ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MapPin size={20} color="#FFFFFF" />
                  <Text style={styles.locationButtonText}>Get Current Location</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isSubmitting ? ["#C7C7CC", "#C7C7CC"] : ["#FF6B35", "#FF8C42"]}
            style={styles.submitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Report</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

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
  header: {
    paddingTop: Platform.select({ ios: 60, android: 40, default: 20 }),
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  aiSuggestionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiSuggestionText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#9D4EDD",
  },
  analyzingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E5F1FB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  analyzingText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#0066CC",
  },
  detectedItemsContainer: {
    backgroundColor: "#F2F2F7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  detectedItemsTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#1C1C1E",
    marginBottom: 4,
  },
  detectedItemsText: {
    fontSize: 13,
    color: "#3A3A3C",
    lineHeight: 18,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1C1C1E",
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeCard: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  typeCardSelected: {
    borderColor: "#0066CC",
    backgroundColor: "#E5F1FB",
  },
  typeEmoji: {
    fontSize: 32,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#3A3A3C",
    textAlign: "center",
  },
  typeLabelSelected: {
    color: "#0066CC",
    fontWeight: "600" as const,
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0066CC",
    alignItems: "center",
    justifyContent: "center",
  },
  severityGrid: {
    flexDirection: "row",
    gap: 8,
  },
  severityCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  severityCardSelected: {
    backgroundColor: "#F8F9FA",
  },
  severityIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  severityLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#3A3A3C",
    textAlign: "center",
  },
  severityLabelSelected: {
    color: "#1C1C1E",
    fontWeight: "600" as const,
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1C1C1E",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  photoContainer: {
    minHeight: 200,
  },
  photoButtons: {
    flexDirection: "row",
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#0066CC",
    borderStyle: "dashed" as const,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0066CC",
  },
  photoPreview: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  locationText: {
    flex: 1,
    gap: 4,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1C1C1E",
  },
  coordinates: {
    fontSize: 12,
    color: "#8E8E93",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  updateLocationText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#0066CC",
  },
  locationButton: {
    backgroundColor: "#0066CC",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  submitButton: {
    marginHorizontal: 20,
    marginTop: 32,
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
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  bottomPadding: {
    height: 40,
  },
});
