import React, { createContext, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppNotification, Appointment, CartItem, Garage, SparePart, Review } from "../types/models";
import SupplierApiService from "../services/SupplierApiService";

interface CartEntry {
  part: SparePart;
  quantity: number;
  subtotal: number;
}

interface ShopContextValue {
  garages: Garage[];
  suppliers: Record<string, string>;
  spareParts: SparePart[];
  selectedGarageId: string | null;
  selectedGarage: Garage | null;
  compatibleParts: SparePart[];
  cartItems: CartItem[];
  cartEntries: CartEntry[];
  cartTotal: number;
  appointments: Appointment[];
  reviews: Review[];
  notifications: AppNotification[];
  selectGarage: (garageId: string) => void;
  addToCart: (partId: string) => void;
  removeFromCart: (partId: string) => void;
  clearCart: () => void;
  bookAppointment: (payload: Omit<Appointment, "id" | "status">) => Promise<Appointment>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  addReview: (payload: Omit<Review, "id">) => void;
  confirmAppointment: (appointmentId: string, managerName?: string) => Promise<void>;
  createGarage: (ownerId: string, garage: Partial<Garage>) => Promise<Garage>;
  updateGarage: (garageId: string, updates: Partial<Garage>) => Promise<void>;
  setSpareParts: (parts: SparePart[]) => void;
}

export const ShopContext = createContext<ShopContextValue | undefined>(undefined);

const SHOP_STATE_STORAGE_KEY = "@wmt/shop-state";

interface StoredShopState {
  garages: Garage[];
  selectedGarageId: string | null;
  cartItems: CartItem[];
  appointments: Appointment[];
  reviews: Review[];
  notifications: AppNotification[];
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [garagesList, setGaragesList] = useState<Garage[]>([]);
  const [sparePartsList, setSparePartsList] = useState<SparePart[]>([]);
  const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  React.useEffect(() => {
    const hydrateShopState = async () => {
      try {
        const stored = await AsyncStorage.getItem(SHOP_STATE_STORAGE_KEY);
        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored) as Partial<StoredShopState>;
        if (parsed && typeof parsed === "object") {
          if (Array.isArray(parsed.garages)) {
            setGaragesList(parsed.garages);
          }
          setSelectedGarageId(parsed.selectedGarageId ?? null);
          setCartItems(parsed.cartItems ?? []);
          setAppointments(parsed.appointments ?? []);
          setReviews(parsed.reviews ?? []);
          setNotifications(parsed.notifications ?? []);
        }
      } catch (error) {
        console.warn("Failed to hydrate shop state:", error);
      }
    };

    void hydrateShopState();
  }, []);

  // Fetch real spare parts from API
  React.useEffect(() => {
    const fetchSpareParts = async () => {
      try {
        const parts = await SupplierApiService.getAllSpareParts();
        if (Array.isArray(parts)) {
          setSparePartsList(parts);
        }
      } catch (error) {
        console.log("Spare parts API unavailable, using cached data");
      }
    };

    void fetchSpareParts();
  }, []);

  // Fetch garages from API
  React.useEffect(() => {
    const fetchGarages = async () => {
      try {
        const { garageApiService } = require("../services/GarageApiService");
        if (garageApiService) {
          const fetchedGarages = await garageApiService.getAllGarages();
          if (Array.isArray(fetchedGarages)) {
            setGaragesList(fetchedGarages);
            console.log(`Successfully fetched ${fetchedGarages.length} garages from database`);
          }
        }
      } catch (error) {
        console.log("Garages API unavailable, using cached data");
      }
    };

    void fetchGarages();
  }, []);

  React.useEffect(() => {
    const persistShopState = async () => {
      const snapshot: StoredShopState = {
        garages: garagesList,
        selectedGarageId,
        cartItems,
        appointments,
        reviews,
        notifications
      };

      try {
        await AsyncStorage.setItem(SHOP_STATE_STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        // Ignore persistence failures to keep app usable.
      }
    };

    void persistShopState();
  }, [garagesList, selectedGarageId, cartItems, appointments, reviews, notifications]);

  const selectGarage = (garageId: string) => {
    setSelectedGarageId(garageId);
    setCartItems([]);
  };

  const addToCart = (partId: string) => {
    const part = sparePartsList.find((item) => item.id === partId);

    if (!part) {
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.partId === partId);

      if (!existing) {
        return [...prev, { partId, quantity: 1 }];
      }

      const nextQty = Math.min(existing.quantity + 1, part.quantity);

      return prev.map((item) =>
        item.partId === partId ? { ...item, quantity: nextQty } : item
      );
    });
  };

  const removeFromCart = (partId: string) => {
    setCartItems((prev) => prev.filter((item) => item.partId !== partId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const bookAppointment = async (payload: Omit<Appointment, "id" | "status">) => {
    try {
      const { appointmentApiService } = require("../services/AppointmentApiService");
      const newAppointment = await appointmentApiService.bookAppointment(payload);
      
      setAppointments((prev) => [newAppointment, ...prev]);
      return newAppointment;
    } catch (error) {
      console.error("Failed to book appointment in database:", error);
      throw error;
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { appointmentApiService } = require("../services/AppointmentApiService");
      await appointmentApiService.updateAppointmentStatus(appointmentId, "CANCELLED");
      
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status: "CANCELLED" } : appointment
        )
      );
    } catch (error) {
      console.error("Failed to cancel appointment in database:", error);
      throw error;
    }
  };

  const confirmAppointment = async (appointmentId: string, managerName?: string) => {
    try {
      const { appointmentApiService } = require("../services/AppointmentApiService");
      await appointmentApiService.updateAppointmentStatus(appointmentId, "CONFIRMED");
      
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status: "CONFIRMED" } : appointment
        )
      );
    } catch (error) {
      console.error("Failed to confirm appointment in database:", error);
      throw error;
    }
  };

  const addReview = (payload: Omit<Review, "id">) => {
    setReviews((prev) => [
      {
        id: `review-${Date.now()}`,
        ...payload
      },
      ...prev
    ]);
  };

  const createGarage = async (ownerId: string, garage: Partial<Garage>): Promise<Garage> => {
    try {
      const { garageApiService } = require("../services/GarageApiService");
      const newGarage = await garageApiService.createGarage({
        ...garage,
        ownerId,
        id: "", // Backend will generate or we use temporary
        services: garage.services || [],
        mapQuery: garage.mapQuery || "",
        openingHours: garage.openingHours || "09:00 - 18:00"
      } as Garage);
      
      setGaragesList((prev) => [...prev, newGarage]);
      return newGarage;
    } catch (error) {
      console.error("Failed to create garage in database:", error);
      // Fallback to local only if needed, but better to throw
      throw error;
    }
  };

  const updateGarage = async (garageId: string, updates: Partial<Garage>) => {
    try {
      const { garageApiService } = require("../services/GarageApiService");
      const updatedGarage = await garageApiService.updateGarage(garageId, updates);
      
      setGaragesList((prev) =>
        prev.map((garage) =>
          garage.id === garageId ? updatedGarage : garage
        )
      );
    } catch (error) {
      console.error("Failed to update garage in database:", error);
      throw error;
    }
  };

  const selectedGarage = useMemo(
    () => garagesList.find((garage) => garage.id === selectedGarageId) ?? null,
    [selectedGarageId, garagesList]
  );

  const compatibleParts = useMemo(() => {
    if (!selectedGarageId) {
      return [];
    }

    return sparePartsList.filter((part) =>
      (part.garageCompatibleIds ?? []).includes(selectedGarageId)
    );
  }, [selectedGarageId, sparePartsList]);

  const cartEntries = useMemo(() => {
    return cartItems
      .map((item) => {
        const part = sparePartsList.find((value) => value.id === item.partId);

        if (!part) {
          return null;
        }

        return {
          part,
          quantity: item.quantity,
          subtotal: item.quantity * part.price
        };
      })
      .filter((entry): entry is CartEntry => !!entry);
  }, [cartItems]);

  const cartTotal = useMemo(
    () => cartEntries.reduce((sum, entry) => sum + entry.subtotal, 0),
    [cartEntries]
  );

  const value = useMemo(
    () => ({
      garages: garagesList,
      suppliers: {},
      spareParts: sparePartsList,
      selectedGarageId,
      selectedGarage,
      compatibleParts,
      cartItems,
      cartEntries,
      cartTotal,
      appointments,
      reviews,
      notifications,
      selectGarage,
      addToCart,
      removeFromCart,
      clearCart,
      bookAppointment,
      cancelAppointment,
      addReview,
      confirmAppointment,
      updateGarage,
      createGarage,
      setSpareParts: setSparePartsList
    }),
    [
      garagesList,
      sparePartsList,
      selectedGarageId,
      selectedGarage,
      compatibleParts,
      cartItems,
      cartEntries,
      cartTotal,
      appointments,
      reviews,
      notifications
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
