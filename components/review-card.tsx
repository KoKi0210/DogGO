import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Avatar } from '@/components/avatar';
import { StarRating } from '@/components/star-rating';
import { ClayCard } from '@/components/clay-card';
import { Review, Profile } from '@/types/database';

interface ReviewCardProps {
  review: Review;
  reviewer?: Profile | null;
}

export function ReviewCard({ review, reviewer }: ReviewCardProps) {
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');

  return (
    <View style={styles.wrapper}>
      <ClayCard shadowLevel="sm" radius={18} style={styles.card}>
        <View style={styles.header}>
          {reviewer && (
            <View style={styles.reviewerRow}>
              <Avatar uri={reviewer.avatar_url} name={reviewer.display_name} size={32} />
              <Text style={[styles.reviewerName, { color: text }]}>{reviewer.display_name}</Text>
            </View>
          )}
          <StarRating rating={review.rating} size={18} />
        </View>

        {review.comment && (
          <Text style={[styles.comment, { color: text }]}>{review.comment}</Text>
        )}

        <Text style={[styles.date, { color: textSecondary }]}>
          {new Date(review.created_at).toLocaleDateString()}
        </Text>
      </ClayCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 8 },
  card: {
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewerName: { fontSize: 14, fontWeight: '600' },
  comment: { fontSize: 14, lineHeight: 22 },
  date: { fontSize: 11 },
});
