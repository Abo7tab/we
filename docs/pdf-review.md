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
| `exam.pdf` | Mixed knowledge checks across the training material | Added 95 unique OCR-extracted questions after removing two repeated stems; answer keys follow the scan. It is a training source, not an independent procedure or source of truth. |
| `second  quize.pdf` | Voice Down and ticket-update questions | Added 40 question records with the scanned answer keys; the applicable IU/TTS update controls actual follow-up. |
| `third quiz .pdf` | Package changes, phone-number changes and SLA questions | Added 39 unique questions after removing one stem already present in the Pre-Assessment; answer selections were checked against the completed quiz. Do not use an exam answer instead of the current system. |
| `final review 1.pdf`–`final review 4.pdf` | Scored pre-assessment questions 1–80: physical/logical cases, escalations, requests, tools, and account handling | Source for the 80-question Pre-Assessment set in the exam section. Values that can change, especially SLAs and eligibility, are marked for live verification. |
| `revewi a.pdf`, `revewi b.pdf`, `revewi c.pdf`, `revewi e.pdf` | Overlapping pre-assessment question blocks covering the same training topics | Used as OCR cross-checks for the same 80-question set; these repeated copies are not counted again. Training answers remain study aids, not current policy. |
| `SLA.pdf` | Training SLA tables for NOC, Logical Instability, Slowness, BLQ and other cases | SLA references are shown with verification notes. Separate agent follow-up from the timeframe promised to the customer; read the exact TT/TTS SLA before promising it. |
| `iu update.pdf` | IU Physical Instability and Voice Down/overlapping updates | Use the latest IU ticket status and current callback/update instructions; do not assume every physical case has the same customer promise. |
| `noc update.pdf` | NOC Logical Instability, utilization scripts and CPE follow-up | Reflected in Logical end actions and source notes; current outage/update status and ticket instructions override training examples. |

## Changes made in this review

- The Logical entry now checks account status and Speed Variance before symptom classification.
- Logical Instability, Slowness, Bad Line Quality, and Gaming/Ping each have distinct paths. Their questions tell the CCA what to ask; the action panel says what to inspect internally.
- Intermediate Physical findings stop the Logical path and direct the CCA back to the Physical flow, avoiding a loop between the two trees.
- Ticket/IR numbers are placeholders for the actual number returned by the system. The customer script distinguishes the employee's follow-up SLA from the customer's official ticket timeframe.
- Search now recognizes Arabic/English variants for Logical Instability, BLQ, Gaming, Ping, and latency. The reference mode searches the local support tree and does not claim to be a generative AI or a live-system lookup.
- The exam section presents one multiple-choice question at a time. Selecting an option immediately shows whether it is correct, the correct answer, and an explanation; the final screen shows the score and allows a restart.
- The exam bank has 282 unique question stems: 80 Pre-Assessment questions, 95 from `exam.pdf`, 40 from the second quiz, 39 from the third quiz, and 28 curated questions from the final review PDFs. Three exact duplicate stems were removed; repeated Pre-Assessment copies across review PDFs are counted once. The other day-by-day PDFs are procedure/training references, not additional exam banks.
- Each imported item displays its source. The explanation for imported items reports the answer marked by the source key; the PDFs do not provide a rationale for every answer.
- The exam runs in shuffled, non-repeating rounds of up to 20 questions, mixing True/False with multiple choice. A round result offers the next unused set; the pool can be restarted after all questions are answered.
- The Practical Cases simulator starts 31 customer situations (11 original and 20 added) at matching nodes in the Arabic/English call trees. It reuses the guide’s checks, branches, terminal action and customer script instead of maintaining a second, potentially conflicting procedure set.
- The Third Quiz port-status image is cropped and displayed with its related exam question and simulator case. Other questions show an image when an `image` field is attached.
- The exam section loads independently of the decision tree so a tree-loading error cannot block the exam.
- Each guided step shows separate "how to check" and "what to do" guidance; where a step has no case-specific check text yet, the UI gives a safe instruction to verify the named customer/system result and avoid guessing.
- The main screen has quick searchable SLA, close-code, and package panels. Package rows are searchable by published name, speed, quota, and other table fields; the source data does not define packages by number of household members, so the UI does not invent that mapping.

## Limits that must remain visible

- Several training PDFs show legacy screens, values, categories, or procedures. In particular, the 3-minute Multiple Login definition conflicts within `day13.pdf`; older ADSL/VDSL speed thresholds in `day 9.pdf` are not current policy by themselves.
- A PDF review cannot establish that every procedure is still active or prove that every possible company case is represented. Validate changed policies with the current Wiki/TTS and the process owner before using them live.
- The PDFs and OCR are local source material and are not included in GitHub. This file records the review map, not a claim that every screenshot or quiz item is an executable workflow.
- Exam pages are scans, so the text was read with local OCR and checked against overlapping review copies where available. Sixteen imported distractor choices were not legible and are explicitly marked in the exam UI. Wording and keys may still contain OCR or source errors; this review cannot guarantee zero errors. Quiz answers do not override current procedures.
