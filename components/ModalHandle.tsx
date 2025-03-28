// react native component
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../utilities/colors";

const ModalHandle = () => {
    // render ModalHandle component
    return (
        <View style={styles.modalHandleWrapper}>
            <TouchableOpacity style={styles.modalHandle}></TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    modalHandleWrapper: {
        height: 15,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center' ,   
    },
    modalHandle: {
        width: 96,
        height: 4,
        borderRadius: 30,
        backgroundColor: colors.secondary,

    },
})
 
export default ModalHandle;