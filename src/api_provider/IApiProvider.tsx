/*
	exported interfaces:

	IApiProvider - represents provider object that will make API call and either
				   return parsed data (type IApiValue) on success,
				   or throw a relevant Error.

	IApiValue - represents parsed data structure returned from API
		* metadata : IMetadata - represents metadata returned from API
		* timeSeriesData : Array<ITimeSeriesData> - represents time series data returned from API

	IMetadata - represents metadata returned from API

	ITimeSeriesData - represents a single data point in time series returned from API
*/

/*
	exported Errors:

	ApiError - represents an error reported by the API (statusCode >= 400)

	TimeoutError - represents an error due to timeout or connection failure.
*/

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