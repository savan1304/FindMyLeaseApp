import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { database, auth } from '../Firebase/firebaseSetup';
import { deleteFromDB } from '../Firebase/firestoreHelper';
import { AuthContext } from '../Components/AuthContext';
import PressableItem from '../Components/PressableItem';

const Saved = ({ navigation }) => {
  const { user, userData } = useContext(AuthContext);
  const [savedHouses, setSavedHouses] = useState([]);

  useEffect(() => {
    console.log('Context user in Saved:', user);
    if (user) {
      const q = query(collection(database, `User/${user.uid}/saved`));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let houses = [];
        querySnapshot.forEach(doc => {
          houses.push({ ...doc.data(), id: doc.id });
        });
        setSavedHouses(houses);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleHousePress = (house) => {
    console.log('House selected:', house);
    navigation.navigate('HouseDetails', { house });
  };

  const handleDelete = async (houseId) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const collectionPath = `User/${user.uid}/saved`;
        await deleteFromDB(houseId, collectionPath);
        setSavedHouses(prevHouses => prevHouses.filter(house => house.id !== houseId));
        console.log('House deleted successfully');
      } catch (error) {
        console.error('Error deleting house:', error);
      }
    } else {
      console.log('No user is signed in');
    }
  };

  const confirmDelete = (houseId) => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this save listing?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => handleDelete(houseId),
          style: 'destructive',
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <View style={styles.container}>
        {savedHouses.length > 0 ? (
            <FlatList
                data={savedHouses}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer}>
                        <PressableItem onPress={() => handleHousePress(item)} style={styles.item}>
                            <Image source={{ uri: item.imageUri || 'https://via.placeholder.com/150' }} style={styles.image} />
                            <View style={styles.info}>
                                <Text style={styles.title}>{item.location}</Text>
                                <Text>{item.price}</Text>
                                <Text>{item.bed} Bed, {item.bath} Bath</Text>
                            </View>
                        </PressableItem>
                        <PressableItem onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </PressableItem>
                    </View>
                )}
                keyExtractor={item => item.id}
            />
        ) : (
            <Text>No saved listings found.</Text>
        )}
    </View>
);
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
  },
  header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
  },
  itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      backgroundColor: '#f9f9f9',
      padding: 10,
      borderRadius: 5,
  },
  item: {
      flex: 1, 
      flexDirection: 'row',
      alignItems: 'center',
  },
  image: {
      width: 100,
      height: 100,
      borderRadius: 10,
      marginRight: 10,
  },
  info: {
      flex: 1, 
  },
  title: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  deleteButton: {
      padding: 5,
      backgroundColor: '#FF6347',
      borderRadius: 5,
  },
  deleteButtonText: {
      color: '#fff',
      fontSize: 14,
      textAlign: 'center',
  },
});

export default Saved;
