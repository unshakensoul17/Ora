import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import InventoryListScreen from './src/screens/inventory/InventoryListScreen';
import AddItemScreen from './src/screens/inventory/AddItemScreen';
import CalendarScreen from './src/screens/calendar/CalendarScreen';
import HoldsListScreen from './src/screens/bookings/HoldsListScreen';
import QRScannerScreen from './src/screens/scanner/QRScannerScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import LocationPickerScreen from './src/screens/profile/LocationPickerScreen';
import HelpScreen from './src/screens/support/HelpScreen';
import SupportScreen from './src/screens/support/SupportScreen';
import NotificationsScreen from './src/screens/notifications/NotificationsScreen';

// Icons
import {
    HomeIcon,
    InventoryIcon,
    CalendarIcon,
    HoldsIcon,
    ScannerIcon,
    ProfileIcon
} from './src/components/Icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

// Bottom Tabs
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#0B0F0D',
                    borderTopColor: '#1F2A23',
                    borderTopWidth: 1,
                    height: 70,
                    paddingBottom: 12,
                    paddingTop: 12,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarActiveTintColor: '#1DB954',
                tabBarInactiveTintColor: '#6B7280',
                headerStyle: {
                    backgroundColor: '#0B0F0D',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#1F2A23',
                },
                headerTintColor: '#1DB954',
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    title: 'Fashcycle Shop',
                    tabBarIcon: ({ color, focused }) => <HomeIcon color={color} size={24} focused={focused} />
                }}
            />
            <Tab.Screen
                name="Inventory"
                component={InventoryListScreen}
                options={{
                    tabBarLabel: 'Inventory',
                    tabBarIcon: ({ color, focused }) => <InventoryIcon color={color} size={24} focused={focused} />
                }}
            />
            <Tab.Screen
                name="Scanner"
                component={QRScannerScreen}
                options={{
                    tabBarLabel: 'Scan',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={{
                            width: 56,
                            height: 56,
                            borderRadius: 28,
                            backgroundColor: focused ? '#1DB954' : '#0F2A1D',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: -20,
                            borderWidth: 3,
                            borderColor: '#0B0F0D',
                        }}>
                            <ScannerIcon color={focused ? '#FFFFFF' : '#1DB954'} size={28} focused={focused} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{
                    tabBarLabel: 'Calendar',
                    tabBarIcon: ({ color, focused }) => <CalendarIcon color={color} size={24} focused={focused} />
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color, focused }) => <ProfileIcon color={color} size={24} focused={focused} />
                }}
            />
        </Tab.Navigator>
    );
}

// Loading screen while checking auth
function LoadingScreen() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
        </View>
    );
}

function AppNavigator() {
    const { isAuthenticated, isInitialized, initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, []);

    if (!isInitialized) {
        return <LoadingScreen />;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#0B0F0D',
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: '#1DB954',
                animation: 'slide_from_right',
                presentation: 'card',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                animationDuration: 300,
            }}
        >
            {isAuthenticated ? (
                <>
                    <Stack.Screen
                        name="Main"
                        component={MainTabs}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="AddItem"
                        component={AddItemScreen}
                        options={{ title: 'Add Item' }}
                    />
                    <Stack.Screen
                        name="EditProfile"
                        component={EditProfileScreen}
                        options={{ title: 'Edit Profile' }}
                    />
                    <Stack.Screen
                        name="LocationPicker"
                        component={LocationPickerScreen}
                        options={{ title: 'Set Shop Location' }}
                    />
                    <Stack.Screen
                        name="Holds"
                        component={HoldsListScreen}
                        options={{ title: 'Pending Holds' }}
                    />
                    <Stack.Screen
                        name="Help"
                        component={HelpScreen}
                        options={{ title: 'Help & FAQ' }}
                    />
                    <Stack.Screen
                        name="Support"
                        component={SupportScreen}
                        options={{ title: 'Contact Support' }}
                    />
                    <Stack.Screen
                        name="Notifications"
                        component={NotificationsScreen}
                        options={{ title: 'Notifications' }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{
                            title: 'Register',
                            headerStyle: { backgroundColor: '#022b1e' },
                            headerTintColor: '#D4AF37',
                        }}
                    />
                    <Stack.Screen
                        name="ForgotPassword"
                        component={ForgotPasswordScreen}
                        options={{
                            title: 'Reset Password',
                            headerStyle: { backgroundColor: '#022b1e' },
                            headerTintColor: '#D4AF37',
                        }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
                <StatusBar style="light" />
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
