import { IApiValue, IMetadata, ITimeSeriesData, IApiProvider, TimeoutError, ApiError } from './IApiProvider';

/*
	exported classes:

	AlphaVantageApiProvider - implementation of IApiProvider that sources data
							  from alphavantage.co
*/

export default class AlphaVantageApiProvider implements IApiProvider {
	private url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=demo";
	
	private metadataKeyFunctionMap = {
			"1. Information": (elem:string) => elem,
			"2. Symbol": (elem:string) => elem,
			"3. Last Refreshed": (elem:string) => new Date(elem),
			"4. Interval": (elem:string) => elem,
			"5. Output Size": (elem:string) => elem,
			"6. Time Zone": (elem:string) => elem
		};

	private getMetadata(metadata:any) : IMetadata {
		let data = {};

		for (let key in metadata) {
			let metadataKey = key.split('.')[1].trim().toLowerCase(),
				metadataValue = metadata[key];

			data[metadataKey] = this.metadataKeyFunctionMap[key](metadataValue);
		}

		return {
			information: data["information"],
			symbol: data["symbol"],
			lastRefreshed: data["last refreshed"],
			interval: data["interval"],
			outputSize: data["output size"],
			timezone: data["time zone"]
		};
	}



	private getTimeSeriesItemData(timeSeriesData:any) : Array<ITimeSeriesData> {
		let data = [];

		for (let key in timeSeriesData) {
			let unparsedDataPoint = timeSeriesData[key],
				dataPoint = {};

			dataPoint['datetime'] = new Date(key);
			for (let innerKey in unparsedDataPoint) {
				let parsedKey = innerKey.split('.')[1].trim(),
					parsedValue = Number(unparsedDataPoint[innerKey]);

				dataPoint[parsedKey] = parsedValue;
			}

			data.push({
				datetime: dataPoint["datetime"],
				open: dataPoint["open"],
				high: dataPoint["high"],
				low: dataPoint["low"],
				volume: dataPoint["volume"]
			});
		}

		return data;
	}

	// hacky way of handling timeouts via fetch API
	private timeout (value:number, message:string) : Promise<Response> {
    	return new Promise((resolve, reject) => {
        	setTimeout(() => {
            	reject(new TimeoutError(message));
        	}, value);
    	});
	}

	async getDataAsync(timeoutInterval: number) : Promise<IApiValue> {
		let response = await Promise.race([this.timeout(timeoutInterval, 'Request has timed out.'), fetch(this.url)]);

		if (!response.ok) throw new ApiError(response.statusText);
			
		let unparsedData = await response.json(),
			returnData = {};

		for (let key in unparsedData) {
			if (key === "Meta Data") returnData["metadata"] = this.getMetadata(unparsedData[key]);
			else returnData["timeSeriesData"] = this.getTimeSeriesItemData(unparsedData[key]);
		}

		return {
			metadata: returnData["metadata"],
			timeSeriesData: returnData["timeSeriesData"]
		};
	}
}