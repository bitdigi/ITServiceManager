/**
 * Reports Screen
 * Displays various reports and analytics
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  Pressable,
  View,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  generateRevenueReport,
  generateTechnicianReport,
  generateProductReport,
  getDashboardStats,
  getAllTickets,
} from '@/lib/reports';
import { RevenueReport, TechnicianReport, ProductReport } from '@/types/ticket';
import {
  generateDailyReportPDF,
  generateTechnicianReportPDF,
  generateProductReportPDF,
} from '@/lib/pdf-export';

type ReportTab = 'revenue' | 'technician' | 'product';

const TRANSLATIONS = {
  title: 'Rapoarte',
  revenue: 'Venituri',
  technician: 'Tehnician',
  product: 'Produse',
  summary: 'Rezumat',
  totalRevenue: 'Venituri Totale',
  totalCost: 'Cost Total',
  profit: 'Profit',
  tickets: 'Fișe',
  averageValue: 'Valoare Medie',
  byProductType: 'Pe Tip de Produs',
  count: 'Număr',
  successRate: 'Rata de Succes',
  avgCost: 'Cost Mediu',
  technicianPerformance: 'Performanță Tehnician',
  totalTickets: 'Total Fișe',
  completed: 'Finalizate',
  completionRate: 'Rata de Finalizare',
  productStatistics: 'Statistici Produs',
  repairs: 'Reparații',
  noData: 'Nu sunt date disponibile',
  refresh: 'ÎMprospătează',
};

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');
  const [loading, setLoading] = useState(true);

  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [technicianReports, setTechnicianReports] = useState<TechnicianReport[]>([]);
  const [productReports, setProductReports] = useState<ProductReport[]>([]);
  const [exporting, setExporting] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const successColor = useThemeColor({}, 'success');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Get date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const [revenue, technicians, products] = await Promise.all([
        generateRevenueReport(startDate.toISOString(), endDate.toISOString()),
        generateTechnicianReport(startDate.toISOString(), endDate.toISOString()),
        generateProductReport(startDate.toISOString(), endDate.toISOString()),
      ]);

      setRevenueReport(revenue);
      setTechnicianReports(technicians);
      setProductReports(products);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDaily = async () => {
    try {
      setExporting(true);
      const tickets = await getAllTickets();
      const result = await generateDailyReportPDF(tickets, new Date().toISOString());
      if (result.success) {
        Alert.alert('Succes', 'Raportul zilei a fost exportat cu succes!');
      } else {
        Alert.alert('Eroare', result.error || 'Eroare la export');
      }
    } catch (error) {
      Alert.alert('Eroare', error instanceof Error ? error.message : 'Eroare la export');
    } finally {
      setExporting(false);
    }
  };

  const handleExportTechnician = async (technicianName: string) => {
    try {
      setExporting(true);
      const tickets = await getAllTickets();
      const result = await generateTechnicianReportPDF(tickets, technicianName);
      if (result.success) {
        Alert.alert('Succes', `Raportul pentru ${technicianName} a fost exportat cu succes!`);
      } else {
        Alert.alert('Eroare', result.error || 'Eroare la export');
      }
    } catch (error) {
      Alert.alert('Eroare', error instanceof Error ? error.message : 'Eroare la export');
    } finally {
      setExporting(false);
    }
  };

  const handleExportProduct = async (productType: string) => {
    try {
      setExporting(true);
      const tickets = await getAllTickets();
      const result = await generateProductReportPDF(tickets, productType);
      if (result.success) {
        Alert.alert('Succes', `Raportul pentru ${productType} a fost exportat cu succes!`);
      } else {
        Alert.alert('Eroare', result.error || 'Eroare la export');
      }
    } catch (error) {
      Alert.alert('Eroare', error instanceof Error ? error.message : 'Eroare la export');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 20),
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">{TRANSLATIONS.title}</ThemedText>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { borderColor }]}>
        {(['revenue', 'technician', 'product'] as ReportTab[]).map(tab => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              {
                borderBottomColor: activeTab === tab ? tintColor : 'transparent',
                borderBottomWidth: activeTab === tab ? 2 : 0,
              },
            ]}
          >
            <ThemedText
              style={{
                color: activeTab === tab ? tintColor : secondaryTextColor,
                fontWeight: activeTab === tab ? '600' : '400',
              }}
            >
              {tab === 'revenue' ? TRANSLATIONS.revenue : tab === 'technician' ? TRANSLATIONS.technician : TRANSLATIONS.product}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'revenue' && revenueReport && (
            <RevenueReportView report={revenueReport} onExport={handleExportDaily} />
          )}

          {activeTab === 'technician' && (
            <TechnicianReportView reports={technicianReports} onExport={handleExportTechnician} />
          )}

          {activeTab === 'product' && (
            <ProductReportView reports={productReports} onExport={handleExportProduct} />
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={loadReports}
          disabled={exporting}
          style={[styles.actionButton, { backgroundColor: tintColor, opacity: exporting ? 0.6 : 1 }]}
        >
          <ThemedText style={{ color: '#fff', fontWeight: '600' }}>{TRANSLATIONS.refresh}</ThemedText>
        </Pressable>
        {activeTab === 'revenue' && (
          <Pressable
            onPress={handleExportDaily}
            disabled={exporting}
            style={[styles.actionButton, { backgroundColor: tintColor, opacity: exporting ? 0.6 : 1 }]}
          >
            {exporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Export PDF</ThemedText>
            )}
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

function RevenueReportView({ report, onExport }: { report: RevenueReport; onExport?: () => void }) {
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const successColor = useThemeColor({}, 'success');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.reportSection}>
      <ThemedText type="subtitle">{TRANSLATIONS.summary}</ThemedText>

      <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
        <View style={styles.statRow}>
          <ThemedText style={{ color: secondaryTextColor }}>{TRANSLATIONS.totalRevenue}</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ color: successColor, fontSize: 18 }}>
            {report.totalRevenue.toFixed(2)} RON
          </ThemedText>
        </View>
        <View style={[styles.statRow, { borderTopWidth: 1, borderTopColor: borderColor }]}>
          <ThemedText style={{ color: secondaryTextColor }}>{TRANSLATIONS.totalCost}</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
            {report.totalCost.toFixed(2)} RON
          </ThemedText>
        </View>
        <View style={[styles.statRow, { borderTopWidth: 1, borderTopColor: borderColor }]}>
          <ThemedText style={{ color: secondaryTextColor }}>{TRANSLATIONS.profit}</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ color: successColor, fontSize: 16 }}>
            {report.totalProfit.toFixed(2)} RON
          </ThemedText>
        </View>
        <View style={[styles.statRow, { borderTopWidth: 1, borderTopColor: borderColor }]}>
          <ThemedText style={{ color: secondaryTextColor }}>{TRANSLATIONS.tickets}</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
            {report.ticketCount}
          </ThemedText>
        </View>
        <View style={[styles.statRow, { borderTopWidth: 1, borderTopColor: borderColor }]}>
          <ThemedText style={{ color: secondaryTextColor }}>{TRANSLATIONS.averageValue}</ThemedText>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>
            {report.averageTicketValue.toFixed(2)} RON
          </ThemedText>
        </View>
      </View>

      {Object.keys(report.byProductType).length > 0 && (
        <>
          <ThemedText type="subtitle" style={{ marginTop: 20 }}>
            {TRANSLATIONS.byProductType}
          </ThemedText>
          {Object.entries(report.byProductType).map(([type, data]) => (
            <View key={type} style={[styles.productCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </ThemedText>
            <View style={styles.productRow}>
              <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.count}:</ThemedText>
              <ThemedText style={{ fontWeight: '500', fontSize: 12 }}>{data.count}</ThemedText>
            </View>
            <View style={styles.productRow}>
              <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.totalRevenue}:</ThemedText>
              <ThemedText style={{ fontWeight: '500', fontSize: 12 }}>
                {data.revenue.toFixed(2)} RON
              </ThemedText>
            </View>
            <View style={styles.productRow}>
              <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.profit}:</ThemedText>
              <ThemedText style={{ fontWeight: '500', fontSize: 12, color: successColor }}>
                {data.profit.toFixed(2)} RON
              </ThemedText>
            </View>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

function TechnicianReportView({ reports, onExport }: { reports: TechnicianReport[]; onExport?: (name: string) => void }) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const successColor = useThemeColor({}, 'success');

  if (reports.length === 0) {
    return (
      <View style={styles.reportSection}>
        <ThemedText style={{ textAlign: 'center', color: secondaryTextColor }}>
          {TRANSLATIONS.noData}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.reportSection}>
      <ThemedText type="subtitle">{TRANSLATIONS.technicianPerformance}</ThemedText>
      {reports.map((report, index) => (
        <View
          key={index}
          style={[styles.technicianCard, { backgroundColor: surfaceColor, borderColor }]}
        >
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
            {report.technicianName}
          </ThemedText>
          <View style={styles.techRow}>
            <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.totalTickets}:</ThemedText>
            <ThemedText style={{ fontWeight: '500', fontSize: 12 }}>
              {report.ticketCount}
            </ThemedText>
          </View>
          <View style={styles.techRow}>
            <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.completed}:</ThemedText>
            <ThemedText style={{ fontWeight: '500', fontSize: 12, color: successColor }}>
              {report.completedCount}
            </ThemedText>
          </View>
          <View style={styles.techRow}>
            <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.completionRate}:</ThemedText>
            <ThemedText style={{ fontWeight: '500', fontSize: 12 }}>
              {(report.completionRate * 100).toFixed(0)}%
            </ThemedText>
          </View>
          <View style={styles.techRow}>
            <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.totalRevenue}:</ThemedText>
            <ThemedText style={{ fontWeight: '500', fontSize: 12 }}>
              {report.totalRevenue.toFixed(2)} RON
            </ThemedText>
          </View>
          <View style={styles.techRow}>
            <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.averageValue}:</ThemedText>
            <ThemedText style={{ fontWeight: '500', fontSize: 12 }}>
              {report.averageTicketValue.toFixed(2)} RON
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

function ProductReportView({ reports, onExport }: { reports: ProductReport[]; onExport?: (type: string) => void }) {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  if (reports.length === 0) {
    return (
      <View style={styles.reportSection}>
        <ThemedText style={{ textAlign: 'center', color: secondaryTextColor }}>
          {TRANSLATIONS.noData}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.reportSection}>
      <ThemedText type="subtitle">{TRANSLATIONS.productStatistics}</ThemedText>
      {reports.map((report, index) => (
        <View
          key={index}
          style={[styles.productCard, { backgroundColor: surfaceColor, borderColor }]}
        >
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
            {report.productType.charAt(0).toUpperCase() + report.productType.slice(1)}
          </ThemedText>
          <View style={styles.productRow}>
            <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.repairs}:</ThemedText>
            <ThemedText style={{ fontWeight: '500', fontSize: 12 }}>
              {report.repairCount}
            </ThemedText>
          </View>
          <View style={styles.productRow}>
            <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.successRate}:</ThemedText>
            <ThemedText style={{ fontWeight: '500', fontSize: 12 }}>
              {(report.failureRate * 100).toFixed(0)}%
            </ThemedText>
          </View>
          <View style={styles.productRow}>
            <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.avgCost}:</ThemedText>
            <ThemedText style={{ fontWeight: '500', fontSize: 12 }}>
              {report.averageCost.toFixed(2)} RON
            </ThemedText>
          </View>
          <View style={styles.productRow}>
            <ThemedText style={{ color: secondaryTextColor, fontSize: 12 }}>{TRANSLATIONS.totalRevenue}:</ThemedText>
            <ThemedText style={{ fontWeight: '500', fontSize: 12 }}>
              {report.totalRevenue.toFixed(2)} RON
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 16,
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportSection: {
    marginBottom: 20,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  productCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  technicianCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  refreshButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
