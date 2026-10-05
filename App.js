import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('calc');
  const [calcTab, setCalcTab] = useState(1);

  const [display1, setDisplay1] = useState('0');
  const [display2, setDisplay2] = useState('0');

  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [recordName, setRecordName] = useState('');
  const [items, setItems] = useState([
    { name: '', qty: '', unit: 'ကျပ်သား', price: '' }
  ]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const data = await AsyncStorage.getItem('@namecalc_records');
      if (data) setRecords(JSON.parse(data));
    } catch (e) {
      console.error(e);
    }
  };

  const saveToStorage = async (newRecords) => {
    try {
      await AsyncStorage.setItem('@namecalc_records', JSON.stringify(newRecords));
      setRecords(newRecords);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePress = (val) => {
    const setDisplay = calcTab === 1 ? setDisplay1 : setDisplay2;
    const current = calcTab === 1 ? display1 : display2;

    if (val === 'AC') {
      setDisplay('0');
    } else if (val === 'DEL') {
      if (current.length > 1) {
        setDisplay(current.slice(0, -1));
      } else {
        setDisplay('0');
      }
    } else if (val === '=') {
      try {
        const sanitized = current.replace(/×/g, '*').replace(/÷/g, '/');
        const res = Function(`'use strict'; return (${sanitized})`)();
        setDisplay(String(res));
      } catch (err) {
        setDisplay('Error');
      }
    } else {
      if (current === '0' || current === 'Error') {
        setDisplay(val);
      } else {
        setDisplay(current + val);
      }
    }
  };

  const addItemRow = () => {
    if (items.length >= 20) return;
    setItems([...items, { name: '', qty: '', unit: 'ကျပ်သား', price: '' }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const calculateItemTotal = (item) => {
    const q = parseFloat(item.qty) || 0;
    const p = parseFloat(item.price) || 0;
    if (item.unit === 'ကျပ်သား') {
      return (q / 100) * p;
    }
    return q * p;
  };

  const modalTotal = items.reduce((sum, it) => sum + calculateItemTotal(it), 0);

  const handleSaveRecord = () => {
    if (!recordName.trim()) {
      Alert.alert('အသိပေးချက်', 'အမည်တပ်ပေးပါ');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const newRecord = {
      id: Date.now().toString(),
      title: recordName,
      date: today,
      items: items.filter(it => it.name.trim() !== ''),
      total: modalTotal > 0 ? modalTotal : parseFloat(calcTab === 1 ? display1 : display2) || 0
    };

    const updated = [newRecord, ...records];
    saveToStorage(updated);
    setModalVisible(false);
    setRecordName('');
    setItems([{ name: '', qty: '', unit: 'ကျပ်သား', price: '' }]);
  };

  const deleteRecord = (id) => {
    const updated = records.filter(r => r.id !== id);
    saveToStorage(updated);
  };

  const filteredRecords = records.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDashboardSum = records.reduce((s, r) => s + (r.total || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topHeader}>
        <Text style={styles.brandTitle}>NameCalc</Text>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'calc' ? (
          <View>
            <View style={styles.titleRow}>
              <View>
                <Text style={styles.headerTitle}>Super Calculator</Text>
                <Text style={styles.headerSub}>နာမည်တပ်ပြီး တွက်ချက်မှုတွေ သိမ်းထားပါ</Text>
              </View>
            </View>

            <View style={styles.calcTabs}>
              <TouchableOpacity
                style={[styles.calcTabBtn, calcTab === 1 && styles.calcTabBtnActive]}
                onPress={() => setCalcTab(1)}
              >
                <Text style={[styles.calcTabText, calcTab === 1 && styles.calcTabTextActive]}>တွက်စက် ၁</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.calcTabBtn, calcTab === 2 && styles.calcTabBtnActive]}
                onPress={() => setCalcTab(2)}
              >
                <Text style={[styles.calcTabText, calcTab === 2 && styles.calcTabTextActive]}>တွက်စက် ၂</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.displayCard}>
              <Text style={styles.displaySub}>အသစ်တွက်မယ်</Text>
              <Text style={styles.displayText}>{calcTab === 1 ? display1 : display2}</Text>
            </View>

            <View style={styles.keypad}>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.key, styles.keyGray]} onPress={() => handlePress('AC')}><Text style={styles.keyText}>AC</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.key, styles.keyGray]} onPress={() => handlePress('DEL')}><Text style={styles.keyText}>⌫</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.key, styles.keyGray]} onPress={() => handlePress('%')}><Text style={styles.keyText}>%</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.key, styles.keyBlue]} onPress={() => handlePress('÷')}><Text style={styles.keyTextWhite}>÷</Text></TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('7')}><Text style={styles.keyText}>7</Text></TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('8')}><Text style={styles.keyText}>8</Text></TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('9')}><Text style={styles.keyText}>9</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.key, styles.keyBlue]} onPress={() => handlePress('×')}><Text style={styles.keyTextWhite}>×</Text></TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('4')}><Text style={styles.keyText}>4</Text></TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('5')}><Text style={styles.keyText}>5</Text></TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('6')}><Text style={styles.keyText}>6</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.key, styles.keyBlue]} onPress={() => handlePress('-')}><Text style={styles.keyTextWhite}>-</Text></TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('1')}><Text style={styles.keyText}>1</Text></TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('2')}><Text style={styles.keyText}>2</Text></TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('3')}><Text style={styles.keyText}>3</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.key, styles.keyBlue]} onPress={() => handlePress('+')}><Text style={styles.keyTextWhite}>+</Text></TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={[styles.key, { flex: 2 }]} onPress={() => handlePress('0')}><Text style={styles.keyText}>0</Text></TouchableOpacity>
                <TouchableOpacity style={styles.key} onPress={() => handlePress('.')}><Text style={styles.keyText}>.</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.key, styles.keyOrange]} onPress={() => handlePress('=')}><Text style={styles.keyTextWhite}>=</Text></TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>သိမ်းထားတာများ</Text>
                <Text style={styles.sectionSub}>အမည်နဲ့ ပြန်ရှာပြီး အသုံးပြုနိုင်ပါတယ်</Text>
              </View>
              <TouchableOpacity style={styles.addRecordBtn} onPress={() => setModalVisible(true)}>
                <Text style={styles.addRecordBtnText}>+ စာရင်းသွင်း</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchBar}
              placeholder="သိမ်းထားတဲ့နာမည်ကို ရှာပါ"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {filteredRecords.map((item) => (
              <View key={item.id} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordTitle}>{item.title}</Text>
                  <Text style={styles.recordDate}>{item.date}</Text>
                </View>
                {item.items && item.items.map((it, idx) => (
                  <Text key={idx} style={styles.recordItemLine}>
                    {it.name} {it.qty} {it.unit} × {it.price} = {calculateItemTotal(it).toLocaleString()}
                  </Text>
                ))}
                <View style={styles.recordFooter}>
                  <Text style={styles.recordTotalLabel}>စုစုပေါင်း</Text>
                  <Text style={styles.recordTotal}>{Number(item.total).toLocaleString()}</Text>
                  <TouchableOpacity onPress={() => deleteRecord(item.id)}>
                    <Text style={styles.deleteBtn}>ဖျက်ရန်</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSub}>ရက်စွဲအလိုက် စုစုပေါင်းစာရင်း</Text>

            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#4F46E5' }]}>
                <Text style={styles.statBoxTitle}>စုစုပေါင်း (Total Sum)</Text>
                <Text style={styles.statBoxNum}>{totalDashboardSum.toLocaleString()}</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#F3F4F6' }]}>
                <Text style={[styles.statBoxTitle, { color: '#6B7280' }]}>စာရင်း အရေအတွက်</Text>
                <Text style={[styles.statBoxNum, { color: '#111827' }]}>{records.length}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('calc')}
        >
          <Text style={[styles.navText, activeTab === 'calc' && styles.navTextActive]}>တွက်စက်</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.navText, activeTab === 'dashboard' && styles.navTextActive]}>Dashboard</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>တွက်ချက်မှုကို အမည်တပ်ပါ</Text>
            <TextInput
              style={styles.input}
              placeholder="ဥပမာ - စိန်ဝင်းဒေါ်လာ"
              value={recordName}
              onChangeText={setRecordName}
            />

            <ScrollView style={{ maxHeight: 240 }}>
              {items.map((it, idx) => (
                <View key={idx} style={styles.itemBox}>
                  <TextInput
                    style={styles.input}
                    placeholder="ပစ္စည်းအမည် (ဥပမာ - ကြက်သွန်)"
                    value={it.name}
                    onChangeText={(v) => updateItem(idx, 'name', v)}
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 6 }]}
                      placeholder="အရေအတွက်"
                      keyboardType="numeric"
                      value={it.qty}
                      onChangeText={(v) => updateItem(idx, 'qty', v)}
                    />
                    <TouchableOpacity
                      style={styles.unitBtn}
                      onPress={() => updateItem(idx, 'unit', it.unit === 'ကျပ်သား' ? 'ပိဿာ' : 'ကျပ်သား')}
                    >
                      <Text style={styles.unitBtnText}>{it.unit}</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.input, { flex: 1, marginLeft: 6 }]}
                      placeholder="တစ်ခုဈေးနှုန်း"
                      keyboardType="numeric"
                      value={it.price}
                      onChangeText={(v) => updateItem(idx, 'price', v)}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.addMoreBtn} onPress={addItemRow}>
              <Text style={styles.addMoreBtnText}>+ ပစ္စည်းထပ်ထည့်</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>မလုပ်တော့ပါ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveRecord}>
                <Text style={styles.confirmBtnText}>သိမ်းဆည်းမည်</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  topHeader: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderColor: '#E5E7EB' },
  brandTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  content: { padding: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  headerSub: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  calcTabs: { flexDirection: 'row', marginTop: 16, backgroundColor: '#E5E7EB', borderRadius: 12, padding: 4 },
  calcTabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  calcTabBtnActive: { backgroundColor: '#4F46E5' },
  calcTabText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  calcTabTextActive: { color: '#FFFFFF' },
  displayCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginTop: 16, elevation: 1 },
  displaySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'right' },
  displayText: { fontSize: 40, fontWeight: 'bold', textAlign: 'right', marginTop: 8, color: '#111827' },
  keypad: { marginTop: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  key: { flex: 1, height: 60, backgroundColor: '#FFFFFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, elevation: 1 },
  keyGray: { backgroundColor: '#E5E7EB' },
  keyBlue: { backgroundColor: '#4F46E5' },
  keyOrange: { backgroundColor: '#EA580C' },
  keyText: { fontSize: 22, fontWeight: '600', color: '#1F2937' },
  keyTextWhite: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  sectionSub: { fontSize: 12, color: '#6B7280' },
  addRecordBtn: { backgroundColor: '#EA580C', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addRecordBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  searchBar: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, marginBottom: 16 },
  recordCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  recordTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  recordDate: { fontSize: 12, color: '#9CA3AF' },
  recordItemLine: { fontSize: 13, color: '#4B5563', marginVertical: 2 },
  recordFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F3F4F6', paddingTop: 8, marginTop: 8 },
  recordTotalLabel: { fontSize: 12, color: '#6B7280' },
  recordTotal: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5' },
  deleteBtn: { color: '#EF4444', fontSize: 12 },
  statsRow: { flexDirection: 'row', marginTop: 16, gap: 12 },
  statBox: { flex: 1, padding: 16, borderRadius: 14 },
  statBoxTitle: { fontSize: 12, color: '#E0E7FF' },
  statBoxNum: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8 },
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingVertical: 12 },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { fontSize: 13, color: '#6B7280' },
  navTextActive: { color: '#4F46E5', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 14, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginVertical: 6 },
  itemBox: { backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8, marginBottom: 8 },
  unitBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, justifyContent: 'center', borderRadius: 8, marginVertical: 6 },
  unitBtnText: { color: '#4F46E5', fontWeight: 'bold', fontSize: 12 },
  addMoreBtn: { paddingVertical: 8, alignItems: 'center' },
  addMoreBtnText: { color: '#4F46E5', fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  cancelBtn: { flex: 1, padding: 12, alignItems: 'center', marginRight: 8 },
  cancelBtnText: { color: '#6B7280' },
  confirmBtn: { flex: 1, backgroundColor: '#EA580C', padding: 12, alignItems: 'center', borderRadius: 8 },
  confirmBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
});
