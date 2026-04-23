import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useWalk } from '@/hooks/use-walk';
import { useReviews } from '@/hooks/use-reviews';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Loading } from '@/components/loading';
import { WalkMap } from '@/components/walk-map';
import { WalkStats } from '@/components/walk-stats';
import { StarRating } from '@/components/star-rating';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Review } from '@/types/database';

export default function WalkSummaryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { walkId, selfieUri } = useLocalSearchParams<{ walkId: string; selfieUri?: string }>();
  const { user } = useAuth();
  const { walk, isLoading } = useWalk(walkId ?? '');
  const { createReview, getReviewForWalk, isSubmitting: isReviewSubmitting } = useReviews();

  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');
  const placeholder = useThemeColor({}, 'placeholder');
  const border = useThemeColor({}, 'border');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [reviewChecked, setReviewChecked] = useState(false);

  useEffect(() => {
    if (walkId) {
      getReviewForWalk(walkId).then((review) => {
        setExistingReview(review);
        setReviewChecked(true);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walkId]);

  if (isLoading) return <Loading fullScreen />;

  if (!walk) {
    return (
      <View style={[styles.center, { backgroundColor: background }]}>
        <Text style={{ color: text }}>{t('common.error')}</Text>
      </View>
    );
  }

  const route = (walk.route_coordinates ?? []) as { lat: number; lng: number }[];
  const distanceKm = walk.distance_km ?? 0;
  const durationMins = walk.duration_mins ?? 0;
  const durationSeconds = walk.started_at && walk.ended_at
    ? Math.max(0, Math.round((new Date(walk.ended_at).getTime() - new Date(walk.started_at).getTime()) / 1000))
    : Math.max(0, Math.round(durationMins * 60));
  const pointsEarned = walk.points_earned ?? 0;
  const dog = walk.dog;
  const fallbackSelfieUri = typeof selfieUri === 'string' ? decodeURIComponent(selfieUri) : null;
  const selfieToShow = walk.selfie_url ?? fallbackSelfieUri;
  const isOwner = user?.id === walk.owner?.id;
  const canReview = isOwner && reviewChecked && !existingReview;

  async function handleSubmitReview() {
    if (!walk || !walkId || rating === 0) {
      Alert.alert(t('common.error'), t('reviews.selectRating'));
      return;
    }
    try {
      const review = await createReview({
        walkerId: walk.walker_id,
        walkId,
        rating,
        comment: comment.trim() || undefined,
      });
      setExistingReview(review);
      Alert.alert(t('common.success'), t('reviews.reviewSubmitted'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t('common.error'), message);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: t('walks.walkSummary'), headerBackVisible: true }} />
      <ScrollView style={[styles.container, { backgroundColor: background }]} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading, { color: text }]}>
          {t('walks.greatWalk')}
        </Text>

        {/* Route Map */}
        {route.length > 0 && (
          <WalkMap route={route} showMarkers scrollEnabled={false} height={220} />
        )}

        {/* Stats Row */}
        <WalkStats
          distanceKm={distanceKm}
          durationMins={durationMins}
          durationSeconds={durationSeconds}
          durationAsClock
          pointsEarned={pointsEarned}
        />

        {/* Points Breakdown */}
        <Card style={styles.pointsCard}>
          <Text style={[styles.pointsTitle, { color: text }]}>{t('walks.pointsBreakdown')}</Text>

          <View style={styles.pointsRow}>
            <Text style={[styles.pointsLabel, { color: textSecondary }]}>{t('walks.basePoints')}</Text>
            <Text style={[styles.pointsValue, { color: text }]}>
              {walk.multiplier > 1 ? Math.round(pointsEarned / walk.multiplier) : pointsEarned}
            </Text>
          </View>

          {walk.multiplier > 1 && (
            <View style={styles.pointsRow}>
              <Text style={[styles.pointsLabel, { color: accent }]}>{t('walks.adoptedBonus')}</Text>
              <Text style={[styles.pointsValue, { color: accent }]}>×{walk.multiplier}</Text>
            </View>
          )}

          <View style={[styles.pointsRow, styles.totalRow, { borderTopColor: border }]}>
            <Text style={[styles.totalLabel, { color: primary }]}>{t('walks.totalPoints')}</Text>
            <Text style={[styles.totalValue, { color: primary }]}>{pointsEarned}</Text>
          </View>
        </Card>

        {/* Dog Info */}
        {dog && (
          <Card style={styles.dogCard}>
            <View style={styles.dogRow}>
              {dog.photo_url ? (
                <Image source={{ uri: dog.photo_url }} style={styles.dogPhoto} />
              ) : (
                <View style={[styles.dogPhoto, styles.dogPhotoPlaceholder, { backgroundColor: placeholder }]}>
                  <IconSymbol name="pawprint.fill" size={28} color={primary} />
                </View>
              )}
              <View style={styles.dogInfo}>
                <Text style={[styles.dogName, { color: text }]}>{dog.name}</Text>
                <Text style={[styles.dogBreed, { color: textSecondary }]}>{dog.breed}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Selfie */}
        {selfieToShow && (
          <View style={styles.selfieSection}>
            <Text style={[styles.selfieLabel, { color: textSecondary }]}>📸</Text>
            <Image source={{ uri: selfieToShow }} style={styles.selfieImage} />
          </View>
        )}

        {/* Leave a Review (for dog owners) */}
        {canReview && (
          <Card style={styles.reviewCard}>
            <Text style={[styles.reviewTitle, { color: text }]}>{t('reviews.leaveReview')}</Text>
            <View style={styles.ratingRow}>
              <StarRating rating={rating} editable onChange={setRating} size={32} />
            </View>
            <TextInput
              style={[styles.commentInput, { color: text, borderColor: textSecondary + '40' }]}
              value={comment}
              onChangeText={setComment}
              placeholder={t('reviews.commentPlaceholder')}
              placeholderTextColor={textSecondary}
              multiline
              numberOfLines={3}
            />
            <Button
              title={t('reviews.submitReview')}
              onPress={handleSubmitReview}
              loading={isReviewSubmitting}
            />
          </Card>
        )}

        {/* Show existing review */}
        {existingReview && (
          <Card style={styles.reviewCard}>
            <Text style={[styles.reviewTitle, { color: text }]}>{t('reviews.yourReview')}</Text>
            <StarRating rating={existingReview.rating} size={24} />
            {existingReview.comment && (
              <Text style={[styles.reviewComment, { color: text }]}>{existingReview.comment}</Text>
            )}
          </Card>
        )}

        <Button
          title={t('common.back')}
          onPress={() => router.back()}
          variant="outline"
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 32, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 },
  pointsCard: { gap: 8 },
  pointsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pointsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pointsLabel: { fontSize: 14 },
  pointsValue: { fontSize: 14, fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: undefined, paddingTop: 8, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 24, fontWeight: '900' },
  dogCard: {},
  dogRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dogPhoto: { width: 56, height: 56, borderRadius: 16 },
  dogPhotoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  dogInfo: {},
  dogName: { fontSize: 16, fontWeight: '700' },
  dogBreed: { fontSize: 13, marginTop: 2 },
  selfieSection: { alignItems: 'center', gap: 8 },
  selfieLabel: { fontSize: 20 },
  selfieImage: { width: '100%', height: 200, borderRadius: 20 },
  reviewCard: { gap: 12 },
  reviewTitle: { fontSize: 16, fontWeight: '700' },
  ratingRow: { alignItems: 'center' },
  commentInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reviewComment: { fontSize: 14, lineHeight: 20 },
});
