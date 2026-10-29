# JD (Job Description) Parser Module

This dedicated folder consolidates all files belonging to the Job Description (JD) Parser across backend, frontend, and email extraction workflows in this project.

All original files in the workspace remain completely untouched, intact, and active.

---

## Directory Structure

```text
jd-module/
├── backend/
│   ├── services/
│   │   └── jd-analyser/
│   │       ├── analyzeJd.ts                # Main orchestrator for JD analysis
│   │       ├── extract-jd.ts               # Core extraction interface
│   │       ├── llm-extract.ts              # Gemini/LLM extraction engine with schema
│   │       ├── gemini-helpers.ts           # Gemini API client & retry helpers
│   │       ├── multi-requirement-llm.ts    # Multi-role requirement detection
│   │       ├── requirement-chunks.ts       # Chunking for multi-requirement JDs
│   │       ├── jd-utils.ts                 # Regex parsers, validators & metadata tools
│   │       ├── mapToFormFields.ts          # Mappings from JD fields to form fields
│   │       └── types/
│   │           └── requirement.ts          # TypeScript type definitions for JD data
│   ├── routes/
│   │   └── jdExtract.ts                    # Express route: POST /api/ai/extract-jd
│   ├── lib/
│   │   ├── jdFieldExtractor.ts             # Rule-based fallback regex parser
│   │   └── jdFieldExtractor.test.ts        # Unit test suite for fallback parser
│   └── test-jd-extract.js                  # Standalone test runner for extract-jd
├── frontend/
│   └── api/
│       └── jdExtract.ts                    # Frontend API client (extractJdFromText, extractJdFromFile)
├── email-extraction/
│   └── test_requirement_parser_structured_jd.py  # Python evaluation test for structured JD email parsing
└── README.md                               # This documentation file
```

---

## File Inventory & Source Locations

| File in `jd-module` | Original Source Location | Role / Responsibility |
| :--- | :--- | :--- |
| `backend/services/jd-analyser/analyzeJd.ts` | `backend/src/services/jd-analyser/analyzeJd.ts` | Coordinates LLM extraction, role splitting, and form mapping. |
| `backend/services/jd-analyser/extract-jd.ts` | `backend/src/services/jd-analyser/extract-jd.ts` | Dispatches extraction requests to configured LLM provider. |
| `backend/services/jd-analyser/llm-extract.ts` | `backend/src/services/jd-analyser/llm-extract.ts` | Primary Gemini LLM prompt pipeline and structured JSON parsing. |
| `backend/services/jd-analyser/gemini-helpers.ts` | `backend/src/services/jd-analyser/gemini-helpers.ts` | API communication with Google Gemini model. |
| `backend/services/jd-analyser/multi-requirement-llm.ts` | `backend/src/services/jd-analyser/multi-requirement-llm.ts` | Identifies if a JD contains multiple job positions. |
| `backend/services/jd-analyser/requirement-chunks.ts` | `backend/src/services/jd-analyser/requirement-chunks.ts` | Splits multi-role JDs into independent chunks. |
| `backend/services/jd-analyser/jd-utils.ts` | `backend/src/services/jd-analyser/jd-utils.ts` | Utility functions for cleaning text and regex extractions. |
| `backend/services/jd-analyser/mapToFormFields.ts` | `backend/src/services/jd-analyser/mapToFormFields.ts` | Adapts parsed JD attributes into requirement form values. |
| `backend/services/jd-analyser/types/requirement.ts` | `backend/src/services/jd-analyser/types/requirement.ts` | TypeScript interfaces for requirement attributes. |
| `backend/routes/jdExtract.ts` | `backend/src/routes/jdExtract.ts` | API endpoint accepting pasted text or uploaded PDF/DOCX. |
| `backend/lib/jdFieldExtractor.ts` | `backend/src/lib/jdFieldExtractor.ts` | Deterministic regex parser used as resilient fallback. |
| `backend/lib/jdFieldExtractor.test.ts` | `backend/src/lib/jdFieldExtractor.test.ts` | Jest unit tests verifying rule-based parser outputs. |
| `backend/test-jd-extract.js` | `backend/test-jd-extract.js` | Integration script verifying `POST /api/ai/extract-jd`. |
| `frontend/api/jdExtract.ts` | `Staffing_Recruitment_Frontend/src/lib/api/jdExtract.ts` | Frontend service calling the backend JD API. |
| `email-extraction/test_requirement_parser_structured_jd.py` | `Auto_email_extraction_final/...` | Python test suite verifying structured JD email parsing. |
