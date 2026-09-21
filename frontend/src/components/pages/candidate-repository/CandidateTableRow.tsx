import React from 'react'
import { Briefcase, Eye, EyeOff, Phone, Send, ShieldAlert } from 'lucide-react'
import { checkDuplicateSubmission } from '../../../data/submissionsStore'
import { maskEmail, maskPhone } from './masking'
import { CandidateRepoItem } from './types'
import { CandidateRepoVm } from './useCandidateRepository'

export function CandidateTableRow({ item, vm }: { item: CandidateRepoItem; vm: CandidateRepoVm }) {
  const {
    unmaskedIds,
    selectedIds,
    activeReqId,
    setViewingCandidateDetail,
    activeRequirement,
    toggleSelectCandidate,
    unmaskedTimers,
    toggleMask,
    isLeadRole,
    handleSubmitSingleToLead,
    showToast,
    handleOpenEdit,
  } = vm
                const isUnmasked = unmaskedIds.has(item.id)
                const isSelected = selectedIds.has(item.id)
                const dupCheck = activeReqId
                  ? checkDuplicateSubmission(activeReqId, {
                      email: item.email,
                      phone: item.phone,
                      candidateId: item.candidateId,
                      name: item.name,
                    })
                  : { isDuplicate: false }
  return (
                  <tr
                    key={item.id}
                    onClick={() => setViewingCandidateDetail(item)}
                    className={`hover:bg-purple-50/40 cursor-pointer transition-colors group ${
                      isSelected ? 'bg-purple-50/30' : ''
                    } ${dupCheck.isDuplicate ? 'bg-rose-50/20' : ''}`}
                  >
                    {/* Checkbox (shown only when requirement is selected) */}
                    {activeRequirement && (
                      <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => toggleSelectCandidate(item.id, e)}
                          className="w-4 h-4 text-[#6B3BF6] rounded-md focus:ring-[#6B3BF6] cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Candidate Name, Role & ID & Status / Duplicate Badge */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-xs group-hover:text-[#6B3BF6] transition-colors">
                          {item.name}
                        </span>
                        {dupCheck.isDuplicate ? (
                          <span
                            className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 shrink-0 inline-flex items-center gap-1"
                            title={`Already submitted by ${dupCheck.existingSubmission?.recruiter || 'another recruiter'} on ${dupCheck.existingSubmission?.date}`}
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Duplicate Submission</span>
                          </span>
                        ) : (
                          item.status && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0">
                              {item.status}
                            </span>
                          )
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-[#6B3BF6] font-bold mt-1">
                        <Briefcase className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[210px]" title={item.technology}>{item.technology}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        ID: {item.candidateId}
                      </div>
                    </td>

                    {/* Current Company */}
                    <td className="px-4 py-4 text-slate-800 font-semibold">
                      {item.currentCompany || '—'}
                    </td>

                    {/* Contact (Email & Phone with Eye toggle & 5s session timeout) */}
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <div className="space-y-1">
                        <div className="font-mono text-slate-700 text-xs truncate max-w-[190px]" title={isUnmasked ? item.email : maskEmail(item.email)}>
                          {isUnmasked ? item.email : maskEmail(item.email)}
                        </div>
                        <div className="flex items-center justify-between gap-1.5 font-mono text-slate-500 text-[11px]">
                          <span>{isUnmasked ? item.phone : maskPhone(item.phone)}</span>
                          <button
                            type="button"
                            onClick={e => toggleMask(item.id, e)}
                            className={`px-1.5 py-0.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                              isUnmasked
                                ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title={isUnmasked ? 'Click to re-mask contact info immediately' : 'Click to view unmasked contact info for 20 seconds'}
                          >
                            {isUnmasked ? (
                              <>
                                <EyeOff className="w-3 h-3 text-amber-600" />
                                <span className="text-[9px] font-black text-amber-700 tabular-nums">{unmaskedTimers[item.id] ?? 20}s</span>
                              </>
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>



                    {/* Total Experience */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900">{item.totalExperience}</div>
                      {item.relevantExperience && (
                        <div className="text-[10px] text-slate-400">Rel: {item.relevantExperience}</div>
                      )}
                    </td>

                    {/* Created By */}
                    <td className="px-4 py-4 text-slate-600 font-medium whitespace-nowrap">
                      <div>{item.createdBy}</div>
                      <div className="text-[10px] text-slate-400">{item.createdDate}</div>
                    </td>

                    {/* Action Buttons: Submit / Duplicate, Call & Edit */}
                    <td className="px-4 py-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {!isLeadRole && activeRequirement && (
                          dupCheck.isDuplicate ? (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                showToast(
                                  `⚠️ Duplicate Submission: Candidate "${item.name}" has already been submitted for ${activeRequirement.title} (${activeRequirement.id}) by ${dupCheck.existingSubmission?.recruiter || 'another recruiter'}.`
                                )
                              }}
                              className="px-2.5 py-1.5 border border-rose-300 bg-rose-50 text-rose-800 text-xs font-bold rounded-lg cursor-not-allowed flex items-center gap-1 shrink-0"
                              title={`Already submitted by ${dupCheck.existingSubmission?.recruiter || 'another recruiter'}`}
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              <span>Duplicate Submission</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={e => handleSubmitSingleToLead(item, e)}
                              className="px-3 py-1.5 border border-purple-300 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs active:scale-98 flex items-center gap-1 shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit</span>
                            </button>
                          )
                        )}
                        <a
                          href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                          onClick={e => {
                            e.stopPropagation()
                            if (!unmaskedIds.has(item.id)) {
                              toggleMask(item.id, e)
                            }
                            showToast(`Initiating call to ${item.name} (${item.phone})...`)
                          }}
                          className="px-2.5 py-1.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-98"
                          title={`Call candidate ${item.name}`}
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Call</span>
                        </a>
                        <button
                          type="button"
                          onClick={e => handleOpenEdit(item, e)}
                          className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
  )
}
