/**
 * HealthWay Waiting Room TV Display & Audio Chime
 * Government of Maharashtra - Integrated Rural Health Platform
 * Complies with PROJECT.md Feature 16 & Tier 1/4 tests
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { AppIcon } from '../../theme/icons';
import { Badge } from '../../components/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { QueueToken } from '../../types/queue';
import { INITIAL_QUEUE_TOKENS } from '../../data/mockQueue';

export const QueueTVScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { language, setLanguage } = useLanguage();

  const [tokens, setTokens] = useState<QueueToken[]>(INITIAL_QUEUE_TOKENS);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Sort tokens: IN_CONSULTATION first, then WAITING by priorityWeight DESC, then FIFO
  const sortedTokens = [...tokens].sort((a, b) => {
    if (a.status === 'IN_CONSULTATION' && b.status !== 'IN_CONSULTATION') return -1;
    if (b.status === 'IN_CONSULTATION' && a.status !== 'IN_CONSULTATION') return 1;
    if (b.priorityWeight !== a.priorityWeight) {
      return b.priorityWeight - a.priorityWeight;
    }
    return new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime();
  });

  const activeToken: QueueToken | undefined =
    sortedTokens.find(t => t.status === 'IN_CONSULTATION') || sortedTokens.find(t => t.status === 'WAITING');
  const upcomingTokens: QueueToken[] = sortedTokens
    .filter(t => t.status === 'WAITING' && t.id !== activeToken?.id)
    .slice(0, 4);

  const isEmergency = activeToken?.priority === 'emergency';

  // Digital Clock Ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Emergency Flashing Animation
  useEffect(() => {
    if (isEmergency) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(flashAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      flashAnim.setValue(0);
    }
  }, [isEmergency, flashAnim]);

  // Audio Speech Chime
  const announceToken = useCallback(
    (token?: QueueToken) => {
      if (!token || isMuted) return;

      try {
        Speech.stop();
        let phrase = '';
        let langCode = 'en-IN';

        if (language === 'mr') {
          phrase = `टोकन क्रमांक ${token.tokenNumber}, ${token.patientName}, कृपया ओपीडी कक्ष २ मध्ये यावे.`;
          langCode = 'mr-IN';
        } else if (language === 'hi') {
          phrase = `टोकन नंबर ${token.tokenNumber}, ${token.patientName}, कृपया ओपीडी कक्ष २ में जाएं.`;
          langCode = 'hi-IN';
        } else {
          phrase = `Token Number ${token.tokenNumber}, ${token.patientName}, please proceed to OPD Room 2.`;
          langCode = 'en-IN';
        }

        Speech.speak(phrase, {
          language: langCode,
          rate: 0.85,
          pitch: 1.0,
        });
      } catch (err) {
        console.warn('Speech callout error', err);
      }
    },
    [language, isMuted]
  );

  // Trigger announcement when active token changes
  useEffect(() => {
    if (activeToken) {
      announceToken(activeToken);
    }
  }, [activeToken?.tokenNumber, announceToken]);

  // Call Next Token
  const handleCallNext = () => {
    const nextWaiting = sortedTokens.find(t => t.status === 'WAITING');
    if (!nextWaiting) return;

    setTokens(prev =>
      prev.map(t => {
        if (t.id === nextWaiting.id) {
          return { ...t, status: 'IN_CONSULTATION', calledTime: new Date().toISOString() };
        }
        if (t.status === 'IN_CONSULTATION') {
          return { ...t, status: 'COMPLETED', completionTime: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  // Simulate Emergency Arrival
  const handleSimulateEmergency = () => {
    const emgToken: QueueToken = {
      id: `TOK-EMG-${Date.now()}`,
      tokenNumber: `EMG-${Math.floor(10 + Math.random() * 90)}`,
      patientId: `PT-EMG-${Date.now().toString().slice(-4)}`,
      patientName: language === 'mr' ? 'पूजा गायकवाड (तातडीची दुर्घटना)' : 'Pooja Gaikwad (Acute Trauma)',
      department: 'Casualty / Emergency',
      healthCenterId: 'FAC001',
      priority: 'emergency',
      priorityWeight: 100,
      status: 'WAITING',
      checkInTime: new Date().toISOString(),
      estWaitMinutes: 0,
      position: 1,
    };
    setTokens(prev => [emgToken, ...prev]);
  };

  const emergencyBorderColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#334E68', '#DC2626'],
  });

  return (
    <View style={[styles.tvContainer, { paddingTop: insets.top }]}>
      {/* TV Header Bar */}
      <View style={styles.tvHeader}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.emblemBadge}>
            <Text style={styles.emblemText}>MH</Text>
          </View>
          <View>
            <Text style={styles.hospitalTitle}>
              {language === 'mr' ? 'जिल्हा रुग्णालय सातारा' : 'DISTRICT HOSPITAL SATARA'}
            </Text>
            <Text style={styles.subTitle}>
              {language === 'mr'
                ? 'ओपीडी प्रतीक्षा कक्ष डिजिटल डिस्प्ले · कक्ष २'
                : 'OPD WAITING HALL DISPLAY · ROOM 2'}
            </Text>
          </View>
        </View>

        <View style={styles.headerControls}>
          <Text style={styles.clockText}>{currentTime}</Text>

          {/* Audio Mute Toggle */}
          <TouchableOpacity
            style={[styles.tvActionBtn, isMuted && styles.tvActionBtnMuted]}
            onPress={() => setIsMuted(!isMuted)}
            accessibilityRole="button"
            accessibilityLabel="Mute voice chime"
          >
            <AppIcon
              name={isMuted ? 'volumeMute' : 'volumeHigh'}
              size={20}
              color={colors.white}
            />
          </TouchableOpacity>

          {/* Close TV Mode */}
          <TouchableOpacity
            style={styles.tvCloseBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Close TV mode"
          >
            <AppIcon name="close" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Flashing Code-Red Alert Banner (If Emergency Token active) */}
      {isEmergency && (
        <View style={styles.emergencyBanner}>
          <AppIcon name="alertTriangle" size={20} color="#F87171" />
          <Text style={styles.emergencyBannerText}>
            {language === 'mr'
              ? 'तातडीचे आपत्कालीन टोकन सक्रिय - प्राधान्य सेवा'
              : 'CRITICAL CODE-RED CASUALTY ALERT: PRIORITY ATTENTION'}
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.contentWrap} showsVerticalScrollIndicator={false}>
        {/* NOW SERVING HERO DISPLAY */}
        <Animated.View
          style={[
            styles.nowServingCard,
            isEmergency && { borderColor: emergencyBorderColor, borderWidth: 2.5 },
          ]}
        >
          <View style={styles.servingHeader}>
            <Badge
              label={
                activeToken?.status === 'IN_CONSULTATION'
                  ? language === 'mr'
                    ? 'सध्या सुरू'
                    : 'NOW SERVING'
                  : language === 'mr'
                  ? 'पुढील रुग्ण'
                  : 'NEXT IN LINE'
              }
              variant={isEmergency ? 'danger' : 'accent'}
              size="md"
            />
            <Text style={styles.servingRoomTag}>OPD ROOM 2</Text>
          </View>

          {activeToken ? (
            <View style={styles.tokenHeroBody}>
              <Text
                style={[
                  styles.tokenHeroNumber,
                  isEmergency && { color: '#F87171' },
                ]}
              >
                {activeToken.tokenNumber}
              </Text>
              <Text style={styles.patientHeroName}>{activeToken.patientName}</Text>
              <Text style={styles.deptHeroText}>
                {activeToken.department} {activeToken.doctorName ? `· ${activeToken.doctorName}` : ''}
              </Text>

              {/* Room Callout Banner */}
              <View style={styles.roomCalloutWrap}>
                <AppIcon name="chevronRight" size={18} color="#38BDF8" />
                <Text style={styles.roomCalloutText}>
                  {language === 'mr'
                    ? 'कृपया ओपीडी कक्ष २ मध्ये प्रवेश करावा'
                    : 'PLEASE PROCEED TO OPD ROOM 2'}
                </Text>
              </View>

              {/* Voice Chime Replay Button */}
              <TouchableOpacity
                style={styles.replayChimeBtn}
                onPress={() => announceToken(activeToken)}
                activeOpacity={0.8}
              >
                <AppIcon name="volumeHigh" size={16} color={colors.white} />
                <Text style={styles.replayChimeText}>
                  {language === 'mr' ? 'पुन्हा पुकारा (Chime)' : 'Re-announce Audio Chime'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noServingWrap}>
              <Text style={styles.noServingText}>
                {language === 'mr' ? 'कोणतेही टोकन सक्रिय नाही' : 'No patient currently called'}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* UPCOMING / NEXT IN LINE PANEL */}
        <View style={styles.upcomingSection}>
          <Text style={styles.upcomingHeading}>
            {language === 'mr' ? 'पुढील रांगेतील रुग्ण' : 'NEXT IN LINE (UPCOMING QUEUE)'}
          </Text>

          {upcomingTokens.length > 0 ? (
            <View style={styles.upcomingGrid}>
              {upcomingTokens.map((tok, idx) => {
                const isEmg = tok.priority === 'emergency';
                return (
                  <View
                    key={tok.id}
                    style={[
                      styles.upcomingCard,
                      isEmg && { borderColor: colors.status.red, backgroundColor: '#2E1A1A' },
                    ]}
                  >
                    <View style={styles.upcomingCardHeader}>
                      <Text style={styles.upcomingIndex}>#{idx + 1}</Text>
                      <Badge
                        label={isEmg ? 'EMERGENCY' : tok.priority.toUpperCase()}
                        variant={isEmg ? 'danger' : 'outline'}
                        size="sm"
                      />
                    </View>
                    <Text
                      style={[
                        styles.upcomingTokenNum,
                        isEmg && { color: '#F87171' },
                      ]}
                    >
                      {tok.tokenNumber}
                    </Text>
                    <Text style={styles.upcomingPatient} numberOfLines={1}>
                      {tok.patientName}
                    </Text>
                    <View style={styles.upcomingFooter}>
                      <Text style={styles.upcomingDept} numberOfLines={1}>
                        {tok.department}
                      </Text>
                      <Text style={styles.upcomingWait}>
                        ~{(idx + 1) * 8}m
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noUpcomingText}>
              {language === 'mr' ? 'रांगेत इतर रुग्ण नाहीत' : 'No further waiting patients'}
            </Text>
          )}
        </View>

        {/* KIOSK CONTROLS (Doctor / Evaluator Simulation) */}
        <View style={styles.kioskControls}>
          <TouchableOpacity
            style={[styles.kioskBtn, { backgroundColor: colors.primary.saffron }]}
            onPress={handleCallNext}
            activeOpacity={0.85}
          >
            <AppIcon name="chevronRight" size={18} color={colors.white} />
            <Text style={styles.kioskBtnText}>
              {language === 'mr' ? 'पुढील टोकन बोलवा' : 'Call Next Token'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.kioskBtn, { backgroundColor: colors.status.red }]}
            onPress={handleSimulateEmergency}
            activeOpacity={0.85}
          >
            <AppIcon name="siren" size={18} color={colors.white} />
            <Text style={styles.kioskBtnText}>
              {language === 'mr' ? 'तातडीचे रुग्ण सिम्युलेशन' : 'Simulate Code-Red'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tvContainer: {
    flex: 1,
    backgroundColor: '#1C2B3A',
  },
  tvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2B3F56',
    backgroundColor: '#16222F',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emblemBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemText: {
    color: colors.white,
    fontWeight: '900',
    fontSize: 13,
  },
  hospitalTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clockText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
    marginRight: spacing.xs,
  },
  tvActionBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: '#26384B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tvActionBtnMuted: {
    backgroundColor: colors.status.red,
  },
  tvCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: '#26384B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 2,
    borderColor: '#DC2626',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  emergencyBannerText: {
    color: '#F87171',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  contentWrap: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  nowServingCard: {
    backgroundColor: '#22354A',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1.5,
    borderColor: '#334E68',
    ...shadows.lg,
  },
  servingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  servingRoomTag: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  tokenHeroBody: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tokenHeroNumber: {
    fontSize: 68,
    fontWeight: '900',
    color: colors.primary.saffron,
    letterSpacing: 2,
    lineHeight: 76,
  },
  patientHeroName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  roomCalloutWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
    gap: spacing.xs + 2,
  },
  roomCalloutText: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  deptHeroText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: spacing.sm,
  },
  replayChimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A5F',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  replayChimeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  noServingWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noServingText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  upcomingSection: {
    gap: spacing.sm,
  },
  upcomingHeading: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  upcomingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  upcomingCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#22354A',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#334E68',
  },
  upcomingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingIndex: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },
  upcomingTokenNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  upcomingPatient: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 4,
  },
  upcomingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  upcomingDept: {
    color: '#94A3B8',
    fontSize: 11,
    flex: 1,
  },
  upcomingWait: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  noUpcomingText: {
    color: '#64748B',
    fontSize: 13,
  },
  kioskControls: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  kioskBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  kioskBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
