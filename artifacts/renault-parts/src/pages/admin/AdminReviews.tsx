import React, { useState } from 'react';
import { useListAdminReviews, useReplyToReview } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { adminSemantic, adminUi } from '@/components/admin/admin-ui';
import { Check, Loader2, MessageSquareReply, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
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
      onSuccess: () => {
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
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className={adminUi.page}>
      <div className={adminUi.hero}>
        <div className={adminUi.toolbar}>
          <div>
            <h1 className={adminUi.title}>إدارة التقييمات</h1>
            <p className={adminUi.subtitle}>
              {reviews?.length ?? 0} تقييم
              {avgRating ? <span className="mr-2 font-black text-amber-700">· متوسط {avgRating}</span> : null}
            </p>
          </div>
        </div>
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((review) => review.rating === star).length;
            return (
              <div key={star} className={`${adminUi.statCard} text-center`}>
                <div className="mb-2 flex justify-center">
                  {[...Array(star)].map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-2xl font-black text-slate-950">{count}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {((count / reviews.length) * 100).toFixed(0)}%
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-[28px] bg-slate-100" />
          ))}
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <div className={adminUi.emptyState}>
          <Star className="mx-auto mb-4 h-10 w-10 text-slate-200" />
          <p className="text-lg font-bold text-slate-500">لا توجد تقييمات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isReplying = replyingId === review.id;

            return (
              <div key={review.id} className={adminUi.card}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 font-black text-amber-700">
                      {review.userName?.[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-950">{review.userName}</p>
                      <p className="mt-1 text-xs text-slate-500" dir="ltr">{review.userPhone}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StarRating rating={review.rating} />
                        {review.workshopName ? (
                          <span className="text-xs text-slate-500">· {review.workshopName}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-400">
                    {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: ar })}
                  </div>
                </div>

                {review.comment ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700">
                    {review.comment}
                  </div>
                ) : null}

                {review.adminReply ? (
                  <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <MessageSquareReply className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
                    <div>
                      <p className="text-xs font-black text-amber-700">رد الإدارة</p>
                      <p className="mt-1 text-sm leading-7 text-slate-700">{review.adminReply}</p>
                    </div>
                  </div>
                ) : isReplying ? (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="اكتب ردك على التقييم..."
                      className={`${adminUi.textarea} min-h-[110px] resize-none`}
                    />
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => handleReply(review.id)}
                        disabled={replying || !replyText.trim()}
                        className={adminUi.primaryButton}
                      >
                        {replying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        إرسال الرد
                      </button>
                      <button
                        onClick={() => {
                          setReplyingId(null);
                          setReplyText('');
                        }}
                        className={adminUi.secondaryButton}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setReplyingId(review.id);
                        setReplyText('');
                      }}
                      className={adminUi.softButton}
                    >
                      <MessageSquareReply className="h-4 w-4" />
                      رد على التقييم
                    </button>
                  </div>
                )}

                <div className="mt-4">
                  <span className={`${adminUi.badgeBase} ${review.rating >= 4 ? adminSemantic.success : review.rating === 3 ? adminSemantic.warning : adminSemantic.danger}`}>
                    {review.rating >= 4 ? 'انطباع إيجابي' : review.rating === 3 ? 'يحتاج متابعة' : 'حالة حساسة'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
