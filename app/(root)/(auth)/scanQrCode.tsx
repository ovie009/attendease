import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Flex from '@/components/Flex';
import { CameraView } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';

const ScanQrCode = () => {
    return (
        <Flex
            flex={1}
        >
            <CameraView
                style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onBarcodeScanned={({ data }) => console.log(data)}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                }}
            >
                {/* <Ionicons name="scan" size={400}  color="white" /> */}
                <Ionicons name="scan-outline" size={400} color="white" />
            </CameraView>
        </Flex>
    )
}

export default ScanQrCode

const styles = StyleSheet.create({})