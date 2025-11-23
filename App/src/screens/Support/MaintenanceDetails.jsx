import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-paper";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import { createMaintenanceRequest } from "../../Redux/Maintenance/services";
import Toast from "react-native-simple-toast";
import { useDispatch, useSelector } from "react-redux";

const Colors = {
  primary: "#E53935",
  lightGray: "#F5F5F5",
  background: "#FFFFFF",
  text: "#333",
  placeholder: "#9E9E9E",
  border: "#E0E0E0",
};

const MaintenanceDetails = ({ onClose, property, landlordId }) => {
  const dispatch = useDispatch();
  
  // Get authentication data from Redux
  const loginData = useSelector(state => state.loginData || state.login);

  const token =
    loginData?.idToken ||
    loginData?.accessToken ||
    loginData?.token ||
    null;

  const tenant_sub = useSelector(state =>
    state?.loginData?.user?.sub ||
    state?.loginData?.tenant_sub ||
    null
  );

  // Local loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  const categories = [
    "Electrical",
    "Plumbing",
    "Carpentry",
    "HVAC",
    "Painting",
    "Cleaning",
    "Landscaping",
    "Appliances",
    "Other",
  ];

  const priorities = ["High", "Moderate", "Low"];

  const handleSelectCategory = (item) => {
    setSelectedCategory(item);
    setCategoryModalVisible(false);
  };

  const handleSelectPriority = (item) => {
    setSelectedPriority(item);
    setPriorityModalVisible(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Toast.show("Please enter a title");
      return;
    }

    if (!description.trim()) {
      Toast.show("Please enter a description");
      return;
    }

    if (!selectedCategory) {
      Toast.show("Please select a category");
      return;
    }

    if (!selectedPriority) {
      Toast.show("Please select a priority");
      return;
    }

    if (!location.trim()) {
      Toast.show("Please enter a location");
      return;
    }

    if (!token) {
      Toast.show("Authentication token missing");
      return;
    }

    setIsSubmitting(true);

    // ✅ Create payload exactly matching your Postman structure
    const payload = {
      title: title.trim(),
      description: description.trim(),
     category: [selectedCategory],
      priority: selectedPriority,
      location: location.trim(),
      landlord_id: landlordId || property?.landlord_id || "LL_456",
      property_id: property?.property_id || property?.id || "PROP_123",
      preferred_start: new Date().toISOString(),
      preferred_end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      timezone: "Asia/Kolkata",
    };

    console.log("🚀 Submitting Maintenance Request:", payload);
    console.log("🔑 Using token:", token ? "Present" : "Missing");

    try {
      // ✅ Pass payload directly - services.js will handle the token from Redux
      const result = await dispatch(
        createMaintenanceRequest(payload)
      ).unwrap();

      console.log("✅ Maintenance request created successfully:", result);
      
      Toast.show("Request submitted successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setLocation("");
      setSelectedCategory("");
      setSelectedPriority("");
      
      // Close modal - parent will refresh the list
      onClose();
    } catch (error) {
      console.error("❌ Error submitting maintenance:", error);
      Toast.show(error?.toString() || "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>New Request</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <AppIcon name={icons.close} height={hp(2.3)} width={hp(2.3)} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: hp(2) }}
      >
        {/* Title */}
        <Text style={styles.label}>Title*</Text>
        <TextInput
          mode="outlined"
          placeholder="Enter your Issue"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          outlineColor={Colors.border}
          activeOutlineColor={Colors.primary}
          editable={!isSubmitting}
        />

        {/* Description */}
        <Text style={styles.label}>Description*</Text>
        <TextInput
          mode="outlined"
          multiline
          numberOfLines={4}
          placeholder="Detail about maintenance issues"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          outlineColor={Colors.border}
          activeOutlineColor={Colors.primary}
          editable={!isSubmitting}
        />

        {/* Category & Priority */}
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Category*</Text>
            <TouchableOpacity
              onPress={() => !isSubmitting && setCategoryModalVisible(true)}
              style={styles.dropdownBox}
              disabled={isSubmitting}
            >
              <Text
                style={{
                  color: selectedCategory ? Colors.text : Colors.placeholder,
                }}
              >
                {selectedCategory || "Select"}
              </Text>
              <AppIcon
                name={icons.arrowDown}
                height={hp(2)}
                width={hp(2)}
                color={Colors.placeholder}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.halfInput}>
            <Text style={styles.label}>Priority*</Text>
            <TouchableOpacity
              onPress={() => !isSubmitting && setPriorityModalVisible(true)}
              style={styles.dropdownBox}
              disabled={isSubmitting}
            >
              <Text
                style={{
                  color: selectedPriority ? Colors.text : Colors.placeholder,
                }}
              >
                {selectedPriority || "Select"}
              </Text>
              <AppIcon
                name={icons.arrowDown}
                height={hp(2)}
                width={hp(2)}
                color={Colors.placeholder}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <Text style={styles.label}>Location*</Text>
        <TextInput
          mode="outlined"
          placeholder="e.g. Kitchen, Bathroom, Living Room"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
          outlineColor={Colors.border}
          activeOutlineColor={Colors.primary}
          editable={!isSubmitting}
        />

        {/* Attachments */}
        <Text style={styles.label}>Attachment</Text>
        <View style={styles.attachRow}>
          <TouchableOpacity
            style={[styles.attachButton, styles.activeAttach]}
            disabled={isSubmitting}
          >
            <AppIcon
              name={icons.photo}
              height={hp(2)}
              width={hp(2)}
              color="#fff"
            />
            <Text style={styles.attachTextActive}>Photos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachButton}
            disabled={isSubmitting}
          >
            <AppIcon
              name={icons.voice}
              height={hp(2)}
              width={hp(2)}
              color={Colors.placeholder}
            />
            <Text style={styles.attachText}>Voice Note</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.submitText, { marginLeft: 8 }]}>
                  Submitting...
                </Text>
              </View>
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* CATEGORY MODAL */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.selectionOverlay}
          activeOpacity={1}
          onPress={() => setCategoryModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.selectionContainer}>
            <Text style={styles.selectionTitle}>Select Category</Text>
            <ScrollView style={styles.optionsList}>
              {categories.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => handleSelectCategory(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* PRIORITY MODAL */}
      <Modal
        visible={priorityModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPriorityModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.selectionOverlay}
          activeOpacity={1}
          onPress={() => setPriorityModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.selectionContainer}>
            <Text style={styles.selectionTitle}>Select Priority</Text>
            {priorities.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => handleSelectPriority(item)}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MaintenanceDetails;

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: wp(6),
    paddingTop: hp(2),
    paddingBottom: hp(4),
    maxHeight: hp(90),
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  header: {
    fontSize: hp(2.6),
    fontWeight: "700",
    color: Colors.text,
  },
  closeButton: {
    backgroundColor: "#F3F3F3",
    borderRadius: 20,
    padding: 5,
  },
  label: {
    fontSize: hp(1.7),
    fontWeight: "500",
    color: Colors.text,
    marginTop: hp(1.5),
    marginBottom: hp(0.5),
  },
  input: {
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  attachRow: {
    flexDirection: "row",
    marginTop: hp(1),
  },
  attachButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    marginRight: wp(3),
  },
  activeAttach: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  attachText: {
    marginLeft: 5,
    fontSize: hp(1.7),
    color: Colors.text,
  },
  attachTextActive: {
    marginLeft: 5,
    fontSize: hp(1.7),
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(3),
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: hp(1.5),
    marginRight: wp(3),
    alignItems: "center",
  },
  cancelText: {
    color: Colors.text,
    fontSize: hp(1.9),
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: hp(1.5),
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: hp(1.9),
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  selectionOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: wp(10),
  },
  selectionContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: hp(2),
    maxHeight: hp(50),
  },
  selectionTitle: {
    fontSize: hp(2),
    fontWeight: "600",
    marginBottom: hp(1),
    textAlign: "center",
  },
  optionsList: {
    maxHeight: hp(40),
  },
  option: {
    paddingVertical: hp(1.2),
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  optionText: {
    textAlign: "center",
    fontSize: hp(1.9),
    color: Colors.text,
  },
});
