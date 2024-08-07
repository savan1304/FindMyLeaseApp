
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Modal, TouchableOpacity, FlatList, Dimensions  } from 'react-native';
import MapHolder from '../Components/MapHolder';
import HouseListItem from '../Components/HouseListItem';
import helper from '../Config/Helper';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import MapHolder from '../Components/MapHolder';
import HouseListItem from '../Components/HouseListItem';
import { collection, onSnapshot, where, query } from 'firebase/firestore';
import { database } from '../Firebase/firebaseSetup';
import PressableItem from '../Components/PressableItem';



const Home = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    // const [filters, setFilters] = useState({
    //     type: 'all', // Initial type is 'all' (no filter)
    //     bedrooms: 'any', // Initial bedrooms is 'any'
    //     baths: 'any',
    //     price: 'any',
    // });
    const [filters, setFilters] = useState({
        bedrooms: { min: null, max: null },
        area: { min: null, max: null },
    });

    const [isModalVisible, setModalVisible] = useState(false);

    const houses = [
        { id: '1', name: 'House 1', bedrooms: 3, area: '120m²', price: '$300,000' },
        { id: '2', name: 'House 2', bedrooms: 4, area: '150m²', price: '$450,000' },
        { id: '3', name: 'House 3', bedrooms: 2, area: '100m²', price: '$250,000' },
    ];

    const filteredHouses = houses.filter(house => {
        const bedroomsWithinRange = (
            (filters.bedrooms.min === null || house.bedrooms >= filters.bedrooms.min) &&
            (filters.bedrooms.max === null || house.bedrooms <= filters.bedrooms.max)
        );
        const houseAreaNumber = parseInt(house.area.replace('m²', '').trim());
        const areaWithinRange = (
            (filters.area.min === null || houseAreaNumber >= filters.area.min) &&
            (filters.area.max === null || houseAreaNumber <= filters.area.max)
        );
        return bedroomsWithinRange && areaWithinRange;
    });

    const clearFilters = () => {
        setFilters({
            bedrooms: { min: null, max: null },
            area: { min: null, max: null },
        });
    };
    

    const handleHousePress = house => {
        navigation.navigate('HouseDetails', { house });
    };

    const [listings, setListings] = useState([])


    useEffect(() => {
        const unsubscribe = onSnapshot(query(
            collection(database, 'Listing')),
            (querySnapshot) => {
                let newArray = []
                if (!querySnapshot.empty) {
                    querySnapshot.forEach((docSnapShot) => {
                        console.log(docSnapShot.id)
                        newArray.push({ ...docSnapShot.data(), id: docSnapShot.id })
                    });
                }
                setListings(newArray);
            }, (e) => { console.log(e) })


        return () => unsubscribe()  // Detaching the listener when no longer listening to the changes in data
    }, [])

    function handlePressListing() {
        console.log("listing pressed from Home page")
    }

    function handleScheduleVisit(listing) {
        console.log("in handleScheduleVisit in home page with listing: ", listing)
        navigation.navigate('ScheduleVisit', { listing });
    }

    return (
        <View>
            <MapHolder />

            <FlatList
                data={filteredHouses}
                renderItem={({ item }) => (
                    <HouseListItem
                    house={item}
                    onPress={() => handleHousePress(item)}
                    />
                )}
                keyExtractor={item => item.id}
                style={styles.list}
                />
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(!isModalVisible)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Bedrooms</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => setFilters(prev => ({
                                    ...prev,
                                    bedrooms: { ...prev.bedrooms, min: value ? parseInt(value) : null }
                                }))}
                                value={filters.bedrooms.min ? filters.bedrooms.min.toString() : ''}
                                keyboardType="number-pad"
                                placeholder="Min"
                                placeholderTextColor={helper.color.placeholderTextColor}
                            />
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => setFilters(prev => ({
                                    ...prev,
                                    bedrooms: { ...prev.bedrooms, max: value ? parseInt(value) : null }
                                }))}
                                value={filters.bedrooms.max ? filters.bedrooms.max.toString() : ''}
                                keyboardType="number-pad"
                                placeholder="Max"
                                placeholderTextColor={helper.color.placeholderTextColor} 
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Area(m²)</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => setFilters(prev => ({
                                    ...prev,
                                    area: { ...prev.area, min: value ? parseInt(value) : null }
                                }))}
                                value={filters.area.min ? filters.area.min.toString() : ''}
                                keyboardType="number-pad"
                                placeholder="Min"
                                placeholderTextColor={helper.color.placeholderTextColor}
                            />
                            <TextInput
                                style={styles.input}
                                onChangeText={(value) => setFilters(prev => ({
                                    ...prev,
                                    area: { ...prev.area, max: value ? parseInt(value) : null }
                                }))}
                                value={filters.area.max ? filters.area.max.toString() : ''}
                                keyboardType="number-pad"
                                placeholder="Max"
                                placeholderTextColor={helper.color.placeholderTextColor}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setModalVisible(!isModalVisible)}
                            >
                                <Text style={styles.textStyle}>Hide Filters</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClear]}
                                onPress={clearFilters}
                            >
                                <Text style={styles.textStyle}>Clear Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
        // <View style={styles.container}>
        //     <Text style={styles.header}>Home Screen</Text>
        //     <TextInput
        //         style={styles.searchBar}
        //         placeholder="Search Location..."
        //         value={searchText}
        //         onChangeText={setSearchText}
        //     />

        /* <View style={styles.filterRow}>s
                <Picker
                    style={styles.picker}
                    selectedValue={filters.type}
                    onValueChange={(itemValue) => setFilters({ ...filters, type: itemValue })}
                >
                    <Picker.Item label="All" value="all" />
                    <Picker.Item label="Shared" value="shared" />
                    <Picker.Item label="Private" value="private" />
                </Picker>

                <Picker
                    style={styles.picker}
                    selectedValue={filters.bedrooms}
                    onValueChange={(itemValue) => setFilters({ ...filters, bedrooms: itemValue })}
                >
                    <Picker.Item label="Any Beds" value="any" />
                    <Picker.Item label="1 Bed" value="1" />
                    <Picker.Item label="2 Beds" value="2" />
                    <Picker.Item label="3 Beds" value="3" />
                    <Picker.Item label="3+ Beds" value="3+" />
                </Picker>

            </View>

            <View style={styles.filterRow}>

                <Picker
                    style={styles.picker}
                    selectedValue={filters.baths}
                    onValueChange={(itemValue) => setFilters({ ...filters, baths: itemValue })}
                >
                    <Picker.Item label="Any Baths" value="any" />
                    <Picker.Item label="1 Bath" value="1" />
                    <Picker.Item label="1.5 Baths" value="1.5" />
                    <Picker.Item label="2 Baths" value="2" />
                    <Picker.Item label="2.5 Baths" value="2.5" />
                    <Picker.Item label="3+ Baths" value="3+" />
                </Picker>

                <Picker
                    style={styles.picker}
                    selectedValue={filters.price}
                    onValueChange={(itemValue) => setFilters({ ...filters, price: itemValue })}
                >
                    <Picker.Item label="Any Price" value="any" />
                    <Picker.Item label="$0-500" value="0-500" />
                    <Picker.Item label="$500-1000" value="500-1000" />
                    <Picker.Item label="$1000-2000" value="1000-2000" />
                    <Picker.Item label="$2000-3000"
                        value="2000-3000" />
                    <Picker.Item label="$3000+" value="3000+" />
                </Picker>
            </View> */
        /* <Button title="Open Filters" onPress={() => setModalVisible(true)} /> */
        //     <MapHolder />
        //     <Modal
        //         animationType="slide"
        //         transparent={true}
        //         visible={isModalVisible}
        //         onRequestClose={() => setModalVisible(!isModalVisible)}
        //     >
        //         <View style={styles.centeredView}>
        //             <View style={styles.modalView}>
        //                 <TextInput
        //                     style={styles.input}
        //                     onChangeText={(value) => setFilters({ ...filters, bedrooms: parseInt(value) || 0 })}
        //                     value={filters.bedrooms.toString()}
        //                     keyboardType="number-pad"
        //                     placeholder="Bedrooms"
        //                 />
        //                 <TextInput
        //                     style={styles.input}
        //                     onChangeText={(value) => setFilters({ ...filters, area: parseInt(value) || 0 })}
        //                     value={filters.area.toString()}
        //                     keyboardType="number-pad"
        //                     placeholder="Area (m²)"
        //                 />
        //                 <TouchableOpacity
        //                     style={[styles.button, styles.buttonClose]}
        //                     onPress={() => setModalVisible(!isModalVisible)}
        //                 >
        //                     <Text style={styles.textStyle}>Hide Filters</Text>
        //                 </TouchableOpacity>
        //             </View>
        //         </View>
        //     </Modal>
        // </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
    },
    searchBar: {
        height: 40,
        width: screenWidth * 0.9,
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: 10,
        marginBottom: 20,
    },
    list: {
        width: '100%',
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        width: screenWidth * 0.8, 
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginRight: 10,
    },
    input: {
        width: '40%',
        height: 40,
        borderWidth: 1,
        padding: 10,
        borderColor: '#ddd',
        borderRadius: 10,
        marginRight: 10,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 10,
    },
    buttonClear: {
        backgroundColor: '#FF6347', 
    },

});


export default Home;
