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
  bookAppointment: (payload: Omit<Appointment, "id" | "status">) => void;
  cancelAppointment: (appointmentId: string) => void;
  addReview: (payload: Omit<Review, "id">) => void;
  confirmAppointment: (appointmentId: string, managerName?: string) => void;
  createGarage: (ownerId: string, garage: Partial<Garage>) => Garage;
  updateGarage: (garageId: string, updates: Partial<Garage>) => void;
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
        if (Array.isArray(parsed.garages)) {
          setGaragesList(parsed.garages);
        } else {
          setGaragesList([]);
        }
        setSelectedGarageId(parsed.selectedGarageId ?? null);
        setCartItems(parsed.cartItems ?? []);
        setAppointments(parsed.appointments ?? []);
        setReviews(parsed.reviews ?? []);
        setNotifications(parsed.notifications ?? []);
      } catch {
        // Ignore invalid cached shop state and continue with defaults.
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
        // If API call fails, keep using mock data
        console.log("Using mock spare parts (API unavailable)");
      }
    };

    void fetchSpareParts();
  }, []);

  // Fetch garages from API
  React.useEffect(() => {
    const fetchGarages = async () => {
      try {
        // Dynamic import to avoid circular dependency issues if any
        const { garageApiService } = require("../services/GarageApiService");
        const fetchedGarages = await garageApiService.getAllGarages();
        if (Array.isArray(fetchedGarages)) {
          setGaragesList(fetchedGarages);
        }
      } catch (error) {
        console.log("Using mock garages (API unavailable)");
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

  const bookAppointment = (payload: Omit<Appointment, "id" | "status">) => {
    setAppointments((prev) => {
      const slotTaken = prev.some(
        (appointment) =>
          appointment.garageId === payload.garageId &&
          appointment.appointmentDate === payload.appointmentDate &&
          appointment.appointmentTime === payload.appointmentTime
      );

      if (slotTaken) {
        throw new Error("That time slot is already booked for this garage.");
      }

      return [
        {
          id: `appt-${Date.now()}`,
          status: "PENDING",
          ...payload
        },
        ...prev
      ];
    });
  };

  const cancelAppointment = (appointmentId: string) => {
    let notificationToAdd: AppNotification | null = null;

    setAppointments((prev) =>
      prev.map((appointment) => {
        if (appointment.id !== appointmentId) {
          return appointment;
        }

        if (appointment.status === "CANCELLED") {
          return appointment;
        }

        notificationToAdd = {
          id: `notif-${Date.now()}`,
          userId: appointment.garageOwnerId, // Notify the manager
          title: "Appointment Cancelled",
          message: `${appointment.customerName} cancelled their ${appointment.service} booking at ${appointment.garageName} scheduled for ${appointment.appointmentDate}.`,
          createdAt: new Date().toISOString(),
          read: false,
          appointmentId: appointment.id
        };

        return {
          ...appointment,
          status: "CANCELLED"
        };
      })
    );

    if (notificationToAdd) {
      setNotifications((prev) => [notificationToAdd as AppNotification, ...prev]);
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

  const confirmAppointment = (appointmentId: string, managerName?: string) => {
    let notificationToAdd: AppNotification | null = null;

    setAppointments((prev) =>
      prev.map((appointment) => {
        if (appointment.id !== appointmentId) {
          return appointment;
        }

        if (appointment.status === "CONFIRMED") {
          return appointment;
        }

        notificationToAdd = {
          id: `notif-${Date.now()}`,
          userId: appointment.customerId,
          title: "Appointment Confirmed",
          message: `${managerName ?? "Garage manager"} confirmed your ${appointment.service} booking at ${appointment.garageName}.`,
          createdAt: new Date().toISOString(),
          read: false,
          appointmentId: appointment.id
        };

        return {
          ...appointment,
          status: "CONFIRMED"
        };
      })
    );

    if (notificationToAdd) {
      setNotifications((prev) => [notificationToAdd as AppNotification, ...prev]);
    }
  };

  const createGarage = (ownerId: string, garage: Partial<Garage>): Garage => {
    const newGarage: Garage = {
      id: `garage-${Date.now()}`,
      ownerId,
      name: garage.name || "My Garage",
      address: garage.address || "",
      city: garage.city || "",
      openingHours: garage.openingHours || "09:00 - 18:00",
      description: garage.description || "",
      services: garage.services || [],
      mapQuery: garage.mapQuery || ""
    };
    setGaragesList((prev) => [...prev, newGarage]);
    return newGarage;
  };

  const updateGarage = (garageId: string, updates: Partial<Garage>) => {
    setGaragesList((prev) =>
      prev.map((garage) =>
        garage.id === garageId ? { ...garage, ...updates } : garage
      )
    );
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
