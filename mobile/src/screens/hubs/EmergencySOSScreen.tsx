/**
 * HealthWay Emergency 1-Tap SOS & Live ALS Ambulance Tracking
 * Government of Maharashtra - Integrated Rural Health Platform
 * Complies with PROJECT.md Features 19-20 & Tier 1/4 tests
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { AppIcon } from '../../theme/icons';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EmergencyStatus } from '../../types/emergency';
import { storageEngine } from '../../storage/storageEngine';
import {
  RURAL_FALLBACK_COORDINATES,
  EMERGENCY_HELPLINES,
  TELEMETRY_STAGES,
} from '../../data/emergencyData';

export const EmergencySOSScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { language } = useLanguage();
  const { session } = useAuth();

  // SOS Activation States
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [graceRemaining, setGraceRemaining] = useState<number>(10);
  const [etaSeconds, setEtaSeconds] = useState<number>(14 * 60); // 14 mins
  const [currentStage, setCurrentStage] = useState<EmergencyStatus>('DISPATCHED');
  const [sosId, setSosId] = useState<string>('');

  // GPS State
  const [gpsLocation, setGpsLocation] = useState({
    latitude: RURAL_FALLBACK_COORDINATES.latitude,
    longitude: RURAL_FALLBACK_COORDINATES.longitude,
    isFallback: true,
    locationName: `${RURAL_FALLBACK_COORDINATES.village}, ${RURAL_FALLBACK_COORDINATES.district}`,
  });

  // Pulse animation for siren button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse effect loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Capture GPS on mount with fallback
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setGpsLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            isFallback: false,
            locationName: `${loc.coords.latitude.toFixed(4)}° N, ${loc.coords.longitude.toFixed(4)}° E`,
          });
        }
      } catch {
        // Fallback remains active
      }
    })();
  }, []);

  // 10-Second Grace Window Countdown
  useEffect(() => {
    let graceTimer: any;
    if (isActivated && !isDispatched) {
      graceTimer = setInterval(() => {
        setGraceRemaining(prev => {
          if (prev <= 1) {
            clearInterval(graceTimer);
            confirmDispatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(graceTimer);
  }, [isActivated, isDispatched]);

  // 14-Minute Live Ambulance Countdown & Stage Progression
  useEffect(() => {
    let countdownTimer: any;
    if (isDispatched && etaSeconds > 0) {
      countdownTimer = setInterval(() => {
        setEtaSeconds(prev => {
          const next = prev - 1;
          // Dynamically advance telemetry stage based on elapsed time
          if (next === 11 * 60) setCurrentStage('EN_ROUTE');
          else if (next === 6 * 60) setCurrentStage('ON_SCENE');
          else if (next === 3 * 60) setCurrentStage('TRANSPORTING');
          else if (next <= 0) setCurrentStage('ARRIVED');
          return Math.max(0, next);
        });
      }, 1000);
    }
    return () => clearInterval(countdownTimer);
  }, [isDispatched, etaSeconds]);

  // Trigger SOS button pressed
  const handleTriggerSOS = () => {
    if (isDispatched) return;
    const newSosId = `SOS-${Date.now()}`;
    setSosId(newSosId);
    setIsActivated(true);
    setGraceRemaining(10);
  };

  // Confirm Dispatch (after 10s or manually)
  const confirmDispatch = async () => {
    setIsDispatched(true);
    setIsActivated(false);
    setCurrentStage('DISPATCHED');

    // Persist to sync queue locally
    try {
      const sosEvent = {
        sosId: sosId || `SOS-${Date.now()}`,
        patientName: session?.user?.name || 'Emergency Citizen',
        abhaId: session?.user?.abhaId || '14-4821-9876-5432',
        bloodGroup: 'B Positive',
        lat: gpsLocation.latitude,
        lng: gpsLocation.longitude,
        timestamp: Date.now(),
        status: 'DISPATCHED',
      };
      await storageEngine.enqueueSync('/api/v1/emergency/sos', 'POST', sosEvent);
    } catch {
      // offline safe
    }
  };

  // Cancel False Alarm (grace window)
  const handleCancelSOS = () => {
    setIsActivated(false);
    setGraceRemaining(10);
  };

  // Dial helpline
  const handleDial = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Call Failed', `Cannot make phone call to ${phone}`);
    });
  };

  // Format ETA time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeStageIndex = TELEMETRY_STAGES.findIndex(s => s.stage === currentStage);

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'तातडीची आणीबाणी एसओएस' : 'Emergency 1-Tap SOS'}
        subtitle={
          language === 'mr' ? '१०८ रुग्णवाहिका व ट्रामा केंद्र' : '108 Ambulance & Trauma Network'
        }
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={false}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* GPS Beacon Status Card */}
        <Card style={styles.beaconCard}>
          <View style={styles.beaconHeader}>
            <View style={styles.beaconTitleRow}>
              <AppIcon name="location" size={20} color={colors.status.red} />
              <Text style={styles.beaconTitle}>
                {language === 'mr' ? 'थेट जीपीएस बीकन' : 'Live GPS Emergency Beacon'}
              </Text>
            </View>
            <Badge
              label={gpsLocation.isFallback ? 'RURAL MESH FALLBACK' : 'GPS LOCKED'}
              variant={gpsLocation.isFallback ? 'warning' : 'success'}
              size="sm"
            />
          </View>

          <View style={styles.coordinatesWrap}>
            <Text style={styles.coordText}>
              {`${gpsLocation.latitude.toFixed(4)}° N, ${gpsLocation.longitude.toFixed(4)}° E`}
            </Text>
            <Text style={styles.villageText}>{gpsLocation.locationName}</Text>
          </View>
        </Card>

        {/* 1-TAP SOS HERO BUTTON SECTION */}
        {!isDispatched ? (
          <View style={styles.heroSosSection}>
            <Text style={styles.sosInstructions}>
              {language === 'mr'
                ? 'वैद्यकीय आणीबाणीसाठी तात्काळ खालील बटण दाबा'
                : 'Tap once for immediate 108 ALS Ambulance Dispatch'}
            </Text>

            <Animated.View style={{ transform: [{ scale: isActivated ? pulseAnim : 1 }] }}>
              <TouchableOpacity
                style={[styles.bigSosButton, isActivated && styles.bigSosButtonActive]}
                onPress={handleTriggerSOS}
                activeOpacity={0.85}
              >
                <AppIcon name="siren" size={56} color={colors.white} />
                <Text style={styles.bigSosText}>108 SOS</Text>
                <Text style={styles.bigSosSubText}>
                  {language === 'mr' ? 'तात्काळ मदत' : 'TAP TO DISPATCH'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* 10-Second Grace Window Banner */}
            {isActivated && (
              <View style={styles.graceBanner}>
                <View style={styles.graceLeft}>
                  <Text style={styles.graceTimerText}>{graceRemaining}s</Text>
                  <Text style={styles.graceLabel}>
                    {language === 'mr'
                      ? 'रवाना होत आहे... रद्द करण्यासाठी टॅप करा'
                      : 'Dispatching... Tap to cancel false alarm'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.cancelGraceBtn} onPress={handleCancelSOS}>
                  <Text style={styles.cancelGraceText}>
                    {language === 'mr' ? 'रद्द करा' : 'Cancel'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* LIVE ALS AMBULANCE TELEMETRY SECTION */
          <View style={styles.telemetrySection}>
            <Card style={styles.countdownCard}>
              <View style={styles.countdownHeader}>
                <Badge label="CODE RED ACTIVATED" variant="danger" size="sm" />
                <Text style={styles.sosIdBadge}>{sosId || 'SOS-ACTIVE'}</Text>
              </View>

              <View style={styles.timerRow}>
                <Text style={styles.timerNumber}>{formatTime(etaSeconds)}</Text>
                <Text style={styles.timerUnit}>
                  {language === 'mr' ? 'मिनिटे (अंदाजे आगमन)' : 'MINUTES (EST. ARRIVAL)'}
                </Text>
              </View>

              {/* 5-Stage Status Telemetry Bar */}
              <View style={styles.telemetryTrack}>
                {TELEMETRY_STAGES.map((s, idx) => {
                  const isPassed = idx <= activeStageIndex;
                  const isCurrent = idx === activeStageIndex;
                  return (
                    <View key={s.stage} style={styles.telemetryStep}>
                      <View
                        style={[
                          styles.stepDot,
                          isPassed && styles.stepDotPassed,
                          isCurrent && styles.stepDotCurrent,
                        ]}
                      >
                        {isPassed && <AppIcon name="check" size={10} color={colors.white} />}
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          isCurrent && styles.stepLabelCurrent,
                        ]}
                      >
                        {language === 'mr' ? s.labelMr : s.labelEn}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Assigned ALS Unit Details */}
            <Card style={styles.unitCard}>
              <View style={styles.unitHeader}>
                <View style={styles.unitTitleRow}>
                  <AppIcon name="ambulance" size={22} color={colors.primary.navy} />
                  <View>
                    <Text style={styles.unitId}>MH-12-HE-1080 (ALS Unit)</Text>
                    <Text style={styles.unitType}>
                      Advanced Life Support · Satara Rural EOC
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.callDriverBtn}
                  onPress={() => handleDial('+919822110800')}
                >
                  <AppIcon name="call" size={16} color={colors.white} />
                  <Text style={styles.callDriverText}>Call 108</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.equipmentRow}>
                <Text style={styles.equipHeading}>
                  {language === 'mr' ? 'सज्ज वैद्यकीय उपकरणे:' : 'Onboard Life Support:'}
                </Text>
                <View style={styles.equipBadges}>
                  <Badge label="Oxygen 100%" variant="success" size="sm" />
                  <Badge label="Defibrillator AED" variant="danger" size="sm" />
                  <Badge label="Ventilator" variant="primary" size="sm" />
                  <Badge label="Trauma Kit" variant="accent" size="sm" />
                </View>
              </View>
            </Card>

            {/* Pre-Arrival Hospital Casualty Alert */}
            <Card style={styles.casualtyCard}>
              <View style={styles.casualtyHeader}>
                <AppIcon name="hospital" size={20} color={colors.primary.saffron} />
                <Text style={styles.casualtyTitle}>
                  {language === 'mr'
                    ? 'रुग्णालय पूर्व सूचना (कॅज्युअल्टी)'
                    : 'Pre-Arrival Hospital Casualty Alert'}
                </Text>
              </View>

              <Text style={styles.hospitalDest}>
                District Hospital Satara (Level 2 Trauma Centre)
              </Text>
              <Text style={styles.casualtySub}>
                Casualty Ward Token: <Text style={{ fontWeight: '800' }}>CODE_RED_TRAUMA</Text> · Trauma Bay 1 Reserved
              </Text>

              <View style={styles.casualtyActionRow}>
                <TouchableOpacity
                  style={styles.dialHospitalBtn}
                  onPress={() => handleDial('+912162234100')}
                >
                  <AppIcon name="phoneEmergency" size={14} color={colors.white} />
                  <Text style={styles.dialHospitalText}>
                    Casualty Desk: +91 2162 234100
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* 24/7 HELPLINES DIRECT DIAL GRID */}
        <View style={styles.helplinesSection}>
          <Text style={styles.sectionHeading}>
            {language === 'mr' ? '२४x७ आपत्कालीन थेट हेल्पलाइन' : '24x7 Emergency Helplines'}
          </Text>

          <View style={styles.helplinesGrid}>
            {EMERGENCY_HELPLINES.map(line => (
              <TouchableOpacity
                key={line.number}
                style={styles.helplineCard}
                onPress={() => handleDial(line.number)}
                activeOpacity={0.75}
              >
                <View style={[styles.helplineIconWrap, { backgroundColor: line.color }]}>
                  <AppIcon name="phoneEmergency" size={18} color={colors.white} />
                </View>
                <View style={styles.helplineContent}>
                  <Text style={styles.helplineNumber}>{line.number}</Text>
                  <Text style={styles.helplineTitle}>
                    {language === 'mr' ? line.titleMr : line.titleEn}
                  </Text>
                  <Text style={styles.helplineDesc}>{line.desc}</Text>
                </View>
                <AppIcon name="chevronRight" size={16} color={colors.slate.muted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate.bg,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  beaconCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  beaconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  beaconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  beaconTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  coordinatesWrap: {
    marginTop: 4,
  },
  coordText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.slate.dark,
    letterSpacing: 0.5,
  },
  villageText: {
    fontSize: 12,
    color: colors.slate.gray,
    marginTop: 2,
  },
  heroSosSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  sosInstructions: {
    fontSize: 14,
    color: colors.slate.gray,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  bigSosButton: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFCDD2',
    ...shadows.lg,
  },
  bigSosButtonActive: {
    backgroundColor: '#B71C1C',
    borderColor: '#EF5350',
  },
  bigSosText: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  bigSosSubText: {
    color: '#FFCDD2',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  graceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#ED6C02',
    borderRadius: borderRadius.lg,
    padding: spacing.sm + 4,
    width: '100%',
  },
  graceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  graceTimerText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ED6C02',
  },
  graceLabel: {
    fontSize: 12,
    color: colors.slate.dark,
    flex: 1,
  },
  cancelGraceBtn: {
    backgroundColor: '#ED6C02',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  cancelGraceText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  telemetrySection: {
    gap: spacing.md,
  },
  countdownCard: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.status.red,
    padding: spacing.lg,
  },
  countdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sosIdBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.gray,
  },
  timerRow: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  timerNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.status.red,
    letterSpacing: 2,
  },
  timerUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.gray,
    letterSpacing: 1,
    marginTop: 2,
  },
  telemetryTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.slate.light,
    paddingTop: spacing.md,
  },
  telemetryStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotPassed: {
    backgroundColor: colors.status.green,
  },
  stepDotCurrent: {
    backgroundColor: colors.status.red,
    borderWidth: 2,
    borderColor: '#FFCDD2',
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.slate.muted,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: colors.status.red,
    fontWeight: '800',
  },
  unitCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  unitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  unitId: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  unitType: {
    fontSize: 11,
    color: colors.slate.gray,
  },
  callDriverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.red,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  callDriverText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  equipmentRow: {
    borderTopWidth: 1,
    borderTopColor: colors.slate.light,
    paddingTop: spacing.xs,
  },
  equipHeading: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.slate.gray,
    marginBottom: 6,
  },
  equipBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  casualtyCard: {
    backgroundColor: '#FFFBF5',
    borderWidth: 1,
    borderColor: colors.primary.saffron,
    padding: spacing.md,
  },
  casualtyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 6,
  },
  casualtyTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary.saffron,
  },
  hospitalDest: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate.dark,
    marginBottom: 2,
  },
  casualtySub: {
    fontSize: 12,
    color: colors.slate.gray,
    marginBottom: 10,
  },
  casualtyActionRow: {
    flexDirection: 'row',
  },
  dialHospitalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.navy,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  dialHospitalText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  helplinesSection: {
    marginTop: spacing.sm,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.slate.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  helplinesGrid: {
    gap: spacing.sm,
  },
  helplineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.slate.light,
    ...shadows.sm,
  },
  helplineIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  helplineContent: {
    flex: 1,
  },
  helplineNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.slate.dark,
  },
  helplineTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate.dark,
  },
  helplineDesc: {
    fontSize: 10,
    color: colors.slate.muted,
  },
});
