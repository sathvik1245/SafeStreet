import { Image, useColorScheme } from 'react-native'
import React from 'react'

const ThemedLogo = ({ ...props }) => {

    // const colorScheme = useColorScheme()
    // const logo = colorScheme === 'dark' ? DarkLogo : LightLogo

    return (
        <Image {...props} resizeMode='cover'></Image>
    )
}

export default ThemedLogo