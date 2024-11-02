import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import logo from './assets/logo.png';

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    requestSmsPermission();
  }, []);

  const requestSmsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Permission',
            message: 'This app needs access to your SMS messages to track expenses.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('SMS permission granted');
        } else {
          console.log('SMS permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const readSmsMessages = () => {
    const filter = {
      box: '',
      minDate: 1554636310165,
      maxDate: Date.now(),
      bodyRegex: '(.*)',
      indexFrom: 0,
      // maxCount: 10,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.log('Failed with this error: ' + fail);
      },
      (count, smsList) => {
        const messages = JSON.parse(smsList);
        console.log('Messages: ', messages);
        setAllMessages(messages);
        const expenseMessages = messages.filter((message) => message.body.includes('spent') || message.body.includes('debited'));
        const extractedExpenses = expenseMessages.map((message) => {
          const amountMatch = message.body.match(/(\d+(\.\d{1,2})?)/);
          const amount = amountMatch ? amountMatch[0] : 'N/A';
          const date = new Date(message.date).toLocaleDateString();
          const sourceMatch = message.body.match(/(UPI|bank|account|acc|via|using|at)\s(\w+)/i);
          const source = sourceMatch ? sourceMatch[2] : 'Unknown';
          const categoryMatch = message.body.match(/(spent|debited)\s(\d+(\.\d{1,2})?)\s(at|for)\s(\w+)/i);
          const category = categoryMatch ? categoryMatch[5] : 'General';
          const paymentMode = message.body.includes('UPI') ? 'UPI' : 'Other';
          return {
            id: message._id,
            sender: message.address,
            amount,
            description: message.body,
            date,
            source,
            category,
            paymentMode,
          };
        });
        setExpenses(extractedExpenses);
        setShowLogo(false);
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
        {showLogo && <Image source={logo} style={styles.logo} />}
        {!showLogo && showExpenses && (
          expenses.length > 0 ? (
            <FlatList
              data={expenses}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <Text style={styles.itemText}><Text style={styles.boldText}>Sender:</Text> {item.sender}</Text>
                  <Text style={styles.itemText}><Text style={styles.boldText}>Amount:</Text> {item.amount}</Text>
                  <Text style={styles.itemText}><Text style={styles.boldText}>Date:</Text> {item.date}</Text>
                  <Text style={styles.itemText}><Text style={styles.boldText}>Source:</Text> {item.source}</Text>
                  <Text style={styles.itemText}><Text style={styles.boldText}>Category:</Text> {item.category}</Text>
                  <Text style={styles.itemText}><Text style={styles.boldText}>Payment Mode:</Text> {item.paymentMode}</Text>
                  <Text style={styles.itemText}><Text style={styles.boldText}>Description:</Text> {item.description}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noMessageText}>No messages found</Text>
          )
        )}
        {!showLogo && !showExpenses && (
          allMessages.length > 0 ? (
            <FlatList
              data={allMessages}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <View style={styles.itemContainer}>
                  <Text style={styles.itemText}><Text style={styles.boldText}>Sender:</Text> {item.address}</Text>
                  <Text style={styles.itemText}><Text style={styles.boldText}>Date:</Text> {new Date(item.date).toLocaleDateString()}</Text>
                  <Text style={styles.itemText}><Text style={styles.boldText}>Message:</Text> {item.body}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noMessageText}>No messages found</Text>
          )
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button1} onPress={() => { readSmsMessages(); setShowExpenses(true); }}>
          <Text style={styles.buttonText}>View All Expenses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { readSmsMessages(); setShowExpenses(false); }}>
          <Text style={styles.buttonText}>View All Messages</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  buttonContainer: {
    padding: 20,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 5,
  },
  button1: {
    backgroundColor: '#C5393A',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  noMessageText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default App;