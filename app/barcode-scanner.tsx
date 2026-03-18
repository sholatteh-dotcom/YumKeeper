import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { FOOD_SUGGESTIONS, BARCODE_LOOKUP } from '@/lib/food-data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCAN_BOX_SIZE = SCREEN_WIDTH * 0.7;

export default function BarcodeScannerScreen() {
  const colors = useColors();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackEmoji}>📷</Text>
          <Text style={[styles.webFallbackTitle, { color: colors.foreground }]}>
            Camera Not Available
          </Text>
          <Text style={[styles.webFallbackText, { color: colors.muted }]}>
            Barcode scanning requires the mobile app. Use the Expo Go app to scan barcodes on your device.
          </Text>
          <TouchableOpacity
            style={[styles.webFallbackBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.webFallbackBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <Text style={[styles.permText, { color: colors.muted }]}>Loading camera...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!permission.granted) {
    return (
      <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.permContainer}>
          <Text style={styles.permEmoji}>📷</Text>
          <Text style={[styles.permTitle, { color: colors.foreground }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permText, { color: colors.muted }]}>
            YumKeeper needs camera access to scan product barcodes and auto-fill food details.
          </Text>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permBtnText}>Allow Camera Access</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.permCancelBtn}>
            <Text style={[styles.permCancelText, { color: colors.muted }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned || data === lastScan) return;
    setScanned(true);
    setLastScan(data);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Look up barcode in our database
    const match = BARCODE_LOOKUP[data];
    if (match) {
      // Found in local database — navigate back with params
      router.replace({
        pathname: '/add-item' as any,
        params: {
          prefillName: match.name,
          prefillCategory: match.category,
          prefillDays: String(match.defaultDays),
          prefillEmoji: match.emoji,
        },
      });
    } else {
      // Try to match by barcode prefix / common patterns
      const genericName = guessFromBarcode(data);
      router.replace({
        pathname: '/add-item' as any,
        params: {
          prefillName: genericName,
          prefillBarcode: data,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Top bar */}
        <View style={[styles.topBar, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <IconSymbol name="xmark" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Scan Barcode</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Scan window */}
        <View style={styles.scanArea}>
          <View style={[styles.darkOverlay, { height: (SCREEN_WIDTH - SCAN_BOX_SIZE) / 2 }]} />
          <View style={styles.scanRow}>
            <View style={[styles.darkOverlay, { width: (SCREEN_WIDTH - SCAN_BOX_SIZE) / 2 }]} />
            <View style={styles.scanBox}>
              {/* Corner markers */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              {/* Scan line animation placeholder */}
              <View style={styles.scanLine} />
            </View>
            <View style={[styles.darkOverlay, { width: (SCREEN_WIDTH - SCAN_BOX_SIZE) / 2 }]} />
          </View>
          <View style={[styles.darkOverlay, { flex: 1 }]} />
        </View>

        {/* Bottom instructions */}
        <View style={[styles.bottomBar, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <Text style={styles.instructionText}>
            {scanned ? '✅ Barcode detected! Loading...' : 'Point your camera at a product barcode'}
          </Text>
          {scanned && (
            <TouchableOpacity
              style={styles.rescanBtn}
              onPress={() => { setScanned(false); setLastScan(null); }}
            >
              <Text style={styles.rescanText}>Scan Again</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.supportedText}>
            Supports EAN-13, EAN-8, UPC-A, UPC-E, Code 128, QR
          </Text>
        </View>
      </View>
    </View>
  );
}

function guessFromBarcode(barcode: string): string {
  // Try to find a partial match from food suggestions
  const words = FOOD_SUGGESTIONS.map(f => f.name);
  // Return empty so user can type manually
  return '';
}

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
  },
  closeBtn: { padding: 6 },
  topBarTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  scanArea: { flex: 1 },
  scanRow: { flexDirection: 'row', height: SCAN_BOX_SIZE },
  darkOverlay: { backgroundColor: 'rgba(0,0,0,0.55)' },
  scanBox: {
    width: SCAN_BOX_SIZE,
    height: SCAN_BOX_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#4ADE80',
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#4ADE80',
    opacity: 0.8,
  },
  bottomBar: {
    paddingVertical: 24, paddingHorizontal: 24, alignItems: 'center', gap: 10,
  },
  instructionText: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  rescanBtn: {
    backgroundColor: '#4ADE80', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
  },
  rescanText: { color: '#000', fontSize: 14, fontWeight: '700' },
  supportedText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textAlign: 'center' },
  // Permission screen
  permContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  permEmoji: { fontSize: 56 },
  permTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  permText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  permBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 24, marginTop: 8 },
  permBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  permCancelBtn: { padding: 8 },
  permCancelText: { fontSize: 15 },
  // Web fallback
  webFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  webFallbackEmoji: { fontSize: 56 },
  webFallbackTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  webFallbackText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  webFallbackBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 24, marginTop: 8 },
  webFallbackBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Generic
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
