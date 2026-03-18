import React, { useState } from 'react';
import { useListAdminReviews, useReplyToReview } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquareReply, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-[#F9E795] fill-[#F9E795]' : 'text-white/20'}`}
        />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const headers = getAuthHeaders();

  const { data: reviews, isLoading } = useListAdminReviews({ request: headers });

  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const { mutate: sendReply, isPending: replying } = useReplyToReview({
    request: headers,
    mutation: {
      onSuccess: (updated) => {
        toast({ title: 'تم إضافة الرد بنجاح' });
        queryClient.invalidateQueries();
        setReplyingId(null);
        setReplyText('');
      },
      onError: () => toast({ variant: 'destructive', title: 'خطأ', description: 'فشل إضافة الرد' }),
    },
  });

  const handleReply = (id: number) => {
    if (!replyText.trim()) return;
    sendReply({ id, data: { reply: replyText.trim() } });
  };

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">إدارة التقييمات</h1>
          <p className="text-white/50 text-sm">
            {reviews?.length ?? 0} تقييم
            {avgRating && <span className="mr-2 text-[#F9E795] font-bold">⭐ متوسط: {avgRating}</span>}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      {reviews && reviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length;
            return (
              <div key={star} className="bg-[#1E2761]/60 rounded-xl border border-white/10 p-3 text-center">
                <div className="flex justify-center mb-1">
                  {[...Array(star)].map((_, i) => <Star key={i} className="w-3 h-3 text-[#F9E795] fill-[#F9E795]" />)}
                </div>
                <p className="text-white font-black text-xl">{count}</p>
                <p className="text-white/40 text-xs">{((count / reviews.length) * 100).toFixed(0)}%</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="bg-[#1E2761]/60 rounded-2xl border border-white/10 p-12 text-center text-white/40 font-bold">
          لا توجد تقييمات بعد
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => {
            const isReplying = replyingId === review.id;

            return (
              <div key={review.id} className="bg-[#1E2761]/60 rounded-2xl border border-white/10 p-6 space-y-3">
                {/* Review Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F9E795]/20 border border-[#F9E795]/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#F9E795] font-black text-sm">{review.userName?.[0]}</span>
                    </div>
                    <div>
                      <p className="text-white font-bold">{review.userName}</p>
                      <p className="text-white/40 text-xs" dir="ltr">{review.userPhone}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} />
                        {review.workshopName && (
                          <span className="text-white/40 text-xs">• {review.workshopName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-white/30 text-xs whitespace-nowrap">
                    {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: ar })}
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-white/70 text-sm leading-relaxed bg-white/5 rounded-xl px-4 py-3">
                    {review.comment}
                  </p>
                )}

                {/* Admin Reply */}
                {review.adminReply ? (
                  <div className="flex gap-3 bg-[#F9E795]/5 border border-[#F9E795]/20 rounded-xl px-4 py-3">
                    <MessageSquareReply className="w-4 h-4 text-[#F9E795] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#F9E795] text-xs font-bold mb-1">رد الإدارة</p>
                      <p className="text-white/70 text-sm leading-relaxed">{review.adminReply}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {isReplying ? (
                      <div className="space-y-3">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          rows={3}
                          placeholder="اكتب ردك على التقييم..."
                          className="w-full bg-white/10 text-white text-sm px-4 py-3 rounded-xl border border-[#F9E795]/30 outline-none focus:border-[#F9E795]/60 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(review.id)}
                            disabled={replying || !replyText.trim()}
                            className="flex items-center gap-2 px-5 py-2 bg-[#F9E795] text-[#1E2761] rounded-xl font-bold text-sm hover:bg-[#F9E795]/80 transition-all disabled:opacity-50"
                          >
                            {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            إرسال الرد
                          </button>
                          <button
                            onClick={() => { setReplyingId(null); setReplyText(''); }}
                            className="px-5 py-2 bg-white/10 text-white/60 rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setReplyingId(review.id); setReplyText(''); }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/50 hover:text-[#F9E795] hover:bg-[#F9E795]/10 rounded-xl text-sm font-bold transition-all border border-white/10 hover:border-[#F9E795]/30"
                      >
                        <MessageSquareReply className="w-4 h-4" />
                        رد على التقييم
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
