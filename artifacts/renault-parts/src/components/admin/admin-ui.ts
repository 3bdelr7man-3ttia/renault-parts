export const adminUi = {
  page: 'space-y-5 pb-4 text-slate-900',
  toolbar: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
  hero: 'rounded-[28px] border border-slate-200/90 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(252,252,250,0.98)_56%,rgba(248,250,252,0.97))] px-5 py-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:px-7 sm:py-6',
  title: 'text-[1.95rem] font-black leading-tight tracking-tight text-slate-950',
  subtitle: 'mt-1.5 text-sm font-medium leading-7 text-slate-500',
  primaryButton:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#C8974A] px-5 py-3 text-sm font-extrabold text-slate-950 shadow-[0_10px_20px_rgba(200,151,74,0.18)] transition hover:bg-[#b9873f] disabled:cursor-not-allowed disabled:opacity-60',
  secondaryButton:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50',
  softButton:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100',
  destructiveButton:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60',
  card: 'rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.045)]',
  statCard: 'rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm',
  subtleCard: 'rounded-[22px] border border-slate-200 bg-slate-50/80 p-4',
  tableShell: 'overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.045)]',
  tableHead:
    'bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-[0.02em]',
  tableRow: 'border-t border-slate-100 transition hover:bg-slate-50/80',
  searchShell:
    'flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm',
  input:
    'min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10',
  inputSm:
    'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10',
  select:
    'min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10',
  selectSm:
    'min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none transition focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10',
  textarea:
    'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#C8974A] focus:ring-4 focus:ring-[#C8974A]/10',
  modalOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4',
  modalPanel:
    'w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_48px_rgba(15,23,42,0.16)]',
  modalHeader: 'flex items-center justify-between border-b border-slate-200 px-6 py-5',
  modalFooter: 'flex gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4',
  badgeBase:
    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black',
  emptyState:
    'rounded-[24px] border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm',
} as const;

export const adminSemantic = {
  info: 'border-sky-200 bg-sky-50/75 text-sky-700',
  success: 'border-emerald-200 bg-emerald-50/75 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50/75 text-amber-700',
  danger: 'border-rose-200 bg-rose-50/75 text-rose-700',
  neutral: 'border-slate-200 bg-slate-50/85 text-slate-700',
  brand: 'border-[#C8974A]/20 bg-[#C8974A]/8 text-[#9a6e2e]',
} as const;
