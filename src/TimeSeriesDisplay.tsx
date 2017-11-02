import * as React from 'react';
import { TimeSeriesMetadataTable, TimeSeriesDataTable } from './TimeSeriesDisplayComponents'; 
import { IApiTimeoutHandler } from './util/ApiTimeoutHandler'
import { ITimeSeriesData, IApiProvider, IMetadata, TimeoutError, ApiError } from './api_provider/IApiProvider';

/*
	exported components:

	<TimeSeriesDisplay apiProvider={ IApiProvider }
					   timeoutInterval={ number }
					   maxRetry={ number } /> 
    	displays TimeSeries data pulled from IApiProvider given by apiProvider.
    	if call times out (after timeoutInterval milliseconds), it will be retried maxRetry number of times before
    	hard failing.

    	results are paged (right now hardcoded to pages of size 10, but can easily
    	be injected as a property)
*/

interface IProps {
	apiProvider: IApiProvider;
	apiTimeoutHandler: IApiTimeoutHandler;

	timeoutInterval: number;
	maxRetry: number;
}

interface IState {
	currentPageNumber: number;
	currentPageItems: Array<ITimeSeriesData>;	
	lastPageNumber: number;
	
	fetchingData: boolean;	// indicates whether we are fetching data from external API
							// if so, used to disable "Fetch Data" button.
	
	statusMessage:string;
	retryCount: number;
}

export default class TimeSeriesDisplay extends React.Component<IProps, IState> {	
	private currentItems : Array<ITimeSeriesData>;
	private currentMetadata: IMetadata;
	private pageSize = 10;

	constructor(props: any) {
		super(props);
		this.state = {
			currentPageNumber: 0,
			currentPageItems: [],
			lastPageNumber: 0,

			fetchingData: false,

			statusMessage: '',
			retryCount: 0
		};

		this.getDataAsync = this.getDataAsync.bind(this);
	}

	// modifies internal state of TimeSeriesTable
	// fetches elements from API and 
	private async getDataAsync() : Promise<{}> {
		let apiProvider = this.props.apiProvider;

		this.setState({ fetchingData: true });

		try {  
			let items = await apiProvider.getDataAsync(this.props.timeoutInterval); 
			this.currentItems = items.timeSeriesData;
			this.currentMetadata = items.metadata;

			this.displayPage(1);	
		}
		catch (e) {  
			if (e instanceof TimeoutError) {
				let retryCount = this.state.retryCount + 1,
					maxRetriesReached = retryCount >= this.props.maxRetry,
					statusMessage = !maxRetriesReached ?
						`Request for time series data has timed out. Retry attempt ${retryCount}.` :
						`External server is unavailable. Please try again later.`;

				this.setState({ 
					statusMessage: statusMessage,
					retryCount: !maxRetriesReached ? retryCount : 0
				});

				if (!maxRetriesReached) {
					this.props.apiTimeoutHandler.sendTimeoutEvent(this.getDataAsync); 
					return {};
				}
			}

			if (e instanceof ApiError) {
				this.setState({  statusMessage: `An error occurred while requesting time series data: ${e.message}` });
			}
		}

		this.setState({ fetchingData: false });
		return {};
	}

	// displays items on page pageNumber by setting
	// state variables relevant to paging 
	private displayPage(pageNumber:number) {
		let listSize = this.currentItems.length,
			pageSize = this.pageSize,
			skip = pageSize * (pageNumber - 1);

		this.setState({ 
			currentPageNumber: pageNumber,
			lastPageNumber: listSize / pageSize + (listSize % pageSize > 0 ? 1 : 0),
			currentPageItems: this.currentItems.slice(skip, skip + pageSize),
			statusMessage: "",
			retryCount: 0
		});
	}

	private renderPageDropdown() {
		if (!this.currentItems) return;

		let numPages = this.state.lastPageNumber,
			range = [];
		for (let i = 1; i <= numPages; i++) range.push(<option key={`page_option_${i}`} value={i}>{i}</option>);

		return (
			<select 
         		value={this.state.currentPageNumber.toString()}
         		onChange={(e) => this.displayPage(Number(e.target.value))} >
         		{ range }
         	</select>);
	}

	render() {
		
		return (
			<div key={this.state.currentPageNumber}>
				<button disabled={this.state.fetchingData} onClick={async () => await this.getDataAsync()}>Fetch Data</button>

				<p style={{'color':'red'}}>{this.state.statusMessage}</p>

				{this.renderPageDropdown()}
				
				<TimeSeriesMetadataTable metadata={this.currentMetadata} />
				<br/>
				<TimeSeriesDataTable dataPoints={this.state.currentPageItems} />
			</div>
		);
	}
}