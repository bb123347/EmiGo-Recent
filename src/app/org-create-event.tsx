import { useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";

import { theme } from "../components/theme";
import { db } from "../utils/firebaseClient";
import useUser from "../utils/auth/useUser";
import * as ImagePicker from "expo-image-picker";
import { uploadImageAsync } from "../utils/uploads";
import { geocodeAddress } from "../utils/geocode";

export default function OrgCreateEventScreen() {
  const router = useRouter();
  const { data: user } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
const [time, setTime] = useState("");
const [ampm, setAmpm] = useState<"AM" | "PM">("PM");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priceType, setPriceType] = useState("free");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessibilityFeatures, setAccessibilityFeatures] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const pickEventImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return;

  try {
    setUploadingImage(true);

    const uri = result.assets[0].uri;
    const path = `event-images/${user?.uid}/${Date.now()}.jpg`;

    const url = await uploadImageAsync({ uri, path });
    setImageUrl(url);
  } catch (e: any) {
    setError(e?.message || "Could not upload image.");
  } finally {
    setUploadingImage(false);
  }
};
  
const toggleFeature = (feature: string) => {
  setAccessibilityFeatures((current) =>
    current.includes(feature)
      ? current.filter((item) => item !== feature)
      : [...current, feature],
  );
};


  const publishEvent = async () => {
    setError("");

    if (!user?.uid) {
      setError("You must be signed in.");
      return;
    }

    if (!title.trim()) {
      setError("Event title is required.");
      return;
    }

    if (!date.trim() || !time.trim()) {
  setError("Date and time are required.");
  return;
}

const startDate = parseDateTime(date, time, ampm);

if (!startDate) {
  setError("Please use date YYYY-MM-DD and time like 2:00.");
  return;
}

    try {
      setLoading(true);

      const coordinates = await geocodeAddress([
  venueName,
  address,
  city,
  stateName,
]);

      const ref = await addDoc(collection(db, "events"), {
        title: title.trim(),
        description: description.trim(),
        start_datetime: Timestamp.fromDate(startDate),

        venue_name: venueName.trim(),
        address: address.trim(),
        city: city.trim(),
        state: stateName.trim(),

        latitude: coordinates?.latitude || null,
  longitude: coordinates?.longitude || null,

        image_url: imageUrl.trim(),
        price_type: priceType.trim() || "free",
        capacity: capacity ? Number(capacity) : null,
        attendee_count: 0,

        organizer_uid: user.uid,
        created_by_uid: user.uid,
        organizer_name: user.displayName || "",
        organizer_email: user.email || "",

        accessibility_features: accessibilityFeatures.map((name) => ({ name })),
accessibility_attributes: accessibilityFeatures,

        is_approved: true,
        rsvp_count: 0,

        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      router.replace(`/(tabs)/events/${ref.id}`);
    } catch (e: any) {
      setError(e?.message || "Could not publish event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 54,
        paddingBottom: 40,
      }}
    >
      <Pressable onPress={() => router.back()} style={{ marginBottom: 18 }}>
        <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>
          ← Back
        </Text>
      </Pressable>

      <Text style={{ fontSize: 32, fontWeight: "900", color: theme.colors.text }}>
        Create Event
      </Text>

      <Text style={{ marginTop: 6, color: theme.colors.secondaryText, fontSize: 16 }}>
        Publish accessible events for the EmiGo community.
      </Text>

      <View style={{ marginTop: 24 }}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Event title" style={inputStyle} />
        <TextInput value={description} onChangeText={setDescription} placeholder="Description" multiline style={[inputStyle, { height: 120, textAlignVertical: "top", paddingTop: 16 }]} />
        <TextInput
  value={date}
  onChangeText={setDate}
  placeholder="Date, e.g. 2026-02-15"
  keyboardType="numbers-and-punctuation"
  style={inputStyle}
/>

<View style={{ flexDirection: "row", gap: 10 }}>
  <TextInput
    value={time}
    onChangeText={setTime}
    placeholder="Time, e.g. 2:00"
    keyboardType="numbers-and-punctuation"
    style={[inputStyle, { flex: 1 }]}
  />

  <Pressable
    onPress={() => setAmpm("AM")}
    style={[ampmButton, ampm === "AM" && ampmButtonSelected]}
  >
    <Text style={ampm === "AM" ? ampmTextSelected : ampmText}>AM</Text>
  </Pressable>

  <Pressable
    onPress={() => setAmpm("PM")}
    style={[ampmButton, ampm === "PM" && ampmButtonSelected]}
  >
    <Text style={ampm === "PM" ? ampmTextSelected : ampmText}>PM</Text>
  </Pressable>
</View>
        <TextInput value={venueName} onChangeText={setVenueName} placeholder="Venue name" style={inputStyle} />
        <TextInput value={address} onChangeText={setAddress} placeholder="Address" style={inputStyle} />
        <TextInput value={city} onChangeText={setCity} placeholder="City" style={inputStyle} />
        <TextInput value={stateName} onChangeText={setStateName} placeholder="State" style={inputStyle} />
        <Pressable
  onPress={pickEventImage}
  disabled={uploadingImage}
  style={{
    backgroundColor: "#F3F7FF",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D6E6FF",
    marginBottom: 12,
  }}
>
  <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>
    {uploadingImage ? "Uploading image..." : "Upload Event Image"}
  </Text>
</Pressable>
        <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="Image URL" autoCapitalize="none" style={inputStyle} />
        <TextInput value={priceType} onChangeText={setPriceType} placeholder="Price type: free or paid" autoCapitalize="none" style={inputStyle} />
        <TextInput
          value={capacity}
          onChangeText={setCapacity}
          placeholder="Attendee cap, e.g. 50"
          keyboardType="number-pad"
          style={inputStyle}
        />

<Text
  style={{
    fontSize: 20,
    fontWeight: "900",
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 12,
  }}
  >
  Accessibility Features
</Text>

<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
  {[
    "Wheelchair Accessible",
    "ASL Interpretation",
    "Quiet Space",
    "Accessible Restrooms",
    "Accessible Parking",
    "Low Vision Support",
    "Service Animals Welcome",
  ].map((feature) => {
    const selected = accessibilityFeatures.includes(feature);

    return (
      <Pressable
        key={feature}
        onPress={() => toggleFeature(feature)}
        style={{
          backgroundColor: selected ? "#EAF3FF" : "white",
          borderColor: selected ? theme.colors.primary : "#E8E8E8",
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Text
          style={{
            color: selected ? theme.colors.primary : theme.colors.text,
            fontWeight: "800",
          }}
        >
          {selected ? "✓ " : ""}{feature}
        </Text>
      </Pressable>
    );
  })}
</View>

      </View>

      {!!error && (
        <Text style={{ color: "#D93025", marginBottom: 12, lineHeight: 20 }}>
          {error}
        </Text>
      )}

      <Pressable
        onPress={publishEvent}
        disabled={loading}
        style={{
          marginTop: 10,
          backgroundColor: theme.colors.primary,
          borderRadius: 22,
          padding: 18,
          alignItems: "center",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontSize: 17, fontWeight: "900" }}>
            Publish Event
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function parseDateTime(date: string, time: string, ampm: "AM" | "PM") {
  const dateMatch = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = time.trim().match(/^(\d{1,2}):(\d{2})$/);

  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  const parsed = new Date(year, month - 1, day, hour, minute);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}

const inputStyle: any = {
  backgroundColor: "white",
  borderWidth: 1,
  borderColor: "#E8E8E8",
  borderRadius: 18,
  minHeight: 54,
  paddingHorizontal: 16,
  fontSize: 16,
  marginBottom: 12,
  color: "#111",
};

const ampmButton: any = {
  minWidth: 58,
  height: 54,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#E8E8E8",
  backgroundColor: "white",
  alignItems: "center",
  justifyContent: "center",
};

const ampmButtonSelected: any = {
  borderColor: theme.colors.primary,
  backgroundColor: "#EAF3FF",
};

const ampmText: any = {
  color: theme.colors.text,
  fontWeight: "900",
};

const ampmTextSelected: any = {
  color: theme.colors.primary,
  fontWeight: "900",
};