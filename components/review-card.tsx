import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Avatar } from '@/components/avatar';
import { StarRating } from '@/components/star-rating';
import { Review, Profile } from '@/types/database';

interface ReviewCardProps {
  review: Review;
  reviewer?: Profile | null;
}

export function ReviewCard({ review, reviewer }: ReviewCardProps) {
  const cardBg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const border = useThemeColor({}, 'border');

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewerName: { fontSize: 14, fontWeight: '500' },
  comment: { fontSize: 14, lineHeight: 20 },
  date: { fontSize: 11 },
});
