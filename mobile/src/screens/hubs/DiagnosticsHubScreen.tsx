/**
 * HealthWay Diagnostics Hub
 * Government of Maharashtra - Integrated Rural Health Platform
 * Complies with Features 10-12, Tier 1, and Tier 2 boundary requirements.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { AppIcon } from '../../theme/icons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { useLanguage } from '../../context/LanguageContext';
import {
  DIAGNOSTIC_CATEGORIES,
  DIAGNOSTIC_CATALOG_48,
  INITIAL_LAB_ORDERS,
  DiagnosticCatalogItem,
  DiagnosticCategory,
} from '../../data/diagnosticCatalog';
import { LabTest, TestOrderStatus } from '../../types/diagnostics';

export const DiagnosticsHubScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { language, t } = useLanguage();

  // Mode: Directory vs Sample Tracker
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'TRACKER'>('DIRECTORY');

  // Directory State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fastingOnly, setFastingOnly] = useState<boolean>(false);

  // Tracker State
  const [orders, setOrders] = useState<LabTest[]>(INITIAL_LAB_ORDERS);
  const [barcodeSearch, setBarcodeSearch] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  // Report Modal State
  const [selectedReport, setSelectedReport] = useState<LabTest | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    return DIAGNOSTIC_CATALOG_48.filter(test => {
      const matchCat = selectedCategory === 'ALL' || test.category === selectedCategory;
      const matchFasting = !fastingOnly || test.fastingRequired;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        test.name.toLowerCase().includes(q) ||
        test.nameMr.toLowerCase().includes(q) ||
        test.code.toLowerCase().includes(q) ||
        test.category.toLowerCase().includes(q);
      return matchCat && matchFasting && matchSearch;
    });
  }, [selectedCategory, searchQuery, fastingOnly]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchStage = stageFilter === 'ALL' || order.status === stageFilter;
      const q = barcodeSearch.toLowerCase().trim();
      const matchBarcode =
        !q ||
        order.barcode.toLowerCase().includes(q) ||
        order.patientName.toLowerCase().includes(q) ||
        order.testName.toLowerCase().includes(q);
      return matchStage && matchBarcode;
    });
  }, [orders, stageFilter, barcodeSearch]);

  // Advance sample stage simulator
  const handleAdvanceStage = (orderId: string) => {
    const stageSequence: TestOrderStatus[] = ['ORDERED', 'COLLECTED', 'ANALYZING', 'RESULT_READY'];
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const currentIndex = stageSequence.indexOf(ord.status);
          if (currentIndex < stageSequence.length - 1) {
            const nextStage = stageSequence[currentIndex + 1];
            return {
              ...ord,
              status: nextStage,
              completedAt: nextStage === 'RESULT_READY' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ord.completedAt,
            };
          }
        }
        return ord;
      })
    );
  };

  // Generate HTML for PDF export
  const generateReportHtml = (test: LabTest): string => {
    const resultRows = (test.results || [])
      .map(
        r => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px 8px; font-weight: 600; color: #1C2B3A;">
          ${r.name}<br/><span style="font-size: 11px; color: #64748B;">${r.nameMr || ''}</span>
        </td>
        <td style="padding: 10px 8px; font-weight: 700; color: ${r.flag === 'CRITICAL' ? '#DC2626' : '#1C2B3A'};">
          ${r.value} ${r.unit}
        </td>
        <td style="padding: 10px 8px; color: #64748B;">${r.referenceRange}</td>
        <td style="padding: 10px 8px;">
          <span style="
            padding: 3px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            background-color: ${r.flag === 'CRITICAL' ? '#FEE2E2' : r.flag === 'BORDERLINE' ? '#FEF3C7' : '#DCFCE7'};
            color: ${r.flag === 'CRITICAL' ? '#DC2626' : r.flag === 'BORDERLINE' ? '#D97706' : '#16A34A'};
          ">
            ${r.flag}
          </span>
        </td>
      </tr>
    `
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>HealthWay Lab Report - ${test.barcode}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #1C2B3A; }
          .header { border-bottom: 2px solid #1A4B8C; padding-bottom: 12px; margin-bottom: 18px; }
          .gov-title { font-size: 18px; font-weight: 800; color: #1A4B8C; text-transform: uppercase; }
          .sub-title { font-size: 12px; color: #546E7A; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #F8FAFC; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th { text-align: left; padding: 8px; background: #F1F5F9; color: #475569; font-weight: 700; }
          .impression { margin-top: 20px; padding: 12px; background: #EFF6FF; border-left: 4px solid #1A4B8C; border-radius: 4px; font-size: 12px; }
          .critical-box { margin-top: 12px; padding: 10px; background: #FEF2F2; border-left: 4px solid #DC2626; border-radius: 4px; color: #991B1B; font-weight: 700; }
          .footer { margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 11px; color: #64748B; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="gov-title">Government of Maharashtra • Public Health Department</div>
          <div class="sub-title">HealthWay Integrated Rural Laboratory Diagnostic Network (NABL Empanelled)</div>
        </div>
        <div class="meta-grid">
          <div><strong>Patient Name:</strong> ${test.patientName}</div>
          <div><strong>ABHA ID:</strong> ${test.abhaId || 'N/A'}</div>
          <div><strong>Barcode:</strong> ${test.barcode}</div>
          <div><strong>Order ID:</strong> ${test.orderId}</div>
          <div><strong>Facility:</strong> ${test.facilityName}</div>
          <div><strong>Referring Doctor:</strong> ${test.prescribedByDoctor}</div>
          <div><strong>Sample Type:</strong> ${test.sampleType}</div>
          <div><strong>Reported Date:</strong> ${test.completedAt || new Date().toLocaleDateString()}</div>
        </div>
        ${test.hasCriticalValue ? '<div class="critical-box">CRITICAL PARAMETER ALERT: Immediate physician consultation required.</div>' : ''}
        <table>
          <thead>
            <tr>
              <th>Investigation Parameter</th>
              <th>Observed Value</th>
              <th>Reference Range</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            ${resultRows}
          </tbody>
        </table>
        <div class="impression">
          <strong>Clinical Impression:</strong><br/>
          ${test.overallImpression || 'Parameters analyzed according to standard clinical laboratory protocols.'}
        </div>
        <div class="footer">
          <div>Verified Pathologist: ${test.verifiedByPathologist || 'Chief Pathologist, NABL'}</div>
          <div>Authorized System Generated Report • HealthWay Mobile Portal</div>
        </div>
      </body>
      </html>
    `;
  };

  // PDF Download / Print Action
  const handleDownloadPdf = async (test: LabTest) => {
    try {
      setIsPdfGenerating(true);
      const html = generateReportHtml(test);
      const { uri } = await Print.printToFileAsync({ html });
      setIsPdfGenerating(false);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Diagnostic Report - ${test.orderId}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Ready', `Report generated at ${uri}`);
      }
    } catch (err) {
      setIsPdfGenerating(false);
      Alert.alert('Error', 'Failed to generate PDF report');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={language === 'mr' ? 'तपासणी केंद्र' : 'Diagnostics Hub'}
        subtitle={language === 'mr' ? '४८ चाचण्या सूची व नमुना ट्रॅकर' : '48-Test Directory & Sample Tracker'}
        showBack={true}
        onBack={() => navigation.goBack()}
        showSosButton={true}
        onSosPress={() => navigation.navigate('EmergencySOS')}
      />

      {/* Dual Tab Mode Switcher */}
      <View style={styles.modeBar}>
        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'DIRECTORY' && styles.modeTabActive]}
          onPress={() => setActiveTab('DIRECTORY')}
          activeOpacity={0.8}
        >
          <AppIcon
            name="diagnostic"
            size={18}
            color={activeTab === 'DIRECTORY' ? colors.white : colors.slate.gray}
          />
          <Text style={[styles.modeTabText, activeTab === 'DIRECTORY' && styles.modeTabTextActive]}>
            {language === 'mr' ? 'चाचणी सूची (४८)' : 'Test Directory (48)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'TRACKER' && styles.modeTabActive]}
          onPress={() => setActiveTab('TRACKER')}
          activeOpacity={0.8}
        >
          <AppIcon
            name="testTube"
            size={18}
            color={activeTab === 'TRACKER' ? colors.white : colors.slate.gray}
          />
          <Text style={[styles.modeTabText, activeTab === 'TRACKER' && styles.modeTabTextActive]}>
            {language === 'mr' ? 'नमुना ट्रॅकर' : 'Sample Tracker'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ==================== TAB 1: TEST DIRECTORY ==================== */}
      {activeTab === 'DIRECTORY' && (
        <View style={styles.tabContent}>
          {/* Search Bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <AppIcon name="search" size={16} color={colors.slate.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={language === 'mr' ? 'चाचणी किंवा कोड शोधा...' : 'Search test name or code...'}
                placeholderTextColor={colors.slate.muted}
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <AppIcon name="close" size={16} color={colors.slate.muted} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.fastingToggle, fastingOnly && styles.fastingToggleActive]}
              onPress={() => setFastingOnly(!fastingOnly)}
            >
              <Text style={[styles.fastingText, fastingOnly && styles.fastingTextActive]}>
                {language === 'mr' ? 'उपाशी' : 'Fasting'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Chips Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPills}
          >
            <TouchableOpacity
              style={[styles.catPill, selectedCategory === 'ALL' && styles.catPillActive]}
              onPress={() => setSelectedCategory('ALL')}
            >
              <Text style={[styles.catPillText, selectedCategory === 'ALL' && styles.catPillTextActive]}>
                {language === 'mr' ? 'सर्व (४८)' : 'All (48)'}
              </Text>
            </TouchableOpacity>
            {DIAGNOSTIC_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.catPillText, selectedCategory === cat && styles.catPillTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Catalog FlatList */}
          <FlatList
            data={filteredCatalog}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Card variant="elevated" style={styles.catalogCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.codePill}>
                    <Text style={styles.codePillText}>{item.code}</Text>
                  </View>
                  <Badge label={item.category} variant="primary" size="sm" />
                  {item.fastingRequired ? (
                    <Badge label="Fasting Req." variant="warning" size="sm" />
                  ) : (
                    <Badge label="No Fasting" variant="neutral" size="sm" />
                  )}
                  <Badge label={`TAT: ${item.tatHours}h`} variant="teal" size="sm" />
                </View>

                <Text style={styles.testName}>{item.name}</Text>
                <Text style={styles.testNameMr}>{item.nameMr}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Sample:</Text>
                    <Text style={styles.metaVal}>{item.sampleType}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Ref Range:</Text>
                    <Text style={styles.metaVal}>{item.normalRange}</Text>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <Button
                    title={language === 'mr' ? 'चाचणी नोंदवा' : 'Order Test'}
                    variant="primary"
                    size="sm"
                    onPress={() =>
                      Alert.alert(
                        'Test Ordered',
                        `${item.name} (${item.code}) ordered. Sample barcode will be generated upon phlebotomy.`
                      )
                    }
                  />
                </View>
              </Card>
            )}
          />
        </View>
      )}

      {/* ==================== TAB 2: SAMPLE TRACKER ==================== */}
      {activeTab === 'TRACKER' && (
        <View style={styles.tabContent}>
          {/* Barcode Search Bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <AppIcon name="qrCode" size={16} color={colors.slate.muted} />
              <TextInput
                value={barcodeSearch}
                onChangeText={setBarcodeSearch}
                placeholder="MH-LAB-XXXXXX or patient name..."
                placeholderTextColor={colors.slate.muted}
                style={styles.searchInput}
              />
              {barcodeSearch.length > 0 && (
                <TouchableOpacity onPress={() => setBarcodeSearch('')}>
                  <AppIcon name="close" size={16} color={colors.slate.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stage Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPills}
          >
            {(['ALL', 'ORDERED', 'COLLECTED', 'ANALYZING', 'RESULT_READY'] as const).map(st => (
              <TouchableOpacity
                key={st}
                style={[styles.catPill, stageFilter === st && styles.catPillActive]}
                onPress={() => setStageFilter(st)}
              >
                <Text style={[styles.catPillText, stageFilter === st && styles.catPillTextActive]}>
                  {st.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Orders FlatList */}
          <FlatList
            data={filteredOrders}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const stages: TestOrderStatus[] = ['ORDERED', 'COLLECTED', 'ANALYZING', 'RESULT_READY'];
              const currentStageIdx = stages.indexOf(item.status);
              const isReady = item.status === 'RESULT_READY';

              return (
                <Card
                  variant={item.hasCriticalValue ? 'danger' : 'elevated'}
                  style={styles.orderCard}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.barcodeBox}>
                      <AppIcon name="qrCode" size={14} color={colors.primary.DEFAULT} />
                      <Text style={styles.barcodeText}>{item.barcode}</Text>
                    </View>
                    <Badge
                      label={item.priority}
                      variant={item.priority === 'CRITICAL' ? 'danger' : item.priority === 'URGENT' ? 'warning' : 'neutral'}
                      size="sm"
                    />
                  </View>

                  <Text style={styles.orderTestTitle}>{item.testName}</Text>
                  <Text style={styles.orderPatient}>
                    {item.patientName} · {item.abhaId || 'N/A'}
                  </Text>
                  <Text style={styles.orderFacility}>
                    {item.facilityName} → {item.targetLabName}
                  </Text>

                  {/* 4-Stage Visual Stepper */}
                  <View style={styles.stepperContainer}>
                    {stages.map((stg, idx) => {
                      const isComplete = idx <= currentStageIdx;
                      const isActive = idx === currentStageIdx;
                      return (
                        <View key={stg} style={styles.stepperStep}>
                          <View
                            style={[
                              styles.stepperDot,
                              isComplete && styles.stepperDotComplete,
                              isActive && styles.stepperDotActive,
                            ]}
                          >
                            {isComplete && (
                              <AppIcon name="check" size={10} color={colors.white} />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.stepperLabel,
                              isActive && styles.stepperLabelActive,
                            ]}
                          >
                            {stg.slice(0, 4)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Critical Value Warning */}
                  {item.hasCriticalValue && (
                    <View style={styles.criticalBanner}>
                      <AppIcon name="alertTriangle" size={16} color={colors.status.error} />
                      <Text style={styles.criticalBannerText}>
                        CRITICAL PARAMETER ALERT: Immediate review required!
                      </Text>
                    </View>
                  )}

                  {/* Action Controls */}
                  <View style={styles.orderActions}>
                    {!isReady && (
                      <Button
                        title="Advance Stage"
                        variant="secondary"
                        size="sm"
                        icon="arrowRight"
                        onPress={() => handleAdvanceStage(item.id)}
                      />
                    )}
                    {isReady && (
                      <Button
                        title="View Lab Report"
                        variant="primary"
                        size="sm"
                        icon="diagnostic"
                        onPress={() => setSelectedReport(item)}
                      />
                    )}
                  </View>
                </Card>
              );
            }}
          />
        </View>
      )}

      {/* ==================== LAB REPORT MODAL ==================== */}
      <Modal
        visible={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Diagnostic Lab Report"
      >
        {selectedReport && (
          <ScrollView contentContainerStyle={styles.reportModalScroll}>
            {/* Header info */}
            <View style={styles.reportHeaderCard}>
              <Text style={styles.reportGovTitle}>
                GOVERNMENT OF MAHARASHTRA · HEALTH DEPARTMENT
              </Text>
              <Text style={styles.reportTestName}>{selectedReport.testName}</Text>
              <Text style={styles.reportBarcode}>Barcode: {selectedReport.barcode}</Text>

              <View style={styles.reportMetaGrid}>
                <Text style={styles.reportMetaItem}>Patient: {selectedReport.patientName}</Text>
                <Text style={styles.reportMetaItem}>ABHA: {selectedReport.abhaId || 'N/A'}</Text>
                <Text style={styles.reportMetaItem}>Order ID: {selectedReport.orderId}</Text>
                <Text style={styles.reportMetaItem}>Doctor: {selectedReport.prescribedByDoctor}</Text>
                <Text style={styles.reportMetaItem}>Sample: {selectedReport.sampleType}</Text>
                <Text style={styles.reportMetaItem}>Reported: {selectedReport.completedAt || 'Today'}</Text>
              </View>
            </View>

            {/* Critical Alert */}
            {selectedReport.hasCriticalValue && (
              <View style={styles.reportCriticalAlert}>
                <AppIcon name="alertTriangle" size={18} color="#991B1B" />
                <Text style={styles.reportCriticalText}>
                  CRITICAL LAB FINDING: Immediate medical escalation advised.
                </Text>
              </View>
            )}

            {/* Results Table */}
            <Text style={styles.tableHeading}>INVESTIGATION PARAMETERS</Text>
            {(selectedReport.results || []).map(res => (
              <View key={res.parameterId} style={styles.parameterRow}>
                <View style={styles.paramLeft}>
                  <Text style={styles.paramName}>{res.name}</Text>
                  {res.nameMr && <Text style={styles.paramNameMr}>{res.nameMr}</Text>}
                  <Text style={styles.paramRef}>Normal: {res.referenceRange}</Text>
                </View>

                <View style={styles.paramRight}>
                  <Text
                    style={[
                      styles.paramValue,
                      res.flag === 'CRITICAL' && styles.paramValueCritical,
                    ]}
                  >
                    {res.value} {res.unit}
                  </Text>
                  <Badge
                    label={res.flag}
                    variant={res.flag === 'CRITICAL' ? 'danger' : res.flag === 'BORDERLINE' ? 'warning' : 'success'}
                    size="sm"
                  />
                </View>
              </View>
            ))}

            {/* Pathologist Impression */}
            <View style={styles.impressionBox}>
              <Text style={styles.impressionTitle}>Clinical Impression:</Text>
              <Text style={styles.impressionText}>
                {selectedReport.overallImpression || 'Parameters analyzed according to standard clinical laboratory protocols.'}
              </Text>
              <Text style={styles.pathologistSign}>
                Verified: {selectedReport.verifiedByPathologist || 'Chief Pathologist, NABL'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActionRow}>
              <Button
                title={isPdfGenerating ? 'Generating...' : 'Download / Share PDF'}
                variant="primary"
                icon="share"
                fullWidth
                loading={isPdfGenerating}
                disabled={isPdfGenerating}
                onPress={() => handleDownloadPdf(selectedReport)}
              />
            </View>
          </ScrollView>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  modeBar: {
    flexDirection: 'row',
    backgroundColor: colors.slate.surface,
    padding: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.borderLight,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate.gray,
  },
  modeTabTextActive: {
    color: colors.white,
  },
  tabContent: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    height: 42,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.slate.dark,
  },
  fastingToggle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate.border,
    borderRadius: borderRadius.md,
  },
  fastingToggleActive: {
    backgroundColor: colors.accent.DEFAULT,
    borderColor: colors.accent.DEFAULT,
  },
  fastingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.gray,
  },
  fastingTextActive: {
    color: colors.white,
  },
  categoryPills: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  catPill: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.slate.border,
  },
  catPillActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  catPillText: {
    fontSize: 12,
    color: colors.slate.gray,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  catalogCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  codePill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  testName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  testNameMr: {
    fontSize: 12,
    color: colors.slate.gray,
    marginTop: 1,
  },
  metaRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: colors.slate.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 11,
    color: colors.slate.dark,
    fontWeight: '600',
  },
  cardActions: {
    marginTop: spacing.sm,
    alignItems: 'flex-end',
  },
  orderCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barcodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  barcodeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: colors.primary.DEFAULT,
  },
  orderTestTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  orderPatient: {
    fontSize: 12,
    color: colors.slate.gray,
    marginTop: 2,
  },
  orderFacility: {
    fontSize: 11,
    color: colors.slate.muted,
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  stepperStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepperDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepperDotComplete: {
    backgroundColor: colors.status.success,
  },
  stepperDotActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderWidth: 2,
    borderColor: '#93C5FD',
  },
  stepperLabel: {
    fontSize: 9,
    color: colors.slate.muted,
    fontWeight: '600',
  },
  stepperLabelActive: {
    color: colors.primary.DEFAULT,
    fontWeight: '800',
  },
  criticalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.xs,
  },
  criticalBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.status.error,
    flex: 1,
  },
  orderActions: {
    marginTop: spacing.xs,
    alignItems: 'flex-end',
  },
  reportModalScroll: {
    paddingBottom: spacing.lg,
  },
  reportHeaderCard: {
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  reportGovTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
    letterSpacing: 0.5,
  },
  reportTestName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.slate.dark,
    marginVertical: 4,
  },
  reportBarcode: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.slate.gray,
    marginBottom: 8,
  },
  reportMetaGrid: {
    gap: 2,
  },
  reportMetaItem: {
    fontSize: 11,
    color: colors.slate.dark,
  },
  reportCriticalAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  reportCriticalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    flex: 1,
  },
  tableHeading: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.slate.muted,
    marginBottom: spacing.xs,
  },
  parameterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paramLeft: {
    flex: 1,
  },
  paramName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  paramNameMr: {
    fontSize: 11,
    color: colors.slate.gray,
  },
  paramRef: {
    fontSize: 11,
    color: colors.slate.muted,
    marginTop: 2,
  },
  paramRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paramValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  paramValueCritical: {
    color: colors.status.error,
  },
  impressionBox: {
    marginTop: spacing.md,
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.DEFAULT,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
  },
  impressionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary.DEFAULT,
  },
  impressionText: {
    fontSize: 12,
    color: colors.slate.dark,
    marginTop: 4,
    lineHeight: 17,
  },
  pathologistSign: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.slate.gray,
    marginTop: 8,
  },
  modalActionRow: {
    marginTop: spacing.md,
  },
});
