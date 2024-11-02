import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const App = () => {
  const [expenses, setExpenses] = useState([]);

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
      box: '', // empty string to include both inbox and sent
      minDate: 1554636310165, // timestamp (in milliseconds since UNIX epoch)
      maxDate: Date.now(), // timestamp (in milliseconds since UNIX epoch)
      bodyRegex: '(.*)',
      indexFrom: 0,
      maxCount: 10,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.log('Failed with this error: ' + fail);
      },
      (count, smsList) => {
        const messages = JSON.parse(smsList);
        const expenseMessages = messages.filter((message) =>
          message.body.includes('spent') || message.body.includes('debited')
        );
        const extractedExpenses = expenseMessages.map((message) => {
          const amountMatch = message.body.match(/(\d+(\.\d{1,2})?)/);
          const amount = amountMatch ? amountMatch[0] : 'N/A';
          const date = new Date(message.date).toLocaleDateString();
          return {
            id: message._id,
            amount,
            description: message.body,
            date,
          };
        });
        setExpenses(extractedExpenses);
      },
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="View All Expenses" onPress={readSmsMessages} />
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>Amount: {item.amount}</Text>
            <Text>Description: {item.description}</Text>
            <Text>Date: {item.date}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default App;