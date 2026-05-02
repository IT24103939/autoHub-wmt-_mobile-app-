import React, { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useAppTheme } from "../../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "PartsSearch">;

interface Part {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  seller: string;
  inStock: boolean;
}

export function PartsSearchScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "price-low" | "price-high" | "rating">(
    "relevance"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);

  const allParts: Part[] = [
    {
      id: "1",
      name: "Engine Air Filter Premium",
      price: 299,
      rating: 4.7,
      reviews: 245,
      seller: "AutoParts Express",
      inStock: true
    },
    {
      id: "2",
      name: "Cabin Air Filter",
      price: 199,
      rating: 4.5,
      reviews: 128,
      seller: "QuickAuto",
      inStock: true
    },
    {
      id: "3",
      name: "Oil Filter Pro",
      price: 149,
      rating: 4.9,
      reviews: 456,
      seller: "AutoParts Express",
      inStock: true
    },
    {
      id: "4",
      name: "Spark Plugs Set (4pcs)",
      price: 499,
      rating: 4.6,
      reviews: 189,
      seller: "MotorHub",
      inStock: false
    },
    {
      id: "5",
      name: "Air Compressor",
      price: 1299,
      rating: 4.8,
      reviews: 67,
      seller: "ProTools",
      inStock: true
    }
  ];

  const filteredParts = allParts
    .filter((part) => {
      const matchesSearch =
        searchQuery === "" ||
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.seller.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = part.price >= priceRange[0] && part.price <= priceRange[1];
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const renderPartCard = ({ item }: { item: Part }) => (
    <TouchableOpacity
      style={[styles.partCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate("SparePartDetails", { partId: item.id })}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.accentSurface }]}>
        <MaterialCommunityIcons name="tools" size={32} color={colors.primary} />
        {!item.inStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.partInfo}>
        <Text style={[styles.partName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={12} color="#FFC107" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={[styles.reviewsText, { color: colors.mutedText }]}>
              ({item.reviews})
            </Text>
          </View>
        </View>

        <Text style={[styles.sellerName, { color: colors.mutedText }]}>By {item.seller}</Text>

        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.primary }]}>₹{item.price}</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="plus" size={16} color={colors.primaryText} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const SortOption = ({
    value,
    label
  }: {
    value: "relevance" | "price-low" | "price-high" | "rating";
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.sortOption,
        {
          backgroundColor: sortBy === value ? colors.primary : colors.card,
          borderColor: colors.border
        }
      ]}
      onPress={() => setSortBy(value)}
    >
      <Text
        style={[
          styles.sortOptionText,
          { color: sortBy === value ? colors.primaryText : colors.text }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.mutedText} />
        <TextInput
          placeholder="Search parts or sellers..."
          placeholderTextColor={colors.mutedText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchInput, { color: colors.text }]}
        />
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <MaterialCommunityIcons
            name="tune"
            size={20}
            color={showFilters ? colors.primary : colors.mutedText}
          />
        </TouchableOpacity>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View style={[styles.filterSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Sort By</Text>
          <View style={styles.sortOptions}>
            <SortOption value="relevance" label="Relevance" />
            <SortOption value="price-low" label="Price: Low to High" />
            <SortOption value="price-high" label="Price: High to Low" />
            <SortOption value="rating" label="Rating" />
          </View>

          <View style={[styles.divider, { borderBottomColor: colors.border }]} />

          <Text style={[styles.filterTitle, { color: colors.text }]}>Price Range</Text>
          <View style={styles.priceRangeContainer}>
            <Text style={[styles.priceLabel, { color: colors.mutedText }]}>
              ₹{priceRange[0]} - ₹{priceRange[1]}
            </Text>
            <View style={styles.priceSlider}>
              <TouchableOpacity
                style={[styles.priceInput, { borderColor: colors.border }]}
                onPress={() => setPriceRange([0, priceRange[1]])}
              >
                <Text style={[styles.priceInputText, { color: colors.text }]}>Min</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.priceInput, { borderColor: colors.border }]}
                onPress={() => setPriceRange([priceRange[0], 5000])}
              >
                <Text style={[styles.priceInputText, { color: colors.text }]}>Max</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.mutedText }]}>
          {filteredParts.length} results
        </Text>
      </View>

      {filteredParts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="package-open" size={48} color={colors.mutedText} />
          <Text style={[styles.emptyText, { color: colors.mutedText }]}>
            No parts found
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredParts}
          renderItem={renderPartCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14
  },
  filterSection: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
    gap: 12
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "700"
  },
  sortOptions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: "600"
  },
  divider: {
    borderBottomWidth: 1
  },
  priceRangeContainer: {
    gap: 8
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: "600"
  },
  priceSlider: {
    flexDirection: "row",
    gap: 8
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center"
  },
  priceInputText: {
    fontSize: 12,
    fontWeight: "600"
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  resultsCount: {
    fontSize: 12
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
    gap: 8
  },
  partCard: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    width: "48%"
  },
  imageContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },
  outOfStockBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center"
  },
  outOfStockText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center"
  },
  partInfo: {
    padding: 8
  },
  partName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6
  },
  metaRow: {
    marginBottom: 4
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "600"
  },
  reviewsText: {
    fontSize: 10
  },
  sellerName: {
    fontSize: 10,
    marginBottom: 6
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  price: {
    fontSize: 14,
    fontWeight: "700"
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 6
  }
});
