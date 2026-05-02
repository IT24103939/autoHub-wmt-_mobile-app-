import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { LandingPage } from "../screens/auth/LandingPage";
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen";
import { GarageListScreen } from "../screens/garages/GarageListScreen";
import { GarageDetailsScreen } from "../screens/garages/GarageDetailsScreen";
import { AppointmentBookingScreen } from "../screens/garages/AppointmentBookingScreen";
import { SparePartsListScreen } from "../screens/spareParts/SparePartsListScreen";
import { SparePartDetailsScreen } from "../screens/spareParts/SparePartDetailsScreen";
import { CartScreen } from "../screens/cart/CartScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { PaymentMethodsScreen } from "../screens/profile/PaymentMethodsScreen";
import CustomerPaymentsScreen from "../screens/payments/CustomerPaymentsScreen";
import { OwnerDashboardScreen } from "../screens/owner/OwnerDashboardScreen";
import { OwnerAccountScreen } from "../screens/owner/OwnerAccountScreen";
import { GarageEditScreen } from "../screens/owner/GarageEditScreen";
import { SupplierDashboardScreen } from "../screens/supplier/SupplierDashboardScreen";
import { SupplierAccountScreen } from "../screens/supplier/SupplierAccountScreen";
import { AddSparePartScreen } from "../screens/supplier/AddSparePartScreen";
import { SupplierInventoryScreen } from "../screens/supplier/SupplierInventoryScreen";
import { EditSparePartScreen } from "../screens/supplier/EditSparePartScreen";
import { UserHomeScreen } from "../screens/user/UserHomeScreen";
import { BrowseScreen } from "../screens/browse/BrowseScreen";
import { AdminDashboardScreen } from "../screens/admin/AdminDashboardScreen";
import { AdminAccountScreen } from "../screens/admin/AdminAccountScreen";
import { AdminUsersManagementScreen } from "../screens/admin/AdminUsersManagementScreen";
import { AdminGaragesScreen } from "../screens/admin/AdminGaragesScreen";
import { AdminBookingsScreen } from "../screens/admin/AdminBookingsScreen";
import { AdminSuppliersScreen } from "../screens/admin/AdminSuppliersScreen";
import { SettingsScreen } from "../screens/profile/SettingsScreen";
import { NotificationsCenterScreen } from "../screens/profile/NotificationsCenterScreen";
import { MyBookingsScreen } from "../screens/garages/MyBookingsScreen";
import { CheckoutScreen } from "../screens/payments/CheckoutScreen";
import { OrderHistoryScreen } from "../screens/payments/OrderHistoryScreen";
import { OrderTrackingScreen } from "../screens/payments/OrderTrackingScreen";
import { SellerProfileScreen } from "../screens/spareParts/SellerProfileScreen";
import { PartsSearchScreen } from "../screens/spareParts/PartsSearchScreen";
import { useAuth } from "../hooks/useAuth";
import { useAppTheme } from "../hooks/useAppTheme";
import { Role } from "../types/models";

export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: { phone?: string } | undefined;
  UserHome: undefined;
  OwnerHome: undefined;
  OwnerAccount: undefined;
  GarageEdit: undefined;
  SupplierHome: undefined;
  SupplierAccount: undefined;
  AddSparePart: undefined;
  SupplierInventory: undefined;
  EditSparePart: { partId: string };
  AdminHome: undefined;
  AdminAccount: undefined;
  AdminUsers: undefined;
  AdminGarages: undefined;
  AdminBookings: undefined;
  AdminSuppliers: undefined;
  Garages: undefined;
  GarageDetails: { garageId: string };
  AppointmentBooking: { garageId: string };
  Browse: undefined;
  SpareParts: undefined;
  SparePartDetails: { partId: string };
  Cart: undefined;
  Profile: undefined;
  PaymentMethods: undefined;
  CustomerPayments: undefined;
  Settings: undefined;
  NotificationsCenter: undefined;
  MyBookings: undefined;
  Checkout: undefined;
  OrderHistory: undefined;
  OrderTracking: { orderId: string };
  SellerProfile: { sellerId?: string };
  PartsSearch: undefined;
};

export type TabNavigatorParams = {
  HomeTab: undefined;
  BrowseTab: undefined;
  CartTab: undefined;
  AccountTab: undefined;
  UsersTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabNavigatorParams>();

function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingPage} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function UserHomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UserHome"
        component={UserHomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Garages" component={GarageListScreen} options={{ title: "Garages" }} />
      <Stack.Screen name="GarageDetails" component={GarageDetailsScreen} />
      <Stack.Screen
        name="AppointmentBooking"
        component={AppointmentBookingScreen}
        options={{ title: "Book Appointment" }}
      />
      <Stack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: "My Bookings" }}
      />
      <Stack.Screen
        name="SpareParts"
        component={SparePartsListScreen}
        options={{ title: "Spare Parts" }}
      />
      <Stack.Screen name="SparePartDetails" component={SparePartDetailsScreen} />
      <Stack.Screen name="PartsSearch" component={PartsSearchScreen} options={{ title: "Search Parts" }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: "Seller Profile" }} />
    </Stack.Navigator>
  );
}

function BrowseStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Browse"
        component={BrowseScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Garages"
        component={GarageListScreen}
        options={{ title: "Garages" }}
      />
      <Stack.Screen
        name="GarageDetails"
        component={GarageDetailsScreen}
      />
      <Stack.Screen
        name="AppointmentBooking"
        component={AppointmentBookingScreen}
        options={{ title: "Book Appointment" }}
      />
      <Stack.Screen
        name="SpareParts"
        component={SparePartsListScreen}
        options={{ title: "Spare Parts" }}
      />
      <Stack.Screen name="SparePartDetails" component={SparePartDetailsScreen} />
      <Stack.Screen name="PartsSearch" component={PartsSearchScreen} options={{ title: "Search Parts" }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: "Seller Profile" }} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Shopping Cart" }} />
      <Stack.Screen name="SparePartDetails" component={SparePartDetailsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Checkout" }} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: "Order History" }} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: "Track Order" }} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
      <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} options={{ title: "Notifications" }} />
      <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: "My Bookings" }} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: "Payment Methods" }} />
      <Stack.Screen name="CustomerPayments" component={CustomerPaymentsScreen} options={{ title: "My Payments" }} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} options={{ title: "Seller Profile" }} />
    </Stack.Navigator>
  );
}

function UserTabNavigator() {
  const theme = useAppTheme();
  const colors = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: -4,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          borderBottomWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: 17,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={UserHomeStack}
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="BrowseTab"
        component={BrowseStack}
        options={{
          title: "Browse",
          tabBarLabel: "Browse",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStack}
        options={{
          title: "Cart",
          tabBarLabel: "Cart",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shopping" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountStack}
        options={{
          title: "Account",
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function OwnerHomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OwnerHome"
        component={OwnerDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GarageEdit"
        component={GarageEditScreen}
        options={{ title: "Edit Garage Details" }}
      />
    </Stack.Navigator>
  );
}

function OwnerAccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OwnerAccount"
        component={OwnerAccountScreen}
        options={{ title: "Account Settings" }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
      <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} options={{ title: "Notifications" }} />
    </Stack.Navigator>
  );
}

function OwnerProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Stack.Navigator>
  );
}

function OwnerTabNavigator() {
  const theme = useAppTheme();
  const colors = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: -4,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          borderBottomWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: 17,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={OwnerHomeStack}
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-box" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={OwnerAccountStack}
        options={{
          title: "Account",
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="BrowseTab"
        component={OwnerProfileStack}
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function SupplierHomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SupplierHome"
        component={SupplierDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddSparePart"
        component={AddSparePartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SupplierInventory"
        component={SupplierInventoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditSparePart"
        component={EditSparePartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SupplierAccount"
        component={SupplierAccountScreen}
        options={{ title: "Account Settings" }}
      />
    </Stack.Navigator>
  );
}

function SupplierAccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SupplierAccount"
        component={SupplierAccountScreen}
        options={{ title: "Account Settings" }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
      <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} options={{ title: "Notifications" }} />
    </Stack.Navigator>
  );
}

function SupplierProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Stack.Navigator>
  );
}

function SupplierTabNavigator() {
  const theme = useAppTheme();
  const colors = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: -4,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          borderBottomWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: 17,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={SupplierHomeStack}
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-box" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={SupplierAccountStack}
        options={{
          title: "Account",
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="BrowseTab"
        component={SupplierProfileStack}
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AdminHomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminHome"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} options={{ title: "Notifications" }} />
    </Stack.Navigator>
  );
}

function AdminUsersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminUsers"
        component={AdminUsersManagementScreen}
        options={{ title: "Users Management" }}
      />
      <Stack.Screen
        name="AdminGarages"
        component={AdminGaragesScreen}
        options={{ title: "Garages" }}
      />
      <Stack.Screen
        name="AdminBookings"
        component={AdminBookingsScreen}
        options={{ title: "Bookings" }}
      />
      <Stack.Screen
        name="AdminSuppliers"
        component={AdminSuppliersScreen}
        options={{ title: "Suppliers" }}
      />
    </Stack.Navigator>
  );
}

function AdminAccountStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminAccount"
        component={AdminAccountScreen}
        options={{ title: "Account Settings" }}
      />
      <Stack.Screen name="NotificationsCenter" component={NotificationsCenterScreen} options={{ title: "Notifications" }} />
    </Stack.Navigator>
  );
}

function AdminProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Stack.Navigator>
  );
}

function AdminTabNavigator() {
  const theme = useAppTheme();
  const colors = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: -4,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          borderBottomWidth: 0.5,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: colors.text,
          fontSize: 17,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={AdminHomeStack}
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-box" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="UsersTab"
        component={AdminUsersStack}
        options={{
          title: "Users",
          tabBarLabel: "Users",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AdminAccountStack}
        options={{
          title: "Account",
          tabBarLabel: "Account",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="BrowseTab"
        component={AdminProfileStack}
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

import { EmailSetupScreen } from "../screens/auth/EmailSetupScreen";

function RoleNavigator({ role }: { role: Role }) {
  if (role === "GARAGE_OWNER") {
    return <OwnerTabNavigator />;
  }

  if (role === "SUPPLIER") {
    return <SupplierTabNavigator />;
  }

  if (role === "ADMIN") {
    return <AdminTabNavigator />;
  }

  return <UserTabNavigator />;
}

export function AppNavigator() {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return <AuthNavigator />;
  }

  if (!currentUser.email) {
    return <EmailSetupScreen />;
  }

  return <RoleNavigator key={currentUser.role} role={currentUser.role} />;
}
