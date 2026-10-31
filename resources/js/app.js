import './bootstrap';
import { createApp, h } from 'vue';
import sampleTree from '../../storage/app/data/sample.json';

const App = {
    setup() {
        return () => h('main', { class: 'min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6' }, [
            h('section', { class: 'mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8' }, [
                h('p', { class: 'mb-2 text-sm font-semibold text-indigo-600' }, 'مساعد الدعم الفني'),
                h('h1', { class: 'mb-3 text-2xl font-bold' }, 'شجرة قرارات تجريبية'),
                h('p', { class: 'mb-6 leading-7 text-slate-600' }, sampleTree.connection_check.question),
                h('div', { class: 'grid gap-3' }, sampleTree.connection_check.options.map((option) =>
                    h('button', {
                        class: 'rounded-xl border border-slate-200 px-4 py-3 text-right font-medium transition hover:border-indigo-500 hover:bg-indigo-50',
                        type: 'button',
                    }, option.label),
                )),
                h('p', { class: 'mt-6 text-xs text-slate-400' }, 'بيانات العرض التجريبي محلية داخل ملف JSON.'),
            ]),
        ]);
    },
};

createApp(App).mount('#app');
