import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  prescription?: any;
};

export default function PrescriptionCard({ prescription }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Prescription</Text>
      <Text>
        {prescription
          ? JSON.stringify(prescription, null, 2)
          : 'No prescription data'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f2f2f2',
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
});
