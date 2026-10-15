import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://119.59.102.161:3025/api';

interface User {
  user_id?: number;
  username: string;
  role?: string;
}

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: User) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔑 เข้าสู่ระบบ
  const handleLogin = async () => {
    const trimmedUsername = usernameInput.trim();
    const trimmedPassword = passwordInput.trim();

    if (!trimmedUsername || !trimmedPassword) {
      showAlert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showAlert('Success', 'Login successful!');
        onLoginSuccess(
          data.token || 'mock-jwt-token',
          data.user || { username: trimmedUsername, role: 'admin' }
        );
      } else {
        showAlert('Login Failed', data.message || data.error || 'Invalid credentials');
      }
    } catch (error) {
      showAlert('Error', 'Cannot connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  // 📝 สมัครสมาชิกใหม่
  const handleRegister = async () => {
    const trimmedUsername = usernameInput.trim();
    const trimmedPassword = passwordInput.trim();
    const trimmedConfirm = confirmPasswordInput.trim();

    if (!trimmedUsername || !trimmedPassword || !trimmedConfirm) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUsername, password: trimmedPassword, role: 'user' }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showAlert('Success', 'Account created successfully! Please log in.');
        setIsRegisterMode(false);
        setPasswordInput('');
        setConfirmPasswordInput('');
      } else {
        showAlert('Registration Failed', data.message || 'Could not create account');
      }
    } catch (error) {
      showAlert('Error', 'Cannot connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <View style={styles.loginCard}>
        {/* Top Logo Badge */}
        <View style={styles.logoBadge}>
          <Text style={{ fontSize: 32 }}>{isRegisterMode ? '📝' : '⚡'}</Text>
        </View>

        <Text style={styles.loginTitle}>
          {isRegisterMode ? 'Create Account' : 'HR Manager System'}
        </Text>
        <Text style={styles.loginSubTitle}>
          {isRegisterMode
            ? 'Sign up to register a new user'
            : 'Sign in to access HR & Salary Analytics Console'}
        </Text>

        {/* Username Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. admin"
            placeholderTextColor="#64748B"
            value={usernameInput}
            onChangeText={setUsernameInput}
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#64748B"
            value={passwordInput}
            onChangeText={setPasswordInput}
            secureTextEntry
          />
        </View>

        {/* Confirm Password Input (เฉพาะโหมด Register) */}
        {isRegisterMode && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#64748B"
              value={confirmPasswordInput}
              onChangeText={setConfirmPasswordInput}
              secureTextEntry
            />
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.mainBtn, loading && { opacity: 0.7 }]}
          onPress={isRegisterMode ? handleRegister : handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.mainBtnText}>
              {isRegisterMode ? 'Register Now' : 'Authenticate'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Toggle Switch between Login & Register */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>
            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsRegisterMode(!isRegisterMode);
              setConfirmPasswordInput('');
            }}
          >
            <Text style={styles.toggleBtnText}>
              {isRegisterMode ? 'Sign In' : 'Create One'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 🎨 DARK THEME STYLES
const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loginCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#312E81',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 4,
  },
  loginSubTitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#F8FAFC',
  },
  mainBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  mainBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 6,
  },
  toggleText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  toggleBtnText: {
    color: '#818CF8',
    fontSize: 13,
    fontWeight: '700',
  },
});