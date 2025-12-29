import { useEffect, useState } from 'react';
import moment from 'moment-jalaali';

const sleep = delay => new Promise(resolve => { setTimeout(() => { resolve(); }, delay); });

const viewName = 'jalali-month-view';

export {viewName as jalaliMonthViewName};

let calendarApi = null;
let lastView = null;
let visibleRange = {};

function getMonthRange(date = new Date()) {
	const m = moment(date).startOf('jMonth');
	const monthStart = m.toDate();
	const monthEnd = m.endOf('jMonth').toDate();

	// set start to saturday
	const start = monthStart.getDay() === 6 ? monthStart : moment(monthStart).day(-1).toDate();
	const end = moment(start).add(42, 'day').toDate();

	const monthName = monthStart.toLocaleDateString('fa', { month: 'short' });
	const year = monthStart.toLocaleDateString('fa', { year: 'numeric' });
	const title = `${year} ${monthName}`;

	return { start, end, monthStart, monthEnd, monthName, year, title };
}

function setVisibleRange(value) {
	visibleRange = value;
	if (!value) {
		const date = calendarApi?.getDate();
		visibleRange = getMonthRange(date);
	}
	calendarApi?.setOption('visibleRange', visibleRange);

	if (calendarApi?.view.type === viewName) {
		correctDaysStyles();
	}
};

function unsetVisibleRange() {
	calendarApi?.setOption('visibleRange', undefined);
};

function nextMonth() {
	const { monthStart } = visibleRange;
	const date = moment(monthStart).add(1, 'jMonth');
	setVisibleRange(getMonthRange(date));

	calendarApi.gotoDate(visibleRange.monthStart);
};

function prevMonth() {
	const { monthStart } = visibleRange;
	const date = moment(monthStart).subtract(1, 'jMonth');
	setVisibleRange(getMonthRange(date));

	calendarApi.gotoDate(visibleRange.monthStart);
};

function thisMonth() {

	// if (calendarApi?.view?.type !== viewName) {
	// 	today();
	// 	return;
	// }
	setVisibleRange(getMonthRange());

	calendarApi.gotoDate(new Date());
};

async function correctDaysStyles() {
	const calendarEl = calendarApi.el;

	await sleep(0); // wait for dayElements load (on view-change)

	const dayElements = calendarEl.querySelectorAll('.fc-daygrid-day');
	const dayNumberElements = calendarEl.querySelectorAll('.fc-daygrid-day-number');

	const { monthStart, monthEnd } = visibleRange;

	dayElements.forEach(dayEl => {
		dayEl.classList.remove('fc-day-other');
		const date = new Date(dayEl.getAttribute('data-date'));
		if (date < monthStart || date > monthEnd) {
			dayEl.classList.add('fc-day-other');
		}
	});

	dayNumberElements.forEach(el => {
		el.classList.remove('fc-daygrid-month-start');
	});
};

function setNavigationMethods() {
	const prev = calendarApi.prev.bind(calendarApi);
	const next = calendarApi.next.bind(calendarApi);
	const today = calendarApi.today.bind(calendarApi);
	// calendarApi.prev = () => { prevMonth(prev); };
	// calendarApi.next = () => { nextMonth(next); };
	// calendarApi.today = () => { thisMonth(today); };
	calendarApi.next = () => {
		if (calendarApi.view.type === viewName) {
			nextMonth();
		}
		else {
			next();
		}
	};

	calendarApi.prev = () => {
		if (calendarApi.view.type === viewName) {
			prevMonth();
		}
		else {
			prev();
		}
	};

	calendarApi.today = () => {
		if (calendarApi.view.type === viewName) {
			thisMonth();
		}
		else {
			today();
		}
	};
};

function setDatesSet() {
	const datesSet = calendarApi.getOption('datesSet');

	calendarApi.setOption('datesSet', (arg) => {
		const currentView = arg.view.type;
		const isViewChanged = lastView !== currentView;

		if (isViewChanged && currentView === viewName) {
			setVisibleRange();
		}
		else {
			datesSet?.(arg);
			if (isViewChanged) {
				unsetVisibleRange();
			}
		}
		lastView = currentView;
	});
};

export default function useJalaliMonthView(calendarRef) {
	const [refHasSet, setRefHasSet] = useState(false);
	if (!refHasSet && calendarRef.current) {
		setRefHasSet(true);
	}

	useEffect(() => {
		if (!calendarRef.current) return;

		calendarApi = calendarRef.current?.getApi();

		const currentView = calendarApi?.view.type;
		if (currentView === viewName) {
			setVisibleRange();
		}

		setNavigationMethods();
		setDatesSet();

		lastView = currentView;
		
	// TODO: find a better way to prevent 'calendarRef.current' to be null inside of 'useEffect' (instead of passing 'calendarRef.current' into dependencies array)
	}, [calendarRef.current]);

	return {
		viewName,
		type: 'dayGrid',
		buttonText: 'ماه',
		titleFormat: () => visibleRange.title,
		monthStartFormat: { day: 'numeric' },
		// visibleRange,
		// viewDidMount: async () => {}
	};

}