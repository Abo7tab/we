import './bootstrap';
import { computed, createApp, h, onBeforeUnmount, onMounted, nextTick, ref, Transition } from 'vue';

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
        stop: [h('rect', { x: '5', y: '5', width: '14', height: '14', rx: '2' })],
        speak: [h('path', { d: 'M11 5 6 9H3v6h3l5 4V5Z' }), h('path', { d: 'M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13' })],
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

function optionIcon(label = '') {
    if (/adsl|router|راوتر|لمب|واي.?فاي|wifi/i.test(label)) return 'router';
    if (/cable|wire|fiber|سلك|كابل|فايبر/i.test(label)) return 'cable';
    if (/physical|فيزيائي|سلك|حرارة|dsl|adsl/i.test(label)) return 'cable';
    if (/logical|منطقي|ip|brows|تصفح|سرع|slow/i.test(label)) return 'search';
    if (/tt|ticket|تركيب|طلب|شكوى|complaint|order|تذكرة/i.test(label)) return 'ticket';
    if (/package|باقة|خدمة|service|billing|فاتورة/i.test(label)) return 'chat';
    return 'question';
}

function normalizeSpeech(value = '', language = 'ar') {
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
    return normalized
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim()
        .replace(/\s+/g, ' ');
}

const COPY = {
    ar: {
        brand: 'مساعد الدعم الفني', title: 'دليل الدعم الفني', fresh: 'جديد', loading: 'جاري تحميل شجرة القرارات…', retry: 'إعادة المحاولة',
        missing: 'الخطوة الحالية غير موجودة في الشجرة.', step: 'الخطوة', back: 'رجوع خطوة', sla: 'المهلة:', action: 'إجراء الموظف',
        customerScript: 'نص تقوله للعميل', copy: 'نسخ نص العميل', newInquiry: 'بدء استعلام جديد', choose: 'اختيار', footer: 'تُحمّل الشجرة من Laravel، وتتم خطوات المسار داخل المتصفح.',
        copied: 'تم نسخ نص العميل.', noScript: 'لا يوجد نص عميل لنسخه في هذه الخطوة.', copyError: 'تعذر النسخ تلقائيًا. يمكنك تحديد النص ونسخه يدويًا.',
        invalidStep: 'هذا الاختيار مرتبط بخطوة غير موجودة. أبلغ المسؤول عن الشجرة.', stepLimit: 'وصل المسار إلى الحد الآمن للتنقل. أعد البدء أو راجع الشجرة.',
        incomplete: 'بيانات الخطوة التالية غير مكتملة. أبلغ المسؤول عن الشجرة.', loadError: 'تعذر تحميل شجرة القرارات.', invalidTree: 'ملف شجرة القرارات غير مكتمل.',
        voiceUnsupported: 'التعرف على الصوت غير مدعوم في هذا المتصفح. استخدم الأزرار للاختيار.', micDenied: 'اسمح للمتصفح باستخدام الميكروفون، ثم حاول مرة أخرى.',
        voiceUnavailable: 'خدمة التعرف على الصوت غير متاحة. استخدم الأزرار للاختيار.', noSpeech: 'لم أسمع صوتًا. اضغط الميكروفون وحاول مرة أخرى.',
        micError: 'تعذر الوصول إلى الميكروفون.', listen: 'استمع الآن… قل اختيارًا ظاهرًا على الشاشة.', matched: 'تم التعرف على الاختيار.',
        ambiguous: 'لم يتطابق الكلام مع اختيار واحد. قل كلمة أقصر من الاختيار أو اضغطه؛ سأواصل الاستماع.', voiceError: 'تعذر التعرف على الصوت. اسمح للميكروفون أو استخدم الأزرار.',
        startMic: 'اختيار صوتي', stopMic: 'إيقاف الاستماع', stopAudio: 'إيقاف الصوت', readResult: 'قراءة النتيجة',
        autoRead: 'قراءة السؤال تلقائيًا', voice: 'الصوت', language: 'اللغة', dark: 'الوضع الداكن', light: 'الوضع الفاتح',
        testVoice: 'اختبار الصوت', rateUnit: '×', voiceNotInstalled: 'لو مش ظاهر صوت عربي هنا، جودة القراءة تعتمد على الأصوات المثبتة في الجهاز والمتصفح.',
        voicePrivacy: 'قد يعالج المتصفح الصوت عبر خدمة خارجية وبحاجة إلى الإنترنت؛ هذا الموقع لا يحفظ تسجيل الميكروفون.',
        operations: 'رقم البحث والتسجيل في النظام', searchTitle: 'أبحث بأي رقم؟', recordTitle: 'أسجل إيه؟', codesTitle: 'أكواد الإغلاق الظاهرة في دليل التدريب', codesSearch: 'ابحث برقم الكود أو الوصف', codeLabel: 'الكود', reasonLabel: 'الوصف',
        toolLabel: 'الأداة:', supportIssue: 'حدث خطأ أثناء التحميل.', retryMic: 'تعذر تشغيل الميكروفون. راجع إذن الميكروفون أو استخدم الأزرار.', micEnded: 'انتهى الاستماع بعد عدة محاولات. اضغط الميكروفون للمحاولة مجددًا.',
    },
    en: {
        brand: 'Technical Support Assistant', title: 'Support Guide', fresh: 'New', loading: 'Loading decision tree…', retry: 'Try again',
        missing: 'The current step is missing from the tree.', step: 'Step', back: 'Go back', sla: 'SLA:', action: 'Agent action',
        customerScript: 'What to tell the customer', copy: 'Copy customer script', newInquiry: 'Start a new inquiry', choose: 'Choose', footer: 'The tree is loaded from Laravel; steps run in your browser.',
        copied: 'Customer script copied.', noScript: 'There is no customer script to copy at this step.', copyError: 'Automatic copy failed. Select and copy the text manually.',
        invalidStep: 'This option points to a missing step. Notify the tree administrator.', stepLimit: 'The safe step limit was reached. Restart or review the tree.',
        incomplete: 'The next step data is incomplete. Notify the tree administrator.', loadError: 'Could not load the decision tree.', invalidTree: 'The decision tree file is incomplete.',
        voiceUnsupported: 'Speech recognition is not supported in this browser. Use the buttons instead.', micDenied: 'Allow microphone access in your browser, then try again.',
        voiceUnavailable: 'Speech recognition is unavailable. Use the buttons instead.', noSpeech: 'No speech was detected. Tap the microphone and try again.',
        micError: 'The microphone could not be accessed.', listen: 'Listening… say one of the visible options.', matched: 'Option recognized.',
        ambiguous: 'No single option matched. Say a shorter phrase from the button or tap it; listening will continue.', voiceError: 'Speech recognition failed. Allow microphone access or use the buttons.',
        startMic: 'Voice choice', stopMic: 'Stop listening', stopAudio: 'Stop audio', readResult: 'Read result',
        autoRead: 'Read each question automatically', voice: 'Voice', language: 'Language', dark: 'Dark mode', light: 'Light mode',
        testVoice: 'Test voice', rateUnit: '×', voiceNotInstalled: 'If no Arabic voice appears here, speech quality depends on voices installed on the device and browser.',
        voicePrivacy: 'The browser may process audio through an online service; this site does not save microphone recordings.',
        operations: 'Which ID and record should I use?', searchTitle: 'What should I search by?', recordTitle: 'What should I record?', codesTitle: 'Close codes listed in training guide', codesSearch: 'Search by code or reason', codeLabel: 'Code', reasonLabel: 'Reason',
        toolLabel: 'Tool:', supportIssue: 'An error occurred while loading.', retryMic: 'Could not start the microphone. Check its permission or use the buttons.', micEnded: 'Listening ended after several attempts. Tap the microphone to try again.',
    },
};

const App = {
    setup() {
        const tree = ref(null);
        const currentStepId = ref(null);
        const history = ref([]);
        const loading = ref(true);
        const loadError = ref('');
        const notice = ref('');
        const isListening = ref(false);
        const isSpeaking = ref(false);
        const language = ref('ar');
        const theme = ref('light');
        const voices = ref([]);
        const selectedVoice = ref('');
        const autoRead = ref(true);
        const speechRate = ref(0.9);
        const codeSearch = ref('');
        const voiceStatus = ref('');
        let activeRecognition = null;
        const t = (key) => COPY[language.value][key] ?? key;
        let micWasStopped = false;
        let micRetryCount = 0;
        let micRetryTimer = null;

        const currentStep = computed(() => {
            if (!tree.value || !currentStepId.value) return null;
            return tree.value[currentStepId.value] ?? null;
        });
        const isFinished = computed(() => currentStep.value?.options?.length === 0);

        function refreshVoices() {
            if (!window.speechSynthesis) return;
            voices.value = window.speechSynthesis.getVoices().filter((voice) => voice.lang?.toLowerCase().startsWith(language.value));
            if (!voices.value.some((voice) => voice.voiceURI === selectedVoice.value)) {
                selectedVoice.value = voices.value.find((voice) => voice.lang?.toLowerCase() === (language.value === 'ar' ? 'ar-eg' : 'en-us'))?.voiceURI ?? voices.value[0]?.voiceURI ?? '';
            }
        }
        function stopAudio() { window.speechSynthesis?.cancel(); isSpeaking.value = false; }
        function stopListening() {
            micWasStopped = true;
            if (micRetryTimer) clearTimeout(micRetryTimer);
            micRetryTimer = null;
            activeRecognition?.abort();
            activeRecognition = null;
            isListening.value = false;
        }
        function stopAll() { stopListening(); stopAudio(); }
        function speak(text) {
            if (!window.speechSynthesis || !text) return;
            stopAudio();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language.value === 'ar' ? 'ar-EG' : 'en-US';
            utterance.rate = Number(speechRate.value);
            utterance.voice = voices.value.find((voice) => voice.voiceURI === selectedVoice.value) ?? null;
            utterance.onstart = () => { isSpeaking.value = true; };
            utterance.onend = utterance.onerror = () => { isSpeaking.value = false; };
            window.speechSynthesis.speak(utterance);
        }
        function speakCurrentStep() { if (autoRead.value && currentStep.value) speak(currentStep.value.question); }
        function readResult() { speak([currentStep.value?.action, currentStep.value?.sla, currentStep.value?.customer_script].filter(Boolean).join('. ')); }
        function testVoice() {
            speak(language.value === 'ar'
                ? 'هذا اختبار للصوت. تقدر توقف القراءة من زر إيقاف الصوت.'
                : 'This is a voice test. You can stop playback with the stop audio button.');
        }

        function afterStepChange() {
            voiceStatus.value = '';
            nextTick(() => {
                speakCurrentStep();
            });
        }

        function findSpokenOption(transcript) {
            const spoken = normalizeSpeech(transcript, language.value);
            if (!spoken) return null;

            const buttons = [...document.querySelectorAll('.option-button')];
            const exactMatches = buttons.filter((button) => normalizeSpeech(button.innerText, language.value) === spoken);
            if (exactMatches.length === 1) return exactMatches[0];
            if (exactMatches.length > 1) return null;

            const words = spoken.split(' ').filter((word) => word.length > 2);
            const matches = buttons.filter((button) => {
                const label = normalizeSpeech(button.innerText, language.value);
                if (!label) return false;
                if (spoken.includes(label) || label.includes(spoken)) return true;
                const common = words.filter((word) => label.split(' ').includes(word));
                return words.length > 0 && common.length >= 1;
            });
            return matches.length === 1 ? matches[0] : null;
        }

        function startListening() {
            if (isListening.value) {
                stopListening();
                return;
            }
            const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!Recognition) {
                voiceStatus.value = t('voiceUnsupported');
                return;
            }
            stopAudio();
            micWasStopped = false;
            micRetryCount = 0;
            listenSession(Recognition);
        }

        function listenSession(Recognition) {
            if (micWasStopped) return;
            const recognition = new Recognition();
            activeRecognition = recognition;
            recognition.lang = language.value === 'ar' ? 'ar-EG' : 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 3;
            recognition.continuous = true;
            isListening.value = true;

            recognition.onstart = () => {
                isListening.value = true;
                voiceStatus.value = t('listen');
            };
            recognition.onresult = (event) => {
                const result = event.results?.[event.resultIndex];
                const alternatives = result
                    ? Array.from({ length: result.length }, (_, index) => result[index])
                    : [];
                const matched = alternatives
                    .map((result) => findSpokenOption(result.transcript))
                    .filter(Boolean);
                const uniqueMatches = [...new Set(matched)];

                if (uniqueMatches.length === 1) {
                    voiceStatus.value = t('matched');
                    stopListening();
                    uniqueMatches[0].click();
                } else {
                    voiceStatus.value = t('ambiguous');
                }
            };
            recognition.onerror = (event) => {
                const messages = {
                    'not-allowed': t('micDenied'),
                    'service-not-allowed': t('voiceUnavailable'),
                    'no-speech': t('noSpeech'),
                    'audio-capture': t('micError'),
                    'network': t('voiceUnavailable'),
                };
                voiceStatus.value = messages[event.error] || t('voiceError');
                if (event.error !== 'no-speech') micWasStopped = true;
            };
            recognition.onend = () => {
                isListening.value = false;
                if (activeRecognition === recognition) activeRecognition = null;
                if (!micWasStopped && micRetryCount < 3) {
                    micRetryCount += 1;
                    micRetryTimer = setTimeout(() => listenSession(Recognition), 500);
                } else if (!micWasStopped) {
                    micWasStopped = true;
                    voiceStatus.value = t('micEnded');
                }
            };

            try {
                recognition.start();
            } catch {
                micWasStopped = true;
                isListening.value = false;
                activeRecognition = null;
                voiceStatus.value = t('retryMic');
            }
        }

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
                }
                language.value = nextLanguage;
                document.documentElement.lang = nextLanguage;
                document.documentElement.dir = nextLanguage === 'ar' ? 'rtl' : 'ltr';
                try { selectedVoice.value = localStorage.getItem('support-voice-' + nextLanguage) ?? ''; } catch { selectedVoice.value = ''; }
                refreshVoices();
                notice.value = '';
            } catch (error) {
                loadError.value = error instanceof Error ? error.message : COPY[nextLanguage].supportIssue;
            } finally {
                loading.value = false;
            }
        }

        function switchLanguage(next) { stopAll(); loadTree(false, next).then(speakCurrentStep); }
        function switchTheme(next) {
            theme.value = next;
            try { localStorage.setItem('support-theme', next); } catch { /* preference is optional */ }
        }
        function setAutoRead(enabled) {
            autoRead.value = enabled;
            try { localStorage.setItem('support-auto-read', enabled ? 'on' : 'off'); } catch { /* optional preference */ }
            if (!enabled) stopAudio();
        }
        function setSpeechRate(rate) {
            speechRate.value = Number(rate);
            try { localStorage.setItem('support-speech-rate', String(speechRate.value)); } catch { /* optional preference */ }
        }
        function setVoice(voiceURI) {
            selectedVoice.value = voiceURI;
            try { localStorage.setItem('support-voice-' + language.value, voiceURI); } catch { /* optional preference */ }
        }

        function choose(option) {
            const nextStep = option?.next_step;

            if (typeof nextStep !== 'string' || !Object.hasOwn(tree.value ?? {}, nextStep)) {
                notice.value = 'هذا الاختيار مرتبط بخطوة غير موجودة. أبلغ المسؤول عن الشجرة.';
                return;
            }

            if (history.value.length >= MAX_STEPS_PER_CALL) {
                notice.value = 'وصل المسار إلى الحد الآمن للتنقل. أعد البدء أو راجع الشجرة.';
                return;
            }

            if (typeof tree.value[nextStep]?.question !== 'string'
                || !Array.isArray(tree.value[nextStep]?.options)) {
                notice.value = 'بيانات الخطوة التالية غير مكتملة. أبلغ المسؤول عن الشجرة.';
                return;
            }

            history.value = [...history.value, currentStepId.value];
            currentStepId.value = nextStep;
            notice.value = '';
            afterStepChange();
        }

        function goBack() {
            if (history.value.length === 0) return;
            currentStepId.value = history.value.at(-1);
            history.value = history.value.slice(0, -1);
            notice.value = '';
            afterStepChange();
        }

        function restart() {
            if (!tree.value) return;
            currentStepId.value = tree.value.start;
            history.value = [];
            notice.value = '';
            afterStepChange();
        }

        async function copyCustomerScript() {
            const script = currentStep.value?.customer_script;
            if (typeof script !== 'string' || script.length === 0) {
                notice.value = 'لا يوجد نص عميل لنسخه في هذه الخطوة.';
                return;
            }

            try {
                await navigator.clipboard.writeText(script);
                notice.value = 'تم نسخ نص العميل.';
            } catch {
                notice.value = 'تعذر النسخ تلقائيًا. يمكنك تحديد نص العميل ونسخه يدويًا.';
            }
        }

        onMounted(() => {
            try { theme.value = localStorage.getItem('support-theme') === 'dark' ? 'dark' : 'light'; } catch { /* optional preference */ }
            try {
                autoRead.value = localStorage.getItem('support-auto-read') !== 'off';
                const savedRate = Number(localStorage.getItem('support-speech-rate'));
                if (Number.isFinite(savedRate) && savedRate >= 0.65 && savedRate <= 1.3) speechRate.value = savedRate;
                selectedVoice.value = localStorage.getItem('support-voice-ar') ?? '';
            } catch { /* optional preferences */ }
            document.documentElement.lang = 'ar';
            document.documentElement.dir = 'rtl';
            refreshVoices();
            window.speechSynthesis?.addEventListener?.('voiceschanged', refreshVoices);
            loadTree(true);
        });
        onBeforeUnmount(() => {
            activeRecognition?.abort();
            stopAudio();
            window.speechSynthesis?.removeEventListener?.('voiceschanged', refreshVoices);
        });

        return () => h('main', {
                class: `app-shell ${theme.value === 'dark' ? 'app-dark' : ''} relative isolate min-h-screen w-full overflow-x-clip bg-slate-50 px-4 py-6 pb-28 text-gray-800 sm:px-6 sm:py-10`,
        }, [
            h('div', { class: 'wave-backdrop pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 overflow-hidden sm:h-64', 'aria-hidden': 'true' }, [
                h('svg', { class: 'wave wave-one absolute bottom-0 h-full w-[200%]', viewBox: '0 0 2880 320', preserveAspectRatio: 'none' }, [
                    h('path', { d: 'M0 160 C240 220 480 90 720 145 C960 200 1200 90 1440 150 V320 H0 Z M1440 150 C1680 210 1920 80 2160 135 C2400 190 2640 80 2880 140 V320 H1440 Z', fill: '#60a5fa', opacity: '.20' }),
                ]),
                h('svg', { class: 'wave wave-two absolute bottom-0 h-[85%] w-[200%]', viewBox: '0 0 2880 320', preserveAspectRatio: 'none' }, [
                    h('path', { d: 'M0 190 C220 120 440 240 700 180 C960 120 1180 235 1440 175 V320 H0 Z M1440 175 C1660 105 1880 225 2140 165 C2400 105 2620 220 2880 160 V320 H1440 Z', fill: '#818cf8', opacity: '.18' }),
                ]),
                h('svg', { class: 'wave wave-three absolute bottom-0 h-[70%] w-[200%]', viewBox: '0 0 2880 320', preserveAspectRatio: 'none' }, [
                    h('path', { d: 'M0 220 C260 160 470 270 730 210 C990 150 1180 275 1440 215 V320 H0 Z M1440 215 C1700 155 1910 265 2170 205 C2430 145 2620 270 2880 210 V320 H1440 Z', fill: '#c4b5fd', opacity: '.28' }),
                ]),
            ]),
            h('section', {
                class: 'app-card relative z-10 mx-auto max-w-2xl rounded-3xl bg-white p-5 shadow-2xl shadow-slate-400/20 ring-1 ring-slate-900/5 sm:p-8',
                'aria-busy': loading.value ? 'true' : 'false',
            }, [
                h('header', { class: 'mb-6 space-y-4' }, [
                    h('div', [
                        h('p', { class: 'mb-2 text-sm font-semibold text-blue-700' }, t('brand')),
                        h('h1', { class: 'text-2xl font-bold text-gray-900' }, t('title')),
                    ]),
                    h('div', { class: 'flex gap-2' }, [
                        h('button', { class: 'app-control rounded-xl border px-3 py-2 text-sm', type: 'button', onClick: () => switchLanguage(language.value === 'ar' ? 'en' : 'ar') }, language.value === 'ar' ? 'EN' : 'عربي'),
                        h('button', { class: 'app-control rounded-xl border px-3 py-2', type: 'button', onClick: () => switchTheme(theme.value === 'light' ? 'dark' : 'light'), 'aria-label': theme.value === 'light' ? t('dark') : t('light') }, [icon(theme.value === 'light' ? 'moon' : 'sun')]),
                    ]),
                    tree.value ? h('button', {
                        class: 'inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        type: 'button',
                        onClick: restart,
                        'aria-label': t('newInquiry'),
                    }, [icon('home', 'size-4'), t('fresh')]) : null,
                ]),
                h('div', { class: 'settings-panel mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-2.5' }, [
                    h('label', { class: 'flex min-w-0 flex-1 items-center gap-2 text-xs text-gray-700' }, [t('voice'), h('select', { class: 'app-control min-w-0 flex-1 rounded-lg border bg-white px-2 py-1.5 text-xs', value: selectedVoice.value, onChange: (event) => setVoice(event.target.value) }, [h('option', { value: '' }, language.value === 'ar' ? 'تلقائي' : 'Auto'), ...voices.value.map((voice) => h('option', { value: voice.voiceURI, key: voice.voiceURI }, `${voice.name} (${voice.lang})`))])]),
                    h('button', { class: 'app-control rounded-lg border px-2.5 py-1.5 text-xs font-medium', type: 'button', onClick: testVoice }, t('testVoice')),
                    h('label', { class: 'flex items-center gap-1.5 text-xs text-gray-700' }, [language.value === 'ar' ? 'السرعة' : 'Speed', h('input', { class: 'w-20 accent-blue-700', type: 'range', min: '0.65', max: '1.3', step: '0.05', value: speechRate.value, onInput: (event) => setSpeechRate(event.target.value), 'aria-label': language.value === 'ar' ? 'سرعة القراءة' : 'Speech rate' }), h('span', { class: 'w-8 tabular-nums' }, `${Number(speechRate.value).toFixed(2)}${t('rateUnit')}`)]),
                    h('label', { class: 'flex items-center gap-1.5 text-xs text-gray-700' }, [h('input', { type: 'checkbox', checked: autoRead.value, onChange: (event) => setAutoRead(event.target.checked) }), t('autoRead')]),
                    h('p', { class: 'w-full text-[11px] leading-4 text-gray-500' }, voices.value.length ? t('voicePrivacy') : t('voiceNotInstalled')),
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
                                h('div', { class: 'mb-3 flex items-center justify-between gap-4' }, [
                                    h('p', { class: 'text-sm text-gray-500' }, t('step') + ' ' + (history.value.length + 1)),
                                    history.value.length > 0 ? h('button', {
                                        class: 'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-blue-800 transition-all hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                                        type: 'button',
                                        onClick: goBack,
                                    }, [icon('back', 'size-4'), t('back')]) : null,
                                ]),
                                h('h2', { class: 'current-question mb-6 text-2xl font-semibold leading-10 text-gray-800' }, currentStep.value.question),
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
                                        h('section', { class: 'rounded-2xl border border-green-200 bg-green-100 p-4 sm:p-5' }, [
                                            h('h3', { class: 'mb-2 flex items-center gap-2 font-bold text-green-950' }, [
                                                icon('chat', 'size-5'), t('customerScript'),
                                            ]),
                                            h('p', { class: 'leading-7 text-green-950' }, currentStep.value.customer_script || '—'),
                                        ]),
                                        h('button', { class: 'app-control inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3', type: 'button', onClick: readResult }, [icon('speak'), t('readResult')]),
                                        h('button', {
                                            class: 'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-4 py-3 font-semibold text-white transition-all hover:bg-green-900 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2',
                                            type: 'button',
                                            onClick: copyCustomerScript,
                                        }, [icon('copy', 'size-5'), t('copy')]),
                                        h('button', {
                                            class: 'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500',
                                            type: 'button',
                                            onClick: restart,
                                        }, [icon('home', 'size-5'), t('newInquiry')]),
                                    ])
                                    : h('div', { class: 'grid gap-3' }, currentStep.value.options.map((option, index) =>
                                        h('button', {
                                            class: 'option-button group flex min-h-16 w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-start font-medium text-gray-800 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                            type: 'button',
                                            key: `${currentStepId.value}-${index}`,
                                            onClick: () => choose(option),
                                        }, [
                                            h('span', { class: 'inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-all group-hover:bg-blue-100' }, [icon(optionIcon(option.label))]),
                                            h('span', { class: 'flex-1 leading-6' }, option.label || t('choose')),
                                            h('span', { class: 'text-blue-700 transition-transform group-hover:-translate-x-1' }, [icon('arrow', 'size-5')]),
                                        ]),
                                    )),
                            ]) }),
                tree.value?.operations_guide ? h('details', { class: 'operations-guide mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4' }, [
                    h('summary', { class: 'cursor-pointer font-semibold text-blue-900' }, [icon('ticket', 'inline size-5'), h('span', { class: 'ms-2' }, t('operations'))]),
                    h('div', { class: 'mt-4 space-y-4 leading-7 text-gray-700' }, [
                        h('section', [h('h3', { class: 'flex items-center gap-2 font-bold text-gray-900' }, [icon('search', 'size-4'), t('searchTitle')]), h('p', tree.value.operations_guide.search)]),
                        h('section', [h('h3', { class: 'flex items-center gap-2 font-bold text-gray-900' }, [icon('ticket', 'size-4'), t('recordTitle')]), h('p', tree.value.operations_guide.record)]),
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
                h('p', { class: 'mt-6 text-xs text-gray-400' }, t('footer')),
            ]),
            h('div', { class: 'fixed bottom-5 left-5 z-30 flex flex-col items-center gap-2' }, [
                voiceStatus.value ? h('p', { class: 'max-w-64 rounded-xl bg-white/95 px-3 py-2 text-center text-xs font-medium text-slate-700 shadow-lg ring-1 ring-slate-200', role: 'status', 'aria-live': 'polite' }, voiceStatus.value) : null,
                (isSpeaking.value || isListening.value) ? h('button', { class: 'inline-flex items-center gap-2 rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white shadow-lg', type: 'button', onClick: stopAll }, [icon('stop', 'size-4'), isListening.value ? t('stopMic') : t('stopAudio')]) : null,
                h('button', {
                    class: `inline-flex size-16 items-center justify-center rounded-full text-white shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95 ${isListening.value ? 'animate-pulse bg-rose-600' : 'bg-blue-700 hover:bg-blue-800'}`,
                    type: 'button',
                    onClick: startListening,
                    'aria-label': isListening.value ? t('stopMic') : t('startMic'),
                    'aria-pressed': isListening.value ? 'true' : 'false',
                    title: isListening.value ? t('stopMic') : t('startMic'),
                }, [h('svg', { class: 'size-7', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, [
                    h('rect', { x: '9', y: '2', width: '6', height: '12', rx: '3' }),
                    h('path', { d: 'M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8' }),
                ])]),
            ]),
        ]);
    },
};

createApp(App).mount('#app');
