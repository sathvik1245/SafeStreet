import { useEffect } from 'react'
import { useUser } from '../../hooks/useUser'
import { useRouter } from 'expo-router'
import ThemedLoader from '../ThemedLoader'

const GuestOnly = ({ children }) => {
    const { user, authChecked } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (authChecked && user !== null) {
            router.replace('/profile')
        }
    }, [user, authChecked])

    if (!authChecked || user) {
        return (
            <ThemedLoader />
        )
    }
    
    return children
} 


export default GuestOnly