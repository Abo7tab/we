import './bootstrap';
import { computed, createApp, h, onMounted, ref } from 'vue';

const MAX_STEPS_PER_CALL = 100;

const App = {
    setup() {
        const tree = ref(null);
        const currentStepId = ref(null);
        const history = ref([]);
        const loading = ref(true);
        const loadError = ref('');
        const notice = ref('');

        const currentStep = computed(() => {
            if (!tree.value || !currentStepId.value) return null;
            return tree.value[currentStepId.value] ?? null;
        });
        const isFinished = computed(() => currentStep.value?.options?.length === 0);

        async function loadTree() {
            loading.value = true;
            loadError.value = '';

            try {
                const response = await fetch('/trees/sample', {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                if (!response.ok) throw new Error('تعذر تحميل شجرة القرارات.');

                const data = await response.json();
                const validStart = typeof data?.start === 'string'
                    && Object.hasOwn(data, data.start)
                    && typeof data[data.start]?.question === 'string'
                    && Array.isArray(data[data.start]?.options);

                if (!validStart) throw new Error('ملف شجرة القرارات غير مكتمل.');

                tree.value = data;
                currentStepId.value = data.start;
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
        }

        function goBack() {
            if (history.value.length === 0) return;
            currentStepId.value = history.value.at(-1);
            history.value = history.value.slice(0, -1);
            notice.value = '';
        }

        function restart() {
            if (!tree.value) return;
            currentStepId.value = tree.value.start;
            history.value = [];
            notice.value = '';
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

        return () => h('main', {
            class: 'min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6',
        }, [
            h('section', {
                class: 'mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8',
                'aria-busy': loading.value ? 'true' : 'false',
            }, [
                h('header', { class: 'mb-6 flex items-start justify-between gap-4' }, [
                    h('div', [
                        h('p', { class: 'mb-2 text-sm font-semibold text-indigo-600' }, 'مساعد الدعم الفني'),
                        h('h1', { class: 'text-2xl font-bold' }, 'شجرة قرارات تجريبية'),
                    ]),
                    tree.value ? h('button', {
                        class: 'shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                        type: 'button',
                        onClick: restart,
                        'aria-label': 'إعادة بدء المسار',
                    }, 'إعادة البدء') : null,
                ]),
                loading.value
                    ? h('p', { class: 'py-8 text-center text-slate-500', role: 'status' }, 'جاري تحميل شجرة القرارات…')
                    : loadError.value
                        ? h('div', { class: 'space-y-4', role: 'alert' }, [
                            h('p', { class: 'text-red-700' }, loadError.value),
                            h('button', {
                                class: 'w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                                type: 'button',
                                onClick: loadTree,
                            }, 'إعادة المحاولة'),
                        ])
                        : !currentStep.value
                            ? h('p', { class: 'text-red-700', role: 'alert' }, 'الخطوة الحالية غير موجودة في الشجرة.')
                            : h('div', [
                                h('div', { class: 'mb-3 flex items-center justify-between gap-4' }, [
                                    h('p', { class: 'text-sm text-slate-500' }, `الخطوة ${history.value.length + 1}`),
                                    history.value.length > 0 ? h('button', {
                                        class: 'rounded-lg px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                                        type: 'button',
                                        onClick: goBack,
                                    }, 'رجوع') : null,
                                ]),
                                h('h2', { class: 'mb-6 text-lg font-semibold leading-8' }, currentStep.value.question),
                                isFinished.value
                                    ? h('div', { class: 'space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5', role: 'status' }, [
                                        h('div', [
                                            h('h3', { class: 'mb-1 font-bold text-emerald-900' }, 'الإجراء المطلوب'),
                                            h('p', { class: 'leading-7 text-emerald-950' }, currentStep.value.action || 'لا يوجد إجراء محدد.'),
                                        ]),
                                        h('div', [
                                            h('h3', { class: 'mb-1 font-bold text-emerald-900' }, 'مهلة الحل'),
                                            h('p', { class: 'text-emerald-950' }, currentStep.value.sla || 'غير محددة'),
                                        ]),
                                        h('div', [
                                            h('h3', { class: 'mb-1 font-bold text-emerald-900' }, 'نص العميل'),
                                            h('p', { class: 'leading-7 text-emerald-950' }, currentStep.value.customer_script || 'لا يوجد نص محدد.'),
                                        ]),
                                        h('button', {
                                            class: 'w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2',
                                            type: 'button',
                                            onClick: copyCustomerScript,
                                        }, 'نسخ نص العميل'),
                                        h('button', {
                                            class: 'w-full rounded-xl border border-emerald-300 px-4 py-3 font-semibold text-emerald-900 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600',
                                            type: 'button',
                                            onClick: restart,
                                        }, 'بدء مسار جديد'),
                                    ])
                                    : h('div', { class: 'grid gap-3' }, currentStep.value.options.map((option, index) =>
                                        h('button', {
                                            class: 'w-full rounded-xl border border-slate-200 px-4 py-3 text-right font-medium transition hover:border-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                                            type: 'button',
                                            key: `${currentStepId.value}-${index}`,
                                            onClick: () => choose(option),
                                        }, option.label || 'اختيار'),
                                    )),
                            ]),
                notice.value ? h('p', {
                    class: 'mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700',
                    role: 'status',
                    'aria-live': 'polite',
                }, notice.value) : null,
                h('p', { class: 'mt-6 text-xs text-slate-400' }, 'تُحمّل الشجرة من Laravel، وتتم خطوات المسار داخل المتصفح.'),
            ]),
        ]);
    },
};

createApp(App).mount('#app');
