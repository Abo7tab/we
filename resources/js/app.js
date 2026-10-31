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
    return 'question';
}

function normalizeArabic(value = '') {
    return value
        .normalize('NFKC')
        .toLocaleLowerCase('ar-EG')
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[أإآٱ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim()
        .replace(/\s+/g, ' ');
}

const App = {
    setup() {
        const tree = ref(null);
        const currentStepId = ref(null);
        const history = ref([]);
        const loading = ref(true);
        const loadError = ref('');
        const notice = ref('');
        const isListening = ref(false);
        const voiceStatus = ref('');
        let activeRecognition = null;

        const currentStep = computed(() => {
            if (!tree.value || !currentStepId.value) return null;
            return tree.value[currentStepId.value] ?? null;
        });
        const isFinished = computed(() => currentStep.value?.options?.length === 0);

        function speakCurrentStep() {
            if (!('speechSynthesis' in window) || !currentStep.value) return;

            const script = isFinished.value
                ? [currentStep.value.question, currentStep.value.action, currentStep.value.sla, currentStep.value.customer_script]
                    .filter(Boolean).join('. ')
                : currentStep.value.question;
            if (!script) return;

            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(script);
            utterance.lang = 'ar-EG';
            utterance.rate = 0.95;
            const arabicVoice = window.speechSynthesis.getVoices()
                .find((voice) => voice.lang?.toLowerCase().startsWith('ar'));
            if (arabicVoice) utterance.voice = arabicVoice;
            window.speechSynthesis.speak(utterance);
        }

        function afterStepChange() {
            voiceStatus.value = '';
            nextTick(() => {
                speakCurrentStep();
            });
        }

        function findSpokenOption(transcript) {
            const spoken = normalizeArabic(transcript);
            if (!spoken) return null;

            const buttons = [...document.querySelectorAll('.option-button')];
            const exactMatches = buttons.filter((button) => normalizeArabic(button.innerText) === spoken);
            if (exactMatches.length === 1) return exactMatches[0];
            if (exactMatches.length > 1) return null;

            const words = spoken.split(' ').filter((word) => word.length > 1);
            const matches = buttons.filter((button) => {
                const label = normalizeArabic(button.innerText);
                return label && (spoken.includes(label) || label.includes(spoken)
                    || words.some((word) => label.split(' ').includes(word)));
            });
            return matches.length === 1 ? matches[0] : null;
        }

        function startListening() {
            const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!Recognition) {
                voiceStatus.value = 'التعرف على الصوت غير مدعوم في هذا المتصفح. استخدم الأزرار للاختيار.';
                return;
            }
            if (isListening.value) {
                activeRecognition?.stop();
                return;
            }

            const recognition = new Recognition();
            activeRecognition = recognition;
            recognition.lang = 'ar-EG';
            recognition.interimResults = false;
            recognition.maxAlternatives = 3;
            recognition.continuous = false;

            recognition.onstart = () => {
                isListening.value = true;
                voiceStatus.value = 'استمع الآن… قل اختيارًا ظاهرًا على الشاشة.';
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
                    voiceStatus.value = 'تم التعرف على الاختيار.';
                    uniqueMatches[0].click();
                } else {
                    voiceStatus.value = 'لم يتضح الاختيار. قل نص الزر بوضوح أو اضغط عليه.';
                }
            };
            recognition.onerror = (event) => {
                const messages = {
                    'not-allowed': 'اسمح للمتصفح باستخدام الميكروفون، ثم حاول مرة أخرى.',
                    'service-not-allowed': 'خدمة التعرف على الصوت غير متاحة. استخدم الأزرار للاختيار.',
                    'no-speech': 'لم أسمع صوتًا. اضغط الميكروفون وحاول مرة أخرى.',
                    'audio-capture': 'تعذر الوصول إلى الميكروفون.',
                };
                voiceStatus.value = messages[event.error] || 'تعذر التعرف على الصوت. يمكنك الاختيار بالضغط.';
            };
            recognition.onend = () => {
                isListening.value = false;
                activeRecognition = null;
            };

            try {
                recognition.start();
            } catch {
                isListening.value = false;
                activeRecognition = null;
                voiceStatus.value = 'تعذر تشغيل الميكروفون. حاول مرة أخرى أو اضغط على الاختيار.';
            }
        }

        async function loadTree() {
            loading.value = true;
            loadError.value = '';

            try {
                const response = await fetch(`/trees/${DEFAULT_TREE}`, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                if (!response.ok) throw new Error('تعذر تحميل شجرة القرارات.');

                const data = await response.json();
                const inferredStart = Object.keys(data ?? {}).find((key) => key !== 'start');
                const startId = typeof data?.start === 'string' ? data.start : inferredStart;
                const validStart = typeof startId === 'string'
                    && Object.hasOwn(data, startId)
                    && typeof data[startId]?.question === 'string'
                    && Array.isArray(data[startId]?.options);

                if (!validStart) throw new Error('ملف شجرة القرارات غير مكتمل.');

                tree.value = { ...data, start: startId };
                currentStepId.value = startId;
                history.value = [];
                notice.value = '';
            } catch (error) {
                loadError.value = error instanceof Error ? error.message : 'حدث خطأ أثناء التحميل.';
            } finally {
                loading.value = false;
            }
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

        onMounted(loadTree);
        onBeforeUnmount(() => {
            activeRecognition?.abort();
            window.speechSynthesis?.cancel();
        });

        return () => h('main', {
                class: 'relative isolate min-h-screen w-full overflow-x-clip bg-slate-50 px-4 py-6 pb-28 text-gray-800 sm:px-6 sm:py-10',
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
                class: 'relative z-10 mx-auto max-w-lg rounded-3xl bg-white p-5 shadow-2xl shadow-slate-400/20 ring-1 ring-slate-900/5 sm:p-8',
                'aria-busy': loading.value ? 'true' : 'false',
            }, [
                h('header', { class: 'mb-6 flex items-start justify-between gap-4' }, [
                    h('div', [
                        h('p', { class: 'mb-2 text-sm font-semibold text-blue-700' }, 'مساعد الدعم الفني'),
                        h('h1', { class: 'text-2xl font-bold text-gray-900' }, 'دليل الدعم الفني'),
                    ]),
                    tree.value ? h('button', {
                        class: 'inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        type: 'button',
                        onClick: restart,
                        'aria-label': 'إعادة بدء المسار',
                    }, [icon('home', 'size-4'), 'جديد']) : null,
                ]),
                loading.value
                    ? h('p', { class: 'py-8 text-center text-gray-500', role: 'status' }, 'جاري تحميل شجرة القرارات…')
                    : loadError.value
                        ? h('div', { class: 'space-y-4', role: 'alert' }, [
                            h('p', { class: 'text-red-700' }, loadError.value),
                            h('button', {
                                class: 'w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                type: 'button',
                                onClick: loadTree,
                            }, 'إعادة المحاولة'),
                        ])
                        : !currentStep.value
                            ? h('p', { class: 'text-red-700', role: 'alert' }, 'الخطوة الحالية غير موجودة في الشجرة.')
                            : h(Transition, { name: 'step-fade', mode: 'out-in' }, { default: () => h('div', { key: currentStepId.value }, [
                                h('div', { class: 'mb-3 flex items-center justify-between gap-4' }, [
                                    h('p', { class: 'text-sm text-gray-500' }, `الخطوة ${history.value.length + 1}`),
                                    history.value.length > 0 ? h('button', {
                                        class: 'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-blue-800 transition-all hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
                                        type: 'button',
                                        onClick: goBack,
                                    }, [icon('back', 'size-4'), 'رجوع خطوة']) : null,
                                ]),
                                h('h2', { class: 'current-question mb-6 text-2xl font-semibold leading-10 text-gray-800' }, currentStep.value.question),
                                isFinished.value
                                    ? h('div', { class: 'space-y-4', role: 'status' }, [
                                        h('div', { class: 'inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white' }, [
                                            icon('clock', 'size-5'),
                                            h('span', 'المهلة: '),
                                            h('span', currentStep.value.sla || 'غير محددة'),
                                        ]),
                                        h('section', { class: 'rounded-2xl border border-orange-200 bg-orange-100 p-4 sm:p-5' }, [
                                            h('h3', { class: 'mb-2 flex items-center gap-2 font-bold text-orange-950' }, [
                                                icon('alert', 'size-5'), 'إجراء الموظف',
                                            ]),
                                            h('p', { class: 'leading-7 text-orange-950' }, currentStep.value.action || 'لا يوجد إجراء محدد.'),
                                        ]),
                                        h('section', { class: 'rounded-2xl border border-green-200 bg-green-100 p-4 sm:p-5' }, [
                                            h('h3', { class: 'mb-2 flex items-center gap-2 font-bold text-green-950' }, [
                                                icon('chat', 'size-5'), 'نص تقوله للعميل',
                                            ]),
                                            h('p', { class: 'leading-7 text-green-950' }, currentStep.value.customer_script || 'لا يوجد نص محدد.'),
                                        ]),
                                        h('button', {
                                            class: 'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 px-4 py-3 font-semibold text-white transition-all hover:bg-green-900 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2',
                                            type: 'button',
                                            onClick: copyCustomerScript,
                                        }, [icon('copy', 'size-5'), 'نسخ نص العميل']),
                                        h('button', {
                                            class: 'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500',
                                            type: 'button',
                                            onClick: restart,
                                        }, [icon('home', 'size-5'), 'بدء استعلام جديد']),
                                    ])
                                    : h('div', { class: 'grid gap-3' }, currentStep.value.options.map((option, index) =>
                                        h('button', {
                                            class: 'option-button group flex min-h-16 w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-right font-medium text-gray-800 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                            type: 'button',
                                            key: `${currentStepId.value}-${index}`,
                                            onClick: () => choose(option),
                                        }, [
                                            h('span', { class: 'inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition-all group-hover:bg-blue-100' }, [icon(optionIcon(option.label))]),
                                            h('span', { class: 'flex-1 leading-6' }, option.label || 'اختيار'),
                                            h('span', { class: 'text-blue-700 transition-transform group-hover:-translate-x-1' }, [icon('arrow', 'size-5')]),
                                        ]),
                                    )),
                            ]) }),
                notice.value ? h('p', {
                    class: 'mt-4 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700',
                    role: 'status',
                    'aria-live': 'polite',
                }, notice.value) : null,
                h('p', { class: 'mt-6 text-xs text-gray-400' }, 'تُحمّل الشجرة من Laravel، وتتم خطوات المسار داخل المتصفح.'),
            ]),
            h('div', { class: 'fixed bottom-5 left-5 z-30 flex flex-col items-center gap-2' }, [
                voiceStatus.value ? h('p', { class: 'max-w-64 rounded-xl bg-white/95 px-3 py-2 text-center text-xs font-medium text-slate-700 shadow-lg ring-1 ring-slate-200', role: 'status', 'aria-live': 'polite' }, voiceStatus.value) : null,
                h('button', {
                    class: `inline-flex size-16 items-center justify-center rounded-full text-white shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 active:scale-95 ${isListening.value ? 'animate-pulse bg-rose-600' : 'bg-blue-700 hover:bg-blue-800'}`,
                    type: 'button',
                    onClick: startListening,
                    'aria-label': isListening.value ? 'إيقاف الاستماع' : 'اختيار صوتي',
                    'aria-pressed': isListening.value ? 'true' : 'false',
                    title: isListening.value ? 'جاري الاستماع' : 'اضغط وقل اختيارًا ظاهرًا',
                }, [h('svg', { class: 'size-7', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, [
                    h('rect', { x: '9', y: '2', width: '6', height: '12', rx: '3' }),
                    h('path', { d: 'M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8' }),
                ])]),
            ]),
        ]);
    },
};

createApp(App).mount('#app');
