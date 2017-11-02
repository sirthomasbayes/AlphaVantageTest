interface IApiValue {
	metadata: IMetadata;
	timeSeriesData: Array<ITimeSeriesData>;
}

interface IMetadata {
	information:string;
	symbol: string;
	lastRefreshed: Date;
	interval: string;
	outputSize: string;
	timezone: string;	
}

interface ITimeSeriesData {
	datetime:Date;
	open:number;
	high:number;
	low:number;
	volume:number;
}

class ApiError extends Error {
    constructor(m: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

class TimeoutError extends Error {
    constructor(m: string) {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}

interface IApiProvider {
	getDataAsync() : Promise<IApiValue>;
}

export {
	IApiValue, ITimeSeriesData, IApiProvider, IMetadata, TimeoutError, ApiError
}