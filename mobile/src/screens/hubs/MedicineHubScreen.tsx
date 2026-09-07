/**
 * HealthWay Medicine Availability & EDL Inventory Hub
 * Complies with Features 18-20, Tier 1, and Tier 2 boundary requirements.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { Icon } from '../../theme/icons';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import {
  AUTHORITATIVE_EDL_CATALOG,
  ExtendedEdlMedicine,
  computeStockTier,
  calculateReorderQuantity,
} from '../../data/edlMedicines';
import { StockStatus, MedicineCategory } from '../../types/medicine';
import { storageEngine } from '../../storage/storageEngine';

const CATEGORIES: { key: MedicineCategory | 'ALL'; label: string; labelMr: string }[] = [
  { key: 'ALL', label: 'All Items', labelMr: 'सर्व औषधे' },
  { key: 'ESSENTIAL', label: 'Essential', labelMr: 'अत्यावश्यक' },
  { key: 'ANTIBIOTIC', label: 'Antibiotics', labelMr: 'प्रतिजैविके' },
  { key: 'MATERNAL_CHILD', label: 'Maternal & Child', labelMr: 'मातृ-बाल संगोपन' },
  { key: 'CHRONIC_NCD', label: 'Chronic NCD', labelMr: 'दीर्घकालीन आजार' },
  { key: 'EMERGENCY', label: 'Emergency', labelMr: 'आपत्कालीन' },
];

const FACILITY_OPTIONS = [
  { id: 'ALL', name: 'All District Facilities', nameMr: 'सर्व आरोग्य केंद्रे' },
  { id: 'FAC001', name: 'District Hospital Satara', nameMr: 'जिल्हा रुग्णालय सातारा' },
  { id: 'FAC003', name: 'CHC Wai', nameMr: 'ग्रामीण रुग्णालय वाई' },
  { id: 'FAC005', name: 'PHC Mahabaleshwar', nameMr: 'प्राथमिक आरोग्य केंद्र महाबळेश्वर' },
  { id: 'FAC007', name: 'Sub-Centre Tapola', nameMr: 'उपकेंद्र तापोळा' },
];

export const MedicineHubScreen: React.FC = () => {
  const { session, user } = useAuth();
  const { language } = useLanguage();

  const [medicines, setMedicines] = useState<ExtendedEdlMedicine[]>(AUTHORITATIVE_EDL_CATALOG);
  const [selectedFacility, setSelectedFacility] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<MedicineCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);

  // Expanded substitution states (by medicine ID)
  const [expandedSubstitutions, setExpandedSubstitutions] = useState<Record<string, boolean>>({});

  // Reorder Indent Modal states
  const [indentModalVisible, setIndentModalVisible] = useState<boolean>(false);
  const [activeMedicineForIndent, setActiveMedicineForIndent] = useState<ExtendedEdlMedicine | null>(null);
  const [reorderQuantity, setReorderQuantity] = useState<string>('500');
  const [reorderUrgency, setReorderUrgency] = useState<'ROUTINE' | 'URGENT' | 'CRITICAL_EMERGENCY'>('ROUTINE');
  const [indentJustification, setIndentJustification] = useState<string>('');
  const [isSubmittingIndent, setIsSubmittingIndent] = useState<boolean>(false);

  // Load persisted stock from storage on mount
  useEffect(() => {
    async function loadStock() {
      try {
        const saved = await storageEngine.getItem<ExtendedEdlMedicine[]>('medicine_stock', 'all');
        if (saved && Array.isArray(saved) && saved.length > 0) {
          setMedicines(saved);
        }
      } catch (err) {
        console.warn('Could not load stored medicine stock', err);
      }
    }
    loadStock();
  }, []);

  // Compute metrics across selected facility or district
  const metrics = useMemo(() => {
    let adequate = 0;
    let low = 0;
    let critical = 0;
    let outOfStock = 0;

    medicines.forEach(med => {
      const status =
        selectedFacility !== 'ALL' && med.facilityStock && med.facilityStock[selectedFacility]
          ? med.facilityStock[selectedFacility].status
          : med.status;

      if (status === 'ADEQUATE') adequate++;
      else if (status === 'LOW') low++;
      else if (status === 'CRITICAL') critical++;
      else if (status === 'OUT_OF_STOCK') outOfStock++;
    });

    return {
      total: medicines.length,
      adequate,
      low,
      critical,
      outOfStock,
    };
  }, [medicines, selectedFacility]);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return medicines.filter(med => {
      // Facility stock resolution
      const facilityData =
        selectedFacility !== 'ALL' && med.facilityStock ? med.facilityStock[selectedFacility] : null;
      const currentStock = facilityData ? facilityData.stockLevel : med.stockLevel;
      const currentStatus = facilityData ? facilityData.status : med.status;

      // Category filter
      if (selectedCategory !== 'ALL' && med.category !== selectedCategory) {
        return false;
      }

      // Low stock filter
      if (showLowStockOnly && (currentStatus === 'ADEQUATE')) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = med.name.toLowerCase().includes(query);
        const matchesNameMr = (med.nameMr || '').toLowerCase().includes(query);
        const matchesCode = med.code.toLowerCase().includes(query);
        const matchesGeneric = med.generic.toLowerCase().includes(query);
        const matchesSalt = (med.activeSalt || '').toLowerCase().includes(query);
        const matchesIndications = (med.useFor || []).some(ind => ind.toLowerCase().includes(query));

        if (!matchesName && !matchesNameMr && !matchesCode && !matchesGeneric && !matchesSalt && !matchesIndications) {
          return false;
        }
      }

      return true;
    });
  }, [medicines, selectedFacility, selectedCategory, showLowStockOnly, searchQuery]);

  const toggleSubstitutions = (medId: string) => {
    setExpandedSubstitutions(prev => ({
      ...prev,
      [medId]: !prev[medId],
    }));
  };

  const handleOpenIndentModal = (med: ExtendedEdlMedicine) => {
    setActiveMedicineForIndent(med);

    const facilityData =
      selectedFacility !== 'ALL' && med.facilityStock ? med.facilityStock[selectedFacility] : null;
    const currentStock = facilityData ? facilityData.stockLevel : med.stockLevel;
    const minBuffer = facilityData ? facilityData.minBuffer : med.minBuffer;

    const suggestedQty = calculateReorderQuantity(currentStock, minBuffer) || minBuffer;
    setReorderQuantity(suggestedQty.toString());

    if (currentStock === 0) {
      setReorderUrgency('CRITICAL_EMERGENCY');
    } else if (currentStock <= minBuffer * 0.25) {
      setReorderUrgency('URGENT');
    } else {
      setReorderUrgency('ROUTINE');
    }

    setIndentJustification(
      `Reorder generated for ${med.name} (${med.code}) to maintain statutory ${minBuffer * 2} buffer units at ${
        selectedFacility === 'ALL' ? 'Satara District Network' : selectedFacility
      }.`
    );
    setIndentModalVisible(true);
  };

  const handleSubmitIndent = async () => {
    if (!activeMedicineForIndent) return;

    const qty = parseInt(reorderQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid numeric reorder quantity greater than 0.');
      return;
    }

    setIsSubmittingIndent(true);
    try {
      const indentId = `IND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const indentPayload = {
        indentId,
        medicineId: activeMedicineForIndent.id,
        medicineCode: activeMedicineForIndent.code,
        medicineName: activeMedicineForIndent.name,
        activeSalt: activeMedicineForIndent.activeSalt,
        facilityId: selectedFacility === 'ALL' ? 'FAC001' : selectedFacility,
        warehouse: 'Satara District Central Medical Store (NHM Warehouse)',
        reorderQuantity: qty,
        urgency: reorderUrgency,
        justification: indentJustification,
        requestedBy: user?.name || session?.user?.name || 'Healthcare Officer',
        requestedRole: session?.role || 'doctor',
        timestamp: new Date().toISOString(),
      };

      // Persist to sync queue for cloud reconciliation
      await storageEngine.enqueueSync('/api/v1/indents', 'POST', indentPayload);

      // Optimistically boost stock by reorder quantity in local state & storage
      const updatedMedicines = medicines.map(m => {
        if (m.id === activeMedicineForIndent.id) {
          const newStock = m.stockLevel + qty;
          const newStatus = computeStockTier(newStock, m.minBuffer);
          return {
            ...m,
            stockLevel: newStock,
            status: newStatus,
          };
        }
        return m;
      });

      setMedicines(updatedMedicines);
      await storageEngine.saveItem('medicine_stock', 'all', updatedMedicines);

      setIndentModalVisible(false);
      Alert.alert(
        'Indent Requisition Transmitted',
        `Requisition ${indentId} successfully enqueued to Satara District Medical Store.\n\nMedicine: ${activeMedicineForIndent.name}\nQuantity: ${qty} ${activeMedicineForIndent.unit}\nUrgency: ${reorderUrgency}`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to submit indent requisition. Please try again.');
    } finally {
      setIsSubmittingIndent(false);
    }
  };

  const handleSelectSubstitute = (substituteName: string, primaryName: string) => {
    Alert.alert(
      'Generic Alternative Selected',
      `Equivalent salt alternative "${substituteName}" selected in place of "${primaryName}". Clinical prescription updated.`,
      [{ text: 'Confirm' }]
    );
  };

  const getStatusBadgeVariant = (status: StockStatus) => {
    switch (status) {
      case 'ADEQUATE':
        return 'success';
      case 'LOW':
        return 'warning';
      case 'CRITICAL':
        return 'danger';
      case 'OUT_OF_STOCK':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: StockStatus) => {
    switch (status) {
      case 'ADEQUATE':
        return language === 'mr' ? 'पुरेसा साठा' : 'ADEQUATE';
      case 'LOW':
        return language === 'mr' ? 'कमी साठा' : 'LOW STOCK';
      case 'CRITICAL':
        return language === 'mr' ? 'गंभीर कमतरता' : 'CRITICAL';
      case 'OUT_OF_STOCK':
        return language === 'mr' ? 'साठा संपला' : 'OUT OF STOCK';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={language === 'mr' ? 'औषध उपलब्धता व साठा' : 'Medicine Availability Hub'}
        showBack={true}
        showSOS={true}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* District Facility Selector Bar */}
        <View style={styles.facilitySection}>
          <Text style={styles.sectionHeading}>
            {language === 'mr' ? 'आरोग्य केंद्र निवडा' : 'Select Healthcare Facility'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.facilityScroll}>
            {FACILITY_OPTIONS.map(fac => {
              const isSelected = selectedFacility === fac.id;
              return (
                <TouchableOpacity
                  key={fac.id}
                  style={[styles.facilityPill, isSelected && styles.facilityPillActive]}
                  onPress={() => setSelectedFacility(fac.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select facility ${fac.name}`}
                >
                  <Icon
                    name="hospital"
                    size={14}
                    color={isSelected ? colors.white : colors.slate.gray}
                  />
                  <Text style={[styles.facilityPillText, isSelected && styles.facilityPillTextActive]}>
                    {language === 'mr' ? fac.nameMr : fac.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Real-Time Stock Inventory Metric Strip */}
        <View style={styles.metricsStrip}>
          <View style={[styles.metricCard, { borderLeftColor: colors.status.green }]}>
            <Text style={styles.metricValue}>{metrics.adequate}</Text>
            <Text style={styles.metricLabel}>{language === 'mr' ? 'पुरेसा साठा' : 'Adequate'}</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: colors.status.amber }]}>
            <Text style={styles.metricValue}>{metrics.low}</Text>
            <Text style={styles.metricLabel}>{language === 'mr' ? 'कमी साठा' : 'Low Stock'}</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: colors.primary.saffron }]}>
            <Text style={styles.metricValue}>{metrics.critical}</Text>
            <Text style={styles.metricLabel}>{language === 'mr' ? 'गंभीर' : 'Critical'}</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: colors.status.red }]}>
            <Text style={styles.metricValue}>{metrics.outOfStock}</Text>
            <Text style={styles.metricLabel}>{language === 'mr' ? 'साठा संपला' : 'Out of Stock'}</Text>
          </View>
        </View>

        {/* Search and Category Filter Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBarContainer}>
            <Icon name="search" size={18} color={colors.slate.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={
                language === 'mr'
                  ? 'औषधाचे नाव, फॉर्म्युला किंवा आजार शोधा...'
                  : 'Search by brand, active salt, generic, or condition...'
              }
              placeholderTextColor={colors.slate.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Category Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat.key)}
                >
                  <Text style={[styles.categoryPillText, isSelected && styles.categoryPillTextActive]}>
                    {language === 'mr' ? cat.labelMr : cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Low/Out of Stock Toggle */}
            <TouchableOpacity
              style={[styles.categoryPill, showLowStockOnly && styles.categoryPillWarning]}
              onPress={() => setShowLowStockOnly(!showLowStockOnly)}
            >
              <Icon
                name="alertTriangle"
                size={12}
                color={showLowStockOnly ? colors.white : colors.status.red}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  showLowStockOnly ? styles.categoryPillTextActive : { color: colors.status.red },
                ]}
              >
                {language === 'mr' ? 'केवळ कमी/रिक्त' : 'Low/Out Stock Only'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Inventory Item Cards */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listCount}>
              {language === 'mr'
                ? `${filteredMedicines.length} औषधे उपलब्ध`
                : `Displaying ${filteredMedicines.length} EDL Medicines`}
            </Text>
            <Text style={styles.facilitySubtitle}>
              {selectedFacility === 'ALL'
                ? 'District Aggregated Stock'
                : FACILITY_OPTIONS.find(f => f.id === selectedFacility)?.name}
            </Text>
          </View>

          {filteredMedicines.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Icon name="medicine" size={36} color={colors.slate.muted} />
              <Text style={styles.emptyTitle}>
                {language === 'mr' ? 'कोणतीही औषधे आढळली नाहीत' : 'No Medicines Found'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {language === 'mr'
                  ? 'कृपया वेगळे शोध शब्द किंवा फिल्टर वापरून पहा.'
                  : 'Try clearing your search query or selecting another category.'}
              </Text>
            </Card>
          ) : (
            filteredMedicines.map(med => {
              const facilityData =
                selectedFacility !== 'ALL' && med.facilityStock ? med.facilityStock[selectedFacility] : null;
              const currentStock = facilityData ? facilityData.stockLevel : med.stockLevel;
              const minBuffer = facilityData ? facilityData.minBuffer : med.minBuffer;
              const currentStatus = facilityData ? facilityData.status : med.status;

              // Calculate stock meter percentage
              const targetCapacity = minBuffer * 2;
              const meterRatio = Math.min(Math.max(currentStock / targetCapacity, 0), 1);
              const meterPercent = Math.round(meterRatio * 100);

              const isSubstitutionsExpanded = !!expandedSubstitutions[med.id];
              const hasSubstitutes = (med.genericSubstitutesList || []).length > 0;
              const needsSubstitution = currentStatus === 'OUT_OF_STOCK' || currentStatus === 'CRITICAL';

              return (
                <Card key={med.id} style={styles.medicineCard}>
                  {/* Top Bar: Code, Name, Status Badge */}
                  <View style={styles.cardHeader}>
                    <View style={styles.titleArea}>
                      <View style={styles.codeRow}>
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeText}>{med.code}</Text>
                        </View>
                        <Text style={styles.formTag}>
                          {med.form} • {med.strength}
                        </Text>
                      </View>
                      <Text style={styles.medicineName}>
                        {language === 'mr' && med.nameMr ? med.nameMr : med.name}
                      </Text>
                      <Text style={styles.genericSubtitle}>{med.generic}</Text>
                    </View>

                    <Badge
                      label={getStatusLabel(currentStatus)}
                      variant={getStatusBadgeVariant(currentStatus) as any}
                      size="md"
                    />
                  </View>

                  {/* Active Chemical Salt Highlight Badge */}
                  <View style={styles.saltBadgeContainer}>
                    <Icon name="testTube" size={13} color={colors.primary.navy} />
                    <Text style={styles.saltBadgeText}>
                      <Text style={styles.saltBold}>Active Salt: </Text>
                      {med.activeSalt}
                    </Text>
                  </View>

                  {/* Stock Level Progress Bar & Buffer Marker */}
                  <View style={styles.meterContainer}>
                    <View style={styles.meterLabels}>
                      <Text style={styles.meterCurrentText}>
                        {language === 'mr' ? 'उपलब्ध साठा: ' : 'In Stock: '}
                        <Text style={styles.meterCurrentNumber}>
                          {currentStock.toLocaleString()} {med.unit}
                        </Text>
                      </Text>
                      <Text style={styles.meterBufferText}>
                        Min Buffer: {minBuffer.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.meterTrack}>
                      <View
                        style={[
                          styles.meterFill,
                          {
                            width: `${meterPercent}%`,
                            backgroundColor:
                              currentStatus === 'ADEQUATE'
                                ? colors.status.green
                                : currentStatus === 'LOW'
                                ? colors.status.amber
                                : colors.status.red,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Batch & Expiry Strip */}
                  <View style={styles.batchStrip}>
                    <Text style={styles.batchInfo}>
                      Batch: <Text style={styles.batchVal}>{med.batchNo || 'N/A'}</Text>
                    </Text>
                    <Text style={styles.batchInfo}>
                      Expiry: <Text style={styles.batchVal}>{med.expiryDate || 'N/A'}</Text>
                    </Text>
                  </View>

                  {/* Indications Tags */}
                  {med.useFor && med.useFor.length > 0 && (
                    <View style={styles.indicationsRow}>
                      {med.useFor.map((use, idx) => (
                        <View key={idx} style={styles.indicationChip}>
                          <Text style={styles.indicationText}>{use}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Active Salt Generic Substitution Section */}
                  {hasSubstitutes && (
                    <View style={styles.substitutionSection}>
                      <TouchableOpacity
                        style={[
                          styles.substitutionToggle,
                          needsSubstitution && styles.substitutionToggleAlert,
                        ]}
                        onPress={() => toggleSubstitutions(med.id)}
                        accessibilityRole="button"
                      >
                        <View style={styles.subToggleLeft}>
                          <Icon
                            name="sync"
                            size={14}
                            color={needsSubstitution ? colors.status.red : colors.primary.navy}
                          />
                          <Text
                            style={[
                              styles.subToggleTitle,
                              needsSubstitution && { color: colors.status.red, fontWeight: '700' },
                            ]}
                          >
                            {needsSubstitution
                              ? 'Critical/Empty Stock: View Equivalent Salt Substitutes'
                              : `Generic Salt Substitutes (${med.genericSubstitutesList.length})`}
                          </Text>
                        </View>
                        <Icon
                          name={isSubstitutionsExpanded ? 'chevronUp' : 'chevronDown'}
                          size={16}
                          color={colors.slate.gray}
                        />
                      </TouchableOpacity>

                      {isSubstitutionsExpanded && (
                        <View style={styles.substitutesList}>
                          <Text style={styles.subBannerText}>
                            {language === 'mr'
                              ? 'समान रासायनिक फॉर्म्युला असलेले पर्याय:'
                              : 'Clinically equivalent chemical salt alternatives in stock:'}
                          </Text>
                          {med.genericSubstitutesList.map((sub, idx) => (
                            <View key={idx} style={styles.substituteCard}>
                              <View style={styles.subCardInfo}>
                                <Text style={styles.subName}>{sub.name}</Text>
                                <Text style={styles.subGeneric}>
                                  {sub.generic} • {sub.form} {sub.strength}
                                </Text>
                                <Text style={styles.subStock}>
                                  Stock: {sub.stockLevel} units ({sub.status})
                                </Text>
                              </View>
                              <Button
                                title={language === 'mr' ? 'पर्याय वापरा' : 'Select'}
                                variant="outline"
                                size="sm"
                                onPress={() => handleSelectSubstitute(sub.name, med.name)}
                              />
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {/* Action Bar: Reorder Indent Button */}
                  <View style={styles.cardActions}>
                    <Button
                      title={language === 'mr' ? 'पुनर्पुरवठा मागणी नोंदवा' : 'Create Reorder Indent'}
                      variant={needsSubstitution ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => handleOpenIndentModal(med)}
                    />
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Auto-Indent Warehouse Reorder Modal */}
      <Modal
        visible={indentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIndentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {language === 'mr' ? 'गोदाम मागणी पत्र (Indent)' : 'Warehouse Reorder Indent'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Satara District Central Medical Store (NHM)
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIndentModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Icon name="close" size={20} color={colors.slate.dark} />
              </TouchableOpacity>
            </View>

            {activeMedicineForIndent && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
                {/* Read-only Medicine Info */}
                <View style={styles.modalSummaryBox}>
                  <Text style={styles.modalMedName}>{activeMedicineForIndent.name}</Text>
                  <Text style={styles.modalMedCode}>
                    Code: {activeMedicineForIndent.code} • Salt: {activeMedicineForIndent.activeSalt}
                  </Text>
                  <View style={styles.modalStockGrid}>
                    <View style={styles.modalStockItem}>
                      <Text style={styles.modalStockItemLabel}>Current Stock</Text>
                      <Text style={styles.modalStockItemVal}>
                        {activeMedicineForIndent.stockLevel} {activeMedicineForIndent.unit}
                      </Text>
                    </View>
                    <View style={styles.modalStockItem}>
                      <Text style={styles.modalStockItemLabel}>Minimum Buffer</Text>
                      <Text style={styles.modalStockItemVal}>
                        {activeMedicineForIndent.minBuffer} {activeMedicineForIndent.unit}
                      </Text>
                    </View>
                    <View style={styles.modalStockItem}>
                      <Text style={styles.modalStockItemLabel}>Facility Destination</Text>
                      <Text style={styles.modalStockItemVal}>
                        {selectedFacility === 'ALL' ? 'FAC001 (Satara)' : selectedFacility}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Editable Reorder Quantity */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {language === 'mr' ? 'मागणी नग संख्या' : 'Reorder Requisition Quantity'}
                  </Text>
                  <TextInput
                    style={styles.numericInput}
                    keyboardType="numeric"
                    value={reorderQuantity}
                    onChangeText={setReorderQuantity}
                    placeholder="e.g. 500"
                  />
                  <Text style={styles.helperText}>
                    Formula: minBuffer * 2 - currentStock (Statutory 60-day district safety buffer)
                  </Text>
                </View>

                {/* Urgency Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Requisition Urgency Tier</Text>
                  <View style={styles.urgencyRow}>
                    {(['ROUTINE', 'URGENT', 'CRITICAL_EMERGENCY'] as const).map(tier => {
                      const isSel = reorderUrgency === tier;
                      return (
                        <TouchableOpacity
                          key={tier}
                          style={[styles.urgencyPill, isSel && styles.urgencyPillActive]}
                          onPress={() => setReorderUrgency(tier)}
                        >
                          <Text style={[styles.urgencyPillText, isSel && styles.urgencyPillTextActive]}>
                            {tier === 'CRITICAL_EMERGENCY' ? 'CRITICAL' : tier}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Justification FormInput */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Clinical Justification & Notes</Text>
                  <TextInput
                    style={styles.textAreaInput}
                    multiline={true}
                    numberOfLines={3}
                    value={indentJustification}
                    onChangeText={setIndentJustification}
                    placeholder="Enter clinical rationale for indent..."
                  />
                </View>

                {/* Submit Indent Requisition */}
                <View style={styles.modalFooterActions}>
                  <Button
                    title={
                      isSubmittingIndent
                        ? 'Enqueuing...'
                        : language === 'mr'
                        ? 'मागणी पत्र पाठवा'
                        : 'Submit Requisition'
                    }
                    variant="primary"
                    size="lg"
                    loading={isSubmittingIndent}
                    onPress={handleSubmitIndent}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.slate.bg,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  facilitySection: {
    marginBottom: 16,
  },
  sectionHeading: {
    ...textStyles.caption,
    color: colors.slate.gray,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  facilityScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  facilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate.light,
  },
  facilityPillActive: {
    backgroundColor: colors.primary.navy,
    borderColor: colors.primary.navy,
  },
  facilityPillText: {
    ...textStyles.caption,
    color: colors.slate.dark,
    fontWeight: '600',
  },
  facilityPillTextActive: {
    color: colors.white,
  },
  metricsStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.slate.dark,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate.gray,
    marginTop: 2,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate.light,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    ...textStyles.body,
    color: colors.slate.dark,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.slate.light,
  },
  categoryPillActive: {
    backgroundColor: colors.primary.navy,
    borderColor: colors.primary.navy,
  },
  categoryPillWarning: {
    backgroundColor: colors.status.red,
    borderColor: colors.status.red,
  },
  categoryPillText: {
    ...textStyles.caption,
    color: colors.slate.gray,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: colors.white,
  },
  listSection: {
    gap: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listCount: {
    ...textStyles.body,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  facilitySubtitle: {
    ...textStyles.caption,
    color: colors.slate.gray,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    ...textStyles.h3,
    color: colors.slate.dark,
    marginTop: 12,
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.slate.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  medicineCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  codeBadge: {
    backgroundColor: colors.primary.navyLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary.navy,
  },
  formTag: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate.gray,
  },
  medicineName: {
    ...textStyles.h3,
    color: colors.slate.dark,
  },
  genericSubtitle: {
    fontSize: 12,
    color: colors.slate.gray,
    marginTop: 2,
  },
  saltBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.navy,
    marginBottom: 12,
  },
  saltBadgeText: {
    fontSize: 12,
    color: colors.primary.navy,
  },
  saltBold: {
    fontWeight: '700',
  },
  meterContainer: {
    marginBottom: 10,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  meterCurrentText: {
    fontSize: 12,
    color: colors.slate.gray,
  },
  meterCurrentNumber: {
    fontWeight: '700',
    color: colors.slate.dark,
  },
  meterBufferText: {
    fontSize: 11,
    color: colors.slate.muted,
  },
  meterTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  batchStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.slate.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.light,
    marginBottom: 8,
  },
  batchInfo: {
    fontSize: 11,
    color: colors.slate.gray,
  },
  batchVal: {
    fontWeight: '600',
    color: colors.slate.dark,
  },
  indicationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  indicationChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  indicationText: {
    fontSize: 11,
    color: colors.slate.gray,
  },
  substitutionSection: {
    marginTop: 6,
    marginBottom: 10,
  },
  substitutionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.slate.light,
  },
  substitutionToggleAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  subToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  subToggleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.navy,
  },
  substitutesList: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    gap: 8,
  },
  subBannerText: {
    fontSize: 11,
    color: colors.slate.gray,
    fontStyle: 'italic',
  },
  substituteCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.slate.light,
  },
  subCardInfo: {
    flex: 1,
    marginRight: 8,
  },
  subName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  subGeneric: {
    fontSize: 11,
    color: colors.slate.gray,
    marginTop: 2,
  },
  subStock: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.status.green,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate.light,
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    ...textStyles.h3,
    color: colors.slate.dark,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.slate.gray,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalBody: {
    gap: 16,
    paddingBottom: 24,
  },
  modalSummaryBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slate.light,
  },
  modalMedName: {
    ...textStyles.h3,
    fontSize: 15,
    color: colors.slate.dark,
  },
  modalMedCode: {
    fontSize: 12,
    color: colors.slate.gray,
    marginTop: 2,
    marginBottom: 8,
  },
  modalStockGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.slate.light,
    paddingTop: 8,
  },
  modalStockItem: {
    flex: 1,
  },
  modalStockItemLabel: {
    fontSize: 10,
    color: colors.slate.muted,
  },
  modalStockItemVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate.dark,
    marginTop: 2,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    ...textStyles.caption,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  numericInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.slate.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
    color: colors.slate.dark,
    backgroundColor: colors.white,
  },
  helperText: {
    fontSize: 11,
    color: colors.slate.muted,
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyPill: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.slate.light,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  urgencyPillActive: {
    backgroundColor: colors.primary.navy,
    borderColor: colors.primary.navy,
  },
  urgencyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.slate.dark,
  },
  urgencyPillTextActive: {
    color: colors.white,
  },
  textAreaInput: {
    height: 70,
    borderWidth: 1,
    borderColor: colors.slate.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.slate.dark,
    backgroundColor: colors.white,
    textAlignVertical: 'top',
  },
  modalFooterActions: {
    marginTop: 8,
  },
});
