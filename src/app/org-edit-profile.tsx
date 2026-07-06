import { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import useUser from "../utils/auth/useUser";
import { getUserAccount } from "../utils/account";
import { db } from "../utils/firebaseClient";
import { theme } from "../components/theme";
import * as ImagePicker from "expo-image-picker";
import { uploadImageAsync } from "../utils/uploads";

export default function OrgEditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  const { data: account } = useQuery({
    queryKey: ["account", user?.uid],
    enabled: !!user?.uid,
    queryFn: () => getUserAccount(user.uid),
  });

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [memberCount, setMemberCount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [website, setWebsite] = useState("");
const [description, setDescription] = useState("");
const [logoUrl, setLogoUrl] = useState("");
const [coverUrl, setCoverUrl] = useState("");
const [uploadingImage, setUploadingImage] = useState(false);
const pickLogo = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return;

  try {
    setUploadingImage(true);

    const url = await uploadImageAsync({
      uri: result.assets[0].uri,
      path: `organization-logos/${user.uid}.jpg`,
    });

    setLogoUrl(url);
  } finally {
    setUploadingImage(false);
  }
};
const pickCover = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return;

  try {
    setUploadingImage(true);

    const url = await uploadImageAsync({
      uri: result.assets[0].uri,
      path: `organization-covers/${user.uid}.jpg`,
    });

    setCoverUrl(url);
  } finally {
    setUploadingImage(false);
  }
};

  useEffect(() => {
    const org = account?.organization;
    if (!org) return;

    setCoverUrl(org.cover_url || "");
    setLogoUrl(org.logo_url || "");
    setOrgName(org.name || "");
    setOrgType(org.type || "");
    setDescription(org.description || "");
    setAddress(org.address || "");
    setWebsite(org.website || "");
    setContactPerson(org.contact_person || "");
    setPhone(org.phone || "");
    setMemberCount(org.member_count != null ? String(org.member_count) : "");
    
    
 
  }, [account]);

  const saveProfile = async () => {
    if (!user?.uid) return;

    if (!orgName.trim()) {
      setError("Organization name is required.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: orgName.trim(),
          account_type: "organization",
          organization: {
            name: orgName.trim(),
            type: orgType.trim(),
            address: address.trim(),
            contact_person: contactPerson.trim(),
            phone: phone.trim(),
            member_count: memberCount ? Number(memberCount) : null,
            website: website.trim(),
            description: description.trim(),
            logo_url: logoUrl,
            cover_url: coverUrl,
          },
          updated_at: serverTimestamp(),
        },
        { merge: true },
      );

      queryClient.invalidateQueries({ queryKey: ["account", user.uid] });
      router.back();
    } catch (e: any) {
      setError(e?.message || "Could not save organization profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 54, paddingBottom: 40 }}
    >
      <Pressable onPress={() => router.back()} style={{ marginBottom: 18 }}>
        <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>← Back</Text>
      </Pressable>

      <Text style={{ fontSize: 32, fontWeight: "900", color: theme.colors.text }}>
        Edit Organization
      </Text>

      <Text style={{ marginTop: 6, marginBottom: 22, color: theme.colors.secondaryText, fontSize: 16 }}>
        Keep your organization information up to date.
      </Text>
       
      <Pressable
  onPress={pickLogo}
  style={uploadButtonStyle}
>
  <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>
    {uploadingImage ? "Uploading..." : "Upload Organization Logo"}
  </Text>
</Pressable>

<Pressable
  onPress={pickCover}
  style={uploadButtonStyle}
>
  <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>
    {uploadingImage ? "Uploading..." : "Upload Cover Photo"}
  </Text>
</Pressable>

      <TextInput value={orgName} onChangeText={setOrgName} placeholder="Organization name" style={inputStyle} />
      <TextInput value={orgType} onChangeText={setOrgType} placeholder="Organization type" style={inputStyle} />
      <TextInput
  value={website}
  onChangeText={setWebsite}
  placeholder="Website"
  autoCapitalize="none"
  style={inputStyle}
/>

<TextInput
  value={description}
  onChangeText={setDescription}
  placeholder="Organization description"
  multiline
  style={[inputStyle, { height: 120, textAlignVertical: "top", paddingTop: 16 }]}
/>
      <TextInput value={address} onChangeText={setAddress} placeholder="Address" style={inputStyle} />
      <TextInput value={contactPerson} onChangeText={setContactPerson} placeholder="Contact person" style={inputStyle} />
      <TextInput value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" style={inputStyle} />
      <TextInput value={memberCount} onChangeText={setMemberCount} placeholder="Number of members/residents" keyboardType="number-pad" style={inputStyle} />

      {!!error && <Text style={{ color: "#D93025", marginBottom: 12 }}>{error}</Text>}

      <Pressable
        onPress={saveProfile}
        disabled={loading}
        style={{
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
          <Text style={{ color: "white", fontWeight: "900", fontSize: 17 }}>
            Save Profile
          </Text>
        )}
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

const uploadButtonStyle: any = {
  backgroundColor: "#F3F7FF",
  borderRadius: 18,
  padding: 16,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#D6E6FF",
  marginBottom: 12,
};