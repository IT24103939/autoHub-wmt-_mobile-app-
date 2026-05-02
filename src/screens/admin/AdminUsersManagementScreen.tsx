import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAppTheme } from "../../hooks/useAppTheme";
import { AdminApiService, UserManagementData } from "../../services/AdminApiService";

export function AdminUsersManagementScreen() {
  const theme = useAppTheme();
  const colors = theme.colors;

  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementData | null>(
    null
  );
  const [deletionReason, setDeletionReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminApiService.getAllUsers(1, 100);
      // Response is already the array, not wrapped in an object
      setUsers(Array.isArray(response) ? response : response.users || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  // Filter and get suggestions based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
    );
  }, [searchQuery, users]);

  // Get all users if no search query
  const displayedUsers = searchQuery.trim() ? filteredUsers : users;

  const handleSelectSuggestion = (user: UserManagementData) => {
    setSearchQuery(user.fullName);
    setShowSuggestions(false);
  };

  const handleDeletePress = (user: UserManagementData) => {
    setSelectedUser(user);
    setDeletionReason("");
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser || !deletionReason.trim()) {
      Alert.alert("Error", "Please provide a reason for deletion");
      return;
    }

    try {
      setDeleting(true);
      await AdminApiService.deleteUserAccount(selectedUser.id, deletionReason);

      Alert.alert(
        "Success",
        `Account for ${selectedUser.fullName} has been deleted.\nNotification email sent to ${selectedUser.phone}.`,
        [
          {
            text: "OK",
            onPress: () => {
              setDeleteModalVisible(false);
              setSelectedUser(null);
              setDeletionReason("");
              setSearchQuery("");
              loadUsers();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to delete user account"
      );
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return colors.error;
      case "GARAGE_OWNER":
        return colors.success;
      case "SUPPLIER":
        return colors.info;
      default:
        return colors.primary;
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    
    return parts.map((part, index) => (
      <Text
        key={index}
        style={
          regex.test(part)
            ? { backgroundColor: colors.warning + "40", fontWeight: "600" }
            : {}
        }
      >
        {part}
      </Text>
    ));
  };

  const SuggestionItem = ({ user }: { user: UserManagementData }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        { borderBottomColor: colors.border },
      ]}
      onPress={() => handleSelectSuggestion(user)}
    >
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionName, { color: colors.text }]}>
          {highlightText(user.fullName, searchQuery)}
        </Text>
        <Text style={[styles.suggestionPhone, { color: colors.textSecondary }]}>
          {highlightText(user.phone, searchQuery)}
        </Text>
      </View>
      <View
        style={[
          styles.roleBadge,
          { backgroundColor: getRoleColor(user.role) + "20" },
        ]}
      >
        <Text
          style={[
            styles.roleBadgeText,
            { color: getRoleColor(user.role) },
          ]}
        >
          {user.role}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const UserCard = ({ user }: { user: UserManagementData }) => (
    <View
      style={[
        styles.userCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {highlightText(user.fullName, searchQuery)}
          </Text>
          <Text style={[styles.userPhone, { color: colors.textSecondary }]}>
            {highlightText(user.phone, searchQuery)}
          </Text>
        </View>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: getRoleColor(user.role) + "20" },
          ]}
        >
          <Text
            style={[styles.roleBadgeText, { color: getRoleColor(user.role) }]}
          >
            {user.role}
          </Text>
        </View>
      </View>

      <Text style={[styles.userDate, { color: colors.textSecondary }]}>
        Joined: {new Date(user.createdAt).toLocaleDateString()}
      </Text>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.warning + "20", borderColor: colors.warning },
          ]}
        >
          <Text style={[styles.actionButtonText, { color: colors.warning }]}>
            🔒 Suspend
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.error + "20", borderColor: colors.error },
          ]}
          onPress={() => handleDeletePress(user)}
        >
          <Text style={[styles.actionButtonText, { color: colors.error }]}>
            🗑️ Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.text }]}>
          Users Management
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Total users: {displayedUsers.length} {searchQuery && `(filtered from ${users.length})`}
        </Text>
      </View>

      {/* Search Bar with Autocomplete */}
      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.surface,
              borderColor: showSuggestions
                ? colors.primary
                : colors.border,
            },
          ]}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
              },
            ]}
            placeholder="Search by name or phone..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              // Delay to allow suggestion tap
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          {searchQuery && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setShowSuggestions(false);
              }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Suggestions Dropdown */}
        {showSuggestions && searchQuery.trim() && filteredUsers.length > 0 && (
          <View
            style={[
              styles.suggestionsDropdown,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <FlatList
              data={filteredUsers.slice(0, 5)} // Show max 5 suggestions
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <SuggestionItem user={item} />}
              scrollEnabled={false}
            />
            {filteredUsers.length > 5 && (
              <View style={styles.suggestionsFooter}>
                <Text
                  style={[
                    styles.suggestionsInfo,
                    { color: colors.textSecondary },
                  ]}
                >
                  +{filteredUsers.length - 5} more results...
                </Text>
              </View>
            )}
          </View>
        )}

        {/* No Results Message */}
        {showSuggestions &&
          searchQuery.trim() &&
          filteredUsers.length === 0 && (
            <View
              style={[
                styles.noResultsDropdown,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.noResultsText,
                  { color: colors.textSecondary },
                ]}
              >
                No users found matching "{searchQuery}"
              </Text>
            </View>
          )}
      </View>

      {/* Users List */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <UserCard user={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery
                  ? `No users found for "${searchQuery}"`
                  : "No users available"}
              </Text>
            </View>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View
          style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.surface },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.error }]}>
                Delete Account
              </Text>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleting}
              >
                <Text style={[styles.closeButton, { color: colors.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View
                style={[
                  styles.warningBox,
                  { backgroundColor: colors.error + "10" },
                ]}
              >
                <Text style={[styles.warningText, { color: colors.error }]}>
                  ⚠️ This action cannot be undone!
                </Text>
              </View>

              <Text style={[styles.infoText, { color: colors.text }]}>
                You are about to delete the account for:
              </Text>

              <View
                style={[
                  styles.userDetailsBox,
                  { backgroundColor: colors.background },
                ]}
              >
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Name:
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedUser?.fullName}
                </Text>

                <Text
                  style={[
                    styles.detailLabel,
                    { color: colors.textSecondary, marginTop: 8 },
                  ]}
                >
                  Phone:
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedUser?.phone}
                </Text>

                <Text
                  style={[
                    styles.detailLabel,
                    { color: colors.textSecondary, marginTop: 8 },
                  ]}
                >
                  Role:
                </Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {selectedUser?.role}
                </Text>
              </View>

              <Text
                style={[
                  styles.reasonLabel,
                  { color: colors.text, marginTop: 16 },
                ]}
              >
                Reason for Deletion:
              </Text>
              <Text
                style={[
                  styles.reasonHint,
                  { color: colors.textSecondary },
                ]}
              >
                This will be sent to the user's email
              </Text>

              <TextInput
                style={[
                  styles.reasonInput,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Ex: Violation of terms of service, Spam account, etc."
                placeholderTextColor={colors.textSecondary}
                value={deletionReason}
                onChangeText={setDeletionReason}
                multiline
                numberOfLines={4}
                editable={!deleting}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { backgroundColor: colors.textSecondary + "20" },
                ]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={deleting}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: colors.error }]}
                onPress={confirmDelete}
                disabled={deleting || !deletionReason.trim()}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  clearIcon: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
  },
  suggestionsDropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderRadius: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginHorizontal: 16,
    maxHeight: 250,
    marginTop: -8,
  },
  suggestionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  suggestionPhone: {
    fontSize: 12,
  },
  suggestionsFooter: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  suggestionsInfo: {
    fontSize: 12,
    fontStyle: "italic",
  },
  noResultsDropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderRadius: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginHorizontal: 16,
    marginTop: -8,
    paddingVertical: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  userCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  userDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 12,
    width: "90%",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "300",
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: "65%",
  },
  warningBox: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    marginBottom: 12,
  },
  userDetailsBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    marginTop: 2,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  reasonHint: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    height: 100,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
