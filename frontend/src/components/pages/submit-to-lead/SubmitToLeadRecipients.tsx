import React from 'react'
import { SubmitToLeadVm } from './useSubmitToLeadPage'

export function SubmitToLeadRecipients({ vm }: { vm: SubmitToLeadVm }) {
  const {
    requirement,
    forwardLoopChecked,
    threadSubject,
    setThreadSubject,
    recruiterName,
    setRecruiterName,
    recruiterEmail,
    setRecruiterEmail,
    toRecipients,
    ccRecipients,
    newToInput,
    setNewToInput,
    newCcInput,
    setNewCcInput,
    handleAddToRecipient,
    handleAddCcRecipient,
    handleRemoveTo,
    handleRemoveCc,
  } = vm
  return (
    <>
        {/* EMAIL THREAD SETUP & PICTURE SENDING INFORMATION SECTION */}
        {forwardLoopChecked && (
          <div className="space-y-6 pt-2 animate-in fade-in duration-200 w-full">
              {/* HOW THE EMAIL LOOP CONNECTS BOX */}
              <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-4 text-xs text-slate-700 space-y-1.5">
                <span className="font-extrabold text-blue-900 block mb-1">How the email loop connects</span>
                <p className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Auto-ingested requirements</strong> — the app stores the Microsoft Graph message ID from the <span className="text-emerald-700 underline font-bold">linked mailbox message (ready)</span>.</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Manually created requirements</strong> — paste the exact original subject below and click <strong>Find email thread</strong>. The app searches <span className="font-mono text-slate-900">recruitment.application@metaforgeit.com</span> and saves the link on this requirement.</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>On forward</strong> — the app calls Microsoft Graph <span className="font-mono text-slate-900">createReplyAll</span> on that message so your submission appears in the same client/DL thread (not a new email).</span>
                </p>
              </div>

              {/* THREAD SUBJECT */}
              <div>
                <label className="block text-slate-700 font-bold text-xs mb-1">THREAD SUBJECT</label>
                <input
                  type="text"
                  value={threadSubject}
                  onChange={e => setThreadSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-blue-50/30 border border-blue-200 rounded-xl text-xs font-semibold text-blue-950 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Pre-filled from the original requirement. Edits apply to this reply; the message stays in the same email thread.
                </span>
              </div>

              {/* FROM RECRUITER GREEN BOX */}
              <div className="bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-4 space-y-3">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                  FROM Recruiter sending this submission
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">Display name</label>
                    <input
                      type="text"
                      value={recruiterName}
                      onChange={e => setRecruiterName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold text-xs mb-1">Reply-to email</label>
                    <input
                      type="email"
                      value={recruiterEmail}
                      onChange={e => setRecruiterEmail(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Clients see <strong className="text-slate-800">{recruiterName}</strong> as the sender. Messages are delivered via <span className="font-mono text-slate-800">recruitment.application@metaforgeit.com</span>. When the client clicks <strong>Reply</strong>, the response goes to your reply-to email. <strong>Reply All</strong> keeps everyone in the original thread plus you on CC.
                </p>
              </div>

              {/* RECIPIENTS TO / CC / BCC CHIPS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* TO Column */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">TO ({toRecipients.length})</span>
                  </div>
                  <div className="space-y-1.5 min-h-[90px]">
                    {toRecipients.map(e => (
                      <div key={e} className="flex items-center justify-between px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
                        <span>{e}</span>
                        <button onClick={() => handleRemoveTo(e)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="email"
                      placeholder="Add email..."
                      value={newToInput}
                      onChange={e => setNewToInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <button onClick={handleAddToRecipient} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer">
                      + Add
                    </button>
                  </div>
                </div>

                {/* CC Column */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">CC ({ccRecipients.length})</span>
                  </div>
                  <div className="space-y-1.5 min-h-[90px]">
                    {ccRecipients.map(e => (
                      <div key={e} className="flex items-center justify-between px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700">
                        <span>{e}</span>
                        <button onClick={() => handleRemoveCc(e)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="email"
                      placeholder="Add email..."
                      value={newCcInput}
                      onChange={e => setNewCcInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <button onClick={handleAddCcRecipient} className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer">
                      + Add
                    </button>
                  </div>
                </div>

                {/* BCC Column */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <span className="text-xs font-extrabold text-slate-900">BCC</span>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400 my-auto">
                    Drop recipients here
                  </div>
                  <div className="flex gap-2 pt-1">
                    <input
                      type="email"
                      placeholder="Add email..."
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <button className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer">
                      + Add
                    </button>
                  </div>
                </div>
              </div>
          </div>
        )}
    </>
  )
}
