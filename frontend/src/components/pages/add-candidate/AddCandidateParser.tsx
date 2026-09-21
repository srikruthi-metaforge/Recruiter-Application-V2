import React from 'react'
import { Upload, Sparkles, Bookmark } from 'lucide-react'
import { AddCandidateVm } from './useAddCandidatePage'

export function AddCandidateParser({ vm }: { vm: AddCandidateVm }) {
  const {
    importMode,
    setImportMode,
    isParsing,
    parsedFileName,
    draftsList,
    handleParseResume,
  } = vm
  return (
    <>
      {/* SECTION 1: RESUME PARSER CARD */}
      <div className="bg-emerald-50/40 rounded-2xl border-2 border-dashed border-emerald-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Resume Parser
              {parsedFileName && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Parsed: {parsedFileName}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Drop one or many resumes (PDF, DOCX, DOC, TXT). Metaforge AI fills
              candidate details automatically. In bulk mode, review and submit
              each candidate — the queue keeps all parsed resumes until you
              finish.
            </p>
          </div>

          {/* SINGLE / BULK / DRAFTS IMPORT TOGGLE */}
          <div className="bg-emerald-100/70 p-1 rounded-lg flex items-center shrink-0 border border-emerald-200 flex-wrap gap-1">
            <button
              onClick={() => setImportMode('single')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                importMode === 'single'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-800 hover:text-emerald-900'
              }`}
            >
              Single candidate
            </button>
            <button
              onClick={() => setImportMode('bulk')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                importMode === 'bulk'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-800 hover:text-emerald-900'
              }`}
            >
              Bulk import
            </button>
            <button
              onClick={() => setImportMode('drafts')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                importMode === 'drafts'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200 border border-amber-300/80'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-700" />
              <span>Saved for Later ({draftsList.length})</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          {/* DROPZONE AREA */}
          <div
            onClick={handleParseResume}
            className="w-full sm:w-80 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 text-center bg-white cursor-pointer transition-all hover:shadow-sm group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-700">
              Drop file here or <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              PDF, DOC, DOCX • Max 5.0 MB
            </p>
          </div>

          {/* PARSE ACTIONS */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (parsedFileName) alert(`Viewing parsed file: ${parsedFileName}`)
                else alert('Please upload or parse a resume first.')
              }}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              View
            </button>
            <button
              type="button"
              onClick={handleParseResume}
              disabled={isParsing}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isParsing ? 'Parsing with AI...' : 'Parse resume'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
