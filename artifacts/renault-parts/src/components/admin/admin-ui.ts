export const adminUi = {
  page: 'space-y-6 text-slate-900',
  toolbar: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
  hero: 'rounded-[32px] border border-amber-100 bg-[linear-gradient(135deg,rgba(255,250,235,0.95),rgba(255,255,255,0.98)_48%,rgba(239,246,255,0.96))] px-6 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:px-8',
  title: 'text-3xl font-black tracking-tight text-slate-950',
  subtitle: 'mt-1 text-sm font-medium leading-6 text-slate-500',
  primaryButton:
    'inline-flex items-center gap-2 rounded-2xl bg-[#C8974A] px-5 py-3 text-sm font-extrabold text-slate-950 shadow-[0_12px_26px_rgba(200,151,74,0.28)] transition hover:-translate-y-0.5 hover:bg-[#b9873f] disabled:cursor-not-allowed disabled:opacity-60',
  secondaryButton:
    'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.92))] px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50',
  softButton:
    'inline-flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-amber-50',
  destructiveButton:
    'inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60',
  card: 'rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.96))] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]',
  statCard: 'rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(250,250,249,0.96))] p-5 shadow-sm',
  subtleCard: 'rounded-3xl border border-amber-100 bg-[linear-gradient(180deg,rgba(255,251,235,0.82),rgba(255,255,255,0.96))] p-4',
  tableShell: 'overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.96))] shadow-[0_14px_34px_rgba(15,23,42,0.05)]',
  tableHead:
    'bg-[linear-gradient(180deg,rgba(255,251,235,0.7),rgba(248,250,252,0.92))] text-[11px] font-black text-slate-500 uppercase tracking-[0.02em]',
  tableRow: 'border-t border-slate-100 transition hover:bg-slate-50/80',
  searchShell:
    'flex items-center gap-2 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.94))] px-4 py-3 shadow-sm',
  input:
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10',
  inputSm:
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10',
  select:
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10',
  selectSm:
    'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none transition focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10',
  textarea:
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10',
  modalOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4',
  modalPanel:
    'w-full overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]',
  modalHeader: 'flex items-center justify-between border-b border-slate-200 px-6 py-5',
  modalFooter: 'flex gap-3 border-t border-slate-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.62),rgba(248,250,252,0.88))] px-6 py-4',
  badgeBase:
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black',
  emptyState:
    'rounded-[28px] border border-dashed border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.96))] px-6 py-16 text-center shadow-sm',
} as const;

export const adminSemantic = {
  info: 'border-sky-200 bg-sky-50/90 text-sky-800',
  success: 'border-emerald-200 bg-emerald-50/90 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50/90 text-amber-800',
  danger: 'border-rose-200 bg-rose-50/90 text-rose-800',
  neutral: 'border-slate-200 bg-slate-50/90 text-slate-700',
  brand: 'border-[#C8974A]/25 bg-[linear-gradient(180deg,rgba(200,151,74,0.12),rgba(255,251,235,0.92))] text-[#9a6e2e]',
} as const;
