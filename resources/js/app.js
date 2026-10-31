import './bootstrap';
import { computed, createApp, h, onMounted, nextTick, ref, Transition } from 'vue';

const MAX_STEPS_PER_CALL = 100;
const DEFAULT_TREE = 'support';

function icon(name, className = 'size-5') {
    const paths = {
        router: [
            h('path', { d: 'M4 10.5a12 12 0 0 1 16 0' }),
            h('path', { d: 'M7 13.5a7.5 7.5 0 0 1 10 0' }),
            h('path', { d: 'M10 16.5a3 3 0 0 1 4 0' }),
            h('path', { d: 'M12 20h.01' }),
        ],
        cable: [
            h('path', { d: 'M8 7V4m8 3V4M6 7h12v4a6 6 0 0 1-12 0V7Z' }),
            h('path', { d: 'M12 17v3' }),
        ],
        question: [
            h('circle', { cx: '12', cy: '12', r: '9' }),
            h('path', { d: 'M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.1 1-1.7 1.4-1.7 2.7M12 17h.01' }),
        ],
        arrow: [h('path', { d: 'M19 12H5m7 7-7-7 7-7' })],
        back: [h('path', { d: 'm15 18-6-6 6-6' })],
        home: [
            h('path', { d: 'm3 10 9-7 9 7' }),
            h('path', { d: 'M5 9v11h14V9M9 20v-6h6v6' }),
        ],
        alert: [
            h('path', { d: 'M10.3 4.3 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z' }),
            h('path', { d: 'M12 9v4m0 4h.01' }),
        ],
        clock: [
            h('circle', { cx: '12', cy: '12', r: '9' }),
            h('path', { d: 'M12 7v5l3 2' }),
        ],
        chat: [
            h('path', { d: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z' }),
        ],
        copy: [
            h('rect', { x: '8', y: '8', width: '12', height: '12', rx: '2' }),
            h('path', { d: 'M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3' }),
        ],
        search: [h('circle', { cx: '10.8', cy: '10.8', r: '6.8' }), h('path', { d: 'm16 16 5 5' })],
        ticket: [h('path', { d: 'M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z' }), h('path', { d: 'M13 6v2m0 4v2m0 4v2' })],
        sun: [h('circle', { cx: '12', cy: '12', r: '4' }), h('path', { d: 'M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42' })],
        moon: [h('path', { d: 'M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z' })],
    };

    return h('svg', {
        class: className,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.8',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
    }, paths[name] ?? paths.question);
}

const QUICK_FACTS = {
    ar: [
        {
            id: 'wrong-number-payment',
            title: 'سداد على رقم آخر بالخطأ — Balance Transfer',
            terms: 'سداد رقم غلط دفع على خط اخر تحويل الرصيد wrong number paid on another number by mistake balance transfer level 3 billing refund 3h 3 hours 3 ساعات',
            body: 'جدول SLA التدريبي يذكر Balance Transfer (Paid on wrong number): TT خلال 3 ساعات إذا وافق العميل. راجع التصنيف والمهلة الحالية في TTS قبل التنفيذ؛ المرجع التدريبي قديم.',
            template: 'Paid on another number by mistake - Level 3 Billing',
            source: 'SLA.pdf — مرجع تدريبي، وليس تأكيدًا للتصنيف الحالي.',
        },
    ],
    en: [
        {
            id: 'wrong-number-payment',
            title: 'Payment sent to another number — Balance Transfer',
            terms: 'wrong number payment paid on another number by mistake balance transfer level 3 billing refund 3h 3 hours',
            body: 'The training SLA table lists Balance Transfer (Paid on wrong number): TT within 3 hours if the customer agrees. Verify today’s TTS category and SLA before acting; the training reference may be outdated.',
            template: 'Paid on another number by mistake - Level 3 Billing',
            source: 'SLA.pdf — training reference; not confirmation of the current category.',
        },
    ],
};

function optionIcon(label = '') {
    if (/adsl|router|راوتر|لمب|واي.?فاي|wifi/i.test(label)) return 'router';
    if (/cable|wire|fiber|سلك|كابل|فايبر/i.test(label)) return 'cable';
    if (/physical|فيزيائي|سلك|حرارة|dsl|adsl/i.test(label)) return 'cable';
    if (/logical|منطقي|ip|brows|تصفح|سرع|slow/i.test(label)) return 'search';
    if (/tt|ticket|تركيب|طلب|شكوى|complaint|order|تذكرة/i.test(label)) return 'ticket';
    if (/package|باقة|خدمة|service|billing|فاتورة/i.test(label)) return 'chat';
    return 'question';
}

function normalizeSearch(value = '', language = 'ar') {
    let normalized = value
        .normalize('NFKC')
        .toLocaleLowerCase(language === 'ar' ? 'ar-EG' : 'en-US');
    if (language === 'ar') {
        normalized = normalized
            .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
            .replace(/[أإآٱ]/g, 'ا')
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه');
    }
    normalized = normalized
        .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
        .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
    return normalized
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim()
        .replace(/\s+/g, ' ');
}

const COPY = {
    ar: {
        brand: 'مساعد WE للدعم الفني', title: 'دليل الدعم الفني', fresh: 'جديد', loading: 'جاري تحميل شجرة القرارات…', retry: 'إعادة المحاولة',
        missing: 'الخطوة الحالية غير موجودة في الشجرة.', step: 'الخطوة', back: 'رجوع خطوة', sla: 'المهلة:', action: 'إجراء الموظف',
        customerScript: 'نص تقوله للعميل', copy: 'نسخ نص العميل', newInquiry: 'بدء استعلام جديد', choose: 'اختيار', footer: 'تُحمّل الشجرة من Laravel، وتتم خطوات المسار داخل المتصفح.',
        copied: 'تم نسخ نص العميل.', noScript: 'لا يوجد نص عميل لنسخه في هذه الخطوة.', copyError: 'تعذر النسخ تلقائيًا. يمكنك تحديد النص ونسخه يدويًا.',
        invalidStep: 'هذا الاختيار مرتبط بخطوة غير موجودة. أبلغ المسؤول عن الشجرة.', stepLimit: 'وصل المسار إلى الحد الآمن للتنقل. أعد البدء أو راجع الشجرة.',
        incomplete: 'بيانات الخطوة التالية غير مكتملة. أبلغ المسؤول عن الشجرة.', loadError: 'تعذر تحميل شجرة القرارات.', invalidTree: 'ملف شجرة القرارات غير مكتمل.',
        askCustomer: 'اسأل العميل', referenceGuidance: 'رقم المتابعة الذي تقوله للعميل',
        descriptionCopied: 'تم نسخ Clear Description. راجع التصنيف قبل اللصق.',
        clearDescription: 'Clear Description المقترح',
        searchSource: 'المصدر', openStep: 'فتح المسار', openGuide: 'عرض دليل Outage', copyDescription: 'نسخ Clear Description', oldReference: 'مرجع تدريبي قديم؛ راجع التصنيف والمهلة الحاليين قبل الاستخدام.',
        commentGenerator: 'تعليق جاهز للتيكت / SR', commentHelp: 'مبني على اختيارات المسار. راجع النص وأضف ما نفذته فعلًا قبل اللصق؛ لا تضف بيانات شخصية أو كلمة مرور.',
        commentDetails: 'الإجراء أو نتيجة النظام (بدون بيانات العميل)', commentDetailsPlaceholder: 'اكتب ما نفذته فعلًا أو نتيجة مختصرة من النظام…',
        commentRefType: 'نوع المرجع', commentRefNumber: 'رقم المرجع من النظام', commentRefPlaceholder: 'أدخل الرقم بعد إنشائه (اختياري)',
        refNone: 'لم تُنشأ تذكرة', refTT: 'TT', refSR: 'SR', refOrder: 'رقم الطلب', refIR: 'IR داخلي',
        copyComment: 'نسخ التعليق', commentCopied: 'تم نسخ التعليق. راجعه قبل لصقه في النظام.',
        quickSearch: 'بحث سريع', quickSearchPlaceholder: 'ابحث عن إجراء أو كود أو مهلة…', noSearchResults: 'لا توجد نتيجة مطابقة مؤكدة؛ راجع النظام الحالي قبل الاعتماد عليها.', dark: 'الوضع الداكن', light: 'الوضع الفاتح',
        checkBeforeQuote: 'تحقّق قبل ما تعرض السعر', toolsHub: 'أدلة مساعدة', exceed: 'EXCEED', internalTool: 'أداة دعم داخلية', operations: 'رقم البحث والتسجيل في النظام', searchTitle: 'أبحث بأي رقم؟', recordTitle: 'أسجل إيه؟', codesTitle: 'أكواد الإغلاق الظاهرة في دليل التدريب', codesSearch: 'ابحث برقم الكود أو الوصف', codeLabel: 'الكود', reasonLabel: 'الوصف',
    },
    en: {
        brand: 'WE Technical Support Assistant', title: 'Support Guide', fresh: 'New', loading: 'Loading decision tree…', retry: 'Try again',
        missing: 'The current step is missing from the tree.', step: 'Step', back: 'Go back', sla: 'SLA:', action: 'Agent action',
        customerScript: 'What to tell the customer', copy: 'Copy customer script', newInquiry: 'Start a new inquiry', choose: 'Choose', footer: 'The tree is loaded from Laravel; steps run in your browser.',
        copied: 'Customer script copied.', noScript: 'There is no customer script to copy at this step.', copyError: 'Automatic copy failed. Select and copy the text manually.',
        invalidStep: 'This option points to a missing step. Notify the tree administrator.', stepLimit: 'The safe step limit was reached. Restart or review the tree.',
        incomplete: 'The next step data is incomplete. Notify the tree administrator.', loadError: 'Could not load the decision tree.', invalidTree: 'The decision tree file is incomplete.',
        askCustomer: 'Ask the customer', referenceGuidance: 'Reference number to give the customer',
        descriptionCopied: 'Clear Description copied. Verify the category before pasting.',
        clearDescription: 'Suggested Clear Description',
        searchSource: 'Source', openStep: 'Open path', openGuide: 'View Outage guide', copyDescription: 'Copy Clear Description', oldReference: 'Training reference may be outdated; verify the current category and SLA.',
        commentGenerator: 'Ready ticket / SR comment', commentHelp: 'Built from your path selections. Review it and add what you actually did before pasting; do not add personal data or passwords.',
        commentDetails: 'Action taken or system result (no customer data)', commentDetailsPlaceholder: 'Enter the actual action or a brief system finding…',
        commentRefType: 'Reference type', commentRefNumber: 'System reference number', commentRefPlaceholder: 'Enter after creation (optional)',
        refNone: 'No ticket created', refTT: 'TT', refSR: 'SR', refOrder: 'Order number', refIR: 'Internal IR',
        copyComment: 'Copy comment', commentCopied: 'Comment copied. Review it before pasting into the system.',
        quickSearch: 'Quick search', quickSearchPlaceholder: 'Search a procedure, code, or SLA…', noSearchResults: 'No confirmed matching result. Check the current system before relying on it.', dark: 'Dark mode', light: 'Light mode',
        checkBeforeQuote: 'Check before quoting', toolsHub: 'Quick guides', exceed: 'EXCEED', internalTool: 'Internal support tool', operations: 'Which ID and record should I use?', searchTitle: 'What should I search by?', recordTitle: 'What should I record?', codesTitle: 'Close codes listed in training guide', codesSearch: 'Search by code or reason', codeLabel: 'Code', reasonLabel: 'Reason',
    },
};

const App = {
    setup() {
        const tree = ref(null);
        const currentStepId = ref(null);
        const history = ref([]);
        const pathSelections = ref([]);
        const loading = ref(true);
        const loadError = ref('');
        const notice = ref('');
        const language = ref('ar');
        const theme = ref('light');
        const codeSearch = ref('');
        const quickSearch = ref('');
        const commentDetails = ref('');
        const commentRefType = ref('none');
        const commentRefNumber = ref('');
        const t = (key) => COPY[language.value][key] ?? key;

        const currentStep = computed(() => {
            if (!tree.value || !currentStepId.value) return null;
            return tree.value[currentStepId.value] ?? null;
        });
        const isFinished = computed(() => currentStep.value?.options?.length === 0);
        const quickSearchResults = computed(() => {
            const query = normalizeSearch(quickSearch.value, language.value);
            if (!query || !tree.value) return [];
            const terms = query.split(' ').filter(Boolean);
            const entries = [];
            for (const [id, step] of Object.entries(tree.value)) {
                if (id === 'start' || id === 'operations_guide' || !step || typeof step !== 'object') continue;
                const catalog = step.package_catalog;
                const catalogText = catalog ? [catalog.title, ...catalog.monthly_rows.map((row) => `${row.speed} ${row.quota} ${row.price}`), ...catalog.yearly_rows.map((row) => `${row.plan} ${row.quota} ${row.price}`), ...catalog.addon_rows.map((row) => `${row.kind} ${row.quota} ${row.price} ${row.term}`)].join(' ') : '';
                const content = [step.question, step.customer_prompt, step.action, step.customer_script, step.reference_guidance, step.clear_description, step.sla, catalogText,
                    ...(step.options ?? []).map((option) => option.label)].filter(Boolean).join(' ');
                entries.push({ kind: 'step', id, title: step.question, body: content, source: language.value === 'ar' ? 'شجرة الدعم' : 'Support tree' });
            }
            const outageGuide = tree.value.operations_guide?.outage_fields;
            if (outageGuide) entries.push({
                kind: 'guide', id: 'outage-fields', title: outageGuide.title,
                body: `${outageGuide.note} ${outageGuide.rows.map((row) => `${row.field}: ${row.meaning}`).join(' ')}`,
                terms: outageGuide.terms, source: language.value === 'ar' ? 'دليل قراءة سجل الأعطال' : 'Outage record guide',
            });
            for (const row of tree.value.operations_guide?.closure_codes ?? []) {
                entries.push({ kind: 'code', id: row.code, title: `${t('codeLabel')} ${row.code}`, body: row.reason, source: language.value === 'ar' ? 'جدول تدريب الإغلاق' : 'Training close-code table' });
            }
            for (const fact of QUICK_FACTS[language.value]) {
                entries.push({ kind: 'fact', id: fact.id, title: fact.title, body: fact.body, terms: fact.terms, template: fact.template, source: fact.source });
            }
            return entries.map((entry) => {
                const searchable = normalizeSearch(`${entry.title} ${entry.body} ${entry.terms ?? ''}`, language.value);
                const matched = terms.filter((term) => searchable.includes(term)).length;
                return { ...entry, score: matched, snippet: entry.body.length > 220 ? `${entry.body.slice(0, 217)}…` : entry.body };
            }).filter((entry) => entry.score === terms.length)
                .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, language.value))
                .slice(0, 10);
        });

        const generatedComment = computed(() => {
            const selected = pathSelections.value.map(({ stepId, optionIndex }) => ({
                step: tree.value?.[stepId],
                option: tree.value?.[stepId]?.options?.[optionIndex],
            })).filter((entry) => entry.option?.label);
            const issue = selected[0]?.option?.label || currentStep.value?.question || '—';
            const findings = selected.slice(1).map(({ step, option }) => `- ${step?.question ?? ''}: ${option.label}`);
            const refType = {
                none: language.value === 'ar' ? 'لم تُنشأ تذكرة جديدة' : 'No new ticket created',
                TT: 'TT', SR: 'SR', Order: language.value === 'ar' ? 'طلب' : 'Order', IR: language.value === 'ar' ? 'IR داخلي' : 'Internal IR',
            }[commentRefType.value];
            const reference = commentRefType.value === 'none'
                ? refType
                : `${refType}: ${commentRefNumber.value.trim() || (language.value === 'ar' ? '[أدخل الرقم الفعلي من النظام]' : '[enter actual system reference]')}`;
            return [
                `${language.value === 'ar' ? 'الحالة' : 'Issue'}: ${issue}`,
                ...(currentStep.value?.clear_description ? [`Clear Description: ${currentStep.value.clear_description}`] : []),
                language.value === 'ar' ? 'الفحوصات والنتائج:' : 'Checks and findings:',
                ...(findings.length ? findings : [`- ${currentStep.value?.question ?? ''}`]),
                `${language.value === 'ar' ? 'النتيجة الحالية' : 'Current finding'}: ${currentStep.value?.question ?? '—'}`,
                `${language.value === 'ar' ? 'الإجراء الذي تم فعليًا' : 'Action actually taken'}: ${commentDetails.value.trim() || (language.value === 'ar' ? '[اكتب ما نفذته]' : '[enter what you actually did]')}`,
                `${language.value === 'ar' ? 'مرجع داخلي' : 'Ticket reference'}: ${reference}`,
            ].join('\n');
        });

        function openOutageGuide() {
            const guide = document.querySelector('.operations-guide');
            if (!guide) return;
            guide.open = true;
            guide.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function afterStepChange() {
            nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }

        function jumpToStep(stepId) {
            if (!tree.value?.[stepId]) return;
            currentStepId.value = stepId;
            history.value = [];
            pathSelections.value = [];
            commentDetails.value = '';
            commentRefNumber.value = '';
            quickSearch.value = '';
            afterStepChange();
        }

        async function copyText(value, success, failure = t('copyError')) {
            try {
                await navigator.clipboard.writeText(value);
                notice.value = success;
            } catch {
                notice.value = failure;
            }
        }

        function copyComment() { copyText(generatedComment.value, t('commentCopied')); }

        async function loadTree(reset = false, nextLanguage = language.value) {
            loading.value = true;
            loadError.value = '';

            try {
                const response = await fetch(`/trees/${DEFAULT_TREE}${nextLanguage === 'en' ? '_en' : ''}`, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                if (!response.ok) throw new Error(COPY[nextLanguage].loadError);

                const data = await response.json();
                const inferredStart = Object.keys(data ?? {}).find((key) => key !== 'start' && key !== 'operations_guide');
                const startId = typeof data?.start === 'string' ? data.start : inferredStart;
                const validStart = typeof startId === 'string'
                    && Object.hasOwn(data, startId)
                    && typeof data[startId]?.question === 'string'
                    && Array.isArray(data[startId]?.options);

                if (!validStart) throw new Error(COPY[nextLanguage].invalidTree);

                tree.value = { ...data, start: startId };
                if (reset || !currentStepId.value || !Object.hasOwn(tree.value, currentStepId.value)) {
                    currentStepId.value = startId;
                    history.value = [];
                    pathSelections.value = [];
                }
                language.value = nextLanguage;
                document.documentElement.lang = nextLanguage;
                document.documentElement.dir = nextLanguage === 'ar' ? 'rtl' : 'ltr';
                document.title = nextLanguage === 'ar' ? 'WE EXCEED | مساعد الدعم الفني' : 'WE EXCEED | Technical Support Assistant';
                notice.value = '';
            } catch (error) {
                loadError.value = error instanceof Error ? error.message : COPY[nextLanguage].supportIssue;
            } finally {
                loading.value = false;
            }
        }

        function switchLanguage(next) { loadTree(false, next); }
        function switchTheme(next) {
            theme.value = next;
            try { localStorage.setItem('support-theme', next); } catch { /* preference is optional */ }
        }
        function choose(option) {
            const nextStep = option?.next_step;

            if (typeof nextStep !== 'string' || !Object.hasOwn(tree.value ?? {}, nextStep)) {
                notice.value = t('invalidStep');
                return;
            }

            if (history.value.length >= MAX_STEPS_PER_CALL) {
                notice.value = t('stepLimit');
                return;
            }

            if (typeof tree.value[nextStep]?.question !== 'string'
                || !Array.isArray(tree.value[nextStep]?.options)) {
                notice.value = t('incomplete');
                return;
            }

            history.value = [...history.value, currentStepId.value];
            const selectedIndex = currentStep.value.options.indexOf(option);
            pathSelections.value = [...pathSelections.value, { stepId: currentStepId.value, optionIndex: selectedIndex }];
            currentStepId.value = nextStep;
            notice.value = '';
            afterStepChange();
        }

        function goBack() {
            if (history.value.length === 0) return;
            currentStepId.value = history.value.at(-1);
            history.value = history.value.slice(0, -1);
            pathSelections.value = pathSelections.value.slice(0, -1);
            notice.value = '';
            afterStepChange();
        }

        function restart() {
            if (!tree.value) return;
            currentStepId.value = tree.value.start;
            history.value = [];
            pathSelections.value = [];
            commentDetails.value = '';
            commentRefType.value = 'none';
            commentRefNumber.value = '';
            quickSearch.value = '';
            notice.value = '';
            afterStepChange();
        }

        async function copyCustomerScript() {
            const script = currentStep.value?.customer_script;
            if (typeof script !== 'string' || script.length === 0) {
                notice.value = t('noScript');
                return;
            }

            try {
                await navigator.clipboard.writeText(script);
                notice.value = t('copied');
            } catch {
                notice.value = t('copyError');
            }
        }

        onMounted(() => {
            try { theme.value = localStorage.getItem('support-theme') === 'dark' ? 'dark' : 'light'; } catch { /* optional preference */ }
            loadTree(true);
        });


        return () => h('main', {
                class: `app-shell we-brand ${theme.value === 'dark' ? 'app-dark' : ''} relative isolate min-h-screen w-full overflow-x-clip bg-slate-50 px-4 py-6 pb-28 text-gray-800 sm:px-6 sm:py-10`,
        }, [
            h('div', { class: 'wave-backdrop pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 overflow-hidden sm:h-64', 'aria-hidden': 'true' }, [
                h('svg', { class: 'wave wave-one absolute bottom-0 h-full w-[200%]', viewBox: '0 0 2880 320', preserveAspectRatio: 'none' }, [
                    h('path', { d: 'M0 160 C240 220 480 90 720 145 C960 200 1200 90 1440 150 V320 H0 Z M1440 150 C1680 210 1920 80 2160 135 C2400 190 2640 80 2880 140 V320 H1440 Z', fill: '#5b2c91', opacity: '.12' }),
                ]),
                h('svg', { class: 'wave wave-two absolute bottom-0 h-[85%] w-[200%]', viewBox: '0 0 2880 320', preserveAspectRatio: 'none' }, [
                    h('path', { d: 'M0 190 C220 120 440 240 700 180 C960 120 1180 235 1440 175 V320 H0 Z M1440 175 C1660 105 1880 225 2140 165 C2400 105 2620 220 2880 160 V320 H1440 Z', fill: '#d21b8c', opacity: '.10' }),
                ]),
                h('svg', { class: 'wave wave-three absolute bottom-0 h-[70%] w-[200%]', viewBox: '0 0 2880 320', preserveAspectRatio: 'none' }, [
                    h('path', { d: 'M0 220 C260 160 470 270 730 210 C990 150 1180 275 1440 215 V320 H0 Z M1440 215 C1700 155 1910 265 2170 205 C2430 145 2620 270 2880 210 V320 H1440 Z', fill: '#8e59bd', opacity: '.14' }),
                ]),
            ]),
            h('section', {
                class: 'app-card relative z-10 mx-auto max-w-3xl rounded-[1.75rem] bg-white p-4 shadow-2xl shadow-slate-400/20 ring-1 ring-slate-900/5 sm:p-7 lg:p-9',
                'aria-busy': loading.value ? 'true' : 'false',
            }, [
                h('header', { class: 'mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4' }, [
                    h('div', { class: 'flex min-w-0 items-center gap-3' }, [
                        h('button', { class: 'brand-mark inline-flex size-12 shrink-0 items-center justify-center rounded-full transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2', type: 'button', onClick: restart, 'aria-label': t('newInquiry'), title: t('newInquiry') }, [h('img', { src: '/we-logo.svg', class: 'size-11', alt: 'WE' })]),
                        h('div', { class: 'min-w-0' }, [
                            h('div', { class: 'flex flex-wrap items-center gap-x-2 gap-y-1' }, [
                                h('button', { class: 'block text-start text-xs font-bold tracking-wide text-purple-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500', type: 'button', onClick: restart }, t('brand')),
                                h('span', { class: 'we-exceed rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-[0.14em]' }, t('exceed')),
                                h('span', { class: 'we-internal text-[10px] font-medium' }, t('internalTool')),
                            ]),
                            h('h1', { class: 'truncate text-xl font-bold text-gray-900 sm:text-2xl' }, t('title')),
                        ]),
                    ]),
                    h('div', { class: 'flex shrink-0 items-center gap-2' }, [
                        h('button', { class: 'app-control rounded-xl border px-3 py-2 text-sm font-semibold', type: 'button', onClick: () => switchLanguage(language.value === 'ar' ? 'en' : 'ar'), 'aria-label': language.value === 'ar' ? 'Switch to English' : 'التغيير إلى العربية' }, language.value === 'ar' ? 'EN' : 'عربي'),
                        h('button', { class: 'app-control rounded-xl border p-2', type: 'button', onClick: () => switchTheme(theme.value === 'light' ? 'dark' : 'light'), 'aria-label': theme.value === 'light' ? t('dark') : t('light'), title: theme.value === 'light' ? t('dark') : t('light') }, [icon(theme.value === 'light' ? 'moon' : 'sun')]),
                    ]),
                ]),
                h('section', { class: 'quick-search-panel mb-5 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4' }, [
                    h('label', { class: 'mb-2 flex items-center gap-2 text-sm font-bold text-slate-800', for: 'quick-support-search' }, [icon('search', 'size-4 text-blue-700'), t('quickSearch')]),
                    h('div', { class: 'flex gap-2' }, [
                        h('input', {
                            id: 'quick-support-search', class: 'app-control min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm',
                            type: 'search', value: quickSearch.value, placeholder: t('quickSearchPlaceholder'),
                            onInput: (event) => { quickSearch.value = event.target.value; },
                        }),
                    ]),
                    quickSearch.value.trim() ? h('div', { class: 'mt-3 space-y-2', 'aria-live': 'polite' }, quickSearchResults.value.length
                        ? quickSearchResults.value.map((result) => h('article', { class: 'search-result-card rounded-xl border border-slate-200 bg-slate-50/80 p-3', key: `${result.kind}-${result.id}` }, [
                            h('div', { class: 'flex items-start justify-between gap-3' }, [
                                h('div', { class: 'min-w-0' }, [
                                    h('h3', { class: 'font-semibold leading-6 text-slate-900' }, result.title),
                                    h('p', { class: 'mt-1 text-sm leading-6 text-slate-700' }, result.snippet),
                                    h('p', { class: 'mt-1 text-[11px] text-slate-500' }, `${t('searchSource')}: ${result.source}`),
                                    result.kind === 'fact' ? h('p', { class: 'mt-1 text-xs font-medium text-amber-800' }, t('oldReference')) : null,
                                ]),
                                result.kind === 'step' ? h('button', { class: 'app-control inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-semibold', type: 'button', onClick: () => jumpToStep(result.id) }, [icon('arrow', 'size-4'), t('openStep')])
                                    : result.kind === 'guide' ? h('button', { class: 'app-control inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-semibold', type: 'button', onClick: openOutageGuide }, [icon('arrow', 'size-4'), t('openGuide')]) : null,
                            ]),
                            result.kind === 'fact' && result.template ? h('button', {
                                class: 'mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800',
                                type: 'button', onClick: () => copyText(result.template, t('descriptionCopied')),
                            }, [icon('copy', 'size-4'), t('copyDescription')]) : null,
                        ]))
                        : h('p', { class: 'rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900' }, t('noSearchResults'))) : null,
                ]),
                loading.value
                    ? h('p', { class: 'py-8 text-center text-gray-500', role: 'status' }, t('loading'))
                    : loadError.value
                        ? h('div', { class: 'space-y-4', role: 'alert' }, [
                            h('p', { class: 'text-red-700' }, loadError.value),
                            h('button', {
                                class: 'w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                type: 'button',
                                onClick: loadTree,
                            }, t('retry')),
                        ])
                        : !currentStep.value
                            ? h('p', { class: 'text-red-700', role: 'alert' }, t('missing'))
                            : h(Transition, { name: 'step-fade', mode: 'out-in' }, { default: () => h('div', { key: currentStepId.value }, [
                                h('div', { class: 'mb-3 flex flex-wrap items-center justify-between gap-2' }, [
                                    h('p', { class: 'inline-flex items-center gap-2 text-xs font-semibold text-slate-500' }, [h('span', { class: 'inline-block size-2 rounded-full bg-emerald-500' }), t('step') + ' ' + (history.value.length + 1)]),
                                    history.value.length > 0 ? h('button', {
                                        class: 'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-blue-800 transition-all hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                                        type: 'button',
                                        onClick: goBack,
                                    }, [icon('back', 'size-4'), t('back')]) : null,
                                    history.value.length > 0 ? h('button', {
                                        class: 'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                                        type: 'button',
                                        onClick: restart,
                                    }, [icon('home', 'size-4'), t('newInquiry')]) : null,
                                ]),
                                h('div', { class: 'question-panel mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4 sm:px-5 sm:py-5' }, [
                                    h('h2', { class: 'current-question text-xl font-bold leading-8 text-gray-900 sm:text-2xl sm:leading-9' }, currentStep.value.question),
                                ]),
                                isFinished.value ? h('section', { class: 'mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:p-5' }, [
                                    h('h3', { class: 'mb-1 flex items-center gap-2 font-bold text-sky-950' }, [icon('search', 'size-5'), language.value === 'ar' ? 'النتيجة التي وجدتها' : 'What we found']),
                                    h('p', { class: 'leading-7 text-sky-950' }, currentStep.value.finding || currentStep.value.question),
                                ]) : null,
                                currentStep.value.customer_prompt ? h('section', { class: 'customer-prompt mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 sm:px-5', 'aria-label': t('askCustomer') }, [
                                    h('h3', { class: 'mb-1 flex items-center gap-2 text-xs font-bold text-emerald-800' }, [icon('chat', 'size-4'), t('askCustomer')]),
                                    h('p', { class: 'leading-7 text-emerald-950' }, currentStep.value.customer_prompt),
                                ]) : null,
                                currentStep.value.package_catalog ? (() => {
                                    const catalog = currentStep.value.package_catalog;
                                    const renderTable = (columns, rows, keys, tableTitle) => h('section', { class: 'mt-4' }, [
                                        h('h4', { class: 'mb-2 text-sm font-bold text-slate-900' }, tableTitle),
                                        h('div', { class: 'max-h-72 overflow-auto rounded-xl border border-slate-200' }, [
                                            h('table', { class: 'w-full min-w-[32rem] text-start text-sm' }, [
                                                h('thead', { class: 'sticky top-0 bg-slate-100 text-slate-800' }, [h('tr', columns.map((column) => h('th', { class: 'p-2 font-semibold' }, column)))]),
                                                h('tbody', rows.map((row, index) => h('tr', { class: 'border-t border-slate-200 odd:bg-white even:bg-slate-50', key: `${tableTitle}-${index}` }, keys.map((key) => h('td', { class: 'p-2 align-top' }, row[key]))))),
                                            ]),
                                        ]),
                                    ]);
                                    return h('section', { class: 'package-catalog mb-5 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5' }, [
                                        h('h3', { class: 'flex items-center gap-2 text-lg font-bold text-indigo-950' }, [icon('ticket', 'size-5'), catalog.title]),
                                        h('p', { class: 'mt-2 text-sm leading-6 text-indigo-950' }, catalog.notes[0]),
                                        renderTable(catalog.monthly_columns, catalog.monthly_rows, ['speed', 'quota', 'price'], catalog.monthly_title),
                                        h('section', { class: 'mt-3 rounded-xl border border-indigo-100 bg-white/80 p-3' }, [
                                            h('h4', { class: 'text-sm font-bold text-slate-900' }, t('checkBeforeQuote')),
                                            h('ul', { class: 'mt-2 list-disc space-y-1 ps-5 text-sm leading-6 text-slate-700' }, catalog.staff_checks.map((check) => h('li', check))),
                                        ]),
                                        h('details', { class: 'mt-3 rounded-xl border border-indigo-100 bg-white/80 p-3' }, [
                                            h('summary', { class: 'cursor-pointer font-semibold text-indigo-900' }, catalog.yearly_title),
                                            renderTable(catalog.yearly_columns, catalog.yearly_rows, ['plan', 'quota', 'price'], catalog.yearly_title),
                                        ]),
                                        h('details', { class: 'mt-3 rounded-xl border border-indigo-100 bg-white/80 p-3' }, [
                                            h('summary', { class: 'cursor-pointer font-semibold text-indigo-900' }, catalog.addons_title),
                                            renderTable(catalog.addon_columns, catalog.addon_rows, ['kind', 'quota', 'price', 'term'], catalog.addons_title),
                                        ]),
                                        h('ul', { class: 'mt-3 list-disc space-y-1 ps-5 text-xs leading-5 text-slate-700' }, catalog.notes.slice(1).map((note) => h('li', note))),
                                        h('a', { class: 'mt-3 inline-flex text-xs font-semibold text-blue-800 underline', href: catalog.source_url, target: '_blank', rel: 'noopener noreferrer' }, catalog.source_label),
                                    ]);
                                })() : null,
                                isFinished.value
                                    ? h('div', { class: 'space-y-4', role: 'status' }, [
                                        h('div', { class: 'inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white' }, [
                                            icon('clock', 'size-5'),
                                            h('span', t('sla')),
                                            h('span', currentStep.value.sla || '—'),
                                        ]),
                                        h('section', { class: 'rounded-2xl border border-orange-200 bg-orange-100 p-4 sm:p-5' }, [
                                            h('h3', { class: 'mb-2 flex items-center gap-2 font-bold text-orange-950' }, [
                                                icon('alert', 'size-5'), t('action'),
                                            ]),
                                            h('p', { class: 'leading-7 text-orange-950' }, currentStep.value.action || '—'),
                                        ]),
                                        currentStep.value.reference_guidance ? h('section', { class: 'reference-guidance rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:p-5' }, [
                                            h('h3', { class: 'mb-2 flex items-center gap-2 font-bold text-blue-950' }, [icon('ticket', 'size-5'), t('referenceGuidance')]),
                                            h('p', { class: 'leading-7 text-blue-950' }, currentStep.value.reference_guidance),
                                        ]) : null,
                                        currentStep.value.clear_description ? h('section', { class: 'clear-description rounded-2xl border border-indigo-200 bg-indigo-50 p-4' }, [
                                            h('div', { class: 'flex flex-wrap items-center justify-between gap-2' }, [
                                                h('h3', { class: 'font-bold text-indigo-950' }, t('clearDescription')),
                                                h('button', { class: 'app-control inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold', type: 'button', onClick: () => copyText(currentStep.value.clear_description, t('descriptionCopied')) }, [icon('copy', 'size-4'), t('copyDescription')]),
                                            ]),
                                            h('p', { class: 'mt-2 rounded-lg bg-white/80 px-3 py-2 font-mono text-sm text-indigo-950' }, currentStep.value.clear_description),
                                        ]) : null,
                                        h('section', { class: 'rounded-2xl border border-green-200 bg-green-100 p-4 sm:p-5' }, [
                                            h('h3', { class: 'mb-2 flex items-center gap-2 font-bold text-green-950' }, [
                                                icon('chat', 'size-5'), t('customerScript'),
                                            ]),
                                            h('p', { class: 'leading-7 text-green-950' }, currentStep.value.customer_script || '—'),
                                        ]),
                                        h('details', { class: 'comment-generator overflow-hidden rounded-2xl border border-slate-200 bg-slate-50' }, [
                                            h('summary', { class: 'flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-bold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500' }, [icon('copy', 'size-5 text-blue-700'), t('commentGenerator')]),
                                            h('div', { class: 'space-y-3 border-t border-slate-200 p-4' }, [
                                                h('p', { class: 'text-xs leading-5 text-slate-600' }, t('commentHelp')),
                                                h('div', { class: 'grid gap-3 sm:grid-cols-2' }, [
                                                    h('label', { class: 'block text-xs font-semibold text-slate-700' }, [t('commentRefType'), h('select', {
                                                        class: 'app-control mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm', value: commentRefType.value,
                                                        onChange: (event) => { commentRefType.value = event.target.value; },
                                                    }, [
                                                        h('option', { value: 'none' }, t('refNone')),
                                                        h('option', { value: 'TT' }, t('refTT')),
                                                        h('option', { value: 'SR' }, t('refSR')),
                                                        h('option', { value: 'Order' }, t('refOrder')),
                                                        h('option', { value: 'IR' }, t('refIR')),
                                                    ])]),
                                                    h('label', { class: 'block text-xs font-semibold text-slate-700' }, [t('commentRefNumber'), h('input', {
                                                        class: 'app-control mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm', type: 'text', inputmode: 'text',
                                                        value: commentRefNumber.value, placeholder: t('commentRefPlaceholder'),
                                                        onInput: (event) => { commentRefNumber.value = event.target.value; },
                                                    })]),
                                                ]),
                                                h('label', { class: 'block text-xs font-semibold text-slate-700' }, [t('commentDetails'), h('textarea', {
                                                    class: 'app-control mt-1.5 min-h-20 w-full rounded-lg border bg-white px-3 py-2 text-sm leading-6', rows: 3,
                                                    value: commentDetails.value, placeholder: t('commentDetailsPlaceholder'),
                                                    onInput: (event) => { commentDetails.value = event.target.value; },
                                                })]),
                                                h('textarea', { class: 'app-control min-h-40 w-full rounded-xl border bg-white p-3 font-mono text-xs leading-6', rows: 7, value: generatedComment.value, readonly: true, 'aria-label': t('commentGenerator') }),
                                                commentRefType.value === 'IR' ? h('p', { class: 'text-xs font-semibold text-amber-800' }, language.value === 'ar' ? 'رقم IR داخلي؛ لا تقله للعميل إلا إذا كان النظام يقدمه كمرجع عميل.' : 'IR is internal; do not give it to the customer unless the system marks it as a customer-facing reference.') : null,
                                                h('button', { class: 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 active:scale-[0.99]', type: 'button', onClick: copyComment }, [icon('copy', 'size-5'), t('copyComment')]),
                                            ]),
                                        ]),
                                        h('div', { class: 'grid gap-2 sm:grid-cols-2' }, [
                                            h('button', {
                                                class: 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-900 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2',
                                                type: 'button',
                                                onClick: copyCustomerScript,
                                            }, [icon('copy', 'size-5'), t('copy')]),
                                        ]),
                                        h('button', {
                                            class: 'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500',
                                            type: 'button',
                                            onClick: restart,
                                        }, [icon('home', 'size-5'), t('newInquiry')]),
                                    ])
                                    : h('div', { class: 'space-y-3' }, [
                                        h('div', { class: 'grid gap-3' }, currentStep.value.options.map((option, index) =>
                                            h('button', {
                                                class: 'option-button group flex min-h-14 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-start font-medium text-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:px-4',
                                                type: 'button',
                                                key: `${currentStepId.value}-${index}`,
                                                onClick: () => choose(option),
                                            }, [
                                                h('span', { class: 'inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-all group-hover:bg-blue-100 sm:size-10' }, [icon(optionIcon(option.label), 'size-5')]),
                                                h('span', { class: 'flex-1 leading-6' }, option.label || t('choose')),
                                                h('span', { class: 'text-blue-700 transition-transform group-hover:-translate-x-1' }, [icon('arrow', 'size-4')]),
                                            ]),
                                        )),
                                        currentStepId.value === tree.value.start && tree.value.tools_hub ? h('button', {
                                            class: 'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                                            type: 'button', onClick: () => jumpToStep('tools_hub'),
                                        }, [icon('question', 'size-4'), t('toolsHub')]) : null,
                                    ]),
                            ]) }),
                tree.value?.operations_guide ? h('details', { class: 'operations-guide mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4' }, [
                    h('summary', { class: 'cursor-pointer font-semibold text-blue-900' }, [icon('ticket', 'inline size-5'), h('span', { class: 'ms-2' }, t('operations'))]),
                    h('div', { class: 'mt-4 space-y-4 leading-7 text-gray-700' }, [
                        h('section', [h('h3', { class: 'flex items-center gap-2 font-bold text-gray-900' }, [icon('search', 'size-4'), t('searchTitle')]), h('p', tree.value.operations_guide.search)]),
                        h('section', [h('h3', { class: 'flex items-center gap-2 font-bold text-gray-900' }, [icon('ticket', 'size-4'), t('recordTitle')]), h('p', tree.value.operations_guide.record)]),
                        tree.value.operations_guide.outage_fields ? h('section', { class: 'rounded-xl border border-blue-100 bg-white/80 p-3' }, [
                            h('h3', { class: 'font-bold text-gray-900' }, tree.value.operations_guide.outage_fields.title),
                            h('p', { class: 'mt-1 text-sm leading-6' }, tree.value.operations_guide.outage_fields.note),
                            h('div', { class: 'mt-3 overflow-x-auto rounded-lg border border-gray-200' }, [
                                h('table', { class: 'w-full min-w-[34rem] text-start text-sm' }, [
                                    h('thead', { class: 'bg-slate-100 text-gray-800' }, [h('tr', [h('th', { class: 'p-2' }, language.value === 'ar' ? 'الحقل' : 'Field'), h('th', { class: 'p-2' }, language.value === 'ar' ? 'ما الذي أتحقق منه؟' : 'What to check')])]),
                                    h('tbody', tree.value.operations_guide.outage_fields.rows.map((row) => h('tr', { class: 'border-t border-gray-200', key: row.field }, [h('td', { class: 'p-2 font-semibold' }, row.field), h('td', { class: 'p-2' }, row.meaning)]))),
                                ]),
                            ]),
                        ]) : null,
                    ]),
                    h('details', { class: 'mt-4 rounded-xl border border-blue-100 bg-white/70 p-3' }, [
                        h('summary', { class: 'cursor-pointer font-semibold text-blue-900' }, t('codesTitle')),
                        h('p', { class: 'my-3 text-sm leading-6 text-amber-800' }, tree.value.operations_guide.codes_note),
                        h('label', { class: 'mb-3 flex items-center gap-2 text-sm text-gray-700' }, [icon('search', 'size-4'), h('input', {
                            class: 'app-control min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2',
                            type: 'search', value: codeSearch.value, placeholder: t('codesSearch'),
                            onInput: (event) => { codeSearch.value = event.target.value; },
                        })]),
                        h('div', { class: 'max-h-72 overflow-auto rounded-lg border border-gray-200' }, [
                            h('table', { class: 'w-full text-start text-sm' }, [
                                h('thead', { class: 'sticky top-0 bg-slate-100 text-gray-800' }, [h('tr', [h('th', { class: 'p-2' }, t('codeLabel')), h('th', { class: 'p-2' }, t('reasonLabel'))])]),
                                h('tbody', tree.value.operations_guide.closure_codes
                                    .filter((row) => !codeSearch.value || `${row.code} ${row.reason}`.toLocaleLowerCase().includes(codeSearch.value.trim().toLocaleLowerCase()))
                                    .map((row) => h('tr', { class: 'border-t border-gray-200', key: row.code }, [h('td', { class: 'p-2 font-bold' }, row.code), h('td', { class: 'p-2' }, row.reason)]))),
                            ]),
                        ]),
                    ]),
                ]) : null,
                notice.value ? h('p', {
                    class: 'mt-4 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700',
                    role: 'status',
                    'aria-live': 'polite',
                }, notice.value) : null,
                h('footer', { class: 'we-footer mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs' }, [
                    h('div', { class: 'flex items-center gap-2' }, [
                        h('img', { src: '/we-logo.svg', class: 'size-6', alt: 'WE' }),
                        h('span', { class: 'font-semibold' }, 'WE'),
                        h('span', { class: 'we-footer-exceed font-extrabold tracking-[0.12em]' }, t('exceed')),
                    ]),
                    h('p', { class: 'm-0' }, t('footer')),
                ]),
            ]),

        ]);
    },
};

createApp(App).mount('#app');
