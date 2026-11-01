import './bootstrap';
import { computed, createApp, h, onMounted, nextTick, ref, Transition, TransitionGroup } from 'vue';
import examQuestions from './exam-questions.json';
import callScenarios from './call-scenarios.json';

const MAX_STEPS_PER_CALL = 100;
const DEFAULT_TREE = 'support';
const SIMULATOR_ALLOWED_OPTIONS = {
    'stable-dsl-no-internet': { preflight_start: [0, 1], technical_type: [0] },
    'dsl-light-off': { preflight_start: [0, 1], technical_type: [0] },
    'all-sites-browsing': { preflight_start: [0, 1], technical_type: [0] },
    'slow-wifi-one-room': { preflight_start: [0, 1], technical_type: [0] },
    'gaming-ping': { preflight_start: [0, 1], technical_type: [0] },
    'no-ip-stable-dsl': { no_ip_check: [0, 1] },
    'port-speed-reading': { logical_check_speed_variance: [0, 1] },
    'payment-not-posted': { billing_inquiry_start: [2] },
    'package-change': { inquiry_start: [4] },
    'new-address-availability': { request_start: [0] },
    'voice-no-tone': { preflight_start: [0, 1], technical_type: [1] },
    'logical-instability-repeat-drop': { logical_instability_start: [0] },
    'slowness-all-devices': { slowness_start: [0] },
    'bad-line-quality-check': { blq_assia: [1] },
    'gaming-latency': { gaming_start: [0] },
    'single-site-browsing': { browsing_check: [1] },
    'speed-variance-record': { logical_check_speed_variance: [0] },
    'dsl-no-sync-after-main-wire': { physical_start: [0] },
    'instability-after-technician': { instability_visit: [0] },
    'night-callback-availability': { noc_oncall_availability: [0, 1] },
    'landline-no-tone-only': { voice_start: [0] },
    'account-suspended-before-troubleshooting': { logical_verify_account: [1] },
    'quota-exhausted': { quota_precheck: [0] },
    'fawry-payment-delay': { billing_inquiry_start: [2] },
    'promise-pay-consumer-postpaid': { promise_to_pay_start: [0] },
    'promise-pay-nonconsumer': { promise_to_pay_start: [1] },
    'payment-wrong-number-transfer': { wrong_number_payment_check: [0] },
    'payment-wrong-number-refund': { wrong_number_payment_check: [1] },
    'ftth-migration-code-39': { exception_27: [0, 1] },
    'ftth-new-address-availability': { availability_check: [1] },
    'installation-order-beyond-sla': { order_status_check: [1, 2] },
};

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
        check: [h('path', { d: 'm5 12 4 4L19 6' })],
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
        grid: [h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1.5' }), h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1.5' }), h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1.5' }), h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1.5' })],
        tree: [h('path', { d: 'M12 3v5m0 0H6v5m6-5h6v5M6 13v3m6-3v3m6-3v3' }), h('rect', { x: '9', y: '2', width: '6', height: '5', rx: '2' }), h('rect', { x: '3', y: '12', width: '6', height: '5', rx: '2' }), h('rect', { x: '9', y: '16', width: '6', height: '5', rx: '2' }), h('rect', { x: '15', y: '12', width: '6', height: '5', rx: '2' })],
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

function simulatorReplyText(step, option, language, variation = 0) {
    const label = String(option?.label ?? '').trim();
    const fact = label.split(/[؛;]/, 1)[0].trim();
    const question = String(step?.question ?? '');
    const internalCheck = /افتح|افحص|راجع|حدد|تحقق|نتيجة|حالة|سجل|النظام|الأداة|نوع الحساب|check|review|status|result|history|assia|cst360|bss|system/i.test(question);

    if (language === 'ar') {
        if (/^لا توجد TT مفتوحة/i.test(fact)) return ['راجعت سجل الخدمة، ومفيش تذكرة مفتوحة لنفس العطل.', 'بحثت برقم الخدمة وما ظهرش بلاغ مفتوح لنفس المشكلة.'][variation % 2];
        if (/^توجد TT مفتوحة/i.test(fact)) return ['لقيت تذكرة مفتوحة لنفس العطل ورقمها ظاهر في السجل.', 'نتيجة TTS History فيها بلاغ قائم على نفس المشكلة.'][variation % 2];
        if (/Outage مؤكد/i.test(fact)) return ['الأداة بتعرض عطلًا عامًا مؤكدًا.', 'نتيجة متابعة المنطقة فيها Major/Planned Fault مؤكد.'][variation % 2];
        if (/لا يوجد Outage/i.test(fact)) return ['الأداة لا تعرض عطلًا عامًا على الخدمة أو المنطقة.', 'بحثت في أداة الأعطال ومفيش Outage ظاهر.'][variation % 2];
        if (/الحساب نشط|Active/i.test(fact)) return ['حالة الحساب ظاهرة Active ومفيش إيقاف مالي.', 'مراجعة الحساب بتبين إنه نشط ومن غير مستحقات مانعة.'][variation % 2];
        if (/مستحقات|موقوفة ماليًا|Suspended/i.test(fact)) return ['النظام ظاهر فيه مستحقات أو إيقاف على الحساب.', 'حالة BSS فيها إيقاف أو مبلغ مستحق.'][variation % 2];
        if (/الباقة انتهت|السعة استُهلكت/i.test(fact)) return ['قراءة الاستهلاك بتوضح إن الباقة انتهت أو وصلت لحدها.', 'النظام بيظهر إن سعة الباقة خلصت.'][variation % 2];
        if (/الباقة سارية/i.test(fact)) return ['النظام بيظهر إن الباقة سارية ولسه فيها سعة.', 'مراجعة الاستهلاك بتأكد إن الباقة لسه سارية.'][variation % 2];
        if (/Congested/i.test(fact)) return ['قراءة الـPort في CST360 ظاهرة Congested.', 'حالة الـPort المسجلة في CST360 هي Congested.'][variation % 2];
        if (/Within Ratio/i.test(fact)) return ['قراءة الـPort في CST360 ظاهرة Within Ratio.', 'نتيجة CST360 للـPort هي Within Ratio.'][variation % 2];
        if (/Not Congested/i.test(fact)) return ['قراءة الـPort في CST360 لا تظهر Congestion.', 'CST360 لا يعرض حالة Congested للـPort.'][variation % 2];
        if (/No DSL Physical-Layer issue/i.test(fact)) return ['Clear View لا يظهر مشكلة فيزيائية على DSL.', 'نتيجة Clear View الحالية: لا يوجد عطل Physical Layer على DSL.'][variation % 2];
        if (/Technician Dispatch|Physical-Layer Fault/i.test(fact)) return ['Clear View يظهر مؤشر عطل فيزيائي أو احتياج زيارة فني.', 'القراءة تشير إلى Physical Layer أو Technician Dispatch.'][variation % 2];
        if (/^نعم،?\s*/.test(fact)) return [`${internalCheck ? 'نتيجة الفحص: ' : 'العميل أكد: '}${fact.replace(/^نعم،?\s*/, '')}`, `${internalCheck ? 'البيانات بتأكد: ' : 'العميل وضح إن: '}${fact.replace(/^نعم،?\s*/, '')}`][variation % 2];
        if (/^لا،?\s*/.test(fact)) return [`${internalCheck ? 'نتيجة الفحص: ' : 'العميل وضح: '}${fact.replace(/^لا،?\s*/, 'مفيش ')}`, `${internalCheck ? 'النظام لا يظهر: ' : 'العميل أكد عدم وجود: '}${fact.replace(/^لا،?\s*/, '')}`][variation % 2];
        return [`${internalCheck ? 'النتيجة الظاهرة في النظام: ' : 'العميل يوضح: '}${fact}`, `${internalCheck ? 'نتيجة الفحص في الحالة: ' : 'بعد سؤالك، العميل يرد: '}${fact}`][variation % 2];
    }

    if (/^No open TT/i.test(fact)) return ['The service history has no open ticket for this fault.', 'A service-number search found no open ticket for this issue.'][variation % 2];
    if (/Open TT/i.test(fact)) return ['The history shows an open ticket for the same fault.', 'TTS History contains an active ticket for this issue.'][variation % 2];
    if (/Confirmed Outage/i.test(fact)) return ['The tool shows a confirmed outage.', 'The area check confirms an outage.'][variation % 2];
    if (/No Outage/i.test(fact)) return ['The tool shows no outage for the service or area.', 'The area check found no current outage.'][variation % 2];
    if (/Active/i.test(fact)) return ['The account is active with no billing suspension.', 'The account check shows Active with no billing block.'][variation % 2];
    if (/Suspended|outstanding/i.test(fact)) return ['The account shows a suspension or outstanding balance.', 'The account check shows a billing hold or amount due.'][variation % 2];
    if (/quota.*exhausted|package.*ended/i.test(fact)) return ['The usage reading shows the package quota is exhausted.', 'The system shows the package allowance has been used.'][variation % 2];
    if (/Congested/i.test(fact)) return ['CST360 Port Details shows a congested port.', 'The port status in CST360 is Congested.'][variation % 2];
    if (/Within Ratio/i.test(fact)) return ['CST360 Port Details shows Within Ratio.', 'The CST360 port result is Within Ratio.'][variation % 2];
    if (/No DSL Physical-Layer issue/i.test(fact)) return ['Clear View shows no DSL physical-layer issue.', 'The current Clear View result has no DSL physical-layer fault.'][variation % 2];
    if (/^Yes,?\s*/i.test(fact)) return [`${internalCheck ? 'System finding: ' : 'The customer confirms: '}${fact.replace(/^Yes,?\s*/i, '')}`, `${internalCheck ? 'The system confirms: ' : 'The customer clarifies: '}${fact.replace(/^Yes,?\s*/i, '')}`][variation % 2];
    if (/^No,?\s*/i.test(fact)) return [`${internalCheck ? 'System finding: ' : 'The customer explains: '}${fact.replace(/^No,?\s*/i, 'there is no ')}`, `${internalCheck ? 'The system does not show: ' : 'The customer confirms there is no '}${fact.replace(/^No,?\s*/i, '')}`][variation % 2];
    return [`${internalCheck ? 'System finding: ' : 'The customer says: '}${fact}`, `${internalCheck ? 'The system result is: ' : 'After your question, the customer says: '}${fact}`][variation % 2];
}

function packageFieldLabel(key, language) {
    const labels = language === 'ar' ? {
        name: 'الاسم', plan: 'النظام', kind: 'نوع الإضافة', quota: 'السعة', speed: 'السرعة',
        price: 'السعر', monthly_price: 'السعر الشهري', yearly_price: 'السعر السنوي', term: 'المدة',
        minutes: 'الدقائق', family_lines: 'عدد خطوط الأسرة', mobile_data: 'إنترنت الموبايل',
        home_choice: 'اختيار الإنترنت المنزلي', guidance: 'ملاحظات التحقق',
    } : {
        name: 'Name', plan: 'Plan', kind: 'Add-on type', quota: 'Quota', speed: 'Speed',
        price: 'Price', monthly_price: 'Monthly price', yearly_price: 'Yearly price', term: 'Term',
        minutes: 'Minutes', family_lines: 'Family lines', mobile_data: 'Mobile data',
        home_choice: 'Home internet choice', guidance: 'Eligibility notes',
    };
    return labels[key] || key.replaceAll('_', ' ');
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

function slaMinutes(value = '') {
    const text = normalizeSearch(value, 'ar');
    if (/فوري|فورا|immediate|instantly/.test(text)) return 0;
    if (/ساعتين/.test(text)) return 120;
    if (/ثلاث ساعات|ثلاثه ساعات/.test(text)) return 180;
    if (/يومين/.test(text)) return 2 * 24 * 60;
    if (/ثلاثه ايام|ثلاث ايام/.test(text)) return 3 * 24 * 60;
    const match = text.match(/(\d+(?:\.\d+)?)\s*(دقيقه|دقائق|min(?:ute)?s?|ساعه|ساعات|hour|hours|h\b|يوم|ايام|day|days|d\b|اسبوع|اسابيع|week|weeks|w\b|شهر|شهور|month|months)/);
    if (!match) {
        if (/ساعه|ساعات|hour/.test(text)) return 60;
        if (/يوم|ايام|day/.test(text)) return 24 * 60;
        if (/اسبوع|اسابيع|week/.test(text)) return 7 * 24 * 60;
        return Number.POSITIVE_INFINITY;
    }
    const amount = Number(match[1]);
    const unit = match[2];
    if (/دقيقه|دقائق|min/.test(unit)) return amount;
    if (/ساعه|ساعات|hour|\bh\b/.test(unit)) return amount * 60;
    if (/يوم|ايام|day|\bd\b/.test(unit)) return amount * 24 * 60;
    if (/اسبوع|اسابيع|week|\bw\b/.test(unit)) return amount * 7 * 24 * 60;
    return amount * 30 * 24 * 60;
}

const SEARCH_ALIASES = {
    ar: {
        'نت': ['انترنت', 'اتصال', 'dsl', 'adsl'], 'النت': ['انترنت', 'اتصال', 'dsl'],
        'فاصل': ['انقطاع', 'تقطيع', 'يفصل', 'down'], 'بيفصل': ['انقطاع', 'تقطيع', 'يفصل'],
        'واقع': ['انقطاع', 'down', 'مقطوع'], 'مقطوع': ['انقطاع', 'فاصل', 'down'],
        'بطيء': ['بطئ', 'بطء', 'بطيئه', 'slow', 'سرعه'], 'بطئ': ['بطيء', 'بطء', 'بطيئه', 'slow', 'سرعه'], 'بطء': ['بطيء', 'بطئ', 'slow', 'سرعه'],
        'بطيئه': ['بطء', 'بطيء', 'slow', 'سرعه'], 'بطئه': ['بطء', 'بطيء', 'slow', 'سرعه'], 'السرعه': ['بطء', 'slow', 'speed', 'slowness'],
        'تقطيع': ['انقطاع', 'فاصل', 'يفصل', 'unstable'], 'مستقر': ['تقطيع', 'عدم استقرار', 'unstable'],
        'تصفح': ['مواقع', 'يفتح', 'browsing', 'website'], 'مواقع': ['تصفح', 'يفتح', 'browsing'],
        'لمبه': ['dsl', 'adsl', 'راوتر'], 'لمبات': ['dsl', 'adsl', 'راوتر'],
        'حراره': ['tone', 'صوت', 'تليفون'], 'تليفون': ['صوت', 'tone', 'خط ارضي'],
        'بيانات': ['ip', 'wan', 'راوتر'], 'ايبي': ['ip', 'wan'], 'راوتر': ['cpe', 'dsl', 'adsl'],
        'شكوي': ['شكوى', 'تصعيد', 'tt'], 'تذكره': ['tt', 'تذكرة', 'شكوى'], 'تذكرة': ['tt', 'شكوى'],
        'دفع': ['سداد', 'فوري', 'فاتوره'], 'فلوس': ['سداد', 'رصيد', 'فاتوره'],
        'باقه': ['quota', 'سعه', 'تجديد'], 'خلصت': ['نفاد', 'استهلاك', 'سعه'],
        'لوجيكال': ['logical', 'منطقي', 'logical instability'], 'انستابيليتي': ['instability', 'تقطيع', 'فصل ورجوع'],
        'جوده': ['quality', 'bad line quality', 'blq'], 'جيمينج': ['gaming', 'game', 'ping', 'العاب'], 'العاب': ['gaming', 'game', 'ping'],
        'بنج': ['ping', 'gaming', 'latency'], 'بينج': ['ping', 'gaming', 'latency'], 'تأخير': ['ping', 'latency', 'gaming'],
    },
    en: {
        'down': ['outage', 'disconnect', 'no internet', 'dsl'], 'disconnect': ['down', 'drop', 'unstable', 'dsl'],
        'slow': ['slowness', 'speed', 'browsing'], 'speed': ['slow', 'slowness', 'profile'],
        'websites': ['browsing', 'sites', 'dns'], 'site': ['browsing', 'website', 'dns'],
        'router': ['cpe', 'dsl', 'adsl'], 'payment': ['bill', 'fawry', 'balance'],
        'ticket': ['tt', 'complaint', 'sr'], 'quota': ['package', 'consumption', 'renewal'],
        'gaming': ['game', 'ping', 'latency', 'compatibility'], 'ping': ['gaming', 'latency', 'game'],
        'blq': ['bad line quality', 'line quality', 'assia'], 'instability': ['logical instability', 'drops', 'disconnect'],
    },
};

const SEARCH_STOP_WORDS = {
    ar: new Set(['هل', 'هو', 'هي', 'في', 'من', 'عن', 'على', 'عندي', 'عند', 'العميل', 'حضرتك', 'مشكله', 'مشكلتي', 'عايز', 'اعرف', 'ايه', 'ما', 'لو', 'كان']),
    en: new Set(['the', 'is', 'a', 'an', 'my', 'for', 'to', 'with', 'what', 'how', 'do', 'does', 'customer', 'issue', 'problem']),
};

function searchGroups(query, language) {
    const normalized = normalizeSearch(query, language);
    const groups = normalized.split(' ')
        .filter((token) => (token.length > 1 || /^\d+$/.test(token)) && !SEARCH_STOP_WORDS[language].has(token))
        .map((token) => [...new Set([token, ...(SEARCH_ALIASES[language][token] ?? []).map((alias) => normalizeSearch(alias, language))])]);
    if (language === 'ar') {
        if (/(النت|انترنت|اتصال).*(مش شغال|مش شغاله|فاصل|مقطوع|قاطع)/.test(normalized)) groups.push(['انقطاع', 'فاصل', 'dsl', 'adsl', 'physical']);
        if (/(النت|انترنت|اتصال).*(شغال|بيشتغل).*(بطي|بطء|مواقع|تصفح)/.test(normalized)) groups.push(['logical', 'بطء', 'تصفح', 'سرعه']);
    } else {
        if (/no internet|internet down|connection down|not working/.test(normalized)) groups.push(['outage', 'disconnect', 'dsl', 'physical']);
        if (/internet.*(slow|browsing|sites)/.test(normalized)) groups.push(['logical', 'slowness', 'speed', 'browsing']);
    }
    return groups;
}

const COPY = {
    ar: {
        brand: 'مساعد WE للدعم الفني', title: 'دليل الدعم الفني', fresh: 'جديد', loading: 'جاري تحميل شجرة القرارات…', retry: 'إعادة المحاولة',
        missing: 'الخطوة الحالية غير موجودة في الشجرة.', step: 'الخطوة', back: 'رجوع خطوة', sla: 'المهلة:', action: 'إجراء الموظف',
        customerScript: 'نص تقوله للعميل', copy: 'نسخ نص العميل', newInquiry: 'بدء استعلام جديد', choose: 'اختيار', footer: 'تُحمّل الشجرة من Laravel، وتتم خطوات المسار داخل المتصفح.',
        copied: 'تم نسخ نص العميل.', noScript: 'لا يوجد نص عميل لنسخه في هذه الخطوة.', copyError: 'تعذر النسخ تلقائيًا. يمكنك تحديد النص ونسخه يدويًا.',
        invalidStep: 'هذا الاختيار مرتبط بخطوة غير موجودة. أبلغ المسؤول عن الشجرة.', stepLimit: 'وصل المسار للحد الآمن. ارجع لبداية المسار وابدأ مكالمة جديدة.',
        incomplete: 'بيانات الخطوة التالية غير مكتملة. أبلغ المسؤول عن الشجرة.', loadError: 'تعذر تحميل شجرة القرارات.', invalidTree: 'ملف شجرة القرارات غير مكتمل.',
        askCustomer: 'اسأل العميل', referenceGuidance: 'رقم المتابعة الذي تقوله للعميل', staffCheck: 'أعرف منين وأعمل إيه؟',
        sourceReference: 'مصدر الإجراء وحدود الاعتماد',
        howToCheck: 'أعرف منين وأعمل إيه؟', checkGuidance: 'أتحقق إزاي؟', whatToDo: 'أعمل إيه حسب النتيجة؟', generalCheckHint: 'راجع بيانات الخدمة في الأداة أو السجل المحدد للمسار، ثم اختَر النتيجة المطابقة. لا تسأل العميل عن معلومة تقدر تتحقق منها في النظام؛ اسأله فقط إذا ظهر نص مخصص في قسم «اسأل العميل». لو النتيجة غير واضحة، لا تخمّن واتبع الإجراء الحالي.',
        quickSla: 'مواعيد الـSLA', quickCodes: 'أكواد الإغلاق', quickPackages: 'الباقات', quickToolSearch: 'ابحث بالاسم أو الحالة أو الرقم أو المدة…',
        slaCodeNoFixed: 'لا توجد مهلة مستقلة موثقة للكود؛ راجع SLA التذكرة الحالية.', codeAction: 'أعمل إيه؟', genericCodeAction: 'تأكد أن وصف الكود يطابق السبب والنتيجة الفعلية في TTS قبل الإغلاق.',
        slaSortBy: 'ترتيب حسب', slaSortDuration: 'مدة المهلة', slaSortCase: 'اسم الحالة', slaAscending: 'تصاعدي', slaDescending: 'تنازلي', slaCaseColumn: 'الحالة', slaDurationColumn: 'المهلة',
        quickChangePackage: 'تغيير باقة',
        quickAccess: 'الوصول السريع', closeDrawer: 'إغلاق',
        homeEyebrow: 'مساحة دعم فني تفاعلية', homeTitleA: 'كل مكالمة لها ', homeTitleB: 'مسار واضح.', homeLead: 'اختار مساحة العمل: مساعد المكالمات، امتحان على دفعات، أو حالات عملية للتدريب على المواقف.', homeSearch: 'ابحث عن عرض أو مشكلة أو خطوة دعم…', homeRoomsLabel: 'اختر وجهتك', homeRoomsTitle: 'ادخل مساحة العمل', homeRoomsHint: 'كل مساحة لها طريقة مختلفة للتعامل مع نفس قاعدة المعرفة.', homeLive: 'مساعد المكالمات', homeLiveText: 'خطوات عملية واضحة: اسأل، افحص في النظام، ثم أكمل حسب النتيجة.', homeExam: 'امتحان تدريبي', homeExamText: '{count} سؤال فريد؛ حل 20 سؤالًا في الجولة، ثم ابدأ مجموعة جديدة.', caseSimulator: 'حالات عملية', caseSimulatorText: 'تدرّب على ردود ونتائج متغيرة، واختر المسار ثم راجع أخطاءك في النهاية.', homeEnter: 'ابدأ الامتحان', homeSlaHint: 'ابحث في المهل ورتبها', homeCodesHint: 'ابحث بالكود وشوف الإجراء', homePackagesHint: 'اعثر على الباقة بسرعة',
        guidedMode: 'مساعد المكالمة', callProgress: 'المسار الحالي', callNext: 'الخطوة التالية',
        simulatorMode: 'حالات عملية', simulatorTitle: 'محاكي المكالمات', simulatorIntro: 'اسمع رد العميل أو نتيجة الفحص، اختار الفرع المناسب، وفي النهاية راجع إجاباتك والأخطاء.', simulatorStart: 'ابدأ الحالة', simulatorBack: 'كل الحالات', simulatorCustomer: 'العميل يقول', simulatorGoal: 'هدف التدريب', simulatorStep: 'محاكاة مكالمة', simulatorDone: 'وصلت لنهاية المسار. راجع الإجراء ونص العميل، ثم جرّب موقفًا آخر.', simulatorRestart: 'أعد الحالة', simulatorSource: 'المسار المستخدم', simulatorReply: 'رد العميل / نتيجة الفحص', simulatorReplyHint: 'اختار الفرع الذي يطابق المعلومة التي ظهرت.', simulatorScore: 'نتيجة التدريب', simulatorCorrect: 'إجابة صحيحة', simulatorMistakes: 'راجع الاختيارات دي', simulatorYourChoice: 'اختيارك', simulatorExpectedChoice: 'الاختيار الصحيح', simulatorWhyWrong: 'سبب التصحيح', simulatorAllCorrect: 'ممتاز، كل اختياراتك في الحالة دي كانت صحيحة.', simulatorNoScore: 'لم تسجل قرارات في الحالة دي.',
        quickProblem: 'تشخيص مشكلة', quickInquiry: 'استفسار خدمة', quickRequest: 'طلب أو متابعة تركيب', quickBilling: 'فاتورة أو سداد', quickComplaint: 'شكوى أو تصعيد',
        openReference: 'مرجع الدعم', returnGuided: 'العودة لمساعد المكالمة',
        slaSearchPlaceholder: 'الحالة أو رقم الساعات/الأيام…', packageSearchPlaceholder: 'اسم الباقة أو السرعة أو السعة…', packagesNote: 'البحث يشمل السعة والسرعة والاسم والأسعار الموجودة في الجداول. عدد الأشخاص ليس تصنيفًا رسميًا في البيانات؛ استخدم الاستهلاك وعدد الأجهزة ولا تفترض سعة مناسبة من عدد الأفراد وحده.',
        noQuickMatches: 'لا توجد نتيجة مطابقة.', sourceCaution: 'مرجع تدريبي؛ طابق المهلة مع التذكرة الحالية قبل إبلاغ العميل.', packageAddons: 'إضافات',
        referenceIntro: 'ابحث بالعرض أو اسم الإجراء، أو افتح موضوعًا شائعًا. النتائج تعرض مسار الدعم ومصدر الإجراء عند توفره.',
        referenceTopics: ['Logical Instability', 'Slowness', 'Bad Line Quality', 'Gaming / Ping', 'Physical Instability', 'Outage'],
        descriptionCopied: 'تم نسخ Clear Description. راجع التصنيف قبل اللصق.',
        clearDescription: 'Clear Description المقترح',
        searchSource: 'المصدر', openStep: 'فتح المسار', copyDescription: 'نسخ Clear Description', oldReference: 'مرجع تدريبي قديم؛ راجع التصنيف والمهلة الحاليين قبل الاستخدام.',
        commentGenerator: 'تعليق جاهز للتيكت / SR', commentHelp: 'مبني على اختيارات المسار. راجع النص وأضف ما نفذته فعلًا قبل اللصق؛ لا تضف بيانات شخصية أو كلمة مرور.',
        commentDetails: 'الإجراء أو نتيجة النظام (بدون بيانات العميل)', commentDetailsPlaceholder: 'اكتب ما نفذته فعلًا أو نتيجة مختصرة من النظام…',
        commentRefType: 'نوع المرجع', commentRefNumber: 'رقم المرجع من النظام', commentRefPlaceholder: 'أدخل الرقم بعد إنشائه (اختياري)',
        refNone: 'لم تُنشأ تذكرة', refTT: 'TT', refSR: 'SR', refOrder: 'رقم الطلب', refIR: 'IR داخلي',
        copyComment: 'نسخ التعليق', commentCopied: 'تم نسخ التعليق. راجعه قبل لصقه في النظام.',
        quickSearch: 'مساعد البحث', quickSearchPlaceholder: 'اكتب المشكلة بطريقتك… مثال: النت فاصل ولمبة DSL بتفصل', searchHint: 'يفهم كلمات قريبة ويقترح أقرب سؤال أو مسار من دليل الدعم؛ لا يرسل بياناتك لخدمة خارجية.', searchExamples: ['النت فاصل', 'السرعة بطيئة', 'مواقع مش بتفتح', 'لمبة DSL بتفصل'], bestMatch: 'أقرب مسار', noSearchResults: 'لم أجد مسارًا واضحًا. جرّب وصفًا أقصر مثل: النت فاصل، بطء، أو لا توجد نغمة.', dark: 'الوضع الداكن', light: 'الوضع الفاتح',
        checkBeforeQuote: 'تحقّق قبل عرض السعر', packageMonthly: 'شهري', packageYearly: 'سنوي', packageQuarterly: 'ربع سنوي', packageAccountType: 'حدد نوع الحساب من BSS', packagePrepaid: 'Prepaid', packagePostpaid: 'Postpaid', packageSelect: 'اختار الباقة', packageNoQuarterly: 'WE Space للإنترنت فقط يعرض باقات شهرية وسنوية. الربع سنوي لباقات WE Ardy للخط الأرضي الصوتي، وليس باقة الإنترنت.', packagePlanScript: 'نص العرض بعد اختيار الباقة', packageNeedAccount: 'اختار نوع الحساب الظاهر في BSS علشان نعرض الكتالوج المناسب.', packageSourceNote: 'السعر النهائي والضريبة والأهلية تتأكد من BSS قبل تسجيل الطلب.', exceed: 'EXCEED', internalTool: 'أداة دعم داخلية', codesSearch: 'ابحث برقم الكود أو الوصف', codeLabel: 'الكود', reasonLabel: 'الوصف',
    },
    en: {
        brand: 'WE Technical Support Assistant', title: 'Support Guide', fresh: 'New', loading: 'Loading decision tree…', retry: 'Try again',
        missing: 'The current step is missing from the tree.', step: 'Step', back: 'Go back', sla: 'SLA:', action: 'Agent action',
        customerScript: 'What to tell the customer', copy: 'Copy customer script', newInquiry: 'Start a new inquiry', choose: 'Choose', footer: 'The tree is loaded from Laravel; steps run in your browser.',
        copied: 'Customer script copied.', noScript: 'There is no customer script to copy at this step.', copyError: 'Automatic copy failed. Select and copy the text manually.',
        invalidStep: 'This option points to a missing step. Notify the tree administrator.', stepLimit: 'The safe step limit was reached. Return to the start and begin a new call.',
        incomplete: 'The next step data is incomplete. Notify the tree administrator.', loadError: 'Could not load the decision tree.', invalidTree: 'The decision tree file is incomplete.',
        askCustomer: 'Ask the customer', referenceGuidance: 'Reference number to give the customer', staffCheck: 'How do I verify this and what should I do?',
        sourceReference: 'Procedure source and verification note',
        howToCheck: 'How do I verify this and what should I do?', checkGuidance: 'How to check', whatToDo: 'What to do with the result', generalCheckHint: 'Check the service data in the tool or record specified for this path, then select the matching result. Do not ask the customer for information you can verify in the system; ask only when a dedicated customer prompt is shown. If the result is unclear, do not guess; follow the current procedure.',
        quickSla: 'SLA lookup', quickCodes: 'Close codes', quickPackages: 'Packages', quickToolSearch: 'Search by name, case, code, or timeframe…',
        slaCodeNoFixed: 'No separate SLA is documented for this code; check the current ticket SLA.', codeAction: 'What should I do?', genericCodeAction: 'Confirm the code matches the actual cause and outcome in TTS before closing.',
        slaSortBy: 'Sort by', slaSortDuration: 'SLA duration', slaSortCase: 'Case name', slaAscending: 'Ascending', slaDescending: 'Descending', slaCaseColumn: 'Case', slaDurationColumn: 'SLA',
        quickChangePackage: 'Change package',
        quickAccess: 'Quick access', closeDrawer: 'Close',
        homeEyebrow: 'Interactive support space', homeTitleA: 'A clear path for ', homeTitleB: 'every call.', homeLead: 'Choose a workspace: call assistant, 20-question exam rounds, or practical call simulations.', homeSearch: 'Search a service, issue, or support step…', homeRoomsLabel: 'Choose your destination', homeRoomsTitle: 'Enter a workspace', homeRoomsHint: 'Each workspace uses the same support knowledge in a different way.', homeLive: 'Call assistant', homeLiveText: 'Clear steps: ask, check the system, and continue based on what you find.', homeExam: 'Practice exam', homeExamText: '{count} unique questions. Answer 20 per round, then start another set.', caseSimulator: 'Practical cases', caseSimulatorText: 'Practice changing customer replies and findings, choose a path, and review mistakes at the end.', homeEnter: 'Start exam', homeSlaHint: 'Search and sort response times', homeCodesHint: 'Find a code and see what to do', homePackagesHint: 'Find a package quickly',
        guidedMode: 'Call assistant', callProgress: 'Call path', callNext: 'Next step',
        simulatorMode: 'Practical cases', simulatorTitle: 'Call simulator', simulatorIntro: 'Read the customer reply or system finding, choose the matching branch, then review your decisions and mistakes at the end.', simulatorStart: 'Start case', simulatorBack: 'All cases', simulatorCustomer: 'Customer says', simulatorGoal: 'Training goal', simulatorStep: 'Call simulation', simulatorDone: 'You reached the end of this path. Review the action and customer script, then try another case.', simulatorRestart: 'Restart case', simulatorSource: 'Procedure path', simulatorReply: 'Customer reply / system result', simulatorReplyHint: 'Choose the branch that matches the information shown.', simulatorScore: 'Training result', simulatorCorrect: 'Correct answers', simulatorMistakes: 'Review these choices', simulatorYourChoice: 'Your choice', simulatorExpectedChoice: 'Correct choice', simulatorWhyWrong: 'Why this is correct', simulatorAllCorrect: 'Great, all your choices in this case were correct.', simulatorNoScore: 'No decisions were recorded in this case.',
        quickProblem: 'Troubleshoot a problem', quickInquiry: 'Service inquiry', quickRequest: 'Installation request or follow-up', quickBilling: 'Bill or payment', quickComplaint: 'Complaint or escalation',
        openReference: 'Support reference', returnGuided: 'Return to call guide',
        slaSearchPlaceholder: 'Case or hours/days…', packageSearchPlaceholder: 'Package name, speed, or quota…', packagesNote: 'Search covers the names, speeds, quotas, and prices in the available tables. Number of people is not an official package field; use actual usage and device count, and do not infer a quota from household size alone.',
        noQuickMatches: 'No matching entries.', sourceCaution: 'Training reference; verify the current ticket SLA before telling the customer.', packageAddons: 'Add-ons',
        referenceIntro: 'Search by symptom or procedure, or open a common topic. Results show the support path and its source when available.',
        referenceTopics: ['Logical Instability', 'Slowness', 'Bad Line Quality', 'Gaming / Ping', 'Physical Instability', 'Outage'],
        descriptionCopied: 'Clear Description copied. Verify the category before pasting.',
        clearDescription: 'Suggested Clear Description',
        searchSource: 'Source', openStep: 'Open path', copyDescription: 'Copy Clear Description', oldReference: 'Training reference may be outdated; verify the current category and SLA.',
        commentGenerator: 'Ready ticket / SR comment', commentHelp: 'Built from your path selections. Review it and add what you actually did before pasting; do not add personal data or passwords.',
        commentDetails: 'Action taken or system result (no customer data)', commentDetailsPlaceholder: 'Enter the actual action or a brief system finding…',
        commentRefType: 'Reference type', commentRefNumber: 'System reference number', commentRefPlaceholder: 'Enter after creation (optional)',
        refNone: 'No ticket created', refTT: 'TT', refSR: 'SR', refOrder: 'Order number', refIR: 'Internal IR',
        copyComment: 'Copy comment', commentCopied: 'Comment copied. Review it before pasting into the system.',
        quickSearch: 'Support search assistant', quickSearchPlaceholder: 'Describe the issue… e.g. internet drops and DSL blinks', searchHint: 'Finds related wording and suggests a support path locally; your search is not sent to an external AI service.', searchExamples: ['Internet down', 'Slow speed', 'Websites not opening', 'DSL light blinking'], bestMatch: 'Closest path', noSearchResults: 'No clear path found. Try a shorter phrase such as internet down, slow speed, or no dial tone.', dark: 'Dark mode', light: 'Light mode',
        checkBeforeQuote: 'Check before quoting', packageMonthly: 'Monthly', packageYearly: 'Yearly', packageQuarterly: 'Quarterly', packageAccountType: 'Select the account type shown in BSS', packagePrepaid: 'Prepaid', packagePostpaid: 'Postpaid', packageSelect: 'Select this package', packageNoQuarterly: 'WE Space internet-only plans are monthly or yearly. Quarterly cycles belong to WE Ardy fixed voice, not the internet-only package.', packagePlanScript: 'Customer wording for the selected plan', packageNeedAccount: 'Select the account type shown in BSS to view the catalog.', packageSourceNote: 'Confirm final price, tax, and eligibility in BSS before creating an order.', exceed: 'EXCEED', internalTool: 'Internal support tool', codesSearch: 'Search by code or reason', codeLabel: 'Code', reasonLabel: 'Reason',
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
        const quickToolsOpen = ref('');
        const slaSearch = ref('');
        const slaSortBy = ref('duration');
        const slaSortDirection = ref('asc');
        const packageSearch = ref('');
        const quickDrawerOpen = ref(false);
        const workspaceMode = ref('guided');
        const simulationCase = ref(null);
        const simulatorExpectedOption = ref({});
        const simulatorAttempts = ref([]);
        const simulatorLastOutcomes = ref({});
        const simulatorRunNumber = ref(0);
        const examQuestionIndex = ref(0);
        const examBatch = ref([]);
        const examMode = ref('mixed');
        const examStarted = ref(false);
        const examUsedQuestionIds = ref([]);
        const examBatchNumber = ref(0);
        const examTotalCorrect = ref(0);
        const examTotalAnswered = ref(0);
        const examSelectedIndex = ref(null);
        const examAnswers = ref([]);
        const packagePeriod = ref('monthly');
        const packageAccountMode = ref('');
        const selectedPackage = ref(null);
        const selectedProduct = ref(null);
        const commentDetails = ref('');
        const commentRefType = ref('none');
        const commentRefNumber = ref('');
        const t = (key) => COPY[language.value][key] ?? key;

        const currentStep = computed(() => {
            if (!tree.value || !currentStepId.value) return null;
            return tree.value[currentStepId.value] ?? null;
        });
        const examScore = computed(() => examAnswers.value.reduce((score, answer, index) =>
            score + (answer === examBatch.value[index]?.correctIndex ? 1 : 0), 0));
        const simulatorDecision = computed(() => {
            if (!simulationCase.value || !currentStepId.value) return null;
            const options = currentStep.value?.options ?? [];
            const expectedIndex = simulatorExpectedOption.value[currentStepId.value];
            if (!Number.isInteger(expectedIndex) || !options[expectedIndex]) return null;
            const text = simulatorReplyText(currentStep.value, options[expectedIndex], language.value, simulatorRunNumber.value + history.value.length);
            return { expectedIndex, text };
        });
        const simulatorScore = computed(() => simulatorAttempts.value.filter((attempt) => attempt.correct).length);
        const completedPath = computed(() => pathSelections.value.map(({ stepId, optionIndex }) => ({
            step: tree.value?.[stepId],
            option: tree.value?.[stepId]?.options?.[optionIndex],
        })).filter((entry) => entry.step && entry.option));
        const isFinished = computed(() => currentStep.value?.options?.length === 0);
        const isPackageInquiry = computed(() => currentStepId.value === 'package_inquiry_terminal');
        const productCustomerScript = computed(() => {
            const catalog = currentStep.value?.product_catalog;
            if (!catalog || !selectedProduct.value) return '';
            const { row } = selectedProduct.value;
            if (!row) return '';
            const details = Object.values(row).filter(Boolean).join('، ');
            return `${catalog.customer_prefix || ''}${details}${catalog.customer_suffix || ''}`;
        });
        const packageCustomerScript = computed(() => {
            if (!currentStep.value?.package_catalog) return '';
            if (!selectedPackage.value) return '';
            const { period, row } = selectedPackage.value;
            const plan = row.plan || row.speed;
            if (language.value === 'ar') {
                const renewal = period === 'yearly'
                    ? 'الحصة السنوية بتكون متاحة للعميل كاملة على مدار السنة.'
                    : 'تجدد شهريًا حسب شروط الباقة.';
                return `باقة WE Space ${plan} بسعة ${row.quota}، والسعر الظاهر ${row.price}. ${renewal} هأكد السعر النهائي والضريبة وأهلية الخط على BSS قبل تسجيل أي تغيير.`;
            }
            const renewal = period === 'yearly'
                ? 'The yearly quota is available as a full annual allowance.'
                : 'It renews monthly under the package terms.';
            return `WE Space ${plan} includes ${row.quota}; the listed price is ${row.price}. ${renewal} I will confirm the final price, tax, and line eligibility in BSS before submitting any change.`;
        });
        function resetPackageControls() {
            packagePeriod.value = 'monthly';
            packageAccountMode.value = '';
            selectedPackage.value = null;
            selectedProduct.value = null;
        }
        function selectPackage(row, index) {
            selectedPackage.value = { period: packagePeriod.value, row, index };
        }
        function selectProduct(row, sectionIndex, rowIndex) {
            selectedProduct.value = { row, sectionIndex, rowIndex };
        }

        const quickSearchIndex = computed(() => {
            if (!tree.value) return [];
            const entries = [];
            for (const [id, step] of Object.entries(tree.value)) {
                if (id === 'start' || id === 'operations_guide' || id === 'tools_hub' || !step || typeof step !== 'object') continue;
                const catalog = step.package_catalog;
                const catalogText = catalog ? [catalog.title, ...catalog.monthly_rows.map((row) => `${row.speed} ${row.quota} ${row.price}`), ...catalog.yearly_rows.map((row) => `${row.plan} ${row.quota} ${row.price}`), ...catalog.addon_rows.map((row) => `${row.kind} ${row.quota} ${row.price} ${row.term}`)].join(' ') : '';
                const productCatalog = step.product_catalog;
                const productCatalogText = productCatalog ? [productCatalog.title, productCatalog.scope_note, ...productCatalog.sections.flatMap((section) => [section.title, ...section.rows.flatMap((row) => Object.values(row))]), ...productCatalog.notes].join(' ') : '';
                const body = [step.question, step.customer_prompt, step.action, step.customer_script, step.reference_guidance, step.source_reference, step.clear_description, step.sla, catalogText, productCatalogText,
                    ...(step.options ?? []).map((option) => option.label)].filter(Boolean).join(' ');
                const title = step.question || id;
                entries.push({ kind: 'step', id, title, body, source: step.source_reference || (language.value === 'ar' ? 'شجرة الدعم' : 'Support tree') });
            }
            for (const row of tree.value.operations_guide?.closure_codes ?? []) {
                entries.push({ kind: 'code', id: row.code, title: `${t('codeLabel')} ${row.code}`, body: row.reason, source: language.value === 'ar' ? 'جدول تدريب الإغلاق' : 'Training close-code table' });
            }
            for (const fact of QUICK_FACTS[language.value]) {
                entries.push({ kind: 'fact', id: fact.id, title: fact.title, body: fact.body, terms: fact.terms, template: fact.template, source: fact.source });
            }
            return entries.map((entry) => ({
                ...entry,
                titleSearch: normalizeSearch(entry.title, language.value),
                searchable: normalizeSearch(`${entry.title} ${entry.body} ${entry.terms ?? ''}`, language.value),
            }));
        });

        const quickSearchResults = computed(() => {
            const query = normalizeSearch(quickSearch.value, language.value);
            if (!query) return [];
            const groups = searchGroups(query, language.value);
            if (!groups.length) return [];
            return quickSearchIndex.value.map((entry) => {
                let score = 0;
                let matched = 0;
                for (const group of groups) {
                    const titleHit = group.find((term) => entry.titleSearch.includes(term));
                    const bodyHit = group.find((term) => entry.searchable.includes(term));
                    if (titleHit || bodyHit) {
                        matched += 1;
                        score += titleHit ? (titleHit === group[0] ? 4 : 2.5) : (bodyHit === group[0] ? 1.6 : 1);
                    }
                }
                const coverage = matched / groups.length;
                return { ...entry, score, matched, coverage, snippet: entry.body.length > 220 ? `${entry.body.slice(0, 217)}…` : entry.body };
            }).filter((entry) => entry.matched > 0 && entry.coverage >= Math.min(0.5, 1 / groups.length))
                .sort((a, b) => b.score - a.score || b.coverage - a.coverage || a.title.localeCompare(b.title, language.value))
                .slice(0, 6);
        });

        const quickSlaRows = computed(() => {
            if (!tree.value) return [];
            const query = normalizeSearch(slaSearch.value, language.value);
            const stepRows = Object.entries(tree.value)
                .filter(([id, step]) => id !== 'start' && step && typeof step === 'object' && typeof step.sla === 'string')
                .map(([id, step]) => ({
                    id,
                    title: step.question || id,
                    duration: step.sla,
                    durationSort: slaMinutes(step.sla),
                    source: step.source_reference || (language.value === 'ar' ? 'راجع SLA التذكرة الحالية' : 'Check the current ticket SLA'),
                    searchText: normalizeSearch(`${id} ${step.question} ${step.sla} ${step.action || ''} ${step.source_reference || ''}`, language.value),
                }));
            const codeRows = query ? (tree.value.operations_guide?.closure_codes || [])
                .filter((row) => normalizeSearch(`${row.code} ${row.reason} ${row.agent_action || ''} ${row.sla || ''}`, language.value).includes(query))
                .map((row) => ({
                    id: null,
                    code: row.code,
                    title: `${t('codeLabel')} ${row.code}: ${row.reason}`,
                    duration: row.sla || t('slaCodeNoFixed'),
                    durationSort: slaMinutes(row.sla || ''),
                    action: row.agent_action || t('genericCodeAction'),
                    source: row.source_reference || (language.value === 'ar' ? 'دليل أكواد الإغلاق؛ تحقّق من TTS الحالي' : 'Close-code guide; verify current TTS'),
                    searchText: normalizeSearch(`${row.code} ${row.reason} ${row.agent_action || ''} ${row.sla || ''}`, language.value),
                })) : [];
            return [...stepRows, ...codeRows]
                .filter((row) => !query || query.split(' ').every((token) => row.searchText.includes(token)))
                .sort((a, b) => {
                    const direction = slaSortDirection.value === 'asc' ? 1 : -1;
                    if (slaSortBy.value === 'duration') {
                        if (Number.isFinite(a.durationSort) !== Number.isFinite(b.durationSort)) return Number.isFinite(a.durationSort) ? -1 : 1;
                        if (a.durationSort !== b.durationSort) return (a.durationSort - b.durationSort) * direction;
                    }
                    return (a.title.localeCompare(b.title, language.value) * direction) || String(a.code || a.id).localeCompare(String(b.code || b.id));
                });
        });

        const quickPackageRows = computed(() => {
            if (!tree.value) return [];
            const items = [];
            for (const [stepId, step] of Object.entries(tree.value)) {
                if (!step || typeof step !== 'object') continue;
                const catalog = step.package_catalog;
                if (catalog) {
                    for (const [period, key] of [[t('packageMonthly'), 'monthly_rows'], [t('packageYearly'), 'yearly_rows'], [t('packageAddons'), 'addon_rows']]) {
                        for (const [index, row] of (catalog[key] || []).entries()) items.push({
                            id: `${stepId}-${key}-${index}`, title: catalog.title, period, row,
                            source: [catalog.source_label, catalog.checked_on].filter(Boolean).join(' · '),
                        });
                    }
                }
                const productCatalog = step.product_catalog;
                if (productCatalog) {
                    for (const [sectionIndex, section] of (productCatalog.sections || []).entries()) {
                        for (const [index, row] of (section.rows || []).entries()) items.push({
                            id: `${stepId}-${sectionIndex}-${index}`, title: productCatalog.title, period: section.title, row,
                            source: productCatalog.source_label || '',
                        });
                    }
                }
            }
            const query = normalizeSearch(packageSearch.value, language.value);
            return items.filter((item) => {
                const terms = normalizeSearch(`${item.title} ${item.period} ${Object.values(item.row).join(' ')} ${item.source}`, language.value);
                return !query || query.split(' ').every((token) => terms.includes(token));
            });
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

        function afterStepChange() {
            nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }

        function findTreePath(stepId) {
            if (!tree.value?.[stepId]) return null;
            if (stepId === tree.value.start) return [];
            const queue = [{ stepId: tree.value.start, path: [] }];
            const visited = new Set([tree.value.start]);
            while (queue.length) {
                const current = queue.shift();
                const options = tree.value[current.stepId]?.options || [];
                for (const [optionIndex, option] of options.entries()) {
                    const nextStep = option.next_step;
                    if (!tree.value[nextStep]) continue;
                    const path = [...current.path, { stepId: current.stepId, optionIndex, nextStep }];
                    if (nextStep === stepId) return path;
                    if (!visited.has(nextStep)) {
                        visited.add(nextStep);
                        queue.push({ stepId: nextStep, path });
                    }
                }
            }
            return null;
        }

        function applyPathToGuide(path, stepId) {
            simulationCase.value = null;
            currentStepId.value = stepId;
            history.value = path.map((entry) => entry.stepId);
            pathSelections.value = path.map(({ stepId: parentId, optionIndex }) => ({ stepId: parentId, optionIndex }));
            resetPackageControls();
            commentDetails.value = '';
            commentRefNumber.value = '';
            quickSearch.value = '';
            quickToolsOpen.value = '';
            workspaceMode.value = 'guided';
            afterStepChange();
        }

        function enterExam() {
            quickToolsOpen.value = '';
            quickDrawerOpen.value = false;
            simulationCase.value = null;
            examQuestionIndex.value = 0;
            examSelectedIndex.value = null;
            examAnswers.value = [];
            examUsedQuestionIds.value = [];
            examBatchNumber.value = 0;
            examTotalCorrect.value = 0;
            examTotalAnswered.value = 0;
            examMode.value = 'mixed';
            examStarted.value = false;
            examBatch.value = [];
            workspaceMode.value = 'exam';
        }

        function trueFalseOptionValue(option) {
            const labels = [option?.en, option?.ar].map((label) => String(label ?? '').trim().toLowerCase());
            if (labels.some((label) => ['true', 't', 'صح', 'صحيح', 'نعم'].includes(label))) return true;
            if (labels.some((label) => ['false', 'f', 'غلط', 'خطأ', 'خاطئ', 'لا'].includes(label))) return false;
            return null;
        }

        function isTrueFalseQuestion(question) {
            const options = (question?.options ?? []).map(trueFalseOptionValue);
            return options.length === 2 && options.includes(true) && options.includes(false);
        }

        function shuffled(items) {
            const result = [...items];
            for (let index = result.length - 1; index > 0; index -= 1) {
                const swapIndex = Math.floor(Math.random() * (index + 1));
                [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
            }
            return result;
        }

        function startNextExamBatch() {
            const used = new Set(examUsedQuestionIds.value);
            const available = examQuestions.map((question, id) => ({ question, id })).filter(({ id }) => !used.has(id));
            const availableTrueFalse = shuffled(available.filter(({ question }) => isTrueFalseQuestion(question)));
            const multipleChoice = shuffled(available.filter(({ question }) => !isTrueFalseQuestion(question)));
            let selected = [];
            if (examMode.value === 'true-false') selected = availableTrueFalse.slice(0, 20);
            else if (examMode.value === 'multiple-choice') selected = multipleChoice.slice(0, 20);
            else selected = [...availableTrueFalse.slice(0, 5), ...multipleChoice.slice(0, 15)];
            const selectedIds = new Set(selected.map(({ id }) => id));
            if (selected.length < 20) selected.push(...shuffled(available.filter(({ id }) => !selectedIds.has(id))).slice(0, 20 - selected.length));
            examBatch.value = shuffled(selected).map(({ question, id }) => ({ ...question, bankId: id }));
            examUsedQuestionIds.value = [...new Set([...examUsedQuestionIds.value, ...selected.filter(({ id }) => !used.has(id)).map(({ id }) => id)])];
            examBatchNumber.value += 1;
            examQuestionIndex.value = 0;
            examSelectedIndex.value = null;
            examAnswers.value = [];
            examStarted.value = true;
        }

        function hasMoreExamQuestions() {
            const used = new Set(examUsedQuestionIds.value);
            return examQuestions.some((question, id) => !used.has(id)
                && (examMode.value === 'mixed'
                    || (examMode.value === 'true-false' ? isTrueFalseQuestion(question) : !isTrueFalseQuestion(question))));
        }

        function selectExamMode(mode) {
            examMode.value = mode;
            examQuestionIndex.value = 0;
            examBatch.value = [];
            examUsedQuestionIds.value = [];
            examBatchNumber.value = 0;
            examTotalCorrect.value = 0;
            examTotalAnswered.value = 0;
            startNextExamBatch();
        }

        function chooseExamAnswer(optionIndex) {
            if (examSelectedIndex.value !== null) return;
            examSelectedIndex.value = optionIndex;
            examAnswers.value = [...examAnswers.value, optionIndex];
        }

        function advanceExam() {
            if (examQuestionIndex.value + 1 < examBatch.value.length) {
                examQuestionIndex.value += 1;
                examSelectedIndex.value = null;
                return;
            }
            examTotalCorrect.value += examScore.value;
            examTotalAnswered.value += examBatch.value.length;
            examQuestionIndex.value = examBatch.value.length;
        }

        function continueExam() {
            if (!hasMoreExamQuestions()) return;
            startNextExamBatch();
        }

        function restartExam() {
            examQuestionIndex.value = 0;
            examBatch.value = [];
            examUsedQuestionIds.value = [];
            examBatchNumber.value = 0;
            examTotalCorrect.value = 0;
            examTotalAnswered.value = 0;
            startNextExamBatch();
        }

        function enterSimulator() {
            quickToolsOpen.value = '';
            quickDrawerOpen.value = false;
            simulationCase.value = null;
            workspaceMode.value = 'simulator';
        }

        function prepareSimulatorDecision(stepId) {
            const options = tree.value?.[stepId]?.options ?? [];
            if (!simulationCase.value || !options.length) return;

            const key = `${simulationCase.value.id}:${stepId}`;
            const previousIndex = simulatorLastOutcomes.value[key];
            const configuredOptions = SIMULATOR_ALLOWED_OPTIONS[simulationCase.value.id]?.[stepId];
            let available = (configuredOptions ?? options.map((_, index) => index)).filter((index) => index >= 0 && index < options.length);
            if (!available.length) available = options.map((_, index) => index);
            if (available.length > 1 && Number.isInteger(previousIndex)) {
                available = available.filter((index) => index !== previousIndex);
            }
            const expectedIndex = available[Math.floor(Math.random() * available.length)];
            simulatorExpectedOption.value = { ...simulatorExpectedOption.value, [stepId]: expectedIndex };
            simulatorLastOutcomes.value = { ...simulatorLastOutcomes.value, [key]: expectedIndex };
        }

        function startScenario(scenario) {
            if (!tree.value?.[scenario.startStepId]) {
                notice.value = t('missing');
                return;
            }
            simulationCase.value = scenario;
            simulatorRunNumber.value += 1;
            simulatorExpectedOption.value = {};
            simulatorAttempts.value = [];
            currentStepId.value = scenario.startStepId;
            prepareSimulatorDecision(scenario.startStepId);
            history.value = [];
            pathSelections.value = [];
            resetPackageControls();
            commentDetails.value = '';
            commentRefType.value = 'none';
            commentRefNumber.value = '';
            quickSearch.value = '';
            quickToolsOpen.value = '';
            notice.value = '';
            workspaceMode.value = 'simulator';
            afterStepChange();
        }

        function showScenarioList() {
            simulationCase.value = null;
            simulatorExpectedOption.value = {};
            simulatorAttempts.value = [];
            history.value = [];
            pathSelections.value = [];
            workspaceMode.value = 'simulator';
        }

        function restartScenario() {
            if (simulationCase.value) startScenario(simulationCase.value);
        }

        function goHome() {
            quickToolsOpen.value = '';
            quickDrawerOpen.value = false;
            simulationCase.value = null;
            workspaceMode.value = 'guided';
            if (tree.value?.start) {
                currentStepId.value = tree.value.start;
                history.value = [];
                pathSelections.value = [];
                resetPackageControls();
            }
            afterStepChange();
        }

        function enterGuided() {
            quickToolsOpen.value = '';
            simulationCase.value = null;
            if (tree.value?.start) {
                currentStepId.value = tree.value.start;
                history.value = [];
                pathSelections.value = [];
                resetPackageControls();
            }
            workspaceMode.value = 'guided';
            afterStepChange();
        }

        function renderHome() {
            const rooms = [
                { id: 'guided', icon: 'chat', number: '01', eyebrow: t('homeLive'), title: t('guidedMode'), detail: t('homeLiveText'), action: enterGuided, className: 'portal-live' },
                { id: 'exam', icon: 'grid', number: '02', eyebrow: t('homeExam'), title: t('examMode'), detail: t('homeExamText').replace('{count}', examQuestions.length), action: enterExam, className: 'portal-exam' },
                { id: 'simulator', icon: 'question', number: '03', eyebrow: t('simulatorMode'), title: t('caseSimulator'), detail: t('caseSimulatorText'), action: enterSimulator, className: 'portal-simulator' },
            ];
            const searchResults = quickSearch.value.trim() ? quickSearchResults.value.slice(0, 4).map((result, index) => h('button', {
                class: 'home-search-result', type: 'button', key: result.id || result.title, onClick: () => { if (result.kind === 'step') jumpToStep(result.id); else if (result.kind === 'code') { codeSearch.value = String(result.id); openQuickTool('codes'); } else { workspaceMode.value = 'reference'; quickSearch.value = result.title; } },
            }, [h('span', [index === 0 ? h('small', t('bestMatch')) : null, h('strong', result.title), h('span', result.snippet)]), icon('arrow', 'size-4')])) : null;

            return h('section', { class: 'home-world' }, [
                h('div', { class: 'home-hero' }, [
                    h('div', { class: 'home-copy' }, [
                        h('div', { class: 'home-status' }, [h('span', { class: 'status-pulse' }), t('homeEyebrow')]),
                        h('h2', { class: 'home-title' }, [t('homeTitleA'), h('span', t('homeTitleB'))]),
                        h('p', { class: 'home-lead' }, t('homeLead')),
                        h('div', { class: 'home-search-box' }, [
                            icon('search', 'size-5'),
                            h('input', { type: 'search', value: quickSearch.value, placeholder: t('homeSearch'), onInput: (event) => { quickSearch.value = event.target.value; } }),
                            h('kbd', '⌕'),
                        ]),
                        searchResults ? h('div', { class: 'home-search-results' }, searchResults.length ? searchResults : [h('p', { class: 'search-empty' }, t('noSearchResults'))]) : null,
                    ]),
                    h('div', { class: 'home-visual', 'aria-hidden': 'true' }, [
                        h('div', { class: 'home-visual-glow' }),
                        h('div', { class: 'home-orbit home-orbit-a' }),
                        h('div', { class: 'home-orbit home-orbit-b' }),
                        h('div', { class: 'home-orbit home-orbit-c' }),
                        h('div', { class: 'home-core' }, [h('img', { src: '/we-logo.svg', alt: '', class: 'home-logo' })]),
                        ...[['chat', 'home-node-a'], ['question', 'home-node-c']].map(([name, cls]) => h('div', { class: 'home-node ' + cls }, [icon(name, 'size-5')])),
                        h('span', { class: 'home-spark home-spark-a' }),
                        h('span', { class: 'home-spark home-spark-b' }),
                    ]),
                ]),
                h('div', { class: 'portal-section-heading' }, [
                    h('div', [h('span', t('homeRoomsLabel')), h('h3', t('homeRoomsTitle'))]),
                    h('p', t('homeRoomsHint')),
                ]),
                h('div', { class: 'portal-grid' }, rooms.map((room) => h('button', { class: 'portal-card ' + room.className, type: 'button', onClick: room.action, key: room.id }, [
                    h('span', { class: 'portal-index' }, room.number),
                    h('span', { class: 'portal-icon-wrap' }, [icon(room.icon, 'size-6')]),
                    h('span', { class: 'portal-eyebrow' }, room.eyebrow),
                    h('strong', { class: 'portal-title' }, room.title),
                    h('span', { class: 'portal-detail' }, room.detail),
                    h('span', { class: 'portal-enter' }, [t('homeEnter'), icon('arrow', 'size-4')]),
                    h('span', { class: 'portal-glow' }),
                ]))),
                h('div', { class: 'home-utility-row' }, [
                    h('button', { class: 'home-utility', type: 'button', onClick: () => openQuickTool('sla') }, [icon('clock', 'size-5'), h('span', [h('strong', t('quickSla')), h('small', t('homeSlaHint'))]), icon('arrow', 'size-4')]),
                    h('button', { class: 'home-utility', type: 'button', onClick: () => openQuickTool('codes') }, [icon('ticket', 'size-5'), h('span', [h('strong', t('quickCodes')), h('small', t('homeCodesHint'))]), icon('arrow', 'size-4')]),
                    h('button', { class: 'home-utility', type: 'button', onClick: () => openQuickTool('packages') }, [icon('search', 'size-5'), h('span', [h('strong', t('quickPackages')), h('small', t('homePackagesHint'))]), icon('arrow', 'size-4')]),
                ]),
            ]);
        }

        function renderSimulator() {
            const isArabic = language.value === 'ar';
            return h('section', { class: 'case-simulator' }, [
                h('header', { class: 'case-simulator-hero' }, [
                    h('div', [
                        h('span', { class: 'exam-kicker' }, isArabic ? 'تدريب بالممارسة' : 'PRACTICE BY DOING'),
                        h('h2', { class: 'exam-title' }, t('simulatorTitle')),
                        h('p', { class: 'exam-intro' }, t('simulatorIntro')),
                    ]),
                    h('span', { class: 'case-count-pill' }, `${callScenarios.length} ${isArabic ? 'مواقف' : 'cases'}`),
                ]),
                h('div', { class: 'case-scenario-grid', role: 'list', tabindex: 0, 'aria-label': isArabic ? 'قائمة الحالات العملية، قابلة للتمرير' : 'Scrollable practical case list' }, callScenarios.map((scenario) => h('article', { class: 'case-scenario-card', key: scenario.id, role: 'listitem' }, [
                    h('div', { class: 'case-scenario-icon' }, [icon(scenario.id.includes('dsl') || scenario.id.includes('internet') ? 'alert' : 'chat', 'size-5')]),
                    h('h3', scenario.title[language.value]),
                    h('p', { class: 'case-customer-quote' }, [h('strong', `${t('simulatorCustomer')}: `), scenario.customer[language.value]]),
                    h('p', { class: 'case-scenario-goal' }, [h('strong', `${t('simulatorGoal')}: `), scenario.goal[language.value]]),
                    scenario.image ? h('img', { class: 'case-scenario-image', src: scenario.image, alt: scenario.imageAlt?.[language.value] || scenario.title[language.value], loading: 'lazy' }) : null,
                    h('button', { class: 'exam-primary-button case-start-button', type: 'button', onClick: () => startScenario(scenario) }, [t('simulatorStart'), icon('arrow', 'size-4')]),
                ]))),
                h('p', { class: 'case-simulator-note' }, isArabic
                    ? 'رد العميل أو نتيجة الفحص تتغير مع كل تشغيل للتدريب. المواقف تستخدم مسارات الدليل نفسه؛ لا تدخل بيانات عميل حقيقي، وراجع المهلات والإجراءات المتغيرة في النظام الحالي.'
                    : 'Customer replies and findings vary on each practice run. Cases use the same support guide; do not enter real customer data, and verify changing SLAs and procedures in the current system.'),
            ]);
        }

        function renderExam() {
            const total = examBatch.value.length;
            const index = examQuestionIndex.value;
            const isArabic = language.value === 'ar';
            const batchScore = examScore.value;
            const percent = total ? Math.round((batchScore / total) * 100) : 0;
            const verifyNote = isArabic
                ? 'معلومة تدريبية متغيرة: راجع الـSLA أو الإجراء الحالي في النظام قبل استخدامه مع عميل.'
                : 'Time-sensitive training item: check the current SLA or procedure before using it with a customer.';

            if (!examStarted.value) {
                const trueFalseCount = examQuestions.filter(isTrueFalseQuestion).length;
                const multipleChoiceCount = examQuestions.length - trueFalseCount;
                const modes = [
                    { id: 'mixed', title: isArabic ? 'جولة متنوعة' : 'Mixed practice', detail: isArabic ? '٥ صح وغلط + ١٥ اختيار من متعدد في كل جولة' : '5 true/false + 15 multiple choice per round', count: examQuestions.length },
                    { id: 'true-false', title: isArabic ? 'صح وغلط فقط' : 'True / False only', detail: isArabic ? 'تدرّب على العبارات وحدد صح ولا غلط' : 'Practice statements and mark them true or false', count: trueFalseCount },
                    { id: 'multiple-choice', title: isArabic ? 'اختيار من متعدد فقط' : 'Multiple choice only', detail: isArabic ? 'تدرّب على أسئلة الاختيارات' : 'Practice multiple-choice questions', count: multipleChoiceCount },
                ];
                return h('section', { class: 'exam-panel exam-setup' }, [
                    h('span', { class: 'exam-kicker' }, isArabic ? 'بنك الأسئلة' : 'QUESTION BANK'),
                    h('h2', { class: 'exam-title' }, isArabic ? 'اختار طريقة التدريب' : 'Choose a practice mode'),
                    h('p', { class: 'exam-intro' }, isArabic
                        ? `المتاح حاليًا ${trueFalseCount} سؤال صح وغلط و${multipleChoiceCount} سؤال اختيار من متعدد.`
                        : `${trueFalseCount} true/false and ${multipleChoiceCount} multiple-choice questions are available.`),
                    h('div', { class: 'exam-mode-grid' }, modes.map((mode) => h('button', {
                        class: 'exam-mode-card', type: 'button', onClick: () => selectExamMode(mode.id),
                    }, [
                        h('span', { class: 'exam-mode-count' }, `${mode.count}`),
                        h('strong', mode.title),
                        h('span', { class: 'exam-mode-detail' }, mode.detail),
                        h('span', { class: 'exam-mode-start' }, isArabic ? 'ابدأ التدريب ←' : 'Start practice →'),
                    ]))),
                    h('p', { class: 'exam-source-note' }, isArabic
                        ? 'بعد كل إجابة هتشوف الصح والغلط، والإجابة الصحيحة، وشرح السؤال. لو ملف التدريب ذكر الإجابة من غير سبب، هنوضح ده بدل ما نخترع شرحًا.'
                        : 'After each answer, see whether it is correct, the answer key, and the explanation. If the source gives no rationale, we say so instead of inventing one.'),
                ]);
            }

            if (index >= total) {
                const moreQuestions = hasMoreExamQuestions();
                const used = new Set(examUsedQuestionIds.value);
                const remainingForMode = examQuestions.filter((question, questionId) => !used.has(questionId)
                    && (examMode.value === 'mixed'
                        || (examMode.value === 'true-false' ? isTrueFalseQuestion(question) : !isTrueFalseQuestion(question)))).length;
                const nextBatchSize = Math.min(20, remainingForMode);
                return h('section', { class: 'exam-panel exam-results' }, [
                    h('div', { class: 'exam-result-mark' }, [icon(percent >= 70 ? 'check' : 'question', 'size-7')]),
                    h('span', { class: 'exam-kicker' }, isArabic ? `الجولة ${examBatchNumber.value} اكتملت` : `ROUND ${examBatchNumber.value} COMPLETE`),
                    h('h2', { class: 'exam-title' }, isArabic ? 'نتيجة الجولة' : 'Round result'),
                    h('p', { class: 'exam-score' }, `${batchScore} / ${total}`),
                    h('p', { class: 'exam-percentage' }, `${percent}%`),
                    h('p', { class: 'exam-intro' }, isArabic
                        ? `أجبت صح عن ${batchScore} من ${total} سؤال. ${examTotalAnswered.value ? `إجمالي نتيجتك حتى الآن ${examTotalCorrect.value} من ${examTotalAnswered.value}.` : ''}`
                        : `You got ${batchScore} of ${total} correct. ${examTotalAnswered.value ? `Overall so far: ${examTotalCorrect.value} of ${examTotalAnswered.value}.` : ''}`),
                    h('div', { class: 'exam-result-actions' }, [
                        moreQuestions ? h('button', { class: 'exam-primary-button', type: 'button', onClick: continueExam }, isArabic ? `ابدأ مجموعة جديدة · ${nextBatchSize} سؤال` : `Start next set · ${nextBatchSize} questions`) : null,
                        h('button', { class: 'exam-primary-button', type: 'button', onClick: restartExam }, isArabic ? 'أعد الامتحان' : 'Try again'),
                        h('button', { class: 'exam-secondary-button', type: 'button', onClick: () => { workspaceMode.value = 'home'; } }, isArabic ? 'العودة للرئيسية' : 'Back to home'),
                    ]),
                    !moreQuestions ? h('p', { class: 'exam-intro' }, isArabic ? 'خلصت كل الأسئلة المتاحة؛ ابدأ من جديد لو حابب تعيد التدريب.' : 'You have answered every available question. Restart to practice again.') : null,
                ]);
            }

            const usedQuestionIds = new Set(examUsedQuestionIds.value);
            const remainingQuestionCount = examQuestions.filter((question, questionId) => !usedQuestionIds.has(questionId)
                && (examMode.value === 'mixed'
                    || (examMode.value === 'true-false' ? isTrueFalseQuestion(question) : !isTrueFalseQuestion(question)))).length;
            const batchQuestion = examBatch.value[index];
            const trueFalse = isTrueFalseQuestion(batchQuestion);
            const selected = examSelectedIndex.value;
            const answered = selected !== null;
            const isCorrect = answered && selected === batchQuestion.correctIndex;
            const progress = Math.round(((index + 1) / Math.max(total, 1)) * 100);
            const optionLetters = isArabic ? ['أ', 'ب', 'ج', 'د'] : ['A', 'B', 'C', 'D'];

            return h('section', { class: 'exam-panel' }, [
                h('header', { class: 'exam-heading' }, [
                    h('div', [
                        h('span', { class: 'exam-kicker' }, isArabic ? `الجولة ${examBatchNumber.value} · ${total} سؤال` : `ROUND ${examBatchNumber.value} · ${total} QUESTIONS`),
                        h('h2', { class: 'exam-title' }, isArabic ? 'امتحان تدريبي' : 'Practice exam'),
                        h('p', { class: 'exam-intro' }, isArabic
                            ? 'اختار إجابة واحدة؛ هتظهر الإجابة الصحيحة والشرح فورًا.'
                            : 'Choose one answer to see the correct answer and explanation immediately.'),
                    ]),
                    h('span', { class: 'exam-counter' }, isArabic ? `السؤال ${index + 1} / ${total}` : `Question ${index + 1} / ${total}`),
                ]),
                    h('div', { class: 'exam-round-meta' }, [
                    h('span', { class: 'exam-round-label' }, isArabic ? `المجموعة ${examBatchNumber.value}` : `Set ${examBatchNumber.value}`),
                    h('span', { class: 'exam-round-label' }, isArabic ? `باقي ${remainingQuestionCount} سؤال` : `${remainingQuestionCount} questions left`),
                    h('span', { class: 'exam-round-label exam-kind-label' }, trueFalse ? (isArabic ? 'صح / غلط' : 'TRUE / FALSE') : (isArabic ? 'اختيار من متعدد' : 'MULTIPLE CHOICE')),
                ]),
                h('div', { class: 'exam-progress-track', 'aria-label': `${progress}%` }, [h('span', { style: { width: `${progress}%` } })]),
                h('article', { class: 'exam-question-card' }, [
                    h('div', { class: 'exam-question-topic' }, [
                        h('span', batchQuestion.topic[language.value]),
                        batchQuestion.verifyLive ? h('span', isArabic ? 'تحقق من النظام' : 'Verify live') : null,
                    ]),
                    h('div', { class: 'exam-question-number' }, isArabic ? `سؤال ${index + 1}` : `QUESTION ${index + 1}`),
                    h('h3', batchQuestion.question[language.value]),
                    batchQuestion.image ? h('figure', { class: 'exam-question-figure' }, [
                        h('img', { src: batchQuestion.image, alt: batchQuestion.imageAlt?.[language.value] || batchQuestion.question[language.value], loading: 'lazy' }),
                        batchQuestion.imageCaption ? h('figcaption', batchQuestion.imageCaption[language.value]) : null,
                    ]) : null,
                    h('p', { class: 'exam-source' }, `${isArabic ? 'المصدر: ' : 'Source: '}${batchQuestion.source}`),
                    h('div', { class: `exam-options ${trueFalse ? 'exam-options-binary' : ''}`, role: 'group', 'aria-label': batchQuestion.question[language.value] }, batchQuestion.options.map((option, optionIndex) => {
                        const correctOption = answered && optionIndex === batchQuestion.correctIndex;
                        const wrongSelection = answered && optionIndex === selected && !isCorrect;
                        const classes = ['exam-choice', correctOption ? 'is-correct' : '', wrongSelection ? 'is-wrong' : '', answered && optionIndex === selected ? 'is-selected' : ''].filter(Boolean).join(' ');
                        const optionEnglish = trueFalseOptionValue(option);
                        const displayOption = isArabic && trueFalse
                            ? (optionEnglish ? 'صح' : 'غلط')
                            : option[language.value];
                        return h('button', {
                            class: classes,
                            type: 'button',
                            disabled: answered,
                            'aria-pressed': optionIndex === selected,
                            onClick: () => chooseExamAnswer(optionIndex),
                        }, [
                            h('span', { class: 'exam-choice-letter' }, trueFalse ? (optionEnglish ? '✓' : '×') : (optionLetters[optionIndex] || String(optionIndex + 1))),
                            h('span', displayOption),
                        ]);
                    })),
                    answered ? h('aside', {
                        class: `exam-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`,
                        'aria-live': 'polite',
                    }, [
                        h('strong', isCorrect
                            ? (isArabic ? 'إجابة صحيحة' : 'Correct answer')
                            : (isArabic ? 'الإجابة غير صحيحة' : 'Not quite')),
                        h('p', [h('b', isArabic ? 'الإجابة الصحيحة: ' : 'Correct answer: '), isArabic && trueFalse ? (trueFalseOptionValue(batchQuestion.options[batchQuestion.correctIndex]) ? 'صح' : 'غلط') : batchQuestion.options[batchQuestion.correctIndex][language.value]]),
                    h('p', [h('b', isArabic ? 'ليه؟ ' : 'Why? '), batchQuestion.explanation?.[language.value] || (isArabic
                        ? 'ملف المصدر لا يوضح سبب الإجابة؛ المعروض هو مفتاح الإجابة فقط.'
                        : 'The source does not explain why; this is the answer key only.')]),
                        batchQuestion.sourceNote?.[language.value] ? h('small', { class: 'exam-source-note' }, batchQuestion.sourceNote[language.value]) : null,
                        batchQuestion.verifyLive ? h('small', verifyNote) : null,
                    ]) : null,
                ]),
                h('footer', { class: 'exam-footer' }, [
                    h('span', isArabic
                        ? (examMode.value === 'mixed' ? 'كل جولة متنوعة؛ تظهر الإجابة والشرح بعد كل اختيار.' : 'الجولة تعرض النوع الذي اخترته؛ تظهر الإجابة والشرح بعد كل اختيار.')
                        : (examMode.value === 'mixed' ? 'Mixed round. The answer and explanation appear after each choice.' : 'This round uses your selected question type. Feedback appears after each choice.')),
                    answered ? h('button', {
                        class: 'exam-primary-button',
                        type: 'button',
                        onClick: advanceExam,
                    }, index === total - 1
                        ? (isArabic ? 'عرض النتيجة' : 'See result')
                        : (isArabic ? 'السؤال التالي' : 'Next question')) : null,
                ]),
            ]);
        }

        function jumpToStep(stepId) {
            if (!tree.value?.[stepId]) return;
            quickDrawerOpen.value = false;
            const path = findTreePath(stepId);
            if (!path) return;
            applyPathToGuide(path, stepId);
        }

        function openQuickTool(key) {
            quickDrawerOpen.value = false;
            const directSteps = {
                problem: 'preflight_start',
                inquiry: 'inquiry_start',
                request: 'request_start',
                billing: 'billing_inquiry_start',
                complaint: 'complaint_start',
            };
            if (directSteps[key]) {
                jumpToStep(directSteps[key]);
                return;
            }
            if (key === 'change') {
                jumpToStep('package_change_quick');
                return;
            }
            if (key === 'exam') {
                enterExam();
                return;
            }
            if (key === 'reference') {
                workspaceMode.value = 'reference';
                quickToolsOpen.value = '';
                nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
                return;
            }
            if (quickToolsOpen.value === key) {
                quickToolsOpen.value = '';
                return;
            }
            quickToolsOpen.value = key;
            nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
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
            if (simulationCase.value && simulatorDecision.value) {
                const expectedIndex = simulatorDecision.value.expectedIndex;
                simulatorAttempts.value = [...simulatorAttempts.value, {
                    stepId: currentStepId.value,
                    question: currentStep.value.question,
                    selectedLabel: option.label,
                    expectedLabel: currentStep.value.options[expectedIndex]?.label ?? '',
                    correct: selectedIndex === expectedIndex,
                    reason: currentStep.value.check_guidance || currentStep.value.action || '',
                }];
            }
            pathSelections.value = [...pathSelections.value, { stepId: currentStepId.value, optionIndex: selectedIndex }];
            currentStepId.value = nextStep;
            if (simulationCase.value) prepareSimulatorDecision(nextStep);
            resetPackageControls();
            notice.value = '';
            afterStepChange();
        }

        function goBack() {
            if (history.value.length === 0) return;
            const previousStepId = history.value.at(-1);
            if (simulationCase.value) {
                simulatorAttempts.value = simulatorAttempts.value.filter((attempt) => attempt.stepId !== previousStepId);
            }
            currentStepId.value = history.value.at(-1);
            history.value = history.value.slice(0, -1);
            pathSelections.value = pathSelections.value.slice(0, -1);
            resetPackageControls();
            notice.value = '';
            afterStepChange();
        }

        function restart() {
            if (workspaceMode.value === 'simulator' && simulationCase.value) {
                restartScenario();
                return;
            }
            if (!tree.value) return;
            currentStepId.value = tree.value.start;
            history.value = [];
            pathSelections.value = [];
            workspaceMode.value = 'guided';
            commentDetails.value = '';
            commentRefType.value = 'none';
            commentRefNumber.value = '';
            quickSearch.value = '';
            resetPackageControls();
            notice.value = '';
            afterStepChange();
        }

        async function copyCustomerScript() {
            const script = productCustomerScript.value || (isPackageInquiry.value && packageCustomerScript.value)
                || currentStep.value?.customer_script;
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
                class: `app-shell we-brand scene-${workspaceMode.value} ${theme.value === 'dark' ? 'app-dark' : ''} relative isolate min-h-screen w-full overflow-x-clip px-4 py-5 pb-28 text-gray-800 sm:px-8 sm:py-8`,
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
                key: workspaceMode.value, class: `app-card workspace-frame workspace-frame-${workspaceMode.value} relative z-10 mx-auto w-full max-w-screen-2xl p-3 sm:p-5 lg:p-8`,
                'aria-busy': loading.value ? 'true' : 'false',
            }, [
                h('header', { class: 'world-header mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4' }, [
                    h('div', { class: 'flex min-w-0 items-center gap-3' }, [
                        h('button', { class: 'brand-mark inline-flex size-12 shrink-0 items-center justify-center rounded-full transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2', type: 'button', onClick: goHome, 'aria-label': t('title'), title: t('title') }, [h('img', { src: '/we-logo.svg', class: 'size-11', alt: 'WE' })]),
                        h('div', { class: 'min-w-0' }, [
                            h('div', { class: 'flex flex-wrap items-center gap-x-2 gap-y-1' }, [
                                h('button', { class: 'block text-start text-xs font-bold tracking-wide text-purple-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500', type: 'button', onClick: goHome }, t('brand')),
                                h('span', { class: 'we-exceed text-[10px] font-extrabold tracking-[0.14em]' }, t('exceed')),
                                h('span', { class: 'we-internal text-[10px] font-medium' }, t('internalTool')),
                            ]),
                            h('h1', { class: 'truncate text-xl font-bold text-gray-900 sm:text-2xl' }, t('title')),
                        ]),
                    ]),
                    h('nav', { class: 'world-nav order-3 flex w-full items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 sm:order-none sm:w-auto', 'aria-label': language.value === 'ar' ? 'أوضاع العمل' : 'Work modes' }, [
                        h('button', { class: `inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition sm:flex-none ${workspaceMode.value === 'guided' || workspaceMode.value === 'reference' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600 hover:bg-white'}`, type: 'button', onClick: enterGuided, 'aria-pressed': workspaceMode.value === 'guided' || workspaceMode.value === 'reference' }, [icon('chat', 'size-4'), t('guidedMode')]),
                        h('button', { class: `inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition sm:flex-none ${workspaceMode.value === 'exam' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600 hover:bg-white'}`, type: 'button', onClick: enterExam, 'aria-pressed': workspaceMode.value === 'exam' }, [icon('grid', 'size-4'), t('examMode')]),
                        h('button', { class: `inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition sm:flex-none ${workspaceMode.value === 'simulator' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600 hover:bg-white'}`, type: 'button', onClick: enterSimulator, 'aria-pressed': workspaceMode.value === 'simulator' }, [icon('question', 'size-4'), t('simulatorMode')]),
                    ]),
                    h('div', { class: 'flex shrink-0 items-center gap-2' }, [
                        h('button', { class: 'app-control rounded-xl border px-3 py-2 text-sm font-semibold', type: 'button', onClick: () => switchLanguage(language.value === 'ar' ? 'en' : 'ar'), 'aria-label': language.value === 'ar' ? 'Switch to English' : 'التغيير إلى العربية' }, language.value === 'ar' ? 'EN' : 'عربي'),
                        h('button', { class: 'app-control rounded-xl border p-2', type: 'button', onClick: () => switchTheme(theme.value === 'light' ? 'dark' : 'light'), 'aria-label': theme.value === 'light' ? t('dark') : t('light'), title: theme.value === 'light' ? t('dark') : t('light') }, [icon(theme.value === 'light' ? 'moon' : 'sun')]),
                    ]),
                ]),
                quickToolsOpen.value === 'sla' ? h('section', { class: 'mb-4 rounded-2xl border border-blue-100 bg-white p-3 sm:p-4' }, [
                    h('div', { class: 'mb-3 flex items-center justify-between gap-3' }, [
                        h('h2', { class: 'm-0 flex items-center gap-2 font-bold text-slate-900' }, [icon('clock', 'size-5 text-blue-700'), t('quickSla')]),
                        h('button', { class: 'app-control rounded-lg px-3 py-2 text-xs font-semibold', type: 'button', onClick: () => { quickToolsOpen.value = ''; } }, t('closeDrawer')),
                    ]),
                    h('input', { class: 'app-control mb-3 w-full rounded-xl border px-3 py-2.5 text-sm', type: 'search', value: slaSearch.value, placeholder: t('slaSearchPlaceholder'), onInput: (event) => { slaSearch.value = event.target.value; } }),
                    h('div', { class: 'mb-2 flex flex-wrap items-center gap-2' }, [
                        h('label', { class: 'text-xs font-semibold text-slate-600', for: 'sla-sort-by' }, t('slaSortBy')),
                        h('select', { id: 'sla-sort-by', class: 'app-control min-h-9 rounded-lg border px-2 text-xs', value: slaSortBy.value, onChange: (event) => { slaSortBy.value = event.target.value; } }, [
                            h('option', { value: 'duration' }, t('slaSortDuration')),
                            h('option', { value: 'case' }, t('slaSortCase')),
                        ]),
                        h('button', { class: 'app-control min-h-9 rounded-lg border px-3 text-xs font-semibold', type: 'button', onClick: () => { slaSortDirection.value = slaSortDirection.value === 'asc' ? 'desc' : 'asc'; }, 'aria-label': slaSortDirection.value === 'asc' ? t('slaDescending') : t('slaAscending') }, `${slaSortDirection.value === 'asc' ? '↑' : '↓'} ${slaSortDirection.value === 'asc' ? t('slaAscending') : t('slaDescending')}`),
                    ]),
                    h('div', { class: 'grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-slate-200 px-2 py-1.5 text-[10px] font-bold text-slate-500 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)_auto]' }, [
                        h('span', t('slaCaseColumn')),
                        h('span', { class: 'text-end' }, t('slaDurationColumn')),
                        h('span', { class: 'hidden sm:block' }, ''),
                    ]),
                    h('div', { class: 'max-h-96 divide-y divide-slate-200 overflow-y-auto pe-1', 'aria-live': 'polite' }, quickSlaRows.value.length ? quickSlaRows.value.map((row) => h('article', { class: 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2 py-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,auto)_auto]', key: row.id }, [
                        h('div', { class: 'min-w-0' }, [
                            h('h3', { class: 'm-0 line-clamp-2 text-xs font-bold leading-5 text-slate-900 sm:text-sm' }, row.title),
                            h('p', { class: 'mt-0.5 truncate text-[10px] leading-4 text-slate-500', title: `${t('sourceReference')}: ${row.source}` }, row.source),
                            row.action ? h('p', { class: 'mt-1 text-[11px] leading-5 text-indigo-900' }, [h('strong', `${t('codeAction')} `), row.action]) : null,
                        ]),
                        h('span', { class: 'max-w-40 rounded-lg bg-blue-50 px-2 py-1 text-end text-[11px] font-bold leading-4 text-blue-900' }, row.duration),
                        row.id ? h('button', { class: 'col-span-2 inline-flex min-h-8 items-center gap-1 justify-self-start rounded-lg px-2 py-1 text-[11px] font-bold text-blue-800 hover:bg-blue-100 sm:col-span-1', type: 'button', onClick: () => jumpToStep(row.id) }, [icon('arrow', 'size-4'), t('openStep')]) : h('span', { class: 'hidden sm:block' }, ''),
                    ])) : h('p', { class: 'rounded-lg bg-slate-50 p-3 text-sm text-slate-600' }, t('noQuickMatches'))),
                ]) : null,
                quickToolsOpen.value === 'codes' ? h('section', { class: 'mb-4 rounded-2xl border border-blue-100 bg-white p-3 sm:p-4' }, [
                    h('div', { class: 'mb-3 flex items-center justify-between gap-3' }, [
                        h('h2', { class: 'm-0 flex items-center gap-2 font-bold text-slate-900' }, [icon('ticket', 'size-5 text-blue-700'), t('quickCodes')]),
                        h('button', { class: 'app-control rounded-lg px-3 py-2 text-xs font-semibold', type: 'button', onClick: () => { quickToolsOpen.value = ''; } }, t('closeDrawer')),
                    ]),
                    h('p', { class: 'mb-3 rounded-lg bg-amber-50 p-2.5 text-xs leading-5 text-amber-900' }, tree.value?.operations_guide?.codes_note || t('sourceCaution')),
                    h('input', { class: 'app-control mb-3 w-full rounded-xl border px-3 py-2.5 text-sm', type: 'search', value: codeSearch.value, placeholder: t('codesSearch'), onInput: (event) => { codeSearch.value = event.target.value; } }),
                    h('div', { class: 'max-h-96 space-y-2 overflow-y-auto pe-1', 'aria-live': 'polite' }, (tree.value?.operations_guide?.closure_codes || []).filter((row) => !codeSearch.value || normalizeSearch(`${row.code} ${row.reason}`, language.value).includes(normalizeSearch(codeSearch.value, language.value))).sort((a, b) => Number(a.code) - Number(b.code)).map((row) => h('article', { class: 'flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3', key: row.code }, [
                        h('span', { class: 'inline-flex min-w-10 items-center justify-center rounded-lg bg-indigo-100 px-2 py-1 font-bold text-indigo-900' }, row.code),
                        h('div', { class: 'min-w-0 flex-1' }, [
                            h('p', { class: 'm-0 text-sm leading-6 text-slate-800' }, row.reason),
                            h('p', { class: 'mt-2 rounded-lg bg-indigo-50 p-2 text-xs leading-5 text-indigo-950' }, [h('strong', `${t('codeAction')} `), row.agent_action || t('genericCodeAction')]),
                            row.sla ? h('p', { class: 'mt-1 text-[11px] font-semibold leading-5 text-blue-900' }, `${t('sla')} ${row.sla}`) : null,
                            row.source_reference ? h('p', { class: 'mt-1 text-[10px] leading-4 text-slate-500' }, `${t('sourceReference')}: ${row.source_reference}`) : null,
                        ]),
                    ]))),
                ]) : null,
                quickToolsOpen.value === 'packages' ? h('section', { class: 'mb-4 rounded-2xl border border-blue-100 bg-white p-3 sm:p-4' }, [
                    h('div', { class: 'mb-3 flex items-center justify-between gap-3' }, [
                        h('h2', { class: 'm-0 flex items-center gap-2 font-bold text-slate-900' }, [icon('search', 'size-5 text-blue-700'), t('quickPackages')]),
                        h('button', { class: 'app-control rounded-lg px-3 py-2 text-xs font-semibold', type: 'button', onClick: () => { quickToolsOpen.value = ''; } }, t('closeDrawer')),
                    ]),
                    h('input', { class: 'app-control mb-2 w-full rounded-xl border px-3 py-2.5 text-sm', type: 'search', value: packageSearch.value, placeholder: t('packageSearchPlaceholder'), onInput: (event) => { packageSearch.value = event.target.value; } }),
                    h('p', { class: 'mb-3 text-xs leading-5 text-slate-500' }, t('packagesNote')),
                    h('div', { class: 'max-h-[28rem] space-y-2 overflow-y-auto pe-1', 'aria-live': 'polite' }, quickPackageRows.value.length ? quickPackageRows.value.map((item) => h('article', { class: 'rounded-xl border border-slate-200 bg-slate-50 p-3', key: item.id }, [
                        h('div', { class: 'flex flex-wrap items-start justify-between gap-2' }, [
                            h('h3', { class: 'm-0 text-sm font-bold leading-6 text-slate-900' }, item.title),
                            h('span', { class: 'rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-900' }, item.period),
                        ]),
                        h('dl', { class: 'mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs leading-5' }, Object.entries(item.row).flatMap(([key, value]) => [
                        h('dt', { class: 'font-medium text-slate-500' }, packageFieldLabel(key, language.value)), h('dd', { class: 'm-0 text-end font-semibold text-slate-800' }, String(value)),
                        ])),
                        item.source ? h('p', { class: 'mt-2 text-[10px] text-slate-500' }, item.source) : null,
                    ])) : h('p', { class: 'rounded-lg bg-slate-50 p-3 text-sm text-slate-600' }, t('noQuickMatches'))),
                ]) : null,
                workspaceMode.value === 'exam' || workspaceMode.value === 'home' || workspaceMode.value === 'simulator' ? null : h('section', { class: 'quick-search-panel mb-5 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4' }, [
                    h('label', { class: 'mb-2 flex items-center gap-2 text-sm font-bold text-slate-800', for: 'quick-support-search' }, [icon('search', 'size-4 text-blue-700'), t('quickSearch')]),
                    h('div', { class: 'flex gap-2' }, [
                        h('input', {
                            id: 'quick-support-search', class: 'app-control min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm',
                            type: 'search', value: quickSearch.value, placeholder: t('quickSearchPlaceholder'),
                            onInput: (event) => { quickSearch.value = event.target.value; },
                        }),
                    ]),
                    h('p', { class: 'mt-2 text-xs leading-5 text-slate-500' }, t('searchHint')),
                    workspaceMode.value === 'reference' ? h('p', { class: 'mt-2 text-xs leading-5 text-slate-600' }, t('referenceIntro')) : null,
                    currentStepId.value === tree.value?.start && workspaceMode.value !== 'reference' ? h('button', { class: 'mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-900 transition hover:bg-indigo-100', type: 'button', onClick: () => { workspaceMode.value = 'reference'; } }, [icon('search', 'size-4'), t('openReference')]) : null,
                    workspaceMode.value === 'reference' ? h('button', { class: 'mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100', type: 'button', onClick: () => { workspaceMode.value = 'guided'; } }, [icon('back', 'size-4'), t('returnGuided')]) : null,
                    h('div', { class: 'mt-2 flex flex-wrap gap-2' }, t('searchExamples').map((example) => h('button', {
                        class: 'rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50',
                        type: 'button', onClick: () => { quickSearch.value = example; },
                    }, example))),
                    workspaceMode.value === 'reference' ? h('div', { class: 'mt-2 flex flex-wrap gap-2' }, t('referenceTopics').map((topic) => h('button', {
                        class: 'rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-900 transition hover:bg-indigo-100',
                        type: 'button', onClick: () => { quickSearch.value = topic; },
                    }, topic))) : null,
                    quickSearch.value.trim() ? h('div', { class: 'mt-3 space-y-2', 'aria-live': 'polite' }, quickSearchResults.value.length
                        ? quickSearchResults.value.map((result, index) => h('article', { class: 'search-result-card rounded-xl border border-slate-200 bg-slate-50/80 p-3', key: `${result.kind}-${result.id}` }, [
                            h('div', { class: 'flex items-start justify-between gap-3' }, [
                                h('div', { class: 'min-w-0' }, [
                                    index === 0 ? h('span', { class: 'mb-1 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800' }, t('bestMatch')) : null,
                                    h('h3', { class: 'font-semibold leading-6 text-slate-900' }, result.title),
                                    h('p', { class: 'mt-1 text-sm leading-6 text-slate-700' }, result.snippet),
                                    h('p', { class: 'mt-1 text-[11px] text-slate-500' }, `${t('searchSource')}: ${result.source}`),
                                    result.kind === 'fact' ? h('p', { class: 'mt-1 text-xs font-medium text-amber-800' }, t('oldReference')) : null,
                                ]),
                                result.kind === 'step' ? h('button', { class: 'app-control inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1.5 text-xs font-semibold', type: 'button', onClick: () => jumpToStep(result.id) }, [icon('arrow', 'size-4'), t('openStep')]) : null,
                            ]),
                            result.kind === 'fact' && result.template ? h('button', {
                                class: 'mt-2 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-800',
                                type: 'button', onClick: () => copyText(result.template, t('descriptionCopied')),
                            }, [icon('copy', 'size-4'), t('copyDescription')]) : null,
                        ]))
                        : h('p', { class: 'rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-900' }, t('noSearchResults'))) : null,
                ]),
                workspaceMode.value === 'home'
                    ? renderHome()
                    : workspaceMode.value === 'exam'
                    ? renderExam()
                    : workspaceMode.value === 'simulator' && !simulationCase.value
                    ? renderSimulator()
                    : workspaceMode.value === 'reference'
                    ? h('section', { class: 'rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm leading-6 text-slate-700' }, [
                        h('p', { class: 'font-semibold text-slate-900' }, t('referenceIntro')),
                        h('p', { class: 'mt-2 text-xs text-slate-600' }, t('searchHint')),
                    ])
                    : loading.value
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
                                simulationCase.value ? h('section', { class: 'active-scenario-card' }, [
                                    h('div', { class: 'active-scenario-heading' }, [
                                        h('span', { class: 'exam-kicker' }, `${t('simulatorStep')} · ${simulationCase.value.title[language.value]}`),
                                        h('button', { class: 'exam-secondary-button', type: 'button', onClick: showScenarioList }, t('simulatorBack')),
                                    ]),
                                    h('p', { class: 'active-scenario-customer' }, [h('strong', `${t('simulatorCustomer')}: `), simulationCase.value.customer[language.value]]),
                                    h('p', { class: 'active-scenario-goal' }, [h('strong', `${t('simulatorGoal')}: `), simulationCase.value.goal[language.value]]),
                                    simulationCase.value.image ? h('img', { class: 'case-scenario-image active-scenario-image', src: simulationCase.value.image, alt: simulationCase.value.imageAlt?.[language.value] || simulationCase.value.title[language.value] }) : null,
                                ]) : null,
                                simulationCase.value && simulatorDecision.value ? h('section', { class: 'simulator-customer-reply mb-5 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3.5 sm:px-5', 'aria-live': 'polite' }, [
                                    h('h3', { class: 'mb-1 flex items-center gap-2 text-xs font-bold text-cyan-900' }, [icon('chat', 'size-4'), t('simulatorReply')]),
                                    h('p', { class: 'leading-7 text-cyan-950' }, simulatorDecision.value.text),
                                    h('p', { class: 'mt-1 text-xs text-cyan-800' }, t('simulatorReplyHint')),
                                ]) : null,
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
                                    }, [icon('home', 'size-4'), simulationCase.value ? t('simulatorRestart') : t('newInquiry')]) : null,
                                ]),
                                completedPath.value.length ? h('details', { class: 'mb-4 overflow-hidden rounded-2xl border border-purple-100 bg-purple-50/60' }, [
                                    h('summary', { class: 'cursor-pointer list-none px-4 py-3 text-xs font-bold text-purple-900' }, t('callProgress') + ': ' + completedPath.value.length + ' ' + t('step')),
                                    h(TransitionGroup, { name: 'tree-branch', tag: 'ol', class: 'm-0 space-y-2 px-4 pb-4' }, {
                                        default: () => completedPath.value.map(({ step, option }, index) => h('li', { class: 'flex items-start gap-2 text-xs leading-5', key: step.question + '-' + index }, [
                                            h('span', { class: 'inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-white font-bold text-purple-800' }, String(index + 1)),
                                            h('span', { class: 'text-slate-700' }, [h('span', { class: 'font-semibold' }, step.question), h('span', { class: 'mx-1 text-purple-700' }, '→'), h('span', { class: 'font-bold text-purple-900' }, option.label)]),
                                        ])),
                                    }),
                                    h('p', { class: 'm-0 border-t border-purple-100 px-4 py-2 text-xs text-purple-900' }, t('callNext') + ': ' + currentStep.value.question),
                                ]) : null,
                                h('div', { class: 'question-panel mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4 sm:px-5 sm:py-5' }, [
                                    h('h2', { class: 'current-question text-xl font-bold leading-8 text-gray-900 sm:text-2xl sm:leading-9' }, currentStep.value.question),
                                ]),
                                isFinished.value ? h('section', { class: 'mb-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:p-5' }, [
                                    h('h3', { class: 'mb-1 flex items-center gap-2 font-bold text-sky-950' }, [icon('search', 'size-5'), language.value === 'ar' ? 'النتيجة التي وجدتها' : 'What we found']),
                                    h('p', { class: 'leading-7 text-sky-950' }, currentStep.value.finding || currentStep.value.question),
                                ]) : null,
                                isFinished.value && currentStep.value.check_guidance ? h('section', { class: 'mb-5 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3.5 sm:px-5' }, [
                                    h('h3', { class: 'mb-1 flex items-center gap-2 text-xs font-bold text-indigo-800' }, [icon('search', 'size-4'), t('checkGuidance')]),
                                    h('p', { class: 'leading-7 text-indigo-950' }, currentStep.value.check_guidance),
                                ]) : null,
                                currentStep.value.customer_prompt ? h('section', { class: 'customer-prompt mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 sm:px-5', 'aria-label': t('askCustomer') }, [
                                    h('h3', { class: 'mb-1 flex items-center gap-2 text-xs font-bold text-emerald-800' }, [icon('chat', 'size-4'), t('askCustomer')]),
                                    h('p', { class: 'leading-7 text-emerald-950' }, currentStep.value.customer_prompt),
                                ]) : null,
                                currentStep.value.options?.length > 0 && currentStepId.value !== 'start_menu' && currentStepId.value !== 'tools_hub' && (currentStep.value.check_guidance || currentStep.value.action) ? h('section', { class: 'staff-check mb-5 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3.5 sm:px-5' }, [
                                    h('h3', { class: 'mb-2 flex items-center gap-2 text-xs font-bold text-indigo-800' }, [icon('ticket', 'size-4'), t('staffCheck')]),
                                    currentStep.value.check_guidance ? h('div', [
                                        h('h4', { class: 'text-xs font-bold text-indigo-900' }, t('checkGuidance')),
                                        h('p', { class: 'mt-1 leading-7 text-indigo-950' }, currentStep.value.check_guidance),
                                    ]) : null,
                                    currentStep.value.action ? h('div', { class: currentStep.value.check_guidance ? 'mt-3' : '' }, [
                                        h('h4', { class: 'text-xs font-bold text-indigo-900' }, t('whatToDo')),
                                        h('p', { class: 'mt-1 leading-7 text-indigo-950' }, currentStep.value.action),
                                    ]) : null,
                                ]) : null,
                                currentStep.value.source_reference ? h('details', { class: 'mb-5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2' }, [
                                    h('summary', { class: 'cursor-pointer text-xs font-bold text-slate-600' }, t('sourceReference')),
                                    h('p', { class: 'mt-2 text-xs leading-5 text-slate-600' }, currentStep.value.source_reference),
                                ]) : null,
                                currentStep.value.product_catalog ? (() => {
                                    const catalog = currentStep.value.product_catalog;
                                    const selectable = catalog.selectable !== false;
                                    return h('section', { class: 'product-catalog mb-5 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5' }, [
                                        h('h3', { class: 'flex items-center gap-2 text-lg font-bold text-indigo-950' }, [icon('ticket', 'size-5'), catalog.title]),
                                        h('p', { class: 'mt-2 text-sm leading-6 text-indigo-950' }, catalog.scope_note),
                                        ...catalog.sections.map((section, sectionIndex) => {
                                            const rows = section.rows || [];
                                            const keys = rows.length ? Object.keys(rows[0]) : [];
                                            return h('section', { class: 'mt-4', key: `${section.title}-${sectionIndex}` }, [
                                                h('h4', { class: 'mb-2 text-sm font-bold text-slate-900' }, section.title),
                                                h('div', { class: 'grid gap-2' }, rows.map((row, rowIndex) => {
                                                    const chosen = selectedProduct.value?.sectionIndex === sectionIndex && selectedProduct.value?.rowIndex === rowIndex;
                                                    return h('article', {
                                                        class: `rounded-xl border p-3 ${chosen ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`,
                                                        key: `${sectionIndex}-${rowIndex}`,
                                                    }, [
                                                        h('dl', { class: 'grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-3 gap-y-1.5 text-sm' }, keys.map((key, fieldIndex) => [
                                                            h('dt', { class: 'font-medium text-slate-500', key: `label-${key}` }, section.columns?.[fieldIndex] || key),
                                                            h('dd', { class: 'm-0 text-end font-semibold text-slate-900', key: `value-${key}` }, row[key]),
                                                        ]).flat()),
                                                        selectable ? h('button', {
                                                            class: 'mt-3 min-h-10 w-full rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-800 active:scale-[0.99]',
                                                            type: 'button', 'aria-pressed': chosen,
                                                            onClick: () => selectProduct(row, sectionIndex, rowIndex),
                                                        }, catalog.select_prompt || t('packageSelect')) : null,
                                                    ]);
                                                })),
                                            ]);
                                        }),
                                        h('ul', { class: 'mt-4 list-disc space-y-1 rounded-xl bg-white p-3 ps-8 text-sm leading-6 text-slate-700' }, catalog.notes.map((note) => h('li', note))),
                                        h('a', { class: 'mt-3 inline-flex text-xs font-semibold text-blue-800 underline', href: catalog.source_url, target: '_blank', rel: 'noopener noreferrer' }, catalog.source_label),
                                    ]);
                                })() : null,
                                currentStep.value.package_catalog ? (() => {
                                    const catalog = currentStep.value.package_catalog;
                                    const renderTable = (columns, rows, keys, tableTitle, selectable = true) => h('section', { class: 'mt-4' }, [
                                        h('h4', { class: 'mb-2 text-sm font-bold text-slate-900' }, tableTitle),
                                        h('div', { class: 'grid gap-2 md:hidden' }, rows.map((row, index) => h('article', {
                                            class: `rounded-xl border p-3 ${selectedPackage.value?.index === index && selectedPackage.value?.period === packagePeriod.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`,
                                            key: `${tableTitle}-card-${index}`,
                                        }, [
                                            h('dl', { class: 'grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm' }, keys.flatMap((key, fieldIndex) => [
                                                h('dt', { class: 'font-medium text-slate-500' }, columns[fieldIndex]),
                                                h('dd', { class: 'm-0 text-end font-semibold text-slate-900' }, row[key]),
                                            ])),
                                            selectable ? h('button', {
                                                class: 'mt-3 min-h-10 w-full rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-800 active:scale-[0.99]',
                                                type: 'button',
                                                'aria-pressed': selectedPackage.value?.index === index && selectedPackage.value?.period === packagePeriod.value,
                                                onClick: () => selectPackage(row, index),
                                            }, t('packageSelect')) : null,
                                        ]))),
                                        h('div', { class: 'hidden overflow-x-auto rounded-xl border border-slate-200 md:block' }, [
                                            h('table', { class: 'w-full text-start text-sm' }, [
                                                h('thead', { class: 'sticky top-0 bg-slate-100 text-slate-800' }, [h('tr', [
                                                    ...columns.map((column) => h('th', { class: 'p-2 font-semibold' }, column)),
                                                    ...(selectable ? [h('th', { class: 'p-2 font-semibold' }, t('packageSelect'))] : []),
                                                ])]),
                                                h('tbody', rows.map((row, index) => h('tr', { class: `border-t border-slate-200 ${selectedPackage.value?.index === index && selectedPackage.value?.period === packagePeriod.value ? 'bg-blue-50' : 'odd:bg-white even:bg-slate-50'}`, key: `${tableTitle}-${index}` }, [
                                                    ...keys.map((key) => h('td', { class: 'p-2 align-top' }, row[key])),
                                                    ...(selectable ? [h('td', { class: 'p-2 text-end' }, [h('button', {
                                                        class: 'rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800',
                                                        type: 'button', onClick: () => selectPackage(row, index),
                                                    }, t('packageSelect'))])] : []),
                                                ]))),
                                            ]),
                                        ]),
                                    ]);
                                    return h('section', { class: 'package-catalog mb-5 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 sm:p-5' }, [
                                        h('h3', { class: 'flex items-center gap-2 text-lg font-bold text-indigo-950' }, [icon('ticket', 'size-5'), catalog.title]),
                                        h('p', { class: 'mt-2 text-sm leading-6 text-indigo-950' }, catalog.scope_note),
                                        h('div', { class: 'mt-4 grid grid-cols-2 gap-2 rounded-xl bg-white p-1.5' }, [
                                            ...[['monthly', t('packageMonthly')], ['yearly', t('packageYearly')]].map(([period, label]) => h('button', {
                                                class: `min-h-10 rounded-lg px-2 py-2 text-xs font-bold transition sm:text-sm ${packagePeriod.value === period ? 'bg-indigo-700 text-white' : 'text-slate-700 hover:bg-indigo-50'}`,
                                                type: 'button', 'aria-pressed': packagePeriod.value === period,
                                                onClick: () => { packagePeriod.value = period; selectedPackage.value = null; },
                                            }, label)),
                                        ]),
                                        packagePeriod.value === 'monthly' ? renderTable(catalog.monthly_columns, catalog.monthly_rows, ['speed', 'quota', 'price'], catalog.monthly_title) : null,
                                        packagePeriod.value === 'yearly' ? renderTable(catalog.yearly_columns, catalog.yearly_rows, ['plan', 'quota', 'price'], catalog.yearly_title) : null,
                                        packageCustomerScript.value ? h('section', { class: 'mt-4 rounded-xl border border-green-200 bg-green-50 p-3 sm:p-4' }, [
                                            h('h4', { class: 'font-bold text-green-950' }, t('packagePlanScript')),
                                            h('p', { class: 'mt-2 text-sm leading-6 text-green-950' }, packageCustomerScript.value),
                                            h('button', { class: 'mt-3 min-h-10 rounded-lg bg-green-800 px-3 py-2 text-sm font-bold text-white hover:bg-green-900', type: 'button', onClick: copyCustomerScript }, [icon('copy', 'size-4'), t('copy')]),
                                        ]) : null,
                                        h('details', { class: 'mt-3 rounded-xl border border-indigo-100 bg-white/80 p-3' }, [
                                            h('summary', { class: 'cursor-pointer font-semibold text-indigo-900' }, t('checkBeforeQuote')),
                                            h('ul', { class: 'mt-2 list-disc space-y-1 ps-5 text-sm leading-6 text-slate-700' }, catalog.staff_checks.map((check) => h('li', check))),
                                        ]),
                                        h('details', { class: 'mt-3 rounded-xl border border-indigo-100 bg-white/80 p-3' }, [
                                            h('summary', { class: 'cursor-pointer font-semibold text-indigo-900' }, catalog.addons_title),
                                            renderTable(catalog.addon_columns, catalog.addon_rows, ['kind', 'quota', 'price', 'term'], catalog.addons_title, false),
                                        ]),
                                        h('details', { class: 'mt-3 rounded-xl border border-indigo-100 bg-white/80 p-3' }, [
                                            h('summary', { class: 'cursor-pointer font-semibold text-indigo-900' }, language.value === 'ar' ? 'ملاحظات السعر والتجديد' : 'Price and renewal notes'),
                                            h('ul', { class: 'mt-2 list-disc space-y-1 ps-5 text-xs leading-5 text-slate-700' }, catalog.notes.map((note) => h('li', note))),
                                        ]),
                                        h('a', { class: 'mt-3 inline-flex text-xs font-semibold text-blue-800 underline', href: catalog.source_url, target: '_blank', rel: 'noopener noreferrer' }, catalog.source_label),
                                    ]);
                                })() : null,
                                isFinished.value
                                    ? h('div', { class: 'space-y-4', role: 'status' }, [
                                        !isPackageInquiry.value ? h('div', { class: 'inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white' }, [
                                            icon('clock', 'size-5'),
                                            h('span', t('sla')),
                                            h('span', currentStep.value.sla || '—'),
                                        ]) : null,
                                        !isPackageInquiry.value ? h('section', { class: 'rounded-2xl border border-orange-200 bg-orange-100 p-4 sm:p-5' }, [
                                            h('h3', { class: 'mb-2 flex items-center gap-2 font-bold text-orange-950' }, [
                                                icon('alert', 'size-5'), t('action'),
                                            ]),
                                            h('p', { class: 'leading-7 text-orange-950' }, currentStep.value.action || t('generalCheckHint')),
                                        ]) : null,
                                        !isPackageInquiry.value && currentStep.value.reference_guidance ? h('section', { class: 'reference-guidance rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:p-5' }, [
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
                                        !isPackageInquiry.value ? h('section', { class: 'rounded-2xl border border-green-200 bg-green-100 p-4 sm:p-5' }, [
                                            h('h3', { class: 'mb-2 flex items-center gap-2 font-bold text-green-950' }, [
                                                icon('chat', 'size-5'), t('customerScript'),
                                            ]),
                                            h('p', { class: 'leading-7 text-green-950' }, productCustomerScript.value || packageCustomerScript.value || currentStep.value.customer_script || '—'),
                                        ]) : null,
                                        simulationCase.value ? h('section', { class: 'simulator-complete-card' }, [
                                            h('h3', [icon('check', 'size-5'), t('simulatorDone')]),
                                            h('section', { class: 'simulator-score-card' }, [
                                                h('h4', t('simulatorScore')),
                                                h('p', `${simulatorScore.value} / ${simulatorAttempts.value.length} · ${t('simulatorCorrect')}`),
                                                simulatorAttempts.value.length === 0 ? h('p', t('simulatorNoScore')) : null,
                                                simulatorAttempts.value.length > 0 && simulatorScore.value === simulatorAttempts.value.length ? h('p', t('simulatorAllCorrect')) : null,
                                                simulatorAttempts.value.some((attempt) => !attempt.correct) ? h('div', { class: 'simulator-mistakes' }, [
                                                    h('h5', t('simulatorMistakes')),
                                                    h('ol', simulatorAttempts.value.filter((attempt) => !attempt.correct).map((attempt, index) => h('li', { key: `${attempt.stepId}-${index}` }, [
                                                        h('strong', attempt.question),
                                                        h('span', [h('b', `${t('simulatorYourChoice')}: `), attempt.selectedLabel]),
                                                        h('span', [h('b', `${t('simulatorExpectedChoice')}: `), attempt.expectedLabel]),
                                                        h('span', [h('b', `${t('simulatorWhyWrong')}: `), attempt.reason || (language.value === 'ar' ? 'الفرع الصحيح يتحدد من رد الحالة ونتيجة الفحص المعروضة.' : 'The correct branch follows the simulated reply or system result.')]),
                                                    ]))),
                                                ]) : null,
                                            ]),
                                            currentStep.value.action ? h('p', [h('strong', `${t('action')}: `), currentStep.value.action]) : null,
                                            currentStep.value.customer_script ? h('p', [h('strong', `${t('customerScript')}: `), currentStep.value.customer_script]) : null,
                                            h('p', [h('strong', `${t('simulatorSource')}: `), simulationCase.value.source]),
                                            h('div', { class: 'simulator-complete-actions' }, [
                                                h('button', { class: 'exam-primary-button', type: 'button', onClick: showScenarioList }, t('simulatorBack')),
                                                h('button', { class: 'exam-secondary-button', type: 'button', onClick: restartScenario }, t('simulatorRestart')),
                                            ]),
                                        ]) : null,
                                        !isPackageInquiry.value ? h('details', { class: 'comment-generator overflow-hidden rounded-2xl border border-slate-200 bg-slate-50' }, [
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
                                        ]) : null,
                                        !isPackageInquiry.value ? h('div', { class: 'grid gap-2 sm:grid-cols-2' }, [
                                            h('button', {
                                                class: 'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-green-900 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2',
                                                type: 'button',
                                                onClick: copyCustomerScript,
                                            }, [icon('copy', 'size-5'), t('copy')]),
                                        ]) : null,
                                        h('button', {
                                            class: 'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500',
                                            type: 'button',
                                            onClick: restart,
                                        }, [icon('home', 'size-5'), simulationCase.value ? t('simulatorRestart') : t('newInquiry')]),
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
                                    ]),
                            ]) }),
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
            quickDrawerOpen.value ? h('div', { class: 'fixed inset-0 z-50 flex items-end justify-center', role: 'presentation' }, [
                h('button', { class: 'absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]', type: 'button', 'aria-label': t('closeDrawer'), onClick: () => { quickDrawerOpen.value = false; } }),
                h('section', { class: 'quick-drawer relative z-10 max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-4 pb-6 shadow-2xl sm:mb-4 sm:rounded-3xl sm:p-5', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('quickAccess') }, [
                    h('div', { class: 'mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 sm:hidden' }),
                    h('div', { class: 'mb-4 flex items-center justify-between gap-3' }, [
                        h('h2', { class: 'm-0 text-lg font-bold text-slate-900' }, t('quickAccess')),
                        h('button', { class: 'app-control rounded-lg px-3 py-2 text-xs font-semibold', type: 'button', onClick: () => { quickDrawerOpen.value = false; } }, t('closeDrawer')),
                    ]),
                    h('p', { class: 'mb-4 text-sm leading-6 text-slate-600' }, language.value === 'ar' ? 'اختار الأداة مباشرة من أي خطوة في المكالمة.' : 'Open a support tool directly from any call step.'),
                    h('div', { class: 'grid grid-cols-2 gap-2 sm:grid-cols-4' }, [
                        ...[['sla', t('quickSla'), 'clock'], ['codes', t('quickCodes'), 'ticket'], ['packages', t('quickPackages'), 'search'], ['change', t('quickChangePackage'), 'ticket'], ['exam', t('examMode'), 'question'], ['reference', t('openReference'), 'search'], ['problem', t('quickProblem'), 'alert'], ['inquiry', t('quickInquiry'), 'chat'], ['request', t('quickRequest'), 'ticket'], ['billing', t('quickBilling'), 'search'], ['complaint', t('quickComplaint'), 'chat']].map(([key, label, iconName]) => h('button', {
                            class: 'app-control inline-flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center text-sm font-bold transition hover:border-blue-300 hover:bg-blue-50 active:scale-[0.98]',
                            type: 'button', onClick: () => openQuickTool(key),
                        }, [icon(iconName, 'size-5 text-blue-700'), label])),
                    ]),
                ]),
            ]) : null,
            h('button', {
                class: 'quick-access-launcher fixed bottom-3 left-1/2 z-40 inline-flex min-h-12 -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-white/80 bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
                type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': quickDrawerOpen.value,
                onClick: () => { quickDrawerOpen.value = true; },
            }, [icon('grid', 'size-5'), t('quickAccess')]),

        ]);
    },
};

createApp(App).mount('#app');
