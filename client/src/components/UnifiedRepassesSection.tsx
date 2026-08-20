import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, BarChart3 } from "lucide-react";

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
}

interface PersonReport {
  name: string;
  role: 'mentor' | 'vendedor' | 'mentor+vendedor';
  entries: Array<{
    reg: Registration;
    netAfterTax: number;
    paidAmountReais: number;
    paidRatio: number;
    mentorTotal: number;
    commTotal: number;
    dueNow: number;
    alreadyPaid: number;
    balance: number;
  }>;
  totals: {
    netAfterTax: number;
    paidAmount: number;
    mentorTotal: number;
    commTotal: number;
    dueNow: number;
    alreadyPaid: number;
    balance: number;
  };
}

export default function UnifiedRepassesSection({ registrations, vendors, calculateCommissions, rc }: Props) {
  const [turmaFilter, setTurmaFilter] = useState<'todas' | 'turma_2' | 'turma_3' | 'turma_4'>('todas');

  const filtered = turmaFilter === 'todas' ? registrations : registrations.filter(r => r.turma === turmaFilter);

  // Build per-person reports
  const buildReports = (): PersonReport[] => {
    const people: Record<string, PersonReport> = {};

    // Hamilton Felix as mentor (always)
    const HF_NAME = "Hamilton Felix";
    if (!people[HF_NAME]) {
      people[HF_NAME] = { name: HF_NAME, role: 'mentor', entries: [], totals: { netAfterTax: 0, paidAmount: 0, mentorTotal: 0, commTotal: 0, dueNow: 0, alreadyPaid: 0, balance: 0 } };
    }

    // Process all registrations
    for (const reg of filtered) {
      const bc = rc(reg);
      const comms = calculateCommissions(reg, bc);
      const paidAmountReais = (reg.paidAmount || 0) / 100;
      const ns = (reg.paymentStatus || '').toLowerCase().trim();
      const paidRatio = ns === 'pago' ? 1 : ns === 'parcial' && comms.gross > 0 ? paidAmountReais / comms.gross : 0;

      // Hamilton entry (mentor)
      const hfDueNow = Math.round(comms.hfComm * paidRatio);
      const hfPaid = reg.hamiltonPaid || 0;
      people[HF_NAME].entries.push({
        reg,
        netAfterTax: comms.netAfterTax,
        paidAmountReais,
        paidRatio,
        mentorTotal: comms.hfComm,
        commTotal: 0,
        dueNow: hfDueNow,
        alreadyPaid: hfPaid,
        balance: hfDueNow - hfPaid,
      });

      // Vendor entry (if has vendor with commission)
      if (reg.vendor?.trim()) {
        const vendorName = reg.vendor.trim();
        const vendorObj = vendors.find(v => v.name === vendorName);
        if (vendorObj && vendorObj.hasCommission !== false) {
          if (!people[vendorName]) {
            people[vendorName] = { name: vendorName, role: 'vendedor', entries: [], totals: { netAfterTax: 0, paidAmount: 0, mentorTotal: 0, commTotal: 0, dueNow: 0, alreadyPaid: 0, balance: 0 } };
          }
          const commDueNow = Math.round(comms.vendorComm * paidRatio);
          const commPaid = reg.vendorCommissionPaid || 0;
          people[vendorName].entries.push({
            reg,
            netAfterTax: comms.netAfterTax,
            paidAmountReais,
            paidRatio,
            mentorTotal: 0,
            commTotal: comms.vendorComm,
            dueNow: commDueNow,
            alreadyPaid: commPaid,
            balance: commDueNow - commPaid,
          });
        }
      }
    }

    // Check if Hamilton is also a vendor
    if (people[HF_NAME]) {
      const hfAsVendor = people[HF_NAME];
      // Check if HF also appears as vendor
      const hfVendorEntries = filtered.filter(r => r.vendor?.trim() === HF_NAME);
      if (hfVendorEntries.length > 0) {
        people[HF_NAME].role = 'mentor+vendedor';
        // Merge vendor comms into HF entries
        for (const entry of people[HF_NAME].entries) {
          if (entry.reg.vendor?.trim() === HF_NAME) {
            const bc = rc(entry.reg);
            const comms = calculateCommissions(entry.reg, bc);
            entry.commTotal = comms.vendorComm;
            const commDueNow = Math.round(comms.vendorComm * entry.paidRatio);
            entry.dueNow += commDueNow;
            entry.alreadyPaid += (entry.reg.vendorCommissionPaid || 0);
            entry.balance = entry.dueNow - entry.alreadyPaid;
          }
        }
      }
    }

    // Calculate totals
    for (const person of Object.values(people)) {
      person.totals = person.entries.reduce((acc, e) => ({
        netAfterTax: acc.netAfterTax + e.netAfterTax,
        paidAmount: acc.paidAmount + e.paidAmountReais,
        mentorTotal: acc.mentorTotal + e.mentorTotal,
        commTotal: acc.commTotal + e.commTotal,
        dueNow: acc.dueNow + e.dueNow,
        alreadyPaid: acc.alreadyPaid + e.alreadyPaid,
        balance: acc.balance + e.balance,
      }), { netAfterTax: 0, paidAmount: 0, mentorTotal: 0, commTotal: 0, dueNow: 0, alreadyPaid: 0, balance: 0 });
    }

    return Object.values(people).filter(p => p.entries.length > 0);
  };

  const reports = buildReports();
  const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <User className="h-5 w-5" />
          Repasses (Mentores e Vendedores)
        </h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-2">Turma:</span>
          {(['todas', 'turma_3', 'turma_4', 'turma_2'] as const).map(t => (
            <Button key={t} size="sm" variant={turmaFilter === t ? 'default' : 'outline'} onClick={() => setTurmaFilter(t)} className="h-6 text-xs px-2">
              {t === 'todas' ? 'Todas' : t === 'turma_3' ? 'T3' : t === 'turma_4' ? 'T4' : 'T2'}
            </Button>
          ))}
        </div>
      </div>

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
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="px-3 py-2 font-medium text-gray-600">Aluno</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Líquido</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-center">Status</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Valor Pago</th>
                  {(person.role === 'mentor' || person.role === 'mentor+vendedor') && (
                    <th className="px-3 py-2 font-medium text-gray-600 text-right">Mentor (total)</th>
                  )}
                  {(person.role === 'vendedor' || person.role === 'mentor+vendedor') && (
                    <th className="px-3 py-2 font-medium text-gray-600 text-right">Comissão (total)</th>
                  )}
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Devido</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Já Paguei</th>
                  <th className="px-3 py-2 font-medium text-gray-600 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {person.entries.map((e, idx) => {
                  const ns = (e.reg.paymentStatus || '').toLowerCase().trim();
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-1.5">
                        <p className="font-medium text-gray-900">{e.reg.name}</p>
                        <p className="text-[10px] text-gray-400">{e.reg.paymentMethod === 'pix' ? 'PIX' : e.reg.paymentMethod === 'installments10' ? '10x' : '5x'}</p>
                      </td>
                      <td className="px-3 py-1.5 text-right text-emerald-700">R$ {fmt(e.netAfterTax)}</td>
                      <td className="px-3 py-1.5 text-center">
                        <Badge className={`text-[10px] ${ns === 'pago' ? 'bg-green-600' : ns === 'parcial' ? 'bg-amber-500' : 'bg-red-500'}`}>
                          {ns === 'pago' ? 'Pago' : ns === 'parcial' ? 'Parcial' : 'Pend'}
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5 text-right text-blue-600 font-medium">R$ {fmt(e.paidAmountReais)}</td>
                      {(person.role === 'mentor' || person.role === 'mentor+vendedor') && (
                        <td className="px-3 py-1.5 text-right text-purple-700">R$ {fmt(e.mentorTotal)}</td>
                      )}
                      {(person.role === 'vendedor' || person.role === 'mentor+vendedor') && (
                        <td className="px-3 py-1.5 text-right text-amber-700">R$ {fmt(e.commTotal)}</td>
                      )}
                      <td className="px-3 py-1.5 text-right text-blue-700 font-medium">R$ {fmt(e.dueNow)}</td>
                      <td className="px-3 py-1.5 text-right text-green-600">{e.alreadyPaid > 0 ? `R$ ${fmt(e.alreadyPaid)}` : '-'}</td>
                      <td className="px-3 py-1.5 text-right">
                        <span className={`font-bold ${e.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          R$ {fmt(e.balance)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-semibold text-xs">
                  <td className="px-3 py-2">{turmaFilter === 'todas' ? 'TOTAL' : 'SUBTOTAL'}</td>
                  <td className="px-3 py-2 text-right text-emerald-700">R$ {fmt(person.totals.netAfterTax)}</td>
                  <td className="px-3 py-2"></td>
                  <td className="px-3 py-2 text-right text-blue-600">R$ {fmt(person.totals.paidAmount)}</td>
                  {(person.role === 'mentor' || person.role === 'mentor+vendedor') && (
                    <td className="px-3 py-2 text-right text-purple-700">R$ {fmt(person.totals.mentorTotal)}</td>
                  )}
                  {(person.role === 'vendedor' || person.role === 'mentor+vendedor') && (
                    <td className="px-3 py-2 text-right text-amber-700">R$ {fmt(person.totals.commTotal)}</td>
                  )}
                  <td className="px-3 py-2 text-right text-blue-700">R$ {fmt(person.totals.dueNow)}</td>
                  <td className="px-3 py-2 text-right text-green-600">R$ {fmt(person.totals.alreadyPaid)}</td>
                  <td className="px-3 py-2 text-right text-orange-600">R$ {fmt(person.totals.balance)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
