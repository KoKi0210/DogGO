import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ProfileSectionRowProps {
  emoji: string;
  title: string;
  count: number;
  subtitle?: string;
  onPress: () => void;
  showBadge?: boolean;
}

export function ProfileSectionRow({ emoji, title, count, subtitle, onPress, showBadge }: ProfileSectionRowProps) {
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const error = useThemeColor({}, 'error');

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: text }]}>
              {title} ({count})
            </Text>
            {showBadge && (
              <View style={[styles.badge, { backgroundColor: error }]} />
            )}
          </View>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
        <IconSymbol name="chevron.right" size={20} color={textSecondary} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emoji: { fontSize: 24 },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, marginTop: 2 },
  badge: { width: 10, height: 10, borderRadius: 5 },
});
