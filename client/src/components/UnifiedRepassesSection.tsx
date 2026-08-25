import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Banknote, ChevronDown, ChevronRight, Pencil, Trash2, Check, X } from "lucide-react";
import { useState } from "react";

interface Registration {
  id: string;
  name: string;
  turma: string;
  paymentStatus: string;
  paymentMethod: string;
  paidAmount: number | null;
  vendor: string | null;
  hamiltonPaid: number | null;
  vendorCommissionPaid: number | null;
  batch: number | null;
  [key: string]: any;
}

interface CommResult {
  gross: number;
  netAfterTax: number;
  vendorComm: number;
  mmComm: number;
  hfComm: number;
  taxes: number;
  cardFee: number;
}

interface Props {
  registrations: Registration[];
  vendors: Array<{ id: string; name: string; hasCommission: boolean }>;
  calculateCommissions: (reg: Registration, batchConfig: any) => CommResult;
  rc: (reg: Registration) => any;
  turmaFilter?: string;
  onPayMentor?: () => void;
  onPayVendor?: (vendorName: string) => void;
  onDeletePaymentEntry?: (regId: string, entryId: string, type: 'mentor' | 'vendor') => void;
  onEditPaymentEntry?: (regId: string, entryId: string, type: 'mentor' | 'vendor', amount: number, date: string) => void;
}

interface PersonReport {
  name: string;
  role: 'mentor' | 'vendedor' | 'mentor+vendedor';
  entries: Array<{
    reg: Registration;
    gross: number;
    netAfterTax: number;
    mentorTotal: number;
    commTotal: number;
    repasseTotal: number;
    resultado: number;
    paidAmountReais: number;
    paidRatio: number;
    mentorAtual: number;
    commAtual: number;
    dueNow: number;
    alreadyPaid: number;
    balance: number;
  }>;
  totals: {
    gross: number;
    netAfterTax: number;
    mentorTotal: number;
    commTotal: number;
    repasseTotal: number;
    resultado: number;
    paidAmount: number;
    mentorAtual: number;
    commAtual: number;
    dueNow: number;
    alreadyPaid: number;
    balance: number;
  };
}

export default function UnifiedRepassesSection({ registrations, vendors, calculateCommissions, rc, turmaFilter = 'todas', onPayMentor, onPayVendor, onDeletePaymentEntry, onEditPaymentEntry }: Props) {
  const filtered = turmaFilter === 'todas' ? registrations : registrations.filter(r => r.turma === turmaFilter);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingEntry, setEditingEntry] = useState<{ regId: string; entryId: string; type: 'mentor' | 'vendor'; amount: string; date: string } | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Build per-person reports
  const buildReports = (): PersonReport[] => {
    const people: Record<string, PersonReport> = {};

    // Process all registrations
    for (const reg of filtered) {
      const bc = rc(reg);
      const comms = calculateCommissions(reg, bc);
      const paidAmountReais = (reg.paidAmount || 0) / 100;
      const ns = (reg.paymentStatus || '').toLowerCase().trim();
      const paidRatio = ns === 'pago' ? 1 : ns === 'parcial' && comms.gross > 0 ? paidAmountReais / comms.gross : 0;

      // Hamilton Felix as mentor (always gets hfComm)
      const HF_NAME = "Hamilton Felix";
      if (!people[HF_NAME]) {
        people[HF_NAME] = { name: HF_NAME, role: 'mentor', entries: [], totals: { gross: 0, netAfterTax: 0, mentorTotal: 0, commTotal: 0, repasseTotal: 0, resultado: 0, paidAmount: 0, mentorAtual: 0, commAtual: 0, dueNow: 0, alreadyPaid: 0, balance: 0 } };
      }

      const hfPaid = reg.hamiltonPaid || 0;

      // Check if Hamilton is also the vendor for this reg
      const isHfVendor = reg.vendor?.trim() === HF_NAME;
      const vendorCommForHf = isHfVendor ? comms.vendorComm : 0;
      const vendorCommPaidForHf = isHfVendor ? (reg.vendorCommissionPaid || 0) : 0;

      if (isHfVendor && people[HF_NAME].role === 'mentor') {
        people[HF_NAME].role = 'mentor+vendedor';
      }

      const hfRepasseTotal = comms.hfComm + vendorCommForHf;
      const hfResultado = comms.netAfterTax - hfRepasseTotal;
      const hfMentorAtual = Math.round(comms.hfComm * paidRatio);
      const hfCommAtual = isHfVendor ? Math.round(comms.vendorComm * paidRatio) : 0;
      const hfDueNow = hfMentorAtual + hfCommAtual;

      people[HF_NAME].entries.push({
        reg,
        gross: comms.gross,
        netAfterTax: comms.netAfterTax,
        mentorTotal: comms.hfComm,
        commTotal: vendorCommForHf,
        repasseTotal: hfRepasseTotal,
        resultado: hfResultado,
        paidAmountReais,
        paidRatio,
        mentorAtual: hfMentorAtual,
        commAtual: hfCommAtual,
        dueNow: hfDueNow,
        alreadyPaid: hfPaid + vendorCommPaidForHf,
        balance: hfDueNow - (hfPaid + vendorCommPaidForHf),
      });

      // Other vendors (not Hamilton)
      if (reg.vendor?.trim() && reg.vendor.trim() !== HF_NAME) {
        const vendorName = reg.vendor.trim();
        const vendorObj = vendors.find(v => v.name === vendorName);
        if (vendorObj && vendorObj.hasCommission !== false) {
          if (!people[vendorName]) {
            people[vendorName] = { name: vendorName, role: 'vendedor', entries: [], totals: { gross: 0, netAfterTax: 0, mentorTotal: 0, commTotal: 0, repasseTotal: 0, resultado: 0, paidAmount: 0, mentorAtual: 0, commAtual: 0, dueNow: 0, alreadyPaid: 0, balance: 0 } };
          }
          const commAtual = Math.round(comms.vendorComm * paidRatio);
          const commPaid = reg.vendorCommissionPaid || 0;
          const vendorRepasseTotal = comms.vendorComm;
          const vendorResultado = comms.netAfterTax - vendorRepasseTotal;
          people[vendorName].entries.push({
            reg,
            gross: comms.gross,
            netAfterTax: comms.netAfterTax,
            mentorTotal: 0,
            commTotal: comms.vendorComm,
            repasseTotal: vendorRepasseTotal,
            resultado: vendorResultado,
            paidAmountReais,
            paidRatio,
            mentorAtual: 0,
            commAtual,
            dueNow: commAtual,
            alreadyPaid: commPaid,
            balance: commAtual - commPaid,
          });
        }
      }
    }

    // Calculate totals
    for (const person of Object.values(people)) {
      person.totals = person.entries.reduce((acc, e) => ({
        gross: acc.gross + e.gross,
        netAfterTax: acc.netAfterTax + e.netAfterTax,
        mentorTotal: acc.mentorTotal + e.mentorTotal,
        commTotal: acc.commTotal + e.commTotal,
        repasseTotal: acc.repasseTotal + e.repasseTotal,
        resultado: acc.resultado + e.resultado,
        paidAmount: acc.paidAmount + e.paidAmountReais,
        mentorAtual: acc.mentorAtual + e.mentorAtual,
        commAtual: acc.commAtual + e.commAtual,
        dueNow: acc.dueNow + e.dueNow,
        alreadyPaid: acc.alreadyPaid + e.alreadyPaid,
        balance: acc.balance + e.balance,
      }), { gross: 0, netAfterTax: 0, mentorTotal: 0, commTotal: 0, repasseTotal: 0, resultado: 0, paidAmount: 0, mentorAtual: 0, commAtual: 0, dueNow: 0, alreadyPaid: 0, balance: 0 });
    }

    return Object.values(people).filter(p => p.entries.length > 0);
  };

  const reports = buildReports();
  const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <User className="h-5 w-5" />
        Repasses (Mentores e Vendedores)
      </h3>

      {reports.map(person => (
        <div key={person.name} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${person.role === 'mentor' || person.role === 'mentor+vendedor' ? 'bg-purple-200' : 'bg-amber-200'}`}>
                <User className={`w-4 h-4 ${person.role === 'mentor' || person.role === 'mentor+vendedor' ? 'text-purple-700' : 'text-amber-700'}`} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{person.name}</p>
                <p className="text-xs text-gray-500">
                  {person.role === 'mentor' ? 'Mentor' : person.role === 'vendedor' ? 'Vendedor' : 'Mentor + Vendedor'} — {person.entries.length} inscrições
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-500">Devido</p>
                <p className="font-bold text-blue-700">R$ {fmt(person.totals.dueNow)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Pago</p>
                <p className="font-bold text-green-600">R$ {fmt(person.totals.alreadyPaid)}</p>
              </div>
              <Badge className={person.totals.balance <= 0 ? 'bg-green-600' : 'bg-orange-500'}>
                {person.totals.balance <= 0 ? 'Quitado' : `Saldo R$ ${fmt(person.totals.balance)}`}
              </Badge>
              {person.totals.balance > 0 && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (person.role === 'mentor' || person.role === 'mentor+vendedor') {
                      onPayMentor?.();
                    } else {
                      onPayVendor?.(person.name);
                    }
                  }}
                  className="h-7 text-xs bg-green-600 hover:bg-green-700"
                >
                  <Banknote className="w-3 h-3 mr-1" />
                  Registrar Pgto
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="px-3 py-2 font-medium text-gray-600">Aluno</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Bruto</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Líquido</th>
                  {(person.role === 'mentor' || person.role === 'mentor+vendedor') && (
                    <th className="px-3 py-2 font-medium text-gray-600 text-right">Repasse Mentor</th>
                  )}
                  {(person.role === 'vendedor' || person.role === 'mentor+vendedor') && (
                    <th className="px-3 py-2 font-medium text-gray-600 text-right">Comissão</th>
                  )}
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Repasse Total</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Resultado</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-center">Status</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Valor Pago</th>
                  {(person.role === 'mentor' || person.role === 'mentor+vendedor') && (
                    <th className="px-3 py-2 font-medium text-gray-600 text-right">Repasse Mentor Atual</th>
                  )}
                  {(person.role === 'vendedor' || person.role === 'mentor+vendedor') && (
                    <th className="px-3 py-2 font-medium text-gray-600 text-right">Comissão Atual</th>
                  )}
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Total Atual Devido</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Já Paguei</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {person.entries.map((e, idx) => {
                  const ns = (e.reg.paymentStatus || '').toLowerCase().trim();
                  const rowKey = `${person.name}-${e.reg.id}`;
                  const isExpanded = expandedRows.has(rowKey);
                  
                  // Parse payment entries from unified vendorPayments JSON field
                  let allPaymentEntries: any[] = [];
                  try { allPaymentEntries = e.reg.vendorPayments ? JSON.parse(e.reg.vendorPayments) : []; } catch { allPaymentEntries = []; }
                  const mentorPaymentEntries = allPaymentEntries.filter((p: any) => p.type === 'mentor');
                  const vendorPaymentEntries = allPaymentEntries.filter((p: any) => p.type === 'vendor' || !p.type);
                  
                  const hasPaymentHistory = (person.role === 'mentor' || person.role === 'mentor+vendedor') 
                    ? (mentorPaymentEntries.length > 0 || vendorPaymentEntries.length > 0)
                    : vendorPaymentEntries.length > 0;
                  
                  // Compute total columns for colspan
                  let totalCols = 9; // base: Aluno, Bruto, Líquido, Repasse Total, Resultado, Status, Valor Pago, Total Devido, Já Paguei, Saldo = but count conditional ones
                  totalCols = 7; // Aluno + Bruto + Líquido + RepasseTotal + Resultado + Status + ValorPago
                  if (person.role === 'mentor' || person.role === 'mentor+vendedor') totalCols += 1; // Repasse Mentor
                  if (person.role === 'vendedor' || person.role === 'mentor+vendedor') totalCols += 1; // Comissão
                  if (person.role === 'mentor' || person.role === 'mentor+vendedor') totalCols += 1; // Mentor Atual
                  if (person.role === 'vendedor' || person.role === 'mentor+vendedor') totalCols += 1; // Comissão Atual
                  totalCols += 3; // Total Devido + Já Paguei + Saldo

                  return (
                    <>
                    <tr key={idx} className={`hover:bg-slate-50 ${isExpanded ? 'bg-slate-50' : ''}`}>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-1">
                          {hasPaymentHistory && (
                            <button
                              onClick={() => toggleExpand(rowKey)}
                              className="p-0.5 rounded hover:bg-slate-200 text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{e.reg.name}</p>
                            <p className="text-[10px] text-gray-400">{e.reg.paymentMethod === 'pix' ? 'PIX' : e.reg.paymentMethod === 'installments10' ? '10x' : '5x'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-right">R$ {fmt(e.gross)}</td>
                      <td className="px-3 py-1.5 text-right text-emerald-700">R$ {fmt(e.netAfterTax)}</td>
                      {(person.role === 'mentor' || person.role === 'mentor+vendedor') && (
                        <td className="px-3 py-1.5 text-right text-purple-700">R$ {fmt(e.mentorTotal)}</td>
                      )}
                      {(person.role === 'vendedor' || person.role === 'mentor+vendedor') && (
                        <td className="px-3 py-1.5 text-right text-amber-700">R$ {fmt(e.commTotal)}</td>
                      )}
                      <td className="px-3 py-1.5 text-right text-indigo-700 font-medium">R$ {fmt(e.repasseTotal)}</td>
                      <td className="px-3 py-1.5 text-right text-gray-700">R$ {fmt(e.resultado)}</td>
                      <td className="px-3 py-1.5 text-center">
                        <Badge className={`text-[10px] ${ns === 'pago' ? 'bg-green-600' : ns === 'parcial' ? 'bg-amber-500' : 'bg-red-500'}`}>
                          {ns === 'pago' ? 'Pago' : ns === 'parcial' ? 'Parcial' : 'Pend'}
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5 text-right text-blue-600 font-medium">R$ {fmt(e.paidAmountReais)}</td>
                      {(person.role === 'mentor' || person.role === 'mentor+vendedor') && (
                        <td className="px-3 py-1.5 text-right text-purple-600">R$ {fmt(e.mentorAtual)}</td>
                      )}
                      {(person.role === 'vendedor' || person.role === 'mentor+vendedor') && (
                        <td className="px-3 py-1.5 text-right text-amber-600">R$ {fmt(e.commAtual)}</td>
                      )}
                      <td className="px-3 py-1.5 text-right text-blue-700 font-medium">R$ {fmt(e.dueNow)}</td>
                      <td className="px-3 py-1.5 text-right text-green-600">{e.alreadyPaid > 0 ? `R$ ${fmt(e.alreadyPaid)}` : '-'}</td>
                      <td className="px-3 py-1.5 text-right">
                        <span className={`font-bold ${e.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          R$ {fmt(e.balance)}
                        </span>
                      </td>
                    </tr>
                    {/* Payment detail sub-table */}
                    {isExpanded && hasPaymentHistory && (
                      <tr key={`${idx}-detail`} className="bg-green-50/60">
                        <td colSpan={totalCols} className="px-6 py-2">
                          <div className="text-[11px]">
                            <p className="font-medium text-gray-600 mb-1">Pagamentos realizados:</p>
                            <table className="w-full">
                              <thead>
                                <tr className="text-left text-gray-500">
                                  <th className="pr-3 py-0.5 font-medium">Tipo</th>
                                  <th className="pr-3 py-0.5 font-medium text-right">Valor</th>
                                  <th className="pr-3 py-0.5 font-medium">Data</th>
                                  <th className="pr-3 py-0.5 font-medium">Forma</th>
                                  <th className="pr-3 py-0.5 font-medium">Obs</th>
                                  <th className="pr-3 py-0.5 font-medium text-right">Ações</th>
                                </tr>
                              </thead>
                              <tbody>
                                {mentorPaymentEntries.map((p: any) => {
                                  const isEditing = editingEntry?.regId === e.reg.id && editingEntry?.entryId === p.id && editingEntry?.type === 'mentor';
                                  return (
                                    <tr key={p.id} className="border-t border-green-100">
                                      <td className="pr-3 py-0.5 text-purple-600">Mentor</td>
                                      <td className="pr-3 py-0.5 text-right font-medium">
                                        {isEditing ? (
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={editingEntry.amount}
                                            onChange={(ev) => setEditingEntry({ ...editingEntry!, amount: ev.target.value })}
                                            className="h-5 w-24 text-[11px] px-1"
                                          />
                                        ) : (
                                          `R$ ${fmt(p.amount)}`
                                        )}
                                      </td>
                                      <td className="pr-3 py-0.5">
                                        {isEditing ? (
                                          <Input
                                            type="date"
                                            value={editingEntry.date}
                                            onChange={(ev) => setEditingEntry({ ...editingEntry!, date: ev.target.value })}
                                            className="h-5 w-28 text-[11px] px-1"
                                          />
                                        ) : (
                                          p.date ? new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'
                                        )}
                                      </td>
                                      <td className="pr-3 py-0.5 text-gray-500">{p.method || 'pix'}</td>
                                      <td className="pr-3 py-0.5 text-gray-400 max-w-[100px] truncate">{p.notes || '-'}</td>
                                      <td className="pr-3 py-0.5 text-right">
                                        {isEditing ? (
                                          <div className="flex gap-1 justify-end">
                                            <button
                                              onClick={() => {
                                                onEditPaymentEntry?.(e.reg.id, p.id, 'mentor', parseFloat(editingEntry!.amount), editingEntry!.date);
                                                setEditingEntry(null);
                                              }}
                                              className="p-0.5 rounded text-green-600 hover:bg-green-100"
                                            ><Check className="w-3 h-3" /></button>
                                            <button
                                              onClick={() => setEditingEntry(null)}
                                              className="p-0.5 rounded text-gray-400 hover:bg-gray-100"
                                            ><X className="w-3 h-3" /></button>
                                          </div>
                                        ) : (
                                          <div className="flex gap-1 justify-end">
                                            <button
                                              onClick={() => setEditingEntry({ regId: e.reg.id, entryId: p.id, type: 'mentor', amount: p.amount.toString(), date: p.date || '' })}
                                              className="p-0.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                            ><Pencil className="w-3 h-3" /></button>
                                            <button
                                              onClick={() => onDeletePaymentEntry?.(e.reg.id, p.id, 'mentor')}
                                              className="p-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                                            ><Trash2 className="w-3 h-3" /></button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                                {vendorPaymentEntries.map((p: any) => {
                                  const isEditing = editingEntry?.regId === e.reg.id && editingEntry?.entryId === p.id && editingEntry?.type === 'vendor';
                                  return (
                                    <tr key={p.id} className="border-t border-green-100">
                                      <td className="pr-3 py-0.5 text-amber-600">Comissão</td>
                                      <td className="pr-3 py-0.5 text-right font-medium">
                                        {isEditing ? (
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={editingEntry.amount}
                                            onChange={(ev) => setEditingEntry({ ...editingEntry!, amount: ev.target.value })}
                                            className="h-5 w-24 text-[11px] px-1"
                                          />
                                        ) : (
                                          `R$ ${fmt(p.amount)}`
                                        )}
                                      </td>
                                      <td className="pr-3 py-0.5">
                                        {isEditing ? (
                                          <Input
                                            type="date"
                                            value={editingEntry.date}
                                            onChange={(ev) => setEditingEntry({ ...editingEntry!, date: ev.target.value })}
                                            className="h-5 w-28 text-[11px] px-1"
                                          />
                                        ) : (
                                          p.date ? new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR') : '-'
                                        )}
                                      </td>
                                      <td className="pr-3 py-0.5 text-gray-500">{p.method || 'pix'}</td>
                                      <td className="pr-3 py-0.5 text-gray-400 max-w-[100px] truncate">{p.notes || '-'}</td>
                                      <td className="pr-3 py-0.5 text-right">
                                        {isEditing ? (
                                          <div className="flex gap-1 justify-end">
                                            <button
                                              onClick={() => {
                                                onEditPaymentEntry?.(e.reg.id, p.id, 'vendor', parseFloat(editingEntry!.amount), editingEntry!.date);
                                                setEditingEntry(null);
                                              }}
                                              className="p-0.5 rounded text-green-600 hover:bg-green-100"
                                            ><Check className="w-3 h-3" /></button>
                                            <button
                                              onClick={() => setEditingEntry(null)}
                                              className="p-0.5 rounded text-gray-400 hover:bg-gray-100"
                                            ><X className="w-3 h-3" /></button>
                                          </div>
                                        ) : (
                                          <div className="flex gap-1 justify-end">
                                            <button
                                              onClick={() => setEditingEntry({ regId: e.reg.id, entryId: p.id, type: 'vendor', amount: p.amount.toString(), date: p.date || '' })}
                                              className="p-0.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                            ><Pencil className="w-3 h-3" /></button>
                                            <button
                                              onClick={() => onDeletePaymentEntry?.(e.reg.id, p.id, 'vendor')}
                                              className="p-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                                            ><Trash2 className="w-3 h-3" /></button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                    </>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-semibold text-xs">
                  <td className="px-3 py-2">{turmaFilter === 'todas' ? 'TOTAL' : 'SUBTOTAL'}</td>
                  <td className="px-3 py-2 text-right">R$ {fmt(person.totals.gross)}</td>
                  <td className="px-3 py-2 text-right text-emerald-700">R$ {fmt(person.totals.netAfterTax)}</td>
                  {(person.role === 'mentor' || person.role === 'mentor+vendedor') && (
                    <td className="px-3 py-2 text-right text-purple-700">R$ {fmt(person.totals.mentorTotal)}</td>
                  )}
                  {(person.role === 'vendedor' || person.role === 'mentor+vendedor') && (
                    <td className="px-3 py-2 text-right text-amber-700">R$ {fmt(person.totals.commTotal)}</td>
                  )}
                  <td className="px-3 py-2 text-right text-indigo-700">R$ {fmt(person.totals.repasseTotal)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">R$ {fmt(person.totals.resultado)}</td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right text-blue-600">R$ {fmt(person.totals.paidAmount)}</td>
                  {(person.role === 'mentor' || person.role === 'mentor+vendedor') && (
                    <td className="px-3 py-2 text-right text-purple-600">R$ {fmt(person.totals.mentorAtual)}</td>
                  )}
                  {(person.role === 'vendedor' || person.role === 'mentor+vendedor') && (
                    <td className="px-3 py-2 text-right text-amber-600">R$ {fmt(person.totals.commAtual)}</td>
                  )}
                  <td className="px-3 py-2 text-right text-blue-700">R$ {fmt(person.totals.dueNow)}</td>
                  <td className="px-3 py-2 text-right text-green-600">R$ {fmt(person.totals.alreadyPaid)}</td>
                  <td className="px-3 py-2 text-right text-orange-600">R$ {fmt(person.totals.balance)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment History - now shown in expandable rows */}
        </div>
      ))}
    </div>
  );
}
