/**
 * Appointment Booking Screen (Feature 23)
 * HealthWay Native Mobile Platform - Patient Portal
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { storageEngine } from '../../storage/storageEngine';
import { DISTRICT_FACILITIES, FacilityInfo } from '../../data/facilitiesData';
import { UpcomingAppointment, DEFAULT_PATIENT_PROFILE } from '../../data/patientData';

interface DoctorInfo {
  id: string;
  name: string;
  spec: string;
  qualification: string;
  experience: string;
  facilityId?: string;
}

const DOCTORS_DIRECTORY: DoctorInfo[] = [
  {
    id: 'DOC-01',
    name: 'Dr. Deshmukh',
    spec: 'General Medicine',
    qualification: 'MBBS, MD (Medicine)',
    experience: '12 years experience',
  },
  {
    id: 'DOC-02',
    name: 'Dr. Patil',
    spec: 'Obstetrics & Gynecology',
    qualification: 'MBBS, MS (OBGYN)',
    experience: '9 years experience',
  },
  {
    id: 'DOC-03',
    name: 'Dr. Kulkarni',
    spec: 'Pediatrics',
    qualification: 'MBBS, DCH, DNB (Pediatrics)',
    experience: '15 years experience',
  },
  {
    id: 'DOC-04',
    name: 'Dr. More',
    spec: 'Orthopedics',
    qualification: 'MBBS, MS (Orthopedics)',
    experience: '8 years experience',
  },
];

const TIME_SLOTS_MASTER = [
  { time: '09:30 AM', booked: false },
  { time: '10:00 AM', booked: true },
  { time: '10:30 AM', booked: false },
  { time: '11:00 AM', booked: false },
  { time: '11:30 AM', booked: false },
  { time: '02:00 PM', booked: false },
  { time: '02:30 PM', booked: false },
  { time: '03:00 PM', booked: true },
];

export const AppointmentBookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { language } = useLanguage();
  const { session } = useAuth();

  // Wizard Steps: 1: Facility -> 2: Doctor -> 3: Slot -> 4: Review
  const [step, setStep] = useState<number>(1);

  // Step 1: Facility Selection (F23-1)
  const [selectedFacility, setSelectedFacility] = useState<FacilityInfo>(DISTRICT_FACILITIES[2]); // CHC Wai
  const [facilitySearch, setFacilitySearch] = useState('');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<'ALL' | 'District Hospital' | 'CHC' | 'PHC'>('ALL');

  // Step 2: Doctor & Specialization Selection (F23-2)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfo>(DOCTORS_DIRECTORY[0]); // Dr. Deshmukh
  const [specFilter, setSpecFilter] = useState<string>('ALL');

  // Step 3: Date & Slot Picker (F23-3)
  const [selectedDate, setSelectedDate] = useState('2026-09-15');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');
  const [slots] = useState(TIME_SLOTS_MASTER);

  // Step 4: Submission & Confirmation (F23-4, F23-5)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<UpcomingAppointment | null>(null);

  const patientName = session.user?.name || DEFAULT_PATIENT_PROFILE.patientName;

  const filteredFacilities = DISTRICT_FACILITIES.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(facilitySearch.toLowerCase()) ||
      f.block.toLowerCase().includes(facilitySearch.toLowerCase());
    const matchesType = facilityTypeFilter === 'ALL' || f.type === facilityTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredDoctors = DOCTORS_DIRECTORY.filter((d) => {
    if (specFilter === 'ALL') return true;
    return d.spec.toLowerCase().includes(specFilter.toLowerCase());
  });

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const bookingId = `BK-${Date.now()}`;
      const tokenNumber = 'GEN-042';

      const bookingRecord: UpcomingAppointment = {
        id: bookingId,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
        date: selectedDate,
        slot: selectedSlot,
        tokenNumber,
        status: 'CONFIRMED',
        specialization: selectedDoctor.spec,
      };

      // 1. Cache locally in patient_cache
      await storageEngine.saveItem('patient_cache', bookingRecord.id, bookingRecord);

      // 2. Queue into sync_queue
      await storageEngine.enqueueSync('/api/v1/appointments', 'POST', {
        ...bookingRecord,
        patientName,
        patientAbha: session.user?.abhaId || DEFAULT_PATIENT_PROFILE.abhaId,
      });

      setConfirmedBooking(bookingRecord);
    } catch (err: any) {
      Alert.alert('Booking Error', err?.message || 'Failed to complete appointment reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirmedBooking) return;
    try {
      const updated: UpcomingAppointment = { ...confirmedBooking, status: 'CANCELLED' };
      await storageEngine.saveItem('patient_cache', updated.id, updated);
      await storageEngine.enqueueSync('/api/v1/appointments', 'PATCH', {
        id: updated.id,
        status: 'CANCELLED',
      });
      setConfirmedBooking(updated);
      Alert.alert('Status Updated', 'Appointment has been cancelled.');
    } catch (err) {
      console.warn('Cancel error:', err);
    }
  };

  const handleReschedule = async () => {
    if (!confirmedBooking) return;
    try {
      const updated: UpcomingAppointment = {
        ...confirmedBooking,
        slot: '02:00 PM',
        status: 'RESCHEDULED',
      };
      await storageEngine.saveItem('patient_cache', updated.id, updated);
      await storageEngine.enqueueSync('/api/v1/appointments', 'PATCH', {
        id: updated.id,
        slot: '02:00 PM',
        status: 'RESCHEDULED',
      });
      setConfirmedBooking(updated);
      Alert.alert('Appointment Rescheduled', 'Slot rescheduled to 02:00 PM.');
    } catch (err) {
      console.warn('Reschedule error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'डॉक्टरांची वेळ नोंदणी' : 'Book Appointment'}
        subtitle="Satara District Public Health Facilities"
        showBack={true}
        onBack={() => {
          if (step > 1) setStep(step - 1);
          else navigation.goBack();
        }}
      />

      {/* Progress Steps Header */}
      <View style={styles.stepperContainer}>
        {[1, 2, 3, 4].map((s) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= s && styles.stepCircleActive]}>
              <Text style={[styles.stepCircleText, step >= s && styles.stepCircleTextActive]}>
                {s}
              </Text>
            </View>
            <Text style={[styles.stepLabel, step >= s && styles.stepLabelActive]}>
              {s === 1 ? 'Facility' : s === 2 ? 'Doctor' : s === 3 ? 'Slot' : 'Confirm'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Center Selector (F23-1) */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Step 1: Select Healthcare Facility</Text>
            <Text style={styles.stepSubtitle}>Choose from 7 certified district facilities</Text>

            <FormInput
              placeholder="Search by facility name or block..."
              value={facilitySearch}
              onChangeText={setFacilitySearch}
              icon="search"
            />

            {/* Type Filter Pills */}
            <View style={styles.filterPillsRow}>
              {(['ALL', 'District Hospital', 'CHC', 'PHC'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterPill, facilityTypeFilter === type && styles.filterPillActive]}
                  onPress={() => setFacilityTypeFilter(type)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      facilityTypeFilter === type && styles.filterPillTextActive,
                    ]}
                  >
                    {type === 'District Hospital' ? 'Hospital' : type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredFacilities.map((facility) => {
              const isSelected = selectedFacility.id === facility.id;
              return (
                <TouchableOpacity
                  key={facility.id}
                  style={[styles.facilityCard, isSelected && styles.facilityCardSelected]}
                  onPress={() => setSelectedFacility(facility)}
                  activeOpacity={0.8}
                >
                  <View style={styles.facilityTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.facilityName, isSelected && styles.facilityNameSelected]}>
                        {facility.name}
                      </Text>
                      <Text style={styles.facilityBlock}>
                        {facility.block} Block · {facility.beds} Beds
                      </Text>
                    </View>
                    <Badge
                      label={facility.type}
                      variant={facility.type === 'District Hospital' ? 'primary' : 'neutral'}
                      size="sm"
                    />
                  </View>

                  <View style={styles.facilityFooterRow}>
                    <Text style={styles.docInChargeText}>MO: {facility.doctorInCharge}</Text>
                    <Text style={styles.facilityPhone}>{facility.phone}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <Button
              title="Next: Select Doctor"
              variant="primary"
              size="lg"
              fullWidth={true}
              onPress={() => setStep(2)}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {/* Step 2: Doctor & Specialization (F23-2) */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Step 2: Choose Doctor & Specialization</Text>
            <Text style={styles.stepSubtitle}>
              Selected Facility: <Text style={{ fontWeight: '800' }}>{selectedFacility.name}</Text>
            </Text>

            {/* Specialization Filter Pills */}
            <View style={styles.filterPillsRow}>
              {['ALL', 'General', 'Obstetrics', 'Pediatrics', 'Orthopedics'].map((spec) => (
                <TouchableOpacity
                  key={spec}
                  style={[styles.filterPill, specFilter === spec && styles.filterPillActive]}
                  onPress={() => setSpecFilter(spec)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      specFilter === spec && styles.filterPillTextActive,
                    ]}
                  >
                    {spec}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredDoctors.map((doc) => {
              const isSelected = selectedDoctor.id === doc.id;
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.doctorCard, isSelected && styles.doctorCardSelected]}
                  onPress={() => setSelectedDoctor(doc)}
                  activeOpacity={0.8}
                >
                  <View style={styles.docAvatarCircle}>
                    <AppIcon name="doctor" size={24} color={isSelected ? colors.white : colors.primary.DEFAULT} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.docName, isSelected && styles.docNameSelected]}>
                      {doc.name}
                    </Text>
                    <Text style={styles.docSpec}>{doc.spec}</Text>
                    <Text style={styles.docExp}>{doc.qualification} · {doc.experience}</Text>
                  </View>
                  {isSelected && <AppIcon name="checkCircle" size={20} color={colors.primary.DEFAULT} />}
                </TouchableOpacity>
              );
            })}

            <Button
              title="Next: Choose Date & Slot"
              variant="primary"
              size="lg"
              fullWidth={true}
              onPress={() => setStep(3)}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {/* Step 3: Date & Slot Picker (F23-3) */}
        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Step 3: Appointment Date & Time Slot</Text>
            <Text style={styles.stepSubtitle}>
              Doctor: <Text style={{ fontWeight: '800' }}>{selectedDoctor.name}</Text> ({selectedDoctor.spec})
            </Text>

            {/* Date Bar */}
            <Text style={styles.slotSectionLabel}>Select Consultation Date</Text>
            <View style={styles.datesBar}>
              {['2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18'].map((date) => (
                <TouchableOpacity
                  key={date}
                  style={[styles.dateTab, selectedDate === date && styles.dateTabSelected]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[styles.dateTabText, selectedDate === date && styles.dateTabTextSelected]}>
                    {date.slice(5)}
                  </Text>
                  <Text style={[styles.dateSubText, selectedDate === date && styles.dateSubTextSelected]}>
                    {date === '2026-09-15' ? 'Mon' : date === '2026-09-16' ? 'Tue' : 'Wed'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Time Slots Grid (Prevent double booking) */}
            <Text style={styles.slotSectionLabel}>Available OPD Time Slots</Text>
            <View style={styles.slotsGrid}>
              {slots.map((slotItem) => {
                const isSelected = selectedSlot === slotItem.time;
                const isBooked = slotItem.booked;

                return (
                  <TouchableOpacity
                    key={slotItem.time}
                    disabled={isBooked}
                    style={[
                      styles.slotChip,
                      isSelected && styles.slotChipSelected,
                      isBooked && styles.slotChipBooked,
                    ]}
                    onPress={() => setSelectedSlot(slotItem.time)}
                  >
                    <Text
                      style={[
                        styles.slotChipText,
                        isSelected && styles.slotChipTextSelected,
                        isBooked && styles.slotChipTextBooked,
                      ]}
                    >
                      {slotItem.time}
                    </Text>
                    {isBooked && <Text style={styles.bookedTag}>Booked</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="Next: Review & Confirm"
              variant="primary"
              size="lg"
              fullWidth={true}
              onPress={() => setStep(4)}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {/* Step 4: Summary & Confirm (F23-4) */}
        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>Step 4: Confirm Booking Details</Text>
            <Text style={styles.stepSubtitle}>Review before generating digital appointment token</Text>

            <Card variant="elevated" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Patient Name</Text>
                <Text style={styles.summaryValue}>{patientName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Facility</Text>
                <Text style={styles.summaryValue}>{selectedFacility.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Doctor</Text>
                <Text style={styles.summaryValue}>{selectedDoctor.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Department</Text>
                <Text style={styles.summaryValue}>{selectedDoctor.spec}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date & Time</Text>
                <Text style={[styles.summaryValue, { color: colors.primary.DEFAULT, fontWeight: '800' }]}>
                  {selectedDate} at {selectedSlot}
                </Text>
              </View>
            </Card>

            <Button
              title={isSubmitting ? 'Reserving Token...' : 'Confirm Appointment'}
              variant="primary"
              size="lg"
              fullWidth={true}
              onPress={handleConfirmBooking}
              loading={isSubmitting}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      </ScrollView>

      {/* Confirmation & Token Modal (F23-4, F23-5) */}
      {confirmedBooking && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.modalBackdrop}>
            <Card variant="elevated" style={styles.tokenModalCard}>
              <View style={styles.tokenSuccessIcon}>
                <AppIcon name="checkCircle" size={36} color={colors.status.success} />
              </View>
              <Text style={styles.tokenModalTitle}>
                {confirmedBooking.status === 'CANCELLED'
                  ? 'Appointment Cancelled'
                  : confirmedBooking.status === 'RESCHEDULED'
                  ? 'Appointment Rescheduled'
                  : 'Booking Confirmed!'}
              </Text>
              <Text style={styles.tokenModalSubtitle}>
                Present this token at the OPD registration desk
              </Text>

              <View style={styles.tokenBox}>
                <Text style={styles.tokenBoxLabel}>YOUR QUEUE TOKEN</Text>
                <Text style={styles.tokenBoxNumber}>{confirmedBooking.tokenNumber}</Text>
                <Badge
                  label={confirmedBooking.status}
                  variant={confirmedBooking.status === 'CONFIRMED' ? 'success' : 'neutral'}
                  size="sm"
                />
              </View>

              <View style={styles.tokenDetailsBox}>
                <Text style={styles.tokenDetailText}>
                  Facility: <Text style={{ fontWeight: '700' }}>{confirmedBooking.facilityName}</Text>
                </Text>
                <Text style={styles.tokenDetailText}>
                  Doctor: <Text style={{ fontWeight: '700' }}>{confirmedBooking.doctorName}</Text>
                </Text>
                <Text style={styles.tokenDetailText}>
                  Schedule: <Text style={{ fontWeight: '700' }}>{confirmedBooking.date} ({confirmedBooking.slot})</Text>
                </Text>
              </View>

              <View style={styles.tokenActionsRow}>
                {confirmedBooking.status === 'CONFIRMED' && (
                  <>
                    <Button
                      title="Reschedule"
                      variant="outline"
                      size="sm"
                      onPress={handleReschedule}
                      style={{ flex: 1, marginRight: spacing.xs }}
                    />
                    <Button
                      title="Cancel"
                      variant="danger"
                      size="sm"
                      onPress={handleCancelBooking}
                      style={{ flex: 1, marginLeft: spacing.xs }}
                    />
                  </>
                )}
              </View>

              <Button
                title="Done / Return to Dashboard"
                variant="primary"
                fullWidth={true}
                onPress={() => {
                  setConfirmedBooking(null);
                  navigation.goBack();
                }}
                style={{ marginTop: spacing.sm }}
              />
            </Card>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slate.gray,
  },
  stepCircleTextActive: {
    color: colors.white,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate.muted,
  },
  stepLabelActive: {
    color: colors.primary.DEFAULT,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.slate.dark,
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 12,
    color: colors.slate.gray,
    marginBottom: spacing.md,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: spacing.sm,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.gray,
  },
  filterPillTextActive: {
    color: colors.white,
  },
  facilityCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  facilityCardSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: '#F0F7FF',
  },
  facilityTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  facilityNameSelected: {
    color: colors.primary.DEFAULT,
  },
  facilityBlock: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 2,
  },
  facilityFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  docInChargeText: {
    fontSize: 11,
    color: colors.slate.muted,
  },
  facilityPhone: {
    fontSize: 11,
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.md,
  },
  doctorCardSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: '#F0F7FF',
  },
  docAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  docNameSelected: {
    color: colors.primary.DEFAULT,
  },
  docSpec: {
    fontSize: 12,
    color: colors.primary.DEFAULT,
    fontWeight: '700',
    marginTop: 1,
  },
  docExp: {
    fontSize: 11,
    color: colors.slate.muted,
    marginTop: 2,
  },
  slotSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
    marginVertical: spacing.sm,
  },
  datesBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dateTab: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateTabSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  dateTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  dateTabTextSelected: {
    color: colors.white,
  },
  dateSubText: {
    fontSize: 10,
    color: colors.slate.muted,
    marginTop: 2,
  },
  dateSubTextSelected: {
    color: '#E0F2FE',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  slotChip: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotChipSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: colors.primary.DEFAULT,
  },
  slotChipBooked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  slotChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  slotChipTextSelected: {
    color: colors.primary.DEFAULT,
  },
  slotChipTextBooked: {
    color: colors.slate.muted,
  },
  bookedTag: {
    fontSize: 9,
    color: colors.status.error,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.slate.gray,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  tokenModalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  tokenSuccessIcon: {
    marginBottom: spacing.sm,
  },
  tokenModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  tokenModalSubtitle: {
    fontSize: 11,
    color: colors.slate.gray,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  tokenBox: {
    width: '100%',
    backgroundColor: '#F0F7FF',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tokenBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
    letterSpacing: 1,
  },
  tokenBoxNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary.DEFAULT,
    marginVertical: 4,
  },
  tokenDetailsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 4,
  },
  tokenDetailText: {
    fontSize: 11,
    color: colors.slate.dark,
  },
  tokenActionsRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
