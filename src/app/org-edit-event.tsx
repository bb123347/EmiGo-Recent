import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { theme } from "../components/theme";
import { db } from "../utils/firebaseClient";
import { getEventById } from "../utils/events";
import * as ImagePicker from "expo-image-picker";
import { uploadImageAsync } from "../utils/uploads";
import { geocodeAddress } from "../utils/geocode";

export default function OrgEditEventScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    enabled: !!id,
    queryFn: () => getEventById(String(id)),
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [priceType, setPriceType] = useState("free");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const pickEventImage = async () => {
  const path = `event-images/${event?.organizer_uid || "unknown"}/${String(id)}-${Date.now()}.jpg`;
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

  useEffect(() => {
    if (!event) return;

    setTitle(event.title || "");
    setDescription(event.description || "");
    setVenueName(event.venue_name || "");
    setAddress(event.address || "");
    setCity(event.city || "");
    setStateName(event.state || "");
    setImageUrl(event.image_url || "");
    setPriceType(event.price_type || "free");
  }, [event]);

  const saveChanges = async () => {
    if (!id) return;

    if (!title.trim()) {
      setError("Event title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const coordinates = await geocodeAddress([
        venueName,
        address,
        city,
        stateName,
      ]);

      await updateDoc(doc(db, "events", String(id)), {
        title: title.trim(),
        description: description.trim(),
        venue_name: venueName.trim(),
        address: address.trim(),
        city: city.trim(),
        state: stateName.trim(),
        latitude: coordinates?.latitude || null,
        longitude: coordinates?.longitude || null,
        image_url: imageUrl.trim(),
        price_type: priceType.trim() || "free",
        updated_at: serverTimestamp(),
      });

      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["org-events"] });

      router.back();
    } catch (e: any) {
      setError(e?.message || "Could not update event.");
    } finally {
      setSaving(false);
    }
  };

const deleteEvent = async () => {
  if (!id) return;

  const confirmed = confirm("Delete this event? This cannot be undone.");
  if (!confirmed) return;

  try {
    setSaving(true);
    await deleteDoc(doc(db, "events", String(id)));

    queryClient.invalidateQueries({ queryKey: ["events"] });
    queryClient.invalidateQueries({ queryKey: ["org-events"] });

    router.replace("/org-my-events");
  } catch (e: any) {
    setError(e?.message || "Could not delete event.");
  } finally {
    setSaving(false);
  }
};

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 10, color: theme.colors.secondaryText }}>
          Loading event…
        </Text>
      </View>
    );
  }

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
        Edit Event
      </Text>

      <Text
        style={{
          marginTop: 6,
          marginBottom: 22,
          color: theme.colors.secondaryText,
          fontSize: 16,
        }}
      >
        Update your event details.
      </Text>

      <TextInput value={title} onChangeText={setTitle} placeholder="Event title" style={inputStyle} />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
        style={[inputStyle, { height: 120, textAlignVertical: "top", paddingTop: 16 }]}
      />
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

      {!!error && (
        <Text style={{ color: "#D93025", marginBottom: 12 }}>{error}</Text>
      )}

      <Pressable
        onPress={saveChanges}
        disabled={saving}
        style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 22,
          padding: 18,
          alignItems: "center",
          opacity: saving ? 0.7 : 1,
        }}
      >


        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontSize: 17, fontWeight: "900" }}>
            Save Changes
          </Text>
        )}
      </Pressable>

<Pressable
  onPress={() => router.push(`/org-event-rsvps?id=${id}`)}
  style={{
    marginTop: 14,
    backgroundColor: "#F3F7FF",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D6E6FF",
  }}
>
  <Text style={{ color: theme.colors.primary, fontSize: 17, fontWeight: "900" }}>
    View RSVPs
  </Text>
</Pressable>

<Pressable
  onPress={deleteEvent}
  disabled={saving}
  style={{
    marginTop: 14,
    backgroundColor: "#FFEAEA",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD0D0",
  }}
>
  <Text style={{ color: "#D93025", fontSize: 17, fontWeight: "900" }}>
    Delete Event
  </Text>
</Pressable>
    </ScrollView>
  );
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