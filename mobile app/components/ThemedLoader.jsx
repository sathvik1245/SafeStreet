import { ActivityIndicator, useColorScheme } from "react-native";
import { Colors } from '../constants/Colors';
import ThemedView from '../components/ThemedView'

const ThemedLoader = () => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <ThemedView style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <ActivityIndicator size='large' style={theme.text}/>
        </ThemedView>
    )
}

export default ThemedLoader