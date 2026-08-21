import { useState } from 'react';
import {
  Pill,
  AlertTriangle,
  TrendingDown,
  Package,
  FileText,
  X,
  ShoppingCart,
} from 'lucide-react';

interface Drug {
  id: string;
  name: string;
  batchNo: string;
  manufactureDate: string;
  expiryDate: string;
  quantity: number;
  reorderThreshold: number;
  supplier: string;
}

const demoDrugs: Drug[] = [
  { id: '1', name: 'Amoxicillin 500mg', batchNo: 'AMX-2026-A', manufactureDate: '2025-06-01', expiryDate: '2027-06-01', quantity: 12, reorderThreshold: 50, supplier: 'PharmaCo Ltd' },
  { id: '2', name: 'Metformin 500mg', batchNo: 'MTF-2026-B', manufactureDate: '2025-08-15', expiryDate: '2027-08-15', quantity: 340, reorderThreshold: 100, supplier: 'MediSupply' },
  { id: '3', name: 'Amlodipine 5mg', batchNo: 'AML-2025-C', manufactureDate: '2025-03-10', expiryDate: '2027-03-10', quantity: 85, reorderThreshold: 60, supplier: 'PharmaCo Ltd' },
  { id: '4', name: 'Paracetamol 500mg', batchNo: 'PCM-2026-D', manufactureDate: '2026-01-20', expiryDate: '2028-01-20', quantity: 8, reorderThreshold: 80, supplier: 'Global Meds' },
  { id: '5', name: 'Ibuprofen 400mg', batchNo: 'IBU-2025-E', manufactureDate: '2025-04-05', expiryDate: '2027-04-05', quantity: 156, reorderThreshold: 70, supplier: 'MediSupply' },
  { id: '6', name: 'Omeprazole 20mg', batchNo: 'OMP-2026-F', manufactureDate: '2026-02-14', expiryDate: '2028-02-14', quantity: 22, reorderThreshold: 50, supplier: 'Global Meds' },
];

function getExpiryStatus(date: string) {
  const expiry = new Date(date);
  const now = new Date();
  const days = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: 'Expired', color: 'text-red-600 bg-red-50' };
  if (days <= 180) return { label: `Expires in ${days}d`, color: 'text-amber-600 bg-amber-50' };
  return { label: 'Valid', color: 'text-emerald-600 bg-emerald-50' };
}

export default function HmsPharmacy() {
  const [drugs] = useState<Drug[]>(demoDrugs);
  const [poModal, setPoModal] = useState<Drug | null>(null);

  // FIFO sort: earliest expiry first
  const sortedDrugs = [...drugs].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const lowStock = drugs.filter(d => d.quantity <= d.reorderThreshold);
  const expired = drugs.filter(d => new Date(d.expiryDate) < new Date());

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pharmacy & Inventory Management</h2>
        <p className="text-sm text-slate-500">Batch tracking, FIFO logic, expiry timelines, auto-purchase orders</p>
      </div>

      {/* Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">Low Stock Alert — {lowStock.length} item(s) below reorder threshold</h3>
          </div>
          <div className="space-y-1.5">
            {lowStock.map(d => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-orange-700">{d.name} — {d.quantity} units left (threshold: {d.reorderThreshold})</span>
                <button
                  onClick={() => setPoModal(d)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-orange-600 text-white rounded-lg text-xs font-medium hover:bg-orange-700"
                >
                  <ShoppingCart className="w-3 h-3" /> Generate PO
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {expired.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700"><strong>{expired.length}</strong> expired drug(s) need immediate disposal.</p>
        </div>
      )}

      {/* Inventory table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-800">Drug Inventory (FIFO sorted — earliest expiry first)</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Drug Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Batch No.</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Mfg Date</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Expiry</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">Qty</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedDrugs.map(d => {
                const exp = getExpiryStatus(d.expiryDate);
                const isLow = d.quantity <= d.reorderThreshold;
                return (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-slate-400" />
                        {d.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{d.batchNo}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(d.manufactureDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(d.expiryDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${isLow ? 'text-orange-600' : 'text-slate-900'}`}>{d.quantity}</span>
                      {isLow && <TrendingDown className="w-3.5 h-3.5 text-orange-500 inline ml-1" />}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${exp.color}`}>{exp.label}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.supplier}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase order modal */}
      {poModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Auto-Generated Purchase Order</h3>
              </div>
              <button onClick={() => setPoModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Drug:</span> <strong>{poModal.name}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Supplier:</span> {poModal.supplier}</div>
                <div className="flex justify-between"><span className="text-slate-400">Current Stock:</span> {poModal.quantity} units</div>
                <div className="flex justify-between"><span className="text-slate-400">Reorder Threshold:</span> {poModal.reorderThreshold} units</div>
                <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-400">Order Quantity:</span> <strong className="text-emerald-600">{poModal.reorderThreshold * 3} units</strong></div>
              </div>
              <p className="text-xs text-slate-400">
                Suggested order quantity is 3x the reorder threshold to maintain adequate stock levels.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPoModal(null)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                >
                  Confirm & Send PO
                </button>
                <button onClick={() => setPoModal(null)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
