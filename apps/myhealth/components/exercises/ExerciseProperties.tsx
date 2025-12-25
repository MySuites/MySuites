import React from 'react';
import { View, Text } from 'react-native';

interface ExercisePropertiesProps {
    properties: string[] | null;
    rawType: string | string[] | null;
    themeColors: any;
    cardBackground: string;
    toggleBackground: string;
}

export const ExerciseProperties = ({
    properties,
    rawType,
    themeColors,
    cardBackground,
    toggleBackground
}: ExercisePropertiesProps) => {

    return (
        <View style={{ 
            backgroundColor: cardBackground,
            borderRadius: 16, 
            padding: 16, 
            marginBottom: 24 
        }}>
            <Text className="text-base leading-6 font-semibold" style={{ marginBottom: 12, color: themeColors.text }}>Properties</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {Array.isArray(properties) && properties.length > 0 ? (
                    properties.map((prop: string, index: number) => (
                        <View key={index} style={{ 
                            backgroundColor: toggleBackground, 
                            paddingHorizontal: 12, 
                            paddingVertical: 6, 
                            borderRadius: 16 
                        }}>
                            <Text style={{ fontSize: 13, color: themeColors.text }}>{String(prop)}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={{ fontStyle: 'italic', color: themeColors.text, opacity: 0.6 }}>No specific properties</Text>
                )}
                 {!properties && rawType && (
                     <View style={{ 
                        backgroundColor: toggleBackground, 
                        paddingHorizontal: 12, 
                        paddingVertical: 6, 
                        borderRadius: 16 
                    }}>
                        <Text style={{ fontSize: 13, color: themeColors.text }}>{String(rawType)}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};
