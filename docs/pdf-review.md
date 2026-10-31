# WE Training PDF Review

This is a source map for the local training set in `we data/`. The OCR files are working files under `tmp/pdfs/ocr_text/` and are intentionally not published. The PDFs mix procedure guides, screenshots, exams, and older tool/SLA examples; a training value is not automatically a current operating rule. Use the live TTS/CST360/BSS/Wiki procedure whenever it differs.

## Per-file review map

| PDF | Main material found | Website mapping / review result |
| --- | --- | --- |
| `day 2.pdf` | DSL/FTTH topology, cabinet, DSLAM, NAT basics | Reference context; not a call decision on its own. |
| `day 3 .pdf` | FTTH availability, new request, follow-up, cancellation | Existing request/FTTH paths and availability guidance; check current order screen for eligibility and SLA. |
| `day 4.pdf` | Installation and fixed-voice requests, workgroups and follow-up | Existing request and order-follow-up reference; workgroup timing must come from the live ticket. |
| `day 5.pdf` | Packages, eligibility, speed and service information | Package catalog/reference; old prices, quota labels, and speed rules require BSS confirmation. |
| `day 6.pdf` | FBB case detection, Outage, billing/suspension and initial triage | Existing preflight sequence: open TT → outage → billing/account → quota → technical classification. |
| `day 7.pdf` | Data Down checks, ASSIA, outage and physical-line cases | Existing Data Down/Physical paths; outage timeframes and account conditions are live-system values. |
| `day 8.pdf` | Physical Instability, troubleshooting, IU updates and technical SRs | Existing Physical flow; Voice Verification is applied where the specific procedure requires it, not as an unconditional step for every physical case. |
| `day 9.pdf` | Bad Line Quality, speed/line comparisons, ASSIA, Need Optimization and escalation | Added separate BLQ and Slowness sequences with ASSIA freshness/Line ID, current-matrix comparison, optimization branch, evidence capture, and ticket/SLA verification. Historical thresholds are not hardcoded. |
| `day 10 .pdf` | Fixed-broadband non-technical requests, follow-ups, packages and service cases | Existing inquiry/request material; verify current request category and SLA in the live system. |
| `day 11 .pdf` | Logical Verification: account state, Speed Variance, accepted logs, IP, browsing and instability | Added account-active and Speed Variance gates before Logical classification; Speed Variance takes precedence and quota depletion is excluded. Existing IP/browsing paths remain. |
| `day 12.pdf` | Outage and major fault, Gaming and IOT cases | Added separate Gaming/Ping and Compatibility flows with ASSIA-first triage, ordered diagnostic steps, existing-case lookup, and an IReport record checklist. Training-only follow-up times are flagged for live verification. |
| `day13.pdf` | Logical Instability, Multiple Login, No Multiple Login, Slowness and NOC updates | Added utilization → ASSIA → NST/logs → login interval → quota/Wi-Fi-vs-service-drop → reset/CPE → escalation sequence. The source contradicts itself on the 3-minute category boundary; the UI flags this rather than silently deciding. |
| `day14.pdf` | Enterprise services, CNAM, FTTH and business process | Existing enterprise reference material; validate current offering and field restrictions before quoting or submitting. |
| `day 15 .pdf` | Enterprise products and customer qualification | Existing enterprise reference material; current availability, pricing and eligibility must be checked in the live catalog. |
| `exam.pdf` | Mixed knowledge checks across the training material | Used only as a cross-check, not as an independent procedure or source of truth. |
| `second  quize.pdf` | Voice Down and ticket-update questions | Cross-check only; the applicable IU/TTS update controls actual follow-up. |
| `third quiz .pdf` | Package changes, phone-number changes and SLA questions | Cross-check only; do not use an exam answer instead of the current system. |
| `SLA.pdf` | Training SLA tables for NOC, Logical Instability, Slowness, BLQ and other cases | SLA references are shown with verification notes. Separate agent follow-up from the timeframe promised to the customer; read the exact TT/TTS SLA before promising it. |
| `iu update.pdf` | IU Physical Instability and Voice Down/overlapping updates | Use the latest IU ticket status and current callback/update instructions; do not assume every physical case has the same customer promise. |
| `noc update.pdf` | NOC Logical Instability, utilization scripts and CPE follow-up | Reflected in Logical end actions and source notes; current outage/update status and ticket instructions override training examples. |

## Changes made in this review

- The Logical entry now checks account status and Speed Variance before symptom classification.
- Logical Instability, Slowness, Bad Line Quality, and Gaming/Ping each have distinct paths. Their questions tell the CCA what to ask; the action panel says what to inspect internally.
- Intermediate Physical findings stop the Logical path and direct the CCA back to the Physical flow, avoiding a loop between the two trees.
- Ticket/IR numbers are placeholders for the actual number returned by the system. The customer script distinguishes the employee's follow-up SLA from the customer's official ticket timeframe.
- Search now recognizes Arabic/English variants for Logical Instability, BLQ, Gaming, Ping, and latency. The reference mode searches the local support tree and does not claim to be a generative AI or a live-system lookup.

## Limits that must remain visible

- Several training PDFs show legacy screens, values, categories, or procedures. In particular, the 3-minute Multiple Login definition conflicts within `day13.pdf`; older ADSL/VDSL speed thresholds in `day 9.pdf` are not current policy by themselves.
- A PDF review cannot establish that every procedure is still active or prove that every possible company case is represented. Validate changed policies with the current Wiki/TTS and the process owner before using them live.
- The PDFs and OCR are local source material and are not included in GitHub. This file records the review map, not a claim that every screenshot or quiz item is an executable workflow.
