import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline } from 'react-native-svg';

interface IconProps {
    color: string;
    size?: number;
    focused?: boolean;
}

export const HomeIcon = ({ color, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
);

export const InventoryIcon = ({ color, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <Line x1="7" y1="7" x2="7.01" y2="7" />
    </Svg>
);

export const CalendarIcon = ({ color, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <Line x1="16" y1="2" x2="16" y2="6" />
        <Line x1="8" y1="2" x2="8" y2="6" />
        <Line x1="3" y1="10" x2="21" y2="10" />
    </Svg>
);

export const HoldsIcon = ({ color, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Polyline points="12 6 12 12 16 14" />
    </Svg>
);

export const ScannerIcon = ({ color, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <Path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <Path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <Path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <Rect x="7" y="7" width="10" height="10" rx="1" />
    </Svg>
);

export const ProfileIcon = ({ color, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <Circle cx="12" cy="7" r="4" />
    </Svg>
);

export const ReportsIcon = ({ color, size = 24, focused }: IconProps) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <Line x1="18" y1="20" x2="18" y2="10" />
        <Line x1="12" y1="20" x2="12" y2="4" />
        <Line x1="6" y1="20" x2="6" y2="14" />
    </Svg>
);
