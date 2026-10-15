import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://119.59.102.161:3025/api';

interface Employee {
  id: string | number;
  name: string;
  position: string;
  status: 'Active' | 'On Leave';
  salary: number;
}

interface SalaryCluster {
  group: string;
  centroid: number;
  count: number;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [salary, setSalary] = useState<string>('');

  const [clusters, setClusters] = useState<SalaryCluster[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchEmployees();
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showAlert('Error', 'Please enter Username and Password');
      return;
    }

    setLoginLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
      } else {
        showAlert('Authentication Failed', 'Invalid username or password');
      }
    } catch (error) {
      showAlert('Connection Error', 'Cannot connect to backend server');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setEmployees([]);
    setClusters([]);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/employees`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (error: any) {
      console.error('Fetch Employees Error:', error);
      showAlert('Fetch Error', `Failed to load employees: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!name.trim() || !position.trim() || !salary.trim()) {
      showAlert('Validation Error', 'Please complete all employee fields');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          position: position.trim(),
          salary: Number(salary),
        }),
      });

      if (response.ok) {
        setName('');
        setPosition('');
        setSalary('');
        fetchEmployees();
        showAlert('Success', '✨ New employee record created in MySQL!');
      }
    } catch (error: any) {
      console.error('Add Employee Error:', error);
    }
  };

  const handleToggleStatus = async (id: string | number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}/status`, {
        method: 'PUT',
      });
      if (response.ok) fetchEmployees();
    } catch (error) {
      console.error('Toggle Error:', error);
    }
  };

  const executeDelete = async (id: string | number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) fetchEmployees();
    } catch (error) {
      console.error('Delete Error:', error);
    }
  };

  const handleDeleteEmployee = (id: string | number) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('⚠️ Are you sure you want to delete this employee record?');
      if (confirmed) executeDelete(id);
    } else {
      Alert.alert('Confirm Deletion', 'Are you sure you want to delete this employee?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => executeDelete(id) },
      ]);
    }
  };

  const handleAnalyzeSalary = async () => {
    setLoadingAnalytics(true);
    setClusters([]);
    try {
      const response = await fetch(`${API_BASE_URL}/employees/salary-clusters`);
      const data = await response.json();
      if (data.success && Array.isArray(data.clusters)) {
        setClusters(data.clusters);
      }
    } catch (error: any) {
      console.error('Analytics Error:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  // -------------------------------------------------------------
  // 🔐 SCREEN 1: ULTRA-DARK LOGIN UI
  // -------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.loginWrapper}>
        <View style={styles.loginGlowBg} />
        <View style={styles.loginCard}>
          <View style={styles.logoBadge}>
            <Text style={{ fontSize: 32 }}>⚡</Text>
          </View>

          <Text style={styles.loginTitle}>HR Executive Console</Text>
          <Text style={styles.loginSubTitle}>Nawaphat_Niemsri Analytics System</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>USERNAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. admin"
              placeholderTextColor="#475569"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loginLoading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>AUTHENTICATE SYSTEM</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // 📊 SCREEN 2: CYBER DARK DASHBOARD UI
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <View style={styles.navLogo}>
            <Text style={{ fontSize: 20 }}>💎</Text>
          </View>
          <View>
            <Text style={styles.navTitle}>Nawaphat_Niemsri</Text>
            <Text style={styles.navSubTitle}>HR Management & K-Means Analytics</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Add Employee Form */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>✨</Text>
              <Text style={styles.cardHeaderTitle}>Add Personnel Record</Text>
            </View>
            <Text style={styles.cardHeaderSub}>Create real-time entries directly into MySQL Database</Text>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.textInput}
                placeholder="John Doe"
                placeholderTextColor="#475569"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>POSITION</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Software Engineer"
                placeholderTextColor="#475569"
                value={position}
                onChangeText={setPosition}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>MONTHLY SALARY (THB)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="45000"
              placeholderTextColor="#475569"
              value={salary}
              onChangeText={setSalary}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleAddEmployee}>
            <Text style={styles.primaryBtnText}>+ SAVE EMPLOYEE TO DATABASE</Text>
          </TouchableOpacity>
        </View>

        {/* Section 2: Salary Analytics (K-Means) */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>🚀</Text>
              <Text style={styles.cardHeaderTitle}>Salary Structure Analytics</Text>
            </View>
            <Text style={styles.cardHeaderSub}>Automated 1D K-Means Clustering Tiering Algorithm</Text>
          </View>

          <TouchableOpacity style={styles.analyticsBtn} onPress={handleAnalyzeSalary}>
            <Text style={styles.analyticsBtnText}>⚡ RUN K-MEANS CLUSTERING</Text>
          </TouchableOpacity>

          {loadingAnalytics && (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loaderText}>Computing salary centroids and variance...</Text>
            </View>
          )}

          {clusters.length > 0 && (
            <View style={styles.clusterGrid}>
              {clusters.map((tier, idx) => {
                const tierColor = getTierColor(idx);
                return (
                  <View key={idx} style={[styles.clusterBox, { borderColor: tierColor + '40' }]}>
                    <View style={[styles.clusterGlowBar, { backgroundColor: tierColor }]} />
                    <View style={styles.clusterContent}>
                      <View style={styles.clusterHeader}>
                        <Text style={[styles.clusterTierName, { color: tierColor }]}>{tier.group}</Text>
                        <View style={[styles.badgeCount, { backgroundColor: tierColor + '20' }]}>
                          <Text style={[styles.badgeCountText, { color: tierColor }]}>
                            {tier.count} Staffs
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.clusterCentroidLabel}>Centroid Average Salary</Text>
                      <Text style={styles.clusterCentroidValue}>฿{tier.centroid.toLocaleString()}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Section 3: Employee Directory */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Employee Directory</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{employees.length} Records Active</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : employees.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📁</Text>
            <Text style={styles.emptyTitle}>No Employee Records Found</Text>
            <Text style={styles.emptyText}>Add your first employee entry using the form above.</Text>
          </View>
        ) : (
          employees.map((emp) => {
            const isActive = emp.status === 'Active';
            return (
              <View key={emp.id} style={styles.empCard}>
                <View style={styles.empAvatar}>
                  <Text style={styles.avatarText}>{emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}</Text>
                </View>

                <View style={styles.empInfo}>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <Text style={styles.empPos}>{emp.position}</Text>
                  <Text style={styles.empSalary}>฿{Number(emp.salary).toLocaleString()}</Text>

                  <View style={[styles.statusPill, isActive ? styles.statusActive : styles.statusLeave]}>
                    <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : '#F59E0B' }]} />
                    <Text style={[styles.statusText, { color: isActive ? '#34D399' : '#FBBF24' }]}>
                      {emp.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionCol}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.toggleBtn]}
                    onPress={() => handleToggleStatus(emp.id)}
                  >
                    <Text style={styles.toggleBtnText}>Toggle</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDeleteEmployee(emp.id)}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getTierColor(index: number) {
  const colors = ['#10B981', '#3B82F6', '#8B5CF6'];
  return colors[index % colors.length];
}

// -------------------------------------------------------------
// 🎨 ULTRA-DARK CYBER THEME STYLESHEET
// -------------------------------------------------------------
const styles = StyleSheet.create({
  loginWrapper: {
    flex: 1,
    backgroundColor: '#050811',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loginGlowBg: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#6366F1',
    opacity: 0.15,
    top: '30%',
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0D1527',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1E293B',
    ...Platform.select({
      web: { boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' },
      default: { elevation: 8 },
    }),
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  loginSubTitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
  },

  // Main Layout
  container: {
    flex: 1,
    backgroundColor: '#050811',
  },
  navbar: {
    backgroundColor: '#0D1527',
    paddingHorizontal: 24,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  navLogo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  navTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  navSubTitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#7F1D1D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#991B1B',
  },
  logoutButtonText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  mainContent: {
    padding: 20,
    maxWidth: 850,
    width: '100%',
    alignSelf: 'center',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#0D1527',
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardHeader: {
    marginBottom: 18,
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  cardHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  // Form Controls
  formRow: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: '#050811',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#F8FAFC',
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Analytics K-Means
  analyticsBtn: {
    backgroundColor: '#059669',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  analyticsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  loaderBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  clusterGrid: {
    marginTop: 18,
    gap: 12,
  },
  clusterBox: {
    backgroundColor: '#050811',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  clusterGlowBar: {
    width: 6,
  },
  clusterContent: {
    flex: 1,
    padding: 16,
  },
  clusterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clusterTierName: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  badgeCount: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  clusterCentroidLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  clusterCentroidValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    marginTop: 2,
  },

  // Directory List
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  totalBadge: {
    backgroundColor: '#1E1B4B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A5B4FC',
  },

  empCard: {
    backgroundColor: '#0D1527',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 16,
  },
  empAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#818CF8',
  },
  empInfo: {
    flex: 1,
  },
  empName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  empPos: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  empSalary: {
    fontSize: 14,
    fontWeight: '900',
    color: '#34D399',
    marginBottom: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 6,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusLeave: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // Action Buttons
  actionCol: {
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleBtn: {
    backgroundColor: '#1E293B',
  },
  toggleBtnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  deleteBtnText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#0D1527',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
});