// ... (keep your imports and PrescriptionCard component as they are)

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPrescription, setDeletingPrescription] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const members = await getFamilyMembers();
      const foundMember = members.find((m) => m.id === id);
      
      if (foundMember) {
        setMember(foundMember);
      } else {
        Alert.alert('Error', 'Family member not found');
        router.back();
        return;
      }

      const allPrescriptions = await getPrescriptions(id);
      setPrescriptions(allPrescriptions);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const addPrescription = (type: 'eyeglass' | 'contact') => {
    router.push({
      pathname: '/add-rx',
      params: { memberId: id, rxType: type }
    });
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (deletingPrescription) return;
    
    Alert.alert(
      'Delete Prescription',
      'Are you sure you want to delete this? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingPrescription(true);
            try {
              await deletePrescriptionService(prescriptionId);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete prescription');
            } finally {
              setDeletingPrescription(false);
            }
          },
        },
      ]
    );
  };

  // CLEANED UP RENDER FUNCTION
  const renderItem = ({ item }: { item: Prescription }) => (
    <PrescriptionCard
      item={item}
      onPress={() =>
        router.push({
          pathname: '/prescription/[id]',
          params: { id: item.id, memberId: id },
        })
      }
      onDelete={() => handleDeletePrescription(item.id)}
    />
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color="#4facfe" />
      <Text style={styles.emptyTitle}>No Prescriptions Yet</Text>
      <Text style={styles.emptySubtext}>
        Tap the buttons below to add eyeglass or contact lens prescriptions
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: member?.name || 'Prescriptions' }} />

      {member && (
        <View style={styles.memberHeader}>
          <View style={styles.memberAvatar}>
            <Ionicons name="person" size={36} color="#4facfe" />
          </View>
          <View style={styles.memberDetails}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberStats}>
              {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={[
          styles.listContainer,
          prescriptions.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={!loading ? EmptyState : null}
        columnWrapperStyle={prescriptions.length > 0 ? styles.row : undefined}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.addButton, styles.eyeglassButton]}
          onPress={() => addPrescription('eyeglass')}
        >
          <Ionicons name="glasses-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Eyeglass Rx</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, styles.contactButton]}
          onPress={() => addPrescription('contact')}
        >
          <Ionicons name="eye-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Contact Rx</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Tap trash icon or long press to delete</Text>
    </SafeAreaView>
  );
}