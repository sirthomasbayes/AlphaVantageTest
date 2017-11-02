let initialized = false,
	eventName = 'api_timeout_event';

/*
	exported modules:
		ApiTimeoutHandler - hacky approach to getting retry timeout behavior
			* sendTimeoutEvent(cb : () => Promise<{}>) - signals to handler that an API call failed,
				and to retry the call view the callback cb.
*/
interface IApiTimeoutHandler {
	sendTimeoutEvent(callback: () => Promise<{}>) : void;
}

class ApiTimeoutHandler {
	constructor() {
		if (!initialized) {
			window.addEventListener(eventName, (e: CustomEvent) => { e.detail(); });
		}
	}

	sendTimeoutEvent(callback: () => Promise<{}>) : void {
		setTimeout(() => {
			window.dispatchEvent(new CustomEvent(eventName, { detail: callback }));
		}, 1500); // could probably do something a little more clever
				  // than just dispatching event every 1500ms e.g. exponential backoff.
	}
}

export { IApiTimeoutHandler, ApiTimeoutHandler };